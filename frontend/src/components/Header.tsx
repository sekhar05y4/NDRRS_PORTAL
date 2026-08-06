import React from 'react';
import { ChevronRight, Wifi, WifiOff, Bolt, ZapOff, Menu } from 'lucide-react';

interface HeaderProps {
  activeView: string;
  blackoutActive: boolean;
  onBlackoutToggle: () => void;
  onToggleSidebar?: () => void;
}

export default function Header({ activeView, blackoutActive, onBlackoutToggle, onToggleSidebar }: HeaderProps) {
  const titles: Record<string, string> = {
    dashboard: 'Dashboard Overview',
    map: 'Live Operations Map',
    registry: 'Distress Registry Ledger',
    dispatch: 'Rescue Dispatch Console',
    inventory: 'MSME Warehouses Grid',
    shelters: 'Hospitals & Shelters',
    networks: 'Communications Status',
    analytics: 'Analytics Center',
    health: 'System Telemetry'
  };

  return (
    <header className="flex justify-between items-center px-5 py-2.5 bg-[#0d1425] border border-white/5 rounded-xl shadow-glass backdrop-blur-md">
      
      {/* Breadcrumbs with Toggle */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:border-neonCyan transition-all focus:outline-none"
            title="Toggle Sidebar"
          >
            <Menu size={16} />
          </button>
        )}
        <div className="flex items-center gap-2 font-heading font-semibold text-[12px]">
          <span className="text-slate-500">COMMAND CENTER</span>
          <ChevronRight size={12} className="text-slate-600" />
          <span className="text-white uppercase tracking-wider">{titles[activeView] || 'Overview'}</span>
        </div>
      </div>

      {/* Ribbon Actions */}
      <div className="flex items-center gap-4">
        
        {/* Status indicator */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-wider ${
          blackoutActive 
            ? 'bg-emergencyRed/5 border-emergencyRed/20 text-emergencyRed shadow-[0_0_12px_rgba(255,8,68,0.05)]' 
            : 'bg-safeGreen/5 border-safeGreen/20 text-safeGreen shadow-[0_0_12px_rgba(0,255,135,0.05)]'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${blackoutActive ? 'bg-emergencyRed animate-pulse shadow-[0_0_6px_#ff0844]' : 'bg-safeGreen shadow-[0_0_6px_#00ff87]'}`}></span>
          <span>{blackoutActive ? 'NETWORK OFFLINE' : 'NETWORK ONLINE'}</span>
        </div>

        {/* Blackout button */}
        <button
          onClick={onBlackoutToggle}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-heading font-semibold text-[12.5px] transition-all duration-200 ${
            blackoutActive 
              ? 'bg-emergencyRed border border-emergencyRed shadow-[0_4px_12px_rgba(255,8,68,0.25)] text-white hover:bg-emergencyRed/90' 
              : 'bg-[#1e293b] border border-white/5 text-white hover:border-neonCyan hover:shadow-[0_0_10px_rgba(0,242,254,0.15)]'
          }`}
        >
          {blackoutActive ? <ZapOff size={14} /> : <Bolt size={14} />}
          <span>{blackoutActive ? 'Power Grid: OFFLINE' : 'Simulate Grid Failure'}</span>
        </button>

      </div>

    </header>
  );
}
