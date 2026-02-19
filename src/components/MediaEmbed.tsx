
import React, { useState } from 'react';
import { ExternalLink, Play, X, Image as ImageIcon, Link2 } from 'lucide-react';

// Detect image URLs in message content
const IMAGE_REGEX = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg)(?:\?[^\s]*)?)/gi;
// Detect YouTube URLs
const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
// Detect general URLs (excluding images)
const URL_REGEX = /(https?:\/\/[^\s<]+)/g;

interface MediaEmbedProps {
  content: string;
}

// Lightbox component
const Lightbox: React.FC<{ src: string; onClose: () => void }> = ({ src, onClose }) => (
  <div 
    className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200 cursor-pointer"
    onClick={onClose}
  >
    <button 
      className="absolute top-6 right-6 w-12 h-12 rounded-full border border-white/10 glass-panel flex items-center justify-center hover:border-primary hover:shadow-glow transition-all z-10"
      onClick={onClose}
    >
      <X size={24} className="text-white" />
    </button>
    <img 
      src={src} 
      className="max-w-[90vw] max-h-[90vh] object-contain rounded-r2 shadow-2xl"
      alt="Full size" 
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

// Image thumbnail
const ImageEmbed: React.FC<{ url: string }> = ({ url }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [error, setError] = useState(false);

  if (error) return null;

  return (
    <>
      <div className="mt-3 max-w-[400px] group cursor-pointer" onClick={() => setLightboxOpen(true)}>
        <div className="relative rounded-r1 overflow-hidden border border-white/10 shadow-lg hover:border-primary/30 transition-all">
          <img 
            src={url} 
            alt="Embedded image"
            className="w-full max-h-[300px] object-cover group-hover:brightness-110 transition-all"
            onError={() => setError(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="px-2 py-1 rounded-full glass-panel border border-white/10 text-[9px] text-white/70 font-mono flex items-center gap-1">
              <ImageIcon size={10} /> EXPAND
            </div>
          </div>
        </div>
      </div>
      {lightboxOpen && <Lightbox src={url} onClose={() => setLightboxOpen(false)} />}
    </>
  );
};

// YouTube embed
const YouTubeEmbed: React.FC<{ videoId: string }> = ({ videoId }) => {
  const [playing, setPlaying] = useState(false);
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="mt-3 max-w-[440px]">
      <div className="glass-card rounded-r2 border border-white/10 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
          <div className="w-3 h-3 rounded-full bg-accent-danger" />
          <span className="text-[10px] font-mono text-white/30 tracking-wider">YOUTUBE // VIDEO</span>
        </div>
        {playing ? (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="YouTube video"
            />
          </div>
        ) : (
          <div className="relative cursor-pointer group" onClick={() => setPlaying(true)}>
            <img src={thumbUrl} className="w-full aspect-video object-cover group-hover:brightness-75 transition-all" alt="Video thumbnail" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full glass-panel border border-white/20 flex items-center justify-center group-hover:border-primary group-hover:shadow-glow transition-all">
                <Play size={28} className="text-white ml-1 group-hover:text-primary" fill="currentColor" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Link preview card (static mock since we can't fetch OG data client-side)
const LinkPreviewCard: React.FC<{ url: string }> = ({ url }) => {
  let domain = '';
  try { domain = new URL(url).hostname; } catch { return null; }

  // Skip image/video URLs — those get their own embeds
  if (IMAGE_REGEX.test(url) || YOUTUBE_REGEX.test(url)) return null;
  // Reset regex lastIndex
  IMAGE_REGEX.lastIndex = 0;
  YOUTUBE_REGEX.lastIndex = 0;

  return (
    <div className="mt-3 max-w-[400px]">
      <a href={url} target="_blank" rel="noopener noreferrer" className="block glass-card rounded-r1 border border-white/8 overflow-hidden hover:border-primary/20 transition-all group">
        <div className="border-l-[3px] border-primary px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Link2 size={12} className="text-primary shrink-0" />
            <span className="text-[10px] font-mono text-white/30 truncate">{domain}</span>
            <ExternalLink size={10} className="text-white/20 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
          <div className="text-sm text-primary font-bold truncate group-hover:underline">{url}</div>
        </div>
      </a>
    </div>
  );
};

/**
 * Renders media embeds (images, YouTube, link previews) detected in message content.
 * Place this below the message text content.
 */
export const MediaEmbed: React.FC<MediaEmbedProps> = ({ content }) => {
  const embeds: React.ReactNode[] = [];

  // Find images
  const imageMatches = [...content.matchAll(IMAGE_REGEX)];
  const seenUrls = new Set<string>();
  
  imageMatches.forEach((match, i) => {
    if (!seenUrls.has(match[1])) {
      seenUrls.add(match[1]);
      embeds.push(<ImageEmbed key={`img-${i}`} url={match[1]} />);
    }
  });

  // Find YouTube
  const ytMatch = content.match(YOUTUBE_REGEX);
  if (ytMatch) {
    embeds.push(<YouTubeEmbed key="yt" videoId={ytMatch[1]} />);
  }

  // Find other URLs for link previews
  const urlMatches = [...content.matchAll(URL_REGEX)];
  urlMatches.forEach((match, i) => {
    const url = match[1];
    if (!seenUrls.has(url) && !YOUTUBE_REGEX.test(url)) {
      // Reset regex
      IMAGE_REGEX.lastIndex = 0;
      if (!IMAGE_REGEX.test(url)) {
        seenUrls.add(url);
        embeds.push(<LinkPreviewCard key={`link-${i}`} url={url} />);
      }
      IMAGE_REGEX.lastIndex = 0;
    }
  });

  if (embeds.length === 0) return null;
  return <div className="space-y-2">{embeds}</div>;
};
