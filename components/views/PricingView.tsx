import React, { useState } from 'react';
import { Check, Zap, AlertCircle, Sparkles, Shield, Clock, HelpCircle, ArrowRight } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../../data/mockData';
import { SubscriptionPlan } from '../../types';

interface PricingViewProps {
  onClose?: () => void;
  onOpenScoreExplainer?: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onClose, onOpenScoreExplainer }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const handlePlanClick = (plan: SubscriptionPlan) => {
    setSelectedPlanId(plan.id);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Title */}
      <div className="text-center space-y-2 pb-4 border-b border-[#1B293E]/60">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6D3DF5]/20 text-[#8B5CF6] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Provisional SaaS Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Transparent Creator Pricing Plans
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Scale your channel research with automated outlier detection, Gemini AI trend deconstructions, and custom market alerts.
        </p>

        {/* Merchant Review Honest Notice */}
        <div className="mt-3 p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs max-w-2xl mx-auto flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 shrink-0" />
          <span>
            <strong>Payment Provider Status:</strong> Merchant account review in progress. Subscriptions coming soon. No charges can be made at this time.
          </span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          return (
            <div
              key={plan.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-200 relative ${
                plan.isPopular
                  ? 'bg-gradient-to-b from-[#18263E] to-[#111C2D] border-[#8B5CF6] shadow-xl shadow-purple-900/30 scale-[1.02]'
                  : 'bg-[#111C2D] border-[#1B293E] hover:border-slate-600'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#6D3DF5] text-white text-[10px] font-extrabold tracking-wider uppercase shadow-md">
                  MOST POPULAR
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">{plan.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">{plan.targetAudience}</div>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                    ${plan.priceMonthly}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">{plan.description}</p>

                {/* Features list */}
                <div className="pt-3 border-t border-[#1B293E] space-y-2 text-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Included:</div>
                  <ul className="space-y-1.5 text-slate-300">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.limitations.length > 0 && (
                    <div className="pt-2 text-slate-500 text-[11px] space-y-1">
                      {plan.limitations.map((lim, idx) => (
                        <div key={idx}>· {lim}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-[#1B293E]">
                {plan.status === 'available' ? (
                  <button
                    onClick={() => handlePlanClick(plan)}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-[#1B293E] text-white hover:bg-[#263852] transition-colors"
                  >
                    Current Plan (Free)
                  </button>
                ) : (
                  <button
                    onClick={() => handlePlanClick(plan)}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                      plan.isPopular
                        ? 'bg-[#6D3DF5] hover:bg-[#5B2DE0] text-white shadow-md shadow-[#6D3DF5]/30'
                        : 'bg-[#16243A] hover:bg-[#1E2F4A] text-slate-200'
                    }`}
                  >
                    Subscriptions Coming Soon
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature comparison table notice */}
      <div className="p-4 rounded-xl bg-[#0D1726] border border-[#1B293E] text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-200">
          <Shield className="w-4 h-4 text-[#8B5CF6]" />
          <span>Billing &amp; Merchant Integration Disclosures</span>
        </div>
        <p className="leading-relaxed">
          The pricing tiers above represent planned platform configurations. All payment processing integrations remain securely behind server-side payment tokenization layers and will activate upon official merchant registration approval. No fake checkouts or dummy payment captures are ever performed.
        </p>
      </div>
    </div>
  );
};
