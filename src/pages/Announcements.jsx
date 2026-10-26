import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, ArrowDown, ArrowUp, BarChart3, Ban, CalendarClock, CalendarDays, ChevronDown, ChevronLeft,
  ChevronRight, ChevronUp, Eye, FileText, GraduationCap, Megaphone, Minus, MoreHorizontal, Pencil,
  PieChart as PieIcon, Plus, Search, Send, Settings, ShieldAlert, Trash2, X, Clock3,
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useI18n } from '../i18n/I18nContext.jsx';
import DateRangeMenu from '../components/DateRangeMenu.jsx';
import { addDays, daysBetween, inRange, monthEnd, shiftMonths } from '../data/selectors.js';

import {
  ANNOUNCEMENT_TEXT, AUDIENCES, CATEGORIES, COMPANY_NAMES, CREATORS, CURRENT_USER, PRIORITIES,
  SEED_ANNOUNCEMENTS, STATUSES, TODAY, activityDate,
} from '../data/announcementsData.js';
import './announcements.css';


const LOCALE = { en: 'en-GB', fr: 'fr-FR', de: 'de-DE' };
const DEFAULT_RANGE = { start: '2026-01-01', end: '2026-12-31' };
const PAGE_SIZE = 8;
const CAT_ICON = { system: Settings, product: Megaphone, policy: FileText, general: CalendarDays, training: GraduationCap, security: ShieldAlert };
const CAT_COLOR = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.color]));
const PRI_ORDER = { high: 0, medium: 1, low: 2 };
const ST_ORDER = { published: 0, scheduled: 1, draft: 2, expired: 3 };
const PRI_ICON = { high: ArrowUp, medium: Minus, low: ArrowDown };
const EMPTY_FORM = { title: '', message: '', category: 'general', priority: 'medium', audience: 'all', company: '', status: 'draft', date: '', expiry: '' };

// Session store: keeps edits while the user moves between pages.
let sessionRows = null;

export default function Announcements({ range, setRange, toast = () => {} }) {
  const { lang, t, fmtDate, monthShort } = useI18n();
  const tx = (key, params) => {
    let s = ANNOUNCEMENT_TEXT[lang]?.[key] ?? ANNOUNCEMENT_TEXT.en[key] ?? key;
    if (params) for (const k in params) s = s.split(`{${k}}`).join(params[k]);
    return s;
  };
  const nf = (n) => Number(n).toLocaleString(LOCALE[lang] || 'en-GB');
  const dr = range?.start && range?.end ? range : DEFAULT_RANGE;

  
const [rows, setRows] = useState(() => {
  const seedRows = [...SEED_ANNOUNCEMENTS];

  if (sessionRows === null) {
    sessionRows = seedRows;
  } else {
    const existingIds = new Set(
      sessionRows.map((item) => item.id)
    );

    const missingRows = seedRows.filter(
      (item) => !existingIds.has(item.id)
    );

    if (missingRows.length > 0) {
      sessionRows = [...sessionRows, ...missingRows];
    }
  }

  return sessionRows;
});

useEffect(() => {
  sessionRows = rows;
}, [rows]);


useEffect(() => {
  setRows((currentRows) => {
    const existingIds = new Set(
      currentRows.map((item) => item.id)
    );

    const missingRows = SEED_ANNOUNCEMENTS.filter(
      (item) => !existingIds.has(item.id)
    );

    if (missingRows.length === 0) {
      return currentRows;
    }

    const updatedRows = [...currentRows, ...missingRows];
    sessionRows = updatedRows;

    return updatedRows;
  });
}, []);

  const [q, setQ] = useState('');
  const [tab, setTab] = useState('all');
  const [priority, setPriority] = useState('all');
  const [category, setCategory] = useState('all');
  const [audience, setAudience] = useState('all');
  const [creator, setCreator] = useState('all');
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [panel, setPanel] = useState(null);     // { kind: 'card', id } | { kind: 'view', id } | { kind: 'form', id? }
  const [form, setForm] = useState(null);       // { values, errors, id }
  const [menu, setMenu] = useState(null);       // { id, top, right }
  const [confirm, setConfirm] = useState(null); // announcement pending deletion

  // A new global date range restarts pagination only; every other filter is kept.
  useEffect(() => { setPage(1); }, [dr.start, dr.end]);

  const labelOf = (a) => tx(`cat.${a.category}`);
  const dateInfo = (a) => {
    if (a.status === 'scheduled') return [tx('dScheduledFor'), a.publishAt];
    if (a.status === 'draft') return [tx('dCreated'), a.created];
    return [tx('dPublished'), a.publishAt];
  };

  // ---------- derived data (single source of truth: rows + global range) ----------
  const periodRows = useMemo(
  () =>
    rows.filter((a) => {
      const date = activityDate(a);
      return date && date >= dr.start && date <= dr.end;
    }),
  [rows, dr.start, dr.end]
);
  const matches = (a) => {
    if (priority !== 'all' && a.priority !== priority) return false;
    if (category !== 'all' && a.category !== category) return false;
    if (audience !== 'all' && a.audience !== audience) return false;
    if (creator !== 'all' && a.createdBy !== creator) return false;
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return [a.id, a.title, a.message, a.company, labelOf(a), a.category, a.createdBy].join(' ').toLowerCase().includes(s);
  };
  const scoped = useMemo(() => periodRows.filter(matches), [periodRows, q, priority, category, audience, creator, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const counts = {
    all: scoped.length,
    published: scoped.filter((a) => a.status === 'published').length,
    scheduled: scoped.filter((a) => a.status === 'scheduled').length,
    draft: scoped.filter((a) => a.status === 'draft').length,
    expired: scoped.filter((a) => a.status === 'expired').length,
  };
  const filtered = useMemo(() => {
    const list = scoped.filter((a) => tab === 'all' || a.status === tab);
    const dir = sort.dir === 'asc' ? 1 : -1;
    const cmp = {
      title: (a, b) => a.title.localeCompare(b.title),
      priority: (a, b) => PRI_ORDER[a.priority] - PRI_ORDER[b.priority],
      status: (a, b) => ST_ORDER[a.status] - ST_ORDER[b.status],
      date: (a, b) => activityDate(a).localeCompare(activityDate(b)),
    }[sort.key];
    return [...list].sort((a, b) => dir * (cmp(a, b) || a.id.localeCompare(b.id)));
  }, [scoped, tab, sort]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const shown = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const activeFilters = [q.trim() !== '', priority !== 'all', category !== 'all', audience !== 'all', creator !== 'all', tab !== 'all'].filter(Boolean).length;

  // summary cards (period-based, except Scheduled which is the all-period upcoming pipeline)
  const byStatus = (s) => periodRows.filter((a) => a.status === s);
  const upcoming = rows.filter((a) => a.status === 'scheduled').sort((a, b) => a.publishAt.localeCompare(b.publishAt));
  const totalViews = periodRows.reduce((n, a) => n + a.views, 0);
  const publishedRows = periodRows.filter((a) => a.status === 'published' || a.status === 'expired');
  const avgViews = publishedRows.length ? Math.round(totalViews / publishedRows.length) : 0;
  const important = periodRows.filter((a) => a.priority === 'high');
  const cards = [
    { id: 'total', title: tx('kTotal'), value: nf(periodRows.length), trend: tx('kTotalTrend', { n: nf(byStatus('published').length) }), sub: tx('kTotalSub'), icon: Megaphone, color: 'blue' },
    { id: 'scheduled', title: tx('kScheduled'), value: nf(upcoming.length), trend: tx('kScheduledTrend', { n: nf(byStatus('scheduled').length) }), sub: tx('kScheduledSub'), icon: CalendarClock, color: 'green' },
    { id: 'views', title: tx('kViews'), value: nf(totalViews), trend: tx('kViewsTrend', { n: nf(avgViews) }), sub: tx('kViewsSub'), icon: Eye, color: 'purple' },
    { id: 'important', title: tx('kImportant'), value: nf(important.length), trend: tx('kImportantTrend', { n: nf(important.filter((a) => a.status === 'published').length) }), sub: tx('kImportantSub'), icon: AlertCircle, color: 'red' },
  ];

  // chart data
  const catData = CATEGORIES.map((c) => ({ id: c.id, name: tx(`cat.${c.id}`), value: periodRows.filter((a) => a.category === c.id).length, color: c.color })).filter((d) => d.value > 0);
  const buckets = useMemo(() => {
    const out = [];
    if (daysBetween(dr.start, dr.end) <= 62) {
      for (let s = dr.start; s <= dr.end && out.length < 12; s = addDays(s, 7)) {
        const e = addDays(s, 6) > dr.end ? dr.end : addDays(s, 6);
        out.push({ start: s, end: e, label: `${s.slice(8, 10)} ${monthShort(s)}` });
      }
    } else {
      const multiYear = dr.start.slice(0, 4) !== dr.end.slice(0, 4);
      for (let k = dr.start.slice(0, 7); k <= dr.end.slice(0, 7); k = shiftMonths(k, 1)) {
        const s = `${k}-01` < dr.start ? dr.start : `${k}-01`;
        const e = monthEnd(k) > dr.end ? dr.end : monthEnd(k);
        out.push({ start: s, end: e, label: multiYear ? `${monthShort(k)} ${k.slice(2, 4)}` : monthShort(k) });
      }
    }
    return out.slice(-24).map((b) => {
      const inB = periodRows.filter((a) => { const d = activityDate(a); return d >= b.start && d <= b.end; });
      return {
        label: b.label,
        live: inB.filter((a) => a.status === 'published' || a.status === 'expired').length,
        scheduled: inB.filter((a) => a.status === 'scheduled').length,
        draft: inB.filter((a) => a.status === 'draft').length,
      };
    });
  }, [periodRows, dr.start, dr.end, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const recent = periodRows.filter((a) => a.status === 'published').sort((a, b) => b.publishAt.localeCompare(a.publishAt) || b.id.localeCompare(a.id)).slice(0, 5);

  // ---------- helpers ----------
  const periodLabel = `${fmtDate(dr.start)} – ${fmtDate(dr.end)}`;
  const find = (id) => rows.find((a) => a.id === id);
  const resetFilters = () => { setQ(''); setTab('all'); setPriority('all'); setCategory('all'); setAudience('all'); setCreator('all'); setPage(1); };
  const closeAll = () => { setPanel(null); setForm(null); setMenu(null); };
  const setSortKey = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'date' ? 'desc' : 'asc' }));
  const pushHistory = (a, action, at = TODAY) => [...a.history, { at, action, by: CURRENT_USER }];

  const cardDetail = (id) => {
    const sorted = (list) => [...list].sort((a, b) => activityDate(b).localeCompare(activityDate(a)));
    if (id === 'total') {
      return {
        title: tx('kTotal'),
        rows: [
          [tx('selPeriod'), periodLabel], [tx('cTotalCount'), nf(periodRows.length)],
          [tx('cPublished'), nf(byStatus('published').length)], [tx('cScheduled'), nf(byStatus('scheduled').length)],
          [tx('cDrafts'), nf(byStatus('draft').length)], [tx('cExpired'), nf(byStatus('expired').length)],
          [tx('cHigh'), nf(important.length)], [tx('cViews'), nf(totalViews)],
          ...CATEGORIES.map((c) => [tx(`cat.${c.id}`), nf(periodRows.filter((a) => a.category === c.id).length)]),
        ],
        listTitle: tx('cList'), list: sorted(periodRows),
      };
    }
    if (id === 'scheduled') {
      return {
        title: tx('kScheduled'),
        rows: [
          [tx('cUpcoming'), nf(upcoming.length)], [tx('cInPeriod'), nf(byStatus('scheduled').length)],
          [tx('cNext'), upcoming.length ? fmtDate(upcoming[0].publishAt) : tx('none')],
          ...AUDIENCES.map((a) => [tx('cByAudience', { a: tx(`aud.${a}`) }), nf(upcoming.filter((x) => x.audience === a).length)]),
          [tx('cHigh'), nf(upcoming.filter((a) => a.priority === 'high').length)],
        ],
        listTitle: tx('cListUpcoming'), list: upcoming,
      };
    }
    if (id === 'views') {
      const top = [...periodRows].sort((a, b) => b.views - a.views);
      return {
        title: tx('kViews'),
        rows: [
          [tx('selPeriod'), periodLabel], [tx('cViews'), nf(totalViews)], [tx('cAvgViews'), nf(avgViews)],
          [tx('cTopTitle'), top[0] && top[0].views ? `${top[0].id} · ${nf(top[0].views)}` : tx('none')],
          ...CATEGORIES.map((c) => [tx(`cat.${c.id}`), nf(periodRows.filter((a) => a.category === c.id).reduce((n, a) => n + a.views, 0))]),
        ],
        listTitle: tx('cListViews'), list: top.filter((a) => a.views > 0).slice(0, 6), showViews: true,
      };
    }
    return {
      title: tx('kImportant'),
      rows: [
        [tx('selPeriod'), periodLabel], [tx('cHigh'), nf(important.length)],
        [tx('cLive'), nf(important.filter((a) => a.status === 'published').length)], [tx('cHighSched'), nf(important.filter((a) => a.status === 'scheduled').length)],
        [tx('cHighDraft'), nf(important.filter((a) => a.status === 'draft').length)], [tx('cHighExpired'), nf(important.filter((a) => a.status === 'expired').length)],
        [tx('cMedium'), nf(periodRows.filter((a) => a.priority === 'medium').length)], [tx('cLow'), nf(periodRows.filter((a) => a.priority === 'low').length)],
      ],
      listTitle: tx('cListHigh'), list: sorted(important),
    };
  };

  // ---------- actions ----------
  const openCreate = (preset = {}) => { setMenu(null); setForm({ id: null, values: { ...EMPTY_FORM, ...preset }, errors: {} }); setPanel({ kind: 'form' }); };
  const openEdit = (a, preset = {}) => {
    setMenu(null);
    setForm({ id: a.id, values: { title: a.title, message: a.message, category: a.category, priority: a.priority, audience: a.audience, company: a.company, status: a.status, date: a.status === 'draft' ? '' : a.publishAt, expiry: a.expiry, ...preset }, errors: {} });
    setPanel({ kind: 'form' });
  };
  const validate = (v) => {
    const e = {};
    if (!v.title.trim()) e.title = tx('vTitle');
    if (!v.message.trim()) e.message = tx('vMessage');
    if (v.status !== 'draft' && !v.date) e.date = v.status === 'scheduled' ? tx('vSched') : tx('vPublish');
    if (v.date && v.status === 'scheduled' && v.date <= TODAY) e.date = tx('vSchedFuture', { d: fmtDate(TODAY) });
    if (v.date && (v.status === 'published' || v.status === 'expired') && v.date > TODAY) e.date = tx('vPubFuture');
    if (v.expiry && v.date && v.status !== 'draft' && v.expiry < v.date) e.expiry = tx('vExpiry');
    if (!e.expiry && v.expiry && v.status === 'published' && v.expiry < TODAY) e.expiry = tx('vExpiryPast');
    if (!e.expiry && v.expiry && v.status === 'expired' && v.expiry > TODAY) e.expiry = tx('vExpiredFuture');
    return e;
  };
  const saveForm = (ev) => {
    ev.preventDefault();
    const v = form.values;
    const errors = validate(v);
    if (Object.keys(errors).length) { setForm({ ...form, errors }); toast(tx('tFix')); return; }
    const fields = {
      title: v.title.trim(), message: v.message.trim(), category: v.category, priority: v.priority, audience: v.audience, company: v.company,
      status: v.status, publishAt: v.status === 'draft' ? '' : v.date, expiry: v.status === 'expired' && !v.expiry ? TODAY : v.expiry,
    };
    if (form.id) {
      const old = find(form.id);
      let action = 'edited';
      if (old.status !== fields.status) action = fields.status === 'draft' ? (old.status === 'scheduled' ? 'unscheduled' : 'draft') : fields.status;
      setRows((all) => all.map((a) => (a.id === form.id ? { ...a, ...fields, history: pushHistory(a, action) } : a)));
      toast(tx('tUpdated', { id: form.id }));
      setForm(null); setPanel({ kind: 'view', id: form.id });
    } else {
      const next = Math.max(1000, ...rows.map((a) => Number(a.id.slice(4)) || 0)) + 1;
      const id = `ANN-${next}`;
      const history = [{ at: TODAY, action: 'created', by: CURRENT_USER }];
      if (fields.status !== 'draft') history.push({ at: TODAY, action: fields.status, by: CURRENT_USER });
      setRows((all) => [{ id, ...fields, created: TODAY, createdBy: CURRENT_USER, views: 0, history }, ...all]);
      toast(tx('tCreated', { id }));
      setForm(null); setPanel({ kind: 'view', id });
    }
  };
  const publishNow = (a) => {
    setMenu(null);
    if (a.expiry && a.expiry < TODAY) { toast(tx('tPublishFix', { id: a.id })); openEdit(a, { status: 'published', date: TODAY }); return; }
    setRows((all) => all.map((x) => (x.id === a.id ? { ...x, status: 'published', publishAt: TODAY, history: pushHistory(x, 'published') } : x)));
    toast(tx('tPublished', { id: a.id }));
  };
  const cancelSchedule = (a) => {
    setMenu(null);
    setRows((all) => all.map((x) => (x.id === a.id ? { ...x, status: 'draft', publishAt: '', history: pushHistory(x, 'unscheduled') } : x)));
    toast(tx('tCancelled', { id: a.id }));
  };
  const expireNow = (a) => {
    setMenu(null);
    setRows((all) => all.map((x) => (x.id === a.id ? { ...x, status: 'expired', expiry: !x.expiry || x.expiry > TODAY ? TODAY : x.expiry, history: pushHistory(x, 'expired') } : x)));
    toast(tx('tExpired', { id: a.id }));
  };
  const doDelete = () => {
    const a = confirm;
    setRows((all) => all.filter((x) => x.id !== a.id));
    setConfirm(null);
    if (panel?.kind === 'view' && panel.id === a.id) setPanel(null);
    toast(tx('tDeleted', { id: a.id }));
  };

  // ---------- row action menu (fixed-position so the table never clips it) ----------
  const openMenu = (ev, a) => {
    ev.stopPropagation();
    if (menu?.id === a.id) { setMenu(null); return; }
    const r = ev.currentTarget.getBoundingClientRect();
    const h = 230;
    setMenu({ id: a.id, top: r.bottom + h > window.innerHeight ? Math.max(8, r.top - h) : r.bottom + 4, right: Math.max(8, window.innerWidth - r.right) });
  };
  useEffect(() => {
    if (!menu) return undefined;
    const close = () => setMenu(null);
    const down = (e) => { if (!e.target.closest('.an-menu, .an-more')) close(); };
    window.addEventListener('scroll', close, true); window.addEventListener('resize', close); document.addEventListener('mousedown', down);
    return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); document.removeEventListener('mousedown', down); };
  }, [menu]);
  // Escape closes: confirmation first, then the menu, then the right-side panel.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (confirm) setConfirm(null); else if (menu) setMenu(null); else if (panel) { setPanel(null); setForm(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirm, menu, panel]);

  const menuRow = menu ? find(menu.id) : null;

  // ---------- small render helpers ----------
  const CatIcon = ({ a, size = 18 }) => { const I = CAT_ICON[a.category]; return <span className="an-ticon" style={{ background: CAT_COLOR[a.category] }}><I size={size} /></span>; };
  const PriBadge = ({ p }) => { const I = PRI_ICON[p]; return <span className={`an-pri ${p}`}><I size={11} />{tx(`pri.${p}`)}</span>; };
  const StBadge = ({ s }) => <span className={`an-st ${s}`}><i />{tx(`st.${s}`)}</span>;
  const audienceText = (a) => (a.company ? `${tx(`aud.${a.audience}`)} · ${a.company}` : tx(`aud.${a.audience}`));
  const pages = (() => {
    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
    const set = new Set([1, pageCount, safePage - 1, safePage, safePage + 1]);
    return [...set].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);
  })();
  const SortTh = ({ k, children }) => (
    <th aria-sort={sort.key === k ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button className="an-sort" onClick={() => setSortKey(k)}>{children}{sort.key === k ? (sort.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}</button>
    </th>
  );
  const RecordList = ({ title, list, showViews }) => (
    <div className="an-plist">
      <h4>{title}</h4>
      {list.length === 0 && <p className="an-pempty">{tx('cNoRecords')}</p>}
      {list.map((a) => (
        <button key={a.id} className="an-pitem" onClick={() => setPanel({ kind: 'view', id: a.id })}>
          <CatIcon a={a} size={14} />
          <span className="an-pitem-t"><b>{a.title}</b><small>{a.id} · {tx(`st.${a.status}`)} · {showViews ? `${nf(a.views)} ${tx('dViews').toLowerCase()}` : fmtDate(activityDate(a))}</small></span>
          <ChevronRight size={14} />
        </button>
      ))}
    </div>
  );

  // ---------- right-side panel ----------
  const renderPanel = () => {
    if (!panel) return null;
    const close = closeAll;
    let title; let body; let wide = false;
    if (panel.kind === 'card') {
      const d = cardDetail(panel.id);
      title = d.title;
      body = (<>
        {d.rows.map(([k, v]) => <div className="kv" key={k}><span>{k}</span><b>{v}</b></div>)}
        <RecordList title={d.listTitle} list={d.list} showViews={d.showViews} />
        <p className="demo-note">{tx('cNote')}</p>
        <p className="demo-note">{tx('sessionNote')}</p>
      </>);
    } else if (panel.kind === 'view') {
      const a = find(panel.id);
      if (!a) return null;
      title = a.title;
      const dateRows = [[tx('dCreatedOn'), fmtDate(a.created)]];
      if (a.status === 'scheduled') dateRows.push([tx('dScheduledOn'), fmtDate(a.publishAt)]);
      else if (a.status !== 'draft') dateRows.push([tx('dPublishedOn'), fmtDate(a.publishAt)]);
      dateRows.push([tx('dExpiry'), a.expiry ? fmtDate(a.expiry) : tx('none')]);
      body = (<>
        <div className="an-vhead"><CatIcon a={a} /><div><StBadge s={a.status} /><small>{a.id}</small></div></div>
        <p className="an-msg">{a.message}</p>
        {[
          [tx('dId'), a.id], [tx('dStatus'), tx(`st.${a.status}`)], [tx('dCategory'), tx(`cat.${a.category}`)], [tx('dPriority'), tx(`pri.${a.priority}`)],
          [tx('dAudience'), tx(`aud.${a.audience}`)], [tx('dCompany'), a.company || tx('allCompanies')], ...dateRows,
          [tx('dCreatedBy'), a.createdBy], [tx('dViews'), nf(a.views)],
        ].map(([k, v]) => <div className="kv" key={k}><span>{k}</span><b>{v}</b></div>)}
        <h4 className="an-h4">{tx('dHistory')}</h4>
        <ul className="an-hist">{[...a.history].reverse().map((h, i) => <li key={i}><b>{tx(`h.${h.action}`)}</b><span>{fmtDate(h.at)} · {h.by}</span></li>)}</ul>
        <div className="an-vactions">
          <button className="an-btn" onClick={() => openEdit(a)}><Pencil size={13} />{tx('aEdit')}</button>
          {(a.status === 'draft' || a.status === 'scheduled') && <button className="an-btn" onClick={() => publishNow(a)}><Send size={13} />{tx('aPublish')}</button>}
          {a.status === 'draft' && <button className="an-btn" onClick={() => openEdit(a, { status: 'scheduled' })}><CalendarClock size={13} />{tx('aSchedule')}</button>}
          {a.status === 'scheduled' && <button className="an-btn" onClick={() => cancelSchedule(a)}><Ban size={13} />{tx('aCancelSched')}</button>}
          {a.status === 'published' && <button className="an-btn" onClick={() => expireNow(a)}><Clock3 size={13} />{tx('aExpire')}</button>}
          <button className="an-btn danger" onClick={() => setConfirm(a)}><Trash2 size={13} />{tx('aDelete')}</button>
        </div>
        <p className="demo-note">{tx('sessionNote')}</p>
      </>);
    } else {
      wide = true;
      const v = form.values; const er = form.errors;
      const set = (k, val) => setForm((f) => ({ ...f, values: { ...f.values, [k]: val }, errors: { ...f.errors, [k]: undefined } }));
      title = form.id ? `${tx('editTitle')} · ${form.id}` : tx('createTitle');
      body = (
        <form className="an-form" onSubmit={saveForm} noValidate>
          <label>{tx('fTitle')} *<input value={v.title} maxLength={120} onChange={(e) => set('title', e.target.value)} aria-invalid={!!er.title} />{er.title && <span className="an-err">{er.title}</span>}</label>
          <label>{tx('fMessage')} *<textarea rows={4} value={v.message} maxLength={600} onChange={(e) => set('message', e.target.value)} aria-invalid={!!er.message} />{er.message && <span className="an-err">{er.message}</span>}</label>
          <div className="an-2col">
            <label>{tx('fCategory')}<select value={v.category} onChange={(e) => set('category', e.target.value)}>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{tx(`cat.${c.id}`)}</option>)}</select></label>
            <label>{tx('fPriority')}<select value={v.priority} onChange={(e) => set('priority', e.target.value)}>{PRIORITIES.map((p) => <option key={p} value={p}>{tx(`pri.${p}`)}</option>)}</select></label>
          </div>
          <div className="an-2col">
            <label>{tx('fAudience')}<select value={v.audience} onChange={(e) => set('audience', e.target.value)}>{AUDIENCES.map((a) => <option key={a} value={a}>{tx(`aud.${a}`)}</option>)}</select></label>
            <label>{tx('fCompany')}<select value={v.company} onChange={(e) => set('company', e.target.value)}><option value="">{tx('allCompanies')}</option>{COMPANY_NAMES.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
          </div>
          <label>{tx('fStatus')}<select value={v.status} onChange={(e) => setForm((f) => ({ ...f, values: { ...f.values, status: e.target.value, ...(e.target.value === 'draft' ? { date: '' } : {}) }, errors: { ...f.errors, date: undefined, expiry: undefined } }))}>{STATUSES.map((s) => <option key={s} value={s}>{tx(`st.${s}`)}</option>)}</select></label>
          {v.status === 'draft'
            ? <p className="an-hint">{tx('fDraftHint')}</p>
            : <label>{v.status === 'scheduled' ? tx('fScheduleDate') : tx('fPublishDate')} *<input type="date" value={v.date} min={v.status === 'scheduled' ? addDays(TODAY, 1) : undefined} max={v.status !== 'scheduled' ? TODAY : undefined} onChange={(e) => set('date', e.target.value)} aria-invalid={!!er.date} />{er.date && <span className="an-err">{er.date}</span>}</label>}
          <label>{tx('fExpiry')}<input type="date" value={v.expiry} min={v.date || undefined} onChange={(e) => set('expiry', e.target.value)} aria-invalid={!!er.expiry} />{er.expiry && <span className="an-err">{er.expiry}</span>}</label>
          <div className="an-vactions"><button type="button" className="an-btn" onClick={() => { setForm(null); setPanel(form.id ? { kind: 'view', id: form.id } : null); }}>{tx('cancel')}</button><button type="submit" className="an-btn primary">{form.id ? tx('saveEdit') : tx('save')}</button></div>
          <p className="demo-note">{tx('sessionNote')}</p>
        </form>
      );
    }
    return (<>
      <div className="backdrop an-backdrop" onClick={close} />
      <aside className={`detail an-drawer ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="detail-h"><h3>{title}</h3><button className="icon-btn" onClick={close} aria-label="×"><X size={18} /></button></div>
        <div className="detail-b">{body}</div>
      </aside>
    </>);
  };

  const emptyText =
  periodRows.length === 0
    ? tx('emptyPeriod')
    : tx('emptyFilters');
  return (
    <div className="an-page">
      <div className="an-top">
        <div><h1>{t('nav.announce')}</h1><p>{tx('subtitle')}</p></div>
        {range && setRange && <DateRangeMenu range={range} setRange={setRange} />}
      </div>

      <div className="an-metrics">
        {cards.map((c) => (
          <button key={c.id} className={`an-metric ${panel?.kind === 'card' && panel.id === c.id ? 'active' : ''}`} onClick={() => { setForm(null); setPanel({ kind: 'card', id: c.id }); }} aria-haspopup="dialog">
            <span className={`an-metric-icon ${c.color}`}><c.icon size={25} /></span>
            <span className="an-metric-info"><small>{c.title}</small><b>{c.value}</b><em>{c.trend}</em><span>{c.sub}</span></span>
          </button>
        ))}
      </div>

      <div className="an-grid">
        <section className="an-panel an-tablecard">
          <div className="an-head">
            <span className="an-pico"><Megaphone size={16} /></span><strong>{tx('allAnn')}</strong><span className="an-grow" />
            <button className="an-create" onClick={() => openCreate()}><Plus size={15} />{tx('create')}</button>
          </div>
          <div className="an-tools">
            <div className="an-tabs" role="tablist">
              {[['all', 'tabAll'], ['published', 'tabPublished'], ['scheduled', 'tabScheduled'], ['draft', 'tabDrafts'], ['expired', 'tabExpired']].map(([id, key]) => (
                <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => { setTab(id); setPage(1); }}>{tx(key)} ({nf(counts[id])})</button>
              ))}
            </div>
            <div className="an-filters">
              <label className="an-search"><Search size={14} /><input value={q} placeholder={tx('search')} aria-label={tx('search')} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></label>
              <select aria-label={tx('colPriority')} value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }}><option value="all">{tx('allPriority')}</option>{PRIORITIES.map((p) => <option key={p} value={p}>{tx(`pri.${p}`)}</option>)}</select>
              <select aria-label={tx('colType')} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}><option value="all">{tx('allCategories')}</option>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{tx(`cat.${c.id}`)}</option>)}</select>
              <select aria-label={tx('colAudience')} value={audience} onChange={(e) => { setAudience(e.target.value); setPage(1); }}><option value="all">{tx('allAudiences')}</option>{AUDIENCES.map((a) => <option key={a} value={a}>{tx(`aud.${a}`)}</option>)}</select>
              <select aria-label={tx('dCreatedBy')} value={creator} onChange={(e) => { setCreator(e.target.value); setPage(1); }}><option value="all">{tx('allCreators')}</option>{CREATORS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
              {activeFilters > 0 && <button className="an-clear" onClick={resetFilters}>{tx('clearN', { n: activeFilters })}</button>}
            </div>
          </div>

          <div className="an-twrap">
            <table className="an-table">
              <thead><tr>
                <SortTh k="title">{tx('colTitle')}</SortTh><th>{tx('colType')}</th><SortTh k="priority">{tx('colPriority')}</SortTh>
                <th>{tx('colAudience')}</th><SortTh k="status">{tx('colStatus')}</SortTh><SortTh k="date">{tx('colDate')}</SortTh><th className="an-actcol">{tx('colActions')}</th>
              </tr></thead>
              <tbody>
                {shown.map((a) => { const [dl, dv] = dateInfo(a); return (
                  <tr key={a.id} onClick={() => setPanel({ kind: 'view', id: a.id })}>
                    <td><div className="an-title"><CatIcon a={a} /><span><b title={a.title}>{a.title}</b><small title={a.message}>{a.id} · {a.message}</small></span></div></td>
                    <td><span className="an-cat" style={{ color: CAT_COLOR[a.category], background: `${CAT_COLOR[a.category]}18` }}>{tx(`cat.${a.category}`)}</span></td>
                    <td><PriBadge p={a.priority} /></td>
                    <td><span className="an-aud" title={audienceText(a)}>{audienceText(a)}</span></td>
                    <td><StBadge s={a.status} /></td>
                    <td><span className="an-date">{fmtDate(dv)}<small>{dl}</small></span></td>
                    <td className="an-actcol"><div className="an-acts">
                      <button className="an-icobtn" title={tx('aView')} aria-label={`${tx('aView')} ${a.id}`} onClick={(e) => { e.stopPropagation(); setMenu(null); setPanel({ kind: 'view', id: a.id }); }}><Eye size={14} /></button>
                      <button className="an-icobtn an-more" aria-label={`${tx('moreActions')} ${a.id}`} aria-haspopup="menu" aria-expanded={menu?.id === a.id} onClick={(e) => openMenu(e, a)}><MoreHorizontal size={14} /></button>
                    </div></td>
                  </tr>); })}
                {!shown.length && <tr className="an-emptyrow"><td colSpan="7"><div className="an-empty"><Megaphone size={22} /><span>{emptyText}</span>{activeFilters > 0 && <button onClick={resetFilters}>{tx('clear')}</button>}</div></td></tr>}
              </tbody>
            </table>
          </div>
          <div className="an-foot">
            <span>{tx('showing', { a: filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0, b: Math.min(safePage * PAGE_SIZE, filtered.length), n: filtered.length })}</span>
            <div className="an-pager">
              <button aria-label={tx('prev')} disabled={safePage === 1} onClick={() => setPage(safePage - 1)}><ChevronLeft size={14} /></button>
              {pages.map((n, i) => <span key={n} className="an-pg">{i > 0 && n - pages[i - 1] > 1 && <em>…</em>}<button className={n === safePage ? 'on' : ''} aria-current={n === safePage ? 'page' : undefined} onClick={() => setPage(n)}>{n}</button></span>)}
              <button aria-label={tx('next')} disabled={safePage === pageCount} onClick={() => setPage(safePage + 1)}><ChevronRight size={14} /></button>
            </div>
          </div>
        </section>

        <aside className="an-side">
          <section className="an-panel">
            <div className="an-head"><span className="an-pico"><PieIcon size={16} /></span><strong>{tx('ovTitle')}</strong></div>
            {catData.length === 0 ? <div className="an-mini-empty">{tx('noPeriod')}</div> : (
              <div className="an-donutwrap">
                <div className="an-donut">
                  <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={catData} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="none">{catData.map((d) => <Cell key={d.id} fill={d.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
                  <div className="an-donut-c"><b>{nf(periodRows.length)}</b><span>{tx('ovTotal')}</span></div>
                </div>
                <ul className="an-legend">{catData.map((d) => (
                  <li key={d.id}><button onClick={() => { setCategory(d.id); setPage(1); }}><i style={{ background: d.color }} /><span>{d.name}</span><b>{nf(d.value)}</b><em>({Math.round((d.value / periodRows.length) * 100)}%)</em></button></li>
                ))}</ul>
              </div>
            )}
          </section>

          <section className="an-panel">
            <div className="an-head"><span className="an-pico"><BarChart3 size={16} /></span><strong>{tx('actTitle')}</strong></div>
            {periodRows.length === 0 ? <div className="an-mini-empty">{tx('noPeriod')}</div> : (
              <div className="an-bar">
                <ResponsiveContainer width="100%" height="100%"><BarChart data={buckets} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                  <CartesianGrid stroke="#e5eef9" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 9.5, fill: '#173b8e' }} axisLine={{ stroke: '#d6e5f8' }} tickLine={false} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 9.5, fill: '#173b8e' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f0f6ff' }} />
                  <Bar dataKey="live" name={tx('serLive')} stackId="a" fill="#079447" /><Bar dataKey="scheduled" name={tx('serScheduled')} stackId="a" fill="#f59e0b" /><Bar dataKey="draft" name={tx('serDraft')} stackId="a" fill="#a9bad0" radius={[3, 3, 0, 0]} />
                </BarChart></ResponsiveContainer>
              </div>
            )}
            <div className="an-barleg"><span><i style={{ background: '#079447' }} />{tx('serLive')}</span><span><i style={{ background: '#f59e0b' }} />{tx('serScheduled')}</span><span><i style={{ background: '#a9bad0' }} />{tx('serDraft')}</span></div>
          </section>

          <section className="an-panel">
            <div className="an-head"><span className="an-pico"><Megaphone size={16} /></span><strong>{tx('recentTitle')}</strong><span className="an-grow" />
              <button className="an-outline" onClick={() => { setTab('published'); setSort({ key: 'date', dir: 'desc' }); setPage(1); }}>{tx('viewAll')}</button></div>
            {recent.length === 0 ? <div className="an-mini-empty">{tx('recentEmpty')}</div> : (
              <ul className="an-recent">{recent.map((a) => (
                <li key={a.id}><button onClick={() => setPanel({ kind: 'view', id: a.id })}><CatIcon a={a} size={15} /><span><b>{a.title}</b><small>{fmtDate(a.publishAt)}</small></span><PriBadge p={a.priority} /></button></li>
              ))}</ul>
            )}
          </section>
        </aside>
      </div>

      {menu && menuRow && (
        <div className="an-menu" role="menu" style={{ top: menu.top, right: menu.right }}>
          <button role="menuitem" onClick={() => { setPanel({ kind: 'view', id: menuRow.id }); setMenu(null); }}><Eye size={13} />{tx('aView')}</button>
          <button role="menuitem" onClick={() => openEdit(menuRow)}><Pencil size={13} />{tx('aEdit')}</button>
          {(menuRow.status === 'draft' || menuRow.status === 'scheduled') && <button role="menuitem" onClick={() => publishNow(menuRow)}><Send size={13} />{tx('aPublish')}</button>}
          {menuRow.status === 'draft' && <button role="menuitem" onClick={() => openEdit(menuRow, { status: 'scheduled' })}><CalendarClock size={13} />{tx('aSchedule')}</button>}
          {menuRow.status === 'scheduled' && <button role="menuitem" onClick={() => cancelSchedule(menuRow)}><Ban size={13} />{tx('aCancelSched')}</button>}
          {menuRow.status === 'published' && <button role="menuitem" onClick={() => expireNow(menuRow)}><Clock3 size={13} />{tx('aExpire')}</button>}
          <button role="menuitem" className="danger" onClick={() => { setMenu(null); setConfirm(menuRow); }}><Trash2 size={13} />{tx('aDelete')}</button>
        </div>
      )}

      {renderPanel()}

      {confirm && (
        <div className="an-modal-bd" onMouseDown={(e) => e.target === e.currentTarget && setConfirm(null)}>
          <div className="an-modal" role="alertdialog" aria-modal="true" aria-label={tx('delTitle')}>
            <h3>{tx('delTitle')}</h3>
            <p>{tx('delBody', { title: confirm.title, id: confirm.id })}</p>
            <div className="an-vactions"><button className="an-btn" onClick={() => setConfirm(null)}>{tx('cancel')}</button><button className="an-btn danger solid" onClick={doDelete}>{tx('delConfirm')}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}