import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Shield, Check } from 'lucide-react';

interface RegisterScreenProps {
  onRegister: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const passwordStrength = (() => {
    if (password.length === 0) return { label: '', color: '', width: '0%' };
    if (password.length < 6) return { label: 'WEAK', color: 'text-accent-danger', width: '25%' };
    if (password.length < 10) return { label: 'MODERATE', color: 'text-accent-warning', width: '50%' };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password))
      return { label: 'STRONG', color: 'text-accent-success', width: '100%' };
    return { label: 'GOOD', color: 'text-primary', width: '75%' };
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || password !== confirmPassword) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onRegister();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-bg-0 flex items-center justify-center overflow-auto">
      <div className="absolute inset-0 bg-gradient-to-b from-bg-0 via-bg-2 to-bg-0" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(19,221,236,0.08) 0%, transparent 60%)' }} />
      <div className="absolute inset-0 grid-overlay opacity-30" />

      <div className="relative z-10 w-full max-w-[440px] mx-6 my-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-r2 bg-primary/10 border border-primary/20 mb-4 shadow-glow">
            <Shield size={24} className="text-primary" />
          </div>
          <h1 className="text-display-l font-bold text-text-primary font-display tracking-tight">CREATE NODE</h1>
          <p className="micro-label text-text-tertiary mt-2">INITIALIZE // IDENTITY // PROTOCOL</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-r3 p-8 border border-stroke space-y-4">
          <div className="space-y-1.5">
            <label className="micro-label text-text-tertiary">OPERATOR ALIAS</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="neo_runner"
              className="w-full h-14 px-5 rounded-full bg-surface-dark border border-stroke-subtle text-text-primary text-body placeholder:text-text-disabled focus:border-stroke-primary focus:outline-none transition-colors"
            />
          </div>

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
            {password.length > 0 && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1 bg-surface-dark rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: passwordStrength.width }} />
                </div>
                <span className={`text-micro ${passwordStrength.color}`}>{passwordStrength.label}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="micro-label text-text-tertiary">CONFIRM ACCESS KEY</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className={`w-full h-14 px-5 rounded-full bg-surface-dark border text-text-primary text-body placeholder:text-text-disabled focus:outline-none transition-colors ${
                confirmPassword && confirmPassword !== password ? 'border-accent-danger focus:border-accent-danger' : 'border-stroke-subtle focus:border-stroke-primary'
              }`}
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer pt-2">
            <button
              type="button"
              onClick={() => setAgreed(!agreed)}
              className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-all mt-0.5 ${
                agreed ? 'bg-primary border-primary text-bg-0' : 'border-stroke-subtle bg-surface-dark'
              }`}
            >
              {agreed && <Check size={12} />}
            </button>
            <span className="text-caption text-text-secondary leading-relaxed">
              I accept the <span className="text-primary cursor-pointer hover:underline">Terms of Service</span> and{' '}
              <span className="text-primary cursor-pointer hover:underline">Privacy Protocol</span>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || !agreed}
            className="w-full h-14 rounded-full bg-primary text-bg-0 font-bold text-body-strong flex items-center justify-center gap-2 hover:shadow-glow transition-all disabled:opacity-40 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-bg-0/30 border-t-bg-0 rounded-full animate-spin" />
            ) : (
              <>
                INITIALIZE NODE
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <p className="text-center text-caption text-text-tertiary mt-3">
            Already have a node?{' '}
            <button type="button" onClick={onSwitchToLogin} className="text-primary hover:underline font-semibold">
              Authenticate
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};
