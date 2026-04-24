import type {
  ConnectionState,
  DirectMessageChannel,
  Message,
  Server,
  User,
  UserStatus,
  XoreinRuntimeChannel,
  XoreinRuntimeDM,
  XoreinRuntimeMessage,
  XoreinRuntimePeer,
  XoreinRuntimeServer,
  XoreinRuntimeSnapshot,
  XoreinRuntimeVoiceSession,
  XoreinSessionSnapshot,
} from '@/types';

const CURRENT_USER_ID = 'me';
const RUNTIME_GLOBAL_KEYS = [
  '__HARMOLYN_XOREIN_RUNTIME__',
  '__HARMOLYN_RUNTIME_SNAPSHOT__',
  '__XOREIN_RUNTIME_SNAPSHOT__',
] as const;
const SESSION_GLOBAL_KEYS = [
  '__HARMOLYN_XOREIN_SESSION__',
  '__HARMOLYN_SESSION_SNAPSHOT__',
  '__XOREIN_SESSION_SNAPSHOT__',
] as const;
const RUNTIME_STORAGE_KEYS = [
  'harmolyn:xorein:runtime',
  'harmolyn:runtime-snapshot',
  'xorein:runtime-snapshot',
] as const;
const SESSION_STORAGE_KEYS = [
  'harmolyn:xorein:session',
  'harmolyn:session-snapshot',
  'xorein:session-snapshot',
] as const;

export interface ShellRuntimeData {
  runtimeSnapshot: XoreinRuntimeSnapshot | null;
  sessionSnapshot: XoreinSessionSnapshot | null;
  currentUser: User;
  users: User[];
  servers: Server[];
  directMessages: DirectMessageChannel[];
  messages: Message[];
  messagesByScope: Map<string, Message[]>;
  defaultChannelByServer: Map<string, string>;
  initialServerId: string | 'home' | 'explore';
  initialChannelId: string;
}

type BrowserStorage = Pick<Storage, 'getItem'>;

const initialShellSignature = createRuntimeSignature();
const shellData = createShellRuntimeData();
const RUNTIME_POLL_INTERVAL_MS = 1000;
let cachedShellSignature = initialShellSignature;
let cachedShellData = shellData;

export const CURRENT_USER = shellData.currentUser;
export const USERS = shellData.users;
export const DIRECT_MESSAGES = shellData.directMessages;
export const SERVERS = shellData.servers;
export const MOCK_MESSAGES = shellData.messages;
export const ACTIVE_SESSION = shellData.sessionSnapshot;
export const HAS_RUNTIME_SNAPSHOT = shellData.runtimeSnapshot !== null;
export const INITIAL_ACTIVE_SERVER_ID = shellData.initialServerId;
export const INITIAL_ACTIVE_CHANNEL_ID = shellData.initialChannelId;

export function readShellRuntimeData(): ShellRuntimeData {
  const nextSignature = createRuntimeSignature();
  if (nextSignature !== cachedShellSignature) {
    cachedShellSignature = nextSignature;
    cachedShellData = createShellRuntimeData();
  }
  return cachedShellData;
}

export function subscribeShellRuntimeData(onChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  let lastSignature = createRuntimeSignature();
  const emitIfChanged = () => {
    const nextSignature = createRuntimeSignature();
    if (nextSignature === lastSignature) {
      return;
    }
    lastSignature = nextSignature;
    onChange();
  };

  const intervalId = window.setInterval(emitIfChanged, RUNTIME_POLL_INTERVAL_MS);
  window.addEventListener('storage', emitIfChanged);
  window.addEventListener('focus', emitIfChanged);
  window.addEventListener('visibilitychange', emitIfChanged);

  return () => {
    window.clearInterval(intervalId);
    window.removeEventListener('storage', emitIfChanged);
    window.removeEventListener('focus', emitIfChanged);
    window.removeEventListener('visibilitychange', emitIfChanged);
  };
}

export function deriveConnectionState(
  shell: ShellRuntimeData,
  activeServerId: string | 'home' | 'explore',
  hasSeenRuntime: boolean,
): ConnectionState {
  const runtimeSnapshot = shell.runtimeSnapshot;
  const sessionSnapshot = shell.sessionSnapshot;
  const localPeerId = runtimeSnapshot?.identity?.peer_id?.trim() ?? '';

  if (!runtimeSnapshot || !localPeerId) {
    if (hasSeenRuntime || Boolean(sessionSnapshot?.serverId)) {
      return {
        status: 'reconnecting',
        label: 'RECONNECTING',
        detail: 'Waiting for the local xorein runtime to come back online.',
        canUseConnectivityActions: false,
      };
    }
    return {
      status: 'disconnected',
      label: 'OFFLINE',
      detail: 'The local xorein runtime is unavailable.',
      canUseConnectivityActions: false,
    };
  }

  const scopedServerId = activeServerId === 'home' || activeServerId === 'explore'
    ? sessionSnapshot?.serverId ?? null
    : activeServerId;
  const scopedServer = runtimeSnapshot.servers?.find((server) => server.id === scopedServerId) ?? null;
  if (!scopedServerId || !scopedServer) {
    return {
      status: 'connected',
      label: 'CONNECTED',
      detail: 'The local xorein runtime is available.',
      canUseConnectivityActions: true,
    };
  }

  const knownPeers = new Map((runtimeSnapshot.known_peers ?? []).map((peer) => [peer.peer_id, peer]));
  const remoteMemberIds = scopedServer.members.filter((peerId) => peerId && peerId !== localPeerId);
  const remotePeers = remoteMemberIds
    .map((peerId) => knownPeers.get(peerId))
    .filter((peer): peer is NonNullable<typeof peer> => Boolean(peer));
  const hasReachablePeer = remotePeers.some((peer) => (peer.addresses?.length ?? 0) > 0)
    || ((knownPeers.get(scopedServer.owner_peer_id)?.addresses?.length ?? 0) > 0);
  if (!hasReachablePeer) {
    return {
      status: 'no-peer',
      label: 'NO PEER',
      detail: `No reachable peer is currently advertised for ${scopedServer.name}.`,
      canUseConnectivityActions: false,
    };
  }

  const telemetry = runtimeSnapshot.telemetry ?? [];
  const relayTargets = [
    ...(scopedServer.manifest?.relay_addrs ?? []),
    ...(runtimeSnapshot.known_peers ?? [])
      .filter((peer) => peer.role === 'relay' || peer.role === 'bootstrap')
      .flatMap((peer) => peer.addresses ?? []),
  ].filter((value, index, values) => value && values.indexOf(value) === index);
  const relayFailureDetected = telemetry.some((entry) =>
    entry.includes('delivery.relay.failed')
    || entry.includes('relay fallback not configured')
    || entry.includes('relay reservation')
    || entry.includes('delivery failed on direct and relay paths'));
  if (relayFailureDetected && relayTargets.length === 0) {
    return {
      status: 'no-relay',
      label: 'NO RELAY',
      detail: `No relay path is available for ${scopedServer.name}.`,
      canUseConnectivityActions: false,
    };
  }

  return {
    status: 'connected',
    label: 'CONNECTED',
    detail: `Connected to ${scopedServer.name}.`,
    canUseConnectivityActions: true,
  };
}

export function getDefaultChannelId(serverId: string | 'home' | 'explore'): string {
  if (serverId === 'explore') {
    return '';
  }
  return shellData.defaultChannelByServer.get(serverId) ?? '';
}

export function getMessagesForScope(scopeId: string): Message[] {
  return shellData.messagesByScope.get(scopeId) ?? [];
}

function createShellRuntimeData(): ShellRuntimeData {
  const runtimeSnapshot = readInjectedValue<XoreinRuntimeSnapshot>(RUNTIME_GLOBAL_KEYS, RUNTIME_STORAGE_KEYS);
  const sessionSnapshot = readInjectedValue<XoreinSessionSnapshot>(SESSION_GLOBAL_KEYS, SESSION_STORAGE_KEYS);
  const currentPeerId = runtimeSnapshot?.identity?.peer_id?.trim() ?? '';
  const knownPeers = new Map((runtimeSnapshot?.known_peers ?? []).map((peer) => [peer.peer_id, peer]));
  const voiceSessions = new Map((runtimeSnapshot?.voice_sessions ?? []).map((session) => [session.channel_id, session]));

  const currentUser = createCurrentUser(runtimeSnapshot, currentPeerId);
  const userMap = new Map<string, User>([[CURRENT_USER_ID, currentUser]]);

  const ensureUser = (
    peerId: string,
    options: {
      role?: string;
      fallbackName?: string;
      muted?: boolean;
    } = {},
  ): User => {
    const userId = mapPeerIdToUserId(peerId, currentPeerId);
    const existing = userMap.get(userId);
    if (existing) {
      const merged: User = {
        ...existing,
        ...(options.role ? { role: options.role } : {}),
        ...(typeof options.muted === 'boolean' ? { muted: options.muted } : {}),
      };
      userMap.set(userId, merged);
      return merged;
    }

    const peer = knownPeers.get(peerId);
    const username = userId === CURRENT_USER_ID
      ? currentUser.username
      : (options.fallbackName?.trim() || abbreviatePeerId(peerId));
    const nextUser: User = {
      id: userId,
      username,
      avatar: buildAvatarDataUri(username, colorForSeed(peerId || username)),
      status: statusFromPeer(peer, Boolean(options.muted)),
      role: options.role,
      color: colorForSeed(peerId || username),
      bio: userId === CURRENT_USER_ID ? currentUser.bio : peer?.source ? `SOURCE // ${peer.source.toUpperCase()}` : undefined,
      joinedAt: formatDate(peer?.last_seen_at),
      muted: options.muted,
    };
    userMap.set(userId, nextUser);
    return nextUser;
  };

  const mappedMessages = (runtimeSnapshot?.messages ?? [])
    .filter((message) => !message.deleted)
    .sort((left, right) => toTimestamp(left.created_at) - toTimestamp(right.created_at))
    .map((message) => mapMessage(message, currentPeerId, ensureUser));

  const messagesByScope = new Map<string, Message[]>();
  for (const message of mappedMessages) {
    const scoped = messagesByScope.get(message.scopeId) ?? [];
    scoped.push(message.message);
    messagesByScope.set(message.scopeId, scoped);
  }

  const directMessages = (runtimeSnapshot?.dms ?? [])
    .map((dm) => mapDirectMessage(dm, currentPeerId, messagesByScope, ensureUser))
    .sort((left, right) => compareTimestamps(right.timestamp, left.timestamp));

  const servers = (runtimeSnapshot?.servers ?? [])
    .map((server) => mapServer(server, currentPeerId, voiceSessions, ensureUser))
    .sort((left, right) => left.name.localeCompare(right.name));

  const defaultChannelByServer = new Map<string, string>();
  defaultChannelByServer.set('home', directMessages[0]?.id ?? '');
  defaultChannelByServer.set('explore', '');
  for (const server of servers) {
    const firstChannel = server.categories.flatMap((category) => category.channels).find((channel) => channel.type === 'text')
      ?? server.categories.flatMap((category) => category.channels)[0];
    defaultChannelByServer.set(server.id, firstChannel?.id ?? '');
  }

  const initialServerId = selectInitialServerId(sessionSnapshot, servers, directMessages);
  const initialChannelId = defaultChannelByServer.get(initialServerId) ?? '';

  return {
    runtimeSnapshot,
    sessionSnapshot,
    currentUser,
    users: [...userMap.values()].sort((left, right) => {
      if (left.id === CURRENT_USER_ID) return -1;
      if (right.id === CURRENT_USER_ID) return 1;
      return left.username.localeCompare(right.username);
    }),
    servers,
    directMessages,
    messages: mappedMessages.map((entry) => entry.message),
    messagesByScope,
    defaultChannelByServer,
    initialServerId,
    initialChannelId,
  };
}

function mapServer(
  server: XoreinRuntimeServer,
  currentPeerId: string,
  voiceSessions: Map<string, XoreinRuntimeVoiceSession>,
  ensureUser: (peerId: string, options?: { role?: string; fallbackName?: string; muted?: boolean }) => User,
): Server {
  const channels = Object.values(server.channels ?? {}).sort((left, right) => toTimestamp(left.created_at) - toTimestamp(right.created_at));
  const textChannels = channels.filter((channel) => !channel.voice).map((channel) => mapChannel(channel, voiceSessions, currentPeerId, ensureUser));
  const voiceChannels = channels.filter((channel) => channel.voice).map((channel) => mapChannel(channel, voiceSessions, currentPeerId, ensureUser));
  const members = uniqueUsers(server.members.map((peerId) => ensureUser(peerId, {
    role: peerId === server.owner_peer_id ? 'Admin' : 'Member',
  })));

  return {
    id: server.id,
    name: server.manifest?.name?.trim() || server.name,
    icon: buildAvatarDataUri(server.name, colorForSeed(server.id)),
    ownerId: mapPeerIdToUserId(server.owner_peer_id, currentPeerId),
    members,
    description: server.manifest?.description?.trim() || server.description,
    categories: [
      ...(textChannels.length > 0 ? [{ id: `${server.id}-text`, name: 'TEXT CHANNELS', channels: textChannels }] : []),
      ...(voiceChannels.length > 0 ? [{ id: `${server.id}-voice`, name: 'VOICE CHANNELS', channels: voiceChannels }] : []),
    ],
  };
}

function mapChannel(
  channel: XoreinRuntimeChannel,
  voiceSessions: Map<string, XoreinRuntimeVoiceSession>,
  currentPeerId: string,
  ensureUser: (peerId: string, options?: { role?: string; fallbackName?: string; muted?: boolean }) => User,
) {
  const voiceSession = voiceSessions.get(channel.id);
  return {
    id: channel.id,
    name: channel.name,
    type: channel.voice ? 'voice' : 'text',
    categoryId: channel.voice ? `${channel.server_id}-voice` : `${channel.server_id}-text`,
    activeUsers: channel.voice
      ? Object.values(voiceSession?.participants ?? {}).map((participant) => ensureUser(participant.peer_id, { muted: participant.muted }))
      : undefined,
  };
}

function mapDirectMessage(
  dm: XoreinRuntimeDM,
  currentPeerId: string,
  messagesByScope: Map<string, Message[]>,
  ensureUser: (peerId: string, options?: { role?: string; fallbackName?: string; muted?: boolean }) => User,
): DirectMessageChannel {
  const otherParticipant = dm.participants.find((peerId) => peerId !== currentPeerId) ?? dm.participants[0] ?? dm.id;
  const user = ensureUser(otherParticipant);
  const latestMessage = messagesByScope.get(dm.id)?.at(-1);
  return {
    id: dm.id,
    userId: user.id,
    lastMessage: latestMessage?.content || 'NO MESSAGES YET',
    timestamp: latestMessage?.timestamp || formatShortTimestamp(dm.created_at),
  };
}

function mapMessage(
  message: XoreinRuntimeMessage,
  currentPeerId: string,
  ensureUser: (peerId: string, options?: { role?: string; fallbackName?: string; muted?: boolean }) => User,
): { scopeId: string; message: Message } {
  ensureUser(message.sender_peer_id);
  return {
    scopeId: message.scope_id,
    message: {
      id: message.id,
      userId: mapPeerIdToUserId(message.sender_peer_id, currentPeerId),
      content: message.body,
      timestamp: formatMessageTimestamp(message.created_at),
      editedAt: message.updated_at ? formatMessageTimestamp(message.updated_at) : undefined,
    },
  };
}

function createCurrentUser(runtimeSnapshot: XoreinRuntimeSnapshot | null, currentPeerId: string): User {
  const displayName = runtimeSnapshot?.identity?.profile?.display_name?.trim() || 'Local User';
  const color = colorForSeed(currentPeerId || displayName);
  return {
    id: CURRENT_USER_ID,
    username: displayName,
    avatar: buildAvatarDataUri(displayName, color),
    status: runtimeSnapshot?.identity?.peer_id ? 'online' : 'offline',
    color,
    bio: runtimeSnapshot?.identity?.profile?.bio?.trim() || (runtimeSnapshot?.identity?.peer_id ? 'CONNECTED TO LOCAL XOREIN RUNTIME' : 'WAITING FOR LOCAL XOREIN RUNTIME'),
    joinedAt: formatDate(runtimeSnapshot?.identity?.created_at),
  };
}

function statusFromPeer(peer: XoreinRuntimePeer | undefined, muted: boolean): UserStatus {
  if (muted) {
    return 'dnd';
  }
  if (!peer?.last_seen_at) {
    return 'offline';
  }
  const ageMs = Date.now() - toTimestamp(peer.last_seen_at);
  if (ageMs < 5 * 60_000) {
    return 'online';
  }
  if (ageMs < 30 * 60_000) {
    return 'idle';
  }
  return 'offline';
}

function mapPeerIdToUserId(peerId: string, currentPeerId: string): string {
  if (!peerId) {
    return peerId;
  }
  return peerId === currentPeerId ? CURRENT_USER_ID : peerId;
}

function selectInitialServerId(
  sessionSnapshot: XoreinSessionSnapshot | null,
  servers: Server[],
  directMessages: DirectMessageChannel[],
): string | 'home' | 'explore' {
  if (sessionSnapshot?.serverId && servers.some((server) => server.id === sessionSnapshot.serverId)) {
    return sessionSnapshot.serverId;
  }
  if (servers.length > 0) {
    return servers[0].id;
  }
  if (directMessages.length > 0) {
    return 'home';
  }
  return 'home';
}

function readInjectedValue<T>(globalKeys: readonly string[], storageKeys: readonly string[]): T | null {
  if (typeof window === 'undefined') {
    return null;
  }

  for (const key of globalKeys) {
    const value = parseMaybeJson<T>((window as Record<string, unknown>)[key]);
    if (value) {
      return value;
    }
  }

  const storages: BrowserStorage[] = [window.sessionStorage, window.localStorage];
  for (const storage of storages) {
    for (const key of storageKeys) {
      const raw = storage.getItem(key);
      const value = parseMaybeJson<T>(raw);
      if (value) {
        return value;
      }
    }
  }

  return null;
}

function createRuntimeSignature(): string {
  const runtime = readInjectedValue<XoreinRuntimeSnapshot>(RUNTIME_GLOBAL_KEYS, RUNTIME_STORAGE_KEYS);
  const session = readInjectedValue<XoreinSessionSnapshot>(SESSION_GLOBAL_KEYS, SESSION_STORAGE_KEYS);
  return JSON.stringify({ runtime, session });
}

function parseMaybeJson<T>(value: unknown): T | null {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  if (typeof value === 'object') {
    return value as T;
  }
  return null;
}

function uniqueUsers(users: User[]): User[] {
  const seen = new Map<string, User>();
  for (const user of users) {
    seen.set(user.id, user);
  }
  return [...seen.values()];
}

function abbreviatePeerId(peerId: string): string {
  if (!peerId) {
    return 'Unknown Peer';
  }
  return peerId.length <= 12 ? peerId : `${peerId.slice(0, 6)}…${peerId.slice(-4)}`;
}

function formatMessageTimestamp(value?: string): string {
  const timestamp = toTimestamp(value);
  if (!timestamp) {
    return '--:--';
  }
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function formatShortTimestamp(value?: string): string {
  const timestamp = toTimestamp(value);
  if (!timestamp) {
    return '';
  }
  const deltaMinutes = Math.round((Date.now() - timestamp) / 60_000);
  if (deltaMinutes < 1) {
    return 'NOW';
  }
  if (deltaMinutes < 60) {
    return `${deltaMinutes}M`;
  }
  const deltaHours = Math.round(deltaMinutes / 60);
  if (deltaHours < 24) {
    return `${deltaHours}H`;
  }
  const deltaDays = Math.round(deltaHours / 24);
  return `${deltaDays}D`;
}

function formatDate(value?: string): string | undefined {
  const timestamp = toTimestamp(value);
  if (!timestamp) {
    return undefined;
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp)).toUpperCase();
}

function compareTimestamps(left?: string, right?: string): number {
  return toTimestamp(left) - toTimestamp(right);
}

function toTimestamp(value?: string): number {
  if (!value) {
    return 0;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function colorForSeed(seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  const hue = hash % 360;
  return `hsl(${hue} 72% 58%)`;
}

function buildAvatarDataUri(label: string, background: string): string {
  const initials = label
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="24" fill="${background}"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="#05070D" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="700">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
