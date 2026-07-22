#!/usr/bin/env node
/**
 * check-i18n-frontmatter-parity.js
 *
 * Checks that keep-in-English frontmatter fields in translated skills match
 * the English source. i18n/README.md declares `allowed-tools` (among others)
 * keep-in-English, but nothing enforced it: when a source's tool grant
 * changes, every locale snapshot silently desyncs (the drift class behind
 * PR #368; root cause filed as #371).
 *
 * Currently compares: allowed-tools (the field that actually drifted).
 * Extending to tags/domain/language is a recorded follow-up decision — the
 * corpus carries pre-existing paraphrase drift in tags that needs its own
 * catch-up first (see #371 discussion).
 *
 * Deliberately does NOT parse the full frontmatter as YAML: pilot-era
 * translations carry shape variance (locale fields at top level vs under
 * metadata), and a malformed unrelated field must not mask an allowed-tools
 * comparison. The field is extracted by scoped line matching instead —
 * frontmatter block only, so `allowed-tools:` inside body code examples
 * (the #369 false-positive class) is never matched.
 *
 * Usage:
 *   node scripts/check-i18n-frontmatter-parity.js          # fail on mismatch
 *   node scripts/check-i18n-frontmatter-parity.js --warn   # warn only
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const I18N_DIR = resolve(ROOT, 'i18n');
const SKILLS_DIR = resolve(ROOT, 'skills');
const WARN_ONLY = process.argv.includes('--warn');

/**
 * Extract the frontmatter block (between the leading `---` delimiters),
 * or null when the file has none.
 */
function extractFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/);
  return match ? match[1] : null;
}

/**
 * Extract allowed-tools tokens from a frontmatter block.
 * Inline form:  allowed-tools: Bash Read Write
 * Block form:   allowed-tools:\n  - Bash\n  - Read
 * Returns an array of tokens, or null when the field is absent.
 */
function extractAllowedTools(fmText) {
  if (fmText === null) return null;
  const lines = fmText.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const inline = lines[i].match(/^allowed-tools:[ \t]*(\S.*)$/);
    if (inline) return inline[1].trim().split(/[\s,]+/);
    if (/^allowed-tools:[ \t]*$/.test(lines[i])) {
      const items = [];
      for (let j = i + 1; j < lines.length; j++) {
        const item = lines[j].match(/^[ \t]+-[ \t]*(\S.*)$/);
        if (item) items.push(item[1].trim());
        else if (/^\S/.test(lines[j])) break; // next top-level key
      }
      return items;
    }
  }
  return null;
}

// Cache the English side once: skill name -> token array (or null).
const englishTools = new Map();
for (const skillName of readdirSync(SKILLS_DIR)) {
  if (skillName.startsWith('_')) continue;
  const sourcePath = join(SKILLS_DIR, skillName, 'SKILL.md');
  if (!existsSync(sourcePath)) continue;
  const fm = extractFrontmatter(readFileSync(sourcePath, 'utf8'));
  englishTools.set(skillName, extractAllowedTools(fm));
}

let compared = 0;
const problems = []; // { file, kind, detail }

for (const locale of readdirSync(I18N_DIR)) {
  const localeSkillsDir = join(I18N_DIR, locale, 'skills');
  if (!existsSync(localeSkillsDir)) continue;
  for (const skillName of readdirSync(localeSkillsDir)) {
    const translatedPath = join(localeSkillsDir, skillName, 'SKILL.md');
    if (!existsSync(translatedPath)) continue;
    const relPath = `i18n/${locale}/skills/${skillName}/SKILL.md`;

    if (!englishTools.has(skillName)) {
      problems.push({ file: relPath, kind: 'ORPHAN', detail: 'no English source skill' });
      continue;
    }
    const sourceTokens = englishTools.get(skillName);
    if (sourceTokens === null) continue; // English has no allowed-tools: nothing to enforce

    const fm = extractFrontmatter(readFileSync(translatedPath, 'utf8'));
    const translatedTokens = extractAllowedTools(fm);
    compared++;

    if (translatedTokens === null) {
      problems.push({ file: relPath, kind: 'MISSING', detail: `allowed-tools absent (source: ${sourceTokens.join(' ')})` });
    } else if (translatedTokens.join(' ') !== sourceTokens.join(' ')) {
      problems.push({
        file: relPath,
        kind: 'MISMATCH',
        detail: `allowed-tools "${translatedTokens.join(' ')}" != source "${sourceTokens.join(' ')}"`,
      });
    }
  }
}

const label = WARN_ONLY ? 'WARN' : 'FAIL';
for (const p of problems) console.log(`${label} [${p.kind}] ${p.file}: ${p.detail}`);

console.log(`\ni18n frontmatter parity: ${compared} translated skills compared against ${englishTools.size} English sources.`);
if (problems.length === 0) {
  console.log('OK: all keep-in-English allowed-tools fields match their source.');
} else {
  console.log(`${problems.length} parity problem(s) found. Fix: copy the English allowed-tools value verbatim (keep-in-English field, see i18n/README.md).`);
}

process.exit(problems.length > 0 && !WARN_ONLY ? 1 : 0);
