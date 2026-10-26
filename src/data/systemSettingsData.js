// Demo data for the System Settings page. No backend exists yet, so every value here is illustrative.

export const SETTINGS_STORAGE_KEY = 'megsi.systemSettings.v1';

export const PERIOD_OPTIONS = ['Last 30 Days', 'Last 3 Months', 'Last 6 Months', 'Last 11 Months', 'Last 12 Months', 'Last 24 Months'];
export const PLAN_FILTERS = ['All Plans', 'Starter', 'Professional', 'Business', 'Enterprise'];
export const TREND_RANGES = ['Last 24 hours', 'Last 7 days', 'Last 30 days'];
export const BACKUP_SCHEDULES = ['None', 'Daily', 'Weekly', 'Monthly'];
export const USAGE_POLICIES = ['Tracked', 'Untracked'];
export const FLAG_STATUS_CYCLE = ['Active', 'Trial', 'Disabled'];

export const GENERAL_TOGGLES = [
  { key: 'maintenance', label: 'Maintenance Mode', desc: 'Temporarily restrict tenant access during maintenance.' },
  { key: 'api', label: 'API Access', desc: 'Allow tenants to connect through the open platform API.' },
  { key: 'emailSending', label: 'Email Sending', desc: 'Send system emails and notifications to platform users.' },
  { key: 'emailNotifications', label: 'Email Notifications', desc: '' },
];

export const TENANT_TOGGLES = [
  { key: 'features', label: 'Global Tenant Features' },
  { key: 'reports', label: 'Global Tenant Reports' },
  { key: 'permissions', label: 'Global Tenant Permissions' },
  { key: 'limits', label: 'Global Tenant Limits' },
  { key: 'effects', label: 'Global Tenant Effects' },
  { key: 'managers', label: 'Tenant Manager Console' },
];

export const DEFAULT_SETTINGS = {
  general: { maintenance: false, api: true, emailSending: true, emailNotifications: false },
  tenant: { features: true, reports: true, permissions: true, limits: true, effects: true, managers: true },
  storage: { usagePolicy: 'Tracked', backupSchedule: 'None' },
  flags: { cpu: 'Active', memory: 'Active', latency: 'Trial', network: 'Active' },
  periods: { general: 'Last 11 Months', tenant: 'Last 12 Months', flags: 'Last 12 Months', trend: 'Last 24 hours', plan: 'All Plans' },
};

export const FEATURE_FLAGS = [
  { key: 'cpu', feature: 'Global CPU Usage', plan: 'Professional' },
  { key: 'memory', feature: 'Memory Allocation', plan: 'Starter' },
  { key: 'latency', feature: 'Database Latency', plan: 'Trial' },
  { key: 'network', feature: 'Network Throughput', plan: 'Enterprise' },
];

/* ---------------------------------------------------------------- gauges
   fill = value / max (0..1). Delta tone is "up" (green) or "down" (red). */
const g = (key, label, value, display, max, note, dir, pct, tone) => ({ key, label, value, display, max, note, dir, pct, tone });
export const GAUGES_BY_PLAN = {
  'All Plans': [
    g('cpu', 'Global CPU Usage', 24, '24%', 100, '< 24%', 'up', 25, 'up'),
    g('memory', 'Memory Allocation', 42, '42%', 100, '22.2 GB', 'up', 100, 'up'),
    g('latency', 'Database Latency', 18, '18ms', 30, '12.0%', 'up', 88, 'down'),
    g('network', 'Network Throughput', 1.2, '1.2GB/s', 3, '< 4.6%', 'up', 100, 'up'),
  ],
  Starter: [
    g('cpu', 'Global CPU Usage', 17, '17%', 100, '< 20%', 'up', 8, 'up'),
    g('memory', 'Memory Allocation', 31, '31%', 100, '6.4 GB', 'up', 12, 'up'),
    g('latency', 'Database Latency', 11, '11ms', 30, '4.2%', 'down', 6, 'up'),
    g('network', 'Network Throughput', 0.4, '0.4GB/s', 3, '< 1.1%', 'up', 14, 'up'),
  ],
  Professional: [
    g('cpu', 'Global CPU Usage', 29, '29%', 100, '< 30%', 'up', 18, 'up'),
    g('memory', 'Memory Allocation', 47, '47%', 100, '9.8 GB', 'up', 34, 'up'),
    g('latency', 'Database Latency', 16, '16ms', 30, '8.5%', 'up', 41, 'down'),
    g('network', 'Network Throughput', 0.9, '0.9GB/s', 3, '< 2.8%', 'up', 62, 'up'),
  ],
  Business: [
    g('cpu', 'Global CPU Usage', 38, '38%', 100, '< 40%', 'up', 27, 'up'),
    g('memory', 'Memory Allocation', 58, '58%', 100, '13.1 GB', 'up', 71, 'up'),
    g('latency', 'Database Latency', 21, '21ms', 30, '15.3%', 'up', 93, 'down'),
    g('network', 'Network Throughput', 1.6, '1.6GB/s', 3, '< 5.2%', 'up', 88, 'up'),
  ],
  Enterprise: [
    g('cpu', 'Global CPU Usage', 54, '54%', 100, '< 60%', 'up', 33, 'up'),
    g('memory', 'Memory Allocation', 71, '71%', 100, '18.9 GB', 'up', 85, 'up'),
    g('latency', 'Database Latency', 26, '26ms', 30, '22.6%', 'up', 97, 'down'),
    g('network', 'Network Throughput', 2.4, '2.4GB/s', 3, '< 7.9%', 'up', 100, 'up'),
  ],
};

/* ---------------------------------------------------------------- utilisation trends (values in thousands) */
const hrs = Array.from({ length: 17 }, (_, i) => {
  const mins = i * 90; // every 1.5h, ticks drawn on every second point => 00:00, 03:00 ... 24:00
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
});
export const TREND_DATA = {
  'Last 24 hours': {
    tickEvery: 2,
    legend: [['Global CPU Usage', '1.82%', 'up'], ['Database Latency', '0.39%', 'up']],
    points: hrs.map((t, i) => ({
      t,
      cpu: [8, 12.5, 7, 19.5, 6.5, 20, 9.5, 12.5, 27.5, 15, 13.5, 22, 11, 17, 12, 15, 24][i],
      db: [3, 4.2, 3.4, 6.5, 3.8, 6, 3.6, 5, 9, 6, 5.4, 7.4, 4.4, 6.2, 5, 5.6, 7.8][i],
    })),
  },
  'Last 7 days': {
    tickEvery: 1,
    legend: [['Global CPU Usage', '3.41%', 'up'], ['Database Latency', '0.82%', 'down']],
    points: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'].map((t, i) => ({
      t,
      cpu: [14, 18.5, 22, 25.5, 12, 9.5, 21][i],
      db: [5, 6.4, 7.2, 8.6, 4.2, 3.6, 7][i],
    })),
  },
  'Last 30 days': {
    tickEvery: 2,
    legend: [['Global CPU Usage', '5.07%', 'up'], ['Database Latency', '1.26%', 'up']],
    points: ['Sep 27', 'Sep 29', 'Oct 1', 'Oct 3', 'Oct 5', 'Oct 7', 'Oct 9', 'Oct 11', 'Oct 13', 'Oct 15', 'Oct 17', 'Oct 19', 'Oct 21', 'Oct 23', 'Oct 26'].map((t, i) => ({
      t,
      cpu: [11, 15, 13, 19, 16, 22, 18, 24, 20, 17, 23, 26, 21, 24.5, 27][i],
      db: [4, 5.2, 4.6, 6.4, 5.4, 7.4, 6.2, 8.2, 6.8, 5.8, 7.8, 8.8, 7.2, 8.4, 9.2][i],
    })),
  },
};

/* ---------------------------------------------------------------- storage & backup */
export const STORAGE_USED_GB = 266.8;
export const STORAGE_CAPACITY_GB = 500;
export const STORAGE_POLICY_DETAILS = [
  ['Retention period', '90 days'],
  ['Encryption at rest', 'AES-256 (enabled)'],
  ['Backup region', 'UK South'],
  ['Point-in-time recovery', 'Disabled'],
  ['Last verified restore', '12 Oct 2026 03:10'],
];

/* ---------------------------------------------------------------- recent configuration changes (newest first) */
export const CONFIG_CHANGES = [
  { id: 1, company: 'Northern Security', icon: 'Shield', contact: 'Sarah Hampson', plan: 'Professional', status: 'Active', date: '2026-10-20 14:30', change: 'Enabled API access' },
  { id: 2, company: 'City Watch Ltd', icon: 'Landmark', contact: 'Mark Thompson', plan: 'Starter', status: 'Active', date: '2026-10-20 14:30', change: 'Updated email sending limits' },
  { id: 3, company: 'Shield Security Group', icon: 'ShieldCheck', contact: 'Emma Collins', plan: 'Professional', status: 'Trial', date: '2026-10-10 14:30', change: 'Changed backup schedule to Weekly' },
  { id: 4, company: 'Prime Security UK', icon: 'Lock', contact: 'James Wilson', plan: 'Business', status: 'Active', date: '2026-10-10 14:30', change: 'Enabled tenant reports' },
  { id: 5, company: 'Guardian Watch Ltd', icon: 'Shield', contact: 'Olivia Bennett', plan: 'Business', status: 'Active', date: '2026-10-08 11:15', change: 'Raised storage quota' },
  { id: 6, company: 'Sentinel Protect', icon: 'ShieldCheck', contact: 'Daniel Foster', plan: 'Starter', status: 'Trial', date: '2026-10-06 16:45', change: 'Disabled maintenance mode' },
  { id: 7, company: 'Apex Guarding', icon: 'Landmark', contact: 'Priya Shah', plan: 'Enterprise', status: 'Active', date: '2026-10-03 09:20', change: 'Updated tenant permissions' },
  { id: 8, company: 'Britannia Secure', icon: 'Lock', contact: 'Thomas Reed', plan: 'Professional', status: 'Active', date: '2026-09-29 13:05', change: 'Enabled email notifications' },
  { id: 9, company: 'Beacon Patrol Services', icon: 'Shield', contact: 'Hannah Clarke', plan: 'Starter', status: 'Suspended', date: '2026-09-24 10:40', change: 'Restricted API access' },
  { id: 10, company: 'Ironclad Security', icon: 'ShieldCheck', contact: 'Marcus Doyle', plan: 'Business', status: 'Active', date: '2026-09-18 15:55', change: 'Changed retention to 90 days' },
  { id: 11, company: 'Harbour Guard Ltd', icon: 'Landmark', contact: 'Chloe Martin', plan: 'Professional', status: 'Active', date: '2026-09-12 08:30', change: 'Enabled tenant manager console' },
  { id: 12, company: 'Vanguard UK', icon: 'Lock', contact: 'Ben Whitaker', plan: 'Enterprise', status: 'Active', date: '2026-09-05 17:10', change: 'Updated tenant limits' },
];