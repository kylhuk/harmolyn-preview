import React, { useEffect, useMemo, useState } from 'react';
import { X, Link, ArrowRight, Shield, Users, Loader2, AlertTriangle } from 'lucide-react';
import { previewServerByInvite, type XoreinServerPreview } from '@/lib/xoreinControl';
import type { XoreinRuntimeSnapshot } from '@/types';

interface JoinServerModalProps {
  onClose: () => void;
  onJoin: (inviteCode: string) => Promise<void>;
  initialValue?: string;
  runtimeSnapshot?: XoreinRuntimeSnapshot | null;
}

export const JoinServerModal: React.FC<JoinServerModalProps> = ({ onClose, onJoin, initialValue = '', runtimeSnapshot = null }) => {
  const [inviteLink, setInviteLink] = useState(initialValue);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<XoreinServerPreview | null>(null);

  const previewSummary = useMemo(() => {
    if (!preview) {
      return null;
    }
    return {
      name: preview.manifest.name,
      members: preview.member_count ?? 0,
      icon: preview.manifest.name.slice(0, 1).toUpperCase(),
      description: preview.manifest.description?.trim() || 'Signed xorein invite preview.',
    };
  }, [preview]);

  useEffect(() => {
    const trimmed = inviteLink.trim();
    if (!trimmed) {
      setPreview(null);
      setPreviewLoading(false);
      setError('');
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const nextPreview = await previewServerByInvite(runtimeSnapshot, trimmed);
        if (cancelled) {
          return;
        }
        setPreview(nextPreview);
        setError('');
      } catch (nextError) {
        if (cancelled) {
          return;
        }
        setPreview(null);
        setError(nextError instanceof Error ? nextError.message : 'Unable to preview invite.');
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [inviteLink, runtimeSnapshot]);

  const handleJoin = async () => {
    if (!inviteLink.trim()) return;
    setJoining(true);
    setError('');
    try {
      await onJoin(inviteLink.trim());
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to join server.');
    } finally {
      setJoining(false);
    }
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
                onChange={e => setInviteLink(e.target.value)}
                placeholder="aether://join/server-id?invite=..."
                className="w-full h-14 pl-11 pr-5 rounded-full bg-surface-dark border border-stroke-subtle text-text-primary text-body placeholder:text-text-disabled focus:border-stroke-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Preview */}
          {previewLoading && !preview && (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={20} className="text-primary animate-spin" />
            </div>
          )}

          {previewSummary && (
            <div className="glass-card rounded-r2 p-4 border border-stroke-primary mb-5 flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-200">
              <div className="w-12 h-12 rounded-r2 bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl">
                {previewSummary.icon}
              </div>
              <div className="flex-1">
                <div className="text-body-strong text-text-primary">{previewSummary.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-accent-success" />
                  <span className="text-caption text-text-secondary">{previewSummary.members.toLocaleString()} members</span>
                </div>
                <div className="text-caption text-text-tertiary mt-1">{previewSummary.description}</div>
              </div>
              <Shield size={16} className="text-primary/40" />
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-r2 border border-accent-danger/20 bg-accent-danger/10 px-3 py-2 text-caption text-accent-danger flex items-start gap-2" role="alert">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Examples */}
          <div className="mb-6">
            <div className="micro-label text-text-disabled mb-2">INVITE FORMATS</div>
            <div className="space-y-1 text-caption text-text-tertiary font-mono">
              <div>aether://join/cyber-devs?invite=&lt;signed-payload&gt;</div>
              <div>aether://join/private-lab?invite=&lt;signed-payload&gt;</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="h-12 px-5 rounded-full border border-stroke-subtle text-text-secondary text-body-strong hover:bg-white/5 transition-all">
              Cancel
            </button>
            <button
              onClick={() => void handleJoin()}
              disabled={!inviteLink.trim() || previewLoading || joining || !preview}
              className="h-12 px-6 rounded-full bg-primary text-bg-0 font-bold text-body-strong flex items-center gap-2 hover:shadow-glow transition-all disabled:opacity-40"
            >
              {joining ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              Join Server
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
