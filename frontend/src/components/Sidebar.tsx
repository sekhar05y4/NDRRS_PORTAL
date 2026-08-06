import React from 'react';
import { 
  ShieldAlert, LayoutDashboard, Map, ClipboardList, Truck, 
  Warehouse, SquareActivity, TowerControl, BarChart3, 
  HeartPulse, UserCheck 
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isCollapsed?: boolean;
}

export default function Sidebar({ activeView, onViewChange, isCollapsed = false }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Live Operations Map', icon: Map },
    { id: 'registry', label: 'Distress Registry', icon: ClipboardList },
    { id: 'dispatch', label: 'Rescue Dispatch', icon: Truck },
    { id: 'inventory', label: 'MSME Supply Network', icon: Warehouse },
    { id: 'shelters', label: 'Shelters & Hospitals', icon: SquareActivity },
    { id: 'networks', label: 'Communication Network', icon: TowerControl },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'health', label: 'System Health', icon: HeartPulse }
  ];

  return (
    <aside className={`bg-[#0d1425] border-r border-white/5 flex flex-col justify-between h-full select-none shadow-glass backdrop-blur-md rounded-xl transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-[70px] p-3 items-center' : 'w-[245px] p-5'
    }`}>
      <div className="flex flex-col gap-8 w-full">
        
        {/* Brand */}
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="bg-neonCyan/10 w-9 h-9 flex items-center justify-center rounded-lg border border-neonCyan/25 shadow-[0_0_10px_rgba(0,242,254,0.15)] text-neonCyan flex-shrink-0">
            <ShieldAlert size={19} />
          </div>
          {!isCollapsed && (
            <div className="transition-opacity duration-200">
              <h2 className="font-heading font-extrabold text-[15px] leading-tight text-white">NDRRS</h2>
              <span className="text-[8.5px] uppercase font-bold text-slate-500 tracking-wider">National Control EOC</span>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex flex-col gap-1 w-full" aria-label="EOC Navigation Menu">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center rounded-lg text-[13px] font-heading font-semibold transition-all duration-200 text-left ${
                  isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                } ${
                  isActive 
                    ? 'text-neonCyan bg-neonCyan/10 border border-neonCyan/15 shadow-[0_0_12px_rgba(0,242,254,0.05)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={16} className="flex-shrink-0" />
                {!isCollapsed && <span className="transition-opacity duration-200">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Operator profile */}
      <div className={`border-t border-white/5 pt-4 flex items-center w-full ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
          <UserCheck size={16} />
        </div>
        {!isCollapsed && (
          <div className="leading-tight transition-opacity duration-200">
            <span className="text-[12.5px] font-bold text-white block">Duty Officer #102</span>
            <span className="text-[10px] text-safeGreen">Active Session</span>
          </div>
        )}
      </div>

    </aside>
  );
}
