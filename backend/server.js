const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const { initDB, db } = require('./config/database');
const apiRouter = require('./routes/api');
const SimulationEngine = require('./services/sim_engine');
const { predictSeverityScore, recommendRescueTeam } = require('./services/ai_service');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Set socket reference on app context
app.set('socketio', io);

// Mount API routes
app.use('/api', apiRouter);

// Database Bootstrap & Simulation Start
let simEngine = null;

initDB().then(() => {
    console.log("EOC SQLite Database compiled successfully.");
    
    // Spawn background simulation engine
    simEngine = new SimulationEngine(io);
    simEngine.start();
    
    server.listen(PORT, () => {
        console.log(`NDRRS Node Server running on http://127.0.0.1:${PORT}`);
    });
}).catch(err => {
    console.error("Failed to initialize database:", err);
});

// ==========================================================================
// SOCKET.IO EVENT ROUTERS
// ==========================================================================
io.on('connection', (socket) => {
    console.log(`Dashboard console terminal connected: ${socket.id}`);
    
    // Broadcast active blackout state to new connections
    socket.emit('system_status', {
        blackout_active: simEngine ? simEngine.blackoutActive : false
    });

    // Receive citizen emergency distress beacon
    socket.on('distress_beacon', (data) => {
        const beaconId = data.id || 'beacon_' + Math.random().toString(36).substr(2, 9);
        const lat = parseFloat(data.lat);
        const lon = parseFloat(data.lon);
        const emergencyType = data.type;
        const priority = data.priority;
        const details = data.details || '';
        const itemRequested = data.item_requested || 'food';
        
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

        // 1. Run AI Severity Index & Optimal Responders
        const severity = predictSeverityScore(details);
        
        db.all('SELECT * FROM rescue_teams WHERE status = "Idle"', (err, idleTeams) => {
            if (err) return;
            
            const bestTeam = recommendRescueTeam(lat, lon, idleTeams);
            const initialStatus = 'AWAITING_RESCUE';

            db.serialize(() => {
                // Save distress
                db.run('INSERT INTO distress_registry (id, type, lat, lon, priority, status, offline_flag, details, timestamp, last_contact, assigned_team, item_requested, severity_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [beaconId, emergencyType, lat, lon, priority, initialStatus, 0, details, nowStr, nowStr, bestTeam, itemRequested, severity]);

                // Update team status
                if (bestTeam) {
                    db.run('UPDATE rescue_teams SET status = "Dispatched" WHERE id = ?', [bestTeam]);
                    db.run('INSERT INTO system_logs (timestamp, event, level) VALUES (?, ?, ?)', [
                        nowStr,
                        `distress beacon ${beaconId.substring(0,8)} received. AI Severity index: ${severity}. Responders ${bestTeam} dispatched.`,
                        'system'
                    ]);
                } else {
                    db.run('INSERT INTO system_logs (timestamp, event, level) VALUES (?, ?, ?)', [
                        nowStr,
                        `distress beacon ${beaconId.substring(0,8)} received. placed in dispatch queue.`,
                        'system'
                    ]);
                }
            });

            // Broadcast details
            io.emit('distress_created', {
                id: beaconId,
                type: emergencyType,
                lat: lat,
                lon: lon,
                priority: priority,
                status: initialStatus,
                assigned_team: bestTeam,
                timestamp: nowStr,
                severity_score: severity
            });
            
            // Explicitly support sos:new naming convention as well
            io.emit('sos:new', {
                id: beaconId,
                type: emergencyType,
                lat: lat,
                lon: lon,
                priority: priority,
                status: initialStatus,
                assigned_team: bestTeam,
                timestamp: nowStr,
                severity_score: severity
            });
        });
    });

    // Forward 1-Tap SOS WebSocket Alerts
    socket.on('sos_alert', (alertData) => {
        io.emit('new_sos_alert', alertData);
    });

    // Toggle grid blackout mode
    socket.on('blackout_toggle', (data) => {
        const active = data.active;
        if (simEngine) {
            simEngine.setBlackout(active);
        }
        io.emit('system_status', { blackout_active: active });
    });

    // Sync client local caches
    socket.on('delta_sync', (data) => {
        const syncList = data.beacons || [];
        if (syncList.length === 0) return;

        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
        let successCount = 0;

        syncList.forEach(b => {
            db.get('SELECT COUNT(*) as count FROM distress_registry WHERE id = ?', [b.id], (err, row) => {
                if (!err && row.count === 0) {
                    db.run('INSERT INTO distress_registry (id, type, lat, lon, priority, status, offline_flag, details, timestamp, last_contact, assigned_team, item_requested) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [b.id, b.type, parseFloat(b.lat), parseFloat(b.lon), b.priority, 'AWAITING_RESCUE', 1, b.details, b.timestamp, nowStr, null, b.item_requested || 'food']);
                    
                    successCount++;
                }
            });
        });

        setTimeout(() => {
            if (successCount > 0) {
                db.run('INSERT INTO system_logs (timestamp, event, level) VALUES (?, ?, ?)', [
                    nowStr,
                    `Delta sync committed. Saved ${successCount} offline logs to server.`,
                    'sql'
                ]);
            }
            socket.emit('sync_response', { success: true, count: successCount });
        }, 800);
    });

    // Reset simulator console
    socket.on('reset_simulation', () => {
        db.serialize(() => {
            db.run('DELETE FROM distress_registry');
            db.run('DELETE FROM geofence_zones');
            db.run('UPDATE supply_hubs SET food=500, medicine=250, blankets=300, generators=45, fuel=1000, water=800');
            
            const defaults = [
                ['team_alpha', 17.5410, 78.4820],
                ['team_bravo', 17.5580, 78.4600],
                ['team_charlie', 17.5620, 78.4560],
                ['team_delta', 17.5450, 78.4480]
            ];
            defaults.forEach(d => {
                db.run('UPDATE rescue_teams SET lat = ?, lon = ?, status="Idle", heading=0.0, speed=0.0, battery=100, signal_strength=100, comm_mode="Cellular", eta="N/A" WHERE id = ?', [d[1], d[2], d[0]]);
            });

            const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
            db.run('INSERT INTO system_logs (timestamp, event, level) VALUES (?, ?, ?)', [now, 'EOC control console parameters rebooted to baseline thresholds.', 'system']);
        });

        if (simEngine) {
            simEngine.blackoutActive = false;
        }

        io.emit('simulation_reset_completed', {});
    });

    socket.on('disconnect', () => {
        console.log(`Console disconnected: ${socket.id}`);
    });
});
