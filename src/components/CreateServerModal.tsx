import React from 'react';
import { X, Upload, Plus, ChevronRight, Globe, Lock } from 'lucide-react';

interface CreateServerModalProps {
    onClose: () => void;
}

export const CreateServerModal: React.FC<CreateServerModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-bg-0/90 backdrop-blur-md" onClick={onClose}></div>
            
            <div className="w-full max-w-[420px] glass-panel rounded-[52px] overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                <button onClick={onClose} className="absolute top-5 right-5 text-white/20 hover:text-white transition-colors z-10"><X size={20} /></button>
                
                <div className="p-8 pt-10">
                    <header className="text-center mb-8">
                        <div className="inline-block p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-5 shadow-glow">
                            <Globe size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2.5 font-display tracking-tight uppercase">Construct Node</h2>
                        <p className="text-white/40 text-xs font-light leading-relaxed max-w-sm mx-auto">Establish a new encrypted community. You can define access protocols and security levels after initiation.</p>
                    </header>
                    
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-[90px] h-[90px] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-white/20 hover:border-primary hover:text-primary cursor-pointer transition-all hover:bg-primary/5 group relative overflow-hidden">
                            <Upload size={26} className="mb-1.5 transition-transform group-hover:-translate-y-1" />
                            <span className="micro-label text-[7px] font-bold">Upload // Icon</span>
                            <div className="absolute inset-0 grid-overlay opacity-0 group-hover:opacity-20"></div>
                        </div>
                    </div>
                    
                    <div className="space-y-5 mb-8">
                        <div className="text-left">
                            <label className="micro-label text-white/20 mb-1.5 block">Node Name</label>
                            <input 
                                type="text" 
                                placeholder="THE // HUB" 
                                className="w-full bg-bg-0/50 border border-white/10 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-primary focus:shadow-glow transition-all font-mono placeholder-white/10" 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-r2 border border-white/5 glass-panel cursor-pointer hover:border-primary/40 transition-all flex flex-col gap-1.5">
                                <Lock size={16} className="text-primary" />
                                <div className="font-bold text-xs text-white">Private</div>
                                <div className="text-[9px] text-white/30">Restricted access</div>
                            </div>
                            <div className="p-3 rounded-r2 border border-primary/20 bg-primary/5 cursor-pointer flex flex-col gap-1.5 relative shadow-glow">
                                <Globe size={16} className="text-primary" />
                                <div className="font-bold text-xs text-white">Public</div>
                                <div className="text-[9px] text-white/30">Discoverable node</div>
                                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary shadow-glow"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-[9px] text-white/20 text-center font-light px-3">
                        By establishing this node, you confirm adherence to the <span className="text-primary cursor-pointer hover:underline">Nexus Security Protocol</span>.
                    </div>
                </div>
                
                <div className="bg-white/5 px-8 py-5 flex justify-between items-center border-t border-white/5 backdrop-blur-xl">
                    <button onClick={onClose} className="text-white/40 hover:text-white micro-label transition-all">Cancel</button>
                    <button onClick={onClose} className="bg-primary hover:bg-primary/90 text-bg-0 font-bold py-2.5 px-8 rounded-full micro-label tracking-tight shadow-glow hover:scale-105 transition-all">Initiate Matrix</button>
                </div>
            </div>
        </div>
    )
}
