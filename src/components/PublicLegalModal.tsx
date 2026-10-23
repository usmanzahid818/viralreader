import React from 'react';
import { X, Shield, FileText, HelpCircle, Mail, RotateCcw } from 'lucide-react';

export type LegalModalType = 'privacy' | 'terms' | 'refund' | 'faq' | 'contact' | null;

interface PublicLegalModalProps {
  modalType: LegalModalType;
  onClose: () => void;
}

export const PublicLegalModal: React.FC<PublicLegalModalProps> = ({ modalType, onClose }) => {
  if (!modalType) return null;

  const contentMap: Record<string, { title: string; subtitle: string; icon: any; body: React.ReactNode }> = {
    privacy: {
      title: 'Privacy Policy',
      subtitle: 'Last updated: October 2026',
      icon: Shield,
      body: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            At <strong>ViralReader</strong>, we take creator privacy and data integrity seriously. This Privacy Policy outlines how public video metadata is processed, how authenticated creator accounts are protected, and our strict zero-telemetry boundary.
          </p>
          <h4 className="text-sm font-bold text-white">1. Information We Collect</h4>
          <p>
            We collect account credentials (email address, display name) exclusively to maintain your private saved bookmarks, custom outlier thresholds, and AI generation history. We do NOT access private YouTube Studio analytics, private viewer demographics, or unapproved creator channels.
          </p>
          <h4 className="text-sm font-bold text-white">2. Public YouTube Data</h4>
          <p>
            Video titles, thumbnails, view counts, and publication timestamps are queried through Google's official YouTube Data API v3 or served via cached historical baselines. We respect YouTube Terms of Service and API developer policies.
          </p>
          <h4 className="text-sm font-bold text-white">3. Third-Party Disclosures & Cookies</h4>
          <p>
            We do not sell personal data. Google AdSense compliant cookie consent banners allow users to manage cookie preferences for ad personalization. Paid subscribers enjoy an entirely ad-free environment.
          </p>
          <h4 className="text-sm font-bold text-white">4. Account Deletion</h4>
          <p>
            You can permanently purge your creator profile and all saved library entries anytime directly from the Profile &amp; Settings interface.
          </p>
        </div>
      ),
    },
    terms: {
      title: 'Terms of Service',
      subtitle: 'Agreement for ViralReader Platform',
      icon: FileText,
      body: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            By accessing or using <strong>ViralReader</strong>, you agree to comply with and be bound by these Terms of Service.
          </p>
          <h4 className="text-sm font-bold text-white">1. Service Description & No Guarantee of Virality</h4>
          <p>
            ViralReader provides educational intelligence tools, algorithmic velocity estimates, and AI ideation models.
            <strong> We never guarantee that any suggested title, hook, or thumbnail will result in viral viewership.</strong> Video performance depends on creator execution, viewer retention, and evolving algorithmic dynamics.
          </p>
          <h4 className="text-sm font-bold text-white">2. Acceptable Use</h4>
          <p>
            You agree not to reverse engineer the platform, scrape underlying databases via automated bots, bypass rate limits, or utilize generated content to violate YouTube community guidelines or copyright laws.
          </p>
          <h4 className="text-sm font-bold text-white">3. Subscriptions & Tier Entitlements</h4>
          <p>
            Free tier users are granted access to public trend exploration with daily generation allowances. Pro and Agency tiers provide enhanced quotas subject to server-side verification.
          </p>
        </div>
      ),
    },
    refund: {
      title: 'Refund & Cancellation Policy',
      subtitle: 'Transparent creator billing commitments',
      icon: RotateCcw,
      body: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <h4 className="text-sm font-bold text-white">Merchant Review Status</h4>
          <p>
            ViralReader is currently undergoing standard merchant account review with Lemon Squeezy. No real credit card transactions are processed until merchant authorization is finalized.
          </p>
          <h4 className="text-sm font-bold text-white">14-Day Satisfaction Guarantee</h4>
          <p>
            Once live billing is enabled, all paid creator subscriptions will feature an unconditional 14-day refund policy upon initial purchase if the intelligence platform does not meet your expectations.
          </p>
          <h4 className="text-sm font-bold text-white">Cancellation Anytime</h4>
          <p>
            Subscriptions can be cancelled at any point with one click from your billing dashboard, preventing future renewal charges while maintaining access until the end of your billing cycle.
          </p>
        </div>
      ),
    },
    faq: {
      title: 'Frequently Asked Questions (FAQ)',
      subtitle: 'Common questions about ViralReader intelligence',
      icon: HelpCircle,
      body: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div>
            <h4 className="text-sm font-bold text-white">How does ViralReader calculate the Outlier Multiplier?</h4>
            <p className="mt-1 text-slate-400">
              The Outlier Multiplier compares a video's total views against its channel's historical median baseline. For instance, a 5.2x score means the video generated 5.2 times more views than that channel typically achieves, signalling breakout algorithmic recommendation beyond core subscribers.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Is Views-Per-Hour (VPH) measured in real time?</h4>
            <p className="mt-1 text-slate-400">
              Views-Per-Hour is calculated as a lifetime average velocity (Total Views divided by hours since publication). Where polling snapshots exist, interval velocity is labeled accordingly.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Does ViralReader require access to my channel's private data?</h4>
            <p className="mt-1 text-slate-400">
              Never. ViralReader operates purely on verified public YouTube Data API v3 metadata and publicly observable signals. You do not need to link your YouTube channel or grant OAuth access.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">What happens if the YouTube API quota is exceeded?</h4>
            <p className="mt-1 text-slate-400">
              The platform gracefully switches to serving verified in-memory cached intelligence, labeled transparently so creators always know the source and age of the data.
            </p>
          </div>
        </div>
      ),
    },
    contact: {
      title: 'Contact & Creator Support',
      subtitle: 'Reach our engineering and research team',
      icon: Mail,
      body: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            Have questions, feedback, or custom API integration requirements? Get in touch with our team:
          </p>
          <div className="p-4 rounded-xl bg-[#111C2D] border border-[#1B293E] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Platform Support Email:</span>
              <span className="text-purple-300 font-mono font-semibold">support@viralreader.com</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Lead Architect:</span>
              <span className="text-cyan-300 font-mono">uzuz8686786@gmail.com</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Response SLA:</span>
              <span className="text-slate-200">Within 24 business hours</span>
            </div>
          </div>
        </div>
      ),
    },
  };

  const active = contentMap[modalType];
  if (!active) return null;
  const IconComponent = active.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#0D1726] border border-[#1B293E] rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col text-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1B293E] bg-[#111C2D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6D3DF5]/20 border border-[#6D3DF5]/40 flex items-center justify-center text-[#8B5CF6]">
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{active.title}</h3>
              <p className="text-[10px] text-slate-400">{active.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#16243A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">{active.body}</div>

        <div className="p-4 border-t border-[#1B293E] bg-[#09101C] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#6D3DF5] hover:bg-[#5B2DE0] text-xs font-semibold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
