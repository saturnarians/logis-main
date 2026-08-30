'use client';

import React, { useState } from 'react';
import { useLogistics } from '@/context/LogisticsContext';
import { Shipment, ShipmentStatus } from '@/types/logistics';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  MoreVertical, 
  Truck, 
  UserCheck, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText,
  Calendar,
  ExternalLink
} from 'lucide-react';

interface OrderDispatchTableProps {
  onOpenCreateModal?: () => void;
  onOpenExportModal?: () => void;
  onOpenPodModal?: (shipment: Shipment) => void;
  onSelectShipment?: (trackingId: string) => void;
}

export const OrderDispatchTable: React.FC<OrderDispatchTableProps> = ({
  onOpenCreateModal,
  onOpenExportModal,
  onOpenPodModal,
  onSelectShipment,
}) => {
  const { 
    shipments, 
    drivers, 
    statusFilter, 
    setStatusFilter, 
    searchQuery, 
    setSearchQuery,
    dateRange,
    setDateRange,
    updateShipmentStatus,
    assignDriverToShipment
  } = useLogistics();

  const [assigningShipmentId, setAssigningShipmentId] = useState<string | null>(null);
  const [selectedDriverForAssign, setSelectedDriverForAssign] = useState<string>('');

  // Filter shipments
  const filteredShipments = shipments.filter((s) => {
    // Status filter
    if (statusFilter !== 'All' && s.status !== statusFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTracking = s.trackingId.toLowerCase().includes(q);
      const matchOrder = s.orderId.toLowerCase().includes(q);
      const matchCustomer = s.customerName.toLowerCase().includes(q);
      const matchDriver = (s.driverName || '').toLowerCase().includes(q);
      const matchCity = s.originCity.toLowerCase().includes(q) || s.destinationCity.toLowerCase().includes(q);
      if (!matchTracking && !matchOrder && !matchCustomer && !matchDriver && !matchCity) {
        return false;
      }
    }

    return true;
  });

  const handleAssignSubmit = (shipmentId: string) => {
    if (selectedDriverForAssign) {
      assignDriverToShipment(shipmentId, selectedDriverForAssign);
      setAssigningShipmentId(null);
      setSelectedDriverForAssign('');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
      {/* Table Header & Action Bar */}
      <div className="p-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h3 className="font-extrabold text-base text-gray-900 tracking-tight">Order & Dispatch Management</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage live parcel manifests, assign drivers, verify PoD, and update real-time dispatch statuses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Selector */}
          <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1 text-xs font-semibold text-gray-700 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-gray-400 mx-1.5" />
            {(['Today', 'This Week', 'This Month'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-2.5 py-1 rounded ${
                  dateRange === r ? 'bg-[#D40511] text-white font-bold' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenExportModal}
            className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-gray-600" />
            <span>Export CSV/PDF</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="bg-[#D40511] hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Order</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Pills Bar */}
      <div className="p-4 bg-white border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Tracking ID, Customer, Driver, or City..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#D40511] focus:ring-1 focus:ring-red-200 text-gray-900 font-medium"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['All', 'Pending', 'In Transit', 'Out for Delivery', 'Delivered', 'Delayed', 'Canceled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full font-bold transition-colors ${
                statusFilter === st
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-100 text-gray-600 font-extrabold uppercase text-[10px] tracking-wider border-b border-gray-200">
            <tr>
              <th className="py-3 px-4">Waybill / Order ID</th>
              <th className="py-3 px-4">Customer & Parcel</th>
              <th className="py-3 px-4">Route (Origin → Dest)</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Priority / SLA</th>
              <th className="py-3 px-4">Assigned Driver</th>
              <th className="py-3 px-4">Proof of Delivery</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 font-medium">
            {filteredShipments.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-500">
                  No shipments found matching the selected filters.
                </td>
              </tr>
            ) : (
              filteredShipments.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Waybill & Order ID */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => onSelectShipment?.(s.trackingId)}
                      className="font-mono font-bold text-gray-900 hover:text-[#D40511] flex items-center group"
                    >
                      <span>{s.trackingId}</span>
                      <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 text-[#D40511]" />
                    </button>
                    <span className="text-[10px] text-gray-400 font-mono block">{s.orderId}</span>
                  </td>

                  {/* Customer & Parcel Details */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-gray-900 block truncate max-w-[160px]">{s.customerName}</span>
                    <span className="text-[10px] text-gray-500 block">
                      {s.parcelType} ({s.weightKg} kg)
                    </span>
                  </td>

                  {/* Route */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1.5 font-semibold text-gray-800">
                      <span>{s.originCity}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-[#D40511]">{s.destinationCity}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 block font-mono">ETA: {s.estimatedDelivery}</span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        s.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : s.status === 'Delayed'
                          ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                          : s.status === 'In Transit' || s.status === 'Out for Delivery'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>

                  {/* Priority / SLA */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        s.priority === 'Overnight'
                          ? 'bg-purple-100 text-purple-800'
                          : s.priority === 'Express'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {s.priority}
                    </span>
                  </td>

                  {/* Driver Assignment */}
                  <td className="py-3.5 px-4">
                    {assigningShipmentId === s.id ? (
                      <div className="flex items-center space-x-1">
                        <select
                          value={selectedDriverForAssign}
                          onChange={(e) => setSelectedDriverForAssign(e.target.value)}
                          className="text-xs border border-gray-300 rounded p-1 outline-none text-gray-900 bg-white"
                        >
                          <option value="">Select Driver</option>
                          {drivers.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.vehicleNo})
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssignSubmit(s.id)}
                          className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-1 rounded"
                        >
                          Save
                        </button>
                      </div>
                    ) : s.driverName ? (
                      <div className="flex items-center space-x-1.5">
                        <Truck className="w-3.5 h-3.5 text-gray-500" />
                        <div>
                          <span className="font-bold text-gray-900 block text-xs">{s.driverName}</span>
                          <span className="text-[10px] text-gray-400 font-mono block">{s.vehicleNo}</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAssigningShipmentId(s.id)}
                        className="text-xs text-[#D40511] hover:underline font-bold flex items-center space-x-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Assign Driver</span>
                      </button>
                    )}
                  </td>

                  {/* PoD Status */}
                  <td className="py-3.5 px-4">
                    {s.proofOfDelivery?.verified ? (
                      <button
                        onClick={() => onOpenPodModal?.(s)}
                        className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded hover:bg-emerald-100"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        <span>PoD Verified</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenPodModal?.(s)}
                        className="inline-flex items-center text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded hover:bg-gray-200"
                      >
                        <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                        <span>Capture PoD</span>
                      </button>
                    )}
                  </td>

                  {/* Quick Action Selector */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <select
                        onChange={(e) => {
                          const val = e.target.value as ShipmentStatus;
                          if (val) updateShipmentStatus(s.id, val);
                        }}
                        defaultValue=""
                        className="text-[11px] font-semibold border border-gray-300 rounded px-2 py-1 outline-none text-gray-800 bg-white"
                      >
                        <option value="" disabled>
                          Update Status
                        </option>
                        <option value="In Transit">In Transit</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Delayed">Delayed</option>
                        <option value="Canceled">Canceled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
