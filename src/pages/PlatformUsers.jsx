import { useEffect, useMemo, useRef, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import * as XLSX from 'xlsx';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUp,
  Ban,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Eye,
  Lock,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserCog,
  Users,
  Upload,
  X
} from 'lucide-react';
import './platformUsers.css';
import { useI18n } from '../i18n/I18nContext.jsx';


/* Page translations follow the application's selected language when available.
   The parent layout can also pass a language prop or dispatch `app-language-changed`. */
const PAGE_TRANSLATIONS = {
  fr: {
    'Platform Users':'Utilisateurs de la plateforme','Manage platform accounts, roles, access and account status.':'Gérez les comptes, les rôles, les accès et le statut des comptes de la plateforme.',
    'This month':'Ce mois-ci','Last month':'Le mois dernier','Last 7 days':'7 derniers jours','Last 30 days':'30 derniers jours','Custom Date':'Dates personnalisées','Custom date range':'Plage de dates personnalisée','Choose your own date range':'Choisissez votre plage de dates','Choose a start date and end date.':'Choisissez une date de début et une date de fin.','Start date':'Date de début','End date':'Date de fin','Apply':'Appliquer','Close':'Fermer','Month':'Mois','Year':'Année','Previous month':'Mois précédent','Next month':'Mois suivant','Select a start date, then an end date.':'Sélectionnez une date de début, puis une date de fin.','Now select the end date.':'Sélectionnez maintenant la date de fin.',
    'Add Platform User':'Ajouter un utilisateur','Export':'Exporter','Platform User Directory':'Répertoire des utilisateurs','Search users...':'Rechercher des utilisateurs...','Search platform users':'Rechercher des utilisateurs de la plateforme','Role':'Rôle','Status':'Statut','More Filters':'Plus de filtres','Company access':'Accès à l’entreprise','All users':'Tous les utilisateurs','All Companies access':'Accès à toutes les entreprises','Specific companies':'Entreprises spécifiques','Reset all filters':'Réinitialiser tous les filtres','Clear Filters':'Effacer les filtres','User':'Utilisateur','Email Address':'Adresse e-mail','Assigned Companies':'Entreprises attribuées','Last Login':'Dernière connexion','Actions':'Actions','Showing':'Affichage de','of':'sur','users':'utilisateurs','Rows per page':'Lignes par page',
    'Platform Super Admin':'Super administrateur de la plateforme','Platform Admin':'Administrateur de la plateforme','Support Admin':'Administrateur du support','Billing Admin':'Administrateur de facturation','Platform Analyst':'Analyste de la plateforme','Analyst':'Analyste','Read-only Auditor':'Auditeur en lecture seule','Auditor':'Auditeur',
    'Total Platform Users':'Nombre total d’utilisateurs','Active Users':'Utilisateurs actifs','Pending Invitations':'Invitations en attente','Suspended Accounts':'Comptes suspendus','All platform user accounts, including active, pending and suspended users.':'Tous les comptes de la plateforme, actifs, en attente ou suspendus.','Users who currently have an active platform account.':'Utilisateurs ayant actuellement un compte actif.','Users who were invited but have not completed account activation.':'Utilisateurs invités qui n’ont pas encore activé leur compte.','Accounts temporarily restricted from accessing the platform.':'Comptes temporairement empêchés d’accéder à la plateforme.','Active':'Actif','Pending':'En attente','Suspended':'Suspendu','Inactive':'Inactif','Select a role':'Sélectionner un rôle',
    'Recent User Activity':'Activité récente des utilisateurs','View All':'Tout afficher','Role Distribution':'Répartition des rôles','Total Users':'Total des utilisateurs','Access Security':'Sécurité des accès','MFA Enabled':'Authentification multifacteur activée','Users with MFA':'Utilisateurs avec MFA','Last access review':'Dernière vérification des accès','Completed':'Terminé','View details':'Voir les détails','Edit user':'Modifier l’utilisateur','Reactivate account':'Réactiver le compte','Suspend account':'Suspendre le compte','Resend invitation':'Renvoyer l’invitation','Edit Platform User':'Modifier l’utilisateur de la plateforme','Update the account details below.':'Mettez à jour les informations du compte ci-dessous.','Create a new platform-level account.':'Créer un nouveau compte de plateforme.','Full name':'Nom complet','Enter full name':'Saisissez le nom complet','Email address':'Adresse e-mail','Platform role':'Rôle sur la plateforme','Cancel':'Annuler','Save changes':'Enregistrer les modifications','Create User':'Créer l’utilisateur','Previous page':'Page précédente','Next page':'Page suivante','Select all users on this page':'Sélectionner tous les utilisateurs de cette page','Clear selection':'Effacer la sélection','No users found':'Aucun utilisateur trouvé','Try changing your search or filters.':'Essayez de modifier votre recherche ou vos filtres.','Export selected':'Exporter la sélection','Filters cleared.':'Filtres effacés.','users selected':'utilisateurs sélectionnés','Delete selected':'Supprimer la sélection','Delete':'Supprimer','Confirm deletion':'Confirmer la suppression','Are you sure you want to delete the selected users?':'Voulez-vous vraiment supprimer les utilisateurs sélectionnés ?','Please enter the user name and email address.':'Veuillez saisir le nom et l’adresse e-mail de l’utilisateur.','A user with this email already exists.':'Un utilisateur avec cette adresse e-mail existe déjà.','Platform user updated successfully.':'Utilisateur de la plateforme mis à jour.','Platform user added successfully.':'Utilisateur de la plateforme ajouté.','Latest changes across platform accounts':'Dernières modifications des comptes de la plateforme','Drill-down details':'Détails approfondis','Select a chart segment to see role details.':'Sélectionnez un segment du graphique pour afficher les détails du rôle.','Users in this role':'Utilisateurs ayant ce rôle','No users match this role.':'Aucun utilisateur ne correspond à ce rôle.','Close details':'Fermer les détails','Never':'Jamais','Enabled':'Activé','Not enabled':'Non activé','Current count':'Nombre actuel','Change vs last month':'Évolution par rapport au mois dernier','Period':'Période','Description':'Description','Email':'E-mail','Assigned companies':'Entreprises attribuées','Last login':'Dernière connexion','MFA':'MFA','Invitation reminder sent to':'Rappel d’invitation envoyé à','Date range set to':'Plage de dates définie sur','Exported':'Exporté','platform users.':'utilisateurs de la plateforme.','selected users.':'utilisateurs sélectionnés.','Latest activity':'Activité récente','added a new user':'a ajouté un utilisateur','updated a role':'a modifié un rôle','accepted invitation':'a accepté une invitation','account suspended':'compte suspendu','Added John Smith (john.smith@megsi.com)':'John Smith a été ajouté (john.smith@megsi.com)','Changed role to Support Admin':'Rôle modifié en Administrateur du support','Accepted platform invitation':'Invitation à la plateforme acceptée','Account suspended due to policy violation':'Compte suspendu pour non-respect des règles','Today':'Aujourd’hui','Yesterday':'Hier','Today, 09:42':'Aujourd’hui, 09:42','Today, 09:18':'Aujourd’hui, 09:18','Today, 08:56':'Aujourd’hui, 08:56','Yesterday, 17:32':'Hier, 17:32','Yesterday, 16:05':'Hier, 16:05','2 hours ago':'Il y a 2 heures','5 hours ago':'Il y a 5 heures','1 day ago':'Il y a 1 jour','2 days ago':'Il y a 2 jours','All Companies':'Toutes les entreprises','Companies':'entreprises','Search':'Rechercher','Open details':'Ouvrir les détails','More actions':'Plus d’actions','Invitation reminder sent.':'Rappel d’invitation envoyé.','Exported users':'Utilisateurs exportés','This month':'Ce mois-ci','Platform user overview':'Vue d’ensemble des utilisateurs de la plateforme','Open details':'Ouvrir les détails','Dismiss message':'Fermer le message','Bulk user actions':'Actions groupées sur les utilisateurs','Filter by role':'Filtrer par rôle','Filter by status':'Filtrer par statut','Filter by company access':'Filtrer par accès à l’entreprise','Name':'Nom','Select':'Sélectionner','Companies':'Entreprises','page':'page','Open details':'Ouvrir les détails','Invitation reminder sent to':'Rappel d’invitation envoyé à','status updated to':'statut modifié en','Please enter the user name and email address.':'Veuillez saisir le nom et l’adresse e-mail de l’utilisateur.','A user with this email already exists.':'Un utilisateur avec cette adresse e-mail existe déjà.','Platform user updated successfully.':'Utilisateur de la plateforme mis à jour.','Platform user added successfully.':'Utilisateur de la plateforme ajouté.','Date range set to':'Plage de dates définie sur','Exported':'Exporté','platform users':'utilisateurs de la plateforme','selected users':'utilisateurs sélectionnés','Invitation reminder sent to':'Rappel d’invitation envoyé à','Search platform users':'Rechercher des utilisateurs de la plateforme','Filter by role':'Filtrer par rôle','Filter by status':'Filtrer par statut','MFA':'MFA'
  },
  de: {
    "Platform Users": "Plattformbenutzer",
    "Manage platform accounts, roles, access and account status.": "Verwalten Sie Plattformkonten, Rollen, Zugriffsrechte und Kontostatus.",
    "This month": "Diesen Monat",
    "Last month": "Letzten Monat",
    "Last 7 days": "Letzte 7 Tage",
    "Last 30 days": "Letzte 30 Tage",
    "Custom Date": "Benutzerdefiniertes Datum",
    "Custom date range": "Benutzerdefinierter Zeitraum",
    "Choose your own date range": "Wählen Sie einen eigenen Zeitraum",
    "Choose a start date and end date.": "Wählen Sie ein Start- und Enddatum.",
    "Start date": "Startdatum",
    "End date": "Enddatum",
    "Month": "Monat",
    "Year": "Jahr",
    "Previous month": "Vorheriger Monat",
    "Next month": "Nächster Monat",
    "Select a start date, then an end date.": "Wählen Sie zuerst ein Startdatum und dann ein Enddatum.",
    "Now select the end date.": "Wählen Sie jetzt das Enddatum.",
    "Apply": "Anwenden",
    "Close": "Schließen",
    "Add Platform User": "Plattformbenutzer hinzufügen",
    "Export": "Exportieren",
    "Platform User Directory": "Plattformbenutzerverzeichnis",
    "Search users...": "Benutzer suchen...",
    "Search platform users": "Plattformbenutzer suchen",
    "Role": "Rolle",
    "Status": "Status",
    "More Filters": "Weitere Filter",
    "Company access": "Unternehmenszugriff",
    "All users": "Alle Benutzer",
    "All Companies access": "Zugriff auf alle Unternehmen",
    "Specific companies": "Bestimmte Unternehmen",
    "Reset all filters": "Alle Filter zurücksetzen",
    "Clear Filters": "Filter löschen",
    "User": "Benutzer",
    "Email Address": "E-Mail-Adresse",
    "Assigned Companies": "Zugewiesene Unternehmen",
    "Last Login": "Letzte Anmeldung",
    "Actions": "Aktionen",
    "Showing": "Anzeige",
    "of": "von",
    "users": "Benutzer",
    "Rows per page": "Zeilen pro Seite",
    "Platform Super Admin": "Plattform-Superadministrator",
    "Platform Admin": "Plattformadministrator",
    "Support Admin": "Supportadministrator",
    "Billing Admin": "Abrechnungsadministrator",
    "Platform Analyst": "Plattformanalyst",
    "Analyst": "Analyst",
    "Read-only Auditor": "Prüfer mit Leseberechtigung",
    "Auditor": "Prüfer",
    "Total Platform Users": "Plattformbenutzer insgesamt",
    "Active Users": "Aktive Benutzer",
    "Pending Invitations": "Ausstehende Einladungen",
    "Suspended Accounts": "Gesperrte Konten",
    "All platform user accounts, including active, pending and suspended users.": "Alle Plattformkonten, einschließlich aktiver, ausstehender und gesperrter Konten.",
    "Users who currently have an active platform account.": "Benutzer mit einem derzeit aktiven Plattformkonto.",
    "Users who were invited but have not completed account activation.": "Eingeladene Benutzer, die ihr Konto noch nicht aktiviert haben.",
    "Accounts temporarily restricted from accessing the platform.": "Konten, deren Zugriff auf die Plattform vorübergehend eingeschränkt ist.",
    "Active": "Aktiv",
    "Pending": "Ausstehend",
    "Suspended": "Gesperrt",
    "Inactive": "Inaktiv",
    "Select a role": "Rolle auswählen",
    "Recent User Activity": "Letzte Benutzeraktivität",
    "View All": "Alle anzeigen",
    "Role Distribution": "Rollenverteilung",
    "Total Users": "Benutzer insgesamt",
    "Access Security": "Zugriffssicherheit",
    "MFA Enabled": "MFA aktiviert",
    "Users with MFA": "Benutzer mit MFA",
    "Last access review": "Letzte Zugriffsprüfung",
    "Completed": "Abgeschlossen",
    "View details": "Details anzeigen",
    "Edit user": "Benutzer bearbeiten",
    "Reactivate account": "Konto reaktivieren",
    "Suspend account": "Konto sperren",
    "Resend invitation": "Einladung erneut senden",
    "Edit Platform User": "Plattformbenutzer bearbeiten",
    "Update the account details below.": "Aktualisieren Sie unten die Kontodaten.",
    "Create a new platform-level account.": "Neues Plattformkonto erstellen.",
    "Full name": "Vollständiger Name",
    "Enter full name": "Vollständigen Namen eingeben",
    "Email address": "E-Mail-Adresse",
    "Platform role": "Plattformrolle",
    "Cancel": "Abbrechen",
    "Save changes": "Änderungen speichern",
    "Create User": "Benutzer erstellen",
    "Previous page": "Vorherige Seite",
    "Next page": "Nächste Seite",
    "Select all users on this page": "Alle Benutzer auf dieser Seite auswählen",
    "Clear selection": "Auswahl aufheben",
    "No users found": "Keine Benutzer gefunden",
    "Try changing your search or filters.": "Ändern Sie Ihre Suche oder Filter.",
    "Export selected": "Auswahl exportieren",
    "Filters cleared.": "Filter wurden gelöscht.",
    "users selected": "Benutzer ausgewählt",
    "Delete selected": "Ausgewählte löschen",
    "Delete": "Löschen",
    "Confirm deletion": "Löschen bestätigen",
    "Are you sure you want to delete the selected users?": "Möchten Sie die ausgewählten Benutzer wirklich löschen?",
    "Please enter the user name and email address.": "Bitte geben Sie den Namen und die E-Mail-Adresse des Benutzers ein.",
    "A user with this email already exists.": "Ein Benutzer mit dieser E-Mail-Adresse ist bereits vorhanden.",
    "Platform user updated successfully.": "Plattformbenutzer erfolgreich aktualisiert.",
    "Platform user added successfully.": "Plattformbenutzer erfolgreich hinzugefügt.",
    "Latest changes across platform accounts": "Neueste Änderungen an Plattformkonten",
    "Drill-down details": "Detaillierte Ansicht",
    "Select a chart segment to see role details.": "Wählen Sie ein Diagrammsegment aus, um Rollendetails anzuzeigen.",
    "Users in this role": "Benutzer mit dieser Rolle",
    "No users match this role.": "Keine Benutzer mit dieser Rolle gefunden.",
    "Close details": "Details schließen",
    "Never": "Nie",
    "Enabled": "Aktiviert",
    "Not enabled": "Nicht aktiviert",
    "Current count": "Aktuelle Anzahl",
    "Change vs last month": "Änderung gegenüber dem letzten Monat",
    "Period": "Zeitraum",
    "Description": "Beschreibung",
    "Email": "E-Mail",
    "Assigned companies": "Zugewiesene Unternehmen",
    "Last login": "Letzte Anmeldung",
    "MFA": "MFA",
    "Invitation reminder sent to": "Einladungserinnerung gesendet an",
    "Date range set to": "Datumsbereich festgelegt auf",
    "Exported": "Exportiert",
    "platform users.": "Plattformbenutzer.",
    "selected users.": "ausgewählte Benutzer.",
    "Latest activity": "Letzte Aktivität",
    "added a new user": "hat einen neuen Benutzer hinzugefügt",
    "updated a role": "hat eine Rolle aktualisiert",
    "accepted invitation": "hat eine Einladung angenommen",
    "account suspended": "Konto gesperrt",
    "Added John Smith (john.smith@megsi.com)": "John Smith hinzugefügt (john.smith@megsi.com)",
    "Changed role to Support Admin": "Rolle zu Supportadministrator geändert",
    "Accepted platform invitation": "Plattform-Einladung angenommen",
    "Account suspended due to policy violation": "Konto wegen eines Richtlinienverstoßes gesperrt",
    "Today": "Heute",
    "Yesterday": "Gestern",
    "Today, 09:42": "Heute, 09:42",
    "Today, 09:18": "Heute, 09:18",
    "Today, 08:56": "Heute, 08:56",
    "Yesterday, 17:32": "Gestern, 17:32",
    "Yesterday, 16:05": "Gestern, 16:05",
    "2 hours ago": "Vor 2 Stunden",
    "5 hours ago": "Vor 5 Stunden",
    "1 day ago": "Vor 1 Tag",
    "2 days ago": "Vor 2 Tagen",
    "All Companies": "Alle Unternehmen",
    "Companies": "Unternehmen",
    "Search": "Suchen",
    "Open details": "Details öffnen",
    "More actions": "Weitere Aktionen",
    "Invitation reminder sent.": "Einladungserinnerung gesendet.",
    "Exported users": "Benutzer exportiert",
    "Platform user overview": "Übersicht der Plattformbenutzer",
    "Dismiss message": "Meldung schließen",
    "Bulk user actions": "Sammelaktionen für Benutzer",
    "Filter by role": "Nach Rolle filtern",
    "Filter by status": "Nach Status filtern",
    "Filter by company access": "Nach Unternehmenszugriff filtern",
    "Name": "Name",
    "Select": "Auswählen",
    "page": "Seite",
    "status updated to": "Status geändert zu",
    "platform users": "Plattformbenutzer",
    "selected users": "ausgewählte Benutzer"
  }
};

function normalizeLanguage(value) {
  const normalized = String(value || 'en').toLowerCase();
  if (normalized.startsWith('fr') || normalized.includes('french') || normalized.includes('français')) return 'fr';
  if (normalized.startsWith('de') || normalized.includes('german') || normalized.includes('deutsch')) return 'de';
  return 'en';
}

function getPageLanguage() {
  if (typeof window === 'undefined') return 'en';
  const storageKeys = ['appLanguage', 'selectedLanguage', 'language', 'currentLanguage', 'i18nextLng', 'locale', 'lang', 'megsi-language'];
  const stored = storageKeys.map((key) => {
    try { return window.localStorage.getItem(key); } catch { return null; }
  }).find(Boolean);
  const htmlLang = typeof document !== 'undefined' ? document.documentElement.lang : '';
  const selector = typeof document !== 'undefined' ? document.querySelector('[data-language-selector], select[name*=language i], select[id*=language i], [aria-label*=language i] select, .language-selector select, .language-selector button, [data-testid*=language]') : null;
  const selectorLanguage = selector ? (selector.value || selector.options?.[selector.selectedIndex]?.text || selector.textContent || '').trim() : '';
  const selectorRecognized = /^(en|fr|de)([-_]|$)|english|french|german|deutsch|français/i.test(selectorLanguage);
  const globalLanguage = window.__APP_LANGUAGE__ || window.currentLanguage || '';
  return normalizeLanguage((selectorRecognized && selectorLanguage) || globalLanguage || stored || htmlLang || 'en');
}

function translatePageText(language, value) {
  return PAGE_TRANSLATIONS[normalizeLanguage(language)]?.[value] || value;
}

/* ------------------------------------------------------------------ */
/* Static / demo data (self-contained: no external data file needed)   */
/* ------------------------------------------------------------------ */

const ROLES = [
  'Platform Super Admin',
  'Platform Admin',
  'Support Admin',
  'Platform Analyst',
  'Billing Admin',
  'Read-only Auditor'
];

const STATUSES = ['Active', 'Pending', 'Suspended', 'Inactive'];

const ROLE_CLASS = {
  'Platform Super Admin': 'super',
  'Platform Admin': 'admin',
  'Support Admin': 'support',
  'Platform Analyst': 'analyst',
  'Billing Admin': 'billing',
  'Read-only Auditor': 'auditor'
};

const ROLE_DISTRIBUTION = [
  { name: 'Platform Admin', role: 'Platform Admin', value: 42, color: '#2563eb' },
  { name: 'Support Admin', role: 'Support Admin', value: 56, color: '#059669' },
  { name: 'Billing Admin', role: 'Billing Admin', value: 38, color: '#f59e0b' },
  { name: 'Analyst', role: 'Platform Analyst', value: 71, color: '#7c3aed' },
  { name: 'Auditor', role: 'Read-only Auditor', value: 41, color: '#7b8db8' }
];

const ROLE_TOTAL = ROLE_DISTRIBUTION.reduce((sum, item) => sum + item.value, 0);

const ACTIVITY = [
  {
    id: 1,
    icon: Plus,
    tone: 'green',
    name: 'Emily Carter',
    text: 'added a new user',
    detail: 'Added John Smith (john.smith@megsi.com)',
    time: '2 hours ago'
  },
  {
    id: 2,
    icon: UserCog,
    tone: 'blue',
    name: 'James Wilson',
    text: 'updated a role',
    detail: 'Changed role to Support Admin',
    time: '5 hours ago'
  },
  {
    id: 3,
    icon: Check,
    tone: 'green',
    name: 'Oliver Brown',
    text: 'accepted invitation',
    detail: 'Accepted platform invitation',
    time: '1 day ago'
  },
  {
    id: 4,
    icon: AlertTriangle,
    tone: 'red',
    name: 'Sophie Taylor',
    text: 'account suspended',
    detail: 'Account suspended due to policy violation',
    time: '2 days ago'
  }
];

const DATE_RANGES = [
  { name: 'This month', label: '01 Oct 2026 - 31 Oct 2026' },
  { name: 'Last month', label: '01 Sep 2026 - 30 Sep 2026' },
  { name: 'Q3 2026', label: '01 Jul 2026 - 30 Sep 2026' },
  { name: 'Year to date', label: '01 Jan 2026 - 31 Oct 2026' },
  { name: 'Last 12 months', label: '01 Nov 2025 - 31 Oct 2026' },
  { name: 'Custom Date', label: 'Choose your own date range', custom: true }
];

const SEED_USERS = [
  { id: 1, name: 'David Miller', email: 'david.miller@megsi.com', role: 'Platform Super Admin', companies: 'All Companies', lastLogin: 'Today, 09:42', status: 'Active' },
  { id: 2, name: 'Emily Carter', email: 'emily.carter@megsi.com', role: 'Platform Admin', companies: '18 Companies', lastLogin: 'Today, 09:18', status: 'Active' },
  { id: 3, name: 'James Wilson', email: 'james.wilson@megsi.com', role: 'Support Admin', companies: '12 Companies', lastLogin: 'Today, 08:56', status: 'Active' },
  { id: 4, name: 'Priya Sharma', email: 'priya.sharma@megsi.com', role: 'Platform Analyst', companies: '8 Companies', lastLogin: 'Yesterday, 17:32', status: 'Active' },
  { id: 5, name: 'Oliver Brown', email: 'oliver.brown@megsi.com', role: 'Billing Admin', companies: '6 Companies', lastLogin: 'Yesterday, 16:05', status: 'Pending' },
  { id: 6, name: 'Sophie Taylor', email: 'sophie.taylor@megsi.com', role: 'Platform Admin', companies: '14 Companies', lastLogin: '18 Oct 2026', status: 'Suspended' },
  { id: 7, name: 'Daniel Lewis', email: 'daniel.lewis@megsi.com', role: 'Read-only Auditor', companies: 'All Companies', lastLogin: '17 Oct 2026', status: 'Active' }
].map((user) => ({ ...user, mfaEnabled: true }));

const FIRST_NAMES = ['Aarav', 'Liam', 'Noah', 'Ava', 'Mia', 'Ethan', 'Isla', 'Lucas', 'Zara', 'Arjun', 'Meera', 'Kabir', 'Nina', 'Omar', 'Leah', 'Ravi', 'Tara', 'Hugo', 'Anika', 'Felix'];
const LAST_NAMES = ['Patel', 'Nguyen', 'Kumar', 'Garcia', 'Singh', 'Martin', 'Khan', 'Rossi', 'Lopez', 'Reddy', 'Fischer', 'Silva', 'Iyer', 'Walker', 'Young'];
const ROLE_CYCLE = ['Platform Analyst', 'Support Admin', 'Read-only Auditor', 'Platform Admin', 'Billing Admin', 'Platform Analyst', 'Support Admin'];
const LOGIN_CYCLE = ['Today, 08:15', 'Today, 07:48', 'Yesterday, 18:20', 'Yesterday, 11:05', '19 Oct 2026', '16 Oct 2026', '14 Oct 2026', '09 Oct 2026', '03 Oct 2026', '28 Sep 2026', '18 Sep 2026', '07 Sep 2026', '24 Aug 2026', '12 Aug 2026', '30 Jul 2026', '15 Jul 2026', '22 Jun 2026', '11 May 2026', '17 Mar 2026', '08 Jan 2026', '15 Dec 2025', '20 Nov 2025'];

/* Builds 248 users in total: 221 active, 14 pending, 13 suspended, 233 with MFA */
function buildUsers() {
  const users = [...SEED_USERS];
  const remaining = 248 - SEED_USERS.length;
  const pool = [
    ...Array(216).fill('Active'),
    ...Array(13).fill('Pending'),
    ...Array(12).fill('Suspended')
  ];

  for (let i = 0; i < remaining; i += 1) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
    const status = pool[(i * 37) % remaining];
    const index = users.length;

    users.push({
      id: index + 1,
      name: `${first} ${last}`,
      email: `${first}.${last}@megsi.com`.toLowerCase(),
      role: ROLE_CYCLE[i % ROLE_CYCLE.length],
      companies: i % 9 === 0 ? 'All Companies' : `${(i % 19) + 2} Companies`,
      lastLogin: status === 'Pending' ? 'Never' : LOGIN_CYCLE[i % LOGIN_CYCLE.length],
      status,
      mfaEnabled: !(index >= 9 && (index - 9) % 16 === 0)
    });
  }

  return users;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const AVATAR_COLORS = ['#dbe7ff', '#dcfce7', '#fde7d4', '#ede0ff', '#fce1e7', '#d7f0f5'];
const AVATAR_TEXT = ['#1d4ed8', '#15803d', '#c2570c', '#6d28d9', '#be123c', '#0e7490'];

const normalize = (value) => String(value ?? '').toLowerCase().trim();
function getLastLoginDate(lastLogin) {
  if (!lastLogin || lastLogin === 'Never') return null;
  const now = new Date();
  if (lastLogin.startsWith('Today')) return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (lastLogin.startsWith('Yesterday')) return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const match = lastLogin.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (match) {
    const month = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(match[2].toLowerCase());
    if (month >= 0) return new Date(Number(match[3]), month, Number(match[1]));
  }
  return null;
}

function getDateBounds(range, customStartDate, customEndDate) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range.name === 'Custom Date') {
    const startValue = range.start || customStartDate;
    const endValue = range.end || customEndDate;
    return { start: startValue ? new Date(`${startValue}T00:00:00`) : null, end: endValue ? new Date(`${endValue}T23:59:59`) : null };
  }
  if (range.name === 'This month') return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59) };
  if (range.name === 'Last month') return { start: new Date(today.getFullYear(), today.getMonth() - 1, 1), end: new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59) };
  if (range.name === 'Q3 2026') return { start: new Date(2026, 6, 1), end: new Date(2026, 8, 30, 23, 59, 59) };
  if (range.name === 'Year to date') return { start: new Date(today.getFullYear(), 0, 1), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59) };
  if (range.name === 'Last 12 months') return { start: new Date(today.getFullYear(), today.getMonth() - 11, 1), end: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59) };
  if (range.name === 'Last 7 days') return { start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59) };
  return { start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59) };
}

function formatDateRangeLabel(range, language, customStartDate, customEndDate) {
  if (range.name === 'Custom Date' && range.label) return range.label;
  const bounds = getDateBounds(range, customStartDate, customEndDate);
  const locale = language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : 'en-GB';
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  if (!bounds.start || !bounds.end) return range.label || '';
  return `${bounds.start.toLocaleDateString(locale, options)} - ${bounds.end.toLocaleDateString(locale, options)}`;
}


const getInitials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const hashIndex = (value, size) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash % size;
};


/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */

function MetricCard({ title, value, change, tone, icon: Icon, accent, t }) {
  return (
    <div className="pu-metric-card">
      <span className={`pu-metric-icon ${accent}`}>
        <Icon size={24} strokeWidth={2} />
      </span>
      <span className="pu-metric-body">
        <span className="pu-metric-title">{title}</span>
        <span className="pu-metric-row">
          <strong className="pu-metric-value">{value}</strong>
          <span className={`pu-metric-change ${tone}`}>
            <ArrowUp size={12} strokeWidth={3} />
            {change}
          </span>
        </span>
        <span className="pu-metric-caption">{t ? t("This month") : translatePageText(getPageLanguage(), "This month")}</span>
      </span>
    </div>
  );
}

function RolePill({ role, t = (value) => value }) {
  return <span className={`pu-role-pill ${ROLE_CLASS[role] ?? 'auditor'}`}>{t(role)}</span>;
}

function StatusBadge({ status, t = (value) => value }) {
  return (
    <span className={`pu-status-badge ${status.toLowerCase()}`}>
      <span className="pu-status-dot" />
      {t(status)}
    </span>
  );
}

function UserAvatar({ user }) {
  if (user.avatarUrl) {
    return <img className="pu-user-avatar" src={user.avatarUrl} alt="" />;
  }

  const tone = hashIndex(user.name, AVATAR_COLORS.length);

  return (
    <span
      className="pu-user-avatar pu-avatar-placeholder"
      style={{ background: AVATAR_COLORS[tone], color: AVATAR_TEXT[tone] }}
    >
      {getInitials(user.name)}
    </span>
  );
}

function DetailPanel({ data, onClose, onEdit, onResetPassword, onSuspend, t = (value) => value }) {
  const [activeTab, setActiveTab] = useState('activity');
  const user = data.user;
  const isSuspended = user.status === 'Suspended';
  const permissionItems = user.role === 'Platform Super Admin'
    ? ['Manage all platform settings', 'Manage platform users and roles', 'View all companies and billing', 'Manage subscriptions and access']
    : user.role === 'Platform Admin'
      ? ['Manage assigned platform users', 'View assigned companies', 'Manage onboarding and support', 'View platform reports']
      : user.role === 'Billing Admin'
        ? ['View subscription plans', 'Manage billing records', 'Export billing reports']
        : user.role === 'Support Admin'
          ? ['View and manage support tickets', 'View assigned companies', 'Assist platform users']
          : user.role === 'Platform Analyst'
            ? ['View platform analytics', 'Export reports', 'View assigned companies']
            : ['View assigned platform records', 'Access read-only reports'];

  return (
    <section className="pu-user-detail-page">
      <button type="button" className="pu-detail-back" onClick={onClose}>
        <ArrowLeft size={16} /> {t('Back to Platform Users')}
      </button>

      <div className="pu-detail-page-heading">
        <div>
          <h1>{t('User Details')}</h1>
          <p>{t('View platform account information, access and activity.')}</p>
        </div>
        <StatusBadge status={user.status} t={t} />
      </div>

      <section className="pu-detail-identity-card">
        <UserAvatar user={user} />
        <div className="pu-detail-profile-copy">
          <strong>{user.name}</strong>
          <span>{user.email}</span>
          <RolePill role={user.role} t={t} />
        </div>
      </section>

      <section className="pu-detail-info-grid">
        <div className="pu-detail-info-card"><Mail size={18} /><span><small>{t('Email Address')}</small><strong>{user.email}</strong></span></div>
        <div className="pu-detail-info-card"><UserCog size={18} /><span><small>{t('Platform role')}</small><strong>{t(user.role)}</strong></span></div>
        <div className="pu-detail-info-card"><Users size={18} /><span><small>{t('Assigned Companies')}</small><strong>{user.companies === 'All Companies' ? t('All Companies') : user.companies}</strong></span></div>
        <div className="pu-detail-info-card"><CalendarDays size={18} /><span><small>{t('Account status')}</small><strong>{t(user.status)}</strong></span></div>
        <div className="pu-detail-info-card"><CalendarCheck size={18} /><span><small>{t('Last Login')}</small><strong>{t(user.lastLogin)}</strong></span></div>
        <div className="pu-detail-info-card"><ShieldCheck size={18} /><span><small>{t('MFA Status')}</small><strong>{user.mfaEnabled ? t('Enabled') : t('Not enabled')}</strong></span></div>
      </section>

      <section className="pu-access-summary pu-detail-access-card">
        <h3>{t('Access Summary')}</h3>
        <div className="pu-access-summary-row">
          <Users size={19} />
          <div><strong>{t('Platform Access')}</strong><span>{user.companies === 'All Companies' ? t('All Companies') : t('Selected companies only')}</span></div>
        </div>
      </section>

      <section className="pu-detail-information-card">
        <div className="pu-detail-tabs" role="tablist" aria-label={t('User information')}>
          <button type="button" role="tab" aria-selected={activeTab === 'activity'} className={activeTab === 'activity' ? 'active' : ''} onClick={() => setActiveTab('activity')}>{t('Activity Log')}</button>
          <button type="button" role="tab" aria-selected={activeTab === 'permissions'} className={activeTab === 'permissions' ? 'active' : ''} onClick={() => setActiveTab('permissions')}>{t('Permissions')}</button>
          <button type="button" role="tab" aria-selected={activeTab === 'companies'} className={activeTab === 'companies' ? 'active' : ''} onClick={() => setActiveTab('companies')}>{t('Companies')}</button>
        </div>

        <div className="pu-detail-tab-content">
          {activeTab === 'activity' && (
            <div className="pu-activity-list">
              <div className="pu-activity-item"><span className="pu-activity-dot" /><div><strong>{t('Last platform login')}</strong><p>{t(user.lastLogin)}</p></div></div>
              <div className="pu-activity-item"><span className="pu-activity-dot" /><div><strong>{t('Account status')}</strong><p>{t(user.status)} · {t('Current account status')}</p></div></div>
              <div className="pu-activity-item"><span className="pu-activity-dot" /><div><strong>{t('MFA security')}</strong><p>{user.mfaEnabled ? t('Multi-factor authentication is enabled.') : t('Multi-factor authentication is not enabled.')}</p></div></div>
            </div>
          )}
          {activeTab === 'permissions' && (
            <div className="pu-permission-list">
              <p className="pu-tab-intro">{t('Permissions assigned through this user role.')}</p>
              {permissionItems.map((item) => <div className="pu-permission-item" key={item}><ShieldCheck size={16} /><span>{t(item)}</span><Check size={15} /></div>)}
            </div>
          )}
          {activeTab === 'companies' && (
            <div className="pu-company-detail">
              <div className="pu-company-detail-icon"><Users size={20} /></div>
              <div><strong>{user.companies === 'All Companies' ? t('All Companies') : user.companies}</strong><p>{user.companies === 'All Companies' ? t('This user has access to all platform companies.') : t('This user has access to selected companies only.')}</p></div>
            </div>
          )}
        </div>
      </section>

      <div className="pu-detail-page-actions">
        <button type="button" className="pu-primary-button" onClick={() => onEdit(user)}><Pencil size={16} />{t('Edit User')}</button>
        <button type="button" className="pu-secondary-button" onClick={() => onResetPassword(user)}><Lock size={16} />{t('Reset Password')}</button>
        <button type="button" className="pu-danger-button" onClick={() => onSuspend(user)}><ShieldAlert size={16} />{isSuspended ? t('Reactivate Account') : t('Suspend Account')}</button>
      </div>
    </section>
  );
}

function EmptyState({ onClear, t = (value) => value }) {
  return (
    <div className="pu-empty-state">
      <Search size={26} />
      <strong>{t('No users found')}</strong>
      <span>{t('Try changing your search or filters.')}</span>
      <button type="button" className="pu-text-button" onClick={onClear}>
        {t('Clear Filters')}
      </button>
    </div>
  );
}

const renderSliceLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const rad = Math.PI / 180;
  const x = cx + radius * Math.cos(-midAngle * rad);
  const y = cy + radius * Math.sin(-midAngle * rad);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
      style={{ pointerEvents: 'none' }}
    >
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

const EMPTY_FORM = { id: null, name: '', email: '', role: 'Platform Admin', status: 'Pending' };

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function PlatformUsers({ language: languageProp } = {}) {
  // Use the same shared language context as the other MEGSI pages (e.g. Companies).
  // The existing global language selector updates I18nContext, which triggers this page to rerender.
  const { lang: appLanguage, t: appT } = useI18n();
  const language = normalizeLanguage(languageProp || appLanguage || 'en');
  const t = (value) => PAGE_TRANSLATIONS[language]?.[value] || appT(value) || value;
  const translateCompanyCount = (value) => value === 'All Companies' ? t(value) : String(value).replace(/Companies$/, t('Companies'));
  const translateLogin = (value) => {
    if (value === 'Never') return t('Never');
    if (value.startsWith('Today')) return value.replace('Today', t('Today'));
    if (value.startsWith('Yesterday')) return value.replace('Yesterday', t('Yesterday'));
    const match = value.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
    if (match) { const date = new Date(Number(match[3]), ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(match[2].toLowerCase()), Number(match[1])); return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
    return value;
  };

  const [users, setUsers] = useState(buildUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [mfaFilter, setMfaFilter] = useState('all');
  const [lastLoginFilter, setLastLoginFilter] = useState('all');
  const [detail, setDetail] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const loadMoreRef = useRef(null);
  const [rowMenu, setRowMenu] = useState(null);
  const [formMode, setFormMode] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState('');
  const [exportOpen, setExportOpen] = useState(false);

  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const importRef = useRef(null);
  const exportMenuRef = useRef(null);

  // Infinite scrolling: reveal the next batch when the list sentinel enters view.
  useEffect(() => {
    setVisibleCount(10);
  }, [search, roleFilter, statusFilter, companyFilter, mfaFilter, lastLoginFilter, users]);

  /* keyboard shortcuts */
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }

      if (event.key === 'Escape') {
        setFormMode(null);
        setDetail(null);
        setRowMenu(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  /* toast auto-hide */
  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!exportOpen) return undefined;
    const closeExport = (event) => {
      if (!exportMenuRef.current?.contains(event.target)) setExportOpen(false);
    };
    document.addEventListener('mousedown', closeExport);
    return () => document.removeEventListener('mousedown', closeExport);
  }, [exportOpen]);

  /* close row menu on outside click / scroll / resize */
  useEffect(() => {
    if (!rowMenu) return undefined;

    const onDown = (event) => {
      if (menuRef.current?.contains(event.target)) return;
      if (event.target.closest?.('[data-row-menu-trigger]')) return;
      setRowMenu(null);
    };
    const close = () => setRowMenu(null);

    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);

    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [rowMenu]);

  /* ---------------- derived data ---------------- */

  const dateFilteredUsers = users;

  const counts = useMemo(
    () => ({
      total: dateFilteredUsers.length,
      active: dateFilteredUsers.filter((u) => u.status === 'Active').length,
      pending: dateFilteredUsers.filter((u) => u.status === 'Pending').length,
      suspended: dateFilteredUsers.filter((u) => u.status === 'Suspended').length,
      mfa: dateFilteredUsers.filter((u) => u.mfaEnabled).length
    }),
    [dateFilteredUsers]
  );

  const metricItems = [
    {
      id: 'total',
      title: 'Total Platform Users',
      value: counts.total,
      change: '8%',
      tone: 'green',
      accent: 'blue',
      icon: Users,
      description: 'All platform user accounts, including active, pending and suspended users.'
    },
    {
      id: 'active',
      title: 'Active Users',
      value: counts.active,
      change: '8%',
      tone: 'green',
      accent: 'green',
      icon: UserCheck,
      description: 'Users who currently have an active platform account.'
    },
    {
      id: 'pending',
      title: 'Pending Invitations',
      value: counts.pending,
      change: '2%',
      tone: 'green',
      accent: 'orange',
      icon: Mail,
      description: 'Users who were invited but have not completed account activation.'
    },
    {
      id: 'suspended',
      title: 'Suspended Accounts',
      value: counts.suspended,
      change: '4%',
      tone: 'red',
      accent: 'red',
      icon: ShieldAlert,
      description: 'Accounts temporarily restricted from accessing the platform.'
    }
  ];

  const filteredUsers = useMemo(() => {
    const query = normalize(search);

    return dateFilteredUsers.filter((user) => {
      const matchesSearch =
        !query ||
        normalize(user.name).includes(query) ||
        normalize(user.email).includes(query) ||
        normalize(user.role).includes(query);
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const isAll = user.companies === 'All Companies';
      const matchesCompany =
        companyFilter === 'all' ||
        (companyFilter === 'all-access' ? isAll : !isAll);
      const matchesMfa = mfaFilter === 'all' || (mfaFilter === 'enabled' ? user.mfaEnabled : !user.mfaEnabled);
      const matchesLastLogin = lastLoginFilter === 'all' ||
        (lastLoginFilter === 'today' ? user.lastLogin.startsWith('Today') :
        lastLoginFilter === 'yesterday' ? user.lastLogin.startsWith('Yesterday') :
        lastLoginFilter === 'never' ? user.lastLogin === 'Never' : true);
      return matchesSearch && matchesRole && matchesStatus && matchesCompany && matchesMfa && matchesLastLogin;
    });
  }, [dateFilteredUsers, search, roleFilter, statusFilter, companyFilter, mfaFilter, lastLoginFilter]);

  const visibleUsers = filteredUsers.slice(0, visibleCount);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || visibleCount >= filteredUsers.length) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisibleCount((count) => Math.min(count + 10, filteredUsers.length));
      }
    }, { root: null, rootMargin: '220px', threshold: 0 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredUsers.length, visibleCount]);

  /* ---------------- actions ---------------- */

  const applyFilter = (setter) => (value) => {
    setter(value);
    setVisibleCount(10);
  };

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setCompanyFilter('all');
    setMfaFilter('all');
    setLastLoginFilter('all');
    // Clear filters without changing any other page state.
    setVisibleCount(10);
    setToast(t('Filters cleared.'));
  };

  const showUserDetails = (user) => {
    setRowMenu(null);
    setDetail({ user });
  };

  const openAddUser = () => {
    setForm(EMPTY_FORM);
    setFormMode('add');
  };

  const openEditUser = (user) => {
    setRowMenu(null);
    setForm({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status });
    setFormMode('edit');
  };

  const handleSubmitForm = (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();

    if (!name || !email) {
      setToast(t('Please enter the user name and email address.'));
      return;
    }

    const duplicate = users.some(
      (user) => normalize(user.email) === normalize(email) && user.id !== form.id
    );

    if (duplicate) {
      setToast(t('A user with this email already exists.'));
      return;
    }

    if (formMode === 'edit') {
      setUsers((previous) =>
        previous.map((user) =>
          user.id === form.id ? { ...user, name, email, role: form.role, status: form.status } : user
        )
      );
      setToast(t('Platform user updated successfully.'));
    } else {
      setUsers((previous) => [
        {
          id: Date.now(),
          name,
          email,
          role: form.role,
          status: form.status,
          companies: 'All Companies',
          lastLogin: 'Never',
          mfaEnabled: false
        },
        ...previous
      ]);
      setVisibleCount(10);
      setToast(t('Platform user added successfully.'));
    }

    setFormMode(null);
  };

  const updateUserStatus = (user, nextStatus) => {
    setUsers((previous) =>
      previous.map((item) => (item.id === user.id ? { ...item, status: nextStatus } : item))
    );
    setRowMenu(null);
    setToast(`${user.name} — ${t('status updated to')} ${t(nextStatus)}.`);
  };

  const openRowMenu = (event, user) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 190;
    const menuHeight = 190;
    const openUp = rect.bottom + menuHeight > window.innerHeight;

    setRowMenu((current) =>
      current?.user.id === user.id
        ? null
        : {
            user,
            left: Math.max(8, rect.right - menuWidth),
            top: openUp ? Math.max(8, rect.top - menuHeight - 4) : rect.bottom + 4
          }
    );
  };

  const exportUsers = (format) => {
    const headers = ['Name', 'Email', 'Role', 'Assigned Companies', 'Last Login', 'Status', 'MFA'];
    const rows = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.role,
      user.companies,
      user.lastLogin,
      user.status,
      user.mfaEnabled ? 'Enabled' : 'Not enabled'
    ]);

    if (format === 'excel') {
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      worksheet['!cols'] = headers.map((header, index) => ({ wch: Math.max(header.length + 3, ...rows.map((row) => String(row[index] ?? '').length + 2), 14) }));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Platform Users');
      XLSX.writeFile(workbook, 'platform-users.xlsx');
    } else if (format === 'pdf') {
      const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
      const tableHead = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('');
      const tableRows = rows.map((row) => `<tr>${row.map((value) => `<td>${escapeHtml(value)}</td>`).join('')}</tr>`).join('');
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        setToast(t('Please allow pop-ups to export PDF.'));
        setExportOpen(false);
        return;
      }
      printWindow.document.write(`<!doctype html><html><head><title>Platform Users</title><style>
        body{font-family:Arial,sans-serif;padding:24px;color:#172b55}h1{font-size:20px;margin:0 0 6px}p{font-size:11px;color:#64748b;margin:0 0 18px}
        table{width:100%;border-collapse:collapse;font-size:10px}th{background:#edf3ff;color:#17336f;text-align:left}th,td{border:1px solid #dce5f2;padding:8px;vertical-align:top}
        tr{page-break-inside:avoid}@media print{body{padding:0}@page{size:landscape;margin:12mm}}
      </style></head><body><h1>Platform Users</h1><p>${rows.length} users · Exported ${new Date().toLocaleString()}</p><table><thead><tr>${tableHead}</tr></thead><tbody>${tableRows}</tbody></table><script>window.onload=()=>{window.print();};</script></body></html>`);
      printWindow.document.close();
    } else {
      const csv = [headers, ...rows]
        .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\r\n');
      const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'platform-users.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }

    setExportOpen(false);
    setToast(`${t('Exported')} ${filteredUsers.length} ${t('platform users')}.`);
  };

  const importUsers = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result || '').split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) { setToast(t('The selected CSV file has no user rows.')); return; }
      const headers = lines[0].split(',').map((value) => value.trim().toLowerCase().replace(/^"|"$/g, ''));
      const column = (...names) => headers.findIndex((header) => names.includes(header));
      const nameIndex = column('name', 'full name', 'user');
      const emailIndex = column('email', 'email address');
      const roleIndex = column('role');
      const statusIndex = column('status');
      const companyIndex = column('assigned companies', 'companies');
      if (nameIndex < 0 || emailIndex < 0) { setToast(t('CSV must include Name and Email columns.')); return; }
      const imported = lines.slice(1).map((line, index) => {
        const values = line.split(',').map((value) => value.trim().replace(/^"|"$/g, ''));
        const name = values[nameIndex];
        const email = values[emailIndex];
        if (!name || !email || users.some((user) => normalize(user.email) === normalize(email))) return null;
        const role = roleIndex >= 0 && ROLES.includes(values[roleIndex]) ? values[roleIndex] : 'Platform Analyst';
        const status = statusIndex >= 0 && STATUSES.includes(values[statusIndex]) ? values[statusIndex] : 'Pending';
        return { id: Date.now() + index, name, email, role, status, companies: companyIndex >= 0 && values[companyIndex] ? values[companyIndex] : 'All Companies', lastLogin: 'Never', mfaEnabled: false };
      }).filter(Boolean);
      if (imported.length) {
        setUsers((previous) => [...imported, ...previous]);
        setVisibleCount(10);
        setToast(`${imported.length} ${t('platform users imported successfully.')}`);
      } else setToast(t('No new users were imported. Check the CSV rows and email addresses.'));
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  const menuUser = rowMenu?.user;

  /* ---------------- render ---------------- */

  if (detail) {
    return (
      <div className="platform-users-page">
        <DetailPanel
          data={detail}
          onClose={() => setDetail(null)}
          onEdit={(user) => { setDetail(null); openEditUser(user); }}
          onResetPassword={(user) => { setDetail(null); setToast(`${t('Password reset link prepared for')} ${user.email}.`); }}
          onSuspend={(user) => { updateUserStatus(user, user.status === 'Suspended' ? 'Active' : 'Suspended'); setDetail(null); }}
          t={t}
        />
        {toast && <div className="pu-toast" role="status"><Check size={16} /><span>{toast}</span><button type="button" onClick={() => setToast('')} aria-label={t('Dismiss message')}><X size={15} /></button></div>}
      </div>
    );
  }

  return (
    <div className="platform-users-page">
      {/* Page header */}
      <div className="pu-page-header">
        <div className="pu-page-heading">
          <h1>{t('Platform Users')}</h1>
          <p>{t('Manage platform accounts, roles, access and account status.')}</p>
        </div>

        <div className="pu-page-actions">
          <button type="button" className="pu-primary-button" onClick={openAddUser}>
            <Plus size={17} />
            {t('Add Platform User')}
          </button>
          <button type="button" className="pu-secondary-button" onClick={() => importRef.current?.click()}>
            <Upload size={17} />
            {t('Import')}
          </button>
          <div className="pu-export-wrap" ref={exportMenuRef}>
            <button type="button" className="pu-secondary-button" aria-expanded={exportOpen} onClick={() => setExportOpen((open) => !open)}>
              <Download size={17} />
              {t('Export')}
              <ChevronDown size={15} />
            </button>
            {exportOpen && (
              <div className="pu-export-menu" role="menu">
                <button type="button" role="menuitem" onClick={() => exportUsers('pdf')}><FileText size={16} /> Export as PDF</button>
                <button type="button" role="menuitem" onClick={() => exportUsers('excel')}><FileSpreadsheet size={16} /> Export as Excel</button>
                <button type="button" role="menuitem" onClick={() => exportUsers('csv')}><Download size={16} /> Export as CSV</button>
              </div>
            )}
          </div>
          <input ref={importRef} className="pu-hidden-input" type="file" accept=".csv,text/csv" onChange={importUsers} />
        </div>
      </div>

      {/* KPI cards */}
      <div className="pu-metrics-grid">
        {metricItems.map((metric) => (
          <MetricCard key={metric.id} {...metric} title={t(metric.title)} t={t} />
        ))}
      </div>

      {/* Directory */}
      <section className="pu-directory-card">
        <div className="pu-directory-heading">
          <h2>{t('Platform User Directory')}</h2>

          <div className="pu-filter-toolbar">
            <label className="pu-search-field">
              <Search size={16} />
              <input
                ref={searchRef}
                type="search"
                value={search}
                onChange={(event) => applyFilter(setSearch)(event.target.value)}
                placeholder={t("Search users...")}
                aria-label={t("Search platform users")}
              />
            </label>

            <label className="pu-select-filter">
              <select
                value={roleFilter}
                onChange={(event) => applyFilter(setRoleFilter)(event.target.value)}
                aria-label={t("Role")}
              >
                <option value="all">{t("Role")}</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {t(role)}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} />
            </label>

            <label className="pu-select-filter">
              <select
                value={statusFilter}
                onChange={(event) => applyFilter(setStatusFilter)(event.target.value)}
                aria-label={t("Status")}
              >
                <option value="all">{t("Status")}</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(status)}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} />
            </label>

            <label className="pu-select-filter wide pu-company-filter">
              <span>{t("Company access")}</span>
              <select value={companyFilter} onChange={(event) => applyFilter(setCompanyFilter)(event.target.value)} aria-label={t("Company access")}>
                <option value="all">{t("All users")}</option>
                <option value="all-access">{t("All Companies access")}</option>
                <option value="specific">{t("Specific companies")}</option>
              </select>
              <ChevronDown size={15} />
            </label>
            <label className="pu-select-filter pu-advanced-filter">
              <span>{t('MFA Status')}</span>
              <select value={mfaFilter} onChange={(event) => applyFilter(setMfaFilter)(event.target.value)} aria-label={t('MFA Status')}>
                <option value="all">{t('All')}</option>
                <option value="enabled">{t('Enabled')}</option>
                <option value="disabled">{t('Not enabled')}</option>
              </select>
              <ChevronDown size={15} />
            </label>
            <label className="pu-select-filter pu-advanced-filter">
              <span>{t('Last Login')}</span>
              <select value={lastLoginFilter} onChange={(event) => applyFilter(setLastLoginFilter)(event.target.value)} aria-label={t('Last Login')}>
                <option value="all">{t('Any Time')}</option>
                <option value="today">{t('Today')}</option>
                <option value="yesterday">{t('Yesterday')}</option>
                <option value="never">{t('Never')}</option>
              </select>
              <ChevronDown size={15} />
            </label>
            <button type="button" className="pu-secondary-button pu-clear-filters-button" onClick={clearFilters}>
              {t('Reset')}
            </button>

          </div>
        </div>



        <div className="pu-table-scroll">
          <table className="pu-users-table">
            <thead>
              <tr>
                <th>{t("User")}</th>
                <th>{t("Email Address")}</th>
                <th>{t("Role")}</th>
                <th>{t("Assigned Companies")}</th>
                <th>{t("Access Scope")}</th>
                <th>{t("Last Login")}</th>
                <th>{t("MFA Status")}</th>
                <th>{t("Status")}</th>
                <th className="pu-actions-head">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <button type="button" className="pu-user-cell" onClick={() => showUserDetails(user)}>
                      <UserAvatar user={user} />
                      <strong>{user.name}</strong>
                    </button>
                  </td>
                  <td className="pu-email-cell">{user.email}</td>
                  <td>
                    <RolePill role={user.role} t={t} />
                  </td>
                  <td>{translateCompanyCount(user.companies)}</td>
                  <td>{user.companies === 'All Companies' ? t('All platform companies') : t('Selected companies only')}</td>
                  <td>{translateLogin(user.lastLogin)}</td>
                  <td><span className={`pu-mfa-badge ${user.mfaEnabled ? 'enabled' : 'disabled'}`}>{user.mfaEnabled ? t('Enabled') : t('Not enabled')}</span></td>
                  <td>
                    <StatusBadge status={user.status} t={t} />
                  </td>
                  <td className="pu-actions-cell">
                    <button
                      type="button"
                      className="pu-icon-action"
                      data-row-menu-trigger
                      aria-label={`${t("More actions")} — ${user.name}`}
                      aria-haspopup="menu"
                      aria-expanded={menuUser?.id === user.id}
                      onClick={(event) => openRowMenu(event, user)}
                    >
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {visibleUsers.length === 0 && <EmptyState onClear={clearFilters} t={t} />}
        </div>

        {filteredUsers.length > 0 && (
          <div className="pu-infinite-status" ref={loadMoreRef} aria-live="polite">
            {visibleUsers.length < filteredUsers.length
              ? t('Scroll to load more users')
              : `${t('Showing all')} ${filteredUsers.length} ${t('users')}`}
          </div>
        )}
      </section>

      {/* Row actions menu (fixed so it is never clipped by the table) */}
      {rowMenu && (
        <div
          className="pu-row-menu"
          role="menu"
          ref={menuRef}
          style={{ top: rowMenu.top, left: rowMenu.left }}
        >
          <button type="button" role="menuitem" onClick={() => showUserDetails(menuUser)}>
            <Eye size={15} />
            {t('View details')}
          </button>
          <button type="button" role="menuitem" onClick={() => openEditUser(menuUser)}>
            <Pencil size={15} />
            {t('Edit user')}
          </button>
          {menuUser.status === 'Suspended' ? (
            <button type="button" role="menuitem" onClick={() => updateUserStatus(menuUser, 'Active')}>
              <UserCheck size={15} />
              {t("Reactivate account")}
            </button>
          ) : (
            <button type="button" role="menuitem" onClick={() => updateUserStatus(menuUser, 'Suspended')}>
              <Ban size={15} />
              {t("Suspend account")}
            </button>
          )}
          {menuUser.status === 'Pending' && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setRowMenu(null);
                setToast(`${t('Invitation reminder sent to')} ${menuUser.email}.`);
              }}
            >
              <Send size={15} />
              {t("Resend invitation")}
            </button>
          )}
        </div>
      )}

      {/* Add / edit modal */}
      {formMode && (
        <div
          className="pu-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setFormMode(null);
          }}
        >
          <section className="pu-modal" role="dialog" aria-modal="true" aria-labelledby="pu-form-title">
            <div className="pu-modal-heading">
              <div>
                <h2 id="pu-form-title">{formMode === 'edit' ? t('Edit Platform User') : t('Add Platform User')}</h2>
                <p>
                  {formMode === 'edit'
                    ? t('Update the account details below.')
                    : t('Create a new platform-level account.')}
                </p>
              </div>
              <button
                type="button"
                className="pu-icon-action"
                onClick={() => setFormMode(null)}
                aria-label={t("Close")}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <label className="pu-form-field">
                <span>
                  {t("Full name")} <b>*</b>
                </span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
                  placeholder={t("Enter full name")}
                  required
                />
              </label>

              <label className="pu-form-field">
                <span>
                  {t("Email address")} <b>*</b>
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
                  placeholder="name@megsi.com"
                  required
                />
              </label>

              <div className="pu-form-grid">
                <label className="pu-form-field">
                  <span>{t("Platform role")}</span>
                  <select
                    value={form.role}
                    onChange={(event) => setForm((previous) => ({ ...previous, role: event.target.value }))}
                  >
                    {ROLES.map((role) => (
                      <option value={role} key={role}>
                        {t(role)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="pu-form-field">
                  <span>{t("Status")}</span>
                  <select
                    value={form.status}
                    onChange={(event) => setForm((previous) => ({ ...previous, status: event.target.value }))}
                  >
                    {STATUSES.map((status) => (
                      <option value={status} key={status}>
                        {t(status)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="pu-modal-actions">
                <button type="button" className="pu-secondary-button" onClick={() => setFormMode(null)} >
                  {t("Cancel")}
                </button>
                <button type="submit" className="pu-primary-button">
                  {formMode === 'edit' ? <Check size={16} /> : <Plus size={16} />}
                  {formMode === 'edit' ? t('Save changes') : t('Create User')}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {toast && (
        <div className="pu-toast" role="status">
          <Check size={16} />
          <span>{toast}</span>
          <button type="button" onClick={() => setToast('')} aria-label={t("Dismiss message")}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
