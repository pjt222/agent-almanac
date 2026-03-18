/**
 * cli.test.js — Tests for the agent-almanac CLI.
 *
 * Uses node:test (built-in, no dependencies).
 * Run: node --test cli/test/cli.test.js
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, readlinkSync } from 'fs';
import { resolve } from 'path';

const CLI = 'node cli/index.js';
const ROOT = process.cwd();

function run(args) {
  return execSync(`${CLI} ${args}`, { cwd: ROOT, encoding: 'utf8', timeout: 10000 });
}

// ── Registry loading ─────────────────────────────────────────────

describe('registry', () => {
  it('list shows skills count', () => {
    const out = run('list --domains');
    assert.match(out, /58 domains/);
  });

  it('list --domain r-packages shows 10 skills', () => {
    const out = run('list --domain r-packages');
    assert.match(out, /10 skills/);
  });

  it('list --agents shows 66 agents', () => {
    const out = run('list --agents');
    assert.match(out, /66 agents/);
  });

  it('list --teams shows 15 teams', () => {
    const out = run('list --teams');
    assert.match(out, /15 teams/);
  });
});

// ── Search ───────────────────────────────────────────────────────

describe('search', () => {
  it('finds skills by keyword', () => {
    const out = run('search docker');
    assert.match(out, /result\(s\) for "docker"/);
    assert.match(out, /create-r-dockerfile/);
  });

  it('finds agents by keyword', () => {
    const out = run('search "security"');
    assert.match(out, /security-analyst/);
  });

  it('returns 0 results for nonsense', () => {
    const out = run('search "xyzzy-nonexistent-12345"');
    assert.match(out, /0 result/);
  });
});

// ── Detection ────────────────────────────────────────────────────

describe('detect', () => {
  it('detects Universal and Claude Code', () => {
    const out = run('detect');
    assert.match(out, /Universal/);
    assert.match(out, /Claude Code/);
  });
});

// ── Install / Uninstall ──────────────────────────────────────────

describe('install', () => {
  const testSkillDir = resolve(ROOT, '.agents/skills/commit-changes');

  after(() => {
    // Clean up
    try { rmSync(resolve(ROOT, '.agents/skills/commit-changes')); } catch {}
    try { rmSync(resolve(ROOT, '.agents/skills'), { recursive: true }); } catch {}
    try { rmSync(resolve(ROOT, '.agents'), { recursive: true }); } catch {}
    // Restore claude symlink if removed
    if (!existsSync(resolve(ROOT, '.claude/skills/commit-changes'))) {
      try {
        execSync(`ln -s ../../skills/commit-changes .claude/skills/commit-changes`, { cwd: ROOT });
      } catch {}
    }
  });

  it('dry-run does not create files', () => {
    const out = run('install commit-changes --dry-run');
    assert.match(out, /DRY RUN/);
    assert.match(out, /installed/);
  });

  it('installs a skill to .agents/skills/', () => {
    run('install commit-changes');
    assert.ok(existsSync(testSkillDir), '.agents/skills/commit-changes should exist');
  });

  it('skips already installed', () => {
    const out = run('install commit-changes');
    assert.match(out, /skipped/);
  });

  it('uninstalls from .agents/skills/', () => {
    run('uninstall commit-changes');
    assert.ok(!existsSync(testSkillDir), 'should be removed');
  });

  it('domain install resolves all skills', () => {
    const out = run('install --domain git --dry-run');
    assert.match(out, /7 item\(s\)/);
  });

  it('agent install with --with-deps includes skills', () => {
    const out = run('install --agent r-developer --with-deps --dry-run');
    assert.match(out, /30 item\(s\)/);
  });

  it('team install warns for unsupported content type', () => {
    const out = run('install --team r-package-review --dry-run');
    // Universal adapter skips teams silently, Claude Code handles it
    assert.match(out, /claude-code/);
  });
});

// ── Audit ────────────────────────────────────────────────────────

describe('audit', () => {
  it('reports Claude Code health', () => {
    const out = run('audit');
    assert.match(out, /Claude Code/);
    assert.match(out, /skills installed/);
  });
});

// ── Init ─────────────────────────────────────────────────────────

describe('init', () => {
  const manifestPath = resolve(ROOT, 'agent-almanac.yml');

  after(() => {
    try { rmSync(manifestPath); } catch {}
  });

  it('creates agent-almanac.yml', () => {
    run('init');
    assert.ok(existsSync(manifestPath));
  });
});

// ── Framework-specific installs ──────────────────────────────────

describe('adapter: claude-code', () => {
  after(() => {
    if (!existsSync(resolve(ROOT, '.claude/skills/commit-changes'))) {
      try {
        execSync(`ln -s ../../skills/commit-changes .claude/skills/commit-changes`, { cwd: ROOT });
      } catch {}
    }
  });

  it('installs skill to .claude/skills/', () => {
    assert.ok(existsSync(resolve(ROOT, '.claude/skills/commit-changes')));
  });

  it('installs agent to .claude/agents (dry-run)', () => {
    const out = run('install --agent r-developer --dry-run');
    assert.match(out, /claude-code/);
    assert.match(out, /r-developer/);
  });

  it('installs team to .claude/teams (dry-run)', () => {
    const out = run('install --team r-package-review --dry-run');
    assert.match(out, /claude-code/);
    assert.match(out, /r-package-review/);
  });
});

describe('adapter: cursor (dry-run)', () => {
  it('targets .cursor/skills/ path', () => {
    const out = run('install commit-changes --framework cursor --dry-run');
    assert.match(out, /\.cursor\/skills/i);
  });
});

describe('adapter: copilot (dry-run)', () => {
  it('targets .github/ path', () => {
    const out = run('install commit-changes --framework copilot --dry-run');
    assert.match(out, /\.github/i);
  });
});

describe('adapter: gemini (dry-run)', () => {
  it('targets .gemini/skills/ path', () => {
    const out = run('install commit-changes --framework gemini --dry-run');
    assert.match(out, /\.gemini\/skills/i);
  });
});

describe('adapter: aider (dry-run)', () => {
  it('targets CONVENTIONS.md path', () => {
    const out = run('install commit-changes --framework aider --dry-run');
    assert.match(out, /CONVENTIONS/i);
  });
});

describe('adapter: opencode (dry-run)', () => {
  it('targets .opencode/skills/ path', () => {
    const out = run('install commit-changes --framework opencode --dry-run');
    assert.match(out, /\.opencode\/skills/i);
  });
});

describe('adapter: windsurf (dry-run)', () => {
  it('targets .windsurf path', () => {
    const out = run('install commit-changes --framework windsurf --dry-run');
    assert.match(out, /\.windsurf/i);
  });
});

describe('adapter: vibe (dry-run)', () => {
  it('targets .vibe/skills/ path', () => {
    const out = run('install commit-changes --framework vibe --dry-run');
    assert.match(out, /\.vibe\/skills/i);
  });
});

// ── Version ──────────────────────────────────────────────────────

describe('meta', () => {
  it('shows version', () => {
    const out = run('--version');
    assert.match(out, /\d+\.\d+\.\d+/);
  });

  it('shows help', () => {
    const out = run('--help');
    assert.match(out, /install/);
    assert.match(out, /detect/);
    assert.match(out, /audit/);
    assert.match(out, /init/);
    assert.match(out, /sync/);
  });
});
