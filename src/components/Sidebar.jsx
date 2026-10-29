
import * as I from 'lucide-react';
import { NAV } from '../data/mockData.js';
import { useI18n } from '../i18n/I18nContext.jsx';

// These IDs match the existing pages in src/data/mockData.js.
const ROLE_VISIBLE_NAV = {
  'Tenant Admin': [
    'dashboard',
    'companies',
    'usage',
    'tickets',
    'announce',
    'feature-requests',
  ],

  'Customer Admin': [
    'dashboard',
    'tickets',
    'announce',
    'feature-requests',
  ],

  'Support Agent': [
    'dashboard',
    'tickets',
    'support-access',
    'announce',
  ],

  'Auditor': [
    'dashboard',
    'alogs',
    'security',
    'audit',
  ],

  'Analyst': [
    'dashboard',
    'companies',
    'billing',
    'usage',
  ],

  'Manager': [
    'dashboard',
    'companies',
    'cadmins',
    'tickets',
    'announce',
  ],
};

export default function Sidebar({
  active,
  collapsed,
  onNav,
  userRole = 'Super Admin',
}) {
  const { t } = useI18n();

  // Super Admin and Admin can see the complete existing sidebar.
  const allowedItems = ROLE_VISIBLE_NAV[userRole]
    ?? (userRole === 'Super Admin' || userRole === 'Admin'
      ? null
      : ['dashboard']);

  const visibleNav = NAV
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !allowedItems || allowedItems.includes(item.id)
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="brand">
        <img
          className="brand-logo"
          src="/logo.png"
          alt="MEGSI"
        />
        <div className="brand-sub">{t('brandSub')}</div>
        <div className="brand-badge">{t('badge')}</div>
      </div>

      <nav>
        {visibleNav.map((group, gi) => (
          <div key={gi} className="nav-group">
            {group.gk && (
              <div className="nav-title">{t(group.gk)}</div>
            )}

            {group.items.map((item) => {
              const Icon = I[item.icon];
              const label = t(`nav.${item.id}`);

              return (
                <button
                  key={item.id}
                  title={label}
                  className={`nav-item ${
                    active === item.id ? 'active' : ''
                  }`}
                  onClick={() => onNav(item.id)}
                >
                  {Icon && <Icon size={18} />}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="app-info">
        <span className="ai-ic">
          <I.Settings size={18} />
        </span>
        <div>
          <b>{t('appName')}</b>
          <small>{t('version')}</small>
        </div>
      </div>
    </aside>
  );
}
