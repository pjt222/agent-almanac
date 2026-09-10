/**
 * cli.test.js — Tests for the agent-almanac CLI.
 *
 * Uses node:test (built-in, no dependencies).
 * Run: node --test cli/test/cli.test.js
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, readlinkSync, readFileSync, writeFileSync, symlinkSync } from 'fs';
import { tmpdir, homedir } from 'os';
import { isAbsolute, resolve } from 'path';

// Direct imports for unit tests.
import { ClaudeCodeAdapter } from '../adapters/claude-code.js';
import { CopilotAdapter } from '../adapters/copilot.js';
import { CursorAdapter } from '../adapters/cursor.js';
import { GeminiAdapter } from '../adapters/gemini.js';
import { HermesAdapter } from '../adapters/hermes.js';
import { resolveHermesHome } from '../lib/hermes-home.js';
import { OpenClawAdapter } from '../adapters/openclaw.js';
import { OpenCodeAdapter } from '../adapters/opencode.js';
import { UniversalAdapter } from '../adapters/universal.js';
import { VibeAdapter } from '../adapters/vibe.js';
import { renderSprite, composite, canRenderPixelArt } from '../lib/pixel-renderer.js';
import {
  CAMPFIRE_BURNING, CAMPFIRE_EMBERS, CAMPFIRE_COLD,
  getCampfireSprite,
  createAgentGlyph, getAgentPng, getTeamStrip, getCampfirePng, getCampfireFrames, GLYPH_SIZE,
} from '../lib/sprites.js';
import { installAll, uninstallAll, auditAll, auditExitCode, AUDIT_EXIT, warnUnsupportedScopes } from '../lib/installer.js';
import { getAdapter, listAdapterIds } from '../adapters/index.js';
import { FrameworkAdapter } from '../adapters/base.js';
import { makeChalkStub } from '../lib/chalk-stub.js';
import { detectFrameworks } from '../lib/detector.js';
import { buildFireScene } from '../lib/scene.js';
import { canInlineImage, renderInlineImage } from '../lib/inline-image.js';

const CLI = 'node cli/index.js';
const ROOT = process.cwd();

function run(args) {
  return execSync(`${CLI} ${args}`, { cwd: ROOT, encoding: 'utf8', timeout: 10000 });
}

/**
 * Run the CLI, capturing output even when it exits non-zero.
 *
 * run() uses execSync, which throws on a non-zero exit and leaves stdout on
 * err.stdout — where callers normally drop it. Since #439 `audit` exits 3 on
 * findings and 2 on a crash, so the audit assertions need the report regardless
 * of status; using run() there would let the first real finding take down the
 * whole block with an opaque error instead of a legible failure.
 *
 * run() itself is deliberately left throwing: the gather and scatter tests
 * below assert on that behaviour.
 *
 * @returns {{ stdout: string, status: number }}
 */
function runAllowFail(args) {
  try {
    const stdout = execSync(`${CLI} ${args}`, { cwd: ROOT, encoding: 'utf8', timeout: 10000 });
    return { stdout, status: 0 };
  } catch (err) {
    return { stdout: err.stdout ?? '', status: err.status ?? 1 };
  }
}

/**
 * Extract one framework's block from `audit` output (#373).
 *
 * Sections are a flush-left `<Framework>:` header followed by indented
 * `  OK|WARN|ERR  ...` entries, so the block runs to the next flush-left
 * line. Asserting against the whole output instead lets a passing sibling
 * section satisfy a match meant for this one.
 *
 * ANSI is stripped first: printAudit renders the header with chalk.bold and
 * the markers with colours, so under FORCE_COLOR the header arrives as
 * `\x1b[1mClaude Code:\x1b[22m`. Matching that literally would miss the
 * section and return '' -- which fails the OK assertion on a healthy repo
 * and, worse, makes the paired ERR check pass vacuously. Callers should
 * still assert the section is non-empty before asserting on its contents.
 */
function auditSection(out, framework) {
  // eslint-disable-next-line no-control-regex
  const lines = out.replace(/\x1b\[[0-9;]*m/g, '').split('\n');
  const start = lines.findIndex((line) => line.trim() === `${framework}:`);
  if (start === -1) return '';
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => /^\S/.test(line));
  return (end === -1 ? rest : rest.slice(0, end)).join('\n');
}

/**
 * Collect the lines reporter.warn() emits while `fn` runs (#607).
 *
 * warn() writes through console.log, so this stubs it for the duration and
 * restores it in a finally — a throw inside `fn` must not leave the suite with
 * a swallowed console.
 *
 * ANSI is stripped because warn() colours through chalk and FORCE_COLOR is set
 * in this environment, so the lines arrive wrapped in escape codes. Matching
 * them literally would miss every time and, worse, make an "expected no
 * warnings" assertion pass for the wrong reason.
 *
 * @param {() => void} fn
 * @returns {string[]} One trimmed, ANSI-free line per console.log call.
 */
function captureWarnings(fn) {
  const originalLog = console.log;
  const lines = [];
  console.log = (...args) => { lines.push(args.join(' ')); };
  try {
    fn();
  } finally {
    console.log = originalLog;
  }
  // eslint-disable-next-line no-control-regex
  return lines.map((line) => line.replace(/\x1b\[[0-9;]*m/g, '').trim());
}

/**
 * Async sibling of captureWarnings, for the orchestrators (#607).
 *
 * Separate rather than making captureWarnings await an optional promise: a
 * sync-looking helper that silently accepts an async callback restores
 * console.log before the callback finishes, losing exactly the output the test
 * is for.
 *
 * @param {() => Promise<unknown>} fn
 * @returns {Promise<string[]>}
 */
async function captureWarningsAsync(fn) {
  const originalLog = console.log;
  const lines = [];
  console.log = (...args) => { lines.push(args.join(' ')); };
  try {
    await fn();
  } finally {
    console.log = originalLog;
  }
  // eslint-disable-next-line no-control-regex
  return lines.map((line) => line.replace(/\x1b\[[0-9;]*m/g, '').trim());
}

// ── Registry-derived expectations (#307) ─────────────────────────
// Counts come from the registries at test runtime, so adding a skill,
// domain, agent, or team can never re-stale these fixtures. The CLI reads
// the same registries; these tests assert the parse/format pipe, and the
// disk==registry sync is enforced separately by validate-integrity.sh.
import * as yamlLib from 'js-yaml';
const skillsReg = yamlLib.load(readFileSync(resolve(ROOT, 'skills/_registry.yml'), 'utf8'));
const agentsReg = yamlLib.load(readFileSync(resolve(ROOT, 'agents/_registry.yml'), 'utf8'));
const teamsReg = yamlLib.load(readFileSync(resolve(ROOT, 'teams/_registry.yml'), 'utf8'));
const EXPECT = {
  domains: Object.keys(skillsReg.domains).length,
  domainSkills: (d) => skillsReg.domains[d].skills.length,
  agents: agentsReg.total_agents,
  teams: teamsReg.total_teams,
};

// ── Registry loading ─────────────────────────────────────────────

describe('registry', () => {
  it('list shows the registry domain count', () => {
    const out = run('list --domains');
    assert.match(out, new RegExp(`${EXPECT.domains} domains`));
  });

  it('list --domain r-packages shows the registry skill count', () => {
    const out = run('list --domain r-packages');
    assert.match(out, new RegExp(`${EXPECT.domainSkills('r-packages')} skills`));
  });

  it('list --agents shows the registry agent count', () => {
    const out = run('list --agents');
    assert.match(out, new RegExp(`${EXPECT.agents} agents`));
  });

  it('list --teams shows the registry team count', () => {
    const out = run('list --teams');
    assert.match(out, new RegExp(`${EXPECT.teams} teams`));
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
    assert.match(out, new RegExp(`${EXPECT.domainSkills('git')} item\\(s\\)`));
  });

  it('agent install with --with-deps includes skills', () => {
    // one item for the agent itself plus one per registry-listed skill
    const rDev = agentsReg.agents.find((a) => a.id === 'r-developer');
    const out = run('install --agent r-developer --with-deps --dry-run');
    assert.match(out, new RegExp(`${1 + rDev.skills.length} item\\(s\\)`));
  });

  it('team install warns for unsupported content type', () => {
    const out = run('install --team r-package-review --dry-run');
    // Universal adapter skips teams silently, Claude Code handles it
    assert.match(out, /claude-code/);
  });
});

// ── Audit ────────────────────────────────────────────────────────

describe('audit', () => {
  // One spawn shared by every output assertion below. `audit` takes ~3-9s on
  // a WSL/NTFS checkout against run()'s 10s execSync cap, so giving each
  // assertion its own subprocess made the suite flake on ETIMEDOUT -- and
  // package.json wires this file as prepublishOnly, so a flake blocks release.
  let out;
  before(() => {
    ({ stdout: out } = runAllowFail('audit'));
  });

  it('reports Claude Code health', () => {
    assert.match(out, /Claude Code/);
    assert.match(out, /skills installed/);
  });

  // The assertion above passed for weeks while the Claude Code audit was
  // crashing (#365): `/Claude Code/` matches only the section header, and
  // `/skills installed/` is satisfied by the Universal (.agents/) section
  // printed above it. The three below close that gap (#373). They matter
  // because auditAll() converts an adapter throw into an errors[] entry
  // (cli/lib/installer.js) and the command still exits 0 — the printed
  // output is the only signal a failure happened at all.

  it('reports no adapter failure for any framework', () => {
    assert.doesNotMatch(out, /Audit failed/);
  });

  it('reports installed skills inside the Claude Code section', () => {
    const section = auditSection(out, 'Claude Code');
    // Guard first: an empty section would make the ERR check below pass
    // vacuously, which is the same class of false green this test exists
    // to remove.
    assert.notEqual(section, '', 'no Claude Code section found in audit output');
    assert.match(section, /^\s+OK\s+\d+ skills installed$/m);
    assert.doesNotMatch(section, /ERR/);
  });

  it('audits the claude-code adapter directly without throwing', async () => {
    const result = await new ClaudeCodeAdapter().audit(ROOT, 'project');
    assert.deepEqual(result.errors, []);
    assert.ok(result.ok.some((line) => /skills installed/.test(line)));
  });

});

// ── auditAll: crash vs finding (#439) ────────────────────────────
//
// A crash and a finding reach printAudit() with the same shape — same keys,
// same types, same framework name — so the only way to tell them apart used to
// be the `Audit failed: ` prefix on the message. That is a stdout grep moved
// into the data structure, which is the fragility that killed B11 (#443).
//
// The distinction is not cosmetic. A finding means the adapter ran and reported
// something; a crash means it produced no verdict at all, so `ok` is empty and a
// wholly broken install audits as "nothing installed, nothing wrong" — which is
// how #365 survived three weeks. auditAll() now records that structurally.

describe('auditAll marks crashes structurally (#439)', () => {
  class ThrowingAdapter {
    static displayName = 'Throwing';
    async audit() { throw new Error('boom'); }
  }
  class FindingAdapter {
    static displayName = 'Finding';
    async audit() {
      return { framework: 'Finding', ok: [], warnings: [], errors: ['1 broken skill symlinks'] };
    }
  }
  class CleanAdapter {
    static displayName = 'Clean';
    async audit() {
      return { framework: 'Clean', ok: ['2 skills installed'], warnings: [], errors: [] };
    }
  }

  it('flags a thrown audit as crashed and carries the original error', async () => {
    const [entry] = await auditAll([new ThrowingAdapter()], ROOT, 'project');
    assert.equal(entry.crashed, true);
    assert.equal(entry.framework, 'Throwing');
    assert.match(entry.errors[0], /Audit failed: boom/);
    assert.ok(entry.error instanceof Error, 'the original throw should be carried');
  });

  it('does not flag an adapter that reported findings without throwing', async () => {
    const [entry] = await auditAll([new FindingAdapter()], ROOT, 'project');
    assert.equal(entry.crashed, false);
    assert.deepEqual(entry.errors, ['1 broken skill symlinks']);
  });

  it('separates crash from finding without matching on message text', async () => {
    const results = await auditAll(
      [new ThrowingAdapter(), new FindingAdapter(), new CleanAdapter()], ROOT, 'project');
    assert.deepEqual(results.map((r) => r.crashed), [true, false, false]);
    // Both the crash and the finding have a non-empty errors[]. That is exactly
    // why errors.length cannot be the discriminator and the flag has to exist.
    assert.deepEqual(results.map((r) => r.errors.length > 0), [true, true, false]);
  });

  it('sets crashed on every entry, so consumers need no undefined check', async () => {
    const results = await auditAll(
      [new CleanAdapter(), new ThrowingAdapter()], ROOT, 'project');
    assert.deepEqual(results.map((r) => Object.hasOwn(r, 'crashed')), [true, true]);
  });
});

describe('auditExitCode (#439)', () => {
  const entry = (over = {}) => (
    { framework: 'X', ok: [], warnings: [], errors: [], crashed: false, ...over });

  it('pins the numeric contract', () => {
    // Deliberately literal. Asserting via AUDIT_EXIT everywhere would let a
    // renumbering pass silently, and these codes are a public contract the
    // moment they ship in a released CLI.
    assert.deepEqual(AUDIT_EXIT, { CLEAN: 0, CRASHED: 2, FINDINGS: 3 });
  });

  it('is CLEAN for a healthy audit', () => {
    assert.equal(auditExitCode([entry({ ok: ['2 skills installed'] })]), AUDIT_EXIT.CLEAN);
  });

  it('is FINDINGS when an adapter reported errors', () => {
    assert.equal(
      auditExitCode([entry({ errors: ['1 broken skill symlinks'] })]), AUDIT_EXIT.FINDINGS);
  });

  it('is CRASHED when an adapter threw', () => {
    assert.equal(
      auditExitCode([entry({ crashed: true, errors: ['Audit failed: boom'] })]),
      AUDIT_EXIT.CRASHED);
  });

  it('ranks a crash above a finding', () => {
    // A finding is a completed audit that found something; a crash means that
    // framework produced no verdict at all, so it is the more urgent report.
    assert.equal(auditExitCode([
      entry({ errors: ['1 broken skill symlinks'] }),
      entry({ crashed: true, errors: ['Audit failed: boom'] }),
    ]), AUDIT_EXIT.CRASHED);
  });

  it('never fails on warnings alone', () => {
    // Warnings describe ordinary states ("No Copilot skills installed"), so
    // failing on them would make a machine with one framework installed exit
    // non-zero for every other adapter.
    assert.equal(
      auditExitCode([entry({ warnings: ['No Copilot skills installed'] })]), AUDIT_EXIT.CLEAN);
  });

  it('is CLEAN for an empty result set', () => {
    // "Nothing detected" is surfaced by the command as a warning rather than a
    // failure — a fresh clone with nothing installed yet is legitimate.
    assert.equal(auditExitCode([]), AUDIT_EXIT.CLEAN);
  });

  it('never returns 1, which is reserved for usage and loader errors', () => {
    // getContext() exits 1 for an undetectable root and unknown --framework, and
    // node exits 1 with ERR_MODULE_NOT_FOUND when deps are missing. Colliding
    // with that is what made B11 unfixable (#443).
    const shapes = [
      [],
      [entry()],
      [entry({ errors: ['e'] })],
      [entry({ crashed: true })],
      [entry({ warnings: ['w'] })],
      [entry({ crashed: true }), entry({ errors: ['e'] })],
    ];
    for (const shape of shapes) assert.notEqual(auditExitCode(shape), 1);
  });
});

// ── chalk fallback (#455) ────────────────────────────────────────
//
// The old fallback was `new Proxy({}, { get: () => identity })`, which satisfies
// the direct styles and breaks the factories: chalk.hex('#FF6B35') returned the
// STRING '#FF6B35', and calling it threw. Because every palette here is built
// from chalk.hex(...) at module load (campfire-reporter.js, tui.js,
// pixel-renderer.js), a chalk that failed to import took the CLI down at import
// time rather than degrading to plain text.
//
// These assert the three call shapes the CLI actually uses, plus the two traps
// that make a naive stub wrong.

describe('chalk fallback stub (#455)', () => {
  const chalk = makeChalkStub();

  it('passes text through a direct style', () => {
    assert.equal(chalk.dim('x'), 'x');
    assert.equal(chalk.red('x'), 'x');
  });

  it('returns a callable from a factory, not a string', () => {
    // The exact defect: this used to be the string '#FF6B35'.
    assert.equal(typeof chalk.hex('#FF6B35'), 'function');
    assert.equal(chalk.hex('#FF6B35')('flame'), 'flame');
    assert.equal(chalk.bgHex('#FFB347')('bg'), 'bg');
    assert.equal(chalk.rgb(1, 2, 3)('x'), 'x');
  });

  it('covers the underline* factories chalk 6 added', () => {
    // A factory list written from memory omits these, which reintroduces the
    // bug for exactly these names.
    assert.equal(chalk.underlineHex('#fff')('x'), 'x');
    assert.equal(chalk.underlineRgb(1, 2, 3)('x'), 'x');
    assert.equal(chalk.underlineAnsi256(42)('x'), 'x');
  });

  it('chains', () => {
    assert.equal(chalk.bold.cyan('x'), 'x');
    assert.equal(chalk.bold.underline.red('x'), 'x');
  });

  it('reports level 0 so the pixel-art gate stays closed', () => {
    // pixel-renderer.js gates canRenderPixelArt() on `level >= 1`. A stub means
    // no colour support, so 0 is the truthful answer.
    assert.equal(chalk.level, 0);
    assert.equal(chalk.level >= 1, false);
  });

  it('is not a thenable', async () => {
    // A stub that answers every property with a function makes `await chalk`
    // hang forever: the runtime calls .then and waits for a callback that is
    // never invoked. Guard with a race so a regression fails instead of hanging
    // the whole suite.
    const settled = await Promise.race([
      Promise.resolve(chalk).then(() => 'settled'),
      new Promise((r) => setTimeout(() => r('HUNG'), 500)),
    ]);
    assert.equal(settled, 'settled');
  });
});

// ── universal detection is a deliberate constant (#457) ──────────

describe('universal framework detection (#457)', () => {
  let tmpDir;

  before(() => {
    tmpDir = mkdtempSync(resolve(tmpdir(), 'almanac-detect-'));
  });

  after(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('detects universal in a directory with no .agents/', () => {
    // `.agents/skills/` is the cross-client interoperability path, so universal
    // is always an eligible install target. The rule used to express this as
    // `existsSync(...) || true`, which is unconditionally true — the existsSync
    // was dead code that read like a condition (#457).
    assert.equal(existsSync(resolve(tmpDir, '.agents')), false, 'fixture must have no .agents/');
    const ids = detectFrameworks(tmpDir).map((d) => d.id);
    assert.ok(ids.includes('universal'), 'universal should always be detected');
  });

  it('does not detect a framework whose marker is absent', () => {
    // The control. Without this, a detector that returned every rule would
    // satisfy the assertion above while being completely broken.
    const ids = detectFrameworks(tmpDir).map((d) => d.id);
    assert.ok(!ids.includes('claude-code'), 'claude-code has no .claude/ here');
    assert.ok(!ids.includes('cursor'), 'cursor has no .cursor/ here');
  });
});

// ── hermes home resolution (#604) ───────────────────────────────
//
// detect() and both adapter bases used to hardcode homedir()/.hermes. A
// Windows-native Hermes install lives at %LOCALAPPDATA%\hermes, and every
// platform honors $HERMES_HOME — the adapter saw neither, and only a manual
// directory junction made detection fire. These tests pin the resolution
// order so a revert to the hardcoded path fails: the env-home case would
// return homedir()/.hermes instead of the fixture, and the win32 case would
// never reach the LOCALAPPDATA default.
describe('resolveHermesHome (#604)', () => {
  let tmpRoot;
  let savedHermesHome;
  let savedLocalAppData;

  before(() => {
    tmpRoot = mkdtempSync(resolve(tmpdir(), 'almanac-hermes-home-'));
    savedHermesHome = process.env.HERMES_HOME;
    savedLocalAppData = process.env.LOCALAPPDATA;
  });

  after(() => {
    if (savedHermesHome === undefined) delete process.env.HERMES_HOME;
    else process.env.HERMES_HOME = savedHermesHome;
    if (savedLocalAppData === undefined) delete process.env.LOCALAPPDATA;
    else process.env.LOCALAPPDATA = savedLocalAppData;
    rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('prefers $HERMES_HOME over every other location', () => {
    const envHome = resolve(tmpRoot, 'env-home');
    mkdirSync(envHome, { recursive: true });
    process.env.HERMES_HOME = envHome;
    assert.equal(resolveHermesHome(), envHome);
  });

  // #611: the test above builds its fixture with resolve(), and resolve() is
  // idempotent on its own output, so it passes byte-identically whether tier 1
  // returns the value raw or normalizes it. Being absolute is NOT on its own
  // enough to make it blind — resolve('/x/') is '/x' and resolve('/a/../b') is
  // '/b' — it is being normalized-absolute that does.
  //
  // Of the four tests below, TWO discriminate the fix from the bug: the
  // relative case and the whitespace case. The empty-string case is green on
  // the pre-#611 body too, since '' is falsy and already fell through; it is
  // kept as a pin against a future rewrite to `fromEnv !== undefined`, not
  // counted as evidence. The padded case covers the half of the whitespace
  // decision the docstring promises and neither recorded mutant reached.
  //
  // The contract under test is the return SHAPE — always normalized-absolute —
  // not cwd-independence, which a relative $HERMES_HOME cannot have and which
  // this fix does not claim to give it.
  it('resolves a relative HERMES_HOME to an absolute path', () => {
    delete process.env.LOCALAPPDATA; // keep the win32 probe out of the answer
    process.env.HERMES_HOME = 'relative-hermes-home';
    const got = resolveHermesHome();
    // Fails on the pre-#611 body, which returned 'relative-hermes-home' raw.
    assert.ok(isAbsolute(got), `expected an absolute path, got ${JSON.stringify(got)}`);
    assert.equal(got, resolve('relative-hermes-home'));
  });

  it('does not trim the value it uses, only the value it tests for emptiness', () => {
    delete process.env.LOCALAPPDATA;
    // The docstring promises a path with a leading or trailing space survives
    // byte-for-byte, and nothing tested it: every other tier-1 fixture in this
    // file is whitespace-free, so `return resolve(fromEnv.trim())` passed the
    // entire suite while breaking exactly this. Tier 1 does no existence check,
    // so the directory need not exist.
    process.env.HERMES_HOME = ' padded-hermes-home';
    assert.equal(resolveHermesHome(), resolve(' padded-hermes-home'));
  });

  it('treats an empty HERMES_HOME as unset', () => {
    delete process.env.LOCALAPPDATA;
    process.env.HERMES_HOME = '';
    assert.equal(resolveHermesHome(), resolve(homedir(), '.hermes'));
  });

  it('treats a whitespace-only HERMES_HOME as unset, not as a directory named " "', () => {
    delete process.env.LOCALAPPDATA;
    process.env.HERMES_HOME = '   ';
    // Without the trim test this returns resolve('   ') — cwd + a directory
    // literally named three spaces. The decision is recorded in the module's
    // @returns docstring: the is-it-set test ignores whitespace, the value
    // that is USED is never trimmed.
    assert.equal(resolveHermesHome(), resolve(homedir(), '.hermes'));
  });

  it('falls back to ~/.hermes when HERMES_HOME is unset', () => {
    delete process.env.HERMES_HOME;
    delete process.env.LOCALAPPDATA; // keep the win32 probe out of the fallback
    // Pure path arithmetic — the fallback never checks existence, so the WSL
    // path (~/.hermes inside a WSL home) keeps working with no extra logic.
    assert.equal(resolveHermesHome(), resolve(homedir(), '.hermes'));
  });

  it('on win32, uses %LOCALAPPDATA%\\hermes when its config.yaml exists',
    { skip: process.platform !== 'win32' && 'win32-only branch' }, () => {
      delete process.env.HERMES_HOME;
      const localAppData = resolve(tmpRoot, 'lad');
      const winHome = resolve(localAppData, 'hermes');
      mkdirSync(winHome, { recursive: true });
      writeFileSync(resolve(winHome, 'config.yaml'), '# fixture');
      process.env.LOCALAPPDATA = localAppData;
      assert.equal(resolveHermesHome(), winHome);
    });

  it('on win32, skips the %LOCALAPPDATA% default when it has no config.yaml',
    { skip: process.platform !== 'win32' && 'win32-only branch' }, () => {
      delete process.env.HERMES_HOME;
      const localAppData = resolve(tmpRoot, 'lad-empty');
      mkdirSync(resolve(localAppData, 'hermes'), { recursive: true });
      process.env.LOCALAPPDATA = localAppData;
      // An empty leftover dir must not claim detection; the fallback applies.
      assert.equal(resolveHermesHome(), resolve(homedir(), '.hermes'));
    });
});

// The block above proves the resolver. This one proves the DETECTOR CALLS it,
// and the two are not interchangeable: with only the unit tests present,
// reverting cli/lib/detector.js and cli/adapters/hermes.js to their pre-#604
// `homedir()` form leaves the entire suite green — measured, not assumed. That
// is the "logic covered, but nothing sees whether the caller invokes it" shape
// #439 was closed to prevent, in this same file.
//
// Deliberately platform-independent: both cases route through HERMES_HOME, so
// tier 1 short-circuits before homedir() is consulted and nothing depends on
// $HOME steering os.homedir() — which it does not do on win32, the whole point
// of #604. A real ~/.hermes on the dev box therefore cannot reach either case.
describe('detectFrameworks resolves the Hermes home (#604)', () => {
  let tmpRoot;
  let projectDir;
  let savedHermesHome;
  let savedLocalAppData;

  const hermesDetected = () => detectFrameworks(projectDir).map((d) => d.id).includes('hermes');

  before(() => {
    tmpRoot = mkdtempSync(resolve(tmpdir(), 'almanac-hermes-detect-'));
    // Empty project dir: no project-scope rule can fire, so `hermes` in the
    // result can only have come from the global rule under test.
    projectDir = resolve(tmpRoot, 'project');
    mkdirSync(projectDir, { recursive: true });
    savedHermesHome = process.env.HERMES_HOME;
    savedLocalAppData = process.env.LOCALAPPDATA;
    delete process.env.LOCALAPPDATA;
  });

  after(() => {
    if (savedHermesHome === undefined) delete process.env.HERMES_HOME;
    else process.env.HERMES_HOME = savedHermesHome;
    if (savedLocalAppData === undefined) delete process.env.LOCALAPPDATA;
    else process.env.LOCALAPPDATA = savedLocalAppData;
    rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('detects a Hermes home reachable only through $HERMES_HOME', () => {
    const envHome = resolve(tmpRoot, 'env-home');
    mkdirSync(envHome, { recursive: true });
    writeFileSync(resolve(envHome, 'config.yaml'), '# fixture');
    process.env.HERMES_HOME = envHome;
    // Pre-#604 this read homedir()/.hermes, which cannot see envHome.
    assert.equal(hermesDetected(), true);
  });

  it('does not detect a $HERMES_HOME without a config.yaml', () => {
    const bare = resolve(tmpRoot, 'bare-home');
    mkdirSync(bare, { recursive: true });
    process.env.HERMES_HOME = bare;
    // The control: without it, a detector that returned hermes unconditionally
    // would satisfy the case above.
    assert.equal(hermesDetected(), false);
  });
});

// ── audit exit codes, end to end (#439) ──────────────────────────
//
// The block above covers auditExitCode()'s logic, but it cannot see whether the
// command ever CALLS it: deleting `process.exitCode = auditExitCode(results)`
// from cli/index.js leaves every one of those assertions green, so #439 could
// regress verbatim under a refactor while CI stayed green. That is the same
// shape as the defect this whole change exists to close, so it is worth the
// three subprocesses. These tests spawn the real CLI and read its exit status.
//
// HOME is redirected at a fixture for the same reason the broken-symlink block
// does it: detectFrameworks() appends the global rules unconditionally
// (cli/lib/detector.js), so openclaw and hermes join the adapter list whenever
// the developer has ~/.openclaw or ~/.hermes. Since the exit code reduces over
// every adapter, one stale symlink in either would otherwise turn this repo's
// suite red on an untouched checkout — and block npm publish via prepublishOnly.
//
// Fixtures live in the OS temp dir rather than under ROOT, so a crashed run
// cannot leave state behind that poisons the next one.

describe('audit exit codes end to end (#439)', () => {
  const realSkill = resolve(ROOT, 'skills/commit-changes');
  const cliEntry = resolve(ROOT, 'cli/index.js');
  let tmpRoot;
  let savedHome;
  let savedHermesHome;
  let savedLocalAppData;

  /** A project fixture copilot detects, via .github/copilot-instructions.md. */
  function project(name) {
    const dir = resolve(tmpRoot, name);
    mkdirSync(resolve(dir, '.github'), { recursive: true });
    writeFileSync(resolve(dir, '.github/copilot-instructions.md'), '');
    return dir;
  }

  // Absolute entry path: these run with cwd set to the fixture, so the relative
  // `node cli/index.js` that run() uses would not resolve.
  function auditStatusIn(dir) {
    try {
      execSync(`node ${cliEntry} audit --source ${ROOT}`,
        { cwd: dir, encoding: 'utf8', timeout: 10000 });
      return 0;
    } catch (err) {
      return err.status ?? 1;
    }
  }

  before(() => {
    tmpRoot = mkdtempSync(resolve(tmpdir(), 'almanac-exit-'));
    mkdirSync(resolve(tmpRoot, 'home'), { recursive: true });

    const clean = project('clean');
    mkdirSync(resolve(clean, '.github/skills'), { recursive: true });
    symlinkSync(realSkill, resolve(clean, '.github/skills/good-skill'));

    // Same fixture as clean, plus one dangling link. That one link is the only
    // difference between CLEAN and FINDINGS.
    const findings = project('findings');
    mkdirSync(resolve(findings, '.github/skills'), { recursive: true });
    symlinkSync(realSkill, resolve(findings, '.github/skills/good-skill'));
    symlinkSync(resolve(tmpRoot, 'no-such-target'),
      resolve(findings, '.github/skills/ghost-skill'));

    // A file where the adapter expects a directory makes readdirSync throw
    // ENOTDIR — a real adapter crash rather than a synthesised one.
    const crashed = project('crashed');
    writeFileSync(resolve(crashed, '.github/skills'), 'not a directory');

    savedHome = process.env.HOME;
    process.env.HOME = resolve(tmpRoot, 'home');
    // #604: resolveHermesHome() reads HERMES_HOME first, and on win32 probes
    // %LOCALAPPDATA%\hermes — a dev machine carrying either (this very
    // integration ran on one) would leak a real Hermes home into the fixture
    // and flip the exit-code reduction. Both are pinned to the fixture home.
    savedHermesHome = process.env.HERMES_HOME;
    savedLocalAppData = process.env.LOCALAPPDATA;
    process.env.HERMES_HOME = resolve(tmpRoot, 'home', '.hermes');
    delete process.env.LOCALAPPDATA;
  });

  after(() => {
    if (savedHome === undefined) delete process.env.HOME;
    else process.env.HOME = savedHome;
    if (savedHermesHome === undefined) delete process.env.HERMES_HOME;
    else process.env.HERMES_HOME = savedHermesHome;
    if (savedLocalAppData === undefined) delete process.env.LOCALAPPDATA;
    else process.env.LOCALAPPDATA = savedLocalAppData;
    rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('exits CLEAN when every link resolves', () => {
    assert.equal(auditStatusIn(resolve(tmpRoot, 'clean')), AUDIT_EXIT.CLEAN);
  });

  it('exits FINDINGS when an adapter reports a dangling symlink', () => {
    assert.equal(auditStatusIn(resolve(tmpRoot, 'findings')), AUDIT_EXIT.FINDINGS);
  });

  it('exits CRASHED when an adapter throws', () => {
    assert.equal(auditStatusIn(resolve(tmpRoot, 'crashed')), AUDIT_EXIT.CRASHED);
  });
});

// ── Adapter audits: broken symlink detection (#438, #445) ────────
//
// Every adapter that installs content as a symlink must report a dangling one
// as an error, and must not count it as installed. Before #438, six of them
// returned `errors: []` outright, so a half-destroyed install audited clean.
// opencode did report the error but still counted the dangling item in `ok`;
// #445 aligned it, so all nine now split valid from broken the same way.
//
// Nine adapters split, and this block holds EIGHT cases. claude-code is the one
// left out — and NOT because it is covered. Its direct audit test above (#373)
// exercises only the healthy path: it audits the real repository root, builds no
// dangling link, and asserts `errors` is EMPTY, which is exactly what a
// regression would also produce. Deleting its broken-skill-symlink push
// (claude-code.js:199) fails nothing — measured with a deletion mutant. It has a
// second broken branch at :203 that was not mutated; #823 carries both.
//
// Both numbers in this paragraph's first sentence — nine, and EIGHT — are prose
// that no tool reads. A tenth symlink-installing adapter would join uncovered,
// the shape #447 had, except that there the gap was at least written down.
// Gating them is #824.
//
// universal is the odd one here: alone among the nine it ENUMERATES the broken
// ids in the error rather than only counting them (the `broken.map(b => b.id)`
// in universal.js's errors.push — cited by expression, because a line number
// here was already wrong once: #607 moved the push and the citation did not
// follow). Its case therefore pins the id list, not just the number —
// dropping `.map(b => b.id).join(', ')` would keep the count right and still go
// red (#447).
//
// `1 broken skill symlinks` (five rows) and `1 broken links` (opencode) each
// disagree with themselves on number, as do the ok strings `1 skills installed`,
// `1 items installed` and `1 skills in workspace`. All of it is pinned
// DELIBERATELY — the string is behaviour, so a pluralisation fix should go red
// here and be made on purpose rather than slipping through unnoticed.
//
// Each case builds one valid link and at least one dangling one, and asserts the
// error and the exact ok string, so neither a regression to `errors: []` nor a
// drift back to counting totals passes. Seven rows assert the error as an exact
// string; universal supplies `errAssert` instead — it needs two dangling links
// for the join to be observable, and their order is not promised (see the row).
// hermes builds two of each, one pair per content type. The wording differs
// by design and follows what each installs: "broken skill symlinks" where only
// skills are linked, "broken links" for hermes and opencode, which link agents
// too.
//
// `openclaw` resolves its target from `homedir()` rather than a project dir,
// so HOME is redirected into the fixture for the whole block. That also pins
// `vibe`, whose agents dir is home-based — without it, a real ~/.vibe/agents
// on the dev machine would leak .toml entries into the counts.
//
// `hermes` is steered by HERMES_HOME instead (#604), and its fixture lives
// OUTSIDE the redirected HOME on purpose. Pinning it at `<fakeHome>/.hermes`
// would make the env path and the old `homedir()/.hermes` path byte-identical
// on POSIX, so this case would pass just as well against the wiring #604
// replaced — a hermeticity fix that reads as coverage without being any. The
// separate root is what makes reverting hermes.js or detector.js go red here.
describe('adapter audits detect broken symlinks', () => {
  const tmpRoot = resolve(ROOT, '.tmp-test-audit');
  const fakeHome = resolve(tmpRoot, 'home');
  // Deliberately NOT under fakeHome — see the note above the describe.
  const hermesHome = resolve(tmpRoot, 'hermes-env-home');
  const realSkill = resolve(ROOT, 'skills/commit-changes');
  const realAgent = resolve(ROOT, 'agents/code-reviewer.md');
  let savedHome;

  // path: where the adapter looks, relative to its own base (project or home).
  const cases = [
    { name: 'copilot', base: 'project', dir: '.github/skills', ok: '1 skills installed', err: '1 broken skill symlinks', audit: (d) => new CopilotAdapter().audit(d) },
    { name: 'cursor', base: 'project', dir: '.cursor/skills', ok: '1 items installed', err: '1 broken skill symlinks', audit: (d) => new CursorAdapter().audit(d) },
    { name: 'gemini', base: 'project', dir: '.gemini/skills', ok: '1 skills installed', err: '1 broken skill symlinks', audit: (d) => new GeminiAdapter().audit(d) },
    { name: 'vibe', base: 'project', dir: '.vibe/skills', ok: '1 items installed', err: '1 broken skill symlinks', audit: (d) => new VibeAdapter().audit(d, 'project') },
    // hermes symlinks agents as well as skills, from two independent
    // expressions (hermes.js:88 and :97). Covering only the skills dir would
    // leave the agent branch dead under test — reverting it would stay green
    // while a dangling ~/.hermes/agents/<id>.md audited clean, which is the
    // #438 defect surviving in the content type this adapter's "broken links"
    // wording exists to describe.
    { name: 'hermes', base: 'hermes-home', dir: 'skills/general', agentDir: 'agents', ok: '2 items installed', err: '2 broken links', audit: () => new HermesAdapter().audit() },
    { name: 'openclaw', base: 'home', dir: '.openclaw/workspace', ok: '1 skills in workspace', err: '1 broken skill symlinks', audit: () => new OpenClawAdapter().audit(ROOT, 'project') },
    // opencode already reported broken links before #438; #445 aligned its ok
    // line to valid-only like the rest. One dir is enough here: unlike hermes,
    // its skills and agents flow through the same expression (opencode.js:82).
    { name: 'opencode', base: 'project', dir: '.opencode/skills', ok: '1 items installed', err: '1 broken links', audit: (d) => new OpenCodeAdapter().audit(d, 'project') },
    // universal enumerates the broken ids; every other adapter only counts them.
    //
    // TWO dangling links, not one. With a single id there is nothing to join, so
    // `join(', ')` and `join('; ')` produce identical output and a separator
    // mutant SURVIVES — measured, before this was widened. One id pins an id;
    // it does not pin an enumeration.
    //
    // The assertion splits on ', ' and compares as a set. Splitting is what pins
    // the separator: under `join('; ')` the split yields one element and the
    // deepEqual fails. Comparing as a set is what keeps it honest about order —
    // the adapter enumerates in readdirSync order, which is not specified, so an
    // exact two-id string would be asserting something universal.js does not
    // promise.
    {
      name: 'universal', base: 'project', dir: '.agents/skills',
      extraGhosts: ['ghost-skill-2'],
      ok: '1 skills installed',
      errAssert: (errors) => {
        assert.equal(errors.length, 1, `expected one error, got: ${JSON.stringify(errors)}`);
        const enumerated = /^2 broken symlinks: (.+)$/.exec(errors[0]);
        assert.ok(enumerated, `unexpected error shape: ${errors[0]}`);
        assert.deepEqual(enumerated[1].split(', ').sort(), ['ghost-skill', 'ghost-skill-2']);
      },
      // 'project' is explicit, not load-bearing: _targetBase() returns the project
      // path for any scope that is not 'global', so audit(d) behaves identically
      // here — that mutant survives, measured. Passed anyway so the row states its
      // scope instead of leaning on a default that could change.
      audit: (d) => new UniversalAdapter().audit(d, 'project'),
    },
  ];

  // Which root a home-based case hangs off: hermes gets its own, so that the
  // env path and the homedir() path cannot coincide.
  const homeRootFor = (c) => (c.base === 'hermes-home' ? hermesHome : fakeHome);
  const dirFor = (c) => (c.base === 'project'
    ? resolve(tmpRoot, c.name, c.dir)
    : resolve(homeRootFor(c), c.dir));
  let savedHermesHome;
  let savedLocalAppData;

  before(() => {
    rmSync(tmpRoot, { recursive: true, force: true }); // leftover from a crashed run
    mkdirSync(fakeHome, { recursive: true });
    for (const c of cases) {
      const skillsDir = dirFor(c);
      mkdirSync(skillsDir, { recursive: true });
      symlinkSync(realSkill, resolve(skillsDir, 'good-skill'));
      symlinkSync(resolve(tmpRoot, 'no-such-target'), resolve(skillsDir, 'ghost-skill'));
      // Extra dangling links for a case that asserts the enumeration, not the count.
      for (const extra of c.extraGhosts ?? []) {
        symlinkSync(resolve(tmpRoot, 'no-such-target'), resolve(skillsDir, extra));
      }
      if (c.agentDir) {
        const agentsDir = resolve(homeRootFor(c), c.agentDir);
        mkdirSync(agentsDir, { recursive: true });
        symlinkSync(realAgent, resolve(agentsDir, 'good-agent.md'));
        symlinkSync(resolve(tmpRoot, 'no-such-agent.md'), resolve(agentsDir, 'ghost-agent.md'));
      }
    }
    // os.homedir() reads $HOME on POSIX, which is how the home-based adapters
    // are steered at the fixture. Restored in after().
    savedHome = process.env.HOME;
    process.env.HOME = fakeHome;
    // #604: on Windows, os.homedir() ignores $HOME entirely, so the hermes case
    // could never be steered by HOME alone — it leaked to the real user profile
    // and failed on any Windows-native checkout. resolveHermesHome() honors
    // HERMES_HOME on every platform, so pin it at the fixture. Clear
    // LOCALAPPDATA too, or the win32 probe escapes the fixture the other way;
    // a dev machine with a real Hermes home (e.g. one running this very
    // integration) would otherwise poison the counts.
    //
    // `hermesHome` is outside fakeHome, so this pin also DISCRIMINATES: the
    // pre-#604 wiring would look under fakeHome/.hermes, find nothing, and
    // fail the assertions below.
    savedHermesHome = process.env.HERMES_HOME;
    savedLocalAppData = process.env.LOCALAPPDATA;
    process.env.HERMES_HOME = hermesHome;
    delete process.env.LOCALAPPDATA;
  });

  after(() => {
    if (savedHome === undefined) delete process.env.HOME;
    else process.env.HOME = savedHome;
    if (savedHermesHome === undefined) delete process.env.HERMES_HOME;
    else process.env.HERMES_HOME = savedHermesHome;
    if (savedLocalAppData === undefined) delete process.env.LOCALAPPDATA;
    else process.env.LOCALAPPDATA = savedLocalAppData;
    rmSync(tmpRoot, { recursive: true, force: true });
  });

  for (const c of cases) {
    it(`${c.name}: reports a dangling symlink as an error`, async () => {
      const result = await c.audit(resolve(tmpRoot, c.name));
      if (c.errAssert) c.errAssert(result.errors);
      else assert.deepEqual(result.errors, [c.err]);
      assert.deepEqual(result.ok, [c.ok]);
    });
  }
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
    assert.equal(data.totalTeams, EXPECT.teams);
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
  it('shows the version from package.json', () => {
    // Deliberately re-reads the manifest instead of importing the same module
    // the CLI does: if the CLI's version wiring breaks, this still knows the
    // truth. The previous assertion was /\d+\.\d+\.\d+/, which `0.1.0` satisfied
    // while the published package was 1.3.0 — which is why #456 went unnoticed
    // through every release.
    const expected = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8')).version;
    assert.equal(run('--version').trim(), expected);
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

// ── Adapter scope declarations (#607) ────────────────────────────
// Most adapters install to exactly one place no matter what `--scope` asked
// for: hermes and openclaw are always global (a home directory), seven others
// are always project (a path under projectDir). They accepted the flag and
// ignored it in silence.
//
// Honouring is a property of the CELL — the (adapter, content type) pair — not
// of the adapter. `vibe` branches on scope for skills and writes agents to
// ~/.vibe/agents unconditionally. The first version of this change declared one
// array per adapter and exercised skills only, so it gave vibe a declaration
// saying the agent downgrade could not happen, and shipped it still silent.
// These tests are per cell for that reason.

describe('adapter scope declarations (#607)', () => {
  let sandbox;
  let savedEnv;

  const ITEMS = {
    skill: {
      type: 'skill', id: 'commit-changes', domain: 'git',
      sourcePath: resolve(ROOT, 'skills/commit-changes/SKILL.md'),
      sourceDir: resolve(ROOT, 'skills/commit-changes'),
    },
    agent: {
      type: 'agent', id: 'code-reviewer',
      sourcePath: resolve(ROOT, 'agents/code-reviewer.md'),
      sourceDir: resolve(ROOT, 'agents'),
      description: 'fixture', tools: ['Read'],
    },
    team: {
      type: 'team', id: 'code-review-team',
      sourcePath: resolve(ROOT, 'teams/code-review-team.md'),
      sourceDir: resolve(ROOT, 'teams'),
    },
  };

  // Cells whose dry-run install returns an EMPTY path, so the path comparison
  // below cannot see them: '' === '' would otherwise be counted as a confident
  // "one distinct path, therefore ignores scope". Listed individually and
  // asserted in both directions, so a NEW unmeasurable cell fails rather than
  // joining a silent hole.
  const UNMEASURABLE_CELLS = {
    'codex:skill':
      'codex delegates skills into its agent file and returns { path: "" } from install(), ' +
      'so there is no path to compare. Its agent cell IS measurable and covers the adapter.',
  };

  /** @returns {string} `${adapterId}:${contentType}` */
  const cellKey = (id, type) => `${id}:${type}`;

  before(() => {
    sandbox = mkdtempSync(resolve(tmpdir(), 'almanac-scope-'));
    savedEnv = {
      HOME: process.env.HOME,
      USERPROFILE: process.env.USERPROFILE,
      HERMES_HOME: process.env.HERMES_HOME,
    };
    process.env.HOME = sandbox;
    process.env.USERPROFILE = sandbox;
    process.env.HERMES_HOME = resolve(sandbox, '.hermes');
  });

  after(() => {
    for (const [key, value] of Object.entries(savedEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    rmSync(sandbox, { recursive: true, force: true });
  });

  /** Dry-run install one cell at both scopes and return the two paths. */
  async function probeCell(adapter, type) {
    const options = { dryRun: true, force: false, almanacRoot: ROOT };
    const projectDir = resolve(sandbox, 'proj');
    return {
      projectDir,
      asProject: (await adapter.install(ITEMS[type], projectDir, 'project', options)).path,
      asGlobal: (await adapter.install(ITEMS[type], projectDir, 'global', options)).path,
    };
  }

  it('every registered adapter declares its own scopes rather than inheriting the default', () => {
    // base.js defaults permissively so a third-party adapter written before the
    // field keeps working. Inheriting it HERE would mean an adapter that
    // silently ignores scope and never warns — the exact pre-#607 state.
    const inheriting = listAdapterIds().filter(
      (id) => !Object.hasOwn(getAdapter(id).constructor, 'scopes'),
    );
    assert.deepEqual(
      inheriting, [],
      `these adapters inherit base's default instead of deciding: ${inheriting.join(', ')}`,
    );
  });

  it('every declaration covers exactly the adapter\'s contentTypes — no more, no less', () => {
    // A missing key makes scopesFor() return [], which reads as "honours
    // nothing" and warns on every scope. A surplus key is a cell that does not
    // exist. Both directions, so neither hides.
    const wrong = [];
    for (const id of listAdapterIds()) {
      const { contentTypes, scopes } = getAdapter(id).constructor;
      const declared = Object.keys(scopes).sort();
      const supported = [...contentTypes].sort();
      if (JSON.stringify(declared) !== JSON.stringify(supported)) {
        wrong.push(`${id}: declares [${declared}] but supports [${supported}]`);
      }
    }
    assert.deepEqual(wrong, [], `\n${wrong.join('\n')}\n`);
  });

  it('each cell\'s declared scope count matches the number of distinct paths it installs to', async () => {
    const mismatches = [];
    const unmeasurable = [];

    for (const id of listAdapterIds()) {
      const adapter = getAdapter(id);
      for (const type of adapter.constructor.contentTypes) {
        const { asProject, asGlobal } = await probeCell(adapter, type);

        if (asProject === '' && asGlobal === '') { unmeasurable.push(cellKey(id, type)); continue; }

        // Same path for both requests => the cell ignores scope => one real
        // scope. Different paths => it honours scope => two.
        const observed = asProject === asGlobal ? 1 : 2;
        const declared = adapter.scopesFor(type).length;
        if (observed !== declared) {
          mismatches.push(
            `${cellKey(id, type)}: declares [${adapter.scopesFor(type).join(',')}] (${declared}) but ` +
            `installs to ${observed} distinct path(s)\n    project: ${asProject}\n    global : ${asGlobal}`,
          );
        }
      }
    }

    assert.deepEqual(mismatches, [], `\n${mismatches.join('\n')}\n`);
    assert.deepEqual(
      unmeasurable.sort(), Object.keys(UNMEASURABLE_CELLS).sort(),
      'the set of cells with an empty dry-run path has changed. A new one is a hole in the ' +
      'check above, not a pass — add it to UNMEASURABLE_CELLS with the reason, or give the ' +
      'adapter a real path.',
    );
  });

  it('each single-scope cell installs in the DIRECTION it declares, not merely to one place', async () => {
    // Counting distinct paths cannot tell ['global'] from ['project'] — both
    // are "one path". Without this, hermes could declare project-only and
    // cursor global-only and every structural test would still pass.
    const wrongWay = [];

    for (const id of listAdapterIds()) {
      const adapter = getAdapter(id);
      for (const type of adapter.constructor.contentTypes) {
        const declared = adapter.scopesFor(type);
        if (declared.length !== 1) continue;
        if (UNMEASURABLE_CELLS[cellKey(id, type)]) continue;

        const { asProject, projectDir } = await probeCell(adapter, type);
        const underProject = asProject.startsWith(projectDir);
        const underHome = asProject.startsWith(sandbox) && !underProject;
        const actual = underProject ? 'project' : (underHome ? 'global' : 'neither');
        if (actual !== declared[0]) {
          wrongWay.push(`${cellKey(id, type)}: declares '${declared[0]}' but installs to ${actual}: ${asProject}`);
        }
      }
    }

    assert.deepEqual(wrongWay, [], `\n${wrongWay.join('\n')}\n`);
  });

  it('those dry runs wrote nothing into the sandboxed home', () => {
    // Guards the probes above: a dry run that wrote would leave the path
    // comparison passing while the suite created files. Effective on POSIX,
    // where the HOME redirect takes. On win32 os.homedir() ignores $HOME
    // (#609), so there this assertion inspects a sandbox nothing could have
    // written to — it does not fail, it stops meaning anything.
    assert.deepEqual(
      readdirSync(sandbox).filter((entry) => entry !== 'proj'), [],
      'a dry run created something in the sandboxed home',
    );
  });

  // ── the warning itself ──────────────────────────────────────────

  const EXPLICIT = { contentTypes: ['skill'], explicit: true };

  it('warns when a global-only adapter is asked for project scope', () => {
    const lines = captureWarnings(() => warnUnsupportedScopes([getAdapter('hermes')], 'project', EXPLICIT));
    assert.equal(lines.length, 1, `expected one warning, got: ${JSON.stringify(lines)}`);
    assert.match(lines[0], /Hermes Agent is global-only/);
    assert.match(lines[0], /--scope project ignored/);
  });

  it('warns when a project-only adapter is asked for global scope', () => {
    // The mirror case, which #607 does not mention: seven adapters pin project.
    const lines = captureWarnings(
      () => warnUnsupportedScopes([getAdapter('cursor')], 'global', { contentTypes: ['skill'], explicit: true }),
    );
    assert.equal(lines.length, 1, `expected one warning, got: ${JSON.stringify(lines)}`);
    assert.match(lines[0], /Cursor is project-only/);
    assert.match(lines[0], /--scope global ignored/);
  });

  it('warns for a SPLIT adapter only about the type that is downgraded', () => {
    // The regression test for the defect the per-adapter model shipped: vibe
    // honours scope for skills and never for agents.
    const vibe = getAdapter('vibe');
    assert.deepEqual(vibe.scopesFor('skill'), ['project', 'global']);
    assert.deepEqual(vibe.scopesFor('agent'), ['global']);

    assert.deepEqual(
      captureWarnings(() => warnUnsupportedScopes([vibe], 'project', { contentTypes: ['skill'], explicit: true })),
      [], 'vibe honours project scope for skills and must not warn about them',
    );

    const both = captureWarnings(
      () => warnUnsupportedScopes([vibe], 'project', { contentTypes: ['skill', 'agent'], explicit: true }),
    );
    assert.equal(both.length, 1);
    assert.match(both[0], /agents are global-only/);
    assert.doesNotMatch(both[0], /skills are/, 'skills are honoured; naming them would be false');
  });

  it('stays silent when the adapter can honour the requested scope', () => {
    // The half that makes the warning worth having: a gate that fires on
    // everything carries no information.
    for (const [id, scope] of [['hermes', 'global'], ['cursor', 'project'],
      ['claude-code', 'project'], ['claude-code', 'global']]) {
      assert.deepEqual(
        captureWarnings(() => warnUnsupportedScopes([getAdapter(id)], scope, EXPLICIT)), [],
        `${id} honours ${scope} and must not warn`,
      );
    }
  });

  it('says nothing at all when --scope was never passed', () => {
    // `--scope` carries a default of 'project'. Warning on the defaulted value
    // would print "--scope project ignored" on every bare `almanac install` for
    // anyone with hermes installed — naming a flag they never typed.
    assert.deepEqual(
      captureWarnings(
        () => warnUnsupportedScopes([getAdapter('hermes')], 'project', { contentTypes: ['skill'], explicit: false }),
      ), [],
    );
  });

  it('warns once per adapter, not once per adapter per item', () => {
    const adapters = [getAdapter('hermes'), getAdapter('cursor'), getAdapter('claude-code')];
    const lines = captureWarnings(() => warnUnsupportedScopes(adapters, 'project', EXPLICIT));
    assert.equal(lines.length, 1, 'only hermes cannot honour project scope for skills');
  });

  it('names the supported set for --scope workspace, which no adapter declares', () => {
    // NOT unreachable — an earlier version of this comment said it was.
    // `--scope workspace` is advertised in every command's help text, so every
    // two-scope cell lands in the branch that cannot derive a destination.
    const lines = captureWarnings(
      () => warnUnsupportedScopes([getAdapter('claude-code')], 'workspace', EXPLICIT),
    );
    assert.equal(lines.length, 1);
    assert.match(lines[0], /skills support project, global/);
    assert.match(lines[0], /--scope workspace ignored/);
  });

  it('does not throw on a duck-typed adapter that predates the scopes field', () => {
    // warnUnsupportedScopes runs BEFORE auditAll's try/catch. An unguarded
    // supportsScope() call there threw out of auditAll entirely, so a
    // third-party adapter without the method would crash `almanac audit`
    // instead of being recorded as crashed — the guarantee #439 exists for.
    class LegacyAdapter {
      static displayName = 'Legacy';
      async audit() { return { framework: 'Legacy', ok: [], warnings: [], errors: [] }; }
    }
    assert.deepEqual(captureWarnings(() => warnUnsupportedScopes([new LegacyAdapter()], 'project', EXPLICIT)), []);
  });

  it('does not throw on a MALFORMED scopes declaration', () => {
    // The typeof guard catches a missing method, not a mistyped field. A bare
    // string satisfies String.prototype.includes and then dies at .join(); an
    // absent key is undefined and dies at .includes(). Both escape the guard
    // and abort the audit from outside its try/catch. scopesFor() normalises
    // anything non-array to [], so these are reported rather than fatal.
    class StringScopes extends FrameworkAdapter {
      static id = 'stringy'; static displayName = 'Stringy';
      static contentTypes = ['skill']; static scopes = 'project';
    }
    class MissingKey extends FrameworkAdapter {
      static id = 'missing'; static displayName = 'MissingKey';
      static contentTypes = ['skill']; static scopes = {};
    }
    class EmptyList extends FrameworkAdapter {
      static id = 'empty'; static displayName = 'EmptyList';
      static contentTypes = ['skill']; static scopes = { skill: [] };
    }
    for (const AdapterClass of [StringScopes, MissingKey, EmptyList]) {
      const lines = captureWarnings(() => warnUnsupportedScopes([new AdapterClass()], 'project', EXPLICIT));
      assert.equal(lines.length, 1, `${AdapterClass.id} should warn, not throw`);
      assert.match(lines[0], /does not support|support no scope|no scope/);
    }
  });

  it('effectiveScope returns the request unchanged when it can be honoured', () => {
    assert.equal(getAdapter('claude-code').effectiveScope('project', 'skill'), 'project');
    assert.equal(getAdapter('claude-code').effectiveScope('global', 'skill'), 'global');
    assert.equal(getAdapter('hermes').effectiveScope('project', 'skill'), 'global');
    assert.equal(getAdapter('vibe').effectiveScope('project', 'skill'), 'project');
    assert.equal(getAdapter('vibe').effectiveScope('project', 'agent'), 'global');
    assert.equal(getAdapter('claude-code').effectiveScope('workspace', 'skill'), null);
  });
});

// ── The warning is WIRED, not merely implemented (#607) ──────────
// The block above proves the function. This one proves the three orchestrators
// CALL it, and the two are not interchangeable: with only the block above,
// deleting all three `warnUnsupportedScopes(...)` lines from installer.js
// leaves the entire suite green — measured, not assumed. That is the
// "prove the wiring, not the component" trap this repo names in CLAUDE.md, and
// it is the same shape as #439's, in the same file.

describe('the scope warning is wired into the orchestrators (#607)', () => {
  const resolved = (items) => ({ skills: [], agents: [], teams: [], ...items });

  const skillItem = {
    type: 'skill', id: 'commit-changes', domain: 'git',
    sourcePath: resolve(ROOT, 'skills/commit-changes/SKILL.md'),
    sourceDir: resolve(ROOT, 'skills/commit-changes'),
  };
  const one = resolved({ skills: [skillItem] });
  const hermes = () => [getAdapter('hermes')];

  it('installAll warns, with the installing verb', async () => {
    const lines = await captureWarningsAsync(() => installAll(
      one, hermes(), ROOT, 'project', { dryRun: true, scopeExplicit: true },
    ));
    assert.ok(
      lines.some((l) => /Hermes Agent is global-only/.test(l) && /installing to/.test(l)),
      `installAll did not warn: ${JSON.stringify(lines)}`,
    );
  });

  it('uninstallAll warns, with the uninstalling verb', async () => {
    // "installing to" is wrong here, and was what the first version printed.
    const lines = await captureWarningsAsync(() => uninstallAll(
      one, hermes(), ROOT, 'project', { dryRun: true, scopeExplicit: true },
    ));
    assert.ok(
      lines.some((l) => /Hermes Agent is global-only/.test(l) && /uninstalling from/.test(l)),
      `uninstallAll did not warn with the right verb: ${JSON.stringify(lines)}`,
    );
  });

  it('auditAll warns, with the reading verb', async () => {
    const lines = await captureWarningsAsync(() => auditAll(hermes(), ROOT, 'project', true));
    assert.ok(
      lines.some((l) => /Hermes Agent is global-only/.test(l) && /reading/.test(l)),
      `auditAll did not warn with the right verb: ${JSON.stringify(lines)}`,
    );
  });

  it('none of the three warns when --scope was not passed', async () => {
    const lines = await captureWarningsAsync(async () => {
      await installAll(one, hermes(), ROOT, 'project', { dryRun: true, scopeExplicit: false });
      await uninstallAll(one, hermes(), ROOT, 'project', { dryRun: true, scopeExplicit: false });
      await auditAll(hermes(), ROOT, 'project', false);
    });
    assert.deepEqual(
      lines.filter((l) => /--scope/.test(l)), [],
      'a defaulted scope must not produce a warning naming a flag the user never typed',
    );
  });
});
