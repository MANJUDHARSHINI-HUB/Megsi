import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

import {
  EVENT_TYPES,
  STATUS_OPTIONS,
  DATE_RANGE_OPTIONS,
  PAGE_SIZE_OPTIONS,
  COMPANIES,
  USERS,
  buildAccessLogs,
  fetchAccessLogs,
} from '../data/AccessLog.js';

import './AccessLog.css';

/* ==========================================================================
   Small helpers
   ========================================================================== */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n) => String(n).padStart(2, '0');
const fmtDate = (d) => `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
const fmtTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const isoDay = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtNum = (n) => Number(n).toLocaleString('en-GB');
const initials = (name) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
const AVATAR_COLORS = ['#0866f5', '#0b8f63', '#6d3bd6', '#c26a00', '#0a7e96', '#d6336c', '#4a4fd1', '#3a7d44'];
const avatarColor = (seed) => {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

const PLATFORM_VALUE = '__platform__';
const EMPTY_FILTERS = { search: '', eventType: '', userId: '', companyId: '', status: '' };

/* ==========================================================================
   Icons (inline SVG – no extra dependency)
   ========================================================================== */

const ICONS = {
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4',
  calendar: 'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3',
  down: 'm6 9 6 6 6-6',
  left: 'm15 18-6-6 6-6',
  right: 'm9 18 6-6-6-6',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  x: 'M18 6 6 18 M6 6l12 12',
  copy: 'M9 9h11a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1z M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1',
  check: 'M20 6 9 17l-5-5',
  building: 'M6 22V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v18 M2 22h20 M10 7h1 M13 7h1 M10 11h1 M13 11h1 M10 15h1 M13 15h1',
  user: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3 12h18 M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z',
  monitor: 'M3 4h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z M8 21h8 M12 17v4',
  laptop: 'M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v11H4V5z M2 19h20l-1 2H3l-1-2z',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  checkCircle: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M8.5 12l2.5 2.5 4.5-5',
  alert: 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z M12 9v4 M12 17h.01',
  lock: 'M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z M8 11V7a4 4 0 0 1 8 0v4',
  login: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M10 17l5-5-5-5 M15 12H3',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  plus: 'M12 5v14 M5 12h14',
  edit: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
  trash: 'M3 6h18 M8 6V4h8v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6 M10 11v6 M14 11v6',
  key: 'M15.5 7.5 19 4 M21 2l-2 2 M11.4 11.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8z M11.4 11.6 15.5 7.5 M16 8l3 3 3-3-3-3',
  up: 'M12 19V5 M5 12l7-7 7 7',
  downArrow: 'M12 5v14 M19 12l-7 7-7-7',
  sort: 'm7 15 5 5 5-5 M7 9l5-5 5 5',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
  layers: 'm12 2 10 5-10 5L2 7z M2 17l10 5 10-5 M2 12l10 5 10-5',
  reset: 'M3 12a9 9 0 0 1 15.5-6.2L21 8 M21 3v5h-5 M21 12a9 9 0 0 1-15.5 6.2L3 16 M3 21v-5h5',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 16v-4 M12 8h.01',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h8',
  ban: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M5.6 5.6l12.8 12.8',
};

function Icon({ name, size = 18, strokeWidth = 2, className = '' }) {
  return (
    <svg
      className={`al-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

const EVENT_ICON = {
  Login: 'login',
  Logout: 'logout',
  Access: 'layers',
  Create: 'plus',
  Update: 'edit',
  Delete: 'trash',
  View: 'eye',
  Export: 'download',
  'Permission Change': 'key',
};

/* ==========================================================================
   Date ranges
   ========================================================================== */

function getRange(key, custom) {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const daysAgo = (n) => {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - n);
    return d;
  };

  let start;
  let end;
  switch (key) {
    case 'today':
      start = todayStart; end = now; break;
    case 'yesterday':
      start = daysAgo(1); end = new Date(todayStart.getTime() - 1); break;
    case '7d':
      start = daysAgo(6); end = now; break;
    case '90d':
      start = daysAgo(89); end = now; break;
    case 'custom': {
      let from = new Date(`${custom.from}T00:00:00`);
      let to = new Date(`${custom.to}T23:59:59.999`);
      if (Number.isNaN(+from)) from = daysAgo(6);
      if (Number.isNaN(+to)) to = now;
      if (from > to) [from, to] = [new Date(`${custom.to}T00:00:00`), new Date(`${custom.from}T23:59:59.999`)];
      start = from; end = to; break;
    }
    case '30d':
    default:
      start = daysAgo(29); end = now;
  }

  // Previous equivalent period (same length, immediately before).
  let prevStart;
  let prevEnd;
  if (key === 'today') {
    prevStart = daysAgo(1);
    prevEnd = new Date(now.getTime() - 86400000);
  } else {
    prevEnd = new Date(start.getTime() - 1);
    prevStart = new Date(prevEnd.getTime() - (end.getTime() - start.getTime()));
  }

  return { start: start.getTime(), end: end.getTime(), prevStart: prevStart.getTime(), prevEnd: prevEnd.getTime() };
}

function rangeLabel(key, custom) {
  if (key !== 'custom') return DATE_RANGE_OPTIONS.find((o) => o.key === key).label;
  const f = new Date(`${custom.from}T00:00:00`);
  const t = new Date(`${custom.to}T00:00:00`);
  if (Number.isNaN(+f) || Number.isNaN(+t)) return 'Custom Date Range';
  return `${fmtDate(f)} – ${fmtDate(t)}`;
}

/* ==========================================================================
   Filtering, stats, sorting
   ========================================================================== */

function matchesFilters(l, f) {
  if (f.eventType && l.eventType !== f.eventType) return false;
  if (f.status && l.status !== f.status) return false;
  if (f.userId && l.userId !== f.userId) return false;
  if (f.companyId) {
    if (f.companyId === PLATFORM_VALUE) {
      if (l.companyId) return false;
    } else if (l.companyId !== f.companyId) return false;
  }
  const q = f.search.trim().toLowerCase();
  if (q) {
    const hay = `${l.userName} ${l.userId} ${l.companyName || 'platform level'} ${l.ip} ${l.id}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function countStats(arr) {
  let success = 0;
  let failed = 0;
  let denied = 0;
  arr.forEach((l) => {
    if (l.status === 'Success') success += 1;
    else if (l.status === 'Failed') failed += 1;
    else if (l.status === 'Denied') denied += 1;
  });
  return { total: arr.length, success, failed, denied };
}

const BUCKETS = 14;
function buildSeries(arr, start, end) {
  const span = Math.max(end - start, 1);
  const series = { total: Array(BUCKETS).fill(0), success: Array(BUCKETS).fill(0), failed: Array(BUCKETS).fill(0), denied: Array(BUCKETS).fill(0) };
  arr.forEach((l) => {
    const i = Math.min(BUCKETS - 1, Math.max(0, Math.floor(((l.ts - start) / span) * BUCKETS)));
    series.total[i] += 1;
    series[l.status.toLowerCase()][i] += 1;
  });
  return series;
}

function delta(cur, prev, { invert = false, neutral = false } = {}) {
  if (prev === 0) {
    return cur === 0
      ? { text: '0%', dir: 'flat', tone: 'neutral' }
      : { text: 'New', dir: 'up', tone: 'neutral' };
  }
  const pct = ((cur - prev) / prev) * 100;
  const dir = pct > 0.05 ? 'up' : pct < -0.05 ? 'down' : 'flat';
  const good = invert ? pct <= 0 : pct >= 0;
  let tone = dir === 'flat' ? 'neutral' : good ? 'good' : 'bad';
  if (neutral && dir !== 'flat') tone = 'info';
  return { text: `${Math.abs(pct).toFixed(1)}%`, dir, tone };
}

const pctOf = (part, whole) => (whole ? `${((part / whole) * 100).toFixed(1)}%` : '0%');

function sortLogs(arr, key, dir) {
  const m = dir === 'asc' ? 1 : -1;
  const out = [...arr];
  out.sort((a, b) => {
    let c = 0;
    if (key === 'date') c = a.ts - b.ts;
    else if (key === 'user') c = a.userName.localeCompare(b.userName);
    else if (key === 'event') c = a.eventType.localeCompare(b.eventType);
    else if (key === 'status') c = a.status.localeCompare(b.status);
    return c !== 0 ? c * m : b.ts - a.ts;
  });
  return out;
}

function pageList(cur, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, cur, cur - 1, cur + 1]);
  if (cur <= 3) [2, 3, 4].forEach((x) => set.add(x));
  if (cur >= total - 2) [total - 1, total - 2, total - 3].forEach((x) => set.add(x));
  const nums = [...set].filter((x) => x >= 1 && x <= total).sort((a, b) => a - b);
  const out = [];
  nums.forEach((x, i) => {
    if (i && x - nums[i - 1] > 1) out.push(`gap-${i}`);
    out.push(x);
  });
  return out;
}

/* ==========================================================================
   CSV export
   ========================================================================== */

const CSV_HEADERS = [
  'Event ID', 'Date and Time', 'User Name', 'User ID', 'Role',
  'Company', 'Event Type', 'Activity Description', 'IP Address', 'Status',
];

function csvCell(value) {
  let s = String(value ?? '');
  // Neutralise spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

function buildCsv(rows) {
  const lines = rows.map((l) => {
    const d = new Date(l.ts);
    return [
      l.id,
      `${isoDay(d)} ${fmtTime(d)}`,
      l.userName,
      l.userId,
      l.userRole,
      l.companyName || 'Platform Level',
      l.eventType,
      l.description,
      l.ip,
      l.status,
    ].map(csvCell).join(',');
  });
  return `\uFEFF${[CSV_HEADERS.join(','), ...lines].join('\r\n')}`;
}

function downloadCsv(rows) {
  const blob = new Blob([buildCsv(rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MEGSI_Access_Logs_${isoDay(new Date())}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ==========================================================================
   Hooks
   ========================================================================== */

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setValue(target);
      from.current = target;
      return undefined;
    }
    const startVal = from.current;
    const t0 = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - (1 - p) ** 3;
      const v = Math.round(startVal + (target - startVal) * eased);
      setValue(v);
      from.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function useOutsideClose(ref, open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, open, onClose]);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (err) {
      return false;
    }
  }
}

/* ==========================================================================
   Presentational pieces
   ========================================================================== */

function Sparkline({ data, color }) {
  const w = 160;
  const h = 52;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 6 - (v / max) * (h - 16)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  const id = `g-${color.replace('#', '')}`;
  return (
    <svg className="al-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const TONE_COLOR = { blue: '#0866f5', green: '#0b8f63', red: '#d92d3a', amber: '#c26a00' };

function KpiCard({ tone, icon, label, value, chip, caption, series, loading }) {
  const shown = useCountUp(loading ? 0 : value);
  return (
    <div className={`al-kpi al-kpi--${tone}`}>
      <div className="al-kpi-top">
        <span className="al-kpi-icon"><Icon name={icon} size={20} /></span>
        <h3 className="al-kpi-label">{label}</h3>
      </div>
      {loading ? (
        <div style={{ marginTop: 18 }}>
          <span className="al-skel" style={{ width: 110, height: 30 }} />
          <span className="al-skel" style={{ width: 150, marginTop: 12 }} />
        </div>
      ) : (
        <>
          <div className="al-kpi-main">
            <span className="al-kpi-value">{fmtNum(shown)}</span>
            {chip && (
              <span className={`al-chip al-chip--${chip.tone}`} title="Compared with the previous equivalent period">
                {chip.dir === 'up' && <Icon name="up" size={12} strokeWidth={2.6} />}
                {chip.dir === 'down' && <Icon name="downArrow" size={12} strokeWidth={2.6} />}
                {chip.text}
              </span>
            )}
          </div>
          <p className="al-kpi-caption">{caption}</p>
          <Sparkline data={series} color={TONE_COLOR[tone]} />
        </>
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <label className="al-field">
      <span>{label}</span>
      <div className="al-control">
        <select value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>
        <Icon name="down" size={16} className="al-select-chev" />
      </div>
    </label>
  );
}

const EventBadge = ({ type }) => (
  <span className={`al-badge al-badge--${type.replace(/\s+/g, '-')}`}>
    <Icon name={EVENT_ICON[type] || 'activity'} size={14} />
    {type}
  </span>
);

const StatusBadge = ({ status }) => (
  <span className={`al-badge al-status al-status--${status}`}>{status}</span>
);

function CompanyCell({ log }) {
  if (!log.companyId) {
    return (
      <div className="al-company al-company--platform">
        <Icon name="shield" size={17} />
        <span>Platform Level</span>
      </div>
    );
  }
  return (
    <div className="al-company" title={log.companyName}>
      <Icon name="building" size={17} />
      <span>{log.companyName}</span>
    </div>
  );
}

function SkeletonRows({ count }) {
  return (
    <tbody>
      {Array.from({ length: count }, (_, i) => (
        <tr key={i}>
          <td><span className="al-skel" style={{ width: 96 }} /><span className="al-skel" style={{ width: 60, marginTop: 8 }} /></td>
          <td>
            <div className="al-user">
              <span className="al-skel al-skel--circle" />
              <div style={{ flex: 1 }}>
                <span className="al-skel" style={{ width: '70%' }} />
                <span className="al-skel" style={{ width: '40%', marginTop: 8 }} />
              </div>
            </div>
          </td>
          <td><span className="al-skel" style={{ width: 90 }} /></td>
          <td><span className="al-skel" style={{ width: '80%' }} /></td>
          <td><span className="al-skel" style={{ width: 86, height: 24 }} /></td>
          <td><span className="al-skel" style={{ width: '85%' }} /></td>
          <td><span className="al-skel" style={{ width: 100, height: 24 }} /></td>
          <td><span className="al-skel" style={{ width: 80, height: 24 }} /></td>
          <td><span className="al-skel" style={{ width: 58, height: 30, marginLeft: 'auto' }} /></td>
        </tr>
      ))}
    </tbody>
  );
}

/* ---------------------------------------------------------------- Date menu */

function DateRangeMenu({ rangeKey, custom, onSelect, onCustom }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useOutsideClose(ref, open, close);
  const today = isoDay(new Date());

  return (
    <div className="al-date" ref={ref}>
      <button
        type="button"
        className="al-date-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="calendar" size={18} />
        {rangeLabel(rangeKey, custom)}
        <Icon name="down" size={16} className="al-chev" />
      </button>
      {open && (
        <div className="al-menu" role="menu">
          {DATE_RANGE_OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              role="menuitem"
              className={`al-menu-item ${rangeKey === o.key ? 'is-active' : ''}`}
              onClick={() => {
                onSelect(o.key);
                if (o.key !== 'custom') setOpen(false);
              }}
            >
              {o.label}
              {rangeKey === o.key && <Icon name="check" size={16} />}
            </button>
          ))}
          {rangeKey === 'custom' && (
            <div className="al-custom">
              <label>
                From
                <input type="date" value={custom.from} max={custom.to || today} onChange={(e) => onCustom({ ...custom, from: e.target.value })} />
              </label>
              <label>
                To
                <input type="date" value={custom.to} min={custom.from} max={today} onChange={(e) => onCustom({ ...custom, to: e.target.value })} />
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- Export menu */

function ExportMenu({ counts, onExport }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useOutsideClose(ref, open, close);

  const items = [
    { key: 'matching', title: 'All matching records', sub: `Current filters and date range · ${fmtNum(counts.matching)} rows` },
    { key: 'range', title: 'Records in selected date range', sub: `Ignores other filters · ${fmtNum(counts.range)} rows` },
    { key: 'all', title: 'Entire log history', sub: `Every record loaded · ${fmtNum(counts.all)} rows` },
  ];

  return (
    <div className="al-export" ref={ref}>
      <button type="button" className="al-btn al-btn--primary" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="download" size={17} />
        Export Logs
      </button>
      {open && (
        <div className="al-menu" role="menu">
          {items.map((it) => (
            <button
              key={it.key}
              type="button"
              role="menuitem"
              className="al-menu-item"
              disabled={counts[it.key] === 0}
              onClick={() => { setOpen(false); onExport(it.key); }}
            >
              <span>
                <strong>{it.title}</strong>
                <small>{it.sub} · CSV</small>
              </span>
              <Icon name="file" size={16} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Drawer */

function DrawerRow({ label, value, onCopy, copyLabel, children }) {
  if (!value && !children) return null;
  return (
    <div className="al-row">
      <dt>{label}</dt>
      <dd>
        <span>{children || value}</span>
        {onCopy && (
          <button type="button" className="al-copy" onClick={() => onCopy(value, copyLabel)} aria-label={`Copy ${copyLabel}`}>
            <Icon name="copy" size={13} />
            Copy
          </button>
        )}
      </dd>
    </div>
  );
}

function Section({ icon, title, children, visual }) {
  const sectionTone = title.toLowerCase().startsWith('event') ? 'event'
    : title.toLowerCase().startsWith('user') ? 'user'
    : title.toLowerCase().startsWith('company') ? 'company'
    : title.toLowerCase().startsWith('access') ? 'access'
    : 'additional';

  return (
    <section className={`al-sec al-sec--${sectionTone}`}>
      <h3>
        <span className="al-sec-icon"><Icon name={icon} size={16} /></span>
        {title}
      </h3>
      <div className={`al-sec-body al-sec-body--${sectionTone}`}>
        {sectionTone !== 'additional' && (
          <div className={`al-detail-illustration al-detail-illustration--${sectionTone}`} aria-hidden="true">
            {sectionTone === 'user' ? (
              <>
                <span className="al-detail-avatar">{visual || 'U'}</span>
                <span className="al-detail-illustration-caption">USER</span>
              </>
            ) : (
              <Icon name={sectionTone === 'event' ? 'calendar' : sectionTone === 'company' ? 'building' : 'laptop'} size={sectionTone === 'access' ? 66 : 70} strokeWidth={1.7} />
            )}
          </div>
        )}
        <dl style={{ margin: 0 }}>{children}</dl>
      </div>
    </section>
  );
}

function EventDetailsPage({ log, onBack, onCopy }) {
  const d = new Date(log.ts);

  return (
    <main className="al-details-page">
      <div className="al-details-topbar">
        <div className="al-breadcrumb">
          <button type="button" className="al-back-btn" onClick={onBack}>
            <Icon name="left" size={17} />
            Back to Access Logs
          </button>
          <span className="al-breadcrumb-divider">/</span>
          <span>Event Details</span>
        </div>
        <span className="al-details-id">EVENT ID: {log.id}</span>
      </div>

      <section className="al-details-hero">
        <div className="al-details-hero-main">
          <div className="al-details-hero-icon"><Icon name="activity" size={25} /></div>
          <div className="al-details-heading">
            <span className="al-details-eyebrow">ACCESS ACTIVITY RECORD</span>
            <h1>Event Details</h1>
            <p>{log.description}</p>
          </div>
        </div>
        <div className="al-details-hero-badges">
          <EventBadge type={log.eventType} />
          <StatusBadge status={log.status} />
        </div>
      </section>

      <section className="al-details-summary" aria-label="Event summary">
        <div className="al-summary-item">
          <span className="al-summary-label"><Icon name="calendar" size={15} /> Date</span>
          <strong>{fmtDate(d)}</strong>
        </div>
        <div className="al-summary-item">
          <span className="al-summary-label"><Icon name="clock" size={15} /> Time</span>
          <strong>{fmtTime(d)} (local)</strong>
        </div>
        <div className="al-summary-item">
          <span className="al-summary-label"><Icon name="user" size={15} /> User</span>
          <strong>{log.userName}</strong>
        </div>
        <div className="al-summary-item">
          <span className="al-summary-label"><Icon name="building" size={15} /> Company</span>
          <strong>{log.companyName || 'Platform Level'}</strong>
        </div>
      </section>

      <div className="al-details-grid">
        <Section icon="activity" title="Event information">
          <DrawerRow label="Event ID" value={log.id} onCopy={onCopy} copyLabel="Event ID" />
          <DrawerRow label="Event type"><EventBadge type={log.eventType} /></DrawerRow>
          <DrawerRow label="Description" value={log.description} />
          <DrawerRow label="Date" value={fmtDate(d)} />
          <DrawerRow label="Timestamp" value={`${fmtTime(d)} (local) · ${log.timestamp}`} />
          <DrawerRow label="Result"><StatusBadge status={log.status} /></DrawerRow>
        </Section>

        <Section icon="user" title="User information" visual={initials(log.userName)}>
          <DrawerRow label="Name" value={log.userName} />
          <DrawerRow label="User ID" value={log.userId} />
          <DrawerRow label="Role" value={log.userRole} />
          <DrawerRow label="Email" value={log.userEmail} />
          <DrawerRow label="Account status" value={log.accountStatus} />
        </Section>

        <Section icon="building" title="Company information">
          {log.companyId ? (
            <>
              <DrawerRow label="Company" value={log.companyName} />
              <DrawerRow label="Company ID" value={log.companyId} />
              <DrawerRow label="Tenant" value={`${log.tenantRef} · ${log.tenantPlan} plan`} />
            </>
          ) : (
            <>
              <DrawerRow label="Company" value="Platform Level" />
              <DrawerRow label="Scope" value="This activity is not linked to a specific tenant." />
            </>
          )}
        </Section>

        <Section icon="globe" title="Access information">
          <DrawerRow label="IP address" value={log.ip} onCopy={onCopy} copyLabel="IP address" />
          <DrawerRow label="Location" value={log.location || 'Not Available'} />
          <DrawerRow label="Browser" value={log.browser} />
          <DrawerRow label="Operating system" value={log.os} />
          <DrawerRow label="Device type" value={log.device} />
          <DrawerRow label="Module" value={log.module} />
          <DrawerRow label="Resource" value={log.resource} />
        </Section>

        <Section icon="info" title="Additional information">
          <DrawerRow label="Request ID" value={log.requestId} onCopy={onCopy} copyLabel="Request ID" />
          {log.status === 'Failed' && (
            <DrawerRow label="Failure reason">
              <div className="al-note al-note--Failed" style={{ margin: 0 }}>{log.failureReason || 'Not Available'}</div>
            </DrawerRow>
          )}
          {log.status === 'Denied' && (
            <DrawerRow label="Access denied">
              <div className="al-note al-note--Denied" style={{ margin: 0 }}>{log.denialReason || 'Not Available'}</div>
            </DrawerRow>
          )}
          {log.status === 'Success' && (
            <DrawerRow label="Outcome">
              <div className="al-note al-note--info" style={{ margin: 0 }}>Completed without errors. No credentials or tokens are stored in access logs.</div>
            </DrawerRow>
          )}
        </Section>
      </div>
    </main>
  );
}

/* ==========================================================================
   Page
   ========================================================================== */

export default function AccessLogs() {
  const [logs, setLogs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rangeKey, setRangeKey] = useState('30d');
  const [custom, setCustom] = useState(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 6);
    return { from: isoDay(from), to: isoDay(to) };
  });
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [drawerLog, setDrawerLog] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const loadTimer = useRef(null);
  const drawerTimer = useRef(null);
  const toastTimer = useRef(null);

  /* ---- data load (swap fetchAccessLogs for a real API call) ---- */
  useEffect(() => {
    let alive = true;
    fetchAccessLogs().then((res) => {
      if (!alive) return;
      setLogs(res.logs.map((l) => ({ ...l, ts: new Date(l.timestamp).getTime() })));
      setCompanies(res.companies);
      setUsers([...res.users].sort((a, b) => a.name.localeCompare(b.name)));
      setLoading(false);
    });
    return () => {
      alive = false;
      clearTimeout(loadTimer.current);
      clearTimeout(drawerTimer.current);
      clearTimeout(toastTimer.current);
    };
  }, []);

  const flashLoading = () => {
    setLoading(true);
    clearTimeout(loadTimer.current);
    loadTimer.current = setTimeout(() => setLoading(false), 350);
  };

  const showToast = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  /* ---- derived data ---- */
  const range = useMemo(() => getRange(rangeKey, custom), [rangeKey, custom]);

  const inRange = useMemo(
    () => logs.filter((l) => l.ts >= range.start && l.ts <= range.end),
    [logs, range],
  );
  const filtered = useMemo(() => inRange.filter((l) => matchesFilters(l, filters)), [inRange, filters]);
  const previous = useMemo(
    () => logs.filter((l) => l.ts >= range.prevStart && l.ts <= range.prevEnd && matchesFilters(l, filters)),
    [logs, range, filters],
  );

  const stats = useMemo(() => countStats(filtered), [filtered]);
  const prevStats = useMemo(() => countStats(previous), [previous]);
  const series = useMemo(() => buildSeries(filtered, range.start, range.end), [filtered, range]);

  const sorted = useMemo(() => sortLogs(filtered, sort.key, sort.dir), [filtered, sort]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pageRows = sorted.slice(startIdx, startIdx + pageSize);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  /* ---- handlers ---- */
  const setFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const changeRange = (key) => {
    if (key === rangeKey) return;
    setRangeKey(key);
    setPage(1);
    flashLoading();
  };

  const changeCustom = (next) => {
    setCustom(next);
    setPage(1);
  };

  const toggleSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'date' ? 'desc' : 'asc' }));
    setPage(1);
  };

  const openDrawer = (log) => {
    setDrawerLog(log);
    setDrawerOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setDrawerLog(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCopy = useCallback(async (value, label) => {
    const ok = await copyText(value);
    showToast(ok ? `${label} copied` : `Could not copy ${label}`);
  }, [showToast]);

  const exportCounts = { matching: filtered.length, range: inRange.length, all: logs.length };

  const handleExport = (scope) => {
    let rows;
    if (scope === 'matching') rows = sorted;
    else if (scope === 'range') rows = sortLogs(inRange, 'date', 'desc');
    else rows = sortLogs(logs, 'date', 'desc');
    if (!rows.length) return;
    downloadCsv(rows);
    showToast(`Exported ${fmtNum(rows.length)} records to CSV`);
  };

  /* ---- sortable header cell ---- */
  const renderTh = (id, label) => {
    const active = sort.key === id;
    return (
      <th aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
        <button type="button" className={`al-th-btn ${active ? 'is-sorted' : ''}`} onClick={() => toggleSort(id)}>
          {label}
          <Icon name={active ? (sort.dir === 'asc' ? 'up' : 'downArrow') : 'sort'} size={14} />
        </button>
      </th>
    );
  };

  /* ==========================================================================
     Render
     ========================================================================== */
  if (drawerLog) {
    return (
      <div className="al-page">
        <EventDetailsPage log={drawerLog} onBack={closeDrawer} onCopy={handleCopy} />
        {toast && createPortal(
          <div className="al-toast" role="status">
            <Icon name="checkCircle" size={16} />
            {toast}
          </div>,
          document.body,
        )}
      </div>
    );
  }

  return (
    <div className="al-page">
      {/* ------------------------------------------------ Header */}
      <div className="al-header">
        <div className="al-title-wrap">
          <div className="al-title-icon"><Icon name="shield" size={30} strokeWidth={1.8} /></div>
          <div>
            <h1 className="al-title">Access Logs</h1>
            <p className="al-subtitle">Monitor platform activities and track important access events across all companies.</p>
          </div>
        </div>
        <DateRangeMenu rangeKey={rangeKey} custom={custom} onSelect={changeRange} onCustom={changeCustom} />
      </div>

      {/* ------------------------------------------------ KPI cards */}
      <div className="al-kpis">
        <KpiCard
          tone="blue"
          icon="activity"
          label="Total Activities"
          value={stats.total}
          chip={delta(stats.total, prevStats.total, { neutral: true })}
          caption={`${fmtNum(prevStats.total)} in previous period`}
          series={series.total}
          loading={loading}
        />
        <KpiCard
          tone="green"
          icon="checkCircle"
          label="Successful Access"
          value={stats.success}
          chip={delta(stats.success, prevStats.success)}
          caption={`${pctOf(stats.success, stats.total)} success rate`}
          series={series.success}
          loading={loading}
        />
        <KpiCard
          tone="red"
          icon="alert"
          label="Failed Attempts"
          value={stats.failed}
          chip={delta(stats.failed, prevStats.failed, { invert: true })}
          caption={`${pctOf(stats.failed, stats.total)} of all activities`}
          series={series.failed}
          loading={loading}
        />
        <KpiCard
          tone="amber"
          icon="ban"
          label="Access Denied"
          value={stats.denied}
          chip={delta(stats.denied, prevStats.denied, { invert: true })}
          caption={`${pctOf(stats.denied, stats.total)} of all activities`}
          series={series.denied}
          loading={loading}
        />
      </div>

      {/* ------------------------------------------------ Filters */}
      <div className="al-card al-filters">
        <label className="al-field al-field--search">
          <span>Search</span>
          <div className="al-control">
            <Icon name="search" size={17} />
            <input
              type="search"
              value={filters.search}
              placeholder="User, user ID, company, IP or event ID"
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </div>
        </label>

        <SelectField label="Event Type" value={filters.eventType} onChange={(v) => setFilter('eventType', v)}>
          <option value="">All Events</option>
          {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </SelectField>

        <SelectField label="User" value={filters.userId} onChange={(v) => setFilter('userId', v)}>
          <option value="">All Users</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </SelectField>

        <SelectField label="Company" value={filters.companyId} onChange={(v) => setFilter('companyId', v)}>
          <option value="">All Companies</option>
          <option value={PLATFORM_VALUE}>Platform Level</option>
          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </SelectField>

        <SelectField label="Result Status" value={filters.status} onChange={(v) => setFilter('status', v)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </SelectField>

        <div className="al-filter-actions">
          <button type="button" className="al-btn" onClick={clearFilters} disabled={!hasActiveFilters}>
            <Icon name="reset" size={16} />
            Clear Filters
          </button>
          <ExportMenu counts={exportCounts} onExport={handleExport} />
        </div>
      </div>

      {/* ------------------------------------------------ Table */}
      <div className="al-card al-table-card">
        <div className="al-table-head">
          <h2 className="al-h2">Access Activity</h2>
          <span className="al-table-hint">
            {rangeLabel(rangeKey, custom)} · sorted by {({ date: 'date', user: 'user', event: 'event type', status: 'status' })[sort.key]}
          </span>
        </div>

        <div className="al-table-wrap">
          <table className="al-table">
            <colgroup>
              <col style={{ width: 130 }} />
              <col style={{ width: 200 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 210 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 250 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 120 }} />
            </colgroup>
            <thead>
              <tr>
                {renderTh('date', 'Date & Time')}
                {renderTh('user', 'User')}
                <th>Role</th>
                <th>Company</th>
                {renderTh('event', 'Event Type')}
                <th>Activity Description</th>
                <th>IP Address</th>
                {renderTh('status', 'Status')}
                <th>Action</th>
              </tr>
            </thead>

            {loading ? (
              <SkeletonRows count={Math.min(pageSize, 8)} />
            ) : (
              <tbody key={`${safePage}-${pageSize}-${sort.key}-${sort.dir}`}>
                {pageRows.map((l) => {
                  const d = new Date(l.ts);
                  return (
                    <tr key={l.id}>
                      <td>
                        <span className="al-cell-strong">{fmtDate(d)}</span>
                        <span className="al-cell-sub">{fmtTime(d)}</span>
                      </td>
                      <td>
                        <div className="al-user">
                          <span className="al-avatar" style={{ background: avatarColor(l.userId) }}>{initials(l.userName)}</span>
                          <div>
                            <span className="al-cell-strong" title={l.userName}>{l.userName}</span>
                            <span className="al-cell-sub">{l.userId}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="al-role" title={l.userRole}>{l.userRole}</span></td>
                      <td><CompanyCell log={l} /></td>
                      <td><EventBadge type={l.eventType} /></td>
                      <td><span className="al-desc" title={l.description}>{l.description}</span></td>
                      <td><span className="al-ip">{l.ip}</span></td>
                      <td><StatusBadge status={l.status} /></td>
                      <td>
                        <button type="button" className="al-view-btn" onClick={() => openDrawer(l)} aria-label={`View details for event ${l.id}`}>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>

          {!loading && sorted.length === 0 && (
            <div className="al-empty">
              <div className="al-empty-icon"><Icon name="search" size={28} /></div>
              <h3>No access logs match these filters</h3>
              <p>Try a different date range or remove some filters to see more activity.</p>
              {hasActiveFilters && (
                <button type="button" className="al-btn" onClick={clearFilters}>
                  <Icon name="reset" size={16} />
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* ------------------------------------------------ Pagination */}
        <div className="al-pager">
          <div className="al-pager-info">
            {loading ? 'Loading records…' : sorted.length === 0 ? (
              'Showing 0 of 0 records'
            ) : (
              <>
                Showing <strong>{fmtNum(startIdx + 1)}–{fmtNum(Math.min(startIdx + pageSize, sorted.length))}</strong> of{' '}
                <strong>{fmtNum(sorted.length)}</strong> matching records
              </>
            )}
          </div>

          <div className="al-pager-right">
            <label className="al-pagesize">
              Rows per page
              <div className="al-control">
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  aria-label="Rows per page"
                >
                  {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <Icon name="down" size={14} className="al-select-chev" />
              </div>
            </label>

            <nav className="al-pages" aria-label="Pagination">
              <button type="button" className="al-page-btn al-page-btn--arrow" disabled={safePage === 1 || loading} onClick={() => setPage(safePage - 1)} aria-label="Previous page">
                <Icon name="left" size={16} />
              </button>
              {pageList(safePage, totalPages).map((p) => (typeof p === 'string' ? (
                <span key={p} className="al-gap">…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={`al-page-btn ${p === safePage ? 'is-current' : ''}`}
                  aria-current={p === safePage ? 'page' : undefined}
                  disabled={loading}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              )))}
              <button type="button" className="al-page-btn al-page-btn--arrow" disabled={safePage === totalPages || loading} onClick={() => setPage(safePage + 1)} aria-label="Next page">
                <Icon name="right" size={16} />
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ Toast */}

      {toast && createPortal(
        <div className="al-toast" role="status">
          <Icon name="checkCircle" size={16} />
          {toast}
        </div>,
        document.body,
      )}
    </div>
  );
}