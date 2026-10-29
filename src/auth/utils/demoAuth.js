// Demo-only "authentication" helpers. Nothing here is secure and nothing talks to a server.
//
// Persistence: registered demo users (fullName, email, username, role, registeredAt) are stored in
// this browser's localStorage so the sign-in step can find them. No passwords and no OTP codes are stored.
// OTP codes live only in React state and disappear when the tab is closed or reloaded.

const STORAGE_KEY = 'megsi-auth-demo:registrations:v1';

export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 5 * 60 * 1000; // a code is valid for 5 minutes
export const RESEND_SECONDS = 30; // wait time before a new code can be requested
export const MAX_OTP_ATTEMPTS = 5;

function isValidUser(u) {
  return (
    u && typeof u === 'object' &&
    typeof u.fullName === 'string' &&
    typeof u.email === 'string' &&
    typeof u.username === 'string' &&
    typeof u.role === 'string'
  );
}

export function loadUsers() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidUser) : [];
  } catch {
    return []; // storage blocked, empty or malformed
  }
}

const same = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

export function saveUser({ fullName, email, username, role }) {
  const users = loadUsers();
  if (users.some((u) => same(u.username, username))) {
    return { ok: false, field: 'username', error: 'This username is already registered in this demo. Choose another or sign in.' };
  }
  const user = {
    fullName: fullName.trim(),
    email: email.trim(),
    username: username.trim(),
    role,
    registeredAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...users, user]));
  } catch {
    return { ok: false, field: null, error: 'Your browser blocked local storage, so the demo registration could not be saved.' };
  }
  return { ok: true, user };
}

// Returns { status: 'ok', user } | { status: 'not_found' } | { status: 'email_mismatch' }
export function findUser(username, email) {
  const match = loadUsers().find((u) => same(u.username, username));
  if (!match) return { status: 'not_found' };
  if (!same(match.email, email)) return { status: 'email_mismatch' };
  return { status: 'ok', user: match };
}

// Characters without look-alikes (no 0/O, 1/I/L) so the challenge is easy to read.
const CAPTCHA_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function randomInts(count, max) {
  const buf = new Uint32Array(count);
  window.crypto.getRandomValues(buf);
  return Array.from(buf, (n) => n % max);
}

export function generateCaptcha(length = 6) {
  return randomInts(length, CAPTCHA_CHARS.length).map((i) => CAPTCHA_CHARS[i]).join('');
}

// A fresh six-digit demo OTP. `issuedAt` doubles as the identity of the code (a new code replaces the old one).
export function generateOtp() {
  const code = randomInts(OTP_LENGTH, 10).join('');
  const issuedAt = Date.now();
  return { code, issuedAt, expiresAt: issuedAt + OTP_TTL_MS };
}

export function maskEmail(email) {
  const [local = '', domain = ''] = email.split('@');
  if (!domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${'•'.repeat(Math.max(3, local.length - visible.length))}@${domain}`;
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
