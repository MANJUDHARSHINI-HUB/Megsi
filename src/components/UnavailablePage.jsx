import { ArrowLeft, PlugZap } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
export default function UnavailablePage({ item, onBack }) {
  const { t } = useI18n(); const name = t(`nav.${item.id}`);
  return (
    <div className="dash">
      <div className="title-row"><div><h1>{name}</h1><p>{t(`navd.${item.id}`)}</p></div></div>
      <section className="card unavail">
        <PlugZap size={34} className="mc blue" />
        <span className="badge orange big"><i className="dot" />{t('ua.status')}</span>
        <h3>{t('ua.title', { name })}</h3>
        <p>{t('ua.body')}</p>
        <button className="btn-primary" onClick={onBack}><ArrowLeft size={15} /> {t('back')}</button>
      </section>
    </div>
  );
}
