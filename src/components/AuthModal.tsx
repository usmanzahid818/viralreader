import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Sparkles,
  Shield,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Zap,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { UserAccount } from '../types';
import { AuthService } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onAuthSuccess: (user: UserAccount) => void;
  onLogout: () => void;
  onOpenPricing: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onLogout,
  onOpenPricing,
}) => {
  const [tab, setTab] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (tab === 'login') {
        const res = await AuthService.login(email, password);
        if (res.success && res.user) {
          onAuthSuccess(res.user);
          onClose();
        } else {
          setErrorMsg(res.error || 'Login failed. Please verify credentials.');
        }
      } else if (tab === 'signup') {
        const res = await AuthService.signup(email, password, displayName);
        if (res.success && res.user) {
          onAuthSuccess(res.user);
          onClose();
        } else {
          setErrorMsg(res.error || 'Sign up failed.');
        }
      } else if (tab === 'forgot') {
        const res = await AuthService.resetPassword(email);
        setSuccessMsg(res.message);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Authentication request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you certain you want to permanently delete your account and all saved library items?')) {
      return;
    }
    setLoading(true);
    const res = await AuthService.deleteAccount();
    setLoading(false);
    if (res.success) {
      onLogout();
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to delete account.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0D1726] border border-[#1B293E] rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1B293E] bg-[#111C2D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D3DF5] to-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-[#6D3DF5]/30">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-tight">ViralReader Account</h2>
              <p className="text-[10px] text-slate-400">
                {currentUser ? 'Your active creator profile & tier' : 'Creator authentication & workspace'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#16243A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If Already Logged In: Show Account Profile */}
        {currentUser ? (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#16243A] border border-[#233852]">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6D3DF5] to-[#8B5CF6] flex items-center justify-center text-white text-lg font-bold shadow-md">
                {currentUser.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : 'CR'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white truncate">{currentUser.displayName}</h3>
                  {currentUser.role === 'admin' && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-mono font-bold">
                      ADMIN
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 truncate">{currentUser.email}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6D3DF5]/20 text-purple-300 border border-[#6D3DF5]/40 font-semibold uppercase">
                    {currentUser.plan.toUpperCase()} TIER
                  </span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active Session</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Daily Usage Quota Meter */}
            <div className="p-4 rounded-xl bg-[#09101C] border border-[#1B293E] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>Today's Feature Quota</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Resets Daily at 00:00 UTC
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>AI Generations Used</span>
                    <span className="font-mono text-white font-semibold">
                      {currentUser.usageToday?.aiGenerations || 0} / {currentUser.plan === 'pro' ? '100' : '5'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#6D3DF5] to-cyan-400 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          ((currentUser.usageToday?.aiGenerations || 0) / (currentUser.plan === 'pro' ? 100 : 5)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Thumbnails Studio Designs</span>
                    <span className="font-mono text-white font-semibold">
                      {currentUser.usageToday?.thumbnails || 0} / {currentUser.plan === 'pro' ? '50' : '3'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          ((currentUser.usageToday?.thumbnails || 0) / (currentUser.plan === 'pro' ? 50 : 3)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {currentUser.plan === 'free' && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPricing();
                  }}
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-gradient-to-r from-[#6D3DF5] to-[#8B5CF6] hover:opacity-95 text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-md shadow-[#6D3DF5]/20"
                >
                  <span>Upgrade to Pro for 100 Daily Generations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Account Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1B293E]">
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#16243A] hover:bg-[#1E304B] border border-[#233852] text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-purple-400" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Authentication Form (Login / Signup / Forgot Password) */
          <div className="p-6 space-y-4">
            {/* Tab switchers */}
            <div className="flex rounded-xl bg-[#070D18] p-1 border border-[#1B293E]">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  tab === 'login' ? 'bg-[#6D3DF5] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  tab === 'signup' ? 'bg-[#6D3DF5] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('forgot');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  tab === 'forgot' ? 'bg-[#6D3DF5] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Reset
              </button>
            </div>

            {/* Error or Success Notice */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {tab === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Display Name or Channel Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Solo Creator"
                      className="w-full pl-9 pr-3 py-2 bg-[#070D18] border border-[#1B293E] focus:border-[#6D3DF5] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="creator@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-[#070D18] border border-[#1B293E] focus:border-[#6D3DF5] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {tab !== 'forgot' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-[#070D18] border border-[#1B293E] focus:border-[#6D3DF5] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-[#6D3DF5] hover:bg-[#5B2DE0] disabled:opacity-50 text-xs font-semibold text-white rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#6D3DF5]/20"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <span>
                    {tab === 'login' ? 'Sign In to Workspace' : tab === 'signup' ? 'Create Free Creator Account' : 'Send Reset Link'}
                  </span>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-[#1B293E] text-center text-[11px] text-slate-400">
              <span className="text-slate-400">Initial platform administrator: </span>
              <span className="text-purple-300 font-mono">uzuz8686786@gmail.com</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
