import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Globe,
  Calendar,
  Bell,
  User,
  Key,
  Shield,
  X,
  Menu,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Flame,
  Moon,
  Sun,
} from 'lucide-react';
import { MarketRegion, UserAccount } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedMarket: MarketRegion;
  onMarketChange: (market: MarketRegion) => void;
  selectedDateRange: '24h' | '48h' | '7d' | '30d' | '90d' | 'all';
  onDateRangeChange: (range: '24h' | '48h' | '7d' | '30d' | '90d' | 'all') => void;
  isApiConnected: boolean;
  onOpenApiModal: () => void;
  onOpenPricing: () => void;
  onNavigate: (view: string) => void;
  onToggleMobileSidebar: () => void;
  currentUser?: UserAccount | null;
  onOpenAuth?: () => void;
}

const MARKETS: MarketRegion[] = [
  'Global',
  'United States',
  'Pakistan',
  'India',
  'United Kingdom',
  'Canada',
  'Australia',
  'UAE',
  'Saudi Arabia',
  'Bangladesh',
  'Indonesia',
  'Turkey',
  'South Korea',
];

const DATE_RANGES: { label: string; value: '24h' | '48h' | '7d' | '30d' | '90d' | 'all' }[] = [
  { label: 'Last 24 Hours', value: '24h' },
  { label: 'Last 48 Hours', value: '48h' },
  { label: 'Past 7 Days', value: '7d' },
  { label: 'Past 30 Days', value: '30d' },
  { label: 'Past 90 Days', value: '90d' },
  { label: 'All Time Window', value: 'all' },
];

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedMarket,
  onMarketChange,
  selectedDateRange,
  onDateRangeChange,
  isApiConnected,
  onOpenApiModal,
  onOpenPricing,
  onNavigate,
  onToggleMobileSidebar,
  currentUser,
  onOpenAuth,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(() => {
    return localStorage.getItem('viralreader_high_contrast') === 'true';
  });
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close menus on outside click and handle keyboard shortcut for search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (
        (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleTheme = () => {
    const nextVal = !isHighContrast;
    setIsHighContrast(nextVal);
    localStorage.setItem('viralreader_high_contrast', String(nextVal));
    if (nextVal) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-[#1B293E] bg-[#0D1726]/95 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#16243A] md:hidden transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search viral videos, creators, formats, or topics... (Press / to search)"
            className="w-full pl-9 pr-8 py-2 bg-[#070D18] border border-[#1B293E] focus:border-[#6D3DF5] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Control Strip & Selectors */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Country / Market Selector */}
        <div className="relative hidden sm:block">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#070D18] border border-[#1B293E] text-xs text-slate-200">
            <Globe className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
            <select
              value={selectedMarket}
              onChange={(e) => onMarketChange(e.target.value as MarketRegion)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer pr-4 appearance-none"
            >
              {MARKETS.map((m) => (
                <option key={m} value={m} className="bg-[#0D1726] text-slate-200">
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none -ml-3" />
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="relative hidden md:block">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#070D18] border border-[#1B293E] text-xs text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={selectedDateRange}
              onChange={(e) => onDateRangeChange(e.target.value as any)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer pr-4 appearance-none"
            >
              {DATE_RANGES.map((d) => (
                <option key={d.value} value={d.value} className="bg-[#0D1726] text-slate-200">
                  {d.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none -ml-3" />
          </div>
        </div>

        {/* YouTube API Status Button */}
        <button
          onClick={onOpenApiModal}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            isApiConnected
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40'
              : 'bg-[#111C2D] border-[#1B293E] text-slate-300 hover:text-white hover:bg-[#16243A]'
          }`}
          title="Configure Google YouTube Data API v3 key"
        >
          <Key className={`w-3.5 h-3.5 ${isApiConnected ? 'text-emerald-400' : 'text-[#8B5CF6]'}`} />
          <span className="hidden sm:inline">
            {isApiConnected ? 'YouTube API Connected' : 'Demo Mode (Benchmark Data)'}
          </span>
          <span className="sm:hidden">{isApiConnected ? 'API Live' : 'Demo'}</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#16243A] transition-colors"
          title={isHighContrast ? 'Theme: Midnight High Contrast (Click for Cinematic Navy)' : 'Theme: Cinematic Dark Navy (Click for High Contrast)'}
          aria-label="Toggle visual theme"
        >
          {isHighContrast ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-400" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#16243A] transition-colors relative"
            title="Trend notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#6D3DF5]" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0D1726] border border-[#1B293E] rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in text-xs">
              <div className="p-3 border-b border-[#1B293E] flex items-center justify-between bg-[#111C2D]">
                <span className="font-bold text-slate-100 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Breakout Trend Alerts</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Live Feed</span>
              </div>
              <div className="divide-y divide-[#1B293E] max-h-72 overflow-y-auto">
                <div
                  onClick={() => {
                    setNotificationsOpen(false);
                    onNavigate('outlier-detector');
                  }}
                  className="p-3 hover:bg-[#16243A] cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between text-purple-400 font-semibold">
                    <span>Extreme Outlier Detected (14.6x)</span>
                    <span className="text-[10px] text-slate-400">12m ago</span>
                  </div>
                  <p className="text-slate-300">
                    "I Built a $40k/Mo Agency Solo" by Solo Builder Nomad is surging at 12.4k VPH.
                  </p>
                </div>
                <div
                  onClick={() => {
                    setNotificationsOpen(false);
                    onNavigate('drama-tv');
                  }}
                  className="p-3 hover:bg-[#16243A] cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between text-emerald-400 font-semibold">
                    <span>Pakistan Drama Trend Peak</span>
                    <span className="text-[10px] text-slate-400">1h ago</span>
                  </div>
                  <p className="text-slate-300">
                    Prime-time episode cliffhanger breakdown trending #1 with 35k views/hour.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Authenticated / Creator Profile Menu */}
        <div className="relative" ref={profileRef}>
          {currentUser ? (
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 pl-2 rounded-lg bg-[#070D18] border border-[#1B293E] hover:border-[#6D3DF5]/50 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-[#6D3DF5] flex items-center justify-center text-white text-[11px] font-bold">
                {currentUser.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : 'CR'}
              </div>
              <div className="hidden lg:flex flex-col text-left leading-none">
                <span className="text-xs font-semibold text-slate-200">{currentUser.displayName || 'Creator'}</span>
                <span className="text-[9px] text-purple-400 font-mono mt-0.5">{currentUser.plan.toUpperCase()}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6D3DF5] hover:bg-[#5B2DE0] text-xs font-semibold text-white shadow-sm transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {profileOpen && currentUser && (
            <div className="absolute right-0 mt-2 w-60 bg-[#0D1726] border border-[#1B293E] rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in text-xs">
              <div className="p-3 border-b border-[#1B293E] bg-[#111C2D]">
                <div className="font-bold text-slate-100 flex items-center justify-between">
                  <span>{currentUser.displayName}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#6D3DF5]/30 text-purple-300 border border-[#6D3DF5]/40 font-bold uppercase">
                    {currentUser.plan}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
              </div>
              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (onOpenAuth) onOpenAuth();
                  }}
                  className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-[#16243A] rounded-lg transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    <span>Account Profile &amp; Quotas</span>
                  </span>
                  <span className="text-[10px] text-purple-400 font-mono">
                    {currentUser.usageToday?.aiGenerations || 0} used
                  </span>
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate('my-niche');
                  }}
                  className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-[#16243A] rounded-lg transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>My Niche &amp; Watchlist</span>
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate('saved-videos');
                  }}
                  className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-[#16243A] rounded-lg transition-colors flex items-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved Library</span>
                </button>
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onNavigate('admin-panel');
                    }}
                    className="w-full px-3 py-2 text-left text-rose-300 hover:text-white hover:bg-[#16243A] rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Shield className="w-3.5 h-3.5 text-rose-400" />
                    <span>Admin Command Center</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onOpenPricing();
                  }}
                  className="w-full px-3 py-2 text-left text-purple-400 hover:text-purple-300 hover:bg-[#16243A] rounded-lg transition-colors flex items-center justify-between"
                >
                  <span>Subscription Plans</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate('settings');
                  }}
                  className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-[#16243A] rounded-lg transition-colors"
                >
                  Profile &amp; Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
