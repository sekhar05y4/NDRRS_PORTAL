import React from 'react';
import { CloudRain, Wind, AlertTriangle, Thermometer, Activity } from 'lucide-react';

export default function Weather() {
  const alerts = [
    { district: 'Maisammaguda Basin', status: 'Red Alert', text: 'Water surge level exceeded safety threshold by 1.2m. Flooding warning in low-lying residential sectors.', color: 'text-emergencyRed border-emergencyRed/25 bg-emergencyRed/5' },
    { district: 'Kompally NH-44 Highway', status: 'Orange Warning', text: 'Heavy rainfall and severe crosswinds up to 65 km/h. High-profile trucks advised to slow down.', color: 'text-warningOrange border-warningOrange/25 bg-warningOrange/5' },
    { district: 'Gundlapochampally Sector', status: 'Yellow Watch', text: 'Lightning strike activity reported in vicinity. Resident teams advised to seek shelter indoors.', color: 'text-neonCyan border-neonCyan/25 bg-neonCyan/5' }
  ];

  return (
    <div className="grid grid-cols-5 gap-4 h-full tab-transition select-none">
      
      {/* Weather stats grid (Left panel) */}
      <div className="col-span-3 flex flex-col gap-4">
        
        {/* Top metrics grid */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Rainfall card */}
          <div className="bg-[#0d1425] border border-white/5 p-4 rounded-xl flex items-center gap-4 shadow-glass">
            <div className="w-12 h-12 bg-neonCyan/12 rounded-xl flex items-center justify-center text-neonCyan border border-neonCyan/20">
              <CloudRain size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-[11px] font-heading font-semibold uppercase tracking-wider block">Rainfall Index</span>
              <span className="text-white text-lg font-heading font-extrabold block">142.5 mm</span>
              <span className="text-slate-500 text-[10px]">Over last 24h</span>
            </div>
          </div>

          {/* Wind speed card */}
          <div className="bg-[#0d1425] border border-white/5 p-4 rounded-xl flex items-center gap-4 shadow-glass">
            <div className="w-12 h-12 bg-warningOrange/12 rounded-xl flex items-center justify-center text-warningOrange border border-warningOrange/20">
              <Wind size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-[11px] font-heading font-semibold uppercase tracking-wider block">Cyclone Wind speed</span>
              <span className="text-white text-lg font-heading font-extrabold block">55.0 km/h</span>
              <span className="text-slate-500 text-[10px]">Direction: SW</span>
            </div>
          </div>

          {/* Temperature card */}
          <div className="bg-[#0d1425] border border-white/5 p-4 rounded-xl flex items-center gap-4 shadow-glass">
            <div className="w-12 h-12 bg-emergencyRed/12 rounded-xl flex items-center justify-center text-emergencyRed border border-emergencyRed/20">
              <Thermometer size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-[11px] font-heading font-semibold uppercase tracking-wider block">Ambient Temperature</span>
              <span className="text-white text-lg font-heading font-extrabold block">31.2 &deg;C</span>
              <span className="text-slate-500 text-[10px]">Humidity: 85%</span>
            </div>
          </div>

          {/* River levels card */}
          <div className="bg-[#0d1425] border border-white/5 p-4 rounded-xl flex items-center gap-4 shadow-glass">
            <div className="w-12 h-12 bg-purple/12 rounded-xl flex items-center justify-center text-purple border border-purple/20">
              <Activity size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-[11px] font-heading font-semibold uppercase tracking-wider block">River Surge Height</span>
              <span className="text-white text-lg font-heading font-extrabold block">4.8 meters</span>
              <span className="text-slate-500 text-[10px]">Danger level: 5.0m</span>
            </div>
          </div>

        </div>

        {/* Cyclone Radar preview */}
        <div className="bg-[#0d1425] border border-white/5 p-4 rounded-xl flex-1 flex flex-col justify-between shadow-glass relative overflow-hidden group min-h-[160px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,135,0.06)_0%,transparent_70%)]"></div>
          
          <div className="flex justify-between items-center z-10 border-b border-white/5 pb-2">
            <h3 className="font-heading font-extrabold text-[13.5px] text-white">IMD Doppler Radar Feed</h3>
            <span className="text-[10px] font-bold text-safeGreen animate-pulse">● LIVE METEOROLOGY</span>
          </div>

          <div className="flex justify-center items-center py-6 z-10">
            {/* Doppler visual sweep */}
            <div className="w-28 h-28 border border-safeGreen/20 rounded-full relative flex items-center justify-center">
              <div className="w-16 h-16 border border-safeGreen/35 rounded-full"></div>
              <div className="w-6 h-6 border border-safeGreen/50 rounded-full"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-safeGreen/20 rounded-full animate-[spin_4s_linear_infinite]"></div>
              <span className="absolute text-[8px] text-safeGreen font-bold font-mono tracking-widest mt-1">SWEEPING</span>
            </div>
          </div>

          <div className="z-10 text-[10.5px] text-slate-500 text-center leading-normal border-t border-white/5 pt-2">
            Maisammaguda sector coordinates center calibration successful.
          </div>
        </div>

      </div>

      {/* District Alerts Console (Right panel) */}
      <div className="col-span-2 bg-[#0d1425] border border-white/5 p-5 rounded-xl flex flex-col h-full shadow-glass backdrop-blur-md">
        <div className="border-b border-white/5 pb-3">
          <h2 className="font-heading font-extrabold text-[16px] text-white">District Warnings Index</h2>
          <p className="text-[12px] text-slate-400">Official meteorological warnings active across sub-sectors.</p>
        </div>
        <div className="flex-1 overflow-y-auto mt-4 pr-1 flex flex-col gap-3">
          {alerts.map(a => (
            <div key={a.district} className={`border rounded-xl p-4 flex flex-col gap-2 ${a.color}`}>
              <div className="flex justify-between items-center">
                <h4 className="font-heading font-extrabold text-[13px]">{a.district}</h4>
                <span className="text-[10px] font-extrabold tracking-wider uppercase border border-current px-2 py-0.5 rounded-full">{a.status}</span>
              </div>
              <p className="text-[11.5px] leading-relaxed opacity-95">{a.text}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
