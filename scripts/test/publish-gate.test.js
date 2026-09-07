/**
 * The publish gate cannot diverge from the suite it is supposed to run (#697).
 *
 * Two kinds of test here, and the split is deliberate.
 *
 * **Fixture tests** drive `inspectPublishGate` with hand-written script maps. They pin
 * the rule, and they are what a mutation of the rule kills. They are the only way to
 * exercise the failure branches at all — the repository is, by construction, in the
 * passing state.
 *
 * **One live test** runs the rule against this repository's real `package.json` and real
 * `cli/test/` directory. Without it every fixture could pass while the actual gate is
 * broken; with it, re-inlining the path in `prepublishOnly` goes red in CI.
 * `ci-scripts.yml` carries no `paths:` filter (#641), so it sees a `package.json`-only
 * change. A gate filtered on `scripts/**` would not, and this test would be decorative.
 *
 * The live test is what makes the mutation envelope honest:
 *
 *     npm run mutation-check -- \
 *       --file package.json \
 *       --replace '"prepublishOnly": "npm run test:cli"'::'"prepublishOnly": "node --test cli/test/cli.test.js"' \
 *       --test 'npm run test:scripts' \
 *       --expect-killed-by 1
 *
 * That mutant is the exact prior state of the file, it parses, it runs to completion, and
 * it dies to one test. Not a crash, not a broad kill — the shape `mutation-check` reports
 * as SUSPECT and CLAUDE.md warns is inverted evidence.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { rmTree } from './_tmp.js';
import {
  inspectPublishGate,
  namedTestFiles,
  discoverTestFiles,
  invokesScript,
  invokesNodeScript,
  repoRootFromHere,
  CANONICAL_SCRIPT,
  PUBLISH_HOOK,
  PRE_HOOK,
  CLI_TEST_DIR,
  ASSERT_SCRIPT,
} from '../lib/publish-gate.js';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ASSERT_PATH = resolve(REPO_ROOT, ASSERT_SCRIPT);

/** A script map matching the repository's intended arrangement. */
function healthyScripts() {
  return {
    test: 'npm run validate:integrity && npm run check-readmes && npm run test:scripts && npm run test:cli',
    'test:cli': 'node --test cli/test/cli.test.js',
    'pretest:cli': 'node scripts/assert-publish-gate.js',
    prepublishOnly: 'npm run test:cli',
  };
}

/** Only `problems` entries mentioning `needle`, to keep assertions specific. */
function problemsMatching(scripts, needle) {
  const { problems } = inspectPublishGate(REPO_ROOT, scripts);
  return problems.filter((p) => p.includes(needle));
}

test('the fixture standing in for a healthy repo produces no problems', () => {
  const { problems } = inspectPublishGate(REPO_ROOT, healthyScripts());
  assert.deepEqual(problems, [], `expected a clean fixture, got:\n${problems.join('\n')}`);
});

test('THE LIVE GATE: this repository\'s own package.json wires the publish gate safely', () => {
  const { problems } = inspectPublishGate(REPO_ROOT);
  assert.deepEqual(
    problems,
    [],
    'package.json no longer wires the publish gate safely:\n' + problems.join('\n'),
  );
});

test('two scripts spelling the suite path is the #697 defect, and is rejected', () => {
  const scripts = healthyScripts();
  // The exact pre-#697 state: prepublishOnly spelled the path a second time.
  scripts[PUBLISH_HOOK] = 'node --test cli/test/cli.test.js';
  const problems = problemsMatching(scripts, '#697');
  assert.ok(
    problems.length > 0,
    `a second literal spelling of the suite path must be rejected; problems were:\n${
      inspectPublishGate(REPO_ROOT, scripts).problems.join('\n')}`,
  );
});

test('a third script naming the path is rejected too, not just prepublishOnly', () => {
  const scripts = healthyScripts();
  scripts['test:cli:watch'] = 'node --test --watch cli/test/cli.test.js';
  const { problems } = inspectPublishGate(REPO_ROOT, scripts);
  assert.ok(
    problems.some((p) => p.includes('2 scripts name a suite')),
    `expected the duplicate-naming problem, got:\n${problems.join('\n')}`,
  );
});

test('removing prepublishOnly is rejected — the redundancy is deliberate (#680)', () => {
  const scripts = healthyScripts();
  delete scripts[PUBLISH_HOOK];
  const problems = problemsMatching(scripts, '#680');
  assert.equal(problems.length, 1, 'losing the publish hook must be reported, citing #680');
});

test('a prepublishOnly that reaches nothing is rejected', () => {
  const scripts = healthyScripts();
  scripts[PUBLISH_HOOK] = 'echo "trust me"';
  const { problems } = inspectPublishGate(REPO_ROOT, scripts);
  assert.ok(
    problems.some((p) => p.includes('must be exactly')),
    `expected an exact-value problem, got:\n${problems.join('\n')}`,
  );
});

test('npm test dropping the CLI suite is rejected — that was #680 itself', () => {
  const scripts = healthyScripts();
  scripts.test = 'npm run validate:integrity && npm run check-readmes';
  const { problems } = inspectPublishGate(REPO_ROOT, scripts);
  assert.ok(
    problems.some((p) => p.includes('is the release gate')),
    `expected the release-gate problem, got:\n${problems.join('\n')}`,
  );
});

test('deleting the pretest:cli hook is rejected — the gate must not be silently disarmable', () => {
  // This branch exists because mutating package.json found it: with the rule module
  // intact, dropping one line from package.json removed the publish-time check and
  // every test still passed. Same disarm shape as the defect #697 describes.
  const scripts = healthyScripts();
  delete scripts[PRE_HOOK];
  const { problems } = inspectPublishGate(REPO_ROOT, scripts);
  assert.ok(
    problems.some((p) => p.includes('exists only in CI')),
    `expected the disarmed-hook problem, got:\n${problems.join('\n')}`,
  );
});

test('a pretest:cli that runs something else is rejected', () => {
  const scripts = healthyScripts();
  scripts[PRE_HOOK] = 'echo "checked, honest"';
  const { problems } = inspectPublishGate(REPO_ROOT, scripts);
  assert.ok(
    problems.some((p) => p.includes('must be exactly')),
    `expected a wrong-checker problem, got:\n${problems.join('\n')}`,
  );
});

test('a named suite file that does not exist is rejected', () => {
  const scripts = healthyScripts();
  scripts[CANONICAL_SCRIPT] = 'node --test cli/test/renamed.test.js';
  const { problems } = inspectPublishGate(REPO_ROOT, scripts);
  assert.ok(
    problems.some((p) => p.includes('resolves to nothing')),
    `expected a "resolves to nothing" problem, got:\n${problems.join('\n')}`,
  );
});

test('namedTestFiles reads paths out of a command line, quotes and all', () => {
  assert.deepEqual(namedTestFiles('node --test cli/test/cli.test.js'), ['cli/test/cli.test.js']);
  assert.deepEqual(namedTestFiles('node --test "cli/test/cli.test.js"'), ['cli/test/cli.test.js']);
  assert.deepEqual(
    namedTestFiles('node --test cli/test/a.test.js cli/test/b.test.js'),
    ['cli/test/a.test.js', 'cli/test/b.test.js'],
  );
  assert.deepEqual(namedTestFiles('npm run test:cli'), []);
  assert.deepEqual(namedTestFiles(undefined), []);
});

test(`discoverTestFiles reports every *.test.js under ${CLI_TEST_DIR}/`, () => {
  const discovered = discoverTestFiles(REPO_ROOT);
  assert.ok(Array.isArray(discovered), `${CLI_TEST_DIR}/ must exist`);
  assert.ok(discovered.length >= 1, `${CLI_TEST_DIR}/ must hold at least one test file`);
  for (const file of discovered) {
    assert.ok(file.startsWith(`${CLI_TEST_DIR}/`), `unexpected path shape: ${file}`);
    assert.ok(file.endsWith('.test.js'), `unexpected suffix: ${file}`);
  }
});

// ── the holes an adversarial review found in the check itself ────────────────
//
// Everything above this line tests the RULE. These test the three ways the rule
// was found to be satisfiable without the behaviour it claims — each a one-token
// edit, none of them adversarial, and each caught by a reviewer rather than by
// the two mutants originally quoted. That asymmetry is the lesson: mutating the
// lines you thought about proves nothing about the lines you did not.

test('a substring is not an invocation: "npm run pretest:cli" runs zero CLI tests', () => {
  // `'npm run pretest:cli'.includes('test:cli')` is TRUE — `test:cli` is a
  // substring of `pretest:cli`. Under the original containment check this
  // passed, and a publish would have run the assert script and no tests at all.
  const scripts = healthyScripts();
  scripts[PUBLISH_HOOK] = 'npm run pretest:cli';
  const { problems } = inspectPublishGate(REPO_ROOT, scripts);
  assert.ok(
    problems.some((p) => p.includes('must be exactly')),
    `"npm run pretest:cli" must not satisfy the publish hook; got:\n${problems.join('\n')}`,
  );
});

test('an echo-prefixed command does not count as running anything', () => {
  // The disable-by-echo-prefix. It passes any containment check.
  for (const [script, value] of [
    [PUBLISH_HOOK, 'echo skipping npm run test:cli'],
    ['test', 'echo npm run test:cli'],
    [PRE_HOOK, 'echo skip scripts/assert-publish-gate.js'],
  ]) {
    const scripts = healthyScripts();
    scripts[script] = value;
    const { problems } = inspectPublishGate(REPO_ROOT, scripts);
    assert.ok(problems.length > 0, `"${value}" must not satisfy the check for ${script}`);
  }
});

test('the AGGREGATE may chain — rejecting everything would be useless, not strict', () => {
  // `test` legitimately chains, and a pure `&&` chain propagates a failure in either
  // position, so `invokesScript` is the right instrument there. This is the accept side:
  // without it, "reject everything" would pass every rejection test above.
  const scripts = healthyScripts();
  scripts.test = 'npm run validate:integrity && npm run test:scripts && npm run test:cli';
  const { problems } = inspectPublishGate(REPO_ROOT, scripts);
  assert.deepEqual(problems, [], problems.join('\n'));
});

test('REACHING the suite is not GATING on it — the exit status is the property', () => {
  // Every one of these reaches `test:cli` by any reasonable matcher, and not one makes a
  // failing suite abort the publish. The first three run it and discard the verdict; the
  // fourth backgrounds it; the fifth never runs it at all; the sixth runs a DIFFERENT
  // package's script. `prepublishOnly` has exactly one legitimate value, so it is checked
  // against that value rather than matched — #697's own thesis at its endpoint.
  for (const hook of [
    'npm run test:cli || true',       // failure swallowed
    'npm run test:cli; echo done',    // `;` takes the LAST exit status
    'npm run test:cli | tee log',     // the pipeline exits with tee's 0
    'npm run test:cli &',             // backgrounded; the shell exits 0 immediately
    'true || npm run test:cli',       // short-circuits — the suite never runs
    'cd /tmp && npm run test:cli',    // a different package entirely
  ]) {
    const { problems } = inspectPublishGate(REPO_ROOT, { ...healthyScripts(), [PUBLISH_HOOK]: hook });
    assert.ok(
      problems.some((p) => p.includes('must be exactly')),
      `"${hook}" reaches the suite without gating on it, and must be refused`,
    );
  }
});

test('the pre-hook cannot be pointed elsewhere, or have its verdict swallowed', () => {
  // `--root` exists so the assert script's RED path is reachable by a test. In the
  // PRODUCTION hook it is an escape: it points the publish-time check at a tree that is
  // not this repository, and every gate stays green — the disarm surface, one notch
  // narrower, that this PR's second commit exists to close.
  for (const preHook of [
    'node scripts/assert-publish-gate.js --root=/tmp/somewhere-clean',
    'node scripts/assert-publish-gate.js || true',
    'node scripts/assert-publish-gate.js --quiet',
  ]) {
    const { problems } = inspectPublishGate(REPO_ROOT, { ...healthyScripts(), [PRE_HOOK]: preHook });
    assert.ok(
      problems.some((p) => p.includes('must be exactly')),
      `"${preHook}" must be refused — the hook has one legitimate value`,
    );
  }
});

test('invokesScript / invokesNodeScript, at the token boundary', () => {
  assert.equal(invokesScript('npm run test:cli', 'test:cli'), true);
  assert.equal(invokesScript('npm run-script test:cli', 'test:cli'), true);
  assert.equal(invokesScript('a && npm run test:cli', 'test:cli'), true);
  assert.equal(invokesScript('npm run pretest:cli', 'test:cli'), false);
  assert.equal(invokesScript('npm run test:cli:watch', 'test:cli'), false);
  assert.equal(invokesScript('echo npm run test:cli', 'test:cli'), false);
  assert.equal(invokesScript('', 'test:cli'), false);
  assert.equal(invokesNodeScript('node scripts/assert-publish-gate.js', 'scripts/assert-publish-gate.js'), true);
  assert.equal(invokesNodeScript('echo node scripts/assert-publish-gate.js', 'scripts/assert-publish-gate.js'), false);
});

test('a test file added BESIDE a named one is reported — the real #486 shape', (t) => {
  // The earlier version of this test set `test:cli` to `node --test`, naming
  // NOTHING, which also tripped the "no script names the suite" check. So it
  // passed for the wrong reason, and a mutant guarding the unrun-file loop
  // behind `named.length === 0` would have survived it. A hermetic tree with
  // TWO files, one of them named, is the case that actually distinguishes.
  const dir = mkdtempSync(join(tmpdir(), 'publish-gate-'));
  t.after(() => rmTree(dir));
  mkdirSync(join(dir, CLI_TEST_DIR), { recursive: true });
  writeFileSync(join(dir, CLI_TEST_DIR, 'cli.test.js'), '// named\n', 'utf8');
  writeFileSync(join(dir, CLI_TEST_DIR, 'adapters.test.js'), '// added later, unnamed\n', 'utf8');

  const { problems } = inspectPublishGate(dir, healthyScripts());

  assert.equal(problems.length, 1, `expected exactly the unrun-file problem, got:\n${problems.join('\n')}`);
  assert.match(problems[0], /adapters\.test\.js/);
  assert.match(problems[0], /but no script names it/);
});

test('discovery is recursive and not .js-only, or the comparison has a blind spot', (t) => {
  // `cli/test/adapters/foo.test.js` and `cli/test/util.test.mjs` are neither run
  // by the named invocation nor seen by a flat `.test.js` listing — silently
  // unrun AND undetected, which is #486's silence inside the check for #486.
  const dir = mkdtempSync(join(tmpdir(), 'publish-gate-'));
  t.after(() => rmTree(dir));
  mkdirSync(join(dir, CLI_TEST_DIR, 'adapters'), { recursive: true });
  writeFileSync(join(dir, CLI_TEST_DIR, 'cli.test.js'), '// named\n', 'utf8');
  writeFileSync(join(dir, CLI_TEST_DIR, 'util.test.mjs'), '// esm\n', 'utf8');
  writeFileSync(join(dir, CLI_TEST_DIR, 'adapters', 'hermes.test.js'), '// nested\n', 'utf8');

  assert.deepEqual(discoverTestFiles(dir), [
    `${CLI_TEST_DIR}/adapters/hermes.test.js`,
    `${CLI_TEST_DIR}/cli.test.js`,
    `${CLI_TEST_DIR}/util.test.mjs`,
  ]);

  const { problems } = inspectPublishGate(dir, healthyScripts());
  assert.equal(problems.length, 2, problems.join('\n'));
});

test('THE RED PATH: assert-publish-gate.js exits 1 on a broken gate', (t) => {
  // Without this the failure branch of the operator-side checker is unreachable
  // by every test, every `npm test`, and all of CI — a gate whose red has never
  // once been observed. Deleting its `process.exit(1)` would survive the suite.
  const dir = mkdtempSync(join(tmpdir(), 'publish-gate-'));
  t.after(() => rmTree(dir));
  mkdirSync(join(dir, CLI_TEST_DIR), { recursive: true });
  writeFileSync(join(dir, CLI_TEST_DIR, 'cli.test.js'), '// suite\n', 'utf8');
  const broken = { ...healthyScripts(), [PUBLISH_HOOK]: 'node --test cli/test/cli.test.js' };
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ scripts: broken }, null, 2), 'utf8');

  const red = spawnSync(process.execPath, [ASSERT_PATH, `--root=${dir}`], { encoding: 'utf8' });

  assert.equal(red.status, 1, `expected exit 1, got ${red.status}\n${red.stdout}${red.stderr}`);
  assert.match(red.stderr, /not wired safely/);
  assert.match(red.stderr, /#697/);

  // And the green path, so the red above is not simply "this script always fails".
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ scripts: healthyScripts() }, null, 2), 'utf8');
  const green = spawnSync(process.execPath, [ASSERT_PATH, `--root=${dir}`], { encoding: 'utf8' });

  assert.equal(green.status, 0, `${green.stdout}${green.stderr}`);
  assert.match(green.stdout, /prepublishOnly delegates/);
});

test('repoRootFromHere resolves this module, spaces and worktrees included', () => {
  // `new URL(metaUrl).pathname` leaves %20 in place and yields /C:/… on Windows.
  assert.equal(repoRootFromHere(import.meta.url), REPO_ROOT);
  assert.throws(() => repoRootFromHere(pathToFileURL(tmpdir()).href), /could not locate a repository root/);
});
