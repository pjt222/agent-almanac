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
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

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
  t.after(() => rmSync(dir, { recursive: true, force: true }));

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

// ── the fork refusal (#498) ─────────────────────────────────────────────────

/**
 * A translation whose steps do not correspond to English, carrying the SAME
 * fence count in the SAME tag sequence — so both structural guards pass and the
 * tool would rewrite every fence with the body of a different step.
 *
 * This is `de/design-shiny-ui` in miniature: there, German Schritt 5 is English
 * Step 6, and `check-i18n-fence-parity.js` reports the corrupted result `OK`,
 * because a scrambled file is a permutation of legitimate English bodies and
 * every fence individually matches some English revision.
 */
function addForkedSkill(dir) {
  const english = [
    '---', 'name: forked-skill', 'description: Two steps.', '---', '',
    '# Forked', '', '## Procedure', '',
    '### Step 1: Launch the app', '',
    '```r', 'library(shiny)', 'runApp("app")', '```', '',
    '### Step 2: Install the theme package', '',
    '```r', 'install.packages("bslib")', 'library(bslib)', '```', '',
  ].join('\n');
  mkdirSync(join(dir, 'skills', 'forked-skill'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'forked-skill', 'SKILL.md'), english, 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'english forked-skill source']);
  const sc = git(dir, ['rev-parse', 'HEAD']);

  const translatedPath = join(dir, 'i18n', 'de', 'skills', 'forked-skill', 'SKILL.md');
  mkdirSync(dirname(translatedPath), { recursive: true });
  writeFileSync(translatedPath, [
    '---', 'name: forked-skill', 'description: Zwei Schritte.',
    'locale: de', 'source_locale: en', `source_commit: ${sc}`, '---', '',
    '# Verzweigt', '', '## Ablauf', '',
    // The steps are in the opposite order, so fence 1 faces fence 2's basis.
    '### Schritt 1: Theme-Paket installieren', '',
    '```r', '# Paket installieren', 'install.packages("bslib")', 'library(bslib)', '```', '',
    '### Schritt 2: App starten', '',
    '```r', '# App starten', 'library(shiny)', 'runApp("app")', '```', '',
  ].join('\n'), 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'de translation whose steps are permuted']);
  return translatedPath;
}

test('a forked translation is refused, and its bytes are left alone', async (t) => {
  const { dir } = makeFixture(t);
  const forked = addForkedSkill(dir);
  const before = readFileSync(forked, 'utf8');

  const r = run(dir, ['--write']);

  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /file\(s\) refused — the steps may not correspond/);
  assert.match(r.stdout, /i18n\/de\/skills\/forked-skill\/SKILL\.md/);
  assert.equal(readFileSync(forked, 'utf8'), before, 'a refused file was rewritten anyway');
});

test('--fork-threshold 0 restores the very file the guard refused', async (t) => {
  // Without this the test above is vacuous: it would pass on a fixture the tool
  // had no reason to touch, and on a build where the fork check did nothing but
  // print. The difference between the two runs IS the guard.
  const { dir } = makeFixture(t);
  const forked = addForkedSkill(dir);

  const r = run(dir, ['--write', '--fork-threshold', '0']);

  assert.equal(r.status, 0, r.stderr);
  assert.doesNotMatch(r.stdout, /refused — the steps may not correspond/);
  const after = readFileSync(forked, 'utf8');
  assert.ok(after.includes('runApp("app")'), 'nothing was restored, so the refusal proves nothing');
  assert.ok(!after.includes('# Paket installieren'), 'the translated body survived');
});

test('the refusal quotes the fence carrying the most disagreeing tokens', async (t) => {
  // The lowest-scoring fence is often a 3-token one a reviewer would dismiss as
  // noise. Reporting `(1 - containment) * tokens` puts the argument next to the
  // verdict.
  const { dir } = makeFixture(t);
  addForkedSkill(dir);

  const r = run(dir);

  assert.match(r.stdout, /measured gated fence\(s\) below threshold/);
  assert.match(r.stdout, /worst evidence fence \d+ \[r\] at containment 0\.\d+ over \d+ code token\(s\)/);
});

test('the fork guard does not refuse an ordinary faithful translation', async (t) => {
  // The class the prototype got wrong: a comment-only restore, which it scored
  // 0.00 — the maximum fork signal — on four real files. A guard that refuses
  // these is worse than no guard, because it stops the repair it exists to make
  // safe.
  const { dir, translated } = makeFixture(t);

  const r = run(dir, ['--write']);

  assert.equal(r.status, 0, r.stderr);
  assert.doesNotMatch(r.stdout, /refused — the steps may not correspond/);
  assert.ok(readFileSync(translated, 'utf8').includes(ENGLISH_FENCE));
});

test('--fork-threshold rejects a value outside [0, 1]', async (t) => {
  const { dir } = makeFixture(t);

  for (const value of ['2', '-1', 'half', '']) {
    const r = run(dir, ['--fork-threshold', value]);
    assert.equal(r.status, 2, `'${value}' was accepted`);
  }
});

/**
 * A file where only SOME fences are forked — the shape the real defect takes.
 * `de/design-shiny-ui` scores 6 of its 8 fences below the threshold and the
 * other two at 0.83 and 0.86, so a rule that refused only when EVERY measured
 * fence fell below it would have released the one true positive.
 *
 * The all-forked fixture above cannot see that: there `below.length` equals
 * `measured`, so `if (below.length === measured)` passes every test while
 * rewriting the file this feature exists to protect.
 */
function addPartlyForkedSkill(dir) {
  const english = [
    '---', 'name: partly-forked', 'description: Three steps.', '---', '',
    '# Partly', '', '## Procedure', '',
    '```r', 'library(shiny)', 'runApp("app")', '```', '',
    '```r', 'install.packages("bslib")', 'library(bslib)', '```', '',
    '```r', 'sass_input <- sass::sass_file("styles.scss")', 'sass::sass(sass_input)', '```', '',
  ].join('\n');
  mkdirSync(join(dir, 'skills', 'partly-forked'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'partly-forked', 'SKILL.md'), english, 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'english partly-forked source']);
  const sc = git(dir, ['rev-parse', 'HEAD']);

  const p = join(dir, 'i18n', 'de', 'skills', 'partly-forked', 'SKILL.md');
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, [
    '---', 'name: partly-forked', 'description: Drei Schritte.',
    'locale: de', 'source_locale: en', `source_commit: ${sc}`, '---', '',
    '# Teilweise', '', '## Ablauf', '',
    // Fences 1 and 2 are faithful — only their comments are German, so they
    // score 1.00 and must NOT be what triggers the refusal.
    '```r', '# App starten', 'library(shiny)', 'runApp("app")', '```', '',
    '```r', '# Paket installieren', 'install.packages("bslib")', 'library(bslib)', '```', '',
    // Fence 3 is a different step entirely.
    '```r', '# Barrierefreiheit', 'tags$main(role = "main")', 'plotOutput("chart", alt = "Umsatz")', '```', '',
  ].join('\n'), 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'de translation with one forked step among three']);
  return p;
}

test('a file with only SOME fences forked is still refused', async (t) => {
  const { dir } = makeFixture(t);
  const partly = addPartlyForkedSkill(dir);
  const before = readFileSync(partly, 'utf8');

  const r = run(dir, ['--write']);

  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /i18n\/de\/skills\/partly-forked\/SKILL\.md/);
  assert.match(r.stdout, /1 of 3 measured gated fence\(s\) below threshold/);
  assert.equal(readFileSync(partly, 'utf8'), before, 'a partly-forked file was rewritten');
});

test('--fork-threshold 0 restores the partly-forked file too', async (t) => {
  const { dir } = makeFixture(t);
  const partly = addPartlyForkedSkill(dir);

  const r = run(dir, ['--write', '--fork-threshold', '0']);

  assert.equal(r.status, 0, r.stderr);
  assert.ok(readFileSync(partly, 'utf8').includes('sass::sass_file'), 'nothing was restored');
});

/**
 * A file where the LOWEST-scoring fence and the MOST-EVIDENCED fence are
 * different fences, so the report's choice between them is observable. Without
 * this, `below.reduce((a, b) => a)` — always take the first — keeps the
 * evidence-weighting test green.
 */
function addEvidenceSkill(dir) {
  const english = [
    '---', 'name: evidence-skill', 'description: Two steps.', '---', '',
    '# Evidence', '', '## Procedure', '',
    '```r', 'n <- 1', '```', '',
    '```r',
    'summarise_metrics <- function(frame, group_col, value_col) {',
    '  dplyr::group_by(frame, .data[[group_col]]) |>',
    '    dplyr::summarise(total = sum(.data[[value_col]], na.rm = TRUE))',
    '}', '```', '',
  ].join('\n');
  mkdirSync(join(dir, 'skills', 'evidence-skill'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'evidence-skill', 'SKILL.md'), english, 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'english evidence-skill source']);
  const sc = git(dir, ['rev-parse', 'HEAD']);

  const p = join(dir, 'i18n', 'de', 'skills', 'evidence-skill', 'SKILL.md');
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, [
    '---', 'name: evidence-skill', 'description: Zwei Schritte.',
    'locale: de', 'source_locale: en', `source_commit: ${sc}`, '---', '',
    '# Beweis', '', '## Ablauf', '',
    // Fence 1: 2 tokens, shares none -> containment 0.00, evidence weight ~2.
    '```r', 'z <- 9', '```', '',
    // Fence 2: many tokens, shares none -> containment 0.00, evidence weight ~14.
    '```r',
    'plot_theme <- ggplot2::theme_minimal(base_size = 12)',
    'ggplot2::ggsave("chart.png", width = 8, height = 6)',
    '```', '',
  ].join('\n'), 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'de translation where the lowest score is not the best evidence']);
  return p;
}

test('the refusal names the most-evidenced fence, not the lowest-scoring one', async (t) => {
  const { dir } = makeFixture(t);
  addEvidenceSkill(dir);

  const r = run(dir);

  const line = r.stdout.split('\n').find((l) => l.includes('evidence-skill'));
  assert.ok(line, `no refusal line for evidence-skill:\n${r.stdout}`);
  const m = /worst evidence fence (\d+) \[r\] at containment ([\d.]+) over (\d+) code token\(s\)/.exec(line);
  assert.ok(m, `refusal line did not carry the evidence fields: ${line}`);
  assert.equal(m[1], '2', `named fence ${m[1]}; fence 1 scores as low over far fewer tokens`);
  assert.ok(Number(m[3]) > 2, `expected the many-token fence, got n=${m[3]}`);
});

/**
 * A gated fence whose tag is outside `lib/code-tokens.js` — the honest
 * "cannot measure this" path. Untested, deleting the unmeasured.push() is
 * invisible, and the report silently loses the one signal that says a whole tag
 * is going unchecked.
 */
function addUnmeasurableSkill(dir) {
  const english = [
    '---', 'name: unmeasurable-skill', 'description: Two fences.', '---', '',
    '# Unmeasurable', '', '## Procedure', '',
    '```bash', 'echo "english"', '```', '',
    '```promql', 'rate(http_requests_total[5m])', '```', '',
  ].join('\n');
  mkdirSync(join(dir, 'skills', 'unmeasurable-skill'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'unmeasurable-skill', 'SKILL.md'), english, 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'english unmeasurable-skill source']);
  const sc = git(dir, ['rev-parse', 'HEAD']);

  const p = join(dir, 'i18n', 'de', 'skills', 'unmeasurable-skill', 'SKILL.md');
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, [
    '---', 'name: unmeasurable-skill', 'description: Zwei Bloecke.',
    'locale: de', 'source_locale: en', `source_commit: ${sc}`, '---', '',
    '# Nicht messbar', '', '## Ablauf', '',
    '```bash', 'echo "uebersetzt"', '```', '',
    '```promql', 'rate(http_anfragen_gesamt[5m])', '```', '',
  ].join('\n'), 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'de translation carrying an unmeasurable tag']);
  return p;
}

test('an unmeasurable tag is reported by name, never silently passed', async (t) => {
  const { dir } = makeFixture(t);
  addUnmeasurableSkill(dir);

  const r = run(dir);

  assert.match(r.stdout, /gated fence\(s\) could not be measured for step correspondence/);
  assert.match(r.stdout, /unknown-tag:promql=1/);
});

test('the unmeasured report distinguishes repaired files from refused ones', async (t) => {
  // "They are still restored" was false for a fence in a refused file.
  const { dir } = makeFixture(t);
  addUnmeasurableSkill(dir);

  const r = run(dir);

  assert.match(r.stdout, /1 fence\(s\) in file\(s\) this run repairs/);
  assert.match(r.stdout, /0 fence\(s\) in file\(s\) refused above — unchecked, and not restored/);
});

test('the unmeasured report does not claim a restore a preview did not make', async (t) => {
  // The first wording said "restored" four lines under `PREVIEW — nothing
  // written`, and the test asserted that wording, so the contradiction held.
  // Asserting BOTH modes is what makes the tense load-bearing.
  const { dir } = makeFixture(t);
  addUnmeasurableSkill(dir);

  const preview = run(dir);
  assert.match(preview.stdout, /unchecked for the #498 shape, and would be restored/);

  const written = run(dir, ['--write']);
  assert.match(written.stdout, /unchecked for the #498 shape, and restored/);
  assert.doesNotMatch(written.stdout, /would be restored/);
});

test('the unmeasured counts are labelled as fences, which is what they count', async (t) => {
  // They were labelled "in file(s)", which reads as a file count.
  const { dir } = makeFixture(t);
  addUnmeasurableSkill(dir);

  const r = run(dir);

  const line = r.stdout.split('\n').find((l) => l.includes('this run repairs'));
  assert.ok(line, `no unmeasured disposition line:\n${r.stdout}`);
  assert.match(line, /^\s*\d+ fence\(s\)/, `count is not labelled as fences: ${line}`);
});

// ── the threshold is disclosed on every run ─────────────────────────────────

test('the report states the threshold the run was made at, even with no refusals', async (t) => {
  // It used to print only inside the refusal block, which --fork-threshold 0
  // makes unreachable by construction: containment is in [0, 1], so
  // `containment < 0` never holds and `forks` is always empty. A disabled run
  // and a guarded one emitted byte-identical reports.
  const { dir } = makeFixture(t);

  const guarded = run(dir);
  const off = run(dir, ['--fork-threshold', '0']);

  assert.match(guarded.stdout, /fork threshold: 0\.5/);
  assert.match(off.stdout, /fork threshold: 0\s+\*\*\* DISABLED/);
  assert.notEqual(guarded.stdout, off.stdout, 'a disabled run is indistinguishable from a guarded one');
});

test('--fork-threshold refuses a whitespace value instead of coercing it to 0', async (t) => {
  // Number(' ') is 0, so the range check passed and the guard silently turned
  // off — the disabling value arriving through what looks like a typo.
  const { dir } = makeFixture(t);

  for (const value of [' ', '\t', ' 0.5 ', '0x0', '1e-1', '+0']) {
    const r = run(dir, ['--fork-threshold', value]);
    assert.equal(r.status, 2, `'${value}' was accepted: ${r.stdout}`);
    assert.match(r.stderr, /must be a decimal in \[0, 1\]/);
  }
});
