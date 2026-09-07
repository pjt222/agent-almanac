/**
 * fence-basis-stamp.test.js — what the normalizer is allowed to CLAIM (#552).
 *
 * `normalize-i18n-fences.js` is the only writer of `fence_basis_commit`, and it was the only
 * tool in the schema with no wiring test — the reader side got three suites and four killed
 * mutations while the pen that signs the corpus got none.
 *
 * The claim it writes names ONE English revision. Proving "every gated fence matches SOME
 * revision" is a weaker statement than that, and the gap between them is reachable: the splice
 * repairs only the DIVERGENT fences, so an untouched fence keeps a body from whatever revision
 * it came from. A file can therefore end up mirroring revision W at one ordinal and X at
 * another, and be stamped X — a false claim at the moment it is written, invisible to the
 * checker (each body matches some revision), and inherited by the backfill.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { rmTree } from './_tmp.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = 'scripts/normalize-i18n-fences.js';

function git(cwd, args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${args.join(' ')} failed: ${r.stderr}`);
  return r.stdout.trim();
}

/** English with two gated fences, whose bodies are given. */
const english = (a, b) => [
  '---', 'name: demo-skill', 'description: A demo skill.', '---', '',
  '# Demo Skill', '', '## One', '', '```bash', a, '```', '', '## Two', '', '```bash', b, '```', '',
].join('\n');

const translated = (sourceCommit, a, b, staleClaim = null) => [
  '---', 'name: demo-skill', 'description: Eine Demo.', 'locale: de', 'source_locale: en',
  `source_commit: ${sourceCommit}`,
  ...(staleClaim ? [`fence_basis_commit: ${staleClaim}`] : []),
  '---', '',
  '# Demo', '', '## Eins', '', '```bash', a, '```', '', '## Zwei', '', '```bash', b, '```', '',
].join('\n');

/**
 * Two English revisions where BOTH fences changed, and a translation that carries the OLD
 * second fence with a bumped `source_commit` — the #405 shape: a tool moved the field without
 * retranslating. Its first fence is hand-localized, so it is divergent and the file enters the
 * repair plan.
 */
function makeFixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'fence-stamp-'));
  t.after(() => rmTree(dir));

  mkdirSync(join(dir, 'scripts'), { recursive: true });
  cpSync(join(REPO, SCRIPT), join(dir, SCRIPT));
  cpSync(join(REPO, 'scripts', 'lib'), join(dir, 'scripts', 'lib'), { recursive: true });
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ type: 'module' }), 'utf8');

  git(dir, ['init', '-b', 'main']);
  git(dir, ['config', 'user.email', 'test@example.invalid']);
  git(dir, ['config', 'user.name', 'Fixture']);

  const skill = join(dir, 'skills', 'demo-skill', 'SKILL.md');
  mkdirSync(dirname(skill), { recursive: true });

  // Revision W.
  writeFileSync(skill, english('echo "A1"', 'echo "B1"'), 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'english W']);

  // Revision X — BOTH fence bodies change, so B1 belongs to W alone.
  writeFileSync(skill, english('echo "A2"', 'echo "B2"'), 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'english X']);
  const X = git(dir, ['rev-parse', '--short', 'HEAD']);

  // The mirror: fence 1 localized (divergent), fence 2 still W's body, source_commit at X, and
  // a PRE-EXISTING claim from some earlier run. The stale claim is load-bearing for the test:
  // without it the clear branch is a no-op here and deleting the `clearFrontmatterField` call
  // survives the whole suite, leaving the "a partial repair must not keep an old claim" half of
  // the design uncovered — the half the module's own docs call worse than no claim at all.
  const mirror = join(dir, 'i18n', 'de', 'skills', 'demo-skill', 'SKILL.md');
  mkdirSync(dirname(mirror), { recursive: true });
  writeFileSync(mirror, translated(X, 'echo "LOKALISIERT"', 'echo "B1"', 'deadbee'), 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-m', 'de mirror']);

  return { dir, mirror, X };
}

const run = (dir, args) => spawnSync(process.execPath, [SCRIPT, ...args], { cwd: dir, encoding: 'utf8' });
const field = (text, name) => (text.match(new RegExp(`^\\s*${name}:\\s*(\\S+)`, 'm')) || [])[1];

describe('normalize-i18n-fences: what it may claim (#552)', () => {
  it('does not stamp a basis the file only partly mirrors', (t) => {
    const { dir, mirror, X } = makeFixture(t);
    const r = run(dir, ['--write']);
    assert.equal(r.status, 0, `normalizer failed:\n${r.stdout}\n${r.stderr}`);

    const after = readFileSync(mirror, 'utf8');

    // The repair itself must still have happened: the divergent fence takes X's body.
    assert.ok(after.includes('echo "A2"'), 'the divergent fence should be repaired from the basis');
    // And the untouched fence still carries W's body — it matched history, so nothing rewrote it.
    assert.ok(after.includes('echo "B1"'), 'the non-divergent fence is left alone by design');

    // Therefore the file mirrors X at ordinal 1 and W at ordinal 2. No single revision
    // describes it, so there is no true value to write and the field must be absent — which
    // also means the pre-existing `deadbee` claim must have been DESTROYED, not merely left
    // un-updated. Both halves are asserted by this one equality: `undefined` fails if the tool
    // stamped X, and equally if it kept deadbee.
    assert.equal(field(after, 'fence_basis_commit'), undefined,
      `stamped a basis (${X}) that only one of two fences mirrors, or kept the stale deadbee claim`);
  });

  it('refuses a basis whose bytes the history walk cannot see', (t) => {
    // The off-pool corner. `everEnglish` comes from `git log --name-only -- <trees>`, which is
    // path-limited and so history-simplified, and which lists NO paths for a merge commit — the
    // walk's own docstring records that a body existing only as conflict-resolution output
    // never enters the pool. The basis, by contrast, is resolved with `git cat-file --batch`,
    // which answers for any object in the store.
    //
    // So a `source_commit` naming a merge resolves to bytes the pool does not contain:
    // `mirrorsBasis` is true while the repaired fences are still outside the pool. Stamping
    // there would sign a claim the parity gate contradicts on its very next run. Without this
    // case the `stillDivergent === 0` conjunct is uncovered — measured: deleting it survived
    // the whole suite.
    const dir = mkdtempSync(join(tmpdir(), 'fence-stamp-merge-'));
    t.after(() => rmTree(dir));

    mkdirSync(join(dir, 'scripts'), { recursive: true });
    cpSync(join(REPO, SCRIPT), join(dir, SCRIPT));
    cpSync(join(REPO, 'scripts', 'lib'), join(dir, 'scripts', 'lib'), { recursive: true });
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ type: 'module' }), 'utf8');

    git(dir, ['init', '-b', 'main']);
    git(dir, ['config', 'user.email', 'test@example.invalid']);
    git(dir, ['config', 'user.name', 'Fixture']);

    const skill = join(dir, 'skills', 'demo-skill', 'SKILL.md');
    mkdirSync(dirname(skill), { recursive: true });
    const write1 = (body) => writeFileSync(skill, [
      '---', 'name: demo-skill', 'description: A demo skill.', '---', '',
      '# Demo Skill', '', '```bash', body, '```', '',
    ].join('\n'), 'utf8');

    write1('echo "A1"');
    git(dir, ['add', '-A']);
    git(dir, ['commit', '-m', 'A']);

    git(dir, ['checkout', '-b', 'side']);
    write1('echo "B1"');
    git(dir, ['add', '-A']);
    git(dir, ['commit', '-m', 'B']);

    git(dir, ['checkout', 'main']);
    write1('echo "C1"');
    git(dir, ['add', '-A']);
    git(dir, ['commit', '-m', 'C']);

    // Conflicting merge, resolved to a body present in NEITHER parent.
    spawnSync('git', ['merge', 'side'], { cwd: dir, encoding: 'utf8' }); // expected to conflict
    write1('echo "R1"');
    git(dir, ['add', '-A']);
    git(dir, ['commit', '--no-edit', '-m', 'merge side, resolved to R1']);
    const merge = git(dir, ['rev-parse', '--short', 'HEAD']);

    // A later commit, so the working-tree pass contributes D1 rather than R1 — otherwise the
    // resolution body re-enters the pool through the working tree and the corner closes.
    write1('echo "D1"');
    git(dir, ['add', '-A']);
    git(dir, ['commit', '-m', 'D']);

    const mirror = join(dir, 'i18n', 'de', 'skills', 'demo-skill', 'SKILL.md');
    mkdirSync(dirname(mirror), { recursive: true });
    writeFileSync(mirror, [
      '---', 'name: demo-skill', 'description: Eine Demo.', 'locale: de', 'source_locale: en',
      `source_commit: ${merge}`, '---', '',
      '# Demo', '', '```bash', 'echo "LOKALISIERT"', '```', '',
    ].join('\n'), 'utf8');
    git(dir, ['add', '-A']);
    git(dir, ['commit', '-m', 'de mirror']);

    const r = run(dir, ['--write']);
    assert.equal(r.status, 0, `normalizer failed:\n${r.stdout}\n${r.stderr}`);

    const after = readFileSync(mirror, 'utf8');
    assert.ok(after.includes('echo "R1"'), 'the repair itself still happens, from the merge blob');
    assert.equal(field(after, 'fence_basis_commit'), undefined,
      'must not claim a basis whose bytes the gate cannot find in any walked revision');
  });

  it('refuses a basis whose fence SEQUENCE the gate cannot find, not only whose bodies it cannot', (t) => {
    // The off-pool corner has two axes and the first fix only closed one.
    //
    // `stillDivergent` tests BODY membership in the pool. A conflict-resolved merge can pick
    // bodies that each already exist in a parent while assembling them into a fence ORDER or
    // COUNT that no single revision ever had. Bodies pooled, sequence novel: `stillDivergent`
    // is 0, `mirrorsBasis` is true, and the old condition stamped it — whereupon
    // `compareTagSequence` finds no revision with that folded sequence and the parity gate
    // immediately reports the claim as false. The writer and the gate disagreeing about the
    // same file is the thing this schema exists to prevent.
    const dir = mkdtempSync(join(tmpdir(), 'fence-stamp-seq-'));
    t.after(() => rmTree(dir));

    mkdirSync(join(dir, 'scripts'), { recursive: true });
    cpSync(join(REPO, SCRIPT), join(dir, SCRIPT));
    cpSync(join(REPO, 'scripts', 'lib'), join(dir, 'scripts', 'lib'), { recursive: true });
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ type: 'module' }), 'utf8');

    git(dir, ['init', '-b', 'main']);
    git(dir, ['config', 'user.email', 'test@example.invalid']);
    git(dir, ['config', 'user.name', 'Fixture']);

    const skill = join(dir, 'skills', 'demo-skill', 'SKILL.md');
    mkdirSync(dirname(skill), { recursive: true });
    // Each revision carries ONE fence; the merge assembles two. Every body is therefore pooled
    // while the two-fence sequence exists in no walked revision.
    const one = (tag, body) => [
      '---', 'name: demo-skill', 'description: A demo skill.', '---', '',
      '# Demo Skill', '', '```' + tag, body, '```', '',
    ].join('\n');

    writeFileSync(skill, one('bash', 'echo "X"'), 'utf8');
    git(dir, ['add', '-A']); git(dir, ['commit', '-m', 'A: bash X']);

    git(dir, ['checkout', '-b', 'side']);
    writeFileSync(skill, one('yaml', 'key: Y'), 'utf8');
    git(dir, ['add', '-A']); git(dir, ['commit', '-m', 'B: yaml Y']);

    git(dir, ['checkout', 'main']);
    writeFileSync(skill, one('bash', 'echo "C"'), 'utf8');
    git(dir, ['add', '-A']); git(dir, ['commit', '-m', 'C']);

    spawnSync('git', ['merge', 'side'], { cwd: dir, encoding: 'utf8' }); // conflicts
    writeFileSync(skill, [
      '---', 'name: demo-skill', 'description: A demo skill.', '---', '',
      '# Demo Skill', '', '```bash', 'echo "X"', '```', '', '```yaml', 'key: Y', '```', '',
    ].join('\n'), 'utf8');
    git(dir, ['add', '-A']); git(dir, ['commit', '--no-edit', '-m', 'merge: both fences']);
    const merge = git(dir, ['rev-parse', '--short', 'HEAD']);

    writeFileSync(skill, one('bash', 'echo "D"'), 'utf8');
    git(dir, ['add', '-A']); git(dir, ['commit', '-m', 'D']);

    // Mirror at the merge, first fence localized so the file enters the repair plan.
    const mirror = join(dir, 'i18n', 'de', 'skills', 'demo-skill', 'SKILL.md');
    mkdirSync(dirname(mirror), { recursive: true });
    writeFileSync(mirror, [
      '---', 'name: demo-skill', 'description: Eine Demo.', 'locale: de', 'source_locale: en',
      `source_commit: ${merge}`, '---', '',
      '# Demo', '', '```bash', 'echo "LOKALISIERT"', '```', '', '```yaml', 'key: Y', '```', '',
    ].join('\n'), 'utf8');
    git(dir, ['add', '-A']); git(dir, ['commit', '-m', 'de mirror']);

    const r = run(dir, ['--write']);
    assert.equal(r.status, 0, `normalizer failed:\n${r.stdout}\n${r.stderr}`);

    const after = readFileSync(mirror, 'utf8');
    assert.ok(after.includes('echo "X"'), 'the repair itself still happens, from the merge blob');
    assert.equal(field(after, 'fence_basis_commit'), undefined,
      'stamped a basis whose fence SEQUENCE appears in no walked revision — the gate will call this claim false');
  });

  it('stamps when the repaired file mirrors the basis at every gated fence', (t) => {
    const dir = mkdtempSync(join(tmpdir(), 'fence-stamp-ok-'));
    t.after(() => rmTree(dir));

    mkdirSync(join(dir, 'scripts'), { recursive: true });
    cpSync(join(REPO, SCRIPT), join(dir, SCRIPT));
    cpSync(join(REPO, 'scripts', 'lib'), join(dir, 'scripts', 'lib'), { recursive: true });
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ type: 'module' }), 'utf8');

    git(dir, ['init', '-b', 'main']);
    git(dir, ['config', 'user.email', 'test@example.invalid']);
    git(dir, ['config', 'user.name', 'Fixture']);

    const skill = join(dir, 'skills', 'demo-skill', 'SKILL.md');
    mkdirSync(dirname(skill), { recursive: true });
    writeFileSync(skill, english('echo "A1"', 'echo "B1"'), 'utf8');
    git(dir, ['add', '-A']);
    git(dir, ['commit', '-m', 'english']);
    const head = git(dir, ['rev-parse', '--short', 'HEAD']);

    // Only fence 1 diverges; fence 2 already equals the basis, so after the repair the whole
    // file mirrors that one revision and the claim is true.
    const mirror = join(dir, 'i18n', 'de', 'skills', 'demo-skill', 'SKILL.md');
    mkdirSync(dirname(mirror), { recursive: true });
    writeFileSync(mirror, translated(head, 'echo "LOKALISIERT"', 'echo "B1"'), 'utf8');
    git(dir, ['add', '-A']);
    git(dir, ['commit', '-m', 'de mirror']);

    const r = run(dir, ['--write']);
    assert.equal(r.status, 0, `normalizer failed:\n${r.stdout}\n${r.stderr}`);

    const after = readFileSync(mirror, 'utf8');
    assert.ok(after.includes('echo "A1"'), 'repaired from the basis');
    assert.equal(field(after, 'fence_basis_commit'), head,
      'a file that fully mirrors its basis should carry the claim');
  });
});
