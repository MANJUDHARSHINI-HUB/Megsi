
export const NAV = [
  {
    gk: null,
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'Home' },
    ],
  },
  {
    gk: 'g.tenants',
    items: [
      { id: 'companies', label: 'Companies', icon: 'Building2' },
      { id: 'plans', label: 'Subscription Plans', icon: 'Layers' },
      { id: 'billing', label: 'Tenant Billing', icon: 'FileText' },
      { id: 'usage', label: 'Usage & Limits', icon: 'Activity' },
      { id: 'onboarding', label: 'Onboarding', icon: 'UserPlus' },
      { id: 'suspended', label: 'Suspended Tenants', icon: 'Ban' },
    ],
  },
  {
    gk: 'g.users',
    items: [
      { id: 'pusers', label: 'Platform Users', icon: 'User' },
      { id: 'cadmins', label: 'Customer Admins', icon: 'UserCog' },
      { id: 'roles', label: 'Roles & Permissions', icon: 'Users' },
      { id: 'alogs', label: 'Access Logs', icon: 'ScrollText' },
      { id: 'support-access', label: 'Support Access', icon: 'FileKey' },
    ],
  },
  {
    gk: 'g.system',
    items: [
      { id: 'settings', label: 'System Settings', icon: 'Settings' },
      { id: 'integrations', label: 'Integrations', icon: 'Plug' },
      { id: 'email', label: 'Email & SMS', icon: 'Mail' },
      { id: 'security', label: 'Security & Compliance', icon: 'ShieldCheck' },
      { id: 'audit', label: 'Audit Logs', icon: 'FileSearch' },
      { id: 'data-backup', label: 'Data Backup', icon: 'Database' },
      { id: 'monitoring', label: 'System Monitoring', icon: 'Monitor' },
    ],
  },
  {
    gk: 'g.support',
    items: [
      { id: 'tickets', label: 'Support Tickets', icon: 'LifeBuoy' },
      { id: 'announce', label: 'Announcements', icon: 'Megaphone' },
      { id: 'feature-requests', label: 'Feature Requests', icon: 'ClipboardList' },
    ],
  },
];

// Companies: joined drives period filtering; tu (optional) = total users used for the Top Companies ranking.
export const COMPANIES = [
  { id: 1, name: 'SecureGuard UK Ltd', plan: 'Business', users: 120, sites: 18, status: 'Active', joined: '2026-10-20', tu: 210 },
  { id: 2, name: 'Metro Security Group', plan: 'Professional', users: 85, sites: 12, status: 'Active', joined: '2026-10-18', tu: 185 },
  { id: 3, name: 'SafeZone Services', plan: 'Business', users: 210, sites: 45, status: 'Active', joined: '2026-10-15', tu: 98 },
  { id: 4, name: 'Guardian Force Ltd', plan: 'Starter', users: 35, sites: 8, status: 'Trial', joined: '2026-10-12', tu: 120 },
  { id: 5, name: 'Elite Security Solutions', plan: 'Enterprise', users: 560, sites: 120, status: 'Active', joined: '2026-10-10' },
  { id: 6, name: 'Shield Security Group', plan: 'Business', users: 320, sites: 60, status: 'Active', joined: '2026-10-08' },
  { id: 7, name: 'Northern Security', plan: 'Professional', users: 48, sites: 9, status: 'Active', joined: '2026-10-05' },
  { id: 8, name: 'City Watch Ltd', plan: 'Business', users: 64, sites: 11, status: 'Active', joined: '2026-10-03' },
  { id: 9, name: 'OldGuard Security', plan: 'Starter', users: 22, sites: 4, status: 'Suspended', joined: '2026-09-28' },
  { id: 10, name: 'Prime Security UK', plan: 'Professional', users: 76, sites: 14, status: 'Active', joined: '2026-09-22' },
  { id: 11, name: 'SwiftGuard Services', plan: 'Business', users: 72, sites: 20, status: 'Active', joined: '2026-09-18' },
  { id: 12, name: 'Beacon Protection', plan: 'Starter', users: 18, sites: 3, status: 'Trial', joined: '2026-09-12' },
  { id: 13, name: 'Apex Guarding', plan: 'Professional', users: 90, sites: 16, status: 'Active', joined: '2026-08-26' },
  { id: 14, name: 'Harbour Security', plan: 'Business', users: 88, sites: 15, status: 'Active', joined: '2026-08-14' },
  { id: 15, name: 'Citadel Services', plan: 'Starter', users: 75, sites: 10, status: 'Active', joined: '2026-07-22' },
  { id: 16, name: 'Ironside Patrol', plan: 'Professional', users: 70, sites: 9, status: 'Active', joined: '2026-06-18' },
  { id: 17, name: 'Vigil Protect', plan: 'Starter', users: 60, sites: 7, status: 'Active', joined: '2026-05-09' },
  { id: 18, name: 'Bastion Guards', plan: 'Business', users: 55, sites: 8, status: 'Active', joined: '2026-03-30' },
];

export const SIGNUPS = [
  { id: 1, name: 'Northern Security', contact: 'Sarah Johnson', plan: 'Professional', status: 'Active', date: '2026-10-20' },
  { id: 2, name: 'City Watch Ltd', contact: 'Mark Thompson', plan: 'Starter', status: 'Active', date: '2026-10-19' },
  { id: 3, name: 'Shield Security Group', contact: 'Emma Clarke', plan: 'Business', status: 'Trial', date: '2026-10-18' },
  { id: 4, name: 'Prime Security UK', contact: 'James Wilson', plan: 'Professional', status: 'Active', date: '2026-10-17' },
  { id: 5, name: 'SwiftGuard Services', contact: 'Olivia Martin', plan: 'Business', status: 'Active', date: '2026-10-16' },
  { id: 6, name: 'Beacon Protection', contact: 'Daniel Reed', plan: 'Starter', status: 'Trial', date: '2026-10-14' },
  { id: 7, name: 'Halo Guarding', contact: 'Priya Shah', plan: 'Professional', status: 'Active', date: '2026-10-12' },
  { id: 8, name: 'Vanguard Patrol', contact: 'Tom Hughes', plan: 'Enterprise', status: 'Active', date: '2026-10-09' },
  { id: 9, name: 'Harbour Security', contact: 'Rachel Green', plan: 'Professional', status: 'Active', date: '2026-09-24' },
  { id: 10, name: 'Citadel Services', contact: 'Ben Carter', plan: 'Business', status: 'Active', date: '2026-09-15' },
  { id: 11, name: 'OldGuard Security', contact: 'Henry Ford', plan: 'Starter', status: 'Trial', date: '2026-09-02' },
  { id: 12, name: 'Apex Guarding', contact: 'Lucy Adams', plan: 'Professional', status: 'Active', date: '2026-08-24' },
  { id: 13, name: 'Ironside Patrol', contact: 'Noah Evans', plan: 'Starter', status: 'Active', date: '2026-06-16' },
];

export const USERS = [
  'David Miller',
  'Sarah Johnson',
  'Mark Thompson',
  'Emma Clarke',
  'James Wilson',
  'Olivia Martin',
];

// Totals before the first month below (used for interpolation / change calculations).
export const BASE = {
  companies: 7,
  users: 1100,
  sites: 560,
};

// companies/users/sites = running totals at END of month;
// guards/incidents/revenue = values for that month.
const m = (companies, users, sites, guards, incidents, revenue) => ({
  companies,
  users,
  sites,
  guards,
  incidents,
  revenue,
});

export const MONTHLY = {
  '2025-11': m(10, 1350, 600, 12100, 510, 9800),
  '2025-12': m(13, 1640, 660, 13000, 530, 11200),
  '2026-01': m(17, 1950, 720, 14200, 498, 12900),
  '2026-02': m(21, 2230, 790, 15000, 480, 14600),
  '2026-03': m(25, 2480, 850, 16300, 495, 16400),
  '2026-04': m(30, 2680, 920, 17500, 470, 18300),
  '2026-05': m(35, 2820, 980, 18700, 480, 19900),
  '2026-06': m(40, 2900, 1040, 19800, 472, 21000),
  '2026-07': m(44, 3030, 1080, 20400, 468, 21900),
  '2026-08': m(47, 3150, 1105, 20900, 470, 22700),
  '2026-09': m(50, 3256, 1132, 21462, 465, 23320),
  '2026-10': m(56, 3842, 1245, 24680, 428, 28450),
};

export const PLAN_MIX = [
  { name: 'Starter', w: 18, color: '#0758F9' },
  { name: 'Professional', w: 22, color: '#079447' },
  { name: 'Business', w: 12, color: '#7909E8' },
  { name: 'Enterprise', w: 4, color: '#F59E0B' },
];

// Activity colour/icon mapping by event kind (green / blue / orange / red).
export const KIND = {
  company: { c: 'green', icon: 'Building2' },
  user: { c: 'green', icon: 'UserPlus' },
  upgrade: { c: 'blue', icon: 'TrendingUp' },
  info: { c: 'blue', icon: 'Info' },
  payment: { c: 'orange', icon: 'CreditCard' },
  ticket: { c: 'orange', icon: 'MessageSquare' },
  attention: { c: 'orange', icon: 'AlertCircle' },
  suspend: { c: 'red', icon: 'AlertTriangle' },
  failed: { c: 'red', icon: 'XCircle' },
};

export const ACTIVITY = [
  {
    ts: '2026-10-20T14:32',
    kind: 'company',
    k: 'act.company',
    p: { name: 'Northern Security' },
  },
  {
    ts: '2026-10-20T12:10',
    kind: 'upgrade',
    k: 'act.upgrade',
    p: { name: 'City Watch Ltd', plan: 'Business' },
  },
  {
    ts: '2026-10-20T11:45',
    kind: 'user',
    k: 'act.user',
    p: { name: 'Sarah Johnson' },
  },
  {
    ts: '2026-10-20T10:20',
    kind: 'payment',
    k: 'act.payment',
    p: { amount: '£2,499', name: 'Metro Security Group' },
  },
  {
    ts: '2026-10-20T09:15',
    kind: 'ticket',
    k: 'act.ticket',
    p: { id: '#TKT-1045' },
  },
  {
    ts: '2026-10-19T18:30',
    kind: 'suspend',
    k: 'act.suspend',
    p: { name: 'OldGuard Security' },
  },
  {
    ts: '2026-10-19T03:00',
    kind: 'info',
    k: 'act.backup',
    p: {},
  },
  {
    ts: '2026-10-18T16:42',
    kind: 'attention',
    k: 'act.downgrade',
    p: { name: 'Beacon Protection', plan: 'Starter' },
  },
  {
    ts: '2026-09-26T15:20',
    kind: 'failed',
    k: 'act.backupFailed',
    p: {},
  },
  {
    ts: '2026-09-24T09:30',
    kind: 'company',
    k: 'act.company',
    p: { name: 'Harbour Security' },
  },
  {
    ts: '2026-09-15T13:00',
    kind: 'payment',
    k: 'act.payment',
    p: { amount: '£1,899', name: 'Citadel Services' },
  },
  {
    ts: '2026-09-02T11:11',
    kind: 'ticket',
    k: 'act.ticket',
    p: { id: '#TKT-1012' },
  },
  {
    ts: '2026-08-26T10:00',
    kind: 'company',
    k: 'act.company',
    p: { name: 'Apex Guarding' },
  },
  {
    ts: '2026-08-14T16:05',
    kind: 'upgrade',
    k: 'act.upgrade',
    p: { name: 'SafeZone Services', plan: 'Business' },
  },
  {
    ts: '2026-07-22T12:40',
    kind: 'company',
    k: 'act.company',
    p: { name: 'Citadel Services' },
  },
  {
    ts: '2026-06-18T09:50',
    kind: 'user',
    k: 'act.user',
    p: { name: 'Noah Evans' },
  },
];

export const HEALTH = {
  metrics: [
    { k: 'uptime', value: '99.98%', icon: 'Database', c: 'blue' },
    { k: 'api', value: '245 ms', icon: 'Zap', c: 'orange' },
    { k: 'db', value: '12%', icon: 'TrendingUp', c: 'blue' },
    { k: 'sessions', value: '342', icon: 'Users', c: 'blue' },
  ],
  services: [
    { k: 'svc.app', checked: '2026-10-20T14:30' },
    { k: 'svc.db', checked: '2026-10-20T14:30' },
    { k: 'svc.email', checked: '2026-10-20T14:28' },
  ],
};

export const NOTIFICATIONS = [
  {
    k: 'act.company',
    p: { name: 'Northern Security' },
    ago: ['ago.m', 2],
  },
  {
    k: 'act.payment',
    p: { amount: '£2,499', name: 'Metro Security Group' },
    ago: ['ago.h', 1],
  },
  {
    k: 'n.ticket',
    p: { id: '#TKT-1045' },
    ago: ['ago.h', 2],
  },
  {
    k: 'act.suspend',
    p: { name: 'OldGuard Security' },
    ago: ['ago.d', 1],
  },
  {
    k: 'n.backup',
    p: {},
    ago: ['ago.d', 1],
  },
];

// SAMPLE DATA (demo tracking) - illustrative only, not real business data.
// status: 'Purchased' | 'Demo Active' | 'Interested' | 'Pending'
// Company names/contacts reuse COMPANIES / SIGNUPS; the two Purchased amounts match the payment events in ACTIVITY.
export const DEMO_TRACKING = [
  { id: 1, company: 'Metro Security Group', status: 'Purchased', demoStart: '2026-10-06', date: '2026-10-20', amount: 2499 },
  { id: 2, company: 'Shield Security Group', status: 'Interested', demoStart: '2026-10-18', date: '2026-10-18', amount: 0 },
  { id: 3, company: 'Beacon Protection', status: 'Demo Active', demoStart: '2026-10-14', date: '2026-10-14', amount: 0 },
  { id: 4, company: 'Guardian Force Ltd', status: 'Demo Active', demoStart: '2026-10-12', date: '2026-10-12', amount: 0 },
  { id: 5, company: 'OldGuard Security', status: 'Pending', demoStart: '2026-09-02', date: '2026-09-02', amount: 0 },
  { id: 6, company: 'Citadel Services', status: 'Purchased', demoStart: '2026-09-01', date: '2026-09-15', amount: 1899 },
  { id: 7, company: 'SecureGuard UK Ltd', status: 'Pending', demoStart: '2026-08-28', date: '2026-08-30', amount: 0 },
  { id: 8, company: 'SafeZone Services', status: 'Interested', demoStart: '2026-08-16', date: '2026-08-18', amount: 0 },
  { id: 9, company: 'Elite Security Solutions', status: 'Demo Active', demoStart: '2026-08-03', date: '2026-08-05', amount: 0 },
  { id: 10, company: 'Northern Security', status: 'Interested', demoStart: '2026-07-25', date: '2026-07-27', amount: 0 },
  { id: 11, company: 'City Watch Ltd', status: 'Demo Active', demoStart: '2026-07-12', date: '2026-07-14', amount: 0 },
  { id: 12, company: 'Prime Security UK', status: 'Pending', demoStart: '2026-06-28', date: '2026-06-30', amount: 0 },
];

export const LANGS = [
  { code: 'en', short: 'EN', name: 'English' },
  { code: 'fr', short: 'FR', name: 'Français' },
  { code: 'de', short: 'DE', name: 'Deutsch' },
];
