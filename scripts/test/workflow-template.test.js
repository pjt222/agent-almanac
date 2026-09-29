/**
 * `workflows/_template.mjs` must pass the syntax check its own docs prescribe.
 *
 * Authors are told to copy the template and then validate it (step 4). Adding a
 * second top-level `export` broke that: the documented recipe wraps the file in
 * an async IIFE and rewrites only `export const meta`, so anything else exported
 * becomes `SyntaxError: Unexpected token 'export'` inside the wrapper — every
 * new workflow would start broken, before its author had written a line.
 *
 * The recipe is duplicated in four places (the template, the guide, the skill,
 * and workflows/README.md). This test pins the TEMPLATE against the recipe as
 * executed here; the transform itself is pinned byte for byte in
 * `mutation-parse.test.js`, where `wrapWorkflow` now lives. What nothing checks
 * is those four prose copies against that function, or any of them against the
 * runtime — stated so the gap is not mistaken for coverage.
 *
 * The WRAP itself is imported from `scripts/lib/mutation-parse.js` rather than
 * re-implemented here (#758 review S-C): the mutation gate checks workflow
 * mutants with the same transform, and a second copy is how two copies drift.
 * The COMMAND stays the documented one — bare `node --check -`, the CommonJS
 * goal — because this test's subject is the recipe an author is told to run.
 * The gate deliberately uses the stricter module goal; that difference is
 * argued in mutation-parse.js and is a property of the gate, not of the recipe.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { wrapWorkflow } from '../lib/mutation-parse.js';
import { extractConstLiterals, listWorkflows } from '../check-workflow-contract.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const WORKFLOWS = join(ROOT, 'workflows');

/** The documented check: strip `export` from meta, wrap, and parse. */
function wrapCheck(file) {
  const wrapped = wrapWorkflow(readFileSync(file, 'utf8'));
  const r = spawnSync(process.execPath, ['--check', '-'], { input: wrapped, encoding: 'utf8' });
  return { ok: r.status === 0, stderr: r.stderr || '' };
}

const scripts = readdirSync(WORKFLOWS).filter((f) => f.endsWith('.mjs'));

test('there are workflow scripts to check', () => {
  // Otherwise the loop below would assert nothing and pass.
  assert.ok(scripts.length > 0, 'no .mjs files found in workflows/');
});

for (const name of scripts) {
  test(`workflows/${name} passes the documented wrap-then-check recipe`, () => {
    const { ok, stderr } = wrapCheck(join(WORKFLOWS, name));
    assert.ok(ok, `${name} failed the documented syntax check:\n${stderr.split('\n').slice(0, 6).join('\n')}`);
  });
}

test('the template exports nothing but meta', () => {
  // The recipe only ever rewrites `export const meta`; any other top-level
  // export is a latent break of the check above.
  const source = readFileSync(join(WORKFLOWS, '_template.mjs'), 'utf8');
  const exports = source.split('\n').filter((line) => /^\s*export\b/.test(line));
  assert.deepEqual(exports.map((l) => l.trim()), ['export const meta = {'],
    'only `export const meta` may be exported from a workflow');
});

// ── REPO_SAFETY and WRITE_LOCATION: pinned in the template, copied byte for byte (#861) ─────
//
// The template changed in five commits during #859 and none of them reached a shipped workflow,
// because nothing compared them. Workflows cannot import (top-level `return`, no module API), so
// each shipped workflow carries its own copy of both constants; these tests make a copy that
// differs from the template's, by a single byte, red. The comparison is of SOURCE text, from
// `const` through the closing backtick, as the maintainer decision states it ("byte-identical"):
// `\${` and `$\{` evaluate alike and are still two copies. Every shipped workflow must carry
// exactly one of each — today all of them spawn shell-capable agents, which A7b makes carry the
// preamble; a future workflow that spawns none would carry an unused copy, the price of a rule
// with no exemption to argue about.

const CONSTANTS = ['REPO_SAFETY', 'WRITE_LOCATION'];
const templateText = readFileSync(join(WORKFLOWS, '_template.mjs'), 'utf8');
const shipped = listWorkflows(WORKFLOWS);

/** A template literal's runtime string, refusing any `${…}` interpolation (none is expected). */
function plainLiteralValue(source, name) {
  const body = source.replace(new RegExp(`^const ${name} = `), '');
  assert.ok(body.startsWith('`') && body.endsWith('`'), `${name} is a template literal`);
  assert.doesNotMatch(body, /(^|[^\\])\$\{/, `${name} interpolates nothing, so its value is its text`);
  return Function(`return ${body}`)();
}

for (const name of CONSTANTS) {
  test(`the template declares exactly one ${name}`, () => {
    const found = extractConstLiterals(templateText, name);
    assert.equal(found.length, 1, `${name} declarations in _template.mjs: ${found.map((f) => f.line).join(', ')}`);
    assert.ok(found[0].source, `${name}'s closing backtick was found`);
  });
}

test('the drift check has something to compare: the shipped workflows are the three known ones', () => {
  assert.deepEqual(shipped.map((p) => p.slice(p.lastIndexOf('/') + 1)),
    ['batch-generate-waves.mjs', 'review-changes.mjs', 'verify-handoff.mjs']);
});

for (const path of shipped) {
  const file = path.slice(path.lastIndexOf('/') + 1);
  for (const name of CONSTANTS) {
    test(`workflows/${file} carries ${name} byte-identical to the template's`, () => {
      const [expected] = extractConstLiterals(templateText, name);
      const found = extractConstLiterals(readFileSync(path, 'utf8'), name);
      assert.equal(found.length, 1, `${file}: ${found.length} ${name} declaration(s), expected exactly 1`);
      assert.equal(found[0].source, expected.source,
        `${file}:${found[0].line} ${name} differs from workflows/_template.mjs — edit the template and re-copy`);
    });
  }
}

test("REPO_SAFETY's load-bearing literals, each at its pinned site count", () => {
  // Counted on the string an agent receives, not on the escaped source. Exact counts, not
  // presence: a second copy of a rule line — say an unbraced one added beside the braced — moves
  // a count and fails, where an `includes` would stay green (the pin-the-literal rule).
  const value = plainLiteralValue(extractConstLiterals(templateText, 'REPO_SAFETY')[0].source, 'REPO_SAFETY');
  const count = (needle) => value.split(needle).length - 1;
  const pins = {
    'DIR="$(mktemp -d)" || exit 1': 1,
    'cd "${DIR:?}" || exit 1': 1,
    'rm -rf "${DIR:?}/fixtures"': 1,
    '[ "$(git rev-parse --show-toplevel)" = "${DIR:?}" ] || exit 1': 1,
    'mktemp -d': 2,
    '|| exit 1': 5,
    '${DIR:?}': 3,
    'cd "$DIR"': 0,
    '= "$DIR" ]': 0,
  };
  const measured = Object.fromEntries(Object.keys(pins).map((k) => [k, count(k)]));
  assert.deepEqual(measured, pins);
});

test("WRITE_LOCATION names the stage's own $DIR and rules out the repository root", () => {
  const value = plainLiteralValue(extractConstLiterals(templateText, 'WRITE_LOCATION')[0].source, 'WRITE_LOCATION');
  assert.match(value, /under your own\s+`\$DIR`/);
  assert.match(value, /`mktemp -d` created/);
  assert.match(value, /Write nothing under the repository root\.$/);
});
