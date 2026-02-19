import { Server, User, Message, DirectMessageChannel } from './types';

export const CURRENT_USER: User = {
  id: 'me',
  username: 'Neo_Operator',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
  status: 'online',
  color: '#13DDEC',
  bio: 'SYSTEM // OPERATOR // NEON GRID',
  joinedAt: 'NOV 2024'
};

export const USERS: User[] = [
  CURRENT_USER,
  { id: 'u1', username: 'Cipher_Punk', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop', status: 'dnd', role: 'Admin', color: '#FF2A6D', bio: 'ENCRYPTION // SPECIALIST', joinedAt: 'JAN 2024' },
  { id: 'u2', username: 'Glitch.exe', avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop', status: 'online', role: 'Moderator', color: '#05FFA1', bio: 'ERROR // HANDLER', joinedAt: 'FEB 2024' },
  { id: 'u3', username: 'ByteWalker', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop', status: 'idle', role: 'Member', color: '#F6F8F8', bio: 'DATA // NOMAD', joinedAt: 'MAR 2024' },
  { id: 'u4', username: 'NullSet', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', status: 'offline', role: 'Member', color: '#F6F8F8', bio: 'UNDEFINED // ENTITY', joinedAt: 'APR 2024' },
];

export const DIRECT_MESSAGES: DirectMessageChannel[] = [
  { id: 'dm1', userId: 'u1', lastMessage: 'ENCRYPTED PKT // RECEIVED', unreadCount: 1, timestamp: '10M' },
  { id: 'dm2', userId: 'u2', lastMessage: 'SYSTEMS // NOMINAL', unreadCount: 0, timestamp: '1H' },
];

export const SERVERS: Server[] = [
  {
    id: 's1',
    name: 'Neon Underground',
    icon: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=100&h=100&fit=crop',
    ownerId: 'u1',
    members: USERS,
    description: 'THE // DIGITAL // CORE',
    region: 'US-EAST',
    categories: [
      {
        id: 'c1',
        name: 'TERMINAL_ACCESS',
        channels: [
          { id: 'ch1', name: 'general-chat', type: 'text', categoryId: 'c1' },
          { id: 'ch2', name: 'announcements', type: 'text', categoryId: 'c1', unreadCount: 3 },
        ]
      },
      {
        id: 'c2',
        name: 'VOICE_NODES',
        channels: [
          { id: 'ch4', name: 'war-room', type: 'voice', categoryId: 'c2', activeUsers: [USERS[1], USERS[2]] },
          { id: 'ch5', name: 'field-ops', type: 'voice', categoryId: 'c2', activeUsers: [] },
        ]
      }
    ]
  },
  {
    id: 's2',
    name: 'DevCore Matrix',
    icon: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop',
    ownerId: 'me',
    members: USERS.slice(0, 3),
    categories: [
      {
        id: 'c4',
        name: 'DEVELOPMENT',
        channels: [
          { id: 'ch8', name: 'frontend', type: 'text', categoryId: 'c4' },
        ]
      }
    ]
  }
];

export const MOCK_MESSAGES: Message[] = [
  { 
    id: 'm1', 
    userId: 'u1', 
    content: 'System diagnostic complete. All grids are operating at 98% efficiency. We detected a minor fluctuation in Sector 7, but the automated protocols handled it.', 
    timestamp: '09:15 AM', 
    pinned: true 
  },
  { 
    id: 'm2', 
    userId: 'u3', 
    content: 'Has anyone else noticed the latency spike on the western node? It’s been drifting by about 40ms for the last hour.', 
    timestamp: '09:22 AM' 
  },
  { 
    id: 'm3', 
    userId: 'u2', 
    content: 'Checking logs now... I see it. Looks like a routing loop in the legacy subnet. I’ll flush the cache and restart the daemon.', 
    timestamp: '09:24 AM',
    reactions: [{ emoji: '👀', count: 1, reacted: false }]
  },
  { 
    id: 'm4', 
    userId: 'u2', 
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', 
    timestamp: '09:25 AM' 
  },
  { 
    id: 'm5', 
    userId: 'me', 
    content: 'Thanks Glitch. Let me know if you need authorization for the restart.', 
    timestamp: '09:28 AM' 
  },
  { 
    id: 'm6', 
    userId: 'u4', 
    content: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 
    timestamp: '09:45 AM' 
  },
  { 
    id: 'm7', 
    userId: 'u1', 
    content: 'Just a reminder that the weekly sync is pushed to 14:00 UTC. We need to discuss the new encryption standards for the external gateway.', 
    timestamp: '10:05 AM',
    reactions: [{ emoji: '👍', count: 3, reacted: true }]
  },
  { 
    id: 'm8', 
    userId: 'u3', 
    content: 'Got it. I’ll have the report ready by then. Also, did you see the new neural interface prototype? It’s wild.', 
    timestamp: '10:12 AM' 
  },
  { 
    id: 'm9', 
    userId: 'me', 
    content: 'Yeah, I saw the specs. The bandwidth is impressive but the thermal output is concerning. We don’t want to fry anyone’s cortex.', 
    timestamp: '10:15 AM',
    reactions: [{ emoji: '🔥', count: 2, reacted: true }]
  },
  { 
    id: 'm10', 
    userId: 'u2', 
    content: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.', 
    timestamp: '10:30 AM' 
  },
  { 
    id: 'm11', 
    userId: 'u1', 
    content: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.', 
    timestamp: '10:31 AM' 
  },
  { 
    id: 'm12', 
    userId: 'me', 
    content: 'Deploying the patch now. Systems might flicker for a microsecond. Hold onto your connections.', 
    timestamp: '10:44 AM' 
  },
];