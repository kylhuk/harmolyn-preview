import React, { useState } from 'react';
import { BarChart3, Plus, X } from 'lucide-react';

interface PollCreatorProps {
  onSubmit: (question: string, options: string[]) => void;
  onClose: () => void;
}

export const PollCreator: React.FC<PollCreatorProps> = ({ onSubmit, onClose }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const addOption = () => {
    if (options.length < 6) setOptions([...options, '']);
  };

  const removeOption = (i: number) => {
    if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i));
  };

  const updateOption = (i: number, val: string) => {
    const copy = [...options];
    copy[i] = val;
    setOptions(copy);
  };

  const canSubmit = question.trim() && options.filter(o => o.trim()).length >= 2;

  return (
    <div className="absolute bottom-20 left-4 right-4 md:left-6 md:right-auto md:w-[380px] glass-card bg-bg-0 border border-white/10 rounded-r2 shadow-2xl z-50 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-primary" />
          <span className="text-xs font-bold text-white font-display">CREATE // POLL</span>
        </div>
        <button onClick={onClose} className="p-1 text-white/30 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <label className="micro-label text-white/40 mb-1 block">QUESTION</label>
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Ask something..."
            className="w-full bg-surface-dark border border-white/5 rounded-r1 px-3 py-2 text-xs text-white font-mono placeholder-white/20 focus:outline-none focus:border-primary/50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="micro-label text-white/40 mb-1 block">OPTIONS</label>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-[10px] text-white/20 font-mono w-4 text-right">{i + 1}.</span>
              <input
                type="text"
                value={opt}
                onChange={e => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="flex-1 bg-surface-dark border border-white/5 rounded-r1 px-3 py-1.5 text-xs text-white font-mono placeholder-white/15 focus:outline-none focus:border-primary/50"
              />
              {options.length > 2 && (
                <button onClick={() => removeOption(i)} className="p-1 text-white/20 hover:text-accent-danger transition-colors">
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <button
              onClick={addOption}
              className="flex items-center gap-1 text-[10px] text-primary/60 hover:text-primary transition-colors font-mono mt-1"
            >
              <Plus size={12} /> ADD OPTION
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 px-4 py-3 border-t border-white/5">
        <button onClick={onClose} className="px-3 py-1.5 text-xs text-white/40 hover:text-white transition-colors">
          Cancel
        </button>
        <button
          onClick={() => { if (canSubmit) onSubmit(question, options.filter(o => o.trim())); }}
          disabled={!canSubmit}
          className="px-4 py-1.5 bg-primary text-bg-0 rounded-full text-xs font-bold shadow-glow-sm hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Create Poll
        </button>
      </div>
    </div>
  );
};
