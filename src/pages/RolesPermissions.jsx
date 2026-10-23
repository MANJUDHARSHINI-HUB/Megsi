import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import {
  BarChart3, Building2, Check, ChevronDown, Copy, CreditCard, Eye, FileText, KeyRound, Lock, MoreHorizontal, Pencil, Plus,
  Power, Settings, Shield, ShieldCheck, Trash2, UserPlus, Users, X,
} from 'lucide-react';
import DateRangeMenu from '../components/DateRangeMenu.jsx';
import { Avatar } from '../components/Common.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import './roles-permissions.css';

/* =====================================================================
   Demo data (frontend only - nothing here is enforced by a server)
   ===================================================================== */
const MODULES = [
  { id: 'users', name: 'User Management', Icon: Users },
  { id: 'companies', name: 'Company Management', Icon: Building2 },
  { id: 'billing', name: 'Billing & Subscription', Icon: CreditCard },
  { id: 'guards', name: 'Guard Management', Icon: Shield },
  { id: 'access', name: 'Access Control', Icon: KeyRound },
  { id: 'reports', name: 'Reports & Analytics', Icon: BarChart3 },
  { id: 'settings', name: 'System Settings', Icon: Settings },
  { id: 'audit', name: 'Audit Logs', Icon: FileText },
];
const ACTIONS = [['view', 'View'], ['create', 'Create'], ['edit', 'Edit'], ['delete', 'Delete'], ['approve', 'Approve'], ['manage', 'Manage']];
const TOTAL_PERMISSIONS = MODULES.length * ACTIONS.length; // 8 modules x 6 actions = 48
const PALETTE = ['#0758F9', '#079447', '#F59E0B', '#7909E8', '#E91E8C', '#5B6B8C', '#6A8DFF', '#101B4D', '#E8172D', '#0EA5A4'];
const ALL = Object.fromEntries(MODULES.map((m) => [m.id, ACTIONS.map(([a]) => a)]));
const perms = (spec) => Object.fromEntries(Object.entries(spec).map(([k, v]) => [k, v.split(',')]));

const SEED_ROLES = [
  { id: 'super', name: 'Super Admin', description: 'Full platform access with all permissions', users: 6, status: 'Active', custom: false, color: '#101B4D', permissions: ALL },
  { id: 'tenant', name: 'Tenant Admin', description: 'Manages tenant settings and users', users: 24, status: 'Active', custom: false, color: '#F59E0B',
    permissions: perms({ users: 'view,create,edit,delete,approve', companies: 'view,create,edit,approve', billing: 'view,edit,manage', guards: 'view,create,edit,delete,approve', access: 'view,create,edit,manage', reports: 'view,create,manage', settings: 'view,edit', audit: 'view' }) },
  { id: 'guard', name: 'Security Guard', description: 'Access to guard operations and reports', users: 186, status: 'Active', custom: false, color: '#0758F9',
    permissions: perms({ users: 'view', companies: 'view', billing: 'view', guards: 'view,create,edit', access: 'view', reports: 'view,create', settings: 'view', audit: 'view' }) },
  { id: 'cadmin', name: 'Customer Admin', description: 'Manages company data and billing', users: 31, status: 'Active', custom: false, color: '#079447',
    permissions: perms({ users: 'view,create,edit', companies: 'view,edit', billing: 'view,manage', guards: 'view,create,edit,delete', access: 'view', reports: 'view', settings: 'view,edit', audit: 'view' }) },
  { id: 'support', name: 'Support Agent', description: 'Handles customer support tickets', users: 28, status: 'Active', custom: false, color: '#E91E8C',
    permissions: perms({ users: 'view,edit', companies: 'view', guards: 'view', reports: 'view' }) },
  { id: 'auditor', name: 'Auditor', description: 'Read-only access for audit and compliance', users: 14, status: 'Active', custom: true, color: '#6A8DFF',
    permissions: perms({ users: 'view', companies: 'view', billing: 'view', guards: 'view', access: 'view', reports: 'view', audit: 'view' }) },
  { id: 'analyst', name: 'Analyst', description: 'View reports and analytics', users: 20, status: 'Active', custom: true, color: '#5B6B8C',
    permissions: perms({ users: 'view', companies: 'view', reports: 'view,create,manage' }) },
  { id: 'manager', name: 'Manager', description: 'Operational management and reporting', users: 15, status: 'Active', custom: true, color: '#7909E8',
    permissions: perms({ users: 'view,create,edit,approve', companies: 'view', guards: 'view,create,edit,approve', reports: 'view,create' }) },
];
const SYSTEM_IDS = ['super', 'tenant', 'guard', 'cadmin', 'support']; // cannot be deleted

const SEED_ASSIGNMENTS = [
  { id: 's1', user: 'Rohit Sharma', role: 'Security Guard', company: 'SafeZone Services', at: '2026-10-20 14:32' },
  { id: 's2', user: 'Anjali Verma', role: 'Customer Admin', company: 'Metro Security Group', at: '2026-10-19 11:20' },
  { id: 's3', user: 'Karan Singh', role: 'Manager', company: 'Guardian Force Ltd', at: '2026-10-18 09:15' },
  { id: 's4', user: 'Sneha Nair', role: 'Support Agent', company: 'Elite Security Solutions', at: '2026-10-17 16:40' },
  { id: 's5', user: 'Arjun Mehta', role: 'Analyst', company: 'SwiftGuard Services', at: '2026-10-16 12:05' },
  { id: 's6', user: 'Priya Shah', role: 'Auditor', company: 'City Watch Ltd', at: '2026-09-28 10:10' },
  { id: 's7', user: 'Tom Hughes', role: 'Tenant Admin', company: 'Shield Security Group', at: '2026-09-21 15:45' },
];
const SEED_ACTIVITY = [
  { id: 'l1', action: 'Role assigned', user: 'David Miller', at: '2026-10-20 14:32' },
  { id: 'l2', action: 'Permissions updated', user: 'Anjali Verma', at: '2026-10-19 11:20' },
  { id: 'l3', action: 'Role created', user: 'Karan Singh', at: '2026-10-18 09:15' },
  { id: 'l4', action: 'Access revoked', user: 'Sneha Nair', at: '2026-10-17 16:40' },
  { id: 'l5', action: 'Permissions updated', user: 'Arjun Mehta', at: '2026-10-16 12:05' },
  { id: 'l6', action: 'Role assigned', user: 'David Miller', at: '2026-09-28 10:10' },
  { id: 'l7', action: 'Role created', user: 'David Miller', at: '2026-09-02 09:00' },
];
const SEED_REQUESTS = [
  { id: 'q1', user: 'Lucy Adams', company: 'Beacon Protection', role: 'Manager', reason: 'Takes over rota management from 1 Nov.', at: '2026-10-22 09:40' },
  { id: 'q2', user: 'Noah Evans', company: 'Apex Guarding', role: 'Analyst', reason: 'Needs monthly incident reporting.', at: '2026-10-21 16:05' },
  { id: 'q3', user: 'Henry Ford', company: 'Harbour Security', role: 'Auditor', reason: 'Annual compliance audit.', at: '2026-10-21 11:30' },
  { id: 'q4', user: 'Grace Hall', company: 'Citadel Services', role: 'Customer Admin', reason: 'New company administrator.', at: '2026-10-20 13:15' },
  { id: 'q5', user: 'Oliver Kent', company: 'Ironside Patrol', role: 'Support Agent', reason: 'Covering support desk.', at: '2026-10-19 08:50' },
];
const COMPANY_NAMES = ['SecureGuard UK Ltd', 'Metro Security Group', 'SafeZone Services', 'Guardian Force Ltd', 'Elite Security Solutions', 'SwiftGuard Services', 'City Watch Ltd', 'Shield Security Group'];
const ACTOR = 'David Miller';
const STORE_KEY = 'megsi.roles.v1';
const SEED = { roles: SEED_ROLES, assignments: SEED_ASSIGNMENTS, activity: SEED_ACTIVITY, requests: SEED_REQUESTS };

/* ---------- helpers ---------- */
function loadState() {
  try { const s = JSON.parse(localStorage.getItem(STORE_KEY)); if (s && Array.isArray(s.roles)) return s; } catch { /* storage unavailable or corrupt: use seed */ }
  return SEED;
}
const stamp = () => { const d = new Date(); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; };
const countPerms = (p) => Object.values(p).reduce((n, a) => n + a.length, 0);
const pct = (v, t) => (t ? Math.round((v / t) * 100) : 0);

/* ---------- small shared UI ---------- */
function Modal({ title, onClose, children, wide }) {
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="rp-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`rp-modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="rp-modal-h"><h3>{title}</h3><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
        {children}
      </div>
    </div>
  );
}
const Card = ({ icon, title, right, children, cls = '', cardRef }) => (
  <section className={`card rp-card ${cls}`} ref={cardRef}>
    <header className="card-h"><span className="ic-sq">{icon}</span><h3>{title}</h3><div className="grow" />{right}</header>
    {children}
  </section>
);
const StatusBadge = ({ v }) => <span className={`rp-status ${v === 'Active' ? 'on' : 'off'}`}><i />{v}</span>;

function RowMenu({ role, onAction }) {
  const [pos, setPos] = useState(null);
  const btn = useRef(null);
  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    const down = (e) => { if (!e.target.closest('.rp-menu') && !btn.current?.contains(e.target)) close(); };
    const key = (e) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', down); document.addEventListener('keydown', key);
    window.addEventListener('scroll', close, true); window.addEventListener('resize', close);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };
  }, [pos]);
  const toggle = () => {
    if (pos) return setPos(null);
    const r = btn.current.getBoundingClientRect(); const h = 250;
    setPos({ top: r.bottom + 4 + h > window.innerHeight ? Math.max(8, r.top - h - 4) : r.bottom + 4, left: Math.max(8, r.right - 200) });
  };
  const run = (a) => { setPos(null); onAction(a, role); };
  const system = SYSTEM_IDS.includes(role.id);
  return (
    <>
      <button ref={btn} className="rp-dots" aria-label={`Actions for ${role.name}`} aria-haspopup="menu" aria-expanded={!!pos} onClick={toggle}><MoreHorizontal size={16} /></button>
      {pos && createPortal(
        <div className="rp-menu" role="menu" style={{ top: pos.top, left: pos.left }}>
          <button role="menuitem" onClick={() => run('view')}><Eye size={15} />View Details</button>
          <button role="menuitem" onClick={() => run('edit')}><Pencil size={15} />Edit Role &amp; Permissions</button>
          <button role="menuitem" onClick={() => run('assign')}><UserPlus size={15} />Assign User</button>
          <button role="menuitem" onClick={() => run('duplicate')}><Copy size={15} />Duplicate Role</button>
          <button role="menuitem" disabled={role.id === 'super'} title={role.id === 'super' ? 'Super Admin must stay active' : ''} onClick={() => run('status')}><Power size={15} />{role.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
          <button role="menuitem" className="danger" disabled={system} title={system ? 'Built-in roles cannot be deleted' : ''} onClick={() => run('delete')}><Trash2 size={15} />Delete Role</button>
        </div>, document.body)}
    </>
  );
}

/* ---------- Create / edit role (with permission configuration) ---------- */
function RoleForm({ role, roles, onSave, onClose }) {
  const locked = role?.id === 'super';
  const [f, setF] = useState({ name: role?.name ?? '', description: role?.description ?? '', status: role?.status ?? 'Active' });
  const [p, setP] = useState(() => Object.fromEntries(MODULES.map((m) => [m.id, [...(role?.permissions?.[m.id] ?? [])]])));
  const [err, setErr] = useState({});
  const has = (m, a) => p[m].includes(a);
  const toggle = (m, a) => setP((x) => ({ ...x, [m]: x[m].includes(a) ? x[m].filter((v) => v !== a) : [...x[m], a] }));
  const toggleRow = (m) => setP((x) => ({ ...x, [m]: x[m].length === ACTIONS.length ? [] : ACTIONS.map(([a]) => a) }));
  const setAll = (on) => setP(Object.fromEntries(MODULES.map((m) => [m.id, on ? ACTIONS.map(([a]) => a) : []])));
  const toggleCol = (a) => setP((x) => { const all = MODULES.every((m) => x[m.id].includes(a)); return Object.fromEntries(MODULES.map((m) => [m.id, all ? x[m.id].filter((v) => v !== a) : [...new Set([...x[m.id], a])]])); });
  const total = countPerms(p);
  const submit = (e) => {
    e.preventDefault();
    const x = {}; const name = f.name.trim();
    if (!name) x.name = 'Role name is required.';
    else if (name.length > 40) x.name = 'Role name must be 40 characters or fewer.';
    else if (roles.some((r) => r.id !== role?.id && r.name.toLowerCase() === name.toLowerCase())) x.name = 'A role with this name already exists.';
    if (!f.description.trim()) x.description = 'Description is required.';
    else if (f.description.trim().length > 120) x.description = 'Description must be 120 characters or fewer.';
    if (total === 0) x.perms = 'Select at least one permission for this role.';
    setErr(x);
    if (!Object.keys(x).length) onSave({ ...f, name, description: f.description.trim(), permissions: Object.fromEntries(Object.entries(p).filter(([, v]) => v.length)) });
  };
  return (
    <Modal title={role?.id ? 'Edit Role' : 'Add Role'} onClose={onClose} wide>
      <form onSubmit={submit} noValidate>
        <div className="rp-modal-b">
          <div className="rp-grid">
            <label className={`rp-field ${err.name ? 'bad' : ''}`}><span>Role name <i>*</i></span><input value={f.name} disabled={locked} autoFocus onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Site Supervisor" />{err.name && <em className="err">{err.name}</em>}</label>
            <label className="rp-field"><span>Status</span><span className="rp-select"><select value={f.status} disabled={locked} onChange={(e) => setF({ ...f, status: e.target.value })}><option>Active</option><option>Inactive</option></select><ChevronDown size={14} /></span></label>
            <label className={`rp-field full ${err.description ? 'bad' : ''}`}><span>Description <i>*</i></span><input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="What is this role used for?" />{err.description && <em className="err">{err.description}</em>}</label>
          </div>
          <div className="rp-perm-h">
            <b>Permissions <small>{total} of {TOTAL_PERMISSIONS} selected</small></b>
            {!locked && <span><button type="button" className="rp-btn sm" onClick={() => setAll(true)}>Select all</button><button type="button" className="rp-btn sm" onClick={() => setAll(false)}>Deselect all</button></span>}
          </div>
          {locked && <p className="rp-note">Super Admin always keeps every permission and cannot be reduced.</p>}
          <div className={`rp-perm-scroll ${err.perms ? 'bad' : ''}`}>
            <table className="rp-perm">
              <thead><tr><th>Module</th>{ACTIONS.map(([a, l]) => <th key={a}>{!locked ? <button type="button" className="rp-colbtn" title={`Toggle ${l} for every module`} onClick={() => toggleCol(a)}>{l}</button> : l}</th>)}<th>All</th></tr></thead>
              <tbody>{MODULES.map((m) => (
                <tr key={m.id}>
                  <td><span className="rp-mod"><m.Icon size={15} />{m.name}</span></td>
                  {ACTIONS.map(([a, l]) => <td key={a}><input type="checkbox" checked={has(m.id, a)} disabled={locked} onChange={() => toggle(m.id, a)} aria-label={`${l} – ${m.name}`} /></td>)}
                  <td><input type="checkbox" checked={p[m.id].length === ACTIONS.length} disabled={locked} onChange={() => toggleRow(m.id)} aria-label={`All permissions – ${m.name}`} /></td>
                </tr>))}</tbody>
            </table>
          </div>
          {err.perms && <em className="err">{err.perms}</em>}
          <p className="rp-note">Demonstration only — roles are stored in this browser (localStorage). Permissions are not enforced by a server.</p>
        </div>
        <div className="rp-modal-f"><button type="button" className="rp-btn big" onClick={onClose}>Cancel</button><button type="submit" className="rp-btn primary big">{role?.id ? 'Save Changes' : 'Create Role'}</button></div>
      </form>
    </Modal>
  );
}

/* ---------- Role details drawer ---------- */
function RoleDrawer({ role, onClose, onEdit }) {
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, [onClose]);
  return (
    <>
      <div className="rp-drawer-bd" onClick={onClose} />
      <aside className="rp-drawer" role="dialog" aria-modal="true" aria-label={`${role.name} details`}>
        <div className="rp-drawer-h"><div className="rp-drawer-t"><Avatar name={role.name} /><div><h3>{role.name}</h3><StatusBadge v={role.status} /></div></div><button className="icon-btn" onClick={onClose} aria-label="Close details"><X size={18} /></button></div>
        <div className="rp-drawer-b">
          <p className="rp-desc">{role.description}</p>
          <div className="kv"><span>Assigned users</span><b>{role.users}</b></div>
          <div className="kv"><span>Type</span><b>{SYSTEM_IDS.includes(role.id) ? 'Built-in' : role.custom ? 'Custom' : 'Built-in'}</b></div>
          <div className="kv"><span>Permissions granted</span><b>{countPerms(role.permissions)} of {TOTAL_PERMISSIONS}</b></div>
          <h4>Permissions by module</h4>
          {MODULES.map((m) => { const a = role.permissions[m.id] || []; return (
            <div className="rp-pm" key={m.id}><span className="rp-mod"><m.Icon size={14} />{m.name}</span>
              <span className="rp-chips">{a.length ? ACTIONS.filter(([k]) => a.includes(k)).map(([k, l]) => <em key={k}>{l}</em>) : <em className="none">No access</em>}</span></div>); })}
        </div>
        <div className="rp-drawer-f"><button className="rp-btn primary" onClick={() => onEdit(role)}><Pencil size={15} />Edit Role &amp; Permissions</button></div>
      </aside>
    </>
  );
}

/* ---------- Delete confirmation (type the role name to confirm) ---------- */
function DeleteModal({ role, onClose, onConfirm }) {
  const [v, setV] = useState(''); const [err, setErr] = useState('');
  const submit = (e) => { e.preventDefault(); if (v.trim() !== role.name) return setErr(`Type “${role.name}” exactly to confirm.`); onConfirm(role); };
  return (
    <Modal title="Delete Role" onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="rp-modal-b">
          <p>You are about to delete <b>{role.name}</b>. {role.users > 0 ? <>The <b>{role.users}</b> user{role.users === 1 ? '' : 's'} assigned to it will lose this role.</> : 'No users are assigned to it.'} This cannot be undone.</p>
          <label className={`rp-field ${err ? 'bad' : ''}`}><span>Type the role name to confirm</span><input value={v} onChange={(e) => { setV(e.target.value); setErr(''); }} placeholder={role.name} autoFocus />{err && <em className="err">{err}</em>}</label>
          <p className="rp-note">Demonstration only — nothing is deleted on a server.</p>
        </div>
        <div className="rp-modal-f"><button type="button" className="rp-btn big" onClick={onClose}>Cancel</button><button type="submit" className="rp-btn danger big"><Trash2 size={15} />Delete Role</button></div>
      </form>
    </Modal>
  );
}

/* ---------- Assign a user to a role ---------- */
function AssignModal({ role, onClose, onSave }) {
  const [f, setF] = useState({ user: '', company: COMPANY_NAMES[0] }); const [err, setErr] = useState('');
  const submit = (e) => { e.preventDefault(); if (f.user.trim().length < 2) return setErr('Enter the user’s full name.'); onSave(role, f.user.trim(), f.company); };
  return (
    <Modal title={`Assign User – ${role.name}`} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="rp-modal-b">
          <label className={`rp-field ${err ? 'bad' : ''}`}><span>User name <i>*</i></span><input value={f.user} autoFocus onChange={(e) => { setF({ ...f, user: e.target.value }); setErr(''); }} placeholder="e.g. Rohit Sharma" />{err && <em className="err">{err}</em>}</label>
          <label className="rp-field"><span>Company</span><span className="rp-select"><select value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })}>{COMPANY_NAMES.map((c) => <option key={c}>{c}</option>)}</select><ChevronDown size={14} /></span></label>
          <p className="rp-note">Demonstration only — the assignment is stored in this browser.</p>
        </div>
        <div className="rp-modal-f"><button type="button" className="rp-btn big" onClick={onClose}>Cancel</button><button type="submit" className="rp-btn primary big">Assign Role</button></div>
      </form>
    </Modal>
  );
}

/* ---------- Pending access requests ---------- */
function RequestsModal({ requests, fmt, onClose, onDecide }) {
  return (
    <Modal title={`Pending Access Requests (${requests.length})`} onClose={onClose} wide>
      <div className="rp-modal-b">
        {requests.length === 0 && <div className="empty">No requests awaiting approval.</div>}
        <ul className="rp-req">{requests.map((r) => (
          <li key={r.id}><Avatar name={r.user} /><span className="rp-req-t"><b>{r.user}</b><small>{r.company} · requests <em>{r.role}</em> · {fmt(r.at)}</small><small>{r.reason}</small></span>
            <button className="rp-btn sm" onClick={() => onDecide(r, false)}>Reject</button><button className="rp-btn primary sm" onClick={() => onDecide(r, true)}><Check size={14} />Approve</button></li>))}</ul>
        <p className="rp-note">Demonstration only — approvals are stored in this browser.</p>
      </div>
      <div className="rp-modal-f"><button className="rp-btn big" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ---------- Generic "View All" list ---------- */
function ListModal({ title, cols, rows, onClose }) {
  return (
    <Modal title={title} onClose={onClose} wide>
      <div className="rp-modal-b"><div className="rp-scroll tall"><table className="rp-tbl"><thead><tr><th>#</th>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}><td>{i + 1}</td>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}{rows.length === 0 && <tr><td colSpan={cols.length + 1} className="empty">Nothing to show.</td></tr>}</tbody></table></div></div>
      <div className="rp-modal-f"><button className="rp-btn big" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* =====================================================================
   Page
   ===================================================================== */
export default function RolesPermissions({ range, setRange, toast }) {
  const { fmtDate } = useI18n();
  const fmt = (s) => `${fmtDate(s.slice(0, 10))}, ${s.slice(11, 16)}`;
  const [state, setState] = useState(loadState);
  const { roles, assignments, activity, requests } = state;
  const [matrixRole, setMatrixRole] = useState('all'); const [matrixModule, setMatrixModule] = useState('all');
  const [modal, setModal] = useState(null); // {type, role?}
  const [drawerId, setDrawerId] = useState(null);
  const rolesRef = useRef(null); const matrixRef = useRef(null);

  useEffect(() => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* storage unavailable: state still works in memory */ } }, [state]);
  const patch = (fn) => setState((s) => fn(s));
  const log = (s, action) => ({ ...s, activity: [{ id: `l${Date.now()}${Math.random().toString(16).slice(2, 5)}`, action, user: ACTOR, at: stamp() }, ...s.activity] });

  const totalUsers = roles.reduce((n, r) => n + r.users, 0);
  const inRange = (at) => at.slice(0, 10) >= range.start && at.slice(0, 10) <= range.end;
  const recentAssign = useMemo(() => assignments.filter((a) => inRange(a.at)).sort((a, b) => b.at.localeCompare(a.at)), [assignments, range]); // eslint-disable-line react-hooks/exhaustive-deps
  const recentLog = useMemo(() => activity.filter((a) => inRange(a.at)).sort((a, b) => b.at.localeCompare(a.at)), [activity, range]); // eslint-disable-line react-hooks/exhaustive-deps
  const roleColor = (name) => roles.find((r) => r.name === name)?.color ?? '#5B6B8C';
  const drawerRole = roles.find((r) => r.id === drawerId);

  const scrollTo = (r) => r.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const kpis = [
    { t: 'Total Roles', v: roles.length, c: 'blue', I: Users, ch: 14, d: 'Defined roles in the platform', go: () => scrollTo(rolesRef) },
    { t: 'Total Permissions', v: TOTAL_PERMISSIONS, c: 'green', I: Users, ch: 8, d: 'Module-wise permissions', go: () => scrollTo(matrixRef) },
    { t: 'Assigned Users', v: totalUsers, c: 'orange', I: ShieldCheck, ch: 12, d: 'Users with role assignments', go: () => setModal({ type: 'assignments' }) },
    { t: 'Custom Roles', v: roles.filter((r) => r.custom).length, c: 'purple', I: KeyRound, ch: 0, d: 'Tenant-specific roles', go: () => scrollTo(rolesRef) },
    { t: 'Pending Access Requests', v: requests.length, c: 'red', I: Lock, ch: -60, d: 'Awaiting approval', go: () => setModal({ type: 'requests' }) },
  ];

  /* ----- role actions ----- */
  const onAction = (a, role) => {
    if (a === 'view') setDrawerId(role.id);
    else if (a === 'edit') setModal({ type: 'form', role });
    else if (a === 'assign') setModal({ type: 'assign', role });
    else if (a === 'duplicate') setModal({ type: 'form', role: { ...role, id: null, name: `${role.name} (Copy)`, users: 0 } });
    else if (a === 'delete') setModal({ type: 'delete', role });
    else if (a === 'status') {
      const next = role.status === 'Active' ? 'Inactive' : 'Active';
      patch((s) => log({ ...s, roles: s.roles.map((r) => (r.id === role.id ? { ...r, status: next } : r)) }, 'Role status changed'));
      toast(`${role.name} is now ${next} (demo).`);
    }
  };
  const saveRole = (data) => {
    const existing = modal.role?.id;
    if (existing) {
      patch((s) => log({ ...s, roles: s.roles.map((r) => (r.id === existing ? { ...r, ...data } : r)) }, 'Permissions updated'));
      toast(`${data.name} saved (demo — stored in this browser only).`);
    } else {
      patch((s) => log({ ...s, roles: [...s.roles, { id: `r${Date.now()}`, users: 0, custom: true, color: PALETTE[s.roles.length % PALETTE.length], ...data }] }, 'Role created'));
      toast(`${data.name} created (demo — stored in this browser only).`);
    }
    setModal(null);
  };
  const deleteRole = (role) => {
    patch((s) => log({ ...s, roles: s.roles.filter((r) => r.id !== role.id) }, 'Access revoked'));
    setModal(null); setDrawerId(null); toast(`${role.name} deleted (demo).`);
  };
  const assign = (role, user, company) => {
    patch((s) => log({ ...s, roles: s.roles.map((r) => (r.id === role.id ? { ...r, users: r.users + 1 } : r)), assignments: [{ id: `s${Date.now()}`, user, role: role.name, company, at: stamp() }, ...s.assignments] }, 'Role assigned'));
    setModal(null); toast(`${user} assigned to ${role.name} (demo).`);
  };
  const decide = (req, approve) => {
    patch((s) => {
      const next = { ...s, requests: s.requests.filter((r) => r.id !== req.id) };
      if (!approve) return log(next, 'Access revoked');
      return log({ ...next, roles: next.roles.map((r) => (r.name === req.role ? { ...r, users: r.users + 1 } : r)), assignments: [{ id: `s${Date.now()}`, user: req.user, role: req.role, company: req.company, at: stamp() }, ...next.assignments] }, 'Role assigned');
    });
    toast(approve ? `${req.user} approved as ${req.role} (demo).` : `Request from ${req.user} rejected (demo).`);
  };
  const toggleCell = (role, mod) => {
    if (role.id === 'super') return;
    const on = (role.permissions[mod.id] || []).length > 0;
    patch((s) => log({ ...s, roles: s.roles.map((r) => { if (r.id !== role.id) return r; const p = { ...r.permissions }; if (on) delete p[mod.id]; else p[mod.id] = ['view']; return { ...r, permissions: p }; }) }, 'Permissions updated'));
    toast(on ? `${mod.name} access removed from ${role.name}.` : `${role.name} can now view ${mod.name}. Use Edit Role for finer control.`);
  };

  const shownRoles = matrixRole === 'all' ? roles : roles.filter((r) => r.id === matrixRole);
  const shownMods = matrixModule === 'all' ? MODULES : MODULES.filter((m) => m.id === matrixModule);
  const usage = roles.filter((r) => r.users > 0).map((r) => ({ name: r.name, value: r.users, color: r.color })).sort((a, b) => b.value - a.value);
  const viewAll = (b) => <button className="rp-viewall" onClick={b}>View All</button>;

  return (
    <div className="dash rp">
      <div className="title-row">
        <div><h1 className="rp-h1"><ShieldCheck size={30} />Roles &amp; Permissions</h1><p>Manage roles, set permissions and control access across the platform and tenant companies.</p></div>
        <DateRangeMenu range={range} setRange={setRange} />
      </div>

      <div className="rp-kpis">{kpis.map((k) => (
        <button key={k.t} className="card rp-kpi" onClick={k.go} aria-label={`${k.t}: ${k.v}`}>
          <span className={`rp-kpi-ic ${k.c}`}><k.I size={26} /></span>
          <span className="rp-kpi-t"><small>{k.t}</small><span className="rp-kpi-v"><b>{k.v}</b><em className={k.ch < 0 ? 'down' : k.ch > 0 ? 'up' : 'neutral'}>{k.ch < 0 ? '↓' : '↑'} {Math.abs(k.ch)}%</em></span></span>
          <span className="rp-kpi-d">{k.d}</span>
        </button>))}
      </div>

      <div className="rp-main">
        <Card cardRef={rolesRef} icon={<Users size={16} />} title="Roles Management" right={<button className="rp-btn primary" onClick={() => setModal({ type: 'form', role: null })}><Plus size={15} />Add Role</button>}>
          <div className="rp-scroll roles"><table className="rp-tbl">
            <thead><tr><th>#</th><th>Role Name</th><th>Description</th><th>Users</th><th>Status</th><th className="r">Actions</th></tr></thead>
            <tbody>{roles.map((r, i) => (
              <tr key={r.id}>
                <td>{i + 1}</td>
                <td><span className="name"><Avatar name={r.name} /><button className="rp-link" onClick={() => setDrawerId(r.id)}>{r.name}</button></span></td>
                <td className="desc">{r.description}</td>
                <td>{r.users}</td>
                <td><StatusBadge v={r.status} /></td>
                <td className="r"><RowMenu role={r} onAction={onAction} /></td>
              </tr>))}
              {roles.length === 0 && <tr><td colSpan={6} className="empty">No roles defined. Use Add Role to create one.</td></tr>}</tbody>
          </table></div>
        </Card>

        <Card cardRef={matrixRef} icon={<ShieldCheck size={16} />} title="Permission Matrix" right={<>
          <span className="rp-select sm"><select value={matrixRole} onChange={(e) => setMatrixRole(e.target.value)} aria-label="Filter matrix by role"><option value="all">All Roles</option>{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select><ChevronDown size={13} /></span>
          <span className="rp-select sm"><select value={matrixModule} onChange={(e) => setMatrixModule(e.target.value)} aria-label="Filter matrix by module"><option value="all">All Modules</option>{MODULES.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select><ChevronDown size={13} /></span></>}>
          <div className="rp-scroll"><table className="rp-tbl matrix">
            <thead><tr><th>Module / Permission</th>{shownRoles.map((r) => <th key={r.id} className="c">{r.name}</th>)}</tr></thead>
            <tbody>{shownMods.map((m) => (
              <tr key={m.id}>
                <td><span className="rp-mod"><m.Icon size={16} />{m.name}</span></td>
                {shownRoles.map((r) => { const a = r.permissions[m.id] || []; const on = a.length > 0; return (
                  <td key={r.id} className="c"><button className={`rp-cell ${on ? 'on' : ''}`} disabled={r.id === 'super'} aria-pressed={on}
                    aria-label={`${r.name}: ${m.name} ${on ? 'allowed' : 'not allowed'}`} title={r.id === 'super' ? 'Super Admin always has full access' : `${r.name} – ${m.name}: ${on ? ACTIONS.filter(([k]) => a.includes(k)).map(([, l]) => l).join(', ') : 'No access'}. Click to ${on ? 'remove access' : 'grant View'}.`}
                    onClick={() => toggleCell(r, m)}><Check size={13} strokeWidth={3} /></button></td>); })}
              </tr>))}
              {(shownRoles.length === 0 || shownMods.length === 0) && <tr><td className="empty">Nothing to show.</td></tr>}</tbody>
          </table></div>
          <div className="rp-legend"><span><i className="on"><Check size={10} strokeWidth={3} /></i>Allowed</span><span><i />Not Allowed</span></div>
        </Card>
      </div>

      <div className="rp-bottom">
        <Card icon={<UserPlus size={16} />} title="Recent Role Assignments" right={viewAll(() => setModal({ type: 'assignments' }))}>
          <div className="rp-scroll"><table className="rp-tbl compact"><thead><tr><th>#</th><th>User</th><th>Role</th><th>Company</th><th>Assigned On</th></tr></thead>
            <tbody>{recentAssign.slice(0, 5).map((a, i) => (
              <tr key={a.id}><td>{i + 1}</td><td><span className="name"><Avatar name={a.user} />{a.user}</span></td>
                <td><span className="rp-role" style={{ color: roleColor(a.role), background: `${roleColor(a.role)}1f` }}>{a.role}</span></td><td>{a.company}</td><td>{fmt(a.at)}</td></tr>))}
              {recentAssign.length === 0 && <tr><td colSpan={5} className="empty">No assignments in the selected period.</td></tr>}</tbody></table></div>
        </Card>

        <Card icon={<Shield size={16} />} title="Role Usage" right={viewAll(() => setModal({ type: 'usage' }))}>
          <div className="rp-usage">
            <div className="rp-donut">
              <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={usage} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="#fff" strokeWidth={2}>{usage.map((d) => <Cell key={d.name} fill={d.color} />)}</Pie>
                <Tooltip formatter={(v, n) => [`${v} (${pct(v, totalUsers)}%)`, n]} /></PieChart></ResponsiveContainer>
              <div className="donut-c"><b>{totalUsers}</b><span>Total Users</span></div>
            </div>
            <ul className="rp-usage-l">{usage.map((d) => <li key={d.name}><i style={{ background: d.color }} />{d.name}<span>{pct(d.value, totalUsers)}% ({d.value})</span></li>)}</ul>
          </div>
        </Card>

        <Card icon={<FileText size={16} />} title="Recent Activity Log" right={viewAll(() => setModal({ type: 'log' }))}>
          <div className="rp-scroll"><table className="rp-tbl compact"><thead><tr><th>#</th><th>Action</th><th>User</th><th>Date &amp; Time</th></tr></thead>
            <tbody>{recentLog.slice(0, 5).map((a, i) => (
              <tr key={a.id}><td>{i + 1}</td><td><span className="rp-act">{a.action}</span></td><td><span className="name"><Avatar name={a.user} />{a.user}</span></td><td>{fmt(a.at)}</td></tr>))}
              {recentLog.length === 0 && <tr><td colSpan={4} className="empty">No activity in the selected period.</td></tr>}</tbody></table></div>
        </Card>
      </div>

      {drawerRole && <RoleDrawer role={drawerRole} onClose={() => setDrawerId(null)} onEdit={(r) => { setDrawerId(null); setModal({ type: 'form', role: r }); }} />}
      {modal?.type === 'form' && <RoleForm role={modal.role} roles={roles} onSave={saveRole} onClose={() => setModal(null)} />}
      {modal?.type === 'delete' && <DeleteModal role={modal.role} onClose={() => setModal(null)} onConfirm={deleteRole} />}
      {modal?.type === 'assign' && <AssignModal role={modal.role} onClose={() => setModal(null)} onSave={assign} />}
      {modal?.type === 'requests' && <RequestsModal requests={requests} fmt={fmt} onClose={() => setModal(null)} onDecide={decide} />}
      {modal?.type === 'assignments' && <ListModal title="All Role Assignments" cols={['User', 'Role', 'Company', 'Assigned On']} rows={[...assignments].sort((a, b) => b.at.localeCompare(a.at)).map((a) => [a.user, a.role, a.company, fmt(a.at)])} onClose={() => setModal(null)} />}
      {modal?.type === 'log' && <ListModal title="Activity Log" cols={['Action', 'User', 'Date & Time']} rows={[...activity].sort((a, b) => b.at.localeCompare(a.at)).map((a) => [a.action, a.user, fmt(a.at)])} onClose={() => setModal(null)} />}
      {modal?.type === 'usage' && <ListModal title="Role Usage" cols={['Role', 'Users', 'Share']} rows={usage.map((u) => [u.name, u.value, `${pct(u.value, totalUsers)}%`])} onClose={() => setModal(null)} />}
    </div>
  );
}
