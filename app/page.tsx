'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, ImagePlus, Music2, Volume2, VolumeX, Heart, Sparkles, CalendarDays, Trash2, Camera, Plus, X, PenLine, Eye, LayoutDashboard, Save } from 'lucide-react';

type Entry = { id: string; date: string; mood: string; weather: string; text: string; image: string; audio: string; };
type NotebookState = { entries: Entry[]; dedication: string; dedicationPhoto?: string; coverOpened: boolean; };
type Turn = { from: number; to: number; direction: 1 | -1 };
type Mode = 'home' | 'reader' | 'studio';

const STORAGE = 'deka-notebook-v2';
const initialEntries: Entry[] = [{ id: 'first', date: '25.07.2026', mood: '💛', weather: '☀️', text: 'The day our story quietly began.\n\nWrite everything you remember here… the place, the first words, the tiny details you never want to forget.', image: '', audio: '' }];
const moods = ['💛', '❤️', '🥹', '😂', '🫶', '🌙', '✨', '🌸'];
const weather = ['☀️', '🌤️', '🌧️', '⛅', '🌙', '☁️', '🌈'];
function todayString() { const d = new Date(); return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`; }
function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2)}`; }

export default function Page() {
  const [state, setState] = useState<NotebookState>({ entries: initialEntries, dedication: 'For the two of us — and every ordinary day that became a memory.', coverOpened: false });
  const [mode, setMode] = useState<Mode>('home');
  const [page, setPage] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [edit, setEdit] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [savePulse, setSavePulse] = useState(false);
  const [sound, setSound] = useState(true);
  const [heartBurst, setHeartBurst] = useState(0);
  const [showIndex, setShowIndex] = useState(false);
  const [openingCover, setOpeningCover] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);
  const turnTimer = useRef<number | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as NotebookState;
      setState({ ...parsed, coverOpened: false });
      setDirty(false);
    } catch {}
  }, []);

  useEffect(() => () => { if (turnTimer.current) window.clearTimeout(turnTimer.current); }, []);

  function patchState(updater: (s: NotebookState) => NotebookState) { setState(updater); setDirty(true); }
  function saveChanges() { window.localStorage.setItem(STORAGE, JSON.stringify(state)); setDirty(false); setSavePulse(true); window.setTimeout(() => setSavePulse(false), 1200); }

  function playPageRustle() {
    if (!sound || typeof window === 'undefined') return;
    try {
      const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx(); const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.12), ctx.sampleRate); const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2.2) * 0.028;
      const source = ctx.createBufferSource(); const filter = ctx.createBiquadFilter(); const gain = ctx.createGain();
      filter.type = 'bandpass'; filter.frequency.value = 2200; filter.Q.value = 0.6; source.buffer = buffer; gain.gain.value = 0.55; source.connect(filter); filter.connect(gain); gain.connect(ctx.destination); source.start(); window.setTimeout(() => ctx.close(), 220);
    } catch {}
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.ctrlKey && e.key.toLowerCase() === 's') { e.preventDefault(); if (mode === 'studio' && dirty) saveChanges(); return; }
      if (mode === 'reader') { if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); } if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); } }
      if (e.key.toLowerCase() === 'h') makeHearts();
      if (e.key === 'Escape') { setShowIndex(false); setDeleteTarget(null); }
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  });

  const entryPage = (index: number) => index + 3;
  const pageCount = 3 + state.entries.length;
  const shownPage = turn?.to ?? page;
  const shownEntryIndex = shownPage >= 3 ? shownPage - 3 : -1;
  const shownEntry = shownEntryIndex >= 0 ? state.entries[shownEntryIndex] : null;
  const shownBirthday = shownEntry?.date === '09.09.2026';
  const title = useMemo(() => shownEntry?.date ?? '', [shownEntry]);

  function startTurn(target: number) {
    if (turn || target < 1 || target >= pageCount || target === page) return;
    const direction: 1 | -1 = target > page ? 1 : -1; playPageRustle(); setTurn({ from: page, to: target, direction });
    if (turnTimer.current) window.clearTimeout(turnTimer.current);
    turnTimer.current = window.setTimeout(() => { setPage(target); setTurn(null); }, 860);
  }
  function next() { if (mode === 'reader') startTurn(page + 1); }
  function prev() { if (mode === 'reader' && page > 3) startTurn(page - 1); }
  function openCover() { if (openingCover || page !== 0) return; setOpeningCover(true); setTimeout(() => { setPage(2); setOpeningCover(false); }, 650); }
  function closeToCover() { if (openingCover || turn) return; setOpeningCover(true); setMode('home'); setEdit(false); setDirty(false); setTimeout(() => { setPage(0); setOpeningCover(false); }, 560); }
  function enterModeHome() { setPage(2); setMode('home'); setEdit(false); setShowIndex(false); }
  function enterReader(entryIndex = 0) { setPage(entryPage(entryIndex)); setMode('reader'); setEdit(false); setDirty(false); }
  function enterStudio(entryIndex = 0) { setPage(entryPage(entryIndex)); setMode('studio'); setEdit(true); setDirty(false); }
  function selectEntry(i: number, targetMode: Mode = mode) { setPage(entryPage(i)); setMode(targetMode); setEdit(targetMode === 'studio'); setShowIndex(false); }
  function selectOpeningPage() { setPage(1); setMode('studio'); setEdit(true); }

  function updateActive(patch: Partial<Entry>) { const entry = state.entries[page - 3]; if (!entry) return; patchState(s => ({ ...s, entries: s.entries.map(e => e.id === entry.id ? { ...e, ...patch } : e) })); }
  function updateOpening(patch: Partial<Entry>) { const first = state.entries[0]; if (!first) return; patchState(s => ({ ...s, entries: s.entries.map((e, i) => i === 0 ? { ...e, ...patch } : e) })); }
  function addEntry() { const nextEntry: Entry = { id: uid(), date: todayString(), mood: '✨', weather: '☀️', text: '', image: '', audio: '' }; patchState(s => ({ ...s, entries: [...s.entries, nextEntry] })); setPage(entryPage(state.entries.length)); setMode('studio'); setEdit(true); }
  function duplicateEntry() { const entry = state.entries[page - 3]; if (!entry) return; const clone = { ...entry, id: uid(), date: todayString() }; patchState(s => ({ ...s, entries: [...s.entries, clone] })); setPage(entryPage(state.entries.length)); setMode('studio'); setEdit(true); }
  function requestDelete(id: string) { if (state.entries.length > 1) setDeleteTarget(id); }
  function confirmDelete() { if (!deleteTarget || state.entries.length <= 1) return; const index = state.entries.findIndex(e => e.id === deleteTarget); if (index < 0) { setDeleteTarget(null); return; } patchState(s => ({ ...s, entries: s.entries.filter(e => e.id !== deleteTarget) })); setPage(Math.max(3, Math.min(page, 2 + state.entries.length - 1))); setDeleteTarget(null); }
  function handleFile(type: 'image' | 'audio', file?: File) { if (!file || !edit) return; const reader = new FileReader(); reader.onload = () => updateActive({ [type]: String(reader.result) }); reader.readAsDataURL(file); }
  function handleOpeningImage(file?: File) { if (!file || !edit) return; const reader = new FileReader(); reader.onload = () => updateOpening({ image: String(reader.result) }); reader.readAsDataURL(file); }
  function makeHearts() { setHeartBurst(v => v + 1); window.setTimeout(() => setHeartBurst(v => v + 1), 700); }
  function removeEntryMedia(type: 'image' | 'audio') { updateActive({ [type]: '' }); }
  function removeOpeningMedia(type: 'image' | 'audio') { updateOpening({ [type]: '' }); }

  function renderCover() {
    return <motion.button key="cover" className={`cover ${openingCover ? 'opened' : ''}`} initial={{ rotateY: -8, y: 14, scale: .985 }} animate={{ rotateY: openingCover ? -72 : 0, y: 0, scale: openingCover ? .985 : 1 }} transition={{ duration: openingCover ? .65 : .35, ease: [0.2, 0.75, 0.2, 1] }} onClick={openCover} disabled={openingCover} aria-label="Open the DEKA diary">
      <span className="cover-rim"/><span className="cover-stitch"/><span className="cover-corner top-left"/><span className="cover-corner top-right"/><span className="cover-corner bottom-left"/><span className="cover-corner bottom-right"/><span className="cover-band"/>
      <div className="cover-small">PRIVATE JOURNAL</div><div className="cover-monogram">DB</div><div className="cover-title">DEKA</div><div className="cover-rule"><i/><span>♡</span><i/></div><div className="cover-subtitle">OUR DAYS · OUR WORDS · OUR MEMORIES</div><div className="cover-name">only for my girl <span>♥</span></div><div className="cover-footer"><span>25 · 07 · 2026</span><span>VOL. I</span></div><span className="ribbon"/><span className="cover-edge-label">OURS</span><span className="cover-open-hint">tap to open · our story begins here</span>
    </motion.button>;
  }

  function renderOpeningPage() {
    const first = state.entries[0]; if (!first) return null;
    const canEdit = mode === 'studio' && edit && page === 1;
    return <section className="opening-page entry-like-opening spread">
      <div className="opening-soft-corner opening-soft-corner-a"/><div className="opening-soft-corner opening-soft-corner-b"/>
      <div className="entry-topline opening-entry-topline"><div>{canEdit ? <input className="date-input" value={first.date} onChange={e => updateOpening({ date: e.target.value })}/> : <div className="date-display">{first.date}</div>}<div className="entry-label">A PAGE FROM OUR LIFE</div></div><div className="stamps"><button className="stamp" disabled={!canEdit} onClick={() => { const i = moods.indexOf(first.mood); updateOpening({ mood: moods[(i + 1) % moods.length] }); }}>{first.mood}</button><button className="stamp" disabled={!canEdit} onClick={() => { const i = weather.indexOf(first.weather); updateOpening({ weather: weather[(i + 1) % weather.length] }); }}>{first.weather}</button></div></div>
      <div className="rule"/>
      {canEdit ? <textarea className="entry-editor opening-entry-editor" value={first.text} placeholder="Write everything you remember here…" onChange={e => updateOpening({ text: e.target.value })}/> : <div className="entry-text opening-entry-text">{first.text}</div>}
      <div className="opening-memory-grid media-grid">
        <div className="media-card media-photo">{first.image ? <><img src={first.image} alt="our first memory"/>{canEdit && <button type="button" className="remove-media" onClick={() => removeOpeningMedia('image')}><Trash2 size={14}/></button>}</> : canEdit ? <label className="media-upload" htmlFor="opening-image"><ImagePlus size={22}/><span>Add our photo</span></label> : <div className="media-empty"><ImagePlus size={20}/><span>No photo yet</span></div>}{canEdit && <input id="opening-image" type="file" accept="image/*" hidden onChange={e => handleOpeningImage(e.target.files?.[0])}/>}</div>
        <div className="media-card audio-card">{first.audio ? <><audio controls src={first.audio}/>{canEdit && <button type="button" className="remove-media" onClick={() => removeOpeningMedia('audio')}><Trash2 size={14}/></button>}</> : canEdit ? <label className="media-upload" htmlFor="opening-audio"><Music2 size={22}/><span>Add song / voice</span></label> : <div className="media-empty"><Music2 size={20}/><span>No audio yet</span></div>}{canEdit && <input id="opening-audio" type="file" accept="audio/*" hidden onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => updateOpening({ audio: String(r.result) }); r.readAsDataURL(f); }}/>}</div>
      </div>
      <div className="page-footer opening-footer"><span>Memory 1 of {state.entries.length}</span><span className="footer-heart">♡</span></div>
    </section>;
  }

  function renderModeHome() {
    const latest = state.entries[state.entries.length - 1];
    return <main className="mode-home romantic-mode-home preview-mode-home" aria-label="Choose notebook mode">
      <div className="mode-home-glow"/>
      <header className="mode-home-head"><div className="mode-brand"><Heart size={17} fill="currentColor"/> DEKA</div><div className="mode-meta">OUR PRIVATE NOTEBOOK · 25.07.2026 → FOREVER</div><button className="mode-heart" onClick={makeHearts}><Heart size={17} fill="currentColor"/></button></header>
      <section className="preview-layout">
        <div className="preview-copy"><div className="mode-kicker">FIRST PAGE · PREVIEW</div><h1>Our story,<br/><em>already begun.</em></h1><p>This is the first page we keep.<br/>Choose whether you want to relive it<br/>or write the next memory.</p><div className="preview-rule"><span>♡</span></div><div className="preview-meta">25.07.2026 · THE DAY IT BEGAN</div></div>
        <div className="preview-paper-wrap"><article className="paper preview-paper">{renderOpeningPage()}</article><div className="preview-paper-shadow"/></div>
        <div className="preview-actions"><div className="preview-actions-kicker">WHAT DO YOU WANT TO DO?</div><motion.button className="preview-choice reader-choice" whileHover={{ y: -5 }} whileTap={{ scale: .985 }} onClick={() => enterReader(0)}><span className="choice-number">01</span><div><h2>Our Diary</h2><p>Open the real diary and turn through everything we've written.</p><strong><Eye size={15}/> READ OUR STORY <ChevronRight size={15}/></strong></div></motion.button><motion.button className="preview-choice studio-choice" whileHover={{ y: -5 }} whileTap={{ scale: .985 }} onClick={() => enterStudio(state.entries.length - 1)}><span className="choice-number">02</span><div><h2>Write With Us</h2><p>Write, edit, add photos, attach songs or voice notes, and create new pages.</p><strong><PenLine size={15}/> OPEN WRITING DESK <ChevronRight size={15}/></strong></div></motion.button><div className="preview-footer-note"><span>{state.entries.length} {state.entries.length === 1 ? 'memory' : 'memories'} kept</span><span>latest · {latest?.date}</span></div></div>
      </section>
    </main>;
  }

  function renderEntry(index: number) {
    if (index === 1) return renderOpeningPage();
    const entryIndex = index - 3; const entry = entryIndex >= 0 ? state.entries[entryIndex] : null; if (!entry) return null;
    const birthday = entry.date === '09.09.2026'; const canEdit = mode === 'studio' && edit && index === page;
    return <section className={`entry spread ${mode === 'reader' ? 'reader-entry' : 'studio-entry'}`}>
      {birthday && <motion.div className="birthday-banner" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}><Sparkles size={15}/> 09.09.2026 · A SPECIAL PAGE FOR YOU <Sparkles size={15}/></motion.div>}
      <div className="entry-topline"><div>{canEdit ? <input className="date-input" value={entry.date} onChange={e => updateActive({ date: e.target.value })}/> : <div className="date-display">{entry.date}</div>}<div className="entry-label">{birthday ? 'THE DAY WE CELEBRATE YOU' : 'A PAGE FROM OUR LIFE'}</div></div><div className="stamps"><button className="stamp" disabled={!canEdit} onClick={() => { const i = moods.indexOf(entry.mood); updateActive({ mood: moods[(i + 1) % moods.length] }); }}>{entry.mood}</button><button className="stamp" disabled={!canEdit} onClick={() => { const i = weather.indexOf(entry.weather); updateActive({ weather: weather[(i + 1) % weather.length] }); }}>{entry.weather}</button></div></div>
      <div className="rule"/>{birthday && <p className="birthday-line">Happy birthday, my girl. From this page onward, we write our story together. ♡</p>}
      {canEdit ? <textarea className="entry-editor" value={entry.text} placeholder="Write today's memory…" onChange={e => updateActive({ text: e.target.value })}/> : <div className="entry-text">{entry.text}</div>}
      <div className="media-grid"><div className="media-card media-photo">{entry.image ? <><img src={entry.image} alt="memory"/>{canEdit && <button type="button" className="remove-media" onClick={() => removeEntryMedia('image')}><Trash2 size={14}/></button>}</> : canEdit ? <label className="media-upload" htmlFor={`image-${entry.id}`}><ImagePlus size={22}/><span>Add photo</span></label> : <div className="media-empty"><ImagePlus size={20}/><span>No photo yet</span></div>}{canEdit && <input id={`image-${entry.id}`} type="file" accept="image/*" hidden onChange={e => handleFile('image', e.target.files?.[0])}/>}</div><div className="media-card audio-card">{entry.audio ? <><audio controls src={entry.audio}/>{canEdit && <button type="button" className="remove-media" onClick={() => removeEntryMedia('audio')}><Trash2 size={14}/></button>}</> : canEdit ? <label className="media-upload" htmlFor={`audio-${entry.id}`}><Music2 size={22}/><span>Add song / voice</span></label> : <div className="media-empty"><Music2 size={20}/><span>No audio yet</span></div>}{canEdit && <input id={`audio-${entry.id}`} type="file" accept="audio/*" hidden onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => updateActive({ audio: String(r.result) }); r.readAsDataURL(f); }}/>}</div></div>
      <div className="page-footer"><span>Memory {entryIndex + 1} of {state.entries.length}</span><span className="footer-heart">♡</span>{canEdit && <><button className="duplicate" onClick={duplicateEntry}>Duplicate page</button><button className="delete-page" onClick={() => requestDelete(entry.id)} disabled={state.entries.length <= 1}><Trash2 size={14}/> Remove page</button></>}</div>
    </section>;
  }

  const baseIndex = turn?.to ?? page; const frontIndex = turn?.from ?? page;
  if (mode === 'home' && page === 0) return <main className="scene desktop-notebook cover-scene" aria-label="Deka Notebook"><div className="ambient"/><section className="desk physical-desk">{renderCover()}</section></main>;
  if (mode === 'home' && page === 2) return <div className="mode-shell">{heartBurst > 0 && <div className="heart-layer">{Array.from({ length: 14 }, (_, i) => <motion.span key={`${heartBurst}-${i}`} initial={{ x: '50%', y: '58%', scale: 0, opacity: 0 }} animate={{ x: `${12 + (i * 67) % 76}%`, y: `${18 + (i * 31) % 68}%`, scale: [0, 1.1, .8], opacity: [0, 1, 0] }} transition={{ duration: 1.8, delay: (i % 5) * .05 }} className="floating-heart">{i % 3 === 0 ? '❤️' : '♥'}</motion.span>)}</div>}{renderModeHome()}</div>;

  return <main className={`scene desktop-notebook split-mode ${mode}-mode`} aria-label={`Deka ${mode}`} onTouchStart={e => { touchStartX.current = e.changedTouches[0].clientX; }} onTouchEnd={e => { if (touchStartX.current === null) return; const dx = e.changedTouches[0].clientX - touchStartX.current; if (mode === 'reader' && Math.abs(dx) > 60) (dx < 0 ? next : prev)(); touchStartX.current = null; }}>
    <div className="ambient"/><div className="heart-layer" aria-hidden="true">{heartBurst > 0 && Array.from({ length: 14 }, (_, i) => <motion.span key={`${heartBurst}-${i}`} initial={{ x: '50%', y: '58%', scale: 0, opacity: 0 }} animate={{ x: `${12 + (i * 67) % 76}%`, y: `${18 + (i * 31) % 68}%`, scale: [0, 1.1, .8], opacity: [0, 1, 0] }} transition={{ duration: 1.8, delay: (i % 5) * .05 }} className="floating-heart">{i % 3 === 0 ? '❤️' : '♥'}</motion.span>)}</div>
    <header className="toolbar split-toolbar"><div className="brand"><Heart size={16} fill="currentColor"/> DEKA</div><div className="mode-switch"><button className={mode === 'reader' ? 'active' : ''} onClick={() => { setMode('reader'); setEdit(false); setDirty(false); if (page < 3) setPage(3); }}><Eye size={15}/> Our Diary</button><button className={mode === 'studio' ? 'active' : ''} onClick={() => { setMode('studio'); setEdit(true); setDirty(false); if (page < 3) setPage(3); }}><PenLine size={15}/> Writing Desk</button></div><div className="toolbar-actions"><button onClick={enterModeHome} title="Choose mode"><LayoutDashboard size={17}/></button><button onClick={makeHearts} title="Send love"><Heart size={17} fill="currentColor"/></button>{mode === 'reader' && <button onClick={() => setShowIndex(v => !v)} title="Open pages"><BookOpen size={17}/></button>}<button onClick={() => setSound(v => !v)} title="Page sound">{sound ? <Volume2 size={18}/> : <VolumeX size={18}/>}</button>{mode === 'studio' && <button className={`save-top ${dirty ? 'needs-save' : 'saved-state'} ${savePulse ? 'save-success' : ''}`} onClick={saveChanges} disabled={!dirty && !savePulse}><Save size={15}/>{savePulse ? 'Saved' : dirty ? 'Save changes' : 'Saved'}</button>}</div></header>
    {mode === 'reader' && <div className="reader-title"><span>{title}</span><small>READ-ONLY MEMORY VIEW</small></div>}
    {mode === 'studio' && <div className="studio-title"><div><span>WRITING DESK</span><small>MAKE THE NEXT PAGE OF US</small></div><button onClick={() => setEdit(v => !v)}>{edit ? 'Editing' : 'View'}</button></div>}
    <AnimatePresence>{showIndex && mode === 'reader' && <motion.aside className="index-panel" initial={{ x: 380, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 380, opacity: 0 }}><div className="index-head"><span>OUR STORY</span><button onClick={() => setShowIndex(false)}><X size={17}/></button></div>{state.entries.map((e, i) => <div className="index-row" key={e.id}><button className={`index-item ${page === entryPage(i) ? 'active' : ''}`} onClick={() => selectEntry(i, 'reader')}><span>{e.date} <b>{e.mood}</b></span><small>{i === 0 ? 'Where it all began' : 'A page from our life'}</small></button></div>)}</motion.aside>}</AnimatePresence>
    <section className="desk physical-desk split-desk" aria-label={mode === 'reader' ? 'diary reader' : 'writing desk'}>{mode === 'studio' && <aside className="studio-sidebar"><div className="studio-sidebar-head"><span>YOUR PAGES</span><button onClick={addEntry}><Plus size={16}/></button></div><button className={`studio-page-item opening-page-item ${page === 1 ? 'active' : ''}`} onClick={selectOpeningPage}><span>00</span><div><strong>First page</strong><small>25.07.2026 · where it began</small></div><b>♡</b></button>{state.entries.map((e, i) => <button key={e.id} className={`studio-page-item ${page === entryPage(i) ? 'active' : ''}`} onClick={() => selectEntry(i, 'studio')}><span>{String(i + 1).padStart(2, '0')}</span><div><strong>{e.date}</strong><small>{e.text?.replace(/\n/g, ' ').slice(0, 38) || 'Untitled memory'}</small></div><b>{e.mood}</b></button>)}<button className="studio-new-page" onClick={addEntry}><Plus size={17}/> Add new page</button></aside>}
      <div className="book-stage" aria-live="polite"><article className={`paper paper-base ${shownBirthday ? 'birthday-paper' : ''}`}>{renderEntry(baseIndex)}</article>{turn && mode === 'reader' && <div className={`turn-sheet ${turn.direction > 0 ? 'turn-forward' : 'turn-backward'}`}><article className="paper turn-front">{renderEntry(frontIndex)}</article><article className="paper turn-back">{renderEntry(baseIndex)}</article><span className="turn-shadow"/><span className="turn-highlight"/></div>}</div>
      {mode === 'reader' && <><button className="nav prev" onClick={prev} disabled={page <= 3 || !!turn}><ChevronLeft size={25}/></button><button className="nav next" onClick={next} disabled={page >= pageCount - 1 || !!turn}><ChevronRight size={25}/></button></>}
    </section>
    <footer className="bottom-bar split-bottom"><div className="progress"><span>{Math.max(1, page - 2)}</span><i/><span>{state.entries.length}</span></div>{mode === 'studio' ? <><button className={`new-entry ${dirty ? 'save-bottom-active' : ''}`} onClick={dirty ? saveChanges : addEntry}>{dirty ? <><Save size={17}/> Save changes</> : <><Plus size={18}/> New page</>}</button><div className="hint">{dirty ? 'UNSAVED CHANGES · CTRL + S TO SAVE' : savePulse ? 'ALL CHANGES SAVED' : 'WRITE · EDIT · ADD · KEEP'}</div></> : <><button className="love-button" onClick={() => enterStudio(shownEntryIndex >= 0 ? shownEntryIndex : 0)}><PenLine size={15}/> Edit this memory</button><div className="hint"><CalendarDays size={15}/> 25.07.2026 → forever</div></>}</footer>
    <AnimatePresence>{deleteTarget && <motion.div className="notebook-confirm-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={e => { if (e.currentTarget === e.target) setDeleteTarget(null); }}><motion.div className="notebook-confirm" initial={{ y: 18, scale: .97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 10, scale: .98 }}><div className="notebook-confirm-icon">♢</div><div className="notebook-confirm-kicker">REMOVE MEMORY</div><h2>Let this page go?</h2><p>The memory dated <strong>{state.entries.find(e => e.id === deleteTarget)?.date}</strong> will be removed from this notebook.</p><div className="notebook-confirm-actions"><button type="button" onClick={() => setDeleteTarget(null)}>Keep page</button><button type="button" onClick={confirmDelete}>Remove page</button></div></motion.div></motion.div>}</AnimatePresence>
  </main>;
}
