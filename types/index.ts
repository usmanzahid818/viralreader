export type VideoFormat = 'Shorts' | 'Long-Form';

export type TrendStatus = 'Exploding' | 'Rising' | 'Steady' | 'Peaked';

export type MarketRegion =
  | 'Global'
  | 'United States'
  | 'Pakistan'
  | 'India'
  | 'United Kingdom'
  | 'Canada'
  | 'Australia'
  | 'UAE'
  | 'Saudi Arabia'
  | 'Bangladesh'
  | 'Indonesia'
  | 'Turkey'
  | 'South Korea';

export type CategoryName =
  | 'All'
  | 'Vlogs & Lifestyle'
  | 'AI Content & Tools'
  | 'Drama & TV'
  | 'Movies & Trailers'
  | 'Entertainment'
  | 'Gaming & Esports'
  | 'Technology & Software'
  | 'Education & Tutorials'
  | 'Business & Finance'
  | 'Comedy & Memes'
  | 'Music & Dance'
  | 'Sports & Cricket'
  | 'Food & Cooking'
  | 'Beauty & Fashion'
  | 'Health & Fitness'
  | 'Science & History'
  | 'News & Current Events'
  | 'Podcasts & Interviews'
  | 'Travel & Exploration';

export type ChannelTier = 'all' | 'small' | 'medium' | 'large';

export interface VideoItem {
  id: string;
  youtubeId: string;
  title: string;
  channelTitle: string;
  channelId: string;
  channelAvatar: string;
  channelSubscribers: number;
  channelTier: 'small' | 'medium' | 'large'; // small: <50k, medium: 50k-500k, large: >500k
  duration: string;
  durationSeconds: number;
  format: VideoFormat;
  publishedAt: string;
  relativeTime: string;
  views: number;
  likes: number;
  comments: number;
  viewsPerHour: number; // calculated lifetime average: views / hours since publish
  outlierScore: number; // ratio vs channel median views (e.g. 4.2 = 4.2x channel average)
  viralScore: number; // 0-100 composite formula (velocity + outlier + engagement)
  confidenceScore: number; // 0-100 based on data density
  trendStatus: TrendStatus;
  category: CategoryName;
  market: MarketRegion;
  thumbnail: string;
  originalUrl: string;
  tags: string[];
  hookSummary?: string;
  isSaved?: boolean;
}

export interface FilterState {
  searchQuery: string;
  market: MarketRegion;
  category: CategoryName;
  format: 'All' | VideoFormat;
  dateRange: '24h' | '48h' | '7d' | '30d' | '90d' | 'all';
  channelTier: ChannelTier;
  minViews: number;
  maxViews: number;
  minViralScore: number;
  minOutlierScore: number;
  sortBy: 'viralScore' | 'outlierScore' | 'views' | 'viewsPerHour' | 'publishedAt';
  viewType?: string;
}

export interface ContentIdea {
  id: string;
  title: string;
  titleOptions?: string[]; // 3 title options
  hook: string;
  angle: string;
  outline: string[];
  sceneBreakdown?: { scene: string; duration: string; visual: string; audio: string }[];
  format: VideoFormat;
  duration: string;
  targetAudience?: string;
  targetLanguage?: string;
  whyNow?: string;
  trendEvidence?: string;
  thumbnailConcept?: string;
  thumbnailText?: string; // 2-5 words
  keywords?: string[];
  descriptionOutline?: string;
  hashtags?: string[];
  suggestedUploadTime?: string;
  competitionLevel?: 'Low' | 'Medium' | 'High';
  competitionOpportunity?: string;
  estimatedOutlierPotential: string;
  tags: string[];
  category: string;
  isSaved?: boolean;
  notes?: string;
  createdAt: string;
}

export interface TrendCluster {
  id: string;
  name: string;
  category: CategoryName;
  videoCount: number;
  totalViews: number;
  avgViralScore: number;
  growthRate: number; // percentage
  status: 'Emerging' | 'Peak' | 'Cooling';
  topKeywords: string[];
  summary: string;
}

export interface SavedVideoRecord {
  videoId: string;
  savedAt: string;
  tags: string[];
  userNotes?: string;
}

export interface SavedTrendRecord {
  trendId: string;
  trendName: string;
  category: string;
  savedAt: string;
  userNotes?: string;
}

export interface YouTubeApiConfig {
  apiKey: string;
  isConnected: boolean;
  lastChecked?: string;
  quotaUsedEstimated?: number;
}

export interface TrendAnalysisResult {
  summary: string;
  supportingEvidence: string[];
  hypotheses: string[];
  formatPatterns: string[];
  competitionLevel: 'Low' | 'Medium' | 'High';
  competitionRationale: string;
  confidenceScore: number;
  confidenceLimitations: string;
  contentIdeas: {
    title: string;
    hook: string;
    outline: string[];
    format: VideoFormat;
    duration: string;
  }[];
}

export interface ScriptGenerationResult {
  title: string;
  targetDuration: string;
  format: VideoFormat;
  openingHook: string;
  retentionHooks: string[];
  scenes: {
    sceneNumber: number;
    timestamp: string;
    narration: string;
    visualCues: string;
    soundEffectCues: string;
    retentionTactic: string;
  }[];
  callToAction: string;
  pinnedComment: string;
}

export interface ThumbnailProject {
  id: string;
  videoTitle: string;
  format: '16:9' | '9:16';
  stylePreset: string;
  conceptSummary: string;
  focalSubject: string;
  facialExpression: string;
  contrastStrategy: string;
  colorPalette: { hex: string; label: string }[];
  textPlacement: string;
  textVariations: string[]; // 2-5 words punchy text
  backgroundAdvice: string;
  lightingAdvice: string;
  safeZoneNotes?: string;
  customOverlayText?: string;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  plan: 'free' | 'pro' | 'agency';
  planStatus: 'active' | 'trial' | 'expired';
  status?: 'active' | 'suspended';
  customAiCredits?: number;
  planExpiresAt?: string;
  emailVerified: boolean;
  createdAt: string;
  preferences: {
    defaultMarket: MarketRegion;
    primaryNiche: string;
    language: string;
    enableEmailAlerts: boolean;
  };
  usageToday: {
    date: string; // YYYY-MM-DD
    aiGenerations: number;
    trendAnalyses: number;
    thumbnails: number;
  };
}

export interface AdminOverviewStats {
  totalUsers: number;
  freeUsers: number;
  premiumUsers: number;
  totalAiGenerations: number;
  youtubeApiStatus: {
    isServerKeyConfigured: boolean;
    quotaUsedEstimated: number;
    quotaLimit: number;
    status: 'healthy' | 'warning' | 'quota_exhausted';
  };
  serverUptimeSeconds: number;
  activeCacheEntries: number;
}

export interface BillingConfig {
  provider: 'Lemon Squeezy';
  status: 'merchant_review' | 'sandbox' | 'live';
  merchantStoreId?: string;
  reviewNotice: string;
  plans: SubscriptionPlan[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnual?: number;
  description: string;
  targetAudience: string;
  features: string[];
  limitations: string[];
  isPopular?: boolean;
  status: 'available' | 'coming_soon';
}

export interface PlatformSettings {
  maintenanceMode: boolean;
  signupOpen: boolean;
  announcementBanner: {
    enabled: boolean;
    text: string;
    level: 'info' | 'warning' | 'alert';
  };
  adPlacements: {
    bannerEnabled: boolean;
    sponsorCardsEnabled: boolean;
    sponsorTitle: string;
    sponsorUrl: string;
    sponsorBadge: string;
  };
  defaultPlanLimits: {
    free: { ai: number; trend: number; thumbnail: number };
    pro: { ai: number; trend: number; thumbnail: number };
    agency: { ai: number; trend: number; thumbnail: number };
  };
}

export interface ModerationReport {
  id: string;
  videoId?: string;
  videoTitle?: string;
  reporterEmail: string;
  reason: string;
  reportedAt: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  notes?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  details: string;
  ip?: string;
}

