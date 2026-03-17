/**
 * installer.js — Orchestrate install/uninstall across adapters.
 *
 * Takes resolved items and a set of adapters, runs install/uninstall on each,
 * collects and returns results.
 */

import { warn } from './reporter.js';

/**
 * Install items across all adapters.
 * @param {object} resolved - { skills, agents, teams } from resolveItems()
 * @param {import('../adapters/base.js').FrameworkAdapter[]} adapters
 * @param {string} projectDir
 * @param {string} scope
 * @param {object} options - { dryRun, force, almanacRoot }
 * @returns {Promise<object[]>} Array of result objects
 */
export async function installAll(resolved, adapters, projectDir, scope, options) {
  const results = [];

  const allItems = [
    ...resolved.skills,
    ...resolved.agents,
    ...resolved.teams,
  ];

  for (const item of allItems) {
    if (item.unknown) {
      results.push({
        item,
        adapter: '—',
        action: 'skipped',
        path: '',
        error: `Unknown item: ${item.id}`,
      });
      continue;
    }

    for (const adapter of adapters) {
      if (!adapter.supports(item.type)) {
        // Warn once for non-skill types on skills-only adapters
        if (item.type !== 'skill' && adapter.constructor.id !== 'universal') {
          warn(`${item.type}s not supported by ${adapter.constructor.displayName}. Skipping ${item.id}.`);
        }
        continue;
      }

      try {
        const result = await adapter.install(item, projectDir, scope, options);
        results.push({
          item,
          adapter: adapter.constructor.id,
          ...result,
        });
      } catch (err) {
        results.push({
          item,
          adapter: adapter.constructor.id,
          action: 'failed',
          path: '',
          error: err.message,
        });
      }
    }
  }

  return results;
}

/**
 * Uninstall items across all adapters.
 * @param {object} resolved - { skills, agents, teams }
 * @param {import('../adapters/base.js').FrameworkAdapter[]} adapters
 * @param {string} projectDir
 * @param {string} scope
 * @param {object} options - { dryRun }
 * @returns {Promise<object[]>}
 */
export async function uninstallAll(resolved, adapters, projectDir, scope, options) {
  const results = [];

  const allItems = [
    ...resolved.skills,
    ...resolved.agents,
    ...resolved.teams,
  ];

  for (const item of allItems) {
    for (const adapter of adapters) {
      if (!adapter.supports(item.type)) continue;

      try {
        const result = await adapter.uninstall(item, projectDir, scope, options);
        results.push({
          item,
          adapter: adapter.constructor.id,
          ...result,
        });
      } catch (err) {
        results.push({
          item,
          adapter: adapter.constructor.id,
          action: 'failed',
          path: '',
          error: err.message,
        });
      }
    }
  }

  return results;
}

/**
 * Audit all adapters.
 * @param {import('../adapters/base.js').FrameworkAdapter[]} adapters
 * @param {string} projectDir
 * @param {string} scope
 * @returns {Promise<object[]>}
 */
export async function auditAll(adapters, projectDir, scope) {
  const results = [];
  for (const adapter of adapters) {
    try {
      const result = await adapter.audit(projectDir, scope);
      results.push(result);
    } catch (err) {
      results.push({
        framework: adapter.constructor.displayName,
        ok: [],
        warnings: [],
        errors: [`Audit failed: ${err.message}`],
      });
    }
  }
  return results;
}
