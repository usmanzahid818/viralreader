import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Key,
  Database,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Sliders,
  FileText,
  UserCheck,
  Zap,
  Flag,
  Radio,
  UserX,
  PlusCircle,
  Save,
} from 'lucide-react';
import { UserAccount, AdminOverviewStats } from '../../types';

interface AdminPanelViewProps {
  currentUser: UserAccount | null;
  onOpenScoreExplainer?: () => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'platform' | 'moderation' | 'audit'>('users');
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [moderationReports, setModerationReports] = useState<any[]>([]);
  const [platformSettings, setPlatformSettings] = useState<any>({
    maintenanceMode: false,
    signupOpen: true,
    announcementBanner: {
      enabled: true,
      text: 'Welcome to ViralReader — AI Viral Trend Coach for YouTube creators.',
      level: 'info',
    },
  });

  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const token = localStorage.getItem('viralreader_auth_token');

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchAdminData();
    }
  }, [currentUser]);

  const fetchAdminData = async () => {
    setLoading(true);
    setMessage(null);
    setErrorMsg(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [resOverview, resUsers, resLogs, resSettings, resReports] = await Promise.all([
        fetch('/api/admin/overview', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/audit-logs', { headers }),
        fetch('/api/admin/settings', { headers }),
        fetch('/api/admin/moderation-reports', { headers }),
      ]);

      if (resOverview.ok) {
        const data = await resOverview.json();
        setStats(data);
      }
      if (resUsers.ok) {
        const data = await resUsers.json();
        setUsersList(data.users || []);
      }
      if (resLogs.ok) {
        const data = await resLogs.json();
        setAuditLogs(data.logs || []);
      }
      if (resSettings.ok) {
        const data = await resSettings.json();
        if (data.settings) setPlatformSettings(data.settings);
      }
      if (resReports.ok) {
        const data = await resReports.json();
        setModerationReports(data.reports || []);
      }
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
      setErrorMsg('Failed to load administrative data.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (userId: string, newPlan: 'free' | 'pro' | 'agency') => {
    setUpdatingId(userId);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/update-user-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: userId, newPlan }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Successfully updated tier to ${newPlan.toUpperCase()}.`);
        fetchAdminData();
      } else {
        setErrorMsg(data.error || 'Failed to update plan.');
      }
    } catch {
      setErrorMsg('Network error while updating plan.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    setUpdatingId(userId);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/toggle-user-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: userId, status: nextStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`User account ${nextStatus === 'suspended' ? 'suspended' : 'activated'} successfully.`);
        fetchAdminData();
      } else {
        setErrorMsg(data.error || 'Failed to update account status.');
      }
    } catch {
      setErrorMsg('Network error updating user status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddCredits = async (userId: string, currentCredits: number = 0) => {
    const amountStr = prompt('Enter additional bonus AI generations for this creator:', '25');
    if (!amountStr) return;
    const addAmount = parseInt(amountStr, 10);
    if (isNaN(addAmount) || addAmount <= 0) return;

    setUpdatingId(userId);
    try {
      const res = await fetch('/api/admin/update-user-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: userId, customAiCredits: currentCredits + addAmount }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Added +${addAmount} bonus AI credits.`);
        fetchAdminData();
      } else {
        setErrorMsg(data.error || 'Failed to update credits.');
      }
    } catch {
      setErrorMsg('Network error updating credits.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSavePlatformSettings = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(platformSettings),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Global platform settings and announcement banner saved.');
      } else {
        setErrorMsg(data.error || 'Failed to save platform settings.');
      }
    } catch {
      setErrorMsg('Network error saving settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId: string, status: 'reviewed' | 'dismissed') => {
    const notes = prompt(`Enter resolution notes for report ${reportId}:`, status === 'reviewed' ? 'Verified violation' : 'False positive');
    setUpdatingId(reportId);
    try {
      const res = await fetch(`/api/admin/moderation-reports/${reportId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, notes: notes || undefined }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Moderation report marked as ${status}.`);
        fetchAdminData();
      } else {
        setErrorMsg(data.error || 'Failed to resolve report.');
      }
    } catch {
      setErrorMsg('Network error resolving report.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full bg-rose-950/40 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Administrative Access Required</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The ViralReader Admin Command Center is strictly protected by server-side role validation.
          Please sign in with authorized administrator credentials.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1B293E]/60">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Admin Command Center
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-800/50">
              RESTRICTED ROOT
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Platform governance, user tier allocations, YouTube API quota telemetry, and audit trails.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2D] border border-[#1B293E] hover:border-[#6D3DF5]/50 text-xs text-slate-300 hover:text-white transition-colors disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#8B5CF6] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/50 text-xs text-purple-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-purple-400 hover:text-white cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0D1726] border border-[#1B293E] space-y-1">
          <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Registered Creators</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats?.totalUsers || usersList.length}</div>
          <div className="text-[10px] text-slate-400">
            {stats?.freeUsers ?? 0} Free / {stats?.premiumUsers ?? 0} Pro
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1726] border border-[#1B293E] space-y-1">
          <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Generations (Today)</span>
          </div>
          <div className="text-2xl font-bold text-purple-400 font-mono">{stats?.totalAiGenerations || 0}</div>
          <div className="text-[10px] text-purple-300">Gemini 2.5 Engine</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1726] border border-[#1B293E] space-y-1">
          <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            <span>YouTube Quota Health</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {stats?.youtubeApiStatus?.isServerKeyConfigured ? 'CONNECTED' : 'STANDBY'}
          </div>
          <div className="text-[10px] text-slate-400">10,000 units/day Google limit</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1726] border border-[#1B293E] space-y-1">
          <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Active Cache Clusters</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats?.activeCacheEntries || 12}</div>
          <div className="text-[10px] text-slate-400">In-memory / JSON persistence</div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-[#1B293E] gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'users'
              ? 'border-[#6D3DF5] text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span>Creators & Governance ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('platform')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'platform'
              ? 'border-[#6D3DF5] text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Platform & Banner Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'moderation'
              ? 'border-[#6D3DF5] text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flag className="w-3.5 h-3.5 text-amber-400" />
          <span>Moderation ({moderationReports.filter((r) => r.status === 'pending').length} pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'audit'
              ? 'border-[#6D3DF5] text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-rose-400" />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Creators & Governance */}
      {activeTab === 'users' && (
        <div className="p-5 rounded-2xl bg-[#0D1726] border border-[#1B293E] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8B5CF6]" />
                <span>User Accounts & Tier Allocations</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Manage per-user entitlement plans, account activation/suspension, and bonus AI quotas.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by email or name..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#070D18] border border-[#1B293E] focus:border-[#6D3DF5] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#111C2D] text-slate-400 text-[10px] uppercase font-mono border-b border-[#1B293E]">
                <tr>
                  <th className="py-2.5 px-3">User Email</th>
                  <th className="py-2.5 px-3">Display Name</th>
                  <th className="py-2.5 px-3">Role & Status</th>
                  <th className="py-2.5 px-3">Plan Tier</th>
                  <th className="py-2.5 px-3">Today's Usage</th>
                  <th className="py-2.5 px-3">Bonus AI Credits</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B293E]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#111C2D]/60 transition-colors">
                    <td className="py-3 px-3 font-medium text-white">{u.email}</td>
                    <td className="py-3 px-3 text-slate-400">{u.displayName || '—'}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-rose-950/40 text-rose-300 border border-rose-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {u.role}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                            u.status === 'suspended'
                              ? 'bg-red-950/50 text-red-400 border border-red-800'
                              : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {u.status || 'active'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          u.plan === 'pro'
                            ? 'bg-purple-950/40 text-purple-300 border border-purple-800'
                            : u.plan === 'agency'
                            ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-800'
                            : 'bg-slate-800/60 text-slate-400'
                        }`}
                      >
                        {u.plan}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {u.usageToday?.aiGenerations || 0} AI / {u.usageToday?.thumbnails || 0} Thumbnails
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-purple-300">
                      +{u.customAiCredits || 0}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {u.plan !== 'free' && (
                          <button
                            onClick={() => handleUpdatePlan(u.id, 'free')}
                            disabled={updatingId === u.id}
                            className="px-2 py-1 rounded bg-[#16243A] hover:bg-[#1B293E] text-[10px] text-slate-300 transition-colors cursor-pointer"
                          >
                            Set Free
                          </button>
                        )}
                        {u.plan !== 'pro' && (
                          <button
                            onClick={() => handleUpdatePlan(u.id, 'pro')}
                            disabled={updatingId === u.id}
                            className="px-2 py-1 rounded bg-[#6D3DF5] hover:bg-[#5B2DE0] text-[10px] text-white font-semibold transition-colors cursor-pointer"
                          >
                            Set Pro
                          </button>
                        )}
                        {u.plan !== 'agency' && (
                          <button
                            onClick={() => handleUpdatePlan(u.id, 'agency')}
                            disabled={updatingId === u.id}
                            className="px-2 py-1 rounded bg-cyan-700 hover:bg-cyan-600 text-[10px] text-white font-semibold transition-colors cursor-pointer"
                          >
                            Set Agency
                          </button>
                        )}
                        <button
                          onClick={() => handleAddCredits(u.id, u.customAiCredits)}
                          disabled={updatingId === u.id}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-purple-300 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          title="Add Bonus AI Credits"
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>+Credits</span>
                        </button>
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => handleToggleStatus(u.id, u.status || 'active')}
                            disabled={updatingId === u.id}
                            className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                              u.status === 'suspended'
                                ? 'bg-emerald-800 hover:bg-emerald-700 text-white'
                                : 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/60'
                            }`}
                          >
                            {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Platform & Announcements */}
      {activeTab === 'platform' && (
        <div className="p-5 rounded-2xl bg-[#0D1726] border border-[#1B293E] space-y-5">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Global Platform Settings & Announcement Banner</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Control platform maintenance status, creator registration availability, and broadcast announcement bars.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#070D18] border border-[#1B293E] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Maintenance Mode</div>
                  <div className="text-[11px] text-slate-400">Put non-admin routes into maintenance state</div>
                </div>
                <input
                  type="checkbox"
                  checked={platformSettings.maintenanceMode}
                  onChange={(e) =>
                    setPlatformSettings((prev: any) => ({ ...prev, maintenanceMode: e.target.checked }))
                  }
                  className="w-4 h-4 accent-[#6D3DF5] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1B293E]">
                <div>
                  <div className="text-xs font-bold text-white">Open Signups</div>
                  <div className="text-[11px] text-slate-400">Allow new creators to register accounts</div>
                </div>
                <input
                  type="checkbox"
                  checked={platformSettings.signupOpen}
                  onChange={(e) =>
                    setPlatformSettings((prev: any) => ({ ...prev, signupOpen: e.target.checked }))
                  }
                  className="w-4 h-4 accent-[#6D3DF5] cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#070D18] border border-[#1B293E] space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white">Announcement Banner</div>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={platformSettings.announcementBanner?.enabled ?? true}
                    onChange={(e) =>
                      setPlatformSettings((prev: any) => ({
                        ...prev,
                        announcementBanner: { ...prev.announcementBanner, enabled: e.target.checked },
                      }))
                    }
                    className="accent-[#6D3DF5] cursor-pointer"
                  />
                  <span>Show Banner</span>
                </label>
              </div>

              <input
                type="text"
                value={platformSettings.announcementBanner?.text || ''}
                onChange={(e) =>
                  setPlatformSettings((prev: any) => ({
                    ...prev,
                    announcementBanner: { ...prev.announcementBanner, text: e.target.value },
                  }))
                }
                placeholder="Announcement message..."
                className="w-full px-3 py-2 bg-[#0D1726] border border-[#1B293E] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6D3DF5]"
              />

              <div className="flex items-center gap-3 text-xs text-slate-300">
                <span>Severity:</span>
                {(['info', 'warning', 'alert'] as const).map((level) => (
                  <label key={level} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="bannerLevel"
                      value={level}
                      checked={platformSettings.announcementBanner?.level === level}
                      onChange={() =>
                        setPlatformSettings((prev: any) => ({
                          ...prev,
                          announcementBanner: { ...prev.announcementBanner, level },
                        }))
                      }
                      className="accent-[#6D3DF5]"
                    />
                    <span className="capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleSavePlatformSettings}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#6D3DF5] hover:bg-[#5B2DE0] text-xs font-semibold text-white flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Platform Settings</span>
          </button>
        </div>
      )}

      {/* Tab 3: Moderation Reports */}
      {activeTab === 'moderation' && (
        <div className="p-5 rounded-2xl bg-[#0D1726] border border-[#1B293E] space-y-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Flag className="w-4 h-4 text-amber-400" />
              <span>Community Moderation Reports</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Review flagged thumbnails, spam flags, and deceptive title claims.
            </p>
          </div>

          {moderationReports.length > 0 ? (
            <div className="divide-y divide-[#1B293E]">
              {moderationReports.map((report) => (
                <div key={report.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{report.videoTitle || 'Flagged Item'}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                          report.status === 'pending'
                            ? 'bg-amber-950/40 text-amber-300 border border-amber-800'
                            : report.status === 'reviewed'
                            ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Reported by <span className="text-slate-300">{report.reporterEmail}</span>: "{report.reason}"
                    </div>
                    {report.notes && (
                      <div className="text-[10px] text-purple-300">Admin Note: {report.notes}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {report.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleResolveReport(report.id, 'reviewed')}
                          disabled={updatingId === report.id}
                          className="px-2.5 py-1 rounded bg-emerald-800 hover:bg-emerald-700 text-[10px] text-white font-semibold transition-colors cursor-pointer"
                        >
                          Approve Action
                        </button>
                        <button
                          onClick={() => handleResolveReport(report.id, 'dismissed')}
                          disabled={updatingId === report.id}
                          className="px-2.5 py-1 rounded bg-[#16243A] hover:bg-[#1B293E] text-[10px] text-slate-300 transition-colors cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No moderation reports pending.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Audit Logs Table */}
      {activeTab === 'audit' && (
        <div className="p-5 rounded-2xl bg-[#0D1726] border border-[#1B293E] space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Security Audit Trail</span>
          </h3>

          {auditLogs.length > 0 ? (
            <div className="divide-y divide-[#1B293E] text-xs">
              {auditLogs.slice(0, 30).map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between text-slate-300">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">{log.action}</div>
                    <div className="text-[11px] text-slate-400">{log.details}</div>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-400">
                    <div>{log.adminEmail}</div>
                    <div>{new Date(log.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-500">
              No administrative security interventions logged yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
