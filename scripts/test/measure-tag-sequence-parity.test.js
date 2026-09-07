/**
 * `measure-tag-sequence-parity.js` is the REPRODUCER, and it had stopped reproducing (#612).
 *
 * `fences.js` cites this script as the instrument the tag-sequence finding set was tuned against,
 * and `debt-ratchet.yml` ratchets that finding set. So the script is not a scratch measurement —
 * it is the evidence a gate's member list was judged from. It carried its own tag fold,
 * `lang === '' ? 'text' : lang`, which collapses a brace-info fence to `text` where production's
 * `foldedTagSequence` folds it to `{`. The `{` placeholder exists precisely so an English ```{r}
 * cannot be swapped for a localisable ```text with neither the sequence check nor the body check
 * seeing it — so the reproducer reintroduced the escape it was written to reproduce.
 *
 * It was latent: 0 of the 3,648 translated files walked, and no English source either, carries a
 * TOP-LEVEL brace-info fence — nested ones inside ````markdown wrappers are body text, not fences
 * — and the finding set is byte-identical before and after the repair. A corpus run therefore
 * proves nothing here, which is the whole reason this fixture exists. Plant the one shape the
 * corpus does not contain and the two folds disagree immediately.
 *
 * MUST-GO-RED, measured rather than asserted: restoring the local fold — importing
 * `extractFences` and re-deriving `foldedTagSequence` as `f.lang === '' ? 'text' : f.lang` —
 * fails 1 of 524 against `npm run test:scripts`, the command CI runs, and the 1 is the first test
 * below. Exit 1, one `AssertionError` reading "the brace-to-text escape must be seen", no crash
 * signature and no broad kill. Run against the npm script and not this file alone, because a
 * suite that never discovers a new file reports success (#486).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve, dirname } from 'path';
import { execFileSync, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { rmTree } from './_tmp.js';

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'measure-tag-sequence-parity.js');

/** A fixture repo carrying one English source and one mirror of it. */
function fixture(englishBody, translatedBody) {
  const dir = mkdtempSync(join(tmpdir(), 'aa-measure-'));
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
  git('init', '-q', '-b', 'main');
  git('config', 'user.email', 'test@example.com');
  git('config', 'user.name', 'test');

  mkdirSync(join(dir, 'skills', 'demo'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'demo', 'SKILL.md'), englishBody);
  git('add', '-A');
  git('commit', '-qm', 'english');

  mkdirSync(join(dir, 'i18n', 'de', 'skills', 'demo'), { recursive: true });
  writeFileSync(join(dir, 'i18n', 'de', 'skills', 'demo', 'SKILL.md'), translatedBody);
  return dir;
}

function measure(dir) {
  const run = spawnSync(process.execPath, [SCRIPT, '--root', dir, '--json'], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  return JSON.parse(run.stdout);
}

test('a brace fence retagged to `text` is a retag, not a clean file', () => {
  // THE #612 CASE. Under the local fold both sides read `['text']` and the file is clean; under
  // `foldedTagSequence` English is `['{']` and the mirror `['text']`, which is the escape.
  const english = '# Demo\n\n```{r}\nx <- 1\n```\n';
  const dir = fixture(english, english.replace('```{r}', '```text'));
  try {
    const report = measure(dir);
    assert.equal(report.totals.retag, 1, 'the brace-to-text escape must be seen');
    assert.equal(report.totals.clean, 0);
    assert.equal(report.totals.unalignable, 0, 'the counts match, so this is judged, not skipped');
  } finally {
    rmTree(dir);
  }
});

test('an untranslated brace fence stays clean — the non-vacuity control', () => {
  // Without this, the test above would pass just as well against a script that called everything
  // a retag. It also pins the half of the fold that was never in dispute: `{` equals `{`.
  const english = '# Demo\n\n```{r}\nx <- 1\n```\n';
  const dir = fixture(english, english.replace('# Demo', '# Demo auf Deutsch'));
  try {
    const report = measure(dir);
    assert.equal(report.totals.clean, 1);
    assert.equal(report.totals.retag, 0);
  } finally {
    rmTree(dir);
  }
});

test('--root moves BOTH halves of the comparison, not just the translation side', () => {
  // `collectTargets` comes from `check-i18n-fence-parity.js`, which parses `--root` at module
  // scope against the importer's argv. Before #612 this script did not read the flag itself, so
  // `--root /tmp/x` pointed the translation side at the fixture while `walkEnglishHistory` still
  // walked the real repo — every fixture file would then be an ORPHAN, since no English history
  // exists for `skills/demo` there. A non-zero judged population is what proves they agree.
  const english = '# Demo\n\n```yaml\na: 1\n```\n';
  const dir = fixture(english, english.replace('```yaml', '```text'));
  try {
    const report = measure(dir);
    assert.equal(report.totals.orphan, 0, 'the English side must have found the fixture too');
    assert.equal(report.totals.retag, 1);
  } finally {
    rmTree(dir);
  }
});
