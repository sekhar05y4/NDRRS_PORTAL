import React, { useState, useEffect } from 'react';
import { ShieldAlert, PhoneCall, AlertTriangle, CloudRain, Wind, Layers, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { fetchLiveWeather, WeatherData } from '../services/weather';
import CitizenSOS from '../pages/citizen/CitizenSOS';

interface LandingPageProps {
  hubs: any[];
  beacons: any[];
  geofences: any[];
  blackoutActive: boolean;
  onSubmitSOS: (beaconData: any) => void;
}

const MAP_CENTER: [number, number] = [17.5500, 78.4650];

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

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

const createPulsatingMarker = () => L.divIcon({
  className: 'pulsating-citizen-gps',
  html: `
    <div style="position: relative; width: 14px; height: 14px;">
      <div style="background-color: #00f2fe; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 10px #00f2fe; z-index: 10;"></div>
      <div style="position: absolute; top: -5px; left: -5px; width: 24px; height: 24px; border-radius: 50%; background-color: rgba(0, 242, 254, 0.4); animation: ping 1.5s infinite; border: 1px solid #00f2fe;"></div>
    </div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// Custom icons using divIcon to prevent missing asset errors
const createHubIcon = () => L.divIcon({
  className: 'custom-hub-icon',
  html: `<div style="background-color: #00ff87; width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid #fff; box-shadow: 0 0 8px #00ff87;"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

const createCitizenIcon = (status: string) => {
  const color = status === 'Cached Offline' || status === 'Retrieved' ? '#ff9f43' : '#ff0844';
  return L.divIcon({
    className: 'custom-citizen-icon distress-pulse-ping',
    html: `<div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%; border: 1px solid #fff; box-shadow: 0 0 8px ${color};"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5]
  });
};

export default function LandingPage({ hubs, beacons, geofences, blackoutActive, onSubmitSOS }: LandingPageProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [activeCitizenCoords, setActiveCitizenCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (activeCitizenCoords) {
      fetchLiveWeather(activeCitizenCoords[0], activeCitizenCoords[1]).then(data => setWeather(data));
    } else {
      fetchLiveWeather().then(data => setWeather(data));
    }
  }, [activeCitizenCoords]);

  const helplines = [
    { name: 'National Emergency Number', number: '112' },
    { name: 'NDRF Control Room Help', number: '011-24363260' },
    { name: 'District EOC Helpline', number: '1077' },
    { name: 'Disaster Management', number: '1070' }
  ];

  return (
    <div className="min-h-screen bg-[#080c16] text-[#f8fafc] flex flex-col font-body select-none overflow-y-auto max-h-screen pr-1">
      
      {/* 1. Official Government Header */}
      <div className="bg-[#0f172a]/95 border-b border-white/5 py-2.5 px-6 flex justify-between items-center z-10 backdrop-blur-md sticky top-0 shadow-md">
        <div className="flex items-center gap-3">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
            alt="Emblem of India" 
            className="h-12 w-auto brightness-200"
          />
          <div className="leading-tight">
            <span className="text-[9px] tracking-widest text-slate-400 font-bold block uppercase">Ministry of Home Affairs</span>
            <h1 className="font-heading font-extrabold text-[14px] text-white">NDRRS — NATIONAL DISASTER RESPONSE AND RESCUE SYSTEM</h1>
            <span className="text-[8px] uppercase font-semibold text-slate-500">NDMA &amp; Ministry of Home Affairs Operational Intelligence Platform</span>
          </div>
        </div>
        <div>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/b/b3/NDMA_Logo.png" 
            alt="NDMA Crest" 
            className="h-10 w-auto"
          />
        </div>
      </div>

      {/* 2. Emergency Alert Ticker */}
      <div className="bg-yellow-400 text-black py-1.5 px-6 font-semibold text-[11px] overflow-hidden flex items-center gap-2 border-y border-yellow-500 z-10">
        <AlertTriangle size={13} className="flex-shrink-0 animate-bounce text-black" />
        <div className="w-full relative whitespace-nowrap overflow-hidden">
          <div className="inline-block animate-[marquee_28s_linear_infinite]">
            [ALERT WARNING] Cyclone warnings active. Heavy monsoon rainfall exceeding 150mm predicted across the Maisammaguda corridor. low-lying evacuation safe points marked green. Standard response networks active.
          </div>
        </div>
      </div>

      {/* 3. Hero Command Info Section */}
      <div 
        className="relative bg-cover bg-center py-10 px-8 flex flex-col items-center text-center justify-center border-b border-white/5 shadow-glass"
        style={{ backgroundImage: "linear-gradient(rgba(8,12,22,0.85), rgba(8,12,22,0.92)), url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#080c16] via-transparent to-transparent"></div>
        <div className="z-10 max-w-2xl flex flex-col items-center gap-3">
          <h2 className="font-heading font-extrabold text-2xl text-white tracking-tight">
            National Disaster Response and Rescue System (NDRRS)
          </h2>
          <p className="text-[12.5px] text-slate-300 max-w-lg leading-relaxed">
            Coordinating relief efforts across districts. Real-time geofenced zones updates, weather forecast widgets, and offline distress caching.
          </p>
        </div>
      </div>

      {/* 4. Unified Public Operations Dashboard */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-5 py-6 grid grid-cols-5 gap-5 min-h-0 overflow-hidden">
        
        {/* Left Side: Weather & Helplines */}
        <div className="col-span-1 flex flex-col gap-4 overflow-y-auto pr-1">
          
          {/* Live Weather */}
          {weather && (
            <div className="bg-[#0d1425] border border-white/5 rounded-xl p-4 shadow-glass select-none flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Live Weather Feed</span>
                {weather.locationName && (
                  <span className="text-[10px] text-neonCyan font-mono bg-neonCyan/10 px-1.5 py-0.5 rounded truncate max-w-[120px]">{weather.locationName}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <CloudRain className="text-neonCyan" size={20} />
                <span className="text-[13px] font-bold text-white">Rain: {weather.rain}mm</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="text-warningOrange" size={20} />
                <span className="text-[13px] font-bold text-white">Wind: {weather.windSpeed} km/h</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Temp: {weather.temperature}&deg;C</span>
            </div>
          )}

          {/* Emergency Helpline */}
          <div className="bg-[#0d1425] border border-white/5 p-4 rounded-xl flex flex-col gap-3 shadow-glass">
            <h4 className="font-heading font-extrabold text-[12.5px] text-white uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall size={13} /> District Helplines
            </h4>
            <div className="flex flex-col gap-2">
              {helplines.map(h => (
                <div key={h.name} className="bg-white/2 border border-white/5 rounded-lg p-2.5 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-medium">{h.name}</span>
                  <a href={`tel:${h.number}`} className="text-neonCyan font-mono font-bold hover:underline">{h.number}</a>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-neonCyan/5 border border-neonCyan/20 rounded-xl p-3 text-[10.5px] text-slate-400 leading-normal">
            <h5 className="font-bold text-white mb-0.5">EOC Broadcast</h5>
            Drawn danger polygons sync automatically to public maps without page reload.
          </div>
        </div>

        {/* Center: Public Interactive Map */}
        <div className="col-span-2 flex flex-col gap-3 h-full min-h-0">
          <div className="bg-[#0d1425] border border-white/5 px-4 py-2 rounded-xl flex justify-between items-center select-none shadow-sm flex-shrink-0">
            <span className="font-heading font-extrabold text-[13px] text-white flex items-center gap-2"><Layers size={14} /> District Safety Grid Overlay</span>
            <span className="text-[10.5px] text-slate-400 font-mono">Calibrated: Maisammaguda</span>
          </div>

          <div className="flex-1 rounded-xl overflow-hidden border border-white/5 relative shadow-glass min-h-[300px]">
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
              style={{ zIndex: 1, pointerEvents: 'auto', height: '100%', width: '100%', minHeight: '400px' }}
            >
              <MapInitializer />
              {activeCitizenCoords && (
                <>
                  <ChangeView center={activeCitizenCoords} />
                  <Marker position={activeCitizenCoords} icon={createPulsatingMarker()}>
                    <Tooltip permanent direction="top">Your Live GPS Lock</Tooltip>
                  </Marker>
                </>
              )}
              
              {/* Drawn Geofence Polygons */}
              {geofences.map(gf => (
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
                  <Tooltip sticky>
                    <b>{gf.name}</b><br />Type: {gf.type}
                  </Tooltip>
                </Polyline>
              ))}

              {/* Public Relief Camps / Hubs */}
              {hubs.map(hub => (
                <Marker key={hub.id} position={[hub.lat, hub.lon]} icon={createHubIcon()}>
                  <Tooltip><b>{hub.name}</b><br />Evacuation Shelter &amp; Relief Hub</Tooltip>
                </Marker>
              ))}

              {/* Active Beacons */}
              {beacons.map(b => {
                if (b.status === 'Completed' || b.status === 'Rescued') return null;
                return (
                  <Marker key={b.id} position={[b.lat, b.lon]} icon={createCitizenIcon(b.status)}>
                    <Tooltip><b>Active SOS Beacon</b><br />Status: {b.status}</Tooltip>
                  </Marker>
                );
              })}

              {/* pulsating active GPS marker */}
              {activeCitizenCoords && (
                <Marker position={activeCitizenCoords} icon={createPulsatingMarker()}>
                  <Tooltip sticky><b>Current GPS Lock</b></Tooltip>
                </Marker>
              )}

            </MapContainer>
          </div>
        </div>

        {/* Right Side: Embedded Citizen SOS Reporting & Active Trackers */}
        <div className="col-span-2 h-full min-h-0 flex flex-col overflow-hidden">
          <CitizenSOS 
            onSubmitSOS={onSubmitSOS} 
            myBeacons={beacons.filter(b => b.id.startsWith('beacon_') || b.id.startsWith('offline_'))} 
            blackoutActive={blackoutActive}
            onLocationChange={(la, lo) => setActiveCitizenCoords([parseFloat(la), parseFloat(lo)])}
          />
        </div>

      </div>

      {/* Footer copyright */}
      <footer className="bg-[#0f172a]/95 border-t border-white/5 py-4 px-6 flex justify-between items-center text-[10.5px] text-slate-500 z-10 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
            alt="Emblem of India" 
            className="h-6 w-auto brightness-200 opacity-60"
          />
          <span>© 2026 National Disaster Response and Rescue System (NDRRS). All Rights Reserved.</span>
        </div>
        <div className="flex gap-4">
          <span>NDMA &amp; Ministry of Home Affairs Operational Intelligence Platform</span>
        </div>
      </footer>

    </div>
  );
}
