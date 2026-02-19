
import React from 'react';
import { Server, User } from '../types';
import { ChevronDown, Hash, Volume2, Mic, Headphones, Settings, UserPlus, X, LogOut, Radio, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { USERS, DIRECT_MESSAGES } from '../data';

interface ChannelRailProps {
  server?: Server;
  activeChannelId: string;
  currentUser: User;
  connectedVoiceChannelId: string | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelectChannel: (id: string) => void;
  onJoinVoice: (id: string) => void;
  onOpenSettings: () => void;
  isHome?: boolean;
}

export const ChannelRail: React.FC<ChannelRailProps> = ({ 
  server, 
  activeChannelId, 
  currentUser, 
  connectedVoiceChannelId,
  collapsed,
  onToggleCollapse,
  onSelectChannel, 
  onJoinVoice,
  onOpenSettings,
  isHome 
}) => {
  
  return (
    <div 
        className={`
            w-[280px] glass-realistic flex flex-col h-full transition-transform duration-300 ease-in-out
            ${collapsed ? '-translate-x-full' : 'translate-x-0'}
            ${isHome ? 'border-r border-white/5' : ''}
        `}
        role="complementary" 
        aria-label="Channel List"
    >
      {/* Collapsed Handle (Visible when collapsed) */}
      {collapsed && (
          <button 
            className="absolute right-[-12px] top-0 bottom-0 w-[12px] bg-bg-1 flex items-center justify-center hover:bg-bg-2 cursor-pointer transition-colors border-r border-white/5" 
            onClick={onToggleCollapse}
            aria-label="Expand Channel List"
          >
               <div className="w-1 h-8 bg-white/20 rounded-full"></div>
          </button>
      )}

      {/* Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b theme-border">
        <div className="flex items-center gap-2 overflow-hidden">
            <h2 className="font-bold theme-text truncate micro-label text-sm tracking-widest">{isHome ? 'System Hub' : server?.name}</h2>
        </div>
        <button onClick={onToggleCollapse} className="theme-text-dim hover:text-primary transition-colors" aria-label="Collapse Channel List">
            <PanelLeftClose size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 no-scrollbar">
        {isHome ? (
            <section>
                <div className="micro-label theme-text-dim mb-4 px-2">Direct Communications</div>
                <div className="space-y-2">
                    {DIRECT_MESSAGES.map(dm => {
                        const user = USERS.find(u => u.id === dm.userId);
                        if (!user) return null;
                        const active = activeChannelId === dm.id;
                        return (
                            <button 
                                key={dm.id} 
                                onClick={() => onSelectChannel(dm.id)}
                                className={`w-full flex items-center gap-3 p-2 rounded-r2 border transition-all cursor-pointer ${active ? 'bg-primary/10 border-primary/20 text-primary shadow-[inset_0_0_10px_rgba(19,221,236,0.1)]' : 'bg-transparent border-transparent theme-text-secondary hover:bg-white/5 hover:theme-text'}`}>
                                <div className="w-8 h-8 rounded-full overflow-hidden border theme-border">
                                    <img src={user.avatar} className="w-full h-full object-cover" alt={user.username} />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="text-sm font-bold truncate">{user.username}</div>
                                    <div className="text-[10px] opacity-60 truncate font-mono">{dm.lastMessage}</div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </section>
        ) : (
            server?.categories.map(cat => (
                <section key={cat.id}>
                    <div className="flex items-center justify-between micro-label theme-text-dim mb-3 px-2">
                        <span>{cat.name}</span>
                        <ChevronDown size={12} />
                    </div>
                    <div className="space-y-1">
                        {cat.channels.map(ch => {
                            const isVoice = ch.type === 'voice';
                            const isConnected = connectedVoiceChannelId === ch.id;
                            const active = activeChannelId === ch.id && !isVoice;
                            return (
                                <div key={ch.id}>
                                    <button 
                                        onClick={() => isVoice ? onJoinVoice(ch.id) : onSelectChannel(ch.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-r2 border transition-all cursor-pointer group ${active ? 'bg-primary/10 border-primary/20 text-primary shadow-inner' : 'bg-transparent border-transparent theme-text-secondary hover:bg-white/5 hover:theme-text'} ${isConnected ? 'bg-accent-success/10 border-accent-success/20 text-accent-success' : ''}`}>
                                        {isVoice ? <Volume2 size={16} /> : <Hash size={16} />}
                                        <span className="text-sm font-medium tracking-tight flex-1 text-left">{ch.name}</span>
                                        {ch.unreadCount && !active && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"></div>}
                                    </button>
                                    {isVoice && ch.activeUsers && ch.activeUsers.length > 0 && (
                                        <div className="ml-10 mt-2 space-y-2 pb-2">
                                            {ch.activeUsers.map(u => (
                                                <div key={u.id} className="flex items-center gap-2 text-xs text-white/50 hover:text-white cursor-pointer transition-colors">
                                                    <img src={u.avatar} className="w-4 h-4 rounded-full" alt="" />
                                                    <span className="font-mono">{u.username}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </section>
            ))
        )}
      </div>

      {/* Connection Bar */}
      {connectedVoiceChannelId && (
          <div className="p-4 bg-accent-success/5 border-t border-accent-success/10 flex items-center justify-between">
              <div>
                  <div className="micro-label text-accent-success flex items-center gap-2"><Radio size={10} className="animate-pulse" /> Linked</div>
                  <div className="text-[10px] text-white/50">ENC // VOICE NODE 04</div>
              </div>
              <button onClick={() => onJoinVoice('')} aria-label="Disconnect Voice" className="p-2 hover:bg-accent-danger/20 text-accent-danger rounded-full transition-colors"><LogOut size={16} /></button>
          </div>
      )}

      {/* User Footer */}
      <div className="p-4 bg-bg-0/50 border-t border-white/5 flex items-center gap-3">
        <button className="relative group cursor-pointer" onClick={onOpenSettings} aria-label="User Settings">
            <img src={currentUser.avatar} className="w-10 h-10 rounded-full border border-white/10 group-hover:border-primary transition-colors" alt="My Avatar" />
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-accent-success border-2 border-bg-0 shadow-[0_0_5px_#05FFA1]"></div>
        </button>
        <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate text-white tracking-tight">{currentUser.username}</div>
            <div className="text-[9px] font-mono text-white/40">ID // {currentUser.id.toUpperCase()}</div>
        </div>
        <div className="flex gap-1">
            <button aria-label="Mute Microphone" className="p-1.5 text-white/40 hover:text-primary transition-colors"><Mic size={16} /></button>
            <button aria-label="Deafen Audio" className="p-1.5 text-white/40 hover:text-primary transition-colors"><Headphones size={16} /></button>
            <button onClick={onOpenSettings} aria-label="Open Settings" className="p-1.5 text-white/40 hover:text-primary transition-colors"><Settings size={16} /></button>
        </div>
      </div>
    </div>
  );
};
