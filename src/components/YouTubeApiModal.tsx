import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle, AlertTriangle, ExternalLink, RefreshCw, Unplug, ShieldCheck } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { YouTubeService } from '../services/youtubeService';
import { YouTubeApiConfig } from '../types';

interface YouTubeApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export const YouTubeApiModal: React.FC<YouTubeApiModalProps> = ({ isOpen, onClose, onConfigChanged }) => {
  const [config, setConfig] = useState<YouTubeApiConfig>({ apiKey: '', isConnected: false });
  const [hasServerKey, setHasServerKey] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = StorageService.getYouTubeConfig();
      setConfig(current);
      setInputKey(current.apiKey || '');
      setTestResult(null);
      YouTubeService.checkServerStatus().then((res) => {
        setHasServerKey(res.hasServerKey);
        if (res.hasServerKey && !current.apiKey) {
          setConfig((prev) => ({ ...prev, isConnected: true }));
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    if (!inputKey.trim()) {
      setTestResult({ success: false, message: 'Please enter a valid YouTube Data API key.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const result = await YouTubeService.testApiKey(inputKey.trim());
    setTesting(false);
    setTestResult(result);

    if (result.success) {
      const updatedConfig: YouTubeApiConfig = {
        apiKey: inputKey.trim(),
        isConnected: true,
        lastChecked: new Date().toISOString(),
      };
      StorageService.saveYouTubeConfig(updatedConfig);
      setConfig(updatedConfig);
      onConfigChanged();
    }
  };

  const handleDisconnect = () => {
    const emptyConfig: YouTubeApiConfig = {
      apiKey: '',
      isConnected: false,
    };
    StorageService.saveYouTubeConfig(emptyConfig);
    setConfig(emptyConfig);
    setInputKey('');
    setTestResult({ success: false, message: 'Disconnected from YouTube Data API. Switched to Demo Intelligence Mode.' });
    onConfigChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#0D1726] border border-[#1B293E] rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1B293E] bg-[#111C2D]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#6D3DF5]/20 text-[#8B5CF6]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">YouTube Data API Configuration</h2>
              <p className="text-xs text-slate-400">Connect your Google Cloud API key for live search or use Demo Mode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-sm text-slate-300">
          {/* Current Connection Status */}
          <div
            className={`p-4 rounded-lg border flex items-center justify-between ${
              config.isConnected
                ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                : 'bg-[#111C2D] border-[#1B293E] text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {config.isConnected ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-[#8B5CF6] shrink-0" />
              )}
              <div>
                <div className="font-semibold text-slate-100">
                  {config.isConnected
                    ? hasServerKey && !config.apiKey
                      ? 'Server Environment API Key Active'
                      : 'Connected to Official YouTube API'
                    : 'Operating in Demo Intelligence Mode'}
                </div>
                <div className="text-xs text-slate-400">
                  {config.isConnected
                    ? hasServerKey && !config.apiKey
                      ? 'Live queries powered by server YOUTUBE_API_KEY environment configuration'
                      : `Live queries active via session key. Last verified: ${new Date(config.lastChecked || '').toLocaleDateString()}`
                    : 'Missing YouTube API key. Browsing curated benchmark trend datasets across all 19 categories'}
                </div>
              </div>
            </div>
            {config.isConnected && config.apiKey && (
              <button
                onClick={handleDisconnect}
                className="px-2.5 py-1 text-xs text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Unplug className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            )}
          </div>

          {/* Key Input */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              YouTube Data API v3 Key
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#070D18] border border-[#1B293E] focus:border-[#6D3DF5] rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-colors font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Your API key is securely stored in this browser’s local storage and is sent only to official Google YouTube API endpoints.
            </p>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{testResult.message}</span>
            </div>
          )}

          {/* Setup Guide */}
          <div className="p-4 rounded-lg bg-[#111C2D] border border-[#1B293E] space-y-2.5 text-xs">
            <div className="font-semibold text-slate-200 flex items-center justify-between">
              <span>How to get a free YouTube Data API key:</span>
              <a
                href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#8B5CF6] hover:text-[#A78BFA] flex items-center gap-1 font-normal"
              >
                <span>Google Cloud Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 leading-relaxed">
              <li>Open Google Cloud Console and create or select a project.</li>
              <li>Navigate to <strong>APIs &amp; Services &gt; Library</strong>.</li>
              <li>Search for <strong>YouTube Data API v3</strong> and click <strong>Enable</strong>.</li>
              <li>Go to <strong>Credentials</strong> and click <strong>Create Credentials &gt; API Key</strong>.</li>
              <li>Copy the key and paste it above, then click <strong>Verify &amp; Save</strong>.</li>
            </ol>
            <p className="text-slate-500 pt-1 border-t border-[#1B293E]">
              Note: Free tier grants 10,000 units/day. Search requests cost 100 units each.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#1B293E] bg-[#111C2D] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleTestAndSave}
            disabled={testing || !inputKey.trim()}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#6D3DF5] hover:bg-[#5B2DE0] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
          >
            {testing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying with Google...</span>
              </>
            ) : (
              <span>Verify &amp; Connect Key</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
