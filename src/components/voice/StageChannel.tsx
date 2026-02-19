
import React, { useState } from 'react';
import { Mic, MicOff, Hand, ChevronDown, ChevronUp, Crown, Users, Radio, LogOut, UserPlus } from 'lucide-react';
import { User } from '@/types';

interface StageParticipant {
  user: User;
  role: 'speaker' | 'listener';
  isMuted: boolean;
  handRaised: boolean;
}

interface StageChannelProps {
  channelName: string;
  topic?: string;
  onLeave: () => void;
}

const MOCK_PARTICIPANTS: StageParticipant[] = [
  { user: { id: 'u1', username: 'Cipher_Punk', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop', status: 'online', role: 'Admin', color: '#FF2A6D' }, role: 'speaker', isMuted: false, handRaised: false },
  { user: { id: 'u2', username: 'Glitch.exe', avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop', status: 'online', role: 'Moderator', color: '#05FFA1' }, role: 'speaker', isMuted: true, handRaised: false },
  { user: { id: 'u3', username: 'ByteWalker', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop', status: 'online', color: '#F6F8F8' }, role: 'listener', isMuted: true, handRaised: true },
  { user: { id: 'u4', username: 'NullSet', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', status: 'online', color: '#F6F8F8' }, role: 'listener', isMuted: true, handRaised: false },
  { user: { id: 'u5', username: 'DataStream', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', status: 'online', color: '#A855F7' }, role: 'listener', isMuted: true, handRaised: false },
];

export const StageChannel: React.FC<StageChannelProps> = ({ channelName, topic = 'Open discussion — Decentralized Systems', onLeave }) => {
  const [participants, setParticipants] = useState<StageParticipant[]>(MOCK_PARTICIPANTS);
  const [myHandRaised, setMyHandRaised] = useState(false);
  const [myMuted, setMyMuted] = useState(true);
  const [showListeners, setShowListeners] = useState(true);

  const speakers = participants.filter(p => p.role === 'speaker');
  const listeners = participants.filter(p => p.role === 'listener');
  const raisedHands = listeners.filter(p => p.handRaised);

  const inviteToSpeak = (userId: string) => {
    setParticipants(prev => prev.map(p =>
      p.user.id === userId ? { ...p, role: 'speaker', handRaised: false } : p
    ));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-0/80 backdrop-blur-sm">
      {/* Stage Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <Radio size={14} className="text-accent-danger animate-pulse" />
          <span className="micro-label text-accent-danger tracking-widest">LIVE // STAGE</span>
        </div>
        <h2 className="text-xl font-bold text-white font-display mb-1">{channelName}</h2>
        <p className="text-xs text-white/50">{topic}</p>
      </div>

      {/* Speakers Section */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-5">
        <div className="micro-label text-primary mb-4 tracking-widest flex items-center gap-2">
          <Crown size={10} />
          SPEAKERS — {speakers.length}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {speakers.map(p => (
            <div key={p.user.id} className="flex flex-col items-center gap-2 p-4 glass-card rounded-r2 border border-white/5 hover:border-primary/20 transition-colors">
              <div className="relative">
                <img src={p.user.avatar} className={`w-16 h-16 rounded-full border-2 ${!p.isMuted ? 'border-primary shadow-glow animate-pulse' : 'border-white/10'}`} alt={p.user.username} />
                {p.isMuted && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-bg-0 rounded-full flex items-center justify-center border border-white/10">
                    <MicOff size={10} className="text-accent-danger" />
                  </div>
                )}
              </div>
              <span className="text-xs font-bold text-white truncate max-w-full" style={{ color: p.user.color }}>{p.user.username}</span>
              {p.user.role && <span className="micro-label text-white/30">{p.user.role}</span>}
            </div>
          ))}
        </div>

        {/* Raised Hands */}
        {raisedHands.length > 0 && (
          <div className="mb-6">
            <div className="micro-label text-accent-warning mb-3 tracking-widest flex items-center gap-2">
              <Hand size={10} />
              RAISED HANDS — {raisedHands.length}
            </div>
            <div className="space-y-2">
              {raisedHands.map(p => (
                <div key={p.user.id} className="flex items-center gap-3 p-2.5 glass-card rounded-r2 border border-accent-warning/20">
                  <img src={p.user.avatar} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                  <span className="text-xs font-bold text-white flex-1">{p.user.username}</span>
                  <button
                    onClick={() => inviteToSpeak(p.user.id)}
                    className="px-3 py-1 text-[10px] font-bold text-primary border border-primary/30 rounded-full hover:bg-primary/10 transition-colors"
                  >
                    Invite to Speak
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Listeners */}
        <div>
          <button
            onClick={() => setShowListeners(!showListeners)}
            className="micro-label text-white/40 mb-3 tracking-widest flex items-center gap-2 hover:text-white/60 transition-colors"
          >
            <Users size={10} />
            LISTENERS — {listeners.length}
            {showListeners ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
          {showListeners && (
            <div className="flex flex-wrap gap-3">
              {listeners.map(p => (
                <div key={p.user.id} className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-full border border-white/5">
                  <img src={p.user.avatar} className="w-5 h-5 rounded-full" alt="" />
                  <span className="text-[10px] font-bold text-white/60">{p.user.username}</span>
                  {p.handRaised && <Hand size={10} className="text-accent-warning" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stage Controls */}
      <div className="px-6 py-4 border-t border-white/5 glass-panel flex items-center justify-center gap-3">
        <button
          onClick={() => setMyMuted(!myMuted)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${myMuted ? 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10' : 'bg-primary text-bg-0 shadow-glow'}`}
          aria-label={myMuted ? 'Unmute' : 'Mute'}
        >
          {myMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <button
          onClick={() => setMyHandRaised(!myHandRaised)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${myHandRaised ? 'bg-accent-warning/20 text-accent-warning border border-accent-warning/30' : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'}`}
          aria-label={myHandRaised ? 'Lower Hand' : 'Raise Hand'}
        >
          <Hand size={20} />
        </button>
        <button
          onClick={onLeave}
          className="w-12 h-12 rounded-full bg-accent-danger/20 text-accent-danger border border-accent-danger/30 flex items-center justify-center hover:bg-accent-danger/30 transition-all"
          aria-label="Leave Stage"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};
