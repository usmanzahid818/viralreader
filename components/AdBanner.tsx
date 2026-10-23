import React from 'react';
import { Sparkles, ExternalLink } from 'lucide-react';
import { UserAccount } from '../types';

interface AdBannerProps {
  currentUser: UserAccount | null;
  onOpenPricing: () => void;
  placement?: 'sidebar' | 'dashboard' | 'footer';
}

export const AdBanner: React.FC<AdBannerProps> = ({ currentUser, onOpenPricing, placement = 'dashboard' }) => {
  // If user is verified Premium (pro or agency) or Admin, completely omit all ad placements
  if (currentUser?.plan === 'pro' || currentUser?.plan === 'agency' || currentUser?.role === 'admin') {
    return null;
  }

  if (placement === 'sidebar') {
    return (
      <div className="p-2.5 rounded-xl bg-[#070D18] border border-[#1B293E]/80 text-[10px] space-y-1.5 text-slate-400">
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase">
          <span>Ad Placement</span>
          <button onClick={onOpenPricing} className="text-[#8B5CF6] hover:underline">
            Remove Ads
          </button>
        </div>
        <p className="text-slate-300">
          Supercharge your channel research with automated outlier tracking and Gemini AI packaging.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full p-3 rounded-xl bg-gradient-to-r from-[#0C1523] via-[#111C2D] to-[#0C1523] border border-[#1B293E] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
          AdSense Ready Placement
        </span>
        <span className="text-slate-300">
          ViralReader Free Tier Sponsor Slot — Display ads activate here upon publisher approval.
        </span>
      </div>

      <button
        onClick={onOpenPricing}
        className="px-3 py-1 rounded-lg bg-[#6D3DF5]/20 hover:bg-[#6D3DF5]/30 border border-[#6D3DF5]/40 text-[#8B5CF6] hover:text-white font-semibold text-[11px] flex items-center gap-1 transition-colors whitespace-nowrap"
      >
        <Sparkles className="w-3 h-3" />
        <span>Upgrade to Remove Ads</span>
      </button>
    </div>
  );
};
