import React from 'react';
import { X, Upload, Plus, ChevronRight, Globe, Lock } from 'lucide-react';

interface CreateServerModalProps {
    onClose: () => void;
}

export const CreateServerModal: React.FC<CreateServerModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-bg-0/90 backdrop-blur-md" onClick={onClose}></div>
            
            <div className="w-full max-w-xl glass-panel rounded-r4 overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                <button onClick={onClose} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors z-10"><X size={24} /></button>
                
                <div className="p-10 pt-12">
                    <header className="text-center mb-10">
                        <div className="inline-block p-4 rounded-r3 bg-primary/10 border border-primary/20 text-primary mb-6 shadow-glow">
                            <Globe size={40} />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3 font-display tracking-tight uppercase">Construct Node</h2>
                        <p className="text-white/40 text-sm font-light leading-relaxed max-w-sm mx-auto">Establish a new encrypted community. You can define access protocols and security levels after initiation.</p>
                    </header>
                    
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-28 h-28 rounded-r3 border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-white/20 hover:border-primary hover:text-primary cursor-pointer transition-all hover:bg-primary/5 group relative overflow-hidden">
                            <Upload size={32} className="mb-2 transition-transform group-hover:-translate-y-1" />
                            <span className="micro-label text-[8px] font-bold">Upload // Icon</span>
                            <div className="absolute inset-0 grid-overlay opacity-0 group-hover:opacity-20"></div>
                        </div>
                    </div>
                    
                    <div className="space-y-6 mb-10">
                        <div className="text-left">
                            <label className="micro-label text-white/20 mb-2 block">Node Name</label>
                            <input 
                                type="text" 
                                placeholder="THE // HUB" 
                                className="w-full bg-bg-0/50 border border-white/10 rounded-full px-6 py-4 text-white focus:outline-none focus:border-primary focus:shadow-glow transition-all font-mono placeholder-white/10" 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-r2 border border-white/5 glass-panel cursor-pointer hover:border-primary/40 transition-all flex flex-col gap-2">
                                <Lock size={20} className="text-primary" />
                                <div className="font-bold text-sm text-white">Private</div>
                                <div className="text-[10px] text-white/30">Restricted access</div>
                            </div>
                            <div className="p-4 rounded-r2 border border-primary/20 bg-primary/5 cursor-pointer flex flex-col gap-2 relative shadow-glow">
                                <Globe size={20} className="text-primary" />
                                <div className="font-bold text-sm text-white">Public</div>
                                <div className="text-[10px] text-white/30">Discoverable node</div>
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-glow"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-[10px] text-white/20 text-center font-light px-4">
                        By establishing this node, you confirm adherence to the <span className="text-primary cursor-pointer hover:underline">Nexus Security Protocol</span>.
                    </div>
                </div>
                
                <div className="bg-white/5 px-10 py-6 flex justify-between items-center border-t border-white/5 backdrop-blur-xl">
                    <button onClick={onClose} className="text-white/40 hover:text-white micro-label transition-all">Cancel</button>
                    <button onClick={onClose} className="bg-primary hover:bg-primary/90 text-bg-0 font-bold py-3 px-10 rounded-full micro-label tracking-tight shadow-glow hover:scale-105 transition-all">Initiate Matrix</button>
                </div>
            </div>
        </div>
    )
}
