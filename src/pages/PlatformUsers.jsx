import { useEffect, useMemo, useRef, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import {
  AlertTriangle,
  ArrowUp,
  Ban,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
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

function getPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 2) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}

/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */

function MetricCard({ title, value, change, tone, icon: Icon, accent, onClick, t }) {
  return (
    <button
      type="button"
      className="pu-metric-card"
      onClick={onClick}
      aria-label={`${title}: ${value}. ${t ? t("Open details") : "Open details"}`}
    >
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
    </button>
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

function DetailPanel({ data, onClose, t = (value) => value }) {
  return (
    <div
      className="pu-drawer-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside className="pu-drawer" role="dialog" aria-modal="true" aria-label={data.title}>
        <div className="pu-drawer-heading">
          <div className="pu-drawer-title-wrap">
            <ShieldCheck className="pu-drawer-brand-mark" size={23} strokeWidth={2.2} />
            <div className="pu-drawer-title-copy">
            <h2>{t(data.title)}</h2>
            {data.subtitle && <p>{t(data.subtitle)}</p>}
            </div>
          </div>
          <button type="button" className="pu-icon-action" onClick={onClose} aria-label={t("Close")}>
            <X size={18} />
          </button>
        </div>
        <dl className="pu-drawer-list">
          {data.rows.map(([label, value], index) => (
            <div className="pu-drawer-row" key={`${label}-${index}`}>
              <dt>{t(label)}</dt>
              <dd>{t(value)}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </div>
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
  const [dateRange, setDateRange] = useState(DATE_RANGES[0]);
  const [dateRangeApplied, setDateRangeApplied] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState('2026-10-23');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(2026, 9, 1));
  const [calendarYearInput, setCalendarYearInput] = useState('2026');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [detail, setDetail] = useState(null);
  const [rowMenu, setRowMenu] = useState(null);
  const [formMode, setFormMode] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState('');
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [drilldownRole, setDrilldownRole] = useState(null);

  const searchRef = useRef(null);
  const dateRef = useRef(null);
  const menuRef = useRef(null);

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
        setShowDateMenu(false);
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

  /* close date menu on outside click */
  useEffect(() => {
    if (!showDateMenu) return undefined;
    const onDown = (event) => {
      if (dateRef.current && !dateRef.current.contains(event.target)) setShowDateMenu(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [showDateMenu]);

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

  // The selected date range is the dashboard-wide filter: cards, table, and charts
  // all derive from this same date-filtered dataset. Table-only filters are applied later.
  const dateFilteredUsers = useMemo(() => {
    if (!dateRangeApplied) return users;
    const bounds = getDateBounds(dateRange, customStartDate, customEndDate);
    if (!bounds.start || !bounds.end) return users;
    return users.filter((user) => {
      const loginDate = getLastLoginDate(user.lastLogin);
      return Boolean(loginDate && loginDate >= bounds.start && loginDate <= bounds.end);
    });
  }, [users, dateRange, dateRangeApplied, customStartDate, customEndDate]);

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

  const roleDistribution = useMemo(() => {
    const roles = [
      { name: 'Platform Admin', role: 'Platform Admin', color: '#2563eb' },
      { name: 'Support Admin', role: 'Support Admin', color: '#059669' },
      { name: 'Billing Admin', role: 'Billing Admin', color: '#f59e0b' },
      { name: 'Analyst', role: 'Platform Analyst', color: '#7c3aed' },
      { name: 'Auditor', role: 'Read-only Auditor', color: '#7b8db8' },
      { name: 'Platform Super Admin', role: 'Platform Super Admin', color: '#dc2626' }
    ];
    return roles.map((role) => ({ ...role, value: dateFilteredUsers.filter((user) => user.role === role.role).length }));
  }, [dateFilteredUsers]);
  const roleTotal = roleDistribution.reduce((sum, item) => sum + item.value, 0);

  const mfaPercent = counts.total ? Math.round((counts.mfa / counts.total) * 100) : 0;

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
      return matchesSearch && matchesRole && matchesStatus && matchesCompany;
    });
  }, [dateFilteredUsers, search, roleFilter, statusFilter, companyFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const visibleUsers = filteredUsers.slice(startIndex, startIndex + pageSize);
  const rangeStart = filteredUsers.length ? startIndex + 1 : 0;
  const rangeEnd = Math.min(startIndex + pageSize, filteredUsers.length);

  const allOnPageSelected =
    visibleUsers.length > 0 && visibleUsers.every((user) => selectedIds.has(user.id));

  /* ---------------- actions ---------------- */

  const applyFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setCompanyFilter('all');
    // Clear Filters applies only to the table filters. Keep the selected date range unchanged.
    setPage(1);
    setToast(t('Filters cleared.'));
  };

  const toggleRow = (id) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePage = () => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (allOnPageSelected) visibleUsers.forEach((user) => next.delete(user.id));
      else visibleUsers.forEach((user) => next.add(user.id));
      return next;
    });
  };

  const showMetricDetails = (metric) => {
    setDetail({
      title: metric.title,
      subtitle: 'Platform user overview',
      rows: [
        ['Current count', String(metric.value)],
        ['Change vs last month', `+${metric.change}`],
        ['Period', formatDateRangeLabel(dateRange, language, customStartDate, customEndDate)],
        ['Description', metric.description]
      ]
    });
  };

  const showUserDetails = (user) => {
    setRowMenu(null);
    setDetail({
      title: user.name,
      subtitle: user.role,
      rows: [
        ['Email', user.email],
        ['Role', user.role],
        ['Assigned companies', translateCompanyCount(user.companies)],
        ['Last login', translateLogin(user.lastLogin)],
        ['Status', user.status],
        ['MFA', user.mfaEnabled ? 'Enabled' : 'Not enabled']
      ]
    });
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
      setPage(1);
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

  const exportUsers = () => {
    const headers = ['Name', 'Email', 'Role', 'Assigned Companies', 'Last Login', 'Status'];
    const rows = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.role,
      user.companies,
      user.lastLogin,
      user.status
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'platform-users.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setToast(`${t('Exported')} ${filteredUsers.length} ${t('platform users')}.`);
  };

  const menuUser = rowMenu?.user;

  /* ---------------- render ---------------- */

  return (
    <div className="platform-users-page">
      {/* Page header */}
      <div className="pu-page-header">
        <div className="pu-page-heading">
          <h1>{t('Platform Users')}</h1>
          <p>{t('Manage platform accounts, roles, access and account status.')}</p>
        </div>

        <div className="pu-date-wrap" ref={dateRef}>
          <button
            type="button"
            className="pu-date-control"
            onClick={() => setShowDateMenu((value) => !value)}
            aria-haspopup="listbox"
            aria-expanded={showDateMenu}
          >
            <CalendarDays size={17} />
            <span>{dateRange.name === "Custom Date" ? `${t("Custom Date")}: ${dateRange.label}` : `${t(dateRange.name)} · ${formatDateRangeLabel(dateRange, language, customStartDate, customEndDate)}`}</span>
            <ChevronDown size={16} />
          </button>

          {showDateMenu && (
            <div className="pu-date-menu pu-date-menu-compact" role="dialog" aria-label={t('Date range')}>
              {DATE_RANGES.filter((range) => !range.custom).map((range) => (
                <button type="button" key={range.name} className={dateRange.name === range.name ? 'selected' : ''}
                  onClick={() => {
                    setDateRange(range); setDateRangeApplied(true); setPage(1); setShowDateMenu(false); setShowCustomDates(false);
                    setToast(`${t('Date range set to')} ${t(range.name)}.`);
                  }}>
                  <strong>{t(range.name)}</strong><span>{formatDateRangeLabel(range, language, customStartDate, customEndDate)}</span>
                </button>
              ))}
              <div className="pu-date-custom">
                <strong>{t('Custom range')}</strong>
                <label><span>{t('From')}</span><input type="date" value={customStartDate} max={customEndDate || undefined} onChange={(event) => setCustomStartDate(event.target.value)} /></label>
                <label><span>{t('To')}</span><input type="date" value={customEndDate} min={customStartDate || undefined} onChange={(event) => setCustomEndDate(event.target.value)} /></label>
                <button type="button" className="pu-date-apply" disabled={!customStartDate || !customEndDate || customStartDate > customEndDate}
                  onClick={() => {
                    const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                    const range = { name: 'Custom Date', label: `${formatDate(customStartDate)} - ${formatDate(customEndDate)}`, start: customStartDate, end: customEndDate };
                    setDateRange(range); setDateRangeApplied(true); setPage(1); setShowDateMenu(false); setShowCustomDates(false);
                    setToast(`${t('Date range set to')} ${range.label}.`);
                  }}>{t('Apply')}</button>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Primary actions */}
      <div className="pu-page-actions">
        <button type="button" className="pu-primary-button" onClick={openAddUser}>
          <Plus size={17} />
          {t('Add Platform User')}
        </button>
        <button type="button" className="pu-secondary-button" onClick={exportUsers}>
          <Download size={17} />
          {t('Export')}
        </button>
      </div>

      {/* KPI cards */}
      <div className="pu-metrics-grid">
        {metricItems.map((metric) => (
          <MetricCard key={metric.id} {...metric} title={t(metric.title)} description={t(metric.description)} onClick={() => showMetricDetails(metric)} t={t} />
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
            <button type="button" className="pu-secondary-button pu-clear-filters-button" onClick={clearFilters}>
              {t('Clear Filters')}
            </button>

          </div>
        </div>



        {selectedIds.size > 0 && (
          <div className="pu-selection-toolbar" role="region" aria-label={t("Bulk user actions")}>
            <span><strong>{selectedIds.size}</strong> {t('users selected')}</span>
            <button type="button" className="pu-text-button" onClick={() => setSelectedIds(new Set())}>{t('Clear selection')}</button>
            <button type="button" className="pu-secondary-button pu-danger-button" onClick={() => {
              const selectedUsers = users.filter((user) => selectedIds.has(user.id));
              if (!selectedUsers.length) return;
              if (!window.confirm(t('Are you sure you want to delete the selected users?'))) return;
              setUsers((previous) => previous.filter((user) => !selectedIds.has(user.id)));
              setSelectedIds(new Set());
              setToast(`${selectedUsers.length} ${t('selected users.')}`);
            }}><X size={15} /> {t('Delete selected')}</button>
            <button type="button" className="pu-secondary-button" onClick={() => {
              const selectedUsers = users.filter((user) => selectedIds.has(user.id));
              const csvRows = [['Name', 'Email', 'Role', 'Companies', 'Last Login', 'Status'],
                ...selectedUsers.map((user) => [user.name, user.email, user.role, user.companies, user.lastLogin, user.status])];
              const csv = csvRows.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'selected-platform-users.csv';
              document.body.appendChild(link);
              link.click();
              link.remove();
              URL.revokeObjectURL(url);
              setToast(`${t('Exported')} ${selectedUsers.length} ${t('selected users')}.`);
            }}><Download size={15} /> {t('Export selected')}</button>
          </div>
        )}

        <div className="pu-table-scroll">
          <table className="pu-users-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label={t("Select all users on this page")}
                    checked={allOnPageSelected}
                    onChange={togglePage}
                  />
                </th>
                <th>{t("User")}</th>
                <th>{t("Email Address")}</th>
                <th>{t("Role")}</th>
                <th>{t("Assigned Companies")}</th>
                <th>{t("Last Login")}</th>
                <th>{t("Status")}</th>
                <th className="pu-actions-head">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => (
                <tr key={user.id} className={selectedIds.has(user.id) ? 'selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`${t("Select")} ${user.name}`}
                      checked={selectedIds.has(user.id)}
                      onChange={() => toggleRow(user.id)}
                    />
                  </td>
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
                  <td>{translateLogin(user.lastLogin)}</td>
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

        <div className="pu-pagination">
          <span className="pu-showing">
            {t("Showing")} {rangeStart}–{rangeEnd} {t("of")} {filteredUsers.length} {t("users")}
          </span>

          <label className="pu-pagination-size">
            <span className="sr-only">{t("Rows per page")}</span>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              aria-label={t("Rows per page")}
            >
              {[7, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} / {t("page")}
                </option>
              ))}
            </select>
          </label>

          <div className="pu-pagination-controls">
            <button
              type="button"
              aria-label={t("Previous page")}
              disabled={safePage <= 1}
              onClick={() => setPage(Math.max(1, safePage - 1))}
            >
              <ChevronLeft size={16} />
            </button>

            {getPageList(safePage, totalPages).map((item, index) =>
              item === '…' ? (
                <span className="pu-page-gap" key={`gap-${index}`}>
                  …
                </span>
              ) : (
                <button
                  type="button"
                  key={item}
                  className={item === safePage ? 'active' : ''}
                  aria-current={item === safePage ? 'page' : undefined}
                  onClick={() => setPage(item)}
                >
                  {item}
                </button>
              )
            )}

            <button
              type="button"
              aria-label={t("Next page")}
              disabled={safePage >= totalPages}
              onClick={() => setPage(Math.min(totalPages, safePage + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Analytics */}
      <section className="pu-analytics-grid">
        {/* Recent activity */}
        <div className="pu-analytics-card">
          <div className="pu-analytics-heading">
            <h2>{t("Recent User Activity")}</h2>
            <button
              type="button"
              className="pu-view-all-button"
              onClick={() => setShowAllActivity((value) => !value)}
              aria-expanded={showAllActivity}
             >
              {showAllActivity ? t("Close details") : t("View All")}
            </button>
          </div>

          <div className="pu-activity-list">
            {ACTIVITY.map((item) => {
              const Icon = item.icon;
              return (
                <div className="pu-activity-item" key={item.id}>
                  <span className={`pu-activity-icon ${item.tone}`}>
                    <Icon size={16} strokeWidth={2.4} />
                  </span>
                  <div className="pu-activity-content">
                    <p>
                      <strong>{item.name}</strong> {t(item.text)}
                    </p>
                    <span>
                      {t(item.detail)} &nbsp;·&nbsp; {t(item.time)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {showAllActivity && (
            <div className="pu-activity-expanded" role="region" aria-label={t('Latest activity')}>
              <div className="pu-activity-expanded-heading"><span className="pu-activity-expanded-mark"><CalendarCheck size={16} /></span><strong>{t('Latest activity')}</strong></div>
              {ACTIVITY.map((item) => (
                <div className="pu-activity-expanded-row" key={`expanded-${item.id}`}>
                  <strong>{item.name}</strong><span>{t(item.text)}</span><small>{t(item.detail)} · {t(item.time)}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Role distribution */}
        <div className="pu-analytics-card">
          <div className="pu-analytics-heading">
            <h2>{t("Role Distribution")}</h2>
          </div>

          <div className="pu-role-chart-layout">
            <div className="pu-role-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="58%"
                    outerRadius="98%"
                    stroke="#fff"
                    strokeWidth={2}
                    label={renderSliceLabel}
                    labelLine={false}
                    onClick={(entry) => setDrilldownRole(entry?.role || entry?.payload?.role || null)}
                    cursor="pointer"
                  >
                    {roleDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} ${t("users")}`, t(name)]} />
                </PieChart>
              </ResponsiveContainer>

              <div className="pu-chart-center">
                <strong>{roleTotal}</strong>
                <span>{t("Total Users")}</span>
              </div>
            </div>

            <div className="pu-role-legend">
              {roleDistribution.map((item) => (
                <button
                  type="button"
                  className={`pu-role-legend-item ${drilldownRole === item.role ? 'active' : ''}`}
                  key={item.name}
                  onClick={() => setDrilldownRole((current) => current === item.role ? null : item.role)}
                  aria-label={`${item.name}: ${item.value} users`}
                >
                  <span className="pu-role-legend-dot" style={{ background: item.color }} />
                  <span className="pu-role-legend-name">{t(item.name)}</span>
                  <strong>{item.value}</strong>
                </button>
              ))}
            </div>
          </div>
          {drilldownRole && (
            <div className="pu-chart-drilldown" role="region" aria-label={t('Drill-down details')}>
              <div className="pu-chart-drilldown-heading">
                <div><strong>{t(drilldownRole)}</strong><span>{t('Users in this role')}</span></div>
                <button type="button" className="pu-icon-action" onClick={() => setDrilldownRole(null)} aria-label={t('Close details')}><X size={16} /></button>
              </div>
              <div className="pu-chart-drilldown-stats">
                <strong>{dateFilteredUsers.filter((user) => user.role === drilldownRole).length}</strong>
                <span>{t('Total Users')}</span>
              </div>
              <div className="pu-chart-drilldown-users">
                {dateFilteredUsers.filter((user) => user.role === drilldownRole).slice(0, 5).map((user) => (
                  <button type="button" key={user.id} onClick={() => showUserDetails(user)}><UserAvatar user={user} /><span><strong>{user.name}</strong><small>{user.email}</small></span><ChevronRight size={15} /></button>
                ))}
                {dateFilteredUsers.every((user) => user.role !== drilldownRole) && <p>{t('No users match this role.')}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Access security */}
        <div className="pu-analytics-card">
          <div className="pu-analytics-heading">
            <h2 className="pu-heading-with-icon">
              <ShieldCheck size={20} />
              {t("Access Security")}
            </h2>
          </div>

          <div className="pu-security-list">
            <div className="pu-security-row">
              <span className="pu-security-icon">
                <Lock size={18} />
              </span>
              <div className="pu-security-copy">
                <div className="pu-security-line">
                  <span>{t("MFA Enabled")}</span>
                  <strong>{mfaPercent}%</strong>
                </div>
                <div className="pu-progress-track">
                  <span className="green" style={{ width: `${mfaPercent}%` }} />
                </div>
              </div>
            </div>

            <div className="pu-security-row">
              <span className="pu-security-icon">
                <Users size={18} />
              </span>
              <div className="pu-security-copy">
                <div className="pu-security-line">
                  <span>{t("Users with MFA")}</span>
                  <strong>
                    {counts.mfa} / {counts.total}
                  </strong>
                </div>
                <div className="pu-progress-track">
                  <span className="blue" style={{ width: `${mfaPercent}%` }} />
                </div>
              </div>
            </div>

            <div className="pu-security-row">
              <span className="pu-security-icon">
                <CalendarCheck size={18} />
              </span>
              <div className="pu-security-copy">
                <div className="pu-security-line">
                  <span>{t("Last access review")}</span>
                  <strong>{new Date(2026, 9, 20).toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                </div>
                <span className="pu-review-completed">{t("Completed")}</span>
              </div>
            </div>
          </div>
        </div>
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

      {detail && <DetailPanel data={detail} onClose={() => setDetail(null)} t={t} />}

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
