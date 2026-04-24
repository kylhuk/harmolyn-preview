export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline';
export type DonationTier = 'coffee' | 'supporter' | 'champion';
export type MessageLayout = 'modern' | 'bubbles' | 'terminal';

export interface User {
  id: string;
  username: string;
  avatar: string;
  status: UserStatus;
  role?: string;
  color?: string;
  bio?: string;
  joinedAt?: string;
  muted?: boolean;
  donationTier?: DonationTier;
}

export interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  attachments?: string[];
  reactions?: { emoji: string; count: number; reacted: boolean }[];
  isSystem?: boolean;
  pinned?: boolean;
  replyToId?: string;
  editedAt?: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  categoryId: string;
  unreadCount?: number;
  activeUsers?: User[];
}

export interface Category {
  id: string;
  name: string;
  channels: Channel[];
}

export interface Server {
  id: string;
  name: string;
  icon: string;
  ownerId: string;
  categories: Category[];
  members: User[];
  banner?: string;
  region?: string;
  description?: string;
}

export interface DirectMessageChannel {
  id: string;
  userId: string;
  lastMessage?: string;
  unreadCount?: number;
  timestamp?: string;
}

export interface AppState {
  activeServerId: string | 'home' | 'explore';
  activeChannelId: string;
  connectedVoiceChannelId: string | null;
  viewMode: 'chat' | 'settings' | 'server-settings' | 'explorer';
  messageLayout: MessageLayout;

  // UI Layout States
  mobileMenuOpen: boolean;
  memberListCollapsed: boolean;
  channelListCollapsed: boolean;

  // Modals
  showCreateServer: boolean;
  showSettings: boolean;
  showDonations: boolean;
  showShop: boolean;
  showQuests: boolean;
  showApplications: boolean;
  showActivities: boolean;
}

export interface XoreinRuntimeProfile {
  display_name?: string;
  bio?: string;
}

export interface XoreinRuntimeIdentity {
  id: string;
  peer_id: string;
  public_key?: string;
  created_at?: string;
  profile?: XoreinRuntimeProfile;
}

export interface XoreinRuntimePeer {
  peer_id: string;
  role?: string;
  addresses?: string[];
  public_key?: string;
  source?: string;
  last_seen_at?: string;
}

export interface XoreinRuntimeChannel {
  id: string;
  server_id: string;
  name: string;
  voice: boolean;
  created_at?: string;
}

export interface XoreinRuntimeManifest {
  name?: string;
  description?: string;
  owner_addresses?: string[];
  bootstrap_addrs?: string[];
  relay_addrs?: string[];
  capabilities?: string[];
  history_coverage?: string;
  history_retention_messages?: number;
}

export interface XoreinRuntimeServer {
  id: string;
  name: string;
  description?: string;
  owner_peer_id: string;
  created_at?: string;
  updated_at?: string;
  members: string[];
  channels: Record<string, XoreinRuntimeChannel>;
  manifest?: XoreinRuntimeManifest;
  invite?: string;
}

export interface XoreinRuntimeDM {
  id: string;
  participants: string[];
  created_at?: string;
}

export interface XoreinRuntimeMessage {
  id: string;
  scope_type: string;
  scope_id: string;
  server_id?: string;
  sender_peer_id: string;
  body: string;
  created_at?: string;
  updated_at?: string;
  deleted?: boolean;
}

export interface XoreinRuntimeVoiceParticipant {
  peer_id: string;
  muted?: boolean;
  joined_at?: string;
  last_frame_at?: string;
}

export interface XoreinRuntimeVoiceSession {
  channel_id: string;
  participants: Record<string, XoreinRuntimeVoiceParticipant>;
}

export interface XoreinRuntimeSnapshot {
  role?: string;
  peer_id?: string;
  control_endpoint?: string;
  identity?: Partial<XoreinRuntimeIdentity>;
  known_peers?: XoreinRuntimePeer[];
  servers?: XoreinRuntimeServer[];
  dms?: XoreinRuntimeDM[];
  messages?: XoreinRuntimeMessage[];
  voice_sessions?: XoreinRuntimeVoiceSession[];
  settings?: Record<string, string>;
  telemetry?: string[];
}

export interface XoreinSessionSnapshot {
  serverId: string;
  securityMode?: string;
  connectedAtMs?: number;
  reconnectAttempts?: number;
  manifest?: {
    name?: string;
    description?: string;
  };
  acceptedProtocol?: {
    family: string;
    name: string;
    version: {
      major: number;
      minor: number;
    };
  } | null;
}

export type ConnectionLifecycleStatus = 'connected' | 'disconnected' | 'reconnecting' | 'no-peer' | 'no-relay';

export interface ConnectionState {
  status: ConnectionLifecycleStatus;
  label: string;
  detail: string;
  canUseConnectivityActions: boolean;
}
