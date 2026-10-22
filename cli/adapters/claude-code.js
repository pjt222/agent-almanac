/**
 * claude-code.js — Claude Code adapter.
 *
 * Installs skills and agents to .claude/ directories using symlinks.
 * Teams are NOT symlinked — they are blueprints read directly from teams/.
 * Claude Code's TeamCreate stores runtime state at ~/.claude/teams/, so
 * that path must not be occupied by a definition symlink.
 *
 * Skills:  .claude/skills/<id> → skills/<id> (symlink to directory)
 * Agents:  .claude/agents → agents/ (directory symlink)
 * Teams:   (no symlink — definitions read from teams/ at activation time)
 *
 * With `--from-package copy` the skill and agents entries are copies instead
 * of links (cli/lib/placement.js).
 */

import { existsSync, readdirSync, lstatSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';
import { FrameworkAdapter, childPath } from './base.js';
import { classify, describeEntry, installAt, isInternalName, removeEntry } from '../lib/placement.js';

export class ClaudeCodeAdapter extends FrameworkAdapter {
  static id = 'claude-code';
  static displayName = 'Claude Code';
  static strategy = 'symlink';
  static contentTypes = ['skill', 'agent', 'team'];
  /** @type {Record<string, string[]>} #607: _targetBase() branches on scope for every content type. */
  static scopes = { skill: ['project', 'global'], agent: ['project', 'global'], team: ['project', 'global'] };

  async detect(projectDir) {
    return existsSync(resolve(projectDir, '.claude'));
  }

  _targetBase(scope, projectDir) {
    return scope === 'global'
      ? resolve(homedir(), '.claude')
      : resolve(projectDir, '.claude');
  }

  async install(item, projectDir, scope, options = {}) {
    const base = this._targetBase(scope, projectDir);

    if (item.type === 'skill') {
      return this._installSkill(item, base, scope, options);
    }
    if (item.type === 'agent') {
      return this._installAgent(item, base, scope, options);
    }
    if (item.type === 'team') {
      return this._installTeam(item, base, scope, options);
    }

    return { action: 'skipped', path: '', details: `Unknown type: ${item.type}` };
  }

  async _installSkill(item, base, scope, options) {
    const skillsDir = resolve(base, 'skills');
    const targetPath = childPath(skillsDir, item.id);

    if (options.dryRun) {
      return { action: 'created', path: targetPath, details: 'dry-run' };
    }

    return installAt({
      base: skillsDir, name: item.id, item, options, relativeLink: scope !== 'global',
      source: item.sourceDir || resolve(options.almanacRoot, 'skills', item.id),
    });
  }

  async _installAgent(item, base, scope, options) {
    // Claude Code discovers agents through one directory: .claude/agents/ is
    // a link to agents/, or with --from-package copy a copy of all of it.
    const agentsLink = resolve(base, 'agents');

    if (options.dryRun) {
      return { action: 'created', path: agentsLink, details: 'dry-run: agents directory symlink' };
    }

    return installAt({
      base, name: 'agents', item, options, relativeLink: scope !== 'global',
      source: resolve(options.almanacRoot, 'agents'),
      existsDetails: 'agents symlink already exists', createdDetails: 'agents directory symlink',
    });
  }

  async _installTeam(item, base, scope, options) {
    // Teams are NOT symlinked. Claude Code's TeamCreate writes runtime state
    // to ~/.claude/teams/, so we must not occupy that path with a symlink.
    // Team definitions in teams/ are read directly when activating a team.
    return {
      action: 'skipped',
      path: resolve(base, 'teams'),
      details: 'Team definitions are blueprints read directly from teams/ — no symlink needed. Use TeamCreate at runtime to activate.'
    };
  }

  async uninstall(item, projectDir, scope, options = {}) {
    const base = this._targetBase(scope, projectDir);

    if (item.type === 'skill') {
      return removeEntry(resolve(base, 'skills'), item.id, { dryRun: options.dryRun });
    }

    if (item.type === 'agent') {
      return removeEntry(base, 'agents', { dryRun: options.dryRun });
    }

    if (item.type === 'team') {
      // install never writes <base>/teams: at -g it is ~/.claude/teams, where
      // TeamCreate keeps its runtime state, and every `scatter` reaches this
      // branch. An older CLI linked it, and audit() calls such a link stale, so
      // a link (dangling or not) is removed. Anything else is not the CLI's and
      // is never touched, nor consulted for a copy marker. It is reported as
      // not installed, without the kept-entry note, because nearly every
      // machine with Claude Code has a real one (S3-B2 F2).
      const teamsLink = resolve(base, 'teams');
      if (classify(teamsLink).kind !== 'link') return { action: 'skipped', path: teamsLink, details: 'not installed' };
      return removeEntry(base, 'teams', { dryRun: options.dryRun });
    }

    return { action: 'skipped', path: '', details: `Unknown type: ${item.type}` };
  }

  async listInstalled(projectDir, scope) {
    const base = this._targetBase(scope, projectDir);
    const skillsDir = resolve(base, 'skills');
    const items = [];

    // What the CLI can have made here: links and its own copies. A directory a
    // user made is not listed, unless it carries a copy marker the CLI cannot
    // read, which audit reports. Staging directories are skipped.
    const listed = (kind, fields) => kind === 'link' || kind === 'copy' || fields.markerUnreadable === true;

    if (existsSync(skillsDir)) {
      for (const name of readdirSync(skillsDir)) {
        if (isInternalName(name)) continue;
        const fullPath = resolve(skillsDir, name);
        const { kind, fields } = describeEntry(fullPath);
        if (listed(kind, fields)) items.push({ id: name, type: 'skill', path: fullPath, ...fields });
      }
    }

    // By lstat: existsSync follows the link, so a dangling one went unlisted
    // and audit() called it missing rather than broken.
    const agentsLink = resolve(base, 'agents');
    const agents = describeEntry(agentsLink);
    if (listed(agents.kind, agents.fields)) {
      items.push({ id: 'agents', type: 'agent', path: agentsLink, ...agents.fields });
    }

    // Teams are not symlinked (TeamCreate uses ~/.claude/teams/ for runtime state)

    return items;
  }

  async audit(projectDir, scope, listed) {
    const base = this._targetBase(scope, projectDir);
    const installed = listed ?? await this.listInstalled(projectDir, scope);
    const result = {
      framework: ClaudeCodeAdapter.displayName,
      ok: [],
      warnings: [],
      errors: [],
    };

    const skills = installed.filter(i => i.type === 'skill');
    const broken = skills.filter(i => i.broken);
    const valid = skills.filter(i => !i.broken);

    if (valid.length > 0) result.ok.push(`${valid.length} skills installed`);
    if (broken.length > 0) result.errors.push(`${broken.length} broken skill symlinks`);

    const agentsEntry = installed.find(i => i.id === 'agents');
    if (agentsEntry) {
      if (agentsEntry.broken) result.errors.push('agents symlink is broken');
      else if (agentsEntry.copy) result.ok.push('agents directory is a copy');
      // An unreadable marker is reported by auditAll(), with the other copies.
      else if (!agentsEntry.markerUnreadable) result.ok.push('agents symlink valid');
    } else {
      result.warnings.push('No agents symlink');
    }

    // Warn if a stale teams symlink exists (misconfiguration — collides with TeamCreate runtime state)
    const teamsLink = resolve(base, 'teams');
    try {
      if (lstatSync(teamsLink).isSymbolicLink()) {
        result.warnings.push('teams symlink exists — remove it to avoid collision with TeamCreate runtime state');
      }
    } catch { /* no symlink — correct state */ }

    return result;
  }
}
