
export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline';
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
  showNitro: boolean;
  showShop: boolean;
  showQuests: boolean;
  showBoost: boolean;
  showApplications: boolean;
  showActivities: boolean;
}
