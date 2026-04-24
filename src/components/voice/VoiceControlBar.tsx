
import React from 'react';
import { Mic, MicOff, Headphones, HeadphoneOff, PhoneOff, Settings, Video, MonitorUp, Signal, Gamepad2 } from 'lucide-react';

export interface VoiceControlState {
  statusLabel: string;
  statusDetail: string;
  participantCount: number;
  muted: boolean;
  deafened: boolean;
  videoOn: boolean;
  screenSharing: boolean;
  activeActivityId: string | null;
  canInteract: boolean;
  pendingAction: string | null;
  error: string | null;
  sessionAvailable: boolean;
  channelId: string | null;
}

interface VoiceControlBarProps {
  channelName: string;
  state: VoiceControlState;
  onDisconnect: () => void;
  onToggleMute?: () => void;
  onToggleDeafen?: () => void;
  onToggleVideo?: () => void;
  onToggleScreenShare?: () => void;
  onOpenActivities?: () => void;
  onOpenVoiceSettings?: () => void;
}

export const VoiceControlBar: React.FC<VoiceControlBarProps> = ({
  channelName,
  state,
  onDisconnect,
  onToggleMute,
  onToggleDeafen,
  onToggleVideo,
  onToggleScreenShare,
  onOpenActivities,
  onOpenVoiceSettings,
}) => {
  const controlsUnavailable = !onToggleMute || !onToggleDeafen || !onToggleVideo || !onToggleScreenShare;
  const effectiveState = controlsUnavailable && state.canInteract
    ? {
        ...state,
        canInteract: false,
        error: state.error ?? 'Voice controls are unavailable in this shell.',
        statusDetail: 'Voice controls are unavailable in this shell.',
        statusLabel: 'VOICE UNAVAILABLE',
      }
    : state;
  const actionsLocked = !effectiveState.canInteract || Boolean(effectiveState.pendingAction);

  return (
    <div className="p-3 border-t border-white/5 bg-bg-0/80 backdrop-blur-sm">
      {/* Connection Info */}
      <div className="flex items-center justify-between mb-1.5 gap-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <Signal size={10} className={effectiveState.canInteract ? 'text-accent-success animate-pulse' : 'text-accent-warning'} />
          <span className={`text-[10px] font-bold tracking-wide truncate ${effectiveState.canInteract ? 'text-accent-success' : 'text-accent-warning'}`}>
            {effectiveState.statusLabel}
          </span>
        </div>
        <span className="text-[9px] font-mono text-white/30 truncate max-w-[120px]">{channelName}</span>
      </div>

      <div className="flex items-center justify-between gap-3 mb-2.5">
        <span className="text-[9px] font-mono text-white/35 truncate max-w-[160px]">{effectiveState.statusDetail}</span>
        <span className="text-[9px] font-mono text-white/20 shrink-0">{effectiveState.participantCount} member{effectiveState.participantCount === 1 ? '' : 's'}</span>
      </div>

      {effectiveState.error && (
        <div className="mb-2 text-[9px] font-mono text-accent-danger truncate">{effectiveState.error}</div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <ControlButton
            active={!effectiveState.muted && !effectiveState.deafened}
            danger={effectiveState.muted || effectiveState.deafened}
            icon={effectiveState.muted || effectiveState.deafened ? <MicOff size={16} /> : <Mic size={16} />}
            label={effectiveState.muted || effectiveState.deafened ? 'Unmute' : 'Mute'}
            onClick={onToggleMute}
            disabled={actionsLocked || !onToggleMute}
          />
          <ControlButton
            active={!effectiveState.deafened}
            danger={effectiveState.deafened}
            icon={effectiveState.deafened ? <HeadphoneOff size={16} /> : <Headphones size={16} />}
            label={effectiveState.deafened ? 'Undeafen' : 'Deafen'}
            onClick={onToggleDeafen}
            disabled={actionsLocked || !onToggleDeafen}
          />
          <ControlButton
            active={effectiveState.videoOn}
            icon={<Video size={16} />}
            label="Video"
            onClick={onToggleVideo}
            disabled={actionsLocked || !onToggleVideo}
          />
          <ControlButton
            active={effectiveState.screenSharing}
            icon={<MonitorUp size={16} />}
            label={effectiveState.screenSharing ? 'Stop Screen Share' : 'Screen Share'}
            onClick={onToggleScreenShare}
            disabled={actionsLocked || !onToggleScreenShare}
          />
          {onOpenActivities && (
            <ControlButton
              active={Boolean(effectiveState.activeActivityId)}
              icon={<Gamepad2 size={16} />}
              label={effectiveState.activeActivityId ? 'Activity Live' : 'Activities'}
              onClick={onOpenActivities}
              disabled={actionsLocked}
            />
          )}
        </div>

        <div className="flex items-center gap-1">
          {onOpenVoiceSettings && (
            <ControlButton
              active={false}
              icon={<Settings size={14} />}
              label="Voice Settings"
              onClick={onOpenVoiceSettings}
              small
              disabled={Boolean(effectiveState.pendingAction)}
            />
          )}
          <button
            onClick={onDisconnect}
            disabled={Boolean(effectiveState.pendingAction)}
            className="p-2 rounded-full bg-accent-danger/20 text-accent-danger hover:bg-accent-danger/30 transition-all hover:shadow-[0_0_10px_rgba(255,42,109,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Disconnect"
            title="Leave voice"
          >
            <PhoneOff size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ControlButton = ({ active, danger, icon, label, onClick, small, disabled = false }: {
  active: boolean;
  danger?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  small?: boolean;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled || !onClick}
    className={`
      ${small ? 'p-1.5' : 'p-2'} rounded-full transition-all border
      ${disabled || !onClick ? 'opacity-40 cursor-not-allowed' : ''}
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
