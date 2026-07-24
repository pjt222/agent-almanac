#!/usr/bin/env node
/**
 * eval-coverage.js — per-skill eval/scenario coverage report (#435, from #422 P1).
 *
 * agent-almanac is not eval-less: tests/scenarios/ holds a real contract (Ground-Truth
 * tables, weighted Acceptance Criteria, PASS thresholds, a 5-dim rubric). But coverage
 * is low and invisible. This report makes it measured: for each registry skill, it
 * checks whether any scenario declares `target: <skill-id>`, and prints
 * covered/total (pct) plus the uncovered ids.
 *
 * Report-only by default (coverage is low by design today, so gating would fail every
 * PR). Pass --min <pct> to exit non-zero below a floor once coverage is raised.
 *
 *   node scripts/eval-coverage.js              # human report, always exit 0
 *   node scripts/eval-coverage.js --json        # machine-readable
 *   node scripts/eval-coverage.js --min 25      # exit 1 if coverage < 25%
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const registryPath = join(repoRoot, 'skills', '_registry.yml');
const scenariosDir = join(repoRoot, 'tests', 'scenarios');

const args = process.argv.slice(2);
const jsonOut = args.includes('--json');
const minIdx = args.indexOf('--min');
let minPct = null;
if (minIdx !== -1) {
  minPct = Number(args[minIdx + 1]);
  if (!Number.isFinite(minPct)) {
    console.error('eval-coverage: --min requires a numeric percentage, e.g. --min 25');
    process.exit(2);
  }
}

// ── registry skill ids (6-space "- id:" entries under the skills list) ───────
const registry = readFileSync(registryPath, 'utf8');
const skillIds = [...registry.matchAll(/^ {6}- id:\s*([a-z0-9][a-z0-9-]*)\s*$/gm)].map((m) => m[1]);
const skillSet = new Set(skillIds);

// ── scenario targets ─────────────────────────────────────────────────────────
function walk(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of entries) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (p.endsWith('.md')) acc.push(p);
  }
  return acc;
}

const coveredSkills = new Set();
for (const file of walk(scenariosDir)) {
  const content = readFileSync(file, 'utf8');
  // only the YAML frontmatter block declares the real target — a `target:` line quoted
  // inside a fenced example block must not count as coverage
  const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const scope = fm ? fm[1] : '';
  for (const m of scope.matchAll(/^target:\s*([a-z0-9][a-z0-9-]*)\s*$/gm)) {
    if (skillSet.has(m[1])) coveredSkills.add(m[1]);
  }
}

const total = skillIds.length;
const covered = coveredSkills.size;
const pct = total ? (covered / total) * 100 : 0;
const uncovered = skillIds.filter((id) => !coveredSkills.has(id)).sort();

if (jsonOut) {
  console.log(JSON.stringify({ total, covered, pct: Number(pct.toFixed(1)), coveredSkills: [...coveredSkills].sort(), uncovered }, null, 2));
} else {
  console.log(`Eval coverage: ${covered}/${total} skills have a scenario (${pct.toFixed(1)}%)`);
  console.log(`Covered: ${[...coveredSkills].sort().join(', ') || '(none)'}`);
  console.log(`Uncovered: ${uncovered.length} skill(s)`);
  if (minPct !== null) {
    console.log(`\nFloor: ${minPct}% — ${pct >= minPct ? 'PASS' : 'BELOW FLOOR'}`);
  }
}

process.exit(minPct !== null && pct < minPct ? 1 : 0);
