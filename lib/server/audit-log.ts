/**
 * Immutable, tamper-evident access/audit log (server-only).
 *
 * World Bank ESS10 expects an auditable record of who accessed or modified
 * sensitive grievance / land-tenure / field data. This module records one
 * entry per access to the sensitive routes (GRM, fiduciary, field-logs),
 * chained by hash so that any later edit or deletion of a past entry is
 * DETECTABLE — the realistic "immutable" property for a file/DB-backed store
 * (we can't make the medium literally write-once, but we can make tampering
 * provable via verifyAuditChain()).
 *
 * The pure hash-chain logic lives in lib/server/audit-hash.ts; this module
 * composes it with the persistence seam. The append runs inside the store's
 * per-collection transaction lock, so concurrent appends can't fork the chain
 * within an instance (cross-instance ordering relies on the same
 * Postgres/single-instance guarantees as the rest of the store).
 *
 * Persistence goes through lib/server/store, so it follows DATABASE_URL: file
 * store in dev, Postgres in the pilot.
 */
import { getAll, transaction } from '@/lib/server/store';
import {
  buildChainedEntry,
  verifyChain,
  type AuditEntry,
  type AuditActor,
  type AuditAction,
  type AuditChainVerification,
} from '@/lib/server/audit-hash';

export type { AuditEntry, AuditActor, AuditAction, AuditChainVerification };

const COLLECTION = 'audit-log';

/** Actor from a verified NextAuth JWT (getToken). */
export function actorFromToken(token: any): AuditActor {
  return {
    sub: String(token?.sub ?? token?.email ?? 'unknown'),
    email: String(token?.email ?? ''),
    role: String(token?.role ?? ''),
  };
}

/** Actor from a getServerSession() session. */
export function actorFromSession(session: any): AuditActor {
  const u = session?.user ?? {};
  return {
    sub: String(u.id ?? u.email ?? 'unknown'),
    email: String(u.email ?? ''),
    role: String(u.role ?? ''),
  };
}

/** Anonymous actor for unauthenticated / denied attempts. */
export const ANONYMOUS_ACTOR: AuditActor = { sub: 'anonymous', email: '', role: '' };

export interface RecordAuditInput {
  actor: AuditActor;
  method: string;
  route: string;
  action: AuditAction;
  status: number;
  target?: string;
}

/**
 * Append one entry to the chain. Read-tip + compute + write happen atomically
 * inside the store transaction lock so the chain can't fork within an instance.
 * The stored array is newest-first (store prepends).
 */
export async function appendAuditEntry(input: RecordAuditInput): Promise<AuditEntry> {
  return transaction<AuditEntry, AuditEntry>(COLLECTION, [], (data) => {
    const entry = buildChainedEntry(data, {
      id: `AUD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      at: new Date().toISOString(),
      actor: input.actor,
      method: input.method,
      route: input.route,
      action: input.action,
      status: input.status,
      target: input.target,
    });
    data.unshift(entry);
    return entry;
  });
}

/**
 * Fail-open audit recorder: never throws into the caller, so a store hiccup
 * can't break the primary operation. Logs to the server console on failure.
 *
 * NOTE (production hardening): a stricter deployment may prefer FAIL-CLOSED —
 * refuse the sensitive operation if it cannot be audited. That is a policy
 * decision for the FPMU; this pilot logs-and-continues and surfaces the miss
 * in the server logs.
 */
export async function recordAudit(input: RecordAuditInput): Promise<void> {
  try {
    await appendAuditEntry(input);
  } catch (err: any) {
    console.error('[audit-log] failed to record entry (operation continued):', err?.message || err);
  }
}

/** Recompute and verify the whole chain from the persisted entries. */
export async function verifyAuditChain(): Promise<AuditChainVerification> {
  const data = await getAll<AuditEntry>(COLLECTION, []);
  return verifyChain(data);
}

/** Return all audit entries, newest-first (as stored). */
export function getAuditEntries(): Promise<AuditEntry[]> {
  return getAll<AuditEntry>(COLLECTION, []);
}
