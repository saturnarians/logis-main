'use client';

import React, { useState } from 'react';
import { useLogistics } from '@/context/LogisticsContext';
import { 
  MapPin, 
  Truck, 
  Play, 
  Pause, 
  Navigation, 
  Layers, 
  Maximize2, 
  List, 
  Search, 
  AlertTriangle,
  CheckCircle2,
  Phone,
  RefreshCw,
  Compass
} from 'lucide-react';

interface LiveMapAndListProps {
  onSelectShipment?: (id: string) => void;
}

export const LiveMapAndList: React.FC<LiveMapAndListProps> = ({ onSelectShipment }) => {
  const { shipments, drivers, isSimulating, toggleSimulation, setTrackedShipmentId } = useLogistics();
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>('drv-101');
  const [mapSearch, setMapSearch] = useState('');

  const handleSelect = (id: string) => {
    if (onSelectShipment) {
      onSelectShipment(id);
    } else {
      setTrackedShipmentId(id);
    }
  };

  const activeShipments = shipments.filter(
    (s) => s.status === 'In Transit' || s.status === 'Out for Delivery' || s.status === 'Delayed'
  );

  const selectedDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];
  const driverShipment = shipments.find((s) => s.driverId === selectedDriver?.id);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
      {/* Map Control Bar */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="font-extrabold text-sm tracking-wide">Live Dispatch Map & Telematics</h3>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-xs text-slate-400 hidden sm:inline font-mono">
            Active Vehicles: {drivers.filter((d) => d.status === 'On Duty').length} / {drivers.length}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Simulation Toggle */}
          <button
            onClick={toggleSimulation}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors ${
              isSimulating
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pause Movement</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Drivers</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Split Canvas & Active Fleet Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[420px]">
        {/* Left 2 Cols: Interactive Vector Map Stage */}
        <div className="lg:col-span-2 relative bg-slate-950 p-4 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
          {/* Subtle Grid Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>

          {/* Top Floating Map Overlays */}
          <div className="relative z-10 flex items-center justify-between pointer-events-none">
            <div className="bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-lg p-2.5 text-xs text-white shadow-xl pointer-events-auto flex items-center space-x-3">
              <Compass className="w-4 h-4 text-[#FFCC00] animate-spin" style={{ animationDuration: '10s' }} />
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">TRACKED FLEET VEHICLE</span>
                <span className="font-bold text-white text-xs">{selectedDriver?.name} ({selectedDriver?.vehicleNo})</span>
              </div>
            </div>

            <div className="bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-lg px-3 py-1.5 text-[11px] font-mono text-emerald-400 pointer-events-auto flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>4G TELEMATICS ONLINE</span>
            </div>
          </div>

          {/* Canvas Map Vector Mock */}
          <div className="relative my-auto h-72 w-full flex items-center justify-center">
            {/* World/Regional Connected Network Lines */}
            <svg className="absolute inset-0 w-full h-full stroke-slate-800" strokeWidth="1">
              <line x1="10%" y1="20%" x2="40%" y2="60%" strokeDasharray="4 4" />
              <line x1="40%" y1="60%" x2="85%" y2="30%" strokeDasharray="4 4" />
              <line x1="20%" y1="80%" x2="70%" y2="70%" strokeDasharray="4 4" />
            </svg>

            {/* Drivers Markers */}
            {drivers.map((drv, idx) => {
              const isSelected = selectedDriverId === drv.id;
              // Map coordinates onto canvas percent
              const topPct = 25 + (idx * 15) % 55;
              const leftPct = 15 + (idx * 22) % 70;

              return (
                <div
                  key={drv.id}
                  onClick={() => setSelectedDriverId(drv.id)}
                  style={{ top: `${topPct}%`, left: `${leftPct}%` }}
                  className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 group transition-all z-20"
                >
                  <div className="relative flex flex-col items-center">
                    {/* Pulse Ring */}
                    {drv.status === 'On Duty' && (
                      <span className="absolute -inset-2 rounded-full bg-red-500/30 animate-ping"></span>
                    )}

                    <div
                      className={`p-2.5 rounded-full border-2 shadow-2xl transition-transform ${
                        isSelected
                          ? 'bg-[#D40511] text-[#FFCC00] border-white scale-125 ring-4 ring-red-500/40 z-30'
                          : drv.status === 'On Duty'
                          ? 'bg-slate-800 text-amber-400 border-amber-400'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                    </div>

                    <div className="mt-1 bg-slate-900/95 border border-slate-700 px-2 py-0.5 rounded shadow text-[10px] font-bold text-white whitespace-nowrap opacity-90 group-hover:opacity-100">
                      {drv.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Map Info Footer */}
          <div className="relative z-10 bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-[#D40511]" />
              <div>
                <span className="text-slate-400 text-[10px] block font-mono">CURRENT WAYPOINT ADDRESS</span>
                <span className="font-semibold text-white">
                  {driverShipment?.currentLocation.address || selectedDriver?.activeRouteName}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-slate-400 font-mono text-[11px]">
              <div>
                <span>Fuel Level: </span>
                <strong className={selectedDriver.fuelLevelPct < 25 ? 'text-red-400' : 'text-emerald-400'}>
                  {selectedDriver.fuelLevelPct}%
                </strong>
              </div>
              <div>
                <span>Rating: </span>
                <strong className="text-amber-400">★ {selectedDriver.rating}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Active Fleet & En-Route Shipments Panel */}
        <div className="bg-slate-50 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center">
                <Truck className="w-4 h-4 mr-1.5 text-[#D40511]" />
                En-Route Drivers ({drivers.length})
              </h4>
            </div>

            {/* Drivers List */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {drivers.map((d) => {
                const isSelected = selectedDriverId === d.id;
                const assignedShipment = shipments.find((s) => s.driverId === d.id);

                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDriverId(d.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#D40511] shadow-md ring-1 ring-red-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={d.avatar}
                          alt={d.name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <h5 className="font-bold text-gray-900 text-xs">{d.name}</h5>
                          <span className="text-[10px] text-gray-500 font-mono">{d.vehicleNo}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          d.status === 'On Duty'
                            ? 'bg-emerald-100 text-emerald-800'
                            : d.status === 'Available'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>

                    {assignedShipment && (
                      <div className="mt-2.5 pt-2 border-t border-gray-100 text-[11px] flex items-center justify-between">
                        <div className="truncate pr-2">
                          <span className="text-gray-400 font-mono">Order: </span>
                          <span className="font-bold text-gray-800 font-mono">{assignedShipment.trackingId}</span>
                          <p className="text-gray-500 truncate text-[10px]">{assignedShipment.destinationCity}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(assignedShipment.trackingId);
                          }}
                          className="bg-red-50 hover:bg-red-100 text-[#D40511] font-bold px-2 py-1 rounded text-[10px] shrink-0"
                        >
                          View
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
