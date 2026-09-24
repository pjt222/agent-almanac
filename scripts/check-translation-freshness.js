#!/usr/bin/env node
/**
 * check-translation-freshness.js
 *
 * Checks whether translated files are up-to-date with their English source
 * by comparing the source_commit in translation frontmatter against the
 * current git history of the source file.
 *
 * Usage:
 *   node scripts/check-translation-freshness.js          # fail on stale
 *   node scripts/check-translation-freshness.js --warn   # warn only
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { resolve, dirname, basename, join } from 'path';
import { fileURLToPath } from 'url';
import { assertNotShallow, createFreshnessChecker, buildLatestCommitMap } from './lib/git-freshness.js';
import { CONTENT_TYPES } from './lib/content-types.js';
import { SOURCE_COMMIT_FIELD, readFrontmatterField } from './lib/provenance.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const I18N_DIR = resolve(ROOT, 'i18n');
const WARN_ONLY = process.argv.includes('--warn');

/**
 * Extract source_commit from a translated file's frontmatter.
 *
 * The shared reader (#552). The regex this replaces was line-anchored but not
 * FRONTMATTER-anchored, so a `source_commit:` at column 0 inside a ```yaml fence — the shape
 * `i18n/README.md` itself documents — read as this file's own metadata. Measured across the
 * corpus at the swap: 2,571 stale before and after.
 *
 * This is the last of three hand-rolled copies of this reader, each with a different regex and
 * a different bug. That there were three is why `source_commit` could be read one way by the
 * staleness gate and another by the status generator without anything noticing.
 */
function extractSourceCommit(filePath) {
  return readFrontmatterField(readFileSync(filePath, 'utf8'), SOURCE_COMMIT_FIELD);
}

// `extractLocale` used to sit here: a fourth hand-rolled frontmatter reader, not anchored to the
// frontmatter block, and called by nothing — the locale comes from the directory walk below.
// Deleted rather than routed through the shared reader (#552), because an unused reader is a
// waiting inconsistency: the next person to need a locale would have found two of them.

// A shallow clone would make every translation read as fresh (#279/#362).
assertNotShallow(ROOT);

// Batched staleness (#305): one `git log <source_commit>..HEAD` per DISTINCT
// source_commit, plus one streaming pass for the path -> latest-hash map used
// in the STALE message — instead of two git spawns per translated file.
const freshness = createFreshnessChecker(ROOT);
const toRelPath = (absPath) => absPath.slice(ROOT.length + 1);
console.log('Building latest-commit map (one git pass)...');
const latestCommitMap = buildLatestCommitMap(ROOT);

/**
 * Resolve the English source path for a translated file.
 */
function resolveSourcePath(locale, contentType, itemPath) {
  if (contentType === 'skills') {
    const skillName = basename(dirname(itemPath));
    return resolve(ROOT, 'skills', skillName, 'SKILL.md');
  } else {
    const fileName = basename(itemPath);
    return resolve(ROOT, contentType, fileName);
  }
}

// ── Main ─────────────────────────────────────────────────────────

const contentTypes = CONTENT_TYPES;
let staleCount = 0;
let checkedCount = 0;
let orphanCount = 0;
const staleFiles = [];

// Find all locale directories
const locales = readdirSync(I18N_DIR)
  .filter(entry => {
    const fullPath = join(I18N_DIR, entry);
    return statSync(fullPath).isDirectory() && entry !== 'node_modules' && !entry.startsWith('_');
  });

for (const locale of locales) {
  const localeDir = resolve(I18N_DIR, locale);

  for (const contentType of contentTypes) {
    const typeDir = resolve(localeDir, contentType);
    if (!existsSync(typeDir)) continue;

    const entries = readdirSync(typeDir);
    for (const entry of entries) {
      const entryPath = resolve(typeDir, entry);

      let translatedFile;
      if (contentType === 'skills') {
        // skills/<name>/SKILL.md
        if (!statSync(entryPath).isDirectory()) continue;
        translatedFile = resolve(entryPath, 'SKILL.md');
        if (!existsSync(translatedFile)) continue;
      } else {
        // agents/teams/guides: <name>.md
        if (!entry.endsWith('.md')) continue;
        translatedFile = entryPath;
      }

      checkedCount++;
      if (checkedCount % 500 === 0) {
        console.log(`  ...checked ${checkedCount} files (${freshness.distinctCommits()} distinct source commits resolved)`);
      }
      const sourceCommit = extractSourceCommit(translatedFile);
      const sourcePath = resolveSourcePath(locale, contentType, translatedFile);

      if (!existsSync(sourcePath)) {
        orphanCount++;
        console.log(`ORPHAN: ${translatedFile} (source not found: ${sourcePath})`);
        continue;
      }

      if (!sourceCommit) {
        console.log(`WARN: ${translatedFile} missing source_commit`);
        continue;
      }

      if (freshness.isStale(sourceCommit, toRelPath(sourcePath))) {
        const latestCommit = latestCommitMap.get(toRelPath(sourcePath)) || 'unknown';
        staleCount++;
        staleFiles.push({
          file: translatedFile.replace(ROOT + '/', ''),
          sourceCommit,
          latestCommit,
          locale,
          contentType,
        });
        console.log(
          `STALE: ${translatedFile.replace(ROOT + '/', '')} ` +
          `(translated at ${sourceCommit}, source now at ${latestCommit})`
        );
      }
    }
  }
}

// ── Summary ──────────────────────────────────────────────────────

console.log(`\nChecked ${checkedCount} translated file(s) across ${locales.length} locale(s)`);

if (orphanCount > 0) {
  console.log(`Orphans: ${orphanCount} (translation exists but source is missing)`);
}

if (staleCount > 0) {
  console.log(`Stale: ${staleCount} translation(s) need updating`);
  if (!WARN_ONLY) {
    process.exit(1);
  }
} else {
  console.log('All translations are up to date.');
}
