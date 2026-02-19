
import React, { useState } from 'react';
import { X, MonitorUp, Grid, Columns, Square, Maximize } from 'lucide-react';

interface ScreenSharePanelProps {
  onClose: () => void;
  onStartShare?: (type: 'screen' | 'window' | 'tab') => void;
}

const SHARE_OPTIONS = [
  { id: 'screen', label: 'Entire Screen', description: 'Share your full screen', icon: <Maximize size={24} /> },
  { id: 'window', label: 'Application Window', description: 'Share a specific app window', icon: <Square size={24} /> },
  { id: 'tab', label: 'Browser Tab', description: 'Share a single browser tab', icon: <Columns size={24} /> },
];

const QUALITY_OPTIONS = [
  { id: '720', label: '720p', desc: '30 fps', free: true },
  { id: '1080', label: '1080p', desc: '60 fps', free: false },
  { id: '1440', label: '1440p', desc: '60 fps', free: false },
];

export const ScreenSharePanel: React.FC<ScreenSharePanelProps> = ({ onClose, onStartShare }) => {
  const [selectedType, setSelectedType] = useState<string>('screen');
  const [quality, setQuality] = useState('720');
  const [sharing, setSharing] = useState(false);

  const handleStart = () => {
    setSharing(true);
    onStartShare?.(selectedType as any);
  };

  return (
    <div className="absolute inset-0 z-[110] bg-bg-0/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="glass-card rounded-r3 border border-white/10 w-full max-w-[480px] shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MonitorUp size={20} className="text-primary" />
            <div>
              <h2 className="text-lg font-bold text-white font-display tracking-tight">SCREEN SHARE</h2>
              <p className="micro-label text-white/30 mt-0.5">GO LIVE // BROADCAST</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 glass-panel flex items-center justify-center hover:border-primary transition-all">
            <X size={18} className="text-white/60" />
          </button>
        </div>

        {/* Share Type */}
        <div className="px-6 py-5">
          <div className="micro-label text-white/30 mb-3">SHARE TYPE</div>
          <div className="space-y-2">
            {SHARE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelectedType(opt.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-r2 border transition-all text-left ${
                  selectedType === opt.id
                    ? 'bg-primary/10 border-primary/20'
                    : 'border-white/5 hover:bg-white/5'
                }`}
              >
                <div className={`w-12 h-12 rounded-r2 flex items-center justify-center ${
                  selectedType === opt.id ? 'bg-primary/15 text-primary' : 'bg-white/5 text-white/30'
                }`}>
                  {opt.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{opt.label}</div>
                  <div className="text-[10px] text-white/35">{opt.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quality */}
        <div className="px-6 pb-5">
          <div className="micro-label text-white/30 mb-3">STREAM QUALITY</div>
          <div className="flex gap-2">
            {QUALITY_OPTIONS.map(q => (
              <button
                key={q.id}
                onClick={() => setQuality(q.id)}
                className={`flex-1 py-3 rounded-r2 text-center border transition-all relative ${
                  quality === q.id
                    ? 'bg-primary/10 border-primary/20 text-primary'
                    : 'border-white/5 text-white/40 hover:bg-white/5'
                }`}
              >
                <div className="text-sm font-bold">{q.label}</div>
                <div className="text-[9px] text-white/30">{q.desc}</div>
                {!q.free && (
                  <span className="absolute top-1 right-1 text-[7px] font-bold text-accent-purple bg-accent-purple/15 px-1 rounded-full">NITRO</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Start */}
        <div className="px-6 pb-6">
          <button
            onClick={handleStart}
            disabled={sharing}
            className={`w-full py-4 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              sharing
                ? 'bg-accent-danger/20 text-accent-danger border border-accent-danger/30'
                : 'bg-primary text-bg-0 hover:shadow-glow'
            }`}
          >
            <MonitorUp size={16} />
            {sharing ? 'SHARING...' : 'GO LIVE'}
          </button>
        </div>
      </div>
    </div>
  );
};
