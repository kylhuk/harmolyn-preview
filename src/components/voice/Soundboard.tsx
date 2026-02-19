
import React, { useState } from 'react';
import { Volume2, VolumeX, Star, Search, X } from 'lucide-react';

interface SoundEffect {
  id: string;
  name: string;
  emoji: string;
  duration: string;
  favorited: boolean;
  category: string;
}

const MOCK_SOUNDS: SoundEffect[] = [
  { id: 's1', name: 'Air Horn', emoji: '📯', duration: '0:02', favorited: true, category: 'classic' },
  { id: 's2', name: 'Crickets', emoji: '🦗', duration: '0:03', favorited: false, category: 'nature' },
  { id: 's3', name: 'Rimshot', emoji: '🥁', duration: '0:01', favorited: true, category: 'classic' },
  { id: 's4', name: 'Sad Trombone', emoji: '🎺', duration: '0:02', favorited: false, category: 'classic' },
  { id: 's5', name: 'Applause', emoji: '👏', duration: '0:04', favorited: false, category: 'reactions' },
  { id: 's6', name: 'Bruh', emoji: '😐', duration: '0:01', favorited: true, category: 'memes' },
  { id: 's7', name: 'Vine Boom', emoji: '💥', duration: '0:01', favorited: false, category: 'memes' },
  { id: 's8', name: 'MLG Horn', emoji: '🔊', duration: '0:03', favorited: false, category: 'memes' },
  { id: 's9', name: 'Rain', emoji: '🌧️', duration: '0:05', favorited: false, category: 'nature' },
  { id: 's10', name: 'Whoosh', emoji: '💨', duration: '0:01', favorited: false, category: 'effects' },
  { id: 's11', name: 'Ding', emoji: '🔔', duration: '0:01', favorited: false, category: 'effects' },
  { id: 's12', name: 'Error', emoji: '❌', duration: '0:01', favorited: false, category: 'effects' },
];

const CATEGORIES = ['all', 'favorites', 'classic', 'memes', 'nature', 'reactions', 'effects'];

interface SoundboardProps {
  onClose: () => void;
}

export const Soundboard: React.FC<SoundboardProps> = ({ onClose }) => {
  const [sounds, setSounds] = useState<SoundEffect[]>(MOCK_SOUNDS);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [volume, setVolume] = useState(75);

  const toggleFavorite = (id: string) => {
    setSounds(prev => prev.map(s => s.id === id ? { ...s, favorited: !s.favorited } : s));
  };

  const playSound = (id: string) => {
    setPlayingId(id);
    setTimeout(() => setPlayingId(null), 1500);
  };

  const filtered = sounds.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCategory === 'favorites') return s.favorited;
    if (activeCategory !== 'all' && s.category !== activeCategory) return false;
    return true;
  });

  return (
    <div className="w-[320px] h-[420px] glass-card border border-white/10 rounded-r2 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 size={14} className="text-primary" />
          <span className="micro-label text-white/80 tracking-widest">SOUNDBOARD</span>
        </div>
        <button onClick={onClose} className="p-1 text-white/30 hover:text-white/60 transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 bg-surface-dark rounded-full border border-white/5 px-3 py-1.5">
          <Search size={12} className="text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search sounds..."
            className="flex-1 bg-transparent text-[11px] text-white placeholder-white/25 focus:outline-none"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
              activeCategory === cat
                ? 'bg-primary/15 border-primary/30 text-primary'
                : 'bg-white/3 border-white/5 text-white/40 hover:bg-white/5 hover:text-white/60'
            }`}
          >
            {cat === 'favorites' ? '⭐' : ''} {cat}
          </button>
        ))}
      </div>

      {/* Sound Grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 no-scrollbar">
        <div className="grid grid-cols-3 gap-2">
          {filtered.map(sound => (
            <button
              key={sound.id}
              onClick={() => playSound(sound.id)}
              className={`relative flex flex-col items-center gap-1 p-2.5 rounded-r1 border transition-all cursor-pointer group ${
                playingId === sound.id
                  ? 'bg-primary/15 border-primary/30 scale-95'
                  : 'bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/10'
              }`}
            >
              <span className="text-xl">{sound.emoji}</span>
              <span className="text-[9px] font-bold text-white/70 truncate w-full text-center">{sound.name}</span>
              <span className="text-[7px] font-mono text-white/30">{sound.duration}</span>
              {/* Favorite star */}
              <button
                onClick={e => { e.stopPropagation(); toggleFavorite(sound.id); }}
                className={`absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity ${sound.favorited ? '!opacity-100 text-accent-warning' : 'text-white/20'}`}
              >
                <Star size={10} fill={sound.favorited ? 'currentColor' : 'none'} />
              </button>
              {/* Playing indicator */}
              {playingId === sound.id && (
                <div className="absolute inset-0 rounded-r1 border-2 border-primary animate-pulse pointer-events-none" />
              )}
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-20 text-white/20 text-[10px] font-mono">NO SOUNDS FOUND</div>
        )}
      </div>

      {/* Volume */}
      <div className="px-4 py-2.5 border-t border-white/5 flex items-center gap-3">
        <VolumeX size={12} className="text-white/30" />
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={e => setVolume(Number(e.target.value))}
          className="flex-1 accent-primary h-1"
        />
        <Volume2 size={12} className="text-white/30" />
        <span className="text-[9px] font-mono text-white/40 w-8 text-right">{volume}%</span>
      </div>
    </div>
  );
};
