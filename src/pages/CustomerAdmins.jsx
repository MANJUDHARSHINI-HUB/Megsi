import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Activity, AlertTriangle, Ban, BarChart3, Building2, CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, Eye, KeyRound,
  MoreHorizontal, Pencil, Plus, Power, PowerOff, RotateCcw, Search, Send, ShieldAlert, ShieldCheck, UserCheck, UserCog, UserPlus, UserX, Users, X,
} from 'lucide-react';
import DateRangeMenu from '../components/DateRangeMenu.jsx';
import { Avatar, Select } from '../components/Common.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import {
  ACTOR, CA_TRANSLATIONS, COMPANIES, KPI_IDS, REF_DATE, ROLES, ROLE_COLORS, SEED_STATE, STATUSES, STATUS_COLORS, STORE_KEY,
  activitySeries, adminHistory, buildModel, computeKpis, currentStatus, effectiveEnd, isEmptyRange, lastLoginAt, nextId, nowStamp,
  recentEvents, securityInsights, signinsInRange, statusSeries,
} from '../data/customerAdminsData.js';
import { addDays } from '../data/selectors.js';
import './customerAdmins.css';

/* ---------------------------------------------------------------------
   Small helpers
   --------------------------------------------------------------------- */
const PAGE_SIZE = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const KPI_META = {
  total: { Icon: Users, color: 'blue', goodUp: true },
  active: { Icon: UserCheck, color: 'green', goodUp: true },
  inactive: { Icon: UserX, color: 'purple', goodUp: false },
  pending: { Icon: Clock, color: 'orange', goodUp: false },
  suspended: { Icon: Ban, color: 'red', goodUp: false },
};
const EVENT_META = {
  invited: { Icon: UserPlus, c: 'green' }, accepted: { Icon: UserCheck, c: 'green' }, activated: { Icon: Power, c: 'green' }, restored: { Icon: ShieldCheck, c: 'green' },
  deactivated: { Icon: PowerOff, c: 'orange' }, suspended: { Icon: Ban, c: 'red' }, role_changed: { Icon: KeyRound, c: 'blue' }, updated: { Icon: Pencil, c: 'blue' }, resent: { Icon: Send, c: 'blue' },
};

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    const ok = s && Array.isArray(s.admins) && Array.isArray(s.events)
      && s.admins.every((a) => a && a.id && a.name && a.email && ROLES.includes(a.role) && COMPANIES.some((c) => c.id === a.companyId) && a.createdAt)
      && s.events.every((e) => e && e.id && e.ts && e.type && e.adminId);
    if (ok) return s;
  } catch { /* storage unavailable or corrupt: fall back to the seed data */ }
  return SEED_STATE;
}
const pushEvents = (prev, list) => {
  const out = prev.events.slice();
  list.forEach((e) => out.push({ id: nextId('e', out), ts: nowStamp(), actor: ACTOR, ...e }));
  return out;
};
const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

function useCa() {
  const { lang, fmtDate, fmtDateTime } = useI18n();
  const tr = useCallback((k, p) => {
    let s = CA_TRANSLATIONS[lang]?.[k] ?? CA_TRANSLATIONS.en[k] ?? k;
    if (p) for (const x in p) s = s.split(`{${x}}`).join(p[x]);
    return s;
  }, [lang]);
  return { tr, lang, fmtDate, fmtDateTime };
}

/* ---------------------------------------------------------------------
   Presentational pieces
   --------------------------------------------------------------------- */
const StatusPill = ({ v, tr }) => <span className={`ca-status ${v}`}><i />{tr(`ca.st.${v}`)}</span>;
const RolePill = ({ v, tr }) => <span className={`ca-role ${v}`}>{tr(`ca.role.${v}`)}</span>;

function Trend({ change, goodUp }) {
  if (change == null) return <em className="neutral">–</em>;
  if (change === 0) return <em className="neutral">0%</em>;
  const good = (change > 0) === goodUp;
  return <em className={good ? 'up' : 'down'}>{change > 0 ? '↑' : '↓'} {Math.abs(change)}%</em>;
}

const Empty = ({ children }) => <div className="ca-chart-empty">{children}</div>;

function Card({ icon, title, right, children, cls = '' }) {
  return (
    <section className={`card ca-card ${cls}`}>
      <header className="card-h"><span className="ic-sq">{icon}</span><h3>{title}</h3><div className="grow" />{right}</header>
      {children}
    </section>
  );
}

function ActivityTip({ active, payload, tr }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="ca-tip">
      <b>{p.full}</b>
      <span><i style={{ background: '#0758F9' }} />{tr('ca.ser.admins')}: <strong>{p.admins}</strong></span>
      <span><i style={{ background: '#9DB8F5' }} />{tr('ca.ser.signins')}: <strong>{p.signins}</strong></span>
    </div>
  );
}
function StatusTip({ active, payload, tr, fmtDate }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="ca-tip">
      <b>{p.full}</b>
      <small>{tr('ca.tt.asOf')} · {fmtDate(p.asOf)}</small>
      {STATUSES.map((s) => <span key={s}><i style={{ background: STATUS_COLORS[s] }} />{tr(`ca.st.${s}`)}: <strong>{p[s]}</strong></span>)}
    </div>
  );
}

/* ---------------------------------------------------------------------
   Modal shell (portaled so it always sits above the drawer)
   --------------------------------------------------------------------- */
function Modal({ title, onClose, children, closeLabel, wide }) {
  return (
    <div className="ca-modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`ca-modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="ca-modal-h"><h3>{title}</h3><button type="button" className="ca-x" onClick={onClose} aria-label={closeLabel}><X size={18} /></button></div>
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Row action menu (fixed-position so the scrolling table never clips it)
   --------------------------------------------------------------------- */
function RowMenu({ row, tr, onAction }) {
  const [pos, setPos] = useState(null);
  const btn = useRef(null);
  const st = row.status;
  const items = [
    { k: 'view', Icon: Eye, label: tr('ca.act.view') },
    { k: 'edit', Icon: Pencil, label: tr('ca.act.edit') },
    ...(st === 'pending' ? [{ k: 'resend', Icon: Send, label: tr('ca.act.resend') }] : []),
    ...(st === 'inactive' ? [{ k: 'activate', Icon: Power, label: tr('ca.act.activate') }] : []),
    ...(st === 'active' ? [{ k: 'deactivate', Icon: PowerOff, label: tr('ca.act.deactivate'), danger: true }] : []),
    ...(st === 'active' || st === 'inactive' ? [{ k: 'suspend', Icon: Ban, label: tr('ca.act.suspend'), danger: true }] : []),
    ...(st === 'suspended' ? [{ k: 'restore', Icon: ShieldCheck, label: tr('ca.act.restore') }] : []),
  ];
  useEffect(() => {
    if (!pos) return undefined;
    const close = () => setPos(null);
    const down = (e) => { if (!e.target.closest('.ca-menu') && !btn.current?.contains(e.target)) close(); };
    const key = (e) => { if (e.key === 'Escape') { close(); btn.current?.focus(); } };
    document.addEventListener('mousedown', down); document.addEventListener('keydown', key);
    window.addEventListener('scroll', close, true); window.addEventListener('resize', close);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };
  }, [pos]);
  const toggle = () => {
    if (pos) { setPos(null); return; }
    const r = btn.current.getBoundingClientRect(), w = 220, h = items.length * 36 + 10;
    const top = r.bottom + 4 + h > window.innerHeight ? Math.max(8, r.top - h - 4) : r.bottom + 4;
    setPos({ top, left: Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8)) });
  };
  return (
    <>
      <button ref={btn} type="button" className="ca-dots" aria-haspopup="menu" aria-expanded={!!pos} aria-label={tr('ca.act.menu', { name: row.admin.name })} onClick={toggle}><MoreHorizontal size={16} /></button>
      {pos && createPortal(
        <div className="ca-menu" role="menu" style={{ top: pos.top, left: pos.left }}>
          {items.map(({ k, Icon, label, danger }) => (
            <button key={k} type="button" role="menuitem" className={danger ? 'danger' : ''} onClick={() => { setPos(null); onAction(k, row); }}><Icon size={15} />{label}</button>
          ))}
        </div>, document.body)}
    </>
  );
}

/* ---------------------------------------------------------------------
   Pagination
   --------------------------------------------------------------------- */
function Pager({ page, pages, onPage, tr }) {
  const nums = [];
  for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
  const withGaps = nums.reduce((acc, n, i) => { if (i && n - nums[i - 1] > 1) acc.push(`gap${n}`); acc.push(n); return acc; }, []);
  return (
    <nav className="ca-pager" aria-label={tr('ca.page.nav')}>
      <button type="button" className="ca-pg" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label={tr('ca.page.prev')}><ChevronLeft size={15} /></button>
      {withGaps.map((n) => (typeof n === 'string'
        ? <span key={n} className="ca-gap" aria-hidden="true">…</span>
        : <button key={n} type="button" className={`ca-pg ${n === page ? 'on' : ''}`} aria-current={n === page ? 'page' : undefined} aria-label={tr('ca.page.go', { p: n })} onClick={() => onPage(n)}>{n}</button>))}
      <button type="button" className="ca-pg" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label={tr('ca.page.next')}><ChevronRight size={15} /></button>
    </nav>
  );
}

/* ---------------------------------------------------------------------
   Add / Edit form
   --------------------------------------------------------------------- */
function AdminForm({ admin, data, status, tr, onCancel, onSave }) {
  const edit = !!admin;
  const [f, setF] = useState({ name: admin?.name ?? '', email: admin?.email ?? '', companyId: admin?.companyId ?? '', role: admin?.role ?? 'admin', status: status ?? 'pending' });
  const [err, setErr] = useState({});
  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value })); setErr((x) => ({ ...x, [k]: undefined })); };
  const submit = (e) => {
    e.preventDefault();
    const n = {};
    const name = f.name.trim(), email = f.email.trim();
    if (!name) n.name = tr('ca.err.name');
    if (!email) n.email = tr('ca.err.email');
    else if (!EMAIL_RE.test(email)) n.email = tr('ca.err.emailInvalid');
    else if (data.admins.some((a) => a.id !== admin?.id && a.email.toLowerCase() === email.toLowerCase())) n.email = tr('ca.err.emailDup');
    if (!f.companyId) n.companyId = tr('ca.err.company');
    else if (f.role === 'owner' && data.admins.some((a) => a.id !== admin?.id && a.companyId === f.companyId && a.role === 'owner')) n.role = tr('ca.err.owner');
    setErr(n);
    if (Object.keys(n).length) return;
    onSave({ name, email, companyId: f.companyId, role: f.role, status: f.status });
  };
  const field = (id, label, control, error) => (
    <div className={`ca-field ${error ? 'bad' : ''}`}>
      <label htmlFor={`ca-f-${id}`}>{label}</label>
      {control}
      {error && <span className="ca-ferr" id={`ca-e-${id}`} role="alert">{error}</span>}
    </div>
  );
  const common = (id) => ({ id: `ca-f-${id}`, 'aria-invalid': !!err[id], 'aria-describedby': err[id] ? `ca-e-${id}` : undefined });
  return (
    <form onSubmit={submit} noValidate>
      <div className="ca-modal-b">
        {field('name', tr('ca.form.name'), <input {...common('name')} value={f.name} onChange={set('name')} autoFocus autoComplete="off" />, err.name)}
        {field('email', tr('ca.form.email'), <input {...common('email')} type="email" value={f.email} onChange={set('email')} autoComplete="off" />, err.email)}
        {field('companyId', tr('ca.form.company'), (
          <select {...common('companyId')} value={f.companyId} onChange={set('companyId')}>
            <option value="">{tr('ca.form.pick')}</option>
            {COMPANIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>), err.companyId)}
        {field('role', tr('ca.form.role'), (
          <select {...common('role')} value={f.role} onChange={set('role')}>{ROLES.map((r) => <option key={r} value={r}>{tr(`ca.role.${r}`)}</option>)}</select>), err.role)}
        {edit && field('status', tr('ca.form.status'), status === 'pending'
          ? <><input id="ca-f-status" value={tr('ca.st.pending')} readOnly /><span className="ca-hint">{tr('ca.form.pendingNote')}</span></>
          : <select id="ca-f-status" value={f.status} onChange={set('status')}>{['active', 'inactive', 'suspended'].map((s) => <option key={s} value={s}>{tr(`ca.st.${s}`)}</option>)}</select>)}
        {!edit && <p className="ca-hint block">{tr('ca.form.invNote')}</p>}
      </div>
      <div className="ca-modal-f">
        <button type="button" className="ca-btn" onClick={onCancel}>{tr('ca.btn.cancel')}</button>
        <button type="submit" className="ca-btn primary">{edit ? tr('ca.btn.save') : tr('ca.btn.addAdmin')}</button>
      </div>
    </form>
  );
}

/* =====================================================================
   PAGE
   ===================================================================== */
export default function CustomerAdmins({ range, setRange, toast }) {
  const { tr, lang, fmtDate, fmtDateTime } = useCa();
  const say = useCallback((m) => { if (typeof toast === 'function') toast(m); }, [toast]);

  const [data, setData] = useState(loadState);
  const [sel, setSel] = useState(null);           // selected KPI id -> drawer
  const [modal, setModal] = useState(null);       // {type:'form'|'view'|'confirm'|'actions', ...}
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState({ status: 'all', company: 'all', role: 'all' });
  const [page, setPage] = useState(1);
  const [win, setWin] = useState(6);
  const tableRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { /* storage unavailable: state still works in memory */ } }, [data]);

  /* ---------- derived data (single source: the event log) ---------- */
  const model = useMemo(() => buildModel(data), [data]);
  const metrics = useMemo(() => computeKpis(model, range), [model, range]);
  const activity = useMemo(() => activitySeries(range, lang), [range, lang]);
  const statusData = useMemo(() => statusSeries(model, range, win, lang), [model, range, win, lang]);
  const events = useMemo(() => recentEvents(model, range), [model, range]);
  const insights = useMemo(() => securityInsights(model, range), [model, range]);
  const empty = metrics.empty;
  const periodRange = useMemo(() => ({ start: range.start, end: effectiveEnd(range) }), [range]);

  const rows = useMemo(() => data.admins.map((a) => ({
    admin: a, company: model.companyById.get(a.companyId), status: currentStatus(model, a.id), last: lastLoginAt(a.id),
    signins: empty ? 0 : signinsInRange(a.id, periodRange),
  })).sort((x, y) => y.admin.createdAt.localeCompare(x.admin.createdAt) || x.admin.name.localeCompare(y.admin.name)), [data, model, empty, periodRange]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => (!s || r.admin.name.toLowerCase().includes(s) || r.admin.email.toLowerCase().includes(s) || (r.company?.name || '').toLowerCase().includes(s))
      && (filters.status === 'all' || r.status === filters.status)
      && (filters.company === 'all' || r.admin.companyId === filters.company)
      && (filters.role === 'all' || r.admin.role === filters.role));
  }, [rows, q, filters]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const paged = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  useEffect(() => { if (page !== cur) setPage(cur); }, [page, cur]);

  const chips = [
    ...(q.trim() ? [{ k: 'q', label: tr('ca.f.search'), value: q.trim() }] : []),
    ...(filters.status !== 'all' ? [{ k: 'status', label: tr('ca.f.status'), value: tr(`ca.st.${filters.status}`) }] : []),
    ...(filters.company !== 'all' ? [{ k: 'company', label: tr('ca.f.company'), value: COMPANIES.find((c) => c.id === filters.company)?.name }] : []),
    ...(filters.role !== 'all' ? [{ k: 'role', label: tr('ca.f.role'), value: tr(`ca.role.${filters.role}`) }] : []),
  ];
  const setFilter = (k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); };
  const removeChip = (k) => { if (k === 'q') setQ(''); else setFilter(k, 'all'); setPage(1); };
  const clearAll = () => { setQ(''); setFilters({ status: 'all', company: 'all', role: 'all' }); setPage(1); };

  const scrollToTable = () => setTimeout(() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);

  /* ---------- drawer + keyboard ---------- */
  useEffect(() => {
    const h = (e) => { if (e.key !== 'Escape') return; if (modal) setModal(null); else if (sel) setSel(null); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [modal, sel]);
  useEffect(() => { if (sel) closeRef.current?.focus(); }, [sel]);

  /* ---------- mutations (mock only; nothing leaves the browser) ---------- */
  const doAction = (kind, admin) => {
    const map = { activate: ['activated', 'ca.toast.activated'], deactivate: ['deactivated', 'ca.toast.deactivated'], suspend: ['suspended', 'ca.toast.suspended'], restore: ['restored', 'ca.toast.restored'], resend: ['resent', 'ca.toast.resent'] };
    const [type, key] = map[kind];
    setData((p) => ({ ...p, events: pushEvents(p, [{ type, adminId: admin.id }]) }));
    say(tr(key, { name: admin.name }));
  };
  const onRowAction = (k, row) => {
    if (k === 'view') setModal({ type: 'view', id: row.admin.id });
    else if (k === 'edit') setModal({ type: 'form', id: row.admin.id });
    else if (['suspend', 'restore', 'deactivate'].includes(k)) setModal({ type: 'confirm', kind: k, id: row.admin.id });
    else doAction(k, row.admin);
  };
  const saveForm = (vals) => {
    const existing = modal.id ? data.admins.find((a) => a.id === modal.id) : null;
    if (!existing) {
      const id = nextId('a', data.admins);
      setData((p) => ({ admins: [...p.admins, { id, name: vals.name, email: vals.email, companyId: vals.companyId, role: vals.role, createdAt: REF_DATE }], events: pushEvents(p, [{ type: 'invited', adminId: id }]) }));
      say(tr('ca.toast.added', { name: vals.name }));
      setModal(null);
      return;
    }
    const prevStatus = currentStatus(model, existing.id);
    const list = [];
    if (vals.name !== existing.name || vals.email !== existing.email || vals.companyId !== existing.companyId) list.push({ type: 'updated', adminId: existing.id });
    if (vals.role !== existing.role) list.push({ type: 'role_changed', adminId: existing.id, from: existing.role, to: vals.role });
    if (prevStatus !== 'pending' && vals.status !== prevStatus) {
      const type = vals.status === 'suspended' ? 'suspended' : vals.status === 'inactive' ? 'deactivated' : prevStatus === 'suspended' ? 'restored' : 'activated';
      list.push({ type, adminId: existing.id });
    }
    if (!list.length) { say(tr('ca.toast.noChange')); setModal(null); return; }
    setData((p) => ({ admins: p.admins.map((a) => (a.id === existing.id ? { ...a, name: vals.name, email: vals.email, companyId: vals.companyId, role: vals.role } : a)), events: pushEvents(p, list) }));
    say(tr('ca.toast.updated', { name: vals.name }));
    setModal(null);
  };
  const resetDemo = () => {
    try { localStorage.removeItem(STORE_KEY); } catch { /* ignore */ }
    setData(SEED_STATE); clearAll(); setModal(null); say(tr('ca.toast.reset'));
  };

  const exportCsv = () => {
    const head = [tr('ca.csv.name'), tr('ca.col.email'), tr('ca.col.company'), tr('ca.col.role'), tr('ca.col.status'), tr('ca.col.last'), tr('ca.col.invited'), tr('ca.col.signins')];
    const lines = filtered.map((r) => [r.admin.name, r.admin.email, r.company?.name, tr(`ca.role.${r.admin.role}`), tr(`ca.st.${r.status}`), r.last ? fmtDateTime(r.last) : tr('ca.never'), fmtDate(r.admin.createdAt), r.signins]);
    const csv = '\ufeff' + [head, ...lines].map((l) => l.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = `customer-admins-${REF_DATE}.csv`; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    say(tr('ca.toast.exported', { n: filtered.length }));
  };

  /* ---------- text helpers ---------- */
  const companyName = (id) => model.companyById.get(id)?.name || '';
  const evText = (e) => {
    const a = model.adminById.get(e.adminId);
    return tr(`ca.ev.${e.type}`, { name: a?.name ?? '?', company: a ? companyName(a.companyId) : '', from: e.from ? tr(`ca.role.${e.from}`) : '', to: e.to ? tr(`ca.role.${e.to}`) : '' });
  };
  const kpiDesc = (id) => {
    const k = metrics.kpis[id];
    if (id === 'total') return tr('ca.kd.total', { n: k.newInPeriod });
    if (id === 'pending') return tr('ca.kd.pending', { n: k.newInPeriod });
    if (id === 'suspended') return tr('ca.kd.suspended', { n: k.suspendedInPeriod });
    return tr(`ca.kd.${id}`, { p: k.share });
  };
  const periodLabel = `${fmtDate(range.start)} – ${fmtDate(range.end)}`;

  /* ---------- chart data ---------- */
  const total = metrics.kpis.total;
  const roleData = total.byRole.map((r) => ({ name: tr(`ca.role.${r.role}`), role: r.role, value: r.n, color: ROLE_COLORS[r.role] }));
  const activeByCo = useMemo(() => { const m = new Map(); metrics.kpis.active.items.forEach((i) => m.set(i.admin.companyId, (m.get(i.admin.companyId) || 0) + 1)); return m; }, [metrics]);
  const topCo = total.byCompany.slice(0, 5);
  const maxCo = topCo[0]?.n || 1;
  const activityEmpty = !activity.data.length || activity.data.every((d) => !d.signins);
  const axis = { fontSize: 11, fill: '#465477' };

  const selMeta = sel ? KPI_META[sel] : null;
  const selK = sel ? metrics.kpis[sel] : null;
  const insightItems = [
    insights.suspended ? { k: 'suspended', Icon: ShieldAlert, c: 'red', t: tr('ca.in.suspended', { n: insights.suspended }), s: tr('ca.in.suspendedSub'), go: { status: 'suspended' } } : null,
    insights.stale ? { k: 'stale', Icon: Clock, c: 'orange', t: tr('ca.in.stale', { n: insights.stale }), s: tr('ca.in.staleSub'), go: { status: 'pending' } } : null,
    insights.dormant ? { k: 'dormant', Icon: AlertTriangle, c: 'orange', t: tr('ca.in.dormant', { n: insights.dormant }), s: tr('ca.in.dormantSub') } : null,
    insights.noOwner ? { k: 'noOwner', Icon: KeyRound, c: 'blue', t: tr('ca.in.noOwner', { n: insights.noOwner }), s: tr('ca.in.noOwnerSub') } : null,
  ].filter(Boolean);

  const editing = modal?.type === 'form' && modal.id ? data.admins.find((a) => a.id === modal.id) : null;
  const viewing = modal?.type === 'view' ? data.admins.find((a) => a.id === modal.id) : null;
  const confirming = modal?.type === 'confirm' ? data.admins.find((a) => a.id === modal.id) : null;

  /* ===================================================================== */
  return (
    <div className="ca">
      <div className="title-row ca-title-row">
        <div><h1>{tr('ca.title')}</h1><p>{tr('ca.subtitle')}</p></div>
        <div className="ca-actions">
          <button type="button" className="ca-btn" onClick={exportCsv} disabled={!filtered.length}><Download size={15} />{tr('ca.export')}</button>
          <button type="button" className="ca-btn primary" onClick={() => setModal({ type: 'form', id: null })}><Plus size={15} />{tr('ca.add')}</button>
          <DateRangeMenu range={range} setRange={setRange} />
        </div>
      </div>

      {(empty || metrics.outOfRange) && (
        <div className="ca-notice" role="status"><AlertTriangle size={15} />{empty ? tr('ca.noData') : tr('ca.future', { d: fmtDate(REF_DATE) })}</div>
      )}

      {/* ---------- KPI cards ---------- */}
      <div className="ca-kpis">
        {KPI_IDS.map((id) => {
          const { Icon, color, goodUp } = KPI_META[id], k = metrics.kpis[id], on = sel === id;
          return (
            <button key={id} type="button" className={`card ca-kpi ${on ? 'is-selected' : ''}`} aria-pressed={on} onClick={() => setSel(id)}>
              <span className={`ca-kpi-ic ${color}`}><Icon size={26} /></span>
              <span className="ca-kpi-t"><small>{tr(`ca.kpi.${id}`)}</small><span className="ca-kpi-v"><b>{k.value}</b><Trend change={empty ? null : k.change} goodUp={goodUp} /></span></span>
              <span className="ca-kpi-d">{kpiDesc(id)}</span>
            </button>
          );
        })}
      </div>

      {/* ---------- charts ---------- */}
      <div className="ca-charts">
        <Card icon={<BarChart3 size={16} />} title={tr('ca.ch.activity')} right={<span className="ca-sub">{tr(`ca.unit.${activity.unit}`)}</span>}>
          <div className="ca-chart-body">
            {activityEmpty ? <Empty>{tr('ca.noData')}</Empty> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activity.data} margin={{ top: 8, right: 14, left: -18, bottom: 0 }}>
                  <defs><linearGradient id="caGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0758F9" stopOpacity=".25" /><stop offset="100%" stopColor="#0758F9" stopOpacity=".04" /></linearGradient></defs>
                  <CartesianGrid stroke="#E4ECF5" vertical={false} />
                  <XAxis dataKey="label" tick={axis} tickLine={false} minTickGap={18} />
                  <YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<ActivityTip tr={tr} />} />
                  <Area type="monotone" dataKey="admins" stroke="#0758F9" strokeWidth={2} fill="url(#caGrad)" dot={activity.data.length <= 16 ? { r: 3, fill: '#0758F9', stroke: '#0758F9' } : false} activeDot={{ r: 5, fill: '#fff', stroke: '#0758F9', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>)}
          </div>
        </Card>

        <Card icon={<Users size={16} />} title={tr('ca.ch.roles')} right={<span className="ca-sub">{tr('ca.asOf', { d: fmtDate(metrics.asOf) })}</span>}>
          <div className="ca-chart-body">
            {!total.value ? <Empty>{tr('ca.noData')}</Empty> : (
              <div className="ca-donut-wrap">
                <div className="ca-donut">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={roleData.filter((r) => r.value > 0)} dataKey="value" nameKey="name" innerRadius="64%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="#fff" strokeWidth={2}>
                        {roleData.filter((r) => r.value > 0).map((r) => <Cell key={r.role} fill={r.color} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [`${v} (${Math.round((v / total.value) * 100)}%)`, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="ca-donut-c"><b>{total.value}</b><span>{tr('ca.total')}</span></div>
                </div>
                <ul className="ca-legend">
                  {roleData.map((r) => <li key={r.role}><i style={{ background: r.color }} />{r.name}<span>{r.value} ({total.value ? Math.round((r.value / total.value) * 100) : 0}%)</span></li>)}
                </ul>
              </div>)}
          </div>
        </Card>

        <Card icon={<Activity size={16} />} title={tr('ca.ch.status')} right={<Select value={win} options={[6, 12]} onChange={setWin} format={(o) => tr(`ca.win.${o}`)} />}>
          <ul className="ca-keys">{STATUSES.map((s) => <li key={s}><i style={{ background: STATUS_COLORS[s] }} />{tr(`ca.st.${s}`)}</li>)}</ul>
          <div className="ca-chart-body short">
            {!statusData.length ? <Empty>{tr('ca.noData')}</Empty> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#E4ECF5" vertical={false} />
                  <XAxis dataKey="label" tick={axis} tickLine={false} />
                  <YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<StatusTip tr={tr} fmtDate={fmtDate} />} cursor={{ fill: '#EEF7FC' }} />
                  {STATUSES.map((s, i) => <Bar key={s} dataKey={s} stackId="st" fill={STATUS_COLORS[s]} radius={i === STATUSES.length - 1 ? [2, 2, 0, 0] : 0} maxBarSize={36} />)}
                </BarChart>
              </ResponsiveContainer>)}
          </div>
        </Card>
      </div>

      {/* ---------- management table ---------- */}
      <section className="card ca-card ca-table-card" ref={tableRef} aria-labelledby="ca-tbl-h">
        <header className="card-h">
          <span className="ic-sq"><UserCog size={16} /></span><h3 id="ca-tbl-h">{tr('ca.tbl.title')}</h3>
          <span className="ca-count">{filtered.length}</span><div className="grow" />
        </header>
        <div className="ca-toolbar">
          <div className="ca-search">
            <Search size={15} aria-hidden="true" />
            <input type="search" value={q} placeholder={tr('ca.search')} aria-label={tr('ca.search.label')} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
            {q && <button type="button" className="ca-clear" aria-label={tr('ca.clearSearch')} onClick={() => { setQ(''); setPage(1); }}><X size={14} /></button>}
          </div>
          <select aria-label={tr('ca.f.status')} value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="all">{tr('ca.f.allStatus')}</option>{STATUSES.map((s) => <option key={s} value={s}>{tr(`ca.st.${s}`)}</option>)}
          </select>
          <select aria-label={tr('ca.f.company')} value={filters.company} onChange={(e) => setFilter('company', e.target.value)}>
            <option value="all">{tr('ca.f.allCompany')}</option>{COMPANIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select aria-label={tr('ca.f.role')} value={filters.role} onChange={(e) => setFilter('role', e.target.value)}>
            <option value="all">{tr('ca.f.allRole')}</option>{ROLES.map((r) => <option key={r} value={r}>{tr(`ca.role.${r}`)}</option>)}
          </select>
        </div>
        {chips.length > 0 && (
          <div className="ca-chips" role="group" aria-label={tr('ca.f.active')}>
            {chips.map((c) => (
              <span key={c.k} className="ca-chip">{c.label}: <b>{c.value}</b>
                <button type="button" aria-label={tr('ca.f.remove', { f: c.label })} onClick={() => removeChip(c.k)}><X size={12} /></button></span>))}
            <button type="button" className="ca-link" onClick={clearAll}>{tr('ca.clearAll')}</button>
          </div>
        )}
        <div className="ca-scroll">
          <table className="ca-tbl" aria-label={tr('ca.tbl.title')}>
            <thead><tr>
              <th scope="col">{tr('ca.col.admin')}</th><th scope="col">{tr('ca.col.email')}</th><th scope="col">{tr('ca.col.company')}</th><th scope="col">{tr('ca.col.role')}</th>
              <th scope="col">{tr('ca.col.status')}</th><th scope="col">{tr('ca.col.last')}</th><th scope="col">{tr('ca.col.invited')}</th><th scope="col" className="r">{tr('ca.col.signins')}</th>
              <th scope="col" className="r">{tr('ca.col.actions')}</th>
            </tr></thead>
            <tbody>
              {paged.map((r) => (
                <tr key={r.admin.id}>
                  <td><button type="button" className="ca-name" onClick={() => setModal({ type: 'view', id: r.admin.id })}><Avatar name={r.admin.name} /><span>{r.admin.name}</span></button></td>
                  <td className="muted">{r.admin.email}</td>
                  <td>{r.company?.name}</td>
                  <td><RolePill v={r.admin.role} tr={tr} /></td>
                  <td><StatusPill v={r.status} tr={tr} /></td>
                  <td className="muted">{r.last ? fmtDateTime(r.last) : tr('ca.never')}</td>
                  <td className="muted">{fmtDate(r.admin.createdAt)}</td>
                  <td className="r">{r.signins}</td>
                  <td className="r"><RowMenu row={r} tr={tr} onAction={onRowAction} /></td>
                </tr>))}
              {!paged.length && (
                <tr><td colSpan={9} className="ca-empty">
                  <b>{tr('ca.empty.title')}</b><span>{tr('ca.empty.sub')}</span>
                  {chips.length > 0 && <button type="button" className="ca-btn sm" onClick={clearAll}>{tr('ca.clearAll')}</button>}
                </td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="ca-foot">
          <span>{filtered.length ? tr('ca.showing', { a: (cur - 1) * PAGE_SIZE + 1, b: Math.min(cur * PAGE_SIZE, filtered.length), n: filtered.length }) : tr('ca.empty.title')}</span>
          {pages > 1 && <Pager page={cur} pages={pages} onPage={setPage} tr={tr} />}
        </div>
        <p className="ca-note">{tr('ca.tbl.note')} {tr('ca.demoNote')} <button type="button" className="ca-link" onClick={resetDemo}><RotateCcw size={11} /> {tr('ca.reset')}</button></p>
      </section>

      {/* ---------- bottom panels ---------- */}
      <div className="ca-bottom">
        <Card icon={<Building2 size={16} />} title={tr('ca.pn.top')}>
          {!topCo.length ? <Empty>{tr('ca.noData')}</Empty> : (
            <ul className="ca-top">
              {topCo.map((c, i) => (
                <li key={c.companyId}>
                  <button type="button" title={`${tr('ca.pn.companyHint')} · ${tr('ca.st.active')}: ${activeByCo.get(c.companyId) || 0}`} onClick={() => { setFilters({ status: 'all', company: c.companyId, role: 'all' }); setQ(''); setPage(1); scrollToTable(); }}>
                    <span className="ca-rank">{i + 1}</span><Avatar name={companyName(c.companyId)} /><span className="ca-co">{companyName(c.companyId)}</span>
                    <span className="ca-bar"><i style={{ width: `${Math.round((c.n / maxCo) * 100)}%` }} /></span>
                    <b>{c.n}</b>
                  </button>
                </li>))}
            </ul>)}
        </Card>

        <Card icon={<Activity size={16} />} title={tr('ca.pn.actions')} right={events.length > 6 && <button type="button" className="ca-btn sm" onClick={() => setModal({ type: 'actions' })}>{tr('ca.viewAll')}</button>}>
          {!events.length ? <Empty>{tr('ca.pn.noActions')}</Empty> : (
            <ul className="ca-events">
              {events.slice(0, 6).map((e) => { const { Icon, c } = EVENT_META[e.type]; return (
                <li key={e.id}><span className={`ca-ev-ic ${c}`}><Icon size={13} /></span><span className="ca-ev-t">{evText(e)}</span><time dateTime={e.ts}>{fmtDateTime(e.ts)}</time></li>); })}
            </ul>)}
        </Card>

        <Card icon={<ShieldCheck size={16} />} title={tr('ca.pn.insights')} right={<span className="ca-sub">{tr('ca.asOf', { d: fmtDate(metrics.asOf) })}</span>}>
          {empty ? <Empty>{tr('ca.noData')}</Empty> : (
            <ul className="ca-insights">
              {insightItems.length === 0 && <li><span className="ca-in-ic green"><CheckCircle2 size={16} /></span><span className="ca-in-t"><b>{tr('ca.in.ok')}</b><small>{tr('ca.in.okSub')}</small></span></li>}
              {insightItems.map(({ k, Icon, c, t, s, go }) => (
                <li key={k}>
                  {go ? (
                    <button type="button" onClick={() => { setFilters({ status: go.status, company: 'all', role: 'all' }); setQ(''); setPage(1); scrollToTable(); }}>
                      <span className={`ca-in-ic ${c}`}><Icon size={16} /></span><span className="ca-in-t"><b>{t}</b><small>{s}</small></span><ChevronRight size={14} />
                    </button>
                  ) : (
                    <div><span className={`ca-in-ic ${c}`}><Icon size={16} /></span><span className="ca-in-t"><b>{t}</b><small>{s}</small></span></div>
                  )}
                </li>))}
            </ul>)}
        </Card>
      </div>

      {/* ---------- portaled layers: drawer + overlay + modals ---------- */}
      {createPortal(
        <div className="ca-portal">
          {sel && selK && (
            <>
              <div className="ca-overlay" onClick={() => setSel(null)} aria-hidden="true" />
              <aside className="ca-drawer" role="dialog" aria-modal="true" aria-labelledby="ca-drawer-h" aria-label={tr('ca.drawer', { title: tr(`ca.kpi.${sel}`) })} onClick={(e) => e.stopPropagation()}>
                <div className="ca-drawer-h">
                  <h2 id="ca-drawer-h">{tr(`ca.kpi.${sel}`)}</h2>
                  <button type="button" ref={closeRef} className="ca-x" onClick={() => setSel(null)} aria-label={tr('ca.btn.close')}><X size={18} /></button>
                </div>
                <div className="ca-drawer-b">
                  <div className="ca-hero">
                    <span className={`ca-kpi-ic ${selMeta.color}`}>{(() => { const I = selMeta.Icon; return <I size={26} />; })()}</span>
                    <div><b>{selK.value}</b><Trend change={empty ? null : selK.change} goodUp={selMeta.goodUp} /></div>
                    <p>{tr(`ca.kdesc.${sel}`)}</p>
                  </div>

                  <h4>{tr('ca.dr.dates')}</h4>
                  <dl className="ca-kv">
                    <div><dt>{tr('ca.dr.period')}</dt><dd>{periodLabel}</dd></div>
                    <div><dt>{tr('ca.dr.asof')}</dt><dd>{fmtDate(metrics.asOf)}</dd></div>
                    <div><dt>{tr('ca.dr.prevPeriod')}</dt><dd>{fmtDate(metrics.prev.start)} – {fmtDate(metrics.prev.end)}</dd></div>
                    <div><dt>{tr('ca.dr.prevValue')}</dt><dd>{selK.prevValue}</dd></div>
                    <div><dt>{tr('ca.dr.change')}</dt><dd>{empty || selK.change == null ? '–' : `${selK.change > 0 ? '+' : ''}${selK.change}%`}</dd></div>
                  </dl>

                  <h4>{tr('ca.dr.movement')}</h4>
                  <dl className="ca-kv">{selK.moves.map((m) => <div key={m.k}><dt>{tr(m.k)}</dt><dd>{m.n}</dd></div>)}</dl>

                  {selK.value === 0 ? <p className="ca-drawer-empty">{tr('ca.dr.nodata')}</p> : (
                    <>
                      <h4>{tr('ca.dr.byRole')}</h4>
                      <ul className="ca-split">
                        {selK.byRole.filter((r) => r.n > 0).map((r) => (
                          <li key={r.role}><span>{tr(`ca.role.${r.role}`)}</span><span className="ca-bar"><i style={{ width: `${Math.round((r.n / selK.value) * 100)}%`, background: ROLE_COLORS[r.role] }} /></span><b>{r.n}</b></li>))}
                      </ul>
                      <h4>{tr('ca.dr.byCompany')}</h4>
                      <ul className="ca-split">
                        {selK.byCompany.slice(0, 5).map((c) => (
                          <li key={c.companyId}><span>{companyName(c.companyId)}</span><span className="ca-bar"><i style={{ width: `${Math.round((c.n / selK.byCompany[0].n) * 100)}%` }} /></span><b>{c.n}</b></li>))}
                      </ul>
                      <h4>{tr('ca.dr.records', { n: selK.value })}</h4>
                      <ul className="ca-recs">
                        {selK.items.slice(0, 10).map((i) => (
                          <li key={i.admin.id}>
                            <button type="button" onClick={() => setModal({ type: 'view', id: i.admin.id })}>
                              <Avatar name={i.admin.name} />
                              <span className="ca-rec-t"><b>{i.admin.name}</b><small>{companyName(i.admin.companyId)}</small></span>
                              <span className="ca-rec-d">{tr(i.status === 'pending' ? 'ca.dr.invitedOn' : 'ca.dr.since', { d: fmtDate(i.since.slice(0, 10)) })}</span>
                            </button>
                          </li>))}
                      </ul>
                      {selK.value > 10 && <p className="ca-more">{tr('ca.dr.more', { a: 10, n: selK.value })}</p>}
                      <button type="button" className="ca-btn wide" onClick={() => { setFilters({ status: sel === 'total' ? 'all' : sel, company: 'all', role: 'all' }); setQ(''); setPage(1); setSel(null); scrollToTable(); }}>{tr('ca.dr.showTable')}</button>
                    </>
                  )}
                  <p className="ca-drawer-note">{tr('ca.dr.note')}</p>
                </div>
              </aside>
            </>
          )}

          {modal?.type === 'form' && (modal.id ? editing : true) && (
            <Modal title={tr(editing ? 'ca.form.editTitle' : 'ca.form.addTitle')} onClose={() => setModal(null)} closeLabel={tr('ca.btn.close')}>
              <AdminForm key={modal.id || 'new'} admin={editing} status={editing ? currentStatus(model, editing.id) : null} data={data} tr={tr} onCancel={() => setModal(null)} onSave={saveForm} />
            </Modal>
          )}

          {viewing && (() => {
            const st = currentStatus(model, viewing.id);
            const hist = adminHistory(model, viewing.id);
            const since = (model.tl.get(viewing.id) || []).slice(-1)[0]?.ts;
            const accepted = hist.find((e) => e.type === 'accepted');
            const last = lastLoginAt(viewing.id);
            const n30 = signinsInRange(viewing.id, { start: addDays(REF_DATE, -29), end: REF_DATE });
            return (
              <Modal title={tr('ca.dt.title')} onClose={() => setModal(null)} closeLabel={tr('ca.btn.close')} wide>
                <div className="ca-modal-b">
                  <div className="ca-who"><Avatar name={viewing.name} /><div><b>{viewing.name}</b><small>{viewing.email}</small></div><StatusPill v={st} tr={tr} /></div>
                  <dl className="ca-kv two">
                    <div><dt>{tr('ca.col.company')}</dt><dd>{companyName(viewing.companyId)}</dd></div>
                    <div><dt>{tr('ca.col.role')}</dt><dd>{tr(`ca.role.${viewing.role}`)}</dd></div>
                    <div><dt>{tr('ca.dt.since')}</dt><dd>{since ? fmtDateTime(since) : '–'}</dd></div>
                    <div><dt>{tr('ca.dt.invited')}</dt><dd>{fmtDate(viewing.createdAt)}</dd></div>
                    <div><dt>{tr('ca.dt.accepted')}</dt><dd>{accepted ? fmtDate(accepted.ts.slice(0, 10)) : tr('ca.dt.notAccepted')}</dd></div>
                    <div><dt>{tr('ca.dt.last')}</dt><dd>{last ? fmtDateTime(last) : tr('ca.never')}</dd></div>
                    <div><dt>{tr('ca.dt.signinsP')}</dt><dd>{empty ? 0 : signinsInRange(viewing.id, periodRange)}</dd></div>
                    <div><dt>{tr('ca.dt.signins30')}</dt><dd>{n30}</dd></div>
                  </dl>
                  <h4>{tr('ca.dt.history')}</h4>
                  {!hist.length ? <p className="ca-hint block">{tr('ca.dt.none')}</p> : (
                    <ul className="ca-events compact">
                      {hist.slice(0, 8).map((e) => { const { Icon, c } = EVENT_META[e.type]; return (
                        <li key={e.id}><span className={`ca-ev-ic ${c}`}><Icon size={13} /></span><span className="ca-ev-t">{evText(e)} <small>{tr('ca.ev.by', { actor: e.actor })}</small></span><time dateTime={e.ts}>{fmtDateTime(e.ts)}</time></li>); })}
                    </ul>)}
                </div>
                <div className="ca-modal-f">
                  <button type="button" className="ca-btn" onClick={() => setModal({ type: 'form', id: viewing.id })}><Pencil size={14} />{tr('ca.btn.edit')}</button>
                  <button type="button" className="ca-btn primary" onClick={() => setModal(null)}>{tr('ca.btn.close')}</button>
                </div>
              </Modal>);
          })()}

          {confirming && (
            <Modal title={tr(`ca.cf.${modal.kind}.t`)} onClose={() => setModal(null)} closeLabel={tr('ca.btn.close')}>
              <div className="ca-modal-b">
                <p className="ca-confirm">{tr(`ca.cf.${modal.kind}.b`, { name: confirming.name, company: companyName(confirming.companyId) })}</p>
                <p className="ca-hint block">{tr('ca.cf.demo')}</p>
              </div>
              <div className="ca-modal-f">
                <button type="button" className="ca-btn" onClick={() => setModal(null)}>{tr('ca.btn.cancel')}</button>
                <button type="button" autoFocus className={`ca-btn ${modal.kind === 'restore' ? 'primary' : 'danger'}`} onClick={() => { doAction(modal.kind, confirming); setModal(null); }}>{tr('ca.btn.confirm')}</button>
              </div>
            </Modal>
          )}

          {modal?.type === 'actions' && (
            <Modal title={tr('ca.pn.actionsAll')} onClose={() => setModal(null)} closeLabel={tr('ca.btn.close')} wide>
              <div className="ca-modal-b">
                <ul className="ca-events compact">
                  {events.map((e) => { const { Icon, c } = EVENT_META[e.type]; return (
                    <li key={e.id}><span className={`ca-ev-ic ${c}`}><Icon size={13} /></span><span className="ca-ev-t">{evText(e)} <small>{tr('ca.ev.by', { actor: e.actor })}</small></span><time dateTime={e.ts}>{fmtDateTime(e.ts)}</time></li>); })}
                </ul>
              </div>
              <div className="ca-modal-f"><button type="button" className="ca-btn primary" onClick={() => setModal(null)}>{tr('ca.btn.close')}</button></div>
            </Modal>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
