// Access Logs - page-specific mock data, analytics helpers and translations.
// Frontend-only demonstration data: generated deterministically (seeded) when this module loads,
// so every reload shows the same records. Nothing here is connected to a backend.
import { addDays, daysBetween, monthEnd, shiftMonths, toDate } from './selectors.js';

/* ------------------------------------------------------------------ */
/* Data extent                                                         */
/* ------------------------------------------------------------------ */
export const DATA_FIRST = '2025-11-01';
export const DATA_LAST = '2026-10-20'; // last day that has recorded mock events

export const METHODS = ['web', 'mobile', 'api', 'direct', 'other'];
export const RESULTS = ['success', 'failed', 'denied'];
export const ROLES = ['super', 'admin', 'manager', 'supervisor', 'analyst', 'support', 'guard', 'auditor'];
export const FAIL_REASONS = ['badPassword', 'locked', 'badToken'];
export const DENY_REASONS = ['denied', 'ipBlocked'];

const COMPANY_CITIES = {
  'SafeZone Services': ['London', 'Chennai', 'Delhi'],
  'Metro Security Group': ['Chennai', 'Delhi', 'Pune'],
  'Guardian Force Ltd': ['Bangalore', 'Manchester'],
  'Elite Security Solutions': ['Chennai', 'Mumbai'],
  'SwiftGuard Services': ['Mumbai', 'Bangalore'],
  'SecureGuard UK Ltd': ['Leeds', 'London', 'Manchester'],
  'Shield Security Group': ['London', 'Manchester'],
  'City Watch Ltd': ['London', 'Leeds'],
};
export const COMPANY_NAMES = Object.keys(COMPANY_CITIES);

/* ------------------------------------------------------------------ */
/* Seeded random helpers                                               */
/* ------------------------------------------------------------------ */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261020);
const rint = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const wpick = (items, weights) => {
  const total = weights.reduce((a, b) => a + b, 0);
  let x = rand() * total;
  for (let i = 0; i < items.length; i++) { x -= weights[i]; if (x < 0) return items[i]; }
  return items[items.length - 1];
};
const pad = (n) => String(n).padStart(2, '0');
const randomIp = () => `${pick([14, 27, 45, 49, 59, 82, 103, 117, 122, 157])}.${rint(1, 254)}.${rint(1, 254)}.${rint(1, 254)}`;

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */
const NAMED_USERS = [
  { name: 'David Miller', company: 'SafeZone Services', role: 'super', city: 'London', w: 10 },
  { name: 'Anjali Verma', company: 'Metro Security Group', role: 'admin', city: 'Chennai', w: 7 },
  { name: 'Karan Singh', company: 'Guardian Force Ltd', role: 'manager', city: 'Bangalore', w: 6 },
  { name: 'Sneha Nair', company: 'Elite Security Solutions', role: 'supervisor', city: 'Chennai', w: 5.2 },
  { name: 'Arjun Mehta', company: 'SwiftGuard Services', role: 'analyst', city: 'Mumbai', w: 4.3 },
  { name: 'Priya Sharma', company: 'SafeZone Services', role: 'support', city: 'Delhi', w: 3 },
  { name: 'Rohit Sharma', company: 'SecureGuard UK Ltd', role: 'guard', city: 'Leeds', w: 3 },
  { name: 'Vikram Patel', company: 'Metro Security Group', role: 'auditor', city: 'Pune', w: 2.5 },
  { name: 'Ramesh Kumar', company: 'Guardian Force Ltd', role: 'guard', city: 'Chennai', w: 1.6 },
  { name: 'Deepak Sharma', company: 'Metro Security Group', role: 'supervisor', city: 'Delhi', w: 1.6 },
  { name: 'Nisha Iyer', company: 'SafeZone Services', role: 'support', city: 'Chennai', w: 1.5 },
  { name: 'Suresh Babu', company: 'SwiftGuard Services', role: 'guard', city: 'Bangalore', w: 1.5 },
];
const FIRST = ['Aarav', 'Meera', 'Kavya', 'Rahul', 'Divya', 'Imran', 'Lakshmi', 'Naveen', 'Pooja', 'Sanjay', 'Tara', 'Uday', 'Isha', 'Farhan', 'Gita', 'Harish', 'Jenny', 'Oliver', 'Emma', 'Harry', 'Sophie', 'Jack', 'Amelia', 'George'];
const LAST = ['Reddy', 'Kapoor', 'Menon', 'Gupta', 'Das', 'Khan', 'Rao', 'Joshi', 'Bose', 'Pillai', 'Nair', 'Shah', 'Taylor', 'Brown', 'Wilson', 'Evans', 'Walker', 'Hughes'];

function buildUsers() {
  const users = NAMED_USERS.map((u) => ({ ...u }));
  const seen = new Set(users.map((u) => u.name));
  let i = 0;
  while (users.length < 48) {
    const name = `${FIRST[i % FIRST.length]} ${LAST[(i * 7 + 3) % LAST.length]}`;
    i++;
    if (seen.has(name)) continue;
    seen.add(name);
    const company = COMPANY_NAMES[users.length % COMPANY_NAMES.length];
    users.push({
      name, company, city: pick(COMPANY_CITIES[company]),
      role: wpick(ROLES, [0.2, 1, 2, 2, 2, 3, 9, 1.2]), w: 0.3 + rand() * 1.2,
    });
  }
  return users.map((u, idx) => ({ ...u, id: `USR-${1001 + idx}`, ips: [randomIp(), randomIp()] }));
}
export const ACCESS_USERS = buildUsers();
export const USER_BY_ID = Object.fromEntries(ACCESS_USERS.map((u) => [u.id, u]));
const USER_BY_NAME = Object.fromEntries(ACCESS_USERS.map((u) => [u.name, u]));
const USER_WEIGHTS = ACCESS_USERS.map((u) => u.w);

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */
const DEVICES = {
  web: ['Chrome on Windows', 'Edge on Windows', 'Safari on macOS', 'Firefox on Linux'],
  mobile: ['MEGSI app 4.2 (Android)', 'MEGSI app 4.2 (iOS)'],
  api: ['REST client', 'Service integration'],
  direct: ['On-site terminal'],
  other: ['SSO gateway'],
};
const authFor = (method) => {
  if (method === 'web') return wpick(['pwdOtp', 'pwd'], [7, 3]);
  if (method === 'mobile') return wpick(['biometric', 'pwdOtp'], [6, 4]);
  if (method === 'api') return 'token';
  if (method === 'direct') return 'badge';
  return 'sso';
};
const HOUR_W = [1, 0.5, 0.4, 0.4, 0.5, 1, 2, 4.5, 8, 10, 12, 11, 8, 7, 8.5, 8, 7, 5, 3.5, 2.5, 2, 1.6, 1.4, 1.2];
const HOURS = HOUR_W.map((_, i) => i);

function make(user, date, hh, mm, method, result, reason, ip, location) {
  return {
    userId: user.id, name: user.name, company: user.company, role: user.role,
    ts: `${date} ${pad(hh)}:${pad(mm)}`, method, result, reason: reason || null,
    ip, location, device: pick(DEVICES[method]), auth: authFor(method),
  };
}

function generate() {
  const out = [];
  let day = DATA_FIRST;
  while (day <= DATA_LAST) {
    const [y, m] = day.split('-').map(Number);
    const monthIdx = (y - 2025) * 12 + (m - 1) - 10; // Nov 2025 = 0
    const dow = toDate(day).getUTCDay();
    const weekend = dow === 0 || dow === 6;
    const count = Math.round((24 + monthIdx * 2.6) * (weekend ? 0.42 : 1) * (0.85 + rand() * 0.3));
    const isLast = day === DATA_LAST;
    for (let i = 0; i < count; i++) {
      const user = wpick(ACCESS_USERS, USER_WEIGHTS);
      const method = wpick(METHODS, [52, 24, 12, 8, 4]);
      const hh = isLast ? rint(0, 4) : wpick(HOURS, HOUR_W);
      const mm = rint(0, 59);
      const x = rand();
      if (x < 0.945) {
        out.push(make(user, day, hh, mm, method, 'success', null, pick(user.ips), user.city));
      } else if (x < 0.987) {
        const unknown = rand() < 0.45;
        out.push(make(user, day, hh, mm, method, 'failed', wpick(FAIL_REASONS, [60, 25, 15]),
          unknown ? randomIp() : pick(user.ips), unknown ? 'Unknown' : user.city));
      } else {
        const unknown = rand() < 0.4;
        out.push(make(user, day, hh, mm, method, 'denied', wpick(DENY_REASONS, [70, 30]),
          unknown ? randomIp() : pick(user.ips), unknown ? 'Unknown' : user.city));
      }
    }
    // occasional burst of repeated failures from one user (drives the "flagged" indicator)
    if (!isLast && rand() < 0.12) {
      const user = pick(ACCESS_USERS);
      const ip = randomIp();
      let hh = rint(1, 21), mm = rint(0, 40);
      const n = rint(3, 6);
      for (let k = 0; k < n; k++) {
        out.push(make(user, day, hh, mm, rand() < 0.8 ? 'web' : 'api', 'failed', k === n - 1 ? 'locked' : 'badPassword', ip, 'Unknown'));
        mm += rint(2, 7);
        if (mm > 59) { mm -= 60; hh = Math.min(hh + 1, 23); }
      }
    }
    day = addDays(day, 1);
  }
  // the most recent day: fixed, readable activity
  const L = DATA_LAST;
  const P = (name, hhmm, method, result, reason, ip, loc) => {
    const [hh, mm] = hhmm.split(':').map(Number);
    out.push(make(USER_BY_NAME[name], L, hh, mm, method, result, reason, ip, loc));
  };
  P('David Miller', '14:32', 'web', 'success', null, '103.56.12.34', 'London');
  P('Anjali Verma', '13:21', 'mobile', 'success', null, '49.204.17.88', 'Chennai');
  P('Karan Singh', '11:48', 'web', 'success', null, '122.160.45.22', 'Bangalore');
  P('Sneha Nair', '10:15', 'mobile', 'failed', 'badPassword', '14.139.78.66', 'Unknown');
  P('Arjun Mehta', '09:32', 'api', 'success', null, '192.168.1.45', 'Mumbai');
  P('Ramesh Kumar', '08:42', 'web', 'failed', 'locked', '117.200.34.19', 'Unknown');
  P('Priya Sharma', '08:17', 'web', 'denied', 'denied', '103.78.55.12', 'Delhi');
  P('Deepak Sharma', '07:30', 'api', 'failed', 'badToken', '49.36.118.20', 'Unknown');
  P('Rohit Sharma', '07:02', 'mobile', 'success', null, '87.45.23.76', 'Leeds');
  P('Vikram Patel', '06:45', 'web', 'success', null, '45.67.89.101', 'Pune');
  P('Nisha Iyer', '06:12', 'web', 'denied', 'denied', '106.51.74.9', 'Unknown');
  P('Suresh Babu', '05:48', 'web', 'denied', 'ipBlocked', '157.45.203.66', 'Unknown');
  return out;
}

function finalise(list) {
  list.sort((a, b) => (a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0)); // oldest first
  list.forEach((e, i) => { e.id = `EVT-${100001 + i}`; e.flagged = false; });
  // flag: 3rd (or later) failed/denied attempt by the same user within 60 minutes
  const recent = new Map();
  const mins = (ts) => Math.floor(toDate(ts.slice(0, 10)).getTime() / 6e4) + +ts.slice(11, 13) * 60 + +ts.slice(14, 16);
  for (const e of list) {
    if (e.result === 'success') continue;
    const t = mins(e.ts);
    const arr = (recent.get(e.userId) || []).filter((x) => t - x < 60);
    arr.push(t);
    recent.set(e.userId, arr);
    if (arr.length >= 3) e.flagged = true;
  }
  return list.reverse(); // newest first
}

export const ACCESS_EVENTS = finalise(generate());
export const EVENT_BY_ID = Object.fromEntries(ACCESS_EVENTS.map((e) => [e.id, e]));
export const LOCATIONS = [...new Set(ACCESS_EVENTS.map((e) => e.location))].sort((a, b) =>
  a === 'Unknown' ? 1 : b === 'Unknown' ? -1 : a.localeCompare(b));

/* ------------------------------------------------------------------ */
/* Analytics helpers (pure functions - every number on the page comes  */
/* from these, applied to the same range-filtered event list)          */
/* ------------------------------------------------------------------ */
const evDay = (e) => e.ts.slice(0, 10);
/** True for a real calendar date written as YYYY-MM-DD (rejects '', typos and impossible dates). */
export const isIsoDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && s >= '1900-01-01' && s <= '2999-12-31' && addDays(s, 0) === s;
export const isValidRange = (r) => !!r && isIsoDate(r.start) && isIsoDate(r.end) && r.start <= r.end;
export const eventsInRange = (r) => (isValidRange(r) ? ACCESS_EVENTS.filter((e) => evDay(e) >= r.start && evDay(e) <= r.end) : []);

/** 'invalid' | 'none' (no recorded data in range) | 'partial' (range extends past the recorded data) | 'ok'. */
export function rangeState(r) {
  if (!isValidRange(r)) return 'invalid';
  if (!clampRange(r)) return 'none';
  return r.start < DATA_FIRST || r.end > DATA_LAST ? 'partial' : 'ok';
}

/** The part of the selected range that overlaps recorded data, or null. */
export function clampRange(r) {
  if (!isValidRange(r)) return null;
  const start = r.start > DATA_FIRST ? r.start : DATA_FIRST;
  const end = r.end < DATA_LAST ? r.end : DATA_LAST;
  return start > end ? null : { start, end };
}
/** Equal-length window just before the selected one; null when it is not fully covered by data. */
export function comparisonRange(r) {
  const eff = clampRange(r);
  if (!eff) return null;
  const n = daysBetween(eff.start, eff.end);
  const prev = { start: addDays(eff.start, -n), end: addDays(eff.start, -1) };
  return prev.start < DATA_FIRST ? null : prev;
}
/** First day of the "last 7 / 30 days" window, measured back from the end of the recorded part of the range. */
export function windowStart(r, win) {
  const eff = clampRange(r);
  if (!eff || win === 'period') return null;
  const s = addDays(eff.end, win === '7d' ? -6 : -29);
  return s > eff.start ? s : eff.start;
}

export function tally(list) {
  let success = 0, failed = 0, denied = 0, flagged = 0;
  const users = new Set();
  for (const e of list) {
    if (e.result === 'success') success++;
    else if (e.result === 'failed') failed++;
    else denied++;
    if (e.flagged) flagged++;
    users.add(e.userId);
  }
  return { total: list.length, success, failed, denied, flagged, users: users.size };
}
export const pctChange = (cur, prev) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null);

export function groupCount(list, keyFn) {
  const m = new Map();
  for (const e of list) { const k = keyFn(e); m.set(k, (m.get(k) || 0) + 1); }
  return [...m.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

export function trendMode(r) {
  const eff = clampRange(r);
  if (!eff) return 'day';
  const n = daysBetween(eff.start, eff.end);
  return n <= 45 ? 'day' : n <= 200 ? 'week' : 'month';
}
export function barMode(r) {
  const eff = clampRange(r);
  if (!eff) return 'week';
  if (daysBetween(eff.start, eff.end) <= 14) return 'day';
  return eff.start.slice(0, 7) !== eff.end.slice(0, 7) ? 'month' : 'week';
}

/* ---- per-chart time windows (Access Activity Trend / Access by Time) ---- */
export const CHART_WINDOWS = ['range', '7d', '30d', '3m', '6m', '12m'];
/**
 * Window a chart plots. 'range' = the shared date range (recorded part only). The others are measured back
 * from the last recorded day of the shared range and never start before the first recorded day.
 */
export function chartWindow(r, win) {
  const eff = clampRange(r);
  if (!eff) return null;
  if (win === 'range') return { ...eff, limited: false };
  const start = win === '7d' ? addDays(eff.end, -6)
    : win === '30d' ? addDays(eff.end, -29)
      : `${shiftMonths(eff.end.slice(0, 7), -({ '3m': 3, '6m': 6, '12m': 12 }[win] - 1))}-01`;
  const limited = start < DATA_FIRST;
  return { start: limited ? DATA_FIRST : start, end: eff.end, limited };
}
/** Bucket size (day / week / month) used for a chart and window. */
export function chartMode(kind, win, r) {
  if (win === 'range') return kind === 'trend' ? trendMode(r) : barMode(r);
  if (win === '7d' || win === '30d') return 'day';
  if (win === '3m') return 'week';
  if (win === '6m') return kind === 'trend' ? 'week' : 'month';
  return 'month';
}
/** Equal-length window right before w; null when it is not fully covered by recorded data. */
export function previousWindow(w) {
  const n = daysBetween(w.start, w.end);
  const prev = { start: addDays(w.start, -n), end: addDays(w.start, -1) };
  return prev.start < DATA_FIRST ? null : prev;
}
export const isFullMonth = (b) => b.start.slice(8) === '01' && b.end === monthEnd(b.start.slice(0, 7));
const nextMonth = (k) => { let y = +k.slice(0, 4), m = +k.slice(5, 7) + 1; if (m > 12) { m = 1; y++; } return `${y}-${pad(m)}`; };

/** Split the recorded part of the range into day / week / month buckets and count results in each. */
export function bucketize(list, r, mode) {
  const eff = clampRange(r);
  if (!eff) return [];
  const buckets = [];
  if (mode === 'month') {
    for (let k = eff.start.slice(0, 7); k <= eff.end.slice(0, 7); k = nextMonth(k)) {
      const lo = k === eff.start.slice(0, 7) ? eff.start : `${k}-01`;
      buckets.push({ key: k, start: lo, end: k === eff.end.slice(0, 7) ? eff.end : addDays(`${nextMonth(k)}-01`, -1) });
    }
  } else {
    const step = mode === 'week' ? 7 : 1;
    for (let s = eff.start; s <= eff.end; s = addDays(s, step)) {
      const e = addDays(s, step - 1);
      buckets.push({ key: s, start: s, end: e > eff.end ? eff.end : e });
    }
  }
  buckets.forEach((b) => { b.success = 0; b.failed = 0; b.denied = 0; b.total = 0; });
  const t0 = toDate(eff.start).getTime();
  for (const e of list) {
    const d = evDay(e);
    if (d < eff.start || d > eff.end) continue;
    const idx = mode === 'month'
      ? buckets.findIndex((b) => b.key === d.slice(0, 7))
      : Math.floor((toDate(d).getTime() - t0) / 864e5 / (mode === 'week' ? 7 : 1));
    const b = buckets[idx];
    if (!b) continue;
    b[e.result]++; b.total++;
  }
  return buckets;
}

/** Events per two-hour block (00-02, 02-04, ... 22-24). */
export function blockProfile(list) {
  const blocks = Array.from({ length: 12 }, (_, i) => ({ start: i * 2, count: 0 }));
  for (const e of list) blocks[Math.floor(+e.ts.slice(11, 13) / 2)].count++;
  return blocks;
}

export const hourLabel = (h, lang) => {
  const x = h % 24;
  return lang === 'en' ? `${x % 12 || 12}:00 ${x < 12 ? 'AM' : 'PM'}` : `${pad(x)}:00`;
};
export const LOCALES = { en: 'en-GB', fr: 'fr-FR', de: 'de-DE' };

/* ------------------------------------------------------------------ */
/* Translations (uses the app's existing language state: en / fr / de) */
/* ------------------------------------------------------------------ */
const en = {
  'time.range': 'Selected range', 'time.7d': 'Last 7 Days', 'time.30d': 'Last 30 Days', 'time.3m': 'Last 3 Months', 'time.6m': 'Last 6 Months', 'time.12m': 'Last 12 Months',
  'time.limited': 'Limited to available data', 'time.vsPrev': 'vs previous period', 'kpi.vs': 'Compared with {range}',
  'range.none': 'No activity found for the selected date range.', 'range.invalid': 'The selected date range is not valid.',
  'range.noneHint': 'Recorded access activity is available from {from} to {to}.', 'range.invalidHint': 'Choose a start date that is on or before the end date.',
  'range.showAll': 'Show all available data', 'range.partial': 'Recorded activity: {from} – {to}',
  'va.users': 'All Accessing Users', 'va.companies': 'All Companies', 'va.failed': 'All Failed Attempts', 'va.search': 'Search...',
  'va.showing': 'Showing {from} to {to} of {total}', 'va.noMatch': 'No results match your search.', 'd.back': 'Back',
  title: 'Access Logs',
  subtitle: 'Monitor and track all access activities across the platform and tenant companies.',
  'kpi.total': 'Total Access Events', 'kpi.success': 'Successful Logins', 'kpi.failed': 'Failed Login Attempts',
  'kpi.denied': 'Access Denied', 'kpi.users': 'Unique Users', 'kpi.period': 'Selected period', 'kpi.noPrev': 'No comparison available',
  'trend.title': 'Access Activity Trend', 'res.success': 'Successful', 'res.failed': 'Failed', 'res.denied': 'Denied',
  'method.title': 'Access by Method', 'method.total': 'Total Events',
  'method.web': 'Web Portal', 'method.mobile': 'Mobile App', 'method.api': 'API Access', 'method.direct': 'Direct Login', 'method.other': 'Others',
  'time.title': 'Access by Time', 'time.l12': 'Last 12 Months', 'time.l6': 'Last 6 Months', 'time.l3': 'Last 3 Months', 'time.events': 'Events',
  'chart.empty': 'No access events in the selected period.',
  'logs.title': 'Recent Access Logs', 'logs.search': 'Search logs...', 'logs.allTypes': 'All Types', 'logs.allStatus': 'All Status',
  'logs.allLocations': 'All Locations', 'logs.export': 'Export', 'logs.reset': 'Reset',
  'win.period': 'Entire period', 'win.7d': 'Last 7 Days', 'win.30d': 'Last 30 Days',
  'col.num': '#', 'col.user': 'User', 'col.company': 'Company', 'col.role': 'Role', 'col.type': 'Access Type', 'col.ip': 'IP Address',
  'col.time': 'Time', 'col.status': 'Status', 'col.location': 'Location', 'col.action': 'Action',
  'st.success': 'Success', 'st.failed': 'Failed', 'st.denied': 'Denied', 'st.issues': 'Failed or denied', 'st.flagged': 'Flagged (repeated failures)',
  view: 'View', sortBy: 'Sort by {col}',
  showing: 'Showing {from} to {to} of {total} events', prev: 'Previous page', next: 'Next page',
  'logs.empty': 'No access events match this date range and filters.', 'logs.clear': 'Clear filters',
  'top.title': 'Top Accessing Users', viewAll: 'View All', events: 'events',
  'co.title': 'Access Logs by Company', 'co.name': 'Company Name', 'co.total': 'Total Events', 'co.ok': 'Successful', 'co.failed': 'Failed', 'co.denied': 'Denied',
  'fail.title': 'Recent Failed Attempts', 'fail.user': 'User', 'fail.company': 'Company', 'fail.reason': 'Reason', 'fail.time': 'Time', 'fail.empty': 'No failed attempts in the selected period.',
  'reason.badPassword': 'Invalid password', 'reason.locked': 'Account locked', 'reason.badToken': 'Invalid token', 'reason.denied': 'Access denied', 'reason.ipBlocked': 'IP blocked',
  'ins.title': 'Access Insights', 'ins.security': 'Security Status', 'ins.securityCap': 'Successful access rate', 'ins.peak': 'Peak Access Time',
  'ins.peakCap': 'Highest activity', 'ins.loc': 'Top Location', 'ins.locCap': 'Most access events', 'ins.none': 'No data',
  'role.super': 'Super Admin', 'role.admin': 'Admin', 'role.manager': 'Manager', 'role.supervisor': 'Supervisor', 'role.analyst': 'Analyst',
  'role.support': 'Support Agent', 'role.guard': 'Security Guard', 'role.auditor': 'Auditor',
  'auth.pwdOtp': 'Password + OTP', 'auth.pwd': 'Password', 'auth.biometric': 'Biometric', 'auth.token': 'API token', 'auth.badge': 'Badge + PIN', 'auth.sso': 'Single sign-on',
  'loc.Unknown': 'Unknown',
  'd.period': 'Selected period', 'd.events': 'Access events', 'd.share': 'Share of all events', 'd.vsPrev': 'Change vs previous period',
  'd.noPrev': 'Not available', 'd.dailyAvg': 'Daily average', 'd.busiest': 'Busiest day', 'd.topType': 'Most used access type',
  'd.topLoc': 'Top location', 'd.topCompany': 'Top company', 'd.flagged': 'Flagged events', 'd.uniqueUsers': 'Unique users',
  'd.avgPerUser': 'Average events per user', 'd.topUser': 'Most active user', 'd.usersWithIssues': 'Users with failed or denied attempts',
  'd.companies': 'Active companies', 'd.rate': 'Successful access rate', 'd.prevRate': 'Previous period rate',
  'd.latest': 'Latest events', 'd.reasons': 'Failure reasons', 'd.activeUsers': 'Most active users', 'd.showTable': 'Show in table',
  'd.eventId': 'Event ID', 'd.timestamp': 'Timestamp', 'd.userId': 'User ID', 'd.device': 'Device', 'd.auth': 'Authentication',
  'd.result': 'Result', 'd.reason': 'Reason', 'd.flagNote': 'Flagged: repeated failed attempts by this user within one hour.',
  'd.related': 'Recent activity by this user', 'd.viewUser': 'View user activity', 'd.firstSeen': 'First event in period', 'd.lastSeen': 'Last event in period',
  'd.failedOrDenied': 'Failed or denied', 'd.usualLoc': 'Usual location', 'd.users': 'Users', 'd.successRate': 'Success rate',
  'd.peakWindow': 'Peak window', 'd.windows': 'Busiest time windows', 'd.locations': 'Locations by events', 'd.allCompanies': 'All companies',
  'd.allUsers': 'Most active users', 'd.noEvents': 'No events in this period.',
  'toast.exported': 'Access logs exported ({n} events).', 'toast.nothing': 'Nothing to export for the current filters.', 'toast.reset': 'Filters reset.',
  'toast.filtered': 'Table filtered.',
};

const fr = {
  'time.range': 'Période sélectionnée', 'time.7d': '7 derniers jours', 'time.30d': '30 derniers jours', 'time.3m': '3 derniers mois', 'time.6m': '6 derniers mois', 'time.12m': '12 derniers mois',
  'time.limited': 'Limité aux données disponibles', 'time.vsPrev': 'par rapport à la période précédente', 'kpi.vs': 'Comparé à {range}',
  'range.none': 'Aucune activité trouvée pour la période sélectionnée.', 'range.invalid': 'La période sélectionnée n’est pas valide.',
  'range.noneHint': 'L’activité d’accès enregistrée est disponible du {from} au {to}.', 'range.invalidHint': 'Choisissez une date de début antérieure ou égale à la date de fin.',
  'range.showAll': 'Afficher toutes les données disponibles', 'range.partial': 'Activité enregistrée : {from} – {to}',
  'va.users': 'Tous les utilisateurs', 'va.companies': 'Toutes les sociétés', 'va.failed': 'Toutes les tentatives échouées', 'va.search': 'Rechercher...',
  'va.showing': 'Affichage de {from} à {to} sur {total}', 'va.noMatch': 'Aucun résultat ne correspond à votre recherche.', 'd.back': 'Retour',
  title: 'Journaux d’accès',
  subtitle: 'Surveillez et suivez toutes les activités d’accès sur la plateforme et chez les sociétés clientes.',
  'kpi.total': 'Total des événements d’accès', 'kpi.success': 'Connexions réussies', 'kpi.failed': 'Tentatives de connexion échouées',
  'kpi.denied': 'Accès refusés', 'kpi.users': 'Utilisateurs uniques', 'kpi.period': 'Période sélectionnée', 'kpi.noPrev': 'Aucune comparaison disponible',
  'trend.title': 'Tendance de l’activité d’accès', 'res.success': 'Réussis', 'res.failed': 'Échoués', 'res.denied': 'Refusés',
  'method.title': 'Accès par méthode', 'method.total': 'Total des événements',
  'method.web': 'Portail web', 'method.mobile': 'Application mobile', 'method.api': 'Accès API', 'method.direct': 'Connexion directe', 'method.other': 'Autres',
  'time.title': 'Accès par période', 'time.l12': '12 derniers mois', 'time.l6': '6 derniers mois', 'time.l3': '3 derniers mois', 'time.events': 'Événements',
  'chart.empty': 'Aucun événement d’accès sur la période sélectionnée.',
  'logs.title': 'Journaux d’accès récents', 'logs.search': 'Rechercher dans les journaux...', 'logs.allTypes': 'Tous les types', 'logs.allStatus': 'Tous les statuts',
  'logs.allLocations': 'Tous les lieux', 'logs.export': 'Exporter', 'logs.reset': 'Réinitialiser',
  'win.period': 'Toute la période', 'win.7d': '7 derniers jours', 'win.30d': '30 derniers jours',
  'col.num': 'N°', 'col.user': 'Utilisateur', 'col.company': 'Société', 'col.role': 'Rôle', 'col.type': 'Type d’accès', 'col.ip': 'Adresse IP',
  'col.time': 'Heure', 'col.status': 'Statut', 'col.location': 'Lieu', 'col.action': 'Action',
  'st.success': 'Réussi', 'st.failed': 'Échoué', 'st.denied': 'Refusé', 'st.issues': 'Échoués ou refusés', 'st.flagged': 'Signalé (échecs répétés)',
  view: 'Voir', sortBy: 'Trier par {col}',
  showing: 'Affichage de {from} à {to} sur {total} événements', prev: 'Page précédente', next: 'Page suivante',
  'logs.empty': 'Aucun événement d’accès ne correspond à cette période et à ces filtres.', 'logs.clear': 'Effacer les filtres',
  'top.title': 'Utilisateurs les plus actifs', viewAll: 'Tout afficher', events: 'événements',
  'co.title': 'Journaux d’accès par société', 'co.name': 'Nom de la société', 'co.total': 'Total', 'co.ok': 'Réussis', 'co.failed': 'Échoués', 'co.denied': 'Refusés',
  'fail.title': 'Dernières tentatives échouées', 'fail.user': 'Utilisateur', 'fail.company': 'Société', 'fail.reason': 'Motif', 'fail.time': 'Heure', 'fail.empty': 'Aucune tentative échouée sur la période sélectionnée.',
  'reason.badPassword': 'Mot de passe invalide', 'reason.locked': 'Compte verrouillé', 'reason.badToken': 'Jeton invalide', 'reason.denied': 'Accès refusé', 'reason.ipBlocked': 'IP bloquée',
  'ins.title': 'Analyses d’accès', 'ins.security': 'État de sécurité', 'ins.securityCap': 'Taux d’accès réussis', 'ins.peak': 'Heure de pointe',
  'ins.peakCap': 'Activité la plus élevée', 'ins.loc': 'Lieu principal', 'ins.locCap': 'Le plus d’événements d’accès', 'ins.none': 'Aucune donnée',
  'role.super': 'Super administrateur', 'role.admin': 'Administrateur', 'role.manager': 'Responsable', 'role.supervisor': 'Superviseur', 'role.analyst': 'Analyste',
  'role.support': 'Agent d’assistance', 'role.guard': 'Agent de sécurité', 'role.auditor': 'Auditeur',
  'auth.pwdOtp': 'Mot de passe + OTP', 'auth.pwd': 'Mot de passe', 'auth.biometric': 'Biométrie', 'auth.token': 'Jeton API', 'auth.badge': 'Badge + PIN', 'auth.sso': 'Authentification unique',
  'loc.Unknown': 'Inconnu',
  'd.period': 'Période sélectionnée', 'd.events': 'Événements d’accès', 'd.share': 'Part de tous les événements', 'd.vsPrev': 'Évolution par rapport à la période précédente',
  'd.noPrev': 'Non disponible', 'd.dailyAvg': 'Moyenne quotidienne', 'd.busiest': 'Jour le plus actif', 'd.topType': 'Type d’accès le plus utilisé',
  'd.topLoc': 'Lieu principal', 'd.topCompany': 'Société principale', 'd.flagged': 'Événements signalés', 'd.uniqueUsers': 'Utilisateurs uniques',
  'd.avgPerUser': 'Moyenne d’événements par utilisateur', 'd.topUser': 'Utilisateur le plus actif', 'd.usersWithIssues': 'Utilisateurs avec tentatives échouées ou refusées',
  'd.companies': 'Sociétés actives', 'd.rate': 'Taux d’accès réussis', 'd.prevRate': 'Taux de la période précédente',
  'd.latest': 'Derniers événements', 'd.reasons': 'Motifs d’échec', 'd.activeUsers': 'Utilisateurs les plus actifs', 'd.showTable': 'Afficher dans le tableau',
  'd.eventId': 'ID de l’événement', 'd.timestamp': 'Horodatage', 'd.userId': 'ID utilisateur', 'd.device': 'Appareil', 'd.auth': 'Authentification',
  'd.result': 'Résultat', 'd.reason': 'Motif', 'd.flagNote': 'Signalé : tentatives échouées répétées de cet utilisateur en moins d’une heure.',
  'd.related': 'Activité récente de cet utilisateur', 'd.viewUser': 'Voir l’activité de l’utilisateur', 'd.firstSeen': 'Premier événement de la période', 'd.lastSeen': 'Dernier événement de la période',
  'd.failedOrDenied': 'Échoués ou refusés', 'd.usualLoc': 'Lieu habituel', 'd.users': 'Utilisateurs', 'd.successRate': 'Taux de réussite',
  'd.peakWindow': 'Plage de pointe', 'd.windows': 'Plages horaires les plus actives', 'd.locations': 'Lieux par nombre d’événements', 'd.allCompanies': 'Toutes les sociétés',
  'd.allUsers': 'Utilisateurs les plus actifs', 'd.noEvents': 'Aucun événement sur cette période.',
  'toast.exported': 'Journaux d’accès exportés ({n} événements).', 'toast.nothing': 'Rien à exporter avec les filtres actuels.', 'toast.reset': 'Filtres réinitialisés.',
  'toast.filtered': 'Tableau filtré.',
};

const de = {
  'time.range': 'Gewählter Zeitraum', 'time.7d': 'Letzte 7 Tage', 'time.30d': 'Letzte 30 Tage', 'time.3m': 'Letzte 3 Monate', 'time.6m': 'Letzte 6 Monate', 'time.12m': 'Letzte 12 Monate',
  'time.limited': 'Auf verfügbare Daten begrenzt', 'time.vsPrev': 'ggü. Vorzeitraum', 'kpi.vs': 'Verglichen mit {range}',
  'range.none': 'Keine Aktivität im gewählten Zeitraum gefunden.', 'range.invalid': 'Der gewählte Zeitraum ist ungültig.',
  'range.noneHint': 'Aufgezeichnete Zugriffsaktivität ist von {from} bis {to} verfügbar.', 'range.invalidHint': 'Wählen Sie ein Startdatum, das vor oder am Enddatum liegt.',
  'range.showAll': 'Alle verfügbaren Daten anzeigen', 'range.partial': 'Aufgezeichnete Aktivität: {from} – {to}',
  'va.users': 'Alle zugreifenden Benutzer', 'va.companies': 'Alle Unternehmen', 'va.failed': 'Alle fehlgeschlagenen Versuche', 'va.search': 'Suchen...',
  'va.showing': 'Zeige {from} bis {to} von {total}', 'va.noMatch': 'Keine Ergebnisse für Ihre Suche.', 'd.back': 'Zurück',
  title: 'Zugriffsprotokolle',
  subtitle: 'Überwachen und verfolgen Sie alle Zugriffsaktivitäten auf der Plattform und bei den Mandantenfirmen.',
  'kpi.total': 'Zugriffsereignisse gesamt', 'kpi.success': 'Erfolgreiche Anmeldungen', 'kpi.failed': 'Fehlgeschlagene Anmeldeversuche',
  'kpi.denied': 'Zugriff verweigert', 'kpi.users': 'Eindeutige Benutzer', 'kpi.period': 'Gewählter Zeitraum', 'kpi.noPrev': 'Kein Vergleich verfügbar',
  'trend.title': 'Trend der Zugriffsaktivität', 'res.success': 'Erfolgreich', 'res.failed': 'Fehlgeschlagen', 'res.denied': 'Verweigert',
  'method.title': 'Zugriff nach Methode', 'method.total': 'Ereignisse gesamt',
  'method.web': 'Webportal', 'method.mobile': 'Mobile App', 'method.api': 'API-Zugriff', 'method.direct': 'Direkte Anmeldung', 'method.other': 'Sonstige',
  'time.title': 'Zugriff nach Zeitraum', 'time.l12': 'Letzte 12 Monate', 'time.l6': 'Letzte 6 Monate', 'time.l3': 'Letzte 3 Monate', 'time.events': 'Ereignisse',
  'chart.empty': 'Keine Zugriffsereignisse im gewählten Zeitraum.',
  'logs.title': 'Aktuelle Zugriffsprotokolle', 'logs.search': 'Protokolle durchsuchen...', 'logs.allTypes': 'Alle Typen', 'logs.allStatus': 'Alle Status',
  'logs.allLocations': 'Alle Standorte', 'logs.export': 'Exportieren', 'logs.reset': 'Zurücksetzen',
  'win.period': 'Gesamter Zeitraum', 'win.7d': 'Letzte 7 Tage', 'win.30d': 'Letzte 30 Tage',
  'col.num': 'Nr.', 'col.user': 'Benutzer', 'col.company': 'Unternehmen', 'col.role': 'Rolle', 'col.type': 'Zugriffstyp', 'col.ip': 'IP-Adresse',
  'col.time': 'Zeit', 'col.status': 'Status', 'col.location': 'Standort', 'col.action': 'Aktion',
  'st.success': 'Erfolgreich', 'st.failed': 'Fehlgeschlagen', 'st.denied': 'Verweigert', 'st.issues': 'Fehlgeschlagen oder verweigert', 'st.flagged': 'Markiert (wiederholte Fehlversuche)',
  view: 'Ansehen', sortBy: 'Sortieren nach {col}',
  showing: 'Zeige {from} bis {to} von {total} Ereignissen', prev: 'Vorherige Seite', next: 'Nächste Seite',
  'logs.empty': 'Keine Zugriffsereignisse entsprechen diesem Zeitraum und diesen Filtern.', 'logs.clear': 'Filter löschen',
  'top.title': 'Aktivste Benutzer', viewAll: 'Alle anzeigen', events: 'Ereignisse',
  'co.title': 'Zugriffsprotokolle nach Unternehmen', 'co.name': 'Firmenname', 'co.total': 'Gesamt', 'co.ok': 'Erfolgreich', 'co.failed': 'Fehlgeschlagen', 'co.denied': 'Verweigert',
  'fail.title': 'Letzte fehlgeschlagene Versuche', 'fail.user': 'Benutzer', 'fail.company': 'Unternehmen', 'fail.reason': 'Grund', 'fail.time': 'Zeit', 'fail.empty': 'Keine fehlgeschlagenen Versuche im gewählten Zeitraum.',
  'reason.badPassword': 'Ungültiges Passwort', 'reason.locked': 'Konto gesperrt', 'reason.badToken': 'Ungültiges Token', 'reason.denied': 'Zugriff verweigert', 'reason.ipBlocked': 'IP blockiert',
  'ins.title': 'Zugriffsanalysen', 'ins.security': 'Sicherheitsstatus', 'ins.securityCap': 'Rate erfolgreicher Zugriffe', 'ins.peak': 'Spitzenzeit',
  'ins.peakCap': 'Höchste Aktivität', 'ins.loc': 'Top-Standort', 'ins.locCap': 'Meiste Zugriffsereignisse', 'ins.none': 'Keine Daten',
  'role.super': 'Super-Admin', 'role.admin': 'Administrator', 'role.manager': 'Manager', 'role.supervisor': 'Vorgesetzter', 'role.analyst': 'Analyst',
  'role.support': 'Support-Mitarbeiter', 'role.guard': 'Sicherheitskraft', 'role.auditor': 'Prüfer',
  'auth.pwdOtp': 'Passwort + OTP', 'auth.pwd': 'Passwort', 'auth.biometric': 'Biometrie', 'auth.token': 'API-Token', 'auth.badge': 'Ausweis + PIN', 'auth.sso': 'Single Sign-on',
  'loc.Unknown': 'Unbekannt',
  'd.period': 'Gewählter Zeitraum', 'd.events': 'Zugriffsereignisse', 'd.share': 'Anteil aller Ereignisse', 'd.vsPrev': 'Veränderung zum Vorzeitraum',
  'd.noPrev': 'Nicht verfügbar', 'd.dailyAvg': 'Tagesdurchschnitt', 'd.busiest': 'Aktivster Tag', 'd.topType': 'Meistgenutzter Zugriffstyp',
  'd.topLoc': 'Top-Standort', 'd.topCompany': 'Top-Unternehmen', 'd.flagged': 'Markierte Ereignisse', 'd.uniqueUsers': 'Eindeutige Benutzer',
  'd.avgPerUser': 'Ø Ereignisse pro Benutzer', 'd.topUser': 'Aktivster Benutzer', 'd.usersWithIssues': 'Benutzer mit fehlgeschlagenen oder verweigerten Versuchen',
  'd.companies': 'Aktive Unternehmen', 'd.rate': 'Rate erfolgreicher Zugriffe', 'd.prevRate': 'Rate im Vorzeitraum',
  'd.latest': 'Neueste Ereignisse', 'd.reasons': 'Fehlerursachen', 'd.activeUsers': 'Aktivste Benutzer', 'd.showTable': 'In Tabelle anzeigen',
  'd.eventId': 'Ereignis-ID', 'd.timestamp': 'Zeitstempel', 'd.userId': 'Benutzer-ID', 'd.device': 'Gerät', 'd.auth': 'Authentifizierung',
  'd.result': 'Ergebnis', 'd.reason': 'Grund', 'd.flagNote': 'Markiert: wiederholte Fehlversuche dieses Benutzers innerhalb einer Stunde.',
  'd.related': 'Letzte Aktivität dieses Benutzers', 'd.viewUser': 'Benutzeraktivität ansehen', 'd.firstSeen': 'Erstes Ereignis im Zeitraum', 'd.lastSeen': 'Letztes Ereignis im Zeitraum',
  'd.failedOrDenied': 'Fehlgeschlagen oder verweigert', 'd.usualLoc': 'Üblicher Standort', 'd.users': 'Benutzer', 'd.successRate': 'Erfolgsquote',
  'd.peakWindow': 'Spitzenzeitfenster', 'd.windows': 'Aktivste Zeitfenster', 'd.locations': 'Standorte nach Ereignissen', 'd.allCompanies': 'Alle Unternehmen',
  'd.allUsers': 'Aktivste Benutzer', 'd.noEvents': 'Keine Ereignisse in diesem Zeitraum.',
  'toast.exported': 'Zugriffsprotokolle exportiert ({n} Ereignisse).', 'toast.nothing': 'Mit den aktuellen Filtern gibt es nichts zu exportieren.', 'toast.reset': 'Filter zurückgesetzt.',
  'toast.filtered': 'Tabelle gefiltert.',
};

export const AL_STRINGS = { en, fr, de };

/** Translator bound to the app's current language (falls back to English, then to the key). */
export function alTranslator(lang) {
  const dict = AL_STRINGS[lang] || en;
  return (key, params) => {
    let s = dict[key] ?? en[key] ?? key;
    if (params) for (const k in params) s = s.split(`{${k}}`).join(params[k]);
    return s;
  };
}