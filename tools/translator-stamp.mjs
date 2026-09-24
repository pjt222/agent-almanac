#!/usr/bin/env node
/**
 * translator-stamp.mjs — keep the `translator:` frontmatter field honest on scaffolds (#545).
 *
 * A scaffold is a copy of its English source, so its `translator:` value must not claim a
 * translation or a review happened. `scripts/translate-content.sh` stamps the stub value; this
 * tool answers, for the corpus that already exists, "which stubs still carry a value that asserts
 * more than that?" — and repairs exactly those, nothing else.
 *
 *   node tools/translator-stamp.mjs            # preview: classify every stamped file, change nothing
 *   node tools/translator-stamp.mjs --write    # rewrite the field in STUB-verdict files only
 *   node tools/translator-stamp.mjs --verify   # exit 1 if any STUB-verdict file carries a non-stub value
 *
 * Stub-ness is decided by the verdicts of `scripts/generate-translation-status.js --verdicts`
 * (an inspection mode that writes nothing), never by this field. A verdict of STUB comes from
 * one of two detectors, and neither is byte equality: `no-novel-lines` (the mirror adds no line
 * the English source lacks — Latin-script locales) or `no-script` (no character of the target
 * script is present — CJK and wenyan locales). A file whose verdict is UNJUDGED, or whose body
 * carries translated lines, is left alone whatever its field says; the preview lists both
 * groups so a PR body can carry them.
 *
 * The stub value is READ from the scaffolder, not duplicated here, so the tool and the scaffolder
 * cannot disagree silently. `stubValueFromScaffolder` and `scaffolderStamps` are exported so
 * `scripts/test/translator-stamp.test.js` can pin the same rule against the documentation.
 *
 * Exit codes: 0 clean (or write done); 1 verify found violations; 2 the tool could not measure.
 * Every failure to measure — verdict script failing, verdict format changed, a locale/tree the
 * scan never covered, no STUB path matching any stamped file, no usable value in the scaffolder,
 * an unreadable file — exits 2, and 2 is never a pass.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const SCAFFOLDER = join(ROOT, 'scripts', 'translate-content.sh');
const VERDICTS_SCRIPT = join(ROOT, 'scripts', 'generate-translation-status.js');

class CannotMeasure extends Error {}

/** U+FEFF, built by code point so no invisible byte sits in this source file. */
const BOM = String.fromCharCode(0xfeff);

/** Every quoted `translator:` value the scaffolder stamps, one per insertion path. */
export function scaffolderStamps(scaffolderPath = SCAFFOLDER) {
  let source;
  try {
    source = readFileSync(scaffolderPath, 'utf8');
  } catch (error) {
    throw new CannotMeasure(`cannot read scaffolder ${scaffolderPath}: ${error.message}`);
  }
  return [...source.matchAll(/translator: \\"([^"\\]+)\\"/g)].map((m) => m[1]);
}

/**
 * The value the scaffolder stamps today — the single source of truth. Throws `CannotMeasure`
 * when the scaffolder carries no quoted value, more than one distinct value, or a value that
 * is a shell expansion rather than a literal (`$`, backtick, backslash), because the regex reads
 * source text and a `\"$STUB_VALUE\"` refactor would otherwise stamp that literal into files.
 */
export function stubValueFromScaffolder(scaffolderPath = SCAFFOLDER) {
  const matches = scaffolderStamps(scaffolderPath);
  if (matches.length === 0) throw new CannotMeasure(`no quoted translator value found in ${scaffolderPath}`);
  const distinct = new Set(matches);
  if (distinct.size !== 1) {
    throw new CannotMeasure(`scaffolder stamps ${distinct.size} different translator values: ${[...distinct].join(' | ')}`);
  }
  const value = matches[0];
  if (/[$`\\]/.test(value)) {
    throw new CannotMeasure(`scaffolder translator value is not a literal: ${value}`);
  }
  return value;
}

/**
 * Verdicts from the status generator. Only STUB and UNJUDGED files are listed; the per-tree
 * `scan <locale>/<tree>: …` summary lines say which locale/tree pairs were scanned at all, which
 * is what lets a stamped file outside the scan be refused instead of read as "translated".
 */
function verdicts() {
  let out;
  try {
    out = execFileSync(process.execPath, [VERDICTS_SCRIPT, '--verdicts'], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (error) {
    throw new CannotMeasure(`verdict script failed: ${String(error.message).split('\n')[0]}`);
  }
  const stub = new Set();
  const unjudged = new Set();
  const scannedPairs = new Set();
  for (const line of out.split(/\r?\n/)) {
    const v = /^\s*(STUB|UNJUDGED)\s+(\S+)/.exec(line);
    if (v) {
      (v[1] === 'STUB' ? stub : unjudged).add(v[2]);
      continue;
    }
    const s = /^\s*scan (\S+?)\/(\S+?): \d+ translated, \d+ stale, \d+ stubs, \d+ unjudged/.exec(line);
    if (s) scannedPairs.add(`${s[1]}/${s[2]}`);
  }
  if (stub.size === 0) throw new CannotMeasure('zero STUB verdicts parsed — the verdict format changed, not the corpus');
  if (scannedPairs.size === 0) throw new CannotMeasure('no `scan <locale>/<tree>:` summary lines parsed — the verdict format changed');
  return { stub, unjudged, scannedPairs };
}

/** Every tracked i18n markdown file carrying a translator field, with the field's value and line. */
function stampedFiles() {
  const listed = execFileSync('git', ['ls-files', '-z', 'i18n/*.md', 'i18n/**/*.md'], { cwd: ROOT, encoding: 'utf8' })
    .split('\0')
    .filter((p) => p && p !== 'i18n/README.md');
  const result = [];
  for (const rel of listed) {
    let text;
    try {
      text = readFileSync(join(ROOT, rel), 'utf8');
    } catch (error) {
      throw new CannotMeasure(`cannot read tracked file ${rel}: ${error.message}`);
    }
    const bom = text.startsWith(BOM);
    if (bom) text = text.slice(1);
    const eol = text.includes('\r\n') ? '\r\n' : '\n';
    const lines = text.split(eol);
    if (lines[0] !== '---') continue;
    const close = lines.indexOf('---', 1);
    if (close === -1) continue;
    for (let i = 1; i < close; i += 1) {
      const m = /^(\s*)translator:\s*(.*?)\s*$/.exec(lines[i]);
      if (!m) continue;
      result.push({ rel, lineIndex: i, indent: m[1], raw: m[2], value: m[2].replace(/^"(.*)"$/, '$1'), lines, eol, bom });
      break;
    }
  }
  return result;
}

function byValue(entries) {
  const groups = new Map();
  for (const e of entries) groups.set(e.value, (groups.get(e.value) ?? 0) + 1);
  return [...groups].sort((a, b) => b[1] - a[1]).map(([v, n]) => `${String(n).padStart(6)}  ${v}`).join('\n');
}

function main(argv) {
  const args = new Set(argv);
  const known = new Set(['--write', '--verify']);
  for (const arg of args) {
    if (!known.has(arg)) {
      console.error(`unknown argument: ${arg}`);
      return 2;
    }
  }
  if (args.has('--write') && args.has('--verify')) {
    console.error('--write and --verify are separate runs; verify after writing');
    return 2;
  }

  const stubValue = stubValueFromScaffolder();
  const { stub, unjudged, scannedPairs } = verdicts();
  const stamped = stampedFiles();

  // A stamped file the verdict scan never reached must not be read as "translated by absence".
  const unscanned = stamped.filter((e) => !scannedPairs.has(e.rel.split('/').slice(1, 3).join('/')));
  if (unscanned.length > 0) {
    const pairs = [...new Set(unscanned.map((e) => e.rel.split('/').slice(1, 3).join('/')))];
    throw new CannotMeasure(`${unscanned.length} stamped file(s) sit in locale/tree pair(s) the verdict scan never covered: ${pairs.join(', ')}`);
  }

  const repair = [];     // STUB verdict, field asserts more than "stub"
  const clean = [];      // STUB verdict, already carrying the stub value
  const translated = []; // neither STUB nor UNJUDGED — body carries translated lines; leave, list
  const unjudgedList = [];
  for (const entry of stamped) {
    if (stub.has(entry.rel)) {
      (entry.value === stubValue ? clean : repair).push(entry);
    } else if (unjudged.has(entry.rel)) {
      unjudgedList.push(entry);
    } else {
      translated.push(entry);
    }
  }
  if (repair.length + clean.length === 0) {
    throw new CannotMeasure('no STUB verdict path matched any stamped file — the verdict path column changed, not the corpus');
  }

  console.log(`stub value (from scaffolder): "${stubValue}"`);
  console.log(`files with a translator field: ${stamped.length}`);
  console.log(`  STUB verdict, needing repair: ${repair.length}`);
  console.log(`  STUB verdict, already correct: ${clean.length}`);
  console.log(`  UNJUDGED (fence mask untrustworthy, left alone): ${unjudgedList.length}`);
  console.log(`  translated bodies (left alone, attribution is a human call): ${translated.length}`);

  if (args.has('--verify')) {
    if (repair.length === 0) {
      console.log('OK: no STUB-verdict file asserts a translation or review');
      return 0;
    }
    console.log('\nVIOLATIONS — STUB-verdict files carrying a non-stub attribution:');
    for (const e of repair) console.log(`  ${e.rel}  (${e.raw})`);
    return 1;
  }

  console.log('\nrepair set by current value:');
  console.log(byValue(repair) || '  (none)');
  console.log('\nUNJUDGED by current value (NOT touched):');
  console.log(byValue(unjudgedList) || '  (none)');
  console.log('\ntranslated-but-stamped, by current value (NOT touched):');
  console.log(byValue(translated.filter((e) => e.value !== stubValue)) || '  (none)');

  if (!args.has('--write')) {
    console.log('\npreview only — pass --write to rewrite the repair set');
    console.log('\nrepair set:');
    for (const e of repair) console.log(`  ${e.rel}`);
    return 0;
  }

  let written = 0;
  for (const e of repair) {
    e.lines[e.lineIndex] = `${e.indent}translator: "${stubValue}"`;
    writeFileSync(join(ROOT, e.rel), (e.bom ? BOM : '') + e.lines.join(e.eol));
    written += 1;
  }
  console.log(`\nwrote ${written} file(s); run --verify to confirm`);
  return 0;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (error) {
    if (error instanceof CannotMeasure) {
      console.error(`translator-stamp: ${error.message}`);
      process.exitCode = 2;
    } else {
      throw error;
    }
  }
}
