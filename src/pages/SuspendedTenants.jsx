import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, Building2, CreditCard, FileText, Mail, RefreshCw,
  Search, ShieldAlert, Users, Activity, ClipboardList, X, Download,
  CalendarDays, MapPin, Phone, UserRound, ReceiptText, CheckCircle2,
} from 'lucide-react';
import SuspendedCharts, { SummaryCards } from './suspended/SuspendedCharts.jsx';
import { TENANTS, REASONS, PLANS, STATUSES } from '../data/suspendedData.js';
import './suspended-tenants.css';

const PAGE_SIZE = 12;
const fmtDate = value => value ? new Date(value.replace(' ', 'T')).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const money = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const pct = (value, max) => max ? Math.min(100, Math.round((value / max) * 100)) : 0;
const statusClass = value => ({ 'Pending Review': 'pending', 'Under Review': 'review', Critical: 'critical', 'Eligible for Reactivation': 'eligible', Rejected: 'rejected' }[value] || 'pending');

function Section({ title, icon: Icon, children, extra }) {
  return <section className="st-panel st-detail-section"><header className="st-panel-heading"><span className="st-panel-icon"><Icon size={16}/></span><h3>{title}</h3><span className="st-grow"/>{extra}</header>{children}</section>;
}
function UsageBar({ label, value, max, unit = '', hint }) {
  const percent = pct(value, max);
  return <div className="st-usage-row"><div className="st-usage-label"><span>{label}</span><b>{value.toLocaleString('en-IN')} {unit}<em> / {max.toLocaleString('en-IN')} {unit}</em></b></div><div className="st-usage-track"><span className={percent >= 90 ? 'danger' : percent >= 75 ? 'warn' : ''} style={{ width: `${percent}%` }}/></div><small>{hint || `${percent}% of allocated capacity used`}</small></div>;
}
function TenantDetails({ tenant, onBack, onReactivate, onContact }) {
  const [confirm, setConfirm] = useState(false);
  return <div className="st-detail-page">
    <div className="st-detail-top"><button className="st-btn st-btn-light" onClick={onBack}><ArrowLeft size={15}/> Back to Suspended Tenants</button><div className="st-detail-breadcrumb">Tenant Management <span>/</span> <b>{tenant.name}</b></div><div className="st-detail-actions"><button className="st-btn st-btn-light" onClick={() => onContact(tenant)}><Mail size={15}/> Contact Tenant</button><button className="st-btn st-btn-primary" onClick={() => setConfirm(true)}><RefreshCw size={15}/> Reactivate Tenant</button></div></div>
    <div className="st-detail-title"><div className="st-company-icon"><Building2 size={27}/></div><div className="st-detail-title-copy"><span className="st-eyebrow">TENANT ACCOUNT PROFILE</span><h1>{tenant.name}</h1><p>Tenant ID: {tenant.id} <span className={`st-status ${statusClass(tenant.status)}`}>{tenant.status}</span><span className="st-detail-meta"><CalendarDays size={12}/> Suspended {fmtDate(tenant.suspendedDate)}</span></p></div><div className="st-detail-title-side"><small>SUBSCRIPTION PLAN</small><span className={`st-plan ${tenant.plan.toLowerCase()}`}>{tenant.plan}</span></div></div>


    <div className="st-detail-grid" id="st-detail-overview">
      <div className="st-detail-main">
        <Section title="Suspension Information" icon={ShieldAlert} extra={<span className={`st-status ${statusClass(tenant.status)}`}>{tenant.status}</span>}>
          <div className="st-info-grid st-info-grid-four"><div><label>Suspension Reason</label><b className="st-reason-pill">{tenant.reason}</b></div><div><label>Suspended On</label><b>{fmtDate(tenant.suspendedDate)}</b></div><div><label>Suspended By</label><b>{tenant.suspendedBy}</b></div><div><label>Review Status</label><b>{tenant.status}</b></div><div className="wide"><label>Administrator Notes</label><b>{tenant.notes}</b></div></div>
        </Section>
        <Section title="Company Usage & Capacity" icon={Users} extra={<span className="st-section-hint">Live demo utilisation</span>}>
          <div className="st-usage-grid"><UsageBar label="Total Users" value={tenant.users} max={tenant.usersMax}/><UsageBar label="Guards" value={tenant.guards} max={tenant.guardsMax}/><UsageBar label="Operational Sites" value={tenant.sites} max={tenant.sitesMax}/><UsageBar label="Storage" value={tenant.storage} max={tenant.storageMax} unit="GB"/></div>
          <div className="st-usage-summary"><span><b>{tenant.users}</b> Active / allocated users</span><span><b>{tenant.guards}</b> Registered guards</span><span><b>{tenant.sites}</b> Operational sites</span></div>
        </Section>
        <Section title="Account Activity Timeline" icon={Activity}>
          <div className="st-history">{tenant.history.map((item, index) => <div className="st-history-item" key={`${item.date}-${index}`}><span className="st-history-dot"/><div><b>{item.title}</b><p>{item.detail}</p><small>{item.date} · {item.by}</small></div></div>)}<div className="st-history-item"><span className="st-history-dot muted"/><div><b>Account created</b><p>Tenant workspace and initial administrator profile were created.</p><small>{tenant.startDate} · MEGSI System</small></div></div></div>
        </Section>
        <Section title="Review & Compliance Notes" icon={ClipboardList}>
          <div className="st-info-grid"><div><label>Assigned Reviewer</label><b>{tenant.reviewBy}</b></div><div><label>Scheduled Review Date</label><b>{tenant.reviewDate}</b></div><div><label>Current Review Status</label><b><span className={`st-status ${statusClass(tenant.status)}`}>{tenant.status}</span></b></div><div><label>Compliance Category</label><b>{tenant.reason === 'Security Issue' ? 'Security compliance' : tenant.reason === 'Terms Violation' ? 'Terms & policy' : 'Account operations'}</b></div></div>
          <div className="st-review-note"><b>Internal review note</b><p>{tenant.notes} Review the account evidence and contact the tenant administrator before reinstatement.</p></div>
        </Section>
      </div>
      <aside className="st-detail-side">
        <Section title="Company Profile" icon={Building2}>
          <div className="st-info-list"><div><label>Company Administrator</label><b><UserRound size={13}/>{tenant.contact}</b></div><div><label>Email Address</label><b className="break"><Mail size={13}/>{tenant.email}</b></div><div><label>Contact Number</label><b><Phone size={13}/>{tenant.phone}</b></div><div><label>Tenant Reference</label><b>{tenant.id}</b></div><div><label>Operating Region</label><b><MapPin size={13}/>India · South Region</b></div></div>
        </Section>
        <Section title="Subscription Details" icon={FileText}>
          <div className="st-info-list"><div><label>Current Plan</label><b><span className={`st-plan ${tenant.plan.toLowerCase()}`}>{tenant.plan}</span></b></div><div><label>Subscription Start</label><b>{tenant.startDate}</b></div><div><label>Next Renewal Date</label><b>{tenant.renewal}</b></div><div><label>Monthly Plan Price</label><b>{money(tenant.price)}</b></div><div><label>Subscription State</label><b><span className="st-status critical">Suspended</span></b></div></div>
        </Section>
        <Section title="Billing & Payments" icon={CreditCard}>
          <div className="st-billing-highlight"><small>OUTSTANDING BALANCE</small><strong className={tenant.outstanding ? 'st-red' : ''}>{money(tenant.outstanding)}</strong><span>{tenant.outstanding ? 'Payment action required' : 'No pending balance'}</span></div>
          <div className="st-info-list"><div><label>Last Successful Payment</label><b>{tenant.lastPayment}</b></div><div><label>Payment Status</label><b>{tenant.outstanding ? 'Outstanding' : 'Paid'}</b></div><div><label>Billing Cycle</label><b>Monthly</b></div><div><label>Payment Method</label><b>Registered account method</b></div></div>
          <div className="st-invoice-list"><div><span><ReceiptText size={14}/> Latest invoice</span><b>{tenant.id}-INV-03</b><small>{money(tenant.price)} · {tenant.lastPayment}</small></div><div><span><ReceiptText size={14}/> Previous invoice</span><b>{tenant.id}-INV-02</b><small>{money(tenant.price)} · 1 month earlier</small></div></div>
        </Section>
        <Section title="Account Support" icon={CheckCircle2}>
          <div className="st-support-box"><b>Tenant support contact</b><p>Contact the company administrator for billing, compliance, or access-related clarification.</p><button className="st-btn st-btn-light" onClick={() => onContact(tenant)}><Mail size={14}/> Email administrator</button></div>
        </Section>
      </aside>
    </div>
    {confirm && <div className="st-confirm-backdrop" role="presentation"><div className="st-confirm" role="dialog" aria-modal="true"><button className="st-confirm-x" onClick={() => setConfirm(false)} aria-label="Close"><X size={17}/></button><span className="st-confirm-icon"><RefreshCw size={22}/></span><h3>Reactivate this tenant?</h3><p>{tenant.name} will be removed from the suspended list and marked as reactivated in this local demo.</p><div><button className="st-btn st-btn-light" onClick={() => setConfirm(false)}>Cancel</button><button className="st-btn st-btn-primary" onClick={() => { onReactivate(tenant); setConfirm(false); }}>Confirm Reactivation</button></div></div></div>}
  </div>;
}

export default function SuspendedTenants() {
  const [tenants, setTenants] = useState(TENANTS);
  const [query, setQuery] = useState('');
  const [reason, setReason] = useState('All Reasons');
  const [plan, setPlan] = useState('All Plans');
  const [status, setStatus] = useState('All Statuses');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState(null);
  const [reactivated, setReactivated] = useState([]);
  const sentinel = useRef(null);
  const scrollBox = useRef(null);
  const filtered = useMemo(() => tenants.filter(tenant =>
    (!query || tenant.name.toLowerCase().includes(query.trim().toLowerCase())) &&
    (reason === 'All Reasons' || tenant.reason === reason) &&
    (plan === 'All Plans' || tenant.plan === plan) &&
    (status === 'All Statuses' || tenant.status === status)
  ), [tenants, query, reason, plan, status]);
  const filtersActive = Boolean(query || reason !== 'All Reasons' || plan !== 'All Plans' || status !== 'All Statuses');
  const clearFilters = () => { setQuery(''); setReason('All Reasons'); setPlan('All Plans'); setStatus('All Statuses'); };
  useEffect(() => { setVisibleCount(PAGE_SIZE); if (scrollBox.current) scrollBox.current.scrollTop = 0; }, [query, reason, plan, status]);
  useEffect(() => {
    const node = sentinel.current;
    const root = scrollBox.current;
    if (!node || !root || visibleCount >= filtered.length) return undefined;
    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) setVisibleCount(count => Math.min(count + PAGE_SIZE, filtered.length));
    }, { root, rootMargin: '100px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [visibleCount, filtered.length]);
  const visible = filtered.slice(0, visibleCount);
  const reactivate = tenant => { setTenants(previous => previous.filter(item => item.id !== tenant.id)); setReactivated(previous => [tenant.name, ...previous]); setSelected(null); };
  const contact = tenant => { window.location.href = `mailto:${tenant.email}?subject=${encodeURIComponent(`Regarding ${tenant.name} tenant account`)}`; };
  const exportCsv = () => {
    const rows = [['Tenant ID', 'Company Name', 'Plan', 'Reason', 'Suspended Date', 'Review Status'], ...filtered.map(tenant => [tenant.id, tenant.name, tenant.plan, tenant.reason, tenant.suspendedDate, tenant.status])];
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'suspended-tenants.csv'; anchor.click(); URL.revokeObjectURL(url);
  };
  if (selected) return <div className="st"><TenantDetails tenant={selected} onBack={() => setSelected(null)} onReactivate={reactivate} onContact={contact}/></div>;

  const pending = tenants.filter(tenant => tenant.status === 'Pending Review' || tenant.status === 'Under Review').slice(0, 7);
  return <div className="st">
    <div className="st-page-heading"><div><h1>Suspended Tenants</h1><p>Review suspended companies, investigate suspension reasons, and manage tenant account reinstatement.</p></div></div>
    <SummaryCards/>
    <SuspendedCharts/>
    <div className="st-content-grid">
      <section className="st-panel st-table-panel">
        <header className="st-table-heading"><div className="st-panel-heading"><span className="st-panel-icon"><Building2 size={16}/></span><h3>Suspended Tenant Accounts</h3><span className="st-result-count">{filtered.length} records</span></div>
          <div className="st-table-tools">
            <label className="st-search"><Search size={15}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by company..." aria-label="Search by company"/></label>
            <select value={reason} onChange={event => setReason(event.target.value)} aria-label="Filter by reason"><option>All Reasons</option>{REASONS.map(value => <option key={value}>{value}</option>)}</select>
            <select value={plan} onChange={event => setPlan(event.target.value)} aria-label="Filter by plan"><option>All Plans</option>{PLANS.map(value => <option key={value}>{value}</option>)}</select>
            <select value={status} onChange={event => setStatus(event.target.value)} aria-label="Filter by review status"><option>All Statuses</option>{STATUSES.map(value => <option key={value}>{value}</option>)}</select>
            <button className="st-btn st-btn-clear" onClick={clearFilters} disabled={!filtersActive}><X size={13}/> Clear Filters</button>
            <button className="st-btn st-btn-light st-export" onClick={exportCsv}><Download size={14}/> Export</button>
          </div>
        </header>
        <div className="st-table-scroll" ref={scrollBox}><table className="st-table"><thead><tr><th>#</th><th>Company Name</th><th>Subscription Plan</th><th>Suspension Reason</th><th>Suspended Date ↓</th><th>Review Status</th><th>Actions</th></tr></thead><tbody>
          {visible.map((tenant, index) => <tr key={tenant.id}><td>{index + 1}</td><td><b className="st-company-name">{tenant.name}</b><small>{tenant.id}</small></td><td><span className={`st-plan ${tenant.plan.toLowerCase()}`}>{tenant.plan}</span></td><td>{tenant.reason}</td><td>{fmtDate(tenant.suspendedDate)}</td><td><span className={`st-status ${statusClass(tenant.status)}`}>{tenant.status}</span></td><td><button className="st-view-btn" onClick={() => setSelected(tenant)}>View Details</button></td></tr>)}
          {visible.length === 0 && <tr><td colSpan="7" className="st-empty">No suspended tenants match your search or filters.</td></tr>}
        </tbody></table>{visibleCount < filtered.length && <div className="st-loading" ref={sentinel}><span className="st-spinner"/> Loading 12 more tenants…</div>}{visibleCount >= filtered.length && filtered.length > 0 && <div className="st-loading st-end">Showing all {filtered.length} matching tenants</div>}</div>
        <footer className="st-table-footer">Showing {visible.length} of {filtered.length} tenants</footer>
      </section>
      <section className="st-panel st-pending-panel"><header className="st-panel-heading"><span className="st-panel-icon"><ClipboardList size={16}/></span><h3>Top Pending Reviews</h3><span className="st-grow"/><span className="st-pending-count">{pending.length}</span></header>
        <p className="st-pending-intro">Accounts that need administrator attention.</p>
        <div className="st-review-list">{pending.map(tenant => <div className="st-review-row" key={tenant.id}><span className="st-review-dot"/><div className="st-review-copy"><b>{tenant.name}</b><small>{tenant.reason} · {tenant.suspendedDate.slice(0, 10)}</small></div><button onClick={() => setSelected(tenant)}>Review</button></div>)}</div>
        {pending.length === 0 && <div className="st-empty st-pending-empty">No pending reviews.</div>}
        <div className="st-pending-foot">Select Review to open the full tenant profile.</div>
      </section>
    </div>
    {reactivated.length > 0 && <p className="st-demo-note"><CheckCircle2 size={13}/> Recently reactivated in this demo: {reactivated.join(', ')}</p>}
  </div>;
}
