
import React, { useState, useEffect, useCallback } from 'react';
import { X, MessageSquare, AtSign, Bell, Volume2 } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'mention' | 'message' | 'system' | 'voice';
  title: string;
  body: string;
  avatar?: string;
  timestamp: number;
}

interface NotificationToastProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const TOAST_DURATION = 5000;

const iconMap = {
  mention: <AtSign size={14} className="text-primary" />,
  message: <MessageSquare size={14} className="text-primary" />,
  system: <Bell size={14} className="text-accent-warning" />,
  voice: <Volume2 size={14} className="text-accent-success" />,
};

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2.5 max-w-[340px] pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`
        pointer-events-auto glass-card rounded-r2 border border-white/10 p-3.5 flex items-start gap-3
        shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl
        transition-all duration-300
        ${exiting ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0 animate-in slide-in-from-right fade-in duration-300'}
      `}
    >
      {toast.avatar ? (
        <img src={toast.avatar} className="w-8 h-8 rounded-full border border-white/10 flex-shrink-0" alt="" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
          {iconMap[toast.type]}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-white truncate">{toast.title}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="p-0.5 text-white/20 hover:text-white/60 transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <X size={12} />
          </button>
        </div>
        <p className="text-[11px] text-white/50 line-clamp-2 mt-0.5">{toast.body}</p>
      </div>

      {/* Accent strip */}
      <div className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full ${
        toast.type === 'mention' ? 'bg-primary' :
        toast.type === 'voice' ? 'bg-accent-success' :
        toast.type === 'system' ? 'bg-accent-warning' : 'bg-white/20'
      }`} />
    </div>
  );
};

/** Hook to manage toast state */
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id' | 'timestamp'>) => {
    setToasts(prev => [...prev, { ...toast, id: `toast-${Date.now()}`, timestamp: Date.now() }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, dismissToast };
}
