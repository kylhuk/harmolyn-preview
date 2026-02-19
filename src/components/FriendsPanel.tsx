import React, { useState } from 'react';
import { User, UserStatus } from '@/types';
import { USERS, CURRENT_USER } from '@/data';
import { Search, MessageSquare, Phone, X, UserPlus, Users, UserX, Clock, Check, Ban, ShieldAlert } from 'lucide-react';
import { useFeature } from '@/hooks/useFeature';
import { MessageRequests } from '@/components/MessageRequests';

type FriendsTab = 'online' | 'all' | 'pending' | 'blocked' | 'requests';

interface FriendRequest {
  userId: string;
  type: 'incoming' | 'outgoing';
  timestamp: string;
}

const MOCK_FRIEND_REQUESTS: FriendRequest[] = [
  { userId: 'u3', type: 'incoming', timestamp: '2H AGO' },
  { userId: 'u4', type: 'outgoing', timestamp: '1D AGO' },
];

const BLOCKED_USERS: string[] = [];

const getStatusColor = (status: UserStatus) => {
  switch (status) {
    case 'online': return 'bg-accent-success shadow-[0_0_5px_#05FFA1]';
    case 'idle': return 'bg-accent-warning shadow-[0_0_5px_#FFB020]';
    case 'dnd': return 'bg-accent-danger shadow-[0_0_5px_#FF2A6D]';
    default: return 'bg-white/20';
  }
};

const getStatusLabel = (status: UserStatus) => {
  switch (status) {
    case 'online': return 'ONLINE';
    case 'idle': return 'IDLE';
    case 'dnd': return 'DO NOT DISTURB';
    default: return 'OFFLINE';
  }
};

interface FriendsPanelProps {
  onOpenDM: (userId: string) => void;
}

export const FriendsPanel: React.FC<FriendsPanelProps> = ({ onOpenDM }) => {
  const [activeTab, setActiveTab] = useState<FriendsTab>('online');
  const hasMessageRequests = useFeature('messageRequests');
  const [searchQuery, setSearchQuery] = useState('');
  const [addFriendInput, setAddFriendInput] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendRequests, setFriendRequests] = useState(MOCK_FRIEND_REQUESTS);
  const [blockedUsers, setBlockedUsers] = useState<string[]>(BLOCKED_USERS);

  const allFriends = USERS.filter(u => u.id !== 'me' && !blockedUsers.includes(u.id) && !friendRequests.some(fr => fr.userId === u.id));
  const onlineFriends = allFriends.filter(u => u.status === 'online' || u.status === 'idle' || u.status === 'dnd');
  const pendingRequests = friendRequests;
  const blocked = USERS.filter(u => blockedUsers.includes(u.id));

  const tabs: { key: FriendsTab; label: string; count?: number }[] = [
    { key: 'online', label: 'ONLINE', count: onlineFriends.length },
    { key: 'all', label: 'ALL', count: allFriends.length },
    { key: 'pending', label: 'PENDING', count: pendingRequests.length },
    { key: 'blocked', label: 'BLOCKED', count: blocked.length },
    ...(hasMessageRequests ? [{ key: 'requests' as FriendsTab, label: 'REQUESTS', count: 3 }] : []),
  ];

  const filterUsers = (users: User[]) => {
    if (!searchQuery.trim()) return users;
    return users.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const acceptRequest = (userId: string) => {
    setFriendRequests(prev => prev.filter(fr => fr.userId !== userId));
  };

  const declineRequest = (userId: string) => {
    setFriendRequests(prev => prev.filter(fr => fr.userId !== userId));
  };

  const unblockUser = (userId: string) => {
    setBlockedUsers(prev => prev.filter(id => id !== userId));
  };

  const renderEmptyState = (icon: React.ReactNode, title: string, subtitle: string) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 text-white/20">
        {icon}
      </div>
      <p className="text-white/40 font-display text-base mb-1.5">{title}</p>
      <p className="text-white/20 text-xs max-w-[240px]">{subtitle}</p>
    </div>
  );

  const renderFriendRow = (user: User, actions: React.ReactNode) => (
    <div key={user.id} className="flex items-center gap-3 p-3 rounded-r2 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
      <div className="relative flex-shrink-0">
        <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-r2 ring-1 ring-white/10" />
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-bg-0 ${getStatusColor(user.status)}`}></div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-foreground font-display text-[13px] truncate">{user.username}</div>
        <div className="micro-label text-white/30 tracking-widest text-[8px]">{getStatusLabel(user.status)}</div>
      </div>
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {actions}
      </div>
    </div>
  );

  const ActionButton = ({ icon, label, onClick, variant = 'default' }: { icon: React.ReactNode; label: string; onClick: () => void; variant?: 'default' | 'danger' | 'success' }) => (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
        variant === 'danger' ? 'bg-accent-danger/10 border-accent-danger/20 text-accent-danger hover:bg-accent-danger/20' :
        variant === 'success' ? 'bg-accent-success/10 border-accent-success/20 text-accent-success hover:bg-accent-success/20' :
        'bg-white/5 border-white/10 text-white/50 hover:text-primary hover:border-primary/30 hover:bg-primary/10'
      }`}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );

  let content: React.ReactNode;

  if (activeTab === 'online') {
    const filtered = filterUsers(onlineFriends);
    content = filtered.length > 0 ? (
      <div className="space-y-1.5">
        <div className="micro-label text-white/30 tracking-widest px-1 mb-2.5">ONLINE — {filtered.length}</div>
        {filtered.map(user => renderFriendRow(user, (
          <>
            <ActionButton icon={<MessageSquare size={16} />} label="Message" onClick={() => onOpenDM(user.id)} />
            <ActionButton icon={<Phone size={16} />} label="Call" onClick={() => {}} />
          </>
        )))}
      </div>
    ) : renderEmptyState(<Users size={32} />, 'No one is online', 'Your online friends will appear here.');
  } else if (activeTab === 'all') {
    const filtered = filterUsers(allFriends);
    content = filtered.length > 0 ? (
      <div className="space-y-1.5">
        <div className="micro-label text-white/30 tracking-widest px-1 mb-2.5">ALL FRIENDS — {filtered.length}</div>
        {filtered.map(user => renderFriendRow(user, (
          <>
            <ActionButton icon={<MessageSquare size={16} />} label="Message" onClick={() => onOpenDM(user.id)} />
            <ActionButton icon={<Phone size={16} />} label="Call" onClick={() => {}} />
          </>
        )))}
      </div>
    ) : renderEmptyState(<Users size={32} />, 'No friends yet', 'Add some friends to get started!');
  } else if (activeTab === 'pending') {
    content = pendingRequests.length > 0 ? (
      <div className="space-y-1.5">
        <div className="micro-label text-white/30 tracking-widest px-1 mb-2.5">PENDING — {pendingRequests.length}</div>
        {pendingRequests.map(fr => {
          const user = USERS.find(u => u.id === fr.userId);
          if (!user) return null;
          return renderFriendRow(user, fr.type === 'incoming' ? (
            <>
              <ActionButton icon={<Check size={16} />} label="Accept" onClick={() => acceptRequest(fr.userId)} variant="success" />
              <ActionButton icon={<X size={16} />} label="Decline" onClick={() => declineRequest(fr.userId)} variant="danger" />
            </>
          ) : (
            <span className="micro-label text-white/20 tracking-widest mr-1.5">OUTGOING</span>
          ));
        })}
      </div>
    ) : renderEmptyState(<Clock size={32} />, 'No pending requests', 'Friend requests you send or receive will show up here.');
  } else if (activeTab === 'requests') {
    content = <MessageRequests />;
  } else {
    content = blocked.length > 0 ? (
      <div className="space-y-1.5">
        <div className="micro-label text-white/30 tracking-widest px-1 mb-2.5">BLOCKED — {blocked.length}</div>
        {blocked.map(user => renderFriendRow(user, (
          <ActionButton icon={<UserX size={16} />} label="Unblock" onClick={() => unblockUser(user.id)} variant="danger" />
        )))}
      </div>
    ) : renderEmptyState(<Ban size={32} />, 'No blocked users', 'Users you block will appear here.');
  }

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-[52px] flex items-center justify-between px-5 md:px-6 border-b border-white/5 glass-realistic flex-shrink-0">
        <div className="flex items-center gap-3">
          <Users size={18} className="text-white/50" />
          <span className="font-bold text-foreground font-display text-base tracking-wide">FRIENDS</span>
          <div className="h-4 w-[1px] bg-white/10"></div>
          <div className="flex items-center gap-0.5">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all ${
                  activeTab === tab.key
                    ? 'bg-primary/15 text-primary border border-primary/30'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`ml-1 text-[9px] ${activeTab === tab.key ? 'text-primary/70' : 'text-white/25'}`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowAddFriend(!showAddFriend)}
          className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all flex items-center gap-1.5 ${
            showAddFriend
              ? 'bg-transparent text-white/50 border border-white/10'
              : 'bg-accent-success text-bg-0 hover:brightness-110 shadow-[0_0_10px_rgba(5,255,161,0.2)]'
          }`}
        >
          <UserPlus size={12} />
          {showAddFriend ? 'CLOSE' : 'ADD FRIEND'}
        </button>
      </div>

      {/* Add Friend Bar */}
      {showAddFriend && (
        <div className="px-5 md:px-6 py-4 border-b border-white/5 bg-white/[0.02]">
          <p className="text-xs text-white/60 mb-2.5">You can add friends with their Harmolyn username.</p>
          <div className="flex gap-2.5">
            <input
              type="text"
              value={addFriendInput}
              onChange={(e) => setAddFriendInput(e.target.value)}
              placeholder="Enter a username..."
              className="flex-1 bg-bg-0 border border-white/10 rounded-full px-4 py-2.5 text-xs font-mono text-foreground placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
            />
            <button
              disabled={!addFriendInput.trim()}
              className="px-5 py-2.5 bg-primary rounded-full text-bg-0 font-bold text-xs tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-glow transition-all"
            >
              SEND REQUEST
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-5 md:px-6 py-2.5">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-bg-0/50 border border-white/5 rounded-full px-9 py-2 text-xs font-mono text-foreground placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 md:px-6 pb-6 no-scrollbar">
        {content}
      </div>
    </div>
  );
};
