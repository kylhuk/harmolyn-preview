import React, { useState } from 'react';
import { Calendar, Plus, X, Clock, MapPin, Users, Bell, Loader2 } from 'lucide-react';

interface ScheduledEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  interested: number;
  type: 'voice' | 'stage' | 'external';
  coverColor: string;
}

const MOCK_EVENTS: ScheduledEvent[] = [
  { id: 'ev1', title: 'Weekly Dev Sync', description: 'Review PRs and plan the next sprint', startTime: 'Today at 5:00 PM', endTime: 'Today at 6:00 PM', location: 'Voice: dev-meeting', interested: 12, type: 'voice', coverColor: 'from-primary/20 to-primary/5' },
  { id: 'ev2', title: 'Encryption Workshop', description: 'Deep dive into E2E encryption implementation patterns', startTime: 'Tomorrow at 3:00 PM', endTime: 'Tomorrow at 5:00 PM', location: 'Stage: main-stage', interested: 47, type: 'stage', coverColor: 'from-accent-purple/20 to-accent-purple/5' },
  { id: 'ev3', title: 'Community Game Night', description: 'Play together and unwind after a long week', startTime: 'Saturday at 8:00 PM', endTime: 'Saturday at 11:00 PM', location: 'Voice: lounge', interested: 89, type: 'voice', coverColor: 'from-accent-success/20 to-accent-success/5' },
];

export const EventsList: React.FC<{ onCreateEvent?: () => void }> = ({ onCreateEvent }) => {
  const [events] = useState(MOCK_EVENTS);
  const [interestedEvents, setInterestedEvents] = useState<Set<string>>(new Set());

  const toggleInterested = (id: string) => {
    setInterestedEvents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-primary" />
          <h2 className="text-title font-semibold text-text-primary">EVENTS // SCHEDULE</h2>
        </div>
        <button onClick={onCreateEvent} className="h-10 px-4 rounded-full bg-primary text-bg-0 font-bold text-xs flex items-center gap-2 hover:shadow-glow transition-all">
          <Plus size={14} />
          New Event
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {events.map(ev => (
          <div key={ev.id} className="glass-card rounded-r2 border border-stroke overflow-hidden hover:border-stroke-strong transition-all group">
            <div className={`h-16 bg-gradient-to-r ${ev.coverColor} relative`}>
              <div className="absolute inset-0 grid-overlay opacity-20" />
              <div className="absolute top-3 right-3">
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${
                  ev.type === 'stage' ? 'bg-accent-purple/15 text-accent-purple border-accent-purple/30' :
                  ev.type === 'external' ? 'bg-accent-warning/15 text-accent-warning border-accent-warning/30' :
                  'bg-primary/15 text-primary border-primary/30'
                }`}>
                  {ev.type}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-body-strong text-text-primary mb-1 group-hover:text-primary transition-colors">{ev.title}</h3>
              <p className="text-caption text-text-secondary mb-3 line-clamp-2">{ev.description}</p>
              
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-text-tertiary mb-3">
                <span className="flex items-center gap-1"><Clock size={10} className="text-primary" /> {ev.startTime}</span>
                <span className="flex items-center gap-1"><MapPin size={10} /> {ev.location}</span>
                <span className="flex items-center gap-1"><Users size={10} /> {ev.interested + (interestedEvents.has(ev.id) ? 1 : 0)} interested</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleInterested(ev.id)}
                  className={`flex-1 h-9 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    interestedEvents.has(ev.id)
                      ? 'bg-primary/10 border border-primary/30 text-primary'
                      : 'border border-stroke-subtle text-text-secondary hover:bg-white/5'
                  }`}
                >
                  <Bell size={12} />
                  {interestedEvents.has(ev.id) ? 'Interested' : 'Mark Interested'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface CreateEventModalProps {
  onClose: () => void;
  onCreate?: (event: { title: string; description: string; date: string; time: string; type: string }) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('voice');
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    if (!title.trim()) return;
    setLoading(true);
    setTimeout(() => {
      onCreate?.({ title, description, date, time, type });
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] mx-6 glass-card rounded-r3 border border-stroke overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-title font-semibold text-text-primary">CREATE // EVENT</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full glass-panel border border-stroke-subtle flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary transition-all">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="micro-label text-text-tertiary">EVENT TITLE</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Weekly Standup..." className="w-full h-12 px-5 rounded-full bg-surface-dark border border-stroke-subtle text-text-primary text-body placeholder:text-text-disabled focus:border-stroke-primary focus:outline-none transition-colors" />
            </div>

            <div className="space-y-1.5">
              <label className="micro-label text-text-tertiary">DESCRIPTION</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What's this event about?" rows={3} className="w-full px-5 py-3 rounded-r2 bg-surface-dark border border-stroke-subtle text-text-primary text-body placeholder:text-text-disabled focus:border-stroke-primary focus:outline-none transition-colors resize-none" />
            </div>

            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="micro-label text-text-tertiary">DATE</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-12 px-5 rounded-full bg-surface-dark border border-stroke-subtle text-text-primary text-body focus:border-stroke-primary focus:outline-none transition-colors" />
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="micro-label text-text-tertiary">TIME</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full h-12 px-5 rounded-full bg-surface-dark border border-stroke-subtle text-text-primary text-body focus:border-stroke-primary focus:outline-none transition-colors" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="micro-label text-text-tertiary">EVENT TYPE</label>
              <div className="flex gap-2">
                {['voice', 'stage', 'external'].map(t => (
                  <button key={t} onClick={() => setType(t)} className={`flex-1 h-10 rounded-full text-xs font-bold uppercase transition-all border ${type === t ? 'bg-primary/15 text-primary border-primary/30' : 'text-text-secondary border-stroke-subtle hover:bg-white/5'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="h-12 px-5 rounded-full border border-stroke-subtle text-text-secondary text-body-strong hover:bg-white/5 transition-all">Cancel</button>
            <button onClick={handleCreate} disabled={!title.trim() || loading} className="h-12 px-6 rounded-full bg-primary text-bg-0 font-bold text-body-strong flex items-center gap-2 hover:shadow-glow transition-all disabled:opacity-40">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
              Create Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
