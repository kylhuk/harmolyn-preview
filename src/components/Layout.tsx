
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { AnimatePresence, motion, FullScreenOverlay, ModalOverlay } from '@/lib/animations';
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
import { DonationScreen, ShopScreen, QuestsScreen } from '@/components/monetization';
import { ServerApplications } from '@/components/ServerApplications';
import { ActivityLauncher } from '@/components/voice/ActivityLauncher';
import { SecurityOnboarding } from '@/components/onboarding/SecurityOnboarding';
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
    showSettings: false,
    showDonations: false,
    showShop: false,
    showQuests: false,
    showApplications: false,
    showActivities: false,
  });

  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('harmolyn_onboarding_dismissed'));
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
  const channelHoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const memberHoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChannelEnter = useCallback(() => {
    if (channelHoverTimer.current) clearTimeout(channelHoverTimer.current);
    if (state.channelListCollapsed && !isMobile) setChannelListHovered(true);
  }, [state.channelListCollapsed, isMobile]);
  const handleChannelLeave = useCallback(() => {
    channelHoverTimer.current = setTimeout(() => setChannelListHovered(false), 200);
  }, []);
  const handleMemberEnter = useCallback(() => {
    if (memberHoverTimer.current) clearTimeout(memberHoverTimer.current);
    if (state.memberListCollapsed && !isMobile) setMemberListHovered(true);
  }, [state.memberListCollapsed, isMobile]);
  const handleMemberLeave = useCallback(() => {
    memberHoverTimer.current = setTimeout(() => setMemberListHovered(false), 200);
  }, []);

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
        setState(s => ({...s, memberListCollapsed: true, channelListCollapsed: true}));
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
  const isTouchDevice = isMobile || isTablet;

  // Swipe gestures for sidebars on touch devices
  const mainRef = useRef<HTMLDivElement>(null);

  useSwipeGesture(mainRef, {
    edgeZone: 30,
    edge: 'left',
    enabled: isTouchDevice && !state.mobileMenuOpen && state.memberListCollapsed,
    onSwipeRight: () => setState(s => ({ ...s, mobileMenuOpen: true })),
  });

  useSwipeGesture(mainRef, {
    edgeZone: 30,
    edge: 'right',
    enabled: isTouchDevice && !state.mobileMenuOpen && !!showMemberSidebar && state.memberListCollapsed,
    onSwipeLeft: () => setState(s => ({ ...s, memberListCollapsed: false })),
  });

  useSwipeGesture(mainRef, {
    enabled: isTouchDevice && state.mobileMenuOpen,
    onSwipeLeft: () => setState(s => ({ ...s, mobileMenuOpen: false })),
  });

  useSwipeGesture(mainRef, {
    enabled: isTouchDevice && !state.memberListCollapsed,
    onSwipeRight: () => setState(s => ({ ...s, memberListCollapsed: true })),
  });

  return (
    <div ref={mainRef} className="flex h-screen w-full bg-bg-0 overflow-hidden font-sans relative" style={themeStyle}>
      {showOnboarding && <SecurityOnboarding onClose={() => setShowOnboarding(false)} />}
      <AnimatePresence mode="wait">
        {state.showSettings && (
          <FullScreenOverlay key="settings">
            <SettingsScreen
              user={CURRENT_USER}
              onClose={() => setState(s => ({...s, showSettings: false}))}
              onOpenDonations={() => setState(s => ({...s, showSettings: false, showDonations: true}))}
              onOpenShop={() => setState(s => ({...s, showSettings: false, showShop: true}))}
              onOpenQuests={() => setState(s => ({...s, showSettings: false, showQuests: true}))}
            />
          </FullScreenOverlay>
        )}
        {state.viewMode === 'server-settings' && activeServer && (
          <FullScreenOverlay key="server-settings">
            <ServerSettingsScreen server={activeServer} onClose={() => setState(s => ({...s, viewMode: 'chat'}))} />
          </FullScreenOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.showCreateServer && <CreateServerModal key="create" onClose={() => setState(s => ({...s, showCreateServer: false}))} />}
        {state.showDonations && <DonationScreen key="donations" onClose={() => setState(s => ({...s, showDonations: false}))} />}
        {state.showShop && <ShopScreen key="shop" onClose={() => setState(s => ({...s, showShop: false}))} />}
        {state.showQuests && <QuestsScreen key="quests" onClose={() => setState(s => ({...s, showQuests: false}))} />}
        {state.showApplications && <ServerApplications key="apps" onClose={() => setState(s => ({...s, showApplications: false}))} />}
        {state.showActivities && <ActivityLauncher key="activities" onClose={() => setState(s => ({...s, showActivities: false}))} />}
        {showQuickSwitcher && hasQuickSwitcher && (
          <QuickSwitcher key="quickswitcher" onClose={() => setShowQuickSwitcher(false)} onNavigate={handleQuickNavigate} />
        )}
        {showKeyboardShortcuts && hasKeyboardShortcuts && (
          <KeyboardShortcutsOverlay key="shortcuts" onClose={() => setShowKeyboardShortcuts(false)} />
        )}
      </AnimatePresence>

      {/* Side Rail: Hidden on Mobile & Tablet (they use Bottom Dock) */}
      {!isMobile && !isTablet && (
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
          {!isExplore && ((!isMobile && !isTablet) || state.mobileMenuOpen) && (
            <>
                {/* Spacer: reserves layout space when expanded on desktop */}
                <div className={`transition-all duration-300 ease-in-out flex-shrink-0 ${!state.channelListCollapsed && !isMobile && !isTablet ? 'w-[224px]' : 'w-0'}`}></div>

                {/* Overlay backdrop on mobile/tablet */}
                {(isMobile || isTablet) && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] animate-in fade-in" onClick={() => setState(s => ({...s, mobileMenuOpen: false, channelListCollapsed: true}))}></div>
                )}

                {/* Always-present wrapper */}
                <div 
                    className={`
                        absolute left-0 top-0 bottom-0 z-[60] h-full
                        ${(isMobile || isTablet) ? 'w-[224px] pointer-events-auto' : ''}
                        ${!(isMobile || isTablet) && (state.channelListCollapsed && !channelListHovered) ? 'w-[10px] pointer-events-auto' : ''}
                        ${!(isMobile || isTablet) && (!state.channelListCollapsed || channelListHovered) ? 'w-[224px] pointer-events-auto' : ''}
                    `}
                    onMouseEnter={!(isMobile || isTablet) ? handleChannelEnter : undefined}
                    onMouseLeave={!(isMobile || isTablet) ? handleChannelLeave : undefined}
                >
                    <ChannelRail 
                        server={activeServer}
                        activeChannelId={state.activeChannelId}
                        currentUser={CURRENT_USER}
                        connectedVoiceChannelId={state.connectedVoiceChannelId}
                        collapsed={!(isMobile || isTablet) && state.channelListCollapsed && !channelListHovered}
                        onToggleCollapse={() => setState(s => ({...s, channelListCollapsed: !s.channelListCollapsed, mobileMenuOpen: false}))}
                        onSelectChannel={id => { setState(s => ({...s, activeChannelId: id, mobileMenuOpen: false, channelListCollapsed: (isMobile || isTablet) ? true : s.channelListCollapsed})); setShowFriends(false); }}
                        onJoinVoice={handleJoinVoice}
                        onOpenSettings={() => setState(s => ({...s, showSettings: true}))}
                        onOpenServerSettings={!isHome && activeServer ? () => setState(s => ({...s, viewMode: 'server-settings'})) : undefined}
                        onOpenDonations={() => setState(s => ({...s, showDonations: true}))}
                        onOpenApplications={!isHome && activeServer ? () => setState(s => ({...s, showApplications: true})) : undefined}
                        onOpenActivities={() => setState(s => ({...s, showActivities: true}))}
                        isHome={isHome}
                    />
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
                             {/* Spacer: reserves layout space when expanded on desktop */}
                             <div className={`transition-all duration-300 ease-in-out flex-shrink-0 ${!state.memberListCollapsed && !isMobile && !isTablet ? 'w-[224px]' : 'w-0'}`}></div>

                             {/* Mobile/tablet overlay backdrop */}
                             {(isMobile || isTablet) && !state.memberListCollapsed && (
                               <div 
                                 className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 animate-in fade-in"
                                 onClick={() => setState(s => ({...s, memberListCollapsed: true}))}
                               ></div>
                             )}

                             {/* Sidebar wrapper — hidden on mobile/tablet when collapsed */}
                             {(!(isMobile || isTablet) || !state.memberListCollapsed) && (
                               <div 
                                 className={`
                                   absolute right-0 top-0 bottom-0 z-40 h-full
                                   ${(isMobile || isTablet) ? 'z-[60] w-[224px] pointer-events-auto' : ''}
                                   ${!(isMobile || isTablet) && (state.memberListCollapsed && !memberListHovered) ? 'w-[10px] pointer-events-auto' : ''}
                                   ${!(isMobile || isTablet) && (!state.memberListCollapsed || memberListHovered) ? 'w-[224px] pointer-events-auto' : ''}
                                 `}
                                 onMouseEnter={!(isMobile || isTablet) ? handleMemberEnter : undefined}
                                 onMouseLeave={!(isMobile || isTablet) ? handleMemberLeave : undefined}
                               >
                                 <MemberSidebar 
                                   members={activeServer!.members} 
                                   collapsed={!(isMobile || isTablet) && state.memberListCollapsed && !memberListHovered}
                                   onToggleCollapse={() => { setMemberListHovered(false); setState(s => ({...s, memberListCollapsed: !s.memberListCollapsed})); }}
                                   isOverlay={(isMobile || isTablet) || (memberListHovered && state.memberListCollapsed)}
                                 />
                               </div>
                             )}
                           </>
                         )}
                    </>
                )}
            </div>

            {/* Bottom Dock for Mobile & Tablet */}
            {(isMobile || isTablet) && (
              <motion.div 
                initial={{ y: 88 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="h-[88px] w-full glass-panel flex items-center justify-around px-4 border-t border-white/5 pb-safe z-50 relative"
              >
                 <BottomNavItem active={isHome} onClick={() => handleServerSelect('home')} icon={<Home size={22} />} label="HOME" />
                 <BottomNavItem active={!isHome && !isExplore} onClick={() => setState(s => ({...s, mobileMenuOpen: true}))} icon={<Menu size={22} />} label="CHANNELS" />
                 <BottomNavItem active={false} onClick={() => setState(s => ({...s, showCreateServer: true}))} icon={<div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-bg-0 shadow-glow -mt-6"><UsersIcon size={22} /></div>} label="CREATE" isCore />
                 <BottomNavItem active={isExplore} onClick={() => handleServerSelect('explore')} icon={<Compass size={22} />} label="EXPLORE" />
                 <BottomNavItem active={false} onClick={() => setState(s => ({...s, showSettings: true}))} icon={<SettingsIcon size={22} />} label="SETTINGS" />
              </motion.div>
            )}
          </div>
      </div>
    </div>
  );
};

const BottomNavItem = ({ active, onClick, icon, label, isCore = false }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, isCore?: boolean }) => (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center justify-center gap-1 min-w-[48px] min-h-[48px] px-2 py-1 rounded-r1 transition-all active:scale-95 ${active ? 'text-primary' : 'text-white/40 active:text-white/60'}`}
      aria-label={label}
    >
        <div className={`transition-transform ${active ? 'scale-110' : ''}`}>{icon}</div>
        {!isCore && <span className="micro-label text-[8px] font-bold tracking-widest">{label}</span>}
    </button>
);
