import React, { useState } from 'react';
import {
  Sparkles,
  Smartphone,
  Tv,
  Download,
  Copy,
  Check,
  Bookmark,
  RefreshCw,
  Eye,
  Sliders,
  Type,
  Layers,
  Palette,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { VideoItem, ThumbnailProject } from '../../types';
import { AIService } from '../../services/aiService';

interface ThumbnailStudioViewProps {
  videos: VideoItem[];
  onOpenScoreExplainer: () => void;
}

export const ThumbnailStudioView: React.FC<ThumbnailStudioViewProps> = ({ videos, onOpenScoreExplainer }) => {
  const [videoTitle, setVideoTitle] = useState('Why 99% of Channels Fail in the First 30 Days');
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [audience, setAudience] = useState('Ambitious YouTube Creators');
  const [category, setCategory] = useState('Technology & Software');
  const [format, setFormat] = useState<'16:9' | '9:16'>('16:9');
  const [stylePreset, setStylePreset] = useState('Dramatic Contrast');
  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<ThumbnailProject | null>(() => {
    // Default initial project
    return {
      id: 'thumb-default',
      videoTitle: 'Why 99% of Channels Fail in the First 30 Days',
      format: '16:9',
      stylePreset: 'Dramatic Contrast',
      conceptSummary:
        'A high-stakes visual contradiction: creator looking distressed pointing at a steep downward metric graph, juxtaposed with an intense glowing question mark.',
      focalSubject: 'Host face in 1/3 right frame with authentic distress/skepticism',
      facialExpression: 'Squinted eyes and open-mouth disbelief, looking directly at the camera',
      contrastStrategy:
        'Warm rim lighting (amber/magenta) tracing the creator silhouette against a pitch black/navy background with high depth of field blur',
      colorPalette: [
        { hex: '#070D18', label: 'Deep Navy Shadow' },
        { hex: '#FF2A55', label: 'Critical Alarm Red' },
        { hex: '#8B5CF6', label: 'Electric Violet Rim' },
        { hex: '#FFFFFF', label: 'Maximum Legibility White' },
      ],
      textPlacement: 'Top-left quadrant, strictly above bottom 25% to avoid YouTube mobile timestamps',
      textVariations: ['STOP DOING THIS', 'THEY LIED TO YOU', '99% MAKE THIS MISTAKE'],
      backgroundAdvice:
        'Subtle dark studio setting with soft bokeh background and red caution warning light',
      lightingAdvice: 'Bright key light on subject face, hard magenta rim light on shoulders',
      safeZoneNotes:
        'Keep bottom right corner completely clear of text or faces (reserved for YouTube video duration badge)',
      customOverlayText: 'STOP DOING THIS',
      createdAt: new Date().toISOString(),
    };
  });

  const [overlayText, setOverlayText] = useState('STOP DOING THIS');
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [showRuleOfThirds, setShowRuleOfThirds] = useState(false);

  const handleSelectExistingVideo = (vidId: string) => {
    setSelectedVideoId(vidId);
    const found = videos.find((v) => v.id === vidId);
    if (found) {
      setVideoTitle(found.title);
      setCategory(found.category);
      if (found.format === 'Shorts') setFormat('9:16');
      else setFormat('16:9');
    }
  };

  const handleGenerateBrief = async () => {
    setLoading(true);
    try {
      const brief = await AIService.generateThumbnailBrief({
        videoTitle,
        category,
        audience,
        stylePreset,
        format,
      });
      setActiveProject(brief);
      if (brief.textVariations?.[0]) {
        setOverlayText(brief.textVariations[0]);
      }
    } catch (err) {
      console.error('Failed to generate thumbnail brief:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleDownloadBrief = () => {
    if (!activeProject) return;
    const content = `# VIRALREADER THUMBNAIL DESIGN BRIEF
Title: ${activeProject.videoTitle}
Format: ${activeProject.format}
Style: ${activeProject.stylePreset}
Date: ${new Date(activeProject.createdAt).toLocaleDateString()}

## 1. Concept Summary
${activeProject.conceptSummary}

## 2. Focal Subject & Expression
- Subject: ${activeProject.focalSubject}
- Emotional Trigger / Expression: ${activeProject.facialExpression}

## 3. Packaging & Contrast Strategy
- Contrast: ${activeProject.contrastStrategy}
- Background: ${activeProject.backgroundAdvice}
- Lighting: ${activeProject.lightingAdvice}
- Safe Zone Notes: ${activeProject.safeZoneNotes}

## 4. Suggested Thumbnail Text (2-5 words)
${activeProject.textVariations?.map((t, i) => `${i + 1}. "${t}"`).join('\n')}

## 5. Color Palette
${activeProject.colorPalette?.map((c) => `- ${c.hex} (${c.label})`).join('\n')}

---
Generated by ViralReader Thumbnail Studio`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Thumbnail_Brief_${activeProject.videoTitle.slice(0, 30).replace(/\s+/g, '_')}.md`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1B293E]/60">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Thumbnail Packaging Studio
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6D3DF5]/20 text-[#8B5CF6] border border-[#6D3DF5]/30">
              CLICK-THROUGH RATE LAB
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Engineer high-CTR thumbnail compositions, psychological visual hooks, contrast ratios, and 2-5 word text overlays.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenScoreExplainer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2D] border border-[#1B293E] hover:border-[#6D3DF5]/50 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>CTR Methodology</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Brief Input Form (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0D1726] border border-[#1B293E] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#8B5CF6]" />
              <span>Packaging Brief Generator</span>
            </h2>
            <span className="text-[10px] text-purple-400 font-mono">Gemini AI</span>
          </div>

          {/* Quick Select from Trending Videos */}
          {videos.length > 0 && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Select from Currently Tracked Videos (Optional)
              </label>
              <select
                value={selectedVideoId}
                onChange={(e) => handleSelectExistingVideo(e.target.value)}
                className="w-full px-3 py-2 bg-[#070D18] border border-[#1B293E] focus:border-[#6D3DF5] rounded-xl text-xs text-slate-200 focus:outline-none truncate"
              >
                <option value="">-- Or enter custom video title below --</option>
                {videos.slice(0, 15).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title.slice(0, 60)}... ({v.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Video Title */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Video Title or Working Concept
            </label>
            <textarea
              rows={2}
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="e.g. I Tested 50 AI Tools in 24 Hours"
              className="w-full p-2.5 bg-[#070D18] border border-[#1B293E] focus:border-[#6D3DF5] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Format & Style Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#070D18] border border-[#1B293E] rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setFormat('16:9')}
                  className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors ${
                    format === '16:9' ? 'bg-[#6D3DF5] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>16:9</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('9:16')}
                  className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors ${
                    format === '9:16' ? 'bg-[#6D3DF5] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>9:16</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Style Preset</label>
              <select
                value={stylePreset}
                onChange={(e) => setStylePreset(e.target.value)}
                className="w-full px-3 py-2 bg-[#070D18] border border-[#1B293E] focus:border-[#6D3DF5] rounded-xl text-xs text-slate-200 focus:outline-none"
              >
                <option value="Dramatic Contrast">Dramatic Contrast</option>
                <option value="Curiosity Gap (What is inside?)">Curiosity Gap Loop</option>
                <option value="Clean Tech Minimalist">Clean Tech Minimalist</option>
                <option value="Extreme Reaction Shock">Extreme Reaction Shock</option>
                <option value="Cinematic Documentary">Cinematic Documentary</option>
                <option value="Vibrant Gaming Hype">Vibrant Gaming Hype</option>
              </select>
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target Audience</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. Young Tech Enthusiasts & Builders"
              className="w-full px-3 py-2 bg-[#070D18] border border-[#1B293E] focus:border-[#6D3DF5] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateBrief}
            disabled={loading || !videoTitle.trim()}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#6D3DF5] to-[#8B5CF6] hover:opacity-95 disabled:opacity-50 text-xs font-bold text-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#6D3DF5]/30 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing Packaging...' : 'Generate Thumbnail Strategy'}</span>
          </button>
        </div>

        {/* Right Column: Live Mockup Canvas & Strategy Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Mockup Canvas Simulator Card */}
          <div className="p-5 rounded-2xl bg-[#0D1726] border border-[#1B293E] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>Interactive Thumbnail Canvas Preview</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {format}
                </span>
              </div>

              {/* View overlays toggles */}
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  onClick={() => setShowSafeZones(!showSafeZones)}
                  className={`px-2 py-1 rounded border transition-colors ${
                    showSafeZones
                      ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                      : 'bg-[#111C2D] border-[#1B293E] text-slate-400'
                  }`}
                  title="Toggle safe zones (timestamp badge & UI buttons)"
                >
                  Safe Zones
                </button>
                <button
                  onClick={() => setShowRuleOfThirds(!showRuleOfThirds)}
                  className={`px-2 py-1 rounded border transition-colors ${
                    showRuleOfThirds
                      ? 'bg-cyan-950/40 border-cyan-800 text-cyan-300'
                      : 'bg-[#111C2D] border-[#1B293E] text-slate-400'
                  }`}
                  title="Toggle Rule of Thirds grid alignment"
                >
                  Grid (3x3)
                </button>
              </div>
            </div>

            {/* Canvas Box */}
            <div className="flex justify-center p-4 rounded-xl bg-[#050A12] border border-[#16243A]">
              <div
                className={`relative overflow-hidden rounded-xl shadow-2xl transition-all duration-300 border border-[#233852] flex flex-col justify-between p-4 ${
                  format === '16:9'
                    ? 'w-full aspect-video max-w-lg bg-gradient-to-br from-[#121E31] via-[#091220] to-[#040810]'
                    : 'w-64 aspect-[9/16] bg-gradient-to-b from-[#142036] via-[#0B1424] to-[#040914]'
                }`}
              >
                {/* Rule of Thirds Grid Overlay */}
                {showRuleOfThirds && (
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-cyan-500/20 z-20">
                    <div className="border-r border-b border-cyan-500/20" />
                    <div className="border-r border-b border-cyan-500/20" />
                    <div className="border-b border-cyan-500/20" />
                    <div className="border-r border-b border-cyan-500/20" />
                    <div className="border-r border-b border-cyan-500/20" />
                    <div className="border-b border-cyan-500/20" />
                    <div className="border-r border-cyan-500/20" />
                    <div className="border-r border-cyan-500/20" />
                    <div />
                  </div>
                )}

                {/* Safe Zone Warning Overlays */}
                {showSafeZones && (
                  <>
                    {format === '16:9' ? (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-red-600/80 text-white text-[10px] font-mono font-bold tracking-tight z-30 shadow-md">
                        12:45 [TIMESTAMP NO-GO]
                      </div>
                    ) : (
                      <div className="absolute right-2 bottom-12 space-y-2 z-30 pointer-events-none">
                        <div className="w-8 h-8 rounded-full bg-red-500/40 border border-red-400/60 flex items-center justify-center text-[8px] text-white font-mono">
                          LIKE
                        </div>
                        <div className="w-8 h-8 rounded-full bg-red-500/40 border border-red-400/60 flex items-center justify-center text-[8px] text-white font-mono">
                          CMT
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Background visual artwork simulator */}
                <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#6D3DF5]/30 via-transparent to-transparent pointer-events-none" />

                {/* Simulated Focal Subject Avatar */}
                <div
                  className={`absolute z-10 pointer-events-none flex items-center justify-center ${
                    format === '16:9' ? 'right-6 bottom-0 w-44 h-44' : 'bottom-16 left-1/2 -translate-x-1/2 w-48 h-48'
                  }`}
                >
                  <div className="w-full h-full rounded-t-full bg-gradient-to-t from-[#6D3DF5]/50 via-purple-600/30 to-cyan-400/20 border-t-2 border-[#8B5CF6] flex flex-col items-center justify-start pt-6 shadow-2xl">
                    <div className="w-14 h-14 rounded-full bg-purple-900/60 border border-purple-400 flex items-center justify-center text-xs text-purple-200 font-bold">
                      FOCAL
                    </div>
                    <span className="text-[9px] text-purple-300 font-mono mt-1">EMOTIONAL ANCHOR</span>
                  </div>
                </div>

                {/* Foreground Overlay Text (2-5 words) */}
                <div className="relative z-20 max-w-[70%]">
                  <div className="inline-block px-3 py-1.5 rounded-lg bg-black/85 border border-[#8B5CF6]/80 text-white font-black tracking-tight uppercase text-sm sm:text-base leading-none shadow-2xl shadow-purple-950/80 drop-shadow-[0_4px_12px_rgba(109,61,245,0.7)]">
                    {overlayText}
                  </div>
                </div>

                {/* Footer notes inside canvas */}
                <div className="relative z-20 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                  <span>ViralReader Design Preview</span>
                  <span>{format === '16:9' ? '1280 × 720' : '1080 × 1920'}</span>
                </div>
              </div>
            </div>

            {/* Quick text picker */}
            {activeProject?.textVariations && activeProject.textVariations.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-semibold text-slate-400">
                  Select 2-5 Word Overlay Text Variations:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {activeProject.textVariations.map((txt, idx) => {
                    const isSelected = overlayText === txt;
                    return (
                      <button
                        key={idx}
                        onClick={() => setOverlayText(txt)}
                        className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#6D3DF5] border-[#8B5CF6] text-white shadow-md shadow-[#6D3DF5]/30'
                            : 'bg-[#111C2D] border-[#1B293E] text-slate-300 hover:text-white hover:bg-[#16243A]'
                        }`}
                      >
                        <span>{txt}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyText(txt);
                          }}
                          className="hover:text-cyan-300"
                        >
                          {copiedText === txt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Strategy Breakdown Card */}
          {activeProject && (
            <div className="p-5 rounded-2xl bg-[#0D1726] border border-[#1B293E] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>Packaging Strategy Blueprint</span>
                </h3>
                <button
                  onClick={handleDownloadBrief}
                  className="px-3 py-1 rounded-lg bg-[#111C2D] hover:bg-[#16243A] border border-[#1B293E] text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>Export Brief</span>
                </button>
              </div>

              {/* Concept & Focal Subject */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E] space-y-1">
                  <span className="font-semibold text-cyan-400">Focal Subject Placement</span>
                  <p className="text-slate-300 leading-relaxed">{activeProject.focalSubject}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E] space-y-1">
                  <span className="font-semibold text-purple-400">Facial & Emotional Trigger</span>
                  <p className="text-slate-300 leading-relaxed">{activeProject.facialExpression}</p>
                </div>
              </div>

              {/* Contrast & Lighting Strategy */}
              <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E] space-y-1 text-xs">
                <span className="font-semibold text-emerald-400">Contrast & Depth Strategy</span>
                <p className="text-slate-300 leading-relaxed">{activeProject.contrastStrategy}</p>
              </div>

              {/* Color Palette Swatches */}
              {activeProject.colorPalette && activeProject.colorPalette.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400">Harmonic High-CTR Color Palette:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {activeProject.colorPalette.map((col, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-xl bg-[#111C2D] border border-[#1B293E] flex items-center gap-2 text-xs"
                      >
                        <div
                          className="w-5 h-5 rounded-md border border-white/20 shrink-0"
                          style={{ backgroundColor: col.hex }}
                        />
                        <div className="min-w-0">
                          <div className="font-mono text-[11px] text-white font-bold">{col.hex}</div>
                          <div className="text-[10px] text-slate-400 truncate">{col.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safe Zone Reminder */}
              <div className="p-3 rounded-lg bg-[#070D18] border border-[#1B293E] text-xs text-slate-400 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-300">Safe Zone Note: </span>
                  {activeProject.safeZoneNotes}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
