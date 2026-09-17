#!/usr/bin/env node
/**
 * check-skill-line-ceiling.js — the English line ceiling for a SKILL.md, derived rather than
 * written down (#855).
 *
 * A scaffolded translation is English's body plus PROVENANCE_FIELDS.length frontmatter lines
 * (`translate-content.sh`), so an English file at exactly 500 lines puts every freshly-scaffolded
 * mirror over the flat 500-line ceiling every mirror is ALSO held to
 * (`.github/workflows/validate-skills.yml`'s "Validate translated skills" step). CLAUDE.md
 * published the resulting number as prose — "For a skill with scaffolded mirrors the English
 * ceiling is 494" — and #843 shipped a file at exactly 500 lines that then reddened four mirrors
 * at 506, because nothing computed or asserted the number; it was a sentence, not a check.
 *
 * CEILING = 500 - PROVENANCE_FIELDS.length, read from `scripts/lib/provenance.js` rather than
 * restated here. Add a 7th provenance field there and this ceiling drops with it; nobody has to
 * remember to edit a number in two places.
 *
 * WHICH FIELD COUNT: WORST CASE, NOT PER-MIRROR (#855 finding 2)
 * ----------------------------------------------------------------
 * The overhead a scaffolded mirror carries is not constant across the whole corpus: a stub mid
 * refresh (`tools/refresh-untranslated-stubs.mjs`, before its `--stamp` step runs) carries 5
 * fields, not 6 — `fence_basis_commit` is dropped until the stamp records it, because the bytes
 * being written are not yet verified against any committed English revision. A file at ceiling+1
 * lines is therefore technically legal for the length of that window and this check does not
 * know that: it always assumes the WORST case (every field in PROVENANCE_FIELDS present), which
 * is correct once a mirror is stamped and conservative-by-one line during that narrow window.
 * Reading each skill's actual mirrors to compute a per-skill ceiling was considered and rejected:
 * finding 3 is exactly the case that has no mirrors to read from yet, so a per-mirror ceiling
 * would still need a worst-case fallback for that path, and two computations that must agree is
 * two places to drift instead of one.
 *
 * SCOPE
 * -----
 * English sources only (`skills/<id>/SKILL.md`). The flat 500-line ceiling on i18n mirrors
 * themselves is unchanged and enforced separately, later in the same CI job.
 *
 * Usage:
 *   node scripts/check-skill-line-ceiling.js                 # full corpus, exit 1 on any OVER
 *   node scripts/check-skill-line-ceiling.js <skill-id> ...  # just the named skill(s)
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PROVENANCE_FIELDS } from './lib/provenance.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SKILLS_DIR = resolve(ROOT, 'skills');

/** 500 minus the worst-case scaffolded-mirror overhead — see file header for why worst case. */
export const CEILING = 500 - PROVENANCE_FIELDS.length;

/**
 * Lines in `text`, matching what `wc -l` reports (and what every other line-count gate in this
 * repo counts against): a trailing newline ends the last line rather than starting an empty one.
 *
 * @param {string} text
 * @returns {number}
 */
export function countLines(text) {
  if (text === '') return 0;
  const body = text.endsWith('\n') ? text.slice(0, -1) : text;
  return body.split('\n').length;
}

/**
 * One skill's verdict against the derived ceiling.
 *
 * @param {string} text the English SKILL.md's whole contents
 * @param {string} skillId
 * @returns {{skill: string, lines: number, ceiling: number, over: boolean}}
 */
export function checkSkillText(text, skillId) {
  const lines = countLines(text);
  return { skill: skillId, lines, ceiling: CEILING, over: lines > CEILING };
}

/**
 * @param {string} skillId
 * @returns {{skill: string, lines: number, ceiling: number, over: boolean} | {skill: string, error: string}}
 */
export function checkSkill(skillId) {
  const path = resolve(SKILLS_DIR, skillId, 'SKILL.md');
  if (!existsSync(path)) return { skill: skillId, error: 'SKILL.md not found' };
  return checkSkillText(readFileSync(path, 'utf8'), skillId);
}

/** Every real skill id on disk — a `_`-prefixed directory (`_template`) is scaffolding, not content. */
function listSkillIds() {
  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
    .map((entry) => entry.name)
    .filter((name) => existsSync(resolve(SKILLS_DIR, name, 'SKILL.md')))
    .sort();
}

// ── CLI ──────────────────────────────────────────────────────────
// pathToFileURL, not string concatenation: argv[1] needs percent-encoding when the checkout path
// contains a space or non-ASCII character, and a mismatch here would skip this block and exit 0
// — a gate that silently passes (the same guard audit-skill-sections.js uses).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const explicit = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
  const skillIds = explicit.length ? explicit : listSkillIds();
  const reports = skillIds.map(checkSkill);

  for (const r of reports) {
    if (r.error) console.log(`ERROR: ${r.skill}: ${r.error}`);
    else if (r.over) console.log(`OVER: ${r.skill} (${r.lines} lines > ${r.ceiling})`);
  }
  console.log(
    `checked ${reports.length} skill(s), ceiling ${CEILING} lines ` +
      `(500 - ${PROVENANCE_FIELDS.length} provenance field(s): ${PROVENANCE_FIELDS.join(', ')})`,
  );

  const failed = reports.some((r) => r.error || r.over);
  process.exit(failed ? 1 : 0);
}
