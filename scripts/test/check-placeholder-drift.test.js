/**
 * Tests for `scripts/check-placeholder-drift.js` (#497).
 *
 * The detector this replaces returned 0 on the batch that introduced the defect
 * it existed to find, because its filter had been tuned from 216 false positives
 * down to 0 with no confirmed true positive to test against. So the first
 * obligation of this suite is to pin the true positive by SHAPE — a plain
 * lowercase placeholder, which is the form the old filter could not express —
 * and to prove the rejected predicate still cannot see it.
 *
 * Every fixture is a throwaway git repo with two commits: a translation, then
 * the restore that would introduce the drift. That is the shape the tool reads,
 * and it keeps a run under a second.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { rmTree } from './_tmp.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = 'scripts/check-placeholder-drift.js';

function git(cwd, args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${args.join(' ')} failed: ${r.stderr}`);
  return r.stdout.trim();
}

function run(dir, args = []) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd: dir, encoding: 'utf8' });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

function json(dir, args = []) {
  const r = run(dir, [...args, '--json']);
  assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
  return JSON.parse(r.stdout);
}

/**
 * `before` and `after` are the two revisions of one translated file. The tool
 * resolves ROOT from `__dirname/..`, so it always reads the tree it sits in.
 */
function makeFixture(t, before, after) {
  const dir = mkdtempSync(join(tmpdir(), 'drift-'));
  t.after(() => rmTree(dir));

  mkdirSync(join(dir, 'scripts'), { recursive: true });
  cpSync(join(REPO, SCRIPT), join(dir, SCRIPT));
  cpSync(join(REPO, 'scripts', 'lib'), join(dir, 'scripts', 'lib'), { recursive: true });
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ type: 'module' }), 'utf8');

  git(dir, ['init', '-b', 'main']);
  git(dir, ['config', 'user.email', 'test@example.invalid']);
  git(dir, ['config', 'user.name', 'Fixture']);

  const p = join(dir, 'i18n', 'de', 'skills', 'demo', 'SKILL.md');
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, before, 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'translation']);

  writeFileSync(p, after, 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'restore frozen fences to English']);
  return dir;
}

/** The real #496 defect, reduced: a plain lowercase placeholder in a bash fence. */
const PAKETNAME_BEFORE = [
  '---', 'name: demo', 'locale: de', '---', '',
  '# Demo', '',
  'Eine `# paketname x.y.z`-Ueberschrift zu NEWS.md hinzufuegen.', '',
  '```bash', 'git commit -m "Release paketname v0.2.0"', '```', '',
  '```markdown', '# paketname 0.2.0', '```', '',
].join('\n');
const PAKETNAME_AFTER = PAKETNAME_BEFORE.replace(
  'git commit -m "Release paketname v0.2.0"',
  'git commit -m "Release packagename v0.2.0"',
);

test('the real defect is found: a plain lowercase placeholder renamed in a frozen fence', async (t) => {
  const dir = makeFixture(t, PAKETNAME_BEFORE, PAKETNAME_AFTER);

  const r = json(dir);

  assert.equal(r.findings.length, 1, JSON.stringify(r.findings));
  assert.equal(r.findings[0].removed, 'paketname');
  assert.equal(r.findings[0].added, 'packagename');
  assert.equal(r.findings[0].register, 'inline-code');
});

test('the rejected code-shape predicate provably cannot express the defect', async (t) => {
  // `paketname` is a plain lowercase word: not snake_case, CONSTANT_CASE,
  // kebab-case, dotted.path or camelCase. This is the whole reason the previous
  // detector returned 0 on the batch that introduced it, and the reason the
  // predicate here keys on structure instead of shape.
  const dir = makeFixture(t, PAKETNAME_BEFORE, PAKETNAME_AFTER);

  const r = json(dir, ['--compare']);

  assert.equal(r.findings.length, 1);
  assert.equal(r.alternatives.codeShaped, 0, 'a code-shape filter would have caught it after all');
});

test('a retranslation is not a rename — more than one token changed', async (t) => {
  // The same #496 commit rewrote a whole commit message from German to English.
  // Requiring exactly one differing token separates that from a placeholder
  // rename without knowing what the token looks like.
  // The prose cites BOTH the first and the last differing token. Without that,
  // this test passes on a build with the exactly-one guard deleted: `at` would
  // simply end on the last differing index, report `beginnen`, and find it
  // uncited — so the assertion held for the wrong reason and the mutant lived.
  const before = [
    '---', 'name: demo', 'locale: de', '---', '',
    'Siehe `Entwicklung` und `beginnen`.', '',
    '```bash', 'git commit -m "Entwicklung fuer naechste Version beginnen"', '```', '',
  ].join('\n');
  const after = before.replace(
    'git commit -m "Entwicklung fuer naechste Version beginnen"',
    'git commit -m "Begin development for next version"',
  );
  const dir = makeFixture(t, before, after);

  assert.equal(json(dir).findings.length, 0);
});

test('a rename whose old form is cited NOWHERE is not reported', async (t) => {
  // Restoring a frozen fence is the point of the repair. It only becomes drift
  // when the old form survives somewhere the reader still sees.
  const before = [
    '---', 'name: demo', 'locale: de', '---', '',
    'Kein Zitat hier.', '',
    '```bash', 'git commit -m "Release paketname v0.2.0"', '```', '',
  ].join('\n');
  const after = before.replace('paketname', 'packagename');
  const dir = makeFixture(t, before, after);

  assert.equal(json(dir).findings.length, 0);
});

test('a citation in an exempt fence alone is reported, but in the weaker register', async (t) => {
  // Batch 1's four `von` -> `from` hits are exactly this shape and are all
  // ordinary German. They are sorted last rather than dropped: with one
  // confirmed true positive on record, filtering here is how the previous
  // detector deleted its own target class.
  const before = [
    '---', 'name: demo', 'locale: de', '---', '',
    '```text', 'Reduziere die Geschwindigkeit von 50.', '```', '',
    '```yaml', 'perimeter_speed: 40mm/s (von 50)', '```', '',
  ].join('\n');
  const after = before.replace('(von 50)', '(from 50)');
  const dir = makeFixture(t, before, after);

  const r = json(dir);

  assert.equal(r.findings.length, 1);
  assert.equal(r.findings[0].register, 'exempt-fence');
});

test('the two registers are reported separately in the human output', async (t) => {
  const dir = makeFixture(t, PAKETNAME_BEFORE, PAKETNAME_AFTER);

  const r = run(dir);

  assert.equal(r.status, 0);
  assert.match(r.stdout, /1 cited in inline-code · 0 cited only as a word in an exempt fence/);
  assert.match(r.stdout, /\(cited in inline-code\)/);
});

test('an exempt fence is never itself treated as a frozen fence', async (t) => {
  // Localisable fences are what a translation exists to change; reading a
  // substitution out of one would report every translated table.
  // `offen` must be cited, or the exempt-fence check is untested: with the
  // `isGated` guard removed this fence IS read as frozen, yielding the
  // substitution `offen` -> `open`, and only a citation makes that observable.
  const before = [
    '---', 'name: demo', 'locale: de', '---', '',
    'Siehe `Status`, derzeit `offen`.', '',
    '```text', 'Status: offen', '```', '',
  ].join('\n');
  const after = before.replace('```text\nStatus: offen', '```text\nStatus: open');
  const dir = makeFixture(t, before, after);

  assert.equal(json(dir).findings.length, 0);
});

// ── the alignment ───────────────────────────────────────────────────────────

test('a fence that gained a line is still examined', async (t) => {
  // Index pairing, which the LCS alignment replaces, could only read a fence
  // whose two bodies had the same line count — 67 of batch 1's 172 changed
  // fences failed that and went unexamined while reporting nothing.
  const before = [
    '---', 'name: demo', 'locale: de', '---', '',
    'Eine `paketname`-Ueberschrift.', '',
    '```bash', 'git add DESCRIPTION', 'git commit -m "Release paketname"', '```', '',
  ].join('\n');
  const after = [
    '---', 'name: demo', 'locale: de', '---', '',
    'Eine `paketname`-Ueberschrift.', '',
    '```bash', 'git add DESCRIPTION', 'git add NEWS.md', 'git commit -m "Release packagename"', '```', '',
  ].join('\n');
  const dir = makeFixture(t, before, after);

  const r = json(dir);

  assert.equal(r.unalignedFences, 0);
  assert.equal(r.findings.length, 1, JSON.stringify(r.findings));
  assert.equal(r.findings[0].removed, 'paketname');
});

test('the reported line number points at the changed line in the NEW revision', async (t) => {
  const dir = makeFixture(t, PAKETNAME_BEFORE, PAKETNAME_AFTER);

  const r = json(dir);
  const lines = PAKETNAME_AFTER.split('\n');

  assert.ok(
    lines[r.findings[0].line - 1].includes('packagename'),
    `line ${r.findings[0].line} is ${JSON.stringify(lines[r.findings[0].line - 1])}`,
  );
});

// ── the no-op guard ─────────────────────────────────────────────────────────

test('a range touching no i18n file is an error, not a clean-looking zero', async (t) => {
  const dir = makeFixture(t, PAKETNAME_BEFORE, PAKETNAME_AFTER);
  writeFileSync(join(dir, 'README.md'), 'unrelated\n', 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'unrelated change']);

  const r = run(dir);

  assert.equal(r.status, 2);
  assert.match(r.stderr, /no i18n\/\*\.md changed/);
});

test('an unresolvable ref is an error', async (t) => {
  const dir = makeFixture(t, PAKETNAME_BEFORE, PAKETNAME_AFTER);

  const r = run(dir, ['--base', 'no-such-ref']);

  assert.equal(r.status, 2);
  assert.match(r.stderr, /does not resolve to a commit/);
});

test('an unknown argument is an error, not a silently narrower run', async (t) => {
  const dir = makeFixture(t, PAKETNAME_BEFORE, PAKETNAME_AFTER);

  const r = run(dir, ['--basis', 'HEAD~1']);

  assert.equal(r.status, 2);
  assert.match(r.stderr, /unknown argument/);
});

test('findings do not fail the run — it is advisory by design', async (t) => {
  // A gate that must be overridden routinely trains the reflex #472 exists to
  // prevent, and one of the hits on the batch this was built from is a
  // legitimate English output string a human must dismiss.
  const dir = makeFixture(t, PAKETNAME_BEFORE, PAKETNAME_AFTER);

  const r = run(dir);

  assert.equal(r.status, 0);
  assert.match(r.stdout, /ADVISORY/);
});

test('change blocks are scoped by matching context, so distant lines are not paired', async (t) => {
  // The cross product inside a block is safe only because a block is bounded by
  // lines that match. Merge adjacent blocks and it spans the whole fence, and
  // the FIRST changed line starts pairing against the LAST one.
  //
  // Here `alpha` is cited and `beta` is not, so the correct scoping yields
  // exactly one finding, `alpha -> gamma`. Merged blocks would additionally
  // pair `run alpha` against `run delta` and report `alpha -> delta`, a
  // substitution between two lines that were never each other's counterpart.
  const before = [
    '---', 'name: demo', 'locale: de', '---', '',
    'Siehe `alpha`.', '',
    '```bash', 'run alpha', 'same1', 'same2', 'run beta', '```', '',
  ].join('\n');
  const after = [
    '---', 'name: demo', 'locale: de', '---', '',
    'Siehe `alpha`.', '',
    '```bash', 'run gamma', 'same1', 'same2', 'run delta', '```', '',
  ].join('\n');
  const dir = makeFixture(t, before, after);

  const r = json(dir);

  assert.equal(r.findings.length, 1, JSON.stringify(r.findings));
  assert.equal(r.findings[0].removed, 'alpha');
  assert.equal(r.findings[0].added, 'gamma', 'a distant line was paired as a counterpart');
});

// ── gaps an adversarial review found: mutants that survived the suite ────────

test('one rename applied TWICE on a line is one substitution, and is reported', async (t) => {
  // The commonest shape a placeholder takes in a fence, and the first version
  // inverted on it: counting differing POSITIONS meant a rename applied
  // completely to a line was invisible, and only a rename occurring exactly
  // once per line could be seen. 5,783 gated-fence lines across 1,571 corpus
  // files repeat a token.
  const before = [
    '---', 'name: demo', 'locale: de', '---', '',
    'Siehe `meineapp`.', '',
    '```bash', 'docker tag meineapp:latest ghcr.io/USERNAME/meineapp:latest', '```', '',
  ].join('\n');
  const after = before.replace(
    'docker tag meineapp:latest ghcr.io/USERNAME/meineapp:latest',
    'docker tag myapp:latest ghcr.io/USERNAME/myapp:latest',
  );
  const dir = makeFixture(t, before, after);

  const r = json(dir);

  assert.equal(r.findings.length, 1, JSON.stringify(r.findings));
  assert.equal(r.findings[0].removed, 'meineapp');
  assert.equal(r.findings[0].added, 'myapp');
});

test('TWO different renames on one line are still rejected', async (t) => {
  // The distinct-pair rule must not become "any number of renames". One line
  // carrying two renames is not what this predicate claims to read, and
  // admitting it reopens the retranslation class.
  const before = [
    '---', 'name: demo', 'locale: de', '---', '',
    'Siehe `datei.txt` und `ziel`.', '',
    '```bash', 'cp datei.txt ziel/', '```', '',
  ].join('\n');
  const after = before.replace('cp datei.txt ziel/', 'cp file.txt target/');
  const dir = makeFixture(t, before, after);

  assert.equal(json(dir).findings.length, 0);
});

test('--compare actually counts the code-shape predicate it reports', async (t) => {
  // Positive control. The existing test asserts `codeShaped === 0`, which also
  // passes when the counter never increments — the file's own diagnosed failure
  // mode ("tuned to 0 with no true positive to test against") reproduced inside
  // the suite built to prevent it.
  const before = [
    '---', 'name: demo', 'locale: de', '---', '',
    'Siehe `paket_name`.', '',
    '```bash', 'echo "$paket_name"', '```', '',
  ].join('\n');
  const after = before.replace('echo "$paket_name"', 'echo "$package_name"');
  const dir = makeFixture(t, before, after);

  const r = json(dir, ['--compare']);

  assert.equal(r.alternatives.codeShaped, 1, 'the code-shape counter never fired');
  assert.ok(r.alternatives.candidates > 0, 'the candidate universe is empty');
});

test('a gated fence body is never itself a citation register', async (t) => {
  // Two frozen fences both naming the placeholder; the batch restores one. If
  // gated bodies counted as citations, the restored fence would be "still
  // cited" by its own untouched sibling — a pure false positive. The guard
  // exists; nothing held it to that answer.
  const before = [
    '---', 'name: demo', 'locale: de', '---', '',
    'Keine Zitate in Prosa.', '',
    '```bash', 'echo "paketname"', '```', '',
    '```bash', 'build paketname', '```', '',
  ].join('\n');
  const after = before.replace('echo "paketname"', 'echo "packagename"');
  const dir = makeFixture(t, before, after);

  assert.equal(json(dir).findings.length, 0, 'a frozen fence cited the placeholder');
});

test('a line that lost a token is not read as a substitution', async (t) => {
  // Without the length guard the comparison loop runs only to the shorter
  // length, so a truncated line reads as a clean rename.
  const before = [
    '---', 'name: demo', 'locale: de', '---', '',
    'Siehe `alpha`.', '',
    '```bash', 'echo alpha extra', '```', '',
  ].join('\n');
  const after = before.replace('echo alpha extra', 'echo gamma');
  const dir = makeFixture(t, before, after);

  assert.equal(json(dir).findings.length, 0);
});

test('the reported line number is the changed line, not the first body line', async (t) => {
  // The existing line-number test uses a one-line fence body, where index 0
  // makes `after.line + 1 + index` and `after.line + 1` identical.
  const before = [
    '---', 'name: demo', 'locale: de', '---', '',
    'Siehe `paketname`.', '',
    '```bash', 'git add DESCRIPTION', 'git commit -m "Release paketname"', '```', '',
  ].join('\n');
  const after = before.replace('Release paketname', 'Release packagename');
  const dir = makeFixture(t, before, after);

  const r = json(dir);
  const line = after.split('\n')[r.findings[0].line - 1];

  assert.match(line, /packagename/, `line ${r.findings[0].line} is ${JSON.stringify(line)}`);
});

test('a retagged fence is skipped, not trusted by ordinal', async (t) => {
  // Equal fence counts do not make ordinal mapping sound: a text -> yaml retag
  // keeps the count and makes a translated table the "before body" of a frozen
  // fence.
  const before = [
    '---', 'name: demo', 'locale: de', '---', '',
    'Siehe `offen`.', '',
    '```text', 'Status: offen', '```', '',
  ].join('\n');
  const after = [
    '---', 'name: demo', 'locale: de', '---', '',
    'Siehe `offen`.', '',
    '```yaml', 'Status: open', '```', '',
  ].join('\n');
  const dir = makeFixture(t, before, after);

  const r = json(dir);

  assert.equal(r.findings.length, 0);
  assert.equal(r.skippedFiles.length, 1);
  assert.match(r.skippedFiles[0].reason, /tag sequence diverges/);
});
