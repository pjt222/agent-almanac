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
import * as yaml from 'js-yaml';
import { CONTENT_TYPES } from './lib/content-types.js';
import { isTemplateSegment } from './lib/content-paths.js';
import { listAdapters } from '../cli/adapters/index.js';
import { guideCategoryOrder, guideCategoryLabel, guideCategoryNames } from './lib/guide-categories.js';
import { applySections, renderTranslationsTable, renderLocaleTable } from './lib/readme-sections.js';
import { loadRegistry as loadToolsRegistry, renderClaudeBlock as renderToolsIndex, renderReadmeTable as renderToolsTable } from './lib/tools-registry.js';
import { skillsDeclaringBash, nonDocumentationFiles, contentTrees, shippedEntries, extensionOf, executableFiles, assertInventoryClaims, REPO_ONLY } from './lib/skills-inventory.js';


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
const totalCoordinationPatterns = new Set(
  teams.map((t) => t.coordination).filter(Boolean)
).size;
const i18nConfigPath = resolve(ROOT, 'i18n/_config.yml');
const supportedLocales = existsSync(i18nConfigPath)
  ? yaml.load(readFileSync(i18nConfigPath, 'utf8')).supported_locales || []
  : [];
const localeCodes = supportedLocales.map((l) => l.code);
const totalLocales = localeCodes.length;

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
 * Sections whose AUTO markers were missing, collected across every processed file.
 *
 * Module-level because `replaceSection` is called in a fold over the section map, and the
 * marker case has to survive that fold without changing the shape every generator returns.
 */
const missingMarkers = [];

/**
 * Process a file: apply all section replacements, write if changed.
 * Returns true if the file content differs from disk.
 */
function processFile(filePath, sections) {
  const original = readFileSync(filePath, 'utf8');
  // The fold AND the miss policy both live in the lib. Keeping the policy here meant the
  // "a missing marker is fatal" wiring sat in a file no test can import: deleting one line
  // left every gate green, which is the defect this file's own comments narrate.
  const { content, missing } = applySections(original, sections);
  missingMarkers.push(...missing);
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
    // Derived, not enumerated (#647). This line read "workflow, infrastructure, and reference"
    // — three of the five categories on disk, written when there were three. It is the same
    // drift class as #644's hardcoded category order, and it is why every count on this page
    // comes from a registry: a literal list is correct exactly once.
    `- **${totalGuides} guides** — human-readable documentation across ${guideCategoryNames(guideCategories, guides)}`,
    `- **Interactive visualization** — force-graph explorer with ${totalSkills} R-generated skill icons and 9 color themes`,
  ];
  return lines.join('\n');
}

// Directory Map tree (root README) — every count derived from registries.
function generateDirMap() {
  const rows = [
    ['.claude-plugin/', 'Plugin manifest for Claude Code plugin installation'],
    ['skills/', `${totalSkills} executable procedures across ${totalDomains} domains`],
    ['agents/', `${totalAgents} specialist personas`],
    ['teams/', `${totalTeams} multi-agent compositions with ${totalCoordinationPatterns} coordination patterns`],
    ['guides/', `${totalGuides} human-readable reference docs`],
    ['viz/', 'Interactive force-graph explorer with R-generated icons'],
    ['tests/', `${totalTests} test scenarios for validation`],
    ['i18n/', `Translations (${totalLocales} locales: ${localeCodes.join(', ')})`],
    ['cli/', 'Universal installer CLI (npm install -g agent-almanac)'],
    ['scripts/', 'Build and CI automation'],
    ['sessions/', 'Tending session archives'],
  ];
  const body = rows.map(([p, d]) => `  ${p.padEnd(15)}  ${d}`).join('\n');
  return ['```', 'agent-almanac/', body, '```'].join('\n');
}

// Plugin install discovery sentence (root README).
function generatePluginDiscovery() {
  return `Auto-discovers all ${totalSkills} skills and ${totalAgents} agents. To use a team, read its definition in \`teams/<name>.md\` and spawn each listed member as a subagent via the [Agent tool](guides/creating-agents-and-teams.md) (\`subagent_type\`), coordinating them with SendMessage under the session's single implicit team. Windows / macOS variants in the [Installation guide](guides/installation.md#phase-1--plugin-install-claude-code-native).`;
}

// Plugin Packaging discovery table (root README).
function generatePluginTable() {
  return [
    '| Component | Discovery | Count |',
    '|-----------|-----------|-------|',
    `| Skills | \`skills/*/SKILL.md\` | ${totalSkills} |`,
    `| Agents | \`agents/*.md\` | ${totalAgents} |`,
    `| Teams | Bundled but not auto-discovered | ${totalTeams} |`,
  ].join('\n');
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
  rows.push('|---|---|---|');
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
  rows.push('|---|---|---|');
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
  rows.push('|---|---|---|---|---|');
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
  return `A documentation-first repository containing ${totalGuides} guides, a skills library of ${totalSkills} agentic skills, ${totalAgents} agent definitions, ${totalTeams} team compositions, and a curated set of code-driven workflow orchestration scripts, following the [Agent Skills open standard](https://agentskills.io). Almost all content is markdown and YAML; workflows are self-contained \`.mjs\` scripts run by Claude Code's Workflow tool.

The guides serve as the human entry point to the agentic system: practical walkthroughs explaining when, why, and how to interact with agents, teams, skills, and workflows through Claude Code.`;
}

// Quick-reference "Available teams:" roster (guides/quick-reference.md) —
// derived from teams/_registry.yml so it can never drift out of sync.
function generateQuickRefTeams() {
  return `Available teams: ${teams.map((t) => t.id).join(', ')}.`;
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

// The tools catalogue: read through the same dependency-free reader validate-integrity.sh
// uses, so the index CLAUDE.md renders and the parity gate cannot disagree about a row. A
// registry that fails its own schema is refused here too — rendering an index from a broken
// catalogue would be the silent drift the catalogue exists to end.
function toolsRegistryOrThrow() {
  const reg = loadToolsRegistry(ROOT);
  if (reg.errors.length) throw new Error(`tools/_registry.yml has schema errors; run \`npm run check:tools-registry\`:\n  ${reg.errors.join('\n  ')}`);
  return reg.entries;
}

function generateToolsIndex() {
  return renderToolsIndex(toolsRegistryOrThrow());
}

function generateToolsTable() {
  return renderToolsTable(toolsRegistryOrThrow());
}

// ── Fully generated files ────────────────────────────────────────

function generateGuidesSection() {
  const categoryOrder = guideCategoryOrder(guideCategories, guides);
  const lines = [];

  for (const catId of categoryOrder) {
    const catGuides = guides.filter((g) => g.category === catId);
    if (catGuides.length === 0) continue;

    lines.push(`**${guideCategoryLabel(catId)}**`);
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
  const categoryOrder = guideCategoryOrder(guideCategories, guides);
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
    const catName = guideCategoryLabel(catId);
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

\`build.sh\` executes five steps in order (do not run these individually — \`build.sh\` handles platform detection and R binary selection):

| Step | Command (run by build.sh) | What it does |
|---|---|---|
| 1 | \`$RSCRIPT generate-palette-colors.R\` | Generates palette JSON and JS color data |
| 2 | \`node build-data.js\` | Reads all registries, writes \`public/data/skills.json\` |
| 3 | \`node build-icon-manifest.js\` | Produces icon manifests for skills, agents, and teams |
| 4 | \`$RSCRIPT build-all-icons.R\` | Renders standard and HD WebP icons |
| 5 | \`node build-terminal-glyphs.js\` | Generates CLI glyph data from agent icons |

Node stages can be run separately (they don't need platform detection):

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
|---|---|---|
| **Hub-and-spoke** | Lead distributes tasks, collects results, synthesizes | Review teams, audit teams |
| **Sequential** | Agents work in a defined order, each building on previous output | Pipeline workflows |
| **Parallel** | All agents work simultaneously on independent subtasks | Independent subtasks |
| **Timeboxed** | Work organized into fixed-length iterations (sprints) | Agile project management |
| **Adaptive** | Team self-organizes dynamically based on the task | Unknown or variable tasks |
| **Wave-parallel** | Tasks grouped into dependency waves; parallel within each wave | Translation campaigns, staged rollouts |
| **Reciprocal** | Two agents alternate focus — one acts, the other holds space | Paired practice, deep review |
| **Synoptic** | All members perceive shared workspace simultaneously; lead integrates into gestalt | Cross-domain synthesis |

## Machine-Readable Configuration

Each team definition includes an embedded configuration block between \`<!-- CONFIG:START -->\` and \`<!-- CONFIG:END -->\` markers. Tooling can extract this YAML to activate a team — spawn each listed member as a subagent via the Agent tool (\`subagent_type\`) and coordinate them with SendMessage under the session's single implicit team. (\`TeamCreate\` is a gated FleetView/cloud-only fallback, not the path for ordinary interactive sessions.)

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
    '|---|---|---|---|---|',
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
  lines.push('```text');
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

// A file existing under i18n/<locale>/ says a scaffold was created, not that
// anyone translated it. Counting files is what made this table read
// `de 383/500 (76.6%)` while i18n/de/translation_status.yml said
// `347/500 (69.4%)` -- every cell was exactly `translated + stubs` (#560).
// So the numbers below come from the status files, which judge content, and
// `stubs` gets its own column: the point is not a smaller number, it is an
// honest split. Existence counting survives only as the fallback for a locale
// with no status file, and such a cell is marked so an unmeasured number is
// never presented as measured.
//
// Every figure is rendered VERBATIM from the YAML, including denominators and
// pct. Recomputing pct here with different rounding than
// generate-translation-status.js would be the same two-derivations defect
// rebuilt inside a single cell. scripts/check-readme-translation-parity.js
// gates the result by parsing both committed artifacts -- it never calls this
// function, or it would agree with any bug in it.
//
// Ordering matters in .github/workflows/update-readmes.yml: `npm run
// translation:status` must run BEFORE this generator, or the table renders
// last cycle's numbers and the same commit overwrites the file it read.

function countExistingTranslations(localeDir, contentTypes) {
  const counts = {};
  let total = 0;
  for (const ct of contentTypes) {
    const typeDir = resolve(localeDir, ct);
    let count = 0;
    if (existsSync(typeDir)) {
      for (const entry of readdirSync(typeDir)) {
        const entryPath = resolve(typeDir, entry);
        if (ct === 'skills') {
          if (statSync(entryPath).isDirectory() && existsSync(resolve(entryPath, 'SKILL.md'))) count++;
        } else if (entry.endsWith('.md')) {
          count++;
        }
      }
    }
    counts[ct] = count;
    total += count;
  }
  return { counts, total };
}

/**
 * Read `i18n/_config.yml` and each locale's `translation_status.yml`.
 *
 * One reader for both translation tables, so the root README and `i18n/README.md` cannot
 * disagree about what a locale's numbers are — they are two views of one read.
 */
function loadLocaleCoverage() {
  const i18nDir = resolve(ROOT, 'i18n');
  const configPath = resolve(i18nDir, '_config.yml');
  if (!existsSync(configPath)) return null;
  const locales = (yaml.load(readFileSync(configPath, 'utf8')) || {}).supported_locales || [];
  return locales.map((locale) => {
    const localeDir = resolve(i18nDir, locale.code);
    const statusPath = resolve(localeDir, 'translation_status.yml');
    return {
      code: locale.code,
      name: locale.name,
      localeDir,
      coverage: existsSync(statusPath)
        ? (yaml.load(readFileSync(statusPath, 'utf8')) || {}).coverage
        : null,
    };
  });
}

function generateI18nLocalesSection() {
  const records = loadLocaleCoverage();
  if (!records || records.length === 0) return '*No translations configured yet.*';
  return renderLocaleTable(records, CONTENT_TYPES);
}

function generateTranslationsSection() {
  // ONE read, shared with generateI18nLocalesSection. The first version of #569 added
  // loadLocaleCoverage, used it for the i18n table only, and left this function doing its own
  // duplicate read — while the commit message and PR body both claimed "one read feeding BOTH
  // tables". A stated invariant that the code does not implement is worse than no claim: it
  // is what a later reader relies on. Caught in review.
  const records = loadLocaleCoverage();
  if (!records || records.length === 0) {
    return '*No translations configured yet.*';
  }

  const contentTypes = CONTENT_TYPES;
  // Fallback denominators only. Measured rows take theirs from the status
  // file, so the two surfaces cannot disagree about the denominator either.
  // Registry drift stays guarded by integrity checks A4/A5.
  const sourceCounts = {
    skills: totalSkills,
    agents: totalAgents,
    teams: totalTeams,
    guides: totalGuides,
    total: totalSkills + totalAgents + totalTeams + totalGuides
  };

  // Rendering lives in the lib; this function only adds the fallback counts, which the
  // i18n table does not need. That split is the whole of #566: the core line of #560's fix
  // could be deleted with the entire suite staying green, because this logic sat inside a
  // module that cannot be imported without writing nine files.
  const localeRecords = records.map((record) => ({
    code: record.code,
    name: record.name,
    coverage: record.coverage,
    // Computed for every locale, including measured ones. Cheap, and it keeps the
    // measured/fallback PREDICATE in one place rather than splitting it across the
    // caller and the renderer.
    fallback: countExistingTranslations(record.localeDir, contentTypes),
  }));

  return renderTranslationsTable(localeRecords, sourceCounts, contentTypes);
}

/**
 * SECURITY.md's content inventory — every count derived, and the PREDICATE stated (#600).
 *
 * Three claims in that file had gone stale, and two of them were hand-maintained copies of
 * numbers a registry already owns: "~60% of skills (177 of 297) include `Bash`" against a
 * registry recording 370, and "`scripts/`: A Node.js script for README generation from
 * registries" against a directory of 33 files including three that mutate the working tree on
 * purpose.
 *
 * They drifted AGAIN between #600 being filed and being fixed, and the review caught this
 * paragraph getting the drift wrong. The Bash NUMERATOR did not move — 228 then, 228 now. The
 * denominator did, 369 -> 370. And the one that moved most is the one the sentence omitted:
 * `scripts/` went 27 -> 33 while the issue was open. Six tools added, none of which would have
 * prompted anyone to edit a sentence in SECURITY.md.
 *
 * That is the argument for generating rather than re-typing, and it was sitting unquoted in the
 * paragraph making the argument.
 *
 * The Bash figure is the one that needed a definition more than a refresh. `SECURITY.md` quoted
 * a count with no stated predicate, so nobody — including its author — could check it. Two
 * spellings exist in the corpus and a naive grep sees one:
 *
 *   allowed-tools: Read Write Edit Bash Grep Glob     inline, 228 files
 *   allowed-tools:\n  - Bash\n  - Read               block, 1 file
 *
 * and `skills/_template/SKILL.md` declares Bash while not being a skill. Enumerating the
 * REGISTRY rather than the directory excludes it by construction — the same reason the shipped
 * package excludes it (#669).
 *
 * The CodeQL schedule is deliberately NOT generated. It lives in GitHub's server-managed default
 * setup, so deriving it would need a network call and `check-readmes` would fail offline and in
 * any fork without credentials. It is written as prose with the command that checks it, which is
 * the honest form for a fact this repository does not own.
 */
function generateSecuritySurface() {
  // Extracted to `lib/skills-inventory.js` (#691 finding 3) so the registry-not-directory
  // property can be tested: this file executes its whole pipeline on import, so nothing
  // living here can be. A registry id with no SKILL.md now THROWS rather than counting as
  // non-declaring — see that module's header, and #700 for the upstream registry gap.
  const { ids, declaring } = skillsDeclaringBash(ROOT, domains);
  const share = Math.round((declaring / ids.length) * 100);
  const scriptFiles = readdirSync(resolve(ROOT, 'scripts'))
    .filter((f) => f.endsWith('.js') || f.endsWith('.sh') || f.endsWith('.mjs')).length;

  // DERIVED from the adapter registry, not listed by hand (#686 review). The hand-written
  // version named 5 of 13 adapters and described them all as symlinking into home directories:
  // four install strategies exist and several adapters install at PROJECT scope. A researcher
  // scoping filesystem effects from that list would have tested a third of the surface and
  // signed off — the exact misdirection #600 was filed about, in freshly authored text.
  //
  // Importing the registry also puts `cli/adapters/` on this generator's import graph, so
  // `check:generator-inputs` starts guarding it without anyone remembering to.
  const adapters = listAdapters();
  const strategies = [...new Set(adapters.map((a) => a.strategy))].sort();
  const strategyPhrase = strategies.length === 1
    ? strategies[0]
    : `${strategies.slice(0, -1).join(', ')} and ${strategies[strategies.length - 1]}`;

  // The two claims here a machine can check, checked. Static prose inside AUTO markers borrows
  // the authority of the generated numbers around it without earning it: if `scripts/` were ever
  // added to `files`, or one of the three named tools renamed, the section would keep asserting
  // a falsehood and `check-readmes` would stay green (#686 review).
  // `workflows/` is executable content a user is TOLD to copy and run, and the inventory omitted
  // it entirely — a larger gap, for a section scoping executable content, than the `scripts/`
  // mis-description #600 was filed about (#691). `_template.mjs` is excluded the same way
  // `skills/_template/` is: it is scaffolding, not a workflow.
  // `!f.startsWith('_')` before #672. The comment above states the TEMPLATE intent while the
  // code tested the `_`-prefix convention, so a future `workflows/_draft.mjs` would have gone
  // uncounted under a sentence that describes scaffolding as the only exclusion. No-op today:
  // `_template.mjs` is the sole `_`-prefixed entry in `workflows/`.
  const workflowFiles = readdirSync(resolve(ROOT, 'workflows'))
    .filter((f) => f.endsWith('.mjs') && !isTemplateSegment(f)).length;

  const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
  const shipped = pkg.files || [];
  if (shipped.some((f) => f.replace(/^!/, '').startsWith('scripts'))) {
    throw new Error('SECURITY.md claims scripts/ does not ship, but package.json `files` says otherwise');
  }
  // The workflows claim is checkable too: if `workflows/` were ever added to `files`, the
  // sentence saying it does not ship would keep passing `check-readmes` while being false.
  if (shipped.some((f) => f.replace(/^!/, '').startsWith('workflows'))) {
    throw new Error('SECURITY.md claims workflows/ does not ship, but package.json `files` says otherwise');
  }
  // The sentence and its guard read from ONE list, in `lib/skills-inventory.js`, where a
  // test can reach the guard. They were two lists for one revision, and the guard covered
  // two of the four names the sentence made — mixed authority, where a reader seeing two
  // throws infers the whole sentence is machine-checked.
  assertInventoryClaims(ROOT);
  for (const tool of ['normalize-i18n-fences.js', 'mutation-check.js', 'gate-envelope.js']) {
    if (!existsSync(resolve(ROOT, 'scripts', tool))) {
      throw new Error(`SECURITY.md names scripts/${tool}, which does not exist`);
    }
  }
  // WHICH ARTIFACT (#696). Every bullet below is computed from the checked-out tree, while
  // what `npm install` serves can lag arbitrarily — measured at the time of writing: the
  // registry's `latest` was 1.3.0 against a `package.json` of 1.9.0, six minors and 24
  // `cli/` commits apart. A researcher reading this, installing from npm, and reporting what
  // they found would have been reporting against months-old code with no way to tell from
  // either the document or the package which one they were looking at.
  //
  // Derived, not hand-written, and derived WITHOUT git or the network: `check-readmes` runs
  // offline and in forks without credentials, and a shallow clone makes `git tag` lie. The
  // version comes from `package.json` and the shipped set from its own `files` array, so the
  // sentence stays true whether 1.9.0 is eventually recovered, superseded or abandoned —
  // none of which is decided here.
  //
  // It scopes the WHOLE inventory rather than the CLI bullet alone. `files` ships four
  // content trees beside `cli/`, so "228 of 370 skills declare Bash" carries the identical
  // staleness risk as the adapter list; a per-bullet caveat would have to be repeated on
  // every shipped bullet, which is the multi-site drift class this repository keeps paying
  // for elsewhere.
  //
  // It enumerates FILES as well as directories. An earlier version filtered `files` to
  // entries ending in `/`, which silently dropped `cli/index.js` — the file
  // `npx agent-almanac` executes — so the sentence told a researcher that a vulnerability
  // in the entry point was "against the repository only". #600's failure mode, in the
  // prose written to prevent it.
  const shippedList = shippedEntries(ROOT).included;
  const treeNames = contentTrees(ROOT);
  const treeLabel = treeNames.map((t) => t[0].toUpperCase() + t.slice(1)).join(', ');
  const nonDoc = nonDocumentationFiles(ROOT);
  const nonDocExtensions = [...new Set(nonDoc.map(extensionOf).filter(Boolean))].sort();
  // DERIVED, not named. A hardcoded `verify_runtime.py` inside a generated sentence is the
  // exact defect this function polices ten lines up, where three `scripts/` tools get
  // `existsSync` throws for being static prose among generated numbers. Deleting that one
  // file — registry and SKILL.md untouched, so nothing throws and every gate stays green —
  // would have had the HEALER regenerate and auto-commit "15 files … including
  // verify_runtime.py": a false claim in a security document, produced by the machinery.
  const executable = executableFiles(nonDoc, ROOT);

  return [
    `**Which artifact this describes.** Everything below is derived from **the repository at this revision**, whose \`package.json\` declares version \`${pkg.version ?? '(unset)'}\`. That is not necessarily what \`npm install ${pkg.name ?? '(unnamed)'}\` installs — the published version can lag this tree, and has. Check with \`npm view ${pkg.name ?? '(unnamed)'} version\`. What ships, from \`package.json\`'s own \`files\`: ${shippedList.map((t) => `\`${t}\``).join(', ')}. \`package.json\` ships too — npm always includes it — and it declares no \`preinstall\`/\`install\`/\`postinstall\` hooks, so nothing here executes on install. Everything else described below (${REPO_ONLY.map((d) => `\`${d}/\``).join(', ')}) exists only in the repository. A vulnerability report against an npm-installed copy is in scope for the shipped list, and may be against older code than this document describes.`,
    '',
    `- **${treeLabel}**: ${nonDoc.length === 0 ? 'Markdown and YAML only' : `mostly Markdown and YAML, plus **${nonDoc.length} files that are not** (${nonDocExtensions.join(', ')})${executable.length ? ` — ${executable.length === 1 ? 'one of them an executable script, ' : `${executable.length} of them executable scripts: `}${executable.map((f) => `\`${f}\``).join(', ')}` : ''}`}. All of it ships. ${declaring} of ${ids.length} skills (~${share}%) declare \`Bash\` in their \`allowed-tools\`, meaning they instruct AI agents to execute shell commands when followed. Review any skill before letting an agent execute it.`,
    '- **Visualization pipeline** (`viz/`): A containerized R + Node.js + Vite build system with a Dockerfile, shell scripts, and an icon rendering pipeline. The Docker entrypoint serves content via a Python HTTP server.',
    `- **Scripts** (\`scripts/\`): ${scriptFiles} top-level Node.js and shell tools — registry validation, README and translation generation, i18n gates, and a small number that deliberately mutate the working tree or run repository commands (\`normalize-i18n-fences.js\`, \`mutation-check.js\`, \`gate-envelope.js\`). Maintainer-invoked; \`scripts/\` is not in \`package.json\`'s \`files\` array, so none of it ships in the published package.`,
    `- **CLI** (\`cli/\`): The entry point \`npx\` executes (\`bin\` -> \`cli/index.js\`), and the only component that writes outside this repository. ${adapters.length} adapters install content into other tools' configuration directories, at global (home) or PROJECT scope depending on the adapter and the \`--scope\` flag, using ${strategyPhrase}. Adapters: ${adapters.map((a) => a.id).sort().join(', ')}.`,
    `- **Workflows** (\`workflows/\`): ${workflowFiles} executable orchestration scripts. They are not auto-installed and do not ship in the published package; the documented way to use one is to COPY its \`.mjs\` into \`.claude/workflows/\` by hand, after which Claude Code's Workflow tool runs it and it may spawn subagents with whatever tools those agents carry. Read one before copying it — that instruction is the whole security boundary.`,
    '- **Claude Code configuration** (`.claude/`): Agent discovery symlinks and permission settings.',
  ].join('\n');
}

// ── Main ─────────────────────────────────────────────────────────

// Single source of truth for every file this script manages. Each entry's
// `path` is the repo-relative output path (single-quoted literal — integrity
// check A8 static-parses this array, and `--list-outputs` prints it) and
// `make` is a thunk that regenerates the file when invoked with the absolute
// path. Keeping path and generator in one entry removes the label-vs-path
// divergence class (#362).
const MANAGED = [
  // README.md (abbreviated — full tables live in sub-READMEs)
  { path: 'README.md', make: (p) => processFile(p, {
    stats: generateStats,
    'plugin-discovery': generatePluginDiscovery,
    dirmap: generateDirMap,
    'plugin-table': generatePluginTable,
    guides: generateGuidesSection,
    translations: generateTranslationsSection,
  }) },
  { path: 'skills/README.md', make: (p) => processFile(p, {
    'skills-intro': generateSkillsIntroStandalone,
    'skills-table': () => generateSkillsTable(''),
  }) },
  { path: 'agents/README.md', make: (p) => processFile(p, {
    'agents-intro': generateAgentsIntroStandalone,
    'agents-table': () => generateAgentsTable(''),
  }) },
  { path: 'CLAUDE.md', make: (p) => processFile(p, {
    overview: generateOverview,
    registries: generateRegistries,
    tools: generateToolsIndex,
  }) },
  // Marker-based: the compact table is generated from tools/_registry.yml; the long-form
  // paragraphs and the Running block below it are hand-written and stay so.
  { path: 'tools/README.md', make: (p) => processFile(p, {
    'tools-table': generateToolsTable,
  }) },
  // AUTO section: teams roster
  { path: 'guides/quick-reference.md', make: (p) => processFile(p, {
    'quickref-teams': generateQuickRefTeams,
  }) },
  // Fully generated files
  { path: 'guides/README.md', make: (p) => writeGeneratedFile(p, generateGuidesReadme()) },
  { path: 'viz/README.md', make: (p) => writeGeneratedFile(p, generateVizReadme()) },
  { path: 'teams/README.md', make: (p) => writeGeneratedFile(p, generateTeamsReadme()) },
  { path: 'tests/README.md', make: (p) => writeGeneratedFile(p, generateTestsReadme()) },
  // Marker-based, not fully generated: the rest of i18n/README.md is a hand-written
  // contributor guide. Only the locale table is derived. Its markers MUST exist or the run
  // exits 2 — see the missingMarkers block below.
  { path: 'i18n/README.md', make: (p) => processFile(p, {
    'i18n-locales': generateI18nLocalesSection,
  }) },
  // #600: the content inventory only. The rest of SECURITY.md — the licence disclaimer, the
  // reporting route, the scanning notes — is hand-written policy and stays that way.
  { path: 'SECURITY.md', make: (p) => processFile(p, {
    'security-surface': generateSecuritySurface,
  }) },
];

// --list-outputs: print managed output paths (one per line) and exit without
// generating anything. Consumed by tooling that needs the authoritative list
// (e.g. auto-commit file_pattern maintenance).
if (process.argv.includes('--list-outputs')) {
  for (const entry of MANAGED) console.log(entry.path);
  process.exit(0);
}

let staleCount = 0;

function run(label, changed) {
  if (changed) {
    staleCount++;
    console.log(`${CHECK_MODE ? 'STALE' : 'UPDATED'}: ${label}`);
  } else {
    console.log(`OK: ${label}`);
  }
}

for (const entry of MANAGED) {
  run(entry.path, entry.make(resolve(ROOT, entry.path)));
}

// Summary
console.log(
  `\nStats: ${totalSkills} skills, ${totalDomains} domains, ${totalAgents} agents, ${totalTeams} teams, ${totalGuides} guides, ${totalTests} tests`
);

// Fatal in BOTH modes, and before the staleness verdict. A missing marker is not staleness —
// regenerating cannot fix it, because there is nowhere to put the content — so reporting it as
// stale would send a maintainer to a command that exits 0 and changes nothing. It also must
// not be reachable in write mode: the auto-commit job would otherwise commit a file whose
// section silently stopped being generated.
if (missingMarkers.length) {
  console.error(`\nERROR: AUTO markers missing for: ${[...new Set(missingMarkers)].join(', ')}`);
  console.error('Those sections are no longer generated by anything, and regenerating cannot');
  console.error('restore them. Put the <!-- AUTO:START:name --> / <!-- AUTO:END:name --> pair back.');
  process.exit(2);
}

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
