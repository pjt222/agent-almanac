/**
 * Tests for `scripts/lib/suppression.js` — the inline waiver mechanism behind
 * `npm run validate:security`.
 *
 * Provenance: the pattern accepted `<!--` and `#`, which covered the scan's original markdown and
 * shell scope. #407 added `.js` files to that scope, and every waiver written in a `//` comment
 * was then read as ordinary text. The findings stayed; the author believed they were waived. The
 * bug is invisible from the waiver's side — nothing tells you a suppression did not suppress.
 *
 * So the load-bearing test here is not the four unit cases below. It is `every waiver already in
 * the repository is recognized`, which fails the moment someone writes one in a syntax the pattern
 * does not know, in the commit that writes it.
 *
 * Negative fixtures deliberately build the token by concatenation, so that this file's own
 * examples of INVALID waivers do not appear in the corpus scan as real ones.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { SUPPRESSION_RE, isSuppressed } from '../lib/suppression.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TOKEN = `security-scan-${'ignore'}:`;

// The trees `scan-skill-content.js` walks for the privacy rule.
const SCANNED_TREES = ['skills', 'agents', 'teams', 'guides', 'workflows', 'tests', 'scripts'];

// Lines that MENTION the waiver syntax without being one — documentation of the mechanism, not a
// use of it. Kept as an exact member list rather than a heuristic: a string literal is
// indistinguishable from a comment without parsing, and "is this line inside quotes" is exactly
// the kind of guess that would let a real broken waiver through. A new unrecognized occurrence
// fails until someone classifies it here.
const DOCUMENTED_MENTIONS = [
  { file: 'scripts/scan-skill-content.js', contains: 'const HINT =' },
];

// One entry per comment syntax the scanner can meet, with the file types that use it. The scan
// walks skills, agents, teams, guides, workflows, tests and scripts, so markdown, JS/MJS, YAML,
// shell, Python and R are all reachable.
const COMMENT_FORMS = [
  { syntax: '<!--', example: '<!-- security-scan-ignore: documented example -->', used_by: '.md' },
  { syntax: '#', example: '# security-scan-ignore: documented example', used_by: '.sh .py .R .yml' },
  { syntax: '//', example: '// security-scan-ignore: documented example', used_by: '.js .mjs' },
  { syntax: '/*', example: '/* security-scan-ignore: documented example */', used_by: '.js .css' },
];

for (const form of COMMENT_FORMS) {
  test(`waiver syntax ${form.syntax} suppresses (used by ${form.used_by})`, () => {
    assert.ok(SUPPRESSION_RE.test(form.example), `pattern does not recognize ${form.syntax}`);
    // on the finding's own line
    assert.ok(isSuppressed([`const x = 1; ${form.example}`], 0));
    // and on the line directly above it
    assert.ok(isSuppressed([form.example, 'const x = 1;'], 1));
  });
}

test('a waiver two lines above does not suppress', () => {
  assert.equal(isSuppressed(['// security-scan-ignore: reason', '', 'const x = 1;'], 2), false);
});

test('a waiver without a reason does not suppress', () => {
  // The reason is the whole point: a bare marker is a blanket suppression with no author intent
  // recorded, which is what the `\S` in the pattern refuses.
  assert.equal(isSuppressed([`// ${TOKEN}`], 0), false);
  assert.equal(isSuppressed([`# ${TOKEN}   `], 0), false);
});

test('a near-miss keyword does not suppress', () => {
  assert.equal(isSuppressed(['// security-scan-skip: reason'], 0), false);
  assert.equal(isSuppressed(['// scan-ignore: reason'], 0), false);
  assert.equal(isSuppressed([`${TOKEN} reason`], 0), false, 'a bare token with no comment opener');
});

test('every waiver already in the repository is recognized', () => {
  // The regression test for the actual defect. `git grep` rather than a filesystem walk: it reads
  // the index, so it is fast and it sees exactly what is committed.
  let out;
  try {
    // Scoped to the trees the scanner actually walks, and read from the index rather than the
    // filesystem — on a /mnt/ mount the difference is tens of seconds.
    out = execFileSync(
      'git',
      ['grep', '-n', '--fixed-strings', TOKEN, '--', ...SCANNED_TREES],
      { cwd: REPO, encoding: 'utf8' },
    );
  } catch (err) {
    // git grep exits 1 on no matches. That is not a pass — see the anti-vacuity assertion below.
    out = err.stdout || '';
  }

  const waivers = out
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [file, lineNo, ...rest] = line.split(':');
      return { file, lineNo: Number(lineNo), text: rest.join(':') };
    })
    // This file documents invalid forms on purpose; its own fixtures are built by concatenation
    // so they never reach here, but skip it explicitly rather than relying on that.
    .filter((w) => !w.file.endsWith('scripts/test/suppression.test.js'))
    .filter((w) => !w.file.endsWith('scripts/lib/suppression.js'))
    .filter(
      (w) => !DOCUMENTED_MENTIONS.some((d) => w.file === d.file && w.text.includes(d.contains)),
    );

  assert.ok(
    waivers.length > 0,
    'no waivers found in the repository — this check passed over an empty set, which is the ' +
      '"suite discovers nothing" failure. If waivers were genuinely all removed, delete this test.',
  );

  const unrecognized = waivers.filter((w) => !SUPPRESSION_RE.test(w.text));
  assert.deepEqual(
    unrecognized.map((w) => `${w.file}:${w.lineNo}`),
    [],
    'these waivers are written in a syntax the suppression pattern does not recognize, so they ' +
      'do not suppress anything — the finding is still reported and the author believes it is not',
  );
});

test('the scanner imports the shared mechanism rather than redefining it', () => {
  // Two copies of a suppression rule is how one of them silently stops matching the other's
  // scope. This is the same propagation hazard the memory-block drift test guards.
  const scanner = readFileSync(join(REPO, 'scripts', 'scan-skill-content.js'), 'utf8');
  assert.match(scanner, /from '\.\/lib\/suppression\.js'/, 'scanner must import the shared module');
  assert.doesNotMatch(
    scanner,
    /function isSuppressed\s*\(/,
    'scanner redefines isSuppressed locally; the two copies will drift',
  );
});
