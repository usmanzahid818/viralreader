import express, { Request, Response, NextFunction } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '100kb' }));

// Initialize GoogleGenAI server-side with User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// USER DATABASE & AUTHENTICATION SUBSYSTEM
// -------------------------------------------------------------
interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  displayName: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  plan: 'free' | 'pro' | 'agency';
  planStatus: 'active' | 'trial' | 'expired';
  status?: 'active' | 'suspended';
  customAiCredits?: number;
  verificationCode?: string;
  resetToken?: string;
  resetTokenExpiry?: number;
  planExpiresAt?: string;
  emailVerified: boolean;
  createdAt: string;
  preferences: {
    defaultMarket: string;
    primaryNiche: string;
    language: string;
    enableEmailAlerts: boolean;
  };
  usageToday: {
    date: string;
    aiGenerations: number;
    trendAnalyses: number;
    thumbnails: number;
  };
  savedVideos: any[];
  savedTrends: any[];
  savedIdeas: any[];
  thumbnailProjects: any[];
}

interface AuditLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  details: string;
  ip?: string;
}

interface PlatformSettings {
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

interface ModerationReport {
  id: string;
  videoId?: string;
  videoTitle?: string;
  reporterEmail: string;
  reason: string;
  reportedAt: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  notes?: string;
}

const DB_FILE = path.join(process.env.DATA_DIR || __dirname, '.viralreader-db.json');
let usersDb: Map<string, StoredUser> = new Map();
let auditLogs: AuditLog[] = [];
let moderationReports: ModerationReport[] = [
  {
    id: 'rep-sample-1',
    videoId: 'sample-01',
    videoTitle: 'Deceptive Thumbnail Report',
    reporterEmail: 'creator-community@viralreader.com',
    reason: 'Misleading thumbnail metadata flag for review',
    reportedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'pending',
  },
];

let platformSettings: PlatformSettings = {
  maintenanceMode: false,
  signupOpen: true,
  announcementBanner: {
    enabled: true,
    text: 'Welcome to ViralReader — AI Viral Trend Coach for YouTube creators.',
    level: 'info',
  },
  adPlacements: {
    bannerEnabled: true,
    sponsorCardsEnabled: true,
    sponsorTitle: 'Level Up Your Packaging with Pro Viral Hooks',
    sponsorUrl: '#pricing',
    sponsorBadge: 'PARTNER',
  },
  defaultPlanLimits: {
    free: { ai: 5, trend: 15, thumbnail: 3 },
    pro: { ai: 100, trend: 500, thumbnail: 50 },
    agency: { ai: 500, trend: 2000, thumbnail: 200 },
  },
};

const sessionTokens = new Map<string, { userId: string; expiresAt: number }>();

async function sendTransactionalEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.warn('Transactional email not sent: configure RESEND_API_KEY and RESEND_FROM_EMAIL.');
    return false;
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  if (!response.ok) {
    console.error('Resend email delivery failed:', response.status);
    return false;
  }
  return true;
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.users)) {
        usersDb.clear();
        for (const u of data.users) {
          usersDb.set(u.id, u);
        }
      }
      if (Array.isArray(data.auditLogs)) {
        auditLogs = data.auditLogs;
      }
      if (data.platformSettings) {
        platformSettings = { ...platformSettings, ...data.platformSettings };
      }
      if (Array.isArray(data.moderationReports)) {
        moderationReports = data.moderationReports;
      }
    }
  } catch (err) {
    console.warn('Failed to load user database from disk, initializing fresh:', err);
  }

  // Admin bootstrap is intentionally disabled unless explicit deployment secrets are provided.
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  if (adminEmail && adminPassword.length >= 12) {
    const existingAdmin = Array.from(usersDb.values()).find((u) => u.email.toLowerCase() === adminEmail);
    if (!existingAdmin) {
      const salt = crypto.randomBytes(16).toString('hex');
      const adminUser: StoredUser = {
        id: `usr-admin-${crypto.randomBytes(8).toString('hex')}`,
        email: adminEmail,
        displayName: 'Platform Admin',
        passwordHash: hashPassword(adminPassword, salt),
        salt,
        role: 'admin',
        plan: 'pro',
        planStatus: 'active',
        status: 'active',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        preferences: {
          defaultMarket: 'Global',
          primaryNiche: 'YouTube General Trends',
          language: 'English',
          enableEmailAlerts: true,
        },
        usageToday: { date: getTodayString(), aiGenerations: 0, trendAnalyses: 0, thumbnails: 0 },
        savedVideos: [],
        savedTrends: [],
        savedIdeas: [],
        thumbnailProjects: [],
      };
      usersDb.set(adminUser.id, adminUser);
      saveDatabase();
    }
  }
}

function saveDatabase() {
  try {
    const data = {
      users: Array.from(usersDb.values()),
      auditLogs,
      platformSettings,
      moderationReports,
      lastSaved: new Date().toISOString(),
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to write database to disk:', err);
  }
}

loadDatabase();

// Clean sanitize user for client response (no hash or salt)
function sanitizeUser(u: StoredUser) {
  const today = getTodayString();
  if (u.usageToday.date !== today) {
    u.usageToday = {
      date: today,
      aiGenerations: 0,
      trendAnalyses: 0,
      thumbnails: 0,
    };
    saveDatabase();
  }

  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    role: u.role,
    plan: u.plan,
    planStatus: u.planStatus,
    status: u.status || 'active',
    customAiCredits: u.customAiCredits || 0,
    planExpiresAt: u.planExpiresAt,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt,
    preferences: u.preferences,
    usageToday: u.usageToday,
  };
}

// Session authentication helper
function getUserFromRequest(req: Request): StoredUser | null {
  const authHeader = req.header('Authorization') || req.header('X-Auth-Token');
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const session = sessionTokens.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessionTokens.delete(token);
    return null;
  }
  const user = usersDb.get(session.userId) || null;
  if (user && user.status === 'suspended') {
    return null; // Deny suspended accounts access
  }
  return user;
}

// Usage check helper (returns true if allowed, false if limit reached)
function checkAndConsumeUsage(user: StoredUser | null, type: 'ai' | 'trend' | 'thumbnail'): { allowed: boolean; remaining: number; maxLimit: number } {
  // If no user is logged in, treat as free guest
  const plan = user?.plan || 'free';
  const today = getTodayString();
  
  if (user && user.usageToday.date !== today) {
    user.usageToday = { date: today, aiGenerations: 0, trendAnalyses: 0, thumbnails: 0 };
  }

  const limits = {
    free: { ai: 5, trend: 15, thumbnail: 3 },
    pro: { ai: 100, trend: 500, thumbnail: 50 },
    agency: { ai: 500, trend: 2000, thumbnail: 200 },
  };

  const planLimits = platformSettings.defaultPlanLimits[plan] || { ai: 5, trend: 15, thumbnail: 3 };
  const currentCount = user
    ? type === 'ai'
      ? user.usageToday.aiGenerations
      : type === 'trend'
      ? user.usageToday.trendAnalyses
      : user.usageToday.thumbnails
    : 0;

  const bonusCredits = (type === 'ai' && user?.customAiCredits) ? user.customAiCredits : 0;
  const maxLimit = planLimits[type] + bonusCredits;

  if (currentCount >= maxLimit) {
    return { allowed: false, remaining: 0, maxLimit };
  }

  if (user) {
    if (type === 'ai') user.usageToday.aiGenerations++;
    else if (type === 'trend') user.usageToday.trendAnalyses++;
    else user.usageToday.thumbnails++;
    saveDatabase();
  }

  return { allowed: true, remaining: maxLimit - (currentCount + 1), maxLimit };
}

// -------------------------------------------------------------
// AUTH & USER ROUTES
// -------------------------------------------------------------
app.post('/api/auth/signup', (req: Request, res: Response) => {
  if (!platformSettings.signupOpen) {
    return res.status(403).json({ error: 'Registrations are temporarily paused by administrators.' });
  }

  const { email, password, displayName } = req.body;
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Valid email and password required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  for (const u of usersDb.values()) {
    if (u.email.toLowerCase() === cleanEmail) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
  }

  // Public signup can never grant administrator privileges.
  const isInitialAdmin = false;

  const salt = crypto.randomBytes(16).toString('hex');
  const verificationCode = crypto.randomInt(100000, 1000000).toString();

  const newUser: StoredUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    email: cleanEmail,
    displayName: (displayName && displayName.trim()) || cleanEmail.split('@')[0],
    passwordHash: hashPassword(password, salt),
    salt,
    role: isInitialAdmin ? 'admin' : 'user',
    plan: isInitialAdmin ? 'pro' : 'free',
    planStatus: 'active',
    status: 'active',
    emailVerified: isInitialAdmin,
    verificationCode,
    createdAt: new Date().toISOString(),
    preferences: {
      defaultMarket: 'Global',
      primaryNiche: 'YouTube General Trends',
      language: 'English',
      enableEmailAlerts: true,
    },
    usageToday: {
      date: getTodayString(),
      aiGenerations: 0,
      trendAnalyses: 0,
      thumbnails: 0,
    },
    savedVideos: [],
    savedTrends: [],
    savedIdeas: [],
    thumbnailProjects: [],
  };

  usersDb.set(newUser.id, newUser);
  saveDatabase();

  const token = `tok_${crypto.randomBytes(32).toString('hex')}`;
  sessionTokens.set(token, { userId: newUser.id, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 });

  return res.json({
    success: true,
    token,
    user: sanitizeUser(newUser),
    verificationCode: undefined,
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  let foundUser: StoredUser | null = null;
  for (const u of usersDb.values()) {
    if (u.email.toLowerCase() === cleanEmail) {
      foundUser = u;
      break;
    }
  }

  if (!foundUser) {
    return res.status(401).json({ error: 'Invalid credentials. Account not found.' });
  }

  if (foundUser.status === 'suspended') {
    return res.status(403).json({ error: 'This account has been suspended by a platform administrator.' });
  }

  const checkHash = hashPassword(password, foundUser.salt);
  if (checkHash !== foundUser.passwordHash) {
    return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
  }

  const token = `tok_${crypto.randomBytes(32).toString('hex')}`;
  sessionTokens.set(token, { userId: foundUser.id, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 });

  return res.json({
    success: true,
    token,
    user: sanitizeUser(foundUser),
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated or session expired.' });
  }
  return res.json({
    user: sanitizeUser(user),
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.header('Authorization') || req.header('X-Auth-Token');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    sessionTokens.delete(token);
  }
  return res.json({ success: true, message: 'Signed out successfully.' });
});

app.post('/api/auth/update-profile', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { displayName, avatarUrl, preferences } = req.body;
  if (displayName && typeof displayName === 'string') user.displayName = displayName.trim();
  if (avatarUrl && typeof avatarUrl === 'string') user.avatarUrl = avatarUrl;
  if (preferences && typeof preferences === 'object') {
    user.preferences = { ...user.preferences, ...preferences };
  }

  saveDatabase();
  return res.json({ success: true, user: sanitizeUser(user) });
});

app.post('/api/auth/send-verification', async (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required to send verification code.' });
  }

  const code = crypto.randomInt(100000, 1000000).toString();
  user.verificationCode = code;
  saveDatabase();
  const sent = await sendTransactionalEmail(
    user.email,
    'Verify your ViralReader email',
    `<p>Your ViralReader verification code is <strong>${code}</strong>.</p><p>This code is for your account only.</p>`
  );
  if (!sent) return res.status(503).json({ error: 'Email delivery is not configured. Please try again later.' });
  return res.json({ success: true, message: 'Verification email sent. Check your inbox.' });
});

app.post('/api/auth/verify-email', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const { code } = req.body;
  if (!code || code !== user.verificationCode) {
    return res.status(400).json({ error: 'Invalid verification code. Please check and try again.' });
  }

  user.emailVerified = true;
  user.verificationCode = undefined;
  saveDatabase();

  return res.json({
    success: true,
    message: 'Email address successfully verified.',
    user: sanitizeUser(user),
  });
});

app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  let found: StoredUser | null = null;
  for (const u of usersDb.values()) {
    if (u.email.toLowerCase() === cleanEmail) {
      found = u;
      break;
    }
  }

  if (found) {
    const token = crypto.randomBytes(32).toString('hex');
    found.resetToken = crypto.createHash('sha256').update(token).digest('hex');
    found.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    saveDatabase();
    const baseUrl = (process.env.APP_URL || '').replace(/\/$/, '');
    const resetUrl = `${baseUrl}/?resetToken=${encodeURIComponent(token)}&email=${encodeURIComponent(cleanEmail)}`;
    await sendTransactionalEmail(
      cleanEmail,
      'Reset your ViralReader password',
      `<p>We received a request to reset your ViralReader password.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 15 minutes. If you did not request this, ignore this email.</p>`
    );
  }

  return res.json({
    success: true,
    message: 'If an account exists for this email, password reset instructions will be sent if email delivery is configured.',
  });
});

app.post('/api/auth/confirm-reset-password', (req: Request, res: Response) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) {
    return res.status(400).json({ error: 'Email, reset token, and new password required.' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  let found: StoredUser | null = null;
  for (const u of usersDb.values()) {
    if (u.email.toLowerCase() === cleanEmail) {
      found = u;
      break;
    }
  }

  if (!found || found.resetToken !== crypto.createHash('sha256').update(String(token)).digest('hex') || !found.resetTokenExpiry || Date.now() > found.resetTokenExpiry) {
    return res.status(400).json({ error: 'Invalid or expired password reset token.' });
  }

  found.salt = crypto.randomBytes(16).toString('hex');
  found.passwordHash = hashPassword(newPassword, found.salt);
  for (const [sessionToken, session] of sessionTokens.entries()) if (session.userId === found.id) sessionTokens.delete(sessionToken);
  found.resetToken = undefined;
  found.resetTokenExpiry = undefined;
  saveDatabase();

  return res.json({
    success: true,
    message: 'Password has been successfully updated. You may now sign in.',
  });
});

app.delete('/api/auth/delete-account', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  if (user.role === 'admin' && Array.from(usersDb.values()).filter((u) => u.role === 'admin').length <= 1) {
    return res.status(400).json({ error: 'Cannot delete the primary platform administrator account.' });
  }

  usersDb.delete(user.id);
  saveDatabase();
  return res.json({ success: true, message: 'Account and associated private data permanently deleted.' });
});

// -------------------------------------------------------------
// PER-USER SAVED DATA ROUTES
// -------------------------------------------------------------
app.get('/api/user/saved-data', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  return res.json({
    savedVideos: user.savedVideos || [],
    savedTrends: user.savedTrends || [],
    savedIdeas: user.savedIdeas || [],
    thumbnailProjects: user.thumbnailProjects || [],
  });
});

app.post('/api/user/save-item', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { itemType, item } = req.body;
  if (!itemType || !item) {
    return res.status(400).json({ error: 'itemType and item required.' });
  }

  if (itemType === 'video') {
    user.savedVideos = user.savedVideos || [];
    const exists = user.savedVideos.some((v) => v.id === item.id || v.videoId === item.videoId);
    if (!exists) user.savedVideos.unshift(item);
  } else if (itemType === 'trend') {
    user.savedTrends = user.savedTrends || [];
    const exists = user.savedTrends.some((t) => t.id === item.id || t.trendId === item.trendId);
    if (!exists) user.savedTrends.unshift(item);
  } else if (itemType === 'idea') {
    user.savedIdeas = user.savedIdeas || [];
    const exists = user.savedIdeas.some((i) => i.id === item.id);
    if (!exists) user.savedIdeas.unshift(item);
  } else if (itemType === 'thumbnail') {
    user.thumbnailProjects = user.thumbnailProjects || [];
    const exists = user.thumbnailProjects.some((p) => p.id === item.id);
    if (!exists) user.thumbnailProjects.unshift(item);
  }

  saveDatabase();
  return res.json({ success: true });
});

app.delete('/api/user/delete-item', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { itemType, itemId } = req.body;
  if (itemType === 'video') {
    user.savedVideos = (user.savedVideos || []).filter((v) => v.id !== itemId && v.videoId !== itemId);
  } else if (itemType === 'trend') {
    user.savedTrends = (user.savedTrends || []).filter((t) => t.id !== itemId && t.trendId !== itemId);
  } else if (itemType === 'idea') {
    user.savedIdeas = (user.savedIdeas || []).filter((i) => i.id !== itemId);
  } else if (itemType === 'thumbnail') {
    user.thumbnailProjects = (user.thumbnailProjects || []).filter((p) => p.id !== itemId);
  }

  saveDatabase();
  return res.json({ success: true });
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// AI Trend Analysis endpoint
app.post('/api/gemini/analyze', async (req: Request, res: Response) => {
  try {
    const { videoTitle, channelName, category, views, publishDate, outlierScore, viralScore } = req.body;

    if (!process.env.GEMINI_API_KEY || !ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. AI Trend Analysis is in Demo Intelligence mode.',
      });
    }

    const prompt = `Analyze this YouTube viral trend data:
Title: "${videoTitle || 'Trending Topic'}"
Channel: "${channelName || 'Creator'}"
Category: "${category || 'General'}"
Views: ${views || 'Unknown'}
Published: ${publishDate || 'Recent'}
Outlier Score: ${outlierScore || 'N/A'}x channel median
Viral Score: ${viralScore || 'N/A'}/100

Provide a thorough, objective SaaS trend analysis.
Return valid JSON matching this schema:
{
  "summary": "1-2 sentence core trend summary",
  "supportingEvidence": ["evidence point 1", "evidence point 2", "evidence point 3"],
  "hypotheses": ["hypothesis 1 why this format or angle is resonating", "hypothesis 2 on viewer psychology or curiosity loop"],
  "formatPatterns": ["pattern 1 e.g. 3-second hook structure", "pattern 2 pacing/retention tactic"],
  "competitionLevel": "Low" | "Medium" | "High",
  "competitionRationale": "Clear explanation based on market saturation",
  "confidenceScore": 88,
  "confidenceLimitations": "Public API metric observation only; does not reflect private YouTube retention graphs",
  "contentIdeas": [
    {
      "title": "Suggested video title 1",
      "hook": "Opening 0-5s retention hook",
      "outline": ["Intro", "Core Tension", "Resolution/Takeaway"],
      "format": "Shorts" | "Long-Form",
      "duration": "45s" | "8-12 min"
    },
    {
      "title": "Suggested video title 2",
      "hook": "Opening hook",
      "outline": ["Intro", "Breakdown", "Conclusion"],
      "format": "Shorts" | "Long-Form",
      "duration": "60s" | "10-14 min"
    },
    {
      "title": "Suggested video title 3",
      "hook": "Opening hook",
      "outline": ["Hook", "Core demonstration", "Payoff"],
      "format": "Shorts" | "Long-Form",
      "duration": "50s" | "12-15 min"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            supportingEvidence: { type: Type.ARRAY, items: { type: Type.STRING } },
            hypotheses: { type: Type.ARRAY, items: { type: Type.STRING } },
            formatPatterns: { type: Type.ARRAY, items: { type: Type.STRING } },
            competitionLevel: { type: Type.STRING },
            competitionRationale: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            confidenceLimitations: { type: Type.STRING },
            contentIdeas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  hook: { type: Type.STRING },
                  outline: { type: Type.ARRAY, items: { type: Type.STRING } },
                  format: { type: Type.STRING },
                  duration: { type: Type.STRING },
                },
                required: ['title', 'hook', 'outline', 'format', 'duration'],
              },
            },
          },
          required: [
            'summary',
            'supportingEvidence',
            'hypotheses',
            'formatPatterns',
            'competitionLevel',
            'competitionRationale',
            'confidenceScore',
            'confidenceLimitations',
            'contentIdeas',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown AI error';
    console.error('Gemini trend analysis error:', errorMsg);
    return res.status(500).json({ error: errorMsg });
  }
});

// AI Content Ideas Studio endpoint (Comprehensive 14-Point Specification)
app.post('/api/gemini/generate-ideas', async (req: Request, res: Response) => {
  try {
    const user = getUserFromRequest(req);
    const usageCheck = checkAndConsumeUsage(user, 'ai');
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: `Daily AI Generation limit reached for your ${user?.plan || 'free'} tier (${usageCheck.maxLimit} ideas/day). Upgrade to Pro for high-throughput ideation.`,
        limitExceeded: true,
      });
    }

    const {
      niche,
      topic,
      format,
      targetAudience,
      targetLanguage = 'English',
      country = 'Global',
      contentType = 'standard',
    } = req.body;

    if (!process.env.GEMINI_API_KEY || !ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
      });
    }

    const prompt = `You are the lead YouTube strategist and viral algorithm expert for ViralReader.
Generate 4-5 high-converting, original video recommendations tailored for:
Niche: ${niche || 'Technology & Creator Economy'}
Specific Topic / Context: ${topic || 'Trending formats'}
Format Preference: ${format || 'Any (Shorts or Long-Form)'}
Target Audience: ${targetAudience || 'Active YouTube viewers'}
Target Language: ${targetLanguage}
Target Country/Market: ${country}
Content Mode: ${contentType} (e.g. AI Shorts, AI Storytelling, Animation, Tutorial, Faceless, Vlog, Commentary)

For EVERY single recommendation, you MUST provide ALL 14 core creator attributes:
1. title: Primary high-CTR title
2. titleOptions: Exactly 3 distinct title variations (A/B/C testing alternatives)
3. hook: The exact spoken and visual opening hook for the first 3-10 seconds
4. angle: What makes this topic interesting and differentiated
5. whyNow: Explanation of which observable public trend inspired this
6. trendEvidence: Observable public metric signals or search velocity
7. outline: Step-by-step structural outline (4-6 steps)
8. thumbnailConcept: Compelling visual thumbnail concept with focal placement & emotional expression
9. thumbnailText: Short readable thumbnail text, strictly 2-5 words
10. format: "Shorts" | "Long-Form"
11. duration: Target length (e.g. "50s" or "9-12 min")
12. keywords: 5-8 high-relevance search keywords
13. descriptionOutline: SEO-optimized description snippet with chapter markers
14. hashtags: 3-5 relevant hashtags
15. suggestedUploadTime: Best testable upload time window in the target audience's timezone (explicitly stated as a testable recommendation, not an official guarantee)
16. competitionLevel: "Low" | "Medium" | "High"
17. competitionOpportunity: Actionable hypothesis creator can test
18. estimatedOutlierPotential: Estimated multiplier (e.g. "4.2x")

Return valid JSON:
{
  "ideas": [
    {
      "id": "idea-1",
      "title": "Title here",
      "titleOptions": ["Variation 1", "Variation 2", "Variation 3"],
      "hook": "Word-for-word opening 3-10s hook",
      "angle": "Strategic narrative angle",
      "whyNow": "Public trend context",
      "trendEvidence": "Public engagement pattern",
      "outline": ["0:00-0:15 Cold Hook", "0:15-2:00 Inciting Conflict", "2:00-5:00 Resolution"],
      "thumbnailConcept": "Visual composition and subject focus",
      "thumbnailText": "2-5 Words Text",
      "format": "Shorts" or "Long-Form",
      "duration": "Duration string",
      "targetAudience": "${targetAudience}",
      "targetLanguage": "${targetLanguage}",
      "keywords": ["keyword 1", "keyword 2", "keyword 3"],
      "descriptionOutline": "Clear description outline",
      "hashtags": ["#tag1", "#tag2", "#tag3"],
      "suggestedUploadTime": "e.g. 5:30 PM PKT / 8:30 AM EST (Testable recommendation)",
      "competitionLevel": "Low" | "Medium" | "High",
      "competitionOpportunity": "Clear opportunity hypothesis",
      "estimatedOutlierPotential": "High (3.8x)",
      "tags": ["tag1", "tag2"]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{"ideas": []}');
    const ideasList = Array.isArray(parsed.ideas) ? parsed.ideas : (Array.isArray(parsed) ? parsed : []);
    
    return res.json({
      ideas: ideasList.map((item: any, idx: number) => ({
        ...item,
        id: item.id || `gen-${Date.now()}-${idx}`,
        category: niche || 'General',
        createdAt: new Date().toISOString(),
      })),
      usageRemaining: usageCheck.remaining,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown AI generation error';
    return res.status(500).json({ error: errorMsg });
  }
});

// Full Script Generator endpoint
app.post('/api/gemini/generate-full-script', async (req: Request, res: Response) => {
  try {
    const user = getUserFromRequest(req);
    const usageCheck = checkAndConsumeUsage(user, 'ai');
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: `Daily AI Generation limit reached. Upgrade to Pro for unlimited script writing.`,
      });
    }

    const { title, hook, outline, format = 'Long-Form', duration = '8-10 min', audience, tone = 'High Pacing & Engaging' } = req.body;

    if (!process.env.GEMINI_API_KEY || !ai) {
      return res.status(503).json({ error: 'Gemini API is not configured on the server.' });
    }

    const prompt = `Write a complete, broadcast-ready YouTube script for:
Title: "${title}"
Format: ${format}
Target Duration: ${duration}
Opening Hook Context: "${hook}"
Outline: ${JSON.stringify(outline || [])}
Target Audience: ${audience || 'Engaged YouTube Viewers'}
Tone: ${tone}

Provide a detailed scene-by-scene script structured as JSON matching:
{
  "title": "${title}",
  "targetDuration": "${duration}",
  "format": "${format}",
  "openingHook": "Word-for-word 0-10s cold open",
  "retentionHooks": ["Retention tactic at 30s", "Midpoint cliffhanger loop", "Final reveal bait"],
  "scenes": [
    {
      "sceneNumber": 1,
      "timestamp": "0:00 - 0:15",
      "narration": "Exact word-for-word script spoken by host or voiceover",
      "visualCues": "Detailed camera angle, B-roll, on-screen text, animation",
      "soundEffectCues": "Whoosh, riser, ambient music shift, drop",
      "retentionTactic": "Curiosity gap or visual contradiction"
    }
  ],
  "callToAction": "Natural mid-roll or end-screen call to action without killing retention",
  "pinnedComment": "Engaging community-building question for the pinned comment"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to generate script';
    return res.status(500).json({ error: errorMsg });
  }
});

// Thumbnail Brief & Strategy Generator endpoint
app.post('/api/gemini/generate-thumbnail-brief', async (req: Request, res: Response) => {
  try {
    const user = getUserFromRequest(req);
    const usageCheck = checkAndConsumeUsage(user, 'thumbnail');
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: `Daily Thumbnail Studio limit reached for your ${user?.plan || 'free'} tier. Upgrade to Pro for expanded thumbnail design projects.`,
      });
    }

    const { videoTitle, category = 'General', audience, stylePreset = 'Dramatic Contrast', format = '16:9' } = req.body;

    if (!process.env.GEMINI_API_KEY || !ai) {
      return res.status(503).json({ error: 'Gemini API is not configured on the server.' });
    }

    const prompt = `Act as an elite YouTube Thumbnail Director (packaging expert for MrBeast, Vox, and top viral creators).
Design a comprehensive custom thumbnail strategy for:
Video Title: "${videoTitle}"
Category: ${category}
Audience: ${audience || 'YouTube Viewers'}
Style Preset: ${stylePreset}
Format: ${format} (16:9 Landscape or 9:16 Vertical Shorts)

Generate high-contrast, clickable packaging specifications as JSON:
{
  "conceptSummary": "1-2 sentence core concept explaining the visual curiosity contradiction",
  "focalSubject": "The main foreground subject (person, physical object, or visual anchor)",
  "facialExpression": "Exact human facial expression or emotional trigger (e.g. shock with squinted skepticism, intense focus)",
  "contrastStrategy": "How foreground pops off the background (e.g. bright cyan rim lighting against dark deep navy background)",
  "colorPalette": [
    { "hex": "#070D18", "label": "Deep Navy Background" },
    { "hex": "#6D3DF5", "label": "Electric Violet Glow" },
    { "hex": "#FF3366", "label": "High-Alert Accent" },
    { "hex": "#FFFFFF", "label": "Bold White Text" }
  ],
  "textPlacement": "Where text sits (e.g. Top-left quadrant, strictly away from bottom-right timestamp)",
  "textVariations": [
    "2-5 words text option 1",
    "2-5 words text option 2",
    "2-5 words text option 3"
  ],
  "backgroundAdvice": "Specific background detail (e.g. clean blurred laboratory with subtle red warning light)",
  "lightingAdvice": "Edge lighting, rim lights, and shadow drops",
  "safeZoneNotes": "Avoid bottom-right 20% timestamp on 16:9; keep critical elements in center 80% on 9:16 Shorts",
  "canvasConfig": {
    "backgroundColor": "#0A111F",
    "accentColor": "#6D3DF5",
    "defaultText": "DON'T DO THIS"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      ...parsed,
      id: `thumb-${Date.now()}`,
      videoTitle,
      format,
      stylePreset,
      createdAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to generate thumbnail brief';
    return res.status(500).json({ error: errorMsg });
  }
});

// -------------------------------------------------------------
// BILLING & SUBSCRIPTIONS (LEMON SQUEEZY STATUS & CHECKOUT)
// -------------------------------------------------------------
app.get('/api/billing/status', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  return res.json({
    provider: 'Lemon Squeezy',
    status: 'merchant_review',
    isLive: false,
    reviewNotice: 'Merchant account is currently under review by Lemon Squeezy. Subscriptions and card processing will activate upon final merchant approval.',
    userPlan: user?.plan || 'free',
    userPlanStatus: user?.planStatus || 'active',
  });
});

app.post('/api/billing/create-checkout', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  const { planId } = req.body;

  // We honestly disclose merchant review status instead of fake charging
  return res.json({
    success: false,
    status: 'merchant_review',
    planId: planId || 'pro-monthly',
    message: 'Lemon Squeezy merchant approval is currently in progress. Subscriptions are temporarily paused until verification completes. All current users have access to generous Free creator quotas.',
  });
});

app.post('/api/billing/webhook', (req: Request, res: Response) => {
  // Webhook listener with HMAC verification readiness
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  const signature = req.header('X-Signature');

  if (secret && signature) {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(JSON.stringify(req.body)).digest('hex'), 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');
    if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
      return res.status(403).json({ error: 'Invalid webhook signature.' });
    }
  }

  return res.json({ received: true });
});

// -------------------------------------------------------------
// SECURE ADMIN PANEL ROUTES
// -------------------------------------------------------------
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrative authorization required.' });
  }
  next();
}

app.get('/api/admin/overview', requireAdmin, (req: Request, res: Response) => {
  const allUsers = Array.from(usersDb.values());
  const freeUsers = allUsers.filter((u) => u.plan === 'free').length;
  const premiumUsers = allUsers.filter((u) => u.plan !== 'free').length;
  const totalGenerations = allUsers.reduce((acc, u) => acc + (u.usageToday?.aiGenerations || 0), 0);

  return res.json({
    totalUsers: allUsers.length,
    freeUsers,
    premiumUsers,
    totalAiGenerations: totalGenerations,
    youtubeApiStatus: {
      isServerKeyConfigured: Boolean(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY.length > 10),
      quotaUsedEstimated: 1420,
      quotaLimit: 10000,
      status: 'healthy',
    },
    serverUptimeSeconds: Math.floor(process.uptime()),
    activeCacheEntries: searchCache.size,
  });
});

app.get('/api/admin/users', requireAdmin, (req: Request, res: Response) => {
  const allUsers = Array.from(usersDb.values()).map(sanitizeUser);
  return res.json({ users: allUsers });
});

app.post('/api/admin/update-user-plan', requireAdmin, (req: Request, res: Response) => {
  const admin = getUserFromRequest(req);
  const { targetUserId, newPlan } = req.body;
  const target = usersDb.get(targetUserId);

  if (!target) {
    return res.status(404).json({ error: 'Target user not found.' });
  }

  target.plan = newPlan;
  target.planStatus = 'active';
  saveDatabase();

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    adminEmail: admin?.email || 'admin',
    action: 'UPDATE_PLAN',
    details: `Updated user ${target.email} plan to ${newPlan}`,
  });
  saveDatabase();

  return res.json({ success: true, user: sanitizeUser(target) });
});

app.get('/api/admin/audit-logs', requireAdmin, (req: Request, res: Response) => {
  return res.json({ logs: auditLogs });
});

// -------------------------------------------------------------
// SEO & PUBLIC DISCOVERY ROUTES
// -------------------------------------------------------------
app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Sitemap: https://viralreader.com/sitemap.xml
`);
});

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  res.type('application/xml');
  const now = new Date().toISOString().slice(0, 10);
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://viralreader.com/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://viralreader.com/pricing</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://viralreader.com/privacy</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://viralreader.com/terms</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`);
});


// Helper to parse ISO 8601 duration string (e.g. PT4M13S)
function parseDurationToSeconds(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

function formatDurationSeconds(totalSec: number): string {
  if (totalSec <= 0) return 'Unavailable';
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  } catch {
    return 'Recently';
  }
}

// Check server-side YouTube API status
app.get('/api/youtube/status', (_req: Request, res: Response) => {
  res.json({
    hasServerKey: Boolean(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY.trim().length > 10),
  });
});

// Test connection to YouTube Data API v3
app.post('/api/youtube/test-key', async (req: Request, res: Response) => {
  try {
    const providedKey = req.body?.apiKey?.trim() || req.header('X-YouTube-Key') || process.env.YOUTUBE_API_KEY;

    if (!providedKey || providedKey.length < 15) {
      return res.status(400).json({
        success: false,
        message: 'No valid YouTube Data API key provided.',
      });
    }

    const testUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=1&key=${encodeURIComponent(
      providedKey
    )}`;
    const ytRes = await fetch(testUrl);
    const data = await ytRes.json();

    if (!ytRes.ok) {
      const reason = data.error?.errors?.[0]?.reason || '';
      if (reason === 'quotaExceeded') {
        return res.status(403).json({
          success: false,
          isQuotaExceeded: true,
          message: 'Key is valid, but the daily YouTube Data API quota has been exceeded (10,000 units/day limit).',
        });
      }
      return res.status(ytRes.status).json({
        success: false,
        message: data.error?.message || `YouTube API returned error (HTTP ${ytRes.status})`,
      });
    }

    const sampleTitle = data.items?.[0]?.snippet?.title || 'YouTube Data API Connected';
    return res.json({
      success: true,
      message: 'Verified connection to official Google YouTube Data API v3.',
      sampleTitle,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network error testing API key';
    return res.status(500).json({ success: false, message: errorMsg });
  }
});

// In-memory cache structures for YouTube queries and channel metadata
interface CacheEntry {
  videos: any[];
  totalResults: number;
  timestamp: number;
  source: string;
}

const SEARCH_CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes
const CHANNEL_CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

const searchCache = new Map<string, CacheEntry>();
const lastKnownGood = new Map<string, any[]>();
const channelCache = new Map<string, { avatarUrl: string; subscriberCount: number | null; timestamp: number }>();

// Map YouTube numerical category ID back to ViralReader CategoryName
const YOUTUBE_CAT_ID_TO_NAME: Record<string, string> = {
  '1': 'Movies & Trailers',
  '2': 'Technology & Software',
  '10': 'Music & Dance',
  '15': 'Pets & Animals',
  '17': 'Sports & Cricket',
  '19': 'Travel & Exploration',
  '20': 'Gaming & Esports',
  '22': 'Vlogs & Lifestyle',
  '23': 'Comedy & Memes',
  '24': 'Entertainment',
  '25': 'News & Current Events',
  '26': 'Food & Cooking',
  '27': 'Education & Tutorials',
  '28': 'Technology & Software',
};

// Comprehensive regional discovery rules by Category
interface CategoryRule {
  catId?: string;
  regionalQueries: Record<string, string>;
  defaultQuery: string;
  supportPopularChart: boolean;
}

const CATEGORY_DISCOVERY_RULES: Record<string, CategoryRule> = {
  'Vlogs & Lifestyle': {
    catId: '22',
    regionalQueries: {
      PK: 'pakistani family vlog daily vlog travel lifestyle routine',
      IN: 'daily vlog family vlog lifestyle travel routine',
      US: 'day in the life daily vlog lifestyle travel routine',
      GB: 'daily vlog london uk lifestyle travel routine',
      AE: 'dubai vlog lifestyle travel routine luxury',
    },
    defaultQuery: 'daily vlog day in the life lifestyle travel routine',
    supportPopularChart: true,
  },
  'AI Content & Tools': {
    catId: '28',
    regionalQueries: {
      US: 'AI tools artificial intelligence ChatGPT Claude agent automation tutorial 2026',
      PK: 'AI tools artificial intelligence ChatGPT automation earning tutorial',
      IN: 'AI tools artificial intelligence ChatGPT Claude agent automation tutorial',
    },
    defaultQuery: 'AI tools artificial intelligence ChatGPT Claude agent automation tutorial 2026',
    supportPopularChart: false,
  },
  'Drama & TV': {
    catId: '24',
    regionalQueries: {
      PK: 'pakistani drama episode teaser promo ost 2026',
      IN: 'hindi serial drama episode promo teaser web series 2026',
      US: 'drama series episode trailer recap season review',
      GB: 'drama series episode trailer recap bbc itv season',
      AE: 'arabic drama series episode promo teaser trailer',
    },
    defaultQuery: 'drama series episode teaser promo trailer recap',
    supportPopularChart: true,
  },
  'Movies & Trailers': {
    catId: '1',
    regionalQueries: {
      PK: 'official movie trailer teaser film promo 2025 2026',
      IN: 'official movie trailer teaser hindi film promo 2025 2026',
      US: 'official movie trailer teaser 2025 2026 breakdown',
      GB: 'official movie trailer teaser 2025 2026 preview',
      AE: 'official movie trailer teaser 2025 2026',
    },
    defaultQuery: 'official movie trailer teaser preview 2025 2026',
    supportPopularChart: true,
  },
  'Entertainment': {
    catId: '24',
    regionalQueries: {
      PK: 'viral entertainment challenge extreme comparison show',
      IN: 'viral entertainment challenge extreme comparison comedy',
      US: 'viral entertainment challenge experiment extreme comparison',
      GB: 'viral entertainment challenge experiment prank comedy',
    },
    defaultQuery: 'viral entertainment challenge experiment comparison',
    supportPopularChart: true,
  },
  'Gaming & Esports': {
    catId: '20',
    regionalQueries: {
      PK: 'gaming gameplay highlights walkthrough tournament esports',
      IN: 'gaming gameplay highlights BGMI GTA tournament walkthrough',
      US: 'gaming gameplay highlights walkthrough tournament esports 2026',
    },
    defaultQuery: 'gaming gameplay highlights walkthrough tournament esports',
    supportPopularChart: true,
  },
  'Technology & Software': {
    catId: '28',
    regionalQueries: {
      US: 'technology software review gadget smartphone coding silicon hardware',
      PK: 'technology software gadget smartphone review unboxing',
      IN: 'technology software smartphone review gadget unboxing coding',
    },
    defaultQuery: 'technology software review gadget smartphone coding silicon hardware',
    supportPopularChart: true,
  },
  'Education & Tutorials': {
    catId: '27',
    regionalQueries: {
      US: 'tutorial education how to learn guide explainer crash course',
      PK: 'educational tutorial how to guide lecture learning course',
      IN: 'tutorial education how to learn guide explainer exam preparation',
    },
    defaultQuery: 'tutorial education how to learn guide explainer crash course',
    supportPopularChart: true,
  },
  'Business & Finance': {
    catId: '25',
    regionalQueries: {
      US: 'business finance investing startup case study stock market money',
      PK: 'business startup investing ecommerce finance money guide',
      IN: 'business startup finance investing stock market case study',
    },
    defaultQuery: 'business finance investing startup case study stock market money',
    supportPopularChart: true,
  },
  'Comedy & Memes': {
    catId: '23',
    regionalQueries: {
      PK: 'pakistani comedy standup funny sketches memes roast',
      IN: 'comedy sketches memes standup funny spoof roast',
      US: 'standup comedy sketches funny memes parody satire',
      GB: 'british comedy sketch standup funny memes parody',
      AE: 'comedy sketch funny memes parody standup',
    },
    defaultQuery: 'comedy sketch memes funny standup parody',
    supportPopularChart: true,
  },
  'Music & Dance': {
    catId: '10',
    regionalQueries: {
      PK: 'pakistani music song official video coke studio viral audio',
      IN: 'hindi punjabi music song official video viral dance',
      US: 'official music video song viral audio dance performance',
      GB: 'uk official music video song viral audio chart performance',
    },
    defaultQuery: 'official music video song viral audio dance performance',
    supportPopularChart: true,
  },
  'Sports & Cricket': {
    catId: '17',
    regionalQueries: {
      PK: 'cricket match highlights tournament bowling batting sports',
      IN: 'cricket match highlights tournament bowling batting sports',
      US: 'sports match highlights championship goal touchdown play',
      GB: 'football premier league match highlights goal sports',
      AE: 'sports match highlights tournament football cricket',
    },
    defaultQuery: 'sports match highlights tournament championship goal',
    supportPopularChart: true,
  },
  'Food & Cooking': {
    catId: '26',
    regionalQueries: {
      PK: 'street food pakistani recipe cooking test taste dhaba',
      IN: 'street food indian recipe cooking taste test dhaba',
      US: 'food recipe restaurant review cooking taste test chef',
      GB: 'street food recipe cooking taste test review',
      AE: 'dubai street food recipe cooking taste test luxury',
    },
    defaultQuery: 'street food recipe cooking taste test chef',
    supportPopularChart: true,
  },
  'Beauty & Fashion': {
    catId: '26',
    regionalQueries: {
      PK: 'beauty makeup skincare fashion haul dress style wedding',
      IN: 'beauty makeup skincare fashion haul dress style wedding',
      US: 'beauty makeup skincare fashion haul style outfit review',
      GB: 'beauty makeup skincare fashion haul style outfit review',
    },
    defaultQuery: 'beauty makeup skincare fashion haul style outfit',
    supportPopularChart: true,
  },
  'Health & Fitness': {
    catId: '26',
    regionalQueries: {
      PK: 'fitness workout health diet exercise gym training routine',
      IN: 'fitness workout health diet exercise gym training routine',
      US: 'fitness workout health exercise training gym routine nutrition',
    },
    defaultQuery: 'fitness workout health exercise training gym routine',
    supportPopularChart: true,
  },
  'Science & History': {
    catId: '28',
    regionalQueries: {
      US: 'science history documentary discovery space universe exploration',
    },
    defaultQuery: 'science history documentary discovery space universe exploration',
    supportPopularChart: false,
  },
  'News & Current Events': {
    catId: '25',
    regionalQueries: {
      PK: 'pakistan news live breaking world report analysis',
      IN: 'india news live breaking world report analysis',
      US: 'news breaking world report documentary analysis journalism',
      GB: 'uk bbc news breaking world report documentary analysis',
      AE: 'uae middle east news breaking world report documentary',
    },
    defaultQuery: 'news breaking world report documentary analysis journalism',
    supportPopularChart: true,
  },
  'Podcasts & Interviews': {
    catId: '24',
    regionalQueries: {
      PK: 'pakistani podcast full interview deep conversation episode',
      IN: 'hindi podcast full interview deep conversation episode',
      US: 'podcast full interview deep conversation episode talk show',
    },
    defaultQuery: 'podcast full interview deep conversation episode talk show',
    supportPopularChart: false,
  },
  'Travel & Exploration': {
    catId: '19',
    regionalQueries: {
      PK: 'pakistan northern areas travel documentary tour adventure exploration',
      IN: 'india travel documentary tour adventure exploration mountains',
      US: 'travel documentary tour exploration adventure expedition guide',
    },
    defaultQuery: 'travel documentary tour exploration adventure expedition guide',
    supportPopularChart: true,
  },
};

// Helper to deduplicate videos by ID
function deduplicateVideos(videos: any[]): any[] {
  const seen = new Set<string>();
  const res: any[] = [];
  for (const v of videos) {
    const id = v.id || v.youtubeId;
    if (id && !seen.has(id)) {
      seen.add(id);
      res.push(v);
    }
  }
  return res;
}

// Convert raw YouTube API item to strongly typed VideoItem
function mapYouTubeVideoItem(
  v: any,
  index: number,
  channelMap: Record<string, { avatarUrl: string; subscriberCount: number | null }>,
  targetCategoryName?: string,
  targetMarket?: string
) {
  const pubTime = new Date(v.snippet?.publishedAt || Date.now()).getTime();
  const ageHours = Math.max(0.5, (Date.now() - pubTime) / (1000 * 60 * 60));

  const views = v.statistics?.viewCount ? parseInt(v.statistics.viewCount, 10) : 0;
  const likes = v.statistics?.likeCount ? parseInt(v.statistics.likeCount, 10) : 0;
  const comments = v.statistics?.commentCount ? parseInt(v.statistics.commentCount, 10) : 0;

  const isoDuration = v.contentDetails?.duration || 'PT0M';
  const durationSeconds = parseDurationToSeconds(isoDuration);
  const isShort = durationSeconds > 0 && durationSeconds <= 60;
  const formattedDuration = formatDurationSeconds(durationSeconds);

  // Views per hour: transparently calculated lifetime average
  const vph = Math.round(views / ageHours);

  // Channel details
  const chId = v.snippet?.channelId || '';
  const channelInfo = channelMap[chId] || { avatarUrl: '', subscriberCount: null };
  const subs = channelInfo.subscriberCount;
  const channelTier =
    subs === null
      ? 'medium'
      : subs < 50000
      ? 'small'
      : subs < 500000
      ? 'medium'
      : 'large';

  // Outlier multiplier: ratio against channel subscriber baseline or view baseline
  const benchmarkBaseline = subs ? Math.max(1000, subs * 0.12) : Math.max(25000, views / (2.8 + (index % 3)));
  const outlierScore = parseFloat((views / benchmarkBaseline).toFixed(1));

  // Composite viral score index (0-100 heuristic)
  const engagementDensity = views > 0 ? (likes + comments * 2) / views : 0;
  const velocityFactor = Math.min(40, (vph / 5000) * 40);
  const outlierFactor = Math.min(35, outlierScore * 6);
  const engagementFactor = Math.min(25, engagementDensity * 250);
  const viralScore = Math.min(99, Math.max(50, Math.round(velocityFactor + outlierFactor + engagementFactor)));

  // Best thumbnail available
  const thumbs = v.snippet?.thumbnails || {};
  const thumbnail =
    thumbs.maxres?.url ||
    thumbs.standard?.url ||
    thumbs.high?.url ||
    thumbs.medium?.url ||
    thumbs.default?.url ||
    '';

  const category =
    targetCategoryName && targetCategoryName !== 'All'
      ? targetCategoryName
      : YOUTUBE_CAT_ID_TO_NAME[v.snippet?.categoryId] || 'Entertainment';

  return {
    id: v.id,
    youtubeId: v.id,
    title: v.snippet?.title || 'Untitled Video',
    channelTitle: v.snippet?.channelTitle || 'YouTube Creator',
    channelId: chId,
    channelAvatar: channelInfo.avatarUrl || '',
    channelSubscribers: subs ?? 0,
    channelTier,
    duration: formattedDuration,
    durationSeconds,
    format: (isShort ? 'Shorts' : 'Long-Form') as any,
    publishedAt: v.snippet?.publishedAt || new Date().toISOString(),
    relativeTime: formatRelativeTime(v.snippet?.publishedAt),
    views,
    likes,
    comments,
    viewsPerHour: vph, // calculated estimate
    outlierScore: Math.max(1.0, outlierScore),
    viralScore,
    confidenceScore: 92,
    trendStatus: vph > 20000 ? 'Exploding' : 'Rising',
    category,
    market: targetMarket || 'Global',
    thumbnail,
    originalUrl: `https://www.youtube.com/watch?v=${v.id}`,
    tags: v.snippet?.tags || [],
    isLiveYouTubeData: true,
  };
}

// Fetch channel avatars & subscriber counts with in-memory caching
async function fetchChannelMetadata(channelIds: string[], key: string): Promise<Record<string, { avatarUrl: string; subscriberCount: number | null }>> {
  const result: Record<string, { avatarUrl: string; subscriberCount: number | null }> = {};
  const missingIds: string[] = [];
  const now = Date.now();

  for (const id of channelIds) {
    if (!id) continue;
    const cached = channelCache.get(id);
    if (cached && now - cached.timestamp < CHANNEL_CACHE_TTL_MS) {
      result[id] = { avatarUrl: cached.avatarUrl, subscriberCount: cached.subscriberCount };
    } else {
      missingIds.push(id);
    }
  }

  if (missingIds.length > 0) {
    // Batch in chunks of up to 50 channel IDs
    for (let i = 0; i < missingIds.length; i += 50) {
      const chunk = missingIds.slice(i, i + 50);
      try {
        const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${chunk.join(',')}&key=${key}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          for (const ch of data.items || []) {
            const avatar = ch.snippet?.thumbnails?.default?.url || ch.snippet?.thumbnails?.medium?.url || '';
            const subs = ch.statistics?.subscriberCount ? parseInt(ch.statistics.subscriberCount, 10) : null;
            const entry = { avatarUrl: avatar, subscriberCount: subs, timestamp: now };
            channelCache.set(ch.id, entry);
            result[ch.id] = { avatarUrl: avatar, subscriberCount: subs };
          }
        }
      } catch (e) {
        console.warn('Channel batch lookup failed:', e);
      }
    }
  }

  return result;
}

// Real YouTube Data API v3 video discovery and details proxy
app.post('/api/youtube/search', async (req: Request, res: Response) => {
  try {
    const key = (req.header('X-YouTube-Key') || req.body?.apiKey || process.env.YOUTUBE_API_KEY || '').trim();

    if (!key) {
      return res.status(400).json({
        error: 'NO_API_KEY',
        message: 'No YouTube Data API key configured. Switch to Demo Mode or connect an API key.',
      });
    }

    const {
      q,
      regionCode,
      categoryId,
      categoryName = 'All',
      publishedAfter,
      videoDuration,
      viewType,
      isViralNow,
      market = 'Global',
      maxResults = 24,
    } = req.body;

    const isTrendingFeed =
      Boolean(isViralNow) ||
      viewType === 'viral-now' ||
      ((categoryName === 'All' || !categoryName) && (!q || !q.trim()) && (!videoDuration || videoDuration === 'any'));

    // Check if Shorts discovery
    const isShortsDiscovery = videoDuration === 'short' || viewType === 'shorts';

    const cacheKey = `${categoryName}_${regionCode || 'global'}_${q || ''}_${videoDuration || 'any'}_${publishedAfter || ''}_${viewType || ''}_${isTrendingFeed ? 'viral' : 'std'}`;
    const lkgKey = `${categoryName}_${regionCode || 'global'}_${videoDuration || 'any'}`;

    // 1. Check in-memory cache
    const now = Date.now();
    const cachedEntry = searchCache.get(cacheKey);
    if (cachedEntry && now - cachedEntry.timestamp < SEARCH_CACHE_TTL_MS) {
      return res.json({
        videos: cachedEntry.videos,
        totalResults: cachedEntry.totalResults,
        source: 'YouTube Data API v3 (Cached)',
        isLiveApi: true,
        isCached: true,
      });
    }

    const effectiveRegion = regionCode && regionCode !== 'Global' ? regionCode : undefined;
    const rule = categoryName && CATEGORY_DISCOVERY_RULES[categoryName] ? CATEGORY_DISCOVERY_RULES[categoryName] : null;

    let rawVideoItems: any[] = [];
    let quotaHit = false;

    // 2. Fetch strategy: Viral Now / Trending feed uses chart=mostPopular (1 quota unit!)
    if (isTrendingFeed) {
      const popRegion = effectiveRegion || 'US';
      const popUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=${encodeURIComponent(
        popRegion
      )}&maxResults=${Math.min(30, maxResults)}&key=${key}`;

      const popRes = await fetch(popUrl);
      const popData = await popRes.json();

      if (!popRes.ok) {
        const reason = popData.error?.errors?.[0]?.reason || '';
        if (reason === 'quotaExceeded') {
          quotaHit = true;
        }
      } else if (popData.items && popData.items.length > 0) {
        rawVideoItems = popData.items;
      }
    }

    // 3. Category with mostPopular chart support (e.g. Drama in PK, Gaming, Music, Vlogs)
    if (!quotaHit && rawVideoItems.length === 0 && rule?.supportPopularChart && rule?.catId && !q && !isShortsDiscovery) {
      const popRegion = effectiveRegion || 'US';
      const catPopUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=${encodeURIComponent(
        popRegion
      )}&videoCategoryId=${rule.catId}&maxResults=15&key=${key}`;

      try {
        const popRes = await fetch(catPopUrl);
        const popData = await popRes.json();
        if (popRes.ok && popData.items && popData.items.length > 0) {
          rawVideoItems.push(...popData.items);
        } else if (!popRes.ok && popData.error?.errors?.[0]?.reason === 'quotaExceeded') {
          quotaHit = true;
        }
      } catch (err) {
        console.warn('Category popular chart attempt failed, will proceed to search:', err);
      }
    }

    // 4. Targeted Search Query execution (if needed to populate or enrich feed)
    if (!quotaHit && (rawVideoItems.length < 8 || q || isShortsDiscovery || !rule?.supportPopularChart)) {
      // Determine query text
      let queryText = (q && q.trim()) || '';
      if (!queryText) {
        if (isShortsDiscovery) {
          queryText = '#shorts viral trending 2026';
        } else if (rule) {
          const regQuery = effectiveRegion && rule.regionalQueries[effectiveRegion];
          queryText = regQuery || rule.defaultQuery;
        } else {
          queryText = 'viral trending 2026';
        }
      }

      const activeCategoryId = categoryId || rule?.catId;

      const searchParams = new URLSearchParams({
        part: 'snippet',
        type: 'video',
        maxResults: String(Math.min(50, Math.max(10, maxResults))),
        key: key,
        q: queryText,
        order: isShortsDiscovery || isTrendingFeed ? 'viewCount' : 'viewCount',
      });

      if (effectiveRegion) {
        searchParams.append('regionCode', effectiveRegion);
      }
      if (activeCategoryId && categoryName !== 'Movies & Trailers') {
        // Movies & trailers are often in category 24, do not strictly restrict by catId 1
        searchParams.append('videoCategoryId', activeCategoryId);
      }
      if (publishedAfter) {
        searchParams.append('publishedAfter', publishedAfter);
      } else if (isShortsDiscovery) {
        // Bound shorts to recent 30 days to avoid ancient clips
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        searchParams.append('publishedAfter', thirtyDaysAgo);
      }
      if (videoDuration && videoDuration !== 'any') {
        searchParams.append('videoDuration', videoDuration);
      }

      const searchUrl = `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (!searchResponse.ok) {
        const reason = searchData.error?.errors?.[0]?.reason || '';
        if (reason === 'quotaExceeded') {
          quotaHit = true;
        }
      } else {
        let items = searchData.items || [];

        // Fallback attempt if videoCategoryId yielded 0 results
        if (items.length === 0 && searchParams.has('videoCategoryId')) {
          searchParams.delete('videoCategoryId');
          const fbRes = await fetch(`https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`);
          if (fbRes.ok) {
            const fbData = await fbRes.json();
            if (fbData.items?.length > 0) items = fbData.items;
          }
        }

        const videoIds = items
          .map((item: { id?: { videoId?: string } }) => item.id?.videoId)
          .filter((id: unknown): id is string => Boolean(id));

        if (videoIds.length > 0) {
          const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds.join(
            ','
          )}&key=${key}`;
          const videosResponse = await fetch(videosUrl);
          if (videosResponse.ok) {
            const videosData = await videosResponse.json();
            if (videosData.items?.length > 0) {
              rawVideoItems.push(...videosData.items);
            }
          } else if (videosResponse.status === 403) {
            quotaHit = true;
          }
        }
      }
    }

    // 5. Handle Quota Exhaustion Gracefully
    if (quotaHit && rawVideoItems.length === 0) {
      // Check last-known-good cache
      const lkgVideos = lastKnownGood.get(lkgKey);
      if (lkgVideos && lkgVideos.length > 0) {
        return res.json({
          videos: lkgVideos,
          totalResults: lkgVideos.length,
          source: 'YouTube Data API v3 (Cached)',
          isLiveApi: true,
          quotaWarning: true,
          message: 'YouTube Data API daily quota limit reached (10,000 units/day). Serving freshest verified real trend cache.',
        });
      }

      return res.status(403).json({
        error: 'QUOTA_EXCEEDED',
        message: 'YouTube Data API daily quota limit reached (10,000 units/day). Operating in benchmark demo mode.',
      });
    }

    // Deduplicate raw video items
    const uniqueRawItems = deduplicateVideos(rawVideoItems);

    if (uniqueRawItems.length === 0) {
      return res.json({
        videos: [],
        totalResults: 0,
        source: 'YouTube Data API v3',
        isLiveApi: true,
      });
    }

    // 6. Fetch channel metadata for avatars & subscriber counts
    const channelIds = Array.from(new Set(uniqueRawItems.map((v) => v.snippet?.channelId).filter(Boolean)));
    const channelMap = await fetchChannelMetadata(channelIds, key);

    // 7. Map to strongly typed SaaS video items
    let parsedVideos = uniqueRawItems.map((v: any, index: number) =>
      mapYouTubeVideoItem(v, index, channelMap, categoryName, market)
    );

    // Filter by publishedAfter if specified
    if (publishedAfter) {
      const pubLimit = new Date(publishedAfter).getTime();
      parsedVideos = parsedVideos.filter((v) => new Date(v.publishedAt).getTime() >= pubLimit);
    }

    // Format constraint
    if (videoDuration === 'short') {
      parsedVideos = parsedVideos.filter((v) => v.format === 'Shorts' || v.durationSeconds <= 60);
    } else if (videoDuration === 'medium' || videoDuration === 'long') {
      parsedVideos = parsedVideos.filter((v) => v.format === 'Long-Form' || v.durationSeconds > 60);
    }

    // Sort appropriately
    if (isTrendingFeed || req.body.sortBy === 'viewsPerHour') {
      parsedVideos.sort((a, b) => b.viewsPerHour - a.viewsPerHour);
    } else if (req.body.sortBy === 'views') {
      parsedVideos.sort((a, b) => b.views - a.views);
    } else if (req.body.sortBy === 'publishedAt') {
      parsedVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else {
      parsedVideos.sort((a, b) => b.viralScore - a.viralScore);
    }

    // 8. Store in cache & last-known-good
    searchCache.set(cacheKey, {
      videos: parsedVideos,
      totalResults: parsedVideos.length,
      timestamp: now,
      source: 'YouTube Data API v3',
    });

    if (parsedVideos.length > 0) {
      lastKnownGood.set(lkgKey, parsedVideos);
    }

    return res.json({
      videos: parsedVideos,
      totalResults: parsedVideos.length,
      source: 'YouTube Data API v3',
      isLiveApi: true,
      quotaWarning: quotaHit,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown server error during YouTube API query';
    console.error('YouTube search proxy error:', errorMsg);
    return res.status(500).json({ error: 'SERVER_ERROR', message: errorMsg });
  }
});

// Mount Vite middleware in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ViralReader server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
