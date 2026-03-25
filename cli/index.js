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
 *   agent-almanac campfire [name]        Browse campfires (team circles)
 *   agent-almanac gather <name>          Gather a team around the fire
 *   agent-almanac scatter <name>         Scatter a team (farewell)
 *   agent-almanac tend                   Health check your campfires
 */

import { Command } from 'commander';
import { createInterface } from 'readline';
import { loadRegistries, resolveItems, filterSkills, search, findTeam, findAgent } from './lib/registry.js';
import { detectAlmanacRoot, resolveTargetDir } from './lib/resolver.js';
import { detectFrameworks } from './lib/detector.js';
import { getAdapter, getAdaptersForDetections, listAdapters } from './adapters/index.js';
import { installAll, uninstallAll, auditAll } from './lib/installer.js';
import { loadManifest, resolveManifest, generateManifest, writeManifest } from './lib/manifest.js';
import { loadState, saveState, recordGather, recordScatter, recordWarm, markWelcomed, getFireStates, getFireState, findSharedSkills } from './lib/state.js';
import * as campfire from './lib/campfire-reporter.js';
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

// ── campfire ─────────────────────────────────────────────────────

program
  .command('campfire [name]')
  .description('Browse campfires (team circles)')
  .option('--all', 'Show all available campfires')
  .option('--map', 'Show shared agents between campfires')
  .option('--web', 'Open campfire view in the viz')
  .option('--json', 'Output as JSON')
  .option('--source <path>', 'Path to agent-almanac root')
  .addHelpText('after', '\nExamples:\n  agent-almanac campfire --all\n  agent-almanac campfire r-package-review\n  agent-almanac campfire --map')
  .action(async (name, options) => {
    const almanacRoot = options.source || detectAlmanacRoot();
    if (!almanacRoot) {
      reporter.error('Could not detect agent-almanac root.');
      process.exit(1);
    }
    const reg = loadRegistries(almanacRoot);
    const state = loadState();

    // JSON mode
    if (options.json) {
      const fires = getFireStates(state);
      campfire.printJson({
        fires,
        totalTeams: reg.teams.length,
        wanderers: state.wanderers || [],
      });
      return;
    }

    // Map mode
    if (options.map) {
      campfire.printCampfireMap(reg.teams, state);
      return;
    }

    // Web mode — open viz with campfire URL params
    if (options.web) {
      const gathered = Object.keys(state.fires).join(',');
      const url = `http://localhost:5173/?mode=campfire${gathered ? `&gathered=${gathered}` : ''}`;
      console.log(`\nOpening: ${reporter.chalk.cyan(url)}\n`);
      const { exec } = await import('child_process');
      exec(`xdg-open "${url}" 2>/dev/null || open "${url}" 2>/dev/null || start "${url}"`);
      return;
    }

    // All mode — categorized list
    if (options.all) {
      campfire.printCampfireList({ teams: reg.teams, state, reg });
      return;
    }

    // Specific fire detail
    if (name) {
      const team = findTeam(reg, name);
      if (!team) {
        reporter.error(`Unknown campfire: ${name}`);
        process.exit(1);
      }
      const fireData = state.fires[name] || null;
      campfire.printFireSummary({ team, fireData, reg });
      return;
    }

    // Default: show gathered fires or welcome
    const fires = getFireStates(state);
    if (fires.length === 0) {
      if (!state.welcomed) {
        campfire.printWelcome(reg.teams.length);
        saveState(markWelcomed(state));
      } else {
        console.log();
        console.log(reporter.chalk.dim('  No fires burning.'));
        console.log(reporter.chalk.dim(`  Type 'agent-almanac campfire --all' to browse, or 'agent-almanac gather <name>' to light a fire.`));
        console.log();
      }
    } else {
      campfire.printTend(fires);
    }
  });

// ── gather ──────────────────────────────────────────────────────

program
  .command('gather <name>')
  .description('Gather a team around the campfire')
  .option('--ceremonial', 'Show each practice (skill) arriving')
  .option('--only <agents>', 'Partial gathering — comma-separated agent IDs')
  .option('-f, --framework <id>', 'Target specific framework')
  .option('-g, --global', 'Install to global scope')
  .option('--scope <scope>', 'Scope: project, workspace, global', 'project')
  .option('-n, --dry-run', 'Preview without making changes')
  .option('-q, --quiet', 'No ceremony, just install')
  .option('--json', 'Output as JSON')
  .option('--source <path>', 'Path to agent-almanac root')
  .addHelpText('after', '\nExamples:\n  agent-almanac gather tending\n  agent-almanac gather r-package-review --ceremonial\n  agent-almanac gather tending --only mystic,gardener')
  .action(async (name, options) => {
    const ctx = getContext(options);
    const state = loadState();

    // Resolve team
    const team = findTeam(ctx.reg, name);
    if (!team) {
      reporter.error(`Unknown campfire: ${name}. Use 'agent-almanac campfire --all' to browse.`);
      process.exit(1);
    }

    // Warn if already gathered (re-gather confirmation)
    if (state.fires[name] && !options.dryRun && !options.quiet && !options.json) {
      console.log(`\n  The ${name} fire is already burning. Regather?`);
      const answer = await askYesNo();
      if (!answer) {
        console.log(reporter.chalk.dim('\n  The fire still burns.\n'));
        return;
      }
    }

    // Resolve members (filter --only if provided)
    let memberIds = team.members || [];
    if (options.only) {
      const onlyIds = options.only.split(',').map(s => s.trim());
      memberIds = memberIds.filter(m => onlyIds.includes(m));
      if (memberIds.length === 0) {
        reporter.error(`No matching agents in --only. Available: ${(team.members || []).join(', ')}`);
        process.exit(1);
      }
    }

    // Resolve agents and their skills
    const agents = [];
    const allSkillItems = [];
    const allAgentItems = [];
    const defaultSkillIds = (ctx.reg.defaultSkills || []).map(s => s.id);

    for (const memberId of memberIds) {
      const agent = findAgent(ctx.reg, memberId);
      if (!agent) continue;
      allAgentItems.push(agent);

      const agentSkillIds = [...new Set([...(agent.skills || []), ...defaultSkillIds])];
      const agentSkills = agentSkillIds.map(sid =>
        ctx.reg.skills.find(s => s.id === sid),
      ).filter(Boolean);

      agents.push({
        id: memberId,
        lead: memberId === team.lead,
        skills: agentSkillIds,
      });

      for (const skill of agentSkills) {
        if (!allSkillItems.some(s => s.id === skill.id)) {
          allSkillItems.push(skill);
        }
      }
    }

    // Find skills already installed from other fires
    const sharedSkills = findSharedSkills(state, ctx.reg);

    // Install via the standard machinery
    const resolved = {
      skills: allSkillItems,
      agents: allAgentItems,
      teams: [team],
    };

    if (options.dryRun) reporter.printDryRun();

    const installResults = await installAll(resolved, ctx.adapters, ctx.projectDir, ctx.scope, {
      dryRun: options.dryRun,
      force: false,
      almanacRoot: ctx.almanacRoot,
    });

    // Categorize results
    const installed = installResults.filter(r => r.action === 'created').map(r => r.item.id);
    const skipped = installResults.filter(r => r.action === 'skipped').map(r => r.item.id);
    const failed = installResults.filter(r => r.error).map(r => ({ id: r.item.id, error: r.error }));

    // JSON output
    if (options.json) {
      campfire.printJson({
        team: name,
        agents: memberIds,
        skillsInstalled: installed.length,
        skillsSkipped: skipped.length,
        skillsFailed: failed.length,
        state: 'burning',
      });
    } else if (options.quiet) {
      // Standard reporter output
      reporter.printResults(installResults);
    } else {
      // Ceremony output
      const partial = options.only && memberIds.length < (team.members || []).length;
      if (partial) {
        console.log(reporter.chalk.dim(`\n  Partial gathering: ${name} fire burns with ${memberIds.length} of ${(team.members || []).length} keepers.`));
      }
      campfire.printArrival({
        teamId: name,
        agents,
        results: { installed, skipped, failed },
        ceremonial: options.ceremonial || false,
        alreadyBurning: sharedSkills,
      });
    }

    // Update state (unless dry-run)
    if (!options.dryRun) {
      const failedIds = failed.map(f => f.id);
      recordGather(state, name, memberIds, allSkillItems.length, failedIds);
      saveState(state);
    }
  });

// ── scatter ─────────────────────────────────────────────────────

program
  .command('scatter <name>')
  .description('Scatter a team (farewell ceremony)')
  .option('--ceremonial', 'Show each practice scattering')
  .option('-f, --framework <id>', 'Target specific framework')
  .option('-g, --global', 'Uninstall from global scope')
  .option('--scope <scope>', 'Scope: project, workspace, global', 'project')
  .option('-n, --dry-run', 'Preview without making changes')
  .option('-q, --quiet', 'No ceremony, just uninstall')
  .option('--json', 'Output as JSON')
  .option('-y, --yes', 'Skip confirmation')
  .option('--source <path>', 'Path to agent-almanac root')
  .addHelpText('after', '\nExamples:\n  agent-almanac scatter tending\n  agent-almanac scatter r-package-review -y')
  .action(async (name, options) => {
    const ctx = getContext(options);
    const state = loadState();

    const team = findTeam(ctx.reg, name);
    if (!team) {
      reporter.error(`Unknown campfire: ${name}`);
      process.exit(1);
    }

    if (!state.fires[name]) {
      reporter.error(`The ${name} fire is not burning. Nothing to scatter.\n  Try 'agent-almanac gather ${name}' to light this fire first.`);
      process.exit(1);
    }

    // Resolve what to remove
    const memberIds = team.members || [];
    const defaultSkillIds = (ctx.reg.defaultSkills || []).map(s => s.id);

    const agents = [];
    const allSkillItems = [];
    const allAgentItems = [];

    for (const memberId of memberIds) {
      const agent = findAgent(ctx.reg, memberId);
      if (!agent) continue;

      const agentSkillIds = [...new Set([...(agent.skills || []), ...defaultSkillIds])];
      const agentSkills = agentSkillIds.map(sid =>
        ctx.reg.skills.find(s => s.id === sid),
      ).filter(Boolean);

      agents.push({
        id: memberId,
        lead: memberId === team.lead,
        skills: agentSkillIds,
      });

      allAgentItems.push(agent);
      for (const skill of agentSkills) {
        if (!allSkillItems.some(s => s.id === skill.id)) {
          allSkillItems.push(skill);
        }
      }
    }

    // Find skills/agents needed by other fires
    const otherFires = Object.entries(state.fires).filter(([id]) => id !== name);
    const keptSkills = [];
    const keptAgents = [];

    for (const skill of allSkillItems) {
      for (const [otherId, otherFire] of otherFires) {
        const otherAgentIds = otherFire.agents || [];
        for (const oaId of otherAgentIds) {
          const oa = findAgent(ctx.reg, oaId);
          if (oa && (oa.skills || []).includes(skill.id)) {
            keptSkills.push({ id: skill.id, reason: otherId });
            break;
          }
        }
        if (keptSkills.some(k => k.id === skill.id)) break;
      }
    }

    for (const agent of allAgentItems) {
      for (const [otherId, otherFire] of otherFires) {
        if ((otherFire.agents || []).includes(agent.id)) {
          keptAgents.push({ id: agent.id, reason: otherId });
          break;
        }
      }
    }

    const keptSkillIds = new Set(keptSkills.map(k => k.id));
    const keptAgentIds = new Set(keptAgents.map(k => k.id));
    const toRemoveSkills = allSkillItems.filter(s => !keptSkillIds.has(s.id));
    const toRemoveAgents = allAgentItems.filter(a => !keptAgentIds.has(a.id));

    const totalSkills = allSkillItems.length;

    // Confirmation (unless --yes or --quiet or --dry-run)
    if (!options.yes && !options.quiet && !options.dryRun && !options.json) {
      campfire.printScatterConfirm(team, totalSkills);
      const answer = await askYesNo();
      if (!answer) {
        console.log(reporter.chalk.dim('\n  The fire still burns.\n'));
        return;
      }
    }

    if (options.dryRun) reporter.printDryRun();

    // Uninstall via standard machinery (only items not shared)
    const resolved = {
      skills: toRemoveSkills,
      agents: toRemoveAgents,
      teams: [team],
    };

    const uninstallResults = await uninstallAll(resolved, ctx.adapters, ctx.projectDir, ctx.scope, {
      dryRun: options.dryRun,
    });

    if (options.json) {
      campfire.printJson({
        team: name,
        skillsRemoved: toRemoveSkills.length,
        skillsKept: keptSkills.length,
        agentsKept: keptAgents.length,
      });
    } else if (options.quiet) {
      reporter.printResults(uninstallResults);
    } else {
      campfire.printScatter({
        teamId: name,
        agents,
        results: {
          removed: toRemoveSkills.map(s => s.id),
          kept: keptSkills,
          keptAgents,
        },
        ceremonial: options.ceremonial || false,
      });
    }

    // Update state
    if (!options.dryRun) {
      recordScatter(state, name);
      saveState(state);
    }
  });

// ── tend ────────────────────────────────────────────────────────

program
  .command('tend')
  .description('Tend your campfires (health check)')
  .option('-n, --dry-run', 'Check fire health without warming')
  .option('--json', 'Output as JSON')
  .option('--source <path>', 'Path to agent-almanac root')
  .addHelpText('after', '\nExamples:\n  agent-almanac tend\n  agent-almanac tend --dry-run')
  .action(async (options) => {
    const almanacRoot = options.source || detectAlmanacRoot();
    if (!almanacRoot) {
      reporter.error('Could not detect agent-almanac root.');
      process.exit(1);
    }
    const reg = loadRegistries(almanacRoot);
    const state = loadState();
    const fires = getFireStates(state);

    if (fires.length === 0) {
      console.log(reporter.chalk.dim('\n  No fires to tend. Gather a campfire first.\n'));
      return;
    }

    if (options.json) {
      campfire.printJson({ fires });
      return;
    }

    // Enrich fire data with registry info
    const enrichedFires = fires.map(fire => {
      const team = findTeam(reg, fire.id);
      return {
        ...fire,
        description: team?.description || '',
        coordination: team?.coordination || '',
      };
    });

    campfire.printTend(enrichedFires);

    // Update lastWarmed on all fires (tending is warming) — unless --dry
    if (!options.dryRun) {
      for (const fire of fires) {
        recordWarm(state, fire.id);
      }
      saveState(state);
    }
  });

// ── Demo ────────────────────────────────────────────────────────

program
  .command('demo')
  .description('Preview campfire visuals — fire states and team icons')
  .addHelpText('after', `
Examples:
  agent-almanac demo`)
  .action(async () => {
    const { canInlineImage, renderInlineImage } = await import('./lib/inline-image.js');
    const { getCampfirePng, getTeamStrip, getAgentPng } = await import('./lib/sprites.js');
    const { buildFireScene } = await import('./lib/scene.js');

    const maxWidth = process.stdout.columns || 120;
    const inline = canInlineImage();

    console.log();
    console.log(campfire.C.warm(`  Campfire demo ${campfire.C.dim(`(inline images: ${inline ? 'yes' : 'no'})`)}`));
    console.log();

    // Fire states.
    for (const state of ['burning', 'embers', 'cold']) {
      console.log(campfire.C.dim(`  ── ${state} ──`));
      const scene = buildFireScene({ state, maxWidth });
      for (const line of scene) console.log(line);
      console.log();
    }

    // Team strip.
    if (inline) {
      const almanac = detectAlmanacRoot();
      const reg = loadRegistries(almanac);
      const teamIds = reg.teams.map(t => t.id);
      for (const id of teamIds) {
        const team = findTeam(reg, id);
        if (!team) continue;
        const strip = getTeamStrip(id);
        if (!strip) continue;
        console.log(campfire.C.dim(`  ── ${id} ──`));
        console.log(renderInlineImage(strip, { heightPx: 120 }));
      }
    }
  });

// ── Utility ─────────────────────────────────────────────────────

function askYesNo() {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question('  ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase().startsWith('y'));
    });
  });
}

// ── Parse and run ────────────────────────────────────────────────

program.parse();
