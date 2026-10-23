// ======================================================
// MEGSI SI - PLATFORM USERS MOCK DATA
// 500 MOCK USERS + COMPANIES + ACTIVITY LOGS
// ======================================================

export const ROLES = [
  'Platform Super Admin',
  'Platform Admin',
  'Support Admin',
  'Billing Admin',
  'Platform Analyst',
  'Read-only Auditor',
];

export const USER_STATUSES = [
  'Active',
  'Pending',
  'Suspended',
];

export const COMPANY_COUNT = 120;

export const CURRENT_USER = {
  id: 1,
  name: 'David Miller',
  email: 'david.miller@megsi.com',
  role: 'Platform Super Admin',
};

export const MANAGE_ROLES = [
  'Platform Super Admin',
  'Platform Admin',
];

export const ROLE_GROUPS = [
  {
    name: 'Platform Admin',
    roles: ['Platform Super Admin', 'Platform Admin'],
    color: '#315CF6',
  },
  {
    name: 'Support Admin',
    roles: ['Support Admin'],
    color: '#13A89E',
  },
  {
    name: 'Billing Admin',
    roles: ['Billing Admin'],
    color: '#F59E0B',
  },
  {
    name: 'Analyst',
    roles: ['Platform Analyst'],
    color: '#8B5CF6',
  },
  {
    name: 'Auditor',
    roles: ['Read-only Auditor'],
    color: '#EC4899',
  },
];

// ======================================================
// DATE HELPERS
// ======================================================

export function demoNow() {
  return new Date();
}

export function toLocalIso(date = new Date()) {
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000,
  );

  return localDate.toISOString().slice(0, 19);
}

function randomDate(daysBack = 180) {
  const now = new Date();

  const past = new Date(
    now.getTime() -
      Math.random() * daysBack * 24 * 60 * 60 * 1000,
  );

  return past;
}

function randomLogin() {
  // Some users have never logged in.
  if (Math.random() < 0.08) {
    return null;
  }

  return toLocalIso(randomDate(90));
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

// ======================================================
// MOCK NAMES
// ======================================================

const FIRST_NAMES = [
  'David', 'Emily', 'James', 'Priya', 'Oliver',
  'Sophie', 'Daniel', 'Aarav', 'Ananya', 'Rahul',
  'Sneha', 'Arjun', 'Kavya', 'Vikram', 'Meera',
  'Rohan', 'Divya', 'Karthik', 'Nisha', 'Aditya',
  'Isabella', 'William', 'Charlotte', 'Benjamin',
  'Amelia', 'Lucas', 'Mia', 'Henry', 'Ava',
  'Ethan', 'Harper', 'Noah', 'Ella', 'Liam',
  'Grace', 'Mason', 'Chloe', 'Logan', 'Zoe',
  'Santhosh', 'Midhuna', 'Keerthana', 'Sanjay',
  'Swetha', 'Manoj', 'Pooja', 'Deepak', 'Monisha',
  'Ashwin', 'Janani', 'Surya', 'Abinaya', 'Gokul',
];

const LAST_NAMES = [
  'Miller', 'Carter', 'Wilson', 'Sharma', 'Brown',
  'Taylor', 'Lewis', 'Patel', 'Kumar', 'Singh',
  'Anderson', 'Thomas', 'Jackson', 'White', 'Harris',
  'Martin', 'Thompson', 'Garcia', 'Clark', 'Rodriguez',
  'Robinson', 'Lewis', 'Walker', 'Hall', 'Allen',
  'Young', 'King', 'Wright', 'Scott', 'Green',
  'Adams', 'Baker', 'Nelson', 'Hill', 'Ramachandran',
  'Krishnan', 'Rajan', 'Iyer', 'Reddy', 'Menon',
  'Pillai', 'Shankar', 'Prakash', 'Joseph', 'Rao',
];

// ======================================================
// MOCK COMPANIES
// ======================================================

const COMPANY_NAMES = [
  'Chennai Security Services',
  'Bangalore Protection Group',
  'Mumbai Guard Solutions',
  'Delhi Secure Systems',
  'Hyderabad Safety Network',
  'Kochi Security Partners',
  'Coimbatore Protection Services',
  'Pune Corporate Security',
  'Kolkata Safety Solutions',
  'Madurai Security Associates',
  'Trichy Guard Services',
  'Salem Protection Network',
  'Tiruppur Safety Group',
  'Vellore Secure Solutions',
  'Erode Security Services',
  'Mysore Protection Group',
  'Noida Security Partners',
  'Gurgaon Guard Solutions',
  'Jaipur Secure Systems',
  'Ahmedabad Safety Network',
];

export const MOCK_COMPANIES = Array.from(
  { length: COMPANY_COUNT },
  (_, index) => ({
    id: index + 1,
    name:
      COMPANY_NAMES[index % COMPANY_NAMES.length] +
      (index >= COMPANY_NAMES.length
        ? ` ${Math.floor(index / COMPANY_NAMES.length) + 1}`
        : ''),
    code: `MEGSI-${String(index + 1).padStart(4, '0')}`,
    status: Math.random() < 0.93 ? 'Active' : 'Inactive',
    createdAt: toLocalIso(randomDate(500)).slice(0, 10),
  }),
);

// ======================================================
// USER GENERATOR
// ======================================================

function generateUser(id) {
  const firstName = randomItem(FIRST_NAMES);
  const lastName = randomItem(LAST_NAMES);

  const name = `${firstName} ${lastName}`;

  const email =
    `${firstName}.${lastName}${id}@megsi-demo.com`.toLowerCase();

  const role =
    id === 1
      ? 'Platform Super Admin'
      : randomItem(ROLES);

  let status;

  const statusChance = Math.random();

  if (statusChance < 0.78) {
    status = 'Active';
  } else if (statusChance < 0.92) {
    status = 'Pending';
  } else {
    status = 'Suspended';
  }

  const allCompanies = Math.random() < 0.15;

  const companies = allCompanies
    ? null
    : Math.floor(Math.random() * 15) + 1;

  return {
    id,
    name,
    email,
    role,
    companies,
    lastLogin: status === 'Pending' ? null : randomLogin(),
    status,
    mfa: Math.random() < 0.72,
    created: toLocalIso(randomDate(365)).slice(0, 10),
  };
}

// ======================================================
// PLATFORM USERS
// 500 MOCK USER RECORDS
// ======================================================

const FIXED_USERS = [
  {
    id: 1,
    name: 'David Miller',
    email: 'david.miller@megsi.com',
    role: 'Platform Super Admin',
    companies: null,
    lastLogin: toLocalIso(randomDate(2)),
    status: 'Active',
    mfa: true,
    created: '2025-01-10',
  },
  {
    id: 2,
    name: 'Emily Carter',
    email: 'emily.carter@megsi.com',
    role: 'Platform Admin',
    companies: 12,
    lastLogin: toLocalIso(randomDate(1)),
    status: 'Active',
    mfa: true,
    created: '2025-02-14',
  },
  {
    id: 3,
    name: 'James Wilson',
    email: 'james.wilson@megsi.com',
    role: 'Support Admin',
    companies: 8,
    lastLogin: toLocalIso(randomDate(4)),
    status: 'Active',
    mfa: true,
    created: '2025-03-20',
  },
  {
    id: 4,
    name: 'Priya Sharma',
    email: 'priya.sharma@megsi.com',
    role: 'Billing Admin',
    companies: 15,
    lastLogin: toLocalIso(randomDate(3)),
    status: 'Active',
    mfa: true,
    created: '2025-04-05',
  },
  {
    id: 5,
    name: 'Oliver Brown',
    email: 'oliver.brown@megsi.com',
    role: 'Platform Analyst',
    companies: 6,
    lastLogin: null,
    status: 'Pending',
    mfa: false,
    created: '2025-05-12',
  },
  {
    id: 6,
    name: 'Sophie Taylor',
    email: 'sophie.taylor@megsi.com',
    role: 'Read-only Auditor',
    companies: 4,
    lastLogin: toLocalIso(randomDate(30)),
    status: 'Suspended',
    mfa: false,
    created: '2025-06-18',
  },
  {
    id: 7,
    name: 'Daniel Lewis',
    email: 'daniel.lewis@megsi.com',
    role: 'Platform Admin',
    companies: 10,
    lastLogin: toLocalIso(randomDate(2)),
    status: 'Active',
    mfa: true,
    created: '2025-07-01',
  },
];

export const PLATFORM_USERS = [
  ...FIXED_USERS,
  ...Array.from(
    { length: 493 },
    (_, index) => generateUser(index + 8),
  ),
];

// ======================================================
// KPI TREND DATA
// ======================================================

export const KPI_TRENDS = {
  total: {
    pct: 12,
    tone: 'up',
  },
  active: {
    pct: 8,
    tone: 'up',
  },
  pending: {
    pct: 4,
    tone: 'down',
  },
  suspended: {
    pct: 2,
    tone: 'down',
  },
};

// ======================================================
// ACCESS REVIEW
// ======================================================

export const ACCESS_REVIEW = {
  date: toLocalIso(randomDate(30)).slice(0, 10),
  status: 'Completed',
  reviewer: 'David Miller',
  totalReviewed: 450,
  issuesFound: 8,
};

// ======================================================
// ACTIVITY GENERATOR
// ======================================================

const ACTIVITY_TYPES = [
  'add',
  'role',
  'edit',
  'accept',
  'activate',
  'review',
  'invite',
  'suspend',
  'remove',
];

const ACTIVITY_TITLES = {
  add: 'New platform user added',
  role: 'User role updated',
  edit: 'Platform user updated',
  accept: 'Invitation accepted',
  activate: 'User account activated',
  review: 'Access review completed',
  invite: 'Invitation sent',
  suspend: 'User account suspended',
  remove: 'Platform user removed',
};

function generateActivity(id) {
  const user = randomItem(PLATFORM_USERS);
  const type = randomItem(ACTIVITY_TYPES);

  return {
    id,
    type,
    title: ACTIVITY_TITLES[type],
    detail: `${user.name} · ${user.role}`,
    ts: toLocalIso(randomDate(180)),
  };
}

export const ACTIVITY = Array.from(
  { length: 150 },
  (_, index) => generateActivity(index + 1),
).sort((a, b) => b.ts.localeCompare(a.ts));

// ======================================================
// ADDITIONAL DASHBOARD SUMMARY
// ======================================================

export const MOCK_DASHBOARD_SUMMARY = {
  totalUsers: PLATFORM_USERS.length,

  activeUsers: PLATFORM_USERS.filter(
    (user) => user.status === 'Active',
  ).length,

  pendingUsers: PLATFORM_USERS.filter(
    (user) => user.status === 'Pending',
  ).length,

  suspendedUsers: PLATFORM_USERS.filter(
    (user) => user.status === 'Suspended',
  ).length,

  mfaEnabledUsers: PLATFORM_USERS.filter(
    (user) => user.mfa,
  ).length,

  totalCompanies: MOCK_COMPANIES.length,

  totalActivities: ACTIVITY.length,
};