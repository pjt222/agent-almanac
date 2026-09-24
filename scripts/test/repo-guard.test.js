/**
 * Behavioural tests for `scripts/repo-guard.js` (#493).
 *
 * The guard's whole value is detecting changes that other checks miss, so
 * "verify passes on an untouched repo" is the least interesting case here. Each
 * test below makes a specific change and asserts the guard goes red — and the
 * `skip-worktree` case additionally asserts that plain `git status` reads CLEAN
 * on the same tree, which is what makes that mechanism worth guarding at all.
 *
 * Fixtures are built with `mkdtempSync`, never a shared fixed path. That is the
 * pattern whose absence caused #493: two agents wrote the same scratchpad
 * filename, and the second clobbered the first.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { rmTree } from './_tmp.js';

const GUARD = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'repo-guard.js');

function git(cwd, args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${args.join(' ')} failed: ${r.stderr}`);
  return r.stdout.trim();
}

function guard(cwd, args) {
  const r = spawnSync(process.execPath, [GUARD, ...args], { cwd, encoding: 'utf8' });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

/** Inside `.git/`, deliberately — see the note on SNAPSHOT_NAME in repo-guard.js. */
const snapshotPath = (dir) => join(dir, '.git', 'repo-guard.json');

function makeRepo(t) {
  const dir = mkdtempSync(join(tmpdir(), 'repo-guard-'));
  t.after(() => rmTree(dir));
  git(dir, ['init', '-b', 'main']);
  git(dir, ['config', 'user.email', 'test@example.invalid']);
  git(dir, ['config', 'user.name', 'Fixture']);
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(join(dir, 'src', 'a.txt'), 'original\n', 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'initial']);
  return dir;
}

// ── the baseline, and proof it is not vacuous ───────────────────────────────

test('verify passes when nothing happened', async (t) => {
  const dir = makeRepo(t);

  assert.equal(guard(dir, ['snapshot']).status, 0);
  const r = guard(dir, ['verify']);

  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /unchanged at/);
});

test('verify KEEPS the snapshot, so a run cannot be silently disarmed', async (t) => {
  // Consuming by default was the original design and it disarmed the guard the
  // first time it was dogfooded: something ran verify mid-run, and the real
  // check afterwards had nothing to compare against. A retained snapshot can
  // only ever over-report, never under-report, so keeping is the safe direction.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);

  assert.equal(guard(dir, ['verify']).status, 0);
  const second = guard(dir, ['verify']);

  assert.equal(second.status, 0, 'the snapshot should still be there');
  assert.match(second.stdout, /unchanged at/);
});

test('--release drops the snapshot when the run is genuinely over', async (t) => {
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);

  assert.equal(guard(dir, ['verify', '--release']).status, 0);

  const after = guard(dir, ['verify']);
  assert.equal(after.status, 2);
  assert.match(after.stderr, /no snapshot/);
});

test('--release KEEPS the snapshot when the run failed', async (t) => {
  // Releasing after a failure destroys the evidence exactly when it is needed:
  // you could not re-verify after a partial recovery, and the only way back
  // would be a fresh snapshot — which rebaselines the damage as the new normal,
  // the laundering hole the refuse-to-overwrite rule exists to close.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  writeFileSync(join(dir, 'strayed.txt'), 'damage\n', 'utf8');

  const r = guard(dir, ['verify', '--release']);

  assert.equal(r.status, 1);
  assert.match(r.stderr, /snapshot was KEPT despite --release/);
  assert.ok(existsSync(snapshotPath(dir)), 'the baseline must survive a failed verify');

  // And it is still usable: the same failure is still detectable afterwards.
  const again = guard(dir, ['verify']);
  assert.equal(again.status, 1);
  assert.match(again.stderr, /strayed\.txt/);
});

test('snapshot refuses to overwrite, so a nested run cannot rebaseline damage', async (t) => {
  // The laundering path: run A arms, an agent strays, run B arms afresh — now
  // the stray write is part of B's baseline and A's verify reports green.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  writeFileSync(join(dir, 'strayed.txt'), 'damage\n', 'utf8');

  const second = guard(dir, ['snapshot']);

  assert.equal(second.status, 2, 'a second snapshot must not silently replace the first');
  assert.match(second.stderr, /already exists/);
  // The original baseline must survive and still see the damage.
  const v = guard(dir, ['verify']);
  assert.equal(v.status, 1);
  assert.match(v.stderr, /strayed\.txt/);
});

// ── the four mechanisms from the incident ───────────────────────────────────

test('detects a stray COMMIT — the case git status cannot see', async (t) => {
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);

  // Exactly what the subagent did: write into the tree, then commit it.
  mkdirSync(join(dir, 'i18n', 'de'), { recursive: true });
  writeFileSync(join(dir, 'i18n', 'de', 'SKILL.md'), 'stray fixture\n', 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'de translation']);

  // The premise: after committing, the tree is clean and every dirty-check passes.
  assert.equal(git(dir, ['status', '--porcelain']), '', 'precondition: tree reads clean');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.match(r.stderr, /HEAD moved/);
  assert.match(r.stderr, /de translation/, 'should name the stray commit');
  assert.match(r.stderr, /git reset --mixed/, 'should give the recovery command');
});

test('detects a stray write to an ALREADY-modified file', async (t) => {
  // The blocking defect the first version shipped with. Comparing status LINES
  // alone, ` M src/a.txt` reads identical before and after an overwrite, so the
  // guard reported "unchanged" while the file had been rewritten. This repo is
  // normally mid-edit, which makes it the common case rather than the exotic one.
  const dir = makeRepo(t);
  writeFileSync(join(dir, 'src', 'a.txt'), 'my own work in progress\n', 'utf8');
  guard(dir, ['snapshot']);

  const statusBefore = git(dir, ['status', '--porcelain']);
  writeFileSync(join(dir, 'src', 'a.txt'), 'CLOBBERED BY A STRAY AGENT\n', 'utf8');
  assert.equal(git(dir, ['status', '--porcelain']), statusBefore,
    'precondition: the porcelain line is byte-identical before and after');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1, 'a status-line-only comparison would pass here');
  // The whole heading and the path under it: this is the one shape whose status line really did
  // not move, so it is the control for the #899 tests below, which must not print it.
  assert.match(r.stderr,
    /contents changed \(same status line as at the snapshot, so only the bytes show the write\):\n {4}~ src\/a\.txt\n/);
});

/** Two branches that both rewrite `src/a.txt`, so `git merge side` on main conflicts. */
function prepareConflict(dir) {
  git(dir, ['checkout', '-q', '-b', 'side']);
  writeFileSync(join(dir, 'src', 'a.txt'), 'side\n', 'utf8');
  git(dir, ['commit', '-qam', 'side']);
  git(dir, ['checkout', '-q', 'main']);
  writeFileSync(join(dir, 'src', 'a.txt'), 'main\n', 'utf8');
  git(dir, ['commit', '-qam', 'main']);
}

test('a path whose status line MOVED is not described as one whose line did not (#899)', async (t) => {
  // The heading said "file was already modified, so its status line did not move" over every
  // path whose bytes differ, a fact the code never checked. Each shape below moves the path's
  // status line, so the path is already listed under `working tree:`; listing it again under a
  // heading that says the opposite is the defect. Detection must not change: all exit 1.
  const cases = [
    { name: 'A: a new untracked file',
      act: (dir) => writeFileSync(join(dir, 'stray.txt'), 'x\n', 'utf8'),
      listed: /\n {4}\+ \?\? stray\.txt\n/ },
    { name: 'B: a clean tracked file modified',
      act: (dir) => writeFileSync(join(dir, 'src', 'a.txt'), 'changed\n', 'utf8'),
      listed: /\n {4}\+ {2}M src\/a\.txt\n/ },
    { name: 'C: a clean tracked file deleted',
      act: (dir) => rmSync(join(dir, 'src', 'a.txt')),
      listed: /\n {4}\+ {2}D src\/a\.txt\n/ },
    // The shape a narrow fix misses: the path WAS in the snapshot's status list, as ` M`, so
    // filtering on "was it listed before" keeps it, while its line moved to `MM`.
    { name: 'D: an already-modified file staged, then rewritten',
      setup: (dir) => writeFileSync(join(dir, 'src', 'a.txt'), 'mine\n', 'utf8'),
      act: (dir) => {
        git(dir, ['add', '--', 'src/a.txt']);
        writeFileSync(join(dir, 'src', 'a.txt'), 'rewritten\n', 'utf8');
      },
      listed: /\n {4}\+ MM src\/a\.txt\n/ },
    // Added to #899 from #907's round 1: a conflict moves the line from nothing to `UU`.
    { name: 'E: a conflicted merge',
      setup: prepareConflict,
      act: (dir) => assert.notEqual(
        spawnSync('git', ['merge', '-q', 'side'], { cwd: dir, encoding: 'utf8' }).status, 0,
        'the fixture must actually conflict'),
      listed: /\n {4}\+ UU src\/a\.txt\n/ },
    // A path git lists TWICE, a staged delete plus an untracked file of the same name. Keyed by
    // path, one of its two lines stood for both, so the move of the other went unseen (#920
    // review, F3). Recreated after the snapshot, then removed after it.
    { name: 'F3a: a staged delete, then the file recreated',
      setup: (dir) => git(dir, ['rm', '-q', '--', 'src/a.txt']),
      act: (dir) => {
        mkdirSync(join(dir, 'src'), { recursive: true });   // `git rm` took the emptied directory
        writeFileSync(join(dir, 'src', 'a.txt'), 'back\n', 'utf8');
      },
      listed: /\n {4}\+ \?\? src\/a\.txt\n/ },
    { name: 'F3b: an untracked copy of a staged delete, then removed',
      setup: (dir) => git(dir, ['rm', '-q', '--cached', '--', 'src/a.txt']),
      act: (dir) => rmSync(join(dir, 'src', 'a.txt')),
      listed: /\n {4}- \?\? src\/a\.txt\n/ },
  ];

  for (const { name, setup, act, listed } of cases) {
    const dir = makeRepo(t);
    setup?.(dir);
    guard(dir, ['snapshot']);
    act(dir);

    const r = guard(dir, ['verify']);

    assert.equal(r.status, 1, `${name}: still detected`);
    assert.match(r.stderr, listed, `${name}: listed under working tree`);
    assert.doesNotMatch(r.stderr, /contents changed|status line did not move|already modified/,
      `${name}: its status line moved, so no heading may say it did not:\n${r.stderr}`);
  }
});

test('the contents heading lists only the paths whose status line did not move (#899)', async (t) => {
  // One write of each kind in the same run: the filter must be per path, not all or nothing.
  const dir = makeRepo(t);
  writeFileSync(join(dir, 'src', 'a.txt'), 'my own work in progress\n', 'utf8');
  guard(dir, ['snapshot']);
  writeFileSync(join(dir, 'src', 'a.txt'), 'overwritten\n', 'utf8');
  writeFileSync(join(dir, 'stray.txt'), 'x\n', 'utf8');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.match(r.stderr, /\n {4}\+ \?\? stray\.txt\n/);
  assert.match(r.stderr, /the bytes show the write\):\n {4}~ src\/a\.txt\n\n/,
    'exactly one path under the heading, the one whose line did not move');
  assert.doesNotMatch(r.stderr, /~ stray\.txt/);
});

test('detects a stray write to a NON-ASCII path', async (t) => {
  // `core.quotePath` C-quotes such paths with octal escapes, which the first
  // implementation could not parse — it silently recorded no content for them.
  // Verified live: a clobbered `i18n/ja/読み.md` reported "unchanged", exit 0.
  // In a repo whose whole i18n tree is non-ASCII that is the common path.
  const dir = makeRepo(t);
  mkdirSync(join(dir, 'i18n', 'ja'), { recursive: true });
  const cjk = join(dir, 'i18n', 'ja', '読み.md');
  writeFileSync(cjk, 'original\n', 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'add japanese skill']);
  writeFileSync(cjk, 'my own edit\n', 'utf8');
  guard(dir, ['snapshot']);

  writeFileSync(cjk, 'CLOBBERED\n', 'utf8');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1, 'a quoted-path parse failure would report unchanged');
  assert.match(r.stderr, /contents changed/);
});

test('detects a same-LENGTH content substitution', async (t) => {
  // Pins content at byte level, not size. Without this a refactor to a
  // stat/size fingerprint would pass the whole suite while reinstating the
  // original blind spot.
  const dir = makeRepo(t);
  writeFileSync(join(dir, 'src', 'a.txt'), 'AAAA\n', 'utf8');
  guard(dir, ['snapshot']);

  writeFileSync(join(dir, 'src', 'a.txt'), 'BBBB\n', 'utf8');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.match(r.stderr, /contents changed/);
});

test('detects an untracked file swapped for a symlink to a DIRECTORY', async (t) => {
  // The `(not-a-regular-file)` sentinel exists for exactly this. git does not
  // descend into or dereference the symlink, so `?? notes.md` is byte-identical
  // before and after; and the path stops being a regular file, so skipping it
  // from the content map would leave nothing to compare. A symlink to a FILE
  // does not exercise this — it still hashes, via the target.
  const dir = makeRepo(t);
  writeFileSync(join(dir, 'notes.md'), 'my notes\n', 'utf8');
  mkdirSync(join(dir, 'elsewhere'), { recursive: true });
  guard(dir, ['snapshot']);

  const statusBefore = git(dir, ['status', '--porcelain']);
  rmSync(join(dir, 'notes.md'));
  symlinkSync(join(dir, 'elsewhere'), join(dir, 'notes.md'));
  assert.equal(git(dir, ['status', '--porcelain']), statusBefore,
    'precondition: the status line is unchanged');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.match(r.stderr, /contents changed/);
  assert.match(r.stderr, /notes\.md/);
});

test('detects an untracked file swapped for a DANGLING symlink', async (t) => {
  // The `(absent)` sentinel. Same shape: git still reports `?? notes.md`, but
  // the path no longer resolves to anything readable.
  const dir = makeRepo(t);
  writeFileSync(join(dir, 'notes.md'), 'my notes\n', 'utf8');
  guard(dir, ['snapshot']);

  const statusBefore = git(dir, ['status', '--porcelain']);
  rmSync(join(dir, 'notes.md'));
  symlinkSync(join(dir, 'no-such-target'), join(dir, 'notes.md'));
  assert.equal(git(dir, ['status', '--porcelain']), statusBefore,
    'precondition: the status line is unchanged');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.match(r.stderr, /notes\.md/);
});

test('hashes the DESTINATION path of a rename, not the vanished original', async (t) => {
  // Porcelain -z emits `R  <destination>\0<original>\0` — destination first,
  // which is the file that exists on disk. Verified directly:
  //   $ git status --porcelain -z   ->  R  renamed.txt\0original.txt\0
  //   $ git status --porcelain      ->  R  original.txt -> renamed.txt
  // Reading the second field instead would hash a path that no longer exists,
  // leaving a renamed file's contents unguarded. Pinning it because a reviewer
  // asserted the opposite order.
  const dir = makeRepo(t);
  git(dir, ['mv', 'src/a.txt', 'src/b.txt']);
  guard(dir, ['snapshot']);

  const snap = JSON.parse(readFileSync(snapshotPath(dir), 'utf8'));

  assert.ok(Object.keys(snap.contents).includes('src/b.txt'),
    `destination not hashed; contents were ${JSON.stringify(Object.keys(snap.contents))}`);
  assert.ok(!Object.keys(snap.contents).includes('src/a.txt'),
    'the vanished original must not be hashed — it does not exist on disk');
  assert.equal(snap.status.length, 1, 'a rename is ONE status entry, not two');
});

test('detects a new file inside an already-untracked directory', async (t) => {
  // `git status --porcelain` collapses an untracked directory to a single entry,
  // so without -uall a file added inside it moves no line.
  const dir = makeRepo(t);
  mkdirSync(join(dir, 'scratch'), { recursive: true });
  writeFileSync(join(dir, 'scratch', 'one.txt'), 'first\n', 'utf8');
  guard(dir, ['snapshot']);

  writeFileSync(join(dir, 'scratch', 'two.txt'), 'snuck in\n', 'utf8');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.match(r.stderr, /scratch\/two\.txt/);
});

test('detects a modified tracked file', async (t) => {
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  writeFileSync(join(dir, 'src', 'a.txt'), 'rewritten by a stray --write\n', 'utf8');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.match(r.stderr, /working tree/);
  assert.match(r.stderr, /src\/a\.txt/);
});

test('detects a new untracked file', async (t) => {
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  writeFileSync(join(dir, 'fixture.sh'), '#!/bin/sh\n', 'utf8');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.match(r.stderr, /fixture\.sh/);
});

test('detects a skip-worktree bit — which makes git status LIE afterwards', async (t) => {
  // The incident really ran `git update-index --skip-worktree` on a real path.
  // From that point on git reports the file clean no matter what it contains, so
  // this bit poisons every later check. A guard blind to it can be disarmed.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);

  git(dir, ['update-index', '--skip-worktree', 'src/a.txt']);
  writeFileSync(join(dir, 'src', 'a.txt'), 'changed behind the flag\n', 'utf8');

  assert.equal(git(dir, ['status', '--porcelain']), '',
    'precondition: git status reads clean despite the file being modified');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.match(r.stderr, /index flags/);
  assert.match(r.stderr, /src\/a\.txt/);
});

test('detects a skip-worktree bit set from a SUBDIRECTORY', async (t) => {
  // `git ls-files -v` is cwd-scoped: run from a subdirectory it lists only that
  // subtree, so a bit set elsewhere would be invisible and the guard would cover
  // less than it claims. Every git call therefore runs from the toplevel.
  const dir = makeRepo(t);
  mkdirSync(join(dir, 'other'), { recursive: true });
  writeFileSync(join(dir, 'other', 'b.txt'), 'b\n', 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'add other']);
  guard(dir, ['snapshot']);

  git(dir, ['update-index', '--skip-worktree', 'src/a.txt']);

  // Verify from a subdirectory that does NOT contain the flagged file.
  const r = guard(join(dir, 'other'), ['verify']);

  assert.equal(r.status, 1, 'cwd-scoped ls-files would miss this');
  assert.match(r.stderr, /src\/a\.txt/);
});

test('recovery advice does not suggest a reset when HEAD never moved', async (t) => {
  // `git reset --mixed` would unstage the caller's own work. Printing it for a
  // pure worktree change is advice that destroys data.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  writeFileSync(join(dir, 'stray.txt'), 'x\n', 'utf8');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.doesNotMatch(r.stderr, /git reset --mixed/);
  assert.match(r.stderr, /HEAD did not move/);
});

test('an unborn baseline gets advice that is a runnable command', async (t) => {
  // The code explicitly supports snapshotting a repo with no commits, so the
  // failure guidance must not print `git reset --mixed (unborn)`.
  const dir = mkdtempSync(join(tmpdir(), 'repo-guard-unborn-'));
  t.after(() => rmTree(dir));
  git(dir, ['init', '-b', 'main']);
  git(dir, ['config', 'user.email', 'test@example.invalid']);
  git(dir, ['config', 'user.name', 'Fixture']);
  guard(dir, ['snapshot']);

  writeFileSync(join(dir, 'first.txt'), 'x\n', 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'a commit that arrived during the run']);

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.doesNotMatch(r.stderr, /\(unborn\)\.\.HEAD|reset --mixed \(unborn\)/,
    'must not print an invalid revision in a copy-pasteable command');
  assert.match(r.stderr, /no earlier revision to reset to/);
});

test('detects a branch switch', async (t) => {
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  git(dir, ['checkout', '-q', '-b', 'somewhere-else']);

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.match(r.stderr, /branch changed: main -> somewhere-else/);
});

test('a branch-only change names the command that shows it, not git diff (#887)', async (t) => {
  // The case #887 observed: armed on a detached HEAD, then `git checkout main` at the same
  // commit. The advice said "this is a worktree change" and named `git diff`, which prints
  // nothing here, under a finding that said the branch changed.
  const dir = makeRepo(t);
  git(dir, ['checkout', '-q', '--detach']);
  guard(dir, ['snapshot']);
  git(dir, ['checkout', '-q', 'main']);

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1, 'a branch change is still a change');
  assert.match(r.stderr, /branch changed: HEAD -> main/);
  assert.match(r.stderr, /the branch \(HEAD -> main\): {2}git rev-parse --abbrev-ref HEAD\n/);
  assert.doesNotMatch(r.stderr, /worktree change|git diff|working tree/,
    'no worktree finding was made, so none may be described');
  assert.doesNotMatch(r.stderr, /git reset --mixed/, 'HEAD never moved');
  assert.match(r.stderr, /If you made this checkout, run this\.[^\n]*:\n {4}npm run guard:rebaseline\n/,
    'rebaseline accepts a branch-only change, so it is the exit to name');
  assert.ok(!r.stderr.includes('--accept='), 'and verify still never prints a paste-ready override');
});

test('a branch change AND a worktree change names both commands, and no rebaseline (#887)', async (t) => {
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  git(dir, ['checkout', '-q', '-b', 'elsewhere']);
  writeFileSync(join(dir, 'stray.txt'), 'x\n', 'utf8');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.match(r.stderr, /the branch \(main -> elsewhere\): {2}git rev-parse --abbrev-ref HEAD\n/);
  assert.match(r.stderr, /the working tree: {2}git diff {2}\/ {2}git status --porcelain -uall/);
  assert.doesNotMatch(r.stderr, /guard:rebaseline/,
    'rebaseline refuses any worktree change, so naming it here is advice that fails');
  assert.match(r.stderr, /Inspect it before assuming it was yours\./);
});

test('the branch command prints something on a DETACHED HEAD too — the mirror of #887 (#907)', async (t) => {
  // Round 1 on #907: the first fix named `git branch --show-current`, which prints NOTHING on a
  // detached HEAD — the #887 defect again, for `git checkout --detach`. The advice now names the
  // command the baseline reads the branch with. Both premises are asserted in the fixture.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  git(dir, ['checkout', '-q', '--detach']);
  assert.equal(git(dir, ['branch', '--show-current']), '', 'the old command prints nothing here');
  assert.equal(git(dir, ['rev-parse', '--abbrev-ref', 'HEAD']), 'HEAD', 'the named one does not');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.match(r.stderr, /the branch \(main -> HEAD\): {2}git rev-parse --abbrev-ref HEAD\n/);
  assert.doesNotMatch(r.stderr, /show-current/);

  const refused = guard(dir, ['rebaseline']);

  assert.equal(refused.status, 2);
  assert.match(refused.stderr, /the checkout you made:\n {2}git rev-parse --abbrev-ref HEAD\n/);
  assert.doesNotMatch(refused.stderr, /show-current/);
});

test('an index-flag-only change names git ls-files -v, not git diff (#887)', async (t) => {
  // The same class one level down, found by the claim check on #887: a flag was folded into
  // the working-tree finding, so its advice named the two commands below. They print nothing
  // for it, and asserting that here pins the premise rather than recalling it.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  git(dir, ['update-index', '--skip-worktree', 'src/a.txt']);
  // The file is MODIFIED under the flag, so the two empty outputs below are the flag hiding a
  // change, not the absence of one (#907 round 1, N3).
  writeFileSync(join(dir, 'src', 'a.txt'), 'changed under skip-worktree\n', 'utf8');
  assert.equal(git(dir, ['diff']), '', 'git diff shows nothing for a flag-only change');
  assert.equal(git(dir, ['status', '--porcelain', '-uall']), '', 'nor does git status');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.match(r.stderr,
    /the index flags \(run at the repository root; a tag other than H: [^)]*\):\n {4}git ls-files -v\n/,
    'the legend on its own line, and the command bare, so it pastes under any shell');
  assert.doesNotMatch(r.stderr, /git diff|git status|the working tree/);
  assert.match(r.stderr, /Inspect it before assuming it was yours\./);
  assert.doesNotMatch(r.stderr, /guard:rebaseline/, 'rebaseline refuses an index-flag change too');
});

test('a conflicted merge is an index-flag finding, and the legend names its tag (#887)', async (t) => {
  // `git ls-files -v` tags an unmerged path `M`, and the baseline keeps every tag but `H`, so a
  // conflict during a guarded run is reported under index flags. Found by the second claim
  // check on #887: the first legend named only S and lowercase.
  const dir = makeRepo(t);
  git(dir, ['checkout', '-q', '-b', 'side']);
  writeFileSync(join(dir, 'src', 'a.txt'), 'side\n', 'utf8');
  git(dir, ['commit', '-qam', 'side']);
  git(dir, ['checkout', '-q', 'main']);
  writeFileSync(join(dir, 'src', 'a.txt'), 'main\n', 'utf8');
  git(dir, ['commit', '-qam', 'main']);
  guard(dir, ['snapshot']);
  const merge = spawnSync('git', ['merge', '-q', 'side'], { cwd: dir, encoding: 'utf8' });
  assert.notEqual(merge.status, 0, 'the fixture must actually conflict');
  const tags = new Set(git(dir, ['ls-files', '-v']).split('\n').map((line) => line[0]));
  tags.delete('H');
  assert.deepEqual([...tags], ['M'], 'the unmerged path is tagged M, and nothing else is flagged');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.match(r.stderr, /index flags \(skip-worktree \/ assume-unchanged \/ unmerged\)/);
  assert.match(r.stderr, /the index flags \([^)]*\bM is unmerged\b[^)]*\):\n {4}git ls-files -v\n/);
});

// ── failing closed ──────────────────────────────────────────────────────────

test('verify without a snapshot is an error, never a pass', async (t) => {
  const dir = makeRepo(t);

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 2, 'a comparison that never happened must not report success');
  assert.match(r.stderr, /no snapshot/);
});

test('a snapshot that cannot be WRITTEN exits 2, not 1', async (t) => {
  // An uncaught throw exits 1, which in this tool's vocabulary means "the
  // repository changed" — so a disk or permission failure would masquerade as a
  // verdict. Occupying the snapshot path with a directory makes the write fail
  // deterministically on any filesystem.
  const dir = makeRepo(t);
  mkdirSync(snapshotPath(dir), { recursive: true });

  // A directory at that path also trips the "already exists" refusal, which is
  // a different branch — `--force` gets past it to the write itself.
  const r = guard(dir, ['snapshot', '--force']);

  assert.equal(r.status, 2, 'must read as uncertainty, never as a verdict');
  assert.match(r.stderr, /could not write the snapshot/);
  assert.match(r.stderr, /NOT guarded/);
});

test('an unreadable snapshot is an error, never a pass', async (t) => {
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  writeFileSync(snapshotPath(dir), '{ not json', 'utf8');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 2);
  assert.match(r.stderr, /unreadable/);
});

test('a snapshot in an older format is an error naming the reason', async (t) => {
  // Hit for real: a snapshot armed before the `contents` field was added made
  // verify die with "missing 'contents'" — accurate and useless.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  const snap = JSON.parse(readFileSync(snapshotPath(dir), 'utf8'));
  delete snap.formatVersion;
  delete snap.contents;
  writeFileSync(snapshotPath(dir), JSON.stringify(snap), 'utf8');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 2);
  // Version-agnostic: hardcoding the pair meant every FORMAT_VERSION bump broke
  // this test, which is noise rather than signal.
  assert.match(r.stderr, /format v1, but this is v\d+/);
  assert.match(r.stderr, /guard:snapshot/, 'should say how to recover');
});

test('a snapshot from a different repository is an error', async (t) => {
  const a = makeRepo(t);
  const b = makeRepo(t);
  guard(a, ['snapshot']);
  writeFileSync(snapshotPath(b), readFileSync(snapshotPath(a), 'utf8'), 'utf8');

  const r = guard(b, ['verify']);

  assert.equal(r.status, 2);
  assert.match(r.stderr, /was taken in/);
});

test('every command this tool suggests is copy-pasteable', async (t) => {
  // Advice that does not run is advice that does not get followed, and this tool
  // only ever speaks at the moment something has gone wrong. Three separate
  // messages suggested `repo-guard.js …`, which is not runnable from the repo
  // root, and one interpolated an unquoted path that breaks on a directory name
  // containing a space.
  const dir = makeRepo(t);

  const noSnapshot = guard(dir, ['verify']).stderr;
  guard(dir, ['snapshot']);
  const alreadyExists = guard(dir, ['snapshot']).stderr;
  // `die()` appends USAGE to every argument error, so these carry it too — the
  // first version of this test checked only the two messages above and so missed
  // that USAGE itself still named the non-runnable form.
  const unknownArg = guard(dir, ['verify', '--nope']).stderr;
  const unknownCommand = guard(dir, ['inspect']).stderr;

  for (const stderr of [noSnapshot, alreadyExists, unknownArg, unknownCommand]) {
    // `(?!on)` because the snapshot FILE is `repo-guard.json`, of which
    // `repo-guard.js` is a prefix — the first version of this test flagged its
    // own subject's filename.
    const suggested = stderr.split('\n').filter((l) => /repo-guard\.js(?!on)/.test(l));
    assert.deepEqual(suggested, [],
      `message suggests a non-runnable command:\n${stderr}`);
    assert.match(stderr, /npm run guard:/, `message names no runnable entrypoint:\n${stderr}`);
  }
});

test('the occupied-slot refusal does not send the caller to release a slot it did not arm', async (t) => {
  // The sibling test above asserts every message names *a* runnable `npm run
  // guard:` entrypoint. That is not enough here, and the gap shipped: the
  // original message said `Finish that run with npm run guard:release`, which
  // satisfies that assertion while advising the one command that disarms
  // another session's baseline. Release unlinks the snapshot whenever the
  // comparison is clean, and the snapshot records no owner, so a peer in this
  // repo clears every check `verify` makes. Reverting the message left all
  // 301 tests green, which is what makes this assertion the coverage rather
  // than the demonstration.
  //
  // Scoped to this one message deliberately: USAGE legitimately documents
  // `guard:release`, so asserting corpus-wide would flag the help text.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  const alreadyExists = guard(dir, ['snapshot']).stderr;

  assert.doesNotMatch(alreadyExists, /guard:release/,
    `the refusal points the arriving session at the one command that disarms the incumbent:\n${alreadyExists}`);
  assert.match(alreadyExists, /guard:verify/,
    `the refusal offers no non-destructive way to inspect the slot:\n${alreadyExists}`);
  // npm swallows a bare `--force`, so the message must name the `--` form or the
  // caller re-runs plain `snapshot` and hits this same refusal.
  assert.match(alreadyExists, /guard:snapshot -- --force/,
    `the refusal names a --force form npm will swallow:\n${alreadyExists}`);
});

test('a path containing spaces is quoted in the recovery command', async (t) => {
  const parent = mkdtempSync(join(tmpdir(), 'repo guard spaces-'));
  t.after(() => rmTree(parent));
  const dir = join(parent, 'repo');
  mkdirSync(dir, { recursive: true });
  git(dir, ['init', '-b', 'main']);
  git(dir, ['config', 'user.email', 'test@example.invalid']);
  git(dir, ['config', 'user.name', 'Fixture']);
  writeFileSync(join(dir, 'a.txt'), 'x\n', 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'init']);
  guard(dir, ['snapshot']);

  // Force the format-mismatch branch, which is the one that prints an `rm`.
  const snap = JSON.parse(readFileSync(snapshotPath(dir), 'utf8'));
  snap.formatVersion = 1;
  writeFileSync(snapshotPath(dir), JSON.stringify(snap), 'utf8');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 2);
  assert.match(r.stderr, /rm -f "[^"]*repo guard spaces[^"]*"/,
    'the interpolated path must be quoted');
});

test('an unknown argument is an error, not a silently narrower check', async (t) => {
  const dir = makeRepo(t);

  for (const args of [['snapshot', '--release'], ['verify', '--force'], ['verify', '--all'], ['inspect']]) {
    const r = guard(dir, args);
    assert.equal(r.status, 2, `${JSON.stringify(args)} was accepted`);
    assert.match(r.stderr, /unknown (argument|command)/);
  }
});

test('the snapshot lives outside the working tree, so it cannot dirty it', async (t) => {
  // The first version wrote it to the repo root, where it showed up in `git
  // status` as untracked and an agent's `git add -A` — the very command from the
  // incident — would have committed it. `.git/` is outside the working tree.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);

  assert.ok(existsSync(snapshotPath(dir)), 'snapshot should be inside .git/');
  assert.equal(git(dir, ['status', '--porcelain']), '',
    'taking a snapshot must not dirty the working tree');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 0, r.stderr);
  assert.ok(existsSync(snapshotPath(dir)), 'verify keeps the snapshot by default');
});

// ── rebaseline: the exit for a legitimate mover (#688) ──────────────────────
//
// The gap these cover: `verify` and `release` both treat a moved HEAD as
// unexplained, which is right for a stray agent commit and wrong for the
// commonest event in any long run — the arming session merging its own branch.
// The only way through was `guard:snapshot -- --force`, a flag whose own text
// warns against itself, and which leaves a transcript indistinguishable from a
// careless rebaseline over an agent's commit.
//
// The tests that matter most here are the REFUSALS. A re-arming command that
// accepts too much is worse than no command at all, because it launders the
// exact write (#493) the guard was built to catch — so each of the four things
// it must refuse gets its own test.

/** Move HEAD the way an operator legitimately does: merge your own branch. */
function mergeOwnBranch(dir) {
  git(dir, ['checkout', '-q', '-b', 'feat']);
  writeFileSync(join(dir, 'src', 'b.txt'), 'mine\n', 'utf8');
  git(dir, ['add', '--', 'src/b.txt']);
  git(dir, ['commit', '-m', 'my own work']);
  git(dir, ['checkout', '-q', 'main']);
  git(dir, ['merge', '--no-ff', '-m', 'merge my own branch', 'feat']);
  return git(dir, ['rev-parse', 'HEAD']);
}

test('rebaseline re-arms after the arming session merges its own branch', async (t) => {
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  const head = mergeOwnBranch(dir);

  const r = guard(dir, ['rebaseline', `--accept=${head}`, '--reason=merged my own PR']);

  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /re-baselined/);
  // And the guard is live again from the new baseline, rather than disarmed.
  assert.equal(guard(dir, ['verify']).status, 0, 'verify should pass against the new baseline');
});

test('rebaseline RECORDS what it accepted — the thing --force cannot do', async (t) => {
  // Finding 1: `--force` exists but is indistinguishable in the transcript from
  // a careless rebaseline over an agent's stray commit. Provenance is the whole
  // difference between the two, so it is asserted rather than assumed.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  const before = git(dir, ['rev-parse', 'HEAD']);
  const head = mergeOwnBranch(dir);

  guard(dir, ['rebaseline', `--accept=${head}`, '--reason=merged my own PR']);
  const snap = JSON.parse(readFileSync(snapshotPath(dir), 'utf8'));

  assert.equal(snap.head, head, 'the new baseline is the new HEAD');
  assert.equal(snap.rebaselinedFrom.head, before, 'it records where it came from');
  assert.equal(snap.rebaselinedFrom.reason, 'merged my own PR');
  assert.equal(snap.rebaselinedFrom.fastForward, true);
  assert.equal(snap.rebaselinedFrom.acceptedCommits.length, 2,
    'both the merge and the commit it brought in are named');
  assert.ok(snap.rebaselinedFrom.acceptedCommits.every((line) => line.includes('Fixture')),
    'the author of each accepted commit is recorded, since that is the discriminator');
  assert.equal(snap.rebaselineHistory.length, 1);
});

test('a second rebaseline appends to the history rather than erasing the first', async (t) => {
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  guard(dir, ['rebaseline', `--accept=${mergeOwnBranch(dir)}`, '--reason=first']);

  git(dir, ['checkout', '-q', '-b', 'feat2']);
  writeFileSync(join(dir, 'src', 'c.txt'), 'more\n', 'utf8');
  git(dir, ['add', '--', 'src/c.txt']);
  git(dir, ['commit', '-m', 'more of my own work']);
  git(dir, ['checkout', '-q', 'main']);
  git(dir, ['merge', '--no-ff', '-m', 'merge again', 'feat2']);
  guard(dir, ['rebaseline', `--accept=${git(dir, ['rev-parse', 'HEAD'])}`, '--reason=second']);

  const snap = JSON.parse(readFileSync(snapshotPath(dir), 'utf8'));
  assert.deepEqual(snap.rebaselineHistory.map((h) => h.reason), ['first', 'second'],
    'a chain of re-armings stays visible; each one must not overwrite the last');
});

// ── the four refusals ───────────────────────────────────────────────────────

test('REFUSES without --accept: the delta must be read before it is accepted', async (t) => {
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  const head = mergeOwnBranch(dir);

  const r = guard(dir, ['rebaseline']);

  assert.equal(r.status, 2, 'no acknowledgement means the question is unanswered, not answered no');
  assert.match(r.stderr, /Nothing has been accepted yet/);
  assert.match(r.stderr, /commits added:/, 'it must print what it is asking about');
  assert.ok(r.stderr.includes(head), 'and the exact sha to paste back');
  assert.ok(existsSync(snapshotPath(dir)), 'the original baseline survives a refusal');

  // The rationale, asserted across the line wrap. #699 rewrote this paragraph and dropped the
  // word "IDENTICAL", leaving `...they may be / to yours, because...` -- and all 51 tests
  // stayed green, because every assertion here is a substring and none of them spanned the
  // break. Collapsing whitespace first is what makes the sentence visible: it is invariant
  // under REFLOW (re-wrap the same words at any width and this still passes) while a dropped,
  // duplicated or reordered word fails. That is the property the PR body claimed was
  // unavailable -- it argued the choice was between break-blind substrings and pinning whole
  // rendered messages, and this is neither.
  //
  // Pinning it deliberately: this sentence IS the correction #699 existed to install. The
  // author line is only a HINT because a subagent commits through this repository's own git
  // config, which is what happened in #493. A silent change to that reasoning should fail a
  // test, and the five other lines of the paragraph remain free to reword.
  const flat = r.stderr.replace(/\s+/g, ' ');
  assert.match(
    flat,
    /they may be IDENTICAL to yours, because a subagent commits through this repository's own git config\./,
    'the acknowledgement rationale must survive a reflow intact',
  );
  assert.match(flat, /The content is the test; the author is a hint\./);
});

test('REFUSES a sha that is not the current HEAD', async (t) => {
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  const before = git(dir, ['rev-parse', 'HEAD']);
  mergeOwnBranch(dir);

  // Accepting the OLD head is the plausible mistake: it is the sha printed first.
  const r = guard(dir, ['rebaseline', `--accept=${before}`]);

  assert.equal(r.status, 2);
  assert.match(r.stderr, /but HEAD is/);
  const snap = JSON.parse(readFileSync(snapshotPath(dir), 'utf8'));
  assert.equal(snap.head, before, 'the baseline is untouched by a refused acceptance');
});

test('REFUSES a sha too short to be an acknowledgement of anything', async (t) => {
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  const head = mergeOwnBranch(dir);

  // A 6-character prefix of the REAL head: correct as far as it goes, and still
  // refused. Otherwise `--accept=a` would pass on roughly one repo in sixteen.
  const r = guard(dir, ['rebaseline', `--accept=${head.slice(0, 6)}`]);

  assert.equal(r.status, 2);
  assert.match(r.stderr, /not specific enough/);
});

test('REFUSES when the WORKING TREE moved, not just HEAD', async (t) => {
  // The load-bearing refusal. "I moved HEAD deliberately" is a claim about
  // history and says nothing about file contents; accepting a content change
  // under it would rebaseline a stray write (#493) as the new normal.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  const head = mergeOwnBranch(dir);
  writeFileSync(join(dir, 'src', 'a.txt'), 'someone else wrote this\n', 'utf8');

  const r = guard(dir, ['rebaseline', `--accept=${head}`]);

  assert.equal(r.status, 1, 'this is the case the guard exists for — it must go red');
  assert.match(r.stderr, /the WORKING TREE moved, not just HEAD\./,
    'HEAD moved here, so the heading says so (#907 round 1: only the negative was pinned)');
  const snap = JSON.parse(readFileSync(snapshotPath(dir), 'utf8'));
  assert.notEqual(snap.head, head, 'the baseline must NOT have been moved');
});

test('a branch-only change is not described as a HEAD move, and can be accepted (#887)', async (t) => {
  // Without --accept the refusal said "HEAD moved" and "Read the commits above" over a
  // delta that holds no commit at all.
  const dir = makeRepo(t);
  git(dir, ['checkout', '-q', '--detach']);
  guard(dir, ['snapshot']);
  git(dir, ['checkout', '-q', 'main']);
  const head = git(dir, ['rev-parse', 'HEAD']);

  const refused = guard(dir, ['rebaseline']);

  assert.equal(refused.status, 2, 'still an unanswered question, not a yes');
  assert.match(refused.stderr, /only the branch changed\. HEAD did not move, so HEAD gained no commit\./);
  assert.match(refused.stderr, /the checkout you made:\n {2}git rev-parse --abbrev-ref HEAD\n/);
  assert.doesNotMatch(refused.stderr, /HEAD moved|commits above/);
  assert.ok(refused.stderr.includes(`--accept=${head}`), 'rebaseline, unlike verify, names the sha');

  const mistyped = guard(dir, ['rebaseline', '--accept=0123456789abcdef']);

  assert.equal(mistyped.status, 2);
  assert.match(mistyped.stderr, /HEAD has not moved since the snapshot, so the sha was mistyped\./);
  assert.doesNotMatch(mistyped.stderr, /HEAD moved again/, 'it did not move at all (#907 round 1)');

  const accepted = guard(dir, ['rebaseline', `--accept=${head}`]);

  assert.equal(accepted.status, 0, accepted.stderr);
  const snap = JSON.parse(readFileSync(snapshotPath(dir), 'utf8'));
  assert.deepEqual(snap.rebaselinedFrom.acceptedCommits, []);
  assert.equal(snap.rebaselinedFrom.fastForward, null,
    "no HEAD move, so no ancestry reading — not 'created', the unborn value (#907 round 1)");
  assert.equal(guard(dir, ['verify']).status, 0, 're-armed on the branch it now sits on');
});

test('rebaseline refusing an index-flag change names git ls-files -v, and not a HEAD move (#887)', async (t) => {
  // The refusal said "the WORKING TREE moved, not just HEAD" and "Inspect it first:  git status
  // … / git diff" whatever moved. Here HEAD did not move and only a flag did.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  git(dir, ['update-index', '--skip-worktree', 'src/a.txt']);
  const head = git(dir, ['rev-parse', 'HEAD']);

  const r = guard(dir, ['rebaseline', `--accept=${head}`]);

  assert.equal(r.status, 1, 'a flag change is never accepted');
  assert.match(r.stderr, /the WORKING TREE moved\./);
  assert.doesNotMatch(r.stderr, /not just HEAD/, 'HEAD did not move');
  assert.match(r.stderr, /Inspect it first:\n {2}for the index flags \([^)]*\):\n {4}git ls-files -v\n/);
  assert.doesNotMatch(r.stderr, /git diff|git status/);
});

test('rebaseline with no snapshot is not a synonym for snapshot', async (t) => {
  // Silently arming here would make `guard:rebaseline` a second spelling of
  // `guard:snapshot` that no longer means "I accepted a move".
  const dir = makeRepo(t);

  const r = guard(dir, ['rebaseline', `--accept=${git(dir, ['rev-parse', 'HEAD'])}`]);

  assert.equal(r.status, 2);
  assert.match(r.stderr, /nothing to re-baseline FROM/);
  assert.ok(!existsSync(snapshotPath(dir)), 'it must not have armed one');
});

test('rebaseline on an unmoved repository changes nothing', async (t) => {
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  const armed = readFileSync(snapshotPath(dir), 'utf8');

  const r = guard(dir, ['rebaseline']);

  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /nothing moved/);
  assert.equal(readFileSync(snapshotPath(dir), 'utf8'), armed,
    'a no-op rebaseline must not rewrite takenAt or add empty provenance');
});

// ── the guard still guards (#688 AC3) ───────────────────────────────────────

test('AC3: an agent commit the operator did not make still goes RED', async (t) => {
  // Everything above adds an exit. This asserts the exit did not become a hole:
  // the case the whole tool exists for must still be caught, and `verify` must
  // still name the recovery for a commit that is not yours.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  const before = git(dir, ['rev-parse', 'HEAD']);

  writeFileSync(join(dir, 'src', 'stray-fixture.sh'), '#!/bin/sh\necho oops\n', 'utf8');
  git(dir, ['add', '--', 'src/stray-fixture.sh']);
  git(dir, ['-c', 'user.name=Subagent', '-c', 'user.email=agent@example.invalid',
    'commit', '-m', 'add fixture']);

  assert.equal(git(dir, ['status', '--porcelain']), '',
    'precondition: git status reads CLEAN, which is why this needs a guard at all');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1, 'a committed stray write must still be caught');
  assert.match(r.stderr, /HEAD moved/);
  assert.match(r.stderr, /Subagent/,
    'the author is printed as a HINT, never as the discriminator — in #493 it was identical '
    + 'to the operator\'s, because a subagent commits through this repository\'s own git config');
  assert.ok(r.stderr.includes(`git reset --mixed ${before.slice(0, 8)}`),
    'the recovery for a commit that is NOT yours must still be named');
  assert.ok(existsSync(snapshotPath(dir)), 'and the baseline is kept for a re-verify');
});

test('AC3: --release still refuses to drop the baseline over an agent commit', async (t) => {
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  writeFileSync(join(dir, 'src', 'stray.txt'), 'oops\n', 'utf8');
  git(dir, ['add', '--', 'src/stray.txt']);
  git(dir, ['commit', '-m', 'stray']);

  const r = guard(dir, ['verify', '--release']);

  assert.equal(r.status, 1);
  assert.ok(existsSync(snapshotPath(dir)), 'release must not consume a dirty baseline');
});

test('verify names BOTH exits when HEAD moves, and prefers neither', async (t) => {
  // Finding 2: the old message offered `git reset --mixed <snapshot>` alone,
  // which would undo a merge the operator intended — wrong advice delivered at
  // the moment they are deciding what to trust.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  mergeOwnBranch(dir);

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1, 'a moved HEAD is still a change; naming the exit is not accepting it');
  assert.match(r.stderr, /If a commit is NOT yours/);
  assert.match(r.stderr, /If every commit IS yours/);
  assert.match(r.stderr, /Investigate BEFORE PUSHING/,
    'pushing is the irreversibility boundary and the advice must say so');
  assert.match(r.stderr, /IS an ancestor of the new HEAD/,
    'ancestry is reported as evidence for the reader to weigh');
});

test('THE HOLE: verify must not hand out a paste-ready override', async (t) => {
  // An earlier version printed `guard:rebaseline -- --accept=<full HEAD>` in the
  // FAILURE output. For the #493 case — a subagent commits, the tree reads clean —
  // the red verify therefore ended with a command that makes the next verify green,
  // one paste away. A guard whose own failure message carries its override is not a
  // guard, and the test that used to live here asserted the paste-ready sha as a
  // REQUIREMENT, cementing the hole against repair.
  //
  // The acknowledgement is a control against ACCIDENT, not intent: anyone can type
  // `$(git rev-parse HEAD)`. What it buys is exactly that the green path is never
  // sitting in the red output, and that is what this pins.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  writeFileSync(join(dir, 'src', 'stray-fixture.sh'), '#!/bin/sh\n', 'utf8');
  git(dir, ['add', '--', 'src/stray-fixture.sh']);
  git(dir, ['commit', '-m', 'stray']);
  const head = git(dir, ['rev-parse', 'HEAD']);

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  // The token itself, not two of its lengths. Asserting only the 40- and 8-character
  // forms left a 7-character gap: `--accept=${head.slice(0, 7)}` is paste-ready AND
  // accepted (`accepted.length < 7` admits exactly 7) while containing neither. Verify's
  // naming line carries no `--accept=` substring at all, so the strong form is free.
  assert.ok(!r.stderr.includes('--accept='),
    'verify must not print a paste-ready --accept at ANY abbreviation length');
  assert.match(r.stderr, /\n {4}npm run guard:rebaseline\n/,
    'it may still NAME the command, bare (#908) — the caller must fetch the sha themselves');
});

test('verify does not advise rebaseline when it would refuse', async (t) => {
  // Both moved. Advising a command that then exits 1 is incoherent advice at the
  // moment of decision, which is the failure this file already fixed once for the
  // occupied-slot refusal.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  mergeOwnBranch(dir);
  writeFileSync(join(dir, 'src', 'a.txt'), 'someone else wrote this\n', 'utf8');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  // "Settle that first" named no command until #908; now it names the one that shows the move.
  assert.match(r.stderr,
    /would refuse\. Settle that first:\n {4}the working tree: {2}git diff {2}\/ {2}git status --porcelain -uall\n/);
  assert.doesNotMatch(r.stderr, /git ls-files -v/, 'no flag moved, so no flag command');
  assert.ok(!r.stderr.includes('If every commit IS yours'),
    'the rebaseline exit must not be offered when the tree also moved');
  assert.ok(!/the tree is otherwise clean/.test(r.stderr),
    'and it must not claim the tree is clean when it is not');
});

test('a HEAD move plus an index-flag change names git ls-files -v (#908)', async (t) => {
  // The HEAD-moved path said "Settle that first." and named nothing, while git diff and git
  // status print nothing for a flag. The other two paths name `git ls-files -v` since #907.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  mergeOwnBranch(dir);
  git(dir, ['update-index', '--skip-worktree', 'src/a.txt']);
  writeFileSync(join(dir, 'src', 'a.txt'), 'changed under skip-worktree\n', 'utf8');
  assert.equal(git(dir, ['diff']), '', 'git diff shows nothing for a flag-only change');
  assert.equal(git(dir, ['status', '--porcelain', '-uall']), '', 'nor does git status');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.match(r.stderr,
    /would refuse\. Settle that first:\n {4}the index flags \(run at the repository root; [^)]*\):\n {6}git ls-files -v\n/);
  assert.doesNotMatch(r.stderr, /the working tree: /, 'no file moved, so no file command');
});

test('an unanswerable ancestry is reported as unknown, not as "no"', async (t) => {
  // `git merge-base --is-ancestor` exits 1 for "not an ancestor" and >= 128 for
  // "could not look" — a pruned or corrupt object, realistic in a tool whose whole
  // subject is rebases. Collapsing them printed "history diverged or was replaced"
  // over a question git declined to answer.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  const snap = JSON.parse(readFileSync(snapshotPath(dir), 'utf8'));
  snap.head = '0'.repeat(40);   // well-formed, and not an object in this repository
  writeFileSync(snapshotPath(dir), JSON.stringify(snap), 'utf8');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.match(r.stderr, /could NOT determine ancestry/);
  assert.ok(!/history diverged or was replaced/.test(r.stderr),
    'a question git refused to answer must not be reported as an answer');

  // The reason the rendering alone is not enough: `'unknown'` is TRUTHY, so an
  // `if (!fastForward)` guard on the reset-safety NOTE suppresses it in exactly the case
  // the three-valued ancestry exists to surface — and prints `git reset --mixed <sha>`
  // whose target's existence is what 'unknown' doubts. Without this assertion both the
  // buggy and the fixed form pass.
  assert.match(r.stderr, /git could not tell whether that commit is an ancestor/,
    'the reset advice must be qualified when ancestry is unknown');
  assert.match(r.stderr, /git cat-file -t/, 'and must say how to check');
  // git could not produce the list, so "listed above" would point at nothing (#908's class).
  assert.doesNotMatch(r.stderr, /Read every commit listed above/);
  assert.match(r.stderr, /HEAD moved, and git could not list its commits \(see the ancestry line above\)/);
});

test('an unborn baseline can still be re-baselined, without an invalid range', async (t) => {
  // `git log '(unborn)..HEAD'` can never succeed, so the enumeration guard would brick
  // rebaseline for an operator who armed an empty repository and then made their own
  // first commits — back to `--force`, which is the whole point of this command. And the
  // refusal would print that unrunnable range as copy-pasteable advice, the defect class
  // the unborn branch of verify's message already exists to forbid.
  const dir = mkdtempSync(join(tmpdir(), 'repo-guard-'));
  t.after(() => rmTree(dir));
  git(dir, ['init', '-b', 'main']);
  git(dir, ['config', 'user.email', 'test@example.invalid']);
  git(dir, ['config', 'user.name', 'Fixture']);

  assert.equal(guard(dir, ['snapshot']).status, 0, 'an empty repo is a legitimate baseline');

  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(join(dir, 'src', 'a.txt'), 'mine\n', 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'my own first commit']);

  const refusal = guard(dir, ['rebaseline']);
  assert.equal(refusal.status, 2);
  assert.match(refusal.stderr, /every commit now present arrived during the run/);
  assert.match(refusal.stderr, /my own first commit/, 'the commits must actually be listed');
  assert.ok(!refusal.stderr.includes('(unborn)..'),
    'an invalid revision range must never be printed as advice');

  const r = guard(dir, ['rebaseline', `--accept=${git(dir, ['rev-parse', 'HEAD'])}`]);
  assert.equal(r.status, 0, r.stderr);
  const snap = JSON.parse(readFileSync(snapshotPath(dir), 'utf8'));
  assert.equal(snap.rebaselinedFrom.acceptedCommits.length, 1,
    'the accepted commit is recorded, not an empty list');
});

test('rebaseline refuses when it could not enumerate the commits', async (t) => {
  // The ENUMERATE leg of the acknowledgement rests on that list. Accepting an empty
  // one writes `acceptedCommits: []` into permanent provenance — a record asserting
  // a review that could not have happened.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  const snap = JSON.parse(readFileSync(snapshotPath(dir), 'utf8'));
  snap.head = '0'.repeat(40);
  writeFileSync(snapshotPath(dir), JSON.stringify(snap), 'utf8');

  const r = guard(dir, ['rebaseline', `--accept=${git(dir, ['rev-parse', 'HEAD'])}`]);

  assert.equal(r.status, 2, 'no evidence means the question is unanswered');
  assert.match(r.stderr, /nothing to acknowledge/);
  const after = JSON.parse(readFileSync(snapshotPath(dir), 'utf8'));
  assert.equal(after.head, '0'.repeat(40), 'the baseline must be untouched');
});

test('a malformed rebaselineHistory exits 2, not 1 — uncertainty is not a verdict', async (t) => {
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);

  for (const corrupt of [{}, 'abc', 42]) {
    const snap = JSON.parse(readFileSync(snapshotPath(dir), 'utf8'));
    snap.rebaselineHistory = corrupt;
    writeFileSync(snapshotPath(dir), JSON.stringify(snap), 'utf8');

    const r = guard(dir, ['verify']);
    assert.equal(r.status, 2, `${JSON.stringify(corrupt)} must read as uncertainty, not "changed"`);
    assert.match(r.stderr, /malformed 'rebaselineHistory'/);
  }
});

test('a replaced history is reported as NOT an ancestor', async (t) => {
  // The reset advice is actively destructive here, so the message says so.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  git(dir, ['checkout', '-q', '--orphan', 'other']);
  writeFileSync(join(dir, 'src', 'a.txt'), 'unrelated\n', 'utf8');
  git(dir, ['add', '--', 'src/a.txt']);
  git(dir, ['commit', '-m', 'unrelated root']);

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.match(r.stderr, /NOT an ancestor of the new HEAD/);
  assert.match(r.stderr, /move you onto different history/);
});

test('--accept given without a value says so, rather than "unknown argument"', async (t) => {
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);

  const r = guard(dir, ['rebaseline', '--accept']);

  assert.equal(r.status, 2);
  assert.match(r.stderr, /needs a value/);
});

test('rebaseline rejects flags that belong to another subcommand', async (t) => {
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);

  for (const bad of ['--release', '--force', '--acccept=abcdefg']) {
    const r = guard(dir, ['rebaseline', bad]);
    assert.equal(r.status, 2, `${bad} should be refused`);
    assert.match(r.stderr, /unknown argument/);
  }
});

// ── #908: a HEAD move that added no commit, an unborn branch switch, and advice that pastes ──

/** Arm on a branch one commit ahead of main, then check main out: HEAD moves BACKWARD. */
function armAheadThenCheckoutMain(t) {
  const dir = makeRepo(t);
  git(dir, ['checkout', '-q', '-b', 'feature']);
  writeFileSync(join(dir, 'src', 'b.txt'), 'feature work\n', 'utf8');
  git(dir, ['add', '--', 'src/b.txt']);
  git(dir, ['commit', '-m', 'feature work']);
  const before = git(dir, ['rev-parse', 'HEAD']);
  guard(dir, ['snapshot']);
  git(dir, ['checkout', '-q', 'main']);
  return { dir, before, head: git(dir, ['rev-parse', 'HEAD']) };
}

test('a HEAD move BACKWARD is not called diverged, and names a range that prints something (#908)', async (t) => {
  // `ancestry(before, after) === false` covered unrelated history AND a move onto an ancestor,
  // and the advice then said "Read every commit listed above" over none, naming a range that
  // printed nothing. Both premises are asserted, so the fixture cannot drift into another shape.
  const { dir, before } = armAheadThenCheckoutMain(t);
  const short = before.slice(0, 8);
  assert.equal(git(dir, ['log', '--oneline', `${before}..HEAD`]), '', 'no commit was added');
  assert.match(git(dir, ['log', '--oneline', `HEAD..${short}`]), /feature work/, 'the reverse range prints');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1, 'a backward move is still a change');
  assert.match(r.stderr, /the new HEAD is an ANCESTOR of the snapshot commit — HEAD moved backward and gained no commit\./);
  assert.doesNotMatch(r.stderr, /diverged or was replaced/);
  assert.match(r.stderr, /commits the snapshot had that HEAD no longer does:\n {2}\S+ .*feature work\n/);
  assert.doesNotMatch(r.stderr, /commits added:|Read every commit listed above|If a commit is NOT yours|git reset --mixed/,
    'no commit was added, so none may be described, and there is nothing to reset away');
  assert.ok(r.stderr.includes(`\n    git log --oneline HEAD..${short}\n`), 'the range that prints, bare');
  assert.match(r.stderr, /Read it, then accept:\n {4}npm run guard:rebaseline\n/);
  assert.ok(!r.stderr.includes('--accept='), 'and verify still never prints a paste-ready override');
});

test('rebaseline over a backward move does not ask for commits that are not there (#908)', async (t) => {
  const { dir, head } = armAheadThenCheckoutMain(t);

  const refused = guard(dir, ['rebaseline']);

  assert.equal(refused.status, 2, 'still an unanswered question');
  assert.match(refused.stderr, /HEAD moved, but gained no commit: it moved backward/);
  assert.doesNotMatch(refused.stderr, /Read the commits above|commits added:/);
  assert.ok(refused.stderr.includes(`--accept=${head}`), 'rebaseline, unlike verify, names the sha');

  const accepted = guard(dir, ['rebaseline', `--accept=${head}`]);

  assert.equal(accepted.status, 0, accepted.stderr);
  assert.match(accepted.stdout, /accepting 0 commit\(s\) \(HEAD moved backward\)/);
  const snap = JSON.parse(readFileSync(snapshotPath(dir), 'utf8'));
  assert.deepEqual(snap.rebaselinedFrom.acceptedCommits, []);
  assert.equal(snap.rebaselinedFrom.fastForward, 'backward',
    'recorded as a backward move, not as `false`, which reads as unrelated history');
});

test('a HEAD move onto an unborn branch is not blamed on a corrupt object (#908)', async (t) => {
  // `git checkout --orphan` is the other HEAD move that adds no commit. It was reported as
  // "could NOT determine ancestry (a pruned or corrupt object?)", told the caller to read the
  // commits listed above, and named `git log <before>..HEAD`, which fails on an unborn HEAD.
  const dir = makeRepo(t);
  const short = git(dir, ['rev-parse', 'HEAD']).slice(0, 8);
  guard(dir, ['snapshot']);
  git(dir, ['checkout', '-q', '--orphan', 'fresh']);

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.match(r.stderr, /HEAD moved: \S+ -> \(unborn\)/);
  assert.match(r.stderr, /the new HEAD is on a branch with no commits \(an orphan checkout\?\), so HEAD gained no commit\./);
  assert.doesNotMatch(r.stderr, /could NOT determine ancestry|pruned or corrupt/);
  assert.doesNotMatch(r.stderr, /Read every commit listed above|git reset --mixed|\.\.HEAD/);
  assert.ok(r.stderr.includes(`\n    git log --oneline ${short}\n`), 'the snapshot commit is still there to read');
  assert.match(r.stderr, /branch changed: main -> fresh/, 'the unborn branch is read by name, not as (unborn)');
  // The orphan keeps the index, so the tree moved too and rebaseline would refuse.
  assert.match(r.stderr, /Settle that first:\n {4}the working tree: /);
});

test('rebaseline accepts a move onto an unborn branch when the tree did not move (#908)', async (t) => {
  // The range `<sha>..(unborn)` cannot resolve, so the enumeration guard refused this as
  // "git could not list the commits", sending the operator to `--force`. The empty list is
  // complete: a branch with no commits holds none that could have been added.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  git(dir, ['checkout', '-q', '--orphan', 'fresh']);
  git(dir, ['rm', '-rfq', '--', '.']);
  assert.equal(git(dir, ['status', '--porcelain', '-uall']), '', 'precondition: the tree did not move');

  const refused = guard(dir, ['rebaseline']);

  assert.equal(refused.status, 2);
  assert.match(refused.stderr, /HEAD moved, but gained no commit: it moved onto a branch with no commits\./);
  assert.doesNotMatch(refused.stderr, /could not list the commits/);
  assert.ok(refused.stderr.includes("npm run guard:rebaseline -- --accept='(unborn)'\n"));

  const accepted = guard(dir, ['rebaseline', '--accept=(unborn)']);

  assert.equal(accepted.status, 0, accepted.stderr);
  const snap = JSON.parse(readFileSync(snapshotPath(dir), 'utf8'));
  assert.equal(snap.rebaselinedFrom.fastForward, 'to-unborn');
  assert.deepEqual(snap.rebaselinedFrom.acceptedCommits, []);
});

test('an unborn baseline sees a branch switch, and names a command that prints it (#908)', async (t) => {
  // `git rev-parse --abbrev-ref HEAD` exits 128 on an unborn branch, so both captures read
  // `(unborn)` and a switch passed as "unchanged", exit 0. Both premises are asserted.
  const dir = mkdtempSync(join(tmpdir(), 'repo-guard-unborn-'));
  t.after(() => rmTree(dir));
  git(dir, ['init', '-b', 'main']);
  guard(dir, ['snapshot']);
  git(dir, ['checkout', '-q', '-b', 'other']);
  assert.notEqual(spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: dir }).status, 0,
    'the primary read fails on an unborn branch');
  assert.equal(git(dir, ['symbolic-ref', '--short', 'HEAD']), 'other', 'the named command does not');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1, 'a branch switch on an unborn repository is a change');
  assert.match(r.stderr, /branch changed: main -> other/);
  assert.match(r.stderr, /the branch \(main -> other\): {2}git symbolic-ref --short HEAD\n/);

  const refused = guard(dir, ['rebaseline']);

  assert.equal(refused.status, 2);
  assert.match(refused.stderr, /the checkout you made:\n {2}git symbolic-ref --short HEAD\n/);
  // `(unborn)` unquoted is a glob group under zsh and a syntax error under bash.
  assert.ok(refused.stderr.includes("npm run guard:rebaseline -- --accept='(unborn)'\n"),
    'the sentinel is quoted, so the line pastes');

  const accepted = guard(dir, ['rebaseline', '--accept=(unborn)']);

  assert.equal(accepted.status, 0, accepted.stderr);
  assert.equal(guard(dir, ['verify']).status, 0, 're-armed on the branch it now sits on');
});

test('no command the guard prints for pasting carries a trailing # comment (#908)', async (t) => {
  // With interactive comments off, zsh's default, `#` starts no comment: its words become
  // arguments, and a `;` in them starts a second command (measured on #907). Every fixture
  // below reaches a line that carried one, and the first three assertions prove it did.
  const outputs = [];
  {
    const dir = makeRepo(t);
    guard(dir, ['snapshot']);
    mergeOwnBranch(dir);
    outputs.push(guard(dir, ['verify']).stderr);
  }
  {
    // The enumeration refusal: a snapshot commit git cannot find.
    const dir = makeRepo(t);
    guard(dir, ['snapshot']);
    const snap = JSON.parse(readFileSync(snapshotPath(dir), 'utf8'));
    snap.head = '0'.repeat(40);
    writeFileSync(snapshotPath(dir), JSON.stringify(snap), 'utf8');
    outputs.push(guard(dir, ['rebaseline', `--accept=${git(dir, ['rev-parse', 'HEAD'])}`]).stderr);
  }
  {
    // The branch-only advice, whose prose line carried `; read it` (#908 NOTE-1).
    const dir = makeRepo(t);
    git(dir, ['checkout', '-q', '--detach']);
    guard(dir, ['snapshot']);
    git(dir, ['checkout', '-q', 'main']);
    outputs.push(guard(dir, ['verify']).stderr);
  }
  const all = outputs.join('\n');
  // Reached, not bare: the premises must not do the sweep's job, or its own assertion is never
  // the one that fails (measured: a `#` mutant died here first, leaving the sweep unproven).
  assert.match(all, /\n {4}git reset --mixed \S+/, 'the fixtures reached the reset line');
  assert.match(all, /git log --oneline 0{8}\.\.HEAD/, 'and the enumeration refusal');
  assert.match(all, /\n {4}npm run guard:rebaseline/, 'and the rebaseline hint');

  const commented = all.split('\n').filter((line) => /^\s+(?:git|npm run) /.test(line) && /\s#/.test(line));
  assert.deepEqual(commented, [], 'a command line with a trailing # does not paste under zsh');
  assert.doesNotMatch(all, /;\s*read\b/, 'a `read` after a `;` runs as a command when pasted');
});

// ── #920 round 1 ────────────────────────────────────────────────────────────

test('a corrupt branch ref is not read as an orphan checkout, and rebaseline still fails closed (#920 F2)', async (t) => {
  // `head` is `(unborn)` whenever `git rev-parse HEAD` fails, for any reason. An orphan
  // checkout is one; a ref holding garbage is another, and git calls that "broken", not unborn.
  // `symbolic-ref` tells them apart: it names an orphan's branch and fails on a broken ref. The
  // tree is emptied first so rebaseline's worktree refusal cannot be what stops it.
  const dir = makeRepo(t);
  git(dir, ['rm', '-rfq', '--', '.']);
  git(dir, ['commit', '-qm', 'empty the tree']);
  guard(dir, ['snapshot']);
  writeFileSync(join(dir, '.git', 'refs', 'heads', 'main'), 'not-a-sha\n', 'utf8');
  assert.notEqual(spawnSync('git', ['symbolic-ref', '--short', 'HEAD'], { cwd: dir }).status, 0,
    'premise: the branch read fails too, which is what separates this from an orphan');

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.match(r.stderr, /could NOT determine ancestry/);
  assert.doesNotMatch(r.stderr, /orphan checkout/);

  const accepted = guard(dir, ['rebaseline', '--accept=(unborn)']);

  assert.equal(accepted.status, 2, `a question git could not answer is not a yes:\n${accepted.stderr}`);
  assert.match(accepted.stderr, /git could not list the commits/);
});

test('a deleted branch ref under HEAD reads as unborn, and cannot be accepted blind (#920 F2 control, R2-2)', async (t) => {
  // `update-ref -d` leaves HEAD naming `main` with no commits; git says "No commits yet". The
  // F2 gate must read it as an unborn branch, not a broken ref. But whatever `main` held since
  // the snapshot went with the ref and cannot be listed, so rebaseline refuses, as the old build
  // did (#920 round 2, R2-2).
  const dir = makeRepo(t);
  git(dir, ['rm', '-rfq', '--', '.']);
  git(dir, ['commit', '-qm', 'empty the tree']);
  guard(dir, ['snapshot']);
  git(dir, ['update-ref', '-d', 'refs/heads/main']);
  assert.equal(git(dir, ['symbolic-ref', '--short', 'HEAD']), 'main', 'premise: the branch still reads');

  const r = guard(dir, ['verify']);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /on a branch with no commits \(an orphan checkout\?\)/, 'the F2 gate reads it as unborn');
  assert.match(r.stderr, /main no longer points at a commit, so a commit made on it is not checked here\./);

  const accepted = guard(dir, ['rebaseline', '--accept=(unborn)']);

  assert.equal(accepted.status, 2, accepted.stderr);
  assert.match(accepted.stderr,
    /HEAD moved onto a branch with no commits, and main no longer points at a commit, so a commit made before the move cannot be listed\./);
});

/** Commit a stray file on whatever HEAD is now, the way an agent would. */
function strayCommit(dir, message = 'STRAY agent commit') {
  writeFileSync(join(dir, 'src', 'stray.txt'), `${message}\n`, 'utf8');
  git(dir, ['add', '--', 'src/stray.txt']);
  git(dir, ['commit', '-qm', message]);
  return git(dir, ['rev-parse', 'HEAD']);
}

test('a commit on the branch HEAD left is listed, not called "no commit" (#920 F1, backward)', async (t) => {
  // "No commit was added" was printed after reading only HEAD's range. An agent commits on
  // `feature`, the snapshot's branch, then checks out `main`: HEAD gained nothing, the
  // repository did, and the old output never showed it.
  const dir = makeRepo(t);
  git(dir, ['checkout', '-q', '-b', 'feature']);
  writeFileSync(join(dir, 'src', 'b.txt'), 'feature work\n', 'utf8');
  git(dir, ['add', '--', 'src/b.txt']);
  git(dir, ['commit', '-qm', 'feature work']);
  guard(dir, ['snapshot']);
  strayCommit(dir);
  git(dir, ['checkout', '-q', 'main']);
  const head = git(dir, ['rev-parse', 'HEAD']);

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.match(r.stderr, /commits added to feature, the branch HEAD left:\n {2}\S+ .*STRAY agent commit\n/);
  assert.doesNotMatch(r.stderr, /no commit was added|gained no commit:/,
    'a commit WAS added, so no sentence may say otherwise');
  assert.match(r.stderr, /Read every commit listed above/);
  assert.match(r.stderr, /\n {2}feature, the branch HEAD left, moved: \S+ -> \S+\n/);
  assert.match(r.stderr, /\n {4}git log --oneline \S+\.\.refs\/heads\/feature\n/, 'names the range that shows it');
  assert.doesNotMatch(r.stderr, /git reset --mixed/,
    'HEAD gained nothing, so a reset of HEAD\'s branch would drop nothing and move it onto feature');

  const refused = guard(dir, ['rebaseline']);
  assert.equal(refused.status, 2);
  assert.match(refused.stderr, /Read the commits above/);
  assert.doesNotMatch(refused.stderr, /no commit was added|gained no commit:/);

  const accepted = guard(dir, ['rebaseline', `--accept=${head}`]);
  assert.equal(accepted.status, 0, accepted.stderr);
  const snap = JSON.parse(readFileSync(snapshotPath(dir), 'utf8'));
  assert.equal(snap.rebaselinedFrom.acceptedCommits.length, 1);
  assert.match(snap.rebaselinedFrom.acceptedCommits[0], /STRAY agent commit/, 'the record names it');
});

test('a commit on the branch left for an orphan is listed, and must be acknowledged (#920 F1, orphan)', async (t) => {
  // The orphan case went from refused (exit 2) to accepted with `acceptedCommits: []` while a
  // stray commit sat on the branch HEAD left.
  const dir = makeRepo(t);
  guard(dir, ['snapshot']);
  strayCommit(dir);
  git(dir, ['checkout', '-q', '--orphan', 'fresh']);
  git(dir, ['rm', '-rfq', '--', '.']);

  const r = guard(dir, ['verify']);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /commits added to main, the branch HEAD left:\n {2}\S+ .*STRAY agent commit\n/);
  assert.doesNotMatch(r.stderr, /no commit was added|gained no commit:/);

  const refused = guard(dir, ['rebaseline']);
  assert.equal(refused.status, 2);
  assert.match(refused.stderr, /Read the commits above/);

  const accepted = guard(dir, ['rebaseline', '--accept=(unborn)']);
  assert.equal(accepted.status, 0, accepted.stderr);
  const snap = JSON.parse(readFileSync(snapshotPath(dir), 'utf8'));
  assert.equal(snap.rebaselinedFrom.acceptedCommits.length, 1);
  assert.equal(snap.rebaselinedFrom.fastForward, 'to-unborn');
});

test('a commit on the branch left for a detached checkout is listed (#920 F1, branch only)', async (t) => {
  // HEAD did not move at all: armed on main, a stray commit, then a detached checkout of the
  // snapshot commit. "HEAD did not move, so no commit was added" was printed over it (#907's line).
  const dir = makeRepo(t);
  const snapshotCommit = git(dir, ['rev-parse', 'HEAD']);
  guard(dir, ['snapshot']);
  strayCommit(dir);
  git(dir, ['checkout', '-q', '--detach', snapshotCommit]);

  const r = guard(dir, ['verify']);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /commits added to main, the branch HEAD left:\n {2}\S+ .*STRAY agent commit\n/);
  assert.match(r.stderr, /\n {2}commits on main, the branch HEAD left: {2}git log --oneline \S+\.\.refs\/heads\/main\n/);

  const refused = guard(dir, ['rebaseline']);
  assert.equal(refused.status, 2);
  assert.doesNotMatch(refused.stderr, /no commit was added/);
  assert.match(refused.stderr, /Read the commits above/);
});

test('a branch merged into HEAD is not listed twice (#920 F1 control)', async (t) => {
  // The branch HEAD left can be an ancestor of HEAD, after a merge. Its commits are HEAD's
  // then, and the left-branch listing excludes what HEAD reaches.
  const dir = makeRepo(t);
  git(dir, ['checkout', '-q', '-b', 'feature']);
  guard(dir, ['snapshot']);
  strayCommit(dir, 'my own work on feature');
  git(dir, ['checkout', '-q', 'main']);
  git(dir, ['merge', '-q', '--no-ff', '-m', 'merge feature', 'feature']);
  const head = git(dir, ['rev-parse', 'HEAD']);

  const accepted = guard(dir, ['rebaseline', `--accept=${head}`]);

  assert.equal(accepted.status, 0, accepted.stderr);
  const snap = JSON.parse(readFileSync(snapshotPath(dir), 'utf8'));
  assert.equal(snap.rebaselinedFrom.acceptedCommits.length, 2, 'the merge and the commit it brought in, once each');
  assert.doesNotMatch(accepted.stderr, /the branch HEAD left/);
});

test('with nothing on the branch HEAD left, the no-commit claim says what it checked (#920 F1, F5)', async (t) => {
  // The earned sentence: HEAD gained none, and the branch it left gained none. And since the
  // move may not be the operator's, a way back is named, one that refuses rather than overwrites.
  const { dir, before } = armAheadThenCheckoutMain(t);

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.match(r.stderr, /HEAD moved, but gained no commit: it moved backward, onto an ancestor of the snapshot commit\./);
  assert.match(r.stderr, /feature, the branch HEAD left, gained none either\./);
  assert.match(r.stderr, /If you did NOT make it, this returns to the snapshot's branch:\n {4}git checkout feature\n/);
  assert.ok(!r.stderr.includes(`merge --ff-only`), 'the branch moved, so the way back is a checkout');
  void before;
});

test('a backward move on the same branch names a way back that refuses to overwrite (#920 F5)', async (t) => {
  // An agent's `git reset --hard HEAD~1` drops an operator commit. The only exit named was
  // rebaseline, for "I made it".
  const dir = makeRepo(t);
  strayCommit(dir, 'operator commit');
  const snapshotCommit = git(dir, ['rev-parse', 'HEAD']);
  guard(dir, ['snapshot']);
  git(dir, ['reset', '-q', '--hard', 'HEAD~1']);

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.ok(r.stderr.includes(`If you did NOT make it, this moves main back to the snapshot commit, refusing rather than overwriting:\n    git merge --ff-only ${snapshotCommit.slice(0, 8)}\n`),
    r.stderr);
  const back = spawnSync('git', ['merge', '-q', '--ff-only', snapshotCommit.slice(0, 8)], { cwd: dir, encoding: 'utf8' });
  assert.equal(back.status, 0, 'the named command works');
  assert.equal(guard(dir, ['verify']).status, 0, 'and restores the baseline');
});

test('a detached snapshot says its left-behind commits were not checked (#920 F1)', async (t) => {
  // Armed on a detached HEAD, there is no branch to read: a commit made there and then left is
  // reachable only through the reflog, so "no commit was added" cannot be earned.
  const dir = makeRepo(t);
  git(dir, ['checkout', '-q', '--detach']);
  guard(dir, ['snapshot']);
  git(dir, ['checkout', '-q', 'main']);

  const refused = guard(dir, ['rebaseline']);

  assert.equal(refused.status, 2);
  assert.match(refused.stderr, /only the branch changed\. HEAD did not move, so HEAD gained no commit\./);
  assert.match(refused.stderr, /The snapshot was on a detached HEAD, so a commit made there and then left is not checked here\. The reflog lists every commit HEAD visited:\n {2}git reflog\n/);
});

test('an unborn baseline names rebaseline, and a flag change its command (#920 F4)', async (t) => {
  // The third HEAD-moved path called neither helper: it never named rebaseline, which accepts
  // this case, and never named `git ls-files -v` for a flag change.
  const armEmpty = () => {
    const dir = mkdtempSync(join(tmpdir(), 'repo-guard-unborn-'));
    t.after(() => rmTree(dir));
    git(dir, ['init', '-b', 'main']);
    git(dir, ['config', 'user.email', 'test@example.invalid']);
    git(dir, ['config', 'user.name', 'Fixture']);
    guard(dir, ['snapshot']);
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src', 'a.txt'), 'mine\n', 'utf8');
    git(dir, ['add', '-A']);
    git(dir, ['commit', '-qm', 'my own first commit']);
    return dir;
  };

  const clean = guard(armEmpty(), ['verify']);
  assert.equal(clean.status, 1);
  assert.match(clean.stderr, /If you made these commits, run this\. It prints the delta and refuses\. Read it, then accept:\n {4}npm run guard:rebaseline\n/);

  const flagged = armEmpty();
  git(flagged, ['update-index', '--skip-worktree', 'src/a.txt']);
  const r = guard(flagged, ['verify']);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /Settle that first:\n {4}the index flags \([^)]*\):\n {6}git ls-files -v\n/);
  assert.doesNotMatch(r.stderr, /npm run guard:rebaseline/, 'rebaseline refuses a flag change, so it is not offered');
});

test('a branch name that needs quoting is printed as one shell word (#920 F5)', async (t) => {
  // Branch names may hold characters a shell reads, `(` among them. The way back names the
  // branch, so it must paste: run as printed, under bash, it has to succeed.
  const dir = makeRepo(t);
  git(dir, ['checkout', '-q', '-b', 'feature(x)']);
  strayCommit(dir, 'feature work');
  guard(dir, ['snapshot']);
  git(dir, ['checkout', '-q', 'main']);

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  const line = r.stderr.split('\n').find((l) => l.startsWith('    git checkout '));
  assert.equal(line, "    git checkout 'feature(x)'");
  const pasted = spawnSync('bash', ['-c', line.trim()], { cwd: dir, encoding: 'utf8' });
  assert.equal(pasted.status, 0, pasted.stderr);
  assert.equal(git(dir, ['rev-parse', '--abbrev-ref', 'HEAD']), 'feature(x)');
});

// ── #920 round 2 ────────────────────────────────────────────────────────────

test('an orphan move is refused when the branch HEAD left cannot be read (#920 R2-2)', async (t) => {
  // "Could not read the branch HEAD left" was treated as "read it and found nothing", so an
  // orphan move was accepted with `acceptedCommits: []` over a commit nobody listed. The old
  // build refused all three shapes, by accident; this refuses them on purpose.
  const deleted = makeRepo(t);
  guard(deleted, ['snapshot']);
  strayCommit(deleted);
  git(deleted, ['checkout', '-q', '--orphan', 'fresh']);
  git(deleted, ['rm', '-rfq', '--', '.']);
  git(deleted, ['branch', '-D', 'main']);
  const r1 = guard(deleted, ['rebaseline', '--accept=(unborn)']);
  assert.equal(r1.status, 2, r1.stderr);
  assert.match(r1.stderr, /HEAD moved onto a branch with no commits, and main, the branch the snapshot was on, no longer exists, so a commit made before the move cannot be listed\./);
  assert.match(r1.stderr, /\n {2}cat "\$\(git rev-parse --git-dir\)\/logs\/HEAD"\n/,
    'the reflog, by a command that works on an unborn HEAD (#920 round 2, R2-6)');

  const detached = makeRepo(t);
  git(detached, ['checkout', '-q', '--detach']);
  guard(detached, ['snapshot']);
  git(detached, ['checkout', '-q', '--orphan', 'fresh']);
  git(detached, ['rm', '-rfq', '--', '.']);
  const r2 = guard(detached, ['rebaseline', '--accept=(unborn)']);
  assert.equal(r2.status, 2, r2.stderr);
  assert.match(r2.stderr, /and the snapshot was on a detached HEAD, so a commit made before the move cannot be listed\./);
});

test('a branch name a tag shares is read, not reported gone (#920 R2-1)', async (t) => {
  // `rev-parse --abbrev-ref` prints `heads/feature` when a tag is also called `feature`, and
  // `refs/heads/heads/feature` does not resolve: a live branch holding a stray commit was
  // reported as deleted and its commit never listed. And `git log main..feature` resolves the
  // tag, so the range printed names the full ref.
  const dir = makeRepo(t);
  git(dir, ['checkout', '-q', '-b', 'feature']);
  strayCommit(dir, 'feature work');
  git(dir, ['tag', 'feature', 'HEAD~1']);
  assert.equal(git(dir, ['rev-parse', '--abbrev-ref', 'HEAD']), 'heads/feature', 'premise: the name is disambiguated');
  guard(dir, ['snapshot']);
  writeFileSync(join(dir, 'src', 'late.txt'), 'late\n', 'utf8');
  git(dir, ['add', '--', 'src/late.txt']);
  git(dir, ['commit', '-qm', 'STRAY agent commit']);
  git(dir, ['checkout', '-q', 'main']);

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.doesNotMatch(r.stderr, /no longer exists/, 'the branch exists');
  assert.match(r.stderr, /commits added to feature, the branch HEAD left:\n {2}\S+ .*STRAY agent commit\n/);
  assert.match(r.stderr, /\n {4}git log --oneline \S+\.\.refs\/heads\/feature\n/, 'the full ref, which the tag cannot shadow');

  const head = git(dir, ['rev-parse', 'HEAD']);
  const accepted = guard(dir, ['rebaseline', `--accept=${head}`]);
  assert.equal(accepted.status, 0, accepted.stderr);
  const snap = JSON.parse(readFileSync(snapshotPath(dir), 'utf8'));
  assert.equal(snap.rebaselinedFrom.acceptedCommits.length, 1);
});

test('an unborn baseline whose branch gained commits prints a range that pastes (#920 R2-3)', async (t) => {
  // HEAD did not move ((unborn) both times) while the branch it left gained a commit. The line
  // printed `git log --oneline (unborn)..main`, which neither shell nor git accepts.
  const dir = mkdtempSync(join(tmpdir(), 'repo-guard-unborn-'));
  t.after(() => rmTree(dir));
  git(dir, ['init', '-b', 'main']);
  git(dir, ['config', 'user.email', 'test@example.invalid']);
  git(dir, ['config', 'user.name', 'Fixture']);
  guard(dir, ['snapshot']);
  writeFileSync(join(dir, 'first.txt'), 'x\n', 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-qm', 'STRAY agent commit']);
  git(dir, ['checkout', '-q', '--orphan', 'other']);
  git(dir, ['rm', '-rfq', '--', '.']);

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.doesNotMatch(r.stderr, /\(unborn\)\.\./);
  const line = r.stderr.split('\n').find((l) => l.includes('the branch HEAD left:  git log'));
  assert.ok(line, r.stderr);
  const command = line.slice(line.indexOf('git log'));
  assert.equal(command, 'git log --oneline refs/heads/main');
  const pasted = spawnSync('bash', ['-c', command], { cwd: dir, encoding: 'utf8' });
  assert.equal(pasted.status, 0, pasted.stderr);
  assert.match(pasted.stdout, /STRAY agent commit/);
});

test('the left branch moving or vanishing is said, not called "none" (#920 R2-8)', async (t) => {
  // Two of the four no-commit sentences had no test, so a false one could ship unseen.
  const build = () => {
    const dir = makeRepo(t);
    strayCommit(dir, 'second main commit');
    git(dir, ['checkout', '-q', '-b', 'feature']);
    writeFileSync(join(dir, 'src', 'b.txt'), 'feature\n', 'utf8');
    git(dir, ['add', '--', 'src/b.txt']);
    git(dir, ['commit', '-qm', 'feature work']);
    guard(dir, ['snapshot']);
    git(dir, ['checkout', '-q', 'main']);
    return dir;
  };

  const moved = build();
  git(moved, ['branch', '-f', 'feature', 'main~1']);   // back into HEAD's history
  const r1 = guard(moved, ['verify']);
  assert.equal(r1.status, 1);
  assert.match(r1.stderr, /feature, the branch HEAD left, moved without gaining a commit HEAD cannot reach\./);
  assert.doesNotMatch(r1.stderr, /gained none either/);

  const gone = build();
  git(gone, ['branch', '-D', 'feature']);
  const r2 = guard(gone, ['verify']);
  assert.equal(r2.status, 1);
  assert.match(r2.stderr, /feature, the branch the snapshot was on, no longer exists, so a commit made on it is not checked here\./);
  assert.doesNotMatch(r2.stderr, /git checkout feature/, 'no way back into a branch that is gone');
});

test('a branch name git would parse as an option gets no way back (#920 R2-5)', async (t) => {
  // Quoting cannot help: the shell strips it before git sees `-f`, and `git checkout -f` threw
  // away a local edit. Only plumbing can make such a branch, and then no checkout is printed.
  const dir = makeRepo(t);
  git(dir, ['checkout', '-q', '-b', 'tmp']);
  strayCommit(dir, 'ahead of main');
  git(dir, ['update-ref', 'refs/heads/-f', 'HEAD']);
  git(dir, ['symbolic-ref', 'HEAD', 'refs/heads/-f']);
  guard(dir, ['snapshot']);
  git(dir, ['checkout', '-q', 'main']);

  const r = guard(dir, ['verify']);

  assert.equal(r.status, 1);
  assert.doesNotMatch(r.stderr, /git checkout/, r.stderr);
});
