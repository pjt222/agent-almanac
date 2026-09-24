/**
 * `check-i18n-fence-parity.js` answered a mistyped `--id` with `OK` and exit 0 (#634).
 *
 * Measured before the fix:
 *
 *   $ node scripts/check-i18n-fence-parity.js --id write-helm-chrat
 *   i18n fence parity: 0 fences in 0 translated skills
 *   OK: every gated code fence matches an English source revision.
 *   $ echo $?
 *   0
 *
 * "Every gated code fence matches" is true of the empty set, which is what makes this worse than
 * an ordinary typo: CLAUDE.md tells a contributor to run exactly this command on the one file
 * they just edited. Edit a fence, mistype the id, see OK, commit.
 *
 * The guard asks REACHED, not EXISTS. A real content id nobody has translated must refuse too —
 * `existsSync('skills/' + id)` would pass for it and still compare nothing, which is the
 * proxy-predicate mistake CLAUDE.md names. That case has its own test below, and it is the one
 * that separates this guard from the obvious wrong one.
 *
 * MUST-GO-RED, both measured against `npm run test:scripts` on a 529-test green baseline:
 *
 *   delete the `process.exit(2)` in `collectTargets`        exit 1, 4 failing — all four refusals
 *   neuter the `onlyId` arm of `validateScope`              exit 1, 3 failing — locale stays green
 *
 * The second number is the one worth having. It shows the four tests are not one test written
 * four ways: the locale arm and the id arm are covered separately, and a mutation to either is
 * visible on its own. Both kills are narrow — 4 and 3 of 529 — and neither prints a runtime
 * error, so neither is the crash-shaped false kill `mutation-verdict.js` exists to flag.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve, dirname } from 'path';
import { execFileSync, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

import { validateScope } from '../lib/i18n-targets.js';
import { collectSpecs } from '../lib/english-history.js';
import { rmTree } from './_tmp.js';

const CHECKER = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'check-i18n-fence-parity.js');

const doc = (title) => `# ${title}\n\n\`\`\`yaml\na: 1\n\`\`\`\n`;

/**
 * A fixture whose translation coverage is deliberately RAGGED, because every interesting case
 * here is about a scope that is individually valid and jointly empty.
 *
 *   alpha  translated into de       gamma  English only — real id, zero mirrors
 *   beta   translated into ja
 */
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'aa-scope-'));
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
  git('init', '-q', '-b', 'main');
  git('config', 'user.email', 'test@example.com');
  git('config', 'user.name', 'test');

  for (const id of ['alpha', 'beta', 'gamma']) {
    mkdirSync(join(dir, 'skills', id), { recursive: true });
    writeFileSync(join(dir, 'skills', id, 'SKILL.md'), doc(id));
  }
  git('add', '-A');
  git('commit', '-qm', 'english');

  for (const [locale, id] of [['de', 'alpha'], ['ja', 'beta']]) {
    mkdirSync(join(dir, 'i18n', locale, 'skills', id), { recursive: true });
    writeFileSync(join(dir, 'i18n', locale, 'skills', id, 'SKILL.md'), doc(id));
  }
  return dir;
}

function run(dir, ...args) {
  return spawnSync(process.execPath, [CHECKER, '--root', dir, ...args], { encoding: 'utf8' });
}

function withFixture(body) {
  const dir = fixture();
  try {
    body(dir);
  } finally {
    rmTree(dir);
  }
}

test('a mistyped --id refuses, and says so in the exit code', () => {
  withFixture((dir) => {
    const r = run(dir, '--id', 'alhpa');
    // 2, not merely non-zero. 1 means "the thing I check is wrong"; asserting only `!== 0` would
    // be satisfied by a findings-exit-1, so this test would stay green with the guard deleted on
    // any fixture that happens to carry a violation.
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stderr, /--id 'alhpa' matched no translated content/);
    assert.doesNotMatch(r.stdout, /OK: every gated code fence matches/);
  });
});

test('a mistyped --locale refuses too — the gate validated neither before', () => {
  withFixture((dir) => {
    const r = run(dir, '--locale', 'ed');
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stderr, /--locale 'ed' matched no translated content/);
  });
});

test('a --locale/--id pair that is individually valid but JOINTLY empty refuses', () => {
  // `beta` is translated, and `de` has translations — but not of `beta`. Both flags name
  // something real, so any guard checking them separately passes and compares nothing.
  withFixture((dir) => {
    assert.equal(run(dir, '--id', 'beta').status, 0, 'beta alone is reachable');
    assert.equal(run(dir, '--locale', 'de').status, 0, 'de alone is reachable');

    const r = run(dir, '--locale', 'de', '--id', 'beta');
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stderr, /--id 'beta' matched no translated content in locale 'de'/);
  });
});

test('REACHED, not EXISTS: a real id with zero mirrors refuses', () => {
  // THE CASE THAT SEPARATES THIS GUARD FROM THE WRONG ONE. `gamma` is a genuine English source in
  // the fixture, so `existsSync('skills/gamma/SKILL.md')` is true — and there is nothing to
  // compare it against. A guard built on existence passes here and reports a clean zero.
  withFixture((dir) => {
    const r = run(dir, '--id', 'gamma');
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stderr, /--id 'gamma' matched no translated content/);
  });
});

test('a scope that DOES reach something still runs — the non-vacuity control', () => {
  // Without this, every assertion above is satisfied by a gate that refuses everything.
  withFixture((dir) => {
    const r = run(dir, '--locale', 'de', '--id', 'alpha', '--json');
    assert.equal(r.status, 0, r.stderr);
    const report = JSON.parse(r.stdout);
    assert.equal(report.filesCompared, 1, 'the scoped file must actually have been compared');
    assert.equal(report.violations, 0);
  });
});

// ── the arm itself, not through a subprocess ────────────────────────────────

test('validateScope refuses a caller that passes --id with no accept-list', () => {
  // Dead from both CLIs today — the gate always passes `idsReached`, the backfill never passes
  // `onlyId` — and an adversarial review pointed out that a mutation deleting this branch
  // survives the whole suite. That is the shape the branch exists to prevent, so it gets the
  // test rather than the benefit of the doubt.
  //
  // The default matters more than the branch. `idsReached = null` defaulting to an empty Set
  // refuses every id forever; defaulting to "assume reached" passes every id forever. Both are
  // silent. Saying "this is a caller bug" is the only answer that is neither.
  const errors = validateScope({
    onlyLocale: null, onlyTrees: null, onlyId: 'anything',
    localesReached: new Set(['de']), treesReached: new Set(['skills']),
  });
  assert.equal(errors.length, 2);
  assert.match(errors[0], /caller bug/);
});

test('validateScope reports the OUTERMOST failing scope, not every one', () => {
  // A run with a mistyped locale AND a mistyped id should say the locale, because the id's
  // accept-list is derived from the locale scoping and would be empty for a reason the reader
  // has not been told yet. Cascading both reads as two independent faults.
  const errors = validateScope({
    onlyLocale: 'ed', onlyTrees: null, onlyId: 'alhpa',
    localesReached: new Set(['de']), treesReached: new Set(['skills']), idsReached: new Set(),
  });
  assert.match(errors[0], /--locale 'ed'/);
  assert.ok(!errors.some((line) => /--id/.test(line)), errors.join('\n'));
});

test('a reachable id produces no errors — the arm can stay silent', () => {
  assert.deepEqual(validateScope({
    onlyLocale: 'de', onlyTrees: null, onlyId: 'alpha',
    localesReached: new Set(['de']), treesReached: new Set(['skills']),
    idsReached: new Set(['alpha', 'beta']),
  }), []);
});

// ── #635: the scoped run must consult the same POOL, not just the same files ─

test('a STALE but valid mirror stays clean under a scoped history walk', () => {
  // THE ONE FAILURE SCOPING CAN INTRODUCE, and the reason a clean-file equivalence check proves
  // nothing. Staleness immunity is "the body matches SOME English revision", so a pool truncated
  // to HEAD turns a legitimately stale mirror into a violation — a false accusation against a
  // translation nobody touched, which is the confound this gate was built to avoid.
  //
  // English here has two revisions; the mirror carries the OLDER body. Under the corpus-wide
  // walk that is clean. It must stay clean when `--id` narrows the `git log` pathspec, and it
  // would not if the narrowed walk fed only the working tree.
  const dir = mkdtempSync(join(tmpdir(), 'aa-stale-'));
  try {
    const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'test@example.com');
    git('config', 'user.name', 'test');

    mkdirSync(join(dir, 'skills', 'alpha'), { recursive: true });
    const withBody = (body) => `# alpha\n\n\`\`\`yaml\n${body}\n\`\`\`\n`;

    writeFileSync(join(dir, 'skills', 'alpha', 'SKILL.md'), withBody('a: 1'));
    git('add', '-A'); git('commit', '-qm', 'english v1');

    writeFileSync(join(dir, 'skills', 'alpha', 'SKILL.md'), withBody('a: 2'));
    git('add', '-A'); git('commit', '-qm', 'english v2');

    // The mirror is on v1 — stale, and legitimately so.
    mkdirSync(join(dir, 'i18n', 'de', 'skills', 'alpha'), { recursive: true });
    writeFileSync(join(dir, 'i18n', 'de', 'skills', 'alpha', 'SKILL.md'), withBody('a: 1'));

    const scoped = run(dir, '--id', 'alpha', '--json');
    assert.equal(scoped.status, 0, scoped.stdout + scoped.stderr);
    const report = JSON.parse(scoped.stdout);
    assert.equal(report.filesCompared, 1, 'the fixture must actually have been compared');
    assert.equal(report.violations, 0, 'a body from an OLDER revision is a legal basis');

    // Non-vacuity: the same fixture with a body English never carried IS a violation, so the
    // assertion above is not passing because the gate has stopped looking.
    writeFileSync(join(dir, 'i18n', 'de', 'skills', 'alpha', 'SKILL.md'), withBody('a: 99'));
    const invented = JSON.parse(run(dir, '--id', 'alpha', '--json').stdout);
    assert.equal(invented.violations, 1, 'an invented body must still be caught');
  } finally {
    rmTree(dir);
  }
});

test('the scoped and unscoped runs agree on the same id', () => {
  // Equivalence at the report level, on a fixture carrying a real finding in a file the scoped
  // run must NOT look at — so an over-wide scope is caught as well as an over-narrow one.
  const dir = mkdtempSync(join(tmpdir(), 'aa-equiv-'));
  try {
    const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'test@example.com');
    git('config', 'user.name', 'test');

    for (const id of ['alpha', 'beta']) {
      mkdirSync(join(dir, 'skills', id), { recursive: true });
      writeFileSync(join(dir, 'skills', id, 'SKILL.md'), doc(id));
    }
    git('add', '-A'); git('commit', '-qm', 'english');

    // Both mirrors invent a body, so the unscoped run finds two violations.
    for (const id of ['alpha', 'beta']) {
      mkdirSync(join(dir, 'i18n', 'de', 'skills', id), { recursive: true });
      writeFileSync(join(dir, 'i18n', 'de', 'skills', id, 'SKILL.md'),
        doc(id).replace('a: 1', 'a: 999'));
    }

    const all = JSON.parse(run(dir, '--json').stdout);
    assert.equal(all.violations, 2, 'the fixture carries a finding in each');

    const one = JSON.parse(run(dir, '--id', 'alpha', '--json').stdout);
    assert.equal(one.filesCompared, 1, 'exactly the scoped file');
    assert.equal(one.violations, 1, 'and exactly its finding');
    assert.deepEqual(one.findings, all.findings.filter((f) => /\/alpha\//.test(f.file)),
      'the scoped findings must be the unscoped ones for that id, unchanged');
  } finally {
    rmTree(dir);
  }
});

test('a body from the PRE-FLATTEN era is still a legal basis under --id', () => {
  // #682, found by adversarial review and confirmed on the corpus: 863 pre-flatten path
  // occurrences exist in this repository's history, and `contentKey` maps
  // `skills/<domain>/<id>/SKILL.md` onto today's `skills/<id>` deliberately. A tree-level
  // pathspec matches both shapes; a file-level one naming only the current path does not, so
  // scoping dropped that whole era from the pool.
  //
  // The failure is in the STRICT direction, which is why no existing test could see it: a mirror
  // stale to the pre-flatten era is clean corpus-wide and a VIOLATION under `--id`. That is a
  // false accusation against a translation nobody touched, produced by the command CLAUDE.md
  // tells a contributor to run on the file they just edited.
  //
  // MUST-GO-RED: drop the `skills/*/<id>/SKILL.md` alias from `historicalPathspecs` and this
  // test reports `violations: 1`.
  const dir = mkdtempSync(join(tmpdir(), 'aa-flatten-'));
  try {
    const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'test@example.com');
    git('config', 'user.name', 'test');
    const withBody = (body) => `# foo\n\n\`\`\`yaml\n${body}\n\`\`\`\n`;

    // The pre-flatten layout: skills/<domain>/<id>/SKILL.md.
    mkdirSync(join(dir, 'skills', 'dom', 'foo'), { recursive: true });
    writeFileSync(join(dir, 'skills', 'dom', 'foo', 'SKILL.md'), withBody('a: 1'));
    git('add', '-A'); git('commit', '-qm', 'pre-flatten v1');

    writeFileSync(join(dir, 'skills', 'dom', 'foo', 'SKILL.md'), withBody('a: 2'));
    git('add', '-A'); git('commit', '-qm', 'pre-flatten v2');

    git('mv', join('skills', 'dom', 'foo'), join('skills', 'foo'));
    git('commit', '-qm', 'flatten');

    // The mirror is stale to the pre-flatten era — its body exists ONLY under the old path.
    mkdirSync(join(dir, 'i18n', 'de', 'skills', 'foo'), { recursive: true });
    writeFileSync(join(dir, 'i18n', 'de', 'skills', 'foo', 'SKILL.md'), withBody('a: 1'));

    const unscoped = JSON.parse(run(dir, '--json').stdout);
    assert.equal(unscoped.violations, 0, 'the corpus-wide walk sees the pre-flatten revision');

    const scoped = JSON.parse(run(dir, '--id', 'foo', '--json').stdout);
    assert.equal(scoped.filesCompared, 1, 'the fixture must actually have been compared');
    assert.equal(scoped.violations, 0, 'and the scoped walk must see it too');

    // Non-vacuity: a body that existed under NEITHER layout is still caught.
    writeFileSync(join(dir, 'i18n', 'de', 'skills', 'foo', 'SKILL.md'), withBody('a: 99'));
    assert.equal(JSON.parse(run(dir, '--id', 'foo', '--json').stdout).violations, 1,
      'an invented body must still be a violation');
  } finally {
    rmTree(dir);
  }
});

test('a revision on a MERGE-SIMPLIFIED side branch is still a legal basis under --id', () => {
  // #682, divergence 2. `git log -- <file>` does not list every commit touching that file: with
  // default simplification a merge parent TREESAME *for the pathspec* is pruned, and one file is
  // TREESAME far more often than four trees. A side branch that edits a fence and then reverts
  // it, while changing anything else, is invisible to the file pathspec and visible to the tree
  // pathspec. Measured on this exact shape before the fix: pool `{a=1}` vs `{a=1, a=2}`.
  //
  // MUST-GO-RED: drop `--full-history` from `collectSpecs` and this reports `violations: 1`.
  const dir = mkdtempSync(join(tmpdir(), 'aa-merge-'));
  try {
    const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'test@example.com');
    git('config', 'user.name', 'test');
    const write = (id, body) => {
      mkdirSync(join(dir, 'skills', id), { recursive: true });
      writeFileSync(join(dir, 'skills', id, 'SKILL.md'), `# ${id}\n\n\`\`\`yaml\n${body}\n\`\`\`\n`);
    };

    write('foo', 'a: 1'); write('bar', 'b: 0');
    git('add', '-A'); git('commit', '-qm', 'base');

    git('checkout', '-q', '-b', 'side');
    write('foo', 'a: 2');
    git('add', '-A'); git('commit', '-qm', 'foo v2 on side');
    // The branch must net-change something OTHER than foo, or foo is not TREESAME-pruned; and
    // the merge must be --no-ff, since a fast-forward keeps history linear and hides the class.
    write('foo', 'a: 1'); write('bar', 'b: 1');
    git('add', '-A'); git('commit', '-qm', 'revert foo, change bar');

    git('checkout', '-q', 'main');
    git('merge', '-q', '--no-ff', 'side', '-m', 'merge');

    // The mirror carries the body that existed only on the pruned side branch.
    //
    // Written through the same template-literal helper as everything else here. The first
    // version built this string with `'…\\`\\`\\`yaml…'.replace(/\\`/g, '`')`, which is a NO-OP:
    // inside single quotes a backslash-backtick is a useless escape that already yields a plain
    // backtick, so the regex matched nothing. The bytes were right and the reasoning was not,
    // which is the kind of fixture that later gets trusted for the wrong reason.
    const mirror = join(dir, 'i18n', 'de', 'skills', 'foo', 'SKILL.md');
    mkdirSync(join(dir, 'i18n', 'de', 'skills', 'foo'), { recursive: true });
    writeFileSync(mirror, `# foo\n\n\`\`\`yaml\na: 2\n\`\`\`\n`);

    assert.equal(JSON.parse(run(dir, '--json').stdout).violations, 0,
      'the corpus-wide walk sees the side-branch revision');

    const scoped = JSON.parse(run(dir, '--id', 'foo', '--json').stdout);
    assert.equal(scoped.filesCompared, 1, 'the fixture must actually have been compared');
    assert.equal(scoped.violations, 0, 'and the scoped walk must see it too');

    // Non-vacuity, matching the sibling fixtures: a body that existed on NO branch is caught.
    // Without it this test's green rests on `filesCompared` plus the other tests proving the
    // gate can find anything at all, which is a dependency between tests rather than a control.
    writeFileSync(mirror, `# foo\n\n\`\`\`yaml\na: 99\n\`\`\`\n`);
    assert.equal(JSON.parse(run(dir, '--id', 'foo', '--json').stdout).violations, 1,
      'an invented body must still be a violation');
  } finally {
    rmTree(dir);
  }
});

test('collectSpecs refuses an empty paths list rather than picking a meaning', () => {
  // `[]` is not "no scope". Left alone it split the walk two ways at once: `[] ?? CONTENT_TYPES`
  // keeps `[]`, so `git log` ran UNPATHED and pooled all content history, while the working-tree
  // feed iterated zero paths and fed nothing. Unreachable from the gate — its empty-scope
  // backstop guarantees at least one target — and a mutation deleting the throw therefore
  // survived the whole suite, which is the same "dead branch, benefit of the doubt" this file
  // already refuses for `validateScope`.
  assert.throws(() => collectSpecs(process.cwd(), []), /paths is empty/);
});
