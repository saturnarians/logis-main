'use client';

import React, { useState } from 'react';
import { useLogistics } from '@/context/LogisticsContext';
import { Shipment, ShipmentStatus } from '@/types/logistics';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ArrowUpDown, 
  Eye, 
  Truck,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

interface ShipmentsOrdersViewProps {
  onOpenCreateOrder?: () => void;
  onOpenPodModal?: (shipment: Shipment) => void;
  onSelectShipment?: (trackingId: string) => void;
}

export const ShipmentsOrdersView: React.FC<ShipmentsOrdersViewProps> = ({
  onOpenCreateOrder,
  onOpenPodModal,
  onSelectShipment,
}) => {
  const { 
    shipments, 
    statusFilter, 
    setStatusFilter, 
    searchQuery, 
    setSearchQuery, 
    updateShipmentStatus,
    setTrackedShipmentId,
  } = useLogistics();

  const handleSelect = (trackingId: string) => {
    if (onSelectShipment) {
      onSelectShipment(trackingId);
    } else {
      setTrackedShipmentId(trackingId);
    }
  };

  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'createdAt' | 'estimatedDelivery' | 'weightKg'>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);

  // Status Filter Tabs
  const statuses: (ShipmentStatus | 'All')[] = [
    'All',
    'Pending',
    'In Transit',
    'Out for Delivery',
    'Delivered',
    'Delayed',
    'Canceled',
  ];

  // Filtering Logic
  const filteredShipments = shipments.filter((s) => {
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || s.priority === priorityFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.trackingId.toLowerCase().includes(q) ||
      s.orderId.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q) ||
      s.recipientAddress.toLowerCase().includes(q) ||
      (s.driverName && s.driverName.toLowerCase().includes(q));

    return matchesStatus && matchesPriority && matchesSearch;
  }).sort((a, b) => {
    if (sortField === 'weightKg') {
      return sortAsc ? a.weightKg - b.weightKg : b.weightKg - a.weightKg;
    }
    const valA = new Date(a[sortField]).getTime() || 0;
    const valB = new Date(b[sortField]).getTime() || 0;
    return sortAsc ? valA - valB : valB - valA;
  });

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Out for Delivery':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Delayed':
        return 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
      case 'Canceled':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#D40511] text-[#FFCC00] text-[10px] font-black px-2 py-0.5 rounded uppercase">
              ORDER REPOSITORY
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Shipments & Waybill Ledger
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time multi-carrier manifest tracking, milestone event triggers, and digital proof of delivery.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const csvContent = 'data:text/csv;charset=utf-8,' + 
                ['Tracking ID,Customer,Status,Priority,Origin,Destination,Driver,Est Delivery'].join(',') + '\n' +
                filteredShipments.map(s => `"${s.trackingId}","${s.customerName}","${s.status}","${s.priority}","${s.originCity}","${s.destinationCity}","${s.driverName || 'Unassigned'}","${s.estimatedDelivery}"`).join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `dhl-shipments-${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenCreateOrder}
            className="bg-[#D40511] hover:bg-red-700 text-white font-black text-xs px-4 py-2 rounded-xl shadow flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Waybill</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
        {/* Status Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {statuses.map((s) => {
            const count = s === 'All' ? shipments.length : shipments.filter((x) => x.status === s).length;
            const isSelected = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-gray-900 text-[#FFCC00] shadow-sm scale-105'
                    : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                }`}
              >
                <span>{s}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-gray-800 text-amber-300' : 'bg-white text-gray-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search and Secondary Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Tracking #, Customer, City, or Courier..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#D40511] font-medium"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-800 font-semibold focus:outline-none focus:border-[#D40511]"
            >
              <option value="All">All Priorities</option>
              <option value="Standard">Standard Delivery</option>
              <option value="Express">Express Air (24h)</option>
              <option value="Overnight">Overnight First Class</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Sort:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-800 font-semibold focus:outline-none focus:border-[#D40511]"
            >
              <option value="createdAt">Created Date</option>
              <option value="estimatedDelivery">Estimated SLA</option>
              <option value="weightKg">Weight (kg)</option>
            </select>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-700"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-gray-200 text-gray-500 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Waybill / Order ID</th>
                <th className="py-3 px-4">Customer & Parcel</th>
                <th className="py-3 px-4">Origin / Destination</th>
                <th className="py-3 px-4">Status & Exception</th>
                <th className="py-3 px-4">Assigned Courier</th>
                <th className="py-3 px-4">SLA Deadline</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No shipments match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Waybill */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleSelect(shipment.trackingId)}
                        className="font-mono font-bold text-[#D40511] hover:underline block text-left"
                      >
                        {shipment.trackingId}
                      </button>
                      <span className="text-[10px] text-gray-400 font-mono">{shipment.orderId}</span>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{shipment.customerName}</div>
                      <div className="text-[10px] text-gray-500">
                        {shipment.parcelType} ({shipment.weightKg} kg)
                      </div>
                    </td>

                    {/* Route */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1 font-semibold text-gray-800">
                        <span className="truncate max-w-[110px]">{shipment.originCity}</span>
                        <span className="text-gray-400">→</span>
                        <span className="truncate max-w-[110px] text-gray-900 font-bold">{shipment.destinationCity}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider w-fit ${getStatusBadge(shipment.status)}`}>
                          {shipment.status}
                        </span>
                        {shipment.flaggedForDelay && (
                          <span className="text-[10px] text-red-600 font-bold flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {shipment.delayReason || 'Delay flagged'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Driver */}
                    <td className="py-3 px-4">
                      {shipment.driverName ? (
                        <div>
                          <div className="font-bold text-gray-900 flex items-center">
                            <Truck className="w-3.5 h-3.5 mr-1 text-slate-500" />
                            {shipment.driverName}
                          </div>
                          <span className="text-[10px] font-mono text-gray-400">{shipment.vehicleNo}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-bold">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Estimated Delivery */}
                    <td className="py-3 px-4 font-mono text-xs">
                      <div>{shipment.estimatedDelivery}</div>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                        shipment.priority === 'Overnight' ? 'bg-purple-100 text-purple-800' :
                        shipment.priority === 'Express' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {shipment.priority}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleSelect(shipment.trackingId)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-gray-700 transition-colors"
                          title="Inspect Journey"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {shipment.proofOfDelivery && (
                          <button
                            onClick={() => onOpenPodModal?.(shipment)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                            title="View Proof of Delivery"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
