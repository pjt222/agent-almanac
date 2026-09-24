/**
 * Unit tests for `scripts/lib/readme-sections.js` (#566).
 *
 * `scripts/generate-readmes.js` writes nine committed files and had no unit test at all,
 * because it cannot be imported: it reads the registries and runs its MANAGED loop at module
 * scope, so an `import()` from a test writes all nine files. The measured cost of that gap —
 * deleting the core line of #560's fix left the whole suite green:
 *
 *     mutation-check --file scripts/generate-readmes.js \
 *       --delete-matching 'const cell = (ct) =>' --test 'npm run test:scripts'
 *     -> MUTANT SURVIVED
 *
 * That line now lives in `renderTranslationsTable`, and the last test below is the one that
 * kills it. Everything else here exists so the extraction itself is covered rather than
 * trusted.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  replaceSection, applySections, renderTranslationsTable, renderLocaleTable,
  FALLBACK_MARK, UNMEASURED, declaresBash,
} from '../lib/readme-sections.js';

const doc = (inner) => [
  '# Title',
  'Hand-written prose above.',
  '<!-- AUTO:START:stats -->',
  inner,
  '<!-- AUTO:END:stats -->',
  'Hand-written prose below.',
  '',
].join('\n');

// ── replaceSection ──────────────────────────────────────────────────────────

test('replaceSection swaps the body and leaves everything else byte-identical', () => {
  const before = doc('old body');
  const { content, matched } = replaceSection(before, 'stats', 'new body');
  assert.equal(matched, true);
  assert.equal(content, doc('new body'));
  // The hand-written halves are what a generator must never touch.
  assert.ok(content.includes('Hand-written prose above.'));
  assert.ok(content.includes('Hand-written prose below.'));
});

test('replaceSection round-trips a multi-line body', () => {
  const body = ['| a | b |', '|---|---|', '| 1 | 2 |'].join('\n');
  const { content } = replaceSection(doc('x'), 'stats', body);
  assert.equal(content, doc(body));
});

test('replaceSection is idempotent', () => {
  const once = replaceSection(doc('x'), 'stats', 'y').content;
  const twice = replaceSection(once, 'stats', 'y').content;
  assert.equal(once, twice);
});

test('replaceSection reports a miss instead of silently returning the input', () => {
  // The defect this shape exists to prevent: it used to `console.warn` and return the content
  // unchanged, so `--check` computed "no change" and exited 0 on a warning nobody reads in a
  // green job. Deleting a marker pair was permanent silent drift — the section stopped being
  // generated for good, and the healer took the same path, so nothing could repair it.
  const noMarkers = '# Title\nNo markers here at all.\n';
  const { content, matched } = replaceSection(noMarkers, 'stats', 'new body');
  assert.equal(matched, false, 'a missing marker must be REPORTED, not swallowed');
  assert.equal(content, noMarkers, 'and the content must be left alone for the caller to decide');

  // Half a pair is still a miss — an END without a START, and vice versa.
  assert.equal(replaceSection('<!-- AUTO:START:stats -->\nx\n', 'stats', 'y').matched, false);
  assert.equal(replaceSection('<!-- AUTO:END:stats -->\n', 'stats', 'y').matched, false);
});

test('an INVERTED marker pair is a miss, not a silent corruption', () => {
  // Pre-existing logic, faithfully moved — and wrong. With END above START the slices
  // overlap, so the function reported success while the output duplicated essentially the
  // whole document, and grew again on every run. Half-pairs were tested; this third
  // malformed case was not.
  const inverted = '<!-- AUTO:END:stats -->\nmid\n<!-- AUTO:START:stats -->\n';
  const { content, matched } = replaceSection(inverted, 'stats', 'y');
  assert.equal(matched, false, 'an inverted pair must not report success');
  assert.equal(content, inverted, 'and must not be rewritten');

  // The property that actually matters: it cannot grow the document.
  const once = replaceSection(inverted, 'stats', 'y').content;
  const twice = replaceSection(once, 'stats', 'y').content;
  assert.equal(once.length, inverted.length);
  assert.equal(twice, once);
});

// ── applySections: the policy, where a test can reach it ────────────────────

test('applySections reports every missing section, so the caller can be fatal', () => {
  // MAJOR finding of the #579 review. After replaceSection moved to this lib, the
  // "a miss is fatal" wiring sat in generate-readmes.js — the file this extraction exists
  // because nobody can import. Deleting one line there left every gate green: the permanent
  // silent drift defect, recreated one level up.
  const { content, missing } = applySections(doc('old'), {
    stats: () => 'new',
    absent: () => 'never placed',
  });
  assert.deepEqual(missing, ['absent']);
  assert.ok(content.includes('\nnew\n'), 'the section that DID match is still applied');
});

test('applySections reports nothing missing when every marker is present', () => {
  const { missing } = applySections(doc('old'), { stats: () => 'new' });
  assert.deepEqual(missing, []);
});

test('applySections threads content through several sections in order', () => {
  const two = [
    '<!-- AUTO:START:alpha -->', 'A', '<!-- AUTO:END:alpha -->',
    '<!-- AUTO:START:beta -->', 'B', '<!-- AUTO:END:beta -->', '',
  ].join('\n');
  const { content, missing } = applySections(two, { alpha: () => 'A2', beta: () => 'B2' });
  assert.deepEqual(missing, []);
  assert.ok(content.includes('\nA2\n') && content.includes('\nB2\n'),
    'a fold that dropped earlier results would lose one of these');
});

test('replaceSection touches only the named section', () => {
  const two = [
    '<!-- AUTO:START:alpha -->', 'A', '<!-- AUTO:END:alpha -->',
    '<!-- AUTO:START:beta -->', 'B', '<!-- AUTO:END:beta -->', '',
  ].join('\n');
  const { content } = replaceSection(two, 'beta', 'B2');
  assert.ok(content.includes('\nA\n'), 'alpha must be untouched');
  assert.ok(content.includes('\nB2\n'));
  assert.ok(!content.includes('\nB\n'));
});

// ── renderTranslationsTable ─────────────────────────────────────────────────

const SOURCE = { skills: 369, agents: 75, teams: 22, guides: 34, total: 500 };

/**
 * A four-tree literal, and it is CORRECT to keep — do not "fix" it to `CONTENT_TYPES` (#585).
 *
 * #578 routed the production consumers through the SSOT and A10 now asserts the shell and YAML
 * ones against it, so a literal here looks like the one that got away. It is not.
 *
 * `TYPES` is the third ARGUMENT of `renderTranslationsTable`, which production fills with
 * `CONTENT_TYPES` at `generate-readmes.js:638`. These are unit tests of a pure renderer, and
 * pinning its input locally is what keeps them unit tests: derive it, and a legitimate fifth
 * tree turns this file red for a reason that has nothing to do with the renderer. That is
 * noise, not detection.
 *
 * Note what does NOT justify keeping it — an earlier version of this comment claimed a derived
 * `TYPES` would make the assertions "move with it, agreeing with the broken value and reporting
 * green". That is backwards. The assertions below are hardcoded regexes over rendered rows
 * (`| 328/369 | 3/75 | 1/22 | 2/34 |`), so a truncated or reordered SSOT would drop or move a
 * column and they would go RED. They anchor the table's shape regardless of what is injected,
 * which is exactly why injecting a literal costs nothing here.
 *
 * SSOT corruption is caught elsewhere and does not need catching here: A10 goes red when the
 * SSOT disagrees with any of the eight shell/YAML sites, and `content-types-propagation.test.js`
 * pins the JS consumers.
 */
const TYPES = ['skills', 'agents', 'teams', 'guides'];

const coverageOf = (translated, stubs, unjudged) => ({
  skills: { translated: translated - 6, total: 369 },
  agents: { translated: 3, total: 75 },
  teams: { translated: 1, total: 22 },
  guides: { translated: 2, total: 34 },
  total: { translated, total: 500, pct: 66.8, stubs, unjudged },
});

test('a measured locale renders the STATUS figures, not a file count', () => {
  // The #560 regression, frozen. The status file says 334 translated with 35 stubs; a
  // generator that counted files would render 369 (334 + 35), which is precisely the defect
  // that sat on the repo front page for months.
  const rendered = renderTranslationsTable(
    [{
      code: 'de',
      name: 'Deutsch',
      coverage: coverageOf(334, 35, 14),
      // Deliberately populated and DIFFERENT, so a renderer reading the wrong field is caught.
      fallback: { counts: { skills: 369, agents: 6, teams: 6, guides: 5 }, total: 386 },
    }],
    SOURCE,
    TYPES,
  );

  assert.match(rendered, /\| de \| Deutsch \| 328\/369 \| 3\/75 \| 1\/22 \| 2\/34 \| 334\/500 \(66\.8%\) \| 35 \| 14 \|/);
  assert.ok(!rendered.includes('386'), 'the file count must not appear anywhere');
  assert.ok(!rendered.includes(FALLBACK_MARK), 'a measured row carries no fallback mark');
});

test('pct and denominators are rendered verbatim, never recomputed', () => {
  // Recomputing pct here with different rounding than generate-translation-status.js is
  // #560's two-derivations defect rebuilt inside a single cell — and the parity gate would
  // then be permanently red.
  const coverage = coverageOf(334, 35, 14);
  coverage.total.pct = 66.8;
  const a = renderTranslationsTable(
    [{ code: 'de', name: 'D', coverage, fallback: { counts: {}, total: 0 } }], SOURCE, TYPES,
  );
  assert.match(a, /\(66\.8%\)/);

  coverage.total.pct = 70;
  const b = renderTranslationsTable(
    [{ code: 'de', name: 'D', coverage, fallback: { counts: {}, total: 0 } }], SOURCE, TYPES,
  );
  assert.match(b, /\(70%\)/, 'a whole-number pct must not gain a .0');
});

test('a locale with no status file falls back, and SAYS so', () => {
  const rendered = renderTranslationsTable(
    [{
      code: 'xx',
      name: 'Xish',
      coverage: null,
      fallback: { counts: { skills: 9, agents: 1, teams: 1, guides: 1 }, total: 12 },
    }],
    SOURCE,
    TYPES,
  );

  // EVERY number cell marked — a partially marked row presents unmeasured numbers as measured.
  assert.match(rendered, new RegExp(`9/369\\${FALLBACK_MARK}`));
  assert.match(rendered, new RegExp(`12/500 \\(2\\.4%\\)\\${FALLBACK_MARK}`));
  assert.match(rendered, new RegExp(`\\| ${UNMEASURED} \\| ${UNMEASURED} \\|`), 'stubs and unjudged are unmeasured');
  assert.match(rendered, /File count, not a measurement/, 'and the footnote must appear');
});

test('a PARTIAL status file falls back rather than rendering half a row', () => {
  // The predicate lives in the renderer on purpose. A coverage object missing one content
  // type would otherwise render `undefined/undefined` in that cell.
  const partial = coverageOf(334, 35, 14);
  delete partial.guides;
  const rendered = renderTranslationsTable(
    [{ code: 'de', name: 'D', coverage: partial, fallback: { counts: { skills: 1, agents: 1, teams: 1, guides: 1 }, total: 4 } }],
    SOURCE,
    TYPES,
  );
  assert.ok(!rendered.includes('undefined'));
  assert.match(rendered, new RegExp(`\\${FALLBACK_MARK}`));
});

// ── renderLocaleTable (i18n/README.md) ──────────────────────────────────────

test('the locale table renders measured figures for every configured locale', () => {
  // #569: this table was hand-maintained, listed 4 of 10 locales, and every count was wrong —
  // sitting directly above the section explaining what the numbers mean.
  const rendered = renderLocaleTable([
    { code: 'de', name: 'Deutsch', coverage: { ...coverageOf(334, 35, 14), total: { translated: 334, total: 500, pct: 66.8, stale: 160 } } },
    { code: 'ja', name: '日本語', coverage: { ...coverageOf(344, 26, 13), total: { translated: 344, total: 500, pct: 68.8, stale: 159 } } },
  ], TYPES);

  assert.match(rendered, /\| de \| Deutsch \| 328\/369 \| 3\/75 \| 1\/22 \| 2\/34 \| 334\/500 \(66\.8%\) \| 160 \|/);
  assert.match(rendered, /\| ja \| 日本語 \|/);
  // Every configured locale gets a row — the defect was a table listing a SUBSET (4 of 10).
  const dataRows = rendered.split('\n').filter((l) => /^\| [a-z]/.test(l));
  assert.equal(dataRows.length, 2, `expected one row per locale, got:\n${dataRows.join('\n')}`);
});

test('a locale with no status file is UNMEASURED, not zero', () => {
  // Printing 0 would assert it had been measured at 0%. It has not been measured.
  const rendered = renderLocaleTable([{ code: 'xx', name: 'Xish', coverage: null }], TYPES);
  assert.match(rendered, new RegExp(`\\| xx \\| Xish \\| ${UNMEASURED} \\|`));
  assert.ok(!/\| 0\//.test(rendered), 'must not render a zero it never measured');
});

test('a PARTIAL coverage object is unmeasured rather than half-rendered', () => {
  const partial = coverageOf(334, 35, 14);
  delete partial.teams;
  const rendered = renderLocaleTable([{ code: 'de', name: 'D', coverage: partial }], TYPES);
  assert.ok(!rendered.includes('undefined'));
  assert.match(rendered, new RegExp(`\\| de \\| D \\| ${UNMEASURED} \\|`));
});

test('the footnote appears only when something actually fell back', () => {
  const allMeasured = renderTranslationsTable(
    [{ code: 'de', name: 'D', coverage: coverageOf(334, 35, 14), fallback: { counts: {}, total: 0 } }],
    SOURCE,
    TYPES,
  );
  assert.ok(!allMeasured.includes('File count, not a measurement'));
});

// ── #600: the SECURITY.md Bash predicate ────────────────────────────────────

test('declaresBash reads both spellings the corpus actually uses', () => {
  // The claim this backs — "N of M skills declare Bash" — was previously hand-maintained with
  // NO stated predicate, so nobody could check it, and it was wrong in both terms. Two spellings
  // exist and a naive grep sees one.
  const inline = '---\nname: x\nallowed-tools: Read Write Edit Bash Grep Glob\n---\n\n# x\n';
  const block = '---\nname: x\nallowed-tools:\n  - Bash\n  - Read\nmetadata:\n  domain: general\n---\n\n# x\n';
  assert.equal(declaresBash(inline), true, 'inline form');
  assert.equal(declaresBash(block), true, 'block form — one real skill uses it');
});

test('declaresBash is false when Bash is absent, in either spelling', () => {
  assert.equal(declaresBash('---\nname: x\nallowed-tools: Read Write Grep\n---\n'), false);
  assert.equal(declaresBash('---\nname: x\nallowed-tools:\n  - Read\n  - Glob\n---\n'), false);
  assert.equal(declaresBash('---\nname: x\n---\n'), false, 'no allowed-tools at all');
  assert.equal(declaresBash('# no frontmatter\n'), false);
});

test('declaresBash matches the token, not a substring of it', () => {
  // `\bBash\b` on the inline form and a whole-item match on the block form. Without this a
  // future `Bashful` or `NotBash` tool name silently inflates a number in SECURITY.md, which is
  // the document whose whole job is to be checkable.
  assert.equal(declaresBash('---\nallowed-tools: Read Bashful Grep\n---\n'), false);
  assert.equal(declaresBash('---\nallowed-tools:\n  - Bashful\n---\n'), false);
  assert.equal(declaresBash('---\nallowed-tools:\n  - Bash\n---\n'), true);
});

test('declaresBash reads the FRONTMATTER, not the body', () => {
  // A skill whose procedure quotes `allowed-tools: Bash` in a code fence must not count. The
  // body of a skills corpus is full of examples of skill frontmatter.
  const bodyOnly = '---\nname: x\nallowed-tools: Read\n---\n\n# x\n\n```yaml\nallowed-tools: Bash\n```\n';
  assert.equal(declaresBash(bodyOnly), false);
});

test('declaresBash fails closed on an unclosed frontmatter opener', () => {
  // The fallback this replaces scanned the WHOLE FILE, which is the one case where "frontmatter,
  // not body" has to hold and did not. Found by review, not by the four tests written first —
  // all of which used well-formed input, because I wrote both the predicate and its fixtures.
  const unclosed = '---\nname: x\nallowed-tools: Read\n\n# body\n\n```yaml\nallowed-tools: Bash\n```\n';
  assert.equal(declaresBash(unclosed), false);
});

test('declaresBash: the known latent classes, pinned rather than left to be rediscovered', () => {
  // None occurs in this corpus today. The function is exported and documented as THE predicate,
  // so it travels — and each of these is a plausible future spelling.
  //
  // A trailing YAML comment on the inline form is a FALSE POSITIVE the word-boundary cannot see:
  assert.equal(declaresBash('---\nallowed-tools: Read  # not Bash\n---\n'), true,
    'known limitation: a commented mention counts. Recorded, not fixed — parsing YAML comments '
    + 'here means parsing YAML, and the corpus has no instance.');
  // A quoted or commented block item is a FALSE NEGATIVE for the same reason:
  assert.equal(declaresBash('---\nallowed-tools:\n  - "Bash"\n---\n'), false,
    'known limitation: a quoted item does not count.');
  // And a hyphenated tool name matches, because `-` is a word boundary:
  assert.equal(declaresBash('---\nallowed-tools: Bash-lite\n---\n'), true,
    'known limitation: `\\bBash\\b` accepts `Bash-anything`.');
});
