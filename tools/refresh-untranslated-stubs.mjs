#!/usr/bin/env node
/**
 * refresh-untranslated-stubs.mjs — bring an untranslated stub back to a byte copy of English (#789).
 *
 * A stub is a mirror the scaffolder made: English's frontmatter plus six translation fields,
 * English's body, `translator: "(untranslated stub)"`. Editing a frozen fence in English then
 * requires propagating the new bytes to every mirror in the same commit, and for a stub that
 * propagation is purely mechanical — the whole file should again be "English, plus the six".
 * Nothing did that: `translate:scaffold` SKIPs an existing target (correctly — it must never
 * overwrite a human translation) and `normalize-i18n-fences.js` has no `--id` scope and restores
 * from `source_commit`, which for a stub just edited in English is the revision BEFORE the
 * edit. PR #788 carried a scratchpad script through four fence commits; #793 needed it five
 * times more, plus a second script for the frontmatter, after line-patching a stub produced two
 * defects in one commit (a `description` keeping a renamed term, a `fence_basis_commit`
 * substitution matching nothing and exiting 0).
 *
 *   node tools/refresh-untranslated-stubs.mjs <content-type> <id>                  # rewrite every stub mirror of <id>
 *   node tools/refresh-untranslated-stubs.mjs <content-type> <id> --verify         # exit 1 if any stub mirror is not English-plus-the-six
 *   node tools/refresh-untranslated-stubs.mjs <content-type> <id> --stamp <sha>    # after the refresh commit exists: record it
 *   ... [--locale <l>] [--root <dir>]
 *
 * ## The one property that must survive any rewrite
 *
 * The tool reads `translator:` from the mirror file AT THE MOMENT IT DECIDES TO WRITE — never
 * from a manifest, a caller's list, or an earlier scan — and refuses any value other than the
 * exact literal the scaffolder stamps (read from `scripts/translate-content.sh` through
 * `translator-stamp.mjs`, so the literal lives in one place). The risk is not today's copy but
 * tomorrow's re-run: once a stub is hand-translated its `translator` names a person and its
 * body is real content, and a refresh that trusted a list would destroy it silently. A
 * frontmatter carrying `translator:` — or any of the six translation fields — more than once is
 * refused too, naming the field and the count, rather than judged on whichever line comes
 * first. The refusal names the file and the value and leaves the file untouched; the other
 * mirrors are still refreshed, because a refusal is information, not an abort. It is exit 1
 * when the caller named that locale with `--locale`; without `--locale` the run covers every
 * locale directory, and a mirror that IS a translation is refused by design in any of them, so
 * an unconditional 1 would fire on ordinary runs and be learned as noise. (The compressed
 * locales are not exempt from either side of this: measured 2026-09-07, each of the six
 * carries five files with the stub literal, and the tool treats them like any other locale.)
 * An unscoped run in which EVERY present mirror was refused examined no stub, and exits 2
 * rather than reporting a job done; under `--locale` the refusal is already the exit 1.
 *
 * ## Whole frontmatter, not per-field
 *
 * For a stub, "English's value for field X" is the wrong unit; "English's frontmatter, plus
 * the six" is right and cannot drift field by field. So the rewrite takes English's frontmatter
 * wholesale and re-inserts the six translation fields with the values the stub already carries,
 * verbatim, at the position the scaffolder uses (inside `metadata:` for skills, top level for
 * agents, teams and guides). That position is only inside `metadata:` while `metadata:` is the
 * LAST top-level key — which every skill in the corpus satisfies today (measured 2026-09-07) —
 * so a skill whose English frontmatter carries a top-level key after `metadata:` is refused
 * (exit 2) rather than rewritten into YAML that nests the six under a scalar. A field the stub
 * lacks stays absent. `translation_date` is carried untouched: it records when the stub was made.
 *
 * `fence_basis_commit` is the one field a refresh does NOT carry when it changes the file: it
 * claims "these frozen fences were verified against that revision", and the bytes just written
 * are the working tree's, which no commit carries yet. Carrying it forward would leave a false
 * claim that reads as verified (`scripts/lib/provenance.js` states the rule). A stub the refresh
 * leaves unchanged keeps it; `--stamp` writes it back.
 *
 * ## Why the stamp is a separate invocation, and why it moves `source_commit`
 *
 * `fence_basis_commit` must name the commit that CARRIES the propagated bytes, and that commit
 * does not exist until the refresh is committed. So: refresh, commit, then `--stamp <sha>`,
 * commit again. `--stamp` records the sha in `source_commit` and `fence_basis_commit` of every
 * stub whose bytes match English at that moment — refreshed by this run or already clean — and
 * refuses a stub whose body no longer matches (exit 1) or that has no `source_commit` line to
 * anchor on (reported per mirror, exit 1), an unknown or ambiguous sha (exit 2), and a sha at
 * which English is not byte-identical to the working tree's (exit 2) — the commit before the
 * refresh exists too, and stamping it would claim a basis the bytes do not have. It writes
 * the sha QUOTED: a short sha with no hex letters parses as a YAML integer, which happened four
 * times in #793. `provenance.js` says tools must not move `source_commit`, because bumping it
 * asserts a translation event that never happened; a stub is the documented exception — its
 * `translator` says no translation happened, so the field can only ever mean "the English this
 * copy is a copy of", and that is exactly what the stamp records.
 *
 * Exit codes: 0 done or clean; 1 a `--locale`-named mirror was refused, `--verify` found a
 * divergent stub, or `--stamp` met one it could not stamp; 2 the tool could not run (bad
 * arguments, no English source, an English source with CRLF or a byte-order mark, English
 * frontmatter it cannot nest the six into, no mirror in scope, no stub among the mirrors,
 * unknown sha, the stub literal unreadable). Zero mirrors is exit 2, and
 * so is zero stubs without `--locale` (with `--locale` the refusal is already the exit 1): a
 * mistyped id, or a fully translated one, must not look like a finished job.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { localeDirs } from '../scripts/lib/i18n-targets.js';
import { FENCE_BASIS_FIELD, SOURCE_COMMIT_FIELD, stampFrontmatterField } from '../scripts/lib/provenance.js';
import { parseArgs, usageExit } from '../scripts/lib/parse-args.js';
import { stubValueFromScaffolder } from './translator-stamp.mjs';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** The six fields a translation carries that English does not, in the scaffolder's order. */
export const TRANSLATION_FIELDS = ['locale', 'source_locale', SOURCE_COMMIT_FIELD, FENCE_BASIS_FIELD, 'translator', 'translation_date'];

export const CONTENT_TYPES = ['skills', 'agents', 'teams', 'guides'];

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n/;
const BOM = String.fromCharCode(0xfeff);

class CannotRun extends Error {}

/** `{ fm, body }` where `fm` is the text between the delimiters and `body` everything after the closing one; null without frontmatter. */
export function splitFrontmatter(text) {
  const m = FRONTMATTER.exec(text);
  if (!m) return null;
  return { fm: m[1], body: text.slice(m[0].length) };
}

/** Every line of a frontmatter block that starts `key:` (any indent), raw right-hand sides. */
export function readAll(fm, key) {
  const re = new RegExp(`^[ \\t]*${key}:[ \\t]*(.*)$`, 'gm');
  return [...fm.matchAll(re)].map((m) => m[1].trim());
}

/** The value with one layer of surrounding quotes removed — what a YAML reader would see. */
export function unquote(raw) {
  return raw === null ? null : raw.replace(/^(["'])(.*)\1$/, '$2');
}

export function englishPath(root, type, id) {
  return type === 'skills' ? join(root, 'skills', id, 'SKILL.md') : join(root, type, `${id}.md`);
}

export function mirrorPath(root, locale, type, id) {
  return type === 'skills' ? join(root, 'i18n', locale, 'skills', id, 'SKILL.md') : join(root, 'i18n', locale, type, `${id}.md`);
}

/**
 * Where the scaffolder puts the six, and whether it can: skills nest them under `metadata:`,
 * which is only well-formed while `metadata:` is the last top-level key of English's block.
 */
export function assertNestable(fm, type) {
  if (type !== 'skills') return;
  const lines = fm.split('\n');
  const at = lines.findIndex((l) => /^metadata:/.test(l));
  if (at < 0) throw new CannotRun('English frontmatter has no `metadata:` block, so the six translation fields have nowhere to nest');
  // Any line starting at column 0 with a key — bare, quoted or dotted — not a comment.
  const late = lines.slice(at + 1).find((l) => /^[^\s#][^:]*:/.test(l));
  if (late) throw new CannotRun(`English frontmatter has a top-level key after \`metadata:\` (${late.split(':')[0]}), so the six cannot be nested there without breaking the YAML — move \`metadata:\` last`);
}

/**
 * The text a stub of `english` should have: English's frontmatter with `carried` (raw
 * `field → value` pairs) inserted before the closing delimiter, then English's body byte for
 * byte. Skills nest the fields under `metadata:` with a two-space indent, exactly as the
 * scaffolder does; the other trees carry them at top level.
 */
export function buildStub(english, carried, type) {
  const split = splitFrontmatter(english);
  if (!split) throw new CannotRun('English source has no frontmatter');
  assertNestable(split.fm, type);
  const indent = type === 'skills' ? '  ' : '';
  const block = TRANSLATION_FIELDS.filter((k) => k in carried).map((k) => `${indent}${k}: ${carried[k]}`).join('\n');
  const fm = block ? `${split.fm}\n${block}` : split.fm;
  return `---\n${fm}\n---\n${split.body}`;
}

/** First line number at which two texts differ (1-based), or 0 when equal. */
export function firstDifference(a, b) {
  if (a === b) return 0;
  const la = a.split('\n');
  const lb = b.split('\n');
  const n = Math.max(la.length, lb.length);
  for (let i = 0; i < n; i++) if (la[i] !== lb[i]) return i + 1;
  // Unreachable: two unequal strings differ at some line index.
}

/**
 * Classify one mirror against English. Reads the mirror NOW — this is the read the refusal
 * rests on, and it happens once per mirror, immediately before any write.
 *
 * @returns {{status: 'missing'}
 *   | {status: 'refused', reason: string}
 *   | {status: 'stub', text: string, carried: Record<string,string>, expected: string, diffLine: number}}
 */
export function inspectMirror({ mirror, english, type, stubValue }) {
  if (!existsSync(mirror)) return { status: 'missing' };
  const text = readFileSync(mirror, 'utf8');
  if (text.startsWith(BOM)) return { status: 'refused', reason: 'file starts with a byte-order mark; strip it first' };
  if (text.includes('\r\n')) return { status: 'refused', reason: 'CRLF line endings; the line-endings gate refuses these too — normalise first' };
  const split = splitFrontmatter(text);
  if (!split) return { status: 'refused', reason: 'no frontmatter, so no translator field to read' };
  const translators = readAll(split.fm, 'translator');
  if (translators.length === 0) return { status: 'refused', reason: 'translator field absent' };
  if (translators.length > 1) return { status: 'refused', reason: `translator appears ${translators.length} times; a stub carries it once` };
  if (unquote(translators[0]) !== stubValue) return { status: 'refused', reason: `translator is ${translators[0]}` };
  const carried = {};
  for (const key of TRANSLATION_FIELDS) {
    const all = readAll(split.fm, key);
    if (all.length > 1) return { status: 'refused', reason: `${key} appears ${all.length} times; a stub carries it once` };
    if (all.length === 1) carried[key] = all[0];
  }
  const expected = buildStub(english, carried, type);
  return { status: 'stub', text, carried, expected, diffLine: firstDifference(text, expected) };
}

function commitExists(root, sha) {
  try {
    execFileSync('git', ['-C', root, 'rev-parse', '--verify', '--quiet', `${sha}^{commit}`], { stdio: ['ignore', 'pipe', 'ignore'] });
    return true;
  } catch {
    return false;
  }
}

/** The English file's bytes at `sha` (a root-relative path), or null when the commit does not carry it. */
function englishAtCommit(root, sha, rel) {
  try {
    return execFileSync('git', ['-C', root, 'show', `${sha}:${rel}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

export function main(argv) {
  const spec = { bool: ['--verify', '--help'], value: ['--stamp', '--locale', '--root'] };
  // Split positionals from flags before the default-deny parser sees them; a value flag in the
  // space form owns the token after it.
  const positional = [];
  const flags = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) { positional.push(arg); continue; }
    flags.push(arg);
    const name = arg.includes('=') ? arg.slice(0, arg.indexOf('=')) : arg;
    if (spec.value.includes(name) && !arg.includes('=') && i + 1 < argv.length) flags.push(argv[++i]);
  }
  const opts = parseArgs(flags, spec, usageExit({ bool: ['<content-type> <id>', ...spec.bool], value: spec.value }));
  if (opts.help) {
    console.log('usage: refresh-untranslated-stubs.mjs <content-type> <id> [--verify | --stamp <sha>] [--locale <l>] [--root <dir>]');
    return 0;
  }
  if (positional.length !== 2) throw new CannotRun(`expected <content-type> <id>, got ${positional.length} positional argument(s)`);
  const [type, id] = positional;
  if (!CONTENT_TYPES.includes(type)) throw new CannotRun(`unknown content type '${type}' (one of ${CONTENT_TYPES.join(', ')})`);
  if (opts.verify && opts.stamp) throw new CannotRun('--verify and --stamp are separate runs');
  if (opts.stamp !== null && !/^[0-9a-f]{7,40}$/.test(opts.stamp)) throw new CannotRun(`--stamp wants an abbreviated or full commit sha, got '${opts.stamp}'`);

  const root = resolve(opts.root ?? REPO_ROOT);
  const english = englishPath(root, type, id);
  if (!existsSync(english)) throw new CannotRun(`no English source at ${english}`);
  const englishText = readFileSync(english, 'utf8');
  if (englishText.startsWith(BOM)) throw new CannotRun(`English source starts with a byte-order mark; strip it first: ${english}`);
  if (englishText.includes('\r\n')) throw new CannotRun(`English source has CRLF line endings; normalise it first: ${english}`);
  const englishSplit = splitFrontmatter(englishText);
  if (!englishSplit) throw new CannotRun(`English source has no frontmatter: ${english}`);
  assertNestable(englishSplit.fm, type);
  if (opts.stamp !== null) {
    if (!commitExists(root, opts.stamp)) throw new CannotRun(`--stamp ${opts.stamp}: no such commit in ${root} (or an ambiguous abbreviation)`);
    // The stamp claims "these bytes are English at <sha>". Existing is not enough: the commit
    // before the refresh exists too, and so does any later one. English at the sha must be
    // byte-identical to the English the stubs were matched against.
    const atSha = englishAtCommit(root, opts.stamp, english.slice(root.length + 1));
    if (atSha === null) throw new CannotRun(`--stamp ${opts.stamp}: that commit does not carry ${english.slice(root.length + 1)}`);
    if (atSha !== englishText) throw new CannotRun(`--stamp ${opts.stamp}: English at that commit differs from the working tree (first difference at line ${firstDifference(atSha, englishText)}); stamp the commit that carries these bytes`);
  }

  // The stub literal is a property of THIS repository's scaffolder, wherever --root points.
  let stubValue;
  try {
    stubValue = stubValueFromScaffolder(join(REPO_ROOT, 'scripts', 'translate-content.sh'));
  } catch (error) {
    throw new CannotRun(`cannot read the stub literal from the scaffolder: ${error.message}`);
  }

  const locales = localeDirs(root).filter((l) => opts.locale === null || l === opts.locale);
  if (opts.locale !== null && locales.length === 0) throw new CannotRun(`no locale directory i18n/${opts.locale} under ${root}`);

  let present = 0;
  let stubs = 0;
  let refused = 0;
  let diverged = 0;
  let unstampable = 0;
  let unverified = 0;
  let written = 0;
  const mode = opts.verify ? 'verify' : opts.stamp !== null ? 'stamp' : 'refresh';

  for (const locale of locales) {
    const mirror = mirrorPath(root, locale, type, id);
    const rel = mirror.slice(root.length + 1);
    const seen = inspectMirror({ mirror, english: englishText, type, stubValue });
    if (seen.status === 'missing') continue;
    present += 1;
    if (seen.status === 'refused') {
      refused += 1;
      console.log(`${locale}: REFUSED — ${seen.reason} (${rel})`);
      continue;
    }
    stubs += 1;
    if (mode === 'verify') {
      if (seen.diffLine !== 0) {
        diverged += 1;
        console.log(`${locale}: DIVERGED from English-plus-the-six at line ${seen.diffLine} (${rel})`);
      } else if (!(FENCE_BASIS_FIELD in seen.carried)) {
        // Absent means unverified (provenance.js): a refresh not yet stamped, or a file that
        // predates the field. Clean bytes, but a claim left blank: say so and count it, without
        // reddening the run — stamping a clean stub writes a true claim, so this is the recipe.
        unverified += 1;
        console.log(`${locale}: clean (no ${FENCE_BASIS_FIELD} — unverified; --stamp <sha> after committing)`);
      } else {
        console.log(`${locale}: clean`);
      }
      continue;
    }
    if (mode === 'stamp') {
      if (seen.diffLine !== 0) {
        diverged += 1;
        console.log(`${locale}: NOT STAMPED — diverges from English at line ${seen.diffLine}; refresh and commit first (${rel})`);
        continue;
      }
      const quoted = `"${opts.stamp}"`;
      let next = stampFrontmatterField(seen.text, SOURCE_COMMIT_FIELD, quoted);
      next = next && stampFrontmatterField(next, FENCE_BASIS_FIELD, quoted);
      if (next === null) {
        unstampable += 1;
        console.log(`${locale}: NOT STAMPED — no ${SOURCE_COMMIT_FIELD} line to anchor the stamp on (${rel})`);
        continue;
      }
      if (next !== seen.text) { writeFileSync(mirror, next, 'utf8'); written += 1; console.log(`${locale}: stamped ${quoted}`); }
      else console.log(`${locale}: already stamped ${quoted}`);
      continue;
    }
    // refresh
    if (seen.diffLine === 0) { console.log(`${locale}: unchanged`); continue; }
    const { [FENCE_BASIS_FIELD]: droppedBasis, ...carried } = seen.carried;
    writeFileSync(mirror, buildStub(englishText, carried, type), 'utf8');
    written += 1;
    console.log(`${locale}: refreshed (first difference was at line ${seen.diffLine}${droppedBasis === undefined ? '' : `; ${FENCE_BASIS_FIELD} dropped until --stamp`})`);
  }

  if (present === 0) {
    throw new CannotRun(`no mirror of ${type}/${id} ${opts.locale === null ? 'in any locale' : `in locale ${opts.locale}`} under ${root}/i18n`);
  }
  // Without --locale, a run that refused every mirror examined no stub: exit 2, not a clean 0.
  // With --locale the caller asked about one mirror and a refusal is already the loud exit 1.
  if (stubs === 0 && opts.locale === null) {
    throw new CannotRun(`every mirror of ${type}/${id} was refused (${refused} of ${present}) — no untranslated stub to ${mode}`);
  }
  const summary = [`${present} mirror(s)`, `${stubs} stub(s)`, `${written} written`, `${refused} refused`];
  if (mode !== 'refresh') summary.push(`${diverged} diverged`);
  if (mode === 'verify') summary.push(`${unverified} without ${FENCE_BASIS_FIELD}`);
  if (mode === 'stamp') summary.push(`${unstampable} unstampable`);
  console.log(`${mode}: ${summary.join(', ')}`);
  if (mode === 'refresh' && written > 0) console.log('next: commit, then --stamp <that commit> and commit again');
  // A refusal is exit 1 only when the caller named the locale: without --locale the run covers
  // every locale directory, and a mirror that is a translation is refused by design wherever it
  // is, so an unconditional 1 would fire on ordinary runs and be learned as noise. Divergence
  // under --verify or --stamp, and an unstampable stub, are always 1.
  const refusedWhereAsked = opts.locale !== null && refused > 0;
  return refusedWhereAsked || diverged > 0 || unstampable > 0 ? 1 : 0;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (error) {
    if (error instanceof CannotRun) {
      console.error(`refresh-untranslated-stubs: ${error.message}`);
      process.exitCode = 2;
    } else {
      throw error;
    }
  }
}
