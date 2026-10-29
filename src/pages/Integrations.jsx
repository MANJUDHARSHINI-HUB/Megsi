import { useMemo, useState } from 'react';
import {
  Activity,
  Bot,
  Boxes,
  CheckCircle2,
  Cloud,
  Database,
  Download,
  Mail,
  MessageCircle,
  Plug,
  Plus,
  Search,
  Settings,
  Shield,
  Slack,
  Sparkles,
  Video,
  X,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

import "./integrations.css";

const INITIAL_INTEGRATIONS = [
  { id: 1, name: 'AI Assistant Connect', description: 'Use AI for advanced analysis', category: 'AI Tools', icon: 'bot', status: 'Not Connected', action: 'Connect' },
  { id: 2, name: 'SendGrid Email API', description: 'Reliable system notifications', category: 'Communication', icon: 'grid', status: 'Connected', action: 'Manage' },
  { id: 3, name: 'Collaboration', description: 'Reliability for team collaboration', category: 'Productivity', icon: 'slack', status: 'Connected', action: 'Manage' },
  { id: 4, name: 'Azure Data Lake', description: 'Scalable data storage and analysis', category: 'Data Sources', icon: 'cloud', status: 'Connecting', action: 'View Progress' },
  { id: 5, name: 'AI Assistant', description: 'Use AI for advanced analysis', category: 'AI Tools', icon: 'sparkles', status: 'Not Connected', action: 'Connect' },
  { id: 6, name: 'Met Email', description: 'Reliable system notifications', category: 'Communication', icon: 'video', status: 'Connected', action: 'Manage' },
  { id: 7, name: 'Collaboration Tool', description: 'Connect collaboration and email', category: 'Productivity', icon: 'slack', status: 'Connected', action: 'Manage' },
  { id: 8, name: 'Azure Data Lake', description: 'Scalable data storage and analysis', category: 'Data Sources', icon: 'database', status: 'Connecting', action: 'View Progress' },
  { id: 9, name: 'SendGrid Email API', description: 'Reliable system notifications', category: 'Communication', icon: 'grid', status: 'Connected', action: 'Manage' },
  { id: 10, name: 'Email', description: 'Reliable system notifications', category: 'Communication', icon: 'mail', status: 'Connected', action: 'Manage' },
  { id: 11, name: 'MessengerPer', description: 'Connect messaging and team communication', category: 'Communication', icon: 'message', status: 'Connected', action: 'Manage' },
  { id: 12, name: 'Azure Data Lake', description: 'Scalable data storage and analysis', category: 'Data Sources', icon: 'cloud', status: 'Connecting', action: 'View Progress' },
];

const CATEGORIES = [
  'All Integrations',
  'AI Tools',
  'Productivity',
  'Data Sources',
  'Communication',
  'Automation',
  'Security',
];

const AUTH_TYPES = [
  'API Key',
  'OAuth 2.0',
  'Basic Authentication',
  'None',
];

const ICONS = {
  bot: Bot,
  grid: Boxes,
  slack: Slack,
  cloud: Cloud,
  sparkles: Sparkles,
  video: Video,
  database: Database,
  mail: Mail,
  message: MessageCircle,
};

const EMPTY_FORM = {
  name: '',
  category: 'AI Tools',
  description: '',
  endpoint: '',
  authType: 'API Key',
};

function loadIntegrations() {
  try {
    const saved = localStorage.getItem('megsi-integrations');

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Fall back to the default integrations.
  }

  return INITIAL_INTEGRATIONS;
}

function iconForCategory(category) {
  const icons = {
    'AI Tools': 'bot',
    Productivity: 'slack',
    'Data Sources': 'database',
    Communication: 'mail',
    Automation: 'sparkles',
    Security: 'grid',
  };

  return icons[category] || 'grid';
}

export default function Integrations({ toast = () => {} }) {
  const [integrations, setIntegrations] = useState(loadIntegrations);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Integrations');
  const [selected, setSelected] = useState(null);
  const [summaryPanel, setSummaryPanel] = useState(null);

  const [config, setConfig] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addError, setAddError] = useState('');
  const [saving, setSaving] = useState(false);

  const persist = (updated) => {
    setIntegrations(updated);

    try {
      localStorage.setItem('megsi-integrations', JSON.stringify(updated));
    } catch {
      toast('Could not save integration settings in this browser.');
    }
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return integrations.filter((item) => {
      const matchesCategory =
        category === 'All Integrations' || item.category === category;

      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [integrations, search, category]);

  const connectedCount = integrations.filter(
    (item) => item.status === 'Connected'
  ).length;

  const summaryItems = [
    {
      key: 'all',
      label: 'Total Integrations',
      count: integrations.length,
      icon: Plug,
      tone: '',
    },
    {
      key: 'Connected',
      label: 'Connected',
      count: connectedCount,
      icon: CheckCircle2,
      tone: 'success',
    },
    {
      key: 'Connecting',
      label: 'Pending Connections',
      count: integrations.filter(
        (item) => item.status === 'Connecting'
      ).length,
      icon: RefreshCw,
      tone: 'warning',
    },
    {
      key: 'Not Connected',
      label: 'Not Connected',
      count: integrations.filter(
        (item) => item.status === 'Not Connected'
      ).length,
      icon: AlertCircle,
      tone: 'danger',
    },
  ];

  const summaryIntegrations =
    summaryPanel === 'all'
      ? integrations
      : integrations.filter((item) => item.status === summaryPanel);

  const updateStatus = (id, status, action) => {
    persist(
      integrations.map((item) =>
        item.id === id ? { ...item, status, action } : item
      )
    );
  };

  const openConfiguration = (item) => {
    setSelected(item);

    setConfig({
      name: item.name,
      endpoint: item.endpoint || '',
      apiKey: item.apiKey || '',
      workspace: item.workspace || '',
    });
  };

  const addIntegration = (event) => {
    event.preventDefault();
    setAddError('');

    const name = addForm.name.trim();
    const description = addForm.description.trim();
    const endpoint = addForm.endpoint.trim();

    if (!name || !description) {
      setAddError('Enter an integration name and description.');
      return;
    }

    if (endpoint) {
      try {
        const parsedUrl = new URL(endpoint);

        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          setAddError('Enter a valid HTTP or HTTPS endpoint.');
          return;
        }
      } catch {
        setAddError('Enter a valid API endpoint URL.');
        return;
      }
    }

    const duplicate = integrations.some(
      (item) => item.name.trim().toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      setAddError('An integration with this name already exists.');
      return;
    }

    const newIntegration = {
      id: Math.max(0, ...integrations.map((item) => Number(item.id) || 0)) + 1,
      name,
      description,
      category: addForm.category,
      icon: iconForCategory(addForm.category),
      endpoint,
      authType: addForm.authType,
      apiKey: '',
      workspace: '',
      status: 'Not Connected',
      action: 'Connect',
    };

    persist([...integrations, newIntegration]);

    setCategory('All Integrations');
    setSearch('');
    setSummaryPanel(null);
    setShowAddModal(false);
    setAddForm(EMPTY_FORM);
    setAddError('');

    toast(`${name} added successfully. It is currently not connected.`);
  };

  const saveConfiguration = (event) => {
    event.preventDefault();

    if (!selected) return;

    if (!config.endpoint?.trim() || !config.apiKey?.trim()) {
      toast('Enter the required API key and endpoint.');
      return;
    }

    try {
      const parsedUrl = new URL(config.endpoint.trim());

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        toast('Enter a valid HTTP or HTTPS endpoint.');
        return;
      }
    } catch {
      toast('Enter a valid API endpoint URL.');
      return;
    }

    setSaving(true);

    const updated = integrations.map((item) =>
      item.id === selected.id
        ? {
            ...item,
            endpoint: config.endpoint.trim(),
            apiKey: config.apiKey.trim(),
            workspace: (config.workspace || '').trim(),
            status: 'Connected',
            action: 'Manage',
          }
        : item
    );

    persist(updated);
    setSelected(null);
    setSaving(false);

    toast(`${selected.name} settings saved in this browser.`);
  };

  const handleAction = (item) => {
    if (item.action === 'Disconnect') {
      if (window.confirm(`Disconnect ${item.name}?`)) {
        updateStatus(item.id, 'Not Connected', 'Connect');
        toast(`${item.name} disconnected.`);
      }

      return;
    }

    if (item.action === 'View Progress' || item.status === 'Connecting') {
      toast(`${item.name}: connection is pending backend verification.`);
      return;
    }

    openConfiguration(item);
  };

  const disconnectSelected = () => {
    if (!selected) return;

    const item = selected;

    if (window.confirm(`Disconnect ${item.name}?`)) {
      updateStatus(item.id, 'Not Connected', 'Connect');
      setSelected(null);
      toast(`${item.name} disconnected.`);
    }
  };

  const exportSettings = () => {
    const safeData = integrations.map(({ apiKey, ...item }) => ({
      ...item,
      apiKey: apiKey ? 'Configured' : 'Not configured',
    }));

    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            integrations: safeData,
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'megsi-integration-settings.json';
    link.click();

    URL.revokeObjectURL(url);
    toast('Integration settings exported.');
  };

  return (
    <div className="integrations-page">
      <div className="int-title-row">
        <div>
          <h1>Integrations</h1>
          <p>
            Connect external tools and services to expand the capabilities of
            your MEGSI platform.
          </p>
        </div>

        <div className="int-header-actions">
          <button
            className="int-primary int-add-button"
            type="button"
            onClick={() => {
              setAddForm(EMPTY_FORM);
              setAddError('');
              setShowAddModal(true);
            }}
          >
            <Plus size={16} />
            Add Integration
          </button>

          <button
            className="int-primary int-export"
            type="button"
            onClick={exportSettings}
          >
            <Download size={15} />
            Export Settings
          </button>
        </div>
      </div>

      <div className="int-toolbar">
        <div className="int-search">
          <Search size={18} />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search integrations..."
            aria-label="Search integrations"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="int-tabs" role="tablist" aria-label="Integration categories">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={category === item}
              className={category === item ? 'active' : ''}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="int-summary" aria-label="Integration summary">
        {summaryItems.map(({ key, label, count, icon: SummaryIcon, tone }) => (
          <button
            type="button"
            key={key}
            className={`int-summary-item ${summaryPanel === key ? 'selected' : ''}`}
            onClick={() => setSummaryPanel(key)}
            aria-label={`Show ${label.toLowerCase()}: ${count} integrations`}
            aria-pressed={summaryPanel === key}
          >
            <span className={`int-summary-icon ${tone}`}>
              <SummaryIcon size={20} />
            </span>

            <span className="int-summary-copy">
              <span>{label}</span>
              <strong>{count}</strong>
            </span>
          </button>
        ))}
      </div>

      <div className="int-section-heading">
        <div>
          <h2>Available Integrations</h2>
          <p>Manage connected services and configure your platform tools.</p>
        </div>

        <span className="int-results">{filtered.length} results</span>
      </div>

      <div className="int-grid">
        {filtered.map((item) => {
          const Icon = ICONS[item.icon] || Plug;

          return (
            <article className="int-card" key={item.id}>
              <div className="int-card-top">
                <div className={`int-provider-icon icon-${item.icon}`}>
                  <Icon size={30} strokeWidth={2.2} />
                </div>

                <div className="int-card-title">
                  <h3>{item.name}</h3>
                  <span>{item.category}</span>
                </div>
              </div>

              <p className="int-description">{item.description}</p>

              <div className="int-card-footer">
                <span
                  className={`int-status ${
                    item.status === 'Connected'
                      ? 'connected'
                      : item.status === 'Connecting'
                        ? 'connecting'
                        : 'not-connected'
                  }`}
                >
                  <i />
                  {item.status}
                </span>

                <button
                  type="button"
                  className={`int-action ${
                    item.action === 'Connect'
                      ? 'primary'
                      : item.action === 'Disconnect'
                        ? 'disconnect'
                        : ''
                  }`}
                  onClick={() => handleAction(item)}
                >
                  {item.action === 'Connect' && <Plus size={14} />}
                  {item.action === 'Manage' && <Settings size={14} />}
                  {item.action === 'View Progress' && <Activity size={14} />}
                  {item.action === 'Configure' && <Settings size={14} />}
                  {item.action === 'Disconnect' && <X size={14} />}
                  {item.action}
                </button>
              </div>
            </article>
          );
        })}

        {filtered.length === 0 && (
          <div className="int-empty">
            <Search size={30} />
            <h3>No integrations found</h3>
            <p>Try a different search term or category.</p>

            <button
              type="button"
              className="int-action primary"
              onClick={() => {
                setSearch('');
                setCategory('All Integrations');
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Add Integration Modal */}
      {showAddModal && (
        <div
          className="int-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAddModal(false);
              setAddError('');
            }
          }}
        >
          <section
            className="int-modal int-add-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="int-add-title"
          >
            <div className="int-modal-header">
              <div>
                <span className="int-modal-icon">
                  <Plus size={21} />
                </span>

                <div>
                  <h2 id="int-add-title">Add Integration</h2>
                  <p>Register a new service on the MEGSI platform.</p>
                </div>
              </div>

              <button
                className="int-close"
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setAddError('');
                }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addIntegration}>
              <div className="int-modal-body">
                <div className="int-info">
                  <Shield size={17} />
                  <span>
                    New integrations are added as Not Connected. Configure
                    credentials later to start a connection.
                  </span>
                </div>

                <label>
                  Integration Name <span className="required">*</span>
                  <input
                    type="text"
                    placeholder="e.g. Google Workspace"
                    value={addForm.name}
                    onChange={(event) =>
                      setAddForm({ ...addForm, name: event.target.value })
                    }
                    maxLength={80}
                    required
                    autoFocus
                  />
                </label>

                <label>
                  Category <span className="required">*</span>
                  <select
                    value={addForm.category}
                    onChange={(event) =>
                      setAddForm({ ...addForm, category: event.target.value })
                    }
                    required
                  >
                    {CATEGORIES.filter(
                      (item) => item !== 'All Integrations'
                    ).map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Description <span className="required">*</span>
                  <textarea
                    placeholder="Describe what this integration does"
                    value={addForm.description}
                    onChange={(event) =>
                      setAddForm({
                        ...addForm,
                        description: event.target.value,
                      })
                    }
                    maxLength={240}
                    rows={3}
                    required
                  />
                </label>

                <label>
                  API Endpoint
                  <input
                    type="url"
                    placeholder="https://api.example.com"
                    value={addForm.endpoint}
                    onChange={(event) =>
                      setAddForm({ ...addForm, endpoint: event.target.value })
                    }
                  />
                  <span className="int-field-help">
                    Optional. Enter a valid HTTP or HTTPS URL if available.
                  </span>
                </label>

                <label>
                  Authentication Type <span className="required">*</span>
                  <select
                    value={addForm.authType}
                    onChange={(event) =>
                      setAddForm({ ...addForm, authType: event.target.value })
                    }
                    required
                  >
                    {AUTH_TYPES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                {addError && (
                  <p className="int-add-error" role="alert">
                    {addError}
                  </p>
                )}

                <p className="int-demo-note">
                  Demo mode: integration details are saved in this browser.
                  Real service authentication requires backend integration.
                </p>
              </div>

              <div className="int-modal-footer">
                <button
                  type="button"
                  className="int-action"
                  onClick={() => {
                    setShowAddModal(false);
                    setAddError('');
                  }}
                >
                  Cancel
                </button>

                <button type="submit" className="int-primary">
                  <Plus size={15} />
                  Add Integration
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Summary Details Drawer */}
      {summaryPanel && (
        <div
          className="int-drawer-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSummaryPanel(null);
            }
          }}
        >
          <aside
            className="int-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="int-drawer-title"
          >
            <header className="int-drawer-header">
              <div>
                <h2 id="int-drawer-title">
                  {summaryItems.find((item) => item.key === summaryPanel)?.label}
                </h2>
                <p>
                  {summaryIntegrations.length} integration
                  {summaryIntegrations.length === 1 ? '' : 's'} in this group
                </p>
              </div>

              <button
                className="int-close"
                type="button"
                onClick={() => setSummaryPanel(null)}
                aria-label="Close integration details"
              >
                <X size={19} />
              </button>
            </header>

            <div className="int-drawer-summary">
              <span>
                {summaryPanel === 'all' ? 'Total Integrations' : summaryPanel}
              </span>
              <strong>{summaryIntegrations.length}</strong>
            </div>

            <div className="int-drawer-list">
              {summaryIntegrations.map((item) => {
                const Icon = ICONS[item.icon] || Plug;

                return (
                  <article className="int-drawer-item" key={item.id}>
                    <span className={`int-drawer-provider icon-${item.icon}`}>
                      <Icon size={18} />
                    </span>

                    <div className="int-drawer-item-copy">
                      <strong>{item.name}</strong>
                      <span>{item.category}</span>
                    </div>

                    <span
                      className={`int-status ${
                        item.status === 'Connected'
                          ? 'connected'
                          : item.status === 'Connecting'
                            ? 'connecting'
                            : 'not-connected'
                      }`}
                    >
                      <i />
                      {item.status}
                    </span>
                  </article>
                );
              })}

              {summaryIntegrations.length === 0 && (
                <p className="int-drawer-empty">
                  No integrations in this group.
                </p>
              )}
            </div>

            <footer className="int-drawer-footer">
              <span>Demo data · Changes are stored in this browser</span>
              <button
                type="button"
                className="int-primary"
                onClick={() => setSummaryPanel(null)}
              >
                Done
              </button>
            </footer>
          </aside>
        </div>
      )}

      {/* Connection Configuration Modal */}
      {selected && (
        <div
          className="int-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelected(null);
            }
          }}
        >
          <section
            className="int-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="int-modal-title"
          >
            <div className="int-modal-header">
              <div>
                <span className="int-modal-icon">
                  <Plug size={21} />
                </span>

                <div>
                  <h2 id="int-modal-title">
                    {selected.status === 'Connected'
                      ? 'Manage integration'
                      : 'Connect integration'}
                  </h2>
                  <p>{selected.name}</p>
                </div>
              </div>

              <button
                className="int-close"
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveConfiguration}>
              <div className="int-modal-body">
                <div className="int-info">
                  <Shield size={17} />
                  <span>
                    Enter the configuration details provided by your service
                    administrator.
                  </span>
                </div>

                <label>
                  Integration name
                  <input value={config.name || ''} readOnly />
                </label>

                <label>
                  API endpoint <span className="required">*</span>
                  <input
                    type="url"
                    placeholder="https://api.example.com"
                    value={config.endpoint || ''}
                    onChange={(event) =>
                      setConfig({ ...config, endpoint: event.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  API key <span className="required">*</span>
                  <input
                    type="password"
                    placeholder="Enter your API key"
                    value={config.apiKey || ''}
                    onChange={(event) =>
                      setConfig({ ...config, apiKey: event.target.value })
                    }
                    required
                    autoComplete="new-password"
                  />
                </label>

                <label>
                  Workspace / Account ID
                  <input
                    placeholder="Optional"
                    value={config.workspace || ''}
                    onChange={(event) =>
                      setConfig({ ...config, workspace: event.target.value })
                    }
                  />
                </label>

                <p className="int-demo-note">
                  Demo mode: these details are stored in this browser only.
                  A backend service is required to verify credentials and
                  establish a real connection.
                </p>
              </div>

              <div className="int-modal-footer">
                {selected.status === 'Connected' && (
                  <button
                    type="button"
                    className="int-action disconnect"
                    onClick={disconnectSelected}
                  >
                    <X size={14} />
                    Disconnect
                  </button>
                )}

                <button
                  type="button"
                  className="int-action"
                  onClick={() => setSelected(null)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="int-primary"
                  disabled={saving}
                >
                  <CheckCircle2 size={15} />
                  {saving ? 'Saving...' : 'Save configuration'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}