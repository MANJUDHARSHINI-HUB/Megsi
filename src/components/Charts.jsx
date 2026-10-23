import { useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, Building2, Wallet } from 'lucide-react';
import { Select } from './Common.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { getPlanDist, growthSeries, revenueSeries } from '../data/selectors.js';

const WINDOWS = ['30d', '6m', '12m'];
export const ChartCard = ({ icon, title, right, children }) => (
  <section className="card chart-card">
    <header className="card-h"><span className="ic-sq">{icon}</span><h3>{title}</h3><div className="grow" />{right}</header>
    <div className="chart-body">{children}</div>
  </section>
);
const ax = { fontSize: 11, fill: '#465477' };
const Empty = () => { const { t } = useI18n(); return <div className="empty chart-empty">{t('empty.period')}</div>; };
const ttLabel = (l, p) => p?.[0]?.payload?.full ?? l;

export function CompanyGrowthChart({ range }) {
  const { t, lang } = useI18n(); const [w, setW] = useState('12m');
  const data = useMemo(() => growthSeries(range, w, lang), [range, w, lang]);
  return (
    <ChartCard icon={<BarChart3 size={16} />} title={t('ch.growth')} right={<Select value={w} options={WINDOWS} onChange={setW} format={(o) => t(`range.${o}`)} />}>
      {!data.length ? <Empty /> : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
            <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0758F9" stopOpacity=".25" /><stop offset="100%" stopColor="#0758F9" stopOpacity=".05" /></linearGradient></defs>
            <CartesianGrid stroke="#E4ECF5" />
            <XAxis dataKey="label" tick={ax} tickLine={false} /><YAxis tick={ax} tickLine={false} axisLine={false} domain={[0, 80]} />
            <Tooltip formatter={(v) => [t('companiesN', { n: v }), t('tt.total')]} labelFormatter={ttLabel} />
            <Area type="monotone" dataKey="v" stroke="#0758F9" strokeWidth={2} fill="url(#g)" dot={{ r: 3.5, fill: '#0758F9', stroke: '#0758F9' }} activeDot={{ r: 5, fill: '#fff', stroke: '#0758F9', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>)}
    </ChartCard>
  );
}

export function TenantPlanChart({ range }) {
  const { t } = useI18n(); const [p, setP] = useState('all');
  const { total, plans } = useMemo(() => getPlanDist(range), [range]);
  const sel = plans.find((x) => x.name === p);
  const pct = (v) => (total ? Math.round((v / total) * 100) : 0);
  const data = sel ? [sel, { name: t('others'), value: total - sel.value, color: '#E4ECF5' }] : plans;
  return (
    <ChartCard icon={<Building2 size={16} />} title={t('ch.plans')} right={<Select value={p} options={['all', ...plans.map((x) => x.name)]} onChange={setP} format={(o) => (o === 'all' ? t('plan.all') : o)} />}>
      {!total ? <Empty /> : (
        <div className="donut-wrap">
          <div className="donut">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={data} dataKey="value" innerRadius="62%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="#fff" strokeWidth={2}>
                {data.map((d) => <Cell key={d.name} fill={d.color} />)}</Pie>
                <Tooltip formatter={(v, n) => [`${v} (${pct(v)}%)`, n]} /></PieChart>
            </ResponsiveContainer>
            <div className="donut-c"><b>{sel ? sel.value : total}</b><span>{sel ? `${sel.name} · ${pct(sel.value)}%` : t('companiesWord')}</span></div>
          </div>
          <ul className="legend">{plans.map((x) => (
            <li key={x.name} style={{ opacity: !sel || sel.name === x.name ? 1 : 0.4 }}><i style={{ background: x.color }} />{x.name}<span>{x.value} ({pct(x.value)}%)</span></li>))}</ul>
        </div>)}
    </ChartCard>
  );
}

export function RevenueChart({ range }) {
  const { t, lang } = useI18n(); const [w, setW] = useState('12m');
  const data = useMemo(() => revenueSeries(range, w, lang), [range, w, lang]);
  return (
    <ChartCard icon={<Wallet size={16} />} title={t('ch.revenue')} right={<Select value={w} options={WINDOWS} onChange={setW} format={(o) => t(`range.${o}`)} />}>
      {!data.length ? <Empty /> : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 6, left: -4, bottom: 0 }}>
            <CartesianGrid stroke="#E4ECF5" vertical={false} />
            <XAxis dataKey="label" tick={ax} tickLine={false} />
            <YAxis tick={ax} tickLine={false} axisLine={false} tickFormatter={(v) => `£${v >= 1000 ? v / 1000 + 'K' : v}`} />
            <Tooltip formatter={(v) => [`£${v.toLocaleString('en-GB')}`, t('tt.revenue')]} labelFormatter={ttLabel} cursor={{ fill: '#EEF7FC' }} />
            <Bar dataKey="v" fill="#2F7BFF" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>)}
    </ChartCard>
  );
}
