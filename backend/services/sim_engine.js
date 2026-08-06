const { db } = require('../config/database');
const { predictETA } = require('./ai_service');

const R_METERS = 6371000;
const LORA_RANGE_METERS = 800.0;

function haversineDistance(lat1, lon1, lat2, lon2) {
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R_METERS * c;
}

class SimulationEngine {
    constructor(io) {
        this.io = io;
        this.running = false;
        this.blackoutActive = false;
        this.intervalId = null;
    }

    start() {
        if (!this.running) {
            this.running = true;
            this.intervalId = setInterval(() => this._tick(), 1500);
        }
    }

    stop() {
        if (this.running) {
            this.running = false;
            clearInterval(this.intervalId);
        }
    }

    setBlackout(active) {
        this.blackoutActive = active;
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const eventText = active ? 'EMERGENCY GRID COLLAPSE SIMULATED. CELLULAR DOWN. LORAWAN ACTIVE.' : 'GRID RESTORED. ONLINE DATABASE SYNCS ACTIVE.';
        const level = active ? 'warning' : 'system';

        db.serialize(() => {
            db.run('INSERT INTO system_logs (timestamp, event, level) VALUES (?, ?, ?)', [now, eventText, level]);
            const commMode = active ? 'LoRa Mesh' : 'Cellular';
            db.run('UPDATE rescue_teams SET comm_mode = ?', [commMode]);
        });
    }

    _tick() {
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

        // Fetch teams and distress registry
        db.all('SELECT * FROM rescue_teams', (err, teams) => {
            if (err) return;

            db.all('SELECT * FROM distress_registry', (err, beacons) => {
                if (err) return;

                const updatedTeams = [];
                const updatedBeacons = [];
                const logs = [];

                teams.forEach(team => {
                    const assignedBeacon = beacons.find(b => b.assigned_team === team.id && 
                        b.status !== 'Completed' && 
                        b.status !== 'Rescued' && 
                        b.status.toUpperCase() !== 'RESCUED' && 
                        b.status.toUpperCase() !== 'RESOLVED');

                    if (assignedBeacon) {
                        const dist = haversineDistance(team.lat, team.lon, assignedBeacon.lat, assignedBeacon.lon);

                        if (dist > 30) {
                            // Move team
                            team.status = 'Dispatched';
                            const baseSpeed = team.type === 'Helicopter' ? 0.0006 : team.type === 'Vehicle' ? 0.0002 : team.type === 'Boat' ? 0.0001 : 0.00005; // Degrees latitude offset
                            
                            const steps = 15;
                            const dLat = (assignedBeacon.lat - team.lat) / steps;
                            const dLon = (assignedBeacon.lon - team.lon) / steps;

                            team.lat += dLat;
                            team.lon += dLon;

                            // Calculate heading
                            const dy = assignedBeacon.lat - team.lat;
                            const dx = assignedBeacon.lon - team.lon;
                            let angle = Math.atan2(dx, dy) * 180 / Math.PI;
                            team.heading = angle >= 0 ? angle : 360 + angle;

                            team.speed = team.type === 'Helicopter' ? 120 : team.type === 'Vehicle' ? 45 : team.type === 'Boat' ? 18 : 5;
                            team.battery = Math.max(0, team.battery - 1);
                            team.eta = predictETA(dist, team.type);
                        } else {
                            // Reached destination!
                            if (team.status === 'Dispatched') {
                                team.status = 'Rescuing';
                                team.speed = 0;
                                team.eta = 'Arrived';
                                assignedBeacon.status = 'Located';
                            } else if (team.status === 'Rescuing') {
                                team.status = 'Idle';
                                team.eta = 'N/A';
                                
                                // Free the team, keep beacon in Located status awaiting manual resolve
                                assignedBeacon.assigned_team = null;
                                assignedBeacon.status = 'Located';

                                // Deduct stock from closest warehouse
                                db.get('SELECT id, name, food FROM supply_hubs ORDER BY (lat-?)*(lat-?) + (lon-?)*(lon-?) LIMIT 1', [assignedBeacon.lat, assignedBeacon.lat, assignedBeacon.lon, assignedBeacon.lon], (err, hub) => {
                                    if (!err && hub) {
                                        const col = assignedBeacon.item_requested === 'medical' ? 'medicine' : assignedBeacon.item_requested === 'water' ? 'water' : 'food';
                                        db.run(`UPDATE supply_hubs SET ${col} = MAX(0, ${col} - 1) WHERE id = ?`, [hub.id]);
                                        
                                        db.run('INSERT INTO system_logs (timestamp, event, level) VALUES (?, ?, ?)', [
                                            nowStr,
                                            `Stock allocated for Beacon ${assignedBeacon.id.substring(0,6)}. 1 unit of ${assignedBeacon.item_requested} deducted from Hub ${hub.name}.`,
                                            'sql'
                                        ]);
                                    }
                                });

                                logs.push({ timestamp: nowStr, event: `Rescue team arrived at Beacon ${assignedBeacon.id.substring(0,8)}. Supplies delivered. Awaiting EOC resolution.`, level: 'system' });
                                updatedBeacons.push(assignedBeacon);
                            }
                        }
                        team.signal_strength = this.blackoutActive ? Math.max(10, 45 - Math.round(dist/200)) : 100;
                    } else {
                        // Idle
                        team.status = 'Idle';
                        team.speed = 0;
                        team.eta = 'N/A';
                        team.battery = Math.min(100, team.battery + 2);
                        team.signal_strength = this.blackoutActive ? 30 : 100;
                    }
                    updatedTeams.push(team);
                });

                // LoRaWAN Mesh Check
                if (this.blackoutActive) {
                    beacons.forEach(b => {
                        if (b.status === 'Cached Offline') {
                            updatedTeams.forEach(t => {
                                const dist = haversineDistance(t.lat, t.lon, b.lat, b.lon);
                                if (dist <= LORA_RANGE_METERS && b.status === 'Cached Offline') {
                                    b.status = 'Retrieved';
                                    b.assigned_team = t.id;
                                    t.status = 'Dispatched';

                                    logs.push({
                                        timestamp: nowStr,
                                        event: `[LoRa Handshake] Team ${t.name} linked with Beacon ${b.id.substring(0,8)} at range ${dist.toFixed(0)}m. distress logs uploaded.`,
                                        level: 'warning'
                                    });
                                    updatedBeacons.push(b);
                                }
                            });
                        }
                    });
                }

                // Write updates to DB
                db.serialize(() => {
                    updatedTeams.forEach(t => {
                        db.run('UPDATE rescue_teams SET lat = ?, lon = ?, heading = ?, speed = ?, status = ?, battery = ?, signal_strength = ?, comm_mode = ?, eta = ? WHERE id = ?',
                            [t.lat, t.lon, t.heading, t.speed, t.status, t.battery, t.signal_strength, t.comm_mode, t.eta, t.id]);
                    });

                    updatedBeacons.forEach(b => {
                        db.run('UPDATE distress_registry SET status = ?, assigned_team = ? WHERE id = ?', [b.status, b.assigned_team, b.id]);
                    });

                    logs.forEach(log => {
                        db.run('INSERT INTO system_logs (timestamp, event, level) VALUES (?, ?, ?)', [log.timestamp, log.event, log.level]);
                    });
                });

                // Socket Broadcast
                this.io.emit('telemetry_update', {
                    teams: updatedTeams,
                    beacons: beacons,
                    logs: logs
                });

            });
        });
    }
}

module.exports = SimulationEngine;
