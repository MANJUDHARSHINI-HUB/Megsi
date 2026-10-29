import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, Building2, Wallet } from 'lucide-react';
import { Select } from './Common.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { MONTH_NAMES, PERIOD_LABELS, PERIOD_MODES, defaultPeriod, periodPlanDist, periodSeries } from '../data/chartPeriods.js';

export const ChartCard = ({ icon, title, right, children }) => (
  <section className="card chart-card">
    <header className="card-h"><span className="ic-sq">{icon}</span><h3>{title}</h3><div className="grow" />{right}</header>
    <div className="chart-body">{children}</div>
  </section>
);
const ax = { fontSize: 11, fill: '#465477' };
const Empty = () => { const { t } = useI18n(); return <div className="empty chart-empty">{t('empty.period')}</div>; };
const ttLabel = (l, p) => p?.[0]?.payload?.full ?? l;

// Small control compact enough to sit in a chart header: [period] + [month dropdown | year input].
const miniField = {
  height: 28, padding: '0 8px', fontSize: 12, fontFamily: 'inherit', color: '#465477',
  background: '#fff', border: '1px solid #E4ECF5', borderRadius: 6, outline: 'none',
};

export function PeriodControl({ value, onChange }) {
  const [yearText, setYearText] = useState(String(value.year));
  useEffect(() => { setYearText(String(value.year)); }, [value.year]);

  const commitYear = () => {
    const y = Number(yearText);
    if (Number.isInteger(y) && y >= 1900 && y <= 2100) onChange({ ...value, year: y });
    else setYearText(String(value.year)); // reject invalid input, restore last good year
  };

  return (
    <div className="period-ctl" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Select value={value.mode} options={PERIOD_MODES} onChange={(mode) => onChange({ ...value, mode })} format={(o) => PERIOD_LABELS[o]} />
      {value.mode === 'month' && (
        <select aria-label="Month" style={miniField} value={value.month} onChange={(e) => onChange({ ...value, month: Number(e.target.value) })}>
          {MONTH_NAMES.map((name, i) => <option key={name} value={i}>{name}</option>)}
        </select>
      )}
      {value.mode === 'year' && (
        <input
          aria-label="Year" inputMode="numeric" maxLength={4} placeholder="YYYY" style={{ ...miniField, width: 58 }}
          value={yearText} onChange={(e) => setYearText(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => { if (e.key === 'Enter') commitYear(); }} onBlur={commitYear}
        />
      )}
    </div>
  );
}

export function CompanyGrowthChart() {
  const { t, lang } = useI18n(); const [period, setPeriod] = useState(defaultPeriod);
  const data = useMemo(() => periodSeries(period, 'g', lang), [period, lang]);
  return (
    <ChartCard icon={<BarChart3 size={16} />} title={t('ch.growth')} right={<PeriodControl value={period} onChange={setPeriod} />}>
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

export function TenantPlanChart() {
  const { t } = useI18n(); const [p, setP] = useState('all'); const [period, setPeriod] = useState(defaultPeriod);
  const { total, plans } = useMemo(() => periodPlanDist(period), [period]);
  const sel = plans.find((x) => x.name === p);
  const pct = (v) => (total ? Math.round((v / total) * 100) : 0);
  const data = sel ? [sel, { name: t('others'), value: total - sel.value, color: '#E4ECF5' }] : plans;
  const right = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Select value={p} options={['all', ...plans.map((x) => x.name)]} onChange={setP} format={(o) => (o === 'all' ? t('plan.all') : o)} />
      <PeriodControl value={period} onChange={setPeriod} />
    </div>
  );
  return (
    <ChartCard icon={<Building2 size={16} />} title={t('ch.plans')} right={right}>
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

export function RevenueChart() {
  const { t, lang } = useI18n(); const [period, setPeriod] = useState(defaultPeriod);
  const data = useMemo(() => periodSeries(period, 'r', lang), [period, lang]);
  return (
    <ChartCard icon={<Wallet size={16} />} title={t('ch.revenue')} right={<PeriodControl value={period} onChange={setPeriod} />}>
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
