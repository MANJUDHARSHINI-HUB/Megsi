import { CalendarDays, ChevronDown, Download, Settings, Users, UserRound, ShieldCheck, BarChart3, AlertTriangle, Database, RotateCcw, Search, Lightbulb, MoreHorizontal, ChevronLeft, ChevronRight, CheckCircle2, X, Eye, Activity } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RESOURCE_OVERVIEW, TENANT_USAGE_DISTRIBUTION, USAGE_SUMMARY, USAGE_DEMO_MONTH_LABEL, USAGE_DEMO_MONTH, TENANT_USAGE, USAGE_ALERTS, RECOMMENDED_ACTIONS, DEMO_PLAN_LIMITS, getCappedProgress } from '../data/usageData.js';
import './usage.css';

const KPI_CARDS = [
  { key: 'tenants', label: 'Total Tenants', value: USAGE_SUMMARY.totalTenants.toLocaleString('en-US'), caption: 'Across all subscription plans', icon: Users, tone: 'blue' },
  { key: 'users', label: 'Total Users', value: USAGE_SUMMARY.totalUsers.toLocaleString('en-US'), caption: 'Registered across tenants', icon: UserRound, tone: 'green' },
  { key: 'guards', label: 'Active Guards', value: USAGE_SUMMARY.totalGuards.toLocaleString('en-US'), caption: 'Currently registered', icon: ShieldCheck, tone: 'orange' },
  { key: 'near', label: 'Near Limit', value: String(USAGE_SUMMARY.nearLimit), caption: 'Tenants above 80% resource usage', icon: BarChart3, tone: 'purple' },
  { key: 'critical', label: 'Limit Exceeded', value: String(USAGE_SUMMARY.limitExceeded), caption: 'Tenants requiring attention', icon: AlertTriangle, tone: 'red' },
];

function SectionTitle({ icon: Icon, children, action }) {
  return <div className="ul-section-title"><span className="ul-section-icon"><Icon size={16} /></span><h2>{children}</h2>{action && <div className="ul-section-action">{action}</div>}</div>;
}

function PlaceholderCard({ title, icon: Icon, className = '', children }) {
  return <section className={`ul-card ${className}`}><SectionTitle icon={Icon}>{title}</SectionTitle>{children || <div className="ul-placeholder">Visualization and data table will be added in the next implementation stages.</div>}</section>;
}

const chartAxis = { fontSize: 10, fill: '#465477' };
const number = (value) => Number(value).toLocaleString('en-US');

function ResourceValueLabel({ x, y, width, index, dataKey, payload }) {
  const item = payload || RESOURCE_OVERVIEW[index];
  if (!item) return null;
  const value = dataKey === 'currentPct' ? item.currentUsage : item.availableLimit;
  return <text x={x + width / 2} y={y - 5} textAnchor="middle" fill="#101B4D" fontSize={9} fontWeight={600}>{number(value)}</text>;
}


const RESOURCE_OPTIONS = [
  { value: 'all', label: 'All Resources' },
  { value: 'users', label: 'Users (80%+)' },
  { value: 'guards', label: 'Guards (80%+)' },
  { value: 'sites', label: 'Sites (80%+)' },
  { value: 'storage', label: 'Storage (80%+)' },
];
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Usage Statuses' },
  { value: 'Normal', label: 'Normal' },
  { value: 'Near Limit', label: 'Near Limit' },
  { value: 'Critical', label: 'Critical' },
];
const PLAN_OPTIONS = ['all', 'Starter', 'Professional', 'Business', 'Enterprise'];
const PAGE_SIZE = 5;
const resourceLabel = { users: 'Users', guards: 'Guards', sites: 'Sites', storage: 'Storage' };
const statusTone = (status) => status === 'Critical' ? 'red' : status === 'Near Limit' ? 'orange' : 'green';
const resourceTone = (percentage) => percentage >= 95 ? 'red' : percentage >= 80 ? 'orange' : 'green';

function UsageProgress({ metric, resourceKey }) {
  const tone = resourceTone(metric.percentage);
  return <div className="ul-resource-cell">
    <div className="ul-resource-value"><span>{metric.used.toLocaleString('en-US')} / {metric.limit.toLocaleString('en-US')}{resourceKey === 'storage' ? ' GB' : ''}</span><b>{metric.percentage}%</b></div>
    <div className="ul-progress-track" aria-label={`${resourceLabel[resourceKey]} usage ${metric.percentage}%`}>
      <span className={tone} style={{ width: `${getCappedProgress(metric.percentage)}%` }} />
    </div>
  </div>;
}

function TenantUsageTable() {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);

  const filtered = useMemo(() => TENANT_USAGE.filter((tenant) => {
    const matchesSearch = tenant.companyName.toLowerCase().includes(search.trim().toLowerCase());
    const matchesPlan = planFilter === 'all' || tenant.plan === planFilter;
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    const matchesResource = resourceFilter === 'all' || tenant.resources[resourceFilter].percentage >= 80;
    return matchesSearch && matchesPlan && matchesStatus && matchesResource;
  }), [search, planFilter, statusFilter, resourceFilter]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetFilters = () => {
    setSearch(''); setPlanFilter('all'); setStatusFilter('all'); setResourceFilter('all'); setPage(1); setOpenMenu(null);
  };
  const updateFilter = (setter) => (value) => { setter(value); setPage(1); setOpenMenu(null); };
  const showTenantDetails = (tenant) => { setSelectedTenant(tenant); setOpenMenu(null); };

  return <>
    <div className="ul-table-toolbar">
      <label className="ul-table-search"><Search size={15} /><input aria-label="Search companies" placeholder="Search companies..." value={search} onChange={(event) => updateFilter(setSearch)(event.target.value)} /></label>
      <select aria-label="Filter by subscription plan" value={planFilter} onChange={(event) => updateFilter(setPlanFilter)(event.target.value)}>
        {PLAN_OPTIONS.map((plan) => <option key={plan} value={plan}>{plan === 'all' ? 'All Plans' : plan}</option>)}
      </select>
      <select aria-label="Filter by usage status" value={statusFilter} onChange={(event) => updateFilter(setStatusFilter)(event.target.value)}>
        {STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
      </select>
      <select aria-label="Filter tenants by resource usage" value={resourceFilter} onChange={(event) => updateFilter(setResourceFilter)(event.target.value)}>
        {RESOURCE_OPTIONS.map((resource) => <option key={resource.value} value={resource.value}>{resource.label}</option>)}
      </select>
      <button type="button" className="ul-reset-btn" onClick={resetFilters}><RotateCcw size={13} />Reset Filters</button>
    </div>
    {resourceFilter !== 'all' && <p className="ul-filter-hint">Showing tenants whose {resourceLabel[resourceFilter].toLowerCase()} usage is at least 80% of the configured limit.</p>}
    <div className="ul-table-scroll">
      <table className="ul-usage-table">
        <thead><tr>
          <th className="ul-col-number">#</th><th className="ul-col-company">Company Name</th><th>Subscription Plan</th>
          <th>Users (Used / Limit)</th><th>Guards (Used / Limit)</th><th>Sites (Used / Limit)</th><th>Storage (Used / Limit)</th>
          <th>Overall Usage</th><th>Status</th><th className="ul-col-actions">Actions</th>
        </tr></thead>
        <tbody>
          {visibleRows.map((tenant, index) => <tr key={tenant.id}>
            <td className="ul-row-number">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
            <td><div className="ul-company-cell"><span className="ul-company-avatar">{tenant.companyName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span><span title={tenant.companyName}>{tenant.companyName}</span></div></td>
            <td><span className={`ul-plan-pill ${tenant.plan.toLowerCase()}`}>{tenant.plan}</span></td>
            <td><UsageProgress metric={tenant.users} resourceKey="users" /></td>
            <td><UsageProgress metric={tenant.guards} resourceKey="guards" /></td>
            <td><UsageProgress metric={tenant.sites} resourceKey="sites" /></td>
            <td><UsageProgress metric={tenant.storage} resourceKey="storage" /></td>
            <td><div className="ul-resource-cell ul-overall-cell"><div className="ul-resource-value"><b>{tenant.overallUsagePct}%</b></div><div className="ul-progress-track"><span className={resourceTone(tenant.overallUsagePct)} style={{ width: `${getCappedProgress(tenant.overallUsagePct)}%` }} /></div></div></td>
            <td><span className={`ul-status-pill ${statusTone(tenant.status)}`}>{tenant.status === 'Critical' ? <AlertTriangle size={12} /> : tenant.status === 'Near Limit' ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}{tenant.status === 'Critical' ? 'Critical' : tenant.status}</span></td>
            <td className="ul-row-actions"><div className="ul-row-menu-wrap"><button type="button" className="ul-dots-btn" aria-label={`Actions for ${tenant.companyName}`} aria-expanded={openMenu === tenant.id} onClick={() => setOpenMenu(openMenu === tenant.id ? null : tenant.id)}><MoreHorizontal size={17} /></button>
              {openMenu === tenant.id && <div className="ul-row-menu"><button type="button" onClick={() => showTenantDetails(tenant)}><Eye size={13} />View Details</button><button type="button" onClick={() => showTenantDetails(tenant)}><Activity size={13} />Review Usage</button></div>}
            </div></td>
          </tr>)}
          {visibleRows.length === 0 && <tr><td colSpan="10"><div className="ul-table-empty"><Search size={22} /><strong>No tenants match these filters</strong><span>Try another search or reset the active filters.</span><button type="button" onClick={resetFilters}>Reset Filters</button></div></td></tr>}
        </tbody>
      </table>
    </div>
    <div className="ul-table-footer"><span>Showing <strong>{filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong> matching tenants</span><div className="ul-pagination"><button type="button" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => { setPage((value) => Math.max(1, value - 1)); setOpenMenu(null); }}><ChevronLeft size={15} /></button><span>Page {currentPage} of {pageCount}</span><button type="button" aria-label="Next page" disabled={currentPage >= pageCount} onClick={() => { setPage((value) => Math.min(pageCount, value + 1)); setOpenMenu(null); }}><ChevronRight size={15} /></button></div></div>
    {selectedTenant && <div className="ul-tenant-detail-backdrop" role="presentation" onClick={() => setSelectedTenant(null)}><section className="ul-tenant-detail" role="dialog" aria-modal="true" aria-label={`${selectedTenant.companyName} usage details`} onClick={(event) => event.stopPropagation()}><button type="button" className="ul-detail-close" aria-label="Close tenant details" onClick={() => setSelectedTenant(null)}><X size={17} /></button><span className="ul-detail-eyebrow">Tenant usage details</span><h3>{selectedTenant.companyName}</h3><p>{selectedTenant.plan} plan · {selectedTenant.companyStatus} tenant</p><div className="ul-detail-score"><strong>{selectedTenant.overallUsagePct}%</strong><span>Overall usage</span><span className={`ul-status-pill ${statusTone(selectedTenant.status)}`}>{selectedTenant.status}</span></div><div className="ul-detail-metrics">{Object.entries(selectedTenant.resources).map(([key, metric]) => <div key={key}><span>{resourceLabel[key]}</span><strong>{metric.used.toLocaleString('en-US')} / {metric.limit.toLocaleString('en-US')}{key === 'storage' ? ' GB' : ''}</strong><small>{metric.percentage}% used</small></div>)}</div><button type="button" className="ul-btn ul-btn-outline ul-detail-done" onClick={() => setSelectedTenant(null)}>Close details</button></section></div>}
  </>;
}

function ResourceUsageChart({ monthFactor = 1, onDrilldown }) {
  // Normalize each resource to its own configured limit so all four categories remain readable.
  // Actual supplied usage/limit values are retained in labels and tooltips.
  const data = RESOURCE_OVERVIEW.map((item) => ({ ...item, currentUsage: Math.max(0, Math.round(item.currentUsage * monthFactor)), currentPct: item.availableLimit ? (Math.max(0, Math.round(item.currentUsage * monthFactor)) / item.availableLimit) * 100 : 0, limitPct: 100 }));
  return <div className="ul-chart-content">
    <div className="ul-chart-legend"><span><i className="ul-legend-blue" />Current Usage</span><span><i className="ul-legend-lightblue" />Available Limit</span><small>Bars scaled to each resource limit</small></div>
    <div className="ul-bar-chart"><ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 24, right: 8, left: -12, bottom: 2 }} barCategoryGap="22%" barGap={3}>
        <CartesianGrid stroke="#E4ECF5" vertical={false} />
        <XAxis dataKey="resource" tick={chartAxis} tickLine={false} axisLine={{ stroke: '#D9E3EF' }} interval={0} />
        <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tick={chartAxis} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={38} />
        <Tooltip cursor={{ fill: '#EEF7FC' }} content={({ active, payload, label }) => active && payload?.length ? <div className="ul-chart-tooltip"><strong>{label}</strong><div>Current Usage: {number(payload[0]?.payload?.currentUsage ?? 0)}</div><div>Available Limit: {number(payload[0]?.payload?.availableLimit ?? 0)}</div><small>{Math.round(payload[0]?.payload?.currentPct ?? 0)}% of limit used</small></div> : null} />
        <Bar dataKey="currentPct" name="Current Usage" fill="#0758F9" radius={[2, 2, 0, 0]} maxBarSize={34} cursor="pointer" onClick={(entry) => onDrilldown?.({ type: 'resource', title: entry.resource, details: `${number(entry.currentUsage)} used of ${number(entry.availableLimit)} limit`, percentage: Math.round(entry.currentPct) })}><LabelList dataKey="currentPct" content={<ResourceValueLabel dataKey="currentPct" />} /></Bar>
        <Bar dataKey="limitPct" name="Available Limit" fill="#9BC7F5" radius={[2, 2, 0, 0]} maxBarSize={34} cursor="pointer" onClick={(entry) => onDrilldown?.({ type: 'resource', title: entry.resource, details: `Configured limit: ${number(entry.availableLimit)}`, percentage: 100 })}><LabelList content={<ResourceValueLabel dataKey="limitPct" />} /></Bar>
      </BarChart>
    </ResponsiveContainer></div>
  </div>;
}

function TenantDistributionChart({ onDrilldown }) {
  return <div className="ul-donut-layout">
    <div className="ul-donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart>
      <Pie data={TENANT_USAGE_DISTRIBUTION} dataKey="tenants" nameKey="label" cx="50%" cy="50%" innerRadius="60%" outerRadius="88%" paddingAngle={1} stroke="#fff" strokeWidth={2} startAngle={90} endAngle={-270} cursor="pointer" onClick={(entry) => onDrilldown?.({ type: 'distribution', title: entry.label, details: `${entry.tenants} tenants`, percentage: entry.percentage })}>
        {TENANT_USAGE_DISTRIBUTION.map((item) => <Cell key={item.key} fill={item.color} />)}
      </Pie>
      <Tooltip formatter={(value, name) => [`${value} tenants (${Math.round((value / USAGE_SUMMARY.totalTenants) * 100)}%)`, name]} />
    </PieChart></ResponsiveContainer><div className="ul-donut-center"><strong>{USAGE_SUMMARY.totalTenants}</strong><span>Tenants</span></div></div>
    <div className="ul-distribution-legend">{TENANT_USAGE_DISTRIBUTION.map((item) => <div className="ul-distribution-row" key={item.key}><i style={{ background: item.color }} /><span>{item.label}</span><strong>{item.tenants} tenants</strong><b>{item.percentage}%</b></div>)}</div>
  </div>;
}

function downloadCsv(rows) {
  const headers = ['Company Name','Plan','Users Used','Users Limit','Guards Used','Guards Limit','Sites Used','Sites Limit','Storage GB Used','Storage GB Limit','Overall Usage %','Status'];
  const escape = (value) => `\"${String(value ?? '').replace(/\"/g, '\"\"')}\"`;
  const lines = [headers, ...rows.map((t) => [t.companyName,t.plan,t.users.used,t.users.limit,t.guards.used,t.guards.limit,t.sites.used,t.sites.limit,t.storage.used,t.storage.limit,t.overallUsagePct,t.status])];
  const blob = new Blob([lines.map((row) => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = 'megsi-usage-report.csv'; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}

export default function UsageLimits() {
  const { t, lang } = useI18n();
  const [modal, setModal] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(USAGE_DEMO_MONTH);
  const [toast, setToast] = useState('');
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2800); };
  const [monthOpen, setMonthOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [sidePanel, setSidePanel] = useState(null);
  const monthFactor = selectedMonth === USAGE_DEMO_MONTH ? 1 : 1 + ((((Number(selectedMonth.slice(0, 4)) * 12 + Number(selectedMonth.slice(5, 7))) % 7) - 3) * 0.025);
  const displayedKpiValue = (key, value) => selectedMonth === USAGE_DEMO_MONTH || key === 'tenants' ? value : key === 'near' || key === 'critical' ? String(Math.max(0, Math.round(Number(value) * monthFactor))) : Math.round(Number(value.replace(/,/g, '')) * monthFactor).toLocaleString('en-US');
  const selectedMonthLabel = new Date(`${selectedMonth}-01T12:00:00`).toLocaleDateString(lang === 'fr' ? 'fr-FR' : lang === 'de' ? 'de-DE' : 'en-US', { month: 'long', year: 'numeric' });
  return (
    <div className="ul">
      <div className="ul-page-head">
        <div className="ul-heading-copy">
          <h1>{t('usage.title')}</h1>
          <p>{t('usage.subtitle')}</p>
          <span className="ul-demo-note">{t('usage.demo')}</span>
        </div>
        <div className="ul-head-actions">
          <div className="ul-month-wrap"><button className="ul-btn ul-btn-month" type="button" onClick={() => setMonthOpen((v) => !v)}><CalendarDays size={16} /><span>{selectedMonthLabel}</span><ChevronDown size={15} /></button>{monthOpen && <div className="ul-month-menu"><label htmlFor="ul-month-input">{t('usage.month')}</label><input id="ul-month-input" type="month" value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setMonthOpen(false); notify(t('usage.month.changed')); }} /><small>{t('usage.month.note')}</small></div>}</div>
          <button className="ul-btn ul-btn-primary" type="button" onClick={() => { downloadCsv(TENANT_USAGE); notify(t('usage.exported')); }}><Download size={16} />{t('usage.export')}</button>
          <button className="ul-btn ul-btn-outline" type="button" onClick={() => setModal('limits')}><Settings size={16} />{t('usage.manage')}</button>
        </div>
      </div>

      <div className="ul-month-data-note">Demo view for <strong>{selectedMonthLabel}</strong>. Changing the month adjusts illustrative dashboard metrics; these are not historical production records.</div>
      <div className="ul-kpis">
        {KPI_CARDS.map(({ key, label, value, caption, icon: Icon, tone }) => (
          <button type="button" className="ul-card ul-kpi ul-kpi-clickable" key={key} onClick={() => setSidePanel({ type: 'kpi', title: t(`usage.kpi.${key === 'near' ? 'near' : key === 'critical' ? 'critical' : key}`), value: displayedKpiValue(key, value), details: caption, metricKey: key })} aria-label={`View details for ${label}`}>
            <div className={`ul-kpi-icon ${tone}`}><Icon size={25} strokeWidth={2.3} /></div>
            <div className="ul-kpi-main"><span className="ul-kpi-label">{t(`usage.kpi.${key === 'near' ? 'near' : key === 'critical' ? 'critical' : key}`)}</span><strong>{displayedKpiValue(key, value)}</strong></div>
            <p>{t(`usage.kpi.${key}.caption`)}</p>
          </button>
        ))}
      </div>

      <div className="ul-chart-grid">
        <PlaceholderCard title={t('usage.resource')} icon={BarChart3} className="ul-resource-card"><ResourceUsageChart monthFactor={monthFactor} onDrilldown={setSidePanel} /></PlaceholderCard>
        <PlaceholderCard title={t('usage.distribution')} icon={Settings} className="ul-distribution-card"><TenantDistributionChart onDrilldown={setSidePanel} /></PlaceholderCard>
      </div>

      <PlaceholderCard title={t('usage.table')} icon={Database} className="ul-table-card">
        <TenantUsageTable />
      </PlaceholderCard>

      <div className="ul-bottom-grid">
        <PlaceholderCard title={t('usage.alerts')} icon={AlertTriangle} action={<button type="button" className="ul-small-btn" onClick={() => setModal('alerts')}>{t('usage.viewAll')}</button>}>
          <div className="ul-action-list">{USAGE_ALERTS.map((alert) => <div className="ul-alert-row" key={alert.id}><span className={`ul-alert-icon ${alert.severity.toLowerCase()}`}><AlertTriangle size={16} /></span><div className="ul-alert-copy"><strong>{alert.companyName}</strong><span>{alert.message}</span></div><span className={`ul-alert-badge ${alert.severity.toLowerCase()}`}>{alert.severity}</span><time>{alert.time}</time><button className="ul-text-action" onClick={() => { setSelectedRecord(TENANT_USAGE.find((t) => t.id === alert.companyId) || TENANT_USAGE[0]); setModal('tenant'); }} type="button">Review</button></div>)}</div>
        </PlaceholderCard>
        <PlaceholderCard title={t('usage.recommendations')} icon={Lightbulb} action={<button type="button" className="ul-small-btn" onClick={() => setModal('recommendations')}>{t('usage.viewAll')}</button>}>
          <div className="ul-action-list">{RECOMMENDED_ACTIONS.map((item) => <div className="ul-recommend-row" key={item.id}><span className="ul-recommend-icon"><Lightbulb size={16} /></span><div className="ul-recommend-copy"><strong>{item.title}</strong><span>{item.description}</span></div><button className="ul-btn ul-btn-outline ul-review-btn" type="button" onClick={() => { setSelectedRecord(item.companyId ? TENANT_USAGE.find((t) => t.id === item.companyId) : null); setModal(item.companyId ? 'tenant' : 'recommendation-detail'); }}>Review</button></div>)}</div>
        </PlaceholderCard>
      </div>
      {sidePanel && <div className="ul-side-backdrop" role="presentation" onClick={() => setSidePanel(null)}><aside className="ul-side-panel" role="dialog" aria-modal="true" aria-label={sidePanel.title} onClick={(e) => e.stopPropagation()}><button className="ul-detail-close" type="button" aria-label="Close details" onClick={() => setSidePanel(null)}><X size={17}/></button><span className="ul-detail-eyebrow">Usage details · {selectedMonthLabel}</span><h3>{sidePanel.title}</h3>{sidePanel.value !== undefined && <strong className="ul-side-value">{sidePanel.value}</strong>}<p>{sidePanel.details}</p>{sidePanel.percentage !== undefined && <div className="ul-side-progress"><div><span>Usage / distribution</span><b>{sidePanel.percentage}%</b></div><span><i style={{ width: `${Math.min(100, Math.max(0, sidePanel.percentage))}%` }}/></span></div>}{sidePanel.type === 'kpi' && <div className="ul-side-detail-list">{(sidePanel.metricKey === 'tenants' ? [['All plans', '56 tenants'], ['Data source', 'Demonstration tenant records']] : sidePanel.metricKey === 'users' ? [['Resource', 'Registered users'], ['Platform limit', '5,000 users']] : sidePanel.metricKey === 'guards' ? [['Resource', 'Registered guards'], ['Platform limit', '30,000 guards']] : sidePanel.metricKey === 'near' ? [['Definition', 'Highest individual resource usage above 80%'], ['Action', 'Review tenants approaching capacity']] : [['Definition', 'Tenants requiring attention'], ['Action', 'Review critical resource usage']]).map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>}<button type="button" className="ul-btn ul-btn-outline ul-detail-done" onClick={() => setSidePanel(null)}>Close details</button></aside></div>}
      {modal && <div className="ul-modal-backdrop" role="presentation" onClick={() => setModal(null)}><section className="ul-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}><button className="ul-detail-close" type="button" aria-label="Close" onClick={() => setModal(null)}><X size={17}/></button>
        {modal === 'limits' && <><h3>{t('usage.manage')}</h3><p className="ul-modal-intro">{t('usage.limits.intro')}</p><div className="ul-limits-table"><div className="head"><span>Plan</span><span>Users</span><span>Guards*</span><span>Sites</span><span>Storage*</span></div>{Object.entries(DEMO_PLAN_LIMITS).map(([plan, limits]) => <div key={plan}><strong>{plan}</strong><span>{plan === 'Enterprise' ? '1,000 demo cap' : (TENANT_USAGE.find((t) => t.plan === plan)?.users.limit ?? '—').toLocaleString('en-US')}</span><span>{limits.guards.toLocaleString('en-US')}</span><span>{plan === 'Enterprise' ? '200 demo cap' : (TENANT_USAGE.find((t) => t.plan === plan)?.sites.limit ?? '—').toLocaleString('en-US')}</span><span>{limits.storageGB.toLocaleString('en-US')} GB</span></div>)}</div><small>*{t('usage.limits.demo')}</small></>}
        {modal === 'alerts' && <><h3>{t('usage.allAlerts')}</h3>{USAGE_ALERTS.map((a) => <div className="ul-modal-list-row" key={a.id}><strong>{a.companyName}</strong><span>{a.message}</span><small>{a.severity} · {a.time}</small></div>)}</>}
        {modal === 'recommendations' && <><h3>{t('usage.allRecommendations')}</h3>{RECOMMENDED_ACTIONS.map((a) => <div className="ul-modal-list-row" key={a.id}><strong>{a.title}</strong><span>{a.description}</span></div>)}</>}
        {modal === 'tenant' && selectedRecord && <><h3>{selectedRecord.companyName}</h3><p className="ul-modal-intro">{selectedRecord.plan} plan · {selectedRecord.overallUsagePct}% overall usage · {selectedRecord.status}</p><div className="ul-modal-metrics">{Object.entries(selectedRecord.resources).map(([key, metric]) => <div key={key}><strong>{resourceLabel[key]}</strong><span>{metric.used.toLocaleString('en-US')} / {metric.limit.toLocaleString('en-US')}</span><small>{metric.percentage}% used</small></div>)}</div></>}
        {modal === 'recommendation-detail' && <><h3>Review guard limits</h3><p className="ul-modal-intro">Review tenant guard utilization and compare current registrations with each plan's configured capacity. These demonstration recommendations do not change tenant settings.</p></>}
        <button type="button" className="ul-btn ul-btn-primary ul-modal-done" onClick={() => setModal(null)}>{t('usage.done')}</button>
      </section></div>}
      {toast && <div className="ul-toast" role="status">{toast}</div>}
    </div>
  );
}
