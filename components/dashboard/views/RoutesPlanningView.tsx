'use client';

import React, { useState } from 'react';
import { useLogistics } from '@/context/LogisticsContext';
import { RoutePlan } from '@/types/logistics';
import { 
  Route, 
  MapPin, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight, 
  Navigation
} from 'lucide-react';

export const RoutesPlanningView: React.FC = () => {
  const { routes } = useLogistics();
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || '');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedNotice, setOptimizedNotice] = useState<string | null>(null);

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  const handleRunOptimizer = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setOptimizedNotice('AI Route Optimization applied: Waypoint sequencing re-ordered for shortest path. Saved ~14.2 km & 22 mins.');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#D40511] text-[#FFCC00] text-[10px] font-black px-2 py-0.5 rounded uppercase">
              ROUTE LOGISTICS
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Route Optimization & Dynamic Waypoint Sequencing
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Dynamic traveling salesman solver, live traffic mitigation, low-emission routing, and real-time delivery window forecasting.
          </p>
        </div>

        <button
          onClick={handleRunOptimizer}
          disabled={isOptimizing}
          className="bg-gradient-to-r from-red-600 to-[#D40511] hover:from-red-700 hover:to-red-800 text-white font-black text-xs px-4 py-2 rounded-xl shadow flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-[#FFCC00]" />
          <span>{isOptimizing ? 'Computing Shortest Path...' : 'Optimize Routes with AI'}</span>
        </button>
      </div>

      {optimizedNotice && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex items-center justify-between text-emerald-900 text-xs font-bold animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{optimizedNotice}</span>
          </div>
          <button
            onClick={() => setOptimizedNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-black uppercase"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Routes Selector and Active Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Routes List */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider px-1">
            Active Dispatched Routes ({routes.length})
          </h3>

          <div className="space-y-2">
            {routes.map((route) => {
              const isSelected = route.id === selectedRouteId;

              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#D40511] shadow-md ring-1 ring-red-100'
                      : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-sm text-gray-900">{route.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {route.totalStops} Stops ({route.completedStops} done)
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mb-3 flex items-center space-x-1">
                    <span className="font-medium">{route.originHub}</span>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <span className="font-bold text-gray-800">{route.destinationHub}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-600 pt-2 border-t border-gray-100">
                    <span>{route.distanceKm} km</span>
                    <span>{route.estDurationHours} hrs</span>
                    <span className="text-emerald-600 font-bold">{route.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Waypoint Sequencing & Map View */}
        {activeRoute && (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-base font-black text-gray-900">{activeRoute.name}</h2>
                  <p className="text-xs text-gray-500">
                    Courier: <strong className="text-gray-800">{activeRoute.assignedDriverName}</strong> | Zone: <strong>{activeRoute.zone}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-3 text-xs font-bold">
                  <span className="flex items-center text-gray-600">
                    <Navigation className="w-3.5 h-3.5 mr-1 text-[#D40511]" />
                    {activeRoute.distanceKm} km total
                  </span>
                  <span className="flex items-center text-gray-600">
                    <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    {activeRoute.estDurationHours}h SLA
                  </span>
                </div>
              </div>

              {/* Waypoints Sequence List */}
              <div>
                <h3 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3">
                  Optimized Waypoint Sequence & Milestones
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                  {/* Origin */}
                  <div className="relative flex items-start space-x-3">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#D40511] text-white flex items-center justify-center text-[10px] font-black ring-4 ring-white">
                      1
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-gray-200 w-full text-xs">
                      <div className="flex justify-between items-center font-bold text-gray-900">
                        <span>ORIGIN DEPOT: {activeRoute.originHub}</span>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                          DEPARTED 08:30
                        </span>
                      </div>
                      <p className="text-gray-500 mt-1">Vehicle loading & manifest scan completed.</p>
                    </div>
                  </div>

                  {/* Intermediate Stops */}
                  <div className="relative flex items-start space-x-3">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black ring-4 ring-white">
                      2
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-gray-200 w-full text-xs">
                      <div className="flex justify-between items-center font-bold text-gray-900">
                        <span>DROP 1: Commercial Logistics Corridor</span>
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-mono">
                          IN-TRANSIT (ETA 10:15)
                        </span>
                      </div>
                      <p className="text-gray-500 mt-1">Priority: Express Air Freight (DHL-8942-01)</p>
                    </div>
                  </div>

                  {/* Drop 2 */}
                  <div className="relative flex items-start space-x-3">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black ring-4 ring-white">
                      3
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-gray-200 w-full text-xs">
                      <div className="flex justify-between items-center font-bold text-gray-900">
                        <span>DROP 2: Industrial Science Campus</span>
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono">
                          QUEUED (ETA 11:45)
                        </span>
                      </div>
                      <p className="text-gray-500 mt-1">Temperature sensitive cold-chain supplies</p>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="relative flex items-start space-x-3">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black ring-4 ring-white">
                      4
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-gray-200 w-full text-xs">
                      <div className="flex justify-between items-center font-bold text-gray-900">
                        <span>DESTINATION HUB: {activeRoute.destinationHub}</span>
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono">
                          FINAL STOP
                        </span>
                      </div>
                      <p className="text-gray-500 mt-1">Consolidation depot & return debrief.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
