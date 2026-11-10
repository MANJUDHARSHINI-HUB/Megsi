import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, Check, ChevronRight, Clock, Layers, Pencil, Shield, ShieldCheck, Trash2, UserPlus, Users, Info,
} from 'lucide-react';
import { Avatar } from '../components/Common.jsx';
import './role-details.css';

/* =====================================================================
   Role Details – full page (replaces the old right-side drawer).
   It is rendered by RolesPermissions.jsx, so it shares the same sidebar,
   header, role data, Edit Role form and Delete Role confirmation.
   Nothing here changes data: it only reads what the roles page passes in.
   ===================================================================== */

const TABS = [
  { id: 'overview', label: 'Overview', Icon: Info },
  { id: 'permissions', label: 'Permissions', Icon: ShieldCheck },
  { id: 'users', label: 'Users', Icon: Users },
  { id: 'activity', label: 'Activity Log', Icon: Clock },
];
const PAGE_SIZE = 10; // assigned users revealed per infinite-scroll step

const StatusBadge = ({ v }) => (
  <span className={`rd-status ${v === 'Active' ? 'on' : 'off'}`}><i />{v}</span>
);

/* ---------------- Tab 1: Overview ---------------- */
function OverviewTab({ role, modules, actions, total, granted, roleType, created, updated }) {
  const modulesOn = modules.filter((m) => (role.permissions[m.id] || []).length > 0).length;
  const cards = [
    { label: 'Total permissions', value: `${granted}`, sub: `of ${total} available`, Icon: ShieldCheck, tone: 'blue' },
    { label: 'Users assigned', value: `${role.users}`, sub: 'counted on this role', Icon: Users, tone: 'green' },
    { label: 'Modules accessible', value: `${modulesOn}`, sub: `of ${modules.length} modules`, Icon: Layers, tone: 'orange' },
    { label: 'Role status', value: role.status, sub: role.status === 'Active' ? 'Can be assigned' : 'Not in use', Icon: Shield, tone: role.status === 'Active' ? 'green' : 'grey', small: true },
  ];
  return (
    <>
      <div className="rd-kpis">
        {cards.map((c) => (
          <div className="card rd-kpi" key={c.label}>
            <span className={`rd-kpi-ic ${c.tone}`}><c.Icon size={24} /></span>
            <span className="rd-kpi-t">
              <small>{c.label}</small>
              <b className={c.small ? 'txt' : ''}>{c.value}</b>
              <em>{c.sub}</em>
            </span>
          </div>
        ))}
      </div>

      <div className="rd-two">
        <section className="card rd-card">
          <header className="rd-card-h"><span className="rd-ic"><Info size={16} /></span><h3>Role Information</h3></header>
          <dl className="rd-dl">
            <div><dt>Role name</dt><dd>{role.name}</dd></div>
            <div><dt>Description</dt><dd>{role.description}</dd></div>
            <div><dt>Role type</dt><dd>{roleType}</dd></div>
            <div><dt>Status</dt><dd><StatusBadge v={role.status} /></dd></div>
            {created && <div><dt>Created</dt><dd>{created.when}</dd></div>}
            {created && <div><dt>Created by</dt><dd>{created.by}</dd></div>}
            {updated && <div><dt>Last updated</dt><dd>{updated}</dd></div>}
          </dl>
          {!created && !updated && (
            <p className="rd-note">Created and last-updated dates are not stored for this role, so they are not shown.</p>
          )}
        </section>

        <section className="card rd-card">
          <header className="rd-card-h"><span className="rd-ic"><ShieldCheck size={16} /></span><h3>Permission Summary</h3></header>
          <ul className="rd-sum">
            {actions.map(([key, label]) => {
              const n = modules.filter((m) => (role.permissions[m.id] || []).includes(key)).length;
              return (
                <li key={key}>
                  <span className="rd-sum-l">{label}</span>
                  <span className="rd-bar"><i style={{ width: `${modules.length ? (n / modules.length) * 100 : 0}%` }} /></span>
                  <span className="rd-sum-v">{n} of {modules.length} modules</span>
                </li>
              );
            })}
          </ul>
          <p className="rd-note">Open the Permissions tab for the full module-by-module matrix.</p>
        </section>
      </div>
    </>
  );
}

/* ---------------- Tab 2: Permissions ---------------- */
function PermissionsTab({ role, modules, actions, total, granted }) {
  return (
    <section className="card rd-card">
      <header className="rd-card-h">
        <span className="rd-ic"><ShieldCheck size={16} /></span><h3>Permission Matrix</h3>
        <div className="grow" />
        <span className="rd-pill">{granted} of {total} granted</span>
      </header>
      <div className="rd-tablewrap">
        <table className="rd-tbl rd-matrix">
          <thead>
            <tr><th>Module</th>{actions.map(([k, l]) => <th key={k} className="c">{l}</th>)}<th className="c">Total</th></tr>
          </thead>
          <tbody>
            {modules.map((m) => {
              const a = role.permissions[m.id] || [];
              return (
                <tr key={m.id}>
                  <td><span className="rd-mod"><m.Icon size={16} />{m.name}</span></td>
                  {actions.map(([k, l]) => {
                    const on = a.includes(k);
                    return (
                      <td key={k} className="c">
                        <span className={`rd-cell ${on ? 'on' : ''}`} role="img" aria-label={`${l} ${on ? 'allowed' : 'not allowed'} for ${m.name}`}>
                          {on ? <Check size={13} strokeWidth={3} /> : null}
                        </span>
                      </td>
                    );
                  })}
                  <td className="c"><b>{a.length}</b> / {actions.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="rd-legend">
        <span><i className="on"><Check size={10} strokeWidth={3} /></i>Allowed</span>
        <span><i />Not allowed</span>
        <span className="rd-legend-note">Read-only. Use Edit Role to change permissions.</span>
      </div>
    </section>
  );
}

/* ---------------- Tab 3: Users (infinite scroll) ---------------- */
function UsersTab({ role, users, fmt, onAssign }) {
  const [shown, setShown] = useState(PAGE_SIZE);
  const sentinel = useRef(null);
  const hasMore = shown < users.length;

  // Reset when another role is opened
  useEffect(() => { setShown(PAGE_SIZE); }, [role.id]);

  // Reveal the next batch when the sentinel under the table scrolls into view.
  // A fresh observer is created after every batch, so if the list is still short
  // enough that the sentinel is visible, the next batch loads straight away.
  useEffect(() => {
    if (!hasMore || !sentinel.current) return undefined;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setShown((n) => Math.min(n + PAGE_SIZE, users.length));
    }, { rootMargin: '200px 0px' });
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [hasMore, shown, users.length]);

  const rows = users.slice(0, shown);
  return (
    <section className="card rd-card">
      <header className="rd-card-h">
        <span className="rd-ic"><Users size={16} /></span><h3>Assigned Users</h3>
        <div className="grow" />
        <span className="rd-pill">Showing {rows.length} of {users.length}</span>
        <button className="rd-btn" onClick={() => onAssign(role)}><UserPlus size={15} />Assign User</button>
      </header>

      {role.users !== users.length && (
        <p className="rd-banner">
          This role shows <b>{role.users}</b> {role.users === 1 ? 'user' : 'users'} in its summary count, but the project stores
          {' '}<b>{users.length}</b> individual assignment {users.length === 1 ? 'record' : 'records'} for it. Only stored records are listed below.
        </p>
      )}

      {users.length === 0 ? (
        <div className="rd-empty"><Users size={28} /><b>No users assigned</b><span>Use Assign User to add the first user to this role.</span></div>
      ) : (
        <>
          <div className="rd-tablewrap">
            <table className="rd-tbl rd-users">
              <thead><tr><th className="n">#</th><th>User name</th><th>Company</th><th>Assigned on</th></tr></thead>
              <tbody>
                {rows.map((u, i) => (
                  <tr key={u.id}>
                    <td className="n">{i + 1}</td>
                    <td><span className="rd-name"><Avatar name={u.user} />{u.user}</span></td>
                    <td>{u.company}</td>
                    <td>{fmt(u.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <div className="rd-loading" ref={sentinel} role="status"><span className="rd-spin" />Loading more users…</div>
          )}
          {!hasMore && users.length > PAGE_SIZE && <p className="rd-end">All {users.length} users loaded.</p>}
        </>
      )}
    </section>
  );
}

/* ---------------- Tab 4: Activity Log ---------------- */
function ActivityTab({ role, items, fmt }) {
  return (
    <section className="card rd-card">
      <header className="rd-card-h">
        <span className="rd-ic"><Clock size={16} /></span><h3>Activity Log</h3>
        <div className="grow" /><span className="rd-pill">{items.length} {items.length === 1 ? 'entry' : 'entries'}</span>
      </header>
      {items.length === 0 ? (
        <div className="rd-empty">
          <Clock size={28} /><b>No activity recorded for this role yet</b>
          <span>Edits, status changes and user assignments made from now on will appear here, newest first.</span>
        </div>
      ) : (
        <ol className="rd-timeline">
          {items.map((a) => (
            <li key={a.id}>
              <i />
              <div className="rd-tl-main">
                <b>{a.action}</b>
                <span>{a.action} on {role.name}</span>
                <small>Performed by {a.user}</small>
              </div>
              <div className="rd-tl-side"><span className="rd-pill">{a.action}</span><time>{fmt(a.at)}</time></div>
            </li>
          ))}
        </ol>
      )}
      <p className="rd-note rd-note-pad">Only changes made after role-level tracking was added are listed. Older entries on the main page are not linked to a role.</p>
    </section>
  );
}

/* ---------------- Page ---------------- */
export default function RoleDetails({
  role, modules, actions, systemIds, assignments, activity, fmt, onBack, onEdit, onDelete, onAssign,
}) {
  const [tab, setTab] = useState('overview');
  const total = modules.length * actions.length;
  const granted = Object.values(role.permissions).reduce((n, a) => n + a.length, 0);
  const isSystem = systemIds.includes(role.id);
  const roleType = isSystem ? 'System (built-in)' : 'Custom';

  useEffect(() => { setTab('overview'); window.scrollTo(0, 0); }, [role.id]);

  const users = useMemo(
    () => assignments.filter((a) => a.role === role.name).sort((a, b) => b.at.localeCompare(a.at)),
    [assignments, role.name],
  );
  const items = useMemo(
    () => activity.filter((a) => a.roleId === role.id).sort((a, b) => b.at.localeCompare(a.at)),
    [activity, role.id],
  );
  const createdEntry = items.find((a) => a.action === 'Role created');
  const created = createdEntry ? { when: fmt(createdEntry.at), by: createdEntry.user } : null;
  const updatedEntry = items.find((a) => a.action !== 'Role created');
  const updated = updatedEntry ? fmt(updatedEntry.at) : null;

  const onTabKey = (e) => {
    const i = TABS.findIndex((t) => t.id === tab);
    if (e.key === 'ArrowRight') setTab(TABS[(i + 1) % TABS.length].id);
    if (e.key === 'ArrowLeft') setTab(TABS[(i + TABS.length - 1) % TABS.length].id);
  };

  return (
    <div className="rd">
      <nav className="rd-crumb" aria-label="Breadcrumb">
        <button onClick={onBack}>Roles &amp; Permissions</button><ChevronRight size={14} /><span>Role Details</span>
      </nav>

      <div className="title-row rd-title">
        <div>
          <h1><ShieldCheck size={30} />Role Details</h1>
          <p>View and manage details for this role</p>
        </div>
        <button className="rd-btn big" onClick={onBack}><ArrowLeft size={16} />Back to Roles</button>
      </div>

      <section className="card rd-hero">
        <span className="rd-hero-ic"><Users size={34} /></span>
        <div className="rd-hero-t">
          <div className="rd-hero-name"><h2>{role.name}</h2><StatusBadge v={role.status} /><span className="rd-pill">{roleType}</span></div>
          <p>{role.description}</p>
        </div>
        <div className="rd-hero-a">
          <button className="rd-btn big" onClick={() => onEdit(role)}><Pencil size={15} />Edit Role</button>
          <button className="rd-btn big danger" disabled={isSystem} title={isSystem ? 'Built-in roles cannot be deleted' : ''} onClick={() => onDelete(role)}><Trash2 size={15} />Delete Role</button>
        </div>
      </section>

      <div className="rd-tabs" role="tablist" aria-label="Role details sections" onKeyDown={onTabKey}>
        {TABS.map((t) => (
          <button key={t.id} role="tab" id={`rd-tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`rd-panel-${t.id}`} tabIndex={tab === t.id ? 0 : -1}
            className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}><t.Icon size={17} />{t.label}</button>
        ))}
      </div>

      <div className="rd-panel" role="tabpanel" id={`rd-panel-${tab}`} aria-labelledby={`rd-tab-${tab}`}>
        {tab === 'overview' && <OverviewTab role={role} modules={modules} actions={actions} total={total} granted={granted} roleType={roleType} created={created} updated={updated} />}
        {tab === 'permissions' && <PermissionsTab role={role} modules={modules} actions={actions} total={total} granted={granted} />}
        {tab === 'users' && <UsersTab role={role} users={users} fmt={fmt} onAssign={onAssign} />}
        {tab === 'activity' && <ActivityTab role={role} items={items} fmt={fmt} />}
      </div>
    </div>
  );
}
