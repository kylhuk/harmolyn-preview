import React, { useState } from 'react';
import { Check, X, Shield, MessageSquare } from 'lucide-react';
import { User } from '@/types';
import { USERS } from '@/data';

interface MessageRequest {
  id: string;
  userId: string;
  preview: string;
  timestamp: string;
}

const MOCK_REQUESTS: MessageRequest[] = [
  { id: 'mr1', userId: 'u4', preview: 'Hey, saw your post in the dev channel...', timestamp: '2 hours ago' },
  { id: 'mr2', userId: 'u5', preview: 'Are you interested in joining our project?', timestamp: '5 hours ago' },
  { id: 'mr3', userId: 'u6', preview: 'Your encryption talk was awesome!', timestamp: '1 day ago' },
];

export const MessageRequests: React.FC = () => {
  const [requests, setRequests] = useState(MOCK_REQUESTS);

  const handleAccept = (id: string) => {
    setRequests(r => r.filter(req => req.id !== id));
  };

  const handleIgnore = (id: string) => {
    setRequests(r => r.filter(req => req.id !== id));
  };

  if (requests.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-text-tertiary gap-3 p-8">
        <div className="w-16 h-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center">
          <Shield size={28} className="text-primary/30" />
        </div>
        <p className="text-body text-text-secondary">No pending requests</p>
        <p className="text-caption text-text-disabled text-center">When someone outside your network tries to message you, their request will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      <div className="micro-label text-text-tertiary px-2 mb-3">PENDING REQUESTS // {requests.length}</div>
      {requests.map(req => {
        const user = USERS.find(u => u.id === req.userId);
        if (!user) return null;
        return (
          <div key={req.id} className="glass-card rounded-r2 p-4 border border-stroke hover:border-stroke-strong transition-all group">
            <div className="flex items-start gap-3">
              <img src={user.avatar} className="w-10 h-10 rounded-full border border-stroke flex-shrink-0" alt="" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-body-strong text-text-primary">{user.username}</span>
                  <span className="text-micro text-text-disabled">{req.timestamp}</span>
                </div>
                <p className="text-caption text-text-secondary truncate">{req.preview}</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleAccept(req.id)}
                  className="w-8 h-8 rounded-full bg-accent-success/10 border border-accent-success/20 flex items-center justify-center text-accent-success hover:bg-accent-success/20 transition-all"
                  aria-label="Accept request"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => handleIgnore(req.id)}
                  className="w-8 h-8 rounded-full bg-accent-danger/10 border border-accent-danger/20 flex items-center justify-center text-accent-danger hover:bg-accent-danger/20 transition-all"
                  aria-label="Ignore request"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
