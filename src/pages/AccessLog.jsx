import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, AlertTriangle, BarChart3, Building2, CalendarX, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, Download,
  Eye, Flag, Info, KeyRound, LogIn, MapPin, RotateCcw, ScrollText, Search, ShieldAlert, ShieldCheck, UserCheck, Users, X,
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import DateRangeMenu from '../components/DateRangeMenu.jsx';
import { Avatar } from '../components/Common.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { daysBetween } from '../data/selectors.js';
import {
  DATA_FIRST, DATA_LAST, EVENT_BY_ID, LOCALES, LOCATIONS, METHODS, USER_BY_ID,
  CHART_WINDOWS, alTranslator, blockProfile, bucketize, chartMode, chartWindow, clampRange, comparisonRange, eventsInRange,
  groupCount, hourLabel, isFullMonth, pctChange, previousWindow, rangeState, tally, windowStart,
} from '../data/AccessLog.js';
import './AccessLog.css';

const PAGE_SIZE = 8;
const RESULT_COLORS = { success: '#1767ff', failed: '#ff3f4e', denied: '#ff9c0a' };
const METHOD_COLORS = { web: '#0758F9', mobile: '#079447', api: '#7909E8', direct: '#F59E0B', other: '#A9BAD0' };
const STATUS_ORDER = { success: 0, failed: 1, denied: 2 };
const KPI_DEFS = [
  { id: 'total', icon: LogIn, color: 'blue' },
  { id: 'success', icon: UserCheck, color: 'green' },
  { id: 'failed', icon: AlertTriangle, color: 'red' },
  { id: 'denied', icon: ShieldAlert, color: 'purple' },
  { id: 'users', icon: Users, color: 'teal' },
];
const DEFAULT_SORT = { key: 'time', dir: 'desc' };

function Panel({ title, icon: Icon, action, className = '', children, innerRef }) {
  return (
    <section className={`al-panel ${className}`} ref={innerRef}>
      <div className="al-panel-head">
        <span className="al-panel-icon"><Icon size={16} /></span>
        <strong>{title}</strong>
        <span className="al-grow" />
        {action}
      </div>
      {children}
    </section>
  );
}

function StatusBadge({ result, flagged, tr }) {
  return (
    <span className={`al-status ${result}`}>
      <i />{tr(`st.${result}`)}
      {flagged && <Flag size={10} className="al-flag" aria-label={tr('st.flagged')} />}
    </span>
  );
}

const VA_SIZE = 10;
/** Searchable, paginated list used by every "View All" drawer. */
function ViewAllList({ items, empty, tr, num }) {
  const [q, setQ] = useState('');
  const [pg, setPg] = useState(1);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? items.filter((i) => i.search.toLowerCase().includes(s)) : items;
  }, [items, q]);
  const pages = Math.max(1, Math.ceil(list.length / VA_SIZE));
  const p = Math.min(pg, pages);
  const rows = list.slice((p - 1) * VA_SIZE, p * VA_SIZE);
  if (!items.length) return <p className="al-dempty">{empty}</p>;
  return (
    <div className="al-va">
      <label className="al-search"><Search size={14} />
        <input placeholder={tr('va.search')} value={q} aria-label={tr('va.search')} onChange={(e) => { setQ(e.target.value); setPg(1); }} />
      </label>
      {rows.length ? (
        <div className="al-dlist"><ul>
          {rows.map((it) => (
            <li key={it.key}>
              <button onClick={it.onClick}>
                <span className="al-di-l"><b>{it.label}</b>{it.sub && <small>{it.sub}</small>}</span><span className="al-di-v">{it.value}</span>
              </button>
            </li>
          ))}
        </ul></div>
      ) : <p className="al-dempty">{tr('va.noMatch')}</p>}
      <div className="al-va-foot">
        <span>{tr('va.showing', { from: num(list.length ? (p - 1) * VA_SIZE + 1 : 0), to: num(Math.min(p * VA_SIZE, list.length)), total: num(list.length) })}</span>
        <div className="al-pager">
          <button disabled={p === 1} onClick={() => setPg(p - 1)} aria-label={tr('prev')}><ChevronLeft size={14} /></button>
          <button disabled={p === pages} onClick={() => setPg(p + 1)} aria-label={tr('next')}><ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}

const pageList = (cur, total) => {
  const set = new Set([1, total, cur - 1, cur, cur + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => { if (i && n - nums[i - 1] > 1) out.push(`gap${n}`); out.push(n); });
  return out;
};

export default function AccessLog({ range, setRange, toast = () => {} }) {
  const { lang, t, fmtDate, fmtDateTime, monthShort } = useI18n();
  const tr = useMemo(() => alTranslator(lang), [lang]);
  const loc = LOCALES[lang] || 'en-GB';
  const nf = useMemo(() => new Intl.NumberFormat(loc), [loc]);
  const num = (v) => nf.format(v);
  const dec = (v) => new Intl.NumberFormat(loc, { maximumFractionDigits: 1 }).format(v);
  const pct = (a, b) => (b ? new Intl.NumberFormat(loc, { style: 'percent', maximumFractionDigits: 1 }).format(a / b) : '—');
  const compact = useMemo(() => new Intl.NumberFormat(loc, { notation: 'compact' }), [loc]);
  const locLabel = (v) => (v === 'Unknown' ? tr('loc.Unknown') : v);
  const timeText = (ts) => `${fmtDate(ts.slice(0, 10))}, ${ts.slice(11, 16)}`;

  // The shared date selector (owned by App) drives every number on this page.
  const dateRange = useMemo(
    () => (range?.start && range?.end ? range : { start: DATA_FIRST, end: DATA_LAST }),
    [range],
  );

  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [location, setLocation] = useState('all');
  const [win, setWin] = useState('period');
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [trendWin, setTrendWin] = useState('range'); // chart period: shared range or a rolling window
  const [barWin, setBarWin] = useState('range');
  const [sel, setSel] = useState(null); // what the right-side panel is showing
  const tableRef = useRef(null);

  useEffect(() => { setPage(1); }, [dateRange.start, dateRange.end]);
  useEffect(() => {
    if (!sel) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setSel(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sel]);

  /* ---------- data derived from the selected date range ---------- */
  const eff = useMemo(() => clampRange(dateRange), [dateRange]);
  const rState = useMemo(() => rangeState(dateRange), [dateRange]);
  const prevRange = useMemo(() => comparisonRange(dateRange), [dateRange]);
  const periodEvents = useMemo(() => eventsInRange(dateRange), [dateRange]);
  const stats = useMemo(() => tally(periodEvents), [periodEvents]);
  const prevStats = useMemo(() => (prevRange ? tally(eventsInRange(prevRange)) : null), [prevRange]);
  const lists = useMemo(() => ({
    success: periodEvents.filter((e) => e.result === 'success'),
    failed: periodEvents.filter((e) => e.result === 'failed'),
    denied: periodEvents.filter((e) => e.result === 'denied'),
    issues: periodEvents.filter((e) => e.result !== 'success'),
  }), [periodEvents]);
  const days = eff ? daysBetween(eff.start, eff.end) : 0;
  const empty = stats.total === 0;

  const kpiValue = (id) => stats[id === 'users' ? 'users' : id];
  const kpiChange = (id) => (prevStats ? pctChange(kpiValue(id), prevStats[id === 'users' ? 'users' : id]) : null);

  /* ---------- charts ---------- */
  const tMode = useMemo(() => chartMode('trend', trendWin, dateRange), [trendWin, dateRange]);
  const bMode = useMemo(() => chartMode('bar', barWin, dateRange), [barWin, dateRange]);
  const bucketLabel = (b, mode) => (mode === 'month' ? `${monthShort(b.start)} ${b.start.slice(2, 4)}` : `${b.start.slice(8, 10)} ${monthShort(b.start)}`);
  const bucketFull = (b, mode) => (mode === 'day' ? fmtDate(b.start)
    : mode === 'week' || (mode === 'month' && !isFullMonth(b)) ? `${fmtDate(b.start)} – ${fmtDate(b.end)}`
      : `${monthShort(b.start)} ${b.start.slice(0, 4)}`);
  // each time chart plots its own window (shared range by default); totals and comparison come from the same window
  const chartData = (win, mode) => {
    const w = chartWindow(dateRange, win);
    if (!w) return { w: null, total: 0, ch: null, data: [] };
    const list = eventsInRange(w);
    const prev = previousWindow(w);
    return {
      w, total: list.length, ch: prev ? pctChange(list.length, eventsInRange(prev).length) : null,
      data: bucketize(list, w, mode).map((b) => ({ ...b, label: bucketLabel(b, mode), full: bucketFull(b, mode) })),
    };
  };
  const trend = useMemo(() => chartData(trendWin, tMode), [trendWin, tMode, dateRange, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const bars = useMemo(() => chartData(barWin, bMode), [barWin, bMode, dateRange, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const trendData = trend.data;
  const barData = bars.data;
  const methodCounts = useMemo(() => {
    const m = Object.fromEntries(METHODS.map((k) => [k, 0]));
    periodEvents.forEach((e) => { m[e.method]++; });
    return m;
  }, [periodEvents]);

  /* ---------- side panels ---------- */
  const topUsers = useMemo(() => groupCount(periodEvents, (e) => e.userId), [periodEvents]);
  const companyRows = useMemo(() => {
    const map = new Map();
    periodEvents.forEach((e) => {
      const r = map.get(e.company) || { company: e.company, total: 0, success: 0, failed: 0, denied: 0 };
      r.total++; r[e.result]++;
      map.set(e.company, r);
    });
    return [...map.values()].sort((a, b) => b.total - a.total || a.company.localeCompare(b.company));
  }, [periodEvents]);
  const recentIssues = lists.issues.slice(0, 5);
  const rate = stats.total ? stats.success / stats.total : null;
  const prevRate = prevStats && prevStats.total ? prevStats.success / prevStats.total : null;
  const blocks = useMemo(() => blockProfile(periodEvents), [periodEvents]);
  const peak = useMemo(() => blocks.reduce((a, b) => (b.count > a.count ? b : a), blocks[0]), [blocks]);
  const locCounts = useMemo(() => groupCount(periodEvents.filter((e) => e.location !== 'Unknown'), (e) => e.location), [periodEvents]);
  const windowLabel = (s) => `${hourLabel(s, lang)} - ${hourLabel(s + 2, lang)}`;

  /* ---------- table: search, filters, sorting, pagination ---------- */
  const wStart = useMemo(() => windowStart(dateRange, win), [dateRange, win]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = periodEvents.filter((e) => {
      if (type !== 'all' && e.method !== type) return false;
      if (location !== 'all' && e.location !== location) return false;
      if (status === 'flagged' ? !e.flagged : status === 'issues' ? e.result === 'success' : status !== 'all' && e.result !== status) return false;
      if (wStart && e.ts.slice(0, 10) < wStart) return false;
      if (q) {
        const hay = `${e.id} ${e.name} ${e.userId} ${e.company} ${e.ip} ${locLabel(e.location)} ${e.device} ${tr(`role.${e.role}`)} ${tr(`method.${e.method}`)} ${tr(`st.${e.result}`)} ${e.reason ? tr(`reason.${e.reason}`) : ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const val = {
      user: (e) => e.name, company: (e) => e.company, role: (e) => tr(`role.${e.role}`), type: (e) => tr(`method.${e.method}`),
      time: (e) => e.ts, status: (e) => STATUS_ORDER[e.result], location: (e) => locLabel(e.location),
    }[sort.key];
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = val(a), y = val(b);
      const c = typeof x === 'number' ? x - y : String(x).localeCompare(String(y), loc);
      return c ? c * dir : (a.ts < b.ts ? 1 : -1);
    });
  }, [periodEvents, query, type, status, location, wStart, sort, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const shown = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const hasFilters = !!query || type !== 'all' || status !== 'all' || location !== 'all' || win !== 'period';

  const resetFilters = (silent) => {
    setQuery(''); setType('all'); setStatus('all'); setLocation('all'); setWin('period'); setSort(DEFAULT_SORT); setPage(1);
    if (silent !== true) toast(tr('toast.reset'));
  };
  const showInTable = (f = {}) => {
    setStatus(f.status ?? 'all'); setLocation(f.location ?? 'all'); setType(f.type ?? 'all');
    setQuery(f.query ?? ''); setWin('period'); setPage(1); setSel(null);
    setTimeout(() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };
  const toggleSort = (key) => { setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'time' ? 'desc' : 'asc' })); setPage(1); };

  const exportCSV = () => {
    if (!filtered.length) { toast(tr('toast.nothing')); return; }
    const head = ['d.eventId', 'col.time', 'col.user', 'd.userId', 'col.company', 'col.role', 'col.type', 'col.ip', 'col.location', 'col.status', 'd.reason', 'd.flagged'].map((k) => tr(k));
    const body = filtered.map((e) => [e.id, e.ts, e.name, e.userId, e.company, tr(`role.${e.role}`), tr(`method.${e.method}`), e.ip,
      locLabel(e.location), tr(`st.${e.result}`), e.reason ? tr(`reason.${e.reason}`) : '', e.flagged ? '1' : '']);
    const csv = [head, ...body].map((line) => line.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'access-logs.csv'; a.click();
    URL.revokeObjectURL(url);
    toast(tr('toast.exported', { n: num(filtered.length) }));
  };

  /* ---------- right-side panel content ---------- */
  const openRecord = (e) => setSel({ type: 'record', id: e.id });
  const changeText = (ch) => (ch == null ? tr('d.noPrev') : `${ch > 0 ? '+' : ''}${num(ch)}%`);
  const topOf = (list, fn, skipUnknown) => {
    const g = groupCount(list.filter((e) => !(skipUnknown && fn(e) === 'Unknown')), fn);
    return g[0] || null;
  };
  const eventItems = (list, n = 5, byUser = false) => list.slice(0, n).map((e) => ({
    key: e.id, label: byUser ? timeText(e.ts) : e.name, sub: byUser ? `${tr(`method.${e.method}`)} · ${e.ip}` : `${timeText(e.ts)} · ${tr(`method.${e.method}`)}`,
    value: <StatusBadge result={e.result} flagged={e.flagged} tr={tr} />, onClick: () => openRecord(e),
  }));
  const reasonItems = (list) => groupCount(list.filter((e) => e.reason), (e) => e.reason)
    .map(([k, n]) => ({ key: k, label: tr(`reason.${k}`), value: num(n) }));
  const userItems = (n) => topUsers.slice(0, n).map(([id, c]) => ({
    key: id, label: USER_BY_ID[id].name, sub: USER_BY_ID[id].company, value: `${num(c)} ${tr('events')}`,
    onClick: () => setSel({ type: 'user', id }),
  }));
  const periodText = `${fmtDate(dateRange.start)} – ${fmtDate(dateRange.end)}`;

  const buildDrawer = () => {
    if (!sel) return null;
    if (sel.type === 'record') {
      const e = EVENT_BY_ID[sel.id];
      if (!e) return null;
      const same = periodEvents.filter((x) => x.userId === e.userId && x.id !== e.id).slice(0, 5);
      return {
        title: e.name, sub: `${e.id} · ${e.company}`,
        rows: [
          [tr('d.eventId'), e.id], [tr('d.timestamp'), fmtDateTime(e.ts)], [tr('col.user'), e.name], [tr('d.userId'), e.userId],
          [tr('col.company'), e.company], [tr('col.role'), tr(`role.${e.role}`)], [tr('col.type'), tr(`method.${e.method}`)],
          [tr('d.result'), <StatusBadge result={e.result} flagged={e.flagged} tr={tr} />],
          ...(e.reason ? [[tr('d.reason'), tr(`reason.${e.reason}`)]] : []),
          [tr('col.ip'), e.ip], [tr('col.location'), locLabel(e.location)], [tr('d.device'), e.device], [tr('d.auth'), tr(`auth.${e.auth}`)],
        ],
        note: e.flagged ? tr('d.flagNote') : null,
        lists: [{ title: tr('d.related'), items: eventItems(same, 5, true), empty: tr('d.noEvents') }],
        actions: [{ label: tr('d.viewUser'), icon: Eye, run: () => setSel({ type: 'user', id: e.userId }) }],
      };
    }
    if (sel.type === 'user') {
      const u = USER_BY_ID[sel.id];
      const list = periodEvents.filter((e) => e.userId === u.id);
      const s = tally(list);
      const tm = topOf(list, (e) => e.method);
      return {
        title: u.name, sub: `${u.id} · ${u.company}`,
        rows: [
          [tr('col.role'), tr(`role.${u.role}`)], [tr('d.period'), periodText], [tr('d.events'), num(s.total)],
          [tr('res.success'), num(s.success)], [tr('d.failedOrDenied'), num(s.failed + s.denied)], [tr('d.flagged'), num(s.flagged)],
          [tr('d.successRate'), pct(s.success, s.total)], [tr('d.topType'), tm ? tr(`method.${tm[0]}`) : '—'],
          [tr('d.usualLoc'), locLabel(u.city)],
          ...(list.length ? [[tr('d.firstSeen'), fmtDateTime(list[list.length - 1].ts)], [tr('d.lastSeen'), fmtDateTime(list[0].ts)]] : []),
        ],
        lists: [{ title: tr('d.latest'), items: eventItems(list, 5, true), empty: tr('d.noEvents') }],
        actions: [{ label: tr('d.showTable'), icon: Search, run: () => showInTable({ query: u.name }) }],
      };
    }
    if (sel.type === 'company') {
      const list = periodEvents.filter((e) => e.company === sel.name);
      const s = tally(list);
      const tm = topOf(list, (e) => e.method);
      const tl = topOf(list, (e) => e.location, true);
      const cu = groupCount(list, (e) => e.userId).slice(0, 5).map(([id, c]) => ({
        key: id, label: USER_BY_ID[id].name, sub: tr(`role.${USER_BY_ID[id].role}`), value: `${num(c)} ${tr('events')}`, onClick: () => setSel({ type: 'user', id }),
      }));
      return {
        title: sel.name, sub: tr('co.title'),
        rows: [
          [tr('d.period'), periodText], [tr('co.total'), num(s.total)], [tr('co.ok'), num(s.success)], [tr('co.failed'), num(s.failed)],
          [tr('co.denied'), num(s.denied)], [tr('d.successRate'), pct(s.success, s.total)], [tr('d.uniqueUsers'), num(s.users)],
          [tr('d.topType'), tm ? tr(`method.${tm[0]}`) : '—'], [tr('d.topLoc'), tl ? `${locLabel(tl[0])} · ${num(tl[1])}` : '—'],
        ],
        lists: [{ title: tr('d.activeUsers'), items: cu, empty: tr('d.noEvents') }, { title: tr('d.latest'), items: eventItems(list) }],
        actions: [{ label: tr('d.showTable'), icon: Search, run: () => showInTable({ query: sel.name }) }],
      };
    }
    if (sel.type === 'viewall') {
      const back = { type: 'viewall', kind: sel.kind };
      const open = (next) => setSel({ ...next, back });
      let items; let title; let actions = [];
      if (sel.kind === 'users') {
        title = tr('va.users');
        items = topUsers.map(([id, c]) => ({
          key: id, label: USER_BY_ID[id].name, sub: `${USER_BY_ID[id].company} · ${tr(`role.${USER_BY_ID[id].role}`)}`, value: `${num(c)} ${tr('events')}`,
          search: `${USER_BY_ID[id].name} ${id} ${USER_BY_ID[id].company} ${tr(`role.${USER_BY_ID[id].role}`)}`, onClick: () => open({ type: 'user', id }),
        }));
      } else if (sel.kind === 'companies') {
        title = tr('va.companies');
        items = companyRows.map((r) => ({
          key: r.company, label: r.company, sub: `${num(r.success)} ${tr('co.ok')} · ${num(r.failed)} ${tr('co.failed')} · ${num(r.denied)} ${tr('co.denied')}`, value: num(r.total),
          search: r.company, onClick: () => open({ type: 'company', name: r.company }),
        }));
      } else {
        title = tr('va.failed');
        items = lists.issues.map((e) => ({
          key: e.id, label: e.name, sub: `${e.company} · ${timeText(e.ts)}`,
          value: <span className={`al-reason ${e.result}`}><i />{tr(`reason.${e.reason}`)}</span>,
          search: `${e.id} ${e.name} ${e.userId} ${e.company} ${e.ip} ${tr(`reason.${e.reason}`)} ${tr(`st.${e.result}`)}`, onClick: () => open({ type: 'record', id: e.id }),
        }));
        actions = [{ label: tr('d.showTable'), icon: Search, run: () => showInTable({ status: 'issues' }) }];
      }
      return { title, sub: `${periodText} · ${num(items.length)}`, rows: [], viewAll: { items, empty: tr('d.noEvents'), key: `${sel.kind}-${dateRange.start}-${dateRange.end}` }, actions };
    }
    if (sel.type === 'insight') {
      if (sel.id === 'security') {
        return {
          title: tr('ins.security'), sub: periodText,
          rows: [
            [tr('d.rate'), pct(stats.success, stats.total)], [tr('d.prevRate'), prevRate == null ? tr('d.noPrev') : pct(prevStats.success, prevStats.total)],
            [tr('res.success'), num(stats.success)], [tr('res.failed'), num(stats.failed)], [tr('res.denied'), num(stats.denied)], [tr('d.flagged'), num(stats.flagged)],
          ],
          lists: [{ title: tr('d.reasons'), items: reasonItems(lists.issues), empty: tr('d.noEvents') }],
          actions: [{ label: tr('d.showTable'), icon: Search, run: () => showInTable({ status: 'issues' }) }],
        };
      }
      if (sel.id === 'peak') {
        const ranked = [...blocks].sort((a, b) => b.count - a.count || a.start - b.start).filter((b) => b.count > 0).slice(0, 6);
        return {
          title: tr('ins.peak'), sub: periodText,
          rows: [[tr('d.peakWindow'), peak.count ? windowLabel(peak.start) : '—'], [tr('d.events'), num(peak.count)], [tr('d.share'), pct(peak.count, stats.total)]],
          lists: [{ title: tr('d.windows'), items: ranked.map((b) => ({ key: b.start, label: windowLabel(b.start), value: `${num(b.count)} (${pct(b.count, stats.total)})` })), empty: tr('d.noEvents') }],
        };
      }
      return {
        title: tr('ins.loc'), sub: periodText,
        rows: [[tr('d.topLoc'), locCounts[0] ? locLabel(locCounts[0][0]) : '—'], [tr('d.events'), num(locCounts[0] ? locCounts[0][1] : 0)], [tr('d.share'), pct(locCounts[0] ? locCounts[0][1] : 0, stats.total)]],
        lists: [{ title: tr('d.locations'), empty: tr('d.noEvents'), items: locCounts.slice(0, 8).map(([l, c]) => ({ key: l, label: l, value: `${num(c)} (${pct(c, stats.total)})`, onClick: () => showInTable({ location: l }) })) }],
      };
    }
    // summary card
    const id = sel.id;
    const list = id === 'total' || id === 'users' ? periodEvents : lists[id];
    const rows = [[tr('d.period'), periodText]];
    const ch = kpiChange(id);
    let extra = [];
    if (id === 'users') {
      const tu = topUsers[0];
      const issueUsers = new Set(lists.issues.map((e) => e.userId)).size;
      rows.push([tr('d.uniqueUsers'), num(stats.users)], [tr('d.avgPerUser'), stats.users ? dec(stats.total / stats.users) : '—'],
        [tr('d.topUser'), tu ? `${USER_BY_ID[tu[0]].name} · ${num(tu[1])}` : '—'], [tr('d.usersWithIssues'), num(issueUsers)],
        [tr('d.companies'), num(new Set(periodEvents.map((e) => e.company)).size)], [tr('d.vsPrev'), changeText(ch)]);
      extra = [{ title: tr('d.activeUsers'), items: userItems(5), empty: tr('d.noEvents') }];
    } else {
      const bd = topOf(list, (e) => e.ts.slice(0, 10));
      const tm = topOf(list, (e) => e.method);
      const tl = topOf(list, (e) => e.location, true);
      const tc = topOf(list, (e) => e.company);
      rows.push([tr('d.events'), num(list.length)]);
      if (id !== 'total') rows.push([tr('d.share'), pct(list.length, stats.total)]);
      rows.push([tr('d.vsPrev'), changeText(ch)], [tr('d.dailyAvg'), days ? dec(list.length / days) : '—'],
        [tr('d.busiest'), bd ? `${fmtDate(bd[0])} · ${num(bd[1])}` : '—'], [tr('d.topType'), tm ? tr(`method.${tm[0]}`) : '—'],
        [tr('d.topLoc'), tl ? `${locLabel(tl[0])} · ${num(tl[1])}` : '—'], [tr('d.topCompany'), tc ? `${tc[0]} · ${num(tc[1])}` : '—']);
      if (id !== 'success') rows.push([tr('d.flagged'), num(list.filter((e) => e.flagged).length)]);
      if (id === 'failed' || id === 'denied') extra.push({ title: tr('d.reasons'), items: reasonItems(list), empty: tr('d.noEvents') });
      extra.push({ title: tr('d.latest'), items: eventItems(list), empty: tr('d.noEvents') });
    }
    return {
      title: tr(`kpi.${id}`), sub: tr('kpi.period'), rows, lists: extra,
      actions: id === 'users' ? [] : [{ label: tr('d.showTable'), icon: Search, run: () => showInTable({ status: id === 'total' ? 'all' : id }) }],
    };
  };
  const drawer = buildDrawer();

  /* ---------- render ---------- */
  const sortTh = (k, label) => (
    <th key={k} aria-sort={sort.key === k ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button className="al-sort" onClick={() => toggleSort(k)} title={tr('sortBy', { col: label })}>
        {label}
        {sort.key === k ? (sort.dir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />) : <ChevronDown size={11} className="al-sort-idle" />}
      </button>
    </th>
  );
  const chartEmpty = <div className="al-chart-empty">{tr('chart.empty')}</div>;
  const kpiBadge = (id) => {
    const ch = kpiChange(id);
    const vs = prevRange ? tr('kpi.vs', { range: `${fmtDate(prevRange.start)} – ${fmtDate(prevRange.end)}` }) : tr('kpi.noPrev');
    if (ch == null) return <em className="al-chg neutral" title={vs}>—</em>;
    const bad = id === 'failed' || id === 'denied'; // more failures / denials is the unfavourable direction
    const tone = ch === 0 ? 'neutral' : (ch > 0) !== bad ? 'up' : 'down';
    return <em className={`al-chg ${tone}`} title={vs}>{ch > 0 ? '↑' : ch < 0 ? '↓' : ''} {num(Math.abs(ch))}%</em>;
  };
  const chartCaption = (c) => c.w && (
    <span className="al-cap">
      {fmtDate(c.w.start)} – {fmtDate(c.w.end)} · {num(c.total)} {tr('events')}
      {c.ch != null && <em className={`al-chg ${c.ch === 0 ? 'neutral' : c.ch > 0 ? 'up' : 'down'}`} title={tr('time.vsPrev')}>{c.ch > 0 ? '↑' : c.ch < 0 ? '↓' : ''} {num(Math.abs(c.ch))}%</em>}
      {c.w.limited && <em className="al-chg neutral">{tr('time.limited')}</em>}
    </span>
  );
  const winSelect = (value, onChange) => (
    <select className="al-small-select" value={value} onChange={(e) => onChange(e.target.value)} aria-label={tr('time.range')} disabled={!eff}>
      {CHART_WINDOWS.map((k) => <option key={k} value={k}>{tr(`time.${k}`)}</option>)}
    </select>
  );
  const rateDelta = rate != null && prevRate != null ? (rate - prevRate) * 100 : null;

  return (
    <div className="al-page">
      <div className="al-top">
        <div><h1>{tr('title')}</h1><p>{tr('subtitle')}</p></div>
        {range && setRange && (
          <div className="al-dates">
            {/* keyed by the active range so the picker's inputs always show the dates actually applied */}
            <DateRangeMenu key={`${range.start}_${range.end}`} range={range} setRange={setRange} />
            {rState === 'partial' && <small className="al-data-note">{tr('range.partial', { from: fmtDate(eff.start), to: fmtDate(eff.end) })}</small>}
          </div>
        )}
      </div>

      {(rState === 'none' || rState === 'invalid') && (
        <div className="al-banner" role="status">
          <CalendarX size={18} />
          <div>
            <b>{tr(rState === 'none' ? 'range.none' : 'range.invalid')}</b>
            <span>{rState === 'none' ? tr('range.noneHint', { from: fmtDate(DATA_FIRST), to: fmtDate(DATA_LAST) }) : tr('range.invalidHint')}</span>
          </div>
          {setRange && <button className="al-btn" onClick={() => setRange({ start: DATA_FIRST, end: DATA_LAST })}>{tr('range.showAll')}</button>}
        </div>
      )}

      <div className="al-kpis">
        {KPI_DEFS.map(({ id, icon: Icon, color }) => (
          <button key={id} className={`al-kpi ${sel?.type === 'card' && sel.id === id ? 'active' : ''}`} aria-haspopup="dialog" onClick={() => setSel({ type: 'card', id })}>
            <span className={`al-kpi-icon ${color}`}><Icon size={24} /></span>
            <span className="al-kpi-info">
              <small>{tr(`kpi.${id}`)}</small>
              <b>{num(kpiValue(id))}</b>
              {kpiBadge(id)}
              <span>{tr('kpi.period')}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="al-charts">
        <Panel title={tr('trend.title')} icon={Activity} action={winSelect(trendWin, setTrendWin)}>
          <div className="al-legend">
            {['success', 'failed', 'denied'].map((r) => <span key={r}><i style={{ background: RESULT_COLORS[r] }} />{tr(`res.${r}`)}</span>)}
            {chartCaption(trend)}
          </div>
          <div className="al-chart-area">
            {!trend.total ? chartEmpty : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#e5eef9" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#173b8e' }} axisLine={{ stroke: '#d6e5f8' }} tickLine={false} minTickGap={18} />
                  <YAxis tick={{ fontSize: 10, fill: '#173b8e' }} axisLine={false} tickLine={false} width={36} allowDecimals={false} tickFormatter={(v) => compact.format(v)} />
                  <Tooltip labelFormatter={(l, p) => p?.[0]?.payload.full ?? l} formatter={(v, n) => [num(v), n]} />
                  {['success', 'failed', 'denied'].map((r) => (
                    <Line key={r} type="monotone" dataKey={r} name={tr(`res.${r}`)} stroke={RESULT_COLORS[r]} strokeWidth={r === 'success' ? 2.4 : 1.8}
                      dot={trendData.length <= 14 ? { r: 3 } : false} activeDot={{ r: 4 }} isAnimationActive={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>

        <Panel title={tr('method.title')} icon={KeyRound}>
          {empty ? <div className="al-chart-area">{chartEmpty}</div> : (
            <div className="al-method">
              <div className="al-donut">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={METHODS.filter((m) => methodCounts[m] > 0).map((m) => ({ name: tr(`method.${m}`), value: methodCounts[m], key: m }))}
                      dataKey="value" nameKey="name" innerRadius="64%" outerRadius="90%" paddingAngle={2} isAnimationActive={false}>
                      {METHODS.filter((m) => methodCounts[m] > 0).map((m) => <Cell key={m} fill={METHOD_COLORS[m]} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [num(v), n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="al-donut-center"><b>{num(stats.total)}</b><span>{tr('method.total')}</span></div>
              </div>
              <div className="al-method-legend">
                {METHODS.map((m) => (
                  <button key={m} onClick={() => showInTable({ type: m })}>
                    <i style={{ background: METHOD_COLORS[m] }} /><span>{tr(`method.${m}`)}</span>
                    <b>{pct(methodCounts[m], stats.total)} ({num(methodCounts[m])})</b>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Panel>

        <Panel title={tr('time.title')} icon={BarChart3} action={winSelect(barWin, setBarWin)}>
          <div className="al-legend">{chartCaption(bars)}</div>
          <div className="al-chart-area al-bar">
            {!bars.total ? chartEmpty : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 14, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#e5eef9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#173b8e' }} axisLine={{ stroke: '#d6e5f8' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#173b8e' }} axisLine={false} tickLine={false} width={36} allowDecimals={false} tickFormatter={(v) => compact.format(v)} />
                  <Tooltip labelFormatter={(l, p) => p?.[0]?.payload.full ?? l} formatter={(v) => [num(v), tr('time.events')]} cursor={{ fill: '#eef5ff' }} />
                  <Bar dataKey="total" name={tr('time.events')} fill="#2682f8" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>
      </div>

      <div className="al-main">
        <div className="al-col">
          <Panel title={tr('logs.title')} icon={ScrollText} innerRef={tableRef} className="al-logs">
            <div className="al-toolbar">
              <div className="al-filters">
                <label className="al-search"><Search size={14} />
                  <input placeholder={tr('logs.search')} value={query} aria-label={tr('logs.search')} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
                </label>
                <select value={type} aria-label={tr('col.type')} onChange={(e) => { setType(e.target.value); setPage(1); }}>
                  <option value="all">{tr('logs.allTypes')}</option>
                  {METHODS.map((m) => <option key={m} value={m}>{tr(`method.${m}`)}</option>)}
                </select>
                <select value={status} aria-label={tr('col.status')} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                  <option value="all">{tr('logs.allStatus')}</option>
                  {['success', 'issues', 'failed', 'denied', 'flagged'].map((s) => <option key={s} value={s}>{tr(`st.${s}`)}</option>)}
                </select>
                <select value={location} aria-label={tr('col.location')} onChange={(e) => { setLocation(e.target.value); setPage(1); }}>
                  <option value="all">{tr('logs.allLocations')}</option>
                  {LOCATIONS.map((l) => <option key={l} value={l}>{locLabel(l)}</option>)}
                </select>
                <select value={win} aria-label={tr('win.period')} onChange={(e) => { setWin(e.target.value); setPage(1); }}>
                  {['period', '7d', '30d'].map((w) => <option key={w} value={w}>{tr(`win.${w}`)}</option>)}
                </select>
                <button className="al-btn" onClick={() => resetFilters()} disabled={!hasFilters && sort.key === DEFAULT_SORT.key && sort.dir === DEFAULT_SORT.dir}><RotateCcw size={13} />{tr('logs.reset')}</button>
                <button className="al-btn primary" onClick={exportCSV}><Download size={14} />{tr('logs.export')}</button>
              </div>
            </div>
            <div className="al-table-wrap">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>{tr('col.num')}</th>
                    {sortTh('user', tr('col.user'))}
                    {sortTh('company', tr('col.company'))}
                    {sortTh('role', tr('col.role'))}
                    {sortTh('type', tr('col.type'))}
                    <th>{tr('col.ip')}</th>
                    {sortTh('time', tr('col.time'))}
                    {sortTh('status', tr('col.status'))}
                    {sortTh('location', tr('col.location'))}
                    <th>{tr('col.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((e, i) => (
                    <tr key={e.id} className={sel?.type === 'record' && sel.id === e.id ? 'active' : ''} tabIndex={0}
                      onClick={() => openRecord(e)} onKeyDown={(ev) => { if (ev.key === 'Enter') openRecord(e); }}>
                      <td>{(safePage - 1) * PAGE_SIZE + i + 1}</td>
                      <td><span className="al-user"><Avatar name={e.name} />{e.name}</span></td>
                      <td>{e.company}</td>
                      <td><span className={`al-role r-${e.role}`}>{tr(`role.${e.role}`)}</span></td>
                      <td>{tr(`method.${e.method}`)}</td>
                      <td className="al-mono">{e.ip}</td>
                      <td>{timeText(e.ts)}</td>
                      <td><StatusBadge result={e.result} flagged={e.flagged} tr={tr} /></td>
                      <td>{locLabel(e.location)}</td>
                      <td><button className="al-view" onClick={(ev) => { ev.stopPropagation(); openRecord(e); }}><Eye size={12} />{tr('view')}</button></td>
                    </tr>
                  ))}
                  {!shown.length && (
                    <tr className="al-empty-row"><td colSpan={10}>
                      {tr('logs.empty')} {hasFilters && <button onClick={() => resetFilters(true)}>{tr('logs.clear')}</button>}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="al-foot">
              <span>{tr('showing', { from: num(filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0), to: num(Math.min(safePage * PAGE_SIZE, filtered.length)), total: num(filtered.length) })}</span>
              <div className="al-pager">
                <button disabled={safePage === 1} onClick={() => setPage(safePage - 1)} aria-label={tr('prev')}><ChevronLeft size={14} /></button>
                {pageList(safePage, pageCount).map((p) => (typeof p === 'string'
                  ? <span key={p} className="al-gap">…</span>
                  : <button key={p} className={p === safePage ? 'active' : ''} onClick={() => setPage(p)}>{num(p)}</button>))}
                <button disabled={safePage === pageCount} onClick={() => setPage(safePage + 1)} aria-label={tr('next')}><ChevronRight size={14} /></button>
              </div>
            </div>
          </Panel>
        </div>

        <div className="al-col al-side">
          <Panel title={tr('top.title')} icon={Users} action={<button className="al-btn" onClick={() => setSel({ type: 'viewall', kind: 'users' })}>{tr('viewAll')}</button>}>
            <ul className="al-rank">
              {topUsers.slice(0, 5).map(([id, c], i) => {
                const u = USER_BY_ID[id];
                return (
                  <li key={id}>
                    <button onClick={() => setSel({ type: 'user', id })}>
                      <span className="al-rank-n">{i + 1}</span>
                      <Avatar name={u.name} />
                      <span className="al-rank-who"><b>{u.name}</b><small>{tr(`role.${u.role}`)}</small></span>
                      <span className="al-rank-bar"><i style={{ width: `${(c / topUsers[0][1]) * 100}%` }} /></span>
                      <span className="al-rank-c">{num(c)}</span>
                    </button>
                  </li>
                );
              })}
              {!topUsers.length && <li className="al-empty-li">{tr('chart.empty')}</li>}
            </ul>
          </Panel>

          <Panel title={tr('ins.title')} icon={ShieldCheck}>
            <div className="al-insights">
              <button onClick={() => setSel({ type: 'insight', id: 'security' })}>
                <span className="al-ins-ic green"><ShieldCheck size={18} /></span>
                <span className="al-ins-t"><small>{tr('ins.security')}</small><b>{rate == null ? '—' : pct(stats.success, stats.total)}</b><em>{tr('ins.securityCap')}</em></span>
                {rateDelta != null && <span className={`al-chg ${Math.abs(rateDelta) < 0.05 ? 'neutral' : rateDelta > 0 ? 'up' : 'down'}`}>{rateDelta > 0 ? '↑' : rateDelta < 0 ? '↓' : ''} {dec(Math.abs(rateDelta))} pp</span>}
              </button>
              <button onClick={() => setSel({ type: 'insight', id: 'peak' })}>
                <span className="al-ins-ic purple"><Clock size={18} /></span>
                <span className="al-ins-t"><small>{tr('ins.peak')}</small><b>{peak.count ? windowLabel(peak.start) : tr('ins.none')}</b><em>{tr('ins.peakCap')}</em></span>
                {peak.count > 0 && <span className="al-chg neutral">{pct(peak.count, stats.total)}</span>}
              </button>
              <button onClick={() => setSel({ type: 'insight', id: 'location' })}>
                <span className="al-ins-ic blue"><MapPin size={18} /></span>
                <span className="al-ins-t"><small>{tr('ins.loc')}</small><b>{locCounts[0] ? locLabel(locCounts[0][0]) : tr('ins.none')}</b><em>{tr('ins.locCap')}</em></span>
                {locCounts[0] && <span className="al-chg neutral">{pct(locCounts[0][1], stats.total)}</span>}
              </button>
            </div>
          </Panel>
        </div>
        <div className="al-pair">
          <Panel title={tr('co.title')} icon={Building2} action={<button className="al-btn" onClick={() => setSel({ type: 'viewall', kind: 'companies' })}>{tr('viewAll')}</button>}>
            <div className="al-mini-wrap">
              <table className="al-mini">
                <thead><tr><th>{tr('col.num')}</th><th>{tr('co.name')}</th><th>{tr('co.total')}</th><th>{tr('co.ok')}</th><th>{tr('co.failed')}</th><th>{tr('co.denied')}</th></tr></thead>
                <tbody>
                  {companyRows.slice(0, 5).map((r, i) => (
                    <tr key={r.company} onClick={() => setSel({ type: 'company', name: r.company })} tabIndex={0} onKeyDown={(ev) => { if (ev.key === 'Enter') setSel({ type: 'company', name: r.company }); }}>
                      <td>{i + 1}</td><td>{r.company}</td><td><b>{num(r.total)}</b></td>
                      <td><i className="al-dot success" />{num(r.success)}</td><td><i className="al-dot failed" />{num(r.failed)}</td><td><i className="al-dot denied" />{num(r.denied)}</td>
                    </tr>
                  ))}
                  {!companyRows.length && <tr className="al-empty-row"><td colSpan={6}>{tr('chart.empty')}</td></tr>}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title={tr('fail.title')} icon={AlertTriangle} action={<button className="al-btn" onClick={() => setSel({ type: 'viewall', kind: 'failed' })}>{tr('viewAll')}</button>}>
            <div className="al-mini-wrap">
              <table className="al-mini">
                <thead><tr><th>{tr('col.num')}</th><th>{tr('fail.user')}</th><th>{tr('fail.company')}</th><th>{tr('fail.reason')}</th><th>{tr('fail.time')}</th></tr></thead>
                <tbody>
                  {recentIssues.map((e, i) => (
                    <tr key={e.id} onClick={() => openRecord(e)} tabIndex={0} onKeyDown={(ev) => { if (ev.key === 'Enter') openRecord(e); }}>
                      <td>{i + 1}</td><td>{e.name}</td><td>{e.company}</td>
                      <td><span className={`al-reason ${e.result}`}><i />{tr(`reason.${e.reason}`)}</span></td><td>{timeText(e.ts)}</td>
                    </tr>
                  ))}
                  {!recentIssues.length && <tr className="al-empty-row"><td colSpan={5}>{tr('fail.empty')}</td></tr>}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>

      {drawer && (
        <>
          <div className="backdrop al-backdrop" onClick={() => setSel(null)} />
          <aside className="detail al-drawer" role="dialog" aria-modal="true" aria-label={drawer.title}>
            <div className="detail-h">
              <div className="al-dhead">
                {sel.back && <button className="icon-btn" onClick={() => setSel(sel.back)} aria-label={tr('d.back')}><ChevronLeft size={18} /></button>}
                <div className="al-dh"><h3>{drawer.title}</h3>{drawer.sub && <small>{drawer.sub}</small>}</div>
              </div>
              <button className="icon-btn" onClick={() => setSel(null)} aria-label={t('close')}><X size={18} /></button>
            </div>
            <div className="detail-b al-db">
              {drawer.note && <div className="al-note"><Flag size={13} />{drawer.note}</div>}
              {drawer.viewAll && <ViewAllList key={drawer.viewAll.key} {...drawer.viewAll} tr={tr} num={num} />}
              {drawer.rows.map(([k, v], i) => <div className="kv" key={`${k}-${i}`}><span>{k}</span><b>{v}</b></div>)}
              {(drawer.lists || []).map((l) => (
                <div className="al-dlist" key={l.title}>
                  <h4>{l.title}</h4>
                  {l.items.length ? (
                    <ul>{l.items.map((it) => (
                      <li key={it.key}>
                        {it.onClick
                          ? <button onClick={it.onClick}><span className="al-di-l"><b>{it.label}</b>{it.sub && <small>{it.sub}</small>}</span><span className="al-di-v">{it.value}</span></button>
                          : <div className="al-di-static"><span className="al-di-l"><b>{it.label}</b>{it.sub && <small>{it.sub}</small>}</span><span className="al-di-v">{it.value}</span></div>}
                      </li>
                    ))}</ul>
                  ) : <p className="al-dempty">{l.empty || tr('d.noEvents')}</p>}
                </div>
              ))}
              {(drawer.actions || []).map((a) => (
                <button key={a.label} className="al-btn primary al-daction" onClick={a.run}><a.icon size={14} />{a.label}</button>
              ))}
              <p className="demo-note">{t('demoNote')}</p>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
