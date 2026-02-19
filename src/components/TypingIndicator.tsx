import React, { useState, useEffect } from 'react';
import { User } from '@/types';

interface TypingIndicatorProps {
  users: User[];
  currentUserId: string;
}

const TypingDots = () => (
  <span className="inline-flex items-center gap-[3px] ml-1">
    <span className="w-[5px] h-[5px] rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}></span>
    <span className="w-[5px] h-[5px] rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }}></span>
    <span className="w-[5px] h-[5px] rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }}></span>
  </span>
);

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users, currentUserId }) => {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    const otherUsers = users.filter(u => u.id !== currentUserId && u.status === 'online');
    if (otherUsers.length === 0) return;

    const scheduleTyping = () => {
      const delay = 4000 + Math.random() * 8000;
      const timeout = setTimeout(() => {
        const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
        setTypingUsers(prev => prev.includes(randomUser.id) ? prev : [...prev, randomUser.id]);

        const duration = 2000 + Math.random() * 3000;
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(id => id !== randomUser.id));
        }, duration);

        scheduleTyping();
      }, delay);

      return timeout;
    };

    const timeout = scheduleTyping();
    return () => clearTimeout(timeout);
  }, [users, currentUserId]);

  const typingUserObjects = typingUsers.map(id => users.find(u => u.id === id)).filter(Boolean) as User[];

  if (typingUserObjects.length === 0) return null;

  const names = typingUserObjects.map(u => u.username);
  let text: string;
  if (names.length === 1) {
    text = `${names[0]} is typing`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing`;
  } else {
    text = `${names[0]} and ${names.length - 1} others are typing`;
  }

  return (
    <div className="h-6 flex items-center gap-2 px-4 text-[11px] text-white/40 font-mono animate-in fade-in duration-200">
      <span className="font-bold text-white/60">{text}</span>
      <TypingDots />
    </div>
  );
};
