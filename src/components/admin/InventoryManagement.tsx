import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CURRENCY_SYMBOLS } from '../../data/seedData';
import {
  Package,
  AlertTriangle,
  Plus,
  Minus,
  RefreshCw,
  Search,
  CheckCircle,
  History,
  TrendingDown,
} from 'lucide-react';

export const InventoryManagement: React.FC = () => {
  const { currentStore, products, inventoryLogs, adjustStock } = useStore();
  const currencySymbol = CURRENCY_SYMBOLS[currentStore.settings.currency] || '$';

  const [searchQuery, setSearchQuery] = useState('');
  const [adjustModalProductId, setAdjustModalProductId] = useState<string | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(5);
  const [adjustmentReason, setAdjustmentReason] = useState('Restocked from supplier batch');

  const filteredProducts = products.filter(
    p =>
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedProduct = products.find(p => p.id === adjustModalProductId);

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalProductId) return;

    adjustStock(adjustModalProductId, adjustmentAmount, adjustmentReason);
    setAdjustModalProductId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory & Stock Control</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor real-time unit counts, trigger stock adjustments, and view complete audit movements.
        </p>
      </div>

      {/* Search and Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search inventory by title or SKU..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500">
            Total Tracked Items: <strong className="text-slate-900 font-bold">{products.length}</strong>
          </span>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Current Stock</th>
                <th className="py-3 px-3">Low-Stock Alert Level</th>
                <th className="py-3 px-3">Stock Health</th>
                <th className="py-3 px-4 text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => {
                const isLow = p.stockQuantity <= (p.lowStockThreshold || 5);
                const isOut = p.stockQuantity <= 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <img
                        src={p.images[0]}
                        alt=""
                        className="w-9 h-9 rounded-lg object-cover border border-slate-200"
                      />
                      <span>{p.name}</span>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-slate-600">{p.sku}</td>
                    <td className="py-3.5 px-3 text-slate-600">{p.category}</td>
                    <td className="py-3.5 px-3 font-extrabold text-slate-900 text-sm">
                      {p.stockQuantity} units
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">≤ {p.lowStockThreshold || 5} units</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isOut
                            ? 'bg-red-100 text-red-800'
                            : isLow
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOut ? 'Out of Stock' : isLow ? 'Low Inventory' : 'Adequate'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => adjustStock(p.id, -1, 'Manual decrement')}
                          className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                          title="-1 unit"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => adjustStock(p.id, 1, 'Manual increment')}
                          className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                          title="+1 unit"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setAdjustModalProductId(p.id);
                            setAdjustmentAmount(10);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-[11px] ml-1"
                        >
                          Bulk Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Movement Audit History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-base">Inventory Audit Movement Log</h3>
        </div>

        <div className="space-y-3 max-h-72 overflow-y-auto text-xs">
          {inventoryLogs.map(log => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
            >
              <div>
                <p className="font-bold text-slate-900">{log.productName}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">{log.reason}</p>
              </div>
              <div className="text-right">
                <span
                  className={`font-mono font-bold text-xs ${
                    log.quantityChange > 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange} units
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • New Stock: {log.newStock}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Stock Adjust Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900">Adjust Inventory</h3>
            <p className="text-xs text-slate-500 mt-1">
              Modifying stock for <strong>{selectedProduct.name}</strong> (Currently {selectedProduct.stockQuantity} units)
            </p>

            <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity Change (+ for restock, - for removal)
                </label>
                <input
                  type="number"
                  required
                  value={adjustmentAmount}
                  onChange={e => setAdjustmentAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adjustment Reason</label>
                <input
                  type="text"
                  required
                  value={adjustmentReason}
                  onChange={e => setAdjustmentReason(e.target.value)}
                  placeholder="e.g. Received shipment, Inventory audit recount"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalProductId(null)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-sm"
                >
                  Save Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
