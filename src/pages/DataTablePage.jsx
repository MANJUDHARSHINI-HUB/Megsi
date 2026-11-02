import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowDown, ArrowUp, Search } from 'lucide-react';
import { PlanBadge, StatusBadge } from '../components/Common.jsx';
import { EventIcon } from '../components/Panels.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { KIND } from '../data/mockData.js';
import {
  getActivity,
  getCompanies,
  getSignups,
  getTop,
} from '../data/selectors.js';

// Demo leads matching the Leads Overview dashboard.
const LEAD_ROWS = [
  {
    name: 'Ravi Kumar',
    company: 'ABC Security Solutions',
    source: 'Website',
    interest: 'Professional',
    status: 'New',
    date: 'Oct 30, 2026',
  },
  {
    name: 'Priya Nair',
    company: 'BrightGuard Ltd',
    source: 'Referral',
    interest: 'Business',
    status: 'Contacted',
    date: 'Nov 02, 2026',
  },
  {
    name: 'Arun Selvam',
    company: 'Shield Tech',
    source: 'Social Media',
    interest: 'Enterprise',
    status: 'Qualified',
    date: 'Oct 31, 2026',
  },
  {
    name: 'Sneha Pillai',
    company: 'SafeWay Security',
    source: 'Email',
    interest: 'Professional',
    status: 'Converted',
    date: 'Oct 28, 2026',
  },
  {
    name: 'Karthik R',
    company: 'Crown Security',
    source: 'Website',
    interest: 'Business',
    status: 'New',
    date: 'Nov 03, 2026',
  },
];

const LEAD_STATUS_BADGE = {
  New: 'blue',
  Contacted: 'rose',
  Qualified: 'orange',
  Converted: 'green',
};

export default function DataTablePage({ id, range, onBack }) {
  const { t, fmtDate, fmtDateTime } = useI18n();

  const [q, setQ] = useState('');
  const [f, setF] = useState('all');
  const [sort, setSort] = useState({ k: null, dir: 1 });

  const cfg = useMemo(() => ({
    companies: {
      rows: getCompanies(range),
      filter: 'status',
      cols: [
        ['name', 'col.company'],
        ['plan', 'col.plan', (v) => <PlanBadge v={v} />],
        ['users', 'col.users'],
        ['sites', 'col.sites'],
        ['status', 'col.status', (v) => <StatusBadge v={v} />],
        ['joined', 'col.joined', fmtDate],
      ],
    },

    signups: {
      rows: getSignups(range),
      filter: 'status',
      cols: [
        ['name', 'col.company'],
        ['contact', 'col.contact'],
        ['plan', 'col.plan', (v) => <PlanBadge v={v} />],
        ['status', 'col.status', (v) => <StatusBadge v={v} />],
        ['date', 'col.date', fmtDate],
      ],
    },

    activity: {
      rows: getActivity(range).map((a) => ({
        kind: a.kind,
        ts: a.ts,
        event: t(a.k, a.p),
        type: t(`kind.${a.kind}`),
      })),
      filter: 'type',
      cols: [
        [
          'event',
          'col.event',
          (v, r) => (
            <span className="evt">
              <EventIcon kind={r.kind} />
              {v}
            </span>
          ),
        ],
        ['ts', 'col.when', fmtDateTime],
        [
          'type',
          'col.type',
          (v, r) => (
            <span className={`badge ${KIND[r.kind]?.c || 'gray'}`}>
              {v}
            </span>
          ),
        ],
      ],
    },

    top: {
      rows: getTop(range).map((x, i) => ({
        rank: i + 1,
        ...x,
      })),
      filter: null,
      cols: [
        ['rank', 'col.rank'],
        ['name', 'col.company'],
        ['users', 'col.users'],
      ],
    },

    // New full-screen Leads table.
    leads: {
      rows: LEAD_ROWS,
      filter: 'status',
      cols: [
        ['name', 'Lead Name'],
        ['company', 'Company'],
        ['source', 'Source'],
        ['interest', 'Interest'],
        [
          'status',
          'Status',
          (v) => (
            <span className={`badge ${LEAD_STATUS_BADGE[v] || 'gray'}`}>
              {v}
            </span>
          ),
        ],
        ['date', 'Follow-up Date'],
      ],
    },
  }[id]), [id, range, t, fmtDate, fmtDateTime]);
  const table = cfg || {
  rows: [],
  filter: null,
  cols: [],
};

  // Prevent the page from crashing if an unsupported table ID is opened.
  if (!cfg) {
    return (
      <div className="dash">
        <div className="title-row">
          <div>
            <h1>Page Not Found</h1>
            <p>This table is not available.</p>
          </div>
          <button className="btn-sm big" onClick={onBack}>
            <ArrowLeft size={14} /> {t('back')}
          </button>
        </div>
      </div>
    );
  }

  const opts = cfg.filter
    ? [...new Set(cfg.rows.map((r) => r[cfg.filter]))]
    : [];

  const rows = useMemo(() => {
    let result = cfg.rows.filter((item) => {
      const matchesFilter =
        f === 'all' || item[cfg.filter] === f;

      const matchesSearch = Object.values(item)
        .join(' ')
        .toLowerCase()
        .includes(q.toLowerCase());

      return matchesFilter && matchesSearch;
    });

    if (sort.k) {
      result = [...result].sort((a, b) => {
        const first = String(a[sort.k] ?? '').toLowerCase();
        const second = String(b[sort.k] ?? '').toLowerCase();

        return (
          (first > second ? 1 : first < second ? -1 : 0) *
          sort.dir
        );
      });
    }

    return result;
  }, [cfg, q, f, sort]);

  const label = (option) => {
    if (id === 'activity' || id === 'leads') {
      return option;
    }

    return t(`status.${option}`);
  };

  const pageTitle =
    id === 'leads' ? 'Leads Overview' : t(`tp.${id}`);

  return (
    <div className="dash">
      <div className="title-row">
        <div>
          <h1>{pageTitle}</h1>
          <p>
            {t('tp.records', {
              a: rows.length,
              b: cfg.rows.length,
            })}
            {' · '}
            {fmtDate(range.start)} – {fmtDate(range.end)}
          </p>
        </div>

        <button className="btn-sm big" onClick={onBack}>
          <ArrowLeft size={14} />
          {' '}
          {t('back')}
        </button>
      </div>

      <section className="card full">
        <div className="toolbar">
          <div className="tsearch">
            <Search size={15} />
            <input
              placeholder={t('tp.search')}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {opts.length > 0 && (
            <select
              value={f}
              onChange={(e) => setF(e.target.value)}
            >
              <option value="all">{t('all')}</option>

              {opts.map((option) => (
                <option key={option} value={option}>
                  {label(option)}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="tscroll">
          <table className="tbl big">
            <thead>
              <tr>
                {cfg.cols.map(([key, heading]) => (
                  <th
                    key={key}
                    className="sortable"
                    onClick={() =>
                      setSort((current) => ({
                        k: key,
                        dir:
                          current.k === key
                            ? -current.dir
                            : 1,
                      }))
                    }
                  >
                    {id === 'leads' ? heading : t(heading)}

                    {sort.k === key &&
                      (sort.dir === 1 ? (
                        <ArrowUp size={11} />
                      ) : (
                        <ArrowDown size={11} />
                      ))}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id ?? row.name ?? index}>
                  {cfg.cols.map(([key, heading, render]) => (
                    <td key={key}>
                      {render
                        ? render(row[key], row)
                        : row[key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={cfg.cols.length}
                    className="empty"
                  >
                    {t('empty.period')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}