import { ContentIdea, SavedVideoRecord, SavedTrendRecord, YouTubeApiConfig, MarketRegion } from '../types';
import { MOCK_CONTENT_IDEAS } from '../data/mockData';

const SAVED_VIDEOS_KEY = 'viralreader_saved_videos';
const SAVED_TRENDS_KEY = 'viralreader_saved_trends';
const SAVED_IDEAS_KEY = 'viralreader_saved_ideas';
const YOUTUBE_CONFIG_KEY = 'viralreader_youtube_config';
const USER_NICHE_KEY = 'viralreader_user_niche';
const USER_PREFS_KEY = 'viralreader_user_prefs';

export interface UserPreferences {
  defaultMarket: MarketRegion;
  theme: 'dark';
  enableAlerts: boolean;
  minOutlierNotification: number;
}

export const StorageService = {
  // Saved Videos
  getSavedVideos(): SavedVideoRecord[] {
    try {
      const data = localStorage.getItem(SAVED_VIDEOS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isSaved(videoId: string): boolean {
    const list = this.getSavedVideos();
    return list.some((item) => item.videoId === videoId);
  },

  toggleSaveVideo(videoId: string, tags: string[] = [], notes?: string): boolean {
    try {
      let list = this.getSavedVideos();
      const exists = list.some((item) => item.videoId === videoId);
      if (exists) {
        list = list.filter((item) => item.videoId !== videoId);
        localStorage.setItem(SAVED_VIDEOS_KEY, JSON.stringify(list));
        return false;
      } else {
        list.push({
          videoId,
          savedAt: new Date().toISOString(),
          tags,
          userNotes: notes,
        });
        localStorage.setItem(SAVED_VIDEOS_KEY, JSON.stringify(list));
        return true;
      }
    } catch {
      return false;
    }
  },

  // Saved Trends
  getSavedTrends(): SavedTrendRecord[] {
    try {
      const data = localStorage.getItem(SAVED_TRENDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleSaveTrend(trendId: string, trendName: string, category: string): boolean {
    try {
      let list = this.getSavedTrends();
      const exists = list.some((item) => item.trendId === trendId);
      if (exists) {
        list = list.filter((item) => item.trendId !== trendId);
        localStorage.setItem(SAVED_TRENDS_KEY, JSON.stringify(list));
        return false;
      } else {
        list.push({
          trendId,
          trendName,
          category,
          savedAt: new Date().toISOString(),
        });
        localStorage.setItem(SAVED_TRENDS_KEY, JSON.stringify(list));
        return true;
      }
    } catch {
      return false;
    }
  },

  // Content Ideas
  getSavedIdeas(): ContentIdea[] {
    try {
      const data = localStorage.getItem(SAVED_IDEAS_KEY);
      return data ? JSON.parse(data) : MOCK_CONTENT_IDEAS;
    } catch {
      return MOCK_CONTENT_IDEAS;
    }
  },

  saveIdea(idea: ContentIdea): void {
    try {
      const list = this.getSavedIdeas();
      const filtered = list.filter((i) => i.id !== idea.id);
      filtered.unshift({ ...idea, isSaved: true });
      localStorage.setItem(SAVED_IDEAS_KEY, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  },

  deleteIdea(ideaId: string): void {
    try {
      const list = this.getSavedIdeas();
      const filtered = list.filter((i) => i.id !== ideaId);
      localStorage.setItem(SAVED_IDEAS_KEY, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  },

  // YouTube API Config
  getYouTubeConfig(): YouTubeApiConfig {
    try {
      const data = localStorage.getItem(YOUTUBE_CONFIG_KEY);
      return data ? JSON.parse(data) : { apiKey: '', isConnected: false };
    } catch {
      return { apiKey: '', isConnected: false };
    }
  },

  saveYouTubeConfig(config: YouTubeApiConfig): void {
    try {
      localStorage.setItem(YOUTUBE_CONFIG_KEY, JSON.stringify(config));
    } catch {
      // ignore
    }
  },

  // User Niche settings
  getUserNiche(): { primaryNiche: string; keywords: string[]; competitors: string[] } {
    try {
      const data = localStorage.getItem(USER_NICHE_KEY);
      return data
        ? JSON.parse(data)
        : {
            primaryNiche: 'AI Tools & Tech Reviews',
            keywords: ['autonomous agents', 'coding tools', 'productivity', 'saas builder'],
            competitors: ['Tech Explorer', 'Dev Velocity', 'Visual Math Lab'],
          };
    } catch {
      return {
        primaryNiche: 'AI Tools & Tech Reviews',
        keywords: ['autonomous agents', 'coding tools', 'productivity', 'saas builder'],
        competitors: ['Tech Explorer', 'Dev Velocity', 'Visual Math Lab'],
      };
    }
  },

  saveUserNiche(nicheData: { primaryNiche: string; keywords: string[]; competitors: string[] }): void {
    try {
      localStorage.setItem(USER_NICHE_KEY, JSON.stringify(nicheData));
    } catch {
      // ignore
    }
  },

  // User Preferences
  getPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(USER_PREFS_KEY);
      return data
        ? JSON.parse(data)
        : {
            defaultMarket: 'Global',
            theme: 'dark',
            enableAlerts: true,
            minOutlierNotification: 3.5,
          };
    } catch {
      return {
        defaultMarket: 'Global',
        theme: 'dark',
        enableAlerts: true,
        minOutlierNotification: 3.5,
      };
    }
  },

  savePreferences(prefs: UserPreferences): void {
    try {
      localStorage.setItem(USER_PREFS_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  },
};
