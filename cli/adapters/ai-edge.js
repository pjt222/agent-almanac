/**
 * ai-edge.js — Google AI Edge Gallery / on-device LLM adapter.
 *
 * Distills almanac content into compact instruction fragments suitable for
 * on-device models with small context windows (2K-8K tokens). Outputs are
 * plain text files bundled into a directory that can be embedded in a mobile
 * app or pushed to a device.
 *
 * Strategy: distill (aggressive transformation, ~20-40 lines per skill)
 * Content types: skills, agents, teams
 * Output: .ai-edge/skills/<id>.md, .ai-edge/agents/<id>.md, .ai-edge/bundle.md
 */

import { existsSync, mkdirSync, writeFileSync, unlinkSync, readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { FrameworkAdapter } from './base.js';
import { distillSkill, distillAgent, distillTeam, bundleForEdge } from '../lib/edge-transformer.js';

export class AiEdgeAdapter extends FrameworkAdapter {
  static id = 'ai-edge';
  static displayName = 'Google AI Edge';
  static strategy = 'distill';
  static contentTypes = ['skill', 'agent', 'team'];

  async detect(projectDir) {
    // Detect AI Edge Gallery project or .ai-edge/ directory
    return (
      existsSync(resolve(projectDir, '.ai-edge')) ||
      existsSync(resolve(projectDir, 'ai-edge-gallery.json')) ||
      existsSync(resolve(projectDir, 'app/src/main/assets/models'))
    );
  }

  _targetDir(projectDir, contentType) {
    const plural = contentType === 'skill' ? 'skills' : contentType === 'agent' ? 'agents' : 'teams';
    return resolve(projectDir, '.ai-edge', plural);
  }

  async install(item, projectDir, scope, options = {}) {
    const dir = this._targetDir(projectDir, item.type);
    const targetPath = resolve(dir, `${item.id}.md`);

    if (options.dryRun) return { action: 'created', path: targetPath, details: 'dry-run' };
    if (existsSync(targetPath) && !options.force) {
      return { action: 'skipped', path: targetPath, details: 'already exists' };
    }

    mkdirSync(dir, { recursive: true });

    // Distill content based on type
    const sourcePath = item.sourcePath || resolve(
      options.almanacRoot,
      item.type === 'skill' ? `skills/${item.id}/SKILL.md` :
      item.type === 'agent' ? `agents/${item.id}.md` :
      `teams/${item.id}.md`
    );

    let distilled;
    if (item.type === 'skill') distilled = distillSkill(sourcePath);
    else if (item.type === 'agent') distilled = distillAgent(sourcePath);
    else distilled = distillTeam(sourcePath);

    writeFileSync(targetPath, distilled, 'utf8');
    return { action: 'created', path: targetPath };
  }

  async uninstall(item, projectDir, scope, options = {}) {
    const targetPath = resolve(this._targetDir(projectDir, item.type), `${item.id}.md`);
    if (!existsSync(targetPath)) {
      return { action: 'skipped', path: '', details: 'not installed' };
    }
    if (options.dryRun) return { action: 'removed', path: targetPath, details: 'dry-run' };
    unlinkSync(targetPath);
    return { action: 'removed', path: targetPath };
  }

  async listInstalled(projectDir) {
    const items = [];
    for (const type of ['skills', 'agents', 'teams']) {
      const dir = resolve(projectDir, '.ai-edge', type);
      if (!existsSync(dir)) continue;
      const singular = type === 'skills' ? 'skill' : type === 'agents' ? 'agent' : 'team';
      for (const file of readdirSync(dir).filter(f => f.endsWith('.md'))) {
        items.push({
          id: file.replace('.md', ''),
          type: singular,
          path: resolve(dir, file),
        });
      }
    }
    return items;
  }

  /**
   * Generate a single bundle.md combining all installed skills into one
   * system prompt fragment, respecting a token budget.
   * @param {string} projectDir
   * @param {object} options
   * @param {number} [options.maxTokens=4000]
   */
  async bundle(projectDir, options = {}) {
    const installed = await this.listInstalled(projectDir);
    const items = installed
      .filter(i => i.type === 'skill')
      .map(i => ({
        type: i.type,
        id: i.id,
        content: readFileSync(i.path, 'utf8'),
      }));

    const bundled = bundleForEdge(items, { maxTokens: options.maxTokens || 4000 });
    const bundlePath = resolve(projectDir, '.ai-edge', 'bundle.md');
    writeFileSync(bundlePath, bundled, 'utf8');
    return { path: bundlePath, skills: items.length };
  }

  async audit(projectDir) {
    const installed = await this.listInstalled(projectDir);
    const bundlePath = resolve(projectDir, '.ai-edge', 'bundle.md');
    const hasBundle = existsSync(bundlePath);
    const ok = [];
    const warnings = [];

    if (installed.length > 0) ok.push(`${installed.length} items distilled`);
    if (hasBundle) ok.push('bundle.md present');
    if (!hasBundle && installed.length > 0) warnings.push('No bundle.md — run `agent-almanac bundle --framework ai-edge`');
    if (installed.length === 0) warnings.push('No content installed for AI Edge');

    return {
      framework: AiEdgeAdapter.displayName,
      ok,
      warnings,
      errors: [],
    };
  }
}
