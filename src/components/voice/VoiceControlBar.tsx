
import React, { useState } from 'react';
import { Mic, MicOff, Headphones, HeadphoneOff, PhoneOff, Settings, Video, MonitorUp, Signal, Gamepad2 } from 'lucide-react';

interface VoiceControlBarProps {
  channelName: string;
  onDisconnect: () => void;
  onOpenActivities?: () => void;
}

export const VoiceControlBar: React.FC<VoiceControlBarProps> = ({ channelName, onDisconnect, onOpenActivities }) => {
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [videoOn, setVideoOn] = useState(false);

  const handleDeafen = () => {
    setDeafened(!deafened);
    if (!deafened) setMuted(true);
  };

  return (
    <div className="p-3 border-t border-white/5 bg-bg-0/80 backdrop-blur-sm">
      {/* Connection Info */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Signal size={10} className="text-accent-success animate-pulse" />
          <span className="text-[10px] font-bold text-accent-success tracking-wide">VOICE CONNECTED</span>
        </div>
        <span className="text-[9px] font-mono text-white/30 truncate max-w-[100px]">{channelName}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <ControlButton
            active={!muted}
            danger={muted}
            icon={muted ? <MicOff size={16} /> : <Mic size={16} />}
            label={muted ? 'Unmute' : 'Mute'}
            onClick={() => setMuted(!muted)}
          />
          <ControlButton
            active={!deafened}
            danger={deafened}
            icon={deafened ? <HeadphoneOff size={16} /> : <Headphones size={16} />}
            label={deafened ? 'Undeafen' : 'Deafen'}
            onClick={handleDeafen}
          />
          <ControlButton
            active={videoOn}
            icon={<Video size={16} />}
            label="Video"
            onClick={() => setVideoOn(!videoOn)}
          />
          <ControlButton
            active={false}
            icon={<MonitorUp size={16} />}
            label="Screen Share"
            onClick={() => {}}
          />
          {onOpenActivities && (
            <ControlButton
              active={false}
              icon={<Gamepad2 size={16} />}
              label="Activities"
              onClick={onOpenActivities}
            />
          )}
        </div>

        <div className="flex items-center gap-1">
          <ControlButton
            active={false}
            icon={<Settings size={14} />}
            label="Voice Settings"
            onClick={() => {}}
            small
          />
          <button
            onClick={onDisconnect}
            className="p-2 rounded-full bg-accent-danger/20 text-accent-danger hover:bg-accent-danger/30 transition-all hover:shadow-[0_0_10px_rgba(255,42,109,0.3)]"
            aria-label="Disconnect"
          >
            <PhoneOff size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ControlButton = ({ active, danger, icon, label, onClick, small }: {
  active: boolean;
  danger?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  small?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`
      ${small ? 'p-1.5' : 'p-2'} rounded-full transition-all border
      ${danger
        ? 'bg-accent-danger/15 border-accent-danger/20 text-accent-danger hover:bg-accent-danger/25'
        : active
          ? 'bg-white/8 border-white/10 text-white/80 hover:bg-white/12'
          : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/8 hover:text-white/60'
      }
    `}
    aria-label={label}
    title={label}
  >
    {icon}
  </button>
);
