import React from 'react';
import { Smartphone, Zap, Flame, Clock, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { VideoItem } from '../../types';
import { VideoCard } from '../VideoCard';

interface ShortsViewProps {
  videos: VideoItem[];
  savedVideoIds: Set<string>;
  loading?: boolean;
  isLiveApi?: boolean;
  quotaWarning?: boolean;
  onRetry?: () => void;
  onToggleSave: (videoId: string) => void;
  onAnalyzeTrend: (video: VideoItem) => void;
  onGenerateIdeas: (video: VideoItem) => void;
  onOpenScoreExplainer: () => void;
}

export const ShortsView: React.FC<ShortsViewProps> = ({
  videos,
  savedVideoIds,
  loading = false,
  isLiveApi = false,
  quotaWarning = false,
  onRetry,
  onToggleSave,
  onAnalyzeTrend,
  onGenerateIdeas,
  onOpenScoreExplainer,
}) => {
  const shorts = videos.filter((v) => v.format === 'Shorts' || (v.durationSeconds > 0 && v.durationSeconds <= 60));
  shorts.sort((a, b) => b.viewsPerHour - a.viewsPerHour);

  const avgDuration =
    shorts.length > 0
      ? `${(shorts.reduce((acc, v) => acc + (v.durationSeconds || 45), 0) / shorts.length).toFixed(0)}s`
      : '45s';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1B293E]/60">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              YouTube Shorts Radar
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-800/50">
              VERTICAL 9:16
            </span>
            {isLiveApi ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/50">
                LIVE YOUTUBE API
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800/50">
                BENCHMARK DATA
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time viral Shorts intelligence, 3-second hook structures, and seamless loop mechanics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2D] border border-[#1B293E] hover:border-[#6D3DF5]/50 text-xs text-slate-300 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh live Shorts feed"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#8B5CF6] ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          )}

          <button
            onClick={onOpenScoreExplainer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2D] border border-[#1B293E] hover:border-[#6D3DF5]/50 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <span>Scores Explained</span>
          </button>
        </div>
      </div>

      {/* Quota warning */}
      {quotaWarning && (
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">YouTube Data API Quota Limit:</span> Today's official API quota (10,000 units/day) has been reached. Currently operating with curated benchmark intelligence.
          </div>
        </div>
      )}

      {/* Shorts Metric Insight Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E]">
          <div className="text-xs text-slate-400">Average Duration of Tracked Shorts</div>
          <div className="text-xl font-bold text-white font-mono mt-1">{avgDuration}</div>
          <div className="text-[10px] text-purple-400 mt-0.5">Optimal retention window</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E]">
          <div className="text-xs text-slate-400">Primary Hook Technique</div>
          <div className="text-xl font-bold text-cyan-400 mt-1">High-Tension Visual Hook</div>
          <div className="text-[10px] text-slate-400 mt-0.5">&lt; 2.5s time to curiosity loop</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E]">
          <div className="text-xs text-slate-400">Pacing Benchmark (Heuristic)</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">High Velocity</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Rapid frame changes &lt; 3.0s</div>
        </div>
      </div>

      {/* Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
          <span>{loading ? 'Discovering vertical Shorts...' : `${shorts.length} Vertical Shorts analyzed`}</span>
          <span>Ranked by Velocity (Views / Hour)</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl bg-[#111C2D] border border-[#1B293E] p-4 animate-pulse space-y-3">
                <div className="aspect-[9/16] max-h-72 bg-slate-800/50 rounded-lg mx-auto w-3/4"></div>
                <div className="h-4 bg-slate-800/60 rounded w-3/4"></div>
                <div className="h-3 bg-slate-800/40 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : shorts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shorts.map((video) => (
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
            <Smartphone className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-200">No vertical Shorts in current active query</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Current video query did not return 60-second shorts. Click Refresh above or select a different country.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
