// MEGSI Platform Admin — Announcements mock data + page-local translations.
// Demonstration data only: nothing here is connected to a backend.
//
// Date conventions (documented once, used everywhere on the page):
//   - "Activity date" of an announcement decides which global date range it belongs to:
//       published / expired -> publishAt (the date it went live)
//       scheduled           -> publishAt (the scheduled go-live date)
//       draft               -> created   (the date the draft was created)
//   - Dates are plain ISO strings (YYYY-MM-DD), compared as strings, exactly like src/data/selectors.js.

// The demo "today". Fixed so that scheduled / expired records behave the same on every machine.
export const TODAY = '2026-10-26';

export const CATEGORIES = [
  { id: 'system',   color: '#0758f9' },
  { id: 'product',  color: '#7909e8' },
  { id: 'policy',   color: '#079447' },
  { id: 'general',  color: '#1a8fe3' },
  { id: 'training', color: '#f59e0b' },
  { id: 'security', color: '#e8172d' },
];
export const PRIORITIES = ['high', 'medium', 'low'];
export const STATUSES = ['published', 'scheduled', 'draft', 'expired'];
export const AUDIENCES = ['all', 'customer_admins', 'supervisors', 'guards', 'platform_staff'];
export const COMPANY_NAMES = [
  'SecureGuard UK Ltd', 'Metro Security Group', 'SafeZone Services', 'Guardian Force Ltd',
  'Elite Security Solutions', 'Shield Security Group', 'Northern Security', 'City Watch Ltd',
];
export const CREATORS = ['David Miller', 'Sarah Johnson', 'Mark Thompson', 'Emma Clarke', 'James Wilson', 'Olivia Martin'];
export const CURRENT_USER = 'David Miller';

export const activityDate = (a) => (a.status === 'draft' ? a.created : a.publishAt);

// r(...) builds a record and its publication history from the same fields (single source of truth).
function r(n, title, message, category, priority, audience, company, status, created, publishAt, expiry, createdBy, views) {
  const history = [{ at: created, action: 'created', by: createdBy }];
  if (status === 'scheduled') history.push({ at: created, action: 'scheduled', by: createdBy });
  if (status === 'published' || status === 'expired') history.push({ at: publishAt, action: 'published', by: createdBy });
  if (status === 'expired') history.push({ at: expiry, action: 'expired', by: createdBy });
  return { id: `ANN-${1000 + n}`, title, message, category, priority, audience, company, status, created, publishAt, expiry, createdBy, views, history };
}

export const SEED_ANNOUNCEMENTS = [
  // ---- October 2026 ----
  r(24, 'System Maintenance Window', 'Scheduled maintenance for better performance. The platform will be read-only between 01:00 and 03:00 UTC.', 'system', 'high', 'all', '', 'published', '2026-10-21', '2026-10-23', '2026-11-02', 'David Miller', 612),
  r(23, 'New Security Features Released', 'We are excited to announce new security features: two-factor sign-in prompts and session timeout controls.', 'product', 'medium', 'customer_admins', '', 'published', '2026-10-18', '2026-10-20', '', 'Sarah Johnson', 884),
  r(22, 'Policy Update: Password Requirements', 'Updated password complexity rules are now in effect for all platform and tenant accounts.', 'policy', 'high', 'all', '', 'published', '2026-10-16', '2026-10-18', '', 'Mark Thompson', 1240),
  r(21, 'Holiday Schedule – Diwali 2026', 'Office will be closed on 12 Nov 2026 for Diwali. Support cover is limited to critical incidents.', 'general', 'medium', 'all', '', 'published', '2026-10-13', '2026-10-15', '2026-11-13', 'Emma Clarke', 703),
  r(20, 'New Integration Available', 'Now integrate with third-party tools for better workflow automation from the Integrations page.', 'product', 'low', 'customer_admins', '', 'published', '2026-10-10', '2026-10-12', '', 'Sarah Johnson', 466),
  r(19, 'Security Awareness Training', 'Complete your mandatory security training by 30 Oct. Reminders are sent to supervisors on Fridays.', 'training', 'medium', 'supervisors', '', 'published', '2026-10-08', '2026-10-10', '2026-10-30', 'James Wilson', 538),
  r(18, 'Critical Vulnerability Alert', 'A critical vulnerability has been identified in a third-party library. Please update the mobile app to the latest version.', 'security', 'high', 'guards', '', 'published', '2026-10-06', '2026-10-07', '', 'David Miller', 1495),
  r(17, 'Welcome to MEGSI Platform', 'Thank you for choosing MEGSI. Here is a quick guide to getting started with rotas, sites and incident reports.', 'general', 'low', 'customer_admins', 'Guardian Force Ltd', 'published', '2026-09-30', '2026-10-01', '', 'Olivia Martin', 289),
  r(25, 'Night Shift Handover Checklist', 'A refreshed handover checklist is rolling out to night-shift supervisors across partner companies.', 'training', 'medium', 'supervisors', 'Metro Security Group', 'scheduled', '2026-10-22', '2026-10-28', '2026-12-31', 'Emma Clarke', 0),
  r(26, 'Quarterly Compliance Reminder', 'Quarterly compliance attestations are due. Please review your tenant security settings before the deadline.', 'policy', 'high', 'customer_admins', '', 'scheduled', '2026-10-20', '2026-10-30', '2026-11-15', 'Mark Thompson', 0),
  r(27, 'Winter Rota Planning Opens', 'Winter rota planning opens on the scheduling module. Plan leave and cover ahead of the holiday period.', 'general', 'low', 'supervisors', '', 'draft', '2026-10-24', '', '', 'Olivia Martin', 0),
  r(28, 'Incident Report Form Changes', 'Draft notice: the incident report form will gain mandatory location and witness fields.', 'product', 'medium', 'guards', 'SafeZone Services', 'draft', '2026-10-19', '', '2026-12-01', 'James Wilson', 0),
  // ---- Scheduled beyond October ----
  r(29, 'Scheduled Billing System Upgrade', 'Invoicing will be unavailable for two hours while we upgrade the billing engine.', 'system', 'high', 'customer_admins', '', 'scheduled', '2026-10-15', '2026-11-03', '2026-11-04', 'David Miller', 0),
  r(30, 'Black Friday Staffing Briefing', 'Briefing for retail-site guards on crowd management and incident escalation during peak trading.', 'training', 'medium', 'guards', 'Elite Security Solutions', 'scheduled', '2026-10-17', '2026-11-12', '2026-11-30', 'Sarah Johnson', 0),
  r(31, 'Year-End Support Hours', 'Support availability during the year-end period, including the on-call escalation numbers.', 'general', 'low', 'all', '', 'scheduled', '2026-10-12', '2026-12-01', '2027-01-05', 'Emma Clarke', 0),
  // ---- September 2026 ----
  r(32, 'Mobile App v4.2 Released', 'The latest guard mobile app adds offline patrol logging and faster check-in.', 'product', 'medium', 'guards', '', 'published', '2026-09-24', '2026-09-26', '', 'Sarah Johnson', 1102),
  r(33, 'Planned Database Maintenance', 'Short database maintenance window completed successfully. No action is required.', 'system', 'medium', 'platform_staff', '', 'expired', '2026-09-18', '2026-09-20', '2026-09-21', 'David Miller', 351),
  r(34, 'Phishing Attempts Targeting Admins', 'Phishing emails impersonating MEGSI are circulating. Never share verification codes.', 'security', 'high', 'customer_admins', '', 'published', '2026-09-11', '2026-09-12', '', 'Mark Thompson', 1318),
  r(35, 'Data Retention Policy Update', 'Incident and patrol records are now retained for 7 years unless a tenant configures otherwise.', 'policy', 'medium', 'all', '', 'published', '2026-09-03', '2026-09-05', '', 'Olivia Martin', 647),
  r(36, 'Supervisor Onboarding Webinar', 'A live walkthrough for new supervisors covering the dashboard, rotas and alerts.', 'training', 'low', 'supervisors', 'City Watch Ltd', 'expired', '2026-09-01', '2026-09-02', '2026-09-16', 'James Wilson', 214),
  // ---- August 2026 ----
  r(37, 'Summer Holiday Cover Guidance', 'Guidance for managing guard leave and cover during the August bank holiday weekend.', 'general', 'low', 'supervisors', '', 'expired', '2026-08-20', '2026-08-22', '2026-08-31', 'Emma Clarke', 330),
  r(38, 'Multi-Factor Authentication Mandatory', 'MFA becomes mandatory for all tenant administrators from 1 September.', 'security', 'high', 'customer_admins', '', 'published', '2026-08-12', '2026-08-14', '', 'David Miller', 1587),
  r(39, 'Reporting Module Beta', 'Join the beta of the new reporting module with exportable patrol and incident summaries.', 'product', 'medium', 'customer_admins', 'Northern Security', 'published', '2026-08-05', '2026-08-06', '', 'Sarah Johnson', 392),
  r(40, 'Outage Post-Incident Summary', 'Summary and learnings from last week’s short API outage. Service is fully restored.', 'system', 'medium', 'platform_staff', '', 'expired', '2026-08-01', '2026-08-03', '2026-08-10', 'Mark Thompson', 180),
  // ---- July 2026 ----
  r(41, 'Fire Safety Refresher', 'Annual fire-safety refresher for all site guards. Certificates upload to the training record.', 'training', 'medium', 'guards', '', 'published', '2026-07-22', '2026-07-24', '', 'James Wilson', 701),
  r(42, 'New Subscription Plans', 'Starter, Professional, Business and Enterprise plans now include updated usage limits.', 'product', 'low', 'customer_admins', '', 'published', '2026-07-14', '2026-07-15', '', 'Olivia Martin', 523),
  r(43, 'Heatwave Welfare Notice', 'Guidance on hydration breaks and shift adjustments during the heatwave.', 'general', 'high', 'guards', '', 'expired', '2026-07-09', '2026-07-10', '2026-07-25', 'Emma Clarke', 944),
  // ---- April – June 2026 ----
  r(44, 'Access Log Retention Extended', 'Access log history in the admin console now extends to 18 months.', 'system', 'low', 'platform_staff', '', 'published', '2026-06-18', '2026-06-20', '', 'David Miller', 142),
  r(45, 'Q2 Compliance Training', 'Quarterly compliance training is open for all supervisors.', 'training', 'medium', 'supervisors', '', 'expired', '2026-05-26', '2026-05-28', '2026-06-30', 'James Wilson', 410),
  r(46, 'Ransomware Readiness Guidance', 'Practical guidance on backups, MFA and reporting suspicious activity.', 'security', 'high', 'all', '', 'published', '2026-05-07', '2026-05-09', '', 'Mark Thompson', 1260),
  r(47, 'Easter Support Hours', 'Support hours over the Easter weekend.', 'general', 'low', 'all', '', 'expired', '2026-03-30', '2026-04-01', '2026-04-08', 'Emma Clarke', 276),
  // ---- January – March 2026 ----
  r(48, 'Tenant Onboarding Checklist Update', 'The onboarding checklist now includes site import and guard invitations.', 'product', 'medium', 'customer_admins', '', 'published', '2026-03-10', '2026-03-12', '', 'Sarah Johnson', 488),
  r(49, 'Data Privacy Notice', 'Updated privacy notice covering guard location data and retention.', 'policy', 'high', 'all', '', 'published', '2026-02-02', '2026-02-04', '', 'Olivia Martin', 905),
  r(50, 'Platform Health Dashboard Live', 'A new system health view is available to platform staff.', 'system', 'low', 'platform_staff', '', 'published', '2026-01-14', '2026-01-15', '', 'David Miller', 120),
  // ---- Late 2025 ----
  r(51, 'Winter Weather Preparedness', 'Guidance for site guards on severe weather and lone working.', 'general', 'medium', 'guards', '', 'expired', '2025-12-08', '2025-12-10', '2026-02-28', 'Emma Clarke', 612),
  r(52, 'Annual Security Policy Review', 'Annual review of the platform security policy has been completed.', 'policy', 'medium', 'customer_admins', '', 'published', '2025-11-17', '2025-11-19', '', 'Mark Thompson', 377),
  
  // ---- Additional mock announcements ----
  r(53, 'Guard Check-In System Update', 'The guard check-in workflow has been improved to provide clearer shift confirmation and attendance records.', 'product', 'medium', 'guards', 'Guardian Force Ltd', 'published', '2026-10-25', '2026-10-26', '', 'Sarah Johnson', 325),
  r(54, 'Emergency Response Procedure', 'All site supervisors must review emergency escalation procedures and confirm that contact details are up to date.', 'security', 'high', 'supervisors', '', 'published', '2026-10-23', '2026-10-24', '2026-11-30', 'David Miller', 428),
  r(55, 'Monthly Timesheet Submission', 'Please verify guard attendance and submit outstanding timesheets before the monthly payroll processing deadline.', 'general', 'medium', 'customer_admins', 'Metro Security Group', 'published', '2026-10-22', '2026-10-23', '2026-11-05', 'Emma Clarke', 291),
  r(56, 'New Guard Onboarding Module', 'The onboarding module provides a guided checklist for new guards, including profile completion and training requirements.', 'training', 'low', 'guards', '', 'published', '2026-10-20', '2026-10-21', '', 'James Wilson', 186),
  r(57, 'Tenant Account Review', 'Platform staff should review tenant account permissions and remove access that is no longer required.', 'policy', 'high', 'platform_staff', '', 'published', '2026-10-19', '2026-10-20', '2026-11-10', 'Mark Thompson', 514),
  r(58, 'Patrol Report Export Feature', 'Customer administrators can review exported patrol summaries to support internal reporting and operational reviews.', 'product', 'medium', 'customer_admins', 'SafeZone Services', 'scheduled', '2026-10-24', '2026-10-29', '2026-12-15', 'Olivia Martin', 0),
  r(59, 'Weekend Shift Coverage Reminder', 'Supervisors should confirm weekend shift coverage and report any staffing gaps before the roster is finalized.', 'general', 'medium', 'supervisors', '', 'draft', '2026-10-25', '', '', 'Emma Clarke', 0),
  r(60, 'Suspicious Login Monitoring', 'Review unusual login activity and report suspected unauthorized access through the platform security process.', 'security', 'high', 'customer_admins', '', 'scheduled', '2026-10-24', '2026-11-02', '2026-11-20', 'David Miller', 0),

];

// ------------------------------------------------------------------------------------------
// Page-local translations (same approach as the Onboarding page: the shared translations.js
// stays untouched). Languages are the three the app actually supports: en, fr, de.
// Missing keys fall back to English. Announcement titles / messages are user content, not translated.
// ------------------------------------------------------------------------------------------
export const ANNOUNCEMENT_TEXT = {
  en: {
    subtitle: 'Stay informed with the latest updates, news and important notifications.',
    create: 'Create Announcement', allAnn: 'All Announcements',
    tabAll: 'All', tabPublished: 'Published', tabScheduled: 'Scheduled', tabDrafts: 'Drafts', tabExpired: 'Expired',
    search: 'Search announcements...', allPriority: 'All Priority', allCategories: 'All Types', allAudiences: 'All Audiences', allCreators: 'All Creators',
    clear: 'Clear all', clearN: 'Clear all ({n})',
    kTotal: 'Total Announcements', kTotalSub: 'In selected period', kTotalTrend: '{n} published',
    kScheduled: 'Scheduled', kScheduledSub: 'Upcoming (not limited to period)', kScheduledTrend: '{n} in period',
    kViews: 'Total Views', kViewsSub: 'Across announcements in period', kViewsTrend: 'avg {n}',
    kImportant: 'Important', kImportantSub: 'High priority notices', kImportantTrend: '{n} live',
    ovTitle: 'Announcement Overview', ovTotal: 'Total', actTitle: 'Publication Activity', recentTitle: 'Recent Announcements', viewAll: 'View All',
    serLive: 'Published', serScheduled: 'Scheduled', serDraft: 'Drafts', noPeriod: 'No announcements in the selected period',
    recentEmpty: 'No published announcements in this period',
    colTitle: 'Title', colType: 'Type', colPriority: 'Priority', colAudience: 'Audience', colStatus: 'Status', colDate: 'Date', colActions: 'Actions',
    dPublished: 'Published', dScheduledFor: 'Scheduled for', dCreated: 'Created',
    showing: 'Showing {a} - {b} of {n} announcements', prev: 'Previous page', next: 'Next page',
    emptyPeriod: 'No announcements in the selected date range.', emptyFilters: 'No announcements match your search and filters.',
    'cat.system': 'System', 'cat.product': 'Product', 'cat.policy': 'Policy', 'cat.general': 'General', 'cat.training': 'Training', 'cat.security': 'Security',
    'pri.high': 'High', 'pri.medium': 'Medium', 'pri.low': 'Low',
    'st.published': 'Published', 'st.scheduled': 'Scheduled', 'st.draft': 'Draft', 'st.expired': 'Expired',
    'aud.all': 'Everyone', 'aud.customer_admins': 'Customer Admins', 'aud.supervisors': 'Supervisors', 'aud.guards': 'Security Guards', 'aud.platform_staff': 'Platform Staff',
    allCompanies: 'All companies',
    aView: 'View', aEdit: 'Edit', aPublish: 'Publish now', aSchedule: 'Schedule…', aCancelSched: 'Cancel schedule', aExpire: 'Expire', aDelete: 'Delete', moreActions: 'More actions',
    createTitle: 'Create Announcement', editTitle: 'Edit Announcement',
    fTitle: 'Title', fMessage: 'Message', fCategory: 'Category', fPriority: 'Priority', fAudience: 'Target audience', fCompany: 'Target company', fStatus: 'Status',
    fPublishDate: 'Publication date', fScheduleDate: 'Scheduled date', fExpiry: 'Expiry date (optional)', fDraftHint: 'Drafts have no publication date. Choose Scheduled or Published to set one.',
    save: 'Create', saveEdit: 'Save changes', cancel: 'Cancel',
    vTitle: 'Title is required.', vMessage: 'Message is required.', vPublish: 'Publication date is required.', vSched: 'Scheduled date is required.',
    vSchedFuture: 'Scheduled date must be after today ({d}).', vPubFuture: 'Publication date cannot be in the future. Use Scheduled instead.',
    vExpiry: 'Expiry date cannot be before the publication date.', vExpiryPast: 'Expiry date must be today or later for a live announcement.', vExpiredFuture: 'An expired announcement cannot have a future expiry date.',
    tFix: 'Please fix the highlighted fields.',
    tCreated: '{id} created. Demo data — kept for this session only.', tUpdated: '{id} updated.', tPublished: '{id} published.', tCancelled: 'Schedule cancelled — {id} moved to drafts.',
    tExpired: '{id} marked as expired.', tDeleted: '{id} deleted.', tPublishFix: 'Update the expiry date before publishing {id}.',
    delTitle: 'Delete announcement?', delBody: '“{title}” ({id}) will be removed from the demo data for this session. This cannot be undone.', delConfirm: 'Delete',
    selPeriod: 'Selected period', dId: 'Announcement ID', dMessage: 'Message', dCategory: 'Category', dPriority: 'Priority', dAudience: 'Target audience', dCompany: 'Target company',
    dStatus: 'Status', dCreatedBy: 'Created by', dCreatedOn: 'Created', dPublishedOn: 'Publication date', dScheduledOn: 'Scheduled date', dExpiry: 'Expiry date', dViews: 'Views', dHistory: 'Publication history',
    none: '–',
    'h.created': 'Created', 'h.scheduled': 'Scheduled', 'h.published': 'Published', 'h.expired': 'Expired', 'h.edited': 'Edited', 'h.unscheduled': 'Schedule cancelled', 'h.draft': 'Moved to draft',
    sessionNote: 'Changes exist only for this browser session — nothing is saved to a backend.',
    cTotalCount: 'Announcements in period', cPublished: 'Published', cScheduled: 'Scheduled', cDrafts: 'Drafts', cExpired: 'Expired', cHigh: 'High priority', cViews: 'Total views',
    cUpcoming: 'Upcoming (all periods)', cInPeriod: 'Scheduled in selected period', cNext: 'Next scheduled date', cByAudience: 'Audience: {a}',
    cAvgViews: 'Average per announcement', cTopTitle: 'Most viewed', cMedium: 'Medium priority', cLow: 'Low priority', cLive: 'High priority — published', cHighSched: 'High priority — scheduled', cHighDraft: 'High priority — drafts', cHighExpired: 'High priority — expired',
    cList: 'Announcements', cListUpcoming: 'Upcoming announcements', cListViews: 'Most viewed announcements', cListHigh: 'High priority announcements', cNoRecords: 'No records for this card.',
    cNote: 'Total, views and important follow the selected period by activity date. Scheduled shows all upcoming announcements.',
  },
  fr: {
    subtitle: 'Restez informé des dernières mises à jour, actualités et notifications importantes.',
    create: 'Créer une annonce', allAnn: 'Toutes les annonces',
    tabAll: 'Toutes', tabPublished: 'Publiées', tabScheduled: 'Planifiées', tabDrafts: 'Brouillons', tabExpired: 'Expirées',
    search: 'Rechercher des annonces...', allPriority: 'Toutes les priorités', allCategories: 'Tous les types', allAudiences: 'Tous les publics', allCreators: 'Tous les auteurs',
    clear: 'Tout effacer', clearN: 'Tout effacer ({n})',
    kTotal: 'Total des annonces', kTotalSub: 'Sur la période sélectionnée', kTotalTrend: '{n} publiées',
    kScheduled: 'Planifiées', kScheduledSub: 'À venir (hors période)', kScheduledTrend: '{n} sur la période',
    kViews: 'Total des vues', kViewsSub: 'Annonces de la période', kViewsTrend: 'moy. {n}',
    kImportant: 'Importantes', kImportantSub: 'Avis haute priorité', kImportantTrend: '{n} en ligne',
    ovTitle: 'Aperçu des annonces', ovTotal: 'Total', actTitle: 'Activité de publication', recentTitle: 'Annonces récentes', viewAll: 'Tout voir',
    serLive: 'Publiées', serScheduled: 'Planifiées', serDraft: 'Brouillons', noPeriod: 'Aucune annonce sur la période sélectionnée',
    recentEmpty: 'Aucune annonce publiée sur cette période',
    colTitle: 'Titre', colType: 'Type', colPriority: 'Priorité', colAudience: 'Public', colStatus: 'Statut', colDate: 'Date', colActions: 'Actions',
    dPublished: 'Publiée le', dScheduledFor: 'Planifiée pour le', dCreated: 'Créée le',
    showing: 'Affichage de {a} à {b} sur {n} annonces', prev: 'Page précédente', next: 'Page suivante',
    emptyPeriod: 'Aucune annonce sur la période sélectionnée.', emptyFilters: 'Aucune annonce ne correspond à votre recherche et à vos filtres.',
    'cat.system': 'Système', 'cat.product': 'Produit', 'cat.policy': 'Politique', 'cat.general': 'Général', 'cat.training': 'Formation', 'cat.security': 'Sécurité',
    'pri.high': 'Haute', 'pri.medium': 'Moyenne', 'pri.low': 'Basse',
    'st.published': 'Publiée', 'st.scheduled': 'Planifiée', 'st.draft': 'Brouillon', 'st.expired': 'Expirée',
    'aud.all': 'Tout le monde', 'aud.customer_admins': 'Administrateurs clients', 'aud.supervisors': 'Superviseurs', 'aud.guards': 'Agents de sécurité', 'aud.platform_staff': 'Équipe de la plateforme',
    allCompanies: 'Toutes les entreprises',
    aView: 'Voir', aEdit: 'Modifier', aPublish: 'Publier maintenant', aSchedule: 'Planifier…', aCancelSched: 'Annuler la planification', aExpire: 'Faire expirer', aDelete: 'Supprimer', moreActions: 'Plus d’actions',
    createTitle: 'Créer une annonce', editTitle: 'Modifier l’annonce',
    fTitle: 'Titre', fMessage: 'Message', fCategory: 'Catégorie', fPriority: 'Priorité', fAudience: 'Public cible', fCompany: 'Entreprise cible', fStatus: 'Statut',
    fPublishDate: 'Date de publication', fScheduleDate: 'Date planifiée', fExpiry: 'Date d’expiration (facultatif)', fDraftHint: 'Les brouillons n’ont pas de date de publication. Choisissez Planifiée ou Publiée pour en définir une.',
    save: 'Créer', saveEdit: 'Enregistrer', cancel: 'Annuler',
    vTitle: 'Le titre est obligatoire.', vMessage: 'Le message est obligatoire.', vPublish: 'La date de publication est obligatoire.', vSched: 'La date planifiée est obligatoire.',
    vSchedFuture: 'La date planifiée doit être postérieure à aujourd’hui ({d}).', vPubFuture: 'La date de publication ne peut pas être dans le futur. Utilisez plutôt Planifiée.',
    vExpiry: 'La date d’expiration ne peut pas précéder la date de publication.', vExpiryPast: 'La date d’expiration doit être aujourd’hui ou plus tard pour une annonce en ligne.', vExpiredFuture: 'Une annonce expirée ne peut pas avoir une date d’expiration future.',
    tFix: 'Veuillez corriger les champs signalés.',
    tCreated: '{id} créée. Données de démonstration — conservées pour cette session uniquement.', tUpdated: '{id} mise à jour.', tPublished: '{id} publiée.', tCancelled: 'Planification annulée — {id} repassée en brouillon.',
    tExpired: '{id} marquée comme expirée.', tDeleted: '{id} supprimée.', tPublishFix: 'Modifiez la date d’expiration avant de publier {id}.',
    delTitle: 'Supprimer l’annonce ?', delBody: '« {title} » ({id}) sera retirée des données de démonstration pour cette session. Cette action est irréversible.', delConfirm: 'Supprimer',
    selPeriod: 'Période sélectionnée', dId: 'ID de l’annonce', dMessage: 'Message', dCategory: 'Catégorie', dPriority: 'Priorité', dAudience: 'Public cible', dCompany: 'Entreprise cible',
    dStatus: 'Statut', dCreatedBy: 'Créée par', dCreatedOn: 'Création', dPublishedOn: 'Date de publication', dScheduledOn: 'Date planifiée', dExpiry: 'Date d’expiration', dViews: 'Vues', dHistory: 'Historique de publication',
    none: '–',
    'h.created': 'Créée', 'h.scheduled': 'Planifiée', 'h.published': 'Publiée', 'h.expired': 'Expirée', 'h.edited': 'Modifiée', 'h.unscheduled': 'Planification annulée', 'h.draft': 'Repassée en brouillon',
    sessionNote: 'Les modifications n’existent que pour cette session du navigateur — rien n’est enregistré sur un serveur.',
    cTotalCount: 'Annonces sur la période', cPublished: 'Publiées', cScheduled: 'Planifiées', cDrafts: 'Brouillons', cExpired: 'Expirées', cHigh: 'Haute priorité', cViews: 'Total des vues',
    cUpcoming: 'À venir (toutes périodes)', cInPeriod: 'Planifiées sur la période', cNext: 'Prochaine date planifiée', cByAudience: 'Public : {a}',
    cAvgViews: 'Moyenne par annonce', cTopTitle: 'La plus consultée', cMedium: 'Priorité moyenne', cLow: 'Priorité basse', cLive: 'Haute priorité — publiées', cHighSched: 'Haute priorité — planifiées', cHighDraft: 'Haute priorité — brouillons', cHighExpired: 'Haute priorité — expirées',
    cList: 'Annonces', cListUpcoming: 'Annonces à venir', cListViews: 'Annonces les plus consultées', cListHigh: 'Annonces haute priorité', cNoRecords: 'Aucun enregistrement pour cette carte.',
    cNote: 'Total, vues et importantes suivent la période sélectionnée (date d’activité). Planifiées affiche toutes les annonces à venir.',
  },
  de: {
    subtitle: 'Bleiben Sie mit den neuesten Updates, Neuigkeiten und wichtigen Mitteilungen auf dem Laufenden.',
    create: 'Ankündigung erstellen', allAnn: 'Alle Ankündigungen',
    tabAll: 'Alle', tabPublished: 'Veröffentlicht', tabScheduled: 'Geplant', tabDrafts: 'Entwürfe', tabExpired: 'Abgelaufen',
    search: 'Ankündigungen suchen...', allPriority: 'Alle Prioritäten', allCategories: 'Alle Typen', allAudiences: 'Alle Zielgruppen', allCreators: 'Alle Ersteller',
    clear: 'Alle zurücksetzen', clearN: 'Alle zurücksetzen ({n})',
    kTotal: 'Ankündigungen gesamt', kTotalSub: 'Im gewählten Zeitraum', kTotalTrend: '{n} veröffentlicht',
    kScheduled: 'Geplant', kScheduledSub: 'Anstehend (zeitraumunabhängig)', kScheduledTrend: '{n} im Zeitraum',
    kViews: 'Aufrufe gesamt', kViewsSub: 'Ankündigungen im Zeitraum', kViewsTrend: 'Ø {n}',
    kImportant: 'Wichtig', kImportantSub: 'Mitteilungen mit hoher Priorität', kImportantTrend: '{n} aktiv',
    ovTitle: 'Ankündigungsübersicht', ovTotal: 'Gesamt', actTitle: 'Veröffentlichungsaktivität', recentTitle: 'Neueste Ankündigungen', viewAll: 'Alle anzeigen',
    serLive: 'Veröffentlicht', serScheduled: 'Geplant', serDraft: 'Entwürfe', noPeriod: 'Keine Ankündigungen im gewählten Zeitraum',
    recentEmpty: 'Keine veröffentlichten Ankündigungen in diesem Zeitraum',
    colTitle: 'Titel', colType: 'Typ', colPriority: 'Priorität', colAudience: 'Zielgruppe', colStatus: 'Status', colDate: 'Datum', colActions: 'Aktionen',
    dPublished: 'Veröffentlicht', dScheduledFor: 'Geplant für', dCreated: 'Erstellt',
    showing: '{a} - {b} von {n} Ankündigungen', prev: 'Vorherige Seite', next: 'Nächste Seite',
    emptyPeriod: 'Keine Ankündigungen im gewählten Zeitraum.', emptyFilters: 'Keine Ankündigungen entsprechen Ihrer Suche und den Filtern.',
    'cat.system': 'System', 'cat.product': 'Produkt', 'cat.policy': 'Richtlinie', 'cat.general': 'Allgemein', 'cat.training': 'Schulung', 'cat.security': 'Sicherheit',
    'pri.high': 'Hoch', 'pri.medium': 'Mittel', 'pri.low': 'Niedrig',
    'st.published': 'Veröffentlicht', 'st.scheduled': 'Geplant', 'st.draft': 'Entwurf', 'st.expired': 'Abgelaufen',
    'aud.all': 'Alle', 'aud.customer_admins': 'Kundenadministratoren', 'aud.supervisors': 'Vorgesetzte', 'aud.guards': 'Sicherheitskräfte', 'aud.platform_staff': 'Plattform-Team',
    allCompanies: 'Alle Unternehmen',
    aView: 'Anzeigen', aEdit: 'Bearbeiten', aPublish: 'Jetzt veröffentlichen', aSchedule: 'Planen…', aCancelSched: 'Planung abbrechen', aExpire: 'Ablaufen lassen', aDelete: 'Löschen', moreActions: 'Weitere Aktionen',
    createTitle: 'Ankündigung erstellen', editTitle: 'Ankündigung bearbeiten',
    fTitle: 'Titel', fMessage: 'Nachricht', fCategory: 'Kategorie', fPriority: 'Priorität', fAudience: 'Zielgruppe', fCompany: 'Zielunternehmen', fStatus: 'Status',
    fPublishDate: 'Veröffentlichungsdatum', fScheduleDate: 'Geplantes Datum', fExpiry: 'Ablaufdatum (optional)', fDraftHint: 'Entwürfe haben kein Veröffentlichungsdatum. Wählen Sie Geplant oder Veröffentlicht, um eines festzulegen.',
    save: 'Erstellen', saveEdit: 'Änderungen speichern', cancel: 'Abbrechen',
    vTitle: 'Titel ist erforderlich.', vMessage: 'Nachricht ist erforderlich.', vPublish: 'Veröffentlichungsdatum ist erforderlich.', vSched: 'Geplantes Datum ist erforderlich.',
    vSchedFuture: 'Das geplante Datum muss nach heute liegen ({d}).', vPubFuture: 'Das Veröffentlichungsdatum darf nicht in der Zukunft liegen. Verwenden Sie stattdessen Geplant.',
    vExpiry: 'Das Ablaufdatum darf nicht vor dem Veröffentlichungsdatum liegen.', vExpiryPast: 'Das Ablaufdatum muss für eine aktive Ankündigung heute oder später sein.', vExpiredFuture: 'Eine abgelaufene Ankündigung kann kein Ablaufdatum in der Zukunft haben.',
    tFix: 'Bitte korrigieren Sie die markierten Felder.',
    tCreated: '{id} erstellt. Demodaten — nur für diese Sitzung gespeichert.', tUpdated: '{id} aktualisiert.', tPublished: '{id} veröffentlicht.', tCancelled: 'Planung abgebrochen — {id} wurde zum Entwurf.',
    tExpired: '{id} als abgelaufen markiert.', tDeleted: '{id} gelöscht.', tPublishFix: 'Passen Sie das Ablaufdatum an, bevor Sie {id} veröffentlichen.',
    delTitle: 'Ankündigung löschen?', delBody: '„{title}“ ({id}) wird für diese Sitzung aus den Demodaten entfernt. Dies kann nicht rückgängig gemacht werden.', delConfirm: 'Löschen',
    selPeriod: 'Gewählter Zeitraum', dId: 'Ankündigungs-ID', dMessage: 'Nachricht', dCategory: 'Kategorie', dPriority: 'Priorität', dAudience: 'Zielgruppe', dCompany: 'Zielunternehmen',
    dStatus: 'Status', dCreatedBy: 'Erstellt von', dCreatedOn: 'Erstellt', dPublishedOn: 'Veröffentlichungsdatum', dScheduledOn: 'Geplantes Datum', dExpiry: 'Ablaufdatum', dViews: 'Aufrufe', dHistory: 'Veröffentlichungsverlauf',
    none: '–',
    'h.created': 'Erstellt', 'h.scheduled': 'Geplant', 'h.published': 'Veröffentlicht', 'h.expired': 'Abgelaufen', 'h.edited': 'Bearbeitet', 'h.unscheduled': 'Planung abgebrochen', 'h.draft': 'Zum Entwurf geändert',
    sessionNote: 'Änderungen gelten nur für diese Browser-Sitzung — es wird nichts in einem Backend gespeichert.',
    cTotalCount: 'Ankündigungen im Zeitraum', cPublished: 'Veröffentlicht', cScheduled: 'Geplant', cDrafts: 'Entwürfe', cExpired: 'Abgelaufen', cHigh: 'Hohe Priorität', cViews: 'Aufrufe gesamt',
    cUpcoming: 'Anstehend (alle Zeiträume)', cInPeriod: 'Geplant im gewählten Zeitraum', cNext: 'Nächstes geplantes Datum', cByAudience: 'Zielgruppe: {a}',
    cAvgViews: 'Durchschnitt pro Ankündigung', cTopTitle: 'Am häufigsten aufgerufen', cMedium: 'Mittlere Priorität', cLow: 'Niedrige Priorität', cLive: 'Hohe Priorität — veröffentlicht', cHighSched: 'Hohe Priorität — geplant', cHighDraft: 'Hohe Priorität — Entwürfe', cHighExpired: 'Hohe Priorität — abgelaufen',
    cList: 'Ankündigungen', cListUpcoming: 'Anstehende Ankündigungen', cListViews: 'Meistgesehene Ankündigungen', cListHigh: 'Ankündigungen mit hoher Priorität', cNoRecords: 'Keine Datensätze für diese Karte.',
    cNote: 'Gesamt, Aufrufe und Wichtig folgen dem gewählten Zeitraum (Aktivitätsdatum). Geplant zeigt alle anstehenden Ankündigungen.',
  },
};