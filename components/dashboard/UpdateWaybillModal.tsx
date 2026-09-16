'use client';

import React, { useState, useEffect } from 'react';
import { Shipment, ShipmentStatus } from '@/types/logistics';
import { useLogistics } from '@/context/LogisticsContext';
import { X, MapPin, AlertCircle, CheckCircle2, Globe } from 'lucide-react';

interface UpdateWaybillModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: Shipment | null;
}

const COUNTRIES = [
  'Germany',
  'United Kingdom',
  'United States',
  'Nigeria',
  'France',
  'Ghana',
  'Canada',
  'Netherlands',
  'Australia',
  'United Arab Emirates',
  'Custom',
];

export const UpdateWaybillModal: React.FC<UpdateWaybillModalProps> = ({
  isOpen,
  onClose,
  shipment,
}) => {
  const { updateShipmentStatus } = useLogistics();

  const [status, setStatus] = useState<ShipmentStatus>('Pending');
  const [country, setCountry] = useState<string>('Germany');
  const [customCountry, setCustomCountry] = useState<string>('');
  const [mainState, setMainState] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (shipment) {
      setStatus(shipment.status);
      setMainState(shipment.destinationCity || '');
      setNote('');
      setError('');
    }
  }, [shipment]);

  if (!isOpen || !shipment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const selectedCountry = country === 'Custom' ? customCountry.trim() : country;

    if (!selectedCountry) {
      setError('Please select or specify a country.');
      return;
    }

    const locationStr = mainState.trim() ? `${mainState.trim()}, ${selectedCountry}` : selectedCountry;

    updateShipmentStatus(
      shipment.trackingId,
      status,
      note.trim() || undefined,
      locationStr
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-[#D40511] text-[#FFCC00] text-[10px] font-black px-2 py-0.5 rounded uppercase">
              WAYBILL UPDATE
            </span>
            <h2 className="text-base font-black tracking-tight">
              Update Status & Location
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Shipment Summary */}
          <div className="bg-slate-50 border border-gray-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="font-mono font-bold text-[#D40511] text-sm block">
                {shipment.trackingId}
              </span>
              <span className="text-gray-500 font-medium">
                {shipment.customerName} • {shipment.parcelType} ({shipment.weightKg}kg)
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200">
              {shipment.status}
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
              Shipment Status <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-bold focus:outline-none focus:border-[#D40511] focus:ring-1 focus:ring-red-200"
            >
              <option value="Pending">Pending</option>
              <option value="In Transit">In Transit</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Delayed">Delayed</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>

          {/* Location Details */}
          {
            <div className="bg-red-50/50 border border-red-200 rounded-xl p-4 space-y-4 animate-fadeIn">
              <div className="flex items-center space-x-2 text-xs font-black text-[#D40511]">
                <MapPin className="w-4 h-4" />
                <span>Checkpoint Transit & Location Details</span>
              </div>

              {/* Country Selection */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center space-x-1">
                  <Globe className="w-3.5 h-3.5 text-gray-500" />
                  <span>Country <span className="text-red-500">*</span></span>
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800 font-semibold focus:outline-none focus:border-[#D40511]"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {country === 'Custom' && (
                  <input
                    type="text"
                    placeholder="Specify Country name..."
                    value={customCountry}
                    onChange={(e) => setCustomCountry(e.target.value)}
                    className="w-full mt-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800 font-medium focus:outline-none focus:border-[#D40511]"
                  />
                )}
              </div>

              {/* Main State Input */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                  <span>Main State / Region <span className="text-gray-400 font-normal">(Optional — enter for &quot;State, Country&quot; or leave blank for &quot;Country&quot; only)</span></span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hesse, Greater London, California, Lagos..."
                  value={mainState}
                  onChange={(e) => setMainState(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800 font-medium focus:outline-none focus:border-[#D40511]"
                />
              </div>
            </div>
          }

          {/* Optional Update Note */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Dispatch / Status Note <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Out on van #402 for morning delivery route"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 font-medium focus:outline-none focus:border-[#D40511]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#D40511] hover:bg-red-700 text-white shadow transition-all flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Update Waybill</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
