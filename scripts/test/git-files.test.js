/**
 * git-files.test.js — the git-backed enumerator, and proof that its two library call sites use it
 * (#872 / #868 / #830).
 *
 * The component and the wiring are tested separately on purpose. One helper that asks git is
 * worth nothing if a consumer still walks disk, and "I extracted a helper" is exactly the claim
 * that reads as done while two of three call sites are unchanged (`CLAUDE.md` § Proving a Gate
 * Can Fail — prove the wiring, not the component). The third call site — the three counts
 * `generate-readmes.js` publishes — is covered behaviourally in `tree-counts.test.js`, because a
 * scan of the generator's source was measured green with the defect restored (#874 review, B1).
 *
 * Every fixture is a REAL git repository, because the behaviour under test is git's own ignore
 * rule. A fixture that is merely a directory asserts nothing about what was fixed — and since
 * the disk fallback was removed it cannot even run, which is the point of the refusal arm below.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, unlinkSync, symlinkSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { rmTree } from './_tmp.js';
import { initRepo, isolateGitEnv } from './_git-fixture.js';
import { listNonIgnored, listTracked, topLevelEntries } from '../lib/git-files.js';
import { checkParity } from '../lib/tools-registry.js';
import { nonDocumentationFiles } from '../lib/skills-inventory.js';

// Isolate git for this process before any test runs: the modules under test spawn git with
// `process.env`, so a developer's own `$XDG_CONFIG_HOME/git/ignore` can redden a fixture (#874
// review, S4).
isolateGitEnv();

function write(dir, files) {
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), content);
  }
}

/** A throwaway git repository. `files` maps repo-relative paths to contents; all are committed. */
function repo(t, files) {
  const dir = mkdtempSync(join(tmpdir(), 'git-files-'));
  t.after(() => rmTree(dir));
  mkdirSync(join(dir, '.git-placeholder'), { recursive: true });
  write(dir, files);
  const git = initRepo(dir);
  return { dir, git };
}

// ── the component ─────────────────────────────────────────────────────────────────────────────

test('the accept rule is git ignore and nothing else: ignored out, untracked IN', async (t) => {
  const { dir } = repo(t, {
    '.gitignore': '__pycache__/\n*.log\n',
    'tools/kept.py': 'print(1)\n',
  });
  // The #868 / #872 artefact: written by importing a Python file rather than running it.
  write(dir, {
    'tools/__pycache__/kept.cpython-312.pyc': 'x',
    'tools/debug.log': 'noise\n',
    // Untracked and NOT ignored. #830's acceptance criteria refuse a fix that loses this: the
    // tools gate exists to catch a new tool file whose registry row is missing, and such a file
    // is untracked at the moment its author runs the gate. An index-based listing would drop it.
    'tools/brand-new.sh': '#!/usr/bin/env bash\n',
  });

  assert.deepEqual(listNonIgnored(dir, 'tools'), ['tools/brand-new.sh', 'tools/kept.py']);
});

test('a TRACKED file matching an ignore pattern stays in — it ships', async (t) => {
  const { dir, git } = repo(t, { '.gitignore': '*.log\n', 'tools/plain.sh': 'x\n' });
  writeFileSync(join(dir, 'tools/forced.log'), 'x\n');
  git('add', '-f', 'tools/forced.log');
  git('commit', '-qm', 'forced');
  write(dir, { 'tools/loose.log': 'x\n' });

  // Measured on git 2.43: `check-ignore` consults the index and does not call a tracked path
  // ignored (`--no-index` does). That is why this module carries no tracked-set union of its
  // own — and this arm is what would notice if that behaviour were ever relied on wrongly.
  assert.deepEqual(listNonIgnored(dir, 'tools'), ['tools/forced.log', 'tools/plain.sh']);
});

test('a BROKEN symlink is an entry like any other', async (t) => {
  const { dir, git } = repo(t, { 'tools/real.sh': 'x\n' });
  symlinkSync('nowhere.sh', join(dir, 'tools/dangling.sh'));
  git('add', '-A');
  git('commit', '-qm', 'dangling');

  // `checkParity`'s third arm is written to report exactly this entry, so it must survive the
  // enumeration to reach the `lstat` that classifies it.
  assert.deepEqual(listNonIgnored(dir, 'tools'), ['tools/dangling.sh', 'tools/real.sh']);
  assert.deepEqual(topLevelEntries(dir, 'tools').files, ['dangling.sh', 'real.sh']);
});

test('a file deleted but not staged is simply absent — the disk is the candidate source', async (t) => {
  const { dir } = repo(t, { 'tools/gone.sh': 'x\n', 'tools/here.sh': 'y\n' });
  unlinkSync(join(dir, 'tools/gone.sh'));

  // The walk it replaced could not see it either, and `checkParity` reports the registry row
  // through its own `existsSync`, which is where that defect belongs.
  assert.deepEqual(listNonIgnored(dir, 'tools'), ['tools/here.sh']);
});

test('topLevelEntries: an EMPTY directory is still reported, an ignored one is not', async (t) => {
  const { dir } = repo(t, { '.gitignore': '__pycache__/\nbuild/\n', 'tools/flat.sh': 'x\n' });
  mkdirSync(join(dir, 'tools/empty'));
  write(dir, {
    'tools/nested/deep.sh': 'x\n',
    'tools/__pycache__/thing.pyc': 'x',
    'tools/build/out.txt': 'x',
  });

  const { files, dirs } = topLevelEntries(dir, 'tools');

  assert.deepEqual(files, ['flat.sh']);
  // `empty` has no file under it and must survive anyway — it is representable by no registry
  // row, which is what `checkParity`'s third arm reports. `__pycache__` and `build` are ignored
  // by a pattern written with a trailing slash, and are asked about WITHOUT one: measured to be
  // reported, which is what lets this be one question per entry rather than a walk.
  assert.deepEqual(dirs, ['empty', 'nested']);
});

test('nested .gitignore files, negations and info/exclude are honoured, because git answers', async (t) => {
  const { dir } = repo(t, {
    '.gitignore': '*.tmp\n',
    'tools/deep/.gitignore': '!keep.tmp\n',
    'tools/stay.sh': 'x\n',
  });
  write(dir, {
    'tools/deep/drop.tmp': 'x',
    'tools/deep/keep.tmp': 'x',
    'tools/excluded-here.sh': 'x',
  });
  writeFileSync(join(dir, '.git/info/exclude'), 'excluded-here.sh\n');

  // A hand-rolled matcher would have to implement all three. This module implements none of
  // them, which is the point: `scripts/check-generated-artifacts.js` — "git is the ruler".
  assert.deepEqual(listNonIgnored(dir, 'tools'), ['tools/deep/.gitignore', 'tools/deep/keep.tmp', 'tools/stay.sh']);
});

// ── it refuses rather than answering without the rule ──────────────────────────────────────────

test('outside a checkout it REFUSES — the fallback that hid a broken git is gone', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'git-files-bare-'));
  t.after(() => rmTree(dir));
  write(dir, { 'tools/a.sh': 'x\n', 'tools/sub/b.sh': 'y\n' });

  // The fallback measured in the #874 review (S1/S2): a git that failed the way `safe.directory`
  // does put `tools/__pycache__` back into `notPlainFile` and a gitignored `evil.py` back into
  // the inventory, silently, behind a `source: 'disk'` marker no consumer read. An unfiltered
  // listing is not a degraded answer to this question; it is the defect.
  assert.throws(() => listNonIgnored(dir, 'tools'), /Outside a git checkout there is no ignore rule/);
  assert.throws(() => topLevelEntries(dir, 'tools'), /check-ignore failed/);
});

test('a missing directory is empty; an UNREADABLE one throws', async (t) => {
  const { dir } = repo(t, { 'tools/a.sh': 'x\n', 'skills/real/references/helper.py': 'x\n' });

  assert.deepEqual(listNonIgnored(dir, 'absent'), [], 'absent means absent');

  // EACCES rendering as "not there" is the direction `skills-inventory.js` argues against three
  // functions away, and git exits 0 with only `warning: could not open directory`, so nothing
  // downstream would refuse on its behalf (#874 review, S3).
  if (process.getuid?.() === 0) {
    // Reported, not silently passed: root reads an unreadable directory, so the arm below would
    // be vacuous rather than satisfied (#874 review, Q4).
    t.skip('running as root: chmod 000 does not deny this process');
    return;
  }
  const locked = join(dir, 'skills/real/references');
  chmodSync(locked, 0o000);
  try {
    assert.throws(() => listNonIgnored(dir, 'skills'), /EACCES|permission denied/i);
  } finally {
    // Restored HERE, not in a t.after: the fixture's own teardown hook was registered first and
    // runs first, so an unreadable directory at that moment fails the removal with EACCES.
    chmodSync(locked, 0o755);
  }
});

// ── the wiring: one library call site per test ────────────────────────────────────────────────

test('WIRING check-tools-registry: an ignored artefact is invisible, a real defect still fires', async (t) => {
  const row = {
    id: 'kept', path: 'tools/kept.py', language: 'python', status: 'active',
    description: 'd', need: 'Doing a thing.', invoke: 'i', verify: 'v', verify_in_ci: 'true',
  };
  const { dir } = repo(t, { '.gitignore': '__pycache__/\n', 'tools/kept.py': 'print(1)\n' });
  write(dir, { 'tools/__pycache__/kept.cpython-312.pyc': 'x' });

  const clean = checkParity(dir, [row]);
  assert.deepEqual(clean.notPlainFile, [], 'a gitignored __pycache__ must not red a REQUIRED context (#868/#830)');
  assert.deepEqual(clean.fileWithoutRow, []);
  assert.deepEqual(clean.rowWithoutFile, []);

  // Both directions, because skipping ignored paths must never become skipping everything.
  write(dir, { 'tools/sub/nested.sh': 'x\n', 'tools/stray.sh': 'x\n' });
  const dirty = checkParity(dir, [row]);
  assert.deepEqual(dirty.notPlainFile, ['tools/sub'], 'a non-ignored subdirectory is still representable by no row');
  assert.deepEqual(dirty.fileWithoutRow, ['tools/stray.sh'], 'an untracked new tool with no row is still a defect');
});

test('WIRING skills-inventory: the SECURITY.md inventory counts the artifact, not the working directory', async (t) => {
  const { dir } = repo(t, {
    '.gitignore': '__pycache__/\n',
    'package.json': JSON.stringify({ name: 'fixture', files: ['skills/', '!skills/_template/'] }),
    'skills/real/SKILL.md': '# real\n',
    'skills/real/references/helper.py': 'print(1)\n',
    'skills/_template/scaffold.py': 'print(2)\n',
  });
  write(dir, {
    'skills/real/references/__pycache__/helper.cpython-312.pyc': 'x',
    'skills/real/references/__pycache__/evil.py': '#!/usr/bin/env python3\n',
    'skills/real/references/fresh.py': 'print(3)\n',
  });

  const found = nonDocumentationFiles(dir, ['skills']);

  // The #872 defect in both of its forms: the `.pyc` inflated the published COUNT, and the `.py`
  // would have been NAMED in the executable-scripts sentence as a shipped script.
  //
  // `fresh.py` is UNTRACKED and not ignored, and it is absent too — this consumer counts the
  // commit, because that is what a release is packed from. The rule it does NOT use is "skip
  // what git ignores": measured in the #874 review, a local `npm pack` packs the working tree
  // and ships the ignored `.py`, the ignored `.pyc` and the untracked sibling alike, so that
  // rule describes neither artifact.
  assert.deepEqual(found, ['skills/real/references/helper.py']);
  assert.ok(!found.some((p) => p.includes('__pycache__')), 'a gitignored file is not in the commit a release is packed from');
  // The npm-ships predicate is a SEPARATE rule and must survive the change of enumerator: the
  // recursive walk tested each directory before descending, so a flat listing has to test the
  // ancestor prefixes or `!skills/_template/` silently stops excluding anything.
  assert.ok(!found.some((p) => p.startsWith('skills/_template/')), 'the package negation still prunes the directory');
});

// ── the second rule: what the commit contains ─────────────────────────────────────────────────

test('listTracked answers about the COMMIT, which is a different set from the ignore rule', async (t) => {
  const { dir, git } = repo(t, { '.gitignore': '*.log\n', 'tools/tracked.sh': 'x\n' });
  writeFileSync(join(dir, 'tools/forced.log'), 'x\n');
  git('add', '-f', 'tools/forced.log');
  git('commit', '-qm', 'forced');
  write(dir, { 'tools/untracked.sh': 'x\n', 'tools/loose.log': 'x\n' });

  // Three files on disk that git is not ignoring; only two of them are in the commit. That gap
  // is the whole reason there are two functions: a GATE asks about the working tree, and
  // SECURITY.md asks about the artifact a release is packed from.
  assert.deepEqual(listNonIgnored(dir, 'tools'), ['tools/forced.log', 'tools/tracked.sh', 'tools/untracked.sh']);
  assert.deepEqual(listTracked(dir, 'tools'), ['tools/forced.log', 'tools/tracked.sh']);
});

// ── the ways check-ignore answers something other than "is this ignored" ───────────────────────

test('a candidate carrying pathspec metacharacters is REFUSED, not guessed at', async (t) => {
  const { dir } = repo(t, { '.gitignore': '*.log\n', 'tools/xay.log': 'x\n' });
  // Measured on git 2.43 (#874 review, W1): `git status --ignored` calls this file ignored, and
  // `check-ignore` reports it NOT ignored because the name is read as a glob that matches the
  // tracked sibling. `--literal-pathspecs` is no escape — this command rejects it outright.
  writeFileSync(join(dir, 'tools/x*y.log'), 'x\n');

  assert.throws(() => listNonIgnored(dir, 'tools'), /pathspec metacharacters/);
  assert.throws(() => topLevelEntries(dir, 'tools'), /pathspec metacharacters/);
});

test('the walk never descends THROUGH a symlink, so a batch cannot be refused as a unit', async (t) => {
  const { dir } = repo(t, { 'tools/real.sh': 'x\n', 'outside/f.log': 'x\n' });
  symlinkSync('../outside', join(dir, 'tools/link'));

  // A path *through* a symlink is `fatal: pathspec '...' is beyond a symbolic link`, exit 128,
  // for the WHOLE batch — one such candidate would hide the verdict for every other path. The
  // walk keys on `isDirectory()`, which a symlink is not, so `tools/link` is asked about as
  // itself and `tools/link/f.log` is never generated. This arm is what keeps a future refactor
  // to a recursive or stat-following walk from turning a green gate into a refusal.
  assert.deepEqual(listNonIgnored(dir, 'tools'), ['tools/link', 'tools/real.sh']);
  assert.deepEqual(topLevelEntries(dir, 'tools').files, ['link', 'real.sh']);
});

test('a git that EXISTS and FAILS refuses too — not only a missing repository', async (t) => {
  const { dir } = repo(t, { '.gitignore': '__pycache__/\n', 'tools/kept.sh': 'x\n' });
  write(dir, { 'tools/__pycache__/x.pyc': 'x' });

  // The bundle's refusal arm used a bare directory, which answers a different question. The one
  // that mattered in the #874 review was a git that runs and fails the way `safe.directory`
  // does: under the old fallback that returned an UNFILTERED listing, silently.
  const shim = mkdtempSync(join(tmpdir(), 'git-shim-'));
  t.after(() => rmTree(shim));
  writeFileSync(join(shim, 'git'), '#!/bin/sh\necho "fatal: detected dubious ownership in repository" >&2\nexit 128\n');
  chmodSync(join(shim, 'git'), 0o755);

  const realPath = process.env.PATH;
  process.env.PATH = `${shim}:${realPath}`;
  try {
    assert.throws(() => listNonIgnored(dir, 'tools'), /dubious ownership/);
    assert.throws(() => listTracked(dir, 'tools'), /dubious ownership/);
  } finally {
    process.env.PATH = realPath;
  }

  // And with the real git back, the same tree answers normally — so the arm above failed
  // because of the shim, not because the fixture was broken.
  assert.deepEqual(listNonIgnored(dir, 'tools'), ['tools/kept.sh']);
});
