'use client';

import React, { useState } from 'react';
import { useLogistics } from '@/context/LogisticsContext';
import { InventoryItem } from '@/types/logistics';
import { 
  Boxes, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  Building2, 
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';

export const InventoryStockView: React.FC = () => {
  const { inventory, updateInventoryStock, addInventoryItem, warehouses } = useLogistics();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form state
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryItem['category']>('Packaging');
  const [quantity, setQuantity] = useState(100);
  const [minThreshold, setMinThreshold] = useState(25);
  const [unit, setUnit] = useState('Boxes');
  const [unitCostUsd, setUnitCostUsd] = useState(12.50);
  const [warehouseHub, setWarehouseHub] = useState(warehouses[0]?.name || 'London Central Gateway');

  const filteredItems = inventory.filter((item) => {
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSearch =
      !search ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.warehouseHub.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name) return;

    addInventoryItem({
      sku,
      name,
      category,
      quantity: Number(quantity),
      unitCostUsd: Number(unitCostUsd),
      unit,
      warehouseHub,
      minThreshold: Number(minThreshold),
      status: quantity <= 0 ? 'Out of Stock' : quantity <= minThreshold ? 'Low Stock' : 'In Stock',
      lastRestocked: new Date().toISOString().substring(0, 10),
    });

    setShowAddModal(false);
    setSku('');
    setName('');
  };

  const getStatusBadge = (status: InventoryItem['status']) => {
    switch (status) {
      case 'In Stock':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Low Stock':
        return 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#D40511] text-[#FFCC00] text-[10px] font-black px-2 py-0.5 rounded uppercase">
              WAREHOUSE STOCK
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Inventory SKU Levels & Supply Staging
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Track packaging consumables, cold-chain dry ice containers, pallet straps, and parcel supplies across facilities.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#D40511] hover:bg-red-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add SKU Item</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-500">Total Tracked SKUs</span>
          <div className="text-2xl font-black text-gray-900 mt-1">{inventory.length} SKUs</div>
          <span className="text-[11px] text-gray-500">Across central logistics hubs</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-500">Low Stock Triggers</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {inventory.filter(i => i.status === 'Low Stock').length} Items
          </div>
          <span className="text-[11px] text-amber-700 font-bold">Auto-replenish queued</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-500">Out of Stock Warnings</span>
          <div className="text-2xl font-black text-red-600 mt-1">
            {inventory.filter(i => i.status === 'Out of Stock').length} Items
          </div>
          <span className="text-[11px] text-red-700 font-bold">Immediate attention required</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-500">Total Valuation</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            ${inventory.reduce((acc, i) => acc + (i.quantity * i.unitCostUsd), 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-700 font-bold">Audited inventory value</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          {['All', 'Packaging', 'Cold-Chain', 'Security & Seals', 'Labels & Hardware'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                categoryFilter === cat
                  ? 'bg-gray-900 text-[#FFCC00] shadow'
                  : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU or Item..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-800 font-medium focus:outline-none focus:border-[#D40511]"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-gray-200 text-gray-500 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">SKU / Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Facility Location</th>
                <th className="py-3 px-4">Quantity Available</th>
                <th className="py-3 px-4">Min. Threshold</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-gray-900">{item.name}</div>
                    <span className="font-mono text-[10px] text-gray-400">{item.sku}</span>
                  </td>

                  <td className="py-3 px-4 text-gray-600 font-semibold">{item.category}</td>

                  <td className="py-3 px-4">
                    <div className="flex items-center text-gray-700">
                      <Building2 className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      {item.warehouseHub}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono font-black text-sm text-gray-900">
                    {item.quantity.toLocaleString()} {item.unit}
                  </td>

                  <td className="py-3 px-4 font-mono text-gray-500">
                    {item.minThreshold} {item.unit}
                  </td>

                  <td className="py-3 px-4 font-mono text-gray-700 font-bold">
                    ${item.unitCostUsd.toFixed(2)}
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => updateInventoryStock(item.id, Math.max(0, item.quantity - 10))}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded font-mono font-bold text-xs"
                        title="Deduct 10 units"
                      >
                        -10
                      </button>
                      <button
                        onClick={() => updateInventoryStock(item.id, item.quantity + 25)}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-mono font-bold text-xs"
                        title="Restock +25 units"
                      >
                        +25 Restock
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-black text-gray-900 flex items-center">
              <Boxes className="w-5 h-5 mr-2 text-[#D40511]" />
              Add Inventory SKU
            </h2>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">SKU Identifier *</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. SKU-BOX-XL-09"
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Item / Consumable Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Heavy Duty Express Pallet Wrap"
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="Packaging">Packaging</option>
                    <option value="Cold-Chain">Cold-Chain</option>
                    <option value="Security & Seals">Security & Seals</option>
                    <option value="Labels & Hardware">Labels & Hardware</option>
                    <option value="Customer Freight">Customer Freight</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Warehouse Hub</label>
                  <select
                    value={warehouseHub}
                    onChange={(e) => setWarehouseHub(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. Boxes, Rolls"
                    className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={unitCostUsd}
                    onChange={(e) => setUnitCostUsd(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black bg-[#D40511] text-white hover:bg-red-700 shadow"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
