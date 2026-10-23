import React, { useState } from 'react';
import { FileText, Download, Printer, Share2, Check, BarChart2, TrendingUp, Sparkles, ShieldCheck } from 'lucide-react';
import { VideoItem, TrendCluster } from '../../types';

interface ReportsViewProps {
  videos: VideoItem[];
  trendClusters: TrendCluster[];
  onOpenScoreExplainer: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  videos,
  trendClusters,
  onOpenScoreExplainer,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  // Top 5 outliers
  const topOutliers = [...videos].sort((a, b) => b.outlierScore - a.outlierScore).slice(0, 5);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const content = `# VIRALREADER — YOUTUBE TREND INTELLIGENCE EXECUTIVE REPORT
Generated: ${reportDate}
Product: ViralReader (Discover Trends. Decode Virality.)

## 1. Executive Summary
This report analyzes active trend clusters, high-outlier breakout multipliers, and packaging velocity across ${videos.length} benchmarked YouTube videos.

## 2. Key High-Outlier Breakouts (Multiplier vs Channel Median)
${topOutliers
  .map(
    (v, i) =>
      `${i + 1}. **${v.title}**\n   - Channel: ${v.channelTitle} (${v.channelTier.toUpperCase()} tier)\n   - Outlier Score: ${v.outlierScore}x Median Baseline\n   - Viral Score: ${v.viralScore}/100\n   - Calculated Velocity: ${v.viewsPerHour.toLocaleString()} Views/Hour\n   - URL: ${v.originalUrl}\n`
  )
  .join('\n')}

## 3. Active Trend Clusters
${trendClusters
  .map(
    (c, i) =>
      `${i + 1}. **${c.name}** (${c.category})\n   - Growth Rate: +${c.growthRate}%\n   - Average Viral Score: ${c.avgViralScore}/100\n   - Video Density: ${c.videoCount} active uploads\n   - Strategic Summary: ${c.summary}\n`
  )
  .join('\n')}

## 4. Platform Integrity & Methodology Notes
- Outlier Scores are calculated strictly against channel median baselines.
- Views Per Hour is a calculated lifetime average unless historical polling snapshots are available.
- Public YouTube Data API v3 parameters do not expose confidential YouTube Studio retention curves.

---
ViralReader SaaS Intelligence Engine`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ViralReader_Trend_Intelligence_Report_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handleDownloadCSV = () => {
    const headers = [
      'Title',
      'Channel',
      'Format',
      'Category',
      'Market',
      'Views',
      'Likes',
      'Comments',
      'ViewsPerHour',
      'OutlierMultiplier',
      'ViralScore',
      'YouTubeURL',
      'PublishedAt',
    ];

    const rows = videos.map((v) => [
      `"${v.title.replace(/"/g, '""')}"`,
      `"${v.channelTitle.replace(/"/g, '""')}"`,
      v.format,
      `"${v.category}"`,
      `"${v.market}"`,
      v.views,
      v.likes,
      v.comments,
      v.viewsPerHour,
      v.outlierScore,
      v.viralScore,
      `"${v.originalUrl}"`,
      `"${v.publishedAt}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ViralReader_Trends_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1B293E]/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Trend Intelligence Reports
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/50">
              EXECUTIVE BRIEFING
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Structured analytical briefs synthesizing top outlier multipliers, packaging anomalies, and category movements.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2D] border border-[#1B293E] hover:border-slate-600 text-xs text-slate-300 hover:text-white transition-colors"
            title="Download CSV dataset of tracked videos"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2D] border border-[#1B293E] hover:border-slate-600 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#6D3DF5] hover:bg-[#5B2DE0] text-xs font-semibold text-white transition-colors shadow-sm"
          >
            {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Download className="w-3.5 h-3.5" />}
            <span>{downloaded ? 'Downloaded!' : 'Export Executive Brief (.md)'}</span>
          </button>
        </div>
      </div>

      {/* Report Document Shell */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0D1726] border border-[#1B293E] shadow-2xl space-y-6 text-sm">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1B293E]">
          <div>
            <div className="text-xs font-mono text-purple-400 uppercase tracking-widest font-bold">
              ViralReader Intelligence Dossier
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">Weekly YouTube Macro Trend Audit</h2>
            <div className="text-xs text-slate-400 mt-1">
              Sample Period: October 2026 · Target Markets: 12 Global Regions
            </div>
          </div>
          <div className="text-left sm:text-right text-xs text-slate-400 font-mono">
            <div>CONFIDENCE: 92%</div>
            <div>STATUS: PUBLISHED</div>
          </div>
        </div>

        {/* Section 1: Top Outliers Leaderboard */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />
            <span>Top Outlier Breakouts of the Week</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#1B293E] rounded-lg overflow-hidden">
              <thead className="bg-[#111C2D] text-slate-400 font-semibold border-b border-[#1B293E]">
                <tr>
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Video Title</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Outlier Score</th>
                  <th className="py-2.5 px-3 text-right">Viral Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B293E] bg-[#070D18]/70 text-slate-200">
                {topOutliers.map((v, i) => (
                  <tr key={v.id} className="hover:bg-[#16243A]/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-400">#{i + 1}</td>
                    <td className="py-2.5 px-3 font-medium max-w-xs truncate">{v.title}</td>
                    <td className="py-2.5 px-3 text-slate-400 truncate">{v.channelTitle}</td>
                    <td className="py-2.5 px-3 text-slate-400">{v.category}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-purple-400 text-right tabular-nums">
                      {v.outlierScore}x
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-400 text-right tabular-nums">
                      {v.viralScore}/100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Macro Trend Clusters */}
        <div className="space-y-3 pt-4 border-t border-[#1B293E]">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <span>Macro Trend Cluster Trajectory</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {trendClusters.map((cluster) => (
              <div key={cluster.id} className="p-3.5 rounded-lg bg-[#111C2D] border border-[#1B293E] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{cluster.name}</span>
                  <span className="font-mono text-emerald-400 font-semibold">+{cluster.growthRate}% 7d</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{cluster.summary}</p>
                <div className="text-[11px] text-purple-300 font-mono">
                  {cluster.videoCount} Videos · Category: {cluster.category}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Platform Integrity Disclaimer */}
        <div className="p-4 rounded-xl bg-[#070D18] border border-[#1B293E] text-xs text-slate-400 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-slate-200">Compliance &amp; Methodological Disclosures</div>
            <p className="leading-relaxed">
              This intelligence report is compiled from observable public YouTube metadata and calculated heuristics. Outlier scores are anchored against historical 10-video channel rolling baselines. Views per hour represents an explicit lifetime average in accordance with public API transparency guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
