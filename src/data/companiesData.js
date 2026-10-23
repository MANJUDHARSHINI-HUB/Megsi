// Mock data for the Companies page (demonstration only - no backend).
// The first 10 rows match the reference screenshot; the rest are generated so the totals are 56 / 48 active / 5 trial / 3 suspended / 12 enterprise.
export const INDUSTRIES = ['Retail', 'Commercial', 'Healthcare', 'Education', 'Manufacturing', 'Logistics', 'Hospitality', 'Finance', 'Technology', 'Government'];
export const PLANS = ['Starter', 'Professional', 'Business', 'Enterprise'];
export const STATUSES = ['Active', 'Trial', 'Suspended'];
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

export const COMPANY_ROWS = [...first10, ...generated].map(([name, industry, plan, users, sites, status, joined, revenue, contact], i) => ({
  id: i + 1,
  code: `CMP-${String(1001 + i)}`,
  name, industry, plan, users, sites, status, joined, revenue, contact,
  email: `${contact.split(' ')[0].toLowerCase()}@${slug(name)}.co.uk`,
  phone: `+44 20 7946 ${String(1000 + ((i * 137) % 9000)).padStart(4, '0')}`,
}));
