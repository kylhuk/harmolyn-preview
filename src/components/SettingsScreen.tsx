import React, { useEffect, useState } from 'react';
import {
  X,
  User,
  Shield,
  Key,
  Bell,
  Monitor,
  LogOut,
  ChevronRight,
  Smartphone,
  Lock,
  Fingerprint,
  QrCode,
  Accessibility,
  Heart,
  ShoppingBag,
  Trophy,
  Zap,
  Copy,
  LayoutGrid,
  ShieldAlert,
  Globe,
  Settings,
} from 'lucide-react';
import { User as UserType, type MessageLayout } from '@/types';
import { NotificationSettings } from '@/components/NotificationSettings';
import { useFeature } from '@/hooks/useFeature';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';
import { usePersistentState } from '@/hooks/usePersistentState';
import { readBrowserAuthContext } from '@/lib/authPreview';

interface SettingsScreenProps {
  user: UserType;
  onClose: () => void;
  onOpenDonations?: () => void;
  onOpenShop?: () => void;
  onOpenQuests?: () => void;
  onLogOut?: () => void;
  messageLayout?: MessageLayout;
  onToggleMessageLayout?: () => void;
}

type SettingsSection = 'account' | 'privacy' | 'mfa' | 'authorized' | 'appearance' | 'notifications' | 'accessibility' | 'mobile';
type FeedbackTone = 'error' | 'info' | 'success';

interface FeedbackState {
  tone: FeedbackTone;
  message: string;
}

interface AccountPreferences {
  displayName: string;
  identityLink: string;
  bio: string;
  avatarUrl: string;
}

interface PrivacyPreferences {
  showPresence: boolean;
  shareReadReceipts: boolean;
  allowDiscovery: boolean;
}

interface AuthorizedPreferences {
  rememberBrowser: boolean;
}

interface AccessibilityPreferences {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'default' | 'large' | 'xlarge';
  saturation: number;
}

const AUTH_TOKEN_STORAGE_KEYS = [
  'harmolyn:xorein:control-token',
  'harmolyn:control-token',
  'xorein:control-token',
] as const;

const ACCOUNT_DEFAULTS = (user: UserType): AccountPreferences => ({
  displayName: user.username,
  identityLink: 'neo@nexus-underground.net',
  bio: user.bio?.trim() || 'No status established.',
  avatarUrl: user.avatar,
});

const PRIVACY_DEFAULTS: PrivacyPreferences = {
  showPresence: true,
  shareReadReceipts: true,
  allowDiscovery: false,
};

const AUTHORIZED_DEFAULTS: AuthorizedPreferences = {
  rememberBrowser: true,
};

const ACCESSIBILITY_DEFAULTS: AccessibilityPreferences = {
  highContrast: false,
  reducedMotion: false,
  fontSize: 'default',
  saturation: 100,
};

const FONT_SIZES: Array<{ key: AccessibilityPreferences['fontSize']; label: string; size: string }> = [
  { key: 'small', label: 'SMALL', size: '13px' },
  { key: 'default', label: 'DEFAULT', size: '15px' },
  { key: 'large', label: 'LARGE', size: '17px' },
  { key: 'xlarge', label: 'X-LARGE', size: '19px' },
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  user,
  onClose,
  onOpenDonations,
  onOpenShop,
  onOpenQuests,
  onLogOut,
  messageLayout = 'modern',
  onToggleMessageLayout,
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const hasDonations = useFeature('donations');
  const hasShop = useFeature('shop');
  const hasQuests = useFeature('quests');

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timer = window.setTimeout(() => setFeedback(null), 2600);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const showFeedback = (tone: FeedbackTone, message: string) => setFeedback({ tone, message });

  const handleOpenSupport = (label: string, action?: () => void) => {
    if (action) {
      action();
      return;
    }

    showFeedback('info', `${label} is not available from this browser session.`);
  };

  const handleLogout = () => {
    for (const key of AUTH_TOKEN_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    }

    if (onLogOut) {
      onLogOut();
    } else {
      showFeedback('success', 'Cleared stored control tokens from this browser.');
    }
  };

  return (
    <div className="absolute inset-0 z-[100] bg-bg-0 flex flex-col md:flex-row text-white/70 overflow-hidden">
      <div className="hidden md:flex w-[224px] bg-bg-1 flex-col items-end py-10 px-5 border-r border-white/5">
        <div className="w-full space-y-1.5">
          <div className="micro-label text-white/20 px-3 mb-3">User settings</div>
          <SettingsItem icon={<User size={16} />} label="My Account" active={activeSection === 'account'} onClick={() => setActiveSection('account')} />
          <SettingsItem icon={<Shield size={16} />} label="Privacy & Safety" active={activeSection === 'privacy'} onClick={() => setActiveSection('privacy')} />
          <SettingsItem icon={<Lock size={16} />} label="Security (MFA)" active={activeSection === 'mfa'} onClick={() => setActiveSection('mfa')} />
          <SettingsItem icon={<Key size={16} />} label="Authorized Hubs" active={activeSection === 'authorized'} onClick={() => setActiveSection('authorized')} />

          <div className="h-6" />
          <div className="micro-label text-white/20 px-3 mb-3">System configuration</div>
          <SettingsItem icon={<Monitor size={16} />} label="Core Appearance" active={activeSection === 'appearance'} onClick={() => setActiveSection('appearance')} />
          <SettingsItem icon={<Bell size={16} />} label="Signal Alerts" active={activeSection === 'notifications'} onClick={() => setActiveSection('notifications')} />
          <SettingsItem icon={<Accessibility size={16} />} label="Accessibility" active={activeSection === 'accessibility'} onClick={() => setActiveSection('accessibility')} />
          <SettingsItem icon={<Smartphone size={16} />} label="Mobile Sync" active={activeSection === 'mobile'} onClick={() => setActiveSection('mobile')} />

          <div className="h-6" />
          <div className="micro-label text-white/20 px-3 mb-3">Support</div>
          {hasDonations && <SettingsItem icon={<Heart size={16} />} label="Donate" active={false} onClick={() => handleOpenSupport('Donate', onOpenDonations)} />}
          {hasShop && <SettingsItem icon={<ShoppingBag size={16} />} label="Shop" active={false} onClick={() => handleOpenSupport('Shop', onOpenShop)} />}
          {hasQuests && <SettingsItem icon={<Trophy size={16} />} label="Quests" active={false} onClick={() => handleOpenSupport('Quests', onOpenQuests)} />}

          <div className="h-6" />
          <div className="border-t border-white/5 my-3 mx-3" />
          <button
            type="button"
            className="flex items-center gap-2.5 px-3 py-2 rounded-r1 w-full text-accent-danger hover:bg-accent-danger/10 transition-all micro-label btn-press"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-bg-2 grid-overlay">
        <div className="max-w-[640px] mx-auto py-12 px-6 md:px-10">
          {feedback && (
            <div
              role="alert"
              className={`mb-6 rounded-r2 border px-4 py-3 text-caption ${
                feedback.tone === 'error'
                  ? 'border-accent-danger/30 bg-accent-danger/10 text-accent-danger'
                  : feedback.tone === 'success'
                    ? 'border-accent-success/30 bg-accent-success/10 text-accent-success'
                    : 'border-primary/30 bg-primary/10 text-primary'
              }`}
            >
              {feedback.message}
            </div>
          )}

          {activeSection === 'account' && <AccountSection user={user} showFeedback={showFeedback} onOpenMfa={() => setActiveSection('mfa')} />}
          {activeSection === 'privacy' && <PrivacySection showFeedback={showFeedback} />}
          {activeSection === 'mfa' && <MFASection showFeedback={showFeedback} />}
          {activeSection === 'authorized' && <AuthorizedSection user={user} showFeedback={showFeedback} />}
          {activeSection === 'appearance' && (
            <AppearanceSection
              messageLayout={messageLayout}
              onToggleMessageLayout={onToggleMessageLayout}
              showFeedback={showFeedback}
            />
          )}
          {activeSection === 'notifications' && <NotificationSettings />}
          {activeSection === 'accessibility' && <AccessibilitySection />}
          {activeSection === 'mobile' && <MobileSection showFeedback={showFeedback} />}
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

const SettingsItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-r1 cursor-pointer transition-all border btn-press text-left w-full ${active ? 'bg-primary/10 border-primary/20 text-white shadow-inner' : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white'}`}
  >
    <div className={active ? 'text-primary' : ''}>{icon}</div>
    <span className="font-bold text-xs tracking-tight">{label}</span>
  </button>
);

const InfoField = ({
  label,
  value,
  onModify,
}: {
  label: string;
  value: string;
  onModify: () => void;
}) => (
  <div className="flex justify-between items-center py-3 border-b border-white/5 group gap-4">
    <div>
      <div className="micro-label text-white/20 mb-1">{label}</div>
      <div className="text-white font-medium text-sm break-all">{value}</div>
    </div>
    <button type="button" className="px-3 py-1 rounded-full bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary text-[10px] transition-all" onClick={onModify}>
      Modify
    </button>
  </div>
);

const AccountSection: React.FC<{ user: UserType; showFeedback: (tone: FeedbackTone, message: string) => void; onOpenMfa: () => void }> = ({ user, showFeedback, onOpenMfa }) => {
  const [profile, setProfile] = usePersistentState<AccountPreferences>(`harmolyn:settings:profile:${user.id}`, ACCOUNT_DEFAULTS(user));

  const updateProfile = (patch: Partial<AccountPreferences>) => {
    setProfile((current) => ({ ...current, ...patch }));
  };

  const modifyField = (field: keyof AccountPreferences, label: string) => {
    const currentValue = profile[field];
    const nextValue = window.prompt(`Update ${label}`, currentValue);
    if (nextValue === null) {
      return;
    }

    const trimmed = nextValue.trim();
    if (!trimmed) {
      showFeedback('error', `${label} cannot be empty.`);
      return;
    }

    if (field === 'identityLink' && !isValidIdentityLink(trimmed)) {
      showFeedback('error', 'Enter a valid identity link before saving.');
      return;
    }

    updateProfile({ [field]: trimmed } as Partial<AccountPreferences>);
    showFeedback('success', `${label} saved locally.`);
  };

  const editProfile = () => {
    const nextName = window.prompt('Display name', profile.displayName);
    if (nextName === null) {
      return;
    }

    const nextBio = window.prompt('Primary bio', profile.bio);
    if (nextBio === null) {
      return;
    }

    const trimmedName = nextName.trim();
    const trimmedBio = nextBio.trim();

    if (!trimmedName) {
      showFeedback('error', 'Display name cannot be empty.');
      return;
    }

    updateProfile({
      displayName: trimmedName,
      bio: trimmedBio || 'No status established.',
    });
    showFeedback('success', 'Profile updated locally.');
  };

  const replaceAvatar = () => {
    const nextAvatar = window.prompt('Avatar image URL', profile.avatarUrl);
    if (nextAvatar === null) {
      return;
    }

    const trimmed = nextAvatar.trim();
    if (!trimmed) {
      showFeedback('error', 'Avatar URL cannot be empty.');
      return;
    }

    if (!isValidImageUrl(trimmed)) {
      showFeedback('error', 'Enter a valid image URL or data URL for the avatar preview.');
      return;
    }

    updateProfile({ avatarUrl: trimmed });
    showFeedback('success', 'Avatar updated locally.');
  };

  return (
    <>
      <header className="mb-10">
        <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">MY // ACCOUNT</h2>
        <p className="micro-label text-white/30">OPERATOR // SECURITY // PROFILE</p>
      </header>

      <div className="glass-card rounded-r2 overflow-hidden mb-10 border border-white/10 shadow-2xl">
        <div className="h-[100px] bg-gradient-to-r from-primary/10 via-primary/5 to-accent-purple/10 relative">
          <div className="absolute inset-0 grid-overlay opacity-30" />
        </div>
        <div className="px-6 pb-6 -mt-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-5">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5">
            <button type="button" className="w-[100px] h-[100px] rounded-r2 border-[6px] border-bg-2 bg-bg-1 overflow-hidden relative group cursor-pointer shadow-xl p-0" onClick={replaceAvatar}>
              <img src={profile.avatarUrl || user.avatar} className="w-full h-full object-cover group-hover:opacity-40 transition-all duration-500" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 micro-label tracking-tighter">Replace</div>
            </button>
            <div className="mb-1.5 text-center md:text-left">
              <div className="text-xl font-bold text-white font-display leading-tight">{profile.displayName}</div>
              <div className="text-primary/60 font-mono text-[10px] tracking-widest mt-1 uppercase">ID // {user.id.toUpperCase()}</div>
            </div>
          </div>
          <button type="button" onClick={editProfile} className="bg-primary text-bg-0 px-5 py-2 rounded-full font-bold micro-label tracking-tight hover:shadow-glow hover:scale-105 transition-all">
            Edit Profile
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <InfoField label="Display Name" value={profile.displayName} onModify={() => modifyField('displayName', 'Display Name')} />
          <InfoField label="Identity Link" value={profile.identityLink} onModify={() => modifyField('identityLink', 'Identity Link')} />
          <InfoField label="Primary Bio" value={profile.bio} onModify={() => modifyField('bio', 'Primary Bio')} />
        </div>
      </div>

      <section className="space-y-5">
        <h3 className="micro-label text-white/40 border-b border-white/5 pb-2">Data encryption & authentication</h3>
        <button type="button" onClick={onOpenMfa} className="glass-card rounded-r2 p-5 flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer text-left w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:shadow-glow transition-all">
              <Shield size={18} />
            </div>
            <div>
              <div className="text-white font-bold mb-0.5 text-sm">Identity backup & recovery</div>
              <div className="text-[10px] text-white/40">Create an encrypted backup before you lose access to this device.</div>
            </div>
          </div>
          <ChevronRight size={18} className="text-white/20 group-hover:text-primary" />
        </button>
      </section>
    </>
  );
};

const PrivacySection: React.FC<{ showFeedback: (tone: FeedbackTone, message: string) => void }> = ({ showFeedback }) => {
  const [privacy, setPrivacy] = usePersistentState<PrivacyPreferences>('harmolyn:settings:privacy', PRIVACY_DEFAULTS);

  const toggle = (key: keyof PrivacyPreferences) => {
    setPrivacy((current) => ({ ...current, [key]: !current[key] }));
    showFeedback('success', 'Privacy preference saved locally.');
  };

  return (
    <>
      <header className="mb-10">
        <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">PRIVACY // SAFETY</h2>
        <p className="micro-label text-white/30">LOCAL // VISIBILITY // DISCOVERY</p>
      </header>

      <div className="space-y-3">
        <ToggleCard label="Show presence" desc="Expose online/offline state to peers" checked={privacy.showPresence} onToggle={() => toggle('showPresence')} />
        <ToggleCard label="Share read receipts" desc="Mark messages as read for the other side" checked={privacy.shareReadReceipts} onToggle={() => toggle('shareReadReceipts')} />
        <ToggleCard label="Allow discovery" desc="Show this account in local discovery surfaces" checked={privacy.allowDiscovery} onToggle={() => toggle('allowDiscovery')} />
      </div>
    </>
  );
};

const MFASection: React.FC<{ showFeedback: (tone: FeedbackTone, message: string) => void }> = ({ showFeedback }) => {
  const [totpEnabled, setTotpEnabled] = usePersistentState('harmolyn:settings:mfa:totp-enabled', false);
  const [backupCodes, setBackupCodes] = usePersistentState<string[]>('harmolyn:settings:mfa:backup-codes', []);
  const [showSetup, setShowSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [setupCode, setSetupCode] = useState('');

  const openSetup = () => {
    const nextCode = generateMfaSetupCode();
    setSetupCode(nextCode);
    setShowSetup(true);
    setVerificationCode('');
    showFeedback('info', 'Enter the preview code shown here to enable MFA locally.');
  };

  const verifyCode = () => {
    const entered = verificationCode.trim();

    if (!/^\d{6}$/.test(entered)) {
      showFeedback('error', 'Enter the 6-digit verification code shown in the setup preview.');
      return;
    }

    if (!setupCode || entered !== setupCode) {
      showFeedback('error', 'That verification code does not match the current setup preview.');
      return;
    }

    setTotpEnabled(true);
    setShowSetup(false);
    setVerificationCode('');
    showFeedback('success', 'MFA enabled locally for this browser.');
  };

  const registerPasskey = () => {
    showFeedback('info', 'Passkey enrollment is unavailable in the local preview because the xorein control API does not expose a WebAuthn registration endpoint.');
  };

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 8 }, () => generateBackupCode());
    setBackupCodes(codes);
    showFeedback('success', 'Generated 8 local backup codes.');
  };

  return (
    <>
      <header className="mb-10">
        <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">SECURITY // MFA</h2>
        <p className="micro-label text-white/30">MULTI-FACTOR // AUTHENTICATION // PROTOCOL</p>
      </header>

      <div className="space-y-5">
        <div className="glass-card rounded-r2 p-5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Smartphone size={18} />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Authenticator App (TOTP)</div>
                <div className="text-[10px] text-white/40">Use an authenticator app or the local preview code below</div>
              </div>
            </div>
            {totpEnabled ? (
              <span className="px-3 py-1 rounded-full bg-accent-success/15 text-accent-success micro-label border border-accent-success/20">ACTIVE</span>
            ) : (
              <button type="button" onClick={showSetup ? () => setShowSetup(false) : openSetup} className="px-4 py-2 rounded-full bg-primary text-bg-0 font-bold text-xs hover:shadow-glow transition-all">
                {showSetup ? 'Hide Setup' : 'Enable'}
              </button>
            )}
          </div>

          {showSetup && !totpEnabled && (
            <div className="border-t border-white/5 pt-5 space-y-4">
              <p className="text-caption text-white/50">Scan this QR code with your authenticator app:</p>
              <div className="w-40 h-40 mx-auto bg-white rounded-r1 flex items-center justify-center relative">
                <QrCode size={100} className="text-bg-0" />
                <div className="absolute -bottom-8 left-0 right-0 text-center text-[10px] text-white/40 font-mono tracking-[0.25em]">PREVIEW // {setupCode || '------'}</div>
              </div>
              <div className="space-y-1.5 pt-6">
                <label className="micro-label text-white/30">VERIFICATION CODE</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(event) => setVerificationCode(event.target.value)}
                    className="flex-1 h-12 px-5 rounded-full bg-surface-dark border border-white/10 text-white text-center font-mono text-lg tracking-[0.5em] placeholder:text-white/20 focus:border-primary/50 focus:outline-none"
                  />
                  <button type="button" onClick={verifyCode} className="px-5 h-12 rounded-full bg-primary text-bg-0 font-bold text-xs hover:shadow-glow transition-all">
                    Verify
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="glass-card rounded-r2 p-5 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-purple/10 flex items-center justify-center text-accent-purple">
                <Fingerprint size={18} />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Passkeys (WebAuthn)</div>
                <div className="text-[10px] text-white/40">Use biometrics or hardware security keys</div>
              </div>
            </div>
            <button type="button" onClick={registerPasskey} className="px-4 py-2 rounded-full border border-white/10 text-white/50 font-bold text-xs hover:border-primary/30 hover:text-primary transition-all">
              Register Key
            </button>
          </div>
        </div>

        <div className="glass-card rounded-r2 p-5 border border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-warning/10 flex items-center justify-center text-accent-warning">
                <Key size={18} />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Backup Codes</div>
                <div className="text-[10px] text-white/40">Emergency access codes (single-use)</div>
              </div>
            </div>
            <button type="button" onClick={generateBackupCodes} className="px-4 py-2 rounded-full border border-white/10 text-white/50 font-bold text-xs hover:border-primary/30 hover:text-primary transition-all">
              {backupCodes.length > 0 ? 'Regenerate' : 'Generate'}
            </button>
          </div>

          {backupCodes.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {backupCodes.map((code) => (
                <div key={code} className="rounded-r1 border border-white/10 bg-white/5 px-3 py-2 font-mono text-[11px] tracking-[0.18em] text-white/70">
                  {code}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const AuthorizedSection: React.FC<{ user: UserType; showFeedback: (tone: FeedbackTone, message: string) => void }> = ({ user, showFeedback }) => {
  const [authorizedPrefs, setAuthorizedPrefs] = usePersistentState<AuthorizedPreferences>('harmolyn:settings:authorized', AUTHORIZED_DEFAULTS);
  const authContext = readBrowserAuthContext();

  const toggleRememberBrowser = () => {
    setAuthorizedPrefs((current) => ({ ...current, rememberBrowser: !current.rememberBrowser }));
    showFeedback('success', 'Browser trust preference saved locally.');
  };

  const clearStoredControlTokens = () => {
    for (const key of AUTH_TOKEN_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    }

    showFeedback('success', 'Cleared stored control tokens from this browser.');
  };

  return (
    <>
      <header className="mb-10">
        <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">AUTHORIZED // HUBS</h2>
        <p className="micro-label text-white/30">LOCAL // TRUST // SESSION</p>
      </header>

      <div className="space-y-4">
        <div className="glass-card rounded-r2 p-5 border border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-white font-bold text-sm">Remember this browser</div>
              <div className="text-[10px] text-white/40">Keep local trust markers for this device only</div>
            </div>
            <button type="button" onClick={toggleRememberBrowser} className={`w-11 h-6 rounded-full transition-all relative ${authorizedPrefs.rememberBrowser ? 'bg-primary/30' : 'bg-white/10'}`}>
              <div className={`w-5 h-5 rounded-full absolute top-0.5 transition-all ${authorizedPrefs.rememberBrowser ? 'left-[22px] bg-primary' : 'left-0.5 bg-white/35'}`} />
            </button>
          </div>
        </div>

        <div className="glass-card rounded-r2 p-5 border border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-success/10 flex items-center justify-center text-accent-success">
              <Globe size={18} />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Current browser identity</div>
              <div className="text-[10px] text-white/40">{authContext.identityLabel}</div>
            </div>
          </div>

          <div className="text-[11px] text-white/50 leading-relaxed">
            Control token: {authContext.hasControlToken ? 'present' : 'missing'} · Control endpoint: {authContext.hasControlEndpoint ? 'available' : 'missing'}
          </div>

          <button type="button" onClick={clearStoredControlTokens} className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-white/50 hover:border-primary/30 hover:text-primary transition-all">
            Clear stored control tokens
          </button>
        </div>

        <div className="glass-card rounded-r2 p-5 border border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-white font-bold text-sm">{user.username} // hub access</div>
              <div className="text-[10px] text-white/40">No dedicated hub authorization screen exists in this preview yet.</div>
            </div>
            <ShieldAlert size={18} className="text-white/30" />
          </div>
        </div>
      </div>
    </>
  );
};

const AppearanceSection: React.FC<{
  messageLayout: MessageLayout;
  onToggleMessageLayout?: () => void;
  showFeedback: (tone: FeedbackTone, message: string) => void;
}> = ({ messageLayout, onToggleMessageLayout, showFeedback }) => {
  const handleToggleLayout = () => {
    if (!onToggleMessageLayout) {
      showFeedback('info', 'Message layout controls are unavailable in this browser session.');
      return;
    }

    onToggleMessageLayout();
    showFeedback('success', 'Message layout preference updated.');
  };

  return (
    <>
      <header className="mb-10">
        <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">CORE // APPEARANCE</h2>
        <p className="micro-label text-white/30">LAYOUT // SHELL // PREFERENCE</p>
      </header>

      <div className="space-y-4">
        <div className="glass-card rounded-r2 p-5 border border-white/10 flex items-center justify-between gap-4">
          <div>
            <div className="text-white font-bold text-sm">Message Layout</div>
            <div className="text-[10px] text-white/40">Cycles the chat timeline between the supported local layouts.</div>
          </div>
          <button type="button" onClick={handleToggleLayout} className="rounded-full bg-primary text-bg-0 px-4 py-2 font-bold text-xs hover:shadow-glow transition-all inline-flex items-center gap-2">
            <LayoutGrid size={14} />
            {messageLayout.toUpperCase()}
          </button>
        </div>

        <div className="glass-card rounded-r2 p-5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Settings size={18} />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Locally saved</div>
              <div className="text-[10px] text-white/40">This preference persists in the browser and is restored on refresh.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const AccessibilitySection: React.FC = () => {
  const [preferences, setPreferences] = usePersistentState<AccessibilityPreferences>('harmolyn:settings:accessibility', ACCESSIBILITY_DEFAULTS);
  const { perfMode, togglePerfMode } = usePerformanceMode();

  return (
    <>
      <header className="mb-10">
        <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">ACCESSIBILITY</h2>
        <p className="micro-label text-white/30">VISUAL // MOTION // INTERFACE // SETTINGS</p>
      </header>

      <div className="space-y-6">
        <section>
          <h3 className="micro-label text-white/40 border-b border-white/5 pb-2 mb-4">VISUAL</h3>
          <div className="space-y-3">
            <ToggleCard
              label="High Contrast Mode"
              desc="Increase contrast for better visibility"
              checked={preferences.highContrast}
              onToggle={() => setPreferences((current) => ({ ...current, highContrast: !current.highContrast }))}
            />

            <div className="glass-card rounded-r2 p-4 border border-white/10">
              <div className="mb-3">
                <div className="text-white font-bold text-sm">Color Saturation</div>
                <div className="text-[10px] text-white/40">Adjust color intensity ({preferences.saturation}%)</div>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                value={preferences.saturation}
                onChange={(event) => setPreferences((current) => ({ ...current, saturation: Number(event.target.value) }))}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="micro-label text-white/40 border-b border-white/5 pb-2 mb-4">PERFORMANCE</h3>
          <div className="glass-card rounded-r2 p-4 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${perfMode ? 'bg-accent-success/10 text-accent-success' : 'bg-primary/10 text-primary'}`}>
                <Zap size={18} />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Performance Mode</div>
                <div className="text-[10px] text-white/40">Disables blur, glows &amp; animations for low-end devices</div>
                {perfMode && <div className="text-[9px] text-accent-success/70 mt-0.5">Active — effects reduced</div>}
              </div>
            </div>
            <button type="button" onClick={togglePerfMode} className={`w-11 h-6 rounded-full transition-all relative ${perfMode ? 'bg-accent-success/30' : 'bg-white/10'}`}>
              <div className={`w-5 h-5 rounded-full absolute top-0.5 transition-all ${perfMode ? 'left-[22px] bg-accent-success' : 'left-0.5 bg-white/35'}`} />
            </button>
          </div>
        </section>

        <section>
          <h3 className="micro-label text-white/40 border-b border-white/5 pb-2 mb-4">MOTION</h3>
          <ToggleCard
            label="Reduce Motion"
            desc="Minimize animations and transitions"
            checked={preferences.reducedMotion}
            onToggle={() => setPreferences((current) => ({ ...current, reducedMotion: !current.reducedMotion }))}
          />
        </section>

        <section>
          <h3 className="micro-label text-white/40 border-b border-white/5 pb-2 mb-4">FONT SIZE</h3>
          <div className="flex gap-2">
            {FONT_SIZES.map((fontSize) => (
              <button
                key={fontSize.key}
                type="button"
                onClick={() => setPreferences((current) => ({ ...current, fontSize: fontSize.key }))}
                className={`flex-1 py-3 rounded-r2 text-center border transition-all ${preferences.fontSize === fontSize.key ? 'bg-primary/10 border-primary/20 text-primary' : 'border-white/5 text-white/40 hover:bg-white/5'}`}
              >
                <div className="font-bold" style={{ fontSize: fontSize.size }}>Aa</div>
                <div className="micro-label mt-1">{fontSize.label}</div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

const MobileSection: React.FC<{ showFeedback: (tone: FeedbackTone, message: string) => void }> = ({ showFeedback }) => {
  const authContext = readBrowserAuthContext();

  const copyStatus = async () => {
    const status = [
      `Identity: ${authContext.identityLabel}`,
      `Control endpoint: ${authContext.hasControlEndpoint ? 'available' : 'missing'}`,
      `Control token: ${authContext.hasControlToken ? 'present' : 'missing'}`,
      'Mobile pairing endpoint: unavailable in the local preview',
    ].join('\n');

    if (!navigator.clipboard?.writeText) {
      showFeedback('info', 'Clipboard access is unavailable in the local preview.');
      return;
    }

    try {
      await navigator.clipboard.writeText(status);
      showFeedback('success', 'Copied the mobile sync status for this browser.');
    } catch {
      showFeedback('info', 'Clipboard access is unavailable in the local preview.');
    }
  };

  return (
    <>
      <header className="mb-10">
        <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">MOBILE // SYNC</h2>
        <p className="micro-label text-white/30">PAIRING // PREVIEW // STATUS</p>
      </header>

      <div className="space-y-4">
        <div className="glass-card rounded-r2 p-5 border border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-white font-bold text-sm">Current browser status</div>
              <div className="text-[10px] text-white/40">{authContext.identityLabel}</div>
            </div>
            <ShieldAlert size={18} className="text-white/30" />
          </div>
          <div className="mt-3 text-[11px] text-white/50 leading-relaxed">
            Mobile pairing is not exposed by the local xorein control API yet, so this section only shows truthful preview state.
          </div>
        </div>

        <button type="button" onClick={copyStatus} className="w-full rounded-r2 border border-white/10 px-4 py-4 text-left flex items-center justify-between hover:border-primary/30 hover:bg-white/5 transition-all">
          <div>
            <div className="text-white font-bold text-sm">Copy sync status</div>
            <div className="text-[10px] text-white/40">Copies the current preview status to the clipboard</div>
          </div>
          <Copy size={16} className="text-white/30" />
        </button>
      </div>
    </>
  );
};

const ToggleCard: React.FC<{ label: string; desc: string; checked: boolean; onToggle: () => void }> = ({ label, desc, checked, onToggle }) => (
  <div className="glass-card rounded-r2 p-4 border border-white/10 flex items-center justify-between">
    <div>
      <div className="text-white font-bold text-sm">{label}</div>
      <div className="text-[10px] text-white/40">{desc}</div>
    </div>
    <button type="button" onClick={onToggle} className={`w-11 h-6 rounded-full transition-all relative ${checked ? 'bg-primary/30' : 'bg-white/10'}`} aria-pressed={checked} aria-label={label}>
      <div className={`w-5 h-5 rounded-full absolute top-0.5 transition-all ${checked ? 'left-[22px] bg-primary' : 'left-0.5 bg-white/35'}`} />
    </button>
  </div>
);

function isValidIdentityLink(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || /^https?:\/\//.test(value) || /^aether:\/\//.test(value);
}

function isValidImageUrl(value: string): boolean {
  if (/^data:image\//.test(value)) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function generateMfaSetupCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateBackupCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join(''));
  return segments.join('-');
}
