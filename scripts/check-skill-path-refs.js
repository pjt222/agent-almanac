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
 * LAST segment carries a dot, with an optional `:<line>` suffix stripped. The dot rule excludes
 * directories and MCP methods (`tools/list`, `scripts/addons` are not paths here) — and it
 * excludes every extensionless FILE too (`tools/Makefile`, `scripts/LICENSE`); that is the
 * price of the rule, stated rather than hidden. A `<`, `*` or space anywhere means a
 * placeholder, and the token is not matched at all. A reference resolves only to a regular
 * file: a directory of the same name does not satisfy it.
 *
 * Scope, stated as a boundary and stated ACCURATELY, since a boundary that overclaims is worse
 * than none. What is scanned: every BACKTICKED token in the English `skills/<id>/SKILL.md`
 * (spelled with a placeholder because the glob's `*` followed by `/` would end this comment),
 * INCLUDING tokens inside fenced code blocks — `extractRefs` matches line by line and has no
 * fence awareness. What is therefore missed is an UNBACKTICKED path, wherever it sits. Outside
 * the scan entirely: the ten `i18n/` mirrors, and every prefix but the three below (`skills/`,
 * `guides/`, `agents/`, `teams/`, `.github/workflows/`). Widening is #785, a follow-up, not a
 * silent extension.
 *
 * That predicate still admits paths that belong to ANOTHER tree: the target project a skill
 * scaffolds into (`scripts/generate-workflow-diagram.R` in `setup-putior-ci`), or a sibling
 * repository's tools. Those go on the ALLOWLIST below, each with the skill that carries it and
 * the reason. The allowlist is an exact set in both directions: an entry whose path starts to
 * exist is reported as stale, and an entry no skill carries any more is reported as dead, so a
 * waiver cannot outlive what it waived — the shape CLAUDE.md § Ratcheting a Warn-Only Gate
 * requires of any member list.
 *
 * Exit 0 clean; 1 findings (a miss not on the allowlist, a stale or dead allowlist entry); 2
 * could not measure (no skills, an unreadable skill, or zero references scanned — a check over
 * nothing is not a pass).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isExcludedId } from './lib/content-paths.js';

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
    'the target project\'s allow-list file, described so the reader can build one',
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
      if (!last.includes('.')) continue; // a directory, an MCP method — or an extensionless file
      if (path.includes('..')) continue; // never resolve outside the tree
      refs.push({ path, line: i + 1 });
    }
  });
  return refs;
}

/** Does `path` (repo-relative) name a regular file under `root`? Directories do not count. */
export function isFileUnder(root, path) {
  try {
    return statSync(join(root, path)).isFile();
  } catch {
    return false;
  }
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
    .filter((d) => !isExcludedId(d))
    .filter((d) => existsSync(join(skillsDir, d, 'SKILL.md')))
    .sort();
}

export function main(root) {
  const skillsDir = join(root, 'skills');
  if (!existsSync(skillsDir)) {
    console.error('check-skill-path-refs: skills/ not found — cannot measure');
    return 2;
  }
  const exists = (p) => isFileUnder(root, p);
  let ids;
  try {
    ids = listSkills(skillsDir);
  } catch (err) {
    console.error(`check-skill-path-refs: could not list skills (${err.code ?? err.message}) — cannot measure`);
    return 2;
  }
  let findings = [];
  let refs = 0;
  const seenKeys = new Set();
  for (const id of ids) {
    let text;
    try {
      text = readFileSync(join(skillsDir, id, 'SKILL.md'), 'utf8');
    } catch (err) {
      console.error(`check-skill-path-refs: could not read skills/${id}/SKILL.md (${err.code ?? err.message}) — cannot measure`);
      return 2;
    }
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
  process.exit(main(resolve(dirname(fileURLToPath(import.meta.url)), '..')));
}
