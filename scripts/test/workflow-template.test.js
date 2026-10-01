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

test('the drift check has something to compare', () => {
  // A floor, not the set: the seed set is already pinned by name and count in
  // workflow-contract.test.js, and a third pin site is one more to keep in step.
  assert.ok(shipped.length >= 3, `only ${shipped.length} shipped workflow(s) found`);
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
  assert.match(value, /Write nothing under the\s+repository root\.$/);
});

// ── Nothing but files carries over between an agent's tool calls (#861 round 1, F1/F2) ──────
//
// Measured in a workflow-spawned agent thread: each Bash call starts again in the directory the
// agent was launched in, with `DIR` and every other variable unset; the directory survives. The
// first draft of these lines said the preamble's `cd` persists between shell calls and that
// `echo "${DIR:?}"` prints the path "for a tool that is not the shell" — which aborts in any
// later call, and a Write call is a later call. These pins hold the corrected instructions: print
// the path in the block that creates it (with `pwd`, which is absolute even under a relative
// TMPDIR, round 2 N1), and reuse the literal path.
//
// Each line is pinned WHOLE, after whitespace normalisation, against a literal here. Round 2 pinned
// counts of the load-bearing phrases instead, and a sentence that repeated none of them — "or
// straight into the repository root, whichever is convenient" — survived every gate (round 2,
// SF2). A count catches a pinned phrase deleted or duplicated; only the whole text catches one
// ADDED. An intended edit to one of these lines therefore edits the literal below as well.

const normalise = (s) => s.replace(/\s+/g, ' ');

const EXPECTED_WRITE_LOCATION = [
  "WRITE LOCATION — write every file you produce, by any tool, under your own `$DIR`: a",
  "directory the preamble's `mktemp -d` created for you. Nothing but files carries over",
  "from one tool call to the next: a new shell call may start back in the directory you",
  "were launched in, with `DIR` unset. So in the block that creates `$DIR`, run `pwd` right",
  "after the preamble's `cd`, note the absolute path it prints, and use that literal path",
  "wherever the variable cannot reach: in a tool that is not the shell, and in a later",
  "block that needs a file written earlier. Write nothing under the repository root.",
].join(' ');

test('WRITE_LOCATION tells the agent to reuse the printed path, since $DIR does not survive a call', () => {
  const value = plainLiteralValue(extractConstLiterals(templateText, 'WRITE_LOCATION')[0].source, 'WRITE_LOCATION');
  assert.equal(normalise(value), EXPECTED_WRITE_LOCATION);
});

// Source text, not the evaluated string: it interpolates ${outputDir}, so the backslash escapes
// and the `${outputDir}` placeholder are part of what is pinned.
const EXPECTED_GENERATE_WRITE_LOCATION = [
  "const GENERATE_WRITE_LOCATION = `WRITE LOCATION — write only under ${outputDir} and your",
  "own \\`$DIR\\` (a directory the preamble's \\`mktemp -d\\` created for you); nowhere else in",
  "the repository. Writing your artifacts under ${outputDir} is this stage's job, and the",
  "one exception to the preamble's \"work only in a directory you created yourself\";",
  "everything else — scratch files, fixtures, logs — goes under \\`$DIR\\`. Nothing but files",
  "carries over from one tool call to the next, so in the block that creates \\`$DIR\\`, run",
  "\\`pwd\\` right after the preamble's \\`cd\\`, note the absolute path it prints, and use",
  "that literal path in a tool that is not the shell and in a later block.`",
].join(' ');

test("GENERATE_WRITE_LOCATION holds maintainer decision 2: outputDir and its own $DIR, nowhere else", () => {
  // The decision is a statement about this text ("write only under ${outputDir} and your own $DIR;
  // nowhere else in the repository"). Before #861 round 1 a mutant licensing writes anywhere in the
  // repository survived every gate, `npm test` included; before round 3 one that avoided the word
  // "anywhere" still did. This constant has no template copy to be compared with, so this literal
  // is its only pin. Site count too: declared once, and interpolated into exactly one prompt — the
  // Generate stage's — so the licence to write under outputDir cannot spread to the scout or audit.
  const text = readFileSync(join(WORKFLOWS, 'batch-generate-waves.mjs'), 'utf8');
  const found = extractConstLiterals(text, 'GENERATE_WRITE_LOCATION');
  assert.equal(found.length, 1, 'batch-generate-waves.mjs declares exactly one GENERATE_WRITE_LOCATION');
  assert.equal(normalise(found[0].source), EXPECTED_GENERATE_WRITE_LOCATION);
  assert.equal(text.split('${GENERATE_WRITE_LOCATION}').length - 1, 1,
    'GENERATE_WRITE_LOCATION is interpolated into exactly one prompt');
});

const REPO_ROOT_NOTE_FILES = ['batch-generate-waves.mjs', 'review-changes.mjs'];

test('REPO_ROOT_NOTE is byte-identical in the two workflows that carry it', () => {
  const [first, second] = REPO_ROOT_NOTE_FILES.map((f) => {
    const found = extractConstLiterals(readFileSync(join(WORKFLOWS, f), 'utf8'), 'REPO_ROOT_NOTE');
    assert.equal(found.length, 1, `${f} declares exactly one REPO_ROOT_NOTE`);
    return found[0].source;
  });
  assert.equal(second, first, 'review-changes.mjs REPO_ROOT_NOTE differs from batch-generate-waves.mjs');
});

const EXPECTED_REPO_ROOT_NOTE = [
  "REPOSITORY ROOT — relative paths and `git` commands in this task are relative to the",
  "repository root: the directory you were launched in. Never rely on the working directory",
  "to be there. Inside a shell block the preamble's `cd \"${DIR:?}\"` moves you away from it,",
  "and a new shell call may start back there, with no variable carried over. So learn the",
  "root once, in a first shell call that touches no files and so needs no preamble: a bare",
  "`pwd`, before any `cd`. Note the absolute path it prints, and use that literal path from",
  "then on: `git -C \"<root>\" …`, `\"<root>/<relative path>\"`, and `(cd \"<root>\" &&",
  "<command>)` for a command that must run there. Reading the repository this way is",
  "expected; where you may WRITE is the write-location line above.",
].join(' ');

test('REPO_ROOT_NOTE says the working directory does not carry over, and to reuse the root literally', () => {
  // The byte-identity test above fails an edit to one copy; an edit made to both copies together
  // keeps them identical, and only this literal fails it (round 2, SF2, measured on this note).
  const source = extractConstLiterals(readFileSync(join(WORKFLOWS, REPO_ROOT_NOTE_FILES[0]), 'utf8'),
    'REPO_ROOT_NOTE')[0].source;
  assert.equal(normalise(plainLiteralValue(source, 'REPO_ROOT_NOTE')), EXPECTED_REPO_ROOT_NOTE);
});
