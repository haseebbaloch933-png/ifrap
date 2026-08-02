const assert = require('assert');
const { validatePayload } = require('../../backend/ingest');

function runAdversarialIngestTests() {
  console.log('=== [Ingest Module Adversarial & Edge Case Tests] ===');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`✔ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. Degenerate & Edge Case Payloads
  test('Null payload', () => {
    const res = validatePayload(null);
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.message, "Empty payload body");
  });

  test('Undefined payload', () => {
    const res = validatePayload(undefined);
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.message, "Empty payload body");
  });

  test('Non-object payload (string)', () => {
    const res = validatePayload("invalid string payload");
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.message, "Empty payload body");
  });

  test('Empty object payload', () => {
    const res = validatePayload({});
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.message, "Empty payload body");
  });

  // 2. Missing Fields Tests
  test('Missing respondent fields (only spatial present)', () => {
    const res = validatePayload({ geopoint: "30.1798 66.9750 0 0" });
    assert.strictEqual(res.valid, false);
    assert.match(res.message, /Missing required respondent attributes/);
  });

  test('Missing spatial fields (only respondent present)', () => {
    const res = validatePayload({ cnic: "54400-1234567-1" });
    assert.strictEqual(res.valid, false);
    assert.match(res.message, /Missing required spatial attributes/);
  });

  test('Empty string respondent attributes', () => {
    const res = validatePayload({ cnic: "", respondent_name: "", geopoint: "30.1798 66.9750" });
    assert.strictEqual(res.valid, false);
    assert.match(res.message, /Missing required respondent attributes/);
  });

  test('Empty string spatial attributes', () => {
    const res = validatePayload({ cnic: "54400-1234567-1", geopoint: "", geoshape: "" });
    assert.strictEqual(res.valid, false);
    assert.match(res.message, /Missing required spatial attributes/);
  });

  // 3. Alternative Field Names
  test('Respondent aliases: _cnic', () => {
    const res = validatePayload({ _cnic: "54400-1234567-1", geopoint: "30.1798 66.9750" });
    assert.strictEqual(res.valid, true);
  });

  test('Respondent aliases: full_name', () => {
    const res = validatePayload({ full_name: "Tariq Khan", geopoint: "30.1798 66.9750" });
    assert.strictEqual(res.valid, true);
  });

  test('Respondent aliases: name', () => {
    const res = validatePayload({ name: "Aisha", geotrace: "30 66; 30 67" });
    assert.strictEqual(res.valid, true);
  });

  // 4. SQL Injection payloads in string attributes (Validation level check)
  test('SQL Injection payload in respondent_name', () => {
    const res = validatePayload({
      respondent_name: "Robert'; DROP TABLE la_party; --",
      geopoint: "30.1798 66.9750 0 0"
    });
    // Ingest only checks presence of fields
    assert.strictEqual(res.valid, true);
  });

  test('SQL Injection payload in cnic', () => {
    const res = validatePayload({
      cnic: "' OR '1'='1",
      geoshape: "30 66 0 0; 30 67 0 0; 31 67 0 0; 30 66 0 0"
    });
    assert.strictEqual(res.valid, true);
  });

  console.log(`\nSummary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runAdversarialIngestTests();
