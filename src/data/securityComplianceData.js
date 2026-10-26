// Security & Compliance demonstration data (not connected to a backend).
// Everything on the page is derived from the data below, so changing the
// date range changes the KPIs, charts, donut and table.

// ---------------------------------------------------------------------------
// Small date helpers
// ---------------------------------------------------------------------------

const pad = (n) => String(n).padStart(2, '0');
const DAY_MS = 86400000;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MON = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const toISODate = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseISODate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const addDaysISO = (iso, n) => toISODate(addDays(parseISODate(iso), n));

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Fixed "now" for the demo so the table's Date filter works with sample dates.
// Replace with `new Date()` once real data is connected.
export const DEMO_NOW = new Date('2026-10-20T15:00:00');

// The sample data covers this window only.
export const DATA_MIN = '2025-11-01';
export const DATA_MAX = '2026-10-31';

export const DATE_PRESETS = [
  { id: 'oct', label: 'October 2026', start: '2026-10-01', end: '2026-10-31' },
  { id: 'sep', label: 'September 2026', start: '2026-09-01', end: '2026-09-30' },
  { id: 'aug', label: 'August 2026', start: '2026-08-01', end: '2026-08-31' },
  { id: 'q3', label: 'Q3 2026', start: '2026-07-01', end: '2026-09-30' },
  { id: 'ytd', label: 'Year to date', start: '2026-01-01', end: '2026-10-31' },
  { id: 'l12', label: 'Last 12 months', start: '2025-11-01', end: '2026-10-31' },
];

export const COMPLIANCE_COLORS = {
  Compliant: '#079447',
  'Needs Attention': '#F59E0B',
  'Non-Compliant': '#E8172D',
};

// Reasons shown when a donut segment is clicked (weights add up to 1).
export const COMPLIANCE_REASONS = {
  Compliant: [
    { label: 'MFA enforced', weight: 0.4 },
    { label: 'Access reviews completed', weight: 0.35 },
    { label: 'Data retention verified', weight: 0.25 },
  ],
  'Needs Attention': [
    { label: 'MFA below target', weight: 0.3 },
    { label: 'Access review overdue', weight: 0.3 },
    { label: 'Password policy outdated', weight: 0.25 },
    { label: 'Data retention pending', weight: 0.15 },
  ],
  'Non-Compliant': [
    { label: 'MFA not enabled', weight: 0.4 },
    { label: 'Audit logging disabled', weight: 0.35 },
    { label: 'Expired data agreement', weight: 0.25 },
  ],
};

// ---------------------------------------------------------------------------
// Monthly snapshots (October 2026 matches the reference design)
// ---------------------------------------------------------------------------

const month = (score, failedLogins, mfa, complianceRate, compliant, needs, non, tenants) => ({
  score, failedLogins, mfa, complianceRate, compliant, needs, non, tenants,
});

export const SECURITY_MONTHLY = {
  '2025-11': month(89, 41, 72, 86, 66, 23, 11, 78),
  '2025-12': month(90, 47, 74, 87, 68, 22, 10, 81),
  '2026-01': month(91, 38, 76, 88, 69, 21, 10, 85),
  '2026-02': month(91, 35, 78, 89, 70, 21, 9, 88),
  '2026-03': month(92, 39, 79, 90, 71, 20, 9, 91),
  '2026-04': month(93, 33, 81, 90, 72, 20, 8, 94),
  '2026-05': month(93, 36, 82, 91, 73, 19, 8, 96),
  '2026-06': month(94, 31, 83, 92, 74, 19, 7, 98),
  '2026-07': month(94, 34, 84, 92, 75, 18, 7, 100),
  '2026-08': month(95, 30, 85, 93, 76, 17, 7, 102),
  '2026-09': month(95, 32, 86, 93, 77, 17, 6, 103),
  '2026-10': month(96, 28, 87, 94, 78, 16, 6, 104),
};

function monthOverlapDays(key, start, end) {
  const [y, m] = key.split('-').map(Number);
  const monthStart = new Date(y, m - 1, 1);
  const monthEnd = new Date(y, m, 0);
  const s = start > monthStart ? start : monthStart;
  const e = end < monthEnd ? end : monthEnd;
  if (e < s) return 0;
  return Math.round((e - s) / DAY_MS) + 1;
}

// KPI values for a date range (weighted by the days that fall in each month).
export function getSummary(startISO, endISO) {
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);

  let totalDays = 0;
  let failed = 0;
  let score = 0;
  let mfa = 0;
  let rate = 0;
  let compliant = 0;
  let needs = 0;
  let tenants = 0;

  Object.keys(SECURITY_MONTHLY).forEach((key) => {
    const days = monthOverlapDays(key, start, end);
    if (!days) return;

    const [y, m] = key.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const snap = SECURITY_MONTHLY[key];

    totalDays += days;
    failed += (snap.failedLogins * days) / daysInMonth;
    score += snap.score * days;
    mfa += snap.mfa * days;
    rate += snap.complianceRate * days;
    compliant += snap.compliant * days;
    needs += snap.needs * days;
    tenants = snap.tenants; // latest month inside the range
  });

  if (!totalDays) {
    return {
      hasData: false, score: 0, mfa: 0, complianceRate: 0,
      compliant: 0, needs: 0, non: 0, tenants: 0, failedLogins: 0,
    };
  }

  const compliantPct = Math.round(compliant / totalDays);
  const needsPct = Math.round(needs / totalDays);

  return {
    hasData: true,
    score: Math.round(score / totalDays),
    mfa: Math.round(mfa / totalDays),
    complianceRate: Math.round(rate / totalDays),
    compliant: compliantPct,
    needs: needsPct,
    non: 100 - compliantPct - needsPct,
    tenants,
    failedLogins: Math.round(failed),
  };
}

// ---------------------------------------------------------------------------
// Daily event series (deterministic sample data, scaled to the 0-50 axis)
// ---------------------------------------------------------------------------

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const DAILY = (() => {
  const rnd = seeded(20261026);
  const out = [];

  for (let i = 0; i < 365; i += 1) {
    out.push({
      date: toISODate(new Date(2025, 10, 1 + i)),
      successful: clamp(Math.round(30 + 11 * Math.sin(i / 8) + rnd() * 9 - 2), 12, 48),
      failed: clamp(Math.round(11 + 8 * Math.sin(i / 5 + 1) + rnd() * 5 - 2), 2, 26),
      suspicious: clamp(Math.round(6 + 4 * Math.sin(i / 6 + 2) + rnd() * 3 - 1), 1, 14),
    });
  }

  return out;
})();

const DAILY_BY_DATE = Object.fromEntries(DAILY.map((d) => [d.date, d]));

// Chart points for a range: daily (<= 31 days), weekly (<= 120 days) or monthly.
// Values are the average events per day inside each bucket.
export function getTrend(startISO, endISO) {
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  const days = Math.round((end - start) / DAY_MS) + 1;
  const mode = days <= 31 ? 'day' : days <= 120 ? 'week' : 'month';

  const avg = (list, key) =>
    list.length ? Math.round(list.reduce((sum, d) => sum + d[key], 0) / list.length) : 0;

  const makePoint = (aISO, bISO, label, title) => {
    const list = DAILY.filter((d) => d.date >= aISO && d.date <= bISO);

    return {
      label,
      title,
      start: aISO,
      end: bISO,
      successful: avg(list, 'successful'),
      failed: avg(list, 'failed'),
      suspicious: avg(list, 'suspicious'),
    };
  };

  const points = [];

  if (mode === 'day') {
    for (let i = 0; i < days; i += 1) {
      const d = addDays(start, i);
      const iso = toISODate(d);

      points.push(
        makePoint(
          iso,
          iso,
          `${pad(d.getDate())} ${MON[d.getMonth()]}`,
          `${pad(d.getDate())} ${MON[d.getMonth()]} ${d.getFullYear()}`
        )
      );
    }
  } else if (mode === 'week') {
    for (let i = 0; i < days; i += 7) {
      const a = addDays(start, i);
      const b = addDays(start, Math.min(i + 6, days - 1));

      points.push(
        makePoint(
          toISODate(a),
          toISODate(b),
          `${pad(a.getDate())} ${MON[a.getMonth()]}`,
          `${pad(a.getDate())} ${MON[a.getMonth()]} – ${pad(b.getDate())} ${MON[b.getMonth()]}`
        )
      );
    }
  } else {
    let cursor = new Date(start.getFullYear(), start.getMonth(), 1);

    while (cursor <= end) {
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
      const a = cursor < start ? start : cursor;
      const b = monthEnd > end ? end : monthEnd;

      points.push(
        makePoint(
          toISODate(a),
          toISODate(b),
          `${MON[cursor.getMonth()]} ’${String(cursor.getFullYear()).slice(2)}`,
          `${FULL_MON[cursor.getMonth()]} ${cursor.getFullYear()}`
        )
      );

      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
  }

  return { mode, points };
}

// 24 hourly points for one day (used by the last drill-down level).
export function getHourly(dateISO) {
  const day = DAILY_BY_DATE[dateISO] || { successful: 0, failed: 0, suspicious: 0 };

  return Array.from({ length: 24 }, (_, h) => {
    const w = 0.2 + Math.exp(-(((h - 13) / 4.5) ** 2));

    return {
      label: `${pad(h)}:00`,
      title: `${pad(h)}:00`,
      successful: Math.round(day.successful * 0.7 * w),
      failed: Math.round(day.failed * 0.7 * w),
      suspicious: Math.round(day.suspicious * 0.7 * w),
    };
  });
}

// ---------------------------------------------------------------------------
// Security alerts (sorted newest first)
// ---------------------------------------------------------------------------

export const SECURITY_ALERTS = [
  // October 2026 (first five rows match the reference design)
  { id: 'SEC-2104', company: 'Metro Security Group', event: 'Brute Force Attack', type: 'Authentication', severity: 'Critical', ip: '198.162.1.20', timestamp: '2026-10-20T14:12', status: 'Open' },
  { id: 'SEC-2105', company: 'SecureGuard UK Ltd', event: 'Multiple Failed Logins', type: 'Authentication', severity: 'High', ip: '45.12.98.201', timestamp: '2026-10-20T13:58', status: 'Investigating' },
  { id: 'SEC-2106', company: 'City Watch Ltd', event: 'Suspicious IP Login', type: 'Suspicious Activity', severity: 'Medium', ip: '2.15.200.77', timestamp: '2026-10-20T12:44', status: 'Resolved' },
  { id: 'SEC-2107', company: 'SafeZone Services', event: 'Data Export Anomaly', type: 'Data Security', severity: 'High', ip: '10.0.1.50', note: 'User: John D.', timestamp: '2026-10-19T18:20', status: 'Investigating' },
  { id: 'SEC-2108', company: 'Northern Security', event: 'Inactive User Access', type: 'Access Control', severity: 'Low', ip: '213.56.12.10', timestamp: '2026-10-19T17:15', status: 'Open' },
  { id: 'SEC-2103', company: 'Elite Security Solutions', event: 'Password Reset Spike', type: 'Authentication', severity: 'Medium', ip: '82.31.44.9', timestamp: '2026-10-19T11:30', status: 'Resolved' },
  { id: 'SEC-2114', company: 'Beacon Protection', event: 'Unusual API Usage', type: 'Network Security', severity: 'Low', ip: '34.89.12.60', timestamp: '2026-10-18T09:05', status: 'Resolved' },
  { id: 'SEC-2109', company: 'Shield Security Group', event: 'Privilege Escalation Attempt', type: 'Access Control', severity: 'High', ip: '91.108.4.77', timestamp: '2026-10-16T22:40', status: 'Resolved' },
  { id: 'SEC-2110', company: 'Guardian Force Ltd', event: 'Geo-Blocked Login', type: 'Suspicious Activity', severity: 'Medium', ip: '103.21.244.5', timestamp: '2026-10-14T15:20', status: 'Resolved' },
  { id: 'SEC-2111', company: 'Prime Security UK', event: 'Dormant Account Login', type: 'Access Control', severity: 'Low', ip: '86.14.201.33', timestamp: '2026-10-10T08:10', status: 'Open' },
  { id: 'SEC-2112', company: 'SwiftGuard Services', event: 'Session Hijack Warning', type: 'Suspicious Activity', severity: 'Medium', ip: '5.62.18.140', timestamp: '2026-10-07T19:45', status: 'Investigating' },
  { id: 'SEC-2113', company: 'Metro Security Group', event: 'Ransomware Signature Blocked', type: 'Malware', severity: 'Critical', ip: '172.16.8.4', timestamp: '2026-10-03T13:15', status: 'Resolved' },

  // September 2026
  { id: 'SEC-2090', company: 'SwiftGuard Services', event: 'Brute Force Attack', type: 'Authentication', severity: 'High', ip: '185.220.101.4', timestamp: '2026-09-28T17:00', status: 'Resolved' },
  { id: 'SEC-2086', company: 'Prime Security UK', event: 'Suspicious IP Login', type: 'Suspicious Activity', severity: 'Medium', ip: '91.200.12.88', timestamp: '2026-09-21T10:30', status: 'Resolved' },
  { id: 'SEC-2081', company: 'Beacon Protection', event: 'Inactive User Access', type: 'Access Control', severity: 'Low', ip: '213.56.12.44', timestamp: '2026-09-14T16:10', status: 'Resolved' },
  { id: 'SEC-2077', company: 'Apex Guarding', event: 'Data Export Anomaly', type: 'Data Security', severity: 'High', ip: '10.0.4.12', timestamp: '2026-09-05T09:40', status: 'Investigating' },

  // August 2026
  { id: 'SEC-2070', company: 'Apex Guarding', event: 'Data Export Anomaly', type: 'Data Security', severity: 'Medium', ip: '10.0.4.19', timestamp: '2026-08-27T14:25', status: 'Resolved' },
  { id: 'SEC-2064', company: 'Harbour Security', event: 'Ransomware Signature Blocked', type: 'Malware', severity: 'Critical', ip: '172.16.9.31', timestamp: '2026-08-15T11:05', status: 'Resolved' },
  { id: 'SEC-2058', company: 'Citadel Services', event: 'Dormant Account Login', type: 'Access Control', severity: 'Low', ip: '86.14.77.2', timestamp: '2026-08-03T20:15', status: 'Resolved' },

  // Earlier months
  { id: 'SEC-2049', company: 'Ironside Patrol', event: 'Multiple Failed Logins', type: 'Authentication', severity: 'High', ip: '45.12.55.190', timestamp: '2026-07-24T07:50', status: 'Resolved' },
  { id: 'SEC-2043', company: 'Vigil Protect', event: 'Suspicious IP Login', type: 'Suspicious Activity', severity: 'Medium', ip: '2.15.88.140', timestamp: '2026-07-09T18:35', status: 'Resolved' },
  { id: 'SEC-2031', company: 'Bastion Guards', event: 'Inactive User Access', type: 'Access Control', severity: 'Low', ip: '213.56.30.8', timestamp: '2026-06-19T12:00', status: 'Resolved' },
  { id: 'SEC-2012', company: 'Metro Security Group', event: 'Brute Force Attack', type: 'Authentication', severity: 'High', ip: '198.162.4.41', timestamp: '2026-04-11T03:20', status: 'Resolved' },
  { id: 'SEC-1988', company: 'SecureGuard UK Ltd', event: 'Geo-Blocked Login', type: 'Suspicious Activity', severity: 'Medium', ip: '103.21.50.7', timestamp: '2026-01-22T21:10', status: 'Resolved' },
  { id: 'SEC-1950', company: 'Northern Security', event: 'Dormant Account Login', type: 'Access Control', severity: 'Low', ip: '86.14.12.90', timestamp: '2025-12-12T10:45', status: 'Resolved' },
].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
