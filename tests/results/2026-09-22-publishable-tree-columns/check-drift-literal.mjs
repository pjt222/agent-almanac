// check-drift-literal.mjs — does `two-column-pack.sh`'s EXPECTED match the two-column test's
// `deepEqual`, character for character?
//
// Round 4's N-1 asked for a tie between the test's fixture and the script that duplicates it,
// and the answer was to declare the eight porcelain codes in the script and refuse on
// mismatch. That moves the trust rather than removing it: the script refuses drift only if the
// eight literals were typed correctly once, and two of them carry trailing-space padding
// (`A `, `T `) that is invisible in a diff. This parses both sides and compares them, so the
// declaration is checked rather than believed.
//
// Root derived from this file's own location; pass one as argv[2] to point it elsewhere.
// Exit 0 identical, 1 differing (with the positions), 2 could not parse one side — never 0 on
// a side that parsed to nothing, since zero-vs-zero would read as agreement.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.argv[2] ?? resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const test = readFileSync(`${root}/scripts/test/publishable-tree.test.js`, 'utf8');
const block = test.match(/assert\.deepEqual\(found\.codes, \{([\s\S]*?)\}, 'the fixture is vacuous/);
if (!block) { console.error('REFUSED: could not locate the two-column deepEqual'); process.exit(2); }
const fromTest = [...block[1].matchAll(/'([^']+)':\s*'([^']*)'/g)].map(([, p, c]) => `${c} ${p}`).sort();

const sh = readFileSync(`${root}/tests/results/2026-09-22-publishable-tree-columns/two-column-pack.sh`, 'utf8');
const exp = sh.match(/EXPECTED=\$\(printf '%s\\n' \\\n([\s\S]*?)\| sort\)/);
if (!exp) { console.error('REFUSED: could not locate EXPECTED in the script'); process.exit(2); }
const fromScript = [...exp[1].matchAll(/'([^']+)'/g)].map(([, s]) => s).sort();

console.log(`test deepEqual  : ${fromTest.length} entries`);
console.log(`script EXPECTED : ${fromScript.length} entries`);
if (fromTest.length === 0 || fromScript.length === 0) {
  console.error('REFUSED: one side parsed to nothing — a zero-vs-zero comparison would read as agreement');
  process.exit(2);
}
if (JSON.stringify(fromTest) === JSON.stringify(fromScript)) {
  console.log('IDENTICAL, character for character:');
  for (const row of fromTest) console.log(`  ${JSON.stringify(row)}`);
  process.exit(0);
}
console.log('DIFFER:');
for (let i = 0; i < Math.max(fromTest.length, fromScript.length); i += 1) {
  if (fromTest[i] !== fromScript[i]) {
    console.log(`  [${i}] test=${JSON.stringify(fromTest[i])} script=${JSON.stringify(fromScript[i])}`);
  }
}
process.exit(1);
