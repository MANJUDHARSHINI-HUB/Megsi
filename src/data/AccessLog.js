/**
 * MEGSI – Access Logs mock data (frontend demonstration only).
 *
 * IMPORTANT
 *  - Every record below is generated, illustrative data. None of it is a real
 *    production log. All people are fictional UK names, all companies are
 *    fictional, and all IP addresses come from the reserved documentation
 *    ranges (RFC 5737: 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24).
 *  - No passwords, tokens or session secrets are ever part of a record.
 *  - Data is generated from a fixed seed, so it is stable between reloads,
 *    while timestamps are expressed relative to "now" so the date-range
 *    filters (Today, Last 7 Days, Last 30 Days …) always have data.
 *
 * REPLACING WITH A REAL BACKEND
 *  The UI only talks to `fetchAccessLogs()` at the bottom of this file.
 *  Replace its body with an API call that resolves to the same shape:
 *    { logs: AccessLog[], companies: Company[], users: User[] }
 *  Every AccessLog field used by the UI is documented in `buildAccessLogs`.
 */

/* ------------------------------------------------------------------ */
/* Static option lists used by the UI                                  */
/* ------------------------------------------------------------------ */

export const EVENT_TYPES = [
  'Login',
  'Logout',
  'Access',
  'Create',
  'Update',
  'Delete',
  'View',
  'Export',
  'Permission Change',
];

export const STATUS_OPTIONS = ['Success', 'Failed', 'Denied'];

export const DATE_RANGE_OPTIONS = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
  { key: '90d', label: 'Last 90 Days' },
  { key: 'custom', label: 'Custom Date Range' },
];

export const PAGE_SIZE_OPTIONS = [10, 25, 50];

/* ------------------------------------------------------------------ */
/* Companies (tenants) – fictional UK security firms                   */
/* ------------------------------------------------------------------ */

export const COMPANIES = [
  { id: 'CMP-1001', name: 'Sentinel Guard Services Ltd', plan: 'Enterprise', tenantRef: 'TEN-LDN-1001', city: 'London' },
  { id: 'CMP-1002', name: 'Ironside Security Group', plan: 'Professional', tenantRef: 'TEN-MAN-1002', city: 'Manchester' },
  { id: 'CMP-1003', name: 'Thames Shield Security', plan: 'Enterprise', tenantRef: 'TEN-LDN-1003', city: 'London' },
  { id: 'CMP-1004', name: 'Northgate Protection Ltd', plan: 'Professional', tenantRef: 'TEN-LDS-1004', city: 'Leeds' },
  { id: 'CMP-1005', name: 'Pennine Patrol Services', plan: 'Starter', tenantRef: 'TEN-SHF-1005', city: 'Sheffield' },
  { id: 'CMP-1006', name: 'Caledonian Security Solutions', plan: 'Professional', tenantRef: 'TEN-EDI-1006', city: 'Edinburgh' },
  { id: 'CMP-1007', name: 'Harbourview Guarding Ltd', plan: 'Starter', tenantRef: 'TEN-BRS-1007', city: 'Bristol' },
  { id: 'CMP-1008', name: 'Albion Event Security', plan: 'Professional', tenantRef: 'TEN-BHM-1008', city: 'Birmingham' },
];

/* ------------------------------------------------------------------ */
/* Users – fictional UK names                                          */
/* ------------------------------------------------------------------ */

const DEVICES = {
  winChrome: { browser: 'Chrome 130', os: 'Windows 11', device: 'Desktop' },
  winEdge: { browser: 'Edge 130', os: 'Windows 10', device: 'Desktop' },
  macSafari: { browser: 'Safari 18', os: 'macOS Sonoma', device: 'Desktop' },
  macChrome: { browser: 'Chrome 130', os: 'macOS Sequoia', device: 'Laptop' },
  androidChrome: { browser: 'Chrome Mobile 130', os: 'Android 14', device: 'Mobile' },
  iphone: { browser: 'Safari Mobile 18', os: 'iOS 18', device: 'Mobile' },
  tablet: { browser: 'Safari 18', os: 'iPadOS 18', device: 'Tablet' },
};

// [id, name, role, companyId|null, deviceKey, location, accountStatus]
const USER_ROWS = [
  ['USR-1001', 'Oliver Whitmore', 'Super Admin', null, 'macChrome', 'London, United Kingdom', 'Active'],
  ['USR-1002', 'Harriet Ashworth', 'Super Admin', null, 'winChrome', 'London, United Kingdom', 'Active'],
  ['USR-1003', 'Callum Reid', 'Support Agent', null, 'winEdge', 'Glasgow, United Kingdom', 'Active'],
  ['USR-1004', 'Freya Donovan', 'Support Agent', null, 'macSafari', 'Cardiff, United Kingdom', 'Active'],

  ['USR-2001', 'Edward Pemberton', 'Company Admin', 'CMP-1001', 'winChrome', 'London, United Kingdom', 'Active'],
  ['USR-2002', 'Charlotte Bligh', 'Site Manager', 'CMP-1001', 'tablet', 'Croydon, United Kingdom', 'Active'],
  ['USR-2003', 'Jack Thornley', 'Security Officer', 'CMP-1001', 'androidChrome', 'London, United Kingdom', 'Active'],

  ['USR-2004', 'Imogen Fairclough', 'Company Admin', 'CMP-1002', 'macChrome', 'Manchester, United Kingdom', 'Active'],
  ['USR-2005', 'Stuart McAllister', 'Supervisor', 'CMP-1002', 'winEdge', 'Salford, United Kingdom', 'Active'],
  ['USR-2006', 'Daniel Kershaw', 'Security Officer', 'CMP-1002', 'iphone', 'Manchester, United Kingdom', 'Locked'],

  ['USR-2007', 'Rupert Lanchester', 'Company Admin', 'CMP-1003', 'winChrome', 'London, United Kingdom', 'Active'],
  ['USR-2008', 'Poppy Whitaker', 'Site Manager', 'CMP-1003', 'macSafari', 'Greenwich, United Kingdom', 'Active'],
  ['USR-2009', 'Liam Ostler', 'Supervisor', 'CMP-1003', 'androidChrome', 'London, United Kingdom', 'Active'],

  ['USR-2010', 'Hannah Brightwell', 'Company Admin', 'CMP-1004', 'winChrome', 'Leeds, United Kingdom', 'Active'],
  ['USR-2011', 'Gareth Pritchard', 'Site Manager', 'CMP-1004', 'winEdge', 'Bradford, United Kingdom', 'Active'],
  ['USR-2012', 'Megan Ashdown', 'Security Officer', 'CMP-1004', 'iphone', 'Leeds, United Kingdom', 'Active'],

  ['USR-2013', 'Philip Danvers', 'Company Admin', 'CMP-1005', 'macChrome', 'Sheffield, United Kingdom', 'Active'],
  ['USR-2014', 'Isla Cartwright', 'Supervisor', 'CMP-1005', 'winChrome', 'Rotherham, United Kingdom', 'Active'],
  ['USR-2015', 'Connor Maddox', 'Security Officer', 'CMP-1005', 'androidChrome', 'Sheffield, United Kingdom', 'Active'],

  ['USR-2016', 'Fiona Drummond', 'Company Admin', 'CMP-1006', 'macSafari', 'Edinburgh, United Kingdom', 'Active'],
  ['USR-2017', 'Angus MacLeod', 'Site Manager', 'CMP-1006', 'winChrome', 'Edinburgh, United Kingdom', 'Active'],
  ['USR-2018', 'Eilidh Sinclair', 'Security Officer', 'CMP-1006', 'iphone', 'Leith, United Kingdom', 'Active'],

  ['USR-2019', 'Bethany Rowlands', 'Company Admin', 'CMP-1007', 'winEdge', 'Bristol, United Kingdom', 'Active'],
  ['USR-2020', 'Tom Hargreaves', 'Supervisor', 'CMP-1007', 'tablet', 'Bath, United Kingdom', 'Active'],
  ['USR-2021', 'Jessica Pollard', 'Security Officer', 'CMP-1007', 'androidChrome', 'Bristol, United Kingdom', 'Active'],

  ['USR-2022', 'Marcus Ellery', 'Company Admin', 'CMP-1008', 'winChrome', 'Birmingham, United Kingdom', 'Active'],
  ['USR-2023', 'Sophie Winterbourne', 'Site Manager', 'CMP-1008', 'macChrome', 'Solihull, United Kingdom', 'Active'],
  ['USR-2024', 'Ryan Calloway', 'Security Officer', 'CMP-1008', 'iphone', 'Birmingham, United Kingdom', 'Active'],
];

const EMAIL_DOMAIN = {
  'CMP-1001': 'sentinelguard.co.uk',
  'CMP-1002': 'ironsidesecurity.co.uk',
  'CMP-1003': 'thamesshield.co.uk',
  'CMP-1004': 'northgateprotection.co.uk',
  'CMP-1005': 'penninepatrol.co.uk'.replace(' ', ''),
  'CMP-1006': 'caledoniansecurity.co.uk',
  'CMP-1007': 'harbourviewguarding.co.uk',
  'CMP-1008': 'albionevents.co.uk',
};

export const USERS = USER_ROWS.map(([id, name, role, companyId, deviceKey, location, accountStatus], i) => {
  const domain = companyId ? EMAIL_DOMAIN[companyId] : 'megsi.io';
  return {
    id,
    name,
    role,
    companyId,
    email: `${name.toLowerCase().replace(/[^a-z ]/g, '').replace(' ', '.')}@${domain}`,
    accountStatus,
    location,
    ...DEVICES[deviceKey],
    // Stable per-user address from the RFC 5737 documentation range.
    ip: `203.0.113.${10 + i * 7}`,
  };
});

/* ------------------------------------------------------------------ */
/* Activity templates                                                  */
/* ------------------------------------------------------------------ */
/*
 * w        relative frequency
 * roles    roles that can perform it ('*' = any role)
 * tenant   true  → belongs to a tenant (Super Admin / Support Agent actions
 *                  are attributed to the tenant they touched)
 *          false → platform level for platform users
 * res      accessed resource, {co} is replaced by the company ID
 */
const ALL_STAFF = ['*'];
const PLATFORM = ['Super Admin', 'Support Agent'];

const TEMPLATES = [
  // Authentication
  { type: 'Login', desc: 'User logged in successfully', status: 'Success', w: 16, roles: ALL_STAFF, tenant: false, module: 'Authentication', res: '/login' },
  { type: 'Login', desc: 'Failed login attempt – incorrect password', status: 'Failed', w: 3, roles: ALL_STAFF, tenant: false, module: 'Authentication', res: '/login', reason: 'Incorrect password entered' },
  { type: 'Login', desc: 'Multiple failed login attempts detected', status: 'Failed', w: 0.9, roles: ALL_STAFF, tenant: false, module: 'Authentication', res: '/login', reason: 'Five consecutive failed sign-ins within 10 minutes', suspicious: true },
  { type: 'Login', desc: 'Account locked after repeated failed logins', status: 'Failed', w: 0.4, roles: ALL_STAFF, tenant: false, module: 'Authentication', res: '/login', reason: 'Account locked automatically after 5 failed attempts', suspicious: true },
  { type: 'Logout', desc: 'User logged out', status: 'Success', w: 10, roles: ALL_STAFF, tenant: false, module: 'Authentication', res: '/logout' },
  { type: 'Logout', desc: 'Session expired – user signed out automatically', status: 'Success', w: 2, roles: ALL_STAFF, tenant: false, module: 'Authentication', res: '/session' },

  // Company activities
  { type: 'View', desc: 'Viewed company details', status: 'Success', w: 8, roles: PLATFORM, tenant: true, module: 'Companies', res: '/companies/{co}' },
  { type: 'Create', desc: 'Created a new company', status: 'Success', w: 0.7, roles: ['Super Admin'], tenant: true, module: 'Companies', res: '/companies/new' },
  { type: 'Update', desc: 'Updated company information', status: 'Success', w: 2, roles: ['Super Admin', 'Company Admin'], tenant: true, module: 'Companies', res: '/companies/{co}/edit' },
  { type: 'Update', desc: 'Changed subscription plan', status: 'Success', w: 1.5, roles: ['Super Admin'], tenant: true, module: 'Subscription Plans', res: '/companies/{co}/subscription' },
  { type: 'Update', desc: 'Suspended company account', status: 'Success', w: 0.4, roles: ['Super Admin'], tenant: true, module: 'Suspended Tenants', res: '/companies/{co}/suspend' },
  { type: 'Update', desc: 'Reactivated company account', status: 'Success', w: 0.3, roles: ['Super Admin'], tenant: true, module: 'Suspended Tenants', res: '/companies/{co}/reactivate' },

  // User activities
  { type: 'Create', desc: 'Added a new user', status: 'Success', w: 3, roles: ['Company Admin', 'Super Admin'], tenant: true, module: 'Users', res: '/users/new' },
  { type: 'Update', desc: 'Updated user details', status: 'Success', w: 3, roles: ['Company Admin'], tenant: true, module: 'Users', res: '/users/edit' },
  { type: 'Delete', desc: 'Removed a user account', status: 'Success', w: 1, roles: ['Company Admin', 'Super Admin'], tenant: true, module: 'Users', res: '/users/remove' },
  { type: 'Permission Change', desc: 'Changed user role', status: 'Success', w: 1.2, roles: ['Company Admin', 'Super Admin'], tenant: true, module: 'Roles & Permissions', res: '/roles/assign' },
  { type: 'Permission Change', desc: 'Updated company user permissions', status: 'Success', w: 1.2, roles: ['Company Admin', 'Super Admin'], tenant: true, module: 'Roles & Permissions', res: '/roles/permissions' },

  // Billing
  { type: 'View', desc: 'Viewed billing history', status: 'Success', w: 4, roles: ['Super Admin', 'Company Admin'], tenant: true, module: 'Tenant Billing', res: '/billing/{co}/history' },
  { type: 'View', desc: 'Viewed invoice', status: 'Success', w: 3, roles: ['Super Admin', 'Company Admin'], tenant: true, module: 'Tenant Billing', res: '/billing/{co}/invoices' },
  { type: 'Export', desc: 'Exported invoice', status: 'Success', w: 1.5, roles: ['Super Admin', 'Company Admin'], tenant: true, module: 'Tenant Billing', res: '/billing/{co}/invoices/export' },
  { type: 'Update', desc: 'Updated billing information', status: 'Success', w: 1, roles: ['Company Admin'], tenant: true, module: 'Tenant Billing', res: '/billing/{co}/details' },

  // Exports
  { type: 'Export', desc: 'Exported company records', status: 'Success', w: 1, roles: ['Super Admin'], tenant: false, module: 'Companies', res: '/companies/export' },
  { type: 'Export', desc: 'Exported guard attendance report', status: 'Success', w: 2, roles: ['Company Admin', 'Site Manager'], tenant: true, module: 'Reports', res: '/reports/attendance/export' },

  // Security events
  { type: 'Access', desc: 'Attempted to access a restricted page', status: 'Denied', w: 2, roles: ['Company Admin', 'Site Manager', 'Supervisor', 'Security Officer', 'Support Agent'], tenant: true, module: 'Platform Administration', res: '/admin/restricted', reason: 'Role does not include access to this page' },
  { type: 'Update', desc: 'Permission violation – edit action blocked', status: 'Denied', w: 1, roles: ['Supervisor', 'Security Officer', 'Site Manager'], tenant: true, module: 'Roles & Permissions', res: '/roles/permissions', reason: 'Edit permission has not been granted for this role' },
  { type: 'Access', desc: 'Attempted to open another company’s data', status: 'Denied', w: 0.5, roles: ['Company Admin', 'Site Manager'], tenant: true, module: 'Companies', res: '/companies/CMP-9999', reason: 'Cross-tenant data access is not permitted' },

  // Tenant operations
  { type: 'Access', desc: 'Opened shift roster', status: 'Success', w: 5, roles: ['Site Manager', 'Supervisor'], tenant: true, module: 'Rostering', res: '/rostering/shifts' },
  { type: 'Access', desc: 'Opened incident reports', status: 'Success', w: 3, roles: ['Supervisor', 'Security Officer', 'Site Manager'], tenant: true, module: 'Incidents', res: '/incidents' },
  { type: 'Create', desc: 'Created an incident report', status: 'Success', w: 3, roles: ['Security Officer', 'Supervisor'], tenant: true, module: 'Incidents', res: '/incidents/new' },
  { type: 'Update', desc: 'Updated shift roster', status: 'Success', w: 2, roles: ['Site Manager'], tenant: true, module: 'Rostering', res: '/rostering/shifts/edit' },
  { type: 'View', desc: 'Viewed guard attendance', status: 'Success', w: 3, roles: ['Supervisor', 'Site Manager'], tenant: true, module: 'Attendance', res: '/attendance' },

  // Support
  { type: 'Access', desc: 'Accessed support module', status: 'Success', w: 3, roles: ['Support Agent'], tenant: false, module: 'Support Tickets', res: '/support' },
  { type: 'View', desc: 'Viewed support ticket', status: 'Success', w: 3, roles: ['Support Agent', 'Super Admin', 'Company Admin'], tenant: true, module: 'Support Tickets', res: '/support/tickets' },
  { type: 'Update', desc: 'Updated support ticket', status: 'Success', w: 2, roles: ['Support Agent'], tenant: true, module: 'Support Tickets', res: '/support/tickets/update' },
  { type: 'Access', desc: 'Accessed tenant information for support', status: 'Success', w: 2, roles: ['Support Agent'], tenant: true, module: 'Support Access', res: '/support-access/{co}' },

  // Platform level
  { type: 'Access', desc: 'Opened system settings', status: 'Success', w: 1, roles: ['Super Admin'], tenant: false, module: 'System Settings', res: '/settings' },
  { type: 'View', desc: 'Viewed audit logs', status: 'Success', w: 1, roles: ['Super Admin'], tenant: false, module: 'Audit Logs', res: '/audit-logs' },
];

/* ------------------------------------------------------------------ */
/* Deterministic generator                                             */
/* ------------------------------------------------------------------ */

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const UNRECOGNISED_LOCATIONS = [
  'Frankfurt, Germany',
  'Amsterdam, Netherlands',
  'Dublin, Ireland',
  'Lisbon, Portugal',
  'Warsaw, Poland',
];

const DAYS_OF_DATA = 200; // enough for "Last 90 Days" + the previous period

/**
 * Shape of one record (what a backend should return):
 * {
 *   id, timestamp (ISO-8601),
 *   userId, userName, userEmail, userRole, accountStatus,
 *   companyId | null, companyName | null, tenantPlan, tenantRef,
 *   eventType, description, status ('Success'|'Failed'|'Denied'),
 *   ip, location, browser, os, device,
 *   module, resource, requestId,
 *   failureReason?  (when status === 'Failed'),
 *   denialReason?   (when status === 'Denied')
 * }
 */
export function buildAccessLogs(now = new Date()) {
  const rand = mulberry32(20261107);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const weighted = (items) => {
    const total = items.reduce((s, i) => s + i.w, 0);
    let r = rand() * total;
    for (const item of items) {
      r -= item.w;
      if (r <= 0) return item;
    }
    return items[items.length - 1];
  };
  const hex = (n) =>
    Array.from({ length: n }, () => Math.floor(rand() * 16).toString(16)).join('');

  const userPool = USERS.map((u) => ({ u, w: u.companyId ? 1 : 1.3 }));
  const companyById = Object.fromEntries(COMPANIES.map((c) => [c.id, c]));
  const raw = [];

  for (let d = 0; d < DAYS_OF_DATA; d += 1) {
    const day = new Date(now);
    day.setDate(day.getDate() - d);
    day.setHours(0, 0, 0, 0);
    const weekend = day.getDay() === 0 || day.getDay() === 6;
    const count = weekend ? 3 + Math.floor(rand() * 5) : 10 + Math.floor(rand() * 12);

    for (let i = 0; i < count; i += 1) {
      const { u: user } = weighted(userPool.map((p) => ({ ...p, w: p.w })));
      const options = TEMPLATES.filter(
        (t) => t.roles.includes('*') || t.roles.includes(user.role),
      );
      const tpl = weighted(options);

      // Time of day: mostly working hours, some out-of-hours.
      const hour = rand() < 0.85 ? 7 + Math.floor(rand() * 13) : Math.floor(rand() * 24);
      const ts = new Date(day);
      ts.setHours(hour, Math.floor(rand() * 60), Math.floor(rand() * 60), 0);
      if (ts > now) ts.setTime(now.getTime() - Math.floor(rand() * 3 * 3600 * 1000) - 60000);

      // Company attribution.
      let company = null;
      if (user.companyId) company = companyById[user.companyId];
      else if (tpl.tenant) company = pick(COMPANIES);

      // Network details. Suspicious sign-ins come from an unrecognised source.
      const foreign = tpl.suspicious;
      const ip = foreign ? `198.51.100.${20 + Math.floor(rand() * 200)}` : user.ip;
      const location = foreign ? pick(UNRECOGNISED_LOCATIONS) : user.location;

      const record = {
        timestamp: ts.toISOString(),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        accountStatus: user.accountStatus,
        companyId: company ? company.id : null,
        companyName: company ? company.name : null,
        tenantPlan: company ? company.plan : null,
        tenantRef: company ? company.tenantRef : null,
        eventType: tpl.type,
        description: tpl.desc,
        status: tpl.status,
        ip,
        location,
        browser: user.browser,
        os: user.os,
        device: user.device,
        module: tpl.module,
        resource: tpl.res.replace('{co}', company ? company.id : 'platform'),
        requestId: `req_${hex(12)}`,
      };
      if (tpl.status === 'Failed') record.failureReason = tpl.reason;
      if (tpl.status === 'Denied') record.denialReason = tpl.reason;
      raw.push(record);
    }
  }

  // Oldest → newest to assign increasing IDs, then return newest first.
  raw.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  raw.forEach((r, i) => {
    r.id = `EVT-${String(100001 + i)}`;
  });
  return raw.reverse();
}

/* ------------------------------------------------------------------ */
/* Service layer – swap this for a real API call                       */
/* ------------------------------------------------------------------ */

export function fetchAccessLogs() {
  // Example of the real call later:
  //   const res = await fetch('/api/super-admin/access-logs');
  //   return res.json();   // → { logs, companies, users }
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        logs: buildAccessLogs(new Date()),
        companies: COMPANIES,
        users: USERS,
      });
    }, 650); // short delay so the loading skeletons are visible
  });
}