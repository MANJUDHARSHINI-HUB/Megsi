import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowUp, AlertTriangle, Ban, Building2, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock, Download, FileText, MapPin, MoreHorizontal, Pencil, Plus, Search, Trash2, Users, X, CalendarDays, CreditCard, Mail, Phone, RefreshCw, ShieldCheck, Globe, Activity, CircleDollarSign, MessageCircle, Database, FileCheck, Bell, Send, ExternalLink, UserRound, Landmark } from 'lucide-react';
import { Avatar, PlanBadge, StatusBadge } from '../components/Common.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { COMPANY_ROWS, INDUSTRIES, PLANS, PLAN_INFO, STATUSES, TENURES, RENEWAL_FILTERS } from '../data/companiesData.js';
import './companies.css';

const PAGE_SIZE = 8;
const money = (n) => `£${n.toLocaleString('en-GB')}`;
const COLS = [['name', 'Company Name'], ['industry', 'Industry'], ['location', 'Location'], ['plan', 'Package'], ['billingTenure', 'Billing Tenure'], ['subscriptionStartDate', 'Subscription Starting Date'], ['joiningDate', 'Company Joining Date'], ['users', 'Users'], ['sites', 'Sites'], ['renewalDate', 'Renewal Date'], ['renewalState', 'Renewal Status'], ['revenue', 'Monthly Revenue']];
const todayIso = () => new Date().toISOString().slice(0, 10);
const EMPTY_FORM = { name: '', contact: '', email: '', phone: '', whatsapp: '', callingPhone: '', address: '', location: '', licenseNumber: '', vatNumber: '', industry: INDUSTRIES[0], plan: 'Starter', billingTenure: 'Monthly', status: 'Active', users: '0', sites: '0', subscriptionStartDate: todayIso(), joiningDate: todayIso() };

/* ---------- Row action menu (position: fixed so the table scroll area never clips it) ---------- */
function RenewalBadge({ company }) {
  const state = company.renewalState || 'Active';
  const Icon = state === 'Active' ? CheckCircle2 : state === 'Overdue' ? AlertTriangle : Clock;
  return <span className={`cp-renewal-badge ${state === 'Active' ? 'active' : state === 'Overdue' ? 'overdue' : 'due'}`}><Icon size={13} />{company.renewalStatusLabel || state}</span>;
}

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
  const [f, setF] = useState(company ? { ...EMPTY_FORM, ...company, users: String(company.users), sites: String(company.sites) } : EMPTY_FORM);
  const [err, setErr] = useState({});
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const validate = () => {
    const e = {}; const lim = PLAN_INFO[f.plan];
    if (!f.name.trim()) e.name = 'Company name is required.';
    else if (rows.some((r) => r.id !== company?.id && r.name.toLowerCase() === f.name.trim().toLowerCase())) e.name = 'A company with this name already exists.';
    if (!f.contact.trim()) e.contact = 'Contact person is required.';
    if (!f.email.trim()) e.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Enter a valid email address.';
    ['phone', 'callingPhone', 'whatsapp'].forEach((key) => {
      if (f[key]?.trim() && !/^[+()\d\s-]{7,20}$/.test(f[key].trim())) e[key] = 'Enter a valid phone number.';
    });
    if (!f.joiningDate) e.joiningDate = 'Company joining date is required.';
    if (!f.subscriptionStartDate) e.subscriptionStartDate = 'Subscription starting date is required.';
    else if (f.joiningDate && f.subscriptionStartDate < f.joiningDate) e.subscriptionStartDate = 'Subscription cannot start before the company joined.';
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
    onSave({ ...f, name: f.name.trim(), contact: f.contact.trim(), email: f.email.trim(), phone: f.phone.trim(), callingPhone: f.callingPhone.trim(), whatsapp: f.whatsapp.trim(), address: f.address.trim(), location: f.location.trim(), licenseNumber: f.licenseNumber.trim(), vatNumber: f.vatNumber.trim(), users: +f.users, sites: +f.sites });
  };
  const field = (k, label, props = {}) => (
    <label className={`cp-field ${err[k] ? 'bad' : ''}`}><span>{label}{props.req && <i> *</i>}</span>
      <input value={f[k]} onChange={set(k)} placeholder={props.ph} inputMode={props.mode} autoFocus={props.focus} />
      {err[k] && <em className="err">{err[k]}</em>}</label>
  );
  const dateField = (k, label) => (
    <label className={`cp-field ${err[k] ? 'bad' : ''}`}><span>{label}<i> *</i></span>
      <input type="date" value={f[k] || ''} onChange={set(k)} />
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
        {field('address', 'Address', { ph: 'Building, street, area' })}
        {field('location', 'Location / City', { ph: 'e.g. London, UK' })}
        {field('callingPhone', 'Phone number (Calling)', { ph: '+44 20 7946 0000' })}
        {field('whatsapp', 'Phone number (WhatsApp)', { ph: '+44 7700 900000' })}
        {field('licenseNumber', 'License number (SIANO)', { ph: 'Enter SIANO license number' })}
        {field('vatNumber', 'VAT number', { ph: 'Enter VAT registration number' })}
        {field('phone', 'Primary phone number', { ph: '+44 20 7946 0000' })}
        {sel('industry', 'Industry', INDUSTRIES)}
        {sel('plan', 'Subscription plan', PLANS)}
        {sel('billingTenure', 'Billing tenure', TENURES)}
        {dateField('subscriptionStartDate', 'Subscription starting date')}
        {dateField('joiningDate', 'Company joining date')}
        {field('users', 'Number of users', { mode: 'numeric' })}
        {field('sites', 'Number of sites', { mode: 'numeric' })}
        {sel('status', 'Company status', STATUSES)}
      </div>
      <p className="cp-note">Demonstration only — changes are kept in this browser session and are not saved to a server.</p>
      <div className="cp-modal-f"><button type="button" className="btn-sm big" onClick={onClose}>Cancel</button><button type="submit" className="btn-primary">{company ? 'Save Changes' : 'Add Company'}</button></div>
    </form>
  );
}

/* ---------- Full-page company details, styled to match the supplied MEGSI reference ---------- */
function CompanyDetails({ company: c, onBack, fmtDate, onEdit, onMessage, onCompanyAction, toast }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const planLimit = PLAN_INFO[c.plan] || PLAN_INFO.Starter;
  const userPct = planLimit.users ? Math.min(100, Math.round((c.users / planLimit.users) * 100)) : 0;
  const sitePct = planLimit.sites ? Math.min(100, Math.round((c.sites / planLimit.sites) * 100)) : 0;
  const remainingDays = Math.max(0, Math.ceil((new Date(`${c.renewalDate || '2026-12-31'}T00:00:00`) - new Date('2026-10-30T00:00:00')) / 86400000));
  const contactEmail = c.email || 'Not provided';
  const phone = c.callingPhone || c.phone || 'Not provided';
  const activity = [
    { date: c.renewalDate || c.joiningDate, title: 'Company profile opened', actor: 'System' },
    { date: c.subscriptionStartDate || c.joiningDate, title: 'Subscription details reviewed', actor: c.contact || 'Company admin' },
    { date: c.joiningDate, title: 'Company registered', actor: 'System' },
    { date: c.joiningDate, title: 'Company record created', actor: 'Platform Admin' },
  ];
  const info = (label, value, link = false) => <div className="cpd-info" key={label}><span>{label}</span><strong className={link ? 'cpd-link' : ''}>{value || 'Not provided'}</strong></div>;
  const cardTitle = (Icon, title, right = null) => <div className="cpd-card-title"><span className="cpd-title-icon"><Icon size={15}/></span><h3>{title}</h3><span className="cpd-card-right">{right}</span></div>;
  const usageRow = (label, current, max, pct, color = 'blue') => <div className="cpd-usage-row" key={label}><div className="cpd-usage-top"><span>{label}</span><strong>{current}{max ? ` / ${max}` : ''}</strong><em>{max ? `${pct}%` : 'No limit'}</em></div><div className="cpd-progress"><span className={color} style={{ width: `${max ? pct : 100}%` }}/></div></div>;
  const action = (label, Icon, fn, extra = '') => <button className={`cpd-quick-action ${extra}`} key={label} onClick={fn}><Icon size={15}/><span>{label}</span><ChevronRight size={14}/></button>;
  const showToast = (message) => toast?.(message);

  return <section className="cp-detail-page cpd-page">
    <div className="cpd-workspace">
      <main className="cpd-main">
        <button className="cpd-back" onClick={onBack}><ChevronLeft size={15}/> Back to Companies</button>
        <div className="cpd-company-head">
          <div className="cpd-company-mark"><ShieldCheck size={34}/></div>
          <div className="cpd-company-intro">
            <div className="cpd-name-line"><h1>{c.name}</h1><StatusBadge v={c.status}/><PlanBadge v={c.plan}/></div>
            <div className="cpd-subline"><span><MapPin size={13}/>{c.location || 'Location not provided'}</span><span><Globe size={13}/>{c.website || 'Website not provided'}</span></div>
            <div className="cpd-regline"><span>Registered No: {c.code || 'Not provided'}</span><i/> <span>SIAN: {c.licenseNumber || 'Not provided'}</span><i/> <span>VAT: {c.vatNumber || 'Not provided'}</span></div>
          </div>
          <div className="cpd-head-actions">
            <button className="cpd-primary" onClick={onEdit}><Pencil size={14}/> Edit Company</button>
            <button className="cpd-outline" onClick={onMessage}><Mail size={14}/> Send Message</button>
            <div className="cpd-more-wrap"><button className="cpd-outline cpd-more-btn" onClick={() => setMoreOpen(v => !v)}>More Actions <ChevronDown size={13}/></button>{moreOpen && <div className="cpd-more-menu"><button onClick={() => { setMoreOpen(false); onCompanyAction(c.status === 'Suspended' ? 'reactivate' : 'suspend', c); }}>{c.status === 'Suspended' ? <CheckCircle2 size={14}/> : <Ban size={14}/>} {c.status === 'Suspended' ? 'Reactivate Company' : 'Suspend Company'}</button><button onClick={() => { setMoreOpen(false); onCompanyAction('edit', c); }}><Pencil size={14}/> Edit Company</button><button onClick={() => { setMoreOpen(false); showToast(`Company ID ${c.code || c.id} copied is not available in this demo.`); }}><FileCheck size={14}/> Company Record</button></div>}</div>
          </div>
        </div>

        <div className="cpd-metrics">
          <div className="cpd-metric"><span className="cpd-metric-icon blue"><CalendarDays size={21}/></span><div><small>Subscription</small><strong className={c.status === 'Active' ? 'green-text' : ''}>{c.status}</strong><p>{c.renewalDate ? `Renews ${fmtDate(c.renewalDate)}` : 'Renewal date not set'}</p></div></div>
          <div className="cpd-metric"><span className="cpd-metric-icon green"><CircleDollarSign size={21}/></span><div><small>Monthly Revenue</small><strong>{money(c.revenue || 0)}</strong><p>Current plan amount</p></div></div>
          <div className="cpd-metric"><span className="cpd-metric-icon purple"><Users size={21}/></span><div><small>Total Users</small><strong>{c.users}</strong><p>{planLimit.users ? `${Math.max(0, planLimit.users - c.users)} available on plan` : 'Enterprise plan'}</p></div></div>
          <div className="cpd-metric"><span className="cpd-metric-icon cyan"><MapPin size={21}/></span><div><small>Operational Sites</small><strong>{c.sites}</strong><p>{planLimit.sites ? `${Math.max(0, planLimit.sites - c.sites)} available on plan` : 'Enterprise plan'}</p></div></div>
        </div>

        <>
          <div className="cpd-top-grid">
            <section className="cpd-card cpd-profile-card">{cardTitle(Building2, 'Company Profile')}<div className="cpd-profile-body"><div className="cpd-profile-logo"><ShieldCheck size={30}/></div><div className="cpd-profile-data">{info('Company Name', c.name)}{info('Industry', c.industry)}{info('Company Reg. No.', c.code)}{info('SIA Details', c.licenseNumber || 'Not provided')}{info('VAT Number', c.vatNumber || 'Not provided')}{info('Website', c.website || 'Not provided', true)}</div></div></section>
            <section className="cpd-card">{cardTitle(UserRound, 'Contact Information')}{info('Primary Contact', c.contact)}{info('Designation', c.designation || 'Company Administrator')}{info('Email', contactEmail, true)}{info('Phone', phone)}{info('WhatsApp', c.whatsapp || 'Not provided')}</section>
            <section className="cpd-card cpd-address-card">{cardTitle(MapPin, 'Registered Address')}<div className="cpd-address">{(c.address || c.location || 'Address not provided').split(',').map((line, i) => <span key={i}>{line.trim()}</span>)}{c.location && c.address && <span>{c.location}</span>}</div><div className="cpd-address-art" aria-hidden="true"><svg viewBox="0 0 360 150" role="presentation"><path d="M4 143H356" fill="none" stroke="#8fb8f3" strokeWidth="2"/><g fill="#c9defb" stroke="#b5d0f6" strokeWidth="1"><path d="M12 143V112h26v31z M20 112V99h10v13z M43 143V88h35v55z M51 88V73h18v15z M83 143V104h28v39z M116 143V65h43v78z M126 65V48h23v17z M164 143V91h32v52z M201 143V76h39v67z M210 76V60h21v16z M245 143V99h25v44z M276 143V51h39v92z M286 51V29h19v22z M320 143V88h24v55z"/></g><g fill="#eaf3ff"><path d="M19 120h5v7h-5z M29 120h5v7h-5z M50 98h6v8h-6z M63 98h6v8h-6z M50 114h6v8h-6z M63 114h6v8h-6z M124 78h7v9h-7z M140 78h7v9h-7z M124 95h7v9h-7z M140 95h7v9h-7z M124 112h7v9h-7z M140 112h7v9h-7z M176 101h7v9h-7z M189 101h7v9h-7z M210 88h7v9h-7z M225 88h7v9h-7z M210 105h7v9h-7z M225 105h7v9h-7z M286 64h7v9h-7z M300 64h7v9h-7z M286 82h7v9h-7z M300 82h7v9h-7z M286 100h7v9h-7z M300 100h7v9h-7z M327 100h6v8h-6z M327 116h6v8h-6z"/></g><g fill="#9fc2f2"><circle cx="137" cy="26" r="3"/><path d="M137 29v13m-6-7h12" stroke="#9fc2f2" strokeWidth="2" fill="none"/></g></svg></div></section>
            <section className="cpd-card cpd-actions-card">{cardTitle(Bell, 'Quick Actions')}{action('Send Email', Mail, onMessage)}{action('Send WhatsApp', MessageCircle, () => {
            const rawNumber = c.whatsapp || c.callingPhone || c.phone;
            const digits = String(rawNumber || '').replace(/\D/g, '');
            if (digits) window.open(`https://wa.me/${digits}`, '_blank', 'noopener,noreferrer');
            else showToast(`No WhatsApp number is available for ${c.name}.`);
          })}{action('View Subscription', CreditCard, () => document.getElementById('cpd-subscription-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))}{action('Renew Subscription', RefreshCw, () => showToast(`Renewal request for ${c.name} is ready for the billing workflow. No payment is processed in this demo.`))}{action('Change Plan', Landmark, onEdit)}{action(c.status === 'Suspended' ? 'Reactivate Company' : 'Suspend Company', Ban, () => onCompanyAction(c.status === 'Suspended' ? 'reactivate' : 'suspend', c), 'danger')}</section>
          </div>
          <div className="cpd-mid-grid">
            <section id="cpd-subscription-card" className="cpd-card">{cardTitle(CalendarDays, 'Subscription Details', <span className="cpd-days">{remainingDays} days remaining</span>)}<div className="cpd-two-col">{info('Plan', c.plan)}{info('Subscription Amount', `${money(c.revenue || 0)} / ${c.billingTenure === 'Annual' ? 'month (annual billing)' : 'month'}`)}{info('Start Date', fmtDate(c.subscriptionStartDate))}{info('End / Renewal Date', fmtDate(c.renewalDate))}{info('Billing Frequency', c.billingTenure || 'Monthly')}{info('Payment Status', c.status === 'Suspended' ? 'Review required' : 'Up to date')}{info('Company Joining Date', fmtDate(c.joiningDate))}{info('Auto Renewal', c.status === 'Active' ? 'Enabled' : 'Not active')}</div><button className="cpd-text-link" onClick={() => showToast('Subscription details are displayed in this overview.')}>View Full Details <ChevronRight size={13}/></button></section>
            <section id="cpd-usage-card" className="cpd-card">{cardTitle(Activity, 'Usage & Limits')}{usageRow('Users', c.users, planLimit.users, userPct, 'blue')}{usageRow('Sites', c.sites, planLimit.sites, sitePct, 'teal')}{usageRow('Storage', `${Math.max(1, Math.round(c.users * .07))} GB`, '20 GB', Math.min(100, Math.max(5, Math.round(c.users * .07 / 20 * 100))), 'purple')}<button className="cpd-text-link" onClick={() => document.getElementById('cpd-usage-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>View Usage Details <ChevronRight size={13}/></button></section>
            <section className="cpd-card">{cardTitle(CreditCard, 'Revenue & Payments')}{[['Total Revenue', money((c.revenue || 0) * 12)], ['Outstanding Balance', c.status === 'Suspended' ? money(c.revenue || 0) : '£0'], ['Last Payment', fmtDate(c.subscriptionStartDate)], ['Next Payment Due', fmtDate(c.renewalDate)]].map(([label, value]) => <div className="cpd-payment-row" key={label}><span>{label}</span><strong className={label === 'Outstanding Balance' && c.status === 'Suspended' ? 'red-text' : ''}>{value}</strong></div>)}<div className="cpd-payment-status"><span>Payment Status</span><b>{c.status === 'Suspended' ? 'Review required' : 'Up to date'}</b></div><button className="cpd-text-link" onClick={() => showToast('Subscription details are displayed in this overview.')}>View Payment History <ChevronRight size={13}/></button></section>
          </div>
          <div className="cpd-bottom-grid"><section className="cpd-card">{cardTitle(Clock, 'Recent Activity', <button className="cpd-small-link" onClick={() => showToast('Recent activity and communication history are displayed below.')}>View All <ChevronRight size={12}/></button>)}<div className="cpd-table"><div className="cpd-table-head"><span>Date &amp; Time</span><span>Activity</span><span>Performed By</span></div>{activity.slice(0, 3).map((a, i) => <div className="cpd-table-row" key={i}><span>{fmtDate(a.date)}</span><span>{a.title}</span><span>{a.actor}</span></div>)}</div></section><section className="cpd-card">{cardTitle(MessageCircle, 'Communication History', <button className="cpd-small-link" onClick={() => showToast('Recent activity and communication history are displayed below.')}>View All <ChevronRight size={12}/></button>)}<div className="cpd-table"><div className="cpd-table-head"><span>Date &amp; Time</span><span>Type</span><span>Status</span></div>{[['Email', 'Sent'], ['Subscription Reminder', 'Sent'], ['Account Notification', 'Delivered']].map(([type, status], i) => <div className="cpd-table-row" key={type}><span>{fmtDate([c.subscriptionStartDate, c.joiningDate, c.renewalDate][i])}</span><span>{type}</span><span><b className="cpd-status-pill">{status}</b></span></div>)}</div></section></div>
        </>

      </main>
      <aside className="cpd-side-panel"><div className="cpd-side-head"><h2>Company Details</h2><button onClick={onBack} aria-label="Close company details"><X size={16}/></button></div>
        <section className="cpd-side-section"><h3>Company Overview</h3><div className="cpd-side-company"><div className="cpd-side-logo"><ShieldCheck size={29}/></div><div><strong>{c.name}</strong><span>{c.industry}</span><StatusBadge v={c.status}/></div></div></section>
        <section className="cpd-side-section"><h3>Subscription Summary</h3>{[['Plan', c.plan], ['Start Date', fmtDate(c.subscriptionStartDate)], ['End Date', fmtDate(c.renewalDate)], ['Days Remaining', `${remainingDays} days`], ['Status', c.status]].map(([l, v]) => <div className="cpd-side-kv" key={l}><span>{l}</span><strong className={l === 'Days Remaining' || l === 'Status' ? 'cpd-side-chip' : ''}>{v}</strong></div>)}</section>
        <section className="cpd-side-section"><h3>Usage Summary</h3>{usageRow('Users', c.users, planLimit.users, userPct, 'blue')}{usageRow('Sites', c.sites, planLimit.sites, sitePct, 'teal')}</section>
        <section className="cpd-side-section"><h3>Recent Activity</h3><div className="cpd-timeline">{activity.slice(0, 4).map((a, i) => <div key={i}><span>{fmtDate(a.date)}</span><strong>{a.title}</strong></div>)}</div></section>
        <section className="cpd-side-section"><h3>Related Links</h3><button className="cpd-related" onClick={() => showToast('Invoices are not connected in this demo.')}><FileText size={14}/> View All Invoices <ChevronRight size={14}/></button><button className="cpd-related" onClick={() => showToast('Recent activity and communication history are displayed below.')}><FileCheck size={14}/> View Activity Log <ChevronRight size={14}/></button><button className="cpd-related" onClick={() => showToast('Company information is displayed in the Company Profile card.')}><MapPin size={14}/> View Site Details <ChevronRight size={14}/></button></section>
      </aside>
    </div>
  </section>;
}

/* ---------- Main page ---------- */
export default function Companies({ toast }) {
  const { fmtDate } = useI18n();
  const [rows, setRows] = useState(COMPANY_ROWS);
  const [q, setQ] = useState(''); const [plan, setPlan] = useState('All'); const [tenure, setTenure] = useState('All'); const [renewalStatus, setRenewalStatus] = useState('All');
  const [sort, setSort] = useState({ k: 'renewalDate', dir: 1 });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef(null);
  const [modal, setModal] = useState(null);   // { type:'form'|'confirm', company, action }
  const [detail, setDetail] = useState(null);

  const filtered = useMemo(() => {
  const s = q.trim().toLowerCase();

  const list = rows.filter((r) =>
    (plan === 'All' || r.plan === plan) &&
    (tenure === 'All' || r.billingTenure === tenure) &&
    (renewalStatus === 'All' || r.renewalState === renewalStatus) &&
    (
      !s ||
      [r.name, r.contact, r.plan, r.industry, r.location, r.code, r.email]
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
}, [rows, q, plan, tenure, renewalStatus, sort]);

  const shown = filtered.slice(0, visibleCount);
  const hasMore = shown.length < filtered.length;
  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasMore || detail) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisibleCount((n) => Math.min(n + PAGE_SIZE, filtered.length));
    }, { rootMargin: '0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, filtered.length, detail]);

  const filtersOn = q || plan !== 'All' || tenure !== 'All' || renewalStatus !== 'All';

  const count = (fn) => rows.filter(fn).length;
  const kpis = [
    { t: 'Total Companies', v: rows.length, c: 'blue', I: Building2, ch: 12, d: 'Active tenants' },
    { t: 'Active Companies', v: count((r) => r.status === 'Active'), c: 'green', I: Users, ch: 9, d: 'Currently active' },
    { t: 'Trial Companies', v: count((r) => r.status === 'Trial'), c: 'orange', I: Clock, ch: 25, d: 'In trial period' },
    { t: 'Suspended Companies', v: count((r) => r.status === 'Suspended'), c: 'red', I: Ban, ch: -40, d: 'Currently suspended' },
    { t: 'Renewals Due', v: rows.filter((r) => { const d = new Date(r.renewalDate || '2026-11-15'); const days = Math.ceil((d - new Date('2026-10-30T00:00:00')) / 86400000); return days >= 0 && days <= 30; }).length, c: 'teal', I: Clock, ch: 0, d: 'In the next 30 days' },
  ];

  const withReset = (fn) => (v) => { fn(v); setVisibleCount(PAGE_SIZE); };
  const clear = () => { setQ(''); setPlan('All'); setTenure('All'); setRenewalStatus('All'); setVisibleCount(PAGE_SIZE); };
  const sortBy = (k) => { setSort((s) => ({ k, dir: s.k === k ? -s.dir : 1 })); setVisibleCount(PAGE_SIZE); };

  const exportCsv = () => {
    const head = ['Company ID', 'Company Name', 'Industry', 'Plan', 'Users', 'Sites', 'Status', 'Billing Tenure', 'Subscription Starting Date', 'Company Joining Date', 'Renewal Date', 'Monthly Revenue (GBP)', 'Contact', 'Email', 'Address', 'Location', 'Calling Phone', 'WhatsApp', 'SIANO License', 'VAT Number'];
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = filtered.map((r) => [r.code, r.name, r.industry, r.plan, r.users, r.sites, r.status, r.billingTenure, r.subscriptionStartDate, r.joiningDate, r.renewalDate, r.revenue, r.contact, r.email, r.address, r.location, r.callingPhone, r.whatsapp, r.licenseNumber, r.vatNumber].map(esc).join(','));
    const url = URL.createObjectURL(new Blob([[head.map(esc).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'megsi-companies.csv'; a.click(); URL.revokeObjectURL(url);
    toast(`Exported ${filtered.length} companies to megsi-companies.csv (demo data).`);
  };

  const limitRows = (c, key, label) => {
    const lim = PLAN_INFO[c.plan][key];
    return [[`Registered ${label}`, c[key]], [`${c.plan} plan limit`, lim ?? 'Unlimited'], ['Usage of limit', lim ? `${Math.round((c[key] / lim) * 100)}%` : 'No limit'], ['Status', <StatusBadge v={c.status} />]];
  };
  const onAction = (a, c) => {
    if (a === 'view' || a === 'users' || a === 'sites') { setDetail(c); return; }
    if (a === 'edit') setModal({ type: 'form', company: c });
    else setModal({ type: 'confirm', action: a, company: c });
  };
  const messageCompany = (c) => {
    if (c.email) {
      window.location.href = `mailto:${encodeURIComponent(c.email)}?subject=${encodeURIComponent(`MEGSI Platform - ${c.name}`)}`;
      toast(`Opening your email app for ${c.name}.`);
    } else {
      toast(`No email address is available for ${c.name}.`);
    }
  };
  const companyDetailAction = (a, c) => {
    setDetail(null);
    if (a === 'edit') setModal({ type: 'form', company: c });
    else setModal({ type: 'confirm', action: a, company: c });
  };

  const save = (data) => {
    if (modal.company) {
      setRows((rs) => rs.map((r) => (r.id === modal.company.id ? { ...r, ...data, revenue: data.status === 'Trial' ? 0 : r.revenue || PLAN_INFO[data.plan].price } : r)));
      toast(`${data.name} updated (demo — not saved to a server).`);
    } else {
      const id = Math.max(...rows.map((r) => r.id)) + 1;
      setRows((rs) => [{ ...data, id, code: `CMP-${1000 + id}`, renewalDate: '2026-11-15', renewalState: 'Due soon', renewalStatusLabel: 'Due in 16 days', location: data.location || 'Not provided', revenue: data.status === 'Trial' ? 0 : PLAN_INFO[data.plan].price }, ...rs]);
      setSort({ k: 'renewalDate', dir: 1 }); setVisibleCount(PAGE_SIZE);
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
  const CONFIRM = {
    suspend: ['Suspend company', 'Suspend', 'Guards and managers of this company will lose access until it is reactivated.'],
    reactivate: ['Reactivate company', 'Reactivate', 'This company will be marked Active again.'],
    delete: ['Delete company', 'Delete', 'This removes the company from the demo list. It cannot be undone until you refresh the page.'],
  };

  return (
    <div className="dash cp">
      {detail ? <CompanyDetails company={detail} onBack={() => setDetail(null)} fmtDate={fmtDate} onEdit={() => { setDetail(null); setModal({ type: 'form', company: detail }); }} onMessage={() => messageCompany(detail)} onCompanyAction={companyDetailAction} toast={toast} /> : <>
      <div className="title-row">
        <div><h1>Companies &amp; Renewals</h1><p>Manage all tenant companies on the MEGSI platform.</p></div>
        <button className="btn-primary cp-add" onClick={() => setModal({ type: 'form', company: null })}><Plus size={18} /> Add Company</button>
      </div>

      <div className="kpis cp-kpis">{kpis.map((k) => (
        <div key={k.t} className="card kpi">
          <span className={`kpi-ic ${k.c}`}><k.I size={26} /></span>
          <span className="kpi-t"><small>{k.t}</small><span className="kpi-v"><b>{k.v}</b><em className={k.ch < 0 ? 'down' : 'up'}>{k.ch === 0 ? 'In 30 days' : `${k.ch < 0 ? '↓' : '↑'} ${Math.abs(k.ch)}%`}</em></span></span>
          <span className="kpi-d">{k.d}</span>
        </div>))}
      </div>

      <section className="card cp-card">
        <div className="cp-toolbar">
          <div className="tsearch cp-search"><Search size={16} /><input placeholder="Search by company name, contact, or plan..." value={q} onChange={(e) => withReset(setQ)(e.target.value)} aria-label="Search companies" /></div>
          {[['All Packages', plan, PLANS, setPlan], ['All Tenures', tenure, TENURES, setTenure], ['All Renewal Status', renewalStatus, RENEWAL_FILTERS, setRenewalStatus]].map(([label, val, opts, set]) => (
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
                  <td>{i + 1}</td>
                  <td><div className="name"><Avatar name={c.name} /><span className="cp-company-name">{c.name}</span></div></td>
                  <td className="cp-industry-cell">{c.industry}</td>
                  <td>{c.location || '—'}</td>
                  <td><PlanBadge v={c.plan} /></td>
                  <td><span className={`cp-tenure ${c.billingTenure === 'Annual' ? 'annual' : 'monthly'}`}>{c.billingTenure || 'Monthly'}</span></td>
                  <td>{fmtDate(c.subscriptionStartDate)}</td>
                  <td>{fmtDate(c.joiningDate)}</td>
                  <td>{c.users}</td>
                  <td>{c.sites}</td>
                  <td>{fmtDate(c.renewalDate)}</td>
                  <td><RenewalBadge company={c} /></td>
                  <td>{money(c.revenue)}</td>
                  <td className="r"><RowMenu company={c} onAction={onAction} /></td>
                </tr>))}
              {shown.length === 0 && <tr><td colSpan={COLS.length + 2} className="empty">No companies match your filters. <button className="cp-link" onClick={clear}>Clear filters</button></td></tr>}
            </tbody>
          </table>
        </div>

        <div className="cp-foot">
          <span>{filtered.length === 0 ? 'No companies found' : `Showing 1–${shown.length} of ${filtered.length} companies · scroll to load more`}</span></div>
        <div ref={loadMoreRef} className="cp-load-more" aria-live="polite">
          {hasMore ? <><span className="cp-loader" />Loading more companies…</> : filtered.length > PAGE_SIZE ? 'All companies loaded' : ''}
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
      </>}

    </div>
  );
}