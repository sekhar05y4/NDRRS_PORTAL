import React, { useEffect } from 'react';
import { LogOut, Navigation, Radio, Battery, Compass, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

interface RescueTeamPortalProps {
  onLogout: () => void;
  teams: any[];
  beacons: any[];
  logs: any[];
}

function MapInitializer() {
  const map = useMap();
  useEffect(() => {
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    tiles.addTo(map);

    const timer = setTimeout(() => {
      map.invalidateSize();
      window.dispatchEvent(new Event('resize'));
    }, 200);

    return () => {
      map.removeLayer(tiles);
      clearTimeout(timer);
    };
  }, [map]);
  return null;
}

const createTeamIcon = (type: string) => {
  return L.divIcon({
    className: 'custom-team-icon',
    html: `<div style="background-color: #00c0ff; width: 24px; height: 24px; border-radius: 50%; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 11px;">🚒</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const createCitizenIcon = () => {
  return L.divIcon({
    className: 'custom-citizen-icon distress-pulse-ping',
    html: `<div style="background-color: #ff0844; width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid #fff;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

export default function RescueTeamPortal({ onLogout, teams, beacons, logs }: RescueTeamPortalProps) {
  // Let's assume this portal is logged in as Team Alpha (id: team_alpha)
  const myTeam = teams.find(t => t.id === 'team_alpha') || {
    id: 'team_alpha',
    name: 'Team Alpha (Vehicle)',
    lat: 17.5410,
    lon: 78.4820,
    battery: 100,
    status: 'Idle',
    comm_mode: 'Cellular',
    speed: 0,
    eta: 'N/A'
  };

  const assignedMission = beacons.find(b => b.assigned_team === myTeam.id && b.status !== 'Completed' && b.status !== 'Rescued');

  return (
    <div className="min-h-screen bg-[#080c16] text-white flex flex-col font-body select-none">
      
      {/* Header */}
      <header className="bg-[#0f172a] border-b border-white/5 py-3 px-6 flex justify-between items-center z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-warningOrange/10 border border-warningOrange/20 w-8 h-8 rounded-lg flex items-center justify-center text-warningOrange">
            <Radio size={18} />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-[14.5px] text-white">Rescue Responder Portal</h2>
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Mobile Asset Console</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/2 border border-white/5 px-3 py-1 rounded-lg text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <Compass size={12} className="text-warningOrange animate-spin" />
            <span>ID: <code>{myTeam.id}</code> · GPS: <code>{myTeam.lat.toFixed(4)}, {myTeam.lon.toFixed(4)}</code></span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[12px] font-semibold hover:border-emergencyRed hover:text-emergencyRed transition-all"
          >
            <LogOut size={13} />
            <span>Exit Portal</span>
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-grow max-w-5xl mx-auto w-full px-6 py-8 grid grid-cols-5 gap-6 min-h-0">
        
        {/* Mission details (Left columns) */}
        <div className="col-span-3 flex flex-col gap-4 min-h-0">
          
          {/* Mission Card */}
          <div className="bg-[#0d1425] border border-white/5 p-5 rounded-2xl shadow-glass flex flex-col gap-4">
            <div className="border-b border-white/5 pb-2">
              <h3 className="font-heading font-extrabold text-[14.5px] text-white">Current Deployment Task</h3>
            </div>
            
            {assignedMission ? (
              <div className="flex flex-col gap-4 text-[12.5px]">
                <div className="bg-neonCyan/5 border border-neonCyan/25 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <strong className="text-white text-[14px]">{assignedMission.type}</strong>
                    <span className="px-2 py-0.5 rounded-full border border-neonCyan/20 bg-neonCyan/10 text-neonCyan text-[10px] font-bold">
                      {assignedMission.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11.5px] leading-relaxed mt-1">{assignedMission.details}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white/2 border border-white/5 rounded-xl p-3 flex flex-col items-center">
                    <Battery size={16} className="text-safeGreen" />
                    <span className="text-[9px] text-slate-500 uppercase font-bold mt-1">Battery Cap</span>
                    <span className="text-white font-bold">{myTeam.battery}%</span>
                  </div>
                  <div className="flex flex-col items-center bg-white/2 border border-white/5 rounded-xl p-3">
                    <Navigation size={16} className="text-neonCyan" />
                    <span className="text-[9px] text-slate-500 uppercase font-bold mt-1">Speed</span>
                    <span className="text-white font-bold">{myTeam.speed} km/h</span>
                  </div>
                  <div className="flex flex-col items-center bg-white/2 border border-white/5 rounded-xl p-3">
                    <Radio size={16} className="text-warningOrange" />
                    <span className="text-[9px] text-slate-500 uppercase font-bold mt-1">Telemetry</span>
                    <span className="text-white font-bold">{myTeam.comm_mode}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-[12.5px] text-slate-500 text-center py-10 leading-normal">
                No active dispatch coordinates assigned at present. Standard standby routing active.
              </div>
            )}
          </div>

          {/* Sweep simulation log */}
          <div className="bg-[#0d1425] border border-white/5 p-4 rounded-2xl flex-grow overflow-y-auto max-h-[200px] shadow-glass flex flex-col gap-2">
            <h4 className="font-heading font-extrabold text-[12.5px] text-white border-b border-white/5 pb-1">
              Wireless LoRa Mesh Scans
            </h4>
            <div className="flex flex-col gap-1.5 font-mono text-[10px]">
              <div className="text-slate-500">Searching... Radio Scan...</div>
              {logs.filter(l => l.event.includes('LoRa') || l.event.includes('blackout')).map((log, idx) => (
                <div key={idx} className="text-warningOrange">
                  [{log.timestamp.substring(11, 19)}] {log.event}
                </div>
              ))}
              {assignedMission && assignedMission.status === 'Located' && (
                <div className="text-safeGreen flex items-center gap-1">
                  <CheckCircle size={10} />
                  <span>[SYNC] distress packet synchronized. citizen located.</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Mini Route Map (Right columns) */}
        <div className="col-span-2 bg-[#0d1425] border border-white/5 p-4 rounded-2xl shadow-glass flex flex-col h-full min-h-[300px]">
          <h3 className="font-heading font-extrabold text-[13.5px] text-white border-b border-white/5 pb-2 mb-3">
            Local Operations Map Frame
          </h3>
          <div className="flex-1 rounded-xl overflow-hidden border border-white/5 relative">
            <MapContainer
              center={[myTeam.lat, myTeam.lon]}
              zoom={13}
              zoomControl={true}
              scrollWheelZoom={true}
              doubleClickZoom={true}
              touchZoom={true}
              dragging={true}
              attributionControl={false}
              className="w-full h-full"
              style={{ zIndex: 1, pointerEvents: 'auto' }}
            >
              <MapInitializer />
              
              <Marker position={[myTeam.lat, myTeam.lon]} icon={createTeamIcon(myTeam.type)} />
              
              {/* Range circle */}
              <Circle
                center={[myTeam.lat, myTeam.lon]}
                radius={800}
                pathOptions={{ color: '#ff9f43', fillColor: '#ff9f43', fillOpacity: 0.08, weight: 1, dashArray: '2, 4' }}
              />

              {assignedMission && (
                <Marker position={[assignedMission.lat, assignedMission.lon]} icon={createCitizenIcon()} />
              )}
            </MapContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
