import { useState } from 'react';
import {
  Building2, Check, Crown, Rocket, Users, X,
  Zap, Layers, History, Workflow, Plug, UsersRound,
  BarChart3, KeyRound, Headset, ClipboardList,
} from 'lucide-react';

import { useI18n } from '../i18n/I18nContext.jsx';
import CheckoutModal from './plans/CheckoutModal.jsx';
import ContactSalesModal from './plans/ContactSalesModal.jsx';
import { PLAN_BY_ID, gbp } from './plans/planData.js';
import './subscription-plans.css';

const PLANS = [
  {
    id: 'starter',
    tone: 'blue',
    Icon: Rocket,
    name: 'Starter Plan',
    tagline: 'Perfect for individuals & small projects',
    pill: '1-3 projects / workspaces / seats',
    features: [
      'Access to basic functionality & core tools',
      'Up to 1-3 projects / workspaces / seats',
      'Basic history retention (last 30 days)',
      'Email support or community forum',
    ],
    excluded: [
      'Advanced automation',
      'Team sharing',
      'Integrations',
      'Export capabilities',
    ],
    button: 'Get Started',
  },
  {
    id: 'pro',
    tone: 'green',
    Icon: Crown,
    popular: true,
    name: 'Pro Plan',
    tagline: 'For professionals & small agencies',
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
    button: 'Get Started',
  },
  {
    id: 'business',
    tone: 'purple',
    Icon: Users,
    name: 'Business / Team Plan',
    tagline: 'For growing teams & organizations',
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
    button: 'Get Started',
  },
  {
    id: 'enterprise',
    tone: 'navy',
    Icon: Building2,
    name: 'Enterprise Plan',
    tagline: 'For large companies with strict requirements',
    custom: true,
    price: 'Custom / Contact Us',
    note: 'Tailored pricing - contact our sales team',
    pill: 'Tailored to your business needs',
    lead: 'Everything in Business, plus:',
    features: [
      'Single Sign-On (SSO/SAML)',
      'Custom data residency',
      'Dedicated account manager',
      'Custom contracts / NDAs',
      'Uptime SLA (99.9%)',
    ],
    button: 'Contact Sales',
  },
];

const YES = true;
const NO = null;

const COMPARISON = [
  { Icon: Zap, label: 'Basic Features & Core Tools', values: [YES, YES, YES, YES] },
  { Icon: Layers, label: 'Project / Workspace Limit', values: ['1-3', 'Unlimited', 'Unlimited', 'Unlimited'] },
  { Icon: History, label: 'History Retention', values: ['30 days', '90 days', '1 year', 'Custom'] },
  { Icon: Workflow, label: 'Automation & Workflows', values: [NO, YES, YES, YES] },
  { Icon: Plug, label: 'Integrations (Zapier, Slack, etc.)', values: [NO, YES, YES, YES] },
  { Icon: UsersRound, label: 'Team Collaboration & Permissions', values: [NO, NO, YES, YES] },
  { Icon: BarChart3, label: 'Advanced Analytics & Reporting', values: [NO, NO, YES, YES] },
  { Icon: KeyRound, label: 'SSO / SAML', values: [NO, NO, NO, YES] },
  {
    Icon: Headset,
    label: 'Dedicated Support',
    values: ['Email', 'Priority Email & Chat', '24/7 Priority Support', 'Dedicated Account Manager'],
  },
];

const COLUMNS = ['Starter', 'Pro', 'Business', 'Enterprise'];

function ComparisonCell({ value, t }) {
  if (value === YES) {
    return <Check size={15} className="sp-yes" aria-label={t('Included')} />;
  }

  if (value === NO) {
    return <span className="sp-dash">-</span>;
  }

  return <span>{t(value)}</span>;
}

export default function SubscriptionPlans({ toast }) {
  const { t } = useI18n();
  const [modal, setModal] = useState(null);

  const openPlan = (plan) => {
    if (plan.custom) {
      setModal({ type: 'sales' });
    } else {
      setModal({
        type: 'checkout',
        plan: PLAN_BY_ID[plan.id],
      });
    }
  };

  const closeModal = () => setModal(null);

  return (
    <div className="dash sp">
      <div className="title-row">
        <div>
          <h1>{t('nav.plans')}</h1>
          <p>
            {t('Choose the right plan for your business needs. Upgrade anytime.')}
          </p>
        </div>
      </div>

      <div className="sp-plans">
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={`card sp-card tone-${plan.tone} ${
              plan.popular ? 'is-popular' : ''
            }`}
          >
            {plan.popular && (
              <span className="sp-ribbon">{t('MOST POPULAR')}</span>
            )}

            <header className="sp-head">
              <span className="sp-ico">
                <plan.Icon size={24} />
              </span>
              <div>
                <h2>{t(plan.name)}</h2>
                <p>{t(plan.tagline)}</p>
              </div>
            </header>

            <div className="sp-price">
              {plan.custom ? (
                <b className="sp-custom">{t(plan.price)}</b>
              ) : (
                <>
                  <b>{gbp(PLAN_BY_ID[plan.id].monthly)}</b>
                  <span>{t('/ month')}</span>
                </>
              )}
            </div>

            <div className="sp-note">
              {plan.custom
                ? t(plan.note)
                : t('or {monthly}/mo billed annually ({annual}/yr)', {
                    monthly: gbp(PLAN_BY_ID[plan.id].annual / 12),
                    annual: gbp(PLAN_BY_ID[plan.id].annual),
                  })}
            </div>

            <div className="sp-pill">{t(plan.pill)}</div>

            {plan.lead && (
              <div className="sp-lead">{t(plan.lead)}</div>
            )}

            <ul className="sp-list">
              {plan.features.map((feature) => (
                <li key={feature}>
                  <Check size={15} className="sp-yes" />
                  {t(feature)}
                </li>
              ))}
            </ul>

            {plan.excluded && (
              <div className="sp-not">
                <div className="sp-lead">{t('Not included:')}</div>
                <ul className="sp-list sp-list-no">
                  {plan.excluded.map((feature) => (
                    <li key={feature}>
                      <X size={13} className="sp-no" />
                      {t(feature)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              className={`sp-btn ${plan.popular ? 'solid' : 'outline'}`}
              onClick={() => openPlan(plan)}
            >
              {t(plan.button)}
            </button>
          </article>
        ))}
      </div>

      <p className="sp-vat">
        {t(
          'Prices are in GBP. VAT is not calculated in this demo, and checkout runs in demo mode — no payment is taken.'
        )}
      </p>

      <section className="card sp-compare" aria-labelledby="sp-cmp-h">
        <div className="sp-cmp-head">
          <span className="sp-cmp-ico">
            <ClipboardList size={16} />
          </span>
          <div>
            <h3 id="sp-cmp-h">{t('Plan Comparison')}</h3>
            <p>{t('Quickly compare features across all plans.')}</p>
          </div>
        </div>

        <div className="sp-cmp-scroll">
          <table className="sp-table">
            <thead>
              <tr>
                <th className="sp-feat">{t('Feature')}</th>
                {COLUMNS.map((column) => (
                  <th key={column}>{t(column)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.label}>
                  <th className="sp-feat">
                    <row.Icon size={14} />
                    {t(row.label)}
                  </th>
                  {row.values.map((value, index) => (
                    <td key={index}>
                      <ComparisonCell value={value} t={t} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modal?.type === 'checkout' && (
        <CheckoutModal
          plan={modal.plan}
          initialFreq="monthly"
          onClose={closeModal}
          toast={toast}
        />
      )}

      {modal?.type === 'sales' && (
        <ContactSalesModal onClose={closeModal} toast={toast} />
      )}
    </div>
  );
}
