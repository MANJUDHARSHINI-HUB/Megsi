// Mock data for the Companies page (demonstration only - no backend).
// The first 10 rows match the reference screenshot; the rest are generated so the totals are 56 / 48 active / 5 trial / 3 suspended / 12 enterprise.
export const INDUSTRIES = ['Retail', 'Commercial', 'Healthcare', 'Education', 'Manufacturing', 'Logistics', 'Hospitality', 'Finance', 'Technology', 'Government'];
export const PLANS = ['Starter', 'Professional', 'Business', 'Enterprise'];
export const STATUSES = ['Active', 'Trial', 'Suspended'];
export const TENURES = ['Monthly', 'Annual'];
export const RENEWAL_FILTERS = ['Active', 'Due soon', 'Overdue'];
// Plan limits and the base monthly price (used when a company is added in the form)
export const PLAN_INFO = {
  Starter: { users: 100, sites: 20, price: 650 },
  Professional: { users: 200, sites: 40, price: 1700 },
  Business: { users: 500, sites: 100, price: 2450 },
  Enterprise: { users: null, sites: null, price: 5800 },
};

const first10 = [
  ['SecureGuard UK Ltd', 'Retail', 'Business', 120, 18, 'Active', '2026-10-20', 2450, 'Sarah Johnson'],
  ['Metro Security Group', 'Commercial', 'Professional', 85, 12, 'Active', '2026-10-18', 1850, 'Mark Thompson'],
  ['SafeZone Services', 'Healthcare', 'Business', 210, 45, 'Active', '2026-10-15', 3200, 'Emma Clarke'],
  ['Guardian Force Ltd', 'Education', 'Starter', 35, 8, 'Trial', '2026-10-12', 650, 'James Wilson'],
  ['Elite Security Solutions', 'Manufacturing', 'Enterprise', 560, 120, 'Active', '2026-10-10', 5800, 'Olivia Martin'],
  ['Northern Security', 'Logistics', 'Professional', 95, 20, 'Active', '2026-10-08', 1900, 'Daniel Reed'],
  ['City Watch Ltd', 'Hospitality', 'Starter', 60, 14, 'Active', '2026-10-05', 1200, 'Priya Shah'],
  ['Shield Security Group', 'Finance', 'Business', 320, 62, 'Active', '2026-10-01', 4150, 'Tom Hughes'],
  ['Prime Security UK', 'Technology', 'Professional', 75, 16, 'Suspended', '2026-09-28', 1700, 'Rachel Green'],
  ['SwiftGuard Services', 'Government', 'Business', 180, 38, 'Active', '2026-09-25', 2950, 'Ben Carter'],
];

const MORE_NAMES = ['Beacon Protection', 'Apex Guarding', 'Harbour Security', 'Citadel Services', 'Ironside Patrol', 'Vigil Protect', 'Bastion Guards', 'Halo Guarding', 'Vanguard Patrol', 'OldGuard Security',
  'Sentinel Watch UK', 'Redstone Security', 'Blueline Guarding', 'Crown Protection', 'Falcon Security Ltd', 'Anchor Guard Services', 'Pioneer Security', 'Lionheart Guarding', 'Summit Protection', 'Orbit Security Group',
  'Granite Guard Ltd', 'Meridian Security', 'Kestrel Patrol', 'Trident Security UK', 'Fortress Services', 'Aegis Protection', 'Nightwatch Ltd', 'Eagle Eye Security', 'Westgate Guarding', 'Kingsway Security',
  'Paladin Protection', 'Highland Security', 'Cobalt Guard Services', 'Thames Valley Security', 'Rampart Security', 'Oakridge Guarding', 'Silverline Security', 'Union Guard Ltd', 'Pathfinder Security', 'Everguard UK',
  'Ranger Protection', 'Stronghold Security', 'Marshal Services Ltd', 'Bulwark Security', 'Castlegate Guarding', 'Lighthouse Security'];
const CONTACTS = ['Lucy Adams', 'Noah Evans', 'Henry Ford', 'Grace Hall', 'Oliver Kent', 'Amelia Brooks', 'Jack Turner', 'Sophie Clarke', 'Harry Morgan', 'Chloe Bennett'];
const TRIAL = [5, 13, 21, 33];      // positions in MORE_NAMES that are Trial
const SUSPENDED = [9, 29];          // positions that are Suspended
const SPAN = { Starter: [20, 60, 4, 14], Professional: [60, 150, 9, 28], Business: [150, 340, 20, 70], Enterprise: [400, 620, 80, 140] };

const pad = (n) => String(n).padStart(2, '0');
const isoDaysBefore = (days) => { const d = new Date(Date.UTC(2026, 8, 24 - days)); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; };
const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '').replace(/ltd|uk$/g, '');

const generated = MORE_NAMES.map((name, i) => {
  const plan = i % 4 === 2 ? 'Enterprise' : ['Starter', 'Professional', 'Business'][i % 3];
  const [uMin, uMax, sMin, sMax] = SPAN[plan];
  const users = uMin + ((i * 37) % (uMax - uMin));
  const sites = sMin + ((i * 11) % (sMax - sMin));
  const status = TRIAL.includes(i) ? 'Trial' : SUSPENDED.includes(i) ? 'Suspended' : 'Active';
  const revenue = Math.round((PLAN_INFO[plan].price * (0.7 + ((i * 7) % 9) / 10)) / 10) * 10;
  return [name, INDUSTRIES[(i * 3 + 1) % INDUSTRIES.length], plan, users, sites, status, isoDaysBefore(i * 4 + 2), status === 'Trial' ? 0 : revenue, CONTACTS[i % CONTACTS.length]];
});

const referenceRows = [
  { industry: 'Security', location: 'London, UK', billingTenure: 'Annual', renewalDate: '2026-11-20', renewalStatusLabel: 'Due in 22 days', renewalState: 'Due soon', revenue: 2450 },
  { industry: 'Commercial Security', location: 'Manchester, UK', billingTenure: 'Monthly', renewalDate: '2026-11-02', renewalStatusLabel: 'Due in 4 days', renewalState: 'Due soon', revenue: 850 },
  { industry: 'Healthcare Security', location: 'Birmingham, UK', billingTenure: 'Annual', renewalDate: '2026-12-15', renewalStatusLabel: 'Active', renewalState: 'Active', revenue: 2200 },
  { industry: 'Security', location: 'Leeds, UK', billingTenure: 'Monthly', renewalDate: '2026-10-31', renewalStatusLabel: 'Due in 2 days', renewalState: 'Due soon', revenue: 650 },
  { industry: 'Manufacturing', location: 'Glasgow, UK', billingTenure: 'Annual', renewalDate: '2027-01-10', renewalStatusLabel: 'Active', renewalState: 'Active', revenue: 3800 },
  { industry: 'Logistics', location: 'Liverpool, UK', billingTenure: 'Annual', renewalDate: '2026-11-15', renewalStatusLabel: 'Due in 17 days', renewalState: 'Due soon', revenue: 1300 },
  { industry: 'Hospitality', location: 'Bristol, UK', billingTenure: 'Monthly', renewalDate: '2026-11-05', renewalStatusLabel: 'Due in 7 days', renewalState: 'Due soon', revenue: 220 },
];

// Subscription start overrides for the reference rows (index -> ISO date). Other rows start 0-7 days after joining.
const SUBSCRIPTION_START = { 0: '2026-10-20', 1: '2026-10-19', 2: '2026-10-17', 3: '2026-10-15', 4: '2026-10-12', 5: '2026-10-13', 6: '2026-10-05' };
const addDays = (iso, n) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

export const COMPANY_ROWS = [...first10, ...generated].map(([name, industry, plan, users, sites, status, joined, revenue, contact], i) => {
  const reference = referenceRows[i] || {};
  const subscriptionStartDate = SUBSCRIPTION_START[i] || addDays(joined, (i * 3) % 8);
  const renewalDate = reference.renewalDate || (i < 8 ? `2026-11-${String(5 + i * 3).padStart(2, '0')}` : `2027-0${1 + (i % 3)}-${String(5 + (i % 20)).padStart(2, '0')}`);
  const daysUntilRenewal = Math.ceil((new Date(`${renewalDate}T00:00:00`) - new Date('2026-10-30T00:00:00')) / 86400000);
  const renewalState = reference.renewalState || (daysUntilRenewal < 0 ? 'Overdue' : daysUntilRenewal <= 30 ? 'Due soon' : 'Active');
  return {
    id: i + 1,
    code: `CMP-${String(1001 + i)}`,
    name, industry: reference.industry || industry, location: reference.location || ['London, UK', 'Manchester, UK', 'Birmingham, UK', 'Leeds, UK', 'Glasgow, UK', 'Liverpool, UK', 'Bristol, UK'][i % 7],
    plan, users, sites, status, joiningDate: joined, subscriptionStartDate, revenue: reference.revenue ?? revenue, contact,
    billingTenure: reference.billingTenure || (i % 2 === 0 ? 'Annual' : 'Monthly'),
    renewalDate, renewalStatusLabel: reference.renewalStatusLabel || (renewalState === 'Active' ? 'Active' : renewalState === 'Overdue' ? 'Overdue' : `Due in ${daysUntilRenewal} days`), renewalState,
    email: `${contact.split(' ')[0].toLowerCase()}@${slug(name)}.co.uk`,
    phone: `+44 20 7946 ${String(1000 + ((i * 137) % 9000)).padStart(4, '0')}`,
    // Additional profile fields used by the individual company details page.
    address: i === 0 ? '123 Business Park, London Road, London, Greater London, SW1A 1AA, United Kingdom' : '',
    licenseNumber: i === 0 ? 'ACS-12345' : '',
    vatNumber: i === 0 ? 'GB123456789' : '',
    whatsapp: i === 0 ? '+44 7700 900123' : '',
    website: i === 0 ? 'www.secureguard.co.uk' : '',
    designation: i === 0 ? 'Operations Manager' : 'Company Administrator',
  };
});
/* ---------- Per-company mock activity, communication and payment history (demo only) ---------- */
const TODAY_ISO = '2026-10-30';
const fmtTime = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
const ACTIVITY_POOL = [
  ['Subscription renewed', 'System'], ['Plan limits reviewed', 'Platform Admin'], ['Invoice generated', 'System'],
  ['Payment received', 'System'], ['Company profile updated', null], ['New user added', null], ['Site added', null],
  ['Support ticket resolved', 'Support Team'], ['Login from new device approved', null], ['Billing contact verified', 'Platform Admin'],
  ['Renewal reminder sent', 'System'], ['Company registered', 'System'],
];
const COMM_POOL = [
  ['Email', 'Welcome email'], ['Subscription Reminder', 'Renewal reminder'], ['Account Notification', 'Account notice'],
  ['WhatsApp', 'Support follow-up'], ['Invoice Email', 'Invoice sent'], ['SMS', 'Payment confirmation'], ['Email', 'Plan usage summary'],
];
const COMM_STATUS = ['Sent', 'Delivered', 'Read', 'Delivered', 'Sent', 'Read', 'Delivered'];

export function getCompanyExtras(c) {
  const id = c.id || 1;
  const pick = (n, step, offset = 0) => (id * step + n + offset);
  const activity = Array.from({ length: 8 }, (_, n) => {
    const [title, actor] = ACTIVITY_POOL[pick(n, 3) % ACTIVITY_POOL.length];
    return { date: addDays(TODAY_ISO, -(n * 4 + (id % 4))), time: fmtTime(8 + ((id + n * 3) % 10), (id * 7 + n * 11) % 60), title, actor: actor || c.contact || 'Company Admin' };
  });
  const communications = Array.from({ length: 7 }, (_, n) => {
    const [type, subject] = COMM_POOL[pick(n, 2) % COMM_POOL.length];
    const failed = (id + n) % 11 === 0;
    return { date: addDays(TODAY_ISO, -(n * 5 + (id % 5))), time: fmtTime(9 + ((id + n * 2) % 9), (id * 13 + n * 17) % 60), type, subject, to: type === 'WhatsApp' || type === 'SMS' ? (c.whatsapp || c.phone) : c.email, status: failed ? 'Failed' : COMM_STATUS[(id + n) % COMM_STATUS.length] };
  });
  const amount = c.revenue || 0;
  const startDay = Math.min(28, Number((c.subscriptionStartDate || TODAY_ISO).slice(8, 10)) || 1);
  const payments = [];
  for (let k = 0; k < 12; k++) {
    const d = new Date(Date.UTC(2026, 9 - k, startDay)); const iso = d.toISOString().slice(0, 10);
    if (k > 0 && iso < (c.subscriptionStartDate || '')) break;
    let status = 'Paid';
    if (c.status === 'Trial') status = 'Trial';
    else if (k === 0 && c.status === 'Suspended') status = 'Failed';
    else if (k === 0 && c.renewalState === 'Overdue') status = 'Overdue';
    else if (k === 0 && c.renewalState === 'Due soon' && id % 3 === 0) status = 'Pending';
    payments.push({ invoice: `INV-${id * 100 + 12 - k}`, date: iso, amount: status === 'Trial' ? 0 : amount, method: id % 2 ? 'Card' : 'Bank Transfer', status });
  }
  const paid = payments.filter((p) => p.status === 'Paid');
  const outstanding = payments.filter((p) => ['Failed', 'Overdue', 'Pending'].includes(p.status)).reduce((s, p) => s + p.amount, 0);
  return {
    activity, communications, payments,
    totalRevenue: paid.reduce((s, p) => s + p.amount, 0), outstanding,
    lastPayment: paid[0]?.date || null,
    paymentStatus: c.status === 'Suspended' ? 'Review required' : outstanding > 0 ? 'Payment pending' : c.status === 'Trial' ? 'Free trial' : 'Up to date',
  };
}

/* ---------- Per-company mock sites and users (demo only, deterministic) ---------- */
const STREETS = ['High Street', 'Station Road', 'Park Lane', 'Victoria Road', 'Mill Lane', 'Church Street', 'Queens Road', 'King Street'];
const SITE_TYPES = ['Head Office', 'Retail Park', 'Shopping Centre', 'Distribution Depot', 'Hospital Wing', 'Campus', 'Business Park', 'Station Concourse', 'Residential Block', 'Industrial Estate', 'Car Park', 'Stadium Gate'];
const AREAS = ['Central', 'Riverside', 'Northgate', 'Eastside', 'Westfield', 'Harbour', 'Southbank', 'Parkway'];
const SHIFTS = ['24/7 cover', 'Day shift', 'Night shift', 'Day & night'];
const FIRST_NAMES = ['Adam', 'Beth', 'Callum', 'Dina', 'Ethan', 'Fiona', 'George', 'Hannah', 'Imran', 'Jade', 'Kyle', 'Layla', 'Marcus', 'Nina', 'Owen', 'Pooja', 'Quinn', 'Ravi', 'Stella', 'Tariq'];
const LAST_NAMES = ['Ahmed', 'Bailey', 'Cooper', 'Dawson', 'Edwards', 'Fisher', 'Grant', 'Hayes', 'Irwin', 'Jones', 'Khan', 'Lewis', 'Mills', 'Nolan', 'Owens', 'Patel', 'Quigley', 'Roberts', 'Singh', 'Walker'];

// Individual site records are not part of the supplied company data, so they are derived from the
// company's site count. Workforce per site always adds up to the company's user count.
export function getCompanySites(c) {
  const count = Number(c.sites) || 0;
  const users = Number(c.users) || 0;
  const id = c.id || 1;
  const city = (c.location || 'UK').split(',')[0].trim();
  const country = (c.location || '').split(',').slice(1).join(',').trim() || 'UK';
  return Array.from({ length: count }, (_, n) => ({
    id: `${c.code || `CMP-${id}`}-S${String(n + 1).padStart(3, '0')}`,
    index: n,
    companyId: id,
    name: `${city} ${AREAS[(id + n) % AREAS.length]} ${SITE_TYPES[(id * 2 + n) % SITE_TYPES.length]}`,
    address: `${((id * 7 + n * 13) % 90) + 1} ${STREETS[(id + n * 3) % STREETS.length]}`,
    city,
    location: `${city}, ${country}`,
    status: c.status === 'Suspended' ? 'Suspended' : 'Operational',
    workforce: Math.floor(users / count) + (n < users % count ? 1 : 0),
    manager: `${FIRST_NAMES[(id + n * 5) % FIRST_NAMES.length]} ${LAST_NAMES[(id * 3 + n) % LAST_NAMES.length]}`,
    shift: SHIFTS[(id + n) % SHIFTS.length],
  }));
}

export function getCompanyUsers(c) {
  const count = Number(c.users) || 0;
  const id = c.id || 1;
  const sites = getCompanySites(c);
  const domain = (c.email || '').split('@')[1] || 'example.co.uk';
  const managerCut = Math.max(1, Math.round(count * 0.04));
  return Array.from({ length: count }, (_, i) => {
    const name = i === 0 && c.contact ? c.contact : `${FIRST_NAMES[(id * 3 + i * 7) % FIRST_NAMES.length]} ${LAST_NAMES[(id + i * 11) % LAST_NAMES.length]}`;
    const role = i === 0 ? 'Company Admin' : i <= managerCut ? 'Site Manager' : i % 9 === 0 ? 'Supervisor' : 'Security Officer';
    const site = sites.length ? sites[i % sites.length] : null;
    return {
      id: `${c.code || `CMP-${id}`}-U${String(i + 1).padStart(3, '0')}`,
      name, role,
      siteId: site ? site.id : null,
      siteName: site ? site.name : 'Unassigned',
      email: i === 0 && c.email ? c.email : `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@${domain}`,
      status: c.status === 'Suspended' ? 'Suspended' : i % 17 === 16 ? 'Inactive' : 'Active',
    };
  });
}