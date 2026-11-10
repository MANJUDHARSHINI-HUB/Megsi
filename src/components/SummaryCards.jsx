
import { useId } from 'react';
import {
  Activity,
  CircleCheck,
  TriangleAlert,
  Ban,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

import './SummaryCards.css';

const CARD_COLORS = {
  blue: '#0866f5',
  green: '#0b8f63',
  red: '#d92d3a',
  amber: '#c26a00',
};

const ICONS = {
  activity: Activity,
  success: CircleCheck,
  failed: TriangleAlert,
  denied: Ban,
};

function Sparkline({ data = [], color }) {
  const gradientId = useId().replace(/:/g, '');
  const width = 180;
  const height = 48;

  const values = data.length
    ? data
    : [2, 4, 3, 5, 3, 6, 4, 5];

  const max = Math.max(...values, 1);

  const points = values.map((value, index) => [
    (index / Math.max(values.length - 1, 1)) * width,
    height - 5 - (value / max) * (height - 14),
  ]);

  const line = points
    .map((point, index) =>
      `${index === 0 ? 'M' : 'L'}${point[0]} ${point[1]}`
    )
    .join(' ');

  const area = `${line} L${width} ${height} L0 ${height} Z`;

  return (
    <svg
      className="summary-sparkline"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor={color}
            stopOpacity="0.22"
          />
          <stop
            offset="100%"
            stopColor={color}
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      <path
        d={area}
        fill={`url(#${gradientId})`}
      />

      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SummaryCard({
  tone,
  icon,
  label,
  value,
  change,
  changeType = 'good',
  caption,
  series,
}) {
  const Icon = ICONS[icon] || Activity;
  const color = CARD_COLORS[tone] || CARD_COLORS.blue;

  return (
    <article className={`summary-card summary-card--${tone}`}>
      <div className="summary-card-top">
        <span className="summary-card-icon">
          <Icon size={20} strokeWidth={2} />
        </span>

        <h3>{label}</h3>
      </div>

      <div className="summary-card-main">
        <span className="summary-card-value">
          {value ?? 0}
        </span>

        {change && (
          <span
            className={`summary-card-change summary-card-change--${changeType}`}
          >
            {changeType === 'good' && (
              <TrendingUp size={12} />
            )}

            {changeType === 'bad' && (
              <TrendingDown size={12} />
            )}

            {change}
          </span>
        )}
      </div>

      <p className="summary-card-caption">
        {caption}
      </p>

      <Sparkline
        data={series}
        color={color}
      />
    </article>
  );
}

export default function SummaryCards({ cards = [] }) {
  return (
    <div className="summary-cards-grid">
      {cards.map((card, index) => (
        <SummaryCard
          key={card.id || index}
          {...card}
        />
      ))}
    </div>
  );
}
