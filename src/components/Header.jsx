import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, ChevronDown, CircleHelp, Menu as MenuIcon, Search, X } from 'lucide-react';
import { Menu } from './Common.jsx';
import Flag from './Flag.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { COMPANIES, LANGS, NAV, NOTIFICATIONS, USERS } from '../data/mockData.js';

function GlobalSearch({ onPick }) {
  const { t } = useI18n();
  const [q, setQ] = useState(''); const [open, setOpen] = useState(false); const [idx, setIdx] = useState(0);
  const ref = useRef(null); const box = useRef(null);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase(); if (!s) return [];
    const all = [
      ...NAV.flatMap((g) => g.items).map((n) => ({ type: t('type.page'), label: t(`nav.${n.id}`), nav: n.id })),
      ...COMPANIES.map((c) => ({ type: t('type.company'), label: c.name, company: c })),
      ...USERS.map((u) => ({ type: t('type.user'), label: u })),
    ];
    return all.filter((r) => r.label.toLowerCase().includes(s)).slice(0, 8);
  }, [q, t]);
  useEffect(() => {
    const k = (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); ref.current?.focus(); setOpen(true); } };
    const h = (e) => { if (!box.current?.contains(e.target)) setOpen(false); };
    window.addEventListener('keydown', k); document.addEventListener('mousedown', h);
    return () => { window.removeEventListener('keydown', k); document.removeEventListener('mousedown', h); };
  }, []);
  const pick = (r) => { onPick(r); setOpen(false); setQ(''); setIdx(0); };
  const onKey = (e) => {
    if (e.key === 'Escape') { setOpen(false); ref.current.blur(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && results[idx]) pick(results[idx]);
  };
  return (
    <div className="search" ref={box}>
      <Search size={17} className="s-ic" />
      <input ref={ref} value={q} placeholder={t('search.ph')} onChange={(e) => { setQ(e.target.value); setOpen(true); setIdx(0); }} onFocus={() => setOpen(true)} onKeyDown={onKey} />
      {open && q && (
        <div className="pop left search-pop">
          {results.length === 0 && <div className="empty">{t('search.none', { q })}</div>}
          {results.map((r, i) => (<div className={`item ${i === idx ? 'hl' : ''}`} key={i} onMouseEnter={() => setIdx(i)} onClick={() => pick(r)}><span>{r.label}</span><small>{r.type}</small></div>))}
        </div>)}
    </div>
  );
}

export default function Header({ onToggle, onPick, toast, go, onSignOut }) {
  const { t, lang, setLang } = useI18n();
  const [notes, setNotes] = useState(NOTIFICATIONS);
  const cur = LANGS.find((l) => l.code === lang);
  return (
    <header className="topbar">
      <button className="icon-btn" onClick={onToggle} aria-label="Menu"><MenuIcon size={22} /></button>
      <GlobalSearch onPick={onPick} />
      <div className="grow" />
      <Menu button={<span className="bell"><Bell size={21} />{notes.length > 0 && <em>12</em>}</span>} cls="notif">{(close) => (<>
        <div className="pop-h">{t('notif.title')}<button className="icon-btn" onClick={close} aria-label={t('close')}><X size={16} /></button></div>
        {notes.length === 0 && <div className="empty">{t('notif.empty')}</div>}
        {notes.map((n, i) => <div className="note" key={i}><span>{t(n.k, n.p)}</span><small>{t(n.ago[0], { n: n.ago[1] })}</small></div>)}
        <button className="btn-sm wide" onClick={() => setNotes([])}>{t('notif.read')}</button></>)}</Menu>
      <Menu button={<span className="icon-btn"><CircleHelp size={22} /></span>}>{(close) => (<>
        <div className="item" onClick={() => { toast(t('help.centerMsg')); close(); }}>{t('help.center')}</div>
        <div className="item" onClick={() => { toast(t('help.shortcutsMsg')); close(); }}>{t('help.shortcuts')}</div>
        <div className="item" onClick={() => { go('tickets'); close(); }}>{t('help.support')}</div></>)}</Menu>
      <Menu button={<span className="lang"><Flag code={cur.code} />{cur.short}<ChevronDown size={14} /></span>}>{(close) => LANGS.map((l) => (
        <div key={l.code} className={`item lang-item ${l.code === lang ? 'sel' : ''}`} onClick={() => { setLang(l.code); close(); }}><span><Flag code={l.code} size={18} />{l.name}</span></div>))}</Menu>
      <Menu button={<span className="profile"><span className="pav">DM</span><span><b>David Miller</b><small>{t('role')}</small></span><ChevronDown size={14} /></span>}>{(close) => [['prof.profile'], ['prof.settings'], ['prof.signout']].map(([k]) => (
        <div key={k} className="item" onClick={() => { close(); if (k === 'prof.signout' && onSignOut) { onSignOut(); return; } toast(t('prof.demo', { label: t(k) })); }}>{t(k)}</div>))}</Menu>
    </header>
  );
}
