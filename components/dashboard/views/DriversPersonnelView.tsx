'use client';

import React, { useState } from 'react';
import { useLogistics } from '@/context/LogisticsContext';
import { Driver, DriverStatus } from '@/types/logistics';
import { 
  Users, 
  Phone, 
  Truck, 
  Star, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  Search, 
  Award, 
  Battery, 
  MapPin,
  FileCheck
} from 'lucide-react';

export const DriversPersonnelView: React.FC = () => {
  const { drivers, updateDriverStatus, shipments } = useLogistics();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredDrivers = drivers.filter((d) => {
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchesSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.vehicleNo.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#D40511] text-[#FFCC00] text-[10px] font-black px-2 py-0.5 rounded uppercase">
              PERSONNEL ROSTER
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Couriers & Field Driver Operations
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time shift statuses, delivery SLAs, customer ratings, license compliance, and contact channels.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{drivers.filter(d => d.status === 'On Duty').length} Couriers Active Now</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          {['All', 'On Duty', 'Available', 'Off Duty'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                statusFilter === st
                  ? 'bg-gray-900 text-[#FFCC00] shadow'
                  : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
              }`}
            >
              {st} ({st === 'All' ? drivers.length : drivers.filter(d => d.status === st).length})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search driver by name, phone, plate..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-800 font-medium focus:outline-none focus:border-[#D40511]"
          />
        </div>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.map((driver) => {
          const activeDrops = shipments.filter(
            (s) => s.driverId === driver.id && (s.status === 'In Transit' || s.status === 'Out for Delivery')
          ).length;

          return (
            <div 
              key={driver.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:border-red-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFCC00] text-gray-900 font-black flex items-center justify-center text-sm shadow-inner border border-amber-400">
                      {driver.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900">{driver.name}</h3>
                      <div className="text-[11px] text-gray-500 font-mono flex items-center">
                        <Phone className="w-3 h-3 mr-1 text-gray-400" />
                        {driver.phone}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                    driver.status === 'On Duty' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                    driver.status === 'Available' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                    'bg-gray-100 text-gray-700 border-gray-300'
                  }`}>
                    {driver.status}
                  </span>
                </div>

                {/* Metrics */}
                <div className="bg-slate-50 p-3 rounded-xl space-y-2 text-xs mb-4">
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="flex items-center">
                      <Truck className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      Vehicle:
                    </span>
                    <span className="font-bold text-gray-900 font-mono">{driver.vehicleNo} ({driver.vehicleType})</span>
                  </div>

                  <div className="flex justify-between items-center text-gray-600">
                    <span className="flex items-center">
                      <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      Drops Completed Today:
                    </span>
                    <span className="font-mono font-black text-emerald-600">{driver.completedToday}</span>
                  </div>

                  <div className="flex justify-between items-center text-gray-600">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      Active In-Flight Drops:
                    </span>
                    <span className="font-mono font-bold text-blue-700">{activeDrops}</span>
                  </div>

                  <div className="flex justify-between items-center text-gray-600">
                    <span className="flex items-center">
                      <Star className="w-3.5 h-3.5 mr-1 text-amber-500 fill-amber-500" />
                      Courier Rating:
                    </span>
                    <span className="font-mono font-black text-gray-900">{driver.rating.toFixed(2)} / 5.0</span>
                  </div>

                  <div className="flex justify-between items-center text-gray-600">
                    <span className="flex items-center">
                      <FileCheck className="w-3.5 h-3.5 mr-1 text-teal-600" />
                      License Compliance:
                    </span>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded">
                      Commercial Class A (Valid 2027)
                    </span>
                  </div>
                </div>
              </div>

              {/* Duty Toggle Control */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Set Shift:</span>
                <div className="flex items-center space-x-1">
                  {(['On Duty', 'Available', 'Off Duty'] as DriverStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => updateDriverStatus(driver.id, st)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-colors ${
                        driver.status === st
                          ? 'bg-[#D40511] text-white shadow'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
