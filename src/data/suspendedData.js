// Demo data for the Suspended Tenants page (demonstration only - no backend).
// Totals match the reference design: 12 suspended / 4 this month / 5 pending review / 3 eligible / 2 critical.
export const DEMO_TODAY = '2026-10-23'; // fixed so the demo numbers stay stable (same convention as the Companies data)

export const REASONS = ['Payment Overdue', 'Terms Violation', 'Security Issue', 'Inactive Account', 'Admin Action'];
export const REASON_COLORS = { 'Payment Overdue': '#0758F9', 'Terms Violation': '#079447', 'Security Issue': '#7909E8', 'Inactive Account': '#E8172D', 'Admin Action': '#F59E0B' };
export const PLAN_LIST = ['Starter', 'Professional', 'Business', 'Enterprise'];
export const PLAN_COLORS = { Starter: '#F59E0B', Professional: '#0758F9', Business: '#079447', Enterprise: '#7909E8' };
export const REVIEW = { PENDING: 'Pending Review', INVESTIGATING: 'Under Investigation', ELIGIBLE: 'Eligible for Reactivation', CRITICAL: 'Critical' };
export const REVIEW_LIST = Object.values(REVIEW);
export const REVIEW_TONE = { [REVIEW.PENDING]: 'orange', [REVIEW.INVESTIGATING]: 'purple', [REVIEW.ELIGIBLE]: 'green', [REVIEW.CRITICAL]: 'red' };

const REASON_DETAIL = {
  'Payment Overdue': 'Invoice unpaid beyond the grace period and two automated reminders went unanswered.',
  'Terms Violation': 'Repeated breach of the acceptable-use terms (shared logins across multiple sites).',
  'Security Issue': 'Suspicious sign-in activity detected from unrecognised locations; account locked for protection.',
  'Inactive Account': 'No sign-ins or patrol activity recorded for 90+ days; suspended under the inactivity policy.',
  'Admin Action': 'Manually suspended by a platform administrator pending a contract query.',
};

// [name, plan, admin, email, users, reason, suspendedDate, suspendedBy, review, mrr, overdue(GBP, payment only)]
const RAW = [
  ['SecureGuard UK Ltd', 'Business', 'Sarah Johnson', 'sarah.j@secureguard.co.uk', 120, 'Payment Overdue', '2026-10-20', 'David Miller', REVIEW.PENDING, 2450, 4900],
  ['Metro Security Group', 'Professional', 'Mark Thompson', 'mark.t@metrosecurity.co.uk', 85, 'Terms Violation', '2026-10-19', 'Maya Johnson', REVIEW.INVESTIGATING, 1850],
  ['SafeZone Services', 'Business', 'Emma Clarke', 'emma.c@safezone.co.uk', 210, 'Security Issue', '2026-10-15', 'David Miller', REVIEW.ELIGIBLE, 3200],
  ['Guardian Force Ltd', 'Starter', 'James Wilson', 'james.w@guardianforce.co.uk', 35, 'Inactive Account', '2026-10-12', 'David Miller', REVIEW.ELIGIBLE, 650],
  ['Elite Security Solutions', 'Enterprise', 'Olivia Martin', 'olivia.m@elitesecurity.co.uk', 160, 'Security Issue', '2026-09-30', 'Sarah Johnson', REVIEW.CRITICAL, 5800],
  ['Northern Shield Security', 'Professional', 'Daniel Reed', 'daniel.r@northernshield.co.uk', 95, 'Payment Overdue', '2026-09-26', 'Maya Johnson', REVIEW.PENDING, 1900, 3800],
  ['Prime Security UK', 'Professional', 'Rachel Green', 'rachel.g@primesecurity.co.uk', 75, 'Payment Overdue', '2026-09-22', 'David Miller', REVIEW.ELIGIBLE, 1700, 1700],
  ['OldGuard Security', 'Starter', 'Henry Ford', 'henry.f@oldguard.co.uk', 22, 'Terms Violation', '2026-09-14', 'Sarah Johnson', REVIEW.PENDING, 650],
  ['Kingsway Security', 'Business', 'Grace Hall', 'grace.h@kingswaysecurity.co.uk', 140, 'Admin Action', '2026-09-03', 'David Miller', REVIEW.PENDING, 2900],
  ['Harbour Watch Services', 'Starter', 'Oliver Kent', 'oliver.k@harbourwatch.co.uk', 18, 'Inactive Account', '2026-08-27', 'Maya Johnson', REVIEW.PENDING, 650],
  ['Ironclad Guarding', 'Business', 'Amelia Brooks', 'amelia.b@ironcladguarding.co.uk', 175, 'Payment Overdue', '2026-08-11', 'Sarah Johnson', REVIEW.INVESTIGATING, 3050, 6100],
  ['Redline Patrol Ltd', 'Enterprise', 'Jack Turner', 'jack.t@redlinepatrol.co.uk', 410, 'Terms Violation', '2026-07-29', 'David Miller', REVIEW.CRITICAL, 5800],
];

const shortDate = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
export const SEED_TENANTS = RAW.map(([name, plan, admin, email, users, reason, suspendedDate, suspendedBy, review, mrr, overdue], i) => ({
  id: i + 1, code: `CMP-${String(2001 + i)}`, name, plan, admin, email, users, reason, suspendedDate, suspendedBy, review, mrr,
  overdue: overdue ?? 0, detail: REASON_DETAIL[reason],
  history: [
    { date: suspendedDate, text: `Suspended — ${reason}`, by: suspendedBy },
    ...(review === REVIEW.PENDING ? [] : [{ date: suspendedDate, text: `Review status set to ${review}`, by: suspendedBy }]),
  ],
  note: `Admin notified on ${shortDate(suspendedDate)}.`,
}));

// Recent activity feed (newest first). kind: suspended | flagged | reviewed | reactivated
export const SEED_ACTIVITY = [
  { id: 'a1', kind: 'suspended', company: 'SecureGuard UK Ltd', text: 'Suspended for Payment Overdue by David Miller.', at: '2026-10-20 20:35' },
  { id: 'a2', kind: 'flagged', company: 'Metro Security Group', text: 'Flagged for Terms Violation — investigation opened.', at: '2026-10-19 19:35' },
  { id: 'a3', kind: 'reviewed', company: 'SafeZone Services', text: 'Review complete — eligible for reactivation.', at: '2026-10-16 10:05' },
  { id: 'a4', kind: 'suspended', company: 'Guardian Force Ltd', text: 'Suspended for Inactive Account by David Miller.', at: '2026-10-12 08:36' },
  { id: 'a5', kind: 'flagged', company: 'Elite Security Solutions', text: 'Escalated to Critical after security review.', at: '2026-10-01 14:20' },
  { id: 'a6', kind: 'reactivated', company: 'Beacon Protection', text: 'Reactivated after payment cleared.', at: '2026-09-29 11:12' },
];

// Monthly history used by the Suspension Trends chart (Nov 2025 -> Oct 2026). The current month is adjusted live.
export const TREND_HISTORY = [
  ['2025-11', 5, 2], ['2025-12', 4, 3], ['2026-01', 6, 2], ['2026-02', 4, 3], ['2026-03', 7, 4], ['2026-04', 4, 1],
  ['2026-05', 6, 3], ['2026-06', 5, 2], ['2026-07', 6, 4], ['2026-08', 3, 2], ['2026-09', 5, 3], ['2026-10', 4, 0],
];

export const DEFAULT_POLICIES = { graceDays: 14, reminders: 2, retentionDays: 90, autoSuspendOverdue: true, notifyAdmin: true };
