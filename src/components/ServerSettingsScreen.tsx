
import React, { useState } from 'react';
import { Server, User } from '@/types';
import { X, Settings, Hash, Shield, Users, Link, ChevronRight, Volume2, Crown, Pencil, Trash2, Plus, Copy, Check, FileText, Clock, Filter, ShieldAlert, Ban, AlertTriangle } from 'lucide-react';
import { useFeature } from '@/hooks/useFeature';

interface ServerSettingsScreenProps {
  server: Server;
  onClose: () => void;
}

type SettingsSection = 'overview' | 'roles' | 'channels' | 'members' | 'invites' | 'audit-log' | 'automod';

const MOCK_ROLES = [
  { id: 'r1', name: 'Admin', color: '#FF2A6D', permissions: ['MANAGE_SERVER', 'MANAGE_CHANNELS', 'MANAGE_MEMBERS', 'BAN_MEMBERS'] },
  { id: 'r2', name: 'Moderator', color: '#05FFA1', permissions: ['MANAGE_CHANNELS', 'MANAGE_MEMBERS'] },
  { id: 'r3', name: 'Member', color: '#F6F8F8', permissions: [] },
];

export const ServerSettingsScreen: React.FC<ServerSettingsScreenProps> = ({ server, onClose }) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('overview');
  const [inviteCopied, setInviteCopied] = useState(false);
  const hasAuditLog = useFeature('auditLog');
  const hasAutoMod = useFeature('autoMod');

  const handleCopyInvite = () => {
    navigator.clipboard.writeText('https://harmolyn.app/invite/xK4nQ9');
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const sections: { id: SettingsSection; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Settings size={16} /> },
    { id: 'roles', label: 'Roles', icon: <Shield size={16} /> },
    { id: 'channels', label: 'Channels', icon: <Hash size={16} /> },
    { id: 'members', label: 'Members', icon: <Users size={16} /> },
    { id: 'invites', label: 'Invites', icon: <Link size={16} /> },
    ...(hasAuditLog ? [{ id: 'audit-log' as SettingsSection, label: 'Audit Log', icon: <FileText size={16} /> }] : []),
    ...(hasAutoMod ? [{ id: 'automod' as SettingsSection, label: 'AutoMod', icon: <ShieldAlert size={16} /> }] : []),
  ];

  return (
    <div className="absolute inset-0 z-[100] bg-bg-0 flex flex-col md:flex-row text-white/70 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex w-[224px] bg-bg-1 flex-col items-end py-10 px-5 border-r border-white/5">
        <div className="w-full space-y-1.5">
          <div className="micro-label text-white/20 px-3 mb-3">SERVER // CONFIGURATION</div>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-r1 w-full cursor-pointer transition-all border ${
                activeSection === s.id
                  ? 'bg-primary/10 border-primary/20 text-white shadow-inner'
                  : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className={activeSection === s.id ? 'text-primary' : ''}>{s.icon}</div>
              <span className="font-bold text-xs tracking-tight">{s.label}</span>
            </button>
          ))}

          <div className="h-6" />
          <div className="border-t border-white/5 my-3 mx-3" />
          <button className="flex items-center gap-2.5 px-3 py-2 rounded-r1 w-full text-accent-danger hover:bg-accent-danger/10 transition-all micro-label">
            <Trash2 size={16} />
            <span>Delete Server</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-bg-2 grid-overlay">
        <div className="max-w-[640px] mx-auto py-12 px-6 md:px-10">
          {activeSection === 'overview' && <OverviewSection server={server} />}
          {activeSection === 'roles' && <RolesSection />}
          {activeSection === 'channels' && <ChannelsSection server={server} />}
          {activeSection === 'members' && <MembersSection members={server.members} />}
          {activeSection === 'invites' && <InvitesSection onCopy={handleCopyInvite} copied={inviteCopied} />}
          {activeSection === 'audit-log' && hasAuditLog && <AuditLogSection />}
          {activeSection === 'automod' && hasAutoMod && <AutoModSection />}
        </div>
      </div>

      {/* Close */}
      <div className="absolute top-6 right-6 flex flex-col items-center gap-1.5 group cursor-pointer z-[110]" onClick={onClose}>
        <div className="w-10 h-10 rounded-full border border-white/10 glass-panel flex items-center justify-center group-hover:border-primary group-hover:shadow-glow transition-all">
          <X size={20} className="text-white group-hover:text-primary" />
        </div>
        <span className="micro-label text-[7px] text-white/20 group-hover:text-white">ESC</span>
      </div>
    </div>
  );
};

/* ===== Sub-sections ===== */

const OverviewSection: React.FC<{ server: Server }> = ({ server }) => (
  <>
    <header className="mb-10">
      <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">SERVER // OVERVIEW</h2>
      <p className="micro-label text-white/30">CONFIGURATION // IDENTITY // REGION</p>
    </header>

    <div className="glass-card rounded-r2 overflow-hidden mb-6 border border-white/10">
      <div className="h-[100px] bg-gradient-to-r from-primary/10 via-primary/5 to-accent-purple/10 relative">
        <div className="absolute inset-0 grid-overlay opacity-30" />
      </div>
      <div className="px-6 pb-6 -mt-10 flex items-end gap-5">
        <div className="w-20 h-20 rounded-r2 border-[5px] border-bg-2 bg-bg-1 overflow-hidden shadow-xl">
          <img src={server.icon} className="w-full h-full object-cover" alt={server.name} />
        </div>
        <div className="mb-1.5">
          <div className="text-lg font-bold text-white font-display leading-tight">{server.name}</div>
          <div className="text-primary/60 font-mono text-[10px] tracking-widest mt-1 uppercase">ID // {server.id.toUpperCase()}</div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
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
    <header className="mb-10">
      <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">ROLES // HIERARCHY</h2>
      <p className="micro-label text-white/30">PERMISSION // MATRIX // CONTROL</p>
    </header>

    <div className="flex items-center justify-between mb-5">
      <span className="micro-label text-white/30">CONFIGURED ROLES // {MOCK_ROLES.length}</span>
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stroke-primary text-primary text-[10px] font-bold hover:bg-primary/10 transition-all">
        <Plus size={12} /> Create Role
      </button>
    </div>

    <div className="space-y-2.5">
      {MOCK_ROLES.map(role => (
        <div key={role.id} className="glass-card rounded-r2 p-4 flex items-center justify-between group hover:border-primary/20 transition-all border border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: role.color, boxShadow: `0 0 8px ${role.color}50` }} />
            <div>
              <div className="text-white font-bold text-xs">{role.name}</div>
              <div className="text-[9px] text-white/30 font-mono">
                {role.permissions.length > 0 ? role.permissions.join(' · ') : 'DEFAULT // PERMISSIONS'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1.5 rounded-full hover:bg-white/5 text-white/40 hover:text-primary transition-all"><Pencil size={12} /></button>
            {role.name !== 'Member' && (
              <button className="p-1.5 rounded-full hover:bg-accent-danger/10 text-white/40 hover:text-accent-danger transition-all"><Trash2 size={12} /></button>
            )}
          </div>
        </div>
      ))}
    </div>
  </>
);

const ChannelsSection: React.FC<{ server: Server }> = ({ server }) => (
  <>
    <header className="mb-10">
      <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">CHANNELS // MAP</h2>
      <p className="micro-label text-white/30">TOPOLOGY // STRUCTURE // ROUTING</p>
    </header>

    {server.categories.map(cat => (
      <div key={cat.id} className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="micro-label text-white/40">{cat.name}</span>
          <button className="flex items-center gap-1 text-primary text-[10px] hover:underline"><Plus size={10} /> Add Channel</button>
        </div>
        <div className="space-y-1.5">
          {cat.channels.map(ch => (
            <div key={ch.id} className="glass-card rounded-r1 px-4 py-3 flex items-center justify-between group border border-white/5 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-2.5">
                {ch.type === 'voice' ? <Volume2 size={14} className="text-accent-success" /> : <Hash size={14} className="text-primary" />}
                <span className="text-white text-xs font-medium">{ch.name}</span>
                <span className="text-[8px] font-mono text-white/20 uppercase">{ch.type}</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded-full hover:bg-white/5 text-white/40 hover:text-primary transition-all"><Pencil size={12} /></button>
                <button className="p-1.5 rounded-full hover:bg-accent-danger/10 text-white/40 hover:text-accent-danger transition-all"><Trash2 size={12} /></button>
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
        className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border"
        style={{ color: role.color, borderColor: `${role.color}40`, backgroundColor: `${role.color}15` }}
      >
        {role.name}
      </span>
    );
  };

  return (
    <>
      <header className="mb-10">
        <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">MEMBERS // REGISTRY</h2>
        <p className="micro-label text-white/30">ENTITIES // {members.length} // CONNECTED</p>
      </header>

      <div className="space-y-1.5">
        {members.map(m => (
          <div key={m.id} className="glass-card rounded-r1 px-4 py-3 flex items-center justify-between group border border-white/5 hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3">
              <img src={m.avatar} className="w-8 h-8 rounded-full border border-white/10" alt={m.username} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold text-xs" style={{ color: m.color }}>{m.username}</span>
                  {m.id === 'u1' && <Crown size={10} className="text-accent-warning" />}
                </div>
                <div className="text-[9px] text-white/30 font-mono">{m.bio}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              {getRoleBadge(m)}
              <button className="p-1.5 rounded-full hover:bg-accent-danger/10 text-white/40 hover:text-accent-danger transition-all opacity-0 group-hover:opacity-100">
                <Trash2 size={12} />
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
    <header className="mb-10">
      <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">INVITES // GATEWAY</h2>
      <p className="micro-label text-white/30">ACCESS // CODES // DISTRIBUTION</p>
    </header>

    <div className="glass-card rounded-r2 p-5 border border-white/10 mb-6">
      <div className="micro-label text-white/30 mb-3">GENERATE // INVITE LINK</div>
      <div className="flex items-center gap-2.5">
        <div className="flex-1 bg-surface-dark rounded-full px-4 py-2.5 border border-white/5 font-mono text-xs text-primary truncate">
          https://harmolyn.app/invite/xK4nQ9
        </div>
        <button
          onClick={onCopy}
          className={`px-4 py-2.5 rounded-full font-bold text-xs micro-label tracking-tight transition-all ${
            copied
              ? 'bg-accent-success text-bg-0'
              : 'bg-primary text-bg-0 hover:shadow-glow-sm'
          }`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <div className="mt-2.5 text-[9px] text-white/25 font-mono">EXPIRES // 24H // SINGLE USE</div>
    </div>

    <div className="micro-label text-white/30 mb-3">ACTIVE // INVITES</div>
    <div className="glass-card rounded-r2 p-5 border border-white/5 text-center">
      <div className="text-white/20 text-xs">No active invite links</div>
      <div className="text-[9px] text-white/10 font-mono mt-1">GENERATE A NEW LINK ABOVE</div>
    </div>
  </>
);

const FieldRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-white/5 group">
    <div>
      <div className="micro-label text-white/20 mb-1">{label}</div>
      <div className="text-white font-medium text-sm">{value}</div>
    </div>
    <button className="px-3 py-1 rounded-full bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary text-[10px] transition-all">
      Modify
    </button>
  </div>
);

/* ===== Audit Log ===== */

const MOCK_AUDIT_ENTRIES = [
  { id: 'a1', action: 'CHANNEL_CREATE', user: 'cipher_core', target: '#voice-lounge', timestamp: '2025-02-19 14:32', detail: 'Created voice channel' },
  { id: 'a2', action: 'ROLE_UPDATE', user: 'cipher_core', target: 'Moderator', timestamp: '2025-02-19 13:10', detail: 'Added MANAGE_CHANNELS permission' },
  { id: 'a3', action: 'MEMBER_BAN', user: 'nova_pulse', target: 'spam_bot_42', timestamp: '2025-02-18 22:45', detail: 'Banned for spam' },
  { id: 'a4', action: 'MESSAGE_DELETE', user: 'echo_drift', target: '#general', timestamp: '2025-02-18 20:12', detail: 'Deleted message from user glitch_weaver' },
  { id: 'a5', action: 'SERVER_UPDATE', user: 'cipher_core', target: 'Server', timestamp: '2025-02-18 18:00', detail: 'Updated server description' },
  { id: 'a6', action: 'INVITE_CREATE', user: 'nova_pulse', target: 'xK4nQ9', timestamp: '2025-02-17 10:30', detail: 'Created invite link (24h, single use)' },
];

const actionColors: Record<string, string> = {
  'CHANNEL_CREATE': 'text-accent-success',
  'ROLE_UPDATE': 'text-accent-purple',
  'MEMBER_BAN': 'text-accent-danger',
  'MESSAGE_DELETE': 'text-accent-warning',
  'SERVER_UPDATE': 'text-primary',
  'INVITE_CREATE': 'text-primary',
};

const AuditLogSection: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const actions = ['all', 'CHANNEL_CREATE', 'ROLE_UPDATE', 'MEMBER_BAN', 'MESSAGE_DELETE', 'SERVER_UPDATE', 'INVITE_CREATE'];

  const filtered = filter === 'all' ? MOCK_AUDIT_ENTRIES : MOCK_AUDIT_ENTRIES.filter(e => e.action === filter);

  return (
    <>
      <header className="mb-10">
        <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">AUDIT // LOG</h2>
        <p className="micro-label text-white/30">ACTIONS // HISTORY // TRANSPARENCY</p>
      </header>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter size={12} className="text-white/30" />
        {actions.map(a => (
          <button
            key={a}
            onClick={() => setFilter(a)}
            className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all ${
              filter === a
                ? 'bg-primary/15 border-primary/30 text-primary'
                : 'bg-white/3 border-white/5 text-white/30 hover:bg-white/5 hover:text-white/50'
            }`}
          >
            {a === 'all' ? 'All' : a.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {filtered.map(entry => (
          <div key={entry.id} className="glass-card rounded-r2 p-4 border border-white/5 hover:border-white/10 transition-all group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${actionColors[entry.action] || 'text-white/40'}`}>
                    {entry.action.replace('_', ' ')}
                  </span>
                  <span className="text-[8px] font-mono text-white/15">by</span>
                  <span className="text-[10px] font-bold text-white/70">{entry.user}</span>
                </div>
                <p className="text-[11px] text-white/50">{entry.detail}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[9px] font-mono text-white/20">TARGET: {entry.target}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[8px] font-mono text-white/15 flex-shrink-0">
                <Clock size={10} />
                {entry.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FileText size={32} className="mx-auto text-white/10 mb-3" />
          <p className="text-xs text-white/20">No matching audit entries</p>
        </div>
      )}
    </>
  );
};

/* ===== AutoMod ===== */

const AUTOMOD_RULES = [
  { id: 'am1', name: 'Block Profanity', description: 'Automatically filter messages containing profanity', type: 'keyword', enabled: true, actions: ['Delete message', 'Alert moderators'] },
  { id: 'am2', name: 'Spam Protection', description: 'Detect repeated messages and excessive mentions', type: 'spam', enabled: true, actions: ['Timeout user (60s)', 'Delete message'] },
  { id: 'am3', name: 'Link Filter', description: 'Block messages containing suspicious or unapproved links', type: 'link', enabled: false, actions: ['Delete message'] },
  { id: 'am4', name: 'Invite Filter', description: 'Block invite links from non-moderators', type: 'invite', enabled: true, actions: ['Delete message', 'Alert moderators'] },
  { id: 'am5', name: 'Mention Spam', description: 'Block messages with excessive @mentions', type: 'mention', enabled: false, actions: ['Timeout user (300s)'] },
];

const ruleTypeColors: Record<string, string> = {
  keyword: 'text-accent-danger',
  spam: 'text-accent-warning',
  link: 'text-primary',
  invite: 'text-accent-purple',
  mention: 'text-accent-success',
};

const AutoModSection: React.FC = () => {
  const [rules, setRules] = useState(AUTOMOD_RULES);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  return (
    <>
      <header className="mb-10">
        <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">AUTOMOD // SHIELD</h2>
        <p className="micro-label text-white/30">AUTOMATED // MODERATION // RULES</p>
      </header>

      <div className="flex items-center justify-between mb-5">
        <span className="micro-label text-white/30">ACTIVE RULES // {rules.filter(r => r.enabled).length}/{rules.length}</span>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stroke-primary text-primary text-[10px] font-bold hover:bg-primary/10 transition-all">
          <Plus size={12} /> Create Rule
        </button>
      </div>

      <div className="space-y-3">
        {rules.map(rule => (
          <div key={rule.id} className={`glass-card rounded-r2 p-4 border transition-all ${rule.enabled ? 'border-white/8' : 'border-white/5 opacity-50'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldAlert size={14} className={ruleTypeColors[rule.type] || 'text-white/40'} />
                  <span className="text-sm font-bold text-white">{rule.name}</span>
                  <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${ruleTypeColors[rule.type]} bg-white/3 border-white/5`}>
                    {rule.type}
                  </span>
                </div>
                <p className="text-[11px] text-white/40 mb-3">{rule.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {rule.actions.map((action, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-mono text-white/30 border border-white/5">
                      {action}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => toggleRule(rule.id)}
                className={`w-10 h-6 rounded-full transition-all flex-shrink-0 relative ${rule.enabled ? 'bg-primary/30' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${rule.enabled ? 'left-5 bg-primary shadow-glow-sm' : 'left-1 bg-white/30'}`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="micro-label text-white/30 mb-3">QUARANTINE // STATS // 30 DAYS</div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'BLOCKED', value: '247', icon: <Ban size={14} /> },
            { label: 'TIMEOUTS', value: '12', icon: <Clock size={14} /> },
            { label: 'ALERTS', value: '89', icon: <AlertTriangle size={14} /> },
          ].map(stat => (
            <div key={stat.label} className="glass-card rounded-r2 p-4 border border-white/5 text-center">
              <div className="text-white/20 mb-2 flex justify-center">{stat.icon}</div>
              <div className="text-lg font-bold text-white font-display">{stat.value}</div>
              <div className="micro-label text-white/20 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
