// Plan catalogue, GBP formatting and frontend validation for the Subscription Plans page.
// Prices are list prices in GBP. VAT is NOT calculated anywhere in this demo.

export const PLAN_LIST = [
  { id: 'starter', name: 'Starter', monthly: 9, annual: 84 },
  { id: 'pro', name: 'Pro', monthly: 29, annual: 276 },
  { id: 'business', name: 'Business / Team', monthly: 79, annual: 756 },
  { id: 'enterprise', name: 'Enterprise', custom: true },
];
export const PLAN_BY_ID = Object.fromEntries(PLAN_LIST.map((p) => [p.id, p]));

export const FREQ = { monthly: 'Monthly', annual: 'Annually' };

export const gbp = (n, decimals) => new Intl.NumberFormat('en-GB', {
  style: 'currency', currency: 'GBP',
  minimumFractionDigits: decimals ?? (Number.isInteger(n) ? 0 : 2),
  maximumFractionDigits: decimals ?? 2,
}).format(n);

export const priceFor = (plan, freq) => (freq === 'annual' ? plan.annual : plan.monthly);
export const yearlyAtMonthly = (plan) => plan.monthly * 12;
export const savingAmount = (plan) => yearlyAtMonthly(plan) - plan.annual;
export const savingPct = (plan) => Math.round((savingAmount(plan) / yearlyAtMonthly(plan)) * 100);
export const maxSavingPct = Math.max(...PLAN_LIST.filter((p) => !p.custom).map(savingPct));

export const fmtLongDate = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
export const addPeriod = (from, freq) => {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const months = freq === 'annual' ? 12 : 1; const day = d.getDate();
  d.setDate(1); d.setMonth(d.getMonth() + months);
  d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())); // clamp 31 Jan + 1 month etc.
  return d;
};

export const makeRef = (prefix) => {
  const n = new Date(); const p = (x) => String(x).padStart(2, '0');
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rnd = Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  return `${prefix}-${n.getFullYear()}${p(n.getMonth() + 1)}${p(n.getDate())}-${rnd}`;
};

/* ---------- validation (frontend demo level — always re-validate on the server) ---------- */
export const COUNTRIES = ['United Kingdom', 'Ireland', 'France', 'Germany', 'Netherlands', 'United States', 'Other'];
export const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–500', '501–1,000', '1,000+'];

const UK_POSTCODE = /^(GIR ?0AA|[A-PR-UWYZ]([0-9]{1,2}|([A-HK-Y][0-9]([0-9ABEHMNPRV-Y])?)|[0-9][A-HJKPS-UW]) ?[0-9][ABD-HJLNP-UW-Z]{2})$/i;
export const normalisePostcode = (v) => {
  const s = v.replace(/\s+/g, '').toUpperCase();
  return s.length > 3 ? `${s.slice(0, -3)} ${s.slice(-3)}` : s;
};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const validateBilling = (f) => {
  const e = {};
  if (f.fullName.trim().length < 2) e.fullName = 'Enter your full name.';
  if (!f.email.trim()) e.email = 'Enter a billing email address.';
  else if (!EMAIL.test(f.email.trim())) e.email = 'Enter a valid email address, e.g. name@company.co.uk.';
  if (!f.address1.trim()) e.address1 = 'Enter the first line of your billing address.';
  if (!f.city.trim()) e.city = 'Enter your town or city.';
  if (!f.postcode.trim()) e.postcode = 'Enter your postcode.';
  else if (f.country === 'United Kingdom' && !UK_POSTCODE.test(f.postcode.trim())) e.postcode = 'Enter a valid UK postcode, e.g. SW1A 1AA.';
  if (!f.country) e.country = 'Select a country.';
  return e;
};

export const validateEnquiry = (f) => {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'Enter your name.';
  if (!f.email.trim()) e.email = 'Enter your work email.';
  else if (!EMAIL.test(f.email.trim())) e.email = 'Enter a valid email address.';
  if (!f.company.trim()) e.company = 'Enter your company name.';
  if (!f.size) e.size = 'Select a company size.';
  if (f.phone.trim() && (!/^[+()\d\s-]+$/.test(f.phone.trim()) || f.phone.replace(/\D/g, '').length < 7)) e.phone = 'Enter a valid phone number, e.g. 020 7946 0000.';
  if (f.message.trim().length < 10) e.message = 'Tell us a little more (at least 10 characters).';
  return e;
};
