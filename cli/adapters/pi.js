/**
 * pi.js — pi coding agent adapter (pi.dev, @earendil-works/pi-coding-agent), #1006 and #1007.
 *
 * Skills: <project>/.pi/skills/<id>/ (project) and <agent-dir>/skills/<id>/
 * (global), the folders pi documents for its own skills. <agent-dir> is
 * resolved as pi resolves it: $PI_CODING_AGENT_DIR, else ~/.pi/agent
 * (cli/lib/pi-agent-dir.js).
 *
 * pi also reads the universal adapter's .agents/skills/, so a default install
 * in a pi project places a skill in both folders. Measured with pi 1.4.0: two
 * links to one source load once, while a copy beside a link loads once with a
 * "name collision" warning (#1006). A project's .pi/skills/ loads only after
 * pi's project-trust decision.
 *
 * Agents (#1007): <agent-dir>/agents/<id>.md, global only. pi has no built-in
 * agent loader; its example subagent extension (examples/extensions/subagent
 * in pi 1.4.0), which a user installs by hand, reads that folder by default.
 * It hands an agent's `tools` to `pi --tools` and its `model` to `pi --model`,
 * so the file is generated, not linked: tool names are translated to pi's
 * built-ins (PI_TOOL_MAP), a tool with no pi built-in is dropped and named,
 * and `model` is left out so the subagent runs on its parent's model and
 * thinking level. A generated file is owned through placement.js's sidecar
 * marker, like a copy: removed or replaced only while unedited. A link at the
 * path is the user's (pi's subagent README installs agents as links) and is
 * never removed or replaced.
 */

import { existsSync, readdirSync, readFileSync, readlinkSync } from 'fs';
import { resolve } from 'path';
import * as yaml from 'js-yaml';
import { FrameworkAdapter, childPath } from './base.js';
import {
  FOREIGN_NOTE, classify, describeEntry, installAt, isInternalName, placeCopy, readPackageIdentity, removeEntry,
} from '../lib/placement.js';
import { isHomeDirectory, isPiProject, resolvePiAgentDir } from '../lib/pi-agent-dir.js';

/**
 * Claude Code tool names, as almanac agents declare them, and the pi built-in
 * each becomes (pi 1.4.0 docs/cli.md, "Tools"). A name not listed here has no
 * pi built-in and is dropped. `Bash` stays `bash` on Windows too: pi runs its
 * bash tool through Git Bash there by default.
 */
export const PI_TOOL_MAP = Object.freeze({
  Read: 'read', Write: 'write', Edit: 'edit', Bash: 'bash', Grep: 'grep', Glob: 'find',
});

/** Printed with every pi agent install: what makes pi read the file. */
export const PI_AGENT_NOTE = "pi reads it only through its example subagent extension, or a compatible one, installed per that extension's README";

const LINK_KEPT_NOTE = `a link is here, which agent-almanac never removes or replaces in pi's agents folder; ${FOREIGN_NOTE}`;

/**
 * " for <agent-dir>/skills" when $PI_CODING_AGENT_DIR resolves, else nothing.
 * The home-directory refusal names it as a hint only: a value pi would reject
 * too, such as a file:// URL with a remote host, must not turn the refusal of
 * a project-scope install, which never reads the variable, into a failure.
 */
function globalSkillsHint() {
  try {
    return ` for ${resolve(resolvePiAgentDir(), 'skills')}`;
  } catch {
    return '';
  }
}

/**
 * An almanac agent's tools, mapped to pi's, and those with no pi built-in.
 * Order and duplicates follow the source; the result never names a pi tool
 * the source did not grant.
 * @param {string[]|string|undefined} tools
 * @returns {{ mapped: string[], dropped: string[] }}
 */
export function mapAgentTools(tools) {
  const list = Array.isArray(tools) ? tools : (typeof tools === 'string' ? tools.split(',') : []);
  const mapped = [];
  const dropped = [];
  for (const raw of list) {
    const name = String(raw).trim();
    if (name === '') continue;
    const piName = Object.hasOwn(PI_TOOL_MAP, name) ? PI_TOOL_MAP[name] : null;
    if (piName) {
      if (!mapped.includes(piName)) mapped.push(piName);
    } else if (!dropped.includes(name)) {
      dropped.push(name);
    }
  }
  return { mapped, dropped };
}

/** An agent definition split into its frontmatter fields and its body. */
function readAgentSource(sourcePath) {
  const text = readFileSync(sourcePath, 'utf8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { fields: {}, body: text };
  const fields = yaml.load(match[1]);
  return { fields: fields && typeof fields === 'object' ? fields : {}, body: match[2] };
}

/**
 * The file pi's subagent extension reads: `name`, `description` and the
 * mapped `tools` in frontmatter, then the agent's body as its system prompt.
 * No `model`, so the subagent inherits its parent's.
 * @param {{ id: string, description: string, tools: string[], body: string }} agent
 */
export function renderPiAgent({ id, description, tools, body }) {
  const frontmatter = yaml.dump({ name: id, description, tools: tools.join(', ') }, { lineWidth: -1 });
  return `---\n${frontmatter}---\n${body.startsWith('\n') ? '' : '\n'}${body}`;
}

export class PiAdapter extends FrameworkAdapter {
  static id = 'pi';
  static displayName = 'Pi Coding Agent';
  static strategy = 'symlink';
  static contentTypes = ['skill', 'agent'];
  /**
   * @type {Record<string, string[]>} #607: _targetBase() branches on scope for
   *   skills. Agents go to <agent-dir>/agents/ whatever the scope, the only
   *   folder pi's subagent extension reads by default.
   */
  static scopes = { skill: ['project', 'global'], agent: ['global'] };

  async detect(projectDir) {
    return isPiProject(projectDir);
  }

  _targetBase(projectDir, scope) {
    return scope === 'global'
      ? resolve(resolvePiAgentDir(), 'skills')
      : resolve(projectDir, '.pi/skills');
  }

  _agentsBase() {
    return resolve(resolvePiAgentDir(), 'agents');
  }

  async install(item, projectDir, scope, options = {}) {
    if (item.type === 'agent') return this._installAgent(item, options);
    if (item.type !== 'skill') {
      return { action: 'skipped', path: '', details: 'pi adapter supports skills and agents' };
    }

    const targetBase = this._targetBase(projectDir, scope);
    const targetPath = childPath(targetBase, item.id);

    // At the home directory, project scope would write ~/.pi/skills/: pi reads
    // it only when started in ~, and it is not <agent-dir>/skills/, where pi's
    // user skills live. Refused, with the flag that does what was meant.
    if (scope !== 'global' && isHomeDirectory(projectDir)) {
      return {
        action: 'skipped', path: targetPath, details: 'home directory',
        note: `project scope in your home directory would write ~/.pi/skills/; install with -g${globalSkillsHint()}`,
      };
    }

    if (options.dryRun) {
      return { action: 'created', path: targetPath, details: 'dry-run' };
    }

    // A link is relative for project scope, absolute for global.
    return installAt({
      base: targetBase, name: item.id, item, options, relativeLink: scope !== 'global',
      source: item.sourceDir || resolve(options.almanacRoot, 'skills', item.id),
    });
  }

  async _installAgent(item, options) {
    const base = this._agentsBase();
    const name = `${item.id}.md`;
    const targetPath = childPath(base, name);

    // A dry run reports what the real run would: the link and the empty-tools
    // refusals below are cheap and deterministic, so they run first (#1064 round 1, NIT-4).
    if (classify(targetPath).kind === 'link') {
      return { action: 'skipped', path: targetPath, reason: 'foreign', note: LINK_KEPT_NOTE };
    }

    const source = item.sourcePath || resolve(options.almanacRoot, 'agents', name);
    const { fields, body } = readAgentSource(source);
    const { mapped, dropped } = mapAgentTools(fields.tools ?? item.tools);
    // Without `tools:` the extension passes no --tools and pi falls back to
    // its default set, which would widen an agent that declared only tools pi
    // lacks. Refused instead.
    if (mapped.length === 0) {
      return {
        action: 'skipped', path: targetPath, details: 'no pi tools',
        note: `none of its tools has a pi built-in (${dropped.length > 0 ? dropped.join(', ') : 'it declares none'}); not installed`,
      };
    }
    if (options.dryRun) {
      return { action: 'created', path: targetPath, details: 'dry-run' };
    }

    const description = String(fields.description ?? item.description ?? item.id).trim();
    const content = renderPiAgent({ id: item.id, description, tools: mapped, body });
    const copyFrom = options.copyFrom ?? readPackageIdentity(options.almanacRoot);
    const result = placeCopy({
      base, name, source, content, almanacRoot: options.almanacRoot, copyFrom, item, force: options.force,
    });
    if (result.action !== 'created') {
      // placeCopy's note for a file it generated before names `install --force
      // --from-package copy`, which the CLI refuses from a clone. A pi agent is
      // generated in either placement, and outside copy placement plain
      // `install --force` regenerates it (#1064 round 1, SF-3).
      if (options.placement !== 'copy' && (result.reason === 'already-copied' || result.reason === 'other-version')) {
        const generatedBy = classify(targetPath).marker.package;
        return { ...result, note: `already generated from ${generatedBy.name} ${generatedBy.version}; \`install --force\` regenerates it from the current source if it is unedited` };
      }
      return result;
    }
    const droppedNote = dropped.length > 0 ? `; tools with no pi built-in were dropped: ${dropped.join(', ')}` : '';
    return { ...result, details: 'generated', note: `${PI_AGENT_NOTE}${droppedNote}` };
  }

  async uninstall(item, projectDir, scope, options = {}) {
    if (item.type === 'agent') {
      const base = this._agentsBase();
      const name = `${item.id}.md`;
      const targetPath = childPath(base, name);
      if (classify(targetPath).kind === 'link') {
        return { action: 'skipped', path: targetPath, reason: 'foreign', note: LINK_KEPT_NOTE };
      }
      return removeEntry(base, name, { dryRun: options.dryRun });
    }
    return removeEntry(this._targetBase(projectDir, scope), item.id, { dryRun: options.dryRun });
  }

  async listInstalled(projectDir, scope) {
    const items = [];
    const targetBase = this._targetBase(projectDir, scope);

    if (existsSync(targetBase)) {
      // Staging directories and markers are the CLI's bookkeeping, not items.
      for (const name of readdirSync(targetBase).filter((entry) => !isInternalName(entry))) {
        const fullPath = resolve(targetBase, name);
        const { kind, fields } = describeEntry(fullPath);
        let target = null;
        if (kind === 'link') {
          try { target = readlinkSync(fullPath); } catch { /* removed since it was listed */ }
        }
        items.push({ id: name, type: 'skill', path: fullPath, isSymlink: kind === 'link', target, ...fields });
      }
    }

    // Agents are global only, so they are listed at every scope, as vibe.js
    // lists its agents: a bare `install --agent <id> -f pi` writes globally, and
    // an audit at the same scope must see what it wrote (#1064 round 1, SF-1).
    // pi's agents folder also holds the user's own agents, so only files this
    // CLI generated are listed.
    const agentsBase = this._agentsBase();
    if (existsSync(agentsBase)) {
      for (const name of readdirSync(agentsBase).filter((entry) => entry.endsWith('.md') && !isInternalName(entry))) {
        const fullPath = resolve(agentsBase, name);
        const { kind, fields } = describeEntry(fullPath);
        if (kind !== 'copy') continue;
        items.push({ id: name.slice(0, -'.md'.length), type: 'agent', path: fullPath, isSymlink: false, target: null, ...fields });
      }
    }
    return items;
  }

  async audit(projectDir, scope, listed) {
    const installed = listed ?? await this.listInstalled(projectDir, scope);
    const result = {
      framework: PiAdapter.displayName,
      ok: [],
      warnings: [],
      errors: [],
    };

    const skills = installed.filter((i) => i.type === 'skill');
    const agents = installed.filter((i) => i.type === 'agent');
    const broken = skills.filter(i => i.broken);
    const valid = skills.filter(i => !i.broken);

    if (valid.length > 0) {
      result.ok.push(`${valid.length} skills installed in ${this._targetBase(projectDir, scope)}`);
    }
    if (agents.length > 0) {
      result.ok.push(`${agents.length} agents installed`);
    }
    if (broken.length > 0) {
      result.errors.push(`${broken.length} broken symlinks: ${broken.map(b => b.id).join(', ')}`);
    }
    if (installed.length === 0) {
      result.warnings.push(`No skills installed in ${this._targetBase(projectDir, scope)}`);
    }

    return result;
  }
}
