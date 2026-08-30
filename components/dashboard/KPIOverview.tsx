'use client';

import React from 'react';
import { useLogistics } from '@/context/LogisticsContext';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShieldCheck,
  Zap,
  Package
} from 'lucide-react';

export const KPIOverview: React.FC = () => {
  const { shipments, expenses, dateRange } = useLogistics();

  // Calculate live stats from state
  const totalCount = shipments.length;
  const deliveredCount = shipments.filter((s) => s.status === 'Delivered').length;
  const delayedCount = shipments.filter((s) => s.status === 'Delayed' || s.flaggedForDelay).length;
  const inTransitCount = shipments.filter((s) => s.status === 'In Transit' || s.status === 'Out for Delivery').length;

  const onTimeRate = totalCount > 0 ? Number(((deliveredCount / (deliveredCount + delayedCount || 1)) * 100).toFixed(1)) : 96.4;
  const delayRate = totalCount > 0 ? Number(((delayedCount / totalCount) * 100).toFixed(1)) : 3.6;

  const totalRevenue = shipments.reduce((acc, s) => acc + (s.revenueUsd || 0), 0);
  const totalCost = shipments.reduce((acc, s) => acc + (s.costUsd || 0), 0);
  const totalFuelCost = expenses.filter((e) => e.category === 'fuel').reduce((acc, e) => acc + e.amountUsd, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* KPI 1: On-Time Delivery Rate */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">On-Time Delivery Rate</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-gray-900 font-mono">{onTimeRate}%</span>
            <span className="text-[11px] text-gray-500 ml-2 font-medium">Target: 98.0%</span>
          </div>
          <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            +1.4%
          </span>
        </div>
        {/* Progress ring bar */}
        <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, onTimeRate)}%` }}
          ></div>
        </div>
      </div>

      {/* KPI 2: Total Active Shipments */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Total Shipments ({dateRange})</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-gray-900 font-mono">{totalCount}</span>
            <span className="text-[11px] text-gray-500 ml-2 font-medium">{inTransitCount} En Route</span>
          </div>
          <span className="inline-flex items-center text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
            Active Volume
          </span>
        </div>
        {/* Micro sparkline */}
        <div className="flex items-end space-x-1 h-3 mt-4">
          <div className="bg-blue-200 w-full h-1.5 rounded-t"></div>
          <div className="bg-blue-300 w-full h-2 rounded-t"></div>
          <div className="bg-blue-400 w-full h-2.5 rounded-t"></div>
          <div className="bg-blue-500 w-full h-3 rounded-t"></div>
          <div className="bg-blue-600 w-full h-2 rounded-t"></div>
          <div className="bg-blue-700 w-full h-3 rounded-t"></div>
        </div>
      </div>

      {/* KPI 3: Avg Delivery Time */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Avg Delivery Duration</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-gray-900 font-mono">4.2 hrs</span>
            <span className="text-[11px] text-gray-500 ml-2 font-medium">Pickup to Dropoff</span>
          </div>
          <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            <TrendingDown className="w-3.5 h-3.5 mr-1" />
            -12m faster
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
          <div className="bg-amber-500 h-2 rounded-full w-3/4"></div>
        </div>
      </div>

      {/* KPI 4: SLA Delay Rate */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">SLA Delay Rate</span>
          <div className="w-8 h-8 rounded-lg bg-red-50 text-[#D40511] flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-gray-900 font-mono">{delayRate}%</span>
            <span className="text-[11px] text-gray-500 ml-2 font-medium">{delayedCount} Flagged Order(s)</span>
          </div>
          <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded ${
            delayedCount > 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {delayedCount > 0 ? 'Action Needed' : 'Nominal'}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
          <div
            className="bg-[#D40511] h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, delayRate * 5)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
