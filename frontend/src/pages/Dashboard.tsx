import React from 'react';
import { AlertCircle, ShieldAlert, Award, Radio } from 'lucide-react';

interface DashboardProps {
  stats: {
    trapped: number;
    rescued: number;
    activeTeams: string;
    offlineCount: number;
  };
  hubs: any[];
  logs: any[];
  onViewChange: (view: string, filter?: string) => void;
}

export default function Dashboard({ stats, hubs, logs, onViewChange }: DashboardProps) {
  // Compute total inventory quantity
  const totalStock = hubs.reduce((sum, h) => sum + h.food + h.medicine + h.blankets + h.water + h.generators + h.fuel, 0);

  const stockItems = [
    { label: 'Food Packets', qty: hubs.reduce((sum, h) => sum + h.food, 0), max: 3000, color: 'bg-neonCyan' },
    { label: 'Medical Kits', qty: hubs.reduce((sum, h) => sum + h.medicine, 0), max: 1500, color: 'bg-safeGreen' },
    { label: 'Blankets', qty: hubs.reduce((sum, h) => sum + h.blankets, 0), max: 1200, color: 'bg-purple' },
    { label: 'Water Stock', qty: hubs.reduce((sum, h) => sum + h.water, 0), max: 4000, color: 'bg-neonCyan' },
    { label: 'Generators', qty: hubs.reduce((sum, h) => sum + h.generators, 0), max: 200, color: 'bg-warningOrange' },
    { label: 'Fuel (L)', qty: hubs.reduce((sum, h) => sum + h.fuel, 0), max: 6000, color: 'bg-warningOrange' }
  ];

  return (
    <div className="flex flex-col gap-4 tab-transition h-full overflow-y-auto pr-1">
      
      {/* 1. Statistics Row */}
      <div className="grid grid-cols-4 gap-4">
        
        {/* Trapped */}
        <button
          onClick={() => onViewChange('registry', 'Awaiting')}
          className="bg-[#0d1425] border-l-4 border-emergencyRed p-4 rounded-r-xl flex items-center gap-4 shadow-glass hover:bg-white/5 transition-all text-left focus:outline-none"
        >
          <div className="w-11 h-11 bg-emergencyRed/12 rounded-lg flex items-center justify-center text-emergencyRed border border-emergencyRed/25 flex-shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <span className="text-emergencyRed text-2xl font-heading font-extrabold block leading-none">{stats.trapped}</span>
            <span className="text-[11px] text-slate-400">Awaiting Rescue</span>
          </div>
        </button>

        {/* Rescued */}
        <button
          onClick={() => onViewChange('registry', 'Rescued')}
          className="bg-[#0d1425] border-l-4 border-safeGreen p-4 rounded-r-xl flex items-center gap-4 shadow-glass hover:bg-white/5 transition-all text-left focus:outline-none"
        >
          <div className="w-11 h-11 bg-safeGreen/12 rounded-lg flex items-center justify-center text-safeGreen border border-safeGreen/25 flex-shrink-0">
            <Award size={20} />
          </div>
          <div>
            <span className="text-safeGreen text-2xl font-heading font-extrabold block leading-none">{stats.rescued}</span>
            <span className="text-[11px] text-slate-400">Evacuated / Rescued</span>
          </div>
        </button>

        {/* Active teams */}
        <button
          onClick={() => onViewChange('dispatch')}
          className="bg-[#0d1425] border-l-4 border-neonCyan p-4 rounded-r-xl flex items-center gap-4 shadow-glass hover:bg-white/5 transition-all text-left focus:outline-none"
        >
          <div className="w-11 h-11 bg-neonCyan/12 rounded-lg flex items-center justify-center text-neonCyan border border-neonCyan/25 flex-shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <span className="text-neonCyan text-2xl font-heading font-extrabold block leading-none">{stats.activeTeams}</span>
            <span className="text-[11px] text-slate-400">Active Rescue Teams</span>
          </div>
        </button>

        {/* Offline cached */}
        <button
          onClick={() => onViewChange('registry', 'Offline')}
          className="bg-[#0d1425] border-l-4 border-warningOrange p-4 rounded-r-xl flex items-center gap-4 shadow-glass hover:bg-white/5 transition-all text-left focus:outline-none"
        >
          <div className="w-11 h-11 bg-warningOrange/12 rounded-lg flex items-center justify-center text-warningOrange border border-warningOrange/25 flex-shrink-0">
            <Radio size={20} />
          </div>
          <div>
            <span className="text-warningOrange text-2xl font-heading font-extrabold block leading-none">{stats.offlineCount}</span>
            <span className="text-[11px] text-slate-400">Offline Cached Beacons</span>
          </div>
        </button>

      </div>

      {/* 2. Middle Row (Map preview link & Reserves progress) */}
      <div className="grid grid-cols-3 gap-4 min-h-[300px]">
        
        {/* Map Preview Banner Card */}
        <div className="col-span-2 bg-[#0d1425] border border-white/5 p-4 rounded-xl flex flex-col justify-between shadow-glass relative overflow-hidden group">
          <div className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: "url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/78.465,17.55,12,0/500x300?access_token=mock')" }}></div>
          
          <div className="flex justify-between items-center z-10">
            <h3 className="font-heading font-extrabold text-[14px] text-white">Live Operations Grid Sector</h3>
            <button 
              onClick={() => onViewChange('map')}
              className="text-neonCyan text-[11.5px] font-heading font-semibold hover:underline"
            >
              Open Full Map Camera &rarr;
            </button>
          </div>
          
          <div className="z-10 py-6">
            <h4 className="text-lg font-heading font-bold text-slate-200">Sector: Hyderabad Maisammaguda-Kompally</h4>
            <p className="text-[12px] text-slate-400 max-w-md mt-1">Real-time GPS positioning, flood boundaries geofencing checks, and wireless mesh networks recovery active.</p>
          </div>
          
          <div className="flex gap-4 z-10 border-t border-white/5 pt-3 text-[11.5px] text-slate-400">
            <span>MSME Nodes: <strong className="text-safeGreen">{hubs.length} Active</strong></span>
            <span>Warning Sectors: <strong className="text-emergencyRed">2 Monitored</strong></span>
          </div>
        </div>

        {/* Reserves Levels */}
        <div className="bg-[#0d1425] border border-white/5 p-4 rounded-xl flex flex-col gap-3 shadow-glass">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="font-heading font-extrabold text-[14px] text-white">Emergency Reserves</h3>
            <span className="text-[10px] font-bold bg-neonCyan/10 text-neonCyan border border-neonCyan/20 px-2 py-0.5 rounded">
              {totalStock.toLocaleString()} UNITS
            </span>
          </div>
          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[220px]">
            {stockItems.map(item => {
              const fillPct = (item.qty / item.max) * 100;
              const isDanger = fillPct < 25;
              const isWarn = fillPct < 60;
              return (
                <div key={item.label} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11.5px]">
                    <span className="font-semibold text-slate-300">{item.label}</span>
                    <span className={`font-mono font-bold ${isDanger ? 'text-emergencyRed' : isWarn ? 'text-warningOrange' : 'text-safeGreen'}`}>
                      {item.qty} / {item.max}
                    </span>
                  </div>
                  <div className="w-100 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.color} ${isDanger ? 'bg-emergencyRed' : isWarn ? 'bg-warningOrange' : ''}`}
                      style={{ width: `${fillPct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. Bottom Row: System Log Timeline */}
      <div className="bg-[#0d1425] border border-white/5 p-4 rounded-xl flex flex-col gap-3 shadow-glass flex-1 min-h-[180px]">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <h3 className="font-heading font-extrabold text-[14px] text-white">Command Timeline Log Feed</h3>
          <span className="text-[10.5px] font-bold text-slate-500 font-mono">Live WebSocket Feed</span>
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[140px] font-mono text-[10.5px]">
          {logs.map((log, idx) => {
            let color = 'border-neonCyan text-neonCyan';
            if (log.level === 'sql') color = 'border-safeGreen text-safeGreen';
            if (log.level === 'warning') color = 'border-warningOrange text-warningOrange';
            if (log.level === 'danger') color = 'border-emergencyRed text-emergencyRed';

            return (
              <div key={idx} className={`border-l-2 pl-3 py-0.5 leading-normal ${color}`}>
                [{log.timestamp.substring(11, 19)}] {log.event}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
