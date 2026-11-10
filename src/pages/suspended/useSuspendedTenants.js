import { useCallback, useState } from 'react';
import { DEFAULT_POLICIES, REVIEW, SEED_ACTIVITY, SEED_TENANTS } from '../../data/suspendedData.js';

const pad = (n) => String(n).padStart(2, '0');
const nowStamp = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const ACTOR = 'David Miller';
const REJECTED = 'Rejected';

/** A history entry. `date` is YYYY-MM-DD and `time` is HH:MM, both taken from a nowStamp() value. */
const historyEntry = (at, text) => ({ date: at.slice(0, 10), time: at.slice(11), text, by: ACTOR });

/**
 * Local demo state for suspended tenants. Lives in App so it survives page switches; nothing is sent to a server.
 *
 * - `tenants`            tenants that are currently suspended (the list on the Suspended Tenants page)
 * - `reactivatedTenants` tenants that were reactivated in this session (kept so their details page and history stay available,
 *                        and so they can be suspended again)
 */
export default function useSuspendedTenants() {
  const [tenants, setTenants] = useState(SEED_TENANTS);
  const [reactivatedTenants, setReactivatedTenants] = useState([]);
  const [activity, setActivity] = useState(SEED_ACTIVITY);
  const [reactivated, setReactivated] = useState(0);
  const [policies, setPolicies] = useState(DEFAULT_POLICIES);

  const log = useCallback((entry) => setActivity((a) => [{ id: `a${Date.now()}${Math.random().toString(16).slice(2, 6)}`, at: nowStamp(), ...entry }, ...a]), []);

  const reviewTenant = useCallback((tenant, status, note) => {
    const at = nowStamp();
    setTenants((ts) => ts.map((t) => (t.id === tenant.id
      ? { ...t, review: status, status, reviewedBy: ACTOR, reviewedOn: at, reviewNote: note, history: [...t.history, historyEntry(at, `Review: ${status}. ${note}`)] }
      : t)));
    log({
      kind: status === REVIEW.CRITICAL ? 'flagged' : 'reviewed',
      company: tenant.name,
      text: status === REVIEW.ELIGIBLE ? 'Review complete — eligible for reactivation.'
        : status === REVIEW.CRITICAL ? 'Escalated to Critical after review.'
        : status === REJECTED ? 'Reactivation request rejected after review.'
        : 'Investigation opened / continued.',
    });
  }, [log]);

  const reactivate = useCallback((list, note) => {
    const at = nowStamp();
    const ids = new Set(list.map((t) => t.id));
    setTenants((ts) => ts.filter((t) => !ids.has(t.id)));
    setReactivatedTenants((rs) => [
      ...list.map((t) => ({
        ...t, accountStatus: 'Active', status: 'Active', review: 'Active', reactivatedAt: at,
        history: [...t.history, historyEntry(at, `Tenant reactivated${note ? ` — ${note}` : ''}`)],
      })),
      ...rs.filter((r) => !ids.has(r.id)),
    ]);
    setReactivated((n) => n + list.length);
    list.forEach((t) => log({ kind: 'reactivated', company: t.name, text: `Reactivated by ${ACTOR}${note ? ` — ${note}` : ''}.` }));
  }, [log]);

  /** Suspend an active tenant (one that was reactivated here, or a future active tenant). */
  const suspendTenant = useCallback((tenant, reason, note) => {
    const at = nowStamp();
    setReactivatedTenants((rs) => rs.filter((r) => r.id !== tenant.id));
    setTenants((ts) => {
      const { accountStatus, reactivatedAt, reviewedBy, reviewedOn, reviewNote, ...rest } = tenant;
      const record = {
        ...rest, reason, status: REVIEW.PENDING, review: REVIEW.PENDING,
        suspendedDate: at, suspendedBy: ACTOR, reviewDate: null,
        notes: note, note, detail: note,
        history: [...tenant.history, historyEntry(at, `Tenant suspended — ${reason}. ${note}`)],
      };
      return [record, ...ts.filter((t) => t.id !== tenant.id)];
    });
    log({ kind: 'suspended', company: tenant.name, text: `Suspended by ${ACTOR} — ${reason}.` });
  }, [log]);

  return { tenants, reactivatedTenants, activity, reactivated, policies, setPolicies, reviewTenant, reactivate, suspendTenant, log };
}