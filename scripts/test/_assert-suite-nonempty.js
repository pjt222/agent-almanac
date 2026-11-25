#!/usr/bin/env node
/**
 * Fail if `scripts/test/` holds no test files.
 *
 * Wired as npm's `pretest:scripts` hook, so it runs before the suite on every
 * `npm run test:scripts` — including the one step of `.github/workflows/ci-scripts.yml`.
 *
 * Without it that job is a gate that cannot fail. `node --test scripts/test/*.test.js`
 * prints `tests 0 / fail 0` and exits 0 when the glob matches nothing, so renaming,
 * moving into a subdirectory (the glob is single-level), or deleting the suite leaves
 * the check green while running nothing at all. Verified: an empty `scripts/test/`
 * exits 0 under Node 24 and 25, and under `sh`, which passes an unmatched glob through
 * literally for Node's own globber to resolve to zero files.
 *
 * That is the same vacuous green the PR adding this directory (#486) exists to
 * eliminate in the normalizer, so it should not be how the normalizer's own gate
 * behaves. The sibling `test:cli` names its files explicitly and dies loudly instead;
 * this keeps the glob's convenience without inheriting its silence.
 *
 * Deliberately named with a leading underscore: `*.test.js` must not match it, or it
 * would be collected as a test and its failure would read as a test failure.
 */
import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TEST_DIR = resolve(dirname(fileURLToPath(import.meta.url)));
const PATTERN = '*.test.js';

let entries;
try {
  entries = readdirSync(TEST_DIR);
} catch (error) {
  console.error(`ERROR: cannot read ${TEST_DIR} — the suite would report zero tests and pass.`);
  console.error(String(error.message));
  process.exit(1);
}

const testFiles = entries.filter((name) => name.endsWith('.test.js'));

if (testFiles.length === 0) {
  console.error(`ERROR: no files matching ${PATTERN} in scripts/test/.`);
  console.error('`node --test` exits 0 with "tests 0" when its glob matches nothing, so the');
  console.error('suite would pass having run nothing. Restore the tests, or update');
  console.error('package.json if they moved.');
  process.exit(1);
}

console.log(`scripts/test: ${testFiles.length} test file(s) — ${testFiles.join(', ')}`);
