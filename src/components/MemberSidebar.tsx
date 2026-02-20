
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '@/types';
import { PanelRightClose, Clock, X } from 'lucide-react';
import { useFeature } from '@/hooks/useFeature';
import { DonorBadge } from '@/components/DonorBadge';

interface MemberSidebarProps {
  members: User[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  isOverlay?: boolean;
}

const TimeoutModal: React.FC<{ user: User; onClose: () => void }> = ({ user, onClose }) => {
  const [duration, setDuration] = useState('60');
  const [reason, setReason] = useState('');
  const [applied, setApplied] = useState(false);
  const durations = [
    { value: '60', label: '60 seconds' },
    { value: '300', label: '5 minutes' },
    { value: '600', label: '10 minutes' },
    { value: '3600', label: '1 hour' },
    { value: '86400', label: '1 day' },
    { value: '604800', label: '1 week' },
  ];

  const handleApply = () => {
    setApplied(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      <div className="glass-card rounded-r3 border border-white/10 w-full max-w-[380px] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-white font-display">TIMEOUT // {user.username.toUpperCase()}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:border-primary transition-all">
            <X size={14} className="text-white/40" />
          </button>
        </div>

        <div className="micro-label text-white/30 mb-2">DURATION</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {durations.map(d => (
            <button
              key={d.value}
              onClick={() => setDuration(d.value)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                duration === d.value
                  ? 'bg-accent-warning/15 border-accent-warning/30 text-accent-warning'
                  : 'bg-white/3 border-white/5 text-white/30 hover:bg-white/5'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="micro-label text-white/30 mb-2">REASON (OPTIONAL)</div>
        <input
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Reason for timeout..."
          className="w-full bg-surface-dark rounded-r1 px-4 py-2.5 text-sm text-white placeholder:text-white/20 border border-white/5 focus:border-accent-warning/30 focus:outline-none mb-5 focus-ring"
        />

        <button
          onClick={handleApply}
          disabled={applied}
          className={`w-full py-3 rounded-full font-bold text-sm transition-all ${
            applied
              ? 'bg-accent-success/20 text-accent-success'
              : 'bg-accent-warning text-bg-0 hover:shadow-[0_0_15px_rgba(255,176,32,0.3)]'
          }`}
        >
          {applied ? '✓ TIMEOUT APPLIED' : 'APPLY TIMEOUT'}
        </button>
      </div>
    </div>
  );
};

export const MemberSidebar: React.FC<MemberSidebarProps> = ({ members, collapsed, onToggleCollapse, isOverlay }) => {
  const hasTimeout = useFeature('timeout');
  const [timeoutTarget, setTimeoutTarget] = useState<User | null>(null);

  const groups = {
    'OPERATORS': members.filter(m => m.status === 'online' || m.status === 'dnd'),
    'IDLE': members.filter(m => m.status === 'idle'),
    'OFFLINE': members.filter(m => m.status === 'offline'),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-accent-success shadow-[0_0_5px_#05FFA1]';
      case 'idle': return 'bg-accent-warning shadow-[0_0_5px_#FFB020]';
      case 'dnd': return 'bg-accent-danger shadow-[0_0_5px_#FF2A6D]';
      default: return 'bg-white/20';
    }
  };

  return (
    <div className={`w-[224px] glass-realistic flex flex-col h-full ${isOverlay ? 'shadow-2xl' : ''}`}>
      {timeoutTarget && <TimeoutModal user={timeoutTarget} onClose={() => setTimeoutTarget(null)} />}
      <div className="h-[52px] px-5 flex items-center justify-between border-b theme-border">
        <span className="micro-label theme-text-dim">Entities</span>
        <button onClick={onToggleCollapse} className="theme-text-dim hover:text-primary"><PanelRightClose size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
        {Object.entries(groups).map(([name, users]) => (
          <div key={name}>
            <h3 className="micro-label theme-text-dim mb-3 px-2">{name} // {users.length}</h3>
            <div className="space-y-0.5">
              {users.map((u, i) => (
                <motion.div 
                  key={u.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-r1 hover:bg-white/5 active:bg-white/8 transition-all group cursor-pointer relative min-h-[48px]"
                >
                  <div className="relative">
                    <img src={u.avatar} className="w-[26px] h-[26px] rounded-r1 border theme-border grayscale-[0.3] group-hover:grayscale-0 transition-all" />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-bg-1 ${getStatusColor(u.status)}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 min-w-0">
                        <div className="text-xs font-bold theme-text-secondary group-hover:theme-text truncate" style={u.status !== 'offline' ? {color: u.color} : {}}>{u.username}</div>
                        {u.donationTier && <DonorBadge tier={u.donationTier} compact />}
                      </div>
                      {u.status !== 'offline' && <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(u.status).split(' ')[0]}`}></div>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] uppercase font-bold tracking-wider opacity-50" style={{ color: u.status === 'online' ? '#05FFA1' : u.status === 'dnd' ? '#FF2A6D' : u.status === 'idle' ? '#FFB020' : 'rgba(255,255,255,0.3)' }}>{u.status}</span>
                      <div className="text-[9px] theme-text-dim font-mono truncate hidden group-hover:block transition-all"> // {u.bio?.substring(0, 15)}</div>
                    </div>
                  </div>
                  {/* Timeout action */}
                  {hasTimeout && u.id !== 'u1' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setTimeoutTarget(u); }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-accent-warning/10 text-white/0 group-hover:text-white/20 hover:!text-accent-warning transition-all"
                      title="Timeout user"
                    >
                      <Clock size={12} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
