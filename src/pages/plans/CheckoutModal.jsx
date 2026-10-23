import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, CreditCard, Info, Loader2, Lock, Wallet } from 'lucide-react';
import PlanModal from './PlanModal.jsx';
import { COUNTRIES, FREQ, addPeriod, fmtLongDate, gbp, normalisePostcode, priceFor, savingAmount, savingPct, validateBilling, yearlyAtMonthly } from './planData.js';
import { DEMO_MODE, startCheckout } from '../../services/billingApi.js';

const EMPTY = { fullName: '', company: '', email: '', address1: '', address2: '', city: '', postcode: '', country: 'United Kingdom' };
const VAT_NOTE = 'VAT is not calculated in this demo. Confirm whether list prices include VAT before going live.';

function Summary({ plan, freq }) {
  const price = priceFor(plan, freq); const annual = freq === 'annual';
  return (
    <aside className="spm-sum" aria-label="Order summary">
      <h3>Order summary</h3>
      <div className="spm-sum-plan"><b>{plan.name}</b><span>{FREQ[freq]} billing</span></div>
      <div className="spm-sum-row"><span>{plan.name} plan ({annual ? 'per year' : 'per month'})</span><b>{gbp(price, 2)}</b></div>
      {annual && <>
        <div className="spm-sum-row sub"><span>Equivalent to</span><span>{gbp(plan.annual / 12, 2)} / month</span></div>
        <div className="spm-sum-row save"><span>vs {gbp(yearlyAtMonthly(plan))} paying monthly</span><b>Save {gbp(savingAmount(plan))} ({savingPct(plan)}%)</b></div>
      </>}
      <div className="spm-sum-row sub"><span>VAT</span><span>Not calculated (demo)</span></div>
      <div className="spm-sum-total" aria-live="polite"><span>Total due today</span><b>{gbp(price, 2)}<small> {annual ? '/ year' : '/ month'}</small></b></div>
      <p className="spm-hint">{VAT_NOTE}</p>
    </aside>
  );
}

export default function CheckoutModal({ plan, initialFreq, onClose, toast }) {
  const [freq, setFreq] = useState(initialFreq);
  const [step, setStep] = useState(1); // 1 billing, 2 payment & review, 3 done
  const [f, setF] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [method, setMethod] = useState('card');
  const [agree, setAgree] = useState(false);
  const [simFail, setSimFail] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | processing | error | redirect
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const formRef = useRef(null); const headRef = useRef(null);
  const errors = validateBilling(f);
  const show = (k) => (submitted || touched[k]) && errors[k];
  const busy = status === 'processing' || status === 'redirect';
  const price = priceFor(plan, freq);

  useEffect(() => { headRef.current?.focus(); }, [step]); // move focus to the new step heading
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const blur = (k) => () => {
    setTouched((p) => ({ ...p, [k]: true }));
    if (k === 'postcode' && f.country === 'United Kingdom' && f.postcode.trim()) setF((p) => ({ ...p, postcode: normalisePostcode(p.postcode) }));
  };

  const field = (k, label, { req, hint, ...rest } = {}) => (
    <div className={`spm-field ${show(k) ? 'bad' : ''}`}>
      <label htmlFor={`co-${k}`}>{label}{req ? <i aria-hidden="true"> *</i> : <small> (optional)</small>}</label>
      <input id={`co-${k}`} value={f[k]} onChange={set(k)} onBlur={blur(k)} aria-required={!!req} aria-invalid={!!show(k)} aria-describedby={show(k) ? `co-${k}-e` : undefined} {...rest} />
      {show(k) ? <span className="spm-err" id={`co-${k}-e`}>{errors[k]}</span> : hint && <span className="spm-hint">{hint}</span>}
    </div>
  );

  const next = (e) => {
    e.preventDefault(); setSubmitted(true);
    if (Object.keys(errors).length) { formRef.current?.querySelector('[aria-invalid="true"]')?.focus(); return; }
    setStatus('idle'); setError(''); setStep(2);
  };

  const place = async (e) => {
    e.preventDefault();
    if (!agree) { setError('Please confirm you have reviewed your order before continuing.'); setStatus('error'); return; }
    setStatus('processing'); setError('');
    try {
      const r = await startCheckout({ planId: plan.id, frequency: freq, billing: { ...f, postcode: normalisePostcode(f.postcode) }, method, simulateFailure: simFail });
      if (r.redirected) { setStatus('redirect'); return; } // real mode: browser is leaving for the provider's page; success is confirmed server-side
      const now = new Date();
      setOrder({ ref: r.reference, date: fmtLongDate(now), renewal: fmtLongDate(addPeriod(now, freq)), amount: price, freq, method });
      setStatus('idle'); setStep(3);
      toast?.(`Demo order ${r.reference} created — no payment was taken`);
    } catch (err) { setError(err.message); setStatus('error'); }
  };

  const heading = (text) => <h3 className="spm-step-h" tabIndex={-1} ref={headRef}>{text}</h3>;
  const stepper = (
    <ol className="spm-steps" aria-label="Checkout progress">
      {['Billing details', 'Payment & review', 'Confirmation'].map((s, i) => (
        <li key={s} className={step === i + 1 ? 'on' : step > i + 1 ? 'past' : ''} aria-current={step === i + 1 ? 'step' : undefined}><span>{step > i + 1 ? '✓' : i + 1}</span>{s}</li>
      ))}
    </ol>
  );
  const freqPicker = step < 3 && (
    <div className="spm-freq" role="group" aria-label="Billing frequency">
      {Object.entries(FREQ).map(([k, label]) => (
        <button type="button" key={k} aria-pressed={freq === k} className={freq === k ? 'on' : ''} disabled={busy} onClick={() => setFreq(k)}>
          {label}<small>{gbp(priceFor(plan, k))}{k === 'annual' ? '/yr' : '/mo'}</small>
        </button>
      ))}
    </div>
  );

  if (step === 3 && order) return (
    <PlanModal title="Order confirmation" titleId="co-title" size="md" onClose={onClose}>
      {stepper}
      <div className="spm-b spm-done">
        <CheckCircle2 size={44} className="spm-ok" aria-hidden="true" />
        {heading('Demo order confirmed')}
        <div className="spm-banner info"><Info size={16} aria-hidden="true" /><span><b>This is a demonstration.</b> No payment was taken, no card was charged and no subscription was created.</span></div>
        <dl className="spm-kv">
          <dt>Order reference</dt><dd>{order.ref}</dd>
          <dt>Plan</dt><dd>{plan.name}</dd>
          <dt>Billing frequency</dt><dd>{FREQ[order.freq]}</dd>
          <dt>Amount</dt><dd>{gbp(order.amount, 2)} {order.freq === 'annual' ? 'per year' : 'per month'}</dd>
          <dt>VAT</dt><dd>Not calculated (demo)</dd>
          <dt>Payment method</dt><dd>{order.method === 'card' ? 'Card' : 'PayPal'} (demo — not charged)</dd>
          <dt>Billing email</dt><dd>{f.email.trim()}</dd>
          <dt>Order date</dt><dd>{order.date}</dd>
          <dt>Next renewal (illustrative)</dt><dd>{order.renewal}</dd>
        </dl>
      </div>
      <div className="spm-f"><span className="grow" /><button type="button" className="btn-primary" onClick={onClose}>Back to Subscription Plans</button></div>
    </PlanModal>
  );

  return (
    <PlanModal title={`Checkout — ${plan.name}`} titleId="co-title" size="lg" busy={busy} onClose={onClose}>
      {stepper}
      <form ref={formRef} onSubmit={step === 1 ? next : place} noValidate className="spm-form">
        <div className="spm-cols">
          <fieldset className="spm-fs spm-main" disabled={busy}>
            {freqPicker}
            {status === 'error' && <div className="spm-banner err" role="alert"><AlertCircle size={16} aria-hidden="true" /><span>{error}</span></div>}
            {step === 1 && <>
              {submitted && Object.keys(errors).length > 0 && <div className="spm-banner err" role="alert"><AlertCircle size={16} aria-hidden="true" /><span>Please correct the highlighted fields.</span></div>}
              {heading('Billing details')}
              <div className="spm-grid">
                {field('fullName', 'Full name', { req: true, autoComplete: 'name' })}
                {field('company', 'Company name', { autoComplete: 'organization' })}
                <div className="span2">{field('email', 'Billing email', { req: true, type: 'email', autoComplete: 'email', placeholder: 'accounts@company.co.uk', hint: 'Order confirmations and invoices would be sent here once billing is live.' })}</div>
                <div className="span2">{field('address1', 'Address line 1', { req: true, autoComplete: 'address-line1' })}</div>
                <div className="span2">{field('address2', 'Address line 2', { autoComplete: 'address-line2' })}</div>
                {field('city', 'Town / city', { req: true, autoComplete: 'address-level2' })}
                {field('postcode', 'Postcode', { req: true, autoComplete: 'postal-code', placeholder: f.country === 'United Kingdom' ? 'SW1A 1AA' : '', style: { textTransform: 'uppercase' } })}
                <div className={`spm-field span2 ${show('country') ? 'bad' : ''}`}>
                  <label htmlFor="co-country">Country<i aria-hidden="true"> *</i></label>
                  <select id="co-country" value={f.country} onChange={set('country')} autoComplete="country-name">{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select>
                </div>
              </div>
            </>}
            {step === 2 && <>
              {heading('Payment & review')}
              <div role="radiogroup" aria-label="Payment method" className="spm-pay">
                {[['card', CreditCard, 'Card payment', 'Pay by debit or credit card on a secure, provider-hosted page.'], ['paypal', Wallet, 'PayPal', 'Pay with your PayPal account on PayPal’s own page.']].map(([id, Ic, name, desc]) => (
                  <label key={id} className={method === id ? 'on' : ''}>
                    <input type="radio" name="pay" value={id} checked={method === id} onChange={() => setMethod(id)} />
                    <Ic size={20} aria-hidden="true" /><span><b>{name}</b><small>{desc}</small></span>
                  </label>
                ))}
              </div>
              <div className="spm-banner info"><Lock size={16} aria-hidden="true" />
                <span>{DEMO_MODE
                  ? <><b>Demo checkout.</b> No card number, CVV or other payment details are collected here, and nothing is charged. In a live setup you would be sent to the provider’s hosted payment page.</>
                  : <>You’ll be redirected to the provider’s secure page to pay. MEGSI never sees your card details.</>}</span></div>
              <dl className="spm-kv compact">
                <dt>Billing to</dt><dd>{f.fullName.trim()}{f.company.trim() && `, ${f.company.trim()}`}</dd>
                <dt>Email</dt><dd>{f.email.trim()}</dd>
                <dt>Address</dt><dd>{[f.address1, f.address2, f.city, normalisePostcode(f.postcode), f.country].map((x) => x.trim()).filter(Boolean).join(', ')}</dd>
              </dl>
              <button type="button" className="spm-link" onClick={() => setStep(1)}>Edit billing details</button>
              <label className="spm-check"><input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); if (e.target.checked && status === 'error') setStatus('idle'); }} />
                <span>I have reviewed my order: {plan.name}, {FREQ[freq].toLowerCase()} billing, {gbp(price, 2)} {freq === 'annual' ? 'per year' : 'per month'}.</span></label>
              {DEMO_MODE && <label className="spm-check muted"><input type="checkbox" checked={simFail} onChange={(e) => setSimFail(e.target.checked)} /><span>Simulate a payment error (demo only, to test the error state)</span></label>}
            </>}
          </fieldset>
          <Summary plan={plan} freq={freq} />
        </div>
        <div className="spm-f">
          {step === 1
            ? <button type="button" className="btn-sm big" onClick={onClose} disabled={busy}>Cancel</button>
            : <button type="button" className="btn-sm big" onClick={() => { setStatus('idle'); setError(''); setStep(1); }} disabled={busy}><ArrowLeft size={14} aria-hidden="true" /> Back</button>}
          <span className="grow" />
          {step === 1
            ? <button type="submit" className="btn-primary">Next: Payment &amp; review</button>
            : <button type="submit" className="btn-primary" disabled={busy}>
                {status === 'processing' ? <><Loader2 size={16} className="spm-spin" aria-hidden="true" /> Processing…</>
                  : status === 'redirect' ? <><Loader2 size={16} className="spm-spin" aria-hidden="true" /> Redirecting…</>
                  : <>{DEMO_MODE ? 'Place demo order' : 'Continue to secure payment'} · {gbp(price, 2)}</>}
              </button>}
        </div>
      </form>
    </PlanModal>
  );
}
