#!/usr/bin/env node
/**
 * generate-translation-status.js
 *
 * Auto-generates per-locale translation_status.yml files by counting
 * translated files and checking freshness against English sources.
 *
 * Usage:
 *   node scripts/generate-translation-status.js
 *   node scripts/generate-translation-status.js --verdicts   # list every stub with its
 *                                                            # reason and line counts, plus
 *                                                            # any orphaned mirror
 *   node scripts/generate-translation-status.js --margins     # per locale, the genuine
 *                                                            # translations that came
 *                                                            # closest to a stub verdict
 *
 * `--verdicts` and `--margins` are INSPECTION modes and do not write. Add `--write` to
 * regenerate the status files in the same run. Unknown arguments exit 2.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'fs';
import { resolve, dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';
import { assertNotShallow, createFreshnessChecker } from './lib/git-freshness.js';
import {
  buildEnglishProseHistory, classifyTranslation, translationKey, UNJUDGED_REASONS,
} from './lib/translation-status.js';
import { TREES } from './lib/fences.js';
import { SOURCE_COMMIT_FIELD, readFrontmatterField } from './lib/provenance.js';
import { parseArgs, usageExit } from './lib/parse-args.js';

// Validated against an accept-list, not sniffed with `includes`. `--verdict`, `--verdicts=1`
// and `-verdicts` all used to parse as "flag absent": the scan ran, ten files were written,
// no verdict list printed, exit 0 — and the reader concluded there were no stubs to review
// before starting a bulk delete.
//
// The parser is shared now (#619). The hand-rolled version here excused `--root`'s value BY
// POSITION and took only the space-separated form, so `--root=/tmp/x` was reported as
// `unknown argument(s): --root=/tmp/x` — naming `--root` as known on the very line that
// rejected it. The shared one accepts both spellings, which is what a caller typing the
// ordinary GNU idiom deserves.
const ARG_SPEC = { bool: ['--verdicts', '--margins', '--write'], value: ['--root'] };
const ARGS = parseArgs(process.argv.slice(2), ARG_SPEC, usageExit(ARG_SPEC));

// A stub verdict is acted on by deleting and re-scaffolding the file (#478), so a wrong one
// destroys work. The aggregate counts cannot be reviewed; this prints the per-file list that
// can, with the real path of each file. Use it before any bulk remediation.
const SHOW_VERDICTS = ARGS.verdicts;

// The detector's safety case is a MARGIN — how many novel lines the closest genuine
// translation carries above the scaffold verdict. That was measured once and written into a
// comment, where it rots. This re-measures it on demand, and doubles as the drift alarm the
// comment's "re-measure before lowering the floor" instruction otherwise lacks.
const SHOW_MARGINS = ARGS.margins;
const MARGIN_COUNT = 5;

// The inspection flags do NOT write. The header tells a maintainer to run `--verdicts`
// before a destructive batch; if that command also rewrites ten tracked YAML files — each
// stamped `last_updated: <today>`, so it dirties the tree even when no count moved — then
// the prescribed safety step defeats `npm run guard:verify` and produces a diff out of
// nothing. This repo has already paid for that shape once: `normalize:i18n-fences` previews
// by default because a read-only probe agent typed the bare command and rewrote 281 files
// (#486). `--write` forces a regeneration alongside an inspection run.
const WRITE_STATUS = ARGS.write || (!SHOW_VERDICTS && !SHOW_MARGINS);

const __dirname = dirname(fileURLToPath(import.meta.url));

// `--root` exists so the #603 date behaviour can be TESTED rather than demonstrated. Without
// it this script can only ever run against the repo it sits in, which means the only way to
// exercise "does the date hold when the counts hold" is to mutate the real corpus and put it
// back — a demo, not coverage, and one that dirties ten tracked files while it runs.
// `check-i18n-fence-parity.js` already carries the same flag for the same reason.
// The missing-value guard that used to sit here is now `parseArgs`' job, and it covers a case
// the hand-rolled one did not: `--root=` with an empty value.
const ROOT = ARGS.root !== null ? resolve(ARGS.root) : resolve(__dirname, '..');
const I18N_DIR = resolve(ROOT, 'i18n');

// Load config
const configPath = resolve(I18N_DIR, '_config.yml');
if (!existsSync(configPath)) {
  console.error('ERROR: i18n/_config.yml not found');
  process.exit(1);
}
const config = yaml.load(readFileSync(configPath, 'utf8'));

// Staleness needs full history — see the shared guard for rationale (#279).
assertNotShallow(ROOT);

// Derive source counts from registries (single source of truth)
const skillsRegistry = yaml.load(readFileSync(resolve(ROOT, 'skills/_registry.yml'), 'utf8'));
const agentsRegistry = yaml.load(readFileSync(resolve(ROOT, 'agents/_registry.yml'), 'utf8'));
const teamsRegistryPath = resolve(ROOT, 'teams/_registry.yml');
const teamsRegistry = existsSync(teamsRegistryPath)
  ? yaml.load(readFileSync(teamsRegistryPath, 'utf8'))
  : { total_teams: 0 };
const guidesRegistryPath = resolve(ROOT, 'guides/_registry.yml');
const guidesRegistry = existsSync(guidesRegistryPath)
  ? yaml.load(readFileSync(guidesRegistryPath, 'utf8'))
  : { total_guides: 0 };

const sourceCounts = {
  skills: skillsRegistry.total_skills,
  agents: agentsRegistry.total_agents,
  teams: teamsRegistry.total_teams || 0,
  guides: guidesRegistry.total_guides || 0,
  total: skillsRegistry.total_skills + agentsRegistry.total_agents
    + (teamsRegistry.total_teams || 0) + (guidesRegistry.total_guides || 0)
};

/**
 * Extract source_commit from translation frontmatter.
 *
 * Routes through the shared reader (#552). The regex this replaces was
 * `/source_commit:\s*["']?([a-f0-9]+)["']?/m` — with no `^` anchor and no frontmatter bound, so
 * it matched the first `source_commit:` ANYWHERE in the file, including inside a ```yaml fence
 * demonstrating what translation frontmatter looks like. Two other copies of this reader
 * existed and all three disagreed; there is now one, and it is anchored to the frontmatter
 * block. Measured across the corpus at the swap: 2,571 stale before and after, so no file's
 * verdict turned on the difference today.
 */
function extractSourceCommit(filePath) {
  return readFrontmatterField(readFileSync(filePath, 'utf8'), SOURCE_COMMIT_FIELD);
}

// Stub detection lives in ./lib/translation-status.js. It used to be body equality against
// the English source on disk, which stopped being true the moment English was next edited
// (#473) and was defeated outright by an interior `\r` (#532). See that module's header for
// why comparing against the `source_commit` blob does not fix it either.
//
// Built once and reused across all ten locales: two git processes for the whole corpus.
const englishProse = buildEnglishProseHistory(ROOT);

// Batched staleness (#305): one `git log <source_commit>..HEAD` per DISTINCT
// source_commit instead of per-file `git log -1` + `merge-base` spawns.
const freshness = createFreshnessChecker(ROOT);
const toRelPath = (absPath) => absPath.slice(ROOT.length + 1);

/**
 * Resolve English source path.
 */
function resolveSourcePath(contentType, itemPath) {
  if (contentType === 'skills') {
    const skillName = basename(dirname(itemPath));
    return resolve(ROOT, 'skills', skillName, 'SKILL.md');
  } else {
    const fileName = basename(itemPath);
    return resolve(ROOT, contentType, fileName);
  }
}

/**
 * Count translations and stale files for a locale + content type.
 */
function countTranslations(locale, contentType) {
  const typeDir = resolve(I18N_DIR, locale, contentType);
  let translated = 0;
  let stale = 0;
  let stubs = 0;
  let unjudged = 0;
  // Every non-stub verdict's novel-line count, so `--margins` can report how close the
  // closest genuine translation came to the scaffold verdict. The module header's safety
  // case rests on that margin being 2 lines on the compressed tiers; an instruction to
  // "re-measure before lowering the floor" needs something to re-measure with.
  const margins = [];

  if (!existsSync(typeDir)) {
    return { translated, stale, stubs, unjudged, margins };
  }

  const entries = readdirSync(typeDir);
  for (const entry of entries) {
    const entryPath = resolve(typeDir, entry);

    let translatedFile;
    let itemId;
    if (contentType === 'skills') {
      if (!statSync(entryPath).isDirectory()) continue;
      translatedFile = resolve(entryPath, 'SKILL.md');
      if (!existsSync(translatedFile)) continue;
      itemId = entry;
    } else {
      if (!entry.endsWith('.md')) continue;
      translatedFile = entryPath;
      itemId = basename(entry, '.md');
    }

    // Keyed through `translationKey`, which defers to `contentKey`, so this cannot drift
    // from the pool's own idea of what an id is. The null branch below is NOT covered by a
    // test: it fires only for a `_`-prefixed or README mirror, and no such file exists in
    // `i18n/` — adding one to the corpus purely as a fixture would be worse than the gap.
    // The derivation itself is covered in `translation-status.test.js`.
    const key = translationKey(contentType, itemId);
    if (key === null) continue;

    const verdict = classifyTranslation({
      translatedText: readFileSync(translatedFile, 'utf8'),
      locale,
      english: englishProse.get(key),
    });
    // `novel` is null when the comparison did not run. Printing `-` rather than `0` keeps
    // the distinction visible in the one list a maintainer reads before deleting files.
    const measured = verdict.novel === null ? '-' : String(verdict.novel);

    // The real, `rm`-able path — not `<locale>/<tree>/<id>`, which is not a path at all: it
    // lacks the `i18n/` prefix and the suffix, and the suffix RULE DIFFERS BY TREE
    // (`/SKILL.md` for skills, `.md` elsewhere). Someone scripting a remediation from the
    // key gets a working delete for skills and a silent no-op for agents, teams and guides,
    // and the batch half-applies with no error.
    const shownPath = toRelPath(translatedFile);

    if (verdict.stub) {
      stubs++;
      if (SHOW_VERDICTS) {
        console.log(`  STUB      ${shownPath}  (${verdict.reason}, ${measured}/${verdict.total} novel)`);
      }
      continue;
    }

    // Its own bucket, counted as neither translated nor stub. Both alternatives are wrong in
    // a way that matters: counting it TRANSLATED is the coverage inflation #561 reports, and
    // counting it a STUB routes a possibly fully-translated file into a remedy that deletes
    // it. The file's fence structure matches no revision its English source ever had, so the
    // frozen-region mask is untrustworthy and every measurement taken through it is void —
    // the honest report is that this file was not judged.
    if (UNJUDGED_REASONS.has(verdict.reason)) {
      unjudged++;
      if (SHOW_VERDICTS) {
        console.log(`  UNJUDGED  ${shownPath}  (${verdict.reason}/${verdict.cause} — mask untrustworthy; not counted as translated)`);
      }
      continue;
    }

    // Surfaced because it is a lenient hole with no counter of its own: a mirror whose id
    // matches no English content in history OR the working tree is counted as translated,
    // and it most likely indicates an orphaned or misspelt directory, which is actionable.
    if (verdict.reason === 'no-source' && SHOW_VERDICTS) {
      console.log(`  NO-SOURCE ${shownPath}  (counted as translated — orphaned mirror?)`);
    }
    if (verdict.novel !== null) margins.push({ path: shownPath, novel: verdict.novel });

    translated++;

    // Computed here rather than above the verdict: the stub path discards it.
    const sourcePath = resolveSourcePath(contentType, translatedFile);
    const sourceCommit = extractSourceCommit(translatedFile);
    if (existsSync(sourcePath) && sourceCommit) {
      if (freshness.isStale(sourceCommit, toRelPath(sourcePath))) {
        stale++;
      }
    }
  }

  return { translated, stale, stubs, unjudged, margins };
}

// ── Main ─────────────────────────────────────────────────────────

// `TREES`, not a second literal list: `buildEnglishProseHistory` pools from `TREES`, so a
// fifth tree added there but not here would be pooled and never scanned — coverage for it
// silently absent from the YAML, with no error. Same drift class as #519.
const contentTypes = TREES;
const locales = config.supported_locales.map(l => l.code);
const today = new Date().toISOString().split('T')[0];

/**
 * Read an existing `translation_status.yml`, or null when it is absent or unusable (#603).
 *
 * Returns null rather than throwing on a malformed file: the caller treats null as "stamp
 * today", so a corrupt status file regenerates instead of aborting the run.
 *
 * @param {string} statusPath
 * @returns {{last_updated?: string, coverage?: object}|null}
 */
function readStatus(statusPath) {
  if (!existsSync(statusPath)) return null;
  try {
    const parsed = yaml.load(readFileSync(statusPath, 'utf8'));
    return parsed && typeof parsed === 'object' && parsed.last_updated ? parsed : null;
  } catch {
    return null;
  }
}

for (const locale of locales) {
  const localeDir = resolve(I18N_DIR, locale);
  if (!existsSync(localeDir)) {
    console.log(`SKIP: ${locale} (directory not found)`);
    continue;
  }

  const coverage = {};
  let totalTranslated = 0;
  let totalStale = 0;
  let totalStubs = 0;
  let totalUnjudged = 0;
  const totalSource = sourceCounts.total;

  const localeMargins = [];
  for (const contentType of contentTypes) {
    const startedAt = Date.now();
    const { translated, stale, stubs, unjudged, margins } = countTranslations(locale, contentType);
    const total = sourceCounts[contentType];
    const pct = total > 0 ? Math.round((translated / total) * 1000) / 10 : 0;
    coverage[contentType] = { translated, total, pct, stale, stubs, unjudged };
    totalTranslated += translated;
    totalStale += stale;
    totalStubs += stubs;
    totalUnjudged += unjudged;
    localeMargins.push(...margins);
    console.log(`  scan ${locale}/${contentType}: ${translated} translated, ${stale} stale, ${stubs} stubs, ${unjudged} unjudged (${Date.now() - startedAt}ms)`);
  }

  if (SHOW_MARGINS) {
    const closest = localeMargins.sort((a, b) => a.novel - b.novel).slice(0, MARGIN_COUNT);
    console.log(`  margin ${locale}: closest genuine translations to the scaffold verdict — `
      + (closest.length
        ? closest.map((m) => `${m.path}=${m.novel}`).join('  ')
        : 'none (no judged translations)'));
  }

  const totalPct = totalSource > 0
    ? Math.round((totalTranslated / totalSource) * 1000) / 10
    : 0;
  coverage.total = {
    translated: totalTranslated,
    total: totalSource,
    pct: totalPct,
    stale: totalStale,
    stubs: totalStubs,
    unjudged: totalUnjudged,
  };

  const statusPath = resolve(localeDir, 'translation_status.yml');

  // #603: `last_updated` used to stamp the RUN date, so every regeneration dirtied all ten
  // tracked status files whether or not a single count had moved — 33 of the 61 commits
  // touching `i18n/de/translation_status.yml` changed nothing but this line. That is not merely
  // noise: it makes the field mean "when the job last ran", which is not what any reader
  // assumes it means, and it defeats `guard:verify` by producing a diff out of nothing.
  //
  // Now the date moves only when the COUNTS move. Comparing the coverage payload rather than
  // the rendered YAML keeps the decision independent of dumper formatting; a file that is
  // missing, unparseable, or shaped differently falls through to today's date, which is the
  // safe direction — a spurious bump is recoverable, a frozen date is a lie.
  //
  // Two residuals, stated so neither is reported as a regression later. The field now means
  // "when this payload last changed", which is not quite "when translations were last touched":
  // (a) `pct` derives from the registry totals, so adding one English skill moves the
  // denominator and bumps the date in all ten locales without any translation activity; and
  // (b) compensating flips in one run — one file stub→translated while another goes the other
  // way — leave every count equal and the date still. Both are inherent to comparing counts
  // rather than tracking events, and both are preferable to stamping the run date.
  const previous = readStatus(statusPath);
  const unchanged = previous !== null
    && JSON.stringify(previous.coverage) === JSON.stringify(coverage);
  const status = {
    locale,
    last_updated: unchanged ? previous.last_updated : today,
    coverage,
  };

  if (WRITE_STATUS) {
    const rendered = yaml.dump(status, { flowLevel: 3 });
    // Skip the write when the bytes would not change, so a no-op regeneration leaves the
    // mtime alone too. `existsSync` guards the first generation of a new locale.
    if (existsSync(statusPath) && readFileSync(statusPath, 'utf8') === rendered) {
      console.log(`UNCHANGED: ${statusPath.replace(ROOT + '/', '')}`);
    } else {
      writeFileSync(statusPath, rendered);
      console.log(`GENERATED: ${statusPath.replace(ROOT + '/', '')}`);
    }
  } else {
    console.log(`INSPECTED: ${statusPath.replace(ROOT + '/', '')} (not written — pass --write to regenerate)`);
  }
  console.log(`  Coverage: ${totalTranslated}/${totalSource} (${totalPct}%), ${totalStale} stale, ${totalStubs} stubs, ${totalUnjudged} unjudged`);
  if (totalUnjudged > 0 && !SHOW_VERDICTS) {
    console.log(`  ${totalUnjudged} unjudged — the frozen-region mask is untrustworthy (shape, swallowed opener, or hidden known prose), so these were not measured at all. Re-run with --verdicts to list them.`);
  }
  // Standing hint, not a footnote in a docstring. A stub verdict is remediated by deleting
  // the file, the detector's errors point strict, and `--verdicts` was discoverable only by
  // reading the source — which makes the containment documentation rather than a control.
  if (totalStubs > 0 && !SHOW_VERDICTS) {
    console.log(`  ${totalStubs} stubs — re-run with --verdicts and read the per-file list before any re-scaffold.`);
  }
}
