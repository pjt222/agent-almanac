/**
 * codex.js — OpenAI Codex adapter.
 *
 * Skills: .agents/skills/ (shared universal path)
 * Agents: append sections to AGENTS.md
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { FrameworkAdapter } from './base.js';
import { condenseSkill, condenseAgent, wrapInMarkers, removeMarkedSection, hasMarkedSection } from '../lib/transformer.js';

export class CodexAdapter extends FrameworkAdapter {
  static id = 'codex';
  static displayName = 'OpenAI Codex';
  static strategy = 'append-to-file';
  static contentTypes = ['skill', 'agent'];

  async detect(projectDir) {
    return existsSync(resolve(projectDir, 'AGENTS.md'));
  }

  _agentsFile(projectDir) {
    return resolve(projectDir, 'AGENTS.md');
  }

  async install(item, projectDir, scope, options = {}) {
    // Skills use the universal .agents/skills/ path — handled by universal adapter
    if (item.type === 'skill') {
      return { action: 'skipped', path: '', details: 'Skills handled by universal adapter' };
    }

    if (item.type === 'agent') {
      const filePath = this._agentsFile(projectDir);
      if (options.dryRun) return { action: 'created', path: filePath, details: 'dry-run: append to AGENTS.md' };

      let content = existsSync(filePath) ? readFileSync(filePath, 'utf8') : '';
      if (hasMarkedSection(content, 'agent', item.id) && !options.force) {
        return { action: 'skipped', path: filePath, details: 'already in AGENTS.md' };
      }

      content = removeMarkedSection(content, 'agent', item.id);
      const condensed = condenseAgent(item.sourcePath);
      const section = wrapInMarkers('agent', item.id, condensed);
      content = content.trimEnd() + '\n\n' + section + '\n';
      writeFileSync(filePath, content, 'utf8');
      return { action: 'created', path: filePath };
    }

    return { action: 'skipped', path: '', details: `${item.type}s not supported` };
  }

  async uninstall(item, projectDir, scope, options = {}) {
    if (item.type === 'agent') {
      const filePath = this._agentsFile(projectDir);
      if (!existsSync(filePath)) return { action: 'skipped', path: filePath, details: 'no AGENTS.md' };
      let content = readFileSync(filePath, 'utf8');
      if (!hasMarkedSection(content, 'agent', item.id)) return { action: 'skipped', path: filePath, details: 'not in AGENTS.md' };
      if (options.dryRun) return { action: 'removed', path: filePath, details: 'dry-run' };
      content = removeMarkedSection(content, 'agent', item.id);
      writeFileSync(filePath, content, 'utf8');
      return { action: 'removed', path: filePath };
    }
    return { action: 'skipped', path: '', details: 'Skills handled by universal adapter' };
  }

  async listInstalled() { return []; }

  async audit(projectDir) {
    const filePath = this._agentsFile(projectDir);
    return {
      framework: CodexAdapter.displayName,
      ok: existsSync(filePath) ? ['AGENTS.md exists'] : [],
      warnings: !existsSync(filePath) ? ['No AGENTS.md found'] : [],
      errors: [],
    };
  }
}
