import { useEffect, useState } from 'react';
import { CheckCircle2, Mail, RotateCcw, ShieldAlert, Search as SearchIcon, X } from 'lucide-react';
import { Avatar, PlanBadge } from '../../components/Common.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { DEMO_TODAY, REVIEW, REVIEW_TONE } from '../../data/suspendedData.js';

export const ReviewBadge = ({ v }) => <span className={`st-badge ${REVIEW_TONE[v]}`}>{v}</span>;
const daysSince = (iso) => Math.max(0, Math.round((Date.parse(DEMO_TODAY) - Date.parse(iso)) / 86400000));
const gbp = (n) => `£${n.toLocaleString('en-GB')}`;

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="st-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`st-modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="st-modal-h"><h3>{title}</h3><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Tenant details drawer ---------- */
export function TenantDrawer({ tenant, onClose, onReview, onReactivate }) {
  const { fmtDate } = useI18n();
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, [onClose]);
  if (!tenant) return null;
  const eligible = tenant.review === REVIEW.ELIGIBLE;
  const rows = [
    ['Tenant ID', tenant.code], ['Subscription plan', <PlanBadge v={tenant.plan} />], ['Company admin', tenant.admin], ['Email', tenant.email], ['Users', tenant.users], ['Monthly revenue', gbp(tenant.mrr)],
    ['Suspension reason', tenant.reason], ['Suspended on', fmtDate(tenant.suspendedDate)], ['Suspended for', `${daysSince(tenant.suspendedDate)} days`], ['Suspended by', tenant.suspendedBy],
    ...(tenant.overdue ? [['Outstanding balance', gbp(tenant.overdue)]] : []),
  ];
  return (
    <>
      <div className="st-drawer-bd" onClick={onClose} />
      <aside className="st-drawer" role="dialog" aria-modal="true" aria-label={`${tenant.name} suspension details`}>
        <div className="st-drawer-h">
          <div className="st-drawer-t"><Avatar name={tenant.name} /><div><h3>{tenant.name}</h3><ReviewBadge v={tenant.review} /></div></div>
          <button className="icon-btn" onClick={onClose} aria-label="Close details"><X size={18} /></button>
        </div>
        <div className="st-drawer-b">
          <p className="st-reason-box"><ShieldAlert size={16} /><span><b>{tenant.reason}</b><br />{tenant.detail}</span></p>
          {rows.map(([k, v]) => <div className="kv" key={k}><span>{k}</span><b>{v}</b></div>)}
          <h4>Suspension history</h4>
          <ul className="st-hist">{[...tenant.history].reverse().map((h, i) => <li key={i}><i /><div><b>{h.text}</b><small>{fmtDate(h.date)} · {h.by}</small></div></li>)}</ul>
          <p className="demo-note">Demonstration data only — actions are not sent to a server.</p>
        </div>
        <div className="st-drawer-f">
          <button className="st-btn" onClick={() => onReview(tenant)}><SearchIcon size={15} /> Review Suspension</button>
          <button className="st-btn primary" disabled={!eligible} title={eligible ? '' : 'Mark the review as Eligible for Reactivation first'} onClick={() => onReactivate([tenant])}><RotateCcw size={15} /> Reactivate</button>
          <a className="st-btn" href={`mailto:${tenant.email}?subject=${encodeURIComponent(`MEGSI account suspension – ${tenant.name}`)}`}><Mail size={15} /> Contact Admin</a>
        </div>
      </aside>
    </>
  );
}

/* ---------- Review suspension ---------- */
const DECISIONS = [
  [REVIEW.ELIGIBLE, 'Approve for reactivation', 'The reason has been resolved; the tenant can be reactivated.'],
  [REVIEW.INVESTIGATING, 'Keep suspended — investigate', 'More information is needed before a decision.'],
  [REVIEW.CRITICAL, 'Escalate as critical', 'Serious breach or risk; needs senior sign-off.'],
];
export function ReviewModal({ tenant, onClose, onSave }) {
  const [decision, setDecision] = useState(tenant.review === REVIEW.PENDING ? '' : tenant.review);
  const [note, setNote] = useState('');
  const [err, setErr] = useState({});
  const submit = (e) => {
    e.preventDefault();
    const x = {};
    if (!decision) x.decision = 'Choose a review outcome.';
    if (note.trim().length < 5) x.note = 'Add a review note (at least 5 characters).';
    setErr(x);
    if (!Object.keys(x).length) onSave(tenant, decision, note.trim());
  };
  return (
    <Modal title="Review Suspension" onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="st-modal-b">
          <div className="st-summary"><Avatar name={tenant.name} /><div><b>{tenant.name}</b><small>{tenant.reason} · currently <em>{tenant.review}</em></small></div></div>
          <p className="st-detail">{tenant.detail}</p>
          <fieldset className={err.decision ? 'bad' : ''}><legend>Review outcome</legend>
            {DECISIONS.map(([v, l, d]) => (
              <label key={v} className={`st-radio ${decision === v ? 'on' : ''}`}><input type="radio" name="decision" checked={decision === v} onChange={() => setDecision(v)} /><span><b>{l}</b><small>{d}</small></span></label>))}
            {err.decision && <em className="err">{err.decision}</em>}
          </fieldset>
          <label className={`st-field ${err.note ? 'bad' : ''}`}><span>Review note <i>*</i></span>
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Summarise what you checked and why." />
            {err.note && <em className="err">{err.note}</em>}</label>
          <p className="st-note">Demonstration only — the outcome is stored in this browser session.</p>
        </div>
        <div className="st-modal-f"><button type="button" className="st-btn" onClick={onClose}>Cancel</button><button type="submit" className="st-btn primary"><CheckCircle2 size={15} /> Save Review</button></div>
      </form>
    </Modal>
  );
}

/* ---------- Reactivate (one or many) ---------- */
export function ReactivateModal({ tenants, onClose, onConfirm }) {
  const [ok, setOk] = useState(false); const [note, setNote] = useState(''); const [err, setErr] = useState('');
  const reasons = new Set(tenants.map((t) => t.reason));
  const checks = [];
  if (reasons.has('Payment Overdue')) checks.push('the outstanding balance has been paid or a payment plan agreed');
  if (reasons.has('Security Issue')) checks.push('the security issue has been remediated and credentials reset');
  if (reasons.has('Terms Violation')) checks.push('the terms violation has been resolved with the tenant');
  const statement = `I confirm ${checks.length ? checks.join('; ') : 'the review findings support restoring access'}.`;
  const users = tenants.reduce((n, t) => n + t.users, 0);
  const submit = (e) => { e.preventDefault(); if (!ok) return setErr('Please tick the confirmation box before reactivating.'); onConfirm(tenants, note.trim()); };
  return (
    <Modal title={tenants.length > 1 ? `Reactivate ${tenants.length} Tenants` : 'Reactivate Tenant'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="st-modal-b">
          <ul className="st-list">{tenants.map((t) => <li key={t.id}><Avatar name={t.name} /><span><b>{t.name}</b><small>{t.reason} · {t.users} users</small></span></li>)}</ul>
          <p className="st-detail">Reactivating restores sign-in access for {users} user{users === 1 ? '' : 's'} and removes {tenants.length > 1 ? 'these tenants' : 'this tenant'} from the suspended list.</p>
          <label className={`st-check ${err ? 'bad' : ''}`}><input type="checkbox" checked={ok} onChange={(e) => { setOk(e.target.checked); setErr(''); }} /><span>{statement}</span></label>
          {err && <em className="err">{err}</em>}
          <label className="st-field"><span>Reactivation note (optional)</span><textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Recorded in the suspension history." /></label>
          <p className="st-note">Demonstration only — no real tenant account is changed and no backend request is made.</p>
        </div>
        <div className="st-modal-f"><button type="button" className="st-btn" onClick={onClose}>Cancel</button><button type="submit" className="st-btn primary"><RotateCcw size={15} /> Reactivate</button></div>
      </form>
    </Modal>
  );
}

/* ---------- Manage policies ---------- */
export function PoliciesModal({ policies, onClose, onSave }) {
  const [f, setF] = useState({ ...policies, graceDays: String(policies.graceDays), reminders: String(policies.reminders), retentionDays: String(policies.retentionDays) });
  const [err, setErr] = useState({});
  const num = (k, label, min, max, unit) => (
    <label className={`st-field ${err[k] ? 'bad' : ''}`}><span>{label}</span>
      <input inputMode="numeric" value={f[k]} onChange={(e) => setF((x) => ({ ...x, [k]: e.target.value }))} aria-label={label} />
      <small>{unit} · allowed {min}–{max}</small>{err[k] && <em className="err">{err[k]}</em>}</label>);
  const submit = (e) => {
    e.preventDefault();
    const x = {};
    [['graceDays', 1, 60], ['reminders', 0, 5], ['retentionDays', 30, 365]].forEach(([k, lo, hi]) => { if (!/^\d+$/.test(f[k].trim()) || +f[k] < lo || +f[k] > hi) x[k] = `Enter a whole number from ${lo} to ${hi}.`; });
    setErr(x);
    if (!Object.keys(x).length) onSave({ ...f, graceDays: +f.graceDays, reminders: +f.reminders, retentionDays: +f.retentionDays });
  };
  const sw = (k, label, hint) => (<label className="st-switch"><input type="checkbox" checked={f[k]} onChange={(e) => setF((x) => ({ ...x, [k]: e.target.checked }))} /><span className="trk" /><span><b>{label}</b><small>{hint}</small></span></label>);
  return (
    <Modal title="Suspension Policies" onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="st-modal-b st-grid">
          {num('graceDays', 'Payment grace period', 1, 60, 'days')}
          {num('reminders', 'Payment reminders before suspension', 0, 5, 'reminders')}
          {num('retentionDays', 'Data retention while suspended', 30, 365, 'days')}
          <div className="st-switches">
            {sw('autoSuspendOverdue', 'Auto-suspend overdue tenants', 'Suspend automatically when the grace period ends.')}
            {sw('notifyAdmin', 'Notify company admin', 'Email the tenant admin when a suspension is applied.')}
          </div>
        </div>
        <p className="st-note pad">Demonstration only — policies are kept in this browser session and are not enforced by a server.</p>
        <div className="st-modal-f"><button type="button" className="st-btn" onClick={onClose}>Cancel</button><button type="submit" className="st-btn primary">Save Policies</button></div>
      </form>
    </Modal>
  );
}
