'use client';

import React, { useState, useEffect } from 'react';
import { useLogistics } from '@/context/LogisticsContext';
import { Role, AIDataAccessMode } from '@/types/logistics';
import type { 
  CronJobDefinitionDto, 
  NotificationItemDto, 
  SendNotificationDto
} from '@/types/dto';
import { sentryClient } from '@/lib/monitoring';
import { 
  Settings, 
  ShieldCheck, 
  Key, 
  Webhook, 
  Sliders, 
  Check, 
  X, 
  Save, 
  Lock, 
  Database,
  Radio,
  Server,
  Bot,
  Power,
  Eye,
  Edit3,
  FileCheck,
  AlertTriangle,
  Clock,
  History,
  CheckCircle2,
  XCircle,
  Zap,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Cpu,
  UserCheck,
  Bell,
  Mail,
  Smartphone,
  Activity,
  Terminal,
  Play,
  Bug,
  Send
} from 'lucide-react';

export const SystemSettingsView: React.FC = () => {
  const { 
    role, 
    permissions, 
    togglePermission, 
    isSimulating, 
    toggleSimulation,
    aiGovernance,
    toggleAIMasterSwitch,
    setAIDataAccessMode,
    toggleAIReadPermission,
    toggleAIWritePermission,
    approveAIAction,
    rejectAIAction,
    shipments,
    drivers,
    vehicles,
    warehouses,
    invoices,
    tariffs,
    inventory,
    dbConnected,
    refreshDatabase,
    reseedDatabase,
  } = useLogistics();

  const [activeTab, setActiveTab] = useState<'ai_governance' | 'database' | 'system_services' | 'monitoring' | 'rbac' | 'api' | 'telemetry'>('system_services');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [isReseeding, setIsReseeding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showResolvedHistory, setShowResolvedHistory] = useState(false);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  // System & Monitoring Tab States
  const [cronJobs, setCronJobs] = useState<CronJobDefinitionDto[]>([]);
  const [notificationsList, setNotificationsList] = useState<NotificationItemDto[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [datadogMetrics, setDatadogMetrics] = useState<Record<string, number>>({});
  const [isTriggeringCron, setIsTriggeringCron] = useState<string | null>(null);
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  // New Notification Form
  const [notifForm, setNotifForm] = useState<SendNotificationDto>({
    title: 'Urgent Weather Re-route Notice',
    message: 'Snowstorm alert across German transit corridor A3. Rerouting via secondary hubs.',
    channel: 'internal',
    category: 'shipment_update',
    priority: 'high',
    recipientRole: 'driver',
    recipientPhone: '+49 171 000-1234',
    recipientEmail: 'dispatch@dhl.com',
  });

  const showNotification = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const fetchSystemData = async () => {
    try {
      const res = await fetch('/api/system');
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.cron?.jobs) setCronJobs(data.data.cron.jobs);
        if (data.data.notifications?.list) setNotificationsList(data.data.notifications.list);
        if (data.data.monitoring?.recentLogs) setRecentLogs(data.data.monitoring.recentLogs);
        if (data.data.monitoring?.metrics) setDatadogMetrics(data.data.monitoring.metrics);
      }
    } catch (e) {
      console.error('Failed fetching system overview:', e);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        const res = await fetch('/api/system');
        const data = await res.json();
        if (isMounted && data.success && data.data) {
          if (data.data.cron?.jobs) setCronJobs(data.data.cron.jobs);
          if (data.data.notifications?.list) setNotificationsList(data.data.notifications.list);
          if (data.data.monitoring?.recentLogs) setRecentLogs(data.data.monitoring.recentLogs);
          if (data.data.monitoring?.metrics) setDatadogMetrics(data.data.monitoring.metrics);
        }
      } catch (e) {
        console.error('Failed fetching system overview:', e);
      }
    };
    loadInitialData();
    const interval = setInterval(fetchSystemData, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleRunCron = async (jobName: string) => {
    setIsTriggeringCron(jobName);
    try {
      const res = await fetch('/api/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'runCron', payload: { jobName, force: true } }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Cron Job [${jobName}] executed successfully`);
        fetchSystemData();
      } else {
        showNotification(`Cron Error: ${data.error}`);
      }
    } catch (e: any) {
      showNotification(`Failed running cron: ${e.message}`);
    } finally {
      setIsTriggeringCron(null);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingNotif(true);
    try {
      const res = await fetch('/api/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sendNotification', payload: notifForm }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Notification dispatched via [${notifForm.channel.toUpperCase()}]`);
        fetchSystemData();
      } else {
        showNotification(`Error: ${data.error}`);
      }
    } catch (e: any) {
      showNotification(`Dispatch failed: ${e.message}`);
    } finally {
      setIsSendingNotif(false);
    }
  };

  const handleTestSentry = () => {
    sentryClient.addBreadcrumb({
      category: 'ui.click',
      message: 'User clicked Sentry diagnostics test button',
      level: 'INFO',
    });
    const errId = sentryClient.captureException(new Error('Simulated Frontend React Sentry Exception (Verification Test)'), {
      tags: { source: 'SystemSettingsView', userRole: role },
      details: { timestamp: new Date().toISOString() },
    });
    showNotification(`Sentry Client Exception Captured (Event: ${errId})`);
    fetchSystemData();
  };

  const handleTestDatadog = async () => {
    try {
      const res = await fetch('/api/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'testMonitoring',
          payload: {
            type: 'datadog_trace',
            message: 'Simulated Datadog APM & Backend Trace Error Event',
            module: 'BackendAPMVerification',
            level: 'ERROR',
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Datadog APM structured log recorded');
        fetchSystemData();
      }
    } catch (e: any) {
      showNotification(`Datadog test failed: ${e.message}`);
    }
  };

  const isSuperadmin = role === 'superadmin';

  const pendingActions = aiGovernance.pendingActions.filter((a) => a.status === 'pending');
  const resolvedActions = aiGovernance.pendingActions.filter((a) => a.status !== 'pending');

  const handleApproveAction = (actionId: string) => {
    const res = approveAIAction(actionId);
    showNotification(res.message);
  };

  const handleRejectAction = (actionId: string) => {
    const reason = rejectReason[actionId] || 'Manual SuperAdmin override';
    const res = rejectAIAction(actionId, reason);
    showNotification(res.message);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#D40511] text-[#FFCC00] text-[10px] font-black px-2 py-0.5 rounded uppercase">
              PLATFORM ARCHITECTURE
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              System Services, Monitoring & Governance Console
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Centralized RBAC permissions matrix, scheduled Cron tasks, Multi-channel Notifications (internal, SMS, email), Sentry frontend error tracking & Datadog APM.
          </p>
        </div>

        {savedNotice && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedNotice}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
        <button
          onClick={() => setActiveTab('system_services')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
            activeTab === 'system_services' 
              ? 'bg-[#D40511] text-white shadow' 
              : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>RBAC, Cron & Notifications</span>
          <span className="bg-[#FFCC00] text-gray-950 px-1.5 py-0.2 rounded-full text-[9px] font-black ml-1">
            WRAPPER
          </span>
        </button>

        <button
          onClick={() => setActiveTab('monitoring')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
            activeTab === 'monitoring' 
              ? 'bg-[#D40511] text-white shadow' 
              : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Sentry & Datadog Monitoring</span>
          <span className="bg-emerald-500 text-white px-1.5 py-0.2 rounded-full text-[9px] font-black ml-1">
            APM LIVE
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ai_governance')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
            activeTab === 'ai_governance' 
              ? 'bg-gray-900 text-[#FFCC00] shadow' 
              : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>AI Human-in-the-Loop</span>
          {pendingActions.length > 0 && (
            <span className="bg-[#FFCC00] text-gray-950 px-1.5 py-0.5 rounded-full text-[10px] font-black ml-1">
              {pendingActions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
            activeTab === 'database' ? 'bg-gray-900 text-[#FFCC00] shadow' : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Prisma Database</span>
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
            activeTab === 'rbac' ? 'bg-gray-900 text-[#FFCC00] shadow' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>RBAC Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
            activeTab === 'api' ? 'bg-gray-900 text-[#FFCC00] shadow' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>API Credentials</span>
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
            activeTab === 'telemetry' ? 'bg-gray-900 text-[#FFCC00] shadow' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>GPS Simulator</span>
        </button>
      </div>

      {/* Tab Content: Centralized System Services (RBAC + Cron + Notifications) */}
      {activeTab === 'system_services' && (
        <div className="space-y-6">
          {/* Top Status Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#D40511] flex items-center justify-center font-black">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase">Unified RBAC Engine</span>
                <h3 className="text-lg font-black text-gray-900">{permissions.length} Defined Permissions</h3>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Active Role Guard Enforcing
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase">System Cron Manager</span>
                <h3 className="text-lg font-black text-gray-900">{cronJobs.length || 4} Registered Tasks</h3>
                <span className="text-[11px] text-amber-600 font-semibold flex items-center">
                  <Zap className="w-3 h-3 mr-1" /> Autonomous Background Ticks
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase">Multi-Channel Alerts</span>
                <h3 className="text-lg font-black text-gray-900">Internal, SMS & Email</h3>
                <span className="text-[11px] text-blue-600 font-semibold flex items-center">
                  <Mail className="w-3 h-3 mr-1" /> {notificationsList.length} Dispatched Items
                </span>
              </div>
            </div>
          </div>

          {/* CRON JOBS MANAGER TABLE */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#D40511]" />
                  <span>Centralized Cron Jobs & Background Tasks Engine</span>
                </h2>
                <p className="text-xs text-gray-500">
                  Recurring background jobs automatically tick to update GPS telematics, detect SLA breaches, and manage audit logs.
                </p>
              </div>

              <button
                onClick={fetchSystemData}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Status</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-gray-600 font-black">
                    <th className="py-3 px-4">Task Name & Description</th>
                    <th className="py-3 px-4">Interval</th>
                    <th className="py-3 px-4">Last Status</th>
                    <th className="py-3 px-4">Last Run / Duration</th>
                    <th className="py-3 px-4">Next Scheduled Run</th>
                    <th className="py-3 px-4 text-right">Manual Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cronJobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-gray-400">Loading system cron jobs...</td>
                    </tr>
                  ) : (
                    cronJobs.map((job) => (
                      <tr key={job.name} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-gray-900 block">{job.name}</span>
                          <span className="text-gray-500 text-[11px]">{job.description}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-gray-700">
                          {job.intervalMs / 1000}s
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            job.lastStatus === 'running' ? 'bg-blue-100 text-blue-800' :
                            job.lastStatus === 'idle' || job.lastStatus === 'scheduled' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {job.lastStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">
                          {job.lastRun ? job.lastRun.split('T')[1]?.substring(0, 8) : 'Pending'}
                          {job.lastDurationMs != null && (
                            <span className="text-gray-400 ml-1">({job.lastDurationMs}ms)</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">
                          {job.nextRun ? job.nextRun.split('T')[1]?.substring(0, 8) : 'Scheduled'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleRunCron(job.name)}
                            disabled={isTriggeringCron === job.name}
                            className="px-3 py-1 bg-gray-900 hover:bg-[#D40511] text-white rounded-lg font-bold text-[11px] transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            {isTriggeringCron === job.name ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                            <span>Run Now</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MULTI-CHANNEL NOTIFICATION DISPATCHER */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Send className="w-4 h-4 text-[#D40511]" />
                <span>Multi-Channel Notification Dispatcher</span>
              </h2>

              <form onSubmit={handleSendNotification} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Alert Title</label>
                  <input
                    type="text"
                    value={notifForm.title}
                    onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-xl font-medium focus:ring-1 focus:ring-[#D40511] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Message Content</label>
                  <textarea
                    rows={3}
                    value={notifForm.message}
                    onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-xl font-medium focus:ring-1 focus:ring-[#D40511] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Channel</label>
                    <select
                      value={notifForm.channel}
                      onChange={(e) => setNotifForm({ ...notifForm, channel: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-xl font-medium bg-white outline-none"
                    >
                      <option value="internal">Internal (In-App)</option>
                      <option value="sms">SMS (Cellular)</option>
                      <option value="email">Email (Transactional)</option>
                      <option value="all">All Channels (Omnichannel)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Priority</label>
                    <select
                      value={notifForm.priority}
                      onChange={(e) => setNotifForm({ ...notifForm, priority: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-xl font-medium bg-white outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent Escalation</option>
                    </select>
                  </div>
                </div>

                {(notifForm.channel === 'sms' || notifForm.channel === 'all') && (
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Recipient SMS Phone</label>
                    <input
                      type="text"
                      value={notifForm.recipientPhone || ''}
                      onChange={(e) => setNotifForm({ ...notifForm, recipientPhone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl font-mono"
                    />
                  </div>
                )}

                {(notifForm.channel === 'email' || notifForm.channel === 'all') && (
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Recipient Email Address</label>
                    <input
                      type="email"
                      value={notifForm.recipientEmail || ''}
                      onChange={(e) => setNotifForm({ ...notifForm, recipientEmail: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl font-mono"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSendingNotif}
                  className="w-full py-2.5 bg-[#D40511] hover:bg-red-700 text-white rounded-xl font-black text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isSendingNotif ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Broadcast Notification</span>
                </button>
              </form>
            </div>

            {/* Notification History */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Recent System Notifications ({notificationsList.length})</span>
              </h2>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {notificationsList.map((n) => (
                  <div key={n.id} className="p-3.5 rounded-xl border border-gray-100 bg-slate-50 hover:bg-white hover:border-gray-300 transition-all text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          n.channel === 'sms' ? 'bg-emerald-100 text-emerald-800' :
                          n.channel === 'email' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {n.channel}
                        </span>
                        <span className="font-extrabold text-gray-900">{n.title}</span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono">{n.timestamp}</span>
                    </div>

                    <p className="text-gray-600">{n.message}</p>

                    <div className="flex items-center gap-2 pt-1 text-[11px] text-gray-400">
                      {n.recipientPhone && <span>Phone: {n.recipientPhone}</span>}
                      {n.recipientEmail && <span>Email: {n.recipientEmail}</span>}
                      {n.recipientRole && <span>Target Role: {n.recipientRole}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Sentry & Datadog Monitoring Control Room */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          {/* Header cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sentry Frontend */}
            <div className="bg-white rounded-2xl border border-purple-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                    <Bug className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">Sentry Frontend Error Tracking</h3>
                    <p className="text-[11px] text-gray-500">Browser exceptions, React component boundaries, breadcrumbs</p>
                  </div>
                </div>
                <span className="bg-purple-100 text-purple-800 font-bold text-[10px] px-2.5 py-1 rounded-full border border-purple-200">
                  CONNECTED
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">SDK Target:</span>
                  <span className="font-mono font-bold text-gray-800">Next.js Client (Browser)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Environment:</span>
                  <span className="font-mono font-bold text-emerald-600">production-ready</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Active User Context:</span>
                  <span className="font-mono font-bold text-purple-700">{role.toUpperCase()} (SuperAdmin)</span>
                </div>
              </div>

              <button
                onClick={handleTestSentry}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Bug className="w-4 h-4" />
                <span>Simulate Sentry Frontend Error</span>
              </button>
            </div>

            {/* Datadog Backend APM */}
            <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">Datadog Backend APM & Traces</h3>
                    <p className="text-[11px] text-gray-500">Structured JSON logs, spans, server response latency</p>
                  </div>
                </div>
                <span className="bg-indigo-100 text-indigo-800 font-bold text-[10px] px-2.5 py-1 rounded-full border border-indigo-200">
                  APM ACTIVE
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Log Format:</span>
                  <span className="font-mono font-bold text-gray-800">Datadog JSON (ddsource=nextjs)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Service:</span>
                  <span className="font-mono font-bold text-indigo-700">dhl-logistics-backend</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Metric Counters:</span>
                  <span className="font-mono font-bold text-emerald-600">{Object.keys(datadogMetrics).length} metrics active</span>
                </div>
              </div>

              <button
                onClick={handleTestDatadog}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Activity className="w-4 h-4" />
                <span>Simulate Datadog APM Trace Event</span>
              </button>
            </div>
          </div>

          {/* Unified Structured Logs Terminal */}
          <div className="bg-gray-950 text-gray-100 rounded-2xl p-6 space-y-4 border border-gray-800 font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-[#FFCC00]" />
                <span className="font-bold text-white">Centralized Monitoring Feed (Sentry Breadcrumbs & Datadog Logs)</span>
              </div>
              <button
                onClick={fetchSystemData}
                className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-[11px] flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh Logs</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
              {recentLogs.length === 0 ? (
                <div className="text-gray-500 text-center py-6">No recent events logged. Trigger a test event above!</div>
              ) : (
                recentLogs.map((log: any, idx: number) => (
                  <div key={log.id || idx} className="p-2 rounded bg-gray-900/80 border border-gray-800/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                          log.level === 'ERROR' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          log.level === 'WARN' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {log.level}
                        </span>
                        <span className="text-cyan-400 font-bold">[{log.module}]</span>
                        <span className="text-gray-200">{log.message}</span>
                      </div>
                      <span className="text-gray-500 text-[10px]">{log.timestamp}</span>
                    </div>

                    {log.details && (
                      <pre className="text-[10px] text-gray-400 bg-black/40 p-1.5 rounded overflow-x-auto">
                        {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: AI Governance */}
      {activeTab === 'ai_governance' && (
        <div className="space-y-6">
          {/* SECTION 1: MASTER KILL SWITCH */}
          <div className={`rounded-2xl border p-6 transition-all shadow-sm ${
            aiGovernance.aiEnabled 
              ? 'bg-gradient-to-br from-white to-emerald-50/40 border-emerald-200' 
              : 'bg-gradient-to-br from-white to-red-50/50 border-red-200'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${
                    aiGovernance.aiEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                  }`} />
                  <span className="text-xs font-black uppercase tracking-wider text-gray-500">
                    Master Operational Control
                  </span>
                  <span className="bg-gray-900 text-[#FFCC00] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    SuperAdmin Only
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900">
                  DHL Autonomous AI Copilot Master Kill-Switch
                </h2>
                <p className="text-xs text-gray-500 max-w-2xl">
                  Instantly halt all generative proposals, automated route optimizations, and unattended tariff adjustments across the fleet network.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    if (!isSuperadmin) return;
                    toggleAIMasterSwitch(!aiGovernance.aiEnabled);
                    showNotification(aiGovernance.aiEnabled ? 'AI Systems Terminated by Kill Switch' : 'AI Systems Restored to Active Duty');
                  }}
                  disabled={!isSuperadmin}
                  className={`px-5 py-3 rounded-xl font-black text-xs flex items-center space-x-2 transition-all shadow-md ${
                    !isSuperadmin 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : aiGovernance.aiEnabled
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>{aiGovernance.aiEnabled ? 'ENGAGE KILL SWITCH (DISABLE AI)' : 'ENABLE AI AUTOMATION'}</span>
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 font-mono">
              <span>Status: <strong className={aiGovernance.aiEnabled ? 'text-emerald-700' : 'text-red-700'}>{aiGovernance.aiEnabled ? 'ARMED & OPERATIONAL' : 'TERMINATED (OFFLINE)'}</strong></span>
              <span>Last Modified By: <strong>{aiGovernance.lastModifiedBy}</strong> ({aiGovernance.lastModifiedAt})</span>
            </div>
          </div>

          {/* SECTION 2: HUMAN-IN-THE-LOOP PENDING PROPOSALS */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-[#D40511]" />
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900">
                  Human-in-the-Loop Proposal Review Queue ({pendingActions.length} Pending)
                </h3>
              </div>

              <button
                onClick={() => setShowResolvedHistory(!showResolvedHistory)}
                className="text-xs text-blue-600 font-bold hover:underline flex items-center space-x-1"
              >
                <History className="w-3.5 h-3.5" />
                <span>{showResolvedHistory ? 'Hide Resolved History' : 'View Action History'}</span>
              </button>
            </div>

            {pendingActions.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                <span>All autonomous proposals have been reviewed and resolved. Zero pending items.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingActions.map((action) => (
                  <div key={action.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                          {action.actionType.replace('_', ' ')}
                        </span>
                        <h4 className="font-extrabold text-xs text-gray-900">{action.title}</h4>
                      </div>
                      <span className="text-[11px] font-mono text-gray-500">{action.timestamp}</span>
                    </div>

                    <p className="text-xs text-gray-700">{action.description}</p>

                    {action.proposerPrompt && (
                      <div className="text-[11px] bg-white p-2.5 rounded-lg border border-amber-200 text-gray-600">
                        <strong className="text-gray-900">AI Reasoning:</strong> {action.proposerPrompt}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <input
                        type="text"
                        placeholder="Rejection reason or modification notes..."
                        value={rejectReason[action.id] || ''}
                        onChange={(e) => setRejectReason({ ...rejectReason, [action.id]: e.target.value })}
                        className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg flex-1 min-w-[200px]"
                      />

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRejectAction(action.id)}
                          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-lg text-xs flex items-center space-x-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject Proposal</span>
                        </button>

                        <button
                          onClick={() => handleApproveAction(action.id)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center space-x-1 shadow"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Deploy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Database */}
      {activeTab === 'database' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-base font-extrabold text-gray-900">Prisma ORM & SQLite Storage Engine</h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Embedded SQLite database synchronized via Prisma schema models for durable local persistence.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={async () => {
                  setIsRefreshing(true);
                  await refreshDatabase();
                  setIsRefreshing(false);
                  showNotification('Prisma Database synchronized successfully');
                }}
                disabled={isRefreshing}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl text-xs font-extrabold flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Sync DB State</span>
              </button>

              <button
                onClick={async () => {
                  if (!confirm('Are you sure you want to reseed the database? This will refresh demo shipments, drivers, hubs, and governance state.')) return;
                  setIsReseeding(true);
                  await reseedDatabase();
                  setIsReseeding(false);
                  showNotification('Database reseeded with initial dataset');
                }}
                disabled={isReseeding}
                className="px-3.5 py-2 bg-[#D40511] hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 shadow"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{isReseeding ? 'Reseeding...' : 'Reseed Database'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
              <span className="text-gray-500 font-bold block">Shipments</span>
              <span className="text-lg font-black text-gray-900 font-mono mt-1 block">{shipments.length}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
              <span className="text-gray-500 font-bold block">Drivers</span>
              <span className="text-lg font-black text-gray-900 font-mono mt-1 block">{drivers.length}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
              <span className="text-gray-500 font-bold block">Warehouses</span>
              <span className="text-lg font-black text-gray-900 font-mono mt-1 block">{warehouses.length}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
              <span className="text-gray-500 font-bold block">Invoices</span>
              <span className="text-lg font-black text-gray-900 font-mono mt-1 block">{invoices.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: RBAC Matrix */}
      {activeTab === 'rbac' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-gray-900">Role-Based Access Control (RBAC) Matrix</h2>
              <p className="text-xs text-gray-500">Configure permission boundaries for SuperAdmin, Admin, Driver, and Public Customer.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-gray-600 font-black">
                  <th className="py-3 px-4">Permission Scope</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Superadmin</th>
                  <th className="py-3 px-4 text-center">Admin</th>
                  <th className="py-3 px-4 text-center">Driver</th>
                  <th className="py-3 px-4 text-center">Public Customer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                {permissions.map((perm) => (
                  <tr key={perm.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">{perm.name}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{perm.description}</td>

                    {(['superadmin', 'admin', 'driver', 'customer'] as Role[]).map((r) => {
                      const isChecked = perm[r];
                      return (
                        <td key={r} className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={!isSuperadmin || (r === 'superadmin' && perm.id === 'perm-01')}
                            onChange={() => togglePermission(perm.id, r)}
                            className="rounded text-[#D40511] focus:ring-0 cursor-pointer disabled:cursor-not-allowed w-4 h-4"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: API Credentials */}
      {activeTab === 'api' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <h2 className="text-base font-extrabold text-gray-900 border-b border-gray-100 pb-3">
            External Gateway & API Integrations
          </h2>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Google Gemini AI Engine (gemini-3.7-flash)</h3>
                <p className="text-xs text-gray-500">Autonomous route optimizer, natural language dispatch, and incident co-pilot.</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-300">
                Connected & Operational
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">OpenStreetMap / Leaflet Tile Server</h3>
                <p className="text-xs text-gray-500">High-resolution cartographic raster tiles for worldwide GPS live tracking.</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-300">
                Connected (Free Tier)
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Webhooks Outbound Dispatch Feed</h3>
                <p className="text-xs text-gray-500 font-mono text-[11px]">https://api.dhl-logistics.internal/v1/webhooks/status-stream</p>
              </div>
              <span className="bg-blue-100 text-blue-800 font-extrabold text-xs px-3 py-1 rounded-full border border-blue-300">
                Listening (200 OK)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Telemetry */}
      {activeTab === 'telemetry' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-gray-900">GPS Telematics Simulation & Jitter Engine</h2>
              <p className="text-xs text-gray-500">Simulate live vehicle movements, speed pulses, and waypoint updates in real time.</p>
            </div>

            <button
              onClick={toggleSimulation}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                isSimulating ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {isSimulating ? 'Engine Streaming (Active)' : 'Engine Paused'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl">
              <span className="text-gray-500 font-bold block">Telemetry Frequency</span>
              <span className="text-base font-black text-gray-900 font-mono mt-1 block">Every 4,000 ms</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl">
              <span className="text-gray-500 font-bold block">Vehicle Jitter Radius</span>
              <span className="text-base font-black text-blue-600 font-mono mt-1 block">±0.0015° Coordinates</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl">
              <span className="text-gray-500 font-bold block">Active Fleet Feeds</span>
              <span className="text-base font-black text-emerald-600 font-mono mt-1 block">4 Live Couriers</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
