import { Briefcase, MoreHorizontal, UserPlus } from 'lucide-react';
import { Avatar, Menu, PlanBadge, StatusBadge } from './Common.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

const Head = ({ icon, title, onAll }) => {
  const { t } = useI18n();
  return <header className="card-h"><span className="ic-sq">{icon}</span><h3>{title}</h3><div className="grow" /><button className="btn-sm" onClick={onAll}>{t('viewAll')}</button></header>;
};
const Empty = ({ cols }) => { const { t } = useI18n(); return <tr><td colSpan={cols} className="empty">{t('empty.period')}</td></tr>; };

export function RecentCompanies({ rows, onAll, openDetail, toast }) {
  const { t, fmtDate } = useI18n();
  return (
    <section className="card table-card">
      <Head icon={<Briefcase size={16} />} title={t('tb.companies')} onAll={onAll} />
      <div className="tscroll"><table className="tbl">
        <thead><tr><th>{t('col.num')}</th><th>{t('col.company')}</th><th>{t('col.plan')}</th><th>{t('col.users')}</th><th>{t('col.sites')}</th><th>{t('col.status')}</th><th>{t('col.joined')}</th><th className="r">{t('col.actions')}</th></tr></thead>
        <tbody>{rows.length === 0 && <Empty cols={8} />}{rows.map((c, i) => (
          <tr key={c.id}><td>{i + 1}</td><td><span className="name"><Avatar name={c.name} />{c.name}</span></td>
            <td><PlanBadge v={c.plan} /></td><td>{c.users}</td><td>{c.sites}</td><td><StatusBadge v={c.status} /></td><td>{fmtDate(c.joined)}</td>
            <td className="r"><Menu button={<span className="dots"><MoreHorizontal size={14} /></span>}>{(close) => (<>
              <div className="item" onClick={() => { openDetail({ title: c.name, rows: [[t('d.plan'), c.plan], [t('d.users'), c.users], [t('d.sites'), c.sites], [t('d.status'), t(`status.${c.status}`)], [t('d.joined'), fmtDate(c.joined)]] }); close(); }}>{t('act.view')}</div>
              <div className="item" onClick={() => { toast(t('toast.edit', { name: c.name })); close(); }}>{t('act.edit')}</div>
              <div className="item" onClick={() => { openDetail({ title: `${c.name} – ${t('act.sub')}`, rows: [[t('d.plan'), c.plan], [t('d.billing'), t('d.monthly')], [t('d.renewal'), fmtDate('2026-11-20')]] }); close(); }}>{t('act.sub')}</div></>)}</Menu></td></tr>))}
        </tbody></table></div>
    </section>
  );
}

export function RecentSignups({ rows, onAll }) {
  const { t, fmtDate } = useI18n();
  return (
    <section className="card table-card">
      <Head icon={<UserPlus size={16} />} title={t('tb.signups')} onAll={onAll} />
      <div className="tscroll"><table className="tbl">
        <thead><tr><th>{t('col.num')}</th><th>{t('col.company')}</th><th>{t('col.contact')}</th><th>{t('col.plan')}</th><th>{t('col.status')}</th><th>{t('col.date')}</th></tr></thead>
        <tbody>{rows.length === 0 && <Empty cols={6} />}{rows.map((s, i) => (
          <tr key={s.id}><td>{i + 1}</td><td><span className="name"><Avatar name={s.name} />{s.name}</span></td><td>{s.contact}</td>
            <td><PlanBadge v={s.plan} /></td><td><StatusBadge v={s.status} /></td><td>{fmtDate(s.date)}</td></tr>))}
        </tbody></table></div>
    </section>
  );
}
