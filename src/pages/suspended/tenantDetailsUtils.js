import { DEMO_TODAY } from '../../data/suspendedData.js';

export const SUPPORT_EMAIL = 'support@megsi.com';
export const NOT_ON_RECORD = 'Not on record';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** '2026-10-15' or '2026-10-15 09:20' -> '15 Oct 2026'. Returns '' when the value is empty. */
export const fmtDay = (value) => {
  if (!value) return '';
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return String(value);
  return `${String(d).padStart(2, '0')} ${MONTHS[m - 1]} ${y}`;
};
/** '2026-10-15 09:20' -> '15 Oct 2026, 09:20' (time shown only when present). */
export const fmtDayTime = (value, time) => {
  const t = time || (String(value || '').length > 10 ? String(value).slice(11, 16) : '');
  return `${fmtDay(value)}${t ? `, ${t}` : ''}`;
};
export const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export const isActive = (tenant) => tenant.accountStatus === 'Active';

/** Whole days between the suspension date and the demo "today" (DEMO_TODAY in suspendedData.js). */
export const daysSuspended = (tenant) => {
  if (!tenant.suspendedDate) return null;
  const diff = Math.round((Date.parse(DEMO_TODAY) - Date.parse(String(tenant.suspendedDate).slice(0, 10))) / 86400000);
  return Math.max(0, diff);
};
export const durationLabel = (days) => (days === null ? NOT_ON_RECORD : days === 0 ? 'Today' : `${days} ${days === 1 ? 'Day' : 'Days'}`);

export const complianceCategory = (tenant) => (tenant.reason === 'Security Issue' ? 'Security compliance'
  : tenant.reason === 'Terms Violation' ? 'Terms & policy'
  : tenant.reason === 'Payment Overdue' ? 'Billing & payments'
  : 'Account operations');

export const paymentStatus = (tenant) => (tenant.outstanding > 0 ? 'Outstanding' : 'Paid');

/**
 * Builds the activity timeline for one tenant, newest first, from the tenant's own record:
 * account creation (subscription start date), last payment (lastPayment) and every history entry in the store
 * (suspension, review, reactivation). The seed history's "Payment recorded" line is replaced by the real lastPayment date
 * so the timeline never disagrees with the billing details.
 */
export const buildTimeline = (tenant) => {
  const items = [];
  if (tenant.startDate) items.push({ key: 'created', date: tenant.startDate, time: '', text: 'Account created — tenant workspace and subscription started', by: '', kind: 'created', order: -2 });
  if (tenant.lastPayment) items.push({ key: 'payment', date: tenant.lastPayment, time: '', text: 'Payment received — last successful payment', by: '', kind: 'payment', order: -1 });
  (tenant.history || []).forEach((h, i) => {
    if (/^Payment recorded/i.test(h.text || '')) return;
    const text = h.text || '';
    const kind = /^Review/i.test(text) ? 'review' : /reactivat/i.test(text) ? 'reactivated' : /suspend/i.test(text) ? 'suspended' : 'other';
    items.push({ key: `h${i}`, date: h.date, time: h.time || '', text, by: h.by || '', kind, order: i });
  });
  return items.sort((a, b) => (`${b.date} ${b.time || '00:00'}`).localeCompare(`${a.date} ${a.time || '00:00'}`) || b.order - a.order);
};

/** Gmail compose link + mailto fallback for the support email. */
export const supportMessage = (tenant) => {
  const subject = `Support request: ${tenant.name} (Tenant ID ${tenant.id})`;
  const body = `Hello MEGSI Support,\n\nI need help with the following tenant account:\n\nCompany: ${tenant.name}\nTenant ID: ${tenant.id}\nCurrent status: ${tenant.status}\n\nDetails:\n`;
  return {
    subject,
    body,
    gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(SUPPORT_EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    mailto: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
};

/** Opens Gmail compose in a new tab; if the browser blocks the tab, falls back to the default mail app (mailto). */
export const openSupportEmail = (tenant) => {
  const m = supportMessage(tenant);
  const tab = window.open(m.gmail, '_blank');
  if (tab) { try { tab.opener = null; } catch (e) { /* ignore */ } return 'gmail'; }
  window.location.href = m.mailto;
  return 'mailto';
};

const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const val = (v) => (v === undefined || v === null || v === '' ? NOT_ON_RECORD : v);

/** Complete, self-contained HTML report for one tenant (opens in any browser; use Print to save as PDF). */
export const buildReportHtml = (tenant) => {
  const active = isActive(tenant);
  const days = daysSuspended(tenant);
  const timeline = buildTimeline(tenant);
  const rows = (pairs) => pairs.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(val(v))}</td></tr>`).join('');
  const generated = new Date().toLocaleString('en-GB');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(tenant.name)} – Tenant Report</title>
<style>
body{font-family:Inter,Arial,sans-serif;color:#101B4D;margin:32px;font-size:14px;line-height:1.5}
h1{font-size:26px;margin:0 0 4px}h2{font-size:17px;background:#101B4D;color:#fff;padding:7px 12px;border-radius:6px;margin:24px 0 8px}
p.sub{color:#465477;margin:0 0 4px}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:6px 10px;border-bottom:1px solid #E4ECF5;vertical-align:top}
th{width:240px;color:#465477;font-weight:600}.foot{margin-top:28px;color:#465477;font-size:12px}
</style></head><body>
<h1>${esc(tenant.name)}</h1>
<p class="sub">Tenant Details and Activity Report · Tenant ID ${esc(tenant.id)} · Status: ${esc(active ? 'Active' : tenant.status)}</p>
<h2>Company Information</h2><table>${rows([
    ['Company name', tenant.name], ['Tenant ID', tenant.id], ['Business type', tenant.businessType], ['Registration number', tenant.registrationNumber],
    ['Industry', tenant.industry], ['Administrator', tenant.admin || tenant.contact], ['Email', tenant.email], ['Phone', tenant.phone], ['Address', tenant.address],
  ])}</table>
<h2>Suspension Details</h2><table>${rows([
    ['Account status', active ? 'Active' : 'Suspended'], ['Suspension reason', tenant.reason], ['Suspended by', tenant.suspendedBy],
    ['Suspension date', fmtDayTime(tenant.suspendedDate)], ['Suspension duration', active ? 'Not currently suspended' : durationLabel(days)],
    ['Expected review date', fmtDay(tenant.reviewDate)], ['Current review status', tenant.status], ['Administrator notes', tenant.notes],
  ])}</table>
<h2>Subscription &amp; Billing</h2><table>${rows([
    ['Subscription plan', tenant.plan], ['Subscription start', fmtDay(tenant.startDate)], ['Renewal date', fmtDay(tenant.renewal)], ['Billing cycle', 'Monthly'],
    ['Subscription amount', `${money(tenant.price)} / month`], ['Outstanding balance', money(tenant.outstanding)], ['Last payment date', fmtDay(tenant.lastPayment)], ['Payment status', paymentStatus(tenant)],
  ])}</table>
<h2>Review &amp; Compliance</h2><table>${rows([
    ['Review status', tenant.status], ['Assigned reviewer', tenant.reviewBy], ['Scheduled review date', fmtDay(tenant.reviewDate)],
    ['Last reviewed by', tenant.reviewedBy], ['Last reviewed on', fmtDayTime(tenant.reviewedOn)], ['Review notes', tenant.reviewNote], ['Compliance category', complianceCategory(tenant)],
  ])}</table>
<h2>Activity History</h2><table>${timeline.map((t) => `<tr><th>${esc(fmtDayTime(t.date, t.time))}</th><td>${esc(t.text)}${t.by ? ` — ${esc(t.by)}` : ''}</td></tr>`).join('')}</table>
<p class="foot">Generated ${esc(generated)} from MEGSI Platform demonstration data. These records are not stored on a server.</p>
</body></html>`;
};

export const downloadReport = (tenant) => {
  const slug = tenant.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const url = URL.createObjectURL(new Blob([buildReportHtml(tenant)], { type: 'text/html;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url; a.download = `${tenant.id}-${slug}-report.html`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};