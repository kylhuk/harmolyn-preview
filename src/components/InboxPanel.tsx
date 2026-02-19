import React, { useState } from 'react';
import { Inbox, X, AtSign, Reply, Hash, Bell } from 'lucide-react';
import { USERS, MOCK_MESSAGES } from '@/data';

interface InboxPanelProps {
  onClose: () => void;
}

interface InboxItem {
  id: string;
  type: 'mention' | 'reply';
  messageId: string;
  channelName: string;
  serverName: string;
  timestamp: string;
  read: boolean;
}

const MOCK_INBOX: InboxItem[] = [
  { id: 'ib1', type: 'mention', messageId: 'm2', channelName: 'general', serverName: 'Nexus Underground', timestamp: '5 min ago', read: false },
  { id: 'ib2', type: 'reply', messageId: 'm3', channelName: 'dev-ops', serverName: 'Nexus Underground', timestamp: '1 hour ago', read: false },
  { id: 'ib3', type: 'mention', messageId: 'm5', channelName: 'random', serverName: 'Cyber Collective', timestamp: '3 hours ago', read: true },
  { id: 'ib4', type: 'reply', messageId: 'm1', channelName: 'general', serverName: 'Nexus Underground', timestamp: '1 day ago', read: true },
];

type InboxFilter = 'all' | 'mentions' | 'replies';

export const InboxPanel: React.FC<InboxPanelProps> = ({ onClose }) => {
  const [filter, setFilter] = useState<InboxFilter>('all');
  const [items, setItems] = useState(MOCK_INBOX);

  const filtered = items.filter(item => {
    if (filter === 'mentions') return item.type === 'mention';
    if (filter === 'replies') return item.type === 'reply';
    return true;
  });

  const unreadCount = items.filter(i => !i.read).length;

  const markAllRead = () => {
    setItems(items.map(i => ({ ...i, read: true })));
  };

  return (
    <div className="absolute right-0 top-[52px] bottom-0 w-[380px] z-50 glass-card border-l border-stroke flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Inbox size={18} className="text-primary" />
            <h2 className="text-title font-semibold text-text-primary">INBOX</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-accent-danger/20 text-accent-danger text-[10px] font-bold border border-accent-danger/30">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={markAllRead} className="text-[10px] text-primary hover:underline font-bold">Mark all read</button>
            <button onClick={onClose} className="w-7 h-7 rounded-full glass-panel border border-stroke-subtle flex items-center justify-center text-text-secondary hover:text-primary transition-all">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-glass-overlay rounded-full border border-stroke-subtle p-0.5">
          {(['all', 'mentions', 'replies'] as InboxFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                filter === f ? 'bg-primary text-bg-0' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-tertiary gap-3">
            <Inbox size={32} className="text-white/10" />
            <p className="text-body text-text-secondary">No notifications</p>
          </div>
        ) : (
          filtered.map(item => {
            const msg = MOCK_MESSAGES.find(m => m.id === item.messageId);
            const user = msg ? USERS.find(u => u.id === msg.userId) : null;
            return (
              <div key={item.id} className={`glass-card rounded-r2 p-3 border transition-all cursor-pointer group ${item.read ? 'border-stroke hover:border-stroke-strong' : 'border-primary/20 bg-primary/[0.03]'}`}>
                <div className="flex items-start gap-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${item.type === 'mention' ? 'bg-primary/10 text-primary' : 'bg-accent-purple/10 text-accent-purple'}`}>
                    {item.type === 'mention' ? <AtSign size={12} /> : <Reply size={12} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {user && <img src={user.avatar} className="w-4 h-4 rounded-full" alt="" />}
                      <span className="text-xs font-bold text-text-primary">{user?.username}</span>
                      <span className="text-[9px] text-text-disabled">{item.timestamp}</span>
                      {!item.read && <div className="w-1.5 h-1.5 rounded-full bg-primary ml-auto flex-shrink-0" />}
                    </div>
                    <p className="text-caption text-text-secondary line-clamp-2">{msg?.content || 'Message content'}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-text-disabled">
                      <Hash size={8} />
                      <span>{item.channelName}</span>
                      <span>•</span>
                      <span>{item.serverName}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
