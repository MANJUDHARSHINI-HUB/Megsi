import * as I from 'lucide-react';
import { HEALTH, KIND } from '../data/mockData.js';
import { useI18n } from '../i18n/I18nContext.jsx';

const Head = ({ icon, title, onAll, right, onTitle }) => {
  const { t } = useI18n();
  return (
    <header className="card-h"><span className="ic-sq">{icon}</span><h3 onClick={onTitle} style={onTitle ? { cursor: 'pointer' } : null}>{title}</h3><div className="grow" />
      {onAll && <button className="btn-sm" onClick={onAll}>{t('viewAll')}</button>}{right}</header>
  );
};
const Empty = () => { const { t } = useI18n(); return <div className="empty">{t('empty.period')}</div>; };

export const EventIcon = ({ kind, size = 12 }) => { const Ic = I[KIND[kind].icon]; return <span className={`tl-ic ${KIND[kind].c}`}><Ic size={size} /></span>; };

export function PlatformActivity({ items, onAll }) {
  const { t, fmtDateTime } = useI18n();
  return (
    <section className="card panel">
      <Head icon={<I.Shield size={16} />} title={t('pn.activity')} onAll={onAll} />
      {items.length === 0 ? <Empty /> : (
        <ul className="timeline">{items.slice(0, 6).map((a, i) => (
          <li key={i} className={KIND[a.kind].c}><EventIcon kind={a.kind} /><span className="tl-t">{t(a.k, a.p)}</span><span className="tl-d"><i className="tl-dot" />{fmtDateTime(a.ts)}</span></li>))}</ul>)}
    </section>
  );
}

export function TopCompanies({ rows, onAll }) {
  const { t } = useI18n();
  const top = rows.slice(0, 5), max = top[0]?.users || 1;
  return (
    <section className="card panel">
      <Head icon={<I.Building2 size={16} />} title={t('pn.top')} onAll={onAll} />
      {top.length === 0 ? <Empty /> : (
        <ul className="bars">{top.map((x) => (
          <li key={x.name}><span className="bn">{x.name}</span><span className="bt"><i style={{ width: `${(x.users / max) * 100}%` }} /></span><b>{x.users}</b></li>))}</ul>)}
    </section>
  );
}

export function SystemHealth({ openDetail }) {
  const { t, fmtDateTime } = useI18n();
  const open = (title, rows) => openDetail({ title, rows });
  return (
    <section className="card panel">
      <Head icon={<I.Monitor size={16} />} title={t('pn.health')} onTitle={() => open(t('pn.health'), HEALTH.metrics.map((m) => [t(`hm.${m.k}`), m.value]))}
        right={<span className="badge green big"><i className="dot" />{t('allOk')}</span>} />
      <div className="metrics">{HEALTH.metrics.map((m) => { const Ic = I[m.icon]; return (
        <div className="metric" key={m.k}><span>{t(`hm.${m.k}`)}</span><div><Ic size={20} className={`mc ${m.c}`} /><b>{m.value}</b></div><small>{t(`hm.${m.k}.s`)}</small></div>); })}</div>
      <ul className="services">{HEALTH.services.map((s) => (
        <li key={s.k} onClick={() => open(t(s.k), [[t('d.status'), t('status.Operational')], [t('d.checked'), fmtDateTime(s.checked)]])}>
          <I.CheckCircle2 size={18} className="ok" /><span className="sn">{t(s.k)}</span><span className="badge green sm"><i className="dot" />{t('status.Operational')}</span><small>{t('lastChecked', { d: fmtDateTime(s.checked) })}</small></li>))}</ul>
    </section>
  );
}
