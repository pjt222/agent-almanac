#!/usr/bin/env node
/**
 * check-skill-path-refs.js — a skill that names a repository path names one that exists (#773).
 *
 * `write-continue-here` points at `workflows/verify-handoff.mjs`. Rename the workflow, or
 * mistype it (`verify-handofff.mjs`), and every gate stays green — `audit-skill-sections.js`,
 * the line-count check, `validate:integrity` — because nothing resolves the reference. The
 * reader finds out at runtime, which for a skill means an agent finds out mid-procedure.
 *
 * ## What counts as a repository path
 *
 * A backticked token whose whole content is `workflows/…`, `tools/…` or `scripts/…`, whose
 * LAST segment carries a dot (a file, not a directory or an MCP method — `tools/list` and
 * `scripts/addons` are not paths here), with an optional `:<line>` suffix stripped. A `<`, `*`
 * or space anywhere means a placeholder, and the token is not matched at all.
 *
 * That predicate still admits paths that belong to ANOTHER tree: the target project a skill
 * scaffolds into (`scripts/generate-workflow-diagram.R` in `setup-putior-ci`), or a sibling
 * repository's tools (`tools/check-redaction.sh` in `redact-for-public-disclosure`). Those go on
 * the ALLOWLIST below, each with the skill that carries it and the reason. The allowlist is an
 * exact set in both directions: an entry whose path starts to exist is reported as stale, so a
 * waiver cannot outlive what it waived — the shape CLAUDE.md § Ratcheting a Warn-Only Gate
 * requires of any member list.
 *
 * Exit 0 clean; 1 findings (a miss not on the allowlist, or a stale allowlist entry); 2 could
 * not measure (no skills, or zero references scanned — a check over nothing is not a pass).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Paths a skill names that are deliberately not this repository's. Key: `<skill-id>:<path>`.
 * Read the reason before removing one; add one only with the reason.
 */
export const ALLOWLIST = Object.freeze({
  'setup-putior-ci:scripts/generate-workflow-diagram.R':
    'the script the skill creates in the TARGET project, not a file here',
  'stale-proof-rendered-numbers:tools/doc_stats.py':
    'an example name ("e.g.") for the extractor the reader writes in their own project',
  // `tools/check-redaction.sh` is NOT here: it exists in this repository, and the first draft
  // of this list waived it on the assumption it was the target project's — the stale-entry rule
  // reported that on the first corpus run, which is the rule doing its job.
  'redact-for-public-disclosure:tools/public-allowlist.txt':
    'the target project\'s allow-list file, same procedure',
  'redact-for-public-disclosure:tools/sync-to-public.sh':
    'the target project\'s mirror script, same procedure',
  'create-workflow:workflows/_registry.yml':
    'deferred behind the #288 Phase-2 gate; the skill says so in the same sentence (#294)',
});

export const PATH_PREFIXES = ['workflows', 'tools', 'scripts'];

// Whole-token match between backticks; no `<`, `*` or whitespace anywhere in the path.
const TOKEN = new RegExp(`\`((?:${PATH_PREFIXES.join('|')})/[A-Za-z0-9_./-]+?)(?::\\d+)?\``, 'g');

/** Every candidate reference in one skill body: `{ path, line }`. */
export function extractRefs(text) {
  const refs = [];
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(TOKEN)) {
      const path = m[1];
      const last = path.slice(path.lastIndexOf('/') + 1);
      if (!last.includes('.')) continue; // a directory or an MCP method, not a file
      if (path.includes('..')) continue; // never resolve outside the tree
      refs.push({ path, line: i + 1 });
    }
  });
  return refs;
}

/**
 * Judge one skill's references against the tree. `exists(path)` is injectable for tests.
 * @returns {string[]} findings
 */
export function checkSkill({ id, text, exists }) {
  const findings = [];
  for (const ref of extractRefs(text)) {
    const key = `${id}:${ref.path}`;
    const present = exists(ref.path);
    const waived = Object.hasOwn(ALLOWLIST, key);
    if (!present && !waived) {
      findings.push(`skills/${id}/SKILL.md:${ref.line} names \`${ref.path}\`, which does not exist in the repository`);
    }
    if (present && waived) {
      findings.push(`skills/${id}/SKILL.md:${ref.line} \`${ref.path}\` is on the allowlist but now exists — remove the entry (${ALLOWLIST[key]})`);
    }
  }
  return findings;
}

export function listSkills(skillsDir) {
  return readdirSync(skillsDir)
    .filter((d) => !d.startsWith('_') && d !== 'README.md')
    .filter((d) => existsSync(join(skillsDir, d, 'SKILL.md')))
    .sort();
}

export function main(root) {
  const skillsDir = join(root, 'skills');
  if (!existsSync(skillsDir)) {
    console.error('check-skill-path-refs: skills/ not found — cannot measure');
    return 2;
  }
  const exists = (p) => existsSync(join(root, p));
  const ids = listSkills(skillsDir);
  let findings = [];
  let refs = 0;
  const seenKeys = new Set();
  for (const id of ids) {
    const text = readFileSync(join(skillsDir, id, 'SKILL.md'), 'utf8');
    const extracted = extractRefs(text);
    refs += extracted.length;
    for (const r of extracted) seenKeys.add(`${id}:${r.path}`);
    findings = findings.concat(checkSkill({ id, text, exists }));
  }
  // An allowlist entry no skill carries any more is dead weight; the set is exact.
  for (const key of Object.keys(ALLOWLIST)) {
    if (!seenKeys.has(key)) findings.push(`allowlist entry ${key} matches no reference in any skill — remove it`);
  }
  if (refs === 0) {
    console.error('check-skill-path-refs: zero repository-path references scanned — a check over nothing is not a pass');
    return 2;
  }
  for (const f of findings) console.log(`FAIL: ${f}`);
  if (findings.length > 0) return 1;
  console.log(`OK: ${refs} repository-path reference(s) across ${ids.length} skills resolve, or are allowlisted with a reason (${Object.keys(ALLOWLIST).length} entries)`);
  return 0;
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  try { statSync(root); } catch { process.exit(2); }
  process.exit(main(root));
}
