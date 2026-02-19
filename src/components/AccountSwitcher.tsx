import React from 'react';
import { Plus, Check, LogOut } from 'lucide-react';
import { User, UserStatus } from '@/types';

interface AccountSwitcherProps {
  accounts: { user: User; active: boolean }[];
  onSwitch: (userId: string) => void;
  onAddAccount: () => void;
  onLogout: () => void;
  onClose: () => void;
}

const statusColors: Record<UserStatus, string> = {
  online: 'bg-accent-success shadow-[0_0_5px_#05FFA1]',
  idle: 'bg-accent-warning shadow-[0_0_5px_#FFB020]',
  dnd: 'bg-accent-danger shadow-[0_0_5px_#FF2A6D]',
  offline: 'bg-white/20',
};

export const AccountSwitcher: React.FC<AccountSwitcherProps> = ({
  accounts,
  onSwitch,
  onAddAccount,
  onLogout,
  onClose,
}) => {
  return (
    <>
      <div className="fixed inset-0 z-[70]" onClick={onClose} />
      <div className="absolute bottom-full left-0 right-0 mb-2 z-[80] glass-card rounded-r2 border border-stroke p-2 space-y-1 animate-in slide-in-from-bottom-2 fade-in duration-200">
        <div className="micro-label text-text-tertiary px-3 py-1.5">LINKED NODES</div>

        {accounts.map(({ user, active }) => (
          <button
            key={user.id}
            onClick={() => !active && onSwitch(user.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-r1 transition-all ${
              active
                ? 'bg-primary/10 border border-primary/20 text-text-primary'
                : 'border border-transparent text-text-secondary hover:bg-white/5 hover:text-text-primary'
            }`}
          >
            <div className="relative">
              <img src={user.avatar} className="w-7 h-7 rounded-full border border-stroke" alt="" />
              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-bg-0 ${statusColors[user.status]}`} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-xs font-bold truncate">{user.username}</div>
              <div className="text-[8px] font-mono text-text-disabled">ID // {user.id.toUpperCase()}</div>
            </div>
            {active && <Check size={14} className="text-primary flex-shrink-0" />}
          </button>
        ))}

        <div className="h-px bg-stroke-subtle mx-2 my-1" />

        <button
          onClick={onAddAccount}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-r1 text-text-secondary hover:bg-white/5 hover:text-primary transition-all border border-transparent"
        >
          <div className="w-7 h-7 rounded-full border border-dashed border-stroke-strong flex items-center justify-center">
            <Plus size={14} />
          </div>
          <span className="text-xs font-bold">Add Node</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-r1 text-accent-danger hover:bg-accent-danger/10 transition-all border border-transparent"
        >
          <LogOut size={14} />
          <span className="text-xs font-bold">Disconnect All</span>
        </button>
      </div>
    </>
  );
};
