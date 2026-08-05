/**
 * Audit-log tamper-evidence regression test. Exercises the REAL hash-chain
 * primitives the app uses (lib/server/audit-hash.ts) — imported directly so
 * this runs with no server, DB, or env. Proves the property that makes the
 * audit log "immutable" in the ESS10 sense: a clean chain verifies, and ANY
 * edit / reorder / deletion of a past entry is detected.
 *
 * Usage (Node >= 22 for --experimental-strip-types):
 *   node --experimental-strip-types scripts/verify-audit-log.mjs
 */
import assert from 'node:assert';

const { buildChainedEntry, verifyChain, GENESIS_HASH } = await import('../lib/server/audit-hash.ts');

// Build a small chain the way audit-log.ts does: prepend each new entry.
function append(chain, fields) {
  const entry = buildChainedEntry(chain, fields);
  chain.unshift(entry);
  return entry;
}

const actor = (role) => ({ sub: `usr-${role}`, email: `${role}@ifrap.gov.pk`, role });

let chain = [];
append(chain, { id: 'AUD-1', at: '2026-08-04T09:00:00.000Z', actor: actor('FPMU_DIRECTOR'), method: 'GET', route: '/api/grm', action: 'LIST', status: 200 });
append(chain, { id: 'AUD-2', at: '2026-08-04T09:01:00.000Z', actor: actor('PROVINCIAL_PIU'), method: 'POST', route: '/api/grm', action: 'CREATE', status: 201, target: 'GRM-2026-007' });
append(chain, { id: 'AUD-3', at: '2026-08-04T09:02:00.000Z', actor: actor('PROVINCIAL_PIU'), method: 'POST', route: '/api/fiduciary', action: 'ISSUE_CERT', status: 200, target: 'IFRAP-QUE-4821' });

let failures = 0;
const check = (label, cond) => {
  if (cond) { console.log(`  [PASS] ${label}`); }
  else { failures++; console.error(`  [FAIL] ${label}`); }
};

console.log('--- audit chain: clean chain verifies ---');
const clean = verifyChain(chain);
check('genesis link on first entry', chain[chain.length - 1].prevHash === GENESIS_HASH);
check('sequence numbers are 1..N', chain.map((e) => e.seq).sort((a, b) => a - b).join(',') === '1,2,3');
check('verifyChain reports valid', clean.valid === true && clean.entries === 3);

console.log('\n--- audit chain: an edited past entry is detected ---');
// Tamper: flip the recorded status of the middle entry (seq 2) in a deep copy.
const editedContent = JSON.parse(JSON.stringify(chain));
const mid = editedContent.find((e) => e.seq === 2);
mid.status = 999; // e.g. hiding that an action really failed/succeeded
const r1 = verifyChain(editedContent);
check('edited entry breaks verification', r1.valid === false);
check('reports the tampered seq (2)', r1.brokenAtSeq === 2);

console.log('\n--- audit chain: a changed actor is detected ---');
const editedActor = JSON.parse(JSON.stringify(chain));
editedActor.find((e) => e.seq === 3).actor.email = 'someone-else@ifrap.gov.pk';
check('changed actor breaks verification', verifyChain(editedActor).valid === false);

console.log('\n--- audit chain: a deleted entry is detected ---');
const deleted = JSON.parse(JSON.stringify(chain)).filter((e) => e.seq !== 2); // remove the middle link
const r2 = verifyChain(deleted);
check('deleting an entry breaks the chain', r2.valid === false);

console.log('\n--- audit chain: reordering is detected ---');
const reordered = JSON.parse(JSON.stringify(chain));
[reordered[0], reordered[1]] = [reordered[1], reordered[0]];
check('reordering entries breaks the chain', verifyChain(reordered).valid === false);

if (failures > 0) {
  console.error(`\nFAIL: ${failures} check(s) failed.`);
  process.exit(1);
}
console.log('\nPASS: clean chain verifies; edit / actor-change / deletion / reorder all detected.');
// No explicit process.exit(0): on this platform, forcing exit right after a
// dynamic import() of a strip-types module can crash during handle teardown
// and report a misleading code. Fall off the end so Node exits 0 naturally.
