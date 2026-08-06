import React, { useState } from 'react';
import { ShieldCheck, LogOut, Navigation, AlertTriangle, AlertCircle, Warehouse, Users, HeartPulse } from 'lucide-react';
import CitizenSOS from '../pages/citizen/CitizenSOS';

interface CitizenPortalProps {
  onLogout: () => void;
  beacons: any[];
  hubs: any[];
  onSubmitSOS: (beaconData: any) => void;
  blackoutActive: boolean;
}

export default function CitizenPortal({ onLogout, beacons, hubs, onSubmitSOS, blackoutActive }: CitizenPortalProps) {
  const [activeTab, setActiveTab] = useState('sos');

  // Compute total facilities capacities
  const totals = {
    food: hubs.reduce((sum, h) => sum + h.food, 0),
    medicine: hubs.reduce((sum, h) => sum + h.medicine, 0),
    water: hubs.reduce((sum, h) => sum + h.water, 0)
  };

  const menu = [
    { id: 'sos', label: 'Report distress SOS' },
    { id: 'shelters', label: 'Safe Shelters & Hospitals' },
    { id: 'guide', label: 'Disaster Guide' }
  ];

  return (
    <div className="min-h-screen bg-[#080c16] text-white flex flex-col font-body select-none">
      
      {/* Citizen Header */}
      <header className="bg-[#0f172a] border-b border-white/5 py-3 px-6 flex justify-between items-center z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-safeGreen/10 border border-safeGreen/20 w-8 h-8 rounded-lg flex items-center justify-center text-safeGreen">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-[14.5px] text-white">Citizen Safety Portal</h2>
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">State Response Control</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Location mock */}
          <div className="bg-white/2 border border-white/5 px-3 py-1 rounded-lg text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <Navigation size={12} className="text-neonCyan animate-pulse" />
            <span>Maisammaguda Corridor: <code>17.5500, 78.4650</code></span>
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

      {/* Main Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex gap-6 min-h-0">
        
        {/* Navigation Column */}
        <aside className="w-[200px] flex flex-col gap-4 flex-shrink-0">
          <nav className="flex flex-col gap-1">
            {menu.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-heading font-semibold text-[13px] transition-all border ${
                  activeTab === item.id 
                    ? 'text-safeGreen bg-safeGreen/10 border-safeGreen/20 shadow-sm'
                    : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Blackout warning */}
          {blackoutActive && (
            <div className="border border-warningOrange/25 bg-warningOrange/5 rounded-xl p-3 text-[11px] leading-relaxed text-warningOrange">
              <AlertTriangle size={14} className="mb-1" />
              Cell towers disabled. All SOS updates cache locally on browser IndexedDB database until networks reconcile.
            </div>
          )}
        </aside>

        {/* Tab view frame */}
        <main className="flex-1 bg-[#0d1425]/45 border border-white/5 rounded-2xl shadow-glass p-5 min-w-0">
          
          {activeTab === 'sos' && (
            <CitizenSOS 
              onSubmitSOS={onSubmitSOS} 
              myBeacons={beacons.filter(b => b.id.startsWith('beacon_') || b.id.startsWith('offline_'))} 
              blackoutActive={blackoutActive}
            />
          )}

          {activeTab === 'shelters' && (
            <div className="flex flex-col gap-4 tab-transition">
              <div className="border-b border-white/5 pb-2">
                <h3 className="font-heading font-extrabold text-[15px] text-white">Safe District Infrastructure Facilities</h3>
                <p className="text-[12px] text-slate-400">Capacity and stock gauges index updated via EOC center logs.</p>
              </div>

              {/* Resource grid widgets */}
              <div className="grid grid-cols-3 gap-4 text-center select-none">
                <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-1">
                  <Warehouse className="text-neonCyan" size={20} />
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Food Packages</span>
                  <span className="text-white text-lg font-heading font-extrabold">{totals.food} units</span>
                </div>
                <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-1">
                  <HeartPulse className="text-safeGreen" size={20} />
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Medicine Stock</span>
                  <span className="text-white text-lg font-heading font-extrabold">{totals.medicine} kits</span>
                </div>
                <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-1">
                  <Users className="text-purple" size={20} />
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Relief Water</span>
                  <span className="text-white text-lg font-heading font-extrabold">{totals.water} liters</span>
                </div>
              </div>

              {/* Shelters lists */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                  <h4 className="font-heading font-extrabold text-[13px] text-white">Maisammaguda College Shelter</h4>
                  <div className="text-[12px] text-slate-400">Capacity: 120 / 300 Evacuees</div>
                  <div className="w-100 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-safeGreen" style={{ width: '40%' }}></div>
                  </div>
                </div>
                <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                  <h4 className="font-heading font-extrabold text-[13px] text-white">Gundlapochampally School Shelter</h4>
                  <div className="text-[12px] text-slate-400">Capacity: 250 / 500 Evacuees</div>
                  <div className="w-100 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-safeGreen" style={{ width: '50%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="flex flex-col gap-4 tab-transition text-[12px] leading-relaxed text-slate-400">
              <div className="border-b border-white/5 pb-2">
                <h3 className="font-heading font-extrabold text-[15px] text-white">Emergency Response Guidelines</h3>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <AlertCircle className="text-safeGreen flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <h5 className="font-bold text-white mb-0.5">Cyclone / Storm Preparedness</h5>
                    Disconnect electricity lines, secure windows and doors, keep dry ration packages at hand, and follow satellite warnings.
                  </div>
                </div>
                <div className="flex gap-3">
                  <AlertCircle className="text-warningOrange flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <h5 className="font-bold text-white mb-0.5">Flash Flood Outbreaks</h5>
                    Evacuate to elevated shelters, avoid crossing water runoffs on roads, keep medical first-aid kits accessible.
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

      </div>
    </div>
  );
}
