/**
 * Pure hash-chain primitives for the audit log — no store / no I/O, so they
 * can be unit-tested standalone (scripts/verify-audit-log.mjs) and reasoned
 * about in isolation. lib/server/audit-log.ts composes these with the
 * persistence seam.
 */
import crypto from 'crypto';

export const GENESIS_HASH = '0'.repeat(64);

export type AuditAction = 'LIST' | 'CREATE' | 'UPDATE' | 'INGEST' | 'ISSUE_CERT' | 'QUERY' | 'DENIED';

export interface AuditActor {
  sub: string;
  email: string;
  role: string;
}

export interface AuditEntry {
  id: string;
  seq: number;
  at: string; // ISO timestamp
  actor: AuditActor;
  method: string;
  route: string;
  action: AuditAction;
  status: number;
  target?: string;
  prevHash: string;
  hash: string;
}

export interface AuditChainVerification {
  valid: boolean;
  entries: number;
  brokenAtSeq?: number;
  reason?: string;
}

// Deterministic serialization of the hash-covered fields, in fixed order.
export function canonical(e: Omit<AuditEntry, 'hash'>): string {
  return JSON.stringify([
    e.id,
    e.seq,
    e.at,
    e.actor.sub,
    e.actor.email,
    e.actor.role,
    e.method,
    e.route,
    e.action,
    e.status,
    e.target ?? null,
    e.prevHash,
  ]);
}

export function computeHash(e: Omit<AuditEntry, 'hash'>): string {
  return crypto.createHash('sha256').update(canonical(e)).digest('hex');
}

/** The identifying/content fields of a new entry, before chaining metadata. */
export type AuditEntryFields = Pick<
  AuditEntry,
  'id' | 'at' | 'actor' | 'method' | 'route' | 'action' | 'status' | 'target'
>;

/**
 * Given the current chain (stored newest-first) and a new entry's content
 * fields, produce the fully-chained entry (assigns seq, prevHash, hash) ready
 * to prepend.
 */
export function buildChainedEntry(newestFirst: AuditEntry[], fields: AuditEntryFields): AuditEntry {
  const tip = newestFirst[0];
  const prevHash = tip ? tip.hash : GENESIS_HASH;
  const seq = tip ? tip.seq + 1 : 1;
  const base: Omit<AuditEntry, 'hash'> = { ...fields, seq, prevHash };
  return { ...base, hash: computeHash(base) };
}

/**
 * Verify a chain given the stored (newest-first) array. Walks oldest-first,
 * checking every prevHash link and recomputing every entry hash. Any tamper
 * (edited field, reordered/removed entry) breaks a link and is reported with
 * the first offending seq.
 */
export function verifyChain(newestFirst: AuditEntry[]): AuditChainVerification {
  const chain = [...newestFirst].reverse();
  let prevHash = GENESIS_HASH;
  for (const e of chain) {
    if (e.prevHash !== prevHash) {
      return { valid: false, entries: chain.length, brokenAtSeq: e.seq, reason: 'prevHash link mismatch' };
    }
    const { hash, ...rest } = e;
    if (computeHash(rest) !== hash) {
      return { valid: false, entries: chain.length, brokenAtSeq: e.seq, reason: 'entry hash mismatch (content altered)' };
    }
    prevHash = e.hash;
  }
  return { valid: true, entries: chain.length };
}
