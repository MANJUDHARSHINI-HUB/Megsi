
import { periodBounds } from './chartPeriods.js';

const PLAN_NAMES = [
  'Starter',
  'Professional',
  'Business',
  'Enterprise'
];

const PLAN_MULTIPLIERS = {
  Starter: 0.72,
  Professional: 0.84,
  Business: 0.93,
  Enterprise: 1.02
};

// Convert a date to a stable number.
// This makes the same date produce the same demo values.
function dateSeed(date) {
  return Number(date.replaceAll('-', ''));
}

function getDailyUsage(date) {
  const seed = dateSeed(date);
  const day = Number(date.slice(8, 10));
  const month = Number(date.slice(5, 7));
  const year = Number(date.slice(0, 4));

  const wave = Math.sin(seed * 0.00013);
  const seasonal = Math.cos(month * 0.7);
  const growth = (year - 2025) * 2;

  return {
    users: Math.round(62 + wave * 9 + seasonal * 4 + growth),
    guards: Math.round(54 + Math.cos(seed * 0.00017) * 8 + growth),
    sites: Math.round(43 + Math.sin(day * 0.45) * 7 + seasonal * 3 + growth),
    storage: Math.round(35 + Math.cos(day * 0.3) * 6 + growth)
  };
}

function toDate(value) {
  return new Date(`${value}T12:00:00`);
}

function toISO(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function averageUsage(start, end) {
  const values = [];

  let current = toDate(start);
  const last = toDate(end);

  while (current <= last) {
    values.push(getDailyUsage(toISO(current)));
    current = addDays(current, 1);
  }

  if (!values.length) {
    return { users: 0, guards: 0, sites: 0, storage: 0 };
  }

  return {
    users: Math.round(values.reduce((s, v) => s + v.users, 0) / values.length),
    guards: Math.round(values.reduce((s, v) => s + v.guards, 0) / values.length),
    sites: Math.round(values.reduce((s, v) => s + v.sites, 0) / values.length),
    storage: Math.round(values.reduce((s, v) => s + v.storage, 0) / values.length)
  };
}

function makeBuckets(period) {
  const { start, end } = periodBounds(period);

  if (start > end) return [];

  if (period.mode === 'today') {
    return [{ start, end, label: 'Today' }];
  }

  if (period.mode === 'week') {
    return Array.from({ length: 7 }, (_, index) => {
      const date = toISO(addDays(toDate(start), index));
      return { start: date, end: date, label: date.slice(8) };
    }).filter((item) => item.start <= end);
  }

  if (period.mode === 'month') {
    const first = toDate(start);
    const last = toDate(end);
    const buckets = [];

    for (let day = 1; day <= last.getDate(); day += 7) {
      const bucketStart = new Date(first.getFullYear(), first.getMonth(), day);
      const bucketEnd = new Date(
        first.getFullYear(),
        first.getMonth(),
        Math.min(day + 6, last.getDate())
      );

      buckets.push({
        start: toISO(bucketStart),
        end: toISO(bucketEnd),
        label: `${day}–${bucketEnd.getDate()}`
      });
    }

    return buckets;
  }

  const year = Number(period.year);

  return Array.from({ length: 12 }, (_, index) => {
    const monthStart = new Date(year, index, 1);
    const monthEnd = new Date(year, index + 1, 0);

    return {
      start: toISO(monthStart),
      end: toISO(monthEnd),
      label: monthStart.toLocaleString('en-GB', { month: 'short' })
    };
  });
}

export function getUsageTrend(period) {
  const fmtDate = (iso, options) =>
    toDate(iso).toLocaleDateString('en-GB', options);

  return makeBuckets(period).map((bucket) => {
    let label = bucket.label;
    let fullLabel = bucket.label;

    if (period.mode === 'today') {
      fullLabel = fmtDate(bucket.start, {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
      });
    } else if (period.mode === 'week') {
      label = fmtDate(bucket.start, { weekday: 'short', day: 'numeric' });
      fullLabel = fmtDate(bucket.start, {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
      });
    } else if (period.mode === 'month') {
      fullLabel = `${bucket.label} ${fmtDate(bucket.start, { month: 'short', year: 'numeric' })}`;
    } else {
      fullLabel = fmtDate(bucket.start, { month: 'long', year: 'numeric' });
    }

    return {
      label,
      fullLabel,
      start: bucket.start,
      end: bucket.end,
      ...averageUsage(bucket.start, bucket.end)
    };
  });
}

export function getPlanUsage(period) {
  const { start, end } = periodBounds(period);
  const usage = averageUsage(start, end);

  return PLAN_NAMES.map((name) => {
    const multiplier = PLAN_MULTIPLIERS[name];

    const value = Math.round(
      (
        usage.users +
        usage.guards +
        usage.sites +
        usage.storage
      ) / 4 * multiplier
    );

    return { name, value };
  });
}

export function getTopPlanUsage(period) {
  return PLAN_NAMES.map((name) => {
    const multiplier = PLAN_MULTIPLIERS[name];
    const trend = getUsageTrend(period);

    const average = trend.length
      ? trend.reduce((sum, point) => {
          return sum + (
            point.users +
            point.guards +
            point.sites +
            point.storage
          ) / 4;
        }, 0) / trend.length
      : 0;

    return {
      plan: name,
      usage: Math.min(100, Math.round(average * multiplier)),
    };
  });
}