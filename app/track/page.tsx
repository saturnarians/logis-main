'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLogistics } from '@/context/LogisticsContext';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { 
  Package, 
  Search, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Truck, 
  Download, 
  ArrowLeft, 
  ShieldCheck, 
  Phone, 
  Calendar, 
  ChevronRight, 
  Radio, 
  Thermometer, 
  Building2, 
  Share2, 
  Copy, 
  Check, 
  Printer,
  Sparkles,
  ArrowRight,
  HelpCircle,
  FileText,
  Mic
} from 'lucide-react';

function TrackPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { shipments, trackedShipmentId, setTrackedShipmentId, isSimulating, toggleCopilot, openCopilotWithPrompt } = useLogistics();

  const queryCode = searchParams.get('id') || searchParams.get('code') || searchParams.get('trackingId') || trackedShipmentId || 'DHL-8942-01';
  const effectiveCode = queryCode.trim().toUpperCase();

  const [inputCode, setInputCode] = useState(effectiveCode);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'map' | 'pod' | 'telematics'>('details');

  const activeShipment = shipments.find(
    (s) => s.trackingId.toUpperCase() === effectiveCode || s.trackingId.toUpperCase() === inputCode.trim().toUpperCase() || s.id === effectiveCode
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      const code = inputCode.trim().toUpperCase();
      setTrackedShipmentId(code);
      router.push(`/track?id=${encodeURIComponent(code)}`);
    }
  };

  const handleSelectSample = (sampleId: string) => {
    setInputCode(sampleId);
    setTrackedShipmentId(sampleId);
    router.push(`/track?id=${encodeURIComponent(sampleId)}`);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const steps = ['Pending', 'In Transit', 'Out for Delivery', 'Delivered'];
  const getStepIndex = (status: string) => {
    if (status === 'Delivered') return 3;
    if (status === 'Out for Delivery') return 2;
    if (status === 'In Transit' || status === 'Delayed') return 1;
    return 0;
  };

  const currentStep = activeShipment ? getStepIndex(activeShipment.status) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-gray-900 font-sans">
      <div>
        <PublicHeader activeTab="track" onOpenCopilot={toggleCopilot} />

        {/* Hero & Search Header */}
        <section className="bg-gradient-to-b from-[#FFCC00]/20 via-white to-slate-50 border-b border-gray-200 py-8 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <span className="bg-[#D40511] text-[#FFCC00] text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
                  PUBLIC EXPRESS TRACKING
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
                  Track Your Consignment & Waybill
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Real-time GPS telematics, live route checkpoints, driver arrival ETA, and Proof of Delivery.
                </p>
              </div>

              {/* Fast Login & Voice CTA */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => openCopilotWithPrompt(`Where is my shipment ${inputCode || 'DHL-8942-01'}?`)}
                  className="bg-[#D40511] hover:bg-red-700 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
                >
                  <Mic className="w-4 h-4 text-[#FFCC00] animate-pulse" />
                  <span>Ask by Voice</span>
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="bg-gray-900 hover:bg-black text-[#FFCC00] text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Staff Sign In</span>
                </button>
              </div>
            </div>

            {/* Tracking Search Box */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-amber-300 shadow-lg relative">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Package className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="Enter DHL Tracking Code (e.g. DHL-8942-01)"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-gray-300 rounded-xl text-sm font-mono font-bold text-gray-900 focus:outline-none focus:border-[#D40511] focus:bg-white transition-all uppercase"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#D40511] hover:bg-red-700 text-white font-extrabold text-sm px-6 py-3 rounded-xl shadow flex items-center justify-center space-x-2 transition-all group"
                >
                  <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Track Consignment</span>
                </button>
              </form>

              {/* Sample 1-Click Code Pills */}
              <div className="mt-3.5 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-gray-500 font-bold mr-1">Quick Demo Waybills:</span>
                {shipments.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSample(s.trackingId)}
                    className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] transition-all border ${
                      (trackedShipmentId || inputCode).toUpperCase() === s.trackingId.toUpperCase()
                        ? 'bg-gray-900 text-[#FFCC00] border-gray-900 shadow-sm'
                        : s.status === 'Delivered'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : s.status === 'Delayed'
                        ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {s.trackingId} <span className="font-sans font-normal text-[10px]">({s.status})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Results / Details Container */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {!activeShipment ? (
            /* Not Found State */
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-lg mx-auto shadow-sm">
              <div className="w-16 h-16 bg-red-50 text-[#D40511] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Waybill Not Located</h2>
              <p className="text-xs text-gray-600 mt-2">
                We could not find any active shipment matching code <span className="font-mono font-bold text-gray-900">{inputCode || trackedShipmentId}</span>.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Please check the tracking number printed on your receipt or dispatch note.
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => handleSelectSample('DHL-8942-01')}
                  className="bg-[#D40511] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow"
                >
                  Load Sample Shipment (DHL-8942-01)
                </button>
              </div>
            </div>
          ) : (
            /* Active Shipment Found Details */
            <div className="space-y-6">
              {/* Waybill Master Header Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-800 p-6 text-white flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="bg-[#FFCC00] text-black text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                        DHL AIR EXPRESS
                      </span>
                      <h2 className="text-xl sm:text-2xl font-mono font-black tracking-tight text-white">
                        {activeShipment.trackingId}
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1.5">
                      <span>Order Ref: <strong className="text-gray-200 font-mono">{activeShipment.orderId}</strong></span>
                      <span>•</span>
                      <span>Service: <strong className="text-gray-200">{activeShipment.serviceType || 'DHL Express Worldwide'}</strong></span>
                      <span>•</span>
                      <span>Carrier: <strong className="text-gray-200">{activeShipment.carrier || 'DHL Express'}</strong></span>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openCopilotWithPrompt(`What is the live delivery status and estimated arrival time for consignment ${activeShipment.trackingId}?`)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D40511] to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-md border border-amber-300 transition-transform hover:scale-105"
                      title="Ask AI Voice Assistant about this shipment"
                    >
                      <Mic className="w-3.5 h-3.5 text-[#FFCC00] animate-pulse" />
                      <span className="hidden sm:inline">Voice Assistant</span>
                    </button>

                    <span
                      className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                        activeShipment.status === 'Delivered'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : activeShipment.status === 'Delayed'
                          ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {activeShipment.status}
                    </span>

                    <button
                      onClick={handleCopyLink}
                      className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors"
                      title="Copy Direct Tracking URL"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Progress Stepper Bar */}
                <div className="p-6 bg-slate-50/70 border-b border-gray-200">
                  <div className="relative max-w-3xl mx-auto">
                    {/* Connecting line */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
                    <div 
                      className="absolute top-1/2 left-0 h-1 bg-[#D40511] -translate-y-1/2 z-0 transition-all duration-700"
                      style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    />

                    <div className="relative z-10 flex justify-between">
                      {steps.map((stepName, idx) => {
                        const isDone = idx <= currentStep;
                        const isCurrent = idx === currentStep;

                        return (
                          <div key={stepName} className="flex flex-col items-center">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow transition-all ${
                                isDone
                                  ? 'bg-[#D40511] text-white ring-4 ring-red-100'
                                  : 'bg-white text-gray-400 border-2 border-gray-300'
                              }`}
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : (
                                <span>{idx + 1}</span>
                              )}
                            </div>
                            <span
                              className={`text-[11px] mt-2 font-extrabold text-center max-w-[80px] ${
                                isCurrent
                                  ? 'text-[#D40511]'
                                  : isDone
                                  ? 'text-gray-900'
                                  : 'text-gray-400'
                              }`}
                            >
                              {stepName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Origin vs Destination Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                      ORIGIN SHIPPER
                    </span>
                    <h3 className="font-extrabold text-sm text-gray-900">{activeShipment.senderName}</h3>
                    <p className="text-xs text-gray-600 flex items-start">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>{activeShipment.senderAddress}, {activeShipment.originCity}</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                      CONSIGNEE / RECIPIENT
                    </span>
                    <h3 className="font-extrabold text-sm text-gray-900">{activeShipment.customerName}</h3>
                    <p className="text-xs text-gray-600 flex items-start">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-[#D40511] flex-shrink-0 mt-0.5" />
                      <span>{activeShipment.recipientAddress}, {activeShipment.destinationCity || activeShipment.destCity}</span>
                    </p>
                    <p className="text-[11px] text-gray-400 font-mono">Tel: {activeShipment.customerPhone}</p>
                  </div>

                  <div className="space-y-1 bg-amber-50/60 p-4 rounded-xl border border-amber-200">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      ESTIMATED DELIVERY
                    </span>
                    <div className="text-base font-black text-gray-900 font-mono">
                      {activeShipment.status === 'Delivered' ? (
                        <span className="text-emerald-700">Delivered on {activeShipment.proofOfDelivery?.verifiedAt || 'Schedule'}</span>
                      ) : (
                        <span>{activeShipment.estimatedDelivery}</span>
                      )}
                    </div>
                    <span className="text-[11px] text-amber-800 font-semibold block">
                      {activeShipment.status === 'Delivered' ? 'Signed & Closed' : 'On Schedule • Priority Route'}
                    </span>
                  </div>
                </div>

                {/* Sub-View Navigation Tabs */}
                <div className="flex border-t border-gray-200 bg-slate-50 px-4">
                  {[
                    { id: 'details', label: 'Milestone Timeline', icon: Clock },
                    { id: 'map', label: 'Live Telematics Map', icon: MapPin },
                    { id: 'pod', label: 'Proof of Delivery (PoD)', icon: ShieldCheck },
                    { id: 'telematics', label: 'Cargo Specs & Sensors', icon: Thermometer },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                          activeTab === tab.id
                            ? 'border-[#D40511] text-[#D40511] bg-white'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab 1: Timeline Checkpoints */}
              {activeTab === 'details' && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-gray-900 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-[#D40511]" />
                      Waybill Activity & Transit Checkpoints
                    </h3>
                    <span className="text-xs text-gray-500 font-mono">
                      {activeShipment.timeline.length} Recorded Events
                    </span>
                  </div>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                    {activeShipment.timeline.map((entry, idx) => (
                      <div key={entry.id || idx} className="relative group">
                        <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white shadow ${
                          idx === 0 ? 'bg-[#D40511] ring-2 ring-red-200' : 'bg-gray-400'
                        }`} />

                        <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-xs text-gray-900">{entry.status}</span>
                            <span className="text-[11px] font-mono text-gray-500">{entry.timestamp}</span>
                          </div>
                          <p className="text-xs text-gray-700 font-medium">{entry.note}</p>
                          <div className="text-[10px] text-gray-400 flex items-center space-x-1 pt-1">
                            <Building2 className="w-3 h-3" />
                            <span>Location: {entry.location}</span>
                            <span>•</span>
                            <span>Recorded by: {entry.updatedBy}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Live Map Telematics */}
              {activeTab === 'map' && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900 flex items-center">
                        <Radio className="w-4 h-4 mr-2 text-[#D40511] animate-pulse" />
                        Live Vehicle GPS Coordinates & Telematics
                      </h3>
                      <p className="text-xs text-gray-500">
                        Simulating live satellite beacon updates every 3.5s.
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-xl text-gray-700 font-bold">
                      <span>LAT: {activeShipment.currentLocation.lat.toFixed(4)}</span>
                      <span>•</span>
                      <span>LNG: {activeShipment.currentLocation.lng.toFixed(4)}</span>
                    </div>
                  </div>

                  {/* Visual Map Canvas Container */}
                  <div className="h-80 bg-slate-900 rounded-xl relative overflow-hidden border border-gray-800 p-4 flex flex-col justify-between">
                    {/* Simulated Map Grid Overlay */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FFCC00_1px,transparent_1px)] [background-size:16px_16px]" />

                    {/* Top Telemetry Pills */}
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="bg-black/80 backdrop-blur border border-gray-700 px-3 py-2 rounded-xl text-white text-xs space-y-0.5">
                        <span className="text-[10px] text-emerald-400 font-bold block">● ACTIVE BEACON</span>
                        <div className="font-mono font-bold">Carrier: {activeShipment.carrier || 'DHL Express'}</div>
                        <div className="text-gray-400 text-[10px]">Driver ID: {activeShipment.assignedDriverId || activeShipment.driverId || 'Autonomous Staging'}</div>
                      </div>

                      <div className="bg-[#D40511] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 shadow">
                        <Truck className="w-3.5 h-3.5" />
                        <span>In Motion ({activeShipment.destinationCity || activeShipment.destCity} Sector)</span>
                      </div>
                    </div>

                    {/* Route Vector Visualization */}
                    <div className="relative z-10 my-auto flex items-center justify-between px-8 text-white">
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mx-auto shadow-lg ring-4 ring-blue-500/20">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-bold mt-1 block">{activeShipment.originCity}</span>
                        <span className="text-[10px] text-gray-400">Departure Hub</span>
                      </div>

                      {/* Animated Route Line */}
                      <div className="flex-1 mx-6 relative">
                        <div className="h-1 bg-gray-700 rounded-full w-full" />
                        <div 
                          className="h-1 bg-gradient-to-r from-blue-500 to-[#FFCC00] rounded-full absolute top-0 left-0 transition-all duration-700" 
                          style={{ width: '65%' }}
                        />
                        <div 
                          className="absolute -top-3.5 w-8 h-8 rounded-full bg-[#FFCC00] text-black flex items-center justify-center shadow-lg transition-all duration-700"
                          style={{ left: '65%', transform: 'translateX(-50%)' }}
                        >
                          <Truck className="w-4 h-4 text-black" />
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center mx-auto shadow-lg ring-4 ring-emerald-500/20">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-bold mt-1 block">{activeShipment.destinationCity || activeShipment.destCity}</span>
                        <span className="text-[10px] text-gray-400">Destination</span>
                      </div>
                    </div>

                    {/* Bottom Status */}
                    <div className="relative z-10 text-[11px] text-gray-400 flex items-center justify-between bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-800">
                      <span>Waypoint Sequence: 4/6 Completed</span>
                      <span className="text-amber-300 font-mono">Distance to Hub: ~14.2 km</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Proof of Delivery */}
              {activeTab === 'pod' && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-gray-900 flex items-center">
                      <ShieldCheck className="w-5 h-5 mr-2 text-emerald-600" />
                      Digital Proof of Delivery (PoD)
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      activeShipment.proofOfDelivery?.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {activeShipment.proofOfDelivery?.verified ? 'Verified & Signed' : 'Delivery Pending'}
                    </span>
                  </div>

                  {activeShipment.proofOfDelivery?.verified ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl border border-gray-200 space-y-2 text-xs">
                        <span className="text-gray-500 font-bold block">Signatory:</span>
                        <div className="text-base font-black text-gray-900">
                          {activeShipment.proofOfDelivery.signedByCustomerName || activeShipment.customerName}
                        </div>
                        <span className="text-gray-500 font-bold block mt-2">Recorded Delivery Timestamp:</span>
                        <div className="font-mono font-bold text-gray-800">
                          {activeShipment.proofOfDelivery.verifiedAt}
                        </div>
                        {activeShipment.proofOfDelivery.otpCode && (
                          <div>
                            <span className="text-gray-500 font-bold block mt-2">Verified One-Time PIN:</span>
                            <span className="font-mono bg-white px-2 py-0.5 rounded border text-emerald-800 font-bold">
                              {activeShipment.proofOfDelivery.otpCode}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl border border-gray-200 space-y-2 text-xs">
                        <span className="text-gray-500 font-bold block">Digital Signature:</span>
                        <div className="bg-white p-3 rounded-lg border border-gray-300 flex items-center justify-center min-h-[90px]">
                          {activeShipment.proofOfDelivery.signatureUrl ? (
                            <img
                              src={activeShipment.proofOfDelivery.signatureUrl}
                              alt="Recipient Signature"
                              className="max-h-20 object-contain"
                            />
                          ) : (
                            <span className="font-mono italic text-gray-500 font-bold">
                              [Encrypted Biometric Signature Verified]
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-gray-300 text-gray-500 text-xs">
                      <Clock className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                      <p className="font-bold text-gray-700 text-sm">Package is currently in transit</p>
                      <p className="mt-1">Proof of delivery signature and photo will be automatically generated upon driver drop-off.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Cargo Specs & Telematics */}
              {activeTab === 'telematics' && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-gray-900 flex items-center">
                    <Thermometer className="w-4 h-4 mr-2 text-blue-600" />
                    Consignment Manifest & Environmental Telematics
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-gray-200">
                      <span className="text-[11px] font-bold text-gray-500 block">Weight</span>
                      <span className="text-base font-black text-gray-900 font-mono mt-0.5 block">{activeShipment.weightKg} kg</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-gray-200">
                      <span className="text-[11px] font-bold text-gray-500 block">Pieces</span>
                      <span className="text-base font-black text-gray-900 font-mono mt-0.5 block">{activeShipment.pieces} Item(s)</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-gray-200">
                      <span className="text-[11px] font-bold text-gray-500 block">Priority Class</span>
                      <span className="text-base font-black text-[#D40511] mt-0.5 block">{activeShipment.priority}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-gray-200">
                      <span className="text-[11px] font-bold text-gray-500 block">Cargo Temperature</span>
                      <span className="text-base font-black text-blue-600 font-mono mt-0.5 block">
                        {activeShipment.temperatureCelsius !== undefined ? `${activeShipment.temperatureCelsius}°C (Regulated)` : 'Ambient Standard'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#D40511] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-600 font-mono">Loading DHL Tracking System...</p>
        </div>
      </div>
    }>
      <TrackPageContent />
    </Suspense>
  );
}
