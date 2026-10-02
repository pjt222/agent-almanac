/**
 * End-to-end tests for how `scripts/mutation-check.js` runs the test command (#819).
 *
 * `mutation-check.js` runs its pipeline at import, so these drive the real file as a subprocess
 * against a throwaway repository. Git is isolated for this process at module scope
 * (`isolateGitEnv`): the tool spawns its own git with the inherited environment, and an
 * inherited `GIT_DIR` would point it at the caller's repository.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { rmTree } from './_tmp.js';
import { initRepo, isolateGitEnv } from './_git-fixture.js';

isolateGitEnv();

const TOOL = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'mutation-check.js');

/** A throwaway repository holding one committed `notes.md` (syntax-free: no interpreter needed). */
function makeRepo(t, content = 'alpha\n') {
  const dir = mkdtempSync(join(tmpdir(), 'mutation-check-run-'));
  t.after(() => rmTree(dir));
  writeFileSync(join(dir, 'notes.md'), content, 'utf8');
  const git = initRepo(dir);
  return { dir, git };
}

/** Run the tool; `timeout` bounds the whole run, so a regression hangs this test, not the suite. */
function runTool(cwd, args, timeout = 60_000) {
  const r = spawnSync(process.execPath, [TOOL, ...args], { cwd, encoding: 'utf8', timeout });
  return { status: r.status, signal: r.signal, out: `${r.stdout}\n${r.stderr}` };
}

// ── stdin (#819 AC2) ────────────────────────────────────────────────────────

test('the test command gets no stdin: a command that reads it sees EOF instead of waiting', (t) => {
  // The #816 hang: the child inherited an open pipe that nothing ever wrote to or closed, so a
  // test that read stdin waited forever. `timeout 3` bounds the old behaviour, which then reads
  // as a red BASELINE (exit 124); with stdin closed, `cat` sees EOF at once, the baseline is
  // green, and the unasserted mutant survives. Both end in exit 1, so the text discriminates.
  const { dir, git } = makeRepo(t);
  const r = runTool(dir, ['--file', 'notes.md', '--test', 'timeout 3 cat', '--replace', 'alpha::beta']);
  assert.doesNotMatch(r.out, /Baseline is already failing/, r.out);
  assert.match(r.out, /MUTANT SURVIVED/, r.out);
  assert.equal(git('status', '--porcelain'), '', 'restored');
});
