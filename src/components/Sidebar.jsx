import * as I from 'lucide-react';
import { NAV } from '../data/mockData.js';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function Sidebar({ active, collapsed, onNav }) {
  const { t } = useI18n();
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="brand"><img className="brand-logo" src="/logo.png" alt="MEGSI" /><div className="brand-sub">{t('brandSub')}</div><div className="brand-badge">{t('badge')}</div></div>
      <nav>{NAV.map((g, gi) => (
        <div key={gi} className="nav-group">
          {g.gk && <div className="nav-title">{t(g.gk)}</div>}
          {g.items.map((it) => { const Ic = I[it.icon]; const label = t(`nav.${it.id}`); return (
            <button key={it.id} title={label} className={`nav-item ${active === it.id ? 'active' : ''}`} onClick={() => onNav(it.id)}>
              <Ic size={18} /><span>{label}</span></button>); })}
        </div>))}
      </nav>
      <div className="app-info"><span className="ai-ic"><I.Settings size={18} /></span><div><b>{t('appName')}</b><small>{t('version')}</small></div></div>
    </aside>
  );
}
