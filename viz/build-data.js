#!/usr/bin/env node
// build-data.js
// Parses skills/_registry.yml, agents/_registry.yml, and teams/_registry.yml
// to produce viz/data/skills.json with nodes, links, domains, and meta.
// put id:"read_registries", label:"Read YAML registries", node_type:"input", output:"skill_map"
// put id:"parse_skills", label:"Parse skill nodes & cross-reference links", input:"skill_map", output:"skills_with_links"
// put id:"parse_agents", label:"Parse agent nodes & agent-skill links", input:"skills_with_links", output:"agents_linked"
// put id:"parse_teams", label:"Parse team nodes & team-agent links", input:"agents_linked", output:"teams_linked"
// put id:"write_json", label:"Write public/data/skills.json", node_type:"output", input:"merged_graph", output:"public/data/skills.json"

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { smartTitleCase } from './js/title-case.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SKILLS_DIR = resolve(__dirname, '..', 'skills');
const AGENTS_DIR = resolve(__dirname, '..', 'agents');
const TEAMS_DIR = resolve(__dirname, '..', 'teams');
const I18N_DIR = resolve(__dirname, '..', 'i18n');
const I18N_CONFIG_PATH = resolve(I18N_DIR, '_config.yml');
const REGISTRY_PATH = resolve(SKILLS_DIR, '_registry.yml');
const AGENTS_REGISTRY_PATH = resolve(AGENTS_DIR, '_registry.yml');
const TEAMS_REGISTRY_PATH = resolve(TEAMS_DIR, '_registry.yml');
const OUTPUT_PATH = resolve(__dirname, 'public', 'data', 'skills.json');

// ── Build locale index from i18n directory ──────────────────────
function buildLocaleIndex() {
  const localeIndex = new Map();  // nodeId -> string[] of locale codes
  const localeCodes = [];

  if (!existsSync(I18N_CONFIG_PATH)) {
    console.warn('WARN: i18n/_config.yml not found, skipping locale index');
    return { localeIndex, localeCodes };
  }

  const config = yaml.load(readFileSync(I18N_CONFIG_PATH, 'utf8'));
  for (const loc of config.supported_locales || []) {
    if (loc.status === 'active') localeCodes.push(loc.code);
  }

  for (const code of localeCodes) {
    const localeDir = resolve(I18N_DIR, code);

    // Scan skills: i18n/<locale>/skills/*/SKILL.md
    const skillsDir = resolve(localeDir, 'skills');
    if (existsSync(skillsDir)) {
      for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
        if (entry.isDirectory() && existsSync(resolve(skillsDir, entry.name, 'SKILL.md'))) {
          const nodeId = entry.name;
          if (!localeIndex.has(nodeId)) localeIndex.set(nodeId, []);
          localeIndex.get(nodeId).push(code);
        }
      }
    }

    // Scan agents: i18n/<locale>/agents/*.md
    const agentsDir = resolve(localeDir, 'agents');
    if (existsSync(agentsDir)) {
      for (const entry of readdirSync(agentsDir, { withFileTypes: true })) {
        if (entry.isFile() && entry.name.endsWith('.md')) {
          const nodeId = `agent:${entry.name.replace(/\.md$/, '')}`;
          if (!localeIndex.has(nodeId)) localeIndex.set(nodeId, []);
          localeIndex.get(nodeId).push(code);
        }
      }
    }

    // Scan teams: i18n/<locale>/teams/*.md
    const teamsDir = resolve(localeDir, 'teams');
    if (existsSync(teamsDir)) {
      for (const entry of readdirSync(teamsDir, { withFileTypes: true })) {
        if (entry.isFile() && entry.name.endsWith('.md')) {
          const nodeId = `team:${entry.name.replace(/\.md$/, '')}`;
          if (!localeIndex.has(nodeId)) localeIndex.set(nodeId, []);
          localeIndex.get(nodeId).push(code);
        }
      }
    }
  }

  return { localeIndex, localeCodes };
}

// ── Build locale index ──────────────────────────────────────────
const { localeIndex, localeCodes } = buildLocaleIndex();

// ── Parse registry ──────────────────────────────────────────────
// put id:"parse_registry", label:"Parse skills/_registry.yml into skill map", input:"skill_map", output:"skill_map_parsed"
const registry = yaml.load(readFileSync(REGISTRY_PATH, 'utf8'));
const skillMap = new Map();          // id -> node object
const validIds = new Set();

for (const [domainName, domainObj] of Object.entries(registry.domains)) {
  for (const skill of domainObj.skills) {
    validIds.add(skill.id);
    skillMap.set(skill.id, {
      id: skill.id,
      domain: domainName,
      complexity: skill.complexity,
      language: skill.language,
      registryDescription: skill.description,
      path: skill.path,
    });
  }
}

// ── Parse each SKILL.md ─────────────────────────────────────────
// put id:"extract_skill_details", label:"Extract titles, tags & related-skill links from SKILL.md files", input:"skill_map_parsed", output:"skills_with_links"
const nodes = [];
const links = [];

for (const [id, meta] of skillMap) {
  const skillPath = resolve(SKILLS_DIR, meta.path);
  if (!existsSync(skillPath)) {
    console.warn(`WARN: ${meta.path} not found, skipping`);
    continue;
  }

  const raw = readFileSync(skillPath, 'utf8').replace(/\r\n/g, '\n');

  // ── Extract display title (first # heading after frontmatter) ──
  let title = id;
  const titleMatch = raw.match(/^---[\s\S]*?---\s*\n#\s+(.+)/m);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  // ── Extract tags from frontmatter ──
  let tags = [];
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    try {
      const fm = yaml.load(fmMatch[1]);
      if (fm?.metadata?.tags) {
        tags = fm.metadata.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    } catch { console.warn(`Skipping skill with malformed frontmatter: ${skillPath}`); }
  }

  // ── Extract Related Skills section ──
  // Must handle fenced code blocks: ignore ## headings inside them.
  // Strategy: walk line by line, track code fence state, find the
  // LAST valid "## Related Skills" heading outside a code fence.
  const lines = raw.split('\n');
  let inCodeFence = false;
  let lastRelatedIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line)) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (!inCodeFence && /^##\s+Related\s+Skills/i.test(line)) {
      lastRelatedIdx = i;
    }
  }

  const relatedIds = [];
  if (lastRelatedIdx >= 0) {
    // Gather lines after the heading until the next ## heading or EOF
    for (let i = lastRelatedIdx + 1; i < lines.length; i++) {
      const line = lines[i];
      if (/^##\s/.test(line)) break;  // next section
      // Match `skill-name` or [skill-name](path) at start of bullet
      const m = line.match(/^-\s+`([a-z0-9-]+)`/)
             || line.match(/^-\s+\[([a-z0-9-]+)\]\(/);
      if (m && validIds.has(m[1]) && m[1] !== id) {
        relatedIds.push(m[1]);
      }
    }
  }

  nodes.push({
    id,
    type: 'skill',
    title,
    domain: meta.domain,
    complexity: meta.complexity,
    language: meta.language,
    description: meta.registryDescription,
    tags,
    related: relatedIds,
    path: meta.path,
    locales: localeIndex.get(id) || [],
  });

  for (const targetId of relatedIds) {
    links.push({ source: id, target: targetId, type: 'skill' });
  }
}

// ── Build domain summary ────────────────────────────────────────
const domains = {};
for (const [domainName, domainObj] of Object.entries(registry.domains)) {
  domains[domainName] = {
    description: domainObj.description,
    count: domainObj.skills.length,
  };
}

// ── Parse agents registry ───────────────────────────────────────
// put id:"parse_agent_registry", label:"Parse agents/_registry.yml to agent nodes + agent-skill links", input:"skills_with_links", output:"agents_linked"
const agentNodes = [];
const agentLinks = [];
const agentIds = new Set(); // for team -> agent link validation

if (existsSync(AGENTS_REGISTRY_PATH)) {
  const agentsRegistry = yaml.load(readFileSync(AGENTS_REGISTRY_PATH, 'utf8'));

  for (const agent of agentsRegistry.agents || []) {
    const agentNodeId = `agent:${agent.id}`;
    agentIds.add(agentNodeId);

    agentNodes.push({
      id: agentNodeId,
      type: 'agent',
      title: smartTitleCase(agent.id),
      priority: agent.priority || 'normal',
      description: agent.description,
      tags: agent.tags || [],
      tools: agent.tools || [],
      mcp_servers: agent.mcp_servers || [],
      skills: agent.skills || [],
      path: agent.path,
      locales: localeIndex.get(agentNodeId) || [],
    });

    for (const skillId of agent.skills || []) {
      if (validIds.has(skillId)) {
        agentLinks.push({
          source: agentNodeId,
          target: skillId,
          type: 'agent',
        });
      }
    }
  }
} else {
  console.warn('WARN: agents/_registry.yml not found, skipping agents');
}

// ── Parse teams registry ────────────────────────────────────────
// put id:"parse_team_registry", label:"Parse teams/_registry.yml to team nodes + team-agent links", input:"agents_linked", output:"teams_linked"
const teamNodes = [];
const teamLinks = [];

if (existsSync(TEAMS_REGISTRY_PATH)) {
  const teamsRegistry = yaml.load(readFileSync(TEAMS_REGISTRY_PATH, 'utf8'));

  for (const team of teamsRegistry.teams || []) {
    const teamNodeId = `team:${team.id}`;

    teamNodes.push({
      id: teamNodeId,
      type: 'team',
      title: smartTitleCase(team.id),
      lead: team.lead,
      members: team.members || [],
      coordination: team.coordination || 'hub-and-spoke',
      description: team.description,
      tags: team.tags || [],
      path: team.path,
      locales: localeIndex.get(teamNodeId) || [],
    });

    // Create team -> agent links for each member
    for (const memberId of team.members || []) {
      const agentNodeId = `agent:${memberId}`;
      if (agentIds.has(agentNodeId)) {
        teamLinks.push({
          source: teamNodeId,
          target: agentNodeId,
          type: 'team',
        });
      }
    }
  }
} else {
  console.warn('WARN: teams/_registry.yml not found, skipping teams');
}

// ── Merge nodes and links ───────────────────────────────────────
// put id:"merge_graph", label:"Merge skill, agent & team nodes into unified graph", input:"teams_linked", output:"merged_graph"
const allNodes = [...nodes, ...agentNodes, ...teamNodes];
const allLinks = [...links, ...agentLinks, ...teamLinks];

// ── Output ──────────────────────────────────────────────────────
const output = {
  meta: {
    generated: new Date().toISOString(),
    totalSkills: nodes.length,
    totalAgents: agentNodes.length,
    totalTeams: teamNodes.length,
    totalNodes: allNodes.length,
    totalLinks: allLinks.length,
    totalAgentLinks: agentLinks.length,
    totalTeamLinks: teamLinks.length,
    totalDomains: Object.keys(domains).length,
    supportedLocales: localeCodes,
  },
  domains,
  nodes: allNodes,
  links: allLinks,
};

// put id:"write_skills_json", label:"Write merged graph to public/data/skills.json", node_type:"output", input:"merged_graph", output:"public/data/skills.json"
writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
console.log(`Generated ${OUTPUT_PATH}`);
console.log(`  Skills: ${nodes.length}`);
console.log(`  Agents: ${agentNodes.length}`);
console.log(`  Teams: ${teamNodes.length}`);
console.log(`  Agent links: ${agentLinks.length}`);
console.log(`  Team links: ${teamLinks.length}`);
console.log(`  Total nodes: ${allNodes.length}`);
console.log(`  Total links: ${allLinks.length}`);
console.log(`  Domains: ${Object.keys(domains).length}`);
