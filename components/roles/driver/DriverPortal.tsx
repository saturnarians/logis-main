'use client';

import React, { useState } from 'react';
import { useLogistics } from '@/context/LogisticsContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setScannerActive,
  setSelectedStopIndex,
  markStopCompleted,
  toggleChecklistItem,
} from '@/store/slices/driverSlice';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Scan,
  Camera,
  PenTool,
  BatteryCharging,
  Fuel,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Send,
  UserCheck,
  Clock,
  Package,
  Layers,
} from 'lucide-react';
import { submitProofOfDeliveryAction } from '@/app/actions/shipmentActions';

export function DriverPortal() {
  const { shipments, currentUser, updateShipmentStatus, submitProofOfDelivery } = useLogistics();
  const dispatch = useAppDispatch();
  const driverState = useAppSelector((state) => state.driver);

  const [activeTab, setActiveTab] = useState<'route' | 'scanner' | 'pod' | 'vehicle'>('route');
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>(shipments[0]?.trackingId || 'DHL-EU-884920');
  const [signatureName, setSignatureName] = useState('');
  const [podSuccessNotice, setPodSuccessNotice] = useState<string | null>(null);
  const [isSubmittingPod, setIsSubmittingPod] = useState(false);

  const activeShipment = shipments.find((s) => s.trackingId === selectedShipmentId) || shipments[0];

  const handleCompleteDelivery = async () => {
    if (!activeShipment) return;
    setIsSubmittingPod(true);
    try {
      const res = await submitProofOfDeliveryAction(activeShipment.trackingId, {
        recipientName: signatureName || 'Authorized Signatory',
        deliveredAt: new Date().toISOString(),
        notes: 'Delivered in good order to front reception desk.',
      });

      if (res.success) {
        submitProofOfDelivery(activeShipment.trackingId, {
          signedByCustomerName: signatureName || 'Authorized Signatory',
          verified: true,
          verifiedAt: new Date().toISOString(),
        });
        dispatch(markStopCompleted(activeShipment.trackingId));
        setPodSuccessNotice(`POD confirmed for ${activeShipment.trackingId}!`);
        setTimeout(() => setPodSuccessNotice(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingPod(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Driver Status Bar with Liquid Glass */}
      <div className="liquid-glass-card p-6 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                alt="Driver Profile"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#FFCC00] shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFCC00]/20 text-[#D40511] border border-[#FFCC00]/40">
                  Active Fleet Courier
                </span>
                <span className="text-xs text-gray-500 font-mono">STAFF-ID: DHL-DRV-088</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 mt-1">
                {currentUser?.name || 'Klaus Lindner'}
              </h1>
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#D40511]" />
                Assigned: Mercedes Sprinter EV (BN-DL-4922) • Frankfurt Hub (FRA-01)
              </p>
            </div>
          </div>

          {/* Quick Telematics Badges */}
          <div className="flex items-center gap-3">
            <div className="liquid-glass-subtle px-4 py-2 rounded-xl flex items-center gap-2">
              <Fuel className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-[10px] text-gray-500 font-bold block">EV Battery</span>
                <span className="text-xs font-black text-gray-900 font-mono">88% (290 km)</span>
              </div>
            </div>

            <div className="liquid-glass-subtle px-4 py-2 rounded-xl flex items-center gap-2">
              <Package className="w-4 h-4 text-[#D40511]" />
              <div>
                <span className="text-[10px] text-gray-500 font-bold block">Parcels</span>
                <span className="text-xs font-black text-gray-900 font-mono">14 on board</span>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Workflow Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100 overflow-x-auto">
          {[
            { id: 'route', label: 'Assigned Stops & Route', icon: Navigation },
            { id: 'scanner', label: 'Barcode Scanner', icon: Scan },
            { id: 'pod', label: 'Proof of Delivery (POD)', icon: PenTool },
            { id: 'vehicle', label: 'Pre-Trip Vehicle Checklist', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#D40511] text-white shadow-md'
                    : 'liquid-glass-subtle text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {podSuccessNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{podSuccessNotice}</span>
        </div>
      )}

      {/* Tab 1: Route & Stops */}
      {activeTab === 'route' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="liquid-glass-card p-5 rounded-2xl">
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2 mb-3">
                <Navigation className="w-4 h-4 text-[#D40511]" />
                Daily Delivery Sequence (Frankfurt Metro Area)
              </h2>
              <div className="space-y-3">
                {shipments.slice(0, 5).map((s, idx) => {
                  const isSelected = selectedShipmentId === s.trackingId;
                  const isDone = s.status === 'Delivered';
                  return (
                    <div
                      key={s.trackingId}
                      onClick={() => setSelectedShipmentId(s.trackingId)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-[#D40511] bg-red-50/40 shadow-sm'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-black ${
                            isDone
                              ? 'bg-emerald-500 text-white'
                              : isSelected
                              ? 'bg-[#D40511] text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-gray-900">{s.trackingId}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isDone
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {s.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 font-medium mt-0.5">
                            {s.customerName} • {s.recipientAddress}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-gray-900 block font-mono">{s.weightKg} kg</span>
                        <span className="text-[10px] text-gray-500">{s.parcelType}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Stop Details Card */}
          <div className="liquid-glass-card p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D40511]" />
              Selected Stop Details
            </h3>

            {activeShipment ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-gray-200 space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Customer</span>
                  <p className="font-black text-gray-900 text-sm">{activeShipment.customerName}</p>
                  <p className="text-gray-600">{activeShipment.customerPhone}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-gray-200 space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Delivery Address</span>
                  <p className="font-medium text-gray-900">{activeShipment.recipientAddress}</p>
                  <p className="text-gray-500 font-mono">{activeShipment.destinationCity}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-gray-200 space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Service Spec</span>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">{activeShipment.serviceType}</span>
                    <span className="font-mono font-bold text-[#D40511]">{activeShipment.priority}</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('pod')}
                  className="w-full py-3 rounded-xl bg-[#D40511] text-white font-extrabold text-xs shadow hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Open POD Signature Canvas</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-500">No stop selected</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Barcode Scanner */}
      {activeTab === 'scanner' && (
        <div className="liquid-glass-card p-6 rounded-2xl max-w-2xl mx-auto space-y-5 text-center">
          <h2 className="text-lg font-black text-gray-900">Handheld Optical Parcel Scanner</h2>
          <p className="text-xs text-gray-600">
            Position the camera reticle over the DHL Code 128 / QR waybill label.
          </p>

          <div className="relative w-full aspect-video bg-black/90 rounded-2xl overflow-hidden border-2 border-white/20 flex items-center justify-center shadow-inner">
            <div className="w-48 h-48 border-2 border-dashed border-[#FFCC00] rounded-xl relative flex items-center justify-center animate-pulse">
              <span className="absolute top-2 left-2 text-[10px] text-[#FFCC00] font-mono">ALIGN WAYBILL</span>
              <Scan className="w-12 h-12 text-[#FFCC00] opacity-80" />
            </div>
            <div className="absolute inset-x-0 h-1 bg-red-500 shadow-[0_0_12px_#ff0000] top-1/2 -translate-y-1/2 animate-bounce" />
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                alert(`Simulated Scan: Scanned Waybill ${activeShipment?.trackingId}`);
              }}
              className="px-6 py-2.5 rounded-xl bg-[#D40511] text-white font-extrabold text-xs shadow hover:bg-red-700 transition-all flex items-center gap-2"
            >
              <Scan className="w-4 h-4" />
              <span>Simulate Waybill Scan</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Proof of Delivery (POD) Signature */}
      {activeTab === 'pod' && (
        <div className="liquid-glass-card p-6 rounded-2xl max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#D40511]" />
                Electronic Proof of Delivery (e-POD)
              </h2>
              <span className="text-xs font-mono text-gray-500">Waybill: {activeShipment?.trackingId}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Recipient Signatory Name *
              </label>
              <input
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="e.g. Maria Schmitt (Reception)"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#D40511] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Touch Signature Canvas
              </label>
              <div className="w-full h-36 bg-white border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 text-xs font-mono select-none">
                ✍️ [Customer Signature Captured Digitally]
              </div>
            </div>

            <button
              onClick={handleCompleteDelivery}
              disabled={isSubmittingPod}
              className="w-full py-3 rounded-xl bg-[#D40511] hover:bg-red-700 text-white font-extrabold text-xs shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmittingPod ? 'Recording Delivery...' : 'Confirm Delivery & Release Waybill'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Pre-Trip Vehicle Checklist */}
      {activeTab === 'vehicle' && (
        <div className="liquid-glass-card p-6 rounded-2xl max-w-2xl mx-auto space-y-4">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Pre-Trip Safety & Vehicle Inspection Checklist
          </h2>
          <p className="text-xs text-gray-600">
            Mandatory daily safety audit compliant with DHL Fleet Telematics ISO 9001 regulations.
          </p>

          <div className="space-y-3">
            {[
              { key: 'tiresInspected', label: 'Tire Pressure & Tread Depth Verified' },
              { key: 'fuelChecked', label: 'EV Battery & Telematics Gateway Online' },
              { key: 'cargoSecured', label: 'Cargo Tie-Downs & Bulkhead Locked' },
              { key: 'documentsVerified', label: 'Hazardous Goods & Customs Manifests on Board' },
            ].map((item) => {
              const checked = (driverState.vehicleChecklist as any)[item.key];
              return (
                <div
                  key={item.key}
                  onClick={() => dispatch(toggleChecklistItem(item.key as any))}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    checked ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-gray-200'
                  }`}
                >
                  <span className="text-xs font-bold text-gray-800">{item.label}</span>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-xs font-bold ${
                      checked ? 'bg-emerald-600' : 'border border-gray-300'
                    }`}
                  >
                    {checked && '✓'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
