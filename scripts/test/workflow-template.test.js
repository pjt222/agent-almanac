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
 * and workflows/README.md), so this test pins the template against the recipe
 * rather than against any one copy of it.
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
