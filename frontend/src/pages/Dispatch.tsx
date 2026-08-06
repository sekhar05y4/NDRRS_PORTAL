import React from 'react';
import { Battery, ShieldAlert, Navigation, Compass, Signal } from 'lucide-react';

interface DispatchProps {
  teams: any[];
}

export default function Dispatch({ teams }: DispatchProps) {
  return (
    <div className="grid grid-cols-5 gap-4 h-full tab-transition select-none">
      
      {/* Responders Deck (Left panel) */}
      <div className="col-span-3 bg-[#0d1425] border border-white/5 p-5 rounded-xl flex flex-col h-full shadow-glass backdrop-blur-md">
        <div className="border-b border-white/5 pb-3">
          <h2 className="font-heading font-extrabold text-[16px] text-white">Emergency Dispatch Responders</h2>
          <p className="text-[12px] text-slate-400">Live operational telemetry feed of SDRF emergency deployment assets.</p>
        </div>
        <div className="flex-1 overflow-y-auto mt-4 pr-1 flex flex-col gap-3">
          {teams.map(t => {
            let typeIcon = '🚒';
            if (t.type === 'Boat') typeIcon = '🚤';
            if (t.type === 'Helicopter') typeIcon = '🚁';
            if (t.type === 'Foot Patrol') typeIcon = '🏃';

            let statusStyle = 'bg-slate-500/10 border-slate-500/20 text-slate-400';
            if (t.status === 'Idle') statusStyle = 'bg-safeGreen/10 border-safeGreen/20 text-safeGreen';
            if (t.status === 'Dispatched') statusStyle = 'bg-purple/10 border-purple/20 text-purple';
            if (t.status === 'Rescuing') statusStyle = 'bg-neonCyan/10 border-neonCyan/20 text-neonCyan';

            return (
              <div key={t.id} className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col gap-3 hover:border-neonCyan transition-all duration-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{typeIcon}</span>
                    <h4 className="font-heading font-extrabold text-[13.5px] text-white">{t.name}</h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${statusStyle}`}>{t.status}</span>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-[12px] text-slate-400">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1"><Battery size={11} /> Battery</span>
                    <span className={`font-bold ${t.battery < 25 ? 'text-emergencyRed' : t.battery < 60 ? 'text-warningOrange' : 'text-safeGreen'}`}>
                      {t.battery}%
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1"><Signal size={11} /> Signal</span>
                    <span className="font-bold text-white">{t.signal_strength}% ({t.comm_mode})</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1"><Compass size={11} /> Heading</span>
                    <span className="font-bold text-white">{t.heading.toFixed(0)}&deg; ({t.speed} km/h)</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1"><Navigation size={11} /> ETA</span>
                    <span className="font-bold text-white">{t.eta}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dispatch Math & Operations (Right panel) */}
      <div className="col-span-2 bg-[#0d1425] border border-white/5 p-5 rounded-xl flex flex-col h-full shadow-glass backdrop-blur-md">
        <div className="border-b border-white/5 pb-3">
          <h2 className="font-heading font-extrabold text-[16px] text-white">Spatial Allocation Computations</h2>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          
          {/* Haversine card */}
          <div className="bg-white/2 border border-white/5 p-4 rounded-xl flex flex-col gap-3">
            <h4 className="font-heading font-extrabold text-[13px] text-neonCyan flex items-center gap-2">
              <ShieldAlert size={14} /> Haversine Spherical Distance Engine
            </h4>
            <div className="bg-black/45 border-l-3 border-neonCyan p-3 rounded font-mono text-[11px] text-neonCyan text-center">
              d = 2R · arcsin( &radic;( sin²(&Delta;&phi;/2) + cos(&phi;1)·cos(&phi;2)·sin²(&Delta;&lambda;/2) ) )
            </div>
            <p className="text-[11.5px] text-slate-400 leading-normal">
              Resolves great-circle distance between coordinate indices on a sphere. During communication blackouts, calculations execute client-side inside Service Worker runtimes, matching citizen positions to rescue units automatically.
            </p>
          </div>

          {/* AI optimal routes */}
          <div className="bg-white/2 border border-white/5 p-4 rounded-xl flex flex-col gap-2.5">
            <h4 className="font-heading font-extrabold text-[13px] text-safeGreen">
              AI Priority & Routing Optimization
            </h4>
            <p className="text-[11.5px] text-slate-400 leading-normal">
              Estimates severity scoring (0.0 to 1.0) on distress beacons via keyword parser models, optimizing response times and resource allocations:
            </p>
            <div className="bg-black/45 border border-white/5 p-3 rounded font-mono text-[10.5px] text-safeGreen overflow-x-auto">
              {`SELECT id, name, type FROM rescue_teams
WHERE status = 'Idle'
ORDER BY ST_Distance(location, ST_Point(lon, lat)) * weight
LIMIT 1;`}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
