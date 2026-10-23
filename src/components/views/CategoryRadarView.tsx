import React from 'react';
import {
  Radio,
  Sparkles,
  TrendingUp,
  Layers,
  Video,
  Filter,
  RefreshCw,
  AlertTriangle,
  Globe,
  Info,
  Clock,
  Eye,
} from 'lucide-react';
import { CategoryName, MarketRegion, VideoItem } from '../../types';
import { VideoCard } from '../VideoCard';

interface CategoryRadarViewProps {
  category: CategoryName;
  categoryTitle: string;
  categoryDescription: string;
  videos: VideoItem[];
  savedVideoIds: Set<string>;
  loading?: boolean;
  isLiveApi?: boolean;
  error?: string | null;
  quotaWarning?: boolean;
  market?: MarketRegion;
  onMarketChange?: (market: MarketRegion) => void;
  onRetry?: () => void;
  onToggleSave: (videoId: string) => void;
  onAnalyzeTrend: (video: VideoItem) => void;
  onGenerateIdeas: (video: VideoItem) => void;
  onOpenScoreExplainer: () => void;
}

export const CategoryRadarView: React.FC<CategoryRadarViewProps> = ({
  category,
  categoryTitle,
  categoryDescription,
  videos,
  savedVideoIds,
  loading = false,
  isLiveApi = false,
  error = null,
  quotaWarning = false,
  market = 'Global',
  onMarketChange,
  onRetry,
  onToggleSave,
  onAnalyzeTrend,
  onGenerateIdeas,
  onOpenScoreExplainer,
}) => {
  // Filter videos that strictly belong to this category radar, or all if radar category is 'All'
  const categoryVideos =
    category === 'All'
      ? videos
      : videos.filter((v) => v.category === category);

  const totalViews = categoryVideos.reduce((acc, v) => acc + (v.views || 0), 0);
  const avgViralScore =
    categoryVideos.length > 0
      ? Math.round(categoryVideos.reduce((acc, v) => acc + (v.viralScore || 0), 0) / categoryVideos.length)
      : null;
  const avgOutlier =
    categoryVideos.length > 0
      ? (categoryVideos.reduce((acc, v) => acc + (v.outlierScore || 1), 0) / categoryVideos.length).toFixed(1)
      : null;
  const shortsCount = categoryVideos.filter((v) => v.format === 'Shorts').length;
  const longCount = categoryVideos.filter((v) => v.format === 'Long-Form').length;

  const formatViewCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return String(count);
  };

  return (
    <div className="space-y-6">
      {/* Title & Metadata Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1B293E]/60">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {categoryTitle}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6D3DF5]/20 text-[#8B5CF6] border border-[#6D3DF5]/30">
              RADAR ACTIVE
            </span>
            {isLiveApi ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/50">
                LIVE YOUTUBE API
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800/50">
                BENCHMARK DEMO
              </span>
            )}
            {market && market !== 'Global' && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/50">
                {market.toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{categoryDescription}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2D] border border-[#1B293E] hover:border-[#6D3DF5]/50 text-xs text-slate-300 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh live category feed"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#8B5CF6] ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          )}

          <button
            onClick={onOpenScoreExplainer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2D] border border-[#1B293E] hover:border-[#6D3DF5]/50 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Scores Explained</span>
          </button>
        </div>
      </div>

      {/* Quota warning banner */}
      {quotaWarning && (
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">YouTube Data API Quota Limit:</span> Today's official API quota (10,000 units/day) has been reached. Currently operating with curated benchmark intelligence.
          </div>
        </div>
      )}

      {/* Error alert banner */}
      {error && !quotaWarning && (
        <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-2.5 py-1 rounded bg-rose-900/40 hover:bg-rose-900/60 border border-rose-700/50 text-[11px] text-white transition-colors font-medium shrink-0"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Category Metric Strip - Accurate & Honest */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E]">
          <div className="text-xs text-slate-400">Total Monitored Views</div>
          {loading ? (
            <div className="h-6 w-24 bg-[#1B293E] animate-pulse rounded mt-1.5" />
          ) : (
            <div className="text-lg font-bold text-white font-mono mt-1">
              {categoryVideos.length > 0 ? formatViewCount(totalViews) : '0'}
            </div>
          )}
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
            {categoryVideos.length > 0 ? `${categoryVideos.length} videos aggregated` : 'No data in current filter'}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E]">
          <div className="text-xs text-slate-400">Category Avg Viral Score</div>
          {loading ? (
            <div className="h-6 w-20 bg-[#1B293E] animate-pulse rounded mt-1.5" />
          ) : (
            <div className="text-lg font-bold text-purple-400 font-mono mt-1">
              {avgViralScore !== null ? `${avgViralScore} / 100` : '—'}
            </div>
          )}
          <div className="text-[10px] text-slate-400 mt-0.5">Calculated heuristic index</div>
        </div>

        {/* Metric 3 */}
        <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E]">
          <div className="text-xs text-slate-400">Average Outlier Multiplier</div>
          {loading ? (
            <div className="h-6 w-20 bg-[#1B293E] animate-pulse rounded mt-1.5" />
          ) : (
            <div className="text-lg font-bold text-cyan-400 font-mono mt-1">
              {avgOutlier !== null ? `${avgOutlier}x Baseline` : '—'}
            </div>
          )}
          <div className="text-[10px] text-slate-400 mt-0.5">Channel baseline estimate</div>
        </div>

        {/* Metric 4 */}
        <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E]">
          <div className="text-xs text-slate-400">Active Formats</div>
          {loading ? (
            <div className="h-6 w-28 bg-[#1B293E] animate-pulse rounded mt-1.5" />
          ) : (
            <div className="text-sm font-bold text-slate-200 mt-1 truncate">
              {categoryVideos.length > 0
                ? `${shortsCount} Shorts · ${longCount} Long`
                : '—'}
            </div>
          )}
          <div className="text-[10px] text-slate-400 mt-0.5">Format distribution</div>
        </div>
      </div>

      {/* Videos in this category */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
          <span>
            {loading ? 'Fetching videos...' : `${categoryVideos.length} Videos tracked in this category`}
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            {isLiveApi ? 'Source: YouTube Data API v3' : 'Source: Benchmark Intelligence Demo'}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl bg-[#111C2D] border border-[#1B293E] overflow-hidden animate-pulse">
                <div className="aspect-video bg-[#1B293E]/60 w-full" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-[#1B293E] rounded w-5/6" />
                  <div className="h-3 bg-[#1B293E] rounded w-1/2" />
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1B293E]/40">
                    <div className="h-3 bg-[#1B293E] rounded" />
                    <div className="h-3 bg-[#1B293E] rounded" />
                    <div className="h-3 bg-[#1B293E] rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : categoryVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryVideos.map((video) => (
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
          <div className="py-16 text-center rounded-xl bg-[#111C2D] border border-[#1B293E] p-8 space-y-4">
            <Filter className="w-10 h-10 text-slate-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-200">
                No videos currently returned for {categoryTitle} in {market}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                YouTube's API did not return active videos for this combination. Try changing the country to "Global" or "United States", or tap Refresh below.
              </p>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6D3DF5] hover:bg-[#5B2FD9] text-xs font-semibold text-white shadow-lg shadow-[#6D3DF5]/20 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Category Query</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
