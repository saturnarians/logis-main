'use client';

import React from 'react';
import { useLogistics } from '@/context/LogisticsContext';
import { DAILY_TREND_DATA, HOURLY_HEATMAP_DATA, FUEL_TREND_DATA } from '@/lib/mockData';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { PieChart as PieIcon, BarChart2, TrendingUp, Clock, Truck, Fuel, FilterX } from 'lucide-react';

export const AnalyticsCharts: React.FC = () => {
  const { shipments, drivers, statusFilter, setStatusFilter } = useLogistics();

  // 1. Calculate Status Breakdown
  const statusCounts = {
    Pending: shipments.filter((s) => s.status === 'Pending').length,
    'In Transit': shipments.filter((s) => s.status === 'In Transit').length,
    'Out for Delivery': shipments.filter((s) => s.status === 'Out for Delivery').length,
    Delivered: shipments.filter((s) => s.status === 'Delivered').length,
    Delayed: shipments.filter((s) => s.status === 'Delayed').length,
    Canceled: shipments.filter((s) => s.status === 'Canceled').length,
  };

  const donutData = [
    { name: 'Delivered', value: statusCounts.Delivered, color: '#10B981' },
    { name: 'In Transit', value: statusCounts['In Transit'], color: '#3B82F6' },
    { name: 'Out for Delivery', value: statusCounts['Out for Delivery'], color: '#8B5CF6' },
    { name: 'Pending', value: statusCounts.Pending, color: '#F59E0B' },
    { name: 'Delayed', value: statusCounts.Delayed, color: '#EF4444' },
    { name: 'Canceled', value: statusCounts.Canceled, color: '#6B7280' },
  ].filter((d) => d.value > 0);

  const totalActive = shipments.length;

  // 2. Fleet Status Breakdown
  const fleetCounts = {
    'On Duty': drivers.filter((d) => d.status === 'On Duty').length,
    Available: drivers.filter((d) => d.status === 'Available').length,
    Maintenance: drivers.filter((d) => d.status === 'Maintenance').length,
    'Off Duty': drivers.filter((d) => d.status === 'Off Duty').length,
  };

  const fleetData = [
    {
      category: 'Fleet Utilization',
      'On Duty': fleetCounts['On Duty'],
      Available: fleetCounts.Available,
      Maintenance: fleetCounts.Maintenance,
      'Off Duty': fleetCounts['Off Duty'],
    },
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* Top Section: Donut Status Breakdown + Daily Volume Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Shipment Status Breakdown (Donut) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center">
                <PieIcon className="w-4 h-4 mr-2 text-[#D40511]" />
                Shipment Status Breakdown
              </h3>
              <p className="text-[11px] text-gray-500">Click a slice to filter shipments table below</p>
            </div>

            {statusFilter !== 'All' && (
              <button
                onClick={() => setStatusFilter('All')}
                className="inline-flex items-center text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
              >
                <FilterX className="w-3 h-3 mr-1" />
                Reset ({statusFilter})
              </button>
            )}
          </div>

          <div className="relative h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  onClick={(entry) => {
                    if (entry && entry.name) {
                      setStatusFilter(entry.name);
                    }
                  }}
                  cursor="pointer"
                >
                  {donutData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={statusFilter === entry.name ? '#000' : '#fff'}
                      strokeWidth={statusFilter === entry.name ? 3 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Total Stat */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black font-mono text-gray-900">{totalActive}</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Shipments</span>
            </div>
          </div>

          {/* Interactive Legend Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-[11px]">
            {donutData.map((item) => (
              <button
                key={item.name}
                onClick={() => setStatusFilter(item.name)}
                className={`flex items-center justify-between p-1.5 rounded transition-colors text-left ${
                  statusFilter === item.name ? 'bg-gray-100 font-bold ring-1 ring-gray-400' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="text-gray-700 truncate">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-gray-900 ml-1">{item.value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chart 2: Daily Delivery Volume & Trend (Stacked Bar) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center">
                <BarChart2 className="w-4 h-4 mr-2 text-blue-600" />
                Daily Delivery Volume & SLA Trend (7-Day Volume)
              </h3>
              <p className="text-[11px] text-gray-500">Track volume patterns, completed orders & delay rates</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Peak: 344 Orders/Day
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DAILY_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="delivered" name="Delivered On-Time" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="delayed" name="Delayed Orders" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" name="Pending Staging" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Middle Grid: Hourly Heatmap + Fleet Distribution + Fuel & Expenses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart 3: Hourly Dispatch & Delivery Load */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-amber-600" />
              Hourly Operational Load (08:00 - 20:00)
            </h3>
            <p className="text-[11px] text-gray-500">Dispatch spikes vs dropoff completions</p>
          </div>

          <div className="h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOURLY_HEATMAP_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="dispatched" name="Dispatched" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="delivered" name="Delivered" fill="#10B981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Fleet & Driver Capacity Utilization */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center">
              <Truck className="w-4 h-4 mr-2 text-indigo-600" />
              Fleet Capacity Utilization
            </h3>
            <p className="text-[11px] text-gray-500">Live active drivers status distribution</p>
          </div>

          <div className="h-48 w-full flex flex-col justify-center space-y-4">
            <div className="h-8 w-full bg-gray-100 rounded-lg overflow-hidden flex shadow-inner">
              <div
                className="bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center transition-all"
                style={{ width: `${(fleetCounts['On Duty'] / drivers.length) * 100}%` }}
                title={`On Duty: ${fleetCounts['On Duty']}`}
              >
                {fleetCounts['On Duty']} En Route
              </div>
              <div
                className="bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center transition-all"
                style={{ width: `${(fleetCounts.Available / drivers.length) * 100}%` }}
                title={`Available: ${fleetCounts.Available}`}
              >
                {fleetCounts.Available} Standby
              </div>
              <div
                className="bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center transition-all"
                style={{ width: `${(fleetCounts.Maintenance / drivers.length) * 100}%` }}
                title={`Maintenance: ${fleetCounts.Maintenance}`}
              >
                {fleetCounts.Maintenance}
              </div>
              <div
                className="bg-gray-400 text-white text-[10px] font-bold flex items-center justify-center transition-all"
                style={{ width: `${(fleetCounts['Off Duty'] / drivers.length) * 100}%` }}
                title={`Off Duty: ${fleetCounts['Off Duty']}`}
              >
                {fleetCounts['Off Duty']}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded border border-gray-100">
                <span className="w-3 h-3 rounded bg-emerald-500"></span>
                <div>
                  <span className="text-gray-500 text-[10px] block">On Duty / En Route</span>
                  <span className="font-bold text-gray-900">{fleetCounts['On Duty']} Vehicles</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded border border-gray-100">
                <span className="w-3 h-3 rounded bg-blue-500"></span>
                <div>
                  <span className="text-gray-500 text-[10px] block">Available / Idle</span>
                  <span className="font-bold text-gray-900">{fleetCounts.Available} Drivers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 5: Fuel & Transportation Cost Trend */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center">
              <Fuel className="w-4 h-4 mr-2 text-[#D40511]" />
              Fuel & Fleet Expense Trend ($)
            </h3>
            <p className="text-[11px] text-gray-500">Weekly fuel spend vs tolls & maintenance</p>
          </div>

          <div className="h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={FUEL_TREND_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="fuelSpend" name="Fuel ($)" stroke="#D40511" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="tollsSpend" name="Tolls ($)" stroke="#F59E0B" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="maintenanceSpend" name="Maint ($)" stroke="#8B5CF6" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
