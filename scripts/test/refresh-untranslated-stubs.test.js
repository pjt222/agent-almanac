/**
 * Pins `tools/refresh-untranslated-stubs.mjs` (#789): a stub becomes English-plus-the-six, a
 * translated mirror is never touched, `--verify` sees divergence, `--stamp` records a commit
 * quoted and only where the bytes already match, and the usage refusals exit 2.
 *
 * The refusal is the property the tool exists to carry across rewrites, so it is pinned four
 * ways: a mirror whose `translator` names a person with a translated body (the case the #793
 * review named), a mirror whose field is absent, a mirror carrying the field twice, and — the
 * case that matters tomorrow — a stub that was refreshed once, hand-translated afterwards, and
 * refreshed again. Each fixture file's bytes are compared before and after, not just the exit
 * code and the log line.
 *
 * Assertions are on PROPERTIES of the written file (body equals English, frontmatter minus the
 * six equals English's, the six carried verbatim at the scaffolder's indent), not on a text
 * built by the tool's own `buildStub`, which would prove nothing. The six themselves are a
 * LITERAL here, pinned against the tool's export and against the scaffolder's own insertion
 * block: the first review of this file found the fixtures, the tool and the partition all
 * reading the same exported list, so a tool that dropped `translation_date` from it would have
 * shrunk every fixture to five fields and passed every test while deleting the field from every
 * stub it rewrote.
 *
 * Proven able to fail with `npm run mutation-check`: disabling the refusal predicate, the
 * divergence comparison, or dropping a field from the tool's list each reddens tests below.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { rmTree } from './_tmp.js';
import {
  TRANSLATION_FIELDS, buildStub, firstDifference, splitFrontmatter, unquote,
} from '../../tools/refresh-untranslated-stubs.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TOOL = join(REPO, 'tools', 'refresh-untranslated-stubs.mjs');
const SCAFFOLDER = join(REPO, 'scripts', 'translate-content.sh');
const STUB = '(untranslated stub)';

/** The six, as a literal — the oracle must not be the list under test. */
const SIX = ['locale', 'source_locale', 'source_commit', 'fence_basis_commit', 'translator', 'translation_date'];

const ENGLISH_SKILL = [
  '---', 'name: demo', 'description: A demo skill, second wording.', 'metadata:',
  '  author: Test', '  version: "1.1"', '---', '', '# Demo', '', '```bash', 'echo v2', '```', '',
].join('\n');

const OLD_ENGLISH_SKILL = ENGLISH_SKILL.replace('second wording', 'first wording').replace('echo v2', 'echo v1');

const ENGLISH_AGENT = [
  '---', 'name: demo-agent', 'description: A demo agent.', 'tools: [Read]', 'version: "1.0.0"',
  '---', '', '# Demo Agent', '', 'Second body.', '',
].join('\n');

const OLD_ENGLISH_AGENT = ENGLISH_AGENT.replace('Second body.', 'First body.');

/** Six-field block, `fields` overriding the defaults; `null` drops a field. */
function six(fields = {}) {
  const values = {
    locale: 'de', source_locale: 'en', source_commit: 'abc1234', fence_basis_commit: 'abc1234',
    translator: `"${STUB}"`, translation_date: '"2026-01-01"', ...fields,
  };
  return SIX.filter((k) => values[k] !== null).map((k) => [k, values[k]]);
}

/** A scaffold-shaped mirror: `english`'s frontmatter, the six inserted before `---`, `english`'s body. */
function scaffold(english, type, fields = {}) {
  const { fm, body } = splitFrontmatter(english);
  const indent = type === 'skills' ? '  ' : '';
  const block = six(fields).map(([k, v]) => `${indent}${k}: ${v}`).join('\n');
  return `---\n${fm}\n${block}\n---\n${body}`;
}

function put(root, rel, text) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text, 'utf8');
  return path;
}

/**
 * de: divergent stub (old English), carries fence_basis_commit.
 * es: clean stub, no fence_basis_commit.
 * fr: clean stub WITH fence_basis_commit (must keep it — nothing changed).
 * ja: translated by a person.
 * zh-CN: stub-shaped but no translator field.
 */
function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'refresh-stubs-'));
  t.after(() => rmTree(dir));
  const paths = {
    en: put(dir, 'skills/demo/SKILL.md', ENGLISH_SKILL),
    de: put(dir, 'i18n/de/skills/demo/SKILL.md', scaffold(OLD_ENGLISH_SKILL, 'skills')),
    es: put(dir, 'i18n/es/skills/demo/SKILL.md', scaffold(ENGLISH_SKILL, 'skills', { locale: 'es', fence_basis_commit: null })),
    fr: put(dir, 'i18n/fr/skills/demo/SKILL.md', scaffold(ENGLISH_SKILL, 'skills', { locale: 'fr' })),
    ja: put(dir, 'i18n/ja/skills/demo/SKILL.md', scaffold(OLD_ENGLISH_SKILL, 'skills', { locale: 'ja', translator: '"Jane Doe"' }).replace('# Demo', '# デモ')),
    zh: put(dir, 'i18n/zh-CN/skills/demo/SKILL.md', scaffold(OLD_ENGLISH_SKILL, 'skills', { locale: 'zh-CN', translator: null })),
    enAgent: put(dir, 'agents/demo-agent.md', ENGLISH_AGENT),
    deAgent: put(dir, 'i18n/de/agents/demo-agent.md', scaffold(OLD_ENGLISH_AGENT, 'agents')),
  };
  // `_config.yml` and `glossaries/` must not be taken for locales.
  put(dir, 'i18n/_config.yml', 'version: "1.0"\n');
  mkdirSync(join(dir, 'i18n', 'glossaries'), { recursive: true });
  return { dir, paths };
}

function run(dir, args) {
  const r = spawnSync(process.execPath, [TOOL, ...args, '--root', dir], { encoding: 'utf8' });
  return { status: r.status, out: r.stdout + r.stderr };
}

function read(path) { return readFileSync(path, 'utf8'); }

/** Lines of the mirror's frontmatter that are one of the six, and the rest. */
function partition(text) {
  const { fm, body } = splitFrontmatter(text);
  const lines = fm.split('\n');
  const isSix = (line) => SIX.some((k) => new RegExp(`^[ \\t]*${k}:`).test(line));
  return { six: lines.filter(isSix), rest: lines.filter((l) => !isSix(l)).join('\n'), body };
}

function gitInit(dir) {
  execFileSync('git', ['-C', dir, 'init', '-q', '-b', 'main']);
  execFileSync('git', ['-C', dir, 'config', 'user.email', 't@example.invalid']);
  execFileSync('git', ['-C', dir, 'config', 'user.name', 'Fixture']);
  execFileSync('git', ['-C', dir, 'add', '-A']);
  execFileSync('git', ['-C', dir, 'commit', '-q', '-m', 'fixture']);
  return execFileSync('git', ['-C', dir, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
}

test('the six are the literal here, the tool exports the same list, and the scaffolder inserts every one of them', () => {
  assert.deepEqual(TRANSLATION_FIELDS, SIX);
  const scaffolder = readFileSync(SCAFFOLDER, 'utf8');
  for (const key of SIX) assert.match(scaffolder, new RegExp(`^  ${key}: `, 'm'), `scaffolder inserts ${key}`);
});

test('refresh: a divergent stub becomes English-plus-the-six minus fence_basis_commit, verbatim fields at the scaffolder indent; clean and non-stub mirrors are left as they are', (t) => {
  const { dir, paths } = fixture(t);
  const before = Object.fromEntries(Object.entries(paths).map(([k, p]) => [k, read(p)]));

  const r = run(dir, ['skills', 'demo']);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /^de: refreshed \(first difference was at line 3; fence_basis_commit dropped until --stamp\)/m);
  assert.match(r.out, /^es: unchanged/m);
  assert.match(r.out, /^fr: unchanged/m);
  assert.match(r.out, /^ja: REFUSED — translator is "Jane Doe"/m);
  assert.match(r.out, /^zh-CN: REFUSED — translator field absent/m);
  assert.match(r.out, /^refresh: 5 mirror\(s\), 3 stub\(s\), 1 written, 2 refused/m);

  const de = partition(read(paths.de));
  const en = splitFrontmatter(ENGLISH_SKILL);
  assert.equal(de.body, en.body, 'body is English, byte for byte');
  assert.equal(de.rest, en.fm, 'frontmatter minus the six is English frontmatter');
  assert.deepEqual(de.six, six({ fence_basis_commit: null }).map(([k, v]) => `  ${k}: ${v}`), 'five carried verbatim, two-space indent, scaffolder order; fence_basis_commit gone');
  assert.match(read(paths.de), /^  translation_date: "2026-01-01"$/m, 'translation_date is untouched');

  for (const k of ['es', 'fr', 'ja', 'zh']) assert.equal(read(paths[k]), before[k], `${k} is untouched`);
  assert.match(read(paths.fr), /^  fence_basis_commit: abc1234$/m, 'a clean stub keeps its fence_basis_commit');
});

test('agents: the six sit at top level, not indented', (t) => {
  const { dir, paths } = fixture(t);
  const r = run(dir, ['agents', 'demo-agent']);
  assert.equal(r.status, 0, r.out);
  const de = partition(read(paths.deAgent));
  const en = splitFrontmatter(ENGLISH_AGENT);
  assert.equal(de.body, en.body);
  assert.equal(de.rest, en.fm);
  assert.deepEqual(de.six, six({ fence_basis_commit: null }).map(([k, v]) => `${k}: ${v}`));
});

test('--locale: naming a refused mirror is exit 1 and still writes nothing; naming a stub refreshes only it; naming a locale with no mirror says so', (t) => {
  const { dir, paths } = fixture(t);
  const jaBefore = read(paths.ja);
  const deBefore = read(paths.de);
  const r1 = run(dir, ['skills', 'demo', '--locale', 'ja']);
  assert.equal(r1.status, 1, r1.out);
  assert.equal(read(paths.ja), jaBefore);
  assert.equal(read(paths.de), deBefore, 'other locales are out of scope under --locale');

  const r2 = run(dir, ['skills', 'demo', '--locale=de']);
  assert.equal(r2.status, 0, r2.out);
  assert.notEqual(read(paths.de), deBefore);
  assert.equal(read(paths.ja), jaBefore);

  mkdirSync(join(dir, 'i18n', 'it', 'skills'), { recursive: true });
  const r3 = run(dir, ['skills', 'demo', '--locale', 'it']);
  assert.equal(r3.status, 2, r3.out);
  assert.match(r3.out, /no mirror of skills\/demo in locale it/);
});

test('the refusal reads the live file: a stub refreshed once, translated afterwards, is refused on the next invocation', (t) => {
  const { dir, paths } = fixture(t);
  assert.equal(run(dir, ['skills', 'demo']).status, 0);
  const translated = read(paths.de).replace(`translator: "${STUB}"`, 'translator: "Erika Muster"').replace('# Demo', '# Vorführung');
  writeFileSync(paths.de, translated, 'utf8');
  const r = run(dir, ['skills', 'demo', '--locale', 'de']);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /^de: REFUSED — translator is "Erika Muster"/m);
  assert.equal(read(paths.de), translated, 'the translation survived the re-run byte for byte');
});

test('the accept rule is the exact scaffolder literal, present exactly once: bare or quoted passes, anything wider or doubled is refused', (t) => {
  const { dir, paths } = fixture(t);
  const variants = [
    ['(untranslated stub)', 'refreshed'],
    ['"(untranslated stub)"', 'refreshed'],
    ["'(untranslated stub)'", 'refreshed'],
    ['"(untranslated stub) reviewed"', 'REFUSED'],
    ['"(untranslated stub)" # reviewed', 'REFUSED'],
    ['"untranslated stub"', 'REFUSED'],
    ['claude', 'REFUSED'],
    ['"Claude + human review"', 'REFUSED'],
  ];
  for (const [value, expected] of variants) {
    writeFileSync(paths.de, scaffold(OLD_ENGLISH_SKILL, 'skills', { translator: value }), 'utf8');
    const r = run(dir, ['skills', 'demo', '--locale', 'de']);
    assert.match(r.out, new RegExp(`^de: ${expected}`, 'm'), `translator: ${value} → ${r.out}`);
  }
  const doubled = scaffold(OLD_ENGLISH_SKILL, 'skills').replace('---\n\n# Demo', `translator: "${STUB}"\n---\n\n# Demo`);
  writeFileSync(paths.de, doubled, 'utf8');
  const r = run(dir, ['skills', 'demo', '--locale', 'de']);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /^de: REFUSED — translator appears 2 times/m);
  assert.equal(read(paths.de), doubled);
});

test('a mirror with CRLF line endings or a byte-order mark is refused by name, not as "no frontmatter"', (t) => {
  const { dir, paths } = fixture(t);
  writeFileSync(paths.de, scaffold(OLD_ENGLISH_SKILL, 'skills').replace(/\n/g, '\r\n'), 'utf8');
  let r = run(dir, ['skills', 'demo', '--locale', 'de']);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /^de: REFUSED — CRLF line endings/m);
  writeFileSync(paths.de, String.fromCharCode(0xfeff) + scaffold(OLD_ENGLISH_SKILL, 'skills'), 'utf8');
  r = run(dir, ['skills', 'demo', '--locale', 'de']);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /^de: REFUSED — file starts with a byte-order mark/m);
});

test('--verify: exit 1 naming the divergent stub and its first differing line, exit 0 once refreshed; refusals are reported and do not redden it', (t) => {
  const { dir } = fixture(t);
  const before = run(dir, ['skills', 'demo', '--verify']);
  assert.equal(before.status, 1, before.out);
  assert.match(before.out, /^de: DIVERGED from English-plus-the-six at line 3 /m);
  assert.match(before.out, /^es: clean/m);
  assert.match(before.out, /^ja: REFUSED/m);
  assert.match(before.out, /^verify: 5 mirror\(s\), 3 stub\(s\), 0 written, 2 refused, 1 diverged/m);

  assert.equal(run(dir, ['skills', 'demo']).status, 0);
  const after = run(dir, ['skills', 'demo', '--verify']);
  assert.equal(after.status, 0, after.out);
  assert.match(after.out, /^de: clean/m);
});

test('an id whose every mirror is refused is exit 2, not a clean-looking zero', (t) => {
  const { dir } = fixture(t);
  put(dir, 'skills/done/SKILL.md', ENGLISH_SKILL.replace('name: demo', 'name: done'));
  put(dir, 'i18n/ja/skills/done/SKILL.md', scaffold(ENGLISH_SKILL.replace('name: demo', 'name: done'), 'skills', { locale: 'ja', translator: '"Jane Doe"' }));
  for (const args of [['skills', 'done'], ['skills', 'done', '--verify']]) {
    const r = run(dir, args);
    assert.equal(r.status, 2, r.out);
    assert.match(r.out, /every mirror of skills\/done was refused \(1 of 1\) — no untranslated stub to (refresh|verify)/);
  }
  // Scoped to that one mirror, the refusal is the ordinary exit 1, not a "could not run".
  const scoped = run(dir, ['skills', 'done', '--locale', 'ja']);
  assert.equal(scoped.status, 1, scoped.out);
  assert.match(scoped.out, /^ja: REFUSED — translator is "Jane Doe"/m);
});

test('--stamp: quotes the sha into both provenance fields of every stub whose bytes match English (refreshed or already clean), adds a missing fence_basis_commit, and leaves non-stubs alone', (t) => {
  const { dir, paths } = fixture(t);
  const sha = gitInit(dir);

  const jaBefore = read(paths.ja);
  // Before a refresh: de diverges, so it is not stamped; es and fr match and are.
  const early = run(dir, ['skills', 'demo', '--stamp', sha]);
  assert.equal(early.status, 1, early.out);
  assert.match(early.out, /^de: NOT STAMPED — diverges from English at line 3/m);
  assert.match(early.out, new RegExp(`^es: stamped "${sha}"`, 'm'));
  assert.match(early.out, new RegExp(`^fr: stamped "${sha}"`, 'm'));
  assert.match(early.out, /^stamp: 5 mirror\(s\), 3 stub\(s\), 2 written, 2 refused, 1 diverged, 0 unstampable/m);
  assert.doesNotMatch(read(paths.de), new RegExp(sha));

  assert.equal(run(dir, ['skills', 'demo']).status, 0);
  const late = run(dir, ['skills', 'demo', `--stamp=${sha}`]);
  assert.equal(late.status, 0, late.out);
  assert.match(late.out, new RegExp(`^de: stamped "${sha}"`, 'm'));
  assert.match(late.out, new RegExp(`^es: already stamped "${sha}"`, 'm'));
  for (const p of [paths.de, paths.es, paths.fr]) {
    const text = read(p);
    assert.match(text, new RegExp(`^  source_commit: "${sha}"$`, 'm'), p);
    assert.match(text, new RegExp(`^  fence_basis_commit: "${sha}"$`, 'm'), p);
  }
  assert.equal(read(paths.ja), jaBefore, 'a translated mirror is not stamped');

  const verify = run(dir, ['skills', 'demo', '--verify']);
  assert.equal(verify.status, 0, `stamped stubs still verify clean: ${verify.out}`);
});

test('--stamp reports a stub with no source_commit line per mirror, keeps going, and exits 1', (t) => {
  const { dir, paths } = fixture(t);
  writeFileSync(paths.fr, scaffold(ENGLISH_SKILL, 'skills', { locale: 'fr', source_commit: null, fence_basis_commit: null }), 'utf8');
  const sha = gitInit(dir);
  const r = run(dir, ['skills', 'demo', '--stamp', sha]);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /^fr: NOT STAMPED — no source_commit line to anchor the stamp on/m);
  assert.match(r.out, new RegExp(`^es: stamped "${sha}"`, 'm'), 'the run continued past the unstampable mirror');
  assert.match(r.out, /1 unstampable/);
});

test('--stamp refuses a sha that is not a commit here, and a value that is not a sha', (t) => {
  const { dir } = fixture(t);
  execFileSync('git', ['-C', dir, 'init', '-q', '-b', 'main']);
  const unknown = run(dir, ['skills', 'demo', '--stamp', 'deadbeef']);
  assert.equal(unknown.status, 2, unknown.out);
  assert.match(unknown.out, /no such commit/);
  const malformed = run(dir, ['skills', 'demo', '--stamp', 'v1.9.1']);
  assert.equal(malformed.status, 2, malformed.out);
  assert.match(malformed.out, /wants an abbreviated or full commit sha/);
});

test('a skill whose English frontmatter has a top-level key after metadata: is refused, never rewritten into nested-under-a-scalar YAML', (t) => {
  const { dir, paths } = fixture(t);
  const deBefore = read(paths.de);
  writeFileSync(paths.en, ENGLISH_SKILL.replace('  version: "1.1"\n---', '  version: "1.1"\nlicense: MIT\n---'), 'utf8');
  const r = run(dir, ['skills', 'demo']);
  assert.equal(r.status, 2, r.out);
  assert.match(r.out, /top-level key after `metadata:` \(license\)/);
  assert.equal(read(paths.de), deBefore, 'nothing was written');
});

test('usage refusals are exit 2, never a clean-looking zero', (t) => {
  const { dir } = fixture(t);
  put(dir, 'skills/lonely/SKILL.md', ENGLISH_SKILL.replace('name: demo', 'name: lonely'));
  const cases = [
    [['widgets', 'demo'], /unknown content type 'widgets'/],
    [['skills', 'nope'], /no English source/],
    [['skills', 'lonely'], /no mirror of skills\/lonely in any locale/],
    [['skills'], /expected <content-type> <id>/],
    [['skills', 'demo', '--verify', '--stamp', 'abc1234'], /separate runs/],
    [['skills', 'demo', '--locale', 'xx'], /no locale directory i18n\/xx/],
    [['skills', 'demo', '--bogus'], /unknown argument/],
  ];
  for (const [args, message] of cases) {
    const r = run(dir, args);
    assert.equal(r.status, 2, `${args.join(' ')} → ${r.out}`);
    assert.match(r.out, message, args.join(' '));
  }
  assert.equal(run(dir, ['skills', 'demo', '--help']).status, 0);
});

test('helpers: buildStub, firstDifference, unquote', () => {
  const built = buildStub(ENGLISH_SKILL, { locale: 'de', translator: `"${STUB}"` }, 'skills');
  assert.equal(splitFrontmatter(built).body, splitFrontmatter(ENGLISH_SKILL).body);
  assert.match(built, /\n  locale: de\n  translator: "\(untranslated stub\)"\n---\n/);
  assert.equal(buildStub(ENGLISH_AGENT, {}, 'agents'), ENGLISH_AGENT, 'no carried fields → English byte for byte');
  assert.equal(firstDifference('a\nb\nc', 'a\nb\nc'), 0);
  assert.equal(firstDifference('a\nb\nc', 'a\nB\nc'), 2);
  assert.equal(firstDifference('a\nb', 'a\nb\nc'), 3);
  assert.equal(unquote('"x"'), 'x');
  assert.equal(unquote("'x'"), 'x');
  assert.equal(unquote('x'), 'x');
  assert.equal(unquote('"x'), '"x', 'an unbalanced quote is not stripped');
  assert.equal(unquote(null), null);
});
