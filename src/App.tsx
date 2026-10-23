import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { RightInsightsPanel } from './components/RightInsightsPanel';
import { DashboardView } from './components/DashboardView';
import { OutlierDetectorView } from './components/views/OutlierDetectorView';
import { ShortsView } from './components/views/ShortsView';
import { CategoryRadarView } from './components/views/CategoryRadarView';
import { CountryExplorerView } from './components/views/CountryExplorerView';
import { TrendExplorerView } from './components/views/TrendExplorerView';
import { ContentIdeasStudioView } from './components/views/ContentIdeasStudioView';
import { ThumbnailStudioView } from './components/views/ThumbnailStudioView';
import { AdminPanelView } from './components/views/AdminPanelView';
import { LandingPageView } from './components/views/LandingPageView';
import { SavedLibraryView } from './components/views/SavedLibraryView';
import { MyNicheView } from './components/views/MyNicheView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';
import { PricingView } from './components/views/PricingView';
import { TrendAnalysisModal } from './components/TrendAnalysisModal';
import { YouTubeApiModal } from './components/YouTubeApiModal';
import { ScoreExplainerModal } from './components/ScoreExplainerModal';
import { AuthModal } from './components/AuthModal';
import { PublicLegalModal, LegalModalType } from './components/PublicLegalModal';
import { AdBanner } from './components/AdBanner';

import {
  VideoItem,
  FilterState,
  TrendCluster,
  ContentIdea,
  CategoryName,
  MarketRegion,
  UserAccount,
} from './types';
import { MOCK_VIDEOS, MOCK_TREND_CLUSTERS, MOCK_CONTENT_IDEAS } from './data/mockData';
import { YouTubeService } from './services/youtubeService';
import { StorageService } from './services/storageService';
import { AuthService } from './services/authService';

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  market: 'Global',
  category: 'All',
  format: 'All',
  dateRange: 'all',
  channelTier: 'all',
  minViews: 0,
  maxViews: 100000000,
  minViralScore: 0,
  minOutlierScore: 1,
  sortBy: 'viralScore',
  viewType: 'dashboard',
};

// Map sidebar radar view IDs to their CategoryName and metadata
export const CATEGORY_RADARS_CONFIG: Record<
  string,
  { category: CategoryName; title: string; desc: string }
> = {
  'vlogs-radar': {
    category: 'Vlogs & Lifestyle',
    title: 'Vlogs & Lifestyle Radar',
    desc: 'Authentic day-in-the-life pacing, dynamic travel storytelling, and visual diary hooks.',
  },
  'ai-content-radar': {
    category: 'AI Content & Tools',
    title: 'AI Content & Tools Radar',
    desc: 'Autonomous coding agents, AI workflow deconstructions, and emerging machine learning software.',
  },
  'drama-tv': {
    category: 'Drama & TV',
    title: 'Drama & TV Trends',
    desc: 'Prime-time episodic plot twists, cliffhanger reviews, and audience reaction velocity.',
  },
  'movies-trailers': {
    category: 'Movies & Trailers',
    title: 'Movies & Trailers Radar',
    desc: 'Official teaser breakdowns, cinematic easter egg decodes, and film theory analyses.',
  },
  entertainment: {
    category: 'Entertainment',
    title: 'Entertainment & Challenges',
    desc: 'High-stakes physical comparisons, curiosity gap challenges, and big-scale entertainment formats.',
  },
  'gaming-trends': {
    category: 'Gaming & Esports',
    title: 'Gaming & Esports Trends',
    desc: 'Sandbox physics breakthroughs, secret easter eggs, and high-velocity competitive gameplay.',
  },
  'technology-ai': {
    category: 'Technology & Software',
    title: 'Technology & Software Radar',
    desc: 'Hardware teardowns, engineering benchmarks, silicon architecture, and software dev tutorials.',
  },
  'education-tutorials': {
    category: 'Education & Tutorials',
    title: 'Education & Tutorials Radar',
    desc: 'Visual mathematics, intuitive engineering models, and high-retention explainers.',
  },
  'business-finance': {
    category: 'Business & Finance',
    title: 'Business & Finance Radar',
    desc: 'Solo builder agency transparency, SaaS case studies, macroeconomic shifts, and verified revenue breakdowns.',
  },
  'comedy-memes': {
    category: 'Comedy & Memes',
    title: 'Comedy & Memes Radar',
    desc: 'Workplace satire, relatable cultural skits, rapid punchline delivery, and viral meme audio trends.',
  },
  'music-dance': {
    category: 'Music & Dance',
    title: 'Music & Dance Radar',
    desc: 'Fusion tracks, studio session releases, viral audio hooks, and performance choreography.',
  },
  'sports-cricket': {
    category: 'Sports & Cricket',
    title: 'Sports & Cricket Radar',
    desc: 'Match tactics, bowling & pitch breakdown analyses, athlete routines, and sports highlights.',
  },
  'food-cooking': {
    category: 'Food & Cooking',
    title: 'Food & Cooking Radar',
    desc: 'Street food expeditions, recipe tests, sensory ASMR cooking, and extreme price comparisons.',
  },
  'beauty-fashion': {
    category: 'Beauty & Fashion',
    title: 'Beauty & Fashion Radar',
    desc: 'Clinical ingredient testing, viral skincare debunking, and authentic seasonal style breakdowns.',
  },
  'news-events': {
    category: 'News & Current Events',
    title: 'News & Current Events Radar',
    desc: 'Geopolitical supply chain deconstructions, semiconductor economics, and global macro analyses.',
  },
};

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [videos, setVideos] = useState<VideoItem[]>(MOCK_VIDEOS);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [quotaWarning, setQuotaWarning] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Saved items
  const [savedVideoIds, setSavedVideoIds] = useState<Set<string>>(() => {
    const list = StorageService.getSavedVideos();
    return new Set(list.map((i) => i.videoId));
  });

  const [savedTrendIds, setSavedTrendIds] = useState<Set<string>>(() => {
    const list = StorageService.getSavedTrends();
    return new Set(list.map((i) => i.trendId));
  });

  // Modals state
  const [analyzingVideo, setAnalyzingVideo] = useState<VideoItem | null>(null);
  const [apiModalOpen, setApiModalOpen] = useState<boolean>(false);
  const [scoreExplainerOpen, setScoreExplainerOpen] = useState<boolean>(false);
  const [pricingModalOpen, setPricingModalOpen] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);

  // Ideas studio selected idea
  const [studioInitialIdea, setStudioInitialIdea] = useState<ContentIdea | null>(null);

  // Restore authenticated session on mount and subscribe to auth changes
  useEffect(() => {
    AuthService.getMe().then((user) => {
      if (user) setCurrentUser(user);
    });
    const unsubscribe = AuthService.subscribe((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  // Query videos whenever filters change
  useEffect(() => {
    fetchVideos();
  }, [filters]);

  const fetchVideos = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const result = await YouTubeService.getVideos(filters);
      setVideos(result.videos);
      setIsLiveApi(result.isLiveApi);
      setQuotaWarning(Boolean(result.quotaWarning));
      if (result.error && !result.quotaWarning) {
        setFetchError(result.error);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to query YouTube API';
      setFetchError(msg);
      console.error('Failed to fetch videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (viewId: string) => {
    setCurrentView(viewId);
    setMobileSidebarOpen(false);

    if (CATEGORY_RADARS_CONFIG[viewId]) {
      const targetCat = CATEGORY_RADARS_CONFIG[viewId].category;
      setFilters((prev) => ({
        ...prev,
        category: targetCat,
        format: 'All',
        viewType: viewId,
      }));
    } else if (viewId === 'shorts') {
      setFilters((prev) => ({
        ...prev,
        category: 'All',
        format: 'Shorts',
        viewType: 'shorts',
      }));
    } else if (viewId === 'long-form') {
      setFilters((prev) => ({
        ...prev,
        category: 'All',
        format: 'Long-Form',
        viewType: 'long-form',
      }));
    } else if (viewId === 'viral-now') {
      setFilters((prev) => ({
        ...prev,
        category: 'All',
        format: 'All',
        sortBy: 'viewsPerHour',
        viewType: 'viral-now',
      }));
    } else if (viewId === 'dashboard') {
      setFilters((prev) => ({
        ...prev,
        category: 'All',
        format: 'All',
        sortBy: 'viralScore',
        viewType: 'dashboard',
      }));
    }
  };

  const handleToggleSaveVideo = (videoId: string) => {
    const saved = StorageService.toggleSaveVideo(videoId);
    setSavedVideoIds((prev) => {
      const next = new Set(prev);
      if (saved) next.add(videoId);
      else next.delete(videoId);
      return next;
    });
  };

  const handleToggleSaveTrend = (cluster: TrendCluster) => {
    const saved = StorageService.toggleSaveTrend(cluster.id, cluster.name, cluster.category);
    setSavedTrendIds((prev) => {
      const next = new Set(prev);
      if (saved) next.add(cluster.id);
      else next.delete(cluster.id);
      return next;
    });
  };

  const handleOpenIdeasStudio = (video: VideoItem) => {
    const initial: ContentIdea = {
      id: `studio-${video.id}-${Date.now()}`,
      title: `How to Replicate "${video.title}" in Your Niche`,
      hook: `This video got ${video.outlierScore}x the channel's usual views with this opening 3-second tension.`,
      angle: `Analyzing and adapting the packaging formula of ${video.channelTitle}`,
      outline: [
        '0:00-0:15 The Hook Tension (adapt for your niche)',
        '0:15-2:00 The Escalation Question',
        '2:00-5:00 Step-by-step demonstration',
        '5:00-7:00 Takeaway & Replay CTA',
      ],
      format: video.format,
      duration: video.format === 'Shorts' ? '50s' : '10-12 min',
      estimatedOutlierPotential: `${video.outlierScore}x Benchmark`,
      tags: [video.category, 'Outlier Adaptation', 'Hook Breakdown'],
      category: video.category,
      createdAt: new Date().toISOString(),
    };
    setStudioInitialIdea(initial);
    setCurrentView('content-ideas-studio');
  };

  const handleSelectCluster = (cluster: TrendCluster) => {
    setFilters((prev) => ({
      ...prev,
      category: cluster.category,
      searchQuery: cluster.topKeywords[0] || '',
    }));
    setCurrentView('dashboard');
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleResetAllData = () => {
    localStorage.clear();
    setSavedVideoIds(new Set());
    setSavedTrendIds(new Set());
    setFilters(INITIAL_FILTERS);
    fetchVideos();
    alert('All local storage items, saved bookmarks, and custom preferences have been reset.');
  };

  // Render content according to currentView
  const renderMainContent = () => {
    if (CATEGORY_RADARS_CONFIG[currentView]) {
      const cfg = CATEGORY_RADARS_CONFIG[currentView];
      return (
        <CategoryRadarView
          category={cfg.category}
          categoryTitle={cfg.title}
          categoryDescription={cfg.desc}
          videos={videos}
          savedVideoIds={savedVideoIds}
          loading={loading}
          isLiveApi={isLiveApi}
          error={fetchError}
          quotaWarning={quotaWarning}
          market={filters.market}
          onMarketChange={(m) => setFilters((prev) => ({ ...prev, market: m }))}
          onRetry={fetchVideos}
          onToggleSave={handleToggleSaveVideo}
          onAnalyzeTrend={(v) => setAnalyzingVideo(v)}
          onGenerateIdeas={handleOpenIdeasStudio}
          onOpenScoreExplainer={() => setScoreExplainerOpen(true)}
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            videos={videos}
            savedVideoIds={savedVideoIds}
            onToggleSave={handleToggleSaveVideo}
            onAnalyzeTrend={(v) => setAnalyzingVideo(v)}
            onGenerateIdeas={handleOpenIdeasStudio}
            onOpenScoreExplainer={() => setScoreExplainerOpen(true)}
            filters={filters}
            onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
            onResetFilters={handleResetFilters}
            onSelectCategoryShortcut={(cat) => setFilters((prev) => ({ ...prev, category: cat }))}
            trendClusters={MOCK_TREND_CLUSTERS}
            isLiveApi={isLiveApi}
            onOpenApiModal={() => setApiModalOpen(true)}
            loading={loading}
            quotaWarning={quotaWarning}
          />
        );

      case 'viral-now':
        return (
          <DashboardView
            videos={videos}
            savedVideoIds={savedVideoIds}
            onToggleSave={handleToggleSaveVideo}
            onAnalyzeTrend={(v) => setAnalyzingVideo(v)}
            onGenerateIdeas={handleOpenIdeasStudio}
            onOpenScoreExplainer={() => setScoreExplainerOpen(true)}
            filters={{ ...filters, sortBy: 'viewsPerHour' }}
            onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
            onResetFilters={handleResetFilters}
            onSelectCategoryShortcut={(cat) => setFilters((prev) => ({ ...prev, category: cat }))}
            trendClusters={MOCK_TREND_CLUSTERS}
            isLiveApi={isLiveApi}
            onOpenApiModal={() => setApiModalOpen(true)}
            loading={loading}
            quotaWarning={quotaWarning}
          />
        );

      case 'shorts':
        return (
          <ShortsView
            videos={videos}
            savedVideoIds={savedVideoIds}
            loading={loading}
            isLiveApi={isLiveApi}
            quotaWarning={quotaWarning}
            onRetry={fetchVideos}
            onToggleSave={handleToggleSaveVideo}
            onAnalyzeTrend={(v) => setAnalyzingVideo(v)}
            onGenerateIdeas={handleOpenIdeasStudio}
            onOpenScoreExplainer={() => setScoreExplainerOpen(true)}
          />
        );

      case 'long-form':
        return (
          <DashboardView
            videos={videos.filter((v) => v.format === 'Long-Form')}
            savedVideoIds={savedVideoIds}
            onToggleSave={handleToggleSaveVideo}
            onAnalyzeTrend={(v) => setAnalyzingVideo(v)}
            onGenerateIdeas={handleOpenIdeasStudio}
            onOpenScoreExplainer={() => setScoreExplainerOpen(true)}
            filters={{ ...filters, format: 'Long-Form' }}
            onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
            onResetFilters={handleResetFilters}
            onSelectCategoryShortcut={(cat) => setFilters((prev) => ({ ...prev, category: cat }))}
            trendClusters={MOCK_TREND_CLUSTERS}
            isLiveApi={isLiveApi}
            onOpenApiModal={() => setApiModalOpen(true)}
            loading={loading}
            quotaWarning={quotaWarning}
          />
        );

      case 'outlier-detector':
        return (
          <OutlierDetectorView
            videos={videos}
            savedVideoIds={savedVideoIds}
            onToggleSave={handleToggleSaveVideo}
            onAnalyzeTrend={(v) => setAnalyzingVideo(v)}
            onGenerateIdeas={handleOpenIdeasStudio}
            onOpenScoreExplainer={() => setScoreExplainerOpen(true)}
          />
        );

      case 'small-channel-breakouts':
        return (
          <OutlierDetectorView
            videos={videos}
            savedVideoIds={savedVideoIds}
            onToggleSave={handleToggleSaveVideo}
            onAnalyzeTrend={(v) => setAnalyzingVideo(v)}
            onGenerateIdeas={handleOpenIdeasStudio}
            onOpenScoreExplainer={() => setScoreExplainerOpen(true)}
            isSmallChannelMode={true}
          />
        );



      // Discovery & Studio Views
      case 'country-explorer':
        return (
          <CountryExplorerView
            currentMarket={filters.market}
            onSelectMarket={(m) => setFilters((prev) => ({ ...prev, market: m }))}
            videos={videos}
            savedVideoIds={savedVideoIds}
            loading={loading}
            isLiveApi={isLiveApi}
            quotaWarning={quotaWarning}
            onRetry={fetchVideos}
            onToggleSave={handleToggleSaveVideo}
            onAnalyzeTrend={(v) => setAnalyzingVideo(v)}
            onGenerateIdeas={handleOpenIdeasStudio}
            onOpenScoreExplainer={() => setScoreExplainerOpen(true)}
          />
        );

      case 'trend-explorer':
        return (
          <TrendExplorerView
            trendClusters={MOCK_TREND_CLUSTERS}
            savedTrendIds={savedTrendIds}
            onToggleSaveTrend={handleToggleSaveTrend}
            videos={videos}
            savedVideoIds={savedVideoIds}
            onToggleSaveVideo={handleToggleSaveVideo}
            onAnalyzeTrend={(v) => setAnalyzingVideo(v)}
            onGenerateIdeas={handleOpenIdeasStudio}
            onOpenScoreExplainer={() => setScoreExplainerOpen(true)}
          />
        );

      case 'my-niche':
        return (
          <MyNicheView
            videos={videos}
            savedVideoIds={savedVideoIds}
            onToggleSaveVideo={handleToggleSaveVideo}
            onAnalyzeTrend={(v) => setAnalyzingVideo(v)}
            onGenerateIdeas={handleOpenIdeasStudio}
            onOpenScoreExplainer={() => setScoreExplainerOpen(true)}
          />
        );

      case 'content-ideas-studio':
        return <ContentIdeasStudioView initialIdea={studioInitialIdea} />;

      case 'reports':
        return (
          <ReportsView
            videos={videos}
            trendClusters={MOCK_TREND_CLUSTERS}
            onOpenScoreExplainer={() => setScoreExplainerOpen(true)}
          />
        );

      case 'saved-videos':
        return (
          <SavedLibraryView
            videos={videos}
            savedVideoIds={savedVideoIds}
            onToggleSaveVideo={handleToggleSaveVideo}
            trendClusters={MOCK_TREND_CLUSTERS}
            savedTrendIds={savedTrendIds}
            onToggleSaveTrend={handleToggleSaveTrend}
            onAnalyzeTrend={(v) => setAnalyzingVideo(v)}
            onGenerateIdeas={handleOpenIdeasStudio}
            onOpenScoreExplainer={() => setScoreExplainerOpen(true)}
            initialTab="videos"
          />
        );

      case 'saved-trends':
        return (
          <SavedLibraryView
            videos={videos}
            savedVideoIds={savedVideoIds}
            onToggleSaveVideo={handleToggleSaveVideo}
            trendClusters={MOCK_TREND_CLUSTERS}
            savedTrendIds={savedTrendIds}
            onToggleSaveTrend={handleToggleSaveTrend}
            onAnalyzeTrend={(v) => setAnalyzingVideo(v)}
            onGenerateIdeas={handleOpenIdeasStudio}
            onOpenScoreExplainer={() => setScoreExplainerOpen(true)}
            initialTab="trends"
          />
        );

      case 'admin-panel':
        return (
          <AdminPanelView
            currentUser={currentUser}
            onOpenScoreExplainer={() => setScoreExplainerOpen(true)}
          />
        );

      case 'thumbnail-studio':
        return (
          <ThumbnailStudioView
            videos={videos}
            onOpenScoreExplainer={() => setScoreExplainerOpen(true)}
          />
        );

      case 'landing':
        return (
          <LandingPageView
            onLaunchDashboard={() => setCurrentView('dashboard')}
            onOpenPricing={() => setCurrentView('pricing')}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenLegal={(type) => setLegalModalType(type)}
          />
        );

      case 'settings':
        return (
          <SettingsView
            onOpenApiModal={() => setApiModalOpen(true)}
            onOpenScoreExplainer={() => setScoreExplainerOpen(true)}
            onResetAllData={handleResetAllData}
          />
        );

      case 'pricing':
        return (
          <PricingView
            onOpenScoreExplainer={() => setScoreExplainerOpen(true)}
          />
        );

      default:
        return (
          <DashboardView
            videos={videos}
            savedVideoIds={savedVideoIds}
            onToggleSave={handleToggleSaveVideo}
            onAnalyzeTrend={(v) => setAnalyzingVideo(v)}
            onGenerateIdeas={handleOpenIdeasStudio}
            onOpenScoreExplainer={() => setScoreExplainerOpen(true)}
            filters={filters}
            onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
            onResetFilters={handleResetFilters}
            onSelectCategoryShortcut={(cat) => setFilters((prev) => ({ ...prev, category: cat }))}
            trendClusters={MOCK_TREND_CLUSTERS}
            isLiveApi={isLiveApi}
            onOpenApiModal={() => setApiModalOpen(true)}
            loading={loading}
            quotaWarning={quotaWarning}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col antialiased">
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onOpenPricing={() => setCurrentView('pricing')}
          currentUser={currentUser}
          onOpenAuth={() => setAuthModalOpen(true)}
        />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <Header
            searchQuery={filters.searchQuery}
            onSearchChange={(q) => setFilters((prev) => ({ ...prev, searchQuery: q }))}
            selectedMarket={filters.market}
            onMarketChange={(m) => setFilters((prev) => ({ ...prev, market: m }))}
            selectedDateRange={filters.dateRange}
            onDateRangeChange={(r) => setFilters((prev) => ({ ...prev, dateRange: r }))}
            isApiConnected={isLiveApi}
            onOpenApiModal={() => setApiModalOpen(true)}
            onOpenPricing={() => setCurrentView('pricing')}
            onNavigate={handleNavigate}
            onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
            currentUser={currentUser}
            onOpenAuth={() => setAuthModalOpen(true)}
          />

          {/* Body with main canvas & optional right insights panel */}
          <div className="flex-1 flex min-w-0">
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl overflow-y-auto">
              <AdBanner currentUser={currentUser} onOpenPricing={() => setCurrentView('pricing')} placement="dashboard" />
              <div className="mt-4">
                {renderMainContent()}
              </div>
            </main>

            {/* Right-hand Insights Panel (Visible on dashboard and large screens) */}
            {currentView === 'dashboard' && (
              <RightInsightsPanel
                trendClusters={MOCK_TREND_CLUSTERS}
                dailyIdeas={MOCK_CONTENT_IDEAS}
                onSelectCluster={handleSelectCluster}
                onOpenIdeaInStudio={(idea) => {
                  setStudioInitialIdea(idea);
                  setCurrentView('content-ideas-studio');
                }}
                onOpenScoreExplainer={() => setScoreExplainerOpen(true)}
                onOpenPricing={() => setCurrentView('pricing')}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <TrendAnalysisModal
        video={analyzingVideo}
        isOpen={Boolean(analyzingVideo)}
        onClose={() => setAnalyzingVideo(null)}
        onOpenIdeasStudioWithIdea={(idea) => {
          setStudioInitialIdea(idea);
          setAnalyzingVideo(null);
          setCurrentView('content-ideas-studio');
        }}
      />

      <YouTubeApiModal
        isOpen={apiModalOpen}
        onClose={() => setApiModalOpen(false)}
        onConfigChanged={() => fetchVideos()}
      />

      <ScoreExplainerModal
        isOpen={scoreExplainerOpen}
        onClose={() => setScoreExplainerOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setAuthModalOpen(false);
        }}
        onLogout={() => {
          AuthService.logout();
          setCurrentUser(null);
        }}
        onOpenPricing={() => {
          setAuthModalOpen(false);
          setCurrentView('pricing');
        }}
      />

      <PublicLegalModal
        modalType={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}
