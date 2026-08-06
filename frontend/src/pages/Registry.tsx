import React from 'react';
import { Plus, FileSpreadsheet } from 'lucide-react';

interface RegistryProps {
  beacons: any[];
  onOpenDistressModal: () => void;
}

export default function Registry({ beacons, onOpenDistressModal }: RegistryProps) {
  
  // Call download REST endpoint directly
  const handleExportCSV = () => {
    window.location.href = 'http://127.0.0.1:5001/api/report/csv';
  };

  return (
    <div className="bg-[#0d1425] border border-white/5 p-5 rounded-xl flex flex-col h-full shadow-glass backdrop-blur-md tab-transition">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <h2 className="font-heading font-extrabold text-[16px] text-white">Emergency Beacons Registry Ledger</h2>
          <p className="text-[12px] text-slate-400">Chronological ledger of all captured citizen distress signals within the district.</p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={onOpenDistressModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-safeGreen/10 border border-safeGreen/20 text-safeGreen font-heading font-semibold text-[12.5px] hover:shadow-[0_0_10px_rgba(0,255,135,0.15)] transition-all duration-200"
          >
            <Plus size={14} />
            <span>File Distress Beacon</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#1e293b] border border-white/5 text-white font-heading font-semibold text-[12.5px] hover:border-neonCyan transition-all duration-200"
          >
            <FileSpreadsheet size={14} />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Table grid */}
      <div className="flex-1 overflow-y-auto mt-4 pr-1">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10 text-slate-500 font-heading font-bold text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-3">Beacon ID</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Coordinates</th>
              <th className="py-2.5 px-3">Severity (AI)</th>
              <th className="py-2.5 px-3">Priority</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Assigned Team</th>
              <th className="py-2.5 px-3">Transmission</th>
              <th className="py-2.5 px-3">Log Time</th>
            </tr>
          </thead>
          <tbody className="text-[12.5px] text-slate-300 divide-y divide-white/5">
            {beacons.map(b => {
              const teamLabel = b.assigned_team ? (b.assigned_team === 'team_alpha' ? 'Team Alpha' : b.assigned_team === 'team_bravo' ? 'Team Bravo' : b.assigned_team === 'team_charlie' ? 'Team Charlie' : 'Team Delta') : 'N/A';
              
              // Status Badge
              let statusStyle = 'bg-slate-500/10 border-slate-500/20 text-slate-400';
              if (b.status === 'Completed' || b.status === 'Rescued') statusStyle = 'bg-safeGreen/10 border-safeGreen/20 text-safeGreen';
              if (b.status === 'Dispatched') statusStyle = 'bg-purple/10 border-purple/20 text-purple';
              if (b.status === 'Located') statusStyle = 'bg-neonCyan/10 border-neonCyan/20 text-neonCyan';
              if (b.status === 'Cached Offline') statusStyle = 'bg-warningOrange/10 border-warningOrange/20 text-warningOrange';
              if (b.status === 'Retrieved') statusStyle = 'bg-warningOrange/20 border-warningOrange/30 text-warningOrange';

              // Severity level color
              const severityColor = b.severity_score >= 0.75 ? 'text-emergencyRed' : b.severity_score >= 0.4 ? 'text-warningOrange' : 'text-neonCyan';

              return (
                <tr key={b.id} className="hover:bg-white/2 transition-colors duration-150">
                  <td className="py-3 px-3 font-mono"><code>{b.id.substring(0, 8)}</code></td>
                  <td className="py-3 px-3 font-bold text-white">{b.type}</td>
                  <td className="py-3 px-3 font-mono"><code>{b.lat.toFixed(4)}, {b.lon.toFixed(4)}</code></td>
                  <td className={`py-3 px-3 font-bold font-mono ${severityColor}`}>{b.severity_score ? b.severity_score.toFixed(2) : '0.50'}</td>
                  <td className="py-3 px-3">
                    <span className={`font-bold ${b.priority === 'Critical' ? 'text-emergencyRed' : b.priority === 'High' ? 'text-warningOrange' : 'text-neonCyan'}`}>
                      {b.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusStyle}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">{teamLabel}</td>
                  <td className="py-3 px-3">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${b.offline_flag === 1 ? 'bg-warningOrange shadow-[0_0_6px_#ff9f43]' : 'bg-safeGreen shadow-[0_0_6px_#00ff87]'}`}></span>
                      <span>{b.offline_flag === 1 ? 'LoRa' : 'Cellular'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono"><code>{b.timestamp.substring(11, 19)}</code></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
