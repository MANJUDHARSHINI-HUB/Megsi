import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, CheckCircle2, Mail, MapPin, Phone, Plus, Search,
  Star, Users, UserRound, X, CalendarClock, ArrowRightLeft,
  Ban, SlidersHorizontal, MessageCircle, Clock, Send, Video,
  FileText, PhoneCall, Handshake
} from 'lucide-react';
import './leads-overview.css';

const seedLeads = [
  { id: 1, name: 'Ravi Kumar', company: 'ABC Security Solutions', email: 'ravi@abc.com', phone: '+91 98765 43210', source: 'Website', plan: 'Pro', status: 'New', assigned: 'Admin 1', followUp: '2026-10-30', created: '2026-10-25', location: 'Chennai, Tamil Nadu', type: 'Security Services', guards: '20 - 50', sites: '3 - 5', revenue: '₹10L - ₹50L', notes: 'Interested in Pro plan. Looking for demo next week. Discussed requirements and shared brochure.' },
  { id: 2, name: 'Priya Nair', company: 'BrightGuard Ltd', email: 'priya@bg.com', phone: '+91 87654 32109', source: 'Referral', plan: 'Business', status: 'Contacted', assigned: 'Admin 2', followUp: '2026-11-02', created: '2026-10-26', location: 'Bengaluru, Karnataka', type: 'Facility Security', guards: '50 - 100', sites: '5 - 10', revenue: '₹50L - ₹1Cr', notes: 'Referred by an existing customer. Requested pricing details.' },
  { id: 3, name: 'Arun Selvam', company: 'Shield Tech', email: 'arun@st.com', phone: '+91 91234 56789', source: 'Social Media', plan: 'Enterprise', status: 'Qualified', assigned: 'Admin 1', followUp: '2026-10-31', created: '2026-10-23', location: 'Coimbatore, Tamil Nadu', type: 'Technology', guards: '100 - 250', sites: '10 - 20', revenue: '₹1Cr - ₹5Cr', notes: 'Qualified opportunity. Needs multi-site access and reporting.' },
  { id: 4, name: 'Sneha Pillai', company: 'SafeWay Security', email: 'sneha@sw.com', phone: '+91 99887 66554', source: 'Email', plan: 'Professional', status: 'Demo Scheduled', assigned: 'Admin 3', followUp: '2026-11-04', created: '2026-10-21', location: 'Kochi, Kerala', type: 'Security Services', guards: '20 - 50', sites: '3 - 5', revenue: '₹10L - ₹50L', notes: 'Demo scheduled with the operations team.' },
  { id: 5, name: 'Karthik R', company: 'Crown Security', email: 'karthik@cs.com', phone: '+91 94433 22110', source: 'Website', plan: 'Business', status: 'Proposal Sent', assigned: 'Admin 2', followUp: '2026-11-06', created: '2026-10-18', location: 'Chennai, Tamil Nadu', type: 'Security Services', guards: '50 - 100', sites: '5 - 10', revenue: '₹50L - ₹1Cr', notes: 'Proposal shared. Waiting for management approval.' },
  { id: 6, name: 'Divya S', company: 'Matrix Force', email: 'divya@mf.com', phone: '+91 90123 45678', source: 'Referral', plan: 'Pro', status: 'Negotiation', assigned: 'Admin 1', followUp: '2026-11-08', created: '2026-10-16', location: 'Hyderabad, Telangana', type: 'Facility Security', guards: '100 - 250', sites: '10 - 20', revenue: '₹1Cr - ₹5Cr', notes: 'Discussing contract terms and onboarding timeline.' },
  { id: 7, name: 'Vimal Kumar', company: 'SecurePlus', email: 'vimal@sp.com', phone: '+91 98877 66543', source: 'Social Media', plan: 'Business', status: 'Converted', assigned: 'Admin 3', followUp: '', created: '2026-10-12', location: 'Madurai, Tamil Nadu', type: 'Security Services', guards: '50 - 100', sites: '5 - 10', revenue: '₹50L - ₹1Cr', notes: 'Successfully converted to a customer.' },
  { id: 8, name: 'Lakshmi N', company: 'Guardian Force', email: 'lakshmi@gf.com', phone: '+91 93456 77890', source: 'Email', plan: 'Starter', status: 'Lost', assigned: 'Admin 2', followUp: '', created: '2026-10-10', location: 'Pune, Maharashtra', type: 'Security Services', guards: '10 - 20', sites: '1 - 3', revenue: 'Below ₹10L', notes: 'Opportunity closed. Budget did not match current requirements.' },
  { id: 9, name: 'Suresh M', company: 'Alpha Security', email: 'suresh@as.com', phone: '+91 90678 55443', source: 'Website', plan: 'Pro', status: 'Contacted', assigned: 'Admin 1', followUp: '2026-11-03', created: '2026-10-08', location: 'Chennai, Tamil Nadu', type: 'Security Services', guards: '20 - 50', sites: '3 - 5', revenue: '₹10L - ₹50L', notes: 'Initial contact completed. Follow-up call pending.' },
  { id: 10, name: 'Meena K', company: 'Elite Guards', email: 'meena@eg.com', phone: '+91 98765 44321', source: 'Referral', plan: 'Business', status: 'Qualified', assigned: 'Admin 3', followUp: '2026-11-05', created: '2026-10-05', location: 'Mumbai, Maharashtra', type: 'Facility Security', guards: '100 - 250', sites: '10 - 20', revenue: '₹1Cr - ₹5Cr', notes: 'Strong fit for Business plan. Asked for implementation details.' },
];

const statuses = ['New', 'Contacted', 'Qualified', 'Demo Scheduled', 'Proposal Sent', 'Negotiation', 'Converted', 'Lost'];
const sources = ['Website', 'Referral', 'Social Media', 'Email'];
const plans = ['Starter', 'Pro', 'Professional', 'Business', 'Enterprise'];
const activityTypes = [
  'WhatsApp Message', 'Email Sent', 'Call', 'Meeting',
  'Negotiation', 'Follow-up', 'Note'
];
const people = ['Ravi Kumar','Priya Nair','Arun Selvam','Sneha Pillai','Karthik R','Divya S','Vimal Kumar','Lakshmi N','Suresh M','Meena K','Naveen Raj','Anitha P'];
const companies = ['ABC Security Solutions','BrightGuard Ltd','Shield Tech','SafeWay Security','Crown Security','Matrix Force','SecurePlus','Guardian Force','Alpha Security','Elite Guards','Sentinel Services','BluePeak Security','Aegis Protection','Metro Shield'];

const makeLeads = () => Array.from({ length: 48 }, (_, i) => {
  const base = seedLeads[i % seedLeads.length];
  if (i < seedLeads.length) return { ...base };
  const day = String(30 - (i % 25)).padStart(2, '0');
  const extraIndex = i - seedLeads.length;
  const generatedStatus = extraIndex < 13 ? 'New' : extraIndex < 29 ? 'Qualified' : extraIndex < 37 ? 'Converted' : 'Lost';
  return {
    ...base, id: i + 1, name: people[i % people.length], company: companies[i % companies.length],
    email: `${people[i % people.length].toLowerCase().replace(/[^a-z]/g,'')}${i}@example.com`,
    phone: `+91 ${90000 + i} ${10000 + i}`, source: sources[i % sources.length],
    plan: plans[i % plans.length], status: generatedStatus,
    assigned: `Admin ${(i % 3) + 1}`, followUp: i % 5 === 0 ? '' : `2026-11-${day}`,
    created: `2026-10-${String(30 - (i % 26)).padStart(2,'0')}`,
    location: ['Chennai, Tamil Nadu','Bengaluru, Karnataka','Hyderabad, Telangana'][i % 3],
    notes: 'Sample lead record. Contact the prospect to understand requirements and next steps.'
  };
});

const prettyDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const prettyDateTime = (value) => value ? new Date(value).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '';
const statusClass = (s) => s.toLowerCase().replaceAll(' ','-');

const getTodayISO = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const followUpClass = (date) => {
  if (!date) return 'no-date';
  const today = getTodayISO();
  if (date < today) return 'overdue';
  if (date === today) return 'due-today';
  const days = (Date.parse(`${date}T00:00:00`) - Date.parse(`${today}T00:00:00`)) / 86400000;
  return days <= 2 ? 'due-soon' : 'upcoming';
};

const activityIcon = (type) => {
  if (type.includes('WhatsApp')) return <MessageCircle size={14}/>;
  if (type.includes('Email')) return <Mail size={14}/>;
  if (type.includes('Call')) return <PhoneCall size={14}/>;
  if (type.includes('Meeting')) return <Video size={14}/>;
  if (type.includes('Negotiation')) return <Handshake size={14}/>;
  if (type.includes('Follow-up')) return <CalendarClock size={14}/>;
  if (type.includes('Converted')) return <CheckCircle2 size={14}/>;
  if (type.includes('Status')) return <ArrowRightLeft size={14}/>;
  if (type.includes('Lead Added')) return <Plus size={14}/>;
  return <FileText size={14}/>;
};

export default function LeadsOverviewPage({ onBack, toast = () => {} }) {
  const [leads, setLeads] = useState(makeLeads);
  const [selectedId, setSelectedId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sourceFilter, setSourceFilter] = useState('All Sources');
  const [planFilter, setPlanFilter] = useState('All Plans');
  const [assignedFilter, setAssignedFilter] = useState('All Assigned To');
  const [visibleCount, setVisibleCount] = useState(12);
  const [showAdd, setShowAdd] = useState(false);
  const [followDate, setFollowDate] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);

  const [activities, setActivities] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('megsiLeadActivities') || '{}');
    } catch {
      return {};
    }
  });
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityType, setActivityType] = useState('WhatsApp Message');
  const [activityNote, setActivityNote] = useState('');

  const [newLead, setNewLead] = useState({ name:'', company:'', email:'', phone:'', source:'Website', plan:'Pro', assigned:'Admin 1' });
  const listRef = useRef(null);
  const selected = leads.find(l => l.id === selectedId) || null;
  const selectedActivities = selected ? [...(activities[selected.id] || [])].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];

  const filtered = useMemo(() => {
    return leads
      .filter(l => {
        const q = query.trim().toLowerCase();
        return (
          (!q || [l.name, l.company, l.email, l.phone].some(v => String(v).toLowerCase().includes(q))) &&
          (statusFilter === 'All Status' || l.status === statusFilter) &&
          (sourceFilter === 'All Sources' || l.source === sourceFilter) &&
          (planFilter === 'All Plans' || l.plan === planFilter) &&
          (assignedFilter === 'All Assigned To' || l.assigned === assignedFilter)
        );
      })
      .sort((a,b) => {
        if (!a.followUp && !b.followUp) return 0;
        if (!a.followUp) return 1;
        if (!b.followUp) return -1;
        return a.followUp.localeCompare(b.followUp);
      });
  }, [leads, query, statusFilter, sourceFilter, planFilter, assignedFilter]);

  useEffect(() => {
    setVisibleCount(12);
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [query,statusFilter,sourceFilter,planFilter,assignedFilter]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
        setVisibleCount(v => Math.min(v + 12, filtered.length));
      }
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [filtered.length]);

  useEffect(() => {
    localStorage.setItem('megsiLeadActivities', JSON.stringify(activities));
  }, [activities]);

  const today = getTodayISO();
  const activeLeads = leads.filter(l => !['Converted', 'Lost'].includes(l.status));
  const overdueFollowUps = activeLeads.filter(l => l.followUp && l.followUp < today).length;
  const todayFollowUps = activeLeads.filter(l => l.followUp === today).length;
  const counts = {
    total: leads.length,
    new: leads.filter(l => l.status === 'New').length,
    qualified: leads.filter(l => l.status === 'Qualified').length,
    converted: leads.filter(l => l.status === 'Converted').length,
    followUps: overdueFollowUps + todayFollowUps,
  };

  const logActivity = (leadId, type, description) => {
    const newActivity = {
      id: Date.now() + Math.random(),
      type,
      description,
      actor: 'Admin 1',
      createdAt: new Date().toISOString()
    };
    setActivities(prev => ({
      ...prev,
      [leadId]: [...(prev[leadId] || []), newActivity]
    }));
  };

  const addActivity = (e) => {
    e.preventDefault();
    if (!selected || !activityNote.trim()) return;
    logActivity(selected.id, activityType, activityNote.trim());
    setActivityNote('');
    setActivityType('WhatsApp Message');
    setShowActivityForm(false);
    toast('Activity added successfully');
  };

  const updateLead = (id, patch) => setLeads(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));

  const contact = () => {
    if (!selected) return;
    window.location.href = `mailto:${selected.email}?subject=${encodeURIComponent(`Following up - ${selected.company}`)}`;
    toast(`Email draft opened for ${selected.name}`);
  };

  const schedule = () => {
    if (!followDate || !selected) return;
    const previousDate = selected.followUp;
    updateLead(selected.id, { followUp: followDate });
    logActivity(selected.id, 'Follow-up Scheduled', `Follow-up date ${previousDate ? `changed from ${prettyDate(previousDate)} to ` : 'scheduled for '}${prettyDate(followDate)}.`);
    setShowSchedule(false);
    toast(`Follow-up scheduled for ${prettyDate(followDate)}`);
  };

  const convert = () => {
    if (!selected) return;
    updateLead(selected.id, { status:'Converted', followUp:'' });
    logActivity(selected.id, 'Lead Converted', 'Lead was converted into a company/customer.');
    toast(`${selected.company} marked as converted`);
  };

  const markLost = () => {
    if (!selected) return;
    updateLead(selected.id, { status:'Lost', followUp:'' });
    logActivity(selected.id, 'Status Changed', 'Lead status changed to Lost.');
    toast(`${selected.company} marked as lost`);
  };

  const changeStatus = (newStatus) => {
    if (!selected || selected.status === newStatus) return;
    const oldStatus = selected.status;
    updateLead(selected.id, { status:newStatus });
    logActivity(selected.id, 'Status Changed', `Lead status changed from ${oldStatus} to ${newStatus}.`);
    toast(`Lead status changed to ${newStatus}`);
  };

  const add = (e) => {
    e.preventDefault();
    const id = Math.max(0,...leads.map(l => Number(l.id) || 0)) + 1;
    const item = { ...newLead, id, status:'New', followUp:'', created:new Date().toISOString().slice(0,10), location:'Not provided', type:'Security Services', guards:'—', sites:'—', revenue:'—', notes:'New lead added from Leads Overview.' };
    setLeads(prev => [item,...prev]);
    logActivity(id, 'Lead Added', 'Lead was added to MEGSI Leads Overview.');
    setSelectedId(id);
    setDrawerOpen(false);
    setShowAdd(false);
    setNewLead({ name:'', company:'', email:'', phone:'', source:'Website', plan:'Pro', assigned:'Admin 1' });
    toast('New lead added successfully');
  };

  return <div className="leads-page">
    <div className="leads-heading">
      <div><h1>Leads Overview</h1><p>Track and manage potential companies interested in MEGSI. Convert leads into customers and grow your business.</p></div>
      <div className="leads-head-actions"><button className="lead-btn light" onClick={onBack}><ArrowLeft size={15}/> Back to Dashboard</button><button className="lead-btn primary" onClick={()=>setShowAdd(true)}><Plus size={16}/> Add New Lead</button></div>
    </div>

    <div className="lead-metrics">
      <div className="lead-metric"><span className="metric-icon blue"><Users size={22}/></span><div><small>Total Leads</small><b>{counts.total}</b><em>↑ +12% vs. last month</em></div></div>
      <div className="lead-metric"><span className="metric-icon blue"><UserRound size={22}/></span><div><small>New Leads</small><b>{counts.new}</b><em>↑ +25% vs. last month</em></div></div>
      <div className="lead-metric"><span className="metric-icon amber"><Star size={22}/></span><div><small>Qualified Leads</small><b>{counts.qualified}</b><em>↑ +18% vs. last month</em></div></div>
      <div className="lead-metric"><span className="metric-icon green"><CheckCircle2 size={22}/></span><div><small>Converted Leads</small><b>{counts.converted}</b><em>↑ +50% vs. last month</em></div></div>
      <div className="lead-metric"><span className="metric-icon amber"><CalendarClock size={22}/></span><div><small>Follow-ups Due</small><b>{counts.followUps}</b><em>{overdueFollowUps} overdue · {todayFollowUps} due today</em></div></div>
    </div>

    <div className={`leads-workspace ${drawerOpen ? 'drawer-open' : ''}`}>
      <section className="leads-main">
        <div className="lead-filters">
          <label className="lead-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by company or lead name..."/></label>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>All Status</option>{statuses.map(s=><option key={s}>{s}</option>)}</select>
          <select value={sourceFilter} onChange={e=>setSourceFilter(e.target.value)}><option>All Sources</option>{sources.map(s=><option key={s}>{s}</option>)}</select>
          <select value={planFilter} onChange={e=>setPlanFilter(e.target.value)}><option>All Plans</option>{plans.map(s=><option key={s}>{s}</option>)}</select>
          <select value={assignedFilter} onChange={e=>setAssignedFilter(e.target.value)}><option>All Assigned To</option>{['Admin 1','Admin 2','Admin 3'].map(s=><option key={s}>{s}</option>)}</select>
          <button className="lead-clear-filter" onClick={()=>{setQuery('');setStatusFilter('All Status');setSourceFilter('All Sources');setPlanFilter('All Plans');setAssignedFilter('All Assigned To');}}>Clear Filters</button>
        </div>
        <div className="lead-table-scroll" ref={listRef}>
          <table className="lead-table">
            <thead><tr><th>#</th><th>Lead Name</th><th>Company</th><th>Email</th><th>Phone</th><th>Source</th><th>Interested Plan</th><th>Status</th><th>Assigned To</th><th>Follow-up Date</th><th>Created Date</th><th>Actions</th></tr></thead>
            <tbody>{filtered.slice(0,visibleCount).map((lead,index)=><tr key={lead.id} className={selectedId===lead.id?'selected-row':''}>
              <td>{index+1}</td><td className="lead-person">{lead.name}</td><td>{lead.company}</td><td>{lead.email}</td><td>{lead.phone}</td>
              <td><span className={`lead-tag source-${statusClass(lead.source)}`}>{lead.source}</span></td>
              <td><span className="lead-tag plan-tag">{lead.plan}</span></td><td><span className={`lead-status ${statusClass(lead.status)}`}>{lead.status}</span></td>
              <td>{lead.assigned}</td><td><span className={`lead-followup ${followUpClass(lead.followUp)}`}>{prettyDate(lead.followUp)}</span></td><td>{prettyDate(lead.created)}</td>
              <td><button className="lead-view" onClick={()=>{setSelectedId(lead.id);setDrawerOpen(true);}}><SlidersHorizontal size={13}/> View</button></td>
            </tr>)}
            {filtered.length===0&&<tr><td colSpan="12" className="lead-empty">No leads match these filters.</td></tr>}</tbody>
          </table>
          {visibleCount < filtered.length && <div className="lead-loading">Scroll down to load more leads…</div>}
          {visibleCount >= filtered.length && filtered.length>0 && <div className="lead-loading">Showing all {filtered.length} leads</div>}
        </div>
        <div className="lead-table-footer">Showing {Math.min(visibleCount,filtered.length)} of {filtered.length} leads <span>Infinite scroll enabled</span></div>
      </section>

      {drawerOpen && selected && <aside className="lead-drawer">
        <header><h2>Lead Details</h2><button aria-label="Close details" onClick={()=>setDrawerOpen(false)}><X size={18}/></button></header>
        <div className="lead-drawer-body">
          <div className="lead-profile"><span className="lead-avatar">{selected.name.split(' ').map(p=>p[0]).slice(0,2).join('')}</span><div><b>{selected.name}</b><small>{selected.company}</small></div><span className={`lead-status ${statusClass(selected.status)}`}>{selected.status}</span></div>
          <div className="lead-contact"><div><Mail size={15}/>{selected.email}</div><div><Phone size={15}/>{selected.phone}</div><div><MapPin size={15}/>{selected.location}</div></div>
          <div className="lead-info-grid"><div><small>Interested Plan</small><b>{selected.plan}</b></div><div><small>Source</small><b>{selected.source}</b></div><div><small>Assigned To</small><b>{selected.assigned}</b></div><div><small>Follow-up Date</small><b>{prettyDate(selected.followUp)}</b></div></div>
          <section className="lead-company-details"><h3>Company Details</h3><dl><dt>Company Name</dt><dd>{selected.company}</dd><dt>Business Type</dt><dd>{selected.type}</dd><dt>No. of Guards (Est.)</dt><dd>{selected.guards}</dd><dt>No. of Sites (Est.)</dt><dd>{selected.sites}</dd><dt>Annual Revenue (Est.)</dt><dd>{selected.revenue}</dd></dl></section>
          <section className="lead-status-section"><h3>Lead Status</h3><div>{statuses.map(s=><button key={s} className={selected.status===s?'active':''} onClick={()=>changeStatus(s)}>{s}</button>)}</div></section>
          <section className="lead-notes"><h3>Notes</h3><p>{selected.notes || 'No notes added.'}</p></section>

          {/* ACTIVITY TIMELINE: appears in the Lead Details drawer, below Notes and above Quick Actions. */}
          <section className="lead-activity-section">
            <div className="lead-activity-heading">
              <div><h3>Activity Timeline</h3><p>Track every interaction with this lead.</p></div>
              <span className="lead-activity-count">{selectedActivities.length}</span>
            </div>
            <button className="lead-add-activity-btn" type="button" onClick={()=>setShowActivityForm(v=>!v)}>
              <Plus size={14}/>{showActivityForm ? 'Close activity form' : 'Add Activity'}
            </button>

            {showActivityForm && <form className="lead-activity-form" onSubmit={addActivity}>
              <label>Activity type
                <select value={activityType} onChange={e=>setActivityType(e.target.value)}>
                  {activityTypes.map(type=><option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label>What happened?
                <textarea value={activityNote} onChange={e=>setActivityNote(e.target.value)} placeholder="Example: Sent the pricing details on WhatsApp and discussed the demo date..." rows={3} required/>
              </label>
              <button className="lead-btn primary" type="submit"><Plus size={14}/> Save Activity</button>
            </form>}

            {selectedActivities.length === 0 ? (
              <div className="lead-activity-empty"><Clock size={17}/><span>No activities recorded yet. Add the first interaction above.</span></div>
            ) : (
              <div className="lead-activity-list">
                {selectedActivities.map(activity=><article className="lead-activity-item" key={activity.id}>
                  <span className="lead-activity-icon">{activityIcon(activity.type)}</span>
                  <div className="lead-activity-content">
                    <div className="lead-activity-top"><b>{activity.type}</b><time>{prettyDateTime(activity.createdAt)}</time></div>
                    <p>{activity.description}</p>
                    <small>By {activity.actor || 'Admin'}</small>
                  </div>
                </article>)}
              </div>
            )}
          </section>

          <section className="lead-quick"><h3>Quick Actions</h3><div className="lead-quick-grid">
            <button onClick={contact}><Phone size={14}/> Contact Lead</button>
            <button onClick={()=>{setFollowDate(selected.followUp || getTodayISO());setShowSchedule(true);}}><CalendarClock size={14}/> Schedule Follow-up</button>
            <button className="convert" onClick={convert}><ArrowRightLeft size={14}/> Convert to Company</button>
            <button className="lost" onClick={markLost}><Ban size={14}/> Mark as Lost</button>
          </div></section>
        </div>
      </aside>}
    </div>

    {showAdd && <div className="lead-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowAdd(false);}}><form className="lead-modal" onSubmit={add}>
      <header><h2>Add New Lead</h2><button type="button" onClick={()=>setShowAdd(false)}><X size={18}/></button></header>
      <label>Lead Name<input required value={newLead.name} onChange={e=>setNewLead({...newLead,name:e.target.value})} placeholder="Enter contact name"/></label>
      <label>Company Name<input required value={newLead.company} onChange={e=>setNewLead({...newLead,company:e.target.value})} placeholder="Enter company name"/></label>
      <label>Email<input type="email" required value={newLead.email} onChange={e=>setNewLead({...newLead,email:e.target.value})} placeholder="name@company.com"/></label>
      <label>Phone<input required value={newLead.phone} onChange={e=>setNewLead({...newLead,phone:e.target.value})} placeholder="+91"/></label>
      <div className="lead-modal-row"><label>Source<select value={newLead.source} onChange={e=>setNewLead({...newLead,source:e.target.value})}>{sources.map(s=><option key={s}>{s}</option>)}</select></label><label>Plan<select value={newLead.plan} onChange={e=>setNewLead({...newLead,plan:e.target.value})}>{plans.map(s=><option key={s}>{s}</option>)}</select></label></div>
      <button className="lead-btn primary" type="submit"><Plus size={15}/> Save Lead</button>
    </form></div>}

    {showSchedule && <div className="lead-modal-backdrop"><form className="lead-modal schedule-modal" onSubmit={e=>{e.preventDefault();schedule();}}><header><h2>Schedule Follow-up</h2><button type="button" onClick={()=>setShowSchedule(false)}><X size={18}/></button></header><p>Choose the next follow-up date for {selected?.name}.</p><label>Follow-up date<input type="date" required value={followDate} onChange={e=>setFollowDate(e.target.value)}/></label><button className="lead-btn primary" type="submit">Save Follow-up</button></form></div>}
  </div>;
}
