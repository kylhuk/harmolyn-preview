import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SERVERS, DIRECT_MESSAGES, USERS } from '@/data';
import { Search, Hash, AtSign, Volume2, X, ArrowRight } from 'lucide-react';

interface QuickSwitcherProps {
  onClose: () => void;
  onNavigate: (serverId: string, channelId: string) => void;
}

interface SwitcherResult {
  id: string;
  label: string;
  sublabel: string;
  type: 'text' | 'voice' | 'dm';
  serverId: string;
  channelId: string;
}

export const QuickSwitcher: React.FC<QuickSwitcherProps> = ({ onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    const items: SwitcherResult[] = [];

    // Add DMs
    DIRECT_MESSAGES.forEach(dm => {
      const user = USERS.find(u => u.id === dm.userId);
      if (user) {
        items.push({
          id: dm.id,
          label: user.username,
          sublabel: 'Direct Message',
          type: 'dm',
          serverId: 'home',
          channelId: dm.id,
        });
      }
    });

    // Add server channels
    SERVERS.forEach(server => {
      server.categories.forEach(cat => {
        cat.channels.forEach(ch => {
          items.push({
            id: ch.id,
            label: ch.name,
            sublabel: `${server.name} › ${cat.name}`,
            type: ch.type,
            serverId: server.id,
            channelId: ch.id,
          });
        });
      });
    });

    if (!query.trim()) return items.slice(0, 8);

    const q = query.toLowerCase();
    return items
      .filter(i => i.label.toLowerCase().includes(q) || i.sublabel.toLowerCase().includes(q))
      .slice(0, 10);
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      const r = results[selectedIndex];
      onNavigate(r.serverId, r.channelId);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const TypeIcon = ({ type }: { type: string }) => {
    if (type === 'dm') return <AtSign size={14} className="text-primary/60" />;
    if (type === 'voice') return <Volume2 size={14} className="text-accent-success/60" />;
    return <Hash size={14} className="text-white/40" />;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[540px] mx-4 glass-card bg-bg-0 border border-white/10 rounded-r2 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <Search size={18} className="text-primary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="JUMP TO // CHANNEL OR DM"
            className="flex-1 bg-transparent text-white text-sm font-mono placeholder-white/30 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-white/30 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[320px] overflow-y-auto no-scrollbar p-2">
          {results.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-white/20 text-xs font-mono">NO RESULTS // TRY DIFFERENT QUERY</p>
            </div>
          ) : (
            results.map((r, i) => (
              <button
                key={r.id}
                onClick={() => { onNavigate(r.serverId, r.channelId); onClose(); }}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-r1 text-left transition-all ${
                  i === selectedIndex
                    ? 'bg-primary/10 border border-primary/20'
                    : 'border border-transparent hover:bg-white/5'
                }`}
              >
                <TypeIcon type={r.type} />
                <div className="flex-1 min-w-0">
                  <span className="text-white text-xs font-bold block truncate">{r.label}</span>
                  <span className="text-white/30 text-[10px] font-mono truncate block">{r.sublabel}</span>
                </div>
                {i === selectedIndex && <ArrowRight size={12} className="text-primary/50 flex-shrink-0" />}
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-2 border-t border-white/5 flex items-center gap-4">
          <span className="text-[9px] text-white/20 font-mono">↑↓ NAVIGATE</span>
          <span className="text-[9px] text-white/20 font-mono">ENTER SELECT</span>
          <span className="text-[9px] text-white/20 font-mono">ESC CLOSE</span>
        </div>
      </div>
    </div>
  );
};
