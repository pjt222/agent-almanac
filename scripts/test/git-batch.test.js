/**
 * Unit tests for `scripts/lib/git-batch.js` (#587).
 *
 * The parse this covers had three copies. Two were unified by #559, which then stated the buffer
 * was "declared once" — true of those two and false of the repo, because
 * `normalize-i18n-fences.js` carried a third with a smaller buffer, no `batch.error` branch, and
 * `process.exit(1)` where the others throw.
 *
 * The third copy had no tests. Its errors point the most expensive direction in this repo: a
 * shifted blob becomes the normalizer's RESTORE BASIS, so the tool would rewrite a frozen fence
 * to another file's content — and it writes with `--write`.
 *
 * These run against a real throwaway git repo, because the defect is in how git's wire format is
 * consumed and a hand-built fixture of that format would be a test of my own transcription.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { catFileBatch, GIT_BUFFER } from '../lib/git-batch.js';
import { rmTree } from './_tmp.js';

/** A repo with two committed files, one of which is later deleted. */
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'git-batch-'));
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
  git('init', '-q');
  git('config', 'user.email', 'test@example.invalid');
  git('config', 'user.name', 'test');
  mkdirSync(join(dir, 'skills'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'a.md'), 'AAA\n');
  writeFileSync(join(dir, 'skills', 'b.md'), 'BBB\n');
  git('add', '-A');
  git('commit', '-qm', 'one');
  const first = git('rev-parse', 'HEAD').trim();
  rmSync(join(dir, 'skills', 'b.md'));
  git('add', '-A');
  git('commit', '-qm', 'delete b');
  const second = git('rev-parse', 'HEAD').trim();
  return { dir, first, second, cleanup: () => rmTree(dir) };
}

test('resolves each spec to its blob, in order', () => {
  const { dir, first, cleanup } = fixture();
  try {
    const seen = [];
    catFileBatch(dir, [`${first}:skills/a.md`, `${first}:skills/b.md`], (spec, text) => seen.push([spec, text]));
    assert.deepEqual(seen, [
      [`${first}:skills/a.md`, 'AAA\n'],
      [`${first}:skills/b.md`, 'BBB\n'],
    ]);
  } finally {
    cleanup();
  }
});

test('a MISSING object does not shift every later blob onto the wrong key', () => {
  // THE LINE THE MODULE EXISTS TO PROTECT. A missing object emits a header and no body; failing
  // to advance the index past it silently reassigns every subsequent blob. Reached by ordinary
  // history: `git log --name-only` lists a deleted path under the commit that removed it, and
  // `<that commit>:<that path>` does not resolve.
  //
  // Without the skip, `a.md` would come back carrying `BBB` — and for the normalizer that value
  // is a restore basis it writes to disk.
  const { dir, second, first, cleanup } = fixture();
  try {
    const seen = new Map();
    catFileBatch(
      dir,
      [`${second}:skills/b.md`, `${first}:skills/a.md`],
      (spec, text) => seen.set(spec, text)
    );
    assert.equal(seen.get(`${second}:skills/b.md`), null, 'the deleted path resolves to nothing');
    assert.equal(seen.get(`${first}:skills/a.md`), 'AAA\n', 'and the NEXT spec still gets its own blob');
  } finally {
    cleanup();
  }
});

test('absences are reported, not skipped', () => {
  // The two callers differ here and the library serves both: the walker ignores a `null`, the
  // normalizer records it so "resolved to nothing" is distinguishable from "never asked".
  const { dir, first, cleanup } = fixture();
  try {
    const seen = [];
    catFileBatch(dir, [`${first}:skills/nope.md`], (spec, text) => seen.push(text));
    assert.deepEqual(seen, [null]);
  } finally {
    cleanup();
  }
});

test('an empty spec list runs no git process at all', () => {
  // `git cat-file --batch` on empty input is harmless but pointless, and the guard also means a
  // caller with nothing to resolve cannot fail on a git that is not installed.
  let called = false;
  catFileBatch('/nonexistent-dir-that-would-fail', [], () => { called = true; });
  assert.equal(called, false);
});

test('a git failure throws rather than exiting the process', () => {
  // The third copy called `process.exit(1)`, which denies its caller any chance to add context.
  // The normalizer now catches this and prints its own message — it could not have, before.
  const dir = mkdtempSync(join(tmpdir(), 'git-batch-nonrepo-'));
  try {
    assert.throws(
      () => catFileBatch(dir, ['HEAD:whatever'], () => {}),
      /git cat-file --batch/,
    );
  } finally {
    rmTree(dir);
  }
});

test('the buffer is the walker\'s 2 GiB, not the normalizer\'s old 512 MiB', () => {
  // Not a style point. Two ceilings at different values is what #559 believed it had ended, and
  // the smaller one silently truncates a pool — which reclassifies files rather than stopping.
  assert.equal(GIT_BUFFER, 2048 * 1024 * 1024);
});
