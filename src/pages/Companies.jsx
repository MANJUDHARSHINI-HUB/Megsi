import { useEffect, useMemo, useRef, useState } from 'react';

import { createPortal } from 'react-dom';

import { ArrowDown, ArrowUp, AlertTriangle, Ban, Building2, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock, Download, FileText, MapPin, MoreHorizontal, Pencil, Plus, Search, Trash2, Users, X, CalendarDays, CreditCard, Mail, Phone, RefreshCw, ShieldCheck, Globe, Activity, CircleDollarSign, MessageCircle, Database, FileCheck, Bell, Send, ExternalLink, UserRound, Landmark } from 'lucide-react';

import { Avatar, PlanBadge, StatusBadge } from '../components/Common.jsx';

import { useI18n } from '../i18n/I18nContext.jsx';

import CompanyDetails from './CompanyDetails.jsx';
import { COMPANY_ROWS, INDUSTRIES, PLANS, PLAN_INFO, STATUSES, TENURES, RENEWAL_FILTERS } from '../data/companiesData.js';

import './companies.css';
import './companyDetails.css';



const PAGE_SIZE = 8;

const money = (n) => `£${Number(n || 0).toLocaleString('en-GB')}`;
const digits = (v) => String(v || '').replace(/\D/g, '');

const COLS = [['name', 'Company Name'], ['industry', 'Industry'], ['location', 'Location'], ['plan', 'Package'], ['billingTenure', 'Billing Tenure'], ['joiningDate', 'Company Joining Date'], ['renewalDate', 'Renewal Date'], ['renewalState', 'Renewal Status'], ['revenue', 'Revenue']];

const todayIso = () => new Date().toISOString().slice(0, 10);

const EMPTY_FORM = { name: '', contact: '', email: '', phone: '', whatsapp: '', callingPhone: '', address: '', location: '', licenseNumber: '', vatNumber: '', industry: INDUSTRIES[0], plan: 'Starter', billingTenure: 'Monthly', status: 'Active', users: '0', sites: '0', subscriptionStartDate: todayIso(), joiningDate: todayIso() };

const planBaseRevenue = { Starter: 149, Professional: 299, Business: 499, Enterprise: 899 };
const companySeed = (company) => String(company.id ?? company.name ?? 'tenant').split('').reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) % 997, 17);
const mockRevenueFor = (company) => Math.round(((planBaseRevenue[company.plan] || 199) + (Number(company.id) || companySeed(company)) * 17 + (companySeed(company) % 13) + (Number(company.users) || 0) * 0.25) * 100) / 100;
const monthDate = (offset) => { const d = new Date(); d.setDate(5); d.setMonth(d.getMonth() - offset); return d.toISOString().slice(0, 10); };
const withCompanyMockData = (company) => {
  const revenue = company.status === 'Trial' ? 0 : mockRevenueFor(company);
  const paymentHistory = company.paymentHistory?.length ? company.paymentHistory : Array.from({ length: 6 }, (_, i) => ({
    id: `PAY-${company.id}-${String(i + 1).padStart(3, '0')}`, date: monthDate(i), amount: revenue,
    method: ['Bank Transfer', 'Card', 'Direct Debit'][companySeed(company) % 3],
    reference: `MEG-${companySeed(company)}-${i + 1}`, status: company.status === 'Suspended' && i === 0 ? 'Pending' : 'Paid'
  }));
  const invoices = company.invoices?.length ? company.invoices : Array.from({ length: 3 }, (_, i) => ({
    id: `INV-${company.id}-${String(240 + i).padStart(4, '0')}`, createdAt: monthDate(i), dueDate: monthDate(i - 1),
    amount: revenue, description: `${company.plan || 'Starter'} subscription – ${i === 0 ? 'Current' : 'Monthly'} billing`,
    status: company.status === 'Suspended' && i === 0 ? 'Overdue' : i === 1 ? 'Paid' : 'Pending'
  }));
  const billingHistory = company.billingHistory?.length ? company.billingHistory : [
    { date: monthDate(0), type: 'Subscription renewal', description: `${company.plan} plan renewal`, amount: revenue, status: company.status === 'Suspended' ? 'Payment review' : 'Paid' },
    { date: monthDate(1), type: 'Invoice generated', description: 'Monthly subscription invoice', amount: revenue, status: 'Paid' },
    { date: monthDate(2), type: 'Plan billing', description: `${company.billingTenure || 'Monthly'} billing cycle`, amount: revenue, status: 'Paid' }
  ];
  return { ...company, revenue, paymentHistory, invoices, billingHistory };
};




/* ---------- Row action menu (position: fixed so the table scroll area never clips it) ---------- */

function RenewalBadge({ company }) {

  const state = company.renewalState || 'Active';

  const Icon = state === 'Active' ? CheckCircle2 : state === 'Overdue' ? AlertTriangle : Clock;

  return <span className={`cp-renewal-badge ${state === 'Active' ? 'active' : state === 'Overdue' ? 'overdue' : 'due'}`}><Icon size={13} />{company.renewalStatusLabel || state}</span>;

}



function RowMenu({ company, onAction }) {

  const [pos, setPos] = useState(null);

  const btn = useRef(null);

  useEffect(() => {

    if (!pos) return;

    const close = () => setPos(null);

    const down = (e) => { if (!e.target.closest('.cp-menu') && !btn.current?.contains(e.target)) close(); };

    const key = (e) => e.key === 'Escape' && close();

    document.addEventListener('mousedown', down); document.addEventListener('keydown', key);

    window.addEventListener('scroll', close, true); window.addEventListener('resize', close);

    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };

  }, [pos]);

  const toggle = () => {

    if (pos) return setPos(null);

    const r = btn.current.getBoundingClientRect(); const h = 235;

    setPos({ top: r.bottom + 4 + h > window.innerHeight ? Math.max(8, r.top - h - 4) : r.bottom + 4, left: Math.max(8, r.right - 190) });

  };

  const run = (a) => { setPos(null); onAction(a, company); };

  const suspended = company.status === 'Suspended';

  return (

    <>

      <button ref={btn} className="dots" aria-label={`Actions for ${company.name}`} aria-haspopup="menu" aria-expanded={!!pos} onClick={toggle}><MoreHorizontal size={16} /></button>

      {pos && createPortal(

        <div className="cp-menu" role="menu" style={{ top: pos.top, left: pos.left }}>

          <button role="menuitem" onClick={() => run('view')}><FileText size={15} />View Details</button>

          <button role="menuitem" onClick={() => run('sites')}><MapPin size={15} />View Sites</button>

          <button role="menuitem" onClick={() => run('invoices')}><FileText size={15} />View Invoices</button>

          <button role="menuitem" onClick={() => run('plan')}><Landmark size={15} />Change Plan</button>

          <button role="menuitem" onClick={() => run('edit')}><Pencil size={15} />Edit Company</button>

          {suspended

            ? <button role="menuitem" className="ok-i" onClick={() => run('reactivate')}><CheckCircle2 size={15} />Reactivate Company</button>

            : <button role="menuitem" className="danger" onClick={() => run('suspend')}><Ban size={15} />Suspend Company</button>}

        </div>, document.body)}

    </>

  );

}



/* ---------- Generic modal shell ---------- */

function Modal({ title, onClose, children }) {

  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, [onClose]);

  return (

    <div className="cp-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>

      <div className="cp-modal" role="dialog" aria-modal="true" aria-label={title}>

        <div className="cp-modal-h"><h3>{title}</h3><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button></div>

        {children}

      </div>

    </div>

  );

}



/* ---------- Add / Edit form ---------- */

function CompanyForm({ company, rows, onSave, onClose }) {

  const [f, setF] = useState(company ? { ...EMPTY_FORM, ...company, users: String(company.users), sites: String(company.sites) } : EMPTY_FORM);

  const [err, setErr] = useState({});

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const validate = () => {

    const e = {}; const lim = PLAN_INFO[f.plan];

    if (!f.name.trim()) e.name = 'Company name is required.';

    else if (rows.some((r) => r.id !== company?.id && r.name.toLowerCase() === f.name.trim().toLowerCase())) e.name = 'A company with this name already exists.';

    if (!f.contact.trim()) e.contact = 'Contact person is required.';

    if (!f.email.trim()) e.email = 'Email address is required.';

    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Enter a valid email address.';

    ['phone', 'callingPhone', 'whatsapp'].forEach((key) => {

      if (f[key]?.trim() && !/^[+()\d\s-]{7,20}$/.test(f[key].trim())) e[key] = 'Enter a valid phone number.';

    });

    if (!f.joiningDate) e.joiningDate = 'Company joining date is required.';

    if (!f.subscriptionStartDate) e.subscriptionStartDate = 'Subscription starting date is required.';

    else if (f.joiningDate && f.subscriptionStartDate < f.joiningDate) e.subscriptionStartDate = 'Subscription cannot start before the company joined.';

    [['users', 'Users'], ['sites', 'Sites']].forEach(([k, label]) => {

      if (!/^\d+$/.test(f[k].trim())) e[k] = `${label} must be a whole number (0 or more).`;

      else if (lim[k] && +f[k] > lim[k]) e[k] = `${f.plan} plan allows up to ${lim[k]} ${label.toLowerCase()}.`;

    });

    return e;

  };

  const submit = (ev) => {

    ev.preventDefault();

    const e = validate(); setErr(e);

    if (Object.keys(e).length) return;

    onSave({ ...f, name: f.name.trim(), contact: f.contact.trim(), email: f.email.trim(), phone: f.phone.trim(), callingPhone: f.callingPhone.trim(), whatsapp: f.whatsapp.trim(), address: f.address.trim(), location: f.location.trim(), licenseNumber: f.licenseNumber.trim(), vatNumber: f.vatNumber.trim(), users: +f.users, sites: +f.sites });

  };

  const field = (k, label, props = {}) => (

    <label className={`cp-field ${err[k] ? 'bad' : ''}`}><span>{label}{props.req && <i> *</i>}</span>

      <input value={f[k]} onChange={set(k)} placeholder={props.ph} inputMode={props.mode} autoFocus={props.focus} />

      {err[k] && <em className="err">{err[k]}</em>}</label>

  );

  const dateField = (k, label) => (

    <label className={`cp-field ${err[k] ? 'bad' : ''}`}><span>{label}<i> *</i></span>

      <input type="date" value={f[k] || ''} onChange={set(k)} />

      {err[k] && <em className="err">{err[k]}</em>}</label>

  );

  const sel = (k, label, opts) => (

    <label className="cp-field"><span>{label}</span><span className="cp-select"><select value={f[k]} onChange={set(k)}>{opts.map((o) => <option key={o}>{o}</option>)}</select><ChevronDown size={14} /></span></label>

  );

  return (

    <form onSubmit={submit} noValidate>

      <div className="cp-modal-b cp-grid">

        {field('name', 'Company name', { req: true, ph: 'e.g. Sentinel Watch UK', focus: true })}

        {field('contact', 'Contact person', { req: true, ph: 'e.g. Sarah Johnson' })}

        {field('email', 'Email address', { req: true, ph: 'name@company.co.uk' })}

        {field('address', 'Address', { ph: 'Building, street, area' })}

        {field('location', 'Location / City', { ph: 'e.g. London, UK' })}

        {field('callingPhone', 'Phone number (Calling)', { ph: '+44 20 7946 0000' })}

        {field('whatsapp', 'Phone number (WhatsApp)', { ph: '+44 7700 900000' })}

        {field('licenseNumber', 'License number (SIANO)', { ph: 'Enter SIANO license number' })}

        {field('vatNumber', 'VAT number', { ph: 'Enter VAT registration number' })}

        {field('phone', 'Primary phone number', { ph: '+44 20 7946 0000' })}

        {sel('industry', 'Industry', INDUSTRIES)}

        {sel('plan', 'Subscription plan', PLANS)}

        {sel('billingTenure', 'Billing tenure', TENURES)}

        {dateField('subscriptionStartDate', 'Subscription starting date')}

        {dateField('joiningDate', 'Company joining date')}

        {field('users', 'Number of users', { mode: 'numeric' })}

        {field('sites', 'Number of sites', { mode: 'numeric' })}

        {sel('status', 'Company status', STATUSES)}

      </div>

      <p className="cp-note">Demonstration only — changes are kept in this browser session and are not saved to a server.</p>

      <div className="cp-modal-f"><button type="button" className="btn-sm big" onClick={onClose}>Cancel</button><button type="submit" className="btn-primary">{company ? 'Save Changes' : 'Add Company'}</button></div>

    </form>

  );

}



/* ---------- Company workflow modals ---------- */

function InvoiceModal({ company, onClose, onSave }) {

  const [amount, setAmount] = useState('');

  const [description, setDescription] = useState('');

  const [dueDate, setDueDate] = useState(todayIso());

  const [status, setStatus] = useState('Pending');

  const submit = (event) => {

    event.preventDefault();

    if (!amount || Number(amount) <= 0 || !description.trim() || !dueDate) return;

    onSave({ amount: Number(amount), description: description.trim(), dueDate, status });

  };

  return <Modal title={`Add Invoice – ${company.name}`} onClose={onClose}><form onSubmit={submit}><div className="cp-modal-b cp-grid">

    <label className="cp-field"><span>Company</span><input value={company.name} readOnly /></label>

    <label className="cp-field"><span>Invoice amount (£) *</span><input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required /></label>

    <label className="cp-field"><span>Description *</span><input value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Invoice description" /></label>

    <label className="cp-field"><span>Due date *</span><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required /></label>

    <label className="cp-field"><span>Invoice status</span><select value={status} onChange={(e) => setStatus(e.target.value)}><option>Pending</option><option>Paid</option><option>Overdue</option><option>Draft</option></select></label>

  </div><p className="cp-backend-note">This invoice is added to the selected company in the current frontend state. Shared Tenant Billing storage requires integration with that module's data source.</p><div className="cp-modal-f"><button type="button" className="btn-sm big" onClick={onClose}>Cancel</button><button type="submit" className="btn-primary">Create Invoice</button></div></form></Modal>;

}




function HistoryModal({ company, type, onClose, fmtDate }) {
  const title = type === 'payments' ? `Payment History – ${company.name}` : type === 'billing' ? `Billing History – ${company.name}` : `Invoices – ${company.name}`;
  const records = type === 'payments' ? (company.paymentHistory || []) : type === 'billing' ? (company.billingHistory || []) : (company.invoices || []);
  const dateOf = (item) => item.date || item.createdAt || item.dueDate;
  return (
    <Modal title={title} onClose={onClose}>
      <div className="cp-history-modal">
        <div className="cp-history-summary">
          <span><small>Company</small><strong>{company.name}</strong></span>
          <span><small>Revenue</small><strong>{money(company.revenue || 0)}</strong></span>
          <span><small>Records</small><strong>{records.length}</strong></span>
        </div>
        <div className="cp-history-table-wrap"><table className="cp-history-table">
          <thead><tr><th>Date</th><th>{type === 'payments' ? 'Reference' : type === 'invoices' ? 'Invoice / Description' : 'Activity'}</th><th>{type === 'payments' ? 'Method' : 'Amount'}</th><th>Status</th>{type === 'invoices' && <th>Due date</th>}</tr></thead>
          <tbody>{records.map((item, index) => <tr key={item.id || `${dateOf(item)}-${index}`}>
            <td>{fmtDate(dateOf(item))}</td>
            <td>{type === 'payments' ? item.reference : type === 'invoices' ? `${item.id} · ${item.description}` : `${item.type} · ${item.description}`}</td>
            <td>{type === 'payments' ? item.method : money(item.amount || 0)}</td>
            <td><span className={`cp-history-status ${String(item.status).toLowerCase().replace(/\s+/g, '-')}`}>{item.status}</span></td>
            {type === 'invoices' && <td>{fmtDate(item.dueDate)}</td>}
          </tr>)}</tbody>
        </table></div>
        <p className="cp-backend-note">Sample demonstration records for this company. They are stored in the current frontend state and are not connected to a live payment provider.</p>
      </div>
      <div className="cp-modal-f"><button className="btn-primary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

function PlanModal({ company, onClose, onSave }) {

  const [plan, setPlan] = useState(company.plan || PLANS[0]);

  const [billingTenure, setBillingTenure] = useState(company.billingTenure || 'Monthly');

  const [effectiveDate, setEffectiveDate] = useState(todayIso());

  const currentPrice = company.revenue || PLAN_INFO[company.plan]?.price || 0;

  const nextPrice = PLAN_INFO[plan]?.price ?? currentPrice;

  return <Modal title={`Change Plan – ${company.name}`} onClose={onClose}><div className="cp-modal-b"><div className="cp-plan-comparison"><div><small>Current plan</small><strong>{company.plan}</strong><b>{money(currentPrice)}</b></div><div><small>New plan</small><strong>{plan}</strong><b>{money(nextPrice)}</b></div></div>

    <div className="cp-action-form"><label className="cp-field"><span>Available plan</span><select value={plan} onChange={(e) => setPlan(e.target.value)}>{PLANS.map((item) => <option key={item}>{item}</option>)}</select></label><label className="cp-field"><span>Billing frequency</span><select value={billingTenure} onChange={(e) => setBillingTenure(e.target.value)}><option>Monthly</option><option>Annual</option></select></label><label className="cp-field"><span>Current subscription end date</span><input value={company.renewalDate || 'Not set'} readOnly /></label><label className="cp-field"><span>Effective date</span><input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} /></label></div>

    <p className="cp-backend-note"><b>Refund policy:</b> The previous plan will be retained in subscription history. No automatic refund or customer charge will be processed for the unused period. Confirm the applicable contract and billing policy before applying this change.</p></div><div className="cp-modal-f"><button className="btn-sm big" onClick={onClose}>Cancel</button><button className="btn-primary" disabled={!plan || !effectiveDate} onClick={() => onSave({ plan, billingTenure, effectiveDate })}>Confirm Plan Change</button></div></Modal>;

}



function MessageModal({ company, onClose, onSend }) {
  const templates = {
    'Renewal Reminder': { subject: 'Subscription Renewal Reminder – MEGSI', body: `Dear ${company.contact || 'Client'},\n\nYour MEGSI subscription is approaching its expiry date.\n\nPlease renew your subscription using the link below to continue enjoying uninterrupted services.\n\nRenew Now: [Subscription Link]\n\nThank you,\nMEGSI Team` },
    'Penalty Notice': { subject: 'Subscription Expired – Penalty Notice', body: `Dear ${company.contact || 'Client'},\n\nYour MEGSI subscription has expired, and the grace period has ended.\n\nA penalty of [Penalty Amount] has been applied according to your subscription policy.\n\nPlease complete your renewal using the link below.\n\nRenew Now: [Subscription Link]\n\nThank you,\nMEGSI Team` },
    'Suspension Notice': { subject: 'Account Suspension Notice – MEGSI', body: `Dear ${company.contact || 'Client'},\n\nYour company account has been suspended due to the following reason:\n\n${company.suspensionReason || '[Reason for Suspension]'}\n\nPlease contact the MEGSI administration team for assistance.\n\nThank you,\nMEGSI Team` },
    'General Message': { subject: `MEGSI Platform – ${company.name}`, body: `Dear ${company.contact || 'Client'},\n\n\n\nThank you,\nMEGSI Team` },
  };
  const waDefault = company.whatsapp || company.callingPhone || company.phone || '';
  const [channel, setChannel] = useState('email');
  const [template, setTemplate] = useState('Renewal Reminder');
  const [subject, setSubject] = useState(templates['Renewal Reminder'].subject);
  const [body, setBody] = useState(templates['Renewal Reminder'].body);
  const [emailTo, setEmailTo] = useState(company.email || '');
  const [waTo, setWaTo] = useState(waDefault);
  const [state, setState] = useState({ status: 'idle', message: '' });
  const selectTemplate = (value) => { setTemplate(value); setSubject(templates[value].subject); setBody(templates[value].body); };
  const isEmail = channel === 'email';
  const busy = state.status === 'loading';
  const submit = async () => {
    const to = (isEmail ? emailTo : waTo).trim();
    if (!to) return setState({ status: 'error', message: `Enter a ${isEmail ? 'recipient email address' : 'WhatsApp number'} before continuing.` });
    if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return setState({ status: 'error', message: 'Enter a valid email address.' });
    if (!isEmail && digits(to).length < 7) return setState({ status: 'error', message: 'Enter a valid WhatsApp number including the country code.' });
    if (isEmail && !subject.trim()) return setState({ status: 'error', message: 'Enter a subject.' });
    if (!body.trim()) return setState({ status: 'error', message: 'Enter a message.' });
    setState({ status: 'loading', message: '' });
    try {
      await new Promise((resolve) => setTimeout(resolve, 450));
      onSend({ channel, template, subject: isEmail ? subject.trim() : template, body, to });
      setState({ status: 'success', message: `A ${isEmail ? 'email' : 'WhatsApp'} draft for ${to} was opened in your ${isEmail ? 'email' : 'WhatsApp'} app and logged as "Draft prepared". MEGSI has not sent it — delivery requires a messaging backend.` });
    } catch (err) {
      setState({ status: 'error', message: 'The draft could not be prepared. Please try again.' });
    }
  };
  return (
    <Modal title={`Send Message – ${company.name}`} onClose={onClose}>
      <div className="cp-modal-b">
        <div className="cp-msg-channels" role="radiogroup" aria-label="Message channel">
          <button type="button" role="radio" aria-checked={isEmail} className={`cp-channel email ${isEmail ? 'active' : ''}`} onClick={() => { setChannel('email'); setState({ status: 'idle', message: '' }); }}>
            <span className="cp-channel-ic"><Mail size={18} /></span><span className="cp-channel-t"><strong>Email</strong><small>{emailTo || 'No email on file'}</small></span><CheckCircle2 size={18} className="cp-channel-check" />
          </button>
          <button type="button" role="radio" aria-checked={!isEmail} className={`cp-channel whatsapp ${!isEmail ? 'active' : ''}`} onClick={() => { setChannel('whatsapp'); setState({ status: 'idle', message: '' }); }}>
            <span className="cp-channel-ic"><MessageCircle size={18} /></span><span className="cp-channel-t"><strong>WhatsApp</strong><small>{waTo || 'No number on file'}</small></span><CheckCircle2 size={18} className="cp-channel-check" />
          </button>
        </div>
        <div className="cp-msg-form">
          <label className="cp-field"><span>Message template</span><select value={template} onChange={(e) => selectTemplate(e.target.value)}>{Object.keys(templates).map((name) => <option key={name}>{name}</option>)}</select></label>
          {isEmail
            ? <label className="cp-field"><span>Recipient email</span><input type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="name@company.co.uk" /></label>
            : <label className="cp-field"><span>WhatsApp number</span><input type="tel" value={waTo} onChange={(e) => setWaTo(e.target.value)} placeholder="+44 7700 900000" /></label>}
          {isEmail && <label className="cp-field full"><span>Subject</span><input value={subject} onChange={(e) => setSubject(e.target.value)} /></label>}
          <label className="cp-field full"><span>Message</span><textarea rows={9} value={body} onChange={(e) => setBody(e.target.value)} /></label>
        </div>
        {state.status === 'error' && <div className="cp-msg-alert error" role="alert"><AlertTriangle size={16} />{state.message}</div>}
        {state.status === 'success' && <div className="cp-msg-alert success" role="status"><CheckCircle2 size={16} />{state.message}</div>}
        {state.status !== 'success' && <p className="cp-backend-note">Selecting Prepare opens a prefilled draft in the device's email or WhatsApp application. Direct delivery and communication-provider credentials require backend integration.</p>}
      </div>
      <div className="cp-modal-f">
        {state.status === 'success'
          ? <button type="button" className="btn-primary" onClick={onClose}>Close</button>
          : <><button type="button" className="btn-sm big" onClick={onClose} disabled={busy}>Cancel</button><button type="button" className="btn-primary" onClick={submit} disabled={busy}>{busy ? <><span className="cp-spinner" />&nbsp;Preparing…</> : <><Send size={14} />&nbsp;Prepare {isEmail ? 'Email' : 'WhatsApp'}</>}</button></>}
      </div>
    </Modal>
  );
}



/* ---------- Main page ---------- */

export default function Companies({ toast, onNavigate }) {

  const { fmtDate } = useI18n();

  const [rows, setRows] = useState(() => COMPANY_ROWS.map(withCompanyMockData));

  const [q, setQ] = useState(''); const [plan, setPlan] = useState('All'); const [tenure, setTenure] = useState('All'); const [renewalStatus, setRenewalStatus] = useState('All');

  const [sort, setSort] = useState({ k: 'renewalDate', dir: 1 });

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const loadMoreRef = useRef(null);

  const [modal, setModal] = useState(null);

  const [detail, setDetail] = useState(null);

  const [detailView, setDetailView] = useState('overview');
  const openDetail = (c, view = 'overview') => { setDetailView(view); setDetail(c); };



  const filtered = useMemo(() => {

  const s = q.trim().toLowerCase();



  const list = rows.filter((r) =>

    (plan === 'All' || r.plan === plan) &&

    (tenure === 'All' || r.billingTenure === tenure) &&

    (renewalStatus === 'All' || r.renewalState === renewalStatus) &&

    (

      !s ||

      [r.name, r.contact, r.plan, r.industry, r.location, r.code, r.email]

        .some((v) => String(v ?? '').toLowerCase().includes(s))

    )

  );



  return [...list].sort((a, b) => {

    const x = a[sort.k];

    const y = b[sort.k];



    if (x == null || y == null) {

      return 0;

    }



    const result =

      typeof x === 'string'

        ? x.localeCompare(String(y))

        : Number(x) - Number(y);



    return result * sort.dir;

  });

}, [rows, q, plan, tenure, renewalStatus, sort]);



  const shown = filtered.slice(0, visibleCount);

  const hasMore = shown.length < filtered.length;

  useEffect(() => {

    const node = loadMoreRef.current;

    if (!node || !hasMore || detail) return undefined;

    const observer = new IntersectionObserver((entries) => {

      if (entries[0].isIntersecting) setVisibleCount((n) => Math.min(n + PAGE_SIZE, filtered.length));

    }, { rootMargin: '0px' });

    observer.observe(node);

    return () => observer.disconnect();

  }, [hasMore, filtered.length, detail]);



  const filtersOn = q || plan !== 'All' || tenure !== 'All' || renewalStatus !== 'All';



  const count = (fn) => rows.filter(fn).length;

  const kpis = [

    { t: 'Total Companies', v: rows.length, c: 'blue', I: Building2, ch: 12, d: 'Active tenants' },

    { t: 'Active Companies', v: count((r) => r.status === 'Active'), c: 'green', I: Users, ch: 9, d: 'Currently active' },

    { t: 'Trial Companies', v: count((r) => r.status === 'Trial'), c: 'orange', I: Clock, ch: 25, d: 'In trial period' },

    { t: 'Suspended Companies', v: count((r) => r.status === 'Suspended'), c: 'red', I: Ban, ch: -40, d: 'Currently suspended' },

    { t: 'Renewals Due', v: rows.filter((r) => { const d = new Date(r.renewalDate || '2026-11-15'); const days = Math.ceil((d - new Date('2026-10-30T00:00:00')) / 86400000); return days >= 0 && days <= 30; }).length, c: 'teal', I: Clock, ch: 0, d: 'In the next 30 days' },

  ];



  const withReset = (fn) => (v) => { fn(v); setVisibleCount(PAGE_SIZE); };

  const clear = () => { setQ(''); setPlan('All'); setTenure('All'); setRenewalStatus('All'); setVisibleCount(PAGE_SIZE); };

  const sortBy = (k) => { setSort((s) => ({ k, dir: s.k === k ? -s.dir : 1 })); setVisibleCount(PAGE_SIZE); };



  const exportCsv = () => {

    const head = ['Company ID', 'Company Name', 'Industry', 'Plan', 'Users', 'Sites', 'Status', 'Billing Tenure', 'Subscription Starting Date', 'Company Joining Date', 'Renewal Date', 'Revenue (GBP)', 'Contact', 'Email', 'Address', 'Location', 'Calling Phone', 'WhatsApp', 'SIANO License', 'VAT Number'];

    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;

    const lines = filtered.map((r) => [r.code, r.name, r.industry, r.plan, r.users, r.sites, r.status, r.billingTenure, r.subscriptionStartDate, r.joiningDate, r.renewalDate, r.revenue, r.contact, r.email, r.address, r.location, r.callingPhone, r.whatsapp, r.licenseNumber, r.vatNumber].map(esc).join(','));

    const url = URL.createObjectURL(new Blob([[head.map(esc).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' }));

    const a = document.createElement('a'); a.href = url; a.download = 'megsi-companies.csv'; a.click(); URL.revokeObjectURL(url);

    toast(`Exported ${filtered.length} companies to megsi-companies.csv (demo data).`);

  };



  const limitRows = (c, key, label) => {

    const lim = PLAN_INFO[c.plan][key];

    return [[`Registered ${label}`, c[key]], [`${c.plan} plan limit`, lim ?? 'Unlimited'], ['Usage of limit', lim ? `${Math.round((c[key] / lim) * 100)}%` : 'No limit'], ['Status', <StatusBadge v={c.status} />]];

  };

  const navigateTenantBilling = (company) => {
    setModal(null);
    if (typeof onNavigate === 'function') { onNavigate('billing', company.name); return; }
    const target = document.querySelector('[data-page="billing"], [data-page="tenant-billing"], [data-nav="billing"]')
      || [...document.querySelectorAll('button, a')].find((node) => /tenant billing/i.test(node.textContent || ''));
    if (target) target.click();
    window.dispatchEvent(new CustomEvent('megsi:navigate', { detail: { page: 'billing', companyId: company.id } }));
    toast?.(`Tenant Billing navigation requested for ${company.name}.`);
  };

  const onAction = (a, c) => {

    if (a === 'view') { openDetail(c); return; }

    if (a === 'sites') { openDetail(c, 'sites'); return; }

    if (a === 'edit') { setModal({ type: 'form', company: c }); return; }

    if (a === 'invoices') { navigateTenantBilling(c); return; }

    if (a === 'plan') { setModal({ type: 'plan', company: c }); return; }

    setModal({ type: 'confirm', action: a, company: c });

  };

  const messageCompany = (c) => setModal({ type: 'message', company: c });

  const companyDetailAction = (a, c) => {

    if (a === 'edit') { setModal({ type: 'form', company: c }); return; }

    if (a === 'invoices') { navigateTenantBilling(c); return; }

    if (a === 'plan') { setModal({ type: 'plan', company: c }); return; }

    setModal({ type: 'confirm', action: a, company: c });

  };

  const saveInvoice = (data) => {

    const record = { ...data, id: `INV-${Date.now()}`, companyId: modal.company.id, companyName: modal.company.name, createdAt: todayIso() };

    setRows((rs) => rs.map((r) => r.id === modal.company.id ? { ...r, invoices: [record, ...(r.invoices || [])], activityHistory: [{ date: todayIso(), title: `Invoice ${record.id} created`, actor: 'Platform Admin' }, ...(r.activityHistory || [])] } : r));

    setModal(null);

    toast?.(`${record.id} created for ${record.companyName}. It is stored in this page's local state; connect Tenant Billing to share it across modules.`);

  };

  const savePlan = (data) => {

    const company = modal.company;

    const old = { plan: company.plan, amount: company.revenue, billingTenure: company.billingTenure, effectiveDate: todayIso() };

    setRows((rs) => rs.map((r) => {
      if (r.id !== company.id) return r;
      const updated = withCompanyMockData({
        ...r,
        plan: data.plan,
        revenue: undefined,
        billingTenure: data.billingTenure,
        planEffectiveDate: data.effectiveDate,
        subscriptionHistory: [old, ...(r.subscriptionHistory || [])],
        activityHistory: [{ date: todayIso(), title: `Plan changed from ${old.plan} to ${data.plan}`, actor: 'Platform Admin' }, ...(r.activityHistory || [])],
      });
      return {
        ...updated,
        paymentHistory: updated.paymentHistory.map((item) => ({ ...item, amount: updated.revenue })),
        invoices: updated.invoices.map((item) => ({ ...item, amount: updated.revenue })),
        billingHistory: updated.billingHistory.map((item) => ({ ...item, amount: updated.revenue })),
      };
    }));

    setModal(null);

    toast?.(`${company.name}'s plan was updated locally. No payment or refund was processed.`);

  };

  const saveMessage = (data) => {
    const company = modal.company;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const item = { date: todayIso(), time, type: data.channel === 'whatsapp' ? 'WhatsApp' : 'Email', to: data.to, subject: data.subject, message: data.body, status: 'Draft prepared' };
    setRows((rs) => rs.map((r) => r.id === company.id ? { ...r, communicationHistory: [item, ...(r.communicationHistory || [])], activityHistory: [{ date: todayIso(), time, title: `${item.type} message prepared`, actor: 'Platform Admin' }, ...(r.activityHistory || [])] } : r));
    const encodedBody = encodeURIComponent(data.body);
    if (data.channel === 'whatsapp') {
      window.open(`https://wa.me/${digits(data.to)}?text=${encodedBody}`, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = `mailto:${encodeURIComponent(data.to)}?subject=${encodeURIComponent(data.subject)}&body=${encodedBody}`;
    }
  };



  const save = (data) => {

    if (modal.company) {

      setRows((rs) => rs.map((r) => (r.id === modal.company.id ? withCompanyMockData({ ...r, ...data, revenue: data.status === 'Trial' ? 0 : (PLAN_INFO[data.plan]?.price || r.revenue), activityHistory: [{ date: todayIso(), title: 'Company information updated', actor: 'Platform Admin' }, ...(r.activityHistory || [])] }) : r)));

      toast(`${data.name} updated in the current application state (not saved to a backend).`);

    } else {

      const id = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;

      setRows((rs) => [withCompanyMockData({ ...data, id, code: `CMP-${1000 + id}`, renewalDate: '2026-11-15', renewalState: 'Due soon', renewalStatusLabel: 'Due in 16 days', location: data.location || 'Not provided' }), ...rs]);

      setSort({ k: 'renewalDate', dir: 1 }); setVisibleCount(PAGE_SIZE);

      toast(`${data.name} added to the demo list (not saved to a server).`);

    }

    setModal(null);

  };

  const confirm = () => {

    const { action, company: c, remark = '', reason = '' } = modal;

    if (action === 'suspend' && (!reason.trim() || !remark.trim())) { toast?.('Select a suspension reason and enter a mandatory remark.'); return; }

    if (action === 'delete') {

      setRows((rs) => rs.filter((r) => r.id !== c.id));

      toast?.(`${c.name} removed from the current company list.`);

    } else {

      const next = action === 'suspend' ? 'Suspended' : 'Active';

      setRows((rs) => rs.map((r) => r.id === c.id ? { ...r, status: next, suspensionReason: action === 'suspend' ? reason : '', suspensionRemark: action === 'suspend' ? remark.trim() : '', suspendedAt: action === 'suspend' ? todayIso() : null, activityHistory: [{ date: todayIso(), title: action === 'suspend' ? `Company suspended: ${reason || 'No reason selected'}` : 'Company reactivated', actor: 'Platform Admin' }, ...(r.activityHistory || [])] } : r));

      toast?.(`${c.name} is now ${next} in the current application state.`);

    }

    setModal(null);

  };

  const CONFIRM = {

    suspend: ['Suspend company', 'Suspend', 'Guards and managers of this company will lose access until it is reactivated.'],

    reactivate: ['Reactivate company', 'Reactivate', 'This company will be marked Active again.'],

    delete: ['Delete company', 'Delete', 'This removes the company from the demo list. It cannot be undone until you refresh the page.'],

  };



  return (

    <div className="dash cp">

      {detail ? <CompanyDetails key={`${detail.id}-${detailView}`} company={rows.find((r) => r.id === detail.id) || detail} initialView={detailView} onBack={() => setDetail(null)} fmtDate={fmtDate} onEdit={() => setModal({ type: 'form', company: rows.find((r) => r.id === detail.id) || detail })} onMessage={() => messageCompany(rows.find((r) => r.id === detail.id) || detail)} onCompanyAction={companyDetailAction} onBilling={navigateTenantBilling} onInvoices={(c) => setModal({ type: 'invoices', company: c })} onPaymentHistory={(c) => setModal({ type: 'payments', company: c })} onPlan={(c) => setModal({ type: 'plan', company: c })} toast={toast} /> : <>

      <div className="title-row">

        <div><h1>Companies &amp; Renewals</h1><p>Manage all tenant companies on the MEGSI platform.</p></div>

        <button className="btn-primary cp-add" onClick={() => setModal({ type: 'form', company: null })}><Plus size={18} /> Add Company</button>

      </div>



      <div className="kpis cp-kpis">{kpis.map((k) => (

        <div key={k.t} className="card kpi">

          <span className={`kpi-ic ${k.c}`}><k.I size={26} /></span>

          <span className="kpi-t"><small>{k.t}</small><span className="kpi-v"><b>{k.v}</b><em className={k.ch < 0 ? 'down' : 'up'}>{k.ch === 0 ? 'In 30 days' : `${k.ch < 0 ? '↓' : '↑'} ${Math.abs(k.ch)}%`}</em></span></span>

          <span className="kpi-d">{k.d}</span>

        </div>))}

      </div>



      <section className="card cp-card">

        <div className="cp-toolbar">

          <div className="tsearch cp-search"><Search size={16} /><input placeholder="Search by company name, contact, or plan..." value={q} onChange={(e) => withReset(setQ)(e.target.value)} aria-label="Search companies" /></div>

          {[['All Packages', plan, PLANS, setPlan], ['All Tenures', tenure, TENURES, setTenure], ['All Renewal Status', renewalStatus, RENEWAL_FILTERS, setRenewalStatus]].map(([label, val, opts, set]) => (

            <span className="cp-select" key={label}><select value={val} onChange={(e) => withReset(set)(e.target.value)} aria-label={label}><option value="All">{label}</option>{opts.map((o) => <option key={o}>{o}</option>)}</select><ChevronDown size={14} /></span>))}

          <div className="grow" />

          <button className="btn-sm cp-btn" onClick={clear} disabled={!filtersOn}>Clear Filters</button>

          <button className="btn-primary cp-btn" onClick={exportCsv}><Download size={16} /> Export</button>

        </div>



        <div className="tscroll cp-scroll">

          <table className="tbl cp-tbl">

            <thead><tr>

              <th>#</th>

              {COLS.map(([k, l]) => (<th key={k} className="sortable" onClick={() => sortBy(k)} aria-sort={sort.k === k ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>{l}{sort.k === k && (sort.dir === 1 ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}</th>))}

              <th className="r">Actions</th>

            </tr></thead>

            <tbody>

              {shown.map((c, i) => (

                <tr key={c.id}>

                  <td>{i + 1}</td>

                  <td><div className="name"><Avatar name={c.name} /><button type="button" className="cp-company-name" onClick={() => openDetail(c)} title={`View ${c.name} details`}>{c.name}</button></div></td>

                  <td className="cp-industry-cell">{c.industry}</td>

                  <td>{c.location || '—'}</td>

                  <td><PlanBadge v={c.plan} /></td>

                  <td><span className={`cp-tenure ${c.billingTenure === 'Annual' ? 'annual' : 'monthly'}`}>{c.billingTenure || 'Monthly'}</span></td>

                  <td>{fmtDate(c.joiningDate)}</td>

                  <td>{fmtDate(c.renewalDate)}</td>

                  <td><RenewalBadge company={c} /></td>

                  <td>{money(c.revenue)}</td>

                  <td className="r"><RowMenu company={c} onAction={onAction} /></td>

                </tr>))}

              {shown.length === 0 && <tr><td colSpan={COLS.length + 2} className="empty">No companies match your filters. <button className="cp-link" onClick={clear}>Clear filters</button></td></tr>}

            </tbody>

          </table>

        </div>



        <div className="cp-foot">

          <span>{filtered.length === 0 ? 'No companies found' : `Showing 1–${shown.length} of ${filtered.length} companies · scroll to load more`}</span></div>

        <div ref={loadMoreRef} className="cp-load-more" aria-live="polite">

          {hasMore ? <><span className="cp-loader" />Loading more companies…</> : filtered.length > PAGE_SIZE ? 'All companies loaded' : ''}

        </div>

      </section>







      </>}



      {modal?.type === 'form' && (

        <Modal title={modal.company ? 'Edit Company' : 'Add Company'} onClose={() => setModal(null)}>

          <CompanyForm company={modal.company} rows={rows} onSave={save} onClose={() => setModal(null)} />

        </Modal>)}

      {modal?.type === 'confirm' && (

        <Modal title={CONFIRM[modal.action][0]} onClose={() => setModal(null)}>

          <div className="cp-modal-b">

            <p><b>{modal.company.name}</b></p>

            <p className="cp-note">{CONFIRM[modal.action][2]}</p>

            {modal.action === 'suspend' && <div className="cp-action-form">

              <label className="cp-field"><span>Reason for suspension <i>*</i></span><select value={modal.reason || ''} onChange={(e) => setModal((m) => ({ ...m, reason: e.target.value }))}><option value="">Select a reason</option><option>Payment overdue</option><option>Policy violation</option><option>Security concern</option><option>Client request</option><option>Other</option></select></label>

              <label className="cp-field"><span>Remark (mandatory) <i>*</i></span><textarea rows={4} value={modal.remark || ''} onChange={(e) => setModal((m) => ({ ...m, remark: e.target.value }))} placeholder="Enter the reason and supporting details for suspension" /></label>

              <p className="cp-backend-note">This records the suspension in the current frontend state. Backend persistence and access revocation still need server integration.</p>

            </div>}

            {modal.action === 'reactivate' && <p className="cp-backend-note">The company will be marked Active in the current frontend state. Backend access restoration requires server integration.</p>}

          </div>

          <div className="cp-modal-f"><button className="btn-sm big" onClick={() => setModal(null)}>Cancel</button><button className={`btn-primary ${modal.action === 'reactivate' ? '' : 'cp-danger'}`} onClick={confirm}>{CONFIRM[modal.action][1]}</button></div>

        </Modal>)}


      {['payments', 'billingHistory', 'invoices'].includes(modal?.type) && <HistoryModal company={modal.company} type={modal.type === 'billingHistory' ? 'billing' : modal.type} onClose={() => setModal(null)} fmtDate={fmtDate} />}
      {modal?.type === 'invoice' && <InvoiceModal company={modal.company} onClose={() => setModal(null)} onSave={saveInvoice} />}

      {modal?.type === 'plan' && <PlanModal company={modal.company} onClose={() => setModal(null)} onSave={savePlan} />}

      {modal?.type === 'message' && <MessageModal company={modal.company} onClose={() => setModal(null)} onSend={saveMessage} />}



    </div>

  );

}