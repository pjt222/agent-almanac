/**
 * Behavioural tests for `scripts/check-i18n-frontmatter-parity.js` (#485).
 *
 * There was no test file for this script before #485 extended it, and the extension is
 * exactly the kind that fails silently: `tags`, `domain`, `language`, `complexity` and
 * `author` are all nested under `metadata:`, so a column-anchored `^tags:` matches
 * **nothing** and the gate reports clean having compared zero fields. Measured before the
 * fix: 0 of 3,576 pairs found at indent 0, all 3,576 found at any indent.
 *
 * Two properties therefore matter more than the individual verdicts:
 *
 *   1. A nested field is actually compared — the vacuity guard.
 *   2. The number of comparisons matches what is on disk, so "clean" cannot mean
 *      "matched nothing". The script prints the field-comparison count for this reason and
 *      the tests assert on it.
 *
 * Fixtures cover BOTH frontmatter shapes this corpus carries (#533) and both value forms.
 * The shape varies per FILE, not per locale — `es` and `ja` each carry both.
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
const SCRIPT = 'scripts/check-i18n-frontmatter-parity.js';

/** English source: locale fields absent, everything else under `metadata:`. */
function english(over = {}) {
  const m = {
    author: 'Philipp Thoss',
    version: '"1.0"',
    domain: 'shiny',
    complexity: 'intermediate',
    language: 'R',
    tags: 'shiny, ui, theming',
    ...over,
  };
  return [
    '---',
    'name: demo-skill',
    'description: A demo skill.',
    'allowed-tools: Read Write Edit',
    'metadata:',
    ...Object.entries(m).map(([k, v]) => `  ${k}: ${v}`),
    '---',
    '',
    '# Demo Skill',
    '',
  ].join('\n');
}

/** Shape A — locale fields nested under `metadata:`, as de and zh-CN carry them. */
function shapeA(over = {}) {
  return english(over).replace('  author:', '  locale: de\n  source_locale: en\n  author:');
}

/** Shape B — locale fields at top level. Both shapes occur, per file, not per locale. */
function shapeB(over = {}) {
  return english(over).replace('allowed-tools:', 'locale: ja\nsource_locale: en\nallowed-tools:');
}

/**
 * Block form: `allowed-tools` as a YAML list at indent 0, and `tags` as a list nested
 * under `metadata:`. This is not hypothetical — `skills/install-almanac-content/SKILL.md`
 * carries block-form `allowed-tools` (grant `- Bash`) in English and all ten locales, and
 * 50 translated files carry block-form `tags`. Together that is 60 live field comparisons
 * the inline branch alone cannot see.
 *
 * Each list is followed by a sibling key at the SAME indent as its own key, which is what
 * exercises the block terminator: a terminator of `indent < keyIndent` never fires for a
 * column-0 key and swallows everything after it.
 */
function blockForm({ tools = ['Bash', 'Read', 'Glob'], tags = ['shiny', 'ui', 'theming'] } = {}) {
  return [
    '---',
    'name: demo-skill',
    'description: A demo skill.',
    'allowed-tools:',
    ...tools.map((t) => `  - ${t}`),
    'metadata:',
    '  author: Philipp Thoss',
    '  version: "1.0"',
    '  domain: shiny',
    '  complexity: intermediate',
    '  language: R',
    '  tags:',
    ...tags.map((t) => `    - ${t}`),
    '  locale: de',
    '---',
    '',
    '# Demo Skill',
    '',
  ].join('\n');
}

function fixture(t, translations) {
  const dir = mkdtempSync(join(tmpdir(), 'fm-parity-'));
  t.after(() => rmTree(dir));
  mkdirSync(join(dir, 'scripts'), { recursive: true });
  cpSync(join(REPO, SCRIPT), join(dir, SCRIPT));
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ type: 'module' }), 'utf8');

  mkdirSync(join(dir, 'skills', 'demo-skill'), { recursive: true });
  writeFileSync(join(dir, 'skills', 'demo-skill', 'SKILL.md'), english(), 'utf8');

  for (const [locale, body] of Object.entries(translations)) {
    const p = join(dir, 'i18n', locale, 'skills', 'demo-skill', 'SKILL.md');
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, body, 'utf8');
  }
  return dir;
}

function run(dir, args = []) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { cwd: dir, encoding: 'utf8' });
}

/** The `N field comparison(s)` the script reports. */
function comparisons(stdout) {
  const m = stdout.match(/(\d+) field comparison\(s\)/);
  return m ? Number(m[1]) : -1;
}

// --- the vacuity guard ----------------------------------------------------------------

test('a nested field is compared, not skipped — in both frontmatter shapes', () => {
  // The whole point. Under column anchoring these would be invisible and the run clean.
  for (const [label, make] of [['shape A (nested)', shapeA], ['shape B (top-level)', shapeB]]) {
    const dir = fixture({ after: () => {} }, { de: make({ tags: 'shiny, ui, INVENTED' }) });
    try {
      const r = run(dir, ['--warn']);
      assert.match(r.stdout, /MISMATCH/, `${label}: nested tags drift was not detected`);
      assert.match(r.stdout, /tags "shiny ui INVENTED" != source "shiny ui theming"/);
    } finally {
      rmTree(dir);
    }
  }
});

test('the comparison count matches what is on disk', () => {
  // "clean" must not be reachable by comparing nothing. Six gated fields are present on
  // the English source, so one translated pair must yield exactly six comparisons.
  const dir = fixture({ after: () => {} }, { de: shapeA() });
  try {
    const r = run(dir);
    assert.equal(r.status, 0, r.stdout);
    assert.equal(comparisons(r.stdout), 6, 'not every gated field was compared');
    assert.match(r.stdout, /1 translated skills against 1 English sources/);
  } finally {
    rmTree(dir);
  }
});

// --- block form, which the inline branch cannot see ------------------------------------

test('block-form allowed-tools is compared, at indent 0 with a sibling key after it', () => {
  // Deleting the block branch leaves every inline test green while silently dropping
  // `allowed-tools` on install-almanac-content — the skill granting `- Bash` — in all ten
  // locales. That is the #368/#371 drift class this gate exists for.
  const dir = mkdtempSync(join(tmpdir(), 'fm-parity-block-'));
  try {
    mkdirSync(join(dir, 'scripts'), { recursive: true });
    cpSync(join(REPO, SCRIPT), join(dir, SCRIPT));
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ type: 'module' }), 'utf8');
    mkdirSync(join(dir, 'skills', 'demo-skill'), { recursive: true });
    writeFileSync(join(dir, 'skills', 'demo-skill', 'SKILL.md'), blockForm(), 'utf8');

    const p = join(dir, 'i18n', 'de', 'skills', 'demo-skill', 'SKILL.md');
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, blockForm({ tools: ['Bash', 'Read'] }), 'utf8');

    const r = run(dir);
    assert.equal(r.status, 1, 'block-form allowed-tools drift was not detected');
    assert.match(r.stdout, /allowed-tools "Bash Read" != source "Bash Read Glob"/);
    // The list must stop at the sibling `metadata:` key rather than absorbing it. A
    // terminator of `indent < keyIndent` never fires for a column-0 key, and the value
    // would then read "Bash Read author ... tags shiny ui theming locale de" — which stays
    // symmetric on both sides, so only this assertion catches it.
    assert.doesNotMatch(r.stdout, /allowed-tools "[^"]*author/, 'the list ran past its sibling key');
  } finally {
    rmTree(dir);
  }
});

test('block-form tags nested under metadata is compared, and stops at its sibling', () => {
  const dir = mkdtempSync(join(tmpdir(), 'fm-parity-block2-'));
  try {
    mkdirSync(join(dir, 'scripts'), { recursive: true });
    cpSync(join(REPO, SCRIPT), join(dir, SCRIPT));
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ type: 'module' }), 'utf8');
    mkdirSync(join(dir, 'skills', 'demo-skill'), { recursive: true });
    writeFileSync(join(dir, 'skills', 'demo-skill', 'SKILL.md'), blockForm(), 'utf8');

    const p = join(dir, 'i18n', 'de', 'skills', 'demo-skill', 'SKILL.md');
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, blockForm({ tags: ['shiny', 'ui', 'INVENTED'] }), 'utf8');

    const r = run(dir);
    assert.equal(r.status, 1, 'block-form tags drift was not detected');
    assert.match(r.stdout, /tags "shiny ui INVENTED" != source "shiny ui theming"/);
    // `tags` sits at indent 2 with `locale: de` following at indent 2. The list must end
    // there rather than swallowing the sibling.
    assert.doesNotMatch(r.stdout, /tags "[^"]*locale/, 'the nested list ran past its sibling key');
  } finally {
    rmTree(dir);
  }
});

// --- version: direction, not equality --------------------------------------------------

test('a lagging version passes — a translation pins what it was made from', () => {
  // 317 of 3,576 real pairs lag. Gating equality would fail them all for being correct.
  const dir = fixture({ after: () => {} }, { de: shapeA({ version: '"0.9"' }) });
  try {
    const r = run(dir);
    assert.equal(r.status, 0, r.stdout);
    // Scoped to a reported problem: the summary line legitimately names `version`, so a
    // bare /version/i match is too loose.
    assert.doesNotMatch(r.stdout, /(MISMATCH|MISSING|EXTRA|AHEAD)\] .*version /, 'a lagging version was gated');
    assert.match(r.stdout, /1 version\(s\) checked for direction/, 'the version check did not run');
  } finally {
    rmTree(dir);
  }
});

test('a version AHEAD of its source fails — nothing legitimate produces one', () => {
  // Paired with the test above, which is what stops that one being vacuous: a check that
  // passes a lagging version would also pass if it examined nothing at all.
  const dir = fixture({ after: () => {} }, { de: shapeA({ version: '"1.1"' }) });
  try {
    const r = run(dir);
    assert.equal(r.status, 1, 'a translation ahead of its source did not fail the gate');
    assert.match(r.stdout, /AHEAD\] .*version "1\.1" is ahead of source "1\.0"/);
  } finally {
    rmTree(dir);
  }
});

test('version direction compares numerically, not as strings', () => {
  // '10' < '9' as strings. A string comparison would call 1.10 "ahead" of 1.9 and,
  // worse, call a genuinely-ahead 1.9 "behind" 1.10 — a false pass.
  const behind = fixture({ after: () => {} }, { de: shapeA({ version: '"1.9"' }) });
  try {
    // English is 1.0, so 1.9 IS ahead and must fail regardless of segment width.
    assert.equal(run(behind).status, 1);
  } finally {
    rmTree(behind);
  }
});

// --- each verdict fires ----------------------------------------------------------------

test('every gated field is actually gated', () => {
  const cases = [
    ['tags', { tags: 'shiny, ui, other' }],
    ['domain', { domain: 'r-packages' }],
    ['language', { language: 'natural' }],
    ['complexity', { complexity: 'basic' }],
    ['author', { author: 'Someone Else' }],
  ];
  for (const [field, over] of cases) {
    const dir = fixture({ after: () => {} }, { de: shapeA(over) });
    try {
      const r = run(dir);
      assert.equal(r.status, 1, `${field} drift did not fail the gate`);
      assert.match(r.stdout, new RegExp(`MISMATCH\\] .*${field} `), `${field} was not reported`);
    } finally {
      rmTree(dir);
    }
  }
});

test('allowed-tools at column 0 still works after the indent change', () => {
  const dir = fixture({ after: () => {} }, { de: shapeA().replace('allowed-tools: Read Write Edit', 'allowed-tools: Read Write') });
  try {
    const r = run(dir);
    assert.equal(r.status, 1);
    assert.match(r.stdout, /allowed-tools "Read Write" != source "Read Write Edit"/);
  } finally {
    rmTree(dir);
  }
});

test('a field the translation drops is MISSING; one it invents is EXTRA', () => {
  const dropped = shapeA().replace('  tags: shiny, ui, theming\n', '');
  const missing = fixture({ after: () => {} }, { de: dropped });
  try {
    const r = run(missing, ['--warn']);
    assert.match(r.stdout, /MISSING\] .*tags absent/);
  } finally {
    rmTree(missing);
  }

  // English without tags, translation with them.
  const dir = mkdtempSync(join(tmpdir(), 'fm-parity-extra-'));
  try {
    mkdirSync(join(dir, 'scripts'), { recursive: true });
    cpSync(join(REPO, SCRIPT), join(dir, SCRIPT));
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ type: 'module' }), 'utf8');
    mkdirSync(join(dir, 'skills', 'demo-skill'), { recursive: true });
    writeFileSync(
      join(dir, 'skills', 'demo-skill', 'SKILL.md'),
      english().replace('  tags: shiny, ui, theming\n', ''),
      'utf8',
    );
    const p = join(dir, 'i18n', 'de', 'skills', 'demo-skill', 'SKILL.md');
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, shapeA(), 'utf8');
    const r = run(dir, ['--warn']);
    assert.match(r.stdout, /EXTRA\] .*tags .*but English source has no such field/);
  } finally {
    rmTree(dir);
  }
});

test('a translation with no English source is an ORPHAN', () => {
  const dir = fixture({ after: () => {} }, { de: shapeA() });
  try {
    const p = join(dir, 'i18n', 'de', 'skills', 'ghost-skill', 'SKILL.md');
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, shapeA(), 'utf8');
    const r = run(dir, ['--warn']);
    assert.match(r.stdout, /ORPHAN\] .*ghost-skill/);
  } finally {
    rmTree(dir);
  }
});

// --- exit posture ----------------------------------------------------------------------

test('--warn reports without failing; the bare run fails', () => {
  const dir = fixture({ after: () => {} }, { de: shapeA({ tags: 'drifted' }) });
  try {
    assert.equal(run(dir, ['--warn']).status, 0, '--warn should not fail the build');
    assert.equal(run(dir).status, 1, 'the gate should be blocking by default');
  } finally {
    rmTree(dir);
  }
});
