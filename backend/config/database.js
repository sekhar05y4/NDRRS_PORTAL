const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'rapidaid_v2.db');
const db = new sqlite3.Database(dbPath);

function initDB() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. Supply Hubs
      db.run(`
        CREATE TABLE IF NOT EXISTS supply_hubs (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          sector TEXT NOT NULL,
          lat REAL NOT NULL,
          lon REAL NOT NULL,
          food INTEGER DEFAULT 100,
          medicine INTEGER DEFAULT 100,
          blankets INTEGER DEFAULT 100,
          generators INTEGER DEFAULT 20,
          fuel INTEGER DEFAULT 500,
          water INTEGER DEFAULT 200
        )
      `);

      // 2. Distress Registry (SOS Beacons)
      db.run(`
        CREATE TABLE IF NOT EXISTS distress_registry (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          lat REAL NOT NULL,
          lon REAL NOT NULL,
          priority TEXT NOT NULL,
          status TEXT NOT NULL,
          offline_flag INTEGER DEFAULT 0,
          details TEXT,
          timestamp TEXT NOT NULL,
          last_contact TEXT,
          assigned_team TEXT,
          item_requested TEXT,
          severity_score REAL DEFAULT 0.0,
          predicted_eta TEXT
        )
      `);

      // 3. Rescue Teams
      db.run(`
        CREATE TABLE IF NOT EXISTS rescue_teams (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          lat REAL NOT NULL,
          lon REAL NOT NULL,
          heading REAL DEFAULT 0,
          speed REAL DEFAULT 0,
          status TEXT NOT NULL,
          battery INTEGER DEFAULT 100,
          signal_strength INTEGER DEFAULT 100,
          comm_mode TEXT NOT NULL,
          eta TEXT
        )
      `);

      // 4. System Logs
      db.run(`
        CREATE TABLE IF NOT EXISTS system_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp TEXT NOT NULL,
          event TEXT NOT NULL,
          level TEXT NOT NULL
        )
      `);

      // 5. Geofence Zones
      db.run(`
        CREATE TABLE IF NOT EXISTS geofence_zones (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          coordinates TEXT NOT NULL,
          color TEXT
        )
      `);

      // Seed Initial Warehouses if empty
      db.get('SELECT COUNT(*) as count FROM supply_hubs', (err, row) => {
        if (!err && row.count === 0) {
          const hubs = [
            ['alpha', 'Maisammaguda MSME Hub', 'Malla Reddy Corridor', 17.5620, 78.4560, 500, 250, 300, 45, 1000, 800],
            ['beta', 'Kompally Logistics Center', 'NH-44 Highway Logistics', 17.5410, 78.4820, 800, 600, 500, 80, 2000, 1500],
            ['gamma', 'Gundlapochampally Depot', 'Industrial Warehouse Corridor', 17.5750, 78.4850, 400, 150, 200, 15, 800, 600],
            ['delta', 'Dulapally Forest Depot', 'Dulapally Reserve Corridor', 17.5450, 78.4480, 300, 100, 150, 25, 600, 500]
          ];
          const stmt = db.prepare('INSERT INTO supply_hubs (id, name, sector, lat, lon, food, medicine, blankets, generators, fuel, water) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
          hubs.forEach(h => stmt.run(h));
          stmt.finalize();
        }
      });

      // Seed Rescue Teams if empty
      db.get('SELECT COUNT(*) as count FROM rescue_teams', (err, row) => {
        if (!err && row.count === 0) {
          const teams = [
            ['team_alpha', 'Team Alpha (Vehicle)', 'Vehicle', 17.5410, 78.4820, 0, 0, 'Idle', 100, 100, 'Cellular', 'N/A'],
            ['team_bravo', 'Team Bravo (Boat)', 'Boat', 17.5580, 78.4600, 0, 0, 'Idle', 88, 92, 'Cellular', 'N/A'],
            ['team_charlie', 'Team Charlie (Foot)', 'Foot Patrol', 17.5620, 78.4560, 0, 0, 'Idle', 95, 75, 'Cellular', 'N/A'],
            ['team_delta', 'Team Delta (Helicopter)', 'Helicopter', 17.5450, 78.4480, 0, 0, 'Idle', 100, 100, 'Cellular', 'N/A']
          ];
          const stmt = db.prepare('INSERT INTO rescue_teams (id, name, type, lat, lon, heading, speed, status, battery, signal_strength, comm_mode, eta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
          teams.forEach(t => stmt.run(t));
          stmt.finalize();
          
          resolve();
        } else {
          resolve();
        }
      });

    });
  });
}

module.exports = { db, initDB };
