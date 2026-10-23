import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
Cell,
Pie,
PieChart,
ResponsiveContainer,
Tooltip
} from 'recharts';
import {
AlertTriangle,
ArrowDown,
ArrowUp,
Ban,
CalendarCheck,
Check,
ChevronDown,
ChevronLeft,
ChevronRight,
Download,
Eye,
Filter,
Lock,
Mail,
MoreHorizontal,
Pencil,
Plus,
Search,
Send,
ShieldAlert,
ShieldCheck,
UserCheck,
UserCog,
UserMinus,
Users,
X
} from 'lucide-react';
import DateRangeMenu from '../components/DateRangeMenu.jsx';
import { Avatar, DetailPanel, Menu } from '../components/Common.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import {
ACCESS_REVIEW,
ACTIVITY,
COMPANY_COUNT,
CURRENT_USER,
KPI_TRENDS,
MANAGE_ROLES,
PLATFORM_USERS,
ROLES,
ROLE_GROUPS,
USER_STATUSES,
demoNow,
toLocalIso
} from '../data/platformUsersData.js';
import './companies.css';
import './platformUsers.css';

const ROLE_DISTRIBUTION = [
{ name: 'Platform Admin', value: 42, color: '#4F46E5' },
{ name: 'Support Admin', value: 56, color: '#0EA5E9' },
{ name: 'Billing Admin', value: 38, color: '#10B981' },
{ name: 'Analyst', value: 71, color: '#F59E0B' },
{ name: 'Auditor', value: 41, color: '#8B5CF6' }
];

const ACTIVITY_FALLBACK = [
{
id: 1,
name: 'Emily Carter',
action: 'added a new user',
target: '[john.smith@megsi.com](mailto:john.smith@megsi.com)',
time: '2 hours ago',
icon: UserCheck
},
{
id: 2,
name: 'James Wilson',
action: 'updated a role to',
target: 'Support Admin',
time: '5 hours ago',
icon: UserCog
},
{
id: 3,
name: 'Oliver Brown',
action: 'accepted invitation',
target: '',
time: '1 day ago',
icon: Check
},
{
id: 4,
name: 'Sophie Taylor',
action: 'account suspended due to policy violation',
target: '',
time: '2 days ago',
icon: Ban
}
];

const STATUS_COLORS = {
Active: 'active',
Pending: 'pending',
Suspended: 'suspended',
Inactive: 'inactive'
};

const normalize = (value) => String(value ?? '').toLowerCase().trim();

function getUserStatus(user) {
const status = user.status ?? user.accountStatus ?? 'Active';
const value = String(status).toLowerCase();

if (value.includes('suspend')) return 'Suspended';
if (value.includes('pending') || value.includes('invitation')) return 'Pending';
if (value.includes('inactive')) return 'Inactive';

return 'Active';
}

function getUserRole(user) {
return user.role ?? user.roleName ?? user.userRole ?? 'Platform Admin';
}

function getUserEmail(user) {
return user.email ?? user.emailAddress ?? '';
}

function getUserName(user) {
return user.name ?? user.fullName ?? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
}

function getCompanyAssignment(user) {
if (user.assignedCompaniesLabel) return user.assignedCompaniesLabel;
if (user.assignedCompanies === 'All Companies' || user.companyAccess === 'All Companies') {
return 'All Companies';
}

const count =
user.companyCount ??
user.assignedCompanyCount ??
(Array.isArray(user.assignedCompanies) ? user.assignedCompanies.length : null);

if (count === null || count === undefined) return 'All Companies';
return `${count} Companies`;
}

function getLastLogin(user) {
return user.lastLogin ?? user.lastLoginAt ?? user.last_login ?? '—';
}

function getInitials(name = '') {
return name
.split(/\s+/)
.filter(Boolean)
.slice(0, 2)
.map((part) => part[0])
.join('')
.toUpperCase();
}

function MetricCard({ title, value, change, icon: Icon, trend, onClick }) {
const isNegative = trend === 'down';

return (
<button
type="button"
className="pu-metric-card"
onClick={onClick}
aria-label={`${title}: ${value}. Open details`}
> <div className="pu-metric-top"> <span className="pu-metric-title">{title}</span> <span className="pu-metric-icon"> <Icon size={19} strokeWidth={1.8} /> </span> </div>


  <div className="pu-metric-bottom">
    <strong className="pu-metric-value">{value}</strong>
    <span className={`pu-metric-change ${isNegative ? 'negative' : 'positive'}`}>
      {isNegative ? <ArrowDown size={13} /> : <ArrowUp size={13} />}
      {change}
    </span>
  </div>

  <span className="pu-metric-caption">compared with last month</span>
</button>

);
}

function StatusBadge({ status }) {
const key = STATUS_COLORS[status] ?? 'inactive';

return (
<span className={`pu-status-badge ${key}`}> <span className="pu-status-dot" />
{status} </span>
);
}

function UserAvatar({ user }) {
if (user.avatarUrl || user.avatar) {
return (
<img
className="pu-user-avatar"
src={user.avatarUrl ?? user.avatar}
alt=""
/>
);
}

return ( <span className="pu-user-avatar pu-avatar-placeholder">
{getInitials(getUserName(user))} </span>
);
}

function EmptyState({ onClear }) {
return ( <div className="pu-empty-state"> <Search size={26} /> <strong>No users found</strong> <span>Try changing your search or filters.</span> <button type="button" className="pu-text-button" onClick={onClear}>
Clear filters </button> </div>
);
}

export default function PlatformUsers() {
const { fmtDate } = useI18n();

const [users, setUsers] = useState(() =>
Array.isArray(PLATFORM_USERS) ? PLATFORM_USERS : []
);
const [search, setSearch] = useState('');
const [roleFilter, setRoleFilter] = useState('All Roles');
const [statusFilter, setStatusFilter] = useState('All Statuses');
const [showMoreFilters, setShowMoreFilters] = useState(false);
const [companyFilter, setCompanyFilter] = useState('All Companies');
const [dateRange, setDateRange] = useState(null);
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(7);
const [selectedUser, setSelectedUser] = useState(null);
const [detail, setDetail] = useState(null);
const [menuUser, setMenuUser] = useState(null);
const [showAddUser, setShowAddUser] = useState(false);
const [showExportMenu, setShowExportMenu] = useState(false);
const [showDateRange, setShowDateRange] = useState(false);
const [language, setLanguage] = useState('en');
const [showNotifications, setShowNotifications] = useState(false);
const [showHelp, setShowHelp] = useState(false);
const [showGlobalSearch, setShowGlobalSearch] = useState(false);
const [toast, setToast] = useState('');
const [newUser, setNewUser] = useState({
name: '',
email: '',
role: 'Platform Admin',
status: 'Pending'
});

const searchRef = useRef(null);
const menuRef = useRef(null);

useEffect(() => {
const onKeyDown = (event) => {
if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
event.preventDefault();
setShowGlobalSearch(true);
setTimeout(() => searchRef.current?.focus(), 0);
}


  if (event.key === 'Escape') {
    setShowGlobalSearch(false);
    setShowNotifications(false);
    setShowHelp(false);
    setShowAddUser(false);
    setDetail(null);
    setSelectedUser(null);
    setMenuUser(null);
  }
};

window.addEventListener('keydown', onKeyDown);
return () => window.removeEventListener('keydown', onKeyDown);

}, []);

useEffect(() => {
if (!toast) return undefined;
const timeout = window.setTimeout(() => setToast(''), 3000);
return () => window.clearTimeout(timeout);
}, [toast]);

const activeCount = users.filter((user) => getUserStatus(user) === 'Active').length;
const pendingCount = users.filter((user) => getUserStatus(user) === 'Pending').length;
const suspendedCount = users.filter((user) => getUserStatus(user) === 'Suspended').length;

const metricItems = [
{
id: 'total',
title: 'Total Platform Users',
value: 248,
change: '8%',
icon: Users,
trend: 'up',
description: 'All platform user accounts, including active, pending and suspended users.'
},
{
id: 'active',
title: 'Active Users',
value: 221,
change: '8%',
icon: UserCheck,
trend: 'up',
description: 'Users who currently have an active platform account.'
},
{
id: 'pending',
title: 'Pending Invitations',
value: 14,
change: '2%',
icon: Mail,
trend: 'up',
description: 'Users who have been invited but have not completed account activation.'
},
{
id: 'suspended',
title: 'Suspended Accounts',
value: 13,
change: '4%',
icon: Ban,
trend: 'up',
description: 'Accounts temporarily restricted from accessing the platform.'
}
];

const filteredUsers = useMemo(() => {
const query = normalize(search);


return users.filter((user) => {
  const name = normalize(getUserName(user));
  const email = normalize(getUserEmail(user));
  const role = getUserRole(user);
  const status = getUserStatus(user);
  const company = getCompanyAssignment(user);

  const matchesSearch =
    !query || name.includes(query) || email.includes(query) || normalize(role).includes(query);

  const matchesRole = roleFilter === 'All Roles' || role === roleFilter;
  const matchesStatus = statusFilter === 'All Statuses' || status === statusFilter;
  const matchesCompany =
    companyFilter === 'All Companies' ||
    (companyFilter === 'All Companies Access'
      ? company === 'All Companies'
      : company !== 'All Companies');

  return matchesSearch && matchesRole && matchesStatus && matchesCompany;
});


}, [users, search, roleFilter, statusFilter, companyFilter]);

const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
const safePage = Math.min(page, totalPages);

const visibleUsers = useMemo(() => {
const start = (safePage - 1) * pageSize;
return filteredUsers.slice(start, start + pageSize);
}, [filteredUsers, safePage, pageSize]);

useEffect(() => {
setPage(1);
}, [search, roleFilter, statusFilter, companyFilter, pageSize]);

const clearFilters = () => {
setSearch('');
setRoleFilter('All Roles');
setStatusFilter('All Statuses');
setCompanyFilter('All Companies');
setShowMoreFilters(false);
setPage(1);
};

const showMetricDetails = (metric) => {
const rows = [
['Metric', metric.title],
['Current count', String(metric.value)],
['Monthly change', `+${metric.change}`],
['Period', '01 Oct 2026 – 31 Oct 2026'],
['Description', metric.description]
];


setDetail({
  title: metric.title,
  subtitle: 'Platform user overview',
  rows
});


};

const showUserDetails = (user) => {
setSelectedUser(user);
setDetail({
title: getUserName(user),
subtitle: getUserRole(user),
rows: [
['Email', getUserEmail(user)],
['Role', getUserRole(user)],
['Assigned companies', getCompanyAssignment(user)],
['Last login', getLastLogin(user)],
['Status', getUserStatus(user)],
['MFA', user.mfaEnabled === false ? 'Not enabled' : 'Enabled']
]
});
};

const handleAddUser = (event) => {
event.preventDefault();


if (!newUser.name.trim() || !newUser.email.trim()) {
  setToast('Please enter the user name and email address.');
  return;
}

const exists = users.some(
  (user) => normalize(getUserEmail(user)) === normalize(newUser.email)
);

if (exists) {
  setToast('A user with this email already exists.');
  return;
}

const createdUser = {
  id: `new-${Date.now()}`,
  name: newUser.name.trim(),
  email: newUser.email.trim(),
  role: newUser.role,
  status: newUser.status,
  assignedCompanies: 'All Companies',
  lastLogin: 'Never',
  mfaEnabled: false
};

setUsers((previous) => [createdUser, ...previous]);
setShowAddUser(false);
setNewUser({
  name: '',
  email: '',
  role: 'Platform Admin',
  status: 'Pending'
});
setToast('Platform user added successfully.');


};

const updateUserStatus = (user, nextStatus) => {
setUsers((previous) =>
previous.map((item) =>
item.id === user.id || item.email === user.email
? { ...item, status: nextStatus }
: item
)
);


setMenuUser(null);
setDetail(null);
setToast(`${getUserName(user)} status updated to ${nextStatus}.`);

};

const exportUsers = (format = 'csv') => {
const headers = ['Name', 'Email', 'Role', 'Assigned Companies', 'Last Login', 'Status'];
const rows = filteredUsers.map((user) => [
getUserName(user),
getUserEmail(user),
getUserRole(user),
getCompanyAssignment(user),
getLastLogin(user),
getUserStatus(user)
]);


const csv = [headers, ...rows]
  .map((row) =>
    row
      .map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`)
      .join(',')
  )
  .join('\r\n');

const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = `platform-users.${format === 'excel' ? 'csv' : format}`;
document.body.appendChild(link);
link.click();
link.remove();
URL.revokeObjectURL(url);

setShowExportMenu(false);
setToast(`Exported ${filteredUsers.length} platform users.`);


};

const roleOptions = useMemo(() => {
const roles = Array.isArray(ROLES) ? ROLES : [];
const names = roles.map((role) =>
typeof role === 'string' ? role : role.name ?? role.label
);
const all = [...new Set([...names, ...users.map(getUserRole)].filter(Boolean))];
return all;
}, [users]);

const dateLabel = '01 Oct 2026 – 31 Oct 2026';

return ( <div className="platform-users-page"> <div className="pu-page-header"> <div className="pu-page-heading"> <div className="pu-breadcrumb"> <span>Users & Access</span> <ChevronRight size={14} /> <span className="current">Platform Users</span> </div> <h1>Platform Users</h1> <p>Manage platform accounts, roles, permissions and access.</p> </div>


    <div className="pu-header-controls">
      <button
        type="button"
        className="pu-date-control"
        onClick={() => setShowDateRange((value) => !value)}
      >
        <CalendarCheck size={16} />
        <span>{dateRange?.label ?? dateLabel}</span>
        <ChevronDown size={15} />
      </button>

      {showDateRange && (
        <div className="pu-date-menu">
          <DateRangeMenu
            value={dateRange}
            onChange={(value) => {
              setDateRange(value);
              setShowDateRange(false);
            }}
            onClose={() => setShowDateRange(false)}
          />
        </div>
      )}

      <button
        type="button"
        className="pu-header-icon-button"
        aria-label="Notifications"
        onClick={() => {
          setShowNotifications((value) => !value);
          setShowHelp(false);
        }}
      >
        <span className="pu-notification-count">12</span>
        <AlertTriangle size={18} />
      </button>

      <button
        type="button"
        className="pu-header-icon-button"
        aria-label="Help"
        onClick={() => {
          setShowHelp((value) => !value);
          setShowNotifications(false);
        }}
      >
        <span className="pu-help-mark">?</span>
      </button>

      <label className="pu-language-control">
        <span className="pu-flag">🇬🇧</span>
        <select
          aria-label="Select language"
          value={language}
          onChange={(event) => {
            setLanguage(event.target.value);
            setToast(
              event.target.value === 'en'
                ? 'Language set to English.'
                : 'Language selection saved. Full translations require matching i18n resources.'
            );
          }}
        >
          <option value="en">English</option>
          <option value="ta">தமிழ்</option>
          <option value="hi">हिन्दी</option>
        </select>
        <ChevronDown size={13} />
      </label>

      {showNotifications && (
        <div className="pu-floating-panel pu-notifications-panel">
          <div className="pu-floating-heading">
            <strong>Notifications</strong>
            <button type="button" onClick={() => setShowNotifications(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="pu-notification-item">
            <span className="pu-notification-indicator" />
            <div>
              <strong>Access review completed</strong>
              <p>The latest platform access review is complete.</p>
              <small>2 hours ago</small>
            </div>
          </div>
          <div className="pu-notification-item">
            <span className="pu-notification-indicator" />
            <div>
              <strong>Pending invitations</strong>
              <p>14 users have not accepted their invitations.</p>
              <small>Today</small>
            </div>
          </div>
        </div>
      )}

      {showHelp && (
        <div className="pu-floating-panel pu-help-panel">
          <div className="pu-floating-heading">
            <strong>Platform Users Help</strong>
            <button type="button" onClick={() => setShowHelp(false)}>
              <X size={16} />
            </button>
          </div>
          <p>Use search and filters to locate platform users.</p>
          <p>Open a user record to review account details.</p>
          <p>Use Export to download the currently filtered directory.</p>
        </div>
      )}
    </div>
  </div>

  <div className="pu-metrics-grid">
    {metricItems.map((metric) => (
      <MetricCard
        key={metric.id}
        {...metric}
        onClick={() => showMetricDetails(metric)}
      />
    ))}
  </div>

  <section className="pu-directory-card">
    <div className="pu-directory-heading">
      <div>
        <h2>Platform User Directory</h2>
        <p>View and manage platform-level user accounts.</p>
      </div>

      <div className="pu-directory-actions">
        <button
          type="button"
          className="pu-secondary-button"
          onClick={() => setShowExportMenu((value) => !value)}
        >
          <Download size={16} />
          Export
          <ChevronDown size={14} />
        </button>

        {showExportMenu && (
          <div className="pu-export-menu">
            <button type="button" onClick={() => exportUsers('csv')}>
              <Download size={15} />
              Export CSV
            </button>
            <button type="button" onClick={() => exportUsers('excel')}>
              <Download size={15} />
              Export spreadsheet CSV
            </button>
          </div>
        )}

        <button
          type="button"
          className="pu-primary-button"
          onClick={() => setShowAddUser(true)}
        >
          <Plus size={17} />
          Add Platform User
        </button>
      </div>
    </div>

    <div className="pu-filter-toolbar">
      <label className="pu-search-field">
        <Search size={17} />
        <input
          ref={searchRef}
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search users..."
          aria-label="Search platform users"
        />
        <kbd>Ctrl K</kbd>
      </label>

      <label className="pu-select-filter">
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          aria-label="Filter by role"
        >
          <option>All Roles</option>
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <ChevronDown size={15} />
      </label>

      <label className="pu-select-filter">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter by status"
        >
          <option>All Statuses</option>
          {USER_STATUSES.map((status) => {
            const label = typeof status === 'string' ? status : status.label ?? status.name;
            return (
              <option key={label} value={label}>
                {label}
              </option>
            );
          })}
          {!USER_STATUSES.includes('Inactive') && (
            <option value="Inactive">Inactive</option>
          )}
        </select>
        <ChevronDown size={15} />
      </label>

      <button
        type="button"
        className={`pu-secondary-button pu-more-filters-button ${
          showMoreFilters ? 'selected' : ''
        }`}
        onClick={() => setShowMoreFilters((value) => !value)}
      >
        <Filter size={16} />
        More Filters
        <ChevronDown size={14} />
      </button>

      <button type="button" className="pu-clear-filters-button" onClick={clearFilters}>
        Clear Filters
      </button>
    </div>

    {showMoreFilters && (
      <div className="pu-more-filters-panel">
        <label className="pu-select-filter">
          <span>Company access</span>
          <select
            value={companyFilter}
            onChange={(event) => setCompanyFilter(event.target.value)}
            aria-label="Filter by company access"
          >
            <option>All Companies</option>
            <option>All Companies Access</option>
            <option>Specific Companies</option>
          </select>
          <ChevronDown size={15} />
        </label>
        <button type="button" className="pu-text-button" onClick={clearFilters}>
          Reset all filters
        </button>
      </div>
    )}

    <div className="pu-table-meta">
      <span>
        Showing <strong>{filteredUsers.length ? (safePage - 1) * pageSize + 1 : 0}–{Math.min(safePage * pageSize, filteredUsers.length)}</strong> of{' '}
        <strong>{filteredUsers.length}</strong> users
      </span>
      <span className="pu-table-meta-right">
        <ShieldCheck size={15} />
        Platform access directory
      </span>
    </div>

    <div className="pu-table-scroll">
      <table className="pu-users-table">
        <thead>
          <tr>
            <th>
              <input type="checkbox" aria-label="Select all users on this page" />
            </th>
            <th>User</th>
            <th>Role</th>
            <th>Assigned Companies</th>
            <th>Last Login</th>
            <th>Status</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {visibleUsers.map((user, index) => {
            const status = getUserStatus(user);

            return (
              <tr key={user.id ?? getUserEmail(user) ?? index}>
                <td>
                  <input
                    type="checkbox"
                    aria-label={`Select ${getUserName(user)}`}
                  />
                </td>

                <td>
                  <button
                    type="button"
                    className="pu-user-cell"
                    onClick={() => showUserDetails(user)}
                  >
                    <UserAvatar user={user} />
                    <span className="pu-user-text">
                      <strong>{getUserName(user)}</strong>
                      <small>{getUserEmail(user)}</small>
                    </span>
                  </button>
                </td>

                <td>
                  <span className="pu-role-name">{getUserRole(user)}</span>
                </td>

                <td>
                  <span className="pu-company-assignment">
                    {getCompanyAssignment(user)}
                  </span>
                </td>

                <td>
                  <span className="pu-last-login">{getLastLogin(user)}</span>
                </td>

                <td>
                  <StatusBadge status={status} />
                </td>

                <td className="pu-row-actions-cell">
                  <div className="pu-row-actions">
                    <button
                      type="button"
                      className="pu-icon-action"
                      aria-label={`View ${getUserName(user)}`}
                      onClick={() => showUserDetails(user)}
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      type="button"
                      className="pu-icon-action"
                      aria-label={`More actions for ${getUserName(user)}`}
                      onClick={() =>
                        setMenuUser((current) =>
                          current?.id === user.id ? null : user
                        )
                      }
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  {menuUser &&
                    (menuUser.id === user.id ||
                      menuUser.email === user.email) && (
                      <div className="pu-row-menu" ref={menuRef}>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuUser(null);
                            showUserDetails(user);
                          }}
                        >
                          <Eye size={15} />
                          View details
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuUser(null);
                            setDetail({
                              title: `Edit ${getUserName(user)}`,
                              rows: [
                                ['Email', getUserEmail(user)],
                                ['Role', getUserRole(user)],
                                ['Status', getUserStatus(user)]
                              ]
                            });
                          }}
                        >
                          <Pencil size={15} />
                          Edit user
                        </button>
                        {status !== 'Suspended' ? (
                          <button
                            type="button"
                            onClick={() => updateUserStatus(user, 'Suspended')}
                          >
                            <Ban size={15} />
                            Suspend account
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => updateUserStatus(user, 'Active')}
                          >
                            <UserCheck size={15} />
                            Reactivate account
                          </button>
                        )}
                        {status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => {
                              setMenuUser(null);
                              setToast(`Invitation reminder prepared for ${getUserEmail(user)}.`);
                            }}
                          >
                            <Send size={15} />
                            Resend invitation
                          </button>
                        )}
                      </div>
                    )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {visibleUsers.length === 0 && <EmptyState onClear={clearFilters} />}
    </div>

    <div className="pu-pagination">
      <div className="pu-pagination-size">
        <span>Rows per page</span>
        <select
          value={pageSize}
          onChange={(event) => setPageSize(Number(event.target.value))}
          aria-label="Rows per page"
        >
          <option value={7}>7</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="pu-pagination-controls">
        <span>
          Page {safePage} of {totalPages}
        </span>
        <button
          type="button"
          aria-label="Previous page"
          disabled={safePage <= 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          <ChevronLeft size={17} />
        </button>
        <button
          type="button"
          aria-label="Next page"
          disabled={safePage >= totalPages}
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  </section>

  <section className="pu-analytics-grid">
    <div className="pu-analytics-card pu-activity-card">
      <div className="pu-analytics-heading">
        <div>
          <h2>Recent User Activity</h2>
          <p>Latest changes across platform accounts</p>
        </div>
        <button
          type="button"
          className="pu-view-all-button"
          onClick={() => setDetail({
            title: 'Recent User Activity',
            rows: ACTIVITY_FALLBACK.map((activity) => [
              activity.name,
              `${activity.action} ${activity.target}`.trim(),
              activity.time
            ])
          })}
        >
          View all
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="pu-activity-list">
        {(Array.isArray(ACTIVITY) && ACTIVITY.length
          ? ACTIVITY.slice(0, 4).map((item, index) => ({
              id: item.id ?? index,
              name: item.name ?? item.userName ?? ACTIVITY_FALLBACK[index]?.name ?? 'Platform user',
              action: item.action ?? item.description ?? ACTIVITY_FALLBACK[index]?.action ?? 'performed an action',
              target: item.target ?? item.details ?? '',
              time: item.time ?? item.timestamp ?? ACTIVITY_FALLBACK[index]?.time ?? '',
              icon: ACTIVITY_FALLBACK[index]?.icon ?? UserCheck
            }))
          : ACTIVITY_FALLBACK
        ).map((activity) => {
          const Icon = activity.icon;

          return (
            <div className="pu-activity-item" key={activity.id}>
              <span className="pu-activity-icon">
                <Icon size={16} />
              </span>
              <div className="pu-activity-content">
                <p>
                  <strong>{activity.name}</strong> {activity.action}{' '}
                  {activity.target && <strong>{activity.target}</strong>}
                </p>
                <span>{activity.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    <div className="pu-analytics-card pu-role-card">
      <div className="pu-analytics-heading">
        <div>
          <h2>Role Distribution</h2>
          <p>Platform users by assigned role</p>
        </div>
        <span className="pu-total-chip">248 total</span>
      </div>

      <div className="pu-role-chart-layout">
        <div className="pu-role-chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ROLE_DISTRIBUTION}
                dataKey="value"
                nameKey="name"
                innerRadius="65%"
                outerRadius="88%"
                paddingAngle={3}
                stroke="none"
                onClick={(entry) => {
                  if (entry?.name) {
                    setRoleFilter(
                      entry.name === 'Analyst'
                        ? 'Platform Analyst'
                        : entry.name === 'Auditor'
                          ? 'Read-only Auditor'
                          : entry.name
                    );
                    setPage(1);
                  }
                }}
                cursor="pointer"
              >
                {ROLE_DISTRIBUTION.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} users`, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pu-chart-center">
            <strong>248</strong>
            <span>Total users</span>
          </div>
        </div>

        <div className="pu-role-legend">
          {ROLE_DISTRIBUTION.map((role) => (
            <button
              type="button"
              className="pu-role-legend-item"
              key={role.name}
              onClick={() => {
                const roleName =
                  role.name === 'Analyst'
                    ? 'Platform Analyst'
                    : role.name === 'Auditor'
                      ? 'Read-only Auditor'
                      : role.name;
                setRoleFilter(roleName);
                setPage(1);
              }}
            >
              <span className="pu-role-legend-dot" style={{ background: role.color }} />
              <span className="pu-role-legend-name">{role.name}</span>
              <strong>{role.value}</strong>
              <small>{Math.round((role.value / 248) * 100)}%</small>
            </button>
          ))}
        </div>
      </div>
      <p className="pu-chart-hint">Select a role to filter the directory.</p>
    </div>

    <div className="pu-analytics-card pu-security-card">
      <div className="pu-analytics-heading">
        <div>
          <h2>Access Security</h2>
          <p>Platform authentication overview</p>
        </div>
        <span className="pu-security-status">
          <ShieldCheck size={14} />
          Secure
        </span>
      </div>

      <div className="pu-mfa-summary">
        <div className="pu-mfa-ring">
          <svg viewBox="0 0 100 100" role="img" aria-label="94 percent MFA enabled">
            <circle cx="50" cy="50" r="41" className="pu-mfa-ring-track" />
            <circle
              cx="50"
              cy="50"
              r="41"
              className="pu-mfa-ring-value"
              strokeDasharray={`${2 * Math.PI * 41 * 0.94} ${2 * Math.PI * 41}`}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="pu-mfa-ring-label">
            <strong>94%</strong>
            <span>MFA enabled</span>
          </div>
        </div>

        <div className="pu-mfa-details">
          <span className="pu-mfa-detail-label">Users with MFA</span>
          <strong>233 <small>/ 248</small></strong>
          <div className="pu-progress-track">
            <span style={{ width: '94%' }} />
          </div>
          <span className="pu-mfa-footnote">15 users need attention</span>
        </div>
      </div>

      <div className="pu-access-review">
        <span className="pu-access-review-icon">
          <Lock size={17} />
        </span>
        <div className="pu-access-review-copy">
          <strong>Last access review</strong>
          <span>20 Oct 2026</span>
        </div>
        <span className="pu-review-completed">
          <Check size={13} />
          Completed
        </span>
      </div>

      <button
        type="button"
        className="pu-security-footer"
        onClick={() =>
          setDetail({
            title: 'Access Security',
            rows: [
              ['MFA enabled', '94%'],
              ['Users with MFA', '233 / 248'],
              ['Users requiring attention', '15'],
              ['Last access review', '20 Oct 2026'],
              ['Review status', 'Completed']
            ]
          })
        }
      >
        View security details
        <ChevronRight size={15} />
      </button>
    </div>
  </section>

  {showAddUser && (
    <div className="pu-modal-overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget) setShowAddUser(false);
    }}>
      <section
        className="pu-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pu-add-user-title"
      >
        <div className="pu-modal-heading">
          <div>
            <h2 id="pu-add-user-title">Add Platform User</h2>
            <p>Create a new platform-level account.</p>
          </div>
          <button
            type="button"
            className="pu-icon-action"
            onClick={() => setShowAddUser(false)}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleAddUser}>
          <label className="pu-form-field">
            <span>Full name <b>*</b></span>
            <input
              value={newUser.name}
              onChange={(event) =>
                setNewUser((previous) => ({ ...previous, name: event.target.value }))
              }
              placeholder="Enter full name"
              required
            />
          </label>

          <label className="pu-form-field">
            <span>Email address <b>*</b></span>
            <input
              type="email"
              value={newUser.email}
              onChange={(event) =>
                setNewUser((previous) => ({ ...previous, email: event.target.value }))
              }
              placeholder="name@megsi.com"
              required
            />
          </label>

          <label className="pu-form-field">
            <span>Platform role</span>
            <select
              value={newUser.role}
              onChange={(event) =>
                setNewUser((previous) => ({ ...previous, role: event.target.value }))
              }
            >
              {roleOptions.map((role) => (
                <option value={role} key={role}>{role}</option>
              ))}
            </select>
          </label>

          <div className="pu-modal-actions">
            <button
              type="button"
              className="pu-secondary-button"
              onClick={() => setShowAddUser(false)}
            >
              Cancel
            </button>
            <button type="submit" className="pu-primary-button">
              <Plus size={16} />
              Create User
            </button>
          </div>
        </form>
      </section>
    </div>
  )}

  {detail && (
    <DetailPanel
      data={detail}
      onClose={() => {
        setDetail(null);
        setSelectedUser(null);
      }}
    />
  )}

  {showGlobalSearch &&
    createPortal(
      <div
        className="pu-global-search-overlay"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowGlobalSearch(false);
        }}
      >
        <div className="pu-global-search-dialog">
          <Search size={20} />
          <input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search platform users..."
            aria-label="Global user search"
          />
          <kbd>ESC</kbd>
          <button
            type="button"
            onClick={() => setShowGlobalSearch(false)}
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </div>
      </div>,
      document.body
    )}

  {toast && (
    <div className="pu-toast" role="status">
      <Check size={16} />
      {toast}
      <button type="button" onClick={() => setToast('')} aria-label="Dismiss message">
        <X size={15} />
      </button>
    </div>
  )}
</div>


);
}
