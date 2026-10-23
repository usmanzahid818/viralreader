import React, { useState } from 'react';
import { Globe, MapPin, TrendingUp, Sparkles, ArrowRight, ShieldAlert, RefreshCw, AlertTriangle } from 'lucide-react';
import { MarketRegion, VideoItem } from '../../types';
import { VideoCard } from '../VideoCard';

interface CountryExplorerViewProps {
  currentMarket: MarketRegion;
  onSelectMarket: (market: MarketRegion) => void;
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

const REGIONAL_PROFILES: {
  market: MarketRegion;
  flag: string;
  topGenres: string[];
  growthInsight: string;
  avgEngagement: string;
}[] = [
  {
    market: 'Pakistan',
    flag: '🇵🇰',
    topGenres: ['Prime Time Drama Twists', 'Street Food Crawls', 'Coke Studio Fusion', 'Tech Freelancing'],
    growthInsight: 'Fast-paced episodic drama breakdowns surging within 2 hours of television broadcast.',
    avgEngagement: '9.2% Like-to-View',
  },
  {
    market: 'India',
    flag: '🇮🇳',
    topGenres: ['Cricket World Cup Tactics', 'Coding Interview Breakouts', 'FinTech & IPOs', 'Satirical Skits'],
    growthInsight: 'High demand for system design and engineering salary negotiation transparency.',
    avgEngagement: '8.8% Like-to-View',
  },
  {
    market: 'United States',
    flag: '🇺🇸',
    topGenres: ['AI Autonomous Agents', 'Solo SaaS Agencies', 'Extreme Comparisons ($1 vs $1M)', 'Optics/Tech'],
    growthInsight: '100-second rapid-fire AI tool summaries displacing traditional 20-minute tutorials.',
    avgEngagement: '6.4% Like-to-View',
  },
  {
    market: 'United Kingdom',
    flag: '🇬🇧',
    topGenres: ['Semiconductor Macro News', 'Automotive Engineering', 'Podcasts', 'Soccer/Football Tactics'],
    growthInsight: 'Investigative long-form essays (15-25m) retaining over 52% average percentage viewed.',
    avgEngagement: '7.1% Like-to-View',
  },
  {
    market: 'UAE',
    flag: '🇦🇪',
    topGenres: ['Luxury Real Estate Tours', 'Expat Business Relocation', 'Automotive Supercars', 'Travel'],
    growthInsight: 'Bilingual (Arabic/English) lifestyle and wealth creation formats dominating algorithms.',
    avgEngagement: '7.8% Like-to-View',
  },
  {
    market: 'South Korea',
    flag: '🇰🇷',
    topGenres: ['Clinical Dermatologist Reviews', 'K-Pop Behind-The-Scenes', 'ASMR Study Vlogs', 'Gaming'],
    growthInsight: 'Scientific micro-camera zoom breakdowns exposing skincare marketing exaggerations.',
    avgEngagement: '11.4% Like-to-View',
  },
  {
    market: 'Saudi Arabia',
    flag: '🇸🇦',
    topGenres: ['Mega-Project Architecture', 'Tech & Gaming', 'Culinary Expeditions', 'Podcasts'],
    growthInsight: 'Rapid growth in Saudi Vision 2030 documentary animations and gaming tournament streams.',
    avgEngagement: '8.5% Like-to-View',
  },
  {
    market: 'Canada',
    flag: '🇨🇦',
    topGenres: ['Immigration & Career Hacks', 'Wilderness Tiny Homes', 'Tech Reviews', 'Personal Finance'],
    growthInsight: 'Real cost-of-living breakdowns with verified spreadsheet templates.',
    avgEngagement: '6.9% Like-to-View',
  },
];

export const CountryExplorerView: React.FC<CountryExplorerViewProps> = ({
  currentMarket,
  onSelectMarket,
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
  const [activeTab, setActiveTab] = useState<MarketRegion>(
    currentMarket === 'Global' ? 'Pakistan' : currentMarket
  );

  React.useEffect(() => {
    if (currentMarket !== 'Global') {
      setActiveTab(currentMarket);
    }
  }, [currentMarket]);

  const marketVideos =
    currentMarket === activeTab
      ? videos
      : videos.filter((v) => v.market === activeTab || v.market === 'Global');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1B293E]/60">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Country &amp; Regional Explorer
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/50">
              DISCOVERY FILTER
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
            Compare YouTube trends, dominant genres, and breakout formats across international markets.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2D] border border-[#1B293E] hover:border-[#6D3DF5]/50 text-xs text-slate-300 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh live market feed"
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

      {/* Market Selector Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {REGIONAL_PROFILES.map((p) => {
          const isSelected = activeTab === p.market;
          return (
            <button
              key={p.market}
              onClick={() => {
                setActiveTab(p.market);
                onSelectMarket(p.market);
              }}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#6D3DF5] border-[#8B5CF6] text-white shadow-lg shadow-[#6D3DF5]/30'
                  : 'bg-[#111C2D] border-[#1B293E] text-slate-300 hover:text-white hover:bg-[#16243A]'
              }`}
            >
              <span>{p.flag}</span>
              <span>{p.market}</span>
            </button>
          );
        })}
      </div>

      {/* Active Market Profile Card */}
      {(() => {
        const profile = REGIONAL_PROFILES.find((p) => p.market === activeTab) || REGIONAL_PROFILES[0];
        return (
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#16243A] to-[#0D1726] border border-[#233852] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{profile.flag}</span>
                <div>
                  <h3 className="text-base font-bold text-white">{profile.market} YouTube Market Intelligence</h3>
                  <div className="text-xs text-purple-300">Audience Engagement Index: {profile.avgEngagement}</div>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-mono px-2.5 py-1 rounded bg-[#070D18] border border-[#1B293E] self-start sm:self-auto">
                {marketVideos.length} Sample Outliers Tracked
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-cyan-400 font-semibold">Growth Insight: </strong>
              {profile.growthInsight}
            </p>

            <div className="pt-2 border-t border-[#1B293E] flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400">Top Trending Formats in {profile.market}:</span>
              {profile.topGenres.map((g, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-[#070D18] border border-[#1B293E] text-slate-300 font-medium text-[11px]"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Transparency Note */}
      <div className="p-3 rounded-lg bg-[#070D18] border border-[#1B293E] text-xs text-slate-400 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">Market Filter Clarification: </span>
          The market filter targets discovery criteria and regional publication trends. Public API metadata does not prove where individual viewers reside unless an authorized channel analytics grant is provided.
        </div>
      </div>

      {/* Videos matching this market */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
          <span>{loading ? `Loading trends in ${activeTab}...` : `Trending in ${activeTab} & Global (${marketVideos.length} Videos)`}</span>
          <span>Ranked by Velocity</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl bg-[#111C2D] border border-[#1B293E] p-4 animate-pulse space-y-3">
                <div className="aspect-video bg-slate-800/50 rounded-lg w-full"></div>
                <div className="h-4 bg-slate-800/60 rounded w-3/4"></div>
                <div className="h-3 bg-slate-800/40 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : marketVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketVideos.map((video) => (
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
            <Globe className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-200">No videos loaded for {activeTab} yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click Refresh above to query live trending YouTube content in this region.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
