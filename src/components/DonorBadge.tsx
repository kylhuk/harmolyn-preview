import React from 'react';
import { Coffee, HeartHandshake, Rocket, Sparkles } from 'lucide-react';

export type DonationTier = 'coffee' | 'supporter' | 'champion';

export const DONATION_TIER_CONFIG: Record<DonationTier, {
  label: string;
  icon: React.ReactNode;
  color: string;
  glow: string;
  description: string;
}> = {
  coffee: {
    label: 'Coffee Donor',
    icon: <Coffee size={12} />,
    color: '#FFB020',
    glow: 'rgba(255,176,32,0.4)',
    description: 'Keeps the lights on ☕',
  },
  supporter: {
    label: 'Supporter',
    icon: <HeartHandshake size={12} />,
    color: '#A855F7',
    glow: 'rgba(168,85,247,0.4)',
    description: 'Monthly supporter 💜',
  },
  champion: {
    label: 'Champion',
    icon: <Rocket size={12} />,
    color: '#13DDEC',
    glow: 'rgba(19,221,236,0.4)',
    description: 'Championing the future 🚀',
  },
};

interface DonorBadgeProps {
  tier: DonationTier;
  /** Compact mode for inline next to username */
  compact?: boolean;
}

/**
 * Renders a glowing donor badge with the tier-specific icon.
 * Use `compact` for inline chat display, full size for profiles/popups.
 */
export const DonorBadge: React.FC<DonorBadgeProps> = ({ tier, compact = false }) => {
  const config = DONATION_TIER_CONFIG[tier];
  if (!config) return null;

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded-full text-[8px] font-bold uppercase tracking-wider border shrink-0"
        style={{
          color: config.color,
          backgroundColor: `${config.color}15`,
          borderColor: `${config.color}30`,
          filter: `drop-shadow(0 0 3px ${config.glow})`,
        }}
        title={config.label}
      >
        {config.icon}
      </span>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border"
      style={{
        color: config.color,
        backgroundColor: `${config.color}12`,
        borderColor: `${config.color}25`,
        boxShadow: `0 0 8px ${config.glow}`,
      }}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
};
