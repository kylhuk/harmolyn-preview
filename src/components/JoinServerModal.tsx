import React, { useState } from 'react';
import { X, Link, ArrowRight, Shield, Users, Loader2 } from 'lucide-react';

interface JoinServerModalProps {
  onClose: () => void;
  onJoin?: (inviteCode: string) => void;
}

export const JoinServerModal: React.FC<JoinServerModalProps> = ({ onClose, onJoin }) => {
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<{ name: string; members: number; icon: string } | null>(null);

  const handlePaste = (value: string) => {
    setInviteLink(value);
    setError('');
    // Simulate invite link resolution
    if (value.includes('harmolyn.gg/') || value.length > 5) {
      setLoading(true);
      setTimeout(() => {
        setPreview({ name: 'Cyber Collective', members: 1247, icon: '🌐' });
        setLoading(false);
      }, 800);
    } else {
      setPreview(null);
    }
  };

  const handleJoin = () => {
    if (!inviteLink.trim()) return;
    setLoading(true);
    setTimeout(() => {
      onJoin?.(inviteLink);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] mx-6 glass-card rounded-r3 border border-stroke overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-title font-semibold text-text-primary">JOIN // SERVER</h2>
              <p className="text-caption text-text-tertiary mt-1">Enter an invite link to connect to a server</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full glass-panel border border-stroke-subtle flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary transition-all">
              <X size={16} />
            </button>
          </div>

          {/* Input */}
          <div className="space-y-1.5 mb-5">
            <label className="micro-label text-text-tertiary">INVITE LINK</label>
            <div className="relative">
              <Link size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50" />
              <input
                type="text"
                value={inviteLink}
                onChange={e => handlePaste(e.target.value)}
                placeholder="harmolyn.gg/abc123 or invite code"
                className="w-full h-14 pl-11 pr-5 rounded-full bg-surface-dark border border-stroke-subtle text-text-primary text-body placeholder:text-text-disabled focus:border-stroke-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Preview */}
          {loading && !preview && (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={20} className="text-primary animate-spin" />
            </div>
          )}

          {preview && (
            <div className="glass-card rounded-r2 p-4 border border-stroke-primary mb-5 flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-200">
              <div className="w-12 h-12 rounded-r2 bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl">
                {preview.icon}
              </div>
              <div className="flex-1">
                <div className="text-body-strong text-text-primary">{preview.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-accent-success" />
                  <span className="text-caption text-text-secondary">{preview.members.toLocaleString()} members</span>
                </div>
              </div>
              <Shield size={16} className="text-primary/40" />
            </div>
          )}

          {error && (
            <div className="text-caption text-accent-danger mb-4 px-2">{error}</div>
          )}

          {/* Examples */}
          <div className="mb-6">
            <div className="micro-label text-text-disabled mb-2">INVITE FORMATS</div>
            <div className="space-y-1 text-caption text-text-tertiary font-mono">
              <div>harmolyn.gg/hN7bQm3p</div>
              <div>harmolyn.gg/cyber-devs</div>
              <div>hN7bQm3p</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="h-12 px-5 rounded-full border border-stroke-subtle text-text-secondary text-body-strong hover:bg-white/5 transition-all">
              Cancel
            </button>
            <button
              onClick={handleJoin}
              disabled={!inviteLink.trim() || loading}
              className="h-12 px-6 rounded-full bg-primary text-bg-0 font-bold text-body-strong flex items-center gap-2 hover:shadow-glow transition-all disabled:opacity-40"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              Join Server
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
