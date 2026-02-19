
import React, { useState } from 'react';
import { Megaphone, Bell, BellOff, ExternalLink, ThumbsUp, MessageCircle, Pin, Check } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: { name: string; avatar: string; role: string };
  timestamp: string;
  pinned: boolean;
  reactions: number;
  comments: number;
  published: boolean;
}

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'Network Upgrade v4.2',
    content: 'All nodes will be upgraded to the new mesh protocol. Expect 10 minutes of downtime during migration. Backup your encryption keys before the update window opens.',
    author: { name: 'Cipher_Punk', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop', role: 'Admin' },
    timestamp: '2 hours ago',
    pinned: true,
    reactions: 24,
    comments: 8,
    published: true,
  },
  {
    id: 'a2',
    title: 'New Community Guidelines',
    content: 'Updated guidelines for all operators. Please review the changes to section 4.7 regarding encrypted communications and data handling protocols.',
    author: { name: 'Glitch.exe', avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop', role: 'Moderator' },
    timestamp: '1 day ago',
    pinned: false,
    reactions: 15,
    comments: 3,
    published: true,
  },
  {
    id: 'a3',
    title: 'Scheduled Maintenance Window',
    content: 'Routine maintenance scheduled for Saturday 03:00 UTC. Voice nodes will be cycled. Text channels remain operational.',
    author: { name: 'Cipher_Punk', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop', role: 'Admin' },
    timestamp: '3 days ago',
    pinned: false,
    reactions: 9,
    comments: 1,
    published: false,
  },
];

interface AnnouncementChannelProps {
  channelName: string;
}

export const AnnouncementChannel: React.FC<AnnouncementChannelProps> = ({ channelName }) => {
  const [following, setFollowing] = useState(true);
  const [announcements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 glass-realistic flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Megaphone size={18} className="text-primary" />
          <div>
            <h2 className="font-bold text-white font-display text-base uppercase tracking-wide">{channelName}</h2>
            <span className="micro-label text-white/40 tracking-widest">BROADCAST // CHANNEL</span>
          </div>
        </div>
        <button
          onClick={() => setFollowing(!following)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
            following
              ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
              : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
          }`}
        >
          {following ? <Bell size={12} /> : <BellOff size={12} />}
          {following ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* Announcements */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 no-scrollbar">
        {announcements.map(ann => (
          <div
            key={ann.id}
            className={`glass-card rounded-r2 border overflow-hidden transition-all ${
              ann.pinned ? 'border-primary/20' : 'border-white/5'
            }`}
          >
            {ann.pinned && (
              <div className="px-4 py-1.5 bg-primary/5 border-b border-primary/10 flex items-center gap-1.5">
                <Pin size={9} className="text-primary" />
                <span className="text-[9px] font-bold text-primary tracking-wider">PINNED</span>
              </div>
            )}
            <div className="p-5">
              {/* Author */}
              <div className="flex items-center gap-2.5 mb-3">
                <img src={ann.author.avatar} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                <div>
                  <span className="text-xs font-bold text-white">{ann.author.name}</span>
                  <span className="micro-label text-white/30 ml-2">{ann.author.role}</span>
                </div>
                <span className="text-[9px] font-mono text-white/25 ml-auto">{ann.timestamp}</span>
              </div>

              {/* Content */}
              <h3 className="text-sm font-bold text-white mb-2">{ann.title}</h3>
              <p className="text-xs text-white/60 leading-relaxed mb-4">{ann.content}</p>

              {/* Footer */}
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 text-white/30 hover:text-primary transition-colors">
                  <ThumbsUp size={12} />
                  <span className="text-[10px] font-mono">{ann.reactions}</span>
                </button>
                <button className="flex items-center gap-1.5 text-white/30 hover:text-primary transition-colors">
                  <MessageCircle size={12} />
                  <span className="text-[10px] font-mono">{ann.comments}</span>
                </button>
                {ann.published && (
                  <div className="flex items-center gap-1.5 text-accent-success/60 ml-auto">
                    <Check size={10} />
                    <span className="text-[9px] font-bold tracking-wider">PUBLISHED</span>
                  </div>
                )}
                {!ann.published && (
                  <button className="flex items-center gap-1.5 text-primary/60 hover:text-primary transition-colors ml-auto">
                    <ExternalLink size={10} />
                    <span className="text-[9px] font-bold tracking-wider">PUBLISH</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
