import React from 'react';
import { Smartphone, Globe, Satellite, Share2 } from 'lucide-react';

interface NetworkProps {
  blackoutActive: boolean;
}

export default function Network({ blackoutActive }: NetworkProps) {
  const networks = [
    {
      id: 'cellular',
      name: 'Cellular Network (LTE/5G)',
      icon: Smartphone,
      status: blackoutActive ? 'Offline / Outage' : 'Active / Online',
      statusColor: blackoutActive ? 'text-emergencyRed bg-emergencyRed/10 border-emergencyRed/20' : 'text-safeGreen bg-safeGreen/10 border-safeGreen/20',
      desc: 'Local telecom masts transmitting core mobile data streams. Power failures have compromised grid integrity in target sectors during outage simulations.'
    },
    {
      id: 'internet',
      name: 'Fiber Internet Uplinks',
      icon: Globe,
      status: blackoutActive ? 'Offline / Outage' : 'Active / Online',
      statusColor: blackoutActive ? 'text-emergencyRed bg-emergencyRed/10 border-emergencyRed/20' : 'text-safeGreen bg-safeGreen/10 border-safeGreen/20',
      desc: 'Underground fiber optics routing data back to center databases. Swamped by flood runoffs in lower Maisammaguda corridor sections.'
    },
    {
      id: 'satellite',
      name: 'Satellite Communication',
      icon: Satellite,
      status: blackoutActive ? 'Standby (Active)' : 'Standby',
      statusColor: blackoutActive ? 'text-warningOrange bg-warningOrange/10 border-warningOrange/20' : 'text-slate-400 bg-white/5 border-white/5',
      desc: 'Satellite uplink transceivers. Standby fallback channels activated to secure district collector reporting streams.'
    },
    {
      id: 'lora',
      name: 'LoRaWAN Radio Mesh Network',
      icon: Share2,
      status: blackoutActive ? 'Active (Mesh Fallback)' : 'Offline (Standby)',
      statusColor: blackoutActive ? 'text-safeGreen bg-safeGreen/10 border-safeGreen/20 shadow-[0_0_10px_rgba(0,255,135,0.08)]' : 'text-slate-500 bg-white/5 border-white/5',
      desc: 'Low-power long-range radio transceivers mounted on rescue team vehicles. Acts as standard fallback mesh path to sweep, cache, and synchronize distress signals offline.'
    }
  ];

  return (
    <div className="bg-[#0d1425] border border-white/5 p-5 rounded-xl flex flex-col h-full shadow-glass backdrop-blur-md tab-transition select-none">
      
      {/* Header */}
      <div className="border-b border-white/5 pb-3">
        <h2 className="font-heading font-extrabold text-[16px] text-white">Emergency Communication System Console</h2>
        <p className="text-[12px] text-slate-400">Status monitor for regional data linkages and fallback radio coverage matrices.</p>
      </div>

      {/* Network Grids */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        {networks.map(net => {
          const Icon = net.icon;
          return (
            <div key={net.id} className="bg-white/2 border border-white/5 rounded-xl p-5 flex flex-col items-center text-center gap-4 hover:border-neonCyan transition-all duration-200">
              
              {/* Icon */}
              <div className="w-14 h-14 bg-neonCyan/10 rounded-full flex items-center justify-center border border-neonCyan/20 text-neonCyan shadow-[0_0_10px_rgba(0,242,254,0.08)]">
                <Icon size={24} />
              </div>

              <div>
                <h4 className="font-heading font-extrabold text-[13.5px] text-white">{net.name}</h4>
                <span className={`px-2.5 py-0.5 rounded-full border text-[9.5px] font-bold block w-fit mx-auto mt-2 ${net.statusColor}`}>
                  {net.status}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{net.desc}</p>

            </div>
          );
        })}
      </div>

    </div>
  );
}
