// Frontend-only validation helpers. Each function returns an error message, or '' when valid.

export const ROLES = [
  'Super Admin',
  'Tenant Admin',
  'Customer Admin',
  'Support Agent',
  'Auditor',
  'Analyst',
  'Manager',
  'Admin',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F .'-]*$/;
const USERNAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function validateFullName(value) {
  const v = value.trim();
  if (!v) return 'Enter your full name.';
  if (v.length < 2) return 'Full name must be at least 2 characters.';
  if (v.length > 60) return 'Full name must be 60 characters or fewer.';
  if (!NAME_RE.test(v)) return 'Use letters, spaces, apostrophes, hyphens or periods only.';
  return '';
}

export function validateEmail(value) {
  const v = value.trim();
  if (!v) return 'Enter your email address.';
  if (!EMAIL_RE.test(v)) return 'Enter a valid email address, for example name@company.com.';
  return '';
}

export function validateUsername(value) {
  const v = value.trim();
  if (!v) return 'Enter your username or user ID.';
  if (v.length < 3) return 'Username must be at least 3 characters.';
  if (v.length > 24) return 'Username must be 24 characters or fewer.';
  if (!USERNAME_RE.test(v)) return 'Use letters, numbers, dots, hyphens or underscores (no spaces).';
  return '';
}

export function validateRole(value) {
  if (!value) return 'Select your role.';
  if (!ROLES.includes(value)) return 'Select a role from the list.';
  return '';
}

export function validateCaptcha(answer, challenge) {
  const a = answer.trim();
  if (!a) return 'Enter the characters shown in the image.';
  if (a.toUpperCase() !== challenge.toUpperCase()) return 'Incorrect characters. A new challenge has been generated.';
  return '';
}

// Removes empty-string entries so callers can test Object.keys(errors).length.
export function compact(errors) {
  return Object.fromEntries(Object.entries(errors).filter(([, msg]) => msg));
}
