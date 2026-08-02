const assert = require('assert');
const { validatePayload, app, redisClient } = require('./ingest');

function runTests() {
  console.log('=== [Ingest Module Unit Tests] ===');

  // Test 1: Empty payload
  const emptyRes = validatePayload({});
  assert.strictEqual(emptyRes.valid, false);
  console.log('✔ Reject empty payload test passed');

  // Test 2: Missing respondent attributes
  const missingRespRes = validatePayload({ geoshape: '30 66 0 0; 30 67 0 0; 31 67 0 0; 30 66 0 0' });
  assert.strictEqual(missingRespRes.valid, false);
  console.log('✔ Reject payload missing respondent attributes test passed');

  // Test 3: Missing spatial attributes
  const missingSpatialRes = validatePayload({ respondent_name: 'Gul Khan', cnic: '54400-1234567-1' });
  assert.strictEqual(missingSpatialRes.valid, false);
  console.log('✔ Reject payload missing spatial attributes test passed');

  // Test 4: Valid payload with cnic and geoshape
  const validRes = validatePayload({
    cnic: '54400-1234567-1',
    geoshape: '30.1798 66.9750 0 0; 30.1800 66.9750 0 0; 30.1800 66.9760 0 0; 30.1798 66.9750 0 0'
  });
  assert.strictEqual(validRes.valid, true);
  console.log('✔ Accept valid payload (cnic + geoshape) test passed');

  // Test 5: Valid payload with respondent_name and geopoint
  const validRes2 = validatePayload({
    respondent_name: 'Fatima',
    geopoint: '30.1798 66.9750 0 0'
  });
  assert.strictEqual(validRes2.valid, true);
  console.log('✔ Accept valid payload (respondent_name + geopoint) test passed');

  console.log('=== [Ingest Unit Tests: PASSED] ===');
  redisClient.disconnect().catch(() => {});
  process.exit(0);
}

runTests();
