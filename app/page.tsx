'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, ImagePlus, Music2, Plus, Save, Volume2, VolumeX, X, Heart, CalendarDays } from 'lucide-react';

type Entry = {
  id: string;
  date: string;
  mood: string;
  weather: string;
  text: string;
  image: string;
  audio: string;
};

type NotebookState = {
  entries: Entry[];
  dedication: string;
  coverOpened: boolean;
};

const STORAGE = 'deka-notebook-v1';
const initialEntries: Entry[] = [
  {
    id: 'first',
    date: '25.07.2026',
    mood: '💛',
    weather: '☀️',
    text: 'The day our story quietly began.\n\nWrite everything you remember here… the place, the first words, the tiny details you never want to forget.',
    image: '',
    audio: '',
  },
];

const moods = ['💛', '❤️', '🥹', '😂', '🫶', '🌙', '✨', '🌸'];
const weather = ['☀️', '🌤️', '🌧️', '⛅', '🌙', '☁️', '🌈'];

function todayString() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function Page() {
  const [state, setState] = useState<NotebookState>({ entries: initialEntries, dedication: 'For the two of us — and every ordinary day that became a memory.', coverOpened: false });
  const [page, setPage] = useState(0);
  const [edit, setEdit] = useState(false);
  const [sound, setSound] = useState(true);
  const [savePulse, setSavePulse] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE);
    if (raw) {
      try { setState(JSON.parse(raw)); } catch { /* keep defaults */ }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE, JSON.stringify(state));
    setSavePulse(true);
    const id = window.setTimeout(() => setSavePulse(false), 900);
    return () => window.clearTimeout(id);
  }, [state]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      if (e.key.toLowerCase() === 'e') setEdit(v => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const pageCount = 2 + state.entries.length;
  const entryIndex = page >= 2 ? page - 2 : -1;
  const activeEntry = entryIndex >= 0 ? state.entries[entryIndex] : null;

  function next() { setPage(p => Math.min(p + 1, pageCount - 1)); }
  function prev() { setPage(p => Math.max(p - 1, 0)); }

  function updateActive(patch: Partial<Entry>) {
    if (!activeEntry) return;
    setState(s => ({ ...s, entries: s.entries.map(e => e.id === activeEntry.id ? { ...e, ...patch } : e) }));
  }

  function addEntry() {
    const nextEntry: Entry = { id: uid(), date: todayString(), mood: '✨', weather: '☀️', text: '', image: '', audio: '' };
    setState(s => ({ ...s, entries: [...s.entries, nextEntry] }));
    setPage(2 + state.entries.length);
    setEdit(true);
  }

  function duplicateEntry() {
    if (!activeEntry) return;
    const clone = { ...activeEntry, id: uid(), date: todayString() };
    setState(s => ({ ...s, entries: [...s.entries, clone] }));
    setPage(2 + state.entries.length);
  }

  function handleFile(type: 'image' | 'audio', file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateActive({ [type]: String(reader.result) });
    reader.readAsDataURL(file);
  }

  const title = useMemo(() => page === 0 ? 'DEKA NOTEBOOK' : page === 1 ? 'A LITTLE PLACE FOR US' : activeEntry?.date ?? '', [page, activeEntry]);

  return (
    <main className="scene" onTouchStart={e => { touchStartX.current = e.changedTouches[0].clientX; }} onTouchEnd={e => {
      if (touchStartX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
      touchStartX.current = null;
    }}>
      <div className="ambient" />
      <header className="toolbar">
        <div className="brand"><Heart size={16} fill="currentColor" /> DEKA</div>
        <div className="toolbar-actions">
          <button onClick={() => setSound(v => !v)} aria-label="toggle rustle sound">{sound ? <Volume2 size={18}/> : <VolumeX size={18}/>}</button>
          <button onClick={() => setEdit(v => !v)}>{edit ? 'Done' : 'Edit'}</button>
          <span className="saved">{savePulse ? 'Saved' : 'Auto-saved'}</span>
        </div>
      </header>

      <section className="desk" aria-label="digital notebook">
        <AnimatePresence mode="wait">
          {page === 0 ? (
            <motion.button
              key="cover"
              className={`cover ${state.coverOpened ? 'opened' : ''}`}
              initial={{ rotateY: -3, y: 15, scale: .98 }}
              animate={{ rotateY: 0, y: 0, scale: 1 }}
              exit={{ rotateY: 90, x: 35, opacity: 0, transition: { duration: .7 } }}
              transition={{ type: 'spring', stiffness: 80, damping: 16 }}
              onClick={() => { setState(s => ({ ...s, coverOpened: true })); next(); }}
            >
              <span className="cover-stitch" />
              <span className="cover-corner top-left" />
              <span className="cover-corner bottom-right" />
              <div className="cover-emblem">✦</div>
              <div className="cover-title">DEKA NOTEBOOK</div>
              <div className="cover-subtitle">our little life, one page at a time</div>
              <div className="cover-footer">EST. 25.07.2026</div>
              <span className="ribbon" />
            </motion.button>
          ) : (
            <motion.div key={page} className="book-wrap" initial={{ rotateY: page > 0 ? -10 : 10, x: page > 0 ? 16 : -16, opacity: .65 }} animate={{ rotateY: 0, x: 0, opacity: 1 }} transition={{ duration: .55, ease: 'easeOut' }}>
              <article className="paper">
                <div className="paper-shadow" />
                <div className="margin-line" />
                {page === 1 ? (
                  <section className="dedication spread">
                    <div className="eyebrow"><span>✦</span> THE DEDICATION <span>✦</span></div>
                    <h1>A little place for us.</h1>
                    <p className="handwritten">For the two of us —<br/>for every laugh, every tiny fight,<br/>every “remember when…”,<br/>and every ordinary day worth keeping.</p>
                    <label className="photo-frame">
                      {state.dedication.startsWith('data:image') ? <img src={state.dedication} alt="couple"/> : <><ImagePlus size={25}/><span>Place our favorite photograph here</span></>}
                      <input type="file" accept="image/*" hidden onChange={e => {
                        const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setState(s => ({...s, dedication: String(r.result)})); r.readAsDataURL(f);
                      }}/>
                    </label>
                    {!state.dedication.startsWith('data:image') && edit && <textarea className="dedication-note" value={state.dedication} onChange={e => setState(s => ({...s, dedication: e.target.value}))} />}
                    <div className="flourish">❦</div>
                    <button className="text-link" onClick={() => setPage(2)}>Begin the story →</button>
                  </section>
                ) : activeEntry ? (
                  <section className="entry spread">
                    <div className="entry-topline">
                      <div>
                        {edit ? <input className="date-input" value={activeEntry.date} onChange={e => updateActive({date: e.target.value})} /> : <div className="date-display">{activeEntry.date}</div>}
                        <div className="entry-label">A PAGE FROM OUR LIFE</div>
                      </div>
                      <div className="stamps">
                        <button className="stamp" title="mood" onClick={() => { const idx = moods.indexOf(activeEntry.mood); updateActive({ mood: moods[(idx+1) % moods.length] }); }}>{activeEntry.mood}</button>
                        <button className="stamp" title="weather" onClick={() => { const idx = weather.indexOf(activeEntry.weather); updateActive({ weather: weather[(idx+1) % weather.length] }); }}>{activeEntry.weather}</button>
                      </div>
                    </div>
                    <div className="rule" />
                    {edit ? <textarea className="entry-editor" value={activeEntry.text} placeholder="Write today’s memory…" onChange={e => updateActive({text: e.target.value})} /> : <div className="entry-text">{activeEntry.text}</div>}
                    <div className="media-grid">
                      <label className="media-card">
                        {activeEntry.image ? <img src={activeEntry.image} alt="memory"/> : <><ImagePlus size={22}/><span>Photo</span></>}
                        <input type="file" accept="image/*" hidden disabled={!edit} onChange={e => handleFile('image', e.target.files?.[0])}/>
                      </label>
                      <label className="media-card audio-card">
                        {activeEntry.audio ? <audio controls src={activeEntry.audio}/> : <><Music2 size={22}/><span>Song / voice note</span></>}
                        <input type="file" accept="audio/*" hidden disabled={!edit} onChange={e => handleFile('audio', e.target.files?.[0])}/>
                      </label>
                    </div>
                    <div className="page-footer">
                      <span>{entryIndex + 1} / {state.entries.length}</span>
                      <span className="footer-heart">♡</span>
                      {edit && <button className="duplicate" onClick={duplicateEntry}>Duplicate page</button>}
                    </div>
                  </section>
                ) : null}
              </article>
            </motion.div>
          )}
        </AnimatePresence>

        <button className="nav prev" onClick={prev} disabled={page === 0}><ChevronLeft size={24}/></button>
        <button className="nav next" onClick={next} disabled={page === pageCount - 1}><ChevronRight size={24}/></button>
      </section>

      <footer className="bottom-bar">
        <div className="progress"><span>{page + 1}</span><i/><span>{pageCount}</span></div>
        {page >= 1 && <button className="new-entry" onClick={addEntry}><Plus size={18}/> New page</button>}
        <div className="hint"><BookOpen size={15}/> Use ← →, spacebar, or swipe</div>
      </footer>
    </main>
  );
}
