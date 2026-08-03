/**
 * Persistence seam (server-only). API routes import getAll / insert / update /
 * transaction from here and never care which backend is in use.
 *
 * Backend selection:
 *   - DATABASE_URL set  -> Postgres adapter (lib/server/pg-store.ts).
 *       Concurrency-safe and multi-instance; the pilot/production target.
 *   - DATABASE_URL unset -> file adapter (lib/server/file-store.ts).
 *       Zero-dependency single-instance store under .data/; the dev default.
 *
 * The Postgres adapter is loaded lazily (dynamic import) so `pg` is only pulled
 * in when DATABASE_URL is actually configured — the file-store default has no
 * database dependency. Switching backends is a pure env-var change; no route or
 * component code changes (that is the point of the seam).
 */
import * as fileStore from './file-store';

const usePostgres = Boolean(process.env.DATABASE_URL);

type Backend = typeof import('./pg-store');

let backendPromise: Promise<Backend> | null = null;

function backend(): Promise<Backend> {
  if (usePostgres) {
    if (!backendPromise) backendPromise = import('./pg-store');
    return backendPromise;
  }
  // Resolve the file store through the same async shape so callers are uniform.
  return Promise.resolve(fileStore as unknown as Backend);
}

/** Return all records in a collection, seeding on first access. */
export async function getAll<T>(name: string, seed: T[] = []): Promise<T[]> {
  return (await backend()).getAll<T>(name, seed);
}

/** Prepend a record and persist. Returns the inserted record. */
export async function insert<T>(name: string, record: T, seed: T[] = []): Promise<T> {
  return (await backend()).insert<T>(name, record, seed);
}

/**
 * Read the collection, run `fn` against the mutable array, then persist the
 * result atomically. Use when a new record depends on existing data (e.g. id
 * generation) so read + write cannot interleave.
 */
export async function transaction<T, R>(name: string, seed: T[], fn: (data: T[]) => R): Promise<R> {
  return (await backend()).transaction<T, R>(name, seed, fn);
}

/** Patch the record with matching id. Returns the updated record, or null if not found. */
export async function update<T extends { id: string }>(
  name: string,
  id: string,
  patch: Partial<T>,
  seed: T[] = []
): Promise<T | null> {
  return (await backend()).update<T>(name, id, patch, seed);
}
