# RapidAid v2 — National Emergency Operations & Disaster Intelligence Platform

RapidAid v2 is a modern, enterprise-grade Government Disaster Command Center SaaS platform designed to facilitate real-time situation awareness, hazard warning, AI allocations, and offline communications mesh fallback loops. Inspired by the NDMA, IMD, Sachet alert systems, and NASA Mission Control layouts.

---

## Technical Stack

- **Frontend:** React 19 (TypeScript), Vite, Tailwind CSS, Leaflet Maps, Recharts Analytics, and Framer Motion.
- **Backend:** Node.js (Express, Socket.IO WebSockets) & SQLite Database WAL (Row-level ACID locking).
- **Offline Protocol:** Service Workers, HTML5 IndexedDB, and LoRaWAN mesh gateways simulation.

---

## Project Structure
```
rapidaid-v2/
├── backend/
│   ├── rapidaid_v2.db
│   ├── package.json
│   ├── server.js              # Entrypoint Express + Socket.IO server
│   ├── config/
│   │   └── database.js        # Relational SQLite schemas & seeds
│   ├── controllers/
│   │   ├── auth.js            # Mock JWT authenticator
│   │   └── inventory.js       # Transaction isolation allocations
│   ├── services/
│   │   ├── sim_engine.js      # Telemetry loops & ranges checker
│   │   └── ai_service.js      # Severity index & optimal dispatch paths
│   └── routes/
│       └── api.js             # REST API paths
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── App.tsx            # Main layout controller
        ├── main.tsx           # Mounting assembly point
        ├── index.css          # Tailwind configurations
        ├── components/
        │   ├── Sidebar.tsx    { Brand name, operator profile, 9 EOC options }
        │   ├── Header.tsx     { Online/Offline indicator & grid blackout button }
        │   └── Modal.tsx      { Dialog modals wrapper }
        ├── hooks/
        │   └── useOfflineDB.ts{ IndexedDB distress caching }
        ├── services/
        │   └── socket.ts      { Socket.IO connection configurations }
        └── pages/
            ├── Dashboard.tsx  { Metrics cards, logistics stocks, timeline feed }
            ├── MapView.tsx    { Live Leaflet Map Container, geofences, placing }
            ├── Registry.tsx   { SOS table ledger & CSV downloading }
            ├── Dispatch.tsx   { Mobile teams, battery drainage, EOC math }
            ├── Inventory.tsx  { MSME supply warehouses refiller }
            ├── Weather.tsx    { Rainfall indices, Wind cyclone alerts, IMD Radar }
            ├── Network.tsx    { Network connections nodes }
            ├── Analytics.tsx  { Recharts incident charts }
            └── System.tsx     { CPU RAM telemetry diagnostic gauges }
```

---

## Running the Application Locally

Ensure you have **Node.js (v18+)** installed.

### 1. Launch the Backend Server
Navigate to the `backend/` directory:
```bash
cd backend
npm install
node server.js
```
The server will initialize `rapidaid_v2.db` and start listening on **http://127.0.0.1:5001**.

### 2. Launch the Frontend Dev Server
Navigate to the `frontend/` directory:
```bash
cd ../frontend
npm install --legacy-peer-deps
npm run dev
```
The client dashboard will compile and open on **http://127.0.0.1:5173**.

---

## Key Workflows & Features

1. **Live Operations Map (Leaflet):** Centered in the **Maisammaguda-Kompally sector in Hyderabad**. Displays hazard zones (Lake Surge, NH-44 Highway blocks), supply hubs, moving rescue teams, and active citizen beacons.
2. **AI Allocation Models:** Predicts incident severity indices from description contexts and assigns responders based on distance weights.
3. **Simulated Blackout & LoRa Mesh Handshake:**
   - Click "Simulate Grid Failure" on the header ribbon. Map goes offline (grayscale).
   - Citizen distress submittals are caught by the browser and cached inside **IndexedDB**.
   - Spawns rescue vehicles carrying LoRa nodes. When their range rings (800m) sweep near cached distress locations, the app performs a **LoRa Handshake**, uploads logs wirelessly, and sets coordinates.
   - Disabling grid failure syncs cached data to the SQLite server.
