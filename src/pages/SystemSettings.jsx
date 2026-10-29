import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, Bell, Check, ChevronRight, CircleHelp, Clock3, Database,
  FileText, LockKeyhole, Monitor, Plug, RotateCcw, Save, Settings,
  ShieldCheck, SlidersHorizontal, Users, X, AlertTriangle, Download, RefreshCw, Sun
} from "lucide-react";
import "./system-settings.css";
import { Toggle } from "./SettingsWidgets.jsx";

const KEY = "megsi-system-settings-v1";

const DEFAULTS = {
  general: {
    platformName: "MEGSI Platform",
    description: "Security workforce management platform",
    language: "English",
    timeZone: "Europe/London",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24-hour",
    country: "United Kingdom",
    currency: "GBP (£)"
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: true,
    newCompany: true,
    suspendedTenant: true,
    subscriptionExpiry: true,
    systemErrors: true,
    securityAlerts: true,
    maintenanceNotices: true
  },
  security: {
    passwordPolicy: "Strong",
    minPasswordLength: 12,
    twoFactor: true,
    sessionTimeout: 30,
    automaticLogout: true,
    maxLoginAttempts: 5,
    lockoutMinutes: 15,
    loginMethod: "Password and 2FA"
  },
  access: {
    defaultRole: "Read-only",
    restrictSensitiveActions: true,
    requireReauthentication: true,
    rememberedDevices: false,
    sessionPolicy: "One active session per user",
    adminRule: "Authorized platform administrators only"
  },
  backup: {
    automaticBackup: true,
    frequency: "Daily",
    backupTime: "02:00",
    retentionDays: 30,
    dataRetentionDays: 365,
    lastBackup: "2026-10-26 02:00",
    backupStatus: "Completed"
  },
  integrations: {
    emailProvider: "Configured provider",
    smsProvider: "Configured provider",
    apiStatus: "Demo mode",
    connectionTest: "Not tested",
    externalIntegrations: true,
    integrationErrors: "No recent errors"
  },
  system: {
    maintenanceMode: false,
    maintenanceMessage:
      "MEGSI is temporarily unavailable for scheduled maintenance. Please try again later.",
    environment: "Development",
    version: "1.0.0",
    systemHealth: "Healthy",
    notifyMaintenance: true
  },
  display: {
    mode: "light",
    accent: "#2563eb",
    brightness: 100,
    nightLight: false,
    colorProfile: "Standard",
    hdr: false,
    scale: "125%",
    resolution: "1920 × 1080 (Recommended)",
    orientation: "Landscape",
    multipleDisplays: "Show only on 1"
  },
  audit: {
    auditRetentionDays: 365,
    trackAdminActions: true,
    logSecurityEvents: true,
    privacyMode: "Standard",
    complianceFramework: "UK GDPR",
    redactSensitiveData: true
  }
};

const TABS = [
  ["overview", "Overview", Activity],
  ["general", "General", SlidersHorizontal],
  ["notifications", "Notifications", Bell],
  ["security", "Security", ShieldCheck],
  ["access", "Access Control", Users],
  ["backup", "Backup & Retention", Database],
  ["integrations", "Integrations", Plug],
  ["system", "System & Maintenance", Monitor],
  ["display", "Display Settings", Monitor],
  ["audit", "Audit & Compliance", FileText]
];

const clone = (value) => JSON.parse(JSON.stringify(value));

function loadSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || "null");

    return stored
      ? Object.fromEntries(
          Object.keys(DEFAULTS).map((key) => [
            key,
            { ...DEFAULTS[key], ...(stored[key] || {}) }
          ])
        )
      : clone(DEFAULTS);
  } catch {
    return clone(DEFAULTS);
  }
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  options,
  min,
  max,
  help
}) {
  return (
    <label className="ss-field">
      <span>{label}</span>

      {options ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          rows="3"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          type={type}
          min={min}
          max={max}
          value={value}
          onChange={(event) =>
            onChange(
              type === "number"
                ? Number(event.target.value)
                : event.target.value
            )
          }
        />
      )}

      {help && <small>{help}</small>}
    </label>
  );
}

function Heading({ eyebrow, title, description, icon: Icon = Settings }) {
  return (
    <div className="ss-heading">
      <span className="ic-sq">
        <Icon />
      </span>

      <div>
        <small>{eyebrow}</small>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function Notice({ icon: Icon, children }) {
  return (
    <div className="ss-notice">
      <Icon />
      {children}
    </div>
  );
}

export default function SystemSettings({ toast }) {
  const [saved, setSaved] = useState(loadSettings);
  const [data, setData] = useState(loadSettings);
  const [tab, setTab] = useState("overview");
  const [dialog, setDialog] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState("");

  const dirty = useMemo(
    () => JSON.stringify(data) !== JSON.stringify(saved),
    [data, saved]
  );

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(""), 3500);

    return () => clearTimeout(timer);
  }, [notice]);

  const say = (message, type = "success") => {
    setNotice(message);

    if (typeof toast === "function") {
      toast(message, type);
    }
  };

  const update = (section, key, value) => {
    setData((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [key]: value
      }
    }));

    setError("");
  };

  const save = () => {
    if (!data.general.platformName.trim()) {
      setTab("general");
      setError("Platform name is required.");
      return;
    }

    if (
      data.security.minPasswordLength < 8 ||
      data.security.minPasswordLength > 64
    ) {
      setTab("security");
      setError("Password length must be between 8 and 64.");
      return;
    }

    if (
      data.backup.retentionDays < 1 ||
      data.backup.retentionDays > 3650
    ) {
      setTab("backup");
      setError("Backup retention must be between 1 and 3650 days.");
      return;
    }

    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      setSaved(clone(data));
      setSavedAt(new Date().toLocaleString());
      setError("");
      say("Settings saved successfully.");
    } catch {
      say("Unable to save settings in this browser.", "error");
    }
  };

  const reset = () =>
    setDialog({
      title: "Reset all settings?",
      body: "Restore the default demo values for all settings sections.",
      action: "reset"
    });

  const cancel = () => {
    if (dirty) {
      setDialog({
        title: "Discard unsaved changes?",
        body: "Your unsaved edits will be discarded.",
        action: "discard"
      });
    } else {
      setData(clone(saved));
    }
  };

  const confirm = () => {
    if (!dialog) return;

    if (dialog.action === "reset") {
      setData(clone(DEFAULTS));
      say("Defaults restored. Click Save Changes to persist them.");
    }

    if (dialog.action === "discard") {
      setData(clone(saved));
      say("Unsaved changes discarded.");
    }

    if (dialog.action === "maintenance") {
      update("system", "maintenanceMode", !data.system.maintenanceMode);
      say("Maintenance setting updated in demo.");
    }

    if (dialog.action === "restore") {
      say(
        "Restore is a demo action; connect a secure backend to restore real data.",
        "info"
      );
    }

    setDialog(null);
  };

  const overview = () => (
    <>
      <Heading
        icon={Activity}
        eyebrow="PLATFORM CONFIGURATION"
        title="System overview"
        description="Monitor key configuration and manage your platform settings from one place."
      />

      <div className="ss-stats">
        <article>
          <span className="ss-stat-icon blue">
            <Settings />
          </span>
          <small>Configuration</small>
          <b>8 sections</b>
          <em>Platform settings</em>
        </article>

        <article>
          <span className="ss-stat-icon green">
            <Activity />
          </span>
          <small>System health</small>
          <b>{data.system.systemHealth}</b>
          <em>Demo status</em>
        </article>

        <article>
          <span className="ss-stat-icon purple">
            <Database />
          </span>
          <small>Last backup</small>
          <b>{data.backup.backupStatus}</b>
          <em>{data.backup.lastBackup}</em>
        </article>

        <article>
          <span
            className={`ss-stat-icon ${
              data.system.maintenanceMode ? "amber" : "green"
            }`}
          >
            <Monitor />
          </span>
          <small>Maintenance</small>
          <b>{data.system.maintenanceMode ? "Enabled" : "Disabled"}</b>
          <em>Shared setting</em>
        </article>
      </div>

      <div className="ss-two-col">
        <section className="ss-card">
          <h3>Quick controls</h3>
          <p className="ss-sub">
            Frequently used platform-wide settings
          </p>

          <Toggle
            label="Maintenance mode"
            description="Also updates System & Maintenance."
            checked={data.system.maintenanceMode}
            onChange={() =>
              setDialog({
                title: `${
                  data.system.maintenanceMode ? "Disable" : "Enable"
                } maintenance mode?`,
                body: "This updates the shared demo setting. Production enforcement requires backend support.",
                action: "maintenance"
              })
            }
          />

          <Toggle
            label="Automatic backups"
            checked={data.backup.automaticBackup}
            onChange={(value) =>
              update("backup", "automaticBackup", value)
            }
          />

          <Toggle
            label="Security event logging"
            checked={data.audit.logSecurityEvents}
            onChange={(value) =>
              update("audit", "logSecurityEvents", value)
            }
          />
        </section>

        <section className="ss-card">
          <h3>Platform details</h3>
          <p className="ss-sub">Current configuration summary</p>

          {[
            ["Platform name", data.general.platformName],
            ["Environment", data.system.environment],
            ["Time zone", data.general.timeZone],
            ["Audit retention", `${data.audit.auditRetentionDays} days`],
            ["Unsaved changes", dirty ? "Yes" : "No"]
          ].map(([label, value]) => (
            <div className="ss-summary" key={label}>
              <span>{label}</span>
              <b>{value}</b>
            </div>
          ))}
        </section>
      </div>

      <section className="ss-card">
        <h3>Settings sections</h3>
        <p className="ss-sub">
          Choose a section to edit its configuration.
        </p>

        <div className="ss-shortcuts">
          {TABS.filter((item) => item[0] !== "overview").map(
            ([id, label, Icon]) => (
              <button key={id} onClick={() => setTab(id)}>
                <Icon />
                <b>{label}</b>
                <ChevronRight />
              </button>
            )
          )}
        </div>
      </section>
    </>
  );

  const section = () => {
    switch (tab) {
      case "general":
        return (
          <>
            <Heading
              icon={SlidersHorizontal}
              eyebrow="PLATFORM CONFIGURATION"
              title="General settings"
              description="Manage platform identity, regional preferences, and display formats."
            />

            <section className="ss-card">
              <div className="ss-fields">
                <Field
                  label="Platform name"
                  value={data.general.platformName}
                  onChange={(v) => update("general", "platformName", v)}
                />

                <Field
                  label="Country"
                  value={data.general.country}
                  options={[
                    "United Kingdom",
                    "India",
                    "United States",
                    "Ireland",
                    "Australia"
                  ]}
                  onChange={(v) => update("general", "country", v)}
                />

                <Field
                  label="Description"
                  value={data.general.description}
                  onChange={(v) => update("general", "description", v)}
                />

                <Field
                  label="Default language"
                  value={data.general.language}
                  options={["English", "French", "German", "Spanish"]}
                  onChange={(v) => update("general", "language", v)}
                />

                <Field
                  label="Time zone"
                  value={data.general.timeZone}
                  options={[
                    "Europe/London",
                    "Asia/Kolkata",
                    "Europe/Dublin",
                    "America/New_York",
                    "UTC"
                  ]}
                  onChange={(v) => update("general", "timeZone", v)}
                />

                <Field
                  label="Currency"
                  value={data.general.currency}
                  options={["GBP (£)", "EUR (€)", "USD ($)", "INR (₹)"]}
                  onChange={(v) => update("general", "currency", v)}
                />

                <Field
                  label="Date format"
                  value={data.general.dateFormat}
                  options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]}
                  onChange={(v) => update("general", "dateFormat", v)}
                />

                <Field
                  label="Time format"
                  value={data.general.timeFormat}
                  options={["24-hour", "12-hour"]}
                  onChange={(v) => update("general", "timeFormat", v)}
                />
              </div>

              <p className="ss-help">
                Logo upload needs an asset-storage workflow or backend endpoint.
              </p>
            </section>
          </>
        );

      case "notifications":
        return (
          <>
            <Heading
              icon={Bell}
              eyebrow="COMMUNICATION"
              title="Notification settings"
              description="Choose which platform events should generate notifications."
            />

            <section className="ss-card">
              <h3>Delivery channels</h3>

              <Toggle
                label="Email notifications"
                checked={data.notifications.emailEnabled}
                onChange={(v) =>
                  update("notifications", "emailEnabled", v)
                }
              />

              <Toggle
                label="SMS notifications"
                checked={data.notifications.smsEnabled}
                onChange={(v) =>
                  update("notifications", "smsEnabled", v)
                }
              />
            </section>

            <section className="ss-card">
              <h3>Event alerts</h3>

              {[
                [
                  "newCompany",
                  "New company created",
                  "Alert when a client company is added."
                ],
                [
                  "suspendedTenant",
                  "Suspended tenant alerts",
                  "Alert when a tenant is suspended."
                ],
                [
                  "subscriptionExpiry",
                  "Subscription expiry reminders",
                  "Remind administrators before expiry."
                ],
                [
                  "systemErrors",
                  "System error alerts",
                  "Alert on platform errors."
                ],
                [
                  "securityAlerts",
                  "Security alerts",
                  "Alert on important security events."
                ],
                [
                  "maintenanceNotices",
                  "Maintenance notifications",
                  "Notify users about planned maintenance."
                ]
              ].map(([key, label, description]) => (
                <Toggle
                  key={key}
                  label={label}
                  description={description}
                  checked={data.notifications[key]}
                  onChange={(v) =>
                    update("notifications", key, v)
                  }
                />
              ))}
            </section>
          </>
        );

      case "security":
        return (
          <>
            <Heading
              icon={ShieldCheck}
              eyebrow="ACCOUNT PROTECTION"
              title="Security settings"
              description="Set authentication rules; production enforcement must be implemented by your backend."
            />

            <section className="ss-card">
              <div className="ss-fields">
                <Field
                  label="Password policy"
                  value={data.security.passwordPolicy}
                  options={["Standard", "Strong", "Very strong"]}
                  onChange={(v) =>
                    update("security", "passwordPolicy", v)
                  }
                />

                <Field
                  label="Minimum password length"
                  type="number"
                  min={8}
                  max={64}
                  value={data.security.minPasswordLength}
                  onChange={(v) =>
                    update("security", "minPasswordLength", v)
                  }
                  help="Allowed range: 8–64 characters."
                />

                <Field
                  label="Session timeout (minutes)"
                  type="number"
                  min={5}
                  max={1440}
                  value={data.security.sessionTimeout}
                  onChange={(v) =>
                    update("security", "sessionTimeout", v)
                  }
                />

                <Field
                  label="Maximum login attempts"
                  type="number"
                  min={1}
                  max={20}
                  value={data.security.maxLoginAttempts}
                  onChange={(v) =>
                    update("security", "maxLoginAttempts", v)
                  }
                />

                <Field
                  label="Account lockout (minutes)"
                  type="number"
                  min={1}
                  max={1440}
                  value={data.security.lockoutMinutes}
                  onChange={(v) =>
                    update("security", "lockoutMinutes", v)
                  }
                />

                <Field
                  label="Allowed login method"
                  value={data.security.loginMethod}
                  options={[
                    "Password",
                    "Password and 2FA",
                    "Single sign-on (SSO)"
                  ]}
                  onChange={(v) =>
                    update("security", "loginMethod", v)
                  }
                />
              </div>

              <Toggle
                label="Two-factor authentication (2FA)"
                description="Require a second verification step where supported."
                checked={data.security.twoFactor}
                onChange={(v) => update("security", "twoFactor", v)}
              />

              <Toggle
                label="Automatic logout"
                checked={data.security.automaticLogout}
                onChange={(v) =>
                  update("security", "automaticLogout", v)
                }
              />

              <Notice icon={LockKeyhole}>
                These values do not enforce authentication policies until connected to backend authentication.
              </Notice>
            </section>
          </>
        );

      case "access":
        return (
          <>
            <Heading
              icon={Users}
              eyebrow="ADMIN GOVERNANCE"
              title="Access control"
              description="Set default access rules and safeguards for sensitive actions."
            />

            <section className="ss-card">
              <div className="ss-fields">
                <Field
                  label="Default role for new users"
                  value={data.access.defaultRole}
                  options={["Read-only", "Support", "Administrator"]}
                  onChange={(v) => update("access", "defaultRole", v)}
                />

                <Field
                  label="Administrator access rule"
                  value={data.access.adminRule}
                  options={[
                    "Authorized platform administrators only",
                    "All authenticated staff",
                    "Restricted by approved IP"
                  ]}
                  onChange={(v) => update("access", "adminRule", v)}
                />

                <Field
                  label="Session/device policy"
                  value={data.access.sessionPolicy}
                  options={[
                    "One active session per user",
                    "Multiple trusted sessions",
                    "One session per device"
                  ]}
                  onChange={(v) =>
                    update("access", "sessionPolicy", v)
                  }
                />
              </div>

              <Toggle
                label="Restrict sensitive actions"
                checked={data.access.restrictSensitiveActions}
                onChange={(v) =>
                  update("access", "restrictSensitiveActions", v)
                }
              />

              <Toggle
                label="Require re-authentication for sensitive actions"
                checked={data.access.requireReauthentication}
                onChange={(v) =>
                  update("access", "requireReauthentication", v)
                }
              />

              <Toggle
                label="Allow remembered devices"
                checked={data.access.rememberedDevices}
                onChange={(v) =>
                  update("access", "rememberedDevices", v)
                }
              />

              <Notice icon={Users}>
                Use Roles & Permissions and Platform Users for detailed role and user management.
              </Notice>
            </section>
          </>
        );

      case "backup":
        return (
          <>
            <Heading
              icon={Database}
              eyebrow="DATA PROTECTION"
              title="Backup & data retention"
              description="Configure backup preferences and data retention policies."
            />

            <section className="ss-card">
              <div className="ss-card-title">
                <div>
                  <h3>Backup policy</h3>
                  <p className="ss-sub">
                    Status: {data.backup.backupStatus}
                  </p>
                </div>
                <Database />
              </div>

              <Toggle
                label="Automatic backups"
                checked={data.backup.automaticBackup}
                onChange={(v) =>
                  update("backup", "automaticBackup", v)
                }
              />

              <div className="ss-fields">
                <Field
                  label="Backup frequency"
                  value={data.backup.frequency}
                  options={["Hourly", "Daily", "Weekly", "Monthly"]}
                  onChange={(v) => update("backup", "frequency", v)}
                />

                <Field
                  label="Backup time"
                  type="time"
                  value={data.backup.backupTime}
                  onChange={(v) => update("backup", "backupTime", v)}
                />

                <Field
                  label="Backup retention (days)"
                  type="number"
                  min={1}
                  max={3650}
                  value={data.backup.retentionDays}
                  onChange={(v) => update("backup", "retentionDays", v)}
                />

                <Field
                  label="Data retention (days)"
                  type="number"
                  min={1}
                  max={36500}
                  value={data.backup.dataRetentionDays}
                  onChange={(v) =>
                    update("backup", "dataRetentionDays", v)
                  }
                />
              </div>

              <div className="ss-backup-meta">
                <span>
                  <Clock3 /> Last backup: {data.backup.lastBackup}
                </span>
                <b>{data.backup.backupStatus}</b>
              </div>

              <div className="ss-actions">
                <button
                  className="ss-btn secondary"
                  onClick={() => {
                    update(
                      "backup",
                      "lastBackup",
                      new Date().toLocaleString()
                    );
                    update("backup", "backupStatus", "Demo completed");
                    say(
                      "Demo backup recorded; no real backup was created.",
                      "info"
                    );
                  }}
                >
                  <Download /> Run demo backup
                </button>

                <button
                  className="ss-btn danger"
                  onClick={() =>
                    setDialog({
                      title: "Restore a backup?",
                      body: "This demo cannot restore real data. Connect a secure backend restore workflow before production use.",
                      action: "restore"
                    })
                  }
                >
                  <RefreshCw /> Restore backup
                </button>
              </div>

              <Notice icon={CircleHelp}>
                Real backups need protected server-side storage, access controls, and audit logging.
              </Notice>
            </section>
          </>
        );

      case "integrations":
        return (
          <>
            <Heading
              icon={Plug}
              eyebrow="CONNECTED SERVICES"
              title="Integration settings"
              description="Review providers and run a frontend demo connection check."
            />

            <section className="ss-card">
              <div className="ss-fields">
                <Field
                  label="Email provider"
                  value={data.integrations.emailProvider}
                  options={[
                    "Configured provider",
                    "SMTP",
                    "Microsoft 365",
                    "SendGrid",
                    "Not configured"
                  ]}
                  onChange={(v) =>
                    update("integrations", "emailProvider", v)
                  }
                />

                <Field
                  label="SMS provider"
                  value={data.integrations.smsProvider}
                  options={[
                    "Configured provider",
                    "Twilio",
                    "Other provider",
                    "Not configured"
                  ]}
                  onChange={(v) =>
                    update("integrations", "smsProvider", v)
                  }
                />

                <Field
                  label="API status"
                  value={data.integrations.apiStatus}
                  options={[
                    "Demo mode",
                    "Connected",
                    "Disconnected",
                    "Needs configuration"
                  ]}
                  onChange={(v) =>
                    update("integrations", "apiStatus", v)
                  }
                />

                <Field
                  label="Connection test result"
                  value={data.integrations.connectionTest}
                  onChange={(v) =>
                    update("integrations", "connectionTest", v)
                  }
                />
              </div>

              <Toggle
                label="Enable external integrations"
                checked={data.integrations.externalIntegrations}
                onChange={(v) =>
                  update("integrations", "externalIntegrations", v)
                }
              />

              <p className="ss-sub">
                {data.integrations.integrationErrors}
              </p>

              <button
                className="ss-btn secondary"
                onClick={() => {
                  update(
                    "integrations",
                    "connectionTest",
                    "Demo check completed"
                  );
                  say(
                    "Demo check completed; no external service was contacted.",
                    "info"
                  );
                }}
              >
                <Plug /> Test connection
              </button>

              <Notice icon={Bell}>
                Never store provider credentials or API secrets in frontend code or localStorage.
              </Notice>
            </section>
          </>
        );

      case "system":
        return (
          <>
            <Heading
              icon={Monitor}
              eyebrow="PLATFORM OPERATIONS"
              title="System & maintenance"
              description="Manage maintenance preferences and review environment information."
            />

            <section className="ss-card">
              <div className="ss-card-title">
                <div>
                  <h3>Maintenance mode</h3>
                  <p className="ss-sub">
                    Shared with the Overview quick control.
                  </p>
                </div>
                <Monitor />
              </div>

              <Toggle
                label="Enable maintenance mode"
                checked={data.system.maintenanceMode}
                onChange={() =>
                  setDialog({
                    title: `${
                      data.system.maintenanceMode ? "Disable" : "Enable"
                    } maintenance mode?`,
                    body: "Confirm the shared demo setting. A production backend must enforce maintenance mode for all users.",
                    action: "maintenance"
                  })
                }
              />

              <Field
                label="Maintenance message"
                type="textarea"
                value={data.system.maintenanceMessage}
                onChange={(v) =>
                  update("system", "maintenanceMessage", v)
                }
              />

              <Toggle
                label="Notify users about maintenance"
                checked={data.system.notifyMaintenance}
                onChange={(v) =>
                  update("system", "notifyMaintenance", v)
                }
              />
            </section>

            <section className="ss-card">
              <h3>System information</h3>

              <div className="ss-fields">
                <Field
                  label="Application version"
                  value={data.system.version}
                  onChange={(v) => update("system", "version", v)}
                />

                <Field
                  label="Environment"
                  value={data.system.environment}
                  options={["Development", "Staging", "Production"]}
                  onChange={(v) => update("system", "environment", v)}
                />

                <Field
                  label="System health"
                  value={data.system.systemHealth}
                  options={[
                    "Healthy",
                    "Degraded",
                    "Maintenance",
                    "Unavailable"
                  ]}
                  onChange={(v) =>
                    update("system", "systemHealth", v)
                  }
                />
              </div>

              <p className="ss-health">
                <i /> System status: <b>{data.system.systemHealth}</b>
              </p>
            </section>
          </>
        );

      case "display":
        return (
          <>
            <Heading
              icon={Monitor}
              eyebrow="WORKSPACE APPEARANCE"
              title="Display settings"
              description="Personalize the appearance, colour, and layout of your MEGSI workspace."
            />

            <section className="ss-card">
              <div className="ss-card-title">
                <div><h3>Appearance</h3><p className="ss-sub">Choose your preferred workspace theme.</p></div>
                <Monitor />
              </div>
              <div className="ss-theme-options">
                {[ ["light", "Light"], ["dark", "Dark"], ["custom", "Custom colour"] ].map(([value, label]) => (
                  <button key={value} className={`ss-theme-choice ${data.display.mode === value ? "selected" : ""}`} onClick={() => update("display", "mode", value)}>
                    <span className={`ss-theme-swatch ${value}`}><i /><i /><i /></span>
                    <b>{label}</b>
                    {data.display.mode === value && <Check />}
                  </button>
                ))}
              </div>
              {data.display.mode === "custom" && (
                <div className="ss-fields ss-display-custom">
                  <Field label="Custom accent colour" type="text" value={data.display.accent} onChange={(v) => update("display", "accent", v)} help="Enter a valid CSS hex colour, for example #2563eb." />
                  <label className="ss-field"><span>Choose colour</span><input type="color" value={/^#[0-9a-fA-F]{6}$/.test(data.display.accent) ? data.display.accent : "#2563eb"} onChange={(e) => update("display", "accent", e.target.value)} /></label>
                </div>
              )}
            </section>

            <section className="ss-card">
              <div className="ss-card-title"><div><h3>Brightness & colour</h3><p className="ss-sub">Adjust the application preview.</p></div><SlidersHorizontal /></div>
              <div className="ss-display-slider"><label htmlFor="ss-brightness">Brightness</label><input id="ss-brightness" type="range" min="50" max="125" step="5" value={data.display.brightness} onChange={(e) => update("display", "brightness", Number(e.target.value))} /><b>{data.display.brightness}%</b></div>
              <Toggle label="Night light" description="Use warmer colours in the workspace preview." checked={data.display.nightLight} onChange={(v) => update("display", "nightLight", v)} />
              <div className="ss-fields">
                <Field label="Colour profile" value={data.display.colorProfile} options={["Standard", "Natural", "Vivid"]} onChange={(v) => update("display", "colorProfile", v)} />
              </div>
              <Toggle label="HDR preview" description="Toggle the HDR preference for this demo interface." checked={data.display.hdr} onChange={(v) => update("display", "hdr", v)} />
              {data.display.nightLight && <Notice icon={Sun}>Night light preview is enabled. This does not change your physical display.</Notice>}
            </section>

            <section className="ss-card">
              <div className="ss-card-title"><div><h3>Scale & layout</h3><p className="ss-sub">Choose workspace display preferences.</p></div><Monitor /></div>
              <div className="ss-fields">
                <Field label="Scale" value={data.display.scale} options={["100%", "125%", "150%", "175%"]} onChange={(v) => update("display", "scale", v)} />
                <Field label="Display resolution" value={data.display.resolution} options={["1920 × 1080 (Recommended)", "1600 × 900", "1366 × 768", "2560 × 1440"]} onChange={(v) => update("display", "resolution", v)} />
                <Field label="Display orientation" value={data.display.orientation} options={["Landscape", "Portrait", "Landscape (flipped)", "Portrait (flipped)"]} onChange={(v) => update("display", "orientation", v)} />
                <Field label="Multiple displays" value={data.display.multipleDisplays} options={["Show only on 1", "Duplicate these displays", "Extend these displays", "Show only on 2"]} onChange={(v) => update("display", "multipleDisplays", v)} />
              </div>
              <div className={`ss-display-preview ${data.display.mode === "dark" ? "dark" : ""}`} style={{"--ss-display-accent": data.display.mode === "custom" ? data.display.accent : "#315fce", filter: `brightness(${data.display.brightness / 100})`}}>
                <div className="ss-display-preview-bar"><span /><span /><span /> <b>MEGSI Workspace Preview</b></div>
                <div className="ss-display-preview-content"><strong>System status</strong><span className="ss-preview-healthy">Healthy</span><div /><div /><div /></div>
                {data.display.nightLight && <span className="ss-night-overlay" />}
              </div>
              <Notice icon={CircleHelp}>These settings are saved as MEGSI preferences in this browser. Brightness, HDR, physical resolution, orientation, and connected-monitor modes are controlled by Windows.</Notice>
            </section>
          </>
        );

      case "audit":
        return (
          <>
            <Heading
              icon={FileText}
              eyebrow="GOVERNANCE"
              title="Audit & compliance"
              description="Configure audit defaults and privacy controls for platform operations."
            />

            <section className="ss-card">
              <div className="ss-fields">
                <Field
                  label="Audit log retention (days)"
                  type="number"
                  min={1}
                  max={36500}
                  value={data.audit.auditRetentionDays}
                  onChange={(v) =>
                    update("audit", "auditRetentionDays", v)
                  }
                />

                <Field
                  label="Privacy mode"
                  value={data.audit.privacyMode}
                  options={["Standard", "Enhanced", "Strict"]}
                  onChange={(v) => update("audit", "privacyMode", v)}
                />

                <Field
                  label="Compliance framework"
                  value={data.audit.complianceFramework}
                  options={[
                    "UK GDPR",
                    "GDPR",
                    "Internal policy",
                    "Not specified"
                  ]}
                  onChange={(v) =>
                    update("audit", "complianceFramework", v)
                  }
                />
              </div>

              <Toggle
                label="Track administrator actions"
                checked={data.audit.trackAdminActions}
                onChange={(v) =>
                  update("audit", "trackAdminActions", v)
                }
              />

              <Toggle
                label="Log security events"
                description="Also shown in Overview quick controls."
                checked={data.audit.logSecurityEvents}
                onChange={(v) =>
                  update("audit", "logSecurityEvents", v)
                }
              />

              <Toggle
                label="Redact sensitive data"
                checked={data.audit.redactSensitiveData}
                onChange={(v) =>
                  update("audit", "redactSensitiveData", v)
                }
              />

              <Notice icon={ShieldCheck}>
                These options do not certify compliance; real logging and privacy controls must be implemented.
              </Notice>
            </section>
          </>
        );

      default:
        return overview();
    }
  };

  return (
    <div className="ss ss-page">
      <div className="ss-title-row">
        <div>
          <h1>System Settings</h1>
          <p>
            Configure and monitor your MEGSI platform from one place.
          </p>
        </div>

        <div className="ss-head-actions">
          {savedAt && (
            <span className="ss-saved-at">
              <Check /> Last saved {savedAt}
            </span>
          )}

          <span className={`ss-status ${dirty ? "dirty" : ""}`}>
            <i />
            {dirty ? "Unsaved changes" : "All changes saved"}
          </span>

          <button
            className="ss-help-button"
            title="Help"
            onClick={() =>
              say("Demo settings are saved in this browser.", "info")
            }
          >
            <CircleHelp />
          </button>
        </div>
      </div>

      <div className="ss-layout">
        <aside className="ss-nav">
          <small>SETTINGS</small>

          {TABS.map(([id, label, Icon]) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => {
                if (dirty && tab !== id) {
                  setDialog({
                    title: "You have unsaved changes",
                    body: "Save your changes before switching sections, or discard them and continue.",
                    action: "navigate",
                    target: id
                  });
                } else {
                  setTab(id);
                }
              }}
            >
              <Icon />
              <span>{label}</span>
              {tab === id && <ChevronRight className="nav-arrow" />}
            </button>
          ))}

          <div className="ss-nav-note">
            <ShieldCheck />
            <div>
              <b>Platform controls</b>
              <p>Some changes require backend support.</p>
            </div>
          </div>
        </aside>

        <main className="ss-main">
          {error && (
            <div className="ss-error">
              <AlertTriangle />
              {error}
            </div>
          )}

          {section()}

          <footer className="ss-footer">
            <span>
              {dirty
                ? "You have changes that haven't been saved."
                : "Your settings are up to date."}
            </span>

            <div className="ss-actions">
              <button className="ss-btn ghost" onClick={cancel}>
                <X /> Cancel
              </button>

              <button className="ss-btn secondary" onClick={reset}>
                <RotateCcw /> Reset
              </button>

              <button className="ss-btn primary" onClick={save}>
                <Save /> Save Changes
              </button>
            </div>
          </footer>
        </main>
      </div>

      {notice && (
        <div className="ss-toast" role="status">
          <Check />
          <span>{notice}</span>
          <button onClick={() => setNotice("")}>
            <X />
          </button>
        </div>
      )}

      {dialog && (
        <div
          className="ss-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDialog(null);
            }
          }}
        >
          <div className="ss-dialog" role="dialog" aria-modal="true">
            <button
              className="ss-dialog-close"
              onClick={() => setDialog(null)}
            >
              <X />
            </button>

            <span className="ss-dialog-icon">
              <AlertTriangle />
            </span>

            <h3>{dialog.title}</h3>
            <p>{dialog.body}</p>

            <div className="ss-actions">
              {dialog.action === "navigate" ? (
                <>
                  <button
                    className="ss-btn ghost"
                    onClick={() => setDialog(null)}
                  >
                    Stay here
                  </button>

                  <button
                    className="ss-btn danger"
                    onClick={() => {
                      setData(clone(saved));
                      setTab(dialog.target);
                      setDialog(null);
                    }}
                  >
                    Discard & continue
                  </button>

                  <button
                    className="ss-btn primary"
                    onClick={() => {
                      const target = dialog.target;
                      setDialog(null);
                      save();
                      setTab(target);
                    }}
                  >
                    Save & continue
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="ss-btn ghost"
                    onClick={() => setDialog(null)}
                  >
                    Cancel
                  </button>

                  <button
                    className="ss-btn primary"
                    onClick={confirm}
                  >
                    Confirm
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}