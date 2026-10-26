import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  List,
  Users,
  LogIn,
  ShieldAlert,
  XCircle,
  CalendarDays,
  Download,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
  AlertTriangle,
  ShieldCheck,
  X,
  FileText,
  RefreshCw,
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';

import { AUDIT_LOGS, AUDIT_CATEGORIES, CRITICAL_EVENTS } from '../data/auditLogsData.js';
import './audit-logs.css';

const PAGE_SIZE = 6;

/* ------------------------------------------------------------------ */
/* Date helpers                                                        */
/* ------------------------------------------------------------------ */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_MS = 86400000;

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date, amount) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);

const diffInDays = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / DAY_MS);

const formatDate = (date) =>
  `${MONTHS[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;

const toInputValue = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

const fromInputValue = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const parseLogDate = (timestamp) => {
  const match = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/.exec(timestamp || '');
  if (!match) return null;
  const monthIndex = MONTHS.indexOf(match[2]);
  if (monthIndex === -1) return null;
  return new Date(Number(match[3]), monthIndex, Number(match[1]));
};

const TODAY = startOfDay(new Date());

function buildPresets(today) {
  const year = today.getFullYear();
  const month = today.getMonth();
  const quarter = Math.floor(month / 3);
  const lastQuarter = quarter === 0 ? 3 : quarter - 1;
  const lastQuarterYear = quarter === 0 ? year - 1 : year;
  const lastMonthDate = new Date(year, month - 1, 1);

  return [
    { id: 'last-7', label: 'Last 7 Days', start: addDays(today, -6), end: today },
    { id: 'last-30', label: 'Last 30 Days', start: addDays(today, -29), end: today },
    { id: 'last-90', label: 'Last 90 Days', start: addDays(today, -89), end: today },
    {
      id: 'this-month',
      label: 'This Month',
      start: new Date(year, month, 1),
      end: new Date(year, month + 1, 0),
    },
    {
      id: 'last-month',
      label: `${MONTH_NAMES[lastMonthDate.getMonth()]} ${lastMonthDate.getFullYear()}`,
      start: lastMonthDate,
      end: new Date(year, month, 0),
    },
    {
      id: 'last-quarter',
      label: `Q${lastQuarter + 1} ${lastQuarterYear}`,
      start: new Date(lastQuarterYear, lastQuarter * 3, 1),
      end: new Date(lastQuarterYear, lastQuarter * 3 + 3, 0),
    },
    {
      id: 'ytd',
      label: 'Year to date',
      start: new Date(year, 0, 1),
      end: new Date(year, month + 1, 0),
    },
    {
      id: 'last-12',
      label: 'Last 12 months',
      start: new Date(year, month - 11, 1),
      end: new Date(year, month + 1, 0),
    },
  ];
}

const PRESETS = buildPresets(TODAY);
const DEFAULT_RANGE = PRESETS.find((preset) => preset.id === 'this-month');

/* ------------------------------------------------------------------ */
/* Chart data generation (changes with the selected date range)        */
/* ------------------------------------------------------------------ */

const hashUnit = (date, salt) => {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const value = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const dailyEvents = (date) => Math.round(1150 + hashUnit(date, 1) * 1100);
const dailySecurity = (date) => Math.round(120 + hashUnit(date, 2) * 300);

function sumRange(start, end) {
  let events = 0;
  let security = 0;

  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    events += dailyEvents(cursor);
    security += dailySecurity(cursor);
  }

  return { events, security };
}

function buildTrend(start, end) {
  const effectiveEnd = end > TODAY ? TODAY : end;

  if (effectiveEnd < start) {
    return { points: [], granularity: 'Daily', total: 0 };
  }

  const days = diffInDays(start, effectiveEnd) + 1;
  const points = [];
  let granularity = 'Daily';

  if (days <= 31) {
    for (let index = 0; index < days; index += 1) {
      const day = addDays(start, index);
      const label =
        days <= 7
          ? WEEKDAYS[day.getDay()]
          : `${MONTHS[day.getMonth()]} ${day.getDate()}`;

      points.push({
        label,
        events: dailyEvents(day),
        security: dailySecurity(day),
      });
    }
  } else if (days <= 120) {
    granularity = 'Weekly';

    for (let cursor = start; cursor <= effectiveEnd; cursor = addDays(cursor, 7)) {
      const weekEnd = addDays(cursor, 6);
      const bucketEnd = weekEnd > effectiveEnd ? effectiveEnd : weekEnd;

      points.push({
        label: `${MONTHS[cursor.getMonth()]} ${cursor.getDate()}`,
        ...sumRange(cursor, bucketEnd),
      });
    }
  } else {
    granularity = 'Monthly';
    const spansYears = start.getFullYear() !== effectiveEnd.getFullYear();
    let cursor = start;

    while (cursor <= effectiveEnd) {
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
      const bucketEnd = monthEnd > effectiveEnd ? effectiveEnd : monthEnd;

      points.push({
        label: spansYears
          ? `${MONTHS[cursor.getMonth()]} '${String(cursor.getFullYear()).slice(-2)}`
          : MONTHS[cursor.getMonth()],
        ...sumRange(cursor, bucketEnd),
      });

      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
  }

  const total = points.reduce((sum, point) => sum + point.events, 0);

  return { points, granularity, total };
}

const BASELINE_EVENTS =
  buildTrend(DEFAULT_RANGE.start, DEFAULT_RANGE.end).total || 1;

function allocate(total, weights) {
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0) || 1;
  const parts = weights.map((weight) => Math.floor((total * weight) / weightSum));
  parts[0] += total - parts.reduce((sum, part) => sum + part, 0);
  return parts;
}

const DATED_LOGS = AUDIT_LOGS.map((log) => ({
  ...log,
  dateValue: parseLogDate(log.timestamp),
}));

/* ------------------------------------------------------------------ */
/* Static config                                                       */
/* ------------------------------------------------------------------ */

const KPI_DATA = [
  {
    id: 'total',
    title: 'Total Events',
    base: 12846,
    icon: List,
    color: 'blue',
    subtitle: 'Total Events',
    change: '+8%',
    breakdown: [
      { label: 'Successful', base: 12786 },
      { label: 'Blocked', base: 18 },
      { label: 'Failed', base: 42 },
    ],
    match: () => true,
  },
  {
    id: 'admin',
    title: 'Admin Actions',
    base: 1284,
    icon: Users,
    color: 'purple',
    subtitle: 'Admin Actions',
    change: '+5%',
    breakdown: [
      { label: 'Updated', base: 704 },
      { label: 'Created', base: 312 },
      { label: 'Deleted', base: 96 },
      { label: 'Other', base: 172 },
    ],
    match: (log) => log.role === 'Platform Admin',
  },
  {
    id: 'login',
    title: 'Login Events',
    base: 8932,
    icon: LogIn,
    color: 'green',
    subtitle: 'Login Events',
    change: '+11%',
    breakdown: [
      { label: 'Successful logins', base: 8812 },
      { label: 'Failed logins', base: 120 },
    ],
    match: (log) => log.category === 'Authentication',
  },
  {
    id: 'security',
    title: 'Security Alerts',
    base: 18,
    icon: ShieldAlert,
    color: 'orange',
    subtitle: 'Security Alerts',
    change: '-6%',
    breakdown: [
      { label: 'Critical', base: 3 },
      { label: 'High', base: 5 },
      { label: 'Medium', base: 6 },
      { label: 'Low', base: 4 },
    ],
    match: (log) => log.category === 'Security',
  },
  {
    id: 'failed',
    title: 'Failed Actions',
    base: 42,
    icon: XCircle,
    color: 'red',
    subtitle: 'Failed Actions',
    change: '-3%',
    breakdown: [
      { label: 'Failed logins', base: 28 },
      { label: 'Failed updates', base: 9 },
      { label: 'Failed API calls', base: 5 },
    ],
    match: (log) => log.status === 'Failed',
  },
];

const STATUS_OPTIONS = ['All Statuses', 'Success', 'Blocked', 'Failed'];
const CATEGORY_OPTIONS = ['All Categories', 'Billing', 'Security', 'Authentication', 'Business', 'Access'];
const ACTION_OPTIONS = ['All Actions', 'Updated', 'Unauthorized', 'Login', 'Created', 'Deleted'];
const USER_OPTIONS = ['All Users', ...new Set(AUDIT_LOGS.map((log) => log.user))];

/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }) {
  return (
    <span className={`audit-status audit-status-${status.toLowerCase()}`}>
      <span className="audit-status-dot" />
      {status}
    </span>
  );
}

function SectionHeader({ icon: Icon, title, action }) {
  return (
    <div className="audit-section-header">
      <div className="audit-section-title">
        <span className="audit-small-icon">
          <Icon size={17} />
        </span>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

function DateRangePicker({ range, presets, onChange }) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(toInputValue(range.start));
  const [to, setTo] = useState(toInputValue(range.end));
  const [error, setError] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      setFrom(toInputValue(range.start));
      setTo(toInputValue(range.end));
      setError('');
    }
    setOpen(!open);
  };

  const choosePreset = (preset) => {
    onChange(preset);
    setOpen(false);
  };

  const applyCustom = () => {
    if (!from || !to) {
      setError('Please select both dates.');
      return;
    }

    const start = fromInputValue(from);
    const end = fromInputValue(to);

    if (start > end) {
      setError('From date must be on or before the To date.');
      return;
    }

    onChange({ id: 'custom', label: 'Custom Range', start, end });
    setOpen(false);
  };

  const triggerLabel =
    range.id === 'custom'
      ? `${formatDate(range.start)} – ${formatDate(range.end)}`
      : range.label;

  return (
    <div className="audit-date-picker" ref={containerRef}>
      <button
        type="button"
        className="audit-date-trigger"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <CalendarDays size={16} />
        <span>{triggerLabel}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="audit-date-popover" role="dialog" aria-label="Select date range">
          <div className="audit-date-options">
            {presets.map((preset) => (
              <button
                type="button"
                key={preset.id}
                className={`audit-date-option ${range.id === preset.id ? 'active' : ''}`}
                onClick={() => choosePreset(preset)}
              >
                <strong>{preset.label}</strong>
                <span>
                  {formatDate(preset.start)} – {formatDate(preset.end)}
                </span>
              </button>
            ))}
          </div>

          <div className={`audit-date-custom ${range.id === 'custom' ? 'active' : ''}`}>
            <strong>Custom range</strong>

            <label>
              <span>From</span>
              <input
                type="date"
                value={from}
                onChange={(event) => {
                  setFrom(event.target.value);
                  setError('');
                }}
              />
            </label>

            <label>
              <span>To</span>
              <input
                type="date"
                value={to}
                onChange={(event) => {
                  setTo(event.target.value);
                  setError('');
                }}
              />
            </label>

            {error && <p className="audit-date-error">{error}</p>}

            <button
              type="button"
              className="audit-primary-button audit-date-apply"
              onClick={applyCustom}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function AuditLogs() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [userFilter, setUserFilter] = useState('All Users');
  const [range, setRange] = useState(DEFAULT_RANGE);
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showCriticalEvents, setShowCriticalEvents] = useState(false);
  const [activeKpi, setActiveKpi] = useState(null);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setSelectedLog(null);
        setShowCriticalEvents(false);
        setActiveKpi(null);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleRangeChange = (nextRange) => {
    setRange(nextRange);
    setPage(1);
  };

  const chartRangeOptions = useMemo(
    () =>
      range.id === 'custom'
        ? [...PRESETS, { id: 'custom', label: 'Custom Range' }]
        : PRESETS,
    [range.id]
  );

  const trend = useMemo(() => buildTrend(range.start, range.end), [range]);

  const scale = trend.total / BASELINE_EVENTS;
  const scaleValue = (value) => Math.round(value * scale);

  const kpiCards = KPI_DATA.map((item) => ({
    ...item,
    total: scaleValue(item.base),
  }));

  const categoryData = useMemo(
    () =>
      AUDIT_CATEGORIES.map((item) => ({
        ...item,
        count: Math.round(item.count * scale),
      })),
    [scale]
  );

  const rangeLogs = useMemo(
    () =>
      DATED_LOGS.filter(
        (log) =>
          !log.dateValue ||
          (log.dateValue >= range.start && log.dateValue <= range.end)
      ),
    [range]
  );

  const filteredLogs = useMemo(() => {
    const query = search.toLowerCase().trim();

    return rangeLogs.filter((log) => {
      const matchesSearch =
        !query ||
        [
          log.user,
          log.role,
          log.action,
          log.category,
          log.ip,
          log.status,
          log.timestamp,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === 'All Statuses' || log.status === statusFilter;

      const matchesCategory =
        categoryFilter === 'All Categories' ||
        log.category === categoryFilter;

      const matchesAction =
        actionFilter === 'All Actions' ||
        log.action.toLowerCase().includes(actionFilter.toLowerCase());

      const matchesUser =
        userFilter === 'All Users' || log.user === userFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesAction &&
        matchesUser
      );
    });
  }, [rangeLogs, search, statusFilter, categoryFilter, actionFilter, userFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const visibleLogs = filteredLogs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('All Statuses');
    setCategoryFilter('All Categories');
    setActionFilter('All Actions');
    setUserFilter('All Users');
    setPage(1);
  };

  const notify = (message) => {
    setNotification(message);
    window.setTimeout(() => setNotification(''), 2500);
  };

  const exportLogs = () => {
    const headers = [
      'Timestamp',
      'User',
      'Role',
      'Action',
      'Category',
      'IP Address',
      'Status',
    ];

    const rows = filteredLogs.map((log) => [
      log.timestamp,
      log.user,
      log.role,
      log.action,
      log.category,
      log.ip,
      log.status,
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? '').replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(','))
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'megsi-audit-logs.csv';
    link.click();

    URL.revokeObjectURL(url);
    notify('Audit logs exported successfully.');
  };

  const exportLogDetails = (log) => {
    const content = [
      `id: ${log.id}`,
      `timestamp: ${log.timestamp}`,
      `user: ${log.user}`,
      `role: ${log.role}`,
      `action: ${log.action}`,
      `category: ${log.category}`,
      `ip: ${log.ip}`,
      `status: ${log.status}`,
      `description: ${log.description}`,
    ].join('\n');

    const blob = new Blob([content], {
      type: 'text/plain;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-log-${log.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeFilters = Boolean(
    search ||
      statusFilter !== 'All Statuses' ||
      categoryFilter !== 'All Categories' ||
      actionFilter !== 'All Actions' ||
      userFilter !== 'All Users'
  );

  const panelKpi = kpiCards.find((item) => item.id === activeKpi) || null;

  const panelParts = panelKpi
    ? allocate(
        panelKpi.total,
        panelKpi.breakdown.map((part) => part.base)
      )
    : [];

  const panelRows = panelKpi
    ? [
        [panelKpi.title, panelKpi.total.toLocaleString('en-US')],
        ['Change', panelKpi.change],
        ['Date range', `${formatDate(range.start)} – ${formatDate(range.end)}`],
        ...panelKpi.breakdown.map((part, index) => [
          part.label,
          panelParts[index].toLocaleString('en-US'),
        ]),
      ]
    : [];

  const panelLogs = panelKpi ? rangeLogs.filter(panelKpi.match) : [];

  return (
    <div className="audit-page">
      {notification && (
        <div className="audit-toast">
          <ShieldCheck size={17} />
          {notification}
          <button onClick={() => setNotification('')} aria-label="Close notification">
            <X size={15} />
          </button>
        </div>
      )}

      <div className="audit-page-heading">
        <div>
          <h1>Audit Logs</h1>
          <p>
            Track administrative activities, user actions, and important
            changes across the MEGSI platform.
          </p>
        </div>

        <div className="audit-heading-actions">
          <DateRangePicker
            range={range}
            presets={PRESETS}
            onChange={handleRangeChange}
          />

          <button className="audit-primary-button" onClick={exportLogs}>
            <Download size={16} />
            Export Logs
          </button>
        </div>
      </div>

      <section className="audit-kpi-grid">
        {kpiCards.map((item) => {
          const Icon = item.icon;

          return (
            <button
              type="button"
              className={`audit-kpi-card ${activeKpi === item.id ? 'active' : ''}`}
              key={item.id}
              onClick={() => setActiveKpi(item.id)}
              aria-haspopup="dialog"
              aria-label={`View ${item.title} details`}
            >
              <div className={`audit-kpi-icon ${item.color}`}>
                <Icon size={27} strokeWidth={2.3} />
              </div>

              <div className="audit-kpi-content">
                <span>{item.title}</span>
                <strong>{item.total.toLocaleString('en-US')}</strong>
                <small>{item.subtitle}</small>
              </div>
            </button>
          );
        })}
      </section>

      <section className="audit-panel audit-overview-panel">
        <SectionHeader
          icon={Activity}
          title="Audit Activity Overview"
          action={
            <select
              className="audit-compact-select"
              value={range.id}
              onChange={(event) => {
                const next = PRESETS.find((preset) => preset.id === event.target.value);
                if (next) handleRangeChange(next);
              }}
              aria-label="Chart date range"
            >
              {chartRangeOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          }
        />

        <div className="audit-chart-legend">
          <span className="audit-chart-range">
            {formatDate(range.start)} – {formatDate(range.end)} · {trend.granularity}
          </span>

          <div className="audit-chart-legend-items">
            <span>
              <i className="legend-blue" />
              Audit Events
            </span>
            <span>
              <i className="legend-orange" />
              Security Events
            </span>
          </div>
        </div>

        <div className="audit-line-chart">
          {trend.points.length === 0 ? (
            <div className="audit-chart-empty">No audit activity for the selected period.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trend.points}
                margin={{ top: 8, right: 15, left: 5, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="auditBlueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2476dc" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2476dc" stopOpacity={0.03} />
                  </linearGradient>
                  <linearGradient id="auditOrangeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ed9b25" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#ed9b25" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#e3eaf2"
                  vertical
                  horizontal
                  strokeDasharray="0"
                />

                <XAxis
                  dataKey="label"
                  tick={{ fill: '#475569', fontSize: 11 }}
                  axisLine={{ stroke: '#dce5ef' }}
                  tickLine={false}
                  minTickGap={14}
                />

                <YAxis
                  domain={[0, 'auto']}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                  tickFormatter={(value) => value.toLocaleString('en-US')}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #dbe5f0',
                    fontSize: 12,
                  }}
                  formatter={(value) => Number(value).toLocaleString('en-US')}
                />

                <Area
                  type="monotone"
                  dataKey="events"
                  name="Audit Events"
                  stroke="#1767c9"
                  strokeWidth={2.5}
                  fill="url(#auditBlueGradient)"
                  activeDot={{ r: 5 }}
                  dot={trend.points.length > 40 ? false : { r: 3, fill: '#1767c9', strokeWidth: 1 }}
                />

                <Area
                  type="monotone"
                  dataKey="security"
                  name="Security Events"
                  stroke="#ed9b25"
                  strokeWidth={2}
                  fill="url(#auditOrangeGradient)"
                  activeDot={{ r: 4 }}
                  dot={trend.points.length > 40 ? false : { r: 2.5, fill: '#ed9b25', strokeWidth: 1 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="audit-panel audit-table-panel">
        <SectionHeader
          icon={FileText}
          title="Recent Audit Logs"
          action={
            <span className="audit-result-count">
              {filteredLogs.length} records
            </span>
          }
        />

        <div className="audit-table-toolbar">
          <div className="audit-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search user, action, company, or IP..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <select
            value={actionFilter}
            onChange={(event) => {
              setActionFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by action"
          >
            {ACTION_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <select
            value={userFilter}
            onChange={(event) => {
              setUserFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by user"
          >
            {USER_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by category"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by status"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          {activeFilters && (
            <button className="audit-reset-button" onClick={resetFilters}>
              <RefreshCw size={13} />
              Reset
            </button>
          )}
        </div>

        <div className="audit-table-wrapper">
          <table className="audit-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Timestamp</th>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Category</th>
                <th>IP Address</th>
                <th>Status</th>
                <th>Details / Actions</th>
              </tr>
            </thead>

            <tbody>
              {visibleLogs.map((log, index) => (
                <tr key={log.id}>
                  <td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>

                  <td className="audit-timestamp">{log.timestamp}</td>

                  <td>
                    <div className="audit-user-cell">
                      <span className={`audit-avatar ${log.avatarColor}`}>
                        {log.user === 'Unknown User'
                          ? <Users size={15} />
                          : log.user
                              .split(' ')
                              .map((part) => part[0])
                              .join('')
                              .slice(0, 2)}
                      </span>
                      <span>{log.user}</span>
                    </div>
                  </td>

                  <td>{log.role}</td>

                  <td className="audit-action-cell">{log.action}</td>

                  <td>{log.category}</td>

                  <td className="audit-ip">{log.ip}</td>

                  <td>
                    <StatusBadge status={log.status} />
                  </td>

                  <td>
                    <div className="audit-row-actions">
                      <button
                        className="audit-details-button"
                        onClick={() => setSelectedLog(log)}
                      >
                        Details / Actions
                      </button>

                      <button
                        className="audit-more-button"
                        onClick={() => setSelectedLog(log)}
                        aria-label={`View actions for ${log.user}`}
                      >
                        <MoreVertical size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {visibleLogs.length === 0 && (
                <tr>
                  <td colSpan="9" className="audit-empty">
                    <Search size={28} />
                    <strong>No audit logs found</strong>
                    <span>Try changing your search, filters, or date range.</span>
                    <button
                      onClick={() => {
                        resetFilters();
                        handleRangeChange(DEFAULT_RANGE);
                      }}
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="audit-table-footer">
          <span>
            Showing{' '}
            {filteredLogs.length === 0
              ? 0
              : (currentPage - 1) * PAGE_SIZE + 1}
            –
            {Math.min(currentPage * PAGE_SIZE, filteredLogs.length)} of{' '}
            {filteredLogs.length} events
          </span>

          <div className="audit-pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setPage(1)}
              aria-label="First page"
            >
              <ChevronsLeft size={16} />
            </button>

            <button
              disabled={currentPage === 1}
              onClick={() => setPage((previous) => previous - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter((number) => {
                return (
                  number === 1 ||
                  number === totalPages ||
                  Math.abs(number - currentPage) <= 1
                );
              })
              .map((number, index, array) => (
                <span className="audit-page-number-wrapper" key={number}>
                  {index > 0 && array[index - 1] !== number - 1 && (
                    <span className="audit-page-ellipsis">…</span>
                  )}
                  <button
                    className={number === currentPage ? 'active' : ''}
                    onClick={() => setPage(number)}
                  >
                    {number}
                  </button>
                </span>
              ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setPage((previous) => previous + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setPage(totalPages)}
              aria-label="Last page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <div className="audit-bottom-grid">
        <section className="audit-panel audit-critical-panel">
          <SectionHeader
            icon={ShieldCheck}
            title="Recent Critical Events"
            action={
              <button
                className="audit-view-all"
                onClick={() => setShowCriticalEvents(true)}
              >
                View All
              </button>
            }
          />

          <div className="audit-timeline">
            {CRITICAL_EVENTS.slice(0, 3).map((event) => (
              <div className="audit-timeline-item" key={event.id}>
                <span className={`audit-timeline-marker ${event.color}`}>
                  {event.color === 'red'
                    ? <AlertTriangle size={13} />
                    : <span />}
                </span>

                <div className="audit-timeline-content">
                  <strong>{event.title}</strong>
                  <span>{event.timestamp}</span>
                </div>

                <small>{event.age}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="audit-panel audit-category-panel">
          <SectionHeader
            icon={Activity}
            title="Audit Activity by Category"
            action={
              <button
                className="audit-view-all"
                onClick={() => setShowCriticalEvents(true)}
              >
                View All
              </button>
            }
          />

          <div className="audit-category-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 4, right: 12, bottom: 0, left: 5 }}
              >
                <CartesianGrid
                  stroke="#e7edf4"
                  vertical
                  horizontal={false}
                />

                <XAxis type="number" hide />

                <YAxis
                  type="category"
                  dataKey="category"
                  width={118}
                  tick={{ fill: '#27354b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  cursor={{ fill: '#f1f6fd' }}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #dbe5f0',
                    fontSize: 12,
                  }}
                  formatter={(value) => Number(value).toLocaleString('en-US')}
                />

                <Bar
                  dataKey="count"
                  name="Events"
                  fill="#2679e8"
                  radius={[0, 3, 3, 0]}
                  barSize={15}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {panelKpi && (
        <div className="audit-side-backdrop" onClick={() => setActiveKpi(null)}>
          <aside
            className="audit-side-panel"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="audit-side-title"
          >
            <div className="audit-side-header">
              <h2 id="audit-side-title">{panelKpi.title}</h2>

              <button
                className="audit-modal-close"
                onClick={() => setActiveKpi(null)}
                aria-label="Close details panel"
              >
                <X size={18} />
              </button>
            </div>

            <div className="audit-side-body">
              {panelRows.map(([label, value]) => (
                <div className="audit-side-row" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}

              <p className="audit-side-note">
                Demonstration data only — not connected to a backend.
              </p>

              <h3 className="audit-side-subtitle">
                Related audit logs ({panelLogs.length})
              </h3>

              {panelLogs.length === 0 ? (
                <p className="audit-side-empty">
                  No matching audit logs in the selected period.
                </p>
              ) : (
                <div className="audit-side-logs">
                  {panelLogs.slice(0, 5).map((log) => (
                    <button
                      type="button"
                      className="audit-side-log"
                      key={log.id}
                      onClick={() => {
                        setActiveKpi(null);
                        setSelectedLog(log);
                      }}
                    >
                      <div>
                        <strong>{log.action}</strong>
                        <span>
                          {log.user} · {log.timestamp}
                        </span>
                      </div>
                      <StatusBadge status={log.status} />
                    </button>
                  ))}

                  {panelLogs.length > 5 && (
                    <p className="audit-side-more">
                      Showing 5 of {panelLogs.length} logs
                    </p>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {selectedLog && (
        <div
          className="audit-modal-backdrop"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="audit-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="audit-detail-title"
          >
            <div className="audit-modal-header">
              <div>
                <span className="audit-modal-icon">
                  <FileText size={20} />
                </span>
                <div>
                  <h2 id="audit-detail-title">Audit Log Details</h2>
                  <p>Event ID: {selectedLog.id}</p>
                </div>
              </div>

              <button
                className="audit-modal-close"
                onClick={() => setSelectedLog(null)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="audit-modal-body">
              <div className="audit-detail-status">
                <span>Event Status</span>
                <StatusBadge status={selectedLog.status} />
              </div>

              {[
                ['Timestamp', selectedLog.timestamp],
                ['User', selectedLog.user],
                ['Role', selectedLog.role],
                ['Action', selectedLog.action],
                ['Category', selectedLog.category],
                ['IP Address', selectedLog.ip],
                ['Description', selectedLog.description],
              ].map(([label, value]) => (
                <div className="audit-detail-row" key={label}>
                  <span>{label}</span>
                  <strong>{value || 'No additional description available.'}</strong>
                </div>
              ))}
            </div>

            <div className="audit-modal-footer">
              <button
                className="audit-modal-secondary"
                onClick={() => setSelectedLog(null)}
              >
                Close
              </button>

              <button
                className="audit-primary-button"
                onClick={() => exportLogDetails(selectedLog)}
              >
                <Download size={15} />
                Export Details
              </button>
            </div>
          </div>
        </div>
      )}

      {showCriticalEvents && (
        <div
          className="audit-modal-backdrop"
          onClick={() => setShowCriticalEvents(false)}
        >
          <div
            className="audit-modal audit-events-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="audit-modal-header">
              <div>
                <span className="audit-modal-icon">
                  <ShieldCheck size={20} />
                </span>
                <div>
                  <h2>Recent Critical Events</h2>
                  <p>Important platform activity and security events</p>
                </div>
              </div>

              <button
                className="audit-modal-close"
                onClick={() => setShowCriticalEvents(false)}
                aria-label="Close events"
              >
                <X size={20} />
              </button>
            </div>

            <div className="audit-all-events">
              {CRITICAL_EVENTS.map((event) => (
                <div className="audit-all-event-item" key={event.id}>
                  <span className={`audit-timeline-marker ${event.color}`}>
                    {event.color === 'red'
                      ? <AlertTriangle size={13} />
                      : <span />}
                  </span>
                  <div>
                    <strong>{event.title}</strong>
                    <p>{event.timestamp}</p>
                    <small>{event.age}</small>
                  </div>
                </div>
              ))}
            </div>

            <div className="audit-modal-footer">
              <button
                className="audit-modal-secondary"
                onClick={() => setShowCriticalEvents(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLogs;