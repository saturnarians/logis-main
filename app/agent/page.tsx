'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLogistics } from '@/context/LogisticsContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  Cpu, 
  Terminal, 
  Radio, 
  Truck, 
  Route, 
  RefreshCw, 
  Clock, 
  Sliders, 
  ArrowLeft, 
  Layers, 
  FileCode, 
  Check, 
  Mic, 
  MicOff,
  Activity,
  History,
  TrendingUp,
  Scale
} from 'lucide-react';

interface AgentType {
  id: string;
  name: string;
  code: string;
  role: string;
  status: 'active' | 'standby' | 'processing';
  confidence: number;
  tasksCompleted: number;
  description: string;
  iconColor: string;
}

const AGENTS_FLEET: AgentType[] = [
  {
    id: 'agent-route',
    name: 'AutoRoute-Optimizer',
    code: 'AGT-RT-01',
    role: 'Multi-Stop TSP & Green Corridor Solver',
    status: 'active',
    confidence: 99.4,
    tasksCompleted: 1420,
    description: 'Calculates dynamic shortest paths, avoids real-time M25/A3 traffic congestions, and minimizes CO2 emissions across diesel and EV vans.',
    iconColor: 'bg-emerald-500',
  },
  {
    id: 'agent-sla',
    name: 'Exception & SLA Watchdog',
    code: 'AGT-SLA-02',
    role: 'Autonomous Incident & Delay Triage',
    status: 'active',
    confidence: 98.7,
    tasksCompleted: 890,
    description: 'Monitors consignment milestones, detects flight delays at Heathrow/Frankfurt, and automatically alerts station controllers and couriers.',
    iconColor: 'bg-amber-500',
  },
  {
    id: 'agent-tariff',
    name: 'Dynamic Tariff & Pricing Engine',
    code: 'AGT-TRF-03',
    role: 'Real-Time Fuel Surcharge & Load Balancer',
    status: 'active',
    confidence: 97.9,
    tasksCompleted: 645,
    description: 'Adjusts freight rates based on Brent crude index, customs tariff harmonized codes (HS), and seasonal peak capacity loads.',
    iconColor: 'bg-blue-500',
  },
  {
    id: 'agent-fleet',
    name: 'Predictive EV Fleet Diagnostician',
    code: 'AGT-FLT-04',
    role: 'Battery Health & Preventive Maintenance',
    status: 'standby',
    confidence: 99.1,
    tasksCompleted: 410,
    description: 'Analyzes live CAN-bus and OBD-II telemetry, EV motor heat signatures, regenerative braking efficiency, and scheduled hub pit-stops.',
    iconColor: 'bg-purple-500',
  },
];

const PRESET_PROMPTS = [
  'Analyze traffic congestion on London-Frankfurt lane and propose optimized waypoints',
  'Audit carbon footprint for all overnight express shipments and suggest EV re-allocations',
  'Simulate 12% fuel price surge impact on Western European cross-border freight tariffs',
  'Review delayed consignment DHL-8942-01 and trigger automated driver re-assignment',
  'Scan fleet maintenance logs for vans with EV battery degradation exceeding 15%',
];

export default function AgentCommandCenterPage() {
  const { 
    currentUser, 
    aiGovernance, 
    toggleAIMasterSwitch, 
    shipments, 
    drivers, 
    vehicles, 
    tariffs, 
    executeOrQueueAIAction,
    toggleCopilot
  } = useLogistics();

  const [selectedAgent, setSelectedAgent] = useState<AgentType>(AGENTS_FLEET[0]);
  const [promptInput, setPromptInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);

  // Reasoning steps trace
  const [reasoningLogs, setReasoningLogs] = useState<Array<{
    id: string;
    timestamp: string;
    agent: string;
    step: 'intent' | 'query' | 'tool_call' | 'proposal' | 'executed';
    text: string;
    payload?: any;
  }>>([
    {
      id: 'log-1',
      timestamp: 'Just now',
      agent: 'AutoRoute-Optimizer',
      step: 'intent',
      text: 'Autonomous multi-agent coordinator initialized in real-time streaming mode.',
    },
    {
      id: 'log-2',
      timestamp: 'Just now',
      agent: 'Exception & SLA Watchdog',
      step: 'query',
      text: `Telemetry stream active: ${shipments.length} consignments, ${drivers.length} drivers, ${vehicles.length} active fleet units loaded into working memory.`,
    },
  ]);

  const [agentAuditHistory, setAgentAuditHistory] = useState<Array<{
    id: string;
    time: string;
    prompt: string;
    agentName: string;
    status: 'Approved' | 'Executed' | 'Queued' | 'Blocked';
    impact: string;
  }>>([
    {
      id: 'hist-1',
      time: '10:42 AM',
      prompt: 'Dynamic routing for vehicle DHL-EV-402',
      agentName: 'AutoRoute-Optimizer',
      status: 'Executed',
      impact: 'Saved 24 min & 1.8 kg CO2',
    },
    {
      id: 'hist-2',
      time: '09:15 AM',
      prompt: 'Tariff surcharge update on cross-channel lane',
      agentName: 'Dynamic Tariff & Pricing Engine',
      status: 'Approved',
      impact: 'Applied +3.5% seasonal index',
    },
  ]);

  const handleRunPrompt = async (promptToRun?: string) => {
    const text = promptToRun || promptInput;
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);
    const now = new Date().toLocaleTimeString();

    // 1. Log User Intent
    setReasoningLogs(prev => [
      {
        id: `log-${Date.now()}-1`,
        timestamp: now,
        agent: selectedAgent.name,
        step: 'intent',
        text: `Analyzing User Instruction: "${text}"`,
      },
      ...prev,
    ]);

    // Simulate Agent Step 2: Tool Discovery & Data Query
    setTimeout(() => {
      setReasoningLogs(prev => [
        {
          id: `log-${Date.now()}-2`,
          timestamp: new Date().toLocaleTimeString(),
          agent: selectedAgent.name,
          step: 'query',
          text: `Executing tool discovery: querying live database context for ${selectedAgent.code}...`,
        },
        ...prev,
      ]);
    }, 600);

    // Simulate Agent Step 3: Tool Execution / Proposal Generation
    setTimeout(() => {
      let toolName = 'calculate_optimized_waypoints';
      let payloadData: any = {
        origin: 'London Gateway',
        destination: 'Frankfurt Hub',
        avoidTrafficCorridor: 'A3 Snowstorm / M25 J12',
        estimatedTimeSavingMinutes: 32,
        co2ReductionKg: 4.2,
      };

      if (text.toLowerCase().includes('tariff') || text.toLowerCase().includes('fuel') || text.toLowerCase().includes('price')) {
        toolName = 'adjust_dynamic_surcharge';
        payloadData = {
          tariffId: tariffs[0]?.id || 'trf-eur-01',
          adjustedRatePerKg: 4.85,
          fuelMultiplier: 1.12,
          reason: 'Brent Crude Index spot adjustment',
        };
      } else if (text.toLowerCase().includes('delay') || text.toLowerCase().includes('reassign')) {
        toolName = 'dispatch_emergency_reassignment';
        payloadData = {
          trackingId: shipments[0]?.trackingId || 'DHL-8942-01',
          assignedDriverId: 'drv-101',
          urgency: 'HIGH',
          customerSmsDispatched: true,
        };
      }

      setReasoningLogs(prev => [
        {
          id: `log-${Date.now()}-3`,
          timestamp: new Date().toLocaleTimeString(),
          agent: selectedAgent.name,
          step: 'tool_call',
          text: `Invoked Tool: \`${toolName}()\``,
          payload: payloadData,
        },
        ...prev,
      ]);

      // Step 4: Governance check
      if (!aiGovernance.aiEnabled) {
        setReasoningLogs(prev => [
          {
            id: `log-${Date.now()}-4`,
            timestamp: new Date().toLocaleTimeString(),
            agent: selectedAgent.name,
            step: 'proposal',
            text: 'BLOCKED: Master AI Kill-Switch is active. Action prohibited until re-armed by SuperAdmin.',
          },
          ...prev,
        ]);
        setIsProcessing(false);
        return;
      }

      const actionRes = executeOrQueueAIAction({
        actionType: text.toLowerCase().includes('tariff') ? 'update_tariff' : text.toLowerCase().includes('delay') ? 'assign_driver' : 'create_route_alert',
        title: `AI Proposal: ${text.substring(0, 45)}...`,
        description: `Autonomous recommendation generated by ${selectedAgent.name} (${selectedAgent.code})`,
        proposerPrompt: text,
        payload: payloadData,
      });

      setReasoningLogs(prev => [
        {
          id: `log-${Date.now()}-5`,
          timestamp: new Date().toLocaleTimeString(),
          agent: selectedAgent.name,
          step: actionRes.status === 'queued' ? 'proposal' : 'executed',
          text: actionRes.message,
        },
        ...prev,
      ]);

      setAgentAuditHistory(prev => [
        {
          id: `hist-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          prompt: text,
          agentName: selectedAgent.name,
          status: actionRes.status === 'queued' ? 'Queued' : 'Executed',
          impact: text.toLowerCase().includes('tariff') ? 'Pricing updated' : 'Route re-calculated',
        },
        ...prev,
      ]);

      setIsProcessing(false);
      if (!promptToRun) setPromptInput('');
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-gray-900 flex flex-col justify-between selection:bg-red-100 selection:text-[#D40511]">
      <div>
        <PublicHeader onOpenCopilot={toggleCopilot} />

        <AuthGuard 
          allowedRoles={['superadmin', 'admin', 'driver']} 
          requiredClearanceLabel="Autonomous Logistics Multi-Agent Command Console"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/dashboard"
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 transition-colors flex items-center gap-1 text-xs font-bold"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <div className="h-4 w-px bg-white/20" />
                    <span className="bg-[#D40511] text-[#FFCC00] text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-widest font-mono">
                      GEMINI-POWERED MULTI-AGENT SWARM
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                    <span>Autonomous Logistics Agent Command Center</span>
                    <Bot className="w-8 h-8 text-[#FFCC00] animate-bounce" />
                  </h1>

                  <p className="text-xs sm:text-sm text-gray-300 max-w-3xl leading-relaxed">
                    Deploy, orchestrate, and supervise autonomous AI agents for TSP vehicle route planning, real-time SLA breach detection, dynamic fuel tariffs, and EV diagnostics with human-in-the-loop governance.
                  </p>
                </div>

                {/* Kill Switch Banner */}
                <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 shrink-0">
                  <div className="text-right sm:text-left">
                    <div className="text-[10px] uppercase font-mono text-gray-400 font-bold">Autonomous Control</div>
                    <div className="text-sm font-black text-white flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${aiGovernance.aiEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                      <span>{aiGovernance.aiEnabled ? 'SWARM ONLINE' : 'KILL SWITCH ENGAGED'}</span>
                    </div>
                  </div>

                  {currentUser?.role === 'superadmin' && (
                    <button
                      onClick={() => toggleAIMasterSwitch(!aiGovernance.aiEnabled)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow ${
                        aiGovernance.aiEnabled
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{aiGovernance.aiEnabled ? 'Halt Swarm' : 'Arm Swarm'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Background Tech Pattern */}
              <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
                <Bot className="w-80 h-80 text-white" />
              </div>
            </div>

            {/* AGENT SELECTION CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {AGENTS_FLEET.map((agent) => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    selectedAgent.id === agent.id
                      ? 'bg-white border-[#D40511] shadow-lg ring-2 ring-[#D40511]/20'
                      : 'bg-white/80 hover:bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${agent.iconColor}`} />
                      <span className="font-mono text-[11px] font-bold text-gray-500">{agent.code}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-gray-700 px-2 py-0.5 rounded-full">
                      {agent.confidence}% ACCURACY
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-gray-900 leading-snug">
                    {agent.name}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium mt-1 line-clamp-2">
                    {agent.role}
                  </p>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono text-gray-400">
                    <span>Tasks: <strong className="text-gray-700">{agent.tasksCompleted}</strong></span>
                    <span className="text-emerald-600 font-bold">READY</span>
                  </div>
                </button>
              ))}
            </div>

            {/* INTERACTIVE WORKSPACE & PROMPT TERMINAL */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 Cols: Prompt Terminal & Reasoning Stream */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-5 h-5 text-[#D40511]" />
                      <h2 className="font-extrabold text-sm sm:text-base text-gray-900">
                        Dispatch Instruction to {selectedAgent.name}
                      </h2>
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">
                      Target: <strong className="text-gray-800">{selectedAgent.code}</strong>
                    </span>
                  </div>

                  {/* Preset prompt pills */}
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5 font-mono">
                      Fast One-Click Autonomous Actions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_PROMPTS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleRunPrompt(p)}
                          disabled={isProcessing}
                          className="text-[11px] text-left px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-[#D40511] hover:border-red-200 border border-gray-200 rounded-xl transition-all font-medium disabled:opacity-50"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRunPrompt();
                    }}
                    className="space-y-3 pt-2"
                  >
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        placeholder={`Instruct ${selectedAgent.name} (e.g. "Recalculate route for DHL-EV-402 to avoid motorway congestion and update customer ETA")...`}
                        className="w-full p-3.5 rounded-2xl border border-gray-200 focus:border-[#D40511] focus:ring-2 focus:ring-[#D40511]/20 outline-none text-xs font-medium resize-none shadow-inner"
                      />

                      <div className="absolute right-3 bottom-3 flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setIsVoiceRecording(!isVoiceRecording)}
                          className={`p-2 rounded-xl text-xs transition-all ${
                            isVoiceRecording 
                              ? 'bg-red-600 text-white animate-pulse' 
                              : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                          }`}
                          title="Voice Input Command"
                        >
                          {isVoiceRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-500 font-mono">
                        Press Enter or click Execute Action
                      </span>

                      <button
                        type="submit"
                        disabled={isProcessing || !promptInput.trim()}
                        className="px-5 py-2.5 bg-[#D40511] hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all flex items-center space-x-2 shadow-md disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>{isProcessing ? 'Agent Thinking & Executing...' : 'Execute Autonomous Step'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* REAL-TIME REASONING TERMINAL */}
                <div className="bg-gray-950 text-gray-100 rounded-3xl p-6 space-y-4 border border-gray-800 font-mono text-xs shadow-xl">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-4 h-4 text-[#FFCC00]" />
                      <span className="font-bold text-white">Live Agent Reasoning & Tool-Call Stream</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold animate-pulse">
                      ● STREAM ACTIVE
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                    {reasoningLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-3 rounded-2xl border space-y-1.5 transition-all ${
                          log.step === 'tool_call'
                            ? 'bg-blue-950/40 border-blue-800/60 text-blue-200'
                            : log.step === 'proposal'
                            ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                            : log.step === 'executed'
                            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                            : 'bg-gray-900/60 border-gray-800/80 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center space-x-2">
                            <span className="text-[#FFCC00] font-bold">[{log.agent}]</span>
                            <span className="uppercase text-gray-400">({log.step})</span>
                          </div>
                          <span className="text-gray-500 font-mono">{log.timestamp}</span>
                        </div>

                        <p className="text-xs font-sans text-gray-100">{log.text}</p>

                        {log.payload && (
                          <pre className="text-[10px] bg-black/60 p-2.5 rounded-xl border border-white/10 text-emerald-300 overflow-x-auto">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right 5 Cols: Governance Status & Execution Audit History */}
              <div className="lg:col-span-5 space-y-6">
                {/* Agent Health & Governance Matrix */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-extrabold text-sm text-gray-900">Governance & Security Matrix</h3>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      ENFORCED
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Data Access Level:</span>
                      <span className="font-mono font-bold text-gray-900 uppercase">{aiGovernance.dataAccessMode}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Human-in-the-Loop Threshold:</span>
                      <span className="font-mono font-bold text-amber-700">Financial / Route Changes</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Active Model Engine:</span>
                      <span className="font-mono font-bold text-[#D40511]">Google Gemini 3.7 Flash</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Pending Approvals Queue:</span>
                      <span className="font-mono font-bold text-gray-900">
                        {aiGovernance.pendingActions.filter(a => a.status === 'pending').length} Actions
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/dashboard"
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-gray-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Configure AI Governance Rules</span>
                    </Link>
                  </div>
                </div>

                {/* Recent Autonomous Actions Audit */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <History className="w-5 h-5 text-gray-700" />
                      <h3 className="font-extrabold text-sm text-gray-900">Agent Decision Audit Trail</h3>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">{agentAuditHistory.length} Recorded</span>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {agentAuditHistory.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-gray-100 hover:bg-white hover:border-gray-300 transition-all text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 font-sans">{item.agentName}</span>
                          <span className="text-[10px] font-mono text-gray-400">{item.time}</span>
                        </div>
                        <p className="text-gray-600 text-[11px] truncate">{item.prompt}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-gray-500 font-medium">{item.impact}</span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                            item.status === 'Executed' ? 'bg-emerald-100 text-emerald-800' :
                            item.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AuthGuard>
      </div>

      <PublicFooter />
    </div>
  );
}
