'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useLogistics } from '@/context/LogisticsContext';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { 
  ShieldCheck, 
  Truck, 
  Building2, 
  Crown, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Package,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AICopilotModal } from '@/components/dashboard/AICopilotModal';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginUser, registerUser, warehouses } = useLogistics();

  // Mode: 'login' | 'register'
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);

  // Selected Target Role for login/register: 'driver' | 'admin' | 'superadmin'
  const [selectedRole, setSelectedRole] = useState<'driver' | 'admin' | 'superadmin'>('superadmin');

  // Login form state
  const [emailOrStaffId, setEmailOrStaffId] = useState('superadmin@dhl.com');
  const [password, setPassword] = useState('password123');
  const [terminalHub, setTerminalHub] = useState('London Central Gateway');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regStaffId, setRegStaffId] = useState('');
  const [regHub, setRegHub] = useState(warehouses[0]?.name || 'London Central Gateway');
  const [regVehicleId, setRegVehicleId] = useState('DHL-EV-402');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAgreed, setRegAgreed] = useState(true);

  // Feedback status
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  // Fast Demo 1-Click Login handlers with NextAuth signIn
  const handleQuickDemoLogin = async (targetRole: 'driver' | 'admin' | 'superadmin') => {
    setSelectedRole(targetRole);
    setIsSubmitting(true);
    setFeedback(null);

    let defaultEmail = 'superadmin@dhl.com';
    let defaultStaffId = 'DHL-DIR-001';
    let defaultName = 'Alex Rodriguez';

    if (targetRole === 'admin') {
      defaultEmail = 'admin@dhl.com';
      defaultStaffId = 'DHL-MGR-442';
      defaultName = 'Sarah Jenkins';
    } else if (targetRole === 'driver') {
      defaultEmail = 'driver@dhl.com';
      defaultStaffId = 'DHL-DRV-101';
      defaultName = 'Marcus Vance';
    }

    setEmailOrStaffId(defaultEmail);

    try {
      // Authenticate via NextAuth
      const result = await signIn('credentials', {
        email: defaultEmail,
        password: 'password123',
        redirect: false,
      });

      if (result?.error) throw new Error(result.error);
      loginUser(targetRole, {
        email: defaultEmail,
        staffId: defaultStaffId,
        name: defaultName,
        hub: terminalHub,
        vehicleId: targetRole === 'driver' ? 'DHL-EV-402' : undefined,
      });

      setFeedback({
        type: 'success',
        message: `Authenticated via NextAuth as ${targetRole.toUpperCase()} (${defaultName}). Entering dashboard...`,
      });

      const destination = '/dashboard';

      window.location.assign(destination);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Authentication error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Login Form
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await signIn('credentials', {
        email: emailOrStaffId,
        password: password,
        redirect: false,
      });

      if (res?.error) {
        setFeedback({ type: 'error', message: res.error });
        setIsSubmitting(false);
        return;
      }

      loginUser(selectedRole, {
        email: emailOrStaffId.includes('@') ? emailOrStaffId : undefined,
        staffId: !emailOrStaffId.includes('@') ? emailOrStaffId : undefined,
        hub: terminalHub,
        vehicleId: selectedRole === 'driver' ? 'DHL-EV-402' : undefined,
      });

      setFeedback({
        type: 'success',
        message: `Welcome back! NextAuth verified for ${selectedRole.toUpperCase()}. Redirecting...`,
      });

      const destination = '/dashboard';

      window.location.assign(destination);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Sign in failed. Please retry.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Register Form
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback({ type: 'error', message: 'Registration is not available. Use an approved staff account to sign in.' });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col justify-between text-gray-900 font-sans">
      <div>
        <PublicHeader activeTab="dashboard" onOpenCopilot={() => setCopilotOpen(true)} />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Header Banner */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 bg-[#D40511] text-[#FFCC00] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DHL OPERATIONS IDENTITY & ACCESS CONTROL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {authMode === 'login' ? 'Operational Staff Sign In' : 'Register New Personnel Profile'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto mt-1">
              Secure telematics access for courier drivers, dispatch station controllers, and executive logistics directors.
            </p>
          </div>

          {/* Quick Demo 1-Click Access Cards */}
          <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-gray-900 flex items-center">
                <Sparkles className="w-4 h-4 text-amber-500 mr-1.5" />
                Quick 1-Click Demo Login (Test any role instantly):
              </span>
              <span className="text-[10px] font-mono text-gray-500 bg-slate-100 px-2 py-0.5 rounded">
                No credentials required
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('driver')}
                className="bg-slate-50 hover:bg-red-50 hover:border-red-300 border border-gray-200 rounded-xl p-3 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="p-2 rounded-lg bg-red-100 text-[#D40511] group-hover:bg-[#D40511] group-hover:text-white transition-colors">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                    FIELD COURIER
                  </span>
                </div>
                <div className="font-bold text-xs text-gray-900">Marcus Vance</div>
                <div className="text-[11px] text-gray-500 font-mono">DHL-EV-402 (Driver View)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-gray-200 rounded-xl p-3 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-900 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                    STATION ADMIN
                  </span>
                </div>
                <div className="font-bold text-xs text-gray-900">Sarah Jenkins</div>
                <div className="text-[11px] text-gray-500 font-mono">London Hub Dispatch</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('superadmin')}
                className="bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-gray-200 rounded-xl p-3 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Crown className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                    SUPERADMIN
                  </span>
                </div>
                <div className="font-bold text-xs text-gray-900">Alex Rodriguez</div>
                <div className="text-[11px] text-gray-500 font-mono">Global Command & Fleet</div>
              </button>
            </div>
          </div>

          {/* Main Auth Container */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
            {/* Top Toggle Bar: Sign In vs Register */}
            <div className="grid grid-cols-2 border-b border-gray-200 bg-slate-50">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setFeedback(null);
                }}
                className={`py-3.5 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                  authMode === 'login'
                    ? 'bg-white text-[#D40511] border-b-2 border-[#D40511]'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Sign In (Existing Staff)</span>
              </button>

              <button
                onClick={() => {
                  setAuthMode('register');
                  setFeedback(null);
                }}
                className={`py-3.5 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                  authMode === 'register'
                    ? 'bg-white text-[#D40511] border-b-2 border-[#D40511]'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Register New Personnel</span>
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Role Selection Tabs */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select Authorization Level / Role:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'driver', label: 'Field Driver', desc: 'Mobile manifest & PoD', icon: Truck },
                    { id: 'admin', label: 'Operations Admin', desc: 'Hub dispatch & billing', icon: Building2 },
                    { id: 'superadmin', label: 'Superadmin', desc: 'Full logistics oversight', icon: Crown },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedRole === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedRole(item.id as any);
                          if (authMode === 'login') {
                            if (item.id === 'driver') setEmailOrStaffId('driver@dhl.com');
                            else if (item.id === 'admin') setEmailOrStaffId('admin@dhl.com');
                            else setEmailOrStaffId('superadmin@dhl.com');
                          }
                        }}
                        className={`p-3 rounded-xl text-left border-2 transition-all ${
                          isSelected
                            ? 'border-[#D40511] bg-red-50/50 shadow-sm'
                            : 'border-gray-200 bg-slate-50 hover:bg-slate-100 text-gray-600'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-[#D40511]' : 'text-gray-500'}`} />
                          <span className={`text-xs font-black ${isSelected ? 'text-[#D40511]' : 'text-gray-800'}`}>
                            {item.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500 mt-0.5 block">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback alert */}
              {feedback && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-bold flex items-center space-x-2 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-red-50 text-red-800 border-red-300'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* LOGIN MODE FORM */}
              {authMode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Staff ID or Work Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={emailOrStaffId}
                        onChange={(e) => setEmailOrStaffId(e.target.value)}
                        placeholder="e.g. driver@dhl.com or DHL-EMP-101"
                        required
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#D40511] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-gray-700">Security Passcode *</label>
                      <button
                        type="button"
                        onClick={() => alert('Demo Reset: You can use any passcode or click 1-Click Quick Demo Login above.')}
                        className="text-[11px] font-bold text-[#D40511] hover:underline"
                      >
                        Forgot Passcode?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password or passcode"
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#D40511] focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Station / Hub</label>
                      <select
                        value={terminalHub}
                        onChange={(e) => setTerminalHub(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#D40511]"
                      >
                        {warehouses.map((w) => (
                          <option key={w.id} value={w.name}>
                            {w.name} ({w.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center space-x-2 text-xs font-bold text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded text-[#D40511] focus:ring-0"
                        />
                        <span>Remember terminal authorization</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#D40511] hover:bg-red-700 text-white font-black text-xs sm:text-sm py-3.5 px-4 rounded-xl shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>Authorize & Open {selectedRole.toUpperCase()} Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* REGISTER MODE FORM */
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Full Legal Name *</label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. David Miller"
                        className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Official DHL Staff ID *</label>
                      <input
                        type="text"
                        required
                        value={regStaffId}
                        onChange={(e) => setRegStaffId(e.target.value)}
                        placeholder="e.g. DHL-EMP-8821"
                        className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Official Work Email *</label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. dmiller@dhl.com"
                        className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Facility / Depot</label>
                      <select
                        value={regHub}
                        onChange={(e) => setRegHub(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold"
                      >
                        {warehouses.map((w) => (
                          <option key={w.id} value={w.name}>
                            {w.name} ({w.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedRole === 'driver' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Fleet Vehicle ID</label>
                      <input
                        type="text"
                        value={regVehicleId}
                        onChange={(e) => setRegVehicleId(e.target.value)}
                        placeholder="e.g. DHL-EV-402"
                        className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Create Password</label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start space-x-2 text-xs text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={regAgreed}
                        onChange={(e) => setRegAgreed(e.target.checked)}
                        className="mt-0.5 rounded text-[#D40511] focus:ring-0"
                      />
                      <span>
                        I agree to the DHL Operations Security Protocol, Telematics Monitoring Policy, and Chain of Custody standards.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !regAgreed}
                    className="w-full bg-[#D40511] hover:bg-red-700 text-white font-black text-xs sm:text-sm py-3.5 px-4 rounded-xl shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>Register Personnel & Access Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Footer Callout within Card */}
            <div className="bg-slate-50 p-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-gray-500 flex items-center space-x-1.5">
                <Package className="w-4 h-4 text-gray-400" />
                <span>Need customer package tracking instead?</span>
              </div>
              <button
                onClick={() => router.push('/track')}
                className="font-bold text-[#D40511] hover:underline flex items-center space-x-1"
              >
                <span>Go to Public Consignment Tracker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </main>
      </div>

      <PublicFooter />
      <AICopilotModal isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#D40511] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-600 font-mono">Loading DHL Authorization Portal...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
