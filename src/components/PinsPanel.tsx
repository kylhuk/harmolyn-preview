
import React from 'react';
import { Message, User } from '@/types';
import { Pin, X, ArrowRight } from 'lucide-react';
import { renderMarkdown } from '@/utils/markdown';

interface PinsPanelProps {
  messages: Message[];
  users: User[];
  onClose: () => void;
  onJumpToMessage?: (msgId: string) => void;
  onUnpin?: (msgId: string) => void;
}

export const PinsPanel: React.FC<PinsPanelProps> = ({ messages, users, onClose, onJumpToMessage, onUnpin }) => {
  const pinnedMessages = messages.filter(m => m.pinned);

  const getUser = (id: string) => users.find(u => u.id === id) || { username: 'Unknown', avatar: '', color: '#F6F8F8' };

  return (
    <div className="w-[320px] h-full glass-realistic border-l border-white/5 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="h-[52px] px-5 flex items-center justify-between border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Pin size={14} className="text-primary" />
          <span className="text-xs font-bold text-white tracking-wide uppercase">Pinned Messages</span>
          <span className="text-[9px] font-mono text-white/30">{pinnedMessages.length}</span>
        </div>
        <button onClick={onClose} className="p-1.5 text-white/30 hover:text-white transition-colors rounded-full hover:bg-white/5" aria-label="Close">
          <X size={16} />
        </button>
      </div>

      {/* Pins list */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2.5">
        {pinnedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 rounded-r2 bg-white/3 border border-white/5 flex items-center justify-center mb-4">
              <Pin size={28} className="text-white/10" />
            </div>
            <p className="text-xs text-white/30 mb-1 font-bold">No pinned messages</p>
            <p className="text-[10px] text-white/15 font-mono">Pin important messages to find them here</p>
          </div>
        ) : (
          pinnedMessages.map(msg => {
            const user = getUser(msg.userId);
            return (
              <div
                key={msg.id}
                className="glass-card rounded-r2 border border-white/5 p-3.5 hover:border-primary/15 transition-all group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <img src={user.avatar} className="w-5 h-5 rounded-full border border-white/10" alt="" />
                  <span className="text-[11px] font-bold" style={{ color: user.color }}>{user.username}</span>
                  <span className="text-[8px] font-mono text-white/20 ml-auto">{msg.timestamp}</span>
                </div>
                <div className="text-[11px] text-white/60 leading-relaxed line-clamp-3 mb-2.5">
                  {renderMarkdown(msg.content)}
                </div>
                <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onJumpToMessage?.(msg.id)}
                    className="flex items-center gap-1 text-[9px] text-primary/70 hover:text-primary transition-colors font-bold"
                  >
                    Jump to message <ArrowRight size={10} />
                  </button>
                  <button
                    onClick={() => onUnpin?.(msg.id)}
                    className="text-[9px] text-white/20 hover:text-accent-danger transition-colors font-mono"
                  >
                    Unpin
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
