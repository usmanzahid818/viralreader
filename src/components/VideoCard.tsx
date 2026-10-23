import React, { useState } from 'react';
import {
  Play,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  ExternalLink,
  Flame,
  TrendingUp,
  HelpCircle,
  Clock,
  Eye,
  ThumbsUp,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { VideoItem } from '../types';

interface VideoCardProps {
  video: VideoItem;
  isSaved: boolean;
  onToggleSave: (videoId: string) => void;
  onAnalyzeTrend: (video: VideoItem) => void;
  onGenerateIdeas: (video: VideoItem) => void;
  onOpenScoreExplainer: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  isSaved,
  onToggleSave,
  onAnalyzeTrend,
  onGenerateIdeas,
  onOpenScoreExplainer,
}) => {
  const [imageError, setImageError] = useState(false);

  const formatMetric = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) return 'Unavailable';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <div className="group relative flex flex-col bg-[#111C2D] border border-[#1B293E] hover:border-[#6D3DF5]/60 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-xl hover:shadow-black/40">
      {/* Thumbnail Area */}
      <div className="relative aspect-video w-full bg-[#0A1220] overflow-hidden">
        {!imageError && video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#0F1A2E] to-[#0A1220] text-center">
            <Play className="w-8 h-8 text-[#6D3DF5] mb-2 opacity-80" />
            <span className="text-xs font-semibold text-slate-300 line-clamp-1">{video.title}</span>
            <span className="text-[10px] text-slate-500 mt-1">{video.category}</span>
          </div>
        )}

        {/* Top Badges Over Thumbnail */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase shadow-md ${
                video.format === 'Shorts'
                  ? 'bg-rose-500 text-white'
                  : 'bg-[#6D3DF5] text-white'
              }`}
            >
              {video.format}
            </span>
            {video.trendStatus === 'Exploding' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md">
                <Flame className="w-3 h-3 fill-slate-950" />
                <span>EXPLODING</span>
              </span>
            )}
          </div>

          {/* Outlier Badge */}
          <div
            className="pointer-events-auto cursor-pointer px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#0D1726]/90 border border-purple-500/50 text-purple-300 flex items-center gap-1 shadow-md hover:bg-[#16243A] transition-colors"
            onClick={onOpenScoreExplainer}
            title="Outlier multiplier vs channel 10-video median"
          >
            <TrendingUp className="w-3 h-3 text-[#8B5CF6]" />
            <span>{video.outlierScore}x Median</span>
          </div>
        </div>

        {/* Duration badge bottom right */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[10px] font-medium text-slate-200">
          {video.duration}
        </div>

        {/* Quick Save button top right on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(video.id);
          }}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg border backdrop-blur-md transition-colors ${
            isSaved
              ? 'bg-[#6D3DF5] border-[#8B5CF6] text-white'
              : 'bg-black/60 border-white/10 text-slate-300 hover:text-white hover:bg-black/80'
          }`}
          title={isSaved ? 'Remove from Saved' : 'Save Video'}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      {/* Card Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
        {/* Title & Channel */}
        <div>
          <a
            href={video.originalUrl}
            target="_blank"
            rel="noreferrer"
            className="block text-sm font-semibold text-slate-100 hover:text-[#8B5CF6] line-clamp-2 leading-snug transition-colors mb-2"
            title={video.title}
          >
            {video.title}
          </a>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2 truncate">
              <img
                src={video.channelAvatar}
                alt={video.channelTitle}
                className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-700"
              />
              <span className="truncate text-slate-300 hover:text-white transition-colors">
                {video.channelTitle}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 shrink-0 font-mono">{video.relativeTime}</span>
          </div>
        </div>

        {/* Core Analytics Row */}
        <div className="pt-2.5 border-t border-[#1B293E] grid grid-cols-3 gap-2 text-center text-xs">
          {/* Views */}
          <div className="flex flex-col items-center justify-center p-1.5 rounded bg-[#070D18]/70 border border-[#1B293E]/50">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
              <Eye className="w-3 h-3 text-slate-400" />
              <span>Views</span>
            </div>
            <span className="font-mono font-bold text-slate-200 tabular-nums">
              {formatMetric(video.views)}
            </span>
          </div>

          {/* Velocity VPH (Calculated) */}
          <div className="flex flex-col items-center justify-center p-1.5 rounded bg-[#070D18]/70 border border-[#1B293E]/50">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>VPH (Avg)</span>
            </div>
            <span className="font-mono font-bold text-cyan-400 tabular-nums">
              {formatMetric(video.viewsPerHour)}
            </span>
          </div>

          {/* Viral Score */}
          <div
            className="flex flex-col items-center justify-center p-1.5 rounded bg-[#070D18]/70 border border-[#1B293E]/50 cursor-pointer hover:bg-[#16243A] transition-colors"
            onClick={onOpenScoreExplainer}
            title="Composite viral momentum score (0-100)"
          >
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
              <Zap className="w-3 h-3 text-purple-400" />
              <span>Viral</span>
            </div>
            <span className="font-mono font-bold text-purple-300 tabular-nums">
              {video.viralScore}/100
            </span>
          </div>
        </div>

        {/* Secondary Engagement stats (Likes, comments, category) */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1" title="Real YouTube Like Count">
              <ThumbsUp className="w-3 h-3 text-slate-400" />
              <span className="font-mono">{formatMetric(video.likes)}</span>
            </span>
            <span className="flex items-center gap-1" title="Real YouTube Comment Count">
              <MessageSquare className="w-3 h-3 text-slate-400" />
              <span className="font-mono">{formatMetric(video.comments)}</span>
            </span>
          </div>
          <span className="truncate max-w-[110px] text-slate-400 text-right">{video.category}</span>
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-2 border-t border-[#1B293E] grid grid-cols-2 gap-2">
          <button
            onClick={() => onAnalyzeTrend(video)}
            className="px-2.5 py-1.5 text-xs font-medium text-white bg-[#6D3DF5] hover:bg-[#5B2DE0] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analyze Trend</span>
          </button>

          <button
            onClick={() => onGenerateIdeas(video)}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-[#0D1726] hover:bg-[#1B293E] border border-[#1B293E] rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Ideas Studio</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
