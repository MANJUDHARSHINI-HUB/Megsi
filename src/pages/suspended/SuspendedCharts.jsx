import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  FileText,
  ShieldCheck,
  BarChart3,
  PieChart as PieIcon,
} from 'lucide-react';
import { ChartCard, PeriodControl } from '../../components/Charts.jsx';
import { CHART_DATA, REASONS, SUMMARY } from '../../data/suspendedData.js';

const COLORS = ['#1769E8', '#E84A5B', '#8B35C9', '#F59E0B', '#16A36A'];
const PLAN_COLORS = ['#F59E0B', '#168BD7', '#B044B8', '#E45C85'];
const CURRENT = new Date();

const icons = {
  ban: Ban,
  calendar: CalendarDays,
  file: FileText,
  check: CheckCircle2,
  shield: ShieldCheck,
};

// Keep the same period object shape used by the main dashboard PeriodControl.
const initialPeriod = () => ({
  mode: 'week',
  month: CURRENT.getMonth(),
  year: CURRENT.getFullYear(),
  weekOffset: 0,
});

export function SummaryCards() {
  return (
    <div className="st-summary-grid">
      {SUMMARY.map((item) => {
        const Icon = icons[item.icon] || BarChart3;
        return (
          <article className="st-summary-card" key={item.label}>
            <span className={`st-summary-icon ${item.tone}`}>
              <Icon size={22} />
            </span>
            <div className="st-summary-copy">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>↑ {item.change}</small>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function periodKey(period) {
  if (period.mode === 'today') return 'Today';
  if (period.mode === 'week') {
    return period.weekOffset === 0 ? 'This Week' : 'Previous Week';
  }
  if (period.mode === 'month') return 'This Month';
  return 'This Year';
}

function periodCaption(period) {
  if (period.mode === 'today') {
    return CURRENT.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  if (period.mode === 'week') {
    if (period.weekOffset === 0) return 'Current Week';
    if (period.weekOffset === -1) return 'Previous Week';
    return `${Math.abs(period.weekOffset)} Weeks Ago`;
  }
  if (period.mode === 'month') {
    return new Date(period.year, period.month, 1).toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    });
  }
  return String(period.year);
}

function scaleValues(values, period, salt = 0) {
  const seed = period.mode === 'month'
    ? period.month + 1
    : period.mode === 'year'
      ? Number(period.year) % 13
      : Math.abs(period.weekOffset || 0) + salt;

  const factor = period.mode === 'today'
    ? 0.22
    : period.mode === 'week'
      ? (period.weekOffset === 0 ? 1 : Math.max(0.72, 1 - Math.abs(period.weekOffset) * 0.08))
      : period.mode === 'month'
        ? 0.82 + seed * 0.025
        : 0.9 + (seed % 7) * 0.035;

  return values.map((value, index) =>
    Math.max(1, Math.round(value * factor + ((seed + index + salt) % 3)))
  );
}

function getTrendData(period) {
  const source = CHART_DATA.trends[periodKey(period)] || CHART_DATA.trends['This Week'];
  const factor = period.mode === 'month'
    ? 0.82 + (period.month + 1) * 0.025
    : period.mode === 'year'
      ? 0.9 + (Number(period.year) % 7) * 0.035
      : period.mode === 'week'
        ? Math.max(0.72, 1 - Math.abs(period.weekOffset || 0) * 0.08)
        : 1;

  return source.map((row, index) => ({
    ...row,
    s: Math.max(1, Math.round(row.s * factor + (index % 2))),
    r: Math.max(1, Math.round(row.r * factor)),
  }));
}

function SharedPeriodHeader({ title, icon, period, setPeriod, children }) {
  return (
    <ChartCard
      className="st-suspended-chart"
      icon={icon}
      title={title}
      right={<PeriodControl value={period} onChange={setPeriod} />}
    >
      <div className="st-suspended-chart-inner">
        <div className="st-chart-period-caption">{periodCaption(period)}</div>
        {children}
      </div>
    </ChartCard>
  );
}

function DonutChartPanel({ title, period, setPeriod, labels, values, colors }) {
  const chartValues = useMemo(
    () => scaleValues(values, period, title.length),
    [values, period, title]
  );
  const total = chartValues.reduce((sum, value) => sum + value, 0);
  const data = labels.map((name, index) => ({
    name,
    value: chartValues[index] || 0,
    color: colors[index],
  }));

  return (
    <SharedPeriodHeader
      title={title}
      icon={<PieIcon size={16} />}
      period={period}
      setPeriod={setPeriod}
    >
      <div className="st-donut-layout">
        <div className="st-donut-graphic">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="58%"
                outerRadius="82%"
                paddingAngle={2}
                stroke="none"
              >
                {data.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  `${value} · ${total ? Math.round((value / total) * 100) : 0}%`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="st-donut-center">
            <strong>{total.toLocaleString('en-IN')}</strong>
            <span>Total</span>
          </div>
        </div>

        <div className="st-chart-legend">
          {data.map((item) => (
            <div key={item.name}>
              <i style={{ background: item.color }} />
              <span title={item.name}>{item.name}</span>
              <b>{total ? Math.round((item.value / total) * 100) : 0}%</b>
            </div>
          ))}
        </div>
      </div>
    </SharedPeriodHeader>
  );
}

export default function SuspendedCharts() {
  // Each graph has its own independent period state.
  const [trendPeriod, setTrendPeriod] = useState(initialPeriod);
  const [reasonPeriod, setReasonPeriod] = useState(initialPeriod);
  const [planPeriod, setPlanPeriod] = useState(initialPeriod);

  const trendData = useMemo(() => getTrendData(trendPeriod), [trendPeriod]);
  const reasonValues = CHART_DATA.reasons[periodKey(reasonPeriod)] || CHART_DATA.reasons['This Week'];
  const planValues = CHART_DATA.plans[periodKey(planPeriod)] || CHART_DATA.plans['This Week'];

  return (
    <div className="st-chart-grid">
      <SharedPeriodHeader
        title="Suspension Trends"
        icon={<BarChart3 size={16} />}
        period={trendPeriod}
        setPeriod={setTrendPeriod}
      >
        <div className="st-trend-legend">
          <span><i style={{ background: '#1769E8' }} />Suspended</span>
          <span><i style={{ background: '#E84A5B' }} />Reactivated</span>
        </div>
        <div className="st-bar-area">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trendData}
              margin={{ top: 8, right: 8, left: -18, bottom: 2 }}
              barGap={4}
              barCategoryGap="22%"
            >
              <CartesianGrid stroke="#E4ECF5" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#465477' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#465477' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={32}
              />
              <Tooltip cursor={{ fill: '#F3F7FC' }} />
              <Bar dataKey="s" name="Suspended" fill="#1769E8" radius={[3, 3, 0, 0]} maxBarSize={22} />
              <Bar dataKey="r" name="Reactivated" fill="#E84A5B" radius={[3, 3, 0, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SharedPeriodHeader>

      <DonutChartPanel
        title="Suspension Reasons"
        period={reasonPeriod}
        setPeriod={setReasonPeriod}
        labels={REASONS}
        values={reasonValues}
        colors={COLORS}
      />

      <DonutChartPanel
        title="Suspensions by Plan"
        period={planPeriod}
        setPeriod={setPlanPeriod}
        labels={['Starter', 'Professional', 'Business', 'Enterprise']}
        values={planValues}
        colors={PLAN_COLORS}
      />
    </div>
  );
}
