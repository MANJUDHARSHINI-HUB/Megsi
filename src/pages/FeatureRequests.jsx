import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  Clock,
  CircleDashed,
  XCircle,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  BarChart3,
  ClipboardList,
  Flame,
  ShieldCheck,
  Moon,
  Smartphone,
  Users,
  FileText,
  X,
  Plus,
  Check,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';

import './FeatureRequests.css';
import { useI18n } from '../i18n/I18nContext.jsx';

/* =========================================================
   DATA
   ========================================================= */

const initialRequests = [
  {
    id: 1,
    title: 'Dark Mode Support',
    description: 'Add dark mode for better user experience.',
    author: 'Sarah Johnson',
    role: 'Customer Admin',
    category: 'UI/UX',
    priority: 'High',
    status: 'Implemented',
    date: '2026-10-20',
    votes: 18,
    icon: Moon,
  },
  {
    id: 2,
    title: 'Advanced Reporting',
    description: 'More detailed analytics and export options.',
    author: 'James Wilson',
    role: 'Platform User',
    category: 'Analytics',
    priority: 'High',
    status: 'In Progress',
    date: '2026-10-18',
    votes: 14,
    icon: BarChart3,
  },
  {
    id: 3,
    title: 'Mobile App Access',
    description: 'Allow access through mobile application.',
    author: 'Olivia Martin',
    role: 'Customer Admin',
    category: 'Access',
    priority: 'Medium',
    status: 'Pending',
    date: '2026-10-15',
    votes: 11,
    icon: Smartphone,
  },
  {
    id: 4,
    title: 'Two-Factor Authentication',
    description: 'Add 2FA for enhanced security.',
    author: 'Mark Thompson',
    role: 'Platform User',
    category: 'Security',
    priority: 'High',
    status: 'In Progress',
    date: '2026-10-12',
    votes: 9,
    icon: ShieldCheck,
  },
  {
    id: 5,
    title: 'Custom Role Permissions',
    description: 'Allow custom role templates for tenants.',
    author: 'Emma Clarke',
    role: 'Customer Admin',
    category: 'Permissions',
    priority: 'Medium',
    status: 'Pending',
    date: '2026-10-08',
    votes: 7,
    icon: Users,
  },
  {
    id: 6,
    title: 'Export to PDF',
    description: 'Enable PDF export for reports.',
    author: 'David Miller',
    role: 'Platform Super Admin',
    category: 'Reporting',
    priority: 'Low',
    status: 'Implemented',
    date: '2026-10-05',
    votes: 5,
    icon: FileText,
  },
  {
    id: 7,
    title: 'Advanced Search',
    description: 'Search across companies, users, and reports.',
    author: 'Daniel Smith',
    role: 'Platform User',
    category: 'Analytics',
    priority: 'Medium',
    status: 'Pending',
    date: '2026-10-03',
    votes: 4,
    icon: Search,
  },
  {
    id: 8,
    title: 'Notification Preferences',
    description: 'Configure email and in-app notifications.',
    author: 'Priya Sharma',
    role: 'Customer Admin',
    category: 'Access',
    priority: 'Low',
    status: 'Rejected',
    date: '2026-10-01',
    votes: 3,
    icon: ClipboardList,
  },
];

// values = [Total, Implemented, In Progress, Pending]
const monthlyData = [
  { month: 'Jan', values: [5, 3, 2, 2] },
  { month: 'Feb', values: [6, 4, 3, 2] },
  { month: 'Mar', values: [7, 5, 4, 3] },
  { month: 'Apr', values: [9, 6, 4, 3] },
  { month: 'May', values: [10, 7, 5, 4] },
  { month: 'Jun', values: [13, 8, 7, 5] },
  { month: 'Jul', values: [11, 8, 6, 4] },
  { month: 'Aug', values: [11, 7, 6, 4] },
  { month: 'Sep', values: [12, 9, 7, 6] },
  { month: 'Oct', values: [12, 8, 7, 6] },
  { month: 'Nov', values: [15, 10, 8, 7] },
  { month: 'Dec', values: [17, 11, 9, 8] },
];

const DATA_YEAR = 2026;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// How a month is split into 4 weeks, and a week into days (demo data only)
const WEEK_WEIGHTS = [22, 28, 28, 22];
const DAY_WEIGHTS = [5, 17, 20, 20, 19, 14, 5]; // Sun..Sat

const SERIES = [
  { name: 'Total', color: '#0758f9' },
  { name: 'Implemented', color: '#08a875' },
  { name: 'In Progress', color: '#ff9200' },
  { name: 'Pending', color: '#7518f5' },
];

const statusOptions = ['Implemented', 'In Progress', 'Pending', 'Rejected'];

const metricConfig = [
  {
    key: 'total',
    status: null,
    labelKey: 'fr.totalRequests',
    descKey: 'fr.allTime',
    change: '18%',
    icon: Lightbulb,
    color: 'fr-icon-blue',
  },
  {
    key: 'implemented',
    status: 'Implemented',
    labelKey: 'fr.implemented',
    descKey: 'fr.released',
    change: '14%',
    icon: CheckCircle2,
    color: 'fr-icon-green',
  },
  {
    key: 'inProgress',
    status: 'In Progress',
    labelKey: 'fr.inProgress',
    descKey: 'fr.developing',
    change: '27%',
    icon: Clock,
    color: 'fr-icon-orange',
  },
  {
    key: 'pending',
    status: 'Pending',
    labelKey: 'fr.pending',
    descKey: 'fr.review',
    change: '9%',
    icon: CircleDashed,
    color: 'fr-icon-purple',
  },
  {
    key: 'rejected',
    status: 'Rejected',
    labelKey: 'fr.rejected',
    descKey: 'fr.notPlanned',
    change: '-12%',
    icon: XCircle,
    color: 'fr-icon-red',
  },
];

/* =========================================================
   DATE HELPERS
   ========================================================= */

const pad = (n) => String(n).padStart(2, '0');

const toISO = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const fromISO = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const fmtDate = (s) =>
  s
    ? fromISO(s).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })
    : '';

const fmtRange = (a, b) => `${fmtDate(a)} – ${fmtDate(b)}`;

function getPresets(today = new Date()) {
  const y = today.getFullYear();
  const m = today.getMonth();
  const q = Math.floor(m / 3);

  const monthLabel = (d) =>
    d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const preset = (label, a, b) => ({
    label,
    start: toISO(a),
    end: toISO(b),
  });

  return [
    preset(monthLabel(new Date(y, m, 1)), new Date(y, m, 1), new Date(y, m + 1, 0)),
    preset(monthLabel(new Date(y, m - 1, 1)), new Date(y, m - 1, 1), new Date(y, m, 0)),
    preset(`Q${q + 1} ${y}`, new Date(y, q * 3, 1), new Date(y, q * 3 + 3, 0)),
    preset('Year to date', new Date(y, 0, 1), new Date(y, m + 1, 0)),
    preset('Last 12 months', new Date(y, m - 11, 1), new Date(y, m + 1, 0)),
  ];
}

const DEFAULT_RANGE = getPresets()[0];

// Split an integer total across weights so the parts always add up to the total
function distribute(total, weights) {
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (total * w) / sum);
  const out = raw.map(Math.floor);
  let rest = total - out.reduce((a, b) => a + b, 0);

  raw
    .map((v, i) => ({ i, f: v - Math.floor(v) }))
    .sort((a, b) => b.f - a.f)
    .forEach(({ i }) => {
      if (rest > 0) {
        out[i] += 1;
        rest -= 1;
      }
    });

  return out;
}

/* =========================================================
   SMALL COMPONENTS
   ========================================================= */

function StatusBadge({ status }) {
  return (
    <span
      className={`fr-status fr-status-${status
        .toLowerCase()
        .replaceAll(' ', '-')}`}
    >
      <span className="fr-status-dot" />
      {status}
    </span>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  description,
  color,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`fr-metric-card ${active ? 'fr-metric-card-active' : ''}`}
      onClick={onClick}
      aria-haspopup="dialog"
      title={`View details: ${label}`}
    >
      <div className={`fr-metric-icon ${color}`}>
        <Icon size={25} />
      </div>

      <div className="fr-metric-content">
        <span className="fr-metric-label">{label}</span>
        <strong>{value}</strong>

        <span className="fr-metric-change">
          {change.startsWith('-') ? '↓' : '↑'} {change.replace('-', '')}
        </span>

        <small>{description}</small>
      </div>
    </button>
  );
}

/* ---------- Date range picker (presets + custom range + Apply) ---------- */

function DateRangePicker({ start, end, onApply }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(start);
  const [to, setTo] = useState(end);
  const wrapRef = useRef(null);
  const presets = useMemo(() => getPresets(), []);

  useEffect(() => {
    setFrom(start);
    setTo(end);
  }, [start, end]);

  useEffect(() => {
    if (!open) return undefined;

    const onDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (a, b) => {
    onApply(a, b);
    setOpen(false);
  };

  const apply = () => {
    if (!from || !to) return;
    if (from <= to) choose(from, to);
    else choose(to, from);
  };

  return (
    <div className="fr-datepicker" ref={wrapRef}>
      <button
        type="button"
        className="fr-date-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <CalendarDays size={17} />
        <span>{fmtRange(start, end)}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="fr-date-menu" role="dialog" aria-label="Select date range">
          <div className="fr-date-presets">
            {presets.map((preset) => {
              const active = preset.start === start && preset.end === end;

              return (
                <button
                  type="button"
                  key={preset.label}
                  className={active ? 'active' : ''}
                  onClick={() => choose(preset.start, preset.end)}
                >
                  <strong>{preset.label}</strong>
                  <small>{fmtRange(preset.start, preset.end)}</small>
                </button>
              );
            })}
          </div>

          <div className="fr-date-custom">
            <strong>Custom range</strong>

            <label>
              <span>{t('fr.startDate')}</span>
              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(event) => setFrom(event.target.value)}
              />
            </label>

            <label>
              <span>{t('fr.endDate')}</span>
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(event) => setTo(event.target.value)}
              />
            </label>

            <button
              type="button"
              className="fr-submit-button fr-date-apply"
              onClick={apply}
              disabled={!from || !to}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Drill-down bar chart (SVG, so gridlines always render) ---------- */

function RequestsChart({ rangeStart, rangeEnd, onDrill }) {
  const { t } = useI18n();
  const [level, setLevel] = useState({ month: null, week: null });
  const [period, setPeriod] = useState('all'); // 'all' | '6' | '3'

  const monthRange = (index) => [
    toISO(new Date(DATA_YEAR, index, 1)),
    toISO(new Date(DATA_YEAR, index + 1, 0)),
  ];

  const items = useMemo(() => {
    const { month, week } = level;

    if (month === null) {
      const now = new Date();
      const last = now.getFullYear() === DATA_YEAR ? now.getMonth() : 11;
      const first =
        period === 'all' ? 0 : Math.max(0, last - Number(period) + 1);
      const lastIdx = period === 'all' ? 11 : last;

      return monthlyData.slice(first, lastIdx + 1).map((m, k) => {
        const i = first + k;
        const [start, end] = monthRange(i);
        return {
          id: m.month,
          label: m.month,
          monthIndex: i,
          values: m.values,
          start,
          end,
        };
      });
    }

    const daysInMonth = new Date(DATA_YEAR, month + 1, 0).getDate();
    const bounds = [[1, 7], [8, 14], [15, 21], [22, daysInMonth]];
    const perSeries = monthlyData[month].values.map((v) =>
      distribute(v, WEEK_WEIGHTS),
    );

    const weeks = bounds.map(([a, b], w) => ({
      id: `w${w}`,
      label: `W${w + 1}`,
      values: perSeries.map((s) => s[w]),
      start: toISO(new Date(DATA_YEAR, month, a)),
      end: toISO(new Date(DATA_YEAR, month, b)),
    }));

    if (week === null) return weeks;

    const [a, b] = bounds[week];
    const days = Array.from(
      { length: b - a + 1 },
      (_, d) => new Date(DATA_YEAR, month, a + d),
    );
    const perDay = weeks[week].values.map((v) =>
      distribute(v, days.map((d) => DAY_WEIGHTS[d.getDay()])),
    );

    return days.map((d, i) => ({
      id: toISO(d),
      label: `${WEEKDAYS[d.getDay()]} ${d.getDate()}`,
      values: perDay.map((s) => s[i]),
      start: toISO(d),
      end: toISO(d),
    }));
  }, [level, period]);

  const drill = (item, index) => {
    if (level.month === null) setLevel({ month: item.monthIndex, week: null });
    else if (level.week === null) setLevel({ month: level.month, week: index });

    onDrill(item.start, item.end);
  };

  const goBack = () => {
    if (level.week !== null) {
      setLevel({ month: level.month, week: null });
      const [start, end] = monthRange(level.month);
      onDrill(start, end);
    } else {
      setLevel({ month: null, week: null });
    }
  };

  // chart size follows the real panel width, so text stays readable
  const canvasRef = useRef(null);
  const [width, setWidth] = useState(560);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return undefined;

    const update = () => setWidth(Math.max(280, Math.floor(el.clientWidth)));
    update();

    if (typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // chart geometry
  const W = width;
  const H = 260;
  const L = 28;
  const R = 6;
  const T = 10;
  const B = 28;
  const plotW = W - L - R;
  const plotH = H - T - B;

  const maxValue = Math.max(1, ...items.flatMap((item) => item.values));
  const step = Math.max(1, Math.ceil(maxValue / 4));
  const yMax = step * 4;
  const ticks = [0, 1, 2, 3, 4].map((k) => k * step);

  const yOf = (value) => T + plotH - (value / yMax) * plotH;
  const groupW = plotW / items.length;
  const gap = 1.5;
  const barW = Math.min(14, (groupW * 0.74 - gap * 3) / SERIES.length);
  const groupInner = barW * SERIES.length + gap * (SERIES.length - 1);

  const isInRange = (item) => item.start <= rangeEnd && item.end >= rangeStart;
  const allInRange = items.every(isInRange);

  return (
    <article className="fr-panel fr-chart-panel">
      <div className="fr-chart-head">
        <h2 className="fr-chart-title">
          <BarChart3 size={20} />
          {t('fr.overview')}
        </h2>

        <label className="fr-chart-select">
          <select
            value={period}
            onChange={(event) => {
              setPeriod(event.target.value);
              setLevel({ month: null, week: null });
            }}
            aria-label="Chart period"
          >
            <option value="all">Full Year</option>
            <option value="6">Last 6 Months</option>
            <option value="3">Last 3 Months</option>
          </select>
          <ChevronDown size={14} />
        </label>
      </div>

      <div className="fr-chart-legend-row">
        {SERIES.map((series, index) => (
          <span key={series.name}>
            <i style={{ background: series.color }} />
            {index === 0 ? t('fr.total') : series.name}
          </span>
        ))}
      </div>

      <div className="fr-drill-bar">
        <nav className="fr-drill-crumbs" aria-label="Chart drill-down">
          <button
            type="button"
            onClick={() => setLevel({ month: null, week: null })}
            disabled={level.month === null}
          >
            All months
          </button>

          {level.month !== null && (
            <>
              <ChevronRight size={13} />
              <button
                type="button"
                onClick={() => {
                  setLevel({ month: level.month, week: null });
                  const [start, end] = monthRange(level.month);
                  onDrill(start, end);
                }}
                disabled={level.week === null}
              >
                {MONTH_NAMES[level.month]}
              </button>
            </>
          )}

          {level.week !== null && (
            <>
              <ChevronRight size={13} />
              <span>Week {level.week + 1}</span>
            </>
          )}
        </nav>

        {level.month !== null && (
          <button type="button" className="fr-drill-back" onClick={goBack}>
            <ArrowLeft size={14} />
            Back
          </button>
        )}
      </div>

      <div className="fr-chart-canvas" ref={canvasRef}>
        <svg
          className="fr-svg-chart"
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          role="group"
          aria-label="Feature requests chart"
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={L}
                x2={W - R}
                y1={yOf(tick)}
                y2={yOf(tick)}
                stroke={tick === 0 ? '#c9d3e6' : '#e3e9f3'}
                strokeWidth="1"
                strokeDasharray={tick === 0 ? undefined : '4 4'}
              />
              <text
                x={L - 8}
                y={yOf(tick) + 4}
                textAnchor="end"
                fontSize="11"
                fill="#6b7a99"
              >
                {tick}
              </text>
            </g>
          ))}

          {items.map((item, index) => {
            const inRange = isInRange(item);
            const highlighted = inRange && !allInRange;
            const groupX = L + index * groupW;
            const startX = groupX + (groupW - groupInner) / 2;
            const canDrill = !(level.month !== null && level.week !== null);
            const tip = `${item.label} — ${SERIES.map(
              (s, i) => `${s.name} ${item.values[i]}`,
            ).join(', ')}`;

            return (
              <g
                key={item.id}
                className="fr-svg-group"
                role="button"
                tabIndex={0}
                aria-label={tip}
                style={{ cursor: 'pointer' }}
                onClick={() => drill(item, index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    drill(item, index);
                  }
                }}
              >
                <title>{canDrill ? `${tip} (click to drill down)` : tip}</title>

                {highlighted && (
                  <rect
                    x={groupX + 1}
                    y={T}
                    width={Math.max(0, groupW - 2)}
                    height={plotH}
                    rx="4"
                    fill="#0758f9"
                    opacity="0.08"
                  />
                )}

                <rect
                  className="fr-hit"
                  x={groupX}
                  y={T}
                  width={groupW}
                  height={plotH}
                  fill="transparent"
                />

                {item.values.map((value, s) => (
                  <rect
                    key={SERIES[s].name}
                    x={startX + s * (barW + gap)}
                    y={yOf(value)}
                    width={barW}
                    height={(value / yMax) * plotH}
                    rx="1.5"
                    fill={SERIES[s].color}
                  />
                ))}

                <text
                  x={groupX + groupW / 2}
                  y={H - 9}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={highlighted ? 700 : 500}
                  fill={highlighted ? '#0f1d4a' : '#4a5a7a'}
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </article>
  );
}

const categoryOptions = [
  'UI/UX',
  'Analytics',
  'Access',
  'Security',
  'Permissions',
  'Reporting',
];

function RequestStatusChart({ requests: allRequests, onSelectStatus }) {
  const { t } = useI18n();
  const [category, setCategory] = useState('All Categories');

  const requests =
    category === 'All Categories'
      ? allRequests
      : allRequests.filter((request) => request.category === category);

  const counts = statusOptions.map((status) => ({
    status,
    count: requests.filter((request) => request.status === status).length,
  }));

  const total = requests.length;

  const segments = [
    { color: '#08a875', count: counts[0].count },
    { color: '#ff9200', count: counts[1].count },
    { color: '#7518f5', count: counts[2].count },
    { color: '#ff3151', count: counts[3].count },
  ];

  let offset = 0;

  const gradient = total
    ? segments
        .map((segment) => {
          const start = offset;
          offset += (segment.count / total) * 100;

          return `${segment.color} ${start}% ${offset}%`;
        })
        .join(', ')
    : '#e9edf5 0% 100%';

  return (
    <article className="fr-panel fr-status-panel">
      <div className="fr-panel-heading">
        <h2>
          <ClipboardList size={20} />
          {t('fr.status')}
        </h2>

        <label className="fr-chart-select">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter chart by category"
          >
            <option value="All Categories">All Categories</option>
            {categoryOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <ChevronDown size={14} />
        </label>
      </div>

      <div className="fr-status-chart-content">
        <div
          className="fr-donut"
          style={{ background: `conic-gradient(${gradient})` }}
          role="img"
          aria-label={`Status distribution for ${total} requests`}
        >
          <div className="fr-donut-hole">
            <strong>{total}</strong>
            <span>{t('fr.total')}</span>
          </div>
        </div>

        <div className="fr-status-legend">
          {counts.map((item, index) => (
            <button
              type="button"
              key={item.status}
              onClick={() => onSelectStatus(item.status)}
              title={`Filter by ${item.status}`}
            >
              <i className={`fr-legend-dot fr-legend-${index}`} />
              <span>{item.status}</span>
              <strong>{item.count}</strong>
              <small>
                {total ? Math.round((item.count / total) * 100) : 0}%
              </small>
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

function TopFeatures({ requests, onSelect, onViewAll }) {
  const { t } = useI18n();
  const topRequests = [...requests]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5);

  return (
    <article className="fr-panel fr-top-panel">
      <div className="fr-panel-heading">
        <h2>
          <Flame size={20} />
          {t('fr.top')}
        </h2>

        <button type="button" className="fr-view-label" onClick={onViewAll}>
          {t('fr.viewAll')}
        </button>
      </div>

      <div className="fr-top-list">
        {topRequests.map((request, index) => (
          <button
            type="button"
            className="fr-top-item"
            key={request.id}
            onClick={() => onSelect(request)}
          >
            <span className={`fr-rank fr-rank-${index}`}>{index + 1}</span>

            <span className="fr-top-copy">
              <strong>{request.title}</strong>
              <small>{request.votes} votes</small>
            </span>

            <StatusBadge status={request.status} />
          </button>
        ))}

        {topRequests.length === 0 && (
          <p className="fr-empty">{t('fr.noRequests')}</p>
        )}
      </div>
    </article>
  );
}

function RecentUpdates({ requests, onSelect, onViewAll }) {
  const { t } = useI18n();
  const recent = [...requests]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <article className="fr-panel fr-updates-panel">
      <div className="fr-panel-heading">
        <h2>
          <Clock size={20} />
          {t('fr.recent')}
        </h2>

        <button type="button" className="fr-view-label" onClick={onViewAll}>
          {t('fr.viewAll')}
        </button>
      </div>

      <div className="fr-timeline">
        {recent.map((request, index) => {
          const Icon = request.icon;

          return (
            <button
              type="button"
              className="fr-update"
              key={request.id}
              onClick={() => onSelect(request)}
            >
              <span className={`fr-timeline-dot fr-timeline-${index}`} />

              <span className={`fr-update-icon fr-update-${index}`}>
                <Icon size={19} />
              </span>

              <span className="fr-update-copy">
                <strong>{request.title}</strong>
                <span>
                  {request.status} · {request.date}
                </span>
                <small>{request.description}</small>
              </span>
            </button>
          );
        })}

        {recent.length === 0 && (
          <p className="fr-empty">{t('fr.noUpdates')}</p>
        )}
      </div>

    </article>
  );
}

/* ---------- Right-side detail panel (opened from the metric cards) ---------- */

function DetailPanel({ title, rows, requests, onClose, onSelect, onShowInTable }) {
  const { t } = useI18n();
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fr-panel-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        className="fr-side-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fr-side-title"
      >
        <div className="fr-side-head">
          <h2 id="fr-side-title">{title}</h2>

          <button
            ref={closeRef}
            type="button"
            className="fr-close-button"
            onClick={onClose}
            aria-label={t('fr.close')}
          >
            <X size={20} />
          </button>
        </div>

        <dl className="fr-side-rows">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        {requests.length > 0 && (
          <div className="fr-side-list">
            <h3>Requests ({requests.length})</h3>

            {requests.map((request) => (
              <button
                type="button"
                key={request.id}
                onClick={() => onSelect(request)}
              >
                <span>
                  <strong>{request.title}</strong>
                  <small>
                    {request.author} · {request.date}
                  </small>
                </span>
                <StatusBadge status={request.status} />
              </button>
            ))}
          </div>
        )}

        {onShowInTable && (
          <button
            type="button"
            className="fr-submit-button fr-side-action"
            onClick={onShowInTable}
          >
            Show in table
          </button>
        )}

        <p className="fr-side-note">
          Demonstration data only — not connected to a backend.
        </p>
      </aside>
    </div>
  );
}

/* ---------- Full-page "View All" ---------- */

function FullListPage({ mode, requests, rangeLabel, onBack, onSelect }) {
  const { t } = useI18n();
  const isTop = mode === 'top';
  const Heading = isTop ? Flame : Clock;

  const rows = [...requests].sort(
    isTop
      ? (a, b) => b.votes - a.votes
      : (a, b) => b.date.localeCompare(a.date),
  );

  return (
    <section className="fr-panel fr-full-page">
      <div className="fr-full-head">
        <button type="button" className="fr-back-button" onClick={onBack}>
          <ArrowLeft size={17} />
          Return to Dashboard
        </button>

        <div className="fr-full-title">
          <h2>
            <Heading size={20} />
            {isTop ? t('fr.top') : t('fr.recent')}
          </h2>
          <p>
            {rows.length} requests · {rangeLabel}
          </p>
        </div>
      </div>

      <div className="fr-table-scroll">
        <table className="fr-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t('fr.featureTitleCol')}</th>
              <th>{t('fr.requestedByCol')}</th>
              <th>{t('fr.category')}</th>
              <th>{t('fr.priority')}</th>
              <th>{t('fr.status')}</th>
              <th>{t('fr.votes')}</th>
              <th>{t('fr.dateRequestedCol')}</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((request, index) => {
              const Icon = request.icon;

              return (
                <tr key={request.id}>
                  <td>{index + 1}</td>

                  <td>
                    <button
                      type="button"
                      className="fr-feature-title"
                      onClick={() => onSelect(request)}
                    >
                      <span className={`fr-feature-icon fr-feature-${index % 6}`}>
                        <Icon size={20} />
                      </span>

                      <span>
                        <strong>{request.title}</strong>
                        <small>{request.description}</small>
                      </span>
                    </button>
                  </td>

                  <td>
                    <span className="fr-requested-by">{request.author}</span>
                    <small className="fr-role">{request.role}</small>
                  </td>

                  <td>
                    <span className="fr-category">{request.category}</span>
                  </td>

                  <td>
                    <span
                      className={`fr-priority fr-priority-${request.priority.toLowerCase()}`}
                    >
                      {request.priority}
                    </span>
                  </td>

                  <td>
                    <StatusBadge status={request.status} />
                  </td>

                  <td>{request.votes}</td>

                  <td className="fr-date-cell">{request.date}</td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan="8" className="fr-empty">
                  {t('fr.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ---------- Submit / view request modal ---------- */

function RequestModal({ request, onClose, onSubmit }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    title: '',
    description: '',
    author: '',
    category: 'UI/UX',
    priority: 'Medium',
  });

  if (!request) return null;

  const isNew = request === 'new';

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim()) return;

    onSubmit(form);
  };

  return (
    <div
      className="fr-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="fr-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fr-modal-title"
      >
        <div className="fr-modal-heading">
          <div>
            <h2 id="fr-modal-title">
              {isNew ? t('fr.submit') : request.title}
            </h2>
            <p>{isNew ? t('fr.tellUs') : request.description}</p>
          </div>

          <button
            type="button"
            className="fr-close-button"
            onClick={onClose}
            aria-label={t('fr.close')}
          >
            <X size={20} />
          </button>
        </div>

        {isNew ? (
          <form className="fr-form" onSubmit={submit}>
            <label>
              {t('fr.featureTitle')}
              <input
                name="title"
                value={form.title}
                onChange={updateField}
                placeholder={t('fr.enterTitle')}
                maxLength={120}
                required
              />
            </label>

            <label>
              {t('fr.description')}
              <textarea
                name="description"
                value={form.description}
                onChange={updateField}
                placeholder={t('fr.describe')}
                rows={4}
                maxLength={1000}
                required
              />
            </label>

            <label>
              {t('fr.requestedBy')}
              <input
                name="author"
                value={form.author}
                onChange={updateField}
                placeholder={t('fr.yourName')}
              />
            </label>

            <div className="fr-form-row">
              <label>
                Category
                <select
                  name="category"
                  value={form.category}
                  onChange={updateField}
                >
                  <option>UI/UX</option>
                  <option>Analytics</option>
                  <option>Access</option>
                  <option>Security</option>
                  <option>Permissions</option>
                  <option>Reporting</option>
                </select>
              </label>

              <label>
                Priority
                <select
                  name="priority"
                  value={form.priority}
                  onChange={updateField}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>
            </div>

            <div className="fr-modal-actions">
              <button
                type="button"
                className="fr-cancel-button"
                onClick={onClose}
              >
                {t('fr.cancel')}
              </button>

              <button type="submit" className="fr-submit-button">
                <Plus size={17} />
                {t('fr.submitRequest')}
              </button>
            </div>
          </form>
        ) : (
          <div className="fr-request-modal-details">
            <StatusBadge status={request.status} />
            <p><strong>{t('fr.requestedBy')}:</strong> {request.author}</p>
            <p><strong>{t('fr.role')}:</strong> {request.role}</p>
            <p><strong>{t('fr.category')}:</strong> {request.category}</p>
            <p><strong>{t('fr.priority')}:</strong> {request.priority}</p>
            <p><strong>{t('fr.dateRequested')}:</strong> {request.date}</p>
            <p><strong>{t('fr.votes')}:</strong> {request.votes}</p>

            <button
              type="button"
              className="fr-submit-button"
              onClick={onClose}
            >
              <Check size={17} />
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
   ========================================================= */

export default function FeatureRequests() {
  const { t } = useI18n();
  const [requests, setRequests] = useState(initialRequests);

  const [range, setRange] = useState({
    start: DEFAULT_RANGE.start,
    end: DEFAULT_RANGE.end,
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [sortBy, setSortBy] = useState('Newest First');
  const [page, setPage] = useState(1);
  const [modalRequest, setModalRequest] = useState(null);
  const [panelKey, setPanelKey] = useState(null); // metric card detail panel
  const [view, setView] = useState(null); // null | 'top' | 'updates'

  const pageSize = 6;

  // Everything on the page is driven by the selected date range
  const ranged = useMemo(
    () =>
      requests.filter(
        (request) =>
          (!range.start || request.date >= range.start) &&
          (!range.end || request.date <= range.end),
      ),
    [requests, range],
  );

  const counts = useMemo(
    () => ({
      total: ranged.length,
      implemented: ranged.filter((r) => r.status === 'Implemented').length,
      inProgress: ranged.filter((r) => r.status === 'In Progress').length,
      pending: ranged.filter((r) => r.status === 'Pending').length,
      rejected: ranged.filter((r) => r.status === 'Rejected').length,
    }),
    [ranged],
  );

  const filteredRequests = useMemo(() => {
    let result = [...ranged];

    if (search.trim()) {
      const query = search.trim().toLowerCase();

      result = result.filter((request) =>
        [
          request.title,
          request.author,
          request.category,
          request.status,
          request.description,
          request.priority,
          request.role,
        ].some((value) =>
          String(value ?? '').toLowerCase().includes(query),
        ),
      );
    }

    if (statusFilter !== 'All Statuses') {
      result = result.filter((request) => request.status === statusFilter);
    }

    if (sortBy === 'Newest First') {
      result.sort((a, b) => b.date.localeCompare(a.date));
    } else if (sortBy === 'Oldest First') {
      result.sort((a, b) => a.date.localeCompare(b.date));
    } else if (sortBy === 'Most Votes') {
      result.sort((a, b) => b.votes - a.votes);
    } else if (sortBy === 'Title A-Z') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [ranged, search, statusFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / pageSize),
  );

  const currentPage = Math.min(page, totalPages);

  const visibleRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Content of the right-side panel for the clicked card
  const panel = useMemo(() => {
    if (!panelKey) return null;

    const cfg = metricConfig.find((item) => item.key === panelKey);
    const list = cfg.status
      ? ranged.filter((request) => request.status === cfg.status)
      : ranged;

    const votes = list.reduce((sum, request) => sum + request.votes, 0);
    const byPriority = (priority) =>
      list.filter((request) => request.priority === priority).length;

    const sign = cfg.change.startsWith('-') ? '' : '+';
    const rows = [
      [t(cfg.labelKey), list.length],
      ['Change', `${sign}${cfg.change}`],
    ];

    if (cfg.status) {
      rows.push(
        [
          'Share of requests',
          `${ranged.length ? Math.round((list.length / ranged.length) * 100) : 0}%`,
        ],
        ['High priority', byPriority('High')],
        ['Medium priority', byPriority('Medium')],
        ['Low priority', byPriority('Low')],
      );
    } else {
      rows.push(
        ['Implemented', counts.implemented],
        ['In Progress', counts.inProgress],
        ['Pending', counts.pending],
        ['Rejected', counts.rejected],
      );
    }

    rows.push(['Total votes', votes], ['Period', fmtRange(range.start, range.end)]);

    return { cfg, list, rows };
  }, [panelKey, ranged, counts, range, t]);

  const isDefaultRange =
    range.start === DEFAULT_RANGE.start && range.end === DEFAULT_RANGE.end;

  const hasActiveFilters =
    search !== '' ||
    statusFilter !== 'All Statuses' ||
    sortBy !== 'Newest First' ||
    !isDefaultRange;

  const applyRange = (start, end) => {
    setRange({ start, end });
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('All Statuses');
    setSortBy('Newest First');
    setRange({ start: DEFAULT_RANGE.start, end: DEFAULT_RANGE.end });
    setPage(1);
  };

  const selectStatus = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSubmit = (form) => {
    const newRequest = {
      id: Date.now(),
      title: form.title.trim(),
      description: form.description.trim(),
      author: form.author.trim() || 'New User',
      role: 'Platform User',
      category: form.category,
      priority: form.priority,
      status: 'Pending',
      date: toISO(new Date()),
      votes: 0,
      icon: Lightbulb,
    };

    setRequests((current) => [newRequest, ...current]);
    clearFilters();
    setView(null);
    setModalRequest(null);
  };

  const openRequest = (request) => {
    setPanelKey(null);
    setModalRequest(request);
  };

  return (
    <main className="fr-page">
      <header className="fr-page-heading">
        <div className="fr-title-area">
          <div className="fr-title-icon">
            <Lightbulb size={39} fill="currentColor" />
          </div>

          <div>
            <h1>{t('fr.title')}</h1>
            <p>{t('fr.subtitle')}</p>
          </div>
        </div>

        <DateRangePicker
          start={range.start}
          end={range.end}
          onApply={applyRange}
        />
      </header>

      {view ? (
        <FullListPage
          mode={view}
          requests={ranged}
          rangeLabel={fmtRange(range.start, range.end)}
          onBack={() => setView(null)}
          onSelect={openRequest}
        />
      ) : (
        <>
          <section className="fr-metrics">
            {metricConfig.map((cfg) => (
              <MetricCard
                key={cfg.key}
                icon={cfg.icon}
                label={t(cfg.labelKey)}
                value={counts[cfg.key]}
                change={cfg.change}
                description={t(cfg.descKey)}
                color={cfg.color}
                active={panelKey === cfg.key}
                onClick={() => setPanelKey(cfg.key)}
              />
            ))}
          </section>

          <section className="fr-dashboard-grid">
            <div className="fr-dashboard-main">
              <div className="fr-analytics-grid">
                <RequestsChart
                  rangeStart={range.start}
                  rangeEnd={range.end}
                  onDrill={applyRange}
                />

                <RequestStatusChart
                  requests={ranged}
                  onSelectStatus={selectStatus}
                />
              </div>

              <section className="fr-panel fr-table-panel">
                <div className="fr-table-heading">
                  <h2>
                    <ClipboardList size={20} />
                    Feature Requests
                  </h2>

                  <div className="fr-table-controls">
                    <label className="fr-search">
                      <Search size={16} />

                      <input
                        type="search"
                        value={search}
                        placeholder={t('fr.search')}
                        onChange={(event) => {
                          setSearch(event.target.value);
                          setPage(1);
                        }}
                      />

                      {search && (
                        <button
                          type="button"
                          aria-label={t('fr.clearSearch')}
                          onClick={() => {
                            setSearch('');
                            setPage(1);
                          }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </label>

                    <label className="fr-select">
                      <select
                        value={statusFilter}
                        onChange={(event) => selectStatus(event.target.value)}
                        aria-label={t('fr.filterStatus')}
                      >
                        <option value="All Statuses">
                          {t('fr.allStatuses')}
                        </option>
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <ChevronDown size={14} />
                    </label>

                    <label className="fr-select fr-sort-select">
                      <select
                        value={sortBy}
                        onChange={(event) => {
                          setSortBy(event.target.value);
                          setPage(1);
                        }}
                        aria-label={t('fr.sortRequests')}
                      >
                        <option value="Newest First">{t('fr.newest')}</option>
                        <option value="Oldest First">{t('fr.oldest')}</option>
                        <option value="Most Votes">{t('fr.mostVotes')}</option>
                        <option value="Title A-Z">{t('fr.titleAZ')}</option>
                      </select>

                      <ChevronDown size={14} />
                    </label>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        className="fr-clear-filters"
                        onClick={clearFilters}
                      >
                        <RotateCcw size={15} />
                        {t('fr.clearFilters')}
                      </button>
                    )}
                  </div>
                </div>

                <div className="fr-table-scroll">
                  <table className="fr-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>{t('fr.featureTitleCol')}</th>
                        <th>{t('fr.requestedByCol')}</th>
                        <th>{t('fr.category')}</th>
                        <th>{t('fr.priority')}</th>
                        <th>{t('fr.status')}</th>
                        <th>{t('fr.dateRequestedCol')}</th>
                        <th>{t('fr.actions')}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {visibleRequests.map((request, index) => {
                        const Icon = request.icon;

                        return (
                          <tr key={request.id}>
                            <td>
                              {(currentPage - 1) * pageSize + index + 1}
                            </td>

                            <td>
                              <button
                                type="button"
                                className="fr-feature-title"
                                onClick={() => setModalRequest(request)}
                              >
                                <span
                                  className={`fr-feature-icon fr-feature-${index % 6}`}
                                >
                                  <Icon size={20} />
                                </span>

                                <span>
                                  <strong>{request.title}</strong>
                                  <small>{request.description}</small>
                                </span>
                              </button>
                            </td>

                            <td>
                              <span className="fr-requested-by">
                                {request.author}
                              </span>

                              <small className="fr-role">{request.role}</small>
                            </td>

                            <td>
                              <span className="fr-category">
                                {request.category}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`fr-priority fr-priority-${request.priority.toLowerCase()}`}
                              >
                                {request.priority}
                              </span>
                            </td>

                            <td>
                              <StatusBadge status={request.status} />
                            </td>

                            <td className="fr-date-cell">{request.date}</td>

                            <td>
                              <button
                                type="button"
                                className="fr-action-button"
                                onClick={() => setModalRequest(request)}
                                aria-label={`View ${request.title}`}
                              >
                                ···
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {visibleRequests.length === 0 && (
                        <tr>
                          <td colSpan="8" className="fr-empty">
                            {t('fr.empty')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="fr-pagination">
                  <span>
                    Showing {visibleRequests.length} of{' '}
                    {filteredRequests.length} feature requests
                  </span>

                  <div className="fr-pagination-buttons">
                    <button
                      type="button"
                      aria-label={t('fr.previous')}
                      disabled={currentPage <= 1}
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                    >
                      <ChevronLeft size={17} />
                    </button>

                    {Array.from({ length: totalPages }, (_, index) => index + 1)
                      .slice(0, 5)
                      .map((number) => (
                        <button
                          type="button"
                          key={number}
                          className={currentPage === number ? 'active' : ''}
                          onClick={() => setPage(number)}
                        >
                          {number}
                        </button>
                      ))}

                    <button
                      type="button"
                      aria-label={t('fr.next')}
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setPage((current) =>
                          Math.min(totalPages, current + 1),
                        )
                      }
                    >
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <aside className="fr-dashboard-sidebar">
              <TopFeatures
                requests={ranged}
                onSelect={setModalRequest}
                onViewAll={() => setView('top')}
              />

              <RecentUpdates
                requests={ranged}
                onSelect={setModalRequest}
                onViewAll={() => setView('updates')}
              />
            </aside>
          </section>
        </>
      )}

      <button
        type="button"
        className="fr-floating-submit"
        onClick={() => setModalRequest('new')}
      >
        <Plus size={18} />
        {t('fr.submit')}
      </button>

      {panel && (
        <DetailPanel
          title={t(panel.cfg.labelKey)}
          rows={panel.rows}
          requests={panel.list}
          onClose={() => setPanelKey(null)}
          onSelect={openRequest}
          onShowInTable={() => {
            selectStatus(panel.cfg.status ?? 'All Statuses');
            setView(null);
            setPanelKey(null);
          }}
        />
      )}

      {modalRequest && (
        <RequestModal
          request={modalRequest}
          onClose={() => setModalRequest(null)}
          onSubmit={handleSubmit}
        />
      )}
    </main>
  );
}
