import { VideoItem, FilterState, CategoryName, MarketRegion } from '../types';
import { MOCK_VIDEOS, createAvatar } from '../data/mockData';
import { StorageService } from './storageService';

// Region code map for YouTube Data API v3
export const REGION_CODES: Record<MarketRegion, string | undefined> = {
  Global: undefined,
  'United States': 'US',
  Pakistan: 'PK',
  India: 'IN',
  'United Kingdom': 'GB',
  Canada: 'CA',
  Australia: 'AU',
  UAE: 'AE',
  'Saudi Arabia': 'SA',
  Bangladesh: 'BD',
  Indonesia: 'ID',
  Turkey: 'TR',
  'South Korea': 'KR',
};

// YouTube Category IDs and dedicated discovery search queries
export const CATEGORY_DETAILS: Record<CategoryName, { id?: string; defaultQuery: string }> = {
  All: { defaultQuery: 'trending viral videos' },
  'Vlogs & Lifestyle': { id: '22', defaultQuery: 'vlog lifestyle daily routine day in the life' },
  'AI Content & Tools': { id: '28', defaultQuery: 'AI tools artificial intelligence ChatGPT Claude automation' },
  'Drama & TV': { id: '24', defaultQuery: 'drama series episode recap reaction breakdown' },
  'Movies & Trailers': { id: '1', defaultQuery: 'official trailer teaser movie scene breakdown' },
  Entertainment: { id: '24', defaultQuery: 'viral entertainment challenge extreme comparison' },
  'Gaming & Esports': { id: '20', defaultQuery: 'gaming gameplay highlights walkthrough esports' },
  'Technology & Software': { id: '28', defaultQuery: 'technology software coding gadget review tech' },
  'Education & Tutorials': { id: '27', defaultQuery: 'tutorial education how to guide learn explainer' },
  'Business & Finance': { id: '25', defaultQuery: 'business finance investing stocks startup money' },
  'Comedy & Memes': { id: '23', defaultQuery: 'comedy memes funny sketches standup parody' },
  'Music & Dance': { id: '10', defaultQuery: 'music video official audio song dance performance' },
  'Sports & Cricket': { id: '17', defaultQuery: 'sports highlights cricket match tournament goal' },
  'Food & Cooking': { id: '26', defaultQuery: 'food cooking recipe street food chef taste test' },
  'Beauty & Fashion': { id: '26', defaultQuery: 'beauty makeup fashion haul skincare style' },
  'Health & Fitness': { id: '26', defaultQuery: 'fitness workout health exercise training' },
  'Science & History': { id: '28', defaultQuery: 'science history documentary discovery space universe' },
  'News & Current Events': { id: '25', defaultQuery: 'news current events journalism report world update' },
  'Podcasts & Interviews': { id: '24', defaultQuery: 'podcast full interview deep conversation episode' },
  'Travel & Exploration': { id: '19', defaultQuery: 'travel documentary tour exploration adventure' },
};

export const CATEGORY_MAP: Record<CategoryName, string | undefined> = Object.fromEntries(
  Object.entries(CATEGORY_DETAILS).map(([k, v]) => [k, v.id])
) as Record<CategoryName, string | undefined>;

export interface FetchResult {
  videos: VideoItem[];
  isLiveApi: boolean;
  totalResults: number;
  source: 'YouTube Data API v3' | 'Benchmark Intelligence Demo';
  error?: string;
  quotaWarning?: boolean;
}

export const YouTubeService = {
  /**
   * Check if server has YOUTUBE_API_KEY environment variable configured
   */
  async checkServerStatus(): Promise<{ hasServerKey: boolean }> {
    try {
      const res = await fetch('/api/youtube/status');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    return { hasServerKey: false };
  },

  /**
   * Test connection to YouTube Data API v3 via server proxy
   */
  async testApiKey(apiKey: string): Promise<{ success: boolean; message: string; sampleTitle?: string; isQuotaExceeded?: boolean }> {
    if (!apiKey || apiKey.trim().length < 15) {
      return { success: false, message: 'API key is too short or invalid format (Google API keys are ~39 characters).' };
    }

    try {
      const response = await fetch('/api/youtube/test-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-YouTube-Key': apiKey.trim(),
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await response.json();
      return {
        success: Boolean(data.success),
        message: data.message || (data.success ? 'Connected successfully to YouTube Data API v3.' : 'Failed to connect.'),
        sampleTitle: data.sampleTitle,
        isQuotaExceeded: Boolean(data.isQuotaExceeded),
      };
    } catch (err: unknown) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Network error testing YouTube API key',
      };
    }
  },

  /**
   * Query videos with current filter state
   */
  async getVideos(filters: FilterState): Promise<FetchResult> {
    const config = StorageService.getYouTubeConfig();
    const clientKey = config.apiKey ? config.apiKey.trim() : '';

    // If client key is saved or server has YOUTUBE_API_KEY, call the server proxy
    try {
      const proxyResult = await this.queryServerYouTubeProxy(clientKey, filters);
      if (proxyResult) {
        return proxyResult;
      }
    } catch (err) {
      console.warn('Server YouTube query proxy failed, falling back to benchmark dataset:', err);
    }

    // Default fallback: Benchmark dataset
    return this.queryDemoDataset(filters);
  },

  /**
   * Call server-side proxy endpoint /api/youtube/search
   */
  async queryServerYouTubeProxy(clientKey: string, filters: FilterState): Promise<FetchResult | null> {
    const regionCode = REGION_CODES[filters.market];
    const catDetail = CATEGORY_DETAILS[filters.category];
    const categoryId = catDetail?.id;

    // Calculate publishedAfter ISO
    let publishedAfter: string | undefined = undefined;
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const hoursMap: Record<string, number> = {
        '24h': 24,
        '48h': 48,
        '7d': 168,
        '30d': 720,
        '90d': 2160,
      };
      const hours = hoursMap[filters.dateRange] || 168;
      publishedAfter = new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
    }

    // Map format
    let videoDuration: 'any' | 'short' | 'medium' | 'long' = 'any';
    if (filters.format === 'Shorts') {
      videoDuration = 'short';
    } else if (filters.format === 'Long-Form') {
      videoDuration = 'medium';
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (clientKey) {
      headers['X-YouTube-Key'] = clientKey;
    }

    // Dynamic search query matching category and country context
    let defaultQ = catDetail?.defaultQuery || 'viral trends';
    if (filters.category === 'Sports & Cricket' && (filters.market === 'Pakistan' || filters.market === 'India')) {
      defaultQ = 'cricket match highlights tournament sports';
    }

    const payload = {
      q: filters.searchQuery.trim() || undefined,
      regionCode,
      categoryId,
      categoryName: filters.category,
      publishedAfter,
      videoDuration,
      viewType: filters.viewType,
      isViralNow: filters.viewType === 'viral-now' || filters.sortBy === 'viewsPerHour',
      sortBy: filters.sortBy,
      market: filters.market,
      maxResults: 24,
    };

    const res = await fetch('/api/youtube/search', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      if (res.status === 404 || res.status === 405) {
        const fallback = this.queryDemoDataset(filters);
        return {
          ...fallback,
          error: 'Live YouTube API is not connected on this hosting deployment. Showing benchmark demo data.',
        };
      }
      if (res.status === 400 && errorData.error === 'NO_API_KEY') {
        // No key configured on server or client, use demo mode honestly
        return null;
      }
      if (res.status === 403 && errorData.error === 'QUOTA_EXCEEDED') {
        const fallback = this.queryDemoDataset(filters);
        return {
          ...fallback,
          quotaWarning: true,
          error: errorData.message || 'YouTube Data API daily quota limit reached (10,000 units/day). Operating in benchmark mode.',
        };
      }
      return {
        videos: [],
        totalResults: 0,
        isLiveApi: true,
        source: 'YouTube Data API v3',
        error: errorData.message || `YouTube API returned status HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    let fetchedVideos: VideoItem[] = data.videos || [];

    // Client-side format filtering guarantee
    if (filters.format === 'Shorts') {
      fetchedVideos = fetchedVideos.filter((v) => v.format === 'Shorts' || v.durationSeconds <= 60);
    } else if (filters.format === 'Long-Form') {
      fetchedVideos = fetchedVideos.filter((v) => v.format === 'Long-Form' || v.durationSeconds > 60);
    }

    // Channel tier filter
    if (filters.channelTier !== 'all') {
      fetchedVideos = fetchedVideos.filter((v) => v.channelTier === filters.channelTier);
    }

    // Score sort
    if (filters.sortBy === 'viewsPerHour') {
      fetchedVideos.sort((a, b) => b.viewsPerHour - a.viewsPerHour);
    } else if (filters.sortBy === 'outlierScore') {
      fetchedVideos.sort((a, b) => b.outlierScore - a.outlierScore);
    } else if (filters.sortBy === 'views') {
      fetchedVideos.sort((a, b) => b.views - a.views);
    } else if (filters.sortBy === 'publishedAt') {
      fetchedVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else {
      fetchedVideos.sort((a, b) => b.viralScore - a.viralScore);
    }

    return {
      videos: fetchedVideos,
      isLiveApi: true,
      totalResults: fetchedVideos.length,
      source: data.source || 'YouTube Data API v3',
      quotaWarning: Boolean(data.quotaWarning),
    };
  },

  /**
   * Demo intelligence query supporting all interactive filter slices
   */
  queryDemoDataset(filters: FilterState): FetchResult {
    let list = [...MOCK_VIDEOS];

    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.channelTitle.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category
    if (filters.category !== 'All') {
      list = list.filter((v) => v.category === filters.category);
    }

    // Market
    if (filters.market !== 'Global') {
      list = list.filter((v) => v.market === filters.market || v.market === 'Global');
    }

    // Format
    if (filters.format !== 'All') {
      list = list.filter((v) => v.format === filters.format);
    }

    // Channel tier
    if (filters.channelTier !== 'all') {
      list = list.filter((v) => v.channelTier === filters.channelTier);
    }

    // Min / max views
    if (filters.minViews > 0) {
      list = list.filter((v) => v.views >= filters.minViews);
    }
    if (filters.maxViews < 100000000) {
      list = list.filter((v) => v.views <= filters.maxViews);
    }

    // Min Viral & Outlier scores
    if (filters.minViralScore > 0) {
      list = list.filter((v) => v.viralScore >= filters.minViralScore);
    }
    if (filters.minOutlierScore > 1) {
      list = list.filter((v) => v.outlierScore >= filters.minOutlierScore);
    }

    // Sort by
    list.sort((a, b) => {
      switch (filters.sortBy) {
        case 'viralScore':
          return b.viralScore - a.viralScore;
        case 'outlierScore':
          return b.outlierScore - a.outlierScore;
        case 'views':
          return b.views - a.views;
        case 'viewsPerHour':
          return b.viewsPerHour - a.viewsPerHour;
        case 'publishedAt':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        default:
          return b.viralScore - a.viralScore;
      }
    });

    return {
      videos: list,
      isLiveApi: false,
      totalResults: list.length,
      source: 'Benchmark Intelligence Demo',
    };
  },
};
