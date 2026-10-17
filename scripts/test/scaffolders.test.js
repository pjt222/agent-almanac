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
 * edit to a real scaffolder reaches the fixture. The checker is COPIED, never symlinked: node
 * resolves a symlinked main module to its real path, the checker's run-as-main guard then
 * compares that against the symlink path in `argv[1]`, finds them unequal, and the "check"
 * exits 0 having run nothing — a guard that passes everything.
 *
 * Git isolation: the scaffolders run their own `git`, so they are spawned with `cleanEnv`, which
 * drops every `GIT_*` variable and moves `HOME` and `XDG_CONFIG_HOME` into the fixture (a
 * self-test's `cwd` is not isolation — `_git-fixture.js` says why).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync,
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

/** Run one of the fixture's scaffolders, isolated from the caller's git environment. */
function run(dir, script, args = []) {
  const r = spawnSync('bash', [join(dir, 'scripts', script), ...args], {
    cwd: dir, encoding: 'utf8', env: cleanEnv(dir),
  });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
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
    // The checker's own finding, so the refusal is for the corruption (exit 1), not for a check
    // that could not run (exit 2) — both refuse, and only one of them is this test's subject.
    assert.match(r.out, new RegExp(`FAIL ${escapeRe(rel)}:\\d+ \\[yaml\\]`), `the check reports ${rel}'s yaml fence`);
    assert.match(r.out, new RegExp(`REFUSED[^\\n]*${escapeRe(rel)}[^\\n]*exit 1`), `the refusal names ${rel}`);
    assert.equal(existsSync(join(dir, rel)), false, `${rel} is removed, so a re-run does not SKIP it as existing`);
    assert.equal(existsSync(join(dir, dirname(rel))), false, `and the directory this run created for ${rel}`);
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

test('translate-content.sh refuses and removes a target the fence-parity check rejects (#475 guard)', (t) => {
  const dir = fixture(t, ['demo']);
  // Corrupt the copy's output inside the ```yaml fence, right after the column-0 `name:` line.
  const cp = 'cp "$SOURCE_FILE" "$TARGET_FILE"';
  inject(dir, 'translate-content.sh', cp,
    `${cp}\nawk '{ print } /^name: Build/ { print "injected: true" }' "$TARGET_FILE" > "$TARGET_FILE.tmp" && mv "$TARGET_FILE.tmp" "$TARGET_FILE"`);
  const r = run(dir, 'translate-content.sh', ['skills', 'demo', 'de']);
  assert.equal(r.status, 1, `a scaffold failing the parity check must exit 1; output was:\n${r.out}`);
  assert.match(r.out, /FAIL i18n\/de\/skills\/demo\/SKILL\.md:\d+ \[yaml\]/, 'the check reports the corrupted yaml fence');
  assert.match(r.out, /REFUSED[^\n]*i18n\/de\/skills\/demo\/SKILL\.md[^\n]*exit 1/, 'the refusal names the target');
  assert.equal(existsSync(join(dir, 'i18n/de/skills/demo/SKILL.md')), false, 'the rejected scaffold is removed');
  assert.equal(existsSync(join(dir, 'i18n/de/skills/demo')), false, 'and the directory this run created for it');
});
