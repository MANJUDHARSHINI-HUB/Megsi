import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, AlertCircle, CalendarDays, Check, CheckCircle2, ChevronDown,
  ChevronLeft, ChevronRight, CircleAlert, ClipboardCheck, Clock, Download,
  Eye, FileText, Grid2X2, Mail, Phone, Search, Settings2, ShieldCheck,
  UserRound, Users, X, XCircle, Building2
} from 'lucide-react';

import DateRangeMenu from '../components/DateRangeMenu.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import {
  ONBOARDING_APPLICATIONS,
  ONBOARDING_ACTIVITY,
  ONBOARDING_STAGES,
  ONBOARDING_CHECK_KEYS,
  ONBOARDING_REFERENCE_DATE,
  ONBOARDING_SLA_DAYS
} from '../data/onboardingData.js';

import './onboarding.css';

/*
 * Local Onboarding translations.
 * The shared translations.js and I18nContext.jsx remain unchanged.
 */
const ONB_TEXT = {
  en: {
    title: 'Onboarding',
    description: 'Track new tenant registrations, verify company information, and manage onboarding progress across the MEGSI platform.',
    dateFilter: 'Date Filter',
    selectDateRange: 'Select onboarding date range',
    exportReport: 'Export Report',
    configure: 'Configure Onboarding',

    totalApplications: 'Total Applications',
    allTenantApplications: 'All tenant onboarding applications',
    pendingReview: 'Pending Review',
    awaitingVerification: 'Applications awaiting admin verification',
    documentsPending: 'Documents Pending',
    incompleteDocuments: 'Companies with missing or incomplete documents',
    approvedPeriod: 'Approved This Period',
    approvedPeriodDescription: 'Applications approved in the selected period',
    rejectedReturned: 'Rejected / Returned',
    rejectedReturnedDescription: 'Applications rejected or returned for corrections',

    progressOverview: 'Onboarding Progress Overview',
    stageDetails: 'Stage details',
    selectStageHint: 'Select a stage to filter the applications below.',
    applications: 'Onboarding Applications',
    approveSelected: 'Approve selected',
    searchPlaceholder: 'Search ID, company, contact or email',
    allStatuses: 'All Statuses',
    allPlans: 'All Plans',
    allStages: 'All Stages',
    filterStatus: 'Filter by status',
    filterPlan: 'Filter by subscription plan',
    filterStage: 'Filter by stage',
    resetFilters: 'Reset Filters',
    selectedApplications: 'application(s) selected. Bulk approve will mark them as approved and activate their demo tenant accounts.',
    applicationId: 'Application ID',
    companyName: 'Company Name',
    contactPerson: 'Contact Person',
    emailAddress: 'Email Address',
    selectedPlan: 'Selected Plan',
    submittedDate: 'Submitted Date',
    currentStage: 'Current Stage',
    status: 'Status',
    actions: 'Actions',
    viewApplication: 'View application details',
    approveApplication: 'Approve application',
    moreActions: 'More actions',
    noApplications: 'No applications match these filters.',
    clearFilters: 'Clear filters',
    showing: 'Showing',
    of: 'of',
    applicationsLower: 'applications',
    previousPage: 'Previous page',
    nextPage: 'Next page',

    recentActivity: 'Recent Onboarding Activity',
    showLess: 'Show less',
    viewAllActivity: 'View all activity',
    showLessActivity: 'Show less activity',
    pendingActions: 'Pending Actions',
    reviewAwaitingApproval: 'Review application awaiting approval',
    verifyDocuments: 'Verify company registration documents',
    checkCorrections: 'Check returned application corrections',
    review: 'Review',
    viewAllActions: 'View all',
    noPendingActions: 'No pending actions for this date range.',

    securityChecklist: 'Security onboarding checklist',
    checklistDescription: 'Verify registration, insurance, security licence, and customer administrator details before activation.',
    openChecklist: 'Open checklist',

    configurationIntro: 'Choose the checks and approval rules used for new security-provider tenants.',
    requireInsurance: 'Require insurance document',
    insuranceDescription: 'Require valid public liability insurance before approval.',
    requireLicence: 'Require security licence',
    licenceDescription: 'Request the applicable provider or company licence.',
    emailReminders: 'Send onboarding email reminders',
    emailDescription: 'Demo setting for missing documents and review reminders.',
    approvalWorkflow: 'Approval workflow',
    manualApproval: 'Manual approval',
    twoStepApproval: 'Two-step approval',
    autoApprove: 'Auto-approve after verification',
    cancel: 'Cancel',
    saveConfiguration: 'Save configuration',

    dateRangeHelp: 'Use the date filter at the top of the page to select a preset or custom date range.',
    gotIt: 'Got it',
    allApplications: 'All Applications',
    stageDetailsTitle: 'Onboarding Stage Details',
    checklistTitle: 'Security Onboarding Checklist',
    applicationDetails: 'Application Details',
    totalsDescription: 'Application totals for the selected date range.',
    total: 'Total applications',
    stageApplications: 'applications',
    chooseAction: 'Choose an action for',
    activateTenant: 'Approve and activate tenant',
    returnCorrections: 'Return for corrections',
    rejectApplication: 'Reject application',
    activityLabel: 'Activity',
    dateLabel: 'Date',

    companyLabel: 'Company name',
    phoneLabel: 'Phone',
    regionLabel: 'Region',
    subscriptionPlan: 'Subscription plan',
    guardWorkforce: 'Estimated guard workforce',
    documentsLabel: 'Documents',
    reviewerNotes: 'Reviewer notes',
    guards: 'guards',
    close: 'Close',
    returnCorrection: 'Return for correction',
    approveActivate: 'Approve & activate',

    checklistIntro: 'Use this checklist before activating a security provider tenant.',
    registrationVerified: 'Company registration details verified',
    identityChecked: 'Director / customer admin identity checked',
    insuranceValid: 'Insurance document valid',
    licenceChecked: 'Security licence checked',
    permissionsConfirmed: 'Subscription plan and tenant permissions confirmed',
    checksCompleted: 'checks completed',

    updatedTo: 'updated to',
    reportExported: 'Onboarding report exported.',
    selectApplicationFirst: 'Select at least one application first.',
    selectedApproved: 'selected application(s) approved.',
    configurationSaved: 'Onboarding configuration saved for this demo session.',
    all: 'All',
    filter: 'Filter'
  },

  fr: {
    title: 'Intégration',
    description: 'Suivez les nouvelles inscriptions des locataires, vérifiez les informations des entreprises et gérez leur progression sur la plateforme MEGSI.',
    dateFilter: 'Filtrer par date',
    selectDateRange: 'Sélectionner la période d’intégration',
    exportReport: 'Exporter le rapport',
    configure: 'Configurer l’intégration',

    totalApplications: 'Total des demandes',
    allTenantApplications: 'Toutes les demandes d’intégration des locataires',
    pendingReview: 'En attente de vérification',
    awaitingVerification: 'Demandes en attente de vérification par un administrateur',
    documentsPending: 'Documents en attente',
    incompleteDocuments: 'Entreprises avec des documents manquants ou incomplets',
    approvedPeriod: 'Approuvées pendant la période',
    approvedPeriodDescription: 'Demandes approuvées pendant la période sélectionnée',
    rejectedReturned: 'Rejetées / Retournées',
    rejectedReturnedDescription: 'Demandes rejetées ou retournées pour correction',

    progressOverview: 'Vue d’ensemble de la progression',
    stageDetails: 'Détails des étapes',
    selectStageHint: 'Sélectionnez une étape pour filtrer les demandes ci-dessous.',
    applications: 'Demandes d’intégration',
    approveSelected: 'Approuver la sélection',
    searchPlaceholder: 'Rechercher un ID, une entreprise, un contact ou un e-mail',
    allStatuses: 'Tous les statuts',
    allPlans: 'Tous les forfaits',
    allStages: 'Toutes les étapes',
    filterStatus: 'Filtrer par statut',
    filterPlan: 'Filtrer par forfait',
    filterStage: 'Filtrer par étape',
    resetFilters: 'Réinitialiser les filtres',
    selectedApplications: 'demande(s) sélectionnée(s). L’approbation groupée activera les comptes de démonstration.',
    applicationId: 'ID de demande',
    companyName: 'Nom de l’entreprise',
    contactPerson: 'Personne à contacter',
    emailAddress: 'Adresse e-mail',
    selectedPlan: 'Forfait choisi',
    submittedDate: 'Date de soumission',
    currentStage: 'Étape actuelle',
    status: 'Statut',
    actions: 'Actions',
    viewApplication: 'Voir les détails de la demande',
    approveApplication: 'Approuver la demande',
    moreActions: 'Plus d’actions',
    noApplications: 'Aucune demande ne correspond à ces filtres.',
    clearFilters: 'Effacer les filtres',
    showing: 'Affichage',
    of: 'sur',
    applicationsLower: 'demandes',
    previousPage: 'Page précédente',
    nextPage: 'Page suivante',

    recentActivity: 'Activité récente',
    showLess: 'Afficher moins',
    viewAllActivity: 'Voir toute l’activité',
    showLessActivity: 'Afficher moins d’activité',
    pendingActions: 'Actions en attente',
    reviewAwaitingApproval: 'Examiner la demande en attente d’approbation',
    verifyDocuments: 'Vérifier les documents d’enregistrement',
    checkCorrections: 'Vérifier les corrections demandées',
    review: 'Examiner',
    viewAllActions: 'Voir les',
    noPendingActions: 'Aucune action en attente pour cette période.',

    securityChecklist: 'Liste de contrôle de sécurité',
    checklistDescription: 'Vérifiez l’enregistrement, l’assurance, la licence et les informations de l’administrateur avant l’activation.',
    openChecklist: 'Ouvrir la liste',

    configurationIntro: 'Choisissez les contrôles et les règles d’approbation pour les nouveaux prestataires de sécurité.',
    requireInsurance: 'Exiger un document d’assurance',
    insuranceDescription: 'Exiger une assurance responsabilité civile valide avant l’approbation.',
    requireLicence: 'Exiger une licence de sécurité',
    licenceDescription: 'Demander la licence applicable au prestataire ou à l’entreprise.',
    emailReminders: 'Envoyer des rappels par e-mail',
    emailDescription: 'Paramètre de démonstration pour les documents manquants et les rappels.',
    approvalWorkflow: 'Processus d’approbation',
    manualApproval: 'Approbation manuelle',
    twoStepApproval: 'Approbation en deux étapes',
    autoApprove: 'Approbation automatique après vérification',
    cancel: 'Annuler',
    saveConfiguration: 'Enregistrer la configuration',

    dateRangeHelp: 'Utilisez le filtre de date en haut de la page pour choisir une période prédéfinie ou personnalisée.',
    gotIt: 'Compris',
    allApplications: 'Toutes les demandes',
    stageDetailsTitle: 'Détails des étapes d’intégration',
    checklistTitle: 'Liste de contrôle de sécurité',
    applicationDetails: 'Détails de la demande',
    totalsDescription: 'Totaux des demandes pour la période sélectionnée.',
    total: 'Total des demandes',
    stageApplications: 'demandes',
    chooseAction: 'Choisissez une action pour',
    activateTenant: 'Approuver et activer le locataire',
    returnCorrections: 'Renvoyer pour correction',
    rejectApplication: 'Rejeter la demande',
    activityLabel: 'Activité',
    dateLabel: 'Date',

    companyLabel: 'Nom de l’entreprise',
    phoneLabel: 'Téléphone',
    regionLabel: 'Région',
    subscriptionPlan: 'Forfait d’abonnement',
    guardWorkforce: 'Effectif estimé des agents',
    documentsLabel: 'Documents',
    reviewerNotes: 'Notes du réviseur',
    guards: 'agents',
    close: 'Fermer',
    returnCorrection: 'Renvoyer pour correction',
    approveActivate: 'Approuver et activer',

    checklistIntro: 'Utilisez cette liste avant d’activer un prestataire de sécurité.',
    registrationVerified: 'Informations d’enregistrement vérifiées',
    identityChecked: 'Identité du directeur ou de l’administrateur vérifiée',
    insuranceValid: 'Document d’assurance valide',
    licenceChecked: 'Licence de sécurité vérifiée',
    permissionsConfirmed: 'Forfait et autorisations du locataire confirmés',
    checksCompleted: 'contrôles terminés',

    updatedTo: 'mis à jour vers',
    reportExported: 'Rapport d’intégration exporté.',
    selectApplicationFirst: 'Sélectionnez d’abord au moins une demande.',
    selectedApproved: 'demande(s) sélectionnée(s) approuvée(s).',
    configurationSaved: 'Configuration enregistrée pour cette session de démonstration.',
    all: 'Tous',
    filter: 'Filtre'
  },

  de: {
    title: 'Onboarding',
    description: 'Verfolgen Sie neue Mandantenregistrierungen, überprüfen Sie Unternehmensdaten und verwalten Sie den Onboarding-Fortschritt auf der MEGSI-Plattform.',
    dateFilter: 'Datumsfilter',
    selectDateRange: 'Onboarding-Zeitraum auswählen',
    exportReport: 'Bericht exportieren',
    configure: 'Onboarding konfigurieren',

    totalApplications: 'Anträge insgesamt',
    allTenantApplications: 'Alle Onboarding-Anträge der Mandanten',
    pendingReview: 'Ausstehende Prüfung',
    awaitingVerification: 'Anträge warten auf die Überprüfung durch einen Administrator',
    documentsPending: 'Ausstehende Dokumente',
    incompleteDocuments: 'Unternehmen mit fehlenden oder unvollständigen Dokumenten',
    approvedPeriod: 'Im Zeitraum genehmigt',
    approvedPeriodDescription: 'Im ausgewählten Zeitraum genehmigte Anträge',
    rejectedReturned: 'Abgelehnt / Zurückgesendet',
    rejectedReturnedDescription: 'Abgelehnte oder zur Korrektur zurückgesendete Anträge',

    progressOverview: 'Übersicht des Onboarding-Fortschritts',
    stageDetails: 'Schrittdetails',
    selectStageHint: 'Wählen Sie einen Schritt aus, um die Anträge zu filtern.',
    applications: 'Onboarding-Anträge',
    approveSelected: 'Ausgewählte genehmigen',
    searchPlaceholder: 'ID, Unternehmen, Kontakt oder E-Mail suchen',
    allStatuses: 'Alle Status',
    allPlans: 'Alle Tarife',
    allStages: 'Alle Schritte',
    filterStatus: 'Nach Status filtern',
    filterPlan: 'Nach Abonnement filtern',
    filterStage: 'Nach Schritt filtern',
    resetFilters: 'Filter zurücksetzen',
    selectedApplications: 'Antrag/Anträge ausgewählt. Die Sammelgenehmigung aktiviert die Demo-Mandantenkonten.',
    applicationId: 'Antrags-ID',
    companyName: 'Unternehmensname',
    contactPerson: 'Kontaktperson',
    emailAddress: 'E-Mail-Adresse',
    selectedPlan: 'Gewählter Tarif',
    submittedDate: 'Eingereicht am',
    currentStage: 'Aktueller Schritt',
    status: 'Status',
    actions: 'Aktionen',
    viewApplication: 'Antragsdetails anzeigen',
    approveApplication: 'Antrag genehmigen',
    moreActions: 'Weitere Aktionen',
    noApplications: 'Keine Anträge entsprechen diesen Filtern.',
    clearFilters: 'Filter löschen',
    showing: 'Angezeigt',
    of: 'von',
    applicationsLower: 'Anträgen',
    previousPage: 'Vorherige Seite',
    nextPage: 'Nächste Seite',

    recentActivity: 'Letzte Onboarding-Aktivitäten',
    showLess: 'Weniger anzeigen',
    viewAllActivity: 'Alle Aktivitäten anzeigen',
    showLessActivity: 'Weniger Aktivitäten anzeigen',
    pendingActions: 'Ausstehende Aktionen',
    reviewAwaitingApproval: 'Auf Genehmigung wartenden Antrag prüfen',
    verifyDocuments: 'Unternehmensregistrierungsdokumente prüfen',
    checkCorrections: 'Zurückgesendete Korrekturen prüfen',
    review: 'Prüfen',
    viewAllActions: 'Alle anzeigen',
    noPendingActions: 'Keine ausstehenden Aktionen für diesen Zeitraum.',

    securityChecklist: 'Sicherheits-Onboarding-Checkliste',
    checklistDescription: 'Prüfen Sie Registrierung, Versicherung, Sicherheitslizenz und Administratorinformationen vor der Aktivierung.',
    openChecklist: 'Checkliste öffnen',

    configurationIntro: 'Legen Sie Prüfungen und Genehmigungsregeln für neue Sicherheitsdienstleister fest.',
    requireInsurance: 'Versicherungsnachweis erforderlich',
    insuranceDescription: 'Vor der Genehmigung ist eine gültige Haftpflichtversicherung erforderlich.',
    requireLicence: 'Sicherheitslizenz erforderlich',
    licenceDescription: 'Fordern Sie die zutreffende Anbieter- oder Unternehmenslizenz an.',
    emailReminders: 'E-Mail-Erinnerungen senden',
    emailDescription: 'Demo-Einstellung für fehlende Dokumente und Prüfungserinnerungen.',
    approvalWorkflow: 'Genehmigungsprozess',
    manualApproval: 'Manuelle Genehmigung',
    twoStepApproval: 'Zweistufige Genehmigung',
    autoApprove: 'Nach Prüfung automatisch genehmigen',
    cancel: 'Abbrechen',
    saveConfiguration: 'Konfiguration speichern',

    dateRangeHelp: 'Wählen Sie oben einen voreingestellten oder benutzerdefinierten Zeitraum aus.',
    gotIt: 'Verstanden',
    allApplications: 'Alle Anträge',
    stageDetailsTitle: 'Details der Onboarding-Schritte',
    checklistTitle: 'Sicherheits-Onboarding-Checkliste',
    applicationDetails: 'Antragsdetails',
    totalsDescription: 'Antragszahlen für den ausgewählten Zeitraum.',
    total: 'Anträge insgesamt',
    stageApplications: 'Anträge',
    chooseAction: 'Aktion auswählen für',
    activateTenant: 'Genehmigen und Mandant aktivieren',
    returnCorrections: 'Zur Korrektur zurücksenden',
    rejectApplication: 'Antrag ablehnen',
    activityLabel: 'Aktivität',
    dateLabel: 'Datum',

    companyLabel: 'Unternehmensname',
    phoneLabel: 'Telefon',
    regionLabel: 'Region',
    subscriptionPlan: 'Abonnement',
    guardWorkforce: 'Geschätzte Anzahl Sicherheitskräfte',
    documentsLabel: 'Dokumente',
    reviewerNotes: 'Prüfernotizen',
    guards: 'Sicherheitskräfte',
    close: 'Schließen',
    returnCorrection: 'Zur Korrektur zurücksenden',
    approveActivate: 'Genehmigen und aktivieren',

    checklistIntro: 'Verwenden Sie diese Checkliste vor der Aktivierung eines Sicherheitsdienstleisters.',
    registrationVerified: 'Unternehmensregistrierung geprüft',
    identityChecked: 'Identität des Direktors oder Administrators geprüft',
    insuranceValid: 'Versicherungsnachweis gültig',
    licenceChecked: 'Sicherheitslizenz geprüft',
    permissionsConfirmed: 'Abonnement und Mandantenberechtigungen bestätigt',
    checksCompleted: 'Prüfungen abgeschlossen',

    updatedTo: 'aktualisiert auf',
    reportExported: 'Onboarding-Bericht exportiert.',
    selectApplicationFirst: 'Wählen Sie zuerst mindestens einen Antrag aus.',
    selectedApproved: 'ausgewählte Anträge genehmigt.',
    configurationSaved: 'Konfiguration für diese Demositzung gespeichert.',
    all: 'Alle',
    filter: 'Filter'
  }
};

/* Additional labels for the rebuilt layout. Merged into ONB_TEXT below; the shared translation files are untouched. */
const EXTRA_TEXT = {
  en: {
    quickFilters: 'Quick filters', qf_all: 'All', qf_pending: 'Pending review', qf_documents: 'Incomplete documents',
    qf_approved: 'Approved', qf_rejected: 'Rejected / returned', qf_approval: 'Awaiting approval',
    qf_overdue: 'Overdue (7+ days)', removeFilter: 'Remove filter',
    chk_registration: 'Company registration verification', chk_admin: 'Responsible administrator verification',
    chk_documents: 'Required company documents', chk_guards: 'Guard identity and licence verification',
    chk_insurance: 'Insurance verification', chk_plan: 'Subscription plan confirmation',
    chk_approval: 'Final approval and account activation',
    checklistHint: 'Select a check to list applications still waiting on it.',
    act_submitted: 'Application submitted', act_documentUploaded: 'Document uploaded', act_companyVerified: 'Company verified',
    act_licenceUploaded: 'Guard licences uploaded', act_insuranceRequested: 'Insurance certificate requested',
    act_correctionRequested: 'Correction requested', act_planSelected: 'Plan selected', act_approved: 'Application approved',
    act_activated: 'Account activated', act_rejected: 'Application rejected', act_stageAdvanced: 'Stage advanced',
    tag_blue: 'In progress', tag_green: 'Completed', tag_orange: 'Action needed', tag_red: 'Rejected',
    noActivity: 'No onboarding activity for this date range.', sessionBadge: 'This session',
    viewAll: 'View all', showLessItems: 'Show less',
    pa_verification: 'Company verification awaiting review', pa_documents: 'Missing or incomplete company documents',
    pa_licence: 'Guard licence verification required', pa_insurance: 'Insurance document needs attention',
    pa_plan: 'Subscription plan selection pending', pa_approval: 'Administrator approval pending',
    pa_returned: 'Returned for correction',
    reason_verification: 'Company registration and contact details need checking.',
    reason_documents: 'Required company documents are missing.',
    reason_licence: 'Security guard licences need verification.',
    reason_insurance: 'Insurance certificate needs verification.',
    reason_plan: 'Subscription plan selection is not yet confirmed.',
    reason_approval: 'All checks complete. Awaiting final administrator approval.',
    reason_returned: 'Application was returned for correction.',
    viewApplicationShort: 'View Application', continueReview: 'Continue Review', overdueTag: 'Overdue',
    guardsTitle: 'Security guard onboarding', guardsTotal: 'Guards across applications',
    guardsActive: 'On activated accounts', guardsPipeline: 'In onboarding pipeline',
    guardsAwaiting: 'Awaiting licence checks', guardsUnit: 'guards',
    bottleneck: 'Bottleneck', bottleneckHint: 'Most open applications', openLabel: 'open',
    verificationChecks: 'Verification checks', checkDone: 'Verified', checkPending: 'Pending',
    checkIssue: 'Issue', checkNa: 'Not required', verifyAdvance: 'Verify & advance',
    markDocsReceived: 'Documents received', movedTo: 'moved to', docsReceivedMsg: 'updated documents received and queued for verification.',
    sessionNote: 'Demo data: changes apply to this session only and are not saved to a backend.',
    bulkNone: 'None of the selected applications can be approved.', guardsHeader: 'Guards',
    stageRowsHint: 'applications', daysShort: 'days',
    shareOfTotal: 'Share of total applications', activatedAccounts: 'Activated accounts', dateRangeLabel: 'Date range',
    kpiPanelNote: 'Figures reflect applications submitted in the selected date range.',
    clearSearch: 'Clear search', clearStatus: 'Clear status filter', clearPlan: 'Clear plan filter',
    clearStage: 'Clear stage filter', filtersActive: 'active'
  },
  fr: {
    quickFilters: 'Filtres rapides', qf_all: 'Toutes', qf_pending: 'En attente de vérification', qf_documents: 'Documents incomplets',
    qf_approved: 'Approuvées', qf_rejected: 'Rejetées / retournées', qf_approval: 'En attente d’approbation',
    qf_overdue: 'En retard (7 jours+)', removeFilter: 'Retirer le filtre',
    chk_registration: 'Vérification de l’enregistrement', chk_admin: 'Vérification de l’administrateur responsable',
    chk_documents: 'Documents requis de l’entreprise', chk_guards: 'Identité et licence des agents',
    chk_insurance: 'Vérification de l’assurance', chk_plan: 'Confirmation du forfait',
    chk_approval: 'Approbation finale et activation du compte',
    checklistHint: 'Sélectionnez un contrôle pour lister les demandes concernées.',
    act_submitted: 'Demande soumise', act_documentUploaded: 'Document téléversé', act_companyVerified: 'Entreprise vérifiée',
    act_licenceUploaded: 'Licences des agents téléversées', act_insuranceRequested: 'Attestation d’assurance demandée',
    act_correctionRequested: 'Correction demandée', act_planSelected: 'Forfait choisi', act_approved: 'Demande approuvée',
    act_activated: 'Compte activé', act_rejected: 'Demande rejetée', act_stageAdvanced: 'Étape validée',
    tag_blue: 'En cours', tag_green: 'Terminé', tag_orange: 'Action requise', tag_red: 'Rejeté',
    noActivity: 'Aucune activité pour cette période.', sessionBadge: 'Cette session',
    viewAll: 'Tout voir', showLessItems: 'Afficher moins',
    pa_verification: 'Vérification de l’entreprise en attente', pa_documents: 'Documents d’entreprise manquants ou incomplets',
    pa_licence: 'Vérification des licences des agents requise', pa_insurance: 'Document d’assurance à traiter',
    pa_plan: 'Choix du forfait en attente', pa_approval: 'Approbation administrateur en attente',
    pa_returned: 'Retournée pour correction',
    reason_verification: 'L’enregistrement et les coordonnées de l’entreprise doivent être vérifiés.',
    reason_documents: 'Des documents requis sont manquants.',
    reason_licence: 'Les licences des agents doivent être vérifiées.',
    reason_insurance: 'L’attestation d’assurance doit être vérifiée.',
    reason_plan: 'Le choix du forfait n’est pas encore confirmé.',
    reason_approval: 'Tous les contrôles sont terminés. En attente de l’approbation finale.',
    reason_returned: 'La demande a été retournée pour correction.',
    viewApplicationShort: 'Voir la demande', continueReview: 'Poursuivre l’examen', overdueTag: 'En retard',
    guardsTitle: 'Intégration des agents de sécurité', guardsTotal: 'Agents dans les demandes',
    guardsActive: 'Sur des comptes activés', guardsPipeline: 'En cours d’intégration',
    guardsAwaiting: 'En attente de contrôle des licences', guardsUnit: 'agents',
    bottleneck: 'Goulot', bottleneckHint: 'Le plus de demandes ouvertes', openLabel: 'ouvertes',
    verificationChecks: 'Contrôles de vérification', checkDone: 'Vérifié', checkPending: 'En attente',
    checkIssue: 'Problème', checkNa: 'Non requis', verifyAdvance: 'Valider et avancer',
    markDocsReceived: 'Documents reçus', movedTo: 'passée à', docsReceivedMsg: 'documents mis à jour reçus et en attente de vérification.',
    sessionNote: 'Données de démonstration : les modifications ne valent que pour cette session.',
    bulkNone: 'Aucune des demandes sélectionnées ne peut être approuvée.', guardsHeader: 'Agents',
    stageRowsHint: 'demandes', daysShort: 'jours',
    shareOfTotal: 'Part du total des demandes', activatedAccounts: 'Comptes activés', dateRangeLabel: 'Période',
    kpiPanelNote: 'Les chiffres reflètent les demandes soumises pendant la période sélectionnée.',
    clearSearch: 'Effacer la recherche', clearStatus: 'Effacer le filtre de statut', clearPlan: 'Effacer le filtre de forfait',
    clearStage: 'Effacer le filtre d’étape', filtersActive: 'actifs'
  },
  de: {
    quickFilters: 'Schnellfilter', qf_all: 'Alle', qf_pending: 'Ausstehende Prüfung', qf_documents: 'Unvollständige Dokumente',
    qf_approved: 'Genehmigt', qf_rejected: 'Abgelehnt / zurückgesendet', qf_approval: 'Warten auf Genehmigung',
    qf_overdue: 'Überfällig (7+ Tage)', removeFilter: 'Filter entfernen',
    chk_registration: 'Prüfung der Unternehmensregistrierung', chk_admin: 'Prüfung des verantwortlichen Administrators',
    chk_documents: 'Erforderliche Unternehmensdokumente', chk_guards: 'Identität und Lizenz der Sicherheitskräfte',
    chk_insurance: 'Versicherungsprüfung', chk_plan: 'Tarifbestätigung',
    chk_approval: 'Endgültige Genehmigung und Kontoaktivierung',
    checklistHint: 'Wählen Sie eine Prüfung, um betroffene Anträge anzuzeigen.',
    act_submitted: 'Antrag eingereicht', act_documentUploaded: 'Dokument hochgeladen', act_companyVerified: 'Unternehmen geprüft',
    act_licenceUploaded: 'Lizenzen der Sicherheitskräfte hochgeladen', act_insuranceRequested: 'Versicherungsnachweis angefordert',
    act_correctionRequested: 'Korrektur angefordert', act_planSelected: 'Tarif gewählt', act_approved: 'Antrag genehmigt',
    act_activated: 'Konto aktiviert', act_rejected: 'Antrag abgelehnt', act_stageAdvanced: 'Schritt abgeschlossen',
    tag_blue: 'In Bearbeitung', tag_green: 'Abgeschlossen', tag_orange: 'Aktion erforderlich', tag_red: 'Abgelehnt',
    noActivity: 'Keine Aktivitäten für diesen Zeitraum.', sessionBadge: 'Diese Sitzung',
    viewAll: 'Alle anzeigen', showLessItems: 'Weniger anzeigen',
    pa_verification: 'Unternehmensprüfung wartet auf Review', pa_documents: 'Fehlende oder unvollständige Unternehmensdokumente',
    pa_licence: 'Lizenzprüfung der Sicherheitskräfte erforderlich', pa_insurance: 'Versicherungsdokument prüfen',
    pa_plan: 'Tarifauswahl ausstehend', pa_approval: 'Administratorfreigabe ausstehend',
    pa_returned: 'Zur Korrektur zurückgesendet',
    reason_verification: 'Registrierung und Kontaktdaten des Unternehmens müssen geprüft werden.',
    reason_documents: 'Erforderliche Unternehmensdokumente fehlen.',
    reason_licence: 'Lizenzen der Sicherheitskräfte müssen geprüft werden.',
    reason_insurance: 'Der Versicherungsnachweis muss geprüft werden.',
    reason_plan: 'Die Tarifauswahl ist noch nicht bestätigt.',
    reason_approval: 'Alle Prüfungen abgeschlossen. Wartet auf die endgültige Freigabe.',
    reason_returned: 'Der Antrag wurde zur Korrektur zurückgesendet.',
    viewApplicationShort: 'Antrag ansehen', continueReview: 'Prüfung fortsetzen', overdueTag: 'Überfällig',
    guardsTitle: 'Onboarding der Sicherheitskräfte', guardsTotal: 'Sicherheitskräfte in Anträgen',
    guardsActive: 'Auf aktivierten Konten', guardsPipeline: 'Im Onboarding',
    guardsAwaiting: 'Warten auf Lizenzprüfung', guardsUnit: 'Sicherheitskräfte',
    bottleneck: 'Engpass', bottleneckHint: 'Meiste offene Anträge', openLabel: 'offen',
    verificationChecks: 'Prüfschritte', checkDone: 'Geprüft', checkPending: 'Ausstehend',
    checkIssue: 'Problem', checkNa: 'Nicht erforderlich', verifyAdvance: 'Prüfen & weiter',
    markDocsReceived: 'Dokumente erhalten', movedTo: 'wechselte zu', docsReceivedMsg: 'aktualisierte Dokumente erhalten und zur Prüfung vorgemerkt.',
    sessionNote: 'Demodaten: Änderungen gelten nur für diese Sitzung.',
    bulkNone: 'Keiner der ausgewählten Anträge kann genehmigt werden.', guardsHeader: 'Sicherheitskräfte',
    stageRowsHint: 'Anträge', daysShort: 'Tage',
    shareOfTotal: 'Anteil an allen Anträgen', activatedAccounts: 'Aktivierte Konten', dateRangeLabel: 'Zeitraum',
    kpiPanelNote: 'Die Zahlen beziehen sich auf Anträge im ausgewählten Zeitraum.',
    clearSearch: 'Suche löschen', clearStatus: 'Statusfilter zurücksetzen', clearPlan: 'Tarifilter zurücksetzen',
    clearStage: 'Schrittfilter zurücksetzen', filtersActive: 'aktiv'
  }
};

const TEXT = {
  en: { ...ONB_TEXT.en, ...EXTRA_TEXT.en },
  fr: { ...ONB_TEXT.fr, ...EXTRA_TEXT.fr },
  de: { ...ONB_TEXT.de, ...EXTRA_TEXT.de }
};

const statusClass = value => ({
  'Pending Review': 'pending',
  'Documents Pending': 'documents',
  'In Progress': 'progress',
  Approved: 'approved',
  'Returned for Correction': 'returned',
  Rejected: 'rejected'
}[value] || 'progress');

const localeFor = lang => ({ en: 'en-GB', fr: 'fr-FR', de: 'de-DE' }[lang] || 'en-GB');

const dateText = (value, lang = 'en') =>
  new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString(localeFor(lang), {
    day: '2-digit', month: 'short', year: 'numeric'
  });

const timeText = (value, lang = 'en') =>
  new Date(value).toLocaleTimeString(localeFor(lang), { hour: '2-digit', minute: '2-digit' });

const within = (date, range) =>
  !range || ((!range.start || date >= range.start) && (!range.end || date <= range.end));

/* ---------- workflow helpers ---------- */
const CLOSED = ['Approved', 'Rejected'];
const isOpen = app => !CLOSED.includes(app.status);
const needsWork = value => value === 'pending' || value === 'issue';
const ageDays = date =>
  Math.floor((new Date(`${ONBOARDING_REFERENCE_DATE}T12:00:00`) - new Date(`${date}T12:00:00`)) / 86400000);
const isOverdue = app => isOpen(app) && ageDays(app.submitted) > ONBOARDING_SLA_DAYS;

const BLOCKER_KIND = {
  registration: 'verification', admin: 'verification', documents: 'documents',
  guards: 'licence', insurance: 'insurance', plan: 'plan', approval: 'approval'
};

/* The next thing blocking an application, derived from its status + effective checks. */
const nextBlocker = app => {
  if (!isOpen(app)) return null;
  if (app.status === 'Returned for Correction') return 'returned';
  const key = ONBOARDING_CHECK_KEYS.find(k => needsWork(app.ec[k]));
  return key ? BLOCKER_KIND[key] : null;
};

const STAGE_CHECKS = {
  1: ['registration', 'admin'],
  2: ['documents', 'guards', 'insurance'],
  3: ['plan'],
  4: ['approval']
};

const canAdvance = app =>
  isOpen(app) &&
  ['Pending Review', 'In Progress'].includes(app.status) &&
  ONBOARDING_STAGES.indexOf(app.stage) < ONBOARDING_STAGES.length - 1;

/* Valid transitions only. Returns the updated application (never mutates). */
const transition = (app, kind) => {
  const checks = { ...app.checks };
  const last = ONBOARDING_STAGES[ONBOARDING_STAGES.length - 1];

  if (kind === 'approve') {
    if (!isOpen(app)) return app;
    ONBOARDING_CHECK_KEYS.forEach(k => { if (checks[k] !== 'na') checks[k] = 'done'; });
    return { ...app, checks, status: 'Approved', stage: last, documents: 'Complete' };
  }

  if (kind === 'reject') {
    return isOpen(app) ? { ...app, status: 'Rejected' } : app;
  }

  if (kind === 'return') {
    if (!isOpen(app) || app.status === 'Returned for Correction') return app;
    if (checks.documents !== 'na') checks.documents = 'issue';
    const keepText = !['Complete', 'Under review'].includes(app.documents);
    return {
      ...app, checks, status: 'Returned for Correction',
      documents: keepText ? app.documents : 'Correction requested by administrator'
    };
  }

  if (kind === 'docsReceived') {
    if (!['Documents Pending', 'Returned for Correction'].includes(app.status)) return app;
    ONBOARDING_CHECK_KEYS.forEach(k => {
      if (k === 'documents') checks[k] = 'done';
      else if (checks[k] === 'issue') checks[k] = 'pending';
    });
    return { ...app, checks, status: 'Pending Review', documents: 'Complete' };
  }

  if (kind === 'advance') {
    if (!canAdvance(app)) return app;
    const index = ONBOARDING_STAGES.indexOf(app.stage);
    const next = ONBOARDING_STAGES[index + 1];
    (STAGE_CHECKS[index] || []).forEach(k => { if (checks[k] !== 'na') checks[k] = 'done'; });
    if (next === last) ONBOARDING_CHECK_KEYS.forEach(k => { if (checks[k] !== 'na') checks[k] = 'done'; });
    return {
      ...app, checks, stage: next,
      status: next === last ? 'Approved' : next === 'Plan Selection' ? 'In Progress' : 'Pending Review',
      documents: index === 2 ? 'Complete' : app.documents
    };
  }
  return app;
};

const ACTIVITY_META = {
  submitted: { tone: 'blue' }, planSelected: { tone: 'blue' }, stageAdvanced: { tone: 'blue' },
  documentUploaded: { tone: 'green' }, companyVerified: { tone: 'green' }, licenceUploaded: { tone: 'green' },
  approved: { tone: 'green' }, activated: { tone: 'green' },
  insuranceRequested: { tone: 'orange' }, correctionRequested: { tone: 'orange' },
  rejected: { tone: 'red' }
};

const TRANSITION_LOG = {
  approve: 'approved', reject: 'rejected', return: 'correctionRequested',
  docsReceived: 'documentUploaded', advance: 'stageAdvanced'
};

const QUICK_CHIPS = ['all', 'approval', 'check:guards', 'overdue', 'documents'];

/* Filter defaults and option lists (same values the dropdowns always offered). */
const DEFAULT_STATUS = 'All Statuses';
const DEFAULT_PLAN = 'All Plans';
const DEFAULT_STAGE = 'All Stages';
const STATUS_OPTIONS = ['Pending Review', 'Documents Pending', 'In Progress', 'Approved', 'Returned for Correction', 'Rejected'];
const PLAN_OPTIONS = ['Starter', 'Professional', 'Business', 'Enterprise'];

const matchQuick = (app, quick) => {
  if (quick === 'all') return true;
  if (quick === 'pending') return app.status === 'Pending Review';
  if (quick === 'documents') return app.status === 'Documents Pending' || (isOpen(app) && app.documents !== 'Complete');
  if (quick === 'approved') return app.status === 'Approved';
  if (quick === 'rejected') return ['Rejected', 'Returned for Correction'].includes(app.status);
  if (quick === 'approval') return app.stage === 'Admin Approval' && app.status === 'Pending Review';
  if (quick === 'overdue') return isOverdue(app);
  if (quick.startsWith('check:')) return isOpen(app) && needsWork(app.ec[quick.slice(6)]);
  return true;
};

export default function Onboarding({ range, setRange, toast = () => {} }) {
  const { lang } = useI18n();
  const tx = key => TEXT[lang]?.[key] ?? TEXT.en[key] ?? key;

  const [applications, setApplications] = useState(ONBOARDING_APPLICATIONS);
  const [sessionLog, setSessionLog] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(DEFAULT_STATUS);
  const [plan, setPlan] = useState(DEFAULT_PLAN);
  const [stage, setStage] = useState(DEFAULT_STAGE);
  const [quick, setQuick] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [detail, setDetail] = useState(null); // { type, id?, activity? }
  const [kpiPanel, setKpiPanel] = useState(null); // key of the KPI card shown in the right-side details panel
  const [configureOpen, setConfigureOpen] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(true);
  const [showAllActions, setShowAllActions] = useState(true);
  const tableRef = useRef(null);
  const kpisRef = useRef(null);
  const lastKpi = useRef(null);
  const drawerCloseRef = useRef(null);
  const searchRef = useRef(null);
  const statusRef = useRef(null);
  const planRef = useRef(null);
  const stageRef = useRef(null);

  const [config, setConfig] = useState({
    autoEmail: true, requireInsurance: true, requireLicence: true, approval: 'Manual approval'
  });
  const [configDraft, setConfigDraft] = useState(config);

  const [localRange, setLocalRange] = useState(range || { start: '2026-10-01', end: '2026-10-31' });
  const activeRange = range || localRange;

  useEffect(() => {
    if (!detail && !configureOpen && !kpiPanel) return undefined;
    const onKey = e => {
      if (e.key === 'Escape') { setDetail(null); setConfigureOpen(false); setKpiPanel(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detail, configureOpen, kpiPanel]);

  /* Details panel focus: move focus into the panel when it opens, hand it back to the card when it closes. */
  useEffect(() => {
    if (kpiPanel) {
      lastKpi.current = kpiPanel;
      drawerCloseRef.current?.focus();
    } else if (lastKpi.current) {
      kpisRef.current?.querySelector(`[data-kpi="${lastKpi.current}"]`)?.focus();
      lastKpi.current = null;
    }
  }, [kpiPanel]);

  /* Effective checks honour the "Configure Onboarding" switches (insurance / licence requirements). */
  const enriched = useMemo(() => applications.map(app => ({
    ...app,
    ec: {
      ...app.checks,
      insurance: config.requireInsurance ? app.checks.insurance : 'na',
      guards: config.requireLicence ? app.checks.guards : 'na'
    }
  })), [applications, config.requireInsurance, config.requireLicence]);

  const inRange = useMemo(
    () => enriched.filter(app => within(app.submitted, activeRange)),
    [enriched, activeRange?.start, activeRange?.end]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return inRange.filter(app =>
      (!term || `${app.id} ${app.company} ${app.contact} ${app.email} ${app.phone} ${app.region}`
        .toLowerCase().includes(term)) &&
      (status === 'All Statuses' || app.status === status) &&
      (plan === 'All Plans' || app.plan === plan) &&
      (stage === 'All Stages' || app.stage === stage) &&
      matchQuick(app, quick)
    );
  }, [inRange, search, status, plan, stage, quick]);

  const countQuick = q => inRange.filter(app => matchQuick(app, q)).length;

  const counts = useMemo(() => ({
    total: inRange.length,
    pending: inRange.filter(a => matchQuick(a, 'pending')).length,
    documents: inRange.filter(a => matchQuick(a, 'documents')).length,
    approved: inRange.filter(a => matchQuick(a, 'approved')).length,
    rejected: inRange.filter(a => matchQuick(a, 'rejected')).length
  }), [inRange]);

  const stageCounts = useMemo(() => {
    const rows = ONBOARDING_STAGES.map((name, index) => ({
      name, step: index + 1,
      count: inRange.filter(app => app.stage === name).length,
      open: inRange.filter(app => app.stage === name && isOpen(app)).length
    }));
    const candidates = rows.slice(0, -1);
    const max = Math.max(0, ...candidates.map(r => r.open));
    const hot = max >= 2 ? candidates.find(r => r.open === max) : null;
    return { rows, hot };
  }, [inRange]);

  const pendingActions = useMemo(() => inRange
    .map(app => ({ app, kind: nextBlocker(app) }))
    .filter(item => item.kind)
    .sort((a, b) => a.app.submitted.localeCompare(b.app.submitted) || a.app.id.localeCompare(b.app.id)),
  [inRange]);

  const checklist = useMemo(() => {
    const items = ONBOARDING_CHECK_KEYS.map(key => {
      const scope = inRange.filter(a => a.status !== 'Rejected' && a.ec[key] !== 'na');
      return { key, total: scope.length, done: scope.filter(a => a.ec[key] === 'done').length };
    });
    const total = items.reduce((s, i) => s + i.total, 0);
    const done = items.reduce((s, i) => s + i.done, 0);
    return { items, total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [inRange]);

  const guardStats = useMemo(() => {
    const sum = list => list.reduce((s, a) => s + (Number(a.guards) || 0), 0);
    const total = sum(inRange);
    const active = sum(inRange.filter(a => a.stage === 'Account Activated' && a.status === 'Approved'));
    const pipeline = sum(inRange.filter(isOpen));
    const awaiting = sum(inRange.filter(a => isOpen(a) && needsWork(a.ec.guards)));
    return { total, active, pipeline, awaiting, other: Math.max(0, total - active - pipeline) };
  }, [inRange]);

  const activities = useMemo(() => {
    const seeded = ONBOARDING_ACTIVITY.filter(item => within(item.at.slice(0, 10), activeRange));
    return [...sessionLog, ...seeded].sort((a, b) => b.at.localeCompare(a.at));
  }, [sessionLog, activeRange?.start, activeRange?.end]);

  const pageSize = 8;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const filteredIds = useMemo(() => new Set(filtered.map(a => a.id)), [filtered]);
  const selectedInView = selected.filter(id => filteredIds.has(id));
  const approvableSelected = filtered.filter(a => selectedInView.includes(a.id) && isOpen(a));

  const detailApp = detail?.id ? enriched.find(a => a.id === detail.id) : null;
  const notify = message => toast(message);

  const scrollToTable = () => {
    if (typeof requestAnimationFrame !== 'function') return;
    requestAnimationFrame(() => tableRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }));
  };

  const clearFilters = () => {
    setSearch(''); setStatus(DEFAULT_STATUS); setPlan(DEFAULT_PLAN);
    setStage(DEFAULT_STAGE); setQuick('all'); setPage(1);
    searchRef.current?.focus({ preventScroll: true });
  };

  /* Clear a single filter without touching the others. */
  const clearSearch = () => { setSearch(''); setPage(1); searchRef.current?.focus({ preventScroll: true }); };
  const clearStatus = () => { setStatus(DEFAULT_STATUS); setPage(1); statusRef.current?.focus({ preventScroll: true }); };
  const clearPlan = () => { setPlan(DEFAULT_PLAN); setPage(1); planRef.current?.focus({ preventScroll: true }); };
  const clearStage = () => { setStage(DEFAULT_STAGE); setPage(1); stageRef.current?.focus({ preventScroll: true }); };

  const activeFilterCount =
    (search.trim() ? 1 : 0) + (status !== DEFAULT_STATUS ? 1 : 0) + (plan !== DEFAULT_PLAN ? 1 : 0) +
    (stage !== DEFAULT_STAGE ? 1 : 0) + (quick !== 'all' ? 1 : 0);

  /* KPI / checklist / quick-filter selection: one shared filter state, toggled on repeat click. */
  const applyQuick = (value, { fromTop = false } = {}) => {
    const next = value === quick && value !== 'all' ? 'all' : value;
    if (fromTop) { setSearch(''); setStatus('All Statuses'); setPlan('All Plans'); setStage('All Stages'); }
    setQuick(next);
    setPage(1);
    scrollToTable();
  };

  const showStage = stageName => {
    setStage(old => (old === stageName ? 'All Stages' : stageName));
    setPage(1);
    scrollToTable();
  };

  const logActivity = (app, type, note) => setSessionLog(old => [{
    id: `SES-${Date.now()}-${old.length}`, type, appId: app.id, company: app.company,
    at: new Date().toISOString(), session: true, note
  }, ...old]);

  const runTransition = (id, kind) => {
    const current = applications.find(a => a.id === id);
    if (!current) return;
    const next = transition({ ...current }, kind);
    if (next === current) return;
    setApplications(old => old.map(a => (a.id === id ? next : a)));
    logActivity(current, TRANSITION_LOG[kind], kind === 'advance' ? next.stage : undefined);
    if (kind === 'advance') notify(`${id} ${tx('movedTo')} ${next.stage}.`);
    else if (kind === 'docsReceived') notify(`${id}: ${tx('docsReceivedMsg')}`);
    else notify(`${id} ${tx('updatedTo')} ${next.status}.`);
  };

  const toggleSelected = id => setSelected(old =>
    old.includes(id) ? old.filter(x => x !== id) : [...old, id]);

  const exportReport = () => {
    const csvRows = [
      ['Application ID', 'Company Name', 'Contact Person', 'Email', 'Plan', 'Submitted Date',
        'Current Stage', 'Status', 'Documents', tx('guardsHeader')],
      ...filtered.map(a => [a.id, a.company, a.contact, a.email, a.plan, a.submitted,
        a.stage, a.status, a.documents, a.guards])
    ];
    const csv = csvRows
      .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'megsi-onboarding-report.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    notify(tx('reportExported'));
  };

  const bulkApprove = () => {
    if (!selectedInView.length) { notify(tx('selectApplicationFirst')); return; }
    if (!approvableSelected.length) { notify(tx('bulkNone')); return; }
    const ids = approvableSelected.map(a => a.id);
    setApplications(old => old.map(a => (ids.includes(a.id) ? transition({ ...a }, 'approve') : a)));
    setSessionLog(old => [
      ...approvableSelected.map((a, i) => ({
        id: `SES-${Date.now()}-b${i}`, type: 'approved', appId: a.id, company: a.company,
        at: new Date().toISOString(), session: true
      })),
      ...old
    ]);
    notify(`${ids.length} ${tx('selectedApproved')}`);
    setSelected(old => old.filter(id => !ids.includes(id)));
  };

  const openApplication = app => setDetail({ type: 'app', id: app.id });

  const openActivity = item => {
    if (applications.some(a => a.id === item.appId)) setDetail({ type: 'app', id: item.appId });
    else setDetail({ type: 'activity', activity: item });
  };

  const quickLabel = q => (q.startsWith('check:') ? tx(`chk_${q.slice(6)}`) : tx(`qf_${q}`));
  const chips = QUICK_CHIPS.includes(quick) ? QUICK_CHIPS : [...QUICK_CHIPS, quick];

  const shownActivities = showAllActivity ? activities : activities.slice(0, 6);
  const shownActions = showAllActions ? pendingActions : pendingActions.slice(0, 5);
  const actionButtonLabel = kind =>
    kind === 'returned' ? tx('viewApplicationShort') : kind === 'plan' ? tx('continueReview') : tx('review');

  /* Right-side details panel content for each KPI card, built from the same date-range data as the cards. */
  const kpiDetails = key => {
    const pct = n => `${counts.total ? Math.round((n / counts.total) * 100) : 0}%`;
    const by = (list, field, value) => list.filter(a => a[field] === value).length;
    const guardSum = list => list.reduce((sum, a) => sum + (Number(a.guards) || 0), 0);
    const planRows = list => PLAN_OPTIONS.map(p => [`${tx('subscriptionPlan')} · ${p}`, by(list, 'plan', p)]);
    const stageRows = list => ONBOARDING_STAGES.map(s => [`${tx('currentStage')} · ${s}`, by(list, 'stage', s)]);
    const rangeRow = [tx('dateRangeLabel'),
      activeRange?.start && activeRange?.end
        ? `${dateText(activeRange.start, lang)} – ${dateText(activeRange.end, lang)}`
        : tx('all')];

    if (key === 'pending') {
      const list = inRange.filter(a => matchQuick(a, 'pending'));
      return { title: tx('pendingReview'), rows: [
        [tx('pendingReview'), list.length], [tx('shareOfTotal'), pct(list.length)],
        [tx('qf_approval'), list.filter(a => matchQuick(a, 'approval')).length],
        [tx('qf_overdue'), list.filter(isOverdue).length],
        ...stageRows(list), rangeRow
      ] };
    }
    if (key === 'documents') {
      const list = inRange.filter(a => matchQuick(a, 'documents'));
      return { title: tx('documentsPending'), rows: [
        [tx('documentsPending'), list.length], [tx('shareOfTotal'), pct(list.length)],
        ...STATUS_OPTIONS.map(s => [`${tx('status')} · ${s}`, by(list, 'status', s)]).filter(([, n]) => n > 0),
        [tx('qf_overdue'), list.filter(isOverdue).length],
        rangeRow
      ] };
    }
    if (key === 'approved') {
      const list = inRange.filter(a => matchQuick(a, 'approved'));
      return { title: tx('approvedPeriod'), rows: [
        [tx('approvedPeriod'), list.length], [tx('shareOfTotal'), pct(list.length)],
        [tx('activatedAccounts'), list.filter(a => a.stage === 'Account Activated').length],
        [tx('guardsHeader'), guardSum(list).toLocaleString(localeFor(lang))],
        ...planRows(list), rangeRow
      ] };
    }
    if (key === 'rejected') {
      const list = inRange.filter(a => matchQuick(a, 'rejected'));
      return { title: tx('rejectedReturned'), rows: [
        [tx('rejectedReturned'), list.length], [tx('shareOfTotal'), pct(list.length)],
        ['Rejected', by(list, 'status', 'Rejected')],
        ['Returned for Correction', by(list, 'status', 'Returned for Correction')],
        ...planRows(list), rangeRow
      ] };
    }
    return { title: tx('totalApplications'), rows: [
      [tx('totalApplications'), counts.total],
      ...STATUS_OPTIONS.map(s => [s, by(inRange, 'status', s)]),
      [tx('qf_overdue'), inRange.filter(isOverdue).length],
      [tx('guardsTotal'), guardStats.total.toLocaleString(localeFor(lang))],
      rangeRow
    ] };
  };
  const kpiPanelData = kpiPanel ? kpiDetails(kpiPanel) : null;

  /* Clicking the dimmed overlay closes the panel, unless the click lands on a KPI card: then the panel switches to it. */
  const onDrawerBackdropClick = e => {
    const hit = typeof document.elementsFromPoint === 'function' && e.clientX + e.clientY > 0
      ? document.elementsFromPoint(e.clientX, e.clientY).find(node => node.dataset?.kpi)
      : null;
    setKpiPanel(hit ? hit.dataset.kpi : null);
  };

  const kpis = [
    { key: 'all', icon: <FileText />, tone: 'blue', label: tx('totalApplications'), value: counts.total, note: tx('allTenantApplications'), top: true },
    { key: 'pending', icon: <AlertCircle />, tone: 'amber', label: tx('pendingReview'), value: counts.pending, note: tx('awaitingVerification') },
    { key: 'documents', icon: <FileText />, tone: 'purple', label: tx('documentsPending'), value: counts.documents, note: tx('incompleteDocuments') },
    { key: 'approved', icon: <ShieldCheck />, tone: 'green', label: tx('approvedPeriod'), value: counts.approved, note: tx('approvedPeriodDescription') },
    { key: 'rejected', icon: <XCircle />, tone: 'red', label: tx('rejectedReturned'), value: counts.rejected, note: tx('rejectedReturnedDescription') }
  ];

  return (
    <main className="onb-page">
      <div className="onb-page-head">
        <div>
          <h1>{tx('title')}</h1>
          <p>{tx('description')}</p>
        </div>

        <div className="onb-head-actions">
          {range && setRange ? (
            <DateRangeMenu range={range} setRange={setRange} />
          ) : (
            <button
              className="onb-button"
              onClick={() => setDetail({ type: 'range', title: tx('selectDateRange') })}
            >
              <CalendarDays size={15} />
              {tx('dateFilter')}
              <ChevronDown size={13} />
            </button>
          )}

          <button className="onb-button" onClick={exportReport}>
            <Download size={15} />
            {tx('exportReport')}
          </button>

          <button
            className="onb-button primary-outline"
            onClick={() => { setConfigDraft(config); setConfigureOpen(true); }}
          >
            <Settings2 size={15} />
            {tx('configure')}
          </button>
        </div>
      </div>

      <div className="onb-body">
        <div className="onb-kpis" ref={kpisRef}>
          {kpis.map(item => {
            const active = kpiPanel === item.key;
            return (
              <button
                key={item.key}
                data-kpi={item.key}
                className={`onb-kpi ${active ? 'active' : ''}`}
                aria-haspopup="dialog"
                aria-expanded={active}
                aria-label={`${item.label}: ${item.value}`}
                onClick={() => setKpiPanel(item.key)}
              >
                <span className={`onb-kpi-icon ${item.tone}`}>{item.icon}</span>
                <span>
                  <small>{item.label}</small>
                  <b>{item.value}</b>
                  <em>{item.note}</em>
                </span>
              </button>
            );
          })}
        </div>

        <section className="onb-panel onb-progress-panel">
          <header className="onb-panel-head">
            <span className="onb-panel-symbol"><Grid2X2 size={16} /></span>
            <h2>{tx('progressOverview')}</h2>
            <span className="onb-grow" />
            <button
              className="onb-text-button"
              onClick={() => setDetail({ type: 'stages', title: tx('stageDetailsTitle') })}
            >
              {tx('stageDetails')}
            </button>
          </header>

          <div className="onb-stage-list">
            {stageCounts.rows.map((item, index) => (
              <button
                key={item.name}
                className={`onb-stage ${index === 5 ? 'last' : ''} ${stage === item.name ? 'active' : ''}`}
                aria-pressed={stage === item.name}
                onClick={() => showStage(item.name)}
                title={`${tx('filter')}: ${item.name}`}
              >
                <span className="onb-stage-number">{item.step}</span>
                <span className="onb-stage-name">{item.name}</span>
                <b>{item.count}</b>
                <span className="onb-stage-flag">
                  {stageCounts.hot?.name === item.name ? `▲ ${tx('bottleneck')}` : ''}
                </span>
              </button>
            ))}
          </div>

          <div className="onb-stage-foot">
            <span>{tx('selectStageHint')}</span>
            {stageCounts.hot && (
              <span className="onb-bottleneck">
                {tx('bottleneck')}: <b>{stageCounts.hot.name}</b> · {stageCounts.hot.open} {tx('openLabel')}
              </span>
            )}
          </div>
        </section>

        <div className="onb-support-grid">
          {/* Recent activity */}
          <section className="onb-panel onb-activity-panel">
            <header className="onb-panel-head">
              <span className="onb-panel-symbol"><Activity size={16} /></span>
              <h2>{tx('recentActivity')}</h2>
              <span className="onb-count-badge neutral">{activities.length}</span>
            </header>

            {shownActivities.length === 0 ? (
              <p className="onb-no-actions">{tx('noActivity')}</p>
            ) : (
              <ul className={`onb-timeline ${showAllActivity && activities.length > 7 ? 'scroll' : ''}`}>
                {shownActivities.map(item => {
                  const tone = ACTIVITY_META[item.type]?.tone || 'blue';
                  return (
                    <li key={item.id}>
                      <button className="onb-activity" onClick={() => openActivity(item)}>
                        <span className={`onb-timeline-dot ${tone}`}>
                          {tone === 'green' ? <Check size={9} /> : <span />}
                        </span>
                        <span className="onb-activity-copy">
                          <span className="onb-activity-top">
                            <b>{tx(`act_${item.type}`)}</b>
                            <span className={`onb-tag ${tone}`}>{tx(`tag_${tone}`)}</span>
                          </span>
                          <small>
                            {item.company}
                            {item.note ? ` · ${item.note}` : ''}
                          </small>
                          <em>
                            <Clock size={9} /> {dateText(item.at, lang)}, {timeText(item.at, lang)}
                            {item.session ? ` · ${tx('sessionBadge')}` : ''}
                          </em>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {activities.length > 6 && (
              <button className="onb-view-all" onClick={() => setShowAllActivity(v => !v)}>
                {showAllActivity ? tx('showLessActivity') : `${tx('viewAllActivity')} (${activities.length})`}
                <ChevronRight size={14} />
              </button>
            )}
          </section>

          {/* Pending actions */}
          <section className="onb-panel onb-pending-panel">
            <header className="onb-panel-head">
              <span className="onb-panel-symbol"><ClipboardCheck size={16} /></span>
              <h2>{tx('pendingActions')}</h2>
              <span className="onb-count-badge">{pendingActions.length}</span>
            </header>

            {pendingActions.length === 0 ? (
              <p className="onb-no-actions">{tx('noPendingActions')}</p>
            ) : (
              <ul className={`onb-action-list ${showAllActions && pendingActions.length > 6 ? 'scroll' : ''}`}>
                {shownActions.map(({ app, kind }) => {
                  const reasonFromData = !['Complete', 'Under review'].includes(app.documents)
                    && ['returned', 'documents', 'insurance', 'licence'].includes(kind);
                  return (
                    <li key={app.id}>
                      <div className="onb-pending-action">
                        <span className={`onb-action-icon ${['approval', 'plan', 'verification'].includes(kind) ? 'blue' : 'amber'}`}>
                          {kind === 'approval' ? <ShieldCheck size={15} />
                            : kind === 'licence' ? <Users size={15} />
                              : <FileText size={15} />}
                        </span>

                        <span className="onb-action-copy">
                          <b>{tx(`pa_${kind}`)}</b>
                          <small>
                            {app.company} · {app.id}
                            {isOverdue(app) && <span className="onb-overdue">{tx('overdueTag')}</span>}
                          </small>
                          <span className="onb-action-reason">
                            {reasonFromData ? app.documents : tx(`reason_${kind}`)}
                          </span>
                        </span>

                        <span className="onb-action-side">
                          <span className={`onb-status ${statusClass(app.status)}`}>{app.status}</span>
                          <button className="onb-review-tag" onClick={() => openApplication(app)}>
                            {actionButtonLabel(kind)} <ChevronRight size={12} />
                          </button>
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {pendingActions.length > 5 && (
              <button className="onb-view-all" onClick={() => setShowAllActions(v => !v)}>
                {showAllActions ? tx('showLessItems') : `${tx('viewAll')} (${pendingActions.length})`}
                <ChevronRight size={14} />
              </button>
            )}
          </section>

          {/* Compact checklist + guard summary */}
          <div className="onb-side-stack">
            <section className="onb-panel onb-checklist-panel">
              <header className="onb-panel-head">
                <span className="onb-panel-symbol"><ShieldCheck size={16} /></span>
                <h2>{tx('checklistTitle')}</h2>
              </header>

              <div className="onb-check-summary">
                <div className="onb-meter" role="progressbar" aria-valuenow={checklist.pct} aria-valuemin="0" aria-valuemax="100">
                  <span style={{ width: `${checklist.pct}%` }} />
                </div>
                <small>{checklist.done} {tx('of')} {checklist.total} {tx('checksCompleted')} · {checklist.pct}%</small>
              </div>

              <ul className="onb-checklist">
                {checklist.items.map(item => {
                  const complete = item.total > 0 && item.done === item.total;
                  const key = `check:${item.key}`;
                  return (
                    <li key={item.key}>
                      <button
                        className={`onb-check-item ${quick === key ? 'active' : ''}`}
                        onClick={() => applyQuick(key)}
                        aria-pressed={quick === key}
                        title={tx('checklistHint')}
                      >
                        <span className={`onb-check-icon ${complete ? 'ok' : 'wait'}`}>
                          {complete ? <Check size={10} /> : <span />}
                        </span>
                        <span className="onb-check-label">{tx(`chk_${item.key}`)}</span>
                        <span className="onb-check-count">{item.done}/{item.total}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="onb-panel onb-guard-panel">
              <header className="onb-panel-head">
                <span className="onb-panel-symbol"><Users size={16} /></span>
                <h2>{tx('guardsTitle')}</h2>
              </header>

              <div className="onb-guard-total">
                <b>{guardStats.total.toLocaleString(localeFor(lang))}</b>
                <small>{tx('guardsTotal')}</small>
              </div>

              <div className="onb-guard-bar" aria-hidden="true">
                <span className="g" style={{ flexGrow: guardStats.active }} />
                <span className="b" style={{ flexGrow: guardStats.pipeline }} />
                <span className="x" style={{ flexGrow: guardStats.other }} />
              </div>

              <ul className="onb-guard-rows">
                <li><i className="g" /><span>{tx('guardsActive')}</span><b>{guardStats.active.toLocaleString(localeFor(lang))}</b></li>
                <li><i className="b" /><span>{tx('guardsPipeline')}</span><b>{guardStats.pipeline.toLocaleString(localeFor(lang))}</b></li>
                <li>
                  <button onClick={() => applyQuick('check:guards')} className="onb-guard-link">
                    <i className="a" /><span>{tx('guardsAwaiting')}</span>
                    <b>{guardStats.awaiting.toLocaleString(localeFor(lang))}</b>
                  </button>
                </li>
              </ul>
            </section>
          </div>
        </div>

        <section className="onb-panel onb-applications-panel" ref={tableRef}>
          <header className="onb-panel-head">
            <span className="onb-panel-symbol"><FileText size={16} /></span>
            <h2>{tx('applications')}</h2>
            <span className="onb-grow" />

            {selectedInView.length > 0 && (
              <button className="onb-button small" onClick={bulkApprove}>
                <Check size={14} />
                {tx('approveSelected')} ({approvableSelected.length})
              </button>
            )}
          </header>

          <div className="onb-filters">
            <label className="onb-search">
              <Search size={15} />
              <input
                ref={searchRef}
                placeholder={tx('searchPlaceholder')}
                aria-label={tx('searchPlaceholder')}
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                onKeyDown={e => { if (e.key === 'Escape' && search) { e.preventDefault(); clearSearch(); } }}
              />
              {search && (
                <button type="button" className="onb-clear-x" onClick={clearSearch} aria-label={tx('clearSearch')} title={tx('clearSearch')}>
                  <X size={12} />
                </button>
              )}
            </label>

            <span className={`onb-select ${status !== DEFAULT_STATUS ? 'has-value' : ''}`}>
              <select
                ref={statusRef}
                value={status}
                onChange={e => { setStatus(e.target.value); setPage(1); }}
                aria-label={tx('filterStatus')}
              >
                <option value={DEFAULT_STATUS}>{tx('allStatuses')}</option>
                {STATUS_OPTIONS.map(x => <option key={x} value={x}>{x}</option>)}
              </select>
              {status !== DEFAULT_STATUS && (
                <button type="button" className="onb-clear-x" onClick={clearStatus} aria-label={tx('clearStatus')} title={tx('clearStatus')}>
                  <X size={12} />
                </button>
              )}
            </span>

            <span className={`onb-select ${plan !== DEFAULT_PLAN ? 'has-value' : ''}`}>
              <select
                ref={planRef}
                value={plan}
                onChange={e => { setPlan(e.target.value); setPage(1); }}
                aria-label={tx('filterPlan')}
              >
                <option value={DEFAULT_PLAN}>{tx('allPlans')}</option>
                {PLAN_OPTIONS.map(x => <option key={x} value={x}>{x}</option>)}
              </select>
              {plan !== DEFAULT_PLAN && (
                <button type="button" className="onb-clear-x" onClick={clearPlan} aria-label={tx('clearPlan')} title={tx('clearPlan')}>
                  <X size={12} />
                </button>
              )}
            </span>

            <span className={`onb-select ${stage !== DEFAULT_STAGE ? 'has-value' : ''}`}>
              <select
                ref={stageRef}
                value={stage}
                onChange={e => { setStage(e.target.value); setPage(1); }}
                aria-label={tx('filterStage')}
              >
                <option value={DEFAULT_STAGE}>{tx('allStages')}</option>
                {ONBOARDING_STAGES.map(x => <option key={x} value={x}>{x}</option>)}
              </select>
              {stage !== DEFAULT_STAGE && (
                <button type="button" className="onb-clear-x" onClick={clearStage} aria-label={tx('clearStage')} title={tx('clearStage')}>
                  <X size={12} />
                </button>
              )}
            </span>

            <button
              type="button"
              className="onb-reset"
              onClick={clearFilters}
              disabled={activeFilterCount === 0}
              aria-label={`${tx('resetFilters')} (${activeFilterCount} ${tx('filtersActive')})`}
            >
              {tx('resetFilters')}
              {activeFilterCount > 0 && <em className="onb-reset-count">{activeFilterCount}</em>}
            </button>
          </div>

          <div className="onb-chips" role="group" aria-label={tx('quickFilters')}>
            <span className="onb-chips-label">{tx('quickFilters')}</span>
            {chips.map(q => (
              <button
                key={q}
                className={`onb-chip ${quick === q ? 'active' : ''}`}
                aria-pressed={quick === q}
                onClick={() => (q === 'all' ? (setQuick('all'), setPage(1)) : applyQuick(q))}
              >
                {quickLabel(q)}
                <em>{countQuick(q)}</em>
                {!QUICK_CHIPS.includes(q) && <X size={11} aria-label={tx('removeFilter')} />}
              </button>
            ))}
          </div>

          {selectedInView.length > 0 && (
            <div className="onb-bulk-note">
              {selectedInView.length} {tx('selectedApplications')}
            </div>
          )}

          <div className="onb-table-wrap">
            <table className="onb-table">
              <thead>
                <tr>
                  <th className="onb-col-check">
                    <input
                      type="checkbox"
                      aria-label="Select all visible applications"
                      checked={visible.length > 0 && visible.every(a => selected.includes(a.id))}
                      onChange={e => setSelected(old =>
                        e.target.checked
                          ? [...new Set([...old, ...visible.map(a => a.id)])]
                          : old.filter(id => !visible.some(a => a.id === id)))}
                    />
                  </th>
                  <th>{tx('applicationId')}</th>
                  <th>{tx('companyName')}</th>
                  <th>{tx('contactPerson')}</th>
                  <th>{tx('emailAddress')}</th>
                  <th>{tx('selectedPlan')}</th>
                  <th>{tx('submittedDate')}</th>
                  <th>{tx('currentStage')}</th>
                  <th>{tx('status')}</th>
                  <th>{tx('actions')}</th>
                </tr>
              </thead>

              <tbody>
                {visible.map(app => (
                  <tr key={app.id}>
                    <td className="onb-col-check">
                      <input
                        type="checkbox"
                        aria-label={`Select ${app.id}`}
                        checked={selected.includes(app.id)}
                        onChange={() => toggleSelected(app.id)}
                      />
                    </td>

                    <td>
                      <button className="onb-id-link" onClick={() => openApplication(app)}>{app.id}</button>
                    </td>

                    <td className="onb-company-cell">{app.company}</td>
                    <td>{app.contact}</td>
                    <td>
                      <a href={`mailto:${app.email}`} className="onb-email">{app.email}</a>
                    </td>
                    <td>{app.plan}</td>
                    <td>
                      {dateText(app.submitted, lang)}
                      {isOverdue(app) && <span className="onb-overdue block">{tx('overdueTag')}</span>}
                    </td>

                    <td>
                      <button className="onb-stage-pill" onClick={() => showStage(app.stage)}>{app.stage}</button>
                    </td>

                    <td>
                      <button className={`onb-status ${statusClass(app.status)}`} onClick={() => openApplication(app)}>
                        {app.status}
                      </button>
                    </td>

                    <td>
                      <div className="onb-row-actions">
                        <button
                          title={tx('viewApplication')}
                          aria-label={tx('viewApplication')}
                          onClick={() => openApplication(app)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          title={tx('approveApplication')}
                          aria-label={tx('approveApplication')}
                          disabled={!isOpen(app)}
                          onClick={() => runTransition(app.id, 'approve')}
                        >
                          <CheckCircle2 size={14} />
                        </button>
                        <button
                          title={tx('moreActions')}
                          aria-label={tx('moreActions')}
                          onClick={() => setDetail({ type: 'menu', id: app.id })}
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {visible.length === 0 && (
                  <tr>
                    <td colSpan="10" className="onb-empty">
                      {tx('noApplications')}{' '}
                      <button onClick={clearFilters}>{tx('clearFilters')}</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="onb-table-footer">
            <span aria-live="polite">
              {tx('showing')} {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}
              –{Math.min(currentPage * pageSize, filtered.length)} {tx('of')} {filtered.length} {tx('applicationsLower')}
              <span className="onb-sim-note">{tx('sessionNote')}</span>
            </span>

            <div className="onb-pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
                aria-label={tx('previousPage')}
                title={tx('previousPage')}
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from({ length: pageCount }, (_, i) => (
                <button
                  key={i}
                  className={currentPage === i + 1 ? 'active' : ''}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === pageCount}
                onClick={() => setPage(currentPage + 1)}
                aria-label={tx('nextPage')}
                title={tx('nextPage')}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </footer>
        </section>
      </div>

      {configureOpen && (
        <div
          className="onb-modal-backdrop"
          onMouseDown={e => e.target === e.currentTarget && setConfigureOpen(false)}
        >
          <section className="onb-modal" role="dialog" aria-modal="true" aria-label={tx('configure')}>
            <header>
              <div>
                <span className="onb-panel-symbol"><Settings2 size={17} /></span>
                <h2>{tx('configure')}</h2>
              </div>
              <button onClick={() => setConfigureOpen(false)} aria-label={tx('close')}>
                <X size={19} />
              </button>
            </header>

            <p className="onb-modal-intro">{tx('configurationIntro')}</p>

            <label className="onb-config-row">
              <span>
                <b>{tx('requireInsurance')}</b>
                <small>{tx('insuranceDescription')}</small>
              </span>
              <input
                type="checkbox"
                checked={configDraft.requireInsurance}
                onChange={e => setConfigDraft(c => ({ ...c, requireInsurance: e.target.checked }))}
              />
            </label>

            <label className="onb-config-row">
              <span>
                <b>{tx('requireLicence')}</b>
                <small>{tx('licenceDescription')}</small>
              </span>
              <input
                type="checkbox"
                checked={configDraft.requireLicence}
                onChange={e => setConfigDraft(c => ({ ...c, requireLicence: e.target.checked }))}
              />
            </label>

            <label className="onb-config-row">
              <span>
                <b>{tx('emailReminders')}</b>
                <small>{tx('emailDescription')}</small>
              </span>
              <input
                type="checkbox"
                checked={configDraft.autoEmail}
                onChange={e => setConfigDraft(c => ({ ...c, autoEmail: e.target.checked }))}
              />
            </label>

            <label className="onb-config-select">
              <span>{tx('approvalWorkflow')}</span>
              <select
                value={configDraft.approval}
                onChange={e => setConfigDraft(c => ({ ...c, approval: e.target.value }))}
              >
                <option value="Manual approval">{tx('manualApproval')}</option>
                <option value="Two-step approval">{tx('twoStepApproval')}</option>
                <option value="Auto-approve after verification">{tx('autoApprove')}</option>
              </select>
            </label>

            <footer>
              <button className="onb-button" onClick={() => setConfigureOpen(false)}>{tx('cancel')}</button>
              <button
                className="onb-button primary"
                onClick={() => {
                  setConfig(configDraft);
                  setConfigureOpen(false);
                  notify(tx('configurationSaved'));
                }}
              >
                {tx('saveConfiguration')}
              </button>
            </footer>
          </section>
        </div>
      )}

      {detail && (
        <div
          className="onb-modal-backdrop"
          onMouseDown={e => e.target === e.currentTarget && setDetail(null)}
        >
          <section className="onb-modal onb-detail-modal" role="dialog" aria-modal="true">
            <header>
              <div>
                <span className="onb-panel-symbol"><Building2 size={17} /></span>
                <h2>
                  {detail.type === 'activity' ? tx(`act_${detail.activity.type}`)
                    : detail.title || detailApp?.company || tx('applicationDetails')}
                </h2>
              </div>
              <button onClick={() => setDetail(null)} aria-label={tx('close')}>
                <X size={19} />
              </button>
            </header>

            {detail.type === 'range' && (
              <div className="onb-detail-content">
                <p>{tx('dateRangeHelp')}</p>
                <button className="onb-button primary" onClick={() => setDetail(null)}>{tx('gotIt')}</button>
              </div>
            )}

            {detail.type === 'stages' && (
              <div className="onb-detail-content">
                {stageCounts.rows.map(item => (
                  <div className="onb-detail-row" key={item.name}>
                    <span>{item.step}. {item.name}</span>
                    <b>{item.count} {tx('stageApplications')}</b>
                    <button
                      className="onb-button small"
                      onClick={() => { showStage(item.name); setDetail(null); }}
                    >
                      {tx('review')}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {detail.type === 'menu' && detailApp && (
              <div className="onb-detail-content">
                <p>{tx('chooseAction')} <b>{detailApp.company}</b>.</p>
                <button
                  className="onb-full-action"
                  disabled={!isOpen(detailApp)}
                  onClick={() => { runTransition(detailApp.id, 'approve'); setDetail(null); }}
                >
                  <CheckCircle2 size={16} /> {tx('activateTenant')}
                </button>
                <button
                  className="onb-full-action"
                  disabled={!isOpen(detailApp) || detailApp.status === 'Returned for Correction'}
                  onClick={() => { runTransition(detailApp.id, 'return'); setDetail(null); }}
                >
                  <CircleAlert size={16} /> {tx('returnCorrections')}
                </button>
                <button
                  className="onb-full-action danger"
                  disabled={!isOpen(detailApp)}
                  onClick={() => { runTransition(detailApp.id, 'reject'); setDetail(null); }}
                >
                  <XCircle size={16} /> {tx('rejectApplication')}
                </button>
              </div>
            )}

            {detail.type === 'activity' && (
              <div className="onb-detail-content">
                <p>{detail.activity.company}</p>
                <div className="onb-detail-row">
                  <span>{tx('activityLabel')}</span><b>{tx(`act_${detail.activity.type}`)}</b>
                </div>
                <div className="onb-detail-row">
                  <span>{tx('dateLabel')}</span>
                  <b>{dateText(detail.activity.at, lang)}, {timeText(detail.activity.at, lang)}</b>
                </div>
              </div>
            )}

            {detail.type === 'app' && detailApp && (
              <ApplicationDetail
                app={detailApp}
                tx={tx}
                lang={lang}
                onAction={kind => runTransition(detailApp.id, kind)}
                onClose={() => setDetail(null)}
              />
            )}
          </section>
        </div>
      )}

      {kpiPanelData && (
        <>
          <div className="onb-drawer-backdrop" onClick={onDrawerBackdropClick} />
          <aside
            className="onb-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="onb-drawer-title"
            onKeyDown={e => { if (e.key === 'Tab') { e.preventDefault(); drawerCloseRef.current?.focus(); } }}
          >
            <div className="onb-drawer-h">
              <h3 id="onb-drawer-title">{kpiPanelData.title}</h3>
              <button ref={drawerCloseRef} className="onb-drawer-close" onClick={() => setKpiPanel(null)} aria-label={tx('close')}>
                <X size={18} />
              </button>
            </div>
            <div className="onb-drawer-b">
              {kpiPanelData.rows.map(([label, value], index) => (
                <div className="onb-drawer-kv" key={`${label}-${index}`}><span>{label}</span><b>{value}</b></div>
              ))}
              <p className="onb-drawer-note">{tx('kpiPanelNote')}</p>
            </div>
          </aside>
        </>
      )}
    </main>
  );
}

function CheckState({ value, tx }) {
  const label = { done: tx('checkDone'), pending: tx('checkPending'), issue: tx('checkIssue'), na: tx('checkNa') }[value];
  return <span className={`onb-check-state ${value}`}>{label}</span>;
}

function ApplicationDetail({ app, tx, lang, onAction, onClose }) {
  const open = isOpen(app);
  const needsDocs = ['Documents Pending', 'Returned for Correction'].includes(app.status);

  return (
    <div className="onb-detail-content">
      <div className="onb-detail-status">
        <span className={`onb-status ${statusClass(app.status)}`}>{app.status}</span>
        <span className="onb-stage-pill">{app.stage}</span>
        {isOverdue(app) && <span className="onb-overdue">{tx('overdueTag')}</span>}
      </div>

      <div className="onb-detail-row"><span>{tx('applicationId')}</span><b>{app.id}</b></div>
      <div className="onb-detail-row"><span>{tx('companyLabel')}</span><b>{app.company}</b></div>
      <div className="onb-detail-row"><span>{tx('contactPerson')}</span><b><UserRound size={14} />{app.contact}</b></div>
      <div className="onb-detail-row"><span>{tx('emailAddress')}</span><b><Mail size={14} />{app.email}</b></div>
      <div className="onb-detail-row"><span>{tx('phoneLabel')}</span><b><Phone size={14} />{app.phone}</b></div>
      <div className="onb-detail-row"><span>{tx('regionLabel')}</span><b>{app.region}</b></div>
      <div className="onb-detail-row"><span>{tx('subscriptionPlan')}</span><b>{app.plan}</b></div>
      <div className="onb-detail-row"><span>{tx('guardWorkforce')}</span><b>{app.guards} {tx('guards')}</b></div>
      <div className="onb-detail-row"><span>{tx('submittedDate')}</span><b>{dateText(app.submitted, lang)}</b></div>
      <div className="onb-detail-row"><span>{tx('documentsLabel')}</span><b>{app.documents}</b></div>

      <div className="onb-detail-checks">
        <b>{tx('verificationChecks')}</b>
        {ONBOARDING_CHECK_KEYS.map(key => (
          <div className="onb-detail-check" key={key}>
            <span>{tx(`chk_${key}`)}</span>
            <CheckState value={app.ec[key]} tx={tx} />
          </div>
        ))}
      </div>

      <div className="onb-detail-notes">
        <b>{tx('reviewerNotes')}</b>
        <p>{app.notes}</p>
      </div>

      <div className="onb-detail-buttons">
        <button className="onb-button" onClick={onClose}>{tx('close')}</button>
        <button
          className="onb-button warning"
          disabled={!open || app.status === 'Returned for Correction'}
          onClick={() => { onAction('return'); onClose(); }}
        >
          {tx('returnCorrection')}
        </button>
        {needsDocs && (
          <button className="onb-button" onClick={() => onAction('docsReceived')}>
            <FileText size={14} /> {tx('markDocsReceived')}
          </button>
        )}
        {canAdvance(app) && (
          <button className="onb-button" onClick={() => onAction('advance')}>
            <Check size={14} /> {tx('verifyAdvance')}
          </button>
        )}
        <button
          className="onb-button primary"
          disabled={!open}
          onClick={() => { onAction('approve'); onClose(); }}
        >
          <CheckCircle2 size={14} /> {tx('approveActivate')}
        </button>
      </div>
    </div>
  );
}
