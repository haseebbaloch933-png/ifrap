/**
 * Field-encryption regression test. Exercises the REAL at-rest crypto the
 * routes use (lib/server/field-crypto.ts) — imported directly, no server/DB.
 * Proves the property that makes "encryption at rest" true: sealed values are
 * unreadable ciphertext on disk, round-trip exactly for both strings and
 * objects, fail closed on tampering, and pass through untouched when no key is
 * configured (dev).
 *
 * Usage (Node >= 22 for --experimental-strip-types):
 *   node --experimental-strip-types scripts/verify-field-crypto.mjs
 */
import assert from 'node:assert';
import crypto from 'node:crypto';

const mod = await import('../lib/server/field-crypto.ts');
const { sealValue, openValue, sealFields, openFields, isSealed, isEncryptionEnabled } = mod;

let failures = 0;
const check = (label, cond) => {
  if (cond) console.log(`  [PASS] ${label}`);
  else { failures++; console.error(`  [FAIL] ${label}`); }
};

// ---- Disabled mode (no key): passthrough --------------------------------
delete process.env.DATA_ENCRYPTION_KEY;
console.log('--- encryption disabled (dev, no key) ---');
check('isEncryptionEnabled() is false', isEncryptionEnabled() === false);
check('sealValue passes strings through unchanged', sealValue('Bibi Bakhtawar') === 'Bibi Bakhtawar');
check('sealFields leaves record readable', sealFields({ description: 'water dispute', district: 'Ziarat' }, ['description']).description === 'water dispute');

// ---- Enabled mode (key set): real encryption ----------------------------
process.env.DATA_ENCRYPTION_KEY = crypto.randomBytes(32).toString('base64');
console.log('\n--- encryption enabled (key set) ---');
check('isEncryptionEnabled() is true', isEncryptionEnabled() === true);

// String round-trip + at-rest unreadable
const sealedStr = sealValue('Mir Jan Raisani');
check('sealed string is an envelope', isSealed(sealedStr) === true);
check('sealed string does NOT contain the plaintext', !String(sealedStr).includes('Mir Jan Raisani'));
check('string round-trips exactly', openValue(sealedStr) === 'Mir Jan Raisani');

// Object round-trip (field-log payload case)
const payload = { narrative: 'Dispute at Karez Chashma', gps: [30.1, 66.9], respondent: 'Sardar Gul' };
const sealedObj = sealValue(payload);
check('sealed object is an envelope string', typeof sealedObj === 'string' && isSealed(sealedObj));
check('sealed object does NOT contain plaintext narrative', !String(sealedObj).includes('Karez Chashma'));
check('object round-trips deeply', JSON.stringify(openValue(sealedObj)) === JSON.stringify(payload));

// Record-level seal/open, mixed sensitive + clear fields
const ticket = { id: 'GRM-2026-009', district: 'Quetta', status: 'OPEN', description: 'secret grievance', submitterName: 'Malik Dost' };
const sealedRec = sealFields(ticket, ['description', 'submitterName']);
check('clear field (district) stays readable', sealedRec.district === 'Quetta');
check('clear field (id) stays readable', sealedRec.id === 'GRM-2026-009');
check('sensitive field (description) is sealed', isSealed(sealedRec.description));
check('sensitive field (submitterName) is sealed', isSealed(sealedRec.submitterName));
const opened = openFields(sealedRec, ['description', 'submitterName']);
check('record round-trips (description)', opened.description === 'secret grievance');
check('record round-trips (submitterName)', opened.submitterName === 'Malik Dost');

// Idempotence: sealing an already-sealed field doesn't double-seal
const twice = sealFields(sealedRec, ['description']);
check('sealing is idempotent (no double-seal)', twice.description === sealedRec.description);

// Tamper detection: flipping a byte of the ciphertext must fail (GCM auth)
const parts = String(sealedStr).slice('enc:v1:'.length).split('.');
const ctBuf = Buffer.from(parts[2], 'base64');
ctBuf[0] ^= 0xff;
const tampered = `enc:v1:${parts[0]}.${parts[1]}.${ctBuf.toString('base64')}`;
let threw = false;
try { openValue(tampered); } catch { threw = true; }
check('tampered ciphertext fails to decrypt', threw === true);

// Wrong key cannot read data sealed under a different key
const sealedUnderKey1 = sealValue('protected');
process.env.DATA_ENCRYPTION_KEY = crypto.randomBytes(32).toString('base64');
let wrongKeyThrew = false;
try { openValue(sealedUnderKey1); } catch { wrongKeyThrew = true; }
check('a different key cannot decrypt', wrongKeyThrew === true);

if (failures > 0) {
  console.error(`\nFAIL: ${failures} check(s) failed.`);
  process.exit(1);
}
console.log('\nPASS: passthrough when disabled; strings & objects round-trip; sealed data unreadable; tamper & wrong-key fail closed.');
// No explicit process.exit(0) — see the note in the other verify:* scripts.
