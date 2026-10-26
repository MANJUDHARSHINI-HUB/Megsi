// Central translation dictionary (en / fr / de). Proper names (MEGSI, people, companies, plan names) are not translated.
const en = {
  brandSub: 'SECURITY WORKFORCE MANAGEMENT', badge: 'PLATFORM ADMIN', appName: 'MEGSI Platform', version: 'Version 1.0.0',
  'g.tenants': 'TENANTS MANAGEMENT', 'g.users': 'USERS & ACCESS', 'g.system': 'SYSTEM MANAGEMENT', 'g.support': 'SUPPORT',
  'nav.dashboard': 'Dashboard', 'nav.companies': 'Companies', 'nav.plans': 'Subscription Plans', 'nav.billing': 'Tenant Billing', 'nav.usage': 'Usage & Limits', 'nav.onboarding': 'Onboarding', 'nav.suspended': 'Suspended Tenants',
  'nav.pusers': 'Platform Users', 'nav.cadmins': 'Customer Admins', 'nav.roles': 'Roles & Permissions', 'nav.alogs': 'Access Logs', 'nav.support-access': 'Support Access',
  'nav.settings': 'System Settings', 'nav.integrations': 'Integrations', 'nav.email': 'Email & SMS', 'nav.security': 'Security & Compliance', 'nav.audit': 'Audit Logs', 'nav.backup': 'Data Backup', 'nav.monitoring': 'System Monitoring',
  'nav.tickets': 'Support Tickets', 'nav.announce': 'Announcements', 'nav.features': 'Feature Requests',
  'navd.companies': 'Manage all tenant companies on the platform.', 'navd.plans': 'Define and manage Starter, Professional, Business and Enterprise plans.', 'navd.billing': 'Invoices, payments and billing history for tenants.', 'navd.usage': 'Monitor tenant usage against plan limits.', 'navd.onboarding': 'Track new tenant onboarding progress.', 'navd.suspended': 'Review and reactivate suspended tenants.',
  'navd.pusers': 'Manage MEGSI platform staff accounts.', 'navd.cadmins': 'Administrators of customer tenants.', 'navd.roles': 'Configure roles and permission sets.', 'navd.alogs': 'Sign-in and access history.', 'navd.support-access': 'Time-limited support access to tenant data.',
  'navd.settings': 'Global platform configuration.', 'navd.integrations': 'Connect third-party services.', 'navd.email': 'Email and SMS provider configuration.', 'navd.security': 'Security policies and compliance reporting.', 'navd.audit': 'Immutable record of administrative actions.', 'navd.backup': 'Backup schedules and restore points.', 'navd.monitoring': 'Infrastructure health and performance.',
  'navd.tickets': 'Customer support ticket queue.', 'navd.announce': 'Publish platform announcements.', 'navd.features': 'Customer feature request board.',
  'search.ph': 'Search companies, users, tickets, plans...', 'search.none': 'No results for “{q}”', 'type.page': 'Page', 'type.company': 'Company', 'type.user': 'User',
  'notif.title': 'Notifications', 'notif.read': 'Mark all as read', 'notif.empty': "You're all caught up", 'n.ticket': 'Support ticket {id} needs attention', 'n.backup': 'Nightly backup completed',
  'ago.m': '{n} min ago', 'ago.h': '{n} hr ago', 'ago.d': 'Yesterday',
  'help.center': 'Help Centre', 'help.shortcuts': 'Keyboard Shortcuts', 'help.support': 'Contact Support', 'help.centerMsg': 'Help centre is a demonstration — not connected.', 'help.shortcutsMsg': 'Keyboard: Ctrl + K opens search, Esc closes menus.',
  'prof.profile': 'Profile', 'prof.settings': 'Account Settings', 'prof.signout': 'Sign Out', 'prof.demo': '{label} is a demonstration action.', role: 'Platform Super Admin',
  title: 'Platform Dashboard', welcome: "Welcome back, David! Here's an overview of the MEGSI platform.",
  'preset.oct': 'October 2026', 'preset.sep': 'September 2026', 'preset.q3': 'Q3 2026', 'preset.ytd': 'Year to date', 'preset.l12': 'Last 12 months',
  'date.custom': 'Custom range', 'date.from': 'From', 'date.to': 'To', 'date.apply': 'Apply', 'date.invalid': 'Start date must be on or before the end date.', 'empty.period': 'No data for the selected period',
  'kpi.companies.t': 'Total Companies', 'kpi.companies.d': 'Active tenants', 'kpi.users.t': 'Total Users', 'kpi.users.d': 'Across all companies',
  'kpi.guards.t': 'Active Guards', 'kpi.guards.d': 'On duty this month', 'kpi.guards.dp': 'On duty in period', 'kpi.sites.t': 'Total Sites', 'kpi.sites.d': 'Across all tenants',
  'kpi.incidents.t': 'Total Incidents', 'kpi.incidents.d': 'This month', 'kpi.incidents.dp': 'In period', 'kpi.revenue.t': 'Monthly Revenue', 'kpi.revenue.d': 'From subscriptions', 'kpi.revenue.dp': 'In period',
  'kd.change': 'Change', 'kd.active': 'Active', 'kd.trial': 'Trial', 'kd.suspended': 'Suspended', 'kd.newPeriod': 'New in period', 'kd.admins': 'Admins', 'kd.managers': 'Managers', 'kd.guards': 'Guards', 'kd.day': 'Day shift', 'kd.night': 'Night shift',
  'kd.corp': 'Corporate', 'kd.retail': 'Retail', 'kd.resi': 'Residential', 'kd.crit': 'Critical', 'kd.mod': 'Moderate', 'kd.low': 'Low', demoNote: 'Demonstration data only — not connected to a backend.', close: 'Close',
  'ch.growth': 'Company Growth', 'ch.plans': 'Tenant Plan Distribution', 'ch.revenue': 'Platform Revenue', 'range.30d': 'Last 30 Days', 'range.6m': 'Last 6 Months', 'range.12m': 'Last 12 Months', 'plan.all': 'All Plans',
  companiesN: '{n} Companies', companiesWord: 'Companies', others: 'Others', 'tt.total': 'Total', 'tt.revenue': 'Revenue',
  'tb.companies': 'Recent Companies', 'tb.signups': 'Recent Signups', viewAll: 'View All',
  'col.num': '#', 'col.company': 'Company Name', 'col.plan': 'Plan', 'col.users': 'Users', 'col.sites': 'Sites', 'col.status': 'Status', 'col.joined': 'Joined Date', 'col.actions': 'Actions', 'col.contact': 'Contact Person', 'col.date': 'Date',
  'col.event': 'Event', 'col.when': 'Date & Time', 'col.type': 'Type', 'col.rank': 'Rank',
  'act.view': 'View Details', 'act.edit': 'Edit Company', 'act.sub': 'View Subscription', 'toast.edit': 'Edit Company (demo): {name}',
  'd.plan': 'Plan', 'd.users': 'Users', 'd.sites': 'Sites', 'd.status': 'Status', 'd.joined': 'Joined', 'd.billing': 'Billing', 'd.monthly': 'Monthly', 'd.renewal': 'Renewal', 'd.role': 'Role', 'd.type': 'Type', 'd.demoUser': 'Demo user', 'd.checked': 'Last checked',
  'status.Active': 'Active', 'status.Trial': 'Trial', 'status.Suspended': 'Suspended', 'status.Operational': 'Operational',
  'pn.activity': 'Platform Activity', 'pn.top': 'Top Companies by Users', 'pn.health': 'System Health', allOk: 'All Systems Operational',
  'hm.uptime': 'Server Uptime', 'hm.uptime.s': 'Last 30 days', 'hm.api': 'API Response Time', 'hm.api.s': 'Average', 'hm.db': 'Database Load', 'hm.db.s': 'Current', 'hm.sessions': 'Active Sessions', 'hm.sessions.s': 'Users online',
  'svc.app': 'Application Servers', 'svc.db': 'Database Servers', 'svc.email': 'Email & SMS Services', lastChecked: 'Last checked: {d}',
  'act.company': 'New company registered: {name}', 'act.upgrade': 'Plan upgraded: {name} → {plan} Plan', 'act.user': 'New user added: {name} (Admin)', 'act.payment': 'Payment received: {amount} – {name}', 'act.ticket': 'Support ticket created: {id}',
  'act.suspend': 'Company suspended: {name}', 'act.backup': 'Backup completed successfully', 'act.downgrade': 'Plan downgraded: {name} → {plan} Plan', 'act.backupFailed': 'Nightly backup failed',
  'kind.company': 'Company', 'kind.user': 'User', 'kind.upgrade': 'Upgrade', 'kind.info': 'Info', 'kind.payment': 'Payment', 'kind.ticket': 'Ticket', 'kind.attention': 'Attention', 'kind.suspend': 'Suspension', 'kind.failed': 'Failure',
  'tp.companies': 'All Companies', 'tp.signups': 'All Signups', 'tp.activity': 'Platform Activity', 'tp.top': 'Top Companies by Users', 'tp.records': '{a} of {b} records (mock data)', 'tp.search': 'Search...', all: 'All', back: 'Back to Dashboard',
  'ua.status': 'Not Connected', 'ua.title': '{name} is not implemented', 'ua.body': 'This screen is a frontend demonstration. It is not connected to a backend or any real service, and no data is read or saved.',
};
const fr = {
  brandSub: 'GESTION DES EFFECTIFS DE SÉCURITÉ', badge: 'ADMIN PLATEFORME', appName: 'MEGSI Platform', version: 'Version 1.0.0',
  'g.tenants': 'GESTION DES LOCATAIRES', 'g.users': 'UTILISATEURS ET ACCÈS', 'g.system': 'GESTION DU SYSTÈME', 'g.support': 'ASSISTANCE',
  'nav.dashboard': 'Tableau de bord', 'nav.companies': 'Entreprises', 'nav.plans': 'Forfaits d’abonnement', 'nav.billing': 'Facturation des locataires', 'nav.usage': 'Utilisation et limites', 'nav.onboarding': 'Intégration', 'nav.suspended': 'Locataires suspendus',
  'nav.pusers': 'Utilisateurs de la plateforme', 'nav.cadmins': 'Administrateurs clients', 'nav.roles': 'Rôles et autorisations', 'nav.alogs': 'Journaux d’accès', 'nav.support-access': 'Accès support',
  'nav.settings': 'Paramètres système', 'nav.integrations': 'Intégrations', 'nav.email': 'E-mail et SMS', 'nav.security': 'Sécurité et conformité', 'nav.audit': 'Journaux d’audit', 'nav.backup': 'Sauvegarde des données', 'nav.monitoring': 'Surveillance du système',
  'nav.tickets': 'Tickets d’assistance', 'nav.announce': 'Annonces', 'nav.features': 'Demandes de fonctionnalités',
  'navd.companies': 'Gérez toutes les entreprises locataires de la plateforme.', 'navd.plans': 'Définissez et gérez les forfaits Starter, Professional, Business et Enterprise.', 'navd.billing': 'Factures, paiements et historique de facturation des locataires.', 'navd.usage': 'Suivez l’utilisation des locataires par rapport aux limites du forfait.', 'navd.onboarding': 'Suivez l’intégration des nouveaux locataires.', 'navd.suspended': 'Examinez et réactivez les locataires suspendus.',
  'navd.pusers': 'Gérez les comptes du personnel de la plateforme MEGSI.', 'navd.cadmins': 'Administrateurs des locataires clients.', 'navd.roles': 'Configurez les rôles et les ensembles d’autorisations.', 'navd.alogs': 'Historique des connexions et des accès.', 'navd.support-access': 'Accès support limité dans le temps aux données des locataires.',
  'navd.settings': 'Configuration globale de la plateforme.', 'navd.integrations': 'Connectez des services tiers.', 'navd.email': 'Configuration des fournisseurs d’e-mail et de SMS.', 'navd.security': 'Politiques de sécurité et rapports de conformité.', 'navd.audit': 'Historique inaltérable des actions d’administration.', 'navd.backup': 'Planifications de sauvegarde et points de restauration.', 'navd.monitoring': 'État et performances de l’infrastructure.',
  'navd.tickets': 'File des tickets d’assistance clients.', 'navd.announce': 'Publiez des annonces sur la plateforme.', 'navd.features': 'Tableau des demandes de fonctionnalités des clients.',
  'search.ph': 'Rechercher entreprises, utilisateurs, tickets, forfaits...', 'search.none': 'Aucun résultat pour « {q} »', 'type.page': 'Page', 'type.company': 'Entreprise', 'type.user': 'Utilisateur',
  'notif.title': 'Notifications', 'notif.read': 'Tout marquer comme lu', 'notif.empty': 'Vous êtes à jour', 'n.ticket': 'Le ticket {id} nécessite votre attention', 'n.backup': 'Sauvegarde nocturne terminée',
  'ago.m': 'il y a {n} min', 'ago.h': 'il y a {n} h', 'ago.d': 'Hier',
  'help.center': 'Centre d’aide', 'help.shortcuts': 'Raccourcis clavier', 'help.support': 'Contacter le support', 'help.centerMsg': 'Le centre d’aide est une démonstration — non connecté.', 'help.shortcutsMsg': 'Clavier : Ctrl + K ouvre la recherche, Échap ferme les menus.',
  'prof.profile': 'Profil', 'prof.settings': 'Paramètres du compte', 'prof.signout': 'Se déconnecter', 'prof.demo': '« {label} » est une action de démonstration.', role: 'Super administrateur de la plateforme',
  title: 'Tableau de bord de la plateforme', welcome: 'Bon retour, David ! Voici un aperçu de la plateforme MEGSI.',
  'preset.oct': 'Octobre 2026', 'preset.sep': 'Septembre 2026', 'preset.q3': 'T3 2026', 'preset.ytd': 'Depuis le début de l’année', 'preset.l12': '12 derniers mois',
  'date.custom': 'Période personnalisée', 'date.from': 'Du', 'date.to': 'Au', 'date.apply': 'Appliquer', 'date.invalid': 'La date de début doit précéder la date de fin.', 'empty.period': 'Aucune donnée pour la période sélectionnée',
  'kpi.companies.t': 'Total des entreprises', 'kpi.companies.d': 'Locataires actifs', 'kpi.users.t': 'Total des utilisateurs', 'kpi.users.d': 'Toutes entreprises confondues',
  'kpi.guards.t': 'Agents actifs', 'kpi.guards.d': 'En service ce mois-ci', 'kpi.guards.dp': 'En service sur la période', 'kpi.sites.t': 'Total des sites', 'kpi.sites.d': 'Tous locataires confondus',
  'kpi.incidents.t': 'Total des incidents', 'kpi.incidents.d': 'Ce mois-ci', 'kpi.incidents.dp': 'Sur la période', 'kpi.revenue.t': 'Revenus mensuels', 'kpi.revenue.d': 'Issus des abonnements', 'kpi.revenue.dp': 'Sur la période',
  'kd.change': 'Évolution', 'kd.active': 'Actifs', 'kd.trial': 'Essai', 'kd.suspended': 'Suspendus', 'kd.newPeriod': 'Nouveaux sur la période', 'kd.admins': 'Administrateurs', 'kd.managers': 'Responsables', 'kd.guards': 'Agents', 'kd.day': 'Équipe de jour', 'kd.night': 'Équipe de nuit',
  'kd.corp': 'Entreprises', 'kd.retail': 'Commerce', 'kd.resi': 'Résidentiel', 'kd.crit': 'Critique', 'kd.mod': 'Modérée', 'kd.low': 'Faible', demoNote: 'Données de démonstration uniquement — non connecté à un serveur.', close: 'Fermer',
  'ch.growth': 'Croissance des entreprises', 'ch.plans': 'Répartition des forfaits', 'ch.revenue': 'Revenus de la plateforme', 'range.30d': '30 derniers jours', 'range.6m': '6 derniers mois', 'range.12m': '12 derniers mois', 'plan.all': 'Tous les forfaits',
  companiesN: '{n} entreprises', companiesWord: 'Entreprises', others: 'Autres', 'tt.total': 'Total', 'tt.revenue': 'Revenus',
  'tb.companies': 'Entreprises récentes', 'tb.signups': 'Inscriptions récentes', viewAll: 'Tout voir',
  'col.num': '#', 'col.company': 'Nom de l’entreprise', 'col.plan': 'Forfait', 'col.users': 'Utilisateurs', 'col.sites': 'Sites', 'col.status': 'Statut', 'col.joined': 'Date d’inscription', 'col.actions': 'Actions', 'col.contact': 'Contact', 'col.date': 'Date',
  'col.event': 'Événement', 'col.when': 'Date et heure', 'col.type': 'Type', 'col.rank': 'Rang',
  'act.view': 'Voir les détails', 'act.edit': 'Modifier l’entreprise', 'act.sub': 'Voir l’abonnement', 'toast.edit': 'Modifier l’entreprise (démo) : {name}',
  'd.plan': 'Forfait', 'd.users': 'Utilisateurs', 'd.sites': 'Sites', 'd.status': 'Statut', 'd.joined': 'Inscription', 'd.billing': 'Facturation', 'd.monthly': 'Mensuelle', 'd.renewal': 'Renouvellement', 'd.role': 'Rôle', 'd.type': 'Type', 'd.demoUser': 'Utilisateur démo', 'd.checked': 'Dernière vérification',
  'status.Active': 'Actif', 'status.Trial': 'Essai', 'status.Suspended': 'Suspendu', 'status.Operational': 'Opérationnel',
  'pn.activity': 'Activité de la plateforme', 'pn.top': 'Principales entreprises par utilisateurs', 'pn.health': 'État du système', allOk: 'Tous les systèmes opérationnels',
  'hm.uptime': 'Disponibilité serveur', 'hm.uptime.s': '30 derniers jours', 'hm.api': 'Temps de réponse API', 'hm.api.s': 'Moyenne', 'hm.db': 'Charge de la base', 'hm.db.s': 'Actuelle', 'hm.sessions': 'Sessions actives', 'hm.sessions.s': 'Utilisateurs en ligne',
  'svc.app': 'Serveurs d’application', 'svc.db': 'Serveurs de base de données', 'svc.email': 'Services e-mail et SMS', lastChecked: 'Dernière vérification : {d}',
  'act.company': 'Nouvelle entreprise enregistrée : {name}', 'act.upgrade': 'Forfait amélioré : {name} → forfait {plan}', 'act.user': 'Nouvel utilisateur ajouté : {name} (Admin)', 'act.payment': 'Paiement reçu : {amount} – {name}', 'act.ticket': 'Ticket d’assistance créé : {id}',
  'act.suspend': 'Entreprise suspendue : {name}', 'act.backup': 'Sauvegarde terminée avec succès', 'act.downgrade': 'Forfait rétrogradé : {name} → forfait {plan}', 'act.backupFailed': 'Échec de la sauvegarde nocturne',
  'kind.company': 'Entreprise', 'kind.user': 'Utilisateur', 'kind.upgrade': 'Mise à niveau', 'kind.info': 'Info', 'kind.payment': 'Paiement', 'kind.ticket': 'Ticket', 'kind.attention': 'Attention', 'kind.suspend': 'Suspension', 'kind.failed': 'Échec',
  'tp.companies': 'Toutes les entreprises', 'tp.signups': 'Toutes les inscriptions', 'tp.activity': 'Activité de la plateforme', 'tp.top': 'Principales entreprises par utilisateurs', 'tp.records': '{a} sur {b} enregistrements (données fictives)', 'tp.search': 'Rechercher...', all: 'Tous', back: 'Retour au tableau de bord',
  'ua.status': 'Non connecté', 'ua.title': '« {name} » n’est pas implémenté', 'ua.body': 'Cet écran est une démonstration front-end. Il n’est connecté à aucun serveur ni service réel, et aucune donnée n’est lue ni enregistrée.',
};
const de = {
  brandSub: 'SICHERHEITSPERSONAL-MANAGEMENT', badge: 'PLATTFORM-ADMIN', appName: 'MEGSI Platform', version: 'Version 1.0.0',
  'g.tenants': 'MANDANTENVERWALTUNG', 'g.users': 'BENUTZER & ZUGRIFF', 'g.system': 'SYSTEMVERWALTUNG', 'g.support': 'SUPPORT',
  'nav.dashboard': 'Dashboard', 'nav.companies': 'Unternehmen', 'nav.plans': 'Abonnementpläne', 'nav.billing': 'Mandantenabrechnung', 'nav.usage': 'Nutzung & Limits', 'nav.onboarding': 'Onboarding', 'nav.suspended': 'Gesperrte Mandanten',
  'nav.pusers': 'Plattformbenutzer', 'nav.cadmins': 'Kundenadministratoren', 'nav.roles': 'Rollen & Berechtigungen', 'nav.alogs': 'Zugriffsprotokolle', 'nav.support-access': 'Support-Zugriff',
  'nav.settings': 'Systemeinstellungen', 'nav.integrations': 'Integrationen', 'nav.email': 'E-Mail & SMS', 'nav.security': 'Sicherheit & Compliance', 'nav.audit': 'Audit-Protokolle', 'nav.backup': 'Datensicherung', 'nav.monitoring': 'Systemüberwachung',
  'nav.tickets': 'Support-Tickets', 'nav.announce': 'Ankündigungen', 'nav.features': 'Funktionswünsche',
  'navd.companies': 'Alle Mandantenunternehmen der Plattform verwalten.', 'navd.plans': 'Starter-, Professional-, Business- und Enterprise-Pläne definieren und verwalten.', 'navd.billing': 'Rechnungen, Zahlungen und Abrechnungshistorie der Mandanten.', 'navd.usage': 'Mandantennutzung im Verhältnis zu den Plan-Limits überwachen.', 'navd.onboarding': 'Fortschritt beim Onboarding neuer Mandanten verfolgen.', 'navd.suspended': 'Gesperrte Mandanten prüfen und wieder aktivieren.',
  'navd.pusers': 'Mitarbeiterkonten der MEGSI-Plattform verwalten.', 'navd.cadmins': 'Administratoren der Kundenmandanten.', 'navd.roles': 'Rollen und Berechtigungssätze konfigurieren.', 'navd.alogs': 'Anmelde- und Zugriffshistorie.', 'navd.support-access': 'Zeitlich begrenzter Support-Zugriff auf Mandantendaten.',
  'navd.settings': 'Globale Plattformkonfiguration.', 'navd.integrations': 'Dienste von Drittanbietern verbinden.', 'navd.email': 'Konfiguration der E-Mail- und SMS-Anbieter.', 'navd.security': 'Sicherheitsrichtlinien und Compliance-Berichte.', 'navd.audit': 'Unveränderliches Protokoll administrativer Aktionen.', 'navd.backup': 'Sicherungspläne und Wiederherstellungspunkte.', 'navd.monitoring': 'Zustand und Leistung der Infrastruktur.',
  'navd.tickets': 'Warteschlange der Kunden-Support-Tickets.', 'navd.announce': 'Plattformankündigungen veröffentlichen.', 'navd.features': 'Board für Funktionswünsche von Kunden.',
  'search.ph': 'Unternehmen, Benutzer, Tickets, Pläne suchen...', 'search.none': 'Keine Ergebnisse für „{q}“', 'type.page': 'Seite', 'type.company': 'Unternehmen', 'type.user': 'Benutzer',
  'notif.title': 'Benachrichtigungen', 'notif.read': 'Alle als gelesen markieren', 'notif.empty': 'Alles erledigt', 'n.ticket': 'Support-Ticket {id} erfordert Aufmerksamkeit', 'n.backup': 'Nächtliche Datensicherung abgeschlossen',
  'ago.m': 'vor {n} Min.', 'ago.h': 'vor {n} Std.', 'ago.d': 'Gestern',
  'help.center': 'Hilfezentrum', 'help.shortcuts': 'Tastenkürzel', 'help.support': 'Support kontaktieren', 'help.centerMsg': 'Das Hilfezentrum ist eine Demonstration — nicht verbunden.', 'help.shortcutsMsg': 'Tastatur: Strg + K öffnet die Suche, Esc schließt Menüs.',
  'prof.profile': 'Profil', 'prof.settings': 'Kontoeinstellungen', 'prof.signout': 'Abmelden', 'prof.demo': '„{label}“ ist eine Demonstrationsaktion.', role: 'Plattform-Superadmin',
  title: 'Plattform-Dashboard', welcome: 'Willkommen zurück, David! Hier ist eine Übersicht der MEGSI-Plattform.',
  'preset.oct': 'Oktober 2026', 'preset.sep': 'September 2026', 'preset.q3': 'Q3 2026', 'preset.ytd': 'Seit Jahresbeginn', 'preset.l12': 'Letzte 12 Monate',
  'date.custom': 'Benutzerdefinierter Zeitraum', 'date.from': 'Von', 'date.to': 'Bis', 'date.apply': 'Anwenden', 'date.invalid': 'Das Startdatum muss vor oder am Enddatum liegen.', 'empty.period': 'Keine Daten für den ausgewählten Zeitraum',
  'kpi.companies.t': 'Unternehmen gesamt', 'kpi.companies.d': 'Aktive Mandanten', 'kpi.users.t': 'Benutzer gesamt', 'kpi.users.d': 'Über alle Unternehmen',
  'kpi.guards.t': 'Aktives Wachpersonal', 'kpi.guards.d': 'Im Dienst diesen Monat', 'kpi.guards.dp': 'Im Dienst im Zeitraum', 'kpi.sites.t': 'Standorte gesamt', 'kpi.sites.d': 'Über alle Mandanten',
  'kpi.incidents.t': 'Vorfälle gesamt', 'kpi.incidents.d': 'Diesen Monat', 'kpi.incidents.dp': 'Im Zeitraum', 'kpi.revenue.t': 'Monatsumsatz', 'kpi.revenue.d': 'Aus Abonnements', 'kpi.revenue.dp': 'Im Zeitraum',
  'kd.change': 'Veränderung', 'kd.active': 'Aktiv', 'kd.trial': 'Test', 'kd.suspended': 'Gesperrt', 'kd.newPeriod': 'Neu im Zeitraum', 'kd.admins': 'Administratoren', 'kd.managers': 'Manager', 'kd.guards': 'Wachpersonal', 'kd.day': 'Tagschicht', 'kd.night': 'Nachtschicht',
  'kd.corp': 'Unternehmen', 'kd.retail': 'Einzelhandel', 'kd.resi': 'Wohnen', 'kd.crit': 'Kritisch', 'kd.mod': 'Mittel', 'kd.low': 'Niedrig', demoNote: 'Nur Demonstrationsdaten — nicht mit einem Backend verbunden.', close: 'Schließen',
  'ch.growth': 'Unternehmenswachstum', 'ch.plans': 'Verteilung der Mandantenpläne', 'ch.revenue': 'Plattformumsatz', 'range.30d': 'Letzte 30 Tage', 'range.6m': 'Letzte 6 Monate', 'range.12m': 'Letzte 12 Monate', 'plan.all': 'Alle Pläne',
  companiesN: '{n} Unternehmen', companiesWord: 'Unternehmen', others: 'Andere', 'tt.total': 'Gesamt', 'tt.revenue': 'Umsatz',
  'tb.companies': 'Neueste Unternehmen', 'tb.signups': 'Neueste Anmeldungen', viewAll: 'Alle anzeigen',
  'col.num': '#', 'col.company': 'Firmenname', 'col.plan': 'Plan', 'col.users': 'Benutzer', 'col.sites': 'Standorte', 'col.status': 'Status', 'col.joined': 'Beitrittsdatum', 'col.actions': 'Aktionen', 'col.contact': 'Ansprechpartner', 'col.date': 'Datum',
  'col.event': 'Ereignis', 'col.when': 'Datum & Uhrzeit', 'col.type': 'Typ', 'col.rank': 'Rang',
  'act.view': 'Details anzeigen', 'act.edit': 'Unternehmen bearbeiten', 'act.sub': 'Abonnement anzeigen', 'toast.edit': 'Unternehmen bearbeiten (Demo): {name}',
  'd.plan': 'Plan', 'd.users': 'Benutzer', 'd.sites': 'Standorte', 'd.status': 'Status', 'd.joined': 'Beigetreten', 'd.billing': 'Abrechnung', 'd.monthly': 'Monatlich', 'd.renewal': 'Verlängerung', 'd.role': 'Rolle', 'd.type': 'Typ', 'd.demoUser': 'Demo-Benutzer', 'd.checked': 'Zuletzt geprüft',
  'status.Active': 'Aktiv', 'status.Trial': 'Test', 'status.Suspended': 'Gesperrt', 'status.Operational': 'Betriebsbereit',
  'pn.activity': 'Plattformaktivität', 'pn.top': 'Top-Unternehmen nach Benutzern', 'pn.health': 'Systemzustand', allOk: 'Alle Systeme betriebsbereit',
  'hm.uptime': 'Server-Verfügbarkeit', 'hm.uptime.s': 'Letzte 30 Tage', 'hm.api': 'API-Antwortzeit', 'hm.api.s': 'Durchschnitt', 'hm.db': 'Datenbanklast', 'hm.db.s': 'Aktuell', 'hm.sessions': 'Aktive Sitzungen', 'hm.sessions.s': 'Benutzer online',
  'svc.app': 'Anwendungsserver', 'svc.db': 'Datenbankserver', 'svc.email': 'E-Mail- & SMS-Dienste', lastChecked: 'Zuletzt geprüft: {d}',
  'act.company': 'Neues Unternehmen registriert: {name}', 'act.upgrade': 'Plan hochgestuft: {name} → {plan}-Plan', 'act.user': 'Neuer Benutzer hinzugefügt: {name} (Admin)', 'act.payment': 'Zahlung erhalten: {amount} – {name}', 'act.ticket': 'Support-Ticket erstellt: {id}',
  'act.suspend': 'Unternehmen gesperrt: {name}', 'act.backup': 'Datensicherung erfolgreich abgeschlossen', 'act.downgrade': 'Plan herabgestuft: {name} → {plan}-Plan', 'act.backupFailed': 'Nächtliche Datensicherung fehlgeschlagen',
  'kind.company': 'Unternehmen', 'kind.user': 'Benutzer', 'kind.upgrade': 'Upgrade', 'kind.info': 'Info', 'kind.payment': 'Zahlung', 'kind.ticket': 'Ticket', 'kind.attention': 'Achtung', 'kind.suspend': 'Sperrung', 'kind.failed': 'Fehler',
  'tp.companies': 'Alle Unternehmen', 'tp.signups': 'Alle Anmeldungen', 'tp.activity': 'Plattformaktivität', 'tp.top': 'Top-Unternehmen nach Benutzern', 'tp.records': '{a} von {b} Datensätzen (Mockdaten)', 'tp.search': 'Suchen...', all: 'Alle', back: 'Zurück zum Dashboard',
  'ua.status': 'Nicht verbunden', 'ua.title': '„{name}“ ist nicht implementiert', 'ua.body': 'Dieser Bildschirm ist eine Frontend-Demonstration. Er ist mit keinem Backend oder realen Dienst verbunden, und es werden keine Daten gelesen oder gespeichert.',
};

// Usage & Limits page translations. Usage metrics are demonstration data only.
const usageTranslations = {
  en: {
    'usage.title':'Usage & Limits','usage.subtitle':'Monitor tenant resource consumption, subscription limits, and usage alerts across the MEGSI platform.','usage.demo':'Demonstration data · not connected to live production metrics',
    'usage.kpi.tenants':'Total Tenants','usage.kpi.tenants.caption':'Across all subscription plans','usage.kpi.users':'Total Users','usage.kpi.users.caption':'Registered across tenants','usage.kpi.guards':'Active Guards','usage.kpi.guards.caption':'Currently registered','usage.kpi.near':'Near Limit','usage.kpi.near.caption':'Tenants above 80% resource usage','usage.kpi.critical':'Limit Exceeded','usage.kpi.critical.caption':'Tenants requiring attention',
    'usage.export':'Export Report','usage.manage':'Manage Limits','usage.month':'Select report month','usage.month.note':'Month selection is illustrative; mock usage is not historical.','usage.month.changed':'Month changed. Metrics remain demonstration data.','usage.exported':'Usage report downloaded.','usage.resource':'Resource Usage Overview','usage.distribution':'Tenant Usage Distribution','usage.table':'Tenant Usage & Limits','usage.alerts':'Usage Alerts','usage.recommendations':'Recommended Actions','usage.viewAll':'View All','usage.review':'Review','usage.done':'Done','usage.search':'Search companies...','usage.allPlans':'All Plans','usage.allStatuses':'All Usage Statuses','usage.allResources':'All Resources','usage.reset':'Reset Filters','usage.noResults':'No tenants match your filters.','usage.matching':'matching tenants','usage.normal':'Normal','usage.near':'Near Limit','usage.critical':'Critical','usage.col.company':'Company Name','usage.col.plan':'Subscription Plan','usage.col.users':'Users','usage.col.guards':'Guards','usage.col.sites':'Sites','usage.col.storage':'Storage','usage.col.overall':'Overall Usage','usage.col.status':'Status','usage.col.actions':'Actions','usage.limits.intro':'Read-only subscription limits for this demonstration. Existing plan settings will not be changed.','usage.limits.demo':'Guard and storage values are demonstration limits only.','usage.allAlerts':'All Usage Alerts','usage.allRecommendations':'All Recommended Actions','usage.close':'Close','usage.details':'View Details','usage.reviewUsage':'Review Usage'
  },
  fr: {
    'usage.title':'Utilisation et limites','usage.subtitle':'Surveillez la consommation des ressources, les limites des abonnements et les alertes des clients MEGSI.','usage.demo':'Données de démonstration · non connectées à la production',
    'usage.kpi.tenants':'Total des clients','usage.kpi.tenants.caption':'Tous les forfaits','usage.kpi.users':'Nombre total d’utilisateurs','usage.kpi.users.caption':'Inscrits chez les clients','usage.kpi.guards':'Agents actifs','usage.kpi.guards.caption':'Actuellement enregistrés','usage.kpi.near':'Limite proche','usage.kpi.near.caption':'Clients dépassant 80 % d’utilisation','usage.kpi.critical':'Limite dépassée','usage.kpi.critical.caption':'Clients nécessitant une attention',
    'usage.export':'Exporter le rapport','usage.manage':'Gérer les limites','usage.month':'Choisir le mois du rapport','usage.month.note':'Sélection illustrative ; les données fictives ne sont pas historiques.','usage.month.changed':'Mois modifié. Les mesures restent fictives.','usage.exported':'Rapport d’utilisation téléchargé.','usage.resource':'Aperçu de l’utilisation des ressources','usage.distribution':'Répartition de l’utilisation des clients','usage.table':'Utilisation et limites des clients','usage.alerts':'Alertes d’utilisation','usage.recommendations':'Actions recommandées','usage.viewAll':'Tout afficher','usage.review':'Examiner','usage.done':'Terminé','usage.search':'Rechercher des entreprises...','usage.allPlans':'Tous les forfaits','usage.allStatuses':'Tous les états','usage.allResources':'Toutes les ressources','usage.reset':'Réinitialiser les filtres','usage.noResults':'Aucun client ne correspond aux filtres.','usage.matching':'clients correspondants','usage.normal':'Normal','usage.near':'Limite proche','usage.critical':'Critique','usage.col.company':'Nom de l’entreprise','usage.col.plan':'Forfait','usage.col.users':'Utilisateurs','usage.col.guards':'Agents','usage.col.sites':'Sites','usage.col.storage':'Stockage','usage.col.overall':'Utilisation globale','usage.col.status':'État','usage.col.actions':'Actions','usage.limits.intro':'Limites d’abonnement en lecture seule pour cette démonstration.','usage.limits.demo':'Les limites des agents et du stockage sont fictives.','usage.allAlerts':'Toutes les alertes','usage.allRecommendations':'Toutes les recommandations','usage.close':'Fermer','usage.details':'Voir les détails','usage.reviewUsage':'Examiner l’utilisation'
  },
  de: {
    'usage.title':'Nutzung und Limits','usage.subtitle':'Überwachen Sie Ressourcennutzung, Abonnementlimits und Nutzungswarnungen auf der MEGSI-Plattform.','usage.demo':'Demodaten · nicht mit Produktionsdaten verbunden',
    'usage.kpi.tenants':'Mandanten gesamt','usage.kpi.tenants.caption':'Über alle Abonnementpläne','usage.kpi.users':'Benutzer gesamt','usage.kpi.users.caption':'Bei Mandanten registriert','usage.kpi.guards':'Aktive Sicherheitskräfte','usage.kpi.guards.caption':'Derzeit registriert','usage.kpi.near':'Limit fast erreicht','usage.kpi.near.caption':'Mandanten mit über 80 % Nutzung','usage.kpi.critical':'Limit überschritten','usage.kpi.critical.caption':'Mandanten mit Handlungsbedarf',
    'usage.export':'Bericht exportieren','usage.manage':'Limits verwalten','usage.month':'Berichtsmonat auswählen','usage.month.note':'Monatsauswahl ist beispielhaft; Demodaten sind nicht historisch.','usage.month.changed':'Monat geändert. Die Messwerte bleiben Demodaten.','usage.exported':'Nutzungsbericht heruntergeladen.','usage.resource':'Ressourcennutzung im Überblick','usage.distribution':'Verteilung der Mandantennutzung','usage.table':'Mandantennutzung und Limits','usage.alerts':'Nutzungswarnungen','usage.recommendations':'Empfohlene Maßnahmen','usage.viewAll':'Alle anzeigen','usage.review':'Prüfen','usage.done':'Fertig','usage.search':'Unternehmen suchen...','usage.allPlans':'Alle Pläne','usage.allStatuses':'Alle Nutzungsstatus','usage.allResources':'Alle Ressourcen','usage.reset':'Filter zurücksetzen','usage.noResults':'Keine Mandanten entsprechen den Filtern.','usage.matching':'passende Mandanten','usage.normal':'Normal','usage.near':'Limit fast erreicht','usage.critical':'Kritisch','usage.col.company':'Unternehmensname','usage.col.plan':'Abonnementplan','usage.col.users':'Benutzer','usage.col.guards':'Sicherheitskräfte','usage.col.sites':'Standorte','usage.col.storage':'Speicher','usage.col.overall':'Gesamtnutzung','usage.col.status':'Status','usage.col.actions':'Aktionen','usage.limits.intro':'Nur lesbare Abonnementlimits für diese Demo. Plankonfigurationen werden nicht geändert.','usage.limits.demo':'Limits für Sicherheitskräfte und Speicher sind Demowerte.','usage.allAlerts':'Alle Nutzungswarnungen','usage.allRecommendations':'Alle empfohlenen Maßnahmen','usage.close':'Schließen','usage.details':'Details anzeigen','usage.reviewUsage':'Nutzung prüfen'
  }
};
// Merge Usage & Limits translations.
Object.assign(en, usageTranslations.en);
Object.assign(fr, usageTranslations.fr);
Object.assign(de, usageTranslations.de);

const featureRequestTranslations = {
  en: {
    'fr.title':'Feature Requests','fr.subtitle':'Track, manage and prioritize feature requests from your users and customers.','fr.startDate':'Start date','fr.endDate':'End date','fr.to':'to',
    'fr.totalRequests':'Total Requests','fr.allTime':'All time requests','fr.implemented':'Implemented','fr.released':'Successfully released','fr.inProgress':'In Progress','fr.developing':'Currently being developed','fr.pending':'Pending','fr.review':'Under review','fr.rejected':'Rejected','fr.notPlanned':'Not planned / duplicate',
    'fr.overview':'Requests Overview','fr.total':'Total','fr.status':'Request Status','fr.top':'Top Requested Features','fr.recent':'Recent Updates','fr.viewAll':'View All','fr.noRequests':'No feature requests available.','fr.noUpdates':'No recent updates.','fr.newIdea':'Have a new idea?','fr.improve':'Help us improve! Submit your feature request and make MEGSI even better.',
    'fr.submit':'Submit Feature Request','fr.tellUs':'Tell us what feature would improve your experience.','fr.close':'Close','fr.featureTitle':'Feature title','fr.enterTitle':'Enter feature title','fr.description':'Description','fr.describe':'Describe your idea...','fr.requestedBy':'Requested by','fr.yourName':'Your name','fr.category':'Category','fr.priority':'Priority','fr.cancel':'Cancel','fr.submitRequest':'Submit Request','fr.role':'Role','fr.dateRequested':'Date requested','fr.votes':'Votes',
    'fr.search':'Search feature requests...','fr.clearSearch':'Clear search','fr.filterStatus':'Filter by status','fr.sortRequests':'Sort requests','fr.allStatuses':'All Statuses','fr.newest':'Newest First','fr.oldest':'Oldest First','fr.mostVotes':'Most Votes','fr.titleAZ':'Title A-Z','fr.clearFilters':'Clear Filters','fr.featureTitleCol':'Feature Title','fr.requestedByCol':'Requested By','fr.dateRequestedCol':'Date Requested','fr.actions':'Actions','fr.empty':'No feature requests found. Try changing your search, date range, or status filter.','fr.showing':'Showing {shown} of {total} feature requests','fr.previous':'Previous page','fr.next':'Next page','fr.filterBy':'Filter by {status}','fr.filterMonth':'Filter requests for {month}','fr.requestsCount':'{count} requests','fr.statusDistribution':'Status distribution for {count} requests','fr.viewRequest':'View {title}'
  },
  fr: {
    'fr.title':'Demandes de fonctionnalités','fr.subtitle':'Suivez, gérez et priorisez les demandes de fonctionnalités de vos utilisateurs et clients.','fr.startDate':'Date de début','fr.endDate':'Date de fin','fr.to':'à',
    'fr.totalRequests':'Demandes au total','fr.allTime':'Toutes les demandes','fr.implemented':'Mise en œuvre','fr.released':'Publiées avec succès','fr.inProgress':'En cours','fr.developing':'En cours de développement','fr.pending':'En attente','fr.review':'En cours d’examen','fr.rejected':'Refusées','fr.notPlanned':'Non prévues / doublons',
    'fr.overview':'Aperçu des demandes','fr.total':'Total','fr.status':'État des demandes','fr.top':'Fonctionnalités les plus demandées','fr.recent':'Mises à jour récentes','fr.viewAll':'Tout afficher','fr.noRequests':'Aucune demande de fonctionnalité disponible.','fr.noUpdates':'Aucune mise à jour récente.','fr.newIdea':'Une nouvelle idée ?','fr.improve':'Aidez-nous à nous améliorer ! Envoyez votre demande de fonctionnalité pour améliorer MEGSI.',
    'fr.submit':'Envoyer une demande','fr.tellUs':'Indiquez la fonctionnalité qui améliorerait votre expérience.','fr.close':'Fermer','fr.featureTitle':'Titre de la fonctionnalité','fr.enterTitle':'Saisissez le titre','fr.description':'Description','fr.describe':'Décrivez votre idée...','fr.requestedBy':'Demandé par','fr.yourName':'Votre nom','fr.category':'Catégorie','fr.priority':'Priorité','fr.cancel':'Annuler','fr.submitRequest':'Envoyer la demande','fr.role':'Rôle','fr.dateRequested':'Date de demande','fr.votes':'Votes',
    'fr.search':'Rechercher des demandes...','fr.clearSearch':'Effacer la recherche','fr.filterStatus':'Filtrer par état','fr.sortRequests':'Trier les demandes','fr.allStatuses':'Tous les états','fr.newest':'Plus récentes','fr.oldest':'Plus anciennes','fr.mostVotes':'Plus de votes','fr.titleAZ':'Titre A-Z','fr.clearFilters':'Effacer les filtres','fr.featureTitleCol':'Fonctionnalité','fr.requestedByCol':'Demandé par','fr.dateRequestedCol':'Date de demande','fr.actions':'Actions','fr.empty':'Aucune demande trouvée. Modifiez la recherche, la période ou le filtre d’état.','fr.showing':'Affichage de {shown} sur {total} demandes','fr.previous':'Page précédente','fr.next':'Page suivante','fr.filterBy':'Filtrer par {status}','fr.filterMonth':'Filtrer les demandes de {month}','fr.requestsCount':'{count} demandes','fr.statusDistribution':'Répartition des états pour {count} demandes','fr.viewRequest':'Afficher {title}'
  },
  de: {
    'fr.title':'Funktionsanfragen','fr.subtitle':'Verfolgen, verwalten und priorisieren Sie Funktionsanfragen Ihrer Benutzer und Kunden.','fr.startDate':'Startdatum','fr.endDate':'Enddatum','fr.to':'bis',
    'fr.totalRequests':'Anfragen gesamt','fr.allTime':'Alle bisherigen Anfragen','fr.implemented':'Umgesetzt','fr.released':'Erfolgreich veröffentlicht','fr.inProgress':'In Bearbeitung','fr.developing':'Wird derzeit entwickelt','fr.pending':'Ausstehend','fr.review':'Wird geprüft','fr.rejected':'Abgelehnt','fr.notPlanned':'Nicht geplant / Duplikat',
    'fr.overview':'Anfragenübersicht','fr.total':'Gesamt','fr.status':'Anfragestatus','fr.top':'Am häufigsten angefragte Funktionen','fr.recent':'Neueste Aktualisierungen','fr.viewAll':'Alle anzeigen','fr.noRequests':'Keine Funktionsanfragen verfügbar.','fr.noUpdates':'Keine aktuellen Aktualisierungen.','fr.newIdea':'Eine neue Idee?','fr.improve':'Helfen Sie uns, besser zu werden! Senden Sie Ihre Funktionsanfrage für ein besseres MEGSI.',
    'fr.submit':'Funktionsanfrage senden','fr.tellUs':'Welche Funktion würde Ihre Erfahrung verbessern?','fr.close':'Schließen','fr.featureTitle':'Funktionstitel','fr.enterTitle':'Funktionstitel eingeben','fr.description':'Beschreibung','fr.describe':'Beschreiben Sie Ihre Idee...','fr.requestedBy':'Angefragt von','fr.yourName':'Ihr Name','fr.category':'Kategorie','fr.priority':'Priorität','fr.cancel':'Abbrechen','fr.submitRequest':'Anfrage senden','fr.role':'Rolle','fr.dateRequested':'Anfragedatum','fr.votes':'Stimmen',
    'fr.search':'Funktionsanfragen suchen...','fr.clearSearch':'Suche löschen','fr.filterStatus':'Nach Status filtern','fr.sortRequests':'Anfragen sortieren','fr.allStatuses':'Alle Status','fr.newest':'Neueste zuerst','fr.oldest':'Älteste zuerst','fr.mostVotes':'Meiste Stimmen','fr.titleAZ':'Titel A-Z','fr.clearFilters':'Filter löschen','fr.featureTitleCol':'Funktionstitel','fr.requestedByCol':'Angefragt von','fr.dateRequestedCol':'Anfragedatum','fr.actions':'Aktionen','fr.empty':'Keine Anfragen gefunden. Ändern Sie Suche, Zeitraum oder Statusfilter.','fr.showing':'{shown} von {total} Anfragen angezeigt','fr.previous':'Vorherige Seite','fr.next':'Nächste Seite','fr.filterBy':'Nach {status} filtern','fr.filterMonth':'Anfragen für {month} filtern','fr.requestsCount':'{count} Anfragen','fr.statusDistribution':'Statusverteilung für {count} Anfragen','fr.viewRequest':'{title} anzeigen'
  }
};

// Merge Feature Requests translations.
Object.assign(en, featureRequestTranslations.en);
Object.assign(fr, featureRequestTranslations.fr);
Object.assign(de, featureRequestTranslations.de);

// Export the complete translation dictionary after merging all translations.
export const TRANSLATIONS = { en, fr, de };

// Short month names used by the date helpers.
const MONTHS = {
en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
};

// Return the short month name for a YYYY-MM key.
export const monthShort = (key, lang = 'en') => {
if (typeof key !== 'string' || !/^\d{4}-\d{2}$/.test(key)) {
return '';
}

const monthIndex = Number(key.slice(5, 7)) - 1;
const months = MONTHS[lang] || MONTHS.en;

return months[monthIndex] || '';
};

// Format a date according to the selected language.
export const fmtDate = (iso, lang = 'en') => {
if (typeof iso !== 'string' || !iso.trim()) {
return '';
}

const date = new Date(iso);

if (Number.isNaN(date.getTime())) {
return '';
}

const locales = {
en: 'en',
fr: 'fr-FR',
de: 'de-DE',
};

return new Intl.DateTimeFormat(locales[lang] || 'en', {
day: '2-digit',
month: 'short',
year: 'numeric',
}).format(date);
};

// Format a date and time according to the selected language.
export const fmtDateTime = (iso, lang = 'en') => {
if (typeof iso !== 'string' || !iso.trim()) {
return '';
}

const date = new Date(iso);

if (Number.isNaN(date.getTime())) {
return '';
}

const locales = {
en: 'en',
fr: 'fr-FR',
de: 'de-DE',
};

return new Intl.DateTimeFormat(locales[lang] || 'en', {
day: '2-digit',
month: 'short',
year: 'numeric',
hour: '2-digit',
minute: '2-digit',
}).format(date);
};
