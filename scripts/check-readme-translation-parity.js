#!/usr/bin/env node
/**
 * Cross-surface parity gate: the published README translation table vs the
 * per-locale i18n/<code>/translation_status.yml files (#560).
 *
 * These are the project's two reader-facing statements of the same fact, and
 * until #560 they were independent derivations: generate-readmes.js counted
 * files with readdirSync/existsSync while generate-translation-status.js
 * judged each file's content. Every README cell was therefore
 * `translated + stubs` -- the README said `de 383/500 (76.6%)` where the
 * status files said `347/500 (69.4%)`. Nothing could catch it: check-readmes
 * regenerates the table with the same generator and compares it against
 * itself, so it agrees with any generator bug.
 *
 * This check deliberately does NOT call the generator. It parses the two
 * COMMITTED artifacts and compares them. That is what makes it able to see a
 * reintroduced existence count: a regenerate-and-compare gate would render
 * 366, read 366, and pass.
 *
 * Dependency-free on purpose: validate-integrity.yml runs the integrity
 * script with no `npm ci`, and A8 documents keeping that parse free of
 * js-yaml. The two YAML inputs are machine-generated with a fixed shape, so a
 * shape-restricted parser is honest here -- and it fails closed (exit 2)
 * rather than guessing whenever the shape is not the one it knows.
 *
 * The import graph is now this file -> lib/content-types.js, and that module is
 * a LEAF on purpose (#568): it declares the content-type list and imports
 * nothing, so this file's transitive closure stays inside node builtins. An
 * import added anywhere in that closure breaks B13 in CI only -- green locally,
 * where node_modules exists. scripts/test/dependency-free.test.js enforces it.
 *
 * Exit codes:
 *   0  the two surfaces agree
 *   1  they disagree (the defect this exists to catch)
 *   2  the comparison could not be made at all (missing markers, unparseable
 *      input, no locales) -- never read this as a pass
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Both lines are needed: `export ... from` does not create a local binding, and this module
// uses CONTENT_TYPES itself. Re-exported so existing importers of this file keep working.
import { CONTENT_TYPES } from './lib/content-types.js';

export { CONTENT_TYPES };

/** Marker suffix a cell carries when the generator fell back to file counting. */
export const FALLBACK_MARK = '*';

/** Rendered when a number was not measured (never `0`, which reads as "none"). */
export const UNMEASURED = '-';

/**
 * One YAML scalar: strips matching outer quotes and an unquoted trailing
 * comment. `- code: "zh-CN"` and `name: Deutsch # German` are both legal YAML
 * that js-yaml reads correctly, and capturing them verbatim produced a red
 * gate whose message blamed the README for a quoting choice in _config.yml.
 */
function scalar(raw) {
  const value = raw.trim();
  const quote = value[0];
  if ((quote === '"' || quote === "'") && value.length >= 2 && value.endsWith(quote)) {
    return value.slice(1, -1);
  }
  const comment = value.indexOf(' #');
  return comment === -1 ? value : value.slice(0, comment).trim();
}

/**
 * Locale codes and display names from i18n/_config.yml.
 *
 * Shape-restricted to the `supported_locales:` block's `- code:` / `name:`
 * pairs. Anything else throws rather than returning a short list -- a
 * silently-truncated locale list would make the row-set comparison below
 * pass by not looking.
 *
 * Duplicate keys throw, because js-yaml (which every other consumer of this
 * file uses) throws `duplicated mapping key`. A parser advertising that it
 * fails closed rather than guessing must not quietly resolve a duplicate to
 * first-wins while the generator beside it crashes on the same bytes.
 */
export function parseLocales(configText) {
  const lines = configText.split('\n');
  const start = lines.findIndex((l) => /^supported_locales:\s*$/.test(l));
  if (start === -1) throw new Error('i18n/_config.yml: no `supported_locales:` block');

  const locales = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i].replace(/\r$/, '');
    if (/^\S/.test(line)) break; // dedented out of the block
    if (/^\s*$/.test(line)) continue;
    const code = line.match(/^\s*-\s+code:\s*(.+?)\s*$/);
    if (code) {
      locales.push({ code: scalar(code[1]), name: null });
      continue;
    }
    const name = line.match(/^\s*name:\s*(.+?)\s*$/);
    if (name && locales.length) {
      const current = locales[locales.length - 1];
      if (current.name !== null) {
        throw new Error(`i18n/_config.yml: locale '${current.code}' has a duplicate name: key (js-yaml would throw)`);
      }
      current.name = scalar(name[1]);
      continue;
    }
    if (/^\s*(name_en|status):/.test(line)) continue;
    throw new Error(`i18n/_config.yml: unrecognised line in supported_locales: ${JSON.stringify(line)}`);
  }
  if (!locales.length) throw new Error('i18n/_config.yml: supported_locales is empty');
  for (const l of locales) {
    if (!l.name) throw new Error(`i18n/_config.yml: locale '${l.code}' has no name`);
  }
  return locales;
}

/**
 * `coverage:` numbers from one translation_status.yml.
 *
 * Returns { skills|agents|teams|guides|total: { translated, total, pct, stubs } }
 * with pct kept as the VERBATIM string from the file. Re-deriving it here with
 * different rounding than generate-translation-status.js would be the
 * two-derivations defect reborn inside one cell.
 */
export function parseStatus(statusText) {
  const lines = statusText.split('\n').map((l) => l.replace(/\r$/, ''));
  const start = lines.findIndex((l) => /^coverage:\s*$/.test(l));
  if (start === -1) throw new Error('translation_status.yml: no `coverage:` block');

  const coverage = {};
  let current = null;
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^\S/.test(line)) break;
    if (/^\s*$/.test(line)) continue;
    const section = line.match(/^ {2}(\w[\w-]*):\s*$/);
    if (section) {
      current = section[1];
      // Duplicates throw rather than resolving last-wins: js-yaml rejects a
      // `duplicated mapping key`, so a silently-accepted duplicate would let
      // a doctored pair sit green under this gate while every generator that
      // reads the same file crashes.
      if (coverage[current]) throw new Error(`translation_status.yml: duplicate coverage.${current} section (js-yaml would throw)`);
      coverage[current] = {};
      continue;
    }
    const field = line.match(/^ {4}(\w+):\s*(\S+)\s*$/);
    if (field && current) {
      if (coverage[current][field[1]] !== undefined) {
        throw new Error(`translation_status.yml: duplicate coverage.${current}.${field[1]} key (js-yaml would throw)`);
      }
      coverage[current][field[1]] = field[2];
      continue;
    }
    throw new Error(`translation_status.yml: unrecognised line in coverage: ${JSON.stringify(line)}`);
  }

  for (const key of [...CONTENT_TYPES, 'total']) {
    if (!coverage[key]) throw new Error(`translation_status.yml: coverage.${key} missing`);
    // `stale` became reader-facing in #569 — it is rendered in i18n/README.md's locale table
    // and nowhere else, so it was the one number in the status file with no parity partner.
    // Required here so a status file missing it fails the parse instead of rendering the
    // literal string `undefined` into a committed table that every gate then agrees with.
    for (const field of ['translated', 'total', 'pct', 'stubs', 'unjudged', 'stale']) {
      if (coverage[key][field] === undefined) {
        throw new Error(`translation_status.yml: coverage.${key}.${field} missing`);
      }
    }
  }
  return coverage;
}

/**
 * Rows of the README's AUTO:translations table, keyed by locale code.
 *
 * A malformed row is an error, not a skip: a row this parser cannot read is a
 * row it cannot compare, and skipping it would report agreement it never
 * established.
 */
export function parseTableRows(text, markerName, expectedCells, headerFirstCell) {
  const open = `<!-- AUTO:START:${markerName} -->`;
  const close = `<!-- AUTO:END:${markerName} -->`;
  const from = text.indexOf(open);
  const to = text.indexOf(close);
  if (from === -1 || to === -1 || to < from) {
    throw new Error(`README: AUTO:${markerName} markers missing or inverted`);
  }

  const block = text.slice(from + open.length, to);
  const rows = new Map();
  for (const raw of block.split('\n')) {
    const line = raw.replace(/\r$/, '').trim();
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (!cells.length) continue;
    if (/^-+$/.test(cells[0]) || cells[0] === headerFirstCell) continue; // header / separator
    if (cells.length !== expectedCells) {
      throw new Error(`README: ${markerName} row has ${cells.length} cells, expected ${expectedCells}: ${JSON.stringify(line)}`);
    }
    if (rows.has(cells[0])) throw new Error(`README: duplicate ${markerName} row for locale '${cells[0]}'`);
    rows.set(cells[0], cells);
  }
  if (!rows.size) throw new Error(`README: AUTO:${markerName} block contains no data rows`);
  return rows;
}

export function parseReadmeTable(readmeText, markerName = 'translations') {
  const rows = new Map();
  for (const [code, cells] of parseTableRows(readmeText, markerName, 9, 'Locale')) {
    const [, name, skills, agents, teams, guides, total, stubs, unjudged] = cells;
    rows.set(code, { code, name, skills, agents, teams, guides, total, stubs, unjudged });
  }
  return rows;
}

/** `340/369` (optionally marked) -> { translated, total, fallback }. */
function parseRatioCell(cell, label) {
  const fallback = cell.endsWith(FALLBACK_MARK);
  const bare = fallback ? cell.slice(0, -FALLBACK_MARK.length) : cell;
  const m = bare.match(/^(\d+)\/(\d+)$/);
  if (!m) throw new Error(`README: cell '${label}' is not N/M: ${JSON.stringify(cell)}`);
  return { translated: m[1], total: m[2], fallback };
}

/** `347/500 (69.4%)` (optionally marked) -> { translated, total, pct, fallback }. */
function parseTotalCell(cell) {
  const fallback = cell.endsWith(FALLBACK_MARK);
  const bare = fallback ? cell.slice(0, -FALLBACK_MARK.length) : cell;
  const m = bare.match(/^(\d+)\/(\d+)\s+\((\d+(?:\.\d+)?)%\)$/);
  if (!m) throw new Error(`README: total cell is not 'N/M (P%)': ${JSON.stringify(cell)}`);
  return { translated: m[1], total: m[2], pct: m[3], fallback };
}

/**
 * Compare the parsed surfaces. Pure: takes already-read text so the unit
 * tests exercise the same code path CI does, on fixtures rather than the repo.
 *
 * `statusTexts` maps locale code -> file text, or to `null` when that locale
 * has no status file on disk.
 */
export function compareSurfaces({ locales, readmeRows, statusTexts }) {
  const failures = [];
  const seen = new Set();

  for (const locale of locales) {
    const { code } = locale;
    seen.add(code);
    const row = readmeRows.get(code);
    if (!row) {
      // Iterating locales (not README rows) is what lets a DELETED row be
      // seen at all; a loop over rows can only ever check what is present.
      failures.push(`locale '${code}' is in i18n/_config.yml but has no row in the README translations table`);
      continue;
    }

    const statusText = statusTexts.get(code);
    let coverage = null;
    if (statusText != null) {
      try {
        coverage = parseStatus(statusText);
      } catch (err) {
        failures.push(`locale '${code}': ${err.message}`);
        continue;
      }
    }

    let cells;
    try {
      cells = {
        skills: parseRatioCell(row.skills, `${code}.skills`),
        agents: parseRatioCell(row.agents, `${code}.agents`),
        teams: parseRatioCell(row.teams, `${code}.teams`),
        guides: parseRatioCell(row.guides, `${code}.guides`),
        total: parseTotalCell(row.total)
      };
    } catch (err) {
      failures.push(err.message);
      continue;
    }

    // Checked for every row, measured or not. This used to sit below the
    // fallback branch's `continue`, so a fallback row's language was never
    // compared to anything.
    if (row.name !== locale.name) {
      failures.push(`${code}: README language '${row.name}' != i18n/_config.yml name '${locale.name}'`);
    }

    const numberCells = Object.values(cells);
    const markedCount = numberCells.filter((c) => c.fallback).length;
    const marked = markedCount > 0;

    if (coverage === null) {
      // No status file: the fallback count is the only number available, and
      // the table must say so rather than presenting it as measured. EVERY
      // cell must carry the mark -- `some` let a row with one marked cell and
      // four arbitrary unmarked ones pass, which is exactly the "unmeasured
      // number presented as measured" this branch exists to reject.
      if (markedCount !== numberCells.length) {
        const how = markedCount === 0
          ? 'the row is not marked'
          : `only ${markedCount} of its ${numberCells.length} number cells are marked`;
        failures.push(
          `locale '${code}' has no i18n/${code}/translation_status.yml, so its README numbers are a file count, ` +
          `but ${how} '${FALLBACK_MARK}' -- an unmeasured number is presented as measured`
        );
      }
      for (const field of ['stubs', 'unjudged']) {
        if (row[field] !== UNMEASURED) {
          failures.push(`locale '${code}' has no status file, so ${field} is unmeasured; expected '${UNMEASURED}', README says '${row[field]}'`);
        }
      }
      continue;
    }

    // A status file exists, so nothing may be marked as a fallback: a marked
    // cell here means the generator silently fell back with real data on disk.
    if (marked) {
      failures.push(
        `locale '${code}' has a translation_status.yml but its README row is marked '${FALLBACK_MARK}' ` +
        `(the generator fell back to file counting while measured numbers exist)`
      );
      continue;
    }

    for (const ct of CONTENT_TYPES) {
      const expected = coverage[ct];
      const actual = cells[ct];
      if (actual.translated !== String(expected.translated)) {
        failures.push(
          `${code}.${ct}: README says translated=${actual.translated}, ` +
          `i18n/${code}/translation_status.yml says ${expected.translated} ` +
          `(stubs=${expected.stubs}; ${Number(expected.translated) + Number(expected.stubs)} would be an existence count)`
        );
      }
      if (actual.total !== String(expected.total)) {
        failures.push(`${code}.${ct}: README denominator ${actual.total} != status total ${expected.total}`);
      }
    }

    const expectedTotal = coverage.total;
    if (cells.total.translated !== String(expectedTotal.translated)) {
      failures.push(
        `${code}.total: README says translated=${cells.total.translated}, ` +
        `status says ${expectedTotal.translated} ` +
        `(stubs=${expectedTotal.stubs}; ${Number(expectedTotal.translated) + Number(expectedTotal.stubs)} would be an existence count)`
      );
    }
    if (cells.total.total !== String(expectedTotal.total)) {
      failures.push(`${code}.total: README denominator ${cells.total.total} != status total ${expectedTotal.total}`);
    }
    if (cells.total.pct !== String(expectedTotal.pct)) {
      failures.push(`${code}.total: README pct ${cells.total.pct}% != status pct ${expectedTotal.pct}%`);
    }
    // Every number in the status file now has a parity partner. `unjudged` was briefly the
    // only one without — which is exactly the 'two surfaces, one unchecked' gap #560 closed
    // for `translated`, reintroduced one field over.
    for (const field of ['stubs', 'unjudged']) {
      if (row[field] !== String(expectedTotal[field])) {
        failures.push(`${code}: README ${field} column ${row[field]} != status ${field} ${expectedTotal[field]}`);
      }
    }
  }

  // Reverse containment: a row for a locale the config does not list.
  for (const code of readmeRows.keys()) {
    if (!seen.has(code)) {
      failures.push(`README translations table has a row for '${code}', which is not a supported locale in i18n/_config.yml`);
    }
  }

  return { failures, checked: locales.length };
}

/**
 * Compare `i18n/README.md`'s locale table against the status files (#569).
 *
 * The second reader-facing table. Without this it had NO independent check: `check-readmes`
 * regenerates it with the same generator and — in this file's own words — "agrees with any
 * generator bug". The specific gap that matters is the one #569 exists to close: the old
 * hand-maintained table listed 4 of 10 locales, and iterating LOCALES rather than rows is what
 * makes a missing one visible. Generated or not, a `loadLocaleCoverage` that quietly filtered
 * the list would otherwise leave every gate green.
 *
 * @returns {string[]} failures
 */
export function compareLocaleTable({ locales, rows, statusTexts }) {
  const failures = [];
  const seen = new Set();

  for (const locale of locales) {
    const { code } = locale;
    seen.add(code);
    const row = rows.get(code);
    if (!row) {
      failures.push(`locale '${code}' is in i18n/_config.yml but has no row in the i18n/README.md locale table`);
      continue;
    }
    if (row.name !== locale.name) {
      failures.push(`${code}: i18n/README.md language '${row.name}' != i18n/_config.yml name '${locale.name}'`);
    }

    const statusText = statusTexts.get(code);
    if (statusText == null) continue; // unmeasured rows are rendered as '-' by design
    let coverage;
    try {
      coverage = parseStatus(statusText);
    } catch (err) {
      failures.push(`locale '${code}': ${err.message}`);
      continue;
    }

    for (const ct of CONTENT_TYPES) {
      const expected = `${coverage[ct].translated}/${coverage[ct].total}`;
      if (row[ct] !== expected) {
        failures.push(`${code}.${ct}: i18n/README.md says ${row[ct]}, status file says ${expected}`);
      }
    }
    const t = coverage.total;
    const expectedTotal = `${t.translated}/${t.total} (${t.pct}%)`;
    if (row.translated !== expectedTotal) {
      failures.push(`${code}.total: i18n/README.md says ${row.translated}, status file says ${expectedTotal}`);
    }
    // The whole reason this comparison exists: `stale` appears in no other table.
    if (row.stale !== String(t.stale)) {
      failures.push(`${code}: i18n/README.md stale ${row.stale} != status stale ${t.stale}`);
    }
  }

  for (const code of rows.keys()) {
    if (!seen.has(code)) {
      failures.push(`i18n/README.md locale table has a row for '${code}', which is not a supported locale`);
    }
  }
  return failures;
}

/** Parse `i18n/README.md`'s `i18n-locales` table into rows keyed by locale code. */
export function parseLocaleTable(text) {
  const rows = new Map();
  for (const [code, cells] of parseTableRows(text, 'i18n-locales', 8, 'Code')) {
    const [, name, skills, agents, teams, guides, translated, stale] = cells;
    rows.set(code, { code, name, skills, agents, teams, guides, translated, stale });
  }
  return rows;
}

function main() {
  let locales;
  let readmeRows;
  let localeRows;
  const statusTexts = new Map();
  try {
    locales = parseLocales(readFileSync(resolve(ROOT, 'i18n/_config.yml'), 'utf8'));
    readmeRows = parseReadmeTable(readFileSync(resolve(ROOT, 'README.md'), 'utf8'));
    localeRows = parseLocaleTable(readFileSync(resolve(ROOT, 'i18n/README.md'), 'utf8'));
    for (const { code } of locales) {
      const p = resolve(ROOT, `i18n/${code}/translation_status.yml`);
      statusTexts.set(code, existsSync(p) ? readFileSync(p, 'utf8') : null);
    }
  } catch (err) {
    console.error(`FAIL: README/translation-status parity could not be evaluated: ${err.message}`);
    console.error('       (exit 2 -- this is not a pass)');
    process.exit(2);
  }

  const { failures, checked } = compareSurfaces({ locales, readmeRows, statusTexts });
  const localeFailures = compareLocaleTable({ locales, rows: localeRows, statusTexts });
  const all = [...failures, ...localeFailures];
  if (all.length) {
    console.error(`FAIL: a published translation table disagrees with i18n/*/translation_status.yml (${all.length} discrepancies across ${checked} locales)`);
    for (const f of all) console.error(`  - ${f}`);
    console.error('  Fix: npm run update-readmes (after npm run translation:status), then commit both.');
    process.exit(1);
  }
  console.log(`OK: README.md and i18n/README.md both match i18n/*/translation_status.yml for all ${checked} locales`);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}
