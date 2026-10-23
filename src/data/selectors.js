// Date helpers + all date-dependent derivations. Components never filter by date themselves.
import { ACTIVITY, BASE, COMPANIES, MONTHLY, PLAN_MIX, SIGNUPS } from './mockData.js';
import { fmtDate, monthShort } from '../i18n/translations.js';

const DAY = 864e5;
const pad = (n) => String(n).padStart(2, '0');
export const toDate = (s) => { const [y, m, d] = s.slice(0, 10).split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
export const toISO = (d) => d.toISOString().slice(0, 10);
export const addDays = (s, n) => toISO(new Date(toDate(s).getTime() + n * DAY));
export const daysBetween = (a, b) => Math.round((toDate(b) - toDate(a)) / DAY) + 1;
const dim = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
export const monthEnd = (k) => `${k}-${pad(dim(+k.slice(0, 4), +k.slice(5, 7)))}`;
export const shiftMonths = (k, n) => { let y = +k.slice(0, 4), m = +k.slice(5, 7) + n; y += Math.floor((m - 1) / 12); m = ((m - 1) % 12 + 12) % 12 + 1; return `${y}-${pad(m)}`; };
export const inRange = (iso, r) => { const d = iso.slice(0, 10); return d >= r.start && d <= r.end; };

const KEYS = Object.keys(MONTHLY).sort();
export const DATA_START = `${KEYS[0]}-01`;
export const DATA_END = monthEnd(KEYS[KEYS.length - 1]);
export const hasData = (r) => r.end >= DATA_START && r.start <= DATA_END;

export const PRESETS = [
  { id: 'oct', start: '2026-10-01', end: '2026-10-31' }, { id: 'sep', start: '2026-09-01', end: '2026-09-30' },
  { id: 'q3', start: '2026-07-01', end: '2026-09-30' }, { id: 'ytd', start: '2026-01-01', end: '2026-10-31' },
  { id: 'l12', start: '2025-11-01', end: '2026-10-31' },
];

// fraction of month `k` covered by [a,b]
function overlap(k, a, b) {
  const s = `${k}-01`, e = monthEnd(k), lo = a > s ? a : s, hi = b < e ? b : e;
  return lo > hi ? 0 : daysBetween(lo, hi) / dim(+k.slice(0, 4), +k.slice(5, 7));
}
// Period-specific flow (revenue, incidents): prorated by days
export const periodSum = (f, a, b) => KEYS.reduce((t, k) => t + MONTHLY[k][f] * overlap(k, a, b), 0);
// Current total (companies/users/sites) at a date: linear interpolation inside a month
export function totalAt(f, iso) {
  if (iso > DATA_END) iso = DATA_END;
  if (iso < DATA_START) return BASE[f];
  const k = iso.slice(0, 7), i = KEYS.indexOf(k), prev = i > 0 ? MONTHLY[KEYS[i - 1]][f] : BASE[f];
  return prev + (MONTHLY[k][f] - prev) * (+iso.slice(8, 10) / dim(+k.slice(0, 4), +k.slice(5, 7)));
}
// Point-in-time value of a per-month figure (guards on duty) at the month containing `iso`
const snap = (f, iso) => { const k = (iso > DATA_END ? DATA_END : iso).slice(0, 7); return MONTHLY[k]?.[f] ?? 0; };

const monthsCount = (r) => (+r.end.slice(0, 4) - +r.start.slice(0, 4)) * 12 + +r.end.slice(5, 7) - +r.start.slice(5, 7) + 1;
const isWhole = (r) => r.start.endsWith('-01') && r.end === monthEnd(r.end.slice(0, 7));
export const isSingleMonth = (r) => isWhole(r) && monthsCount(r) === 1;
export function previousRange(r) {
  if (isWhole(r)) { const n = monthsCount(r), sk = r.start.slice(0, 7); return { start: `${shiftMonths(sk, -n)}-01`, end: monthEnd(shiftMonths(sk, -1)) }; }
  const len = daysBetween(r.start, r.end); return { start: addDays(r.start, -len), end: addDays(r.start, -1) };
}
const chg = (cur, prev) => (prev ? Math.round(((cur - prev) / prev) * 100) : null);
const split = (total, w) => {
  const s = w.reduce((a, b) => a + b, 0), raw = w.map((x) => (total * x) / s), fl = raw.map(Math.floor);
  let rem = total - fl.reduce((a, b) => a + b, 0);
  raw.map((x, i) => [x - fl[i], i]).sort((a, b) => b[0] - a[0]).slice(0, rem).forEach(([, i]) => fl[i]++);
  return fl;
};
const n0 = (n) => Math.round(n).toLocaleString('en-GB');
const gbp = (n) => `£${Math.round(n).toLocaleString('en-GB')}`;

export function getKpis(r) {
  const ok = hasData(r), before = addDays(r.start, -1), prev = previousRange(r);
  const total = (f) => (ok ? Math.round(totalAt(f, r.end)) : 0);
  const totalChg = (f) => (ok ? chg(totalAt(f, r.end), totalAt(f, before)) : null);
  const flow = (f) => (ok ? periodSum(f, r.start, r.end) : 0);
  const flowChg = (f) => (ok && prev.start >= DATA_START ? chg(periodSum(f, r.start, r.end), periodSum(f, prev.start, prev.end)) : null);
  const row = (n, ws, ks) => split(n, ws).map((v, i) => ({ k: ks[i], v: n0(v) }));
  const companies = total('companies'), users = total('users'), sites = total('sites');
  const guards = ok ? snap('guards', r.end) : 0, incidents = Math.round(flow('incidents')), revenue = flow('revenue');
  const plans = split(Math.round(revenue), [3240, 9680, 9030, 6500]).map((v, i) => ({ txt: ['Starter', 'Professional', 'Business', 'Enterprise'][i], v: gbp(v) }));
  const joins = ok ? Math.round(totalAt('companies', r.end) - totalAt('companies', before)) : 0;
  return [
    { id: 'companies', value: n0(companies), change: totalChg('companies'), rows: [...row(companies, [49, 5, 2], ['kd.active', 'kd.trial', 'kd.suspended']), { k: 'kd.newPeriod', v: n0(joins) }] },
    { id: 'users', value: n0(users), change: totalChg('users'), rows: row(users, [168, 412, 3262], ['kd.admins', 'kd.managers', 'kd.guards']) },
    { id: 'guards', value: n0(guards), change: ok && prev.end >= DATA_START ? chg(guards, snap('guards', prev.end)) : null, rows: row(guards, [13120, 11560], ['kd.day', 'kd.night']) },
    { id: 'sites', value: n0(sites), change: totalChg('sites'), rows: row(sites, [420, 510, 315], ['kd.corp', 'kd.retail', 'kd.resi']) },
    { id: 'incidents', value: n0(incidents), change: flowChg('incidents'), rows: row(incidents, [12, 96, 320], ['kd.crit', 'kd.mod', 'kd.low']) },
    { id: 'revenue', value: gbp(revenue), change: flowChg('revenue'), rows: plans },
  ];
}

export function getPlanDist(r) {
  const total = hasData(r) ? Math.round(totalAt('companies', r.end)) : 0;
  const vals = split(total, PLAN_MIX.map((p) => p.w));
  return { total, plans: PLAN_MIX.map((p, i) => ({ name: p.name, color: p.color, value: vals[i] })) };
}

// Chart series: window (30d | 6m | 12m) ending at the selected range end.
function series(r, win, lang, kind) {
  if (!hasData(r)) return [];
  const end = r.end > DATA_END ? DATA_END : r.end;
  if (win === '30d') {
    return [0, 1, 2, 3, 4].map((i) => {
      const a = addDays(end, -29 + 6 * i), b = addDays(end, -24 + 6 * i);
      if (b < DATA_START) return null;
      const d = fmtDate(b, lang);
      return { label: d.slice(0, d.lastIndexOf(' ')), full: d, v: kind === 'g' ? Math.round(totalAt('companies', b)) : Math.round(periodSum('revenue', a, b)) };
    }).filter(Boolean);
  }
  const n = win === '6m' ? 6 : 12, ek = end.slice(0, 7);
  return Array.from({ length: n }, (_, i) => shiftMonths(ek, i - n + 1)).filter((k) => MONTHLY[k]).map((k) => {
    const e = k === ek ? end : monthEnd(k);
    return { label: monthShort(k, lang), full: `${monthShort(k, lang)} ${k.slice(0, 4)}`, v: kind === 'g' ? Math.round(totalAt('companies', e)) : Math.round(periodSum('revenue', `${k}-01`, e)) };
  });
}
export const growthSeries = (r, w, l) => series(r, w, l, 'g');
export const revenueSeries = (r, w, l) => series(r, w, l, 'r');

export const getCompanies = (r) => COMPANIES.filter((c) => inRange(c.joined, r)).sort((a, b) => b.joined.localeCompare(a.joined));
export const getSignups = (r) => SIGNUPS.filter((s) => inRange(s.date, r)).sort((a, b) => b.date.localeCompare(a.date));
export const getActivity = (r) => ACTIVITY.filter((a) => inRange(a.ts, r)).sort((a, b) => b.ts.localeCompare(a.ts));
// "As of" ranking: companies that had joined by the end of the range (current totals, not period totals)
export const getTop = (r) => !hasData(r) ? [] : COMPANIES.filter((c) => c.joined <= r.end && c.status !== 'Suspended').map((c) => ({ name: c.name, users: c.tu ?? c.users })).sort((a, b) => b.users - a.users);
