const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_MS = 86400000;

const addDays = (date, amount) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);

const hashUnit = (date, salt) => {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const value = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const dayCount = (start, end) => Math.round((end - start) / DAY_MS) + 1;

export function allocate(total, weights) {
  const sum = weights.reduce((acc, weight) => acc + weight, 0) || 1;
  const parts = weights.map((weight) => Math.floor((total * weight) / sum));
  parts[0] += total - parts.reduce((acc, part) => acc + part, 0);
  return parts;
}

/* ------------------------------------------------------------------ */
/* Jobs                                                                */
/* ------------------------------------------------------------------ */

const rawTotal = (date) => 18 + Math.round(hashUnit(date, 1) * 14);
const rawFailed = (date) => ((date.getDate() + date.getMonth() * 3) % 8 === 0 ? 1 : 0);
const rawCritical = (date) => ((date.getDate() * 3 + date.getMonth()) % 5 === 0 ? 1 : 0);

const BASE_JOBS = [
  {
    id: 'BJ-00512',
    type: 'Incremental',
    source: 'Company Data',
    status: 'Successful',
    startTime: '20 Oct 2026 01:00',
    duration: '15m',
  },
  {
    id: 'BJ-00511',
    type: 'Differential',
    source: 'Audit Logs',
    status: 'Failed',
    startTime: '19 Oct 2026 23:30',
    duration: '8m',
  },
  {
    id: 'BJ-00510',
    type: 'Incremental',
    source: 'Company Data',
    status: 'Successful',
    startTime: '18 Oct 2026 01:00',
    duration: '8m',
  },
  {
    id: 'BJ-00509',
    type: 'Differential',
    source: 'Audit Logs',
    status: 'Failed',
    startTime: '19 Oct 2026 23:30',
    duration: '23m',
  },
  {
    id: 'BJ-00508',
    type: 'Full',
    source: 'All Platform Data',
    status: 'Successful',
    startTime: '17 Oct 2026 01:00',
    duration: '32m',
  },
  {
    id: 'BJ-00507',
    type: 'Incremental',
    source: 'User Data',
    status: 'Successful',
    startTime: '16 Oct 2026 01:00',
    duration: '11m',
  },
  {
    id: 'BJ-00506',
    type: 'Full',
    source: 'Company Data',
    status: 'Failed',
    startTime: '15 Oct 2026 01:00',
    duration: '28m',
  },
  {
    id: 'BJ-00505',
    type: 'Differential',
    source: 'Audit Logs',
    status: 'Successful',
    startTime: '14 Oct 2026 23:30',
    duration: '13m',
  },
  {
    id: 'BJ-00504',
    type: 'Incremental',
    source: 'User Data',
    status: 'Successful',
    startTime: '13 Oct 2026 01:00',
    duration: '7m',
  },
  {
    id: 'BJ-00503',
    type: 'Full',
    source: 'All Platform Data',
    status: 'Successful',
    startTime: '12 Oct 2026 01:00',
    duration: '35m',
  },
];

const JOB_TYPES = ['Full', 'Incremental', 'Differential'];
const JOB_SOURCES = ['Company Data', 'Audit Logs', 'User Data', 'All Platform Data'];
const JOB_TIMES = ['01:00', '23:30', '02:00', '03:00'];

function generateHistoricalJobs() {
  const list = [];
  const last = new Date(2026, 9, 11);

  for (let index = 502; index >= 1; index -= 1) {
    const date = addDays(last, -(502 - index));

    list.push({
      id: `BJ-${String(index).padStart(5, '0')}`,
      type: JOB_TYPES[Math.floor(hashUnit(date, 7) * 3)],
      source: JOB_SOURCES[Math.floor(hashUnit(date, 8) * 4)],
      status: rawFailed(date) ? 'Failed' : 'Successful',
      startTime: `${String(date.getDate()).padStart(2, '0')} ${MONTHS[date.getMonth()]} ${date.getFullYear()} ${
        JOB_TIMES[Math.floor(hashUnit(date, 9) * 4)]
      }`,
      duration: `${5 + Math.floor(hashUnit(date, 10) * 30)}m`,
    });
  }

  return list;
}

export const INITIAL_BACKUP_JOBS = [...BASE_JOBS, ...generateHistoricalJobs()];

export const INITIAL_BACKUP_SCHEDULES = [
  {
    id: 'SCH-1001',
    name: 'Active Schedule Schedule',
    type: 'Full',
    source: 'Company Data',
    frequency: 'Daily',
    time: '01:00',
    retention: 'Active schedules',
    enabled: true,
    nextRun: '27 Oct 2026 01:00',
  },
  {
    id: 'SCH-1002',
    name: 'Active Schedule Policy 2',
    type: 'Incremental',
    source: 'Audit Logs',
    frequency: 'Daily',
    time: '23:30',
    retention: 'Retention policy',
    enabled: false,
    nextRun: '27 Oct 2026 23:30',
  },
  {
    id: 'SCH-1003',
    name: 'Weekly Full Backup',
    type: 'Full',
    source: 'All Platform Data',
    frequency: 'Weekly',
    time: '02:00',
    retention: '30 days',
    enabled: true,
    nextRun: '01 Nov 2026 02:00',
  },
  {
    id: 'SCH-1004',
    name: 'User Data Backup',
    type: 'Incremental',
    source: 'User Data',
    frequency: 'Daily',
    time: '03:00',
    retention: '14 days',
    enabled: true,
    nextRun: '27 Oct 2026 03:00',
  },
];

/* ------------------------------------------------------------------ */
/* Range statistics (KPI cards)                                        */
/* ------------------------------------------------------------------ */

function sumRaw(start, end) {
  const result = { total: 0, failed: 0, critical: 0 };
  const days = Math.min(dayCount(start, end), 4000);

  for (let index = 0; index < days; index += 1) {
    const date = addDays(start, index);
    result.total += rawTotal(date);
    result.failed += rawFailed(date);
    result.critical += rawCritical(date);
  }

  return result;
}

const DEFAULT_START = new Date(2026, 9, 1);
const DEFAULT_END = new Date(2026, 9, 31);
const BASELINE = sumRaw(DEFAULT_START, DEFAULT_END);

const SCALE_TOTAL = 785 / (BASELINE.total || 1);
const SCALE_FAILED = 4 / (BASELINE.failed || 1);
const SCALE_CRITICAL = 12 / (BASELINE.critical || 1);
const SUCCESS_RATE = 0.978;

export function getRangeStats(start, end) {
  const raw = sumRaw(start, end);
  const total = Math.round(raw.total * SCALE_TOTAL);
  const successful = Math.round(total * SUCCESS_RATE);
  const failed = Math.round(raw.failed * SCALE_FAILED);
  const critical = Math.round(raw.critical * SCALE_CRITICAL);

  return {
    total,
    successful,
    failed,
    critical,
    other: Math.max(0, total - successful - failed),
    rate: total ? (successful / total) * 100 : 0,
    days: dayCount(start, end),
  };
}

/* ------------------------------------------------------------------ */
/* Activity chart                                                      */
/* ------------------------------------------------------------------ */

export function buildActivity(start, end) {
  const days = dayCount(start, end);
  const points = [];

  const bucket = (label, bucketStart, bucketEnd) => {
    const raw = sumRaw(bucketStart, bucketEnd);

    return {
      label,
      successful: Math.round(raw.total * SCALE_TOTAL * SUCCESS_RATE),
      failed: Math.round(raw.failed * SCALE_FAILED),
    };
  };

  if (days <= 31) {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let index = 0; index < days; index += 1) {
      const date = addDays(start, index);
      const label =
        days <= 7 ? weekdays[date.getDay()] : `${MONTHS[date.getMonth()]} ${date.getDate()}`;

      points.push(bucket(label, date, date));
    }
  } else if (days <= 120) {
    for (let cursor = start; cursor <= end; cursor = addDays(cursor, 7)) {
      const weekEnd = addDays(cursor, 6);
      const bucketEnd = weekEnd > end ? end : weekEnd;

      points.push(bucket(`${MONTHS[cursor.getMonth()]} ${cursor.getDate()}`, cursor, bucketEnd));
    }
  } else {
    const spansYears = start.getFullYear() !== end.getFullYear();
    let cursor = start;

    while (cursor <= end) {
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
      const bucketEnd = monthEnd > end ? end : monthEnd;
      const label = spansYears
        ? `${MONTHS[cursor.getMonth()]} '${String(cursor.getFullYear()).slice(-2)}`
        : MONTHS[cursor.getMonth()];

      points.push(bucket(label, cursor, bucketEnd));
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
  }

  return points;
}

/* ------------------------------------------------------------------ */
/* Backup status by type (donut + drill-down)                          */
/* ------------------------------------------------------------------ */

export const BACKUP_STATUS = [
  { name: 'Full', value: 55, color: '#0865e8' },
  { name: 'Incremental', value: 35, color: '#10915c' },
  { name: 'Differential', value: 10, color: '#f39a12' },
];

const TYPE_SOURCE_WEIGHTS = {
  Full: [
    { name: 'All Platform Data', weight: 40 },
    { name: 'Company Data', weight: 35 },
    { name: 'User Data', weight: 15 },
    { name: 'Audit Logs', weight: 10 },
  ],
  Incremental: [
    { name: 'Company Data', weight: 40 },
    { name: 'User Data', weight: 30 },
    { name: 'Audit Logs', weight: 20 },
    { name: 'All Platform Data', weight: 10 },
  ],
  Differential: [
    { name: 'Audit Logs', weight: 45 },
    { name: 'Company Data', weight: 30 },
    { name: 'User Data', weight: 15 },
    { name: 'All Platform Data', weight: 10 },
  ],
};

export function getTypeBreakdown(total, end) {
  const jitter = (hashUnit(end, 3) - hashUnit(DEFAULT_END, 3)) * 10;
  const weights = [
    Math.max(3, 55 + jitter),
    Math.max(3, 35 - jitter * 0.6),
    Math.max(3, 10 - jitter * 0.4),
  ];
  const weightSum = weights.reduce((acc, weight) => acc + weight, 0);

  const percents = weights.map((weight) => Math.round((weight / weightSum) * 100));
  percents[2] = 100 - percents[0] - percents[1];

  const counts = percents.map((percent) => Math.round((total * percent) / 100));
  counts[0] += total - counts.reduce((acc, count) => acc + count, 0);

  return BACKUP_STATUS.map((item, index) => ({
    name: item.name,
    color: item.color,
    value: percents[index],
    count: counts[index],
  }));
}

export function getTypeDrill(name, count, stats) {
  const weights = TYPE_SOURCE_WEIGHTS[name] || TYPE_SOURCE_WEIGHTS.Full;
  const counts = allocate(
    count,
    weights.map((item) => item.weight)
  );
  const failed = stats.total ? Math.round((stats.failed * count) / stats.total) : 0;
  const successful = Math.round(count * SUCCESS_RATE);

  return {
    sources: weights.map((item, index) => ({ name: item.name, count: counts[index] })),
    successful,
    failed,
    other: Math.max(0, count - successful - failed),
  };
}

/* ------------------------------------------------------------------ */
/* Storage utilization (bar chart + drill-down)                        */
/* ------------------------------------------------------------------ */

export const STORAGE_DATA = [
  { name: 'Jan', value: 1050, type: 'used' },
  { name: 'Feb', value: 850, type: 'used' },
  { name: 'Mar', value: 760, type: 'used' },
  { name: 'Apr', value: 710, type: 'used' },
  { name: 'May', value: 550, type: 'used' },
  { name: 'Jun', value: 380, type: 'used' },
  { name: 'Jul', value: 400, type: 'used' },
  { name: 'Aug', value: 300, type: 'used' },
  { name: 'Sep', value: 100, type: 'used' },
  { name: 'Oct', value: 500, type: 'tenant' },
  { name: 'Nov', value: 950, type: 'overall' },
];

export const STORAGE_LABELS = {
  used: 'Storage Used',
  tenant: 'Company/Tenant',
  overall: 'Overall Storage Used',
};

const storageFactor = (end) => {
  const key = new Date(end.getFullYear(), end.getMonth(), 1);
  const baseline = new Date(DEFAULT_END.getFullYear(), DEFAULT_END.getMonth(), 1);

  return (0.8 + 0.4 * hashUnit(key, 5)) / (0.8 + 0.4 * hashUnit(baseline, 5));
};

export function getStorageData(end) {
  const factor = storageFactor(end);

  return STORAGE_DATA.map((item) => ({
    ...item,
    value: Math.round(item.value * factor),
  }));
}

const STORAGE_TENANTS = [
  { name: 'SecureGuard UK Ltd', weight: 34 },
  { name: 'Metro Security Group', weight: 26 },
  { name: 'SafeZone Services', weight: 18 },
  { name: 'Guardian Force Ltd', weight: 12 },
  { name: 'Other tenants', weight: 10 },
];

export function getStorageBreakdown(value, monthName) {
  const monthIndex = Math.max(0, MONTHS.indexOf(monthName));

  const weights = STORAGE_TENANTS.map(
    (tenant, index) =>
      tenant.weight * (0.85 + 0.3 * hashUnit(new Date(2026, monthIndex, index + 1), 6))
  );

  const parts = allocate(
    value,
    weights.map((weight) => Math.round(weight * 100))
  );

  return STORAGE_TENANTS.map((tenant, index) => ({
    name: tenant.name,
    value: parts[index],
  })).sort((a, b) => b.value - a.value);
}