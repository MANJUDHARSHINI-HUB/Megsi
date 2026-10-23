import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowUp, Ban, Building2, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock, Download, FileText, MapPin, MoreHorizontal, Pencil, PieChart, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { Avatar, DetailPanel, PlanBadge, StatusBadge } from '../components/Common.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { COMPANY_ROWS, INDUSTRIES, PLANS, PLAN_INFO, STATUSES } from '../data/companiesData.js';
import './companies.css';

const PAGE_SIZE = 10;
const money = (n) => `£${n.toLocaleString('en-GB')}`;
const COLS = [['name', 'Company Name'], ['industry', 'Industry'], ['plan', 'Plan'], ['users', 'Users'], ['sites', 'Sites'], ['status', 'Status'], ['joined', 'Joined Date'], ['revenue', 'Monthly Revenue']];
const EMPTY_FORM = { name: '', contact: '', email: '', phone: '', industry: INDUSTRIES[0], plan: 'Starter', status: 'Active', users: '0', sites: '0' };

/* ---------- Row action menu (position: fixed so the table scroll area never clips it) ---------- */
function RowMenu({ company, onAction }) {
  const [pos, setPos] = useState(null);
  const btn = useRef(null);
  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    const down = (e) => { if (!e.target.closest('.cp-menu') && !btn.current?.contains(e.target)) close(); };
    const key = (e) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', down); document.addEventListener('keydown', key);
    window.addEventListener('scroll', close, true); window.addEventListener('resize', close);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };
  }, [pos]);
  const toggle = () => {
    if (pos) return setPos(null);
    const r = btn.current.getBoundingClientRect(); const h = 235;
    setPos({ top: r.bottom + 4 + h > window.innerHeight ? Math.max(8, r.top - h - 4) : r.bottom + 4, left: Math.max(8, r.right - 190) });
  };
  const run = (a) => { setPos(null); onAction(a, company); };
  const suspended = company.status === 'Suspended';
  return (
    <>
      <button ref={btn} className="dots" aria-label={`Actions for ${company.name}`} aria-haspopup="menu" aria-expanded={!!pos} onClick={toggle}><MoreHorizontal size={16} /></button>
      {pos && createPortal(
        <div className="cp-menu" role="menu" style={{ top: pos.top, left: pos.left }}>
          <button role="menuitem" onClick={() => run('view')}><FileText size={15} />View Details</button>
          <button role="menuitem" onClick={() => run('edit')}><Pencil size={15} />Edit Company</button>
          <button role="menuitem" onClick={() => run('users')}><Users size={15} />Manage Users</button>
          <button role="menuitem" onClick={() => run('sites')}><MapPin size={15} />Manage Sites</button>
          {suspended
            ? <button role="menuitem" className="ok-i" onClick={() => run('reactivate')}><CheckCircle2 size={15} />Reactivate Company</button>
            : <button role="menuitem" className="danger" onClick={() => run('suspend')}><Ban size={15} />Suspend Company</button>}
          <button role="menuitem" className="danger" onClick={() => run('delete')}><Trash2 size={15} />Delete Company</button>
        </div>, document.body)}
    </>
  );
}

/* ---------- Generic modal shell ---------- */
function Modal({ title, onClose, children }) {
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="cp-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cp-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="cp-modal-h"><h3>{title}</h3><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Add / Edit form ---------- */
function CompanyForm({ company, rows, onSave, onClose }) {
  const [f, setF] = useState(company ? { ...company, users: String(company.users), sites: String(company.sites) } : EMPTY_FORM);
  const [err, setErr] = useState({});
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const validate = () => {
    const e = {}; const lim = PLAN_INFO[f.plan];
    if (!f.name.trim()) e.name = 'Company name is required.';
    else if (rows.some((r) => r.id !== company?.id && r.name.toLowerCase() === f.name.trim().toLowerCase())) e.name = 'A company with this name already exists.';
    if (!f.contact.trim()) e.contact = 'Contact person is required.';
    if (!f.email.trim()) e.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Enter a valid email address.';
    if (f.phone.trim() && !/^[+()\d\s-]{7,20}$/.test(f.phone.trim())) e.phone = 'Enter a valid phone number.';
    [['users', 'Users'], ['sites', 'Sites']].forEach(([k, label]) => {
      if (!/^\d+$/.test(f[k].trim())) e[k] = `${label} must be a whole number (0 or more).`;
      else if (lim[k] && +f[k] > lim[k]) e[k] = `${f.plan} plan allows up to ${lim[k]} ${label.toLowerCase()}.`;
    });
    return e;
  };
  const submit = (ev) => {
    ev.preventDefault();
    const e = validate(); setErr(e);
    if (Object.keys(e).length) return;
    onSave({ ...f, name: f.name.trim(), contact: f.contact.trim(), email: f.email.trim(), phone: f.phone.trim(), users: +f.users, sites: +f.sites });
  };
  const field = (k, label, props = {}) => (
    <label className={`cp-field ${err[k] ? 'bad' : ''}`}><span>{label}{props.req && <i> *</i>}</span>
      <input value={f[k]} onChange={set(k)} placeholder={props.ph} inputMode={props.mode} autoFocus={props.focus} />
      {err[k] && <em className="err">{err[k]}</em>}</label>
  );
  const sel = (k, label, opts) => (
    <label className="cp-field"><span>{label}</span><span className="cp-select"><select value={f[k]} onChange={set(k)}>{opts.map((o) => <option key={o}>{o}</option>)}</select><ChevronDown size={14} /></span></label>
  );
  return (
    <form onSubmit={submit} noValidate>
      <div className="cp-modal-b cp-grid">
        {field('name', 'Company name', { req: true, ph: 'e.g. Sentinel Watch UK', focus: true })}
        {field('contact', 'Contact person', { req: true, ph: 'e.g. Sarah Johnson' })}
        {field('email', 'Email address', { req: true, ph: 'name@company.co.uk' })}
        {field('phone', 'Phone number', { ph: '+44 20 7946 0000' })}
        {sel('industry', 'Industry', INDUSTRIES)}
        {sel('plan', 'Subscription plan', PLANS)}
        {field('users', 'Number of users', { mode: 'numeric' })}
        {field('sites', 'Number of sites', { mode: 'numeric' })}
        {sel('status', 'Company status', STATUSES)}
      </div>
      <p className="cp-note">Demonstration only — changes are kept in this browser session and are not saved to a server.</p>
      <div className="cp-modal-f"><button type="button" className="btn-sm big" onClick={onClose}>Cancel</button><button type="submit" className="btn-primary">{company ? 'Save Changes' : 'Add Company'}</button></div>
    </form>
  );
}

/* ---------- Main page ---------- */
export default function Companies({ toast }) {
  const { fmtDate } = useI18n();
  const [rows, setRows] = useState(COMPANY_ROWS);
  const [q, setQ] = useState(''); const [plan, setPlan] = useState('All'); const [status, setStatus] = useState('All'); const [industry, setIndustry] = useState('All');
  const [sort, setSort] = useState({ k: 'joined', dir: -1 });
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);   // { type:'form'|'confirm', company, action }
  const [detail, setDetail] = useState(null);

  const filtered = useMemo(() => {
  const s = q.trim().toLowerCase();

  const list = rows.filter((r) =>
    (plan === 'All' || r.plan === plan) &&
    (status === 'All' || r.status === status) &&
    (industry === 'All' || r.industry === industry) &&
    (
      !s ||
      [r.name, r.contact, r.plan, r.industry, r.code, r.email]
        .some((v) => String(v ?? '').toLowerCase().includes(s))
    )
  );

  return [...list].sort((a, b) => {
    const x = a[sort.k];
    const y = b[sort.k];

    if (x == null || y == null) {
      return 0;
    }

    const result =
      typeof x === 'string'
        ? x.localeCompare(String(y))
        : Number(x) - Number(y);

    return result * sort.dir;
  });
}, [rows, q, plan, status, industry, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const cur = Math.min(page, totalPages);
  const start = (cur - 1) * PAGE_SIZE;
  const shown = filtered.slice(start, start + PAGE_SIZE);
  const first = Math.min(Math.max(1, cur - 2), Math.max(1, totalPages - 5));
  const pages = Array.from({ length: Math.min(6, totalPages) }, (_, i) => first + i);
  const filtersOn = q || plan !== 'All' || status !== 'All' || industry !== 'All';

  const count = (fn) => rows.filter(fn).length;
  const kpis = [
    { t: 'Total Companies', v: rows.length, c: 'blue', I: Building2, ch: 12, d: 'Active tenants' },
    { t: 'Active Companies', v: count((r) => r.status === 'Active'), c: 'green', I: Users, ch: 9, d: 'Currently active' },
    { t: 'Trial Companies', v: count((r) => r.status === 'Trial'), c: 'orange', I: Clock, ch: 25, d: 'In trial period' },
    { t: 'Suspended Companies', v: count((r) => r.status === 'Suspended'), c: 'red', I: Ban, ch: -40, d: 'Currently suspended' },
    { t: 'Enterprise Plans', v: count((r) => r.plan === 'Enterprise'), c: 'purple', I: PieChart, ch: 20, d: 'Using enterprise plan' },
  ];

  const withReset = (fn) => (v) => { fn(v); setPage(1); };
  const clear = () => { setQ(''); setPlan('All'); setStatus('All'); setIndustry('All'); setPage(1); };
  const sortBy = (k) => { setSort((s) => ({ k, dir: s.k === k ? -s.dir : 1 })); setPage(1); };

  const exportCsv = () => {
    const head = ['Company ID', 'Company Name', 'Industry', 'Plan', 'Users', 'Sites', 'Status', 'Joined Date', 'Monthly Revenue (GBP)', 'Contact', 'Email'];
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = filtered.map((r) => [r.code, r.name, r.industry, r.plan, r.users, r.sites, r.status, r.joined, r.revenue, r.contact, r.email].map(esc).join(','));
    const url = URL.createObjectURL(new Blob([[head.map(esc).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'megsi-companies.csv'; a.click(); URL.revokeObjectURL(url);
    toast(`Exported ${filtered.length} companies to megsi-companies.csv (demo data).`);
  };

  const limitRows = (c, key, label) => {
    const lim = PLAN_INFO[c.plan][key];
    return [[`Registered ${label}`, c[key]], [`${c.plan} plan limit`, lim ?? 'Unlimited'], ['Usage of limit', lim ? `${Math.round((c[key] / lim) * 100)}%` : 'No limit'], ['Status', <StatusBadge v={c.status} />]];
  };
  const onAction = (a, c) => {
    if (a === 'view') setDetail({ title: c.name, rows: [['Company ID', c.code], ['Industry', c.industry], ['Subscription plan', <PlanBadge v={c.plan} />], ['Status', <StatusBadge v={c.status} />], ['Users', c.users], ['Sites', c.sites], ['Monthly revenue', money(c.revenue)], ['Joined', fmtDate(c.joined)], ['Contact person', c.contact], ['Email', c.email], ['Phone', c.phone]] });
    else if (a === 'users') setDetail({ title: `${c.name} · Users`, rows: limitRows(c, 'users', 'users') });
    else if (a === 'sites') setDetail({ title: `${c.name} · Sites`, rows: limitRows(c, 'sites', 'sites') });
    else if (a === 'edit') setModal({ type: 'form', company: c });
    else setModal({ type: 'confirm', action: a, company: c });
  };

  const save = (data) => {
    if (modal.company) {
      setRows((rs) => rs.map((r) => (r.id === modal.company.id ? { ...r, ...data, revenue: data.status === 'Trial' ? 0 : r.revenue || PLAN_INFO[data.plan].price } : r)));
      toast(`${data.name} updated (demo — not saved to a server).`);
    } else {
      const id = Math.max(...rows.map((r) => r.id)) + 1;
      setRows((rs) => [{ ...data, id, code: `CMP-${1000 + id}`, joined: new Date().toISOString().slice(0, 10), revenue: data.status === 'Trial' ? 0 : PLAN_INFO[data.plan].price }, ...rs]);
      setSort({ k: 'joined', dir: -1 }); setPage(1);
      toast(`${data.name} added to the demo list (not saved to a server).`);
    }
    setModal(null);
  };
  const confirm = () => {
    const { action, company: c } = modal;
    if (action === 'delete') { setRows((rs) => rs.filter((r) => r.id !== c.id)); toast(`${c.name} removed from the demo list.`); }
    else { const next = action === 'suspend' ? 'Suspended' : 'Active'; setRows((rs) => rs.map((r) => (r.id === c.id ? { ...r, status: next } : r))); toast(`${c.name} is now ${next} (demo).`); }
    setModal(null);
  };
  const openKpiDetails = (type) => {
    const today = new Date();
    const periodStart = new Date(today);
    periodStart.setDate(today.getDate() - 30);
    const newInPeriod = rows.filter((r) => {
      const joinedDate = new Date(`${r.joined}T00:00:00`);
      return !Number.isNaN(joinedDate.getTime()) && joinedDate >= periodStart && joinedDate <= today;
    }).length;

    const active = count((r) => r.status === 'Active');
    const trial = count((r) => r.status === 'Trial');
    const suspendedCount = count((r) => r.status === 'Suspended');
    const enterprise = count((r) => r.plan === 'Enterprise');
    const details = {
      'Total Companies': { title: 'Total Companies', rows: [['Total Companies', rows.length], ['Change', '+12%'], ['Active', active], ['Trial', trial], ['Suspended', suspendedCount], ['Enterprise', enterprise], ['New in period', newInPeriod]] },
      'Active Companies': { title: 'Active Companies', rows: [['Active Companies', active], ['Change', '+9%'], ['Percentage of total', `${rows.length ? Math.round(active / rows.length * 100) : 0}%`], ['Trial', trial], ['Suspended', suspendedCount]] },
      'Trial Companies': { title: 'Trial Companies', rows: [['Trial Companies', trial], ['Change', '+25%'], ['Percentage of total', `${rows.length ? Math.round(trial / rows.length * 100) : 0}%`], ['Active', active], ['Suspended', suspendedCount]] },
      'Suspended Companies': { title: 'Suspended Companies', rows: [['Suspended Companies', suspendedCount], ['Change', '−40%'], ['Percentage of total', `${rows.length ? Math.round(suspendedCount / rows.length * 100) : 0}%`], ['Active', active], ['Trial', trial]] },
      'Enterprise Plans': { title: 'Enterprise Plans', rows: [['Enterprise Plans', enterprise], ['Change', '+20%'], ['Percentage of total', `${rows.length ? Math.round(enterprise / rows.length * 100) : 0}%`], ['Active enterprise companies', count((r) => r.plan === 'Enterprise' && r.status === 'Active')], ['New in period', newInPeriod]] },
    };
    setDetail(details[type] || details['Total Companies']);
  };

  const CONFIRM = {
    suspend: ['Suspend company', 'Suspend', 'Guards and managers of this company will lose access until it is reactivated.'],
    reactivate: ['Reactivate company', 'Reactivate', 'This company will be marked Active again.'],
    delete: ['Delete company', 'Delete', 'This removes the company from the demo list. It cannot be undone until you refresh the page.'],
  };

  return (
    <div className="dash cp">
      <div className="title-row">
        <div><h1>Companies</h1><p>Manage all tenant companies on the MEGSI platform.</p></div>
        <button className="btn-primary cp-add" onClick={() => setModal({ type: 'form', company: null })}><Plus size={18} /> Add Company</button>
      </div>

      <div className="kpis cp-kpis">{kpis.map((k) => (
        <div
          key={k.t}
          className="card kpi cp-kpi-clickable"
          role="button"
          tabIndex={0}
          onClick={() => openKpiDetails(k.t)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openKpiDetails(k.t);
            }
          }}
          aria-label={`View ${k.t} details`}
        >
          <span className={`kpi-ic ${k.c}`}><k.I size={26} /></span>
          <span className="kpi-t"><small>{k.t}</small><span className="kpi-v"><b>{k.v}</b><em className={k.ch < 0 ? 'down' : 'up'}>{k.ch < 0 ? '↓' : '↑'} {Math.abs(k.ch)}%</em></span></span>
          <span className="kpi-d">{k.d}</span>
        </div>))}
      </div>

      <section className="card cp-card">
        <div className="cp-toolbar">
          <div className="tsearch cp-search"><Search size={16} /><input placeholder="Search by company name, contact, or plan..." value={q} onChange={(e) => withReset(setQ)(e.target.value)} aria-label="Search companies" /></div>
          {[['All Plans', plan, PLANS, setPlan], ['All Status', status, STATUSES, setStatus], ['All Industries', industry, INDUSTRIES, setIndustry]].map(([label, val, opts, set]) => (
            <span className="cp-select" key={label}><select value={val} onChange={(e) => withReset(set)(e.target.value)} aria-label={label}><option value="All">{label}</option>{opts.map((o) => <option key={o}>{o}</option>)}</select><ChevronDown size={14} /></span>))}
          <div className="grow" />
          <button className="btn-sm cp-btn" onClick={clear} disabled={!filtersOn}>Clear Filters</button>
          <button className="btn-primary cp-btn" onClick={exportCsv}><Download size={16} /> Export</button>
        </div>

        <div className="tscroll cp-scroll">
          <table className="tbl cp-tbl">
            <thead><tr>
              <th>#</th>
              {COLS.map(([k, l]) => (<th key={k} className="sortable" onClick={() => sortBy(k)} aria-sort={sort.k === k ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>{l}{sort.k === k && (sort.dir === 1 ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}</th>))}
              <th className="r">Actions</th>
            </tr></thead>
            <tbody>
              {shown.map((c, i) => (
                <tr key={c.id}>
                  <td>{start + i + 1}</td>
                  <td><div className="name"><Avatar name={c.name} /><button className="cp-link" onClick={() => onAction('view', c)}>{c.name}</button></div></td>
                  <td>{c.industry}</td>
                  <td><PlanBadge v={c.plan} /></td>
                  <td>{c.users}</td>
                  <td>{c.sites}</td>
                  <td><StatusBadge v={c.status} /></td>
                  <td>{fmtDate(c.joined)}</td>
                  <td>{money(c.revenue)}</td>
                  <td className="r"><RowMenu company={c} onAction={onAction} /></td>
                </tr>))}
              {shown.length === 0 && <tr><td colSpan={COLS.length + 2} className="empty">No companies match your filters. <button className="cp-link" onClick={clear}>Clear filters</button></td></tr>}
            </tbody>
          </table>
        </div>

        <div className="cp-foot">
          <span>{filtered.length === 0 ? 'No companies found' : `Showing ${start + 1} to ${start + shown.length} of ${filtered.length} companies`}</span>
          <div className="cp-pager">
            <button className="pg" disabled={cur === 1} onClick={() => setPage(cur - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
            {pages.map((p) => <button key={p} className={`pg ${p === cur ? 'on' : ''}`} onClick={() => setPage(p)} aria-current={p === cur ? 'page' : undefined}>{p}</button>)}
            <button className="pg" disabled={cur === totalPages} onClick={() => setPage(cur + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
          </div>
        </div>
      </section>

      {modal?.type === 'form' && (
        <Modal title={modal.company ? 'Edit Company' : 'Add Company'} onClose={() => setModal(null)}>
          <CompanyForm company={modal.company} rows={rows} onSave={save} onClose={() => setModal(null)} />
        </Modal>)}
      {modal?.type === 'confirm' && (
        <Modal title={CONFIRM[modal.action][0]} onClose={() => setModal(null)}>
          <div className="cp-modal-b"><p><b>{modal.company.name}</b></p><p className="cp-note">{CONFIRM[modal.action][2]}</p><p className="cp-note">Demonstration only — nothing is sent to a server.</p></div>
          <div className="cp-modal-f"><button className="btn-sm big" onClick={() => setModal(null)}>Cancel</button><button className={`btn-primary ${modal.action === 'reactivate' ? '' : 'cp-danger'}`} onClick={confirm}>{CONFIRM[modal.action][1]}</button></div>
        </Modal>)}
      <DetailPanel data={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
