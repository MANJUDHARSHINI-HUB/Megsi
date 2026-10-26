import React, { useMemo, useState } from "react";
import {
  Mail,
  MessageSquare,
  Send,
  CircleCheck,
  CircleX,
  Cloud,
  Smartphone,
  Radio,
  AtSign,
  Settings,
  Search,
  Plus,
  X,
  Download,
  ShieldCheck,
  Save,
} from "lucide-react";


import "./email-sms.css";


const initialProviders = [
  {
    id: 1,
    name: "SendGrid Email API",
    category: "Email",
    description: "System notifications and automated emails.",
    icon: Send,
    connected: true,
    action: "Configure",
    color: "blue",
  },
  {
    id: 2,
    name: "Standard Email Service",
    category: "Email",
    description: "Direct email messaging and manual emails.",
    icon: Mail,
    connected: true,
    action: "Configure",
    color: "blue",
  },
  {
    id: 3,
    name: "Mailgun",
    category: "Email",
    description: "Transactional and marketing emails.",
    icon: AtSign,
    connected: false,
    action: "Connect",
    color: "red",
  },
  {
    id: 4,
    name: "Postmark",
    category: "Email",
    description: "Transactional emails and inbound email.",
    icon: Mail,
    connected: true,
    action: "Manage",
    color: "amber",
  },
  {
    id: 5,
    name: "AWS SES",
    category: "Email",
    description: "Scalable email delivery service.",
    icon: Cloud,
    connected: true,
    action: "Configure",
    color: "gold",
  },
  {
    id: 6,
    name: "Twilio Messaging API",
    category: "SMS",
    description: "SMS and voice messaging service.",
    icon: CircleCheck,
    connected: true,
    action: "Configure",
    color: "red",
  },
  {
    id: 7,
    name: "ClickSend SMS",
    category: "SMS",
    description: "Reliable SMS delivery for system updates.",
    icon: MessageSquare,
    connected: false,
    action: "Connect",
    color: "blue",
  },
  {
    id: 8,
    name: "MessageBird",
    category: "SMS",
    description: "Global messaging platform for businesses.",
    icon: Radio,
    connected: true,
    action: "Manage",
    color: "cyan",
  },
  {
    id: 9,
    name: "Vonage",
    category: "SMS",
    description: "Cloud communication platform.",
    icon: Smartphone,
    connected: true,
    action: "Configure",
    color: "purple",
  },
  {
    id: 10,
    name: "Natapa",
    category: "SMS",
    description: "SMS gateway and messaging services.",
    icon: MessageSquare,
    connected: true,
    action: "Manage",
    color: "purple",
  },
  {
    id: 11,
    name: "Plivo",
    category: "SMS",
    description: "Cloud-based SMS and voice platform.",
    icon: Smartphone,
    connected: true,
    action: "Configure",
    color: "green",
  },
  {
    id: 12,
    name: "AWS SNS",
    category: "SMS",
    description: "Simple Notification Service for messaging.",
    icon: Cloud,
    connected: true,
    action: "Configure",
    color: "gold",
  },
];

function readSavedProviders() {
  try {
    const saved = localStorage.getItem("megsi-email-sms-providers");

    if (!saved) return initialProviders;

    const parsed = JSON.parse(saved);

    if (
      !Array.isArray(parsed) ||
      parsed.length !== initialProviders.length ||
      !initialProviders.every((provider) =>
        parsed.some((item) => item.id === provider.id)
      )
    ) {
      return initialProviders;
    }

    return initialProviders.map((provider) => {
      const savedProvider = parsed.find(
        (item) => item.id === provider.id
      );

      return {
        ...provider,
        connected: Boolean(savedProvider?.connected),
      };
    });
  } catch {
    return initialProviders;
  }
}

function EmailSms() {
  const [providers, setProviders] = useState(readSavedProviders);
  const [activeFilter, setActiveFilter] = useState("All");
  const [emailSearch, setEmailSearch] = useState("");
  const [smsSearch, setSmsSearch] = useState("");
  const [emailStatus, setEmailStatus] = useState("All Status");
  const [smsStatus, setSmsStatus] = useState("All Status");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [credentials, setCredentials] = useState({
    endpoint: "",
    apiKey: "",
    sender: "",
  });
  const [savedMessage, setSavedMessage] = useState("");

  const totalCount = providers.length;

  const connectedCount = providers.filter(
    (provider) => provider.connected
  ).length;

  const disconnectedCount = totalCount - connectedCount;

  const emailProviders = providers.filter(
    (provider) => provider.category === "Email"
  );

  const smsProviders = providers.filter(
    (provider) => provider.category === "SMS"
  );

  const getConnectedCount = (items) =>
    items.filter((provider) => provider.connected).length;

  const updateProvider = (id, connected) => {
    setProviders((current) => {
      const updated = current.map((provider) =>
        provider.id === id
          ? { ...provider, connected }
          : provider
      );

      try {
        localStorage.setItem(
          "megsi-email-sms-providers",
          JSON.stringify(updated.map(({ id, connected }) => ({
            id,
            connected,
          })))
        );
      } catch {
        // The current React state still works if storage is unavailable.
      }

      return updated;
    });
  };

  const visibleEmailProviders = useMemo(() => {
    return emailProviders.filter((provider) => {
      const matchesSearch =
        provider.name.toLowerCase().includes(emailSearch.toLowerCase()) ||
        provider.description.toLowerCase().includes(emailSearch.toLowerCase());

      const matchesStatus =
        emailStatus === "All Status" ||
        (emailStatus === "Connected" && provider.connected) ||
        (emailStatus === "Not Connected" && !provider.connected);

      return matchesSearch && matchesStatus;
    });
  }, [providers, emailSearch, emailStatus]);

  const visibleSmsProviders = useMemo(() => {
    return smsProviders.filter((provider) => {
      const matchesSearch =
        provider.name.toLowerCase().includes(smsSearch.toLowerCase()) ||
        provider.description.toLowerCase().includes(smsSearch.toLowerCase());

      const matchesStatus =
        smsStatus === "All Status" ||
        (smsStatus === "Connected" && provider.connected) ||
        (smsStatus === "Not Connected" && !provider.connected);

      return matchesSearch && matchesStatus;
    });
  }, [providers, smsSearch, smsStatus]);

  const openProvider = (provider) => {
    setSelectedProvider(provider);
    setConfirmDisconnect(false);
    setSavedMessage("");
    setCredentials({
      endpoint: "",
      apiKey: "",
      sender: "",
    });
  };

  const closeDialog = () => {
    setSelectedProvider(null);
    setConfirmDisconnect(false);
    setSavedMessage("");
  };

  const handleProviderAction = (provider) => {
    if (provider.connected) {
      openProvider(provider);
      return;
    }

    openProvider(provider);
  };

  const saveConfiguration = (event) => {
    event.preventDefault();

    if (!selectedProvider) return;

    if (!credentials.apiKey.trim()) {
      setSavedMessage("Enter an API key to continue.");
      return;
    }

    // Demo mode: this validates the form but does not verify
    // credentials with a real email or SMS provider.
    updateProvider(selectedProvider.id, true);
    setSelectedProvider((current) =>
      current ? { ...current, connected: true } : current
    );
    setConfirmDisconnect(false);
    setSavedMessage(
      "Demo configuration saved. Credentials were not verified by a backend."
    );
  };

  const disconnectProvider = () => {
    if (!selectedProvider) return;

    updateProvider(selectedProvider.id, false);
    setSelectedProvider((current) =>
      current ? { ...current, connected: false } : current
    );
    setConfirmDisconnect(false);
    setSavedMessage("Provider disconnected in demo mode.");
  };

  const exportSettings = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      mode: "Demo",
      totalProviders: totalCount,
      connectedProviders: connectedCount,
      disconnectedProviders: disconnectedCount,
      providers: providers.map((provider) => ({
        name: provider.name,
        category: provider.category,
        status: provider.connected ? "Connected" : "Not Connected",
      })),
    };

    const blob = new Blob(
      [JSON.stringify(exportData, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "megsi-email-sms-settings.json";
    anchor.click();

    URL.revokeObjectURL(url);
  };

  const scrollToSection = (category) => {
    setActiveFilter(category);

    document.getElementById(
      category === "Email" ? "email-providers" : "sms-providers"
    )?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const renderProviderCard = (provider) => {
    const Icon = provider.icon;

    return (
      <article className="es-provider-card" key={provider.id}>
        <div className="es-provider-main">
          <div className={`es-provider-icon es-icon-${provider.color}`}>
            <Icon size={26} strokeWidth={2} />
          </div>

          <span
            className={`es-category-tag ${
              provider.category === "Email"
                ? "es-email-tag"
                : "es-sms-tag"
            }`}
          >
            {provider.category}
          </span>
        </div>

        <div className="es-provider-info">
          <h3>{provider.name}</h3>
          <p>{provider.description}</p>
        </div>

        <div className="es-provider-footer">
          <span
            className={`es-status ${
              provider.connected
                ? "es-status-connected"
                : "es-status-disconnected"
            }`}
          >
            <span className="es-status-dot" />
            {provider.connected ? "Connected" : "Not Connected"}
          </span>

          <button
            type="button"
            className={`es-action-button ${
              provider.connected ? "es-button-outline" : "es-button-primary"
            }`}
            onClick={() => handleProviderAction(provider)}
          >
            {provider.connected ? (
              <Settings size={14} />
            ) : (
              <Plus size={15} />
            )}
            {provider.connected ? provider.action : "Connect"}
          </button>
        </div>
      </article>
    );
  };

  const renderStatusSelect = (value, onChange, label) => (
    <select
      className="es-status-select"
      aria-label={`${label} provider status`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option>All Status</option>
      <option>Connected</option>
      <option>Not Connected</option>
    </select>
  );

  return (
    <div className="es-page">
      <div className="es-page-heading">
        <div>
          <h1>Email &amp; SMS</h1>
          <p>
            Manage email providers, delivery settings, automated emails,
            and notification templates from one central place.
          </p>
        </div>

        <div className="es-heading-actions">
          <button
            type="button"
            className="es-export-button"
            onClick={exportSettings}
          >
            <Download size={15} />
            Export Settings
          </button>
        </div>
      </div>

      <div className="es-overview-grid">
        <article
          className="es-overview-card"
          role="button"
          tabIndex={0}
          onClick={() => scrollToSection("Email")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              scrollToSection("Email");
            }
          }}
        >
          <div className="es-overview-top">
            <div className="es-overview-icon">
              <Mail size={30} />
            </div>

            <div className="es-overview-info">
              <h2>Email Services</h2>
              <p>
                Manage email providers, delivery settings, automated
                emails, and notification templates.
              </p>
            </div>
          </div>

          <div className="es-overview-stats">
            <span>
              <Mail size={16} />
              {emailProviders.length} Providers
            </span>
            <span className="es-stat-connected">
              <i />
              {getConnectedCount(emailProviders)} Connected
            </span>
            <span className="es-stat-disconnected">
              <i />
              {emailProviders.length - getConnectedCount(emailProviders)}{" "}
              Not Connected
            </span>
          </div>
        </article>

        <article
          className="es-overview-card"
          role="button"
          tabIndex={0}
          onClick={() => scrollToSection("SMS")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              scrollToSection("SMS");
            }
          }}
        >
          <div className="es-overview-top">
            <div className="es-overview-icon es-overview-icon-sms">
              <MessageSquare size={30} />
            </div>

            <div className="es-overview-info">
              <h2>SMS Services</h2>
              <p>
                Manage SMS gateways, message delivery, alerts, and
                notification templates.
              </p>
            </div>
          </div>

          <div className="es-overview-stats">
            <span>
              <MessageSquare size={16} />
              {smsProviders.length} Providers
            </span>
            <span className="es-stat-connected">
              <i />
              {getConnectedCount(smsProviders)} Connected
            </span>
            <span className="es-stat-disconnected">
              <i />
              {smsProviders.length - getConnectedCount(smsProviders)}{" "}
              Not Connected
            </span>
          </div>
        </article>
      </div>

      <section className="es-provider-section" id="email-providers">
        <div className="es-section-heading">
          <div className="es-section-title">
            <span className="es-section-icon">
              <Mail size={18} />
            </span>
            <h2>Email Providers</h2>
          </div>

          <div className="es-section-controls">
            <label className="es-search-box">
              <Search size={17} />
              <input
                type="search"
                placeholder="Search email providers..."
                value={emailSearch}
                onChange={(event) => setEmailSearch(event.target.value)}
              />
            </label>

            {renderStatusSelect(
              emailStatus,
              setEmailStatus,
              "Email"
            )}
          </div>
        </div>

        <div className="es-provider-grid es-email-grid">
          {visibleEmailProviders.map(renderProviderCard)}
        </div>

        {visibleEmailProviders.length === 0 && (
          <div className="es-empty-state">
            No email providers match your search or selected status.
          </div>
        )}
      </section>

      <section className="es-provider-section" id="sms-providers">
        <div className="es-section-heading">
          <div className="es-section-title">
            <span className="es-section-icon es-section-icon-sms">
              <MessageSquare size={18} />
            </span>
            <h2>SMS Providers</h2>
          </div>

          <div className="es-section-controls">
            <label className="es-search-box">
              <Search size={17} />
              <input
                type="search"
                placeholder="Search SMS providers..."
                value={smsSearch}
                onChange={(event) => setSmsSearch(event.target.value)}
              />
            </label>

            {renderStatusSelect(
              smsStatus,
              setSmsStatus,
              "SMS"
            )}
          </div>
        </div>

        <div className="es-provider-grid es-sms-grid">
          {visibleSmsProviders.map(renderProviderCard)}
        </div>

        {visibleSmsProviders.length === 0 && (
          <div className="es-empty-state">
            No SMS providers match your search or selected status.
          </div>
        )}
      </section>

      <div className="es-demo-note">
        <ShieldCheck size={14} />
        <span>
          Demo mode — provider settings are stored in this browser.
          A backend service is required to verify credentials and send
          real emails or SMS messages.
        </span>
        <span className="es-total-providers">
          {totalCount} providers · {connectedCount} connected ·{" "}
          {disconnectedCount} not connected
        </span>
      </div>

      {selectedProvider && (
        <div
          className="es-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <section
            className="es-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="es-modal-title"
          >
            <div className="es-modal-header">
              <div>
                <h2 id="es-modal-title">
                  {selectedProvider.connected
                    ? `${selectedProvider.name} Settings`
                    : `Connect ${selectedProvider.name}`}
                </h2>
                <p>
                  {selectedProvider.category} provider configuration
                </p>
              </div>

              <button
                type="button"
                className="es-modal-close"
                onClick={closeDialog}
                aria-label="Close dialog"
              >
                <X size={19} />
              </button>
            </div>

            <div className="es-modal-body">
              <div className="es-modal-provider">
                <span
                  className={`es-provider-icon es-icon-${selectedProvider.color}`}
                >
                  {React.createElement(selectedProvider.icon, { size: 26 })}
                </span>

                <div>
                  <strong>{selectedProvider.name}</strong>
                  <span
                    className={`es-status ${
                      selectedProvider.connected
                        ? "es-status-connected"
                        : "es-status-disconnected"
                    }`}
                  >
                    <span className="es-status-dot" />
                    {selectedProvider.connected
                      ? "Connected"
                      : "Not Connected"}
                  </span>
                </div>
              </div>

              {confirmDisconnect ? (
                <div className="es-confirm-box">
                  <CircleX size={25} />
                  <h3>Disconnect this provider?</h3>
                  <p>
                    This changes the provider status in demo mode.
                    It does not revoke credentials with the external service.
                  </p>

                  <div className="es-modal-actions">
                    <button
                      type="button"
                      className="es-action-button es-button-outline"
                      onClick={() => setConfirmDisconnect(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="es-action-button es-danger-button"
                      onClick={disconnectProvider}
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={saveConfiguration}>
                  <label className="es-form-label">
                    API Endpoint <span>(optional)</span>
                    <input
                      value={credentials.endpoint}
                      onChange={(event) =>
                        setCredentials((current) => ({
                          ...current,
                          endpoint: event.target.value,
                        }))
                      }
                      placeholder="https://api.example.com"
                    />
                  </label>

                  <label className="es-form-label">
                    API Key
                    <input
                      type="password"
                      value={credentials.apiKey}
                      onChange={(event) =>
                        setCredentials((current) => ({
                          ...current,
                          apiKey: event.target.value,
                        }))
                      }
                      placeholder="Enter API key"
                      autoComplete="off"
                      required
                    />
                  </label>

                  <label className="es-form-label">
                    Sender ID / Email <span>(optional)</span>
                    <input
                      value={credentials.sender}
                      onChange={(event) =>
                        setCredentials((current) => ({
                          ...current,
                          sender: event.target.value,
                        }))
                      }
                      placeholder={
                        selectedProvider.category === "Email"
                          ? "notifications@example.com"
                          : "MEGSI"
                      }
                    />
                  </label>

                  {savedMessage && (
                    <div
                      className={
                        savedMessage.startsWith("Enter")
                          ? "es-form-message es-form-error"
                          : "es-form-message es-form-success"
                      }
                      role="status"
                    >
                      {savedMessage}
                    </div>
                  )}

                  <div className="es-modal-actions">
                    {selectedProvider.connected && (
                      <button
                        type="button"
                        className="es-action-button es-danger-button"
                        onClick={() => {
                          setConfirmDisconnect(true);
                          setSavedMessage("");
                        }}
                      >
                        Disconnect
                      </button>
                    )}

                    <button
                      type="button"
                      className="es-action-button es-button-outline"
                      onClick={closeDialog}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="es-action-button es-button-primary"
                    >
                      <Save size={14} />
                      Save Configuration
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default EmailSms;