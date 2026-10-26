import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  ShieldCheck,
  AlertTriangle,
  LockKeyhole,
  CheckCircle2,
  Smartphone,
  Bell,
  CalendarDays,
  Download,
  Settings,
  Search,
  ChevronDown,
  MoreHorizontal,
  BarChart3,
  ClipboardCheck,
  X,
  ArrowLeft,
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import {
  DEMO_NOW,
  DATA_MIN,
  DATA_MAX,
  DATE_PRESETS,
  SECURITY_ALERTS,
  COMPLIANCE_COLORS,
  COMPLIANCE_REASONS,
  parseISODate,
  addDaysISO,
  getSummary,
  getTrend,
  getHourly,
} from '../data/securityComplianceData.js';

import './security-compliance.css';

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

const initialSettings = {
  mfa: true,
  alerts: true,
  sessionTimeout: true,
  ipMonitoring: false,
};

const SETTING_ROWS = [
  [
    'mfa',
    'Require multi-factor authentication',
    'Require an additional verification step for supported accounts.',
  ],
  [
    'alerts',
    'Security alert notifications',
    'Show notifications when potentially risky events are detected.',
  ],
  [
    'sessionTimeout',
    'Automatic session timeout',
    'End inactive sessions after the configured timeout.',
  ],
  [
    'ipMonitoring',
    'Unusual IP monitoring',
    'Flag sign-ins from unfamiliar IP addresses for review.',
  ],
];

const severityOptions = ['All', 'Critical', 'High', 'Medium', 'Low'];
const statusOptions = ['All', 'Open', 'Investigating', 'Resolved'];

const CHART_WINDOWS = [
  'Selected range',
  'Last 7 Days',
  'Last 30 Days',
];

const COMPLIANCE_NAMES = [
  'Compliant',
  'Needs Attention',
  'Non-Compliant',
];

const PAGE_SIZE = 8;
const DAY_MS = 86400000;

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const pad = (n) => String(n).padStart(2, '0');

/* ------------------------------------------------------------------ */
/* Date helpers                                                        */
/* ------------------------------------------------------------------ */

function formatDate(timestamp) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${pad(date.getDate())} ${
    MONTHS[date.getMonth()]
  } ${date.getFullYear()} ${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
}

function formatLong(iso) {
  const date = parseISODate(iso);

  return `${MONTHS[date.getMonth()]} ${pad(
    date.getDate()
  )}, ${date.getFullYear()}`;
}

function formatShort(iso) {
  const date = parseISODate(iso);

  return `${pad(date.getDate())} ${
    MONTHS[date.getMonth()]
  } ${date.getFullYear()}`;
}

function inRange(timestamp, range) {
  const timestampValue = Date.parse(timestamp);

  if (Number.isNaN(timestampValue)) {
    return false;
  }

  const start = parseISODate(range.start).getTime();
  const end =
    parseISODate(range.end).getTime() + DAY_MS - 1;

  return timestampValue >= start && timestampValue <= end;
}

function getDateBoundary(filter) {
  const start = new Date(DEMO_NOW);

  if (filter === 'Today') {
    start.setHours(0, 0, 0, 0);
    return start.getTime();
  }

  if (filter === 'Last 7 Days') {
    start.setDate(start.getDate() - 7);
    return start.getTime();
  }

  if (filter === 'Last 30 Days') {
    start.setDate(start.getDate() - 30);
    return start.getTime();
  }

  return null;
}

function ratingFor(score) {
  if (score >= 95) return 'Excellent';
  if (score >= 90) return 'Strong';
  if (score >= 80) return 'Fair';

  return 'At risk';
}

/* ------------------------------------------------------------------ */
/* CSV export                                                          */
/* ------------------------------------------------------------------ */

function downloadCsv(rows) {
  const headers = [
    'Event ID',
    'Company / Tenant',
    'Security Event',
    'Severity',
    'Source / IP Address',
    'Date & Time',
    'Status',
  ];

  const quote = (value) =>
    `"${String(value ?? '').replace(/"/g, '""')}"`;

  const csv = [
    headers,
    ...rows.map((row) => [
      row.id,
      row.company,
      row.event,
      row.severity,
      row.note ? `${row.ip} (${row.note})` : row.ip,
      formatDate(row.timestamp),
      row.status,
    ]),
  ]
    .map((row) => row.map(quote).join(','))
    .join('\r\n');

  const blob = new Blob(['\uFEFF', csv], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'megsi-security-report.csv';

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* Metric card                                                         */
/* ------------------------------------------------------------------ */

function MetricCard({
  icon: Icon,
  title,
  value,
  tone,
  onClick,
}) {
  return (
    <button
      type="button"
      className="sc-metric-card"
      onClick={onClick}
      aria-label={`${title}: ${value}. Open details`}
    >
      <div className={`sc-metric-icon ${tone}`}>
        <Icon size={25} strokeWidth={2.4} />
      </div>

      <div className="sc-metric-copy">
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Segmented filters                                                   */
/* ------------------------------------------------------------------ */

function Segmented({
  label,
  options,
  value,
  onChange,
}) {
  return (
    <div
      className="sc-filter-group"
      role="group"
      aria-label={label}
    >
      <span>{label}</span>

      <div className="sc-segmented">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Date range picker                                                   */
/* ------------------------------------------------------------------ */

function DateRangePicker({ value, onApply }) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(value.start);
  const [to, setTo] = useState(value.end);

  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onDown = (event) => {
      if (
        ref.current &&
        !ref.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      setFrom(value.start);
      setTo(value.end);
    }

    setOpen((previous) => !previous);
  };

  const invalid = !from || !to || from > to;

  const outside =
    !invalid && (from > DATA_MAX || to < DATA_MIN);

  let error = '';

  if (invalid) {
    error = 'The From date must be on or before the To date.';
  } else if (outside) {
    error = `Sample data covers ${formatShort(
      DATA_MIN
    )} – ${formatShort(DATA_MAX)}.`;
  }

  const applyCustom = () => {
    if (invalid || outside) return;

    const start = from < DATA_MIN ? DATA_MIN : from;
    const end = to > DATA_MAX ? DATA_MAX : to;

    onApply({
      id: 'custom',
      label: `${formatShort(start)} – ${formatShort(end)}`,
      start,
      end,
    });

    setOpen(false);
  };

  return (
    <div className="sc-range" ref={ref}>
      <button
        type="button"
        className="sc-range-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
      >
        <CalendarDays size={16} />

        <span>{value.label}</span>

        <ChevronDown size={14} />
      </button>

      {open && (
        <div
          className="sc-range-panel"
          role="dialog"
          aria-label="Select date range"
        >
          <ul className="sc-range-list">
            {DATE_PRESETS.map((preset) => (
              <li key={preset.id}>
                <button
                  type="button"
                  className={`sc-range-item${
                    value.id === preset.id ? ' is-active' : ''
                  }`}
                  onClick={() => {
                    onApply(preset);
                    setOpen(false);
                  }}
                >
                  <b>{preset.label}</b>

                  <small>
                    {formatLong(preset.start)} –{' '}
                    {formatLong(preset.end)}
                  </small>
                </button>
              </li>
            ))}
          </ul>

          <div className="sc-range-custom">
            <h4>Custom range</h4>

            <label>
              <span>From</span>

              <input
                type="date"
                value={from}
                min={DATA_MIN}
                max={DATA_MAX}
                onChange={(event) =>
                  setFrom(event.target.value)
                }
              />
            </label>

            <label>
              <span>To</span>

              <input
                type="date"
                value={to}
                min={DATA_MIN}
                max={DATA_MAX}
                onChange={(event) =>
                  setTo(event.target.value)
                }
              />
            </label>

            {error && (
              <p className="sc-range-error">{error}</p>
            )}

            <button
              type="button"
              className="sc-button sc-primary sc-range-apply"
              disabled={invalid || outside}
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
/* Main Security Compliance page                                       */
/* ------------------------------------------------------------------ */

export default function SecurityCompliance({
  toast,
  openDetail,
}) {
  const [range, setRange] = useState(DATE_PRESETS[0]);

  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('All');
  const [status, setStatus] = useState('All');
  const [eventType, setEventType] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Dates');

  const [page, setPage] = useState(1);

  const [chartWindow, setChartWindow] =
    useState('Last 7 Days');

  const [drill, setDrill] = useState([]);
  const [complianceDrill, setComplianceDrill] =
    useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(initialSettings);
  const [draft, setDraft] = useState(initialSettings);

  // Details panel for KPI cards and security alerts.
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Row menu coordinates for fixed positioning.
  const [openMenu, setOpenMenu] = useState(null);

  const notify = (message) => {
    if (typeof toast === 'function') {
      toast(message);
    } else {
      window.alert(message);
    }
  };

  /* -------------------------------------------------------------- */
  /* Data for selected date range                                   */
  /* -------------------------------------------------------------- */

  const summary = useMemo(
    () => getSummary(range.start, range.end),
    [range]
  );

  const days = useMemo(
    () =>
      Math.round(
        (parseISODate(range.end) -
          parseISODate(range.start)) /
          DAY_MS
      ) + 1,
    [range]
  );

  const rangeAlerts = useMemo(
    () =>
      SECURITY_ALERTS.filter((row) =>
        inRange(row.timestamp, range)
      ),
    [range]
  );

  const activeAlerts = useMemo(
    () =>
      rangeAlerts.filter(
        (row) =>
          (row.severity === 'Critical' ||
            row.severity === 'High') &&
          row.status !== 'Resolved'
      ),
    [rangeAlerts]
  );

  const complianceData = useMemo(
    () => [
      {
        name: 'Compliant',
        value: summary.compliant,
        color: COMPLIANCE_COLORS.Compliant,
      },
      {
        name: 'Needs Attention',
        value: summary.needs,
        color: COMPLIANCE_COLORS['Needs Attention'],
      },
      {
        name: 'Non-Compliant',
        value: summary.non,
        color: COMPLIANCE_COLORS['Non-Compliant'],
      },
    ],
    [summary]
  );

  const tenantCounts = useMemo(() => {
    const compliant = Math.round(
      (summary.compliant * summary.tenants) / 100
    );

    const needs = Math.round(
      (summary.needs * summary.tenants) / 100
    );

    return {
      Compliant: compliant,
      'Needs Attention': needs,
      'Non-Compliant': Math.max(
        0,
        summary.tenants - compliant - needs
      ),
    };
  }, [summary]);

  /* -------------------------------------------------------------- */
  /* KPI detail panel data                                          */
  /* -------------------------------------------------------------- */

  const countStatus = (name) =>
    rangeAlerts.filter((row) => row.status === name).length;

  const countActive = (sev) =>
    activeAlerts.filter((row) => row.severity === sev).length;

  const details = {
    score: {
      title: 'Security Score',
      rows: [
        ['Security score', `${summary.score}/100`],
        ['Rating', ratingFor(summary.score)],
        ['Alerts in period', rangeAlerts.length],
        ['Open', countStatus('Open')],
        ['Investigating', countStatus('Investigating')],
        ['Resolved', countStatus('Resolved')],
        ['Period', range.label],
      ],
    },

    threats: {
      title: 'Active Threats',
      rows: [
        ['Active threats', activeAlerts.length],
        ['Critical', countActive('Critical')],
        ['High', countActive('High')],
        [
          'Open',
          activeAlerts.filter(
            (row) => row.status === 'Open'
          ).length,
        ],
        [
          'Investigating',
          activeAlerts.filter(
            (row) => row.status === 'Investigating'
          ).length,
        ],
        ['Period', range.label],
      ],
    },

    failed: {
      title: 'Failed Login Attempts',
      rows: [
        ['Failed attempts', summary.failedLogins],
        [
          'Daily average',
          (summary.failedLogins / days).toFixed(1),
        ],
        [
          'Authentication alerts',
          rangeAlerts.filter(
            (row) => row.type === 'Authentication'
          ).length,
        ],
        [
          'Brute force alerts',
          rangeAlerts.filter(
            (row) => row.event === 'Brute Force Attack'
          ).length,
        ],
        ['Period', range.label],
      ],
    },

    compliance: {
      title: 'Compliance Rate',
      rows: [
        ['Compliance rate', `${summary.complianceRate}%`],
        ['Compliant tenants', tenantCounts.Compliant],
        [
          'Needs attention',
          tenantCounts['Needs Attention'],
        ],
        [
          'Non-compliant',
          tenantCounts['Non-Compliant'],
        ],
        ['Total tenants', summary.tenants],
        ['Period', range.label],
      ],
    },

    mfa: {
      title: 'MFA Enabled',
      rows: [
        ['MFA enabled', `${summary.mfa}%`],
        ['Not enabled', `${100 - summary.mfa}%`],
        ['Target', '90%'],
        [
          'Gap to target',
          `${Math.max(0, 90 - summary.mfa)} pts`,
        ],
        ['Period', range.label],
      ],
    },
  };

  const openMetric = (key) => {
    const detail = details[key];

    if (detail) {
      setSelectedDetail(detail);
      setOpenMenu(null);
    }
  };

  /* -------------------------------------------------------------- */
  /* Date range actions                                             */
  /* -------------------------------------------------------------- */

  const applyRange = (next) => {
    setRange(next);
    setChartWindow('Selected range');
    setDrill([]);
    setComplianceDrill(null);
    setOpenMenu(null);
    setSelectedDetail(null);
  };

  /* -------------------------------------------------------------- */
  /* Security events chart                                          */
  /* -------------------------------------------------------------- */

  const chartView = useMemo(() => {
    const top = drill[drill.length - 1];

    if (top && top.hourly) {
      return {
        mode: 'hour',
        points: getHourly(top.start),
      };
    }

    if (top) {
      return getTrend(top.start, top.end);
    }

    let start = range.start;

    if (chartWindow !== 'Selected range') {
      const numberOfDays =
        chartWindow === 'Last 30 Days' ? 30 : 7;

      const windowStart = addDaysISO(
        range.end,
        -(numberOfDays - 1)
      );

      start =
        windowStart > range.start
          ? windowStart
          : range.start;
    }

    return getTrend(start, range.end);
  }, [drill, range, chartWindow]);

  const yMax = useMemo(() => {
    const max = Math.max(
      0,
      ...chartView.points.flatMap((point) => [
        point.successful,
        point.failed,
        point.suspicious,
      ])
    );

    return chartView.mode === 'hour'
      ? Math.max(5, Math.ceil(max / 5) * 5)
      : Math.max(50, Math.ceil(max / 10) * 10);
  }, [chartView]);

  const drillable = chartView.mode !== 'hour';
  const showDots = chartView.points.length <= 14;

  const crumb = drill
    .map((item) => item.title)
    .join(' › ');

  const caption =
    chartView.mode === 'hour'
      ? 'Hourly activity (sample data)'
      : chartView.mode === 'day'
        ? 'Events per day'
        : chartView.mode === 'week'
          ? 'Average events per day, by week'
          : 'Average events per day, by month';

  const onChartClick = (state) => {
    if (!drillable || !state) return;

    const point = chartView.points.find(
      (item) => item.label === state.activeLabel
    );

    if (!point) return;

    setDrill((previous) => [
      ...previous,
      {
        title: point.title,
        start: point.start,
        end: point.end,
        hourly: point.start === point.end,
      },
    ]);
  };

  /* -------------------------------------------------------------- */
  /* Compliance chart drill-down                                    */
  /* -------------------------------------------------------------- */

  const reasonBars = useMemo(() => {
    if (!complianceDrill) return [];

    const reasons =
      COMPLIANCE_REASONS[complianceDrill] || [];

    const total = tenantCounts[complianceDrill] || 0;

    let left = total;

    return reasons.map((reason, index) => {
      const value =
        index === reasons.length - 1
          ? Math.max(0, left)
          : Math.round(total * reason.weight);

      left -= value;

      return {
        label: reason.label,
        value,
      };
    });
  }, [complianceDrill, tenantCounts]);

  const reasonMax = Math.max(
    1,
    ...reasonBars.map((bar) => bar.value)
  );

  const drillColor = complianceDrill
    ? COMPLIANCE_COLORS[complianceDrill]
    : '#0758f9';

  const drillPercent = complianceDrill
    ? complianceData.find(
        (item) => item.name === complianceDrill
      )?.value ?? 0
    : 0;

  const onSliceClick = (entry) => {
    const name = entry?.name ?? entry?.payload?.name;

    if (COMPLIANCE_NAMES.includes(name)) {
      setComplianceDrill(name);
    }
  };

  /* -------------------------------------------------------------- */
  /* Alert table filtering                                          */
  /* -------------------------------------------------------------- */

  const eventTypes = useMemo(
    () => [
      'All',
      ...new Set(
        SECURITY_ALERTS.map((row) => row.type)
      ),
    ],
    []
  );

  const filteredAlerts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const boundary = getDateBoundary(dateFilter);

    return rangeAlerts.filter((row) => {
      const timestamp = Date.parse(row.timestamp);

      const matchesSearch =
        !query ||
        [
          row.id,
          row.company,
          row.event,
          row.type,
          row.ip,
          row.status,
          row.severity,
        ].some((value) =>
          String(value ?? '')
            .toLowerCase()
            .includes(query)
        );

      const matchesDate =
        dateFilter === 'All Dates' ||
        (boundary !== null &&
          !Number.isNaN(timestamp) &&
          timestamp >= boundary &&
          timestamp <= DEMO_NOW.getTime());

      return (
        matchesSearch &&
        (severity === 'All' ||
          row.severity === severity) &&
        (status === 'All' ||
          row.status === status) &&
        (eventType === 'All' ||
          row.type === eventType) &&
        matchesDate
      );
    });
  }, [
    rangeAlerts,
    search,
    severity,
    status,
    eventType,
    dateFilter,
  ]);

  useEffect(() => {
    setPage(1);
    setOpenMenu(null);
  }, [
    search,
    severity,
    status,
    eventType,
    dateFilter,
    range,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAlerts.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const pageRows = filteredAlerts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const pageStart = filteredAlerts.length
    ? (currentPage - 1) * PAGE_SIZE + 1
    : 0;

  const pageEnd = Math.min(
    currentPage * PAGE_SIZE,
    filteredAlerts.length
  );

  const resetFilters = () => {
    setSearch('');
    setSeverity('All');
    setStatus('All');
    setEventType('All');
    setDateFilter('All Dates');
    setPage(1);
    setOpenMenu(null);
  };

  /* -------------------------------------------------------------- */
  /* Row menu behaviour                                             */
  /* -------------------------------------------------------------- */

  useEffect(() => {
    if (!openMenu) return undefined;

    const close = () => setOpenMenu(null);

    const onKey = (event) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    const onDown = (event) => {
      if (
        !event.target.closest(
          '.sc-row-menu, .sc-more-button'
        )
      ) {
        close();
      }
    };

    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);

    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);

    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);

      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [openMenu]);

  /* -------------------------------------------------------------- */
  /* Settings modal behaviour                                       */
  /* -------------------------------------------------------------- */

  useEffect(() => {
    if (!showSettings) return undefined;

    const onKey = (event) => {
      if (event.key === 'Escape') {
        setShowSettings(false);
      }
    };

    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [showSettings]);

  const openSettings = () => {
    setDraft({ ...settings });
    setShowSettings(true);
    setOpenMenu(null);
  };

  const saveSettings = () => {
    setSettings({ ...draft });
    setShowSettings(false);

    notify(
      'Security settings saved for this demo session.'
    );
  };

  /* -------------------------------------------------------------- */
  /* Currently selected alert                                       */
  /* -------------------------------------------------------------- */

  const activeRow = openMenu
    ? filteredAlerts.find(
        (row) => row.id === openMenu.id
      ) ?? null
    : null;

  /* -------------------------------------------------------------- */
  /* Render                                                          */
  /* -------------------------------------------------------------- */

  return (
    <main className="sc-page">
      {/* Page heading */}
      <header className="sc-page-heading">
        <div>
          <h1>Security &amp; Compliance</h1>

          <p>
            Monitor platform security, access controls,
            compliance status, and potential risks across
            all MEGSI tenants.
          </p>
        </div>

        <div className="sc-heading-actions">
          <DateRangePicker
            value={range}
            onApply={applyRange}
          />

          <button
            type="button"
            className="sc-button sc-primary"
            onClick={() => downloadCsv(filteredAlerts)}
          >
            <Download size={16} />
            Export Security Report
          </button>

          <button
            type="button"
            className="sc-button sc-outline"
            onClick={openSettings}
          >
            <Settings size={16} />
            Security Settings
          </button>
        </div>
      </header>

      {/* KPI cards */}
      <section
        className="sc-metrics-grid"
        aria-label="Security metrics"
      >
        <MetricCard
          icon={ShieldCheck}
          title="Security Score"
          value={`${summary.score}/100`}
          tone="green"
          onClick={() => openMetric('score')}
        />

        <MetricCard
          icon={AlertTriangle}
          title="Active Threats"
          value={activeAlerts.length}
          tone="red"
          onClick={() => openMetric('threats')}
        />

        <MetricCard
          icon={LockKeyhole}
          title="Failed Login Attempts"
          value={summary.failedLogins}
          tone="orange"
          onClick={() => openMetric('failed')}
        />

        <MetricCard
          icon={CheckCircle2}
          title="Compliance Rate"
          value={`${summary.complianceRate}%`}
          tone="green"
          onClick={() => openMetric('compliance')}
        />

        <MetricCard
          icon={Smartphone}
          title="MFA Enabled"
          value={`${summary.mfa}%`}
          tone="blue"
          onClick={() => openMetric('mfa')}
        />
      </section>

      {/* Analytics */}
      <section className="sc-analytics-grid">
        {/* Security events chart */}
        <article className="sc-panel sc-trend-panel">
          <div className="sc-panel-heading">
            <h2>
              <span className="sc-heading-icon">
                <BarChart3 size={17} />
              </span>

              Security Events Overview
            </h2>

            {drill.length > 0 ? (
              <button
                type="button"
                className="sc-return-button"
                onClick={() =>
                  setDrill((previous) =>
                    previous.slice(0, -1)
                  )
                }
              >
                <ArrowLeft size={14} />
                Return
              </button>
            ) : (
              <label className="sc-compact-select">
                <select
                  value={chartWindow}
                  onChange={(event) => {
                    setChartWindow(event.target.value);
                    setDrill([]);
                  }}
                  aria-label="Chart period"
                >
                  {CHART_WINDOWS.map((option) => (
                    <option key={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <ChevronDown size={14} />
              </label>
            )}
          </div>

          <p className="sc-panel-hint">
            {drill.length > 0 && (
              <strong>{crumb} · </strong>
            )}

            {caption}

            {drillable &&
              ' · Click a point to drill down'}
          </p>

          <div
            className={`sc-chart sc-line-chart${
              drillable ? ' is-clickable' : ''
            }`}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={chartView.points}
                onClick={onChartClick}
                margin={{
                  top: 4,
                  right: 10,
                  left: -18,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="scBlueFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#1670d2"
                      stopOpacity={0.22}
                    />

                    <stop
                      offset="100%"
                      stopColor="#1670d2"
                      stopOpacity={0.02}
                    />
                  </linearGradient>

                  <linearGradient
                    id="scOrangeFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#ed9b19"
                      stopOpacity={0.18}
                    />

                    <stop
                      offset="100%"
                      stopColor="#ed9b19"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#dfe8f2" />

                <XAxis
                  dataKey="label"
                  interval={
                    chartView.points.length > 12
                      ? 'preserveStartEnd'
                      : 0
                  }
                  minTickGap={14}
                  tick={{
                    fill: '#596780',
                    fontSize: 12,
                  }}
                  axisLine={{ stroke: '#d6e0eb' }}
                  tickLine={false}
                />

                <YAxis
                  domain={[0, yMax]}
                  tick={{
                    fill: '#596780',
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  labelFormatter={(label, payload) =>
                    payload?.[0]?.payload?.title ?? label
                  }
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #dce6f1',
                    fontSize: 12,
                  }}
                />

                <Legend
                  verticalAlign="top"
                  height={34}
                  wrapperStyle={{ fontSize: 12 }}
                />

                <Area
                  type="monotone"
                  dataKey="successful"
                  name="Successful Logins"
                  stroke="#1670d2"
                  strokeWidth={2.5}
                  fill="url(#scBlueFill)"
                  dot={
                    showDots
                      ? { r: 3, fill: '#1670d2' }
                      : false
                  }
                  activeDot={{ r: 5 }}
                />

                <Area
                  type="monotone"
                  dataKey="failed"
                  name="Failed Logins"
                  stroke="#ed9b19"
                  strokeWidth={2.5}
                  fill="url(#scOrangeFill)"
                  dot={
                    showDots
                      ? { r: 3, fill: '#ed9b19' }
                      : false
                  }
                  activeDot={{ r: 5 }}
                />

                <Area
                  type="monotone"
                  dataKey="suspicious"
                  name="Suspicious Activities"
                  stroke="#7b1db7"
                  strokeWidth={2.5}
                  fill="none"
                  dot={
                    showDots
                      ? { r: 3, fill: '#7b1db7' }
                      : false
                  }
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Compliance chart */}
        <article className="sc-panel sc-compliance-panel">
          <div className="sc-panel-heading">
            <h2>
              <span className="sc-heading-icon">
                <ClipboardCheck size={17} />
              </span>

              Compliance Status
            </h2>

            {complianceDrill && (
              <button
                type="button"
                className="sc-return-button"
                onClick={() =>
                  setComplianceDrill(null)
                }
              >
                <ArrowLeft size={14} />
                Return
              </button>
            )}
          </div>

          <p className="sc-panel-hint">
            {complianceDrill
              ? `${complianceDrill} · breakdown by reason`
              : 'Click a segment to view details'}
          </p>

          {complianceDrill ? (
            <div className="sc-compliance-drill">
              <div className="sc-drill-summary">
                <i style={{ background: drillColor }} />

                <strong>
                  {tenantCounts[complianceDrill]}
                </strong>

                <span>
                  {complianceDrill} tenants (
                  {drillPercent}%)
                </span>
              </div>

              <ul className="sc-reason-list">
                {reasonBars.map((bar) => (
                  <li key={bar.label}>
                    <span>{bar.label}</span>

                    <div className="sc-reason-bar">
                      <i
                        style={{
                          width: `${
                            (bar.value / reasonMax) * 100
                          }%`,
                          background: drillColor,
                        }}
                      />
                    </div>

                    <b>{bar.value}</b>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="sc-compliance-content">
              <div className="sc-donut-wrap">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={complianceData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="58%"
                      outerRadius="82%"
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={2}
                      stroke="#fff"
                      strokeWidth={2}
                      onClick={onSliceClick}
                    >
                      {complianceData.map((item) => (
                        <Cell
                          key={item.name}
                          fill={item.color}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) => `${value}%`}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="sc-donut-center">
                  <strong>{summary.tenants}</strong>
                  <span>Tenant count</span>
                </div>
              </div>

              <div className="sc-compliance-legend">
                {complianceData.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className="sc-legend-item"
                    onClick={() =>
                      setComplianceDrill(item.name)
                    }
                  >
                    <i
                      style={{ background: item.color }}
                    />

                    <span>
                      {item.name}:{' '}
                      <b>{item.value}%</b>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </article>
      </section>

      {/* Recent security alerts */}
      <section className="sc-panel sc-alerts-panel">
        <div className="sc-panel-heading sc-alerts-title">
          <h2>
            <span className="sc-heading-icon">
              <Bell size={17} />
            </span>

            Recent Security Alerts
          </h2>
        </div>

        {/* Filters */}
        <div className="sc-filters">
          <label className="sc-search">
            <Search size={16} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search"
              aria-label="Search alerts"
            />
          </label>

          <Segmented
            label="Severity"
            options={severityOptions}
            value={severity}
            onChange={setSeverity}
          />

          <label className="sc-filter-group sc-event-filter">
            <span>Event Type</span>

            <select
              value={eventType}
              onChange={(event) =>
                setEventType(event.target.value)
              }
            >
              {eventTypes.map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option === 'All'
                    ? 'Event Type'
                    : option}
                </option>
              ))}
            </select>
          </label>

          <Segmented
            label="Status"
            options={statusOptions}
            value={status}
            onChange={setStatus}
          />

          <label className="sc-filter-group">
            <span>Date</span>

            <select
              value={dateFilter}
              onChange={(event) =>
                setDateFilter(event.target.value)
              }
            >
              <option value="All Dates">
                Date filter
              </option>

              <option>Today</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </label>

          <button
            type="button"
            className="sc-reset-button"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>

        {/* Alerts table */}
        <div className="sc-table-wrap">
          <table className="sc-alert-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Event ID</th>
                <th>Company / Tenant</th>
                <th>Security Event</th>
                <th>Severity</th>
                <th>Source / IP Address</th>
                <th>Date &amp; Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {pageRows.map((row, index) => (
                <tr key={row.id}>
                  <td>
                    {(currentPage - 1) * PAGE_SIZE +
                      index +
                      1}
                  </td>

                  <td className="sc-event-id">
                    {row.id}
                  </td>

                  <td>{row.company}</td>
                  <td>{row.event}</td>

                  <td>
                    <span
                      className={`sc-severity sc-severity-${row.severity.toLowerCase()}`}
                    >
                      {row.severity}
                    </span>
                  </td>

                  <td>
                    {row.ip}

                    {row.note && (
                      <small className="sc-ip-note">
                        ({row.note})
                      </small>
                    )}
                  </td>

                  <td>{formatDate(row.timestamp)}</td>

                  <td>
                    <span
                      className={`sc-status sc-status-${row.status.toLowerCase()}`}
                    >
                      <i />
                      {row.status}
                    </span>
                  </td>

                  <td className="sc-action-cell">
                    <button
                      type="button"
                      className="sc-more-button"
                      aria-label={`Actions for ${row.id}`}
                      aria-haspopup="menu"
                      aria-expanded={
                        openMenu?.id === row.id
                      }
                      onClick={(event) => {
                        event.stopPropagation();

                        if (openMenu?.id === row.id) {
                          setOpenMenu(null);
                          return;
                        }

                        const rect =
                          event.currentTarget.getBoundingClientRect();

                        const estimatedMenuHeight = 90;

                        const top =
                          rect.bottom + estimatedMenuHeight >
                          window.innerHeight
                            ? Math.max(
                                8,
                                rect.top - estimatedMenuHeight - 4
                              )
                            : rect.bottom + 4;

                        setOpenMenu({
                          id: row.id,
                          top,
                          right:
                            window.innerWidth - rect.right,
                        });
                      }}
                    >
                      <MoreHorizontal size={19} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredAlerts.length === 0 && (
                <tr>
                  <td colSpan={9} className="sc-empty">
                    No alerts match your filters. Try
                    resetting the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="sc-table-footer">
          <span>
            Showing{' '}
            <b>
              {filteredAlerts.length
                ? `${pageStart}–${pageEnd}`
                : 0}
            </b>{' '}
            of {filteredAlerts.length} security events
          </span>

          <div className="sc-pager">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() =>
                setPage(currentPage - 1)
              }
            >
              Previous
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPage(currentPage + 1)
              }
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Three-dot action menu                                      */}
      {/* ---------------------------------------------------------- */}

      {activeRow && openMenu && (
        <div
          className="sc-row-menu"
          role="menu"
          style={{
            position: 'fixed',
            top: openMenu.top,
            right: openMenu.right,
            zIndex: 1500,
          }}
          onMouseDown={(event) =>
            event.stopPropagation()
          }
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setSelectedDetail({
                title: `Security Alert ${activeRow.id}`,
                rows: [
                  ['Event ID', activeRow.id],
                  [
                    'Company / Tenant',
                    activeRow.company,
                  ],
                  [
                    'Security Event',
                    activeRow.event,
                  ],
                  ['Event Type', activeRow.type],
                  ['Severity', activeRow.severity],
                  [
                    'Source / IP Address',
                    activeRow.ip,
                  ],
                  ...(activeRow.note
                    ? [
                        [
                          'Additional Information',
                          activeRow.note,
                        ],
                      ]
                    : []),
                  [
                    'Date & Time',
                    formatDate(activeRow.timestamp),
                  ],
                  [
                    'Current Status',
                    activeRow.status,
                  ],
                ],
              });

              setOpenMenu(null);
            }}
          >
            View details
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              notify(
                `Alert ${activeRow.id} marked for review in this demo.`
              );

              setOpenMenu(null);
            }}
          >
            Mark for review
          </button>
        </div>
      )}

      {/* ---------------------------------------------------------- */}
      {/* Security settings modal                                    */}
      {/* ---------------------------------------------------------- */}

      {showSettings && (
        <div
          className="sc-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setShowSettings(false);
            }
          }}
        >
          <section
            className="sc-settings-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sc-settings-title"
          >
            <div className="sc-modal-heading">
              <div>
                <span className="sc-heading-icon">
                  <Settings size={18} />
                </span>

                <h2 id="sc-settings-title">
                  Security Settings
                </h2>
              </div>

              <button
                type="button"
                className="sc-close-button"
                onClick={() =>
                  setShowSettings(false)
                }
                aria-label="Close settings"
              >
                <X size={20} />
              </button>
            </div>

            <p className="sc-modal-description">
              Configure example platform-wide security
              controls. These settings are local to this
              demo page.
            </p>

            {SETTING_ROWS.map(
              ([key, title, description]) => (
                <label
                  className="sc-setting-row"
                  key={key}
                >
                  <span>
                    <b>{title}</b>
                    <small>{description}</small>
                  </span>

                  <input
                    type="checkbox"
                    checked={draft[key]}
                    onChange={(event) =>
                      setDraft((previous) => ({
                        ...previous,
                        [key]: event.target.checked,
                      }))
                    }
                  />
                </label>
              )
            )}

            <div className="sc-modal-actions">
              <button
                type="button"
                className="sc-button sc-outline"
                onClick={() =>
                  setShowSettings(false)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="sc-button sc-primary"
                onClick={saveSettings}
              >
                Save Settings
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ---------------------------------------------------------- */}
      {/* Right-side details panel                                   */}
      {/* ---------------------------------------------------------- */}

      {selectedDetail && (
        <>
          <div
            className="sc-detail-backdrop"
            onClick={() =>
              setSelectedDetail(null)
            }
            aria-hidden="true"
          />

          <aside
            className="sc-detail-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sc-detail-title"
          >
            <div className="sc-detail-header">
              <div>
                <span className="sc-detail-eyebrow">
                  SECURITY OVERVIEW
                </span>

                <h2 id="sc-detail-title">
                  {selectedDetail.title}
                </h2>
              </div>

              <button
                type="button"
                className="sc-close-button"
                onClick={() =>
                  setSelectedDetail(null)
                }
                aria-label="Close details panel"
              >
                <X size={20} />
              </button>
            </div>

            <p className="sc-detail-description">
              Detailed information for the selected
              security metric or alert.
            </p>

            <div className="sc-detail-list">
              {selectedDetail.rows.map(
                ([label, value], index) => (
                  <div
                    className="sc-detail-row"
                    key={`${label}-${index}`}
                  >
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                )
              )}
            </div>

            <div className="sc-detail-footer">
              <span>Reporting period</span>
              <strong>{range.label}</strong>
            </div>

            <button
              type="button"
              className="sc-button sc-primary sc-detail-close"
              onClick={() =>
                setSelectedDetail(null)
              }
            >
              Close Details
            </button>
          </aside>
        </>
      )}
    </main>
  );
}