import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, ArrowUpRight, Ban, Briefcase, Building2, CalendarDays, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
  CircleDollarSign, Clock, Copy, CreditCard, ExternalLink, FileText, Globe, Hash, Info, Landmark, Mail, MapPin,
  MessageCircle, Pencil, Phone, Receipt, Search, Send, ShieldCheck, UserRound, Users, X,
} from 'lucide-react';
import { PlanBadge } from '../components/Common.jsx';
import { PLAN_INFO, getCompanyExtras, getCompanySites, getCompanyUsers } from '../data/companiesData.js';
import './companyDetails.css';

/* ---------- helpers ---------- */
const money = (n) => `£${Number(n || 0).toLocaleString('en-GB')}`;
const profileDuration = (iso) => {
  const start = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(start.getTime())) return 'Not recorded';
  const now = new Date();
  let months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
  if (now.getDate() < start.getDate()) months -= 1;
  if (months < 0) return 'Starts in the future';
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  if (years && remainder) return `${years} yr ${remainder} mo`;
  if (years) return `${years} ${years === 1 ? 'year' : 'years'}`;
  return `${remainder} ${remainder === 1 ? 'month' : 'months'}`;
};
const valid = (v) => !!v && v !== 'Not provided';
const digits = (v) => String(v || '').replace(/\D/g, '');
const telHref = (v) => `tel:${String(v).replace(/[^\d+]/g, '')}`;
const waHref = (v) => `https://wa.me/${digits(v)}`;
const webHref = (v) => (/^https?:\/\//i.test(v) ? v : `https://${v}`);
const daysUntil = (iso) => (iso ? Math.ceil((new Date(`${iso}T00:00:00`) - new Date(new Date().toDateString())) / 86400000) : null);
const subscriptionProgress = (startIso, endIso) => {
  if (!startIso || !endIso) return null;
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(`${endIso}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.min(100, Math.round(((today - start) / (end - start)) * 100)));
};
const capacityState = (used, limit) => {
  if (limit == null) return { label: 'Within plan', tone: 'green' };
  const pct = limit > 0 ? (Number(used || 0) / limit) * 100 : (Number(used || 0) > 0 ? 100 : 0);
  if (pct >= 100) return { label: 'Limit reached', tone: 'red' };
  if (pct >= 80) return { label: 'Approaching limit', tone: 'amber' };
  return { label: 'Normal usage', tone: 'green' };
};
const TONES = {
  Active: 'green', Operational: 'green', Delivered: 'green', Read: 'green', Paid: 'green', 'Up to date': 'green',
  Sent: 'blue', Trial: 'amber', Pending: 'amber', 'Draft prepared': 'amber', 'Payment pending': 'amber', 'Free trial': 'blue',
  Expired: 'red', Suspended: 'red', Failed: 'red', 'Review required': 'red', Inactive: 'gray',
  'Normal usage': 'green', 'Within plan': 'green', 'Approaching limit': 'amber', 'Limit reached': 'red',
};
const Badge = ({ v }) => <span className={`cd-badge ${TONES[v] || 'blue'}`}>{v}</span>;

const activityTarget = (title = '') => {
  if (/message|reminder|email|whatsapp|notification/i.test(title)) return 'communications';
  if (/invoice|payment|billing/i.test(title)) return 'billing';
  if (/plan|subscription|renew/i.test(title)) return 'subscription';
  if (/\buser|login/i.test(title)) return 'users';
  if (/\bsite/i.test(title)) return 'sites';
  return null;
};
const TARGET_ICON = { communications: MessageCircle, billing: CreditCard, subscription: CalendarDays, users: Users, sites: MapPin };

/* ---------- small building blocks ---------- */
function CardTitle({ icon: Icon, title, right }) {
  return <div className="cd-card-title"><span className="cd-title-icon"><Icon size={16} /></span><h3>{title}</h3>{right && <span className="cd-card-right">{right}</span>}</div>;
}

function LinkBtn({ onClick, children }) {
  return <button type="button" className="cd-link" onClick={onClick}>{children}<ChevronRight size={13} /></button>;
}

function Donut({ used, limit, label, color, onOpen }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const dash = limit ? (circ * pct) / 100 : circ;
  return (
    <div className="cd-donut">
      <div className="cd-donut-chart">
        <svg viewBox="0 0 100 100" role="img" aria-label={`${label}: ${used}${limit ? ` of ${limit}` : ''}`}>
          <circle className="cd-donut-track" cx="50" cy="50" r={r} />
          <circle className="cd-donut-arc" cx="50" cy="50" r={r} stroke={color} strokeDasharray={`${dash} ${circ - dash}`} transform="rotate(-90 50 50)" />
        </svg>
        <div className="cd-donut-center"><b>{limit ? `${pct}%` : '∞'}</b><span>{limit ? 'used' : 'no limit'}</span></div>
      </div>
      <button type="button" className="cd-donut-label" onClick={onOpen}>{label}<ArrowUpRight size={12} /></button>
      <strong className="cd-donut-count">{used} / {limit ?? '∞'}</strong>
      <div className="cd-legend">
        <span><i style={{ background: color }} />Used {used}</span>
        <span><i className="avail" />Available {limit ? Math.max(0, limit - used) : 'Unlimited'}</span>
      </div>
    </div>
  );
}

function ActivityItem({ a, fmtDate, onOpen }) {
  const target = activityTarget(a.title);
  const Icon = target ? TARGET_ICON[target] : Activity;
  return (
    <li className="cd-tl-item">
      <span className="cd-tl-dot"><Icon size={11} /></span>
      <div className="cd-tl-body">
        <time>{fmtDate(a.date)}{a.time ? ` · ${a.time}` : ''}</time>
        {target
          ? <button type="button" className="cd-tl-title is-link" onClick={() => onOpen(target)}>{a.title}</button>
          : <span className="cd-tl-title">{a.title}</span>}
        <small>by {a.actor}</small>
      </div>
    </li>
  );
}

function CommTable({ items, fmtDate }) {
  const [open, setOpen] = useState(null);
  const channelIcon = (t) => (/whatsapp/i.test(t) ? <MessageCircle size={14} className="wa" /> : /sms/i.test(t) ? <Phone size={14} /> : <Mail size={14} className="em" />);
  return (
    <div className="cd-table-wrap">
      <table className="cd-table">
        <thead><tr><th>Date &amp; time</th><th>Channel</th><th>Recipient</th><th>Subject / summary</th><th>Status</th></tr></thead>
        <tbody>
          {items.map((m, i) => {
            const key = `${m.date}-${m.time || ''}-${i}`;
            const isOpen = open === key;
            return (
              <Fragment key={key}>
                <tr className={isOpen ? 'is-open' : ''}>
                  <td className="nowrap">{fmtDate(m.date)}{m.time ? ` · ${m.time}` : ''}</td>
                  <td><span className="cd-chan">{channelIcon(m.type)}{m.type}</span></td>
                  <td className="ellipsis" title={m.to}>{m.to || '—'}</td>
                  <td><button type="button" className="cd-cell-link" onClick={() => setOpen(isOpen ? null : key)} aria-expanded={isOpen}>{m.subject || 'No subject'}<ChevronDown size={12} className={isOpen ? 'flip' : ''} /></button></td>
                  <td><Badge v={m.status} /></td>
                </tr>
                {isOpen && <tr className="cd-detail-row"><td colSpan={5}><div className="cd-msg-detail"><b>{m.subject || 'Message'}</b><pre>{m.message || 'No message body was recorded for this entry.'}</pre></div></td></tr>}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SitesTable({ sites, onOpen }) {
  return (
    <div className="cd-table-wrap">
      <table className="cd-table cd-sites">
        <thead><tr><th>Site name</th><th>Location</th><th>Status</th><th className="num">Workforce</th><th className="act">Actions</th></tr></thead>
        <tbody>
          {sites.map((s) => (
            <tr key={s.id}>
              <td><button type="button" className="cd-cell-link strong" onClick={() => onOpen(s.id)}>{s.name}</button><small className="cd-sub">{s.id}</small></td>
              <td className="ellipsis">{s.address}, {s.location}</td>
              <td><Badge v={s.status} /></td>
              <td className="num"><span className="cd-chip"><Users size={12} />{s.workforce}</span></td>
              <td className="act"><button type="button" className="cd-btn sm" onClick={() => onOpen(s.id)}>View Site Details<ChevronRight size={13} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubShell({ c, title, subtitle, onBack, actions, children }) {
  return (
    <section className="cd-page cd-subview">
      <button type="button" className="cd-back" onClick={onBack}><ChevronLeft size={15} /> Back to {c.name}</button>
      <div className="cd-sub-head">
        <div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
        {actions && <div className="cd-sub-actions">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

/* ---------- main component ---------- */
export default function CompanyDetails({
  company: c, initialView = 'overview', onBack, fmtDate, onEdit, onMessage, onCompanyAction,
  onPlan, onInvoices, onPaymentHistory, onBilling, toast,
}) {
  const [view, setView] = useState({ name: initialView, siteId: null, userSite: 'all' });
  const [moreOpen, setMoreOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const moreRef = useRef(null);

  useEffect(() => {
    if (!moreOpen) return undefined;
    const down = (e) => { if (!moreRef.current?.contains(e.target)) setMoreOpen(false); };
    const key = (e) => e.key === 'Escape' && setMoreOpen(false);
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  }, [moreOpen]);

  const go = (name, extra = {}) => {
    setView({ name, siteId: null, userSite: 'all', ...extra });
    document.querySelector('.content')?.scrollTo?.({ top: 0 });
    window.scrollTo?.(0, 0);
  };
  const toOverview = () => go('overview');

  const planLimit = PLAN_INFO[c.plan] || PLAN_INFO.Starter;
  const sites = useMemo(() => getCompanySites(c), [c.id, c.sites, c.users, c.status, c.location, c.code]);
  const users = useMemo(() => getCompanyUsers(c), [c.id, c.sites, c.users, c.status, c.location, c.code, c.contact, c.email]);
  const extras = useMemo(() => getCompanyExtras(c), [c]);
  const activity = useMemo(() => [...(c.activityHistory || []), ...extras.activity], [c.activityHistory, extras]);
  const communications = c.communicationHistory || [];
  const remaining = daysUntil(c.renewalDate);
  const remainingText = remaining == null ? 'Not set' : remaining < 0 ? `Expired ${-remaining} day${remaining === -1 ? '' : 's'} ago` : remaining === 0 ? 'Expires today' : `${remaining} day${remaining === 1 ? '' : 's'}`;
  const remainingTone = remaining == null ? 'gray' : remaining < 0 ? 'red' : remaining <= 14 ? 'amber' : 'green';
  const subStatus = c.status === 'Suspended' ? 'Suspended' : remaining != null && remaining < 0 ? 'Expired' : c.status;
  const email = c.email;
  const phone = c.callingPhone || c.phone;
  const whatsapp = c.whatsapp;
  const suspended = c.status === 'Suspended';
  const payTone = extras.paymentStatus;
  const lastMethod = c.paymentHistory?.[0]?.method || '—';
  const copy = (text) => {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => toast?.('Address copied to clipboard.'), () => toast?.('Copy is not available in this browser.'));
    else toast?.('Copy is not available in this browser.');
  };

  const ctx = { c, fmtDate, go, sites, users, activity, communications, extras, remaining, remainingText, remainingTone, subStatus, planLimit };

  /* ----- sub views ----- */
  if (view.name === 'users') return <UsersView ctx={ctx} initialSite={view.userSite} onBack={toOverview} onMessage={onMessage} />;
  if (view.name === 'sites') return <SitesView ctx={ctx} onBack={toOverview} />;
  if (view.name === 'site') return <SiteView ctx={ctx} siteId={view.siteId} onBack={() => go('sites')} />;
  if (view.name === 'subscription') return <SubscriptionView ctx={ctx} onBack={toOverview} onPlan={onPlan} onBilling={onBilling} onInvoices={onInvoices} onPaymentHistory={onPaymentHistory} />;
  if (view.name === 'activity') return <ActivityView ctx={ctx} onBack={toOverview} />;
  if (view.name === 'communications') return <CommunicationsView ctx={ctx} onBack={toOverview} onMessage={onMessage} />;

  /* ----- overview ----- */
  const openActivityTarget = (t) => { if (t === 'billing') onBilling(c); else go(t); };
  const addressLines = (c.address || '').split(',').map((s) => s.trim()).filter(Boolean);
  const mapQuery = encodeURIComponent(c.address || c.location || c.name);
  const shownSites = sites.slice(0, 5);

  const menuItem = (Icon, label, fn, cls = '') => (
    <button type="button" role="menuitem" className={`cd-menu-item ${cls}`} onClick={() => { setMoreOpen(false); fn(); }}><Icon size={15} />{label}</button>
  );

  const contactChip = (kind, Icon, label, value, href, external) => (
    valid(value)
      ? <a className={`cd-contact ${kind}`} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        <span className="cd-contact-ic"><Icon size={16} /></span>
        <span className="cd-contact-t"><small>{label}</small><strong>{value}</strong></span>
        <ArrowUpRight size={14} className="cd-contact-go" />
      </a>
      : <div className={`cd-contact ${kind} off`}>
        <span className="cd-contact-ic"><Icon size={16} /></span>
        <span className="cd-contact-t"><small>{label}</small><strong>Not provided</strong></span>
      </div>
  );

  const field = (Icon, label, value, href) => (
    <div className="cd-field">
      <span className="cd-field-ic"><Icon size={14} /></span>
      <div><small>{label}</small>{valid(value) && href ? <a href={href} target="_blank" rel="noopener noreferrer">{value}</a> : <strong className={valid(value) ? '' : 'muted'}>{valid(value) ? value : 'Not provided'}</strong>}</div>
    </div>
  );

  const row = (label, value) => <div className="cd-row"><span>{label}</span><strong>{value}</strong></div>;

  return (
    <section className="cd-page">
      <div className={`cd-workspace ${panelOpen ? '' : 'no-panel'}`}>
        <main className="cd-main">
          <button type="button" className="cd-back" onClick={onBack}><ChevronLeft size={15} /> Back to Companies</button>

          <header className="cd-head">
            <div className="cd-logo"><ShieldCheck size={32} /></div>
            <div className="cd-head-info">
              <div className="cd-name-line">
                <h1>{c.name}</h1><Badge v={c.status} /><PlanBadge v={c.plan} />
              </div>
              <div className="cd-subline">
                <span><MapPin size={13} />{c.location || 'Location not provided'}</span>
                <span><Globe size={13} />{valid(c.website) ? <a href={webHref(c.website)} target="_blank" rel="noopener noreferrer">{c.website}</a> : 'Website not provided'}</span>
              </div>
              <div className="cd-regline">
                <span>Registered No: <b>{c.code || 'Not provided'}</b></span><i />
                <span>SIA: <b>{c.licenseNumber || 'Not provided'}</b></span><i />
                <span>VAT: <b>{c.vatNumber || 'Not provided'}</b></span>
              </div>
            </div>
            <div className="cd-actions">
              <button type="button" className="cd-btn primary" onClick={onMessage}><Mail size={15} />Send Message</button>
              <div className="cd-more" ref={moreRef}>
                <button type="button" className="cd-btn" aria-haspopup="menu" aria-expanded={moreOpen} onClick={() => setMoreOpen((v) => !v)}>More Actions<ChevronDown size={14} /></button>
                {moreOpen && (
                  <div className="cd-menu" role="menu">
                    <div className="cd-menu-label">Company</div>
                    {menuItem(Pencil, 'Edit Company', onEdit)}
                    {menuItem(Landmark, 'Change Plan', () => onPlan(c))}
                    <div className="cd-menu-label">Billing</div>
                    {menuItem(FileText, 'View Invoices', () => onInvoices(c))}
                    {menuItem(CreditCard, 'View Billing History', () => onBilling(c))}
                    <div className="cd-menu-sep" />
                    {suspended
                      ? menuItem(CheckCircle2, 'Reactivate Company', () => onCompanyAction('reactivate', c), 'ok')
                      : menuItem(Ban, 'Suspend Company', () => onCompanyAction('suspend', c), 'danger')}
                  </div>
                )}
              </div>
              {!panelOpen && <button type="button" className="cd-btn icon" onClick={() => setPanelOpen(true)} aria-label="Show company details panel" title="Show company details panel"><Info size={15} /></button>}
            </div>
          </header>

          <div className="cd-metrics">
            <button type="button" className="cd-metric" onClick={() => go('subscription')}>
              <span className="cd-metric-ic blue"><CalendarDays size={20} /></span>
              <span><small>Subscription</small><strong>{subStatus}</strong><em>{c.renewalDate ? `Renews ${fmtDate(c.renewalDate)}` : 'Renewal date not set'}</em></span>
            </button>
            <button type="button" className="cd-metric" onClick={() => onBilling(c)}>
              <span className="cd-metric-ic green"><CircleDollarSign size={20} /></span>
              <span><small>Monthly Revenue</small><strong>{money(c.revenue)}</strong><em>Open Tenant Billing</em></span>
            </button>
            <button type="button" className="cd-metric" onClick={() => go('users')}>
              <span className="cd-metric-ic purple"><Users size={20} /></span>
              <span><small>Total Users</small><strong>{c.users}</strong><em>{planLimit.users ? `${Math.max(0, planLimit.users - c.users)} available on plan` : 'Unlimited on plan'}</em></span>
            </button>
            <button type="button" className="cd-metric" onClick={() => go('sites')}>
              <span className="cd-metric-ic cyan"><MapPin size={20} /></span>
              <span><small>Operational Sites</small><strong>{c.sites}</strong><em>{planLimit.sites ? `${Math.max(0, planLimit.sites - c.sites)} available on plan` : 'Unlimited on plan'}</em></span>
            </button>
          </div>

          <div className="cd-grid-2 cd-company-overview-grid">
            <section className="cd-card cd-profile-card">
              <CardTitle icon={Building2} title="Company Profile" />

              <div className="cd-profile-section">
                <div className="cd-profile-section-head"><Building2 size={14} /><h4>Company Details</h4></div>
                <div className="cd-profile-details">
                  <div className="cd-profile-field"><small>Company name</small><strong>{c.name || 'Not provided'}</strong></div>
                  <div className="cd-profile-field"><small>Industry</small><strong>{valid(c.industry) ? c.industry : 'Not provided'}</strong></div>
                  <div className="cd-profile-field"><small>Company registration number</small><strong>{valid(c.code) ? c.code : 'Not provided'}</strong></div>
                  <div className="cd-profile-field"><small>VAT number</small><strong>{valid(c.vatNumber) ? c.vatNumber : 'Not provided'}</strong></div>
                  <div className="cd-profile-field"><small>SIA details</small><strong>{valid(c.licenseNumber) ? c.licenseNumber : 'Not provided'}</strong></div>
                  <div className="cd-profile-field"><small>Website</small>{valid(c.website) ? <a href={webHref(c.website)} target="_blank" rel="noopener noreferrer">{c.website}</a> : <strong className="muted">Not provided</strong>}</div>
                </div>
              </div>

              <div className="cd-profile-section">
                <div className="cd-profile-section-head"><Users size={14} /><h4>Company Engagement</h4></div>
                <div className="cd-profile-engagement">
                  <div className="cd-profile-stat"><small>Joining date</small><strong>{c.joiningDate ? fmtDate(c.joiningDate) : 'Not recorded'}</strong></div>
                  <div className="cd-profile-stat"><small>Time with MEGSI</small><strong>{c.joiningDate ? profileDuration(c.joiningDate) : 'Not recorded'}</strong></div>
                  <div className="cd-profile-stat"><small>Total sites</small><strong>{sites.length}</strong></div>
                  <div className="cd-profile-stat"><small>Active sites</small><strong>{sites.filter((site) => ['Operational', 'Active'].includes(site.status)).length}</strong></div>
                  <div className="cd-profile-stat"><small>Inactive sites</small><strong>{sites.filter((site) => !['Operational', 'Active'].includes(site.status)).length}</strong></div>
                </div>
              </div>

              <div className="cd-profile-bottom-grid">
                <div className="cd-profile-section">
                  <div className="cd-profile-section-head"><CalendarDays size={14} /><h4>Subscription Information</h4></div>
                  <div className="cd-profile-rows">
                    <div><span>Current plan</span><strong><PlanBadge v={c.plan} /></strong></div>
                    <div><span>Status</span><strong><Badge v={subStatus} /></strong></div>
                    <div><span>Start date</span><strong>{c.subscriptionStartDate ? fmtDate(c.subscriptionStartDate) : 'Not recorded'}</strong></div>
                    <div><span>End date</span><strong>{c.renewalDate ? fmtDate(c.renewalDate) : 'Not recorded'}</strong></div>
                    <div><span>Renewal date</span><strong>{c.status === 'Active' && c.renewalDate ? fmtDate(c.renewalDate) : 'Not scheduled'}</strong></div>
                  </div>
                </div>

                <div className="cd-profile-section">
                  <div className="cd-profile-section-head"><Briefcase size={14} /><h4>Current Project</h4></div>
                  <div className="cd-profile-project">
                    <strong>{c.currentProject?.name || c.currentProjectName || c.projectName || 'No project recorded'}</strong>
                    {(c.currentProject?.status || c.projectStatus) && <span><Badge v={c.currentProject?.status || c.projectStatus} /></span>}
                    {(c.currentProject?.startDate || c.projectStartDate) && <small>Start date: {fmtDate(c.currentProject?.startDate || c.projectStartDate)}</small>}
                    {(c.currentProject?.sites ?? c.projectSites) != null && <small>Assigned sites: {c.currentProject?.sites ?? c.projectSites}</small>}
                    {!c.currentProject && !c.currentProjectName && !c.projectName && <small>Project information has not been added to this company record.</small>}
                  </div>
                </div>
              </div>
            </section>
            <div className="cd-contact-stack">
            <section className="cd-card">
              <CardTitle icon={UserRound} title="Contact Information" />
              <div className="cd-fields two">
                {field(UserRound, 'Primary contact', c.contact)}
                {field(Briefcase, 'Designation', c.designation || 'Company Administrator')}
              </div>
              <div className="cd-contacts">
                {contactChip('email', Mail, 'Email', email, `mailto:${email}`)}
                {contactChip('phone', Phone, 'Phone', phone, valid(phone) ? telHref(phone) : '#')}
                {contactChip('whatsapp', MessageCircle, 'WhatsApp', whatsapp, valid(whatsapp) ? waHref(whatsapp) : '#', true)}
              </div>
            </section>
            <section className="cd-card cd-address-card">
              <CardTitle icon={MapPin} title="Registered Address" />
              <div className="cd-address">
                <span className="cd-pin"><MapPin size={20} /></span>
                <div>
                  {addressLines.length
                    ? addressLines.map((l, i) => <span key={i}>{l}</span>)
                    : <><span>{c.location || 'Address not provided'}</span><small className="muted">Full street address is not on file.</small></>}
                </div>
              </div>
              <div className="cd-addr-actions">
                <a className="cd-btn sm" href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={13} />Open in Maps</a>
                {addressLines.length > 0
                  ? <button type="button" className="cd-btn sm" onClick={() => copy(c.address)}><Copy size={13} />Copy</button>
                  : <button type="button" className="cd-btn sm" onClick={onEdit}><Pencil size={13} />Add address</button>}
              </div>
              <svg className="cd-skyline" viewBox="0 70 360 80" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
                <path d="M4 143H356" fill="none" stroke="#bcd5f7" strokeWidth="2" />
                <g fill="#d4e5fb" stroke="#bcd5f7"><path d="M12 143V112h26v31z M43 143V88h35v55z M83 143V104h28v39z M116 143V80h43v63z M164 143V91h32v52z M201 143V76h39v67z M245 143V99h25v44z M276 143V86h39v57z M320 143V98h24v45z" /></g>
                <g fill="#f0f6ff"><path d="M50 98h6v8h-6z M63 98h6v8h-6z M124 90h7v9h-7z M140 90h7v9h-7z M124 108h7v9h-7z M140 108h7v9h-7z M210 88h7v9h-7z M225 88h7v9h-7z M286 96h7v9h-7z M300 96h7v9h-7z" /></g>
              </svg>
            </section>
            </div>

          </div>

          <div className="cd-grid-2 cd-company-limits-grid">
            <section className="cd-card cd-subscription-card">
              <CardTitle icon={CalendarDays} title="Subscription Details" right={<span className={`cd-badge ${remainingTone}`}>{remainingText}</span>} />
              <div className="cd-rows cd-subscription-rows">
                <div className="cd-row"><span>Plan</span><strong><PlanBadge v={c.plan} /></strong></div>
                {row('Monthly amount', `${money(c.revenue)} / month`)}
                {row('Start date', c.subscriptionStartDate ? fmtDate(c.subscriptionStartDate) : 'Not recorded')}
                {row('End date', c.renewalDate ? fmtDate(c.renewalDate) : 'Not recorded')}
                {row('Renewal date', c.status === 'Active' && c.renewalDate ? fmtDate(c.renewalDate) : 'Not scheduled')}
                <div className="cd-row"><span>Subscription status</span><strong><Badge v={subStatus} /></strong></div>
                <div className="cd-row"><span>Payment status</span><strong><Badge v={payTone} /></strong></div>
                {row('Last payment', extras.lastPayment ? fmtDate(extras.lastPayment) : 'No payment recorded')}
                {row('Next payment due', c.renewalDate ? (remaining != null && remaining < 0 ? `Overdue · ${fmtDate(c.renewalDate)}` : fmtDate(c.renewalDate)) : 'Not scheduled')}
                <div className="cd-row"><span>Remaining days</span><strong><Badge v={remainingText} /></strong></div>
              </div>
              <div className="cd-period-block">
                <div className="cd-period-heading"><strong>Subscription period</strong><span>{subscriptionProgress(c.subscriptionStartDate, c.renewalDate) == null ? 'Dates unavailable' : `${subscriptionProgress(c.subscriptionStartDate, c.renewalDate)}% elapsed`}</span></div>
                <div className="cd-period-track" role="progressbar" aria-label="Subscription period elapsed" aria-valuemin="0" aria-valuemax="100" aria-valuenow={subscriptionProgress(c.subscriptionStartDate, c.renewalDate) ?? 0}>
                  <span style={{ width: `${subscriptionProgress(c.subscriptionStartDate, c.renewalDate) ?? 0}%` }} />
                </div>
                <div className="cd-period-timeline">
                  <div className="cd-period-point"><i className="done" /><span><b>Started</b><small>{c.subscriptionStartDate ? fmtDate(c.subscriptionStartDate) : 'Not recorded'}</small></span></div>
                  <div className="cd-period-point"><i className={remaining != null && remaining < 0 ? 'expired' : 'current'} /><span><b>{remaining != null && remaining < 0 ? 'Expired' : 'Current period'}</b><small>{remainingText}</small></span></div>
                  <div className="cd-period-point"><i className="end" /><span><b>End date</b><small>{c.renewalDate ? fmtDate(c.renewalDate) : 'Not recorded'}</small></span></div>
                </div>
              </div>
              <LinkBtn onClick={() => go('subscription')}>View full subscription details</LinkBtn>
            </section>
            <section className="cd-card cd-usage-card">
              <CardTitle icon={Activity} title="Usage & Limits" />
              <div className="cd-usage-list">
                {[
                  { key: 'users', label: 'User capacity', used: Number(c.users) || 0, limit: planLimit.users, color: '#0866F5', onOpen: () => go('users'), unit: 'users' },
                  { key: 'sites', label: 'Operational site capacity', used: Number(c.sites) || 0, limit: planLimit.sites, color: '#0D9F98', onOpen: () => go('sites'), unit: 'sites' },
                ].map((item) => {
                  const limit = item.limit;
                  const available = limit == null ? null : Math.max(0, limit - item.used);
                  const percent = limit == null ? 0 : limit > 0 ? Math.min(100, Math.round((item.used / limit) * 100)) : (item.used > 0 ? 100 : 0);
                  const state = capacityState(item.used, limit);
                  return (
                    <div className="cd-usage-item" key={item.key}>
                      <div className="cd-usage-top">
                        <div><strong>{item.label}</strong><small>{item.key === 'users' ? 'Company user accounts counted against the plan.' : 'Operational locations counted against the plan.'}</small></div>
                        <Badge v={state.label} />
                      </div>
                      <div className="cd-usage-numbers"><strong>{item.used} <span>/ {limit == null ? 'Unlimited' : limit} {item.unit}</span></strong><b>{limit == null ? 'No fixed limit' : `${percent}% used`}</b></div>
                      <div className={`cd-usage-track ${state.tone}`} role="progressbar" aria-label={`${item.label} usage`} aria-valuemin="0" aria-valuemax={limit ?? 100} aria-valuenow={limit == null ? item.used : Math.min(item.used, limit)}>
                        <span style={{ width: limit == null ? '0%' : `${percent}%`, background: item.color }} />
                      </div>
                      <div className="cd-usage-foot"><span>Used: {item.used}</span><span>{available == null ? 'Available: Unlimited' : `Available: ${available}`}</span></div>
                      <button type="button" className="cd-usage-link" onClick={item.onOpen}>View {item.key === 'users' ? 'company users' : 'company sites'} <ArrowUpRight size={12} /></button>
                    </div>
                  );
                })}
              </div>
              <p className="cd-usage-note">Usage is calculated from the company's current user and operational site counts compared with its subscription plan limits.</p>
            </section>
          </div>

          <div className="cd-grid-2">
            <section className="cd-card">
              <CardTitle icon={CreditCard} title="Revenue & Payments" />
              <div className="cd-blocks">
                <div className="cd-block hero"><small>Monthly revenue</small><strong>{money(c.revenue)}</strong><em>{c.billingTenure || 'Monthly'} billing · {c.plan}</em></div>
                <div className="cd-block">
                  <div className="cd-row"><span>Payment status</span><strong><Badge v={payTone} /></strong></div>
                  <div className="cd-row"><span>Last payment</span><strong>{extras.lastPayment ? fmtDate(extras.lastPayment) : '—'}</strong></div>
                  <div className="cd-row"><span>Next payment due</span><strong>{fmtDate(c.renewalDate)}</strong></div>
                </div>
                <div className="cd-block">
                  <div className="cd-row"><span>Outstanding</span><strong className={extras.outstanding ? 'red' : ''}>{money(extras.outstanding)}</strong></div>
                  <div className="cd-row"><span>Total collected</span><strong>{money(extras.totalRevenue)}</strong></div>
                  <div className="cd-row"><span>Method</span><strong>{lastMethod}</strong></div>
                </div>
              </div>
              <div className="cd-btn-row">
                <button type="button" className="cd-btn primary sm" onClick={() => onBilling(c)}><CreditCard size={13} />Tenant Billing</button>
                <button type="button" className="cd-btn sm" onClick={() => onPaymentHistory(c)}><Clock size={13} />Payment History</button>
              </div>
            </section>

            <section className="cd-card">
              <CardTitle icon={MessageCircle} title="Communication History" right={communications.length > 0 && <LinkBtn onClick={() => go('communications')}>View all</LinkBtn>} />
              {communications.length === 0 ? (
                <div className="cd-empty">
                  <span className="cd-empty-ic"><MessageCircle size={22} /></span>
                  <h4>No Communication History</h4>
                  <p>Messages and notifications sent to this company will appear here.</p>
                  <button type="button" className="cd-btn primary" onClick={onMessage}><Send size={14} />Send Message</button>
                </div>
              ) : <CommTable items={communications.slice(0, 4)} fmtDate={fmtDate} />}
            </section>
          </div>

          <section className="cd-card">
            <CardTitle icon={MapPin} title="Company Sites" right={sites.length > 0 && <LinkBtn onClick={() => go('sites')}>View all {sites.length} sites</LinkBtn>} />
            {sites.length === 0
              ? <div className="cd-empty compact"><span className="cd-empty-ic"><MapPin size={18} /></span><div><h4>No sites registered</h4><p>Sites added for this company will be listed here.</p></div></div>
              : <SitesTable sites={shownSites} onOpen={(id) => go('site', { siteId: id })} />}
            {sites.length > shownSites.length && <p className="cd-foot-note">Showing {shownSites.length} of {sites.length} sites</p>}
          </section>
        </main>

        {panelOpen && (
          <aside className="cd-panel" aria-label="Company details">
            <div className="cd-panel-head"><h2>Company Details</h2><button type="button" onClick={() => setPanelOpen(false)} aria-label="Close company details panel"><X size={16} /></button></div>
            <section className="cd-panel-sec">
              <h3>Company Overview</h3>
              <div className="cd-panel-co"><div className="cd-panel-logo"><ShieldCheck size={22} /></div><div><strong>{c.name}</strong><span>{c.industry}</span><Badge v={c.status} /></div></div>
            </section>
            <section className="cd-panel-sec">
              <h3>Subscription Summary</h3>
              {row('Plan', c.plan)}{row('Start date', fmtDate(c.subscriptionStartDate))}{row('End date', fmtDate(c.renewalDate))}
              <div className="cd-row"><span>Days remaining</span><strong><Badge v={remainingText} /></strong></div>
              <div className="cd-row"><span>Status</span><strong><Badge v={subStatus} /></strong></div>
            </section>
            <section className="cd-panel-sec">
              <h3>Usage Summary</h3>
              {[['Users', c.users, planLimit.users, '#0866F5', 'users'], ['Sites', c.sites, planLimit.sites, '#0D9F98', 'sites']].map(([l, used, lim, col, target]) => (
                <button type="button" className="cd-mini" key={l} onClick={() => go(target)}>
                  <span className="cd-mini-top"><span>{l}</span><strong>{used}{lim ? ` / ${lim}` : ''}</strong><em>{lim ? `${Math.min(100, Math.round((used / lim) * 100))}%` : 'No limit'}</em></span>
                  <span className="cd-bar"><i style={{ width: `${lim ? Math.min(100, (used / lim) * 100) : 100}%`, background: col }} /></span>
                </button>
              ))}
            </section>
            <section className="cd-panel-sec">
              <h3>Recent Activity</h3>
              <ul className="cd-timeline compact">{activity.slice(0, 4).map((a, i) => <ActivityItem key={i} a={a} fmtDate={fmtDate} onOpen={openActivityTarget} />)}</ul>
            </section>
            <section className="cd-panel-sec">
              <h3>Company Sites</h3>
              {sites.length === 0 ? <p className="muted small">No sites registered.</p> : (
                <ul className="cd-panel-sites">
                  {sites.slice(0, 3).map((s) => (
                    <li key={s.id}><button type="button" onClick={() => go('site', { siteId: s.id })}><MapPin size={13} /><span><b>{s.name}</b><small>{s.workforce} workforce</small></span><ChevronRight size={13} /></button></li>
                  ))}
                </ul>
              )}
              {sites.length > 0 && <LinkBtn onClick={() => go('sites')}>View Site Details ({sites.length})</LinkBtn>}
            </section>
          </aside>
        )}
      </div>
    </section>
  );
}

/* ---------- sub views ---------- */
function UsersView({ ctx, initialSite, onBack, onMessage }) {
  const { c, users, sites, planLimit } = ctx;
  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');
  const [site, setSite] = useState(initialSite || 'all');
  const [limit, setLimit] = useState(25);
  const roles = [...new Set(users.map((u) => u.role))];
  const list = users.filter((u) => (role === 'all' || u.role === role) && (site === 'all' || u.siteId === site)
    && (!q.trim() || `${u.name} ${u.email} ${u.siteName}`.toLowerCase().includes(q.trim().toLowerCase())));
  return (
    <SubShell c={c} title={`Users – ${c.name}`} subtitle={`${users.length} registered user(s)${planLimit.users ? ` · ${Math.max(0, planLimit.users - users.length)} available on the ${c.plan} plan` : ''}`} onBack={onBack}
      actions={<button type="button" className="cd-btn primary" onClick={onMessage}><Mail size={14} />Send Message</button>}>
      <section className="cd-card">
        <div className="cd-toolbar">
          <label className="cd-search"><Search size={14} /><input value={q} onChange={(e) => { setQ(e.target.value); setLimit(25); }} placeholder="Search users by name, email or site" aria-label="Search users" /></label>
          <select value={role} onChange={(e) => { setRole(e.target.value); setLimit(25); }} aria-label="Filter by role"><option value="all">All roles</option>{roles.map((r) => <option key={r}>{r}</option>)}</select>
          <select value={site} onChange={(e) => { setSite(e.target.value); setLimit(25); }} aria-label="Filter by site"><option value="all">All sites</option>{sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        </div>
        {list.length === 0 ? <div className="cd-empty compact"><span className="cd-empty-ic"><Users size={18} /></span><div><h4>No users match</h4><p>Adjust the search or filters.</p></div></div> : (
          <div className="cd-table-wrap"><table className="cd-table">
            <thead><tr><th>User</th><th>Role</th><th>Assigned site</th><th>Email</th><th>Status</th></tr></thead>
            <tbody>{list.slice(0, limit).map((u) => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong><small className="cd-sub">{u.id}</small></td>
                <td>{u.role}</td>
                <td>{u.siteId ? <button type="button" className="cd-cell-link" onClick={() => ctx.go('site', { siteId: u.siteId })}>{u.siteName}</button> : 'Unassigned'}</td>
                <td className="ellipsis"><a className="cd-cell-link" href={`mailto:${u.email}`}>{u.email}</a></td>
                <td><Badge v={u.status} /></td>
              </tr>))}</tbody>
          </table></div>)}
        <div className="cd-foot"><span>Showing {Math.min(limit, list.length)} of {list.length}</span>{limit < list.length && <button type="button" className="cd-btn sm" onClick={() => setLimit((n) => n + 25)}>Show more</button>}</div>
      </section>
    </SubShell>
  );
}

function SitesView({ ctx, onBack }) {
  const { c, sites, planLimit } = ctx;
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(20);
  const list = sites.filter((s) => !q.trim() || `${s.name} ${s.address} ${s.id}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <SubShell c={c} title={`Sites – ${c.name}`} subtitle={`${sites.length} site(s)${planLimit.sites ? ` · ${Math.max(0, planLimit.sites - sites.length)} available on the ${c.plan} plan` : ''}`} onBack={onBack}>
      <section className="cd-card">
        <div className="cd-toolbar"><label className="cd-search"><Search size={14} /><input value={q} onChange={(e) => { setQ(e.target.value); setLimit(20); }} placeholder="Search sites" aria-label="Search sites" /></label></div>
        {list.length === 0 ? <div className="cd-empty compact"><span className="cd-empty-ic"><MapPin size={18} /></span><div><h4>No sites found</h4><p>{sites.length ? 'Adjust the search.' : 'No sites are registered for this company.'}</p></div></div>
          : <SitesTable sites={list.slice(0, limit)} onOpen={(id) => ctx.go('site', { siteId: id })} />}
        <div className="cd-foot"><span>Showing {Math.min(limit, list.length)} of {list.length}</span>{limit < list.length && <button type="button" className="cd-btn sm" onClick={() => setLimit((n) => n + 20)}>Show more</button>}</div>
      </section>
    </SubShell>
  );
}

function SiteView({ ctx, siteId, onBack }) {
  const { c, sites, users } = ctx;
  const [limit, setLimit] = useState(15);
  const site = sites.find((s) => s.id === siteId);
  if (!site) return <SubShell c={c} title="Site not found" onBack={onBack}><section className="cd-card"><p className="muted">This site no longer exists for {c.name}.</p></section></SubShell>;
  const staff = users.filter((u) => u.siteId === site.id);
  const item = (l, v) => <div className="cd-row"><span>{l}</span><strong>{v}</strong></div>;
  return (
    <SubShell c={{ ...c, name: 'Sites' }} title={site.name} subtitle={`${site.id} · ${c.name}`} onBack={onBack}
      actions={<button type="button" className="cd-btn" onClick={() => ctx.go('users', { userSite: site.id })}><Users size={14} />View in Users</button>}>
      <div className="cd-grid-2">
        <section className="cd-card"><CardTitle icon={MapPin} title="Site Information" />
          <div className="cd-rows">
            {item('Site ID', site.id)}{item('Company', c.name)}{item('Address', `${site.address}, ${site.location}`)}
            <div className="cd-row"><span>Status</span><strong><Badge v={site.status} /></strong></div>
            {item('Site manager', site.manager)}{item('Shift pattern', site.shift)}
          </div>
          <a className="cd-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.address}, ${site.location}`)}`} target="_blank" rel="noopener noreferrer">Open in Maps<ExternalLink size={12} /></a>
        </section>
        <section className="cd-card"><CardTitle icon={Users} title="Workforce" />
          <div className="cd-blocks"><div className="cd-block hero"><small>Assigned workforce</small><strong>{site.workforce}</strong><em>of {c.users} company users</em></div></div>
          <div className="cd-rows">
            {['Company Admin', 'Site Manager', 'Supervisor', 'Security Officer'].map((r) => item(r, staff.filter((u) => u.role === r).length))}
          </div>
        </section>
      </div>
      <section className="cd-card"><CardTitle icon={Users} title="Assigned Users" />
        {staff.length === 0 ? <div className="cd-empty compact"><span className="cd-empty-ic"><Users size={18} /></span><div><h4>No users assigned</h4><p>Users assigned to this site will appear here.</p></div></div> : (
          <div className="cd-table-wrap"><table className="cd-table">
            <thead><tr><th>User</th><th>Role</th><th>Email</th><th>Status</th></tr></thead>
            <tbody>{staff.slice(0, limit).map((u) => <tr key={u.id}><td><strong>{u.name}</strong></td><td>{u.role}</td><td className="ellipsis"><a className="cd-cell-link" href={`mailto:${u.email}`}>{u.email}</a></td><td><Badge v={u.status} /></td></tr>)}</tbody>
          </table></div>)}
        <div className="cd-foot"><span>Showing {Math.min(limit, staff.length)} of {staff.length}</span>{limit < staff.length && <button type="button" className="cd-btn sm" onClick={() => setLimit((n) => n + 15)}>Show more</button>}</div>
      </section>
    </SubShell>
  );
}

function SubscriptionView({ ctx, onBack, onPlan, onBilling, onInvoices, onPaymentHistory }) {
  const { c, fmtDate, remainingText, remainingTone, subStatus, planLimit } = ctx;
  const row = (l, v) => <div className="cd-row"><span>{l}</span><strong>{v}</strong></div>;
  const history = c.subscriptionHistory || [];
  return (
    <SubShell c={c} title={`Subscription – ${c.name}`} subtitle={`${c.plan} plan · ${c.billingTenure || 'Monthly'} billing`} onBack={onBack}
      actions={<><button type="button" className="cd-btn" onClick={() => onPlan(c)}><Landmark size={14} />Change Plan</button><button type="button" className="cd-btn primary" onClick={() => onBilling(c)}><CreditCard size={14} />Tenant Billing</button></>}>
      <div className="cd-grid-2">
        <section className="cd-card"><CardTitle icon={CalendarDays} title="Subscription Details" right={<span className={`cd-badge ${remainingTone}`}>{remainingText}</span>} />
          <div className="cd-rows">
            <div className="cd-row"><span>Plan</span><strong><PlanBadge v={c.plan} /></strong></div>
            {row('Amount', `${money(c.revenue)} / month`)}{row('Billing frequency', c.billingTenure || 'Monthly')}
            {row('Start date', fmtDate(c.subscriptionStartDate))}{row('End date', fmtDate(c.renewalDate))}
            {row('Renewal date', c.status === 'Active' ? fmtDate(c.renewalDate) : 'Not scheduled')}
            <div className="cd-row"><span>Status</span><strong><Badge v={subStatus} /></strong></div>
            {row('Company joined', fmtDate(c.joiningDate))}
          </div>
        </section>
        <section className="cd-card"><CardTitle icon={Activity} title="Plan Limits" />
          <div className="cd-rows">
            {row('User limit', planLimit.users ?? 'Unlimited')}{row('Users in use', c.users)}
            {row('Site limit', planLimit.sites ?? 'Unlimited')}{row('Sites in use', c.sites)}
          </div>
          <div className="cd-btn-row"><button type="button" className="cd-btn sm" onClick={() => onInvoices(c)}><FileText size={13} />Invoices</button><button type="button" className="cd-btn sm" onClick={() => onPaymentHistory(c)}><Clock size={13} />Payment History</button></div>
        </section>
      </div>
      <section className="cd-card"><CardTitle icon={Clock} title="Plan History" />
        {history.length === 0 ? <div className="cd-empty compact"><span className="cd-empty-ic"><Clock size={18} /></span><div><h4>No previous plans</h4><p>Plan changes made from this page are recorded here.</p></div></div> : (
          <div className="cd-table-wrap"><table className="cd-table"><thead><tr><th>Previous plan</th><th>Billing</th><th>Amount</th><th>Changed on</th></tr></thead>
            <tbody>{history.map((h, i) => <tr key={i}><td>{h.plan}</td><td>{h.billingTenure}</td><td>{money(h.amount)}</td><td>{fmtDate(h.effectiveDate)}</td></tr>)}</tbody></table></div>)}
      </section>
    </SubShell>
  );
}

function ActivityView({ ctx, onBack }) {
  const { c, activity, fmtDate } = ctx;
  return (
    <SubShell c={c} title={`Activity – ${c.name}`} subtitle={`${activity.length} recorded events`} onBack={onBack}>
      <section className="cd-card"><ul className="cd-timeline">{activity.map((a, i) => <ActivityItem key={i} a={a} fmtDate={fmtDate} onOpen={(t) => ctx.go(t === 'billing' ? 'subscription' : t)} />)}</ul></section>
    </SubShell>
  );
}

function CommunicationsView({ ctx, onBack, onMessage }) {
  const { c, communications, fmtDate } = ctx;
  return (
    <SubShell c={c} title={`Communication History – ${c.name}`} subtitle={`${communications.length} message(s)`} onBack={onBack}
      actions={<button type="button" className="cd-btn primary" onClick={onMessage}><Send size={14} />Send Message</button>}>
      <section className="cd-card">
        {communications.length === 0
          ? <div className="cd-empty"><span className="cd-empty-ic"><MessageCircle size={22} /></span><h4>No Communication History</h4><p>Messages and notifications sent to this company will appear here.</p><button type="button" className="cd-btn primary" onClick={onMessage}><Send size={14} />Send Message</button></div>
          : <CommTable items={communications} fmtDate={fmtDate} />}
      </section>
    </SubShell>
  );
}