import React from 'react';
import {
  LayoutDashboard,
  Flame,
  Smartphone,
  Tv,
  TrendingUp,
  Radio,
  Sparkles,
  Clapperboard,
  Gamepad2,
  Cpu,
  GraduationCap,
  Briefcase,
  Smile,
  Music,
  Trophy,
  UtensilsCrossed,
  Sparkle,
  Newspaper,
  Rocket,
  Compass,
  Globe,
  Sliders,
  Bookmark,
  BookmarkCheck,
  Lightbulb,
  FileText,
  Settings,
  Zap,
  X,
  Target,
  Layers,
  Shield,
  Home,
} from 'lucide-react';
import { UserAccount } from '../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenPricing: () => void;
  currentUser?: UserAccount | null;
  onOpenAuth?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  groupTitle?: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
  onOpenPricing,
  currentUser,
  onOpenAuth,
}) => {
  const navGroups: NavGroup[] = [
    {
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'viral-now', label: 'Viral Now', icon: Flame, badge: 'LIVE', badgeColor: 'bg-rose-500/20 text-rose-400' },
        { id: 'shorts', label: 'YouTube Shorts', icon: Smartphone, badge: '9:16', badgeColor: 'bg-purple-500/20 text-purple-400' },
        { id: 'long-form', label: 'Long-Form Videos', icon: Tv },
        { id: 'outlier-detector', label: 'Outlier Detector', icon: TrendingUp, badge: 'HIGH', badgeColor: 'bg-emerald-500/20 text-emerald-400' },
        { id: 'small-channel-breakouts', label: 'Small Breakouts', icon: Rocket },
      ],
    },
    {
      groupTitle: 'Category Radars',
      items: [
        { id: 'vlogs-radar', label: 'Vlogs Radar', icon: Radio },
        { id: 'ai-content-radar', label: 'AI Content Radar', icon: Sparkles },
        { id: 'drama-tv', label: 'Drama & TV Trends', icon: Clapperboard },
        { id: 'movies-trailers', label: 'Movies & Trailers', icon: Clapperboard },
        { id: 'entertainment', label: 'Entertainment', icon: Sparkle },
        { id: 'gaming-trends', label: 'Gaming Trends', icon: Gamepad2 },
        { id: 'technology-ai', label: 'Technology & AI', icon: Cpu },
        { id: 'education-tutorials', label: 'Education & Tutorials', icon: GraduationCap },
        { id: 'business-finance', label: 'Business & Finance', icon: Briefcase },
        { id: 'comedy-memes', label: 'Comedy & Memes', icon: Smile },
        { id: 'music-dance', label: 'Music & Dance', icon: Music },
        { id: 'sports-cricket', label: 'Sports Trends', icon: Trophy },
        { id: 'food-cooking', label: 'Food & Cooking', icon: UtensilsCrossed },
        { id: 'beauty-fashion', label: 'Beauty & Fashion', icon: Sparkle },
        { id: 'news-events', label: 'News & Events', icon: Newspaper },
      ],
    },
    {
      groupTitle: 'Discovery & Studio',
      items: [
        { id: 'thumbnail-studio', label: 'Thumbnail Studio', icon: Layers, badge: 'NEW', badgeColor: 'bg-cyan-500/20 text-cyan-300' },
        { id: 'content-ideas-studio', label: 'Content Ideas Studio', icon: Lightbulb, badge: 'AI', badgeColor: 'bg-[#6D3DF5]/30 text-[#8B5CF6]' },
        { id: 'country-explorer', label: 'Country Explorer', icon: Globe },
        { id: 'trend-explorer', label: 'Trend Explorer', icon: Compass },
        { id: 'my-niche', label: 'My Niche', icon: Target },
        { id: 'reports', label: 'Reports', icon: FileText },
      ],
    },
    {
      groupTitle: 'Library & Account',
      items: [
        { id: 'saved-videos', label: 'Saved Videos', icon: Bookmark },
        { id: 'saved-trends', label: 'Saved Trends', icon: BookmarkCheck },
        { id: 'settings', label: 'Profile & Settings', icon: Settings },
        { id: 'landing', label: 'Public Home & About', icon: Home },
        ...(currentUser?.role === 'admin'
          ? [{ id: 'admin-panel', label: 'Admin Command', icon: Shield, badge: 'ROOT', badgeColor: 'bg-rose-500/20 text-rose-300' }]
          : []),
      ],
    },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-20 h-screen w-64 md:w-56 shrink-0 bg-[#0D1726] border-r border-[#1B293E] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#1B293E] bg-[#09101C]">
          <div
            onClick={() => handleItemClick('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            {/* Glowing Brand Mark */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D3DF5] to-[#8B5CF6] flex items-center justify-center text-white font-bold shadow-lg shadow-[#6D3DF5]/30 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1">
                <span>ViralReader</span>
              </div>
              <div className="text-[10px] text-purple-400 font-medium tracking-wide">
                Decode Virality
              </div>
            </div>
          </div>

          {/* Close for mobile */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#16243A] md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-0.5">
              {group.groupTitle && (
                <div className="px-2.5 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {group.groupTitle}
                </div>
              )}
              {group.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#6D3DF5] text-white shadow-md shadow-[#6D3DF5]/20 font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-[#16243A]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <IconComponent
                        className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Upgrade to Pro Panel (At bottom of sidebar) */}
        <div className="p-3 border-t border-[#1B293E] bg-[#09101C]">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#16243A] to-[#10192A] border border-[#233852] space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>Upgrade to Pro</span>
              </span>
              <span className="text-[10px] text-amber-400 font-mono font-medium">SOON</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Subscriptions coming soon. Payment gateway in merchant review.
            </p>
            <button
              onClick={onOpenPricing}
              className="w-full mt-1 py-1.5 px-2.5 text-xs font-semibold text-white bg-[#6D3DF5] hover:bg-[#5B2DE0] rounded-lg transition-colors text-center shadow-sm"
            >
              View Plan Features
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
