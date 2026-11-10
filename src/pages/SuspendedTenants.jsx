import { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, CheckCircle2, ClipboardList, Download, Search, X } from 'lucide-react';
import SuspendedCharts, { SummaryCards } from './suspended/SuspendedCharts.jsx';
import TenantDetailsPage from './suspended/TenantDetailsPage.jsx';
import { REASONS, PLANS, STATUSES } from '../data/suspendedData.js';
import './suspended-tenants.css';

const PAGE_SIZE = 12;
const fmtDate = value => value ? new Date(value.replace(' ', 'T')).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const statusClass = value => ({ 'Pending Review': 'pending', 'Under Review': 'review', Critical: 'critical', 'Eligible for Reactivation': 'eligible', Rejected: 'rejected' }[value] || 'pending');

export default function SuspendedTenants({ store, toast }) {
  // Tenants come from the shared store created in App.jsx, so review / reactivation / suspension changes stay consistent.
  const tenants = store.tenants;
  const reactivatedTenants = store.reactivatedTenants || [];
  const [query, setQuery] = useState('');
  const [reason, setReason] = useState('All Reasons');
  const [plan, setPlan] = useState('All Plans');
  const [status, setStatus] = useState('All Statuses');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState(null); // { id, review } — which tenant's details page is open
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
  const openTenant = (tenant, review = false) => setSelected({ id: tenant.id, review });
  const selectedTenant = selected ? (tenants.find(t => t.id === selected.id) || reactivatedTenants.find(t => t.id === selected.id)) : null;
  const exportCsv = () => {
    const rows = [['Tenant ID', 'Company Name', 'Plan', 'Reason', 'Suspended Date', 'Review Status'], ...filtered.map(tenant => [tenant.id, tenant.name, tenant.plan, tenant.reason, tenant.suspendedDate, tenant.status])];
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'suspended-tenants.csv'; anchor.click(); URL.revokeObjectURL(url);
  };
  if (selectedTenant) return <div className="st"><TenantDetailsPage key={selected.id} tenant={selectedTenant} store={store} toast={toast} openReview={selected.review} onBack={() => setSelected(null)}/></div>;

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
          {visible.map((tenant, index) => <tr key={tenant.id}><td>{index + 1}</td><td><b className="st-company-name">{tenant.name}</b><small>{tenant.id}</small></td><td><span className={`st-plan ${tenant.plan.toLowerCase()}`}>{tenant.plan}</span></td><td>{tenant.reason}</td><td>{fmtDate(tenant.suspendedDate)}</td><td><span className={`st-status ${statusClass(tenant.status)}`}>{tenant.status}</span></td><td><button className="st-view-btn" onClick={() => openTenant(tenant)}>View Details</button></td></tr>)}
          {visible.length === 0 && <tr><td colSpan="7" className="st-empty">No suspended tenants match your search or filters.</td></tr>}
        </tbody></table>{visibleCount < filtered.length && <div className="st-loading" ref={sentinel}><span className="st-spinner"/> Loading 12 more tenants…</div>}{visibleCount >= filtered.length && filtered.length > 0 && <div className="st-loading st-end">Showing all {filtered.length} matching tenants</div>}</div>
        <footer className="st-table-footer">Showing {visible.length} of {filtered.length} tenants</footer>
      </section>
      <section className="st-panel st-pending-panel"><header className="st-panel-heading"><span className="st-panel-icon"><ClipboardList size={16}/></span><h3>Top Pending Reviews</h3><span className="st-grow"/><span className="st-pending-count">{pending.length}</span></header>
        <p className="st-pending-intro">Accounts that need administrator attention.</p>
        <div className="st-review-list">{pending.map(tenant => <div className="st-review-row" key={tenant.id}><span className="st-review-dot"/><div className="st-review-copy"><b>{tenant.name}</b><small>{tenant.reason} · {tenant.suspendedDate.slice(0, 10)}</small></div><button onClick={() => openTenant(tenant, true)}>Review</button></div>)}</div>
        {pending.length === 0 && <div className="st-empty st-pending-empty">No pending reviews.</div>}
        <div className="st-pending-foot">Select Review to open the tenant and record a review decision.</div>
      </section>
    </div>
    {reactivatedTenants.length > 0 && <p className="st-demo-note"><CheckCircle2 size={13}/> Recently reactivated in this demo: {reactivatedTenants.map(t => t.name).join(', ')}</p>}
  </div>;
}
