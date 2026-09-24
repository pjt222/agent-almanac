/**
 * Unit tests for `scripts/check-readme-translation-parity.js` (#560).
 *
 * The defect this gate exists to catch shipped on the repo front page for
 * months and survived a release whose CHANGELOG claimed to have fixed exactly
 * this class: the README table counted files, so every cell was
 * `translated + stubs`. Nothing could see it, because the only check that
 * touched the README regenerated it with the same generator and compared it
 * against itself.
 *
 * So the load-bearing test here is `replays the real #560 numbers` below: it
 * feeds the actual pre-fix `de` row and the actual `de` coverage block into
 * the comparison and asserts it goes red, naming 340 and 26. That fixture is
 * the historical defect, frozen. The rest of the tests each name a way the
 * gate could quietly stop looking -- a deleted row, an unparseable cell, a
 * fallback that hides a measured number -- because a gate that skips is
 * indistinguishable from a gate that passes.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  parseLocales,
  parseStatus,
  parseReadmeTable,
  compareSurfaces,
  CONTENT_TYPES,
  FALLBACK_MARK,
  UNMEASURED
} from '../check-readme-translation-parity.js';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

// ── Fixtures ─────────────────────────────────────────────────────

const CONFIG = `version: "1.0"
source_locale: en
supported_locales:
  - code: de
    name: Deutsch
    name_en: German
    status: active
  - code: ja
    name: 日本語
    name_en: Japanese
    status: active
`;

/** The real i18n/de/translation_status.yml coverage block, as committed. */
const DE_STATUS = `locale: de
last_updated: '2026-08-11'
coverage:
  skills:
    translated: 340
    total: 369
    pct: 92.1
    stale: 166
    stubs: 26
    unjudged: 2
  agents:
    translated: 3
    total: 75
    pct: 4
    stale: 3
    stubs: 3
    unjudged: 0
  teams:
    translated: 1
    total: 22
    pct: 4.5
    stale: 1
    stubs: 5
    unjudged: 0
  guides:
    translated: 3
    total: 34
    pct: 8.8
    stale: 2
    stubs: 2
    unjudged: 1
  total:
    translated: 347
    total: 500
    pct: 69.4
    stale: 172
    stubs: 36
    unjudged: 3
`;

const JA_STATUS = DE_STATUS.replace("locale: de", "locale: ja");

function table(rows) {
  return [
    '<!-- AUTO:START:translations -->',
    '| Locale | Language | Skills | Agents | Teams | Guides | Total | Stubs | Unjudged |',
    '|---|---|---|---|---|---|---|---|---|',
    ...rows,
    '<!-- AUTO:END:translations -->'
  ].join('\n');
}

/** The corrected `de` row: translated-only, with stubs broken out. */
const DE_ROW_CORRECT = '| de | Deutsch | 340/369 | 3/75 | 1/22 | 3/34 | 347/500 (69.4%) | 36 | 3 |';
/** The row as the pre-#560 generator actually rendered it (existence counts). */
const DE_ROW_PREFIX = '| de | Deutsch | 366/369 | 6/75 | 6/22 | 5/34 | 383/500 (76.6%) | 36 | 3 |';
const JA_ROW_CORRECT = '| ja | 日本語 | 340/369 | 3/75 | 1/22 | 3/34 | 347/500 (69.4%) | 36 | 3 |';

function compare(rows, { statuses } = {}) {
  const locales = parseLocales(CONFIG);
  const readmeRows = parseReadmeTable(table(rows));
  const statusTexts = new Map(statuses ?? [['de', DE_STATUS], ['ja', JA_STATUS]]);
  return compareSurfaces({ locales, readmeRows, statusTexts });
}

// ── parseLocales ─────────────────────────────────────────────────

test('parseLocales reads codes and display names in order', () => {
  assert.deepEqual(parseLocales(CONFIG), [
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' }
  ]);
});

test('parseLocales throws rather than returning a short list', () => {
  // A truncated locale list would make the row-set comparison pass by not
  // looking -- the failure mode is silent, so the parse must be loud.
  assert.throws(() => parseLocales('version: "1.0"\n'), /supported_locales/);
  assert.throws(() => parseLocales('supported_locales:\n'), /empty/);
  assert.throws(
    () => parseLocales('supported_locales:\n  - code: de\n    unexpected: x\n'),
    /unrecognised line/
  );
  assert.throws(() => parseLocales('supported_locales:\n  - code: de\n    status: active\n'), /no name/);
});

test('parseLocales reads the LAST line of a block that runs to end of file', () => {
  // #574 deleted `content_types:`, which used to be the first dedented line and therefore
  // always what stopped the block scan. The production file now takes the exhaustion path
  // that only synthetic fixtures reached before.
  //
  // The first version of this test was theatre, and review said so. It asserted a config
  // ending `    status: active\n`, which four existing fixtures in this file already cover —
  // and worse, it could not detect an off-by-one in the very bound it was named for. Mutate
  // the loop to `i < lines.length - 1` and every one of those fixtures survives, because each
  // ends on a line whose loss changes nothing: a trailing `''`, or a `continue` line such as
  // `status:`.
  //
  // So the final line has to be LOAD-BEARING. With `name:` last and no trailing newline, the
  // mutant skips it, `name` stays null, and the parser throws `/no name/` — red under the
  // mutant, green against the real code.
  assert.deepEqual(
    parseLocales('supported_locales:\n  - code: de\n    name: Deutsch'),
    [{ code: 'de', name: 'Deutsch' }],
  );

  // The same shape WITH a trailing newline, so both terminations are pinned.
  assert.deepEqual(
    parseLocales('supported_locales:\n  - code: de\n    name: Deutsch\n'),
    [{ code: 'de', name: 'Deutsch' }],
  );
});

test('parseLocales reads the real i18n/_config.yml, which now ends at the block', () => {
  // The only assertion here that touches the actual EOF-terminated file. Everything else is
  // synthetic, and #574's change is precisely a change to the real file's shape — so without
  // this, nothing at unit level would notice if that file stopped parsing.
  const config = readFileSync(resolve(REPO_ROOT, 'i18n/_config.yml'), 'utf8');
  assert.ok(!/^content_types:/m.test(config), 'the dead key must stay gone');
  assert.deepEqual(
    parseLocales(config).map((l) => l.code),
    ['de', 'zh-CN', 'ja', 'es', 'caveman-lite', 'caveman', 'caveman-ultra',
      'wenyan-lite', 'wenyan', 'wenyan-ultra'],
  );
});

test('parseLocales stops at the end of the block', () => {
  const withTrailer = `${CONFIG}other_key:\n  - code: nope\n    name: Nope\n`;
  assert.deepEqual(parseLocales(withTrailer).map((l) => l.code), ['de', 'ja']);
});

// ── parseStatus ──────────────────────────────────────────────────

test('parseStatus reads every coverage section', () => {
  const coverage = parseStatus(DE_STATUS);
  for (const ct of [...CONTENT_TYPES, 'total']) assert.ok(coverage[ct], `missing ${ct}`);
  assert.equal(coverage.skills.translated, '340');
  assert.equal(coverage.skills.stubs, '26');
  assert.equal(coverage.total.translated, '347');
  assert.equal(coverage.total.stubs, '36');
});

test('parseStatus keeps pct verbatim, not re-derived', () => {
  // Re-deriving pct here with different rounding than
  // generate-translation-status.js is the two-derivations defect reborn
  // inside one cell, and would leave the gate permanently red.
  assert.equal(parseStatus(DE_STATUS).total.pct, '69.4');
  assert.equal(parseStatus(DE_STATUS).agents.pct, '4', 'whole-number pct must not gain a .0');
});

test('parseStatus throws on a missing block or field', () => {
  assert.throws(() => parseStatus('locale: de\n'), /no `coverage:` block/);
  const noStubs = DE_STATUS.replace('    stubs: 26\n', '');
  assert.throws(() => parseStatus(noStubs), /coverage\.skills\.stubs missing/);
  const noTotal = DE_STATUS.replace(/  total:\n(?:.*\n){6}/, '');
  assert.throws(() => parseStatus(noTotal), /coverage\.total missing/);
});

test('parseStatus tolerates CRLF', () => {
  const coverage = parseStatus(DE_STATUS.replace(/\n/g, '\r\n'));
  assert.equal(coverage.total.translated, '347');
});

// ── parseReadmeTable ─────────────────────────────────────────────

test('parseReadmeTable keys rows by locale and skips header and separator', () => {
  const rows = parseReadmeTable(table([DE_ROW_CORRECT, JA_ROW_CORRECT]));
  assert.deepEqual([...rows.keys()], ['de', 'ja']);
  assert.equal(rows.get('de').skills, '340/369');
  assert.equal(rows.get('de').stubs, '36');
});

test('parseReadmeTable throws on missing or inverted markers', () => {
  assert.throws(() => parseReadmeTable('# README\n'), /markers missing/);
  const inverted = '<!-- AUTO:END:translations -->\n<!-- AUTO:START:translations -->';
  assert.throws(() => parseReadmeTable(inverted), /markers missing or inverted/);
});

test('parseReadmeTable refuses a row it cannot compare', () => {
  // A malformed row must be an error, not a skip: skipping reports agreement
  // that was never established. The 7-cell case is the literal pre-fix table.
  const sevenCell = '| de | Deutsch | 366/369 | 6/75 | 6/22 | 5/34 | 383/500 (76.6%) |';
  assert.throws(() => parseReadmeTable(table([sevenCell])), /7 cells, expected 9/);
});

test('parseReadmeTable rejects duplicate and empty tables', () => {
  assert.throws(() => parseReadmeTable(table([DE_ROW_CORRECT, DE_ROW_CORRECT])), /duplicate/);
  assert.throws(() => parseReadmeTable(table([])), /no data rows/);
});

// ── compareSurfaces: the defect ──────────────────────────────────

test('replays the real #560 numbers and goes red on every one', () => {
  const { failures } = compare([DE_ROW_PREFIX, JA_ROW_CORRECT]);
  const text = failures.join('\n');

  // skills 366 = 340 translated + 26 stubs; the message must say so, because
  // "366 != 340" alone does not tell a maintainer it is an existence count.
  assert.match(text, /de\.skills: README says translated=366/);
  assert.match(text, /says 340/);
  assert.match(text, /366 would be an existence count/);
  assert.match(text, /de\.agents: README says translated=6/);
  assert.match(text, /de\.teams: README says translated=6/);
  assert.match(text, /de\.guides: README says translated=5/);
  assert.match(text, /de\.total: README says translated=383/);
  assert.match(text, /de\.total: README pct 76\.6% != status pct 69\.4%/);

  // ja is correct in this fixture and must not be implicated.
  assert.ok(!/^.*\bja\./m.test(text.replace(/日本語/g, '')), `ja should be clean:\n${text}`);
});

test('agreement produces no failures', () => {
  const { failures, checked } = compare([DE_ROW_CORRECT, JA_ROW_CORRECT]);
  assert.deepEqual(failures, []);
  assert.equal(checked, 2);
});

// ── compareSurfaces: ways the gate could stop looking ────────────

test('a deleted row is caught (iteration is over locales, not rows)', () => {
  // A loop over README rows can never see a row that is not there. This is
  // the same blind spot as a history-match gate that cannot see a deletion.
  const { failures } = compare([DE_ROW_CORRECT]);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /locale 'ja' is in i18n\/_config\.yml but has no row/);
});

test('a row for an unsupported locale is caught', () => {
  const stray = '| xx | Klingon | 1/369 | 0/75 | 0/22 | 0/34 | 1/500 (0.2%) | 0 | 0 |';
  const statuses = [['de', DE_STATUS], ['ja', JA_STATUS], ['xx', null]];
  const { failures } = compare([DE_ROW_CORRECT, JA_ROW_CORRECT, stray], { statuses });
  assert.equal(failures.length, 1);
  assert.match(failures[0], /row for 'xx', which is not a supported locale/);
});

test('a mismatched denominator, pct, stub count, or language is caught', () => {
  const cases = [
    ['| de | Deutsch | 340/999 | 3/75 | 1/22 | 3/34 | 347/500 (69.4%) | 36 | 3 |', /denominator 999 != status total 369/],
    ['| de | Deutsch | 340/369 | 3/75 | 1/22 | 3/34 | 347/500 (70.0%) | 36 | 3 |', /pct 70\.0% != status pct 69\.4%/],
    ['| de | Deutsch | 340/369 | 3/75 | 1/22 | 3/34 | 347/500 (69.4%) | 0 | 3 |', /stubs column 0 != status stubs 36/],
    ['| de | Deutsched | 340/369 | 3/75 | 1/22 | 3/34 | 347/500 (69.4%) | 36 | 3 |', /language 'Deutsched' != .* 'Deutsch'/]
  ];
  for (const [row, expected] of cases) {
    const { failures } = compare([row, JA_ROW_CORRECT]);
    assert.equal(failures.length, 1, `expected exactly one failure for ${row}`);
    assert.match(failures[0], expected);
  }
});

test('an unparseable cell fails rather than being skipped', () => {
  const bad = '| de | Deutsch | many | 3/75 | 1/22 | 3/34 | 347/500 (69.4%) | 36 | 3 |';
  const { failures } = compare([bad, JA_ROW_CORRECT]);
  assert.match(failures.join('\n'), /de\.skills' is not N\/M/);
});

test('a malformed status file fails rather than being skipped', () => {
  const statuses = [['de', 'locale: de\n'], ['ja', JA_STATUS]];
  const { failures } = compare([DE_ROW_CORRECT, JA_ROW_CORRECT], { statuses });
  assert.match(failures.join('\n'), /locale 'de': .*no `coverage:` block/);
});

// ── compareSurfaces: the fallback path ───────────────────────────
// All ten real locales have a status file, so the corpus can never exercise
// these. Without fixtures the fallback branch would ship untested.

test('a locale with no status file must be marked, and its stubs unmeasured', () => {
  const marked = `| ja | 日本語 | 366/369${FALLBACK_MARK} | 6/75${FALLBACK_MARK} | 6/22${FALLBACK_MARK} | 5/34${FALLBACK_MARK} | 383/500 (76.6%)${FALLBACK_MARK} | ${UNMEASURED} | ${UNMEASURED} |`;
  const statuses = [['de', DE_STATUS], ['ja', null]];
  const { failures } = compare([DE_ROW_CORRECT, marked], { statuses });
  assert.deepEqual(failures, []);
});

test('an unmarked row with no status file is caught', () => {
  const statuses = [['de', DE_STATUS], ['ja', null]];
  const { failures } = compare([DE_ROW_CORRECT, JA_ROW_CORRECT], { statuses });
  assert.match(failures.join('\n'), /not marked '\*' -- an unmeasured number is presented as measured/);
});

test('a fallback marker while a status file exists is caught', () => {
  // This is the generator silently falling back with real data on disk --
  // the number would be an existence count again, wearing an excuse.
  const marked = `| ja | 日本語 | 366/369${FALLBACK_MARK} | 6/75 | 6/22 | 5/34 | 383/500 (76.6%) | 36 | 3 |`;
  const { failures } = compare([DE_ROW_CORRECT, marked]);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /has a translation_status\.yml but its README row is marked/);
});

test('a PARTIALLY marked status-less row is caught', () => {
  // Was a live fail-open: the marked test used `some`, so one marked cell
  // excused four unmarked ones carrying arbitrary numbers -- precisely the
  // "unmeasured number presented as measured" this branch rejects. (#562 F2)
  const mixed = `| ja | 日本語 | 366/369${FALLBACK_MARK} | 6/75 | 6/22 | 5/34 | 383/500 (76.6%) | ${UNMEASURED} | ${UNMEASURED} |`;
  const statuses = [['de', DE_STATUS], ['ja', null]];
  const { failures } = compare([DE_ROW_CORRECT, mixed], { statuses });
  assert.equal(failures.length, 1);
  assert.match(failures[0], /only 1 of its 5 number cells are marked/);
});

test('a status-less row still has its language checked', () => {
  // The name check sat below the fallback branch's `continue`, so a fallback
  // row's language was compared to nothing. (#562 F2)
  const wrongName = `| ja | Japanisch | 366/369${FALLBACK_MARK} | 6/75${FALLBACK_MARK} | 6/22${FALLBACK_MARK} | 5/34${FALLBACK_MARK} | 383/500 (76.6%)${FALLBACK_MARK} | ${UNMEASURED} | ${UNMEASURED} |`;
  const statuses = [['de', DE_STATUS], ['ja', null]];
  const { failures } = compare([DE_ROW_CORRECT, wrongName], { statuses });
  assert.equal(failures.length, 1);
  assert.match(failures[0], /README language 'Japanisch' != .* '日本語'/);
});

// ── Duplicate keys: the fail-closed promise ──────────────────────
// js-yaml throws `duplicated mapping key`, so every other consumer of these
// files crashes on a duplicate. A parser that advertises fail-closed must not
// resolve one to last-wins and report OK. (#562 F3)

test('a duplicate coverage section throws instead of taking last-wins', () => {
  const doctored = `${DE_STATUS}  skills:\n    translated: 999\n    total: 369\n    pct: 99\n    stale: 0\n    stubs: 0\n`;
  assert.throws(() => parseStatus(doctored), /duplicate coverage\.skills section/);
});

test('a duplicate coverage field throws', () => {
  const doctored = DE_STATUS.replace('    stubs: 26\n', '    stubs: 26\n    translated: 999\n');
  assert.throws(() => parseStatus(doctored), /duplicate coverage\.skills\.translated key/);
});

test('a duplicate locale name throws instead of taking first-wins', () => {
  const doctored = CONFIG.replace('    name: Deutsch\n', '    name: Deutsch\n    name: Klingon\n');
  assert.throws(() => parseLocales(doctored), /locale 'de' has a duplicate name/);
});

// ── Legal YAML the verbatim parser used to mangle (#562 F6) ──────

test('quoted codes and names are read as YAML reads them', () => {
  const quoted = `supported_locales:\n  - code: "zh-CN"\n    name: '简体中文'\n    status: active\n`;
  assert.deepEqual(parseLocales(quoted), [{ code: 'zh-CN', name: '简体中文' }]);
});

test('a trailing comment is not captured as part of the value', () => {
  const commented = 'supported_locales:\n  - code: de # the German locale\n    name: Deutsch # German\n';
  assert.deepEqual(parseLocales(commented), [{ code: 'de', name: 'Deutsch' }]);
});

test('a status-less locale reporting a stub count is caught', () => {
  const marked = `| ja | 日本語 | 366/369${FALLBACK_MARK} | 6/75${FALLBACK_MARK} | 6/22${FALLBACK_MARK} | 5/34${FALLBACK_MARK} | 383/500 (76.6%)${FALLBACK_MARK} | 0 | ${UNMEASURED} |`;
  const statuses = [['de', DE_STATUS], ['ja', null]];
  const { failures } = compare([DE_ROW_CORRECT, marked], { statuses });
  assert.equal(failures.length, 1);
  assert.match(failures[0], /stubs is unmeasured; expected '-'/);
});
