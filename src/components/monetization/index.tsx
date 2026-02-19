
import React, { useState } from 'react';
import { Zap, Crown, Sparkles, Palette, Upload, Star, Gift, ChevronRight, X, ShoppingBag, Gamepad2, Trophy, Clock, CheckCircle2, Lock } from 'lucide-react';

/* ===== Nitro ===== */

interface NitroPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  perks: string[];
  color: string;
  popular?: boolean;
}

const NITRO_PLANS: NitroPlan[] = [
  {
    id: 'basic', name: 'Nitro Basic', price: '$2.99', period: '/month',
    perks: ['50 MB upload limit', 'Custom emoji anywhere', 'HD video streaming', 'Special badge'],
    color: '#13DDEC',
  },
  {
    id: 'standard', name: 'Nitro', price: '$9.99', period: '/month',
    perks: ['500 MB upload limit', 'Custom emoji + stickers', '4K/60fps streaming', '2 Server Boosts', 'Animated avatar', 'Custom profiles', 'Priority support'],
    color: '#A855F7', popular: true,
  },
];

export const NitroScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 z-[100] bg-bg-0 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
      <button onClick={onClose} className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full border border-white/10 glass-panel flex items-center justify-center hover:border-primary hover:shadow-glow-sm transition-all">
        <X size={18} className="text-white/60" />
      </button>

      {/* Hero */}
      <div className="relative overflow-hidden py-16 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/15 via-primary/10 to-pink-500/10" />
        <div className="absolute inset-0 grid-overlay opacity-15" />
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-purple to-pink-500 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
            <Crown size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white font-display tracking-tight mb-2">HARMOLYN NITRO</h1>
          <p className="text-sm text-white/40 max-w-md mx-auto">Unlock the full potential of your Harmolyn experience with premium features and perks.</p>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-[600px] mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {NITRO_PLANS.map(plan => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`glass-card rounded-r2 p-5 border cursor-pointer transition-all relative overflow-hidden ${
                selectedPlan === plan.id
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple text-[8px] font-bold uppercase">POPULAR</span>
                </div>
              )}
              <div className="w-12 h-12 rounded-r2 flex items-center justify-center mb-4" style={{ backgroundColor: `${plan.color}15` }}>
                <Sparkles size={22} style={{ color: plan.color }} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-0.5 mb-4">
                <span className="text-2xl font-bold text-white font-display">{plan.price}</span>
                <span className="text-xs text-white/30">{plan.period}</span>
              </div>
              <div className="space-y-2">
                {plan.perks.map((perk, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-white/50">
                    <CheckCircle2 size={12} style={{ color: plan.color }} />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selectedPlan && (
          <button className="w-full py-4 rounded-full bg-gradient-to-r from-accent-purple to-pink-500 text-white font-bold text-sm hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all">
            SUBSCRIBE NOW
          </button>
        )}
      </div>
    </div>
  );
};

/* ===== Shop ===== */

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: 'avatar' | 'profile' | 'effects' | 'collectible';
  image: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 's1', name: 'Neon Frame', description: 'Glowing cyan avatar frame', price: '$1.99', category: 'avatar', image: '🖼️', rarity: 'rare' },
  { id: 's2', name: 'Holographic Banner', description: 'Animated profile banner', price: '$4.99', category: 'profile', image: '🌈', rarity: 'epic' },
  { id: 's3', name: 'Sparkle Effect', description: 'Add sparkles to your messages', price: '$2.99', category: 'effects', image: '✨', rarity: 'common' },
  { id: 's4', name: 'Cyber Badge', description: 'Exclusive collector badge', price: '$7.99', category: 'collectible', image: '🏆', rarity: 'legendary' },
  { id: 's5', name: 'Ghost Mode Frame', description: 'Translucent avatar frame', price: '$1.49', category: 'avatar', image: '👻', rarity: 'common' },
  { id: 's6', name: 'Pixel Burst', description: 'Pixel explosion message effect', price: '$3.49', category: 'effects', image: '💥', rarity: 'rare' },
];

const rarityColors = {
  common: 'text-white/50',
  rare: 'text-primary',
  epic: 'text-accent-purple',
  legendary: 'text-accent-warning',
};

export const ShopScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [category, setCategory] = useState<string>('all');
  const cats = ['all', 'avatar', 'profile', 'effects', 'collectible'];
  const filtered = category === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter(i => i.category === category);

  return (
    <div className="absolute inset-0 z-[100] bg-bg-0 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
      <button onClick={onClose} className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full border border-white/10 glass-panel flex items-center justify-center hover:border-primary hover:shadow-glow-sm transition-all">
        <X size={18} className="text-white/60" />
      </button>

      <div className="max-w-[700px] mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingBag size={24} className="text-primary" />
          <h1 className="text-2xl font-bold text-white font-display tracking-tight">SHOP</h1>
        </div>
        <p className="micro-label text-white/30 mb-8">CUSTOMIZE // COLLECT // EXPRESS</p>

        {/* Category Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {cats.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                category === c
                  ? 'bg-primary/15 border-primary/30 text-primary'
                  : 'bg-white/3 border-white/5 text-white/30 hover:bg-white/5'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map(item => (
            <div key={item.id} className="glass-card rounded-r2 p-4 border border-white/5 hover:border-primary/20 transition-all cursor-pointer group">
              <div className="text-4xl mb-3 text-center">{item.image}</div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-white">{item.name}</h3>
                {item.rarity && (
                  <span className={`text-[8px] font-bold uppercase tracking-wider ${rarityColors[item.rarity]}`}>{item.rarity}</span>
                )}
              </div>
              <p className="text-[10px] text-white/35 mb-3">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary">{item.price}</span>
                <button className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold hover:bg-primary/20 transition-all opacity-0 group-hover:opacity-100">
                  BUY
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ===== Quests ===== */

interface Quest {
  id: string;
  title: string;
  description: string;
  reward: string;
  progress: number;
  maxProgress: number;
  type: 'daily' | 'weekly' | 'special';
  expiresIn?: string;
  completed?: boolean;
}

const MOCK_QUESTS: Quest[] = [
  { id: 'qst1', title: 'Social Butterfly', description: 'Send 50 messages across any server', reward: '100 Gems', progress: 32, maxProgress: 50, type: 'daily' },
  { id: 'qst2', title: 'Voice Voyager', description: 'Spend 30 minutes in voice channels', reward: '200 Gems', progress: 12, maxProgress: 30, type: 'daily' },
  { id: 'qst3', title: 'Reactor', description: 'Add 20 reactions to messages', reward: '50 Gems', progress: 20, maxProgress: 20, type: 'daily', completed: true },
  { id: 'qst4', title: 'Community Champion', description: 'Complete 5 daily quests this week', reward: 'Exclusive Badge', progress: 3, maxProgress: 5, type: 'weekly' },
  { id: 'qst5', title: 'Founding Member', description: 'Be among the first 1000 to complete this quest', reward: 'Legendary Avatar Frame', progress: 0, maxProgress: 1, type: 'special', expiresIn: '3 days' },
];

const questTypeColors = {
  daily: { color: 'text-primary', bg: 'bg-primary/15', border: 'border-primary/20' },
  weekly: { color: 'text-accent-purple', bg: 'bg-accent-purple/15', border: 'border-accent-purple/20' },
  special: { color: 'text-accent-warning', bg: 'bg-accent-warning/15', border: 'border-accent-warning/20' },
};

export const QuestsScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [filter, setFilter] = useState<string>('all');
  const types = ['all', 'daily', 'weekly', 'special'];
  const filtered = filter === 'all' ? MOCK_QUESTS : MOCK_QUESTS.filter(q => q.type === filter);

  return (
    <div className="absolute inset-0 z-[100] bg-bg-0 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
      <button onClick={onClose} className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full border border-white/10 glass-panel flex items-center justify-center hover:border-primary hover:shadow-glow-sm transition-all">
        <X size={18} className="text-white/60" />
      </button>

      <div className="max-w-[600px] mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-2">
          <Trophy size={24} className="text-accent-warning" />
          <h1 className="text-2xl font-bold text-white font-display tracking-tight">QUESTS</h1>
        </div>
        <p className="micro-label text-white/30 mb-8">CHALLENGES // REWARDS // GLORY</p>

        {/* Gem Balance */}
        <div className="glass-card rounded-r2 p-5 border border-white/8 mb-6 flex items-center justify-between">
          <div>
            <div className="micro-label text-white/30 mb-1">YOUR BALANCE</div>
            <div className="text-2xl font-bold text-white font-display flex items-center gap-2">
              <span className="text-accent-warning">💎</span> 1,250
            </div>
          </div>
          <button className="px-4 py-2 rounded-full bg-accent-warning/10 border border-accent-warning/20 text-accent-warning text-xs font-bold hover:bg-accent-warning/20 transition-all">
            REDEEM
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                filter === t
                  ? 'bg-primary/15 border-primary/30 text-primary'
                  : 'bg-white/3 border-white/5 text-white/30 hover:bg-white/5'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Quest List */}
        <div className="space-y-3">
          {filtered.map(quest => {
            const tc = questTypeColors[quest.type];
            const pct = (quest.progress / quest.maxProgress) * 100;
            return (
              <div key={quest.id} className={`glass-card rounded-r2 p-4 border transition-all ${quest.completed ? 'border-accent-success/20 opacity-60' : 'border-white/5'}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-white">{quest.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${tc.bg} ${tc.color} border ${tc.border}`}>
                        {quest.type}
                      </span>
                      {quest.completed && (
                        <CheckCircle2 size={14} className="text-accent-success" />
                      )}
                    </div>
                    <p className="text-[11px] text-white/40">{quest.description}</p>
                  </div>
                  {quest.expiresIn && (
                    <span className="flex items-center gap-1 text-[9px] text-accent-warning font-mono flex-shrink-0">
                      <Clock size={10} /> {quest.expiresIn}
                    </span>
                  )}
                </div>

                {/* Progress */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${quest.completed ? 'bg-accent-success' : 'bg-primary'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-white/30 flex-shrink-0">
                    {quest.progress}/{quest.maxProgress}
                  </span>
                </div>

                {/* Reward */}
                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-white/25">
                  <Gift size={10} />
                  <span>Reward: <span className="text-accent-warning font-bold">{quest.reward}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
