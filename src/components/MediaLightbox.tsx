import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaLightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({ src, alt = 'Image', onClose }) => {
  const [zoom, setZoom] = useState(1);

  const zoomIn = () => setZoom(z => Math.min(z + 0.25, 3));
  const zoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

      {/* Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button onClick={(e) => { e.stopPropagation(); zoomOut(); }} className="p-2 glass-card rounded-full text-white/60 hover:text-white transition-colors border border-white/10">
          <ZoomOut size={18} />
        </button>
        <span className="text-white/40 text-xs font-mono min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={(e) => { e.stopPropagation(); zoomIn(); }} className="p-2 glass-card rounded-full text-white/60 hover:text-white transition-colors border border-white/10">
          <ZoomIn size={18} />
        </button>
        <button onClick={onClose} className="p-2 glass-card rounded-full text-white/60 hover:text-white transition-colors border border-white/10 ml-2">
          <X size={18} />
        </button>
      </div>

      {/* Image */}
      <div
        className="relative max-w-[90vw] max-h-[85vh] overflow-auto no-scrollbar cursor-move"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="transition-transform duration-200 rounded-r1"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          draggable={false}
        />
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-white/20 font-mono">
        CLICK OUTSIDE TO CLOSE // SCROLL TO ZOOM
      </div>
    </div>
  );
};
