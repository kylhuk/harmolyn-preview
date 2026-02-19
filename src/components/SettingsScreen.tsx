import React, { useState } from 'react';
import { X, User, Shield, Key, Bell, Monitor, LogOut, ChevronRight, Smartphone, Lock, Fingerprint, QrCode, Eye, Command, Accessibility, Crown, ShoppingBag, Trophy } from 'lucide-react';
import { User as UserType } from '@/types';
import { NotificationSettings } from '@/components/NotificationSettings';
import { useFeature } from '@/hooks/useFeature';

interface SettingsScreenProps {
  user: UserType;
  onClose: () => void;
  onOpenNitro?: () => void;
  onOpenShop?: () => void;
  onOpenQuests?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ user, onClose, onOpenNitro, onOpenShop, onOpenQuests }) => {
  const [activeSection, setActiveSection] = useState('account');
  const hasNitro = useFeature('nitro');
  const hasShop = useFeature('shop');
  const hasQuests = useFeature('quests');

  return (
    <div className="absolute inset-0 z-[100] bg-bg-0 flex flex-col md:flex-row text-white/70 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex w-[224px] bg-bg-1 flex-col items-end py-10 px-5 border-r border-white/5">
         <div className="w-full space-y-1.5">
             <div className="micro-label text-white/20 px-3 mb-3">User settings</div>
             <SettingsItem icon={<User size={16} />} label="My Account" active={activeSection === 'account'} onClick={() => setActiveSection('account')} />
             <SettingsItem icon={<Shield size={16} />} label="Privacy & Safety" active={activeSection === 'privacy'} onClick={() => setActiveSection('privacy')} />
             <SettingsItem icon={<Lock size={16} />} label="Security (MFA)" active={activeSection === 'mfa'} onClick={() => setActiveSection('mfa')} />
             <SettingsItem icon={<Key size={16} />} label="Authorized Hubs" active={activeSection === 'authorized'} onClick={() => setActiveSection('authorized')} />
             
             <div className="h-6"></div>
             <div className="micro-label text-white/20 px-3 mb-3">System configuration</div>
             <SettingsItem icon={<Monitor size={16} />} label="Core Appearance" active={activeSection === 'appearance'} onClick={() => setActiveSection('appearance')} />
             <SettingsItem icon={<Bell size={16} />} label="Signal Alerts" active={activeSection === 'notifications'} onClick={() => setActiveSection('notifications')} />
             <SettingsItem icon={<Accessibility size={16} />} label="Accessibility" active={activeSection === 'accessibility'} onClick={() => setActiveSection('accessibility')} />
             <SettingsItem icon={<Smartphone size={16} />} label="Mobile Sync" active={activeSection === 'mobile'} onClick={() => setActiveSection('mobile')} />
              
              <div className="h-6"></div>
              <div className="micro-label text-white/20 px-3 mb-3">Premium</div>
              {hasNitro && <SettingsItem icon={<Crown size={16} />} label="Harmolyn Nitro" active={false} onClick={onOpenNitro} />}
              {hasShop && <SettingsItem icon={<ShoppingBag size={16} />} label="Shop" active={false} onClick={onOpenShop} />}
              {hasQuests && <SettingsItem icon={<Trophy size={16} />} label="Quests" active={false} onClick={onOpenQuests} />}

              <div className="h-6"></div>
              <div className="border-t border-white/5 my-3 mx-3"></div>
              <button className="flex items-center gap-2.5 px-3 py-2 rounded-r1 w-full text-accent-danger hover:bg-accent-danger/10 transition-all micro-label">
                 <LogOut size={16} />
                 <span>Log Out</span>
              </button>
         </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-bg-2 grid-overlay">
          <div className="max-w-[640px] mx-auto py-12 px-6 md:px-10">
              {activeSection === 'account' && <AccountSection user={user} />}
              {activeSection === 'mfa' && <MFASection />}
              {activeSection === 'notifications' && <NotificationSettings />}
              {activeSection === 'accessibility' && <AccessibilitySection />}
          </div>
      </div>

      {/* Close Button / ESC */}
      <div className="absolute top-6 right-6 flex flex-col items-center gap-1.5 group cursor-pointer z-[110]" onClick={onClose}>
          <div className="w-10 h-10 rounded-full border border-white/10 glass-panel flex items-center justify-center group-hover:border-primary group-hover:shadow-glow transition-all">
              <X size={20} className="text-white group-hover:text-primary" />
          </div>
          <span className="micro-label text-[7px] text-white/20 group-hover:text-white">ESC</span>
      </div>
    </div>
  );
};

const SettingsItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
    <div onClick={onClick} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-r1 cursor-pointer transition-all border ${active ? 'bg-primary/10 border-primary/20 text-white shadow-inner' : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white'}`}>
        <div className={active ? 'text-primary' : ''}>{icon}</div>
        <span className="font-bold text-xs tracking-tight">{label}</span>
    </div>
);

const InfoField = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between items-center py-3 border-b border-white/5 group">
        <div>
            <div className="micro-label text-white/20 mb-1">{label}</div>
            <div className="text-white font-medium text-sm">{value}</div>
        </div>
        <button className="px-3 py-1 rounded-full bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary text-[10px] transition-all">Modify</button>
    </div>
);

const AccountSection: React.FC<{ user: UserType }> = ({ user }) => (
  <>
    <header className="mb-10">
        <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">MY // ACCOUNT</h2>
        <p className="micro-label text-white/30">OPERATOR // SECURITY // PROFILE</p>
    </header>
    
    <div className="glass-card rounded-r2 overflow-hidden mb-10 border border-white/10 shadow-2xl">
        <div className="h-[100px] bg-gradient-to-r from-primary/10 via-primary/5 to-accent-purple/10 relative">
            <div className="absolute inset-0 grid-overlay opacity-30"></div>
        </div>
        <div className="px-6 pb-6 -mt-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-5">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-5">
                <div className="w-[100px] h-[100px] rounded-r2 border-[6px] border-bg-2 bg-bg-1 overflow-hidden relative group cursor-pointer shadow-xl">
                    <img src={user.avatar} className="w-full h-full object-cover group-hover:opacity-40 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 micro-label tracking-tighter">Replace</div>
                </div>
                <div className="mb-1.5 text-center md:text-left">
                    <div className="text-xl font-bold text-white font-display leading-tight">{user.username}</div>
                    <div className="text-primary/60 font-mono text-[10px] tracking-widest mt-1 uppercase">ID // {user.id.toUpperCase()}</div>
                </div>
            </div>
            <button className="bg-primary text-bg-0 px-5 py-2 rounded-full font-bold micro-label tracking-tight hover:shadow-glow hover:scale-105 transition-all">Edit Profile</button>
        </div>
        
        <div className="px-6 py-5 space-y-5">
            <InfoField label="Display Name" value={user.username} />
            <InfoField label="Identity Link" value="neo@nexus-underground.net" />
            <InfoField label="Primary Bio" value={user.bio || 'No status established.'} />
        </div>
    </div>

    <section className="space-y-5">
        <h3 className="micro-label text-white/40 border-b border-white/5 pb-2">Data encryption & authentication</h3>
        <div className="glass-card rounded-r2 p-5 flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:shadow-glow transition-all">
                    <Shield size={18} />
                </div>
                <div>
                    <div className="text-white font-bold mb-0.5 text-sm">Two-Factor Authentication</div>
                    <div className="text-[10px] text-white/40">Secure your account with an extra layer of protection.</div>
                </div>
            </div>
            <ChevronRight size={18} className="text-white/20 group-hover:text-primary" />
        </div>
    </section>
  </>
);

const MFASection: React.FC = () => {
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  return (
    <>
      <header className="mb-10">
        <h2 className="text-[26px] font-bold text-white mb-2 font-display tracking-tight">SECURITY // MFA</h2>
        <p className="micro-label text-white/30">MULTI-FACTOR // AUTHENTICATION // PROTOCOL</p>
      </header>

      <div className="space-y-5">
        {/* TOTP */}
        <div className="glass-card rounded-r2 p-5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Smartphone size={18} />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Authenticator App (TOTP)</div>
                <div className="text-[10px] text-white/40">Use an app like Google Authenticator or Authy</div>
              </div>
            </div>
            {totpEnabled ? (
              <span className="px-3 py-1 rounded-full bg-accent-success/15 text-accent-success micro-label border border-accent-success/20">ACTIVE</span>
            ) : (
              <button
                onClick={() => setShowSetup(!showSetup)}
                className="px-4 py-2 rounded-full bg-primary text-bg-0 font-bold text-xs hover:shadow-glow transition-all"
              >
                Enable
              </button>
            )}
          </div>

          {showSetup && !totpEnabled && (
            <div className="border-t border-white/5 pt-5 space-y-4">
              <p className="text-caption text-white/50">Scan this QR code with your authenticator app:</p>
              <div className="w-40 h-40 mx-auto bg-white rounded-r1 flex items-center justify-center">
                <QrCode size={100} className="text-bg-0" />
              </div>
              <div className="space-y-1.5">
                <label className="micro-label text-white/30">VERIFICATION CODE</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    className="flex-1 h-12 px-5 rounded-full bg-surface-dark border border-white/10 text-white text-center font-mono text-lg tracking-[0.5em] placeholder:text-white/20 focus:border-primary/50 focus:outline-none"
                  />
                  <button
                    onClick={() => { setTotpEnabled(true); setShowSetup(false); }}
                    className="px-5 h-12 rounded-full bg-primary text-bg-0 font-bold text-xs hover:shadow-glow transition-all"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Passkeys */}
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
            <button className="px-4 py-2 rounded-full border border-white/10 text-white/50 font-bold text-xs hover:border-primary/30 hover:text-primary transition-all">
              Register Key
            </button>
          </div>
        </div>

        {/* Backup Codes */}
        <div className="glass-card rounded-r2 p-5 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-warning/10 flex items-center justify-center text-accent-warning">
                <Key size={18} />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Backup Codes</div>
                <div className="text-[10px] text-white/40">Emergency access codes (single-use)</div>
              </div>
            </div>
            <button className="px-4 py-2 rounded-full border border-white/10 text-white/50 font-bold text-xs hover:border-primary/30 hover:text-primary transition-all">
              Generate
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const AccessibilitySection: React.FC = () => {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'default' | 'large' | 'xlarge'>('default');
  const [saturation, setSaturation] = useState(100);

  const fontSizes = [
    { key: 'small' as const, label: 'SMALL', size: '13px' },
    { key: 'default' as const, label: 'DEFAULT', size: '15px' },
    { key: 'large' as const, label: 'LARGE', size: '17px' },
    { key: 'xlarge' as const, label: 'X-LARGE', size: '19px' },
  ];

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
            <div className="glass-card rounded-r2 p-4 border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-white font-bold text-sm">High Contrast Mode</div>
                <div className="text-[10px] text-white/40">Increase contrast for better visibility</div>
              </div>
              <button onClick={() => setHighContrast(!highContrast)} className={`w-11 h-6 rounded-full transition-all relative ${highContrast ? 'bg-primary/30' : 'bg-white/10'}`}>
                <div className={`w-5 h-5 rounded-full absolute top-0.5 transition-all ${highContrast ? 'left-[22px] bg-primary' : 'left-0.5 bg-white/35'}`} />
              </button>
            </div>

            <div className="glass-card rounded-r2 p-4 border border-white/10">
              <div className="mb-3">
                <div className="text-white font-bold text-sm">Color Saturation</div>
                <div className="text-[10px] text-white/40">Adjust color intensity ({saturation}%)</div>
              </div>
              <input type="range" min={0} max={200} value={saturation} onChange={e => setSaturation(Number(e.target.value))} className="w-full accent-primary" />
            </div>
          </div>
        </section>

        <section>
          <h3 className="micro-label text-white/40 border-b border-white/5 pb-2 mb-4">MOTION</h3>
          <div className="glass-card rounded-r2 p-4 border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-white font-bold text-sm">Reduce Motion</div>
              <div className="text-[10px] text-white/40">Minimize animations and transitions</div>
            </div>
            <button onClick={() => setReducedMotion(!reducedMotion)} className={`w-11 h-6 rounded-full transition-all relative ${reducedMotion ? 'bg-primary/30' : 'bg-white/10'}`}>
              <div className={`w-5 h-5 rounded-full absolute top-0.5 transition-all ${reducedMotion ? 'left-[22px] bg-primary' : 'left-0.5 bg-white/35'}`} />
            </button>
          </div>
        </section>

        <section>
          <h3 className="micro-label text-white/40 border-b border-white/5 pb-2 mb-4">FONT SIZE</h3>
          <div className="flex gap-2">
            {fontSizes.map(fs => (
              <button key={fs.key} onClick={() => setFontSize(fs.key)} className={`flex-1 py-3 rounded-r2 text-center border transition-all ${fontSize === fs.key ? 'bg-primary/10 border-primary/20 text-primary' : 'border-white/5 text-white/40 hover:bg-white/5'}`}>
                <div className="font-bold" style={{ fontSize: fs.size }}>Aa</div>
                <div className="micro-label mt-1">{fs.label}</div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};
