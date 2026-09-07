/**
 * Pins the `translator:` stub value across the three places it lives (#545).
 *
 * `scripts/translate-content.sh` stamps the value; `i18n/README.md` documents it; and
 * `tools/translator-stamp.mjs` reads it from the scaffolder rather than carrying a copy. This
 * test drives that same reader — not a second regex — so the assertions cover the accept rule
 * the tool actually applies.
 *
 * The first review of this file caught it pinning a DENYLIST (`/review|human/`) and calling
 * that a value pin: a regression to `"claude"`, the corpus's most common value, would have
 * passed it and made every scaffold claim Claude translated it — the #545 defect in a different
 * coat. So the pin is now the literal, and the denylist stays only as documentation of the
 * property the literal must keep. The same review found two silent branches: deleting ONE of
 * the two scaffolder lines left one match, one distinct value, and every test green, while the
 * path that lost its line shipped scaffolds with no `translator:` field at all; and the
 * two-distinct-values refusal had no test. Both are pinned below.
 *
 * The scaffolder is bash, which `mutation-check` cannot syntax-check (#758), so this file is
 * what stands between the value and a silent return.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ROOT, SCAFFOLDER, scaffolderStamps, stubValueFromScaffolder } from '../../tools/translator-stamp.mjs';
import { rmTree } from './_tmp.js';

const README = join(ROOT, 'i18n', 'README.md');
const STUB_VALUE = '(untranslated stub)';

/** The `translator:` line inside the README's frontmatter example fence. */
function readmeExampleValue() {
  const text = readFileSync(README, 'utf8');
  const fence = /```yaml\r?\n([\s\S]*?)```/.exec(text);
  assert.ok(fence, 'i18n/README.md has a ```yaml frontmatter example');
  const m = /^translator: "([^"]+)"/m.exec(fence[1]);
  assert.ok(m, 'the example carries a quoted translator: line');
  return m[1];
}

/** A throwaway scaffolder carrying the given stamp lines, for the refusal branches. */
function withScaffolder(lines, fn) {
  const dir = mkdtempSync(join(tmpdir(), 'translator-stamp-'));
  try {
    const path = join(dir, 'translate-content.sh');
    writeFileSync(path, lines.map((v) => `  translator: \\"${v}\\"\\\\\n`).join(''));
    return fn(path);
  } finally {
    rmTree(dir);
  }
}

test('the scaffolder stamps exactly the stub value, which asserts neither a review nor a human', () => {
  const value = stubValueFromScaffolder(SCAFFOLDER);
  assert.equal(value, STUB_VALUE);
  assert.doesNotMatch(value, /review|human/i, `scaffold value "${value}" claims work that a copy has not done`);
});

test('both scaffolder insertion paths stamp the field', () => {
  assert.equal(scaffolderStamps(SCAFFOLDER).length, 2, 'skills path and agents/teams/guides path each stamp translator:');
});

test('the README frontmatter example shows the value the scaffolder stamps', () => {
  assert.equal(readmeExampleValue(), stubValueFromScaffolder(SCAFFOLDER));
});

test('a scaffolder without a quoted value is a measurement failure, not a value', () => {
  assert.throws(() => stubValueFromScaffolder(join(ROOT, 'package.json')), /no quoted translator value/);
});

test('a scaffolder stamping two different values is refused, not averaged', () => {
  withScaffolder([STUB_VALUE, 'claude'], (path) => {
    assert.throws(() => stubValueFromScaffolder(path), /2 different translator values/);
  });
});

test('a scaffolder whose value is a shell expansion is refused, not stamped literally', () => {
  withScaffolder(['$STUB_VALUE', '$STUB_VALUE'], (path) => {
    assert.throws(() => stubValueFromScaffolder(path), /not a literal/);
  });
});
