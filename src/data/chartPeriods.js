// Independent per-chart period logic (Today / This Week / This Month / This Year).
// Kept separate from selectors.js so the global range helpers are untouched.
import { MONTHLY } from './mockData.js';
import { fmtDate, monthShort } from '../i18n/translations.js';
import { DATA_END, DATA_START, addDays, getPlanDist, monthEnd, periodSum, toISO, totalAt } from './selectors.js';

const pad = (n) => String(n).padStart(2, '0');

export const PERIOD_MODES = ['today', 'week', 'month', 'year'];
export const PERIOD_LABELS = { today: 'Today', week: 'This Week', month: 'This Month', year: 'This Year' };
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// "Today" clamped into the range the mock dataset covers.
export function refDate() {
  const t = toISO(new Date());
  return t > DATA_END ? DATA_END : t < DATA_START ? DATA_START : t;
}

export const defaultPeriod = () => {
  const r = refDate();
  return { mode: 'year', month: +r.slice(5, 7) - 1, year: +r.slice(0, 4) };
};

export function periodBounds(p) {
  const ref = refDate();
  if (p.mode === 'today') return { start: ref, end: ref };
  if (p.mode === 'week') return { start: addDays(ref, -6), end: ref };
  if (p.mode === 'month') {
    const k = `${p.year}-${pad(p.month + 1)}`;
    return { start: `${k}-01`, end: monthEnd(k) };
  }
  return { start: `${p.year}-01-01`, end: `${p.year}-12-31` };
}

// kind: 'g' (companies running total) | 'r' (revenue for the interval)
export function periodSeries(p, kind, lang) {
  const ref = refDate();
  const val = (a, b) => (kind === 'g' ? Math.round(totalAt('companies', b)) : Math.round(periodSum('revenue', a, b)));
  const short = (iso) => { const d = fmtDate(iso, lang); return d.slice(0, d.lastIndexOf(' ')) || d; };
  let items = [];

  if (p.mode === 'today') {
    const y = addDays(ref, -1);
    items = [[y, y, 'Yesterday', fmtDate(y, lang)], [ref, ref, 'Today', fmtDate(ref, lang)]];
  } else if (p.mode === 'week') {
    items = Array.from({ length: 7 }, (_, i) => { const d = addDays(ref, -6 + i); return [d, d, short(d), fmtDate(d, lang)]; });
  } else if (p.mode === 'month') {
    const k = `${p.year}-${pad(p.month + 1)}`, last = +monthEnd(k).slice(8);
    items = [1, 8, 15, 22].map((s) => {
      const e = s === 22 ? last : s + 6;
      return [`${k}-${pad(s)}`, `${k}-${pad(e)}`, `${s}–${e}`, `${s}–${e} ${monthShort(k, lang)} ${p.year}`];
    });
  } else {
    items = Array.from({ length: 12 }, (_, i) => `${p.year}-${pad(i + 1)}`)
      .filter((k) => MONTHLY[k])
      .map((k) => [`${k}-01`, monthEnd(k), monthShort(k, lang), `${monthShort(k, lang)} ${p.year}`]);
  }

  return items
    .filter(([a, b]) => b >= DATA_START && a <= DATA_END)
    .map(([a, b, label, full]) => ({ label, full, v: val(a, b) }));
}

export function periodPlanDist(p) {
  const { start, end } = periodBounds(p);
  return getPlanDist({ start, end });
}
