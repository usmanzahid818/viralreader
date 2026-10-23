import React, { useState } from 'react';
import { Bookmark, BookmarkCheck, Trash2, Download, ExternalLink, Sparkles, Filter, FileSpreadsheet } from 'lucide-react';
import { VideoItem, TrendCluster } from '../../types';
import { VideoCard } from '../VideoCard';
import { StorageService } from '../../services/storageService';

interface SavedLibraryViewProps {
  videos: VideoItem[];
  savedVideoIds: Set<string>;
  onToggleSaveVideo: (videoId: string) => void;
  trendClusters: TrendCluster[];
  savedTrendIds: Set<string>;
  onToggleSaveTrend: (cluster: TrendCluster) => void;
  onAnalyzeTrend: (video: VideoItem) => void;
  onGenerateIdeas: (video: VideoItem) => void;
  onOpenScoreExplainer: () => void;
  initialTab?: 'videos' | 'trends';
}

export const SavedLibraryView: React.FC<SavedLibraryViewProps> = ({
  videos,
  savedVideoIds,
  onToggleSaveVideo,
  trendClusters,
  savedTrendIds,
  onToggleSaveTrend,
  onAnalyzeTrend,
  onGenerateIdeas,
  onOpenScoreExplainer,
  initialTab = 'videos',
}) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'trends'>(initialTab);

  const savedVideos = videos.filter((v) => savedVideoIds.has(v.id));
  const savedTrends = trendClusters.filter((c) => savedTrendIds.has(c.id));

  const handleExportCSV = () => {
    if (activeTab === 'videos') {
      const headers = ['Video ID', 'Title', 'Channel', 'Category', 'Format', 'Views', 'Views Per Hour', 'Outlier Multiplier', 'Viral Score', 'Original URL'];
      const rows = savedVideos.map((v) => [
        `"${v.id}"`,
        `"${v.title.replace(/"/g, '""')}"`,
        `"${v.channelTitle.replace(/"/g, '""')}"`,
        `"${v.category}"`,
        `"${v.format}"`,
        v.views,
        v.viewsPerHour,
        v.outlierScore,
        v.viralScore,
        `"${v.originalUrl}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ViralReader_Saved_Videos_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
    } else {
      const headers = ['Trend Cluster', 'Category', 'Status', 'Growth Rate', 'Avg Viral Score', 'Video Count'];
      const rows = savedTrends.map((t) => [
        `"${t.name.replace(/"/g, '""')}"`,
        `"${t.category}"`,
        `"${t.status}"`,
        `"${t.growthRate}%"`,
        t.avgViralScore,
        t.videoCount,
      ]);
      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ViralReader_Saved_Trends_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1B293E]/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Saved Intelligence Library
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6D3DF5]/20 text-[#8B5CF6] border border-[#6D3DF5]/30">
              LOCAL BROWSER STORAGE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Your personal collection of bookmarked viral benchmarks, high outliers, and emerging trend clusters.
          </p>
        </div>

        {((activeTab === 'videos' && savedVideos.length > 0) || (activeTab === 'trends' && savedTrends.length > 0)) && (
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2D] border border-[#1B293E] hover:border-[#6D3DF5]/50 text-xs text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export to CSV</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1B293E] pb-2">
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'videos'
              ? 'bg-[#6D3DF5] text-white shadow-md shadow-[#6D3DF5]/20'
              : 'text-slate-400 hover:text-white hover:bg-[#16243A]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Videos ({savedVideos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('trends')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'trends'
              ? 'bg-[#6D3DF5] text-white shadow-md shadow-[#6D3DF5]/20'
              : 'text-slate-400 hover:text-white hover:bg-[#16243A]'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>Saved Trends ({savedTrends.length})</span>
        </button>
      </div>

      {/* Persistence Transparency Banner */}
      <div className="p-3 rounded-lg bg-[#070D18] border border-[#1B293E] text-xs text-slate-400">
        Saved items are stored locally in this browser's persistent storage. Cloud synchronization across multiple creator devices will be unlocked with ViralReader Pro.
      </div>

      {/* Content */}
      {activeTab === 'videos' ? (
        savedVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                isSaved={true}
                onToggleSave={onToggleSaveVideo}
                onAnalyzeTrend={onAnalyzeTrend}
                onGenerateIdeas={onGenerateIdeas}
                onOpenScoreExplainer={onOpenScoreExplainer}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center rounded-xl bg-[#111C2D] border border-[#1B293E] p-8 space-y-3">
            <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-200">No saved videos yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click the bookmark icon on any trending video card across the dashboard to save it here for script research.
            </p>
          </div>
        )
      ) : savedTrends.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedTrends.map((cluster) => (
            <div
              key={cluster.id}
              className="p-4 rounded-xl bg-[#111C2D] border border-[#1B293E] hover:border-[#6D3DF5]/50 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800/40">
                    +{cluster.growthRate}% Growth
                  </span>
                  <button
                    onClick={() => onToggleSaveTrend(cluster)}
                    className="p-1 text-[#8B5CF6] hover:text-rose-400"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{cluster.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{cluster.summary}</p>
              </div>

              <div className="pt-2 border-t border-[#1B293E] flex items-center justify-between text-xs text-slate-400">
                <span>{cluster.category}</span>
                <span className="font-mono text-purple-300">{cluster.avgViralScore} Viral Score</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-xl bg-[#111C2D] border border-[#1B293E] p-8 space-y-3">
          <BookmarkCheck className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200">No saved trend clusters yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Browse the Trend Explorer and click the bookmark button to pin clusters to your dashboard.
          </p>
        </div>
      )}
    </div>
  );
};
