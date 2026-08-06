import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polyline, Tooltip, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, RotateCcw, AlertTriangle } from 'lucide-react';

interface MapViewProps {
  hubs: any[];
  teams: any[];
  beacons: any[];
  blackoutActive: boolean;
  onPlaceDistress: (lat: number, lon: number) => void;
  onRebootSim: () => void;
}

// Map center Hyderabad Maisammaguda-Kompally
const MAP_CENTER: [number, number] = [17.5500, 78.4650];

// Custom icons using Leaflet divIcon templates (prevents missing PNG issues in Vite)
const createHubIcon = (color: string) => L.divIcon({
  className: 'custom-hub-icon',
  html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 10px ${color};"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const createCitizenIcon = (status: string) => {
  const color = status === 'Cached Offline' || status === 'Retrieved' ? '#ff9f43' : '#ff0844';
  const animationClass = status === 'Cached Offline' ? '' : 'distress-pulse-ping';
  return L.divIcon({
    className: `custom-citizen-icon ${animationClass}`,
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid #fff; box-shadow: 0 0 10px ${color};"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

const createTeamIcon = (type: string, heading: number) => {
  const teamColor = type === 'Vehicle' ? '#00c0ff' : type === 'Boat' ? '#ff9f43' : type === 'Medical' ? '#a18cd1' : '#ffb199';
  const iconText = type === 'Vehicle' ? '🚒' : type === 'Boat' ? '🚤' : type === 'Helicopter' ? '🚁' : '🏃';
  return L.divIcon({
    className: 'custom-team-icon',
    html: `
      <div style="transform: rotate(${heading}deg); transition: transform 0.2s ease;">
        <div style="background-color: ${teamColor}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 12px ${teamColor}; display: flex; align-items: center; justify-content: center; font-size: 13px;">
          ${iconText}
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

export default function MapView({ hubs, teams, beacons, blackoutActive, onPlaceDistress, onRebootSim }: MapViewProps) {
  const [placingActive, setPlacingActive] = useState(false);
  const [hudMessage, setHudMessage] = useState("Click 'Place Mock Distress' and select coordinates on map to test Haversine routing.");

  const MapEventsHandler = () => {
    useMapEvents({
      click(e) {
        if (!placingActive) return;
        setPlacingActive(false);
        setHudMessage("Click 'Place Mock Distress' and select coordinates on map to test Haversine routing.");
        onPlaceDistress(e.latlng.lat, e.latlng.lng);
      }
    });
    return null;
  };

  const geofences = [
    { name: 'Maisammaguda Lake Surge Zone', lat: 17.5580, lon: 78.4600, radius: 800, color: '#ff0844' },
    { name: 'Kompally Highway Hazard Zone', lat: 17.5380, lon: 78.4750, radius: 500, color: '#ff9f43' }
  ];

  return (
    <div className="relative flex-1 rounded-xl overflow-hidden border border-white/5 shadow-glass h-full">
      
      {/* Map Container */}
      <MapContainer
        center={MAP_CENTER}
        zoom={14}
        zoomControl={true}
        attributionControl={false}
        className={`w-full h-full ${blackoutActive ? 'blackout-grayscale' : ''}`}
        style={{ zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />
        
        {/* Click events handler */}
        <MapEventsHandler />

        {/* Hazard Geofences */}
        {geofences.map((gf, idx) => (
          <Circle
            key={idx}
            center={[gf.lat, gf.lon]}
            radius={gf.radius}
            pathOptions={{
              color: gf.color,
              fillColor: gf.color,
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '3, 6'
            }}
          >
            <Tooltip sticky><b>{gf.name}</b><br />Geofenced Danger Sector</Tooltip>
          </Circle>
        ))}

        {/* MSME Warehouses */}
        {hubs.map(hub => (
          <Marker
            key={hub.id}
            position={[hub.lat, hub.lon]}
            icon={createHubIcon(hub.color || '#00ff87')}
          >
            <Tooltip permanent={false}>
              <b>{hub.name}</b><br />Stock: {hub.food + hub.medicine} kits
            </Tooltip>
          </Marker>
        ))}

        {/* Citizens distress beacons */}
        {beacons.map(b => {
          if (b.status === 'Completed' || b.status === 'Rescued') return null;
          return (
            <Marker
              key={b.id}
              position={[b.lat, b.lon]}
              icon={createCitizenIcon(b.status)}
            >
              <Tooltip>
                <b>Distress ID: {b.id.substring(0,6)}</b><br />Type: {b.type}<br />Status: {b.status}
              </Tooltip>
            </Marker>
          );
        })}

        {/* Rescue units and range rings */}
        {teams.map(team => (
          <React.Fragment key={team.id}>
            <Marker
              position={[team.lat, team.lon]}
              icon={createTeamIcon(team.type, team.heading)}
            >
              <Tooltip><b>{team.name}</b><br />Status: {team.status}</Tooltip>
            </Marker>
            
            {/* 800m range ring */}
            <Circle
              center={[team.lat, team.lon]}
              radius={800}
              pathOptions={{
                color: blackoutActive ? '#ff9f43' : '#a18cd1',
                fillColor: blackoutActive ? '#ff9f43' : '#a18cd1',
                fillOpacity: blackoutActive ? 0.08 : 0.04,
                weight: 1,
                dashArray: blackoutActive ? '2, 4' : '4, 8'
              }}
            />
          </React.Fragment>
        ))}

        {/* Active route lines */}
        {beacons.map(b => {
          if (b.status === 'Dispatched' && b.assigned_team) {
            const team = teams.find(t => t.id === b.assigned_team);
            if (team) {
              return (
                <Polyline
                  key={b.id}
                  positions={[[team.lat, team.lon], [b.lat, b.lon]]}
                  pathOptions={{
                    color: '#00f2fe',
                    weight: 3,
                    dashArray: '4, 8',
                    opacity: 0.75
                  }}
                />
              );
            }
          }
          return null;
        })}

      </MapContainer>

      {/* Blackout Warning banner overlay */}
      {blackoutActive && (
        <div className="absolute top-0 left-0 w-full bg-warningOrange text-black py-2 px-4 text-[10px] font-extrabold tracking-wider text-center z-[1000] shadow-md flex items-center justify-center gap-2">
          <AlertTriangle size={12} className="animate-bounce" />
          <span>POWER GRID FAILURE ACTIVE • CELL TOWERS DOWN • LORAWAN MESH FALLBACK PROTOCOLS IN PROGRESS</span>
        </div>
      )}

      {/* Map EOC controller Console */}
      <div className="absolute bottom-4 right-4 bg-[#080c16]/90 border border-white/5 rounded-xl shadow-glass p-3.5 z-[1000] w-[240px] select-none backdrop-blur-md">
        <h3 className="font-heading font-extrabold text-[11px] text-slate-400 uppercase tracking-wider mb-2">SIMULATION RADAR</h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              setPlacingActive(!placingActive);
              setHudMessage(placingActive ? "Click 'Place Mock Distress' and select coordinates on map to test Haversine routing." : "Radar Active: Click anywhere on the map grids to place distress beacon coordinates.");
            }}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-heading font-semibold text-[11.5px] text-white transition-all duration-200 ${
              placingActive 
                ? 'bg-warningOrange hover:bg-warningOrange/90 animate-pulse' 
                : 'bg-emergencyRed hover:bg-emergencyRed/90 shadow-[0_4px_12px_rgba(255,8,68,0.2)]'
            }`}
          >
            <Crosshair size={13} />
            <span>{placingActive ? 'Select Map Coords' : 'Place Mock Distress'}</span>
          </button>
          <button
            onClick={onRebootSim}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg font-heading font-semibold text-[11.5px] bg-[#1e293b] border border-white/5 text-white hover:border-neonCyan transition-all duration-200"
          >
            <RotateCcw size={13} />
            <span>Reboot Simulator</span>
          </button>
        </div>
        <p className="text-[9px] text-slate-500 leading-normal mt-2.5" id="hud-instructions">{hudMessage}</p>
      </div>

    </div>
  );
}
