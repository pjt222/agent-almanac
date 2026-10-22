/**
 * cli.test.js — Tests for the agent-almanac CLI.
 *
 * Uses node:test (built-in, no dependencies).
 * Run: node --test cli/test/cli.test.js
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync, spawnSync } from 'child_process';
import { copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, realpathSync, rmSync, readlinkSync, readFileSync, writeFileSync, symlinkSync } from 'fs';
import { tmpdir, homedir } from 'os';
import { dirname, isAbsolute, resolve } from 'path';
// A namespace import, not named ones: isNpmPackageRoot is new in #606, and a
// named import of an export that does not exist fails the whole file at link
// time — which would make the red-first run at the base commit report one
// SyntaxError instead of the individual tests failing for their own reasons.
import * as resolver from '../lib/resolver.js';
import { rmTree } from '../../scripts/test/_tmp.js';

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
// childPath and cli/lib/item-id.js are new. A named import of a missing export,
// or any static import of a missing module, fails the whole file at link time,
// so a red-first run at the base commit would report one error instead of the
// individual tests failing for their own reasons.
import * as adapterBase from '../adapters/base.js';
const itemId = await import('../lib/item-id.js').catch(() => ({}));
import { loadRegistries } from '../lib/registry.js';
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

// ── npm package root (#606) ──────────────────────────────────────
//
// The npm-installed CLI could not find the content shipped beside it.
// detectAlmanacRoot() searched the cwd, two `.claude/skills` symlink chains and
// the cwd's ancestors, and never its own package directory, so README Path 3
// (`npm install -g agent-almanac`, then `agent-almanac install …`) failed at its
// third line for every npm user. The fallback fixes that and opens a second
// problem, decided by the maintainer on 2026-10-14: installing FROM a package
// root links into node_modules, which `npm uninstall` removes and `npm update`
// may replace. So every command that installs refuses by default, naming both
// ways forward, and `--from-package link` opts in.
//
// HOME is redirected for every case, in-process and spawned. Strategy 3 traces
// ~/.claude/skills, and on a machine where that is a symlink into a checkout the
// fallback cases would pass at the base commit for the wrong reason.
//
// The package-root fixture is a real directory at
// <tmp>/prefix/lib/node_modules/agent-almanac, the shape `npm install -g
// --prefix` creates, holding a one-skill registry. No `npm pack` runs in this
// file: #670 measured the 10 s per-spawn cap 79% used. The packed-tarball proof
// is a separate script with its own timeout.
describe('npm package root (#606)', () => {
  const cliEntry = resolve(ROOT, 'cli/index.js');
  const totalSkills = Object.values(skillsReg.domains)
    .reduce((sum, domain) => sum + domain.skills.length, 0);
  let tmpRoot;
  let fakeHome;
  let outside;
  let pkgRoot;
  let env;

  // eslint-disable-next-line no-control-regex
  const stripAnsi = (text) => (text ?? '').replace(/\x1b\[[0-9;]*m/g, '');

  // Pinned literally (#606). Both ways forward must be named, and the wording
  // is behaviour: a change to it should go red here and be made on purpose.
  // Each npm command is named with what it does to the links, as measured in
  // review rounds 1 and 2: `npm uninstall` leaves them dangling; `npm update`
  // leaves them resolving to the new version's content under npm's default
  // layout, except a link to an item the new version removed, which dangles,
  // and breaks them under a version-keyed one (`install-strategy=linked`), so
  // it "can" break them and is not said to.
  const refusal = (root) =>
    `ERROR: Not installing from the npm package at ${root}: \`npm uninstall\` leaves ` +
    'links into node_modules dangling, and `npm update` can break them or silently ' +
    'change the content under them.\n' +
    '    Either install from a clone:      --source <clone>\n' +
    '    or link into the package anyway:  --from-package link';
  // The warning names what audit can and cannot see (review round 2, R2-2):
  // `npm uninstall -g` removes the `agent-almanac` command with the package,
  // so the audit that would report the dangling links is gone too. It then
  // names the remover, one clause for install, sync and gather, each measured
  // to leave 0 links before `npm uninstall -g` against a packed tarball, with
  // a control that leaves them dangling (the maintainer's decision of
  // 2026-10-21). "the same scope and frameworks" is measured too (review
  // round 3, R3-1): without `-g`, `uninstall` skips the links a `-g` install
  // made, and without the install's `-f`, or a directory where `detect` lists
  // the frameworks the install did, it skips the links of a framework it does
  // not detect, under `-g` too. `-f` is named because `uninstall` and
  // `scatter` accept it; only `--from-package` is left out, because
  // `uninstall` rejects it.
  const linkWarning = (root) =>
    `WARN: Linking into the npm package at ${root}. \`npm update\` of ` +
    'agent-almanac can break these links, and `agent-almanac audit` reports ' +
    'any that broke; `npm uninstall` leaves them dangling and removes that ' +
    'command too, so remove them first with the same scope and frameworks ' +
    '(the install\'s `-g`/`--scope` and `-f`; without `-f`, run it where ' +
    '`agent-almanac detect` lists the frameworks the install did): ' +
    '`agent-almanac uninstall <names>`, or `agent-almanac scatter <team>` after `gather`.';

  /**
   * Spawn the CLI by absolute path and keep BOTH streams. runAllowFail() keeps
   * stdout only, but reporter.error() and commander's usage errors write to
   * stderr, so a refusal asserted against stdout would match nothing.
   */
  function spawnCli(args, cwd) {
    const res = spawnSync(process.execPath, [cliEntry, ...args],
      { cwd, env, encoding: 'utf8', timeout: 10000 });
    assert.equal(res.error, undefined, `spawn failed: ${res.error}`);
    return { status: res.status, stdout: stripAnsi(res.stdout), stderr: stripAnsi(res.stderr) };
  }

  /** os.homedir() reads $HOME at call time on POSIX; restore it whatever fn does. */
  function withFakeHome(fn) {
    const savedHomeEnv = process.env.HOME;
    process.env.HOME = fakeHome;
    try {
      return fn();
    } finally {
      if (savedHomeEnv === undefined) delete process.env.HOME;
      else process.env.HOME = savedHomeEnv;
    }
  }

  /** A fresh project that both universal and claude-code detect: two symlink adapters. */
  function project(name) {
    const dir = resolve(tmpRoot, name);
    mkdirSync(resolve(dir, '.claude'), { recursive: true });
    return dir;
  }

  /** Every symlink under `dir` whose resolved target has a node_modules path segment. */
  function linksIntoNodeModules(dir) {
    const found = [];
    const walk = (current) => {
      for (const entry of readdirSync(current, { withFileTypes: true })) {
        const entryPath = resolve(current, entry.name);
        if (entry.isSymbolicLink()) {
          const target = resolve(dirname(entryPath), readlinkSync(entryPath));
          if (target.split(/[\\/]+/).includes('node_modules')) found.push(`${entryPath} -> ${target}`);
        } else if (entry.isDirectory()) {
          walk(entryPath);
        }
      }
    };
    walk(dir);
    return found;
  }

  before(() => {
    tmpRoot = realpathSync(mkdtempSync(resolve(tmpdir(), 'almanac-606-')));
    fakeHome = resolve(tmpRoot, 'home');
    outside = resolve(tmpRoot, 'outside');
    mkdirSync(fakeHome, { recursive: true });
    mkdirSync(outside, { recursive: true });

    pkgRoot = resolve(tmpRoot, 'prefix/lib/node_modules/agent-almanac');
    mkdirSync(resolve(pkgRoot, 'skills/commit-changes'), { recursive: true });
    mkdirSync(resolve(pkgRoot, 'agents'), { recursive: true });
    mkdirSync(resolve(pkgRoot, 'teams'), { recursive: true });
    copyFileSync(resolve(ROOT, 'skills/commit-changes/SKILL.md'),
      resolve(pkgRoot, 'skills/commit-changes/SKILL.md'));
    writeFileSync(resolve(pkgRoot, 'skills/_registry.yml'), [
      'total_skills: 1',
      'domains:',
      '  git:',
      '    description: fixture',
      '    skills:',
      '      - id: commit-changes',
      '        path: commit-changes/SKILL.md',
      '',
    ].join('\n'));
    // An agent and a team, so `gather` has something to install at the base
    // commit: its refusal case then fails there because links were created,
    // not because the team was unknown.
    writeFileSync(resolve(pkgRoot, 'agents/_registry.yml'), [
      'total_agents: 1',
      'agents:',
      '  - id: fixture-agent',
      '    path: agents/fixture-agent.md',
      '    skills:',
      '      - commit-changes',
      '',
    ].join('\n'));
    writeFileSync(resolve(pkgRoot, 'agents/fixture-agent.md'), '---\nname: fixture-agent\n---\n');
    writeFileSync(resolve(pkgRoot, 'teams/_registry.yml'), [
      'total_teams: 1',
      'teams:',
      '  - id: fixture-team',
      '    path: teams/fixture-team.md',
      '    lead: fixture-agent',
      '    members:',
      '      - fixture-agent',
      '',
    ].join('\n'));
    writeFileSync(resolve(pkgRoot, 'teams/fixture-team.md'), '---\nname: fixture-team\n---\n');

    env = { ...process.env, HOME: fakeHome, USERPROFILE: fakeHome, HERMES_HOME: resolve(fakeHome, '.hermes') };
    delete env.LOCALAPPDATA;
  });

  after(() => {
    rmTree(tmpRoot);
  });

  // ── the fallback ──

  it('detectAlmanacRoot falls back to the package it ships in, outside any checkout', () => {
    const found = withFakeHome(() => resolver.detectAlmanacRoot(outside));
    assert.notEqual(found, null, 'no almanac root detected from outside the checkout');
    assert.equal(realpathSync(found), realpathSync(ROOT));
  });

  it('accepts a package root only when it holds skills/_registry.yml', () => {
    const emptyPackage = resolve(tmpRoot, 'empty-package');
    mkdirSync(emptyPackage, { recursive: true });
    assert.equal(withFakeHome(() => resolver.detectAlmanacRoot(outside, { packageRoot: emptyPackage })), null);
    assert.equal(withFakeHome(() => resolver.detectAlmanacRoot(outside, { packageRoot: pkgRoot })), pkgRoot);
  });

  // The fallback is tried LAST, so a checkout that an earlier strategy finds
  // still wins over the package. The test above is the control: with nothing
  // earlier to find, pkgRoot alone answers. Both assertions are needed. From
  // the checkout itself, strategy 1 answers, which catches the fallback moved
  // first. From a subdirectory, strategies 1-3 all miss and only the walk-up
  // (4) finds it, which catches the fallback moved to any place before 4; the
  // first assertion alone lets that mutant survive (review round 1, F3).
  it('a checkout found by an earlier strategy beats the package root', () => {
    const checkout = resolve(tmpRoot, 'checkout-like');
    const sub = resolve(checkout, 'deep/er');
    mkdirSync(resolve(checkout, 'skills'), { recursive: true });
    mkdirSync(sub, { recursive: true });
    writeFileSync(resolve(checkout, 'skills/_registry.yml'), 'total_skills: 0\ndomains: {}\n');
    assert.equal(withFakeHome(() => resolver.detectAlmanacRoot(checkout, { packageRoot: pkgRoot })), checkout,
      'strategy 1 (cwd holds the registry) must beat the package fallback');
    assert.equal(withFakeHome(() => resolver.detectAlmanacRoot(sub, { packageRoot: pkgRoot })), checkout,
      'strategy 4 (walk up from cwd) must beat the package fallback');
  });

  for (const args of [['list'], ['list', '--installed', '-g'], ['audit']]) {
    it(`${args.join(' ')} runs from outside any checkout`, () => {
      const { status, stdout, stderr } = spawnCli(args, outside);
      assert.doesNotMatch(stderr, /Could not detect agent-almanac root/);
      assert.equal(status, 0, `exit ${status}\n${stdout}\n${stderr}`);
      if (args.length === 1 && args[0] === 'list') {
        // The whole registry: the fallback found this checkout, not a fixture.
        assert.match(stdout, new RegExp(`^${totalSkills} skills:$`, 'm'));
      } else if (args[0] === 'list') {
        assert.match(stdout, /^Installed content:$/m);
      } else {
        assert.match(stdout, /^Audit results:$/m);
      }
    });
  }

  // ── recognising a package root ──

  it('recognises an npm package root by a node_modules path segment', () => {
    const cases = [
      ['/usr/lib/node_modules/agent-almanac', true],
      ['/home/u/.nvm/versions/node/v22.12.0/lib/node_modules/agent-almanac', true],
      ['/home/u/project/node_modules/agent-almanac', true],
      ['/home/u/project/node_modules/.pnpm/agent-almanac@1.9.1/node_modules/agent-almanac', true],
      ['/home/u/.npm/_npx/0123abcd/node_modules/agent-almanac', true],
      ['C:\\Users\\u\\AppData\\Roaming\\npm\\node_modules\\agent-almanac', true],
      ['/home/u/dev/agent-almanac', false],
      ['/home/u/node_modules_backup/agent-almanac', false],
      ['C:\\dev\\agent-almanac', false],
    ];
    for (const [candidate, expected] of cases) {
      assert.equal(resolver.isNpmPackageRoot(candidate), expected, candidate);
    }
  });

  it('recognises a symlink whose target is an npm package root, and not the checkout', () => {
    const alias = resolve(tmpRoot, 'alias-to-package');
    symlinkSync(pkgRoot, alias);
    assert.equal(resolver.isNpmPackageRoot(alias), true);
    assert.equal(resolver.isNpmPackageRoot(ROOT), false);
  });

  // The other direction, and the shape `npm link` makes: a path inside
  // node_modules that is a symlink to a directory outside any node_modules.
  // Links an install makes point at the spelling given, so they would run
  // through node_modules and dangle once npm removes that symlink. Only the
  // path as given can recognise it; the control proves its real path cannot,
  // so the test cannot pass on the real-path arm (review round 1, F4).
  it('recognises an npm-link-shaped package path whose target is outside node_modules', () => {
    const linkedClone = resolve(tmpRoot, 'linked-clone');
    mkdirSync(linkedClone, { recursive: true });
    const linkedPkg = resolve(tmpRoot, 'linkprefix/lib/node_modules/agent-almanac');
    mkdirSync(dirname(linkedPkg), { recursive: true });
    symlinkSync(linkedClone, linkedPkg);
    // Control: only the given spelling can answer true.
    assert.equal(realpathSync(linkedPkg).split(/[\\/]+/).includes('node_modules'), false, realpathSync(linkedPkg));
    assert.equal(resolver.isNpmPackageRoot(linkedPkg), true);
  });

  // ── install from a package root ──

  it('install from a package root refuses by default and links nothing into node_modules', () => {
    const dir = project('refuse-install');
    const { status, stdout, stderr } = spawnCli(['install', 'commit-changes', '--source', pkgRoot], dir);
    assert.deepEqual(linksIntoNodeModules(dir), [], `links into node_modules were created:\n${stdout}`);
    assert.deepEqual(linksIntoNodeModules(fakeHome), []);
    assert.equal(status, 1, `exit ${status}\n${stdout}\n${stderr}`);
    assert.ok(stderr.includes(refusal(pkgRoot)), `refusal text missing from stderr:\n${stderr}`);
  });

  // A dry run refuses too: it exists to predict the real run, and a preview
  // listing node_modules links the real run would then refuse to make would be
  // the #607 misdirection. cli/README.md and guardPackageRoot()'s docstring both
  // promise this, so it is pinned rather than left as prose.
  it('a dry run from a package root refuses too', () => {
    const dir = project('refuse-dry-run');
    const { status, stdout, stderr } = spawnCli(
      ['install', 'commit-changes', '--source', pkgRoot, '--dry-run'], dir);
    assert.equal(status, 1, `exit ${status}\n${stdout}\n${stderr}`);
    assert.ok(stderr.includes(refusal(pkgRoot)), `refusal text missing from stderr:\n${stderr}`);
    assert.doesNotMatch(stdout, /DRY RUN/);
    assert.deepEqual(linksIntoNodeModules(dir), []);
  });

  it('with --from-package link, install links into the package and warns', () => {
    const dir = project('link-install');
    const { status, stdout, stderr } = spawnCli(
      ['install', 'commit-changes', '--source', pkgRoot, '--from-package', 'link'], dir);
    assert.equal(status, 0, `exit ${status}\n${stdout}\n${stderr}`);
    // stderr, like the refusal: on stdout it would precede `gather --json`'s
    // document and make it unparseable (review round 1, F2).
    assert.ok(stderr.includes(linkWarning(pkgRoot)), `link warning missing from stderr:\n${stderr}`);
    assert.ok(!stdout.includes('Linking into the npm package'), `link warning leaked to stdout:\n${stdout}`);
    for (const link of ['.agents/skills/commit-changes', '.claude/skills/commit-changes']) {
      const linkPath = resolve(dir, link);
      assert.ok(existsSync(linkPath), `${link} was not created or does not resolve`);
      assert.equal(realpathSync(linkPath), realpathSync(resolve(pkgRoot, 'skills/commit-changes')));
    }
    // Control row: the walker the refusal cases rely on does see these links.
    assert.equal(linksIntoNodeModules(dir).length, 2, linksIntoNodeModules(dir).join('\n'));
  });

  it('rejects a --from-package mode that is not implemented, before linking anything', () => {
    const dir = project('unknown-mode');
    const { status, stdout, stderr } = spawnCli(
      ['install', 'commit-changes', '--source', pkgRoot, '--from-package', 'copy'], dir);
    assert.deepEqual(linksIntoNodeModules(dir), [], stdout);
    assert.equal(status, 1, `exit ${status}\n${stdout}\n${stderr}`);
    assert.match(stderr, /option '--from-package <mode>' argument 'copy' is invalid\. Allowed choices are link\./);
  });

  it('install, gather and sync offer --from-package with only the implemented mode', () => {
    for (const command of ['install', 'gather', 'sync']) {
      const { status, stdout } = spawnCli([command, '--help'], outside);
      assert.equal(status, 0, `${command} --help exited ${status}`);
      const help = stdout.replace(/\s+/g, ' ');
      assert.match(help, /--from-package <mode> .*\(choices: "link"\)/, `${command} --help:\n${stdout}`);
      assert.doesNotMatch(help, /copy/i, `${command} --help names an unimplemented mode`);
    }
  });

  it('gather refuses from a package root too', () => {
    const dir = project('refuse-gather');
    const { status, stdout, stderr } = spawnCli(['gather', 'fixture-team', '--quiet', '--source', pkgRoot], dir);
    assert.deepEqual(linksIntoNodeModules(dir), [], `links into node_modules were created:\n${stdout}`);
    assert.equal(status, 1, `exit ${status}\n${stdout}\n${stderr}`);
    assert.ok(stderr.includes(refusal(pkgRoot)), `refusal text missing from stderr:\n${stderr}`);
  });

  // `--from-package link` is the documented way to keep the old behaviour, so it
  // must not break the one machine-readable output among the gated commands.
  // The project has only `.claude/`, whose adapters print no installer warnings,
  // so any stdout pollution here is the link warning's.
  it('gather --json --from-package link keeps stdout a JSON document and warns on stderr', () => {
    const dir = project('link-gather-json');
    const { status, stdout, stderr } = spawnCli(
      ['gather', 'fixture-team', '--json', '--source', pkgRoot, '--from-package', 'link'], dir);
    assert.equal(status, 0, `exit ${status}\n${stdout}\n${stderr}`);
    let doc;
    assert.doesNotThrow(() => { doc = JSON.parse(stdout); }, `stdout is not one JSON document:\n${stdout}`);
    assert.equal(doc.team, 'fixture-team');
    assert.ok(stderr.includes(linkWarning(pkgRoot)), `link warning missing from stderr:\n${stderr}`);
  });

  it('sync refuses from a package root too', () => {
    const dir = project('refuse-sync');
    writeFileSync(resolve(dir, 'agent-almanac.yml'), 'skills:\n  - commit-changes\n');
    const { status, stdout, stderr } = spawnCli(['sync', '--source', pkgRoot], dir);
    assert.deepEqual(linksIntoNodeModules(dir), [], `links into node_modules were created:\n${stdout}`);
    assert.equal(status, 1, `exit ${status}\n${stdout}\n${stderr}`);
    assert.ok(stderr.includes(refusal(pkgRoot)), `refusal text missing from stderr:\n${stderr}`);
  });

  it('a read-only command still runs from a package root', () => {
    const { status, stdout, stderr } = spawnCli(['list', '--source', pkgRoot], outside);
    assert.equal(status, 0, `exit ${status}\n${stderr}`);
    assert.match(stdout, /^1 skills:$/m);
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

describe('item names stay inside their install directories', () => {
  // Before this, `uninstall ../../README.md -f universal` removed the project's
  // own README.md and exited 0: an item id becomes a path segment in every
  // adapter, and resolve() followed it out of the install directory. Two layers
  // now refuse it: installAll/uninstallAll check every id before anything is
  // touched (cli/lib/item-id.js), and childPath() in cli/adapters/base.js refuses
  // a path that leaves its base directory even when an adapter is called
  // directly. Each layer has its own test below, so a mutant of either one is
  // caught even while the other still holds.
  const cliEntry = resolve(ROOT, 'cli/index.js');
  const stripAnsi = (text) => (text ?? '').replace(/\x1b\[[0-9;]*m/g, '');
  const SENTINEL = 'sentinel: must survive\n';
  let tmpRoot;
  let env;

  before(() => {
    tmpRoot = realpathSync(mkdtempSync(resolve(tmpdir(), 'almanac-item-id-')));
    const fakeHome = resolve(tmpRoot, 'home');
    mkdirSync(fakeHome, { recursive: true });
    env = { ...process.env, HOME: fakeHome, USERPROFILE: fakeHome, HERMES_HOME: resolve(fakeHome, '.hermes'), NO_COLOR: '1' };
  });

  after(() => rmTree(tmpRoot));

  function spawnCli(args, cwd) {
    const res = spawnSync(process.execPath, [cliEntry, ...args], { cwd, env, encoding: 'utf8', timeout: 10000 });
    assert.equal(res.error, undefined, `spawn failed: ${res.error}`);
    return { status: res.status, stdout: stripAnsi(res.stdout), stderr: stripAnsi(res.stderr) };
  }

  /** A project with an (empty) universal skills directory and a sentinel file at its root. */
  function project(name) {
    const dir = resolve(tmpRoot, name);
    mkdirSync(resolve(dir, '.agents/skills'), { recursive: true });
    writeFileSync(resolve(dir, 'README.md'), SENTINEL);
    return dir;
  }

  it('uninstall refuses a name that is not a plain id, and the file it would have reached survives', () => {
    const dir = project('uninstall-cli');
    const r = spawnCli(['uninstall', '../../README.md', '-f', 'universal', '--source', ROOT], dir);
    assert.equal(r.status, 1, `expected exit 1, got ${r.status}\n${r.stdout}\n${r.stderr}`);
    assert.match(r.stderr, /not plain ids/, 'the refusal must say why');
    assert.equal(readFileSync(resolve(dir, 'README.md'), 'utf8'), SENTINEL);
  });

  it('install refuses a name that is not a plain id and creates nothing', () => {
    const dir = project('install-cli');
    const r = spawnCli(['install', '../escape', '-f', 'universal', '--source', ROOT], dir);
    assert.equal(r.status, 1, `expected exit 1, got ${r.status}\n${r.stdout}\n${r.stderr}`);
    assert.match(r.stderr, /not plain ids/);
    assert.deepEqual(readdirSync(resolve(dir, '.agents/skills')), []);
    // Mirrors the registry-id test's arm. On this route the base made no link
    // (Unknown item), so here it is a pin, not red-first evidence.
    assert.deepEqual(readdirSync(resolve(dir, '.agents')), ['skills']);
  });

  it('a registry id that is not a plain id is refused before anything is linked', () => {
    // The id climbs out of skills/: at the base commit this made a link at
    // .agents/escape, outside .agents/skills, and printed "1 installed".
    const source = resolve(tmpRoot, 'source-with-escaping-id');
    mkdirSync(resolve(source, 'skills'), { recursive: true });
    mkdirSync(resolve(source, 'escape'), { recursive: true });
    writeFileSync(resolve(source, 'escape/SKILL.md'), '---\nname: escape\n---\n');
    writeFileSync(resolve(source, 'skills/_registry.yml'), [
      'total_skills: 1',
      'domains:',
      '  fixture:',
      '    description: fixture',
      '    skills:',
      '      - id: ../escape',
      '        path: ../escape/SKILL.md',
      '',
    ].join('\n'));
    const dir = project('install-registry');
    const r = spawnCli(['install', '-d', 'fixture', '-f', 'universal', '--source', source], dir);
    assert.equal(r.status, 1, `expected exit 1, got ${r.status}\n${r.stdout}\n${r.stderr}`);
    assert.match(r.stderr, /"\.\.\/escape"/, 'the refusal must name the offending id');
    assert.deepEqual(readdirSync(resolve(dir, '.agents')), ['skills']);
    assert.deepEqual(readdirSync(resolve(dir, '.agents/skills')), []);
  });

  it('the adapter layer refuses on its own, without installAll', async () => {
    const dir = project('adapter-direct');
    const adapter = new UniversalAdapter();
    await assert.rejects(
      adapter.uninstall({ type: 'skill', id: '../../README.md' }, dir, 'project', {}),
      /Refusing a path outside/,
    );
    assert.equal(readFileSync(resolve(dir, 'README.md'), 'utf8'), SENTINEL);
    await assert.rejects(
      adapter.install({ type: 'skill', id: '../escape', sourceDir: resolve(ROOT, 'skills/commit-changes') },
        dir, 'project', { almanacRoot: ROOT }),
      /Refusing a path outside/,
    );
    // readdirSync, not existsSync: an escaped link the old code made dangles,
    // and existsSync follows a link, so it would report a dangling one as absent.
    assert.deepEqual(readdirSync(resolve(dir, '.agents')), ['skills']);
  });

  it('childPath accepts one name and refuses every other shape', () => {
    assert.equal(typeof adapterBase.childPath, 'function', 'childPath is exported from cli/adapters/base.js');
    const base = resolve(tmpRoot, 'base');
    assert.equal(adapterBase.childPath(base, 'commit-changes'), resolve(base, 'commit-changes'));
    assert.equal(adapterBase.childPath(base, 'fixture-agent.md'), resolve(base, 'fixture-agent.md'));
    for (const name of ['..', '.', '', '../x', 'a/b', '/abs', 'x/']) {
      assert.throws(() => adapterBase.childPath(base, name), /Refusing a path outside/, `must refuse ${JSON.stringify(name)}`);
    }
  });

  it('every id and domain in the shipped registries is a plain id', () => {
    // A census pin: the rule refuses anything else, so a registry entry that
    // broke it would make the CLI refuse to install or remove that item.
    assert.equal(typeof itemId.isPlainItemId, 'function', 'isPlainItemId is exported from cli/lib/item-id.js');
    const reg = loadRegistries(ROOT);
    const ids = [
      ...reg.skills.map((s) => s.id), ...reg.domains, ...reg.agents.map((a) => a.id), ...reg.teams.map((t) => t.id),
      ...reg.agents.flatMap((a) => a.skills || []), ...reg.teams.flatMap((t) => [...(t.members || []), t.lead].filter(Boolean)),
      ...reg.defaultSkills.map((d) => d.skill),
    ];
    assert.ok(ids.length > 500, `census read ${ids.length} ids`);
    assert.deepEqual(ids.filter((id) => !itemId.isPlainItemId(id)), []);
  });

  it('a registry domain that is not a plain id is refused before anything is linked', () => {
    // Universal ignores the domain, so only layer 1 can refuse this run.
    const source = resolve(tmpRoot, 'source-with-dotdot-domain');
    mkdirSync(resolve(source, 'skills/x'), { recursive: true });
    writeFileSync(resolve(source, 'skills/x/SKILL.md'), '---\nname: x\n---\n');
    writeFileSync(resolve(source, 'skills/_registry.yml'), [
      'total_skills: 1',
      'domains:',
      '  "..":',
      '    description: fixture',
      '    skills:',
      '      - id: x',
      '        path: x/SKILL.md',
      '',
    ].join('\n'));
    const dir = project('install-registry-domain');
    const r = spawnCli(['install', 'x', '-f', 'universal', '--source', source], dir);
    assert.equal(r.status, 1, `expected exit 1, got ${r.status}\n${r.stdout}\n${r.stderr}`);
    assert.match(r.stderr, /domain "\.\." of "x"/, 'the refusal must name the offending domain');
    assert.deepEqual(readdirSync(resolve(dir, '.agents/skills')), []);
  });

  it('the hermes adapter refuses a domain that is not a plain id on its own, without installAll', async () => {
    // Both hermes sites are exercised: install builds <home>/skills/<domain> as a
    // directory (hermes.js, install) and uninstall builds <home>/skills/<domain>/<id>.
    // force: true means a mutant that let the path through would unlink the sentinel.
    const hermesHome = resolve(tmpRoot, 'hermes-domain');
    mkdirSync(resolve(hermesHome, 'skills'), { recursive: true });
    writeFileSync(resolve(hermesHome, 'x'), SENTINEL);
    const saved = process.env.HERMES_HOME;
    process.env.HERMES_HOME = hermesHome;
    try {
      const adapter = new HermesAdapter();
      const item = { type: 'skill', id: 'x', domain: '..', sourceDir: resolve(ROOT, 'skills/commit-changes') };
      await assert.rejects(adapter.uninstall(item, tmpRoot, 'global', {}), /Refusing a path outside/);
      await assert.rejects(adapter.install(item, tmpRoot, 'global', { force: true, almanacRoot: ROOT }), /Refusing a path outside/);
      assert.equal(readFileSync(resolve(hermesHome, 'x'), 'utf8'), SENTINEL);
    } finally {
      if (saved === undefined) delete process.env.HERMES_HOME;
      else process.env.HERMES_HOME = saved;
    }
  });

  it('sync leaves a directory entry whose name is not a plain id alone', () => {
    const dir = project('sync');
    writeFileSync(resolve(dir, 'agent-almanac.yml'), 'skills:\n  - commit-changes\n');
    writeFileSync(resolve(dir, '.agents/skills/My_Notes.md'), SENTINEL);
    const r = spawnCli(['sync', '-f', 'universal', '--source', ROOT], dir);
    assert.equal(r.status, 0, `expected exit 0, got ${r.status}\n${r.stdout}\n${r.stderr}`);
    assert.equal(readFileSync(resolve(dir, '.agents/skills/My_Notes.md'), 'utf8'), SENTINEL);
  });
});

// ── Link sites (S3-B2) ───────────────────────────────────────────
//
// Nine adapters make a link into the content root, at twelve sites in three
// shapes: nine skill directories, the opencode and hermes agent files, and
// claude-code's whole agents directory. cursor and copilot link too, whatever
// their declared `strategy` says. The blocks below drive every site in-process,
// each test in a throwaway tree of its own, so a change to one site's link
// writer or remover goes red in that site's row and nowhere else. In-process
// rather than spawned: the property is about the adapters, not about argument
// parsing, and #670 measured the per-spawn budget as nearly used up.

/** Content for the two items a link can point at. */
const LINK_FIXTURE = {
  skill: '---\nname: commit-changes\n---\nfixture skill\n',
  agent: '---\nname: code-reviewer\n---\nfixture agent\n',
};

/** What a user wrote into a path an adapter also uses. Every test that plants it asserts it survives. */
const USER_CONTENT = 'my own file: must survive\n';

/** The `details` most sites put on an install result; claude-code's agents directory has its own. */
const LINK_DETAILS = {
  dryRunInstall: 'dry-run',
  created: undefined,
  exists: 'already exists',
};

/** The uninstall result for each state, for the ten sites that share one shape. */
const UNINSTALL_SHAPE = {
  dryPresent: (path) => ({ action: 'removed', path, details: 'dry-run' }),
  removed: (path) => ({ action: 'removed', path }),
  absent: (path) => ({ action: 'skipped', path, details: 'not installed' }),
  dryAbsent: (path) => ({ action: 'removed', path, details: 'dry-run' }),
};

/**
 * Every link site, with the scopes its adapter declares for the content type.
 * `relTarget` is the link text a project-scope install writes, spelled out
 * rather than computed with relative(), so a change in how an adapter builds it
 * cannot be mirrored by the test. A global install links by absolute path.
 */
const LINK_SITES = [
  {
    site: 'universal skill', adapter: () => new UniversalAdapter(), type: 'skill', scopes: ['project', 'global'],
    path: (sb, scope) => resolve(scope === 'global' ? sb.home : sb.proj, '.agents/skills/commit-changes'),
    relTarget: '../../../src/skills/commit-changes',
  },
  {
    site: 'claude-code skill', adapter: () => new ClaudeCodeAdapter(), type: 'skill', scopes: ['project', 'global'],
    path: (sb, scope) => resolve(scope === 'global' ? sb.home : sb.proj, '.claude/skills/commit-changes'),
    relTarget: '../../../src/skills/commit-changes',
  },
  {
    site: 'claude-code agents directory', adapter: () => new ClaudeCodeAdapter(), type: 'agent', scopes: ['project', 'global'],
    path: (sb, scope) => resolve(scope === 'global' ? sb.home : sb.proj, '.claude/agents'),
    relTarget: '../../src/agents',
    absTarget: (sb) => resolve(sb.src, 'agents'),
    details: {
      dryRunInstall: 'dry-run: agents directory symlink',
      created: 'agents directory symlink',
      exists: 'agents symlink already exists',
    },
  },
  {
    site: 'opencode skill', adapter: () => new OpenCodeAdapter(), type: 'skill', scopes: ['project', 'global'],
    path: (sb, scope) => resolve(scope === 'global' ? resolve(sb.home, '.config/opencode') : resolve(sb.proj, '.opencode'), 'skills/commit-changes'),
    relTarget: '../../../src/skills/commit-changes',
  },
  {
    site: 'opencode agent file', adapter: () => new OpenCodeAdapter(), type: 'agent', scopes: ['project', 'global'],
    // The dry run reports this path too. At b3275420a it reported <agents>/<id>,
    // without the .md: the agent install ran the skill-shaped steps first (P2e).
    path: (sb, scope) => resolve(scope === 'global' ? resolve(sb.home, '.config/opencode') : resolve(sb.proj, '.opencode'), 'agents/code-reviewer.md'),
    relTarget: '../../../src/agents/code-reviewer.md',
  },
  {
    site: 'openclaw skill', adapter: () => new OpenClawAdapter(), type: 'skill', scopes: ['global'],
    path: (sb) => resolve(sb.home, '.openclaw/workspace/commit-changes'),
  },
  {
    site: 'hermes skill', adapter: () => new HermesAdapter(), type: 'skill', scopes: ['global'],
    path: (sb) => resolve(sb.hermes, 'skills/git/commit-changes'),
  },
  {
    site: 'hermes agent file', adapter: () => new HermesAdapter(), type: 'agent', scopes: ['global'],
    path: (sb) => resolve(sb.hermes, 'agents/code-reviewer.md'),
  },
  {
    site: 'vibe skill', adapter: () => new VibeAdapter(), type: 'skill', scopes: ['project', 'global'],
    path: (sb, scope) => resolve(scope === 'global' ? sb.home : sb.proj, '.vibe/skills/commit-changes'),
    relTarget: '../../../src/skills/commit-changes',
  },
  {
    site: 'gemini skill', adapter: () => new GeminiAdapter(), type: 'skill', scopes: ['project'],
    path: (sb) => resolve(sb.proj, '.gemini/skills/commit-changes'),
    relTarget: '../../../src/skills/commit-changes',
  },
  {
    // cursor reports the paths it removed, joined, without details, and an
    // empty path when it removed nothing.
    site: 'cursor skill', adapter: () => new CursorAdapter(), type: 'skill', scopes: ['project'],
    path: (sb) => resolve(sb.proj, '.cursor/skills/commit-changes'),
    relTarget: '../../../src/skills/commit-changes',
    uninstallShape: {
      dryPresent: (path) => ({ action: 'removed', path }),
      absent: () => ({ action: 'skipped', path: '', details: 'not installed' }),
      dryAbsent: () => ({ action: 'skipped', path: '', details: 'not installed' }),
    },
  },
  {
    site: 'copilot skill', adapter: () => new CopilotAdapter(), type: 'skill', scopes: ['project'],
    path: (sb) => resolve(sb.proj, '.github/skills/commit-changes'),
    relTarget: '../../../src/skills/commit-changes',
    uninstallShape: {
      absent: () => ({ action: 'skipped', path: '', details: 'not installed' }),
      dryAbsent: () => ({ action: 'skipped', path: '', details: 'not installed' }),
    },
  },
];

/** The registry item a site installs. */
function linkItem(site, sb) {
  return site.type === 'skill'
    ? {
      type: 'skill', id: 'commit-changes', domain: 'git',
      sourceDir: resolve(sb.src, 'skills/commit-changes'),
      sourcePath: resolve(sb.src, 'skills/commit-changes/SKILL.md'),
    }
    : { type: 'agent', id: 'code-reviewer', sourcePath: resolve(sb.src, 'agents/code-reviewer.md') };
}

/** The exact text readlinkSync must return after an install at this site and scope. */
function expectedLinkText(site, sb, scope) {
  if (scope === 'project') return site.relTarget;
  if (site.absTarget) return site.absTarget(sb);
  return resolve(sb.src, site.type === 'skill' ? 'skills/commit-changes' : 'agents/code-reviewer.md');
}

/** An install result: `details` is present only when the site reports one. */
function linkResult(action, path, details) {
  return details === undefined ? { action, path } : { action, path, details };
}

/**
 * Run fn in a fresh tree under `parent`: a content root `src`, a project
 * `proj`, a home and a Hermes home, with HOME, USERPROFILE and HERMES_HOME
 * pointed at them and LOCALAPPDATA cleared until fn settles. The global sites
 * read homedir() and resolveHermesHome() at call time, so this is what steers
 * them away from the real home. `gone` is a path that never exists, the target
 * of every dangling link.
 */
async function inLinkSandbox(parent, name, fn) {
  const root = resolve(parent, name);
  const sb = {
    root,
    src: resolve(root, 'src'),
    proj: resolve(root, 'proj'),
    home: resolve(root, 'home'),
    hermes: resolve(root, 'hermes-home'),
    gone: resolve(root, 'gone'),
  };
  mkdirSync(resolve(sb.src, 'skills/commit-changes'), { recursive: true });
  mkdirSync(resolve(sb.src, 'agents'), { recursive: true });
  writeFileSync(resolve(sb.src, 'skills/commit-changes/SKILL.md'), LINK_FIXTURE.skill);
  writeFileSync(resolve(sb.src, 'agents/code-reviewer.md'), LINK_FIXTURE.agent);
  mkdirSync(sb.proj, { recursive: true });
  mkdirSync(sb.home, { recursive: true });
  const saved = {
    HOME: process.env.HOME,
    USERPROFILE: process.env.USERPROFILE,
    HERMES_HOME: process.env.HERMES_HOME,
    LOCALAPPDATA: process.env.LOCALAPPDATA,
  };
  process.env.HOME = sb.home;
  process.env.USERPROFILE = sb.home;
  process.env.HERMES_HOME = sb.hermes;
  delete process.env.LOCALAPPDATA;
  try {
    return await fn(sb);
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

/** A filesystem-safe name for a site's sandbox. */
const siteSlug = (site) => site.site.replace(/[^a-z0-9]+/g, '-');

describe('link sites: baseline pins (S3-B2 T0)', () => {
  // Characterisation, green at b3275420a: what every link site does today,
  // pinned before S3-B2 rewrites the removers and the listings. A later commit
  // that changes one of these does it on purpose and edits the pin with it.
  let tmpRoot;

  before(() => {
    tmpRoot = realpathSync(mkdtempSync(resolve(tmpdir(), 'almanac-link-t0-')));
  });

  after(() => rmTree(tmpRoot));

  it('the site table names every scope each adapter declares for the type', () => {
    for (const site of LINK_SITES) {
      assert.deepEqual(site.scopes, site.adapter().scopesFor(site.type), site.site);
    }
    assert.equal(LINK_SITES.length, 12);
    assert.equal(new Set(LINK_SITES.map((site) => site.adapter().constructor.id)).size, 9);
  });

  for (const site of LINK_SITES) {
    for (const scope of site.scopes) {
      it(`${site.site} (${scope}): the link text, and every install and uninstall result`, async () => {
        await inLinkSandbox(tmpRoot, `${siteSlug(site)}-${scope}`, async (sb) => {
          const adapter = site.adapter();
          const item = linkItem(site, sb);
          const opts = { almanacRoot: sb.src };
          const path = site.path(sb, scope);
          const details = { ...LINK_DETAILS, ...site.details };
          const shape = { ...UNINSTALL_SHAPE, ...site.uninstallShape };
          const linkText = expectedLinkText(site, sb, scope);

          assert.deepEqual(
            await adapter.install(item, sb.proj, scope, { ...opts, dryRun: true }),
            linkResult('created', path, details.dryRunInstall),
          );
          assert.throws(() => lstatSync(path), { code: 'ENOENT' }, 'a dry run makes nothing');

          assert.deepEqual(await adapter.install(item, sb.proj, scope, opts), linkResult('created', path, details.created));
          assert.equal(readlinkSync(path), linkText);

          assert.deepEqual(await adapter.install(item, sb.proj, scope, opts), linkResult('skipped', path, details.exists));
          assert.deepEqual(
            await adapter.install(item, sb.proj, scope, { ...opts, force: true }),
            linkResult('created', path, details.created),
          );
          assert.equal(readlinkSync(path), linkText, '--force writes the same link again');

          assert.deepEqual(await adapter.uninstall(item, sb.proj, scope, { dryRun: true }), shape.dryPresent(path));
          assert.equal(readlinkSync(path), linkText, 'a dry run removes nothing');
          assert.deepEqual(await adapter.uninstall(item, sb.proj, scope, {}), shape.removed(path));
          assert.throws(() => lstatSync(path), { code: 'ENOENT' }, 'uninstall removes the link');

          assert.deepEqual(await adapter.uninstall(item, sb.proj, scope, {}), shape.absent(path));
          assert.deepEqual(await adapter.uninstall(item, sb.proj, scope, { dryRun: true }), shape.dryAbsent(path));
        });
      });
    }
  }

  // listInstalled() and audit(), each over one link that resolves and one that
  // dangles, per content directory the adapter lists. claude-code is included
  // here, which the broken-symlink block above leaves out (#823). Its two rows
  // split the pair across scopes: the project row holds resolving skill and
  // agents links beside a dangling skill link, and pins the broken-skill push;
  // the global row holds one dangling `.claude/agents` link, and pins what that
  // produces today.
  const plant = (dir, name, target) => {
    mkdirSync(dir, { recursive: true });
    symlinkSync(target, resolve(dir, name));
  };
  const skillSource = (sb) => resolve(sb.src, 'skills/commit-changes');
  const agentSource = (sb) => resolve(sb.src, 'agents/code-reviewer.md');
  const byPath = (entries) => [...entries].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  /** The two skill links every case plants: good-skill resolves, ghost-skill dangles. */
  const plantSkills = (sb, dir) => {
    plant(dir, 'good-skill', skillSource(sb));
    plant(dir, 'ghost-skill', sb.gone);
  };
  const skillEntries = (sb, dir, extra = {}) => [
    { id: 'ghost-skill', type: 'skill', ...extra, path: resolve(dir, 'ghost-skill'), broken: true },
    { id: 'good-skill', type: 'skill', ...extra, path: resolve(dir, 'good-skill'), broken: false },
  ];

  const LIST_CASES = [
    {
      name: 'universal (project)', make: () => new UniversalAdapter(), scope: 'project',
      build: (sb) => {
        const dir = resolve(sb.proj, '.agents/skills');
        plantSkills(sb, dir);
        return {
          list: [
            { id: 'ghost-skill', type: 'skill', path: resolve(dir, 'ghost-skill'), isSymlink: true, target: sb.gone, broken: true },
            { id: 'good-skill', type: 'skill', path: resolve(dir, 'good-skill'), isSymlink: true, target: skillSource(sb), broken: false },
          ],
          audit: { framework: 'Universal (.agents/)', ok: ['1 skills installed'], warnings: [], errors: ['1 broken symlinks: ghost-skill'] },
        };
      },
    },
    {
      name: 'claude-code (project): skills and a resolving agents link', make: () => new ClaudeCodeAdapter(), scope: 'project',
      build: (sb) => {
        const dir = resolve(sb.proj, '.claude/skills');
        plantSkills(sb, dir);
        plant(resolve(sb.proj, '.claude'), 'agents', resolve(sb.src, 'agents'));
        return {
          list: [
            { id: 'agents', type: 'agent', path: resolve(sb.proj, '.claude/agents'), broken: false },
            ...skillEntries(sb, dir),
          ],
          audit: { framework: 'Claude Code', ok: ['1 skills installed', 'agents symlink valid'], warnings: [], errors: ['1 broken skill symlinks'] },
        };
      },
    },
    {
      name: 'claude-code (global): a dangling agents link', make: () => new ClaudeCodeAdapter(), scope: 'global',
      build: (sb) => {
        plant(resolve(sb.home, '.claude'), 'agents', sb.gone);
        // At b3275420a listInstalled() tests the agents link with existsSync,
        // which follows it, so a dangling one is not listed at all and audit()
        // reports it as missing rather than broken.
        return {
          list: [],
          audit: { framework: 'Claude Code', ok: [], warnings: ['No agents symlink'], errors: [] },
        };
      },
    },
    {
      name: 'opencode (project): skills and agent files', make: () => new OpenCodeAdapter(), scope: 'project',
      build: (sb) => {
        const dir = resolve(sb.proj, '.opencode/skills');
        const agents = resolve(sb.proj, '.opencode/agents');
        plantSkills(sb, dir);
        plant(agents, 'good-agent.md', agentSource(sb));
        plant(agents, 'ghost-agent.md', sb.gone);
        return {
          list: [
            { id: 'ghost-agent', type: 'agent', path: resolve(agents, 'ghost-agent.md'), broken: true },
            { id: 'good-agent', type: 'agent', path: resolve(agents, 'good-agent.md'), broken: false },
            ...skillEntries(sb, dir),
          ],
          audit: { framework: 'OpenCode', ok: ['2 items installed'], warnings: [], errors: ['2 broken links'] },
        };
      },
    },
    {
      name: 'openclaw (global)', make: () => new OpenClawAdapter(), scope: 'global',
      build: (sb) => {
        const dir = resolve(sb.home, '.openclaw/workspace');
        plantSkills(sb, dir);
        return {
          list: skillEntries(sb, dir),
          audit: { framework: 'OpenClaw/NemoClaw', ok: ['1 skills in workspace'], warnings: [], errors: ['1 broken skill symlinks'] },
        };
      },
    },
    {
      name: 'hermes (global): skills and agent files', make: () => new HermesAdapter(), scope: 'global',
      build: (sb) => {
        const dir = resolve(sb.hermes, 'skills/git');
        const agents = resolve(sb.hermes, 'agents');
        plantSkills(sb, dir);
        plant(agents, 'good-agent.md', agentSource(sb));
        plant(agents, 'ghost-agent.md', sb.gone);
        return {
          list: [
            { id: 'ghost-agent', type: 'agent', path: resolve(agents, 'ghost-agent.md'), broken: true },
            { id: 'good-agent', type: 'agent', path: resolve(agents, 'good-agent.md'), broken: false },
            ...skillEntries(sb, dir, { domain: 'git' }),
          ],
          audit: { framework: 'Hermes Agent', ok: ['2 items installed'], warnings: [], errors: ['2 broken links'] },
        };
      },
    },
    {
      name: 'vibe (project)', make: () => new VibeAdapter(), scope: 'project',
      build: (sb) => {
        const dir = resolve(sb.proj, '.vibe/skills');
        plantSkills(sb, dir);
        return {
          list: skillEntries(sb, dir),
          audit: { framework: 'Mistral Vibe', ok: ['1 items installed'], warnings: [], errors: ['1 broken skill symlinks'] },
        };
      },
    },
    {
      name: 'gemini (project)', make: () => new GeminiAdapter(), scope: 'project',
      build: (sb) => {
        const dir = resolve(sb.proj, '.gemini/skills');
        plantSkills(sb, dir);
        return {
          list: skillEntries(sb, dir),
          audit: { framework: 'Gemini CLI', ok: ['1 skills installed'], warnings: [], errors: ['1 broken skill symlinks'] },
        };
      },
    },
    {
      name: 'cursor (project)', make: () => new CursorAdapter(), scope: 'project',
      build: (sb) => {
        const dir = resolve(sb.proj, '.cursor/skills');
        plantSkills(sb, dir);
        return {
          list: [
            { id: 'ghost-skill', type: 'skill', path: resolve(dir, 'ghost-skill'), format: 'skills', broken: true },
            { id: 'good-skill', type: 'skill', path: resolve(dir, 'good-skill'), format: 'skills', broken: false },
          ],
          audit: { framework: 'Cursor', ok: ['1 items installed'], warnings: [], errors: ['1 broken skill symlinks'] },
        };
      },
    },
    {
      name: 'copilot (project)', make: () => new CopilotAdapter(), scope: 'project',
      build: (sb) => {
        const dir = resolve(sb.proj, '.github/skills');
        plantSkills(sb, dir);
        return {
          list: skillEntries(sb, dir),
          audit: { framework: 'GitHub Copilot', ok: ['1 skills installed'], warnings: [], errors: ['1 broken skill symlinks'] },
        };
      },
    },
  ];

  for (const c of LIST_CASES) {
    it(`${c.name}: listInstalled() and audit()`, async () => {
      await inLinkSandbox(tmpRoot, `list-${c.name.replace(/[^a-z0-9]+/g, '-')}`, async (sb) => {
        const expected = c.build(sb);
        const adapter = c.make();
        assert.deepEqual(byPath(await adapter.listInstalled(sb.proj, c.scope)), byPath(expected.list));
        assert.deepEqual(await adapter.audit(sb.proj, c.scope), expected.audit);
      });
    });
  }
});

describe('opencode installs an agent only at <agents>/<id>.md (S3-B2 P2e)', () => {
  // At b3275420a opencode's install ran its skill-shaped steps for an agent too,
  // at <agents>/<id> with no extension, before writing the agent's link at
  // <agents>/<id>.md. So --force unlinked a user's own file at <agents>/<id>,
  // and a directory there made the agent install report "skipped" without
  // writing the link (S3-B2 design review, E4 and E4b).
  const site = LINK_SITES.find((s) => s.site === 'opencode agent file');
  let tmpRoot;

  before(() => {
    tmpRoot = realpathSync(mkdtempSync(resolve(tmpdir(), 'almanac-p2e-')));
  });

  after(() => rmTree(tmpRoot));

  it('install --force leaves a user\'s file at <agents>/<id> alone and links <id>.md', async () => {
    await inLinkSandbox(tmpRoot, 'file', async (sb) => {
      const agents = resolve(sb.proj, '.opencode/agents');
      mkdirSync(agents, { recursive: true });
      writeFileSync(resolve(agents, 'code-reviewer'), USER_CONTENT);
      const result = await new OpenCodeAdapter().install(
        linkItem(site, sb), sb.proj, 'project', { almanacRoot: sb.src, force: true },
      );
      assert.equal(readFileSync(resolve(agents, 'code-reviewer'), 'utf8'), USER_CONTENT);
      assert.deepEqual(result, { action: 'created', path: resolve(agents, 'code-reviewer.md') });
      assert.equal(readlinkSync(resolve(agents, 'code-reviewer.md')), site.relTarget);
    });
  });

  it('a directory at <agents>/<id> does not stop the agent install', async () => {
    await inLinkSandbox(tmpRoot, 'dir', async (sb) => {
      const agents = resolve(sb.proj, '.opencode/agents');
      mkdirSync(resolve(agents, 'code-reviewer'), { recursive: true });
      writeFileSync(resolve(agents, 'code-reviewer/notes.md'), USER_CONTENT);
      const result = await new OpenCodeAdapter().install(
        linkItem(site, sb), sb.proj, 'project', { almanacRoot: sb.src },
      );
      assert.deepEqual(result, { action: 'created', path: resolve(agents, 'code-reviewer.md') });
      assert.equal(readlinkSync(resolve(agents, 'code-reviewer.md')), site.relTarget);
      assert.equal(readFileSync(resolve(agents, 'code-reviewer/notes.md'), 'utf8'), USER_CONTENT);
    });
  });
});
