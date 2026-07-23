#!/usr/bin/env node
/**
 * audit-skill-sections.js
 *
 * Audits English SKILL.md files for the repo's six required sections and for
 * Common Pitfalls entry counts.
 *
 * Pitfall entries are counted in BOTH supported list formats — dash bullets
 * ("- **Label**: ...") and numbered items ("1. **Label**: ...").  A dash-only
 * counter reads 0 for the ~24 skills authored with numbered lists, which is how
 * the original #382 tail measurement under-counted by 8 skills.
 *
 * Usage:
 *   node scripts/audit-skill-sections.js                  # full corpus report
 *   node scripts/audit-skill-sections.js --min 9          # only skills at >= 9 pitfalls
 *   node scripts/audit-skill-sections.js --missing        # only skills missing required sections
 *   node scripts/audit-skill-sections.js --json           # machine-readable
 *   node scripts/audit-skill-sections.js <skill-id> ...   # audit specific skills
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SKILLS_DIR = resolve(ROOT, 'skills');

export const REQUIRED_SECTIONS = [
  'When to Use',
  'Inputs',
  'Procedure',
  'Validation',
  'Common Pitfalls',
  'Related Skills',
];

/**
 * Extract the body of a `## <heading>` section, up to the next `## ` heading.
 *
 * Matches on heading PREFIX, not equality: the corpus uses "## Validation"
 * (334 occurrences), "## Validation Checklist" (38), and "## Validation Checks"
 * (1) interchangeably, and an equality check reports 39 false positives.
 */
function sectionBody(lines, heading) {
  const wanted = `## ${heading}`.toLowerCase();
  const outside = fenceMask(lines);

  const startIndex = lines.findIndex((line, i) => {
    if (!outside[i]) return false;
    const trimmed = line.trim().toLowerCase();
    return trimmed === wanted || trimmed.startsWith(`${wanted} `);
  });
  if (startIndex === -1) return null;

  const body = [];
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (outside[i] && /^##\s/.test(lines[i])) break;
    body.push({ text: lines[i], outsideFence: outside[i] });
  }
  return body;
}

/**
 * Mark which lines sit outside fenced code blocks.
 *
 * Required, not defensive: `create-skill` and `evolve-skill` embed a
 * ```markdown fence containing a literal "## Common Pitfalls" template, so a
 * fence-blind parser locks onto the example and reads the wrong section — and
 * then walks past it collecting every bullet until the next real heading.
 */
function fenceMask(lines) {
  const mask = new Array(lines.length).fill(true);
  let fence = null;
  lines.forEach((line, i) => {
    const match = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (match) {
      const char = match[1][0];
      const length = match[1].length;
      if (fence === null) {
        fence = { char, length };
        mask[i] = false;
        return;
      }
      // CommonMark: a closer must use the same character, be at least as long
      // as the opener, and carry no trailing text. Comparing only the character
      // lets an inner ```{r} chunk close an outer ````markdown fence, which
      // phase-flips the mask and can expose a fenced "## Common Pitfalls"
      // template as if it were the real section.
      if (char === fence.char && length >= fence.length && match[2].trim() === '') {
        fence = null;
        mask[i] = false;
        return;
      }
    }
    if (fence !== null) mask[i] = false;
  });
  return mask;
}

/**
 * Count Common Pitfalls entries.
 *
 * THREE formats are in use and all three must be counted, or the result is a
 * silent zero rather than an error:
 *   - dash bullets      "- **Label**: ..."
 *   - numbered items    "1. **Label**: ..."
 *   - a two-column table (use-graphql-api), whose body rows are the entries
 *
 * Indented continuation lines are ignored so a multi-line pitfall counts once.
 */
export function countPitfalls(body) {
  if (!body) return null;
  const outside = body.filter((line) => line.outsideFence);

  const listEntries = outside.filter((line) => /^(?:-\s+|\d+\.\s+)\S/.test(line.text)).length;
  if (listEntries) return listEntries;

  // Table body rows = all pipe rows minus the header and its separator.
  const tableRows = outside.filter((line) => /^\s*\|/.test(line.text)).length;
  return tableRows > 2 ? tableRows - 2 : 0;
}

export function auditSkill(skillId) {
  const path = resolve(SKILLS_DIR, skillId, 'SKILL.md');
  if (!existsSync(path)) return { skill: skillId, error: 'SKILL.md not found' };

  const raw = readFileSync(path, 'utf8');
  const lines = raw.split('\n');
  const missing = REQUIRED_SECTIONS.filter((heading) => sectionBody(lines, heading) === null);
  const pitfalls = countPitfalls(sectionBody(lines, 'Common Pitfalls'));
  const versionMatch = raw.match(/^\s+version:\s*"([^"]+)"/m);

  return {
    skill: skillId,
    lines: lines.length,
    pitfalls,
    version: versionMatch ? versionMatch[1] : null,
    missing,
  };
}

function listSkillIds() {
  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
    .map((entry) => entry.name)
    .filter((name) => existsSync(resolve(SKILLS_DIR, name, 'SKILL.md')))
    .sort();
}

// ── CLI ──────────────────────────────────────────────────────────
// pathToFileURL, not string concatenation: argv[1] needs percent-encoding when
// the checkout path contains a space or non-ASCII character, and a mismatch here
// would skip the whole CLI block and exit 0 — a gate that silently passes.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const KNOWN_FLAGS = new Set(['--json', '--missing', '--min']);
  const unknown = args.filter((arg) => arg.startsWith('--') && !KNOWN_FLAGS.has(arg));
  if (unknown.length) {
    console.error(`Unknown flag(s): ${unknown.join(', ')}`);
    process.exit(2);
  }

  const asJson = args.includes('--json');
  const missingOnly = args.includes('--missing');
  const minIndex = args.indexOf('--min');
  let minPitfalls = null;
  if (minIndex !== -1) {
    minPitfalls = Number(args[minIndex + 1]);
    if (!Number.isFinite(minPitfalls)) {
      console.error(`--min requires a number, got: ${args[minIndex + 1] ?? '(nothing)'}`);
      process.exit(2);
    }
  }

  const explicit = args.filter((arg, index) => {
    if (arg.startsWith('--')) return false;
    return !(minIndex !== -1 && index === minIndex + 1);
  });

  const skillIds = explicit.length ? explicit : listSkillIds();
  let reports = skillIds.map(auditSkill);

  // An unreadable skill and an empty section both have to fail the gate: a
  // section heading with zero entries satisfies "not missing" but teaches
  // nothing, and a renamed id would otherwise pass by silently reporting on
  // nothing at all.
  if (missingOnly) {
    reports = reports.filter((r) => r.error || (r.missing && r.missing.length) || r.pitfalls === 0);
  }
  if (minPitfalls !== null) reports = reports.filter((r) => (r.pitfalls ?? 0) >= minPitfalls);

  if (asJson) {
    console.log(JSON.stringify(reports, null, 2));
  } else {
    console.log('skill | pitfalls | version | lines | missing sections');
    for (const r of reports.sort((a, b) => (b.pitfalls ?? 0) - (a.pitfalls ?? 0))) {
      if (r.error) {
        console.log(`${r.skill} | ERROR: ${r.error}`);
        continue;
      }
      console.log(
        `${r.skill} | ${r.pitfalls ?? 'NO SECTION'} | ${r.version ?? '?'} | ${r.lines} | ${
          r.missing.length ? r.missing.join(', ') : '-'
        }`
      );
    }
    console.log(`\n${reports.length} skill(s) reported.`);
  }

  const hasFailure = reports.some((r) => r.error || (r.missing && r.missing.length) || r.pitfalls === 0);
  if (missingOnly && hasFailure) process.exit(1);
}
