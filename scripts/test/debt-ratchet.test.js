/**
 * debt-ratchet.test.js — the ratchet that gives a warn-only gate teeth (#591).
 *
 * Every assertion here drives the real script as a subprocess against a throwaway git repo,
 * because a ratchet's failure modes live entirely in its wiring. A unit test of "compare two
 * sets" would pass against a ratchet that never ran the gate, never validated its own kinds, or
 * compared an empty set against an empty set and called it green — which are precisely the three
 * ways this tool can lie while looking correct.
 *
 * The corpus-scale negative test lives elsewhere and is a different instrument:
 * `scripts/envelopes/debt-ratchet.mjs` retags a frozen fence in a real translation and requires
 * `npm run ratchet` — the command CI actually runs — to go red. That proves the wiring; these
 * prove the behaviour.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { rmTree } from './_tmp.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const RATCHET = join(REPO, 'scripts', 'check-debt-ratchet.js');

function git(cwd, args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${args.join(' ')} failed: ${r.stderr}`);
  return r.stdout.trim();
}

const fence = (tag, body) => ['```' + tag, body, '```', ''].join('\n');
const ENGLISH = `# Demo\n\n${fence('yaml', 'a: 1')}${fence('python', 'x = 1')}`;

/** The advisory-gate inventory is mandatory, so every fixture needs a valid one. */
const INVENTORY = [
  'advisory_gates:',
  '  - id: demo',
  '    workflow: .github/workflows/demo.yml',
  '    command: node scripts/demo.js --warn',
  '    exit: "#1"',
].join('\n');

/**
 * A repo with one English skill and one German mirror whose `python` fence is retagged `text` —
 * the #481 escape, and the finding every case below is arranged around.
 */
function fixture(t, { ratchetYaml, retag = true, workflow = null }) {
  const dir = mkdtempSync(join(tmpdir(), 'debt-ratchet-'));
  t.after(() => rmTree(dir));

  git(dir, ['init', '-b', 'main']);
  git(dir, ['config', 'user.email', 'test@example.invalid']);
  git(dir, ['config', 'user.name', 'Fixture']);

  mkdirSync(join(dir, 'skills', 'demo'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'demo', 'SKILL.md'), ENGLISH, 'utf8');
  git(dir, ['add', 'skills']);
  git(dir, ['commit', '-m', 'english']);

  mkdirSync(join(dir, 'i18n', 'de', 'skills', 'demo'), { recursive: true });
  writeFileSync(join(dir, 'i18n', 'de', 'skills', 'demo', 'SKILL.md'),
    retag ? ENGLISH.replace('```python', '```text') : ENGLISH, 'utf8');

  if (workflow !== null) {
    mkdirSync(join(dir, '.github', 'workflows'), { recursive: true });
    writeFileSync(join(dir, '.github', 'workflows', 'demo.yml'), workflow, 'utf8');
  }

  writeFileSync(join(dir, 'debt-ratchet.yml'), ratchetYaml, 'utf8');
  return dir;
}

function run(dir, extra = []) {
  const r = spawnSync(process.execPath, [RATCHET, '--root', dir, ...extra], { encoding: 'utf8' });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
}

const slice = (members) => [
  'version: 1',
  'slices:',
  '  - id: demo-slice',
  '    gate_argv: [scripts/check-i18n-fence-parity.js]',
  '    kinds: [tag-sequence, tag-drift]',
  '    scanned_field: filesCompared',
  '    min_scanned: 1',
  '    members:',
  ...members.map((m) => `      - { file: ${m.file}, kind: ${m.kind} }`),
  INVENTORY,
].join('\n');

const MIRROR = 'i18n/de/skills/demo/SKILL.md';

describe('debt ratchet (#591)', () => {
  it('holds when the observed set equals the declared set', (t) => {
    const dir = fixture(t, { ratchetYaml: slice([{ file: MIRROR, kind: 'tag-sequence' }]) });
    const { status, out } = run(dir);
    assert.equal(status, 0, out);
    assert.match(out, /1 observed \/ 1 declared/);
    assert.match(out, /OK: every ratcheted finding is a known member/);
  });

  it('fails on ADDED debt — a finding the member list does not name', (t) => {
    // The case the gate itself cannot make: it is warn-only in CI, so this retag would report and
    // exit 0. The ratchet is the only thing between the corpus and a rising count.
    const dir = fixture(t, { ratchetYaml: slice([]) });
    const { status, out } = run(dir);
    assert.equal(status, 1);
    assert.match(out, /^FAIL debt-ratchet: added debt — i18n\/de\/skills\/demo\/SKILL\.md \[tag-sequence\]/m);
  });

  it('fails on a STALE member — debt paid down without the ratchet moving', (t) => {
    // Not `observed <= declared`. A `<=` ratchet is green when one member is repaired and a
    // different one appears, and "matches some earlier state" is the shape that keeps deletions
    // green forever. #591 requires the file to move in the same commit, so a vanished member is a
    // failure with an instruction, not a silent pass.
    const dir = fixture(t, {
      retag: false,
      ratchetYaml: slice([{ file: MIRROR, kind: 'tag-sequence' }]),
    });
    const { status, out } = run(dir);
    assert.equal(status, 1);
    assert.match(out, /^FAIL debt-ratchet: stale member — i18n\/de\/skills\/demo\/SKILL\.md \[tag-sequence\]/m);
    assert.match(out, /in this commit/);
  });

  it('ratchets the non-blocking class too — drift is watched, not merely tolerated', (t) => {
    // `tag-drift` is ungated by #598, which is exactly why it needs this: nothing else can make
    // its count rise visibly. Same fixture, frozen->frozen retag.
    const dir = mkdtempSync(join(tmpdir(), 'debt-ratchet-drift-'));
    t.after(() => rmTree(dir));
    git(dir, ['init', '-b', 'main']);
    git(dir, ['config', 'user.email', 'test@example.invalid']);
    git(dir, ['config', 'user.name', 'Fixture']);
    mkdirSync(join(dir, 'skills', 'demo'), { recursive: true });
    writeFileSync(join(dir, 'skills', 'demo', 'SKILL.md'), ENGLISH, 'utf8');
    git(dir, ['add', 'skills']);
    git(dir, ['commit', '-m', 'english']);
    mkdirSync(join(dir, 'i18n', 'de', 'skills', 'demo'), { recursive: true });
    writeFileSync(join(dir, 'i18n', 'de', 'skills', 'demo', 'SKILL.md'),
      ENGLISH.replace('```python', '```ruby'), 'utf8');
    writeFileSync(join(dir, 'debt-ratchet.yml'), slice([]), 'utf8');

    const { status, out } = run(dir);
    assert.equal(status, 1, out);
    assert.match(out, /added debt — i18n\/de\/skills\/demo\/SKILL\.md \[tag-drift\]/);
  });

  it('REFUSES a kind the gate cannot emit, rather than comparing empty against empty', (t) => {
    // The vacuity this file exists to prevent. `tag-drfit` selects nothing, the declared set is
    // also empty, and a naive implementation reports a held ratchet forever — in the one file
    // whose job is to stop a gate going quiet. Validated against the gate's OWN published
    // vocabulary, not a copy of it.
    const dir = fixture(t, {
      ratchetYaml: slice([]).replace('kinds: [tag-sequence, tag-drift]', 'kinds: [tag-drfit]'),
    });
    const { status, out } = run(dir);
    assert.equal(status, 2, out);
    assert.match(out, /not in the gate's vocabulary/);
  });

  it('REFUSES a run that scanned less than its declared floor', (t) => {
    const dir = fixture(t, { ratchetYaml: slice([]).replace('min_scanned: 1', 'min_scanned: 3000') });
    const { status, out } = run(dir);
    assert.equal(status, 2, out);
    assert.match(out, /below the declared floor/);
  });

  it('REFUSES a floor that cannot fire — the anti-vacuity guard disabled by its own config', (t) => {
    // `min_scanned` is only ever compared with `<`. `x < null` is `x < 0` and `x < NaN` is always
    // false, so each of these leaves the field visibly present and the floor dead. Presence was
    // the only check.
    for (const value of ['min_scanned:', 'min_scanned: 0', 'min_scanned: -1', 'min_scanned: three-thousand']) {
      const dir = fixture(t, { ratchetYaml: slice([]).replace('min_scanned: 1', value) });
      const { status, out } = run(dir);
      assert.equal(status, 2, `${value} should be refused, got:\n${out}`);
      assert.match(out, /it must be a positive number or the floor does nothing/);
    }
  });

  it('REFUSES a scanned_field that is not one of the gate\'s coverage fields', (t) => {
    // `violations` is numeric and near zero on a healthy corpus, so naming it inverts the floor:
    // healthy runs fail and vacuous runs pass. "Is it a number" cannot tell the two apart.
    const dir = fixture(t, {
      ratchetYaml: slice([]).replace('scanned_field: filesCompared', 'scanned_field: violations'),
    });
    const { status, out } = run(dir);
    assert.equal(status, 2, out);
    assert.match(out, /is not one of the gate's coverage fields/);
  });

  it('REFUSES gate_argv that steers the gate\'s own corpus selection', (t) => {
    // The gate's `flagValue` takes the FIRST occurrence and the ratchet appends `--root` after
    // these, so a `--root` here silently wins: the ratchet compares a subset while reporting that
    // it checked the tree it was pointed at.
    const dir = fixture(t, {
      ratchetYaml: slice([]).replace(
        'gate_argv: [scripts/check-i18n-fence-parity.js]',
        'gate_argv: [scripts/check-i18n-fence-parity.js, --locale, de]',
      ),
    });
    const { status, out } = run(dir);
    assert.equal(status, 2, out);
    assert.match(out, /the ratchet supplies those itself and a duplicate would win/);
  });

  it('REFUSES an empty or missing ratchet, never reads it as nothing to enforce', (t) => {
    const dir = fixture(t, { ratchetYaml: `version: 1\nslices: []\n${INVENTORY}` });
    assert.equal(run(dir).status, 2);
    assert.match(run(dir).out, /declares no slices/);

    const missing = run(dir, ['--ratchet', join(dir, 'nope.yml')]);
    assert.equal(missing.status, 2);
    assert.match(missing.out, /no ratchet file at/);
  });

  it('REFUSES a member whose kind the slice does not ratchet', (t) => {
    // Otherwise a member can be parked under a kind nothing selects, which removes it from
    // enforcement while leaving it visibly "listed".
    const dir = fixture(t, { ratchetYaml: slice([{ file: MIRROR, kind: 'diverged' }]) });
    const { status, out } = run(dir);
    assert.equal(status, 2, out);
    assert.match(out, /which the slice does not ratchet/);
  });

  it('resolves the gate against ITS OWN repo, so a checked tree cannot supply its judge', (t) => {
    // `--root` names a corpus to check, not a source of checkers. The fixture ships a PERMISSIVE
    // fake at the same path the ratchet names, which reports a large clean corpus. If the gate
    // were resolved against `--root`, that fake would clear both the vacuity floor and the member
    // comparison, and the retag below would go unreported — a tree grading its own homework.
    const dir = fixture(t, { ratchetYaml: slice([]) });
    mkdirSync(join(dir, 'scripts'), { recursive: true });
    writeFileSync(join(dir, 'scripts', 'check-i18n-fence-parity.js'),
      'console.log(JSON.stringify({ filesCompared: 9999, kinds: ["tag-sequence", "tag-drift"], findings: [] }));\n',
      'utf8');

    const { status, out } = run(dir);
    assert.equal(status, 1, 'the real gate still finds the retag');
    assert.match(out, /added debt — i18n\/de\/skills\/demo\/SKILL\.md \[tag-sequence\]/);
    assert.doesNotMatch(out, /scanned 9999/, 'the fake must not have been the one that ran');
  });

  describe('the advisory-gate inventory', () => {
    it('fails when a listed gate no longer appears in the workflow it names', (t) => {
      // Documentation drift, as a gate. A list nothing reads is what this repo treats as a P1 bug.
      const dir = fixture(t, {
        ratchetYaml: slice([{ file: MIRROR, kind: 'tag-sequence' }]),
        workflow: 'jobs:\n  x:\n    steps:\n      - run: node scripts/something-else.js\n',
      });
      const { status, out } = run(dir);
      assert.equal(status, 1);
      assert.match(out, /is listed but .* no longer runs/);
    });

    it('fails when a workflow gains a --warn step nothing lists — the direction that matters', (t) => {
      const dir = fixture(t, {
        ratchetYaml: slice([{ file: MIRROR, kind: 'tag-sequence' }]),
        workflow: [
          'jobs:', '  x:', '    steps:',
          '      - run: node scripts/demo.js --warn',
          '      - run: node scripts/brand-new-gate.js --warn',
          '',
        ].join('\n'),
      });
      const { status, out } = run(dir);
      assert.equal(status, 1);
      assert.match(out, /debt-ratchet\.yml does not list: node scripts\/brand-new-gate\.js --warn/);
    });

    it('does not let an entry in ANOTHER workflow cover a --warn step', (t) => {
      // Command-only matching failed both ways, and one of them is live in the real ratchet file:
      // two entries carry `check-translation-freshness.js --warn` and differ only in workflow, so
      // deleting either left the sweep green. The mirror image is worse — the same command added
      // to a brand-new workflow would be covered on arrival, which is a new warn-only gate added
      // silently.
      const dir = fixture(t, {
        ratchetYaml: slice([{ file: MIRROR, kind: 'tag-sequence' }]).replace(
          '    workflow: .github/workflows/demo.yml',
          '    workflow: .github/workflows/somewhere-else.yml',
        ),
        workflow: 'jobs:\n  x:\n    steps:\n      - run: node scripts/demo.js --warn\n',
      });
      const { status, out } = run(dir);
      assert.equal(status, 1);
      assert.match(out, /demo\.yml runs a warn-only step that debt-ratchet\.yml does not list/);
    });

    it('passes when every --warn step is listed', (t) => {
      const dir = fixture(t, {
        ratchetYaml: slice([{ file: MIRROR, kind: 'tag-sequence' }]),
        workflow: 'jobs:\n  x:\n    steps:\n      - run: node scripts/demo.js --warn\n',
      });
      const { status, out } = run(dir);
      assert.equal(status, 0, out);
    });

    it('does not read a comment about --warn as an unlisted warn-only step', (t) => {
      // Found by tripping it: documenting, in a comment beside a warn step, that `--warn`
      // suppresses finding-exits but not refusals made the sweep report the comment. Loud rather
      // than silent, so nothing was missed — but the cheap fix is to reword the comment, which
      // deletes the explanation to satisfy the tool. Comments do not execute; the sweep skips them.
      const dir = fixture(t, {
        ratchetYaml: slice([{ file: MIRROR, kind: 'tag-sequence' }]),
        workflow: [
          'jobs:',
          '  x:',
          '    steps:',
          '      # `--warn` reports and exits 0, so this step cannot fail on a finding.',
          '      - run: node scripts/demo.js --warn',
          '      - run: node scripts/other.js --warn # still swept: not a comment line',
          '',
        ].join('\n'),
      });
      const { status, out } = run(dir);
      // The comment is ignored; the trailing-comment invocation is NOT.
      assert.equal(status, 1, out);
      assert.doesNotMatch(out, /does not list: # /);
      assert.match(out, /does not list: node scripts\/other\.js --warn/);
    });

    it('REFUSES a ratchet with no inventory at all', (t) => {
      const dir = fixture(t, { ratchetYaml: slice([{ file: MIRROR, kind: 'tag-sequence' }]).replace(INVENTORY, '') });
      const { status, out } = run(dir);
      assert.equal(status, 2, out);
      assert.match(out, /lists no advisory_gates/);
    });
  });
});
