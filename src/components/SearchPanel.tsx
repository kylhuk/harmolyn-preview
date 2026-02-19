import React, { useState } from 'react';
import { Search, Filter, X, User, Hash, Calendar, FileText, Image, Link, AtSign } from 'lucide-react';
import { USERS, MOCK_MESSAGES } from '@/data';
import { renderMarkdown } from '@/utils/markdown';

interface SearchPanelProps {
  onClose: () => void;
}

type FilterType = 'from' | 'mentions' | 'has' | 'before' | 'after' | null;

interface SearchFilter {
  type: string;
  value: string;
  label: string;
}

const HAS_OPTIONS = [
  { value: 'file', label: 'File', icon: <FileText size={12} /> },
  { value: 'image', label: 'Image', icon: <Image size={12} /> },
  { value: 'link', label: 'Link', icon: <Link size={12} /> },
  { value: 'embed', label: 'Embed', icon: <Hash size={12} /> },
];

export const SearchPanel: React.FC<SearchPanelProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState<FilterType>(null);

  const addFilter = (type: string, value: string, label: string) => {
    setFilters(f => [...f.filter(ff => !(ff.type === type && ff.value === value)), { type, value, label }]);
    setShowFilterMenu(null);
  };

  const removeFilter = (index: number) => {
    setFilters(f => f.filter((_, i) => i !== index));
  };

  // Simple mock search
  const results = query.trim().length > 0
    ? MOCK_MESSAGES.filter(m =>
        m.content.toLowerCase().includes(query.toLowerCase()) &&
        (!filters.some(f => f.type === 'from') || filters.some(f => f.type === 'from' && f.value === m.userId))
      )
    : [];

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-bg-0/95 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <Search size={18} className="text-primary" />
          <h2 className="text-title font-semibold text-text-primary flex-1">SEARCH // CHANNEL</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full glass-panel border border-stroke-subtle flex items-center justify-center text-text-secondary hover:text-primary transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search messages..."
            autoFocus
            className="w-full h-12 pl-10 pr-4 rounded-full bg-surface-dark border border-stroke-subtle text-text-primary text-body placeholder:text-text-disabled focus:border-stroke-primary focus:outline-none transition-colors"
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <button onClick={() => setShowFilterMenu(showFilterMenu === 'from' ? null : 'from')} className="px-3 py-1.5 rounded-full text-[10px] font-bold border border-stroke-subtle text-text-secondary hover:bg-white/5 flex items-center gap-1.5 transition-all">
            <User size={10} /> From
          </button>
          <button onClick={() => setShowFilterMenu(showFilterMenu === 'has' ? null : 'has')} className="px-3 py-1.5 rounded-full text-[10px] font-bold border border-stroke-subtle text-text-secondary hover:bg-white/5 flex items-center gap-1.5 transition-all">
            <Filter size={10} /> Has
          </button>
          <button onClick={() => setShowFilterMenu(showFilterMenu === 'before' ? null : 'before')} className="px-3 py-1.5 rounded-full text-[10px] font-bold border border-stroke-subtle text-text-secondary hover:bg-white/5 flex items-center gap-1.5 transition-all">
            <Calendar size={10} /> Date
          </button>

          {filters.map((f, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/15 text-primary border border-primary/30 flex items-center gap-1.5">
              {f.type}: {f.label}
              <button onClick={() => removeFilter(i)} className="hover:text-white transition-colors"><X size={9} /></button>
            </span>
          ))}
        </div>

        {/* Filter dropdown */}
        {showFilterMenu === 'from' && (
          <div className="mt-2 glass-card rounded-r2 border border-stroke p-2 max-h-40 overflow-y-auto">
            {USERS.filter(u => u.id !== 'me').map(u => (
              <button key={u.id} onClick={() => addFilter('from', u.id, u.username)} className="w-full flex items-center gap-2 px-3 py-2 rounded-r1 text-text-secondary hover:bg-white/5 hover:text-text-primary text-xs transition-all">
                <img src={u.avatar} className="w-5 h-5 rounded-full" alt="" />
                {u.username}
              </button>
            ))}
          </div>
        )}
        {showFilterMenu === 'has' && (
          <div className="mt-2 glass-card rounded-r2 border border-stroke p-2">
            {HAS_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => addFilter('has', opt.value, opt.label)} className="w-full flex items-center gap-2 px-3 py-2 rounded-r1 text-text-secondary hover:bg-white/5 hover:text-text-primary text-xs transition-all">
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {query.trim().length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-tertiary gap-3">
            <Search size={40} className="text-white/10" />
            <p className="text-body text-text-secondary">Start typing to search</p>
            <p className="text-caption text-text-disabled">Use filters to narrow results</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-tertiary gap-3">
            <Search size={40} className="text-white/10" />
            <p className="text-body text-text-secondary">No results found</p>
          </div>
        ) : (
          <>
            <div className="micro-label text-text-tertiary mb-3">{results.length} RESULT{results.length !== 1 ? 'S' : ''}</div>
            {results.map(msg => {
              const user = USERS.find(u => u.id === msg.userId);
              return (
                <div key={msg.id} className="glass-card rounded-r2 p-3 border border-stroke hover:border-stroke-strong transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-1.5">
                    {user && <img src={user.avatar} className="w-5 h-5 rounded-full" alt="" />}
                    <span className="text-xs font-bold text-text-primary">{user?.username}</span>
                    <span className="text-[9px] text-text-disabled font-mono">{msg.timestamp}</span>
                  </div>
                  <div className="text-caption text-text-secondary">{renderMarkdown(msg.content)}</div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
