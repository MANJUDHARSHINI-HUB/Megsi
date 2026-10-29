
export const ROLE_DESTINATIONS = {
  'Super Admin': 'platform-console',
  'Admin': 'platform-console',
  'Tenant Admin': 'platform-console',
  'Customer Admin': 'platform-console',
  'Support Agent': 'platform-console',
  'Auditor': 'platform-console',
  'Analyst': 'platform-console',
  'Manager': 'platform-console',
};

export const resolveDestination = (role) =>
  Object.prototype.hasOwnProperty.call(ROLE_DESTINATIONS, role)
    ? ROLE_DESTINATIONS[role]
    : null;
