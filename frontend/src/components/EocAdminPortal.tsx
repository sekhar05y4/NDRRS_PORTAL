import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

// Tab Pages
import Dashboard from '../pages/Dashboard';
import LiveMap from '../pages/admin/LiveMap';
import RequestRegistry from '../pages/admin/RequestRegistry';
import Dispatch from '../pages/Dispatch';
import Resources from '../pages/admin/Resources';
import Weather from '../pages/Weather';
import Network from '../pages/Network';
import Analytics from '../pages/Analytics';
import System from '../pages/System';
import Shelters from '../pages/admin/Shelters';

interface EocAdminPortalProps {
  onLogout: () => void;
  hubs: any[];
  teams: any[];
  beacons: any[];
  logs: any[];
  blackoutActive: boolean;
  onBlackoutToggle: () => void;
  onPlaceDistress: (lat: number, lon: number) => void;
  onRebootSim: () => void;
  onOpenStockModal: () => void;
  geofences: any[];
  onSaveGeofence: (gf: any) => void;
  onDeleteGeofence: (id: string) => void;
  onAssignTeam: (beaconId: string, teamId: string) => void;
  onResolveBeacon: (beaconId: string) => void;
  health: any;
}

export default function EocAdminPortal({
  onLogout,
  hubs,
  teams,
  beacons,
  logs,
  blackoutActive,
  onBlackoutToggle,
  onPlaceDistress,
  onRebootSim,
  onOpenStockModal,
  geofences,
  onSaveGeofence,
  onDeleteGeofence,
  onAssignTeam,
  onResolveBeacon,
  health
}: EocAdminPortalProps) {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [registryFilter, setRegistryFilter] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 320);
    return () => clearTimeout(timer);
  }, [sidebarCollapsed]);

  const handleViewChange = (view: string, filter?: string) => {
    setRegistryFilter(filter || null);
    setActiveView(view);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard
            stats={{
              trapped: beacons.filter(b => {
                const s = (b.status || '').toUpperCase();
                return s === 'AWAITING_RESCUE' || s === 'AWAITING RESCUE' || s === 'PENDING' || s === 'LOCATED' || s === 'DISPATCHED' || s === 'ROUTED';
              }).length,
              rescued: beacons.filter(b => {
                const s = (b.status || '').toUpperCase();
                return s === 'RESCUED' || s === 'RESOLVED' || s === 'COMPLETED';
              }).length,
              activeTeams: `${teams.filter(t => t.status !== 'Idle').length} / ${teams.length}`,
              offlineCount: beacons.filter(b => {
                const s = (b.status || '').toUpperCase();
                return s === 'CACHED OFFLINE' || b.offline_flag === 1;
              }).length
            }}
            hubs={hubs}
            logs={logs}
            onViewChange={handleViewChange}
          />
        );
      case 'map':
        return (
          <LiveMap
            hubs={hubs}
            teams={teams}
            beacons={beacons}
            blackoutActive={blackoutActive}
            onPlaceDistress={onPlaceDistress}
            onRebootSim={onRebootSim}
            geofences={geofences}
            onSaveGeofence={onSaveGeofence}
            onDeleteGeofence={onDeleteGeofence}
            onResolveBeacon={onResolveBeacon}
          />
        );
      case 'registry':
        return (
          <RequestRegistry
            beacons={beacons}
            teams={teams}
            hubs={hubs}
            onAssignTeam={onAssignTeam}
            onResolveBeacon={onResolveBeacon}
            defaultFilter={registryFilter}
          />
        );
      case 'dispatch':
        return <Dispatch teams={teams} />;
      case 'inventory':
        return <Resources hubs={hubs} onOpenStockModal={onOpenStockModal} />;
      case 'shelters':
      case 'shelters-hospitals':
        return <Shelters hubs={hubs} />;
      case 'weather':
        return <Weather />;
      case 'networks':
        return <Network blackoutActive={blackoutActive} />;
      case 'analytics':
        return <Analytics beacons={beacons} hubs={hubs} />;
      case 'health':
        return <System health={health} />;
      default:
        return <div className="p-5">View Not Found</div>;
    }
  };

  return (
    <div className="flex w-screen h-screen p-3 bg-[#080c16] text-white gap-3 select-none">
      
      {/* Sidebar navigation */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} isCollapsed={sidebarCollapsed} />

      {/* Content wrapper */}
      <div className="flex flex-col flex-1 gap-3 min-w-0">
        
        {/* Header Ribbon with signout */}
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <Header 
              activeView={activeView} 
              blackoutActive={blackoutActive} 
              onBlackoutToggle={onBlackoutToggle} 
              onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>
          <button
            onClick={onLogout}
            className="flex-shrink-0 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/5 font-heading font-semibold text-[12.5px] hover:border-emergencyRed hover:text-emergencyRed transition-all"
          >
            Logout
          </button>
        </div>

        {/* Viewport Frame */}
        <main className="flex-1 min-h-0 bg-[#0d1425]/45 border border-white/5 rounded-xl shadow-glass p-5">
          {renderView()}
        </main>

      </div>

    </div>
  );
}
