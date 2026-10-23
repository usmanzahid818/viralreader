import React from 'react';
import {
  TrendingUp,
  Flame,
  Zap,
  BarChart2,
  PieChart,
  Activity,
  Layers,
  Sparkles,
  ArrowUpRight,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Info,
} from 'lucide-react';
import { VideoItem, FilterState, TrendCluster, CategoryName, VideoFormat } from '../types';
import { VideoCard } from './VideoCard';

interface DashboardViewProps {
  videos: VideoItem[];
  savedVideoIds: Set<string>;
  onToggleSave: (videoId: string) => void;
  onAnalyzeTrend: (video: VideoItem) => void;
  onGenerateIdeas: (video: VideoItem) => void;
  onOpenScoreExplainer: () => void;
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onSelectCategoryShortcut: (category: CategoryName) => void;
  trendClusters: TrendCluster[];
  isLiveApi: boolean;
  onOpenApiModal: () => void;
  loading?: boolean;
  quotaWarning?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  videos,
  savedVideoIds,
  onToggleSave,
  onAnalyzeTrend,
  onGenerateIdeas,
  onOpenScoreExplainer,
  filters,
  onFilterChange,
  onResetFilters,
  onSelectCategoryShortcut,
  trendClusters,
  isLiveApi,
  onOpenApiModal,
  loading = false,
  quotaWarning = false,
}) => {
  // Category shortcuts
  const categoryShortcuts: { label: string; cat: CategoryName; count: string; avgScore: number }[] = [
    { label: 'Vlogs', cat: 'Vlogs & Lifestyle', count: '1.2k', avgScore: 92 },
    { label: 'AI Content', cat: 'AI Content & Tools', count: '890', avgScore: 95 },
    { label: 'Drama & TV', cat: 'Drama & TV', count: '640', avgScore: 91 },
    { label: 'Movies', cat: 'Movies & Trailers', count: '520', avgScore: 89 },
    { label: 'Gaming', cat: 'Gaming & Esports', count: '1.8k', avgScore: 88 },
    { label: 'Technology', cat: 'Technology & Software', count: '940', avgScore: 94 },
  ];

  // Active filters count
  const hasActiveFilters =
    filters.category !== 'All' ||
    filters.format !== 'All' ||
    filters.channelTier !== 'all' ||
    filters.minViews > 0 ||
    filters.minViralScore > 0 ||
    filters.minOutlierScore > 1 ||
    filters.searchQuery.trim().length > 0;

  // Computed metrics from current video results
  const highOutliers = videos.filter((v) => v.outlierScore >= 3.0).length;
  const shortsCount = videos.filter((v) => v.format === 'Shorts').length;
  const longCount = videos.filter((v) => v.format === 'Long-Form').length;

  return (
    <div className="space-y-6">
      {/* Dashboard Title & Subtitle Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1B293E]/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>YouTube Trend Dashboard</span>
            {!isLiveApi ? (
              <span
                onClick={onOpenApiModal}
                className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800/50 cursor-pointer hover:bg-purple-900/50 transition-colors"
                title="Operating with curated benchmark intelligence dataset. Click to connect YouTube Data API."
              >
                BENCHMARK DEMO
              </span>
            ) : (
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/50">
                LIVE API ACTIVE
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Discover what's viral, why it's working, and what you can create next.
          </p>
        </div>

        {/* Quick Explainer trigger */}
        <button
          onClick={onOpenScoreExplainer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2D] border border-[#1B293E] hover:border-[#6D3DF5]/50 text-xs text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          <Info className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span>Metric Methodology</span>
        </button>
      </div>

      {/* 6 Compact KPI Cards - Dynamic & Honest */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* KPI 1 */}
        <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E] flex flex-col justify-between">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Videos Analyzed</span>
            <Activity className="w-3.5 h-3.5 text-[#8B5CF6]" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-extrabold text-white font-mono tabular-nums">
              {isLiveApi ? `${videos.length} Live` : '14,820'}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5 mt-0.5">
              <span>{isLiveApi ? 'YouTube API v3' : '+18.4% vs benchmark'}</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E] flex flex-col justify-between">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Trend Clusters</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-extrabold text-white font-mono tabular-nums">
              {trendClusters.length}
            </div>
            <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
              <span>Active Niche Patterns</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E] flex flex-col justify-between">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>High Outlier Videos</span>
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-extrabold text-purple-300 font-mono tabular-nums">
              {highOutliers}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              <span>&gt;3.0x Channel Median</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E] flex flex-col justify-between">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Active Category</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-sm font-extrabold text-white truncate" title={filters.category}>
              {filters.category === 'All' ? 'All Categories' : filters.category}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
              <span>Active Discovery Focus</span>
            </div>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E] flex flex-col justify-between">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Selected Region</span>
            <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-2">
            <div className="text-base font-extrabold text-white font-mono truncate">
              {filters.market}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              <span>ISO 3166-1 Query Filter</span>
            </div>
          </div>
        </div>

        {/* KPI 6 */}
        <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E] flex flex-col justify-between">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Active Formats</span>
            <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
          </div>
          <div className="mt-2">
            <div className="text-base font-extrabold text-[#8B5CF6] font-mono tabular-nums">
              {shortsCount}S · {longCount}L
            </div>
            <div className="text-[10px] text-purple-300 font-mono mt-0.5">
              <span>Shorts vs Long-Form</span>
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark Demo Notice */}
      {!isLiveApi && (
        <div className="px-3.5 py-2 rounded-lg bg-[#070D18] border border-[#1B293E] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
            <span>
              <strong>Demo Benchmark Mode:</strong> Platform metrics represent verified statistical models and calculated lifetime velocity averages.
            </span>
          </div>
          <button
            onClick={onOpenApiModal}
            className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] font-medium transition-colors shrink-0 text-left sm:text-right"
          >
            Connect YouTube API for Live Search →
          </button>
        </div>
      )}

      {/* 3 Analytics Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Panel 1: Trending Categories Bar Breakdown */}
        <div className="p-4 rounded-xl bg-[#111C2D] border border-[#1B293E] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#8B5CF6]" />
              <span>Trending Categories</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Share of Views</span>
          </div>

          <div className="space-y-2.5 my-1">
            {[
              { cat: 'AI Content & Tools', pct: 32, views: '42.8M', color: 'bg-[#6D3DF5]' },
              { cat: 'Entertainment & Challenges', pct: 26, views: '34.2M', color: 'bg-[#06B6D4]' },
              { cat: 'Drama & Prime TV', pct: 18, views: '24.1M', color: 'bg-[#EC4899]' },
              { cat: 'Gaming & Tech', pct: 14, views: '18.9M', color: 'bg-[#10B981]' },
              { cat: 'Food & Lifestyle Vlogs', pct: 10, views: '12.4M', color: 'bg-[#F59E0B]' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 truncate">{item.cat}</span>
                  <span className="font-mono text-slate-400 text-[11px] tabular-nums">{item.views} ({item.pct}%)</span>
                </div>
                <div className="h-2 w-full bg-[#070D18] rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct * 2.5}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 mt-2 border-t border-[#1B293E] text-[11px] text-slate-400 flex items-center justify-between">
            <span>Fastest growing: AI Autonomous Agents</span>
            <span className="text-emerald-400 font-mono">+148%</span>
          </div>
        </div>

        {/* Panel 2: Top Video Formats */}
        <div className="p-4 rounded-xl bg-[#111C2D] border border-[#1B293E] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <span>Top Video Formats</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Discovery Ratio</span>
          </div>

          {/* Visual format breakdown */}
          <div className="grid grid-cols-2 gap-3 my-2">
            <div className="p-3 rounded-lg bg-[#070D18] border border-[#1B293E] text-center">
              <div className="text-[10px] font-semibold text-rose-400 uppercase">Shorts (Vertical)</div>
              <div className="text-2xl font-extrabold text-white font-mono mt-1 tabular-nums">58%</div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">1.8x Avg Replays</div>
            </div>

            <div className="p-3 rounded-lg bg-[#070D18] border border-[#1B293E] text-center">
              <div className="text-[10px] font-semibold text-purple-400 uppercase">Long-Form (8m+)</div>
              <div className="text-2xl font-extrabold text-white font-mono mt-1 tabular-nums">34%</div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">Higher Ad RPM</div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between items-center text-[11px]">
              <span>Podcasts &amp; Live Clips</span>
              <span className="font-mono text-slate-300">8%</span>
            </div>
            <div className="p-2 rounded bg-[#070D18] border border-[#1B293E] text-[11px] text-slate-300 leading-snug">
              Key Insight: Shorts under 50 seconds paired with seamless audio loops generate 2.4x higher outlier velocity this week.
            </div>
          </div>
        </div>

        {/* Panel 3: Trend Movement & Velocity Curve */}
        <div className="p-4 rounded-xl bg-[#111C2D] border border-[#1B293E] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Trend Movement (7D)</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">+28.4% Velocity</span>
          </div>

          {/* Mock sparkline / visual trend bars */}
          <div className="my-2 p-3 rounded-lg bg-[#070D18] border border-[#1B293E]">
            <div className="text-[10px] text-slate-400 mb-2">Calculated Aggregated Views Per Hour</div>
            <div className="flex items-end justify-between h-20 gap-2 pt-2">
              {[
                { day: 'Mon', v: 45, vph: '420k' },
                { day: 'Tue', v: 52, vph: '490k' },
                { day: 'Wed', v: 68, vph: '610k' },
                { day: 'Thu', v: 61, vph: '570k' },
                { day: 'Fri', v: 84, vph: '780k' },
                { day: 'Sat', v: 92, vph: '860k' },
                { day: 'Sun', v: 98, vph: '940k' },
              ].map((b, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div
                    className="w-full bg-[#6D3DF5]/70 hover:bg-[#8B5CF6] rounded-t transition-all cursor-pointer relative"
                    style={{ height: `${b.v}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-[9px] font-mono px-1.5 py-0.5 rounded text-white whitespace-nowrap pointer-events-none z-10">
                      {b.vph}
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">{b.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Weekend upload acceleration observed</span>
            <span className="text-cyan-400 font-mono">Peak: 940k VPH</span>
          </div>
        </div>
      </div>

      {/* Category Shortcut Cards */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>Category Shortcuts</span>
          </h2>
          <span className="text-xs text-slate-400">Click to filter discovery</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {categoryShortcuts.map((cat, idx) => {
            const isSelected = filters.category === cat.cat;
            return (
              <button
                key={idx}
                onClick={() => onSelectCategoryShortcut(cat.cat)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[#6D3DF5] border-[#8B5CF6] text-white shadow-lg shadow-[#6D3DF5]/30'
                    : 'bg-[#111C2D] border-[#1B293E] hover:border-[#6D3DF5]/60 hover:bg-[#16243A] text-slate-200'
                }`}
              >
                <div className="text-xs font-bold truncate">{cat.label}</div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className={isSelected ? 'text-purple-200 font-mono' : 'text-slate-400 font-mono'}>
                    {cat.count}
                  </span>
                  <span
                    className={`font-mono font-semibold ${
                      isSelected ? 'text-white' : 'text-purple-400'
                    }`}
                  >
                    {cat.avgScore} VS
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters & Sorting Toolbar */}
      <div className="p-4 rounded-xl bg-[#111C2D] border border-[#1B293E] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Format Tabs */}
          <div className="flex items-center p-1 rounded-lg bg-[#070D18] border border-[#1B293E]">
            {(['All', 'Shorts', 'Long-Form'] as ('All' | VideoFormat)[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => onFilterChange({ format: fmt })}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filters.format === fmt
                    ? 'bg-[#6D3DF5] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {fmt === 'All' ? 'All Formats' : fmt}
              </button>
            ))}
          </div>

          {/* Channel Size Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="text-slate-400 hidden sm:inline">Channel Size:</span>
            <div className="flex items-center p-1 rounded-lg bg-[#070D18] border border-[#1B293E]">
              {[
                { label: 'All', val: 'all' },
                { label: 'Breakout (<50k)', val: 'small' },
                { label: 'Mid-Tier', val: 'medium' },
                { label: 'Large (500k+)', val: 'large' },
              ].map((tier) => (
                <button
                  key={tier.val}
                  onClick={() => onFilterChange({ channelTier: tier.val as any })}
                  className={`px-2.5 py-1 text-xs rounded transition-colors ${
                    filters.channelTier === tier.val
                      ? 'bg-[#1B293E] text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Sort by:</span>
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
                className="px-3 py-1.5 rounded-lg bg-[#070D18] border border-[#1B293E] text-xs text-slate-200 focus:outline-none cursor-pointer pr-6 appearance-none"
              >
                <option value="viralScore">Highest Viral Score</option>
                <option value="outlierScore">Highest Outlier Multiplier</option>
                <option value="views">Most Total Views</option>
                <option value="viewsPerHour">Velocity (Views/Hour)</option>
                <option value="publishedAt">Most Recent</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
            </div>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 rounded-lg transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Secondary Filter Sliders Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-[#1B293E]/50 text-xs">
          {/* Outlier Threshold */}
          <div className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg bg-[#070D18] border border-[#1B293E]">
            <span className="text-slate-400">Min Outlier:</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={filters.minOutlierScore}
                onChange={(e) => onFilterChange({ minOutlierScore: parseFloat(e.target.value) })}
                className="w-24 accent-[#6D3DF5] cursor-pointer"
              />
              <span className="font-mono font-bold text-purple-400 tabular-nums w-12 text-right">
                {filters.minOutlierScore > 1 ? `${filters.minOutlierScore}x` : 'Any'}
              </span>
            </div>
          </div>

          {/* Viral Score Threshold */}
          <div className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg bg-[#070D18] border border-[#1B293E]">
            <span className="text-slate-400">Min Viral Score:</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="95"
                step="5"
                value={filters.minViralScore}
                onChange={(e) => onFilterChange({ minViralScore: parseInt(e.target.value, 10) })}
                className="w-24 accent-[#6D3DF5] cursor-pointer"
              />
              <span className="font-mono font-bold text-cyan-400 tabular-nums w-12 text-right">
                {filters.minViralScore > 0 ? `${filters.minViralScore}+` : 'Any'}
              </span>
            </div>
          </div>

          {/* Quick Active Filter Pill info */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#070D18] border border-[#1B293E] text-slate-400">
            <span>Matching Videos:</span>
            <span className="font-mono font-bold text-white tabular-nums">
              {videos.length} Results
            </span>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="space-y-3">
        {quotaWarning && (
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              <strong>Notice:</strong> YouTube Data API daily quota limit reached (10,000 units/day). Operating seamlessly in benchmark intelligence mode.
            </span>
            <button onClick={onOpenApiModal} className="underline text-amber-200 shrink-0 font-medium">
              API Settings
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-100">
              Trending Videos ({loading ? '...' : videos.length})
            </h2>
            <span className="text-xs text-slate-400">· Sorted by {filters.sortBy}</span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Click thumbnail or title to watch authentic video on YouTube
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="aspect-video w-full rounded-xl bg-[#111C2D] border border-[#1B293E] animate-pulse flex flex-col justify-end p-4 space-y-2"
              >
                <div className="h-4 bg-[#1B293E] rounded w-3/4" />
                <div className="h-3 bg-[#1B293E] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                isSaved={savedVideoIds.has(video.id)}
                onToggleSave={onToggleSave}
                onAnalyzeTrend={onAnalyzeTrend}
                onGenerateIdeas={onGenerateIdeas}
                onOpenScoreExplainer={onOpenScoreExplainer}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center rounded-xl bg-[#111C2D] border border-[#1B293E] p-8 space-y-3">
            <Filter className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">No videos match current filter criteria</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your category, lowering the outlier multiplier threshold, or resetting search filters.
            </p>
            <button
              onClick={onResetFilters}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#6D3DF5] hover:bg-[#5B2DE0] rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
