import React, { useState, useEffect } from 'react';
import { X, Sparkles, TrendingUp, AlertCircle, Copy, Check, Lightbulb, ExternalLink, RefreshCw, Bookmark, BookmarkCheck } from 'lucide-react';
import { VideoItem, TrendAnalysisResult, ContentIdea } from '../types';
import { AIService } from '../services/aiService';
import { StorageService } from '../services/storageService';

interface TrendAnalysisModalProps {
  video: VideoItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenIdeasStudioWithIdea?: (idea: ContentIdea) => void;
}

export const TrendAnalysisModal: React.FC<TrendAnalysisModalProps> = ({
  video,
  isOpen,
  onClose,
  onOpenIdeasStudioWithIdea,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<TrendAnalysisResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedIdeaIndex, setSavedIdeaIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && video) {
      loadAnalysis();
    } else {
      setAnalysis(null);
    }
  }, [isOpen, video]);

  if (!isOpen || !video) return null;

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const res = await AIService.analyzeTrend(video);
      setAnalysis(res);
    } catch (err) {
      console.error('Failed to analyze trend:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHook = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveIdea = (ideaItem: any, idx: number) => {
    const fullIdea: ContentIdea = {
      id: `saved-idea-${Date.now()}-${idx}`,
      title: ideaItem.title,
      hook: ideaItem.hook,
      angle: 'Derived from Viral Outlier Analysis',
      outline: ideaItem.outline,
      format: ideaItem.format,
      duration: ideaItem.duration,
      estimatedOutlierPotential: 'High (3.5x+)',
      tags: [video.category, 'AI Analysis', 'High Outlier'],
      category: video.category,
      createdAt: new Date().toISOString(),
      isSaved: true,
    };
    StorageService.saveIdea(fullIdea);
    setSavedIdeaIndex(idx);
    setTimeout(() => setSavedIdeaIndex(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#0D1726] border border-[#1B293E] rounded-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1B293E] bg-[#111C2D]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#6D3DF5]/20 text-[#8B5CF6]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#6D3DF5]/20 text-[#8B5CF6] uppercase tracking-wider">
                  AI Trend Intelligence
                </span>
                <span className="text-xs text-slate-400">· Powered by Gemini 3.8 Flash</span>
              </div>
              <h2 className="text-base font-bold text-slate-100 truncate max-w-xl">{video.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadAnalysis}
              disabled={loading}
              className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800/60 transition-colors"
              title="Regenerate analysis"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm text-slate-200">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#8B5CF6] animate-spin" />
              <div className="text-slate-200 font-medium">Deconstructing Viral Anatomy...</div>
              <div className="text-xs text-slate-400 max-w-md">
                Analyzing hook duration, retention triggers, outlier comparison vs channel median, and generating 3 original content concepts.
              </div>
            </div>
          ) : analysis ? (
            <>
              {/* Quick Stat Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-[#111C2D] border border-[#1B293E]">
                  <div className="text-xs text-slate-400">Channel Baseline Outlier</div>
                  <div className="text-lg font-bold text-purple-400 tabular-nums">{video.outlierScore}x Median</div>
                </div>
                <div className="p-3 rounded-lg bg-[#111C2D] border border-[#1B293E]">
                  <div className="text-xs text-slate-400">Calculated Velocity</div>
                  <div className="text-lg font-bold text-cyan-400 tabular-nums">
                    {video.viewsPerHour.toLocaleString()} <span className="text-xs font-normal text-slate-400">VPH</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#111C2D] border border-[#1B293E]">
                  <div className="text-xs text-slate-400">Competition Saturation</div>
                  <div
                    className={`text-lg font-bold ${
                      analysis.competitionLevel === 'Low'
                        ? 'text-emerald-400'
                        : analysis.competitionLevel === 'Medium'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {analysis.competitionLevel}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#111C2D] border border-[#1B293E]">
                  <div className="text-xs text-slate-400">Confidence Rating</div>
                  <div className="text-lg font-bold text-slate-200 tabular-nums">{analysis.confidenceScore}%</div>
                </div>
              </div>

              {/* Trend Summary */}
              <div className="p-4 rounded-lg bg-[#111C2D] border border-[#1B293E]">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Strategic Executive Summary</span>
                </h3>
                <p className="text-slate-200 leading-relaxed text-sm">{analysis.summary}</p>
                <div className="mt-2 text-xs text-slate-400">
                  Competition Analysis: {analysis.competitionRationale}
                </div>
              </div>

              {/* Supporting Evidence & Hypotheses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#111C2D] border border-[#1B293E]">
                  <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">
                    Observable Evidence (Public Metrics)
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {analysis.supportingEvidence.map((ev, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5">·</span>
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-[#111C2D] border border-[#1B293E]">
                  <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">
                    Hypotheses: Why This Is Working
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {analysis.hypotheses.map((hyp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">·</span>
                        <span>{hyp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Key Formatting Patterns */}
              <div className="p-4 rounded-lg bg-[#111C2D] border border-[#1B293E]">
                <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2.5">
                  Format Patterns &amp; Retention Architecture
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
                  {analysis.formatPatterns.map((pat, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-[#070D18] border border-[#1B293E] flex items-start gap-2">
                      <span className="text-amber-400 font-bold">{idx + 1}.</span>
                      <span>{pat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 Original Content Ideas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-[#8B5CF6]" />
                    <span>3 Actionable Content Ideas You Can Create Next</span>
                  </h3>
                  <span className="text-xs text-slate-400">Tailored to your channel format</span>
                </div>

                <div className="space-y-3">
                  {analysis.contentIdeas.map((idea, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-[#111C2D] border border-[#1B293E] hover:border-[#6D3DF5]/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#6D3DF5]/20 text-[#8B5CF6]">
                              {idea.format} · {idea.duration}
                            </span>
                            <span className="text-xs text-slate-400">Idea #{idx + 1}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-100">{idea.title}</h4>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleCopyHook(idea.hook, idx)}
                            className="p-1.5 text-xs text-slate-400 hover:text-slate-100 rounded bg-[#070D18] border border-[#1B293E] hover:bg-[#16243A] transition-colors flex items-center gap-1"
                            title="Copy opening hook"
                          >
                            {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>Hook</span>
                          </button>
                          <button
                            onClick={() => handleSaveIdea(idea, idx)}
                            className="p-1.5 text-xs text-slate-400 hover:text-slate-100 rounded bg-[#070D18] border border-[#1B293E] hover:bg-[#16243A] transition-colors flex items-center gap-1"
                            title="Save to Ideas Studio"
                          >
                            {savedIdeaIndex === idx ? (
                              <BookmarkCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
                            ) : (
                              <Bookmark className="w-3.5 h-3.5" />
                            )}
                            <span>Save</span>
                          </button>
                        </div>
                      </div>

                      {/* Hook Quote */}
                      <div className="p-2.5 rounded bg-[#070D18] border border-[#1B293E] text-xs text-slate-300 italic mb-2.5">
                        <span className="text-purple-400 font-semibold not-italic">Hook: </span>
                        "{idea.hook}"
                      </div>

                      {/* Outline */}
                      <div className="text-xs text-slate-400">
                        <span className="font-semibold text-slate-300">Outline: </span>
                        {idea.outline.join(' → ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Limitations & Confidence Disclaimer */}
              <div className="p-3 rounded-lg bg-[#070D18] border border-[#1B293E] text-xs text-slate-400 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-300">Methodology Limitations: </span>
                  {analysis.confidenceLimitations}
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400">Unable to load trend analysis. Please try again.</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#1B293E] bg-[#111C2D] flex items-center justify-between">
          <a
            href={video.originalUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
          >
            <span>Open Original YouTube Video</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#6D3DF5] hover:bg-[#5B2DE0] rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
