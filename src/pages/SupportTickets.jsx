import { useEffect, useMemo, useState } from 'react';
import * as I from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DateRangeMenu from '../components/DateRangeMenu.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { SUPPORT_AGENTS, SUPPORT_TICKETS } from '../data/supportTicketsData.js';
import './supportTickets.css';

const Icon = ({ name, ...props }) => {
  const Component = I[name] || I.Circle;
  return <Component {...props} />;
};

const copy = {
  en: {
    title: 'Support Tickets',
    desc: 'Manage, prioritize, track and resolve security-related customer support requests across all tenant environments.',
    total: 'Total Tickets',
    resolvedToday: 'Resolved Today',
    pending: 'Pending Tickets',
    critical: 'Critical Security Tickets',
    assigned: 'Assigned Engineers',
    sla: 'SLA Compliance',
    created: 'Created Tickets',
    resolved: 'Resolved Tickets',
    escalated: 'Escalated Tickets',
    category: 'Ticket Category Distribution',
    priority: 'Ticket Priority Analysis',
    recent: 'Recent Support Tickets',
    top: 'Top Ticket Categories',
    timeline: 'Support Activity Timeline',
    avg: 'Average Resolution Time',
    statusTitle: 'Security Ticket Status',
    search: 'Search tickets, subjects, companies…',
    all: 'All',
    id: 'Ticket ID',
    company: 'Company Name',
    subject: 'Subject',
    categoryLabel: 'Category',
    priorityLabel: 'Priority',
    assignedTo: 'Assigned To',
    status: 'Status',
    date: 'Date',
    actions: 'Actions',
    reset: 'Clear all',
    empty: 'No tickets match your filters.',
    open: 'Open',
    inProgress: 'In Progress',
    pendingStatus: 'Pending',
    resolvedStatus: 'Resolved',
    filterStatus: 'Status',
    filterPriority: 'Priority',
    filterCategory: 'Category',
    filterAgent: 'Assigned agent',
    details: 'Ticket details',
    description: 'Description',
    conversation: 'Conversation history',
    reply: 'Add a reply…',
    send: 'Send reply',
    close: 'Close',
    companyLabel: 'Company',
    createdLabel: 'Created',
    updated: 'Last updated',
    reopen: 'Reopen ticket',
    resolve: 'Resolve ticket',
    demo: 'Demo data — changes stay in this session.',
  },
  fr: {
    title: 'Tickets d’assistance',
    desc: 'Gérez, hiérarchisez et résolvez les demandes d’assistance liées à la sécurité.',
    total: 'Total des tickets',
    resolvedToday: 'Résolus aujourd’hui',
    pending: 'Tickets en attente',
    critical: 'Incidents critiques',
    assigned: 'Ingénieurs affectés',
    sla: 'Conformité SLA',
    created: 'Tickets créés',
    resolved: 'Tickets résolus',
    escalated: 'Tickets escaladés',
    category: 'Répartition des catégories',
    priority: 'Analyse des priorités',
    recent: 'Tickets récents',
    top: 'Principales catégories',
    timeline: 'Activité du support',
    avg: 'Temps moyen de résolution',
    statusTitle: 'État des tickets',
    search: 'Rechercher tickets, sujets, entreprises…',
    all: 'Tous',
    id: 'ID du ticket',
    company: 'Entreprise',
    subject: 'Sujet',
    categoryLabel: 'Catégorie',
    priorityLabel: 'Priorité',
    assignedTo: 'Assigné à',
    status: 'Statut',
    date: 'Date',
    actions: 'Actions',
    reset: 'Tout effacer',
    empty: 'Aucun ticket ne correspond aux filtres.',
    open: 'Ouvert',
    inProgress: 'En cours',
    pendingStatus: 'En attente',
    resolvedStatus: 'Résolu',
    filterStatus: 'Statut',
    filterPriority: 'Priorité',
    filterCategory: 'Catégorie',
    filterAgent: 'Agent affecté',
    details: 'Détails du ticket',
    description: 'Description',
    conversation: 'Historique',
    reply: 'Ajouter une réponse…',
    send: 'Envoyer',
    close: 'Fermer',
    companyLabel: 'Entreprise',
    createdLabel: 'Créé',
    updated: 'Dernière mise à jour',
    reopen: 'Rouvrir le ticket',
    resolve: 'Résoudre le ticket',
    demo: 'Données de démonstration — modifications temporaires.',
  },
  de: {
    title: 'Support-Tickets',
    desc: 'Sicherheitsbezogene Supportanfragen verwalten, priorisieren und lösen.',
    total: 'Tickets gesamt',
    resolvedToday: 'Heute gelöst',
    pending: 'Offene Anfragen',
    critical: 'Kritische Sicherheitsfälle',
    assigned: 'Zugewiesene Techniker',
    sla: 'SLA-Erfüllung',
    created: 'Erstellte Tickets',
    resolved: 'Gelöste Tickets',
    escalated: 'Eskalierte Tickets',
    category: 'Ticketkategorien',
    priority: 'Prioritätsanalyse',
    recent: 'Neueste Support-Tickets',
    top: 'Top-Ticketkategorien',
    timeline: 'Support-Aktivität',
    avg: 'Durchschnittliche Lösungszeit',
    statusTitle: 'Ticketstatus',
    search: 'Tickets, Themen, Firmen suchen…',
    all: 'Alle',
    id: 'Ticket-ID',
    company: 'Unternehmen',
    subject: 'Betreff',
    categoryLabel: 'Kategorie',
    priorityLabel: 'Priorität',
    assignedTo: 'Zugewiesen an',
    status: 'Status',
    date: 'Datum',
    actions: 'Aktionen',
    reset: 'Filter löschen',
    empty: 'Keine Tickets entsprechen den Filtern.',
    open: 'Offen',
    inProgress: 'In Bearbeitung',
    pendingStatus: 'Ausstehend',
    resolvedStatus: 'Gelöst',
    filterStatus: 'Status',
    filterPriority: 'Priorität',
    filterCategory: 'Kategorie',
    filterAgent: 'Zuständiger Agent',
    details: 'Ticketdetails',
    description: 'Beschreibung',
    conversation: 'Verlauf',
    reply: 'Antwort hinzufügen…',
    send: 'Antwort senden',
    close: 'Schließen',
    companyLabel: 'Unternehmen',
    createdLabel: 'Erstellt',
    updated: 'Zuletzt aktualisiert',
    reopen: 'Ticket wieder öffnen',
    resolve: 'Ticket lösen',
    demo: 'Demodaten — Änderungen gelten nur in dieser Sitzung.',
  },
};

// Normalize demo dates to YYYY-MM-DD without shifting date-only values across time zones.
const dateKey = value => {
  if (value == null || value === '') return '';

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return '';

    const year = value.getFullYear();
    const month     = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const text = String(value).trim();
  if (!text) return '';

  // ISO date or timestamp: preserve its written calendar date.
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/);

  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    const check = new Date(year, month - 1, day);

    return check.getFullYear() === year &&
      check.getMonth() === month - 1 &&
      check.getDate() === day
      ? `${iso[1]}-${iso[2]}-${iso[3]}`
      : '';
  }

  // Also support YYYY/MM/DD and common day-first demo dates.
  let match = text.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);

  if (match) {
    const [, y, m, d] = match;
    const check = new Date(Number(y), Number(m) - 1, Number(d));

    return check.getFullYear() === Number(y) &&
      check.getMonth() === Number(m) - 1 &&
      check.getDate() === Number(d)
      ? `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      : '';
  }

  match = text.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);

  if (match) {
    const [, d, m, y] = match;
    const check = new Date(Number(y), Number(m) - 1, Number(d));

    return check.getFullYear() === Number(y) &&
      check.getMonth() === Number(m) - 1 &&
      check.getDate() === Number(d)
      ? `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      : '';
  }

  const parsed = new Date(text);

  if (Number.isNaN(parsed.getTime())) return '';

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const formatTicketDate = (value, formatter) => {
  const key = dateKey(value);
  if (!key) return '—';

  const [year, month, day] = key.split('-').map(Number);
  const localDate = new Date(year, month - 1, day, 12);

  try {
    const formatted = formatter(localDate);

    if (formatted && !/invalid date/i.test(String(formatted))) {
      return formatted;
    }
  } catch {
    // Fall through to a safe locale formatter.
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(localDate);
};

const statusClass = value =>
  String(value || '').toLowerCase().replaceAll(' ', '-');

const colors = [
  '#0758F9',
  '#079447',
  '#7909E8',
  '#F59E0B',
  '#38A5F4',
  '#64748b',
];

export default function SupportTickets({
  range,
  setRange,
  toast,
  openDetail,
}) {
  const { lang, fmtDate } = useI18n();
  const tr = key => copy[lang]?.[key] || copy.en[key] || key;

  const [tickets, setTickets] = useState(() =>
    SUPPORT_TICKETS.map(ticket => ({
      ...ticket,
      messages: [...(ticket.messages || [])],
    }))
  );

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    assignee: '',
  });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [sort, setSort] = useState({
    key: 'created',
    dir: 'desc',
  });

  const pageSize = 5;

  const inRange = ticket => {
  const created = dateKey(ticket.created);

  if (!created) return false;

  const start = dateKey(range?.start);
  const end = dateKey(range?.end);

  // No date range selected: show all tickets.
  if (!start && !end) return true;

  // Include both the start and end dates.
  if (start && created < start) return false;
  if (end && created > end) return false;

  return true;
};

  const periodTickets = useMemo(
    () => tickets.filter(inRange),
    [tickets, range]
  );

  const visible = useMemo(() => {
    const q = query.toLowerCase();

    return periodTickets
      .filter(ticket => {
        const searchable = [
          ticket.id,
          ticket.subject,
          ticket.company,
          ticket.category,
        ].some(value => String(value || '').toLowerCase().includes(q));

        return (
          (!q || searchable) &&
          (!filters.status || ticket.status === filters.status) &&
          (!filters.priority || ticket.priority === filters.priority) &&
          (!filters.category || ticket.category === filters.category) &&
          (!filters.assignee || ticket.assignee === filters.assignee)
        );
      })
      .sort((a, b) => {
        const result = String(a[sort.key] || '').localeCompare(
          String(b[sort.key] || '')
        );

        return sort.dir === 'asc' ? result : -result;
      });
  }, [periodTickets, query, filters, sort]);

  useEffect(() => {
    setPage(1);
  }, [query, filters, range]);

  useEffect(() => {
    if (!selected) return;

    const handleKey = event => {
      if (event.key === 'Escape') setSelected(null);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selected]);

  const countStatus = status =>
    periodTickets.filter(ticket => ticket.status === status).length;

  const metrics = [
    ['total', tr('total'), periodTickets.length, 'Ticket', 'blue'],
    [
      'resolvedToday',
      tr('resolvedToday'),
      tickets.filter(ticket => ticket.status === 'Resolved').length,
      'CheckCircle',
      'green',
    ],
    ['pending', tr('pending'), countStatus('Pending'), 'Clock', 'orange'],
    [
      'critical',
      tr('critical'),
      periodTickets.filter(
        ticket => ticket.priority === 'Critical' && ticket.status !== 'Resolved'
      ).length,
      'AlertTriangle',
      'red',
    ],
    [
      'assigned',
      tr('assigned'),
      new Set(periodTickets.map(ticket => ticket.assignee).filter(Boolean)).size,
      'Users',
      'purple',
    ],
    ['sla', tr('sla'), '98.7%', 'ShieldCheck', 'blue'],
  ];

  const openCard = key => {
    const rows = [
      ['Tickets in period', periodTickets.length],
      ['Open', countStatus('Open')],
      ['In progress', countStatus('In Progress')],
      ['Pending', countStatus('Pending')],
      ['Resolved', countStatus('Resolved')],
    ];

    openDetail?.({
      title: tr(key),
      rows,
    });
  };

  const categoryData = useMemo(() => {
    const counts = {};

    periodTickets.forEach(ticket => {
      counts[ticket.category] = (counts[ticket.category] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [periodTickets]);

  const trendData = useMemo(() => {
    const end = new Date(`${range?.end || '2026-10-31'}T12:00:00`);

    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(
        end.getFullYear(),
        end.getMonth() - 11 + index,
        1
      );

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`;

      const bucket = tickets.filter(
        ticket => dateKey(ticket.created).startsWith(key) && inRange(ticket)
      );

      return {
        month: date.toLocaleDateString(
          lang === 'fr'
            ? 'fr-FR'
            : lang === 'de'
              ? 'de-DE'
              : 'en-GB',
          { month: 'short' }
        ),
        created: bucket.length,
        resolved: bucket.filter(ticket => ticket.status === 'Resolved').length,
        escalated: bucket.filter(ticket => ticket.priority === 'Critical').length,
      };
    });
  }, [tickets, range, lang]);

  const priorityData = ['Critical', 'High', 'Medium', 'Low'].map(name => ({
    name,
    value: periodTickets.filter(ticket => ticket.priority === name).length,
  }));

  const reset = () => {
    setQuery('');
    setFilters({
      status: '',
      priority: '',
      category: '',
      assignee: '',
    });
    setPage(1);
  };

  const updateTicket = (id, patch) => {
    setTickets(previous =>
      previous.map(ticket =>
        ticket.id === id ? { ...ticket, ...patch } : ticket
      )
    );
  };

  const sendReply = () => {
    if (!reply.trim() || !selected) return;

    const message = {
      by: 'Platform Admin',
      date: new Date().toLocaleString(),
      text: reply.trim(),
    };

    const messages = [...selected.messages, message];

    updateTicket(selected.id, {
      messages,
      updated: dateKey(new Date()),
    });

    setSelected({ ...selected, messages });
    setReply('');
    toast?.('Reply added to demo conversation.');
  };

  const statusLabel = status => {
    if (status === 'Open') return tr('open');
    if (status === 'In Progress') return tr('inProgress');
    if (status === 'Pending') return tr('pendingStatus');
    return tr('resolvedStatus');
  };

  return (
    <div className="st-page">
      <div className="st-heading">
        <div>
          <h1>{tr('title')}</h1>
          <p>{tr('desc')}</p>
        </div>
        <DateRangeMenu range={range} setRange={setRange} />
      </div>

      <div className="st-metrics">
        {metrics.map(([key, title, value, icon, tone]) => (
          <button
            key={key}
            className="st-metric card"
            onClick={() => openCard(key)}
          >
            <span className={`st-metric-icon ${tone}`}>
              <Icon name={icon} size={23} />
            </span>
            <span className="st-metric-copy">
              <small>{title}</small>
              <strong>{value}</strong>
              <em>{key === 'sla' ? '↑ 1.2%' : 'Selected period'}</em>
            </span>
          </button>
        ))}
      </div>

      <div className="st-charts">
        <section className="card st-panel">
          <div className="st-panel-head">
            <h3>
              <Icon name="BarChart3" size={18} />
              {tr('created')} trend
            </h3>
            <span className="st-pill">Last 12 Months</span>
          </div>

          <div className="st-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dce6f2" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line dataKey="created" stroke="#0758F9" strokeWidth={2.4} />
                <Line dataKey="resolved" stroke="#079447" strokeWidth={2.4} />
                <Line dataKey="escalated" stroke="#F5223B" strokeWidth={2.2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="st-legend">
            <span>🔵 {tr('created')}</span>
            <span>🟢 {tr('resolved')}</span>
            <span>🔴 {tr('escalated')}</span>
          </div>
        </section>

        <section className="card st-panel">
          <div className="st-panel-head">
            <h3>
              <Icon name="PieChart" size={18} />
              {tr('category')}
            </h3>
          </div>

          <div className="st-donut-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="57%"
                  outerRadius="82%"
                  paddingAngle={2}
                >
                  {categoryData.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="st-category-legend">
            {categoryData.map((item, index) => (
              <div key={item.name}>
                <i style={{ background: colors[index % colors.length] }} />
                <span>{item.name}</span>
                <b>
                  {periodTickets.length
                    ? Math.round((item.value / periodTickets.length) * 100)
                    : 0}
                  %
                </b>
              </div>
            ))}
          </div>
        </section>

        <section className="card st-panel">
          <div className="st-panel-head">
            <h3>
              <Icon name="Activity" size={18} />
              {tr('priority')}
            </h3>
            <span className="st-pill">This period</span>
          </div>

          <div className="st-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dce6f2" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {priorityData.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={['#F5223B', '#F59E0B', '#2584F7', '#60A5FA'][index]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="card st-table-panel">
        <div className="st-table-title">
          <h3>
            <Icon name="LifeBuoy" size={18} />
            {tr('recent')}
          </h3>

          <div className="st-tools">
            <label className="st-search">
              <Icon name="Search" size={15} />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder={tr('search')}
              />
            </label>

            <select
              value={filters.status}
              onChange={event =>
                setFilters({ ...filters, status: event.target.value })
              }
            >
              <option value="">{tr('filterStatus')}: {tr('all')}</option>
              {['Open', 'In Progress', 'Pending', 'Resolved'].map(status => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>

            <select
              value={filters.priority}
              onChange={event =>
                setFilters({ ...filters, priority: event.target.value })
              }
            >
              <option value="">{tr('filterPriority')}: {tr('all')}</option>
              {['Critical', 'High', 'Medium', 'Low'].map(priority => (
                <option key={priority}>{priority}</option>
              ))}
            </select>

            <select
              value={filters.category}
              onChange={event =>
                setFilters({ ...filters, category: event.target.value })
              }
            >
              <option value="">{tr('filterCategory')}: {tr('all')}</option>
              {[...new Set(tickets.map(ticket => ticket.category))].map(
                category => (
                  <option key={category}>{category}</option>
                )
              )}
            </select>

            <select
              value={filters.assignee}
              onChange={event =>
                setFilters({ ...filters, assignee: event.target.value })
              }
            >
              <option value="">{tr('filterAgent')}: {tr('all')}</option>
              {SUPPORT_AGENTS.map(agent => (
                <option key={agent}>{agent}</option>
              ))}
            </select>

            <button className="st-btn" onClick={reset}>
              {tr('reset')}
            </button>
          </div>
        </div>

        <div className="st-table-scroll">
          <table className="st-table">
            <thead>
              <tr>
                {[
                  ['id', tr('id')],
                  ['company', tr('company')],
                  ['subject', tr('subject')],
                  ['category', tr('categoryLabel')],
                  ['priority', tr('priorityLabel')],
                  ['assignee', tr('assignedTo')],
                  ['status', tr('status')],
                  ['created', tr('date')],
                ].map(([key, label]) => (
                  <th key={key}>
                    <button
                      onClick={() =>
                        setSort(previous => ({
                          key,
                          dir:
                            previous.key === key && previous.dir === 'asc'
                              ? 'desc'
                              : 'asc',
                        }))
                      }
                    >
                      {label} <Icon name="ArrowUpDown" size={10} />
                    </button>
                  </th>
                ))}
                <th>{tr('actions')}</th>
              </tr>
            </thead>

            <tbody>
              {visible
                .slice((page - 1) * pageSize, page * pageSize)
                .map(ticket => (
                  <tr key={ticket.id}>
                    <td><b className="st-id">{ticket.id}</b></td>
                    <td>{ticket.company}</td>
                    <td>{ticket.subject}</td>
                    <td>{ticket.category}</td>
                    <td>
                      <span className={`st-badge ${statusClass(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td>{ticket.assignee}</td>
                    <td>
                      <span className={`st-badge ${statusClass(ticket.status)}`}>
                        {statusLabel(ticket.status)}
                      </span>
                    </td>
                    <td>{formatTicketDate(ticket.created, fmtDate)}</td>
                    <td>
                      <button
                        className="st-view"
                        onClick={() => setSelected(ticket)}
                        aria-label={`Open ${ticket.id}`}
                      >
                        <Icon name="MoreHorizontal" size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {!visible.length && (
            <div className="st-empty">
              <Icon name="Search" size={24} />
              <b>{tr('empty')}</b>
            </div>
          )}
        </div>

        <div className="st-pagination">
          <span>
            {visible.length
              ? `${(page - 1) * pageSize + 1}–${Math.min(
                  page * pageSize,
                  visible.length
                )} of ${visible.length}`
              : '0 results'}
          </span>

          <div>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <Icon name="ChevronLeft" size={15} />
            </button>
            <b>{page} / {Math.max(1, Math.ceil(visible.length / pageSize))}</b>
            <button
              disabled={page >= Math.ceil(visible.length / pageSize)}
              onClick={() => setPage(p => p + 1)}
            >
              <Icon name="ChevronRight" size={15} />
            </button>
          </div>
        </div>
      </section>

      <div className="st-bottom-grid">
        <section className="card st-small-panel">
          <h3><Icon name="BarChart3" size={17} />{tr('top')}</h3>
          {categoryData
            .slice()
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
            .map(item => (
              <div className="st-bar-row" key={item.name}>
                <span>{item.name}</span>
                <div>
                  <i
                    style={{
                      width: `${
                        Math.max(
                          8,
                          periodTickets.length
                            ? (item.value /
                                Math.max(...categoryData.map(x => x.value))) *
                                100
                            : 0
                        )
                      }%`,
                    }}
                  />
                </div>
                <b>{item.value}</b>
              </div>
            ))}
        </section>

        <section className="card st-small-panel">
          <h3><Icon name="Activity" size={17} />{tr('timeline')}</h3>
          {tickets.slice(0, 4).map((ticket, index) => (
            <div className="st-activity" key={ticket.id}>
              <span className={`st-activity-dot d${index}`} />
              <span>
                <b>
                  {ticket.status === 'Resolved'
                    ? 'Ticket resolved'
                    : ticket.status === 'In Progress'
                      ? 'Ticket assigned'
                      : 'Ticket created'}: {ticket.id}
                </b>
                <small>
                  {ticket.subject} · {formatTicketDate(ticket.updated, fmtDate)}
                </small>
              </span>
            </div>
          ))}
        </section>

        <section className="card st-small-panel">
          <h3><Icon name="Clock" size={17} />{tr('avg')}</h3>
          {[
            ['Critical', '2.4 Hours'],
            ['High', '5.2 Hours'],
            ['Medium', '12 Hours'],
            ['Low', '28 Hours'],
          ].map(([priority, value]) => (
            <div className="st-resolution" key={priority}>
              <span className={`st-priority-dot ${statusClass(priority)}`} />
              <small>{priority}</small>
              <b>{value}</b>
            </div>
          ))}
        </section>

        <section className="card st-small-panel">
          <h3><Icon name="ShieldCheck" size={17} />{tr('statusTitle')}</h3>
          {[
            ['Active Threat Investigations', 18, 'red'],
            ['Access Violations Closed', 42, 'green'],
            ['Pending Security Reviews', 13, 'orange'],
            ['High Risk Cases', 5, 'purple'],
          ].map(([label, value, color]) => (
            <div className="st-health" key={label}>
              <span className={color} />
              {label}
              <b>{value}</b>
            </div>
          ))}
        </section>
      </div>

      <p className="st-demo-note">{tr('demo')}</p>

      {selected && (
        <>
          <button
            className="st-overlay"
            aria-label={tr('close')}
            onClick={() => setSelected(null)}
          />

          <aside
            className="st-ticket-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`${tr('details')} ${selected.id}`}
          >
            <div className="st-drawer-head">
              <div>
                <small>{selected.id}</small>
                <h2>{tr('details')}</h2>
              </div>
              <button onClick={() => setSelected(null)} aria-label={tr('close')}>
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="st-drawer-content">
              <h3>{selected.subject}</h3>
              <p>{selected.description}</p>

              <div className="st-detail-list">
                {[
                  [tr('companyLabel'), selected.company],
                  [tr('categoryLabel'), selected.category],
                  [tr('createdLabel'), formatTicketDate(selected.created, fmtDate)],
                  [tr('updated'), formatTicketDate(selected.updated, fmtDate)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <b>{value}</b>
                  </div>
                ))}
              </div>

              <label className="st-field">
                {tr('priorityLabel')}
                <select
                  value={selected.priority}
                  onChange={event => {
                    const priority = event.target.value;
                    updateTicket(selected.id, { priority });
                    setSelected({ ...selected, priority });
                  }}
                >
                  {['Critical', 'High', 'Medium', 'Low'].map(priority => (
                    <option key={priority}>{priority}</option>
                  ))}
                </select>
              </label>

              <label className="st-field">
                {tr('assignedTo')}
                <select
                  value={selected.assignee}
                  onChange={event => {
                    const assignee = event.target.value;
                    updateTicket(selected.id, { assignee });
                    setSelected({ ...selected, assignee });
                  }}
                >
                  {SUPPORT_AGENTS.map(agent => (
                    <option key={agent}>{agent}</option>
                  ))}
                </select>
              </label>

              <label className="st-field">
                {tr('status')}
                <select
                  value={selected.status}
                  onChange={event => {
                    const status = event.target.value;
                    updateTicket(selected.id, { status });
                    setSelected({ ...selected, status });
                  }}
                >
                  {['Open', 'In Progress', 'Pending', 'Resolved'].map(status => (
                    <option key={status} value={status}>
                      {statusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>

              <h3 className="st-convo-title">{tr('conversation')}</h3>

              {selected.messages.map((message, index) => (
                <div className="st-message" key={index}>
                  <b>{message.by}</b>
                  <small>{message.date}</small>
                  <p>{message.text}</p>
                </div>
              ))}

              <textarea
                value={reply}
                onChange={event => setReply(event.target.value)}
                placeholder={tr('reply')}
              />

              <button
                className="st-primary"
                onClick={sendReply}
                disabled={!reply.trim()}
              >
                <Icon name="Send" size={14} />
                {tr('send')}
              </button>

              <button
                className="st-secondary"
                onClick={() => {
                  const status =
                    selected.status === 'Resolved' ? 'Open' : 'Resolved';

                  updateTicket(selected.id, { status });
                  setSelected({ ...selected, status });
                  toast?.(`Ticket ${selected.id} marked ${status}.`);
                }}
              >
                {selected.status === 'Resolved'
                  ? tr('reopen')
                  : tr('resolve')}
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}