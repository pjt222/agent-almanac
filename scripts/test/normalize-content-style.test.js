/**
 * Behavioural tests for `scripts/normalize-content-style.js` (#490).
 *
 * The property under test is that the tool PREVIEWS unless asked to write. #486 inverted
 * the same default in the i18n normalizer after a read-only probe agent typed the bare
 * command and silently rewrote 281 files; this file's blast radius is larger, since
 * `--scope all` is the whole corpus and the default scope is still every English content
 * file.
 *
 * That property is trivial to assert vacuously: a run over a corpus with nothing to repair
 * also writes nothing, and such a test stays green even if `--write` were the default
 * again. So every "writes nothing" case here is paired with a `--write` case proving the
 * SAME fixture does get rewritten. The difference between the two is the whole gate.
 *
 * Each test builds a throwaway git repo holding the script and one content file. Nothing
 * touches the working repository — a test that dirties the real tree makes ambient state
 * decide the result (#453).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { rmTree } from './_tmp.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = 'scripts/normalize-content-style.js';

/** A decorative separator: a separator row carrying four or more dashes. */
const DECORATIVE = '| Col A | Col B |\n|-------|:------|\n| x | y |\n';
/** What the normalizer must produce — three dashes per column, alignment colon kept. */
const COMPACTED = '| Col A | Col B |\n|---|:---|\n| x | y |\n';

/**
 * The header of `normalize-content-style.js` states the fence-state machine as its
 * correctness claim — "the SAME fence-state machine so 4-backtick examples that wrap
 * 3-backtick fences are never corrupted". A guarantee asserted in a comment is a test case
 * nobody ran, so this fixture is the corpus shape that claim is about: a 4-backtick
 * ````markdown block wrapping a 3-backtick fence, with decorative separators both inside
 * and outside. `skills/write-incident-runbook/references/EXAMPLES.md` is exactly this, and
 * it is in scope (`isContentFile` accepts any `.md` under `skills/`).
 *
 * Only the outside separator may change.
 */
const NESTED = [
  '| Outside A | Outside B |',
  '|-----------|:----------|',
  '| x | y |',
  '',
  '````markdown',
  '| Inside A | Inside B |',
  '|----------|:---------|',
  '| p | q |',
  '',
  '```bash',
  'echo "still inside"',
  '```',
  '````',
  '',
].join('\n');

const NESTED_EXPECTED = NESTED.replace('|-----------|:----------|', '|---|:---|');

function git(cwd, args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${r.stderr}`);
  return r.stdout;
}

/** A throwaway repo containing the script and one committed content file. */
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'norm-content-'));
  mkdirSync(join(dir, 'scripts'), { recursive: true });
  mkdirSync(join(dir, 'agents'), { recursive: true });
  cpSync(join(REPO, SCRIPT), join(dir, SCRIPT));
  // `scripts/lib/` too, since #672 routed this script's template exclusion through
  // `lib/content-paths.js`. Copying the script ALONE worked only while it imported nothing
  // local — and that isolation is part of how the duplicated predicate stayed invisible: the
  // file's own comment said "Predicates copied verbatim from check-content-style.js" and no
  // fixture could have noticed. A missing dependency here surfaces as ERR_MODULE_NOT_FOUND
  // inside the child, which the exit-code assertions report as a plain `1 !== 0`.
  cpSync(join(REPO, 'scripts', 'lib'), join(dir, 'scripts', 'lib'), { recursive: true });
  writeFileSync(join(dir, 'agents', 'sample.md'), DECORATIVE);
  git(dir, ['init', '-q']);
  git(dir, ['config', 'user.email', 'test@example.com']);
  git(dir, ['config', 'user.name', 'test']);
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-qm', 'fixture']);
  return dir;
}

function run(dir, args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { cwd: dir, encoding: 'utf8' });
}

function body(dir) {
  return readFileSync(join(dir, 'agents', 'sample.md'), 'utf8');
}

function withFixture(fn) {
  const dir = fixture();
  try {
    fn(dir);
  } finally {
    rmTree(dir);
  }
}

// --- the gate itself: preview by default, write only when asked -----------------------

test('the bare command does not write', () => {
  withFixture((dir) => {
    const r = run(dir, []);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(body(dir), DECORATIVE, 'the bare command rewrote the file');
    assert.match(r.stdout, /PREVIEW/);
    // Not vacuous: the run DID find the change, it just declined to apply it.
    assert.match(r.stdout, /separators compacted: 1/);
    assert.match(r.stdout, /files to change: 1/);
  });
});

test('--write applies the same change the bare command only reported', () => {
  withFixture((dir) => {
    const r = run(dir, ['--write']);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(body(dir), COMPACTED);
    assert.match(r.stdout, /files written: 1/);
  });
});

test('--dry is an explicit no-op, not a write', () => {
  withFixture((dir) => {
    const r = run(dir, ['--dry']);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(body(dir), DECORATIVE);
  });
});

test('--write and --dry together are refused rather than guessed', () => {
  withFixture((dir) => {
    const r = run(dir, ['--write', '--dry']);
    assert.equal(r.status, 2);
    assert.equal(body(dir), DECORATIVE);
  });
});

// --- refuses to write into a dirty scope ----------------------------------------------

test('--write refuses when the scope is dirty, and preview still works', () => {
  withFixture((dir) => {
    writeFileSync(join(dir, 'agents', 'sample.md'), `${DECORATIVE}\nuncommitted\n`);
    const dirty = body(dir);

    const w = run(dir, ['--write']);
    assert.equal(w.status, 2, 'wrote into a dirty scope');
    assert.match(w.stderr, /dirty scope/);
    assert.equal(body(dir), dirty, 'the refused run still modified the file');

    // The guard must not over-block: previewing a dirty scope is safe and must succeed.
    const p = run(dir, []);
    assert.equal(p.status, 0, p.stderr);
    assert.equal(body(dir), dirty);
  });
});

test('--write refuses a path git reports clean only because of an index flag', () => {
  withFixture((dir) => {
    // skip-worktree makes git report a file clean no matter how far it has diverged, so
    // the status check alone would pass while the write destroyed real content. This is
    // the one flag that disarms every later check, which is why mutation-check and
    // repo-guard both test for it.
    git(dir, ['update-index', '--skip-worktree', 'agents/sample.md']);
    writeFileSync(join(dir, 'agents', 'sample.md'), `${DECORATIVE}\nreal work git cannot see\n`);
    assert.equal(git(dir, ['status', '--porcelain']).trim(), '', 'precondition: git reports clean');

    const r = run(dir, ['--write']);
    assert.equal(r.status, 2, 'wrote into a scope git could not truthfully report on');
    assert.match(r.stderr, /index flag/);
    assert.match(body(dir), /real work git cannot see/);
  });
});

test('--write refuses a git-ignored path, where there is no undo at all', () => {
  withFixture((dir) => {
    // The refusal message and the guard's comment both promise `git checkout --` as the
    // undo. For an ignored file git holds no copy, so that promise is false exactly where
    // it matters most — and `git status --porcelain` omits ignored paths by design, so
    // the guard is structurally blind to the one unrecoverable class.
    writeFileSync(join(dir, '.gitignore'), 'scratch/\n');
    mkdirSync(join(dir, 'scratch'), { recursive: true });
    writeFileSync(join(dir, 'scratch', 'note.md'), DECORATIVE);
    git(dir, ['add', '-A']);
    git(dir, ['commit', '-qm', 'add gitignore']);

    const r = run(dir, ['--files', 'scratch/note.md', '--write']);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /git-ignored path/);
    assert.equal(readFileSync(join(dir, 'scratch', 'note.md'), 'utf8'), DECORATIVE);
  });
});

test('an untracked file in scope gets stash advice that actually works', () => {
  withFixture((dir) => {
    // Plain `git stash` leaves `??` entries behind, so the stock advice hands back a tree
    // this guard still refuses. The sibling tool already fixed this wording.
    writeFileSync(join(dir, 'agents', 'extra.md'), DECORATIVE);

    const r = run(dir, ['--write']);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /git stash -u/);
    assert.match(r.stderr, /leaves the `\?\?` entries behind/);
  });
});

// --- default-deny on flags and values -------------------------------------------------

test('an unknown flag is refused rather than ignored', () => {
  withFixture((dir) => {
    const r = run(dir, ['--wrote']);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /unknown flag --wrote/);
    assert.equal(body(dir), DECORATIVE);
  });
});

test('--mode and --scope reject values outside their sets', () => {
  withFixture((dir) => {
    assert.equal(run(dir, ['--mode', 'sideways']).status, 2);
    assert.equal(run(dir, ['--scope', 'everything']).status, 2);
    assert.equal(run(dir, ['--files']).status, 2);
  });
});

test('--files stops at the next flag instead of eating its value', () => {
  withFixture((dir) => {
    // `--files a.md --mode both` previously kept 'both' as a filename, because the parse
    // filtered out only `--`-prefixed args. The scanned count is what proves it.
    const r = run(dir, ['--files', 'agents/sample.md', '--mode', 'both']);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /of 1 scanned/);
  });
});

test('a path after a later flag is refused, not silently dropped', () => {
  withFixture((dir) => {
    // The first fix for the parse above introduced its own silent narrowing: stopping at
    // the first flag discarded `b.md` without a word, and `--write` still applied because
    // it was found by scanning the whole argv.
    const r = run(dir, ['--files', 'agents/sample.md', '--write', 'agents/other.md']);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /unexpected argument 'agents\/other\.md'/);
  });
});

test('a flag after --files is still validated', () => {
  withFixture((dir) => {
    const r = run(dir, ['--files', 'agents/sample.md', '--wrote']);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /unknown flag --wrote/);
  });
});

test('a trailing value flag is refused, not defaulted', () => {
  withFixture((dir) => {
    // `--write --mode` read argv[i+1] as undefined, and `undefined || "both"` passed the
    // enum check — so a caller who narrowed the run to one transform got both, WITH
    // --write. Wider than asked, in the destructive direction.
    for (const args of [['--write', '--mode'], ['--write', '--scope'], ['--mode']]) {
      const r = run(dir, args);
      assert.equal(r.status, 2, `${args.join(' ')} was accepted`);
      assert.match(r.stderr, /requires a value/);
      assert.equal(body(dir), DECORATIVE, 'the refused run still wrote');
    }
  });
});

// --- the fence-state machine, which is the file's stated correctness claim -------------

test('separators inside a fence are left alone while the one outside is compacted', () => {
  withFixture((dir) => {
    writeFileSync(join(dir, 'agents', 'sample.md'), NESTED);
    git(dir, ['add', '-A']);
    git(dir, ['commit', '-qm', 'nested fixture']);

    const r = run(dir, ['--write', '--mode', 'separators']);
    assert.equal(r.status, 0, r.stderr);
    // Not vacuous: the run must have changed exactly the one outside the fence.
    assert.match(r.stdout, /separators compacted: 1/);
    assert.equal(body(dir), NESTED_EXPECTED);
    assert.ok(body(dir).includes('|----------|:---------|'), 'the in-fence separator was rewritten');
  });
});

test('--mode fences tags an untagged opening fence and is not a no-op', () => {
  withFixture((dir) => {
    // Two blocks, because the tag heuristic infers exactly one language. A `text`-only
    // fixture would keep passing if guessLanguage were replaced by `return "text"`.
    writeFileSync(
      join(dir, 'agents', 'sample.md'),
      // The JSON block is deliberately MULTI-LINE. A single-line `{"a": 1}` is caught by
      // the JSON-Lines branch as well as the whole-block branch, so deleting either left
      // the other to produce the same tag and the mutant survived.
      'Prose.\n\n```\necho "hello"\n```\n\nData.\n\n```\n{\n  "a": 1\n}\n```\n',
    );
    git(dir, ['add', '-A']);
    git(dir, ['commit', '-qm', 'untagged fence fixture']);

    const r = run(dir, ['--write', '--mode', 'fences']);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /fences tagged:\s+2/);
    const after = body(dir);
    assert.match(after, /```text/, 'a prose block should fall back to text');
    assert.match(after, /```json/, 'a block that parses as JSON should be tagged json');
    // Only OPENING fences are tagged; the two closing ``` lines stay bare, which is why
    // "no bare fence remains" would be the wrong assertion here.
  });
});

test('CRLF files keep their line endings', () => {
  withFixture((dir) => {
    writeFileSync(join(dir, 'agents', 'sample.md'), DECORATIVE.replace(/\n/g, '\r\n'));
    git(dir, ['add', '-A']);
    git(dir, ['commit', '-qm', 'crlf fixture']);

    const r = run(dir, ['--write']);
    assert.equal(r.status, 0, r.stderr);
    const after = body(dir);
    assert.equal(after, COMPACTED.replace(/\n/g, '\r\n'), 'EOL style was not preserved');
  });
});
