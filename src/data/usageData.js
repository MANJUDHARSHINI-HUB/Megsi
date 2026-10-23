/**
 * Demonstration-only usage metrics for the Usage & Limits page.
 * Company identity and plan/user/site configuration are reused from the
 * existing company data. Guard/storage limits and measured usage are mock data.
 */
import { COMPANY_ROWS, PLAN_INFO } from './companiesData.js';

export const USAGE_DEMO_MONTH = '2026-10';
export const USAGE_DEMO_MONTH_LABEL = 'October 2026';

// Illustrative guard/storage limits. Enterprise user/site limits are unlimited
// in the existing plan config; the finite display caps below are demo-only.
export const DEMO_PLAN_LIMITS = {
  Starter: { guards: 50, storageGB: 50, enterpriseUsersDisplay: 1000, enterpriseSitesDisplay: 200 },
  Professional: { guards: 200, storageGB: 200, enterpriseUsersDisplay: 1000, enterpriseSitesDisplay: 200 },
  Business: { guards: 500, storageGB: 500, enterpriseUsersDisplay: 1000, enterpriseSitesDisplay: 200 },
  Enterprise: { guards: 4000, storageGB: 1000, enterpriseUsersDisplay: 1000, enterpriseSitesDisplay: 200 },
};

const distributeTotal = (total, weights) => {
  const sum = weights.reduce((acc, value) => acc + value, 0) || 1;
  const values = weights.map((weight) => Math.floor((total * weight) / sum));
  let remainder = total - values.reduce((acc, value) => acc + value, 0);
  const order = weights.map((weight, index) => ({ weight, index }))
    .sort((a, b) => b.weight - a.weight || a.index - b.index);
  for (let i = 0; remainder > 0; i += 1, remainder -= 1) values[order[i % order.length].index] += 1;
  return values;
};

const usersWeights = COMPANY_ROWS.map((row, i) => Math.max(1, row.users + row.sites * 2 + ((i * 17) % 31)));
const guardWeights = COMPANY_ROWS.map((row, i) => Math.max(1, row.users * 2 + ((i * 23) % 97)));
const siteWeights = COMPANY_ROWS.map((row, i) => Math.max(1, row.sites + ((i * 7) % 13)));
const storageWeights = COMPANY_ROWS.map((row, i) => Math.max(1, row.users + ((i * 11) % 43)));
const usedUsers = distributeTotal(3842, usersWeights);
const usedGuards = distributeTotal(24680, guardWeights);
const usedSites = distributeTotal(1245, siteWeights);
const usedStorage = distributeTotal(855, storageWeights);

const resource = (used, limit) => ({
  used,
  limit,
  // Keep the actual percentage for reporting; UI bars should cap width at 100%.
  percentage: limit > 0 ? Math.round((used / limit) * 100) : 0,
});

export const TENANT_USAGE = COMPANY_ROWS.map((company, index) => {
  const plan = company.plan;
  const planLimits = PLAN_INFO[plan] || { users: 100, sites: 20 };
  const demoLimits = DEMO_PLAN_LIMITS[plan] || DEMO_PLAN_LIMITS.Starter;
  const userLimit = planLimits.users ?? demoLimits.enterpriseUsersDisplay;
  const siteLimit = planLimits.sites ?? demoLimits.enterpriseSitesDisplay;

  // Reference distribution: 3 critical + 18 near-limit + 35 normal tenants.
  // This overall score is a separate demo classification from the KPI's
  // resource-specific threshold count, so those two summary definitions differ.
  let overallUsagePct;
  let status;
  if (index < 3) {
    overallUsagePct = [96, 93, 90][index];
    status = 'Critical';
  } else if (index < 21) {
    overallUsagePct = 85 + ((index * 3) % 6);
    status = 'Near Limit';
  } else {
    overallUsagePct = 42 + ((index * 7) % 38);
    status = 'Normal';
  }

  const users = resource(usedUsers[index], userLimit);
  const guards = resource(usedGuards[index], demoLimits.guards);
  const sites = resource(usedSites[index], siteLimit);
  const storage = resource(usedStorage[index], demoLimits.storageGB);
  const resources = { users, guards, sites, storage };
  // A curated demo alert flag preserves the reference KPI's count of 8; it is
  // intentionally distinct from the donut's overall-usage classification.
  const resourceNearLimit = index < 8;

  return {
    id: company.id,
    companyId: company.id,
    code: company.code,
    companyName: company.name,
    plan,
    companyStatus: company.status,
    users,
    guards,
    sites,
    storage,
    resources,
    overallUsagePct,
    status,
    resourceNearLimit,
    // Preserve the original company object for existing detail-panel patterns.
    company,
  };
});

export const USAGE_SUMMARY = {
  totalTenants: COMPANY_ROWS.length,
  totalUsers: TENANT_USAGE.reduce((sum, tenant) => sum + tenant.users.used, 0),
  totalGuards: TENANT_USAGE.reduce((sum, tenant) => sum + tenant.guards.used, 0),
  totalSites: TENANT_USAGE.reduce((sum, tenant) => sum + tenant.sites.used, 0),
  totalStorageGB: TENANT_USAGE.reduce((sum, tenant) => sum + tenant.storage.used, 0),
  // Resource-specific KPI threshold; separate from the overall-status donut.
  nearLimit: 8,
  limitExceeded: TENANT_USAGE.filter((tenant) => tenant.status === 'Critical').length,
  normalUsage: TENANT_USAGE.filter((tenant) => tenant.status === 'Normal').length,
  overallNearLimit: TENANT_USAGE.filter((tenant) => tenant.status === 'Near Limit').length,
};

// Values shown in the reference chart are platform-wide demonstration limits,
// not a sum of each tenant's configured plan limits.
export const RESOURCE_OVERVIEW = [
  { resource: 'Users', currentUsage: 3842, availableLimit: 5000 },
  { resource: 'Guards', currentUsage: 24680, availableLimit: 30000 },
  { resource: 'Sites', currentUsage: 1245, availableLimit: 2000 },
  { resource: 'Storage (GB)', currentUsage: 855, availableLimit: 1500 },
];

export const TENANT_USAGE_DISTRIBUTION = [
  { key: 'normal', status: 'Normal', label: 'Normal Usage', tenants: 35, color: '#16a765' },
  { key: 'near', status: 'Near Limit', label: 'Near Limit', tenants: 18, color: '#f79009' },
  { key: 'critical', status: 'Critical', label: 'Limit Reached', tenants: 3, color: '#f04452' },
].map((item) => ({
  ...item,
  percentage: Math.round((item.tenants / COMPANY_ROWS.length) * 100),
}));

export const USAGE_ALERTS = [
  { id: 'alert-metro-users', companyName: 'Metro Security Group', companyId: 2, resource: 'users', message: 'Users at 96% of configured limit', severity: 'Critical', time: '10 min ago' },
  { id: 'alert-safezone-sites', companyName: 'SafeZone Services', companyId: 3, resource: 'sites', message: 'Sites at 90% of configured limit', severity: 'Warning', time: '25 min ago' },
  { id: 'alert-secureguard-overall', companyName: 'SecureGuard UK Ltd', companyId: 1, resource: 'overall', message: 'Overall resource usage at 85%', severity: 'Warning', time: '35 min ago' },
];

export const RECOMMENDED_ACTIONS = [
  { id: 'review-guards', icon: 'chart', title: 'Review tenants approaching their guard limits.', description: 'Check staffing capacity before adding more active guards.', companyId: null },
  { id: 'upgrade-plan', icon: 'users', title: 'Consider upgrading a plan when capacity is insufficient.', description: 'Compare current resource use with the next available plan.', companyId: 3 },
  { id: 'review-storage', icon: 'settings', title: 'Review storage consumption and available capacity.', description: 'Identify tenants that may need additional storage.', companyId: 1 },
];

export const formatUsage = (used, limit, suffix = '') => `${used.toLocaleString('en-US')} / ${limit.toLocaleString('en-US')}${suffix}`;
export const getUsageStatus = (percentage) => percentage >= 95 ? 'Critical' : percentage >= 80 ? 'Near Limit' : 'Normal';
export const getCappedProgress = (percentage) => Math.min(100, Math.max(0, percentage));
