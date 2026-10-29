import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  Bell,
  Calendar,
  RefreshCw,
  Download,
  SlidersHorizontal,
  Info,
  Cpu,
  MemoryStick,
  HardDrive,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  Trash2,
  X,
  Check,
  Server,
  Maximize2,
  Table2,
  ArrowLeft,
  Search,
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';

import "./system-monitoring.css";

const initialServices = [
  { id: 1, name: 'API Service', status: 'Operational', response: '70 ms', checked: '21:20' },
  { id: 2, name: 'Database', status: 'Degraded', response: '80 ms', checked: '11:20' },
  { id: 3, name: 'Authentication Service', status: 'Operational', response: '30 ms', checked: '12:30' },
  { id: 4, name: 'Background Worker', status: 'Operational', response: '150 ms', checked: '12:30' },
  { id: 5, name: 'Notification Service', status: 'Operational', response: '9 ms', checked: '13:30' },
];

const cpuData = [
  { time: 'Jan AM', value: 8 },
  { time: '', value: 12 },
  { time: '', value: 9 },
  { time: '', value: 15 },
  { time: '', value: 11 },
  { time: '', value: 7 },
  { time: '', value: 10 },
  { time: '', value: 18 },
  { time: '', value: 14 },
  { time: '', value: 12 },
  { time: '', value: 9 },
  { time: '', value: 24 },
  { time: '', value: 18 },
  { time: '', value: 14 },
  { time: '', value: 27 },
  { time: 'Apr AM', value: 20 },
  { time: '', value: 12 },
  { time: '', value: 36 },
  { time: '', value: 25 },
  { time: '', value: 16 },
  { time: '', value: 32 },
  { time: '', value: 48 },
  { time: '', value: 26 },
  { time: '', value: 18 },
  { time: 'Dec AM', value: 25 },
  { time: '', value: 14 },
  { time: '', value: 19 },
  { time: '', value: 11 },
  { time: '', value: 22 },
  { time: 'Oct PM', value: 12 },
];

const memoryData = [
  { time: 'Jan AM', value: 38 },
  { time: '', value: 40 },
  { time: '', value: 40 },
  { time: '', value: 41 },
  { time: '', value: 42 },
  { time: '', value: 42 },
  { time: '', value: 43 },
  { time: '', value: 44 },
  { time: '', value: 44 },
  { time: '', value: 50 },
  { time: '', value: 62 },
  { time: '', value: 62 },
  { time: '', value: 63 },
  { time: '', value: 72 },
  { time: 'Apr AM', value: 72 },
  { time: '', value: 72 },
  { time: '', value: 72 },
  { time: '', value: 72 },
  { time: '', value: 73 },
  { time: '', value: 73 },
  { time: '', value: 80 },
  { time: '', value: 80 },
  { time: '', value: 80 },
  { time: '', value: 81 },
  { time: 'Dec AM', value: 81 },
  { time: '', value: 81 },
  { time: '', value: 81 },
  { time: '', value: 81 },
  { time: '', value: 81 },
  { time: 'Oct PM', value: 81 },
];

const diskData = [
  { time: 'Jan AM', value: 62 },
  { time: '', value: 62 },
  { time: '', value: 62 },
  { time: '', value: 62 },
  { time: '', value: 62 },
  { time: '', value: 62 },
  { time: '', value: 62 },
  { time: '', value: 62 },
  { time: '', value: 62 },
  { time: '', value: 62 },
  { time: '', value: 52 },
  { time: '', value: 52 },
  { time: '', value: 52 },
  { time: '', value: 52 },
  { time: 'Apr AM', value: 52 },
  { time: '', value: 52 },
  { time: '', value: 52 },
  { time: '', value: 52 },
  { time: '', value: 62 },
  { time: '', value: 62 },
  { time: '', value: 62 },
  { time: '', value: 62 },
  { time: '', value: 62 },
  { time: '', value: 62 },
  { time: 'Dec AM', value: 62 },
  { time: '', value: 62 },
  { time: '', value: 62 },
  { time: '', value: 62 },
  { time: '', value: 62 },
  { time: 'Oct PM', value: 62 },
];

const networkData = [
  { time: 'Jan AM', value: 0 },
  { time: '', value: 2 },
  { time: '', value: 230 },
  { time: '', value: 70 },
  { time: '', value: 0 },
  { time: '', value: 0 },
  { time: '', value: 0 },
  { time: '', value: 120 },
  { time: '', value: 250 },
  { time: '', value: 240 },
  { time: '', value: 130 },
  { time: '', value: 0 },
  { time: '', value: 0 },
  { time: '', value: 0 },
  { time: 'Apr AM', value: 210 },
  { time: '', value: 130 },
  { time: '', value: 0 },
  { time: '', value: 0 },
  { time: '', value: 0 },
  { time: '', value: 170 },
  { time: '', value: 320 },
  { time: '', value: 80 },
  { time: '', value: 0 },
  { time: '', value: 0 },
  { time: 'Dec AM', value: 220 },
  { time: '', value: 270 },
  { time: '', value: 140 },
  { time: '', value: 0 },
  { time: '', value: 0 },
  { time: 'Oct PM', value: 110 },
];

const initialEvents = [
  { id: 1, type: 'success', message: 'Scheduled health check completed.', time: 'Timestamp ago' },
  { id: 2, type: 'warning', message: 'Service response time returned to normal.', time: 'Timestamp ago' },
  { id: 3, type: 'info', message: 'Resource utilization updated.', time: 'Timestamp ago' },
  { id: 4, type: 'success', message: 'Background worker status checked.', time: 'Timestamp ago' },
];

const chartConfigs = [
  {
    key: 'cpu',
    title: 'CPU usage over time',
    data: cpuData,
    color: '#1d5fd1',
    max: 50,
    suffix: '%',
    icon: Cpu,
    thresholdKey: 'cpuThreshold',
  },
  {
    key: 'memory',
    title: 'Memory usage over time',
    data: memoryData,
    color: '#8b2fe0',
    max: 100,
    suffix: '%',
    icon: MemoryStick,
    thresholdKey: 'memoryThreshold',
  },
  {
    key: 'disk',
    title: 'Disk utilization',
    data: diskData,
    color: '#f59e0b',
    max: 100,
    suffix: '%',
    icon: HardDrive,
  },
  {
    key: 'network',
    title: 'Network activity',
    data: networkData,
    color: '#16a34a',
    max: 400,
    suffix: 'K',
    icon: Activity,
  },
];

const RANGES = [
  { id: 'all', label: 'All data' },
  { id: 'first', label: 'First half' },
  { id: 'second', label: 'Second half' },
  { id: 'recent', label: 'Last 10 points' },
];

const getTicks = (max) => (max === 400 ? [0, 200, 400] : [0, Math.round(max / 2), max]);

const formatTick = (value, max, suffix) =>
  max === 400 && value !== 0 ? `${value}K` : `${value}${suffix}`;

const buildSeries = (data) =>
  data.map((point, index) => ({
    ...point,
    label: point.time || `#${index + 1}`,
  }));

const kpis = [
  {
    key: 'status',
    title: 'System Status',
    value: 'Operational',
    caption: 'All systems normal',
    icon: CheckCircle2,
    tone: 'green',
    small: true,
  },
  { key: 'cpu', title: 'CPU Usage', value: '42%', caption: 'Current load', icon: Cpu, tone: 'blue' },
  { key: 'memory', title: 'Memory Usage', value: '68%', caption: 'RAM in use', icon: MemoryStick, tone: 'purple' },
  { key: 'disk', title: 'Disk Usage', value: '54%', caption: 'Storage used', icon: HardDrive, tone: 'orange' },
  { key: 'services', title: 'Active Services', value: '8 of 8', caption: 'Running', icon: Settings, tone: 'teal' },
];

const dataStats = (data) => {
  const values = data.map((point) => point.value);
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;

  return {
    avg: Math.round(avg * 10) / 10,
    peak: Math.max(...values),
    low: Math.min(...values),
  };
};

const EVENT_FILTERS = [
  { id: 'all', label: 'All events' },
  { id: 'success', label: 'Success' },
  { id: 'warning', label: 'Warnings' },
  { id: 'info', label: 'Info' },
];

const EVENT_LABELS = { success: 'Success', warning: 'Warning', info: 'Info' };

function SectionHeader({ icon: Icon, title, children }) {
  return (
    <div className="sm-section-header">
      <div className="sm-section-title">
        <span className="sm-section-icon">
          <Icon size={16} />
        </span>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function MonitoringChart({ chart, onOpen }) {
  const { key, title, data, color, max, suffix } = chart;
  const gradientId = `sm-grad-${key}`;

  return (
    <div
      className="sm-chart-card sm-chart-clickable"
      style={{ '--chart-color': color }}
      role="button"
      tabIndex={0}
      title="Click to drill down"
      aria-label={`Open ${title} details`}
      onClick={() => onOpen(key)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(key);
        }
      }}
    >
      <div className="sm-chart-card-head">
        <h3>{title}</h3>
        <span className="sm-expand-icon">
          <Maximize2 size={14} />
        </span>
      </div>

      <div className="sm-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 6, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#e3ebf5" vertical={false} strokeDasharray="3 3" />

            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#475569' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              height={22}
            />

            <YAxis
              domain={[0, max]}
              ticks={getTicks(max)}
              tickFormatter={(value) => formatTick(value, max, suffix)}
              tick={{ fontSize: 10, fill: '#475569' }}
              axisLine={false}
              tickLine={false}
              width={38}
            />

            <Tooltip
              formatter={(value) => [`${value}${suffix}`, title]}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e3ebf5',
                boxShadow: '0 4px 14px rgba(20, 50, 100, 0.12)',
                fontSize: 12,
              }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#ffffff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DrillDownModal({ chart, threshold, onClose }) {
  const { key, title, data, color, max, suffix, icon: Icon } = chart;

  const [range, setRange] = useState('all');
  const [selected, setSelected] = useState(null);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const series = useMemo(() => {
    const all = buildSeries(data);
    const half = Math.floor(all.length / 2);

    if (range === 'first') return all.slice(0, half);
    if (range === 'second') return all.slice(half);
    if (range === 'recent') return all.slice(-10);
    return all;
  }, [data, range]);

  const values = series.map((point) => point.value);
  const current = values[values.length - 1];
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const peak = Math.max(...values);
  const lowest = Math.min(...values);
  const peakPoint = series.find((point) => point.value === peak);
  const lowestPoint = series.find((point) => point.value === lowest);

  const showThreshold = Boolean(threshold) && suffix === '%';
  const domainMax = Math.max(max, showThreshold ? threshold : 0, peak);
  const isAlert = showThreshold && current >= threshold;

  const fmt = (value) => `${Math.round(value * 10) / 10}${suffix}`;
  const selectedPoint = selected !== null ? series[selected] : null;

  const changeRange = (id) => {
    setRange(id);
    setSelected(null);
  };

  return (
    <div
      className="sm-modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="sm-modal sm-modal-wide"
        style={{ '--chart-color': color }}
      >
        <div className="sm-modal-header">
          <div className="sm-drill-title">
            <span className="sm-drill-icon">
              <Icon size={20} />
            </span>

            <div>
              <h2>{title}</h2>
              <p className="sm-drill-sub">
                Drill-down view · click any point on the chart to inspect it
              </p>
            </div>
          </div>

          <button onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        <div className="sm-drill-toolbar">
          <div className="sm-chip-group">
            {RANGES.map((item) => (
              <button
                key={item.id}
                className={`sm-chip ${range === item.id ? 'active' : ''}`}
                onClick={() => changeRange(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {showThreshold && (
            <span className={`sm-health-badge ${isAlert ? 'alert' : 'ok'}`}>
              {isAlert
                ? `Above ${threshold}% alert threshold`
                : `Below ${threshold}% alert threshold`}
            </span>
          )}
        </div>

        <div className="sm-drill-stats">
          <div className="sm-stat-tile">
            <span>Current</span>
            <strong>{fmt(current)}</strong>
            <small>Latest reading</small>
          </div>

          <div className="sm-stat-tile">
            <span>Average</span>
            <strong>{fmt(average)}</strong>
            <small>{series.length} data points</small>
          </div>

          <div className="sm-stat-tile">
            <span>Peak</span>
            <strong>{fmt(peak)}</strong>
            <small>at {peakPoint?.label}</small>
          </div>

          <div className="sm-stat-tile">
            <span>Lowest</span>
            <strong>{fmt(lowest)}</strong>
            <small>at {lowestPoint?.label}</small>
          </div>
        </div>

        <div className="sm-drill-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={series}
              margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
              onClick={(state) => {
                const index = state?.activeTooltipIndex ?? state?.activeIndex;

                if (index !== undefined && index !== null && !Number.isNaN(Number(index))) {
                  setSelected(Number(index));
                }
              }}
            >
              <defs>
                <linearGradient id={`sm-drill-grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.03} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#e3ebf5" vertical={false} strokeDasharray="3 3" />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#475569' }}
                axisLine={false}
                tickLine={false}
                interval={Math.max(0, Math.ceil(series.length / 8) - 1)}
              />

              <YAxis
                domain={[0, domainMax]}
                tickFormatter={(value) => `${value}${suffix}`}
                tick={{ fontSize: 11, fill: '#475569' }}
                axisLine={false}
                tickLine={false}
                width={46}
              />

              <Tooltip
                formatter={(value) => [`${value}${suffix}`, title]}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #e3ebf5',
                  boxShadow: '0 4px 14px rgba(20, 50, 100, 0.12)',
                  fontSize: 12,
                }}
              />

              {showThreshold && (
                <ReferenceLine
                  y={threshold}
                  stroke="#dc2626"
                  strokeDasharray="5 4"
                  label={{
                    value: `Alert ${threshold}%`,
                    position: 'insideTopRight',
                    fontSize: 11,
                    fill: '#dc2626',
                  }}
                />
              )}

              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#sm-drill-grad-${key})`}
                dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff' }}
              />

              {selectedPoint && (
                <ReferenceDot
                  x={selectedPoint.label}
                  y={selectedPoint.value}
                  r={7}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth={3}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="sm-selected-bar">
          {selectedPoint ? (
            <span>
              Selected: <strong>{selectedPoint.label}</strong> ·{' '}
              <strong>{fmt(selectedPoint.value)}</strong>
              {' '}({selectedPoint.value >= average ? '+' : '−'}
              {fmt(Math.abs(selectedPoint.value - average))} vs average)
            </span>
          ) : (
            <span>Click a point on the chart or a row in the table to inspect it.</span>
          )}

          <button
            className="sm-link-button"
            onClick={() => setShowTable((value) => !value)}
          >
            <Table2 size={15} />
            {showTable ? 'Hide data table' : 'Show data table'}
          </button>
        </div>

        {showTable && (
          <div className="sm-drill-table-wrap">
            <table className="sm-drill-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Time</th>
                  <th>Value</th>
                  <th>vs average</th>
                </tr>
              </thead>

              <tbody>
                {series.map((point, index) => {
                  const diff = point.value - average;

                  return (
                    <tr
                      key={index}
                      className={selected === index ? 'selected' : ''}
                      onClick={() => setSelected(index)}
                    >
                      <td>{index + 1}</td>
                      <td>{point.label}</td>
                      <td>{fmt(point.value)}</td>
                      <td className={diff > 0 ? 'delta-up' : 'delta-down'}>
                        {diff > 0 ? '▲' : '▼'} {fmt(Math.abs(diff))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Renders children straight into <body> so no parent layout can clip or hide them.
function Portal({ children }) {
  return createPortal(
    <div className="system-monitoring sm-portal">{children}</div>,
    document.body
  );
}

function EventTypeIcon({ type, size = 13 }) {
  if (type === 'success') return <Check size={size} />;
  if (type === 'warning') return <AlertTriangle size={size} />;
  return <Info size={size} />;
}

function SidePanel({ kpi, rows, onClose }) {
  const Icon = kpi.icon;

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <aside className="sm-side-panel" aria-label={`${kpi.title} details`}>
      <div className="sm-panel-header">
        <div className="sm-panel-title">
          <span className={`sm-status-icon sm-panel-icon tone-${kpi.tone}`}>
            <Icon size={18} />
          </span>
          <h2>{kpi.title}</h2>
        </div>

        <button onClick={onClose} aria-label="Close panel">
          <X size={20} />
        </button>
      </div>

      <div className="sm-panel-hero">
        <strong>{kpi.value}</strong>
        <span>{kpi.caption}</span>
      </div>

      <div className="sm-panel-rows">
        {rows.map(([label, value]) => (
          <div className="sm-panel-row" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <p className="sm-panel-note">
        Demonstration data only — not connected to a backend.
      </p>
    </aside>
  );
}

function EventsPage({ events, onBack }) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const counts = {
    success: events.filter((event) => event.type === 'success').length,
    warning: events.filter((event) => event.type === 'warning').length,
    info: events.filter((event) => event.type === 'info').length,
  };

  const filtered = events.filter(
    (event) =>
      (filter === 'all' || event.type === filter) &&
      event.message.toLowerCase().includes(query.trim().toLowerCase())
  );

  const tiles = [
    { title: 'Total Events', value: events.length, caption: 'All recorded events', icon: Bell, tone: 'blue' },
    { title: 'Success', value: counts.success, caption: 'Completed checks', icon: Check, tone: 'green' },
    { title: 'Warnings', value: counts.warning, caption: 'Needs attention', icon: AlertTriangle, tone: 'orange' },
    { title: 'Information', value: counts.info, caption: 'General updates', icon: Info, tone: 'teal' },
  ];

  return (
    <div className="system-monitoring">
      <button className="sm-back-button" onClick={onBack}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      <div className="sm-page-header">
        <div className="sm-heading">
          <h1>Recent Events</h1>
          <p>
            Review every system event, health check and resource update in one
            place.
          </p>
        </div>
      </div>

      <section className="sm-status-grid sm-summary-grid">
        {tiles.map(({ title, value, caption, icon: Icon, tone }) => (
          <div className="sm-status-card" key={title}>
            <div className={`sm-status-icon tone-${tone}`}>
              <Icon size={28} />
            </div>

            <div className="sm-status-text">
              <h3>{title}</h3>
              <p className="sm-value">{value}</p>
              <span>{caption}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="sm-card">
        <SectionHeader icon={Bell} title="All Events">
          <label className="sm-search">
            <Search size={15} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search events..."
              aria-label="Search events"
            />
          </label>
        </SectionHeader>

        <div className="sm-chip-group sm-events-filters">
          {EVENT_FILTERS.map((item) => (
            <button
              key={item.id}
              className={`sm-chip ${filter === item.id ? 'active' : ''}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="sm-table-wrapper">
          <table className="sm-service-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Event</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((event, index) => (
                <tr key={event.id}>
                  <td className="sm-index">{index + 1}</td>

                  <td>
                    <span className={`sm-type-pill type-${event.type}`}>
                      <EventTypeIcon type={event.type} size={12} />
                      {EVENT_LABELS[event.type] || 'Info'}
                    </span>
                  </td>

                  <td>{event.message}</td>
                  <td>{event.time}</td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="4" className="sm-empty-state">
                    No events match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="sm-table-footer">
          Showing {filtered.length} of {events.length} events
        </p>
      </section>
    </div>
  );
}

export default function SystemMonitoring({ toast }) {
  const [services, setServices] = useState(initialServices);
  const [events, setEvents] = useState(initialEvents);
  const [view, setView] = useState('dashboard');
  const [panelKey, setPanelKey] = useState(null);
  const [drillKey, setDrillKey] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('01/15/2024 12:33:43');

  const [settings, setSettings] = useState({
    refreshInterval: '30',
    emailAlerts: true,
    cpuThreshold: 80,
    memoryThreshold: 85,
  });

  const notify = (message) => {
    if (toast) {
      toast(message);
    }
  };

  const refreshMonitoring = () => {
    const now = new Date();

    setLastUpdated(
      now.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    );

    setEvents((current) =>
      [
        {
          id: Date.now(),
          type: 'success',
          message: 'System health check completed successfully.',
          time: 'Just now',
        },
        ...current,
      ].slice(0, 8)
    );

    notify('System monitoring data refreshed.');
  };

  const deleteService = (id) => {
    const service = services.find((item) => item.id === id);

    setServices((current) => current.filter((item) => item.id !== id));

    setEvents((current) => [
      {
        id: Date.now(),
        type: 'info',
        message: `${service?.name || 'Service'} removed from the monitoring table.`,
        time: 'Just now',
      },
      ...current,
    ]);

    notify('Service removed.');
  };

  const saveService = () => {
    if (!editingService.name.trim()) {
      notify('Please enter a service name.');
      return;
    }

    setServices((current) =>
      current.map((item) =>
        item.id === editingService.id ? editingService : item
      )
    );

    setEditingService(null);
    notify('Service updated successfully.');
  };

  const exportSettings = () => {
    const content = {
      exportedAt: new Date().toISOString(),
      settings,
      services,
      events,
    };

    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'system-monitoring-settings.json';
    link.click();

    URL.revokeObjectURL(url);
    notify('Monitoring settings exported.');
  };

  const visibleEvents = events.slice(0, 4);

  const eventCounts = {
    success: events.filter((event) => event.type === 'success').length,
    warning: events.filter((event) => event.type === 'warning').length,
    info: events.filter((event) => event.type === 'info').length,
  };

  const getPanelRows = (key) => {
    const operational = services.filter((item) => item.status === 'Operational').length;
    const degraded = services.length - operational;

    if (key === 'status') {
      return [
        ['Overall status', 'Operational'],
        ['Operational services', operational],
        ['Degraded services', degraded],
        ['Recent events', events.length],
        ['Last updated', lastUpdated],
      ];
    }

    if (key === 'services') {
      return [
        ['Active services', '8 of 8'],
        ['Listed in table', services.length],
        ['Operational', operational],
        ['Degraded', degraded],
        ['Refresh interval', `${settings.refreshInterval} seconds`],
      ];
    }

    const config = {
      cpu: { data: cpuData, threshold: settings.cpuThreshold, current: 42 },
      memory: { data: memoryData, threshold: settings.memoryThreshold, current: 68 },
      disk: { data: diskData, threshold: null, current: 54 },
    }[key];

    const { avg, peak, low } = dataStats(config.data);

    const rows = [
      ['Current usage', `${config.current}%`],
      ['Average', `${avg}%`],
      ['Peak', `${peak}%`],
      ['Lowest', `${low}%`],
    ];

    if (config.threshold) {
      rows.push(['Alert threshold', `${config.threshold}%`]);
      rows.push([
        'Status',
        config.current >= config.threshold ? 'Above threshold' : 'Within limits',
      ]);
    }

    rows.push(['Last updated', lastUpdated]);
    return rows;
  };

  const activeKpi = kpis.find((item) => item.key === panelKey);

  useEffect(() => {
    document
      .querySelector('.system-monitoring')
      ?.scrollIntoView({ block: 'start' });
  }, [view]);

  if (view === 'events') {
    return <EventsPage events={events} onBack={() => setView('dashboard')} />;
  }
  const activeChart = chartConfigs.find((item) => item.key === drillKey);

  return (
    <div className="system-monitoring">
      {/* Page header */}
      <div className="sm-page-header">
        <div className="sm-heading">
          <h1>System Monitoring</h1>

          <p>
            Monitor system health, service availability, resource utilization,
            and application performance from one place.
          </p>
        </div>

        <div className="sm-header-actions">
          <div className="sm-updated-pill">
            <Calendar size={16} />
            <span>Last updated: {lastUpdated}</span>

            <button
              className="sm-refresh-button"
              onClick={refreshMonitoring}
              title="Refresh system monitoring"
              aria-label="Refresh system monitoring"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          <button className="sm-btn sm-btn-primary" onClick={exportSettings}>
            <Download size={16} />
            Export Settings
          </button>

          <button
            className="sm-btn sm-btn-primary"
            onClick={() => setShowSettings(true)}
          >
            <SlidersHorizontal size={16} />
            Settings
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <section className="sm-status-grid">
        {kpis.map((kpi) => {
          const { key, title, value, caption, icon: Icon, tone, small } = kpi;
          const isActive = panelKey === key;

          return (
            <div
              className={`sm-status-card sm-status-clickable ${isActive ? 'active' : ''}`}
              key={key}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
              title="Click to view details"
              onClick={() => setPanelKey(isActive ? null : key)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setPanelKey(isActive ? null : key);
                }
              }}
            >
              <div className={`sm-status-icon tone-${tone}`}>
                <Icon size={28} />
              </div>

              <div className="sm-status-text">
                <h3>{title}</h3>
                <p className={small ? 'sm-value sm-value-small' : 'sm-value'}>
                  {value}
                </p>
                <span>{caption}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Resource utilization */}
      <section className="sm-card sm-resource-section">
        <SectionHeader icon={Activity} title="Resource Utilization">
          <div className="sm-legend">
            <Maximize2 size={13} />
            Click any chart to drill down
          </div>
        </SectionHeader>

        <div className="sm-chart-grid">
          {chartConfigs.map((chart) => (
            <MonitoringChart
              key={chart.key}
              chart={chart}
              onOpen={setDrillKey}
            />
          ))}
        </div>
      </section>

      {/* Service health + events */}
      <section className="sm-bottom-grid">
        <div className="sm-card sm-services-section">
          <SectionHeader icon={Server} title="Service Health" />

          <div className="sm-table-wrapper">
            <table className="sm-service-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Service Name</th>
                  <th>Status</th>
                  <th>Response Time</th>
                  <th>Last Checked</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {services.map((service, index) => (
                  <tr key={service.id}>
                    <td className="sm-index">{index + 1}</td>

                    <td>{service.name}</td>

                    <td>
                      <span
                        className={`sm-service-badge ${
                          service.status === 'Operational'
                            ? 'badge-operational'
                            : 'badge-degraded'
                        }`}
                      >
                        {service.status}
                      </span>
                    </td>

                    <td>{service.response}</td>

                    <td>{service.checked}</td>

                    <td>
                      <div className="sm-action-buttons">
                        <button
                          title="Edit service"
                          aria-label={`Edit ${service.name}`}
                          onClick={() => setEditingService({ ...service })}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          title="Delete service"
                          aria-label={`Delete ${service.name}`}
                          onClick={() => deleteService(service.id)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {services.length === 0 && (
                  <tr>
                    <td colSpan="6" className="sm-empty-state">
                      No services available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="sm-table-footer">
            Showing {services.length} of {services.length} services
          </p>
        </div>

        <div className="sm-card sm-events-section">
          <SectionHeader icon={Bell} title="Recent Events">
            <button
              className="sm-btn sm-btn-outline sm-btn-small"
              onClick={() => {
                setPanelKey(null);
                setView('events');
              }}
            >
              View All
            </button>
          </SectionHeader>

          <div className="sm-events-list">
            {visibleEvents.map((event) => (
              <div className="sm-event" key={event.id}>
                <div className={`sm-event-icon ${event.type}`}>
                  {event.type === 'success' ? (
                    <Check size={13} />
                  ) : event.type === 'warning' ? (
                    <AlertTriangle size={13} />
                  ) : (
                    <Info size={13} />
                  )}
                </div>

                <div className="sm-event-content">
                  <p>{event.message}</p>
                  <span>{event.time}</span>
                </div>
              </div>
            ))}

            {events.length === 0 && (
              <div className="sm-no-events">No recent events.</div>
            )}
          </div>

          <div className="sm-events-summary">
            <div>
              <strong className="c-success">{eventCounts.success}</strong>
              <span>Success</span>
            </div>

            <div>
              <strong className="c-warning">{eventCounts.warning}</strong>
              <span>Warnings</span>
            </div>

            <div>
              <strong className="c-info">{eventCounts.info}</strong>
              <span>Info</span>
            </div>
          </div>
        </div>
      </section>

      {/* KPI details side panel */}
      {activeKpi && (
        <Portal>
          <SidePanel
            kpi={activeKpi}
            rows={getPanelRows(activeKpi.key)}
            onClose={() => setPanelKey(null)}
          />
        </Portal>
      )}

      {/* Chart drill-down modal */}
      {activeChart && (
        <Portal>
          <DrillDownModal
            chart={activeChart}
            threshold={
              activeChart.thresholdKey ? settings[activeChart.thresholdKey] : null
            }
            onClose={() => setDrillKey(null)}
          />
        </Portal>
      )}

      {/* Edit service modal */}
      {editingService && (
        <div
          className="sm-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setEditingService(null);
            }
          }}
        >
          <div className="sm-modal">
            <div className="sm-modal-header">
              <h2>Edit Service</h2>

              <button
                onClick={() => setEditingService(null)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <label>
              Service Name
              <input
                value={editingService.name}
                onChange={(event) =>
                  setEditingService({
                    ...editingService,
                    name: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Status
              <select
                value={editingService.status}
                onChange={(event) =>
                  setEditingService({
                    ...editingService,
                    status: event.target.value,
                  })
                }
              >
                <option value="Operational">Operational</option>
                <option value="Degraded">Degraded</option>
              </select>
            </label>

            <label>
              Response Time
              <input
                value={editingService.response}
                onChange={(event) =>
                  setEditingService({
                    ...editingService,
                    response: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Last Checked
              <input
                value={editingService.checked}
                onChange={(event) =>
                  setEditingService({
                    ...editingService,
                    checked: event.target.value,
                  })
                }
              />
            </label>

            <div className="sm-modal-actions">
              <button
                className="sm-cancel-button"
                onClick={() => setEditingService(null)}
              >
                Cancel
              </button>

              <button className="sm-save-button" onClick={saveService}>
                <Check size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings modal */}
      {showSettings && (
        <div
          className="sm-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowSettings(false);
            }
          }}
        >
          <div className="sm-modal">
            <div className="sm-modal-header">
              <h2>Monitoring Settings</h2>

              <button
                onClick={() => setShowSettings(false)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <label>
              Refresh Interval
              <select
                value={settings.refreshInterval}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    refreshInterval: event.target.value,
                  })
                }
              >
                <option value="15">15 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">60 seconds</option>
              </select>
            </label>

            <label>
              CPU Alert Threshold (%)
              <input
                type="number"
                min="1"
                max="100"
                value={settings.cpuThreshold}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    cpuThreshold: Number(event.target.value),
                  })
                }
              />
            </label>

            <label>
              Memory Alert Threshold (%)
              <input
                type="number"
                min="1"
                max="100"
                value={settings.memoryThreshold}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    memoryThreshold: Number(event.target.value),
                  })
                }
              />
            </label>

            <label className="sm-checkbox-label">
              <input
                type="checkbox"
                checked={settings.emailAlerts}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    emailAlerts: event.target.checked,
                  })
                }
              />
              Enable email alerts
            </label>

            <div className="sm-modal-actions">
              <button
                className="sm-cancel-button"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </button>

              <button
                className="sm-save-button"
                onClick={() => {
                  setShowSettings(false);
                  notify('Monitoring settings saved.');
                }}
              >
                <Check size={16} />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
