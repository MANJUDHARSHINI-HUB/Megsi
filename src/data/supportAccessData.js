/* Mock data for the Support Access page (swap for API calls when a backend exists). */

export const ACCESS_TYPES = ['Temporary Admin', 'Read Only', 'Emergency Access', 'Admin Access', 'API Support'];
export const REQUEST_STATUSES = ['Approved', 'Pending', 'Rejected', 'Expired', 'Revoked'];
export const COMPANY_NAMES = ['SecureGuard UK Ltd', 'Metro Security Group', 'City Watch Ltd', 'Shield Security Group', 'Prime Security UK', 'Elite Security Solutions', 'SafeZone Services', 'Northern Security'];

const R = (id, company, by, type, hours, status, date, time) => ({ id, company, by, type, hours, status, date, time });

// newest first; the first five rows are what the reference shows in "Recent Support Access Requests"
export const SEED_REQUESTS = [
  R('SA-1001', 'SecureGuard UK Ltd', 'David Wilson', 'Temporary Admin', 4, 'Approved', '2026-10-20', '14:32'),
  R('SA-1002', 'Metro Security Group', 'Emma Clarke', 'Read Only', 2, 'Pending', '2026-10-20', '13:58'),
  R('SA-1003', 'City Watch Ltd', 'James Allen', 'Emergency Access', 6, 'Approved', '2026-10-20', '12:40'),
  R('SA-1004', 'Shield Security Group', 'Sarah Jones', 'Admin Access', 8, 'Rejected', '2026-10-19', '17:05'),
  R('SA-1005', 'Prime Security UK', 'Mark Thompson', 'Temporary Admin', 3, 'Approved', '2026-10-19', '15:21'),
  R('SA-0998', 'Elite Security Solutions', 'Olivia Hart', 'Temporary Admin', 4, 'Approved', '2026-10-20', '12:18'),
  R('SA-0997', 'Metro Security Group', 'Daniel Reed', 'Emergency Access', 2, 'Approved', '2026-10-20', '11:03'),
  R('SA-0996', 'SafeZone Services', 'Priya Nair', 'Read Only', 6, 'Pending', '2026-10-19', '19:12'),
  R('SA-0995', 'Northern Security', 'Tom Bradley', 'Admin Access', 8, 'Rejected', '2026-10-19', '18:20'),
  R('SA-0994', 'City Watch Ltd', 'Lucy Marsh', 'API Support', 12, 'Approved', '2026-10-18', '10:44'),
  R('SA-0993', 'SecureGuard UK Ltd', 'Henry Cole', 'Read Only', 2, 'Expired', '2026-10-17', '16:30'),
  R('SA-0992', 'Shield Security Group', 'Grace Miles', 'Temporary Admin', 4, 'Expired', '2026-10-16', '09:15'),
  R('SA-0991', 'Elite Security Solutions', 'Noah Pierce', 'Emergency Access', 3, 'Revoked', '2026-10-15', '22:08'),
  R('SA-0990', 'Prime Security UK', 'Ella Brown', 'Read Only', 4, 'Approved', '2026-10-14', '11:52'),
  R('SA-0989', 'Metro Security Group', 'Jack Turner', 'Admin Access', 6, 'Pending', '2026-10-13', '14:09'),
  R('SA-0988', 'SafeZone Services', 'Amelia Ford', 'Temporary Admin', 2, 'Approved', '2026-10-12', '08:47'),
  R('SA-0987', 'Northern Security', 'Oscar Hayes', 'API Support', 8, 'Approved', '2026-10-10', '13:26'),
  R('SA-0986', 'City Watch Ltd', 'Mia Fletcher', 'Read Only', 3, 'Expired', '2026-10-08', '15:55'),
  R('SA-0985', 'SecureGuard UK Ltd', 'Leo Barker', 'Emergency Access', 5, 'Approved', '2026-10-06', '20:31'),
  R('SA-0984', 'Shield Security Group', 'Chloe Shaw', 'Temporary Admin', 4, 'Rejected', '2026-10-03', '10:12'),
  R('SA-0983', 'Elite Security Solutions', 'Ryan Cooper', 'Read Only', 2, 'Approved', '2026-09-29', '09:40'),
  R('SA-0982', 'Prime Security UK', 'Zara Khan', 'Admin Access', 8, 'Rejected', '2026-09-26', '16:18'),
  R('SA-0981', 'Metro Security Group', 'Ben Walker', 'Temporary Admin', 3, 'Approved', '2026-09-22', '12:05'),
  R('SA-0980', 'City Watch Ltd', 'Isla Grant', 'API Support', 12, 'Expired', '2026-09-18', '11:27'),
];

// Live sessions. `engaged` = hands-on right now (drives the "N Active" pill); all of them are connected.
export const SEED_SESSIONS = [
  { id: 1, engineer: 'Alex Reed', company: 'Metro Security', started: '09:32', mins: 135, avatar: 'photo', tone: 0, engaged: true, request: 'SA-0997' },
  { id: 2, engineer: 'Lisa Turner', company: 'City Watch Ltd', started: '11:05', mins: 55, avatar: 'photo', tone: 1, engaged: true, request: 'SA-0994' },
  { id: 3, engineer: 'John Parker', company: 'Prime Security', started: '10:18', mins: 102, avatar: 'photo', tone: 2, engaged: true, request: 'SA-1005' },
  { id: 4, engineer: 'Kevin Brooks', company: 'SecureGuard UK', started: '08:51', mins: 192, avatar: 'KB', engaged: false, request: 'SA-1001' },
  { id: 5, engineer: 'Rachel Green', company: 'Elite Security', started: '12:20', mins: 28, avatar: 'RG', engaged: false, request: 'SA-0998' },
];

export const fmtMins = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`);

// Timeline seed (newest first). `kind` picks the icon/colour.
export const SEED_EVENTS = [
  { id: 'e1', kind: 'approved', text: 'Support request approved: SA-1001', at: '2026-10-20T14:32' },
  { id: 'e2', kind: 'started', text: 'Support session started: Alex Reed', at: '2026-10-20T13:45' },
  { id: 'e3', kind: 'extended', text: 'Access extended: SA-0998', at: '2026-10-20T12:18' },
  { id: 'e4', kind: 'emergency', text: 'Emergency access activated: SA-0997', at: '2026-10-20T11:03' },
  { id: 'e5', kind: 'closed', text: 'Support session closed: Lisa Turner', at: '2026-10-20T09:56' },
  { id: 'e6', kind: 'rejected', text: 'Support request rejected: SA-0995', at: '2026-10-19T18:20' },
  { id: 'e7', kind: 'approved', text: 'Support request approved: SA-1005', at: '2026-10-19T15:21' },
  { id: 'e8', kind: 'rejected', text: 'Support request rejected: SA-1004', at: '2026-10-19T17:05' },
  { id: 'e9', kind: 'approved', text: 'Support request approved: SA-0994', at: '2026-10-18T10:44' },
  { id: 'e10', kind: 'closed', text: 'Support session closed: Henry Cole', at: '2026-10-17T17:02' },
  { id: 'e11', kind: 'approved', text: 'Support request approved: SA-0983', at: '2026-09-29T09:40' },
];

/* ---- charts ---- */
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const TREND = {
  requested: [17, 35, 33, 44, 44, 54, 53, 62, 66, 79, 87, 89],
  approved: [9, 18, 23, 28, 31, 35, 39, 46, 44, 56, 64, 66],
  rejected: [7, 7, 7, 11, 16, 18, 19, 17, 22, 19, 29, 35],
};
export const TREND_RANGES = { 'Last 12 Months': 12, 'Last 6 Months': 6, 'Last 3 Months': 3 };

export const DIST_COLORS = { Temporary: '#0065EF', Emergency: '#08994E', Full: '#930AF0', Read: '#FB8F09', Api: '#7F0FED' };
export const DIST_LEGEND = [
  { key: 'Temporary', label: 'Temporary Access', color: '#0065EF' },
  { key: 'Emergency', label: 'Emergency Access', color: '#08994E' },
  { key: 'Full', label: 'Full Administrative', color: '#930AF0' },
  { key: 'Read', label: 'Read Only', color: '#FB8F09' },
  { key: 'Api', label: 'API Support Access', color: '#7F0FED' },
];
// Slice geometry copied from the reference ring (clockwise from 12 o'clock); `of` ties a slice to its legend entry.
export const DIST_SLICES = [
  { of: 'Temporary', w: 42, color: '#025CF1' },
  { of: 'Emergency', w: 18, color: '#059750' },
  { of: 'Read', w: 18, color: '#FB8904' },
  { of: 'Full', w: 10, color: '#A656F3' },
  { of: 'Full', w: 5, color: '#A399D5' },
  { of: 'Api', w: 4, color: '#8DB6E8' },
  { of: 'Read', w: 3, color: '#FC9304' },
];
export const DIST_TENANTS = {
  'All Tenants': { total: 481, pct: { Temporary: 42, Emergency: 18, Full: 22, Read: 13, Api: 5 } },
  'Metro Security Group': { total: 120, pct: { Temporary: 38, Emergency: 22, Full: 20, Read: 14, Api: 6 } },
  'Shield Security Group': { total: 98, pct: { Temporary: 45, Emergency: 12, Full: 25, Read: 12, Api: 6 } },
  'SecureGuard UK Ltd': { total: 76, pct: { Temporary: 40, Emergency: 20, Full: 21, Read: 15, Api: 4 } },
  'Elite Security Solutions': { total: 64, pct: { Temporary: 44, Emergency: 16, Full: 23, Read: 12, Api: 5 } },
  'City Watch Ltd': { total: 52, pct: { Temporary: 46, Emergency: 15, Full: 22, Read: 12, Api: 5 } },
};

export const DURATION_BUCKETS = ['Under 1 Hour', '1 - 2 Hours', '2 - 4 Hours', '4 - 8 Hours', '8+ Hours'];
export const DURATION_DATA = {
  'This Month': [68, 52, 36, 24, 14],
  'Last Month': [61, 49, 41, 28, 11],
  'Last 3 Months': [182, 147, 118, 79, 35],
};

export const MOST_ACCESSED = {
  'Last 30 Days': [['Metro Security Group', 120], ['Shield Security Group', 98], ['SecureGuard UK Ltd', 76], ['Elite Security Solutions', 64], ['City Watch Ltd', 52]],
  'Last 7 Days': [['Metro Security Group', 34], ['SecureGuard UK Ltd', 29], ['Shield Security Group', 22], ['City Watch Ltd', 17], ['Elite Security Solutions', 13]],
  'Last 90 Days': [['Metro Security Group', 342], ['Shield Security Group', 288], ['Elite Security Solutions', 231], ['SecureGuard UK Ltd', 214], ['City Watch Ltd', 160]],
};

export const COMPLIANCE = [
  { id: 'mfa', label: 'MFA Enabled', value: '99.4%', tone: 'green', note: '99.4% of support engineers have multi-factor authentication enforced. Two accounts are pending enrolment.' },
  { id: 'reviews', label: 'Access Reviews', value: '95%', tone: 'blue', note: '95% of privileged access grants were reviewed within their review window this quarter.' },
  { id: 'rec', label: 'Session Recording', value: '100%', tone: 'purple', note: 'Every privileged support session is recorded and retained for 12 months.' },
  { id: 'unauth', label: 'Unauthorized Attempts', value: '12', tone: 'orange', note: '12 blocked attempts to start a support session without an approved request in the selected period.' },
  { id: 'crit', label: 'Critical Violations', value: '1', tone: 'red', note: '1 critical policy violation is open and assigned to the Security team for review.' },
];

export const HEALTH = [
  'Temporary Access Controls', 'Audit Logging',
  'Approval Workflow', 'Customer Notifications',
  'Session Recording', 'Integration Services',
];

/* KPI baselines (the month-to-date numbers in the reference). Live changes are layered on top. */
export const KPI_BASE = { active: 42, approved: 186, pending: 23, expired: 17, engineers: 58, emergency: 6 };

export const pad = (n) => String(n).padStart(2, '0');
export const nowIso = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };