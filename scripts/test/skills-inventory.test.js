/**
 * The content-tree inventory that SECURITY.md publishes (#691 findings 2 and 3).
 *
 * These functions were inline in `scripts/generate-readmes.js`, which runs its pipeline
 * and calls `process.exit` at import time — so nothing could import them and nothing did
 * test them. The properties they carry are precisely the kind a refactor breaks in
 * silence: a directory walk instead of a registry enumeration, or an extension allowlist
 * instead of an exclusion, each shipping green while a published figure drifts.
 *
 * Fixtures are hermetic `mkdtemp` trees, not the real repository, so the failure branches
 * are reachable — on a green main every one of them is unreachable by construction. Two
 * tests deliberately use the REAL tree, to pin that the fixtures are not testing a
 * different function than the generator calls.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rmTree } from './_tmp.js';
import {
  skillsDeclaringBash,
  nonDocumentationFiles,
  shippedEntries,
  contentTrees,
  executableFiles,
  extensionOf,
  assertInventoryClaims,
  REPO_ONLY,
  INSTALL_HOOKS,
} from '../lib/skills-inventory.js';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

const BASH_SKILL = '---\nname: x\nallowed-tools: Read, Bash, Grep\n---\n\n# X\n';
const QUIET_SKILL = '---\nname: y\nallowed-tools: Read, Grep\n---\n\n# Y\n';

/** A tree with the skills named, plus a `_template` that declares Bash — as the real one does. */
function makeTree(t, skills, files = ['skills/', '!skills/_template/']) {
  const dir = mkdtempSync(join(tmpdir(), 'skills-inventory-'));
  t.after(() => rmTree(dir));
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ files }), 'utf8');
  for (const [id, body] of Object.entries(skills)) {
    mkdirSync(join(dir, 'skills', id), { recursive: true });
    writeFileSync(join(dir, 'skills', id, 'SKILL.md'), body, 'utf8');
  }
  mkdirSync(join(dir, 'skills', '_template'), { recursive: true });
  writeFileSync(join(dir, 'skills', '_template', 'SKILL.md'), BASH_SKILL, 'utf8');
  return dir;
}

const domainsOf = (...ids) => ({ d: { skills: ids.map((id) => ({ id })) } });

test('counts REGISTRY entries; a naive directory walk would report 2 of 3, not 1 of 2', (t) => {
  const dir = makeTree(t, { alpha: BASH_SKILL, beta: QUIET_SKILL });

  const { ids, declaring } = skillsDeclaringBash(dir, domainsOf('alpha', 'beta'));

  // THE property. `skills/_template/` exists on disk and declares Bash, so a walk would
  // report 2 of 3. The registry does not list it, so the answer is 1 of 2. A refactor to
  // a directory walk gains one in EACH term and stays green everywhere else (#669).
  assert.equal(ids.length, 2, '_template must not be counted as a skill');
  assert.equal(declaring, 1, '_template must not be counted as declaring Bash');
});

test('a registry id with no SKILL.md THROWS, and does not count as non-declaring', (t) => {
  // The old form was `existsSync(file) && declaresBash(...)`, which silently returned
  // false — under-reporting the Bash share in a security document, which is the
  // dangerous direction. #691 claims A4/A5 make this unreachable; they gate the AGENT
  // and TEAM registries, so it is reachable, and the realistic path is a renamed
  // directory that leaves the count check undisturbed (#700).
  const dir = makeTree(t, { alpha: BASH_SKILL });

  assert.throws(
    () => skillsDeclaringBash(dir, domainsOf('alpha', 'renamed-away')),
    /lists 1 skill\(s\) with no SKILL\.md/,
  );
});

test('every missing id is named, not just the first', (t) => {
  const dir = makeTree(t, { alpha: BASH_SKILL });
  assert.throws(
    () => skillsDeclaringBash(dir, domainsOf('alpha', 'gone-a', 'gone-b')),
    (e) => e.message.includes('gone-a') && e.message.includes('gone-b'),
  );
});

test('non-documentation files are found by EXCLUSION, including extensions nobody expected', (t) => {
  // An earlier pass over this same question enumerated `.py` and `.webp` and missed ten
  // `.bib` files. An allowlist of "interesting" extensions would have shipped that
  // undercount and stayed green, so the rule is: not .md/.yml/.yaml counts.
  const dir = makeTree(t, { alpha: BASH_SKILL });
  mkdirSync(join(dir, 'skills', 'alpha', 'references'), { recursive: true });
  mkdirSync(join(dir, 'skills', 'alpha', 'scripts'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'alpha', 'references', 'CITATIONS.bib'), '@x{}\n', 'utf8');
  writeFileSync(join(dir, 'skills', 'alpha', 'scripts', 'run.py'), 'print(1)\n', 'utf8');
  writeFileSync(join(dir, 'skills', 'alpha', 'notes.yaml'), 'a: 1\n', 'utf8');
  writeFileSync(join(dir, 'skills', 'alpha', 'diagram.svg'), '<svg/>\n', 'utf8');

  assert.deepEqual(nonDocumentationFiles(dir, ['skills']), [
    'skills/alpha/diagram.svg',
    'skills/alpha/references/CITATIONS.bib',
    'skills/alpha/scripts/run.py',
  ]);
});

test('the walk excludes exactly what the package excludes, from files negations', (t) => {
  const dir = makeTree(t, { alpha: BASH_SKILL });
  writeFileSync(join(dir, 'skills', '_template', 'scaffold.py'), 'pass\n', 'utf8');

  assert.deepEqual(nonDocumentationFiles(dir, ['skills']), [],
    '`!skills/_template/` excludes it from the package, so it must not be counted');
});

test('a NESTED _template ships, and must be counted — npm negations are root-anchored', (t) => {
  // The first version skipped any entry named `_template` at ANY depth. That was a 55th
  // hand-rolled exclusion site (#672) and it disagreed with npm: `!skills/_template/` is a
  // root-anchored gitignore-style pattern, so `skills/<id>/_template/helper.py` SHIPS.
  // The inventory would have published 16 while 17 shipped, under a sentence that says
  // "all of it ships".
  const dir = makeTree(t, { alpha: BASH_SKILL });
  mkdirSync(join(dir, 'skills', 'alpha', '_template'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'alpha', '_template', 'helper.py'), 'pass\n', 'utf8');

  assert.deepEqual(nonDocumentationFiles(dir, ['skills']), ['skills/alpha/_template/helper.py']);
});

test('the negation is ANCHORED, not a substring — a mid-path match must not exclude', (t) => {
  // Found by a surviving mutant: swapping `startsWith` for `includes` passed the whole
  // suite, because no fixture distinguished them. `skills/alpha/_template/` does not
  // CONTAIN `skills/_template/`, so the nested-template test above passes either way.
  // This one does distinguish: under `includes`, the negation `alpha/_template/` would
  // wrongly exclude a path npm ships, and the published count would silently drop.
  const dir = makeTree(t, { alpha: BASH_SKILL }, ['skills/', '!alpha/_template/']);
  mkdirSync(join(dir, 'skills', 'alpha', '_template'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'alpha', '_template', 'helper.py'), 'pass\n', 'utf8');

  assert.deepEqual(nonDocumentationFiles(dir, ['skills']), ['skills/alpha/_template/helper.py'],
    'the pattern does not match from the ROOT, so it excludes nothing');
});

test('a non-negation exclusion rule is NOT invented — the files array is the only source', (t) => {
  // With no negation, `_template` ships and is counted. The exclusion must come from the
  // package's own list, never from a name this module recognises.
  const dir = makeTree(t, { alpha: BASH_SKILL }, ['skills/']);
  writeFileSync(join(dir, 'skills', '_template', 'scaffold.py'), 'pass\n', 'utf8');

  assert.deepEqual(nonDocumentationFiles(dir, ['skills']), ['skills/_template/scaffold.py']);
});

test('a tree that does not exist is skipped rather than throwing', (t) => {
  const dir = makeTree(t, { alpha: BASH_SKILL });
  assert.deepEqual(nonDocumentationFiles(dir, ['skills', 'nonexistent']), []);
});

test('shippedEntries keeps FILES, not only directories — cli/index.js is the entry point', (t) => {
  // The version this replaces filtered to `endsWith('/')`, which silently dropped
  // `cli/index.js` — the file `npx agent-almanac` executes, and one that `bin` forces into
  // the package regardless. The generated sentence therefore told a researcher that a
  // vulnerability in the entry point was "against the repository only". That is #600's
  // failure mode (a bullet naming 5 of 13 adapters) in freshly authored security prose —
  // and the test written alongside it PINNED the behaviour instead of catching it.
  const dir = mkdtempSync(join(tmpdir(), 'skills-inventory-'));
  t.after(() => rmTree(dir));
  writeFileSync(join(dir, 'package.json'), JSON.stringify({
    files: ['cli/lib/', 'cli/index.js', 'skills/', '!skills/_template/', 'agents/', 'LICENSE'],
  }), 'utf8');

  const { included, negations } = shippedEntries(dir);
  assert.deepEqual(included, ['cli/lib/', 'cli/index.js', 'skills/', 'agents/', 'LICENSE']);
  assert.ok(included.includes('cli/index.js'), 'the entry point must appear in the shipped list');
  assert.deepEqual(negations, ['skills/_template/']);
});

test('contentTrees is the CONTENT_TYPES intersection, not "everything that is not cli/"', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'skills-inventory-'));
  t.after(() => rmTree(dir));
  writeFileSync(join(dir, 'package.json'), JSON.stringify({
    files: ['cli/lib/', 'cli/index.js', 'skills/', 'agents/', 'LICENSE'],
  }), 'utf8');

  assert.deepEqual(contentTrees(dir), ['skills', 'agents']);
});

test('a shipped directory that no bullet describes THROWS, rather than being scanned', (t) => {
  // The version this replaces filtered on `!startsWith('cli/')` — a coincidence promoted to
  // a rule — and the test beside it shipped `dreams/` and ASSERTED it was accepted as a
  // content tree. So the test pinned the defect, for the second time in this PR.
  //
  // Ship `dreams/` for real and the first bullet's COUNT would include its files while the
  // bullet's LABEL still read "Skills, agents, teams, guides": the same drift pair one level
  // up, between a count and the label describing it. What makes a tree a content tree is
  // CONTENT_TYPES, not its not-being-cli.
  const dir = mkdtempSync(join(tmpdir(), 'skills-inventory-'));
  t.after(() => rmTree(dir));
  writeFileSync(join(dir, 'package.json'), JSON.stringify({
    files: ['cli/lib/', 'skills/', 'dreams/'],
  }), 'utf8');

  assert.throws(() => contentTrees(dir), /neither the CLI nor a content type/);
});

test('a files entry this matcher cannot faithfully interpret is REFUSED, not guessed at', (t) => {
  // The negation model is "trailing slash means prefix, otherwise exact path". It matches
  // the real array and diverges on shapes it does not yet contain — every one of which
  // fails SILENTLY and in the under-counting direction.
  const dir = mkdtempSync(join(tmpdir(), 'skills-inventory-'));
  t.after(() => rmTree(dir));
  mkdirSync(join(dir, 'skills', '_template'), { recursive: true });

  writeFileSync(join(dir, 'package.json'), JSON.stringify({
    files: ['skills/', '!skills/*/fixtures/'],
  }), 'utf8');
  assert.throws(() => shippedEntries(dir), /contains a glob/,
    'npm expands globs; this module compares literally, so the two would disagree in silence');

  // One deleted character. npm excludes the directory and its contents; this matcher can
  // never match it, because `walk` appends the slash before testing — and on a tree whose
  // `_template` holds only a `.md`, even the count would not move. The quietest failure.
  writeFileSync(join(dir, 'package.json'), JSON.stringify({
    files: ['skills/', '!skills/_template'],
  }), 'utf8');
  assert.throws(() => shippedEntries(dir), /negates a DIRECTORY without a trailing/);

  // And the interpretable form is accepted, so the tripwire is not simply "refuse".
  writeFileSync(join(dir, 'package.json'), JSON.stringify({
    files: ['skills/', '!skills/_template/', '!agents/_template.md'],
  }), 'utf8');
  assert.deepEqual(shippedEntries(dir).negations, ['skills/_template/', 'agents/_template.md']);
});

test('the EXACT-match negation arm is live — a negated non-doc FILE is excluded', (t) => {
  // Found as a surviving mutant: replacing the `relPath === pattern` arm with `false` passed
  // the whole suite, because every file negation in the real array names a `.md`, which the
  // extension filter drops anyway. Observationally dead — the shape of the hand-rolled rule
  // this PR already deleted once.
  const dir = makeTree(t, { alpha: BASH_SKILL }, ['skills/', '!skills/alpha/data.py']);
  writeFileSync(join(dir, 'skills', 'alpha', 'data.py'), 'x = 1\n', 'utf8');
  writeFileSync(join(dir, 'skills', 'alpha', 'kept.py'), 'y = 2\n', 'utf8');

  assert.deepEqual(nonDocumentationFiles(dir, ['skills']), ['skills/alpha/kept.py']);
});

test('a package.json with no files array yields nothing, rather than throwing', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'skills-inventory-'));
  t.after(() => rmTree(dir));
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'x' }), 'utf8');

  assert.deepEqual(shippedEntries(dir), { included: [], negations: [] });
  assert.deepEqual(contentTrees(dir), []);
});

test('a shebanged EXTENSIONLESS file counts as executable', (t) => {
  // The extension allowlist under-claims in the quiet direction, and this module's own
  // sibling JSDoc bans allowlists for the neighbouring question. Such a file is doubly
  // invisible: the regex misses it AND extensionOf returns null, so it is counted while no
  // extension names it — "17 files (.bib, .py, .webp)" enumerating sixteen.
  const dir = makeTree(t, { alpha: BASH_SKILL });
  mkdirSync(join(dir, 'skills', 'alpha', 'scripts'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'alpha', 'scripts', 'run'), '#!/bin/sh\necho hi\n', 'utf8');
  writeFileSync(join(dir, 'skills', 'alpha', 'scripts', 'data'), 'not a script\n', 'utf8');

  const nonDoc = nonDocumentationFiles(dir, ['skills']);
  assert.deepEqual(nonDoc, ['skills/alpha/scripts/data', 'skills/alpha/scripts/run']);
  assert.deepEqual(executableFiles(nonDoc, dir), ['skills/alpha/scripts/run']);
});

test('the executable exemplar is DERIVED, so deleting the file cannot leave it named', () => {
  // The generated sentence used to interpolate `verify_runtime.py` as a string literal —
  // static prose inside a derived claim, which is the exact defect the same function
  // polices ten lines up. Deleting that one file (registry and SKILL.md untouched, so
  // nothing throws) would have had the healer regenerate and AUTO-COMMIT "15 files …
  // including verify_runtime.py": a false claim in a security document, every gate green.
  assert.deepEqual(
    executableFiles([
      'skills/a/refs/x.bib', 'skills/b/scripts/run.py', 'skills/c/e/i.webp',
      'skills/d/scripts/go.sh', 'skills/e/analysis.R',
    ]),
    ['skills/b/scripts/run.py', 'skills/d/scripts/go.sh', 'skills/e/analysis.R'],
  );
  assert.deepEqual(executableFiles(['skills/a/refs/x.bib']), [],
    'with no executable present the sentence must be able to omit the clause entirely');
});

test('extensionOf does not fabricate an extension out of a path that has none', () => {
  // `path.slice(path.lastIndexOf('.'))` fabricated on two plausible inputs, and both would
  // have rendered into a security document as fact.
  assert.equal(extensionOf('skills/foo/LICENSE'), null, 'lastIndexOf -1 used to yield "E"');
  assert.equal(extensionOf('skills/foo.bar/LICENSE'), null, 'a dot in a DIRECTORY name');
  assert.equal(extensionOf('skills/foo/.hidden'), null, 'a dotfile has no extension');
  assert.equal(extensionOf('skills/foo/x.tar.gz'), '.gz');
  assert.equal(extensionOf('skills/foo/run.py'), '.py');
});

// ── against the real tree, so the fixtures cannot drift from the generator ───

test('LIVE: the real registry resolves — every listed skill exists on disk', async () => {
  const { load } = await import('js-yaml');
  const { readFileSync } = await import('node:fs');
  const registry = load(readFileSync(join(REPO_ROOT, 'skills', '_registry.yml'), 'utf8'));

  const { ids, declaring } = skillsDeclaringBash(REPO_ROOT, registry.domains || registry);

  assert.ok(ids.length > 0, 'the registry must not be empty');
  assert.ok(declaring > 0 && declaring < ids.length, 'the Bash share must be a real fraction');
  assert.ok(!ids.includes('_template'), 'the registry must not list _template');
});

test('LIVE: the real tree still contains the exception the claim was false about', () => {
  // Renamed: the previous name said "what SECURITY.md publishes" and never read
  // SECURITY.md. Two of its three assertions were also dead — `startsWith(tree/)` is a
  // tautology, since the walk BUILDS paths from those roots and cannot fail it under any
  // mutation, and the `_template` assertion is vacuous on the real tree, which holds only
  // a `.md` there. Nothing asserted non-emptiness, so `return []` passed it.
  const found = nonDocumentationFiles(REPO_ROOT);

  assert.ok(found.length > 0,
    'the claim "Markdown and YAML documentation" was FALSE; if this ever reaches zero the '
    + 'generator must say so rather than the sentence quietly reverting to the flat assertion');
  // An independent ruler for the exclusion — a second regex, not the module's own list.
  for (const path of found) assert.ok(!/\.(md|ya?ml)$/.test(path), `documentation leaked in: ${path}`);
  assert.ok(executableFiles(found, REPO_ROOT).length > 0,
    'and at least one of them is executable, which is the whole point of the sentence');
});

// ── the claims the inventory makes about what does NOT ship ─────────────────

test('every repository-only claim is guarded, not just the two that had throws', (t) => {
  // The previous revision kept the sentence's list in `generate-readmes.js` and guarded
  // two of its four names. A mutation shrinking that list SURVIVED the whole suite,
  // because that file runs its pipeline on import and no test can reach anything in it.
  // Moving the list here is what makes this test possible at all.
  const dir = mkdtempSync(join(tmpdir(), 'skills-inventory-'));
  t.after(() => rmTree(dir));

  assert.ok(REPO_ONLY.length >= 4, 'the sentence names at least four directories');
  for (const name of REPO_ONLY) {
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ files: ['skills/', `${name}/`] }), 'utf8');
    assert.throws(
      () => assertInventoryClaims(dir),
      new RegExp(`${name.replace('.', '\\.')}/ exists only in the repository`),
      `shipping ${name}/ must contradict the sentence loudly, not silently`,
    );
  }

  writeFileSync(join(dir, 'package.json'), JSON.stringify({ files: ['skills/'] }), 'utf8');
  assert.doesNotThrow(() => assertInventoryClaims(dir), 'and the honest arrangement passes');
});

test('an install-time script hook contradicts the sentence and throws', (t) => {
  // `package.json` always ships, and install hooks run in a CONSUMER's tree. There are
  // none today; the sentence says so, and this is what keeps the saying true.
  const dir = mkdtempSync(join(tmpdir(), 'skills-inventory-'));
  t.after(() => rmTree(dir));

  for (const hook of INSTALL_HOOKS) {
    writeFileSync(join(dir, 'package.json'),
      JSON.stringify({ files: ['skills/'], scripts: { [hook]: 'node evil.js' } }), 'utf8');
    assert.throws(() => assertInventoryClaims(dir), new RegExp(`declares "${hook}"`));
  }

  // A publisher-side hook is not an install-time one and must NOT trip it.
  writeFileSync(join(dir, 'package.json'),
    JSON.stringify({ files: ['skills/'], scripts: { prepublishOnly: 'npm run test:cli' } }), 'utf8');
  assert.doesNotThrow(() => assertInventoryClaims(dir));
});

test('LIVE: SECURITY.md names exactly the directories the guard covers', () => {
  // The drift this closes: the sentence is rendered from REPO_ONLY, so shrinking that list
  // silently drops guards AND shortens the sentence. Comparing the COMMITTED document
  // against the list is what makes such a change go red rather than regenerate quietly.
  const security = readFileSync(join(REPO_ROOT, 'SECURITY.md'), 'utf8');
  // Scoped to the AUTO block. Matching the whole file takes the FIRST occurrence, so a future
  // hand-written quotation of this sentence above the block would become the compared
  // instance — a stale decoy failing against a correct generated one, and three spurious
  // failures in a row is how an equality assertion gets weakened into an `includes`.
  const block = security.match(/<!-- AUTO:START:security-surface -->([\s\S]*?)<!-- AUTO:END/);
  assert.ok(block, 'the security-surface AUTO block must be present');
  const sentence = block[1].match(/Everything else described below \(([^)]*)\)/);

  assert.ok(sentence, 'the repository-only sentence must be present in SECURITY.md');
  const named = sentence[1].split(',').map((n) => n.replace(/[`\/\s]/g, '')).filter(Boolean);
  assert.deepEqual(named, [...REPO_ONLY],
    'the published sentence and the guarded list must be the same list');
});

test('an unanchored negation is refused — measured against npm, not reasoned about', (t) => {
  // `npm pack --dry-run` with files ["agents/","!_template.md"] packs ZERO of
  // agents/_template.md, against a control (["agents/"]) that packs it. So npm matches a
  // slash-free pattern at any depth while this module compares exact paths and matches
  // nothing — silent, and in the under-counting direction.
  const dir = mkdtempSync(join(tmpdir(), 'skills-inventory-'));
  t.after(() => rmTree(dir));
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ files: ['agents/', '!_template.md'] }), 'utf8');

  assert.throws(() => shippedEntries(dir), /unanchored negation/);
});

test('extglob metacharacters are refused too, not only the plain glob ones', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'skills-inventory-'));
  t.after(() => rmTree(dir));
  for (const entry of ['skills/+(a|b)/', 'skills/@(x)/', 'skills/foo|bar/']) {
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ files: [entry] }), 'utf8');
    assert.throws(() => shippedEntries(dir), /glob or extglob/, `${entry} must be refused`);
  }
  // And a leading `!` is not itself an extglob character — the negation form must still pass.
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ files: ['skills/', '!skills/_template/'] }), 'utf8');
  assert.doesNotThrow(() => shippedEntries(dir));
});

test('`prepare` counts as an install hook, because a git install runs it', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'skills-inventory-'));
  t.after(() => rmTree(dir));
  writeFileSync(join(dir, 'package.json'),
    JSON.stringify({ files: ['skills/'], scripts: { prepare: 'node build.js' } }), 'utf8');

  assert.throws(() => assertInventoryClaims(dir), /declares "prepare"/);
});

test('an unreadable candidate throws rather than reading as "not executable"', (t) => {
  // The bare catch this replaces made the same tolerant choice `skillsDeclaringBash` rejects
  // ten lines up in the same file, and in the same under-reporting direction.
  const dir = mkdtempSync(join(tmpdir(), 'skills-inventory-'));
  t.after(() => rmTree(dir));
  mkdirSync(join(dir, 'skills'), { recursive: true });

  assert.throws(
    () => executableFiles(['skills/does-not-exist'], dir),
    /could not read skills\/does-not-exist to test for a shebang/,
  );
});
