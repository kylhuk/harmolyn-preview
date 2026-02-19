
import React from 'react';
import { User } from '@/types';
import { PanelRightClose } from 'lucide-react';

interface MemberSidebarProps {
  members: User[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  isOverlay?: boolean;
}

export const MemberSidebar: React.FC<MemberSidebarProps> = ({ members, collapsed, onToggleCollapse, isOverlay }) => {
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
      <div className="h-[52px] px-5 flex items-center justify-between border-b theme-border">
        <span className="micro-label theme-text-dim">Entities</span>
        <button onClick={onToggleCollapse} className="theme-text-dim hover:text-primary"><PanelRightClose size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
        {Object.entries(groups).map(([name, users]) => (
          <div key={name}>
            <h3 className="micro-label theme-text-dim mb-3 px-2">{name} // {users.length}</h3>
            <div className="space-y-0.5">
              {users.map(u => (
                <div key={u.id} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-r1 hover:bg-white/5 transition-all group cursor-pointer">
                  <div className="relative">
                    <img src={u.avatar} className="w-[26px] h-[26px] rounded-r1 border theme-border grayscale-[0.3] group-hover:grayscale-0 transition-all" />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-bg-1 ${getStatusColor(u.status)}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold theme-text-secondary group-hover:theme-text truncate" style={u.status !== 'offline' ? {color: u.color} : {}}>{u.username}</div>
                      {u.status !== 'offline' && <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(u.status).split(' ')[0]}`}></div>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] uppercase font-bold tracking-wider opacity-50" style={{ color: u.status === 'online' ? '#05FFA1' : u.status === 'dnd' ? '#FF2A6D' : u.status === 'idle' ? '#FFB020' : 'rgba(255,255,255,0.3)' }}>{u.status}</span>
                      <div className="text-[9px] theme-text-dim font-mono truncate hidden group-hover:block transition-all"> // {u.bio?.substring(0, 15)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
