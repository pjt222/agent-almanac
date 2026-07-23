#!/usr/bin/env node
/**
 * coverage-matrix.js
 *
 * Reports, per skill domain, which agents reference its skills and which teams
 * and workflows reach it — surfacing clusters that no higher-level spec covers.
 *
 * Coverage is derived from TEXT REFERENCES in agent definition files, not from
 * the frontmatter `skills:` list alone: agents cap frontmatter at 5 identity
 * skills and list the rest in an `## Available Skills` body section, so a
 * frontmatter-only scan badly understates coverage.
 *
 * Read the numbers as LEADS, not verdicts. Two known blind spots:
 *   - An agent file and agents/_registry.yml can disagree about which skills an
 *     agent carries; this reads the files, so registry-only claims show as gaps.
 *   - Team coverage is inferred from member agents, so a team dedicated to a
 *     domain whose members carry none of its skills reads as uncovered.
 * Confirm any gap against the actual files before acting on it.
 *
 * Usage:
 *   node scripts/coverage-matrix.js                 # table, least-covered first
 *   node scripts/coverage-matrix.js --orphans       # only domains with zero agent coverage
 *   node scripts/coverage-matrix.js --json [path]   # full matrix as JSON
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const loadYaml = (relativePath) => yaml.load(readFileSync(resolve(ROOT, relativePath), 'utf8'));

export function buildCoverageMatrix() {
  const skillsRegistry = loadYaml('skills/_registry.yml');
  const teamsRegistry = loadYaml('teams/_registry.yml');

  const domains = {};
  for (const [domain, entry] of Object.entries(skillsRegistry.domains)) {
    domains[domain] = (entry.skills || []).map((skill) => skill.id);
  }
  const allSkillIds = Object.values(domains).flat();

  // Pre-compile one boundary-anchored matcher per skill id so a short id like
  // `metal` does not match inside `sheet-metal-forming`.
  const matchers = allSkillIds.map((id) => ({
    id,
    regex: new RegExp(`(^|[^a-z0-9-])${id}($|[^a-z0-9-])`, 'm'),
  }));

  const agentsDir = resolve(ROOT, 'agents');
  const agentFiles = readdirSync(agentsDir).filter(
    (name) => name.endsWith('.md') && !name.startsWith('_') && name !== 'README.md'
  );

  const agentSkills = {};
  for (const file of agentFiles) {
    const body = readFileSync(join(agentsDir, file), 'utf8');
    agentSkills[file.replace(/\.md$/, '')] = new Set(
      matchers.filter(({ regex }) => regex.test(body)).map(({ id }) => id)
    );
  }

  const teamMembers = {};
  for (const team of teamsRegistry.teams) teamMembers[team.id] = team.members || [];

  const workflowsDir = resolve(ROOT, 'workflows');
  const workflowSkills = {};
  if (existsSync(workflowsDir)) {
    for (const file of readdirSync(workflowsDir).filter(
      (name) => name.endsWith('.mjs') && !name.startsWith('_')
    )) {
      const body = readFileSync(join(workflowsDir, file), 'utf8');
      workflowSkills[file.replace(/\.mjs$/, '')] = allSkillIds.filter((id) => body.includes(id));
    }
  }

  const matrix = {};
  for (const [domain, skillIds] of Object.entries(domains)) {
    const coveringAgents = {};
    for (const [agentId, covered] of Object.entries(agentSkills)) {
      const hits = skillIds.filter((id) => covered.has(id));
      if (hits.length) coveringAgents[agentId] = hits.length;
    }
    matrix[domain] = {
      skillCount: skillIds.length,
      skills: skillIds,
      agents: coveringAgents,
      bestAgentCoverage: Math.max(0, ...Object.values(coveringAgents)),
      teams: Object.entries(teamMembers)
        .filter(([, members]) => members.some((member) => coveringAgents[member]))
        .map(([teamId]) => teamId),
      workflows: Object.entries(workflowSkills)
        .filter(([, hits]) => hits.some((id) => skillIds.includes(id)))
        .map(([workflowId]) => workflowId),
    };
  }

  return {
    totals: {
      domains: Object.keys(domains).length,
      skills: allSkillIds.length,
      agents: agentFiles.length,
      teams: teamsRegistry.teams.length,
      workflows: Object.keys(workflowSkills).length,
    },
    matrix,
  };
}

// ── CLI ──────────────────────────────────────────────────────────
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const result = buildCoverageMatrix();

  if (args.includes('--json')) {
    const outIndex = args.indexOf('--json') + 1;
    const outPath = args[outIndex] && !args[outIndex].startsWith('--') ? args[outIndex] : null;
    const json = JSON.stringify(result, null, 2);
    if (outPath) {
      writeFileSync(outPath, json);
      console.log(`Wrote ${outPath}`);
    } else {
      console.log(json);
    }
  } else {
    const rows = Object.entries(result.matrix)
      .map(([domain, entry]) => ({
        domain,
        skills: entry.skillCount,
        agents: Object.keys(entry.agents).length,
        best: entry.bestAgentCoverage,
        teams: entry.teams.length,
        workflows: entry.workflows.length,
      }))
      .filter((row) => !args.includes('--orphans') || row.agents === 0)
      .sort((a, b) => a.agents - b.agents || b.skills - a.skills);

    console.log('domain | skills | agents touching | best agent covers | teams | workflows');
    for (const row of rows) {
      console.log(
        `${row.domain} | ${row.skills} | ${row.agents} | ${row.best} | ${row.teams} | ${row.workflows}`
      );
    }
    const { totals } = result;
    console.log(
      `\n${rows.length} domain(s) shown of ${totals.domains}; corpus: ${totals.skills} skills, ` +
        `${totals.agents} agents, ${totals.teams} teams, ${totals.workflows} workflows.`
    );
  }
}
