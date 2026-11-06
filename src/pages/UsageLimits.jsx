
import { useEffect, useMemo, useRef, useState } from 'react';
import { Document, HeadingLevel, Paragraph, Table, TableRow, TableCell, WidthType, Packer } from 'docx';
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  Building2,
  Database,
  Search,
  ShieldCheck,
  Users,
  X
} from 'lucide-react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';


import { PeriodControl } from '../components/Charts.jsx';
import { defaultPeriod } from '../data/chartPeriods.js';
import {
  getUsageTrend,
  getPlanUsage,
  getTopPlanUsage
} from '../data/usageHistory.js';

import {
  TENANT_USAGE,
  USAGE_SUMMARY,
  getCappedProgress,
  getUsageStatus
} from '../data/usageData.js';

import './usage.css';

const BATCH_SIZE = 12;

const fmt = (value) =>
  Number(value || 0).toLocaleString('en-GB');

const COLORS = [
  '#2F7BFF',
  '#19A77A',
  '#F5A623',
  '#8B5CF6'
];

const PLAN_NAMES = [
  'Starter',
  'Professional',
  'Business',
  'Enterprise'
];

const columns = [
  ['company', 'Company Name'],
  ['plan', 'Plan'],
  ['users', 'Users'],
  ['guards', 'Guards'],
  ['sites', 'Sites'],
  ['storage', 'Storage'],
  ['overall', 'Overall Usage'],
  ['status', 'Status']
];

const tone = (status) =>
  status === 'Critical'
    ? 'critical'
    : status === 'Near Limit'
      ? 'warning'
      : 'normal';


function KpiCard({ icon: Icon, label, value, note, color }) {
  return (
    <article className="ul-kpi">
      <span className={`ul-kpi-icon ${color}`}>
        <Icon size={21} />
      </span>

      <div className="ul-kpi-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}


// Usage Trend Chart
function UsageLineChart({ period, onPeriod }) {
  const data = useMemo(
    () => getUsageTrend(period),
    [period]
  );

  return (
    <section className="ul-card ul-chart-card">
      <header className="ul-card-head">
        <span className="ul-head-icon">
          <Activity size={16} />
        </span>

        <h2>Usage Trend</h2>

        <div className="ul-head-spacer" />

        <PeriodControl
          compact
          value={period}
          onChange={onPeriod}
        />
      </header>

      <div className="ul-chart-legend">
        <span><i className="users" />Users</span>
        <span><i className="guards" />Guards</span>
        <span><i className="sites" />Sites</span>
        <span><i className="storage" />Storage</span>
      </div>

      <div className="ul-chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barGap={1}
            barCategoryGap="22%"
            margin={{
              top: 5,
              right: 10,
              left: 0,
              bottom: 0
            }}
          >
            <CartesianGrid stroke="#E4ECF5" vertical={false} />
            <XAxis
              dataKey="label"
              interval={0}
              tick={{ fontSize: 9, fill: '#53647c' }}
              tickLine={false}
              axisLine={{ stroke: '#dce5f0' }}
            />
            <YAxis
              type="number"
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 9, fill: '#53647c' }}
              tickLine={false}
              axisLine={false}
              width={38}
            />
            <Tooltip
              cursor={{ fill: '#f1f5fb' }}
              labelFormatter={(label, payload) =>
                payload?.[0]?.payload?.fullLabel || label
              }
              formatter={(v, name) => [`${v}%`, name]}
              contentStyle={{ fontSize: 11 }}
            />
            <Bar dataKey="users" name="Users" fill="#2F7BFF" radius={[3, 3, 0, 0]} maxBarSize={12} />
            <Bar dataKey="guards" name="Guards" fill="#19A77A" radius={[3, 3, 0, 0]} maxBarSize={12} />
            <Bar dataKey="sites" name="Sites" fill="#F5A623" radius={[3, 3, 0, 0]} maxBarSize={12} />
            <Bar dataKey="storage" name="Storage" fill="#8B5CF6" radius={[3, 3, 0, 0]} maxBarSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}


// Usage by Plan Donut Chart
function PlanDonut({ period, onPeriod }) {
  const planData = useMemo(() => {
    return getPlanUsage(period)
      .map((item, index) => ({
        ...item,
        color: COLORS[index]
      }))
      .filter((item) => item.value > 0);
  }, [period]);

  const total = planData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const usagePct = Math.round(
    planData.reduce(
      (sum, item) => sum + item.value,
      0
    ) / Math.max(1, planData.length)
  );

  return (
    <section className="ul-card ul-chart-card">
      <header className="ul-card-head">
        <span className="ul-head-icon">
          <Building2 size={16} />
        </span>

        <h2>Usage by Plan</h2>

        <div className="ul-head-spacer" />

        <PeriodControl
          compact
          value={period}
          onChange={onPeriod}
        />
      </header>

      <div className="ul-donut-content">
        <div className="ul-donut">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={planData}
                dataKey="value"
                nameKey="name"
                innerRadius="62%"
                outerRadius="94%"
                paddingAngle={2}
                stroke="#fff"
                strokeWidth={2}
              >
                {planData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="ul-donut-center">
            <strong>{usagePct}%</strong>
            <span>Overall Usage</span>
          </div>
        </div>

        <div className="ul-plan-legend">
          {planData.map((plan) => (
            <div key={plan.name}>
              <i style={{ background: plan.color }} />
              <span>{plan.name}</span>
              <b>
                {Math.round(
                  (plan.value / Math.max(1, total)) * 100
                )}%
              </b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


// Top Plans Chart
function TopPlans({ period, onPeriod }) {
  const data = useMemo(() => {
    return getTopPlanUsage(period).map((item, index) => ({
      ...item,
      color: COLORS[index]
    }));
  }, [period]);

  return (
    <section className="ul-card ul-chart-card">
      <header className="ul-card-head">
        <span className="ul-head-icon">
          <Activity size={16} />
        </span>

        <h2>Top Plans</h2>

        <div className="ul-head-spacer" />

        <PeriodControl
          compact
          value={period}
          onChange={onPeriod}
        />
      </header>

      <div className="ul-top-plans-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 5,
              left: -12,
              bottom: 0
            }}
          >
            <CartesianGrid
              stroke="#E4ECF5"
              vertical={false}
            />

            <XAxis
              dataKey="plan"
              tick={{
                fontSize: 9,
                fill: '#53647c'
              }}
              tickLine={false}
              axisLine={{ stroke: '#dce5f0' }}
            />

            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{
                fontSize: 9,
                fill: '#53647c'
              }}
              tickLine={false}
              axisLine={false}
              width={34}
            />

            <Tooltip formatter={(v) => `${v}%`} />

            <Bar
              dataKey="usage"
              radius={[3, 3, 0, 0]}
              maxBarSize={48}
              label={{
                position: 'top',
                formatter: (v) => `${v}%`,
                fontSize: 9,
                fill: '#243b63'
              }}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.plan}
                  fill={entry.color}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}


// Progress Bar
function Progress({ metric, storage = false }) {
  const pct = Number(metric?.percentage || 0);

  return (
    <div className="ul-progress-cell">
      <div>
        <span>
          {fmt(metric?.used)} / {fmt(metric?.limit)}
          {storage ? ' GB' : ''}
        </span>

        <b>{pct}%</b>
      </div>

      <span className="ul-progress-track">
        <i
          className={
            pct >= 95
              ? 'critical'
              : pct >= 80
                ? 'warning'
                : ''
          }
          style={{
            width: `${getCappedProgress(pct)}%`
          }}
        />
      </span>
    </div>
  );
}


// Tenant Usage Table - No Action Column
function TenantTable() {
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState('all');
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollRef = useRef(null);
  const loadTimer = useRef(null);

  const filtered = useMemo(() => {
    return TENANT_USAGE.filter((tenant) => {
      const q = search.trim().toLowerCase();

      const matchesSearch =
        !q ||
        tenant.companyName.toLowerCase().includes(q);

      const matchesPlan =
        plan === 'all' || tenant.plan === plan;

      return matchesSearch && matchesPlan;
    });
  }, [search, plan]);

  const shown = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Restart from the first batch whenever the search or plan filter changes.
  useEffect(() => {
    window.clearTimeout(loadTimer.current);
    setLoadingMore(false);
    setVisibleCount(BATCH_SIZE);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [search, plan]);

  useEffect(() => () => window.clearTimeout(loadTimer.current), []);

  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    loadTimer.current = window.setTimeout(() => {
      setVisibleCount((n) => Math.min(n + BATCH_SIZE, filtered.length));
      setLoadingMore(false);
    }, 220);
  };

  // If the rows do not fill the box yet (so it cannot be scrolled), keep
  // loading batches until it can scroll or every record is shown.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && hasMore && !loadingMore && el.scrollHeight <= el.clientHeight + 1) {
      loadMore();
    }
  });

  const clearFilters = () => {
    setSearch('');
    setPlan('all');
  };

  return (
    <>
      <div className="ul-table-toolbar">
        <label className="ul-search">
          <Search size={14} />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company..."
          />
        </label>

        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
        >
          <option value="all">All Plans</option>

          {PLAN_NAMES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="ul-tool-btn"
          onClick={clearFilters}
        >
          <X size={13} />
          Clear Filters
        </button>
      </div>

      <div
        className="ul-table-scroll"
        ref={scrollRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) loadMore();
        }}
      >
        <table className="ul-table">
          <thead>
            <tr>
              {columns.map(([key, label]) => (
                <th key={key}>
                  {key === 'company' ? '#' : label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {shown.map((tenant, index) => (
              <tr key={tenant.id}>
                <td>
                  <div className="ul-company">
                    <span className="ul-avatar">
                      {tenant.companyName
                        .split(' ')
                        .slice(0, 2)
                        .map((x) => x[0])
                        .join('')}
                    </span>

                    <strong>
                      {index + 1}. {tenant.companyName}
                    </strong>
                  </div>
                </td>

                <td>
                  <span
                    className={`ul-plan ${tenant.plan.toLowerCase()}`}
                  >
                    {tenant.plan}
                  </span>
                </td>

                <td>
                  <Progress metric={tenant.users} />
                </td>

                <td>
                  <Progress metric={tenant.guards} />
                </td>

                <td>
                  <Progress metric={tenant.sites} />
                </td>

                <td>
                  <Progress
                    metric={tenant.storage}
                    storage
                  />
                </td>

                <td>
                  <Progress
                    metric={{
                      used: tenant.overallUsagePct,
                      limit: 100,
                      percentage: tenant.overallUsagePct
                    }}
                  />
                </td>

                <td>
                  <span
                    className={`ul-status ${tone(tenant.status)}`}
                  >
                    {tenant.status}
                  </span>
                </td>
              </tr>
            ))}

            {!shown.length && (
              <tr>
                <td colSpan={columns.length} className="ul-empty">
                  No companies match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="ul-table-bottom">
          <span>{shown.length} of {filtered.length} companies</span>
          {loadingMore ? (
            <span className="ul-loading-more"><i /> Loading more companies...</span>
          ) : hasMore ? (
            <span>Scroll down to load more</span>
          ) : (
            <span>All matching companies loaded</span>
          )}
        </div>
      </div>
    </>
  );
}


// Detailed Excel report (3 sheets). ExcelJS is loaded only when exporting.
const EXCEL_RESOURCES = [
  ['users', 'Users'],
  ['guards', 'Guards'],
  ['sites', 'Sites'],
  ['storage', 'Storage (GB)']
];

// Alert levels reuse the dashboard thresholds (80% near limit, 95% critical);
// anything above 100% of the allowed limit is reported as Exceeded.
const alertLevelFor = (pct) => {
  if (pct > 100) return 'Exceeded';
  const status = getUsageStatus(pct);
  return status === 'Normal' ? null : status;
};

const ALERT_RANK = { Exceeded: 3, Critical: 2, 'Near Limit': 1 };

async function downloadExcelReport(generatedAt) {
  const mod = await import('exceljs');
  const ExcelJS = mod.default ?? mod;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'MEGSI Platform Administration';
  workbook.created = generatedAt;

  const thin = { style: 'thin', color: { argb: 'FFDCE5F0' } };
  const cellBorder = { top: thin, left: thin, bottom: thin, right: thin };
  const TONES = {
    Critical: { font: 'FFBD3030', fill: 'FFFFEBEB' },
    Exceeded: { font: 'FFBD3030', fill: 'FFFFEBEB' },
    'Near Limit': { font: 'FFA66500', fill: 'FFFFF4DC' },
    Normal: { font: 'FF087A55', fill: 'FFE6F7EF' }
  };
  const applyTone = (cell, key) => {
    const tone = TONES[key];
    if (!tone) return;
    cell.font = { bold: true, color: { argb: tone.font } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: tone.fill } };
  };

  const prepareSheet = (name, columns, rows) => {
    const sheet = workbook.addWorksheet(name, {
      views: [{ state: 'frozen', ySplit: 1 }]
    });
    sheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width,
      style: col.numFmt ? { numFmt: col.numFmt } : {}
    }));
    rows.forEach((row) => sheet.addRow(row));

    const header = sheet.getRow(1);
    header.height = 30;
    header.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF092B55' } };
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      cell.border = cellBorder;
    });
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.eachCell((cell) => {
        cell.border = cellBorder;
        if (!cell.alignment) cell.alignment = { vertical: 'middle' };
      });
    });
    return sheet;
  };

  const totals = (key) => TENANT_USAGE.reduce(
    (acc, tenant) => ({
      used: acc.used + (tenant[key]?.used || 0),
      limit: acc.limit + (tenant[key]?.limit || 0)
    }),
    { used: 0, limit: 0 }
  );
  const countStatus = (status) =>
    TENANT_USAGE.filter((tenant) => tenant.companyStatus === status).length;
  const highest = (tenant) =>
    Math.max(...EXCEL_RESOURCES.map(([key]) => tenant[key]?.percentage || 0));

  const nearCompanies = TENANT_USAGE.filter((t) => highest(t) >= 80 && highest(t) <= 100).length;
  const exceedingCompanies = TENANT_USAGE.filter((t) => highest(t) > 100).length;
  const users = totals('users');
  const guards = totals('guards');
  const sites = totals('sites');
  const storage = totals('storage');

  // Sheet 1: Usage Summary
  const summary = prepareSheet(
    'Usage Summary',
    [
      { header: 'Metric', key: 'metric', width: 34 },
      { header: 'Value', key: 'value', width: 24, numFmt: '#,##0' },
      { header: 'Notes', key: 'notes', width: 70 }
    ],
    [
      { metric: 'Report generation date', value: generatedAt, notes: 'Date and time this report was exported' },
      { metric: 'Total companies', value: TENANT_USAGE.length, notes: 'Every company on the Usage & Limits page' },
      { metric: 'Active companies', value: countStatus('Active') },
      { metric: 'Trial companies', value: countStatus('Trial') },
      { metric: 'Suspended companies', value: countStatus('Suspended') },
      { metric: 'Total users used', value: users.used },
      { metric: 'Total users limit', value: users.limit, notes: 'Sum of each company\'s allowed users' },
      { metric: 'Total guards used', value: guards.used },
      { metric: 'Total guards limit', value: guards.limit, notes: 'Sum of each company\'s allowed guards' },
      { metric: 'Total sites used', value: sites.used },
      { metric: 'Total sites limit', value: sites.limit, notes: 'Sum of each company\'s allowed sites' },
      { metric: 'Total storage used (GB)', value: storage.used },
      { metric: 'Total storage limit (GB)', value: storage.limit, notes: 'Sum of each company\'s allowed storage' },
      { metric: 'Companies near limits', value: nearCompanies, notes: 'Highest resource usage is 80% to 100% of its limit' },
      { metric: 'Companies exceeding limits', value: exceedingCompanies, notes: 'At least one resource is above 100% of its limit' }
    ]
  );
  summary.getCell('B2').numFmt = 'dd mmm yyyy, hh:mm';
  summary.getColumn('value').alignment = { horizontal: 'right', vertical: 'middle' };

  // Sheet 2: Company-wise Usage Details
  const detailColumns = [
    { header: 'Company ID', key: 'id', width: 12 },
    { header: 'Company Name', key: 'name', width: 30 },
    { header: 'Subscription Plan', key: 'plan', width: 18 },
    { header: 'Company Status', key: 'companyStatus', width: 16 },
    { header: 'Overall Usage (%)', key: 'overall', width: 16, numFmt: '0%' },
    { header: 'Overall Usage Status', key: 'overallStatus', width: 20 }
  ];
  EXCEL_RESOURCES.forEach(([key, label]) => {
    const short = label.replace(' (GB)', '');
    const unit = key === 'storage' ? ' (GB)' : '';
    detailColumns.push(
      { header: `${short} Used${unit}`, key: `${key}Used`, width: 14, numFmt: '#,##0' },
      { header: `${short} Limit${unit}`, key: `${key}Limit`, width: 14, numFmt: '#,##0' },
      { header: `${short} Usage (%)`, key: `${key}Pct`, width: 14, numFmt: '0%' }
    );
  });
  const detailRows = TENANT_USAGE.map((tenant) => {
    const row = {
      id: tenant.companyId,
      name: tenant.companyName,
      plan: tenant.plan,
      companyStatus: tenant.companyStatus,
      overall: (tenant.overallUsagePct || 0) / 100,
      overallStatus: tenant.status
    };
    EXCEL_RESOURCES.forEach(([key]) => {
      row[`${key}Used`] = tenant[key].used;
      row[`${key}Limit`] = tenant[key].limit;
      row[`${key}Pct`] = (tenant[key].percentage || 0) / 100;
    });
    return row;
  });
  const details = prepareSheet('Company-wise Usage Details', detailColumns, detailRows);
  details.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: detailColumns.length } };
  details.eachRow((row, rowNumber) => {
    if (rowNumber > 1) applyTone(row.getCell('overallStatus'), row.getCell('overallStatus').value);
  });

  // Sheet 3: Limit Alerts
  const alerts = [];
  TENANT_USAGE.forEach((tenant) => {
    EXCEL_RESOURCES.forEach(([key, label]) => {
      const metric = tenant[key];
      const level = alertLevelFor(metric.percentage || 0);
      if (!level) return;
      alerts.push({
        company: tenant.companyName,
        plan: tenant.plan,
        resource: label,
        used: metric.used,
        limit: metric.limit,
        pct: (metric.percentage || 0) / 100,
        level
      });
    });
  });
  alerts.sort((a, b) =>
    ALERT_RANK[b.level] - ALERT_RANK[a.level] ||
    b.pct - a.pct ||
    a.company.localeCompare(b.company)
  );
  const alertColumns = [
    { header: 'Company Name', key: 'company', width: 30 },
    { header: 'Subscription Plan', key: 'plan', width: 18 },
    { header: 'Resource Type', key: 'resource', width: 16 },
    { header: 'Used Amount', key: 'used', width: 14, numFmt: '#,##0' },
    { header: 'Allowed Limit', key: 'limit', width: 14, numFmt: '#,##0' },
    { header: 'Usage (%)', key: 'pct', width: 12, numFmt: '0%' },
    { header: 'Alert Level', key: 'level', width: 14 }
  ];
  const alertSheet = prepareSheet('Limit Alerts', alertColumns, alerts);
  alertSheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: alertColumns.length } };
  alertSheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) applyTone(row.getCell('level'), row.getCell('level').value);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'MEGSI-Usage-Limits.xlsx';
  link.click();
  URL.revokeObjectURL(url);
}


// PDF Export
async function downloadReport(format = 'pdf') {
  const reportDate = new Date().toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }
  );

  const escapeHTML = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);

  const companyCards = TENANT_USAGE.map((tenant) => {
    const resources = [
      {
        label: 'Users',
        metric: tenant.users,
        unit: ''
      },
      {
        label: 'Guards',
        metric: tenant.guards,
        unit: ''
      },
      {
        label: 'Sites',
        metric: tenant.sites,
        unit: ''
      },
      {
        label: 'Storage',
        metric: tenant.storage,
        unit: ' GB'
      }
    ];

    const resourceRows = resources.map((item) => {
      const metric = item.metric || {};
      const percentage = Number(metric.percentage || 0);

      return `
        <div class="resource">
          <div class="resource-top">
            <span>${item.label}</span>
            <strong>
              ${escapeHTML(fmt(metric.used))} /
              ${escapeHTML(fmt(metric.limit))}${item.unit}
            </strong>
          </div>

          <div class="track">
            <div
              class="fill"
              style="width:${Math.min(100, Math.max(0, percentage))}%"
            ></div>
          </div>

          <div class="resource-percent">
            ${escapeHTML(percentage)}% used
          </div>
        </div>
      `;
    }).join('');

    const statusClass =
      tenant.status === 'Critical'
        ? 'critical'
        : tenant.status === 'Near Limit'
          ? 'warning'
          : 'normal';

    return `
      <section class="company-card">
        <div class="company-heading">
          <div>
            <div class="eyebrow">COMPANY USAGE REPORT</div>
            <h2>${escapeHTML(tenant.companyName)}</h2>
            <p>${escapeHTML(tenant.plan)} Plan</p>
          </div>

          <span class="status ${statusClass}">
            ${escapeHTML(tenant.status)}
          </span>
        </div>

        <div class="overall">
          <div>
            <span>Overall Resource Usage</span>
            <strong>${escapeHTML(tenant.overallUsagePct)}%</strong>
          </div>

          <div class="overall-track">
            <div
              style="width:${Math.min(
                100,
                Math.max(0, Number(tenant.overallUsagePct) || 0)
              )}%"
            ></div>
          </div>
        </div>

        <div class="resource-grid">
          ${resourceRows}
        </div>
      </section>
    `;
  }).join('');

  const activeCount = TENANT_USAGE.filter(
    (item) => item.companyStatus === 'Active'
  ).length;

  const suspendedCount = TENANT_USAGE.filter(
    (item) => item.companyStatus === 'Suspended'
  ).length;

  const reportHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />

      <title>MEGSI Usage and Limits Report</title>

      <style>
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 30px;
          font-family: Arial, Helvetica, sans-serif;
          color: #18395f;
          background: #f4f7fc;
        }

        .report {
          max-width: 1000px;
          margin: auto;
        }

        .report-header {
          background: #092b55;
          color: white;
          padding: 28px 32px;
          border-radius: 12px;
          margin-bottom: 22px;
        }

        .brand {
          font-size: 25px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .brand span {
          color: #55a0ff;
        }

        .report-header h1 {
          font-size: 23px;
          margin: 22px 0 6px;
        }

        .report-header p {
          margin: 0;
          color: #d5e5f8;
          font-size: 12px;
        }

        .report-date {
          margin-top: 18px;
          font-size: 11px;
          color: #d5e5f8;
        }

        .summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .summary-card {
          background: white;
          border: 1px solid #e1e9f3;
          border-radius: 9px;
          padding: 16px;
        }

        .summary-card span {
          display: block;
          color: #64748b;
          font-size: 11px;
          margin-bottom: 8px;
        }

        .summary-card strong {
          font-size: 23px;
          color: #1459bd;
        }

        .section-title {
          font-size: 16px;
          margin: 24px 0 13px;
          color: #18395f;
        }

        .company-card {
          background: white;
          border: 1px solid #dfe7f1;
          border-radius: 10px;
          padding: 21px;
          margin-bottom: 16px;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .company-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          border-bottom: 1px solid #e8eef6;
          padding-bottom: 14px;
        }

        .eyebrow {
          color: #2f7bff;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.2px;
          margin-bottom: 7px;
        }

        .company-heading h2 {
          margin: 0;
          font-size: 19px;
          color: #12345a;
        }

        .company-heading p {
          color: #718096;
          font-size: 11px;
          margin: 6px 0 0;
        }

        .status {
          padding: 6px 11px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .status.normal {
          color: #087a55;
          background: #e6f7ef;
        }

        .status.warning {
          color: #a66500;
          background: #fff4dc;
        }

        .status.critical {
          color: #bd3030;
          background: #ffebeb;
        }

        .overall {
          margin: 17px 0;
        }

        .overall > div:first-child {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .overall span {
          font-size: 12px;
          font-weight: 700;
        }

        .overall strong {
          font-size: 17px;
          color: #1459bd;
        }

        .overall-track,
        .track {
          width: 100%;
          height: 8px;
          background: #e9eff7;
          border-radius: 10px;
          overflow: hidden;
        }

        .overall-track > div {
          height: 100%;
          background: #2f7bff;
          border-radius: 10px;
        }

        .resource-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .resource {
          border: 1px solid #e7edf5;
          border-radius: 8px;
          padding: 12px;
        }

        .resource-top {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 10px;
          font-size: 11px;
        }

        .resource-top span {
          color: #536780;
          font-weight: 700;
        }

        .resource-top strong {
          color: #18395f;
        }

        .fill {
          height: 100%;
          background: #2f7bff;
          border-radius: 10px;
        }

        .resource-percent {
          text-align: right;
          margin-top: 6px;
          font-size: 9px;
          color: #718096;
        }

        .report-footer {
          border-top: 1px solid #dce5f0;
          padding-top: 13px;
          margin-top: 24px;
          color: #718096;
          font-size: 10px;
          text-align: center;
        }

        @page {
          size: A4;
          margin: 14mm;
        }

        @media print {
          body {
            background: white;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .report-header,
          .summary-card,
          .company-card {
            box-shadow: none;
          }

          .report-header {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }

        @media screen {
          body {
            padding: 25px;
          }
        }
      </style>
    </head>

    <body>
      <main class="report">

        <header class="report-header">
          <div class="brand">
            MEG<span>SI</span>
          </div>

          <h1>Usage &amp; Limits Report</h1>

          <p>
            Platform resource utilisation and company subscription overview
          </p>

          <div class="report-date">
            Generated on: ${escapeHTML(reportDate)}
          </div>
        </header>

        <section class="summary">
          <div class="summary-card">
            <span>Total Companies</span>
            <strong>${fmt(TENANT_USAGE.length)}</strong>
          </div>

          <div class="summary-card">
            <span>Active Companies</span>
            <strong>${fmt(activeCount)}</strong>
          </div>

          <div class="summary-card">
            <span>Suspended Companies</span>
            <strong>${fmt(suspendedCount)}</strong>
          </div>
        </section>

        <h2 class="section-title">
          Company-wise Resource Details
        </h2>

        ${companyCards}

        <footer class="report-footer">
          MEGSI Platform Administration · Usage &amp; Limits Report
          <br />
          This report was generated from the platform usage data.
        </footer>

      </main>
    </body>
    </html>
  `;

  if (format === 'excel') {
    await downloadExcelReport(new Date());
    return;
  }

  if (format === 'word') {
    const makeCell = (value) => new TableCell({
      children: [new Paragraph(String(value ?? ''))],
      width: { size: 12.5, type: WidthType.PERCENTAGE }
    });
    const rows = [
      new TableRow({
        children: ['Company', 'Plan', 'Status', 'Users', 'Guards', 'Sites', 'Storage (GB)', 'Overall (%)']
          .map((value) => makeCell(value))
      }),
      ...TENANT_USAGE.map((tenant) => new TableRow({
        children: [
          tenant.companyName,
          tenant.plan,
          `${tenant.companyStatus} / ${tenant.status}`,
          `${tenant.users.used} / ${tenant.users.limit} (${tenant.users.percentage}%)`,
          `${tenant.guards.used} / ${tenant.guards.limit} (${tenant.guards.percentage}%)`,
          `${tenant.sites.used} / ${tenant.sites.limit} (${tenant.sites.percentage}%)`,
          `${tenant.storage.used} / ${tenant.storage.limit} (${tenant.storage.percentage}%)`,
          `${tenant.overallUsagePct}%`
        ].map((value) => makeCell(value))
      }))
    ];
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: 'MEGSI Usage & Limits Report', heading: HeadingLevel.TITLE }),
          new Paragraph(`Generated on: ${reportDate}`),
          new Paragraph(`Total Companies: ${TENANT_USAGE.length} | Active: ${activeCount} | Suspended: ${suspendedCount}`),
          new Paragraph({ text: 'Company-wise Resource Details', heading: HeadingLevel.HEADING_1 }),
          new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } })
        ]
      }]
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'MEGSI-Usage-Limits.docx';
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  const printWindow = window.open(
    '',
    '_blank',
    'width=1000,height=800'
  );

  if (!printWindow) {
    alert(
      'Please allow pop-ups for this site to export the PDF report.'
    );
    return;
  }

  printWindow.document.open();
  printWindow.document.write(reportHTML);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}


// Main Usage & Limits Page
export default function UsageLimits() {
  const [trendPeriod, setTrendPeriod] = useState(defaultPeriod);
  const [planPeriod, setPlanPeriod] = useState(defaultPeriod);
  const [topPlansPeriod, setTopPlansPeriod] = useState(defaultPeriod);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  const near = TENANT_USAGE.filter(
    (item) => item.resourceNearLimit
  ).length;

  const suspended = TENANT_USAGE.filter(
    (item) => item.companyStatus === 'Suspended'
  ).length;

  const totalStorage = USAGE_SUMMARY.totalStorageGB;

  const kpis = [
    {
      label: 'Total Tenants',
      value: fmt(USAGE_SUMMARY.totalTenants),
      note: 'Across all subscription plans',
      icon: Building2,
      color: 'blue'
    },
    {
      label: 'Total Users',
      value: fmt(USAGE_SUMMARY.totalUsers),
      note: 'Registered across tenants',
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Active Guards',
      value: fmt(USAGE_SUMMARY.totalGuards),
      note: 'Currently registered',
      icon: ShieldCheck,
      color: 'orange'
    },
    {
      label: 'Companies Near Limit',
      value: fmt(near),
      note: 'Resource usage needs attention',
      icon: AlertTriangle,
      color: 'orange'
    },
    {
      label: 'Suspended Tenants',
      value: fmt(suspended),
      note: 'Currently suspended',
      icon: X,
      color: 'red'
    },
    {
      label: 'Total Storage Used',
      value: `${fmt(totalStorage)} GB`,
      note: 'Across all tenants',
      icon: Database,
      color: 'purple'
    }
  ];

  return (
    <main className="ul-page">

      <header className="ul-page-header">
        <div>
          <h1>Usage &amp; Limits</h1>

          <p>
            Monitor resource usage, track limits and manage
            company subscriptions across the platform.
          </p>
        </div>

        <div className="ul-page-actions">
          <button
            className="ul-export-btn"
            type="button"
            onClick={() => setExportOpen(true)}
          >
            <ArrowDownToLine size={15} />
            Export
          </button>
        </div>
      </header>

      <section className="ul-kpi-grid">
        {kpis.map((card) => (
          <KpiCard
            key={card.label}
            {...card}
          />
        ))}
      </section>

      <section className="ul-chart-grid">
        <UsageLineChart
          period={trendPeriod}
          onPeriod={setTrendPeriod}
        />

        <PlanDonut
          period={planPeriod}
          onPeriod={setPlanPeriod}
        />

        <TopPlans
          period={topPlansPeriod}
          onPeriod={setTopPlansPeriod}
        />
      </section>

      <section className="ul-card ul-table-card">
        <header className="ul-card-head">
          <span className="ul-head-icon">
            <Database size={16} />
          </span>

          <h2>Tenant Usage &amp; Limits</h2>

          <div className="ul-head-spacer" />

          <span className="ul-table-count">
            {TENANT_USAGE.length} companies
          </span>
        </header>

        <TenantTable />
      </section>

      {exportOpen && (
        <div
          className="ul-export-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setExportOpen(false);
          }}
        >
          <section className="ul-export-dialog" role="dialog" aria-modal="true" aria-labelledby="ul-export-title">
            <header>
              <div>
                <h2 id="ul-export-title">Export Usage Report</h2>
                <p>Choose a format for the current usage data.</p>
              </div>
              <button type="button" className="ul-export-close" aria-label="Close" onClick={() => setExportOpen(false)}>
                <X size={16} />
              </button>
            </header>
            <div className="ul-export-options">
              {[
                { value: 'pdf', label: 'PDF', detail: 'Print-ready report' },
                { value: 'word', label: 'Word (.docx)', detail: 'Editable document' },
                { value: 'excel', label: 'Excel (.xlsx)', detail: 'Company-wise data sheets' }
              ].map((option) => (
                <label key={option.value} className={`ul-export-option ${exportFormat === option.value ? 'selected' : ''}`}>
                  <input type="radio" name="usage-export-format" value={option.value} checked={exportFormat === option.value} onChange={() => setExportFormat(option.value)} />
                  <span><strong>{option.label}</strong><small>{option.detail}</small></span>
                </label>
              ))}
            </div>
            <footer>
              <button type="button" className="ul-export-cancel" onClick={() => setExportOpen(false)}>Cancel</button>
              <button type="button" className="ul-export-confirm" onClick={async () => {
                await downloadReport(exportFormat);
                setExportOpen(false);
              }}>
                <ArrowDownToLine size={14} /> Export
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
