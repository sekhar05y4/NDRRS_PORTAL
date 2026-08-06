import React from 'react';
import { PackageOpen, Lock } from 'lucide-react';

interface InventoryProps {
  hubs: any[];
  onOpenStockModal: () => void;
}

export default function Inventory({ hubs, onOpenStockModal }: InventoryProps) {
  return (
    <div className="grid grid-cols-5 gap-4 h-full tab-transition select-none">
      
      {/* MSME Warehouses table (Left panel) */}
      <div className="col-span-3 bg-[#0d1425] border border-white/5 p-5 rounded-xl flex flex-col h-full shadow-glass backdrop-blur-md">
        <div className="border-b border-white/5 pb-3 flex justify-between items-center">
          <div>
            <h2 className="font-heading font-extrabold text-[16px] text-white">MSME Emergency Supplies Hubs</h2>
            <p className="text-[12px] text-slate-400">Local small business inventories acting as district reserve hubs.</p>
          </div>
          <button
            onClick={onOpenStockModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-neonCyan/10 border border-neonCyan/20 text-neonCyan font-heading font-semibold text-[12.5px] hover:shadow-[0_0_10px_rgba(0,242,254,0.15)] transition-all duration-200"
          >
            <PackageOpen size={14} />
            <span>Refill Stock</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto mt-4 pr-1">
          <table className="w-full border-collapse text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-white/10 text-slate-500 font-heading font-bold text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Warehouse Name</th>
                <th className="py-2.5 px-3">Food &amp; Water</th>
                <th className="py-2.5 px-3">Meds &amp; Blankets</th>
                <th className="py-2.5 px-3">Generators &amp; Fuel</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 divide-y divide-white/5">
              {hubs.map(h => (
                <tr key={h.id} className="hover:bg-white/2 transition-colors duration-150">
                  <td className="py-3.5 px-3 leading-tight">
                    <strong className="text-white block">{h.name}</strong>
                    <span className="text-[11px] text-slate-500">{h.sector}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    Food: <strong className="text-white">{h.food}</strong><br />
                    Water: <strong className="text-white">{h.water}</strong>
                  </td>
                  <td className="py-3.5 px-3">
                    Meds: <strong className="text-white">{h.medicine}</strong><br />
                    Blankets: <strong className="text-white">{h.blankets}</strong>
                  </td>
                  <td className="py-3.5 px-3">
                    Power: <strong className="text-white">{h.generators}</strong><br />
                    Fuel: <strong className="text-white">{h.fuel}L</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Database Isolation Ledger (Right panel) */}
      <div className="col-span-2 bg-[#0d1425] border border-white/5 p-5 rounded-xl flex flex-col h-full shadow-glass backdrop-blur-md">
        <div className="border-b border-white/5 pb-3">
          <h2 className="font-heading font-extrabold text-[16px] text-white">ACID Database Isolation Ledger</h2>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          
          <div className="bg-white/2 border border-white/5 p-4 rounded-xl flex flex-col gap-3">
            <h4 className="font-heading font-extrabold text-[13px] text-warningOrange flex items-center gap-2">
              <Lock size={14} /> Relational Lock Allocations (SQLite WAL)
            </h4>
            <p className="text-[11.5px] text-slate-400 leading-normal">
              To guarantee that multiple dispatch teams do not decrement the same inventory stock simultaneously on separate network connections, database operations utilize standard row-level transaction boundaries:
            </p>
            <div className="bg-black/45 border border-white/5 p-3 rounded font-mono text-[10.5px] text-safeGreen">
              <pre>{`BEGIN TRANSACTION;
SELECT generators FROM supply_hubs
WHERE id = 'alpha' LIMIT 1;

UPDATE supply_hubs
SET generators = generators - 1
WHERE id = 'alpha';

INSERT INTO inventory_transactions...
COMMIT;`}</pre>
            </div>
            <p className="text-[11.5px] text-slate-500 leading-normal">
              During synchronization conflicts, updates roll back automatically to prevent inventory imbalances or double-allocation issues.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
