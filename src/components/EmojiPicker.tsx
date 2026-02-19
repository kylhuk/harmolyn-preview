import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Clock, Smile, Heart, TreePine, UtensilsCrossed, Gamepad2, Car, Lightbulb, Flag, Hash } from 'lucide-react';

interface EmojiCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  emojis: string[];
}

const CATEGORIES: EmojiCategory[] = [
  {
    id: 'smileys',
    name: 'SMILEYS & PEOPLE',
    icon: <Smile size={14} />,
    emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🫡','🤐','🤨','😐','😑','😶','🫥','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','🫤','😟','🙁','☹️','😮','😯','😲','😳','🥺','🥹','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖'],
  },
  {
    id: 'gestures',
    name: 'GESTURES & BODY',
    icon: <Heart size={14} />,
    emojis: ['👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','🫵','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁️','👅','👄','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','💗','💓','💕','💖','💝','💘','💟'],
  },
  {
    id: 'nature',
    name: 'NATURE & ANIMALS',
    icon: <TreePine size={14} />,
    emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🪳','🦟','🦗','🕷️','🌸','🌺','🌻','🌹','🌷','🌼','🌱','🪴','🌿','☘️','🍀','🌵','🌴','🌳','🌲','🍂','🍁','🍄','🌾','💐','🌍','🌎','🌏','🌕','🌖','🌗','🌑','🌒','🌓','🌔','🌙','⭐','🌟','💫','✨','☀️','🌤️','⛅','🌥️','☁️','🌧️','⛈️','🌩️','🌈','❄️','☃️','⛄','🔥','💧','🌊'],
  },
  {
    id: 'food',
    name: 'FOOD & DRINK',
    icon: <UtensilsCrossed size={14} />,
    emojis: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍠','🫘','🥐','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','☕','🍵','🧋','🥤','🍶','🍺','🍻','🥂','🍷','🍸','🍹','🧃','💧','🧊'],
  },
  {
    id: 'activities',
    name: 'ACTIVITIES',
    icon: <Gamepad2 size={14} />,
    emojis: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','🤺','⛹️','🏊','🚣','🧗','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎗️','🎪','🤹','🎭','🩰','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🪘','🎷','🎺','🪗','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🕹️','🧩','🪩'],
  },
  {
    id: 'travel',
    name: 'TRAVEL & PLACES',
    icon: <Car size={14} />,
    emojis: ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍️','🛵','🦽','🦼','🛺','🚲','🛴','🛹','🛼','🚏','🛣️','🛤️','⛽','🛞','🚨','🚥','🚦','🛑','🚧','⚓','🛟','⛵','🛶','🚤','🛳️','⛴️','🛥️','🚢','✈️','🛩️','🛫','🛬','🪂','💺','🚁','🚟','🚠','🚡','🛰️','🚀','🛸','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','⛩️','🕋','⛲','⛺','🌁','🌃','🏙️','🌄','🌅','🌆','🌇','🌉','🗾','🏔️','⛰️','🌋','🗻','🏕️','🏖️','🏜️','🏝️','🏞️'],
  },
  {
    id: 'objects',
    name: 'OBJECTS & SYMBOLS',
    icon: <Lightbulb size={14} />,
    emojis: ['⌚','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','🕹️','🗜️','💾','💿','📀','📼','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🎙️','🎚️','🎛️','🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🪫','🔌','💡','🔦','🕯️','🪔','🧯','🛢️','💸','💵','💴','💶','💷','🪙','💰','💳','💎','⚖️','🪜','🧰','🪛','🔧','🔨','⚒️','🛠️','⛏️','🪚','🔩','⚙️','🪤','🧲','🔫','💣','🧨','🪓','🔪','🗡️','⚔️','🛡️','🚬','⚰️','🪦','⚱️','🏺','🔮','📿','🧿','🪬','💈','⚗️','🔭','🔬','🕳️','🩹','🩺','🩻','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️','🧹','🪠','🧺','🧻','🧼','🫧','🪥','🧽','🧴','🔑','🗝️','🚪','🪑','🛋️','🛏️','🛌','🧸','🪆','🖼️','🪞','🪟','🛍️','🛒','🎁','🎈','🎏','🎀','🪄','🪅','🎊','🎉','🎎','🏮','🎐','🧧','✉️','📩','📨','📧','💌','📥','📤','📦','🏷️','🪧','📪','📫','📬','📭','📮','📯','📜','📃','📄','📑','🧾','📊','📈','📉','🗒️','🗓️','📆','📅','🗑️','📇','🗃️','🗳️','🗄️','📋','📁','📂','🗂️','🗞️','📰','📓','📔','📒','📕','📗','📘','📙','📚','📖','🔖','🧷','🔗','📎','🖇️','📐','📏','🧮','📌','📍','✂️','🖊️','🖋️','✒️','🖌️','🖍️','📝','✏️','🔍','🔎','🔏','🔐','🔒','🔓'],
  },
  {
    id: 'flags',
    name: 'FLAGS & SYMBOLS',
    icon: <Flag size={14} />,
    emojis: ['🏁','🚩','🎌','🏴','🏳️','🏳️‍🌈','🏳️‍⚧️','🏴‍☠️','🇺🇸','🇬🇧','🇫🇷','🇩🇪','🇯🇵','🇰🇷','🇨🇳','🇧🇷','🇮🇳','🇷🇺','🇦🇺','🇨🇦','🇪🇸','🇮🇹','🇲🇽','🇳🇱','🇸🇪','🇨🇭','🇳🇴','🇩🇰','🇫🇮','🇵🇱','🇦🇹','🇧🇪','🇵🇹','🇬🇷','🇹🇷','🇿🇦','🇦🇷','🇨🇴','🇨🇱','🇵🇪','⚠️','🚸','⛔','🚫','🚳','🚭','🚯','🚱','🚷','📵','🔞','☢️','☣️','⬆️','↗️','➡️','↘️','⬇️','↙️','⬅️','↖️','↕️','↔️','↩️','↪️','⤴️','⤵️','🔃','🔄','🔙','🔚','🔛','🔜','🔝','🛐','⚛️','🕉️','✡️','☸️','☯️','✝️','☦️','☪️','☮️','🕎','🔯','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','⛎','🔀','🔁','🔂','▶️','⏩','⏭️','⏯️','◀️','⏪','⏮️','🔼','⏫','🔽','⏬','⏸️','⏹️','⏺️','⏏️','🎦','🔅','🔆','📶','🛜','📳','📴','♀️','♂️','⚧️','✖️','➕','➖','➗','🟰','♾️','‼️','⁉️','❓','❔','❕','❗','〰️','💱','💲','⚕️','♻️','⚜️','🔱','📛','🔰','⭕','✅','☑️','✔️','❌','❎','➰','➿','〽️','✳️','✴️','❇️','©️','®️','™️','#️⃣','*️⃣','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔠','🔡','🔢','🔣','🔤','🅰️','🆎','🅱️','🆑','🆒','🆓','ℹ️','🆔','Ⓜ️','🆕','🆖','🅾️','🆗','🅿️','🆘','🆙','🆚','🈁','🈂️','🈷️','🈶','🈯','🉐','🈹','🈚','🈲','🉑','🈸','🈴','🈳','㊗️','㊙️','🈺','🈵','🔴','🟠','🟡','🟢','🔵','🟣','🟤','⚫','⚪','🟥','🟧','🟨','🟩','🟦','🟪','🟫','⬛','⬜','◼️','◻️','◾','◽','▪️','▫️','🔶','🔷','🔸','🔹','🔺','🔻','💠','🔘','🔳','🔲'],
  },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('smileys');
  const [recentEmojis, setRecentEmojis] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('harmolyn-recent-emojis') || '[]');
    } catch { return []; }
  });
  const contentRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    const updated = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 24);
    setRecentEmojis(updated);
    localStorage.setItem('harmolyn-recent-emojis', JSON.stringify(updated));
  };

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return CATEGORIES;
    const q = search.toLowerCase();
    return CATEGORIES.map(cat => ({
      ...cat,
      emojis: cat.emojis.filter(e => e.includes(q)),
    })).filter(cat => cat.emojis.length > 0);
  }, [search]);

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    categoryRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handleScroll = () => {
      for (const cat of CATEGORIES) {
        const ref = categoryRefs.current[cat.id];
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const containerRect = el.getBoundingClientRect();
          if (rect.top >= containerRect.top - 10 && rect.top <= containerRect.top + 80) {
            setActiveCategory(cat.id);
            break;
          }
        }
      }
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="absolute bottom-14 right-0 w-[272px] h-[336px] bg-bg-0 border border-white/10 rounded-r2 shadow-[0_0_50px_rgba(0,0,0,0.8)] glass-card flex flex-col animate-in slide-in-from-bottom-2 z-50 overflow-hidden">
      {/* Search */}
      <div className="p-2.5 border-b border-white/5">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search emojis..."
            className="w-full bg-white/5 border border-white/5 rounded-full pl-7 pr-2.5 py-1.5 text-[10px] font-mono text-white placeholder-white/30 focus:outline-none focus:border-primary/40"
            autoFocus
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      {!search && (
        <div className="flex items-center gap-0.5 px-1.5 py-1 border-b border-white/5">
          {recentEmojis.length > 0 && (
            <button
              onClick={() => scrollToCategory('recent')}
              className={`p-1.5 rounded-md transition-all ${activeCategory === 'recent' ? 'bg-primary/15 text-primary' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}`}
              title="Recently Used"
            >
              <Clock size={12} />
            </button>
          )}
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`p-1.5 rounded-md transition-all ${activeCategory === cat.id ? 'bg-primary/15 text-primary' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}`}
              title={cat.name}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div ref={contentRef} className="flex-1 overflow-y-auto no-scrollbar px-1.5 py-1.5">
        {/* Recent */}
        {!search && recentEmojis.length > 0 && (
          <div ref={el => { categoryRefs.current['recent'] = el; }}>
            <div className="micro-label text-white/25 tracking-widest px-1 py-1 text-[8px]">RECENTLY USED</div>
            <div className="grid grid-cols-8 gap-0.5">
              {recentEmojis.map((e, i) => (
                <button key={`r-${i}`} onClick={() => handleSelect(e)} className="text-lg p-1 hover:bg-white/10 rounded-md transition-colors text-center">
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredCategories.map(cat => (
          <div key={cat.id} ref={el => { categoryRefs.current[cat.id] = el; }}>
            <div className="micro-label text-white/25 tracking-widest px-1 py-1 text-[8px] sticky top-0 bg-bg-0/90 backdrop-blur-sm z-10">{cat.name}</div>
            <div className="grid grid-cols-8 gap-0.5">
              {cat.emojis.map((e, i) => (
                <button key={`${cat.id}-${i}`} onClick={() => handleSelect(e)} className="text-lg p-1 hover:bg-white/10 rounded-md transition-colors text-center">
                  {e}
                </button>
              ))}
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && search && (
          <div className="flex flex-col items-center justify-center h-full text-white/20 py-10">
            <Search size={26} className="mb-2.5 opacity-40" />
            <p className="text-[10px] font-mono">NO EMOJIS FOUND</p>
          </div>
        )}
      </div>
    </div>
  );
};
