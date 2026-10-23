import React from 'react';
import { X, HelpCircle, AlertCircle, BarChart3, TrendingUp, Zap } from 'lucide-react';

interface ScoreExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScoreExplainerModal: React.FC<ScoreExplainerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0D1726] border border-[#1B293E] rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1B293E] bg-[#111C2D]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#6D3DF5]/20 text-[#8B5CF6]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">ViralReader Metric Methodology</h2>
              <p className="text-xs text-slate-400">How Outlier Scores, Viral Scores, and Velocities are calculated</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm text-slate-300">
          {/* Outlier Score */}
          <div className="p-4 rounded-lg bg-[#111C2D] border border-[#1B293E]">
            <div className="flex items-center gap-2 mb-2 text-purple-400 font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>Outlier Score (Multiplier Baseline)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-2">
              The Outlier Score measures how many times higher a video’s view count is compared to that channel's median performance over their previous 10 uploads.
            </p>
            <div className="p-2.5 rounded bg-[#070D18] font-mono text-xs text-slate-400 border border-[#1B293E]">
              Outlier Score = Video Total Views / Channel 10-Video Median Views
            </div>
            <p className="text-xs text-slate-400 mt-2">
              • <strong>1.0x – 2.0x:</strong> Normal variance within core subscriber interest.<br />
              • <strong>3.0x – 5.0x:</strong> High outlier; algorithmic recommendations picked up the video outside subscribers.<br />
              • <strong>&gt; 5.0x:</strong> Extreme viral breakout; strong packaging and curiosity loop.
            </p>
          </div>

          {/* Viral Score */}
          <div className="p-4 rounded-lg bg-[#111C2D] border border-[#1B293E]">
            <div className="flex items-center gap-2 mb-2 text-cyan-400 font-semibold">
              <Zap className="w-4 h-4" />
              <span>Viral Score (Composite Index 0–100)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-2">
              A composite index evaluating current momentum, velocity, outlier multiplier, and public engagement density (likes and comments relative to views).
            </p>
            <div className="p-2.5 rounded bg-[#070D18] font-mono text-xs text-slate-400 border border-[#1B293E]">
              Viral Score = (Velocity Weight × 40%) + (Outlier Ratio × 35%) + (Engagement Density × 25%)
            </div>
          </div>

          {/* Views Per Hour */}
          <div className="p-4 rounded-lg bg-[#111C2D] border border-[#1B293E]">
            <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold">
              <BarChart3 className="w-4 h-4" />
              <span>Views Per Hour (Calculated Lifetime Average)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Public YouTube API endpoints provide total views and publication timestamp. In accordance with platform integrity rules, Views Per Hour is calculated as a <strong>lifetime average</strong> (Total Views ÷ Hours since published) unless historical hourly polling snapshots have been recorded.
            </p>
          </div>

          {/* Critical Disclaimer */}
          <div className="p-4 rounded-lg bg-[#16243A] border border-[#233852] text-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <AlertCircle className="w-4 h-4 text-cyan-400" />
              <span>Platform Integrity & Public API Boundaries</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              ViralReader never claims access to private YouTube Studio data (such as internal click-through rates, average percentage viewed retention graphs, or confidential audience demographics). All insights represent heuristic statistical modeling grounded in observable public metadata and AI strategic deconstruction.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1B293E] bg-[#111C2D] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-[#6D3DF5] hover:bg-[#5B2DE0] rounded-lg transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
