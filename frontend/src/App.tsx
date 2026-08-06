import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { socket } from './services/socket';
import { useDexieDB } from './hooks/useDexieDB';
import 'leaflet/dist/leaflet.css';

// Portal views
import LandingPage from './components/LandingPage';
import EocAdminPortal from './components/EocAdminPortal';
import RescueTeamPortal from './components/RescueTeamPortal';
import Modal from './components/Modal';

// Icons
import { ShieldAlert, Key, UserCheck, Lock, Radio } from 'lucide-react';

// EOC Operator login card
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [operatorId, setOperatorId] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (operatorId === 'admin' && securityPin === '9988') {
      sessionStorage.setItem('rapidaid_admin_session', 'active');
      onLogin();
    } else {
      setErrorMsg('Invalid Operator ID or Security PIN credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080c16] flex items-center justify-center font-body p-6">
      <div className="bg-[#0d1425] border border-white/5 p-8 rounded-2xl w-full max-w-md shadow-glass flex flex-col gap-5 select-none">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 bg-neonCyan/10 border border-neonCyan/20 rounded-full flex items-center justify-center text-neonCyan">
            <Lock size={22} />
          </div>
          <h2 className="font-heading font-extrabold text-[17px] text-white">EOC Operator Authorization</h2>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">National Command Secure Link</span>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-4 text-[12.5px]">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Operator ID</label>
            <input
              type="text"
              placeholder="e.g. admin"
              value={operatorId}
              onChange={e => setOperatorId(e.target.value)}
              className="bg-black/60 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-neonCyan"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Security PIN</label>
            <input
              type="password"
              placeholder="e.g. 9988"
              value={securityPin}
              onChange={e => setSecurityPin(e.target.value)}
              className="bg-black/60 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-neonCyan"
              required
            />
          </div>

          {errorMsg && (
            <span className="text-[11px] font-semibold text-emergencyRed text-center block">{errorMsg}</span>
          )}

          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="py-2 bg-white/5 border border-white/5 rounded-lg text-white font-semibold text-center hover:bg-white/10 transition-all"
            >
              Exit Gateway
            </button>
            <button
              type="submit"
              className="py-2 bg-gradient-to-r from-neonCyan to-neonCyan/85 text-black font-heading font-extrabold rounded-lg shadow-md hover:opacity-95 transition-all"
            >
              Authorize
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Rescue Responder login card
function RescueLogin({ onLogin }: { onLogin: () => void }) {
  const [responderId, setResponderId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (responderId === 'responder' && accessCode === '7766') {
      sessionStorage.setItem('rapidaid_rescue_session', 'active');
      onLogin();
    } else {
      setErrorMsg('Invalid Responder ID or Access Code credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080c16] flex items-center justify-center font-body p-6">
      <div className="bg-[#0d1425] border border-white/5 p-8 rounded-2xl w-full max-w-md shadow-glass flex flex-col gap-5 select-none">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 bg-warningOrange/10 border border-warningOrange/20 rounded-full flex items-center justify-center text-warningOrange animate-pulse">
            <Radio size={22} />
          </div>
          <h2 className="font-heading font-extrabold text-[17px] text-white">Responder Authentication</h2>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Active Rescue Unit Gateway</span>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-4 text-[12.5px]">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Responder ID</label>
            <input
              type="text"
              placeholder="e.g. responder"
              value={responderId}
              onChange={e => setResponderId(e.target.value)}
              className="bg-black/60 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-warningOrange"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Access Code</label>
            <input
              type="password"
              placeholder="e.g. 7766"
              value={accessCode}
              onChange={e => setAccessCode(e.target.value)}
              className="bg-black/60 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-warningOrange"
              required
            />
          </div>

          {errorMsg && (
            <span className="text-[11px] font-semibold text-emergencyRed text-center block">{errorMsg}</span>
          )}

          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="py-2 bg-white/5 border border-white/5 rounded-lg text-white font-semibold text-center hover:bg-white/10 transition-all"
            >
              Exit Gateway
            </button>
            <button
              type="submit"
              className="py-2 bg-gradient-to-r from-warningOrange to-warningOrange/85 text-white font-heading font-extrabold rounded-lg shadow-md hover:opacity-95 transition-all"
            >
              Authenticate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [blackoutActive, setBlackoutActive] = useState(false);

  // States
  const [hubs, setHubs] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [beacons, setBeacons] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [geofences, setGeofences] = useState<any[]>([]);

  // Auth statuses
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('rapidaid_admin_session') === 'active';
  });
  const [isRescueAuthenticated, setIsRescueAuthenticated] = useState(() => {
    return sessionStorage.getItem('rapidaid_rescue_session') === 'active';
  });

  // Modal stock visibility
  const [stockOpen, setStockOpen] = useState(false);
  const [stockHub, setStockHub] = useState('alpha');
  const [stockItem, setStockItem] = useState('food');
  const [stockQty, setStockQty] = useState('50');

  // Custom Toast Notification States
  const [toastShow, setToastShow] = useState(false);
  const [toastTitle, setToastTitle] = useState('');
  const [toastText, setToastText] = useState('');
  const [toastType, setToastType] = useState<'success' | 'warning' | 'danger'>('danger');

  // Dexie.js Database Hook
  const { offlineCount, saveOfflineSOS, getOfflineSOSList, clearOfflineSOSList } = useDexieDB();

  // Systems health
  const [health, setHealth] = useState({
    cpu: 10,
    memory: 38,
    clients: 1,
    sockets: 'Active',
    mesh_status: 'Online',
    db_integrity: 'SECURE/OK'
  });

  const triggerToast = (title: string, text: string, type: 'success' | 'warning' | 'danger' = 'danger') => {
    setToastTitle(title);
    setToastText(text);
    setToastType(type);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 5000);
  };

  useEffect(() => {
    fetchBaselineData();
    startHealthTick();

    // Sockets bindings
    socket.on('system_status', (data: any) => {
      setBlackoutActive(data.blackout_active);
    });

    socket.on('new_sos_alert', (data: any) => {
      setBeacons(prev => [data, ...prev]);
      const newLog = {
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        event: `CRITICAL: 1-Tap SOS received from ${data.address}. Lat/Lng: ${data.lat},${data.lng}`,
        level: 'emergency'
      };
      setLogs(prev => [newLog, ...prev].slice(0, 50));
      triggerToast('CRITICAL SOS ALERT', `Immediate Life Threat reported at ${data.address}`, 'danger');
    });

    socket.on('telemetry_update', (data: any) => {
      setTeams(data.teams);
      setBeacons(data.beacons);

      if (data.logs && data.logs.length > 0) {
        setLogs(prev => [...data.logs, ...prev].slice(0, 50));
        data.logs.forEach((log: any) => {
          if (log.level === 'warning') triggerToast('LORA HANDSHAKE', log.event, 'warning');
          if (log.level === 'danger') triggerToast('EMERGENCY CRITICAL', log.event, 'danger');
        });
      }
    });

    // Handle incoming geofence WS synchronizations
    socket.on('geofence:created', (data: any) => {
      setGeofences(prev => {
        const idx = prev.findIndex(g => g.id === data.id);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = data;
          return next;
        }
        return [...prev, data];
      });
    });

    socket.on('geofence:deleted', (data: any) => {
      setGeofences(prev => prev.filter(g => g.id !== data.id));
    });

    socket.on('sync_response', (data: any) => {
      if (data.success && data.count > 0) {
        clearOfflineSOSList().then(() => {
          triggerToast('SYNC COMPLETED', `Integrated ${data.count} cached offline distress records back to EOC SQL database.`, 'success');
        });
      }
    });

    socket.on('simulation_reset_completed', () => {
      fetchBaselineData();
      setGeofences([]);
      triggerToast('RADAR RESET', 'EOC Command dashboard telemetry and geofences flushed back to baseline parameters.', 'success');
    });

    return () => {
      socket.off('system_status');
      socket.off('new_sos_alert');
      socket.off('telemetry_update');
      socket.off('geofence:created');
      socket.off('geofence:deleted');
      socket.off('sync_response');
      socket.off('simulation_reset_completed');
    };
  }, []);

  const fetchBaselineData = () => {
    axios.get('http://127.0.0.1:5001/api/hubs').then(res => setHubs(res.data as any[]));
    axios.get('http://127.0.0.1:5001/api/distress').then(res => setBeacons(res.data as any[]));
    axios.get('http://127.0.0.1:5001/api/teams').then(res => setTeams(res.data as any[]));
    axios.get('http://127.0.0.1:5001/api/logs').then(res => setLogs(res.data as any[]));
    axios.get('http://127.0.0.1:5001/api/geofences').then(res => setGeofences(res.data as any[]));
  };

  const startHealthTick = () => {
    setInterval(() => {
      axios.get('http://127.0.0.1:5001/api/system/health')
        .then(res => setHealth(res.data as any))
        .catch(() => {});
    }, 4000);
  };

  // Blackout Trigger
  const handleBlackoutToggle = () => {
    const nextVal = !blackoutActive;
    setBlackoutActive(nextVal);
    socket.emit('blackout_toggle', { active: nextVal });

    if (nextVal) {
      triggerToast('GRID BLACKOUT ACTIVE', 'Cellular masts down. Sockets connection lost. System falling back to regional LoRa mesh networks.', 'warning');
    } else {
      triggerToast('GRID RESTORED', 'Core power grid links re-established. Synchronizing local cache queues...', 'success');
      
      // Dexie reconciliation
      getOfflineSOSList().then(list => {
        if (list.length > 0) {
          socket.emit('delta_sync', { beacons: list });
        }
      });
    }
  };

  // Submit SOS
  const handleBeaconSubmit = (beaconData: any) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const data = {
      id: 'beacon_' + Math.random().toString(36).substr(2, 9),
      lat: parseFloat(beaconData.lat),
      lon: parseFloat(beaconData.lon),
      address: beaconData.address,
      district: beaconData.district,
      state: beaconData.state,
      type: beaconData.type,
      priority: beaconData.priority,
      item_requested: beaconData.item_requested,
      details: beaconData.details,
      children: beaconData.children || 0,
      elderly: beaconData.elderly || 0,
      disabled: beaconData.disabled || 0,
      pregnant: beaconData.pregnant || 0,
      gps_accuracy: beaconData.gps_accuracy || '10',
      network_status: beaconData.network_status || 'Online'
    };

    if (blackoutActive) {
      const offlineSOS = {
        ...data,
        status: 'AWAITING_RESCUE',
        offline_flag: 1,
        timestamp: nowStr
      };

      saveOfflineSOS(offlineSOS).then(() => {
        setBeacons(prev => [offlineSOS, ...prev]);
        triggerToast('OFFLINE CACHED', 'SOS saved locally on browser Dexie.js database cache.', 'warning');
        setLogs(prev => [{
          timestamp: nowStr,
          event: `[Dexie Cache] internet lost. distress signal ${offlineSOS.id} cached on device database.`,
          level: 'warning'
        }, ...prev]);
      });
    } else {
      socket.emit('distress_beacon', data);
      triggerToast('SOS TRANSMITTED', 'Your emergency SOS distress beacon has been broadcasted successfully to EOC Command.', 'success');
    }
  };

  // Refill Hub Stock
  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    axios.post('http://127.0.0.1:5001/api/hubs/add', {
      hub_id: stockHub,
      item_type: stockItem,
      amount: parseInt(stockQty)
    }).then(res => {
      if ((res.data as any).success) {
        triggerToast('STOCK UPDATED', `Refilled inventory item stocks count.`, 'success');
        axios.get('http://127.0.0.1:5001/api/hubs').then(res => setHubs(res.data as any[]));
      }
    });

    setStockOpen(false);
  };

  const handlePlaceDistressOnMap = (lat: number, lon: number) => {
    // Placers handled inside LiveMap component trigger
  };

  const handleRebootSim = () => {
    socket.emit('reset_simulation');
  };

  // Geoman Polygon editors
  const handleSaveGeofence = (gf: any) => {
    axios.post('http://127.0.0.1:5001/api/geofences', gf).then(() => {
      axios.get('http://127.0.0.1:5001/api/geofences').then(res => setGeofences(res.data as any[]));
      triggerToast('GEOFENCE CREATED', `Geofence Zone "${gf.name}" successfully committed.`, 'success');
    });
  };

  const handleDeleteGeofence = (id: string) => {
    axios.delete(`http://127.0.0.1:5001/api/geofences/${id}`).then(() => {
      axios.get('http://127.0.0.1:5001/api/geofences').then(res => setGeofences(res.data as any[]));
      triggerToast('GEOFENCE REMOVED', 'Geofence Zone removed from maps.', 'warning');
    });
  };

  const handleAssignTeam = (beaconId: string, teamId: string) => {
    axios.post('http://127.0.0.1:5001/api/distress/assign', {
      beacon_id: beaconId,
      team_id: teamId
    }).then(() => {
      fetchBaselineData();
      triggerToast('DISPATCH ASSIGNED', 'Mobile responders successfully dispatched to distress coordinate.', 'success');
    });
  };

  const handleResolveBeacon = (beaconId: string) => {
    axios.post('http://127.0.0.1:5001/api/distress/resolve', {
      beacon_id: beaconId
    }).then(() => {
      fetchBaselineData();
      triggerToast('MISSION RESOLVED', `SOS Distress beacon successfully resolved.`, 'success');
    });
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('rapidaid_admin_session');
    setIsAdminAuthenticated(false);
  };

  const handleRescueLogout = () => {
    sessionStorage.removeItem('rapidaid_rescue_session');
    setIsRescueAuthenticated(false);
  };

  return (
    <BrowserRouter basename={(import.meta as any).env?.BASE_URL || '/NDRRS-Disaster-Platform/'}>
      <Routes>
        
        {/* 1. Public Portal Root Path */}
        <Route path="/" element={
          <LandingPage
            hubs={hubs}
            beacons={beacons}
            geofences={geofences}
            blackoutActive={blackoutActive}
            onSubmitSOS={handleBeaconSubmit}
          />
        } />

        {/* 2. Admin operations Console */}
        <Route path="/admin" element={
          isAdminAuthenticated ? (
            <EocAdminPortal
              onLogout={handleAdminLogout}
              hubs={hubs}
              teams={teams}
              beacons={beacons}
              logs={logs}
              blackoutActive={blackoutActive}
              onBlackoutToggle={handleBlackoutToggle}
              onPlaceDistress={handlePlaceDistressOnMap}
              onRebootSim={handleRebootSim}
              onOpenStockModal={() => setStockOpen(true)}
              geofences={geofences}
              onSaveGeofence={handleSaveGeofence}
              onDeleteGeofence={handleDeleteGeofence}
              onAssignTeam={handleAssignTeam}
              onResolveBeacon={handleResolveBeacon}
              health={health}
            />
          ) : (
            <AdminLogin onLogin={() => setIsAdminAuthenticated(true)} />
          )
        } />

        {/* 3. Rescue responder console */}
        <Route path="/rescue" element={
          isRescueAuthenticated ? (
            <RescueTeamPortal
              onLogout={handleRescueLogout}
              teams={teams}
              beacons={beacons}
              logs={logs}
            />
          ) : (
            <RescueLogin onLogin={() => setIsRescueAuthenticated(true)} />
          )
        } />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

      {/* Stock Refill Modal */}
      <Modal isOpen={stockOpen} onClose={() => setStockOpen(false)} title="Refill Hub Supplies">
        <form onSubmit={handleStockSubmit} className="flex flex-col gap-4 text-[12.5px]">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Target Warehouse</label>
            <select
              value={stockHub}
              onChange={e => setStockHub(e.target.value)}
              className="bg-black/60 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-neonCyan"
            >
              <option value="alpha">Maisammaguda MSME Hub</option>
              <option value="beta">Kompally Logistics Center</option>
              <option value="gamma">Gundlapochampally Depot</option>
              <option value="delta">Dulapally Forest Depot</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Item Type</label>
              <select
                value={stockItem}
                onChange={e => setStockItem(e.target.value)}
                className="bg-black/60 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-neonCyan"
              >
                <option value="food">Food Packets</option>
                <option value="medical">Medical Kits</option>
                <option value="blankets">Blankets</option>
                <option value="water">Water Stock</option>
                <option value="generator">Generators</option>
                <option value="fuel">Fuel (Liters)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Refill Quantity</label>
              <input
                type="number"
                min="1"
                value={stockQty}
                onChange={e => setStockQty(e.target.value)}
                className="bg-black/60 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-neonCyan"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-neonCyan to-neonCyan/80 text-black font-heading font-extrabold rounded-lg shadow-md hover:opacity-95 transition-all mt-2"
          >
            Commit Transaction
          </button>
        </form>
      </Modal>

      {/* Toast Notification Floater */}
      {toastShow && (
        <div className={`fixed top-4 right-4 z-[99999] w-[310px] border-l-4 p-4 rounded-r-xl shadow-glass flex gap-3 backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
          toastType === 'success' ? 'bg-[#0d1425]/95 border-safeGreen text-safeGreen shadow-[0_0_15px_rgba(0,255,135,0.15)]' :
          toastType === 'warning' ? 'bg-[#0d1425]/95 border-warningOrange text-warningOrange shadow-[0_0_15px_rgba(255,159,67,0.15)]' :
          'bg-[#0d1425]/95 border-emergencyRed text-emergencyRed shadow-[0_0_15px_rgba(255,8,68,0.15)]'
        }`}>
          <div className="leading-tight select-none font-body">
            <h4 className="text-[12.5px] font-heading font-extrabold uppercase">{toastTitle}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{toastText}</p>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}
