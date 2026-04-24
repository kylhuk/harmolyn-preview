import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { AnimatePresence, motion, FullScreenOverlay } from '@/lib/animations';
import { ServerRail } from '@/components/ServerRail';
import { ChannelRail } from '@/components/ChannelRail';
import { ChatArea } from '@/components/ChatArea';
import { MemberSidebar } from '@/components/MemberSidebar';
import { SettingsScreen } from '@/components/SettingsScreen';
import { ServerExplorer } from '@/components/ServerExplorer';
import { ServerSettingsScreen } from '@/components/ServerSettingsScreen';
import { CreateServerModal } from '@/components/CreateServerModal';
import { JoinServerModal } from '@/components/JoinServerModal';
import { FriendsPanel } from '@/components/FriendsPanel';
import { QuickSwitcher } from '@/components/QuickSwitcher';
import { KeyboardShortcutsOverlay } from '@/components/KeyboardShortcutsOverlay';
import { DonationScreen, ShopScreen, QuestsScreen } from '@/components/monetization';
import { ServerApplications } from '@/components/ServerApplications';
import { ActivityLauncher } from '@/components/voice/ActivityLauncher';
import { ScreenSharePanel } from '@/components/voice/ScreenSharePanel';
import { SecurityOnboarding } from '@/components/onboarding/SecurityOnboarding';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { RegisterScreen } from '@/components/auth/RegisterScreen';
import { useFeature } from '@/hooks/useFeature';
import { type VoiceControlState } from '@/components/voice/VoiceControlBar';
import {
  deriveConnectionState,
  readShellRuntimeData,
  subscribeShellRuntimeData,
} from '@/data';
import { createServer, joinServerByInvite, joinVoiceChannel, leaveVoiceChannel, sendVoiceFrame, setVoiceMuted } from '@/lib/xoreinControl';
import { parseJoinDeepLink } from '@/protocol/deeplink';
import { Channel, AppState, ConnectionState, MessageLayout, XoreinRuntimeVoiceSession } from '@/types';
import { Home, Compass, Users as UsersIcon, Settings as SettingsIcon, Menu } from 'lucide-react';
import { generateTheme } from '@/utils/themeGenerator';

const MESSAGE_LAYOUT_STORAGE_KEY = 'harmolyn:settings:message-layout';

function readStoredMessageLayout(): MessageLayout {
  if (typeof window === 'undefined') {
    return 'modern';
  }

  const stored = window.localStorage.getItem(MESSAGE_LAYOUT_STORAGE_KEY);
  if (stored === 'modern' || stored === 'bubbles' || stored === 'terminal') {
    return stored;
  }

  return 'modern';
}

export const Layout: React.FC = () => {
  const shellData = useSyncExternalStore(subscribeShellRuntimeData, readShellRuntimeData, readShellRuntimeData);
  const initialUtilityScreen = readRequestedUtilityScreen();
  const [state, setState] = useState<AppState>({
    activeServerId: shellData.initialServerId,
    activeChannelId: shellData.initialChannelId,
    connectedVoiceChannelId: null,
    viewMode: 'chat',
    messageLayout: readStoredMessageLayout(),
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
  const [showFriends, setShowFriends] = useState(initialUtilityScreen === 'friends');
  const [authScreen, setAuthScreen] = useState<'login' | 'register' | null>(initialUtilityScreen === 'login' || initialUtilityScreen === 'register' ? initialUtilityScreen : null);
  const [showQuickSwitcher, setShowQuickSwitcher] = useState(false);
  const [showJoinServer, setShowJoinServer] = useState(false);
  const [joinDraft, setJoinDraft] = useState('');
  const hasQuickSwitcher = useFeature('quickSwitcher');
  const hasSeenRuntimeRef = useRef(Boolean(shellData.runtimeSnapshot?.identity?.peer_id?.trim()));

  useEffect(() => {
    if (shellData.runtimeSnapshot?.identity?.peer_id?.trim()) {
      hasSeenRuntimeRef.current = true;
    }
  }, [shellData.runtimeSnapshot]);

  const connectionState = deriveConnectionState(shellData, state.activeServerId, hasSeenRuntimeRef.current);
  const currentUser = shellData.currentUser;
  const directMessages = shellData.directMessages;
  const servers = shellData.servers;
  const users = shellData.users;
  const currentPeerId = shellData.runtimeSnapshot?.identity?.peer_id?.trim() ?? '';
  const connectedVoiceSession = state.connectedVoiceChannelId
    ? (shellData.runtimeSnapshot?.voice_sessions?.find((session) => session.channel_id === state.connectedVoiceChannelId) ?? null)
    : null;

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
      setState((s) => ({ ...s, memberListCollapsed: true, channelListCollapsed: true }));
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const hasKeyboardShortcuts = useFeature('keyboardShortcuts');
  const [showScreenSharePanel, setShowScreenSharePanel] = useState(false);
  const [voiceUi, setVoiceUi] = useState({
    deafened: false,
    preDeafenMuted: null as boolean | null,
    videoOn: false,
    screenSharing: false,
    activeActivityId: null as string | null,
  });
  const [voiceActionStatus, setVoiceActionStatus] = useState<{ pending: string | null; error: string | null }>({
    pending: null,
    error: null,
  });

  useEffect(() => {
    setVoiceUi((prev) => ({
      ...prev,
      deafened: false,
      preDeafenMuted: null,
      videoOn: false,
      screenSharing: false,
      activeActivityId: null,
    }));
    setVoiceActionStatus({ pending: null, error: null });
    setShowScreenSharePanel(false);
  }, [state.connectedVoiceChannelId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && hasQuickSwitcher) {
        e.preventDefault();
        setShowQuickSwitcher((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/' && hasKeyboardShortcuts) {
        e.preventDefault();
        setShowKeyboardShortcuts((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [hasQuickSwitcher, hasKeyboardShortcuts]);

  useEffect(() => {
    setState((prev) => {
      const nextServerId = resolveActiveServerId(prev.activeServerId, shellData);
      const nextChannelId = resolveActiveChannelId(nextServerId, prev.activeChannelId, shellData);
      const nextVoiceChannelId = hasVoiceChannel(nextServerId, prev.connectedVoiceChannelId, shellData)
        ? prev.connectedVoiceChannelId
        : null;
      if (
        nextServerId === prev.activeServerId
        && nextChannelId === prev.activeChannelId
        && nextVoiceChannelId === prev.connectedVoiceChannelId
      ) {
        return prev;
      }
      return {
        ...prev,
        activeServerId: nextServerId,
        activeChannelId: nextChannelId,
        connectedVoiceChannelId: nextVoiceChannelId,
        viewMode: nextServerId === 'explore' ? 'explorer' : prev.viewMode === 'explorer' ? 'chat' : prev.viewMode,
      };
    });
  }, [shellData]);

  const handleQuickNavigate = (serverId: string, channelId: string) => {
    setState((prev) => ({
      ...prev,
      activeServerId: serverId,
      activeChannelId: channelId || resolveDefaultChannelId(serverId, shellData),
      viewMode: serverId === 'explore' ? 'explorer' : 'chat',
      mobileMenuOpen: false,
    }));
    setShowFriends(false);
  };

  const openJoinServerModal = useCallback((initialValue = '') => {
    setJoinDraft(initialValue);
    setShowJoinServer(true);
  }, []);

  const handleCreateServer = useCallback(async (input: { name: string; description?: string }) => {
    const previousServerIds = new Set((shellData.runtimeSnapshot?.servers ?? []).map((server) => server.id));
    const snapshot = await createServer(shellData.runtimeSnapshot, input);
    const createdServer = snapshot.servers?.find((server) => !previousServerIds.has(server.id)) ?? snapshot.servers?.at(-1);
    const nextServerId = createdServer?.id ?? shellData.runtimeSnapshot?.servers?.at(-1)?.id ?? 'home';
    const nextChannelId = createdServer ? firstTextChannelId(createdServer) : '';

    setState((prev) => ({
      ...prev,
      activeServerId: nextServerId,
      activeChannelId: nextChannelId,
      viewMode: 'chat',
      mobileMenuOpen: false,
      showCreateServer: false,
    }));
  }, [shellData.runtimeSnapshot]);

  const handleJoinServer = useCallback(async (rawInvite: string) => {
    const deeplink = parseJoinDeepLink(rawInvite.trim());
    const snapshot = await joinServerByInvite(shellData.runtimeSnapshot, rawInvite);
    const joinedServer = snapshot.servers?.find((server) => server.id === deeplink.serverId) ?? snapshot.servers?.at(-1);
    const nextServerId = joinedServer?.id ?? deeplink.serverId;
    const nextChannelId = joinedServer ? firstTextChannelId(joinedServer) : '';

    setState((prev) => ({
      ...prev,
      activeServerId: nextServerId,
      activeChannelId: nextChannelId,
      viewMode: 'chat',
      mobileMenuOpen: false,
    }));
    setShowJoinServer(false);
    setJoinDraft('');
  }, [shellData.runtimeSnapshot]);

  const activeServer = servers.find((server) => server.id === state.activeServerId);
  const isHome = state.activeServerId === 'home';
  const isExplore = state.activeServerId === 'explore';
  const allChannels = activeServer ? activeServer.categories.flatMap((category) => category.channels) : [];
  const fallbackChannel: Channel = createFallbackChannel(connectionState, shellData.runtimeSnapshot !== null);

  let activeChannel = allChannels.find((channel) => channel.id === state.activeChannelId) || allChannels[0] || fallbackChannel;
  let isDM = false;

  if (isHome && state.activeChannelId) {
    const dm = directMessages.find((entry) => entry.id === state.activeChannelId);
    if (dm) {
      const dmUser = users.find((user) => user.id === dm.userId) || currentUser;
      activeChannel = { id: dm.id, name: dmUser.username, type: 'text', categoryId: 'dm' };
      isDM = true;
    }
  }

  const activeMessages = state.activeChannelId ? (shellData.messagesByScope.get(state.activeChannelId) ?? []) : [];

  const handleServerSelect = (id: string | 'home' | 'explore') => {
    if ((id === 'explore' || (id !== 'home' && id !== 'explore')) && !connectionState.canUseConnectivityActions) {
      return;
    }
    setState((prev) => ({
      ...prev,
      activeServerId: id,
      activeChannelId: resolveDefaultChannelId(id, shellData),
      viewMode: id === 'explore' ? 'explorer' : 'chat',
      mobileMenuOpen: false,
    }));
    setShowFriends(false);
  };

  const handleOpenDM = (userId: string) => {
    if (!connectionState.canUseConnectivityActions) {
      return { ok: false, message: connectionState.detail };
    }
    const dm = directMessages.find((entry) => entry.userId === userId);
    if (dm) {
      setState((prev) => ({ ...prev, activeServerId: 'home', activeChannelId: dm.id, mobileMenuOpen: false }));
      setShowFriends(false);
      return { ok: true };
    }
    return { ok: false, message: 'No direct-message thread exists for this friend in the current local runtime snapshot.' };
  };

  const toggleMessageLayout = () => {
    const layouts: MessageLayout[] = ['modern', 'bubbles', 'terminal'];
    const currentIndex = layouts.indexOf(state.messageLayout);
    const nextIndex = (currentIndex + 1) % layouts.length;
    setState((prev) => ({ ...prev, messageLayout: layouts[nextIndex] }));
  };

  useEffect(() => {
    window.localStorage.setItem(MESSAGE_LAYOUT_STORAGE_KEY, state.messageLayout);
  }, [state.messageLayout]);

  const handleSettingsLogout = () => {
    setAuthScreen('login');
    setState((prev) => ({ ...prev, showSettings: false }));
  };

  const showMemberSidebar = !isDM && Boolean(activeServer) && !isExplore;
  const isTouchDevice = isMobile || isTablet;
  const mainRef = useRef<HTMLDivElement>(null);

  useSwipeGesture(mainRef, {
    edgeZone: 30,
    edge: 'left',
    enabled: isTouchDevice && !state.mobileMenuOpen && state.memberListCollapsed,
    onSwipeRight: () => setState((s) => ({ ...s, mobileMenuOpen: true })),
  });

  useSwipeGesture(mainRef, {
    edgeZone: 30,
    edge: 'right',
    enabled: isTouchDevice && !state.mobileMenuOpen && !!showMemberSidebar && state.memberListCollapsed,
    onSwipeLeft: () => setState((s) => ({ ...s, memberListCollapsed: false })),
  });

  useSwipeGesture(mainRef, {
    enabled: isTouchDevice && state.mobileMenuOpen,
    onSwipeLeft: () => setState((s) => ({ ...s, mobileMenuOpen: false })),
  });

  useSwipeGesture(mainRef, {
    enabled: isTouchDevice && !state.memberListCollapsed,
    onSwipeRight: () => setState((s) => ({ ...s, memberListCollapsed: true })),
  });

  const connectedVoiceChannel = state.connectedVoiceChannelId
    ? allChannels.find((channel) => channel.id === state.connectedVoiceChannelId && channel.type === 'voice') ?? null
    : null;

  const voiceControlState = buildVoiceControlState({
    connectionState,
    connectedVoiceChannelId: state.connectedVoiceChannelId,
    connectedVoiceChannelName: connectedVoiceChannel?.name ?? 'Voice',
    connectedVoiceSession,
    localMuted: connectedVoiceSession?.participants[currentPeerId]?.muted ?? false,
    voiceUi,
    voiceActionStatus,
  });

  const voiceActionError = (error: unknown) => {
    const message = formatVoiceActionError(error);
    setVoiceActionStatus({ pending: null, error: message });
    return message;
  };

  const handleJoinVoice = async (id: string) => {
    const nextChannel = id.trim();
    if (!nextChannel) {
      await handleLeaveVoice();
      return;
    }
    if (!connectionState.canUseConnectivityActions) {
      voiceActionError(new Error(connectionState.detail));
      return;
    }

    setVoiceActionStatus({ pending: 'join', error: null });
    try {
      if (state.connectedVoiceChannelId && state.connectedVoiceChannelId !== nextChannel) {
        await leaveVoiceChannel(shellData.runtimeSnapshot, state.connectedVoiceChannelId);
      }
      await joinVoiceChannel(shellData.runtimeSnapshot, nextChannel, voiceUi.deafened || (connectedVoiceSession?.participants[currentPeerId]?.muted ?? false));
      setState((prev) => ({ ...prev, connectedVoiceChannelId: nextChannel }));
      setVoiceActionStatus({ pending: null, error: null });
    } catch (error) {
      if (state.connectedVoiceChannelId && state.connectedVoiceChannelId !== nextChannel) {
        setState((prev) => ({ ...prev, connectedVoiceChannelId: null }));
      }
      voiceActionError(error);
    }
  };

  const handleLeaveVoice = async () => {
    if (!state.connectedVoiceChannelId) {
      return;
    }
    if (!connectionState.canUseConnectivityActions) {
      voiceActionError(new Error(connectionState.detail));
      return;
    }

    setVoiceActionStatus({ pending: 'leave', error: null });
    try {
      await leaveVoiceChannel(shellData.runtimeSnapshot, state.connectedVoiceChannelId);
      setState((prev) => ({ ...prev, connectedVoiceChannelId: null }));
      setVoiceActionStatus({ pending: null, error: null });
    } catch (error) {
      voiceActionError(error);
    }
  };

  const handleToggleVoiceMute = async () => {
    if (!state.connectedVoiceChannelId || !connectedVoiceSession || !connectionState.canUseConnectivityActions) {
      voiceActionError(new Error(voiceControlState.statusDetail));
      return;
    }

    const nextMuted = !(connectedVoiceSession.participants[currentPeerId]?.muted ?? false);
    setVoiceActionStatus({ pending: 'mute', error: null });
    try {
      if (voiceUi.deafened) {
        setVoiceUi((prev) => ({ ...prev, preDeafenMuted: nextMuted }));
      }
      await setVoiceMuted(shellData.runtimeSnapshot, state.connectedVoiceChannelId, nextMuted);
      setVoiceActionStatus({ pending: null, error: null });
    } catch (error) {
      voiceActionError(error);
    }
  };

  const handleToggleVoiceDeafen = async () => {
    if (!state.connectedVoiceChannelId || !connectedVoiceSession || !connectionState.canUseConnectivityActions) {
      voiceActionError(new Error(voiceControlState.statusDetail));
      return;
    }

    const nextDeafened = !voiceUi.deafened;
    const currentMuted = connectedVoiceSession.participants[currentPeerId]?.muted ?? false;
    const nextMuted = nextDeafened ? true : (voiceUi.preDeafenMuted ?? currentMuted);
    setVoiceActionStatus({ pending: 'deafen', error: null });
    try {
      setVoiceUi((prev) => ({
        ...prev,
        deafened: nextDeafened,
        preDeafenMuted: nextDeafened ? currentMuted : null,
      }));
      await setVoiceMuted(shellData.runtimeSnapshot, state.connectedVoiceChannelId, nextMuted);
      setVoiceActionStatus({ pending: null, error: null });
    } catch (error) {
      voiceActionError(error);
    }
  };

  const handleToggleVoiceVideo = async () => {
    if (!state.connectedVoiceChannelId || !connectedVoiceSession || !connectionState.canUseConnectivityActions) {
      voiceActionError(new Error(voiceControlState.statusDetail));
      return;
    }

    const nextVideoOn = !voiceUi.videoOn;
    setVoiceActionStatus({ pending: 'video', error: null });
    try {
      await sendVoiceFrame(shellData.runtimeSnapshot, state.connectedVoiceChannelId, {
        kind: 'video',
        enabled: nextVideoOn,
        channelId: state.connectedVoiceChannelId,
        peerId: currentPeerId,
      });
      setVoiceUi((prev) => ({ ...prev, videoOn: nextVideoOn }));
      setVoiceActionStatus({ pending: null, error: null });
    } catch (error) {
      voiceActionError(error);
    }
  };

  const handleToggleVoiceScreenShare = async () => {
    if (!state.connectedVoiceChannelId || !connectedVoiceSession || !connectionState.canUseConnectivityActions) {
      voiceActionError(new Error(voiceControlState.statusDetail));
      return;
    }

    if (voiceUi.screenSharing) {
      setVoiceActionStatus({ pending: 'screen-share', error: null });
      try {
        await sendVoiceFrame(shellData.runtimeSnapshot, state.connectedVoiceChannelId, {
          kind: 'screen-share',
          enabled: false,
          channelId: state.connectedVoiceChannelId,
          peerId: currentPeerId,
        });
        setVoiceUi((prev) => ({ ...prev, screenSharing: false }));
        setVoiceActionStatus({ pending: null, error: null });
      } catch (error) {
        voiceActionError(error);
      }
      return;
    }

    setShowScreenSharePanel(true);
  };

  const handleStartScreenShare = async (type: 'screen' | 'window' | 'tab', quality: string) => {
    if (!state.connectedVoiceChannelId || !connectedVoiceSession || !connectionState.canUseConnectivityActions) {
      throw new Error(voiceControlState.statusDetail);
    }

    setVoiceActionStatus({ pending: 'screen-share', error: null });
    try {
      await sendVoiceFrame(shellData.runtimeSnapshot, state.connectedVoiceChannelId, {
        kind: 'screen-share',
        enabled: true,
        type,
        quality,
        channelId: state.connectedVoiceChannelId,
        peerId: currentPeerId,
      });
      setVoiceUi((prev) => ({ ...prev, screenSharing: true }));
      setShowScreenSharePanel(false);
      setVoiceActionStatus({ pending: null, error: null });
    } catch (error) {
      voiceActionError(error);
      throw error;
    }
  };

  const handleLaunchActivity = async (activityId: string) => {
    if (!state.connectedVoiceChannelId || !connectedVoiceSession || !connectionState.canUseConnectivityActions) {
      throw new Error(voiceControlState.statusDetail);
    }

    setVoiceActionStatus({ pending: 'activity', error: null });
    try {
      await sendVoiceFrame(shellData.runtimeSnapshot, state.connectedVoiceChannelId, {
        kind: 'activity',
        activityId,
        channelId: state.connectedVoiceChannelId,
        peerId: currentPeerId,
      });
      setVoiceUi((prev) => ({ ...prev, activeActivityId: activityId }));
      setState((prev) => ({ ...prev, showActivities: false }));
      setVoiceActionStatus({ pending: null, error: null });
    } catch (error) {
      voiceActionError(error);
      throw error;
    }
  };

  const handleOpenVoiceSettings = () => {
    const detail = state.connectedVoiceChannelId
      ? 'Voice device and media preferences are not exposed by the local xorein runtime yet.'
      : 'Join a voice session to use voice controls. Detailed voice settings are not exposed by the local xorein runtime yet.';
    voiceActionError(new Error(detail));
  };

  return (
    <div ref={mainRef} className="flex h-screen w-full bg-bg-0 overflow-hidden font-sans relative" style={themeStyle}>
      {showOnboarding && <SecurityOnboarding onClose={() => setShowOnboarding(false)} />}
      {authScreen === 'login' && <LoginScreen onLogin={() => setAuthScreen(null)} onSwitchToRegister={() => setAuthScreen('register')} />}
      {authScreen === 'register' && <RegisterScreen onRegister={() => setAuthScreen(null)} onSwitchToLogin={() => setAuthScreen('login')} />}
      <AnimatePresence mode="wait">
        {state.showSettings && (
          <FullScreenOverlay key="settings">
            <SettingsScreen
              user={currentUser}
              onClose={() => setState((s) => ({ ...s, showSettings: false }))}
              onOpenDonations={() => setState((s) => ({ ...s, showSettings: false, showDonations: true }))}
              onOpenShop={() => setState((s) => ({ ...s, showSettings: false, showShop: true }))}
              onOpenQuests={() => setState((s) => ({ ...s, showSettings: false, showQuests: true }))}
              onLogOut={handleSettingsLogout}
              messageLayout={state.messageLayout}
              onToggleMessageLayout={toggleMessageLayout}
            />
          </FullScreenOverlay>
        )}
        {state.viewMode === 'server-settings' && activeServer && (
          <FullScreenOverlay key="server-settings">
            <ServerSettingsScreen server={activeServer} onClose={() => setState((s) => ({ ...s, viewMode: 'chat' }))} />
          </FullScreenOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.showCreateServer && (
          <CreateServerModal
            key="create"
            onClose={() => setState((s) => ({ ...s, showCreateServer: false }))}
            onCreate={handleCreateServer}
            onOpenJoin={() => {
              setState((s) => ({ ...s, showCreateServer: false }));
              openJoinServerModal();
            }}
          />
        )}
        {showJoinServer && (
          <JoinServerModal
            key="join"
            initialValue={joinDraft}
            runtimeSnapshot={shellData.runtimeSnapshot}
            onClose={() => {
              setShowJoinServer(false);
              setJoinDraft('');
            }}
            onJoin={handleJoinServer}
          />
        )}
        {state.showDonations && <DonationScreen key="donations" onClose={() => setState((s) => ({ ...s, showDonations: false }))} />}
        {state.showShop && <ShopScreen key="shop" onClose={() => setState((s) => ({ ...s, showShop: false }))} />}
        {state.showQuests && <QuestsScreen key="quests" onClose={() => setState((s) => ({ ...s, showQuests: false }))} />}
        {state.showApplications && <ServerApplications key="apps" onClose={() => setState((s) => ({ ...s, showApplications: false }))} />}
        {showScreenSharePanel && (
          <ScreenSharePanel
            key="screen-share"
            onClose={() => setShowScreenSharePanel(false)}
            onStartShare={handleStartScreenShare}
            disabledReason={voiceControlState.canInteract ? undefined : voiceControlState.statusDetail}
            isSharing={voiceUi.screenSharing}
          />
        )}
        {state.showActivities && (
          <ActivityLauncher
            key="activities"
            onClose={() => setState((s) => ({ ...s, showActivities: false }))}
            onLaunch={handleLaunchActivity}
            disabledReason={voiceControlState.canInteract ? undefined : voiceControlState.statusDetail}
            activeActivityId={voiceUi.activeActivityId}
          />
        )}
        {showQuickSwitcher && hasQuickSwitcher && (
          <QuickSwitcher key="quickswitcher" onClose={() => setShowQuickSwitcher(false)} onNavigate={handleQuickNavigate} />
        )}
        {showKeyboardShortcuts && hasKeyboardShortcuts && (
          <KeyboardShortcutsOverlay key="shortcuts" onClose={() => setShowKeyboardShortcuts(false)} />
        )}
      </AnimatePresence>

      {!isMobile && !isTablet && (
        <div className="relative z-50">
          <ServerRail
            servers={servers}
            activeServerId={state.activeServerId}
            connectionState={connectionState}
            onSelectServer={handleServerSelect}
            onCreateServer={() => connectionState.canUseConnectivityActions && setState((s) => ({ ...s, showCreateServer: true }))}
          />
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {!isExplore && ((!isMobile && !isTablet) || state.mobileMenuOpen) && (
          <>
            <div className={`transition-all duration-300 ease-in-out flex-shrink-0 ${!state.channelListCollapsed && !isMobile && !isTablet ? 'w-[224px]' : 'w-0'}`}></div>

            {(isMobile || isTablet) && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] animate-in fade-in" onClick={() => setState((s) => ({ ...s, mobileMenuOpen: false, channelListCollapsed: true }))}></div>
            )}

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
                currentUser={currentUser}
                users={users}
                directMessages={directMessages}
                connectionState={connectionState}
                connectedVoiceChannelId={state.connectedVoiceChannelId}
                collapsed={!(isMobile || isTablet) && state.channelListCollapsed && !channelListHovered}
                onToggleCollapse={() => setState((s) => ({ ...s, channelListCollapsed: !s.channelListCollapsed, mobileMenuOpen: false }))}
                onSelectChannel={(id) => {
                  if (!connectionState.canUseConnectivityActions) {
                    return;
                  }
                  setState((s) => ({
                    ...s,
                    activeChannelId: id,
                    mobileMenuOpen: false,
                    channelListCollapsed: (isMobile || isTablet) ? true : s.channelListCollapsed,
                  }));
                  setShowFriends(false);
                }}
                onJoinVoice={handleJoinVoice}
                onOpenSettings={() => setState((s) => ({ ...s, showSettings: true }))}
                onOpenServerSettings={!isHome && activeServer ? () => setState((s) => ({ ...s, viewMode: 'server-settings' })) : undefined}
                onOpenDonations={() => setState((s) => ({ ...s, showDonations: true }))}
                onOpenApplications={!isHome && activeServer ? () => setState((s) => ({ ...s, showApplications: true })) : undefined}
                onOpenActivities={() => setState((s) => ({ ...s, showActivities: true }))}
                onOpenVoiceSettings={handleOpenVoiceSettings}
                voiceControlState={voiceControlState}
                onToggleVoiceMute={handleToggleVoiceMute}
                onToggleVoiceDeafen={handleToggleVoiceDeafen}
                onToggleVoiceVideo={handleToggleVoiceVideo}
                onToggleVoiceScreenShare={handleToggleVoiceScreenShare}
                isHome={isHome}
              />
            </div>
          </>
        )}

        <div className="flex-1 flex flex-col min-w-0 relative">
          <div className="flex-1 flex min-w-0 overflow-hidden relative">
            {isExplore ? (
              <ServerExplorer
                servers={servers}
                runtimeSnapshot={shellData.runtimeSnapshot}
                onSelectServer={handleServerSelect}
                onOpenJoin={openJoinServerModal}
              />
            ) : isHome && showFriends ? (
              <FriendsPanel onOpenDM={handleOpenDM} />
            ) : (
              <>
                <ChatArea
                  key={`${state.activeServerId}:${activeChannel.id}`}
                  channel={activeChannel}
                  messages={activeMessages}
                  users={activeServer?.members.length ? activeServer.members : users}
                  mobileMenuOpen={state.mobileMenuOpen}
                  messageLayout={state.messageLayout}
                  onToggleMobileMenu={() => setState((s) => ({ ...s, mobileMenuOpen: !s.mobileMenuOpen }))}
                  onToggleMemberList={() => setState((s) => ({ ...s, memberListCollapsed: !s.memberListCollapsed }))}
                  onToggleLayout={toggleMessageLayout}
                  isDM={isDM}
                  bgSeed={bgSeed}
                  setBgSeed={setBgSeed}
                />

                {showMemberSidebar && activeServer && (
                  <>
                    <div className={`transition-all duration-300 ease-in-out flex-shrink-0 ${!state.memberListCollapsed && !isMobile && !isTablet ? 'w-[224px]' : 'w-0'}`}></div>

                    {(isMobile || isTablet) && !state.memberListCollapsed && (
                      <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 animate-in fade-in"
                        onClick={() => setState((s) => ({ ...s, memberListCollapsed: true }))}
                      ></div>
                    )}

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
                          members={activeServer.members}
                          currentUser={currentUser}
                          serverOwnerId={activeServer.ownerId}
                          collapsed={!(isMobile || isTablet) && state.memberListCollapsed && !memberListHovered}
                          onToggleCollapse={() => {
                            setMemberListHovered(false);
                            setState((s) => ({ ...s, memberListCollapsed: !s.memberListCollapsed }));
                          }}
                          isOverlay={(isMobile || isTablet) || (memberListHovered && state.memberListCollapsed)}
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {(isMobile || isTablet) && (
            <motion.div
              initial={{ y: 88 }}
              animate={{ y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="h-[88px] w-full glass-panel flex items-center justify-around px-4 border-t border-white/5 pb-safe z-50 relative"
            >
              <BottomNavItem active={isHome} onClick={() => handleServerSelect('home')} icon={<Home size={22} />} label="HOME" />
              <BottomNavItem active={!isHome && !isExplore} onClick={() => setState((s) => ({ ...s, mobileMenuOpen: true }))} icon={<Menu size={22} />} label="CHANNELS" />
              <BottomNavItem active={false} disabled={!connectionState.canUseConnectivityActions} onClick={() => connectionState.canUseConnectivityActions && setState((s) => ({ ...s, showCreateServer: true }))} icon={<div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-bg-0 shadow-glow -mt-6"><UsersIcon size={22} /></div>} label="CREATE" isCore />
              <BottomNavItem active={isExplore} disabled={!connectionState.canUseConnectivityActions} onClick={() => handleServerSelect('explore')} icon={<Compass size={22} />} label="EXPLORE" />
              <BottomNavItem active={false} onClick={() => setState((s) => ({ ...s, showSettings: true }))} icon={<SettingsIcon size={22} />} label="SETTINGS" />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const BottomNavItem = ({ active, disabled = false, onClick, icon, label, isCore = false }: { active: boolean; disabled?: boolean; onClick: () => void; icon: React.ReactNode; label: string; isCore?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-col items-center justify-center gap-1 min-w-[48px] min-h-[48px] px-2 py-1 rounded-r1 transition-all ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'} ${active ? 'text-primary' : 'text-white/40 active:text-white/60'}`}
    aria-label={label}
    title={disabled ? 'Requires an active xorein connection' : label}
  >
    <div className={`transition-transform ${active ? 'scale-110' : ''}`}>{icon}</div>
    {!isCore && <span className="micro-label text-[8px] font-bold tracking-widest">{label}</span>}
  </button>
);

function resolveActiveServerId(currentServerId: string | 'home' | 'explore', shellData: ReturnType<typeof readShellRuntimeData>): string | 'home' | 'explore' {
  if (currentServerId === 'home' || currentServerId === 'explore') {
    return currentServerId;
  }
  if (shellData.servers.some((server) => server.id === currentServerId)) {
    return currentServerId;
  }
  return shellData.initialServerId;
}

function resolveActiveChannelId(
  serverId: string | 'home' | 'explore',
  currentChannelId: string,
  shellData: ReturnType<typeof readShellRuntimeData>,
): string {
  if (!currentChannelId) {
    return resolveDefaultChannelId(serverId, shellData);
  }
  if (serverId === 'home') {
    return shellData.directMessages.some((dm) => dm.id === currentChannelId)
      ? currentChannelId
      : resolveDefaultChannelId(serverId, shellData);
  }
  if (serverId === 'explore') {
    return '';
  }
  const server = shellData.servers.find((entry) => entry.id === serverId);
  const channels = server?.categories.flatMap((category) => category.channels) ?? [];
  return channels.some((channel) => channel.id === currentChannelId)
    ? currentChannelId
    : resolveDefaultChannelId(serverId, shellData);
}

function resolveDefaultChannelId(serverId: string | 'home' | 'explore', shellData: ReturnType<typeof readShellRuntimeData>): string {
  if (serverId === 'explore') {
    return '';
  }
  if (serverId === 'home') {
    return shellData.directMessages[0]?.id ?? '';
  }
  const server = shellData.servers.find((entry) => entry.id === serverId);
  const channels = server?.categories.flatMap((category) => category.channels) ?? [];
  return channels.find((channel) => channel.type === 'text')?.id ?? channels[0]?.id ?? '';
}

function hasVoiceChannel(
  serverId: string | 'home' | 'explore',
  voiceChannelId: string | null,
  shellData: ReturnType<typeof readShellRuntimeData>,
): boolean {
  if (!voiceChannelId || serverId === 'home' || serverId === 'explore') {
    return false;
  }
  const server = shellData.servers.find((entry) => entry.id === serverId);
  return (server?.categories.flatMap((category) => category.channels) ?? []).some(
    (channel) => channel.id === voiceChannelId && channel.type === 'voice',
  );
}

function createFallbackChannel(connectionState: ConnectionState, hasRuntimeSnapshot: boolean): Channel {
  const fallbackByState: Record<ConnectionState['status'], { id: string; name: string }> = {
    connected: {
      id: hasRuntimeSnapshot ? 'empty-shell' : 'runtime-pending',
      name: hasRuntimeSnapshot ? 'empty-shell' : 'waiting-for-runtime',
    },
    disconnected: { id: 'runtime-offline', name: 'runtime-offline' },
    reconnecting: { id: 'runtime-reconnecting', name: 'runtime-reconnecting' },
    'no-peer': { id: 'peer-unreachable', name: 'peer-unreachable' },
    'no-relay': { id: 'relay-unavailable', name: 'relay-unavailable' },
  };
  const fallback = fallbackByState[connectionState.status];
  return {
    id: fallback.id,
    name: fallback.name,
    type: 'text',
    categoryId: 'system',
  };
}

function buildVoiceControlState(input: {
  connectionState: ConnectionState;
  connectedVoiceChannelId: string | null;
  connectedVoiceChannelName: string;
  connectedVoiceSession: XoreinRuntimeVoiceSession | null;
  localMuted: boolean;
  voiceUi: {
    deafened: boolean;
    preDeafenMuted: boolean | null;
    videoOn: boolean;
    screenSharing: boolean;
    activeActivityId: string | null;
  };
  voiceActionStatus: { pending: string | null; error: string | null };
}): VoiceControlState {
  const participantCount = Object.keys(input.connectedVoiceSession?.participants ?? {}).length;
  const sessionAvailable = Boolean(input.connectedVoiceSession);
  const canInteract = Boolean(input.connectedVoiceChannelId)
    && input.connectionState.canUseConnectivityActions
    && sessionAvailable
    && !input.voiceActionStatus.pending;

  let statusLabel = 'VOICE IDLE';
  let statusDetail = 'Join a voice channel to enable media controls.';

  if (input.connectedVoiceChannelId) {
    if (!input.connectionState.canUseConnectivityActions) {
      statusLabel = input.connectionState.status === 'no-relay' ? 'VOICE BLOCKED' : 'VOICE OFFLINE';
      statusDetail = input.connectionState.detail;
    } else if (input.voiceActionStatus.pending) {
      statusLabel = 'VOICE SYNCING';
      statusDetail = `Sending ${input.voiceActionStatus.pending} to xorein...`;
    } else if (!sessionAvailable) {
      statusLabel = 'VOICE SESSION MISSING';
      statusDetail = `No live voice session is reported for ${input.connectedVoiceChannelName}.`;
    } else {
      const liveState = input.voiceUi.screenSharing
        ? 'SCREEN SHARE SENT'
        : input.voiceUi.activeActivityId
          ? 'ACTIVITY SENT'
          : input.voiceUi.videoOn
            ? 'VIDEO SENT'
            : input.voiceUi.deafened
              ? 'DEAFENED'
              : input.localMuted
                ? 'MUTED'
                : 'VOICE LIVE';
      statusLabel = liveState;
      const detailSuffix = input.voiceUi.screenSharing
        ? 'A screen-share control frame was sent; the runtime has not echoed media state yet.'
        : input.voiceUi.activeActivityId
          ? `Activity ${input.voiceUi.activeActivityId} was signalled; the runtime has not echoed activity state yet.`
          : input.voiceUi.videoOn
            ? 'A video control frame was sent; the runtime has not echoed media state yet.'
            : input.voiceUi.deafened
              ? 'Deafened locally.'
              : input.localMuted
                ? 'Muted locally.'
                : 'Live voice session is connected.';
      statusDetail = `${participantCount} participant${participantCount === 1 ? '' : 's'} · ${detailSuffix}`;
    }
  }

  if (input.voiceActionStatus.error) {
    statusLabel = 'VOICE ERROR';
    statusDetail = input.voiceActionStatus.error;
  }

  return {
    statusLabel,
    statusDetail,
    participantCount,
    muted: input.localMuted,
    deafened: input.voiceUi.deafened,
    videoOn: input.voiceUi.videoOn,
    screenSharing: input.voiceUi.screenSharing,
    activeActivityId: input.voiceUi.activeActivityId,
    canInteract,
    pendingAction: input.voiceActionStatus.pending,
    error: input.voiceActionStatus.error,
    sessionAvailable,
    channelId: input.connectedVoiceChannelId,
  };
}

function formatVoiceActionError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  return 'The local voice action failed.';
}

function firstTextChannelId(server: NonNullable<ReturnType<typeof readShellRuntimeData>['runtimeSnapshot']>['servers'][number]): string {
  const channels = Object.values(server.channels ?? {}).sort((left, right) => {
    const leftTime = Date.parse(left.created_at ?? '') || 0;
    const rightTime = Date.parse(right.created_at ?? '') || 0;
    return leftTime - rightTime;
  });
  return channels.find((channel) => !channel.voice)?.id ?? channels[0]?.id ?? '';
}

function readRequestedUtilityScreen(): 'friends' | 'login' | 'register' | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const auth = params.get('auth');
  if (auth === 'login' || auth === 'register') {
    return auth;
  }

  const panel = params.get('panel');
  return panel === 'friends' ? 'friends' : null;
}
