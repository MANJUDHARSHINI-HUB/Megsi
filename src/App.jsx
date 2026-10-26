
import { useEffect, useState } from 'react';

import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import { DetailPanel } from './components/Common.jsx';
import UnavailablePage from './components/UnavailablePage.jsx';

import Dashboard from './pages/Dashboard.jsx';
import Companies from './pages/Companies.jsx';
import TenantBilling from './pages/TenantBilling.jsx';
import Onboarding from './pages/Onboarding.jsx';
import DataTablePage from './pages/DataTablePage.jsx';

import SubscriptionPlans from './pages/SubscriptionPlans.jsx';
import UsageLimits from './pages/UsageLimits.jsx';
import SuspendedTenants from './pages/SuspendedTenants.jsx';
import PlatformUsers from './pages/PlatformUsers.jsx';
import RolesPermissions from './pages/RolesPermissions.jsx';
import CustomerAdmins from './pages/CustomerAdmins.jsx';
import AccessLogs from './pages/AccessLog.jsx';
import SecurityCompliance from './pages/SecurityCompliance.jsx';
import SupportAccess from './pages/SupportAccess.jsx';

import useSuspendedTenants from './pages/suspended/useSuspendedTenants.js';

import { useI18n } from './i18n/I18nContext.jsx';
import { NAV } from './data/mockData.js';
import { PRESETS } from './data/selectors.js';

const ITEMS = NAV.flatMap((group) => group.items);

const IMPLEMENTED_PAGES = [
  'dashboard',
  'companies',
  'billing',
  'onboarding',
  'plans',
  'usage',
  'suspended',
  'pusers',
  'cadmins',
  'roles',
  'alogs',
  'security',
  'support-access',
];

export default function App() {
  const suspendedStore = useSuspendedTenants();

  const { t, lang, fmtDate } = useI18n();

  const [page, setPage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const [range, setRange] = useState({
    start: PRESETS[0].start,
    end: PRESETS[0].end,
  });

  const [detail, setDetail] = useState(null);
  const [msg, setMsg] = useState(null);

  const toast = (message) => {
    setMsg(message);
  };

  useEffect(() => {
    if (!msg) return undefined;

    const timeoutId = setTimeout(() => {
      setMsg(null);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [msg]);

  useEffect(() => {
    setDetail(null);
    setMsg(null);
  }, [lang]);

  const go = (nextPage) => {
    setPage(nextPage);
    setDetail(null);
  };

  const pick = (row) => {
    if (row.nav) {
      go(row.nav);
      return;
    }

    if (row.company) {
      setDetail({
        title: row.company.name,
        rows: [
          [t('d.plan'), row.company.plan],
          [t('d.users'), row.company.users],
          [t('d.sites'), row.company.sites],
          [
            t('d.status'),
            t(`status.${row.company.status}`),
          ],
          [
            t('d.joined'),
            fmtDate(row.company.joined),
          ],
        ],
      });

      return;
    }

    setDetail({
      title: row.label,
      rows: [
        [t('d.type'), row.type],
        [t('d.role'), t('d.demoUser')],
      ],
    });
  };

  const item = ITEMS.find((navItem) => navItem.id === page);

  return (
    <div className={`app ${collapsed ? 'is-collapsed' : ''}`}>
      <Sidebar
        active={page.startsWith('table:') ? 'dashboard' : page}
        collapsed={collapsed}
        onNav={go}
      />

      <div className="main">
        <Header
          onToggle={() => setCollapsed((current) => !current)}
          onPick={pick}
          toast={toast}
          go={go}
        />

        <div className="content">
          {/* Dashboard */}
          {page === 'dashboard' && (
            <Dashboard
              range={range}
              setRange={setRange}
              openDetail={setDetail}
              go={go}
              toast={toast}
            />
          )}

          {/* Dashboard data tables */}
          {page.startsWith('table:') && (
            <DataTablePage
              id={page.slice(6)}
              range={range}
              onBack={() => go('dashboard')}
            />
          )}

          {/* Companies */}
          {page === 'companies' && (
            <Companies toast={toast} />
          )}

          {/* Tenant Billing */}
          {page === 'billing' && (
            <TenantBilling
              range={range}
              setRange={setRange}
              toast={toast}
            />
          )}

          {/* Onboarding */}
          {page === 'onboarding' && (
            <Onboarding
              range={range}
              setRange={setRange}
              toast={toast}
            />
          )}

          {/* Subscription Plans */}
          {page === 'plans' && (
            <SubscriptionPlans toast={toast} />
          )}

          {/* Usage Limits */}
          {page === 'usage' && <UsageLimits />}

          {/* Suspended Tenants */}
          {page === 'suspended' && (
            <SuspendedTenants
              store={suspendedStore}
              toast={toast}
            />
          )}

          {/* Platform Users */}
          {page === 'pusers' && <PlatformUsers />}

          {/* Customer Admins */}
          {page === 'cadmins' && (
            <CustomerAdmins
              range={range}
              setRange={setRange}
              toast={toast}
            />
          )}

          {/* Roles and Permissions */}
          {page === 'roles' && (
            <RolesPermissions
              range={range}
              setRange={setRange}
              toast={toast}
            />
          )}

          {/* Access Logs */}
          {page === 'alogs' && (
            <AccessLogs
              range={range}
              setRange={setRange}
              toast={toast}
            />
          )}

          {/* Security Compliance */}
          {page === 'security' && (
            <SecurityCompliance toast={toast} />
          )}

          {/* Support Access */}
          {page === 'support-access' && (
            <SupportAccess toast={toast} />
          )}

          {/* Pages that have not been implemented */}
          {item &&
            !IMPLEMENTED_PAGES.includes(page) &&
            !page.startsWith('table:') && (
              <UnavailablePage
                item={item}
                onBack={() => go('dashboard')}
              />
            )}
        </div>
      </div>

      {/* Detail Panel */}
      <DetailPanel
        data={detail}
        onClose={() => setDetail(null)}
      />

      {/* Toast Message */}
      {msg && (
        <div className="toast">
          {msg}
        </div>
      )}
    </div>
  );
}
