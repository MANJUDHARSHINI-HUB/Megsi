import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Files,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CalendarDays,
  BarChart3,
  Database,
  ShieldCheck,
  Pencil,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  RefreshCw,
  X,
  Check,
  Play,
  ArrowLeft,
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

import {
  INITIAL_BACKUP_JOBS,
  INITIAL_BACKUP_SCHEDULES,
  STORAGE_LABELS,
  allocate,
  getRangeStats,
  buildActivity,
  getTypeBreakdown,
  getTypeDrill,
  getStorageData,
  getStorageBreakdown,
} from '../data/dataBackupData.js';

import './data-backup.css';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_MS = 86400000;

const pad = (value) => String(value).padStart(2, '0');

const formatDate = (date) =>
  `${pad(date.getDate())} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

const toInputValue = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const fromInputValue = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const addDays = (date, amount) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);

const getDateTime = () => {
  const now = new Date();
  return `${formatDate(now)} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const parseJobDate = (text) => {
  const match = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/.exec(text || '');
  if (!match) return null;
  const monthIndex = MONTHS.indexOf(match[2]);
  if (monthIndex === -1) return null;
  return new Date(Number(match[3]), monthIndex, Number(match[1]));
};

const formatNumber = (value) => Number(value).toLocaleString('en-US');

const TODAY = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
const NEXT_FULL_BACKUP = new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 1);

const PRESETS = [
  { id: 'last-7', label: 'Last 7 Days', start: addDays(TODAY, -6), end: TODAY },
  { id: 'last-30', label: 'Last 30 Days', start: addDays(TODAY, -29), end: TODAY },
  { id: 'last-90', label: 'Last 90 Days', start: addDays(TODAY, -89), end: TODAY },
  {
    id: 'this-month',
    label: 'This Month',
    start: new Date(TODAY.getFullYear(), TODAY.getMonth(), 1),
    end: new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0),
  },
  {
    id: 'last-month',
    label: 'Last Month',
    start: new Date(TODAY.getFullYear(), TODAY.getMonth() - 1, 1),
    end: new Date(TODAY.getFullYear(), TODAY.getMonth(), 0),
  },
  {
    id: 'ytd',
    label: 'Year to date',
    start: new Date(TODAY.getFullYear(), 0, 1),
    end: new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0),
  },
  {
    id: 'last-12-months',
    label: 'Last 12 Months',
    start: new Date(TODAY.getFullYear(), TODAY.getMonth() - 11, 1),
    end: TODAY,
  },
  {
    id: 'last-30-months',
    label: 'Last 30 Months',
    start: new Date(TODAY.getFullYear(), TODAY.getMonth() - 29, 1),
    end: TODAY,
  },
];

const DEFAULT_RANGE = {
  id: 'default',
  label: 'Custom Range',
  start: new Date(2026, 9, 1),
  end: new Date(2026, 9, 31),
};

const EMPTY_FORM = {
  name: '',
  type: 'Full',
  source: 'Company Data',
  frequency: 'Daily',
  time: '01:00',
  retention: '30 days',
  enabled: true,
};

const TOOLTIP_STYLE = {
  borderRadius: 7,
  border: '1px solid #dce5ef',
  fontSize: 11,
};

/* ------------------------------------------------------------------ */
/* Date range picker                                                   */
/* ------------------------------------------------------------------ */

function DateRangePicker({ range, onChange }) {
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

  return (
    <div className="db-date-picker" ref={containerRef}>
      <button
        type="button"
        className="db-date-selector"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <CalendarDays size={16} />
        <span>
          {formatDate(range.start)} - {formatDate(range.end)}
        </span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="db-date-popover" role="dialog" aria-label="Select date range">
          <div className="db-date-options">
            {PRESETS.map((preset) => (
              <button
                type="button"
                key={preset.id}
                className={`db-date-option ${range.id === preset.id ? 'active' : ''}`}
                onClick={() => {
                  onChange(preset);
                  setOpen(false);
                }}
              >
                <strong>{preset.label}</strong>
                <span>
                  {formatDate(preset.start)} – {formatDate(preset.end)}
                </span>
              </button>
            ))}
          </div>

          <div className="db-date-custom">
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

            {error && <p className="db-date-error">{error}</p>}

            <button type="button" className="db-btn db-btn-primary db-date-apply" onClick={applyCustom}>
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

export default function DataBackup({ toast }) {
  const [jobs, setJobs] = useState(INITIAL_BACKUP_JOBS);
  const [schedules, setSchedules] = useState(INITIAL_BACKUP_SCHEDULES);
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [range, setRange] = useState(DEFAULT_RANGE);
  // Separate range state for the activity graph dropdown only.
  const [chartRange, setChartRange] = useState(DEFAULT_RANGE);
  const [modal, setModal] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [typeFilter, setTypeFilter] = useState(null);
  const [typeDrill, setTypeDrill] = useState(null);
  const [storageDrill, setStorageDrill] = useState(null);
  const [menu, setMenu] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!menu) return undefined;

    const close = () => setMenu(null);

    window.addEventListener('mousedown', close);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);

    return () => {
      window.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [menu]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') setActiveCard(null);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const notify = (message) => {
    if (toast) toast(message);
  };

  const rangeText = `${formatDate(range.start)} - ${formatDate(range.end)}`;

  /* ---------- Data that follows the selected date range ---------- */

  const stats = useMemo(() => getRangeStats(range.start, range.end), [range]);
  const activity = useMemo(
    () => buildActivity(chartRange.start, chartRange.end),
    [chartRange]
  );
  const typeData = useMemo(() => getTypeBreakdown(stats.total, range.end), [stats, range]);
  const storageData = useMemo(() => getStorageData(range.end), [range]);

  const jobsInRange = useMemo(
    () =>
      jobs.filter((job) => {
        const date = parseJobDate(job.startTime);
        return !date || (date >= range.start && date <= range.end);
      }),
    [jobs, range]
  );

  const rangeJobs = useMemo(
    () => (typeFilter ? jobsInRange.filter((job) => job.type === typeFilter) : jobsInRange),
    [jobsInRange, typeFilter]
  );

  const displayedJobs = showAllJobs ? rangeJobs : rangeJobs.slice(0, 4);

  const chartSelectValue = PRESETS.some((preset) => preset.id === chartRange.id)
    ? chartRange.id
    : 'selected';

  const typeDrillItem = typeDrill ? typeData.find((item) => item.name === typeDrill) : null;
  const typeDrillData = typeDrillItem ? getTypeDrill(typeDrillItem.name, typeDrillItem.count, stats) : null;

  const storageDrillItem = storageDrill ? storageData.find((item) => item.name === storageDrill) : null;
  const storageDrillData = storageDrillItem
    ? getStorageBreakdown(storageDrillItem.value, storageDrillItem.name)
    : null;

  /* ---------- Right side panel content ---------- */

  const buildPanel = (id) => {
    const failedInList = jobsInRange.filter((job) => job.status === 'Failed');
    const successfulInList = jobsInRange.filter((job) => job.status === 'Successful');

    switch (id) {
      case 'total':
        return {
          title: 'Total Backups',
          rows: [
            ['Total backups', formatNumber(stats.total)],
            ['Successful', formatNumber(stats.successful)],
            ['Failed', formatNumber(stats.failed)],
            ['Other (running / pending)', formatNumber(stats.other)],
            ['Success rate', `${stats.rate.toFixed(1)}%`],
            ['Days in range', formatNumber(stats.days)],
            ['Date range', rangeText],
          ],
          jobs: jobsInRange,
          jobsTitle: 'Backup jobs in this period',
        };

      case 'success':
        return {
          title: 'Successful Backups',
          rows: [
            ['Successful backups', formatNumber(stats.successful)],
            ['Success rate', `${stats.rate.toFixed(1)}%`],
            ['Average per day', formatNumber(Math.round(stats.successful / Math.max(1, stats.days)))],
            ['Scope', 'Across all companies'],
            ['Date range', rangeText],
          ],
          jobs: successfulInList,
          jobsTitle: 'Successful jobs in this period',
        };

      case 'failed':
        return {
          title: 'Failed Jobs',
          rows: [
            ['Failed jobs', formatNumber(stats.failed)],
            [
              'Failure rate',
              `${stats.total ? ((stats.failed / stats.total) * 100).toFixed(1) : '0.0'}%`,
            ],
            ['Critical errors', formatNumber(stats.critical)],
            ['Failed jobs listed', formatNumber(failedInList.length)],
            ['Date range', rangeText],
          ],
          jobs: failedInList,
          jobsTitle: 'Failed jobs in this period',
        };

      case 'critical': {
        const [storage, integrity, network] = allocate(stats.critical, [25, 35, 40]);

        return {
          title: 'Critical Errors',
          rows: [
            ['Critical errors', formatNumber(stats.critical)],
            ['Storage errors', formatNumber(storage)],
            ['Integrity check failures', formatNumber(integrity)],
            ['Network / timeout errors', formatNumber(network)],
            ['Date range', rangeText],
          ],
          jobs: null,
        };
      }

      case 'next':
        return {
          title: 'Next Full Backup',
          rows: [
            ['Scheduled date', formatDate(NEXT_FULL_BACKUP)],
            ['Scheduled time', '01:00 AM'],
            ['Backup type', 'Full Backup'],
            ['Source', 'Platform Data'],
            [
              'Days remaining',
              formatNumber(Math.max(0, Math.ceil((NEXT_FULL_BACKUP - TODAY) / DAY_MS))),
            ],
          ],
          jobs: null,
        };

      default:
        return null;
    }
  };

  const panel = activeCard ? buildPanel(activeCard) : null;

  /* ---------- Actions ---------- */

  const updateForm = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const closeModal = () => {
    setModal(null);
    setSelectedJob(null);
    setSelectedSchedule(null);
  };

  const openCreateSchedule = () => {
    setSelectedSchedule(null);
    setForm(EMPTY_FORM);
    setModal('schedule');
  };

  const openEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setForm({
      name: schedule.name,
      type: schedule.type,
      source: schedule.source,
      frequency: schedule.frequency,
      time: schedule.time,
      retention: schedule.retention,
      enabled: schedule.enabled,
    });
    setModal('schedule');
  };

  const saveSchedule = () => {
    if (!form.name.trim()) {
      notify('Please enter a backup schedule name.');
      return;
    }

    const base = {
      name: form.name.trim(),
      type: form.type,
      source: form.source,
      frequency: form.frequency,
      time: form.time,
      retention: form.retention,
      enabled: form.enabled,
      nextRun: '27 Oct 2026 01:00',
    };

    if (selectedSchedule) {
      setSchedules((previous) =>
        previous.map((item) =>
          item.id === selectedSchedule.id ? { ...base, id: item.id } : item
        )
      );
      notify('Backup schedule updated successfully.');
    } else {
      setSchedules((previous) => [
        { ...base, id: `SCH-${Date.now().toString().slice(-6)}` },
        ...previous,
      ]);
      notify('New backup schedule created successfully.');
    }

    closeModal();
    setForm(EMPTY_FORM);
  };

  const deleteSchedule = (schedule) => {
    setSchedules((previous) => previous.filter((item) => item.id !== schedule.id));
    notify('Backup schedule deleted.');
    closeModal();
  };

  const toggleSchedule = (schedule) => {
    setSchedules((previous) =>
      previous.map((item) =>
        item.id === schedule.id ? { ...item, enabled: !item.enabled } : item
      )
    );
    notify('Schedule status updated.');
  };

  const runBackup = () => {
    const newJob = {
      id: `BJ-${Date.now().toString().slice(-6)}`,
      type: 'Full',
      source: 'Company Data',
      status: 'Successful',
      startTime: getDateTime(),
      duration: '1m',
    };

    setJobs((previous) => [newJob, ...previous]);
    setRange((previous) =>
      TODAY > previous.end || TODAY < previous.start
        ? {
            id: 'custom',
            label: 'Custom Range',
            start: previous.start < TODAY ? previous.start : TODAY,
            end: previous.end > TODAY ? previous.end : TODAY,
          }
        : previous
    );
    closeModal();
    notify('Immediate full backup completed successfully.');
  };

  const retryJob = (job) => {
    setJobs((previous) =>
      previous.map((item) =>
        item.id === job.id ? { ...item, status: 'Successful', duration: '2m' } : item
      )
    );
    setMenu(null);
    closeModal();
    notify(`Backup job ${job.id} retried successfully.`);
  };

  const deleteJob = (job) => {
    setJobs((previous) => previous.filter((item) => item.id !== job.id));
    setMenu(null);
    closeModal();
    notify(`Backup job ${job.id} removed.`);
  };

  const openJob = (job) => {
    setSelectedJob(job);
    setModal('job-details');
    setMenu(null);
  };

  const openMenu = (event, job) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();

    setMenu((previous) =>
      previous && previous.id === job.id
        ? null
        : {
            id: job.id,
            top: rect.bottom + 4,
            left: Math.max(8, rect.right - 132),
          }
    );
  };

  const handleChartRange = (event) => {
    const preset = PRESETS.find((item) => item.id === event.target.value);
    if (preset) setChartRange(preset);
  };

  const drillIntoType = (data) => {
    const name = data?.name ?? data?.payload?.name;
    if (name) setTypeDrill(name);
  };

  const drillIntoStorage = (data) => {
    const name = data?.name ?? data?.payload?.name;
    if (name) setStorageDrill(name);
  };

  const filterJobsByType = (name) => {
    setTypeFilter(name);
    setShowAllJobs(true);
    notify(`Showing ${name} backup jobs.`);
  };

  const menuJob = menu ? jobs.find((job) => job.id === menu.id) : null;

  const modalTitle = {
    schedule: selectedSchedule ? 'Edit Backup Schedule' : 'Create New Backup Schedule',
    'run-backup': 'Run Immediate Full Backup',
    'job-details': 'Backup Job Details',
    'schedule-details': 'Schedule Details',
  }[modal];

  const storageColor = (type) =>
    type === 'tenant' ? '#c5e1f8' : type === 'overall' ? '#f29b12' : '#1269df';

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div className="db-heading">
          <h1>Data Backup</h1>
          <p>
            Manage platform data backup configurations, job status, and storage
            utilization across all MEGSI tenants.
          </p>
        </div>

        <div className="db-header-actions">
          <DateRangePicker
            range={range}
            onChange={(next) => {
              setRange(next);
              setTypeDrill(null);
              setStorageDrill(null);
            }}
          />

          <div className="db-primary-actions">
            <button className="db-btn db-btn-primary" onClick={openCreateSchedule}>
              Create New Backup Schedule
            </button>

            <button className="db-btn db-btn-outline" onClick={() => setModal('run-backup')}>
              Run Immediate Full Backup
            </button>
          </div>
        </div>
      </div>

      <section className="db-kpi-grid">
        <button
          className={`db-kpi-card ${activeCard === 'total' ? 'active' : ''}`}
          onClick={() => setActiveCard('total')}
        >
          <div className="db-kpi-icon db-blue">
            <Files size={23} />
          </div>
          <div className="db-kpi-info">
            <span>Total Backups</span>
            <strong>{formatNumber(stats.total)}</strong>
          </div>
        </button>

        <button
          className={`db-kpi-card ${activeCard === 'success' ? 'active' : ''}`}
          onClick={() => setActiveCard('success')}
        >
          <div className="db-kpi-icon db-green">
            <CheckCircle2 size={23} />
          </div>
          <div className="db-kpi-info">
            <span>Successful Backups</span>
            <strong>{formatNumber(stats.successful)}</strong>
            <small className="db-growth">↑ {stats.rate.toFixed(1)}%</small>
            <small>Across all companies</small>
          </div>
        </button>

        <button
          className={`db-kpi-card ${activeCard === 'failed' ? 'active' : ''}`}
          onClick={() => setActiveCard('failed')}
        >
          <div className="db-kpi-icon db-red">
            <XCircle size={23} />
          </div>
          <div className="db-kpi-info">
            <span>Failed Jobs</span>
            <strong>{formatNumber(stats.failed)}</strong>
          </div>
        </button>

        <button
          className={`db-kpi-card ${activeCard === 'critical' ? 'active' : ''}`}
          onClick={() => setActiveCard('critical')}
        >
          <div className="db-kpi-icon db-orange">
            <AlertTriangle size={23} />
          </div>
          <div className="db-kpi-info">
            <span>Critical Errors</span>
            <strong>{formatNumber(stats.critical)}</strong>
          </div>
        </button>

        <button
          className={`db-kpi-card ${activeCard === 'next' ? 'active' : ''}`}
          onClick={() => setActiveCard('next')}
        >
          <div className="db-kpi-icon db-purple">
            <CalendarDays size={23} />
          </div>
          <div className="db-kpi-info">
            <span>Next Full Backup</span>
            <strong className="db-date-value">{formatDate(NEXT_FULL_BACKUP)}</strong>
          </div>
        </button>
      </section>

      <section className="db-overview-grid">
        <div className="db-panel db-activity-panel">
          <div className="db-panel-header">
            <div className="db-panel-title">
              <span className="db-title-icon">
                <BarChart3 size={17} />
              </span>
              <h2>Backup Activity Overview</h2>
            </div>

            <select
              className="db-compact-select"
              value={chartSelectValue}
              onChange={handleChartRange}
              aria-label="Backup activity period"
            >
              {chartSelectValue === 'selected' && <option value="selected">Selected Range</option>}
              {PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          <div className="db-chart-legend">
            <span>
              <i className="db-legend-blue" />
              Successful
            </span>
            <span>
              <i className="db-legend-red" />
              Failed
            </span>
          </div>

          <div className="db-activity-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activity} margin={{ top: 8, right: 7, left: -13, bottom: 0 }}>
                <defs>
                  <linearGradient id="dbSuccessfulGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1767d8" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#1767d8" stopOpacity={0.03} />
                  </linearGradient>

                  <linearGradient id="dbFailedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dc3434" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#dc3434" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#dfe8f1" strokeDasharray="0" vertical />

                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#5a6479' }}
                  axisLine={{ stroke: '#dce5ef' }}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={14}
                />

                <YAxis
                  domain={[0, 'auto']}
                  tick={{ fontSize: 10, fill: '#5a6479' }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip contentStyle={TOOLTIP_STYLE} />

                <Area
                  type="linear"
                  dataKey="successful"
                  name="Successful"
                  stroke="#1b6bd0"
                  strokeWidth={2}
                  fill="url(#dbSuccessfulGradient)"
                  dot={activity.length > 40 ? false : { r: 2.7, fill: '#1b6bd0', strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                />

                <Area
                  type="linear"
                  dataKey="failed"
                  name="Failed"
                  stroke="#d93636"
                  strokeWidth={1.8}
                  fill="url(#dbFailedGradient)"
                  dot={activity.length > 40 ? false : { r: 2.6, fill: '#d93636', strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="db-panel db-status-panel">
          <div className="db-panel-header">
            <div className="db-panel-title">
              <span className="db-title-icon">
                <ShieldCheck size={17} />
              </span>
              <h2>{typeDrillItem ? `${typeDrillItem.name} Backups` : 'Backup Status by Type'}</h2>
            </div>

            {typeDrillItem && (
              <button className="db-back-btn" onClick={() => setTypeDrill(null)}>
                <ArrowLeft size={13} />
                Back
              </button>
            )}
          </div>

          {!typeDrillItem && (
            <>
              <div className="db-donut-layout">
                <div className="db-donut-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="59%"
                        outerRadius="91%"
                        paddingAngle={1}
                        stroke="#fff"
                        strokeWidth={1.5}
                        onClick={drillIntoType}
                      >
                        {typeData.map((item) => (
                          <Cell key={item.name} fill={item.color} />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(value, name, entry) => [
                          `${value}% (${formatNumber(entry?.payload?.count ?? 0)} backups)`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="db-status-legend">
                  {typeData.map((item) => (
                    <button
                      type="button"
                      key={item.name}
                      className="db-legend-button"
                      onClick={() => setTypeDrill(item.name)}
                    >
                      <i style={{ background: item.color }} />
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <p className="db-drill-hint">Click a segment to drill down</p>
            </>
          )}

          {typeDrillItem && typeDrillData && (
            <div className="db-drill-view">
              <div className="db-drill-summary">
                <div>
                  <span>Backups</span>
                  <strong>{formatNumber(typeDrillItem.count)}</strong>
                </div>
                <div>
                  <span>Successful</span>
                  <strong>{formatNumber(typeDrillData.successful)}</strong>
                </div>
                <div>
                  <span>Failed</span>
                  <strong>{formatNumber(typeDrillData.failed)}</strong>
                </div>
                <div>
                  <span>Share</span>
                  <strong>{typeDrillItem.value}%</strong>
                </div>
              </div>

              <div className="db-drill-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={typeDrillData.sources}
                    layout="vertical"
                    margin={{ top: 4, right: 14, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid stroke="#e7edf4" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={104}
                      tick={{ fill: '#27354b', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#f1f6fd' }}
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value) => [formatNumber(value), 'Backups']}
                    />
                    <Bar
                      dataKey="count"
                      name="Backups"
                      fill={typeDrillItem.color}
                      radius={[0, 3, 3, 0]}
                      barSize={14}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <button
                className="db-btn db-btn-light db-drill-action"
                onClick={() => filterJobsByType(typeDrillItem.name)}
              >
                View {typeDrillItem.name} jobs in table
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="db-panel db-jobs-panel">
        <div className="db-panel-header db-jobs-header">
          <div className="db-panel-title">
            <span className="db-title-icon">
              <Database size={17} />
            </span>
            <h2>Recent Backup Jobs</h2>

            {typeFilter && (
              <span className="db-filter-chip">
                Type: {typeFilter}
                <button aria-label="Clear type filter" onClick={() => setTypeFilter(null)}>
                  <X size={12} />
                </button>
              </span>
            )}
          </div>

          <button
            className="db-btn db-btn-light"
            onClick={() => setShowAllJobs((previous) => !previous)}
          >
            {showAllJobs ? 'Show Less' : 'View All'}
          </button>
        </div>

        <div className="db-table-scroll">
          <table className="db-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Job ID</th>
                <th>Type</th>
                <th>Source</th>
                <th>Status</th>
                <th>Start Time</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {displayedJobs.map((job, index) => (
                <tr key={job.id}>
                  <td>{index + 1}</td>
                  <td className="db-job-id">{job.id}</td>
                  <td>{job.type}</td>
                  <td>{job.source}</td>
                  <td>
                    <span className={`db-job-status ${job.status.toLowerCase()}`}>
                      <i />
                      {job.status}
                    </span>
                  </td>
                  <td className="db-time-cell">{job.startTime}</td>
                  <td>{job.duration}</td>
                  <td>
                    <div className="db-row-actions">
                      <button
                        title="Edit / view job"
                        aria-label={`View ${job.id}`}
                        onClick={() => openJob(job)}
                      >
                        <Pencil size={14} />
                      </button>

                      {job.status === 'Failed' ? (
                        <button
                          title="Delete job"
                          aria-label={`Delete ${job.id}`}
                          onClick={() => deleteJob(job)}
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <button
                          title="More actions"
                          aria-label={`More actions for ${job.id}`}
                          onMouseDown={(event) => event.stopPropagation()}
                          onClick={(event) => openMenu(event, job)}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {displayedJobs.length === 0 && (
                <tr>
                  <td colSpan="8" className="db-empty-state">
                    <Files size={24} />
                    <span>No backup jobs found for this period.</span>
                    <button
                      onClick={() => {
                        setRange(DEFAULT_RANGE);
                        setTypeFilter(null);
                      }}
                    >
                      Reset filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="db-bottom-grid">
        <div className="db-panel db-storage-panel">
          <div className="db-panel-header db-storage-header">
            <div className="db-panel-title">
              <span className="db-title-icon">
                <Database size={17} />
              </span>
              <h2>
                {storageDrillItem
                  ? `Storage Utilization · ${storageDrillItem.name}`
                  : 'Storage Utilization'}
              </h2>
            </div>

            {storageDrillItem ? (
              <button className="db-back-btn" onClick={() => setStorageDrill(null)}>
                <ArrowLeft size={13} />
                Back
              </button>
            ) : (
              <div className="db-storage-legend">
                <span>
                  <i className="db-storage-blue" />
                  Storage Used
                </span>
                <span>
                  <i className="db-storage-lightblue" />
                  Company/Tenant
                </span>
                <span>
                  <i className="db-storage-orange" />
                  Overall Storage Used
                </span>
              </div>
            )}
          </div>

          {!storageDrillItem && (
            <>
              <div className="db-storage-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={storageData}
                    margin={{ top: 7, right: 8, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid stroke="#e1e9f1" vertical={false} />

                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9, fill: '#64748b' }}
                      axisLine={{ stroke: '#dce5ef' }}
                      tickLine={false}
                    />

                    <YAxis
                      domain={[0, 'auto']}
                      tick={{ fontSize: 9, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      formatter={(value, name, entry) => [
                        `${formatNumber(value)} GB`,
                        STORAGE_LABELS[entry?.payload?.type] || 'Storage',
                      ]}
                      contentStyle={{ borderRadius: 6, fontSize: 11 }}
                    />

                    <Bar
                      dataKey="value"
                      radius={[2, 2, 0, 0]}
                      maxBarSize={31}
                      onClick={drillIntoStorage}
                    >
                      {storageData.map((item) => (
                        <Cell key={item.name} fill={storageColor(item.type)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p className="db-drill-hint">Click a bar to drill down</p>
            </>
          )}

          {storageDrillItem && storageDrillData && (
            <div className="db-drill-view">
              <div className="db-drill-summary db-drill-summary-3">
                <div>
                  <span>Month</span>
                  <strong>{storageDrillItem.name}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>{formatNumber(storageDrillItem.value)} GB</strong>
                </div>
                <div>
                  <span>Category</span>
                  <strong>{STORAGE_LABELS[storageDrillItem.type]}</strong>
                </div>
              </div>

              <div className="db-drill-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={storageDrillData}
                    layout="vertical"
                    margin={{ top: 4, right: 14, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid stroke="#e7edf4" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={118}
                      tick={{ fill: '#27354b', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#f1f6fd' }}
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value) => [`${formatNumber(value)} GB`, 'Storage']}
                    />
                    <Bar
                      dataKey="value"
                      name="Storage"
                      fill={storageColor(storageDrillItem.type)}
                      radius={[0, 3, 3, 0]}
                      barSize={14}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className="db-panel db-schedules-panel">
          <div className="db-panel-header db-schedules-header">
            <div className="db-panel-title">
              <span className="db-title-icon">
                <CalendarDays size={17} />
              </span>
              <h2>Backup Schedules</h2>
            </div>

            <button
              className={`db-switch-control ${scheduleEnabled ? 'enabled' : ''}`}
              onClick={() => {
                setScheduleEnabled((previous) => !previous);
                notify(
                  scheduleEnabled
                    ? 'Automatic backup scheduling paused.'
                    : 'Automatic backup scheduling enabled.'
                );
              }}
              aria-pressed={scheduleEnabled}
            >
              <span>Enable/Disable</span>
              <i>
                <span />
              </i>
            </button>
          </div>

          <div className="db-schedule-table-scroll">
            <table className="db-schedule-table">
              <thead>
                <tr>
                  <th>Active Schedule</th>
                  <th>Retention Policy</th>
                </tr>
              </thead>

              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td>
                      <button
                        className="db-schedule-name"
                        onClick={() => {
                          setSelectedSchedule(schedule);
                          setModal('schedule-details');
                        }}
                      >
                        {schedule.name}
                      </button>
                    </td>

                    <td>
                      <div className="db-retention-cell">
                        <span>{schedule.retention}</span>

                        <button
                          className={`db-mini-switch ${
                            schedule.enabled && scheduleEnabled ? 'on' : ''
                          }`}
                          title={schedule.enabled ? 'Disable schedule' : 'Enable schedule'}
                          aria-label={`Toggle ${schedule.name}`}
                          onClick={() => toggleSchedule(schedule)}
                        >
                          <span />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {schedules.length === 0 && (
                  <tr>
                    <td colSpan="2" className="db-empty-schedules">
                      No schedules configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {panel && (
        <div className="db-side-backdrop" onClick={() => setActiveCard(null)}>
          <aside
            className="db-side-panel"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="db-side-title"
          >
            <div className="db-side-header">
              <h2 id="db-side-title">{panel.title}</h2>

              <button
                className="db-modal-close"
                onClick={() => setActiveCard(null)}
                aria-label="Close details panel"
              >
                <X size={18} />
              </button>
            </div>

            <div className="db-side-body">
              {panel.rows.map(([label, value]) => (
                <div className="db-side-row" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}

              <p className="db-side-note">
                Demonstration data only — not connected to a backend.
              </p>

              {panel.jobs && (
                <>
                  <h3 className="db-side-subtitle">
                    {panel.jobsTitle} ({panel.jobs.length})
                  </h3>

                  {panel.jobs.length === 0 ? (
                    <p className="db-side-empty">No matching jobs in the selected period.</p>
                  ) : (
                    <div className="db-side-jobs">
                      {panel.jobs.slice(0, 6).map((job) => (
                        <button
                          type="button"
                          className="db-side-job"
                          key={job.id}
                          onClick={() => {
                            setActiveCard(null);
                            openJob(job);
                          }}
                        >
                          <div>
                            <strong>{job.id}</strong>
                            <span>
                              {job.type} · {job.source} · {job.startTime}
                            </span>
                          </div>

                          <span className={`db-job-status ${job.status.toLowerCase()}`}>
                            <i />
                            {job.status}
                          </span>
                        </button>
                      ))}

                      {panel.jobs.length > 6 && (
                        <p className="db-side-more">Showing 6 of {panel.jobs.length} jobs</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </aside>
        </div>
      )}

      {menu && menuJob && (
        <div
          className="db-dropdown-menu"
          style={{ top: menu.top, left: menu.left }}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <button onClick={() => openJob(menuJob)}>
            <Files size={14} />
            Details
          </button>

          <button onClick={() => retryJob(menuJob)}>
            <RefreshCw size={14} />
            Retry job
          </button>

          <button className="db-danger-action" onClick={() => deleteJob(menuJob)}>
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}

      {modal && (
        <div
          className="db-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            className="db-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="db-modal-title"
          >
            <div className="db-modal-header">
              <div>
                <h2 id="db-modal-title">{modalTitle}</h2>
                <p>
                  {modal === 'schedule'
                    ? 'Configure automated backup settings for your platform.'
                    : 'Review backup information and available actions.'}
                </p>
              </div>

              <button className="db-modal-close" aria-label="Close dialog" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <div className="db-modal-body">
              {modal === 'schedule' && (
                <div className="db-form">
                  <label>
                    Schedule Name
                    <input
                      type="text"
                      value={form.name}
                      onChange={(event) => updateForm('name', event.target.value)}
                      placeholder="e.g. Daily Company Backup"
                      autoFocus
                    />
                  </label>

                  <div className="db-form-grid">
                    <label>
                      Backup Type
                      <select
                        value={form.type}
                        onChange={(event) => updateForm('type', event.target.value)}
                      >
                        <option>Full</option>
                        <option>Incremental</option>
                        <option>Differential</option>
                      </select>
                    </label>

                    <label>
                      Backup Source
                      <select
                        value={form.source}
                        onChange={(event) => updateForm('source', event.target.value)}
                      >
                        <option>Company Data</option>
                        <option>Audit Logs</option>
                        <option>User Data</option>
                        <option>All Platform Data</option>
                      </select>
                    </label>

                    <label>
                      Frequency
                      <select
                        value={form.frequency}
                        onChange={(event) => updateForm('frequency', event.target.value)}
                      >
                        <option>Hourly</option>
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </label>

                    <label>
                      Backup Time
                      <input
                        type="time"
                        value={form.time}
                        onChange={(event) => updateForm('time', event.target.value)}
                      />
                    </label>

                    <label>
                      Retention Policy
                      <select
                        value={form.retention}
                        onChange={(event) => updateForm('retention', event.target.value)}
                      >
                        <option>7 days</option>
                        <option>14 days</option>
                        <option>30 days</option>
                        <option>60 days</option>
                        <option>90 days</option>
                        <option>180 days</option>
                        {!['7 days', '14 days', '30 days', '60 days', '90 days', '180 days'].includes(
                          form.retention
                        ) && <option>{form.retention}</option>}
                      </select>
                    </label>
                  </div>

                  <label className="db-form-checkbox">
                    <input
                      type="checkbox"
                      checked={form.enabled}
                      onChange={(event) => updateForm('enabled', event.target.checked)}
                    />
                    Enable this backup schedule
                  </label>
                </div>
              )}

              {modal === 'run-backup' && (
                <div className="db-confirmation">
                  <div className="db-confirmation-icon">
                    <Database size={26} />
                  </div>

                  <h3>Start a full platform backup?</h3>

                  <p>
                    This will create a new full backup for Company Data. The new job
                    will appear in Recent Backup Jobs.
                  </p>

                  <div className="db-confirmation-info">
                    <span>Backup type</span>
                    <strong>Full Backup</strong>
                    <span>Data source</span>
                    <strong>Company Data</strong>
                    <span>Execution</span>
                    <strong>Immediate</strong>
                  </div>
                </div>
              )}

              {modal === 'job-details' && selectedJob && (
                <div className="db-details-list">
                  <div>
                    <span>Job ID</span>
                    <strong>{selectedJob.id}</strong>
                  </div>
                  <div>
                    <span>Backup Type</span>
                    <strong>{selectedJob.type}</strong>
                  </div>
                  <div>
                    <span>Source</span>
                    <strong>{selectedJob.source}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong
                      className={
                        selectedJob.status === 'Successful'
                          ? 'db-detail-success'
                          : selectedJob.status === 'Failed'
                            ? 'db-detail-failed'
                            : ''
                      }
                    >
                      {selectedJob.status}
                    </strong>
                  </div>
                  <div>
                    <span>Start Time</span>
                    <strong>{selectedJob.startTime}</strong>
                  </div>
                  <div>
                    <span>Duration</span>
                    <strong>{selectedJob.duration}</strong>
                  </div>
                </div>
              )}

              {modal === 'schedule-details' && selectedSchedule && (
                <div className="db-details-list">
                  <div>
                    <span>Schedule</span>
                    <strong>{selectedSchedule.name}</strong>
                  </div>
                  <div>
                    <span>Schedule ID</span>
                    <strong>{selectedSchedule.id}</strong>
                  </div>
                  <div>
                    <span>Backup Type</span>
                    <strong>{selectedSchedule.type}</strong>
                  </div>
                  <div>
                    <span>Source</span>
                    <strong>{selectedSchedule.source}</strong>
                  </div>
                  <div>
                    <span>Frequency</span>
                    <strong>{selectedSchedule.frequency}</strong>
                  </div>
                  <div>
                    <span>Backup Time</span>
                    <strong>{selectedSchedule.time}</strong>
                  </div>
                  <div>
                    <span>Retention Policy</span>
                    <strong>{selectedSchedule.retention}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{selectedSchedule.enabled ? 'Enabled' : 'Disabled'}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="db-modal-footer">
              <button className="db-btn db-btn-light" onClick={closeModal}>
                {modal === 'schedule' || modal === 'run-backup' ? 'Cancel' : 'Close'}
              </button>

              {modal === 'schedule' && (
                <button className="db-btn db-btn-primary" onClick={saveSchedule}>
                  <Check size={15} />
                  {selectedSchedule ? 'Save Changes' : 'Create Schedule'}
                </button>
              )}

              {modal === 'run-backup' && (
                <button className="db-btn db-btn-primary" onClick={runBackup}>
                  <Play size={14} />
                  Start Backup
                </button>
              )}

              {modal === 'schedule-details' && selectedSchedule && (
                <>
                  <button
                    className="db-btn db-btn-danger"
                    onClick={() => deleteSchedule(selectedSchedule)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>

                  <button
                    className="db-btn db-btn-primary"
                    onClick={() => openEditSchedule(selectedSchedule)}
                  >
                    <Pencil size={14} />
                    Edit Schedule
                  </button>
                </>
              )}

              {modal === 'job-details' && selectedJob && (
                <>
                  <button className="db-btn db-btn-danger" onClick={() => deleteJob(selectedJob)}>
                    <Trash2 size={14} />
                    Delete
                  </button>

                  <button className="db-btn db-btn-primary" onClick={() => retryJob(selectedJob)}>
                    <RefreshCw size={14} />
                    Retry Backup
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}