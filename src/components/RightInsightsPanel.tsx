import React from 'react';
import {
  TrendingUp,
  Sparkles,
  Zap,
  ArrowUpRight,
  ShieldAlert,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { TrendCluster, ContentIdea } from '../types';

interface RightInsightsPanelProps {
  trendClusters: TrendCluster[];
  dailyIdeas: ContentIdea[];
  onSelectCluster: (cluster: TrendCluster) => void;
  onOpenIdeaInStudio: (idea: ContentIdea) => void;
  onOpenScoreExplainer: () => void;
  onOpenPricing: () => void;
}

export const RightInsightsPanel: React.FC<RightInsightsPanelProps> = ({
  trendClusters,
  dailyIdeas,
  onSelectCluster,
  onOpenIdeaInStudio,
  onOpenScoreExplainer,
  onOpenPricing,
}) => {
  return (
    <aside className="w-80 shrink-0 hidden xl:flex flex-col gap-4 p-4 border-l border-[#1B293E] bg-[#0D1726] overflow-y-auto max-h-[calc(100vh-64px)]">
      {/* Live Breakout Signal Card */}
      <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#16253D] to-[#101A2B] border border-[#233852] relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>BREAKOUT RADAR</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-slate-300 border border-white/5">
            10 MIN AGO
          </span>
        </div>
        <h4 className="text-xs font-bold text-slate-100 mb-1 leading-snug">
          Small Channel Breakout: +14.6x Median Views
        </h4>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
          "Solo Builder Nomad" (18k subs) captured 412k views in 24h with a cold-open SaaS dashboard hook.
        </p>
        <button
          onClick={onOpenScoreExplainer}
          className="text-xs font-medium text-[#8B5CF6] hover:text-[#A78BFA] flex items-center gap-1 transition-colors"
        >
          <span>Deconstruct this Outlier</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Trending Topics & Clusters */}
      <div className="p-4 rounded-xl bg-[#111C2D] border border-[#1B293E]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Trending Topic Clusters</span>
          </h3>
          <span className="text-[11px] font-mono text-cyan-400">7D Growth</span>
        </div>

        <div className="space-y-2.5">
          {trendClusters.slice(0, 4).map((cluster) => (
            <div
              key={cluster.id}
              onClick={() => onSelectCluster(cluster)}
              className="p-2.5 rounded-lg bg-[#070D18] hover:bg-[#16243A] border border-[#1B293E] hover:border-[#6D3DF5]/50 cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-1">
                  {cluster.name}
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-400 shrink-0">
                  +{cluster.growthRate}%
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>{cluster.category}</span>
                <span className="font-mono text-purple-300">{cluster.avgViralScore} Viral Score</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Daily Video Recommendations */}
      <div className="p-4 rounded-xl bg-[#111C2D] border border-[#1B293E]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>AI Content Blueprint</span>
          </h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#6D3DF5]/20 text-[#8B5CF6] font-semibold">
            HOT
          </span>
        </div>

        {dailyIdeas[0] && (
          <div className="p-3 rounded-lg bg-[#070D18] border border-[#1B293E] space-y-2.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                {dailyIdeas[0].format} · {dailyIdeas[0].duration}
              </span>
              <span className="text-purple-400 font-mono font-semibold">{dailyIdeas[0].estimatedOutlierPotential}</span>
            </div>
            <h4 className="text-xs font-bold text-slate-100 leading-snug">{dailyIdeas[0].title}</h4>
            <div className="text-[11px] text-slate-300 italic p-2 rounded bg-[#0D1726] border border-[#1B293E]">
              "{dailyIdeas[0].hook}"
            </div>
            <button
              onClick={() => onOpenIdeaInStudio(dailyIdeas[0])}
              className="w-full py-1.5 px-3 text-xs font-semibold text-white bg-[#6D3DF5] hover:bg-[#5B2DE0] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Build in Ideas Studio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Subscription Callout */}
      <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <Zap className="w-4 h-4 text-[#8B5CF6]" />
            <span>ViralReader Pro</span>
          </div>
          <span className="text-[10px] text-amber-400 font-medium">Merchant Approval</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Unlock unlimited AI trend analyses, multi-channel competitor alerts, and high-velocity webhook integrations.
        </p>
        <button
          onClick={onOpenPricing}
          className="w-full py-1.5 px-3 text-xs font-medium text-slate-300 hover:text-white bg-[#070D18] hover:bg-[#16243A] border border-[#1B293E] rounded-lg transition-colors text-center"
        >
          View Pricing &amp; Plans
        </button>
      </div>

      {/* Public Data Disclaimer */}
      <div className="p-3 rounded-xl bg-[#070D18] border border-[#1B293E] text-[10px] text-slate-500 leading-relaxed space-y-1">
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          <span>Data Integrity Protocol</span>
        </div>
        <p>
          Metrics reflect public YouTube metadata and calculated heuristics. In accordance with platform terms, lifetime averages and baseline comparisons are clearly marked.
        </p>
      </div>
    </aside>
  );
};
