'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setTerminalLogsModalOpen } from '@/store/slices/uiSlice';
import { addLog, setLogs } from '@/store/slices/terminalLogsSlice';
import { Terminal, AlertCircle, AlertTriangle, Info, RefreshCw, Trash2, X, CheckCircle2 } from 'lucide-react';
import { LogEntry } from '@/lib/logger';

export function TerminalLogsModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isTerminalLogsModalOpen);
  const [filter, setFilter] = useState<'ALL' | 'ERROR' | 'WARN' | 'INFO'>('ALL');
  const [localLogs, setLocalLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/logs');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setLocalLogs(json.data);
          dispatch(setLogs(json.data));
        }
      }
    } catch (err) {
      console.error('Failed to fetch terminal logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      const load = async () => {
        try {
          const res = await fetch('/api/logs');
          if (res.ok && isMounted) {
            const json = await res.json();
            if (json.success && json.data) {
              setLocalLogs(json.data);
              dispatch(setLogs(json.data));
            }
          }
        } catch (err) {
          console.error('Failed to fetch terminal logs:', err);
        }
      };

      load();
      const interval = setInterval(load, 3000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  const filteredLogs = localLogs.filter((log) => {
    if (filter === 'ALL') return true;
    return log.level === filter;
  });

  const errorCount = localLogs.filter((l) => l.level === 'ERROR').length;
  const warnCount = localLogs.filter((l) => l.level === 'WARN').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[85vh] flex flex-col liquid-glass-dark rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
            </div>
            <div className="flex items-center space-x-2 pl-2">
              <Terminal className="w-4 h-4 text-[#FFCC00]" />
              <span className="font-mono text-xs font-bold text-white tracking-wider">
                NODE_SERVER://terminal.stderr.log
              </span>
              <span className="text-[10px] bg-white/10 text-emerald-400 font-mono px-2 py-0.5 rounded-full">
                LIVE STREAM
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
              title="Refresh Logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={async () => {
                await fetch('/api/logs', { method: 'DELETE' });
                setLocalLogs([]);
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/30 text-gray-300 hover:text-red-300 transition-colors"
              title="Clear Logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => dispatch(setTerminalLogsModalOpen(false))}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-black/30 border-b border-white/5 text-xs font-mono">
          <div className="flex items-center space-x-2">
            {(['ALL', 'ERROR', 'WARN', 'INFO'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilter(lvl)}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                  filter === lvl
                    ? lvl === 'ERROR'
                      ? 'bg-red-500 text-white shadow'
                      : lvl === 'WARN'
                      ? 'bg-yellow-500 text-black shadow'
                      : 'bg-white/20 text-white shadow'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {lvl} {lvl === 'ERROR' && errorCount > 0 && `(${errorCount})`}
                {lvl === 'WARN' && warnCount > 0 && `(${warnCount})`}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-gray-400">
            Showing {filteredLogs.length} events
          </span>
        </div>

        {/* Log Stream Output */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs space-y-2 bg-[#0d1117] select-text">
          {filteredLogs.length === 0 ? (
            <div className="py-16 text-center text-gray-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 opacity-60" />
              <p>Terminal output is clear. No active runtime errors reported.</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isError = log.level === 'ERROR';
              const isWarn = log.level === 'WARN';
              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isError
                      ? 'bg-red-950/40 border-red-800/60 text-red-200'
                      : isWarn
                      ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                      : 'bg-white/5 border-white/5 text-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      {isError ? (
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      ) : isWarn ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-400 shrink-0" />
                      )}
                      <span className="text-[10px] text-gray-400">{log.timestamp}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isError
                            ? 'bg-red-500 text-white'
                            : isWarn
                            ? 'bg-yellow-500 text-black'
                            : 'bg-blue-500/30 text-blue-300'
                        }`}
                      >
                        {log.level}
                      </span>
                      <span className="text-[11px] font-bold text-[#FFCC00]">[{log.module}]</span>
                    </div>
                  </div>

                  <div className="mt-1.5 text-xs text-white font-medium pl-6">
                    {log.message}
                  </div>

                  {log.details && (
                    <pre className="mt-2 ml-6 p-2 rounded bg-black/60 text-[10px] text-gray-300 overflow-x-auto border border-white/10">
                      {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}

                  {log.stack && (
                    <pre className="mt-2 ml-6 p-2 rounded bg-red-950/80 text-[10px] text-red-300 overflow-x-auto border border-red-800/60 font-mono">
                      {log.stack}
                    </pre>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
