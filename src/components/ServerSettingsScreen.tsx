import React, { useEffect, useState } from 'react';
import { Category, Channel, Server, User } from '@/types';
import { X, Settings, Hash, Shield, Users, Link, Volume2, Crown, Pencil, Trash2, Plus, Copy, Check, FileText, Clock, Filter, ShieldAlert, Ban, AlertTriangle } from 'lucide-react';
import { useFeature } from '@/hooks/useFeature';

interface ServerSettingsScreenProps {
  server: Server;
  onClose: () => void;
}

type SettingsSection = 'overview' | 'roles' | 'channels' | 'members' | 'invites' | 'audit-log' | 'automod';
type FeedbackTone = 'error' | 'info' | 'success';

interface FeedbackState {
  tone: FeedbackTone;
  message: string;
}

interface ManagedRole {
  id: string;
  name: string;
  color: string;
  permissions: string[];
  protected?: boolean;
}

interface InviteRecord {
  id: string;
  code: string;
  createdAt: string;
  expiresIn: string;
  uses: number;
  singleUse: boolean;
}

interface AutomodRule {
  id: string;
  name: string;
  description: string;
  type: 'keyword' | 'spam' | 'link' | 'invite' | 'mention';
  enabled: boolean;
  actions: string[];
}

interface AdminState {
  serverName: string;
  serverDescription: string;
  serverRegion: string;
  roles: ManagedRole[];
  categories: Category[];
  members: User[];
  invites: InviteRecord[];
  rules: AutomodRule[];
  auditFilter: string;
}

const ROLE_COLORS = ['#FF2A6D', '#05FFA1', '#13DDEC', '#A855F7', '#F6F8F8'];

const MOCK_ROLES: ManagedRole[] = [
  { id: 'r1', name: 'Admin', color: '#FF2A6D', permissions: ['MANAGE_SERVER', 'MANAGE_CHANNELS', 'MANAGE_MEMBERS', 'BAN_MEMBERS'], protected: true },
  { id: 'r2', name: 'Moderator', color: '#05FFA1', permissions: ['MANAGE_CHANNELS', 'MANAGE_MEMBERS'] },
  { id: 'r3', name: 'Member', color: '#F6F8F8', permissions: [], protected: true },
];

const MOCK_AUDIT_ENTRIES = [
  { id: 'a1', action: 'CHANNEL_CREATE', user: 'cipher_core', target: '#voice-lounge', timestamp: '2025-02-19 14:32', detail: 'Created voice channel' },
  { id: 'a2', action: 'ROLE_UPDATE', user: 'cipher_core', target: 'Moderator', timestamp: '2025-02-19 13:10', detail: 'Added MANAGE_CHANNELS permission' },
  { id: 'a3', action: 'MEMBER_BAN', user: 'nova_pulse', target: 'spam_bot_42', timestamp: '2025-02-18 22:45', detail: 'Banned for spam' },
  { id: 'a4', action: 'MESSAGE_DELETE', user: 'echo_drift', target: '#general', timestamp: '2025-02-18 20:12', detail: 'Deleted message from user glitch_weaver' },
  { id: 'a5', action: 'SERVER_UPDATE', user: 'cipher_core', target: 'Server', timestamp: '2025-02-18 18:00', detail: 'Updated server description' },
  { id: 'a6', action: 'INVITE_CREATE', user: 'nova_pulse', target: 'xK4nQ9', timestamp: '2025-02-17 10:30', detail: 'Created invite link (24h, single use)' },
];

const AUTOMOD_RULES: AutomodRule[] = [
  { id: 'am1', name: 'Block Profanity', description: 'Automatically filter messages containing profanity', type: 'keyword', enabled: true, actions: ['Delete message', 'Alert moderators'] },
  { id: 'am2', name: 'Spam Protection', description: 'Detect repeated messages and excessive mentions', type: 'spam', enabled: true, actions: ['Timeout user (60s)', 'Delete message'] },
  { id: 'am3', name: 'Link Filter', description: 'Block messages containing suspicious or unapproved links', type: 'link', enabled: false, actions: ['Delete message'] },
  { id: 'am4', name: 'Invite Filter', description: 'Block invite links from non-moderators', type: 'invite', enabled: true, actions: ['Delete message', 'Alert moderators'] },
  { id: 'am5', name: 'Mention Spam', description: 'Block messages with excessive @mentions', type: 'mention', enabled: false, actions: ['Timeout user (300s)'] },
];

const actionColors: Record<string, string> = {
  CHANNEL_CREATE: 'text-accent-success',
  ROLE_UPDATE: 'text-accent-purple',
  MEMBER_BAN: 'text-accent-danger',
  MESSAGE_DELETE: 'text-accent-warning',
  SERVER_UPDATE: 'text-primary',
  INVITE_CREATE: 'text-primary',
};

const ruleTypeColors: Record<AutomodRule['type'], string> = {
  keyword: 'text-accent-danger',
  spam: 'text-accent-warning',
  link: 'text-primary',
  invite: 'text-accent-purple',
  mention: 'text-accent-success',
};

const DEFAULT_INVITE_CODE = 'xK4nQ9';

function cloneCategories(categories: Category[]): Category[] {
  return categories.map((category) => ({
    ...category,
    channels: category.channels.map((channel) => ({ ...channel })),
  }));
}

function createInitialAdminState(server: Server): AdminState {
  return {
    serverName: server.name,
    serverDescription: server.description ?? '',
    serverRegion: server.region || 'AUTO',
    roles: MOCK_ROLES.map((role) => ({ ...role, permissions: [...role.permissions] })),
    categories: cloneCategories(server.categories),
    members: server.members.map((member) => ({ ...member })),
    invites: [
      {
        id: `${server.id}-invite-1`,
        code: DEFAULT_INVITE_CODE,
        createdAt: 'JUST NOW',
        expiresIn: '24H',
        uses: 0,
        singleUse: true,
      },
    ],
    rules: AUTOMOD_RULES.map((rule) => ({ ...rule, actions: [...rule.actions] })),
    auditFilter: 'all',
  };
}

function buildInviteCode(serverId: string, index: number): string {
  if (index === 0) {
    return DEFAULT_INVITE_CODE;
  }

  const prefix = serverId.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase() || 'INV';
  return `${prefix}-${String(index + 1).padStart(2, '0')}`;
}

function buildInviteLink(code: string): string {
  return `https://harmolyn.app/invite/${code}`;
}

export const ServerSettingsScreen: React.FC<ServerSettingsScreenProps> = ({ server, onClose }) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('overview');
  const [adminState, setAdminState] = useState(() => createInitialAdminState(server));
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [copiedInviteCode, setCopiedInviteCode] = useState<string | null>(null);
  const hasAuditLog = useFeature('auditLog');
  const hasAutoMod = useFeature('autoMod');

  useEffect(() => {
    setActiveSection('overview');
    setAdminState(createInitialAdminState(server));
    setFeedback(null);
    setCopiedInviteCode(null);
  }, [server.id]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timer = window.setTimeout(() => setFeedback(null), 2500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!copiedInviteCode) {
      return;
    }

    const timer = window.setTimeout(() => setCopiedInviteCode(null), 1400);
    return () => window.clearTimeout(timer);
  }, [copiedInviteCode]);

  const showFeedback = (tone: FeedbackTone, message: string) => setFeedback({ tone, message });
  const showUnsupported = (message: string) => showFeedback('info', message);

  const handleCopyInvite = async (invite?: InviteRecord) => {
    const targetInvite = invite ?? adminState.invites[0];
    if (!targetInvite) {
      showFeedback('error', 'No invite exists to copy yet.');
      return;
    }

    const link = buildInviteLink(targetInvite.code);
    const clipboard = navigator.clipboard;

    if (!clipboard?.writeText) {
      showUnsupported('Clipboard access is unavailable in the local preview; invite link was not copied.');
      return;
    }

    try {
      await clipboard.writeText(link);
      setCopiedInviteCode(targetInvite.code);
      showFeedback('success', `Copied ${link}.`);
    } catch {
      showUnsupported('Clipboard access is unavailable in the local preview; invite link was not copied.');
    }
  };

  const handleCreateRole = () => {
    const nextIndex = adminState.roles.length;
    const role: ManagedRole = {
      id: `role-${Date.now()}`,
      name: `Custom Role ${nextIndex + 1}`,
      color: ROLE_COLORS[nextIndex % ROLE_COLORS.length],
      permissions: [],
    };

    setAdminState((prev) => ({ ...prev, roles: [role, ...prev.roles] }));
    showFeedback('success', `Created ${role.name} locally.`);
  };

  const handleEditRole = (role: ManagedRole) => {
    showUnsupported(`Role editing for ${role.name} is unsupported in the local preview; create and delete are wired to real state.`);
  };

  const handleDeleteRole = (role: ManagedRole) => {
    if (role.protected) {
      showUnsupported(`${role.name} is protected in the local preview and cannot be deleted.`);
      return;
    }

    setAdminState((prev) => ({ ...prev, roles: prev.roles.filter((entry) => entry.id !== role.id) }));
    showFeedback('success', `Deleted ${role.name} from the local role list.`);
  };

  const handleAddChannel = (categoryId: string) => {
    const category = adminState.categories.find((entry) => entry.id === categoryId);
    if (!category) {
      showFeedback('error', 'Could not find that channel category.');
      return;
    }

    const nextIndex = category.channels.length + 1;
    const channel: Channel = {
      id: `${categoryId}-local-${Date.now()}`,
      name: `new-${nextIndex}`,
      type: 'text',
      categoryId,
    };

    setAdminState((prev) => ({
      ...prev,
      categories: prev.categories.map((entry) => (
        entry.id === categoryId
          ? { ...entry, channels: [...entry.channels, channel] }
          : entry
      )),
    }));
    showFeedback('success', `Added #${channel.name} to ${category.name}.`);
  };

  const handleEditChannel = (channel: Channel) => {
    showUnsupported(`Editing #${channel.name} is unsupported in the local preview; add/remove channel state is wired.`);
  };

  const handleDeleteChannel = (channel: Channel) => {
    setAdminState((prev) => ({
      ...prev,
      categories: prev.categories.map((category) => ({
        ...category,
        channels: category.channels.filter((entry) => entry.id !== channel.id),
      })),
    }));
    showFeedback('success', `Deleted #${channel.name} from the local channel map.`);
  };

  const handleRemoveMember = (member: User) => {
    if (member.role === 'Admin' || member.id === server.ownerId || member.id === 'me') {
      showUnsupported(`${member.username} is protected in the local preview and cannot be removed.`);
      return;
    }

    setAdminState((prev) => ({ ...prev, members: prev.members.filter((entry) => entry.id !== member.id) }));
    showFeedback('success', `${member.username} was removed from the local member list.`);
  };

  const handleCreateInvite = () => {
    const nextIndex = adminState.invites.length;
    const invite: InviteRecord = {
      id: `invite-${Date.now()}`,
      code: buildInviteCode(server.id, nextIndex),
      createdAt: 'JUST NOW',
      expiresIn: '24H',
      uses: 0,
      singleUse: true,
    };

    setAdminState((prev) => ({ ...prev, invites: [invite, ...prev.invites] }));
    showFeedback('success', `Generated invite ${invite.code} locally.`);
  };

  const handleRevokeInvite = (inviteId: string) => {
    setAdminState((prev) => ({ ...prev, invites: prev.invites.filter((invite) => invite.id !== inviteId) }));
    showFeedback('info', 'Invite revoked from the local preview list.');
  };

  const handleCreateRule = () => {
    const rule: AutomodRule = {
      id: `am-${Date.now()}`,
      name: `Custom Rule ${adminState.rules.length + 1}`,
      description: 'Local preview rule created from the server settings screen.',
      type: 'keyword',
      enabled: false,
      actions: ['Delete message'],
    };

    setAdminState((prev) => ({ ...prev, rules: [rule, ...prev.rules] }));
    showFeedback('success', `Created ${rule.name} locally.`);
  };

  const toggleRule = (id: string) => {
    let nextEnabled = false;
    let ruleName = '';

    setAdminState((prev) => ({
      ...prev,
      rules: prev.rules.map((rule) => {
        if (rule.id !== id) {
          return rule;
        }

        nextEnabled = !rule.enabled;
        ruleName = rule.name;
        return { ...rule, enabled: nextEnabled };
      }),
    }));

    showFeedback('success', `${ruleName || 'Automod rule'} ${nextEnabled ? 'enabled' : 'disabled'} locally.`);
  };

  const filteredAuditEntries = adminState.auditFilter === 'all'
    ? MOCK_AUDIT_ENTRIES
    : MOCK_AUDIT_ENTRIES.filter((entry) => entry.action === adminState.auditFilter);

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
      <div className="hidden md:flex w-[224px] bg-bg-1 flex-col items-end py-10 px-5 border-r border-white/5">
        <div className="w-full space-y-1.5">
          <div className="micro-label text-white/20 px-3 mb-3">SERVER // CONFIGURATION</div>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-r1 w-full cursor-pointer transition-all border ${
                activeSection === section.id
                  ? 'bg-primary/10 border-primary/20 text-white shadow-inner'
                  : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className={activeSection === section.id ? 'text-primary' : ''}>{section.icon}</div>
              <span className="font-bold text-xs tracking-tight">{section.label}</span>
            </button>
          ))}

          <div className="h-6" />
          <div className="border-t border-white/5 my-3 mx-3" />
          <button
            onClick={() => showUnsupported('Deleting a server is unsupported in the local preview because destructive server mutations are not exposed by the bridge.')}
            className="flex items-center gap-2.5 px-3 py-2 rounded-r1 w-full text-accent-danger hover:bg-accent-danger/10 transition-all micro-label"
          >
            <Trash2 size={16} />
            <span>Delete Server</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-bg-2 grid-overlay">
        <div className="max-w-[640px] mx-auto py-12 px-6 md:px-10">
          {feedback && <FeedbackBanner feedback={feedback} />}

          {activeSection === 'overview' && (
            <OverviewSection
              serverId={server.id}
              serverName={adminState.serverName}
              serverDescription={adminState.serverDescription}
              serverRegion={adminState.serverRegion}
              memberCount={adminState.members.length}
              onModify={() => showUnsupported('Server metadata editing is unsupported in the local preview; the bridge only exposes read-only server snapshots.')}
            />
          )}

          {activeSection === 'roles' && (
            <RolesSection
              roles={adminState.roles}
              onCreateRole={handleCreateRole}
              onEditRole={handleEditRole}
              onDeleteRole={handleDeleteRole}
            />
          )}

          {activeSection === 'channels' && (
            <ChannelsSection
              categories={adminState.categories}
              onAddChannel={handleAddChannel}
              onEditChannel={handleEditChannel}
              onDeleteChannel={handleDeleteChannel}
            />
          )}

          {activeSection === 'members' && (
            <MembersSection
              members={adminState.members}
              onRemoveMember={handleRemoveMember}
            />
          )}

          {activeSection === 'invites' && (
            <InvitesSection
              invites={adminState.invites}
              copiedInviteCode={copiedInviteCode}
              onCopyInvite={handleCopyInvite}
              onCreateInvite={handleCreateInvite}
              onRevokeInvite={handleRevokeInvite}
            />
          )}

          {activeSection === 'audit-log' && hasAuditLog && (
            <AuditLogSection
              filter={adminState.auditFilter}
              onChangeFilter={(filter) => setAdminState((prev) => ({ ...prev, auditFilter: filter }))}
              entries={filteredAuditEntries}
            />
          )}

          {activeSection === 'automod' && hasAutoMod && (
            <AutoModSection
              rules={adminState.rules}
              onCreateRule={handleCreateRule}
              onToggleRule={toggleRule}
            />
          )}
        </div>
      </div>

      <div className="absolute top-6 right-6 flex flex-col items-center gap-1.5 group cursor-pointer z-[110]" onClick={onClose}>
        <div className="w-10 h-10 rounded-full border border-white/10 glass-panel flex items-center justify-center group-hover:border-primary group-hover:shadow-glow transition-all">
          <X size={20} className="text-white group-hover:text-primary" />
        </div>
        <span className="micro-label text-[7px] text-white/20 group-hover:text-white">ESC</span>
      </div>
    </div>
  );
};

const FeedbackBanner: React.FC<{ feedback: FeedbackState }> = ({ feedback }) => (
  <div className={`rounded-r2 border px-4 py-3 text-xs mb-6 ${feedback.tone === 'error' ? 'border-accent-danger/30 bg-accent-danger/10 text-accent-danger' : feedback.tone === 'success' ? 'border-accent-success/30 bg-accent-success/10 text-accent-success' : 'border-primary/30 bg-primary/10 text-primary'}`}>
    {feedback.message}
  </div>
);

const OverviewSection: React.FC<{
  serverId: string;
  serverName: string;
  serverDescription: string;
  serverRegion: string;
  memberCount: number;
  onModify: () => void;
}> = ({ serverId, serverName, serverDescription, serverRegion, memberCount, onModify }) => (
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
        <div className="w-20 h-20 rounded-r2 border-[5px] border-bg-2 bg-bg-1 overflow-hidden shadow-xl flex items-center justify-center">
          <Shield size={28} className="text-primary" />
        </div>
        <div className="mb-1.5">
          <div className="text-lg font-bold text-white font-display leading-tight">{serverName}</div>
          <div className="text-primary/60 font-mono text-[10px] tracking-widest mt-1 uppercase">ID // {serverId.toUpperCase()}</div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        <FieldRow label="Server Name" value={serverName} onModify={onModify} />
        <FieldRow label="Description" value={serverDescription || 'No description set.'} onModify={onModify} />
        <FieldRow label="Region" value={serverRegion || 'AUTO'} onModify={onModify} />
        <FieldRow label="Members" value={`${memberCount} entities`} onModify={onModify} />
      </div>
    </div>
  </>
);

const RolesSection: React.FC<{
  roles: ManagedRole[];
  onCreateRole: () => void;
  onEditRole: (role: ManagedRole) => void;
  onDeleteRole: (role: ManagedRole) => void;
}> = ({ roles, onCreateRole, onEditRole, onDeleteRole }) => (
  <>
    <header className="mb-10">
      <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">ROLES // HIERARCHY</h2>
      <p className="micro-label text-white/30">PERMISSION // MATRIX // CONTROL</p>
    </header>

    <div className="flex items-center justify-between mb-5">
      <span className="micro-label text-white/30">CONFIGURED ROLES // {roles.length}</span>
      <button onClick={onCreateRole} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stroke-primary text-primary text-[10px] font-bold hover:bg-primary/10 transition-all">
        <Plus size={12} /> Create Role
      </button>
    </div>

    <div className="space-y-2.5">
      {roles.map((role) => (
        <div key={role.id} className="glass-card rounded-r2 p-4 flex items-center justify-between group hover:border-primary/20 transition-all border border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: role.color, boxShadow: `0 0 8px ${role.color}50` }} />
            <div>
              <div className="flex items-center gap-2">
                <div className="text-white font-bold text-xs">{role.name}</div>
                {role.protected && <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-white/10 text-white/25 bg-white/5">protected</span>}
              </div>
              <div className="text-[9px] text-white/30 font-mono">
                {role.permissions.length > 0 ? role.permissions.join(' · ') : 'DEFAULT // PERMISSIONS'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEditRole(role)} aria-label={`Edit ${role.name}`} title={`Edit ${role.name}`} className="p-1.5 rounded-full hover:bg-white/5 text-white/40 hover:text-primary transition-all"><Pencil size={12} /></button>
            {role.name !== 'Member' && (
              <button onClick={() => onDeleteRole(role)} aria-label={`Delete ${role.name}`} title={`Delete ${role.name}`} className="p-1.5 rounded-full hover:bg-accent-danger/10 text-white/40 hover:text-accent-danger transition-all"><Trash2 size={12} /></button>
            )}
          </div>
        </div>
      ))}
    </div>
  </>
);

const ChannelsSection: React.FC<{
  categories: Category[];
  onAddChannel: (categoryId: string) => void;
  onEditChannel: (channel: Channel) => void;
  onDeleteChannel: (channel: Channel) => void;
}> = ({ categories, onAddChannel, onEditChannel, onDeleteChannel }) => (
  <>
    <header className="mb-10">
      <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">CHANNELS // MAP</h2>
      <p className="micro-label text-white/30">TOPOLOGY // STRUCTURE // ROUTING</p>
    </header>

    {categories.map((category) => (
      <div key={category.id} className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="micro-label text-white/40">{category.name}</span>
          <button onClick={() => onAddChannel(category.id)} className="flex items-center gap-1 text-primary text-[10px] hover:underline"><Plus size={10} /> Add Channel</button>
        </div>
        <div className="space-y-1.5">
          {category.channels.map((channel) => (
            <div key={channel.id} className="glass-card rounded-r1 px-4 py-3 flex items-center justify-between group border border-white/5 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-2.5">
                {channel.type === 'voice' ? <Volume2 size={14} className="text-accent-success" /> : <Hash size={14} className="text-primary" />}
                <span className="text-white text-xs font-medium">{channel.name}</span>
                <span className="text-[8px] font-mono text-white/20 uppercase">{channel.type}</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEditChannel(channel)} aria-label={`Edit ${channel.name}`} title={`Edit ${channel.name}`} className="p-1.5 rounded-full hover:bg-white/5 text-white/40 hover:text-primary transition-all"><Pencil size={12} /></button>
                <button onClick={() => onDeleteChannel(channel)} aria-label={`Delete ${channel.name}`} title={`Delete ${channel.name}`} className="p-1.5 rounded-full hover:bg-accent-danger/10 text-white/40 hover:text-accent-danger transition-all"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </>
);

const MembersSection: React.FC<{
  members: User[];
  onRemoveMember: (member: User) => void;
}> = ({ members, onRemoveMember }) => {
  const getRoleBadge = (user: User) => {
    const isAdmin = user.role === 'Admin';
    const color = isAdmin ? '#FF2A6D' : '#F6F8F8';

    return (
      <span
        className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border"
        style={{ color, borderColor: `${color}40`, backgroundColor: `${color}15` }}
      >
        {isAdmin ? 'Admin' : 'Member'}
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
        {members.map((member) => (
          <div key={member.id} className="glass-card rounded-r1 px-4 py-3 flex items-center justify-between group border border-white/5 hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3">
              <img src={member.avatar} className="w-8 h-8 rounded-full border border-white/10" alt={member.username} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold text-xs" style={{ color: member.color }}>{member.username}</span>
                  {member.id === 'me' && <Crown size={10} className="text-accent-warning" />}
                  {member.role === 'Admin' && <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-white/10 text-white/25 bg-white/5">protected</span>}
                </div>
                <div className="text-[9px] text-white/30 font-mono">{member.bio}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              {getRoleBadge(member)}
              <button onClick={() => onRemoveMember(member)} aria-label={`Moderate ${member.username}`} title={`Moderate ${member.username}`} className="p-1.5 rounded-full hover:bg-accent-danger/10 text-white/40 hover:text-accent-danger transition-all opacity-0 group-hover:opacity-100">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const InvitesSection: React.FC<{
  invites: InviteRecord[];
  copiedInviteCode: string | null;
  onCopyInvite: (invite?: InviteRecord) => void;
  onCreateInvite: () => void;
  onRevokeInvite: (inviteId: string) => void;
}> = ({ invites, copiedInviteCode, onCopyInvite, onCreateInvite, onRevokeInvite }) => (
  <>
    <header className="mb-10">
      <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">INVITES // GATEWAY</h2>
      <p className="micro-label text-white/30">ACCESS // CODES // DISTRIBUTION</p>
    </header>

    <div className="glass-card rounded-r2 p-5 border border-white/10 mb-6">
      <div className="micro-label text-white/30 mb-3">GENERATE // INVITE LINK</div>
      <div className="flex items-center gap-2.5">
        <div className="flex-1 bg-surface-dark rounded-full px-4 py-2.5 border border-white/5 font-mono text-xs text-primary truncate">
          {invites[0] ? buildInviteLink(invites[0].code) : 'NO ACTIVE INVITE'}
        </div>
        <button onClick={() => void onCopyInvite(invites[0])} className={`px-4 py-2.5 rounded-full font-bold text-xs micro-label tracking-tight transition-all ${copiedInviteCode === invites[0]?.code ? 'bg-accent-success text-bg-0' : 'bg-primary text-bg-0 hover:shadow-glow-sm'}`}>
          {copiedInviteCode === invites[0]?.code ? <Check size={14} /> : <Copy size={14} />}
        </button>
        <button onClick={onCreateInvite} className="px-4 py-2.5 rounded-full font-bold text-xs micro-label tracking-tight transition-all bg-white/5 text-white/70 hover:bg-white/10 border border-white/5">
          <Plus size={14} />
        </button>
      </div>
      <div className="mt-2.5 text-[9px] text-white/25 font-mono">EXPIRES // 24H // SINGLE USE</div>
    </div>

    <div className="micro-label text-white/30 mb-3">ACTIVE // INVITES</div>
    <div className="space-y-2.5">
      {invites.length > 0 ? invites.map((invite) => (
        <div key={invite.id} className="glass-card rounded-r2 p-4 border border-white/5 hover:border-white/10 transition-all">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-white font-mono text-xs text-primary">{buildInviteLink(invite.code)}</div>
              <div className="text-[9px] text-white/25 font-mono mt-1">CREATED // {invite.createdAt} · USES // {invite.uses} · {invite.singleUse ? 'SINGLE USE' : 'MULTI USE'}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onCopyInvite(invite)} className="px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-bold text-white/60 hover:text-primary hover:border-primary/30 hover:bg-primary/10 transition-all">
                {copiedInviteCode === invite.code ? <Check size={12} /> : <Copy size={12} />}
              </button>
              <button onClick={() => onRevokeInvite(invite.id)} className="px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-bold text-white/60 hover:text-accent-danger hover:border-accent-danger/30 hover:bg-accent-danger/10 transition-all">
                Revoke
              </button>
            </div>
          </div>
        </div>
      )) : (
        <div className="glass-card rounded-r2 p-5 border border-white/5 text-center">
          <div className="text-white/20 text-xs">No active invite links</div>
          <div className="text-[9px] text-white/10 font-mono mt-1">GENERATE A NEW LINK ABOVE</div>
        </div>
      )}
    </div>
  </>
);

const FieldRow: React.FC<{ label: string; value: string; onModify: () => void }> = ({ label, value, onModify }) => (
  <div className="flex justify-between items-center py-3 border-b border-white/5 group">
    <div>
      <div className="micro-label text-white/20 mb-1">{label}</div>
      <div className="text-white font-medium text-sm">{value}</div>
    </div>
    <button onClick={onModify} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary text-[10px] transition-all">
      Modify
    </button>
  </div>
);

const AuditLogSection: React.FC<{
  filter: string;
  onChangeFilter: (filter: string) => void;
  entries: typeof MOCK_AUDIT_ENTRIES;
}> = ({ filter, onChangeFilter, entries }) => {
  const actions = ['all', 'CHANNEL_CREATE', 'ROLE_UPDATE', 'MEMBER_BAN', 'MESSAGE_DELETE', 'SERVER_UPDATE', 'INVITE_CREATE'];

  return (
    <>
      <header className="mb-10">
        <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">AUDIT // LOG</h2>
        <p className="micro-label text-white/30">ACTIONS // HISTORY // TRANSPARENCY</p>
      </header>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter size={12} className="text-white/30" />
        {actions.map((action) => (
          <button
            key={action}
            onClick={() => onChangeFilter(action)}
            className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all ${
              filter === action
                ? 'bg-primary/15 border-primary/30 text-primary'
                : 'bg-white/3 border-white/5 text-white/30 hover:bg-white/5 hover:text-white/50'
            }`}
          >
            {action === 'all' ? 'All' : action.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className="glass-card rounded-r2 p-4 border border-white/5 hover:border-white/10 transition-all group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${actionColors[entry.action] || 'text-white/40'}`}>{entry.action.replace('_', ' ')}</span>
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

      {entries.length === 0 && (
        <div className="text-center py-16">
          <FileText size={32} className="mx-auto text-white/10 mb-3" />
          <p className="text-xs text-white/20">No matching audit entries</p>
        </div>
      )}
    </>
  );
};

const AutoModSection: React.FC<{
  rules: AutomodRule[];
  onCreateRule: () => void;
  onToggleRule: (id: string) => void;
}> = ({ rules, onCreateRule, onToggleRule }) => (
  <>
    <header className="mb-10">
      <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">AUTOMOD // SHIELD</h2>
      <p className="micro-label text-white/30">AUTOMATED // MODERATION // RULES</p>
    </header>

    <div className="flex items-center justify-between mb-5">
      <span className="micro-label text-white/30">ACTIVE RULES // {rules.filter((rule) => rule.enabled).length}/{rules.length}</span>
      <button onClick={onCreateRule} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stroke-primary text-primary text-[10px] font-bold hover:bg-primary/10 transition-all">
        <Plus size={12} /> Create Rule
      </button>
    </div>

    <div className="space-y-3">
      {rules.map((rule) => (
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
                {rule.actions.map((action, index) => (
                  <span key={index} className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-mono text-white/30 border border-white/5">
                    {action}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => onToggleRule(rule.id)}
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
        ].map((stat) => (
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
