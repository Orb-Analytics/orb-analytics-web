// Regression test for js/nfl-picks.js's gradeSpreadPick(). Plain Node
// script (no test framework in this repo) -- run directly, exits
// non-zero on any failure.
//
// spread_grading_fixture.json in this directory is duplicated
// byte-for-byte from Orb-Analytics/NFL-Model's
// tests/spread_grading_fixture.json, tested there against the Python
// twin (grade_pick() in scripts/spread_grading.py). Keep both copies in
// sync -- that's the whole point of this fixture: two implementations of
// the same math, in two languages, can't independently drift without a
// matching test failing to surface it.
//
// Run:
//     node tests/spread-grading.test.js
const fs = require('fs');
const path = require('path');
const { gradeSpreadPick } = require('../js/nfl-picks.js');

const cases = JSON.parse(fs.readFileSync(path.join(__dirname, 'spread_grading_fixture.json'), 'utf8'));

let failures = 0;
for (const c of cases) {
  const actual = gradeSpreadPick(c.pick, c.home_team, c.home_score, c.away_score, c.spread);
  const ok = actual === c.expected_result;
  console.log(`${ok ? 'OK' : 'FAIL'}: ${c.name} -> expected ${c.expected_result}, got ${actual}`);
  if (!ok) failures++;
}

if (failures) {
  console.log(`\n${failures} of ${cases.length} case(s) failed.`);
  process.exit(1);
}
console.log(`\nAll ${cases.length} case(s) passed.`);
