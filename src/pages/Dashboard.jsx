import { useMemo } from 'react';
import * as I from 'lucide-react';
import DateRangeMenu from '../components/DateRangeMenu.jsx';
import { CompanyGrowthChart, RevenueChart, TenantPlanChart } from '../components/Charts.jsx';
import { RecentCompanies, RecentSignups } from '../components/Tables.jsx';
import { PlatformActivity, SystemHealth, TopCompanies } from '../components/Panels.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { getActivity, getCompanies, getKpis, getSignups, getTop, isSingleMonth } from '../data/selectors.js';

const META = { companies: ['Building2', 'blue'], users: ['Users', 'green'], guards: ['Shield', 'orange'], sites: ['MapPin', 'purple'], incidents: ['AlertTriangle', 'red'], revenue: ['Wallet', 'blue'] };

export default function Dashboard({ range, setRange, openDetail, go, toast }) {
  const { t } = useI18n();
  const kpis = useMemo(() => getKpis(range), [range]);
  const d = useMemo(() => ({ companies: getCompanies(range), signups: getSignups(range), activity: getActivity(range), top: getTop(range) }), [range]);
  const month = isSingleMonth(range);
  return (
    <div className="dash">
      <div className="title-row">
        <div><h1>{t('title')}</h1><p>{t('welcome')}</p></div>
        <DateRangeMenu range={range} setRange={setRange} />
      </div>
      <div className="kpis">{kpis.map((k) => { const Ic = I[META[k.id][0]]; const down = k.change < 0;
        const dk = ['guards', 'incidents', 'revenue'].includes(k.id) && !(month && k.id !== 'revenue') ? 'dp' : 'd';
        const desc = k.id === 'revenue' && month ? t('kpi.revenue.d') : t(`kpi.${k.id}.${dk}`);
        return (
          <button key={k.id} className="card kpi" onClick={() => openDetail({ title: t(`kpi.${k.id}.t`), rows: [[t(`kpi.${k.id}.t`), k.value], [t('kd.change'), k.change == null ? '–' : `${k.change > 0 ? '+' : ''}${k.change}%`], ...k.rows.map((r) => [r.k ? t(r.k) : r.txt, r.v])] })}>
            <span className={`kpi-ic ${META[k.id][1]}`}><Ic size={26} /></span>
            <span className="kpi-t"><small>{t(`kpi.${k.id}.t`)}</small><span className="kpi-v"><b>{k.value}</b>
              {k.change == null ? <em className="neutral">–</em> : <em className={down ? 'down' : 'up'}>{down ? '↓' : '↑'} {Math.abs(k.change)}%</em>}</span></span>
            <span className="kpi-d">{desc}</span></button>); })}</div>
      <div className="row3"><CompanyGrowthChart range={range} /><TenantPlanChart range={range} /><RevenueChart range={range} /></div>
      <div className="row2">
        <RecentCompanies rows={d.companies.slice(0, 5)} onAll={() => go('table:companies')} openDetail={openDetail} toast={toast} />
        <RecentSignups rows={d.signups.slice(0, 5)} onAll={() => go('table:signups')} />
      </div>
      <div className="row3b">
        <PlatformActivity items={d.activity} onAll={() => go('table:activity')} />
        <TopCompanies rows={d.top} onAll={() => go('table:top')} />
        <SystemHealth openDetail={openDetail} />
      </div>
    </div>
  );
}
