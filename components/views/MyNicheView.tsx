import React, { useState } from 'react';
import { Target, Plus, X, Save, Sparkles, TrendingUp, Check } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { VideoItem } from '../../types';
import { VideoCard } from '../VideoCard';

interface MyNicheViewProps {
  videos: VideoItem[];
  savedVideoIds: Set<string>;
  onToggleSaveVideo: (videoId: string) => void;
  onAnalyzeTrend: (video: VideoItem) => void;
  onGenerateIdeas: (video: VideoItem) => void;
  onOpenScoreExplainer: () => void;
}

export const MyNicheView: React.FC<MyNicheViewProps> = ({
  videos,
  savedVideoIds,
  onToggleSaveVideo,
  onAnalyzeTrend,
  onGenerateIdeas,
  onOpenScoreExplainer,
}) => {
  const [nicheData, setNicheData] = useState(() => StorageService.getUserNiche());
  const [newKeyword, setNewKeyword] = useState('');
  const [newCompetitor, setNewCompetitor] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !nicheData.keywords.includes(newKeyword.trim())) {
      setNicheData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim().toLowerCase()],
      }));
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setNicheData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== kw),
    }));
  };

  const handleAddCompetitor = () => {
    if (newCompetitor.trim() && !nicheData.competitors.includes(newCompetitor.trim())) {
      setNicheData((prev) => ({
        ...prev,
        competitors: [...prev.competitors, newCompetitor.trim()],
      }));
      setNewCompetitor('');
    }
  };

  const handleRemoveCompetitor = (comp: string) => {
    setNicheData((prev) => ({
      ...prev,
      competitors: prev.competitors.filter((c) => c !== comp),
    }));
  };

  const handleSave = () => {
    StorageService.saveUserNiche(nicheData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Filter videos that match user's custom niche or keywords
  const matchedVideos = videos.filter(
    (v) =>
      v.category.toLowerCase().includes(nicheData.primaryNiche.toLowerCase()) ||
      nicheData.keywords.some((kw) => v.title.toLowerCase().includes(kw) || v.tags.some((t) => t.toLowerCase().includes(kw))) ||
      nicheData.competitors.some((c) => v.channelTitle.toLowerCase().includes(c.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1B293E]/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              My Niche &amp; Competitor Radar
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6D3DF5]/20 text-[#8B5CF6] border border-[#6D3DF5]/30">
              CUSTOM TARGETING
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Personalize your trend discovery feed by anchoring your primary channel category, keywords, and peer channels.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6D3DF5] hover:bg-[#5B2DE0] text-xs font-semibold text-white transition-colors self-start sm:self-auto shadow-sm"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Preferences Saved!' : 'Save Niche Radar'}</span>
        </button>
      </div>

      {/* Configuration Card */}
      <div className="p-4 rounded-xl bg-[#111C2D] border border-[#1B293E] space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Primary Niche */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Primary Content Focus</label>
            <input
              type="text"
              value={nicheData.primaryNiche}
              onChange={(e) => setNicheData({ ...nicheData, primaryNiche: e.target.value })}
              className="w-full px-3 py-2 bg-[#070D18] border border-[#1B293E] focus:border-[#6D3DF5] rounded-lg text-slate-100 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">Your core YouTube channel category or format angle.</p>
          </div>

          {/* Keywords */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Tracked Keywords / Topics</label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                placeholder="Add keyword..."
                className="w-full px-3 py-2 bg-[#070D18] border border-[#1B293E] focus:border-[#6D3DF5] rounded-lg text-slate-100 focus:outline-none"
              />
              <button
                onClick={handleAddKeyword}
                className="p-2 rounded-lg bg-[#070D18] hover:bg-[#16243A] border border-[#1B293E] text-slate-300"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {nicheData.keywords.map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-0.5 rounded bg-[#070D18] border border-[#1B293E] text-slate-300 flex items-center gap-1 font-mono text-[11px]"
                >
                  <span>#{kw}</span>
                  <button onClick={() => handleRemoveKeyword(kw)} className="hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Competitors */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Peer Channels &amp; Benchmarks</label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCompetitor()}
                placeholder="Channel name..."
                className="w-full px-3 py-2 bg-[#070D18] border border-[#1B293E] focus:border-[#6D3DF5] rounded-lg text-slate-100 focus:outline-none"
              />
              <button
                onClick={handleAddCompetitor}
                className="p-2 rounded-lg bg-[#070D18] hover:bg-[#16243A] border border-[#1B293E] text-slate-300"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {nicheData.competitors.map((comp) => (
                <span
                  key={comp}
                  className="px-2 py-0.5 rounded bg-[#070D18] border border-[#1B293E] text-purple-300 flex items-center gap-1 text-[11px]"
                >
                  <span>{comp}</span>
                  <button onClick={() => handleRemoveCompetitor(comp)} className="hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Matched Feed */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
          <span>{matchedVideos.length} Videos matching your custom niche parameters</span>
          <span>Ranked by Viral Momentum</span>
        </div>

        {matchedVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchedVideos.map((video) => (
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
        ) : (
          <div className="py-16 text-center rounded-xl bg-[#111C2D] border border-[#1B293E] p-8 space-y-3">
            <Target className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-200">No videos currently match these niche tags</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add broader keywords like "tech", "vlogs", "drama", or "coding" to expand your custom feed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
