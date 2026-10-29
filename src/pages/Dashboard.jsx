import { useMemo, useState } from 'react';
import * as I from 'lucide-react';
import { CompanyGrowthChart, RevenueChart, TenantPlanChart } from '../components/Charts.jsx';
import { PlatformActivity, SystemHealth, TopCompanies } from '../components/Panels.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { getActivity, getCompanies, getKpis, getSignups, getTop, isSingleMonth } from '../data/selectors.js';
import { DEMO_TRACKING, SIGNUPS } from '../data/mockData.js';
import './revenueOverview.css';

const META = {
  companies: ['Building2', 'blue'],
  users: ['Users', 'green'],
  guards: ['Shield', 'orange'],
  sites: ['MapPin', 'purple'],
  incidents: ['AlertTriangle', 'red'],
  revenue: ['Wallet', 'blue'],
};

// Dashboard-only replacement for the old Recent Companies + Recent Signups panels.
function RecentActivities({ companies = [], signups = [], onAll }) {
  const { t, fmtDate } = useI18n();
  const rows = useMemo(() => {
    const merged = new Map();
    companies.forEach((company) => {
      merged.set(company.name, {
        ...company,
        contact: company.contact || signups.find((s) => s.name === company.name)?.contact || '—',
        date: company.joined || signups.find((s) => s.name === company.name)?.date || '',
      });
    });
    signups.forEach((signup) => {
      const existing = merged.get(signup.name);
      if (existing) {
        merged.set(signup.name, { ...existing, contact: existing.contact || signup.contact, date: existing.date || signup.date });
      } else {
        merged.set(signup.name, {
          id: `signup-${signup.id}`,
          name: signup.name,
          contact: signup.contact || '—',
          plan: signup.plan || '—',
          users: '—',
          sites: '—',
          status: signup.status || 'Trial',
          joined: signup.date || '',
          date: signup.date || '',
        });
      }
    });
    return [...merged.values()].sort((a, b) => String(b.joined || b.date).localeCompare(String(a.joined || a.date))).slice(0, 7);
  }, [companies, signups]);

  return (
    <section className="card table-card">
      <header className="card-h">
        <span className="ic-sq"><I.Activity size={16} /></span>
        <h3>Recent Activities</h3><div className="grow" />
        <button className="btn-sm" onClick={onAll}>{t('viewAll')}</button>
      </header>
      <div className="tscroll">
        <table className="tbl">
          <thead><tr><th>#</th><th>Company</th><th>Contact Person</th><th>Plan</th><th>Users</th><th>Sites</th><th>Status</th><th>Joining Date</th></tr></thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={8} className="empty">No recent activities</td></tr> : rows.map((row, index) => (
              <tr key={`${row.name}-${row.id ?? index}`}>
                <td>{index + 1}</td>
                <td><span className="name"><I.Building2 size={15} />{row.name}</span></td>
                <td>{row.contact || '—'}</td><td>{row.plan || '—'}</td><td>{row.users ?? '—'}</td><td>{row.sites ?? '—'}</td>
                <td><span className={`badge ${row.status === 'Active' ? 'green' : row.status === 'Suspended' ? 'red' : 'orange'}`}>{row.status || 'Trial'}</span></td>
                <td>{(row.joined || row.date) ? fmtDate(row.joined || row.date) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Demo tracking lives inside Revenue Overview (no separate Demo Tracking panel).
// Source: DEMO_TRACKING in mockData.js - clearly labelled sample data.
const gbp = (n) => `£${Math.round(n).toLocaleString('en-GB')}`;
const STATUS_BADGE = { Purchased: 'green', 'Demo Active': 'orange', Interested: 'blue', Pending: 'red' };

function RevenueOverview({ onViewAll }) {
  const { fmtDate } = useI18n();
  const rows = useMemo(() => [...DEMO_TRACKING]
    .map((d) => ({ ...d, contact: SIGNUPS.find((s) => s.name === d.company)?.contact || '—' }))
    .sort((a, b) => b.date.localeCompare(a.date)), []);
  const count = (status) => rows.filter((r) => r.status === status).length;
  const revenue = rows.filter((r) => r.status === 'Purchased').reduce((sum, r) => sum + r.amount, 0);
  const metrics = [
    { label: 'Using demo', value: String(count('Demo Active')), icon: I.Users },
    { label: 'Purchased', value: String(count('Purchased')), icon: I.CheckCircle2 },
    { label: 'Interested', value: String(count('Interested')), icon: I.TrendingUp },
    { label: 'Purchase revenue', value: gbp(revenue), icon: I.Wallet },
  ];
  const viewAll = () => onViewAll?.();
  return (
    <section className="card table-card revenue-overview-card">
      <header className="card-h">
        <span className="ic-sq"><I.Wallet size={16} /></span><h3>Revenue Overview</h3><div className="grow" />
        <span className="badge orange ro-sample">Sample data</span>
        <button className="btn-sm" onClick={viewAll}>View all</button>
      </header>
      <div className="metrics revenue-overview-metrics">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div className="metric ro-metric" key={label}><span>{label}</span><div><Icon size={18} className="mc blue" /><b>{value}</b></div></div>
        ))}
      </div>
      <div className="tscroll ro-scroll">
        <table className="tbl ro-table">
          <thead><tr><th>Company</th><th>Contact</th><th>Status</th><th>Amount</th><th>Date</th></tr></thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={5} className="empty">No demo activity</td></tr> : rows.map((item) => (
              <tr key={item.id}>
                <td>{item.company}</td><td>{item.contact}</td>
                <td><span className={`badge ${STATUS_BADGE[item.status] || 'orange'}`}>{item.status}</span></td>
                <td>{item.amount ? gbp(item.amount) : '—'}</td><td>{fmtDate(item.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function Dashboard({ range, openDetail, go, toast }) {
  const { t, fmtDate } = useI18n();
  const [revenueViewAll, setRevenueViewAll] = useState(false);
  const revenueRows = useMemo(() => [...DEMO_TRACKING]
    .map((d) => ({ ...d, contact: SIGNUPS.find((s) => s.name === d.company)?.contact || '—' }))
    .sort((a, b) => b.date.localeCompare(a.date)), []);
  const revenueTotal = revenueRows.filter((r) => r.status === 'Purchased').reduce((sum, r) => sum + r.amount, 0);
  const revenueCount = (status) => revenueRows.filter((r) => r.status === status).length;
  const revenueMetrics = [
    { label: 'Using demo', value: String(revenueCount('Demo Active')) },
    { label: 'Purchased', value: String(revenueCount('Purchased')) },
    { label: 'Interested', value: String(revenueCount('Interested')) },
    { label: 'Purchase revenue', value: gbp(revenueTotal) },
  ];
  const kpis = useMemo(() => getKpis(range), [range]);
  const data = useMemo(() => ({
    companies: getCompanies(range),
    signups: getSignups(range),
    activity: getActivity(range),
    top: getTop(range),
  }), [range]);
  const month = isSingleMonth(range);

  if (revenueViewAll) {
    return (
      <div className="dash revenue-all-page">
        <div className="title-row" style={{ alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1>Revenue Overview</h1>
            <p>Complete demo tracking and purchase records</p>
          </div>
          <button type="button" className="btn-sm" onClick={() => setRevenueViewAll(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px' }}>
            <I.ArrowLeft size={16} /> Return to Dashboard
          </button>
        </div>
        <div className="metrics revenue-overview-metrics" style={{ marginBottom: 20 }}>
          {revenueMetrics.map((metric) => (
            <div className="metric ro-metric" key={metric.label}>
              <span>{metric.label}</span>
              <div><I.Wallet size={18} className="mc blue" /><b>{metric.value}</b></div>
            </div>
          ))}
        </div>
        <section className="card table-card revenue-overview-card">
          <header className="card-h">
            <span className="ic-sq"><I.Wallet size={16} /></span>
            <h3>All Revenue Records</h3><div className="grow" />
            <span className="badge orange ro-sample">Sample data</span>
          </header>
          <div className="tscroll ro-scroll">
            <table className="tbl ro-table">
              <thead><tr><th>Company</th><th>Contact</th><th>Status</th><th>Amount</th><th>Date</th></tr></thead>
              <tbody>
                {revenueRows.length === 0 ? (
                  <tr><td colSpan={5} className="empty">No demo activity</td></tr>
                ) : revenueRows.map((item) => (
                  <tr key={item.id}>
                    <td>{item.company}</td><td>{item.contact}</td>
                    <td><span className={`badge ${STATUS_BADGE[item.status] || 'orange'}`}>{item.status}</span></td>
                    <td>{item.amount ? gbp(item.amount) : '—'}</td><td>{fmtDate(item.date)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr><th colSpan={3}>Total purchase revenue</th><th>{gbp(revenueTotal)}</th><th>—</th></tr></tfoot>
            </table>
          </div>
        </section>

        <section
          className="revenue-all-insights"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 16,
            marginTop: 18,
          }}
        >
          <article className="card" style={{ padding: '18px 20px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
              <span className="ic-sq"><I.BarChart3 size={16} /></span>
              <h3 style={{ margin: 0, fontSize: 14 }}>Revenue pipeline</h3>
            </div>
            {[
              { label: 'Purchased', count: revenueCount('Purchased'), color: '#16a34a' },
              { label: 'Interested', count: revenueCount('Interested'), color: '#2563eb' },
              { label: 'Demo active', count: revenueCount('Demo Active'), color: '#f59e0b' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flex: '0 0 auto' }} />
                <span style={{ color: '#53647c', fontSize: 12, flex: 1 }}>{item.label}</span>
                <strong style={{ color: '#10264a', fontSize: 13 }}>{item.count}</strong>
              </div>
            ))}
          </article>

          <article className="card" style={{ padding: '18px 20px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
              <span className="ic-sq"><I.Wallet size={16} /></span>
              <h3 style={{ margin: 0, fontSize: 14 }}>Purchase summary</h3>
            </div>
            <p style={{ margin: '0 0 6px', color: '#64748b', fontSize: 12 }}>Total confirmed purchase revenue</p>
            <strong style={{ display: 'block', color: '#0b2a55', fontSize: 24, lineHeight: 1.35 }}>{gbp(revenueTotal)}</strong>
            <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: 12 }}>
              {revenueCount('Purchased')} completed {revenueCount('Purchased') === 1 ? 'purchase' : 'purchases'} recorded
            </p>
          </article>

          <article className="card" style={{ padding: '18px 20px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
              <span className="ic-sq"><I.CalendarClock size={16} /></span>
              <h3 style={{ margin: 0, fontSize: 14 }}>Latest record</h3>
            </div>
            {revenueRows[0] ? (
              <>
                <strong style={{ display: 'block', color: '#10264a', fontSize: 13, marginBottom: 6 }}>{revenueRows[0].company}</strong>
                <span className={`badge ${STATUS_BADGE[revenueRows[0].status] || 'orange'}`}>{revenueRows[0].status}</span>
                <p style={{ margin: '10px 0 0', color: '#64748b', fontSize: 12 }}>{fmtDate(revenueRows[0].date)}</p>
              </>
            ) : (
              <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>No revenue records available.</p>
            )}
          </article>
        </section>
      </div>
    );
  }

  return (
    <div className="dash">
      <div className="title-row"><div><h1>{t('title')}</h1><p>{t('welcome')}</p></div></div>

      <div className="kpis">
        {kpis.map((k) => {
          const Icon = I[META[k.id]?.[0] || 'CircleHelp'];
          const down = k.change < 0;
          const detailKey = ['guards', 'incidents', 'revenue'].includes(k.id) && !(month && k.id !== 'revenue') ? 'dp' : 'd';
          const description = k.id === 'revenue' && month ? t('kpi.revenue.d') : t(`kpi.${k.id}.${detailKey}`);
          return (
            <button key={k.id} className="card kpi" onClick={() => openDetail?.({
              title: t(`kpi.${k.id}.t`),
              rows: [[t(`kpi.${k.id}.t`), k.value], [t('kd.change'), k.change == null ? '–' : `${k.change > 0 ? '+' : ''}${k.change}%`], ...(k.rows || []).map((row) => [row.k ? t(row.k) : row.txt, row.v])],
            })}>
              <span className={`kpi-ic ${META[k.id]?.[1] || 'blue'}`}><Icon size={26} /></span>
              <span className="kpi-t"><small>{t(`kpi.${k.id}.t`)}</small><span className="kpi-v"><b>{k.value}</b>
                {k.change == null ? <em className="neutral">–</em> : <em className={down ? 'down' : 'up'}>{down ? '↓' : '↑'} {Math.abs(k.change)}%</em>}
              </span></span>
              <span className="kpi-d">{description}</span>
            </button>
          );
        })}
      </div>

      <div className="row3"><CompanyGrowthChart /><TenantPlanChart /><RevenueChart /></div>

      <div className="row2 dashboard-lower-row">
        <RecentActivities companies={data.companies} signups={data.signups} onAll={() => go?.('table:companies')} openDetail={openDetail} toast={toast} />
        <RevenueOverview onViewAll={() => setRevenueViewAll(true)} />
      </div>

      <div className="row3b">
        <PlatformActivity items={data.activity} onAll={() => go?.('table:activity')} />
        <TopCompanies rows={data.top} onAll={() => go?.('table:top')} />
        <SystemHealth openDetail={openDetail} />
      </div>
    </div>
  );
}
