/**
 * Tests for `scripts/lib/store-slug.js` — the privacy rule behind `npm run validate:security`.
 *
 * Provenance, because it decides what these cases are: while #407 was being written, two real
 * private project slugs — one of them a funded research project — reached files staged for this
 * public repository. A peer session caught them in review. A reviewer is not a control, so the
 * detector exists; and the detector is only worth having if it fires on the shape that actually
 * shipped, which is why the fixtures below reproduce the leaked lines' exact SHAPE. The
 * identifiers themselves are stand-ins: pasting the real slugs into a test would republish the
 * thing this rule exists to keep out of the repository.
 *
 * The first draft of the detector matched `~/.claude/projects/-<slug>` and passed both real
 * lines, because an author who knows a path is sensitive elides its head and leaves the
 * identifying tail. That miss is the reason for two of the three patterns under test.
 *
 * The negative cases carry equal weight: an ellipsis is ordinary punctuation in this corpus, and
 * a rule that fires on "first the index, then the topic files … and finally the report" would be
 * turned off within a week.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findPrivateStoreSlugs, OWN_SLUG } from '../lib/store-slug.js';

const hits = (text) => findPrivateStoreSlugs(text).length;

test('fires on the lines that actually leaked', () => {
  // Reconstructed with a stand-in identifier of the same shape: `<word>_<digits>_<word>-<word>`
  // and `<word>-<word>_<word>`. Using the real ones as fixtures would republish them here.
  // security-scan-ignore: stand-in identifier, no such project exists — the rule must fire on it
  const elidedWithMemory = '| `…-q_07_zrt-fabula/memory/` | `MEMORY.md` + 2 topic files | 2,100 |';
  // security-scan-ignore: stand-in identifier, as above
  const elidedWithoutMemory = '| legacy `…q_07_zrt-fabula` | finds the modern twin | finds it |';
  // security-scan-ignore: stand-in identifier, as above
  const elidedConverted = '| modern `…q-07-zrt-fabula` | **finds nothing** | finds the legacy store |';
  // security-scan-ignore: stand-in identifier, as above
  const fullPath = '~/.claude/projects/-mnt-x-dev-j-abc-q_07_zrt-fabula/memory/MEMORY.md';

  assert.equal(hits(elidedWithMemory), 1, 'elided slug followed by /memory');
  assert.equal(hits(elidedWithoutMemory), 1, 'elided slug with no /memory — the first-draft miss');
  assert.equal(hits(elidedConverted), 1, 'hyphen-converted form of the same slug');
  assert.equal(hits(fullPath), 1, 'full store path');
});

test('stays silent on the scrubbed replacements', () => {
  // These are the exact forms the leaked lines were rewritten to. If the detector fired on them
  // there would be no way to describe the mechanism at all, and the rule would be unusable.
  assert.equal(hits('| `…-<project_a>/memory/` | `MEMORY.md` plus 2 topic files | 2,100 |'), 0);
  assert.equal(hits('| legacy `…-<project_a>` (underscore form) | finds the modern twin |'), 0);
  assert.equal(hits('~/.claude/projects/<slug>/memory/'), 0);
  assert.equal(hits('~/.claude/projects/${SLUG}/memory'), 0);
  assert.equal(hits('~/.claude/projects/-foo/memory — a documented example'), 0);
});

test('stays silent on this repository\'s own store', () => {
  assert.equal(hits(`\`~/.claude/projects/${OWN_SLUG}/memory/MEMORY.md\``), 0);
  assert.equal(hits('the store at …-agent-almanac is this repo'), 0);
  assert.equal(hits('…-p-agent-almanac/memory/ holds 135 topic files'), 0);
});

test('stays silent on ordinary prose that uses an ellipsis', () => {
  assert.equal(hits('first the index, then the topic files … and finally the report'), 0);
  assert.equal(hits('counts went 116 … 120 across the sweep'), 0);
  assert.equal(hits('see the note above … before running it'), 0);
  assert.equal(hits('Run the check against <memory-dir>/memory/ before compaction.'), 0);
  assert.equal(hits('the caps are 200 lines … or 25KB, whichever binds'), 0);
});

test('stays silent on JavaScript spread syntax', () => {
  // Measured false positives: these three lines exist in this repo's own test suite, and the
  // first version of the rule reported all of them. An ASCII `...` before an identifier is code
  // far more often than it is an elided path.
  assert.equal(hits('  for (const ct of [...CONTENT_TYPES, \'total\']) assert.ok(coverage[ct]);'), 0);
  assert.equal(hits('  assert.deepEqual(PARITY_TREES.map((t) => t.dir), [...CONTENT_TYPES],'), 0);
  assert.equal(hits('  assert.deepEqual(named, [...REPO_ONLY],'), 0);
  assert.equal(hits('const merged = { ...defaults, ...overrides_map };'), 0);
});

test('a real slug is still reported when it merely contains a metasyntactic word', () => {
  // The placeholder rule is anchored at the start of the slug, because a real slug encodes an
  // absolute path and therefore begins with the filesystem root. An unanchored match would let
  // any store under a directory called `test/` or `sample/` through.
  // security-scan-ignore: synthetic fixtures — no such path exists; the rule must fire on them
  assert.equal(hits('~/.claude/projects/-mnt-x-dev-p-test-harness_run/memory'), 1);
  // security-scan-ignore: synthetic fixture, as above
  assert.equal(hits('~/.claude/projects/-home-u-work-example_client/memory'), 1);
});

test('an elided tail does not get the full-slug metasyntactic waiver', () => {
  // The keyword rule is anchored because a real slug starts at the filesystem root. An elided
  // tail starts wherever the author cut it, so the same rule there waives real projects. These
  // are the shape of the incident this detector exists for: a project genuinely named
  // `project-…` or `test-…`, elided by an author who knew the path was sensitive.
  // security-scan-ignore: synthetic fixture, required to be a positive
  assert.equal(hits('| `…-project-billing/memory/` | 3 files |'), 1);
  // security-scan-ignore: synthetic fixture, required to be a positive
  assert.equal(hits('| `…-test-rig_data/memory/` | 3 files |'), 1);
  // security-scan-ignore: synthetic fixture, required to be a positive
  assert.equal(hits('the legacy store `…-sample-corpus_v2` is unreachable'), 1);
  // ...while the full-slug form keeps the waiver, since there the anchor argument holds.
  assert.equal(hits('~/.claude/projects/-project-example/memory'), 0);
});

test('reports every occurrence with its line number', () => {
  const doc = [
    '# report',
    // security-scan-ignore: synthetic fixture, required to be a positive
    '~/.claude/projects/-mnt-x-dev-p-alpha_one/memory/MEMORY.md',
    'nothing here',
    // security-scan-ignore: synthetic fixture, required to be a positive
    '| `…-beta_two/memory/` | 1 file |',
  ].join('\n');
  const found = findPrivateStoreSlugs(doc);
  assert.equal(found.length, 2);
  assert.deepEqual(
    found.map((f) => f.line),
    [2, 4],
    'line numbers are 1-based and per-occurrence',
  );
});

test('a /g regex does not carry lastIndex between lines', () => {
  // Module-level /g regexes are shared state. Without a reset, a match on one line moves
  // lastIndex past the start of the next, and the detector silently skips findings — the failure
  // mode where a gate reports OK because it stopped looking.
  const many = Array.from(
    { length: 5 },
    (_, i) => `~/.claude/projects/-mnt-x-dev-p-store_${i}/memory/MEMORY.md`,
  ).join('\n');
  assert.equal(hits(many), 5);
});
