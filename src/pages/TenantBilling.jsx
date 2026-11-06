import { useMemo, useState } from 'react';
import { useI18n } from '../i18n/I18nContext.jsx';
import {
  BarChart3, Banknote, CreditCard, Clock3, AlertCircle, CircleDollarSign,
  Landmark, Search, Download, FileText, CheckCircle2, X, CalendarDays,
  FileSpreadsheet, Receipt, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import './tenant-billing.css';

const companies = [
  { name: 'SecureGuard UK Ltd', plan: 'Business', fee: 79000, method: 'Card' },
  { name: 'Metro Security Group', plan: 'Professional', fee: 29000, method: 'Bank Transfer' },
  { name: 'SafeZone Services', plan: 'Business', fee: 79000, method: 'Card' },
  { name: 'Guardian Force Ltd', plan: 'Starter', fee: 4900, method: 'Card' },
  { name: 'Elite Security Solutions', plan: 'Enterprise', fee: 120000, method: 'Bank Transfer' },
  { name: 'Shield Security Group', plan: 'Business', fee: 79000, method: 'Card' },
  { name: 'Northern Security', plan: 'Professional', fee: 29000, method: 'Card' },
  { name: 'City Watch Ltd', plan: 'Business', fee: 79000, method: 'Bank Transfer' },
  { name: 'OldGuard Security', plan: 'Starter', fee: 4900, method: 'Card' },
  { name: 'Prime Security UK', plan: 'Professional', fee: 29000, method: 'Card' },
  { name: 'SwiftGuard Services', plan: 'Business', fee: 79000, method: 'Bank Transfer' },
  { name: 'Beacon Protection', plan: 'Starter', fee: 4900, method: 'Card' },
];
const statusCycle = ['Paid', 'Pending', 'Overdue', 'Paid', 'Paid', 'Pending', 'Paid'];
const plans = ['Business', 'Professional', 'Starter', 'Enterprise'];
const money = n => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n || 0);
const iso = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const formatDate = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const monthNames = Array.from({ length: 12 }, (_, i) => new Date(2026, i, 1).toLocaleDateString('en-US', { month: 'long' }));

function makeRows() {
  const result = []; let id = 1;
  for (let year = 2025; year <= 2027; year++) for (let month = 0; month < 12; month++) companies.forEach((company, index) => {
    const issue = new Date(year, month, Math.min(3 + index * 2, 27));
    const due = new Date(year, month + 1, Math.min(10 + index, 27));
    const status = statusCycle[(id + month + year) % statusCycle.length];
    result.push({ id, name: company.name, plan: company.plan, fee: company.fee, paidAmount: status === 'Paid' ? company.fee : 0,
      billingCycle: index % 3 === 0 ? 'Yearly' : 'Monthly', next: iso(due), issue: iso(issue), status,
      invoice: `INV-${String(1000 + id)}`, method: company.method }); id++;
  });
  return result;
}
const seed = makeRows();

function Status({ value }) { return <span className={`tb-status ${value.toLowerCase()}`}><i />{value}</span>; }
function Panel({ title, icon: Icon, children, action, className = '' }) {
  return <section className={`tb-panel ${className}`}><div className="tb-panel-head"><span className="tb-panel-icon"><Icon size={16} /></span><strong>{title}</strong><span className="tb-grow" />{action}</div>{children}</section>;
}
function getPeriodRange(period, month, year, weekOffset) {
  const now = new Date();
  if (period === 'Today') return { start: iso(now), end: iso(now) };
  if (period === 'This Week') {
    const start = new Date(now); start.setDate(now.getDate() - ((now.getDay() + 6) % 7) + weekOffset * 7);
    const end = new Date(start); end.setDate(start.getDate() + 6);
    return { start: iso(start), end: iso(end) };
  }
  if (period === 'This Year') { const y = Number(year) || now.getFullYear(); return { start: `${y}-01-01`, end: `${y}-12-31` }; }
  const y = new Date().getFullYear(); return { start: iso(new Date(y, month, 1)), end: iso(new Date(y, month + 1, 0)) };
}
function ChartFilters({ period, setPeriod, month, setMonth, year, setYear, weekOffset, setWeekOffset }) {
  return <div className="tb-chart-filters">
    <select aria-label="Chart date period" value={period} onChange={e => { setPeriod(e.target.value); setWeekOffset(0); }}>
      <option>Today</option><option>This Week</option><option>This Month</option><option>This Year</option>
    </select>
    {period === 'This Week' && <span className="tb-week-nav tb-week-nav-inline" aria-label="Choose week">
      <button type="button" className="tb-week-text-button" onClick={() => setWeekOffset(v => v - 1)}><ChevronLeft size={12} /> Previous Week</button>
      <button type="button" className="tb-week-text-button" onClick={() => setWeekOffset(v => Math.min(0, v + 1))} disabled={weekOffset === 0}>Next Week <ChevronRight size={12} /></button>
    </span>}
    {period === 'This Month' && <select aria-label="Select month" value={month} onChange={e => setMonth(Number(e.target.value))}>{monthNames.map((m, i) => <option key={m} value={i}>{m}</option>)}</select>}
    {period === 'This Year' && <input aria-label="Enter year" type="number" min="2020" max="2100" value={year} onChange={e => setYear(e.target.value)} />}
  </div>;
}

export default function TenantBilling({ toast = () => {} }) {
  const { t } = useI18n();
  const [rows, setRows] = useState(seed);
  const [query, setQuery] = useState('');
  const [plan, setPlan] = useState('All Plans');
  const [status, setStatus] = useState('All Status');
  const [visibleCount, setVisibleCount] = useState(12);
  const [historyMethod, setHistoryMethod] = useState('All Methods');
  const [historyVisibleCount, setHistoryVisibleCount] = useState(10);
  const [detail, setDetail] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [revPeriod, setRevPeriod] = useState('This Month'), [revMonth, setRevMonth] = useState(new Date().getMonth()), [revYear, setRevYear] = useState(String(new Date().getFullYear())), [revWeek, setRevWeek] = useState(0);
  const [piePeriod, setPiePeriod] = useState('This Month'), [pieMonth, setPieMonth] = useState(new Date().getMonth()), [pieYear, setPieYear] = useState(String(new Date().getFullYear())), [pieWeek, setPieWeek] = useState(0);

  // No page-level calendar filter: cards, table, history and reports use all billing records.
  // Each chart has its own independent date filter below.
  const rangeRows = rows;
  const filtered = useMemo(() => rangeRows.filter(r => `${r.name} ${r.invoice}`.toLowerCase().includes(query.toLowerCase()) && (plan === 'All Plans' || r.plan === plan) && (status === 'All Status' || r.status === status)), [rangeRows, query, plan, status]);
  const shown = filtered.slice(0, visibleCount);
  const paymentMethods = useMemo(() => [...new Set(rangeRows.map(row => row.method).filter(Boolean))].sort(), [rangeRows]);
  const historyRows = useMemo(() => [...rangeRows].sort((a, b) => b.issue.localeCompare(a.issue)).filter(row => historyMethod === 'All Methods' || row.method === historyMethod), [rangeRows, historyMethod]);
  const shownHistory = historyRows.slice(0, historyVisibleCount);
  const sum = list => list.reduce((total, row) => total + row.fee, 0);
  const paidRows = rangeRows.filter(r => r.status === 'Paid');
  const pendingRows = rangeRows.filter(r => r.status === 'Pending');
  const overdueRows = rangeRows.filter(r => r.status === 'Overdue');
  const metrics = [
    { title: 'Total Revenue', value: money(sum(rangeRows)), trend: `${rangeRows.length} invoices`, icon: Banknote, color: 'green' },
    { title: 'Payments Received', value: money(sum(paidRows)), trend: `${paidRows.length} paid`, icon: CreditCard, color: 'blue' },
    { title: 'Pending Payments', value: money(sum(pendingRows)), trend: `${pendingRows.length} pending`, icon: Clock3, color: 'orange' },
    { title: 'Overdue Invoices', value: money(sum(overdueRows)), trend: `${overdueRows.length} overdue`, icon: AlertCircle, color: 'red' },
    { title: 'Outstanding Balance', value: money(sum([...pendingRows, ...overdueRows])), trend: `${pendingRows.length + overdueRows.length} records`, icon: CircleDollarSign, color: 'purple' },
  ];

  const revRange = useMemo(() => getPeriodRange(revPeriod, revMonth, revYear, revWeek), [revPeriod, revMonth, revYear, revWeek]);
  const pieRange = useMemo(() => getPeriodRange(piePeriod, pieMonth, pieYear, pieWeek), [piePeriod, pieMonth, pieYear, pieWeek]);
  const rowsIn = r => rows.filter(row => row.issue >= r.start && row.issue <= r.end);
  const revenueRows = useMemo(() => rowsIn(revRange), [rows, revRange]);
  const pieRows = useMemo(() => rowsIn(pieRange), [rows, pieRange]);

  const revenueData = useMemo(() => {
    const start = new Date(`${revRange.start}T12:00:00`), end = new Date(`${revRange.end}T12:00:00`);
    const days = Math.round((end - start) / 86400000), daily = revPeriod !== 'This Year';
    const buckets = [];
    if (daily) {
      for (let i = 0; i <= days && i < 32; i++) { const d = new Date(start); d.setDate(start.getDate() + i); const key = iso(d); const list = revenueRows.filter(r => r.issue === key);
        buckets.push({ label: d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }), total: sum(list), paid: sum(list.filter(r => r.status === 'Paid')), pending: sum(list.filter(r => r.status === 'Pending')) }); }
    } else {
      for (let m = 0; m < 12; m++) { const list = revenueRows.filter(r => { const d = new Date(`${r.issue}T12:00:00`); return d.getMonth() === m; }); buckets.push({ label: monthNames[m].slice(0, 3), total: sum(list), paid: sum(list.filter(r => r.status === 'Paid')), pending: sum(list.filter(r => r.status === 'Pending')) }); }
    }
    return buckets;
  }, [revenueRows, revRange, revPeriod]);
  const statusCounts = [
    { name: 'Paid', value: pieRows.filter(r => r.status === 'Paid').length, color: '#08a875' },
    { name: 'Pending', value: pieRows.filter(r => r.status === 'Pending').length, color: '#ffb020' },
    { name: 'Overdue', value: pieRows.filter(r => r.status === 'Overdue').length, color: '#ff4055' },
  ].filter(item => item.value);

  const showInvoice = row => setDetail({ title: `Invoice ${row.invoice}`, row });
  const markPaid = row => { setRows(old => old.map(item => item.id === row.id ? { ...item, status: 'Paid', paidAmount: item.fee } : item)); setDetail(null); toast(`${row.invoice} marked as paid.`); };
  const removeRecord = row => { setRows(old => old.filter(item => item.id !== row.id)); setDetail(null); toast(`${row.invoice} removed.`); };
  const downloadReport = (title, list = rangeRows) => {
    const lines = [['Invoice', 'Company', 'Plan', 'Billing Cycle', 'Invoice Amount (GBP)', 'Paid Amount (GBP)', 'Due Date', 'Status'], ...list.map(r => [r.invoice, r.name, r.plan, r.billingCycle, r.fee, r.paidAmount, r.next, r.status])];
    const csv = lines.map(line => line.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n'); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })); const a = document.createElement('a'); a.href = url; a.download = `${title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}.csv`; a.click(); URL.revokeObjectURL(url); toast(`${title} downloaded.`);
  };
  const resetFilters = () => { setQuery(''); setPlan('All Plans'); setStatus('All Status'); setVisibleCount(12); };
  const financialReports = [
    { title: 'Monthly Revenue Report', description: 'Revenue summary for the selected month', icon: FileSpreadsheet, tone: 'blue', rows: revenueRows, period: `${monthNames[revMonth]} ${revYear}` },
    { title: 'Yearly Revenue Report', description: 'Annual revenue and payment summary', icon: CalendarDays, tone: 'cyan', rows: rows.filter(r => r.issue.startsWith(revYear)), period: revYear },
    { title: 'Company-wise Revenue', description: 'Revenue grouped by tenant company', icon: Landmark, tone: 'purple', rows: rangeRows, period: 'All billing records' },
    { title: 'Plan-wise Revenue', description: 'Revenue grouped by subscription plan', icon: BarChart3, tone: 'blue', rows: rangeRows, period: 'All billing records' },
    { title: 'Pending Payment Report', description: 'All invoices awaiting payment', icon: Clock3, tone: 'orange', rows: rows.filter(r => r.status === 'Pending'), period: 'Current records' },
    { title: 'Overdue Payment Report', description: 'All invoices past their due date', icon: AlertCircle, tone: 'red', rows: rows.filter(r => r.status === 'Overdue'), period: 'Current records' },
    { title: 'Tax Collection Report', description: 'Billing data for tax review', icon: Receipt, tone: 'green', rows: rangeRows, period: 'Tax configuration required' },
  ];
  const openReport = report => setSelectedReport(report);
  const downloadReportExcel = report => downloadReport(report.title, report.rows);
  const reportColumns = report => {
    if (report.title === 'Yearly Revenue Report') return ['Month', 'Total Invoiced', 'Total Collected', 'Pending Amount', 'Overdue Amount'];
    if (report.title === 'Company-wise Revenue') return ['Company Name', 'Plan', 'Invoices', 'Total Invoiced', 'Collected', 'Outstanding'];
    if (report.title === 'Plan-wise Revenue') return ['Plan', 'Companies', 'Invoices', 'Total Invoiced', 'Collected', 'Outstanding'];
    if (report.title === 'Pending Payment Report') return ['Invoice ID', 'Company Name', 'Plan', 'Invoice Date', 'Due Date', 'Invoice Amount', 'Paid Amount', 'Balance Due', 'Status'];
    if (report.title === 'Overdue Payment Report') return ['Invoice ID', 'Company Name', 'Plan', 'Invoice Date', 'Due Date', 'Days Overdue', 'Invoice Amount', 'Balance Due', 'Status'];
    if (report.title === 'Tax Collection Report') return ['Invoice ID', 'Company Name', 'Taxable Amount', 'Tax Type', 'Tax Rate', 'Tax Collected'];
    return ['Invoice ID', 'Company Name', 'Plan', 'Billing Cycle', 'Invoice Date', 'Due Date', 'Invoice Amount', 'Paid Amount', 'Outstanding', 'Status'];
  };
  const reportTableRows = report => {
    const list = report.rows || [];
    const outstanding = r => Math.max(0, r.fee - r.paidAmount);
    if (report.title === 'Yearly Revenue Report') return monthNames.map((m, i) => { const bucket = list.filter(r => new Date(`${r.issue}T12:00:00`).getMonth() === i); return [m, money(sum(bucket)), money(sum(bucket.filter(r => r.status === 'Paid'))), money(sum(bucket.filter(r => r.status === 'Pending'))), money(sum(bucket.filter(r => r.status === 'Overdue')))]; });
    if (report.title === 'Company-wise Revenue') return [...new Set(list.map(r => r.name))].map(name => { const group = list.filter(r => r.name === name); return [name, group[0]?.plan || '—', group.length, money(sum(group)), money(sum(group.filter(r => r.status === 'Paid'))), money(sum(group.map(outstanding)))]; });
    if (report.title === 'Plan-wise Revenue') return plans.map(name => { const group = list.filter(r => r.plan === name); return [name, new Set(group.map(r => r.name)).size, group.length, money(sum(group)), money(sum(group.filter(r => r.status === 'Paid'))), money(sum(group.map(outstanding)))]; }).filter(row => row[2] > 0);
    if (report.title === 'Pending Payment Report') return list.map(r => [r.invoice, r.name, r.plan, formatDate(r.issue), formatDate(r.next), money(r.fee), money(r.paidAmount), money(outstanding(r)), r.status]);
    if (report.title === 'Overdue Payment Report') return list.map(r => [r.invoice, r.name, r.plan, formatDate(r.issue), formatDate(r.next), Math.max(0, Math.floor((new Date() - new Date(`${r.next}T12:00:00`)) / 86400000)), money(r.fee), money(outstanding(r)), r.status]);
    if (report.title === 'Tax Collection Report') return list.map(r => [r.invoice, r.name, money(r.fee), 'Not configured', '—', money(0)]);
    return list.map(r => [r.invoice, r.name, r.plan, r.billingCycle, formatDate(r.issue), formatDate(r.next), money(r.fee), money(r.paidAmount), money(outstanding(r)), r.status]);
  };

  return <div className="tb-page">
<div className="tb-page-top"><div><h1>Billing</h1><p>{t('navd.billing')}</p></div></div>
    <div className="tb-metrics">{metrics.map(metric => <div key={metric.title} className="tb-metric"><span className={`tb-metric-icon ${metric.color}`}><metric.icon size={23} /></span><span className="tb-metric-info"><small>{metric.title}</small><b>{metric.value}</b><em>{metric.trend}</em><span>Selected period · GBP</span></span></div>)}</div>

    <div className="tb-charts">
      <Panel title="Revenue Overview" icon={BarChart3} className="tb-revenue-panel" action={<ChartFilters period={revPeriod} setPeriod={setRevPeriod} month={revMonth} setMonth={setRevMonth} year={revYear} setYear={setRevYear} weekOffset={revWeek} setWeekOffset={setRevWeek} />}>
        <div className="tb-legend"><span><i className="l-blue" />Total Revenue</span><span><i className="l-green" />Payments Received</span><span><i className="l-orange" />Pending</span></div>
        <div className="tb-chart-area"><ResponsiveContainer width="100%" height="100%"><LineChart data={revenueData} margin={{ top: 8, right: 12, left: 8, bottom: 0 }}><CartesianGrid stroke="#e5eef9" /><XAxis dataKey="label" tick={{ fontSize: 10, fill: '#173b8e' }} axisLine={{ stroke: '#d6e5f8' }} tickLine={false} /><YAxis tickFormatter={v => `£${Math.round(v / 1000)}K`} tick={{ fontSize: 10, fill: '#173b8e' }} axisLine={false} tickLine={false} /><Tooltip formatter={v => money(v)} /><Line type="monotone" dataKey="total" name="Total Revenue" stroke="#1767ff" strokeWidth={2.5} dot={{ r: 2.5 }} /><Line type="monotone" dataKey="paid" name="Payments Received" stroke="#08b66c" strokeWidth={2} dot={{ r: 2 }} /><Line type="monotone" dataKey="pending" name="Pending" stroke="#ff9c0a" strokeWidth={2} dot={{ r: 2 }} /></LineChart></ResponsiveContainer></div>
      </Panel>
      <Panel title="Payment Status" icon={CircleDollarSign} action={<ChartFilters period={piePeriod} setPeriod={setPiePeriod} month={pieMonth} setMonth={setPieMonth} year={pieYear} setYear={setPieYear} weekOffset={pieWeek} setWeekOffset={setPieWeek} />}>
        <div className="tb-payment-chart">
          <div className="tb-payment-bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusCounts} layout="vertical" margin={{ top: 5, right: 34, left: 8, bottom: 5 }}>
                <CartesianGrid stroke="#e5eef9" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: '#52709f' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={58} tick={{ fontSize: 11, fill: '#173b8e' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value, name) => [`${value} invoices`, name]} />
                <Bar dataKey="value" name="Invoices" barSize={19} radius={[0, 5, 5, 0]}>
                  {statusCounts.map(item => <Cell key={item.name} fill={item.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="tb-payment-total"><b>{pieRows.length}</b><span>Total Invoices</span></div>
        </div>
      </Panel>
    </div>

    <Panel title="Company Billing Details" icon={Landmark} className="tb-company-panel" action={<div className="tb-filters"><label className="tb-search"><Search size={14} /><input placeholder="Search companies or invoices..." value={query} onChange={e => { setQuery(e.target.value); setVisibleCount(12); }} /></label><select value={plan} onChange={e => { setPlan(e.target.value); setVisibleCount(12); }}><option>All Plans</option>{plans.map(item => <option key={item}>{item}</option>)}</select><select value={status} onChange={e => { setStatus(e.target.value); setVisibleCount(12); }}><option>All Status</option>{['Paid', 'Pending', 'Overdue'].map(item => <option key={item}>{item}</option>)}</select><button className="tb-export" onClick={() => downloadReport('Company Billing Details', filtered)}><Download size={14} />Export</button></div>}>
      <div className="tb-table-wrap tb-infinite-wrap" onScroll={e => { const el = e.currentTarget; if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80 && visibleCount < filtered.length) setVisibleCount(v => Math.min(v + 12, filtered.length)); }}>
        <table className="tb-table"><thead><tr><th>Company Name</th><th>Plan</th><th>Billing Cycle</th><th>Invoice Amount</th><th>Paid Amount</th><th>Next Due Date</th><th>Billing Status</th><th>Action</th></tr></thead><tbody>
          {shown.map(row => <tr key={row.id}><td>{row.name}</td><td><span className={`tb-plan ${row.plan.toLowerCase()}`}>{row.plan}</span></td><td>{row.billingCycle}</td><td>{money(row.fee)}</td><td>{money(row.paidAmount)}</td><td>{formatDate(row.next)}</td><td><Status value={row.status} /></td><td><button className="tb-invoice-button" onClick={() => showInvoice(row)}><FileText size={13} />Invoice</button></td></tr>)}
          {!shown.length && <tr><td colSpan="8" className="tb-empty">No billing records match these filters. <button onClick={resetFilters}>Clear filters</button></td></tr>}
        </tbody></table>
        {shown.length > 0 && <div className="tb-infinite-status">{shown.length < filtered.length ? 'Scroll down to load more records' : `All ${filtered.length} records loaded`}</div>}
      </div>
    </Panel>

    <div className="tb-secondary-grid"><Panel title="Payment History" icon={CreditCard} action={<select className="tb-history-method" aria-label="Filter payment method" value={historyMethod} onChange={e => { setHistoryMethod(e.target.value); setHistoryVisibleCount(10); }}><option>All Methods</option>{paymentMethods.map(method => <option key={method}>{method}</option>)}</select>}><div className="tb-mini-wrap tb-history-scroll" onScroll={e => { const el = e.currentTarget; if (el.scrollTop + el.clientHeight >= el.scrollHeight - 60 && historyVisibleCount < historyRows.length) setHistoryVisibleCount(v => Math.min(v + 10, historyRows.length)); }}><table className="tb-mini"><thead><tr><th>Date</th><th>Company Name</th><th>Amount (GBP)</th><th>Method</th><th>Status</th></tr></thead><tbody>{shownHistory.map(row => <tr key={row.id}><td>{formatDate(row.issue)}</td><td>{row.name}</td><td>{money(row.fee)}</td><td>{row.method}</td><td><Status value={row.status} /></td></tr>)}{!shownHistory.length && <tr><td colSpan="5" className="tb-empty">No payments for this method.</td></tr>}</tbody></table><div className="tb-infinite-status">{shownHistory.length < historyRows.length ? 'Scroll down to load more payments' : `All ${historyRows.length} payments loaded`}</div></div></Panel></div>

    <Panel title="Financial Reports" icon={FileSpreadsheet} className="tb-financial-panel"><p className="tb-report-intro">Generate and download detailed financial reports in GBP.</p><div className="tb-report-grid">{financialReports.map(report => <button className="tb-report-card" key={report.title} onClick={() => openReport(report)}><span className={`tb-report-icon ${report.tone}`}><report.icon size={17} /></span><span><b>{report.title}</b><small>{report.description}</small></span><Download className="tb-report-download" size={15} /></button>)}</div></Panel>

    {selectedReport && <div className="tb-modal-backdrop tb-invoice-backdrop tb-report-backdrop" onMouseDown={e => e.target === e.currentTarget && setSelectedReport(null)}>
      <div className="tb-modal tb-invoice-modal tb-report-modal" role="dialog" aria-modal="true" aria-label={selectedReport.title}>
        <div className="tb-modal-head tb-invoice-toolbar"><div><h3>{selectedReport.title}</h3><p>View and download your financial report</p></div><div className="tb-invoice-toolbar-actions"><button className="tb-invoice-close" onClick={() => setSelectedReport(null)} aria-label="Close report"><X size={18} /></button></div></div>
        <div className="tb-invoice-paper tb-report-paper" id="tb-print-report">
          <div className="tb-report-document-heading"><div className="tb-invoice-brand-row"><div className="tb-invoice-brand"><strong>MEGSI</strong><span>PLATFORM</span></div><div className="tb-invoice-company"><b>SECURITY WORKFORCE MANAGEMENT</b><span>MEGSI Platform</span><span>support@megsi.com</span></div></div><div className="tb-report-title-block"><h2>{selectedReport.title}</h2><p>Report Period: {selectedReport.period}</p><p>Generated On: {formatDate(iso(new Date()))}</p></div></div>
          <div className="tb-invoice-divider" />
          <div className="tb-report-summary-grid"><div><span>Total Invoiced</span><b>{money(sum(selectedReport.rows))}</b></div><div><span>Total Collected</span><b className="collected">{money(sum(selectedReport.rows.filter(r => r.status === 'Paid')))}</b></div><div><span>Pending Amount</span><b className="pending">{money(sum(selectedReport.rows.filter(r => r.status === 'Pending')))}</b></div><div><span>Overdue Amount</span><b className="overdue">{money(sum(selectedReport.rows.filter(r => r.status === 'Overdue')))}</b></div></div>
          {selectedReport.title === 'Tax Collection Report' && <p className="tb-report-note">Tax rates and tax types are not configured in the current billing data. Tax collected is therefore shown as £0 until tax settings are provided.</p>}
          <div className="tb-invoice-lines-wrap tb-report-table-wrap"><table className="tb-invoice-lines tb-report-table"><thead><tr>{reportColumns(selectedReport).map(col => <th key={col}>{col}</th>)}</tr></thead><tbody>{reportTableRows(selectedReport).map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}{!reportTableRows(selectedReport).length && <tr><td colSpan={reportColumns(selectedReport).length} className="tb-empty">No records available for this report.</td></tr>}</tbody></table></div>
          <div className="tb-report-document-total"><span>Number of records: <b>{selectedReport.rows.length}</b></span><span>Total Invoiced: <b>{money(sum(selectedReport.rows))}</b></span><span>Total Collected: <b>{money(sum(selectedReport.rows.filter(r => r.status === 'Paid')))}</b></span><span>Outstanding: <b>{money(sum(selectedReport.rows.map(r => Math.max(0, r.fee - r.paidAmount))))}</b></span></div>
          <div className="tb-invoice-divider" /><div className="tb-report-signoff"><div><b>MEGSI Platform</b><span>Security Workforce Management</span></div><p>This is a computer-generated financial report. Please contact support@megsi.com for billing queries.</p></div>
        </div>
        <div className="tb-modal-actions tb-invoice-actions"><button className="tb-outline" onClick={() => setSelectedReport(null)}>Close</button><button className="tb-export" onClick={() => window.print()}><Download size={14} />Download PDF</button><button className="tb-export" onClick={() => downloadReportExcel(selectedReport)}><FileSpreadsheet size={14} />Download Excel</button></div>
      </div>
    </div>}

    {detail?.row && <div className="tb-modal-backdrop tb-invoice-backdrop" onMouseDown={e => e.target === e.currentTarget && setDetail(null)}>
      <div className="tb-modal tb-invoice-modal" role="dialog" aria-modal="true" aria-label={`Invoice ${detail.row.invoice}`}>
        <div className="tb-modal-head tb-invoice-toolbar"><div><h3>Invoice</h3><p>View your invoice details</p></div><div className="tb-invoice-toolbar-actions"><button className="tb-invoice-close" onClick={() => setDetail(null)} aria-label="Close invoice"><X size={19} /></button></div></div>
        <div className="tb-invoice-paper" id="tb-print-invoice">
          <div className="tb-invoice-brand-row"><div className="tb-invoice-brand"><strong>MEGSI</strong><span>PLATFORM</span></div><div className="tb-invoice-company"><b>SECURITY WORKFORCE MANAGEMENT</b><span>MEGSI Platform</span><span>support@megsi.com</span></div><Status value={detail.row.status} /></div>
          <div className="tb-invoice-divider" />
          <div className="tb-invoice-parties"><div><h4>Bill To</h4><b>{detail.row.name}</b><span>Tenant / Customer</span></div><dl><div><dt>Invoice Number</dt><dd>{detail.row.invoice}</dd></div><div><dt>Invoice Date</dt><dd>{formatDate(detail.row.issue)}</dd></div><div><dt>Due Date</dt><dd>{formatDate(detail.row.next)}</dd></div></dl></div>
          <div className="tb-invoice-divider" />
          <div className="tb-invoice-lines-wrap"><table className="tb-invoice-lines"><thead><tr><th>Description</th><th>Plan</th><th>Billing Cycle</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead><tbody><tr><td><b>MEGSI {detail.row.plan} Plan</b><small>Subscription access and platform services</small></td><td>{detail.row.plan}</td><td>{detail.row.billingCycle}</td><td>1</td><td>{money(detail.row.fee)}</td><td>{money(detail.row.fee)}</td></tr></tbody></table></div>
          <div className="tb-invoice-totals"><div><span>Subtotal</span><b>{money(detail.row.fee)}</b></div><div><span>Tax</span><b>{money(0)}</b></div><div className="grand"><span>Total Amount</span><b>{money(detail.row.fee)}</b></div><div><span>Amount Paid</span><b>{money(detail.row.paidAmount)}</b></div><div className="balance"><span>Balance Due</span><b>{money(Math.max(0, detail.row.fee - detail.row.paidAmount))}</b></div></div>
          <div className="tb-invoice-divider" />
          <div className="tb-invoice-payment"><div><h4><CreditCard size={16} />Payment Details</h4><p><span>Payment Method</span><b>{detail.row.method || '—'}</b></p><p><span>Payment Status</span><b>{detail.row.status}</b></p>{detail.row.status === 'Paid' && <p><span>Payment Date</span><b>{formatDate(detail.row.issue)}</b></p>}</div><div className={`tb-invoice-payment-message ${detail.row.status === 'Paid' ? 'is-paid' : 'is-unpaid'}`}><CheckCircle2 size={30} /><div><b>{detail.row.status === 'Paid' ? 'Payment Successful' : 'Payment Pending'}</b><span>{detail.row.status === 'Paid' ? 'This invoice has been paid successfully.' : 'Payment is still due. Please complete the payment by the due date.'}</span></div></div></div>
          <div className="tb-invoice-thanks">Thank you for choosing MEGSI Platform.</div>
          <div className="tb-invoice-footer">This is a computer-generated invoice. Please contact support@megsi.com for billing queries.</div>
        </div>
        <div className="tb-modal-actions tb-invoice-actions"><button className="tb-outline" onClick={() => setDetail(null)}>Close</button>{detail.row.status !== 'Paid' && <button className="tb-export" onClick={() => markPaid(detail.row)}><CheckCircle2 size={14} />Mark as Paid</button>}<button className="tb-export tb-invoice-download" onClick={() => window.print()}><Download size={14} />Download PDF</button><button className="tb-danger-button" onClick={() => removeRecord(detail.row)}>Remove Record</button></div>
      </div>
    </div>}
  </div>;
}