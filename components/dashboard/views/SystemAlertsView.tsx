'use client';

import React, { useState } from 'react';
import { useLogistics } from '@/context/LogisticsContext';
import { LogisticsAlert } from '@/types/logistics';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  MapPin, 
  Radio, 
  Filter,
  Check
} from 'lucide-react';

export const SystemAlertsView: React.FC = () => {
  const { alerts, resolveAlert } = useLogistics();
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [showResolved, setShowResolved] = useState(false);

  const filteredAlerts = alerts.filter((a) => {
    if (!showResolved && a.resolved) return false;
    if (filterSeverity !== 'All' && a.severity !== filterSeverity) return false;
    return true;
  });

  const getSeverityBadge = (severity: LogisticsAlert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300 animate-pulse';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#D40511] text-[#FFCC00] text-[10px] font-black px-2 py-0.5 rounded uppercase">
              INCIDENT RESPONSE
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Real-Time Logistics Alerts & Exceptions
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Telematics anomalies, unexpected highway congestion, temperature threshold spikes, and SLA risk detections.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="rounded text-[#D40511] focus:ring-0"
            />
            <span>Include Resolved Incidents</span>
          </label>
        </div>
      </div>

      {/* Severity Filter Chips */}
      <div className="flex items-center space-x-2 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
        {['All', 'high', 'medium', 'low'].map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all uppercase ${
              filterSeverity === sev
                ? 'bg-gray-900 text-[#FFCC00] shadow'
                : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
            }`}
          >
            {sev === 'high' ? 'Critical (High)' : sev === 'medium' ? 'Warning (Med)' : sev === 'low' ? 'Notice (Low)' : 'All'} ({sev === 'All' ? alerts.length : alerts.filter(a => a.severity === sev).length})
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            <p className="font-bold text-sm text-gray-700">All logistics channels clear</p>
            <p className="text-xs text-gray-400">No active incidents or telemetry warnings matching the filter.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                alert.resolved
                  ? 'bg-gray-50 border-gray-200 opacity-60'
                  : alert.severity === 'high'
                  ? 'bg-red-50/50 border-red-300 shadow-sm'
                  : alert.severity === 'medium'
                  ? 'bg-amber-50/50 border-amber-300 shadow-sm'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                  alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                  alert.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${getSeverityBadge(alert.severity)}`}>
                      {alert.severity} priority
                    </span>
                    <span className="text-xs font-mono text-gray-400">{alert.timestamp}</span>
                    {alert.trackingId && (
                      <span className="text-xs font-mono font-bold text-[#D40511] bg-white px-2 py-0.5 rounded border border-red-200">
                        {alert.trackingId}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-extrabold text-gray-900">{alert.message}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-end space-x-2 flex-shrink-0">
                {!alert.resolved ? (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="bg-gray-900 hover:bg-black text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm flex items-center space-x-1.5 transition-colors"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Acknowledge & Resolve</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                    Resolved
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
