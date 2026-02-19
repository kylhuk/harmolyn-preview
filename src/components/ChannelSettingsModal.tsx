import React, { useState } from 'react';
import { X, Hash, Volume2, Lock, Shield, Users, Trash2, Save, Eye, EyeOff, Clock } from 'lucide-react';
import { Channel } from '@/types';
import { useFeature } from '@/hooks/useFeature';

interface ChannelSettingsModalProps {
  channel: Channel;
  onClose: () => void;
  onSave?: (settings: ChannelSettings) => void;
}

interface ChannelSettings {
  name: string;
  topic: string;
  isPrivate: boolean;
  slowmodeSeconds: number;
  nsfw: boolean;
}

const SLOWMODE_OPTIONS = [
  { label: 'OFF', value: 0 },
  { label: '5s', value: 5 },
  { label: '10s', value: 10 },
  { label: '15s', value: 15 },
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '2m', value: 120 },
  { label: '5m', value: 300 },
];

export const ChannelSettingsModal: React.FC<ChannelSettingsModalProps> = ({ channel, onClose, onSave }) => {
  const [settings, setSettings] = useState<ChannelSettings>({
    name: channel.name,
    topic: '',
    isPrivate: false,
    slowmodeSeconds: 0,
    nsfw: false,
  });
  const hasSlowmode = useFeature('slowmode');
  const hasPrivateChannels = useFeature('privateChannels');

  const handleSave = () => {
    onSave?.(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[520px] mx-6 glass-card rounded-r3 border border-stroke overflow-hidden max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {channel.type === 'voice' ? <Volume2 size={18} /> : <Hash size={18} />}
            </div>
            <div>
              <h2 className="text-title font-semibold text-text-primary">CHANNEL // SETTINGS</h2>
              <p className="text-caption text-text-tertiary">#{channel.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full glass-panel border border-stroke-subtle flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Channel Name */}
          <div className="space-y-1.5">
            <label className="micro-label text-text-tertiary">CHANNEL NAME</label>
            <input
              type="text"
              value={settings.name}
              onChange={e => setSettings(s => ({ ...s, name: e.target.value.toLowerCase().replace(/\s/g, '-') }))}
              className="w-full h-12 px-5 rounded-full bg-surface-dark border border-stroke-subtle text-text-primary text-body focus:border-stroke-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Topic */}
          <div className="space-y-1.5">
            <label className="micro-label text-text-tertiary">CHANNEL TOPIC</label>
            <textarea
              value={settings.topic}
              onChange={e => setSettings(s => ({ ...s, topic: e.target.value }))}
              placeholder="Describe the purpose of this channel..."
              rows={3}
              className="w-full px-5 py-3 rounded-r2 bg-surface-dark border border-stroke-subtle text-text-primary text-body placeholder:text-text-disabled focus:border-stroke-primary focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Private Channel Toggle */}
          {hasPrivateChannels && (
            <div className="glass-card rounded-r2 p-4 border border-stroke flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock size={16} className="text-accent-warning" />
                <div>
                  <div className="text-body-strong text-text-primary">Private Channel</div>
                  <div className="text-[10px] text-text-tertiary">Only selected roles and members can view</div>
                </div>
              </div>
              <button
                onClick={() => setSettings(s => ({ ...s, isPrivate: !s.isPrivate }))}
                className={`w-11 h-6 rounded-full transition-all relative ${settings.isPrivate ? 'bg-primary/30' : 'bg-white/10'}`}
              >
                <div className={`w-5 h-5 rounded-full absolute top-0.5 transition-all ${settings.isPrivate ? 'left-[22px] bg-primary' : 'left-0.5 bg-white/35'}`} />
              </button>
            </div>
          )}

          {/* Slowmode */}
          {hasSlowmode && channel.type === 'text' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-text-tertiary" />
                <label className="micro-label text-text-tertiary">SLOWMODE</label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SLOWMODE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSettings(s => ({ ...s, slowmodeSeconds: opt.value }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      settings.slowmodeSeconds === opt.value
                        ? 'bg-primary/15 text-primary border-primary/30'
                        : 'text-text-secondary border-stroke-subtle hover:bg-white/5'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="border-t border-white/5 pt-5">
            <div className="micro-label text-accent-danger mb-3">DANGER ZONE</div>
            <button className="h-10 px-5 rounded-full bg-accent-danger/10 border border-accent-danger/20 text-accent-danger font-bold text-xs flex items-center gap-2 hover:bg-accent-danger/20 transition-all">
              <Trash2 size={14} />
              Delete Channel
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="h-10 px-5 rounded-full border border-stroke-subtle text-text-secondary text-body-strong hover:bg-white/5 transition-all">
            Cancel
          </button>
          <button onClick={handleSave} className="h-10 px-5 rounded-full bg-primary text-bg-0 font-bold text-body-strong flex items-center gap-2 hover:shadow-glow transition-all">
            <Save size={14} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
