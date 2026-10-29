import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ArrowDown, ArrowUp, Ban, Calendar, ChevronDown, ChevronLeft, ChevronRight, Clock, Download, Eye, FileText, Mail, MoreHorizontal, RotateCcw, Search, SearchCheck, Settings, ShieldAlert, ShieldCheck, Users, X } from 'lucide-react';
import { Avatar, Menu, PlanBadge } from '../components/Common.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { DEMO_TODAY, PLAN_COLORS, PLAN_LIST, REASONS, REASON_COLORS, REVIEW, REVIEW_LIST } from '../data/suspendedData.js';
import { BreakdownDonut, TrendChart } from './suspended/SuspendedCharts.jsx';
import { PoliciesModal, ReactivateModal, ReviewBadge, ReviewModal, TenantDrawer } from './suspended/SuspendedModals.jsx';
import './suspended-tenants.css';

const PAGE_SIZE = 5;
const COLS = [['name', 'Company Name'], ['plan', 'Subscription Plan'], ['admin', 'Company Admin'], ['email', 'Email Address'], ['users', 'Users'], ['reason', 'Suspension Reason'], ['suspendedDate', 'Suspended Date'], ['suspendedBy', 'Suspended By'], ['review', 'Review Status']];
const DATE_MODES = { all: 'All Dates', month: 'This Month', 30: 'Last 30 Days', 90: 'Last 90 Days', custom: 'Custom Range' };
const addDays = (iso, n) => new Date(Date.parse(iso) + n * 86400000).toISOString().slice(0, 10);

function dateBounds(f) {
  if (f.mode === 'month') return [`${DEMO_TODAY.slice(0, 7)}-01`, DEMO_TODAY.slice(0, 7) + '-31'];
  if (f.mode === '30' || f.mode === '90') return [addDays(DEMO_TODAY, -Number(f.mode)), DEMO_TODAY];
  if (f.mode === 'custom') return [f.from || '0000-01-01', f.to || '9999-12-31'];
  return ['0000-01-01', '9999-12-31'];
}

/* ---------- Row action menu (fixed position so the scrolling table never clips it) ---------- */
function RowMenu({ tenant, onAction }) {
  const [pos, setPos] = useState(null);
  const btn = useRef(null);
  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    const down = (e) => { if (!e.target.closest('.st-menu') && !btn.current?.contains(e.target)) close(); };
    const key = (e) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', down); document.addEventListener('keydown', key);
    window.addEventListener('scroll', close, true); window.addEventListener('resize', close);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };
  }, [pos]);
  const toggle = () => {
    if (pos) return setPos(null);
    const r = btn.current.getBoundingClientRect(); const h = 190;
    setPos({ top: r.bottom + 4 + h > window.innerHeight ? Math.max(8, r.top - h - 4) : r.bottom + 4, left: Math.max(8, r.right - 200) });
  };
  const run = (a) => { setPos(null); onAction(a, tenant); };
  const eligible = tenant.review === REVIEW.ELIGIBLE;
  return (
    <>
      <button ref={btn} className="st-dots" aria-label={`Actions for ${tenant.name}`} aria-haspopup="menu" aria-expanded={!!pos} onClick={toggle}><MoreHorizontal size={16} /></button>
      {pos && createPortal(
        <div className="st-menu" role="menu" style={{ top: pos.top, left: pos.left }}>
          <button role="menuitem" onClick={() => run('view')}><Eye size={15} />View Details</button>
          <button role="menuitem" onClick={() => run('review')}><SearchCheck size={15} />Review Suspension</button>
          <button role="menuitem" className="ok-i" disabled={!eligible} title={eligible ? '' : 'Approve the review first'} onClick={() => run('reactivate')}><RotateCcw size={15} />Reactivate Tenant</button>
          <button role="menuitem" onClick={() => run('contact')}><Mail size={15} />Contact Admin</button>
        </div>, document.body)}
    </>
  );
}

const csvCell = (v) => `"${String(v).replace(/"/g, '""')}"`;

export default function SuspendedTenants({ store, toast }) {
  const { fmtDate, fmtDateTime } = useI18n();
  const { tenants, activity, reactivated, policies, setPolicies, reviewTenant, reactivate } = store;
  const [q, setQ] = useState(''); const [reason, setReason] = useState('All'); const [plan, setPlan] = useState('All'); const [status, setStatus] = useState('All');
  const [dateF, setDateF] = useState({ mode: 'all', from: '', to: '' });
  const [sort, setSort] = useState({ k: 'suspendedDate', dir: -1 });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());
  const [drawerId, setDrawerId] = useState(null);
  const [kpiPanel, setKpiPanel] = useState(null);
  const [modal, setModal] = useState(null); // { type:'review'|'reactivate'|'policies', tenant|tenants }
  const tableRef = useRef(null);

  const [from, to] = dateBounds(dateF);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = tenants.filter((t) =>
      (reason === 'All' || t.reason === reason) && (plan === 'All' || t.plan === plan) && (status === 'All' || t.review === status)
      && t.suspendedDate >= from && t.suspendedDate <= to
      && (!s || [t.name, t.admin, t.email, t.reason, t.plan, t.code, t.suspendedBy].some((v) => String(v).toLowerCase().includes(s))));
    return [...list].sort((a, b) => {
      const x = a[sort.k], y = b[sort.k];
      return (typeof x === 'string' ? x.localeCompare(y) : x - y) * sort.dir || a.id - b.id;
    });
  }, [tenants, q, reason, plan, status, from, to, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const cur = Math.min(page, totalPages);
  const start = (cur - 1) * PAGE_SIZE;
  const shown = filtered.slice(start, start + PAGE_SIZE);
  const filtersOn = q || reason !== 'All' || plan !== 'All' || status !== 'All' || dateF.mode !== 'all';
  const drawer = tenants.find((t) => t.id === drawerId) || null;
  const selTenants = tenants.filter((t) => selected.has(t.id));
  const selEligible = selTenants.filter((t) => t.review === REVIEW.ELIGIBLE);
  const allShownSelected = shown.length > 0 && shown.every((t) => selected.has(t.id));

  useEffect(() => {
    if (!kpiPanel) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setKpiPanel(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [kpiPanel]);

  // keep the page valid when rows disappear (e.g. after a reactivation)
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  // drop selections for tenants that no longer exist
  useEffect(() => { setSelected((s) => { const ids = new Set(tenants.map((t) => t.id)); const n = new Set([...s].filter((i) => ids.has(i))); return n.size === s.size ? s : n; }); }, [tenants]);

  const monthPrefix = DEMO_TODAY.slice(0, 7);
  const kpis = [
    { key: 'total', t: 'Total Suspended', v: tenants.length, c: 'red', I: Ban },
    { key: 'month', t: 'Suspended This Month', v: tenants.filter((x) => x.suspendedDate.startsWith(monthPrefix)).length, c: 'orange', I: AlertTriangle },
    { key: 'pending', t: 'Pending Review', v: tenants.filter((x) => x.review === REVIEW.PENDING).length, c: 'blue', I: FileText },
    { key: 'eligible', t: 'Eligible for Reactivation', v: tenants.filter((x) => x.review === REVIEW.ELIGIBLE).length, c: 'purple', I: ShieldCheck },
    { key: 'critical', t: 'Critical Suspensions', v: tenants.filter((x) => x.review === REVIEW.CRITICAL).length, c: 'green', I: ShieldAlert },
  ];
  const kpiPanelTitle = kpis.find((k) => k.key === kpiPanel)?.t || '';
  const kpiRows = useMemo(() => {
    if (!kpiPanel) return [];
    if (kpiPanel === 'month') return tenants.filter((t) => t.suspendedDate.startsWith(monthPrefix));
    if (kpiPanel === 'pending') return tenants.filter((t) => t.review === REVIEW.PENDING);
    if (kpiPanel === 'eligible') return tenants.filter((t) => t.review === REVIEW.ELIGIBLE);
    if (kpiPanel === 'critical') return tenants.filter((t) => t.review === REVIEW.CRITICAL);
    return tenants;
  }, [tenants, kpiPanel, monthPrefix]);
  const byReason = REASONS.map((n) => ({ name: n, value: tenants.filter((t) => t.reason === n).length, color: REASON_COLORS[n] }));
  const byPlan = PLAN_LIST.map((n) => ({ name: n, value: tenants.filter((t) => t.plan === n).length, color: PLAN_COLORS[n] }));
  const pending = tenants.filter((t) => t.review === REVIEW.PENDING).sort((a, b) => b.suspendedDate.localeCompare(a.suspendedDate));

  const reset = (fn) => (v) => { fn(v); setPage(1); };
  function clear() { setQ(''); setReason('All'); setPlan('All'); setStatus('All'); setDateF({ mode: 'all', from: '', to: '' }); setPage(1); }
  const sortBy = (k) => { setSort((s) => ({ k, dir: s.k === k ? -s.dir : 1 })); setPage(1); };
  const toggleOne = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected((s) => { const n = new Set(s); shown.forEach((t) => (allShownSelected ? n.delete(t.id) : n.add(t.id))); return n; });
  const pickReason = (name) => { setReason((r) => (r === name ? 'All' : name)); setPage(1); };
  const pickPlan = (name) => { setPlan((p) => (p === name ? 'All' : name)); setPage(1); }
  const viewAllPending = () => {
  setKpiPanel('pending');
};
  const exportCsv = (rows, label) => {
    if (!rows.length) return toast('Nothing to export — no tenants match the current filters.');
    const head = ['Tenant ID', 'Company Name', 'Subscription Plan', 'Company Admin', 'Email', 'Users', 'Suspension Reason', 'Suspended Date', 'Suspended By', 'Review Status'];
    const lines = rows.map((t) => [t.code, t.name, t.plan, t.admin, t.email, t.users, t.reason, t.suspendedDate, t.suspendedBy, t.review].map(csvCell).join(','));
    const url = URL.createObjectURL(new Blob([[head.map(csvCell).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'megsi-suspended-tenants.csv'; a.click(); URL.revokeObjectURL(url);
    toast(`Exported ${rows.length} ${label} to megsi-suspended-tenants.csv (demo data).`);
  };

  const onAction = (a, t) => {
    if (a === 'view') setDrawerId(t.id);
    else if (a === 'review') setModal({ type: 'review', tenant: t });
    else if (a === 'reactivate') t.review === REVIEW.ELIGIBLE ? setModal({ type: 'reactivate', tenants: [t] }) : toast(`${t.name} must be approved in a review before it can be reactivated.`);
    else if (a === 'contact') window.location.href = `mailto:${t.email}?subject=${encodeURIComponent(`MEGSI account suspension – ${t.name}`)}`;
  };
  const saveReview = (t, status, note) => { reviewTenant(t, status, note); setModal(null); toast(`${t.name}: review saved as "${status}" (demo — not sent to a server).`); };
  const confirmReactivate = (list, note) => {
    reactivate(list, note); setModal(null); setDrawerId(null);
    toast(list.length === 1 ? `${list[0].name} reactivated (demo — no backend request was made).` : `${list.length} tenants reactivated (demo — no backend request was made).`);
  };

  const dateLabel = dateF.mode === 'custom' ? `${dateF.from ? fmtDate(dateF.from) : '…'} – ${dateF.to ? fmtDate(dateF.to) : '…'}` : DATE_MODES[dateF.mode];
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const evIcon = { suspended: 'red', flagged: 'orange', reviewed: 'blue', reactivated: 'green' }; // badge tone; rows use ev-<tone> (global .red/.blue classes paint backgrounds)
  const evLabel = { suspended: 'Suspended', flagged: 'Critical', reviewed: 'Reviewed', reactivated: 'Active' };

  return (
    <div className="dash st">
      <div className="title-row">
        <div><h1>Suspended Tenants</h1><p>Review suspended companies, investigate suspension reasons, and manage tenant account reinstatement.</p></div>
        <div className="st-actions">
          <Menu cls="date-pop" button={<span className={`st-btn ${dateF.mode !== 'all' ? 'active' : ''}`}><Calendar size={16} />{dateF.mode === 'all' ? 'Date Filter' : dateLabel}</span>}>
            {(close) => (<>
              {Object.entries(DATE_MODES).filter(([k]) => k !== 'custom').map(([k, l]) => (
                <div key={k} className={`item ${dateF.mode === k ? 'sel' : ''}`} onClick={() => { setDateF({ mode: k, from: '', to: '' }); setPage(1); close(); }}>{l}</div>))}
              <CustomRange value={dateF} onApply={(r) => { setDateF({ mode: 'custom', ...r }); setPage(1); close(); }} />
            </>)}
          </Menu>
          <button className="st-btn" onClick={() => exportCsv(filtered, 'tenants')}><Download size={16} />Export Report</button>
          <button className="st-btn" onClick={() => setModal({ type: 'policies' })}><Settings size={16} />Manage Policies</button>
        </div>
      </div>

      <div className="st-kpis">{kpis.map((k) => (
        <button
          key={k.t}
          type="button"
          className={`card st-kpi ${kpiPanel === k.key ? 'is-open' : ''}`}
          onClick={() => setKpiPanel((current) => current === k.key ? null : k.key)}
          aria-label={`Show details for ${k.t}: ${k.v}`}
          aria-expanded={kpiPanel === k.key}
        >
          <span className={`st-kpi-ic ${k.c}`}><k.I size={24} /></span>
          <span className="st-kpi-t"><small>{k.t}</small><b>{k.v}</b></span>
        </button>))}
      </div>

      {kpiPanel && (
        <div className="st-kpi-panel-backdrop" onMouseDown={(e) => {
          if (e.target === e.currentTarget) setKpiPanel(null);
        }}>
          <aside className="st-kpi-panel" role="dialog" aria-modal="true" aria-label={`${kpiPanelTitle} details`}>
            <div className="st-kpi-panel-head">
              <div>
                <span className="st-kpi-panel-eyebrow">SUSPENDED TENANTS</span>
                <h2>{kpiPanelTitle}</h2>
                <p>{kpiRows.length} {kpiRows.length === 1 ? 'tenant' : 'tenants'} found</p>
              </div>
              <button type="button" className="st-kpi-panel-close" onClick={() => setKpiPanel(null)} aria-label="Close details panel"><X size={19} /></button>
            </div>

            <div className="st-kpi-panel-list">
              {kpiRows.length === 0 ? (
                <div className="st-kpi-panel-empty">
                  <Users size={28} />
                  <b>No tenants to show</b>
                  <span>There are no tenants in this category.</span>
                </div>
              ) : kpiRows.map((t) => (
                <button
                  type="button"
                  className="st-kpi-tenant"
                  key={t.id}
                  onClick={() => { setKpiPanel(null); setDrawerId(t.id); }}
                >
                  <Avatar name={t.name} />
                  <span className="st-kpi-tenant-main">
                    <b>{t.name}</b>
                    <small>{t.email}</small>
                    <span>{t.reason} · {fmtDate(t.suspendedDate)}</span>
                  </span>
                  <span className="st-kpi-tenant-status">{t.review}</span>
                  <ChevronRight size={16} className="st-kpi-tenant-chevron" />
                </button>
              ))}
            </div>
            <div className="st-kpi-panel-foot">
              <span>Showing details only — the table filters are unchanged.</span>
              <button type="button" className="st-btn sm" onClick={() => setKpiPanel(null)}>Close</button>
            </div>
          </aside>
        </div>
      )}

      <div className="st-charts">
        <TrendChart reactivatedNow={reactivated} />
        <BreakdownDonut title="Suspension Reasons" items={byReason} selected={reason === 'All' ? null : reason} onSelect={pickReason} />
        <BreakdownDonut title="Suspensions by Plan" items={byPlan} selected={plan === 'All' ? null : plan} onSelect={pickPlan} />
      </div>

      <section className="card st-card" ref={tableRef}>
        <div className="st-toolbar">
          <span className="st-ttl"><span className="ic-sq"><Users size={16} /></span><h3>Suspended Tenant Accounts</h3></span>
          <div className="grow" />
          <div className="tsearch st-search"><Search size={15} /><input placeholder="Company" value={q} onChange={(e) => reset(setQ)(e.target.value)} aria-label="Search suspended tenants" /></div>
          {[['Reason', reason, REASONS, setReason], ['Plan', plan, PLAN_LIST, setPlan]].map(([label, val, opts, set]) => (
            <span className={`st-select ${label === "Status" ? "w-lg" : ""}`} key={label}><select value={val} onChange={(e) => reset(set)(e.target.value)} aria-label={`Filter by ${label.toLowerCase()}`}><option value="All">{label}</option>{opts.map((o) => <option key={o}>{o}</option>)}</select><ChevronDown size={13} /></span>))}
          <span className="st-select"><select value={dateF.mode} onChange={(e) => { setDateF({ mode: e.target.value, from: '', to: '' }); setPage(1); }} aria-label="Filter by date">
            <option value="all">Date</option>{Object.entries(DATE_MODES).filter(([k]) => k !== 'all' && k !== 'custom').map(([k, l]) => <option key={k} value={k}>{l}</option>)}{dateF.mode === 'custom' && <option value="custom">Custom Range</option>}</select><ChevronDown size={13} /></span>
          {[['Status', status, REVIEW_LIST, setStatus]].map(([label, val, opts, set]) => (
            <span className={`st-select ${label === "Status" ? "w-lg" : ""}`} key={label}><select value={val} onChange={(e) => reset(set)(e.target.value)} aria-label={`Filter by ${label.toLowerCase()}`}><option value="All">{label}</option>{opts.map((o) => <option key={o}>{o}</option>)}</select><ChevronDown size={13} /></span>))}
          <button className="st-btn sm" onClick={clear} disabled={!filtersOn}>Reset Filters</button>
        </div>

        {selected.size > 0 && (
          <div className="st-bulk" role="status">
            <b>{selected.size} selected</b>
            <button className="st-btn sm" disabled={!selEligible.length} title={selEligible.length ? '' : 'None of the selected tenants are eligible'} onClick={() => setModal({ type: 'reactivate', tenants: selEligible })}><RotateCcw size={14} />Reactivate eligible ({selEligible.length})</button>
            <button className="st-btn sm" onClick={() => exportCsv(selTenants, 'selected tenants')}><Download size={14} />Export selected</button>
            <button className="st-btn sm" onClick={() => setSelected(new Set())}><X size={14} />Clear selection</button>
          </div>)}

        <div className="tscroll st-scroll">
          <table className="tbl st-tbl">
            <thead><tr>
              <th className="chk"><input type="checkbox" checked={allShownSelected} onChange={toggleAll} aria-label="Select all rows on this page" disabled={!shown.length} /></th>
              <th>#</th>
              {COLS.map(([k, l]) => <th key={k} className="sortable" onClick={() => sortBy(k)} aria-sort={sort.k === k ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>{l}{sort.k === k && (sort.dir === 1 ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}</th>)}
              <th className="r">Actions</th>
            </tr></thead>
            <tbody>
              {shown.map((t, i) => (
                <tr key={t.id} className={selected.has(t.id) ? 'sel' : ''}>
                  <td className="chk"><input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleOne(t.id)} aria-label={`Select ${t.name}`} /></td>
                  <td>{start + i + 1}</td>
                  <td><div className="name"><Avatar name={t.name} /><button className="st-link" onClick={() => setDrawerId(t.id)}>{t.name}</button></div></td>
                  <td><PlanBadge v={t.plan} /></td>
                  <td>{t.admin}</td>
                  <td className="mail">{t.email}</td>
                  <td>{t.users}</td>
                  <td>{t.reason}</td>
                  <td>{fmtDate(t.suspendedDate)}</td>
                  <td>{t.suspendedBy}</td>
                  <td><ReviewBadge v={t.review} /></td>
                  <td className="r"><RowMenu tenant={t} onAction={onAction} /></td>
                </tr>))}
              {shown.length === 0 && <tr><td colSpan={COLS.length + 3} className="empty">{tenants.length === 0 ? 'No suspended tenants — every tenant is active.' : <>No suspended tenants match your filters. <button className="st-link" onClick={clear}>Reset filters</button></>}</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="st-foot">
          <span className="st-count">{filtered.length === 0 ? 'No tenants found' : `Showing ${start + 1}–${start + shown.length} of ${filtered.length} tenants`}</span>
          <div className="st-pager">
            <button className="pg" disabled={cur === 1} onClick={() => setPage(cur - 1)} aria-label="Previous page">«</button>
            {pages.map((p) => <button key={p} className={`pg ${p === cur ? 'on' : ''}`} onClick={() => setPage(p)} aria-current={p === cur ? 'page' : undefined}>{p}</button>)}
            <button className="pg" disabled={cur === totalPages} onClick={() => setPage(cur + 1)} aria-label="Next page">»</button>
          </div>
          <span className="st-count-sp" aria-hidden="true" />
        </div>
      </section>

      <div className="st-bottom">
        <section className="card st-panel">
          <header className="card-h"><span className="ic-sq"><Clock size={16} /></span><h3>Recent Suspension Activity</h3></header>
          <ul className="st-timeline">
            {activity.map((a) => (
              <li key={a.id} className={`ev-${evIcon[a.kind]}`}>
                <i className="st-dot" />
                <div className="st-ev"><b>{a.company}</b><small>{a.text}</small></div>
                <span className="st-time">{fmtDateTime(a.at.replace(' ', 'T')).replace(/ (\d\d:\d\d)$/, ' · $1')}</span>
                <span className={`st-badge ${evIcon[a.kind]}`}>{evLabel[a.kind]}</span>
              </li>))}
          </ul>
        </section>
        <section className="card st-panel">
          <header className="card-h"><span className="ic-sq"><FileText size={16} /></span><h3>Pending Reviews</h3><div className="grow" /><button className="st-viewall" onClick={viewAllPending}>View All</button></header>
          <ul className="st-pending">
            {pending.length === 0 && <li className="empty">No reviews pending.</li>}
            {pending.map((t) => (
              <li key={t.id}><Avatar name={t.name} /><span className="st-pt"><b>{t.name}</b><small>{t.reason} · {fmtDate(t.suspendedDate)}</small></span>
                <button className="st-btn sm" onClick={() => setModal({ type: 'review', tenant: t })}>Review</button></li>))}
          </ul>
        </section>
      </div>

      <TenantDrawer tenant={drawer} onClose={() => setDrawerId(null)} onReview={(t) => setModal({ type: 'review', tenant: t })} onReactivate={(list) => setModal({ type: 'reactivate', tenants: list })} />
      {modal?.type === 'review' && <ReviewModal tenant={modal.tenant} onClose={() => setModal(null)} onSave={saveReview} />}
      {modal?.type === 'reactivate' && <ReactivateModal tenants={modal.tenants} onClose={() => setModal(null)} onConfirm={confirmReactivate} />}
      {modal?.type === 'policies' && <PoliciesModal policies={policies} onClose={() => setModal(null)} onSave={(p) => { setPolicies(p); setModal(null); toast('Suspension policies updated (demo — not enforced by a server).'); }} />}
    </div>
  );
}

function CustomRange({ value, onApply }) {
  const [s, setS] = useState(value.from); const [e, setE] = useState(value.to); const [err, setErr] = useState('');
  return (
    <div className="custom"><b>Custom range</b>
      <label>From<input type="date" value={s} onChange={(ev) => setS(ev.target.value)} /></label>
      <label>To<input type="date" value={e} onChange={(ev) => setE(ev.target.value)} /></label>
      {err && <span className="err">{err}</span>}
      <button className="btn-primary sm" onClick={() => { if (!s && !e) return setErr('Choose a start or end date.'); if (s && e && s > e) return setErr('Start date must be before the end date.'); onApply({ from: s, to: e }); }}>Apply</button>
    </div>
  );
}
