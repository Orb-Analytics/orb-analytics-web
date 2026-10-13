// Tests for js/odds-source.js. Plain Node script (no test framework in
// this repo) -- run directly, exits non-zero on any failure.
//
// Run:
//     node tests/odds-source.test.js
const { oddsSourceName, oddsSourceHTML } = require('../js/odds-source.js');

const cases = [
  ['novig', 'Novig'],
  ['bdl:draftkings', 'DraftKings'],
  ['bdl:fanduel', 'FanDuel'],
  ['BDL:DraftKings', 'DraftKings'],
  [' bdl:betmgm ', 'BetMGM'],
  ['bdl:someNewBook', 'someNewBook'],
  [undefined, null],
  [null, null],
  ['', null],
  ['bdl:', null],
  [42, null],
];

let failures = 0;
for (const [input, expected] of cases) {
  const got = oddsSourceName(input);
  const ok = got === expected;
  if (!ok) failures++;
  console.log(`${ok ? 'OK' : 'FAIL'}: ${JSON.stringify(input)} -> expected ${JSON.stringify(expected)}, got ${JSON.stringify(got)}`);
}

const htmlCases = [
  [{ odds_source: 'bdl:draftkings' }, '<div class="odds-source">Odds via DraftKings</div>'],
  [{ odds_source: 'novig' }, '<div class="odds-source">Odds via Novig</div>'],
  [{}, ''],
  [null, ''],
  [{ odds_source: 'bdl:<img>' }, '<div class="odds-source">Odds via &lt;img&gt;</div>'],
];
for (const [pick, expected] of htmlCases) {
  const got = oddsSourceHTML(pick);
  const ok = got === expected;
  if (!ok) failures++;
  console.log(`${ok ? 'OK' : 'FAIL'}: html ${JSON.stringify(pick)} -> ${JSON.stringify(got)}`);
}

if (failures) {
  console.error(`\n${failures} case(s) failed.`);
  process.exit(1);
}
console.log(`\nAll ${cases.length + htmlCases.length} case(s) passed.`);
