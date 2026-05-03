#!/usr/bin/env node
/**
 * generate-translation-status.js
 *
 * Auto-generates per-locale translation_status.yml files by counting
 * translated files and checking freshness against English sources.
 *
 * Usage:
 *   node scripts/generate-translation-status.js
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'fs';
import { resolve, dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const I18N_DIR = resolve(ROOT, 'i18n');

// Load config
const configPath = resolve(I18N_DIR, '_config.yml');
if (!existsSync(configPath)) {
  console.error('ERROR: i18n/_config.yml not found');
  process.exit(1);
}
const config = yaml.load(readFileSync(configPath, 'utf8'));

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
 */
function extractSourceCommit(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const match = content.match(/source_commit:\s*["']?([a-f0-9]+)["']?/m);
  return match ? match[1] : null;
}

/**
 * Strip YAML frontmatter, return body only.
 * Frontmatter is delimited by two '---' lines at the start of the file.
 */
function stripFrontmatter(content) {
  const lines = content.split('\n');
  let fmCount = 0;
  let bodyStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      fmCount++;
      if (fmCount === 2) {
        bodyStart = i + 1;
        break;
      }
    }
  }
  return bodyStart >= 0 ? lines.slice(bodyStart).join('\n') : content;
}

/**
 * Detect untranslated stub: scaffold copies English source byte-for-byte
 * and only injects frontmatter fields. If body equals source body, it's a stub.
 */
function isUntranslatedStub(translatedFile, sourcePath) {
  if (!existsSync(sourcePath)) return false;
  const tBody = stripFrontmatter(readFileSync(translatedFile, 'utf8')).trim();
  const sBody = stripFrontmatter(readFileSync(sourcePath, 'utf8')).trim();
  return tBody === sBody;
}

/**
 * Get latest commit for a source file.
 */
function getLatestCommit(filePath) {
  try {
    return execSync(
      `git log -1 --format=%h -- "${filePath}"`,
      { cwd: ROOT, encoding: 'utf8' }
    ).trim() || null;
  } catch {
    return null;
  }
}

/**
 * Check if translation is stale.
 */
function isStale(sourceCommit, latestCommit) {
  if (!sourceCommit || !latestCommit) return false;
  if (sourceCommit === latestCommit) return false;
  try {
    execSync(
      `git merge-base --is-ancestor ${sourceCommit} ${latestCommit}`,
      { cwd: ROOT, encoding: 'utf8' }
    );
    return true;
  } catch {
    return false;
  }
}

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

  if (!existsSync(typeDir)) {
    return { translated, stale, stubs };
  }

  const entries = readdirSync(typeDir);
  for (const entry of entries) {
    const entryPath = resolve(typeDir, entry);

    let translatedFile;
    if (contentType === 'skills') {
      if (!statSync(entryPath).isDirectory()) continue;
      translatedFile = resolve(entryPath, 'SKILL.md');
      if (!existsSync(translatedFile)) continue;
    } else {
      if (!entry.endsWith('.md')) continue;
      translatedFile = entryPath;
    }

    const sourcePath = resolveSourcePath(contentType, translatedFile);

    if (isUntranslatedStub(translatedFile, sourcePath)) {
      stubs++;
      continue;
    }

    translated++;

    const sourceCommit = extractSourceCommit(translatedFile);
    if (existsSync(sourcePath) && sourceCommit) {
      const latestCommit = getLatestCommit(sourcePath);
      if (isStale(sourceCommit, latestCommit)) {
        stale++;
      }
    }
  }

  return { translated, stale, stubs };
}

// ── Main ─────────────────────────────────────────────────────────

const contentTypes = ['skills', 'agents', 'teams', 'guides'];
const locales = config.supported_locales.map(l => l.code);
const today = new Date().toISOString().split('T')[0];

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
  const totalSource = sourceCounts.total;

  for (const contentType of contentTypes) {
    const { translated, stale, stubs } = countTranslations(locale, contentType);
    const total = sourceCounts[contentType];
    const pct = total > 0 ? Math.round((translated / total) * 1000) / 10 : 0;
    coverage[contentType] = { translated, total, pct, stale, stubs };
    totalTranslated += translated;
    totalStale += stale;
    totalStubs += stubs;
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
  };

  const status = {
    locale,
    last_updated: today,
    coverage,
  };

  const statusPath = resolve(localeDir, 'translation_status.yml');
  writeFileSync(statusPath, yaml.dump(status, { flowLevel: 3 }));
  console.log(`GENERATED: ${statusPath.replace(ROOT + '/', '')}`);
  console.log(`  Coverage: ${totalTranslated}/${totalSource} (${totalPct}%), ${totalStale} stale, ${totalStubs} stubs`);
}
