import React, { useState, useEffect } from 'react';
import {
  Settings,
  Key,
  Shield,
  Trash2,
  Check,
  User,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Server,
  Globe,
  Bell,
} from 'lucide-react';
import { StorageService, UserPreferences } from '../../services/storageService';
import { YouTubeApiConfig, MarketRegion } from '../../types';

interface SettingsViewProps {
  onOpenApiModal: () => void;
  onOpenScoreExplainer: () => void;
  onResetAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenApiModal,
  onOpenScoreExplainer,
  onResetAllData,
}) => {
  const [prefs, setPrefs] = useState<UserPreferences>(() => StorageService.getPreferences());
  const [ytConfig, setYtConfig] = useState<YouTubeApiConfig>(() => StorageService.getYouTubeConfig());
  const [serverHealth, setServerHealth] = useState<{ hasGeminiKey: boolean; time: string } | null>(null);
  const [checkingServer, setCheckingServer] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    checkServer();
  }, []);

  const checkServer = async () => {
    setCheckingServer(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setServerHealth(data);
      }
    } catch {
      setServerHealth(null);
    } finally {
      setCheckingServer(false);
    }
  };

  const handleSavePrefs = () => {
    StorageService.savePreferences(prefs);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1B293E]/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Profile &amp; Settings
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6D3DF5]/20 text-[#8B5CF6] border border-[#6D3DF5]/30">
              WORKSPACE CONFIG
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage your workspace integrations, default discovery market, API credentials, and platform disclosures.
          </p>
        </div>

        <button
          onClick={handleSavePrefs}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6D3DF5] hover:bg-[#5B2DE0] text-xs font-semibold text-white transition-colors self-start sm:self-auto shadow-sm"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Settings className="w-4 h-4" />}
          <span>{savedSuccess ? 'Preferences Saved!' : 'Save Preferences'}</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="p-5 rounded-xl bg-[#111C2D] border border-[#1B293E] space-y-4">
        <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-[#8B5CF6]" />
          <span>Creator Profile Identity</span>
        </h2>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6D3DF5] to-[#8B5CF6] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[#6D3DF5]/20">
            CR
          </div>
          <div>
            <div className="text-base font-bold text-white">Creator</div>
            <div className="text-xs text-slate-400">ViralReader SaaS Pro Workspace</div>
            <div className="text-[11px] text-purple-400 font-mono mt-0.5">Role: Principal Channel Strategist</div>
          </div>
        </div>
      </div>

      {/* Integration Connections */}
      <div className="p-5 rounded-xl bg-[#111C2D] border border-[#1B293E] space-y-4">
        <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Key className="w-4 h-4 text-[#8B5CF6]" />
          <span>API &amp; Engine Integrations</span>
        </h2>

        <div className="space-y-3">
          {/* YouTube Data API */}
          <div className="p-4 rounded-lg bg-[#070D18] border border-[#1B293E] flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-xs">Google YouTube Data API v3</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    ytConfig.isConnected
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {ytConfig.isConnected ? 'Connected' : 'Demo Intelligence Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your personal Google Cloud API key for direct real-time YouTube search and channel statistics.
              </p>
            </div>
            <button
              onClick={onOpenApiModal}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white bg-[#16243A] hover:bg-[#1E2F4A] border border-[#1B293E] transition-colors shrink-0"
            >
              Configure Key
            </button>
          </div>

          {/* Gemini AI Backend Status */}
          <div className="p-4 rounded-lg bg-[#070D18] border border-[#1B293E] flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-xs">Server-Side Gemini 3.8 Flash</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    serverHealth?.hasGeminiKey
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                      : 'bg-purple-950/40 text-purple-300 border border-purple-800/40'
                  }`}
                >
                  {serverHealth?.hasGeminiKey ? 'Gemini Key Active' : 'Benchmark Engine Active'}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Executes trend summarization, hook deconstruction, and custom idea synthesis via express proxy routes.
              </p>
            </div>
            <button
              onClick={checkServer}
              disabled={checkingServer}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Ping backend API"
            >
              <RefreshCw className={`w-4 h-4 ${checkingServer ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Discovery Preferences */}
      <div className="p-5 rounded-xl bg-[#111C2D] border border-[#1B293E] space-y-4">
        <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Default Market &amp; Alert Thresholds</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Default Market Filter</label>
            <select
              value={prefs.defaultMarket}
              onChange={(e) => setPrefs({ ...prefs, defaultMarket: e.target.value as MarketRegion })}
              className="w-full px-3 py-2 bg-[#070D18] border border-[#1B293E] focus:border-[#6D3DF5] rounded-lg text-slate-200 focus:outline-none"
            >
              <option value="Global">Global</option>
              <option value="Pakistan">Pakistan</option>
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="UAE">UAE</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Breakout Outlier Alert Threshold</label>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="range"
                min="2.0"
                max="8.0"
                step="0.5"
                value={prefs.minOutlierNotification}
                onChange={(e) => setPrefs({ ...prefs, minOutlierNotification: parseFloat(e.target.value) })}
                className="w-full accent-[#6D3DF5]"
              />
              <span className="font-mono text-purple-400 font-bold tabular-nums w-12 text-right">
                {prefs.minOutlierNotification}x
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reset & Storage Clear */}
      <div className="p-5 rounded-xl bg-[#111C2D] border border-[#1B293E] space-y-3">
        <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span>Clear Local Storage Cache</span>
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Reset all locally saved videos, saved trends, custom niche keywords, and API configuration keys stored in your browser.
        </p>
        <button
          onClick={onResetAllData}
          className="px-4 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-xs font-semibold text-rose-300 hover:text-white transition-colors"
        >
          Reset All Local Storage Data
        </button>
      </div>
    </div>
  );
};
