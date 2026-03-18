/**
 * manifest.js — Parse and resolve agent-almanac.yml manifests.
 *
 * The manifest is a declarative file listing which skills, agents, and teams
 * should be installed. Domain references are expanded using the registry.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import yaml from 'js-yaml';
import { filterSkills, findSkill, findAgent, findTeam } from './registry.js';

/**
 * Load a manifest file.
 * @param {string} [dir] - Directory to look in (default: cwd)
 * @returns {object|null} Parsed manifest or null if not found
 */
export function loadManifest(dir = process.cwd()) {
  const path = resolve(dir, 'agent-almanac.yml');
  if (!existsSync(path)) return null;
  return yaml.load(readFileSync(path, 'utf8'));
}

/**
 * Resolve a manifest into concrete items using the registry.
 * Expands domain references, applies filters, deduplicates.
 * @param {object} manifest - Parsed manifest
 * @param {object} reg - Registry from loadRegistries()
 * @returns {{ skills: object[], agents: object[], teams: object[] }}
 */
export function resolveManifest(manifest, reg) {
  const skills = [];
  const agents = [];
  const teams = [];

  // Resolve skills (can be strings or objects with domain/complexity)
  for (const entry of manifest.skills || manifest.practices || []) {
    if (typeof entry === 'string') {
      if (entry === '*') {
        skills.push(...reg.skills);
      } else {
        const skill = findSkill(reg, entry);
        if (skill) skills.push(skill);
      }
    } else if (entry.domain) {
      const filtered = filterSkills(reg, {
        domain: entry.domain,
        complexity: entry.complexity,
      });
      skills.push(...filtered);
    }
  }

  // Resolve agents (wanderers is the campfire synonym)
  for (const entry of manifest.agents || manifest.wanderers || []) {
    if (typeof entry === 'string') {
      if (entry === '*') {
        agents.push(...reg.agents);
      } else {
        const agent = findAgent(reg, entry);
        if (agent) agents.push(agent);
      }
    }
  }

  // Resolve teams (campfires is the campfire synonym)
  for (const entry of manifest.campfires || manifest.teams || []) {
    if (typeof entry === 'string') {
      if (entry === '*') {
        teams.push(...reg.teams);
      } else {
        const team = findTeam(reg, entry);
        if (team) teams.push(team);
      }
    }
  }

  // Deduplicate
  const dedup = (arr) => [...new Map(arr.map(i => [i.id, i])).values()];
  return { skills: dedup(skills), agents: dedup(agents), teams: dedup(teams) };
}

/**
 * Generate a manifest object from interactive selections.
 * @param {object} options
 * @returns {object} Manifest object ready to write
 */
export function generateManifest(options = {}) {
  const manifest = { version: '1.0' };

  if (options.source) {
    manifest.source = { path: options.source };
  }
  if (options.frameworks?.length) {
    manifest.frameworks = options.frameworks;
  }
  if (options.skills?.length) {
    manifest.skills = options.skills;
  }
  if (options.agents?.length) {
    manifest.agents = options.agents;
  }
  if (options.teams?.length) {
    manifest.teams = options.teams;
  }

  return manifest;
}

/**
 * Write a manifest to disk.
 * @param {object} manifest
 * @param {string} [dir] - Directory to write to
 */
export function writeManifest(manifest, dir = process.cwd()) {
  const path = resolve(dir, 'agent-almanac.yml');
  const content = yaml.dump(manifest, { lineWidth: 100, noRefs: true });
  writeFileSync(path, content, 'utf8');
  return path;
}
