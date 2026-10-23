import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowDown, ArrowUp, Search } from 'lucide-react';
import { PlanBadge, StatusBadge } from '../components/Common.jsx';
import { EventIcon } from '../components/Panels.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { KIND } from '../data/mockData.js';
import { getActivity, getCompanies, getSignups, getTop } from '../data/selectors.js';

export default function DataTablePage({ id, range, onBack }) {
  const { t, fmtDate, fmtDateTime } = useI18n();
  const [q, setQ] = useState(''); const [f, setF] = useState('all'); const [sort, setSort] = useState({ k: null, dir: 1 });
  const cfg = useMemo(() => ({
    companies: { rows: getCompanies(range), filter: 'status', cols: [['name', 'col.company'], ['plan', 'col.plan', (v) => <PlanBadge v={v} />], ['users', 'col.users'], ['sites', 'col.sites'], ['status', 'col.status', (v) => <StatusBadge v={v} />], ['joined', 'col.joined', fmtDate]] },
    signups: { rows: getSignups(range), filter: 'status', cols: [['name', 'col.company'], ['contact', 'col.contact'], ['plan', 'col.plan', (v) => <PlanBadge v={v} />], ['status', 'col.status', (v) => <StatusBadge v={v} />], ['date', 'col.date', fmtDate]] },
    activity: { rows: getActivity(range).map((a) => ({ kind: a.kind, ts: a.ts, event: t(a.k, a.p), type: t(`kind.${a.kind}`) })), filter: 'type',
      cols: [['event', 'col.event', (v, r) => <span className="evt"><EventIcon kind={r.kind} />{v}</span>], ['ts', 'col.when', fmtDateTime], ['type', 'col.type', (v, r) => <span className={`badge ${KIND[r.kind].c}`}>{v}</span>]] },
    top: { rows: getTop(range).map((x, i) => ({ rank: i + 1, ...x })), filter: null, cols: [['rank', 'col.rank'], ['name', 'col.company'], ['users', 'col.users']] },
  }[id]), [id, range, t, fmtDate, fmtDateTime]);
  const opts = cfg.filter ? [...new Set(cfg.rows.map((r) => r[cfg.filter]))] : [];
  const rows = useMemo(() => {
    let r = cfg.rows.filter((x) => (f === 'all' || x[cfg.filter] === f) && Object.values(x).join(' ').toLowerCase().includes(q.toLowerCase()));
    if (sort.k) r = [...r].sort((a, b) => (a[sort.k] > b[sort.k] ? 1 : a[sort.k] < b[sort.k] ? -1 : 0) * sort.dir);
    return r;
  }, [cfg, q, f, sort]);
  const label = (o) => (id === 'activity' ? o : t(`status.${o}`));
  return (
    <div className="dash">
      <div className="title-row"><div><h1>{t(`tp.${id}`)}</h1><p>{t('tp.records', { a: rows.length, b: cfg.rows.length })} · {fmtDate(range.start)} – {fmtDate(range.end)}</p></div>
        <button className="btn-sm big" onClick={onBack}><ArrowLeft size={14} /> {t('back')}</button></div>
      <section className="card full">
        <div className="toolbar"><div className="tsearch"><Search size={15} /><input placeholder={t('tp.search')} value={q} onChange={(e) => setQ(e.target.value)} /></div>
          {opts.length > 0 && <select value={f} onChange={(e) => setF(e.target.value)}><option value="all">{t('all')}</option>{opts.map((o) => <option key={o} value={o}>{label(o)}</option>)}</select>}</div>
        <div className="tscroll"><table className="tbl big">
          <thead><tr>{cfg.cols.map(([k, l]) => (<th key={k} className="sortable" onClick={() => setSort((s) => ({ k, dir: s.k === k ? -s.dir : 1 }))}>{t(l)}{sort.k === k && (sort.dir === 1 ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}</th>))}</tr></thead>
          <tbody>{rows.map((r, i) => (<tr key={i}>{cfg.cols.map(([k, , render]) => <td key={k}>{render ? render(r[k], r) : r[k]}</td>)}</tr>))}
            {rows.length === 0 && <tr><td colSpan={cfg.cols.length} className="empty">{t('empty.period')}</td></tr>}</tbody></table></div>
      </section>
    </div>
  );
}
