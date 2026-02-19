
import React, { useState, useRef, useEffect } from 'react';
import { UserStatus } from '@/types';
import { Smile, X, Circle, Moon, MinusCircle, EyeOff } from 'lucide-react';

interface StatusPickerProps {
  currentStatus: UserStatus;
  customStatus?: string;
  onStatusChange: (status: UserStatus) => void;
  onCustomStatusChange: (text: string) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: { status: UserStatus; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  { status: 'online', label: 'Online', description: 'SIGNAL // ACTIVE', icon: <Circle size={12} fill="#05FFA1" stroke="none" />, color: 'text-accent-success' },
  { status: 'idle', label: 'Idle', description: 'SIGNAL // LOW POWER', icon: <Moon size={12} className="text-accent-warning" />, color: 'text-accent-warning' },
  { status: 'dnd', label: 'Do Not Disturb', description: 'SIGNAL // BLOCKED', icon: <MinusCircle size={12} className="text-accent-danger" />, color: 'text-accent-danger' },
  { status: 'offline', label: 'Invisible', description: 'SIGNAL // CLOAKED', icon: <EyeOff size={12} className="text-white/30" />, color: 'text-white/30' },
];

export const StatusPicker: React.FC<StatusPickerProps> = ({
  currentStatus,
  customStatus = '',
  onStatusChange,
  onCustomStatusChange,
  onClose,
}) => {
  const [statusText, setStatusText] = useState(customStatus);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleSetCustom = () => {
    onCustomStatusChange(statusText);
  };

  const handleClearCustom = () => {
    setStatusText('');
    onCustomStatusChange('');
  };

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 w-[280px] glass-card rounded-r2 border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.37)] z-50 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200"
    >
      {/* Custom Status Input */}
      <div className="p-4 border-b border-white/5">
        <div className="micro-label text-white/30 mb-3">CUSTOM // STATUS</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-surface-dark rounded-full px-4 py-2.5 border border-white/5">
            <Smile size={16} className="text-primary shrink-0" />
            <input
              type="text"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSetCustom(); }}
              placeholder="Set a custom status..."
              className="bg-transparent text-sm text-white/90 placeholder:text-white/25 outline-none flex-1 min-w-0"
              maxLength={40}
            />
            {statusText && (
              <button onClick={handleClearCustom} className="text-white/30 hover:text-white transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        {statusText !== customStatus && statusText && (
          <button
            onClick={handleSetCustom}
            className="mt-2 w-full py-2 rounded-full bg-primary text-bg-0 text-xs font-bold micro-label tracking-tight hover:shadow-glow-sm transition-all"
          >
            Set Status
          </button>
        )}
      </div>

      {/* Status Options */}
      <div className="p-2">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.status}
            onClick={() => { onStatusChange(opt.status); onClose(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-r1 transition-all cursor-pointer ${
              currentStatus === opt.status
                ? 'bg-primary/10 border border-primary/20'
                : 'border border-transparent hover:bg-white/5'
            }`}
          >
            <div className="w-5 flex items-center justify-center">{opt.icon}</div>
            <div className="flex-1 text-left">
              <div className={`text-sm font-bold ${currentStatus === opt.status ? 'text-primary' : 'text-white/80'}`}>
                {opt.label}
              </div>
              <div className="text-[9px] font-mono text-white/30 tracking-wider">{opt.description}</div>
            </div>
            {currentStatus === opt.status && (
              <div className="w-2 h-2 rounded-full bg-primary shadow-glow-sm" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
