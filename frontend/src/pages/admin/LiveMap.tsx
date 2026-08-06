import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polyline, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
// @ts-ignore
import * as turf from '@turf/turf';
import { Crosshair, RotateCcw, AlertTriangle, Layers, Trash2, Award, UserCheck, ShieldAlert, Heart, Truck, HelpCircle } from 'lucide-react';
import axios from 'axios';

interface LiveMapProps {
  hubs: any[];
  teams: any[];
  beacons: any[];
  blackoutActive: boolean;
  onPlaceDistress: (lat: number, lon: number) => void;
  onRebootSim: () => void;
  geofences: any[];
  onSaveGeofence: (gf: any) => void;
  onDeleteGeofence: (id: string) => void;
  onResolveBeacon: (beaconId: string) => void;
}

const MAP_CENTER: [number, number] = [17.5500, 78.4650];

// Custom Hub Icon (Evacuation Center / Warehouses)
const createHubIcon = () => L.divIcon({
  className: 'custom-hub-icon',
  html: `<div style="background-color: #00ff87; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 10px #00ff87;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// Citizen marker icon colored by priority: Critical (Red), High (Orange), Medium (Yellow), Low (Blue), Resolved (Green)
const createCitizenIcon = (priority: string, status: string, insideDanger: boolean) => {
  let color = '#3498db'; // Low - default Blue
  if (status === 'Completed' || status === 'Rescued') {
    color = '#00ff87'; // Resolved - Green
  } else if (insideDanger || priority === 'Critical') {
    color = '#ff0844'; // Critical - Red
  } else if (priority === 'High') {
    color = '#ff9f43'; // High - Orange
  } else if (priority === 'Medium') {
    color = '#f1c40f'; // Medium - Yellow
  }

  const pingAnim = (status === 'Completed' || status === 'Rescued') ? '' : 'distress-pulse-ping';

  return L.divIcon({
    className: `custom-citizen-icon ${pingAnim}`,
    html: `<div style="background-color: ${color}; width: 13px; height: 13px; border-radius: 50%; border: 1.5px solid #fff; box-shadow: 0 0 14px ${color};"></div>`,
    iconSize: [13, 13],
    iconAnchor: [6, 6]
  });
};

// Responder Marker
const createTeamIcon = (type: string, heading: number) => {
  const teamColor = type === 'Vehicle' ? '#00c0ff' : type === 'Boat' ? '#ff9f43' : type === 'Helicopter' ? '#a18cd1' : '#ffb199';
  const emoji = type === 'Vehicle' ? '🚒' : type === 'Boat' ? '🚤' : type === 'Helicopter' ? '🚁' : '🏃';
  return L.divIcon({
    className: 'custom-team-icon',
    html: `
      <div style="transform: rotate(${heading}deg); transition: transform 0.2s ease;">
        <div style="background-color: ${teamColor}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 10px ${teamColor}; display: flex; align-items: center; justify-content: center; font-size: 13px;">
          ${emoji}
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

// Geoman Map Drawing Controller Sub-Component
function GeomanControls({ 
  onSaveGeofence, 
  activeConfig 
}: { 
  onSaveGeofence: (gf: any) => void;
  activeConfig: { type: string; color: string }
}) {
  const map = useMap();

  useEffect(() => {
    map.pm.addControls({
      position: 'topleft',
      drawCircle: true,
      drawPolygon: true,
      drawRectangle: true,
      drawPolyline: true,
      editMode: true,
      dragMode: false,
      removalMode: true
    });

    map.on('pm:create', (e: any) => {
      const { layer, shape } = e;
      let coords: any = [];
      let radius: number | undefined = undefined;

      if (shape === 'Polygon' || shape === 'Rectangle') {
        const latlngs = layer.getLatLngs()[0];
        coords = latlngs.map((l: any) => [l.lat, l.lng]);
      } else if (shape === 'Polyline') {
        const latlngs = layer.getLatLngs();
        coords = latlngs.map((l: any) => [l.lat, l.lng]);
      } else if (shape === 'Circle') {
        const center = layer.getLatLng();
        coords = [[center.lat, center.lng]];
        radius = layer.getRadius();
      }

      // Remove temp layer
      map.removeLayer(layer);

      if (coords.length > 0) {
        const id = 'gf_' + Math.random().toString(36).substr(2, 9);
        onSaveGeofence({
          id,
          name: `${activeConfig.type} Zone ${id.substring(3, 7).toUpperCase()}`,
          type: activeConfig.type,
          coordinates: coords,
          color: activeConfig.color,
          radius
        });
      }
    });

    return () => {
      map.pm.removeControls();
    };
  }, [map, onSaveGeofence, activeConfig]);

  return null;
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

export default function LiveMap({
  hubs,
  teams,
  beacons,
  blackoutActive,
  onPlaceDistress,
  onRebootSim,
  geofences,
  onSaveGeofence,
  onDeleteGeofence,
  onResolveBeacon
}: LiveMapProps) {
  const [placingActive, setPlacingActive] = useState(false);
  const [hudMsg, setHudMsg] = useState("Click 'Place Mock Distress' to specify map coordinates.");

  // Config selector for drawn geofences
  const [activeConfig, setActiveConfig] = useState({
    type: 'Danger Zone',
    color: '#ff0844' // Red
  });

  // Selected Distress Beacon Sidebar State
  const [selectedBeacon, setSelectedBeacon] = useState<any | null>(null);

  const riskPresets = [
    { type: 'Danger Zone', label: 'Very Dangerous', color: '#ff0844' }, // Red
    { type: 'High Risk Zone', label: 'High Risk', color: '#ff9f43' },  // Orange
    { type: 'Moderate Zone', label: 'Moderate Risk', color: '#f1c40f' }, // Yellow
    { type: 'Safe Zone', label: 'Safe Evac Center', color: '#00ff87' },  // Green
    { type: 'Evacuation Route', label: 'Evac Route', color: '#3498db' } // Blue
  ];

  // Turf.js Point-In-Polygon checks
  const isPointInPolygon = (lat: number, lon: number, polygonCoords: number[][]) => {
    try {
      if (polygonCoords.length < 3) return false;
      const closed = [...polygonCoords];
      if (closed[0][0] !== closed[closed.length - 1][0] || closed[0][1] !== closed[closed.length - 1][1]) {
        closed.push(closed[0]);
      }
      const pt = turf.point([lon, lat]);
      const poly = turf.polygon([closed.map(c => [c[1], c[0]])]);
      return turf.booleanPointInPolygon(pt, poly);
    } catch (e) {
      return false;
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const dx = lat1 - lat2;
    const dy = lon1 - lon2;
    return Math.sqrt(dx * dx + dy * dy) * 111000; // approximation in meters
  };

  // AI recommendations calculator
  const getAIRecommendations = (beacon: any) => {
    if (!beacon) return null;
    let nearestHub = null;
    let minHubDist = Infinity;
    hubs.forEach(h => {
      const d = getDistance(beacon.lat, beacon.lon, h.lat, h.lon);
      if (d < minHubDist) {
        minHubDist = d;
        nearestHub = h;
      }
    });

    let nearestTeam = null;
    let minTeamDist = Infinity;
    teams.forEach(t => {
      if (t.status !== 'Idle') return;
      const d = getDistance(beacon.lat, beacon.lon, t.lat, t.lon);
      if (d < minTeamDist) {
        minTeamDist = d;
        nearestTeam = t;
      }
    });

    return {
      hub: nearestHub ? `${(nearestHub as any).name} (${minHubDist.toFixed(0)}m)` : 'N/A',
      team: nearestTeam ? `${(nearestTeam as any).name} (${minTeamDist.toFixed(0)}m)` : 'No Idle Responders'
    };
  };

  const handleManualDispatch = async (teamId: string) => {
    if (!selectedBeacon) return;
    try {
      await axios.post('http://127.0.0.1:5001/api/distress/assign', {
        beacon_id: selectedBeacon.id,
        team_id: teamId
      });
      // Refresh state locally
      selectedBeacon.assigned_team = teamId;
      selectedBeacon.status = 'Dispatched';
      setSelectedBeacon({ ...selectedBeacon });
    } catch (err) {
      console.error("Dispatch assignment failed:", err);
    }
  };

  const MapClicks = () => {
    useMapEvents({
      click(e) {
        if (!placingActive) return;
        setPlacingActive(false);
        setHudMsg("Click 'Place Mock Distress' to specify map coordinates.");
        onPlaceDistress(e.latlng.lat, e.latlng.lng);
      }
    });
    return null;
  };

  return (
    <div className="relative flex w-full h-full gap-4 select-none">
      
      {/* Map View Frame */}
      <div className="flex-1 h-full rounded-xl overflow-hidden border border-white/5 relative">
        <MapContainer
          center={MAP_CENTER}
          zoom={14}
          zoomControl={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          touchZoom={true}
          dragging={true}
          attributionControl={false}
          className={`w-full h-full ${blackoutActive ? 'blackout-grayscale' : ''}`}
          style={{ zIndex: 1, pointerEvents: 'auto' }}
        >
          <MapInitializer />
          
          <GeomanControls onSaveGeofence={onSaveGeofence} activeConfig={activeConfig} />
          <MapClicks />

          {/* Render Geofences */}
          {geofences.map(gf => {
            if (gf.radius && gf.coordinates.length === 1) {
              return (
                <Circle
                  key={gf.id}
                  center={gf.coordinates[0]}
                  radius={gf.radius}
                  pathOptions={{
                    color: gf.color || '#00ff87',
                    fillColor: gf.color || '#00ff87',
                    fillOpacity: 0.1,
                    weight: 2
                  }}
                >
                  <Tooltip sticky><b>{gf.name}</b></Tooltip>
                </Circle>
              );
            }

            return (
              <Polyline
                key={gf.id}
                positions={[...gf.coordinates, gf.coordinates[0]]}
                pathOptions={{
                  color: gf.color || '#ff0844',
                  fillColor: gf.color || '#ff0844',
                  fillOpacity: 0.12,
                  weight: 2
                }}
              >
                <Tooltip sticky><b>{gf.name}</b><br />Type: {gf.type}</Tooltip>
              </Polyline>
            );
          })}

          {/* Render Hubs */}
          {hubs.map(hub => (
            <Marker key={hub.id} position={[hub.lat, hub.lon]} icon={createHubIcon()}>
              <Tooltip><b>{hub.name}</b><br />Relief Warehouse &amp; Shelter</Tooltip>
            </Marker>
          ))}

          {/* Render Citizen SOS Beacons */}
          {beacons.map(b => {
            let insideDanger = false;
            geofences.forEach(gf => {
              if (gf.type === 'Danger Zone' && isPointInPolygon(b.lat, b.lon, gf.coordinates)) {
                insideDanger = true;
              }
            });

            return (
              <Marker 
                key={b.id} 
                position={[b.lat, b.lon]} 
                icon={createCitizenIcon(b.priority, b.status, insideDanger)}
                eventHandlers={{
                  click: () => {
                    setSelectedBeacon({ ...b, insideDanger });
                  }
                }}
              >
                <Tooltip>
                  <b>SOS: {b.id.substring(0, 8)}</b><br />
                  Category: {b.type}<br />
                  Priority: {b.priority}
                </Tooltip>
              </Marker>
            );
          })}

          {/* Render Rescue Teams */}
          {teams.map(t => (
            <React.Fragment key={t.id}>
              <Marker position={[t.lat, t.lon]} icon={createTeamIcon(t.type, t.heading)}>
                <Tooltip><b>{t.name}</b><br />Status: {t.status}</Tooltip>
              </Marker>
            </React.Fragment>
          ))}

        </MapContainer>

        {/* Floating Drawing Preset Selectors */}
        <div className="absolute top-4 right-4 bg-[#080c16]/95 border border-white/5 p-3 rounded-xl z-[1000] w-[210px] backdrop-blur-sm select-none">
          <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block mb-2"><Layers size={10} className="inline mr-1" /> Drawing Zone Type</span>
          <div className="flex flex-col gap-1.5">
            {riskPresets.map(preset => (
              <button
                key={preset.type}
                onClick={() => setActiveConfig({ type: preset.type, color: preset.color })}
                className={`w-full text-left px-2.5 py-1 rounded text-[11px] font-semibold flex items-center justify-between transition-all ${
                  activeConfig.type === preset.type 
                    ? 'bg-white/5 border border-white/10 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-white/2'
                }`}
              >
                <span>{preset.type}</span>
                <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: preset.color }} />
              </button>
            ))}
          </div>
        </div>

        {/* Floating Placer Control */}
        <div className="absolute bottom-4 left-4 bg-[#080c16]/95 border border-white/5 p-3 rounded-xl z-[1000] w-[220px] backdrop-blur-sm">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                setPlacingActive(!placingActive);
                setHudMsg(placingActive ? "Click 'Place Mock Distress' to specify map coordinates." : "Select grid point directly on map canvas.");
              }}
              className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11.5px] font-bold text-white transition-all ${
                placingActive ? 'bg-warningOrange' : 'bg-emergencyRed'
              }`}
            >
              <Crosshair size={13} />
              <span>{placingActive ? 'Cancel Placer' : 'Place Mock Distress'}</span>
            </button>
            <button
              onClick={onRebootSim}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11.5px] font-semibold bg-white/5 border border-white/5 text-white hover:border-neonCyan"
            >
              <RotateCcw size={13} />
              <span>Reboot Sim</span>
            </button>
          </div>
          <p className="text-[9px] text-slate-500 leading-normal mt-2">{hudMsg}</p>
        </div>

      </div>

      {/* Right Sidebar: Selected Distress Details & Dispatches */}
      <div className="w-[300px] bg-[#0d1425]/45 border border-white/5 rounded-xl p-4 flex flex-col h-full overflow-y-auto pr-1 shadow-glass">
        {selectedBeacon ? (
          <div className="flex flex-col gap-4">
            <div className="border-b border-white/5 pb-2 flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-[13.5px] text-white">Distress Details</h3>
              <button 
                onClick={() => setSelectedBeacon(null)}
                className="text-[10px] text-slate-500 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="flex flex-col gap-2 text-[12px]">
              <div>
                <span className="text-[9.5px] text-slate-500 uppercase font-bold block">Beacon ID</span>
                <code className="text-white font-mono text-[11px] bg-black/40 px-2 py-0.5 rounded border border-white/5">{selectedBeacon.id}</code>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <span className="text-[9.5px] text-slate-500 uppercase font-bold block">Priority</span>
                  <span className="text-emergencyRed font-bold">{selectedBeacon.priority}</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-500 uppercase font-bold block">Status</span>
                  <span className="text-neonCyan font-bold">{selectedBeacon.status}</span>
                </div>
              </div>

              {selectedBeacon.insideDanger && (
                <div className="bg-emergencyRed/10 border border-emergencyRed/20 text-emergencyRed rounded-lg p-2.5 flex items-start gap-2 mt-1">
                  <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
                  <span className="text-[10.5px] leading-tight font-bold">WARNING: Citizen lies inside drawn Danger Geofence polygon boundary!</span>
                </div>
              )}

              <div className="mt-1">
                <span className="text-[9.5px] text-slate-500 uppercase font-bold block">Details context</span>
                <p className="text-slate-300 leading-normal text-[11.5px] bg-white/2 border border-white/5 p-2 rounded-lg mt-0.5">{selectedBeacon.details}</p>
              </div>

              {/* Vulnerable demographics */}
              <div className="bg-white/2 border border-white/5 p-2.5 rounded-lg mt-1 flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Demographics</span>
                <div className="grid grid-cols-2 gap-2 text-center text-[10.5px]">
                  <div className="bg-black/30 p-1.5 rounded">Kids: <strong className="text-white">{selectedBeacon.children || 0}</strong></div>
                  <div className="bg-black/30 p-1.5 rounded">Elderly: <strong className="text-white">{selectedBeacon.elderly || 0}</strong></div>
                  <div className="bg-black/30 p-1.5 rounded">Disabled: <strong className="text-white">{selectedBeacon.disabled || 0}</strong></div>
                  <div className="bg-black/30 p-1.5 rounded">Pregnant: <strong className="text-white">{selectedBeacon.pregnant || 0}</strong></div>
                </div>
              </div>

              {/* AI nearest recommendations */}
              {(() => {
                const ai = getAIRecommendations(selectedBeacon);
                if (!ai) return null;
                return (
                  <div className="bg-safeGreen/5 border border-safeGreen/20 p-2.5 rounded-lg flex flex-col gap-1.5 mt-1 select-none">
                    <span className="text-[10px] text-safeGreen font-bold uppercase tracking-wider block">AI Allocations recommendations</span>
                    <div className="text-[11px] leading-tight flex flex-col gap-1 text-slate-300">
                      <span>🚒 Nearest Responder: <strong className="text-white">{ai.team}</strong></span>
                      <span>🏥 Nearest Camp: <strong className="text-white">{ai.hub}</strong></span>
                    </div>
                  </div>
                );
              })()}

              {/* Manual Resolve Button */}
              {selectedBeacon.status !== 'Completed' && 
               selectedBeacon.status !== 'Rescued' && 
               selectedBeacon.status.toUpperCase() !== 'RESCUED' && 
               selectedBeacon.status.toUpperCase() !== 'RESOLVED' && (
                <button
                  onClick={async () => {
                    await onResolveBeacon(selectedBeacon.id);
                    setSelectedBeacon(null);
                  }}
                  className="w-full py-2 bg-gradient-to-r from-safeGreen to-[#00c6ff] text-black font-heading font-extrabold rounded-lg shadow-md hover:opacity-95 flex items-center justify-center gap-2 mt-3 select-none text-[12px]"
                >
                  <Award size={14} />
                  <span>Mark as Rescued</span>
                </button>
              )}

              {/* Dispatch menu */}
              {selectedBeacon.status !== 'Completed' && 
               selectedBeacon.status !== 'Rescued' && 
               selectedBeacon.status.toUpperCase() !== 'RESCUED' && 
               selectedBeacon.status.toUpperCase() !== 'RESOLVED' && (
                <div className="mt-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Dispatch Response Asset</span>
                  <div className="grid grid-cols-2 gap-2">
                    {teams.map(t => (
                      <button
                        key={t.id}
                        onClick={() => handleManualDispatch(t.id)}
                        className="bg-[#1e293b] border border-white/5 rounded-lg py-2 px-2 text-[10.5px] font-semibold text-white hover:border-safeGreen text-center transition-all"
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-slate-500 text-[12px] leading-normal select-none">
            <HelpCircle size={30} className="mb-2 text-slate-600" />
            <span>Select active emergency distress marker on map canvas to trigger dispatch console.</span>
          </div>
        )}
      </div>

    </div>
  );
}
