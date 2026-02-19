
import React, { useState } from 'react';
import { Server, User } from '@/types';
import { X, Settings, Hash, Shield, Users, Link, ChevronRight, Volume2, Crown, Pencil, Trash2, Plus, Copy, Check } from 'lucide-react';

interface ServerSettingsScreenProps {
  server: Server;
  onClose: () => void;
}

type SettingsSection = 'overview' | 'roles' | 'channels' | 'members' | 'invites';

const MOCK_ROLES = [
  { id: 'r1', name: 'Admin', color: '#FF2A6D', permissions: ['MANAGE_SERVER', 'MANAGE_CHANNELS', 'MANAGE_MEMBERS', 'BAN_MEMBERS'] },
  { id: 'r2', name: 'Moderator', color: '#05FFA1', permissions: ['MANAGE_CHANNELS', 'MANAGE_MEMBERS'] },
  { id: 'r3', name: 'Member', color: '#F6F8F8', permissions: [] },
];

export const ServerSettingsScreen: React.FC<ServerSettingsScreenProps> = ({ server, onClose }) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('overview');
  const [inviteCopied, setInviteCopied] = useState(false);

  const handleCopyInvite = () => {
    navigator.clipboard.writeText('https://harmolyn.app/invite/xK4nQ9');
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const sections: { id: SettingsSection; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Settings size={18} /> },
    { id: 'roles', label: 'Roles', icon: <Shield size={18} /> },
    { id: 'channels', label: 'Channels', icon: <Hash size={18} /> },
    { id: 'members', label: 'Members', icon: <Users size={18} /> },
    { id: 'invites', label: 'Invites', icon: <Link size={18} /> },
  ];

  return (
    <div className="absolute inset-0 z-[100] bg-bg-0 flex flex-col md:flex-row text-white/70 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex w-[280px] bg-bg-1 flex-col items-end py-12 px-6 border-r border-white/5">
        <div className="w-full space-y-2">
          <div className="micro-label text-white/20 px-3 mb-4">SERVER // CONFIGURATION</div>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-r1 w-full cursor-pointer transition-all border ${
                activeSection === s.id
                  ? 'bg-primary/10 border-primary/20 text-white shadow-inner'
                  : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className={activeSection === s.id ? 'text-primary' : ''}>{s.icon}</div>
              <span className="font-bold text-sm tracking-tight">{s.label}</span>
            </button>
          ))}

          <div className="h-8" />
          <div className="border-t border-white/5 my-4 mx-3" />
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-r1 w-full text-accent-danger hover:bg-accent-danger/10 transition-all micro-label">
            <Trash2 size={18} />
            <span>Delete Server</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-bg-2 grid-overlay">
        <div className="max-w-[800px] mx-auto py-16 px-8 md:px-12">
          {activeSection === 'overview' && <OverviewSection server={server} />}
          {activeSection === 'roles' && <RolesSection />}
          {activeSection === 'channels' && <ChannelsSection server={server} />}
          {activeSection === 'members' && <MembersSection members={server.members} />}
          {activeSection === 'invites' && <InvitesSection onCopy={handleCopyInvite} copied={inviteCopied} />}
        </div>
      </div>

      {/* Close */}
      <div className="absolute top-8 right-8 flex flex-col items-center gap-2 group cursor-pointer z-[110]" onClick={onClose}>
        <div className="w-12 h-12 rounded-full border border-white/10 glass-panel flex items-center justify-center group-hover:border-primary group-hover:shadow-glow transition-all">
          <X size={24} className="text-white group-hover:text-primary" />
        </div>
        <span className="micro-label text-[8px] text-white/20 group-hover:text-white">ESC</span>
      </div>
    </div>
  );
};

/* ===== Sub-sections ===== */

const OverviewSection: React.FC<{ server: Server }> = ({ server }) => (
  <>
    <header className="mb-12">
      <h2 className="text-[32px] font-bold text-white mb-2 font-display tracking-tight">SERVER // OVERVIEW</h2>
      <p className="micro-label text-white/30">CONFIGURATION // IDENTITY // REGION</p>
    </header>

    <div className="glass-card rounded-r2 overflow-hidden mb-8 border border-white/10">
      <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-accent-purple/10 relative">
        <div className="absolute inset-0 grid-overlay opacity-30" />
      </div>
      <div className="px-8 pb-8 -mt-12 flex items-end gap-6">
        <div className="w-24 h-24 rounded-r2 border-[6px] border-bg-2 bg-bg-1 overflow-hidden shadow-xl">
          <img src={server.icon} className="w-full h-full object-cover" alt={server.name} />
        </div>
        <div className="mb-2">
          <div className="text-[24px] font-bold text-white font-display leading-tight">{server.name}</div>
          <div className="text-primary/60 font-mono text-xs tracking-widest mt-1 uppercase">ID // {server.id.toUpperCase()}</div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        <FieldRow label="Server Name" value={server.name} />
        <FieldRow label="Description" value={server.description || 'No description set.'} />
        <FieldRow label="Region" value={server.region || 'AUTO'} />
        <FieldRow label="Members" value={`${server.members.length} entities`} />
      </div>
    </div>
  </>
);

const RolesSection: React.FC = () => (
  <>
    <header className="mb-12">
      <h2 className="text-[32px] font-bold text-white mb-2 font-display tracking-tight">ROLES // HIERARCHY</h2>
      <p className="micro-label text-white/30">PERMISSION // MATRIX // CONTROL</p>
    </header>

    <div className="flex items-center justify-between mb-6">
      <span className="micro-label text-white/30">CONFIGURED ROLES // {MOCK_ROLES.length}</span>
      <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-stroke-primary text-primary text-xs font-bold hover:bg-primary/10 transition-all">
        <Plus size={14} /> Create Role
      </button>
    </div>

    <div className="space-y-3">
      {MOCK_ROLES.map(role => (
        <div key={role.id} className="glass-card rounded-r2 p-5 flex items-center justify-between group hover:border-primary/20 transition-all border border-white/8">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: role.color, boxShadow: `0 0 8px ${role.color}50` }} />
            <div>
              <div className="text-white font-bold text-sm">{role.name}</div>
              <div className="text-[10px] text-white/30 font-mono">
                {role.permissions.length > 0 ? role.permissions.join(' · ') : 'DEFAULT // PERMISSIONS'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-primary transition-all"><Pencil size={14} /></button>
            {role.name !== 'Member' && (
              <button className="p-2 rounded-full hover:bg-accent-danger/10 text-white/40 hover:text-accent-danger transition-all"><Trash2 size={14} /></button>
            )}
          </div>
        </div>
      ))}
    </div>
  </>
);

const ChannelsSection: React.FC<{ server: Server }> = ({ server }) => (
  <>
    <header className="mb-12">
      <h2 className="text-[32px] font-bold text-white mb-2 font-display tracking-tight">CHANNELS // MAP</h2>
      <p className="micro-label text-white/30">TOPOLOGY // STRUCTURE // ROUTING</p>
    </header>

    {server.categories.map(cat => (
      <div key={cat.id} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="micro-label text-white/40">{cat.name}</span>
          <button className="flex items-center gap-1 text-primary text-xs hover:underline"><Plus size={12} /> Add Channel</button>
        </div>
        <div className="space-y-2">
          {cat.channels.map(ch => (
            <div key={ch.id} className="glass-card rounded-r1 px-5 py-3.5 flex items-center justify-between group border border-white/5 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-3">
                {ch.type === 'voice' ? <Volume2 size={16} className="text-accent-success" /> : <Hash size={16} className="text-primary" />}
                <span className="text-white text-sm font-medium">{ch.name}</span>
                <span className="text-[9px] font-mono text-white/20 uppercase">{ch.type}</span>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-primary transition-all"><Pencil size={14} /></button>
                <button className="p-2 rounded-full hover:bg-accent-danger/10 text-white/40 hover:text-accent-danger transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </>
);

const MembersSection: React.FC<{ members: User[] }> = ({ members }) => {
  const getRoleBadge = (user: User) => {
    const role = MOCK_ROLES.find(r => r.name === user.role) || MOCK_ROLES[2];
    return (
      <span
        className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
        style={{ color: role.color, borderColor: `${role.color}40`, backgroundColor: `${role.color}15` }}
      >
        {role.name}
      </span>
    );
  };

  return (
    <>
      <header className="mb-12">
        <h2 className="text-[32px] font-bold text-white mb-2 font-display tracking-tight">MEMBERS // REGISTRY</h2>
        <p className="micro-label text-white/30">ENTITIES // {members.length} // CONNECTED</p>
      </header>

      <div className="space-y-2">
        {members.map(m => (
          <div key={m.id} className="glass-card rounded-r1 px-5 py-3.5 flex items-center justify-between group border border-white/5 hover:border-primary/20 transition-all">
            <div className="flex items-center gap-4">
              <img src={m.avatar} className="w-10 h-10 rounded-full border border-white/10" alt={m.username} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm" style={{ color: m.color }}>{m.username}</span>
                  {m.id === 'u1' && <Crown size={12} className="text-accent-warning" />}
                </div>
                <div className="text-[10px] text-white/30 font-mono">{m.bio}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getRoleBadge(m)}
              <button className="p-2 rounded-full hover:bg-accent-danger/10 text-white/40 hover:text-accent-danger transition-all opacity-0 group-hover:opacity-100">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const InvitesSection: React.FC<{ onCopy: () => void; copied: boolean }> = ({ onCopy, copied }) => (
  <>
    <header className="mb-12">
      <h2 className="text-[32px] font-bold text-white mb-2 font-display tracking-tight">INVITES // GATEWAY</h2>
      <p className="micro-label text-white/30">ACCESS // CODES // DISTRIBUTION</p>
    </header>

    <div className="glass-card rounded-r2 p-6 border border-white/10 mb-8">
      <div className="micro-label text-white/30 mb-4">GENERATE // INVITE LINK</div>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-surface-dark rounded-full px-5 py-3 border border-white/5 font-mono text-sm text-primary truncate">
          https://harmolyn.app/invite/xK4nQ9
        </div>
        <button
          onClick={onCopy}
          className={`px-5 py-3 rounded-full font-bold text-sm micro-label tracking-tight transition-all ${
            copied
              ? 'bg-accent-success text-bg-0'
              : 'bg-primary text-bg-0 hover:shadow-glow-sm'
          }`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <div className="mt-3 text-[10px] text-white/25 font-mono">EXPIRES // 24H // SINGLE USE</div>
    </div>

    <div className="micro-label text-white/30 mb-4">ACTIVE // INVITES</div>
    <div className="glass-card rounded-r2 p-6 border border-white/5 text-center">
      <div className="text-white/20 text-sm">No active invite links</div>
      <div className="text-[10px] text-white/10 font-mono mt-1">GENERATE A NEW LINK ABOVE</div>
    </div>
  </>
);

const FieldRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-4 border-b border-white/5 group">
    <div>
      <div className="micro-label text-white/20 mb-1">{label}</div>
      <div className="text-white font-medium">{value}</div>
    </div>
    <button className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary text-xs transition-all">
      Modify
    </button>
  </div>
);
