import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldAlert, Award, Database, FileSpreadsheet, XCircle } from 'lucide-react';

interface RequestRegistryProps {
  beacons: any[];
  teams: any[];
  hubs: any[];
  onAssignTeam: (beaconId: string, teamId: string) => void;
  onResolveBeacon: (beaconId: string) => void;
  defaultFilter?: string | null;
}

export default function RequestRegistry({ beacons, teams, hubs, onAssignTeam, onResolveBeacon, defaultFilter = null }: RequestRegistryProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(defaultFilter);

  useEffect(() => {
    setActiveFilter(defaultFilter);
  }, [defaultFilter]);

  // Calculate simple 2D coordinates distance
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const dx = lat1 - lat2;
    const dy = lon1 - lon2;
    return Math.sqrt(dx*dx + dy*dy) * 111000; // approximate meters
  };

  const getAIRecommendations = (lat: number, lon: number) => {
    let bestTeam = null;
    let minTeamDist = Infinity;
    teams.forEach(t => {
      if (t.status !== 'Idle') return;
      const d = getDistance(lat, lon, t.lat, t.lon);
      if (d < minTeamDist) {
        minTeamDist = d;
        bestTeam = t;
      }
    });

    let bestHub = null;
    let minHubDist = Infinity;
    hubs.forEach(h => {
      const d = getDistance(lat, lon, h.lat, h.lon);
      if (d < minHubDist) {
        minHubDist = d;
        bestHub = h;
      }
    });

    return {
      team: bestTeam ? `${(bestTeam as any).name} (${minTeamDist.toFixed(0)}m)` : 'No Idle Teams',
      shelter: bestHub ? `${(bestHub as any).name} (${minHubDist.toFixed(0)}m)` : 'N/A'
    };
  };

  const handleExportCSV = () => {
    window.location.href = 'http://127.0.0.1:5001/api/report/csv';
  };

  // Filter beacons - Normalized case-insensitive checks
  let filteredBeacons = beacons;
  if (activeFilter === 'Awaiting') {
    filteredBeacons = beacons.filter(b => {
      const s = (b.status || '').toUpperCase();
      return s === 'AWAITING_RESCUE' || s === 'PENDING' || s === 'LOCATED' || s === 'DISPATCHED' || s === 'ROUTED';
    });
  } else if (activeFilter === 'Rescued') {
    filteredBeacons = beacons.filter(b => {
      const s = (b.status || '').toUpperCase();
      return s === 'RESCUED' || s === 'RESOLVED' || s === 'COMPLETED';
    });
  } else if (activeFilter === 'Offline') {
    filteredBeacons = beacons.filter(b => {
      const s = (b.status || '').toUpperCase();
      return s === 'CACHED OFFLINE' || b.offline_flag === 1;
    });
  }

  return (
    <div className="bg-[#0d1425] border border-white/5 p-5 rounded-xl flex flex-col h-full shadow-glass backdrop-blur-md tab-transition select-none text-[12.5px]">
      
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <h2 className="font-heading font-extrabold text-[16px] text-white flex items-center gap-2">
            Emergency Request Registry Ledger
            {activeFilter && (
              <span className="flex items-center gap-1 bg-neonCyan/10 border border-neonCyan/20 text-neonCyan text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Filter: {activeFilter}
                <XCircle 
                  size={12} 
                  className="cursor-pointer text-slate-400 hover:text-white" 
                  onClick={() => setActiveFilter(null)} 
                />
              </span>
            )}
          </h2>
          <p className="text-[12px] text-slate-400">Deploy responders and review AI spatial routing allocations.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#1e293b] border border-white/5 text-white font-heading font-semibold text-[12px] hover:border-neonCyan transition-all"
        >
          <FileSpreadsheet size={14} />
          <span>Export CSV Report</span>
        </button>
      </div>

      <div className="flex-grow overflow-y-auto mt-4 pr-1">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10 text-slate-500 font-heading font-bold text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-3">SOS ID</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Demographics</th>
              <th className="py-2.5 px-3">Context details</th>
              <th className="py-2.5 px-3">AI Recommendation</th>
              <th className="py-2.5 px-3">Action dispatch</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="text-slate-300 divide-y divide-white/5">
            {filteredBeacons.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500 text-[12px]">
                  No distress signals match the current registry filters.
                </td>
              </tr>
            ) : (
              filteredBeacons.map(b => {
                const ai = getAIRecommendations(b.lat, b.lon);
                
                // Status Badge - Case-insensitive checks
                const sUpper = (b.status || '').toUpperCase();
                let statusStyle = 'bg-slate-500/10 border-slate-500/20 text-slate-400';
                if (sUpper === 'COMPLETED' || sUpper === 'RESCUED' || sUpper === 'RESOLVED') {
                  statusStyle = 'bg-safeGreen/10 border-safeGreen/20 text-safeGreen';
                } else if (sUpper === 'DISPATCHED') {
                  statusStyle = 'bg-purple/10 border-purple/20 text-purple';
                } else if (sUpper === 'LOCATED') {
                  statusStyle = 'bg-neonCyan/10 border-neonCyan/20 text-neonCyan';
                } else if (sUpper === 'CACHED OFFLINE' || sUpper === 'AWAITING_RESCUE') {
                  statusStyle = 'bg-warningOrange/10 border-warningOrange/20 text-warningOrange';
                }

                const isResolved = sUpper === 'COMPLETED' || sUpper === 'RESCUED' || sUpper === 'RESOLVED';

                return (
                  <tr key={b.id} className="hover:bg-white/2 transition-all">
                    <td className="py-3 px-3 font-mono"><code>{b.id.substring(0, 8)}</code></td>
                    <td className="py-3 px-3">
                      <strong className="text-white block">{b.type}</strong>
                      <span className="text-[10px] text-slate-500 font-mono">{b.lat.toFixed(4)}, {b.lon.toFixed(4)}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-0.5 text-[11px] text-slate-400">
                        <span>Children: <strong className="text-slate-300">{b.children || 0}</strong></span>
                        <span>Elderly: <strong className="text-slate-300">{b.elderly || 0}</strong></span>
                        <span>Disabled / Pregnant: <strong className="text-slate-300">{(b.disabled || 0) + (b.pregnant || 0)}</strong></span>
                      </div>
                    </td>
                    <td className="py-3 px-3 max-w-[200px] truncate" title={b.details}>{b.details}</td>
                    
                    {/* AI Recommendation */}
                    <td className="py-3 px-3 leading-tight">
                      <span className="text-safeGreen block font-semibold text-[11px]">🚒 {ai.team}</span>
                      <span className="text-neonCyan block font-semibold text-[11px] mt-0.5">🏥 {ai.shelter}</span>
                    </td>

                    {/* Dispatch & Resolution Actions */}
                    <td className="py-3 px-3">
                      {isResolved ? (
                        <span className="text-slate-500 text-[11.5px] font-semibold flex items-center gap-1">Mission Solved</span>
                      ) : (
                        <div className="flex flex-col gap-1.5 min-w-[130px]">
                          <select
                            onChange={(e) => onAssignTeam(b.id, e.target.value)}
                            value={b.assigned_team || ''}
                            className="bg-black/60 border border-white/10 rounded px-2 py-1 text-white outline-none focus:border-neonCyan text-[11.5px] w-full"
                          >
                            <option value="">Select Team</option>
                            {teams.map(t => (
                              <option key={t.id} value={t.id}>{t.name} ({t.status})</option>
                            ))}
                          </select>
                          <button
                            onClick={() => onResolveBeacon(b.id)}
                            className="px-2.5 py-1 bg-safeGreen/10 border border-safeGreen/30 text-safeGreen font-semibold text-[10.5px] rounded hover:bg-safeGreen/20 hover:text-white transition-all text-center"
                          >
                            Mark as Rescued
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusStyle}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
