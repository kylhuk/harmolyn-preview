import React, { useEffect, useMemo, useState } from 'react';
import { Compass, Search, Users, Shield, Zap, TrendingUp, ArrowRight, Link as LinkIcon } from 'lucide-react';
import type { Server, XoreinRuntimeSnapshot } from '@/types';
import { previewServerByInvite, type XoreinServerPreview } from '@/lib/xoreinControl';

interface ServerExplorerProps {
    servers: Server[];
    runtimeSnapshot: XoreinRuntimeSnapshot | null;
    onSelectServer: (id: string | 'home' | 'explore') => void;
    onOpenJoin: (initialValue?: string) => void;
}

export const ServerExplorer: React.FC<ServerExplorerProps> = ({ servers, runtimeSnapshot, onSelectServer, onOpenJoin }) => {
    const [query, setQuery] = useState('');
    const [preview, setPreview] = useState<XoreinServerPreview | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState('');

    useEffect(() => {
        const trimmed = query.trim();
        if (!trimmed) {
            setPreview(null);
            setPreviewLoading(false);
            setPreviewError('');
            return;
        }

        let cancelled = false;
        const timeoutId = window.setTimeout(async () => {
            setPreviewLoading(true);
            try {
                const nextPreview = await previewServerByInvite(runtimeSnapshot, trimmed);
                if (cancelled) {
                    return;
                }
                setPreview(nextPreview);
                setPreviewError('');
            } catch (error) {
                if (cancelled) {
                    return;
                }
                setPreview(null);
                setPreviewError(error instanceof Error ? error.message : 'Unable to preview invite.');
            } finally {
                if (!cancelled) {
                    setPreviewLoading(false);
                }
            }
        }, 250);

        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [query, runtimeSnapshot]);

    const trackedServers = useMemo(() => [...servers].sort((left, right) => left.name.localeCompare(right.name)), [servers]);
    const previewAlreadyJoined = preview ? trackedServers.some((server) => server.id === preview.manifest.server_id) : false;

    return (
        <div className="flex-1 bg-bg-0 overflow-y-auto h-full animate-in fade-in duration-500 no-scrollbar relative">
            <div className="relative h-[320px] flex items-center justify-center overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-bg-0 z-0"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745679-5651f72db371?w=1600&h=900&fit=crop')] bg-cover bg-center opacity-10 mix-blend-screen scale-110"></div>
                <div className="absolute inset-0 grid-overlay opacity-20"></div>

                <div className="relative z-10 text-center max-w-2xl px-5">
                    <div className="inline-flex items-center gap-1.5 micro-label text-primary bg-primary/10 px-3 py-1 rounded-full mb-5 border border-primary/20 shadow-glow">
                        <TrendingUp size={12} /> Global Stream Explorer
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-5 font-display text-glow leading-[1.1]">Join the Underground Network.</h1>
                    <p className="text-white/40 mb-8 text-base font-light tracking-tight">Paste a signed `aether://join/...` invite to preview a live xorein server before joining, or browse the nodes already tracked by your local runtime.</p>

                    <div className="relative max-w-2xl mx-auto group">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-focus-within:bg-primary/30 transition-all opacity-0 group-focus-within:opacity-100"></div>
                        <div className="relative glass-panel rounded-full p-1 border border-white/10 flex items-center focus-within:border-primary/50 transition-all">
                            <div className="pl-5 pr-2.5 text-white/30"><Search size={18} /></div>
                            <input
                                type="text"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="aether://join/server-id?invite=..."
                                className="w-full bg-transparent py-2.5 text-white focus:outline-none text-base font-light placeholder-white/20"
                            />
                            <button onClick={() => onOpenJoin(query.trim())} className="bg-primary text-bg-0 px-6 py-2.5 rounded-full font-bold micro-label tracking-tight hover:shadow-glow hover:scale-[1.02] transition-all ml-1.5 disabled:opacity-50" disabled={!query.trim()}>
                                Join Invite
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 flex items-center justify-center gap-3 text-[10px] text-white/35 tracking-[0.18em]">
                        <button onClick={() => onOpenJoin()} className="hover:text-primary transition-colors inline-flex items-center gap-2">
                            <LinkIcon size={12} /> OPEN JOIN MODAL
                        </button>
                        <span>•</span>
                        <span>NETWORK-BACKED RESULTS ONLY</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
                <section>
                    <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                        <h2 className="micro-label text-white tracking-[0.2em] flex items-center gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-glow"></div>
                            Invite Preview
                        </h2>
                        <div className="flex gap-1.5">
                            {['SIGNED', 'XOREIN', 'LOCAL CONTROL'].map(tag => (
                                <div key={tag} className="px-3 py-1 rounded-full glass-panel border border-white/10 micro-label text-[7px] text-white/40">
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>

                    {previewLoading && (
                        <div className="glass-card rounded-r2 border border-white/10 px-6 py-8 text-center text-white/50 flex items-center justify-center gap-3">
                            <Zap size={16} className="text-primary animate-pulse" /> Resolving signed invite through the local xorein runtime...
                        </div>
                    )}

                    {!previewLoading && preview && (
                        <div className="glass-card rounded-r2 overflow-hidden border border-primary/20 shadow-xl">
                            <div className="p-6 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
                                <div className="min-w-0">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 micro-label text-primary mb-4">
                                        <Shield size={12} /> VERIFIED INVITE PREVIEW
                                    </div>
                                    <h3 className="text-2xl font-bold text-white font-display mb-2">{preview.manifest.name}</h3>
                                    <p className="text-white/45 text-sm leading-relaxed max-w-2xl">{preview.manifest.description?.trim() || 'This invite resolved to a live xorein manifest.'}</p>
                                    <div className="mt-4 flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.18em] text-white/35">
                                        <span className="inline-flex items-center gap-1.5"><Users size={12} /> {(preview.member_count ?? 0).toLocaleString()} members</span>
                                        <span className="inline-flex items-center gap-1.5"><Compass size={12} /> {preview.channels?.length ?? 0} channels</span>
                                        {preview.manifest.history_coverage ? <span>{preview.manifest.history_coverage}</span> : null}
                                        {preview.owner_role ? <span>{preview.owner_role}</span> : null}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 shrink-0">
                                    {previewAlreadyJoined ? (
                                        <button onClick={() => onSelectServer(preview.manifest.server_id)} className="h-12 px-6 rounded-full bg-primary text-bg-0 font-bold text-body-strong flex items-center justify-center gap-2 hover:shadow-glow transition-all">
                                            <ArrowRight size={16} /> Open Joined Server
                                        </button>
                                    ) : (
                                        <button onClick={() => onOpenJoin(query.trim())} className="h-12 px-6 rounded-full bg-primary text-bg-0 font-bold text-body-strong flex items-center justify-center gap-2 hover:shadow-glow transition-all">
                                            <ArrowRight size={16} /> Join via Invite
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {!previewLoading && !preview && query.trim() && previewError && (
                        <div className="glass-card rounded-r2 border border-accent-danger/20 bg-accent-danger/10 px-6 py-5 text-sm text-accent-danger">
                            {previewError}
                        </div>
                    )}

                    {!previewLoading && !preview && !query.trim() && (
                        <div className="glass-card rounded-r2 border border-white/10 px-6 py-5 text-sm text-white/40">
                            Paste a signed `aether://join/&lt;server-id&gt;?invite=...` deeplink to discover a server through the local runtime without joining it yet.
                        </div>
                    )}
                </section>

                <section>
                    <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
                        <h2 className="micro-label text-white tracking-[0.2em] flex items-center gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-glow"></div>
                            Tracked Nodes
                        </h2>
                        <div className="text-[10px] tracking-[0.18em] text-white/30 uppercase">Backed by `GET /v1/state`</div>
                    </div>

                    {trackedServers.length === 0 ? (
                        <div className="glass-card rounded-r2 border border-white/10 px-8 py-12 text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/5 border border-white/10 text-primary mb-4">
                                <Compass size={22} />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2">No tracked servers yet</h3>
                            <p className="text-white/40 max-w-xl mx-auto mb-6">Your local xorein runtime has not joined or created any servers that can be surfaced here yet. Use a signed invite or create a new node to populate the rail.</p>
                            <button onClick={() => onOpenJoin()} className="h-11 px-6 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-all font-bold text-sm">
                                Open Join Flow
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {trackedServers.map((server, idx) => (
                                <div key={server.id} className="glass-card rounded-r2 overflow-hidden hover:transform hover:-translate-y-2 transition-all duration-500 shadow-xl border border-white/10 group relative">
                                    <div className="h-32 bg-bg-1 relative overflow-hidden">
                                        {server.banner ? (
                                            <img src={server.banner} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                                        ) : (
                                            <div className="w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(19,221,236,0.28),transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))]"></div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-bg-0 to-transparent"></div>
                                        <div className="absolute top-3 right-3 bg-bg-0/80 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 micro-label text-[7px] text-primary flex items-center gap-1">
                                            <Zap size={8} /> Runtime Node {idx + 1}
                                        </div>
                                    </div>
                                    <div className="p-5 pt-0 relative">
                                        <div className="w-[52px] h-[52px] rounded-r2 bg-bg-1 absolute -top-8 left-5 border-[3px] border-bg-0 overflow-hidden shadow-2xl ring-1 ring-white/10 group-hover:ring-primary transition-all">
                                            <img src={server.icon} alt={server.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="mt-8">
                                            <h3 className="text-base font-bold text-white mb-1.5 font-display flex items-center gap-1.5 group-hover:text-primary transition-colors">
                                                {server.name}
                                                <div className="w-2.5 h-2.5 rounded-full bg-accent-success shadow-glow-success" title="Reachable in local runtime"></div>
                                            </h3>
                                            <p className="text-white/40 text-xs font-light leading-relaxed line-clamp-2 mb-5 h-8">{server.description || 'Tracked by the local xorein runtime.'}</p>

                                            <div className="flex items-center justify-between border-t border-white/5 pt-3">
                                                <div className="flex items-center gap-3 text-[9px] micro-label text-white/20">
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-1.5 h-1.5 bg-accent-success rounded-full shadow-[0_0_5px_#05FFA1]"></div>
                                                        <span className="font-mono">{server.members.length}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Users size={10} />
                                                        <span className="font-mono">{server.categories.flatMap(category => category.channels).length}</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => onSelectServer(server.id)} className="h-8 px-3 rounded-full glass-panel flex items-center justify-center text-white/40 group-hover:text-primary group-hover:border-primary transition-all border border-white/5 text-[10px] font-bold tracking-[0.18em]">
                                                    OPEN
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};
