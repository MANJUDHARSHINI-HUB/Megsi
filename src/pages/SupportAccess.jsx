import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  AlertTriangle, ArrowDown, ArrowUp, Building2, CalendarClock, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock,
  Cog, ContactRound, Download, Eye, FileText, Fingerprint, Globe, History, MoreHorizontal, Radio, Search,
  ShieldCheck, ShieldHalf, TimerReset, UserSearch, Video, X, BarChart3, XCircle, Ban, Copy,
} from 'lucide-react';
import DateRangeMenu from '../components/DateRangeMenu.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { PRESETS } from '../data/selectors.js';
import {
  ACCESS_TYPES, COMPLIANCE, DIST_LEGEND, DIST_SLICES, DIST_TENANTS, DURATION_BUCKETS, DURATION_DATA, HEALTH, KPI_BASE, MONTHS,
  MOST_ACCESSED, REQUEST_STATUSES, SEED_EVENTS, SEED_REQUESTS, SEED_SESSIONS, TREND, TREND_RANGES, fmtMins, nowIso,
} from '../data/supportAccessData.js';
import './support-access.css';

const PAGE_SIZE = 8;
const AX = { fontSize: 10.5, fill: '#465477' };
const STATUS_CLS = { Approved: 'green', Pending: 'orange', Rejected: 'red', Expired: 'grey', Revoked: 'grey' };
const csvCell = (v) => `"${String(v).replace(/"/g, '""')}"`;

/* ------------------------------------------------------------------ small building blocks */
function Dropdown({ value, options, onChange, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const k = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', h); document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k); };
  }, [open]);
  return (
    <div className={`sa-dd ${className}`} ref={ref}>
      <button type="button" className="sa-select" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span>{value}</span><ChevronDown size={14} strokeWidth={3} />
      </button>
      {open && (
        <div className="sa-dd-pop" role="listbox">
          {options.map((o) => (
            <button type="button" role="option" aria-selected={o === value} key={o} className={o === value ? 'sel' : ''} onClick={() => { onChange(o); setOpen(false); }}>{o}</button>
          ))}
        </div>
      )}
    </div>
  );
}

const CardHead = ({ icon, bare, title, children }) => (
  <header className="sa-card-h">
    <span className={`sa-ic ${bare ? 'bare' : ''}`}>{icon}</span>
    <h3>{title}</h3>
    <div className="grow" />
    {children}
  </header>
);

function PhotoAvatar({ tone = 0 }) {
  const skin = ['#E2B79A', '#D9A98B', '#C99577'][tone % 3];
  const hair = ['#3B2A22', '#2A2220', '#4A3426'][tone % 3];
  return (
    <svg className="sa-photo" viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" fill="#CFD5DC" />
      <path d="M3 40c1-9 8-13 17-13s16 4 17 13z" fill="#272C3A" />
      <path d="M15 27l5 8 5-8z" fill="#F4F6F8" />
      <rect x="17" y="21" width="6" height="7" rx="2" fill={skin} />
      <ellipse cx="20" cy="15" rx="6.5" ry="7.6" fill={skin} />
      <path d="M13.3 14c0-6 3.4-8.4 7-8.4 4 0 6.8 2.6 6.4 8.4-1.4-3.2-3.4-4.2-6.4-4.2s-5 1-7 4.2z" fill={hair} />
    </svg>
  );
}

const Pill = ({ status }) => <span className={`sa-pill ${STATUS_CLS[status] || 'green'}`}><i />{status}</span>;

function Modal({ title, onClose, wide, children, footer }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [onClose]);
  return createPortal(
    <div className="sa-modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`sa-modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="sa-modal-h"><h3>{title}</h3><button type="button" className="sa-x" aria-label="Close" onClick={onClose}><X size={18} /></button></div>
        <div className="sa-modal-b">{children}</div>
        {footer && <div className="sa-modal-f">{footer}</div>}
      </div>
    </div>, document.body);
}

function RowMenu({ req, onAction }) {
  const [pos, setPos] = useState(null);
  const btn = useRef(null);
  useEffect(() => {
    if (!pos) return undefined;
    const close = () => setPos(null);
    const down = (e) => { if (!e.target.closest('.sa-menu') && !btn.current?.contains(e.target)) close(); };
    const key = (e) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', down); document.addEventListener('keydown', key);
    window.addEventListener('scroll', close, true); window.addEventListener('resize', close);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };
  }, [pos]);
  const toggle = () => {
    if (pos) { setPos(null); return; }
    const r = btn.current.getBoundingClientRect(); const h = 200;
    setPos({ top: r.bottom + 4 + h > window.innerHeight ? Math.max(8, r.top - h - 4) : r.bottom + 4, left: Math.max(8, r.right - 190) });
  };
  const run = (a) => { setPos(null); onAction(a, req); };
  return (
    <>
      <button ref={btn} type="button" className="sa-dots" aria-label={`Actions for ${req.id}`} aria-haspopup="menu" aria-expanded={!!pos} onClick={toggle}><MoreHorizontal size={16} strokeWidth={3} /></button>
      {pos && createPortal(
        <div className="sa-menu" role="menu" style={{ top: pos.top, left: pos.left }}>
          <button type="button" role="menuitem" onClick={() => run('view')}><Eye size={15} />View Details</button>
          {req.status === 'Pending' && <button type="button" role="menuitem" className="ok" onClick={() => run('approve')}><CheckCircle2 size={15} />Approve Request</button>}
          {req.status === 'Pending' && <button type="button" role="menuitem" className="bad" onClick={() => run('reject')}><XCircle size={15} />Reject Request</button>}
          {req.status === 'Approved' && <button type="button" role="menuitem" onClick={() => run('extend')}><TimerReset size={15} />Extend by 2 Hours</button>}
          {req.status === 'Approved' && <button type="button" role="menuitem" className="bad" onClick={() => run('revoke')}><Ban size={15} />Revoke Access</button>}
          <button type="button" role="menuitem" onClick={() => run('copy')}><Copy size={15} />Copy Request ID</button>
        </div>, document.body)}
    </>
  );
}


/* KPI glyphs: solid white shapes like the reference */
const Svg = ({ children }) => <svg viewBox="0 0 32 32" aria-hidden="true">{children}</svg>;
const KPI_ICONS = {
  active: () => <Svg><rect x="4" y="5" width="24" height="17" rx="2.5" fill="none" stroke="#fff" strokeWidth="2.6" /><rect x="13" y="11" width="6" height="5" rx="1" fill="#fff" opacity=".85" /><path d="M11 27h10M16 22v5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" /></Svg>,
  approved: () => <Svg><circle cx="16" cy="16" r="12" fill="#fff" /><path d="M10.5 16.5l4 4 7-8" fill="none" stroke="#059851" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></Svg>,
  pending: () => <Svg><circle cx="16" cy="16" r="12" fill="#fff" /><path d="M16 9v7.5l4.5 3" fill="none" stroke="#FB8C07" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></Svg>,
  expired: () => <Svg><path d="M16 4.5c.9 0 1.7.5 2.2 1.3l10 17.4c.9 1.6-.2 3.6-2.2 3.6H6c-2 0-3.1-2-2.2-3.6l10-17.4c.5-.8 1.3-1.3 2.2-1.3z" fill="#fff" /><path d="M16 12v6.5" stroke="#F5051F" strokeWidth="3" strokeLinecap="round" /><circle cx="16" cy="22.6" r="1.7" fill="#F5051F" /></Svg>,
  engineers: () => <Svg><circle cx="12" cy="11" r="5" fill="#fff" /><path d="M2.5 26c0-5.2 4.2-8.5 9.5-8.5s9.5 3.3 9.5 8.5z" fill="#fff" /><circle cx="22.5" cy="12" r="4" fill="#fff" opacity=".85" /><path d="M21.5 18c4.6-.5 8.5 2.2 8.5 7h-6.5c0-2.8-.8-5-2-7z" fill="#fff" opacity=".85" /></Svg>,
  emergency: () => <Svg><path d="M16 3.5l11 4v8.2c0 6.2-4.4 10.6-11 12.8C9.4 26.3 5 21.9 5 15.7V7.5z" fill="#fff" /><path d="M16 9l6 2.2v4.6c0 3.4-2.4 5.9-6 7.1-3.6-1.2-6-3.7-6-7.1v-4.6z" fill="#015CF5" /><circle cx="16" cy="15.3" r="2.1" fill="#fff" /></Svg>,
};

/* ------------------------------------------------------------------ timeline icons */
const TL = {
  approved: { cls: 'soft green', Icon: Building2 },
  started: { cls: 'soft blue', Icon: UserSearch },
  extended: { cls: 'soft red', Icon: Building2 },
  emergency: { cls: 'solid red', Icon: AlertTriangle },
  closed: { cls: 'solid navy', Icon: Building2 },
  rejected: { cls: 'solid red', Icon: AlertTriangle },
};
const TLIcon = ({ kind }) => { const { cls, Icon } = TL[kind] || TL.approved; return <span className={`sa-tl-ic ${cls}`}><Icon size={13} strokeWidth={2.4} /></span>; };

const COMPLIANCE_ICON = {
  mfa: <ShieldCheck size={18} fill="#0C9A55" color="#0C9A55" strokeWidth={1.5} />,
  reviews: <FileText size={18} color="#0B63FF" fill="#0B63FF" strokeWidth={1.5} />,
  rec: <Video size={18} color="#4A2BD6" fill="#4A2BD6" strokeWidth={1.5} />,
  unauth: <AlertTriangle size={18} color="#F97316" fill="#F97316" strokeWidth={1.5} />,
  crit: <AlertTriangle size={18} color="#E8172D" fill="#E8172D" strokeWidth={1.5} />,
};

/* ------------------------------------------------------------------ page */
export default function SupportAccess({ toast }) {
  const { fmtDate, fmtDateTime } = useI18n();
  const [range, setRange] = useState({ start: PRESETS[0].start, end: PRESETS[0].end });
  const [requests, setRequests] = useState(SEED_REQUESTS);
  const [sessions, setSessions] = useState(SEED_SESSIONS);
  const [events, setEvents] = useState(SEED_EVENTS);
  const [adj, setAdj] = useState({ approved: 0, pending: 0 });
  const [trendRange, setTrendRange] = useState('Last 12 Months');
  const [distTenant, setDistTenant] = useState('All Tenants');
  const [durRange, setDurRange] = useState('This Month');
  const [accessRange, setAccessRange] = useState('Last 30 Days');
  const [modal, setModal] = useState(null);
  const [hiDist, setHiDist] = useState(null);

  // live session clocks
  useEffect(() => {
    const id = setInterval(() => setSessions((s) => s.map((x) => ({ ...x, mins: x.mins + 1 }))), 60000);
    return () => clearInterval(id);
  }, []);

  const inRange = (iso) => iso.slice(0, 10) >= range.start && iso.slice(0, 10) <= range.end;
  const periodRequests = useMemo(() => requests.filter((r) => inRange(r.date)), [requests, range]); // eslint-disable-line react-hooks/exhaustive-deps
  const periodEvents = useMemo(() => events.filter((e) => inRange(e.at)).sort((a, b) => b.at.localeCompare(a.at)), [events, range]); // eslint-disable-line react-hooks/exhaustive-deps

  const log = (kind, text) => setEvents((ev) => [{ id: `n${Date.now()}${Math.random()}`, kind, text, at: nowIso() }, ...ev]);
  const patch = (id, p) => setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const act = (a, req) => {
    if (a === 'view') setModal({ type: 'request', id: req.id });
    else if (a === 'copy') {
      try { navigator.clipboard?.writeText(req.id); } catch { /* clipboard unavailable */ }
      toast(`${req.id} copied to clipboard`);
    } else if (a === 'approve') {
      patch(req.id, { status: 'Approved' }); setAdj((x) => ({ approved: x.approved + 1, pending: x.pending - 1 }));
      log('approved', `Support request approved: ${req.id}`); toast(`${req.id} approved`);
    } else if (a === 'reject') {
      patch(req.id, { status: 'Rejected' }); setAdj((x) => ({ ...x, pending: x.pending - 1 }));
      log('rejected', `Support request rejected: ${req.id}`); toast(`${req.id} rejected`);
    } else if (a === 'extend') {
      patch(req.id, { hours: req.hours + 2 }); log('extended', `Access extended: ${req.id}`); toast(`${req.id} extended by 2 hours`);
    } else if (a === 'revoke') {
      patch(req.id, { status: 'Revoked' }); setAdj((x) => ({ ...x, approved: x.approved - 1 }));
      log('closed', `Access revoked: ${req.id}`); toast(`Access revoked for ${req.id}`);
    }
  };

  const endSession = (s) => {
    setSessions((ss) => ss.filter((x) => x.id !== s.id));
    log('closed', `Support session closed: ${s.engineer}`); toast(`Session for ${s.engineer} ended`);
    setModal((m) => (m && m.type === 'session' ? null : m));
  };

  const engaged = sessions.length;
  const kpis = [
    { id: 'active', label: 'Active Support Sessions', value: sessions.length + (KPI_BASE.active - SEED_SESSIONS.length), delta: '12%', up: true, sub: 'Currently connected', cls: 'blue', Icon: KPI_ICONS.active, open: { type: 'sessions' } },
    { id: 'approved', label: 'Approved Requests', value: KPI_BASE.approved + adj.approved, delta: '8%', up: true, sub: 'This month', cls: 'green', Icon: KPI_ICONS.approved, open: { type: 'requests', status: 'Approved' } },
    { id: 'pending', label: 'Pending Requests', value: KPI_BASE.pending + adj.pending, delta: '5%', up: true, sub: 'Awaiting approval', cls: 'orange', Icon: KPI_ICONS.pending, open: { type: 'requests', status: 'Pending' } },
    { id: 'expired', label: 'Expired Access', value: KPI_BASE.expired, delta: '29%', up: false, sub: 'This week', cls: 'red', Icon: KPI_ICONS.expired, open: { type: 'requests', status: 'Expired' } },
    { id: 'eng', label: 'Support Engineers', value: KPI_BASE.engineers, delta: '3%', up: true, sub: 'Authorized personnel', cls: 'purple', Icon: KPI_ICONS.engineers, open: { type: 'sessions' } },
    { id: 'emg', label: 'Emergency Access', value: KPI_BASE.emergency, delta: '0%', up: true, sub: 'Break glass events', cls: 'blue', Icon: KPI_ICONS.emergency, open: { type: 'requests', accessType: 'Emergency Access' } },
  ];

  /* chart data */
  const n = TREND_RANGES[trendRange];
  const trendData = useMemo(() => MONTHS.slice(12 - n).map((m, i) => ({
    m, requested: TREND.requested[12 - n + i], approved: TREND.approved[12 - n + i], rejected: TREND.rejected[12 - n + i],
  })), [n]);
  const dist = DIST_TENANTS[distTenant];
  const durData = DURATION_BUCKETS.map((b, i) => ({ b, v: DURATION_DATA[durRange][i] }));
  const durStep = Math.ceil(Math.max(...durData.map((d) => d.v)) / 4 / 5) * 5;
  const durTicks = [0, 1, 2, 3, 4].map((i) => i * durStep);
  const accessRows = MOST_ACCESSED[accessRange];
  const accessMax = Math.max(...accessRows.map((r) => r[1]));
  const recent = periodRequests.slice(0, 5);
  const recentModal = modal?.type === 'request' ? requests.find((r) => r.id === modal.id) : null;

  return (
    <div className="sa">
      <div className="title-row">
        <div><h1>Support Access Management</h1><p>Monitor, approve and control privileged support access across all tenant environments.</p></div>
        <DateRangeMenu range={range} setRange={setRange} />
      </div>

      {/* KPIs */}
      <div className="sa-kpis">
        {kpis.map((k) => (
          <button type="button" key={k.id} className="sa-card sa-kpi" onClick={() => setModal(k.open)}>
            <span className={`sa-kpi-ic ${k.cls}`}><k.Icon /></span>
            <span className="sa-kpi-main">
              <small>{k.label}</small>
              <span className="sa-kpi-v"><b>{k.value}</b><em className={k.up ? 'up' : 'down'}>{k.up ? <ArrowUp size={12} strokeWidth={3} /> : <ArrowDown size={12} strokeWidth={3} />}{k.delta}</em></span>
            </span>
            <span className="sa-kpi-sub">{k.sub}</span>
          </button>
        ))}
      </div>

      {/* charts */}
      <div className="sa-row sa-charts">
        <section className="sa-card sa-chart">
          <CardHead bare icon={<BarChart3 size={24} strokeWidth={3} />} title="Support Access Requests Trend">
            <Dropdown value={trendRange} options={Object.keys(TREND_RANGES)} onChange={setTrendRange} />
          </CardHead>
          <div className="sa-chart-body sa-trend">
            <div className="sa-plot">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 6, right: 8, left: -17, bottom: 0 }}>
                  <CartesianGrid stroke="#E6EBF7" />
                  <XAxis dataKey="m" tick={AX} tickLine={false} axisLine={false} interval={0} height={22} />
                  <YAxis tick={AX} tickLine={false} axisLine={false} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
                  <Tooltip cursor={{ stroke: '#C9D4EE' }} contentStyle={{ fontSize: 11.5, borderRadius: 6, border: '1px solid #E4ECF5' }} />
                  <Line name="Requested Access" type="linear" dataKey="requested" stroke="#0B63E8" strokeWidth={2.2} dot={{ r: 4, fill: '#0B63E8', stroke: '#0B63E8' }} activeDot={{ r: 5 }} />
                  <Line name="Approved Access" type="linear" dataKey="approved" stroke="#08994E" strokeWidth={2.2} dot={{ r: 4, fill: '#08994E', stroke: '#08994E' }} activeDot={{ r: 5 }} />
                  <Line name="Rejected Access" type="linear" dataKey="rejected" stroke="#E8172D" strokeWidth={2.2} dot={{ r: 4, fill: '#E8172D', stroke: '#E8172D' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <ul className="sa-legend-h">
              <li><i style={{ background: '#0B63E8' }} />Requested Access</li>
              <li><i style={{ background: '#08994E' }} />Approved Access</li>
              <li><i style={{ background: '#E8172D' }} />Rejected Access</li>
            </ul>
          </div>
        </section>

        <section className="sa-card sa-chart">
          <CardHead icon={<Fingerprint size={15} />} title="Access Type Distribution">
            <Dropdown value={distTenant} options={Object.keys(DIST_TENANTS)} onChange={setDistTenant} />
          </CardHead>
          <div className="sa-chart-body sa-dist">
            <div className="sa-donut">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={DIST_SLICES} dataKey="w" nameKey="of" startAngle={90} endAngle={-270} innerRadius={50} outerRadius={79} stroke="#fff" strokeWidth={1.5} isAnimationActive={false}
                    onMouseEnter={(_, i) => setHiDist(DIST_SLICES[i].of)} onMouseLeave={() => setHiDist(null)}>
                    {DIST_SLICES.map((s, i) => <Cell key={i} fill={s.color} opacity={hiDist && hiDist !== s.of ? 0.35 : 1} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="sa-donut-c"><b>{dist.total}</b><span>Active<br />Permissions</span></div>
            </div>
            <ul className="sa-dist-legend">
              {DIST_LEGEND.map((l) => (
                <li key={l.key} className={hiDist === l.key ? 'on' : ''} onMouseEnter={() => setHiDist(l.key)} onMouseLeave={() => setHiDist(null)}>
                  <i style={{ background: l.color }} /><span>{l.label}</span><b>{dist.pct[l.key]}%</b>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="sa-card sa-chart">
          <CardHead icon={<Clock size={15} strokeWidth={2.4} />} title="Session Duration Analytics">
            <Dropdown value={durRange} options={Object.keys(DURATION_DATA)} onChange={setDurRange} />
          </CardHead>
          <div className="sa-chart-body sa-dur">
            <div className="sa-plot">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={durData} margin={{ top: 11, right: 6, left: -14, bottom: 0 }} barCategoryGap="20%">
                  <CartesianGrid stroke="#E6EBF7" />
                  <XAxis dataKey="b" tick={AX} tickLine={false} axisLine={false} interval={0} />
                  <YAxis tick={AX} tickLine={false} axisLine={false} domain={[0, durTicks[4]]} ticks={durTicks} />
                  <Tooltip cursor={{ fill: 'rgba(11,99,255,.06)' }} contentStyle={{ fontSize: 11.5, borderRadius: 6, border: '1px solid #E4ECF5' }} formatter={(v) => [v, 'Sessions']} />
                  <Bar dataKey="v" fill="#368EFA" radius={[3, 3, 0, 0]} maxBarSize={44} isAnimationActive={false}>
                    <LabelList dataKey="v" position="top" style={{ fontSize: 12.5, fontWeight: 600, fill: '#101B4D' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>

      {/* tables */}
      <div className="sa-row sa-tables">
        <section className="sa-card sa-table-card">
          <CardHead icon={<ContactRound size={15} />} title="Recent Support Access Requests">
            <button type="button" className="sa-btn" onClick={() => setModal({ type: 'requests' })}>View All</button>
          </CardHead>
          <div className="sa-tscroll">
            <table className="sa-tbl sa-req">
              <thead><tr><th>#</th><th>Request ID</th><th>Company Name</th><th>Requested By</th><th>Access Type</th><th>Duration</th><th>Status</th><th>Date</th><th className="c">Actions</th></tr></thead>
              <tbody>
                {recent.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td><button type="button" className="sa-id" onClick={() => setModal({ type: 'request', id: r.id })}>{r.id}</button></td>
                    <td>{r.company}</td><td>{r.by}</td><td>{r.type}</td><td>{r.hours} Hours</td>
                    <td><Pill status={r.status} /></td>
                    <td>{fmtDate(r.date)}</td>
                    <td className="c"><RowMenu req={r} onAction={act} /></td>
                  </tr>
                ))}
                {recent.length === 0 && <tr className="none"><td colSpan={9}>No support access requests in the selected period.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="sa-card sa-table-card">
          <CardHead icon={<Radio size={15} />} title="Live Support Sessions">
            <span className="sa-live"><i />{engaged} Active</span>
            <button type="button" className="sa-btn" onClick={() => setModal({ type: 'sessions' })}>View All</button>
          </CardHead>
          <div className="sa-tscroll">
            <table className="sa-tbl sa-live-tbl">
              <thead><tr><th>#</th><th>Engineer</th><th>Company</th><th>Started</th><th>Duration</th><th>Status</th></tr></thead>
              <tbody>
                {sessions.slice(0, 5).map((s, i) => (
                  <tr key={s.id} className="click" onClick={() => setModal({ type: 'session', id: s.id })}>
                    <td>{i + 1}</td>
                    <td><span className="sa-eng">{s.avatar === 'photo' ? <PhotoAvatar tone={s.tone} /> : <span className="sa-ini">{s.avatar}</span>}{s.engineer}</span></td>
                    <td>{s.company}</td><td>{s.started}</td><td>{fmtMins(s.mins)}</td>
                    <td><span className="sa-pill green"><i />Active</span></td>
                  </tr>
                ))}
                {sessions.length === 0 && <tr className="none"><td colSpan={6}>No live support sessions.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* bottom */}
      <div className="sa-row sa-bottom">
        <div className="sa-bottom-l">
          <section className="sa-card sa-most">
            <CardHead icon={<ShieldHalf size={15} />} title="Most Accessed Companies">
              <Dropdown value={accessRange} options={Object.keys(MOST_ACCESSED)} onChange={setAccessRange} />
            </CardHead>
            <ul className="sa-bars">
              {accessRows.map(([name, v]) => (
                <li key={name} title={`${name}: ${v} sessions`}>
                  <span className="sa-bn">{name}</span>
                  <span className="sa-track"><i style={{ width: `${(v / accessMax) * 100}%` }} /></span>
                  <b>{v}</b>
                </li>
              ))}
            </ul>
          </section>

          <section className="sa-card sa-tline">
            <CardHead icon={<History size={15} />} title="Support Activity Timeline">
              <button type="button" className="sa-btn" onClick={() => setModal({ type: 'timeline' })}>View All</button>
            </CardHead>
            <ul className="sa-tl">
              {periodEvents.slice(0, 6).map((e) => (
                <li key={e.id}>
                  <i className="sa-tl-dot" />
                  <TLIcon kind={e.kind} />
                  <span className="sa-tl-t">{e.text}</span>
                  <span className="sa-tl-d">{fmtDateTime(e.at)}</span>
                </li>
              ))}
              {periodEvents.length === 0 && <li className="none">No activity in the selected period.</li>}
            </ul>
          </section>
        </div>

        <div className="sa-bottom-r">
          <section className="sa-card sa-comp">
            <CardHead icon={<Cog size={15} />} title="Security Compliance Status" />
            <div className="sa-comp-grid">
              {COMPLIANCE.map((c) => (
                <button type="button" key={c.id} className={`sa-comp-i t-${c.tone}`} onClick={() => setModal({ type: 'compliance', id: c.id })}>
                  {COMPLIANCE_ICON[c.id]}<small>{c.label}</small><b>{c.value}</b>
                </button>
              ))}
            </div>
          </section>

          <section className="sa-card sa-health">
            <CardHead icon={<Globe size={15} />} title="Support Access Health"><span className="sa-checked">Last checked: 20 Oct 2026 14:30</span></CardHead>
            <ul className="sa-health-grid">
              {HEALTH.map((h) => (
                <li key={h}><span className="sa-ok"><Check size={13} strokeWidth={3.4} /></span><span className="sa-hn">{h}</span><span className="sa-op">Operational</span></li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* modals */}
      {modal?.type === 'requests' && (
        <RequestsModal key={`${modal.status}-${modal.accessType}`} initial={modal} requests={requests} range={range} fmtDate={fmtDate} onAction={act} onClose={() => setModal(null)} toast={toast} />
      )}
      {recentModal && (
        <Modal title={`Request ${recentModal.id}`} onClose={() => setModal(null)} footer={<>
          {recentModal.status === 'Pending' && <><button type="button" className="sa-btn solid ok" onClick={() => act('approve', recentModal)}>Approve</button><button type="button" className="sa-btn bad" onClick={() => act('reject', recentModal)}>Reject</button></>}
          {recentModal.status === 'Approved' && <><button type="button" className="sa-btn" onClick={() => act('extend', recentModal)}>Extend by 2 Hours</button><button type="button" className="sa-btn bad" onClick={() => act('revoke', recentModal)}>Revoke Access</button></>}
          <button type="button" className="sa-btn" onClick={() => setModal(null)}>Close</button></>}>
          <dl className="sa-kv">
            <div><dt>Status</dt><dd><Pill status={recentModal.status} /></dd></div>
            <div><dt>Company</dt><dd>{recentModal.company}</dd></div>
            <div><dt>Requested by</dt><dd>{recentModal.by}</dd></div>
            <div><dt>Access type</dt><dd>{recentModal.type}</dd></div>
            <div><dt>Duration</dt><dd>{recentModal.hours} Hours</dd></div>
            <div><dt>Requested on</dt><dd>{fmtDate(recentModal.date)} {recentModal.time}</dd></div>
          </dl>
        </Modal>
      )}
      {modal?.type === 'sessions' && (
        <Modal wide title="Live Support Sessions" onClose={() => setModal(null)}>
          <table className="sa-tbl sa-full">
            <thead><tr><th>#</th><th>Engineer</th><th>Company</th><th>Request</th><th>Started</th><th>Duration</th><th>Status</th><th className="c">Action</th></tr></thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td><span className="sa-eng">{s.avatar === 'photo' ? <PhotoAvatar tone={s.tone} /> : <span className="sa-ini">{s.avatar}</span>}{s.engineer}</span></td>
                  <td>{s.company}</td><td>{s.request}</td><td>{s.started}</td><td>{fmtMins(s.mins)}</td>
                  <td><span className="sa-pill green"><i />Active</span></td>
                  <td className="c"><button type="button" className="sa-btn bad sm" onClick={() => endSession(s)}>End Session</button></td>
                </tr>
              ))}
              {sessions.length === 0 && <tr className="none"><td colSpan={8}>No live support sessions.</td></tr>}
            </tbody>
          </table>
        </Modal>
      )}
      {modal?.type === 'session' && (() => {
        const s = sessions.find((x) => x.id === modal.id);
        if (!s) return null;
        return (
          <Modal title="Support Session" onClose={() => setModal(null)} footer={<><button type="button" className="sa-btn bad" onClick={() => endSession(s)}>End Session</button><button type="button" className="sa-btn" onClick={() => setModal(null)}>Close</button></>}>
            <dl className="sa-kv">
              <div><dt>Engineer</dt><dd>{s.engineer}</dd></div>
              <div><dt>Company</dt><dd>{s.company}</dd></div>
              <div><dt>Linked request</dt><dd>{s.request}</dd></div>
              <div><dt>Started</dt><dd>{s.started}</dd></div>
              <div><dt>Duration</dt><dd>{fmtMins(s.mins)}</dd></div>
              <div><dt>Status</dt><dd><span className="sa-pill green"><i />Active</span></dd></div>
            </dl>
          </Modal>
        );
      })()}
      {modal?.type === 'timeline' && (
        <Modal wide title="Support Activity Timeline" onClose={() => setModal(null)}>
          <ul className="sa-tl full">
            {periodEvents.map((e) => (
              <li key={e.id}><TLIcon kind={e.kind} /><span className="sa-tl-t">{e.text}</span><span className="sa-tl-d">{fmtDateTime(e.at)}</span></li>
            ))}
            {periodEvents.length === 0 && <li className="none">No activity in the selected period.</li>}
          </ul>
        </Modal>
      )}
      {modal?.type === 'compliance' && (() => {
        const c = COMPLIANCE.find((x) => x.id === modal.id);
        return (
          <Modal title={c.label} onClose={() => setModal(null)} footer={<button type="button" className="sa-btn" onClick={() => setModal(null)}>Close</button>}>
            <div className={`sa-comp-big t-${c.tone}`}>{COMPLIANCE_ICON[c.id]}<b>{c.value}</b></div>
            <p className="sa-note">{c.note}</p>
          </Modal>
        );
      })()}
    </div>
  );
}

/* ------------------------------------------------------------------ "View All" requests modal */
function RequestsModal({ initial, requests, range, fmtDate, onAction, onClose, toast }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState(initial.status || 'All');
  const [type, setType] = useState(initial.accessType || 'All');
  const [page, setPage] = useState(1);
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return requests.filter((r) => r.date >= range.start && r.date <= range.end
      && (status === 'All' || r.status === status) && (type === 'All' || r.type === type)
      && (!s || [r.id, r.company, r.by, r.type, r.status].some((v) => v.toLowerCase().includes(s))));
  }, [requests, range, q, status, type]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const shown = rows.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const exportCsv = () => {
    const head = ['Request ID', 'Company Name', 'Requested By', 'Access Type', 'Duration (hours)', 'Status', 'Date'];
    const body = rows.map((r) => [r.id, r.company, r.by, r.type, r.hours, r.status, r.date].map(csvCell).join(','));
    const url = URL.createObjectURL(new Blob([[head.map(csvCell).join(','), ...body].join('\n')], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'support-access-requests.csv'; a.click(); URL.revokeObjectURL(url);
    toast(`Exported ${rows.length} requests`);
  };
  return (
    <Modal wide title="Support Access Requests" onClose={onClose}>
      <div className="sa-filters">
        <label className="sa-search"><Search size={15} /><input value={q} placeholder="Search requests..." onChange={(e) => { setQ(e.target.value); setPage(1); }} /></label>
        <select aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="All">All Statuses</option>{REQUEST_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <select aria-label="Access type" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}><option value="All">All Access Types</option>{ACCESS_TYPES.map((s) => <option key={s}>{s}</option>)}</select>
        <div className="grow" />
        <span className="sa-range"><CalendarClock size={14} />{fmtDate(range.start)} - {fmtDate(range.end)}</span>
        <button type="button" className="sa-btn" onClick={exportCsv}><Download size={14} />Export CSV</button>
      </div>
      <div className="sa-tscroll">
        <table className="sa-tbl sa-full">
          <thead><tr><th>#</th><th>Request ID</th><th>Company Name</th><th>Requested By</th><th>Access Type</th><th>Duration</th><th>Status</th><th>Date</th><th className="c">Actions</th></tr></thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={r.id}>
                <td>{(cur - 1) * PAGE_SIZE + i + 1}</td><td><b className="sa-idt">{r.id}</b></td><td>{r.company}</td><td>{r.by}</td><td>{r.type}</td><td>{r.hours} Hours</td>
                <td><Pill status={r.status} /></td><td>{fmtDate(r.date)}</td><td className="c"><RowMenu req={r} onAction={onAction} /></td>
              </tr>
            ))}
            {shown.length === 0 && <tr className="none"><td colSpan={9}>No requests match your filters.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="sa-pager">
        <span>{rows.length === 0 ? 'No results' : `Showing ${(cur - 1) * PAGE_SIZE + 1}-${Math.min(cur * PAGE_SIZE, rows.length)} of ${rows.length}`}</span>
        <div>
          <button type="button" aria-label="Previous page" disabled={cur <= 1} onClick={() => setPage(cur - 1)}><ChevronLeft size={15} /></button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => <button type="button" key={p} className={p === cur ? 'on' : ''} onClick={() => setPage(p)}>{p}</button>)}
          <button type="button" aria-label="Next page" disabled={cur >= pages} onClick={() => setPage(cur + 1)}><ChevronRight size={15} /></button>
        </div>
      </div>
    </Modal>
  );
}