import React from 'react';
import { Compass, Search, Users, Shield, Zap, TrendingUp } from 'lucide-react';
import { SERVERS } from '@/data';

export const ServerExplorer: React.FC = () => {
    return (
        <div className="flex-1 bg-bg-0 overflow-y-auto h-full animate-in fade-in duration-500 no-scrollbar relative">
            {/* Hero Section */}
            <div className="relative h-[320px] flex items-center justify-center overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-bg-0 z-0"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745679-5651f72db371?w=1600&h=900&fit=crop')] bg-cover bg-center opacity-10 mix-blend-screen scale-110"></div>
                <div className="absolute inset-0 grid-overlay opacity-20"></div>
                
                <div className="relative z-10 text-center max-w-xl px-5">
                    <div className="inline-flex items-center gap-1.5 micro-label text-primary bg-primary/10 px-3 py-1 rounded-full mb-5 border border-primary/20 shadow-glow">
                        <TrendingUp size={12} /> Global Stream Explorer
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-5 font-display text-glow leading-[1.1]">Join the Underground Network.</h1>
                    <p className="text-white/40 mb-8 text-base font-light tracking-tight">Access high-bandwidth channels for code, art, and secure comms.</p>
                    
                    <div className="relative max-w-lg mx-auto group">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-focus-within:bg-primary/30 transition-all opacity-0 group-focus-within:opacity-100"></div>
                        <div className="relative glass-panel rounded-full p-1 border border-white/10 flex items-center focus-within:border-primary/50 transition-all">
                            <div className="pl-5 pr-2.5 text-white/30"><Search size={18} /></div>
                            <input 
                                type="text" 
                                placeholder="Scan for nodes, communities, data streams..." 
                                className="w-full bg-transparent py-2.5 text-white focus:outline-none text-base font-light placeholder-white/20" 
                            />
                            <button className="bg-primary text-bg-0 px-6 py-2.5 rounded-full font-bold micro-label tracking-tight hover:shadow-glow hover:scale-[1.02] transition-all ml-1.5">Initiate Scan</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="micro-label text-white tracking-[0.2em] flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-glow"></div>
                        Featured Nodes
                    </h2>
                    <div className="flex gap-1.5">
                        {['GAMING', 'CORE', 'ASSETS', 'MEDIA'].map(tag => (
                            <button key={tag} className="px-3 py-1 rounded-full glass-panel border border-white/10 micro-label text-[7px] hover:border-primary/40 hover:text-primary transition-all">
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...SERVERS, ...SERVERS].map((server, idx) => (
                        <div key={`${server.id}-${idx}`} className="glass-card rounded-r2 overflow-hidden hover:transform hover:-translate-y-2 transition-all duration-500 shadow-xl border border-white/10 group cursor-pointer relative">
                            <div className="h-32 bg-bg-1 relative overflow-hidden">
                                <img src={server.banner || `https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&h=400&fit=crop&sig=${idx}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-bg-0 to-transparent"></div>
                                <div className="absolute top-3 right-3 bg-bg-0/80 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 micro-label text-[7px] text-primary flex items-center gap-1">
                                    <Zap size={8} /> Priority Node
                                </div>
                            </div>
                            <div className="p-5 pt-0 relative">
                                <div className="w-[52px] h-[52px] rounded-r2 bg-bg-1 absolute -top-8 left-5 border-[3px] border-bg-0 overflow-hidden shadow-2xl ring-1 ring-white/10 group-hover:ring-primary transition-all">
                                     <img src={server.icon} className="w-full h-full object-cover" />
                                </div>
                                <div className="mt-8">
                                    <h3 className="text-base font-bold text-white mb-1.5 font-display flex items-center gap-1.5 group-hover:text-primary transition-colors">
                                        {server.name}
                                        <div className="w-2.5 h-2.5 rounded-full bg-accent-success shadow-glow-success" title="Verified"></div>
                                    </h3>
                                    <p className="text-white/40 text-xs font-light leading-relaxed line-clamp-2 mb-5 h-8">{server.description || "Secure digital collective for elite operators and developers."}</p>
                                    
                                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                                        <div className="flex items-center gap-3 text-[9px] micro-label text-white/20">
                                            <div className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 bg-accent-success rounded-full shadow-[0_0_5px_#05FFA1]"></div>
                                                <span className="font-mono">{server.members.length * 42}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users size={10} />
                                                <span className="font-mono">{server.members.length * 156}</span>
                                            </div>
                                        </div>
                                        <button className="w-7 h-7 rounded-full glass-panel flex items-center justify-center text-white/20 group-hover:text-primary group-hover:border-primary transition-all border border-white/5">
                                            <Compass size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
