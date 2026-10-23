import React, { useState } from 'react';
import { Compass, Layers, TrendingUp, Sparkles, Bookmark, BookmarkCheck, ArrowRight, Flame } from 'lucide-react';
import { TrendCluster, VideoItem } from '../../types';
import { VideoCard } from '../VideoCard';

interface TrendExplorerViewProps {
  trendClusters: TrendCluster[];
  savedTrendIds: Set<string>;
  onToggleSaveTrend: (cluster: TrendCluster) => void;
  videos: VideoItem[];
  savedVideoIds: Set<string>;
  onToggleSaveVideo: (videoId: string) => void;
  onAnalyzeTrend: (video: VideoItem) => void;
  onGenerateIdeas: (video: VideoItem) => void;
  onOpenScoreExplainer: () => void;
}

export const TrendExplorerView: React.FC<TrendExplorerViewProps> = ({
  trendClusters,
  savedTrendIds,
  onToggleSaveTrend,
  videos,
  savedVideoIds,
  onToggleSaveVideo,
  onAnalyzeTrend,
  onGenerateIdeas,
  onOpenScoreExplainer,
}) => {
  const [selectedClusterId, setSelectedClusterId] = useState<string>(trendClusters[0]?.id || '');

  const selectedCluster = trendClusters.find((c) => c.id === selectedClusterId) || trendClusters[0];

  // Filter videos belonging to this cluster's category or keywords
  const clusterVideos = videos.filter(
    (v) =>
      v.category === selectedCluster.category ||
      selectedCluster.topKeywords.some((kw) => v.title.toLowerCase().includes(kw.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1B293E]/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Trend Cluster Explorer
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800/50">
              CLUSTER INTELLIGENCE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Identify macroscopic content movements, emerging narrative formats, and viral thematic clusters.
          </p>
        </div>
      </div>

      {/* Clusters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {trendClusters.map((cluster) => {
          const isSelected = selectedClusterId === cluster.id;
          const isSaved = savedTrendIds.has(cluster.id);
          return (
            <div
              key={cluster.id}
              onClick={() => setSelectedClusterId(cluster.id)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-[#16253D] to-[#111C2D] border-[#8B5CF6] shadow-xl shadow-purple-900/20'
                  : 'bg-[#111C2D] border-[#1B293E] hover:border-[#6D3DF5]/50 hover:bg-[#16243A]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      cluster.status === 'Emerging'
                        ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
                        : cluster.status === 'Peak'
                        ? 'bg-purple-950/50 text-purple-400 border border-purple-800/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {cluster.status} · +{cluster.growthRate}%
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSaveTrend(cluster);
                    }}
                    className={`p-1 rounded hover:bg-black/30 transition-colors ${
                      isSaved ? 'text-[#8B5CF6]' : 'text-slate-400 hover:text-white'
                    }`}
                    title={isSaved ? 'Saved to library' : 'Save trend'}
                  >
                    {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white mb-1.5 leading-snug">{cluster.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{cluster.summary}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#1B293E] flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono text-cyan-400 font-semibold">{cluster.videoCount} Videos</span>
                <span className="font-mono text-purple-300 font-semibold">{cluster.avgViralScore} Viral Score</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Cluster Deep-Dive */}
      {selectedCluster && (
        <div className="p-4 rounded-xl bg-[#0D1726] border border-[#1B293E] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1B293E]">
            <div>
              <div className="text-xs text-[#8B5CF6] font-semibold">{selectedCluster.category}</div>
              <h2 className="text-lg font-bold text-white">{selectedCluster.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Top Keyword Triggers:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedCluster.topKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-[#111C2D] border border-[#1B293E] text-slate-200 text-xs font-mono"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
              <span>Videos in this Trend Cluster ({clusterVideos.length})</span>
              <span>Sorted by Outlier Multiplier</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clusterVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isSaved={savedVideoIds.has(video.id)}
                  onToggleSave={onToggleSaveVideo}
                  onAnalyzeTrend={onAnalyzeTrend}
                  onGenerateIdeas={onGenerateIdeas}
                  onOpenScoreExplainer={onOpenScoreExplainer}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
