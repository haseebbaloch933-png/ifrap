/**
 * PII scrubber regression test: exercises the REAL scrubber (lib/privacy/
 * ner-pii-scrubber.ts) against realistic Balochistan-context sample inputs,
 * not a re-implementation. Written after an audit found the phone regex
 * missed manually-spaced numbers and the name regex missed suffix honorifics
 * ("Nazneen Bibi" vs. the previously-only-matched "Malik Gul Khan").
 *
 * This is a "documented test set" in the sense the audit asked for: a plain
 * table anyone — including a non-engineer FPMU data lead — can read, verify,
 * and extend with more real name/phone examples over time. It is NOT a
 * substitute for a trained NER model; several cases below are marked
 * `knownGap: true` and are EXPECTED to still leak, on purpose, so that
 * silent regressions are the only thing that fails this script.
 *
 * Usage (requires Node >= 22 for --experimental-strip-types to import the TS):
 *   node --experimental-strip-types scripts/verify-pii-scrubber.mjs
 *
 * No external services or env vars needed — the scrubber is pure/offline.
 */
import assert from 'node:assert';

const { redactContactInfo, redactNames, redactCNIC, scrubPayload } = await import(
  '../lib/privacy/ner-pii-scrubber.ts'
);

// --- String-level cases -----------------------------------------------------
// Each case runs through the relevant redact* function. `mustNotContain` is
// the raw PII substring that must be gone from the output; `mustContain` is
// the redaction marker that must appear. `knownGap: true` inverts the
// assertion — the case documents PII that is EXPECTED to survive today.
const CASES = [
  {
    id: 'phone-double-space',
    fn: redactContactInfo,
    input: 'Contact the Mirab representative at 0333 445 6677 for details.',
    mustNotContain: '0333 445 6677',
    mustContain: '[REDACTED_PHONE]',
  },
  {
    id: 'phone-plus92-spaced',
    fn: redactContactInfo,
    input: 'Reachable on +92 300 123 4567 during survey hours.',
    mustNotContain: '+92 300 123 4567',
    mustContain: '[REDACTED_PHONE]',
  },
  {
    id: 'phone-dashed-regression',
    fn: redactContactInfo,
    input: 'Call 0333-4456677 to confirm.',
    mustNotContain: '0333-4456677',
    mustContain: '[REDACTED_PHONE]',
  },
  {
    id: 'phone-compact-regression',
    fn: redactContactInfo,
    input: 'Number on file: 03001234567.',
    mustNotContain: '03001234567',
    mustContain: '[REDACTED_PHONE]',
  },
  {
    id: 'name-suffix-honorific',
    fn: redactNames,
    input: 'Nazneen Bibi confirmed the water allocation dispute during the visit.',
    mustNotContain: 'Nazneen Bibi',
    mustContain: '[REDACTED_PERSON]',
  },
  {
    id: 'name-prefix-honorific-regression',
    fn: redactNames,
    input: 'Malik Gul Khan raised the concern with the field team.',
    mustNotContain: 'Malik Gul Khan',
    mustContain: '[REDACTED_PERSON]',
  },
  {
    id: 'name-bare-no-honorific',
    fn: redactNames,
    input: 'Nazeer Ahmed and his neighbor confirmed the water share allocation.',
    mustNotContain: undefined,
    mustContain: 'Nazeer Ahmed', // still present — this is the point of the case
    knownGap: true,
  },
];

// --- scrubPayload (object-level) end-to-end case ----------------------------
// Mirrors a realistic field-log submission: a labeled person-name key, a
// phone number embedded in free-text narrative, and a CNIC.
const SAMPLE_FIELD_LOG = {
  respondent_name: 'Bibi Bakhtawar',
  district: 'Ziarat',
  narrative:
    'Respondent (CNIC 54200-1234567-3) can be reached at 0345 678 9012 regarding the Mirab council dispute.',
};

function runStringCases() {
  let failures = 0;
  for (const c of CASES) {
    const output = c.fn(c.input);
    try {
      if (c.knownGap) {
        assert.ok(output.includes(c.mustContain), `[${c.id}] expected known-gap text to still be present`);
      } else {
        assert.ok(!output.includes(c.mustNotContain), `[${c.id}] raw PII "${c.mustNotContain}" leaked into output: "${output}"`);
        assert.ok(output.includes(c.mustContain), `[${c.id}] expected marker "${c.mustContain}" missing from output: "${output}"`);
      }
      console.log(`  [PASS] ${c.id}${c.knownGap ? ' (documented known gap)' : ''}`);
    } catch (err) {
      failures++;
      console.error(`  [FAIL] ${c.id}: ${err.message}`);
    }
  }
  return failures;
}

function runObjectCase() {
  const scrubbed = scrubPayload(SAMPLE_FIELD_LOG);
  const asStr = JSON.stringify(scrubbed);
  const checks = [
    ['respondent_name redacted', !asStr.includes('Bibi Bakhtawar')],
    ['CNIC redacted', !asStr.includes('54200-1234567-3') && asStr.includes('CNIC_HASH_')],
    ['narrative phone redacted', !asStr.includes('0345 678 9012') && asStr.includes('[REDACTED_PHONE]')],
    ['district survives (not over-redacted)', asStr.includes('Ziarat')],
  ];
  let failures = 0;
  for (const [label, ok] of checks) {
    if (ok) {
      console.log(`  [PASS] scrubPayload: ${label}`);
    } else {
      failures++;
      console.error(`  [FAIL] scrubPayload: ${label} — got ${asStr}`);
    }
  }
  return failures;
}

console.log('--- PII scrubber regression (string-level) ---');
const stringFailures = runStringCases();
console.log('\n--- PII scrubber regression (scrubPayload, object-level) ---');
const objectFailures = runObjectCase();

const total = stringFailures + objectFailures;
if (total > 0) {
  console.error(`\nFAIL: ${total} regression(s). See above.`);
  process.exit(1);
}
console.log(`\nPASS: ${CASES.length} string case(s) + object-level checks, all as expected (including ${CASES.filter((c) => c.knownGap).length} documented known gap).`);
// No explicit process.exit(0) here: on this platform, forcing an exit right
// after a dynamic import() of a --experimental-strip-types module can crash
// during Node's own handle teardown (unrelated to the test result above) and
// report a misleading non-zero code. Falling off the end lets Node exit 0
// naturally once the event loop drains.
