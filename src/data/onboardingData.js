/*
 * MEGSI Onboarding – mock data (local demo state only, no backend).
 * `checks` describes the security onboarding checklist for each application:
 *   registration · admin · documents · guards · insurance · plan · approval
 * values: done | pending | issue | na
 */
const CHECK_CODES = { d: 'done', p: 'pending', i: 'issue', n: 'na' };
const mk = codes => {
  const [registration, admin, documents, guards, insurance, plan, approval] =
    codes.split('').map(c => CHECK_CODES[c]);
  return { registration, admin, documents, guards, insurance, plan, approval };
};

/* Reference "today" for the demo dataset, and the review SLA used for the Overdue indicator. */
export const ONBOARDING_REFERENCE_DATE = '2026-10-23';
export const ONBOARDING_SLA_DAYS = 7;

export const ONBOARDING_CHECK_KEYS = [
  'registration', 'admin', 'documents', 'guards', 'insurance', 'plan', 'approval'
];

export const ONBOARDING_APPLICATIONS = [
  { id: 'MEG-1027', company: 'Frontline Guard Services', contact: 'Zoe Palmer', email: 'zoe.palmer@frontlineguard.co.uk', plan: 'Professional', submitted: '2026-10-18', stage: 'Plan Selection', status: 'In Progress', documents: 'Complete', phone: '+44 118 496 0135', region: 'Reading', guards: 64, checks: mk('dddddpp'), notes: 'Verification complete. Subscription plan confirmation is still pending.' },
  { id: 'MEG-1026', company: 'Guardian Shield Ltd', contact: 'Ethan Moore', email: 'ethan.moore@guardianshield.co.uk', plan: 'Business', submitted: '2026-10-17', stage: 'Company Verification', status: 'Pending Review', documents: 'Complete', phone: '+44 114 496 0163', region: 'Sheffield', guards: 126, checks: mk('ppdpppp'), notes: 'Documents received. Company registration needs to be verified.' },
  { id: 'MEG-1025', company: 'Garrison Security Solutions', contact: 'Hannah Cole', email: 'hannah.cole@garrisonsecurity.co.uk', plan: 'Starter', submitted: '2026-10-16', stage: 'Application Submitted', status: 'In Progress', documents: 'Under review', phone: '+44 115 496 0181', region: 'Nottingham', guards: 38, checks: mk('ppppppp'), notes: 'Application received. Company registration and contact details are being checked.' },
  { id: 'MEG-1024', company: 'NorthStar Security Ltd', contact: 'James Wilson', email: 'james.wilson@northstar.com', plan: 'Business', submitted: '2026-10-15', stage: 'Admin Approval', status: 'Pending Review', documents: 'Complete', phone: '+44 20 7946 0124', region: 'London', guards: 185, checks: mk('ddddddp'), notes: 'Company details verified. Awaiting final platform administrator approval.' },
  { id: 'MEG-1023', company: 'CityWatch Services', contact: 'Sarah Johnson', email: 'sarah.johnson@citywatch.com', plan: 'Professional', submitted: '2026-10-14', stage: 'Document Verification', status: 'Documents Pending', documents: 'Missing insurance certificate', phone: '+44 161 496 0182', region: 'Manchester', guards: 96, checks: mk('ddddipp'), notes: 'Insurance certificate is missing. Request an updated document from the applicant.' },
  { id: 'MEG-1022', company: 'ShieldForce UK', contact: 'Mark Thompson', email: 'mark.thompson@shieldforce.co.uk', plan: 'Starter', submitted: '2026-10-13', stage: 'Application Submitted', status: 'In Progress', documents: 'Under review', phone: '+44 121 496 0166', region: 'Birmingham', guards: 42, checks: mk('ppppppp'), notes: 'Application received. Company registration and contact details are being checked.' },
  { id: 'MEG-1021', company: 'PrimeGuard Security', contact: 'Emma Clarke', email: 'emma.clarke@primeguard.co.uk', plan: 'Enterprise', submitted: '2026-10-12', stage: 'Account Activated', status: 'Approved', documents: 'Complete', phone: '+44 113 496 0157', region: 'Leeds', guards: 420, checks: mk('ddddddd'), notes: 'All checks passed. Tenant account is active and ready for setup.' },
  { id: 'MEG-1020', company: 'Sentinel Protection Ltd', contact: 'Olivia Martin', email: 'olivia.martin@sentinelprotection.co.uk', plan: 'Professional', submitted: '2026-10-11', stage: 'Document Verification', status: 'Returned for Correction', documents: 'Proof of address required', phone: '+44 117 496 0191', region: 'Bristol', guards: 78, checks: mk('ddipppp'), notes: 'Proof of business address needs correction before verification can continue.' },
  { id: 'MEG-1019', company: 'Harbour Security Group', contact: 'Daniel Reed', email: 'daniel.reed@harboursecurity.co.uk', plan: 'Business', submitted: '2026-10-10', stage: 'Company Verification', status: 'Pending Review', documents: 'Complete', phone: '+44 191 496 0138', region: 'Newcastle', guards: 132, checks: mk('ppdpppp'), notes: 'Submitted documents are complete and waiting for company verification.' },
  { id: 'MEG-1018', company: 'Apex Guarding Ltd', contact: 'Priya Shah', email: 'priya.shah@apexguarding.co.uk', plan: 'Professional', submitted: '2026-10-09', stage: 'Plan Selection', status: 'In Progress', documents: 'Complete', phone: '+44 141 496 0142', region: 'Glasgow', guards: 110, checks: mk('dddddpp'), notes: 'Company has selected a plan. Subscription setup is in progress.' },
  { id: 'MEG-1017', company: 'Vanguard Patrol UK', contact: 'Tom Hughes', email: 'tom.hughes@vanguardpatrol.co.uk', plan: 'Starter', submitted: '2026-10-08', stage: 'Admin Approval', status: 'Pending Review', documents: 'Complete', phone: '+44 29 496 0173', region: 'Cardiff', guards: 35, checks: mk('ddddddp'), notes: 'Final approval is required before the account can be activated.' },
  { id: 'MEG-1016', company: 'Citadel Security Services', contact: 'Rachel Green', email: 'rachel.green@citadelservices.co.uk', plan: 'Business', submitted: '2026-10-07', stage: 'Account Activated', status: 'Approved', documents: 'Complete', phone: '+44 131 496 0188', region: 'Edinburgh', guards: 205, checks: mk('ddddddd'), notes: 'Tenant has completed onboarding and can now configure guard teams and sites.' },
  { id: 'MEG-1015', company: 'OldGuard Security', contact: 'Henry Ford', email: 'henry.ford@oldguard.co.uk', plan: 'Starter', submitted: '2026-10-06', stage: 'Document Verification', status: 'Rejected', documents: 'Registration details do not match', phone: '+44 20 7946 0199', region: 'London', guards: 24, checks: mk('ipppppp'), notes: 'Application rejected because submitted company registration details could not be verified.' },
  { id: 'MEG-1014', company: 'BlueLine Protection', contact: 'Lucy Adams', email: 'lucy.adams@bluelineprotection.co.uk', plan: 'Enterprise', submitted: '2026-10-05', stage: 'Document Verification', status: 'Documents Pending', documents: 'Insurance and licence missing', phone: '+44 151 496 0114', region: 'Liverpool', guards: 350, checks: mk('ddipipp'), notes: 'Please upload valid insurance and security provider licence documents.' },
  { id: 'MEG-1013', company: 'IronGate Patrol Services', contact: 'Noah Evans', email: 'noah.evans@irongate.co.uk', plan: 'Professional', submitted: '2026-10-04', stage: 'Document Verification', status: 'Pending Review', documents: 'Guard licences awaiting verification', phone: '+44 117 496 0120', region: 'Bristol', guards: 88, checks: mk('dddpdpp'), notes: 'Company documents verified. Security guard licences have been uploaded and need checking.' },
  { id: 'MEG-1012', company: 'Beacon Protection UK', contact: 'Mia Turner', email: 'mia.turner@beaconprotection.co.uk', plan: 'Business', submitted: '2026-10-03', stage: 'Admin Approval', status: 'Pending Review', documents: 'Complete', phone: '+44 20 7946 0108', region: 'London', guards: 164, checks: mk('ddddddp'), notes: 'Ready for final admin approval.' },
  { id: 'MEG-1011', company: 'WestGate Security', contact: 'Oliver Brown', email: 'oliver.brown@westgate.co.uk', plan: 'Starter', submitted: '2026-10-02', stage: 'Account Activated', status: 'Approved', documents: 'Complete', phone: '+44 121 496 0144', region: 'Birmingham', guards: 31, checks: mk('ddddddd'), notes: 'Account active. Welcome pack sent to the customer administrator.' },
  { id: 'MEG-1010', company: 'Crown Sentinel Ltd', contact: 'Amelia White', email: 'amelia.white@crownsentinel.co.uk', plan: 'Professional', submitted: '2026-10-01', stage: 'Document Verification', status: 'Returned for Correction', documents: 'Director ID needs clearer scan', phone: '+44 161 496 0177', region: 'Manchester', guards: 72, checks: mk('ddipppp'), notes: 'A clearer copy of the director identification document is required.' },
  { id: 'MEG-1009', company: 'Rapid Response Security', contact: 'George Hall', email: 'george.hall@rapidresponse.co.uk', plan: 'Business', submitted: '2026-09-28', stage: 'Plan Selection', status: 'In Progress', documents: 'Complete', phone: '+44 113 496 0192', region: 'Leeds', guards: 148, checks: mk('dddddpp'), notes: 'Subscription plan selected; account provisioning is pending.' },
];

export const ONBOARDING_STAGES = [
  'Application Submitted', 'Company Verification', 'Document Verification',
  'Plan Selection', 'Admin Approval', 'Account Activated'
];

/*
 * Activity feed. `type` is mapped to a title/tone in the component; `appId` links to ONBOARDING_APPLICATIONS.
 * Entries are newest first and every entry is dated on/after the application's submitted date.
 */
export const ONBOARDING_ACTIVITY = [
  { id: 'ACT-15', type: 'planSelected', appId: 'MEG-1027', company: 'Frontline Guard Services', at: '2026-10-18T15:20' },
  { id: 'ACT-14', type: 'submitted', appId: 'MEG-1027', company: 'Frontline Guard Services', at: '2026-10-18T09:05' },
  { id: 'ACT-13', type: 'submitted', appId: 'MEG-1026', company: 'Guardian Shield Ltd', at: '2026-10-17T11:10' },
  { id: 'ACT-12', type: 'submitted', appId: 'MEG-1025', company: 'Garrison Security Solutions', at: '2026-10-16T16:12' },
  { id: 'ACT-11', type: 'companyVerified', appId: 'MEG-1024', company: 'NorthStar Security Ltd', at: '2026-10-16T10:25' },
  { id: 'ACT-10', type: 'documentUploaded', appId: 'MEG-1023', company: 'CityWatch Services', at: '2026-10-15T13:48' },
  { id: 'ACT-09', type: 'insuranceRequested', appId: 'MEG-1023', company: 'CityWatch Services', at: '2026-10-14T17:30' },
  { id: 'ACT-08', type: 'activated', appId: 'MEG-1021', company: 'PrimeGuard Security', at: '2026-10-14T09:15' },
  { id: 'ACT-07', type: 'correctionRequested', appId: 'MEG-1020', company: 'Sentinel Protection Ltd', at: '2026-10-13T15:02' },
  { id: 'ACT-06', type: 'licenceUploaded', appId: 'MEG-1013', company: 'IronGate Patrol Services', at: '2026-10-13T11:40' },
  { id: 'ACT-05', type: 'documentUploaded', appId: 'MEG-1019', company: 'Harbour Security Group', at: '2026-10-12T16:55' },
  { id: 'ACT-04', type: 'correctionRequested', appId: 'MEG-1010', company: 'Crown Sentinel Ltd', at: '2026-10-10T14:30' },
  { id: 'ACT-03', type: 'activated', appId: 'MEG-1016', company: 'Citadel Security Services', at: '2026-10-09T09:50' },
  { id: 'ACT-02', type: 'rejected', appId: 'MEG-1015', company: 'OldGuard Security', at: '2026-10-08T12:20' },
  { id: 'ACT-01', type: 'activated', appId: 'MEG-1011', company: 'WestGate Security', at: '2026-10-07T16:45' },
];