/**
 * The shared English-history walker (#559).
 *
 * #559 asks for the duplicated walk to be extracted. The reason it is worth extracting is not
 * line count: the two copies had asymmetric COVERAGE, and the uncovered one was the copy whose
 * errors point in the expensive direction. Deleting the `missing|ambiguous` skip from
 * `translation-status.js` killed a test; deleting the identical line from `fences.js` killed
 * nothing — yet in `fences.js` the pool is a *violation* basis, so corrupting it manufactures
 * false fence violations against real translations.
 *
 * `git cat-file --batch` emits a `missing` header only for a spec naming a path absent from its
 * commit — that is, a DELETION commit. `translation-status.test.js` already builds such a
 * fixture (`'a missing blob does not shift the batch parser onto the wrong key'`), which is
 * exactly why the mutation dies on that side. So the branch was never unreachable in principle;
 * it was unreachable through `buildEnglishFenceHistory`, which until #559 took no `root`
 * argument and closed over the module's own repo root. Nothing could point it at a fixture, so
 * nothing did.
 *
 * These tests therefore do two things the prose-side test cannot: they exercise the walk through
 * the fences builder, and they pin the shared walk itself, so the coverage cannot go asymmetric
 * again by one caller quietly growing a second copy.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { execFileSync, spawnSync } from 'child_process';

import { walkEnglishHistory, collectSpecs } from '../lib/english-history.js';
import { buildEnglishFenceHistory } from '../lib/fences.js';
import { buildEnglishProseHistory } from '../lib/translation-status.js';
import { rmTree } from './_tmp.js';

const FENCE = (body) => ['```javascript', body, '```', ''].join('\n');

/**
 * A repo whose history contains a deletion, so `git cat-file --batch` emits a `missing`
 * header, plus one flat-tree file so both i18n layouts (`skills/<id>/SKILL.md` and
 * `agents/<id>.md`) go through the same walk.
 *
 * Bodies are distinct strings rather than counts: the two live mutations here (drop the skip,
 * or drop its `index += 1`) differ by WHICH key each blob lands on, and a count-based
 * assertion cannot tell those apart from a correct run.
 */
function makeFixture() {
  const dir = mkdtempSync(join(tmpdir(), 'aa-history-'));
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });

  git('init', '-q', '-b', 'main');
  git('config', 'user.email', 'test@example.com');
  git('config', 'user.name', 'test');

  mkdirSync(join(dir, 'skills', 'alpha'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'alpha', 'SKILL.md'), `# Alpha\n\n${FENCE('const alphaHistoric = 1;')}`);
  git('add', '-A');
  git('commit', '-qm', 'add alpha');

  mkdirSync(join(dir, 'skills', 'beta'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'beta', 'SKILL.md'), `# Beta\n\n${FENCE('const betaHistoric = 2;')}`);
  mkdirSync(join(dir, 'agents'), { recursive: true });
  writeFileSync(join(dir, 'agents', 'gamma.md'), `# Gamma\n\n${FENCE('const gammaHistoric = 4;')}`);
  git('add', '-A');
  git('commit', '-qm', 'add beta and gamma');

  // The deletion. This is what puts a `missing` header in the batch stream.
  git('rm', '-q', '-r', 'skills/alpha');
  writeFileSync(join(dir, 'skills', 'beta', 'SKILL.md'), `# Beta\n\n${FENCE('const betaCurrent = 3;')}`);
  git('add', '-A');
  git('commit', '-qm', 'delete alpha, revise beta');

  return dir;
}

const sorted = (set) => [...set].sort();

test("the walker's own spec list produces a `missing` header — otherwise this proves nothing", () => {
  const dir = makeFixture();
  try {
    // `collectSpecs`, not a hand-rolled copy. Rebuilding the spec list inside the test would
    // prove the FIXTURE emits a missing header while saying nothing about the stream the walker
    // actually parses, and the two come apart the moment spec-building changes: filter deleted
    // paths there and the branch below goes dead with every test still green, because alpha's
    // earlier revision still arrives under its own spec.
    const specs = collectSpecs(dir);
    const deletionCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim();
    assert.ok(specs.includes(`${deletionCommit}:skills/alpha/SKILL.md`),
      'the walk must look at the deleted path under the commit that deleted it');

    const batch = spawnSync('git', ['cat-file', '--batch'],
      { cwd: dir, input: Buffer.from(`${specs.join('\n')}\n`, 'utf8') });
    assert.match(batch.stdout.toString('utf8'), / missing\n/,
      'no missing header in the batch stream: the branch under test is not being reached');
  } finally {
    rmTree(dir);
  }
});

test('a missing header advances the spec index, so every later blob keeps its own key', () => {
  const dir = makeFixture();
  try {
    const history = buildEnglishFenceHistory(dir);

    // Reached only through the batch parse: alpha is gone from the working tree, so its one
    // historical fence body can enter the pool by no other route. Dropping the skip breaks the
    // parse loop outright and this key never appears.
    assert.deepEqual(sorted(history.get('skills/alpha') ?? new Set()), ['const alphaHistoric = 1;']);

    // And the blobs that follow the missing one are not shifted onto the wrong key. Dropping
    // only the `index += 1` (keeping the `continue`) leaves the loop running but attributes
    // beta's current body to alpha — which the assertion above would catch, and this one pins
    // from the other side.
    assert.deepEqual(sorted(history.get('skills/beta')),
      ['const betaCurrent = 3;', 'const betaHistoric = 2;']);
    assert.deepEqual(sorted(history.get('agents/gamma')), ['const gammaHistoric = 4;']);
  } finally {
    rmTree(dir);
  }
});

test('the working-tree pass runs last and is keyed like the rest', () => {
  const dir = makeFixture();
  try {
    // An uncommitted English edit is a legal basis, so it must reach the pool without a commit.
    writeFileSync(join(dir, 'skills', 'beta', 'SKILL.md'), `# Beta\n\n${FENCE('const betaUncommitted = 9;')}`);
    const history = buildEnglishFenceHistory(dir);
    assert.ok(history.get('skills/beta').has('const betaUncommitted = 9;'),
      'an uncommitted English fence must count as English');

    // `history.current` holds the working tree ALONE, tags intact — not the flattened union.
    const currentBodies = history.current.get('skills/beta').map((f) => f.body);
    assert.deepEqual(currentBodies, ['const betaUncommitted = 9;']);
    assert.equal(history.current.has('skills/alpha'), false,
      'a deleted skill is absent from the working tree, so absent from current');
  } finally {
    rmTree(dir);
  }
});

test('both builders see the same blobs, because there is now one walk', () => {
  const dir = makeFixture();
  try {
    const fenceKeys = [...buildEnglishFenceHistory(dir).keys()].sort();
    const proseKeys = [...buildEnglishProseHistory(dir).keys()].sort();
    assert.deepEqual(proseKeys, fenceKeys);
    // Non-vacuity: an empty pool would satisfy the equality above.
    assert.deepEqual(fenceKeys, ['agents/gamma', 'skills/alpha', 'skills/beta']);
  } finally {
    rmTree(dir);
  }
});

test('the walker reports whether each blob came from the working tree', () => {
  const dir = makeFixture();
  try {
    const seen = [];
    walkEnglishHistory(dir, (key, _text, meta) => seen.push([key, meta.fromWorkingTree]));
    // Deleted skills appear only from history; surviving ones appear from both.
    assert.equal(seen.some(([k, wt]) => k === 'skills/alpha' && !wt), true);
    assert.equal(seen.some(([k, wt]) => k === 'skills/alpha' && wt), false);
    assert.equal(seen.some(([k, wt]) => k === 'skills/beta' && wt), true);
    // The working-tree pass is last, which is what makes an uncommitted edit a legal basis.
    const lastHistoryIndex = seen.map(([, wt]) => wt).lastIndexOf(false);
    const firstWorktreeIndex = seen.map(([, wt]) => wt).indexOf(true);
    assert.ok(firstWorktreeIndex > lastHistoryIndex);
  } finally {
    rmTree(dir);
  }
});
