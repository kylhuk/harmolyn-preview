import React, { useState } from 'react';
import { Bell, Volume2, AtSign, MessageSquare, Hash, ChevronRight, BellOff } from 'lucide-react';

type NotifLevel = 'all' | 'mentions' | 'none';

interface ChannelOverride {
  id: string;
  name: string;
  level: NotifLevel;
}

export const NotificationSettings: React.FC = () => {
  const [globalLevel, setGlobalLevel] = useState<NotifLevel>('mentions');
  const [desktopEnabled, setDesktopEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [flashTaskbar, setFlashTaskbar] = useState(true);
  const [suppressEveryone, setSuppressEveryone] = useState(false);
  const [suppressRoles, setSuppressRoles] = useState(false);

  const levels: { key: NotifLevel; label: string; desc: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'ALL MESSAGES', desc: 'Notify for every message', icon: <Bell size={16} /> },
    { key: 'mentions', label: 'MENTIONS ONLY', desc: 'Only @mentions and DMs', icon: <AtSign size={16} /> },
    { key: 'none', label: 'NOTHING', desc: 'Mute all notifications', icon: <BellOff size={16} /> },
  ];

  return (
    <>
      <header className="mb-10">
        <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">SIGNAL // ALERTS</h2>
        <p className="micro-label text-white/30">NOTIFICATION // CONFIGURATION // PROTOCOL</p>
      </header>

      <div className="space-y-6">
        {/* Global Level */}
        <section>
          <h3 className="micro-label text-white/40 border-b border-white/5 pb-2 mb-4">DEFAULT NOTIFICATION LEVEL</h3>
          <div className="space-y-2">
            {levels.map(lvl => (
              <button
                key={lvl.key}
                onClick={() => setGlobalLevel(lvl.key)}
                className={`w-full flex items-center gap-3 p-4 rounded-r2 border transition-all ${
                  globalLevel === lvl.key
                    ? 'bg-primary/10 border-primary/20 text-white'
                    : 'border-white/5 text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${globalLevel === lvl.key ? 'bg-primary/15 text-primary' : 'bg-white/5 text-white/30'}`}>
                  {lvl.icon}
                </div>
                <div className="text-left flex-1">
                  <div className="text-sm font-bold">{lvl.label}</div>
                  <div className="text-[10px] text-white/40">{lvl.desc}</div>
                </div>
                {globalLevel === lvl.key && <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-glow-sm" />}
              </button>
            ))}
          </div>
        </section>

        {/* Toggles */}
        <section>
          <h3 className="micro-label text-white/40 border-b border-white/5 pb-2 mb-4">DELIVERY OPTIONS</h3>
          <div className="space-y-3">
            <ToggleRow label="Desktop Notifications" desc="Show OS-level notifications" checked={desktopEnabled} onChange={setDesktopEnabled} />
            <ToggleRow label="Notification Sounds" desc="Play audio on new messages" checked={soundEnabled} onChange={setSoundEnabled} />
            <ToggleRow label="Flash Taskbar" desc="Flash when window is not focused" checked={flashTaskbar} onChange={setFlashTaskbar} />
          </div>
        </section>

        {/* Suppression */}
        <section>
          <h3 className="micro-label text-white/40 border-b border-white/5 pb-2 mb-4">MENTION SUPPRESSION</h3>
          <div className="space-y-3">
            <ToggleRow label="Suppress @everyone / @here" desc="Ignore server-wide pings" checked={suppressEveryone} onChange={setSuppressEveryone} />
            <ToggleRow label="Suppress Role Mentions" desc="Ignore role-based pings" checked={suppressRoles} onChange={setSuppressRoles} />
          </div>
        </section>
      </div>
    </>
  );
};

const ToggleRow = ({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="glass-card rounded-r2 p-4 border border-white/10 flex items-center justify-between">
    <div>
      <div className="text-white font-bold text-sm">{label}</div>
      <div className="text-[10px] text-white/40">{desc}</div>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-all relative ${checked ? 'bg-primary/30' : 'bg-white/10'}`}
    >
      <div className={`w-5 h-5 rounded-full absolute top-0.5 transition-all ${checked ? 'left-[22px] bg-primary' : 'left-0.5 bg-white/35'}`} />
    </button>
  </div>
);
