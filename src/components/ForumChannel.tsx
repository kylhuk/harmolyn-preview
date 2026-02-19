import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Eye, Clock, Tag, ArrowUp, ArrowDown, Plus, Pin, Search } from 'lucide-react';
import { USERS } from '@/data';

interface ForumPostData {
  id: string;
  title: string;
  authorId: string;
  content: string;
  tags: string[];
  timestamp: string;
  replies: number;
  views: number;
  upvotes: number;
  pinned?: boolean;
  solved?: boolean;
}

const MOCK_POSTS: ForumPostData[] = [
  { id: 'fp1', title: 'How to set up E2E encryption for DMs?', authorId: 'u2', content: 'Looking for the best approach to implement end-to-end encryption...', tags: ['encryption', 'help'], timestamp: '2 hours ago', replies: 12, views: 234, upvotes: 18, pinned: true },
  { id: 'fp2', title: 'RFC: New P2P relay protocol proposal', authorId: 'u3', content: 'I\'ve been working on an improved relay protocol that reduces latency by 40%...', tags: ['rfc', 'protocol'], timestamp: '5 hours ago', replies: 31, views: 567, upvotes: 42, solved: true },
  { id: 'fp3', title: 'Bug: Voice channel drops after 30 minutes', authorId: 'u4', content: 'Consistently losing voice connection after exactly 30 minutes...', tags: ['bug', 'voice'], timestamp: '1 day ago', replies: 8, views: 156, upvotes: 7 },
  { id: 'fp4', title: 'Show off your custom themes!', authorId: 'u5', content: 'Share your custom theme configurations here...', tags: ['showcase', 'themes'], timestamp: '2 days ago', replies: 45, views: 1203, upvotes: 89 },
  { id: 'fp5', title: 'Federated server linking - feasibility?', authorId: 'u6', content: 'Is it possible to link servers across different Harmolyn instances?', tags: ['discussion', 'federation'], timestamp: '3 days ago', replies: 19, views: 412, upvotes: 25 },
];

const TAG_COLORS: Record<string, string> = {
  encryption: 'bg-primary/15 text-primary border-primary/30',
  help: 'bg-accent-warning/15 text-accent-warning border-accent-warning/30',
  rfc: 'bg-accent-purple/15 text-accent-purple border-accent-purple/30',
  protocol: 'bg-primary/15 text-primary border-primary/30',
  bug: 'bg-accent-danger/15 text-accent-danger border-accent-danger/30',
  voice: 'bg-accent-warning/15 text-accent-warning border-accent-warning/30',
  showcase: 'bg-accent-success/15 text-accent-success border-accent-success/30',
  themes: 'bg-accent-purple/15 text-accent-purple border-accent-purple/30',
  discussion: 'bg-primary/15 text-primary border-primary/30',
  federation: 'bg-accent-warning/15 text-accent-warning border-accent-warning/30',
};

type SortMode = 'latest' | 'hot' | 'top';

export const ForumChannel: React.FC = () => {
  const [sortMode, setSortMode] = useState<SortMode>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = [...new Set(MOCK_POSTS.flatMap(p => p.tags))];

  const filteredPosts = MOCK_POSTS
    .filter(p => !selectedTag || p.tags.includes(selectedTag))
    .filter(p => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (sortMode === 'hot') return b.replies - a.replies;
      if (sortMode === 'top') return b.upvotes - a.upvotes;
      return 0; // latest = default order
    });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 space-y-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-title font-semibold text-text-primary flex items-center gap-2">
            <MessageSquare size={18} className="text-primary" />
            FORUM // CHANNEL
          </h2>
          <button className="h-10 px-4 rounded-full bg-primary text-bg-0 font-bold text-xs flex items-center gap-2 hover:shadow-glow transition-all">
            <Plus size={14} />
            New Post
          </button>
        </div>

        {/* Search + Sort */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full h-10 pl-9 pr-4 rounded-full bg-surface-dark border border-stroke-subtle text-text-primary text-body placeholder:text-text-disabled focus:border-stroke-primary focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-1 bg-glass-overlay rounded-full border border-stroke-subtle p-0.5">
            {(['latest', 'hot', 'top'] as SortMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setSortMode(mode)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  sortMode === mode ? 'bg-primary text-bg-0' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all flex-shrink-0 ${
              !selectedTag ? 'bg-primary/15 text-primary border-primary/30' : 'text-text-secondary border-stroke-subtle hover:bg-white/5'
            }`}
          >
            ALL
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all flex-shrink-0 ${
                selectedTag === tag ? (TAG_COLORS[tag] || 'bg-primary/15 text-primary border-primary/30') : 'text-text-secondary border-stroke-subtle hover:bg-white/5'
              }`}
            >
              {tag.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredPosts.map(post => {
          const author = USERS.find(u => u.id === post.authorId);
          return (
            <div key={post.id} className="glass-card rounded-r2 p-4 border border-stroke hover:border-stroke-strong transition-all cursor-pointer group">
              <div className="flex items-start gap-3">
                {/* Upvote */}
                <div className="flex flex-col items-center gap-0.5 pt-1 flex-shrink-0">
                  <button className="text-text-tertiary hover:text-primary transition-colors"><ArrowUp size={14} /></button>
                  <span className="text-xs font-bold text-text-secondary font-mono">{post.upvotes}</span>
                  <button className="text-text-tertiary hover:text-accent-danger transition-colors"><ArrowDown size={14} /></button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {post.pinned && <Pin size={10} className="text-accent-warning" />}
                    {post.solved && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-accent-success/15 text-accent-success border border-accent-success/20">SOLVED</span>}
                  </div>

                  <h3 className="text-body-strong text-text-primary group-hover:text-primary transition-colors mb-1.5 leading-snug">{post.title}</h3>
                  <p className="text-caption text-text-secondary line-clamp-1 mb-2">{post.content}</p>

                  <div className="flex items-center gap-3 flex-wrap">
                    {post.tags.map(tag => (
                      <span key={tag} className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${TAG_COLORS[tag] || 'bg-white/5 text-text-secondary border-stroke-subtle'}`}>
                        {tag}
                      </span>
                    ))}
                    <div className="flex items-center gap-3 text-text-disabled text-[10px] ml-auto">
                      {author && (
                        <span className="flex items-center gap-1">
                          <img src={author.avatar} className="w-3.5 h-3.5 rounded-full" alt="" />
                          {author.username}
                        </span>
                      )}
                      <span>{post.timestamp}</span>
                      <span className="flex items-center gap-0.5"><MessageSquare size={9} /> {post.replies}</span>
                      <span className="flex items-center gap-0.5"><Eye size={9} /> {post.views}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
