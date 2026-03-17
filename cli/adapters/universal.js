/**
 * universal.js — Universal .agents/skills/ adapter.
 *
 * Installs skills to the de facto cross-client interoperability path.
 * Covers: OpenCode, Cursor, VS Code/Copilot, Gemini CLI, Mistral Vibe,
 * Autohand, Letta, and any agentskills.io-compliant tool.
 *
 * Skills only — agents and teams are framework-specific.
 */

import { existsSync, mkdirSync, symlinkSync, unlinkSync, readdirSync, lstatSync, readlinkSync } from 'fs';
import { resolve, relative } from 'path';
import { homedir } from 'os';
import { FrameworkAdapter } from './base.js';

export class UniversalAdapter extends FrameworkAdapter {
  static id = 'universal';
  static displayName = 'Universal (.agents/)';
  static strategy = 'symlink';
  static contentTypes = ['skill'];

  async detect(projectDir) {
    return true;
  }

  _targetBase(projectDir, scope) {
    return scope === 'global'
      ? resolve(homedir(), '.agents/skills')
      : resolve(projectDir, '.agents/skills');
  }

  async install(item, projectDir, scope, options = {}) {
    if (item.type !== 'skill') {
      return { action: 'skipped', path: '', details: 'Universal adapter only supports skills' };
    }

    const targetBase = this._targetBase(projectDir, scope);

    const targetPath = resolve(targetBase, item.id);

    if (options.dryRun) {
      return { action: 'created', path: targetPath, details: 'dry-run' };
    }

    if (existsSync(targetPath)) {
      if (!options.force) {
        return { action: 'skipped', path: targetPath, details: 'already exists' };
      }
      // Remove existing to replace
      try { unlinkSync(targetPath); } catch { /* directory, not symlink */ }
    }

    // Ensure parent directory exists
    mkdirSync(targetBase, { recursive: true });

    // Use relative symlinks for project scope, absolute for global
    const source = item.sourceDir || resolve(options.almanacRoot, 'skills', item.id);
    if (scope === 'global') {
      symlinkSync(source, targetPath);
    } else {
      const rel = relative(targetBase, source);
      symlinkSync(rel, targetPath);
    }

    return { action: 'created', path: targetPath };
  }

  async uninstall(item, projectDir, scope, options = {}) {
    const targetBase = this._targetBase(projectDir, scope);

    const targetPath = resolve(targetBase, item.id);

    if (options.dryRun) {
      return { action: 'removed', path: targetPath, details: 'dry-run' };
    }

    if (!existsSync(targetPath)) {
      return { action: 'skipped', path: targetPath, details: 'not installed' };
    }

    unlinkSync(targetPath);
    return { action: 'removed', path: targetPath };
  }

  async listInstalled(projectDir, scope) {
    const targetBase = this._targetBase(projectDir, scope);

    if (!existsSync(targetBase)) return [];

    const entries = readdirSync(targetBase);
    return entries.map(name => {
      const fullPath = resolve(targetBase, name);
      const stat = lstatSync(fullPath);
      const isSymlink = stat.isSymbolicLink();
      let target = null;
      let broken = false;
      if (isSymlink) {
        try {
          target = readlinkSync(fullPath);
          broken = !existsSync(fullPath);
        } catch { broken = true; }
      }
      return { id: name, type: 'skill', path: fullPath, isSymlink, target, broken };
    });
  }

  async audit(projectDir, scope) {
    const installed = await this.listInstalled(projectDir, scope);
    const result = {
      framework: UniversalAdapter.displayName,
      ok: [],
      warnings: [],
      errors: [],
    };

    const broken = installed.filter(i => i.broken);
    const valid = installed.filter(i => !i.broken);

    if (valid.length > 0) {
      result.ok.push(`${valid.length} skills installed`);
    }
    if (broken.length > 0) {
      result.errors.push(`${broken.length} broken symlinks: ${broken.map(b => b.id).join(', ')}`);
    }
    if (installed.length === 0) {
      result.warnings.push('No skills installed in .agents/skills/');
    }

    return result;
  }
}
