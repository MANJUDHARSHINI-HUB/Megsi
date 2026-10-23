import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../i18n/I18nContext.jsx';
import DateRangeMenu from '../components/DateRangeMenu.jsx';
import {
  BarChart3, Banknote, CreditCard, Clock3, AlertCircle, CircleDollarSign,
  Landmark, Search, Download, Eye, FileText, MoreHorizontal, ChevronLeft,
  ChevronRight, Settings, Zap, CheckCircle2, X
} from 'lucide-react';
import {
  BarChart, Bar, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import './tenant-billing.css';

const companies = [
  { name: 'SecureGuard UK Ltd', plan: 'Business', fee: 79, method: 'Card' },
  { name: 'Metro Security Group', plan: 'Professional', fee: 29, method: 'Bank Transfer' },
  { name: 'SafeZone Services', plan: 'Business', fee: 79, method: 'Card' },
  { name: 'Guardian Force Ltd', plan: 'Starter', fee: 9, method: 'Card' },
  { name: 'Elite Security Solutions', plan: 'Enterprise', fee: 120, method: 'Bank Transfer' },
  { name: 'Shield Security Group', plan: 'Business', fee: 79, method: 'Card' },
  { name: 'Northern Security', plan: 'Professional', fee: 29, method: 'Card' },
  { name: 'City Watch Ltd', plan: 'Business', fee: 79, method: 'Bank Transfer' },
  { name: 'OldGuard Security', plan: 'Starter', fee: 9, method: 'Card' },
  { name: 'Prime Security UK', plan: 'Professional', fee: 29, method: 'Card' },
  { name: 'SwiftGuard Services', plan: 'Business', fee: 79, method: 'Bank Transfer' },
  { name: 'Beacon Protection', plan: 'Starter', fee: 9, method: 'Card' },
];

const statusCycle = ['Paid', 'Pending', 'Overdue', 'Trial', 'Paid', 'Paid', 'Pending'];
const plans = ['Business', 'Professional', 'Starter', 'Enterprise'];
const money = (n, lang = 'en') =>
  new Intl.NumberFormat(lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency', currency: 'GBP', maximumFractionDigits: 0
  }).format(n);

function makeDemoRows() {
  const rows = [];
  let id = 1;
  // Generate demo invoices across a broad date range so presets and custom
  // ranges have different records to display, not the same fixed 12 rows.
  for (let year = 2025; year <= 2027; year++) {
    for (let month = 0; month < 12; month++) {
      companies.forEach((company, index) => {
        // Two records per company/month keeps the demo dataset realistic-sized.
        for (let copy = 0; copy < 2; copy++) {
          const issueDate = new Date(year, month, Math.min(3 + index * 2 + copy, 27));
          const nextDate = new Date(year, month + 1, Math.min(10 + index, 27));
          const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          const status = statusCycle[(id + month + year + copy) % statusCycle.length];
          rows.push({
            id, name: company.name, plan: company.plan, fee: company.fee,
            next: iso(nextDate), issue: iso(issueDate), status,
            amount: company.fee, invoice: `INV-${String(1000 + id)}`,
            method: company.method
          });
          id++;
        }
      });
    }
  }
  return rows;
}
const seed = makeDemoRows();

function Status({ value }) {
  return <span className={`tb-status ${value.toLowerCase()}`}><i />{value}</span>;
}
function Panel({ title, icon: Icon, children, action }) {
  return <section className="tb-panel">
    <div className="tb-panel-head">
      <span className="tb-panel-icon"><Icon size={16} /></span>
      <strong>{title}</strong><span className="tb-grow" />{action}
    </div>
    {children}
  </section>;
}
const dateLocale = lang => lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : 'en-GB';
const formatDate = (value, lang) =>
  new Date(`${value}T12:00:00`).toLocaleDateString(dateLocale(lang), {
    day: '2-digit', month: 'short', year: 'numeric'
  });

export default function TenantBilling({ toast = () => {}, range, setRange }) {
  const { lang, t } = useI18n();
  const [rows, setRows] = useState(seed);
  const [query, setQuery] = useState('');
  const [plan, setPlan] = useState('All Plans');
  const [status, setStatus] = useState('All Status');
  const [company, setCompany] = useState('All Companies');
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState('Last 12 Months');
  const [detail, setDetail] = useState(null);
  const [menu, setMenu] = useState(null);
  const [cardId, setCardId] = useState(null); // metric card shown in the right-side details panel

  // The global date selector controls every section on this page.
  // If no range is passed, show the current calendar year.
  const dateRange = useMemo(() => {
    if (range?.start && range?.end) return range;
    const now = new Date();
    return {
      start: `${now.getFullYear()}-01-01`,
      end: `${now.getFullYear()}-12-31`
    };
  }, [range]);

  const inRange = row => row.issue >= dateRange.start && row.issue <= dateRange.end;
  const rangeRows = useMemo(
    () => rows.filter(inRange),
    [rows, dateRange.start, dateRange.end]
  );

  const filtered = useMemo(() => rangeRows.filter(row =>
    (`${row.name} ${row.invoice} ${row.id}`.toLowerCase().includes(query.toLowerCase())) &&
    (plan === 'All Plans' || row.plan === plan) &&
    (status === 'All Status' || row.status === status) &&
    (company === 'All Companies' || row.name === company)
  ), [rangeRows, query, plan, status, company]);

  const pageSize = 8;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const shown = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const sum = list => list.reduce((total, row) => total + row.fee, 0);
  const paidRows = rangeRows.filter(row => row.status === 'Paid');
  const pendingRows = rangeRows.filter(row => row.status === 'Pending');
  const overdueRows = rangeRows.filter(row => row.status === 'Overdue');
  const outstandingRows = rangeRows.filter(row => ['Pending', 'Overdue'].includes(row.status));
  const metrics = [
    { id: 'revenue', title: 'Total Revenue', value: money(sum(rangeRows), lang), trend: `${rangeRows.length} invoices`, sub: 'Selected period', icon: Banknote, color: 'green' },
    { id: 'payments', title: 'Payments Received', value: money(sum(paidRows), lang), trend: `${paidRows.length} paid`, sub: 'Selected period', icon: CreditCard, color: 'blue' },
    { id: 'pending', title: 'Pending Payments', value: money(sum(pendingRows), lang), trend: `${pendingRows.length} pending`, sub: 'Selected period', icon: Clock3, color: 'orange' },
    { id: 'overdue', title: 'Overdue Invoices', value: money(sum(overdueRows), lang), trend: `${overdueRows.length} overdue`, sub: 'Selected period', icon: AlertCircle, color: 'red' },
    { id: 'outstanding', title: 'Outstanding Balance', value: money(sum(outstandingRows), lang), trend: `${outstandingRows.length} records`, sub: 'Selected period', icon: CircleDollarSign, color: 'purple' },
  ];

  // Details shown in the right-side panel. Everything is derived from the same
  // range-filtered rows that drive the metric cards, so panel and card always agree.
  const trialRows = rangeRows.filter(row => row.status === 'Trial');
  const companyCount = list => new Set(list.map(row => row.name)).size;
  const oldestIssue = list => list.length ? formatDate([...list].map(row => row.issue).sort()[0], lang) : '–';
  const percent = (part, whole) => `${whole ? Math.round(part / whole * 100) : 0}%`;
  const average = list => money(list.length ? Math.round(sum(list) / list.length) : 0, lang);
  const countAndValue = list => `${list.length} · ${money(sum(list), lang)}`;
  const periodLabel = `${formatDate(dateRange.start, lang)} – ${formatDate(dateRange.end, lang)}`;
  const cardRows = {
    revenue: [
      ['Selected period', periodLabel],
      ['Total revenue', money(sum(rangeRows), lang)],
      ['Invoices issued', rangeRows.length],
      ['Paid', countAndValue(paidRows)],
      ['Pending', countAndValue(pendingRows)],
      ['Overdue', countAndValue(overdueRows)],
      ['Trial', countAndValue(trialRows)],
      ['Average invoice', average(rangeRows)],
      ['Companies billed', companyCount(rangeRows)],
    ],
    payments: [
      ['Selected period', periodLabel],
      ['Payments received', money(sum(paidRows), lang)],
      ['Paid invoices', paidRows.length],
      ['Share of total revenue', percent(sum(paidRows), sum(rangeRows))],
      ['Average payment', average(paidRows)],
      ['Paid by card', paidRows.filter(row => row.method === 'Card').length],
      ['Paid by bank transfer', paidRows.filter(row => row.method === 'Bank Transfer').length],
      ['Companies paying', companyCount(paidRows)],
    ],
    pending: [
      ['Selected period', periodLabel],
      ['Pending payments', money(sum(pendingRows), lang)],
      ['Pending invoices', pendingRows.length],
      ['Share of invoices', percent(pendingRows.length, rangeRows.length)],
      ['Share of total billed', percent(sum(pendingRows), sum(rangeRows))],
      ['Average pending invoice', average(pendingRows)],
      ['Oldest pending invoice', oldestIssue(pendingRows)],
      ['Companies with pending payments', companyCount(pendingRows)],
    ],
    overdue: [
      ['Selected period', periodLabel],
      ['Overdue amount', money(sum(overdueRows), lang)],
      ['Overdue invoices', overdueRows.length],
      ['Share of invoices', percent(overdueRows.length, rangeRows.length)],
      ['Share of outstanding balance', percent(sum(overdueRows), sum(outstandingRows))],
      ['Average overdue invoice', average(overdueRows)],
      ['Oldest overdue invoice', oldestIssue(overdueRows)],
      ['Companies with overdue invoices', companyCount(overdueRows)],
    ],
    outstanding: [
      ['Selected period', periodLabel],
      ['Outstanding balance', money(sum(outstandingRows), lang)],
      ['Outstanding records', outstandingRows.length],
      ['Pending portion', money(sum(pendingRows), lang)],
      ['Overdue portion', money(sum(overdueRows), lang)],
      ['Share of total billed', percent(sum(outstandingRows), sum(rangeRows))],
      ['Oldest outstanding invoice', oldestIssue(outstandingRows)],
      ['Companies with a balance', companyCount(outstandingRows)],
    ],
  };
  const activeCard = metrics.find(metric => metric.id === cardId) || null;

  useEffect(() => {
    if (!cardId) return undefined;
    const onKey = event => { if (event.key === 'Escape') setCardId(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cardId]);

  const monthlyRevenue = useMemo(() => {
    const start = new Date(`${dateRange.start}T12:00:00`);
    const end = new Date(`${dateRange.end}T12:00:00`);
    const months = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cursor <= last && months.length < 24) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth();
      const list = rangeRows.filter(row => {
        const d = new Date(`${row.issue}T12:00:00`);
        return d.getFullYear() === year && d.getMonth() === month;
      });
      months.push({
        month: cursor.toLocaleDateString(dateLocale(lang), { month: 'short', year: '2-digit' }),
        total: Math.round(sum(list) / 100) / 10,
        payments: Math.round(sum(list.filter(row => row.status === 'Paid')) / 100) / 10,
        pending: Math.round(sum(list.filter(row => row.status === 'Pending')) / 100) / 10,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return months;
  }, [rangeRows, dateRange.start, dateRange.end, lang]);

  const visibleRevenue = useMemo(() => {
    if (period === 'Last 3 Months') return monthlyRevenue.slice(-3);
    if (period === 'Last 6 Months') return monthlyRevenue.slice(-6);
    return monthlyRevenue;
  }, [monthlyRevenue, period]);

  const planRevenue = plans.map(planName => ({
    name: planName,
    value: sum(rangeRows.filter(row => row.plan === planName))
  })).filter(item => item.value > 0);

  const exportCSV = () => {
    const csv = [
      ['Invoice', 'Company', 'Plan', 'Monthly Fee', 'Next Payment', 'Issue Date', 'Status', 'Method'],
      ...filtered.map(row => [row.invoice, row.name, row.plan, row.fee, row.next, row.issue, row.status, row.method])
    ].map(line => line.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'tenant-billing-report.csv'; a.click();
    URL.revokeObjectURL(url);
    toast('Billing report exported.');
  };

  const doAction = (action, row) => {
    setMenu(null);
    if (action === 'view' || action === 'invoice') {
      setDetail({ title: action === 'invoice' ? `Invoice ${row.invoice}` : row.name, row, action });
    } else if (action === 'paid') {
      setRows(old => old.map(item => item.id === row.id ? { ...item, status: 'Paid' } : item));
      toast(`${row.name} marked as paid.`);
    } else if (action === 'delete') {
      setRows(old => old.filter(item => item.id !== row.id));
      toast('Billing record removed from demo data.');
    }
  };

  const statusCounts = [
    { name: 'Paid', value: paidRows.length, color: '#079b65' },
    { name: 'Pending', value: pendingRows.length, color: '#ffab00' },
    { name: 'Overdue', value: overdueRows.length, color: '#ff3f4e' },
    { name: 'Trial', value: rangeRows.filter(row => row.status === 'Trial').length, color: '#a9bad0' },
  ].filter(item => item.value > 0);
  const resetFilters = () => {
    setQuery(''); setPlan('All Plans'); setStatus('All Status');
    setCompany('All Companies'); setPage(1);
  };

  return <div className="tb-page">
    <div className="tb-page-top">
      <div><h1>{t('nav.billing')}</h1><p>{t('navd.billing')}</p></div>
      {range && setRange && <DateRangeMenu range={range} setRange={setRange} />}
    </div>

    <div className="tb-metrics">
      {metrics.map(metric => <button key={metric.title} className={`tb-metric ${cardId === metric.id ? 'active' : ''}`} aria-haspopup="dialog" aria-expanded={cardId === metric.id} onClick={() => setCardId(metric.id)}>
        <span className={`tb-metric-icon ${metric.color}`}><metric.icon size={25} /></span>
        <span className="tb-metric-info"><small>{metric.title}</small><b>{metric.value}</b><em>{metric.trend}</em><span>{metric.sub}</span></span>
      </button>)}
    </div>

    <div className="tb-charts">
      <Panel title="Revenue Overview" icon={BarChart3} action={<select className="tb-small-select" value={period} onChange={event => setPeriod(event.target.value)}><option>Last 12 Months</option><option>Last 6 Months</option><option>Last 3 Months</option></select>}>
        <div className="tb-legend"><span><i className="l-blue" />Total Revenue</span><span><i className="l-green" />Payments Received</span><span><i className="l-orange" />Pending</span></div>
        <div className="tb-chart-area"><ResponsiveContainer width="100%" height="100%">
          <LineChart data={visibleRevenue} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#e5eef9" /><XAxis dataKey="month" tick={{ fontSize: 10, fill: '#173b8e' }} axisLine={{ stroke: '#d6e5f8' }} tickLine={false} />
            <YAxis tickFormatter={value => `£${value}K`} tick={{ fontSize: 10, fill: '#173b8e' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={value => `£${value}K`} />
            <Line type="monotone" dataKey="total" name="Total Revenue" stroke="#1767ff" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="payments" name="Payments Received" stroke="#08b66c" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="pending" name="Pending" stroke="#ff9c0a" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer></div>
      </Panel>

      <Panel title="Payment Status" icon={CircleDollarSign} action={<button className="tb-outline" onClick={() => setDetail({ title: 'Payment Status Details', summary: true })}>View Details</button>}>
        <div className="tb-payment-chart">
          <div className="tb-donut"><ResponsiveContainer width="100%" height="100%"><PieChart>
            <Pie data={statusCounts} dataKey="value" nameKey="name" innerRadius="64%" outerRadius="88%" paddingAngle={2}>
              {statusCounts.map(item => <Cell key={item.name} fill={item.color} />)}
            </Pie><Tooltip />
          </PieChart></ResponsiveContainer><div className="tb-donut-center"><b>{rangeRows.length}</b><span>Invoices</span></div></div>
          <div className="tb-status-legend">{statusCounts.map(item => <button key={item.name} onClick={() => { setStatus(item.name); setPage(1); }}><i className={item.name.toLowerCase()} /><span>{item.name}</span><b>{item.value} ({rangeRows.length ? Math.round(item.value / rangeRows.length * 100) : 0}%)</b></button>)}</div>
        </div>
      </Panel>

      <Panel title="Top Plans by Revenue" icon={Banknote} action={<span className="tb-muted-period">Selected period</span>}>
        <div className="tb-chart-area tb-bar"><ResponsiveContainer width="100%" height="100%"><BarChart data={planRevenue} margin={{ top: 18, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e5eef9" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 10, fill: '#173b8e' }} axisLine={{ stroke: '#d6e5f8' }} tickLine={false} />
          <YAxis tickFormatter={value => `£${Math.round(value / 1000)}K`} tick={{ fontSize: 10, fill: '#173b8e' }} axisLine={false} tickLine={false} />
          <Tooltip formatter={value => money(value, lang)} /><Bar dataKey="value" fill="#2682f8" radius={[3, 3, 0, 0]} />
        </BarChart></ResponsiveContainer></div>
      </Panel>
    </div>

    <Panel title="Company Billing Details" icon={Landmark} action={<div className="tb-filters">
      <label className="tb-search"><Search size={14} /><input placeholder="Search companies..." value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></label>
      <select value={plan} onChange={event => { setPlan(event.target.value); setPage(1); }}><option>All Plans</option>{plans.map(item => <option key={item}>{item}</option>)}</select>
      <select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option>All Status</option>{['Paid', 'Pending', 'Overdue', 'Trial'].map(item => <option key={item}>{item}</option>)}</select>
      <select value={company} onChange={event => { setCompany(event.target.value); setPage(1); }}><option>All Companies</option>{companies.map(item => <option key={item.name}>{item.name}</option>)}</select>
      <button className="tb-export" onClick={exportCSV}><Download size={15} />Export</button>
    </div>}>
      <div className="tb-table-wrap"><table className="tb-table"><thead><tr><th>#</th><th>Company Name</th><th>Plan</th><th>Monthly Fee</th><th>Next Payment Date</th><th>Billing Status</th><th>Actions</th></tr></thead>
        <tbody>{shown.map((row, index) => <tr key={row.id}>
          <td>{(safePage - 1) * pageSize + index + 1}</td>
          <td><span className="tb-company-logo">{row.name.split(' ').map(part => part[0]).slice(0, 2).join('')}</span>{row.name}</td>
          <td><span className={`tb-plan ${row.plan.toLowerCase()}`}>{row.plan}</span></td><td>{money(row.fee, lang)}</td><td>{formatDate(row.next, lang)}</td><td><Status value={row.status} /></td>
          <td><div className="tb-row-actions"><button onClick={() => doAction('view', row)}><Eye size={13} />View</button><button onClick={() => doAction('invoice', row)}><FileText size={13} />Invoice</button><button className="tb-more" aria-label={`More actions for ${row.name}`} onClick={() => setMenu(menu === row.id ? null : row.id)}><MoreHorizontal size={15} /></button>
            {menu === row.id && <div className="tb-action-menu"><button onClick={() => doAction('paid', row)}>Mark as paid</button><button onClick={() => doAction('invoice', row)}>View invoice</button><button className="danger" onClick={() => doAction('delete', row)}>Remove demo record</button></div>}
          </div></td>
        </tr>)}{!shown.length && <tr><td colSpan="7" className="tb-empty">No billing records match this date range and filters. <button onClick={resetFilters}>Clear filters</button></td></tr>}</tbody>
      </table></div>
      <div className="tb-table-foot"><span>Showing {filtered.length ? (safePage - 1) * pageSize + 1 : 0} to {Math.min(safePage * pageSize, filtered.length)} of {filtered.length} invoices</span>
        <div className="tb-pagination"><button disabled={safePage === 1} onClick={() => setPage(current => current - 1)}><ChevronLeft size={15} /></button>{Array.from({ length: pageCount }, (_, index) => <button key={index} className={safePage === index + 1 ? 'active' : ''} onClick={() => setPage(index + 1)}>{index + 1}</button>)}<button disabled={safePage === pageCount} onClick={() => setPage(current => current + 1)}><ChevronRight size={15} /></button></div>
      </div>
    </Panel>

    <div className="tb-bottom">
      <Panel title="Recent Invoices" icon={FileText} action={<button className="tb-outline" onClick={resetFilters}>View All</button>}>
        <table className="tb-mini"><thead><tr><th>Invoice #</th><th>Company Name</th><th>Amount</th><th>Issue Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{[...rangeRows].sort((a, b) => b.issue.localeCompare(a.issue)).slice(0, 5).map(row => <tr key={row.id}><td>{row.invoice}</td><td>{row.name}</td><td>{money(row.fee, lang)}</td><td>{formatDate(row.issue, lang)}</td><td><Status value={row.status} /></td><td><button className="tb-mini-view" onClick={() => doAction('invoice', row)}><Eye size={12} />View</button></td></tr>)}</tbody>
        </table>
      </Panel>
      <Panel title="Payment History" icon={CreditCard} action={<button className="tb-outline" onClick={() => setDetail({ title: 'Payment History', summary: true })}>View All</button>}>
        <table className="tb-mini"><thead><tr><th>Date</th><th>Company Name</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
          <tbody>{[...rangeRows].sort((a, b) => b.issue.localeCompare(a.issue)).slice(0, 5).map(row => <tr key={row.id}><td>{formatDate(row.issue, lang)}</td><td>{row.name}</td><td>{money(row.fee, lang)}</td><td>{row.method}</td><td><Status value={row.status} /></td></tr>)}</tbody>
        </table>
      </Panel>
      <Panel title="Quick Actions" icon={Zap}>
        <div className="tb-quick-grid">
          <button onClick={() => { const row = rangeRows[0] || rows[0]; setDetail({ title: `Generate Invoice — ${row.name}`, row, action: 'invoice' }); }}><span className="purple"><FileText size={16} /></span><b>Generate Invoice<small>Create new invoice</small></b></button>
          <button onClick={exportCSV}><span className="green"><Download size={16} /></span><b>Export Report<small>Download filtered report</small></b></button>
          <button onClick={resetFilters}><span className="blue"><FileText size={16} /></span><b>View All Invoices<small>Clear table filters</small></b></button>
          <button onClick={() => setDetail({ title: 'Payment Settings', settings: true })}><span className="orange"><Settings size={16} /></span><b>Payment Settings<small>Configure payment methods</small></b></button>
        </div>
      </Panel>
    </div>

    {activeCard && <>
      <div className="backdrop tb-drawer-backdrop" onClick={() => setCardId(null)} />
      <aside className="detail tb-drawer" role="dialog" aria-modal="true" aria-label={activeCard.title}>
        <div className="detail-h"><h3>{activeCard.title}</h3><button className="icon-btn" onClick={() => setCardId(null)} aria-label={t('close')}><X size={18} /></button></div>
        <div className="detail-b">
          {cardRows[activeCard.id].map(([label, value]) => <div className="kv" key={label}><span>{label}</span><b>{value}</b></div>)}
          <p className="demo-note">{t('demoNote')}</p>
        </div>
      </aside>
    </>}

    {detail && <div className="tb-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setDetail(null)}>
      <div className="tb-modal"><div className="tb-modal-head"><h3>{detail.title}</h3><button onClick={() => setDetail(null)}>×</button></div>
        {detail.settings ? <div className="tb-modal-body"><p>Demo payment preferences</p><label className="tb-setting"><input type="checkbox" defaultChecked />Accept card payments</label><label className="tb-setting"><input type="checkbox" defaultChecked />Accept bank transfers</label><label className="tb-setting"><input type="checkbox" />Send payment reminders automatically</label><button className="tb-export" onClick={() => { setDetail(null); toast('Payment settings saved for this demo session.'); }}>Save Settings</button></div>
          : detail.summary ? <div className="tb-modal-body"><p>Demo payment records for the selected date range.</p><div className="tb-summary-row"><span>Invoices in range</span><b>{rangeRows.length}</b></div><div className="tb-summary-row"><span>Paid records</span><b>{paidRows.length}</b></div><div className="tb-summary-row"><span>Pending / overdue</span><b>{outstandingRows.length}</b></div><div className="tb-summary-row"><span>Total billed</span><b>{money(sum(rangeRows), lang)}</b></div></div>
            : <div className="tb-modal-body"><div className="tb-invoice-mark"><FileText size={24} /></div><div className="tb-summary-row"><span>Invoice number</span><b>{detail.row.invoice}</b></div><div className="tb-summary-row"><span>Company</span><b>{detail.row.name}</b></div><div className="tb-summary-row"><span>Plan</span><b>{detail.row.plan}</b></div><div className="tb-summary-row"><span>Amount</span><b>{money(detail.row.fee, lang)}</b></div><div className="tb-summary-row"><span>Issue date</span><b>{formatDate(detail.row.issue, lang)}</b></div><div className="tb-summary-row"><span>Status</span><Status value={detail.row.status} /></div>
              <div className="tb-modal-actions"><button className="tb-outline" onClick={() => setDetail(null)}>Close</button><button className="tb-export" onClick={() => { const row = detail.row; const content = `Invoice ${row.invoice}\nCompany: ${row.name}\nPlan: ${row.plan}\nAmount: ${money(row.fee, lang)}\nStatus: ${row.status}\nIssue date: ${row.issue}`; const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' })); const a = document.createElement('a'); a.href = url; a.download = `${row.invoice}.txt`; a.click(); URL.revokeObjectURL(url); setDetail(null); toast('Demo invoice downloaded.'); }}><Download size={14} />Download invoice</button>{detail.action === 'invoice' && detail.row.status !== 'Paid' && <button className="tb-export" onClick={() => { doAction('paid', detail.row); setDetail(null); }}><CheckCircle2 size={14} />Mark paid</button>}</div>
            </div>}
      </div>
    </div>}
  </div>;
}
