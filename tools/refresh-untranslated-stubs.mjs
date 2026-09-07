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
 * body is real content, and a refresh that trusted a list would destroy it silently. The
 * refusal names the file and the value and leaves the file untouched; the other mirrors are
 * still refreshed, because a refusal is information, not an abort. It is exit 1 when the caller
 * named that locale with `--locale`; without `--locale` the run covers every locale directory,
 * where the six compressed locales are never stubs, so a refusal there is reported and counted
 * but does not redden a run that did what it could.
 *
 * ## Whole frontmatter, not per-field
 *
 * For a stub, "English's value for field X" is the wrong unit; "English's frontmatter, plus
 * the six" is right and cannot drift field by field. So the rewrite takes English's frontmatter
 * wholesale and re-inserts the six translation fields with the values the stub already carries,
 * verbatim, at the position the scaffolder uses (inside `metadata:` for skills, top level for
 * agents, teams and guides). A field the stub lacks stays absent — an absent
 * `fence_basis_commit` means "unverified", and this tool has no basis to claim otherwise until
 * `--stamp` runs. `translation_date` is untouched: it records when the stub was made.
 *
 * ## Why the stamp is a separate invocation
 *
 * `fence_basis_commit` must name the commit that CARRIES the propagated bytes, and that commit
 * does not exist until the refresh is committed. So: refresh, commit, then `--stamp <sha>`,
 * commit again. `--stamp` refuses an unknown commit (exit 2) and a stub whose body no longer
 * matches English (exit 1) — stamping a divergent stub would write a false claim into the
 * corpus. It writes the sha QUOTED: a short sha with no hex letters parses as a YAML integer,
 * which happened four times in #793 before anyone noticed.
 *
 * Exit codes: 0 done or clean; 1 a `--locale`-named mirror was refused, `--verify` found a
 * divergent stub, or `--stamp` met one; 2 the tool could not run (bad arguments, no English
 * source, no mirror in any locale, unknown sha). Zero mirrors is exit 2 and not a clean 0: a
 * mistyped id must not look like a finished job.
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

class CannotRun extends Error {}

/** `{ fm, body }` where `fm` is the text between the delimiters and `body` everything after the closing one; null without frontmatter. */
export function splitFrontmatter(text) {
  const m = FRONTMATTER.exec(text);
  if (!m) return null;
  return { fm: m[1], body: text.slice(m[0].length) };
}

/** The raw right-hand side of `key:` in a frontmatter block, quotes and all; null when absent. */
export function readRaw(fm, key) {
  const m = new RegExp(`^[ \\t]*${key}:[ \\t]*(.*)$`, 'm').exec(fm);
  return m ? m[1].trim() : null;
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
 * The text a stub of `english` should have: English's frontmatter with `carried` (raw
 * `field → value` pairs) inserted before the closing delimiter, then English's body byte for
 * byte. Skills nest the fields under `metadata:` with a two-space indent, exactly as the
 * scaffolder does; the other trees carry them at top level.
 */
export function buildStub(english, carried, type) {
  const split = splitFrontmatter(english);
  if (!split) throw new CannotRun('English source has no frontmatter');
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
  return n;
}

/**
 * Classify one mirror against English. Reads the mirror NOW — this is the read the refusal
 * rests on, and it happens once per mirror, immediately before any write.
 *
 * @returns {{status: 'missing'} | {status: 'refused', reason: string} | {status: 'stub', text: string, expected: string, diffLine: number}}
 */
export function inspectMirror({ mirror, english, type, stubValue }) {
  if (!existsSync(mirror)) return { status: 'missing' };
  const text = readFileSync(mirror, 'utf8');
  const split = splitFrontmatter(text);
  if (!split) return { status: 'refused', reason: 'no frontmatter, so no translator field to read' };
  const rawTranslator = readRaw(split.fm, 'translator');
  if (rawTranslator === null) return { status: 'refused', reason: 'translator field absent' };
  if (unquote(rawTranslator) !== stubValue) return { status: 'refused', reason: `translator is ${rawTranslator}` };
  const carried = {};
  for (const key of TRANSLATION_FIELDS) {
    const raw = readRaw(split.fm, key);
    if (raw !== null) carried[key] = raw;
  }
  const expected = buildStub(english, carried, type);
  return { status: 'stub', text, expected, diffLine: firstDifference(text, expected) };
}

function commitExists(root, sha) {
  try {
    execFileSync('git', ['-C', root, 'rev-parse', '--verify', '--quiet', `${sha}^{commit}`], { stdio: ['ignore', 'pipe', 'ignore'] });
    return true;
  } catch {
    return false;
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
  if (!splitFrontmatter(englishText)) throw new CannotRun(`English source has no frontmatter: ${english}`);
  if (opts.stamp !== null && !commitExists(root, opts.stamp)) throw new CannotRun(`--stamp ${opts.stamp}: no such commit in ${root}`);

  // The stub literal is a property of THIS repository's scaffolder, wherever --root points.
  const stubValue = stubValueFromScaffolder(join(REPO_ROOT, 'scripts', 'translate-content.sh'));

  const locales = localeDirs(root).filter((l) => opts.locale === null || l === opts.locale);
  if (opts.locale !== null && locales.length === 0) throw new CannotRun(`no locale directory i18n/${opts.locale} under ${root}`);

  let present = 0;
  let refused = 0;
  let diverged = 0;
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
    if (mode === 'verify') {
      if (seen.diffLine === 0) console.log(`${locale}: clean`);
      else { diverged += 1; console.log(`${locale}: DIVERGED from English-plus-the-six at line ${seen.diffLine} (${rel})`); }
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
      if (next === null) throw new CannotRun(`${rel}: no ${SOURCE_COMMIT_FIELD} line to anchor the stamp on`);
      if (next !== seen.text) { writeFileSync(mirror, next, 'utf8'); written += 1; console.log(`${locale}: stamped ${quoted}`); }
      else console.log(`${locale}: already stamped ${quoted}`);
      continue;
    }
    // refresh
    if (seen.diffLine === 0) { console.log(`${locale}: unchanged`); continue; }
    writeFileSync(mirror, seen.expected, 'utf8');
    written += 1;
    console.log(`${locale}: refreshed (first difference was at line ${seen.diffLine})`);
  }

  if (present === 0) throw new CannotRun(`no mirror of ${type}/${id} in any locale under ${root}/i18n`);
  const summary = [`${present} mirror(s)`, `${written} written`, `${refused} refused`];
  if (mode !== 'refresh') summary.push(`${diverged} diverged`);
  console.log(`${mode}: ${summary.join(', ')}`);
  if (mode === 'refresh' && written > 0) console.log('next: commit, then --stamp <that commit> and commit again');
  // A refusal is exit 1 only when the caller named the locale: without --locale the run covers
  // every locale directory, and the six compressed locales (caveman, wenyan) are never stubs, so
  // an unconditional 1 would fire on every ordinary run and be learned as noise. Divergence
  // under --verify or --stamp is always 1.
  const refusedWhereAsked = opts.locale !== null && refused > 0;
  return refusedWhereAsked || diverged > 0 ? 1 : 0;
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
