#!/usr/bin/env node
/**
 * check-skill-byte-ceiling.js — the English body byte ceiling for a SKILL.md (#1128).
 *
 * Antigravity CLI (`agy`) truncates SKILL.md bodies past 24,000 UTF-8 bytes ("the body is
 * <N> bytes; only the first 24000 are loaded"). PR #1134 extracted extended reference
 * tables/examples into `references/` across all 14 over-cap English skills, bringing the
 * shipped English corpus to 0 over-cap files, so this gate ships BLOCKING in the required
 * `skills` workflow (`.github/workflows/validate-skills.yml`, before `npm ci`).
 *
 * MEASUREMENT SEMANTICS (empirically pinned against `agy 1.5.18`)
 * ---------------------------------------------------------------
 * - Leading YAML frontmatter (`---\n...\n---\n`) is stripped before counting.
 * - Leading and trailing whitespace on the body is trimmed (`.trim()`): a 24,000-byte ASCII
 *   body surrounded by leading/trailing newlines passes `agy plugin validate --strict --json`,
 *   while 24,001 bytes fails.
 * - Length is measured in UTF-8 bytes (`Buffer.byteLength(body, 'utf8')`), not UTF-16 code
 *   units or Unicode code points: 8,000 CJK characters (24,000 UTF-8 bytes) pass, while
 *   1 em-dash + 23,999 ASCII chars (24,000 chars, 24,002 UTF-8 bytes) fail.
 *
 * SCOPE & DEPENDENCIES
 * --------------------
 * English sources only (`skills/<id>/SKILL.md`, skipping `_`-prefixed template directories).
 * Translated mirrors in `i18n/` are tracked separately (#1135). Uses Node built-ins only so
 * it resolves before `npm ci` in `.github/workflows/validate-skills.yml`.
 *
 * Usage:
 *   node scripts/check-skill-byte-ceiling.js                         # full corpus, exit 1 on any OVER
 *   node scripts/check-skill-byte-ceiling.js <skill-id> ...          # just the named skill(s)
 *   node scripts/check-skill-byte-ceiling.js --skills-dir <dir> ...  # override skills root (testing)
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SKILLS_DIR = resolve(ROOT, 'skills');

/** Maximum UTF-8 byte length of a SKILL.md body (matches Antigravity CLI's 24,000-byte cap). */
export const CEILING = 24000;

/**
 * Strip leading YAML frontmatter (if present) and trim outer whitespace, matching `agy 1.5.18`.
 *
 * @param {string} text
 * @returns {string}
 */
export function extractBody(text) {
  const withoutBom = text.startsWith('\uFEFF') ? text.slice(1) : text;
  const stripped = withoutBom.replace(/^---\r?\n(?:[\s\S]*?\r?\n)?---(?:\r?\n|$)/, '');
  return stripped.trim();
}

/**
 * UTF-8 byte length of a SKILL.md's body (excluding YAML frontmatter and outer whitespace).
 *
 * @param {string} text
 * @returns {number}
 */
export function countBodyBytes(text) {
  return Buffer.byteLength(extractBody(text), 'utf8');
}

/**
 * One skill's verdict against the byte ceiling.
 *
 * @param {string} text the English SKILL.md's whole contents
 * @param {string} skillId
 * @returns {{skill: string, bytes: number, ceiling: number, over: boolean}}
 */
export function checkSkillText(text, skillId) {
  const bytes = countBodyBytes(text);
  return { skill: skillId, bytes, ceiling: CEILING, over: bytes > CEILING };
}

/**
 * @param {string} skillId
 * @param {string} [skillsDir]
 * @returns {{skill: string, bytes: number, ceiling: number, over: boolean} | {skill: string, error: string}}
 */
export function checkSkill(skillId, skillsDir = SKILLS_DIR) {
  const filePath = resolve(skillsDir, skillId, 'SKILL.md');
  if (!existsSync(filePath)) return { skill: skillId, error: 'SKILL.md not found' };
  return checkSkillText(readFileSync(filePath, 'utf8'), skillId);
}

/** Every real skill id on disk — a `_`-prefixed directory (`_template`) is scaffolding, not content. */
function listSkillIds(skillsDir = SKILLS_DIR) {
  return readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
    .map((entry) => entry.name)
    .filter((name) => existsSync(resolve(skillsDir, name, 'SKILL.md')))
    .sort();
}

/**
 * Parse CLI arguments; rejects unknown flags with an error message rather than ignoring them.
 *
 * @param {string[]} argv
 * @returns {{skillsDir: string, explicit: string[]} | {error: string}}
 */
function parseArgs(argv) {
  let skillsDir = SKILLS_DIR;
  const explicit = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--skills-dir') {
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        return { error: '--skills-dir requires a directory path' };
      }
      skillsDir = resolve(value);
      i++;
    } else if (arg.startsWith('--')) {
      return { error: `unknown option: ${arg}` };
    } else {
      explicit.push(arg);
    }
  }
  return { skillsDir, explicit };
}

// ── CLI ──────────────────────────────────────────────────────────
// pathToFileURL, not string concatenation: argv[1] needs percent-encoding when the checkout path
// contains a space or non-ASCII character, and a mismatch here would skip this block and exit 0
// — a gate that silently passes (the same guard check-skill-line-ceiling.js uses).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.error) {
    console.error(`ERROR: ${parsed.error}`);
    process.exit(2);
  }

  const skillIds = parsed.explicit.length ? parsed.explicit : listSkillIds(parsed.skillsDir);
  const reports = skillIds.map((id) => checkSkill(id, parsed.skillsDir));

  let maxReport = null;
  for (const r of reports) {
    if (r.error) {
      console.log(`ERROR: ${r.skill}: ${r.error}`);
    } else {
      if (!maxReport || r.bytes > maxReport.bytes) maxReport = r;
      if (r.over) console.log(`OVER: ${r.skill} (${r.bytes} bytes > ${r.ceiling})`);
    }
  }

  const maxNote = maxReport ? ` (max: ${maxReport.skill} at ${maxReport.bytes} bytes)` : '';
  console.log(`checked ${reports.length} skill(s), ceiling ${CEILING} UTF-8 body bytes${maxNote}`);

  const failed = reports.some((r) => r.error || r.over);
  process.exit(failed ? 1 : 0);
}
