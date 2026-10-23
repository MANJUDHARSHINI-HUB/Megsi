import { useCallback, useState } from 'react';
import { DEFAULT_POLICIES, REVIEW, SEED_ACTIVITY, SEED_TENANTS } from '../../data/suspendedData.js';

const nowStamp = () => { const d = new Date(); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; };
const ACTOR = 'David Miller';

/** Local demo state for suspended tenants. Lives in App so it survives page switches; nothing is sent to a server. */
export default function useSuspendedTenants() {
  const [tenants, setTenants] = useState(SEED_TENANTS);
  const [activity, setActivity] = useState(SEED_ACTIVITY);
  const [reactivated, setReactivated] = useState(0);
  const [policies, setPolicies] = useState(DEFAULT_POLICIES);

  const log = useCallback((entry) => setActivity((a) => [{ id: `a${Date.now()}${Math.random().toString(16).slice(2, 6)}`, at: nowStamp(), ...entry }, ...a]), []);

  const reviewTenant = useCallback((tenant, status, note) => {
    const at = nowStamp();
    setTenants((ts) => ts.map((t) => (t.id === tenant.id ? { ...t, review: status, history: [...t.history, { date: at.slice(0, 10), text: `Review: ${status}. ${note}`, by: ACTOR }] } : t)));
    log({ kind: status === REVIEW.CRITICAL ? 'flagged' : 'reviewed', company: tenant.name, text: status === REVIEW.ELIGIBLE ? 'Review complete — eligible for reactivation.' : status === REVIEW.CRITICAL ? 'Escalated to Critical after review.' : 'Investigation opened / continued.' });
  }, [log]);

  const reactivate = useCallback((list, note) => {
    const ids = new Set(list.map((t) => t.id));
    setTenants((ts) => ts.filter((t) => !ids.has(t.id)));
    setReactivated((n) => n + list.length);
    list.forEach((t) => log({ kind: 'reactivated', company: t.name, text: `Reactivated by ${ACTOR}${note ? ` — ${note}` : ''}.` }));
  }, [log]);

  return { tenants, activity, reactivated, policies, setPolicies, reviewTenant, reactivate, log };
}
