import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, ClipboardList } from 'lucide-react';
import { Select } from '../../components/Common.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { TREND_HISTORY } from '../../data/suspendedData.js';

const ax = { fontSize: 11, fill: '#465477' };
const WINDOWS = { '6m': 'Last 6 Months', '12m': 'Last 12 Months' };

export function Card({ icon, title, right, children }) {
  return (
    <section className="card st-chart">
      <header className="card-h"><span className="ic-sq">{icon}</span><h3>{title}</h3><div className="grow" />{right}</header>
      <div className="st-chart-body">{children}</div>
    </section>
  );
}

export function TrendChart({ reactivatedNow }) {
  const { monthShort } = useI18n();
  const [w, setW] = useState('6m');
  const data = useMemo(() => {
    const all = TREND_HISTORY.map(([k, s, r], i) => ({ key: k, label: monthShort(`${k}-01`), Suspended: s, Reactivated: i === TREND_HISTORY.length - 1 ? r + reactivatedNow : r }));
    return w === '6m' ? all.slice(-6) : all;
  }, [w, reactivatedNow, monthShort]);
  return (
    <Card icon={<BarChart3 size={16} />} title="Suspension Trends" right={<Select value={w} options={Object.keys(WINDOWS)} onChange={setW} format={(o) => WINDOWS[o]} />}>
      <ul className="st-legend-inline"><li><i style={{ background: '#0758F9' }} />Suspended</li><li><i style={{ background: '#E8172D' }} />Reactivated</li></ul>
      <div className="st-plot">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 6, right: 6, left: -22, bottom: 0 }} barGap={2} barCategoryGap="22%">
            <CartesianGrid stroke="#E4ECF5" vertical={false} />
            <XAxis dataKey="label" tick={ax} tickLine={false} />
            <YAxis tick={ax} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip cursor={{ fill: '#EEF7FC' }} />
            <Bar dataKey="Suspended" fill="#0758F9" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Reactivated" fill="#E8172D" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/** Donut + legend. `selected` highlights a slice; clicking a slice or legend row toggles the table filter. */
export function BreakdownDonut({ title, items, selected, onSelect }) {
  const total = items.reduce((n, d) => n + d.value, 0);
  const pct = (v) => (total ? Math.round((v / total) * 100) : 0);
  return (
    <Card icon={<ClipboardList size={16} />} title={title}>
      {!total ? <div className="empty st-empty">No suspended tenants</div> : (
        <div className="st-donut-wrap">
          <div className="donut st-donut">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={items.filter((d) => d.value > 0)} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="#fff" strokeWidth={2} onClick={(d) => onSelect(d.name)} style={{ cursor: 'pointer' }}>
                {items.filter((d) => d.value > 0).map((d) => <Cell key={d.name} fill={d.color} opacity={!selected || selected === d.name ? 1 : 0.35} />)}</Pie>
                <Tooltip formatter={(v, n) => [`${v} (${pct(v)}%)`, n]} /></PieChart>
            </ResponsiveContainer>
            <div className="donut-c"><b>{total}</b><span>Suspended</span></div>
          </div>
          <ul className="legend st-legend">{items.map((d) => (
            <li key={d.name}><button className={selected === d.name ? 'on' : ''} onClick={() => onSelect(d.name)} aria-pressed={selected === d.name} title={`Filter table by ${d.name}`}><i style={{ background: d.color }} />{d.name}<span>{pct(d.value)}%</span></button></li>))}</ul>
        </div>)}
    </Card>
  );
}
