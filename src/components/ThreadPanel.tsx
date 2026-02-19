import React, { useState } from 'react';
import { Message, User } from '@/types';
import { renderMarkdown } from '@/utils/markdown';
import { X, Send, Hash, MessageSquare } from 'lucide-react';

interface ThreadPanelProps {
  parentMessage: Message;
  parentUser: User;
  allUsers: User[];
  onClose: () => void;
}

const MOCK_THREAD_REPLIES: Message[] = [
  { id: 'tr1', userId: 'u2', content: 'Good point, I think we should investigate further.', timestamp: '10:32 AM' },
  { id: 'tr2', userId: 'u3', content: 'I ran the diagnostics — everything checks out on my end.', timestamp: '10:45 AM' },
];

export const ThreadPanel: React.FC<ThreadPanelProps> = ({ parentMessage, parentUser, allUsers, onClose }) => {
  const [replies, setReplies] = useState<Message[]>(MOCK_THREAD_REPLIES);
  const [input, setInput] = useState('');

  const getUser = (id: string): User => allUsers.find(u => u.id === id) || { id: 'unknown', username: 'Unknown', avatar: '', status: 'offline' as const };

  const handleSend = () => {
    if (!input.trim()) return;
    setReplies(prev => [...prev, {
      id: `tr-${Date.now()}`,
      userId: 'me',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
  };

  return (
    <>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-30 animate-in fade-in" onClick={onClose} />
      <div className="absolute top-0 right-0 bottom-0 w-[320px] max-w-full bg-bg-0 border-l border-white/10 z-40 flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
        {/* Header */}
        <div className="h-[52px] px-5 flex items-center justify-between border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="text-primary" />
            <div>
              <h3 className="font-bold text-white text-xs font-display">THREAD</h3>
              <span className="micro-label text-white/30 text-[8px]">{replies.length} REPLIES</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/40 hover:text-primary transition-colors rounded-full hover:bg-white/5">
            <X size={16} />
          </button>
        </div>

        {/* Parent message */}
        <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-1.5">
            <img src={parentUser.avatar} className="w-6 h-6 rounded-full" alt={parentUser.username} />
            <span className="text-xs font-bold" style={{ color: parentUser.color || '#F6F8F8' }}>{parentUser.username}</span>
            <span className="text-[9px] text-white/25 font-mono">{parentMessage.timestamp}</span>
          </div>
          <div className="text-xs text-white/70 leading-relaxed">{renderMarkdown(parentMessage.content)}</div>
        </div>

        {/* Replies */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {replies.map(reply => {
            const user = getUser(reply.userId);
            return (
              <div key={reply.id} className="flex gap-2.5">
                <img src={user.avatar} className="w-7 h-7 rounded-full mt-0.5 flex-shrink-0" alt={user.username} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-bold" style={{ color: user.color || '#F6F8F8' }}>{user.username}</span>
                    <span className="text-[8px] text-white/20 font-mono">{reply.timestamp}</span>
                  </div>
                  <div className="text-xs text-white/70 leading-relaxed">{renderMarkdown(reply.content)}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/5">
          <div className="glass-realistic rounded-r2 flex items-center p-1 focus-within:border-primary/50 transition-all">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder="REPLY // THREAD"
              className="flex-1 bg-transparent border-none focus:outline-none text-white px-3 font-mono text-xs placeholder-white/30"
            />
            <button onClick={handleSend} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-bg-0 shadow-glow-sm hover:scale-105 transition-all" aria-label="Send Reply">
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
