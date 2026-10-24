// =====================================================================
// Customer Admins - deterministic mock data, date-aware calculations and page translations.
// Nothing here reads the real clock for data: every record is a fixed fixture relative to REF_DATE,
// so the same date range always gives the same numbers. Components never filter by date themselves.
// =====================================================================
import { addDays, daysBetween, inRange, monthEnd, previousRange, shiftMonths, toDate } from './selectors.js';
import { fmtDate, monthShort } from '../i18n/translations.js';

/* ---------------------------------------------------------------------
   Constants
   --------------------------------------------------------------------- */
// "Today" of the demo data set. The dashboard's own data ends on 2026-10-22, so nothing after this date exists.
const today = new Date();

export const REF_DATE = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, '0'),
  String(today.getDate()).padStart(2, '0'),
].join('-');
export const STORE_KEY = 'megsi.cadmins.v1';
export const ACTOR = 'David Miller';
export const ROLES = ['owner', 'admin', 'billing', 'operations', 'viewer'];
export const ROLE_COLORS = { owner: '#0758F9', admin: '#079447', billing: '#F59E0B', operations: '#7909E8', viewer: '#5B6B8C' };
export const STATUSES = ['active', 'inactive', 'pending', 'suspended'];
export const STATUS_COLORS = { active: '#0758F9', inactive: '#B9A7F5', pending: '#F59E0B', suspended: '#E8172D' };
export const KPI_IDS = ['total', 'active', 'inactive', 'pending', 'suspended'];
export const STALE_INVITE_DAYS = 14;
export const DORMANT_DAYS = 30;

// event type -> resulting account status (events without an entry do not change the status)
const STATUS_OF = { invited: 'pending', accepted: 'active', activated: 'active', restored: 'active', deactivated: 'inactive', suspended: 'suspended' };

export const COMPANIES = [
  { id: 'c1', name: 'Sentinel Group Ltd', domain: 'sentinelgroup.co.uk', joined: '2025-06-12' },
  { id: 'c2', name: 'Redwood Security', domain: 'redwoodsecurity.com', joined: '2025-08-03' },
  { id: 'c3', name: 'Trident Guarding', domain: 'tridentguarding.co.uk', joined: '2025-10-14' },
  { id: 'c4', name: 'Bastion Guards', domain: 'bastionguards.co.uk', joined: '2026-03-30' },
  { id: 'c5', name: 'Vigil Protect', domain: 'vigilprotect.co.uk', joined: '2026-05-09' },
  { id: 'c6', name: 'Ironside Patrol', domain: 'ironsidepatrol.co.uk', joined: '2026-06-18' },
  { id: 'c7', name: 'Citadel Services', domain: 'citadelservices.co.uk', joined: '2026-07-22' },
  { id: 'c8', name: 'Harbour Security', domain: 'harboursecurity.co.uk', joined: '2026-08-14' },
  { id: 'c9', name: 'Apex Guarding', domain: 'apexguarding.co.uk', joined: '2026-08-26' },
  { id: 'c10', name: 'SwiftGuard Services', domain: 'swiftguard.co.uk', joined: '2026-09-18' },
  { id: 'c11', name: 'OldGuard Security', domain: 'oldguardsecurity.co.uk', joined: '2026-09-28' },
  { id: 'c12', name: 'City Watch Ltd', domain: 'citywatch.co.uk', joined: '2026-10-03' },
  { id: 'c13', name: 'Northern Security', domain: 'northernsecurity.co.uk', joined: '2026-10-05' },
  { id: 'c14', name: 'Shield Security Group', domain: 'shieldsecurity.co.uk', joined: '2026-10-08' },
  { id: 'c15', name: 'Elite Security Solutions', domain: 'elitesecurity.co.uk', joined: '2026-10-10' },
  { id: 'c16', name: 'Metro Security Group', domain: 'metrosecurity.co.uk', joined: '2026-10-18' },
];

/* ---------------------------------------------------------------------
   Seed admins.  [name, companyIndex(1-16), role, createdAt, acceptedAt|null, status, statusChangedAt|null, signInsPerWeek, quietFrom|null]
   Status history, sign-in events and "last login" are generated from these rows, so every number agrees.
   --------------------------------------------------------------------- */
const ROWS = [
  ['Priya Sharma', 1, 'owner', '2025-06-20', '2025-06-21', 'active', null, 5],
  ['Daniel Lewis', 1, 'admin', '2025-07-15', '2025-07-15', 'active', null, 4],
  ['Hannah Brooks', 1, 'billing', '2025-09-02', '2025-09-04', 'active', null, 2, '2026-09-05'],
  ['Marcus Reid', 1, 'viewer', '2026-01-12', '2026-01-14', 'inactive', '2026-08-30', 1.5],
  ['Karthik Rao', 1, 'operations', '2025-10-01', '2025-10-02', 'active', null, 3],
  ['Arjun Mehta', 2, 'owner', '2025-08-10', '2025-08-10', 'active', null, 5],
  ['Chloe Bennett', 2, 'operations', '2025-10-05', '2025-10-06', 'active', null, 4],
  ['Tariq Hussain', 2, 'admin', '2026-02-18', '2026-02-20', 'suspended', '2026-09-14', 3],
  ['Zoe Fraser', 2, 'viewer', '2026-06-01', null, 'pending', null, 0],
  ['Rohit Sharma', 2, 'viewer', '2025-11-12', '2025-11-13', 'inactive', '2026-05-20', 1],
  ['Rahul Nair', 3, 'owner', '2025-10-20', '2025-10-21', 'active', null, 5],
  ['Emily Carter', 3, 'admin', '2025-12-03', '2025-12-03', 'active', null, 4],
  ['Oliver Brown', 3, 'operations', '2026-03-09', '2026-03-10', 'suspended', '2026-10-20', 3],
  ['Sneha Kapoor', 4, 'owner', '2026-03-31', '2026-04-01', 'active', null, 5],
  ['Liam Walker', 4, 'admin', '2026-05-14', '2026-05-15', 'active', null, 4],
  ['Ayesha Khan', 4, 'billing', '2026-07-08', '2026-07-09', 'active', null, 2],
  ['Divya Iyer', 5, 'owner', '2026-05-10', '2026-05-11', 'active', null, 4],
  ['Sophia Taylor', 5, 'admin', '2026-07-21', '2026-07-22', 'active', null, 4],
  ['Ben Carter', 5, 'viewer', '2026-08-19', '2026-08-21', 'inactive', '2026-10-02', 2],
  ['Noah Evans', 6, 'owner', '2026-06-19', '2026-06-20', 'active', null, 5],
  ['Grace Hall', 6, 'operations', '2026-08-03', '2026-08-04', 'active', null, 4],
  ['Vikram Singh', 6, 'viewer', '2026-09-11', null, 'pending', null, 0],
  ['Karan Singh', 7, 'owner', '2026-07-23', '2026-07-24', 'active', null, 5],
  ['Olivia Martin', 7, 'admin', '2026-09-02', '2026-09-03', 'active', null, 4],
  ['Henry Ford', 7, 'billing', '2026-10-14', null, 'pending', null, 0],
  ['Rachel Green', 8, 'owner', '2026-08-15', '2026-08-15', 'active', null, 5],
  ['Tom Hughes', 8, 'admin', '2026-09-10', '2026-09-12', 'active', null, 3],
  ['Meera Pillai', 8, 'viewer', '2026-10-16', '2026-10-17', 'active', null, 2],
  ['Lucy Adams', 9, 'owner', '2026-08-27', '2026-08-27', 'active', null, 5],
  ['James Wilson', 9, 'operations', '2026-09-24', '2026-09-25', 'active', null, 4],
  ['Anjali Verma', 10, 'owner', '2026-09-19', '2026-09-19', 'active', null, 5],
  ['Mark Thompson', 10, 'admin', '2026-10-06', '2026-10-07', 'active', null, 4],
  ['Fatima Noor', 10, 'billing', '2026-10-20', null, 'pending', null, 0],
  ['Emma Clarke', 11, 'owner', '2026-09-29', '2026-09-30', 'suspended', '2026-10-19', 4],
  ['George Peters', 11, 'admin', '2026-10-01', '2026-10-02', 'suspended', '2026-10-19', 3],
  ['Sarah Johnson', 12, 'owner', '2026-10-04', '2026-10-04', 'active', null, 5],
  ['Ishaan Rao', 12, 'operations', '2026-10-12', null, 'pending', null, 0],
  ['David Cooper', 13, 'owner', '2026-10-06', '2026-10-06', 'active', null, 5],
  ['Neha Gupta', 13, 'admin', '2026-10-15', '2026-10-16', 'active', null, 4],
  ['Oscar Webb', 14, 'owner', '2026-10-09', '2026-10-09', 'active', null, 5],
  ['Laura Simmons', 14, 'viewer', '2026-10-18', null, 'pending', null, 0],
  ['Kavya Menon', 15, 'owner', '2026-10-11', '2026-10-12', 'active', null, 5],
  ['Jack Turner', 15, 'admin', '2026-10-19', '2026-10-19', 'active', null, 4],
  ['Anya Petrova', 16, 'owner', '2026-10-19', '2026-10-20', 'active', null, 5],
  ['Callum Ross', 16, 'billing', '2026-10-21', null, 'pending', null, 0],
];

const slug = (n) => n.toLowerCase().replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '.');
const p2 = (n) => String(n).padStart(2, '0');

const ADMINS = ROWS.map((r, i) => {
  const co = COMPANIES[r[1] - 1];
  return { id: `a${i + 1}`, name: r[0], email: `${slug(r[0])}@${co.domain}`, companyId: co.id, role: r[2], createdAt: r[3] };
});
const byName = Object.fromEntries(ADMINS.map((a) => [a.name, a.id]));

// Management events (status changes, invitations, edits). Sign-ins are kept separately in LOGINS.
let evN = 0;
const ev = (ts, type, adminId, actor, extra = {}) => ({ id: `e${++evN}`, ts, type, adminId, actor, ...extra });
const SEED_EVENTS = [];
ROWS.forEach((r, i) => {
  const a = ADMINS[i];
  SEED_EVENTS.push(ev(`${r[3]}T09:${p2(10 + ((i * 7) % 45))}`, 'invited', a.id, ACTOR));
  if (r[4]) SEED_EVENTS.push(ev(`${r[4]}T14:${p2(5 + ((i * 11) % 50))}`, 'accepted', a.id, a.name));
  if (r[5] === 'suspended') SEED_EVENTS.push(ev(`${r[6]}T16:${p2(12 + ((i * 5) % 40))}`, 'suspended', a.id, ACTOR));
  if (r[5] === 'inactive') SEED_EVENTS.push(ev(`${r[6]}T10:${p2(8 + ((i * 3) % 50))}`, 'deactivated', a.id, ACTOR));
});
// A few hand-written events so history is not perfectly uniform
SEED_EVENTS.push(
  ev('2026-10-18T11:05', 'role_changed', byName['Daniel Lewis'], ACTOR, { from: 'operations', to: 'admin' }),
  ev('2026-06-10T10:00', 'resent', byName['Zoe Fraser'], ACTOR),
  ev('2026-09-25T10:15', 'resent', byName['Vikram Singh'], ACTOR),
  ev('2026-10-16T15:40', 'resent', byName['Henry Ford'], ACTOR),
  ev('2026-09-01T09:20', 'deactivated', byName['Ayesha Khan'], ACTOR),
  ev('2026-09-15T13:45', 'activated', byName['Ayesha Khan'], ACTOR),
  ev('2026-09-20T17:05', 'suspended', byName['Grace Hall'], ACTOR),
  ev('2026-09-22T10:30', 'restored', byName['Grace Hall'], ACTOR),
);
SEED_EVENTS.sort((a, b) => a.ts.localeCompare(b.ts));
// Re-number after sorting so ids stay stable and unique
SEED_EVENTS.forEach((e, i) => { e.id = `e${i + 1}`; });

export const SEED_STATE = { admins: ADMINS, events: SEED_EVENTS };

/* ---------------------------------------------------------------------
   Sign-in events: deterministic pseudo-random generator seeded per admin.
   Sign-ins stop on the day an account is suspended / deactivated and never occur before acceptance.
   --------------------------------------------------------------------- */
const rng = (seed) => { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = (s * 48271) % 2147483647) / 2147483647; };
const PAUSES = {
  [byName['Ayesha Khan']]: [['2026-09-01', '2026-09-15']],
  [byName['Grace Hall']]: [['2026-09-20', '2026-09-22']],
};

function genLogins() {
  const out = [];
  ROWS.forEach((r, i) => {
    const id = ADMINS[i].id;
    if (!r[4]) return;
    const rand = rng(1000 + i * 7919);
    const stop = r[6] || addDays(REF_DATE, 1); // exclusive
    const quiet = r[8] || null;
    out.push({ ts: `${r[4]}T14:${p2(5 + ((i * 11) % 50) + 3 > 59 ? 59 : 5 + ((i * 11) % 50) + 3)}`, adminId: id });
    for (let d = addDays(r[4], 1); d < stop; d = addDays(d, 1)) {
      if (quiet && d >= quiet) break;
      if ((PAUSES[id] || []).some(([a, b]) => d >= a && d < b)) continue;
      const dow = toDate(d).getUTCDay();
      const p = (r[7] / 7) * (dow === 0 || dow === 6 ? 0.3 : 1.2);
      if (rand() < p) out.push({ ts: `${d}T${p2(7 + Math.floor(rand() * 11))}:${p2(Math.floor(rand() * 60))}`, adminId: id });
    }
  });
  return out.sort((a, b) => a.ts.localeCompare(b.ts));
}
export const LOGINS = genLogins();
const LOGIN_TS = new Map();
LOGINS.forEach((l) => { if (!LOGIN_TS.has(l.adminId)) LOGIN_TS.set(l.adminId, []); LOGIN_TS.get(l.adminId).push(l.ts); });

export const lastLoginAt = (id, iso = REF_DATE) => {
  const list = LOGIN_TS.get(id) || [];
  for (let i = list.length - 1; i >= 0; i--) if (list[i].slice(0, 10) <= iso) return list[i];
  return null;
};
export const signinsInRange = (id, r) => (LOGIN_TS.get(id) || []).filter((ts) => inRange(ts, r)).length;

/* ---------------------------------------------------------------------
   Model: status of every admin at any date, replayed from the event log
   --------------------------------------------------------------------- */
export function buildModel(state) {
  const adminById = new Map(state.admins.map((a) => [a.id, a]));
  const tl = new Map();
  state.events.filter((e) => STATUS_OF[e.type]).slice().sort((a, b) => a.ts.localeCompare(b.ts)).forEach((e) => {
    if (!tl.has(e.adminId)) tl.set(e.adminId, []);
    tl.get(e.adminId).push({ ts: e.ts, status: STATUS_OF[e.type] });
  });
  return { state, adminById, tl, companyById: new Map(COMPANIES.map((c) => [c.id, c])) };
}
// {status, ts} of an admin on a date (end of that day), or null if the account did not exist yet
export function stateAt(m, id, iso) {
  let cur = null;
  for (const e of m.tl.get(id) || []) { if (e.ts.slice(0, 10) <= iso) cur = e; else break; }
  return cur;
}
export const currentStatus = (m, id) => { const l = m.tl.get(id); return l && l.length ? l[l.length - 1].status : 'pending'; };
export function snapshot(m, iso) {
  const out = [];
  for (const a of m.state.admins) { const s = stateAt(m, a.id, iso); if (s) out.push({ admin: a, status: s.status, since: s.ts }); }
  return out;
}
export const adminHistory = (m, id) => m.state.events.filter((e) => e.adminId === id).slice().sort((a, b) => b.ts.localeCompare(a.ts) || b.id.localeCompare(a.id));

// Timestamp for new mock actions: fixed demo date + the real time of day (so order inside a day is natural)
export function nowStamp() { const d = new Date(); return `${REF_DATE}T${p2(d.getHours())}:${p2(d.getMinutes())}`; }
export function nextId(prefix, list) { return `${prefix}${list.reduce((mx, x) => Math.max(mx, parseInt(String(x.id).slice(prefix.length), 10) || 0), 0) + 1}`; }

/* ---------------------------------------------------------------------
   KPI calculations for the selected range (also feed the drawer)
   --------------------------------------------------------------------- */
const pctChange = (cur, prev) => (prev ? Math.round(((cur - prev) / prev) * 100) : null);
const MOVES = {
  total: [['ca.mv.created', ['invited']], ['ca.mv.accepted', ['accepted']]],
  active: [['ca.mv.joinedActive', ['accepted', 'activated', 'restored']], ['ca.mv.leftActive', ['deactivated', 'suspended']]],
  inactive: [['ca.mv.deactivated', ['deactivated']], ['ca.mv.reactivated', ['activated']]],
  pending: [['ca.mv.invited', ['invited']], ['ca.mv.accepted', ['accepted']], ['ca.mv.resent', ['resent']]],
  suspended: [['ca.mv.suspended', ['suspended']], ['ca.mv.restored', ['restored']]],
};

export function effectiveEnd(range) { return range.end > REF_DATE ? REF_DATE : range.end; }
export const isEmptyRange = (range) => range.start > REF_DATE;

export function computeKpis(m, range) {
  const empty = isEmptyRange(range);
  const asOf = effectiveEnd(range);
  const before = addDays(range.start, -1);
  const prev = previousRange(range);
  const cur = empty ? [] : snapshot(m, asOf);
  const old = empty ? [] : snapshot(m, before);
  const evs = empty ? [] : m.state.events.filter((e) => inRange(e.ts, { start: range.start, end: asOf }));
  const match = (id, s) => id === 'total' || s.status === id;
  const totalValue = cur.length;
  const kpis = {};
  KPI_IDS.forEach((id) => {
    const items = cur.filter((s) => match(id, s)).sort((a, b) => b.since.localeCompare(a.since) || a.admin.name.localeCompare(b.admin.name));
    const value = items.length;
    const prevValue = old.filter((s) => match(id, s)).length;
    const byRole = ROLES.map((r) => ({ role: r, n: items.filter((i) => i.admin.role === r).length }));
    const cmap = new Map();
    items.forEach((i) => cmap.set(i.admin.companyId, (cmap.get(i.admin.companyId) || 0) + 1));
    const byCompany = [...cmap.entries()].map(([companyId, n]) => ({ companyId, n })).sort((a, b) => b.n - a.n || a.companyId.localeCompare(b.companyId));
    const moves = MOVES[id].map(([k, types]) => ({ k, n: evs.filter((e) => types.includes(e.type)).length }));
    kpis[id] = {
      id, value, prevValue, change: pctChange(value, prevValue), items, byRole, byCompany, moves,
      share: totalValue ? Math.round((value / totalValue) * 100) : 0,
      newInPeriod: evs.filter((e) => e.type === 'invited').length,
      suspendedInPeriod: evs.filter((e) => e.type === 'suspended').length,
    };
  });
  return { empty, asOf, before, prev, outOfRange: range.end > REF_DATE, kpis };
}

/* ---------------------------------------------------------------------
   Chart series
   --------------------------------------------------------------------- */
// Sign-in activity inside the selected range. Granularity adapts to the range length.
export function activitySeries(range, lang) {
  if (isEmptyRange(range)) return { unit: 'day', data: [] };
  const end = effectiveEnd(range);
  const len = daysBetween(range.start, end);
  if (len < 1) return { unit: 'day', data: [] };
  const buckets = [];
  let unit = 'day';
  if (len <= 45) { for (let d = range.start; d <= end; d = addDays(d, 1)) buckets.push([d, d]); }
  else if (len <= 150) { unit = 'week'; for (let a = range.start; a <= end; a = addDays(a, 7)) { const b = addDays(a, 6); buckets.push([a, b > end ? end : b]); } }
  else { unit = 'month'; for (let a = range.start; a <= end;) { const me = monthEnd(a.slice(0, 7)); const b = me > end ? end : me; buckets.push([a, b]); a = addDays(b, 1); } }
  const shortDay = (iso) => { const s = fmtDate(iso, lang); return s.slice(0, s.lastIndexOf(' ')); };
  const data = buckets.map(([a, b]) => {
    const set = new Set(); let n = 0;
    for (const l of LOGINS) { const d = l.ts.slice(0, 10); if (d >= a && d <= b) { set.add(l.adminId); n++; } }
    if (unit === 'day') return { label: shortDay(a), full: fmtDate(a, lang), admins: set.size, signins: n };
    if (unit === 'week') return { label: shortDay(a), full: `${fmtDate(a, lang)} – ${fmtDate(b, lang)}`, admins: set.size, signins: n };
    return { label: `${monthShort(a, lang)} ${a.slice(2, 4)}`, full: `${monthShort(a, lang)} ${a.slice(0, 4)}`, admins: set.size, signins: n };
  });
  return { unit, data };
}

// Status distribution at the end of each of the last `n` months up to the end of the selected range
export function statusSeries(m, range, n, lang) {
  if (isEmptyRange(range)) return [];
  const asOf = effectiveEnd(range), ek = asOf.slice(0, 7);
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const k = shiftMonths(ek, -i), date = k === ek ? asOf : monthEnd(k);
    const snap = snapshot(m, date);
    if (!snap.length) continue;
    const row = { label: monthShort(`${k}-01`, lang), full: `${monthShort(`${k}-01`, lang)} ${k.slice(0, 4)}`, asOf: date, active: 0, inactive: 0, pending: 0, suspended: 0 };
    snap.forEach((s) => { row[s.status] += 1; });
    out.push(row);
  }
  return out;
}

export function recentEvents(m, range) {
  if (isEmptyRange(range)) return [];
  const r = { start: range.start, end: effectiveEnd(range) };
  return m.state.events.filter((e) => inRange(e.ts, r)).slice().sort((a, b) => b.ts.localeCompare(a.ts) || b.id.localeCompare(a.id));
}

export function securityInsights(m, range) {
  if (isEmptyRange(range)) return { suspended: 0, stale: 0, dormant: 0, noOwner: 0 };
  const asOf = effectiveEnd(range);
  const snap = snapshot(m, asOf);
  const staleCut = addDays(asOf, -STALE_INVITE_DAYS), dormantCut = addDays(asOf, -DORMANT_DAYS);
  const stale = snap.filter((s) => s.status === 'pending' && s.since.slice(0, 10) <= staleCut).length;
  const dormant = snap.filter((s) => { if (s.status !== 'active') return false; const l = lastLoginAt(s.admin.id, asOf); return !l || l.slice(0, 10) <= dormantCut; }).length;
  const companies = new Set(snap.map((s) => s.admin.companyId));
  const noOwner = [...companies].filter((c) => !snap.some((s) => s.admin.companyId === c && s.admin.role === 'owner' && s.status === 'active')).length;
  return { suspended: snap.filter((s) => s.status === 'suspended').length, stale, dormant, noOwner };
}

/* ---------------------------------------------------------------------
   Page translations (en / fr / de). Kept here so the shared translations.js does not have to change.
   --------------------------------------------------------------------- */
const en = {
  'ca.title': 'Customer Admins',
  'ca.subtitle': 'Manage administrator accounts for customer organizations, monitor their activity and control their access.',
  'ca.add': 'Add Customer Admin', 'ca.export': 'Export', 'ca.viewAll': 'View All', 'ca.total': 'Total', 'ca.asOf': 'As of {d}',
  'ca.noData': 'No data for the selected period', 'ca.future': 'Data is available up to {d}; later dates contain no records.',
  'ca.kpi.total': 'Total Customer Admins', 'ca.kpi.active': 'Active Admins', 'ca.kpi.inactive': 'Inactive Admins', 'ca.kpi.pending': 'Pending Invitations', 'ca.kpi.suspended': 'Suspended Admins',
  'ca.kd.total': '{n} new in period', 'ca.kd.active': '{p}% of all admins', 'ca.kd.inactive': '{p}% of all admins', 'ca.kd.pending': '{n} invited in period', 'ca.kd.suspended': '{n} suspended in period',
  'ca.kdesc.total': 'All customer admin accounts that existed at the end of the selected period.',
  'ca.kdesc.active': 'Accounts that were active at the end of the selected period.',
  'ca.kdesc.inactive': 'Accounts that were deactivated at the end of the selected period.',
  'ca.kdesc.pending': 'Invitations sent but not yet accepted at the end of the selected period.',
  'ca.kdesc.suspended': 'Accounts whose access was suspended at the end of the selected period.',
  'ca.ch.activity': 'Admin Activity Overview', 'ca.ch.roles': 'Admins by Role', 'ca.ch.status': 'Admin Status',
  'ca.ser.admins': 'Admins signed in', 'ca.ser.signins': 'Sign-ins', 'ca.unit.day': 'Per day', 'ca.unit.week': 'Per week', 'ca.unit.month': 'Per month',
  'ca.win.6': 'Last 6 Months', 'ca.win.12': 'Last 12 Months', 'ca.tt.asOf': 'Status at the end of the month',
  'ca.role.owner': 'Owner', 'ca.role.admin': 'Admin', 'ca.role.billing': 'Billing Admin', 'ca.role.operations': 'Operations Admin', 'ca.role.viewer': 'Viewer',
  'ca.st.active': 'Active', 'ca.st.inactive': 'Inactive', 'ca.st.pending': 'Pending', 'ca.st.suspended': 'Suspended',
  'ca.tbl.title': 'Customer Admins', 'ca.tbl.note': 'The table lists all current accounts. Sign-ins use the selected period; KPIs and charts are calculated as of the end of the period.',
  'ca.col.admin': 'Admin', 'ca.col.email': 'Email Address', 'ca.col.company': 'Company', 'ca.col.role': 'Role', 'ca.col.status': 'Status', 'ca.col.last': 'Last Login', 'ca.col.invited': 'Invited On', 'ca.col.signins': 'Sign-ins (period)', 'ca.col.actions': 'Actions',
  'ca.search': 'Search by name, email or company…', 'ca.search.label': 'Search customer admins', 'ca.clearSearch': 'Clear search',
  'ca.f.status': 'Status', 'ca.f.company': 'Company', 'ca.f.role': 'Role', 'ca.f.allStatus': 'All statuses', 'ca.f.allCompany': 'All companies', 'ca.f.allRole': 'All roles',
  'ca.f.search': 'Search', 'ca.f.active': 'Active filters', 'ca.f.remove': 'Remove filter {f}', 'ca.clearAll': 'Clear all',
  'ca.showing': 'Showing {a}–{b} of {n}', 'ca.page.prev': 'Previous page', 'ca.page.next': 'Next page', 'ca.page.go': 'Page {p}', 'ca.page.nav': 'Pagination',
  'ca.empty.title': 'No customer admins found', 'ca.empty.sub': 'Try a different search or remove some filters.', 'ca.never': 'Never',
  'ca.act.menu': 'Actions for {name}', 'ca.act.view': 'View Details', 'ca.act.edit': 'Edit Admin', 'ca.act.resend': 'Resend Invitation', 'ca.act.activate': 'Activate Account', 'ca.act.deactivate': 'Deactivate Account', 'ca.act.suspend': 'Suspend Access', 'ca.act.restore': 'Restore Access',
  'ca.form.addTitle': 'Add Customer Admin', 'ca.form.editTitle': 'Edit Customer Admin', 'ca.form.name': 'Full name', 'ca.form.email': 'Email address', 'ca.form.company': 'Customer organization', 'ca.form.role': 'Role', 'ca.form.status': 'Account status',
  'ca.form.pick': 'Select a company', 'ca.form.invNote': 'The admin is added with a pending invitation. This is a demonstration — no email is sent and no account is provisioned.',
  'ca.form.pendingNote': 'Status stays “Pending” until the invitation is accepted.',
  'ca.btn.save': 'Save changes', 'ca.btn.addAdmin': 'Add admin', 'ca.btn.cancel': 'Cancel', 'ca.btn.confirm': 'Confirm', 'ca.btn.edit': 'Edit', 'ca.btn.close': 'Close',
  'ca.err.name': 'Enter the admin’s full name.', 'ca.err.email': 'Enter an email address.', 'ca.err.emailInvalid': 'Enter a valid email address.', 'ca.err.emailDup': 'Another admin already uses this email address.',
  'ca.err.company': 'Select a customer organization.', 'ca.err.owner': 'This company already has an Owner. Choose another role.',
  'ca.cf.suspend.t': 'Suspend access?', 'ca.cf.suspend.b': '{name} will lose access to {company} immediately. You can restore access later.',
  'ca.cf.restore.t': 'Restore access?', 'ca.cf.restore.b': '{name} will regain access to {company}.',
  'ca.cf.deactivate.t': 'Deactivate account?', 'ca.cf.deactivate.b': '{name} will no longer be able to sign in to {company}. You can reactivate the account later.',
  'ca.cf.demo': 'Demonstration only — nothing is changed on a server.',
  'ca.toast.added': 'Invitation recorded for {name} (demo — no email was sent).', 'ca.toast.updated': 'Changes saved for {name}.', 'ca.toast.noChange': 'No changes to save.',
  'ca.toast.activated': '{name} activated.', 'ca.toast.deactivated': '{name} deactivated.', 'ca.toast.suspended': 'Access suspended for {name}.', 'ca.toast.restored': 'Access restored for {name}.',
  'ca.toast.resent': 'Invitation re-sent to {name} (demo — no email was sent).', 'ca.toast.exported': 'Exported {n} records to CSV.', 'ca.toast.reset': 'Demo data reset.',
  'ca.dt.title': 'Admin details', 'ca.dt.since': 'In current status since', 'ca.dt.invited': 'Invited on', 'ca.dt.accepted': 'Invitation accepted', 'ca.dt.last': 'Last login', 'ca.dt.signinsP': 'Sign-ins in selected period', 'ca.dt.signins30': 'Sign-ins, last 30 days', 'ca.dt.history': 'Account history', 'ca.dt.none': 'No history recorded.', 'ca.dt.notAccepted': 'Not yet accepted',
  'ca.dr.dates': 'Date information', 'ca.dr.period': 'Selected period', 'ca.dr.asof': 'Calculated as of', 'ca.dr.prevPeriod': 'Previous period', 'ca.dr.prevValue': 'Value at end of previous period', 'ca.dr.change': 'Change',
  'ca.dr.movement': 'Activity in selected period', 'ca.dr.byRole': 'By role', 'ca.dr.byCompany': 'By company', 'ca.dr.records': 'Records ({n})', 'ca.dr.more': 'Showing {a} of {n} records', 'ca.dr.showTable': 'Show in table',
  'ca.dr.nodata': 'No admins in this category for the selected period.', 'ca.dr.note': 'Statuses are calculated as of the end of the selected period. Roles show current assignments.', 'ca.dr.since': 'Since {d}', 'ca.dr.invitedOn': 'Invited {d}',
  'ca.mv.created': 'Accounts created', 'ca.mv.accepted': 'Invitations accepted', 'ca.mv.joinedActive': 'Became active', 'ca.mv.leftActive': 'Stopped being active', 'ca.mv.deactivated': 'Accounts deactivated', 'ca.mv.reactivated': 'Accounts reactivated',
  'ca.mv.invited': 'Invitations sent', 'ca.mv.resent': 'Invitations re-sent', 'ca.mv.suspended': 'Access suspended', 'ca.mv.restored': 'Access restored',
  'ca.pn.top': 'Top Companies by Admins', 'ca.pn.actions': 'Recent Actions', 'ca.pn.insights': 'Security Insights', 'ca.pn.actionsAll': 'Administrative actions in the selected period', 'ca.pn.noActions': 'No administrative actions in the selected period.', 'ca.pn.companyHint': 'Show this company in the table',
  'ca.ev.invited': 'New customer admin invited: {name} ({company})', 'ca.ev.accepted': '{name} accepted the invitation', 'ca.ev.activated': 'Account activated: {name}', 'ca.ev.deactivated': 'Account deactivated: {name}', 'ca.ev.suspended': 'Admin suspended: {name}', 'ca.ev.restored': 'Access restored: {name}',
  'ca.ev.role_changed': 'Role updated for {name}: {from} → {to}', 'ca.ev.updated': 'Details updated for {name}', 'ca.ev.resent': 'Invitation re-sent to {name}', 'ca.ev.by': 'by {actor}',
  'ca.in.ok': 'No issues found', 'ca.in.okSub': 'Admin activity is within the normal range', 'ca.in.suspended': 'Suspended admins: {n}', 'ca.in.suspendedSub': 'Review whether access should be restored', 'ca.in.stale': 'Invitations pending over 14 days: {n}', 'ca.in.staleSub': 'Consider re-sending the invitation',
  'ca.in.dormant': 'Active admins with no sign-in for 30 days: {n}', 'ca.in.dormantSub': 'Check whether these accounts are still needed', 'ca.in.noOwner': 'Companies without an active Owner: {n}', 'ca.in.noOwnerSub': 'Assign an owner to keep accountability clear',
  'ca.reset': 'Reset demo data', 'ca.demoNote': 'Demonstration data only — changes are stored in this browser (localStorage), not on a server.', 'ca.drawer': '{title} details',
  'ca.csv.name': 'Name', 'ca.na': '–',
};

const fr = {
  'ca.title': 'Administrateurs clients',
  'ca.subtitle': 'Gérez les comptes administrateurs des organisations clientes, suivez leur activité et contrôlez leurs accès.',
  'ca.add': 'Ajouter un administrateur', 'ca.export': 'Exporter', 'ca.viewAll': 'Tout voir', 'ca.total': 'Total', 'ca.asOf': 'Au {d}',
  'ca.noData': 'Aucune donnée pour la période sélectionnée', 'ca.future': 'Les données vont jusqu’au {d} ; les dates ultérieures ne contiennent aucun enregistrement.',
  'ca.kpi.total': 'Total des administrateurs clients', 'ca.kpi.active': 'Administrateurs actifs', 'ca.kpi.inactive': 'Administrateurs inactifs', 'ca.kpi.pending': 'Invitations en attente', 'ca.kpi.suspended': 'Administrateurs suspendus',
  'ca.kd.total': '{n} nouveaux sur la période', 'ca.kd.active': '{p} % des administrateurs', 'ca.kd.inactive': '{p} % des administrateurs', 'ca.kd.pending': '{n} invitations sur la période', 'ca.kd.suspended': '{n} suspensions sur la période',
  'ca.kdesc.total': 'Tous les comptes administrateurs clients existant à la fin de la période sélectionnée.',
  'ca.kdesc.active': 'Comptes actifs à la fin de la période sélectionnée.',
  'ca.kdesc.inactive': 'Comptes désactivés à la fin de la période sélectionnée.',
  'ca.kdesc.pending': 'Invitations envoyées mais non acceptées à la fin de la période sélectionnée.',
  'ca.kdesc.suspended': 'Comptes dont l’accès était suspendu à la fin de la période sélectionnée.',
  'ca.ch.activity': 'Aperçu de l’activité des administrateurs', 'ca.ch.roles': 'Administrateurs par rôle', 'ca.ch.status': 'Statut des administrateurs',
  'ca.ser.admins': 'Administrateurs connectés', 'ca.ser.signins': 'Connexions', 'ca.unit.day': 'Par jour', 'ca.unit.week': 'Par semaine', 'ca.unit.month': 'Par mois',
  'ca.win.6': '6 derniers mois', 'ca.win.12': '12 derniers mois', 'ca.tt.asOf': 'Statut à la fin du mois',
  'ca.role.owner': 'Propriétaire', 'ca.role.admin': 'Administrateur', 'ca.role.billing': 'Admin facturation', 'ca.role.operations': 'Admin opérations', 'ca.role.viewer': 'Lecteur',
  'ca.st.active': 'Actif', 'ca.st.inactive': 'Inactif', 'ca.st.pending': 'En attente', 'ca.st.suspended': 'Suspendu',
  'ca.tbl.title': 'Administrateurs clients', 'ca.tbl.note': 'Le tableau liste tous les comptes actuels. Les connexions suivent la période sélectionnée ; les indicateurs et graphiques sont calculés à la fin de la période.',
  'ca.col.admin': 'Administrateur', 'ca.col.email': 'Adresse e-mail', 'ca.col.company': 'Entreprise', 'ca.col.role': 'Rôle', 'ca.col.status': 'Statut', 'ca.col.last': 'Dernière connexion', 'ca.col.invited': 'Invité le', 'ca.col.signins': 'Connexions (période)', 'ca.col.actions': 'Actions',
  'ca.search': 'Rechercher par nom, e-mail ou entreprise…', 'ca.search.label': 'Rechercher des administrateurs clients', 'ca.clearSearch': 'Effacer la recherche',
  'ca.f.status': 'Statut', 'ca.f.company': 'Entreprise', 'ca.f.role': 'Rôle', 'ca.f.allStatus': 'Tous les statuts', 'ca.f.allCompany': 'Toutes les entreprises', 'ca.f.allRole': 'Tous les rôles',
  'ca.f.search': 'Recherche', 'ca.f.active': 'Filtres actifs', 'ca.f.remove': 'Retirer le filtre {f}', 'ca.clearAll': 'Tout effacer',
  'ca.showing': 'Affichage de {a} à {b} sur {n}', 'ca.page.prev': 'Page précédente', 'ca.page.next': 'Page suivante', 'ca.page.go': 'Page {p}', 'ca.page.nav': 'Pagination',
  'ca.empty.title': 'Aucun administrateur client trouvé', 'ca.empty.sub': 'Essayez une autre recherche ou retirez des filtres.', 'ca.never': 'Jamais',
  'ca.act.menu': 'Actions pour {name}', 'ca.act.view': 'Voir les détails', 'ca.act.edit': 'Modifier l’administrateur', 'ca.act.resend': 'Renvoyer l’invitation', 'ca.act.activate': 'Activer le compte', 'ca.act.deactivate': 'Désactiver le compte', 'ca.act.suspend': 'Suspendre l’accès', 'ca.act.restore': 'Rétablir l’accès',
  'ca.form.addTitle': 'Ajouter un administrateur client', 'ca.form.editTitle': 'Modifier l’administrateur client', 'ca.form.name': 'Nom complet', 'ca.form.email': 'Adresse e-mail', 'ca.form.company': 'Organisation cliente', 'ca.form.role': 'Rôle', 'ca.form.status': 'Statut du compte',
  'ca.form.pick': 'Sélectionnez une entreprise', 'ca.form.invNote': 'L’administrateur est ajouté avec une invitation en attente. Il s’agit d’une démonstration : aucun e-mail n’est envoyé et aucun compte n’est créé.',
  'ca.form.pendingNote': 'Le statut reste « En attente » tant que l’invitation n’est pas acceptée.',
  'ca.btn.save': 'Enregistrer', 'ca.btn.addAdmin': 'Ajouter', 'ca.btn.cancel': 'Annuler', 'ca.btn.confirm': 'Confirmer', 'ca.btn.edit': 'Modifier', 'ca.btn.close': 'Fermer',
  'ca.err.name': 'Saisissez le nom complet de l’administrateur.', 'ca.err.email': 'Saisissez une adresse e-mail.', 'ca.err.emailInvalid': 'Saisissez une adresse e-mail valide.', 'ca.err.emailDup': 'Un autre administrateur utilise déjà cette adresse e-mail.',
  'ca.err.company': 'Sélectionnez une organisation cliente.', 'ca.err.owner': 'Cette entreprise a déjà un propriétaire. Choisissez un autre rôle.',
  'ca.cf.suspend.t': 'Suspendre l’accès ?', 'ca.cf.suspend.b': '{name} perdra immédiatement l’accès à {company}. Vous pourrez rétablir l’accès plus tard.',
  'ca.cf.restore.t': 'Rétablir l’accès ?', 'ca.cf.restore.b': '{name} retrouvera l’accès à {company}.',
  'ca.cf.deactivate.t': 'Désactiver le compte ?', 'ca.cf.deactivate.b': '{name} ne pourra plus se connecter à {company}. Vous pourrez réactiver le compte plus tard.',
  'ca.cf.demo': 'Démonstration uniquement — rien n’est modifié sur un serveur.',
  'ca.toast.added': 'Invitation enregistrée pour {name} (démo — aucun e-mail envoyé).', 'ca.toast.updated': 'Modifications enregistrées pour {name}.', 'ca.toast.noChange': 'Aucune modification à enregistrer.',
  'ca.toast.activated': '{name} activé.', 'ca.toast.deactivated': '{name} désactivé.', 'ca.toast.suspended': 'Accès suspendu pour {name}.', 'ca.toast.restored': 'Accès rétabli pour {name}.',
  'ca.toast.resent': 'Invitation renvoyée à {name} (démo — aucun e-mail envoyé).', 'ca.toast.exported': '{n} enregistrements exportés en CSV.', 'ca.toast.reset': 'Données de démonstration réinitialisées.',
  'ca.dt.title': 'Détails de l’administrateur', 'ca.dt.since': 'Dans ce statut depuis', 'ca.dt.invited': 'Invité le', 'ca.dt.accepted': 'Invitation acceptée', 'ca.dt.last': 'Dernière connexion', 'ca.dt.signinsP': 'Connexions sur la période', 'ca.dt.signins30': 'Connexions, 30 derniers jours', 'ca.dt.history': 'Historique du compte', 'ca.dt.none': 'Aucun historique enregistré.', 'ca.dt.notAccepted': 'Pas encore acceptée',
  'ca.dr.dates': 'Informations de date', 'ca.dr.period': 'Période sélectionnée', 'ca.dr.asof': 'Calculé au', 'ca.dr.prevPeriod': 'Période précédente', 'ca.dr.prevValue': 'Valeur à la fin de la période précédente', 'ca.dr.change': 'Évolution',
  'ca.dr.movement': 'Activité sur la période', 'ca.dr.byRole': 'Par rôle', 'ca.dr.byCompany': 'Par entreprise', 'ca.dr.records': 'Enregistrements ({n})', 'ca.dr.more': '{a} enregistrements affichés sur {n}', 'ca.dr.showTable': 'Afficher dans le tableau',
  'ca.dr.nodata': 'Aucun administrateur dans cette catégorie pour la période sélectionnée.', 'ca.dr.note': 'Les statuts sont calculés à la fin de la période sélectionnée. Les rôles indiquent les attributions actuelles.', 'ca.dr.since': 'Depuis le {d}', 'ca.dr.invitedOn': 'Invité le {d}',
  'ca.mv.created': 'Comptes créés', 'ca.mv.accepted': 'Invitations acceptées', 'ca.mv.joinedActive': 'Devenus actifs', 'ca.mv.leftActive': 'N’étant plus actifs', 'ca.mv.deactivated': 'Comptes désactivés', 'ca.mv.reactivated': 'Comptes réactivés',
  'ca.mv.invited': 'Invitations envoyées', 'ca.mv.resent': 'Invitations renvoyées', 'ca.mv.suspended': 'Accès suspendus', 'ca.mv.restored': 'Accès rétablis',
  'ca.pn.top': 'Principales entreprises par administrateurs', 'ca.pn.actions': 'Actions récentes', 'ca.pn.insights': 'Analyses de sécurité', 'ca.pn.actionsAll': 'Actions d’administration sur la période sélectionnée', 'ca.pn.noActions': 'Aucune action d’administration sur la période sélectionnée.', 'ca.pn.companyHint': 'Afficher cette entreprise dans le tableau',
  'ca.ev.invited': 'Nouvel administrateur client invité : {name} ({company})', 'ca.ev.accepted': '{name} a accepté l’invitation', 'ca.ev.activated': 'Compte activé : {name}', 'ca.ev.deactivated': 'Compte désactivé : {name}', 'ca.ev.suspended': 'Administrateur suspendu : {name}', 'ca.ev.restored': 'Accès rétabli : {name}',
  'ca.ev.role_changed': 'Rôle modifié pour {name} : {from} → {to}', 'ca.ev.updated': 'Informations mises à jour pour {name}', 'ca.ev.resent': 'Invitation renvoyée à {name}', 'ca.ev.by': 'par {actor}',
  'ca.in.ok': 'Aucun problème détecté', 'ca.in.okSub': 'L’activité des administrateurs est dans la normale', 'ca.in.suspended': 'Administrateurs suspendus : {n}', 'ca.in.suspendedSub': 'Vérifiez si l’accès doit être rétabli', 'ca.in.stale': 'Invitations en attente depuis plus de 14 jours : {n}', 'ca.in.staleSub': 'Pensez à renvoyer l’invitation',
  'ca.in.dormant': 'Administrateurs actifs sans connexion depuis 30 jours : {n}', 'ca.in.dormantSub': 'Vérifiez si ces comptes sont encore nécessaires', 'ca.in.noOwner': 'Entreprises sans propriétaire actif : {n}', 'ca.in.noOwnerSub': 'Attribuez un propriétaire pour clarifier les responsabilités',
  'ca.reset': 'Réinitialiser les données de démo', 'ca.demoNote': 'Données de démonstration uniquement — les modifications sont stockées dans ce navigateur (localStorage), pas sur un serveur.', 'ca.drawer': 'Détails : {title}',
  'ca.csv.name': 'Nom', 'ca.na': '–',
};

const de = {
  'ca.title': 'Kundenadministratoren',
  'ca.subtitle': 'Verwalten Sie die Administratorkonten der Kundenorganisationen, überwachen Sie deren Aktivität und steuern Sie ihre Zugriffe.',
  'ca.add': 'Kundenadministrator hinzufügen', 'ca.export': 'Exportieren', 'ca.viewAll': 'Alle anzeigen', 'ca.total': 'Gesamt', 'ca.asOf': 'Stand {d}',
  'ca.noData': 'Keine Daten für den ausgewählten Zeitraum', 'ca.future': 'Daten sind bis {d} verfügbar; spätere Daten enthalten keine Datensätze.',
  'ca.kpi.total': 'Kundenadministratoren gesamt', 'ca.kpi.active': 'Aktive Administratoren', 'ca.kpi.inactive': 'Inaktive Administratoren', 'ca.kpi.pending': 'Ausstehende Einladungen', 'ca.kpi.suspended': 'Gesperrte Administratoren',
  'ca.kd.total': '{n} neu im Zeitraum', 'ca.kd.active': '{p} % aller Administratoren', 'ca.kd.inactive': '{p} % aller Administratoren', 'ca.kd.pending': '{n} Einladungen im Zeitraum', 'ca.kd.suspended': '{n} Sperrungen im Zeitraum',
  'ca.kdesc.total': 'Alle Kundenadministratorkonten, die am Ende des gewählten Zeitraums existierten.',
  'ca.kdesc.active': 'Konten, die am Ende des gewählten Zeitraums aktiv waren.',
  'ca.kdesc.inactive': 'Konten, die am Ende des gewählten Zeitraums deaktiviert waren.',
  'ca.kdesc.pending': 'Gesendete, aber noch nicht angenommene Einladungen am Ende des gewählten Zeitraums.',
  'ca.kdesc.suspended': 'Konten, deren Zugriff am Ende des gewählten Zeitraums gesperrt war.',
  'ca.ch.activity': 'Administratoraktivität im Überblick', 'ca.ch.roles': 'Administratoren nach Rolle', 'ca.ch.status': 'Administratorstatus',
  'ca.ser.admins': 'Angemeldete Administratoren', 'ca.ser.signins': 'Anmeldungen', 'ca.unit.day': 'Pro Tag', 'ca.unit.week': 'Pro Woche', 'ca.unit.month': 'Pro Monat',
  'ca.win.6': 'Letzte 6 Monate', 'ca.win.12': 'Letzte 12 Monate', 'ca.tt.asOf': 'Status am Monatsende',
  'ca.role.owner': 'Inhaber', 'ca.role.admin': 'Administrator', 'ca.role.billing': 'Abrechnungsadmin', 'ca.role.operations': 'Betriebsadmin', 'ca.role.viewer': 'Betrachter',
  'ca.st.active': 'Aktiv', 'ca.st.inactive': 'Inaktiv', 'ca.st.pending': 'Ausstehend', 'ca.st.suspended': 'Gesperrt',
  'ca.tbl.title': 'Kundenadministratoren', 'ca.tbl.note': 'Die Tabelle zeigt alle aktuellen Konten. Anmeldungen beziehen sich auf den gewählten Zeitraum; Kennzahlen und Diagramme gelten zum Ende des Zeitraums.',
  'ca.col.admin': 'Administrator', 'ca.col.email': 'E-Mail-Adresse', 'ca.col.company': 'Unternehmen', 'ca.col.role': 'Rolle', 'ca.col.status': 'Status', 'ca.col.last': 'Letzte Anmeldung', 'ca.col.invited': 'Eingeladen am', 'ca.col.signins': 'Anmeldungen (Zeitraum)', 'ca.col.actions': 'Aktionen',
  'ca.search': 'Nach Name, E-Mail oder Unternehmen suchen…', 'ca.search.label': 'Kundenadministratoren durchsuchen', 'ca.clearSearch': 'Suche löschen',
  'ca.f.status': 'Status', 'ca.f.company': 'Unternehmen', 'ca.f.role': 'Rolle', 'ca.f.allStatus': 'Alle Status', 'ca.f.allCompany': 'Alle Unternehmen', 'ca.f.allRole': 'Alle Rollen',
  'ca.f.search': 'Suche', 'ca.f.active': 'Aktive Filter', 'ca.f.remove': 'Filter {f} entfernen', 'ca.clearAll': 'Alle zurücksetzen',
  'ca.showing': '{a}–{b} von {n} angezeigt', 'ca.page.prev': 'Vorherige Seite', 'ca.page.next': 'Nächste Seite', 'ca.page.go': 'Seite {p}', 'ca.page.nav': 'Seitennavigation',
  'ca.empty.title': 'Keine Kundenadministratoren gefunden', 'ca.empty.sub': 'Versuchen Sie eine andere Suche oder entfernen Sie Filter.', 'ca.never': 'Nie',
  'ca.act.menu': 'Aktionen für {name}', 'ca.act.view': 'Details anzeigen', 'ca.act.edit': 'Administrator bearbeiten', 'ca.act.resend': 'Einladung erneut senden', 'ca.act.activate': 'Konto aktivieren', 'ca.act.deactivate': 'Konto deaktivieren', 'ca.act.suspend': 'Zugriff sperren', 'ca.act.restore': 'Zugriff wiederherstellen',
  'ca.form.addTitle': 'Kundenadministrator hinzufügen', 'ca.form.editTitle': 'Kundenadministrator bearbeiten', 'ca.form.name': 'Vollständiger Name', 'ca.form.email': 'E-Mail-Adresse', 'ca.form.company': 'Kundenorganisation', 'ca.form.role': 'Rolle', 'ca.form.status': 'Kontostatus',
  'ca.form.pick': 'Unternehmen auswählen', 'ca.form.invNote': 'Der Administrator wird mit einer ausstehenden Einladung hinzugefügt. Dies ist eine Demonstration — es wird keine E-Mail gesendet und kein Konto erstellt.',
  'ca.form.pendingNote': 'Der Status bleibt „Ausstehend“, bis die Einladung angenommen wird.',
  'ca.btn.save': 'Änderungen speichern', 'ca.btn.addAdmin': 'Administrator hinzufügen', 'ca.btn.cancel': 'Abbrechen', 'ca.btn.confirm': 'Bestätigen', 'ca.btn.edit': 'Bearbeiten', 'ca.btn.close': 'Schließen',
  'ca.err.name': 'Geben Sie den vollständigen Namen ein.', 'ca.err.email': 'Geben Sie eine E-Mail-Adresse ein.', 'ca.err.emailInvalid': 'Geben Sie eine gültige E-Mail-Adresse ein.', 'ca.err.emailDup': 'Ein anderer Administrator verwendet diese E-Mail-Adresse bereits.',
  'ca.err.company': 'Wählen Sie eine Kundenorganisation aus.', 'ca.err.owner': 'Dieses Unternehmen hat bereits einen Inhaber. Wählen Sie eine andere Rolle.',
  'ca.cf.suspend.t': 'Zugriff sperren?', 'ca.cf.suspend.b': '{name} verliert sofort den Zugriff auf {company}. Der Zugriff kann später wiederhergestellt werden.',
  'ca.cf.restore.t': 'Zugriff wiederherstellen?', 'ca.cf.restore.b': '{name} erhält wieder Zugriff auf {company}.',
  'ca.cf.deactivate.t': 'Konto deaktivieren?', 'ca.cf.deactivate.b': '{name} kann sich nicht mehr bei {company} anmelden. Das Konto kann später reaktiviert werden.',
  'ca.cf.demo': 'Nur Demonstration — auf einem Server wird nichts geändert.',
  'ca.toast.added': 'Einladung für {name} erfasst (Demo — keine E-Mail gesendet).', 'ca.toast.updated': 'Änderungen für {name} gespeichert.', 'ca.toast.noChange': 'Keine Änderungen zu speichern.',
  'ca.toast.activated': '{name} aktiviert.', 'ca.toast.deactivated': '{name} deaktiviert.', 'ca.toast.suspended': 'Zugriff für {name} gesperrt.', 'ca.toast.restored': 'Zugriff für {name} wiederhergestellt.',
  'ca.toast.resent': 'Einladung erneut an {name} gesendet (Demo — keine E-Mail gesendet).', 'ca.toast.exported': '{n} Datensätze als CSV exportiert.', 'ca.toast.reset': 'Demodaten zurückgesetzt.',
  'ca.dt.title': 'Administratordetails', 'ca.dt.since': 'Im aktuellen Status seit', 'ca.dt.invited': 'Eingeladen am', 'ca.dt.accepted': 'Einladung angenommen', 'ca.dt.last': 'Letzte Anmeldung', 'ca.dt.signinsP': 'Anmeldungen im gewählten Zeitraum', 'ca.dt.signins30': 'Anmeldungen, letzte 30 Tage', 'ca.dt.history': 'Kontoverlauf', 'ca.dt.none': 'Kein Verlauf erfasst.', 'ca.dt.notAccepted': 'Noch nicht angenommen',
  'ca.dr.dates': 'Datumsangaben', 'ca.dr.period': 'Gewählter Zeitraum', 'ca.dr.asof': 'Berechnet zum', 'ca.dr.prevPeriod': 'Vorheriger Zeitraum', 'ca.dr.prevValue': 'Wert am Ende des vorherigen Zeitraums', 'ca.dr.change': 'Veränderung',
  'ca.dr.movement': 'Aktivität im gewählten Zeitraum', 'ca.dr.byRole': 'Nach Rolle', 'ca.dr.byCompany': 'Nach Unternehmen', 'ca.dr.records': 'Datensätze ({n})', 'ca.dr.more': '{a} von {n} Datensätzen angezeigt', 'ca.dr.showTable': 'In Tabelle anzeigen',
  'ca.dr.nodata': 'Keine Administratoren in dieser Kategorie für den gewählten Zeitraum.', 'ca.dr.note': 'Status werden zum Ende des gewählten Zeitraums berechnet. Rollen zeigen die aktuellen Zuweisungen.', 'ca.dr.since': 'Seit {d}', 'ca.dr.invitedOn': 'Eingeladen am {d}',
  'ca.mv.created': 'Erstellte Konten', 'ca.mv.accepted': 'Angenommene Einladungen', 'ca.mv.joinedActive': 'Aktiv geworden', 'ca.mv.leftActive': 'Nicht mehr aktiv', 'ca.mv.deactivated': 'Deaktivierte Konten', 'ca.mv.reactivated': 'Reaktivierte Konten',
  'ca.mv.invited': 'Gesendete Einladungen', 'ca.mv.resent': 'Erneut gesendete Einladungen', 'ca.mv.suspended': 'Gesperrte Zugriffe', 'ca.mv.restored': 'Wiederhergestellte Zugriffe',
  'ca.pn.top': 'Top-Unternehmen nach Administratoren', 'ca.pn.actions': 'Letzte Aktionen', 'ca.pn.insights': 'Sicherheitshinweise', 'ca.pn.actionsAll': 'Administrative Aktionen im gewählten Zeitraum', 'ca.pn.noActions': 'Keine administrativen Aktionen im gewählten Zeitraum.', 'ca.pn.companyHint': 'Dieses Unternehmen in der Tabelle anzeigen',
  'ca.ev.invited': 'Neuer Kundenadministrator eingeladen: {name} ({company})', 'ca.ev.accepted': '{name} hat die Einladung angenommen', 'ca.ev.activated': 'Konto aktiviert: {name}', 'ca.ev.deactivated': 'Konto deaktiviert: {name}', 'ca.ev.suspended': 'Administrator gesperrt: {name}', 'ca.ev.restored': 'Zugriff wiederhergestellt: {name}',
  'ca.ev.role_changed': 'Rolle geändert für {name}: {from} → {to}', 'ca.ev.updated': 'Angaben aktualisiert für {name}', 'ca.ev.resent': 'Einladung erneut an {name} gesendet', 'ca.ev.by': 'von {actor}',
  'ca.in.ok': 'Keine Probleme gefunden', 'ca.in.okSub': 'Die Administratoraktivität liegt im normalen Bereich', 'ca.in.suspended': 'Gesperrte Administratoren: {n}', 'ca.in.suspendedSub': 'Prüfen, ob der Zugriff wiederhergestellt werden soll', 'ca.in.stale': 'Einladungen seit über 14 Tagen ausstehend: {n}', 'ca.in.staleSub': 'Einladung erneut senden',
  'ca.in.dormant': 'Aktive Administratoren ohne Anmeldung seit 30 Tagen: {n}', 'ca.in.dormantSub': 'Prüfen, ob diese Konten noch benötigt werden', 'ca.in.noOwner': 'Unternehmen ohne aktiven Inhaber: {n}', 'ca.in.noOwnerSub': 'Inhaber zuweisen, um Verantwortlichkeiten zu klären',
  'ca.reset': 'Demodaten zurücksetzen', 'ca.demoNote': 'Nur Demodaten — Änderungen werden in diesem Browser (localStorage) gespeichert, nicht auf einem Server.', 'ca.drawer': 'Details: {title}',
  'ca.csv.name': 'Name', 'ca.na': '–',
};

export const CA_TRANSLATIONS = { en, fr, de };