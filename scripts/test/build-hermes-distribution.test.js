/**
 * Tests for `scripts/build-hermes-distribution.js` (companion #78).
 *
 * One synthetic almanac per test, each gate broken exactly once, and the clean tree pinned by
 * its exact output set — because a gate that has never been seen red is a gate whose colour
 * means nothing (CLAUDE.md § Proving a Gate Can Fail). The real tree is exercised by
 * `npm run check:hermes-distribution` in CI; these cover the decisions underneath on trees small
 * enough to reason about.
 *
 * Most cases drive the script as a subprocess through `--root`, so the exit-code contract
 * (0 clean / 1 finding / 2 cannot build) is what is asserted. The gates that only a FUTURE edit
 * to the writer could trip — a manifest field, a symlink in the emitted tree, a skill directory
 * that is a file — are reached through the module API by tampering with an emitted tree and
 * calling `checkOutput` on it, since the CLI can only ever emit what agrees with its inputs.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, symlinkSync, readFileSync, readdirSync, existsSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as yaml from 'js-yaml';
import { rmTree } from './_tmp.js';

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'build-hermes-distribution.js');

const {
  USER_OWNED_EXCLUDE, EXCLUDED_SKILL_DIRS, BANNED_LITERALS, OWNED_ROOT_ENTRIES, HERMES_REQUIRES,
  loadInputs, emit, checkOutput,
} = await import(SCRIPT);

/** Write a minimal almanac: two skills, one with a references/ file. Returns its root. */
function fixture({ ids = ['alpha', 'beta'], total = null, version = '1.2.3', soul = '# Soul\n\nText.\n', registryPatch = null, base = tmpdir() } = {}) {
  const root = mkdtempSync(join(base, 'hermes-dist-fixture-'));
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'agent-almanac', version, author: 'A. Author', license: 'MIT' }));
  writeFileSync(join(root, 'SOUL.md'), soul);
  writeFileSync(join(root, 'LICENSE'), 'MIT License\n');
  mkdirSync(join(root, 'agents'));
  mkdirSync(join(root, 'teams'));
  writeFileSync(join(root, 'agents', '_registry.yml'), 'total_agents: 2\nagents: []\n');
  writeFileSync(join(root, 'teams', '_registry.yml'), 'total_teams: 1\nteams: []\n');
  mkdirSync(join(root, 'skills'));
  const registry = {
    total_skills: total ?? ids.length,
    domains: { general: { description: 'd', skills: ids.map((id) => ({ id, path: `${id}/SKILL.md`, complexity: 'basic' })) } },
  };
  if (registryPatch) registryPatch(registry);
  writeFileSync(join(root, 'skills', '_registry.yml'), yaml.dump(registry));
  for (const id of ids) {
    mkdirSync(join(root, 'skills', id), { recursive: true });
    writeFileSync(join(root, 'skills', id, 'SKILL.md'), `---\nname: ${id}\n---\n# ${id}\n`);
  }
  if (ids.includes('beta')) {
    mkdirSync(join(root, 'skills', 'beta', 'references'));
    writeFileSync(join(root, 'skills', 'beta', 'references', 'notes.md'), 'notes\n');
  }
  // Scaffolding that lives inside skills/ in the real repository and must never be emitted.
  mkdirSync(join(root, 'skills', '_template'));
  writeFileSync(join(root, 'skills', '_template', 'SKILL.md'), '# template\n');
  return root;
}

function run(root, args, { json = true } = {}) {
  const r = spawnSync(process.execPath, [SCRIPT, '--root', root, ...(json ? ['--json'] : []), ...args], { encoding: 'utf8' });
  let summary = null;
  if (json) { try { summary = JSON.parse(r.stdout); } catch { /* exit 2 prints no JSON */ } }
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, summary };
}

const gates = (summary) => [...new Set(summary.findings.map((f) => f.gate))].sort();

// ── the Hermes constants, pinned as full sets ─────────────────────────────────────────────

test('USER_OWNED_EXCLUDE and EXCLUDED_SKILL_DIRS are the full Hermes sets, not a count', () => {
  // Read off hermes_cli/profile_distribution.py (identical at the v0.13.0 pin and upstream main,
  // 2026-09-02) and agent/skill_utils.py (upstream main). A length assertion would let one name
  // be swapped for another and silently re-scope the gate; a full set does not.
  assert.deepEqual([...USER_OWNED_EXCLUDE].sort(), [
    '.env', '.hermes_history', '.update_check', '.worktrees', 'active_profile', 'audio_cache', 'auth.json', 'auth.lock',
    'backups', 'bin', 'browser_screenshots', 'cache', 'checkpoints', 'document_cache', 'errors.log', 'gateway.pid',
    'gateway_state.json', 'hermes-agent', 'hermes_state.db', 'home', 'image_cache', 'local', 'logs', 'memories',
    'node_modules', 'plans', 'processes.json', 'profiles', 'response_store.db', 'response_store.db-shm',
    'response_store.db-wal', 'sandboxes', 'sessions', 'state.db', 'state.db-shm', 'state.db-wal', 'workspace',
  ]);
  assert.equal(USER_OWNED_EXCLUDE.length, 37);
  assert.deepEqual([...EXCLUDED_SKILL_DIRS].sort(), [
    '.archive', '.git', '.github', '.hub', '.mypy_cache', '.nox', '.pytest_cache', '.ruff_cache', '.tox', '.venv',
    '__pycache__', 'node_modules', 'site-packages', 'venv',
  ]);
});

test('the harness\'s pinned copies of both sets equal the generator\'s — the two in-repo copies cannot drift', () => {
  // tools/validate-hermes-distribution.py carries its own frozenset literals for --verify (it
  // reads the generator through node when given --almanac, but --verify has no almanac). This
  // is the check that keeps those literals equal to the arrays above, in the required job.
  const harness = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'tools', 'validate-hermes-distribution.py'), 'utf8');
  const literal = (name) => {
    const m = harness.match(new RegExp(`^${name} = frozenset\\(\\{?\\(?([\\s\\S]*?)\\)?\\}?\\)\\n`, 'm'));
    assert.ok(m, `${name} literal not found in the harness`);
    return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]).sort();
  };
  assert.deepEqual(literal('EXPECTED_USER_OWNED'), [...USER_OWNED_EXCLUDE].sort());
  assert.deepEqual(literal('EXPECTED_EXCLUDED_SKILL_DIRS'), [...EXCLUDED_SKILL_DIRS].sort());
});

// ── the clean build ───────────────────────────────────────────────────────────────────────

test('clean tree: exit 0, exact root set, one directory per registry id, _template never emitted', () => {
  const root = fixture();
  const out = join(root, 'out');
  try {
    const r = run(root, ['--out', out]);
    assert.equal(r.status, 0, r.stderr + r.stdout);
    assert.deepEqual(r.summary.findings, []);
    assert.equal(r.summary.written, true);
    assert.deepEqual(readdirSync(out).sort(), [...OWNED_ROOT_ENTRIES].sort());
    assert.deepEqual(readdirSync(join(out, 'skills')).sort(), ['alpha', 'beta']);
    assert.ok(existsSync(join(out, 'skills', 'beta', 'references', 'notes.md')), 'support files travel with the skill');
    assert.equal(readFileSync(join(out, 'SOUL.md'), 'utf8'), readFileSync(join(root, 'SOUL.md'), 'utf8'));
    assert.equal(r.summary.measured.skillMdCount, 2);
    assert.equal(r.summary.measured.filesScanned, 2 + 1 + 4, 'two SKILL.md, notes.md, and the four root files');
  } finally { rmTree(root); }
});

test('human-readable output (the branch CI prints): the counts line and the verdict line', () => {
  const root = fixture();
  try {
    const r = run(root, ['--check'], { json: false });
    assert.equal(r.status, 0, r.stderr + r.stdout);
    // 11 paths: four root files, skills/, alpha/, alpha/SKILL.md, beta/, beta/SKILL.md,
    // beta/references/, beta/references/notes.md — pinned, so a mis-derived count is a failure.
    assert.match(r.stdout, /^hermes distribution 1\.2\.3: 2 skills \(2 agents, 1 teams in the catalog\), built in a temp dir; 11 paths walked, 7 files scanned$/m);
    assert.match(r.stdout, /^OK: every gate passed$/m);
    mkdirSync(join(root, 'skills', 'alpha', 'cache'));
    writeFileSync(join(root, 'skills', 'alpha', 'cache', 'x'), 'x');
    const red = run(root, ['--check'], { json: false });
    assert.equal(red.status, 1);
    assert.match(red.stdout, /^  \[user-owned\] skills\/alpha\/cache: component 'cache'/m);
    assert.match(red.stdout, /^FAIL: 2 finding\(s\)$/m);
  } finally { rmTree(root); }
});

test('manifest: Hermes key order, version mirrors package.json, no env_requires, no distribution_owned', () => {
  const root = fixture({ version: '9.8.7' });
  const out = join(root, 'out');
  try {
    assert.equal(run(root, ['--out', out]).status, 0);
    const text = readFileSync(join(out, 'distribution.yaml'), 'utf8');
    const m = yaml.load(text);
    assert.deepEqual(Object.keys(m), ['name', 'version', 'description', 'hermes_requires', 'author', 'license'],
      'the key order Hermes to_dict() emits, and nothing more');
    assert.equal(m.name, 'agent-almanac');
    assert.equal(m.version, '9.8.7');
    assert.equal(m.hermes_requires, HERMES_REQUIRES);
    assert.equal(m.author, 'A. Author');
    assert.equal(m.license, 'MIT');
    assert.match(m.description, /\b2 skills\b/);
    assert.match(m.description, /\b2 agents\b/);
    assert.match(m.description, /\b1 teams\b/);
    assert.ok(!('env_requires' in m));
    assert.ok(!('distribution_owned' in m));
    assert.match(text, /^# Generated by scripts\/build-hermes-distribution\.js/, 'the file says what wrote it');
  } finally { rmTree(root); }
});

test('deterministic: two builds of the same tree are byte-identical, and --check --against agrees', () => {
  const root = fixture();
  const a = join(root, 'a');
  const b = join(root, 'b');
  try {
    assert.equal(run(root, ['--out', a]).status, 0);
    assert.equal(run(root, ['--out', b]).status, 0);
    for (const rel of ['distribution.yaml', 'README.md', 'SOUL.md', 'LICENSE', 'skills/alpha/SKILL.md']) {
      assert.ok(readFileSync(join(a, rel)).equals(readFileSync(join(b, rel))), `${rel} differs between builds`);
    }
    const r = run(root, ['--check', '--against', a]);
    assert.equal(r.status, 0, r.stdout);
  } finally { rmTree(root); }
});

// ── drift ─────────────────────────────────────────────────────────────────────────────────

test('--check --against: an edited, an extra, a missing file and a flipped executable bit are each drift', () => {
  const root = fixture();
  const out = join(root, 'out');
  try {
    assert.equal(run(root, ['--out', out]).status, 0);
    writeFileSync(join(out, 'skills', 'alpha', 'SKILL.md'), 'hand edit\n');
    writeFileSync(join(out, 'skills', 'alpha', 'extra.md'), 'extra\n');
    rmSync(join(out, 'skills', 'beta', 'references', 'notes.md'));
    chmodSync(join(out, 'LICENSE'), 0o755);
    const r = run(root, ['--check', '--against', out]);
    assert.equal(r.status, 1);
    const drift = r.summary.findings.filter((f) => f.gate === 'drift').map((f) => `${f.path}: ${f.detail}`).sort();
    assert.deepEqual(drift, [
      'LICENSE: executable bit differs',
      'skills/alpha/SKILL.md: content differs',
      'skills/alpha/extra.md: present in the checkout but not generated',
      'skills/beta/references/notes.md: missing from the checkout',
    ]);
  } finally { rmTree(root); }
});

test('--check --against: a symlink in the checkout is drift even when its target has the right bytes', () => {
  const root = fixture();
  const out = join(root, 'out');
  try {
    assert.equal(run(root, ['--out', out]).status, 0);
    const target = join(out, 'skills', 'alpha', 'SKILL.md');
    const bytes = readFileSync(target);
    writeFileSync(join(root, 'elsewhere.md'), bytes);
    rmSync(target);
    symlinkSync(join(root, 'elsewhere.md'), target);
    const r = run(root, ['--check', '--against', out]);
    assert.equal(r.status, 1);
    assert.deepEqual(r.summary.findings.map((f) => `${f.gate}:${f.path}:${f.detail}`), ['drift:skills/alpha/SKILL.md:symlink in the checkout']);
  } finally { rmTree(root); }
});

// ── --out ─────────────────────────────────────────────────────────────────────────────────

test('--out: regenerates in place over its own entries (and .git); a file hand-added INSIDE an owned entry is replaced with it', () => {
  const root = fixture();
  const out = join(root, 'out');
  try {
    assert.equal(run(root, ['--out', out]).status, 0);
    mkdirSync(join(out, '.git'));
    writeFileSync(join(out, '.git', 'HEAD'), 'ref: refs/heads/main\n');
    writeFileSync(join(out, 'skills', 'alpha', 'SKILL.md'), 'stale\n');
    mkdirSync(join(out, 'skills', 'zzz'));
    writeFileSync(join(out, 'skills', 'zzz', 'SKILL.md'), 'hand-added below the root\n');
    const again = run(root, ['--out', out]);
    assert.equal(again.status, 0, again.stderr);
    assert.notEqual(readFileSync(join(out, 'skills', 'alpha', 'SKILL.md'), 'utf8'), 'stale\n', 'owned entries are replaced');
    assert.ok(!existsSync(join(out, 'skills', 'zzz')), 'the refusal is root-level by design: below the root, the entry is regenerated');
    assert.ok(existsSync(join(out, '.git', 'HEAD')), '.git is left alone');
  } finally { rmTree(root); }
});

test('--out: a foreign entry at the root is refused with exit 2 and nothing is deleted', () => {
  const root = fixture();
  const out = join(root, 'out');
  try {
    assert.equal(run(root, ['--out', out]).status, 0);
    writeFileSync(join(out, 'stray.txt'), 'not mine\n');
    const refused = run(root, ['--out', out]);
    assert.equal(refused.status, 2);
    assert.match(refused.stderr, /does not own: stray\.txt/);
    assert.ok(existsSync(join(out, 'stray.txt')), 'nothing was deleted');
    assert.ok(existsSync(join(out, 'distribution.yaml')), 'and nothing owned was deleted either');
  } finally { rmTree(root); }
});

test('--out: the repository root, anywhere under its skills/ tree, or a parent of a source skill is refused with exit 2', () => {
  // The fixture lives under a test-owned parent so the ancestor case points --out at a directory
  // this test created — never at the shared system temp dir, where the only thing standing
  // between the suite and a recursive delete would be the code under test.
  const parent = mkdtempSync(join(tmpdir(), 'hermes-dist-parent-'));
  const root = fixture({ base: parent });
  try {
    // All three containment arms are shadowed by another refusal at exit 2 (prepareOutDir would
    // refuse the root and any ancestor as holding foreign entries), so each arm is pinned by its
    // MESSAGE; drop an assertion below and that arm's mutant silently survives.
    const cases = [
      [root, /is the repository root/],
      [join(root, 'skills'), /is inside the source skills tree/],
      [join(root, 'skills', 'alpha'), /is inside the source skills tree/],
      [join(root, 'skills', 'alpha', 'out'), /is inside the source skills tree/],
      [parent, /contains the source skill/],
    ];
    for (const [out, message] of cases) {
      const r = run(root, ['--out', out]);
      assert.equal(r.status, 2, `${out}: ${r.stdout}${r.stderr}`);
      assert.match(r.stderr, message, out);
    }
    assert.deepEqual(readdirSync(join(root, 'skills', 'alpha')), ['SKILL.md'], 'the source skill is untouched');
    assert.deepEqual(readdirSync(parent).length, 1, 'the parent still holds exactly the fixture');
  } finally { rmTree(parent); }
});

test('--out: a red build writes nothing — the target is neither created nor touched', () => {
  const root = fixture();
  const out = join(root, 'out');
  try {
    assert.equal(run(root, ['--out', out]).status, 0);
    const before = readFileSync(join(out, 'skills', 'alpha', 'SKILL.md'));
    writeFileSync(join(root, 'skills', 'alpha', 'SKILL.md'), 'now with sk-ant-secret inside\n');
    const r = run(root, ['--out', out]);
    assert.equal(r.status, 1);
    assert.equal(r.summary.written, false);
    assert.ok(readFileSync(join(out, 'skills', 'alpha', 'SKILL.md')).equals(before), 'the previous good tree survives a red build');
    const fresh = join(root, 'fresh');
    assert.equal(run(root, ['--out', fresh]).status, 1);
    assert.ok(!existsSync(fresh), 'a new target is not even created');
  } finally { rmTree(root); }
});

// ── the gates, one red each ───────────────────────────────────────────────────────────────

test('user-owned: a nested directory named in USER_OWNED_EXCLUDE is a finding at any depth', () => {
  const root = fixture();
  try {
    mkdirSync(join(root, 'skills', 'beta', 'references', 'cache'), { recursive: true });
    writeFileSync(join(root, 'skills', 'beta', 'references', 'cache', 'x.md'), 'x\n');
    const r = run(root, ['--check']);
    assert.equal(r.status, 1);
    assert.deepEqual(gates(r.summary), ['user-owned']);
    assert.ok(r.summary.findings.some((f) => f.path === 'skills/beta/references/cache' && /'cache'/.test(f.detail)));
  } finally { rmTree(root); }
});

test('hermes-excluded: a site-packages component is a finding', () => {
  const root = fixture();
  try {
    // `site-packages`: in EXCLUDED_SKILL_DIRS, not in USER_OWNED_EXCLUDE, not dot- or
    // underscore-prefixed — so it exercises this gate alone.
    assert.ok(EXCLUDED_SKILL_DIRS.includes('site-packages') && !USER_OWNED_EXCLUDE.includes('site-packages'));
    mkdirSync(join(root, 'skills', 'alpha', 'vendor', 'site-packages'), { recursive: true });
    writeFileSync(join(root, 'skills', 'alpha', 'vendor', 'site-packages', 'm.py'), 'x');
    const r = run(root, ['--check']);
    assert.equal(r.status, 1);
    assert.deepEqual(gates(r.summary), ['hermes-excluded']);
    assert.equal(r.summary.findings.length, 2, 'the directory and the file beneath it');
  } finally { rmTree(root); }
});

test('hidden: an underscore-prefixed and a dot-prefixed DIRECTORY are each a finding; a dot-file is not', () => {
  const root = fixture();
  try {
    mkdirSync(join(root, 'skills', 'alpha', '_private'));
    writeFileSync(join(root, 'skills', 'alpha', '_private', 'x.md'), 'x\n');
    mkdirSync(join(root, 'skills', 'beta', '.hidden'));
    writeFileSync(join(root, 'skills', 'beta', '.hidden', 'y.md'), 'y\n');
    writeFileSync(join(root, 'skills', 'beta', '.gitkeep'), '');
    const r = run(root, ['--check']);
    assert.equal(r.status, 1);
    assert.deepEqual(gates(r.summary), ['hidden']);
    assert.deepEqual(r.summary.findings.map((f) => f.path).sort(), ['skills/alpha/_private', 'skills/beta/.hidden']);
  } finally { rmTree(root); }
});

test('symlink: a symlink in a skill is reported, never copied, and the build writes nothing', () => {
  const root = fixture();
  const out = join(root, 'out');
  try {
    symlinkSync('SKILL.md', join(root, 'skills', 'alpha', 'link.md'));
    const r = run(root, ['--out', out]);
    assert.equal(r.status, 1);
    assert.deepEqual(gates(r.summary), ['symlink']);
    assert.equal(r.summary.findings[0].path, 'skills/alpha/link.md');
    assert.ok(!existsSync(out), 'a red build writes nothing');
    // "never copied" is observable only where the emitted tree is: through emit() directly.
    const inputs = loadInputs(root);
    const emitted = join(root, 'emitted');
    mkdirSync(emitted);
    const copyFindings = emit(inputs, emitted);
    assert.deepEqual(copyFindings.map((f) => `${f.gate}:${f.path}`), ['symlink:skills/alpha/link.md']);
    assert.ok(!existsSync(join(emitted, 'skills', 'alpha', 'link.md')), 'not dereferenced into a copy');
    assert.ok(existsSync(join(emitted, 'skills', 'alpha', 'SKILL.md')), 'the rest of the skill is emitted');
  } finally { rmTree(root); }
});

test('symlink: a symlinked root SOUL.md or LICENSE is refused at load (exit 2), not dereferenced', () => {
  for (const name of ['SOUL.md', 'LICENSE']) {
    const root = fixture();
    try {
      const real = readFileSync(join(root, name));
      writeFileSync(join(root, `${name}.real`), real);
      rmSync(join(root, name));
      symlinkSync(join(root, `${name}.real`), join(root, name));
      const r = run(root, ['--check']);
      assert.equal(r.status, 2, r.stdout + r.stderr);
      assert.match(r.stderr, new RegExp(`${name} at the repository root is a symlink`));
    } finally { rmTree(root); }
  }
});

test('skill-shape + count: a SKILL.md preserved under references/ inflates the count and is a finding', () => {
  const root = fixture();
  try {
    writeFileSync(join(root, 'skills', 'beta', 'references', 'SKILL.md'), '# preserved package\n');
    const r = run(root, ['--check']);
    assert.equal(r.status, 1);
    assert.deepEqual(gates(r.summary), ['count', 'skill-shape']);
    assert.equal(r.summary.measured.skillMdCount, 3, 'what v0.13.0 _count_skills would report');
  } finally { rmTree(root); }
});

test('cannot build (exit 2): a missing directory, a contradicted total, an empty registry, an id that is not its directory, an unsafe id', () => {
  const cases = [
    { root: (() => { const r = fixture({ ids: ['alpha', 'beta', 'gamma'] }); rmTree(join(r, 'skills', 'gamma'), { force: false }); return r; })(),
      message: /'gamma' names skills\/gamma\/SKILL\.md, which does not exist/ },
    { root: fixture({ total: 5 }), message: /total_skills says 5 but 2 entries/ },
    { root: fixture({ ids: [], total: 0 }), message: /lists no skills — refusing to build an empty distribution/ },
    { root: fixture({ registryPatch: (reg) => { reg.domains.general.skills[0].path = 'elsewhere/SKILL.md'; } }),
      message: /'alpha' has path 'elsewhere\/SKILL\.md' — the directory must be named by the id/ },
    { root: fixture({ registryPatch: (reg) => { reg.domains.general.skills[0].id = '../alpha'; reg.domains.general.skills[0].path = '../alpha/SKILL.md'; } }),
      message: /id '\.\.\/alpha' is not a single safe path segment/ },
  ];
  try {
    for (const c of cases) {
      const r = run(c.root, ['--check']);
      assert.equal(r.status, 2, r.stdout + r.stderr);
      assert.match(r.stderr, c.message);
    }
  } finally { for (const c of cases) rmTree(c.root); }
});

test('banned-literal: each literal fires in a skill file, and the emitted README and manifest pass', () => {
  for (const lit of BANNED_LITERALS) {
    const root = fixture();
    try {
      writeFileSync(join(root, 'skills', 'beta', 'references', 'notes.md'), `see ${lit} for details\n`);
      const r = run(root, ['--check']);
      assert.equal(r.status, 1, `'${lit}' did not fire`);
      assert.deepEqual(gates(r.summary), ['banned-literal']);
      assert.deepEqual(r.summary.findings.map((f) => f.path), ['skills/beta/references/notes.md']);
      assert.ok(r.summary.findings[0].detail.includes(lit));
    } finally { rmTree(root); }
  }
  // The trap named in the header: `almanac@` is a substring of the npm spelling. The README this
  // script writes must therefore never spell name@version — pinned here as a positive/negative pair.
  assert.ok('agent-almanac@1.9.1'.includes('almanac@'), 'the literal would catch the npm spelling');
  const root = fixture();
  const out = join(root, 'out');
  try {
    assert.equal(run(root, ['--out', out]).status, 0);
    const readme = readFileSync(join(out, 'README.md'), 'latin1');
    for (const lit of BANNED_LITERALS) assert.ok(!readme.includes(lit), `README contains '${lit}'`);
    assert.match(readme, /No ref pinning/, 'the README states the no-pinning rule');
    assert.match(readme, /It DOES replace that profile's `skills\/`\s+directory wholesale/, 'and what an update destroys');
    assert.match(readme, /git -C \/path\/to\/clone archive/, 'and how to pin without shipping .git');
    assert.match(readme, /hermes profile install github\.com\/pjt222\/agent-almanac-hermes-profile/);
  } finally { rmTree(root); }
});

// ── gates only a future writer edit could trip: through the module API ────────────────────

test('checkOutput re-reads the tree it is given: every manifest field, the root set, SOUL.md, symlinks and skill shape are gated on disk', () => {
  const tamper = (mutate, expectedPaths) => {
    const root = fixture();
    const out = join(root, 'out');
    try {
      const inputs = loadInputs(root);
      mkdirSync(out);
      assert.deepEqual(emit(inputs, out), []);
      assert.deepEqual(checkOutput(out, inputs).findings, [], 'clean before tampering');
      mutate(out);
      const paths = checkOutput(out, inputs).findings.map((f) => `${f.gate}:${f.path}`).sort();
      assert.deepEqual(paths, expectedPaths.sort());
    } finally { rmTree(root); }
  };
  const rewriteManifest = (out, change) => {
    const m = yaml.load(readFileSync(join(out, 'distribution.yaml'), 'utf8'));
    change(m);
    writeFileSync(join(out, 'distribution.yaml'), yaml.dump(m, { sortKeys: false }));
  };
  // manifest, field by field
  tamper((out) => rewriteManifest(out, (m) => { m.version = '0.0.0'; }), ['manifest:distribution.yaml:version']);
  tamper((out) => rewriteManifest(out, (m) => { m.name = 'Agent Almanac'; }),
    ['manifest:distribution.yaml:name', 'manifest:distribution.yaml:name']); // not the expected name, and not a valid Hermes id
  tamper((out) => rewriteManifest(out, (m) => { m.name = 'test'; }),
    ['manifest:distribution.yaml:name', 'manifest:distribution.yaml:name']); // not the expected name, and reserved by Hermes
  tamper((out) => rewriteManifest(out, (m) => { m.env_requires = [{ name: 'X' }]; }),
    ['manifest:distribution.yaml:env_requires', 'manifest:distribution.yaml:env_requires']); // present, and not an allowed key
  tamper((out) => rewriteManifest(out, (m) => { m.distribution_owned = ['skills']; }),
    ['manifest:distribution.yaml:distribution_owned', 'manifest:distribution.yaml:distribution_owned']);
  tamper((out) => rewriteManifest(out, (m) => { m.hermes_requires = '>=0.1.0'; }), ['manifest:distribution.yaml:hermes_requires']);
  tamper((out) => rewriteManifest(out, (m) => { m.description = 'no count here'; }), ['manifest:distribution.yaml:description']);
  tamper((out) => rewriteManifest(out, (m) => { m.description = m.description.replace('2 skills', '12 skills'); }),
    ['manifest:distribution.yaml:description']); // a whole number, not a substring
  tamper((out) => rewriteManifest(out, (m) => { m.author = 'Someone Else'; }), ['manifest:distribution.yaml:author']);
  tamper((out) => rewriteManifest(out, (m) => { delete m.license; }), ['manifest:distribution.yaml:license']);
  // A YAML sequence is an object to `typeof`; it must be reported as not-a-mapping, not walked as keys.
  tamper((out) => writeFileSync(join(out, 'distribution.yaml'), '- not\n- a mapping\n'), ['manifest:distribution.yaml']);
  tamper((out) => writeFileSync(join(out, 'distribution.yaml'), 'name: [unclosed\n'), ['manifest:distribution.yaml']);
  // root set and soul
  tamper((out) => writeFileSync(join(out, 'SOUL.md'), 'edited\n'), ['soul:SOUL.md']);
  tamper((out) => writeFileSync(join(out, 'stray.txt'), 'x\n'), ['root-set:stray.txt']);
  tamper((out) => rmSync(join(out, 'LICENSE')), ['root-set:LICENSE']);
  // skill shape and count, every add() site
  tamper((out) => rmSync(join(out, 'skills', 'alpha', 'SKILL.md')), ['skill-shape:skills/alpha/SKILL.md', 'count:skills']);
  tamper((out) => { mkdirSync(join(out, 'skills', 'gamma')); writeFileSync(join(out, 'skills', 'gamma', 'SKILL.md'), 'x\n'); },
    ['count:skills/gamma', 'count:skills']);
  tamper((out) => rmTree(join(out, 'skills', 'alpha'), { force: false }), ['count:skills/alpha', 'count:skills']);
  tamper((out) => { rmTree(join(out, 'skills', 'alpha'), { force: false }); writeFileSync(join(out, 'skills', 'alpha'), 'a file\n'); },
    ['skill-shape:skills/alpha', 'count:skills']);
  // a symlink in the EMITTED tree (the output-side gate; copyTree never produces one)
  tamper((out) => symlinkSync('notes.md', join(out, 'skills', 'beta', 'references', 'link.md')), ['symlink:skills/beta/references/link.md']);
  // a vacuous run: no files at all is a finding, not a clean scan
  tamper((out) => { for (const n of readdirSync(out)) rmTree(join(out, n), { force: false }); },
    ['count:.', 'count:skills/alpha', 'count:skills/beta', 'count:skills', ...OWNED_ROOT_ENTRIES.map((n) => `root-set:${n}`)]);
});

// ── usage ─────────────────────────────────────────────────────────────────────────────────

test('usage: unknown flag, both modes, neither mode, --against without --check, --against not a directory all exit 2', () => {
  const root = fixture();
  try {
    for (const args of [['--bogus'], ['--out', join(root, 'o'), '--check'], [], ['--against', root], ['--check', '--against', join(root, 'nope')], ['--check', '--against', join(root, 'SOUL.md')]]) {
      const r = spawnSync(process.execPath, [SCRIPT, '--root', root, ...args], { encoding: 'utf8' });
      assert.equal(r.status, 2, `${args.join(' ')}: ${r.stdout}${r.stderr}`);
    }
    assert.equal(spawnSync(process.execPath, [SCRIPT, '--help'], { encoding: 'utf8' }).status, 0);
    // The accept side of the --against guard: a checkout reached through a symlinked path is a
    // directory to the walk that diffs it, so it must be one to the guard (stat, not lstat).
    const out = join(root, 'out');
    assert.equal(run(root, ['--out', out]).status, 0);
    symlinkSync(out, join(root, 'out-link'));
    const viaLink = run(root, ['--check', '--against', join(root, 'out-link')]);
    assert.equal(viaLink.status, 0, viaLink.stdout + viaLink.stderr);
  } finally { rmTree(root); }
});

test('could-not-build is exit 2 on both arms: a BuildError, and a crash the catch-all reports with its stack', () => {
  // Arm 1, BuildError: a missing root is caught by readJson into "cannot build".
  const missing = spawnSync(process.execPath, [SCRIPT, '--root', join(tmpdir(), 'does-not-exist-' + process.pid), '--check'], { encoding: 'utf8' });
  assert.equal(missing.status, 2, missing.stdout + missing.stderr);
  assert.match(missing.stderr, /cannot build/);
  assert.doesNotMatch(missing.stderr, /unexpected failure/);
  // Arm 2, a genuine crash: --out beneath a regular file passes assertOutDirSafe (not the root,
  // not under skills/, contains no source skill), the temp build gates clean, and then
  // prepareOutDir's mkdirSync throws ENOTDIR — not a BuildError. It must be exit 2 with the
  // stack, never exit 1, which the contract reserves for a finding.
  const root = fixture();
  try {
    const r = run(root, ['--out', join(root, 'SOUL.md', 'x')]);
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stderr, /unexpected failure/);
    assert.match(r.stderr, /ENOTDIR/);
    assert.doesNotMatch(r.stderr, /cannot build/);
  } finally { rmTree(root); }
});
