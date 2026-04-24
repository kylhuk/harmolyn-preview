
import React, { useState, useRef, useEffect } from 'react';
import { Send, Hash, ChevronDown, ChevronUp } from 'lucide-react';

interface VoiceTextMessage {
  id: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
}

const MOCK_VOICE_MESSAGES: VoiceTextMessage[] = [
  { id: 'vt1', username: 'cipher_core', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cipher', content: 'Can everyone hear me okay?', timestamp: '22:14' },
  { id: 'vt2', username: 'nova_pulse', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nova', content: 'Loud and clear 👍', timestamp: '22:14' },
  { id: 'vt3', username: 'echo_drift', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=echo', content: 'Sharing my screen in a sec', timestamp: '22:15' },
];

interface VoiceTextChatProps {
  channelName: string;
  disabledReason?: string;
}

export const VoiceTextChat: React.FC<VoiceTextChatProps> = ({ channelName, disabledReason }) => {
  const [messages, setMessages] = useState<VoiceTextMessage[]>(MOCK_VOICE_MESSAGES);
  const [input, setInput] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: `vt${Date.now()}`,
      username: 'You',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
  };

  return (
    <div className="border-t border-white/5 bg-bg-0/60 backdrop-blur-sm">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Hash size={12} className="text-primary" />
          <span className="text-[10px] font-bold text-white/60 tracking-wide uppercase">{channelName} // TEXT</span>
        </div>
        {collapsed ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
      </button>

      {!collapsed && (
        <>
          {disabledReason && (
            <div className="mx-3 mt-2 rounded-r1 border border-accent-warning/20 bg-accent-warning/10 px-3 py-2 text-[9px] font-mono text-accent-warning">
              {disabledReason}
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="max-h-[200px] overflow-y-auto px-3 py-2 space-y-2 no-scrollbar">
            {messages.map(msg => (
              <div key={msg.id} className="flex items-start gap-2 group">
                <img src={msg.avatar} className="w-5 h-5 rounded-full border border-white/10 mt-0.5 flex-shrink-0" alt="" />
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-bold text-white/80">{msg.username}</span>
                    <span className="text-[8px] font-mono text-white/20">{msg.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-white/60 break-words">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 pb-2.5 pt-1">
            <div className="flex items-center gap-2 bg-surface-dark rounded-full border border-white/5 px-3 py-1.5">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder={disabledReason ? 'Join voice to chat' : 'Message voice chat...'}
                  disabled={Boolean(disabledReason)}
                  className="flex-1 bg-transparent text-[11px] text-white placeholder-white/25 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || Boolean(disabledReason)}
                  className="p-1 text-primary/50 hover:text-primary disabled:text-white/15 transition-colors"
                  aria-label="Send"
                >
                  <Send size={12} />
                </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
