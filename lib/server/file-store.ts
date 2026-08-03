/**
 * File-backed persistence adapter (server-only) — the default when DATABASE_URL
 * is not set (dev / standalone single-instance).
 *
 * A minimal, dependency-free repository that survives server restarts by
 * writing JSON collections to a gitignored `.data/` directory. It implements
 * the same seam (getAll / insert / update / transaction) as the Postgres
 * adapter (lib/server/pg-store.ts); lib/server/store.ts dispatches between them.
 *
 * Concurrency: writes to a given collection are serialized by an in-process
 * promise chain, and each write is atomic (temp file + rename). This is adequate
 * for a single-instance dev/standalone deployment; multi-instance pilots should
 * set DATABASE_URL to switch to the Postgres adapter (that is the whole point
 * of the seam).
 */
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');

// Guard, checked once on the first real write: the lock below only
// coordinates writes within a single Node process. Run this store from more
// than one instance (the normal case for uptime) and two instances can each
// read-modify-write the same collection with no cross-instance coordination —
// the later rename silently overwrites the earlier insert, with no error
// anywhere (a GRM ticket or usufruct certificate one officer filed can simply
// vanish). Refuse to write in production unless a database is configured or
// the risk is explicitly acknowledged, rather than let that happen silently.
//
// Deliberately NOT a module-top-level check: Next.js evaluates route modules
// (to inspect their config) during `next build`'s page-data-collection step
// without ever invoking them, so a check that runs at import time fires
// during every production build regardless of whether the route is ever
// called. Gating the actual write call means it only fires when a real
// request tries to persist something against a real running server.
let guardChecked = false;
function assertMultiInstanceSafe(): void {
  if (guardChecked) return;
  guardChecked = true;
  if (
    process.env.NODE_ENV === 'production' &&
    !process.env.DATABASE_URL &&
    process.env.ACKNOWLEDGE_SINGLE_INSTANCE_STORE !== 'true'
  ) {
    throw new Error(
      'Refusing to write with the file-backed store in production: it is not safe ' +
        'across more than one running instance and can silently lose data. Set ' +
        'DATABASE_URL to use the Postgres adapter (see db/01_app_store.sql), or set ' +
        'ACKNOWLEDGE_SINGLE_INSTANCE_STORE=true if this deployment is deliberately ' +
        'and permanently single-instance.'
    );
  }
}

// Per-collection serialization: chain operations so reads/writes never interleave.
const chains = new Map<string, Promise<unknown>>();

function withLock<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const prev = chains.get(name) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  // Keep the chain alive but swallow errors so one failure doesn't poison the queue.
  chains.set(name, next.then(() => undefined, () => undefined));
  return next;
}

function fileFor(name: string): string {
  if (!/^[a-z0-9_-]+$/i.test(name)) throw new Error(`Invalid collection name: ${name}`);
  return path.join(DATA_DIR, `${name}.json`);
}

async function readRaw<T>(name: string, seed: T[]): Promise<T[]> {
  try {
    const raw = await fs.readFile(fileFor(name), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : seed;
  } catch (err: any) {
    if (err && err.code === 'ENOENT') {
      await writeRaw(name, seed);
      return seed;
    }
    throw err;
  }
}

async function writeRaw<T>(name: string, data: T[]): Promise<void> {
  assertMultiInstanceSafe();
  await fs.mkdir(DATA_DIR, { recursive: true });
  const file = fileFor(name);
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, file);
}

/** Return all records in a collection, seeding the file on first access. */
export function getAll<T>(name: string, seed: T[] = []): Promise<T[]> {
  return withLock(name, () => readRaw<T>(name, seed));
}

/** Prepend a record and persist. Returns the inserted record. */
export function insert<T>(name: string, record: T, seed: T[] = []): Promise<T> {
  return withLock(name, async () => {
    const data = await readRaw<T>(name, seed);
    data.unshift(record);
    await writeRaw(name, data);
    return record;
  });
}

/**
 * Run a mutation against the collection under lock. `fn` receives the current
 * (mutable) array, mutates it as needed, and returns a result; the array is then
 * persisted. Use this when the new record depends on existing data (e.g. id
 * generation) so read + write are atomic.
 */
export function transaction<T, R>(name: string, seed: T[], fn: (data: T[]) => R): Promise<R> {
  return withLock(name, async () => {
    const data = await readRaw<T>(name, seed);
    const result = fn(data);
    await writeRaw(name, data);
    return result;
  });
}

/** Patch the record with matching id. Returns the updated record, or null if not found. */
export function update<T extends { id: string }>(
  name: string,
  id: string,
  patch: Partial<T>,
  seed: T[] = []
): Promise<T | null> {
  return transaction<T, T | null>(name, seed, (data) => {
    const idx = data.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    data[idx] = { ...data[idx], ...patch };
    return data[idx];
  });
}
