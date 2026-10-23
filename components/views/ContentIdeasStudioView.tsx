import React, { useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Trash2,
  Edit3,
  RefreshCw,
  Plus,
  Download,
  Share2,
  Clock,
  Film,
  Tag,
  Hash,
  Eye,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  X,
  AlertTriangle,
  Play,
  Volume2,
} from 'lucide-react';
import { ContentIdea, ScriptGenerationResult, VideoFormat } from '../../types';
import { AIService } from '../../services/aiService';
import { StorageService } from '../../services/storageService';

interface ContentIdeasStudioViewProps {
  initialIdea?: ContentIdea | null;
}

const CONTENT_MODES = [
  { id: 'ai-shorts', label: 'AI Shorts (9:16)', format: 'Shorts' },
  { id: 'ai-storytelling', label: 'AI Storytelling & Lore', format: 'Long-Form' },
  { id: 'ai-animation', label: 'AI Animation & Cartoons', format: 'Long-Form' },
  { id: 'ai-characters', label: 'AI Generated Characters', format: 'Shorts' },
  { id: 'tools-demo', label: 'AI Tools & Software Demo', format: 'Long-Form' },
  { id: 'ai-news', label: 'AI News & Explainers', format: 'Long-Form' },
  { id: 'faceless', label: 'Faceless Cash-Cow Formats', format: 'Long-Form' },
  { id: 'vlogs', label: 'Vlogs & Lifestyle Angles', format: 'Long-Form' },
  { id: 'drama-commentary', label: 'Drama & TV Commentary', format: 'Long-Form' },
];

export const ContentIdeasStudioView: React.FC<ContentIdeasStudioViewProps> = ({ initialIdea }) => {
  const [ideas, setIdeas] = useState<ContentIdea[]>(() => {
    const saved = StorageService.getSavedIdeas();
    if (initialIdea && !saved.some((i) => i.id === initialIdea.id)) {
      return [initialIdea, ...saved];
    }
    return saved;
  });

  const [niche, setNiche] = useState('Technology & AI Tools');
  const [topic, setTopic] = useState('Autonomous Coding Agents & AI Tools');
  const [contentMode, setContentMode] = useState('ai-shorts');
  const [format, setFormat] = useState<string>('Shorts');
  const [audience, setAudience] = useState('YouTube Tech Enthusiasts & Builders');
  const [language, setLanguage] = useState('English');
  const [country, setCountry] = useState('United States');
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Full Script Modal State
  const [scriptModalIdea, setScriptModalIdea] = useState<ContentIdea | null>(null);
  const [scriptGenerating, setScriptGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<ScriptGenerationResult | null>(null);
  const [scriptError, setScriptError] = useState<string | null>(null);

  const handleSelectMode = (modeId: string) => {
    setContentMode(modeId);
    const found = CONTENT_MODES.find((m) => m.id === modeId);
    if (found) {
      setFormat(found.format);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setErrorMessage(null);
    try {
      const result = await AIService.generateIdeas({
        niche,
        topic,
        format,
        targetAudience: audience,
        targetLanguage: language,
        country,
        contentType: contentMode,
      });

      if (result.error && result.limitExceeded) {
        setErrorMessage(result.error);
      }

      if (result.ideas.length > 0) {
        setIdeas((prev) => [...result.ideas, ...prev]);
        setExpandedId(result.ideas[0].id);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to generate recommendations.');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleSave = (idea: ContentIdea) => {
    if (idea.isSaved) {
      StorageService.deleteIdea(idea.id);
      setIdeas((prev) => prev.map((i) => (i.id === idea.id ? { ...i, isSaved: false } : i)));
    } else {
      StorageService.saveIdea({ ...idea, isSaved: true });
      setIdeas((prev) => prev.map((i) => (i.id === idea.id ? { ...i, isSaved: true } : i)));
    }
  };

  const handleDelete = (id: string) => {
    StorageService.deleteIdea(id);
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  const handleCopy = (idea: ContentIdea) => {
    const text = `VIRALREADER AI RECOMMENDATION
Title: ${idea.title}
Title Options:
${idea.titleOptions?.map((t, idx) => `  ${idx + 1}. ${t}`).join('\n') || ''}

Opening Hook (0-10s):
"${idea.hook}"

Format: ${idea.format} (${idea.duration})
Target Audience: ${idea.targetAudience || 'General Viewers'} (${idea.targetLanguage || 'English'})
Why Now: ${idea.whyNow || 'High current search velocity'}
Trend Evidence: ${idea.trendEvidence || 'Observable algorithmic retention velocity'}

Thumbnail Concept:
${idea.thumbnailConcept || 'High contrast focus'}
Suggested Thumbnail Text (2-5 words): "${idea.thumbnailText || 'MUST WATCH'}"

Upload Time (Testable Recommendation):
${idea.suggestedUploadTime || 'Peak evening window'}

Outline:
${idea.outline.map((o) => `• ${o}`).join('\n')}

Keywords: ${idea.keywords?.join(', ') || ''}
Hashtags: ${idea.hashtags?.join(' ') || ''}
`;
    navigator.clipboard.writeText(text);
    setCopiedId(idea.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenScriptGenerator = async (idea: ContentIdea) => {
    setScriptModalIdea(idea);
    setGeneratedScript(null);
    setScriptError(null);
    setScriptGenerating(true);

    try {
      const script = await AIService.generateFullScript({
        title: idea.title,
        hook: idea.hook,
        outline: idea.outline,
        format: idea.format,
        duration: idea.duration,
        audience: idea.targetAudience,
      });
      setGeneratedScript(script);
    } catch (err: unknown) {
      setScriptError(err instanceof Error ? err.message : 'Failed to generate script.');
    } finally {
      setScriptGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1B293E]/60">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              AI Content Ideas Studio
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6D3DF5]/20 text-[#8B5CF6] border border-[#6D3DF5]/30">
              14-POINT SPECIFICATION
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Turn live YouTube trend signals into complete production blueprints: title options, 3-second hooks, scripts, and thumbnail concepts.
          </p>
        </div>
      </div>

      {/* AI Content Mode Selector Chips */}
      <div className="p-4 rounded-2xl bg-[#0D1726] border border-[#1B293E] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
            <span>AI Content Mode &amp; Format Presets</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Tailored Ideation Engines</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CONTENT_MODES.map((mode) => {
            const isSelected = contentMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleSelectMode(mode.id)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#6D3DF5] border-[#8B5CF6] text-white shadow-lg shadow-[#6D3DF5]/30'
                    : 'bg-[#111C2D] border-[#1B293E] text-slate-300 hover:text-white hover:bg-[#16243A]'
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Parameters Box */}
      <div className="p-5 rounded-2xl bg-[#0D1726] border border-[#1B293E] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target Niche</label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. AI Tools & SaaS"
              className="w-full px-3 py-2 bg-[#070D18] border border-[#1B293E] focus:border-[#6D3DF5] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Specific Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Claude 3.7 vs OpenAI Operator"
              className="w-full px-3 py-2 bg-[#070D18] border border-[#1B293E] focus:border-[#6D3DF5] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Audience Region / Market</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2 bg-[#070D18] border border-[#1B293E] focus:border-[#6D3DF5] rounded-xl text-xs text-slate-200 focus:outline-none"
            >
              <option value="United States">United States (EST/PST)</option>
              <option value="Pakistan">Pakistan (PKT)</option>
              <option value="India">India (IST)</option>
              <option value="United Kingdom">United Kingdom (GMT)</option>
              <option value="UAE">UAE / Middle East (GST)</option>
              <option value="Global">Global International</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-[#070D18] border border-[#1B293E] focus:border-[#6D3DF5] rounded-xl text-xs text-slate-200 focus:outline-none"
            >
              <option value="English">English</option>
              <option value="Urdu">Urdu (اردو)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Arabic">Arabic (العربية)</option>
              <option value="Spanish">Spanish (Español)</option>
            </select>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-xs text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-end">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-5 py-2.5 bg-gradient-to-r from-[#6D3DF5] to-[#8B5CF6] hover:opacity-95 disabled:opacity-50 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#6D3DF5]/30 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Synthesizing Viral Blueprints...' : 'Generate 14-Point AI Recommendations'}</span>
          </button>
        </div>
      </div>

      {/* Ideas Cards Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{ideas.length} Content Blueprints Generated</span>
          <span className="text-[11px]">Click an idea card to expand the full 14-point blueprint</span>
        </div>

        <div className="space-y-4">
          {ideas.map((idea) => {
            const isExpanded = expandedId === idea.id;
            return (
              <div
                key={idea.id}
                className={`p-5 rounded-2xl border transition-all duration-200 ${
                  isExpanded
                    ? 'bg-gradient-to-b from-[#142036] to-[#0D1726] border-[#8B5CF6] shadow-xl shadow-purple-950/30'
                    : 'bg-[#0D1726] border-[#1B293E] hover:border-slate-600'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : idea.id)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-purple-950/50 text-purple-300 border border-purple-800">
                        {idea.format}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-800">
                        {idea.duration}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-800">
                        {idea.estimatedOutlierPotential}
                      </span>
                      {idea.competitionLevel && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-800">
                          COMPETITION: {idea.competitionLevel.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white hover:text-purple-300 transition-colors leading-snug">
                      {idea.title}
                    </h3>

                    <p className="text-xs text-slate-400 italic">
                      <strong className="text-purple-400 font-semibold not-italic">Opening Hook (0-10s): </strong>
                      "{idea.hook}"
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopy(idea)}
                      className="p-2 rounded-lg bg-[#111C2D] border border-[#1B293E] text-slate-300 hover:text-white transition-colors"
                      title="Copy full 14-point blueprint to clipboard"
                    >
                      {copiedId === idea.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleToggleSave(idea)}
                      className="p-2 rounded-lg bg-[#111C2D] border border-[#1B293E] text-slate-300 hover:text-white transition-colors"
                      title="Bookmark to library"
                    >
                      {idea.isSaved ? <BookmarkCheck className="w-4 h-4 text-[#8B5CF6]" /> : <Bookmark className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleDelete(idea.id)}
                      className="p-2 rounded-lg bg-[#111C2D] border border-[#1B293E] text-slate-400 hover:text-rose-400 transition-colors"
                      title="Dismiss"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : idea.id)}
                      className="p-2 rounded-lg bg-[#111C2D] border border-[#1B293E] text-slate-300 hover:text-white transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded 14-Point Blueprint Details */}
                {isExpanded && (
                  <div className="mt-5 pt-4 border-t border-[#1B293E] space-y-4 text-xs animate-fade-in">
                    {/* Title variations */}
                    {idea.titleOptions && idea.titleOptions.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-[#09101C] border border-[#1B293E] space-y-1.5">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5 text-[#8B5CF6]" />
                          <span>3 Title A/B/C Test Variations:</span>
                        </span>
                        <div className="space-y-1 pl-1">
                          {idea.titleOptions.map((opt, idx) => (
                            <div key={idx} className="flex items-center justify-between text-slate-300">
                              <span>
                                <strong className="text-purple-400 font-mono">Option {String.fromCharCode(65 + idx)}: </strong>
                                {opt}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(opt);
                                }}
                                className="text-[10px] text-slate-400 hover:text-cyan-400 font-mono"
                              >
                                Copy
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Why Now & Trend Evidence */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E] space-y-1">
                        <span className="font-semibold text-cyan-400">Why This Idea Now?</span>
                        <p className="text-slate-300 leading-relaxed">{idea.whyNow || idea.angle}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E] space-y-1">
                        <span className="font-semibold text-emerald-400">Observable Public Trend Evidence</span>
                        <p className="text-slate-300 leading-relaxed">
                          {idea.trendEvidence || 'High like-to-view ratio and rapid velocity across emerging uploads.'}
                        </p>
                      </div>
                    </div>

                    {/* Thumbnail Concept & 2-5 Word Text */}
                    <div className="p-3.5 rounded-xl bg-[#09101C] border border-[#1B293E] space-y-2">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-[#8B5CF6]" />
                        <span>Compelling Thumbnail Packaging Brief:</span>
                      </span>
                      <p className="text-slate-300">{idea.thumbnailConcept}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-slate-400 text-[11px]">Recommended Thumbnail Text:</span>
                        <span className="px-2.5 py-1 rounded bg-[#6D3DF5]/30 text-white font-mono font-bold text-xs border border-[#8B5CF6]/50">
                          {idea.thumbnailText || 'MUST WATCH'}
                        </span>
                      </div>
                    </div>

                    {/* Script Outline */}
                    <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E] space-y-2">
                      <span className="font-bold text-white">Suggested Structural Script Outline:</span>
                      <ul className="space-y-1 text-slate-300">
                        {idea.outline.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-[#070D18] border border-[#1B293E] text-[10px] font-mono flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Upload Time & Opportunity Assessment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-[#070D18] border border-[#1B293E] space-y-1">
                        <span className="font-semibold text-purple-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Suggested Upload Time Window:</span>
                        </span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {idea.suggestedUploadTime || 'Evening peak window in audience timezone (Testable recommendation, not guaranteed).'}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-[#070D18] border border-[#1B293E] space-y-1">
                        <span className="font-semibold text-cyan-400">Creator Opportunity Hypothesis:</span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {idea.competitionOpportunity || 'Few creators in this niche are pairing high-stakes tension with instant visual proof.'}
                        </p>
                      </div>
                    </div>

                    {/* Keywords & Hashtags */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {idea.keywords?.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-[#070D18] border border-[#1B293E] text-slate-400 text-[10px] flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 text-purple-400" />
                          <span>{kw}</span>
                        </span>
                      ))}
                      {idea.hashtags?.map((ht, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-[#070D18] border border-[#1B293E] text-cyan-400 text-[10px] font-mono">
                          {ht}
                        </span>
                      ))}
                    </div>

                    {/* Full Script Generator Action Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleOpenScriptGenerator(idea)}
                        className="px-4 py-2 rounded-xl bg-[#6D3DF5] hover:bg-[#5B2DE0] text-xs font-bold text-white flex items-center gap-2 shadow-md shadow-[#6D3DF5]/30 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Generate Scene-by-Scene Production Script</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Script Drawer / Modal */}
      {scriptModalIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl bg-[#0D1726] border border-[#1B293E] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1B293E] bg-[#111C2D]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#6D3DF5]/20 border border-[#6D3DF5]/40 flex items-center justify-center text-[#8B5CF6]">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white truncate max-w-md">
                    Production Script: {scriptModalIdea.title}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Scene-by-scene timing, voiceover narration, visual cues &amp; sound effects
                  </p>
                </div>
              </div>
              <button
                onClick={() => setScriptModalIdea(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#16243A] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {scriptGenerating ? (
                <div className="py-16 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-[#8B5CF6] animate-spin mx-auto" />
                  <div className="text-sm font-bold text-white">Generating Scene Breakdown with Gemini AI...</div>
                  <p className="text-xs text-slate-400">
                    Structuring audio pacing, visual cues, and retention hooks for maximum viewer retention.
                  </p>
                </div>
              ) : scriptError ? (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300">
                  {scriptError}
                </div>
              ) : generatedScript ? (
                <div className="space-y-4">
                  {/* Cold Open */}
                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-1.5">
                    <span className="text-[10px] font-mono text-purple-300 font-bold uppercase tracking-wider">
                      COLD OPEN (0-5 SECONDS)
                    </span>
                    <p className="text-sm font-semibold text-white leading-relaxed">
                      "{generatedScript.openingHook}"
                    </p>
                  </div>

                  {/* Retention hooks note */}
                  {generatedScript.retentionHooks && (
                    <div className="p-3 rounded-lg bg-[#070D18] border border-[#1B293E] space-y-1">
                      <span className="text-[11px] font-bold text-cyan-400">Planned Retention Pacing Loops:</span>
                      <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px]">
                        {generatedScript.retentionHooks.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Scene Table */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Scene-by-Scene Production Breakdown
                    </span>
                    <div className="space-y-3">
                      {generatedScript.scenes?.map((scene) => (
                        <div key={scene.sceneNumber} className="p-4 rounded-xl bg-[#111C2D] border border-[#1B293E] space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded bg-[#6D3DF5] text-white flex items-center justify-center text-[10px]">
                                {scene.sceneNumber}
                              </span>
                              <span>Timestamp: {scene.timestamp}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#070D18] text-purple-300 border border-[#1B293E] text-[10px] font-mono">
                              {scene.retentionTactic}
                            </span>
                          </div>

                          <div className="p-3 rounded-lg bg-[#070D18] text-slate-200 leading-relaxed font-mono text-[11px]">
                            <strong>Voiceover / Host: </strong>
                            {scene.narration}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400">
                            <div>
                              <strong className="text-cyan-400">Visual Cues: </strong>
                              {scene.visualCues}
                            </div>
                            <div>
                              <strong className="text-amber-400">Audio / SFX: </strong>
                              {scene.soundEffectCues}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA & Pinned Comment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E] space-y-1">
                      <span className="font-semibold text-white">Call to Action:</span>
                      <p className="text-slate-300">{generatedScript.callToAction}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#111C2D] border border-[#1B293E] space-y-1">
                      <span className="font-semibold text-purple-400">Recommended Pinned Comment:</span>
                      <p className="text-slate-300">"{generatedScript.pinnedComment}"</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#1B293E] bg-[#09101C] flex justify-between items-center">
              <button
                onClick={() => {
                  if (generatedScript) {
                    const text = JSON.stringify(generatedScript, null, 2);
                    navigator.clipboard.writeText(text);
                    alert('Full script copied to clipboard!');
                  }
                }}
                disabled={!generatedScript}
                className="px-3.5 py-1.5 rounded-lg bg-[#111C2D] border border-[#1B293E] text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Script</span>
              </button>

              <button
                onClick={() => setScriptModalIdea(null)}
                className="px-4 py-1.5 rounded-lg bg-[#6D3DF5] hover:bg-[#5B2DE0] text-xs font-semibold text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
