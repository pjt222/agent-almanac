/**
 * Behavioural tests for `scripts/normalize-i18n-fences.js` (#486).
 *
 * The property under test is that the tool does NOT write unless asked. That
 * property is trivial to assert vacuously: a run over a corpus with nothing to
 * repair also writes nothing, and such a test stays green even if `--write`
 * were the default again. So every "writes nothing" case here is paired with a
 * `--write` case proving the same fixture DOES get rewritten — the difference
 * between the two is the whole gate.
 *
 * Each test builds a throwaway git repo holding the script, its lib, and one
 * English skill plus one divergent translation. That keeps a run under a second
 * (against the real corpus it is ~90s, dominated by walking English history)
 * and lets a test dirty the tree without touching the working repository.
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
const SCRIPT = 'scripts/normalize-i18n-fences.js';

const ENGLISH_FENCE = 'echo "hello"';
const TRANSLATED_FENCE = 'echo "hallo"';

function git(cwd, args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${args.join(' ')} failed: ${r.stderr}`);
  return r.stdout.trim();
}

function englishSkill() {
  return [
    '---', 'name: demo-skill', 'description: A demo skill.', '---', '',
    '# Demo Skill', '', '## Procedure', '',
    '```bash', ENGLISH_FENCE, '```', '',
  ].join('\n');
}

function translatedSkill(sourceCommit) {
  return [
    '---', 'name: demo-skill', 'description: Eine Demo-Fertigkeit.',
    'locale: de', 'source_locale: en', `source_commit: ${sourceCommit}`, '---', '',
    '# Demo-Fertigkeit', '', '## Ablauf', '',
    // Gated (bash), and a body that appears in no English revision — exactly
    // what the parity gate flags and this tool repairs.
    '```bash', TRANSLATED_FENCE, '```', '',
  ].join('\n');
}

/**
 * A minimal repo the tool can run against: its own `scripts/` copy (the tool
 * resolves ROOT from `__dirname/..`, so it always operates on the tree it sits
 * in), a `package.json` marking ESM, and a clean two-commit history.
 */
function makeFixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'norm-fences-'));
  t.after(() => rmTree(dir));

  mkdirSync(join(dir, 'scripts'), { recursive: true });
  cpSync(join(REPO, SCRIPT), join(dir, SCRIPT));
  cpSync(join(REPO, 'scripts', 'lib'), join(dir, 'scripts', 'lib'), { recursive: true });
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ type: 'module' }), 'utf8');

  git(dir, ['init', '-b', 'main']);
  git(dir, ['config', 'user.email', 'test@example.invalid']);
  git(dir, ['config', 'user.name', 'Fixture']);

  mkdirSync(join(dir, 'skills', 'demo-skill'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'demo-skill', 'SKILL.md'), englishSkill(), 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'english source']);
  const sourceCommit = git(dir, ['rev-parse', 'HEAD']);

  const translated = join(dir, 'i18n', 'de', 'skills', 'demo-skill', 'SKILL.md');
  mkdirSync(dirname(translated), { recursive: true });
  writeFileSync(translated, translatedSkill(sourceCommit), 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'de translation with a divergent fence']);

  return { dir, translated };
}

function run(dir, args = []) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd: dir, encoding: 'utf8' });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

/**
 * Add a second skill carrying TWO divergent fences with different tags, so a
 * tag-scoped run has something to include and something to leave alone. This is
 * the shape #477's batches face: 54 of the 108 files holding yaml divergences
 * also hold bash, r or python ones belonging to later batches.
 */
function addMixedSkill(dir) {
  const english = [
    '---', 'name: mixed-skill', 'description: Two fences.', '---', '',
    '# Mixed', '', '## Procedure', '',
    '```bash', 'echo "english-bash"', '```', '',
    '```yaml', 'key: english-yaml', '```', '',
  ].join('\n');
  mkdirSync(join(dir, 'skills', 'mixed-skill'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'mixed-skill', 'SKILL.md'), english, 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'english mixed skill']);
  const sc = git(dir, ['rev-parse', 'HEAD']);

  const translatedPath = join(dir, 'i18n', 'de', 'skills', 'mixed-skill', 'SKILL.md');
  mkdirSync(dirname(translatedPath), { recursive: true });
  writeFileSync(translatedPath, [
    '---', 'name: mixed-skill', 'description: Zwei Bloecke.',
    'locale: de', 'source_locale: en', `source_commit: ${sc}`, '---', '',
    '# Gemischt', '', '## Ablauf', '',
    '```bash', 'echo "uebersetzt-bash"', '```', '',
    '```yaml', 'key: uebersetzt-yaml', '```', '',
  ].join('\n'), 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'de mixed translation, both fences divergent']);
  return translatedPath;
}

const isDirty = (dir) => git(dir, ['status', '--porcelain']) !== '';

// ── the gate ────────────────────────────────────────────────────────────────

test('no flags: previews, and writes nothing', async (t) => {
  const { dir, translated } = makeFixture(t);
  const before = readFileSync(translated, 'utf8');

  const r = run(dir);

  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /PREVIEW — nothing written/);
  assert.match(r.stdout, /files to change: 1/);
  assert.equal(readFileSync(translated, 'utf8'), before, 'file was modified by a preview run');
  assert.equal(isDirty(dir), false, 'a preview run left the tree dirty');
});

test('--write: rewrites the same fixture the default run left alone', async (t) => {
  // Without this the test above is vacuous — it would pass on a fixture the
  // tool had no reason to touch, and on a tool that still wrote by default.
  const { dir, translated } = makeFixture(t);

  const r = run(dir, ['--write']);

  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Wrote changes/);
  assert.match(r.stdout, /fences restored: 1/);
  const after = readFileSync(translated, 'utf8');
  assert.ok(after.includes(ENGLISH_FENCE), 'English body was not restored');
  assert.ok(!after.includes(TRANSLATED_FENCE), 'translated fence body survived the repair');
  assert.equal(isDirty(dir), true, 'a --write run should leave the tree dirty');
});

test('--write announces the write on stderr, so redirecting stdout cannot hide it', async (t) => {
  const { dir } = makeFixture(t);

  const r = run(dir, ['--write']);

  assert.match(r.stderr, /WRITING 1 file\(s\) \/ 1 fence\(s\) under i18n\/ \.\.\./);
});

test('--dry is still accepted, and still previews', async (t) => {
  const { dir, translated } = makeFixture(t);
  const before = readFileSync(translated, 'utf8');

  const r = run(dir, ['--dry']);

  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /PREVIEW — nothing written/);
  assert.equal(readFileSync(translated, 'utf8'), before);
});

test('--write --dry is a contradiction, not a preference', async (t) => {
  const { dir, translated } = makeFixture(t);
  const before = readFileSync(translated, 'utf8');

  const r = run(dir, ['--write', '--dry']);

  assert.equal(r.status, 2);
  assert.match(r.stderr, /contradict/);
  assert.equal(readFileSync(translated, 'utf8'), before);
});

// ── the dirty-tree refusal ──────────────────────────────────────────────────

test('--write refuses when the write scope is dirty, and touches nothing', async (t) => {
  const { dir, translated } = makeFixture(t);
  const handEdit = readFileSync(translated, 'utf8') + '\nUncommitted prose a human just wrote.\n';
  writeFileSync(translated, handEdit, 'utf8');

  const r = run(dir, ['--write']);

  assert.equal(r.status, 2);
  assert.match(r.stderr, /has uncommitted changes/);
  assert.match(r.stderr, /i18n\/de\/skills\/demo-skill\/SKILL\.md/);
  assert.equal(readFileSync(translated, 'utf8'), handEdit, 'the uncommitted edit was overwritten');
});

test('the dirty-tree refusal fires before any scanning', async (t) => {
  // Placement is the point: the guard sits ahead of ~90s of history reading on
  // the real corpus. If it drifts below that, the refusal still works but stops
  // being usable — a caller learns their run was rejected two minutes in.
  // A two-commit fixture cannot show that as duration, but it can show that the
  // rejected run emitted no scan output at all.
  const { dir, translated } = makeFixture(t);
  writeFileSync(translated, readFileSync(translated, 'utf8') + '\nedit\n', 'utf8');

  const r = run(dir, ['--write']);

  assert.equal(r.status, 2);
  assert.equal(r.stdout, '', 'the guard let the run reach the scanning stage');
});

test('--write refuses on an UNTRACKED file, the one case git cannot restore', async (t) => {
  // The modified-file case is recoverable: `git checkout -- i18n/` brings it
  // back. An untracked translation has no copy in git at all, so overwriting it
  // destroys the only one — this is the case the guard most needs to catch, and
  // `git status --porcelain` reports it as `??` rather than ` M`.
  const { dir } = makeFixture(t);
  const untracked = join(dir, 'i18n', 'de', 'skills', 'demo-skill', 'DRAFT.md');
  writeFileSync(untracked, 'Work in progress, never committed.\n', 'utf8');

  const r = run(dir, ['--write']);

  assert.equal(r.status, 2);
  assert.match(r.stderr, /\?\? i18n\/de\/skills\/demo-skill\/DRAFT\.md/);
  // Plain `git stash` leaves untracked files behind, so advising it here would
  // hand back a tree the guard still refuses.
  assert.match(r.stderr, /git stash -u/);
  assert.equal(readFileSync(untracked, 'utf8'), 'Work in progress, never committed.\n');
});

test('a preview run is unaffected by a dirty tree', async (t) => {
  // The guard exists to protect uncommitted work from being overwritten. A
  // preview overwrites nothing, so blocking it would only train callers to
  // pass --write to see what a run would do.
  const { dir, translated } = makeFixture(t);
  writeFileSync(translated, readFileSync(translated, 'utf8') + '\nedit\n', 'utf8');

  const r = run(dir);

  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /PREVIEW — nothing written/);
  // The count, not just the banner. Both the banner and exit 0 are emitted
  // unconditionally, so asserting only those cannot tell "previewed the dirty
  // tree normally" from "previewed it and silently found nothing" — and preview
  // is now the default mode, so this count is the number a caller acts on.
  assert.match(r.stdout, /files to change: 1/);
});

// ── --tag: the #477 batch scoping ───────────────────────────────────────────

test('--tag restores only the named tag, leaving other tags divergent', async (t) => {
  const { dir } = makeFixture(t);
  const mixed = addMixedSkill(dir);

  const r = run(dir, ['--tag', 'yaml', '--write']);

  assert.equal(r.status, 0, r.stderr);
  const after = readFileSync(mixed, 'utf8');
  assert.ok(after.includes('key: english-yaml'), 'the yaml fence should be restored');
  assert.ok(after.includes('echo "uebersetzt-bash"'),
    'the bash fence belongs to a later batch and must be left alone');
});

test('--tag accepts a comma list, and the = form', async (t) => {
  const { dir } = makeFixture(t);
  addMixedSkill(dir);

  const list = run(dir, ['--tag', 'yaml,bash']);
  assert.equal(list.status, 0, list.stderr);
  assert.match(list.stdout, /fences to restore: 3/, 'both mixed fences plus the demo bash one');

  const eq = run(dir, ['--tag=yaml']);
  assert.equal(eq.status, 0, eq.stderr);
  assert.match(eq.stdout, /fences to restore: 1/);
});

test('a --tag matching nothing is an error, not a clean-looking zero', async (t) => {
  // The `--locale` lesson, one flag over: a scoping value that matches nothing
  // reports "files to change: 0", which reads as "this batch is already done".
  const { dir } = makeFixture(t);
  addMixedSkill(dir);

  const r = run(dir, ['--tag', 'yaml,nosuchtag', '--write']);

  assert.equal(r.status, 2);
  assert.match(r.stderr, /matched no divergent fence: nosuchtag/);
  assert.match(r.stderr, /Divergent tags present:.*yaml/, 'should list what IS available');
  assert.equal(isDirty(dir), false, 'a rejected batch must not have written anything');
});

test('--tag with no usable value is an error', async (t) => {
  const { dir } = makeFixture(t);

  for (const args of [['--tag'], ['--tag', '--write'], ['--tag='], ['--tag', ',, ,']]) {
    const r = run(dir, args);
    assert.equal(r.status, 2, `${JSON.stringify(args)} was accepted`);
  }
});

test('--tag does NOT relax the alignment checks', async (t) => {
  // Scoping narrows what gets repaired, never whether ordinal mapping is
  // trustworthy. A file the unscoped run refuses to touch must stay refused,
  // or a batch could rewrite fences on a mapping the tool knows is unsound.
  const { dir } = makeFixture(t);
  const mixed = addMixedSkill(dir);
  // Drop a fence from the translation so counts no longer match the basis.
  writeFileSync(mixed, readFileSync(mixed, 'utf8')
    .replace('```bash\necho "uebersetzt-bash"\n```\n\n', ''), 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'drop a fence, breaking ordinal mapping']);

  const r = run(dir, ['--tag', 'yaml', '--write']);

  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /skipped/, 'the misaligned file must be reported, not repaired');
  assert.ok(readFileSync(mixed, 'utf8').includes('key: uebersetzt-yaml'),
    'a file with unsound ordinal mapping must not be rewritten by a scoped run');
});

// ── argument parsing ────────────────────────────────────────────────────────

test('--locale=de is honoured, not silently dropped', async (t) => {
  // `indexOf('--locale')` does not match `--locale=de`, so the locale scoping
  // vanished and the run silently covered every locale. On the real corpus that
  // was 281 files where 63 were asked for — with --write, a stray broad write
  // reached by spelling a correct command the ordinary way.
  const { dir, translated } = makeFixture(t);
  mkdirSync(join(dir, 'i18n', 'es', 'skills', 'demo-skill'), { recursive: true });
  writeFileSync(
    join(dir, 'i18n', 'es', 'skills', 'demo-skill', 'SKILL.md'),
    readFileSync(translated, 'utf8').replace('locale: de', 'locale: es'),
    'utf8',
  );
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'es translation, also divergent']);

  const both = run(dir);
  assert.match(both.stdout, /files to change: 2/, 'fixture should have two divergent locales');

  const scoped = run(dir, ['--locale=de']);

  assert.equal(scoped.status, 0, scoped.stderr);
  assert.match(scoped.stdout, /files to change: 1/, '--locale=de did not scope the run');
  assert.match(scoped.stdout, /by locale: de=1/);
});

test('--basis=head is honoured too', async (t) => {
  const { dir } = makeFixture(t);

  const r = run(dir, ['--basis=head']);

  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /basis: head/);
});

test('an unknown argument is an error, not a silent no-op', async (t) => {
  const { dir } = makeFixture(t);

  for (const arg of ['--wrte', '--locale-de', 'stray-positional', '--writeq']) {
    const r = run(dir, [arg]);
    assert.equal(r.status, 2, `'${arg}' was accepted`);
    assert.match(r.stderr, /unknown argument/);
  }
});

test('a value passed to a boolean flag is an error', async (t) => {
  const { dir } = makeFixture(t);

  const r = run(dir, ['--write=true']);

  assert.equal(r.status, 2);
  assert.match(r.stderr, /takes no value/);
});

test('a value flag with no value is still an error', async (t) => {
  const { dir } = makeFixture(t);

  for (const args of [['--locale'], ['--locale', '--dry'], ['--locale=']]) {
    const r = run(dir, args);
    assert.equal(r.status, 2, `${JSON.stringify(args)} was accepted`);
    assert.match(r.stderr, /requires a value/);
  }
});

// ── the no-op guards ────────────────────────────────────────────────────────

test('--locale matching no locale is an error, not a clean-looking zero', async (t) => {
  const { dir } = makeFixture(t);

  const r = run(dir, ['--locale', 'nope', '--write']);

  assert.equal(r.status, 2);
  assert.match(r.stderr, /is not a translated locale/);
  assert.match(r.stderr, /Available: de/);
});

// The first version of this guard asked "does `i18n/<value>` exist?", which is a
// different question from "would the scan accept this locale?". Each input below
// answered yes to the first and no to the second, and so reached the vacuous
// `files to change: 0` the guard exists to reject.
for (const [label, locale] of [
  ['a path segment', 'de/skills'],
  ['a dot-segment', '..'],
  ['a directory with no skills/ subtree', 'glossaries'],
]) {
  test(`--locale rejects ${label} ('${locale}')`, async (t) => {
    const { dir } = makeFixture(t);
    // A real i18n/ sibling that is a directory but carries no translations —
    // `i18n/glossaries/` in the working repo.
    mkdirSync(join(dir, 'i18n', 'glossaries'), { recursive: true });
    writeFileSync(join(dir, 'i18n', 'glossaries', 'de.yml'), 'term: Begriff\n', 'utf8');

    const r = run(dir, ['--locale', locale, '--write']);

    assert.equal(r.status, 2, `'${locale}' was accepted: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /is not a translated locale/);
  });
}

test('--locale scopes the dirty check to that locale', async (t) => {
  const { dir, translated } = makeFixture(t);
  mkdirSync(join(dir, 'i18n', 'es'), { recursive: true });
  writeFileSync(join(dir, 'i18n', 'es', 'stray.md'), 'untracked\n', 'utf8');

  // `es` is dirty; a `de`-scoped write must not be blocked by it.
  const r = run(dir, ['--locale', 'de', '--write']);

  assert.equal(r.status, 0, r.stderr);
  assert.doesNotMatch(readFileSync(translated, 'utf8'), /hallo/);
});

// ── the mirrors: agents / teams / guides (#477) ─────────────────────────────

/**
 * A translated GUIDE, which lives at `<tree>/<id>.md` rather than
 * `skills/<id>/SKILL.md`. The tool was skills-only until the mirrors became the
 * last mechanically-repairable slice of #477 — 87 of 335 gated violations, 76 of
 * them in one guide across four locales.
 */
function addGuideMirror(dir) {
  mkdirSync(join(dir, 'guides'), { recursive: true });
  writeFileSync(join(dir, 'guides', 'quick-ref.md'), [
    '---', 'title: Quick Reference', 'description: Commands.', '---', '',
    '# Quick Reference', '',
    '```bash', '# Count the skills', 'ls skills | wc -l', '```', '',
  ].join('\n'), 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'english guide']);
  const sc = git(dir, ['rev-parse', 'HEAD']);

  const translated = join(dir, 'i18n', 'de', 'guides', 'quick-ref.md');
  mkdirSync(dirname(translated), { recursive: true });
  writeFileSync(translated, [
    '---', 'title: Kurzreferenz', 'description: Befehle.',
    'locale: de', 'source_locale: en', `source_commit: ${sc}`, '---', '',
    '# Kurzreferenz', '',
    '```bash', '# Die Skills zaehlen', 'ls skills | wc -l', '```', '',
  ].join('\n'), 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'de guide with a translated comment in a frozen fence']);
  return translated;
}

test('a translated GUIDE mirror is repaired, not just skills', async (t) => {
  const { dir } = makeFixture(t);
  const guide = addGuideMirror(dir);

  const r = run(dir, ['--write']);

  assert.equal(r.status, 0, r.stderr);
  const after = readFileSync(guide, 'utf8');
  assert.ok(after.includes('# Count the skills'), 'the English comment was not restored');
  assert.ok(!after.includes('# Die Skills zaehlen'), 'the translated comment survived');
  // The guide's prose must be untouched — only the frozen fence is restored.
  assert.ok(after.includes('# Kurzreferenz'), 'translated prose was overwritten');
  assert.ok(after.includes('title: Kurzreferenz'), 'translated frontmatter was overwritten');
});

test('--tree scopes a run the way --tag does', async (t) => {
  const { dir, translated } = makeFixture(t);
  const guide = addGuideMirror(dir);

  const r = run(dir, ['--tree', 'guides', '--write']);

  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /files changed: 1/);
  assert.ok(readFileSync(guide, 'utf8').includes('# Count the skills'), 'the guide was not repaired');
  assert.ok(readFileSync(translated, 'utf8').includes(TRANSLATED_FENCE), 'the skill was repaired despite --tree guides');
});

test('--tree naming no translated tree is an error, not a clean-looking zero', async (t) => {
  const { dir } = makeFixture(t);

  const r = run(dir, ['--tree', 'teams', '--write']);

  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stderr, /matched no translated content/);
  assert.match(r.stderr, /Reachable here: skills/);
});

/**
 * A locale carrying `skills/` and nothing else — the dominant shape of the real
 * corpus, where six of the ten locales are skills-only, and a shape no fixture
 * had. Its absence hid two things at once: the per-locale `hasTree` guard was
 * uncovered, and the `--locale`/`--tree` composition below was unreachable.
 */
function addSkillsOnlyLocale(dir) {
  const p = join(dir, 'i18n', 'caveman', 'skills', 'demo-skill', 'SKILL.md');
  mkdirSync(dirname(p), { recursive: true });
  const sc = git(dir, ['rev-parse', 'HEAD']);
  writeFileSync(p, [
    '---', 'name: demo-skill', 'description: Demo.',
    'locale: caveman', 'source_locale: en', `source_commit: ${sc}`, '---', '',
    '# DEMO', '', '## STEPS', '',
    '```bash', 'echo "UGG"', '```', '',
  ].join('\n'), 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'a skills-only locale']);
  return p;
}

test('a locale missing a tree is skipped, not scanned into a crash', async (t) => {
  const { dir } = makeFixture(t);
  addGuideMirror(dir);
  addSkillsOnlyLocale(dir);

  const r = run(dir);

  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /i18n\/de\/guides\/quick-ref\.md/);
  assert.match(r.stdout, /i18n\/caveman\/skills\/demo-skill\/SKILL\.md/);
});

test('--tree is validated against the SCOPED scan, not a corpus-wide union', async (t) => {
  // `--locale caveman --tree guides` satisfied each guard on its own while
  // neither saw the composition, and reported `files to change: 0` — the exact
  // clean-looking zero the guard family exists to reject.
  const { dir } = makeFixture(t);
  addGuideMirror(dir);
  addSkillsOnlyLocale(dir);

  const r = run(dir, ['--locale', 'caveman', '--tree', 'guides', '--write']);

  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stderr, /matched no translated content in locale 'caveman'/);
  assert.match(r.stderr, /Reachable here: skills/);
});

test('the same --tree value still works for a locale that does carry it', async (t) => {
  // The paired positive: without it the test above passes on a build that
  // rejects every --tree value.
  const { dir } = makeFixture(t);
  const guide = addGuideMirror(dir);
  addSkillsOnlyLocale(dir);

  const r = run(dir, ['--locale', 'de', '--tree', 'guides', '--write']);

  assert.equal(r.status, 0, r.stderr);
  assert.ok(readFileSync(guide, 'utf8').includes('# Count the skills'));
});

test('--tree with no usable value is an error', async (t) => {
  const { dir } = makeFixture(t);

  for (const value of [',', ' , ']) {
    const r = run(dir, ['--tree', value]);
    assert.equal(r.status, 2, `'${value}' was accepted`);
    assert.match(r.stderr, /no usable value/);
  }
});

test('a template or README inside a tree is not a target', async (t) => {
  // Which names count as content is decided by `contentKey` in lib/fences.js —
  // the same function the English history index is built with — so this cannot
  // drift from what the checker considers a file.
  const { dir } = makeFixture(t);
  addGuideMirror(dir);
  for (const name of ['_template.md', 'README.md']) {
    writeFileSync(join(dir, 'guides', name), '# Not content\n\n```bash\necho english\n```\n', 'utf8');
    const p = join(dir, 'i18n', 'de', 'guides', name);
    writeFileSync(p, '# Kein Inhalt\n\n```bash\necho uebersetzt\n```\n', 'utf8');
  }
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'add a template and a README to the guides tree']);

  const r = run(dir, ['--tree', 'guides', '--write']);

  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /files changed: 1/);
  for (const name of ['_template.md', 'README.md']) {
    const after = readFileSync(join(dir, 'i18n', 'de', 'guides', name), 'utf8');
    assert.ok(after.includes('echo uebersetzt'), `${name} was treated as content`);
  }
  // Not merely unwritten — not a TARGET. Deleting the `contentKey` null-guard
  // leaves the bytes untouched too, because the history lookup then misses and
  // the file falls through to the unsound-mapping path. That mutant kept the
  // whole suite green while sending a reviewer to hand-repair a template, so
  // the report is what has to be asserted.
  assert.doesNotMatch(r.stdout, /_template\.md/, 'a template reached the skipped list');
  assert.doesNotMatch(r.stdout, /README\.md/, 'a README reached the skipped list');
});

test('a template in the skills tree is not a target either', async (t) => {
  // The arm above proves the property for the FLAT trees only, while its comment claims
  // it generally. It did not hold for `skills/`, which is the tree holding most of the
  // corpus: `contentKey` applied the `_`-prefix exclusion in the flat branch alone, so
  // `skills/_template/SKILL.md` keyed to `skills/_template` and the English history index
  // carried it. Unreachable in the real corpus only because no locale happens to carry a
  // translated template — which is ambient state, not a guarantee (#519).
  const { dir } = makeFixture(t);

  const english = [
    '---', 'name: skill-name', 'description: Template.', '---', '',
    '# Template', '', '## Procedure', '',
    '```bash', 'echo english', '```', '',
  ].join('\n');
  mkdirSync(join(dir, 'skills', '_template'), { recursive: true });
  writeFileSync(join(dir, 'skills', '_template', 'SKILL.md'), english, 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'add a template to the skills tree']);

  const translated = join(dir, 'i18n', 'de', 'skills', '_template', 'SKILL.md');
  mkdirSync(dirname(translated), { recursive: true });
  writeFileSync(
    translated,
    ['---', 'name: skill-name', 'locale: de', '---', '', '# Vorlage', '',
      '```bash', 'echo uebersetzt', '```', ''].join('\n'),
    'utf8',
  );
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'add a translated template']);

  const r = run(dir, ['--tree', 'skills', '--write']);

  assert.equal(r.status, 0, r.stderr);
  // Positive control, as the flat arm has: without it both assertions below pass vacuously
  // if `--write` stopped writing at all. `demo-skill` is divergent and must still be repaired.
  assert.match(r.stdout, /files changed: 1/);
  const after = readFileSync(translated, 'utf8');
  assert.ok(after.includes('echo uebersetzt'), 'the skills template was treated as content');
  // Not a target, not merely unwritten — same distinction the flat arm asserts.
  assert.doesNotMatch(r.stdout, /_template/, 'the skills template reached the skipped list');
});

// ── #674: the splice gate's alignment fold ──────────────────────────────────

/**
 * A fixture built for `--root`, not for `cwd`.
 *
 * Every other fixture in this file COPIES `scripts/` into the temp repo, because the tool
 * resolved its root from `__dirname/..` and there was no other way to point it at a corpus you
 * constructed. #674 gave it `--root`, so this one runs the REAL script against a fixture — which
 * is the whole reason the defect below could not be demonstrated end to end when it was filed.
 */
function braceFixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'norm-brace-'));
  t.after(() => rmTree(dir));

  git(dir, ['init', '-b', 'main']);
  git(dir, ['config', 'user.email', 'test@example.invalid']);
  git(dir, ['config', 'user.name', 'Fixture']);

  // English carries a LOCALISABLE `text` fence at ordinal 1.
  mkdirSync(join(dir, 'skills', 'demo-skill'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'demo-skill', 'SKILL.md'), [
    '---', 'name: demo-skill', 'description: A demo skill.', '---', '',
    '# Demo Skill', '', '## Procedure', '',
    '```text', 'fill this in', '```', '',
  ].join('\n'), 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'english source']);

  // The mirror carries a FROZEN brace-info fence at the same ordinal, with a body English has
  // never held. Under the local `alignmentTag` both folded to `text`, the file passed the
  // alignment guard, and the brace fence — gated, divergent — became eligible for a splice
  // whose source is the localisable `text` block's prose.
  const translated = join(dir, 'i18n', 'de', 'skills', 'demo-skill', 'SKILL.md');
  mkdirSync(dirname(translated), { recursive: true });
  writeFileSync(translated, [
    '---', 'name: demo-skill', 'description: Eine Demo-Fertigkeit.',
    'locale: de', 'source_locale: en', '---', '',
    '# Demo-Fertigkeit', '', '## Ablauf', '',
    '```{r}', 'x <- 1', '```', '',
  ].join('\n'), 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'de translation with a brace fence']);

  return dir;
}

test('a brace fence facing a text basis is SKIPPED, not spliced (#674)', (t) => {
  const dir = braceFixture(t);
  const r = spawnSync(process.execPath, [join(REPO, SCRIPT), '--root', dir, '--basis', 'head'],
    { encoding: 'utf8' });

  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /tag sequence diverges at fence 1 \(\{ vs text\)/,
    'reported, and reported with the FOLDED tokens — `untagged vs text` would send whoever '
    + 'does the manual repair hunting for an untagged fence that is not in the file');
  assert.match(r.stdout, /files to change: 0/,
    'and nothing may be planned for that file');
  assert.doesNotMatch(r.stdout, /would restore/,
    'a splice into a frozen fence from a localisable block is the defect itself');
});

test('the same fixture with matching tags IS repaired — the non-vacuity control', (t) => {
  // Without this, the assertions above are satisfied by a normalizer that refuses everything.
  // Same shapes, same ordinal, tags agreeing: the tool must still do its job.
  const dir = mkdtempSync(join(tmpdir(), 'norm-brace-ok-'));
  t.after(() => rmTree(dir));
  git(dir, ['init', '-b', 'main']);
  git(dir, ['config', 'user.email', 'test@example.invalid']);
  git(dir, ['config', 'user.name', 'Fixture']);
  mkdirSync(join(dir, 'skills', 'demo-skill'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'demo-skill', 'SKILL.md'), [
    '---', 'name: demo-skill', 'description: A demo skill.', '---', '',
    '# Demo Skill', '', '## Procedure', '',
    '```{r}', 'x <- 1', '```', '',
  ].join('\n'), 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'english source']);
  const translated = join(dir, 'i18n', 'de', 'skills', 'demo-skill', 'SKILL.md');
  mkdirSync(dirname(translated), { recursive: true });
  writeFileSync(translated, [
    '---', 'name: demo-skill', 'description: Eine Demo-Fertigkeit.',
    'locale: de', 'source_locale: en', '---', '',
    '# Demo-Fertigkeit', '', '## Ablauf', '',
    '```{r}', 'y <- 2', '```', '',
  ].join('\n'), 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'de translation, brace fence, divergent body']);

  const r = spawnSync(process.execPath, [join(REPO, SCRIPT), '--root', dir, '--basis', 'head'],
    { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /would restore/, 'a matching-tag divergence is still repairable');
  assert.match(r.stdout, /files to change: 1/);
});

// ── #677: the scope guards, through the shared predicate ────────────────────

/** A fixture whose `i18n/` carries a locale DIRECTORY with no translated file in it. */
function emptyLocaleFixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'norm-scope-'));
  t.after(() => rmTree(dir));
  git(dir, ['init', '-b', 'main']);
  git(dir, ['config', 'user.email', 'test@example.invalid']);
  git(dir, ['config', 'user.name', 'Fixture']);

  mkdirSync(join(dir, 'skills', 'demo-skill'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'demo-skill', 'SKILL.md'), englishSkill(), 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'english source']);
  const sourceCommit = git(dir, ['rev-parse', 'HEAD']);

  // `de` is real and populated.
  const translated = join(dir, 'i18n', 'de', 'skills', 'demo-skill', 'SKILL.md');
  mkdirSync(dirname(translated), { recursive: true });
  writeFileSync(translated, translatedSkill(sourceCommit), 'utf8');

  // `fr` has the directory shape and nothing in it. `scannableLocales` — directory-based,
  // pre-scan — says yes; `localesReached` — content-based, post-scan — says no. That gap is
  // the behaviour change #677 is about, and it is why converting the guard was not a rename.
  mkdirSync(join(dir, 'i18n', 'fr', 'skills'), { recursive: true });

  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'de translation']);
  return dir;
}

const runAt = (dir, ...args) =>
  spawnSync(process.execPath, [join(REPO, SCRIPT), '--root', dir, ...args], { encoding: 'utf8' });

test('a locale whose directory exists but holds no translation is REFUSED (#677)', (t) => {
  const dir = emptyLocaleFixture(t);
  const r = runAt(dir, '--locale', 'fr', '--basis', 'head');
  // Exit 2 and not merely non-zero: 1 would be a finding, and this is a refusal.
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /--locale 'fr' matched no translated content/);
  assert.doesNotMatch(r.stdout, /files to change/,
    'the run must not reach a summary it would report as a clean zero');
});

test('an unknown --tree names the known trees, rather than only "unreachable" (#677)', (t) => {
  const dir = emptyLocaleFixture(t);
  const r = runAt(dir, '--tree', 'recipes', '--basis', 'head');
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /--tree names no such content tree: recipes/);
  assert.match(r.stderr, /Known trees:/,
    'the hand-rolled guard this replaces could only say "unreachable", which reads as '
    + '"correct name, empty corpus" for what is actually a typo');
});

test('a --tree list with a typo AND an unreached tree names both, in one message', (t) => {
  // Regression for the #690 review's finding 2. The unknown-name arm used to `return` early, so
  // `--tree recipes,guides` reported only `recipes`; the caller fixed the typo, reran, and
  // learned about `guides` on the next round trip. The hand-rolled guard this replaced named
  // both, and a shared predicate that is worse than the copy it replaces is not a consolidation.
  const dir = emptyLocaleFixture(t);
  const r = runAt(dir, '--tree', 'recipes,guides', '--basis', 'head');
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /names no such content tree: recipes/);
  assert.match(r.stderr, /matched no translated content.*guides/,
    'the real-but-unreached tree must be reported in the SAME run as the typo');
});

test('a --locale/--tree pair that is individually valid but jointly empty is refused', (t) => {
  // The composition the hand-rolled guard was written for, kept as a regression: `de` is real
  // and `skills` is real, but `de` carries no `guides`.
  const dir = emptyLocaleFixture(t);
  const r = runAt(dir, '--locale', 'de', '--tree', 'guides', '--basis', 'head');
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /--tree matched no translated content in locale 'de': guides/);
});

test('a scope that DOES reach something still runs — the non-vacuity control', (t) => {
  const dir = emptyLocaleFixture(t);
  const r = runAt(dir, '--locale', 'de', '--basis', 'head');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /would restore/, 'the tool must still do its job for a live scope');
});

test('a corpus of orphan mirrors refuses rather than reporting a clean zero (#677)', (t) => {
  // A REACHABLE CASE for the backstop — not "the" one, which is how this comment first read.
  // The backstop fires whenever the walk collects zero targets under no `--locale`/`--tree`, and
  // the #690 review enumerated at least four shapes that do it: a missing English source (this
  // fixture), content-tree directories that are all empty, mirrors whose names `contentKey`
  // rejects, and a mirror entry that is a directory named `*.md`. One class, so one
  // representative is adequate coverage; the wording claimed more than the fixture shows.
  //
  // It took constructing to find. With no `--locale` and no
  // `--tree`, `validateScope` has nothing to validate and returns clean — so the only thing
  // between an all-orphan corpus and `files to change: 0` at exit 0 is the empty-targets check.
  //
  // `scannableLocales` says `de` is scannable (the directory shape is there), and
  // `collectI18nTargets` drops the file because its English source does not exist. Two
  // predicates, one directory-based and one content-based, disagreeing exactly as documented.
  //
  // Written because a mutation deleting the backstop survived all 39 tests: the guard was
  // belt-and-braces with no belt.
  const dir = mkdtempSync(join(tmpdir(), 'norm-orphan-'));
  t.after(() => rmTree(dir));
  git(dir, ['init', '-b', 'main']);
  git(dir, ['config', 'user.email', 'test@example.invalid']);
  git(dir, ['config', 'user.name', 'Fixture']);

  // A real English source, so the repo is not empty and the walk has something to do.
  mkdirSync(join(dir, 'skills', 'demo-skill'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'demo-skill', 'SKILL.md'), englishSkill(), 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'english source']);

  // The only mirror is an ORPHAN — no `skills/ghost/SKILL.md` exists.
  const orphan = join(dir, 'i18n', 'de', 'skills', 'ghost', 'SKILL.md');
  mkdirSync(dirname(orphan), { recursive: true });
  writeFileSync(orphan, translatedSkill('0'.repeat(40)), 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'an orphan mirror']);

  const r = runAt(dir, '--basis', 'head');
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /this scope selected no translated files/);
  assert.doesNotMatch(r.stdout, /files to change: 0/,
    'a run that examined nothing must not print the same summary as a run that found nothing');
});
