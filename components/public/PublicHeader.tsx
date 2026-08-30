'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLogistics } from '@/context/LogisticsContext';
import { signOut, useSession } from 'next-auth/react';
import { 
  Menu, 
  X, 
  Search, 
  User, 
  Globe, 
  ChevronRight, 
  ChevronDown, 
  Package, 
  ShieldCheck, 
  Truck, 
  BarChart3, 
  LogOut, 
  Crown, 
  Building2,
  LogIn,
  KeyRound,
  Mic,
  Sparkles
} from 'lucide-react';

interface PublicHeaderProps {
  activeTab?: string;
  onTabChange?: (tab: 'track' | 'customer_service' | 'detail' | 'dashboard') => void;
  onOpenCopilot?: () => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({ activeTab = 'track', onTabChange, onOpenCopilot }) => {
  const router = useRouter();
  const { status } = useSession();
  const { setTrackedShipmentId, currentUser, toggleCopilot } = useLogistics();
  const isAuthenticated = status === 'authenticated';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shipDropdownOpen, setShipDropdownOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');

  const triggerOpenCopilot = () => {
    if (onOpenCopilot) {
      onOpenCopilot();
    } else {
      toggleCopilot();
    }
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      const code = headerSearch.trim().toUpperCase();
      setTrackedShipmentId(code);
      if (onTabChange) {
        onTabChange('detail');
      } else {
        router.push(`/track?id=${encodeURIComponent(code)}`);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FFCC00] text-black shadow-md border-b-2 border-[#D40511]">
      {/* <div className="bg-[#111827] text-white px-4 py-1.5 text-xs font-sans flex flex-wrap items-center justify-between gap-2 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-gray-300">DHL Real-Time Operational Platform</span>
          <span className="hidden sm:inline text-gray-500">|</span>
          <span className="hidden sm:inline text-gray-400">Secure staff workspace</span>
        </div>
      </div> */}

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="flex items-center space-x-2 text-left focus:outline-none group"
          >
            <div className="bg-[#D40511] text-[#FFCC00] font-black italic tracking-tighter text-2xl px-2.5 py-0.5 rounded-sm shadow-inner flex items-center">
              <span>DHL</span>
              <span className="text-white text-xs not-italic ml-1 font-mono font-normal">EXPRESS</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1 text-sm font-bold tracking-wide">
            <Link
              href="/track"
              className={`px-3 py-2 rounded-md transition-colors ${
                activeTab === 'track' ? 'bg-[#D40511] text-white' : 'hover:bg-amber-400 text-gray-900'
              }`}
            >
              Track Consignment
            </Link>

            <div className="relative">
              <button
                onClick={() => setShipDropdownOpen(!shipDropdownOpen)}
                className="px-3 py-2 rounded-md hover:bg-amber-400 text-gray-900 flex items-center space-x-1"
              >
                <span>Ship</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {shipDropdownOpen && (
                <div className="absolute top-full left-0 w-48 bg-white text-gray-800 shadow-xl rounded-b-md border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      setShipDropdownOpen(false);
                      router.push('/track');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-xs font-semibold flex items-center"
                  >
                    <Package className="w-3.5 h-3.5 mr-2 text-[#D40511]" />
                    Book Express Parcel
                  </button>
                  <button
                    onClick={() => {
                      setShipDropdownOpen(false);
                      router.push('/track');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-xs font-semibold flex items-center"
                  >
                    <Truck className="w-3.5 h-3.5 mr-2 text-[#D40511]" />
                    Freight Services
                  </button>
                </div>
              )}
            </div>

            {/* <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-md transition-colors ${
                activeTab === 'dashboard' ? 'bg-[#D40511] text-white' : 'hover:bg-amber-400 text-gray-900'
              }`}
            >
              Dashboards
            </Link> */}

            <Link
              href="/agent"
              className={`px-3 py-2 rounded-md transition-colors ${
                activeTab === 'agent' ? 'bg-[#D40511] text-white' : 'hover:bg-amber-400 text-gray-900'
              }`}
            >
              AI Agent Center
            </Link>

            {!isAuthenticated && <Link
              href="/login"
              className={`px-3 py-2 rounded-md transition-colors ${
                activeTab === 'login' ? 'bg-[#D40511] text-white' : 'hover:bg-amber-400 text-gray-900'
              }`}
            >
              Staff Portal
            </Link>}

            {/* Talk to AI Voice Navigation Button */}
            <button
              onClick={triggerOpenCopilot}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#D40511] to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-md border border-amber-300 transition-transform hover:scale-105"
            >
              <Mic className="w-3.5 h-3.5 text-[#FFCC00] animate-pulse" />
              <span>Talk to AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </button>

            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="px-3 py-2 rounded-md bg-gray-900 text-[#FFCC00] hover:bg-black font-extrabold text-xs flex items-center space-x-1 shadow-sm ml-1"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Open workspace</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center space-x-3">
          <form onSubmit={handleQuickSearch} className="hidden lg:flex items-center bg-white rounded-md border border-gray-300 px-2 py-1 shadow-inner">
            <Search className="w-4 h-4 text-gray-400 mr-1.5" />
            <input
              type="text"
              placeholder="Track ID (e.g. DHL-8942-01)"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              className="w-44 text-xs outline-none text-gray-900 bg-transparent font-mono"
            />
            <button type="submit" className="bg-[#D40511] text-white text-xs font-semibold px-2 py-0.5 rounded hover:bg-red-700">
              Go
            </button>
          </form>

          {isAuthenticated ? currentUser && (
            <div className="hidden sm:flex items-center space-x-2 bg-black/10 px-3 py-1.5 rounded-lg border border-black/10">
              <div className="text-right">
                <div className="text-xs font-bold text-gray-900 leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-gray-700 font-mono capitalize">{currentUser.role} • {currentUser.staffId}</div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                title="Sign Out to Public View"
                className="p-1 text-gray-700 hover:text-[#D40511] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center space-x-1 bg-[#D40511] text-white text-xs font-bold px-3 py-2 rounded shadow hover:bg-red-700 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Staff Login</span>
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-md hover:bg-amber-400 focus:outline-none"
            aria-label="Open Mobile Menu"
          >
            <Menu className="w-6 h-6 text-gray-900" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          <div className="relative ml-auto w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-50">
            {/* Drawer Header */}
            <div className="bg-[#FFCC00] px-4 py-4 flex items-center justify-between border-b border-amber-300">
              <div className="bg-[#D40511] text-[#FFCC00] font-black italic tracking-tighter text-xl px-2 py-0.5 rounded-sm">
                DHL EXPRESS
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-m hover:bg-amber-400 text-[#D40511]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Menu List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 text-sm font-semibold text-gray-900">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  triggerOpenCopilot();
                }}
                className="w-full text-left px-5 py-4 bg-red-50 hover:bg-red-100 text-[#D40511] font-black flex items-center justify-between transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-[#D40511] text-white rounded-lg">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider">Voice Assistant</div>
                    <div className="text-sm font-black text-gray-900">Talk to AI (Voice & Copilot)</div>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-[#FFCC00]" />
              </button>

              <Link
                href="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-left px-5 py-3.5 hover:bg-gray-50 flex items-center justify-between"
              >
                <span>Track Consignment</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-left px-5 py-3.5 hover:bg-gray-50 flex items-center justify-between font-bold"
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span>Operations Dashboards</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                href="/agent"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-left px-5 py-3.5 hover:bg-gray-50 flex items-center justify-between font-bold"
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#D40511]" />
                  <span>AI Autonomous Agent Center</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              {!isAuthenticated && <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-left px-5 py-3.5 hover:bg-gray-50 flex items-center justify-between text-[#D40511]"
              >
                <div className="flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-[#D40511]" />
                  <span>Operations Login / Register</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>}

              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-left px-5 py-3.5 hover:bg-gray-50 flex items-center justify-between"
              >
                <span>Home / Dashboard Console</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};
