'use client';

import React, { useState } from 'react';
import { useLogistics } from '@/context/LogisticsContext';
import { 
  DAILY_TREND_DATA, 
  HOURLY_HEATMAP_DATA, 
  FUEL_TREND_DATA 
} from '@/lib/mockData';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Fuel, 
  Leaf, 
  Award, 
  Download, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Zap,
  DollarSign,
  ArrowUpRight
} from 'lucide-react';

export const OverviewReportsView: React.FC = () => {
  const { shipments, drivers, expenses, dateRange, setDateRange } = useLogistics();
  const [reportType, setReportType] = useState<'efficiency' | 'fuel' | 'drivers' | 'financial'>('efficiency');

  const totalDelivered = shipments.filter(s => s.status === 'Delivered').length;
  const totalInTransit = shipments.filter(s => s.status === 'In Transit' || s.status === 'Out for Delivery').length;
  const totalDelayed = shipments.filter(s => s.status === 'Delayed').length;
  const totalRevenue = shipments.reduce((acc, s) => acc + s.revenueUsd, 0);
  const totalFuelCost = shipments.reduce((acc, s) => acc + s.fuelCostUsd, 0);
  const totalExpenseCost = expenses.reduce((acc, e) => acc + e.amountUsd, 0);
  const netMargin = totalRevenue > 0 ? (((totalRevenue - totalExpenseCost) / totalRevenue) * 100).toFixed(1) : '68.4';

  const efficiencyData = [
    { name: 'On-Time Express', value: 92.4, fill: '#10B981' },
    { name: 'Traffic Delays', value: 4.8, fill: '#F59E0B' },
    { name: 'Failed / Rescheduled', value: 2.8, fill: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#D40511] text-[#FFCC00] text-[10px] font-black px-2 py-0.5 rounded uppercase">
              ANALYTICS & BI
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Operational Performance & Executive Reports
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Audited metrics across route efficiency, fuel economics, SLA compliance, and fleet carbon emissions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Time Range Selector */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center text-xs font-bold text-gray-700">
            {(['Today', 'This Week', 'This Month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  dateRange === range ? 'bg-white text-gray-900 shadow-sm font-extrabold' : 'hover:text-gray-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={() => alert('Generating PDF Executive Report...')}
            className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export BI Report</span>
          </button>
        </div>
      </div>

      {/* Top 4 Performance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Route Efficiency Rate</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">94.8%</div>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-600 font-bold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+2.4% vs last cycle</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Fleet Fuel Cost / Mile</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">$0.38 <span className="text-xs text-gray-400 font-normal">/ mi</span></div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">
            -4.2% (EV fleet transition impact)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Fleet Carbon Offset</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">14.2 <span className="text-xs text-gray-400 font-normal">Tons CO₂</span></div>
          <div className="text-[11px] text-teal-700 font-bold mt-1">
            Paris EV + Tokyo Solar Hub
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Gross Operating Margin</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{netMargin}%</div>
          <div className="text-[11px] text-blue-600 font-bold mt-1">
            Total Revenue ${totalRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tabs for Detailed Charts */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-6">
        <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
          <button
            onClick={() => setReportType('efficiency')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors ${
              reportType === 'efficiency' ? 'bg-[#D40511] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Route Efficiency & SLA
          </button>
          <button
            onClick={() => setReportType('fuel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors ${
              reportType === 'fuel' ? 'bg-[#D40511] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Fuel & Energy Economics
          </button>
          <button
            onClick={() => setReportType('drivers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors ${
              reportType === 'drivers' ? 'bg-[#D40511] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Driver Performance Leaderboard
          </button>
        </div>

        {reportType === 'efficiency' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 mb-2 flex items-center">
                <BarChart3 className="w-4 h-4 mr-1.5 text-[#D40511]" />
                Daily Delivery Volume vs Exceptions (Past 7 Days)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DAILY_TREND_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="delivered" name="Delivered On-Time" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="delayed" name="Traffic Delayed" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-gray-900 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-1.5 text-blue-600" />
                Hourly Dispatch & Fulfillment Velocity
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={HOURLY_HEATMAP_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Area type="monotone" dataKey="dispatched" name="Waybills Dispatched" stroke="#D40511" fill="#fee2e2" strokeWidth={2} />
                    <Area type="monotone" dataKey="delivered" name="Proof of Deliveries" stroke="#10B981" fill="#d1fae5" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {reportType === 'fuel' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 mb-2 flex items-center">
                <Fuel className="w-4 h-4 mr-1.5 text-amber-600" />
                Weekly Fuel Spend vs Tolls & Maintenance ($USD)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={FUEL_TREND_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="fuelSpend" name="Diesel & EV Power ($)" fill="#F59E0B" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="tollsSpend" name="Highway Tolls ($)" fill="#6366F1" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="maintenanceSpend" name="Fleet Maintenance ($)" fill="#EF4444" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-gray-900 mb-2 flex items-center">
                <Zap className="w-4 h-4 mr-1.5 text-emerald-600" />
                Unit Delivery Cost Efficiency Trend ($ / stop)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={FUEL_TREND_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[12, 22]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Line type="monotone" dataKey="avgCostPerDelivery" name="Avg Cost Per Drop ($)" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {reportType === 'drivers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Courier Name</th>
                  <th className="py-3 px-4">Vehicle & Base</th>
                  <th className="py-3 px-4">Completed Drops Today</th>
                  <th className="py-3 px-4">Customer Rating</th>
                  <th className="py-3 px-4">Fuel Efficiency</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                {drivers.map((d, index) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#FFCC00] text-gray-900 font-black flex items-center justify-center text-[10px]">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{d.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{d.phone}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{d.vehicleNo}</div>
                      <div className="text-[10px] text-gray-500">{d.vehicleType}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 text-sm">
                      {d.completedToday} parcels
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1 font-bold text-amber-500">
                        <span>★</span>
                        <span className="text-gray-900 font-mono">{d.rating.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {d.fuelLevelPct}% Tank ({d.fuelLevelPct > 50 ? 'Optimal' : 'Refuel Soon'})
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        d.status === 'On Duty' ? 'bg-emerald-100 text-emerald-800' :
                        d.status === 'Available' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
