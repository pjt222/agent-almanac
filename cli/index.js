#!/usr/bin/env node
/**
 * agent-almanac CLI — Universal skill/agent/team installer.
 *
 * Installs agentskills.io content into the correct paths for 12+ agentic
 * frameworks using pluggable adapters.
 *
 * Usage:
 *   agent-almanac install <names...>     Install skills by name
 *   agent-almanac list                   List available content
 *   agent-almanac search <query>         Search skills, agents, teams
 *   agent-almanac detect                 Show detected frameworks
 *   agent-almanac audit                  Health check installed content
 *   agent-almanac uninstall <names...>   Remove installed content
 */

import { Command } from 'commander';
import { loadRegistries, resolveItems, filterSkills, search } from './lib/registry.js';
import { detectAlmanacRoot, resolveTargetDir } from './lib/resolver.js';
import { detectFrameworks } from './lib/detector.js';
import { getAdapter, getAdaptersForDetections, listAdapters } from './adapters/index.js';
import { installAll, uninstallAll, auditAll } from './lib/installer.js';
import { loadManifest, resolveManifest, generateManifest, writeManifest } from './lib/manifest.js';
import * as reporter from './lib/reporter.js';

const program = new Command();

program
  .name('agent-almanac')
  .description('Universal skill/agent/team installer for agentic CLI frameworks')
  .version('0.1.0');

// ── Shared option parsing ────────────────────────────────────────

function getContext(options) {
  const almanacRoot = options.source || detectAlmanacRoot();
  if (!almanacRoot) {
    reporter.error('Could not detect agent-almanac root. Use --source <path> or run from within the repo.');
    process.exit(1);
  }

  const reg = loadRegistries(almanacRoot);
  const scope = options.global ? 'global' : (options.scope || 'project');
  const projectDir = process.cwd();

  // Determine adapters
  let adapters;
  if (options.framework) {
    const adapter = getAdapter(options.framework);
    if (!adapter) {
      reporter.error(`Unknown framework: ${options.framework}. Available: ${listAdapters().map(a => a.id).join(', ')}`);
      process.exit(1);
    }
    adapters = [adapter];
  } else {
    const detections = detectFrameworks(projectDir);
    adapters = getAdaptersForDetections(detections);
  }

  return { reg, almanacRoot, scope, projectDir, adapters };
}

// ── install ──────────────────────────────────────────────────────

program
  .command('install [names...]')
  .description('Install skills, agents, or teams')
  .option('-d, --domain <domain>', 'Install all skills from a domain')
  .option('-c, --complexity <level>', 'Filter by complexity (basic/intermediate/advanced)')
  .option('-a, --agent <id>', 'Install an agent definition')
  .option('-t, --team <id>', 'Install a team definition')
  .option('--with-deps', 'Also install agent skills / team agents+skills')
  .option('-f, --framework <id>', 'Target specific framework (default: auto-detect)')
  .option('-g, --global', 'Install to global scope')
  .option('--scope <scope>', 'Scope: project, workspace, global', 'project')
  .option('-n, --dry-run', 'Preview without making changes')
  .option('--force', 'Overwrite existing content')
  .option('--source <path>', 'Path to agent-almanac root')
  .action(async (names, options) => {
    const ctx = getContext(options);

    // If no args, try manifest
    if (names.length === 0 && !options.domain && !options.agent && !options.team) {
      const manifest = loadManifest();
      if (manifest) {
        const resolved = resolveManifest(manifest, ctx.reg);
        const totalItems = resolved.skills.length + resolved.agents.length + resolved.teams.length;
        if (totalItems === 0) { reporter.error('Manifest resolved to 0 items.'); process.exit(1); }
        if (options.dryRun) reporter.printDryRun();
        console.log(`\nInstalling ${totalItems} item(s) from agent-almanac.yml...\n`);
        const results = await installAll(resolved, ctx.adapters, ctx.projectDir, ctx.scope, {
          dryRun: options.dryRun, force: options.force, almanacRoot: ctx.almanacRoot,
        });
        reporter.printResults(results);
        return;
      }
      reporter.error('Nothing to install. Provide skill names, --domain, --agent, --team, or create agent-almanac.yml.');
      process.exit(1);
    }

    const resolved = resolveItems(ctx.reg, names, {
      domain: options.domain,
      complexity: options.complexity,
      agent: options.agent,
      team: options.team,
      withDeps: options.withDeps,
    });

    const totalItems = resolved.skills.length + resolved.agents.length + resolved.teams.length;
    if (totalItems === 0) {
      reporter.error('No matching items found.');
      process.exit(1);
    }

    if (options.dryRun) reporter.printDryRun();

    console.log(`\nInstalling ${totalItems} item(s) to ${ctx.adapters.map(a => a.constructor.displayName).join(', ')}...\n`);

    const results = await installAll(resolved, ctx.adapters, ctx.projectDir, ctx.scope, {
      dryRun: options.dryRun,
      force: options.force,
      almanacRoot: ctx.almanacRoot,
    });

    reporter.printResults(results);
  });

// ── uninstall ────────────────────────────────────────────────────

program
  .command('uninstall <names...>')
  .description('Remove installed skills, agents, or teams')
  .option('-f, --framework <id>', 'Target specific framework')
  .option('-g, --global', 'Uninstall from global scope')
  .option('--scope <scope>', 'Scope: project, workspace, global', 'project')
  .option('-n, --dry-run', 'Preview without making changes')
  .option('--source <path>', 'Path to agent-almanac root')
  .action(async (names, options) => {
    const ctx = getContext(options);

    const resolved = resolveItems(ctx.reg, names, {});

    if (options.dryRun) reporter.printDryRun();

    console.log(`\nUninstalling ${names.length} item(s)...\n`);

    const results = await uninstallAll(resolved, ctx.adapters, ctx.projectDir, ctx.scope, {
      dryRun: options.dryRun,
    });

    reporter.printResults(results);
  });

// ── list ─────────────────────────────────────────────────────────

program
  .command('list')
  .description('List available or installed content')
  .option('-d, --domain <domain>', 'Filter by domain')
  .option('-c, --complexity <level>', 'Filter by complexity')
  .option('--agents', 'List agents only')
  .option('--teams', 'List teams only')
  .option('--installed', 'Show installed content only')
  .option('--domains', 'List available domains')
  .option('-f, --framework <id>', 'Filter installed by framework')
  .option('-g, --global', 'List from global scope')
  .option('--scope <scope>', 'Scope: project, workspace, global', 'project')
  .option('--source <path>', 'Path to agent-almanac root')
  .action(async (options) => {
    const ctx = getContext(options);

    if (options.domains) {
      console.log(`\n${ctx.reg.domains.length} domains:\n`);
      for (const domain of ctx.reg.domains.sort()) {
        const count = filterSkills(ctx.reg, { domain }).length;
        console.log(`  ${reporter.chalk.cyan(domain.padEnd(28))} ${reporter.chalk.dim(`${count} skills`)}`);
      }
      return;
    }

    if (options.installed) {
      console.log('\nInstalled content:\n');
      for (const adapter of ctx.adapters) {
        const items = await adapter.listInstalled(ctx.projectDir, ctx.scope);
        if (items.length > 0) {
          console.log(reporter.chalk.bold(`  ${adapter.constructor.displayName}:`));
          for (const item of items) {
            const status = item.broken ? reporter.chalk.red(' (broken)') : '';
            console.log(`    ${reporter.chalk.cyan(item.id)} ${reporter.chalk.dim(item.type)}${status}`);
          }
        }
      }
      return;
    }

    if (options.agents) {
      console.log(`\n${ctx.reg.agents.length} agents:\n`);
      reporter.printItemTable(ctx.reg.agents);
      return;
    }

    if (options.teams) {
      console.log(`\n${ctx.reg.teams.length} teams:\n`);
      reporter.printItemTable(ctx.reg.teams);
      return;
    }

    // Default: list skills
    const skills = options.domain
      ? filterSkills(ctx.reg, { domain: options.domain, complexity: options.complexity })
      : ctx.reg.skills;

    console.log(`\n${skills.length} skills${options.domain ? ` in ${options.domain}` : ''}:\n`);
    reporter.printItemTable(skills);
  });

// ── search ───────────────────────────────────────────────────────

program
  .command('search <query>')
  .description('Search skills, agents, and teams')
  .option('--source <path>', 'Path to agent-almanac root')
  .action(async (query, options) => {
    const almanacRoot = options.source || detectAlmanacRoot();
    if (!almanacRoot) {
      reporter.error('Could not detect agent-almanac root.');
      process.exit(1);
    }
    const reg = loadRegistries(almanacRoot);

    const results = search(reg, query);
    console.log(`\n${results.length} result(s) for "${query}":\n`);
    reporter.printItemTable(results);
  });

// ── detect ───────────────────────────────────────────────────────

program
  .command('detect')
  .description('Show detected agentic frameworks')
  .action(async () => {
    const detections = detectFrameworks(process.cwd());
    console.log();
    reporter.printDetections(detections);
    console.log();

    // Show which have adapters
    const available = listAdapters();
    const noAdapter = detections.filter(d => !available.some(a => a.id === d.id));
    if (noAdapter.length > 0) {
      console.log(reporter.chalk.dim(`  Detected but no adapter yet: ${noAdapter.map(d => d.displayName).join(', ')}`));
    }
  });

// ── audit ────────────────────────────────────────────────────────

program
  .command('audit')
  .description('Health check installed content across frameworks')
  .option('-f, --framework <id>', 'Audit specific framework only')
  .option('-g, --global', 'Audit global scope')
  .option('--scope <scope>', 'Scope: project, workspace, global', 'project')
  .option('--source <path>', 'Path to agent-almanac root')
  .action(async (options) => {
    const ctx = getContext(options);

    console.log('\nAudit results:\n');
    const results = await auditAll(ctx.adapters, ctx.projectDir, ctx.scope);
    reporter.printAudit(results);
    console.log();
  });

// ── init ─────────────────────────────────────────────────────────

program
  .command('init')
  .description('Generate an agent-almanac.yml manifest')
  .option('--source <path>', 'Path to agent-almanac root')
  .action(async (options) => {
    const almanacRoot = options.source || detectAlmanacRoot();
    if (!almanacRoot) {
      reporter.error('Could not detect agent-almanac root.');
      process.exit(1);
    }

    const reg = loadRegistries(almanacRoot);
    const detections = detectFrameworks(process.cwd());
    const frameworkIds = detections.map(d => d.id).filter(id => id !== 'universal');

    const manifest = generateManifest({
      source: almanacRoot,
      frameworks: frameworkIds.length > 0 ? frameworkIds : undefined,
      skills: ['# Add skill names or domain references here'],
      agents: ['# Add agent names here'],
      teams: ['# Add team names here'],
    });

    const path = writeManifest(manifest);
    console.log(`\nCreated ${reporter.chalk.cyan(path)}`);
    console.log(`\nAvailable: ${reg.totalSkills} skills across ${reg.domains.length} domains, ${reg.totalAgents} agents, ${reg.totalTeams} teams`);
    console.log(`Edit the file, then run ${reporter.chalk.cyan('agent-almanac install')} to apply.\n`);
  });

// ── sync ─────────────────────────────────────────────────────────

program
  .command('sync')
  .description('Reconcile installed state with agent-almanac.yml')
  .option('-f, --framework <id>', 'Target specific framework')
  .option('-g, --global', 'Sync global scope')
  .option('--scope <scope>', 'Scope: project, workspace, global', 'project')
  .option('-n, --dry-run', 'Preview without making changes')
  .option('--source <path>', 'Path to agent-almanac root')
  .action(async (options) => {
    const manifest = loadManifest();
    if (!manifest) {
      reporter.error('No agent-almanac.yml found. Run "agent-almanac init" first.');
      process.exit(1);
    }

    const ctx = getContext(options);
    const desired = resolveManifest(manifest, ctx.reg);
    const desiredSkillIds = new Set(desired.skills.map(s => s.id));

    if (options.dryRun) reporter.printDryRun();

    // Install missing
    console.log('\nSync: installing missing items...\n');
    const installResults = await installAll(desired, ctx.adapters, ctx.projectDir, ctx.scope, {
      dryRun: options.dryRun,
      almanacRoot: ctx.almanacRoot,
    });

    // Find items to remove (installed but not in manifest) — universal adapter only
    const universalAdapter = ctx.adapters.find(a => a.constructor.id === 'universal');
    let removeResults = [];
    if (universalAdapter) {
      const installed = await universalAdapter.listInstalled(ctx.projectDir, ctx.scope);
      const extra = installed.filter(i => !desiredSkillIds.has(i.id));
      if (extra.length > 0) {
        console.log('Sync: removing extra items...\n');
        removeResults = await uninstallAll(
          { skills: extra, agents: [], teams: [] },
          [universalAdapter],
          ctx.projectDir,
          ctx.scope,
          { dryRun: options.dryRun },
        );
      }
    }

    reporter.printResults([...installResults, ...removeResults]);
  });

// ── Parse and run ────────────────────────────────────────────────

program.parse();
