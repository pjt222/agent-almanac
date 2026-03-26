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
 */

import { existsSync, mkdirSync, symlinkSync, unlinkSync, readdirSync, lstatSync, readlinkSync } from 'fs';
import { resolve, relative } from 'path';
import { homedir } from 'os';
import { FrameworkAdapter } from './base.js';

export class ClaudeCodeAdapter extends FrameworkAdapter {
  static id = 'claude-code';
  static displayName = 'Claude Code';
  static strategy = 'symlink';
  static contentTypes = ['skill', 'agent', 'team'];

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
    const targetPath = resolve(skillsDir, item.id);

    if (options.dryRun) {
      return { action: 'created', path: targetPath, details: 'dry-run' };
    }

    if (existsSync(targetPath) && !options.force) {
      return { action: 'skipped', path: targetPath, details: 'already exists' };
    }

    mkdirSync(skillsDir, { recursive: true });

    // Remove existing if forcing
    if (existsSync(targetPath)) {
      try { unlinkSync(targetPath); } catch { /* ignore */ }
    }

    const source = item.sourceDir || resolve(options.almanacRoot, 'skills', item.id);

    if (scope === 'global') {
      symlinkSync(source, targetPath);
    } else {
      const rel = relative(skillsDir, source);
      symlinkSync(rel, targetPath);
    }

    return { action: 'created', path: targetPath };
  }

  async _installAgent(item, base, scope, options) {
    // Claude Code discovers agents via a directory symlink: .claude/agents/ → agents/
    const agentsLink = resolve(base, 'agents');
    const source = resolve(options.almanacRoot, 'agents');

    if (options.dryRun) {
      return { action: 'created', path: agentsLink, details: 'dry-run: agents directory symlink' };
    }

    if (existsSync(agentsLink) && !options.force) {
      return { action: 'skipped', path: agentsLink, details: 'agents symlink already exists' };
    }

    mkdirSync(base, { recursive: true });

    if (existsSync(agentsLink)) {
      try { unlinkSync(agentsLink); } catch { /* ignore */ }
    }

    if (scope === 'global') {
      symlinkSync(source, agentsLink);
    } else {
      const rel = relative(base, source);
      symlinkSync(rel, agentsLink);
    }

    return { action: 'created', path: agentsLink, details: 'agents directory symlink' };
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
      const targetPath = resolve(base, 'skills', item.id);
      if (options.dryRun) return { action: 'removed', path: targetPath, details: 'dry-run' };
      if (!existsSync(targetPath)) return { action: 'skipped', path: targetPath, details: 'not installed' };
      unlinkSync(targetPath);
      return { action: 'removed', path: targetPath };
    }

    if (item.type === 'agent') {
      const agentsLink = resolve(base, 'agents');
      if (options.dryRun) return { action: 'removed', path: agentsLink, details: 'dry-run' };
      if (!existsSync(agentsLink)) return { action: 'skipped', path: agentsLink, details: 'not installed' };
      unlinkSync(agentsLink);
      return { action: 'removed', path: agentsLink };
    }

    if (item.type === 'team') {
      const teamsLink = resolve(base, 'teams');
      if (options.dryRun) return { action: 'removed', path: teamsLink, details: 'dry-run' };
      if (!existsSync(teamsLink)) return { action: 'skipped', path: teamsLink, details: 'not installed' };
      unlinkSync(teamsLink);
      return { action: 'removed', path: teamsLink };
    }

    return { action: 'skipped', path: '', details: `Unknown type: ${item.type}` };
  }

  async listInstalled(projectDir, scope) {
    const base = this._targetBase(scope, projectDir);
    const skillsDir = resolve(base, 'skills');
    const items = [];

    // List skills
    if (existsSync(skillsDir)) {
      const entries = readdirSync(skillsDir);
      for (const name of entries) {
        const fullPath = resolve(skillsDir, name);
        const stat = lstatSync(fullPath);
        if (stat.isSymbolicLink()) {
          let broken = false;
          try { broken = !existsSync(fullPath); } catch { broken = true; }
          items.push({ id: name, type: 'skill', path: fullPath, broken });
        }
      }
    }

    // Check agents symlink
    const agentsLink = resolve(base, 'agents');
    if (existsSync(agentsLink) && lstatSync(agentsLink).isSymbolicLink()) {
      items.push({ id: 'agents', type: 'agent', path: agentsLink, broken: !existsSync(agentsLink) });
    }

    // Teams are not symlinked (TeamCreate uses ~/.claude/teams/ for runtime state)

    return items;
  }

  async audit(projectDir, scope) {
    const installed = await this.listInstalled(projectDir, scope);
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
      else result.ok.push('agents symlink valid');
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
