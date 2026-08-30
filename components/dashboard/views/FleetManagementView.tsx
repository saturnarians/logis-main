'use client';

import React, { useState } from 'react';
import { useLogistics } from '@/context/LogisticsContext';
import { Vehicle, VehicleStatus } from '@/types/logistics';
import { 
  Truck, 
  Plus, 
  Fuel, 
  Gauge, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Search,
  ShieldCheck,
  Zap,
  Radio
} from 'lucide-react';

export const FleetManagementView: React.FC = () => {
  const { vehicles, updateVehicleStatus, addVehicle } = useLogistics();
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for new vehicle
  const [plateNo, setPlateNo] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState('Electric Cargo Van');
  const [driverName, setDriverName] = useState('');
  const [mileageKm, setMileageKm] = useState(12000);
  const [fuelLevelPct, setFuelLevelPct] = useState(90);

  const filteredVehicles = vehicles.filter((v) => {
    if (filterStatus === 'All') return true;
    return v.status === filterStatus;
  });

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNo || !model) return;

    addVehicle({
      plateNo,
      model,
      type,
      status: 'Available',
      driverName: driverName || undefined,
      fuelLevelPct: Number(fuelLevelPct),
      mileageKm: Number(mileageKm),
      nextServiceDate: '2026-11-15',
      maxPayloadKg: 1200,
      lastInspectionPassed: true,
      gpsDeviceId: `GPS-TRK-${Math.floor(100 + Math.random() * 900)}`,
    });

    setShowAddModal(false);
    setPlateNo('');
    setModel('');
  };

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'En Route':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'In-Maintenance':
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#D40511] text-[#FFCC00] text-[10px] font-black px-2 py-0.5 rounded uppercase">
              FLEET TELEMATICS
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Vehicle Profiles & Maintenance Telemetry
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time IoT diagnostics: Fuel/battery health, odometer telemetry, payload limits, and scheduled service.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#D40511] hover:bg-red-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Fleet Vehicle</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-500">Total Active Fleet</span>
          <div className="text-2xl font-black text-gray-900 mt-1">{vehicles.length} Units</div>
          <span className="text-[11px] text-emerald-600 font-bold">100% telemetry connected</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-500">En Route on Duty</span>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {vehicles.filter(v => v.status === 'En Route').length} Units
          </div>
          <span className="text-[11px] text-gray-500">Active telemetry streaming</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-500">Scheduled In-Maintenance</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {vehicles.filter(v => v.status === 'In-Maintenance').length} Units
          </div>
          <span className="text-[11px] text-amber-700 font-bold">Inspection garage</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-500">Zero-Emission EV Ratio</span>
          <div className="text-2xl font-black text-teal-600 mt-1">
            {Math.round((vehicles.filter(v => v.type.toLowerCase().includes('electric')).length / Math.max(1, vehicles.length)) * 100)}%
          </div>
          <span className="text-[11px] text-teal-700 font-bold">Green fleet initiative</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
        {['All', 'Available', 'En Route', 'In-Maintenance'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              filterStatus === st
                ? 'bg-gray-900 text-[#FFCC00] shadow'
                : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
            }`}
          >
            {st} ({st === 'All' ? vehicles.length : vehicles.filter(v => v.status === st).length})
          </button>
        ))}
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((vehicle) => (
          <div 
            key={vehicle.id} 
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:border-red-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-red-50 text-[#D40511] rounded-xl font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">{vehicle.plateNo}</h3>
                    <p className="text-[11px] text-gray-500">{vehicle.model}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusBadge(vehicle.status)}`}>
                  {vehicle.status}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl space-y-2 text-xs mb-4">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Assigned Courier:</span>
                  <span className="font-bold text-gray-900">{vehicle.driverName || 'Pool Reserve'}</span>
                </div>

                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Odometer Mileage:</span>
                  <span className="font-mono font-bold text-gray-900">{vehicle.mileageKm.toLocaleString()} km</span>
                </div>

                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Max Payload:</span>
                  <span className="font-mono font-bold text-gray-900">{vehicle.maxPayloadKg} kg</span>
                </div>

                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Telematics GPS:</span>
                  <span className="font-mono text-emerald-600 font-bold flex items-center">
                    <Radio className="w-3 h-3 mr-1" />
                    {vehicle.gpsDeviceId}
                  </span>
                </div>
              </div>

              {/* Fuel / Charge Bar */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-[11px] font-bold text-gray-600">
                  <span className="flex items-center">
                    <Fuel className="w-3.5 h-3.5 mr-1 text-amber-500" />
                    Fuel / Battery Level
                  </span>
                  <span className="font-mono">{vehicle.fuelLevelPct}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      vehicle.fuelLevelPct < 25 ? 'bg-red-500' : vehicle.fuelLevelPct < 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${vehicle.fuelLevelPct}%` }}
                  />
                </div>
              </div>

              {/* Maintenance info */}
              <div className="text-[11px] text-gray-500 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  Next Service: <strong className="ml-1 font-mono text-gray-700">{vehicle.nextServiceDate}</strong>
                </span>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-0.5" />
                  Passed
                </span>
              </div>
            </div>

            {/* Quick Status Switcher */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Set Status:</span>
              <div className="flex items-center space-x-1">
                {(['Available', 'En Route', 'In-Maintenance'] as VehicleStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => updateVehicleStatus(vehicle.id, st)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-colors ${
                      vehicle.status === st
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {st === 'In-Maintenance' ? 'Maint' : st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-black text-gray-900 flex items-center">
              <Truck className="w-5 h-5 mr-2 text-[#D40511]" />
              Register New Fleet Vehicle
            </h2>

            <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">License Plate / Vehicle No *</label>
                <input
                  type="text"
                  required
                  value={plateNo}
                  onChange={(e) => setPlateNo(e.target.value)}
                  placeholder="e.g. DHL-EV-901"
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Make & Model *</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Mercedes-Benz eSprinter"
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Vehicle Classification</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="Electric Cargo Van">Electric Cargo Van (Zero Emission)</option>
                  <option value="Heavy Freight Rig">Heavy Freight Rig (Class 8 Truck)</option>
                  <option value="Courier Transit Van">Courier Transit Van</option>
                  <option value="Aviation Feeder Truck">Aviation Feeder Truck</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Assigned Driver (Optional)</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
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
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
