/**
 * openclaw.js — OpenClaw/NemoClaw adapter.
 *
 * Skills: copy to ~/.openclaw/workspace/<id>/
 * Agents: append sections to AGENTS.md
 * Global scope only.
 * Also covers NemoClaw (NVIDIA's OpenClaw + Nemotron + OpenShell stack).
 */

import { existsSync, mkdirSync, symlinkSync, unlinkSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';
import { FrameworkAdapter } from './base.js';
import { condenseAgent, wrapInMarkers, removeMarkedSection, hasMarkedSection } from '../lib/transformer.js';

export class OpenClawAdapter extends FrameworkAdapter {
  static id = 'openclaw';
  static displayName = 'OpenClaw/NemoClaw';
  static strategy = 'symlink';
  static contentTypes = ['skill', 'agent'];

  async detect() {
    return existsSync(resolve(homedir(), '.openclaw/openclaw.json')) ||
           existsSync(resolve(homedir(), '.nemoclaw'));
  }

  _workspaceDir() {
    return resolve(homedir(), '.openclaw/workspace');
  }

  _agentsFile() {
    return resolve(this._workspaceDir(), 'AGENTS.md');
  }

  async install(item, projectDir, scope, options = {}) {
    if (item.type === 'skill') {
      const targetPath = resolve(this._workspaceDir(), item.id);
      if (options.dryRun) return { action: 'created', path: targetPath, details: 'dry-run' };
      if (existsSync(targetPath) && !options.force) return { action: 'skipped', path: targetPath, details: 'already exists' };
      mkdirSync(this._workspaceDir(), { recursive: true });
      if (existsSync(targetPath)) try { unlinkSync(targetPath); } catch {}
      const source = item.sourceDir || resolve(options.almanacRoot, 'skills', item.id);
      symlinkSync(source, targetPath);
      return { action: 'created', path: targetPath };
    }

    if (item.type === 'agent') {
      const agentsFile = this._agentsFile();
      if (options.dryRun) return { action: 'created', path: agentsFile, details: 'dry-run: append to AGENTS.md' };

      mkdirSync(this._workspaceDir(), { recursive: true });
      let content = existsSync(agentsFile) ? readFileSync(agentsFile, 'utf8') : '';

      if (hasMarkedSection(content, 'agent', item.id) && !options.force) {
        return { action: 'skipped', path: agentsFile, details: 'already in AGENTS.md' };
      }

      content = removeMarkedSection(content, 'agent', item.id);
      const condensed = condenseAgent(item.sourcePath);
      const section = wrapInMarkers('agent', item.id, condensed);
      content = content.trimEnd() + '\n\n' + section + '\n';
      writeFileSync(agentsFile, content, 'utf8');
      return { action: 'created', path: agentsFile };
    }

    return { action: 'skipped', path: '', details: `${item.type}s not supported` };
  }

  async uninstall(item, projectDir, scope, options = {}) {
    if (item.type === 'skill') {
      const targetPath = resolve(this._workspaceDir(), item.id);
      if (options.dryRun) return { action: 'removed', path: targetPath, details: 'dry-run' };
      if (!existsSync(targetPath)) return { action: 'skipped', path: targetPath, details: 'not installed' };
      unlinkSync(targetPath);
      return { action: 'removed', path: targetPath };
    }

    if (item.type === 'agent') {
      const agentsFile = this._agentsFile();
      if (!existsSync(agentsFile)) return { action: 'skipped', path: agentsFile, details: 'no AGENTS.md' };
      let content = readFileSync(agentsFile, 'utf8');
      if (!hasMarkedSection(content, 'agent', item.id)) return { action: 'skipped', path: agentsFile, details: 'not in AGENTS.md' };
      if (options.dryRun) return { action: 'removed', path: agentsFile, details: 'dry-run' };
      content = removeMarkedSection(content, 'agent', item.id);
      writeFileSync(agentsFile, content, 'utf8');
      return { action: 'removed', path: agentsFile };
    }

    return { action: 'skipped', path: '', details: `${item.type}s not supported` };
  }

  async listInstalled(projectDir, scope) {
    const items = [];
    const wsDir = this._workspaceDir();
    if (existsSync(wsDir)) {
      for (const name of readdirSync(wsDir)) {
        if (name === 'AGENTS.md') continue;
        items.push({ id: name, type: 'skill', path: resolve(wsDir, name) });
      }
    }
    return items;
  }

  async audit(projectDir, scope) {
    const installed = await this.listInstalled(projectDir, scope);
    return {
      framework: OpenClawAdapter.displayName,
      ok: installed.length > 0 ? [`${installed.length} skills in workspace`] : [],
      warnings: installed.length === 0 ? ['No skills in ~/.openclaw/workspace/'] : [],
      errors: [],
    };
  }
}
