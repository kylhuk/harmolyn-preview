
import React, { useState } from 'react';
import { Server, User, UserStatus } from '@/types';
import { ChevronDown, Hash, Volume2, Mic, Headphones, Settings, UserPlus, X, LogOut, Radio, PanelLeftClose, PanelLeftOpen, ArrowUpDown, Zap, FileText } from 'lucide-react';
import { USERS, DIRECT_MESSAGES, CURRENT_USER } from '@/data';
import { StatusPicker } from '@/components/StatusPicker';
import { AccountSwitcher } from '@/components/AccountSwitcher';
import { VoiceControlBar } from '@/components/voice/VoiceControlBar';
import { VoiceTextChat } from '@/components/voice/VoiceTextChat';
import { useFeature } from '@/hooks/useFeature';
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
  onOpenServerSettings?: () => void;
  onOpenBoost?: () => void;
  onOpenApplications?: () => void;
  onOpenActivities?: () => void;
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
  onOpenServerSettings,
  onOpenBoost,
  onOpenApplications,
  onOpenActivities,
  isHome 
}) => {
  
  return (
    <div 
        className={`
            w-[224px] glass-realistic flex flex-col h-full transition-transform duration-300 ease-in-out
            ${collapsed ? '-translate-x-full' : 'translate-x-0'}
            ${isHome ? 'border-r border-white/5' : ''}
        `}
        role="complementary" 
        aria-label="Channel List"
    >
      {/* Collapsed Handle (Visible when collapsed) */}
      {collapsed && (
          <button 
            className="absolute right-[-10px] top-0 bottom-0 w-[10px] bg-bg-1 flex items-center justify-center hover:bg-bg-2 cursor-pointer transition-colors border-r border-white/5" 
            onClick={onToggleCollapse}
            aria-label="Expand Channel List"
          >
               <div className="w-1 h-6 bg-white/20 rounded-full"></div>
          </button>
      )}

      {/* Header */}
      <div className="h-[52px] px-5 flex items-center justify-between border-b theme-border">
        <div className="flex items-center gap-2 overflow-hidden">
            <h2 className="font-bold theme-text truncate micro-label text-xs tracking-widest">{isHome ? 'System Hub' : server?.name}</h2>
        </div>
        <div className="flex items-center gap-1">
          {!isHome && onOpenBoost && (
            <button onClick={onOpenBoost} className="theme-text-dim hover:text-accent-purple transition-colors" aria-label="Server Boost" title="Boost Server">
              <Zap size={14} />
            </button>
          )}
          {!isHome && onOpenApplications && (
            <button onClick={onOpenApplications} className="theme-text-dim hover:text-accent-warning transition-colors" aria-label="Applications" title="Applications">
              <FileText size={14} />
            </button>
          )}
          {!isHome && onOpenServerSettings && (
            <button onClick={onOpenServerSettings} className="theme-text-dim hover:text-primary transition-colors" aria-label="Server Settings">
              <Settings size={14} />
            </button>
          )}
          <button onClick={onToggleCollapse} className="theme-text-dim hover:text-primary transition-colors" aria-label="Collapse Channel List">
              <PanelLeftClose size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6 no-scrollbar">
        {isHome ? (
            <section>
                <div className="micro-label theme-text-dim mb-3 px-2">Direct Communications</div>
                <div className="space-y-1.5">
                    {DIRECT_MESSAGES.map(dm => {
                        const user = USERS.find(u => u.id === dm.userId);
                        if (!user) return null;
                        const active = activeChannelId === dm.id;
                        return (
                            <button 
                                key={dm.id} 
                                onClick={() => onSelectChannel(dm.id)}
                                className={`w-full flex items-center gap-2.5 p-1.5 rounded-r2 border transition-all cursor-pointer btn-press ${active ? 'bg-primary/10 border-primary/20 text-primary shadow-[inset_0_0_10px_rgba(19,221,236,0.1)]' : 'bg-transparent border-transparent theme-text-secondary hover:bg-white/5 hover:theme-text'}`}>
                                <div className="w-7 h-7 rounded-full overflow-hidden border theme-border">
                                    <img src={user.avatar} className="w-full h-full object-cover" alt={user.username} />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="text-xs font-bold truncate">{user.username}</div>
                                    <div className="text-[9px] opacity-60 truncate font-mono">{dm.lastMessage}</div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </section>
        ) : (
            server?.categories.map(cat => (
                <section key={cat.id}>
                    <div className="flex items-center justify-between micro-label theme-text-dim mb-2.5 px-2">
                        <span>{cat.name}</span>
                        <ChevronDown size={10} />
                    </div>
                    <div className="space-y-0.5">
                        {cat.channels.map(ch => {
                            const isVoice = ch.type === 'voice';
                            const isConnected = connectedVoiceChannelId === ch.id;
                            const active = activeChannelId === ch.id && !isVoice;
                            return (
                                <div key={ch.id}>
                                    <button 
                                        onClick={() => isVoice ? onJoinVoice(ch.id) : onSelectChannel(ch.id)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-r2 border transition-all cursor-pointer group btn-press ${active ? 'bg-primary/10 border-primary/20 text-primary shadow-inner' : 'bg-transparent border-transparent theme-text-secondary hover:bg-white/5 hover:theme-text'} ${isConnected ? 'bg-accent-success/10 border-accent-success/20 text-accent-success' : ''}`}>
                                        {isVoice ? <Volume2 size={14} /> : <Hash size={14} />}
                                        <span className="text-xs font-medium tracking-tight flex-1 text-left">{ch.name}</span>
                                        {ch.unreadCount && !active && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"></div>}
                                    </button>
                                    {isVoice && ch.activeUsers && ch.activeUsers.length > 0 && (
                                        <div className="ml-8 mt-1.5 space-y-1.5 pb-1.5">
                                            {ch.activeUsers.map(u => (
                                                <div key={u.id} className="flex items-center gap-1.5 text-[10px] text-white/50 hover:text-white cursor-pointer transition-colors">
                                                    <img src={u.avatar} className="w-3.5 h-3.5 rounded-full" alt="" />
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

      {/* Voice Control Bar */}
      {connectedVoiceChannelId && useFeature('voiceControlBar') ? (
        <>
          <VoiceControlBar
            channelName={
              server?.categories.flatMap(c => c.channels).find(ch => ch.id === connectedVoiceChannelId)?.name || 'Voice'
            }
            onDisconnect={() => onJoinVoice('')}
            onOpenActivities={onOpenActivities}
          />
          {useFeature('voiceTextChat') && (
            <VoiceTextChat
              channelName={
                server?.categories.flatMap(c => c.channels).find(ch => ch.id === connectedVoiceChannelId)?.name || 'voice'
              }
            />
          )}
        </>
      ) : connectedVoiceChannelId ? (
        <div className="p-3 bg-accent-success/5 border-t border-accent-success/10 flex items-center justify-between">
          <div>
            <div className="micro-label text-accent-success flex items-center gap-1.5"><Radio size={9} className="animate-pulse" /> Linked</div>
            <div className="text-[9px] text-white/50">ENC // VOICE NODE 04</div>
          </div>
          <button onClick={() => onJoinVoice('')} aria-label="Disconnect Voice" className="p-1.5 hover:bg-accent-danger/20 text-accent-danger rounded-full transition-colors"><LogOut size={14} /></button>
        </div>
      ) : null}

      {/* User Footer */}
      <UserFooter currentUser={currentUser} onOpenSettings={onOpenSettings} />
    </div>
  );
};

const UserFooter: React.FC<{ currentUser: User; onOpenSettings: () => void }> = ({ currentUser, onOpenSettings }) => {
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [userStatus, setUserStatus] = useState<UserStatus>(currentUser.status);
  const [customStatus, setCustomStatus] = useState('');
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const hasAccountSwitching = useFeature('accountSwitching');

  const statusColors: Record<UserStatus, string> = {
    online: 'bg-accent-success shadow-[0_0_5px_#05FFA1]',
    idle: 'bg-accent-warning shadow-[0_0_5px_#FFB020]',
    dnd: 'bg-accent-danger shadow-[0_0_5px_#FF2A6D]',
    offline: 'bg-white/20',
  };

  const mockAccounts = [
    { user: currentUser, active: true },
    { user: { ...USERS[1], id: 'alt1' }, active: false },
  ];

  return (
    <div className="p-3 bg-bg-0/50 border-t border-white/5 flex items-center gap-2.5 relative">
      {showStatusPicker && (
        <StatusPicker
          currentStatus={userStatus}
          customStatus={customStatus}
          onStatusChange={setUserStatus}
          onCustomStatusChange={setCustomStatus}
          onClose={() => setShowStatusPicker(false)}
        />
      )}
      {showAccountSwitcher && hasAccountSwitching && (
        <AccountSwitcher
          accounts={mockAccounts}
          onSwitch={() => setShowAccountSwitcher(false)}
          onAddAccount={() => setShowAccountSwitcher(false)}
          onLogout={() => setShowAccountSwitcher(false)}
          onClose={() => setShowAccountSwitcher(false)}
        />
      )}
      <button className="relative group cursor-pointer" onClick={() => setShowStatusPicker(!showStatusPicker)} aria-label="Set Status">
        <img src={currentUser.avatar} className="w-8 h-8 rounded-full border border-white/10 group-hover:border-primary transition-colors" alt="My Avatar" />
        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-bg-0 ${statusColors[userStatus]}`} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold truncate text-white tracking-tight">{currentUser.username}</div>
        {customStatus ? (
          <div className="text-[9px] text-primary/70 truncate">{customStatus}</div>
        ) : (
          <div className="text-[8px] font-mono text-white/40">ID // {currentUser.id.toUpperCase()}</div>
        )}
      </div>
      <div className="flex gap-0.5">
        {hasAccountSwitching && (
          <button onClick={() => setShowAccountSwitcher(!showAccountSwitcher)} aria-label="Switch Account" className="p-1 text-white/40 hover:text-primary transition-colors"><ArrowUpDown size={14} /></button>
        )}
        <button aria-label="Mute Microphone" className="p-1 text-white/40 hover:text-primary transition-colors btn-press"><Mic size={14} /></button>
        <button aria-label="Deafen Audio" className="p-1 text-white/40 hover:text-primary transition-colors btn-press"><Headphones size={14} /></button>
        <button onClick={onOpenSettings} aria-label="Open Settings" className="p-1 text-white/40 hover:text-primary transition-colors btn-press"><Settings size={14} /></button>
      </div>
    </div>
  );
};
