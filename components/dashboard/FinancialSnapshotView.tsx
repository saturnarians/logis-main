'use client';

import React, { useState } from 'react';
import { useLogistics } from '@/context/LogisticsContext';
import { Fuel, DollarSign, Plus, TrendingUp, TrendingDown, Receipt, Truck } from 'lucide-react';

export const FinancialSnapshotView: React.FC = () => {
  const { expenses, shipments, addExpense } = useLogistics();

  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [category, setCategory] = useState<'fuel' | 'toll' | 'maintenance' | 'driver_payout'>('fuel');
  const [amountUsd, setAmountUsd] = useState('180.00');
  const [vehicleNo, setVehicleNo] = useState('DHL-V-901');
  const [driverName, setDriverName] = useState('Marcus Vance');
  const [note, setNote] = useState('Diesel fill-up Slough Depot');

  // Metrics
  const totalRevenue = shipments.reduce((acc, s) => acc + (s.revenueUsd || 0), 0);
  const totalDeliveryCosts = shipments.reduce((acc, s) => acc + (s.costUsd || 0), 0);
  const totalLoggedExpenses = expenses.reduce((acc, e) => acc + e.amountUsd, 0);
  const netMarginUsd = totalRevenue - totalDeliveryCosts - totalLoggedExpenses;

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      date: new Date().toISOString().substring(0, 10),
      category,
      amountUsd: parseFloat(amountUsd) || 0,
      vehicleNo,
      driverName,
      note,
    });
    setAddExpenseOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-extrabold text-base text-gray-900 tracking-tight flex items-center">
            <DollarSign className="w-5 h-5 mr-1.5 text-emerald-600" />
            Cost & Financial Snapshot
          </h3>
          <p className="text-xs text-gray-500">Fuel tracking, tolls, maintenance, and revenue per delivery zone.</p>
        </div>

        <button
          onClick={() => setAddExpenseOpen(true)}
          className="bg-gray-900 hover:bg-black text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4 text-[#FFCC00]" />
          <span>Log Fleet Expense</span>
        </button>
      </div>

      {/* Top 3 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-xl">
          <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Total Delivery Revenue</span>
          <span className="text-2xl font-black text-emerald-950 font-mono mt-1 block">${totalRevenue.toLocaleString()}</span>
        </div>

        <div className="bg-red-50/50 border border-red-200 p-4 rounded-xl">
          <span className="text-[10px] font-extrabold text-red-800 uppercase tracking-wider block">Fleet Fuel & Ops Expense</span>
          <span className="text-2xl font-black text-red-950 font-mono mt-1 block">${(totalDeliveryCosts + totalLoggedExpenses).toLocaleString()}</span>
        </div>

        <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-xl">
          <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider block">Net Profit Margin</span>
          <span className="text-2xl font-black text-amber-950 font-mono mt-1 block">${netMarginUsd.toLocaleString()}</span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="overflow-x-auto">
        <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider mb-3">Recent Operational Expense Logs</h4>
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-100 font-bold text-gray-600 text-[10px] uppercase">
            <tr>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Vehicle No</th>
              <th className="py-2.5 px-3">Driver</th>
              <th className="py-2.5 px-3">Details / Note</th>
              <th className="py-2.5 px-3 text-right">Amount ($)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 font-medium">
            {expenses.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-mono">{e.date}</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-800">
                    {e.category}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono font-bold text-gray-900">{e.vehicleNo}</td>
                <td className="py-2.5 px-3">{e.driverName}</td>
                <td className="py-2.5 px-3 text-gray-500">{e.note}</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-red-700">${e.amountUsd.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Expense Form Modal */}
      {addExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="font-extrabold text-base text-gray-900 mb-4">Log Fleet Expense</h3>
            <form onSubmit={handleAddExpenseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none font-semibold text-gray-900 bg-white"
                >
                  <option value="fuel">Fuel Fill-Up</option>
                  <option value="toll">Highway Toll Fees</option>
                  <option value="maintenance">Vehicle Maintenance</option>
                  <option value="driver_payout">Driver Bonus / Payout</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amountUsd}
                  onChange={(e) => setAmountUsd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none font-mono font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Vehicle No</label>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none font-mono text-gray-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Driver Name</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-gray-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Receipt Note</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-gray-900"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAddExpenseOpen(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D40511] text-white font-extrabold rounded-lg shadow"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
