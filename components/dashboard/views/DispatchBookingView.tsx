'use client';

import React, { useState } from 'react';
import { useLogistics } from '@/context/LogisticsContext';
import { PriorityLevel } from '@/types/logistics';
import { 
  Send, 
  User, 
  MapPin, 
  Package, 
  DollarSign, 
  Truck, 
  Calendar, 
  Sparkles, 
  CheckCircle2,
  FileCheck,
  Calculator,
  ArrowRight
} from 'lucide-react';

interface DispatchBookingViewProps {
  onSuccess?: () => void;
}

export const DispatchBookingView: React.FC<DispatchBookingViewProps> = ({ onSuccess }) => {
  const { drivers, createShipment, tariffs } = useLogistics();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [senderName, setSenderName] = useState('DHL Freight Hub Staging');
  const [senderAddress, setSenderAddress] = useState('Central Slough Logistics Center, UK');
  const [originCity, setOriginCity] = useState('London');
  const [destinationCity, setDestinationCity] = useState('Paris');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Express');
  const [weightKg, setWeightKg] = useState<number>(5.0);
  const [parcelType, setParcelType] = useState('General Commercial Freight');
  const [estimatedDelivery, setEstimatedDelivery] = useState('2026-08-09 18:00');
  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[0]?.id || '');
  const [costUsd, setCostUsd] = useState<number>(35.00);
  const [revenueUsd, setRevenueUsd] = useState<number>(115.00);
  const [fuelCostUsd, setFuelCostUsd] = useState<number>(12.50);

  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Auto calculate cost when weight or priority changes
  const handleRecalculateRate = () => {
    const base = priority === 'Overnight' ? 65 : priority === 'Express' ? 40 : 25;
    const calcCost = Number((base + weightKg * 3.2).toFixed(2));
    const calcRev = Number((calcCost * 2.8).toFixed(2));
    const calcFuel = Number((calcCost * 0.28).toFixed(2));
    setCostUsd(calcCost);
    setRevenueUsd(calcRev);
    setFuelCostUsd(calcFuel);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !recipientAddress) {
      alert('Please fill in Customer Name and Destination Address.');
      return;
    }

    const assignedDriver = drivers.find((d) => d.id === selectedDriverId);

    createShipment({
      orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      trackingId: `DHL-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`,
      customerName,
      customerPhone: customerPhone || '+44 20 7946 0000',
      senderName,
      senderAddress,
      recipientAddress,
      originCity,
      destinationCity,
      status: selectedDriverId ? 'In Transit' : 'Pending',
      priority,
      weightKg: Number(weightKg),
      parcelType,
      estimatedDelivery,
      driverId: selectedDriverId || undefined,
      driverName: assignedDriver?.name,
      vehicleNo: assignedDriver?.vehicleNo,
      costUsd: Number(costUsd),
      revenueUsd: Number(revenueUsd),
      fuelCostUsd: Number(fuelCostUsd),
      proofOfDelivery: {
        verified: false,
        otpCode: Math.floor(100000 + Math.random() * 900000).toString(),
      },
    });

    setBookingSuccess(`Waybill booked and registered! Notification sent to courier ${assignedDriver?.name || 'Pending Queue'}.`);
    
    // Reset form
    setCustomerName('');
    setRecipientAddress('');
    if (onSuccess) onSuccess();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#D40511] text-[#FFCC00] text-[10px] font-black px-2 py-0.5 rounded uppercase">
              DISPATCH & BOOKING
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Order Creation & Courier Assignment
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Generate digital waybills, automatically assign field couriers, calculate weight-based tariffs, and initiate SLA tracking.
          </p>
        </div>

        <button
          onClick={handleRecalculateRate}
          className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-sm flex items-center space-x-1.5 transition-colors"
        >
          <Calculator className="w-4 h-4 text-amber-700" />
          <span>Auto-Calculate Tariff</span>
        </button>
      </div>

      {bookingSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex items-center justify-between text-emerald-900 text-xs font-bold animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{bookingSuccess}</span>
          </div>
          <button
            onClick={() => setBookingSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-black uppercase"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Booking Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        {/* Section 1: Customer & Consignee Information */}
        <div>
          <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2 flex items-center mb-4">
            <User className="w-4 h-4 mr-1.5 text-[#D40511]" />
            1. Consignee & Customer Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Customer / Company Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. BioHealth Pharma / Sony Europe"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-semibold focus:outline-none focus:border-[#D40511]"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Contact Phone Number *</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+44 20 7946 0912"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-semibold focus:outline-none focus:border-[#D40511]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 font-bold mb-1">Delivery Destination Address *</label>
              <input
                type="text"
                required
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="e.g. 45 Tech City Blvd, Shoreditch, London EC2A 4NE"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-semibold focus:outline-none focus:border-[#D40511]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Freight Specifications */}
        <div>
          <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2 flex items-center mb-4">
            <Package className="w-4 h-4 mr-1.5 text-blue-600" />
            2. Freight & Cargo Specifications
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Parcel Classification</label>
              <select
                value={parcelType}
                onChange={(e) => setParcelType(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-semibold focus:outline-none focus:border-[#D40511]"
              >
                <option value="High-Value Electronics">High-Value Electronics</option>
                <option value="Temperature Sensitive Medical">Temperature Sensitive Medical</option>
                <option value="Industrial Machinery Parts">Industrial Machinery Parts</option>
                <option value="Designer Apparel & Footwear">Designer Apparel & Footwear</option>
                <option value="General Commercial Freight">General Commercial Freight</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Gross Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={weightKg}
                onChange={(e) => {
                  setWeightKg(parseFloat(e.target.value) || 1);
                  handleRecalculateRate();
                }}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-semibold focus:outline-none focus:border-[#D40511]"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Priority Tier</label>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value as PriorityLevel);
                  handleRecalculateRate();
                }}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-semibold focus:outline-none focus:border-[#D40511]"
              >
                <option value="Standard">Standard (2-3 Business Days)</option>
                <option value="Express">Express (Next Day 24h)</option>
                <option value="Overnight">Overnight First Class (Early AM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Driver & Route Assignment */}
        <div>
          <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2 flex items-center mb-4">
            <Truck className="w-4 h-4 mr-1.5 text-emerald-600" />
            3. Fleet Driver & Route Assignment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Assign Courier / Field Agent</label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-bold focus:outline-none focus:border-[#D40511]"
              >
                <option value="">Leave Unassigned (Dispatch Queue)</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.vehicleNo} - {d.vehicleType}) - {d.status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Estimated Delivery Timestamp</label>
              <input
                type="text"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-mono font-semibold focus:outline-none focus:border-[#D40511]"
              />
            </div>
          </div>
        </div>

        {/* Price & Tariffs Preview */}
        <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-gray-500 font-bold block">Quoted Customer Tariff</span>
            <div className="text-xl font-black text-gray-900">${revenueUsd} <span className="text-xs font-normal text-gray-500">USD</span></div>
          </div>

          <div className="flex items-center space-x-6 font-mono text-gray-600">
            <div>
              <span className="text-[10px] text-gray-400 block font-sans font-bold">Estimated Cost</span>
              <span className="font-bold text-gray-800">${costUsd}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block font-sans font-bold">Fuel Surcharge</span>
              <span className="font-bold text-gray-800">${fuelCostUsd}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block font-sans font-bold">Est. Margin</span>
              <span className="font-bold text-emerald-600">+{(((revenueUsd - costUsd) / revenueUsd) * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="submit"
            className="bg-[#D40511] hover:bg-red-700 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 transition-transform hover:scale-105"
          >
            <Send className="w-4 h-4" />
            <span>Confirm & Dispatch Waybill</span>
          </button>
        </div>
      </form>
    </div>
  );
};
