
import React from 'react';
import { Server } from '@/types';
import { Plus, Compass, Home } from 'lucide-react';

interface ServerRailProps {
  servers: Server[];
  activeServerId: string | 'home' | 'explore';
  onSelectServer: (id: string | 'home' | 'explore') => void;
  onCreateServer: () => void;
}

export const ServerRail: React.FC<ServerRailProps> = ({ servers, activeServerId, onSelectServer, onCreateServer }) => {
  return (
    <div className="w-[88px] bg-bg-0 flex flex-col items-center py-6 gap-4 overflow-y-auto overflow-x-hidden no-scrollbar border-r border-white/5 z-20 h-full" role="navigation" aria-label="Servers">
      {/* Home Button */}
      <div className="group relative flex flex-col items-center cursor-pointer">
         <button 
            onClick={() => onSelectServer('home')}
            aria-label="Home"
            className={`w-[56px] h-[56px] rounded-full transition-all duration-300 flex items-center justify-center bg-white/5 group-hover:bg-primary group-hover:text-bg-0 text-white/40 ${activeServerId === 'home' ? 'bg-primary text-bg-0 ring-2 ring-primary/40 ring-offset-4 ring-offset-bg-0 scale-105' : ''}`}>
           <Home size={24} />
         </button>
         {activeServerId === 'home' && (
           <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-2 h-7 bg-primary rounded-r-full shadow-[0_0_10px_#13DDEC]"></div>
         )}
      </div>

      <div className="w-10 h-[1px] bg-white/10"></div>

      {servers.map((server) => {
        const totalUnread = server.categories.flatMap(c => c.channels).reduce((sum, ch) => sum + (ch.unreadCount || 0), 0);
        return (
        <div key={server.id} className="group relative flex flex-col items-center cursor-pointer">
          <button 
            onClick={() => onSelectServer(server.id)}
            aria-label={`Server: ${server.name}`}
            className={`w-[56px] h-[56px] rounded-full transition-all duration-300 flex items-center justify-center overflow-hidden bg-white/5 ring-1 ring-white/10 group-hover:ring-primary ${activeServerId === server.id ? 'ring-2 ring-primary ring-offset-4 ring-offset-bg-0 scale-105' : ''}`}>
            <img src={server.icon} alt={server.name} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" />
          </button>
          {activeServerId === server.id && (
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-2 h-7 bg-primary rounded-r-full shadow-[0_0_10px_#13DDEC]"></div>
          )}
          {/* Unread badge */}
          {totalUnread > 0 && activeServerId !== server.id && (
            <div className="absolute -bottom-0.5 -right-0.5 min-w-[18px] h-[18px] bg-accent-danger rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-bg-0 px-1 shadow-[0_0_6px_rgba(255,42,109,0.5)]">
              {totalUnread}
            </div>
          )}
          {/* Unread pip (no count, just indicator) */}
          {totalUnread === 0 && activeServerId !== server.id && server.categories.some(c => c.channels.some(ch => (ch.unreadCount || 0) > 0)) && (
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
          )}
          {/* Tooltip */}
          <div className="absolute left-[70px] bg-bg-1 text-white text-[10px] font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 border border-primary/20 whitespace-nowrap tracking-widest translate-x-4 group-hover:translate-x-0">
            {server.name.toUpperCase()}
          </div>
        </div>
        );
      })}

      <button 
        onClick={onCreateServer}
        aria-label="Create Server"
        className="w-[56px] h-[56px] rounded-full bg-white/5 flex items-center justify-center text-accent-success/60 hover:text-accent-success hover:bg-accent-success/10 transition-all cursor-pointer border border-white/5 hover:border-accent-success/40">
        <Plus size={24} />
      </button>

       <button 
        onClick={() => onSelectServer('explore')}
        aria-label="Explore Servers"
        className={`w-[56px] h-[56px] rounded-full flex items-center justify-center transition-all cursor-pointer ${activeServerId === 'explore' ? 'bg-accent-purple text-bg-0' : 'bg-white/5 text-accent-purple/60 hover:text-accent-purple hover:bg-accent-purple/10'}`}>
        <Compass size={24} />
      </button>
    </div>
  );
};
