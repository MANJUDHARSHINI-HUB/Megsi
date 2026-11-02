import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  BarChart3,
  Building2,
  Wallet,
} from 'lucide-react';

import { Select } from './Common.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

import {
  MONTH_NAMES,
  PERIOD_LABELS,
  PERIOD_MODES,
  defaultPeriod,
  periodPlanDist,
  periodSeries,
} from '../data/chartPeriods.js';

const ax = {
  fontSize: 11,
  fill: '#465477',
};

const miniField = {
  height: 28,
  minWidth: 0,
  padding: '0 8px',
  fontSize: 12,
  fontFamily: 'inherit',
  color: '#465477',
  background: '#fff',
  border: '1px solid #E4ECF5',
  borderRadius: 6,
  outline: 'none',
};

const Empty = () => {
  const { t } = useI18n();

  return (
    <div className="empty chart-empty">
      {t('empty.period')}
    </div>
  );
};

const ttLabel = (label, payload) =>
  payload?.[0]?.payload?.full ?? label;

// Show every label for short series (e.g. a week);
// for long series (month / year) let recharts thin them out
// but always keep the first and last label.
const xInterval = (data) =>
  data.length <= 12 ? 0 : 'preserveStartEnd';

const money = (value) =>
  `£${Number(value).toLocaleString('en-GB')}`;

export const ChartCard = ({
  icon,
  title,
  right,
  children,
  className = '',
}) => (
  <section className={`card chart-card ${className}`.trim()}>
    <header className="card-h chart-card-header">
      <span className="ic-sq chart-card-icon">
        {icon}
      </span>

      <h3 className="chart-card-title">
        {title}
      </h3>

      <div className="grow" />

      {right && (
        <div className="chart-card-controls">
          {right}
        </div>
      )}
    </header>

    <div className="chart-body">
      {children}
    </div>
  </section>
);

export function PeriodControl({
  value,
  onChange,
  compact = false,
}) {
  const [yearText, setYearText] = useState(
    String(value.year)
  );

  useEffect(() => {
    setYearText(String(value.year));
  }, [value.year]);

  const commitYear = () => {
    const year = Number(yearText);

    if (
      Number.isInteger(year) &&
      year >= 1900 &&
      year <= 2100
    ) {
      onChange({
        ...value,
        year,
      });
    } else {
      setYearText(String(value.year));
    }
  };

  const changeMode = (mode) => {
    onChange({
      ...value,
      mode,
      ...(mode === 'week'
        ? { weekOffset: 0 }
        : {}),
    });
  };

  const moveWeek = (direction) => {
    onChange({
      ...value,
      mode: 'week',
      weekOffset:
        (value.weekOffset ?? 0) + direction,
    });
  };

  const weekOffset = value.weekOffset ?? 0;

  return (
    <div className="period-ctl">
      <Select
        value={value.mode}
        options={PERIOD_MODES}
        onChange={changeMode}
        format={(option) =>
          PERIOD_LABELS[option]
        }
      />

      {value.mode === 'week' && (
        <>
          <button
            type="button"
            className="week-nav-btn"
            onClick={() => moveWeek(-1)}
          >
            ← Previous Week
          </button>

          <button
            type="button"
            className="week-nav-btn"
            onClick={() => moveWeek(1)}
            disabled={weekOffset >= 0}
          >
            Next Week →
          </button>
        </>
      )}

      {value.mode === 'month' && (
        <select
          aria-label="Month"
          className="period-month"
          style={miniField}
          value={value.month}
          onChange={(event) =>
            onChange({
              ...value,
              month: Number(event.target.value),
            })
          }
        >
          {MONTH_NAMES.map((name, index) => (
            <option key={name} value={index}>
              {name}
            </option>
          ))}
        </select>
      )}

      {value.mode === 'year' && (
        <input
          aria-label="Year"
          className="period-year"
          inputMode="numeric"
          maxLength={4}
          placeholder="YYYY"
          style={{
            ...miniField,
            width: 64,
          }}
          value={yearText}
          onChange={(event) =>
            setYearText(
              event.target.value.replace(/\D/g, '')
            )
          }
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              commitYear();
            }
          }}
          onBlur={commitYear}
        />
      )}
    </div>
  );
}

export function CompanyGrowthChart() {
  const { t, lang } = useI18n();

  const [period, setPeriod] = useState(
    defaultPeriod
  );

  const data = useMemo(
    () => periodSeries(period, 'g', lang),
    [period, lang]
  );

  return (
    <ChartCard
      icon={<BarChart3 size={16} />}
      title={t('ch.growth')}
      right={
        <PeriodControl
          value={period}
          onChange={setPeriod}
        />
      }
    >
      {!data.length ? (
        <Empty />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 8,
              right: 16,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="company-growth-gradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#0758F9"
                  stopOpacity=".25"
                />
                <stop
                  offset="100%"
                  stopColor="#0758F9"
                  stopOpacity=".05"
                />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#E4ECF5" />

            <XAxis
              dataKey="label"
              tick={ax}
              tickLine={false}
              axisLine={{ stroke: '#E4ECF5' }}
              tickMargin={6}
              padding={{ left: 12, right: 12 }}
              interval={xInterval(data)}
            />

            {/* Domain follows the data so small changes are visible.
                To keep an honest zero baseline, replace the first
                function with 0. */}
            <YAxis
              tick={ax}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              domain={[
                (dataMin) =>
                  Math.max(0, Math.floor(dataMin - 5)),
                (dataMax) => Math.ceil(dataMax + 5),
              ]}
              width={32}
            />

            <Tooltip
              formatter={(value) => [
                t('companiesN', { n: value }),
                t('tt.total'),
              ]}
              labelFormatter={ttLabel}
            />

            <Area
              type="monotone"
              dataKey="v"
              stroke="#0758F9"
              strokeWidth={2}
              fill="url(#company-growth-gradient)"
              dot={{
                r: 3.5,
                fill: '#0758F9',
                stroke: '#0758F9',
              }}
              activeDot={{
                r: 5,
                fill: '#fff',
                stroke: '#0758F9',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function TenantPlanChart() {
  const { t } = useI18n();

  const [selectedPlan, setSelectedPlan] = useState('all');

  const [period, setPeriod] = useState(
    defaultPeriod
  );

  const { total, plans } = useMemo(
    () => periodPlanDist(period),
    [period]
  );

  const selected = plans.find(
    (plan) => plan.name === selectedPlan
  );

  const percentage = (value) =>
    total
      ? Math.round((value / total) * 100)
      : 0;

  const data = selected
    ? [
        selected,
        {
          name: t('others'),
          value: Math.max(0, total - selected.value),
          color: '#E4ECF5',
        },
      ]
    : plans;

  return (
    <ChartCard
      className="plan-card"
      icon={<Building2 size={16} />}
      title={t('ch.plans')}
      right={
        <PeriodControl
          compact
          value={period}
          onChange={setPeriod}
        />
      }
    >
      <div className="donut-wrap">
        {total ? (
          <div className="donut">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="62%"
                  outerRadius="94%"
                  startAngle={90}
                  endAngle={-270}
                  stroke="#fff"
                  strokeWidth={2}
                  paddingAngle={1}
                >
                  {data.map((item) => (
                    <Cell
                      key={item.name}
                      fill={item.color}
                    />
                  ))}
                </Pie>

              
              </PieChart>
            </ResponsiveContainer>

            <div className="donut-c">
              <b>
                {selected ? selected.value : total}
              </b>

              <span>
                {selected
                  ? `${selected.name} · ${percentage(
                      selected.value
                    )}%`
                  : t('companiesWord')}
              </span>
            </div>
          </div>
        ) : (
          <Empty />
        )}

        {/* Right-hand column: filters on top, legend below.
            Filters stay visible even when the period has no data. */}
        <div className="plan-side">
          <div className="plan-side-controls">
            <Select
              value={selectedPlan}
              options={[
                'all',
                ...plans.map((plan) => plan.name),
              ]}
              onChange={setSelectedPlan}
              format={(option) =>
                option === 'all'
                  ? t('plan.all')
                  : option
              } 
            />
          </div>

          {total > 0 && (
            <ul className="legend">
              {plans.map((plan) => (
                <li
                  key={plan.name}
                  style={{
                    opacity:
                      !selected ||
                      selected.name === plan.name
                        ? 1
                        : 0.4,
                  }}
                >
                  <i
                    style={{
                      background: plan.color,
                    }}
                  />

                  <span className="legend-name">
                    {plan.name}
                  </span>

                  <span className="legend-value">
                    {plan.value} ({percentage(plan.value)}%)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ChartCard>
  );
}

export function RevenueChart() {
  const { t, lang } = useI18n();

  const [period, setPeriod] = useState(
    defaultPeriod
  );

  const data = useMemo(
    () => periodSeries(period, 'r', lang),
    [period, lang]
  );

  return (
    <ChartCard
      icon={<Wallet size={16} />}
      title={t('ch.revenue')}
      right={
        <PeriodControl
          value={period}
          onChange={setPeriod}
        />
      }
    >
      {!data.length ? (
        <Empty />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 22, // room for the value labels above the bars
              right: 8,
              left: 0,
              bottom: 4,
            }}
          >
            <CartesianGrid
              stroke="#E4ECF5"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tick={ax}
              tickLine={false}
              axisLine={{ stroke: '#E4ECF5' }}
              tickMargin={6}
              padding={{ left: 8, right: 8 }}
              interval={xInterval(data)}
            />

            <YAxis
              tick={ax}
              tickLine={false}
              axisLine={false}
              domain={[
                0,
                (dataMax) => Math.ceil(dataMax * 1.15),
              ]}
              tickFormatter={(value) =>
                `£${
                  value >= 1000
                    ? value / 1000 + 'K'
                    : value
                }`
              }
              width={48}
            />

            <Tooltip
              formatter={(value) => [
                money(value),
                t('tt.revenue'),
              ]}
              labelFormatter={ttLabel}
              cursor={{
                fill: '#EEF7FC',
              }}
            />

            <Bar
              dataKey="v"
              fill="#2F7BFF"
              radius={[2, 2, 0, 0]}
              maxBarSize={56}
            >
              {/* Value on top of each bar (only when there are
                  few enough bars for the labels to fit). */}
              {data.length <= 12 && (
                <LabelList
                  dataKey="v"
                  position="top"
                  formatter={money}
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    fill: '#101B4D',
                  }}
                />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
