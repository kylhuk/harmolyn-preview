import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/types';
import { AtSign } from 'lucide-react';

interface MentionAutocompleteProps {
  users: User[];
  query: string;
  onSelect: (user: User) => void;
  onClose: () => void;
  position?: 'above' | 'below';
}

export const MentionAutocomplete: React.FC<MentionAutocompleteProps> = ({ users, query, onSelect, onClose, position = 'above' }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = users.filter(u =>
    u.id !== 'me' && u.username.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (filtered[selectedIndex]) onSelect(filtered[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filtered, selectedIndex, onSelect, onClose]);

  if (filtered.length === 0) return null;

  const statusColors: Record<string, string> = {
    online: 'bg-accent-success',
    idle: 'bg-accent-warning',
    dnd: 'bg-accent-danger',
    offline: 'bg-white/20',
  };

  return (
    <div
      ref={listRef}
      className={`absolute ${position === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'} left-0 right-0 mx-3 glass-card rounded-r2 border border-stroke p-1.5 z-50 max-h-[280px] overflow-y-auto animate-in ${position === 'above' ? 'slide-in-from-bottom-2' : 'slide-in-from-top-2'} fade-in duration-150`}
    >
      <div className="micro-label text-text-tertiary px-2.5 py-1.5 flex items-center gap-1.5">
        <AtSign size={10} className="text-primary" />
        MEMBERS — {filtered.length}
      </div>
      {filtered.map((user, i) => (
        <button
          key={user.id}
          onClick={() => onSelect(user)}
          onMouseEnter={() => setSelectedIndex(i)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-r1 transition-all ${
            i === selectedIndex
              ? 'bg-primary/10 border border-primary/20 text-text-primary'
              : 'border border-transparent text-text-secondary hover:bg-white/5'
          }`}
        >
          <div className="relative flex-shrink-0">
            <img src={user.avatar} className="w-7 h-7 rounded-full border border-stroke" alt="" />
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-bg-0 ${statusColors[user.status] || 'bg-white/20'}`} />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <span className="text-xs font-bold truncate block" style={{ color: user.color || undefined }}>{user.username}</span>
            {user.role && <span className="text-[8px] text-text-disabled font-mono">{user.role}</span>}
          </div>
          {i === selectedIndex && (
            <span className="text-[8px] text-text-disabled font-mono">TAB ↵</span>
          )}
        </button>
      ))}
    </div>
  );
};
