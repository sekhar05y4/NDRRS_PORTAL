import React from 'react';
import { Cpu, Server, Database, Users } from 'lucide-react';

interface SystemProps {
  health: {
    cpu: number;
    memory: number;
    clients: number;
    sockets: string;
    mesh_status: string;
    db_integrity: string;
  };
}

export default function System({ health }: SystemProps) {
  return (
    <div className="bg-[#0d1425] border border-white/5 p-5 rounded-xl flex flex-col h-full shadow-glass backdrop-blur-md tab-transition select-none">
      
      {/* Header */}
      <div className="border-b border-white/5 pb-3">
        <h2 className="font-heading font-extrabold text-[16px] text-white">EOC System Diagnostics Console</h2>
        <p className="text-[12px] text-slate-400">Real-time status indicators of the central database engines and sockets listeners.</p>
      </div>

      {/* Grid of Gauges */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        
        {/* CPU */}
        <div className="bg-white/2 border border-white/5 rounded-xl p-5 flex flex-col items-center gap-2">
          <Cpu className="text-neonCyan mb-2" size={26} />
          <span className="text-slate-400 text-[10.5px] font-heading font-bold uppercase tracking-wider">CPU Core Utilization</span>
          <span className="text-white text-2xl font-heading font-extrabold">{health.cpu}%</span>
          <span className="text-[10px] text-slate-500">8 Virtual Threads</span>
        </div>

        {/* RAM */}
        <div className="bg-white/2 border border-white/5 rounded-xl p-5 flex flex-col items-center gap-2">
          <Server className="text-safeGreen mb-2" size={26} />
          <span className="text-slate-400 text-[10.5px] font-heading font-bold uppercase tracking-wider">RAM Consumption</span>
          <span className="text-white text-2xl font-heading font-extrabold">{health.memory}%</span>
          <span className="text-[10px] text-slate-500">16 GB Allocation Cap</span>
        </div>

        {/* Sockets */}
        <div className="bg-white/2 border border-white/5 rounded-xl p-5 flex flex-col items-center gap-2">
          <Users className="text-purple mb-2" size={26} />
          <span className="text-slate-400 text-[10.5px] font-heading font-bold uppercase tracking-wider">Consoles Connected</span>
          <span className="text-white text-2xl font-heading font-extrabold">{health.clients}</span>
          <span className="text-[10px] text-slate-500">Websockets: active</span>
        </div>

        {/* SQLite */}
        <div className="bg-white/2 border border-white/5 rounded-xl p-5 flex flex-col items-center gap-2">
          <Database className="text-safeGreen mb-2" size={26} />
          <span className="text-slate-400 text-[10.5px] font-heading font-bold uppercase tracking-wider">SQLite Integrity</span>
          <span className="text-safeGreen text-[14px] font-heading font-extrabold mt-1.5">{health.db_integrity}</span>
          <span className="text-[10px] text-slate-500 mt-0.5">ACID Write-Ahead Log</span>
        </div>

      </div>

    </div>
  );
}
