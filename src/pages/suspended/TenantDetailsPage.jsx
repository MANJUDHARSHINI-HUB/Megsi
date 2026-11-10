import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Building2, CalendarDays, CheckCircle2, ChevronRight, ClipboardCheck, Clock3, CreditCard, Download, Hash,
  Headphones, History, Mail, RefreshCw, ShieldAlert, ShieldCheck, ShieldOff, X,
} from 'lucide-react';
import { REASONS, REVIEW } from '../../data/suspendedData.js';
import {
  NOT_ON_RECORD, SUPPORT_EMAIL, buildTimeline, complianceCategory, daysSuspended, downloadReport, durationLabel, fmtDay, fmtDayTime,
  isActive, money, openSupportEmail, paymentStatus,
} from './tenantDetailsUtils.js';
import './tenant-details-page.css';

const REJECTED = 'Rejected';
const OUTCOMES = [
  [REVIEW.ELIGIBLE, 'Approve for reactivation', 'The reason has been resolved; the tenant can be reactivated.'],
  [REVIEW.INVESTIGATING, 'Keep suspended — investigate', 'More information is needed before a decision.'],
  [REVIEW.CRITICAL, 'Escalate as critical', 'Serious breach or risk; needs senior sign-off.'],
  [REJECTED, 'Reject reactivation request', 'The tenant stays suspended; the reason is not resolved.'],
];
const statusTone = (s) => ({ 'Pending Review': 'pending', 'Under Review': 'review', Critical: 'critical', Rejected: 'critical', 'Eligible for Reactivation': 'eligible', Active: 'active' }[s] || 'pending');
const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const Na = () => <span className="tdp-na">{NOT_ON_RECORD}</span>;
const show = (v) => (v === undefined || v === null || v === '' ? <Na /> : v);
const Badge = ({ status }) => <span className={`tdp-badge ${statusTone(status)}`}>{status}</span>;

function Panel({ title, icon: Icon, action, className = '', children }) {
  return (
    <section className={`tdp-panel ${className}`}>
      <header className="tdp-panel-head"><Icon size={20} aria-hidden="true" /><h2>{title}</h2>{action}</header>
      <div className="tdp-panel-body">{children}</div>
    </section>
  );
}
const Row = ({ label, children }) => <div className="tdp-row"><span className="tdp-k">{label}</span><span className="tdp-v">{children}</span></div>;
const Field = ({ label, children, wide }) => <div className={`tdp-field ${wide ? 'wide' : ''}`}><span className="tdp-k">{label}</span><span className="tdp-v">{children}</span></div>;

function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="tdp-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`tdp-modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="tdp-modal-head"><h3>{title}</h3><button type="button" className="tdp-x" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Review workflow (uses the store's reviewTenant) ---------- */
function ReviewModal({ tenant, onClose, onSave }) {
  const [outcome, setOutcome] = useState(OUTCOMES.some(([v]) => v === tenant.status) ? tenant.status : '');
  const [note, setNote] = useState('');
  const [err, setErr] = useState({});
  const submit = (e) => {
    e.preventDefault();
    const x = {};
    if (!outcome) x.outcome = 'Choose a review outcome.';
    if (note.trim().length < 5) x.note = 'Add a review note (at least 5 characters).';
    setErr(x);
    if (!Object.keys(x).length) onSave(outcome, note.trim());
  };
  return (
    <Modal title="Review Suspension" onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="tdp-modal-body">
          <p className="tdp-modal-intro"><b>{tenant.name}</b> · {tenant.reason} · currently <Badge status={tenant.status} /></p>
          <fieldset className={err.outcome ? 'bad' : ''}>
            <legend>Review outcome</legend>
            {OUTCOMES.map(([v, l, d]) => (
              <label key={v} className={`tdp-radio ${outcome === v ? 'on' : ''}`}>
                <input type="radio" name="outcome" checked={outcome === v} onChange={() => { setOutcome(v); setErr((x) => ({ ...x, outcome: '' })); }} />
                <span><b>{l}</b><small>{d}</small></span>
              </label>
            ))}
            {err.outcome && <em className="tdp-err">{err.outcome}</em>}
          </fieldset>
          <label className="tdp-textfield"><span>Review notes <i>*</i></span>
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Summarise what you checked and why." />
            {err.note && <em className="tdp-err">{err.note}</em>}
          </label>
        </div>
        <div className="tdp-modal-foot"><button type="button" className="tdp-btn" onClick={onClose}>Cancel</button><button type="submit" className="tdp-btn primary"><ClipboardCheck size={16} /> Save Review</button></div>
      </form>
    </Modal>
  );
}

/* ---------- Reactivate confirmation ---------- */
function ReactivateModal({ tenant, onClose, onConfirm }) {
  const [note, setNote] = useState('');
  const approved = tenant.status === REVIEW.ELIGIBLE;
  return (
    <Modal title="Reactivate this tenant?" onClose={onClose}>
      <div className="tdp-modal-body">
        <p>{tenant.name} will be marked as <b>Active</b> and removed from the Suspended Tenants list. This is recorded in the activity history.</p>
        {!approved && <p className="tdp-warn">The review status is <b>{tenant.status}</b>, not Eligible for Reactivation. Confirm only if you are authorised to reactivate this tenant.</p>}
        <label className="tdp-textfield"><span>Reactivation note (optional)</span>
          <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Recorded in the activity history." />
        </label>
      </div>
      <div className="tdp-modal-foot"><button type="button" className="tdp-btn" onClick={onClose}>Cancel</button><button type="button" className="tdp-btn primary" onClick={() => onConfirm(note.trim())}><RefreshCw size={16} /> Confirm Reactivation</button></div>
    </Modal>
  );
}

/* ---------- Suspend confirmation (active tenants only) ---------- */
function SuspendModal({ tenant, onClose, onConfirm }) {
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (note.trim().length < 5) return setErr('Add a suspension note (at least 5 characters).');
    onConfirm(reason, note.trim());
  };
  return (
    <Modal title="Suspend this tenant?" onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="tdp-modal-body">
          <p>{tenant.name} will be marked as suspended and added to the Suspended Tenants list for review.</p>
          <label className="tdp-textfield"><span>Suspension reason</span>
            <select value={reason} onChange={(e) => setReason(e.target.value)}>{REASONS.map((r) => <option key={r}>{r}</option>)}</select>
          </label>
          <label className="tdp-textfield"><span>Suspension note <i>*</i></span>
            <textarea rows={3} value={note} onChange={(e) => { setNote(e.target.value); setErr(''); }} placeholder="Why is this tenant being suspended?" />
            {err && <em className="tdp-err">{err}</em>}
          </label>
        </div>
        <div className="tdp-modal-foot"><button type="button" className="tdp-btn" onClick={onClose}>Cancel</button><button type="submit" className="tdp-btn danger"><ShieldOff size={16} /> Confirm Suspension</button></div>
      </form>
    </Modal>
  );
}

/* ---------- Tenant-specific billing (only this tenant's own fields) ---------- */
function BillingModal({ tenant, onClose }) {
  const rows = [
    ['Subscription plan', tenant.plan], ['Subscription start date', fmtDay(tenant.startDate)], ['Renewal date', fmtDay(tenant.renewal)], ['Billing cycle', 'Monthly'],
    ['Subscription amount', `${money(tenant.price)} / month`], ['Outstanding balance', money(tenant.outstanding)], ['Last payment date', fmtDay(tenant.lastPayment)], ['Payment status', paymentStatus(tenant)],
  ];
  return (
    <Modal title={`Billing — ${tenant.name}`} onClose={onClose}>
      <div className="tdp-modal-body">
        <table className="tdp-table"><tbody>
          {rows.map(([k, v]) => <tr key={k}><th>{k}</th><td className={k === 'Outstanding balance' && tenant.outstanding > 0 ? 'neg' : ''}>{show(v)}</td></tr>)}
        </tbody></table>
        <p className="tdp-modal-note">Tenant ID {tenant.id}. Only the billing details held on this tenant's record are shown; invoice-level records are not available.</p>
      </div>
      <div className="tdp-modal-foot"><button type="button" className="tdp-btn primary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ---------- Complete activity history ---------- */
function ActivityModal({ tenant, timeline, onClose }) {
  return (
    <Modal title={`Activity History — ${tenant.name}`} onClose={onClose} wide>
      <div className="tdp-modal-body tdp-scroll">
        <table className="tdp-table activity"><thead><tr><th>Date</th><th>Activity</th><th>By</th></tr></thead><tbody>
          {timeline.map((t) => <tr key={t.key}><td className="nowrap">{fmtDayTime(t.date, t.time)}</td><td>{t.text}</td><td>{t.by || '—'}</td></tr>)}
        </tbody></table>
      </div>
      <div className="tdp-modal-foot"><span className="tdp-count">{timeline.length} {timeline.length === 1 ? 'event' : 'events'}</span><button type="button" className="tdp-btn primary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ================= Page ================= */
export default function TenantDetailsPage({ tenant, store, onBack, toast, openReview = false }) {
  const [modal, setModal] = useState(openReview ? 'review' : null);
  const active = isActive(tenant);
  const timeline = useMemo(() => buildTimeline(tenant), [tenant]);
  const days = daysSuspended(tenant);
  const say = (m) => toast && toast(m);
  const close = () => setModal(null);
  const hasSuspension = Boolean(tenant.suspendedDate);

  const onContact = () => { const how = openSupportEmail(tenant); say(how === 'gmail' ? 'Opening Gmail to contact MEGSI Support.' : 'Opening your email app to contact MEGSI Support.'); };
  const onDownload = () => { downloadReport(tenant); say(`Report downloaded for ${tenant.name}.`); };

  return (
    <div className="tdp">
      <div className="tdp-top">
        <button type="button" className="tdp-btn" onClick={onBack}><ArrowLeft size={16} /> Back to Suspended Tenants</button>
        <span className={`tdp-state ${active ? 'ok' : 'bad'}`}>{active ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}{active ? 'Active' : 'Suspended'}</span>
      </div>
      <h1 className="tdp-title">{tenant.name}</h1>
      <p className="tdp-subtitle">Suspended Tenant Details and Activity Overview</p>

      <div className="tdp-kpis">
        <div className="tdp-kpi"><div className="tdp-kpi-top"><span className="tdp-kpi-icon blue"><Hash size={18} /></span><span className="tdp-k">Tenant ID</span></div><strong>{tenant.id}</strong></div>
        <div className="tdp-kpi"><div className="tdp-kpi-top"><span className="tdp-kpi-icon green"><CalendarDays size={18} /></span><span className="tdp-k">{active ? 'Last Suspension' : 'Suspension Date'}</span></div><strong>{hasSuspension ? fmtDay(tenant.suspendedDate) : 'Never'}</strong></div>
        <div className="tdp-kpi"><div className="tdp-kpi-top"><span className="tdp-kpi-icon purple"><Clock3 size={18} /></span><span className="tdp-k">Suspension Duration</span></div><strong>{active ? 'Not suspended' : durationLabel(days)}</strong></div>
        <div className="tdp-kpi"><div className="tdp-kpi-top"><span className="tdp-kpi-icon orange"><ShieldCheck size={18} /></span><span className="tdp-k">Current Status</span></div><strong className="status">{tenant.status}</strong></div>
      </div>

      <div className="tdp-grid">
        <Panel title="Company Information" icon={Building2}>
          <div className="tdp-company">
            <div className="tdp-logo" aria-hidden="true"><Building2 size={30} /><b>{initials(tenant.name)}</b></div>
            <div className="tdp-rows">
              <Row label="Company Name">{tenant.name}</Row>
              <Row label="Business Type">{show(tenant.businessType)}</Row>
              <Row label="Registration No.">{show(tenant.registrationNumber)}</Row>
              <Row label="Industry">{show(tenant.industry)}</Row>
              <Row label="Administrator">{show(tenant.admin || tenant.contact)}</Row>
              <Row label="Email">{show(tenant.email)}</Row>
              <Row label="Phone">{show(tenant.phone)}</Row>
              <Row label="Address">{show(tenant.address)}</Row>
            </div>
          </div>
        </Panel>

        <Panel title="Suspension Details" icon={ShieldAlert}>
          <div className="tdp-suspension">
            <div className="tdp-rows">
              <Row label="Reason">{show(hasSuspension ? tenant.reason : '')}</Row>
              <Row label="Suspended By">{show(hasSuspension ? tenant.suspendedBy : '')}</Row>
              <Row label="Suspension Date">{show(fmtDayTime(tenant.suspendedDate))}</Row>
              <Row label="Expected Review">{show(fmtDay(tenant.reviewDate))}</Row>
              <Row label="Status"><Badge status={tenant.status} /></Row>
              <Row label="Notes">{show(hasSuspension ? tenant.notes : '')}</Row>
            </div>
            <aside className={`tdp-notice ${active ? 'ok' : ''}`}>
              {active ? <CheckCircle2 size={22} /> : <ShieldAlert size={22} />}
              <h3>{active ? 'Tenant is Active' : 'Important Notice'}</h3>
              <p>{active ? 'This tenant has been reactivated and has full access. It can be suspended again if required.' : 'This tenant is currently suspended. Access is restricted until the review is complete.'}</p>
            </aside>
          </div>
        </Panel>

        <Panel title="Subscription & Billing" icon={CreditCard} action={<button type="button" className="tdp-head-btn" onClick={() => setModal('billing')}><CreditCard size={15} /> View Billing</button>}>
          <div className="tdp-fields">
            <Field label="Subscription Plan">{show(tenant.plan)}</Field>
            <Field label="Billing Cycle">Monthly</Field>
            <Field label="Subscription Start">{show(fmtDay(tenant.startDate))}</Field>
            <Field label="Renewal / End Date">{show(fmtDay(tenant.renewal))}</Field>
            <Field label="Subscription Amount">{money(tenant.price)} / month</Field>
            <Field label="Outstanding Balance"><b className={tenant.outstanding > 0 ? 'neg' : ''}>{money(tenant.outstanding)}</b></Field>
            <Field label="Last Payment Date">{show(fmtDay(tenant.lastPayment))}</Field>
            <Field label="Payment Status"><span className={`tdp-pay ${tenant.outstanding > 0 ? 'due' : 'paid'}`}>{paymentStatus(tenant)}</span></Field>
          </div>
        </Panel>

        <Panel title="Activity Timeline" icon={History} action={<button type="button" className="tdp-head-btn" onClick={() => setModal('activity')}>View All <ChevronRight size={15} /></button>}>
          <ol className="tdp-timeline">
            {timeline.slice(0, 4).map((t) => (
              <li key={t.key} className={t.kind}>
                <span className="tdp-dot" />
                <div><span className="tdp-k">{fmtDayTime(t.date, t.time)}</span><p>{t.text}</p>{t.by && <small>{t.by}</small>}</div>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel title="Compliance / Review Status" icon={ClipboardCheck}>
          <div className="tdp-fields">
            <Field label="Review Status"><Badge status={tenant.status} /></Field>
            <Field label="Compliance Category">{complianceCategory(tenant)}</Field>
            <Field label="Assigned Reviewer">{show(tenant.reviewBy)}</Field>
            <Field label="Review Date">{show(fmtDay(tenant.reviewDate))}</Field>
            <Field label="Last Reviewed">{tenant.reviewedOn ? `${fmtDayTime(tenant.reviewedOn)} · ${tenant.reviewedBy}` : 'Not reviewed yet'}</Field>
            <Field label="Review Notes" wide>{tenant.reviewNote || <span className="tdp-na">No review notes recorded yet</span>}</Field>
          </div>
        </Panel>

        <Panel title="Support & Actions" icon={Headphones}>
          <div className="tdp-actions">
            <button type="button" className="tdp-btn primary" onClick={onContact} title={`Email ${SUPPORT_EMAIL}`}><Mail size={16} /> Contact Support</button>
            <button type="button" className="tdp-btn" onClick={onDownload}><Download size={16} /> Download Report</button>
            <button type="button" className="tdp-btn" onClick={() => setModal('review')} disabled={active} title={active ? 'Only suspended tenants can be reviewed' : ''}><ClipboardCheck size={16} /> Review Suspension</button>
            {active
              ? <button type="button" className="tdp-btn danger" onClick={() => setModal('suspend')}><ShieldOff size={16} /> Suspend Tenant</button>
              : <button type="button" className="tdp-btn success" onClick={() => setModal('reactivate')}><RefreshCw size={16} /> Reactivate Tenant</button>}
          </div>
          <p className="tdp-support-note">Support requests go to <b>{SUPPORT_EMAIL}</b>.</p>
        </Panel>
      </div>

      {modal === 'review' && <ReviewModal tenant={tenant} onClose={close} onSave={(outcome, note) => { store.reviewTenant(tenant, outcome, note); close(); say(`Review saved — ${tenant.name} is now "${outcome}".`); }} />}
      {modal === 'reactivate' && <ReactivateModal tenant={tenant} onClose={close} onConfirm={(note) => { store.reactivate([tenant], note); close(); say(`${tenant.name} has been reactivated.`); }} />}
      {modal === 'suspend' && <SuspendModal tenant={tenant} onClose={close} onConfirm={(reason, note) => { store.suspendTenant(tenant, reason, note); close(); say(`${tenant.name} has been suspended.`); }} />}
      {modal === 'billing' && <BillingModal tenant={tenant} onClose={close} />}
      {modal === 'activity' && <ActivityModal tenant={tenant} timeline={timeline} onClose={close} />}
    </div>
  );
}
