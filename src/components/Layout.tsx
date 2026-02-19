
import React, { useState, useEffect } from 'react';
import { ServerRail } from '@/components/ServerRail';
import { ChannelRail } from '@/components/ChannelRail';
import { ChatArea } from '@/components/ChatArea';
import { MemberSidebar } from '@/components/MemberSidebar';
import { SettingsScreen } from '@/components/SettingsScreen';
import { ServerExplorer } from '@/components/ServerExplorer';
import { ServerSettingsScreen } from '@/components/ServerSettingsScreen';
import { CreateServerModal } from '@/components/CreateServerModal';
import { FriendsPanel } from '@/components/FriendsPanel';
import { QuickSwitcher } from '@/components/QuickSwitcher';
import { KeyboardShortcutsOverlay } from '@/components/KeyboardShortcutsOverlay';
import { useFeature } from '@/hooks/useFeature';
import { SERVERS, USERS, MOCK_MESSAGES, CURRENT_USER, DIRECT_MESSAGES } from '@/data';
import { Channel, AppState, MessageLayout } from '@/types';
import { Home, Compass, MessageSquare, Users as UsersIcon, Settings as SettingsIcon, Menu } from 'lucide-react';

import { generateTheme } from '@/utils/themeGenerator';

export const Layout: React.FC = () => {
  const [state, setState] = useState<AppState>({
    activeServerId: 'home',
    activeChannelId: '',
    connectedVoiceChannelId: null,
    viewMode: 'chat',
    messageLayout: 'modern',
    mobileMenuOpen: false,
    memberListCollapsed: false,
    channelListCollapsed: false,
    showCreateServer: false,
    showSettings: false
  });

  const [showFriends, setShowFriends] = useState(true);
  const [showQuickSwitcher, setShowQuickSwitcher] = useState(false);
  const hasQuickSwitcher = useFeature('quickSwitcher');

  // Theme State
  const [bgSeed, setBgSeed] = useState<string>('nexus-default');
  const [themeStyle, setThemeStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
      const theme = generateTheme(bgSeed);
      setThemeStyle(theme.themeVars);
  }, [bgSeed]);

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const [channelListHovered, setChannelListHovered] = useState(false);
  const [memberListHovered, setMemberListHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 600;
      const tablet = width >= 600 && width < 1100;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
    };

    handleResize();
    
    if (window.innerWidth < 1100) {
        setState(s => ({...s, memberListCollapsed: true}));
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ctrl+K Quick Switcher & Ctrl+/ Shortcuts
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const hasKeyboardShortcuts = useFeature('keyboardShortcuts');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && hasQuickSwitcher) {
        e.preventDefault();
        setShowQuickSwitcher(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/' && hasKeyboardShortcuts) {
        e.preventDefault();
        setShowKeyboardShortcuts(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [hasQuickSwitcher, hasKeyboardShortcuts]);

  const handleQuickNavigate = (serverId: string, channelId: string) => {
    setState(prev => ({
      ...prev,
      activeServerId: serverId,
      activeChannelId: channelId,
      viewMode: serverId === 'explore' ? 'explorer' : 'chat',
      mobileMenuOpen: false,
    }));
    if (serverId === 'home' && !channelId) setShowFriends(true);
    else if (serverId === 'home') setShowFriends(false);
  };

  const activeServer = SERVERS.find(s => s.id === state.activeServerId);
  const isHome = state.activeServerId === 'home';
  const isExplore = state.activeServerId === 'explore';
  
  const allChannels = activeServer ? activeServer.categories.flatMap(c => c.channels) : [];
  const fallbackChannel: Channel = { id: 'fallback', name: 'unknown', type: 'text', categoryId: 'sys' };
  
  let activeChannel = allChannels.find(ch => ch.id === state.activeChannelId) || allChannels[0] || fallbackChannel;
  let isDM = false;
  
  if (isHome && state.activeChannelId) {
      const dm = DIRECT_MESSAGES.find(d => d.id === state.activeChannelId);
      if (dm) {
        const dmUser = USERS.find(u => u.id === dm.userId) || USERS[1];
        activeChannel = { id: dm.id, name: dmUser.username, type: 'text', categoryId: 'dm' };
        isDM = true;
      }
  }

  const handleServerSelect = (id: string | 'home' | 'explore') => {
      setState(prev => ({
          ...prev,
          activeServerId: id,
          activeChannelId: id === 'home' ? '' : (SERVERS.find(s => s.id === id)?.categories[0].channels[0].id || 'ch1'),
          viewMode: id === 'explore' ? 'explorer' : 'chat',
          mobileMenuOpen: false
      }));
      if (id === 'home') setShowFriends(true);
  };

  const handleOpenDM = (userId: string) => {
    const dm = DIRECT_MESSAGES.find(d => d.userId === userId);
    if (dm) {
      setState(prev => ({ ...prev, activeServerId: 'home', activeChannelId: dm.id, mobileMenuOpen: false }));
      setShowFriends(false);
    }
  };

  const handleJoinVoice = (id: string) => {
      if (id === '') setState(prev => ({ ...prev, connectedVoiceChannelId: null }));
      else setState(prev => ({ ...prev, connectedVoiceChannelId: id }));
  };

  const toggleMessageLayout = () => {
    const layouts: MessageLayout[] = ['modern', 'bubbles', 'terminal'];
    const currentIndex = layouts.indexOf(state.messageLayout);
    const nextIndex = (currentIndex + 1) % layouts.length;
    setState(prev => ({ ...prev, messageLayout: layouts[nextIndex] }));
  };

  const showMemberSidebar = !isDM && activeServer && !isExplore;
  const isOverlaySidebar = isMobile;

  return (
    <div className="flex h-screen w-full bg-bg-0 overflow-hidden font-sans relative" style={themeStyle}>
      {state.showSettings && <SettingsScreen user={CURRENT_USER} onClose={() => setState(s => ({...s, showSettings: false}))} />}
      {state.viewMode === 'server-settings' && activeServer && (
        <ServerSettingsScreen server={activeServer} onClose={() => setState(s => ({...s, viewMode: 'chat'}))} />
      )}
      {state.showCreateServer && <CreateServerModal onClose={() => setState(s => ({...s, showCreateServer: false}))} />}
      {showQuickSwitcher && hasQuickSwitcher && (
        <QuickSwitcher onClose={() => setShowQuickSwitcher(false)} onNavigate={handleQuickNavigate} />
      )}
      {showKeyboardShortcuts && hasKeyboardShortcuts && (
        <KeyboardShortcutsOverlay onClose={() => setShowKeyboardShortcuts(false)} />
      )}

      {/* Side Rail: Hidden on Mobile */}
      {!isMobile && (
        <div className="relative z-50">
            <ServerRail 
            servers={SERVERS} 
            activeServerId={state.activeServerId} 
            onSelectServer={handleServerSelect} 
            onCreateServer={() => setState(s => ({...s, showCreateServer: true}))}
            />
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
          {/* Channel list */}
          {!isExplore && (!isMobile || state.mobileMenuOpen) && (
            <>
                {/* Spacer: reserves layout space when expanded on desktop */}
                <div className={`transition-all duration-300 ease-in-out flex-shrink-0 ${!state.channelListCollapsed && !isMobile ? 'w-[224px]' : 'w-0'}`}></div>

                {/* Always-present wrapper */}
                <div 
                    className={`
                        absolute left-0 top-0 bottom-0 z-40 h-full
                        ${isMobile ? 'z-[60] w-[224px] pointer-events-auto' : ''}
                        ${!isMobile && (state.channelListCollapsed && !channelListHovered) ? 'w-[10px] pointer-events-auto' : ''}
                        ${!isMobile && (!state.channelListCollapsed || channelListHovered) ? 'w-[224px] pointer-events-auto' : ''}
                    `}
                    onMouseEnter={() => { if (state.channelListCollapsed && !isMobile) setChannelListHovered(true); }}
                    onMouseLeave={() => setChannelListHovered(false)}
                >
                    <ChannelRail 
                        server={activeServer}
                        activeChannelId={state.activeChannelId}
                        currentUser={CURRENT_USER}
                        connectedVoiceChannelId={state.connectedVoiceChannelId}
                        collapsed={state.channelListCollapsed && !channelListHovered && !isMobile}
                        onToggleCollapse={() => setState(s => ({...s, channelListCollapsed: !s.channelListCollapsed, mobileMenuOpen: false}))}
                        onSelectChannel={id => { setState(s => ({...s, activeChannelId: id, mobileMenuOpen: false})); setShowFriends(false); }}
                        onJoinVoice={handleJoinVoice}
                        onOpenSettings={() => setState(s => ({...s, showSettings: true}))}
                        onOpenServerSettings={!isHome && activeServer ? () => setState(s => ({...s, viewMode: 'server-settings'})) : undefined}
                        isHome={isHome}
                    />
                    {isMobile && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10" onClick={() => setState(s => ({...s, mobileMenuOpen: false}))}></div>}
                </div>
            </>
          )}

          <div className="flex-1 flex flex-col min-w-0 relative">
            <div className="flex-1 flex min-w-0 overflow-hidden relative">
                {isExplore ? (
                    <ServerExplorer />
                ) : isHome && showFriends ? (
                    <FriendsPanel onOpenDM={handleOpenDM} />
                ) : (
                    <>
                        <ChatArea 
                            channel={activeChannel}
                            messages={MOCK_MESSAGES}
                            users={activeServer?.members || USERS}
                            mobileMenuOpen={state.mobileMenuOpen}
                            messageLayout={state.messageLayout}
                            onToggleMobileMenu={() => setState(s => ({...s, mobileMenuOpen: !s.mobileMenuOpen}))}
                            onToggleMemberList={() => setState(s => ({...s, memberListCollapsed: !s.memberListCollapsed}))}
                            onToggleLayout={toggleMessageLayout}
                            isDM={isDM}
                            bgSeed={bgSeed}
                            setBgSeed={setBgSeed}
                        />

                         {showMemberSidebar && (
                           <>
                             {/* Spacer: reserves layout space when expanded on non-mobile */}
                             <div className={`transition-all duration-300 ease-in-out flex-shrink-0 ${!state.memberListCollapsed && !isMobile ? 'w-[224px]' : 'w-0'}`}></div>

                             {/* Mobile overlay backdrop */}
                             {isMobile && !state.memberListCollapsed && (
                               <div 
                                 className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 animate-in fade-in"
                                 onClick={() => setState(s => ({...s, memberListCollapsed: true}))}
                               ></div>
                             )}

                             {/* Always-present wrapper — same pattern as left sidebar */}
                             <div 
                               className={`
                                 absolute right-0 top-0 bottom-0 z-40 h-full
                                 ${isMobile ? 'z-[60] w-[224px] pointer-events-auto' : ''}
                                 ${!isMobile && (state.memberListCollapsed && !memberListHovered) ? 'w-[10px] pointer-events-auto' : ''}
                                 ${!isMobile && (!state.memberListCollapsed || memberListHovered) ? 'w-[224px] pointer-events-auto' : ''}
                               `}
                               onMouseEnter={() => { if (state.memberListCollapsed && !isMobile) setMemberListHovered(true); }}
                               onMouseLeave={() => setMemberListHovered(false)}
                             >
                               <MemberSidebar 
                                 members={activeServer!.members} 
                                 collapsed={state.memberListCollapsed && !memberListHovered && !isMobile}
                                 onToggleCollapse={() => { setMemberListHovered(false); setState(s => ({...s, memberListCollapsed: !s.memberListCollapsed})); }}
                                 isOverlay={isMobile || (memberListHovered && state.memberListCollapsed)}
                               />
                               {isMobile && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10" onClick={() => setState(s => ({...s, memberListCollapsed: true}))}></div>}
                             </div>
                           </>
                         )}
                    </>
                )}
            </div>

            {/* Bottom Dock for Mobile Views */}
            {isMobile && (
              <div className="h-[70px] w-full glass-panel flex items-center justify-around px-3 border-t border-white/5 pb-safe z-50 relative">
                 <BottomNavItem active={isHome} onClick={() => handleServerSelect('home')} icon={<Home size={20} />} label="HOME" />
                 <BottomNavItem active={!isHome && !isExplore} onClick={() => setState(s => ({...s, mobileMenuOpen: true}))} icon={<Menu size={20} />} label="CHANNELS" />
                 <BottomNavItem active={false} onClick={() => setState(s => ({...s, showCreateServer: true}))} icon={<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-bg-0 shadow-glow -mt-5"><UsersIcon size={20} /></div>} label="CREATE" isCore />
                 <BottomNavItem active={isExplore} onClick={() => handleServerSelect('explore')} icon={<Compass size={20} />} label="EXPLORE" />
                 <BottomNavItem active={false} onClick={() => setState(s => ({...s, showSettings: true}))} icon={<SettingsIcon size={20} />} label="SETTINGS" />
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

const BottomNavItem = ({ active, onClick, icon, label, isCore = false }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, isCore?: boolean }) => (
    <div 
      onClick={onClick} 
      className={`flex flex-col items-center gap-0.5 cursor-pointer transition-all ${active ? 'text-primary' : 'text-white/40'}`}
      role="button"
      aria-label={label}
    >
        <div className={`transition-transform ${active ? 'scale-110' : 'hover:scale-105'}`}>{icon}</div>
        {!isCore && <span className="micro-label text-[7px] font-bold tracking-widest">{label}</span>}
    </div>
);
