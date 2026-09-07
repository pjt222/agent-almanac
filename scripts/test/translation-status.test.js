/**
 * Unit tests for `scripts/lib/translation-status.js`.
 *
 * There was no test file for `generate-translation-status.js` at all, which is how #473 and
 * #532 both survived in the same twelve lines. The script is also unrunnable as a test: it
 * walks ten locales over an NTFS mount and takes ~10 minutes (#305). Extracting the verdict
 * into a pure function is what makes these assertions possible at all.
 *
 * Each test below names the failure it exists to catch. The three that matter most:
 *
 *   - a CRLF copy of an English body is still a scaffold (#532),
 *   - a scaffold stays a scaffold after English moves on (#473 — the window),
 *   - a scaffold assembled from two different English revisions is still a scaffold
 *     (surgical mirror propagation, which is why comparing against the `source_commit`
 *     blob does not work — measured on the four `harden-github-repo-security` files).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readdirSync, statSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import {
  stripFrontmatter,
  openLines,
  substantiveLines,
  classifyTranslation,
  buildEnglishProseHistory,
  hidesLines,
  hidesKnownProse,
  rawComparableLines,
  frontmatterUnparsed,
  UNJUDGED_REASONS,
  translationKey,
  REQUIRED_SCRIPT,
  MIN_LINES_TO_JUDGE,
} from '../lib/translation-status.js';
import { TREES, fenceShape, hasSwallowedOpener, extractFences, isGated, toLines } from '../lib/fences.js';
import { rmTree } from './_tmp.js';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

// ── fixtures ────────────────────────────────────────────────────────────────

const ENGLISH_BODY = [
  '# Create R Package',
  '',
  '## When to Use',
  '',
  'Use this skill when starting a new R package from scratch.',
  'It covers the directory layout and the DESCRIPTION file.',
  '',
  '## Procedure',
  '',
  '1. Run the scaffolding command shown below.',
  '',
  '```bash',
  'usethis::create_package("mypkg")',
  '```',
  '',
  'Verify the package directory was created before continuing.',
  'The DESCRIPTION file must name an author and a maintainer.',
  '',
].join('\n');

const withFrontmatter = (body, extra = '') => [
  '---',
  'name: create-r-package',
  'description: Scaffold an R package',
  extra,
  '---',
  body,
].filter((l) => l !== '').join('\n');

/** A pool that exists but holds nothing — distinct from having no English source at all. */
const emptyPool = () => ({ lines: new Set(), fenceShapes: new Set() });

/**
 * The English pool for `bodies`: every substantive line, and every fence shape.
 *
 * Both halves together, because `classifyTranslation` takes one paired object rather than two
 * parameters. While they were separate, a caller could pass prose and forget shapes, losing
 * the #561 check with no symptom — the pairing makes that unrepresentable.
 */
const poolOf = (...bodies) => ({
  lines: new Set(bodies.flatMap((b) => substantiveLines(b))),
  // Every fixture body is a legitimate English revision, so its own shape is in the pool.
  fenceShapes: new Set(bodies.map((b) => fenceShape(b))),
  // Mirrors buildEnglishProseHistory's third collector. A fixture pool missing this cannot
  // distinguish the cross-pool fix from its absence -- the reviewer's own proof file predated
  // the field, and its regression test could only ever fail for that reason.
  fenceLines: new Set(bodies.flatMap((body) => {
    const lines = toLines(body);
    return extractFences(body).flatMap((f) => [
      // Every fence's OPENER line — they are dropped by `openLines` and so sit in no other
      // pool, which let an exposed ```javascript line be counted as novel prose.
      ...rawComparableLines(lines[f.line - 1] ?? ''),
      ...(isGated(f) && !f.unterminated ? rawComparableLines(f.body) : []),
    ]);
  })),
});

/**
 * The pool, plus the fence-free shape.
 *
 * For fixtures that are bodies with NO fences: their English source must plausibly have had a
 * fence-free revision too, or the shape check (#561) fires first and the rule under test never
 * runs. Stating that assumption beats loosening the rule to suit the fixture.
 */
const poolAllowingNoFences = (...bodies) => {
  const pool = poolOf(...bodies);
  pool.fenceShapes.add(fenceShape(''));
  return pool;
};

// ── stripFrontmatter ────────────────────────────────────────────────────────

test('stripFrontmatter returns the body after the second delimiter', () => {
  const body = stripFrontmatter(withFrontmatter(ENGLISH_BODY));
  assert.ok(body.startsWith('# Create R Package'));
  assert.ok(!body.includes('description: Scaffold'));
});

test('stripFrontmatter normalises CRLF and lone CR (#532)', () => {
  // The defect: split on '\n' left an interior '\r' on every line, so byte comparison
  // against an LF source failed and the scaffold was recounted as a translation.
  const crlf = withFrontmatter(ENGLISH_BODY).replace(/\n/g, '\r\n');
  assert.equal(stripFrontmatter(crlf), stripFrontmatter(withFrontmatter(ENGLISH_BODY)));
  assert.ok(!stripFrontmatter(crlf).includes('\r'));

  const cr = withFrontmatter(ENGLISH_BODY).replace(/\n/g, '\r');
  assert.ok(!stripFrontmatter(cr).includes('\r'));
});

test('a file with no closing frontmatter delimiter keeps its whole text, normalised', () => {
  const text = '---\r\nname: x\r\n# heading\r\nbody line that is long enough\r\n';
  // Nothing is stripped — there is no second delimiter — but CRLF is still normalised, so
  // the fallback path cannot smuggle carriage returns into the comparison either.
  assert.equal(stripFrontmatter(text), '---\nname: x\n# heading\nbody line that is long enough\n');
});

// ── fence handling ──────────────────────────────────────────────────────────

test('frozen fence bodies are excluded, localisable ones are kept', () => {
  const text = [
    'Prose above the fence.',
    '```bash',
    'echo "this is keep-in-English by design"',
    '```',
    '```text',
    'This table is translatable prose.',
    '```',
  ].join('\n');
  const lines = openLines(text);
  // The frozen `bash` body and BOTH delimiter lines of each fence are gone.
  assert.ok(!lines.some((l) => l.includes('keep-in-English')));
  assert.ok(!lines.some((l) => l.startsWith('```')));
  // The `text` fence body survives — it is translatable, so English in it is evidence.
  assert.ok(lines.some((l) => l.includes('translatable prose')));
});

test('substantiveLines drops markdown scaffolding that matches in every locale', () => {
  const lines = substantiveLines('# Hi\n\n---\n1.\n**Note:**\nA line long enough to compare.\n');
  assert.deepEqual(lines, ['A line long enough to compare.']);
});

// ── the three failures this rewrite exists to fix ───────────────────────────

test('a scaffold is a scaffold after English moves on (#473 — the window)', () => {
  const scaffold = withFrontmatter(ENGLISH_BODY, '  source_commit: abc1234');
  const englishNow = `${ENGLISH_BODY}\nA paragraph added to English after the scaffold was made.\n`;
  // Pool spans history: the old body AND the current one.
  const pool = poolOf(ENGLISH_BODY, englishNow);

  const verdict = classifyTranslation({ translatedText: scaffold, locale: 'de', english: pool });
  assert.equal(verdict.stub, true);
  assert.equal(verdict.reason, 'no-novel-lines');

  // And the point of the historical pool: comparing against current English ALONE would
  // still call it a stub here only because the old lines survived the edit. Delete one and
  // the single-revision comparison collapses, while the pooled one does not.
  const englishRewritten = ENGLISH_BODY
    .replace('Verify the package directory was created before continuing.', 'Confirm the directory exists.');
  assert.equal(
    classifyTranslation({ translatedText: scaffold, locale: 'de', english: poolOf(englishRewritten) }).stub,
    false,
    'sanity: a single-revision pool loses the scaffold, which is exactly defect #473',
  );
  assert.equal(
    classifyTranslation({ translatedText: scaffold, locale: 'de', english: poolOf(ENGLISH_BODY, englishRewritten) }).stub,
    true,
    'the historical pool keeps it',
  );
});

test('a CRLF scaffold is still a scaffold (#532)', () => {
  const scaffold = withFrontmatter(ENGLISH_BODY).replace(/\n/g, '\r\n');
  const verdict = classifyTranslation({ translatedText: scaffold, locale: 'de', english: poolOf(ENGLISH_BODY) });
  assert.equal(verdict.stub, true, 'CRLF must not launder a scaffold into the translated count');
  assert.equal(verdict.novel, 0);
});

test('a scaffold surgically patched from a later revision is still a scaffold', () => {
  // The measured shape of the four `harden-github-repo-security` files: an old English body
  // with one paragraph spliced in from a newer English revision. It equals NO single
  // revision, which is why comparing against the `source_commit` blob fails.
  const englishNew = ENGLISH_BODY
    .replace('The DESCRIPTION file must name an author and a maintainer.',
      'The DESCRIPTION file must name an author, a maintainer and a licence.');
  const frankenstein = withFrontmatter(
    ENGLISH_BODY.replace('The DESCRIPTION file must name an author and a maintainer.',
      'The DESCRIPTION file must name an author, a maintainer and a licence.'),
  );

  // Neither single revision explains it...
  assert.equal(classifyTranslation({ translatedText: frankenstein, locale: 'de', english: poolOf(ENGLISH_BODY) }).stub, false);
  // ...but the union of revisions does.
  assert.equal(
    classifyTranslation({ translatedText: frankenstein, locale: 'de', english: poolOf(ENGLISH_BODY, englishNew) }).stub,
    true,
  );
});

// ── the other side: genuine translations must survive ───────────────────────

test('a genuine translation is not a scaffold', () => {
  const german = withFrontmatter([
    '# R-Paket erstellen',
    '',
    '## Wann zu verwenden',
    '',
    'Verwende diese Faehigkeit, wenn du ein neues R-Paket beginnst.',
    'Sie behandelt das Verzeichnislayout und die DESCRIPTION-Datei.',
    '',
    '```bash',
    'usethis::create_package("mypkg")',
    '```',
    '',
    'Pruefe, dass das Paketverzeichnis angelegt wurde, bevor du fortfaehrst.',
    'Die DESCRIPTION-Datei muss Autor und Betreuer nennen.',
  ].join('\n'));
  const verdict = classifyTranslation({ translatedText: german, locale: 'de', english: poolOf(ENGLISH_BODY) });
  assert.equal(verdict.stub, false);
  assert.equal(verdict.reason, 'has-novel-lines');
});

test('a near-English compressed tier is not a scaffold on one differing line', () => {
  // caveman-lite is SPECIFIED to keep grammar, articles and full sentences, and measures
  // ~90% verbatim English lines corpus-wide. Any similarity threshold that catches a
  // scaffold also condemns this tier for meeting its spec — hence a zero-evidence rule.
  const caveman = withFrontmatter(
    ENGLISH_BODY.replace('Use this skill when starting a new R package from scratch.',
      'Use skill when start new R package from scratch.'),
  );
  const verdict = classifyTranslation({ translatedText: caveman, locale: 'caveman-lite', english: poolOf(ENGLISH_BODY) });
  assert.equal(verdict.stub, false);
  assert.equal(verdict.novel, 1);
});

test('an identical body under a locale with no script rule still needs prose evidence', () => {
  const verdict = classifyTranslation({
    translatedText: withFrontmatter(ENGLISH_BODY),
    locale: 'caveman',
    english: poolOf(ENGLISH_BODY),
  });
  assert.equal(verdict.stub, true);
});

// ── the script rule ─────────────────────────────────────────────────────────

test('a CJK-script locale with no CJK is a scaffold regardless of prose', () => {
  // Decisive: a Japanese document containing zero kana and zero han is not Japanese. This
  // fires even when the prose comparison cannot, e.g. against an empty pool.
  const verdict = classifyTranslation({
    translatedText: withFrontmatter(ENGLISH_BODY),
    locale: 'ja',
    english: emptyPool(),
  });
  assert.equal(verdict.stub, true);
  assert.equal(verdict.reason, 'no-script');
});

test('the script rule reads the body, not the frontmatter', () => {
  // A scaffold whose frontmatter names the locale in its own script must not pass.
  const scaffold = withFrontmatter(ENGLISH_BODY, '  name_native: 日本語');
  assert.equal(classifyTranslation({ translatedText: scaffold, locale: 'ja', english: emptyPool() }).stub, true);
});

test('a translated CJK file passes the script rule and then the prose rule', () => {
  const japanese = withFrontmatter([
    '# Rパッケージの作成',
    '',
    'このスキルは新しいRパッケージを最初から作成するときに使用します。',
    'ディレクトリ構成とDESCRIPTIONファイルについて説明します。',
    'パッケージディレクトリが作成されたことを確認してから続行してください。',
    'DESCRIPTIONファイルには著者と管理者を記載する必要があります。',
    'この手順は一度だけ実行してください。',
    '',
    // A real translation keeps frozen fences byte-identical; dropping one is itself a defect
    // (#480), so the fixture must not model a translation as fence-free.
    '\`\`\`bash',
    'usethis::create_package("mypkg")',
    '\`\`\`',
  ].join('\n'));
  const verdict = classifyTranslation({ translatedText: japanese, locale: 'ja', english: poolOf(ENGLISH_BODY) });
  assert.equal(verdict.stub, false);
  assert.equal(verdict.reason, 'has-novel-lines');
});

test('zh-CN does not accept kana as evidence of Chinese', () => {
  // Kana only — no han. `行` would be a Han character and would defeat the point.
  const kanaOnly = withFrontmatter(`${ENGLISH_BODY}\nこれはひらがなだけのぎょうです。\n`);
  assert.equal(classifyTranslation({ translatedText: kanaOnly, locale: 'zh-CN', english: poolOf(ENGLISH_BODY) }).reason, 'no-script');
  assert.equal(classifyTranslation({ translatedText: kanaOnly, locale: 'ja', english: poolOf(ENGLISH_BODY) }).reason, 'has-novel-lines');
});

// ── the lenient residue, stated rather than hidden ──────────────────────────

test('a stray unterminated fence cannot hide a scaffold from comparison', () => {
  // A one-line bypass of the entire detector, measured before the fix: appending a single
  // ```bash to a scaffold made `extractFences` report a frozen fence running to EOF, so
  // every remaining line was dropped, `total` collapsed 5 -> 0, and the verdict went from
  // `no-novel-lines` (stub) to `insufficient` — which is counted as TRANSLATED. That is the
  // coverage-inflating direction this whole line of work exists to remove.
  // Fence-free body, so the added opener is genuinely UNTERMINATED rather than pairing with
  // an existing delimiter. (A stray opener that pairs with a real one is a different hazard
  // — phase-flipping — and is not what this fix addresses.)
  const plain = [
    '# Create R Package',
    'Use this skill when starting a new R package from scratch.',
    'It covers the directory layout and the DESCRIPTION file.',
    'Verify the package directory was created before continuing.',
    'The DESCRIPTION file must name an author and a maintainer.',
    'One further line of English prose to clear the floor.',
  ].join('\n');
  const pool = poolOf(plain);

  const clean = classifyTranslation({
    translatedText: withFrontmatter(plain), locale: 'de', english: pool,
  });
  assert.equal(clean.reason, 'no-novel-lines');
  assert.equal(clean.total, 6);

  // The opener goes near the top, so everything English below it is what would vanish.
  const withStray = classifyTranslation({
    translatedText: withFrontmatter(plain.replace('# Create R Package', '# Create R Package\n```bash')),
    locale: 'de',
    english: pool,
  });
  assert.equal(withStray.stub, true, 'a stray fence opener must not launder a scaffold');
  assert.equal(withStray.reason, 'no-novel-lines');
  assert.equal(withStray.total, clean.total, 'the remainder must stay in scope, not vanish');

  // A properly closed frozen fence still hides its body, which is the behaviour being kept.
  const closed = openLines('prose line one here\n```bash\nhidden = 1\n```\nprose line two here\n');
  assert.ok(!closed.some((l) => l.includes('hidden')));
  // ...and an unterminated one does not.
  const open = openLines('prose line one here\n```bash\nvisible = 1\n');
  assert.ok(open.some((l) => l.includes('visible')));
});

test('a stray opener that PAIRS with a real fence cannot hide prose either', () => {
  // #561, and deliberately a different fixture from the unterminated case above — #558's fix
  // passes that one and did nothing for this one. Here the added ```bash is perfectly
  // terminated: it cannot be closed by ```yaml (a closer carries no trailing text), so the
  // real opener is swallowed into its body and the real CLOSER closes the stray fence. The
  // document's fence phase inverts. Nothing is malformed in any way extractFences can see.
  //
  // Measured before the fix: total 5 -> 3, verdict `no-novel-lines` (stub) -> `insufficient`,
  // which is counted as TRANSLATED. One added line launders a scaffold.
  const body = [
    '# Beispieltitel fuer die Pruefung',
    '',
    'Dies ist ein Satz mit genuegend Zeichen fuer die Zaehlung.',
    'Und hier folgt ein zweiter Satz mit genuegend Zeichen.',
    '',
    '```yaml',
    'name: keep-this-in-english',
    'domain: testing',
    '```',
    '',
    'Ein dritter Satz, ebenfalls lang genug fuer die Zaehlung.',
    'Ein vierter Satz, ebenfalls lang genug fuer die Zaehlung.',
    '',
  ].join('\n');
  const pool = poolOf(body);

  const clean = classifyTranslation({ translatedText: body, locale: 'de', english: pool });
  assert.equal(clean.reason, 'no-novel-lines');
  assert.equal(clean.total, 5);

  const strayed = body.replace(
    '# Beispieltitel fuer die Pruefung\n',
    '# Beispieltitel fuer die Pruefung\n```bash\n',
  );
  // The flip is real: prove the mask moved, so this test cannot pass for the wrong reason.
  assert.equal(fenceShape(body), 'yaml');
  assert.equal(fenceShape(strayed), 'bash', 'the stray opener must swallow the real one');
  assert.equal(substantiveLines(strayed).length, 3, 'two prose lines must actually vanish');

  const verdict = classifyTranslation({ translatedText: strayed, locale: 'de', english: pool });
  assert.equal(verdict.reason, 'fence-mismatch');
  assert.equal(verdict.stub, false, 'not a scaffold — the remedy for a stub is deletion');
  assert.equal(verdict.total, null, 'a count taken through a broken mask is not a measurement');
  assert.equal(verdict.novel, null);
});

test('an UNTERMINATED stray opener leaves the shape alone, so #558 keeps its verdict', () => {
  // Why `fenceShape` counts terminated fences only. An unterminated fence is not frozen
  // (#558) and so describes nothing about the mask; letting it perturb the shape would send
  // #558's fixture to `fence-mismatch` and let a scaffold escape the stub verdict by growing
  // one backtick line — the laundering both issues exist to stop, wearing a new name.
  const plain = [
    '# Create R Package',
    'Use this skill when starting a new R package from scratch.',
    'It covers the directory layout and the DESCRIPTION file.',
    'Verify the package directory was created before continuing.',
    'The DESCRIPTION file must name an author and a maintainer.',
    'One further line of English prose to clear the floor.',
  ].join('\n');
  const strayed = plain.replace('# Create R Package', '# Create R Package\n```bash');

  assert.equal(fenceShape(strayed), fenceShape(plain), 'an unterminated fence must not count');
  assert.equal(hidesLines(strayed), false, 'and it hides nothing, which is why #558 works');

  const verdict = classifyTranslation({ translatedText: strayed, locale: 'de', english: poolOf(plain) });
  assert.equal(verdict.reason, 'no-novel-lines');
  assert.equal(verdict.stub, true, 'a scaffold must not escape by mismatching the shape');
});

test('a stray LOCALISABLE opener is caught even though it hides nothing', () => {
  // The hole that killed the first version of this fix, which required the mask to have
  // HIDDEN lines. A ```text opener is localisable, so `hidesLines` is false — yet it still
  // phase-flips, and instead of hiding prose it EXPOSES the real frozen body. Those
  // keep-in-English lines are absent from the English prose pool by construction, so they
  // counted as novel and the scaffold was reported `has-novel-lines`: a positive claim of
  // translation, worse than the `insufficient` this issue started from. Mask corruption is
  // symmetric, and a predicate that only looks at hiding sees half of it.
  const body = [
    '# Beispieltitel fuer die Pruefung',
    '',
    'Dies ist ein Satz mit genuegend Zeichen fuer die Zaehlung.',
    'Und hier folgt ein zweiter Satz mit genuegend Zeichen.',
    '',
    '```yaml',
    'name: keep-this-identifier-in-english',
    'description: a frozen line long enough to compare',
    '```',
    '',
    'Ein dritter Satz, ebenfalls lang genug fuer die Zaehlung.',
    'Ein vierter Satz, ebenfalls lang genug fuer die Zaehlung.',
    '',
  ].join('\n');
  const pool = poolOf(body);
  const strayed = body.replace(
    '# Beispieltitel fuer die Pruefung\n',
    '# Beispieltitel fuer die Pruefung\n```text\n',
  );

  // The fixture must genuinely exhibit the evading shape, or it proves nothing.
  assert.equal(hidesLines(strayed), false, 'a localisable fence hides nothing — the old predicate passed it');
  // The shape counts GATED fences only, so the stray `text` opener contributes nothing itself.
  // What changes the shape is that it SWALLOWS the real frozen fence, which then vanishes from
  // the gated list — which is exactly why gating the shape costs no attack coverage.
  assert.equal(fenceShape(body), 'yaml', 'the clean body has one frozen fence');
  assert.equal(fenceShape(strayed), '', 'and the stray opener swallows it');
  assert.ok(
    substantiveLines(strayed).some((l) => l.startsWith('name: keep-this-identifier')),
    'the frozen body must actually be exposed as comparable prose',
  );

  assert.equal(
    classifyTranslation({ translatedText: strayed, locale: 'de', english: pool }).reason,
    'fence-mismatch',
  );
});

test('a localisable stray is caught by the FINGERPRINT when the shape cannot help', () => {
  // #582 F2. The shape only CATCHES when the resulting shape is absent from the pool. Gate the
  // shape on gated fences and a stray `text` opener yields '' — which IS in the pool for any
  // file whose history contains a gated-fence-free revision, and fences accrete, so that is the
  // common case rather than the exotic one. There the shape is silent and `hasSwallowedOpener`
  // is the sole catcher. That fallback was pinned by nothing: restricting the fingerprint to
  // gated enclosing fences left the whole suite green.
  const body = [
    '# Ein Titel fuer die Pruefung hier',
    'Dies ist ein Satz mit genuegend Zeichen fuer die Zaehlung.',
    'Und hier folgt ein zweiter Satz mit genuegend Zeichen.',
    '```yaml',
    'name: keep-this-identifier-in-english',
    '```',
    'Ein dritter Satz, ebenfalls lang genug fuer die Zaehlung.',
    '',
  ].join('\n');
  // An OLDER English revision with no gated fence at all, so '' is legitimately pooled.
  const older = ['# Ein Titel fuer die Pruefung hier', 'Dies ist ein Satz mit genuegend Zeichen fuer die Zaehlung.'].join('\n');
  const pool = poolOf(body, older);
  assert.ok(pool.fenceShapes.has(''), "the fixture must actually pool '' or it tests the shape path");

  const strayed = body.replace(
    '# Ein Titel fuer die Pruefung hier\n',
    '# Ein Titel fuer die Pruefung hier\n```text\n',
  );
  assert.ok(pool.fenceShapes.has(fenceShape(strayed)), 'and the shape check must be SILENT here');
  assert.equal(hasSwallowedOpener(strayed), true, 'so the fingerprint is the only thing left');

  const verdict = classifyTranslation({ translatedText: strayed, locale: 'de', english: pool });
  assert.equal(verdict.reason, 'fence-mismatch');
  assert.equal(verdict.cause, 'swallowed-opener', 'and the cause must name what actually caught it');
});

test('an exposed fence OPENER line is not novelty (#582 F1)', () => {
  // Delimiter lines are dropped by `openLines` for every fence, so they sat in no pool. An
  // opener long enough to compare — ```javascript is 13 chars with letters — therefore counted
  // as NOVEL the moment a corrupted mask exposed it. A byte-identical scaffold wrapped in one
  // ````text fence reported `has-novel-lines`: a positive claim of translation manufactured
  // out of markdown syntax, with both fingerprints silent by construction.
  const body = [
    '# Ein Titel fuer die Pruefung hier',
    'Dies ist ein Satz mit genuegend Zeichen fuer die Zaehlung.',
    'Und hier folgt ein zweiter Satz mit genuegend Zeichen.',
    'Ein dritter Satz, ebenfalls lang genug fuer die Zaehlung.',
    'Ein vierter Satz, ebenfalls lang genug fuer die Zaehlung.',
    '```javascript',
    'const keepThisInEnglish = 1;',
    '```',
    '',
  ].join('\n');
  const older = ['# Ein Titel fuer die Pruefung hier', 'Dies ist ein Satz mit genuegend Zeichen fuer die Zaehlung.'].join('\n');
  const pool = poolOf(body, older);

  // The opener must be comparable, or the construction has nothing to exploit.
  assert.deepEqual(rawComparableLines('```javascript'), ['```javascript']);
  assert.ok(pool.fenceLines.has('```javascript'), 'and it must now be pooled');

  const wrapped = ['````text', body.trimEnd(), '````', ''].join('\n');
  // Both fingerprints silent, and the shape is '' which the older revision legitimately pooled.
  assert.equal(fenceShape(wrapped), '', 'the wrap is localisable, the inner fence is content');
  assert.ok(pool.fenceShapes.has(''));
  assert.equal(hasSwallowedOpener(wrapped), false, 'inner run 3 < outer 4 — the documented exemption');
  assert.equal(hidesKnownProse(wrapped, pool.lines, pool.fenceLines), false, 'the wrap is not gated');

  // With nothing else to catch it, the verdict rests entirely on the novel count.
  const verdict = classifyTranslation({ translatedText: wrapped, locale: 'de', english: pool });
  assert.equal(verdict.novel, 0, 'a byte-identical scaffold has no novelty, delimiters included');
  assert.equal(verdict.stub, true, 'so it is a scaffold, not a translation');
});

test('a SAME-TAG stray opener is caught, though the shape is byte-identical', () => {
  // Found by adversarial review, not by this suite — and it is the case the shape comparison
  // structurally CANNOT see. A stray opener carrying the same tag as the fence it swallows is
  // closed by that fence's real closer and inherits its position in the shape string. Shape
  // unchanged, count unchanged, mask completely wrong.
  //
  // It is not merely adversarial: a copy-paste that duplicates an existing opener line is
  // same-tag by definition.
  const body = [
    '# Beispieltitel fuer die Pruefung',
    '',
    'Dies ist ein Satz mit genuegend Zeichen fuer die Zaehlung.',
    'Und hier folgt ein zweiter Satz mit genuegend Zeichen.',
    '',
    '```yaml',
    'name: keep-this-identifier-in-english',
    'domain: testing',
    '```',
    '',
    'Ein dritter Satz, ebenfalls lang genug fuer die Zaehlung.',
    'Ein vierter Satz, ebenfalls lang genug fuer die Zaehlung.',
    '',
  ].join('\n');
  const pool = poolOf(body);
  const strayed = body.replace(
    '# Beispieltitel fuer die Pruefung\n',
    '# Beispieltitel fuer die Pruefung\n```yaml\n',
  );

  // The fixture must exhibit the property that defeats the shape check, or it proves nothing.
  assert.equal(fenceShape(strayed), fenceShape(body), 'the shape MUST be identical here');
  assert.ok(substantiveLines(strayed).length < substantiveLines(body).length,
    'and the mask must genuinely have eaten prose');
  assert.equal(hasSwallowedOpener(strayed), true);

  assert.equal(
    classifyTranslation({ translatedText: strayed, locale: 'de', english: pool }).reason,
    'fence-mismatch',
  );
});

// ── cross-pool membership: the rule the fingerprints kept failing to be ──────
// Third review round. Neither `fenceShape` nor `hasSwallowedOpener` generalises — a MOVED
// closer leaves no stray fence, no unterminated fence and an identical shape, and a tilde or
// longer-run wrap rides through both documented exemptions. Every construction in the family
// works by moving the mask across the prose/frozen boundary, in one of two directions, and
// membership tests catch both without knowing how the corruption was spelled.

test('exposed frozen content is not evidence of translation', () => {
  // EXPOSED-KNOWN-FENCE. Insert one bare ``` inside the last gated fence: it closes the fence
  // early, the frozen remainder is exposed as prose, and those keep-in-English lines are
  // absent from the English PROSE pool by construction — so they counted as NOVEL and the
  // scaffold was reported `has-novel-lines`. A positive claim of translation, which is worse
  // than `insufficient`: it asserts rather than admits.
  const english = [
    '# Harden GitHub Repo Security',
    '',
    'Use this skill to lock down a repository before it goes public.',
    'It covers branch protection, required checks and deploy keys.',
    '',
    '```yaml',
    'name: harden-github-repo-security',
    'domain: defensive-security-practices',
    '```',
    '',
    'Verify the ruleset is ENFORCED and not merely evaluated.',
    'Record the bypass actors, because a deploy key is one.',
    '',
  ].join('\n');
  const pool = poolOf(english);
  assert.ok(pool.fenceLines.has('domain: defensive-security-practices'),
    'the frozen body must be pooled, or this test cannot distinguish the fix from its absence');

  const split = english.replace(
    'name: harden-github-repo-security\n',
    'name: harden-github-repo-security\n```\n',
  );
  // The construction must actually evade both fingerprints, or it proves nothing.
  assert.equal(fenceShape(split), fenceShape(english), 'shape must survive the split');
  assert.equal(hasSwallowedOpener(split), false, 'no opener sits inside a body here');
  assert.ok(substantiveLines(split).includes('domain: defensive-security-practices'),
    'the frozen line must genuinely be exposed as comparable prose');

  const verdict = classifyTranslation({ translatedText: split, locale: 'de', english: pool });
  assert.equal(verdict.novel, 0, 'keep-in-English content is not novelty');
  assert.equal(verdict.stub, true);
});

test('a MOVED closer is caught too, though it leaves no stray fence at all', () => {
  // The variant that defeats any fingerprint keyed to stray or unterminated fences: move the
  // real closer up rather than inserting one. Shape identical, fence count identical, nothing
  // unterminated, nothing swallowed. Plausibly accidental — a truncated paste that drops the
  // tail of a fence body has exactly this signature.
  const english = [
    '# Harden GitHub Repo Security',
    '',
    'Use this skill to lock down a repository before it goes public.',
    'It covers branch protection, required checks and deploy keys.',
    '',
    '```yaml',
    'name: harden-github-repo-security',
    'domain: defensive-security-practices',
    '```',
    '',
    'Verify the ruleset is ENFORCED and not merely evaluated.',
    'Record the bypass actors, because a deploy key is one.',
    '',
  ].join('\n');
  const moved = english
    .replace('name: harden-github-repo-security\n', 'name: harden-github-repo-security\n```\n')
    .replace('domain: defensive-security-practices\n```\n', 'domain: defensive-security-practices\n');

  assert.equal(fenceShape(moved), fenceShape(english));
  assert.equal(hasSwallowedOpener(moved), false);
  assert.equal(classifyTranslation({ translatedText: moved, locale: 'de', english: poolOf(english) }).novel, 0);
});

test('a frozen fence hiding known English prose is a mask corruption', () => {
  // HIDDEN-KNOWN-PROSE, the other direction, and the one that catches the wrap: tilde or
  // longer-run fences replicating the original tags reproduce the shape exactly and trip
  // neither fingerprint by design. Asking what ended up INSIDE them settles it — English's own
  // frozen bodies are excluded from the prose pool, so an intersection means prose was
  // swallowed.
  const english = [
    '# Ein Titel fuer die Pruefung hier',
    '',
    'Dies ist ein Satz mit genuegend Zeichen fuer die Zaehlung.',
    'Und hier folgt ein zweiter Satz mit genuegend Zeichen.',
    'Ein dritter Satz, ebenfalls lang genug fuer die Zaehlung.',
    'Ein vierter Satz, ebenfalls lang genug fuer die Zaehlung.',
    '',
  ].join('\n');
  const pool = poolOf(english);

  // A tilde wrap: inner backticks neither close it nor trip hasSwallowedOpener.
  const wrapped = [
    '# Ein Titel fuer die Pruefung hier',
    '~~~yaml',
    'Dies ist ein Satz mit genuegend Zeichen fuer die Zaehlung.',
    'Und hier folgt ein zweiter Satz mit genuegend Zeichen.',
    'Ein dritter Satz, ebenfalls lang genug fuer die Zaehlung.',
    'Ein vierter Satz, ebenfalls lang genug fuer die Zaehlung.',
    '~~~',
    '',
  ].join('\n');
  assert.equal(hasSwallowedOpener(wrapped), false, 'the wrap evades the opener fingerprint by design');
  assert.equal(hidesKnownProse(wrapped, pool.lines, pool.fenceLines), true);
  assert.equal(
    classifyTranslation({ translatedText: wrapped, locale: 'de', english: pool }).reason,
    'fence-mismatch',
  );
});

test('a SHAPE-REPLICATING wrap is caught by membership, not by shape', () => {
  // The killing test for the wiring, supplied by review. My own wrap fixture built its pool
  // from a FENCE-FREE English body, so the wrapped fixture mismatched on shape and the
  // assertion was satisfied by `shapeUnknown` alone — the one fingerprint the wrap family is
  // defined by evading. It passed for the wrong reason, and deleting the `hidesKnownProse`
  // call from `classifyTranslation` left the entire suite green.
  //
  // Here the English source HAS a `yaml` fence and the wrap copies that tag, so the shape is
  // replicated exactly and only membership can decide.
  const english = [
    '# Title long enough for compare',
    'Prose line one long enough here.',
    'Prose line two long enough here.',
    'Prose line three long enough yes.',
    'Prose line four long enough yes.',
    '```yaml',
    'name: keep-in-english',
    '```',
  ].join('\n');
  const pool = poolOf(english);
  const wrapped = [
    '~~~yaml',
    '# Title long enough for compare',
    'Prose line one long enough here.',
    'Prose line two long enough here.',
    'Prose line three long enough yes.',
    'Prose line four long enough yes.',
    '~~~',
  ].join('\n');

  // Both fingerprints must be genuinely silent, or this proves nothing about membership.
  assert.equal(fenceShape(wrapped), 'yaml', 'the wrap must replicate the shape exactly');
  assert.ok(pool.fenceShapes.has(fenceShape(wrapped)), 'so shapeUnknown is FALSE');
  assert.equal(hasSwallowedOpener(wrapped), false);

  assert.equal(
    classifyTranslation({ translatedText: wrapped, locale: 'de', english: pool }).reason,
    'fence-mismatch',
  );
});

test('a DEPTH-2 wrap cannot hide prose from the hiding detector', () => {
  // `hidesKnownProse` inspected the fence body through `substantiveLines`, which re-masks
  // fences INSIDE that body — so it looked through the very mask it audits. A 5-backtick outer
  // wrapping a 4-backtick inner (inner run < outer, the documented fence-in-fence exemption)
  // hid five prose lines from it: it saw `[]`, intersected nothing, and the file reached
  // `insufficient` — counted as translated. Byte-for-byte the outcome the flat-wrap fix
  // exists to close, one nesting level down.
  const english = [
    '# Title long enough for compare',
    'Prose line one long enough here.',
    'Prose line two long enough here.',
    'Prose line three long enough yes.',
    'Prose line four long enough yes.',
    '```bash',
    'echo hello world here',
    '```',
  ].join('\n');
  const pool = poolOf(english);
  const nested = [
    '`````bash',
    '````bash',
    '# Title long enough for compare',
    'Prose line one long enough here.',
    'Prose line two long enough here.',
    'Prose line three long enough yes.',
    'Prose line four long enough yes.',
    'echo hello world here',
    '````',
    '`````',
  ].join('\n');

  assert.equal(fenceShape(nested), 'bash', 'shape replicated');
  assert.equal(hasSwallowedOpener(nested), false, 'inner run is shorter — the exemption');
  assert.deepEqual(substantiveLines(nested), [], 'the mask really does swallow everything');

  assert.equal(
    classifyTranslation({ translatedText: nested, locale: 'de', english: pool }).reason,
    'fence-mismatch',
  );
});

test('a broken frontmatter mask cannot manufacture novelty either', () => {
  // The fence mask is not the only mask over this comparison. `stripFrontmatter` fails OPEN —
  // it returns the whole text when it cannot find two `---` lines — so deleting the OPENING
  // delimiter turns the frontmatter into body. Its own fields clear the substantive filter and
  // sit in NO pool, because English frontmatter is stripped before pooling on both paths.
  //
  // Measured before the guard: `no-novel-lines` (a scaffold) became `has-novel-lines` with
  // novel 4 — counted as TRANSLATED, on four lines of its own metadata, with the shape
  // untouched and both membership tests silent.
  const body = [
    '# Create R Package',
    'Use this skill when starting a new R package from scratch.',
    'It covers the directory layout and the DESCRIPTION file.',
    'Verify the package directory was created before continuing.',
    'The DESCRIPTION file must name an author and a maintainer.',
    'One further line of English prose to clear the floor.',
  ].join('\n');
  const pool = poolAllowingNoFences(body);
  const wellFormed = [
    '---', 'name: create-r-package', 'description: Scaffold an R package for analysis',
    'source_commit: abc1234def', 'translator: Claude plus human review', '---', body,
  ].join('\n');

  assert.equal(classifyTranslation({ translatedText: wellFormed, locale: 'de', english: pool }).reason,
    'no-novel-lines');

  const broken = wellFormed.replace(/^---\n/, '');
  // The fixture must genuinely exhibit the leak, or it proves nothing.
  assert.ok(stripFrontmatter(broken).includes('source_commit'), 'frontmatter must survive into the body');
  assert.equal(frontmatterUnparsed(stripFrontmatter(broken)), true);

  const verdict = classifyTranslation({ translatedText: broken, locale: 'de', english: pool });
  assert.equal(verdict.reason, 'mask-unparsed');
  assert.equal(verdict.cause, 'frontmatter');
  assert.equal(verdict.stub, false, 'not a scaffold — the remedy for a stub is deletion');
  assert.ok(UNJUDGED_REASONS.has(verdict.reason), 'and it must land in the unjudged bucket');
});

test('an untagged fence cannot masquerade as no fences at all', () => {
  // `''` for an untagged fence made a single untagged terminated fence spell the same shape as
  // a file with NO fences. If any English revision was fence-free, an untagged wrap around the
  // whole body matched the pool and hid everything.
  assert.notEqual(fenceShape('```\nhidden line long enough to compare\n```\n'), fenceShape('no fences here at all\n'));
  assert.equal(fenceShape('```\nx\n```\n'), '{');
  assert.equal(fenceShape('plain prose only\n'), '');

  // `{` rather than `~` because it is provably impossible in a `lang`: extractFences strips
  // braces unconditionally. Nothing strips `~`, so a ```~ fence would have collided with the
  // placeholder — a "cannot happen" margin of exactly the kind this module keeps losing to.
  assert.equal(fenceShape('```~\nx\n```\n'), '~', 'a ~-tagged fence keeps its own tag');
  assert.notEqual(fenceShape('```~\nx\n```\n'), fenceShape('```\nx\n```\n'));
  assert.equal(fenceShape('```{r}\nx\n```\n'), '{', 'a {...} info string is lang-empty too');
});

test('legitimate fence-in-fence documentation is not a swallowed opener', () => {
  // The false-positive risk of the swallowed-opener check. This corpus documents markdown by
  // wrapping a longer outer run around a shorter inner one, and `extractFences`' own docstring
  // says so. A four-backtick outer containing a three-backtick opener is well-formed: the
  // inner run is shorter, so it could never have closed the outer fence.
  const nested = [
    '````markdown',
    'A documented example that is long enough to compare.',
    '```r',
    'x <- 1',
    '```',
    '````',
  ].join('\n');
  assert.equal(hasSwallowedOpener(nested), false);

  // And a backtick fence inside a tilde fence is ordinary content — different delimiter.
  const tilde = ['~~~text', 'A line of prose that is long enough here.', '```yaml', 'name: x', '```', '~~~'].join('\n');
  assert.equal(hasSwallowedOpener(tilde), false);
});

test('a tag containing a pipe cannot forge a multi-fence shape', () => {
  // `lang` is the first token of the info string split on /[\s{,]/ — a comma can never occur
  // inside a tag, but a PIPE can. Joining shapes on `|` let one fence tagged ```bash|yaml
  // produce the shape of two fences, so a single gated fence wrapping an entire body could
  // match a two-fence English shape, hide everything, and land `insufficient` — translated.
  const oneForgedFence = '```bash|yaml\nname: everything is hidden in here\n```\n';
  const twoRealFences = '```bash\necho hi\n```\n\n```yaml\nname: x\n```\n';
  assert.notEqual(fenceShape(oneForgedFence), fenceShape(twoRealFences),
    'a single fence must not be able to spell a two-fence shape');
  assert.equal(fenceShape(twoRealFences), 'bash,yaml');
});

test('fence-mismatch outranks insufficient, because the flip drives the count down', () => {
  // Ordering, asserted rather than assumed. The phase flip pushes `total` DOWN through
  // MIN_LINES_TO_JUDGE — that is its mechanism — so if `insufficient` were tested first it
  // would answer first, and `insufficient` is counted as translated. The corrupted count
  // must never get to speak.
  const body = [
    '# Titel mit ausreichender Laenge hier',
    'Ein Satz mit genuegend Zeichen fuer die Zaehlung hier.',
    'Ein zweiter Satz mit genuegend Zeichen fuer die Zaehlung.',
    '```yaml',
    'name: frozen',
    'domain: testing',
    '```',
    'Ein dritter Satz mit genuegend Zeichen fuer die Zaehlung.',
    '',
  ].join('\n');
  const strayed = body.replace('# Titel mit ausreichender Laenge hier\n', '# Titel mit ausreichender Laenge hier\n```bash\n');

  assert.ok(substantiveLines(strayed).length < MIN_LINES_TO_JUDGE,
    'fixture must actually fall below the floor, or this asserts nothing');
  assert.equal(
    classifyTranslation({ translatedText: strayed, locale: 'de', english: poolOf(body) }).reason,
    'fence-mismatch',
  );
});

test('every CJK-script locale in the config is pinned in REQUIRED_SCRIPT', () => {
  // Deleting any wenyan entry survived every other test — the script rule's coverage came
  // entirely from `ja` and `zh-CN` fixtures. This pins the map against the config itself, so
  // adding a CJK locale without a script entry is caught rather than silently degrading to
  // prose-only.
  for (const code of ['ja', 'zh-CN', 'wenyan', 'wenyan-lite', 'wenyan-ultra']) {
    assert.ok(REQUIRED_SCRIPT.has(code), `${code} must declare its writing system`);
    assert.equal(REQUIRED_SCRIPT.get(code).test('一'), true, `${code} must accept han`);
    assert.equal(REQUIRED_SCRIPT.get(code).test('nothing but latin here'), false);
  }
  // The caveman tiers are English by construction and must NOT be pinned.
  for (const code of ['caveman', 'caveman-lite', 'caveman-ultra', 'de', 'es']) {
    assert.equal(REQUIRED_SCRIPT.has(code), false, `${code} is written in latin script`);
  }
});

test('an orphaned CJK mirror is no-source, not a scaffold — the irreversible case', () => {
  // The file exists; its English source was deleted or its id renamed, so there is nothing
  // to re-scaffold FROM. Calling it a scaffold recommends deleting the only surviving copy.
  // Before the reorder the script rule ran first and returned `no-script` here, while the
  // identical file under `de` returned `no-source` and was preserved — the disposition
  // differed by locale alone, and the destructive one went to the locale with no backup.
  const orphan = classifyTranslation({
    translatedText: withFrontmatter(ENGLISH_BODY), locale: 'ja', english: undefined,
  });
  assert.equal(orphan.reason, 'no-source');
  assert.equal(orphan.stub, false, 'a file with no source must never be recommended for deletion');

  const orphanLatin = classifyTranslation({
    translatedText: withFrontmatter(ENGLISH_BODY), locale: 'de', english: undefined,
  });
  assert.equal(orphanLatin.reason, orphan.reason, 'the disposition must not depend on the locale');
});

test('a CJK mirror too short to judge is insufficient, not a scaffold', () => {
  // `{stub: true, total: 0}` was reachable: an empty, frontmatter-only, or all-fenced mirror
  // has no substantive lines, and a one-line file has essentially no opportunity to contain
  // han — so "decisive, no false positives available" is not earned at small totals. That is
  // exactly what MIN_LINES_TO_JUDGE encodes, and the script rule used to jump it.
  const tiny = classifyTranslation({
    translatedText: withFrontmatter('# タイトル\n'), locale: 'ja', english: poolAllowingNoFences(ENGLISH_BODY),
  });
  assert.equal(tiny.reason, 'insufficient');
  assert.equal(tiny.stub, false);
  assert.equal(tiny.total, 0);

  // The rule still fires on a file with enough text to judge.
  assert.equal(classifyTranslation({
    translatedText: withFrontmatter(ENGLISH_BODY), locale: 'ja', english: poolOf(ENGLISH_BODY),
  }).reason, 'no-script');
});

test('long letterless lines are not comparable evidence', () => {
  // Mutating away the `/\p{L}/u` filter survived every other test, and it is the most
  // dangerous unconstrained line in the module: table rules, digit rows and separator bars
  // match English in EVERY locale, so admitting them adds agreement only — pushing files
  // toward `no-novel-lines`, which is the delete verdict.
  const noise = '| --- | --- | --- | --- |\n====================\n1234567890123456\n';
  assert.deepEqual(substantiveLines(noise), []);

  // A genuine translation whose only differing lines are prose must not be pushed over by
  // shared table scaffolding.
  const shared = ['| --- | --- | --- |', '====================', '1234567890123456'];
  const english = [...Array.from({ length: 6 }, (_, i) => `English prose line number ${i}.`), ...shared].join('\n');
  const german = [...Array.from({ length: 6 }, (_, i) => `Deutsche Prosazeile Nummer ${i}.`), ...shared].join('\n');
  const verdict = classifyTranslation({
    translatedText: withFrontmatter(german), locale: 'de', english: poolOf(english),
  });
  assert.equal(verdict.reason, 'has-novel-lines');
  assert.equal(verdict.novel, 6, 'only the prose counts; the shared scaffolding is not evidence either way');
  assert.equal(verdict.total, 6);
});

test('novel counts every unmatched line, not merely whether one exists', () => {
  // `novel += 1` mutated to `novel = 1` survived every other assertion — one expects 0 (the
  // statement never runs) and one expects exactly 1. That silently destroys the only
  // quantitative field in `--verdicts` and every margin measurement built on it.
  const german = [
    'Erste deutsche Zeile hier drin.',
    'Zweite deutsche Zeile hier drin.',
    'Dritte deutsche Zeile hier drin.',
  ].join('\n');
  const verdict = classifyTranslation({
    translatedText: withFrontmatter(`${ENGLISH_BODY}\n${german}\n`),
    locale: 'de',
    english: poolOf(ENGLISH_BODY),
  });
  assert.equal(verdict.novel, 3);
});

test('a verdict that did not measure reports novel as null, never 0', () => {
  // The `--verdicts` list is what a maintainer reads before deleting files. A `0` there
  // means "compared, nothing novel". These three paths return BEFORE the comparison runs,
  // and reporting 0 fabricates a measurement in the one place it does the most damage:
  // `(no-script, 0/57)` reads open-and-shut for a file that may carry forty novel lines.
  // The short fixture below carries no fences, so the pool must allow the fence-free shape.
  const english = poolAllowingNoFences(ENGLISH_BODY);

  const noScript = classifyTranslation({
    translatedText: withFrontmatter(ENGLISH_BODY), locale: 'ja', english: english,
  });
  assert.equal(noScript.reason, 'no-script');
  assert.equal(noScript.novel, null);

  const noSource = classifyTranslation({
    translatedText: withFrontmatter(ENGLISH_BODY), locale: 'de', english: undefined,
  });
  assert.equal(noSource.reason, 'no-source');
  assert.equal(noSource.novel, null);

  const short = classifyTranslation({
    translatedText: withFrontmatter('# Title\n\nOne single line of prose here.\n'),
    locale: 'de',
    english: english,
  });
  assert.equal(short.reason, 'insufficient');
  assert.equal(short.novel, null);

  // And the paths that DO measure still report a number, including zero.
  assert.equal(classifyTranslation({
    translatedText: withFrontmatter(ENGLISH_BODY), locale: 'de', english: english,
  }).novel, 0);
});

test('a file too short to judge is reported insufficient, not a scaffold', () => {
  const tiny = withFrontmatter('# Title\n\nOne single line of prose here.\n');
  const verdict = classifyTranslation({ translatedText: tiny, locale: 'de', english: poolAllowingNoFences(ENGLISH_BODY) });
  assert.equal(verdict.stub, false);
  assert.equal(verdict.reason, 'insufficient');
  assert.ok(verdict.total < MIN_LINES_TO_JUDGE);
});

// The boundary, pinned on BOTH sides with literal counts. Asserting
// `total < MIN_LINES_TO_JUDGE` against the imported constant is self-referential and
// cannot fix a value: mutating 5 to 2, 3 or 4 survives it. These two do not — the fixtures
// are built to have exactly 5 and exactly 4 substantive lines by construction.
const lineOfLength = (n, i) => `Fixture prose line ${i}`.padEnd(n, 'x');

test('exactly MIN_LINES_TO_JUDGE substantive lines is enough to judge', () => {
  const body = Array.from({ length: 5 }, (_, i) => lineOfLength(20, i)).join('\n\n');
  const verdict = classifyTranslation({
    translatedText: withFrontmatter(body), locale: 'de', english: poolOf(body),
  });
  assert.equal(verdict.total, 5, 'fixture must sit exactly on the boundary');
  assert.equal(verdict.reason, 'no-novel-lines');
  assert.equal(verdict.stub, true);
});

test('one line below the boundary is not judged', () => {
  const body = Array.from({ length: 4 }, (_, i) => lineOfLength(20, i)).join('\n\n');
  const verdict = classifyTranslation({
    translatedText: withFrontmatter(body), locale: 'de', english: poolOf(body),
  });
  assert.equal(verdict.total, 4);
  assert.equal(verdict.reason, 'insufficient');
  assert.equal(verdict.stub, false);
});

test('MIN_COMPARABLE_LINE_CHARS is pinned at both ends too', () => {
  // A 12-character line counts; an 11-character one does not. Without this, `>=` mutates to
  // `>` and nothing notices.
  const twelve = 'abcdefghijkl';
  const eleven = 'abcdefghijk';
  assert.equal(twelve.length, 12);
  assert.deepEqual(substantiveLines(`${twelve}\n${eleven}\n`), [twelve]);
});

test('a translation whose English source is gone is reported no-source', () => {
  const verdict = classifyTranslation({
    translatedText: withFrontmatter(ENGLISH_BODY),
    locale: 'de',
    english: undefined,
  });
  assert.equal(verdict.stub, false);
  assert.equal(verdict.reason, 'no-source');
});

// ── the pool key ────────────────────────────────────────────────────────────

test('translationKey agrees with contentKey, including on what is not content', () => {
  assert.equal(translationKey('skills', 'create-r-package'), 'skills/create-r-package');
  assert.equal(translationKey('guides', 'agent-best-practices'), 'guides/agent-best-practices');
  assert.equal(translationKey('agents', 'r-developer'), 'agents/r-developer');
  // The reason this helper exists rather than a second `${tree}/${id}` in the caller: a
  // mirror of a template or a README keys to nothing, reports `no-source`, and is counted
  // as translated. Both branches must exclude them, which is what #519 was about.
  assert.equal(translationKey('skills', '_template'), null);
  assert.equal(translationKey('guides', '_template'), null);
  assert.equal(translationKey('teams', 'README'), null);
});

test('every content tree present in i18n/ is one the scan walks', () => {
  // `generate-translation-status.js` iterates `TREES`, and `buildEnglishProseHistory` pools
  // from `TREES` — one list, so they cannot disagree. What they CAN both miss is a tree that
  // exists in the corpus and is in neither: it would be silently absent from every coverage
  // number, with no error. Mutating `contentTypes` away from `TREES` in the script survives
  // the unit suite (no seam), so this asserts the corpus-level invariant instead.
  const i18nDir = join(REPO_ROOT, 'i18n');
  const found = new Set();
  for (const locale of readdirSync(i18nDir)) {
    const localeDir = join(i18nDir, locale);
    if (!statSync(localeDir).isDirectory()) continue;
    for (const entry of readdirSync(localeDir)) {
      if (statSync(join(localeDir, entry)).isDirectory()) found.add(entry);
    }
  }
  const unscanned = [...found].filter((tree) => !TREES.includes(tree)).sort();
  assert.deepEqual(unscanned, [],
    `i18n/ carries content tree(s) the status scan never visits: ${unscanned.join(', ')}`);
});

// ── the git path ────────────────────────────────────────────────────────────

test('buildEnglishProseHistory collects all THREE pools, and poolOf mirrors it', () => {
  // Two gaps closed at once. The production collectors for `fenceShapes` and `fenceLines` were
  // asserted nowhere: the git-path tests checked only `.lines`, and every classify test used
  // the hand-written `poolOf`. So deleting the collector loop left the suite green while
  // emptying `english.fenceLines` for every key in production — which kills the exposed-content
  // exclusion outright AND degrades `hidesKnownProse` to its pre-disambiguation form, measured
  // at 87 files flagged with 76 innocent, each a genuine translation dropped into `unjudged`.
  //
  // It also pins `poolOf` against production. That mirror is duplicated logic with a one-sided
  // drift axis: if the helper drifts lenient, every fixture silently stops representing the
  // pools production actually builds, and the tests keep passing.
  const repo = mkdtempSync(join(tmpdir(), 'aa-tstatus-pools-'));
  try {
    const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' });
    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'test@example.invalid');
    git('config', 'user.name', 'Test');

    const skillDir = join(repo, 'skills', 'demo-skill');
    mkdirSync(skillDir, { recursive: true });
    const body = [
      '# Demo Skill Title Here',
      'A prose line that is long enough to compare.',
      // A tag long enough that the OPENER LINE itself clears the 12-char comparability floor.
      // With `bash` (7 chars) neither opener is poolable, so deleting the production collector's
      // opener line changed nothing and the mutant survived — the fixture lacked the construct
      // the defect needs. `javascript` makes the opener 13 chars.
      '```javascript',
      'const frozenContentLongEnough = 1;',
      '```',
      '```text',
      'A localisable line that is long enough here.',
      '```',
    ].join('\n');
    writeFileSync(join(skillDir, 'SKILL.md'), withFrontmatter(body));
    git('add', '-A');
    git('commit', '-qm', 'only');

    const entry = buildEnglishProseHistory(repo).get('skills/demo-skill');
    const mirror = poolOf(body);

    assert.deepEqual([...entry.lines].sort(), [...mirror.lines].sort(), 'prose pool must mirror');
    assert.deepEqual([...entry.fenceShapes], [...mirror.fenceShapes], 'shape pool must mirror');
    assert.deepEqual([...entry.fenceLines].sort(), [...mirror.fenceLines].sort(), 'frozen pool must mirror');

    // And the pools must actually be populated, or "they match" is two empty sets agreeing.
    assert.ok(entry.fenceLines.has('const frozenContentLongEnough = 1;'),
      'the GATED body belongs to the frozen pool');
    assert.ok(entry.fenceLines.has('```javascript'),
      'and so does the OPENER LINE — it is in no other pool, so an exposed one reads as novelty');
    assert.ok(!entry.lines.has('const frozenContentLongEnough = 1;'),
      'and must NOT be in the prose pool — that separation is what the whole rule rests on');
    assert.ok(entry.lines.has('A localisable line that is long enough here.'),
      'a localisable body is prose, not frozen');
    assert.ok(!entry.fenceLines.has('A localisable line that is long enough here.'));
    // GATED only: the fixture's `text` fence is localisable, so it is absent from the shape.
    // Its body is in `lines` (asserted above) because localisable content IS compared — which
    // is precisely why it must not perturb the shape.
    assert.deepEqual([...entry.fenceShapes], ['javascript']);
  } finally {
    rmTree(repo);
  }
});

test('buildEnglishProseHistory pools every revision a source has had', () => {
  const repo = mkdtempSync(join(tmpdir(), 'aa-tstatus-'));
  try {
    const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' });
    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'test@example.invalid');
    git('config', 'user.name', 'Test');

    const skillDir = join(repo, 'skills', 'demo-skill');
    mkdirSync(skillDir, { recursive: true });
    const path = join(skillDir, 'SKILL.md');

    const first = withFrontmatter('# Demo\n\nThe first revision said something specific here.\n');
    writeFileSync(path, first);
    git('add', '-A');
    git('commit', '-qm', 'first');

    const second = withFrontmatter('# Demo\n\nThe second revision says something else entirely.\n');
    writeFileSync(path, second);
    git('add', '-A');
    git('commit', '-qm', 'second');

    const history = buildEnglishProseHistory(repo);
    const lines = history.get('skills/demo-skill').lines;
    assert.ok(lines, 'the skill must be keyed by contentKey');
    assert.ok(lines.has('The first revision said something specific here.'),
      'a line deleted from English is still English — this is what makes the detector survive surgical propagation');
    assert.ok(lines.has('The second revision says something else entirely.'));
  } finally {
    rmTree(repo);
  }
});

test('buildEnglishProseHistory includes uncommitted English edits', () => {
  const repo = mkdtempSync(join(tmpdir(), 'aa-tstatus-wt-'));
  try {
    const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' });
    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'test@example.invalid');
    git('config', 'user.name', 'Test');

    const skillDir = join(repo, 'skills', 'demo-skill');
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(join(skillDir, 'SKILL.md'), withFrontmatter('# Demo\n\nCommitted prose line for the base.\n'));
    git('add', '-A');
    git('commit', '-qm', 'base');

    writeFileSync(join(skillDir, 'SKILL.md'), withFrontmatter('# Demo\n\nUncommitted prose line in the working tree.\n'));

    const lines = buildEnglishProseHistory(repo).get('skills/demo-skill').lines;
    assert.ok(lines.has('Uncommitted prose line in the working tree.'),
      'an uncommitted English edit is a legal basis, or every local scaffold reads as translated');
    assert.ok(lines.has('Committed prose line for the base.'));
  } finally {
    rmTree(repo);
  }
});

test('a missing blob does not shift the batch parser onto the wrong key', () => {
  // The batch loop walks `git cat-file --batch` output positionally: each `missing` header
  // must advance the spec index WITHOUT consuming a payload. If that skip is wrong, every
  // subsequent blob is attributed to the previous spec's key, and the pools are silently
  // wrong rather than empty — the worst available failure. Two skills are used so a
  // misalignment lands prose in the other one's basis, where it is visible.
  const repo = mkdtempSync(join(tmpdir(), 'aa-tstatus-missing-'));
  try {
    const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' });
    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'test@example.invalid');
    git('config', 'user.name', 'Test');

    for (const [id, line] of [['alpha-skill', 'Alpha prose line, unique to alpha.'], ['beta-skill', 'Beta prose line, unique to beta.']]) {
      mkdirSync(join(repo, 'skills', id), { recursive: true });
      writeFileSync(join(repo, 'skills', id, 'SKILL.md'), withFrontmatter(`# ${id}\n\n${line}\n`));
    }
    git('add', '-A');
    git('commit', '-qm', 'two skills');

    // Delete one and commit: its path now appears in history at a commit where the OTHER
    // skill's blob is absent, so the walk emits specs that resolve to `missing`.
    rmTree(join(repo, 'skills', 'alpha-skill'));
    git('add', '-A');
    git('commit', '-qm', 'delete alpha');

    const history = buildEnglishProseHistory(repo);
    assert.ok(history.get('skills/alpha-skill')?.lines.has('Alpha prose line, unique to alpha.'));
    assert.ok(history.get('skills/beta-skill')?.lines.has('Beta prose line, unique to beta.'));
    assert.equal(history.get('skills/beta-skill')?.lines.has('Alpha prose line, unique to alpha.'), false,
      'a misaligned batch parse would cross-pollinate the two bases');
  } finally {
    rmTree(repo);
  }
});

test('buildEnglishProseHistory excludes templates and READMEs', () => {
  const repo = mkdtempSync(join(tmpdir(), 'aa-tstatus-tpl-'));
  try {
    const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' });
    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'test@example.invalid');
    git('config', 'user.name', 'Test');

    mkdirSync(join(repo, 'skills', '_template'), { recursive: true });
    writeFileSync(join(repo, 'skills', '_template', 'SKILL.md'), withFrontmatter('# T\n\nTemplate prose line here.\n'));
    mkdirSync(join(repo, 'guides'), { recursive: true });
    writeFileSync(join(repo, 'guides', 'README.md'), '# Guides\n\nGenerated index prose line.\n');
    git('add', '-A');
    git('commit', '-qm', 'templates');

    const history = buildEnglishProseHistory(repo);
    assert.equal(history.get('skills/_template'), undefined);
    assert.equal(history.get('guides/README'), undefined);
  } finally {
    rmTree(repo);
  }
});
