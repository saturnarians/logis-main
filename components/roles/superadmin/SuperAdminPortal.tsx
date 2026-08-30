'use client';

import React, { useState } from 'react';
import { useLogistics } from '@/context/LogisticsContext';
import { useAppDispatch } from '@/store/hooks';
import { setTerminalLogsModalOpen } from '@/store/slices/uiSlice';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Database,
  Terminal,
  Activity,
  UserCog,
  RefreshCw,
  Zap,
  Sliders,
  AlertTriangle,
  FileText,
  Server,
  Lock,
} from 'lucide-react';
import { toggleAIMasterSwitchAction, resolvePendingActionAction } from '@/app/actions/governanceActions';

export function SuperAdminPortal() {
  const {
    aiGovernance,
    permissions,
    shipments,
    drivers,
    warehouses,
    invoices,
    tariffs,
    refreshDatabase,
    reseedDatabase,
    toggleAIMasterSwitch,
    setAIDataAccessMode,
    toggleAIReadPermission,
    toggleAIWritePermission,
    approveAIAction,
    rejectAIAction,
  } = useLogistics();

  const dispatch = useAppDispatch();
  const [activeSubTab, setActiveSubTab] = useState<'governance' | 'database' | 'rbac' | 'audit'>('governance');
  const [isReseeding, setIsReseeding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleMasterToggle = async (enabled: boolean) => {
    toggleAIMasterSwitch(enabled);
    await toggleAIMasterSwitchAction(enabled, 'SuperAdmin Executive');
    triggerNotice(`AI Master Kill Switch toggled to: ${enabled ? 'ENABLED' : 'DISABLED'}`);
  };

  const handleResolveAction = async (id: string, status: 'approved' | 'rejected') => {
    if (status === 'approved') {
      approveAIAction(id);
    } else {
      rejectAIAction(id, 'Rejected by SuperAdmin manual override');
    }
    await resolvePendingActionAction(id, status, 'SuperAdmin Executive');
    triggerNotice(`Pending action ${status} successfully.`);
  };

  return (
    <div className="space-y-6">
      {/* SuperAdmin Executive Header Card with Liquid Glass */}
      <div className="liquid-glass-card p-6 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gray-900 to-gray-800 text-[#FFCC00] flex items-center justify-center shadow-lg border border-white/20">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-900 text-[#FFCC00] border border-[#FFCC00]/40">
                  EXECUTIVE GOVERNANCE LEVEL 0
                </span>
                <span className="text-xs text-gray-500 font-mono">NODE: BONN-HQ-SECURE</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 mt-1">
                AI Governance & System Architecture Console
              </h1>
              <p className="text-xs text-gray-600">
                Full-spectrum control over autonomous logistics agents, SQLite/Prisma schemas, and RBAC matrix.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(setTerminalLogsModalOpen(true))}
              className="px-4 py-2.5 rounded-xl bg-gray-900 text-[#FFCC00] hover:bg-black font-extrabold text-xs flex items-center gap-1.5 shadow transition-all"
            >
              <Terminal className="w-4 h-4" />
              <span>Terminal Error Stream</span>
            </button>
          </div>
        </div>

        {/* SuperAdmin Sub-tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100 overflow-x-auto">
          {[
            { id: 'governance', label: 'AI Kill Switch & Agent Policies', icon: Sliders },
            { id: 'database', label: 'Prisma ORM & SQLite Engine', icon: Database },
            { id: 'rbac', label: 'Role-Based Access (RBAC) Matrix', icon: Lock },
            { id: 'audit', label: 'Immutable Security Audit Ledger', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
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

      {notice && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Activity className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Tab 1: AI Governance & Kill Switch */}
      {activeSubTab === 'governance' && (
        <div className="space-y-6">
          {/* Master Kill Switch Card */}
          <div className="liquid-glass-card p-6 rounded-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#D40511]" />
                  Master Autonomous AI Kill Switch
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  Immediately suspends all autonomous agent dispatching, rerouting, and tariff mutations across European hubs.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleMasterToggle(!aiGovernance.aiEnabled)}
                  className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all shadow-md flex items-center gap-2 ${
                    aiGovernance.aiEnabled
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-[#D40511] hover:bg-red-700 text-white animate-pulse'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>{aiGovernance.aiEnabled ? 'AI AGENTS ACTIVE (ONLINE)' : 'KILL SWITCH ENGAGED (OFFLINE)'}</span>
                </button>
              </div>
            </div>

            {/* Access Mode Selector */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
              {[
                { id: 'full_auto', title: 'Full Autonomous', desc: 'Direct execution of reroutes & driver dispatches' },
                { id: 'human_in_the_loop', title: 'Human-in-the-Loop', desc: 'Mutations queued for SuperAdmin authorization' },
                { id: 'read_only_restricted', title: 'Read-Only Restricted', desc: 'Analysis & insights only, zero write access' },
                { id: 'disabled', title: 'Completely Disabled', desc: 'Offline mode with zero API calls' },
              ].map((mode) => (
                <div
                  key={mode.id}
                  onClick={() => setAIDataAccessMode(mode.id as any)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    aiGovernance.dataAccessMode === mode.id
                      ? 'bg-red-50/50 border-[#D40511] shadow-sm'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xs font-black text-gray-900 block">{mode.title}</span>
                  <span className="text-[11px] text-gray-500 mt-1 block">{mode.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Human-in-the-Loop Actions */}
          <div className="liquid-glass-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Supervised AI Action Queue ({aiGovernance.pendingActions?.filter((a) => a.status === 'pending').length || 0} Pending)
              </h3>
            </div>

            {aiGovernance.pendingActions?.filter((a) => a.status === 'pending').length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs">
                No actions currently waiting for approval.
              </div>
            ) : (
              <div className="space-y-3">
                {aiGovernance.pendingActions
                  ?.filter((a) => a.status === 'pending')
                  .map((action) => (
                    <div key={action.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-gray-900">{action.title}</span>
                          <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                            {action.actionType}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResolveAction(action.id, 'approved')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1 shadow"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Authorize</span>
                        </button>
                        <button
                          onClick={() => handleResolveAction(action.id, 'rejected')}
                          className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-red-100 text-gray-700 hover:text-red-700 font-black text-xs flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Prisma + SQLite Database */}
      {activeSubTab === 'database' && (
        <div className="space-y-6">
          <div className="liquid-glass-card p-6 rounded-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#D40511]" />
                  Prisma ORM & SQLite Persistence Engine
                </h2>
                <p className="text-xs text-gray-600">
                  SQLite database file location: <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-red-600">file:./dev.db</code>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await refreshDatabase();
                    triggerNotice('Synchronized live state from SQLite database.');
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-800 font-extrabold text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync DB</span>
                </button>

                <button
                  onClick={async () => {
                    if (confirm('Reseed SQLite database with default DHL datasets?')) {
                      setIsReseeding(true);
                      const res = await reseedDatabase();
                      setIsReseeding(false);
                      triggerNotice(res.message);
                    }
                  }}
                  disabled={isReseeding}
                  className="px-4 py-2 rounded-xl bg-[#D40511] text-white font-extrabold text-xs flex items-center gap-1.5 shadow"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isReseeding ? 'Reseeding...' : 'Reseed Database'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-gray-200">
                <span className="text-[11px] font-bold text-gray-500 block">Shipments Model</span>
                <span className="text-2xl font-black text-gray-900 font-mono mt-1 block">{shipments.length}</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Indexed on trackingId</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-gray-200">
                <span className="text-[11px] font-bold text-gray-500 block">Fleet Drivers Model</span>
                <span className="text-2xl font-black text-gray-900 font-mono mt-1 block">{drivers.length}</span>
                <span className="text-[10px] text-blue-600 font-semibold">Live GPS records</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-gray-200">
                <span className="text-[11px] font-bold text-gray-500 block">Warehouse Hubs Model</span>
                <span className="text-2xl font-black text-gray-900 font-mono mt-1 block">{warehouses.length}</span>
                <span className="text-[10px] text-purple-600 font-semibold">European gateway docks</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-gray-200">
                <span className="text-[11px] font-bold text-gray-500 block">Invoices & Tariffs</span>
                <span className="text-2xl font-black text-gray-900 font-mono mt-1 block">{invoices.length + tariffs.length}</span>
                <span className="text-[10px] text-amber-600 font-semibold">Financial Ledger rows</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: RBAC Matrix */}
      {activeSubTab === 'rbac' && (
        <div className="liquid-glass-card p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-800" />
            Role-Based Access Control (RBAC) Matrix
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-gray-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Module Permission</th>
                  <th className="p-3 text-center">Superadmin</th>
                  <th className="p-3 text-center">Operations Admin</th>
                  <th className="p-3 text-center">Fleet Driver</th>
                  <th className="p-3 text-center">Public Customer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {permissions.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-gray-900">
                      <div>{p.name}</div>
                      <div className="text-[10px] text-gray-500 font-normal">{p.description}</div>
                    </td>
                    <td className="p-3 text-center text-emerald-600 font-bold">{p.superadmin ? '✓ FULL' : '—'}</td>
                    <td className="p-3 text-center text-blue-600 font-bold">{p.admin ? '✓ READ/WRITE' : '—'}</td>
                    <td className="p-3 text-center text-amber-600 font-bold">{p.driver ? '✓ ROUTE ONLY' : '—'}</td>
                    <td className="p-3 text-center text-gray-500 font-bold">{p.customer ? '✓ TRACK ONLY' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Ledger */}
      {activeSubTab === 'audit' && (
        <div className="liquid-glass-card p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#D40511]" />
            Security & Mutation Audit Ledger
          </h2>
          <div className="space-y-2">
            {aiGovernance.auditLogs?.slice(0, 15).map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-gray-200 text-xs flex items-center justify-between gap-4 font-mono">
                <div>
                  <span className="text-[10px] text-gray-400 mr-2">{log.timestamp}</span>
                  <span className="font-bold text-[#D40511] mr-2">[{log.action}]</span>
                  <span className="text-gray-700">{log.details}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
