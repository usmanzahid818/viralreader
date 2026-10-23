import React, { useState } from 'react';
import { TrendingUp, Flame, Rocket, Info, Filter, ArrowUpRight } from 'lucide-react';
import { VideoItem } from '../../types';
import { VideoCard } from '../VideoCard';

interface OutlierDetectorViewProps {
  videos: VideoItem[];
  savedVideoIds: Set<string>;
  onToggleSave: (videoId: string) => void;
  onAnalyzeTrend: (video: VideoItem) => void;
  onGenerateIdeas: (video: VideoItem) => void;
  onOpenScoreExplainer: () => void;
  isSmallChannelMode?: boolean;
}

export const OutlierDetectorView: React.FC<OutlierDetectorViewProps> = ({
  videos,
  savedVideoIds,
  onToggleSave,
  onAnalyzeTrend,
  onGenerateIdeas,
  onOpenScoreExplainer,
  isSmallChannelMode = false,
}) => {
  const [minMultiplier, setMinMultiplier] = useState<number>(isSmallChannelMode ? 2.0 : 2.0);

  let filtered = videos.filter((v) => v.outlierScore >= minMultiplier);
  if (isSmallChannelMode) {
    filtered = filtered.filter((v) => v.channelTier === 'small');
  }

  // Sort by outlier score descending
  filtered.sort((a, b) => b.outlierScore - a.outlierScore);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1B293E]/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {isSmallChannelMode ? 'Small Channel Breakouts' : 'Outlier Detector'}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800/50">
              ALGORITHMIC HEURISTICS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {isSmallChannelMode
              ? 'Discover channels with under 50,000 subscribers capturing massive non-subscriber viewership.'
              : 'Identify videos that drastically exceeded their channel baseline median, proving exceptional packaging.'}
          </p>
        </div>

        <button
          onClick={onOpenScoreExplainer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2D] border border-[#1B293E] hover:border-[#6D3DF5]/50 text-xs text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          <Info className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span>How Outliers Are Measured</span>
        </button>
      </div>

      {/* Explainer Callout */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-[#16243A] to-[#10192A] border border-[#233852] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Rocket className="w-4 h-4 text-[#8B5CF6]" />
            <span>Why Outlier Multipliers Matter More Than Raw View Count</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            When a 1,000,000-subscriber channel gets 1,000,000 views, it's normal (1.0x). When a 20,000-subscriber channel gets 400,000 views (20.0x), it signals that YouTube’s recommendation algorithm tested and promoted the packaging to broader audiences.
          </p>
        </div>

        {/* Filter Slider */}
        <div className="p-3 rounded-lg bg-[#070D18] border border-[#1B293E] flex items-center gap-3 shrink-0">
          <span className="text-xs text-slate-400">Min Outlier:</span>
          <input
            type="range"
            min="2"
            max="12"
            step="0.5"
            value={minMultiplier}
            onChange={(e) => setMinMultiplier(parseFloat(e.target.value))}
            className="w-28 accent-[#6D3DF5] cursor-pointer"
          />
          <span className="font-mono font-bold text-purple-400 tabular-nums w-12 text-right">
            {minMultiplier}x+
          </span>
        </div>
      </div>

      {/* Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
          <span>Found {filtered.length} breakout outliers</span>
          <span>Baseline: 10-video channel rolling median</span>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((video) => (
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
            <Filter className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-200">No videos exceed {minMultiplier}x median</h3>
            <p className="text-xs text-slate-400">Try lowering the outlier slider to explore moderate breakouts.</p>
          </div>
        )}
      </div>
    </div>
  );
};
