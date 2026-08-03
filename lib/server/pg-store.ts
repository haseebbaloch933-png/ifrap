/**
 * Postgres persistence adapter (server-only) — used when DATABASE_URL is set.
 *
 * Implements the same seam (getAll / insert / update / transaction) as the file
 * adapter (lib/server/file-store.ts), so API routes never change. This is the
 * pilot migration target: it moves the app off the single-instance file store
 * onto a real, concurrency-safe, multi-instance database.
 *
 * Storage model: a generic JSONB collection store (`app_store`), one row per
 * record keyed by (collection, id), with an explicit `ord` column that
 * reproduces the file store's array semantics — getAll returns ORDER BY ord ASC,
 * and insert() prepends (smallest ord) to match the file store's unshift().
 * Seeding is once-per-collection, tracked in `app_store_meta`, so deleting all
 * rows does not silently reseed.
 *
 * NOTE: this generic JSONB store is the pragmatic pilot step. Mapping these
 * collections onto the normalized LADM schema in backend/db/init_schema.sql
 * (la_party / la_rrr / qualitative_field_logs / ...) is the production-phase
 * follow-up; both can live in the same database.
 *
 * Concurrency: every operation runs in a DB transaction that first takes a
 * per-collection advisory lock (pg_advisory_xact_lock), which serializes
 * mutations to the same collection across all app instances.
 */
import { Pool, type PoolClient } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.PGPOOL_MAX ?? 10),
    });
  }
  return pool;
}

function assertName(name: string): void {
  if (!/^[a-z0-9_-]+$/i.test(name)) throw new Error(`Invalid collection name: ${name}`);
}

let bootstrapped: Promise<void> | null = null;

/**
 * Idempotently create the store tables. Runs once per process. Safe even if
 * backend/db/*.sql has not been applied — the pilot works against a bare DB.
 */
function bootstrap(): Promise<void> {
  if (!bootstrapped) {
    bootstrapped = (async () => {
      await getPool().query(`
        CREATE TABLE IF NOT EXISTS app_store (
          collection  text        NOT NULL,
          id          text        NOT NULL,
          ord         bigint      NOT NULL,
          data        jsonb       NOT NULL,
          updated_at  timestamptz NOT NULL DEFAULT now(),
          PRIMARY KEY (collection, id)
        );
        CREATE INDEX IF NOT EXISTS idx_app_store_collection_ord
          ON app_store (collection, ord);
        CREATE TABLE IF NOT EXISTS app_store_meta (
          collection text PRIMARY KEY,
          seeded_at  timestamptz NOT NULL DEFAULT now()
        );
      `);
    })().catch((err) => {
      bootstrapped = null; // allow retry on a later call
      throw err;
    });
  }
  return bootstrapped;
}

function recordId<T>(record: T, fallback: string): string {
  const id = (record as any)?.id;
  return typeof id === 'string' && id.length > 0 ? id : fallback;
}

/** Seed a collection exactly once (tracked in app_store_meta). Runs inside the caller's txn. */
async function ensureSeeded<T>(client: PoolClient, name: string, seed: T[]): Promise<void> {
  const meta = await client.query('SELECT 1 FROM app_store_meta WHERE collection = $1', [name]);
  if ((meta.rowCount ?? 0) > 0) return;
  for (let i = 0; i < seed.length; i++) {
    const rec = seed[i];
    await client.query(
      `INSERT INTO app_store (collection, id, ord, data) VALUES ($1, $2, $3, $4)
       ON CONFLICT (collection, id) DO NOTHING`,
      [name, recordId(rec, String(i)), i, JSON.stringify(rec)]
    );
  }
  await client.query(
    'INSERT INTO app_store_meta (collection) VALUES ($1) ON CONFLICT (collection) DO NOTHING',
    [name]
  );
}

/**
 * Run `fn` inside a transaction holding a per-collection advisory lock, after
 * ensuring the collection's tables exist and its seed has been applied once.
 */
async function withCollection<T, R>(
  name: string,
  seed: T[],
  fn: (client: PoolClient) => Promise<R>
): Promise<R> {
  assertName(name);
  await bootstrap();
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    // Serialize concurrent mutations to this collection across instances.
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [name]);
    await ensureSeeded(client, name, seed);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch { /* ignore */ }
    throw err;
  } finally {
    client.release();
  }
}

/** Return all records in a collection (newest first — matches file store ordering). */
export function getAll<T>(name: string, seed: T[] = []): Promise<T[]> {
  return withCollection<T, T[]>(name, seed, async (client) => {
    const res = await client.query('SELECT data FROM app_store WHERE collection = $1 ORDER BY ord ASC', [name]);
    return res.rows.map((r) => r.data as T);
  });
}

/** Prepend a record and persist. Returns the inserted record. */
export function insert<T>(name: string, record: T, seed: T[] = []): Promise<T> {
  return withCollection<T, T>(name, seed, async (client) => {
    const min = await client.query('SELECT COALESCE(MIN(ord), 0) AS m FROM app_store WHERE collection = $1', [name]);
    const ord = Number(min.rows[0].m) - 1; // prepend => smaller ord sorts first
    await client.query(
      `INSERT INTO app_store (collection, id, ord, data) VALUES ($1, $2, $3, $4)
       ON CONFLICT (collection, id) DO UPDATE SET data = EXCLUDED.data, ord = EXCLUDED.ord, updated_at = now()`,
      [name, recordId(record, String(Math.abs(ord))), ord, JSON.stringify(record)]
    );
    return record;
  });
}

/**
 * Read the collection, run `fn` against the mutable array, then persist the
 * result (full replace, preserving array order). Read + write are atomic under
 * the per-collection advisory lock, so id generation from existing data is safe.
 */
export function transaction<T, R>(name: string, seed: T[], fn: (data: T[]) => R): Promise<R> {
  return withCollection<T, R>(name, seed, async (client) => {
    const res = await client.query('SELECT data FROM app_store WHERE collection = $1 ORDER BY ord ASC', [name]);
    const data = res.rows.map((r) => r.data as T);
    const result = fn(data);
    await client.query('DELETE FROM app_store WHERE collection = $1', [name]);
    for (let i = 0; i < data.length; i++) {
      const rec = data[i];
      await client.query(
        'INSERT INTO app_store (collection, id, ord, data) VALUES ($1, $2, $3, $4)',
        [name, recordId(rec, String(i)), i, JSON.stringify(rec)]
      );
    }
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
  return withCollection<T, T | null>(name, seed, async (client) => {
    const cur = await client.query(
      'SELECT data FROM app_store WHERE collection = $1 AND id = $2 FOR UPDATE',
      [name, id]
    );
    if ((cur.rowCount ?? 0) === 0) return null;
    const merged = { ...(cur.rows[0].data as T), ...patch };
    await client.query(
      'UPDATE app_store SET data = $3, updated_at = now() WHERE collection = $1 AND id = $2',
      [name, id, JSON.stringify(merged)]
    );
    return merged;
  });
}
