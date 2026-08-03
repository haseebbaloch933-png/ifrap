/**
 * Pilot verification: exercise the persistence seam against a live Postgres.
 *
 * Runs the SAME getAll/insert/update/transaction functions the API routes use
 * when DATABASE_URL is set — it imports the Postgres adapter (lib/server/pg-store.ts)
 * directly, so it verifies the real adapter, not a re-implementation. (The
 * dispatcher in lib/server/store.ts selects this exact module when DATABASE_URL
 * is present; it is imported directly here because raw Node ESM can't resolve the
 * dispatcher's extensionless relative imports the way Next's bundler does.)
 *
 * Usage (requires Node >= 22 for --experimental-strip-types to import the TS):
 *
 *   # Bring up the pilot DB (docker compose up -d db-postgis), then:
 *   DATABASE_URL=postgres://postgres:postgres@localhost:5432/ifrap_production \
 *     node --experimental-strip-types scripts/verify-store.mjs
 *
 * With no DATABASE_URL it SKIPS (exit 0) — safe to wire into CI as a no-op until
 * a database is available. It uses a throwaway `smoke_test` collection and
 * cleans up after itself.
 */
import assert from 'node:assert';

if (!process.env.DATABASE_URL) {
  console.log('SKIP: DATABASE_URL not set — nothing to verify (file-store default is used).');
  console.log('      Set DATABASE_URL to a running Postgres to exercise the pg adapter.');
  process.exit(0);
}

const COLLECTION = 'smoke_test';

const store = await import('../lib/server/pg-store.ts');

try {
  // 1. Seed-on-first-access: getAll with a 2-record seed returns both in order.
  const seed = [
    { id: 'sm-1', label: 'first' },
    { id: 'sm-2', label: 'second' },
  ];
  let all = await store.getAll(COLLECTION, seed);
  assert.strictEqual(all.length, 2, 'seed should create 2 records');
  assert.strictEqual(all[0].id, 'sm-1', 'seed order preserved');

  // 2. insert prepends (newest first), matching the file store's unshift().
  await store.insert(COLLECTION, { id: 'sm-3', label: 'third' }, seed);
  all = await store.getAll(COLLECTION, seed);
  assert.strictEqual(all.length, 3, 'insert adds a record');
  assert.strictEqual(all[0].id, 'sm-3', 'insert prepends (newest first)');

  // 3. update merges a patch and returns the merged record.
  const updated = await store.update(COLLECTION, 'sm-1', { label: 'patched' }, seed);
  assert.ok(updated && updated.label === 'patched', 'update merges patch');
  const missing = await store.update(COLLECTION, 'does-not-exist', { label: 'x' }, seed);
  assert.strictEqual(missing, null, 'update of missing id returns null');

  // 4. transaction sees existing data and persists atomic id generation.
  const newId = await store.transaction(COLLECTION, seed, (data) => {
    const id = `sm-${data.length + 1}`;
    data.push({ id, label: 'tx' });
    return id;
  });
  all = await store.getAll(COLLECTION, seed);
  assert.ok(all.some((r) => r.id === newId), 'transaction persisted new record');

  console.log(`PASS: pg adapter verified (${all.length} records after full run).`);
} finally {
  // Clean up the throwaway collection so reruns start fresh.
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query('DELETE FROM app_store WHERE collection = $1', [COLLECTION]);
  await pool.query('DELETE FROM app_store_meta WHERE collection = $1', [COLLECTION]);
  await pool.end();
}

process.exit(0);
