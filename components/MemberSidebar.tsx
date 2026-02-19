
import React from 'react';
import { User } from '../types';
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
    <>
        {/* Collapsed Handle (Visible when collapsed) */}
        {collapsed && !isOverlay && (
            <div 
                className="absolute right-0 top-0 bottom-0 w-[12px] bg-bg-1 flex items-center justify-center hover:bg-bg-2 cursor-pointer transition-colors border-l border-white/5 z-20" 
                onClick={onToggleCollapse}
            >
                <div className="w-1 h-8 bg-white/10 rounded-full"></div>
            </div>
        )}

        <div 
            className={`
                w-[280px] glass-realistic flex flex-col h-full transition-transform duration-300 ease-in-out
                ${collapsed ? 'translate-x-full' : 'translate-x-0'}
                ${isOverlay ? 'shadow-2xl' : ''}
            `}
            onMouseLeave={() => {}}
        >
        <div className="h-16 px-6 flex items-center justify-between border-b theme-border">
            <span className="micro-label theme-text-dim">Entities</span>
            <button onClick={onToggleCollapse} className="theme-text-dim hover:text-primary"><PanelRightClose size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
            {Object.entries(groups).map(([name, users]) => (
            <div key={name}>
                <h3 className="micro-label theme-text-dim mb-4 px-2">{name} // {users.length}</h3>
                <div className="space-y-1">
                {users.map(u => (
                    <div key={u.id} className="flex items-center gap-3 px-3 py-2 rounded-r1 hover:bg-white/5 transition-all group cursor-pointer">
                    <div className="relative">
                        <img src={u.avatar} className="w-8 h-8 rounded-r1 border theme-border grayscale-[0.3] group-hover:grayscale-0 transition-all" />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-bg-1 ${getStatusColor(u.status)}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-bold theme-text-secondary group-hover:theme-text truncate" style={u.status !== 'offline' ? {color: u.color} : {}}>{u.username}</div>
                            {u.status !== 'offline' && <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(u.status).split(' ')[0]}`}></div>}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase font-bold tracking-wider opacity-50" style={{ color: u.status === 'online' ? '#05FFA1' : u.status === 'dnd' ? '#FF2A6D' : u.status === 'idle' ? '#FFB020' : 'rgba(255,255,255,0.3)' }}>{u.status}</span>
                            <div className="text-[10px] theme-text-dim font-mono truncate hidden group-hover:block transition-all"> // {u.bio?.substring(0, 15)}</div>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            ))}
        </div>
        </div>
    </>
  );
};
