// Standalone Suspended Tenants demo records. No backend or cross-page data dependency.
export const REASONS = ['Payment Overdue', 'Terms Violation', 'Security Issue', 'Inactive Account', 'Admin Action'];
export const PLANS = ['Starter', 'Professional', 'Business', 'Enterprise'];
export const STATUSES = ['Pending Review', 'Under Review', 'Critical', 'Eligible for Reactivation', 'Rejected'];

const companies = [
  'Global Security Ltd','Skyline Solutions','NextGen Technologies','Metro Security Services','SecureGuard Ltd',
  'TechShield Solutions','Sentinel Force','Apex Protection Group','Guardian Services','BluePeak Security',
  'PrimeWatch Ltd','Titan Security Group','EverSafe Operations','NorthStar Guards','Pioneer Protection',
  'Elite Patrol Services','Crown Security Ltd','Vanguard Workforce','Summit Guarding','Urban Shield',
  'Falcon Security Partners','Sterling Protection','Redwood Security','Beacon Workforce','Atlas Guard Services',
  'Horizon Safety Group','Ironclad Security','Noble Protection Ltd','Unity Guarding','Crestline Security',
  'Westbridge Services','Silverline Protection','Rapid Response Group','Oakwood Security','Fortress Workforce',
  'Clearview Patrols','FirstLine Security','BlueStone Protection','Keystone Guarding','Highland Security',
  'Cornerstone Safety','Allied Protection Ltd','Vertex Security','TrueNorth Guarding','Capital Security Group',
  'ShieldPoint Services','Pinnacle Protection','Cobalt Security','BrightPath Guarding','Civic Safety Ltd',
  'Orion Security Services','Redline Protection','Parkway Guarding','Lighthouse Security','Mosaic Workforce',
  'Greenfield Protection','Westgate Security','Sterling Guard Services','Central Shield Ltd','Nova Security Group'
];
const reasons = ['Payment Overdue','Terms Violation','Security Issue','Inactive Account','Admin Action'];
const plans = ['Business','Professional','Enterprise','Starter'];
const statuses = ['Pending Review','Under Review','Critical','Eligible for Reactivation','Rejected'];
const admins = ['Olivia Bennett','James Carter','Sophia Wilson','Liam Anderson','Amelia Thomas'];
const people = ['David Miller','Sarah Johnson','Michael Brown','Emma Davis'];
const pad = n => String(n).padStart(2,'0');
export const TENANTS = companies.map((name, i) => {
  const day = 19 - (i % 18);
  const hour = 9 + (i % 9);
  const reason = reasons[i % reasons.length];
  const plan = plans[i % plans.length];
  const status = statuses[i % statuses.length];
  const usersMax = [150,100,250,75][i % 4];
  const users = Math.min(usersMax, [120,72,188,54][i % 4] + (i % 7));
  const guardsMax = [100,80,200,50][i % 4];
  const guards = Math.min(guardsMax, [85,61,142,38][i % 4] + (i % 6));
  const sitesMax = [15,12,30,8][i % 4];
  const sites = Math.min(sitesMax, [12,8,21,5][i % 4] + (i % 3));
  const storageMax = [500,250,1000,100][i % 4];
  const storage = Math.min(storageMax, [420,180,730,62][i % 4] + (i * 3 % 35));
  return {
    id: `TN-${1024+i}`, name, plan, reason, status,
    suspendedDate: `2026-10-${pad(day)} ${pad(hour)}:${pad((i*7)%60)}`,
    suspendedBy: people[i % people.length],
    admin: admins[i % admins.length],
    email: `admin${i+1}@${name.toLowerCase().replace(/[^a-z0-9]+/g,'.').replace(/^\.+|\.+$/g,'')}.com`,
    phone: `+44 20 7${pad(10+i)} ${pad(20+i)} ${pad(30+i)}`,
    contact: admins[i % admins.length],
    users, usersMax, guards, guardsMax, sites, sitesMax, storage, storageMax,
    renewal: `2027-${pad(1+(i%12))}-${pad(5+(i%20))}`,
    startDate: `2025-${pad(1+(i%12))}-${pad(3+(i%24))}`,
    lastPayment: `2026-09-${pad(10+(i%18))}`,
    outstanding: reason === 'Payment Overdue' ? 24500 + i*350 : i%3===0 ? 8200+i*120 : 0,
    price: [499,899,1499,2499][i%4],
    notes: reason === 'Payment Overdue' ? 'Payment not received for 2 billing cycles.' : `${reason} identified during routine tenant compliance monitoring.`,
    reviewBy: people[(i+1)%people.length],
    reviewDate: `2026-10-${pad(20+(i%8))}`,
    history: [
      { date: `2026-10-${pad(day)}`, title: 'Tenant suspended', detail: reason, by: people[i%people.length] },
      { date: `2026-10-${pad(Math.max(1,day-2))}`, title: 'Review flagged', detail: 'Account flagged for administrative review', by: 'System' },
      { date: `2026-10-${pad(Math.max(1,day-5))}`, title: 'Payment recorded', detail: 'Last successful payment received', by: 'Billing System' }
    ]
  };
});
export const SUMMARY = [
  { label:'Total Suspended', value:'534', change:'+2', icon:'ban', tone:'red' },
  { label:'Suspended This Month', value:'28', change:'+1', icon:'calendar', tone:'orange' },
  { label:'Pending Review', value:'17', change:'+1', icon:'file', tone:'blue' },
  { label:'Eligible for Reactivation', value:'12', change:'+1', icon:'check', tone:'purple' },
  { label:'Critical Suspensions', value:'8', change:'+1', icon:'shield', tone:'green' }
];
export const PERIODS = ['Today','This Week','Previous Week','This Month','This Year'];
export const CHART_DATA = {
  trends: {
    'Today': [{label:'9 AM',s:3,r:1},{label:'11 AM',s:5,r:2},{label:'1 PM',s:4,r:1},{label:'3 PM',s:7,r:3},{label:'5 PM',s:5,r:2}],
    'This Week': [{label:'Mon',s:20,r:7},{label:'Tue',s:16,r:6},{label:'Wed',s:24,r:10},{label:'Thu',s:27,r:12},{label:'Fri',s:22,r:8},{label:'Sat',s:17,r:12},{label:'Sun',s:17,r:9}],
    'Previous Week': [{label:'Mon',s:15,r:5},{label:'Tue',s:19,r:7},{label:'Wed',s:21,r:8},{label:'Thu',s:18,r:6},{label:'Fri',s:24,r:9},{label:'Sat',s:13,r:5},{label:'Sun',s:11,r:4}],
    'This Month': [{label:'Week 1',s:42,r:16},{label:'Week 2',s:55,r:21},{label:'Week 3',s:63,r:27},{label:'Week 4',s:48,r:20}],
    'This Year': [{label:'Jan',s:31,r:12},{label:'Feb',s:28,r:10},{label:'Mar',s:39,r:15},{label:'Apr',s:35,r:14},{label:'May',s:44,r:19},{label:'Jun',s:41,r:17},{label:'Jul',s:49,r:20},{label:'Aug',s:52,r:23},{label:'Sep',s:46,r:18},{label:'Oct',s:58,r:25}]
  },
  reasons: {
    'Today':[12,8,5,3,2], 'This Week':[32,25,18,14,11], 'Previous Week':[29,21,20,17,13],
    'This Month':[34,24,17,15,10], 'This Year':[30,23,19,16,12]
  },
  plans: {
    'Today':[28,32,26,14], 'This Week':[28,32,26,14], 'Previous Week':[24,35,25,16],
    'This Month':[26,31,27,16], 'This Year':[25,33,27,15]
  }
};


// Backwards-compatible exports used by the existing useSuspendedTenants.js hook.
// Keep these exports while the Suspended Tenants page is running independently.
export const DEMO_TODAY = '2026-10-23';
export const PLAN_LIST = PLANS;
export const PLAN_COLORS = {
  Starter: '#F59E0B',
  Professional: '#0758F9',
  Business: '#079447',
  Enterprise: '#7909E8',
};
export const REASON_COLORS = {
  'Payment Overdue': '#0758F9',
  'Terms Violation': '#079447',
  'Security Issue': '#7909E8',
  'Inactive Account': '#E8172D',
  'Admin Action': '#F59E0B',
};
export const REVIEW = {
  PENDING: 'Pending Review',
  INVESTIGATING: 'Under Review',
  ELIGIBLE: 'Eligible for Reactivation',
  CRITICAL: 'Critical',
};
export const REVIEW_LIST = Object.values(REVIEW);
export const REVIEW_TONE = {
  [REVIEW.PENDING]: 'orange',
  [REVIEW.INVESTIGATING]: 'purple',
  [REVIEW.ELIGIBLE]: 'green',
  [REVIEW.CRITICAL]: 'red',
};
export const DEFAULT_POLICIES = {
  graceDays: 14,
  reminders: 2,
  retentionDays: 90,
  autoSuspendOverdue: true,
  notifyAdmin: true,
};

// Adapt the current page's tenant records to the legacy hook's expected shape.
export const SEED_TENANTS = TENANTS.map((tenant) => ({
  ...tenant,
  code: tenant.id,
  review: tenant.status,
  mrr: tenant.price,
  overdue: tenant.outstanding,
  detail: tenant.notes,
  note: tenant.notes,
  history: (tenant.history || []).map((item) => ({
    date: item.date,
    text: [item.title, item.detail].filter(Boolean).join(' — '),
    by: item.by || 'System',
  })),
}));

export const SEED_ACTIVITY = TENANTS.slice(0, 8).map((tenant, index) => ({
  id: `seed-activity-${tenant.id}`,
  kind: index % 3 === 0 ? 'suspended' : index % 3 === 1 ? 'flagged' : 'reviewed',
  company: tenant.name,
  text: `${tenant.status}: ${tenant.reason}`,
  at: tenant.suspendedDate,
}));