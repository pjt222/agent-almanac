/**
 * pi.js — Pi Coding Agent adapter (pi.dev, earendil-works/pi).
 *
 * Skills: <scope>/skills/<id>/ — one symlink per skill.
 *   project scope → .pi/skills/<id>
 *   global scope  → ~/.pi/agent/skills/<id>
 * Pi discovers skills as folders containing a SKILL.md, the almanac layout
 * exactly — a plain symlink works with no transformation.
 *
 * Agents / teams: Pi has no native agent support ("build your own with
 * extensions"). Agent/team installs are opt-in via `options.piExtensions`:
 * when enabled, the definition .md is symlinked into an extension scaffold at
 * <scope>/extensions/<id>/<id>.md — the user must still write an index.ts
 * wrapper to activate it. Without the opt-in, agent/team installs are skipped.
 */

import { existsSync, mkdirSync, symlinkSync, unlinkSync, rmdirSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';
import { FrameworkAdapter } from './base.js';

export class PiAdapter extends FrameworkAdapter {
  static id = 'pi';
  static displayName = 'Pi Coding Agent';
  static strategy = 'symlink';
  static contentTypes = ['skill', 'agent', 'team'];

  async detect(projectDir) {
    return existsSync(resolve(projectDir, '.pi'));
  }

  _base(projectDir, scope) {
    return scope === 'global'
      ? resolve(homedir(), '.pi/agent')
      : resolve(projectDir, '.pi');
  }

  _skillsBase(projectDir, scope) {
    return resolve(this._base(projectDir, scope), 'skills');
  }

  _extensionsBase(projectDir, scope) {
    return resolve(this._base(projectDir, scope), 'extensions');
  }

  async install(item, projectDir, scope, options = {}) {
    if (item.type === 'skill') {
      const skillsDir = this._skillsBase(projectDir, scope);
      const targetPath = resolve(skillsDir, item.id);

      if (options.dryRun) return { action: 'created', path: targetPath, details: 'dry-run' };
      if (existsSync(targetPath) && !options.force) {
        return { action: 'skipped', path: targetPath, details: 'already exists' };
      }
      mkdirSync(skillsDir, { recursive: true });
      if (existsSync(targetPath)) try { unlinkSync(targetPath); } catch {}
      const source = item.sourceDir || resolve(options.almanacRoot, 'skills', item.id);
      symlinkSync(source, targetPath);
      return { action: 'created', path: targetPath };
    }

    if (item.type === 'agent' || item.type === 'team') {
      if (!options.piExtensions) {
        return {
          action: 'skipped',
          path: '',
          details: `${item.type} support needs --pi-extensions (Pi requires a dedicated extension)`,
        };
      }
      const extDir = resolve(this._extensionsBase(projectDir, scope), item.id);
      const targetPath = resolve(extDir, `${item.id}.md`);

      if (options.dryRun) return { action: 'created', path: targetPath, details: 'dry-run: extension scaffold' };
      if (existsSync(targetPath) && !options.force) {
        return { action: 'skipped', path: targetPath, details: 'already exists' };
      }
      mkdirSync(extDir, { recursive: true });
      if (existsSync(targetPath)) try { unlinkSync(targetPath); } catch {}
      const dir = item.type === 'agent' ? 'agents' : 'teams';
      const source = item.sourcePath || resolve(options.almanacRoot, dir, `${item.id}.md`);
      symlinkSync(source, targetPath);
      return { action: 'created', path: targetPath, details: 'extension scaffold — add an index.ts wrapper to activate' };
    }

    return { action: 'skipped', path: '', details: `${item.type}s not supported` };
  }

  async uninstall(item, projectDir, scope, options = {}) {
    if (item.type === 'skill') {
      const targetPath = resolve(this._skillsBase(projectDir, scope), item.id);
      if (!existsSync(targetPath)) return { action: 'skipped', path: targetPath, details: 'not installed' };
      if (options.dryRun) return { action: 'removed', path: targetPath, details: 'dry-run' };
      unlinkSync(targetPath);
      return { action: 'removed', path: targetPath };
    }

    if (item.type === 'agent' || item.type === 'team') {
      const extDir = resolve(this._extensionsBase(projectDir, scope), item.id);
      const targetPath = resolve(extDir, `${item.id}.md`);
      if (!existsSync(targetPath)) return { action: 'skipped', path: targetPath, details: 'not installed' };
      if (options.dryRun) return { action: 'removed', path: targetPath, details: 'dry-run' };
      // Remove only the scaffolded .md — never the directory wholesale: the
      // user may have hand-written an index.ts beside it.
      unlinkSync(targetPath);
      if (readdirSync(extDir).length === 0) {
        rmdirSync(extDir);
        return { action: 'removed', path: targetPath };
      }
      return { action: 'removed', path: targetPath, details: `kept extensions/${item.id}/ — other files present` };
    }

    return { action: 'skipped', path: '', details: `${item.type}s not supported` };
  }

  async listInstalled(projectDir, scope) {
    const items = [];
    const skillsDir = this._skillsBase(projectDir, scope);
    if (existsSync(skillsDir)) {
      for (const name of readdirSync(skillsDir)) {
        items.push({ id: name, type: 'skill', path: resolve(skillsDir, name) });
      }
    }
    const extDir = this._extensionsBase(projectDir, scope);
    if (existsSync(extDir)) {
      for (const name of readdirSync(extDir)) {
        items.push({ id: name, type: 'extension', path: resolve(extDir, name) });
      }
    }
    return items;
  }

  async audit(projectDir, scope) {
    const installed = await this.listInstalled(projectDir, scope);
    const skills = installed.filter(i => i.type === 'skill').length;
    const extensions = installed.filter(i => i.type === 'extension').length;
    const ok = [];
    if (skills > 0) ok.push(`${skills} skills installed`);
    if (extensions > 0) ok.push(`${extensions} extension scaffolds`);
    return {
      framework: PiAdapter.displayName,
      ok,
      warnings: installed.length === 0 ? ['No Pi content installed'] : [],
      errors: [],
    };
  }
}
