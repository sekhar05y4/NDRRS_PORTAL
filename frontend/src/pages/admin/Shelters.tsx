import React, { useState, useEffect } from 'react';
import { MapContainer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SquareActivity, MapPin } from 'lucide-react';

interface SheltersProps {
  hubs: any[];
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

const SHELTERS_DATA = [
  { id: 'sh_1', name: 'Maisammaguda College Shelter', sector: 'Malla Reddy Corridor', lat: 17.5590, lon: 78.4590, occupied: 120, capacity: 300, type: 'Shelter', foodKits: 150, medicineKits: 80 },
  { id: 'sh_2', name: 'Gundlapochampally School Shelter', sector: 'Industrial Corridor', lat: 17.5720, lon: 78.4810, occupied: 250, capacity: 500, type: 'Shelter', foodKits: 300, medicineKits: 150 },
  { id: 'sh_3', name: 'Kompally General Hospital', sector: 'NH-44 Highway Corridor', lat: 17.5400, lon: 78.4790, occupied: 85, capacity: 100, type: 'Hospital', foodKits: 200, medicineKits: 400 },
  { id: 'sh_4', name: 'Dulapally Forest Camp', sector: 'Dulapally Reserve Corridor', lat: 17.5430, lon: 78.4460, occupied: 45, capacity: 150, type: 'Shelter', foodKits: 90, medicineKits: 50 }
];

const createShelterIcon = (type: string) => L.divIcon({
  className: 'custom-shelter-icon',
  html: `<div style="background-color: ${type === 'Hospital' ? '#a18cd1' : '#00ff87'}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 10px #000;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

export default function Shelters({ hubs }: SheltersProps) {
  const [selectedItem, setSelectedItem] = useState<any>(SHELTERS_DATA[0]);

  // Recenter map when selected item changes
  function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
      map.setView(center, 14);
    }, [center, map]);
    return null;
  }

  return (
    <div className="grid grid-cols-5 gap-4 h-full tab-transition select-none overflow-hidden text-[12.5px]">
      
      {/* Table (Left column) */}
      <div className="col-span-3 bg-[#0d1425] border border-white/5 p-5 rounded-xl flex flex-col h-full shadow-glass">
        <div className="border-b border-white/5 pb-3">
          <h2 className="font-heading font-extrabold text-[16px] text-white flex items-center gap-2">
            <SquareActivity size={18} className="text-neonCyan" /> Active Shelters &amp; Emergency Hospitals
          </h2>
          <p className="text-[12px] text-slate-400">District emergency safety registry gauges.</p>
        </div>

        <div className="flex-grow overflow-y-auto mt-4 pr-1">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 text-slate-500 font-heading font-bold text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Name / Type</th>
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3">Beds occupancy</th>
                <th className="py-2.5 px-3">Inventory stock</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 divide-y divide-white/5">
              {SHELTERS_DATA.map(s => {
                const percent = ((s.occupied / s.capacity) * 100).toFixed(0);
                return (
                  <tr 
                    key={s.id} 
                    onClick={() => setSelectedItem(s)}
                    className={`hover:bg-white/2 cursor-pointer transition-colors ${selectedItem?.id === s.id ? 'bg-white/5 text-white' : ''}`}
                  >
                    <td className="py-3 px-3 leading-tight">
                      <strong className="block">{s.name}</strong>
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border inline-block mt-1 ${
                        s.type === 'Hospital' ? 'border-purple/35 text-purple bg-purple/10' : 'border-safeGreen/35 text-safeGreen bg-safeGreen/10'
                      }`}>{s.type}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{s.sector}</td>
                    <td className="py-3 px-3 w-[150px]">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span>{s.occupied} / {s.capacity} Beds</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${parseInt(percent) > 80 ? 'bg-emergencyRed' : 'bg-safeGreen'}`} style={{ width: `${percent}%` }}></div>
                      </div>
                    </td>
                    <td className="py-3 px-3 leading-tight text-[11px]">
                      Food: <strong className="text-slate-200">{s.foodKits}</strong><br />
                      Meds: <strong className="text-slate-200">{s.medicineKits}</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Map (Right column) */}
      <div className="col-span-2 bg-[#0d1425] border border-white/5 p-4 rounded-xl flex flex-col h-full shadow-glass overflow-hidden">
        <h3 className="font-heading font-extrabold text-[13.5px] text-white border-b border-white/5 pb-2 mb-3">
          Evac Camp Map
        </h3>

        <div className="flex-grow rounded-xl overflow-hidden border border-white/5 relative min-h-[200px]">
          <MapContainer
            center={selectedItem ? [selectedItem.lat, selectedItem.lon] : [17.5500, 78.4650]}
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
            {selectedItem && <ChangeView center={[selectedItem.lat, selectedItem.lon]} />}
            {SHELTERS_DATA.map(s => (
              <Marker 
                key={s.id} 
                position={[s.lat, s.lon]} 
                icon={createShelterIcon(s.type)}
                eventHandlers={{
                  click: () => setSelectedItem(s)
                }}
              >
                <Tooltip>
                  <b>{s.name}</b><br />
                  Occupancy: {s.occupied} / {s.capacity}
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {selectedItem && (
          <div className="mt-3.5 bg-white/2 border border-white/5 p-3 rounded-xl flex flex-col gap-1.5">
            <h4 className="font-heading font-extrabold text-[13px] text-white flex items-center gap-1.5">
              <MapPin size={14} className="text-neonCyan animate-bounce" /> {selectedItem.name}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] leading-tight text-slate-400">
              <div>Type: <strong className="text-slate-300">{selectedItem.type}</strong></div>
              <div>Beds Available: <strong className="text-slate-300">{selectedItem.capacity - selectedItem.occupied}</strong></div>
              <div>Food Packs: <strong className="text-slate-300">{selectedItem.foodKits} units</strong></div>
              <div>Medicine kits: <strong className="text-slate-300">{selectedItem.medicineKits} kits</strong></div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
