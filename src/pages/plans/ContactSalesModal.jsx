import { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, Loader2, Send } from 'lucide-react';
import PlanModal from './PlanModal.jsx';
import { COMPANY_SIZES, validateEnquiry } from './planData.js';
import { DEMO_MODE, submitEnquiry } from '../../services/billingApi.js';

const EMPTY = { name: '', email: '', company: '', size: '', phone: '', message: '' };

export default function ContactSalesModal({ onClose, toast }) {
  const [f, setF] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | sending | error | done
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const formRef = useRef(null);
  const errors = validateEnquiry(f);
  const show = (k) => (submitted || touched[k]) && errors[k];
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const blur = (k) => () => setTouched((p) => ({ ...p, [k]: true }));
  const busy = status === 'sending';

  const field = (k, label, { req, type = 'text', hint, ...rest } = {}) => (
    <div className={`spm-field ${show(k) ? 'bad' : ''}`}>
      <label htmlFor={`cs-${k}`}>{label}{req && <i aria-hidden="true"> *</i>}{!req && <small> (optional)</small>}</label>
      <input id={`cs-${k}`} type={type} value={f[k]} onChange={set(k)} onBlur={blur(k)} aria-required={!!req} aria-invalid={!!show(k)} aria-describedby={show(k) ? `cs-${k}-e` : undefined} {...rest} />
      {show(k) ? <span className="spm-err" id={`cs-${k}-e`}>{errors[k]}</span> : hint && <span className="spm-hint">{hint}</span>}
    </div>
  );

  const submit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) { formRef.current?.querySelector('[aria-invalid="true"]')?.focus(); return; }
    setStatus('sending'); setError('');
    try {
      const r = await submitEnquiry({ ...f, name: f.name.trim(), email: f.email.trim(), company: f.company.trim(), message: f.message.trim() });
      setResult(r); setStatus('done');
      toast?.(r.demo ? `Enquiry ${r.reference} recorded in demo mode — nothing was sent` : 'Enquiry submitted to MEGSI sales');
    } catch (err) { setError(err.message); setStatus('error'); }
  };

  if (status === 'done') return (
    <PlanModal title="Enquiry recorded" titleId="cs-title" size="sm" onClose={onClose}>
      <div className="spm-b spm-done">
        <CheckCircle2 size={44} className="spm-ok" aria-hidden="true" />
        <p className="spm-lead" role="status">{result.demo ? 'Your enquiry was recorded in demo mode.' : 'Thanks — your enquiry has been submitted.'}</p>
        {result.demo
          ? <div className="spm-banner info"><Info size={16} aria-hidden="true" /><span>Demo mode: no email was sent and no sales team has received this enquiry. Connect a backend to deliver real enquiries.</span></div>
          : <p className="spm-hint">Our team will reply to {f.email.trim()}.</p>}
        <dl className="spm-kv">
          {result.reference && <><dt>Reference</dt><dd>{result.reference}</dd></>}
          <dt>Name</dt><dd>{f.name.trim()}</dd><dt>Company</dt><dd>{f.company.trim()}</dd><dt>Work email</dt><dd>{f.email.trim()}</dd>
        </dl>
      </div>
      <div className="spm-f"><span className="grow" /><button type="button" className="btn-primary" onClick={onClose}>Back to Subscription Plans</button></div>
    </PlanModal>
  );

  return (
    <PlanModal title="Contact Sales — Enterprise" titleId="cs-title" size="sm" busy={busy} onClose={onClose}>
      <form ref={formRef} onSubmit={submit} noValidate>
        <fieldset className="spm-b spm-fs" disabled={busy}>
          <p className="spm-hint">Tell us about your organisation and we’ll follow up about Enterprise pricing.</p>
          {status === 'error' && <div className="spm-banner err" role="alert"><AlertCircle size={16} aria-hidden="true" /><span>{error}</span></div>}
          {submitted && Object.keys(errors).length > 0 && <div className="spm-banner err" role="alert"><AlertCircle size={16} aria-hidden="true" /><span>Please correct the highlighted fields.</span></div>}
          <div className="spm-grid">
            {field('name', 'Full name', { req: true, autoComplete: 'name' })}
            {field('email', 'Work email', { req: true, type: 'email', autoComplete: 'email', placeholder: 'name@company.co.uk' })}
            {field('company', 'Company name', { req: true, autoComplete: 'organization' })}
            <div className={`spm-field ${show('size') ? 'bad' : ''}`}>
              <label htmlFor="cs-size">Company size<i aria-hidden="true"> *</i></label>
              <select id="cs-size" value={f.size} onChange={set('size')} onBlur={blur('size')} aria-required="true" aria-invalid={!!show('size')} aria-describedby={show('size') ? 'cs-size-e' : undefined}>
                <option value="">Select employees…</option>
                {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
              </select>
              {show('size') && <span className="spm-err" id="cs-size-e">{errors.size}</span>}
            </div>
            <div className="span2">{field('phone', 'Phone', { type: 'tel', autoComplete: 'tel', placeholder: '020 7946 0000' })}</div>
            <div className={`spm-field span2 ${show('message') ? 'bad' : ''}`}>
              <label htmlFor="cs-message">Message<i aria-hidden="true"> *</i></label>
              <textarea id="cs-message" rows={4} value={f.message} onChange={set('message')} onBlur={blur('message')} aria-required="true" aria-invalid={!!show('message')} aria-describedby={show('message') ? 'cs-message-e' : undefined} />
              {show('message') && <span className="spm-err" id="cs-message-e">{errors.message}</span>}
            </div>
          </div>
          {DEMO_MODE && <p className="spm-hint">Demo mode: submitting records the enquiry on screen only — no email is sent.</p>}
        </fieldset>
        <div className="spm-f">
          <button type="button" className="btn-sm big" onClick={onClose} disabled={busy}>Cancel</button><span className="grow" />
          <button type="submit" className="btn-primary" disabled={busy}>{busy ? <><Loader2 size={16} className="spm-spin" aria-hidden="true" /> Sending…</> : <><Send size={16} aria-hidden="true" /> Send enquiry</>}</button>
        </div>
      </form>
    </PlanModal>
  );
}
