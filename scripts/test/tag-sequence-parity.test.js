/**
 * Tag-sequence parity — the retag escape (#481), and the tripwire #582 removed (#583).
 *
 * The body check decides what to enforce from the info string of the TRANSLATION, so retagging a
 * frozen ```yaml fence to ```text removes it from enforcement entirely: the set of fences under
 * the gate is chosen by the file being gated. Default-deny narrowed the escape to
 * {text, markdown, md} without closing it.
 *
 * `fenceShape` in the status detector used to catch this by accident, because it counted ALL
 * terminated fences and a retag changed the shape. #582 narrowed it to gated fences only — for
 * good reasons, a 62-file false-positive class — and the accidental cover went with it. Nothing
 * pinned the old behaviour, which is how it was lost silently; that is what these tests exist to
 * prevent happening twice.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { execFileSync, spawnSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import {
  foldedTagSequence, extractFences, buildEnglishFenceHistory, isRetagEscape,
} from '../lib/fences.js';
import { compareTagSequence } from '../check-i18n-fence-parity.js';
import { rmTree } from './_tmp.js';

const fence = (tag, body) => ['```' + tag, body, '```', ''].join('\n');
const CHECKER = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'check-i18n-fence-parity.js');

test('untagged folds to `text`, and the fold is not optional', () => {
  // `normalize-content-style.js --mode fences` retro-tagged untagged blocks as `text` on the
  // NEWER side only. Without the fold, every one of those pairings reads as a retag.
  assert.deepEqual(foldedTagSequence('```\nx\n```\n'), ['text']);
  assert.deepEqual(foldedTagSequence('```yaml\nx\n```\n\n```\ny\n```\n'), ['yaml', 'text']);
});

test('an equidistant tie is broken toward the ESCAPE, not toward walk order (#630)', () => {
  // Two count-matched English revisions, each differing from the translation in EXACTLY ONE
  // position, and they disagree about what that means:
  //
  //   candidate A   ['python', 'bash']  ->  #1 python->text   an ESCAPE   (frozen fence freed)
  //   candidate B   ['text',   'yaml']  ->  #2 yaml->bash     drift       (both stay frozen)
  //
  // Before #630 the winner was whichever the history walk reached first, because the loop used a
  // strict `<`. Since #598 that also decided whether the finding BLOCKS. So the tie is asserted
  // by VERDICT here, not merely by "a verdict exists".
  const translated = ['text', 'bash'];
  const escapeFirst = new Set(['python,bash', 'text,yaml']);
  const driftFirst = new Set(['text,yaml', 'python,bash']);

  for (const [label, sequences] of [['escape walked first', escapeFirst],
                                    ['drift walked first', driftFirst]]) {
    const verdict = compareTagSequence(translated, sequences);
    assert.equal(verdict.minimalCandidates, 2, `${label}: the fixture must actually tie`);
    assert.equal(isRetagEscape(verdict.positions), true,
      `${label}: an equidistant escape reading must win, so the tie fails safe`);
    assert.deepEqual(verdict.positions,
      [{ index: 1, english: 'python', translated: 'text' }],
      `${label}: and it must report the escape's positions, not the drift's`);
  }

  // Insertion order is the only thing that differs between the two Sets above, so this is the
  // property that was broken: the answer must not depend on it.
  assert.deepEqual(compareTagSequence(translated, escapeFirst),
    compareTagSequence(translated, driftFirst),
    'walk order must not change the verdict');
});

test('a tie among equals that are ALL drift stays drift, and reports the ambiguity (#630)', () => {
  // The fail-safe rule must not manufacture an escape where no legal reading is one. Both
  // candidates differ in one position and neither frees a frozen fence.
  const verdict = compareTagSequence(['bash', 'yaml'], new Set(['yaml,yaml', 'bash,bash']));
  assert.equal(verdict.minimalCandidates, 2);
  assert.equal(isRetagEscape(verdict.positions), false,
    'no candidate is an escape, so the finding must stay drift');
});

test('a lone minimal candidate reports one, so ambiguity is distinguishable (#630)', () => {
  const verdict = compareTagSequence(['text', 'bash'], new Set(['python,bash', 'json,json']));
  assert.equal(verdict.minimalCandidates, 1);
  assert.equal(isRetagEscape(verdict.positions), true);
});

test('ALL fences are sequenced, not only gated ones — that is the whole point', () => {
  // A gated-only sequence cannot see a retag, because the retag is precisely a fence LEAVING the
  // gated set. This is the property #582 removed from `fenceShape` and #583 records the loss of.
  const doc = `${fence('yaml', 'a: 1')}${fence('text', 'notes')}${fence('bash', 'ls')}`;
  assert.deepEqual(foldedTagSequence(doc), ['yaml', 'text', 'bash']);
  const retagged = doc.replace('```yaml', '```text');
  assert.deepEqual(foldedTagSequence(retagged), ['text', 'text', 'bash']);
  assert.notDeepEqual(foldedTagSequence(doc), foldedTagSequence(retagged),
    'a retag must change the sequence, or the escape stays open');
});

test('a sequence matching some English revision is clean, even an OLD one', () => {
  // Staleness immunity, the constraint that kills the naive comparison: 2,549 translations are
  // stale, and comparing against HEAD reports drift nobody introduced.
  const english = new Set(['yaml,bash', 'yaml,bash,text', 'r,r']);
  assert.equal(compareTagSequence(['yaml', 'bash'], english), null, 'an older revision is a legal basis');
  assert.equal(compareTagSequence(['yaml', 'bash', 'text'], english), null);
});

test('the #481 escape is caught: a frozen tag retagged to a localisable one', () => {
  const english = new Set(['text,markdown,python']);
  const verdict = compareTagSequence(['text', 'markdown', 'text'], english);
  assert.deepEqual(verdict.positions, [{ index: 3, english: 'python', translated: 'text' }]);
});

test('a count mismatch is UNALIGNABLE, never a violation', () => {
  // Without a count match there is no position to compare. A translation predating a fence
  // English later gained lands here, and calling that a violation reintroduces the staleness
  // confound the gate exists to avoid.
  const english = new Set(['yaml,bash,text']);
  assert.deepEqual(compareTagSequence(['yaml', 'bash'], english), { unalignable: true });
});

test('an empty English revision has length 0, not 1', () => {
  // Regression. `''.split(',')` is `['']`, so a source revision with NO fences looked like a
  // one-fence revision, matched every one-fence translation, and compared position 1 against
  // `undefined` — fabricating findings that read `#1 ->markdown`. Caught only because an
  // independent measurement of the same property disagreed by exactly 3; no test saw it.
  const english = new Set(['', 'markdown']);
  assert.equal(compareTagSequence(['markdown'], english), null, 'the 1-fence revision matches');
  assert.deepEqual(compareTagSequence(['r'], english), {
    positions: [{ index: 1, english: 'markdown', translated: 'r' }],
    // `minimalCandidates` since #630. It is 1 here precisely because the empty revision is
    // excluded from `sameLength` — if the length-0 regression came back, the empty revision
    // would tie and this would read 2, so the field doubles as a second witness for the bug
    // this test is named after.
    minimalCandidates: 1,
  }, 'the empty revision must not be offered as a 1-fence basis');
  assert.deepEqual(compareTagSequence([], english), null, 'an empty translation matches the empty revision');
});

test('the nearest basis is reported, not an arbitrary one', () => {
  // An arbitrary count-matched revision inflates a single retag into wholesale divergence and
  // makes the finding unreadable.
  const english = new Set(['a,b,c', 'x,y,z']);
  const verdict = compareTagSequence(['a', 'b', 'z'], english);
  assert.equal(verdict.positions.length, 1);
  assert.deepEqual(verdict.positions[0], { index: 3, english: 'c', translated: 'z' });
});

test('a source with no English history at all yields no finding', () => {
  // Orphans are check-i18n-frontmatter-parity.js's job, not this gate's.
  assert.equal(compareTagSequence(['yaml'], undefined), null);
});

test('buildEnglishFenceHistory pools a sequence per revision, from the same walk', () => {
  // Reachable as a test only because #559 gave the builder a `root` parameter.
  const dir = mkdtempSync(join(tmpdir(), 'aa-tagseq-'));
  try {
    const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'test@example.com');
    git('config', 'user.name', 'test');
    mkdirSync(join(dir, 'skills', 'demo'), { recursive: true });

    writeFileSync(join(dir, 'skills', 'demo', 'SKILL.md'), `# Demo\n\n${fence('yaml', 'a: 1')}`);
    git('add', '-A'); git('commit', '-qm', 'one fence');

    writeFileSync(join(dir, 'skills', 'demo', 'SKILL.md'),
      `# Demo\n\n${fence('yaml', 'a: 1')}${fence('python', 'x = 1')}`);
    git('add', '-A'); git('commit', '-qm', 'two fences');

    const seqs = buildEnglishFenceHistory(dir).sequences.get('skills/demo');
    assert.ok(seqs.has('yaml'), 'the older one-fence revision is pooled');
    assert.ok(seqs.has('yaml,python'), 'and the current two-fence one');

    // Which is what makes staleness immunity real rather than asserted: a translation still on
    // the one-fence structure is clean.
    assert.equal(compareTagSequence(['yaml'], seqs), null);
    // While a retag of the current structure is not.
    assert.deepEqual(compareTagSequence(['yaml', 'text'], seqs).positions,
      [{ index: 2, english: 'python', translated: 'text' }]);
  } finally {
    rmTree(dir);
  }
});

test('a swallowed 4-backtick opener changes the sequence — the corpus case', () => {
  // The real finding this shipped with. English opens a 4-backtick ````markdown fence containing
  // a literal ``` block; three translations degraded the opener to 3 backticks, so it closes
  // early and the NEXT fence's body is absorbed into a `text` block. The frozen code stops being
  // a fence at all, which is why the body check is structurally blind to it.
  const english = ['# T', '', '````markdown', '```language', 'x', '```', '````', '', '```python', 'y', '```', ''].join('\n');
  const degraded = english.replace('````markdown', '```markdown').replace('\n````\n', '\n```text\n');

  assert.deepEqual(foldedTagSequence(english), ['markdown', 'python']);
  assert.equal(extractFences(english)[0].body.includes('```language'), true,
    'the 4-backtick fence legitimately contains a 3-backtick block');

  const after = foldedTagSequence(degraded);
  assert.notDeepEqual(after, ['markdown', 'python'], 'degrading the opener must be visible');
  // `assert.ok(verdict)` would pass on `{unalignable: true}`, which is expressly NOT a finding —
  // so a future change demoting this class from blocking to unjudged would keep the test green.
  // Assert the positions.
  const verdict = compareTagSequence(after, new Set([foldedTagSequence(english).join(',')]));
  assert.ok(verdict?.positions, 'must be a FINDING, not unjudged');
  assert.deepEqual(verdict.positions, [{ index: 2, english: 'python', translated: 'text' }]);
});

test('a brace info string is NOT folded to text — the escape must not survive its own fix', () => {
  // `lang` is '' for ```{r} as well as for a bare ```, because the info split breaks on `{`.
  // Brace fences are frozen under default-deny exactly like untagged ones, so folding both to
  // `text` would let an English ```{r} fence be replaced by a localisable ```text one with
  // neither this check nor the body check seeing it.
  assert.deepEqual(foldedTagSequence('```{r}\nx\n```\n'), ['{']);
  assert.deepEqual(foldedTagSequence('```{r setup, echo=FALSE}\nx\n```\n'), ['{']);
  assert.notDeepEqual(foldedTagSequence('```{r}\nx\n```\n'), foldedTagSequence('```\nx\n```\n'),
    'a brace fence and an untagged fence must not collapse to the same token');

  const verdict = compareTagSequence(['text'], new Set(['{']));
  assert.deepEqual(verdict.positions, [{ index: 1, english: '{', translated: 'text' }],
    'retagging a brace fence to text is a finding');
});

test('END TO END: the checker reports a retag as a blocking finding and exits 1', () => {
  // The gap the review found, and the reason it mattered: `--delete-matching 'gated: true,'`
  // SURVIVED against the whole 298-test suite. Every tag-sequence finding could stop being
  // blocking with the suite green, because all three mutation kills quoted as coverage were
  // component-scoped and nothing executed the checker's enforcement path.
  //
  // Runs the real gate as a child process against a fixture repo, which is possible only because
  // the checker now takes `--root` — the third appearance of the same untestability defect
  // (#559's builder, gate-envelope, this).
  const dir = mkdtempSync(join(tmpdir(), 'aa-e2e-'));
  try {
    const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'test@example.com');
    git('config', 'user.name', 'test');

    mkdirSync(join(dir, 'skills', 'demo'), { recursive: true });
    const englishDoc = `# Demo\n\n${fence('yaml', 'a: 1')}${fence('python', 'x = 1')}`;
    writeFileSync(join(dir, 'skills', 'demo', 'SKILL.md'), englishDoc);
    git('add', '-A'); git('commit', '-qm', 'english');

    // The retag: `python` -> `text`. The BODY is byte-identical to English, so the body check
    // has nothing to say even before gating removes it — this isolates the tag-sequence path.
    mkdirSync(join(dir, 'i18n', 'de', 'skills', 'demo'), { recursive: true });
    writeFileSync(join(dir, 'i18n', 'de', 'skills', 'demo', 'SKILL.md'),
      englishDoc.replace('```python', '```text'));

    const run = (...extra) => spawnSync(process.execPath,
      [CHECKER, '--root', dir, '--json', ...extra], { encoding: 'utf8' });

    const { status, stdout } = run();
    const report = JSON.parse(stdout);
    const seq = report.findings.filter((f) => f.kind === 'tag-sequence');

    assert.equal(seq.length, 1, 'the retag must be found');
    assert.equal(seq[0].gated, true, 'and must be BLOCKING, not informational');
    assert.match(seq[0].tag, /#2 python->text/);
    assert.equal(report.tagSequenceFindings, 1);
    assert.equal(status, 1, 'the gate must exit non-zero');

    // `--warn` reports the same finding at exit 0. Without this, a mutation making everything
    // non-blocking would be caught, but one making --warn blocking would not.
    const warned = run('--warn');
    assert.equal(warned.status, 0);
    assert.equal(JSON.parse(warned.stdout).tagSequenceFindings, 1);
  } finally {
    rmTree(dir);
  }
});

test('isRetagEscape separates the two populations #598 catalogued', () => {
  // The escape is a fence LEAVING the gated set. Both other directions keep it inside, so the
  // body check still covers them and nothing is hidden.
  assert.equal(isRetagEscape([{ index: 1, english: 'python', translated: 'text' }]), true);
  assert.equal(isRetagEscape([{ index: 1, english: 'bash', translated: 'yaml' }]), false,
    'frozen -> frozen loses no coverage');
  assert.equal(isRetagEscape([{ index: 1, english: 'text', translated: 'python' }]), false,
    'the reverse direction ADDS coverage; it is drift, not an escape');
  assert.equal(isRetagEscape([{ index: 1, english: 'md', translated: 'markdown' }]), false,
    'both sides localisable is not an escape either');
  // One escape among several drift positions still blocks: the file is the unit of judgement.
  assert.equal(isRetagEscape([
    { index: 1, english: 'bash', translated: 'yaml' },
    { index: 4, english: 'python', translated: 'md' },
  ]), true);
});

test('foldedTagSequence emits no comma and no empty tag — the join alphabet the pool depends on', () => {
  // Sequences are pooled as `seq.join(',')` and their length is recovered by splitting that
  // string back apart, so a tag containing a comma would inflate the recovered length and a tag
  // that is the empty string would collide with the no-fence revision. Both are unreachable
  // today: `lang` is the [0] segment of a split whose delimiter class already contains the
  // comma, and the two fallbacks are comma-free literals. That is a property of the extractor,
  // not of the corpus — and #676 removed the last caller that carried a true array length
  // alongside the joined form, so nothing else would disagree if it ever stopped holding.
  const alphabet = (src) => foldedTagSequence(src);
  for (const tag of alphabet([
    '```js,foo', 'x', '```', '', '```{r setup}', 'y', '```', '', '```', 'z', '```', '', '```JSON',
    'w', '```',
  ].join('\n'))) {
    assert.ok(!tag.includes(','), `folded tag ${JSON.stringify(tag)} contains a comma`);
    assert.notEqual(tag, '', 'folded tag is the empty string');
  }
  // Named explicitly rather than left to the loop: the info string most likely to smuggle one in.
  assert.deepEqual(alphabet('```js,foo\nx\n```\n'), ['js']);
  assert.deepEqual(alphabet('```{r}\nx\n```\n'), ['{']);
  assert.deepEqual(alphabet('```\nx\n```\n'), ['text']);
});

test('isRetagEscape treats a brace fence as frozen — the escape must not survive its own fix', () => {
  // `foldedTagSequence` emits `{` for ```{r} precisely so this classifies as an escape. If the
  // fold ever collapsed braces to `text` this would silently become drift and stop blocking.
  assert.equal(isRetagEscape([{ index: 1, english: '{', translated: 'text' }]), true);
  assert.equal(isRetagEscape([{ index: 1, english: '{', translated: 'r' }]), false);
});

test('END TO END: a frozen-to-frozen retag is DRIFT — reported, not blocking', () => {
  // #598 finding 2/3: `bash`->`yaml` in `harden-github-repo-security`, and the javascript/
  // typescript reordering in `annotate-source-files`. Neither frees a fence from the gate, so
  // the body check still covers every one of them; the cause is a partial update and the remedy
  // is retranslation. Driven through the real checker because the split lives in its wiring.
  const dir = mkdtempSync(join(tmpdir(), 'aa-e2e-drift-'));
  try {
    const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'test@example.com');
    git('config', 'user.name', 'test');
    mkdirSync(join(dir, 'skills', 'demo'), { recursive: true });
    const englishDoc = `# Demo\n\n${fence('yaml', 'a: 1')}${fence('bash', 'ls')}`;
    writeFileSync(join(dir, 'skills', 'demo', 'SKILL.md'), englishDoc);
    git('add', '-A'); git('commit', '-qm', 'english');

    // `bash` -> `sh`: a tag no English revision carries at that position, both sides frozen.
    // The BODY is byte-identical, isolating the sequence path from the body path.
    mkdirSync(join(dir, 'i18n', 'de', 'skills', 'demo'), { recursive: true });
    writeFileSync(join(dir, 'i18n', 'de', 'skills', 'demo', 'SKILL.md'),
      englishDoc.replace('```bash', '```sh'));

    const r = spawnSync(process.execPath, [CHECKER, '--root', dir, '--json'], { encoding: 'utf8' });
    const report = JSON.parse(r.stdout);

    assert.equal(report.tagSequenceDrift, 1, 'the mismatch must still be SEEN');
    assert.equal(report.tagSequenceFindings, 0, 'but it is not the escape');
    assert.equal(report.violations, 0, 'and it must not fail the run');
    assert.equal(r.status, 0);

    const drift = report.findings.find((f) => f.kind === 'tag-drift');
    assert.ok(drift, 'drift is a reported finding, not a silent discard');
    assert.equal(drift.gated, false);
    assert.match(drift.tag, /#2 bash->sh/);
    // Never re-merged into the blocking population by a consumer reading `unalignable`.
    assert.equal(report.tagSequenceUnalignable, 0);
  } finally {
    rmTree(dir);
  }
});

test('END TO END: an unretagged translation leaves the gate green', () => {
  // Non-vacuity control for the test above: if the fixture produced a finding for some unrelated
  // reason, the assertions there would pass for the wrong cause.
  const dir = mkdtempSync(join(tmpdir(), 'aa-e2e-clean-'));
  try {
    const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'test@example.com');
    git('config', 'user.name', 'test');
    mkdirSync(join(dir, 'skills', 'demo'), { recursive: true });
    const englishDoc = `# Demo\n\n${fence('yaml', 'a: 1')}${fence('python', 'x = 1')}`;
    writeFileSync(join(dir, 'skills', 'demo', 'SKILL.md'), englishDoc);
    git('add', '-A'); git('commit', '-qm', 'english');

    mkdirSync(join(dir, 'i18n', 'de', 'skills', 'demo'), { recursive: true });
    writeFileSync(join(dir, 'i18n', 'de', 'skills', 'demo', 'SKILL.md'),
      englishDoc.replace('# Demo', '# Demo auf Deutsch'));

    const r = spawnSync(process.execPath, [CHECKER, '--root', dir, '--json'], { encoding: 'utf8' });
    const report = JSON.parse(r.stdout);
    assert.equal(report.tagSequenceFindings, 0);
    assert.equal(report.filesCompared, 1, 'the fixture must actually have been compared');
    assert.equal(r.status, 0);
  } finally {
    rmTree(dir);
  }
});
