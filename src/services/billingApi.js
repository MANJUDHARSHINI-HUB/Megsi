// ---------------------------------------------------------------------------
// Billing / sales API seam.
//
// DEMO MODE (default): VITE_BILLING_API_URL is not set. Nothing leaves the browser,
// no payment is taken and no email is sent. Results are clearly flagged `demo: true`.
//
// REAL MODE: set VITE_BILLING_API_URL (e.g. https://api.example.co.uk) in .env.local and
// implement two backend endpoints:
//   POST {URL}/checkout/session  -> creates a provider-hosted checkout (e.g. Stripe Checkout,
//        PayPal) using SECRET keys held on the server, and returns { url }.
//   POST {URL}/sales-enquiry     -> stores/forwards the enquiry, returns { reference }.
// The browser is redirected to the provider's page; card data never touches this app.
// Success must be confirmed server-side (webhook) — never trust the redirect alone.
// ---------------------------------------------------------------------------
import { makeRef } from '../pages/plans/planData.js';

const BASE = (import.meta.env.VITE_BILLING_API_URL || '').replace(/\/$/, '');
export const DEMO_MODE = !BASE;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function post(path, body) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  } catch { throw new Error('Could not reach the billing service. Check your connection and try again.'); }
  if (!res.ok) throw new Error(`The billing service returned an error (${res.status}). Please try again.`);
  return res.json();
}

export async function startCheckout({ planId, frequency, billing, method, simulateFailure }) {
  if (DEMO_MODE) {
    await wait(1500);
    if (simulateFailure) throw new Error('Demo payment error: the simulated payment provider declined this order. No payment was taken.');
    return { demo: true, reference: makeRef('MEG-DEMO') };
  }
  const data = await post('/checkout/session', { planId, frequency, billing, method, returnUrl: window.location.href });
  if (!data.url) throw new Error('The billing service did not return a checkout link.');
  window.location.assign(data.url);
  return { redirected: true };
}

export async function submitEnquiry(payload) {
  if (DEMO_MODE) { await wait(900); return { demo: true, reference: makeRef('ENQ-DEMO') }; }
  const data = await post('/sales-enquiry', payload);
  return { demo: false, reference: data.reference || null };
}
