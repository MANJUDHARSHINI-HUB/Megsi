import {
  CalendarDays, ChevronDown, Download, Settings, Users, UserRound, ShieldCheck,
  BarChart3, AlertTriangle, Database, RotateCcw, Search, Lightbulb, MoreHorizontal,
  ChevronLeft, ChevronRight, CheckCircle2, X, Eye, Activity, ArrowLeft,
  Filter, TrendingUp, Building2
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../i18n/I18nContext.jsx';
import {
  Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts';
import {
  RESOURCE_OVERVIEW, TENANT_USAGE_DISTRIBUTION, USAGE_SUMMARY, USAGE_DEMO_MONTH_LABEL,
  USAGE_DEMO_MONTH, TENANT_USAGE, USAGE_ALERTS, RECOMMENDED_ACTIONS, DEMO_PLAN_LIMITS,
  getCappedProgress
} from '../data/usageData.js';
import './usage.css';

const number = (value) => Number(value || 0).toLocaleString('en-US');
const resourceLabel = { users: 'Users', guards: 'Guards', sites: 'Sites', storage: 'Storage' };
const statusTone = (status) => status === 'Critical' ? 'red' : status === 'Near Limit' ? 'orange' : 'green';
const resourceTone = (percentage) => percentage >= 95 ? 'red' : percentage >= 80 ? 'orange' : 'green';
const getResourceKey = (resource) => { const value = String(resource || '').toLowerCase(); if (value.includes('user')) return 'users'; if (value.includes('guard')) return 'guards'; if (value.includes('site')) return 'sites'; if (value.includes('storage')) return 'storage'; return value; };
const PAGE_SIZE = 8;
const PLAN_OPTIONS = ['all', 'Starter', 'Professional', 'Business', 'Enterprise'];
const STATUS_OPTIONS = ['all', 'Normal', 'Near Limit', 'Critical'];
const RESOURCE_OPTIONS = [
  { value: 'all', label: 'All resources' },
  { value: 'users', label: 'Users at 80%+' },
  { value: 'guards', label: 'Guards at 80%+' },
  { value: 'sites', label: 'Sites at 80%+' },
  { value: 'storage', label: 'Storage at 80%+' }
];
const KPI_CARDS = [
  { key: 'tenants', label: 'Total Tenants', value: USAGE_SUMMARY.totalTenants, caption: 'Across all subscription plans', icon: Users, tone: 'blue' },
  { key: 'users', label: 'Total Users', value: USAGE_SUMMARY.totalUsers, caption: 'Registered across tenants', icon: UserRound, tone: 'green' },
  { key: 'guards', label: 'Active Guards', value: USAGE_SUMMARY.totalGuards, caption: 'Currently registered', icon: ShieldCheck, tone: 'orange' },
  { key: 'near', label: 'Near Limit', value: USAGE_SUMMARY.nearLimit, caption: 'Tenants above 80% resource usage', icon: BarChart3, tone: 'purple' },
  { key: 'critical', label: 'Limit Exceeded', value: USAGE_SUMMARY.limitExceeded, caption: 'Tenants requiring attention', icon: AlertTriangle, tone: 'red' }
];

function SectionTitle({ icon: Icon, children, action, className = '' }) {
  return <div className={`ul-section-title ${className}`}>
    <span className="ul-section-icon"><Icon size={16} /></span>
    <h2>{children}</h2>
    {action && <div className="ul-section-action">{action}</div>}
  </div>;
}

function UsageProgress({ metric, resourceKey }) {
  const percentage = Number(metric?.percentage || 0);
  return <div className="ul-resource-cell">
    <div className="ul-resource-value">
      <span>{number(metric?.used)} / {number(metric?.limit)}{resourceKey === 'storage' ? ' GB' : ''}</span>
      <b>{percentage}%</b>
    </div>
    <div className="ul-progress-track" aria-label={`${resourceLabel[resourceKey]} usage ${percentage}%`}>
      <span className={resourceTone(percentage)} style={{ width: `${getCappedProgress(percentage)}%` }} />
    </div>
  </div>;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  return <div className="ul-chart-tooltip">
    <strong>{label || item?.resource || item?.label}</strong>
    {item?.currentUsage !== undefined && <div>Used: {number(item.currentUsage)}</div>}
    {item?.availableLimit !== undefined && <div>Limit: {number(item.availableLimit)}</div>}
    {item?.currentPct !== undefined && <small>{Math.round(item.currentPct)}% of configured limit</small>}
    {item?.tenants !== undefined && <div>{number(item.tenants)} tenants · {item.percentage}%</div>}
  </div>;
}

function ResourceUsageChart({ monthFactor, selectedMonth, onDrilldown }) {
  const [selectedResource, setSelectedResource] = useState('all');
  const resources = RESOURCE_OVERVIEW.map((item) => {
    const currentUsage = Math.max(0, Math.round(Number(item.currentUsage || 0) * monthFactor));
    const limit = Number(item.availableLimit || 0);
    return { ...item, currentUsage, currentPct: limit ? (currentUsage / limit) * 100 : 0 };
  });
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(`${selectedMonth}-01T12:00:00`);
    date.setMonth(date.getMonth() - (5 - index));
    return date.toLocaleDateString('en-US', { month: 'short' });
  });
  const trendData = months.map((month, index) => {
    const row = { month };
    resources.forEach((resource, resourceIndex) => {
      const key = getResourceKey(resource.resource);
      const currentPct = Number(resource.currentPct || 0);
      const trend = 0.78 + index * 0.044 + Math.sin((index + 1) * (resourceIndex + 1)) * 0.035;
      row[key] = Math.max(0, Math.min(100, Math.round(currentPct * trend)));
    });
    return row;
  });
  const visibleResources = selectedResource === 'all' ? resources : resources.filter((item) => getResourceKey(item.resource) === selectedResource);
  const colors = { users: '#0758F9', guards: '#0D9B76', sites: '#E59B20', storage: '#8B5CF6' };
  const drillResource = (key) => {
    setSelectedResource(key);
    if (key !== 'all') {
      const item = resources.find((resource) => getResourceKey(resource.resource) === key);
      if (item) onDrilldown({ type: 'resource', title: `${item.resource} usage`, resourceKey: key });
    } else onDrilldown(null);
  };
  return <div className="ul-chart-content">
    <div className="ul-chart-controls">
      <label>View resource <select aria-label="Choose resource for line chart" value={selectedResource} onChange={(e) => drillResource(e.target.value)}>
        <option value="all">All resources</option>{resources.map((item) => <option key={item.resource} value={getResourceKey(item.resource)}>{item.resource}</option>)}
      </select></label>
      <span className="ul-chart-help">Select a line or resource to filter tenants</span>
    </div>
    <div className="ul-line-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trendData} margin={{ top: 12, right: 12, left: -12, bottom: 2 }}>
          <CartesianGrid stroke="#E4ECF5" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#465477' }} tickLine={false} axisLine={{ stroke: '#D9E3EF' }} />
          <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tick={{ fontSize: 10, fill: '#465477' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={38} />
          <Tooltip formatter={(value, name) => [`${value}%`, resourceLabel[name] || name]} />
          {visibleResources.map((item) => {
            const key = getResourceKey(item.resource);
            return <Line key={key} type="monotone" dataKey={key} name={resourceLabel[key]} stroke={colors[key] || '#0758F9'} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6, cursor: 'pointer', onClick: () => { setSelectedResource(key); onDrilldown({ type: 'resource', title: `${item.resource} usage`, resourceKey: key }); } }} />;
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="ul-chart-drill-actions" aria-label="Drill down by resource">
      <span>Filter tenants:</span>
      <button type="button" className={selectedResource === 'all' ? 'active' : ''} onClick={() => drillResource('all')}>All resources</button>
      {resources.map((item) => { const key = getResourceKey(item.resource); return <button type="button" className={selectedResource === key ? 'active' : ''} key={key} onClick={() => drillResource(key)}>{item.resource}</button>; })}
    </div>
  </div>;
}

function TenantDistributionChart({ selectedMonth, onDrilldown }) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const statusKeys = ['Normal', 'Near Limit', 'Critical'];
  const colors = { Normal: '#0D9B76', 'Near Limit': '#E59B20', Critical: '#DC4545' };
  const baseCounts = Object.fromEntries(TENANT_USAGE_DISTRIBUTION.map((item) => [item.label, Number(item.tenants || 0)]));
  const months = Array.from({ length: 6 }, (_, index) => { const date = new Date(`${selectedMonth}-01T12:00:00`); date.setMonth(date.getMonth() - (5 - index)); return date.toLocaleDateString('en-US', { month: 'short' }); });
  const trendData = months.map((month, index) => {
    const row = { month };
    statusKeys.forEach((status, statusIndex) => {
      const base = baseCounts[status] || 0;
      row[status] = Math.max(0, Math.round(base * (0.78 + index * 0.044 + Math.sin((index + 1) * (statusIndex + 1)) * 0.035)));
    });
    return row;
  });
  const visibleStatuses = selectedStatus === 'all' ? statusKeys : [selectedStatus];
  const chooseStatus = (status) => {
    setSelectedStatus(status);
    onDrilldown(status === 'all' ? null : { type: 'distribution', title: `${status} tenants`, status });
  };
  return <div className="ul-chart-content">
    <div className="ul-chart-controls">
      <label>View status <select aria-label="Choose tenant status for area chart" value={selectedStatus} onChange={(e) => chooseStatus(e.target.value)}>
        <option value="all">All statuses</option>{statusKeys.map((status) => <option key={status} value={status}>{status}</option>)}
      </select></label>
      <span className="ul-chart-help">Select a status to filter the tenant table</span>
    </div>
    <div className="ul-area-chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trendData} margin={{ top: 12, right: 12, left: -12, bottom: 2 }}>
          <CartesianGrid stroke="#E4ECF5" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#465477' }} tickLine={false} axisLine={{ stroke: '#D9E3EF' }} />
          <YAxis tick={{ fontSize: 10, fill: '#465477' }} tickLine={false} axisLine={false} allowDecimals={false} width={38} />
          <Tooltip formatter={(value, name) => [value, name]} />
          {visibleStatuses.map((status) => <Area key={status} type="monotone" dataKey={status} name={status} stroke={colors[status]} fill={colors[status]} fillOpacity={0.16} strokeWidth={2.5} activeDot={{ r: 5, cursor: 'pointer', onClick: () => chooseStatus(status) }} />)}
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="ul-chart-drill-actions" aria-label="Drill down by tenant status">
      <span>Filter tenants:</span>
      <button type="button" className={selectedStatus === 'all' ? 'active' : ''} onClick={() => chooseStatus('all')}>All statuses</button>
      {statusKeys.map((status) => <button type="button" className={selectedStatus === status ? 'active' : ''} key={status} onClick={() => chooseStatus(status)}>{status}</button>)}
    </div>
  </div>;
}

function TenantUsageTable({ onSelectTenant, externalFilter }) {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);

  const filtered = useMemo(() => TENANT_USAGE.filter((tenant) => {
    const matchesSearch = tenant.companyName.toLowerCase().includes(search.trim().toLowerCase());
    const matchesPlan = planFilter === 'all' || tenant.plan === planFilter;
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    const matchesResource = resourceFilter === 'all' || Number(tenant.resources?.[resourceFilter]?.percentage || 0) >= 80;
    const matchesExternalStatus = !externalFilter?.status || tenant.status === externalFilter.status;
    const matchesExternalResource = !externalFilter?.resourceKey || Number(tenant.resources?.[externalFilter.resourceKey]?.percentage || 0) >= 80;
    return matchesSearch && matchesPlan && matchesStatus && matchesResource && matchesExternalStatus && matchesExternalResource;
  }), [search, planFilter, statusFilter, resourceFilter, externalFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const resetFilters = () => { setSearch(''); setPlanFilter('all'); setStatusFilter('all'); setResourceFilter('all'); setPage(1); setOpenMenu(null); };
  const change = (setter) => (value) => { setter(value); setPage(1); setOpenMenu(null); };

  return <>
    {externalFilter && <div className="ul-active-drill-filter">
      <span><Filter size={14} /> Chart drill-down: <strong>{externalFilter.status || resourceLabel[externalFilter.resourceKey] || externalFilter.title}</strong></span>
      <button type="button" onClick={externalFilter.clear}>Clear chart filter <X size={13} /></button>
    </div>}
    <div className="ul-table-toolbar">
      <label className="ul-table-search"><Search size={15} /><input aria-label="Search companies" placeholder="Search tenants or companies…" value={search} onChange={(e) => change(setSearch)(e.target.value)} /></label>
      <select aria-label="Filter by plan" value={planFilter} onChange={(e) => change(setPlanFilter)(e.target.value)}>{PLAN_OPTIONS.map((p) => <option key={p} value={p}>{p === 'all' ? 'All plans' : p}</option>)}</select>
      <select aria-label="Filter by status" value={statusFilter} onChange={(e) => change(setStatusFilter)(e.target.value)}>{STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s}</option>)}</select>
      <select aria-label="Filter by resource" value={resourceFilter} onChange={(e) => change(setResourceFilter)(e.target.value)}>{RESOURCE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select>
      <button type="button" className="ul-reset-btn" onClick={resetFilters}><RotateCcw size={13} /> Reset</button>
    </div>
    {resourceFilter !== 'all' && <p className="ul-filter-hint">Showing tenants whose {resourceLabel[resourceFilter].toLowerCase()} usage is at least 80%.</p>}
    <div className="ul-table-scroll">
      <table className="ul-usage-table">
        <thead><tr><th className="ul-col-number">#</th><th className="ul-col-company">Company</th><th>Plan</th><th>Users</th><th>Guards</th><th>Sites</th><th>Storage</th><th>Overall</th><th>Status</th><th className="ul-col-actions">Actions</th></tr></thead>
        <tbody>
          {visibleRows.map((tenant, index) => <tr key={tenant.id}>
            <td className="ul-row-number">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
            <td><div className="ul-company-cell"><span className="ul-company-avatar">{tenant.companyName.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()}</span><span title={tenant.companyName}>{tenant.companyName}</span></div></td>
            <td><span className={`ul-plan-pill ${tenant.plan.toLowerCase()}`}>{tenant.plan}</span></td>
            {['users', 'guards', 'sites', 'storage'].map((key) => <td key={key}><UsageProgress metric={tenant.resources[key]} resourceKey={key} /></td>)}
            <td><div className="ul-resource-cell ul-overall-cell"><div className="ul-resource-value"><b>{tenant.overallUsagePct}%</b></div><div className="ul-progress-track"><span className={resourceTone(tenant.overallUsagePct)} style={{ width: `${getCappedProgress(tenant.overallUsagePct)}%` }} /></div></div></td>
            <td><span className={`ul-status-pill ${statusTone(tenant.status)}`}>{tenant.status === 'Normal' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}{tenant.status}</span></td>
            <td className="ul-row-actions"><div className="ul-row-menu-wrap">
              <button type="button" className="ul-dots-btn" aria-label={`Actions for ${tenant.companyName}`} aria-expanded={openMenu === tenant.id} onClick={() => setOpenMenu(openMenu === tenant.id ? null : tenant.id)}><MoreHorizontal size={17} /></button>
              {openMenu === tenant.id && <div className="ul-row-menu"><button type="button" onClick={() => { onSelectTenant(tenant); setOpenMenu(null); }}><Eye size={13} /> View details</button><button type="button" onClick={() => { onSelectTenant(null); setOpenMenu(null); window.dispatchEvent(new CustomEvent('usage-review-tenant', { detail: tenant })); }}><Activity size={13} /> Review usage</button></div>}
            </div></td>
          </tr>)}
          {!visibleRows.length && <tr><td colSpan="10"><div className="ul-table-empty"><Search size={22} /><strong>No tenants match these filters</strong><span>Adjust your search or clear filters.</span><button type="button" onClick={resetFilters}>Reset filters</button></div></td></tr>}
        </tbody>
      </table>
    </div>
    <div className="ul-table-footer"><span>Showing <strong>{filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong> tenants</span><div className="ul-pagination"><button type="button" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><ChevronLeft size={15} /></button><span>Page {currentPage} of {pageCount}</span><button type="button" aria-label="Next page" disabled={currentPage >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}><ChevronRight size={15} /></button></div></div>
  </>;
}

function downloadCsv(rows) {
  const headers = ['Company Name', 'Plan', 'Users Used', 'Users Limit', 'Guards Used', 'Guards Limit', 'Sites Used', 'Sites Limit', 'Storage GB Used', 'Storage GB Limit', 'Overall Usage %', 'Status'];
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = [headers, ...rows.map((t) => [t.companyName, t.plan, t.users.used, t.users.limit, t.guards.used, t.guards.limit, t.sites.used, t.sites.limit, t.storage.used, t.storage.limit, t.overallUsagePct, t.status])];
  const blob = new Blob([lines.map((row) => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = 'usage-limits-report.csv'; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}

function TenantDetailPanel({ tenant, onClose }) {
  if (!tenant) return null;
  return <div className="ul-side-backdrop" role="presentation" onClick={onClose}>
    <aside className="ul-side-panel" role="dialog" aria-modal="true" aria-label={`${tenant.companyName} usage details`} onClick={(e) => e.stopPropagation()}>
      <button className="ul-detail-close" type="button" aria-label="Close details" onClick={onClose}><X size={17} /></button>
      <span className="ul-detail-eyebrow">Tenant usage profile</span><h3>{tenant.companyName}</h3>
      <p>{tenant.plan} plan · {tenant.companyStatus || 'Active'} tenant</p>
      <div className={`ul-tenant-health ${statusTone(tenant.status)}`}><span>{tenant.status}</span><strong>{tenant.overallUsagePct}%</strong><small>overall usage</small></div>
      <div className="ul-side-detail-list">{Object.entries(tenant.resources).map(([key, metric]) => <div key={key}>
        <span>{resourceLabel[key]}</span><strong>{number(metric.used)} / {number(metric.limit)}{key === 'storage' ? ' GB' : ''}</strong>
        <div className="ul-progress-track"><span className={resourceTone(metric.percentage)} style={{ width: `${getCappedProgress(metric.percentage)}%` }} /></div>
        <small>{metric.percentage}% used</small>
      </div>)}</div>
      <button type="button" className="ul-btn ul-btn-primary ul-detail-done" onClick={onClose}>Done</button>
    </aside>
  </div>;
}

function DetailPanel({ detail, onClose, onChooseTenant }) {
  if (!detail) return null;
  let tenants = TENANT_USAGE;
  if (detail.status) tenants = tenants.filter((t) => t.status === detail.status);
  if (detail.resourceKey) tenants = tenants.filter((t) => Number(t.resources?.[detail.resourceKey]?.percentage || 0) >= 80);
  if (detail.metricKey === 'critical') tenants = tenants.filter((t) => t.status === 'Critical');
  if (detail.metricKey === 'near') tenants = tenants.filter((t) => t.status === 'Near Limit');
  if (detail.metricKey === 'tenants') tenants = TENANT_USAGE;
  if (detail.metricKey === 'users') tenants = [...TENANT_USAGE].sort((a, b) => b.users.used - a.users.used).slice(0, 8);
  if (detail.metricKey === 'guards') tenants = [...TENANT_USAGE].sort((a, b) => b.guards.used - a.guards.used).slice(0, 8);
  return <div className="ul-side-backdrop" role="presentation" onClick={onClose}>
    <aside className="ul-side-panel" role="dialog" aria-modal="true" aria-label={detail.title} onClick={(e) => e.stopPropagation()}>
      <button className="ul-detail-close" type="button" aria-label="Close details" onClick={onClose}><X size={17} /></button>
      <span className="ul-detail-eyebrow">Interactive drill-down</span><h3>{detail.title}</h3><p>{detail.details}</p>
      {detail.percentage !== undefined && <div className="ul-side-progress"><div><span>Usage / distribution</span><b>{detail.percentage}%</b></div><span><i style={{ width: `${Math.min(100, Math.max(0, detail.percentage))}%` }} /></span></div>}
      <div className="ul-drill-list-head"><strong>Related tenants</strong><span>{tenants.length} records</span></div>
      <div className="ul-drill-tenant-list">{tenants.slice(0, 12).map((tenant) => <button type="button" key={tenant.id} onClick={() => onChooseTenant(tenant)}>
        <span className="ul-company-avatar">{tenant.companyName.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()}</span>
        <span className="ul-drill-tenant-copy"><strong>{tenant.companyName}</strong><small>{tenant.plan} · {tenant.overallUsagePct}% used</small></span>
        <span className={`ul-status-pill ${statusTone(tenant.status)}`}>{tenant.status}</span>
      </button>)}
      {!tenants.length && <p className="ul-no-drill-results">No matching tenants in the demo dataset.</p>}</div>
      <button type="button" className="ul-btn ul-btn-outline ul-detail-done" onClick={onClose}><ArrowLeft size={14} /> Back to dashboard</button>
    </aside>
  </div>;
}

export default function UsageLimits() {
  const { t, lang } = useI18n();
  const [selectedMonth, setSelectedMonth] = useState(USAGE_DEMO_MONTH);
  const [monthOpen, setMonthOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(String(Number(USAGE_DEMO_MONTH.slice(5, 7))));
  const [calendarYear, setCalendarYear] = useState(USAGE_DEMO_MONTH.slice(0, 4));
  const [tenantDetail, setTenantDetail] = useState(null);
  const [detail, setDetail] = useState(null);
  const [reviewTenant, setReviewTenant] = useState(null);
  const [drillFilter, setDrillFilter] = useState(null);
  const [activeAlert, setActiveAlert] = useState(null);
  const [expandedAlerts, setExpandedAlerts] = useState(false);
  const [expandedRecommendations, setExpandedRecommendations] = useState(false);

  useEffect(() => {
    const handleReview = (event) => setReviewTenant(event.detail || null);
    window.addEventListener('usage-review-tenant', handleReview);
    return () => window.removeEventListener('usage-review-tenant', handleReview);
  }, []);

  const monthFactor = selectedMonth === USAGE_DEMO_MONTH ? 1 : 1 + ((((Number(selectedMonth.slice(0, 4)) * 12 + Number(selectedMonth.slice(5, 7))) % 7) - 3) * 0.025);
  const selectedMonthLabel = new Date(`${selectedMonth}-01T12:00:00`).toLocaleDateString(lang === 'fr' ? 'fr-FR' : lang === 'de' ? 'de-DE' : 'en-US', { month: 'long', year: 'numeric' });
  const kpiValue = (key, value) => selectedMonth === USAGE_DEMO_MONTH || key === 'tenants' ? number(value) : ['near', 'critical'].includes(key) ? String(Math.max(0, Math.round(Number(value) * monthFactor))) : number(Number(value) * monthFactor);
  const openKpi = (card) => setDetail({ type: 'kpi', title: card.label, value: kpiValue(card.key, card.value), details: card.caption, metricKey: card.key });

  const applyChartDrilldown = (next) => {
    if (!next) { setDrillFilter(null); return; }
    setDrillFilter({ ...next, clear: () => setDrillFilter(null) });
  };

  const exportCurrent = () => {
    let rows = TENANT_USAGE;
    if (drillFilter?.status) rows = rows.filter((t) => t.status === drillFilter.status);
    if (drillFilter?.resourceKey) rows = rows.filter((t) => Number(t.resources?.[drillFilter.resourceKey]?.percentage || 0) >= 80);
    downloadCsv(rows);
  };

  const alerts = expandedAlerts ? USAGE_ALERTS : USAGE_ALERTS.slice(0, 3);
  const recommendations = expandedRecommendations ? RECOMMENDED_ACTIONS : RECOMMENDED_ACTIONS.slice(0, 3);

  return <div className="ul">
    <header className="ul-page-head">
      <div className="ul-heading-copy"><div className="ul-title-eyebrow"><Activity size={15} /> PLATFORM MONITORING</div>
        <h1>{t('usage.title')}</h1><p>{t('usage.subtitle')}</p>
      </div>
      <div className="ul-head-actions">
        <div className="ul-month-wrap"><button className="ul-btn ul-btn-month" type="button" aria-expanded={monthOpen} onClick={() => setMonthOpen((v) => !v)}><CalendarDays size={16} /><span>{selectedMonthLabel}</span><ChevronDown size={15} /></button>
          {monthOpen && <div className="ul-month-menu"><label htmlFor="ul-calendar-month">Month and year</label><div className="ul-calendar-fields"><select id="ul-calendar-month" aria-label="Select month" value={calendarMonth} onChange={(e) => { const month = e.target.value; setCalendarMonth(month); setSelectedMonth(`${calendarYear}-${month.padStart(2, '0')}`); }}><option value="1">January</option><option value="2">February</option><option value="3">March</option><option value="4">April</option><option value="5">May</option><option value="6">June</option><option value="7">July</option><option value="8">August</option><option value="9">September</option><option value="10">October</option><option value="11">November</option><option value="12">December</option></select><input id="ul-calendar-year" aria-label="Type year" type="number" min="2000" max="2100" inputMode="numeric" value={calendarYear} onChange={(e) => { const year = e.target.value; setCalendarYear(year); if (/^\d{4}$/.test(year) && Number(year) >= 2000 && Number(year) <= 2100) setSelectedMonth(`${year}-${calendarMonth.padStart(2, '0')}`); }} /></div><small>Choose a month and type a year.</small></div>}
        </div>
        <button className="ul-btn ul-btn-primary" type="button" onClick={exportCurrent}><Download size={16} />{t('usage.export')}</button>
        <button className="ul-btn ul-btn-outline" type="button" onClick={() => setDetail({ type: 'limits', title: 'Plan limits', details: 'Configured demonstration limits by subscription plan.' })}><Settings size={16} />{t('usage.manage')}</button>
      </div>
    </header>


    <div className="ul-kpis">{KPI_CARDS.map((card) => {
      const Icon = card.icon;
      return <button type="button" className={`ul-card ul-kpi ul-kpi-clickable ${card.key === 'critical' ? 'ul-kpi-critical' : ''}`} key={card.key} onClick={() => openKpi(card)} aria-label={`View ${card.label} details`}>
        <div className={`ul-kpi-icon ${card.tone}`}><Icon size={23} strokeWidth={2.2} /></div>
        <div className="ul-kpi-main"><span className="ul-kpi-label">{t(`usage.kpi.${card.key}`)}</span><strong>{kpiValue(card.key, card.value)}</strong></div>
        <p>{t(`usage.kpi.${card.key}.caption`)}</p><span className="ul-kpi-hint">View breakdown <ChevronRight size={12} /></span>
      </button>;
    })}</div>

    <div className="ul-chart-grid">
      <section className="ul-card ul-resource-card"><SectionTitle icon={TrendingUp}>Resource utilization trend</SectionTitle><ResourceUsageChart monthFactor={monthFactor} selectedMonth={selectedMonth} onDrilldown={applyChartDrilldown} /></section>
      <section className="ul-card ul-distribution-card"><SectionTitle icon={Activity}>Tenant status trend</SectionTitle><TenantDistributionChart selectedMonth={selectedMonth} onDrilldown={applyChartDrilldown} /></section>
    </div>

    <section className="ul-card ul-table-card"><SectionTitle icon={Database} action={<span className="ul-record-count"><Building2 size={13} /> {TENANT_USAGE.length} tenants</span>}>{t('usage.table')}</SectionTitle>
      <TenantUsageTable onSelectTenant={setTenantDetail} externalFilter={drillFilter ? { ...drillFilter, clear: () => setDrillFilter(null) } : null} />
    </section>

    <div className="ul-bottom-grid">
      <section className="ul-card ul-alerts-card"><SectionTitle icon={AlertTriangle} className="ul-alert-title" action={<button type="button" className="ul-small-btn" onClick={() => setExpandedAlerts((v) => !v)}>{expandedAlerts ? 'Show less' : 'View all'}</button>}>
        Usage alerts <span className="ul-alert-count">{USAGE_ALERTS.filter((a) => a.severity.toLowerCase() === 'critical').length} critical</span>
      </SectionTitle>
        <div className="ul-action-list">{alerts.map((alert) => <article className={`ul-alert-row ${alert.severity.toLowerCase() === 'critical' ? 'is-critical' : 'is-warning'}`} key={alert.id}>
          <span className={`ul-alert-icon ${alert.severity.toLowerCase()}`}><AlertTriangle size={17} /></span>
          <div className="ul-alert-copy"><strong>{alert.companyName}</strong><span>{alert.message}</span></div>
          <span className={`ul-alert-badge ${alert.severity.toLowerCase()}`}>{alert.severity}</span><time>{alert.time}</time>
          <button className="ul-text-action" type="button" onClick={() => { setActiveAlert(alert); setTenantDetail(TENANT_USAGE.find((tenant) => tenant.id === alert.companyId) || TENANT_USAGE[0]); }}>Review <ChevronRight size={13} /></button>
        </article>)}
          {!alerts.length && <p className="ul-list-placeholder">No usage alerts.</p>}
        </div>
      </section>
      <section className="ul-card"><SectionTitle icon={Lightbulb} action={<button type="button" className="ul-small-btn" onClick={() => setExpandedRecommendations((v) => !v)}>{expandedRecommendations ? 'Show less' : 'View all'}</button>}>{t('usage.recommendations')}</SectionTitle>
        <div className="ul-action-list">{recommendations.map((item) => <article className="ul-recommend-row" key={item.id}>
          <span className="ul-recommend-icon"><Lightbulb size={16} /></span><div className="ul-recommend-copy"><strong>{item.title}</strong><span>{item.description}</span></div>
          <button className="ul-btn ul-btn-outline ul-review-btn" type="button" onClick={() => item.companyId ? setTenantDetail(TENANT_USAGE.find((tenant) => tenant.id === item.companyId) || null) : setDetail({ type: 'recommendation', title: item.title, details: item.description })}>Review</button>
        </article>)}</div>
      </section>
    </div>

    {detail?.type === 'limits' && <div className="ul-side-backdrop" role="presentation" onClick={() => setDetail(null)}><aside className="ul-side-panel" role="dialog" aria-modal="true" aria-label="Plan limits" onClick={(e) => e.stopPropagation()}>
      <button className="ul-detail-close" type="button" aria-label="Close" onClick={() => setDetail(null)}><X size={17} /></button><span className="ul-detail-eyebrow">Configuration reference</span><h3>Plan limits</h3><p>Demo plan limits used by the Usage &amp; Limits dashboard.</p>
      <div className="ul-limits-table"><div className="head"><span>Plan</span><span>Guards</span><span>Storage</span></div>{Object.entries(DEMO_PLAN_LIMITS).map(([plan, limits]) => <div key={plan}><strong>{plan}</strong><span>{number(limits.guards)}</span><span>{number(limits.storageGB)} GB</span></div>)}</div>
      <p className="ul-inline-note">These values are illustrative and do not modify tenant plans.</p><button className="ul-btn ul-btn-outline ul-detail-done" type="button" onClick={() => setDetail(null)}>Back to dashboard</button>
    </aside></div>}
    {detail && detail.type !== 'limits' && <DetailPanel detail={detail} onClose={() => setDetail(null)} onChooseTenant={(tenant) => { setDetail(null); setTenantDetail(tenant); }} />}
    {reviewTenant && <div className="ul-side-backdrop" role="presentation" onClick={() => setReviewTenant(null)}><aside className="ul-side-panel" role="dialog" aria-modal="true" aria-label={`${reviewTenant.companyName} usage review`} onClick={(e) => e.stopPropagation()}>
      <button className="ul-detail-close" type="button" aria-label="Close usage review" onClick={() => setReviewTenant(null)}><X size={17} /></button>
      <span className="ul-detail-eyebrow">Usage review</span><h3>{reviewTenant.companyName}</h3><p>Resource-by-resource usage review with thresholds and remaining capacity.</p>
      <div className={`ul-tenant-health ${statusTone(reviewTenant.status)}`}><span>{reviewTenant.status} status</span><strong>{reviewTenant.overallUsagePct}%</strong><small>overall resource usage</small></div>
      <div className="ul-side-detail-list">{Object.entries(reviewTenant.resources).map(([key, metric]) => <div key={key} className={Number(metric.percentage) >= 95 ? 'ul-review-critical' : Number(metric.percentage) >= 80 ? 'ul-review-warning' : ''}>
        <span>{resourceLabel[key]} utilization</span><strong>{number(metric.used)} / {number(metric.limit)}{key === 'storage' ? ' GB' : ''} · {metric.percentage}%</strong>
        <div className="ul-progress-track"><span className={resourceTone(metric.percentage)} style={{ width: `${getCappedProgress(metric.percentage)}%` }} /></div>
        <small>{Number(metric.limit) - Number(metric.used) >= 0 ? `${number(Number(metric.limit) - Number(metric.used))}${key === 'storage' ? ' GB' : ''} remaining` : `${number(Number(metric.used) - Number(metric.limit))}${key === 'storage' ? ' GB' : ''} over limit`}</small>
      </div>)}</div>
      <div className="ul-review-next-step"><strong>Recommended next step</strong><span>{reviewTenant.status === 'Critical' ? 'Contact this tenant and review plan capacity immediately.' : reviewTenant.status === 'Near Limit' ? 'Monitor this tenant and consider a plan-limit review.' : 'No immediate action required. Continue routine monitoring.'}</span></div>
      <button type="button" className="ul-btn ul-btn-outline ul-detail-done" onClick={() => setReviewTenant(null)}><ArrowLeft size={14} /> Back to tenant list</button>
    </aside></div>}
    <TenantDetailPanel tenant={tenantDetail} onClose={() => { setTenantDetail(null); setActiveAlert(null); }} />
  </div>;
}
