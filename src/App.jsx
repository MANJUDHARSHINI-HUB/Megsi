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
import RolesPermissions from './pages/RolesPermissions.jsx';
import FeatureRequests from './pages/FeatureRequests.jsx';

import { useI18n } from './i18n/I18nContext.jsx';
import { NAV } from './data/mockData.js';
import { PRESETS } from './data/selectors.js';

import SubscriptionPlans from './pages/SubscriptionPlans.jsx';
import UsageLimits from './pages/UsageLimits.jsx';
import SuspendedTenants from './pages/SuspendedTenants.jsx';
import PlatformUsers from './pages/PlatformUsers.jsx';
import useSuspendedTenants from './pages/suspended/useSuspendedTenants.js';
import CustomerAdmins from './pages/CustomerAdmins.jsx';
import AccessLogs from './pages/AccessLog.jsx';

const ITEMS = NAV.flatMap((group) => group.items);

const CONNECTED_PAGES = [
'dashboard',
'companies',
'plans',
'billing',
'usage',
'onboarding',
'suspended',
'pusers',
'cadmins',
'roles',
'alogs',
'features',
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


const timer = setTimeout(() => {
  setMsg(null);
}, 3000);

return () => clearTimeout(timer);


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
} else if (row.company) {
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
} else {
setDetail({
title: row.label,
rows: [
[t('d.type'), row.type],
[t('d.role'), t('d.demoUser')],
],
});
}
};

const item = ITEMS.find((entry) => entry.id === page);
const isTablePage = page.startsWith('table:');

return (
<div className={`app ${collapsed ? 'is-collapsed' : ''}`}>
<Sidebar
active={isTablePage ? 'dashboard' : page}
collapsed={collapsed}
onNav={go}
/>


  <div className="main">
    <Header
      onToggle={() => {
        setCollapsed((current) => !current);
      }}
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

      {/* Companies */}
      {page === 'companies' && (
        <Companies toast={toast} />
      )}

      {/* Subscription Plans */}
      {page === 'plans' && (
        <SubscriptionPlans toast={toast} />
      )}

      {/* Tenant Billing */}
      {page === 'billing' && (
        <TenantBilling
          range={range}
          setRange={setRange}
          toast={toast}
        />
      )}

      {/* Feature Requests */}
      {page === 'features' && (
        <FeatureRequests />
      )}

      {/* Usage & Limits */}
      {page === 'usage' && (
        <UsageLimits toast={toast} />
      )}

      {/* Onboarding */}
      {page === 'onboarding' && (
        <Onboarding
          range={range}
          setRange={setRange}
          toast={toast}
        />
      )}

      {/* Suspended Tenants */}
      {page === 'suspended' && (
        <SuspendedTenants
          store={suspendedStore}
          toast={toast}
        />
      )}

      {/* Platform Users */}
      {page === 'pusers' && (
        <PlatformUsers
          range={range}
          setRange={setRange}
          toast={toast}
        />
      )}

      {/* Customer Admins */}
      {page === 'cadmins' && (
        <CustomerAdmins
          range={range}
          setRange={setRange}
          toast={toast}
        />
      )}

      {/* Roles & Permissions */}
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

      {/* Dashboard Data Tables */}
      {isTablePage && (
        <DataTablePage
          id={page.slice(6)}
          range={range}
          onBack={() => go('dashboard')}
        />
      )}

      {/* Fallback for pages not yet implemented */}
      {!CONNECTED_PAGES.includes(page) &&
        !isTablePage &&
        item && (
          <UnavailablePage
            item={item}
            onBack={() => go('dashboard')}
          />
        )}
    </div>
  </div>

  {/* Shared Detail Panel */}
  <DetailPanel
    data={detail}
    onClose={() => setDetail(null)}
  />

  {/* Toast Notification */}
  {msg && (
    <div className="toast">
      {msg}
    </div>
  )}
</div>


);
}
