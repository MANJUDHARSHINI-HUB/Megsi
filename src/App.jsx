import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import { DetailPanel } from './components/Common.jsx';
import UnavailablePage from './components/UnavailablePage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Companies from './pages/Companies.jsx';
import UsageLimits from './pages/UsageLimits.jsx';
import DataTablePage from './pages/DataTablePage.jsx';
import { useI18n } from './i18n/I18nContext.jsx';
import { NAV } from './data/mockData.js';
import { PRESETS } from './data/selectors.js';

const ITEMS = NAV.flatMap((g) => g.items);

export default function App() {
  const { t, lang, fmtDate } = useI18n();
  const [page, setPage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [range, setRange] = useState({ start: PRESETS[0].start, end: PRESETS[0].end }); // single source of truth for the date range
  const [detail, setDetail] = useState(null);
  const [msg, setMsg] = useState(null);
  const toast = (m) => setMsg(m);
  useEffect(() => { if (!msg) return; const id = setTimeout(() => setMsg(null), 3000); return () => clearTimeout(id); }, [msg]);
  useEffect(() => { setDetail(null); setMsg(null); }, [lang]); // translated panel/toast text is built at open time
  const go = (p) => { setPage(p); setDetail(null); };
  const pick = (r) => {
    if (r.nav) go(r.nav);
    else if (r.company) setDetail({ title: r.company.name, rows: [[t('d.plan'), r.company.plan], [t('d.users'), r.company.users], [t('d.sites'), r.company.sites], [t('d.status'), t(`status.${r.company.status}`)], [t('d.joined'), fmtDate(r.company.joined)]] });
    else setDetail({ title: r.label, rows: [[t('d.type'), r.type], [t('d.role'), t('d.demoUser')]] });
  };
  const item = ITEMS.find((i) => i.id === page);
  return (
    <div className={`app ${collapsed ? 'is-collapsed' : ''}`}>
      <Sidebar active={page.startsWith('table:') ? 'dashboard' : page} collapsed={collapsed} onNav={go} />
      <div className="main">
        <Header onToggle={() => setCollapsed((c) => !c)} onPick={pick} toast={toast} go={go} />
        <div className="content">
          {page === 'dashboard' && <Dashboard range={range} setRange={setRange} openDetail={setDetail} go={go} toast={toast} />}
          {page.startsWith('table:') && <DataTablePage id={page.slice(6)} range={range} onBack={() => go('dashboard')} />}
          {page === 'companies' && <Companies toast={toast} />}
          {page === 'usage' && <UsageLimits toast={toast} />}
          {item && page !== 'dashboard' && page !== 'companies' && page !== 'usage' && <UnavailablePage item={item} onBack={() => go('dashboard')} />}        </div>
      </div>
      <DetailPanel data={detail} onClose={() => setDetail(null)} />
      {msg && <div className="toast">{msg}</div>}
    </div>
  );
}
