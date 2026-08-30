'use client';

import React from 'react';
import { useLogistics } from '@/context/LogisticsContext';
import { 
  Building2, 
  MapPin, 
  Phone, 
  User, 
  Layers, 
  ArrowUpRight, 
  CheckCircle2, 
  TrendingUp, 
  Truck,
  Activity
} from 'lucide-react';

export const WarehousesHubsView: React.FC = () => {
  const { warehouses } = useLogistics();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#D40511] text-[#FFCC00] text-[10px] font-black px-2 py-0.5 rounded uppercase">
              FACILITY NETWORK
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Fulfillment Hubs & Cross-Dock Facilities
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Global parcel distribution nodes, automated sorting cross-docks, and cold-chain staging zones.
          </p>
        </div>

        <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5">
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>All Hubs Operational (Avg 74% Capacity)</span>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {warehouses.map((hub) => {
          const utilPct = Math.round((hub.currentUsageTons / hub.totalCapacityTons) * 100);

          return (
            <div 
              key={hub.id} 
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5 hover:border-red-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-red-50 text-[#D40511] rounded-2xl">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-extrabold text-gray-900">{hub.name}</h3>
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {hub.code}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center mt-0.5">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      {hub.address}, {hub.city}, {hub.country}
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                  {hub.status}
                </span>
              </div>

              {/* Capacity Progress Bar */}
              <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Storage Utilization</span>
                  <span className="font-mono">{hub.currentUsageTons} / {hub.totalCapacityTons} Tons ({utilPct}%)</span>
                </div>
                <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      utilPct > 85 ? 'bg-red-500' : utilPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${utilPct}%` }}
                  />
                </div>
              </div>

              {/* Hub Metrics */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-gray-500 font-bold block">Active Docks</span>
                  <span className="text-base font-black text-gray-900 font-mono mt-0.5 block">
                    {hub.activeDocks} <span className="text-xs text-gray-500 font-normal">/ {hub.totalDocks}</span>
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-gray-500 font-bold block">Inbound Today</span>
                  <span className="text-base font-black text-emerald-600 font-mono mt-0.5 block">
                    {hub.inboundToday} <span className="text-xs text-gray-500 font-normal">pkgs</span>
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-gray-500 font-bold block">Outbound Today</span>
                  <span className="text-base font-black text-blue-600 font-mono mt-0.5 block">
                    {hub.outboundToday} <span className="text-xs text-gray-500 font-normal">pkgs</span>
                  </span>
                </div>
              </div>

              {/* Manager & Contact */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Station Manager: <strong className="text-gray-900">{hub.managerName}</strong></span>
                </div>
                <div className="flex items-center space-x-1 font-mono text-gray-500">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{hub.contactPhone}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
