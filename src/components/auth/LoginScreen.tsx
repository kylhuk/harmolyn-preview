import React, { useState } from 'react';
import { Eye, EyeOff, QrCode, ArrowRight, Shield, Fingerprint } from 'lucide-react';
import { describeQrAuthUnsupportedState, readBrowserAuthContext, submitCredentialLogin } from '@/lib/authPreview';

interface LoginScreenProps {
  onLogin: () => void;
  onSwitchToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'error' | 'info'; message: string } | null>(null);
  const authContext = readBrowserAuthContext();
  const qrStatus = describeQrAuthUnsupportedState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    const result = submitCredentialLogin({ email, password });
    setLoading(false);
    if (result.ok) {
      onLogin();
      return;
    }
    setFeedback({ tone: result.code === 'invalid' ? 'error' : 'info', message: result.message });
  };

  return (
    <div className="fixed inset-0 z-[200] bg-bg-0 flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-0 via-bg-2 to-bg-0" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(19,221,236,0.08) 0%, transparent 60%)' }} />
      <div className="absolute inset-0 grid-overlay opacity-30" />

      <div className="relative z-10 w-full max-w-[440px] mx-6">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-r2 bg-primary/10 border border-primary/20 mb-5 shadow-glow">
            <Shield size={28} className="text-primary" />
          </div>
          <h1 className="text-display-l font-bold text-text-primary font-display tracking-tight">HARMOLYN</h1>
          <p className="micro-label text-text-tertiary mt-2">SECURE // DECENTRALIZED // ENCRYPTED</p>
        </div>

        {showQR ? (
          /* QR Login Tab */
          <div className="glass-card rounded-r3 p-8 border border-stroke text-center">
            <h2 className="text-title font-semibold text-text-primary mb-2">QR // AUTHENTICATION</h2>
            <p className="text-body text-text-secondary mb-3">Scan with your Harmolyn mobile app to authenticate.</p>
            <p className="text-caption text-text-tertiary mb-6">{qrStatus}</p>
            
            <div className="w-48 h-48 mx-auto bg-surface-dark rounded-r2 border border-stroke-strong flex items-center justify-center mb-6 relative overflow-hidden">
              <QrCode size={120} className="text-primary/30" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              {/* Scanning animation */}
              <div className="absolute left-0 right-0 h-0.5 bg-primary/50 animate-pulse top-1/2" />
            </div>

            <div className="flex items-center gap-2 justify-center text-text-tertiary mb-6">
              <Fingerprint size={14} className="text-primary" />
              <span className="text-caption">Pairing endpoint pending in the local control API</span>
            </div>

            <button
              onClick={() => setShowQR(false)}
              className="text-primary text-body-strong hover:underline"
            >
              Log in with credentials instead
            </button>
          </div>
        ) : (
          /* Credential Login */
          <form noValidate onSubmit={handleSubmit} className="glass-card rounded-r3 p-8 border border-stroke space-y-5">
            <div className="text-center mb-2">
              <h2 className="text-title font-semibold text-text-primary">AUTHENTICATE // NODE</h2>
              <p className="text-caption text-text-tertiary mt-1">Enter your credentials to access the network</p>
              <p className="text-micro text-text-disabled mt-2 uppercase tracking-[0.18em]">
                {authContext.hasRuntimeIdentity
                  ? `Detected local identity // ${authContext.identityLabel}`
                  : 'No local xorein identity detected in this browser session'}
              </p>
            </div>

            {feedback && (
              <div
                role="alert"
                className={`rounded-r2 border px-4 py-3 text-caption ${feedback.tone === 'error' ? 'border-accent-danger/30 bg-accent-danger/10 text-accent-danger' : 'border-primary/30 bg-primary/10 text-primary'}`}
              >
                {feedback.message}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="micro-label text-text-tertiary">IDENTITY LINK</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="operator@harmolyn.net"
                className="w-full h-14 px-5 rounded-full bg-surface-dark border border-stroke-subtle text-text-primary text-body placeholder:text-text-disabled focus:border-stroke-primary focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="micro-label text-text-tertiary">ACCESS KEY</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-14 px-5 pr-12 rounded-full bg-surface-dark border border-stroke-subtle text-text-primary text-body placeholder:text-text-disabled focus:border-stroke-primary focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="w-4 h-4 rounded border border-stroke-subtle bg-surface-dark" />
                <span className="text-caption text-text-secondary">Remember node</span>
              </label>
              <button
                type="button"
                onClick={() => setFeedback({ tone: 'info', message: 'Access-key reset is unsupported in this preview because the local xorein control API does not expose account recovery endpoints.' })}
                className="text-caption text-primary hover:underline"
              >
                Reset access key
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-full bg-primary text-bg-0 font-bold text-body-strong flex items-center justify-center gap-2 hover:shadow-glow transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-bg-0/30 border-t-bg-0 rounded-full animate-spin" />
              ) : (
                <>
                  ESTABLISH CONNECTION
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-px bg-stroke-subtle" />
              <span className="text-micro text-text-disabled uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-stroke-subtle" />
            </div>

            <button
              type="button"
              onClick={() => setShowQR(true)}
              className="w-full h-12 rounded-full border border-stroke-primary text-primary font-bold text-body-strong flex items-center justify-center gap-2 hover:bg-primary/5 transition-all"
            >
              <QrCode size={18} />
              QR Authentication
            </button>

            <p className="text-center text-caption text-text-tertiary mt-4">
              No node identity?{' '}
              <button type="button" onClick={onSwitchToRegister} className="text-primary hover:underline font-semibold">
                Register
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
