/**
 * Tests for `scripts/lib/mutation-parse.js` and its wiring into `mutation-check.js` (#758).
 *
 * The property under test is not "python files get checked". It is that the tool can no longer
 * say `it parses` about a file it did not check, and that every path where it cannot check
 * ends somewhere other than a kill. So each verdict class gets a test, and the six end-to-end
 * cases exercise the exact shapes from the issue and its review: a syntax-broken `.py` mutant
 * reports `INVALID MUTANT` where the old code reported a kill (the test command is one that
 * genuinely goes red on the broken file, so the old behaviour would have printed `MUTANT
 * KILLED` and the assertion discriminates), a file type with no checker is refused before a
 * baseline is spent, and so is an original that already fails its own checker.
 *
 * Unit tests use the real interpreters where CI has them (`ci-scripts.yml` sets up python3
 * through `setup-python`; bash is on every runner). R is not on the CI image, so the R path is
 * driven through an injected `spawnSync` for the missing case and, when `Rscript` happens to
 * exist locally, also for real — both branches assert, neither skips silently.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  checkSyntax,
  classifyExtension,
  checkerName,
  isWorkflowScript,
  packageType,
  wrapWorkflow,
  CHECKED_EXTENSIONS,
  SYNTAX_FREE_EXTENSIONS,
  STDIN_CHECKERS,
  WORKFLOW_DIALECT_CHECKER,
} from '../lib/mutation-parse.js';

const SCRIPTS = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TOOL = join(SCRIPTS, 'mutation-check.js');
const ROOT = resolve(SCRIPTS, '..');

const hasBinary = (bin) => !spawnSync(bin, ['--version'], { encoding: 'utf8' }).error;

// ── classification ──────────────────────────────────────────────────────────

test('every extension lands in exactly one class, and unknown ones are no-checker', () => {
  // Both sets are PINNED, not iterated. The exemption set is the one that matters: it growing
  // means one more type stops being checked while the tool prints "no syntax to check", which
  // is #758 restated, and a loop over the set under test cannot see that (review S-D).
  assert.deepEqual([...SYNTAX_FREE_EXTENSIONS].sort(), ['.markdown', '.md', '.txt']);
  for (const ext of SYNTAX_FREE_EXTENSIONS) assert.equal(classifyExtension(ext), 'syntax-free', ext);
  for (const ext of CHECKED_EXTENSIONS) {
    assert.equal(classifyExtension(ext), 'checker', ext);
    assert.equal(typeof checkerName(`/x/file${ext}`, '/x'), 'string', `${ext} names its checker`);
  }
  assert.deepEqual([...CHECKED_EXTENSIONS].sort(), ['.R', '.bash', '.cjs', '.js', '.json', '.mjs', '.py', '.r', '.sh', '.yaml', '.yml']);
  for (const ext of ['.toml', '.rs', '.go', '', '.PY', '.Md']) {
    assert.equal(classifyExtension(ext), 'no-checker', ext);
    assert.equal(checkerName(`/x/file${ext}`, '/x'), null);
  }
});

test('the stdin checkers run isolated from startup files (review S3)', () => {
  assert.ok(STDIN_CHECKERS['.py'].args.includes('-I'), 'python3 -I: no sitecustomize/usercustomize, no env');
  assert.ok(STDIN_CHECKERS['.R'].args.includes('--vanilla'), 'Rscript --vanilla: no .Rprofile — viz/ carries one that sources renv');
  assert.match(STDIN_CHECKERS['.py'].args.at(-1), /compile\(/, 'compile(), not ast.parse — see the module docstring');
  for (const [ext, checker] of Object.entries(STDIN_CHECKERS)) {
    assert.ok(checker.bin && Array.isArray(checker.args) && checker.name, ext);
  }
});

test('the Workflow dialect is ROOT-ANCHORED, not "some parent is called workflows" (review S-B)', () => {
  assert.ok(isWorkflowScript('/r/workflows/review-changes.mjs', '/r'));
  assert.ok(isWorkflowScript('/r/.claude/workflows/x.mjs', '/r'), 'the discovery directory counts too');
  assert.ok(!isWorkflowScript('/r/workflows/helper.js', '/r'), 'the dialect is .mjs only');
  assert.ok(!isWorkflowScript('/r/scripts/review-changes.mjs', '/r'), 'a different directory is not the dialect');
  // The dangerous direction: a fixture under SOME OTHER workflows/ must not get the looser goal.
  assert.ok(!isWorkflowScript('/r/tests/fixtures/workflows/fx.mjs', '/r'), 'depth-agnostic matching is the bug');
  assert.ok(!isWorkflowScript('/r/workflows/sub/x.mjs', '/r'), 'nested below workflows/ is not a workflow');
  assert.ok(!isWorkflowScript('/elsewhere/workflows/x.mjs', '/r'), 'outside the root at all');
  assert.ok(!isWorkflowScript('/r/workflows/x.mjs', undefined), 'no root, no anchor, no dialect');
  assert.equal(checkerName('/r/workflows/x.mjs', '/r'), WORKFLOW_DIALECT_CHECKER);
  assert.equal(checkerName('/r/tests/workflows/x.mjs', '/r'), 'node --check', 'the ordinary probe, not the dialect');
  const src = "export const meta = { name: 'x' }\nreturn 1\n";
  assert.equal(wrapWorkflow(src), "(async()=>{\nconst meta = { name: 'x' }\nreturn 1\n\n})()");
});

test('the dialect checks under the module goal, which is stricter than bare node --check (review S-C)', async () => {
  // Measured on node v25.9.0: stdin with no --input-type parses as sloppy CommonJS, which
  // accepts both of these; ESM rejects them. They are ordinary single-token-deletion mutants,
  // so a looser goal would score them ok and then let the load failure read as a kill.
  const dup = "export const meta = { name: 'x' }\nfunction f(a, a) { return a }\nreturn f(1, 2)\n";
  const withStmt = "export const meta = { name: 'x' }\nwith (o) { y }\nreturn 1\n";
  for (const [label, body] of [['duplicate parameter', dup], ['with statement', withStmt]]) {
    const r = await checkSyntax('/r/workflows/w.mjs', body, '/r');
    assert.equal(r.verdict, 'invalid', `${label} must be rejected under the module goal`);
  }
  assert.match(WORKFLOW_DIALECT_CHECKER, /--input-type=module/, 'and the name says which goal ran');
});

// ── the verdicts that are not ok/invalid ────────────────────────────────────

test('a syntax-free type returns syntax-free, never ok', async () => {
  const r = await checkSyntax('/x/SKILL.md', '# anything\n```\nunclosed', ROOT);
  assert.equal(r.verdict, 'syntax-free');
  assert.equal(r.checker, null);
});

test('a type with no checker returns no-checker, never ok', async () => {
  const r = await checkSyntax('/x/config.toml', '[table\n', ROOT);
  assert.equal(r.verdict, 'no-checker');
  assert.match(r.detail, /no syntax checker is known for '\.toml'/);
});

test('a missing interpreter is checker-missing with missing:true — driven by an injected spawn', async () => {
  const spawnSyncMissing = () => ({ error: Object.assign(new Error('spawn Rscript ENOENT'), { code: 'ENOENT' }) });
  const r = await checkSyntax('/x/analysis.R', 'f <- function() 1\n', ROOT, { spawnSync: spawnSyncMissing });
  assert.equal(r.verdict, 'checker-missing');
  assert.equal(r.missing, true);
  assert.equal(r.checker, 'Rscript parse()');
  assert.match(r.detail, /Rscript is not on PATH/);
});

test('a spawn error other than ENOENT is checker-missing with missing:false and the code named', async () => {
  const spawnSyncBroken = () => ({ error: Object.assign(new Error('EACCES'), { code: 'EACCES' }) });
  const r = await checkSyntax('/x/script.sh', 'true\n', ROOT, { spawnSync: spawnSyncBroken });
  assert.equal(r.verdict, 'checker-missing');
  assert.equal(r.missing, false);
  assert.match(r.detail, /EACCES/);
});

test('a checker killed by a signal renders no verdict — never invalid (review S2)', async () => {
  const spawnSyncKilled = () => ({ status: null, signal: 'SIGINT', stderr: '', stdout: '' });
  for (const file of ['/x/a.py', '/x/a.js', '/r/workflows/w.mjs']) {
    const r = await checkSyntax(file, 'x = 1\n', ROOT, { spawnSync: spawnSyncKilled });
    assert.equal(r.verdict, 'checker-missing', file);
    assert.match(r.detail, /did not render a verdict \(killed by SIGINT\)/);
  }
  const spawnSyncNoStatus = () => ({ status: null, signal: null, stderr: '', stdout: '' });
  const r = await checkSyntax('/x/a.py', 'x = 1\n', ROOT, { spawnSync: spawnSyncNoStatus });
  assert.equal(r.verdict, 'checker-missing');
  assert.match(r.detail, /no exit status/);
});

// ── real checkers ───────────────────────────────────────────────────────────

test('python: a def without its colon is invalid; the original is ok; the checker is named', async () => {
  assert.ok(hasBinary('python3'), 'python3 is required — ci-scripts.yml sets it up; this test does not skip');
  const good = await checkSyntax('/x/gen.py', 'def build(filler, width):\n    return filler * width\n', ROOT);
  assert.equal(good.verdict, 'ok');
  assert.equal(good.checker, 'python3 compile()');
  const bad = await checkSyntax('/x/gen.py', 'def build(filler, width)\n    return filler * width\n', ROOT);
  assert.equal(bad.verdict, 'invalid');
  assert.match(bad.detail, /SyntaxError/);
});

test('python: return outside a function is invalid — ast.parse accepted it, compile() does not (review S1)', async () => {
  const r = await checkSyntax('/x/gen.py', 'return 1\n', ROOT);
  assert.equal(r.verdict, 'invalid');
  assert.match(r.detail, /'return' outside function/);
});

test('bash: an unterminated if is invalid; a terminated one is ok', async () => {
  const bad = await checkSyntax('/x/run.sh', 'if [ 1 ]; then echo hi\n', ROOT);
  assert.equal(bad.verdict, 'invalid');
  assert.equal(bad.checker, 'bash -n');
  assert.match(bad.detail, /syntax error/);
  const good = await checkSyntax('/x/run.sh', 'if [ 1 ]; then echo hi; fi\n', ROOT);
  assert.equal(good.verdict, 'ok');
});

test('R: matches what the machine can do — real verdicts when Rscript exists, checker-missing when not', async () => {
  const r = await checkSyntax('/x/a.R', 'f <- function( {\n', ROOT);
  if (hasBinary('Rscript')) {
    assert.equal(r.verdict, 'invalid', 'Rscript is present, so a broken file must be judged');
    const good = await checkSyntax('/x/a.R', 'f <- function() 1\n', ROOT);
    assert.equal(good.verdict, 'ok');
  } else {
    assert.equal(r.verdict, 'checker-missing', 'no Rscript: the only honest answer is checker-missing');
    assert.equal(r.missing, true);
  }
});

test('a leading BOM is not a syntax error for python either (review N-i)', async () => {
  assert.equal((await checkSyntax('/x/a.py', '\ufeffx = 1\n', ROOT)).verdict, 'ok');
});

test('json and yaml are checked in-process, and a leading BOM is not a syntax error', async () => {
  assert.equal((await checkSyntax('/x/a.json', '{"a": 1}', ROOT)).verdict, 'ok');
  assert.equal((await checkSyntax('/x/a.json', '\ufeff{"a": 1}', ROOT)).verdict, 'ok', 'BOM stripped before JSON.parse');
  const badJson = await checkSyntax('/x/a.json', '{"a": 1', ROOT);
  assert.equal(badJson.verdict, 'invalid');
  assert.equal(badJson.checker, 'JSON.parse');
  assert.equal((await checkSyntax('/x/a.yml', 'a: 1\nb:\n  - x\n', ROOT)).verdict, 'ok');
  const badYaml = await checkSyntax('/x/a.yml', 'a: [1, 2\n', ROOT);
  assert.equal(badYaml.verdict, 'invalid');
  assert.equal(badYaml.checker, 'js-yaml loadAll');
});

test('yaml: an unresolvable js-yaml, or a throw that is not a YAMLException, is checker-missing not a verdict', async () => {
  const importYaml = async () => { throw Object.assign(new Error('not found'), { code: 'ERR_MODULE_NOT_FOUND' }); };
  const r = await checkSyntax('/x/a.yml', 'a: 1\n', ROOT, { importYaml });
  assert.equal(r.verdict, 'checker-missing');
  assert.match(r.detail, /ERR_MODULE_NOT_FOUND/);
  assert.equal(r.missing, false, 'the remedy is npm ci, not installing an interpreter (review N-c)');
  assert.match(r.detail, /npm ci/);
  const broken = async () => ({ loadAll() { throw new TypeError('loadAll changed shape'); } });
  const b = await checkSyntax('/x/a.yml', 'a: 1\n', ROOT, { importYaml: broken });
  assert.equal(b.verdict, 'checker-missing');
  assert.match(b.detail, /threw TypeError rather than a parse verdict/);
});

test('node: a .js in an ESM package is probed as .mjs, so a stray brace is invalid (#621)', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'mutation-parse-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  writeFileSync(join(dir, 'package.json'), '{"type":"module"}');
  assert.equal(packageType(dir, dir), 'module');
  const file = join(dir, 'lib.js');
  const bad = await checkSyntax(file, 'export const a = 1;\n}\n', dir);
  assert.equal(bad.verdict, 'invalid');
  assert.equal(bad.checker, 'node --check');
  // head(), not tail(): node ends with stack frames and its version banner, so tail(6) would
  // not contain the message at all (review N-a).
  assert.match(bad.detail, /SyntaxError/);
  assert.doesNotMatch(bad.detail, /Node\.js v/);
  const good = await checkSyntax(file, 'export const a = 1;\n', dir);
  assert.equal(good.verdict, 'ok');
});

test('workflow dialect: a top-level return is ok under workflows/, invalid elsewhere, and a real break is invalid', async () => {
  const workflow = "export const meta = { name: 'w', description: 'd', phases: [] }\nconst x = await agent('p', { agentType: 'Explore' })\nreturn { x }\n";
  const ok = await checkSyntax('/r/workflows/w.mjs', workflow, '/r');
  assert.equal(ok.verdict, 'ok', ok.detail);
  assert.equal(ok.checker, WORKFLOW_DIALECT_CHECKER);
  const elsewhere = await checkSyntax('/r/scripts/w.mjs', workflow, '/r');
  assert.equal(elsewhere.verdict, 'invalid', 'the same bytes outside workflows/ are a raw ES module with an illegal return');
  const broken = await checkSyntax('/r/workflows/w.mjs', workflow.replace('return { x }', 'return { x'), '/r');
  assert.equal(broken.verdict, 'invalid');
  assert.match(broken.detail, /SyntaxError/);
});

test('workflow dialect: EVERY workflows/*.mjs parses under it, and none of them under plain ESM', async () => {
  // Globbed, not named: a named set silently skips a newly added file (#486/#697, review N-h).
  const dir = join(ROOT, 'workflows');
  const names = readdirSync(dir).filter((f) => f.endsWith('.mjs'));
  assert.ok(names.length >= 4, `expected the shipped workflows plus the template, saw ${names.length}`);
  for (const name of names) {
    const path = join(dir, name);
    const text = readFileSync(path, 'utf8');
    const ok = await checkSyntax(path, text, ROOT);
    assert.equal(ok.verdict, 'ok', `${name}: ${ok.detail}`);
    // The negative arm, which makes the claim "plain node --check refused every one of them"
    // measured rather than asserted: the same bytes at a non-dialect path are invalid.
    const raw = await checkSyntax(join(ROOT, 'scripts', name), text, ROOT);
    assert.equal(raw.verdict, 'invalid', `${name} must be invalid as a raw ES module`);
    assert.match(raw.detail, /Illegal return statement|SyntaxError/);
  }
});

// ── end to end through mutation-check.js ────────────────────────────────────

function git(cwd, args) {
  // `-c commit.gpgsign=false` and `--template=`: a developer's global signing or template
  // hooks must not reach a throwaway fixture (review N7).
  // `core.hooksPath=/dev/null` too: `--template=` empties the fixture's own hooks directory,
  // but a global hooksPath (the Husky-style setup) still reaches it (review N-g). An empty
  // value will not do — git resolves that back to the repository hooks directory.
  const r = spawnSync('git', ['-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args], { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout;
}

/** A throwaway repo with one committed file of the given name and content. */
function makeRepo(t, name, content) {
  const dir = mkdtempSync(join(tmpdir(), 'mutation-check-e2e-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  git(dir, ['init', '-q', '-b', 'main', '--template=']);
  git(dir, ['config', 'user.email', 'test@example.invalid']);
  git(dir, ['config', 'user.name', 'Fixture']);
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(join(dir, 'src', name), content, 'utf8');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-q', '-m', 'initial']);
  return dir;
}

function runTool(cwd, args, env = process.env) {
  const r = spawnSync(process.execPath, [TOOL, ...args], { cwd, encoding: 'utf8', env });
  return { status: r.status, out: `${r.stdout}\n${r.stderr}` };
}

test('e2e: the issue\'s shape — a syntax-broken python mutant reports INVALID MUTANT, not a kill', async (t) => {
  // The test command RUNS the file, so it goes red on the broken mutant: with the old
  // `parses()` this exact run printed MUTANT KILLED (review S6), which makes the negative
  // assertion below a discriminator rather than a pin.
  const dir = makeRepo(t, 'gen.py', 'def build(filler, width):\n    return filler * width\n');
  const r = runTool(dir, ['--file', 'src/gen.py', '--test', 'python3 src/gen.py',
    '--delete-matching', 'def build(filler, width):']);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /it does NOT parse \(python3 compile\(\)\)/);
  assert.match(r.out, /INVALID MUTANT/);
  // Deleting the def leaves an indented orphan line, which python reports as IndentationError —
  // a SyntaxError subclass whose text does not say "SyntaxError".
  assert.match(r.out, /(Syntax|Indentation)Error/, 'the checker\'s own message is quoted');
  assert.doesNotMatch(r.out, /MUTANT KILLED/);
  assert.equal(git(dir, ['status', '--porcelain']), '', 'the file was restored');
});

test('e2e: a valid python mutant proceeds and names its checker on the pass path', async (t) => {
  const dir = makeRepo(t, 'gen.py', 'WIDTH = 4\n');
  const r = runTool(dir, ['--file', 'src/gen.py', '--test', 'python3 src/gen.py', '--replace', 'WIDTH = 4::WIDTH = 5']);
  assert.match(r.out, /it parses \(python3 compile\(\)\)\./);
  assert.match(r.out, /MUTANT SURVIVED/, 'the file runs fine either way, so nothing kills it');
});

test('e2e: a syntax-free file proceeds and says the parse gate does not apply', async (t) => {
  const dir = makeRepo(t, 'SKILL.md', '# Title\n\nSee `workflows/verify-handoff.mjs`.\n');
  const r = runTool(dir, ['--file', 'src/SKILL.md', '--test', 'true',
    '--replace', 'verify-handoff.mjs::verify-handofff.mjs']);
  assert.match(r.out, /no syntax to check \(\.md\)/);
  assert.doesNotMatch(r.out, /it parses/);
  assert.match(r.out, /MUTANT SURVIVED/);
});

test('e2e: a type with no checker is refused before the baseline runs', async (t) => {
  const dir = makeRepo(t, 'config.toml', 'a = 1\n');
  const r = runTool(dir, ['--file', 'src/config.toml', '--test', 'true', '--replace', 'a = 1::a = 2']);
  assert.equal(r.status, 1);
  assert.match(r.out, /no syntax checker is known for '\.toml'/);
  assert.doesNotMatch(r.out, /\[1\/5\]/, 'refused at precondition time, no baseline spent');
});

test('e2e: an original that already fails its checker is refused before the baseline (review S4)', async (t) => {
  const dir = makeRepo(t, 'data.json', '{"a": 1,\n}\n');
  const r = runTool(dir, ['--file', 'src/data.json', '--test', 'true', '--replace', '"a": 1::"a": 2']);
  assert.equal(r.status, 1);
  assert.match(r.out, /does not parse BEFORE mutation \(JSON\.parse\)/);
  assert.match(r.out, /No override exists/);
  assert.doesNotMatch(r.out, /\[1\/5\]/);
});

test('e2e: a checker that exists but cannot be run gets NO install hint (review N-b)', async (t) => {
  const dir = makeRepo(t, 'gen.py', 'WIDTH = 4\n');
  const bin = join(dir, 'bin');
  mkdirSync(bin);
  const gitPath = spawnSync('which', ['git'], { encoding: 'utf8' }).stdout.trim();
  symlinkSync(process.execPath, join(bin, 'node'));
  symlinkSync(gitPath, join(bin, 'git'));
  // A python3 that IS on PATH and is not executable: spawn fails EACCES, not ENOENT, so the
  // verdict is checker-missing with missing:false and the hint must be withheld.
  writeFileSync(join(bin, 'python3'), '#!/bin/sh\nexit 0\n', { mode: 0o644 });
  const env = { ...process.env, PATH: bin };
  const r = runTool(dir, ['--file', 'src/gen.py', '--test', 'true', '--replace', 'WIDTH = 4::WIDTH = 5'], env);
  assert.equal(r.status, 1);
  assert.match(r.out, /INCONCLUSIVE/);
  assert.match(r.out, /EACCES|could not be run/);
  assert.doesNotMatch(r.out, /Install the interpreter/, 'an unrunnable checker is not an uninstalled one');
  assert.doesNotMatch(r.out, /MUTANT (KILLED|SURVIVED)/);
});

test('e2e: a missing interpreter is INCONCLUSIVE at precondition time, never a kill', async (t) => {
  const dir = makeRepo(t, 'gen.py', 'WIDTH = 4\n');
  // A PATH holding ONLY node and git, via symlinks in a private bin dir. Pointing PATH at
  // git's own directory is not enough — on most machines that is /usr/bin, where python3
  // also lives, and the first version of this test failed its own precondition that way.
  const bin = join(dir, 'bin');
  mkdirSync(bin);
  const gitPath = spawnSync('which', ['git'], { encoding: 'utf8' }).stdout.trim();
  assert.ok(gitPath, 'which git');
  symlinkSync(process.execPath, join(bin, 'node'));
  symlinkSync(gitPath, join(bin, 'git'));
  const env = { ...process.env, PATH: bin };
  assert.ok(spawnSync('python3', ['--version'], { env }).error, 'precondition: python3 unreachable on the reduced PATH');
  const r = runTool(dir, ['--file', 'src/gen.py', '--test', 'true', '--replace', 'WIDTH = 4::WIDTH = 5'], env);
  assert.equal(r.status, 1);
  assert.match(r.out, /INCONCLUSIVE/);
  assert.match(r.out, /python3 is not on PATH/);
  assert.match(r.out, /Install the interpreter/, 'the install hint belongs to the ENOENT case');
  assert.doesNotMatch(r.out, /\[1\/5\]/, 'precondition time means before the baseline (review S5)');
  assert.doesNotMatch(r.out, /MUTANT (KILLED|SURVIVED)/);
});
