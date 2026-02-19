import React from 'react';
import { X, User, Shield, Key, Bell, Monitor, Gift, LogOut, ChevronRight, Laptop, Smartphone, Eye } from 'lucide-react';
import { User as UserType } from '@/types';

interface SettingsScreenProps {
  user: UserType;
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ user, onClose }) => {
  return (
    <div className="absolute inset-0 z-[100] bg-bg-0 flex flex-col md:flex-row text-white/70 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex w-[280px] bg-bg-1 flex-col items-end py-12 px-6 border-r border-white/5">
         <div className="w-full space-y-2">
             <div className="micro-label text-white/20 px-3 mb-4">User settings</div>
             <SettingsItem icon={<User size={18} />} label="My Account" active />
             <SettingsItem icon={<Shield size={18} />} label="Privacy & Safety" />
             <SettingsItem icon={<Key size={18} />} label="Authorized Hubs" />
             
             <div className="h-8"></div>
             <div className="micro-label text-white/20 px-3 mb-4">System configuration</div>
             <SettingsItem icon={<Monitor size={18} />} label="Core Appearance" />
             <SettingsItem icon={<Bell size={18} />} label="Signal Alerts" />
             <SettingsItem icon={<Smartphone size={18} />} label="Mobile Sync" />
             
             <div className="h-8"></div>
             <div className="border-t border-white/5 my-4 mx-3"></div>
             <button className="flex items-center gap-3 px-3 py-2.5 rounded-r1 w-full text-accent-danger hover:bg-accent-danger/10 transition-all micro-label">
                <LogOut size={18} />
                <span>Log Out</span>
             </button>
         </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-bg-2 grid-overlay">
          <div className="max-w-[800px] mx-auto py-16 px-8 md:px-12">
              <header className="mb-12">
                  <h2 className="text-[32px] font-bold text-white mb-2 font-display tracking-tight">MY // ACCOUNT</h2>
                  <p className="micro-label text-white/30">OPERATOR // SECURITY // PROFILE</p>
              </header>
              
              <div className="glass-card rounded-r2 overflow-hidden mb-12 border border-white/10 shadow-2xl">
                  <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-accent-purple/10 relative">
                      <div className="absolute inset-0 grid-overlay opacity-30"></div>
                  </div>
                  <div className="px-8 pb-8 -mt-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                      <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                          <div className="w-32 h-32 rounded-r2 border-[8px] border-bg-2 bg-bg-1 overflow-hidden relative group cursor-pointer shadow-xl">
                              <img src={user.avatar} className="w-full h-full object-cover group-hover:opacity-40 transition-all duration-500" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 micro-label tracking-tighter">Replace</div>
                          </div>
                          <div className="mb-2 text-center md:text-left">
                              <div className="text-[28px] font-bold text-white font-display leading-tight">{user.username}</div>
                              <div className="text-primary/60 font-mono text-xs tracking-widest mt-1 uppercase">ID // {user.id.toUpperCase()}</div>
                          </div>
                      </div>
                      <button className="bg-primary text-bg-0 px-6 py-2.5 rounded-full font-bold micro-label tracking-tight hover:shadow-glow hover:scale-105 transition-all">Edit Profile</button>
                  </div>
                  
                  <div className="px-8 py-6 space-y-6">
                      <InfoField label="Display Name" value={user.username} />
                      <InfoField label="Identity Link" value="neo@nexus-underground.net" />
                      <InfoField label="Primary Bio" value={user.bio || 'No status established.'} />
                  </div>
              </div>

              <section className="space-y-6">
                  <h3 className="micro-label text-white/40 border-b border-white/5 pb-2">Data encryption & authentication</h3>
                  <div className="glass-card rounded-r2 p-6 flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:shadow-glow transition-all">
                              <Shield size={22} />
                          </div>
                          <div>
                              <div className="text-white font-bold mb-0.5">Two-Factor Authentication</div>
                              <div className="text-xs text-white/40">Secure your account with an extra layer of protection.</div>
                          </div>
                      </div>
                      <ChevronRight size={20} className="text-white/20 group-hover:text-primary" />
                  </div>
              </section>
          </div>
      </div>

      {/* Close Button / ESC */}
      <div className="absolute top-8 right-8 flex flex-col items-center gap-2 group cursor-pointer z-[110]" onClick={onClose}>
          <div className="w-12 h-12 rounded-full border border-white/10 glass-panel flex items-center justify-center group-hover:border-primary group-hover:shadow-glow transition-all">
              <X size={24} className="text-white group-hover:text-primary" />
          </div>
          <span className="micro-label text-[8px] text-white/20 group-hover:text-white">ESC</span>
      </div>
    </div>
  );
};

const SettingsItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-r1 cursor-pointer transition-all border ${active ? 'bg-primary/10 border-primary/20 text-white shadow-inner' : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white'}`}>
        <div className={active ? 'text-primary' : ''}>{icon}</div>
        <span className="font-bold text-sm tracking-tight">{label}</span>
    </div>
)

const InfoField = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between items-center py-4 border-b border-white/5 group">
        <div>
            <div className="micro-label text-white/20 mb-1">{label}</div>
            <div className="text-white font-medium">{value}</div>
        </div>
        <button className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary text-xs transition-all">Modify</button>
    </div>
)
