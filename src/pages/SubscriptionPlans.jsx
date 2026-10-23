import { useState } from 'react';
import {
  Building2, Check, Crown, Rocket, Users, X,
  Zap, Layers, FileText, History, Workflow, Plug, UsersRound, BarChart3, KeyRound, Headset, ClipboardList,
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
import CheckoutModal from './plans/CheckoutModal.jsx';
import ContactSalesModal from './plans/ContactSalesModal.jsx';
import { PLAN_BY_ID, gbp } from './plans/planData.js';
import './subscription-plans.css';

/* ---------- Plan card data ---------- */
const PLAN_CARDS = [
  {
    id: 'starter', tone: 'blue', Icon: Rocket,
    name: 'Starter Plan', tagline: 'Perfect for individuals & small projects',
    unit: '/ month',
    pill: '1-3 projects / workspaces / seats',
    lead: null,
    features: [
      'Access to basic functionality & core tools',
      'Up to 1-3 projects / workspaces / seats',
      'Basic history retention (last 30 days)',
      'Email support or community forum',
    ],
    notIncluded: ['Advanced automation', 'Team sharing', 'Integrations', 'Export capabilities'],
    cta: 'Get Started', ctaKind: 'outline',
  },
  {
    id: 'pro', tone: 'green', Icon: Crown, popular: true,
    name: 'Pro Plan', tagline: 'For professionals & small agencies',
    unit: '/ month',
    pill: 'Unlimited projects / higher usage caps',
    lead: 'Everything in Starter, plus:',
    features: [
      'Expanded usage & higher limits',
      'Automated workflows & batch processing',
      'Advanced custom options',
      '3rd-party integrations (Zapier, Slack, Drive, APIs)',
      'High-resolution exports (PDF/CSV)',
      'Priority email & live chat support',
    ],
    cta: 'Get Started', ctaKind: 'solid',
  },
  {
    id: 'business', tone: 'purple', Icon: Users,
    name: 'Business / Team Plan', tagline: 'For growing teams & organizations',
    unit: '/ month',
    pill: '3-5 seats base (extra seats on request)',
    lead: 'Everything in Pro, plus:',
    features: [
      'Shared team workspaces',
      'Roles & permission controls (Admin, Editor, Viewer)',
      'Activity logs & centralized billing',
      'Advanced analytics & custom reporting',
      'Dedicated onboarding call',
      '24/7 priority support & SLA guarantee',
    ],
    cta: 'Get Started', ctaKind: 'outline',
  },
  {
    id: 'enterprise', tone: 'navy', Icon: Building2,
    name: 'Enterprise Plan', tagline: 'For large companies with strict requirements',
    price: 'Custom / Contact Us', custom: true, note: 'Tailored pricing - contact our sales team',
    pill: 'Tailored to your business needs',
    lead: 'Everything in Business, plus:',
    features: [
      'Single Sign-On (SSO/SAML)',
      'Custom data residency',
      'Dedicated account manager',
      'Custom contracts / NDAs',
      'Uptime SLA (99.9%)',
    ],
    cta: 'Contact Sales', ctaKind: 'outline',
  },
];

/* ---------- Comparison table data ---------- */
const YES = true;
const NO = null; // renders "-"
const COMPARE = [
  { Icon: Zap, label: 'Basic Features & Core Tools', v: [YES, YES, YES, YES] },
  { Icon: Layers, label: 'Project / Workspace Limit', v: ['1-3', 'Unlimited', 'Unlimited', 'Unlimited'] },
  { Icon: History, label: 'History Retention', v: ['30 days', '90 days', '1 year', 'Custom'] },
  { Icon: Workflow, label: 'Automation & Workflows', v: [NO, YES, YES, YES] },
  { Icon: Plug, label: 'Integrations (Zapier, Slack, etc.)', v: [NO, YES, YES, YES] },
  { Icon: UsersRound, label: 'Team Collaboration & Permissions', v: [NO, NO, YES, YES] },
  { Icon: BarChart3, label: 'Advanced Analytics & Reporting', v: [NO, NO, YES, YES] },
  { Icon: KeyRound, label: 'SSO / SAML', v: [NO, NO, NO, YES] },
  { Icon: Headset, label: 'Dedicated Support', v: ['Email', 'Priority Email & Chat', '24/7 Priority Support', 'Dedicated Account Manager'], text: true },
];
const COLS = [['Starter', 'blue'], ['Pro', 'green'], ['Business', 'purple'], ['Enterprise', 'navy']];

function Cell({ v }) {
  if (v === YES) return <Check size={15} strokeWidth={3} className="sp-yes" aria-label="Included" />;
  if (v === NO) return <span className="sp-dash" aria-label="Not included">-</span>;
  return <span>{v}</span>;
}

export default function SubscriptionPlans({ toast }) {
  const { t } = useI18n();
  const [modal, setModal] = useState(null); // { type: 'checkout', plan } | { type: 'sales' }
  const act = (p) => setModal(p.custom ? { type: 'sales' } : { type: 'checkout', plan: PLAN_BY_ID[p.id] });
  const closeModal = () => setModal(null); // closing returns to this page (the 'plans' route is never left)

  return (
    <div className="dash sp">
      <div className="title-row">
        <div><h1>{t('nav.plans')}</h1><p>Choose the right plan for your business needs. Upgrade anytime.</p></div>
      </div>

      <div className="sp-plans">
        {PLAN_CARDS.map((p) => (
          <article key={p.id} className={`card sp-card tone-${p.tone} ${p.popular ? 'is-popular' : ''}`}>
            {p.popular && <span className="sp-ribbon">MOST POPULAR</span>}
            <header className="sp-head">
              <span className="sp-ico"><p.Icon size={24} /></span>
              <div><h2>{p.name}</h2><p>{p.tagline}</p></div>
            </header>

            <div className="sp-price">
              {p.custom
                ? <b className="sp-custom">{p.price}</b>
                : <><b>{gbp(PLAN_BY_ID[p.id].monthly)}</b><span>{p.unit}</span></>}
            </div>
            <div className="sp-note">{p.custom ? p.note : `or ${gbp(PLAN_BY_ID[p.id].annual / 12)}/mo billed annually (${gbp(PLAN_BY_ID[p.id].annual)}/yr)`}</div>
            <div className="sp-pill">{p.pill}</div>

            {p.lead && <div className="sp-lead">{p.lead}</div>}
            <ul className="sp-list">
              {p.features.map((f) => <li key={f}><Check size={15} strokeWidth={3} className="sp-yes" />{f}</li>)}
            </ul>

            {p.notIncluded && (
              <div className="sp-not">
                <div className="sp-lead">Not included:</div>
                <ul className="sp-list sp-list-no">
                  {p.notIncluded.map((f) => <li key={f}><X size={13} strokeWidth={3} className="sp-no" />{f}</li>)}
                </ul>
              </div>
            )}

            <button type="button" className={`sp-btn ${p.ctaKind}`} onClick={() => act(p)} aria-label={`${p.cta}: ${p.name}`}>{p.cta}</button>
          </article>
        ))}
      </div>

      <p className="sp-vat">Prices are in GBP. VAT is not calculated in this demo, and checkout runs in demo mode — no payment is taken.</p>

      <section className="card sp-compare" aria-labelledby="sp-cmp-h">
        <div className="sp-cmp-head">
          <span className="sp-cmp-ico"><ClipboardList size={16} /></span>
          <div><h3 id="sp-cmp-h">Plan Comparison</h3><p>Quickly compare features across all plans.</p></div>
        </div>
        <div className="sp-cmp-scroll">
          <table className="sp-table">
            <thead>
              <tr>
                <th scope="col" className="sp-feat">Feature</th>
                {COLS.map(([n, tone]) => <th scope="col" key={n} className={`tone-${tone}`}>{n}</th>)}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((r) => (
                <tr key={r.label}>
                  <th scope="row" className="sp-feat"><r.Icon size={14} />{r.label}</th>
                  {r.v.map((v, i) => <td key={i}><Cell v={v} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modal?.type === 'checkout' && <CheckoutModal plan={modal.plan} initialFreq="monthly" onClose={closeModal} toast={toast} />}
      {modal?.type === 'sales' && <ContactSalesModal onClose={closeModal} toast={toast} />}
    </div>
  );
}