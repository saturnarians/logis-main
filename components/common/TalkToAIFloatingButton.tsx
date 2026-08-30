'use client';

import React from 'react';
import { useLogistics } from '@/context/LogisticsContext';
import { Mic, Sparkles } from 'lucide-react';

export const TalkToAIFloatingButton: React.FC = () => {
  const { isCopilotOpen, toggleCopilot, aiGovernance } = useLogistics();

  if (isCopilotOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center group">
      {/* Floating Action Button */}
      <button
        onClick={toggleCopilot}
        className={`relative flex items-center space-x-2.5 text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl border-2 transition-all transform hover:scale-105 active:scale-95 group focus:outline-none focus:ring-4 ${
          aiGovernance.aiEnabled
            ? 'bg-gradient-to-r from-[#D40511] to-red-700 hover:from-red-700 hover:to-red-800 border-[#FFCC00] focus:ring-amber-400/40'
            : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black border-red-500/80 focus:ring-red-400/40'
        }`}
        aria-label="Talk to DHL AI Voice Assistant"
      >
        {/* Pulsating backdrop glow */}
        <span className={`absolute -inset-1 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse -z-10 ${
          aiGovernance.aiEnabled
            ? 'bg-gradient-to-r from-red-600 to-amber-500'
            : 'bg-gradient-to-r from-gray-700 to-red-600'
        }`} />

        {/* Mic Icon with Gold/Gray Container */}
        <div className={`p-1.5 rounded-full shadow-inner flex items-center justify-center ${
          aiGovernance.aiEnabled ? 'bg-[#FFCC00] text-gray-950' : 'bg-red-600 text-white'
        }`}>
          <Mic className="w-4 h-4 font-black" />
        </div>

        {/* Text Label */}
        <div className="flex flex-col text-left">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs sm:text-sm font-black tracking-wide uppercase text-white drop-shadow">
              {aiGovernance.aiEnabled ? 'Talk to AI' : 'AI Paused'}
            </span>
            <span className={`hidden sm:inline-block w-2 h-2 rounded-full ${
              aiGovernance.aiEnabled ? 'bg-emerald-400 animate-ping' : 'bg-red-500'
            }`} />
          </div>
          <span className="hidden sm:inline text-[9px] text-amber-200 font-semibold tracking-tight">
            {aiGovernance.aiEnabled ? 'Voice & Dispatch Assistant' : 'Paused by SuperAdmin'}
          </span>
        </div>

        {/* Sparkle badge */}
        <Sparkles className={`w-3.5 h-3.5 hidden sm:inline ${aiGovernance.aiEnabled ? 'text-[#FFCC00]' : 'text-gray-400'}`} />
      </button>
    </div>
  );
};
