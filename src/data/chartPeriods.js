// Independent per-chart period logic.
// Supports Today, This Week, This Month, This Year,
// and navigation between available weeks.

import { MONTHLY } from './mockData.js';
import { fmtDate, monthShort } from '../i18n/translations.js';

import {
  DATA_END,
  DATA_START,
  addDays,
  getPlanDist,
  monthEnd,
  periodSum,
  toISO,
  totalAt,
} from './selectors.js';

const pad = (n) => String(n).padStart(2, '0');

export const PERIOD_MODES = [
  'today',
  'week',
  'month',
  'year',
];

export const PERIOD_LABELS = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
};

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Reference date is restricted to the available mock dataset.
export function refDate() {
  const today = toISO(new Date());

  if (today > DATA_END) {
    return DATA_END;
  }

  if (today < DATA_START) {
    return DATA_START;
  }

  return today;
}

export const defaultPeriod = () => {
  const reference = refDate();

  return {
    mode: 'year',
    month: Number(reference.slice(5, 7)) - 1,
    year: Number(reference.slice(0, 4)),
    weekOffset: 0,
  };
};

// Calculate the selected period's date range.
// weekOffset:
//   0  = latest available week
//  -1  = previous week
//  -2  = two weeks earlier
//   1  = next week, if the dataset contains those dates
export function periodBounds(period) {
  const reference = refDate();

  if (period.mode === 'today') {
    return {
      start: reference,
      end: reference,
    };
  }

  if (period.mode === 'week') {
    const offset = period.weekOffset ?? 0;

    const start = addDays(
      reference,
      -6 + offset * 7
    );

    const end = addDays(
      reference,
      offset * 7
    );

    return {
      start,
      end,
    };
  }

  if (period.mode === 'month') {
    const key = `${period.year}-${pad(
      period.month + 1
    )}`;

    return {
      start: `${key}-01`,
      end: monthEnd(key),
    };
  }

  return {
    start: `${period.year}-01-01`,
    end: `${period.year}-12-31`,
  };
}

// kind:
// 'g' = company growth
// 'r' = revenue
export function periodSeries(period, kind, lang) {
  const reference = refDate();

  const getValue = (start, end) => {
    if (kind === 'g') {
      return Math.round(
        totalAt('companies', end)
      );
    }

    return Math.round(
      periodSum('revenue', start, end)
    );
  };

  const shortDate = (iso) => {
    const formatted = fmtDate(iso, lang);

    return (
      formatted.slice(
        0,
        formatted.lastIndexOf(' ')
      ) || formatted
    );
  };

  let items = [];

  if (period.mode === 'today') {
    const yesterday = addDays(reference, -1);

    items = [
      [
        yesterday,
        yesterday,
        'Yesterday',
        fmtDate(yesterday, lang),
      ],
      [
        reference,
        reference,
        'Today',
        fmtDate(reference, lang),
      ],
    ];
  } else if (period.mode === 'week') {
    const offset = period.weekOffset ?? 0;

    const weekStart = addDays(
      reference,
      -6 + offset * 7
    );

    items = Array.from(
      { length: 7 },
      (_, index) => {
        const date = addDays(
          weekStart,
          index
        );

        return [
          date,
          date,
          shortDate(date),
          fmtDate(date, lang),
        ];
      }
    );
  } else if (period.mode === 'month') {
    const key = `${period.year}-${pad(
      period.month + 1
    )}`;

    const lastDay = Number(
      monthEnd(key).slice(8)
    );

    items = [1, 8, 15, 22].map((startDay) => {
      const endDay =
        startDay === 22
          ? lastDay
          : startDay + 6;

      return [
        `${key}-${pad(startDay)}`,
        `${key}-${pad(endDay)}`,
        `${startDay}–${endDay}`,
        `${startDay}–${endDay} ${monthShort(
          key,
          lang
        )} ${period.year}`,
      ];
    });
  } else {
    items = Array.from(
      { length: 12 },
      (_, index) =>
        `${period.year}-${pad(index + 1)}`
    )
      .filter((key) => MONTHLY[key])
      .map((key) => [
        `${key}-01`,
        monthEnd(key),
        monthShort(key, lang),
        `${monthShort(key, lang)} ${period.year}`,
      ]);
  }

  return items
    .filter(
      ([start, end]) =>
        end >= DATA_START &&
        start <= DATA_END
    )
    .map(([start, end, label, full]) => ({
      label,
      full,
      v: getValue(start, end),
    }));
}

// Return plan distribution for the selected period.
export function periodPlanDist(period) {
  const { start, end } = periodBounds(period);

  // Restrict the requested range to available data.
  const actualStart =
    start < DATA_START ? DATA_START : start;

  const actualEnd =
    end > DATA_END ? DATA_END : end;

  if (actualStart > actualEnd) {
    return {
      total: 0,
      plans: [],
    };
  }

  return getPlanDist({
    start: actualStart,
    end: actualEnd,
  });
}