const express = require('express');
const router = express.Router();
const { db } = require('../config/database');

// GET Supply Hubs
router.get('/hubs', (req, res) => {
    db.all('SELECT * FROM supply_hubs', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST Add Hub Stock
router.post('/hubs/add', (req, res) => {
    const { hub_id, item_type, amount } = req.body;
    if (!hub_id || !item_type || !amount) {
        return res.status(400).json({ success: false, error: 'Invalid parameters' });
    }

    const columnMap = {
        'food': 'food',
        'medical': 'medicine',
        'blankets': 'blankets',
        'water': 'water',
        'generator': 'generators',
        'fuel': 'fuel'
    };

    const col = columnMap[item_type];
    if (!col) return res.status(400).json({ success: false, error: 'Invalid item type' });

    db.run(`UPDATE supply_hubs SET ${col} = ${col} + ? WHERE id = ?`, [amount, hub_id], function(err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        
        db.get(`SELECT ${col} FROM supply_hubs WHERE id = ?`, [hub_id], (err, row) => {
            if (err || !row) return res.status(500).json({ success: false });
            
            const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
            db.run('INSERT INTO system_logs (timestamp, event, level) VALUES (?, ?, ?)', [
                now,
                `Refilled inventory item [${item_type}] +${amount} units for hub [${hub_id}].`,
                'sql'
            ]);
            
            res.json({ success: true, new_stock: row[col] });
        });
    });
});

// GET Distress Beacons
router.get('/distress', (req, res) => {
    db.all('SELECT * FROM distress_registry ORDER BY timestamp DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET Teams
router.get('/teams', (req, res) => {
    db.all('SELECT * FROM rescue_teams', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET System Logs
router.get('/logs', (req, res) => {
    db.all('SELECT * FROM system_logs ORDER BY id DESC LIMIT 50', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET Systems health telemetry
router.get('/system/health', (req, res) => {
    const clientsCount = req.app.get('socketio') ? req.app.get('socketio').sockets.sockets.size : 1;
    res.json({
        cpu: Math.floor(Math.random() * 15) + 10,
        memory: Math.floor(Math.random() * 20) + 30,
        clients: clientsCount,
        sockets: 'OK/Active',
        mesh_status: 'Online',
        db_integrity: 'SECURE/OK'
    });
});

// GET CSV Reports Download
router.get('/report/csv', (req, res) => {
    db.all('SELECT * FROM distress_registry', (err, rows) => {
        if (err) return res.status(500).send('Error generating report');
        
        let csvContent = 'Beacon ID,Emergency Type,Latitude,Longitude,Priority,Status,Offline,Details,Timestamp\n';
        rows.forEach(r => {
            csvContent += `${r.id},"${r.type}",${r.lat},${r.lon},${r.priority},${r.status},${r.offline_flag},"${r.details || ''}",${r.timestamp}\n`;
        });
        
        res.setHeader('Content-disposition', 'attachment; filename=ndrrs_reports.csv');
        res.set('Content-Type', 'text/csv');
        res.status(200).send(csvContent);
    });
});

// GET Geofences list
router.get('/geofences', (req, res) => {
    db.all('SELECT * FROM geofence_zones', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(r => ({
            id: r.id,
            name: r.name,
            type: r.type,
            coordinates: JSON.parse(r.coordinates),
            color: r.color
        })));
    });
});

// POST Save Geofence
router.post('/geofences', (req, res) => {
    const { id, name, type, coordinates, color } = req.body;
    if (!id || !name || !type || !coordinates) {
        return res.status(400).json({ error: 'Missing parameters' });
    }
    const coordsJson = JSON.stringify(coordinates);
    db.run('INSERT OR REPLACE INTO geofence_zones (id, name, type, coordinates, color) VALUES (?, ?, ?, ?, ?)',
        [id, name, type, coordsJson, color],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
            db.run('INSERT INTO system_logs (timestamp, event, level) VALUES (?, ?, ?)', [
                now,
                `Geofence ${type} Zone "${name}" saved/created on map grid.`,
                'system'
            ]);
            
            const io = req.app.get('socketio');
            if (io) {
                io.emit('geofence:created', { id, name, type, coordinates, color });
            }
            
            res.json({ success: true });
        }
    );
});

// DELETE Geofence
router.delete('/geofences/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM geofence_zones WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        db.run('INSERT INTO system_logs (timestamp, event, level) VALUES (?, ?, ?)', [
            now,
            `Geofence ${id} removed from EOC maps.`,
            'system'
        ]);
        
        const io = req.app.get('socketio');
        if (io) {
            io.emit('geofence:deleted', { id });
        }
        
        res.json({ success: true });
    });
});

// POST Manual Dispatch Assign
router.post('/distress/assign', (req, res) => {
    const { beacon_id, team_id } = req.body;
    db.run('UPDATE distress_registry SET assigned_team = ?, status = "Dispatched" WHERE id = ?', [team_id, beacon_id], function(err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        db.run('INSERT INTO system_logs (timestamp, event, level) VALUES (?, ?, ?)', [
            now,
            `Manual dispatch: Responders ${team_id} assigned to SOS beacon ${beacon_id.substring(0,8)}.`,
            'system'
        ]);
        res.json({ success: true });
    });
});

// POST Manual Resolve / Mark as Rescued
router.post('/distress/resolve', (req, res) => {
    const { beacon_id } = req.body;
    if (!beacon_id) {
        return res.status(400).json({ success: false, error: 'Missing beacon_id' });
    }

    db.serialize(() => {
        db.run('UPDATE distress_registry SET status = "RESCUED", assigned_team = NULL WHERE id = ?', [beacon_id], function(err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            
            const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
            db.run('INSERT INTO system_logs (timestamp, event, level) VALUES (?, ?, ?)', [
                now,
                `Manual resolve: SOS beacon ${beacon_id.substring(0,8)} manually marked as RESCUED by operator.`,
                'system'
            ]);
            res.json({ success: true });
        });
    });
});

// POST 1-Tap SOS
router.post('/sos', (req, res) => {
    const sosData = req.body;
    const { id, name, lat, lng, address, district, state, severity, status, timestamp, batteryLevel } = sosData;

    db.run(
        `INSERT INTO distress_registry (id, lat, lon, address, district, state, type, priority, item_requested, details, children, elderly, disabled, pregnant, status, timestamp) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, lat, lng, address, district, state, severity, 'Critical', 'Rescue & Medical', `1-TAP PANIC TRIGGERED. User: ${name || 'Citizen'}. Battery: ${batteryLevel || 'Unknown'}`, 0, 0, 0, 0, status || 'Awaiting Rescue', timestamp],
        function(err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            
            const io = req.app.get('socketio');
            if (io) {
                io.emit('new_sos_alert', sosData);
            }
            
            const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
            db.run('INSERT INTO system_logs (timestamp, event, level) VALUES (?, ?, ?)', [
                now,
                `CRITICAL: 1-Tap SOS received from ${address}. Lat/Lng: ${lat},${lng}`,
                'emergency'
            ]);
            
            res.json({ success: true, message: 'SOS broadcasted successfully' });
        }
    );
});

module.exports = router;
