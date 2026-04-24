
import React from 'react';
import { motion } from 'framer-motion';
import { ConnectionState, Server } from '@/types';
import { Plus, Compass, Home } from 'lucide-react';

interface ServerRailProps {
  servers: Server[];
  activeServerId: string | 'home' | 'explore';
  connectionState: ConnectionState;
  onSelectServer: (id: string | 'home' | 'explore') => void;
  onCreateServer: () => void;
}

export const ServerRail: React.FC<ServerRailProps> = ({ servers, activeServerId, connectionState, onSelectServer, onCreateServer }) => {
  const connectivityEnabled = connectionState.canUseConnectivityActions;

  return (
    <div className="w-[70px] bg-bg-0 flex flex-col items-center py-5 gap-3 overflow-y-auto overflow-x-hidden no-scrollbar border-r border-white/5 z-20 h-full" role="navigation" aria-label="Servers">
      {/* Home Button */}
      <div className="group relative flex flex-col items-center cursor-pointer">
          <motion.button 
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.95 }}
             data-testid="server-rail-home"
             onClick={() => onSelectServer('home')}
            aria-label="Home"
            className={`w-[44px] h-[44px] rounded-full transition-all duration-300 flex items-center justify-center bg-white/5 group-hover:bg-primary group-hover:text-bg-0 text-white/40 ${activeServerId === 'home' ? 'bg-primary text-bg-0 ring-2 ring-primary/40 ring-offset-[3px] ring-offset-bg-0' : ''}`}>
           <Home size={20} />
         </motion.button>
         {activeServerId === 'home' && (
           <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-primary rounded-r-full shadow-[0_0_10px_#13DDEC]"></div>
         )}
      </div>

      <div className="w-8 h-[1px] bg-white/10"></div>

      {servers.map((server) => {
        const totalUnread = server.categories.flatMap(c => c.channels).reduce((sum, ch) => sum + (ch.unreadCount || 0), 0);
        return (
        <div key={server.id} className="group relative flex flex-col items-center cursor-pointer">
          <motion.button 
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.95 }}
             data-testid={`server-rail-server-${server.id}`}
             disabled={!connectivityEnabled}
            onClick={() => onSelectServer(server.id)}
            aria-label={`Server: ${server.name}`}
            title={!connectivityEnabled ? connectionState.detail : server.name}
            className={`w-[44px] h-[44px] rounded-full transition-all duration-300 flex items-center justify-center overflow-hidden bg-white/5 ring-1 ring-white/10 group-hover:ring-primary disabled:opacity-40 disabled:cursor-not-allowed ${activeServerId === server.id ? 'ring-2 ring-primary ring-offset-[3px] ring-offset-bg-0' : ''}`}>
            <img src={server.icon} alt={server.name} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" />
          </motion.button>
          {activeServerId === server.id && (
            <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-primary rounded-r-full shadow-[0_0_10px_#13DDEC]"></div>
          )}
          {/* Unread badge */}
          {totalUnread > 0 && activeServerId !== server.id && (
            <div className="absolute -bottom-0.5 -right-0.5 min-w-[15px] h-[15px] bg-accent-danger rounded-full flex items-center justify-center text-[8px] font-bold text-white border-2 border-bg-0 px-1 shadow-[0_0_6px_rgba(255,42,109,0.5)]">
              {totalUnread}
            </div>
          )}
          {/* Unread pip (no count, just indicator) */}
          {totalUnread === 0 && activeServerId !== server.id && server.categories.some(c => c.channels.some(ch => (ch.unreadCount || 0) > 0)) && (
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
          )}
          {/* Tooltip */}
          <div className="absolute left-[56px] bg-bg-1 text-white text-[9px] font-bold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 hover:opacity-100 transition-all duration-200 delay-150 group-hover:delay-0 z-50 border border-primary/20 whitespace-nowrap tracking-widest translate-x-4 group-hover:translate-x-0 hover:translate-x-0">
            {server.name.toUpperCase()}
          </div>
        </div>
        );
      })}

      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        data-testid="server-rail-create"
        disabled={!connectivityEnabled}
        onClick={onCreateServer}
        aria-label="Create Server"
        title={!connectivityEnabled ? connectionState.detail : 'Create Server'}
        className="w-[44px] h-[44px] rounded-full bg-white/5 flex items-center justify-center text-accent-success/60 hover:text-accent-success hover:bg-accent-success/10 transition-all cursor-pointer border border-white/5 hover:border-accent-success/40 disabled:opacity-40 disabled:cursor-not-allowed">
        <Plus size={20} />
      </motion.button>

       <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        data-testid="server-rail-explore"
        disabled={!connectivityEnabled}
        onClick={() => onSelectServer('explore')}
        aria-label="Explore Servers"
        title={!connectivityEnabled ? connectionState.detail : 'Explore Servers'}
        className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${activeServerId === 'explore' ? 'bg-accent-purple text-bg-0' : 'bg-white/5 text-accent-purple/60 hover:text-accent-purple hover:bg-accent-purple/10'}`}>
        <Compass size={20} />
      </motion.button>

      <div className="mt-auto flex flex-col items-center gap-1.5 px-2 pt-3 text-center">
        <div className={`w-2 h-2 rounded-full ${statusColorClass(connectionState.status)}`}></div>
        <div className="text-[8px] font-bold tracking-[0.24em] text-white/60">{connectionState.label}</div>
      </div>
    </div>
  );
};

function statusColorClass(status: ConnectionState['status']): string {
  switch (status) {
    case 'connected':
      return 'bg-accent-success shadow-[0_0_8px_rgba(5,255,161,0.75)]';
    case 'reconnecting':
      return 'bg-accent-warning shadow-[0_0_8px_rgba(255,176,32,0.75)]';
    case 'disconnected':
    case 'no-peer':
    case 'no-relay':
      return 'bg-accent-danger shadow-[0_0_8px_rgba(255,42,109,0.75)]';
  }
}
