/**
 * Pins the two i18n scaffolders — `scripts/translate-content.sh` (`npm run translate:scaffold`)
 * and `scripts/bulk-scaffold-caveman.sh` — on the three defects of #617, #770 and #475.
 *
 *   - #617: both stamp `source_commit` and `fence_basis_commit` with HEAD while copying the
 *     WORKING TREE's English bytes. From a source with uncommitted edits that makes both claims
 *     false at birth, so a dirty source is refused and nothing is written for it.
 *   - #770 (slice A): the bulk scaffolder stamped `translator: "Julius Brussee homage — caveman"`
 *     on a byte copy, claiming a compression that never happened. It must stamp the scaffold
 *     literal, and that literal is READ from `translate-content.sh` through the same reader
 *     `tools/translator-stamp.mjs` and `tools/refresh-untranslated-stubs.mjs` use, so the two
 *     scaffolders cannot drift apart without a red test here.
 *   - #475: a column-0 `name:` inside a ```yaml fence was taken for frontmatter and the
 *     provenance block was spliced into the example a reader copies. The root fix (scoping the
 *     awk rule to the frontmatter, `1be883635`) had already landed, so that arm is green at
 *     base and is proven by a revert mutant instead. What #475 also asked for, and this adds, is
 *     a guard: each scaffolder runs `check-i18n-fence-parity.js --locale <L> --id <ID>` on the
 *     target it just wrote and refuses — non-zero, naming the target, removing it — when the
 *     check does not pass. The guard is exercised by injecting a fence corruption into the
 *     FIXTURE's copy of each scaffolder, which is the only way to make a scaffold diverge: a
 *     faithful scaffold of committed English matches English by construction.
 *
 * Each fixture is a throwaway git repository holding copies of both scaffolders, the parity
 * checker and `scripts/lib`, copied from this checkout at test time — so a `mutation-check`
 * edit to a real scaffolder, or to the checker, reaches the fixture.
 *
 * Symlinks are a subject here, not a hazard to route around (#976 round 1). Node resolves a
 * symlinked main module to its real path, and the checker's run-as-main guard compared that
 * against `argv[1]` as a path string, so through a symlinked repository path — or a symlinked
 * checker file — the "check" exited 0 having run nothing, and both guards passed everything.
 * The checker's guard now realpaths both sides. `fixture()` still realpaths its own directory,
 * so every arm that does not say otherwise runs on a physical path; the symlink arms below build
 * the link themselves and never realpath it.
 *
 * #617 is tested as the property AC1 states, not as `git status` output: a scaffold that exists
 * must carry a body HEAD carries for its source (`assertCarriedByHead`). The arms that hide a
 * source from `git status` — an ignore rule, a skip-worktree flag, `status.showUntrackedFiles=no`
 * — are the ones where the two come apart.
 *
 * Git isolation: the scaffolders run their own `git`, so they are spawned with `cleanEnv`, which
 * drops every `GIT_*` variable and moves `HOME` and `XDG_CONFIG_HOME` into the fixture (a
 * self-test's `cwd` is not isolation — `_git-fixture.js` says why).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { rmTree } from './_tmp.js';
import { cleanEnv, initRepo } from './_git-fixture.js';
import { SCAFFOLDER, stubValueFromScaffolder } from '../../tools/translator-stamp.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BULK = join(REPO, 'scripts', 'bulk-scaffold-caveman.sh');

/** The six compressed-prose locales the bulk scaffolder writes, as a literal (the oracle is not the list under test). */
const TIERS = ['caveman-lite', 'caveman', 'caveman-ultra', 'wenyan-lite', 'wenyan', 'wenyan-ultra'];

/** Copied into every fixture: the subjects, and the checker their guard runs, with its imports. */
const COPIED = ['translate-content.sh', 'bulk-scaffold-caveman.sh', 'check-i18n-fence-parity.js'];

/**
 * An English skill whose body carries the #475 shape: a column-0 `name:` inside a ```yaml fence,
 * which an unscoped `/^name:/` rule takes for the frontmatter's `name:`.
 */
function englishSkill(id) {
  return [
    '---', `name: ${id}`, 'description: A fixture skill.', 'metadata:', '  author: Test', '  version: "1.0"', '---',
    '', `# ${id}`, '', '```yaml', '# .github/workflows/build.yml', 'name: Build and Push Docker Image', '',
    'on:', '  push:', '```', '',
  ].join('\n');
}

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n/;

function split(text) {
  const m = FRONTMATTER.exec(text);
  assert.ok(m, 'the file opens with a frontmatter block');
  return { fm: m[1], body: text.slice(m[0].length) };
}

function put(root, rel, text) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text, 'utf8');
  return path;
}

/** A fixture repository with the given English skills committed. */
function fixture(t, ids) {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), 'scaffolders-')));
  t.after(() => rmTree(dir));
  mkdirSync(join(dir, 'scripts'), { recursive: true });
  for (const name of COPIED) cpSync(join(REPO, 'scripts', name), join(dir, 'scripts', name));
  cpSync(join(REPO, 'scripts', 'lib'), join(dir, 'scripts', 'lib'), { recursive: true });
  // The checker and its lib are ES modules in `.js` files; this repo's package.json says so.
  writeFileSync(join(dir, 'package.json'), '{ "type": "module" }\n');
  for (const id of ids) put(dir, `skills/${id}/SKILL.md`, englishSkill(id));
  const git = initRepo(dir);
  // The fixture must be its own repository, or the scaffolders' `git` would answer about another.
  assert.equal(git('rev-parse', '--show-toplevel').trim(), dir);
  return dir;
}

/**
 * Run one of the fixture's scaffolders, isolated from the caller's git environment. `via` is the
 * path the script is invoked through (default: the fixture itself); `env` is merged last.
 */
function run(dir, script, args = [], { via = dir, env = {} } = {}) {
  const r = spawnSync('bash', [join(via, 'scripts', script), ...args], {
    cwd: via, encoding: 'utf8', env: cleanEnv(dir, env),
  });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
}

/** Run git in the fixture, isolated, insisting it succeeds; returns stdout. */
function gitIn(dir, ...args) {
  const r = spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', env: cleanEnv(dir) });
  assert.equal(r.status, 0, `git ${args.join(' ')} failed in ${dir}: ${r.stderr}`);
  return r.stdout;
}

/**
 * #617 AC1 as an oracle: if `targetRel` was written, the body after its frontmatter must be the
 * body HEAD carries for `sourceRel` — the bytes its `source_commit` and `fence_basis_commit`
 * vouch for. Absent is fine here (a refusal); the arm asserts the refusal separately. Read with
 * `cat-file blob`, not the `git show` the scaffolders use, so the oracle is not the subject.
 */
function assertCarriedByHead(dir, targetRel, sourceRel) {
  if (!existsSync(join(dir, targetRel))) return;
  const head = spawnSync('git', ['-C', dir, 'cat-file', 'blob', `HEAD:${sourceRel}`], { encoding: 'utf8', env: cleanEnv(dir) });
  assert.equal(head.status, 0, `${targetRel} was written and stamped with HEAD, yet HEAD carries no ${sourceRel}`);
  assert.equal(split(readFileSync(join(dir, targetRel), 'utf8')).body, split(head.stdout).body,
    `${targetRel} was written and stamped with HEAD, yet its body is not the one HEAD carries for ${sourceRel}`);
}

/**
 * A symlink to the fixture, in a directory of its own. The returned path is deliberately NOT
 * realpathed: reaching the repository through it is the shape under test.
 */
function linkTo(t, dir) {
  const container = mkdtempSync(join(tmpdir(), 'scaffolders-link-'));
  t.after(() => rmTree(container));
  const link = join(container, 'repo');
  symlinkSync(dir, link, 'dir');
  assert.notEqual(realpathSync(link), link, 'precondition: this path reaches the fixture through a symlink');
  return link;
}

/**
 * A PATH entry whose `git` fails every call that asks about a commit's copy of a path
 * (`HEAD:<path>`) or the worktree's status, and passes everything else to the real git. That is
 * exactly the scaffolders' source check — the byte test, and the `git status` predicate it
 * replaced, so the arm reads the same against either — and never the parity checker, whose git
 * calls are `log`, `rev-parse`, `ls-files`, `check-ignore` and `cat-file --batch` with its specs
 * on stdin. `git log -1` must keep working: both scaffolders read HEAD with it under `set -e`.
 */
function gitFailingSourceChecks(t) {
  const realGit = spawnSync('sh', ['-c', 'command -v git'], { encoding: 'utf8' }).stdout.trim();
  assert.ok(realGit.startsWith('/'), `a real git on PATH (got '${realGit}')`);
  const shimDir = mkdtempSync(join(tmpdir(), 'scaffolders-shim-'));
  t.after(() => rmTree(shimDir));
  writeFileSync(join(shimDir, 'git'), [
    '#!/bin/sh',
    'for a in "$@"; do',
    '  case "$a" in',
    '    HEAD:*|status) echo "fatal: test shim: git cannot answer ($*)" >&2; exit 128 ;;',
    '  esac',
    'done',
    `exec '${realGit}' "$@"`,
    '',
  ].join('\n'), { mode: 0o755 });
  return { PATH: `${shimDir}:${process.env.PATH}` };
}

/** Rewrite the fixture's copy of a scaffolder, insisting the needle occurs exactly once. */
function inject(dir, script, needle, replacement) {
  const path = join(dir, 'scripts', script);
  const text = readFileSync(path, 'utf8');
  assert.equal(text.split(needle).length - 1, 1, `${script} carries \`${needle}\` exactly once, so the injection is one edit`);
  writeFileSync(path, text.replace(needle, replacement));
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// --- #617: a dirty source is refused -------------------------------------------------------

test('translate-content.sh refuses an English source with uncommitted edits and writes nothing (#617)', (t) => {
  const dir = fixture(t, ['demo']);
  appendFileSync(join(dir, 'skills/demo/SKILL.md'), '\nA line HEAD does not carry.\n');
  const r = run(dir, 'translate-content.sh', ['skills', 'demo', 'de']);
  assert.equal(r.status, 1, `a dirty source must exit 1; output was:\n${r.out}`);
  assert.match(r.out, /REFUSED/);
  assert.match(r.out, /skills\/demo\/SKILL\.md/, 'the refusal names the source');
  assert.match(r.out, /uncommitted/);
  assert.equal(existsSync(join(dir, 'i18n/de/skills/demo/SKILL.md')), false, 'no scaffold is written from a dirty source');
  assert.equal(existsSync(join(dir, 'i18n/de/skills/demo')), false, 'not even its directory');
});

test('translate-content.sh refuses an untracked English source, which HEAD does not carry at all (#617)', (t) => {
  const dir = fixture(t, ['demo']);
  put(dir, 'skills/fresh/SKILL.md', englishSkill('fresh'));
  const r = run(dir, 'translate-content.sh', ['skills', 'fresh', 'de']);
  assert.equal(r.status, 1, `an untracked source must exit 1; output was:\n${r.out}`);
  assert.match(r.out, /skills\/fresh\/SKILL\.md/);
  assert.equal(existsSync(join(dir, 'i18n/de/skills/fresh/SKILL.md')), false);
});

test('translate-content.sh scaffolds a clean source: the control row for the refusals above', (t) => {
  const dir = fixture(t, ['demo']);
  const r = run(dir, 'translate-content.sh', ['skills', 'demo', 'de']);
  assert.equal(r.status, 0, `a clean source must scaffold; output was:\n${r.out}`);
  const target = join(dir, 'i18n/de/skills/demo/SKILL.md');
  assert.ok(existsSync(target), 'the scaffold exists');
  const english = readFileSync(join(dir, 'skills/demo/SKILL.md'), 'utf8');
  // The column-0 `name:` inside the fence is untouched: translate-content.sh inserts before the
  // frontmatter's closing delimiter, never after a `name:` line.
  assert.equal(split(readFileSync(target, 'utf8')).body, split(english).body, 'the body is a byte copy of English');
});

test('bulk-scaffold-caveman.sh refuses a dirty source per source, scaffolds the clean one, and exits non-zero (#617)', (t) => {
  const dir = fixture(t, ['alpha', 'beta']);
  appendFileSync(join(dir, 'skills/beta/SKILL.md'), '\nA line HEAD does not carry.\n');
  const r = run(dir, 'bulk-scaffold-caveman.sh');
  assert.notEqual(r.status, 0, `a run that refused a source must not exit 0; output was:\n${r.out}`);
  assert.match(r.out, /skills\/beta\/SKILL\.md/, 'the refusal names the dirty source');
  for (const tier of TIERS) {
    assert.ok(existsSync(join(dir, `i18n/${tier}/skills/alpha/SKILL.md`)), `${tier}/alpha (clean) is scaffolded`);
    assert.equal(existsSync(join(dir, `i18n/${tier}/skills/beta/SKILL.md`)), false, `${tier}/beta (dirty) is not`);
  }
});

test('bulk-scaffold-caveman.sh --dry-run predicts the refusal the real run would make (#617)', (t) => {
  const dir = fixture(t, ['alpha', 'beta']);
  appendFileSync(join(dir, 'skills/beta/SKILL.md'), '\nA line HEAD does not carry.\n');
  const r = run(dir, 'bulk-scaffold-caveman.sh', ['--dry-run']);
  assert.notEqual(r.status, 0, `the preview of a run that would refuse must not exit 0; output was:\n${r.out}`);
  assert.match(r.out, /WOULD REFUSE[^\n]*skills\/beta\/SKILL\.md/);
  assert.doesNotMatch(r.out, /WOULD CREATE[^\n]*\/beta\//, 'a dirty source is never offered as a creation');
  assert.equal(existsSync(join(dir, 'i18n')), false, 'a dry run writes nothing');
});

// --- #770 slice A: the bulk scaffolder stamps the scaffold literal ---------------------------

test('bulk-scaffold-caveman.sh carries the same translator literal translate-content.sh stamps (#770)', () => {
  // Read through the exported reader, the pattern of translator-stamp.test.js: the reader refuses
  // a scaffolder with no quoted literal, two different ones, or a shell expansion.
  assert.equal(stubValueFromScaffolder(BULK), stubValueFromScaffolder(SCAFFOLDER));
});

test('bulk-scaffold-caveman.sh WRITES that literal into every tier it scaffolds (#770)', (t) => {
  const dir = fixture(t, ['demo']);
  const r = run(dir, 'bulk-scaffold-caveman.sh');
  assert.equal(r.status, 0, `a clean bulk run must exit 0; output was:\n${r.out}`);
  const expected = stubValueFromScaffolder(SCAFFOLDER);
  for (const tier of TIERS) {
    const target = join(dir, `i18n/${tier}/skills/demo/SKILL.md`);
    assert.ok(existsSync(target), `${tier} target exists`);
    const values = [...split(readFileSync(target, 'utf8')).fm.matchAll(/^[ \t]*translator:[ \t]*(.*)$/gm)].map((m) => m[1].trim());
    assert.equal(values.length, 1, `${tier}: the frontmatter carries translator: exactly once`);
    assert.equal(values[0].replace(/^(["'])(.*)\1$/, '$2'), expected, `${tier}: a byte copy is stamped as an untranslated stub`);
  }
});

// --- #475: no injection into a fence, and the post-scaffold parity guard ---------------------

test('bulk-scaffold-caveman.sh leaves a column-0 `name:` inside a fence alone (#475; green since 1be883635)', (t) => {
  const dir = fixture(t, ['demo']);
  const r = run(dir, 'bulk-scaffold-caveman.sh');
  assert.equal(r.status, 0, `a clean bulk run must exit 0; output was:\n${r.out}`);
  const english = split(readFileSync(join(dir, 'skills/demo/SKILL.md'), 'utf8'));
  for (const tier of TIERS) {
    const target = join(dir, `i18n/${tier}/skills/demo/SKILL.md`);
    assert.ok(existsSync(target), `${tier} target exists`);
    const scaffold = split(readFileSync(target, 'utf8'));
    assert.equal(scaffold.body, english.body, `${tier}: the body, fence included, is a byte copy of English`);
    assert.equal((scaffold.fm.match(/^locale:/gm) || []).length, 1, `${tier}: one provenance block, in the frontmatter`);
  }
});

test('bulk-scaffold-caveman.sh refuses and removes a target the fence-parity check rejects (#475 guard)', (t) => {
  const dir = fixture(t, ['demo']);
  // Re-introduce the #475 defect in the FIXTURE's copy: the unscoped rule injects the provenance
  // block after the fenced `name:` as well, which is exactly what the guard exists to catch.
  inject(dir, 'bulk-scaffold-caveman.sh', 'in_fm && /^name:/', '/^name:/');
  const r = run(dir, 'bulk-scaffold-caveman.sh');
  assert.notEqual(r.status, 0, `a run whose scaffolds fail the parity check must not exit 0; output was:\n${r.out}`);
  for (const tier of TIERS) {
    const rel = `i18n/${tier}/skills/demo/SKILL.md`;
    // The checker's own FAIL line, so the refusal is for the corruption. The exit code cannot
    // say that by itself: 2 is a scope refusal, and 1 is a finding, a shallow-clone refusal or
    // an uncaught crash. All of them refuse; only the finding is this test's subject.
    assert.match(r.out, new RegExp(`FAIL ${escapeRe(rel)}:\\d+ \\[yaml\\]`), `the check reports ${rel}'s yaml fence`);
    assert.match(r.out, new RegExp(`REFUSED[^\\n]*${escapeRe(rel)}[^\\n]*exit 1`), `the refusal names ${rel}`);
    assert.equal(existsSync(join(dir, rel)), false, `${rel} is removed, so a re-run does not SKIP it as existing`);
    assert.equal(existsSync(join(dir, dirname(rel))), false, `and the leaf directory this run created for ${rel}`);
  }
});

test('bulk-scaffold-caveman.sh treats a parity check that could not measure (exit 2) as a refusal, not a pass', (t) => {
  const dir = fixture(t, ['demo']);
  // Point the fixture copy's check at an id nothing carries: the checker refuses the scope with
  // exit 2 ("matched no translated content"), the shape of a check that compared nothing.
  inject(dir, 'bulk-scaffold-caveman.sh', '--id "$skill"', '--id "$skill-absent"');
  const r = run(dir, 'bulk-scaffold-caveman.sh');
  assert.notEqual(r.status, 0, `a guard that cannot measure must not pass; output was:\n${r.out}`);
  for (const tier of TIERS) {
    const rel = `i18n/${tier}/skills/demo/SKILL.md`;
    assert.match(r.out, new RegExp(`REFUSED[^\\n]*${escapeRe(rel)}[^\\n]*exit 2`), `${rel} is refused on exit 2`);
    assert.equal(existsSync(join(dir, rel)), false, `${rel} is removed`);
  }
});

test('translate-content.sh treats a parity check that could not measure (exit 2) as a refusal, not a pass', (t) => {
  const dir = fixture(t, ['demo']);
  inject(dir, 'translate-content.sh', '--id "$ID"', '--id "$ID-absent"');
  const r = run(dir, 'translate-content.sh', ['skills', 'demo', 'de']);
  assert.equal(r.status, 1, `a guard that cannot measure must not pass; output was:\n${r.out}`);
  assert.match(r.out, /REFUSED[^\n]*i18n\/de\/skills\/demo\/SKILL\.md[^\n]*exit 2/);
  assert.equal(existsSync(join(dir, 'i18n/de/skills/demo/SKILL.md')), false);
});

/** Corrupt the fixture copy's output inside the ```yaml fence, right after the column-0 `name:` line. */
function corruptTranslateCopy(dir) {
  const cp = 'cp "$SOURCE_FILE" "$TARGET_FILE"';
  inject(dir, 'translate-content.sh', cp,
    `${cp}\nawk '{ print } /^name: Build/ { print "injected: true" }' "$TARGET_FILE" > "$TARGET_FILE.tmp" && mv "$TARGET_FILE.tmp" "$TARGET_FILE"`);
}

/** The refusal of the corrupted `de` scaffold, whichever path the run reached the fixture through. */
function assertTranslateRefusedCorruption(dir, r) {
  assert.equal(r.status, 1, `a scaffold failing the parity check must exit 1; output was:\n${r.out}`);
  assert.match(r.out, /FAIL i18n\/de\/skills\/demo\/SKILL\.md:\d+ \[yaml\]/, 'the check reports the corrupted yaml fence');
  assert.match(r.out, /REFUSED[^\n]*i18n\/de\/skills\/demo\/SKILL\.md[^\n]*exit 1/, 'the refusal names the target');
  assert.equal(existsSync(join(dir, 'i18n/de/skills/demo/SKILL.md')), false, 'the rejected scaffold is removed');
  assert.equal(existsSync(join(dir, 'i18n/de/skills/demo')), false, 'and the leaf directory this run created for it');
}

test('translate-content.sh refuses and removes a target the fence-parity check rejects (#475 guard)', (t) => {
  const dir = fixture(t, ['demo']);
  corruptTranslateCopy(dir);
  assertTranslateRefusedCorruption(dir, run(dir, 'translate-content.sh', ['skills', 'demo', 'de']));
});

// --- #475 guard through a symlinked path (#976 round 1) -------------------------------------
//
// Before the checker's run-as-main guard realpathed both sides, each of these exited 0 with the
// corruption written: the checker printed nothing and exited 0, and the scaffolder took that for
// a pass. `pwd -P` in the scaffolders would have closed the first two and not the third.

test('translate-content.sh refuses a fence-corrupted target when the repository is reached through a symlink (#475 guard)', (t) => {
  const dir = fixture(t, ['demo']);
  const link = linkTo(t, dir);
  corruptTranslateCopy(dir);
  const r = run(dir, 'translate-content.sh', ['skills', 'demo', 'de'], { via: link });
  // Instrument check: the scaffolder's ROOT really was the link, or this arm tests a physical path.
  assert.ok(r.out.includes(`${link}/i18n/de/skills/demo/SKILL.md`), `the run names its target through the link; output was:\n${r.out}`);
  assertTranslateRefusedCorruption(dir, r);
});

test('bulk-scaffold-caveman.sh refuses fence-corrupted targets when the repository is reached through a symlink (#475 guard)', (t) => {
  const dir = fixture(t, ['demo']);
  const link = linkTo(t, dir);
  inject(dir, 'bulk-scaffold-caveman.sh', 'in_fm && /^name:/', '/^name:/');
  const r = run(dir, 'bulk-scaffold-caveman.sh', [], { via: link });
  assert.notEqual(r.status, 0, `a run whose scaffolds fail the parity check must not exit 0; output was:\n${r.out}`);
  assert.match(r.out, /Created: 0\b[^\n]*Refused: 6\b/);
  for (const tier of TIERS) {
    const rel = `i18n/${tier}/skills/demo/SKILL.md`;
    assert.match(r.out, new RegExp(`FAIL ${escapeRe(rel)}:\\d+ \\[yaml\\]`), `the check reports ${rel}'s yaml fence`);
    assert.ok(r.out.includes(`REFUSED: ${link}/${rel}`), `the refusal names ${rel} through the link`);
    assert.equal(existsSync(join(dir, rel)), false, `${rel} is removed`);
  }
});

test('translate-content.sh refuses a fence-corrupted target when the checker it runs is a symlinked file (#475 guard)', (t) => {
  const dir = fixture(t, ['demo']);
  // The link's target needs `lib/` and a module-type package.json beside it: node resolves the
  // checker's imports, and whether `.js` is ESM, from the REAL file's location.
  const elsewhere = realpathSync(mkdtempSync(join(tmpdir(), 'scaffolders-checker-')));
  t.after(() => rmTree(elsewhere));
  mkdirSync(join(elsewhere, 'scripts'));
  cpSync(join(REPO, 'scripts', 'check-i18n-fence-parity.js'), join(elsewhere, 'scripts', 'check-i18n-fence-parity.js'));
  cpSync(join(REPO, 'scripts', 'lib'), join(elsewhere, 'scripts', 'lib'), { recursive: true });
  writeFileSync(join(elsewhere, 'package.json'), '{ "type": "module" }\n');
  const checker = join(dir, 'scripts', 'check-i18n-fence-parity.js');
  unlinkSync(checker);
  symlinkSync(join(elsewhere, 'scripts', 'check-i18n-fence-parity.js'), checker);
  assert.notEqual(realpathSync(checker), checker, 'precondition: the checker the scaffolder runs is a symlink');
  corruptTranslateCopy(dir);
  assertTranslateRefusedCorruption(dir, run(dir, 'translate-content.sh', ['skills', 'demo', 'de']));
});

test('both scaffolders still scaffold a clean source through a symlinked path: the control row for the symlink refusals', (t) => {
  // What separates a fixed checker from a guard that merely refuses more: a clean scaffold through
  // the same link must still be written.
  const dir = fixture(t, ['demo']);
  const link = linkTo(t, dir);
  const single = run(dir, 'translate-content.sh', ['skills', 'demo', 'de'], { via: link });
  assert.equal(single.status, 0, `a clean source must scaffold through a link; output was:\n${single.out}`);
  assert.match(single.out, /CREATED/);
  const english = split(readFileSync(join(dir, 'skills/demo/SKILL.md'), 'utf8')).body;
  assert.equal(split(readFileSync(join(dir, 'i18n/de/skills/demo/SKILL.md'), 'utf8')).body, english);
  const bulk = run(dir, 'bulk-scaffold-caveman.sh', [], { via: link });
  assert.equal(bulk.status, 0, `a clean bulk run must exit 0 through a link; output was:\n${bulk.out}`);
  assert.match(bulk.out, /Created: 6\b[^\n]*Refused: 0\b/);
  for (const tier of TIERS) {
    assert.equal(split(readFileSync(join(dir, `i18n/${tier}/skills/demo/SKILL.md`), 'utf8')).body, english, `${tier} is a byte copy`);
  }
});

// --- #617: a source `git status` cannot see is refused too (#976 round 1) -------------------
//
// Each shape leaves `git status --porcelain -- <source>` empty while the bytes HEAD carries are
// not the file's. The oracle is the property, read first: anything written must carry HEAD's
// body. Then the refusal itself.

const FENCE_LINE = 'name: Build and Push Docker Image';

const HIDDEN_FROM_STATUS = [
  {
    shape: 'an untracked source ignored through .git/info/exclude',
    id: 'fresh',
    setup(dir) {
      put(dir, 'skills/fresh/SKILL.md', englishSkill('fresh'));
      mkdirSync(join(dir, '.git', 'info'), { recursive: true });
      appendFileSync(join(dir, '.git', 'info', 'exclude'), 'skills/fresh/\n');
    },
  },
  {
    shape: 'a skip-worktree source with a fence edit',
    id: 'demo',
    setup(dir) {
      gitIn(dir, 'update-index', '--skip-worktree', 'skills/demo/SKILL.md');
      const path = join(dir, 'skills/demo/SKILL.md');
      const text = readFileSync(path, 'utf8');
      assert.equal(text.split(FENCE_LINE).length - 1, 1, 'the fence line occurs once, so the edit is one edit');
      writeFileSync(path, text.replace(FENCE_LINE, 'name: EDITED-IN-WORKTREE-ONLY'));
    },
  },
  {
    shape: 'an untracked source under status.showUntrackedFiles=no',
    id: 'fresh',
    setup(dir) {
      gitIn(dir, 'config', 'status.showUntrackedFiles', 'no');
      put(dir, 'skills/fresh/SKILL.md', englishSkill('fresh'));
    },
  },
];

/** Build the fixture for one hidden-from-status shape, and check the instrument: status sees nothing. */
function hiddenFixture(t, { id, setup }) {
  const dir = fixture(t, ['demo']);
  setup(dir);
  assert.equal(gitIn(dir, 'status', '--porcelain', '--', `skills/${id}/SKILL.md`), '',
    'precondition: `git status` reports this source clean, so the arm is about what it cannot see');
  return dir;
}

for (const hidden of HIDDEN_FROM_STATUS) {
  test(`translate-content.sh refuses ${hidden.shape}, which HEAD does not carry byte for byte (#617)`, (t) => {
    const dir = hiddenFixture(t, hidden);
    const source = `skills/${hidden.id}/SKILL.md`;
    const target = `i18n/de/skills/${hidden.id}/SKILL.md`;
    const r = run(dir, 'translate-content.sh', ['skills', hidden.id, 'de']);
    assertCarriedByHead(dir, target, source);
    assert.equal(r.status, 1, `the source must be refused; output was:\n${r.out}`);
    assert.match(r.out, new RegExp(`REFUSED[^\\n]*${escapeRe(source)}[^\\n]*uncommitted`), 'the refusal names the source');
    assert.equal(existsSync(join(dir, target)), false, 'nothing is written for it');
  });

  test(`bulk-scaffold-caveman.sh refuses ${hidden.shape} per source, and still scaffolds the clean one (#617)`, (t) => {
    const dir = hiddenFixture(t, hidden);
    const source = `skills/${hidden.id}/SKILL.md`;
    const r = run(dir, 'bulk-scaffold-caveman.sh');
    for (const tier of TIERS) {
      for (const id of new Set(['demo', hidden.id])) {
        assertCarriedByHead(dir, `i18n/${tier}/skills/${id}/SKILL.md`, `skills/${id}/SKILL.md`);
      }
    }
    assert.notEqual(r.status, 0, `a run that refused a source must not exit 0; output was:\n${r.out}`);
    assert.match(r.out, /Refused: 6\b/);
    for (const tier of TIERS) {
      const target = `i18n/${tier}/skills/${hidden.id}/SKILL.md`;
      assert.match(r.out, new RegExp(`REFUSED[^\\n]*${escapeRe(target)}[^\\n]*${escapeRe(source)}`), `the refusal names ${target} and its source`);
      assert.equal(existsSync(join(dir, target)), false, `${target} is not written`);
      if (hidden.id !== 'demo') assert.ok(existsSync(join(dir, `i18n/${tier}/skills/demo/SKILL.md`)), `${tier}/demo (clean) is scaffolded`);
    }
  });
}

// --- the order and the failure path of the source check (#976 round 1, R1-04) ---------------

test('translate-content.sh SKIPs an existing target before it looks at the source, so a dirty source does not refuse it', (t) => {
  const dir = fixture(t, ['demo']);
  const existing = put(dir, 'i18n/de/skills/demo/SKILL.md', 'an existing translation\n');
  appendFileSync(join(dir, 'skills/demo/SKILL.md'), '\nA line HEAD does not carry.\n');
  const r = run(dir, 'translate-content.sh', ['skills', 'demo', 'de']);
  assert.equal(r.status, 0, `a SKIP writes nothing and claims nothing, so it must exit 0; output was:\n${r.out}`);
  assert.match(r.out, /SKIP/);
  assert.doesNotMatch(r.out, /REFUSED/);
  assert.equal(readFileSync(existing, 'utf8'), 'an existing translation\n', 'the existing target is untouched');
});

test('bulk-scaffold-caveman.sh SKIPs existing targets before it looks at the source, so a dirty source refuses none of them', (t) => {
  const dir = fixture(t, ['demo']);
  for (const tier of TIERS) put(dir, `i18n/${tier}/skills/demo/SKILL.md`, `an existing ${tier} translation\n`);
  appendFileSync(join(dir, 'skills/demo/SKILL.md'), '\nA line HEAD does not carry.\n');
  const r = run(dir, 'bulk-scaffold-caveman.sh');
  assert.equal(r.status, 0, `a run that only skipped must exit 0; output was:\n${r.out}`);
  assert.match(r.out, /Created: 0\b[^\n]*Skipped \(existing\): 6\b[^\n]*Refused: 0\b/);
  for (const tier of TIERS) {
    assert.equal(readFileSync(join(dir, `i18n/${tier}/skills/demo/SKILL.md`), 'utf8'), `an existing ${tier} translation\n`, `${tier} is untouched`);
  }
});

test('translate-content.sh refuses when git cannot answer for the source, and writes nothing', (t) => {
  const dir = fixture(t, ['demo']);
  const r = run(dir, 'translate-content.sh', ['skills', 'demo', 'de'], { env: gitFailingSourceChecks(t) });
  assert.equal(r.status, 1, `a source git cannot vouch for must be refused; output was:\n${r.out}`);
  assert.match(r.out, /skills\/demo\/SKILL\.md/, 'the refusal names the source');
  assert.equal(existsSync(join(dir, 'i18n')), false, 'nothing at all is written');
});

test('bulk-scaffold-caveman.sh refuses when git cannot answer for the source, and writes nothing', (t) => {
  const dir = fixture(t, ['demo']);
  const r = run(dir, 'bulk-scaffold-caveman.sh', [], { env: gitFailingSourceChecks(t) });
  assert.notEqual(r.status, 0, `a run that refused must not exit 0; output was:\n${r.out}`);
  assert.match(r.out, /Created: 0\b[^\n]*Refused: 6\b/);
  assert.match(r.out, /REFUSED[^\n]*skills\/demo\/SKILL\.md/, 'the refusal names the source');
  assert.equal(existsSync(join(dir, 'i18n')), false, 'nothing at all is written');
});
