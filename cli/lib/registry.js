/**
 * registry.js — Load and query agent-almanac YAML registries.
 *
 * Provides a unified interface to skills, agents, teams, and guides registries
 * with filtering by id, domain, complexity, language, and tags.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import yaml from 'js-yaml';

/**
 * Load all registries from an almanac root directory.
 * @param {string} almanacRoot - Absolute path to the agent-almanac repo root
 * @returns {Registry}
 */
export function loadRegistries(almanacRoot) {
  const load = (rel) => {
    const p = resolve(almanacRoot, rel);
    return existsSync(p) ? yaml.load(readFileSync(p, 'utf8')) : null;
  };

  const skillsRaw = load('skills/_registry.yml');
  const agentsRaw = load('agents/_registry.yml');
  const teamsRaw = load('teams/_registry.yml');
  const guidesRaw = load('guides/_registry.yml');

  // Flatten skills from domain-grouped structure into a flat array
  const skills = [];
  if (skillsRaw?.domains) {
    for (const [domainId, domainInfo] of Object.entries(skillsRaw.domains)) {
      for (const skill of domainInfo.skills || []) {
        skills.push({
          ...skill,
          type: 'skill',
          domain: domainId,
          domainDescription: domainInfo.description,
          sourcePath: resolve(almanacRoot, 'skills', skill.path),
          sourceDir: resolve(almanacRoot, 'skills', skill.id),
        });
      }
    }
  }

  const agents = (agentsRaw?.agents || []).map(a => ({
    ...a,
    type: 'agent',
    sourcePath: resolve(almanacRoot, a.path),
  }));

  const teams = (teamsRaw?.teams || []).map(t => ({
    ...t,
    type: 'team',
    sourcePath: resolve(almanacRoot, t.path),
  }));

  const guides = (guidesRaw?.guides || []).map(g => ({
    ...g,
    type: 'guide',
    sourcePath: resolve(almanacRoot, g.path),
  }));

  return {
    almanacRoot,
    totalSkills: skillsRaw?.total_skills ?? skills.length,
    totalAgents: agentsRaw?.total_agents ?? agents.length,
    totalTeams: teamsRaw?.total_teams ?? teams.length,
    totalGuides: guidesRaw?.total_guides ?? guides.length,
    defaultSkills: agentsRaw?.default_skills || [],
    domains: skillsRaw?.domains ? Object.keys(skillsRaw.domains) : [],
    skills,
    agents,
    teams,
    guides,
  };
}

/**
 * Find a skill by id.
 * @param {Registry} reg
 * @param {string} id
 * @returns {object|undefined}
 */
export function findSkill(reg, id) {
  return reg.skills.find(s => s.id === id);
}

/**
 * Find an agent by id.
 * @param {Registry} reg
 * @param {string} id
 * @returns {object|undefined}
 */
export function findAgent(reg, id) {
  return reg.agents.find(a => a.id === id);
}

/**
 * Find a team by id.
 * @param {Registry} reg
 * @param {string} id
 * @returns {object|undefined}
 */
export function findTeam(reg, id) {
  return reg.teams.find(t => t.id === id);
}

/**
 * Filter skills by domain, complexity, language, or tags.
 * @param {Registry} reg
 * @param {object} filters - { domain, complexity, language, tag }
 * @returns {object[]}
 */
export function filterSkills(reg, filters = {}) {
  let results = reg.skills;
  if (filters.domain) {
    results = results.filter(s => s.domain === filters.domain);
  }
  if (filters.complexity) {
    results = results.filter(s => s.complexity === filters.complexity);
  }
  if (filters.language) {
    results = results.filter(s => s.language === filters.language);
  }
  return results;
}

/**
 * Search across skills, agents, and teams by text query.
 * Matches against id, description, domain, and tags.
 * @param {Registry} reg
 * @param {string} query
 * @returns {object[]}
 */
export function search(reg, query) {
  const q = query.toLowerCase();
  const matches = (item) => {
    const fields = [
      item.id,
      item.description,
      item.domain,
      ...(item.tags || []),
    ].filter(Boolean);
    return fields.some(f => f.toLowerCase().includes(q));
  };
  return [
    ...reg.skills.filter(matches),
    ...reg.agents.filter(matches),
    ...reg.teams.filter(matches),
  ];
}

/**
 * Resolve items from CLI arguments.
 * Handles individual names and --domain expansion.
 * @param {Registry} reg
 * @param {string[]} names - skill/agent/team names from CLI args
 * @param {object} options - { domain, complexity, agent, team, withDeps }
 * @returns {{ skills: object[], agents: object[], teams: object[] }}
 */
export function resolveItems(reg, names = [], options = {}) {
  const skills = [];
  const agents = [];
  const teams = [];

  // Domain-based expansion
  if (options.domain) {
    const filtered = filterSkills(reg, {
      domain: options.domain,
      complexity: options.complexity,
    });
    skills.push(...filtered);
  }

  // Explicit agent flag
  if (options.agent) {
    const agent = findAgent(reg, options.agent);
    if (agent) {
      agents.push(agent);
      if (options.withDeps) {
        for (const skillId of agent.skills || []) {
          const skill = findSkill(reg, skillId);
          if (skill && !skills.some(s => s.id === skill.id)) {
            skills.push(skill);
          }
        }
      }
    }
  }

  // Explicit team flag
  if (options.team) {
    const team = findTeam(reg, options.team);
    if (team) {
      teams.push(team);
      if (options.withDeps) {
        for (const memberId of team.members || []) {
          const agent = findAgent(reg, memberId);
          if (agent && !agents.some(a => a.id === agent.id)) {
            agents.push(agent);
            for (const skillId of agent.skills || []) {
              const skill = findSkill(reg, skillId);
              if (skill && !skills.some(s => s.id === skill.id)) {
                skills.push(skill);
              }
            }
          }
        }
      }
    }
  }

  // Named items (try skill first, then agent, then team)
  for (const name of names) {
    const skill = findSkill(reg, name);
    if (skill) { skills.push(skill); continue; }
    const agent = findAgent(reg, name);
    if (agent) { agents.push(agent); continue; }
    const team = findTeam(reg, name);
    if (team) { teams.push(team); continue; }
    // Unknown item — will be reported by caller
    skills.push({ id: name, type: 'skill', unknown: true });
  }

  // Deduplicate
  const dedup = (arr) => [...new Map(arr.map(i => [i.id, i])).values()];
  return { skills: dedup(skills), agents: dedup(agents), teams: dedup(teams) };
}
