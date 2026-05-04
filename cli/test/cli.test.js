/**
 * cli.test.js — Tests for the agent-almanac CLI.
 *
 * Uses node:test (built-in, no dependencies).
 * Run: node --test cli/test/cli.test.js
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, readlinkSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// Direct imports for unit tests.
import { renderSprite, composite, canRenderPixelArt } from '../lib/pixel-renderer.js';
import {
  CAMPFIRE_BURNING, CAMPFIRE_EMBERS, CAMPFIRE_COLD,
  getCampfireSprite,
  createAgentGlyph, getAgentPng, getTeamStrip, getCampfirePng, getCampfireFrames, GLYPH_SIZE,
} from '../lib/sprites.js';
import { buildFireScene } from '../lib/scene.js';
import { canInlineImage, renderInlineImage } from '../lib/inline-image.js';

const CLI = 'node cli/index.js';
const ROOT = process.cwd();

function run(args) {
  return execSync(`${CLI} ${args}`, { cwd: ROOT, encoding: 'utf8', timeout: 10000 });
}

// ── Registry loading ─────────────────────────────────────────────

describe('registry', () => {
  it('list shows skills count', () => {
    const out = run('list --domains');
    assert.match(out, /64 domains/);
  });

  it('list --domain r-packages shows 10 skills', () => {
    const out = run('list --domain r-packages');
    assert.match(out, /10 skills/);
  });

  it('list --agents shows 72 agents', () => {
    const out = run('list --agents');
    assert.match(out, /72 agents/);
  });

  it('list --teams shows 17 teams', () => {
    const out = run('list --teams');
    assert.match(out, /17 teams/);
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
    assert.match(out, /6 item\(s\)/);
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

  it('skips team install with guidance (dry-run)', () => {
    const out = run('install --team r-package-review --dry-run');
    assert.match(out, /claude-code/);
    assert.match(out, /skipped|blueprint/i);
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

// ── Campfire ────────────────────────────────────────────────────

describe('campfire', () => {
  const stateDir = resolve(ROOT, '.agent-almanac');

  after(() => {
    try { rmSync(stateDir, { recursive: true }); } catch {}
  });

  it('campfire --all lists all 16 campfires', () => {
    const out = run('campfire --all');
    assert.match(out, /campfires/i);
    assert.match(out, /tending/);
    assert.match(out, /r-package-review/);
    assert.match(out, /opaque-team/);
  });

  it('campfire <name> shows circle detail', () => {
    const out = run('campfire tending');
    assert.match(out, /tending/);
    assert.match(out, /fire keeper/i);
    assert.match(out, /mystic/);
    assert.match(out, /practices/);
  });

  it('campfire --map shows hearth-keepers', () => {
    const out = run('campfire --map');
    assert.match(out, /security-analyst/);
    assert.match(out, /hearth-keeper/);
  });

  it('campfire --json outputs JSON', () => {
    const out = run('campfire --json');
    const data = JSON.parse(out);
    assert.equal(data.totalTeams, 17);
    assert.ok(Array.isArray(data.fires));
  });

  it('campfire shows welcome on first run', () => {
    // Clean state first
    try { rmSync(stateDir, { recursive: true }); } catch {}
    const out = run('campfire');
    assert.match(out, /Welcome to the campfire/);
  });

  it('campfire shows "no fires" on second run', () => {
    const out = run('campfire');
    assert.match(out, /No fires burning/);
  });
});

describe('gather', () => {
  const stateDir = resolve(ROOT, '.agent-almanac');

  after(() => {
    try { rmSync(stateDir, { recursive: true }); } catch {}
  });

  it('gather --dry-run shows arrival ceremony', () => {
    const out = run('gather tending --dry-run');
    assert.match(out, /DRY RUN/);
    assert.match(out, /Gathering the.*tending.*circle/);
    assert.match(out, /mystic/);
    assert.match(out, /fire burns/i);
  });

  it('gather --dry-run --ceremonial shows individual skills', () => {
    const out = run('gather tending --dry-run --ceremonial');
    assert.match(out, /arrives/);
    // Should list individual skills with ✦
    assert.match(out, /heal|meditate/);
  });

  it('gather --dry-run --json outputs JSON', () => {
    const out = run('gather tending --dry-run --json');
    // Extract JSON block from output (skip DRY RUN header line)
    const jsonStart = out.indexOf('{');
    const jsonEnd = out.lastIndexOf('}');
    assert.ok(jsonStart >= 0, 'Should contain JSON');
    const data = JSON.parse(out.slice(jsonStart, jsonEnd + 1));
    assert.equal(data.team, 'tending');
    assert.ok(data.agents.includes('mystic'));
  });

  it('gather --only selects partial team', () => {
    const out = run('gather tending --dry-run --only mystic,gardener');
    assert.match(out, /mystic/);
    assert.match(out, /gardener/);
  });

  it('gather rejects unknown team', () => {
    assert.throws(() => run('gather nonexistent-team'), /Unknown campfire/);
  });
});

describe('scatter', () => {
  it('scatter rejects ungathered team with suggestion', () => {
    let caught;
    assert.throws(() => run('scatter tending'), (err) => {
      caught = err;
      return /not burning/.test(err.stderr);
    });
    assert.match(caught.stderr, /gather/, 'error should suggest gather command');
  });
});

describe('tend', () => {
  it('tend with no fires shows message', () => {
    const out = run('tend');
    assert.match(out, /No fires to tend/);
  });

  it('tend --dry-run does not update lastWarmed', () => {
    // Gather first to have a fire
    run('gather tending --quiet');
    const stateFile = resolve(ROOT, '.agent-almanac/state.json');

    // Backdate lastWarmed so we can detect if it changes
    const state = JSON.parse(readFileSync(stateFile, 'utf8'));
    state.fires.tending.lastWarmed = '2020-01-01T00:00:00.000Z';
    writeFileSync(stateFile, JSON.stringify(state, null, 2));

    run('tend --dry-run');
    const stateAfter = JSON.parse(readFileSync(stateFile, 'utf8'));
    assert.equal(stateAfter.fires.tending.lastWarmed, '2020-01-01T00:00:00.000Z', 'lastWarmed should not change with --dry-run');

    // Clean up
    try { rmSync(resolve(ROOT, '.agent-almanac'), { recursive: true }); } catch {}
  });

  it('tend (without --dry-run) does update lastWarmed', () => {
    // Gather first
    run('gather tending --quiet');
    const stateFile = resolve(ROOT, '.agent-almanac/state.json');

    // Backdate lastWarmed to ensure it changes
    const state = JSON.parse(readFileSync(stateFile, 'utf8'));
    state.fires.tending.lastWarmed = '2020-01-01T00:00:00.000Z';
    writeFileSync(stateFile, JSON.stringify(state, null, 2));

    run('tend');
    const stateAfter = JSON.parse(readFileSync(stateFile, 'utf8'));
    assert.notEqual(stateAfter.fires.tending.lastWarmed, '2020-01-01T00:00:00.000Z', 'lastWarmed should update');

    // Clean up
    try { rmSync(resolve(ROOT, '.agent-almanac'), { recursive: true }); } catch {}
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
    assert.match(out, /campfire/);
    assert.match(out, /gather/);
    assert.match(out, /scatter/);
    assert.match(out, /tend/);
  });

  it('campfire help includes examples', () => {
    const out = run('campfire --help');
    assert.match(out, /Examples:/);
    assert.match(out, /campfire --all/);
  });

  it('gather help includes examples', () => {
    const out = run('gather --help');
    assert.match(out, /Examples:/);
    assert.match(out, /gather tending/);
  });

  it('scatter help includes examples', () => {
    const out = run('scatter --help');
    assert.match(out, /Examples:/);
    assert.match(out, /scatter tending/);
  });

  it('tend help includes examples', () => {
    const out = run('tend --help');
    assert.match(out, /Examples:/);
    assert.match(out, /tend --dry-run/);
  });
});

// ── Pixel Renderer ──────────────────────────────────────────────────

describe('pixel-renderer', () => {
  it('renderSprite produces correct row count for even-height sprite', () => {
    const sprite = [
      ['#FF0000', '#00FF00'],
      ['#0000FF', null],
    ];
    const lines = renderSprite(sprite);
    assert.equal(lines.length, 1, '2 pixel rows → 1 terminal row');
  });

  it('renderSprite pads odd-height sprite', () => {
    const sprite = [
      ['#FF0000', '#00FF00'],
      ['#0000FF', null],
      ['#FFFF00', '#FF00FF'],
    ];
    const lines = renderSprite(sprite);
    assert.equal(lines.length, 2, '3 pixel rows → 2 terminal rows (padded to 4)');
  });

  it('renderSprite handles all-null row', () => {
    const sprite = [
      [null, null, null],
      [null, null, null],
    ];
    const lines = renderSprite(sprite);
    assert.equal(lines.length, 1);
    assert.equal(lines[0].trim(), '');
  });

  it('renderSprite applies indent', () => {
    const sprite = [
      ['#FF0000'],
      ['#00FF00'],
    ];
    const lines = renderSprite(sprite, { indent: 5 });
    assert.ok(lines[0].startsWith('     '), 'should start with 5 spaces');
  });

  it('composite places sprite at correct offset', () => {
    const sprite = [['#FF0000']];
    const canvas = composite(3, 2, [{ sprite, x: 2, y: 1 }]);
    assert.equal(canvas[0][0], null);
    assert.equal(canvas[0][2], null);
    assert.equal(canvas[1][2], '#FF0000');
  });

  it('composite later layers overwrite earlier', () => {
    const a = [['#FF0000']];
    const b = [['#00FF00']];
    const canvas = composite(1, 1, [
      { sprite: a, x: 0, y: 0 },
      { sprite: b, x: 0, y: 0 },
    ]);
    assert.equal(canvas[0][0], '#00FF00');
  });

  it('canRenderPixelArt returns false in non-TTY test env', () => {
    assert.equal(canRenderPixelArt(), false);
  });
});

// ── Sprites ─────────────────────────────────────────────────────────

describe('sprites', () => {
  const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

  function validateSprite(sprite, name) {
    assert.ok(sprite.length > 0, `${name} should have rows`);
    assert.ok(sprite.length % 2 === 0, `${name} height should be even (got ${sprite.length})`);
    const width = sprite[0].length;
    for (let r = 0; r < sprite.length; r++) {
      assert.equal(sprite[r].length, width, `${name} row ${r} width should be ${width}`);
      for (let c = 0; c < sprite[r].length; c++) {
        const pixel = sprite[r][c];
        assert.ok(pixel === null || HEX_RE.test(pixel), `${name}[${r}][${c}] invalid: ${pixel}`);
      }
    }
  }

  it('CAMPFIRE_BURNING is valid 16x14', () => {
    validateSprite(CAMPFIRE_BURNING, 'BURNING');
    assert.equal(CAMPFIRE_BURNING[0].length, 16);
    assert.equal(CAMPFIRE_BURNING.length, 14);
  });

  it('CAMPFIRE_EMBERS is valid 16x10', () => {
    validateSprite(CAMPFIRE_EMBERS, 'EMBERS');
    assert.equal(CAMPFIRE_EMBERS[0].length, 16);
    assert.equal(CAMPFIRE_EMBERS.length, 10);
  });

  it('CAMPFIRE_COLD is valid 16x8', () => {
    validateSprite(CAMPFIRE_COLD, 'COLD');
    assert.equal(CAMPFIRE_COLD[0].length, 16);
    assert.equal(CAMPFIRE_COLD.length, 8);
  });

  it('getCampfireSprite returns correct variant', () => {
    assert.strictEqual(getCampfireSprite('burning'), CAMPFIRE_BURNING);
    assert.strictEqual(getCampfireSprite('embers'), CAMPFIRE_EMBERS);
    assert.strictEqual(getCampfireSprite('cold'), CAMPFIRE_COLD);
    assert.strictEqual(getCampfireSprite('unknown'), CAMPFIRE_COLD);
  });

  it('createAgentGlyph returns GLYPH_SIZE x GLYPH_SIZE sprite for known agent', () => {
    const glyph = createAgentGlyph('mystic');
    assert.equal(glyph.length, GLYPH_SIZE, `should be ${GLYPH_SIZE} rows`);
    assert.equal(glyph[0].length, GLYPH_SIZE, `should be ${GLYPH_SIZE} cols`);
    const filled = glyph.flat().filter(p => p !== null).length;
    assert.ok(filled > 0, 'mystic glyph should have colored pixels');
  });

  it('createAgentGlyph lead variant has amber accent', () => {
    const glyph = createAgentGlyph('r-developer', true);
    assert.equal(glyph[0][0], '#FFB347', 'top-left should be amber');
  });

  it('createAgentGlyph falls back for unknown agent', () => {
    const glyph = createAgentGlyph('unknown-agent-xyz');
    assert.equal(glyph.length, GLYPH_SIZE);
    assert.equal(glyph[0].length, GLYPH_SIZE);
  });
});

// ── Inline Image ────────────────────────────────────────────────────

describe('inline-image', () => {
  it('canInlineImage returns false in non-TTY test env', () => {
    assert.equal(canInlineImage(), false);
  });

  it('renderInlineImage with widthPx produces valid escape sequence', () => {
    const seq = renderInlineImage('iVBORw0KGgo=', { widthPx: 150 });
    assert.ok(seq.includes('1337;File=inline=1'), 'should contain iTerm2 protocol');
    assert.ok(seq.includes('width=150px'), 'should contain pixel width');
    assert.ok(seq.includes('iVBORw0KGgo='), 'should contain base64 data');
  });

  it('renderInlineImage with heightPx produces valid escape sequence', () => {
    const seq = renderInlineImage('iVBORw0KGgo=', { heightPx: 120 });
    assert.ok(seq.includes('height=120px'), 'should contain pixel height');
    assert.ok(!seq.includes('width='), 'should not contain width when only height specified');
  });

  it('renderInlineImage with no size omits dimensions', () => {
    const seq = renderInlineImage('iVBORw0KGgo=');
    assert.ok(!seq.includes('width='), 'no width');
    assert.ok(!seq.includes('height='), 'no height');
    assert.ok(seq.includes('preserveAspectRatio=1'), 'should preserve aspect ratio');
  });

  it('getAgentPng returns base64 string for known agent', () => {
    const png = getAgentPng('mystic');
    assert.ok(png, 'mystic should have PNG data');
    assert.ok(png.startsWith('iVBOR'), 'should be base64 PNG');
  });

  it('getAgentPng returns null for unknown agent', () => {
    assert.equal(getAgentPng('nonexistent-xyz'), null);
  });

  it('getCampfirePng returns base64 string for burning', () => {
    const png = getCampfirePng('burning');
    assert.ok(png, 'burning should have PNG data');
    assert.ok(png.startsWith('iVBOR'), 'should be base64 PNG');
  });

  it('getCampfirePng returns base64 string for embers and cold', () => {
    assert.ok(getCampfirePng('embers'), 'embers should have PNG data');
    assert.ok(getCampfirePng('cold'), 'cold should have PNG data');
  });

  it('getCampfirePng returns null for unknown state', () => {
    assert.equal(getCampfirePng('nonexistent-xyz'), null);
  });

  it('getCampfireFrames returns array for burning', () => {
    const frames = getCampfireFrames('burning');
    assert.ok(Array.isArray(frames), 'should be array');
    assert.ok(frames.length > 1, 'burning should have multiple frames');
    assert.ok(frames[0].startsWith('iVBOR'), 'frames should be base64 PNG');
  });

  it('getCampfireFrames returns single-element array for embers', () => {
    const frames = getCampfireFrames('embers');
    assert.ok(Array.isArray(frames), 'should be array');
    assert.equal(frames.length, 1, 'embers has one frame');
  });

  it('getTeamStrip returns base64 string for known team', () => {
    const strip = getTeamStrip('tending');
    assert.ok(strip === null || (typeof strip === 'string' && strip.startsWith('iVBOR')),
      'should be null or base64 PNG');
  });

  it('getTeamStrip returns null for unknown team', () => {
    assert.equal(getTeamStrip('nonexistent-xyz'), null);
  });
});

// ── Scene ───────────────────────────────────────────────────────────

describe('scene', () => {
  it('buildFireScene returns lines for fire-only', () => {
    // Non-TTY: canInlineImage() false → half-block: 14px / 2 = 7 rows
    const lines = buildFireScene({ state: 'burning', maxWidth: 80 });
    assert.ok(lines.length > 0, 'should return terminal lines');
    assert.equal(lines.length, 7, 'burning half-block = 7 terminal rows');
  });

  it('buildFireScene returns lines with agents', () => {
    // Non-TTY: half-block path
    const lines = buildFireScene({
      state: 'burning',
      agentIds: ['mystic', 'alchemist', 'gardener'],
      leadId: 'mystic',
      maxWidth: 250,
    });
    const expectedRows = (14 + 2 + GLYPH_SIZE) / 2;
    assert.equal(lines.length, expectedRows, `half-block: fire + gap + glyphs = ${expectedRows} rows`);
  });

  it('buildFireScene uses cold sprite for cold state', () => {
    const lines = buildFireScene({ state: 'cold', maxWidth: 80 });
    assert.equal(lines.length, 4);
  });
});
