import React from 'react';
import {
  Sparkles,
  Zap,
  Flame,
  TrendingUp,
  Globe,
  Smartphone,
  Clapperboard,
  Shield,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { LegalModalType } from '../PublicLegalModal';

interface LandingPageViewProps {
  onLaunchDashboard: () => void;
  onOpenPricing: () => void;
  onOpenAuth: () => void;
  onOpenLegal: (type: LegalModalType) => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onLaunchDashboard,
  onOpenPricing,
  onOpenAuth,
  onOpenLegal,
}) => {
  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col justify-between selection:bg-[#6D3DF5]/40 selection:text-white">
      {/* Landing Navbar */}
      <nav className="h-16 px-6 border-b border-[#1B293E] bg-[#09101C]/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={onLaunchDashboard}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D3DF5] to-[#8B5CF6] flex items-center justify-center text-white shadow-lg shadow-[#6D3DF5]/30">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-white">ViralReader</span>
            <span className="text-[10px] text-purple-400 font-medium ml-2 hidden sm:inline">
              Decode Virality
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenLegal('faq')}
            className="text-xs text-slate-400 hover:text-white transition-colors hidden md:inline"
          >
            FAQ
          </button>
          <button
            onClick={onOpenPricing}
            className="text-xs text-slate-400 hover:text-white transition-colors hidden sm:inline"
          >
            Pricing
          </button>
          <button
            onClick={onOpenAuth}
            className="px-3 py-1.5 rounded-lg bg-[#111C2D] hover:bg-[#16243A] border border-[#1B293E] text-xs font-semibold text-slate-200 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={onLaunchDashboard}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#6D3DF5] to-[#8B5CF6] hover:opacity-95 text-xs font-bold text-white shadow-lg shadow-[#6D3DF5]/20 flex items-center gap-1.5 transition-all"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-16 pb-20 px-6 text-center max-w-5xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6D3DF5]/15 border border-[#6D3DF5]/30 text-purple-300 text-xs font-semibold animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span>YouTube Trend Intelligence &amp; AI Creator SaaS</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
          Discover Trends.{' '}
          <span className="bg-gradient-to-r from-[#8B5CF6] via-purple-300 to-cyan-400 bg-clip-text text-transparent">
            Decode Virality.
          </span>{' '}
          Outperform the Algorithm.
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          ViralReader monitors public YouTube data across Pakistan, United States, India, UK, and UAE.
          Isolate breakout outliers with calculated multipliers, 14-point AI recommendations, and high-CTR thumbnail blueprints.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <button
            onClick={onLaunchDashboard}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#6D3DF5] to-[#8B5CF6] hover:opacity-95 text-sm font-bold text-white shadow-xl shadow-[#6D3DF5]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Launch Live Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenPricing}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#111C2D] hover:bg-[#16243A] border border-[#1B293E] text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            View Free &amp; Pro Plans
          </button>
        </div>

        {/* Live Integrity Banner */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Official Google YouTube Data API v3</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span>Zero Channel Access Required</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>No Fake Metrics or Invented Stats</span>
          </span>
        </div>
      </header>

      {/* Feature Pillars Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Built for Modern YouTube Creators &amp; Media Teams
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Traditional tools show only views; ViralReader analyzes velocity, outlier ratios, and hook retention dynamics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0D1726] border border-[#1B293E] space-y-3 hover:border-[#6D3DF5]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Outlier Multiplier Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detect videos achieving 3x to 15x their channel's median performance. Identify breakout packaging formulas before a niche saturates.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D1726] border border-[#1B293E] space-y-3 hover:border-[#6D3DF5]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">14-Point AI Content Coach</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate 3 title variations, 3-10s cold opening hooks, scene-by-scene script breakdowns, keywords, hashtags, and upload time recommendations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D1726] border border-[#1B293E] space-y-3 hover:border-[#6D3DF5]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Thumbnail Packaging Studio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Visual preview simulator supporting 16:9 Long-Form and 9:16 Shorts with safe zones, Rule of Thirds alignment, and 2-5 word high-contrast text.
            </p>
          </div>
        </div>

        {/* Global Radars */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#111C2D] to-[#0A121E] border border-[#1B293E] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/50 text-[10px] font-mono">
              <Globe className="w-3.5 h-3.5" />
              <span>INDEPENDENT COUNTRY FEEDS</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              True Regional Discovery for Pakistan, US, India, UK &amp; UAE
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every country selector triggers distinct API requests with localized query algorithms — from Pakistani prime-time drama recaps to Silicon Valley AI agents.
            </p>
          </div>
          <button
            onClick={onLaunchDashboard}
            className="px-5 py-2.5 rounded-xl bg-[#6D3DF5] hover:bg-[#5B2DE0] text-xs font-bold text-white shadow-md shadow-[#6D3DF5]/20 shrink-0"
          >
            Explore Country Radars
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1B293E] bg-[#070D18] py-10 px-6 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#6D3DF5] flex items-center justify-center text-white font-bold">
              <Zap className="w-3.5 h-3.5 fill-white" />
            </div>
            <span className="font-extrabold text-white text-sm">ViralReader</span>
            <span className="text-[11px] text-slate-500">· © 2026 ViralReader Inc.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <button onClick={() => onOpenLegal('privacy')} className="hover:text-white transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => onOpenLegal('terms')} className="hover:text-white transition-colors">
              Terms of Service
            </button>
            <button onClick={() => onOpenLegal('refund')} className="hover:text-white transition-colors">
              Refund Policy
            </button>
            <button onClick={() => onOpenLegal('faq')} className="hover:text-white transition-colors">
              FAQ
            </button>
            <button onClick={() => onOpenLegal('contact')} className="hover:text-white transition-colors">
              Contact
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
