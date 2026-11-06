import { useMemo, useState } from 'react';
import {
  Activity, ArrowLeft, Bell, Building2, Check,
  CheckCircle2, ChevronRight, Clock3, Download, FileCheck2, FileText,
  History, LayoutDashboard, Search, ShieldCheck, XCircle, MoreHorizontal,
} from 'lucide-react';
import {
  ONBOARDING_APPLICATIONS,
  ONBOARDING_ACTIVITY,
  ONBOARDING_STAGES
} from '../data/onboardingData.js';
import './onboarding.css';

const QUICK_PAGES = [
  { id: 'company', title: 'Company Verification Status', icon: ShieldCheck },
  { id: 'documents', title: 'Document Verification', icon: FileText },
  { id: 'review', title: 'Application Review Actions', icon: FileCheck2 },
  { id: 'applications', title: 'Onboarding Applications Table', icon: LayoutDashboard },
  { id: 'history', title: 'Verification History', icon: History },
  { id: 'notifications', title: 'Onboarding Notifications', icon: Bell }
];

const stageFor = app => {
  const index = ONBOARDING_STAGES.indexOf(app.stage);
  return index < 0 ? 0 : index;
};
const statusTone = status => {
  if (/approved|verified/i.test(status)) return 'success';
  if (/reject/i.test(status)) return 'danger';
  if (/return|pending/i.test(status)) return 'warning';
  return 'info';
};
const formatDate = value => new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric'
});

const safeDate = value => {
  if (!value) return null;
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};
const daysSince = value => {
  const date = safeDate(value);
  if (!date) return 0;
  return Math.max(0, Math.floor((new Date().setHours(12, 0, 0, 0) - date.getTime()) / 86400000));
};
const PRIORITIES = ['High', 'Medium', 'Low'];
const OVERDUE_AFTER_DAYS = 7;
const reviewerInitials = name => String(name || 'U').split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
const docsFor = app => [
  { name: 'Company Registration Certificate', status: app.checks?.registration === 'done' ? 'Verified' : app.checks?.registration === 'issue' ? 'Correction Required' : 'Pending' },
  { name: 'Business / Security Licence', status: app.checks?.documents === 'done' ? 'Verified' : app.checks?.documents === 'issue' ? 'Correction Required' : 'Pending' },
  { name: 'Insurance Certificate', status: app.checks?.insurance === 'done' ? 'Verified' : app.checks?.insurance === 'issue' ? 'Correction Required' : 'Pending' },
  { name: 'Guard Licence Records', status: app.checks?.guards === 'done' ? 'Verified' : app.checks?.guards === 'issue' ? 'Correction Required' : 'Pending' }
];

export default function Onboarding({ range, setRange, toast = () => {} }) {
  const [applications, setApplications] = useState(ONBOARDING_APPLICATIONS);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [subPage, setSubPage] = useState(null);
  const [selectedStagePage, setSelectedStagePage] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [stageFilter, setStageFilter] = useState('All Stages');
  const [visibleRows, setVisibleRows] = useState(18);
  const [reviewerFilter, setReviewerFilter] = useState('All Reviewers');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [openActionId, setOpenActionId] = useState(null);

  const selected = applications.find(app => app.id === selectedId);
  const filtered = useMemo(() => applications.filter(app => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [app.company, app.id, app.contact, app.email, app.registrationNumber].some(v => String(v || '').toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'All Statuses' || app.status === statusFilter;
    const matchesStage = stageFilter === 'All Stages' || app.stage === stageFilter;
    const matchesReviewer = reviewerFilter === 'All Reviewers' || (app.assignedReviewer || 'Unassigned') === reviewerFilter;
    const matchesPriority = priorityFilter === 'All Priorities' || (app.priority || 'Medium') === priorityFilter;
    return matchesSearch && matchesStatus && matchesStage && matchesReviewer && matchesPriority;
  }), [applications, search, statusFilter, stageFilter, reviewerFilter, priorityFilter]);

  const counts = useMemo(() => ({
    total: applications.length,
    pending: applications.filter(a => /pending|in progress|documents pending|returned/i.test(a.status)).length,
    verified: applications.filter(a => /approved/i.test(a.status) || a.stage === 'Account Activated').length,
    rejected: applications.filter(a => /rejected/i.test(a.status)).length
  }), [applications]);

  // Each pipeline count represents applications currently at that exact stage.
  const stageCounts = ONBOARDING_STAGES.map(name => ({
    name,
    count: applications.filter(a => a.stage === name).length
  }));

  const openCompany = app => {
    setSelectedId(app.id);
    setSubPage(null);
    setActiveTab('overview');
  };
  const backToMain = () => {
    setSelectedId(null);
    setSubPage(null);
  };
  const updateApplication = (id, updates) => {
    setApplications(old => old.map(app => app.id === id ? { ...app, ...updates, lastUpdated: new Date().toISOString() } : app));
  };
  const assignReviewer = id => {
    const current = applications.find(app => app.id === id);
    const reviewer = window.prompt(`Assign reviewer for ${current?.company || id}:\\nEnter reviewer name (leave blank to unassign).`, current?.assignedReviewer || '');
    if (reviewer === null) return;
    updateApplication(id, { assignedReviewer: reviewer.trim() || '' });
    toast(`Reviewer updated for ${id}.`);
  };
  const changePriority = id => {
    const current = applications.find(app => app.id === id);
    const priority = window.prompt(`Set priority for ${current?.company || id}: High, Medium or Low`, current?.priority || 'Medium');
    if (priority === null) return;
    const normalized = PRIORITIES.find(value => value.toLowerCase() === priority.trim().toLowerCase());
    if (!normalized) {
      toast('Please enter High, Medium or Low.');
      return;
    }
    updateApplication(id, { priority: normalized });
    toast(`Priority updated for ${id}.`);
  };
  const updateStatus = (id, status, stage) => {
    setApplications(old => old.map(app => app.id === id ? { ...app, status, stage: stage || app.stage } : app));
    toast(`Application ${id} updated.`);
  };
  const exportCsv = () => {
    const rows = [['Application ID', 'Company', 'Contact', 'Email', 'Plan', 'Submitted', 'Stage', 'Assigned Reviewer', 'Priority', 'Days Pending', 'Last Updated', 'Status'],
      ...filtered.map(a => [a.id, a.company, a.contact, a.email, a.plan, a.submitted, a.stage, a.assignedReviewer || 'Unassigned', a.priority || 'Medium', daysSince(a.submitted), a.lastUpdated || a.submitted, a.status])];
    const csv = rows.map(row => row.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'megsi-onboarding-applications.csv'; link.click();
    URL.revokeObjectURL(url);
    toast('Onboarding report exported.');
  };

  const handleApplicationsScroll = event => {
    const el = event.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 48 && visibleRows < filtered.length) {
      setVisibleRows(current => Math.min(current + 10, filtered.length));
    }
  };

  const goQuickPage = id => {
    setSelectedId(null);
    setSelectedStagePage(null);
    setSubPage(id);
    setSearch('');
    setStatusFilter('All Statuses');
    setStageFilter('All Stages');
    setReviewerFilter('All Reviewers');
    setPriorityFilter('All Priorities');
    setSelectedRows([]);
  };

  // Pipeline and work-queue clicks navigate to a dedicated stage page, not the dashboard table.
  const filterByStage = stage => {
    setSelectedId(null);
    setSelectedStagePage(stage);
    setSubPage('stage');
    setSearch('');
    setStatusFilter('All Statuses');
    setStageFilter('All Stages');
    setVisibleRows(18);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (selected) {
    return (
      <main className="onb-page">
        <div className="onb-detail-top">
          <button className="onb-back" onClick={backToMain}><ArrowLeft size={16}/> Back to Onboarding</button>
          <div className="onb-company-banner">
            <span className="onb-company-icon"><Building2 size={25}/></span>
            <div><h1>{selected.company}</h1><p>Application ID: {selected.id} <span>•</span> Applied on {formatDate(selected.submitted)}</p></div>
            <span className={`onb-status ${statusTone(selected.status)}`}>{selected.status}</span>
          </div>
        </div>

        <div className="onb-detail-kpis">
          <InfoCard icon={<ShieldCheck/>} title="Company Verification Status" value={selected.checks?.registration === 'done' ? 'Verified' : 'Pending'} tone="blue"/>
          <InfoCard icon={<FileText/>} title="Document Verification" value={docsFor(selected).every(d => d.status === 'Verified') ? 'Verified' : 'Pending'} tone="green"/>
          <InfoCard icon={<Clock3/>} title="Review Status" value={selected.status} tone="orange"/>
          <InfoCard icon={<CheckCircle2/>} title="Onboarding Progress" value={`${Math.round(((stageFor(selected) + 1) / ONBOARDING_STAGES.length) * 100)}%`} tone="purple"/>
        </div>

        <section className="onb-panel onb-company-pipeline">
          <PanelTitle icon={<Activity/>} title={`${selected.company} – Verification Pipeline`}/>
          <div className="onb-pipeline">
            {ONBOARDING_STAGES.map((stage, i) => {
              const complete = stageFor(selected) > i || selected.stage === 'Account Activated';
              const current = stageFor(selected) === i && selected.stage !== 'Account Activated';
              return <div className={`onb-pipeline-step ${complete ? 'complete' : ''} ${current ? 'current' : ''}`} key={stage}>
                <span>{complete ? <Check size={15}/> : i + 1}</span><b>{stage}</b>
                <small>{complete ? 'Completed' : current ? 'In Progress' : 'Not Started'}</small>
              </div>;
            })}
          </div>
        </section>

        <nav className="onb-tabs">
          {[
            ['overview', LayoutDashboard, 'Overview'],
            ['pipeline', Activity, 'Pipeline Details'],
            ['documents', FileText, 'Documents'],
            ['history', History, 'Verification History'],
            ['notifications', Bell, 'Notifications']
          ].map(([id, Icon, label]) => <button key={id} className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}><Icon size={16}/>{label}</button>)}
        </nav>

        {activeTab === 'overview' && <div className="onb-detail-grid">
          <section className="onb-panel">
            <PanelTitle icon={<Building2/>} title="Company Information"/>
            <KeyValues rows={[
              ['Company Name', selected.company], ['Registration / Application ID', selected.id],
              ['Contact Person', selected.contact], ['Email Address', selected.email],
              ['Phone Number', selected.phone || 'Not provided'], ['Region', selected.region || '—'],
              ['Selected Plan', selected.plan], ['Submitted Date', formatDate(selected.submitted)]
            ]}/>
          </section>
          <section className="onb-panel">
            <PanelTitle icon={<FileText/>} title="Document Verification"/>
            <DocumentTable app={selected}/>
          </section>
          <section className="onb-panel">
            <PanelTitle icon={<Activity/>} title="Recent Activity"/>
            <ActivityList items={ONBOARDING_ACTIVITY.filter(a => a.appId === selected.id)} empty="No activity has been recorded for this application yet."/>
          </section>
          <section className="onb-panel">
            <PanelTitle icon={<ShieldCheck/>} title="Reviewer Notes"/>
            <p className="onb-notes">{selected.notes || 'No reviewer notes available.'}</p>
            <div className="onb-action-row">
              <button className="onb-button primary" onClick={() => updateStatus(selected.id, 'Approved', 'Account Activated')}><CheckCircle2 size={15}/> Approve</button>
              <button className="onb-button" onClick={() => updateStatus(selected.id, 'Returned for Correction', selected.stage)}>Request Changes</button>
              <button className="onb-button danger" onClick={() => updateStatus(selected.id, 'Rejected', selected.stage)}><XCircle size={15}/> Reject</button>
            </div>
          </section>
        </div>}
        {activeTab === 'pipeline' && <section className="onb-panel"><PanelTitle icon={<Activity/>} title="Application Pipeline Details"/><div className="onb-pipeline vertical">{ONBOARDING_STAGES.map((stage,i) => <div className={`onb-pipeline-step ${stageFor(selected) > i || selected.stage === 'Account Activated' ? 'complete' : stageFor(selected) === i ? 'current' : ''}`} key={stage}><span>{i+1}</span><b>{stage}</b><small>{stageFor(selected) > i || selected.stage === 'Account Activated' ? 'Completed' : stageFor(selected) === i ? selected.status : 'Waiting'}</small></div>)}</div></section>}
        {activeTab === 'documents' && <section className="onb-panel"><PanelTitle icon={<FileText/>} title="All Submitted Documents"/><DocumentTable app={selected}/></section>}
        {activeTab === 'history' && <section className="onb-panel"><PanelTitle icon={<History/>} title="Verification History"/><ActivityList items={ONBOARDING_ACTIVITY.filter(a => a.appId === selected.id)} empty="No verification history is available yet."/></section>}
        {activeTab === 'notifications' && <section className="onb-panel"><PanelTitle icon={<Bell/>} title="Company Notifications"/><p className="onb-empty">Notifications related to {selected.company} will appear here.</p></section>}
      </main>
    );
  }

  if (subPage) {
    const isStagePage = subPage === 'stage';
    const pageInfo = QUICK_PAGES.find(p => p.id === subPage);
    const Icon = isStagePage ? Activity : (pageInfo?.icon || FileText);
    const title = isStagePage ? `${selectedStagePage} Applications` : (pageInfo?.title || 'Onboarding');
    const relevantApps = isStagePage
      ? applications.filter(a => a.stage === selectedStagePage)
      : subPage === 'company'
        ? applications
        : subPage === 'documents'
          ? applications.filter(a => docsFor(a).some(d => d.status !== 'Verified'))
          : subPage === 'review'
            ? applications.filter(a => /pending|in progress|returned|documents pending/i.test(a.status))
            : applications;
    const pageRows = relevantApps.filter(app => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || [app.company, app.id, app.contact, app.email].some(v => String(v || '').toLowerCase().includes(q));
      return matchesSearch && (statusFilter === 'All Statuses' || app.status === statusFilter);
    });
    return <main className="onb-page">
      <button className="onb-back" onClick={backToMain}><ArrowLeft size={16}/> Back to Onboarding</button>
      <div className="onb-page-head"><div><h1>{title}</h1><p>{isStagePage ? `All companies currently at the ${selectedStagePage} stage. Select a company to open its full onboarding record.` : `Review and manage ${title.toLowerCase()} across all company applications.`}</p></div><span className="onb-subpage-count">{pageRows.length} applications</span></div>
      {isStagePage && <section className="onb-stage-page-summary"><span className="onb-stage-page-icon"><Icon size={20}/></span><div><b>{selectedStagePage}</b><small>{relevantApps.length} companies currently at this stage</small></div><span className="onb-stage-page-total">{relevantApps.length}</span></section>}
      {subPage === 'history' || subPage === 'notifications'
        ? <section className="onb-panel"><PanelTitle icon={<Icon/>} title={title}/><ActivityList items={ONBOARDING_ACTIVITY} empty="There are no records to display."/></section>
        : <section className="onb-panel">
          <div className="onb-table-tools"><label className="onb-search"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies or application ID..."/></label><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>All Statuses</option>{[...new Set(relevantApps.map(a => a.status))].map(s => <option key={s}>{s}</option>)}</select></div>
          <ApplicationsTable rows={pageRows} onOpen={openCompany} onAssign={assignReviewer} onPriority={changePriority} openActionId={openActionId} setOpenActionId={setOpenActionId}/>
        </section>}
    </main>;
  }

  return (
    <main className="onb-page">
      <div className="onb-page-head">
        <div><h1>Onboarding</h1><p>Track new tenant registrations, verify company information, and manage onboarding progress across the MEGSI platform.</p></div>
        <div className="onb-head-actions">
          <button className="onb-button" onClick={exportCsv}><Download size={15}/> Export Report</button>
        </div>
      </div>

      <div className="onb-kpis">
        <InfoCard icon={<Building2/>} title="Total Applications" value={counts.total} description="All submitted applications" tone="blue"/>
        <InfoCard icon={<Clock3/>} title="Pending Review" value={counts.pending} description="Awaiting verification" tone="green"/>
        <InfoCard icon={<CheckCircle2/>} title="Verified Companies" value={counts.verified} description="Successfully verified" tone="orange"/>
        <InfoCard icon={<XCircle/>} title="Rejected Applications" value={counts.rejected} description="Requiring attention" tone="red"/>
      </div>

      <section className="onb-panel onb-pipeline-panel onb-pipeline-vertical-panel">
        <PanelTitle icon={<Activity/>} title="Verification Pipeline (Overall Progress)"/>
        <p className="onb-pipeline-intro">Select a stage to open its dedicated applications page.</p>
        <div className="onb-pipeline overall task-pipeline">
          {ONBOARDING_STAGES.map((stage, i) => (
            <button
              key={stage}
              className={`onb-pipeline-step ${stageFilter === stage ? 'selected' : ''}`}
              onClick={() => filterByStage(stage)}
              title={`Open ${stage} applications`}
            >
              <span>{i + 1}</span>
              <b>{stage}</b>
              <small>{stageCounts[i].count} applications</small>
              <ChevronRight className="onb-pipeline-arrow" size={15}/>
            </button>
          ))}
        </div>
      </section>

      <section className="onb-panel onb-applications-panel onb-applications-full" id="onb-applications">
        <div className="onb-section-title"><PanelTitle icon={<Building2/>} title="Onboarding Applications Table"/><span className="onb-record-count">{filtered.length} applications</span></div>
        <div className="onb-table-tools onb-advanced-tools">
          <label className="onb-search"><Search size={16}/><input value={search} onChange={e => { setSearch(e.target.value); setVisibleRows(18); }} placeholder="Search company, contact, ID or registration number..."/></label>
          <select aria-label="Filter by status" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setVisibleRows(18); }}><option>All Statuses</option>{[...new Set(applications.map(a => a.status))].map(s => <option key={s}>{s}</option>)}</select>
          <select aria-label="Filter by stage" value={stageFilter} onChange={e => { setStageFilter(e.target.value); setVisibleRows(18); }}><option>All Stages</option>{ONBOARDING_STAGES.map(stage => <option key={stage}>{stage}</option>)}</select>
          <select aria-label="Filter by reviewer" value={reviewerFilter} onChange={e => { setReviewerFilter(e.target.value); setVisibleRows(18); }}><option>All Reviewers</option><option>Unassigned</option>{[...new Set(applications.map(a => a.assignedReviewer).filter(Boolean))].map(name => <option key={name}>{name}</option>)}</select>
          <select aria-label="Filter by priority" value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setVisibleRows(18); }}><option>All Priorities</option>{PRIORITIES.map(priority => <option key={priority}>{priority}</option>)}</select>
          <button className="onb-clear-filters" onClick={() => { setSearch(''); setStatusFilter('All Statuses'); setStageFilter('All Stages'); setReviewerFilter('All Reviewers'); setPriorityFilter('All Priorities'); setVisibleRows(18); }}>Clear Filters</button>
        </div>
        <div className="onb-infinite-table" onScroll={handleApplicationsScroll}>
          <ApplicationsTable rows={filtered.slice(0, visibleRows)} onOpen={openCompany} onAssign={assignReviewer} onPriority={changePriority} openActionId={openActionId} setOpenActionId={setOpenActionId}/>
          {visibleRows < filtered.length && <div className="onb-load-more">Scroll down to load 10 more applications</div>}
          {visibleRows >= filtered.length && filtered.length > 8 && <div className="onb-load-more">Showing all {filtered.length} applications</div>}
        </div>
      </section>
    </main>
  );
}

function InfoCard({ icon, title, value, description, tone }) {
  return <div className="onb-kpi"><span className={`onb-kpi-icon ${tone}`}>{icon}</span><span className="onb-kpi-content"><small>{title}</small><b>{value}</b><em>{description}</em></span></div>;
}
function PanelTitle({ icon, title }) { return <header className="onb-panel-head"><span className="onb-panel-symbol">{icon}</span><h2>{title}</h2></header>; }
function KeyValues({ rows }) { return <div className="onb-key-values">{rows.map(([k,v]) => <div key={k}><span>{k}</span><b>{v || '—'}</b></div>)}</div>; }
function ApplicationsTable({ rows, onOpen, onAssign, onPriority, openActionId, setOpenActionId }) {
  return <div className="onb-table-wrap"><table className="onb-table onb-app-table"><thead><tr>
    <th>Company Name</th><th>Application ID</th><th>Submitted Date</th><th>Current Stage</th><th>Assigned Reviewer</th><th>Priority</th><th>Days Pending</th><th>Last Updated</th><th>Status</th><th>Action</th>
  </tr></thead><tbody>
    {rows.map(app => {
      const days = daysSince(app.submitted);
      const isClosed = /approved|verified|reject/i.test(app.status);
      const overdue = !isClosed && days > OVERDUE_AFTER_DAYS;
      const reviewer = app.assignedReviewer || '';
      const priority = PRIORITIES.includes(app.priority) ? app.priority : 'Medium';
      return <tr key={app.id} className={overdue ? 'onb-row-overdue' : ''}>
        <td><button className="onb-company-link" onClick={() => onOpen(app)}><Building2 size={16}/>{app.company}</button></td>
        <td>{app.id}</td><td>{formatDate(app.submitted)}</td><td>{app.stage}</td>
        <td><span className="onb-reviewer-cell"><span className="onb-reviewer-avatar">{reviewerInitials(reviewer || 'Unassigned')}</span><span>{reviewer || 'Unassigned'}</span></span></td>
        <td><span className={`onb-priority ${priority.toLowerCase()}`}><i/>{priority}</span></td>
        <td><span className={overdue ? 'onb-days overdue' : 'onb-days'}>{days} days</span></td>
        <td>{formatDate(app.lastUpdated || app.submitted)}</td>
        <td><span className={`onb-status onb-table-status ${statusTone(app.status)}`}><i aria-hidden="true"/>{app.status}</span></td>
        <td><div className="onb-row-actions">
          <button className="onb-view" onClick={() => onOpen(app)}>View <ChevronRight size={14}/></button>
          <div className="onb-action-menu">
            <button className="onb-more-button" aria-label={`More actions for ${app.company}`} onClick={() => setOpenActionId(openActionId === app.id ? null : app.id)}><MoreHorizontal size={17}/></button>
            {openActionId === app.id && <div className="onb-action-dropdown">
              <button onClick={() => { onAssign(app.id); setOpenActionId(null); }}>Assign Reviewer</button>
              <button onClick={() => { onPriority(app.id); setOpenActionId(null); }}>Change Priority</button>
              <button onClick={() => { onOpen(app); setOpenActionId(null); }}>View Application</button>
            </div>}
          </div>
        </div></td>
      </tr>;
    })}
    {!rows.length && <tr><td colSpan={10} className="onb-empty">No applications match your filters.</td></tr>}
  </tbody></table></div>;
}
function DocumentTable({ app }) {
  return <div className="onb-table-wrap"><table className="onb-table"><thead><tr><th>Document Name</th><th>Status</th><th>Remarks</th></tr></thead><tbody>{docsFor(app).map(doc => <tr key={doc.name}><td>{doc.name}</td><td><span className={`onb-status ${statusTone(doc.status)}`}>{doc.status}</span></td><td>{doc.status === 'Verified' ? 'No issues found' : app.documents || 'Awaiting verification'}</td></tr>)}</tbody></table></div>;
}
function ActivityList({ items, empty }) {
  return <div className="onb-activity-list">{items.length ? items.map(item => <div className="onb-activity-item" key={item.id}><i/><div><b>{item.company}</b><p>{String(item.type || 'Application update').replace(/([A-Z])/g, ' $1')}</p><small>{formatDate(item.at)}{item.at?.includes('T') ? ` • ${new Date(item.at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}` : ''}</small></div></div>) : <p className="onb-empty">{empty}</p>}</div>;
}