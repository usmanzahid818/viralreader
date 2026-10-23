import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Activity,
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
} from 'lucide-react';
import { UserAccount, AdminOverviewStats } from '../../types';

interface AdminPanelViewProps {
  currentUser: UserAccount | null;
  onOpenScoreExplainer: () => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({ currentUser }) => {
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const token = localStorage.getItem('viralreader_auth_token');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [resOverview, resUsers, resLogs] = await Promise.all([
        fetch('/api/admin/overview', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/audit-logs', { headers }),
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
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (userId: string, newPlan: 'free' | 'pro' | 'agency') => {
    setUpdatingId(userId);
    try {
      const res = await fetch('/api/admin/update-user-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: userId, newPlan }),
      });

      if (res.ok) {
        setMessage(`Successfully upgraded user tier to ${newPlan.toUpperCase()}.`);
        fetchAdminData();
      }
    } catch {
      setMessage('Failed to modify user tier.');
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
          Please sign in with authorized administrator credentials (e.g.{' '}
          <span className="text-purple-300 font-mono">uzuz8686786@gmail.com</span>).
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2D] border border-[#1B293E] hover:border-[#6D3DF5]/50 text-xs text-slate-300 hover:text-white transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#8B5CF6] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/50 text-xs text-purple-200 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-purple-400 hover:text-white">
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
          <div className="text-[10px] text-purple-300">Gemini 3.8 Flash Engine</div>
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
          <div className="text-[10px] text-slate-400">20m TTL / In-memory store</div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="p-5 rounded-2xl bg-[#0D1726] border border-[#1B293E] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#8B5CF6]" />
              <span>User Accounts &amp; Subscription Governance</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Manage per-user entitlement plans, usage quotas, and roles.
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
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Plan Tier</th>
                <th className="py-2.5 px-3">Today's Usage</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B293E]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#111C2D]/60 transition-colors">
                  <td className="py-3 px-3 font-medium text-white">{u.email}</td>
                  <td className="py-3 px-3 text-slate-400">{u.displayName || '—'}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-rose-950/40 text-rose-300 border border-rose-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {u.role}
                    </span>
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
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {u.plan !== 'free' && (
                        <button
                          onClick={() => handleUpdatePlan(u.id, 'free')}
                          disabled={updatingId === u.id}
                          className="px-2 py-1 rounded bg-[#16243A] hover:bg-[#1B293E] text-[10px] text-slate-300 transition-colors"
                        >
                          Set Free
                        </button>
                      )}
                      {u.plan !== 'pro' && (
                        <button
                          onClick={() => handleUpdatePlan(u.id, 'pro')}
                          disabled={updatingId === u.id}
                          className="px-2 py-1 rounded bg-[#6D3DF5] hover:bg-[#5B2DE0] text-[10px] text-white font-semibold transition-colors"
                        >
                          Set Pro
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

      {/* Audit Logs Table */}
      <div className="p-5 rounded-2xl bg-[#0D1726] border border-[#1B293E] space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span>Security Audit Log (Recent Actions)</span>
        </h3>

        {auditLogs.length > 0 ? (
          <div className="divide-y divide-[#1B293E] text-xs">
            {auditLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-slate-300">
                <div className="space-y-0.5">
                  <div className="font-semibold text-white">{log.action}</div>
                  <div className="text-[11px] text-slate-400">{log.details}</div>
                </div>
                <div className="text-right text-[10px] font-mono text-slate-400">
                  <div>{log.adminEmail}</div>
                  <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-500">
            No administrative security interventions logged in this session.
          </div>
        )}
      </div>
    </div>
  );
};
