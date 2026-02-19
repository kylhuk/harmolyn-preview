
import React, { useRef, useEffect, useState } from 'react';
import { Channel, Message, User, MessageLayout } from '@/types';
import { generateTheme } from '@/utils/themeGenerator';
import { Hash, Bell, Pin, Users, Search, MoreHorizontal, MessageSquare, AtSign, Smile, Sticker, PlusCircle, X, Send, LayoutTemplate, Menu, Trash2, MicOff, Image, FileText } from 'lucide-react';

// Action button sub-component for message interactions
const ActionBtn = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="p-2 text-white/40 hover:text-primary hover:bg-white/5 rounded-full transition-all focus:outline-none focus:ring-1 focus:ring-primary/50"
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
        ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'} 
        rounded-full border flex items-center gap-1.5 transition-all cursor-pointer select-none group
        ${reacted 
          ? 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_10px_rgba(19,221,236,0.15)] hover:bg-primary/20 hover:border-primary/50' 
          : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:bg-white/10 hover:text-white/70'
        }
      `}
  >
      <span className={compact ? 'text-[11px]' : 'text-sm'}>{emoji}</span>
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
    <span className={`font-bold ${compact ? 'text-sm' : 'text-[16px]'} tracking-tight cursor-pointer transition-all duration-300 relative px-1 -mx-1 rounded-md inline-flex items-center gap-2`}>
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
        <div className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`} title={user.status}></div>
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
    return (
        <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            {children}
            {open && (
                <div className="absolute top-0 left-16 w-72 bg-bg-0 border border-white/10 rounded-r2 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[100] glass-card overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="h-20 bg-gradient-to-r from-primary/30 to-accent-purple/30 relative">
                        <div className="absolute inset-0 grid-overlay opacity-20"></div>
                    </div>
                    <div className="px-6 pb-6 -mt-10">
                        <div className="relative inline-block">
                            <img src={user.avatar} className="w-20 h-20 rounded-r2 border-4 border-bg-0 shadow-xl mb-4 ring-1 ring-white/10" alt={user.username} />
                            <div className={`absolute bottom-4 -right-2 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider text-bg-0 border-2 border-bg-0 ${
                                user.status === 'online' ? 'bg-accent-success' : 
                                user.status === 'idle' ? 'bg-accent-warning' : 
                                user.status === 'dnd' ? 'bg-accent-danger' : 'bg-white/40'
                            }`}>
                                {user.status}
                            </div>
                        </div>
                        <h3 className="font-bold text-2xl text-white font-display mb-1">{user.username}</h3>
                        <p className="micro-label text-primary/60 tracking-widest mb-4">OP // {user.id.toUpperCase()}</p>
                        <div className="bg-white/5 rounded-r1 p-4 border border-white/5 mb-4">
                            <div className="micro-label text-white/40 mb-2">BIO // DECRYPTED</div>
                            <p className="text-xs text-white/80 italic leading-relaxed">{user.bio}</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex-1 bg-primary text-bg-0 font-bold py-2.5 rounded-full micro-label tracking-tight hover:shadow-glow transition-all">Direct Link</button>
                            <button className="px-3 bg-white/5 text-white/60 rounded-full hover:bg-white/10 transition-colors border border-white/5" aria-label="More options"><MoreHorizontal size={18} /></button>
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

  const [messagesState, setMessagesState] = useState<Message[]>(messages);
  const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, msgId: string } | null>(null);

  useEffect(() => {
    setMessagesState(messages);
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, msgId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, msgId });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val === '/') {
      setShowSlashCommands(true);
    } else {
      setShowSlashCommands(false);
    }
  };

  const handleSlashCommand = (cmd: string) => {
    setInputValue(`/${cmd} `);
    setShowSlashCommands(false);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    if (inputValue.startsWith('/me ')) {
        const action = inputValue.substring(4);
        const newMessage: Message = {
            id: `m${Date.now()}`,
            userId: 'me',
            content: `_${action}_`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessagesState(prev => [...prev, newMessage]);
    } else if (inputValue.startsWith('/shrug')) {
         const newMessage: Message = {
            id: `m${Date.now()}`,
            userId: 'me',
            content: `${inputValue.substring(6)} ¯\\_(ツ)_/¯`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessagesState(prev => [...prev, newMessage]);
    } else {
        const newMessage: Message = {
            id: `m${Date.now()}`,
            userId: 'me',
            content: inputValue,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessagesState(prev => [...prev, newMessage]);
    }
    setInputValue('');
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
    setMessagesState(prev => prev.filter(m => m.id !== msgId));
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, channel, messageLayout, searchQuery]);

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
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-4 md:px-8 border-b theme-border glass-realistic z-20">
        <div className="flex items-center gap-3 overflow-hidden">
          <button onClick={onToggleMobileMenu} className="md:hidden text-primary/80 hover:text-primary transition-colors p-1" aria-label="Open Menu">
            <Menu size={24} />
          </button>
          
          <div className="text-primary text-glow flex-shrink-0">
             {isDM ? <AtSign size={20} /> : <Hash size={20} />}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold theme-text tracking-wide text-lg font-display uppercase truncate max-w-[150px] md:max-w-xs">{channel.name}</span>
            <span className="micro-label theme-text-dim tracking-widest text-[8px] hidden md:block">SECURE // COMMS // ESTABLISHED</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
           {/* Layout Toggle */}
           <div className="relative">
                <button 
                    onClick={() => setShowThemeSettings(!showThemeSettings)} 
                    className={`text-white/40 hover:text-primary transition-colors p-2 ${showThemeSettings ? 'text-primary' : ''}`}
                    title="Theme Settings"
                    aria-label="Theme Settings"
                >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary/40 to-accent-purple/40 border border-white/20"></div>
                </button>
                {showThemeSettings && (
                    <div className="absolute top-10 right-0 w-64 bg-bg-0 border border-white/10 rounded-r2 p-4 shadow-2xl z-50 glass-card animate-in fade-in slide-in-from-top-2">
                        <div className="micro-label text-primary mb-3 pb-2 border-b border-white/5">Visual Matrix</div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] text-white/40 font-mono mb-1 block">SEED KEY</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={bgSeed} 
                                        onChange={(e) => setBgSeed(e.target.value)}
                                        className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs font-mono text-white focus:border-primary/50 focus:outline-none"
                                    />
                                    <button 
                                        onClick={() => setBgSeed(Math.random().toString(36).substring(7))}
                                        className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded border border-primary/20 transition-colors"
                                        title="Randomize"
                                    >
                                        <LayoutTemplate size={14} className="rotate-45" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
           </div>

           <button 
             onClick={onToggleLayout} 
             className="text-white/40 hover:text-primary transition-colors p-2" 
             title={`Change View: ${messageLayout}`}
             aria-label="Change Chat View"
           >
              <LayoutTemplate size={20} />
           </button>

           {/* Member Toggle - Mobile Only */}
           <button onClick={onToggleMemberList} className="md:hidden text-white/40 hover:text-primary transition-colors p-2" aria-label="Member List">
               <Users size={20} />
           </button>

          <div className="hidden md:flex items-center gap-5 text-white/40">
             <button aria-label="Notifications" className="hover:text-primary transition-colors"><Bell size={18} /></button>
             <div className="relative">
                 <button aria-label="Pinned Messages" onClick={() => setShowPinned(!showPinned)} className={`transition-colors ${showPinned ? 'text-primary' : 'hover:text-primary'}`}><Pin size={18} /></button>
                 {showPinned && (
                     <div className="absolute top-10 right-0 w-80 bg-bg-0 border border-white/10 rounded-r2 p-6 shadow-2xl z-50 glass-card animate-in fade-in slide-in-from-top-2">
                        <div className="micro-label text-primary mb-4 pb-2 border-b border-white/5">Pinned Nests</div>
                        <div className="space-y-4 max-h-64 overflow-y-auto no-scrollbar">
                            {messagesState.filter(m => m.pinned).map(m => (
                                <div key={m.id} className="p-4 bg-white/5 rounded-r1 border border-white/5">
                                    <div className="micro-label text-primary/60 mb-2">{getUser(m.userId).username}</div>
                                    <div className="text-sm text-white/80 italic leading-relaxed">"{m.content}"</div>
                                </div>
                            ))}
                        </div>
                     </div>
                 )}
             </div>
             <button aria-label="Member List" onClick={onToggleMemberList} className="hover:text-primary transition-colors"><Users size={18} /></button>
             <div className="relative group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="bg-bg-0/50 border border-white/5 rounded-full px-12 py-2 text-sm focus:outline-none focus:border-primary/50 focus:w-64 transition-all w-48 font-mono text-white placeholder-white/40"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search messages"
                />
             </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className={`absolute inset-0 overflow-y-auto px-4 md:px-12 pt-24 pb-32 ${
          messageLayout === 'terminal' ? 'space-y-1 font-mono' : 
          messageLayout === 'bubbles' ? 'space-y-3' : 
          'space-y-8'
        }`} ref={scrollRef}>
        
        {messageLayout !== 'terminal' && !searchQuery && (
             <div className="pb-12 border-b border-white/5 mb-8">
                <div className="w-24 h-24 rounded-r3 bg-gradient-to-br from-primary/30 to-transparent flex items-center justify-center mb-8 shadow-glow border border-primary/20 relative group">
                    <div className="absolute inset-0 grid-overlay opacity-30"></div>
                    {isDM ? <AtSign size={48} className="text-primary group-hover:scale-110 transition-transform" /> : <Hash size={48} className="text-primary group-hover:scale-110 transition-transform" />}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 font-display tracking-tight uppercase">Initiate Hub: {isDM ? '@' : '#'}{channel.name}</h1>
                <p className="micro-label text-white/50 tracking-[0.2em]">OPERATOR // INGRESS POINT // DATA STREAM START</p>
            </div>
        )}

        {filteredMessages.length === 0 && searchQuery && (
             <div className="flex flex-col items-center justify-center h-full text-white/30">
                 <Search size={48} className="mb-4 opacity-50" />
                 <p className="font-mono text-lg">NO MATCHES FOUND</p>
             </div>
        )}

        {filteredMessages.map((msg) => {
          const user = getUser(msg.userId);
          const isSpecial = user.role === 'Admin' || user.role === 'Moderator';
          const isMe = msg.userId === 'me';
          const displayContent = highlightText(msg.content, searchQuery);

          // --- TERMINAL VIEW ---
          if (messageLayout === 'terminal') {
             return (
                 <div 
                    key={msg.id}
                    onContextMenu={(e) => handleContextMenu(e, msg.id)}
                    className="flex items-baseline gap-2 text-sm hover:bg-white/5 px-2 -mx-2 py-0.5 rounded"
                 >
                     <span className="text-white/40 text-[10px] font-mono select-none">[{msg.timestamp}]</span>
                     <span className="font-bold whitespace-nowrap" style={{ color: user.color }}>&lt;{user.username}&gt;</span>
                     <span className="text-white/90 break-words">{displayContent}</span>
                 </div>
             )
          }

          // --- BUBBLES VIEW ---
          if (messageLayout === 'bubbles') {
              return (
                  <div key={msg.id} 
                       onMouseEnter={() => setHoveredMessageId(msg.id)}
                       onMouseLeave={() => setHoveredMessageId(null)}
                       onContextMenu={(e) => handleContextMenu(e, msg.id)}
                       className={`flex gap-3 w-full group relative ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      {!isMe && (
                        <UserPopup user={user}>
                            <img src={user.avatar} className="w-8 h-8 rounded-full self-end mb-1 cursor-pointer hover:ring-2 hover:ring-primary transition-all shadow-lg" alt={user.username} />
                        </UserPopup>
                      )}
                      
                      <div className={`max-w-[85%] md:max-w-[65%] relative flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          {!isMe && <div className="ml-1 mb-1 text-[10px] font-bold text-white/40 tracking-wider uppercase">{user.username}</div>}
                          
                          <div className={`px-5 py-3 text-[15px] leading-relaxed relative shadow-lg group-hover:brightness-110 transition-all
                              ${isMe 
                                  ? 'bg-primary text-bg-0 rounded-2xl rounded-tr-sm shadow-[0_0_15px_rgba(19,221,236,0.15)]' 
                                  : 'bg-white/5 border border-white/10 text-white/90 rounded-2xl rounded-tl-sm backdrop-blur-sm'
                              }`}
                          >
                             {displayContent}
                             <div className={`text-[9px] text-right mt-1.5 font-mono transition-opacity duration-300 ${isMe ? 'text-bg-0/70' : 'text-white/30'} ${hoveredMessageId === msg.id ? 'opacity-60' : 'opacity-0'}`}>
                                {msg.timestamp}
                             </div>
                          </div>
                          
                            {msg.reactions && msg.reactions.length > 0 && (
                                <div className={`flex gap-1.5 mt-1.5 flex-wrap ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    {msg.reactions.map((r, i) => (
                                        <ReactionChip key={i} {...r} onClick={() => handleReactionToggle(msg.id, r.emoji)} compact />
                                    ))}
                                </div>
                            )}
                      </div>

                       {/* Action Menu for Bubbles */}
                       {hoveredMessageId === msg.id && (
                           <div className={`absolute top-0 ${isMe ? 'left-auto right-[calc(100%+8px)]' : 'left-[calc(100%+8px)]'} glass-panel border border-white/10 rounded-full px-1.5 py-1 flex items-center gap-1 shadow-xl animate-in fade-in zoom-in-95 z-10`}>
                               <ActionBtn icon={<Smile size={16} />} label="Add Reaction" onClick={() => setReactionMenuMsgId(msg.id)} />
                               <ActionBtn icon={<MessageSquare size={16} />} label="Reply" />
                               <ActionBtn icon={<Trash2 size={16} />} label="Delete Message" onClick={() => deleteMessage(msg.id)} />
                               <ActionBtn 
                                 icon={<MicOff size={16} className={mutedUsers.has(msg.userId) ? "text-accent-danger" : ""} />} 
                                 label={mutedUsers.has(msg.userId) ? "Unmute User" : "Mute User"} 
                                 onClick={() => toggleMuteUser(msg.userId)} 
                               />
                               <ActionBtn icon={<MoreHorizontal size={16} />} label="More" />
                               
                               {reactionMenuMsgId === msg.id && (
                                    <div className="absolute top-full left-0 mt-2 p-2 glass-card rounded-r2 border border-white/10 shadow-2xl z-50 flex gap-1 animate-in zoom-in-95 min-w-[200px] flex-wrap justify-center">
                                        {REACTION_EMOJIS.map(emoji => (
                                            <button 
                                                key={emoji}
                                                onClick={() => handleReactionToggle(msg.id, emoji)}
                                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-lg"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                        <button onClick={() => setReactionMenuMsgId(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40"><X size={14} /></button>
                                    </div>
                                )}
                           </div>
                       )}
                  </div>
              )
          }

          // --- MODERN VIEW (Default) ---
          return (
            <div 
                key={msg.id} 
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
                onContextMenu={(e) => handleContextMenu(e, msg.id)}
                className={`flex gap-6 group relative p-3 -mx-3 rounded-r1 transition-all hover:bg-white/[0.03] ${isSpecial ? 'bg-gradient-to-r from-primary/5 to-transparent border-l-2 border-primary/20' : ''}`}
            >
              {isSpecial && <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-primary rounded-full shadow-glow"></div>}

              <UserPopup user={user}>
                 <div className="w-14 h-14 rounded-r2 overflow-hidden cursor-pointer ring-1 ring-white/10 hover:ring-primary transition-all shadow-xl mt-1 relative flex-shrink-0">
                    <img src={user.avatar} className="w-full h-full object-cover" alt={user.username} />
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 </div>
              </UserPopup>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap min-h-[24px]">
                  <UsernameDisplay user={user} />
                  {user.role === 'Bot' && (
                    <span className="bg-primary/20 text-primary text-[8px] px-2 py-[2px] rounded-full font-bold micro-label tracking-tight border border-primary/30">Bot</span>
                  )}
                  <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-5px] group-hover:translate-x-0">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border theme-border text-[8px] font-mono theme-text-dim tracking-widest shadow-sm">
                        {msg.timestamp}
                    </span>
                  </span>
                </div>
                <div className="theme-text-secondary leading-relaxed font-chat font-light text-[18px] selection:bg-primary selection:text-bg-0 tracking-wide break-words">{displayContent}</div>
                
                {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex gap-2 mt-4 flex-wrap">
                        {msg.reactions.map((r, i) => (
                            <ReactionChip key={i} {...r} onClick={() => handleReactionToggle(msg.id, r.emoji)} />
                        ))}
                    </div>
                )}
              </div>

              {hoveredMessageId === msg.id && (
                  <div className="absolute -top-5 right-8 glass-panel border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 z-10">
                      <ActionBtn icon={<Smile size={16} />} label="Add Reaction" onClick={() => setReactionMenuMsgId(msg.id)} />
                      <ActionBtn icon={<MessageSquare size={16} />} label="Reply" />
                      <ActionBtn icon={<Pin size={16} />} label="Pin Message" />
                      <ActionBtn icon={<Trash2 size={16} />} label="Delete Message" onClick={() => deleteMessage(msg.id)} />
                      <ActionBtn 
                        icon={<MicOff size={16} className={mutedUsers.has(msg.userId) ? "text-accent-danger" : ""} />} 
                        label={mutedUsers.has(msg.userId) ? "Unmute User" : "Mute User"} 
                        onClick={() => toggleMuteUser(msg.userId)} 
                      />
                      <ActionBtn icon={<MoreHorizontal size={16} />} label="More Actions" />

                      {reactionMenuMsgId === msg.id && (
                            <div className="absolute bottom-full right-0 mb-2 p-2 glass-card rounded-r2 border border-white/10 shadow-2xl z-50 flex gap-1 animate-in zoom-in-95 min-w-[200px] flex-wrap justify-center">
                                {REACTION_EMOJIS.map(emoji => (
                                    <button 
                                        key={emoji}
                                        onClick={() => handleReactionToggle(msg.id, emoji)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-lg"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                                <button onClick={() => setReactionMenuMsgId(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40"><X size={14} /></button>
                            </div>
                        )}
                  </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
            className="fixed z-[100] w-56 bg-bg-0 border border-white/10 rounded-r2 shadow-2xl glass-card overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            style={{ top: contextMenu.y, left: contextMenu.x }}
        >
            <div className="p-1 space-y-0.5">
                <button className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-r1 text-white text-sm flex items-center gap-2 transition-colors">
                    <MessageSquare size={14} className="text-white/40" /> Reply
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-r1 text-white text-sm flex items-center gap-2 transition-colors">
                    <Pin size={14} className="text-white/40" /> Pin Message
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-r1 text-white text-sm flex items-center gap-2 transition-colors">
                    <Smile size={14} className="text-white/40" /> Add Reaction
                </button>
                <div className="h-[1px] bg-white/5 my-1"></div>
                <button 
                    onClick={() => {
                        const msg = messagesState.find(m => m.id === contextMenu.msgId);
                        if (msg) toggleMuteUser(msg.userId);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-r1 text-white text-sm flex items-center gap-2 transition-colors"
                >
                    <MicOff size={14} className="text-white/40" /> 
                    {messagesState.find(m => m.id === contextMenu.msgId) && mutedUsers.has(messagesState.find(m => m.id === contextMenu.msgId)!.userId) ? 'Unmute User' : 'Mute User'}
                </button>
                <button 
                    onClick={() => deleteMessage(contextMenu.msgId)}
                    className="w-full text-left px-3 py-2 hover:bg-accent-danger/20 rounded-r1 text-accent-danger text-sm flex items-center gap-2 transition-colors"
                >
                    <Trash2 size={14} /> Delete Message
                </button>
            </div>
        </div>
      )}

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 pt-0 z-10">
        {showSlashCommands && (
            <div className="absolute bottom-24 left-8 w-64 bg-bg-0 border border-white/10 rounded-r2 shadow-2xl z-50 glass-card overflow-hidden animate-in slide-in-from-bottom-2">
                <div className="micro-label text-primary/60 px-4 py-2 bg-white/5">COMMANDS</div>
                <div className="p-2 space-y-1">
                    {['me', 'shrug', 'nick', 'clear'].map(cmd => (
                        <button key={cmd} onClick={() => handleSlashCommand(cmd)} className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-r1 text-white text-sm font-mono flex items-center gap-2">
                            <span className="text-primary">/</span>{cmd}
                        </button>
                    ))}
                </div>
            </div>
        )}

        <div className="glass-realistic rounded-r2 flex items-center p-2 focus-within:border-primary/50 transition-all shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 grid-overlay opacity-5 group-focus-within:opacity-10 pointer-events-none"></div>
            
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="p-4 text-white/30 hover:text-primary transition-colors" aria-label="Add attachment"><PlusCircle size={24} /></button>
            
            <input 
                type="text" 
                placeholder={`INPUT // ${isDM ? '@' : '#'}${channel.name.toUpperCase()}`} 
                className="flex-1 bg-transparent border-none focus:outline-none text-white px-4 font-mono text-sm placeholder-white/40"
                aria-label="Message Input"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
            />
            <div className="flex items-center gap-3 px-2">
                <button className="p-2.5 text-white/40 hover:text-primary transition-all" aria-label="Stickers"><Sticker size={22} /></button>
                <div className="relative">
                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2.5 transition-all ${showEmojiPicker ? 'text-primary' : 'text-white/40 hover:text-primary'}`} aria-label="Emoji Picker"><Smile size={22} /></button>
                    {showEmojiPicker && <div className="absolute bottom-16 right-0 w-72 h-80 bg-bg-0 border border-white/10 rounded-r2 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 glass-card grid grid-cols-6 gap-3 overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-2 z-50">
                        {['🔥','✨','🚀','💀','🤖','👽','👾','🧠','💎','🛡️','⚡','🔋','✔️','🌈','🦾','🕹️','💻','📡','🛰️','🪐','🌓','🌀','🧬','🔬','🔑','⚙️','💣'].map(e => <button key={e} onClick={() => { setInputValue(prev => prev + e); setShowEmojiPicker(false); }} className="text-2xl cursor-pointer hover:scale-125 transition-transform p-1 text-center focus:outline-none">{e}</button>)}
                    </div>}
                </div>
                <button onClick={handleSendMessage} className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-bg-0 shadow-glow hover:scale-105 transition-all group-focus-within:shadow-[0_0_20px_#13DDEC]" aria-label="Send Message"><Send size={20} /></button>
            </div>
        </div>
      </div>
    </div>
  );
};
