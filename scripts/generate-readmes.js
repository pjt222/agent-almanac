#!/usr/bin/env node
/**
 * generate-readmes.js
 *
 * Reads skills/_registry.yml, agents/_registry.yml, teams/_registry.yml,
 * and guides/_registry.yml to auto-generate dynamic sections in README.md,
 * skills/README.md, agents/README.md, CLAUDE.md, guides/README.md,
 * viz/README.md, and teams/README.md.
 *
 * Usage:
 *   node scripts/generate-readmes.js          # update files in-place
 *   node scripts/generate-readmes.js --check  # dry-run, exit 1 if stale
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CHECK_MODE = process.argv.includes('--check');

// ── Load registries ──────────────────────────────────────────────
const skillsRegistry = yaml.load(
  readFileSync(resolve(ROOT, 'skills/_registry.yml'), 'utf8')
);
const agentsRegistry = yaml.load(
  readFileSync(resolve(ROOT, 'agents/_registry.yml'), 'utf8')
);
const teamsRegistryPath = resolve(ROOT, 'teams/_registry.yml');
const teamsRegistry = existsSync(teamsRegistryPath)
  ? yaml.load(readFileSync(teamsRegistryPath, 'utf8'))
  : { total_teams: 0, teams: [] };
const guidesRegistryPath = resolve(ROOT, 'guides/_registry.yml');
const guidesRegistry = existsSync(guidesRegistryPath)
  ? yaml.load(readFileSync(guidesRegistryPath, 'utf8'))
  : { total_guides: 0, categories: {}, guides: [] };
const testsRegistryPath = resolve(ROOT, 'tests/_registry.yml');
const testsRegistry = existsSync(testsRegistryPath)
  ? yaml.load(readFileSync(testsRegistryPath, 'utf8'))
  : { total_tests: 0, tests: [] };

const domains = skillsRegistry.domains;
const agents = agentsRegistry.agents;
const defaultSkills = agentsRegistry.default_skills || [];
const teams = teamsRegistry.teams || [];
const guides = guidesRegistry.guides || [];
const guideCategories = guidesRegistry.categories || {};
const tests = testsRegistry.tests || [];
const totalSkills = skillsRegistry.total_skills;
const totalAgents = agentsRegistry.total_agents;
const totalTeams = teamsRegistry.total_teams || 0;
const totalGuides = guidesRegistry.total_guides || 0;
const totalTests = testsRegistry.total_tests || 0;
const totalDomains = Object.keys(domains).length;

// ── Helpers ──────────────────────────────────────────────────────

function domainDisplayName(domainId) {
  return domainId
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

function agentDisplayName(agentId) {
  return agentId;
}

function teamDisplayName(teamId) {
  return teamId;
}

/**
 * Replace content between AUTO markers in a file.
 * Returns true if the file changed.
 */
function replaceSection(content, sectionName, newInner) {
  const startTag = `<!-- AUTO:START:${sectionName} -->`;
  const endTag = `<!-- AUTO:END:${sectionName} -->`;
  const startIdx = content.indexOf(startTag);
  const endIdx = content.indexOf(endTag);
  if (startIdx === -1 || endIdx === -1) {
    console.warn(`WARN: markers for "${sectionName}" not found`);
    return content;
  }
  const before = content.slice(0, startIdx + startTag.length);
  const after = content.slice(endIdx);
  return `${before}\n${newInner}\n${after}`;
}

/**
 * Process a file: apply all section replacements, write if changed.
 * Returns true if the file content differs from disk.
 */
function processFile(filePath, sections) {
  const original = readFileSync(filePath, 'utf8');
  let content = original;
  for (const [name, generator] of Object.entries(sections)) {
    content = replaceSection(content, name, generator());
  }
  const changed = content !== original;
  if (changed && !CHECK_MODE) {
    writeFileSync(filePath, content);
  }
  return changed;
}

/**
 * Write a fully-generated file (no markers). Returns true if changed.
 */
function writeGeneratedFile(filePath, content) {
  const original = existsSync(filePath) ? readFileSync(filePath, 'utf8') : '';
  const changed = content !== original;
  if (changed && !CHECK_MODE) {
    writeFileSync(filePath, content);
  }
  return changed;
}

// ── Section generators ───────────────────────────────────────────

function generateStats() {
  const lines = [
    `- **${totalSkills} skills** across ${totalDomains} domains — structured, executable procedures`,
    `- **${totalAgents} agents** — specialized Claude Code personas covering development, review, compliance, and more`,
    `- **${totalTeams} teams** — predefined multi-agent compositions for complex workflows`,
    `- **${totalGuides} guides** — human-readable workflow, infrastructure, and reference documentation`,
    `- **Interactive visualization** — force-graph explorer with ${totalSkills} R-generated skill icons and 9 color themes`,
  ];
  return lines.join('\n');
}

function generateSkillsIntro(linkPrefix) {
  return `The **[Skills Library](${linkPrefix})** provides ${totalSkills} task-level skills following the [Agent Skills open standard](https://agentskills.io). Each skill is a \`SKILL.md\` with YAML frontmatter and standardized sections: When to Use, Inputs, Procedure (with expected outcomes and failure recovery), Validation, Common Pitfalls, and Related Skills.`;
}

function generateSkillsIntroStandalone() {
  return `A collection of ${totalSkills} task-level skills following the [Agent Skills open standard](https://agentskills.io) (\`SKILL.md\` format). These skills provide structured, executable procedures that agentic systems (Claude Code, Codex, Cursor, Gemini CLI, etc.) can consume to perform specific development tasks.`;
}

function generateSkillsTable(linkPrefix) {
  const rows = [];
  rows.push('| Domain | Skills | Description |');
  rows.push('|--------|--------|-------------|');
  for (const [domainId, domainObj] of Object.entries(domains)) {
    const name = domainDisplayName(domainId);
    const count = domainObj.skills.length;
    const desc = domainObj.description;
    rows.push(`| [${name}](${linkPrefix}${domainId}/) | ${count} | ${desc} |`);
  }
  return rows.join('\n');
}

function generateAgentsIntro(linkPrefix) {
  let text = `The **[Agents Library](${linkPrefix})** provides ${totalAgents} specialized agent definitions for Claude Code. Agents define *who* handles a task (persona, tools, domain expertise), complementing skills which define *how* (procedure, validation).`;
  if (defaultSkills.length > 0) {
    const names = defaultSkills.map(s => s.id).join(', ');
    text += ` All agents inherit default skills: ${names}.`;
  }
  return text;
}

function generateAgentsIntroStandalone() {
  let text = `A collection of ${totalAgents} specialized agent definitions for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). Each agent defines a persona with specific capabilities, tools, and domain expertise that Claude Code uses when spawned as a subagent.`;
  if (defaultSkills.length > 0) {
    const names = defaultSkills.map(s => s.id).join(', ');
    text += `\n\nAll agents inherit **default skills**: ${names}.`;
  }
  return text;
}

function generateAgentsTable(linkPrefix) {
  const sorted = [...agents].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    const pa = priorityOrder[a.priority] ?? 2;
    const pb = priorityOrder[b.priority] ?? 2;
    if (pa !== pb) return pa - pb;
    return a.id.localeCompare(b.id);
  });

  const rows = [];
  rows.push('| Agent | Priority | Description |');
  rows.push('|-------|----------|-------------|');
  for (const agent of sorted) {
    const name = agentDisplayName(agent.id);
    rows.push(
      `| [${name}](${linkPrefix}${agent.id}.md) | ${agent.priority} | ${agent.description} |`
    );
  }
  return rows.join('\n');
}

function generateTeamsIntro(linkPrefix) {
  return `The **[Teams Library](${linkPrefix})** provides ${totalTeams} predefined multi-agent team compositions. Teams define *who works together* — coordinated groups of agents with assigned roles, a lead, and a defined coordination pattern for complex workflows.`;
}

function generateTeamsIntroStandalone() {
  return `A collection of ${totalTeams} predefined multi-agent team compositions for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). Each team defines a coordinated group of agents with assigned roles, a lead, and a defined coordination pattern for complex workflows.`;
}

function generateTeamsTable(linkPrefix) {
  const rows = [];
  rows.push('| Team | Lead | Members | Coordination | Description |');
  rows.push('|------|------|---------|--------------|-------------|');
  for (const team of teams) {
    const name = teamDisplayName(team.id);
    const memberCount = team.members ? team.members.length : 0;
    rows.push(
      `| [${name}](${linkPrefix}${team.id}.md) | ${team.lead} | ${memberCount} | ${team.coordination || 'hub-and-spoke'} | ${team.description} |`
    );
  }
  return rows.join('\n');
}

function generateOverview() {
  return `A documentation-only repository containing ${totalGuides} guides, a skills library of ${totalSkills} agentic skills, ${totalAgents} agent definitions, and ${totalTeams} team compositions following the [Agent Skills open standard](https://agentskills.io). There is no build system, no tests, and no compiled code — all content is markdown and YAML.

The guides serve as the human entry point to the agentic system: practical workflows explaining when, why, and how to interact with agents, teams, and skills through Claude Code.`;
}

function generateRegistries() {
  const domainList = Object.entries(domains)
    .map(([id, obj]) => `${id} (${obj.skills.length})`)
    .join(', ');

  return `- \`skills/_registry.yml\` is the machine-readable catalog of all ${totalSkills} skills across ${totalDomains} domains: ${domainList}.
- \`agents/_registry.yml\` is the machine-readable catalog of all ${totalAgents} agents.
- \`teams/_registry.yml\` is the machine-readable catalog of all ${totalTeams} teams.
- \`guides/_registry.yml\` is the machine-readable catalog of all ${totalGuides} guides across ${Object.keys(guideCategories).length} categories.

When adding or removing skills, agents, teams, or guides, the corresponding registry must be updated to stay in sync.`;
}

// ── Fully generated files ────────────────────────────────────────

function generateGuidesSection() {
  const categoryOrder = ['workflow', 'infrastructure', 'reference', 'design'];
  const categoryLabels = {
    workflow: 'Workflow',
    infrastructure: 'Infrastructure',
    reference: 'Reference',
    design: 'Design',
  };
  const lines = [];

  for (const catId of categoryOrder) {
    const catGuides = guides.filter((g) => g.category === catId);
    if (catGuides.length === 0) continue;

    lines.push(`**${categoryLabels[catId]}**`);
    lines.push('');
    for (const guide of catGuides) {
      lines.push(
        `- [${guide.title}](guides/${guide.id}.md) — ${guide.description}`
      );
    }
    lines.push('');
  }

  // Remove trailing blank line
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

  return lines.join('\n');
}

function generateGuidesReadme() {
  const categoryOrder = ['workflow', 'infrastructure', 'reference', 'design'];
  const lines = [
    '# Guides',
    '',
    `${totalGuides} guides serving as the human entry point to the agentic system — practical workflows for agents, teams, and skills, plus infrastructure setup and reference material.`,
    '',
  ];

  for (const catId of categoryOrder) {
    const catGuides = guides.filter((g) => g.category === catId);
    if (catGuides.length === 0) continue;
    const catDesc = guideCategories[catId]
      ? guideCategories[catId].description
      : catId;
    const catName = catId[0].toUpperCase() + catId.slice(1);
    lines.push(`## ${catName}`);
    lines.push('');
    lines.push(`*${catDesc}*`);
    lines.push('');
    for (const guide of catGuides) {
      lines.push(`### [${guide.title}](${guide.id}.md)`);
      lines.push(`${guide.description}.`);
      lines.push('');
    }
  }

  return lines.join('\n');
}

function generateVizReadme() {
  return `# Interactive Skills Visualization

Force-graph explorer for the ${totalSkills}-skill, ${totalAgents}-agent, ${totalTeams}-team agent-almanac platform. Nodes are skills, agents, and teams; edges express domain membership and cross-references. Each node renders a domain-colored WebP pictogram produced by an R/ggplot2 icon pipeline. Built with [force-graph](https://github.com/vasturiano/force-graph), 9 color themes, and 5 locales.

## Quick Start

\`\`\`bash
cd viz
npm install
npm run dev        # starts Vite dev server
\`\`\`

The dev server runs at \`http://localhost:5173\`. For a production build:

\`\`\`bash
npm run build      # outputs to viz/dist/
npm run preview    # serves dist/ locally
\`\`\`

## Build Pipeline

The data and icon pipeline is separate from the Vite frontend build. Run it whenever registry content changes:

\`\`\`bash
npm run pipeline   # runs build.sh — the single entry point
\`\`\`

\`build.sh\` executes four steps:

| Step | Command | What it does |
|------|---------|--------------|
| 1 | \`Rscript generate-palette-colors.R\` | Generates palette JSON and JS color data |
| 2 | \`node build-data.js\` | Reads all registries, writes \`public/data/skills.json\` |
| 3 | \`node build-icon-manifest.js\` | Produces icon manifests for skills, agents, and teams |
| 4 | \`Rscript build-all-icons.R\` | Renders standard and HD WebP icons |

Individual stages can be run separately:

\`\`\`bash
npm run build-data      # step 2 only
npm run build-manifest  # step 3 only
npm run build-favicon   # regenerate favicon assets
\`\`\`

## Docker

\`\`\`bash
docker compose up --build
# Open http://localhost:8080
\`\`\`

## Configuration

\`config.yml\` holds platform-specific settings (R path, parallel strategy). Four profiles: default, wsl, windows, docker. Set \`R_CONFIG_ACTIVE=wsl\` to use a non-default profile.

## Related Skills

- [\`audit-icon-pipeline\`](../skills/audit-icon-pipeline/SKILL.md) — verify icon coverage and detect missing glyphs
- [\`create-glyph\`](../skills/create-glyph/SKILL.md) — author a new glyph for a skill, agent, or team icon
- [\`enhance-glyph\`](../skills/enhance-glyph/SKILL.md) — improve an existing glyph's visual quality
- [\`render-icon-pipeline\`](../skills/render-icon-pipeline/SKILL.md) — run the full pipeline end-to-end

## See Also

- [Root README](../README.md) — project overview
- [Understanding the System](../guides/understanding-the-system.md) — how skills, agents, and teams compose
- [Setting Up Your Environment](../guides/setting-up-your-environment.md) — R, Node.js, and WSL2 setup
`;
}

function generateTeamsReadme() {
  return `# Teams

Predefined multi-agent team compositions for coordinated workflows in [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

## Overview

<!-- AUTO:START:teams-intro -->
${generateTeamsIntroStandalone()}
<!-- AUTO:END:teams-intro -->

Teams complement agents and skills:
- **Skills** define *how* (procedure, validation, recovery)
- **Agents** define *who* (persona, tools, domain expertise)
- **Teams** define *who works together* (composition, roles, coordination)

## Available Teams

<!-- AUTO:START:teams-table -->
${generateTeamsTable('')}
<!-- AUTO:END:teams-table -->

## Creating a New Team

1. Copy \`_template.md\` to \`<team-name>.md\`
2. Fill in YAML frontmatter: \`name\`, \`description\`, \`lead\`, \`members[]\`, \`coordination\`
3. Write Purpose, Team Composition, Coordination Pattern, Task Decomposition, and Configuration sections
4. Include a \`<!-- CONFIG:START -->\` / \`<!-- CONFIG:END -->\` block with machine-readable YAML
5. Add the entry to \`_registry.yml\`
6. Run \`npm run update-readmes\` from the project root

## Coordination Patterns

| Pattern | Description | Best For |
|---------|-------------|----------|
| **Hub-and-spoke** | Lead distributes tasks, collects results, synthesizes | Review teams, audit teams |
| **Sequential** | Agents work in a defined order, each building on previous output | Pipeline workflows |
| **Parallel** | All agents work simultaneously on independent subtasks | Independent subtasks |
| **Timeboxed** | Work organized into fixed-length iterations (sprints) | Agile project management |
| **Adaptive** | Team self-organizes dynamically based on the task | Unknown or variable tasks |
| **Wave-parallel** | Tasks grouped into dependency waves; parallel within each wave | Translation campaigns, staged rollouts |
| **Reciprocal** | Two agents alternate focus — one acts, the other holds space | Paired practice, deep review |
| **Synoptic** | All members perceive shared workspace simultaneously; lead integrates into gestalt | Cross-domain synthesis |

## Machine-Readable Configuration

Each team definition includes an embedded configuration block between \`<!-- CONFIG:START -->\` and \`<!-- CONFIG:END -->\` markers. Tooling can extract this YAML to auto-create teams via Claude Code's TeamCreate/SendMessage infrastructure.

## See Also

- [Understanding the System](../guides/understanding-the-system.md) -- how skills, agents, and teams compose
- [Creating Agents and Teams](../guides/creating-agents-and-teams.md) -- designing team compositions and coordination patterns
- [Production Coordination Patterns](../guides/production-coordination-patterns.md) -- real-world multi-agent orchestration
- [Agents Library](../agents/README.md) -- specialist personas that form teams
- [Skills Library](../skills/README.md) -- executable procedures teams follow
- [Root README](../README.md) -- project overview

## Registry

The \`_registry.yml\` file provides programmatic discovery of all teams:

\`\`\`python
import yaml
with open("teams/_registry.yml") as f:
    registry = yaml.safe_load(f)
    for team in registry["teams"]:
        print(f"{team['id']}: {team['lead']} + {len(team['members'])} members")
\`\`\`
`;
}

function generateTestsReadme() {
  const lines = [
    '# Tests',
    '',
    `${totalTests} test scenarios for validating team coordination, agent behavior, and skill execution. The framework covers 7 categories: static validation (CI-automated), structural integrity (CI-automated), coordination patterns, agent behavior, skill execution, negative/edge cases, and integration/composition. Each scenario is evaluated on a 5-dimension rubric (max 25 points) covering accuracy, completeness, coordination fidelity, persona adherence, and actionability.`,
    '',
    'CI workflows (\`validate-skills.yml\`, \`validate-tests.yml\`, \`validate-integrity.yml\`) automate the static checks. The remaining scenarios are executed manually via Claude Code and produce structured results in \`tests/results/\`.',
    '',
    '## Test Scenarios',
    '',
    '| Scenario | Level | Target | Pattern | Description |',
    '|----------|-------|--------|---------|-------------|',
  ];
  for (const test of tests) {
    lines.push(
      `| [${test.id}](${test.path.replace('tests/', '')}) | ${test.test_level} | ${test.target} | ${test.coordination_pattern || '-'} | ${test.description} |`
    );
  }
  lines.push('');
  lines.push('## Running Tests');
  lines.push('');
  lines.push('Use the `test-team-coordination` skill to execute a scenario:');
  lines.push('');
  lines.push('```');
  lines.push('/test-team-coordination');
  lines.push('```');
  lines.push('');
  lines.push('Results are stored in `tests/results/YYYY-MM-DD-<target>-NNN/RESULT.md`.');
  lines.push('');
  lines.push('## Registry');
  lines.push('');
  lines.push('The `_registry.yml` file catalogs all test scenarios and defines coordination pattern key behaviors used during evaluation.');
  lines.push('');
  lines.push('## See Also');
  lines.push('');
  lines.push('- [Understanding the System](../guides/understanding-the-system.md) -- how skills, agents, and teams compose');
  lines.push('- [test-team-coordination](../skills/test-team-coordination/SKILL.md) -- skill for executing test scenarios');
  lines.push('- [Root README](../README.md) -- project overview');
  return lines.join('\n');
}

// ── Translation coverage ─────────────────────────────────────────

function generateTranslationsSection() {
  const i18nDir = resolve(ROOT, 'i18n');
  const configPath = resolve(i18nDir, '_config.yml');
  if (!existsSync(configPath)) {
    return '*No translations configured yet.*';
  }

  const i18nConfig = yaml.load(readFileSync(configPath, 'utf8'));
  const locales = i18nConfig.supported_locales || [];
  const contentTypes = ['skills', 'agents', 'teams', 'guides'];
  // Derive source counts from registries (single source of truth)
  // instead of manually-maintained i18n/_config.yml source_counts
  const sourceCounts = {
    skills: totalSkills,
    agents: totalAgents,
    teams: totalTeams,
    guides: totalGuides,
    total: totalSkills + totalAgents + totalTeams + totalGuides
  };

  if (locales.length === 0) {
    return '*No translations configured yet.*';
  }

  const rows = [];
  rows.push('| Locale | Language | Skills | Agents | Teams | Guides | Total |');
  rows.push('|--------|----------|--------|--------|-------|--------|-------|');

  for (const locale of locales) {
    const localeDir = resolve(i18nDir, locale.code);
    const counts = {};
    let total = 0;

    for (const ct of contentTypes) {
      const typeDir = resolve(localeDir, ct);
      let count = 0;
      if (existsSync(typeDir)) {
        const entries = readdirSync(typeDir);
        for (const entry of entries) {
          const entryPath = resolve(typeDir, entry);
          if (ct === 'skills') {
            if (statSync(entryPath).isDirectory() && existsSync(resolve(entryPath, 'SKILL.md'))) {
              count++;
            }
          } else {
            if (entry.endsWith('.md')) count++;
          }
        }
      }
      counts[ct] = count;
      total += count;
    }

    const totalSource = sourceCounts.total || 409;
    const pct = totalSource > 0 ? Math.round((total / totalSource) * 1000) / 10 : 0;
    rows.push(
      `| ${locale.code} | ${locale.name} | ${counts.skills}/${sourceCounts.skills || 0} | ${counts.agents}/${sourceCounts.agents || 0} | ${counts.teams}/${sourceCounts.teams || 0} | ${counts.guides}/${sourceCounts.guides || 0} | ${total}/${totalSource} (${pct}%) |`
    );
  }

  return rows.join('\n');
}

// ── Main ─────────────────────────────────────────────────────────

let staleCount = 0;

function run(label, changed) {
  if (changed) {
    staleCount++;
    console.log(`${CHECK_MODE ? 'STALE' : 'UPDATED'}: ${label}`);
  } else {
    console.log(`OK: ${label}`);
  }
}

// README.md (abbreviated — full tables live in sub-READMEs)
run(
  'README.md',
  processFile(resolve(ROOT, 'README.md'), {
    stats: generateStats,
    guides: generateGuidesSection,
    translations: generateTranslationsSection,
  })
);

// skills/README.md
run(
  'skills/README.md',
  processFile(resolve(ROOT, 'skills/README.md'), {
    'skills-intro': generateSkillsIntroStandalone,
    'skills-table': () => generateSkillsTable(''),
  })
);

// agents/README.md
run(
  'agents/README.md',
  processFile(resolve(ROOT, 'agents/README.md'), {
    'agents-intro': generateAgentsIntroStandalone,
    'agents-table': () => generateAgentsTable(''),
  })
);

// CLAUDE.md
run(
  'CLAUDE.md',
  processFile(resolve(ROOT, 'CLAUDE.md'), {
    overview: generateOverview,
    registries: generateRegistries,
  })
);

// guides/README.md (fully generated)
run(
  'guides/README.md',
  writeGeneratedFile(resolve(ROOT, 'guides/README.md'), generateGuidesReadme())
);

// viz/README.md (fully generated)
run(
  'viz/README.md',
  writeGeneratedFile(resolve(ROOT, 'viz/README.md'), generateVizReadme())
);

// teams/README.md (fully generated)
run(
  'teams/README.md',
  writeGeneratedFile(resolve(ROOT, 'teams/README.md'), generateTeamsReadme())
);

// tests/README.md (fully generated)
run(
  'tests/README.md',
  writeGeneratedFile(resolve(ROOT, 'tests/README.md'), generateTestsReadme())
);

// Summary
console.log(
  `\nStats: ${totalSkills} skills, ${totalDomains} domains, ${totalAgents} agents, ${totalTeams} teams, ${totalGuides} guides, ${totalTests} tests`
);

if (CHECK_MODE && staleCount > 0) {
  console.error(`\n${staleCount} file(s) are stale. Run "npm run update-readmes" to fix.`);
  process.exit(1);
} else if (CHECK_MODE) {
  console.log('\nAll files are up to date.');
} else if (staleCount > 0) {
  console.log(`\n${staleCount} file(s) updated.`);
} else {
  console.log('\nNo changes needed.');
}
