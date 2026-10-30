import React, { useState } from 'react';
import { InventoryItem } from '../types/campus';
import { 
  Boxes, 
  Search, 
  AlertTriangle, 
  RefreshCw,
  MapPin,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onRestockItem: (itemId: string, addQuantity: number) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ inventory, onRestockItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const filteredItems = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesLowStock = !showLowStockOnly || item.quantityInStock <= item.minimumThreshold;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const categories = Array.from(new Set(inventory.map(i => i.category)));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-[#007BA7]" />
            Campus Asset & Inventory Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track smart classroom equipment, AV gear, replacement electronics, and facilities consumables.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search assets by name, location, or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121318] border border-[#252630] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#007BA7]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#121318] border border-[#252630] text-xs text-slate-200 focus:outline-none focus:border-[#007BA7] cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showLowStockOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#121318] text-slate-300 border-[#252630] hover:bg-slate-800/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Low Stock</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl bg-[#121318] border border-[#252630] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0e0f14] text-slate-400 border-b border-[#252630] uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Item & Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4 text-center">In Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252630]/60">
              {filteredItems.map(item => {
                const isLow = item.quantityInStock <= item.minimumThreshold;
                return (
                  <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">{item.id} • ${item.unitCost}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[#1a1b24] text-slate-300 border border-[#252630]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-white flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#007BA7]" />
                        {item.location}
                      </div>
                      <div className="text-[10px] text-slate-500">Audited: {item.lastAudited}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        item.condition === 'New' ? 'text-emerald-400 bg-emerald-500/10' :
                        item.condition === 'Good' ? 'text-blue-400 bg-blue-500/10' :
                        item.condition === 'Fair' ? 'text-amber-400 bg-amber-500/10' :
                        'text-red-400 bg-red-500/10'
                      }`}>
                        {item.condition}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className={`text-sm font-bold ${isLow ? 'text-amber-400' : 'text-white'}`}>
                        {item.quantityInStock}
                      </span>
                      <span className="text-[10px] text-slate-500 block">min: {item.minimumThreshold}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onRestockItem(item.id, 5)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#252630] hover:bg-[#007BA7] text-white text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="Add 5 units to stock"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Restock +5</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
