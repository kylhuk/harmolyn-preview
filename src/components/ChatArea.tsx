
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Channel, Message, User, MessageLayout } from '@/types';
import { generateTheme } from '@/utils/themeGenerator';
import { renderMarkdown } from '@/utils/markdown';
import { EmojiPicker } from '@/components/EmojiPicker';
import { TypingIndicator } from '@/components/TypingIndicator';
import { MediaEmbed } from '@/components/MediaEmbed';
import { ForwardMessageModal } from '@/components/ForwardMessageModal';
import { PollCreator } from '@/components/PollCreator';
import { PollMessage } from '@/components/PollMessage';
import { ThreadPanel } from '@/components/ThreadPanel';
import { MediaLightbox } from '@/components/MediaLightbox';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
import { SearchPanel } from '@/components/SearchPanel';
import { InboxPanel } from '@/components/InboxPanel';
import { MentionAutocomplete } from '@/components/MentionAutocomplete';
import { useFeature } from '@/hooks/useFeature';
import { useContextMenu } from '@/components/GlobalContextMenu';
import { Hash, Bell, Pin, Users, Search, MoreHorizontal, MessageSquare, AtSign, Smile, Sticker, PlusCircle, X, Send, LayoutTemplate, Menu, Trash2, MicOff, Image, FileText, Reply, CornerUpRight, Pencil, Check, PanelRightClose, Forward, BarChart3, Link2, ArrowDown, MessageCircle, Inbox } from 'lucide-react';

// Action button sub-component for message interactions
const ActionBtn = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="p-1.5 text-white/40 hover:text-primary hover:bg-white/5 rounded-full transition-all btn-press focus-ring"
    aria-label={label}
  >
    {icon}
  </button>
);

// Helper component for consistent reaction chips
const ReactionChip = ({ emoji, count, reacted, onClick, compact = false }: { emoji: string, count: number, reacted: boolean, onClick?: () => void, compact?: boolean }) => (
  <button 
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className={`
        ${compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-0.5 text-[10px]'} 
        rounded-full border flex items-center gap-1 transition-all cursor-pointer select-none group btn-press
        ${reacted 
          ? 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_10px_rgba(19,221,236,0.15)] hover:bg-primary/20 hover:border-primary/50' 
          : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:bg-white/10 hover:text-white/70'
        }
      `}
  >
      <span className={compact ? 'text-[10px]' : 'text-xs'}>{emoji}</span>
      <span className={`font-bold font-mono ${reacted ? 'text-primary' : 'text-white/40 group-hover:text-white/60'}`}>{count}</span>
  </button>
);

const REACTION_EMOJIS = ['👍', '❤️', '🔥', '😂', '😮', '😢', '🚀', '👀'];

// Helper to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return 'bg-accent-success shadow-[0_0_5px_#05FFA1]';
    case 'idle': return 'bg-accent-warning shadow-[0_0_5px_#FFB020]';
    case 'dnd': return 'bg-accent-danger shadow-[0_0_5px_#FF2A6D]';
    default: return 'bg-white/20';
  }
};

// Enhanced Username Component with cyberpunk visual effects
const UsernameDisplay = ({ user, compact = false }: { user: User, compact?: boolean }) => {
  const isSpecial = user.role === 'Admin' || user.role === 'Moderator';
  const baseColor = user.color || '#F6F8F8';
  
  const gradient = baseColor === '#13DDEC' 
    ? 'linear-gradient(135deg, #13DDEC 0%, #00A8CC 100%)' 
    : `linear-gradient(135deg, ${baseColor} 0%, ${baseColor}AA 100%)`;
  
  const glowColor = `${baseColor}66`;

  return (
    <span className={`font-bold ${compact ? 'text-xs' : 'text-[13px]'} tracking-tight cursor-pointer transition-all duration-300 relative px-1 -mx-1 rounded-md inline-flex items-center gap-1.5`}>
      <span 
        className="transition-all duration-300 hover:brightness-125 font-display"
        style={{ 
          background: gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: isSpecial && !compact ? `drop-shadow(0 0 6px ${glowColor})` : 'none',
        }}
      >
        {user.username}
      </span>
      {!compact && (
        <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(user.status)}`} title={user.status}></div>
      )}
      {isSpecial && !compact && (
        <span 
          className="absolute -bottom-[1px] left-1 right-1 h-[1px] opacity-20"
          style={{ background: `linear-gradient(90deg, ${baseColor}, transparent)` }}
        ></span>
      )}
    </span>
  );
};

// User popup sub-component for member details
const UserPopup = ({ user, children }: { user: User, children?: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleEnter = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setOpen(true); };
    const handleLeave = () => { closeTimer.current = setTimeout(() => setOpen(false), 200); };
    return (
        <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            {children}
            {open && (
                <div
                    className="absolute top-0 left-14 w-[230px] bg-bg-0 border border-white/10 rounded-r2 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[100] glass-card overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                    onMouseEnter={handleEnter}
                    onMouseLeave={handleLeave}
                >
                    <div className="h-16 bg-gradient-to-r from-primary/30 to-accent-purple/30 relative">
                        <div className="absolute inset-0 grid-overlay opacity-20"></div>
                    </div>
                    <div className="px-5 pb-5 -mt-8">
                        <div className="relative inline-block">
                            <img src={user.avatar} className="w-16 h-16 rounded-r2 border-[3px] border-bg-0 shadow-xl mb-3 ring-1 ring-white/10" alt={user.username} />
                            <div className={`absolute bottom-3 -right-1.5 px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-wider text-bg-0 border-2 border-bg-0 ${
                                user.status === 'online' ? 'bg-accent-success' : 
                                user.status === 'idle' ? 'bg-accent-warning' : 
                                user.status === 'dnd' ? 'bg-accent-danger' : 'bg-white/40'
                            }`}>
                                {user.status}
                            </div>
                        </div>
                        <h3 className="font-bold text-xl text-white font-display mb-1">{user.username}</h3>
                        <p className="micro-label text-primary/60 tracking-widest mb-3">OP // {user.id.toUpperCase()}</p>
                        <div className="bg-white/5 rounded-r1 p-3 border border-white/5 mb-3">
                            <div className="micro-label text-white/40 mb-1.5">BIO // DECRYPTED</div>
                            <p className="text-[10px] text-white/80 italic leading-relaxed">{user.bio}</p>
                        </div>
                        <div className="flex gap-1.5">
                            <button className="flex-1 bg-primary text-bg-0 font-bold py-2 rounded-full micro-label tracking-tight hover:shadow-glow transition-all text-[10px]">Direct Link</button>
                            <button className="px-2.5 bg-white/5 text-white/60 rounded-full hover:bg-white/10 transition-colors border border-white/5" aria-label="More options"><MoreHorizontal size={16} /></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

interface ChatAreaProps {
  channel?: Channel;
  messages: Message[];
  users?: User[];
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onToggleMemberList: () => void;
  isDM?: boolean;
  messageLayout: MessageLayout;
  onToggleLayout: () => void;
  bgSeed: string;
  setBgSeed: (seed: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ 
  channel, 
  messages, 
  users = [], 
  onToggleMobileMenu, 
  onToggleMemberList, 
  isDM,
  messageLayout,
  onToggleLayout,
  bgSeed,
  setBgSeed
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showPinned, setShowPinned] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [reactionMenuMsgId, setReactionMenuMsgId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const [messagesState, setMessagesState] = useState<Message[]>(messages);
  const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set());
  const [forwardingContent, setForwardingContent] = useState<string | null>(null);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [polls, setPolls] = useState<Map<string, { question: string; options: { text: string; votes: number }[]; totalVotes: number }>>(new Map());

  const hasForwarding = useFeature('messageForwarding');
  const hasPolls = useFeature('polls');
  const hasThreads = useFeature('threads');
  const hasMessageLinks = useFeature('messageLinks');
  const hasLightbox = useFeature('imageLightbox');
  const hasDeleteConfirm = useFeature('deleteConfirmation');
  const hasJumpToPresent = useFeature('jumpToPresent');
  const hasUnreadDivider = useFeature('unreadDivider');
  const hasAdvancedSearch = useFeature('advancedSearch');
  const hasInbox = useFeature('inbox');
  const hasMentionAutocomplete = useFeature('mentionAutocomplete');

  const [threadMessage, setThreadMessage] = useState<Message | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const UNREAD_AFTER_INDEX = 8;

  const { showMenu } = useContextMenu();

  useEffect(() => {
    setMessagesState(messages);
  }, [messages]);

  const handleContextMenu = (e: React.MouseEvent, msgId: string) => {
    e.preventDefault();
    (e.nativeEvent as any).__customContextHandled = true;

    const msg = messagesState.find(m => m.id === msgId);
    if (!msg) return;

    const isMe = msg.userId === 'me';
    const isMuted = mutedUsers.has(msg.userId);

    const mainItems = [
      { label: 'Reply', icon: <MessageSquare size={13} />, onClick: () => setReplyingTo(msg) },
      { label: msg.pinned ? 'Unpin Message' : 'Pin Message', icon: <Pin size={13} />, onClick: () => togglePin(msg.id) },
      { label: 'Add Reaction', icon: <Smile size={13} />, onClick: () => {} },
    ];
    if (isMe) mainItems.push({ label: 'Edit Message', icon: <Pencil size={13} />, onClick: () => startEdit(msg) });
    if (hasForwarding) mainItems.push({ label: 'Forward Message', icon: <Forward size={13} />, onClick: () => setForwardingContent(msg.content) });
    if (hasThreads) mainItems.push({ label: 'Create Thread', icon: <MessageCircle size={13} />, onClick: () => setThreadMessage(msg) });
    if (hasMessageLinks) mainItems.push({ label: 'Copy Message Link', icon: <Link2 size={13} />, onClick: () => copyMessageLink(msg.id) });

    const moderationItems = [
      { label: isMuted ? 'Unmute User' : 'Mute User', icon: <MicOff size={13} />, onClick: () => toggleMuteUser(msg.userId) },
      { label: 'Delete Message', icon: <Trash2 size={13} />, onClick: () => deleteMessage(msg.id), danger: true },
    ];

    showMenu(e.clientX, e.clientY, [
      { items: mainItems },
      { items: moderationItems },
    ]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val === '/') {
      setShowSlashCommands(true);
    } else {
      setShowSlashCommands(false);
    }
    // Mention autocomplete
    if (hasMentionAutocomplete) {
      const atMatch = val.match(/@(\w*)$/);
      if (atMatch) {
        setMentionQuery(atMatch[1]);
      } else {
        setMentionQuery(null);
      }
    }
  };

  const handleSlashCommand = (cmd: string) => {
    setInputValue(`/${cmd} `);
    setShowSlashCommands(false);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const baseMsg: Partial<Message> = {
      id: `m${Date.now()}`,
      userId: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...(replyingTo ? { replyToId: replyingTo.id } : {}),
    };

    if (inputValue.startsWith('/me ')) {
        const action = inputValue.substring(4);
        setMessagesState(prev => [...prev, { ...baseMsg, content: `_${action}_` } as Message]);
    } else if (inputValue.startsWith('/shrug')) {
        setMessagesState(prev => [...prev, { ...baseMsg, content: `${inputValue.substring(6)} ¯\\_(ツ)_/¯` } as Message]);
    } else {
        setMessagesState(prev => [...prev, { ...baseMsg, content: inputValue } as Message]);
    }
    setInputValue('');
    setReplyingTo(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const newMessage: Message = {
            id: `m${Date.now()}`,
            userId: 'me',
            content: `Uploaded file: ${file.name}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            attachments: ['file']
        };
        setMessagesState(prev => [...prev, newMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
  };

  const toggleMuteUser = (userId: string) => {
    setMutedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const deleteMessage = (msgId: string) => {
    if (hasDeleteConfirm) {
      const msg = messagesState.find(m => m.id === msgId);
      if (msg) setDeleteTarget(msg);
    } else {
      setMessagesState(prev => prev.filter(m => m.id !== msgId));
    }
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      setMessagesState(prev => prev.filter(m => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const copyMessageLink = (msgId: string) => {
    const link = `${window.location.origin}/#/messages/${msgId}`;
    navigator.clipboard.writeText(link).catch(() => {});
  };

  const togglePin = (msgId: string) => {
    setMessagesState(prev => prev.map(m => m.id === msgId ? { ...m, pinned: !m.pinned } : m));
  };

  const startEdit = (msg: Message) => {
    setEditingMsgId(msg.id);
    setEditValue(msg.content);
  };

  const saveEdit = () => {
    if (!editingMsgId || !editValue.trim()) return;
    setMessagesState(prev => prev.map(m => 
      m.id === editingMsgId 
        ? { ...m, content: editValue, editedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } 
        : m
    ));
    setEditingMsgId(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingMsgId(null);
    setEditValue('');
  };

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setIsScrolledUp(false);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, channel, messageLayout, searchQuery, scrollToBottom]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !hasJumpToPresent) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setIsScrolledUp(scrollHeight - scrollTop - clientHeight > 200);
  }, [hasJumpToPresent]);
  

  const getUser = (id: string): User => {
    const found = users.find(u => u.id === id);
    if (found) return found;
    return (users[0] || { 
      id: 'unknown', 
      username: 'Unknown User', 
      avatar: '', 
      status: 'offline' 
    }) as User;
  };

  const handleReactionToggle = (msgId: string, emoji: string) => {
    setMessagesState(prev => prev.map(msg => {
        if (msg.id !== msgId) return msg;
        
        const reactions = msg.reactions || [];
        const existing = reactions.find(r => r.emoji === emoji);
        
        let newReactions;
        if (existing) {
            if (existing.reacted) {
                const newCount = existing.count - 1;
                if (newCount > 0) {
                     newReactions = reactions.map(r => r.emoji === emoji ? { ...r, count: newCount, reacted: false } : r);
                } else {
                     newReactions = reactions.filter(r => r.emoji !== emoji);
                }
            } else {
                newReactions = reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, reacted: true } : r);
            }
        } else {
            newReactions = [...reactions, { emoji, count: 1, reacted: true }];
        }
        
        return { ...msg, reactions: newReactions };
    }));
    setReactionMenuMsgId(null);
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-primary/20 text-white font-bold px-0.5 rounded shadow-[0_0_5px_rgba(19,221,236,0.2)] transition-all duration-300">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const filteredMessages = messagesState.filter(msg => 
    msg.content.toLowerCase().includes(searchQuery.toLowerCase()) && !mutedUsers.has(msg.userId)
  );

  if (!channel) return <div className="flex-1 bg-bg-2 flex items-center justify-center text-white/20 micro-label">Awaiting // Selection</div>;

  return (
    <div className="flex-1 h-full relative z-0 overflow-hidden">
      <div 
        className="absolute inset-0 z-[-1] transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: 'var(--theme-bg-image)' }}
      ></div>
      <div className="absolute inset-0 grid-overlay opacity-30 z-[-1]"></div>
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-[52px] flex items-center justify-between px-3 md:px-6 border-b theme-border glass-realistic z-20">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <button onClick={onToggleMobileMenu} className="md:hidden text-primary/80 hover:text-primary transition-colors p-1" aria-label="Open Menu">
            <Menu size={20} />
          </button>
          
          <div className="text-primary text-glow flex-shrink-0">
             {isDM ? <AtSign size={18} /> : <Hash size={18} />}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold theme-text tracking-wide text-base font-display uppercase truncate max-w-[120px] md:max-w-xs">{channel.name}</span>
            <span className="micro-label theme-text-dim tracking-widest text-[7px] hidden md:block">SECURE // COMMS // ESTABLISHED</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-5">
           {/* Layout Toggle */}
           <div className="relative">
                <button 
                    onClick={() => setShowThemeSettings(!showThemeSettings)} 
                    className={`text-white/40 hover:text-primary transition-colors p-1.5 ${showThemeSettings ? 'text-primary' : ''}`}
                    title="Theme Settings"
                    aria-label="Theme Settings"
                >
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-primary/40 to-accent-purple/40 border border-white/20"></div>
                </button>
                {showThemeSettings && (
                    <div className="absolute top-9 right-0 w-52 bg-bg-0 border border-white/10 rounded-r2 p-3 shadow-2xl z-50 glass-card animate-in fade-in slide-in-from-top-2">
                        <div className="micro-label text-primary mb-2.5 pb-1.5 border-b border-white/5">Visual Matrix</div>
                        <div className="space-y-2.5">
                            <div>
                                <label className="text-[9px] text-white/40 font-mono mb-1 block">SEED KEY</label>
                                <div className="flex gap-1.5">
                                    <input 
                                        type="text" 
                                        value={bgSeed} 
                                        onChange={(e) => setBgSeed(e.target.value)}
                                        className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] font-mono text-white focus:border-primary/50 focus:outline-none"
                                    />
                                    <button 
                                        onClick={() => setBgSeed(Math.random().toString(36).substring(7))}
                                        className="p-1 bg-primary/10 text-primary hover:bg-primary/20 rounded border border-primary/20 transition-colors"
                                        title="Randomize"
                                    >
                                        <LayoutTemplate size={12} className="rotate-45" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
           </div>

           <button 
             onClick={onToggleLayout} 
             className="text-white/40 hover:text-primary transition-colors p-1.5" 
             title={`Change View: ${messageLayout}`}
             aria-label="Change Chat View"
           >
              <LayoutTemplate size={18} />
           </button>

           {/* Member Toggle - Mobile Only */}
           <button onClick={onToggleMemberList} className="md:hidden text-white/40 hover:text-primary transition-colors p-1.5" aria-label="Member List">
               <Users size={18} />
           </button>

          <div className="hidden md:flex items-center gap-4 text-white/40">
             {hasInbox && (
               <button aria-label="Inbox" onClick={() => setShowInbox(!showInbox)} className={`transition-colors relative ${showInbox ? 'text-primary' : 'hover:text-primary'}`}>
                 <Inbox size={16} />
                 <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-accent-danger text-[7px] font-bold flex items-center justify-center text-white shadow-[0_0_6px_rgba(255,42,109,0.35)]">2</span>
               </button>
             )}
             <button aria-label="Notifications" className="hover:text-primary transition-colors"><Bell size={16} /></button>
              <div className="relative">
                 <button aria-label="Pinned Messages" onClick={() => setShowPinned(!showPinned)} className={`transition-colors relative ${showPinned ? 'text-primary' : 'hover:text-primary'}`}>
                   <Pin size={16} />
                   {messagesState.filter(m => m.pinned).length > 0 && (
                     <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-accent-danger text-[7px] font-bold flex items-center justify-center text-white shadow-[0_0_6px_rgba(255,42,109,0.35)]">
                       {messagesState.filter(m => m.pinned).length}
                     </span>
                   )}
                 </button>
              </div>
             <button aria-label="Member List" onClick={onToggleMemberList} className="hover:text-primary transition-colors"><Users size={16} /></button>
             <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="bg-bg-0/50 border border-white/5 rounded-full px-10 py-1.5 text-xs focus:outline-none focus:border-primary/50 focus:w-52 transition-all w-40 font-mono text-white placeholder-white/40"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search messages"
                />
             </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className={`absolute inset-0 overflow-y-auto px-3 md:px-10 pt-20 pb-28 ${
          messageLayout === 'terminal' ? 'space-y-0.5 font-mono' : 
          messageLayout === 'bubbles' ? 'space-y-2.5' : 
          'space-y-6'
        }`} ref={scrollRef} onScroll={handleScroll}>
        
        {messageLayout !== 'terminal' && !searchQuery && (
             <div className="pb-10 border-b border-white/5 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-transparent flex items-center justify-center mb-6 shadow-glow border border-primary/20 relative group">
                    <div className="absolute inset-0 grid-overlay opacity-30"></div>
                    {isDM ? <AtSign size={40} className="text-primary group-hover:scale-110 transition-transform" /> : <Hash size={40} className="text-primary group-hover:scale-110 transition-transform" />}
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-2.5 font-display tracking-tight uppercase">Initiate Hub: {isDM ? '@' : '#'}{channel.name}</h1>
                <p className="micro-label text-white/50 tracking-[0.2em]">OPERATOR // INGRESS POINT // DATA STREAM START</p>
            </div>
        )}

        {filteredMessages.length === 0 && searchQuery && (
             <div className="flex flex-col items-center justify-center h-full text-white/30">
                 <Search size={40} className="mb-3 opacity-50" />
                 <p className="font-mono text-base">NO MATCHES FOUND</p>
             </div>
        )}

        {filteredMessages.map((msg, msgIndex) => {
          {/* Unread divider */}
          const showUnreadDivider = hasUnreadDivider && !searchQuery && msgIndex === UNREAD_AFTER_INDEX;
          const user = getUser(msg.userId);
          const isSpecial = user.role === 'Admin' || user.role === 'Moderator';
          const isMe = msg.userId === 'me';
          const displayContent = searchQuery ? highlightText(msg.content, searchQuery) : renderMarkdown(msg.content);
          const replyMsg = msg.replyToId ? messagesState.find(m => m.id === msg.replyToId) : null;
          const replyUser = replyMsg ? getUser(replyMsg.userId) : null;

          // --- TERMINAL VIEW ---
          if (messageLayout === 'terminal') {
             return (
                 <React.Fragment key={msg.id}>
                  {showUnreadDivider && (
                    <div className="flex items-center gap-3 py-1 -mx-1.5">
                      <div className="flex-1 h-[1px] bg-accent-danger/40"></div>
                      <span className="text-[9px] text-accent-danger font-bold font-mono tracking-widest">NEW</span>
                      <div className="flex-1 h-[1px] bg-accent-danger/40"></div>
                    </div>
                  )}
                 <div 
                    onContextMenu={(e) => handleContextMenu(e, msg.id)}
                    className="flex text-xs hover:bg-white/5 px-1.5 -mx-1.5 py-0.5 rounded font-mono"
                 >
                     <span className="text-white/30 text-[10px] select-none whitespace-nowrap shrink-0 pt-[1px]">{msg.timestamp}&nbsp;</span>
                     <div className="min-w-0">
                       <span className="font-bold whitespace-nowrap" style={{ color: user.color }}>{user.username}</span>
                       <span className="text-white/40">:&nbsp;</span>
                       <span className="text-white/90 break-words">{displayContent}{msg.editedAt && <span className="text-white/20 text-[8px] ml-1">(edited)</span>}</span>
                     </div>
                 </div>
                 </React.Fragment>
             )
          }

          // --- BUBBLES VIEW ---
          if (messageLayout === 'bubbles') {
              return (
                  <React.Fragment key={msg.id}>
                  {showUnreadDivider && (
                    <div className="flex items-center gap-3 py-2">
                      <div className="flex-1 h-[1px] bg-accent-danger/40"></div>
                      <span className="text-[9px] text-accent-danger font-bold font-mono tracking-widest">NEW MESSAGES</span>
                      <div className="flex-1 h-[1px] bg-accent-danger/40"></div>
                    </div>
                  )}
                   <div  
                        onMouseEnter={(e) => { if (!e.buttons) setHoveredMessageId(msg.id); }}
                        onMouseLeave={(e) => { if (!e.buttons) setHoveredMessageId(null); }}
                        onContextMenu={(e) => handleContextMenu(e, msg.id)}
                        className={`flex gap-2.5 w-full group relative ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      {!isMe && (
                        <UserPopup user={user}>
                            <img src={user.avatar} className="w-7 h-7 rounded-full self-end mb-1 cursor-pointer hover:ring-2 hover:ring-primary transition-all shadow-lg" alt={user.username} />
                        </UserPopup>
                      )}
                      
                       <div className={`max-w-[85%] md:max-w-[65%] relative flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          {replyMsg && replyUser && (
                            <div className={`flex items-center gap-1.5 mb-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] ${isMe ? 'self-end' : 'self-start'}`}>
                              <CornerUpRight size={9} className="text-primary/50" />
                              <span className="font-bold text-white/50">{replyUser.username}</span>
                              <span className="text-white/30 truncate max-w-[160px]">{replyMsg.content}</span>
                            </div>
                          )}
                          {!isMe && <div className="ml-1 mb-0.5 text-[9px] font-bold text-white/40 tracking-wider uppercase">{user.username}</div>}
                          
                          <div className={`px-4 py-2.5 text-[13px] leading-relaxed relative shadow-lg group-hover:brightness-110 transition-all
                              ${isMe 
                                  ? 'bg-primary text-bg-0 rounded-2xl rounded-tr-sm shadow-[0_0_15px_rgba(19,221,236,0.15)]' 
                                  : 'bg-white/5 border border-white/10 text-white/90 rounded-2xl rounded-tl-sm backdrop-blur-sm'
                              }`}
                          >
                             {editingMsgId === msg.id ? (
                               <div className="flex flex-col gap-1.5">
                                 <input
                                   type="text"
                                   value={editValue}
                                   onChange={(e) => setEditValue(e.target.value)}
                                   onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                                   className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-primary/50"
                                   autoFocus
                                 />
                                 <div className="flex gap-1.5 text-[9px]">
                                   <button onClick={saveEdit} className="text-primary hover:underline">save</button>
                                   <button onClick={cancelEdit} className="text-white/40 hover:underline">cancel</button>
                                 </div>
                               </div>
                             ) : (
                               <>{displayContent}{msg.editedAt && <span className={`text-[8px] ml-1 ${isMe ? 'text-bg-0/50' : 'text-white/20'}`}>(edited)</span>}</>
                             )}
                             <div className={`text-[8px] text-right mt-1 font-mono transition-opacity duration-300 ${isMe ? 'text-bg-0/70' : 'text-white/30'} ${hoveredMessageId === msg.id ? 'opacity-60' : 'opacity-0'}`}>
                                {msg.timestamp}
                             </div>
                          </div>
                          
                            {msg.reactions && msg.reactions.length > 0 && (
                                <div className={`flex gap-1 mt-1 flex-wrap ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    {msg.reactions.map((r, i) => (
                                        <ReactionChip key={i} {...r} onClick={() => handleReactionToggle(msg.id, r.emoji)} compact />
                                    ))}
                                </div>
                            )}
                      </div>

                       {/* Action Menu for Bubbles */}
                       {hoveredMessageId === msg.id && (
                           <div className={`absolute top-0 ${isMe ? 'left-auto right-[calc(100%+6px)]' : 'left-[calc(100%+6px)]'} glass-panel border border-white/10 rounded-full px-1 py-0.5 flex items-center gap-0.5 shadow-xl animate-in fade-in zoom-in-95 z-10`}>
                               <ActionBtn icon={<Smile size={14} />} label="Add Reaction" onClick={() => setReactionMenuMsgId(msg.id)} />
                                 <ActionBtn icon={<MessageSquare size={14} />} label="Reply" onClick={() => setReplyingTo(msg)} />
                               {isMe && <ActionBtn icon={<Pencil size={14} />} label="Edit Message" onClick={() => startEdit(msg)} />}
                               <ActionBtn icon={<Trash2 size={14} />} label="Delete Message" onClick={() => deleteMessage(msg.id)} />
                               <ActionBtn 
                                 icon={<MicOff size={14} className={mutedUsers.has(msg.userId) ? "text-accent-danger" : ""} />} 
                                 label={mutedUsers.has(msg.userId) ? "Unmute User" : "Mute User"} 
                                 onClick={() => toggleMuteUser(msg.userId)} 
                               />
                               <ActionBtn icon={<MoreHorizontal size={14} />} label="More" />
                               
                               {reactionMenuMsgId === msg.id && (
                                    <div className="absolute top-full left-0 mt-1.5 p-1.5 glass-card rounded-r2 border border-white/10 shadow-2xl z-50 flex gap-0.5 animate-in zoom-in-95 min-w-[160px] flex-wrap justify-center">
                                        {REACTION_EMOJIS.map(emoji => (
                                            <button 
                                                key={emoji}
                                                onClick={() => handleReactionToggle(msg.id, emoji)}
                                                className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-base"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                        <button onClick={() => setReactionMenuMsgId(null)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/40"><X size={12} /></button>
                                    </div>
                                )}
                           </div>
                       )}
                  </div>
                  </React.Fragment>
              )
          }

          // --- MODERN VIEW (Default) ---
          return (
            <React.Fragment key={msg.id}>
            {showUnreadDivider && (
              <div className="flex items-center gap-3 py-2 -mx-2.5">
                <div className="flex-1 h-[1px] bg-accent-danger/40"></div>
                <span className="text-[9px] text-accent-danger font-bold font-mono tracking-widest">NEW MESSAGES</span>
                <div className="flex-1 h-[1px] bg-accent-danger/40"></div>
              </div>
            )}
            <div 
                onMouseEnter={(e) => { if (!e.buttons) setHoveredMessageId(msg.id); }}
                onMouseLeave={(e) => { if (!e.buttons) setHoveredMessageId(null); }}
                onContextMenu={(e) => handleContextMenu(e, msg.id)}
                onDoubleClick={() => { if (isMe) startEdit(msg); }}
                className={`flex gap-5 group relative p-2.5 -mx-2.5 rounded-r1 transition-all hover:bg-white/[0.03] ${isSpecial ? 'bg-gradient-to-r from-primary/5 to-transparent border-l-2 border-primary/20' : ''}`}
            >
              {isSpecial && <div className="absolute left-0 top-2.5 bottom-2.5 w-[2px] bg-primary rounded-full shadow-glow"></div>}

              <UserPopup user={user}>
                 <div className="w-11 h-11 rounded-r2 overflow-hidden cursor-pointer ring-1 ring-white/10 hover:ring-primary transition-all shadow-xl mt-1 relative flex-shrink-0">
                    <img src={user.avatar} className="w-full h-full object-cover" alt={user.username} />
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 </div>
              </UserPopup>
              
              <div className="flex-1 min-w-0">
                {replyMsg && replyUser && (
                  <div className="flex items-center gap-1.5 mb-1.5 pl-1">
                    <div className="w-[2px] h-3.5 bg-primary/30 rounded-full"></div>
                    <img src={replyUser.avatar} className="w-3.5 h-3.5 rounded-full" alt="" />
                    <span className="text-[10px] font-bold text-white/50">{replyUser.username}</span>
                    <span className="text-[10px] text-white/30 truncate max-w-[240px]">{replyMsg.content}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap min-h-[20px]">
                  <UsernameDisplay user={user} />
                  {user.role === 'Bot' && (
                    <span className="bg-primary/20 text-primary text-[7px] px-1.5 py-[2px] rounded-full font-bold micro-label tracking-tight border border-primary/30">Bot</span>
                  )}
                  <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-5px] group-hover:translate-x-0">
                    <span className="px-1.5 py-0.5 rounded-full bg-white/5 border theme-border text-[7px] font-mono theme-text-dim tracking-widest shadow-sm">
                        {msg.timestamp}
                    </span>
                  </span>
                </div>
                {editingMsgId === msg.id ? (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                      className="bg-white/5 border border-white/10 rounded-r1 px-3 py-1.5 text-[13px] text-white font-chat focus:outline-none focus:border-primary/50 w-full"
                      autoFocus
                    />
                    <div className="flex gap-2.5 text-[10px]">
                      <span className="text-white/30">escape to <button onClick={cancelEdit} className="text-primary hover:underline">cancel</button></span>
                      <span className="text-white/30">enter to <button onClick={saveEdit} className="text-primary hover:underline">save</button></span>
                    </div>
                  </div>
                ) : (
                  <div className="theme-text-secondary leading-relaxed font-chat font-light text-[15px] selection:bg-primary/30 selection:text-white tracking-wide break-words select-text cursor-text">
                    {displayContent}
                    {msg.editedAt && <span className="text-white/20 text-[9px] ml-1">(edited)</span>}
                  </div>
                )}
                
                {/* Poll embed */}
                {polls.has(msg.id) && (
                  <PollMessage
                    question={polls.get(msg.id)!.question}
                    options={polls.get(msg.id)!.options}
                    totalVotes={polls.get(msg.id)!.totalVotes}
                    votedIndex={null}
                  />
                )}

                {/* Media Embeds */}
                <MediaEmbed content={msg.content} />
                
                {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                        {msg.reactions.map((r, i) => (
                            <ReactionChip key={i} {...r} onClick={() => handleReactionToggle(msg.id, r.emoji)} />
                        ))}
                    </div>
                )}
              </div>

              {hoveredMessageId === msg.id && (
                  <div className="absolute -top-4 right-6 glass-panel border border-white/10 rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-2xl animate-in fade-in zoom-in-95 z-10">
                      <ActionBtn icon={<Smile size={14} />} label="Add Reaction" onClick={() => setReactionMenuMsgId(msg.id)} />
                      <ActionBtn icon={<MessageSquare size={14} />} label="Reply" onClick={() => setReplyingTo(msg)} />
                      {isMe && <ActionBtn icon={<Pencil size={14} />} label="Edit Message" onClick={() => startEdit(msg)} />}
                      <ActionBtn icon={<Pin size={14} className={msg.pinned ? 'text-primary' : ''} />} label={msg.pinned ? 'Unpin' : 'Pin'} onClick={() => togglePin(msg.id)} />
                      {hasForwarding && <ActionBtn icon={<Forward size={14} />} label="Forward" onClick={() => setForwardingContent(msg.content)} />}
                      {hasThreads && <ActionBtn icon={<MessageCircle size={14} />} label="Thread" onClick={() => setThreadMessage(msg)} />}
                      {hasMessageLinks && <ActionBtn icon={<Link2 size={14} />} label="Copy Link" onClick={() => copyMessageLink(msg.id)} />}
                      <ActionBtn icon={<Trash2 size={14} />} label="Delete Message" onClick={() => deleteMessage(msg.id)} />
                      <ActionBtn 
                        icon={<MicOff size={14} className={mutedUsers.has(msg.userId) ? "text-accent-danger" : ""} />} 
                        label={mutedUsers.has(msg.userId) ? "Unmute User" : "Mute User"} 
                        onClick={() => toggleMuteUser(msg.userId)} 
                      />
                      <ActionBtn icon={<MoreHorizontal size={14} />} label="More Actions" />

                      {reactionMenuMsgId === msg.id && (
                            <div className="absolute bottom-full right-0 mb-1.5 p-1.5 glass-card rounded-r2 border border-white/10 shadow-2xl z-50 flex gap-0.5 animate-in zoom-in-95 min-w-[160px] flex-wrap justify-center">
                                {REACTION_EMOJIS.map(emoji => (
                                    <button 
                                        key={emoji}
                                        onClick={() => handleReactionToggle(msg.id, emoji)}
                                        className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-base"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                                <button onClick={() => setReactionMenuMsgId(null)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/40"><X size={12} /></button>
                            </div>
                        )}
                  </div>
              )}
            </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Pinned Messages Drawer */}
      {showPinned && (
        <>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-30 animate-in fade-in" onClick={() => setShowPinned(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-[288px] max-w-full bg-bg-0 border-l border-white/10 z-40 flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
            <div className="h-[52px] px-5 flex items-center justify-between border-b border-white/5 shrink-0">
              <div>
                <h3 className="font-bold text-white text-xs font-display">PINNED // MESSAGES</h3>
                <span className="micro-label text-white/30 text-[8px]">ARCHIVE // {messagesState.filter(m => m.pinned).length} ENTRIES</span>
              </div>
              <button onClick={() => setShowPinned(false)} className="p-1.5 text-white/40 hover:text-primary transition-colors rounded-full hover:bg-white/5">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 no-scrollbar">
              {messagesState.filter(m => m.pinned).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <Pin size={40} className="text-white/10 mb-3" />
                  <p className="text-white/30 text-xs font-bold mb-1">No Pinned Messages</p>
                  <p className="text-white/15 text-[10px] font-mono">PIN IMPORTANT MESSAGES TO KEEP THEM HERE</p>
                </div>
              ) : (
                messagesState.filter(m => m.pinned).map(m => {
                  const pinnedUser = getUser(m.userId);
                  return (
                    <div key={m.id} className="glass-card rounded-r1 border border-white/8 p-3 group hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <img src={pinnedUser.avatar} className="w-7 h-7 rounded-full border border-white/10" alt={pinnedUser.username} />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold" style={{ color: pinnedUser.color }}>{pinnedUser.username}</span>
                          <span className="text-[9px] text-white/30 font-mono ml-1.5">{m.timestamp}</span>
                        </div>
                        <button 
                          onClick={() => togglePin(m.id)}
                          className="p-1 text-white/20 hover:text-accent-danger hover:bg-accent-danger/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                          aria-label="Unpin"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <div className="text-xs text-white/70 leading-relaxed">{renderMarkdown(m.content)}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}


      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 pt-0 z-10">
        {showSlashCommands && (
            <div className="absolute bottom-20 left-6 w-52 bg-bg-0 border border-white/10 rounded-r2 shadow-2xl z-50 glass-card overflow-hidden animate-in slide-in-from-bottom-2">
                <div className="micro-label text-primary/60 px-3 py-1.5 bg-white/5">COMMANDS</div>
                <div className="p-1.5 space-y-0.5">
                    {['me', 'shrug', 'nick', 'clear'].map(cmd => (
                        <button key={cmd} onClick={() => handleSlashCommand(cmd)} className="w-full text-left px-2.5 py-1.5 hover:bg-white/10 rounded-r1 text-white text-xs font-mono flex items-center gap-1.5">
                            <span className="text-primary">/</span>{cmd}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Typing Indicator */}
        <TypingIndicator users={users} currentUserId="me" />

        {/* Reply Preview Bar */}
        {replyingTo && (
          <div className="glass-card rounded-t-r2 border border-white/10 border-b-0 px-3 py-2.5 flex items-center gap-2.5 animate-in slide-in-from-bottom-2">
            <div className="w-[2px] h-6 bg-primary rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="micro-label text-primary mb-0.5">REPLYING TO // {getUser(replyingTo.userId).username.toUpperCase()}</div>
              <div className="text-[10px] text-white/50 truncate">{replyingTo.content}</div>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-1 text-white/30 hover:text-white hover:bg-white/10 rounded-full transition-colors" aria-label="Cancel reply">
              <X size={14} />
            </button>
          </div>
        )}

        <div className={`glass-realistic ${replyingTo ? 'rounded-b-r2 rounded-t-none' : 'rounded-r2'} flex items-center p-1.5 focus-within:border-primary/50 transition-all shadow-2xl relative overflow-visible group`}>
            <div className="absolute inset-0 grid-overlay opacity-5 group-focus-within:opacity-10 pointer-events-none"></div>

            {/* Mention Autocomplete */}
            {mentionQuery !== null && hasMentionAutocomplete && (
              <MentionAutocomplete
                users={users}
                query={mentionQuery}
                onSelect={(user) => {
                  setInputValue(prev => prev.replace(/@\w*$/, `@${user.username} `));
                  setMentionQuery(null);
                }}
                onClose={() => setMentionQuery(null)}
              />
            )}
            
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="p-3 text-white/30 hover:text-primary transition-colors" aria-label="Add attachment"><PlusCircle size={20} /></button>
            {hasPolls && (
              <button onClick={() => setShowPollCreator(!showPollCreator)} className={`p-2 transition-colors ${showPollCreator ? 'text-primary' : 'text-white/30 hover:text-primary'}`} aria-label="Create Poll">
                <BarChart3 size={18} />
              </button>
            )}
            
            <input 
                type="text" 
                placeholder={`INPUT // ${isDM ? '@' : '#'}${channel.name.toUpperCase()}`} 
                className="flex-1 bg-transparent border-none focus:outline-none text-white px-3 font-mono text-xs placeholder-white/40 focus-ring rounded-r1"
                aria-label="Message Input"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
            />
            <div className="flex items-center gap-2.5 px-1.5">
                <button className="p-2 text-white/40 hover:text-primary transition-all" aria-label="Stickers"><Sticker size={18} /></button>
                <div className="relative">
                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2 transition-all ${showEmojiPicker ? 'text-primary' : 'text-white/40 hover:text-primary'}`} aria-label="Emoji Picker"><Smile size={18} /></button>
                    {showEmojiPicker && (
                      <EmojiPicker
                        onSelect={(emoji) => { setInputValue(prev => prev + emoji); setShowEmojiPicker(false); }}
                        onClose={() => setShowEmojiPicker(false)}
                      />
                    )}
                </div>
                <button onClick={handleSendMessage} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-bg-0 shadow-glow hover:scale-105 transition-all btn-press group-focus-within:shadow-[0_0_20px_#13DDEC]" aria-label="Send Message"><Send size={18} /></button>
            </div>
        </div>
      </div>

      {/* Poll Creator */}
      {showPollCreator && hasPolls && (
        <PollCreator
          onSubmit={(question, options) => {
            const pollId = `poll-${Date.now()}`;
            setPolls(prev => new Map(prev).set(pollId, {
              question,
              options: options.map(o => ({ text: o, votes: 0 })),
              totalVotes: 0,
            }));
            const pollMsg: Message = {
              id: pollId,
              userId: 'me',
              content: `📊 **Poll:** ${question}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessagesState(prev => [...prev, pollMsg]);
            setShowPollCreator(false);
          }}
          onClose={() => setShowPollCreator(false)}
        />
      )}

      {/* Forward Modal */}
      {forwardingContent !== null && hasForwarding && (
        <ForwardMessageModal
          messageContent={forwardingContent}
          onClose={() => setForwardingContent(null)}
        />
      )}

      {/* Jump to Present */}
      {hasJumpToPresent && isScrolledUp && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 glass-card bg-bg-0/80 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 shadow-2xl hover:border-primary/30 transition-all animate-in fade-in slide-in-from-bottom-2 btn-press hover-lift"
        >
          <ArrowDown size={14} className="text-primary" />
          <span className="text-[10px] text-white/60 font-mono font-bold">JUMP TO PRESENT</span>
        </button>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && hasDeleteConfirm && (
        <ConfirmDeleteModal
          messageContent={deleteTarget.content}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Thread Panel */}
      {threadMessage && hasThreads && (
        <ThreadPanel
          parentMessage={threadMessage}
          parentUser={getUser(threadMessage.userId)}
          allUsers={users}
          onClose={() => setThreadMessage(null)}
        />
      )}

      {/* Media Lightbox */}
      {lightboxSrc && hasLightbox && (
        <MediaLightbox
          src={lightboxSrc}
          onClose={() => setLightboxSrc(null)}
        />
      )}

      {/* Search Panel */}
      {showSearchPanel && hasAdvancedSearch && (
        <SearchPanel onClose={() => setShowSearchPanel(false)} />
      )}

      {/* Inbox Panel */}
      {showInbox && hasInbox && (
        <InboxPanel onClose={() => setShowInbox(false)} />
      )}
    </div>
  );
};
