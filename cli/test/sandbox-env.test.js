/**
 * sandbox-env.test.js — the sandbox key list and its shell half are one list.
 *
 * `cli/test/sandbox-env.js` holds the variables a CLI spawn in the tests gets pinned or
 * removed (#1071, #1075); `tools/sandbox-env.sh` applies the same list in a shell, for a probe
 * run by hand. A shell file cannot import an ES module, so the list exists twice, and this file
 * holds the two equal in both directions.
 *
 * Two instruments, because each is blind where the other sees:
 *
 *   THE PARSE reads the fragment's `export NAME="$sandbox_home…"` and `unset NAME` lines, class
 *   by class and value by value, and names the file that lacks a key. It refuses any other
 *   line that exports or removes a variable rather than skipping it. It cannot see a variable
 *   changed by a form it does not look for, such as a plain `HOME=…` assignment (HOME is
 *   already exported, so that changes the environment too).
 *
 *   THE SOURCE runs the fragment in a real shell. It compares the whole environment a child
 *   process receives after `almanac_sandbox` with what `sandboxEnv()` builds from the one it
 *   received before the fragment was sourced. It runs twice. The plain pass is what a probe
 *   gets: it sees a change to any variable the starting environment exports, made by export,
 *   unset or a plain assignment alike. The second pass turns allexport (`set -a`) on first,
 *   so a plain assignment to a variable the starting environment does not export reaches the
 *   child too. Such an assignment still changes a real caller whose shell exports that name;
 *   git and gh read XDG_CONFIG_HOME, for one. Neither pass sees what a child cannot inherit,
 *   such as a function, an alias or a shell option. `scripts/test/template-predicate.test.js`
 *   moved from a regex to sourcing for the same reason: a regex over the shell half was evaded
 *   by a second assignment, with every test green.
 *
 * The parse stays because it is the one that names a key and the side that lacks it before
 * any shell runs.
 *
 * Every shell script here is built from literals, and no path this file computes reaches a
 * shell's argv. A path a script needs, from `import.meta.url`, `tmpdir()` or
 * `process.execPath`, reaches it in the shell's environment as a SANDBOX_ARG_ variable the
 * script expands (runShell says why every comparison still sees what it saw); the positional
 * arguments left are words, a pass's mode or a command name. The CodeQL finding recorded in
 * template-predicate.test.js was a path from `import.meta.url` reaching `bash -c`, and so was
 * alert 23 on this file (js/shell-command-injection-from-environment): its paths reached the
 * shell as positional arguments.
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rmTree } from '../../scripts/test/_tmp.js';
import { sandboxEnv, SANDBOX_KEYS, SANDBOX_SET, SANDBOX_UNSET } from './sandbox-env.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const JS_FILE = 'cli/test/sandbox-env.js';
const SH_FILE = 'tools/sandbox-env.sh';

const NAME = '[A-Za-z_][A-Za-z0-9_]*';
const SET_LINE = new RegExp(`^export (${NAME})="\\$sandbox_home(?:/([^"$\`\\\\]+))?"$`);
const UNSET_LINE = new RegExp(`^unset (${NAME})$`);
/** A line that changes the environment by a builtin, which must then be one of the two forms. */
const TOUCHES_ENV = /\b(?:export|unset|typeset|declare|readonly|setenv)\b/;

/**
 * The fragment's list, read from its text.
 *
 * @param {string} text the fragment
 * @returns {{ set: Map<string, string>, unset: Set<string>, problems: string[] }}
 *   `set` maps a name to its path relative to the home ('' is the home itself)
 */
function parseFragment(text) {
  const set = new Map();
  const unset = new Set();
  const problems = [];
  text.split('\n').forEach((raw, index) => {
    const line = raw.trim();
    if (line === '' || line.startsWith('#') || !TOUCHES_ENV.test(line)) return;
    const where = `${SH_FILE}:${index + 1}`;
    const setMatch = SET_LINE.exec(line);
    const unsetMatch = UNSET_LINE.exec(line);
    const name = setMatch?.[1] ?? unsetMatch?.[1];
    if (!name) {
      problems.push(`${where}: a line that changes the environment in a form the parse does not read: ${line}`);
      return;
    }
    if (set.has(name) || unset.has(name)) {
      problems.push(`${where}: ${name} is named a second time`);
      return;
    }
    if (setMatch) set.set(name, setMatch[2] ?? '');
    else unset.add(name);
  });
  return { set, unset, problems };
}

const shown = (relative) => (relative ? `<home>/${relative}` : '<home>');

/**
 * Differences between the JS list and the fragment's, each message opening with the file that
 * lacks the key or disagrees.
 *
 * @param {{ set: Map<string, string>, unset: Set<string> }} js
 * @param {{ set: Map<string, string>, unset: Set<string> }} fragment
 * @returns {string[]} empty when the two lists are one list
 */
function compareLists(js, fragment) {
  const problems = [];
  for (const [name, relative] of js.set) {
    if (fragment.set.has(name)) {
      if (fragment.set.get(name) !== relative) {
        problems.push(`${SH_FILE} pins ${name} to ${shown(fragment.set.get(name))}, where ${JS_FILE} pins it to ${shown(relative)}`);
      }
    } else if (fragment.unset.has(name)) {
      problems.push(`${SH_FILE} removes ${name}, which ${JS_FILE} pins to ${shown(relative)}`);
    } else {
      problems.push(`${SH_FILE} does not pin ${name}, which ${JS_FILE} pins to ${shown(relative)}`);
    }
  }
  for (const name of js.unset) {
    if (fragment.unset.has(name)) continue;
    if (fragment.set.has(name)) problems.push(`${SH_FILE} pins ${name} to ${shown(fragment.set.get(name))}, which ${JS_FILE} removes`);
    else problems.push(`${SH_FILE} does not remove ${name}, which ${JS_FILE} removes`);
  }
  const listed = new Set([...js.set.keys(), ...js.unset]);
  for (const [name, relative] of fragment.set) {
    if (!listed.has(name)) problems.push(`${JS_FILE} does not list ${name}, which ${SH_FILE} pins to ${shown(relative)}`);
  }
  for (const name of fragment.unset) {
    if (!listed.has(name)) problems.push(`${JS_FILE} does not list ${name}, which ${SH_FILE} removes`);
  }
  return problems;
}

const JS_LISTS = { set: new Map(Object.entries(SANDBOX_SET)), unset: new Set(SANDBOX_UNSET) };
const fragmentText = () => readFileSync(resolve(ROOT, SH_FILE), 'utf8');

const CLI_FILE = 'cli/index.js';

/**
 * Each command cli/index.js registers, mapped to whether it declares --source. A command's
 * block runs from its `.command('` to the next one, and the last to the end of the file.
 *
 * @param {string} text cli/index.js
 * @returns {Map<string, boolean>}
 */
function commandsDeclaringSource(text) {
  const starts = [...text.matchAll(/\.command\('([^' ]+)/g)];
  return new Map(starts.map((match, index) => {
    const block = text.slice(match.index, starts[index + 1]?.index ?? text.length);
    return [match[1], block.includes(".option('--source")];
  }));
}

/**
 * A stand-in for cli/index.js that prints the arguments and environment it was given. Given
 * --exit-7 it exits 7, a status neither almanac_cli's refusal (2) nor a success can be.
 */
const FIXTURE_CLI = [
  "process.stdout.write(JSON.stringify({ argv: process.argv.slice(2), env: process.env }) + '\\n');",
  "if (process.argv.includes('--exit-7')) process.exitCode = 7;",
  '',
].join('\n');

describe('the sandbox key list: cli/test/sandbox-env.js against the text of tools/sandbox-env.sh', () => {
  it('the fragment holds no line that changes the environment in a form the parse cannot read', () => {
    const { problems } = parseFragment(fragmentText());
    assert.deepEqual(problems, [], problems.join('\n'));
  });

  it('the fragment pins and removes exactly the variables the JS list does, each to the same path', () => {
    const fragment = parseFragment(fragmentText());
    // A parse that found nothing would compare as "every key missing", which is red anyway;
    // this names the cause as the read rather than the list.
    assert.ok(fragment.set.size + fragment.unset.size > 0, `parsed no export or unset line from ${SH_FILE}`);
    const problems = compareLists(JS_LISTS, fragment);
    assert.deepEqual(problems, [], `the two halves of the sandbox key list differ:\n${problems.join('\n')}`);
  });

  it('SANDBOX_KEYS is SANDBOX_SET\'s names and SANDBOX_UNSET, each once', () => {
    assert.deepEqual([...SANDBOX_KEYS].sort(), [...Object.keys(SANDBOX_SET), ...SANDBOX_UNSET].sort());
    assert.equal(new Set(SANDBOX_KEYS).size, SANDBOX_KEYS.length);
  });
});

describe('the comparison names the side that differs (known answers)', () => {
  const lists = (set, unset) => ({ set: new Map(Object.entries(set)), unset: new Set(unset) });
  const js = lists({ HOME: '', HERMES_HOME: '.hermes' }, ['PI_CODING_AGENT_DIR']);

  it('two equal lists give no difference', () => {
    assert.deepEqual(compareLists(js, lists({ HOME: '', HERMES_HOME: '.hermes' }, ['PI_CODING_AGENT_DIR'])), []);
  });

  it('a key only the JS list has is reported against the fragment, for each class', () => {
    assert.deepEqual(compareLists(js, lists({ HOME: '' }, ['PI_CODING_AGENT_DIR'])),
      [`${SH_FILE} does not pin HERMES_HOME, which ${JS_FILE} pins to <home>/.hermes`]);
    assert.deepEqual(compareLists(js, lists({ HOME: '', HERMES_HOME: '.hermes' }, [])),
      [`${SH_FILE} does not remove PI_CODING_AGENT_DIR, which ${JS_FILE} removes`]);
  });

  it('a key only the fragment has is reported against the JS list, for each class', () => {
    assert.deepEqual(compareLists(js, lists({ HOME: '', HERMES_HOME: '.hermes', XDG_CONFIG_HOME: '.config' }, ['PI_CODING_AGENT_DIR'])),
      [`${JS_FILE} does not list XDG_CONFIG_HOME, which ${SH_FILE} pins to <home>/.config`]);
    assert.deepEqual(compareLists(js, lists({ HOME: '', HERMES_HOME: '.hermes' }, ['PI_CODING_AGENT_DIR', 'LOCALAPPDATA'])),
      [`${JS_FILE} does not list LOCALAPPDATA, which ${SH_FILE} removes`]);
  });

  it('a key in both lists with another path or in the other class is reported', () => {
    assert.deepEqual(compareLists(js, lists({ HOME: '', HERMES_HOME: '' }, ['PI_CODING_AGENT_DIR'])),
      [`${SH_FILE} pins HERMES_HOME to <home>, where ${JS_FILE} pins it to <home>/.hermes`]);
    assert.deepEqual(compareLists(js, lists({ HOME: '' }, ['HERMES_HOME', 'PI_CODING_AGENT_DIR'])),
      [`${SH_FILE} removes HERMES_HOME, which ${JS_FILE} pins to <home>/.hermes`]);
    assert.deepEqual(compareLists(js, lists({ HOME: '', HERMES_HOME: '.hermes', PI_CODING_AGENT_DIR: '' }, [])),
      [`${SH_FILE} pins PI_CODING_AGENT_DIR to <home>, which ${JS_FILE} removes`]);
  });

  it('the parse reads both forms, refuses any other line that touches the environment, and skips comments', () => {
    const parsed = parseFragment([
      '# export COMMENTED="$sandbox_home"',
      '  export HOME="$sandbox_home"',
      '  export HERMES_HOME="$sandbox_home/.hermes"',
      '  unset PI_CODING_AGENT_DIR',
      '  local sandbox_home="$1"',
      '  export XDG_CONFIG_HOME="$HOME/.config"',
      '  unset -v LOCALAPPDATA',
      '  declare -x OTHER=1',
      '  unset HOME',
    ].join('\n'));
    assert.deepEqual([...parsed.set], [['HOME', ''], ['HERMES_HOME', '.hermes']]);
    assert.deepEqual([...parsed.unset], ['PI_CODING_AGENT_DIR']);
    assert.deepEqual(parsed.problems, [
      `${SH_FILE}:6: a line that changes the environment in a form the parse does not read: export XDG_CONFIG_HOME="$HOME/.config"`,
      `${SH_FILE}:7: a line that changes the environment in a form the parse does not read: unset -v LOCALAPPDATA`,
      `${SH_FILE}:8: a line that changes the environment in a form the parse does not read: declare -x OTHER=1`,
      `${SH_FILE}:9: HOME is named a second time`,
    ]);
  });
});

/**
 * The fragment is for bash and zsh with a POSIX home: almanac_sandbox refuses a home that does
 * not start with `/`, and on native Windows tmpdir() gives a `C:\…` path. So the describes
 * below that run a shell skip there, as cli.test.js skips its POSIX-only cases; the parse and
 * the comparison above still run. Inferred from the code, not measured on Windows.
 */
const NATIVE_WINDOWS = process.platform === 'win32' && 'native Windows: the fragment takes a POSIX home, and tmpdir() gives none there';

/**
 * Each shell arm below that started, as `<shell> sourced` or `<shell> run as a script`. A skip
 * whose condition holds where it should not skips its arms rather than failing them, and the
 * run goes green having run no shell at all, so the last test in this file reads this set
 * against the platform and PATH, which it reads afresh rather than through the skips.
 */
const ranShellArms = new Set();

/** Is this shell on PATH? spawnSync reports a missing binary as an ENOENT error, not a status. */
function shellPresent(shell) {
  return spawnSync(shell, ['-c', 'exit 0'], { encoding: 'utf8' }).error === undefined;
}

/** argv that runs `script` in `shell` without reading any startup file. */
const shellArgv = (shell, script, args) => (shell === 'zsh' ? ['-f', '-c', script, '_', ...args] : ['--norc', '--noprofile', '-c', script, '_', ...args]);

// Prints the environment a child process receives before the fragment is sourced and after
// almanac_sandbox, one JSON object per line. $1 `allexport` turns allexport on first;
// SANDBOX_ARG_NODE is node, SANDBOX_ARG_HOME the sandbox home and SANDBOX_ARG_FRAGMENT the
// fragment (see runShell). Exit 3-6 say which step failed.
const DUMP_ENV = '"$SANDBOX_ARG_NODE" -e \'process.stdout.write(JSON.stringify(process.env) + "\\n")\'';
const ENV_SCRIPT = [
  'if [ "$1" = allexport ]; then set -a; fi',
  `${DUMP_ENV} || exit 4`,
  '. "$SANDBOX_ARG_FRAGMENT" || exit 3',
  'almanac_sandbox "$SANDBOX_ARG_HOME" || exit 5',
  `${DUMP_ENV} || exit 6`,
].join('\n');

/** Under allexport bash exports every function it then defines, as BASH_FUNC_<name>%%. */
const BASH_FUNCTION_EXPORT = /^BASH_FUNC_.+%%$/;

// Prints the environment a child of the calling shell receives before the fragment is sourced,
// then runs almanac_cli against the stand-in CLI, which prints its own, then prints the calling
// shell's child's environment again. $1 `allexport` turns allexport on first; SANDBOX_ARG_NODE
// is node, SANDBOX_ARG_HOME the sandbox home and SANDBOX_ARG_REPO the stand-in repo. The probe
// is a plain assignment, so a child receives it only when allexport is on: it shows which pass
// ran.
const CLI_SCRIPT = [
  'if [ "$1" = allexport ]; then set -a; fi',
  'SANDBOX_ALLEXPORT_PROBE=reached',
  `${DUMP_ENV} || exit 4`,
  '. tools/sandbox-env.sh || exit 3',
  'almanac_cli "$SANDBOX_ARG_HOME" "$SANDBOX_ARG_REPO" install commit-changes || exit 5',
  `${DUMP_ENV} || exit 6`,
].join('\n');

/**
 * almanac_cli's own locals. Under allexport a shell exports them to the CLI that almanac_cli
 * runs (measured in bash 5.2 and zsh 5.9), so that pass skips them, by these names only: a
 * renamed or added local is reported rather than skipped.
 */
const ALMANAC_CLI_LOCALS = new Set(['sandbox_home', 'almanac_repo']);

for (const shell of ['bash', 'zsh']) {
  const present = shellPresent(shell);
  // bash is required: the repository's own gates are bash, and every runner has it. zsh is the
  // shell the operator's probes source this from. Where zsh is not on PATH, this arm and the
  // zsh run-as-a-script case below skip, and what only they check goes unchecked in that run:
  // the zsh clause of the run-as-a-script guard, and the zsh half of every other check.
  // The required cli-test job is such a run: its runner image lists no zsh (read from the
  // image's readme, not measured in a job). The non-required sandbox-env-zsh job
  // (.github/workflows/ci-sandbox-env-zsh.yml) installs zsh and runs this file with
  // SANDBOX_ENV_REQUIRE_ZSH=1, so there the last test fails if the zsh arms did not run.
  const skip = NATIVE_WINDOWS || (shell === 'zsh' && !present ? 'zsh is not installed here; the bash arm still runs' : false);

  describe(`tools/sandbox-env.sh sourced in ${shell} gives a child what sandboxEnv() gives`, { skip }, () => {
    let tmpRoot;
    let home;
    let fixtureRepo;
    let baseEnv;

    before(() => {
      ranShellArms.add(`${shell} sourced`);
      tmpRoot = realpathSync(mkdtempSync(resolve(tmpdir(), 'almanac-sandbox-env-')));
      home = resolve(tmpRoot, 'home');
      mkdirSync(home, { recursive: true });
      // In a directory of its own: the refusal test below uses tmpRoot as a repo without
      // cli/index.js.
      fixtureRepo = resolve(tmpRoot, 'fixture-repo');
      mkdirSync(resolve(fixtureRepo, 'cli'), { recursive: true });
      writeFileSync(resolve(fixtureRepo, CLI_FILE), FIXTURE_CLI);
      // Every variable either list names starts with a value of its own, so a removal is seen
      // as a removal and a pin as a change. The parse's names are included so a variable only
      // the fragment touches is planted too.
      const fragment = parseFragment(fragmentText());
      const planted = new Set([...SANDBOX_KEYS, ...fragment.set.keys(), ...fragment.unset]);
      baseEnv = { PATH: [dirname(process.execPath), process.env.PATH].filter(Boolean).join(delimiter), SANDBOX_ENV_UNRELATED: 'kept' };
      for (const name of planted) baseEnv[name] = resolve(tmpRoot, 'caller', name.toLowerCase());
    });

    after(() => rmTree(tmpRoot));

    /**
     * Runs `script` in this arm's shell from the repository root. `args` are its positional
     * arguments and hold words only. Every path the script needs reaches it in its environment
     * instead, so that no path this file computes is in the shell's argv (the header says why):
     * SANDBOX_ARG_NODE is always node, and `carried` adds the others, each a SANDBOX_ARG_ name.
     * They are added to the spawn's environment, not to baseEnv, so the child's dumps before and
     * after the call carry them alike, and sandboxEnv() copies them from the dump it is given:
     * a comparison of whole environments sees a carrier on both of its sides with one value, so
     * none is excluded by name, and a script that changed one would still be reported. A carrier
     * may not take a name `env` already holds: it would replace that variable's planted value,
     * and a fragment that pinned the name would then compare equal.
     */
    function runShell(script, { args = [], carried = {}, env = baseEnv } = {}) {
      const carriers = { SANDBOX_ARG_NODE: process.execPath, ...carried };
      for (const name of Object.keys(carriers)) {
        assert.match(name, /^SANDBOX_ARG_[A-Z]+$/, `${name} is not a SANDBOX_ARG_ name`);
        assert.ok(!Object.hasOwn(env, name), `${name} is in the environment already, so carrying a path in it would replace that value`);
      }
      const result = spawnSync(shell, shellArgv(shell, script, args), { cwd: ROOT, env: { ...env, ...carriers }, encoding: 'utf8', timeout: 20000 });
      assert.equal(result.error, undefined, `spawn of ${shell} failed: ${result.error}`);
      return result;
    }

    /**
     * Sources `fragment` in this arm's shell, in `mode`, and lists every variable a child sees
     * differently after almanac_sandbox than sandboxEnv() predicts, as { name, after, expected }.
     */
    function envDifferences(fragment, mode) {
      const result = runShell(ENV_SCRIPT, { args: [mode], carried: { SANDBOX_ARG_HOME: home, SANDBOX_ARG_FRAGMENT: fragment } });
      assert.equal(result.status, 0, `${shell} exited ${result.status}:\n${result.stderr}`);
      const lines = result.stdout.trim().split('\n');
      assert.equal(lines.length, 2, `want two environment dumps, got:\n${result.stdout}`);
      const [beforeEnv, afterEnv] = lines.map((line) => JSON.parse(line));
      // Control: the planted values reached the child, so a removal below is not vacuous.
      for (const name of SANDBOX_KEYS) assert.equal(beforeEnv[name], baseEnv[name], `${name} did not reach the child before almanac_sandbox`);
      const expected = sandboxEnv(home, beforeEnv);
      return [...new Set([...Object.keys(afterEnv), ...Object.keys(expected)])]
        .filter((name) => !(mode === 'allexport' && BASH_FUNCTION_EXPORT.test(name)))
        .sort()
        .filter((name) => afterEnv[name] !== expected[name])
        .map((name) => ({ name, after: afterEnv[name], expected: expected[name] }));
    }

    const describeDifference = (fragment, mode) => ({ name, after, expected }) =>
      `${name}: after ${fragment} (${mode}) a child sees ${JSON.stringify(after)}; sandboxEnv() in ${JS_FILE} gives ${JSON.stringify(expected)}`;

    for (const [mode, title] of [
      ['plain', 'almanac_sandbox changes exactly what sandboxEnv() changes, in both directions'],
      ['allexport', 'with allexport on, almanac_sandbox still changes only what sandboxEnv() changes, so a plain assignment to an unexported variable is seen'],
    ]) {
      it(title, () => {
        const differences = envDifferences(SH_FILE, mode).map(describeDifference(SH_FILE, mode));
        assert.deepEqual(differences, [], differences.join('\n'));
      });
    }

    it('known answer: a plain assignment to an unexported variable is seen by the allexport pass alone', () => {
      // A copy of the fragment that also assigns, without export, a name the starting
      // environment does not carry. The line is appended at file scope so that no line of the
      // fragment anchors it. Each pass is read as what the copy adds over the real fragment, so
      // a defect in the fragment or the JS list, which the arms above report, cancels out here
      // instead of failing this arm as well.
      const planted = resolve(tmpRoot, 'planted-sandbox-env.sh');
      writeFileSync(planted, `${fragmentText()}\nSANDBOX_KNOWN_ANSWER=planted\n`);
      assert.equal(baseEnv.SANDBOX_KNOWN_ANSWER, undefined);
      const added = (mode) => {
        const real = new Set(envDifferences(SH_FILE, mode).map(({ name }) => name));
        return envDifferences(planted, mode).filter(({ name }) => !real.has(name));
      };
      assert.deepEqual(added('plain'), [], 'the plain pass saw an assignment no child of a real caller receives');
      assert.deepEqual(added('allexport'), [{ name: 'SANDBOX_KNOWN_ANSWER', after: 'planted', expected: undefined }]);
    });

    it('almanac_sandbox refuses, exit 2 and nothing changed, a missing argument, a relative path, a missing directory and the current HOME', () => {
      const missing = resolve(tmpRoot, 'no-such-home');
      for (const [label, call, carried] of [
        ['no argument', 'almanac_sandbox', {}],
        ['a relative path', 'almanac_sandbox "$SANDBOX_ARG_HOME"', { SANDBOX_ARG_HOME: 'relative-home' }],
        ['a missing directory', 'almanac_sandbox "$SANDBOX_ARG_HOME"', { SANDBOX_ARG_HOME: missing }],
        ['the current HOME', 'almanac_sandbox "$HOME"', {}],
      ]) {
        const script = `. tools/sandbox-env.sh || exit 3\n${call}\nrc=$?\n"$SANDBOX_ARG_NODE" -e 'process.stdout.write(JSON.stringify(process.env))'\nexit $rc`;
        const env = label === 'the current HOME' ? { ...baseEnv, HOME: home } : baseEnv;
        const result = runShell(script, { carried, env });
        assert.equal(result.status, 2, `${label}: want exit 2, got ${result.status}\n${result.stderr}`);
        assert.match(result.stderr, /^almanac_sandbox: refused: /, label);
        const seen = JSON.parse(result.stdout);
        for (const name of SANDBOX_KEYS) assert.equal(seen[name], env[name], `${label}: ${name} moved although the call was refused`);
      }
    });

    it('almanac_cli runs the real CLI with the sandbox applied, so pi\'s dry run names the sandbox home\'s pi directory', () => {
      // A pi dry run names the directory pi would write to and writes nothing. With the
      // caller's PI_CODING_AGENT_DIR still set it would name that directory instead. What
      // almanac_cli leaves in the calling shell is compared whole by the stand-in arms below.
      const script = [
        '. tools/sandbox-env.sh || exit 3',
        'almanac_cli "$SANDBOX_ARG_HOME" "$SANDBOX_ARG_REPO" install commit-changes -f pi -g --dry-run || exit 4',
      ].join('\n');
      const result = runShell(script, { carried: { SANDBOX_ARG_HOME: home, SANDBOX_ARG_REPO: ROOT }, env: { ...baseEnv, NO_COLOR: '1' } });
      assert.equal(result.status, 0, `${shell} exited ${result.status}:\n${result.stdout}\n${result.stderr}`);
      const lines = result.stdout.split('\n');
      const piLine = `  + commit-changes [pi] ${resolve(home, '.pi/agent/skills/commit-changes')}`;
      assert.ok(lines.includes(piLine), `want the line ${JSON.stringify(piLine)} in:\n${result.stdout}`);
    });

    /**
     * Runs CLI_SCRIPT in `mode` and returns the environment the caller's child received before
     * the fragment was sourced, the one the stand-in CLI received through almanac_cli, and the
     * one the caller's child received after almanac_cli returned.
     */
    function runAlmanacCli(mode) {
      const result = runShell(CLI_SCRIPT, { args: [mode], carried: { SANDBOX_ARG_HOME: home, SANDBOX_ARG_REPO: fixtureRepo } });
      assert.equal(result.status, 0, `${shell} exited ${result.status}:\n${result.stdout}\n${result.stderr}`);
      const lines = result.stdout.trim().split('\n');
      assert.equal(lines.length, 3, `want the caller's environment, the CLI's and the caller's again, got:\n${result.stdout}`);
      const callerEnv = JSON.parse(lines[0]);
      const cliEnv = JSON.parse(lines[1]).env;
      const callerAfterEnv = JSON.parse(lines[2]);
      for (const name of SANDBOX_KEYS) assert.equal(callerEnv[name], baseEnv[name], `${name} did not reach the caller's child`);
      // Control: the pass is the one its title names. Without allexport the plain probe
      // assignment stays in the shell, so a pass that never turned allexport on fails here.
      assert.equal(cliEnv.SANDBOX_ALLEXPORT_PROBE, mode === 'allexport' ? 'reached' : undefined,
        `the ${mode} pass: the CLI saw the probe as ${JSON.stringify(cliEnv.SANDBOX_ALLEXPORT_PROBE)}`);
      return { callerEnv, cliEnv, callerAfterEnv };
    }

    for (const [mode, title] of [
      ['plain', 'almanac_cli gives the CLI exactly the environment sandboxEnv() builds'],
      ['allexport', 'with allexport on, almanac_cli still gives the CLI what sandboxEnv() builds, its own locals aside, so a plain assignment to an unexported variable is seen'],
    ]) {
      it(title, () => {
        // The pi dry run above shows only pi's directory, so it cannot see HERMES_HOME,
        // USERPROFILE or LOCALAPPDATA. The stand-in prints the whole environment it was given.
        // The plain pass cannot see a plain assignment, in almanac_cli's subshell, to a name the
        // starting environment does not export, although a real caller that exports the name
        // would pass the new value to the CLI; the allexport pass sees it.
        const { callerEnv, cliEnv } = runAlmanacCli(mode);
        const expected = sandboxEnv(home, callerEnv);
        const differences = [...new Set([...Object.keys(cliEnv), ...Object.keys(expected)])]
          .filter((name) => !(mode === 'allexport' && (BASH_FUNCTION_EXPORT.test(name) || ALMANAC_CLI_LOCALS.has(name))))
          .sort()
          .filter((name) => cliEnv[name] !== expected[name])
          .map((name) => `${name}: through almanac_cli (${mode}) the CLI sees ${JSON.stringify(cliEnv[name])}; sandboxEnv() in ${JS_FILE} gives ${JSON.stringify(expected[name])}`);
        assert.deepEqual(differences, [], differences.join('\n'));
      });
    }

    for (const [mode, title] of [
      ['plain', 'a child of the calling shell gets the same environment after almanac_cli as before the fragment was sourced'],
      ['allexport', 'with allexport on, a child of the calling shell still gets the same environment after almanac_cli, so a plain assignment to an unexported variable is seen'],
    ]) {
      it(title, () => {
        // almanac_cli runs the CLI in a subshell so that the calling shell keeps its own homes.
        // A change made in the function body outside that subshell, or a variable it forgets to
        // declare local, stays in the calling shell. The plain pass sees such a change to any
        // variable the starting environment exports; the allexport pass also sees a plain
        // assignment to one it does not. A cd shows too, as PWD, which bash and zsh export.
        // Neither pass sees a shell option, an alias or a function.
        const { callerEnv, callerAfterEnv } = runAlmanacCli(mode);
        const differences = [...new Set([...Object.keys(callerEnv), ...Object.keys(callerAfterEnv)])]
          .filter((name) => !(mode === 'allexport' && BASH_FUNCTION_EXPORT.test(name)))
          .sort()
          .filter((name) => callerAfterEnv[name] !== callerEnv[name])
          .map((name) => `${name}: after almanac_cli (${mode}) a child of the calling shell sees ${JSON.stringify(callerAfterEnv[name])}; before the fragment was sourced it saw ${JSON.stringify(callerEnv[name])}`);
        assert.deepEqual(differences, [], differences.join('\n'));
      });
    }

    it('almanac_cli adds --source <repo> for exactly the commands cli/index.js declares it on', () => {
      const declared = commandsDeclaringSource(readFileSync(resolve(ROOT, CLI_FILE), 'utf8'));
      // Known answers, one each way, so a scan that broke reads as a broken scan.
      assert.equal(declared.get('install'), true, `the scan of ${CLI_FILE} did not see install's --source`);
      assert.equal(declared.get('detect'), false, `the scan of ${CLI_FILE} saw a --source on detect`);
      // '' is the bare program, which declares no --source either.
      const cases = [['', false], ...declared];
      const script = [
        '. tools/sandbox-env.sh || exit 3',
        'for command_name in "$@"; do',
        '  if [ -z "$command_name" ]; then almanac_cli "$SANDBOX_ARG_HOME" "$SANDBOX_ARG_REPO" || exit 4',
        '  else almanac_cli "$SANDBOX_ARG_HOME" "$SANDBOX_ARG_REPO" "$command_name" || exit 4; fi',
        'done',
      ].join('\n');
      const result = runShell(script, { args: cases.map(([name]) => name), carried: { SANDBOX_ARG_HOME: home, SANDBOX_ARG_REPO: fixtureRepo } });
      assert.equal(result.status, 0, `${shell} exited ${result.status}:\n${result.stdout}\n${result.stderr}`);
      const lines = result.stdout.trim().split('\n');
      assert.equal(lines.length, cases.length, `want one line per command, got:\n${result.stdout}`);
      const wrong = cases
        .map(([name, declares], index) => {
          const want = [...(name ? [name] : []), ...(declares ? ['--source', fixtureRepo] : [])];
          const got = JSON.parse(lines[index]).argv;
          return JSON.stringify(got) === JSON.stringify(want) ? null : `${name || '(no command)'}: the CLI got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`;
        })
        .filter(Boolean);
      assert.deepEqual(wrong, [], wrong.join('\n'));
    });

    it('almanac_cli returns the CLI\'s exit status from both branches of its --source case', () => {
      // A probe written as `almanac_cli … && check` reads this status, so a branch that dropped
      // it would read a failed CLI run as a success. detect takes the branch without --source,
      // install the one with it; the argv says which branch ran.
      for (const [command, want] of [
        ['detect', ['detect', '--exit-7']],
        ['install', ['install', '--exit-7', '--source', fixtureRepo]],
      ]) {
        const result = runShell('. tools/sandbox-env.sh || exit 3\nalmanac_cli "$SANDBOX_ARG_HOME" "$SANDBOX_ARG_REPO" "$1" --exit-7',
          { args: [command], carried: { SANDBOX_ARG_HOME: home, SANDBOX_ARG_REPO: fixtureRepo } });
        assert.equal(result.status, 7, `${command}: want the CLI's exit 7 back, got ${result.status}\n${result.stdout}\n${result.stderr}`);
        assert.deepEqual(JSON.parse(result.stdout.trim()).argv, want, `${command}: the CLI did not get the arguments of the branch this case is for`);
      }
    });

    it('almanac_cli runs the real detect, demo and bare program, which take no --source, each to exit 0', () => {
      // With no TTY the bare program prints its help rather than starting the TUI.
      for (const [label, args] of [['detect', ['detect']], ['demo', ['demo']], ['the bare program', []]]) {
        const call = `almanac_cli "$SANDBOX_ARG_HOME" "$SANDBOX_ARG_REPO"${args.map((_, index) => ` "$${index + 1}"`).join('')}`;
        const result = runShell(`. tools/sandbox-env.sh || exit 3\n${call}`,
          { args, carried: { SANDBOX_ARG_HOME: home, SANDBOX_ARG_REPO: ROOT }, env: { ...baseEnv, NO_COLOR: '1' } });
        assert.equal(result.status, 0, `${label}: ${shell} exited ${result.status}:\n${result.stdout}\n${result.stderr}`);
        assert.doesNotMatch(result.stderr, /unknown option/, label);
      }
    });

    it('almanac_cli refuses, exit 2 and the calling shell unchanged, a lone argument, a relative repo and a repo without cli/index.js', () => {
      // A child of the calling shell prints its environment before the fragment is sourced and
      // after the refused call, and the two must be equal. No CLI can run here, since neither
      // repo holds a cli/index.js; a third line of output would be one that did.
      for (const [label, call] of [
        ['a lone argument', 'almanac_cli "$SANDBOX_ARG_HOME"'],
        ['a relative repo', 'almanac_cli "$SANDBOX_ARG_HOME" relative-repo --version'],
        ['a repo without cli/index.js', 'almanac_cli "$SANDBOX_ARG_HOME" "$SANDBOX_ARG_REPO" --version'],
      ]) {
        const script = [`${DUMP_ENV} || exit 4`, '. tools/sandbox-env.sh || exit 3', call, 'rc=$?', `${DUMP_ENV} || exit 6`, 'exit $rc'].join('\n');
        const result = runShell(script, { carried: { SANDBOX_ARG_HOME: home, SANDBOX_ARG_REPO: tmpRoot } });
        assert.equal(result.status, 2, `${label}: want exit 2, got ${result.status}\n${result.stdout}\n${result.stderr}`);
        assert.match(result.stderr, /^almanac_cli: refused: /, label);
        const lines = result.stdout.trim().split('\n');
        assert.equal(lines.length, 2, `${label}: want the environment before and after the call, got:\n${result.stdout}`);
        const [beforeEnv, afterEnv] = lines.map((line) => JSON.parse(line));
        const moved = [...new Set([...Object.keys(beforeEnv), ...Object.keys(afterEnv)])]
          .sort()
          .filter((name) => afterEnv[name] !== beforeEnv[name])
          .map((name) => `${name}: ${JSON.stringify(beforeEnv[name])} before the fragment was sourced, ${JSON.stringify(afterEnv[name])} after the refused call`);
        assert.deepEqual(moved, [], `${label}: the refused call changed the calling shell:\n${moved.join('\n')}`);
      }
    });

    it('almanac_cli refuses, exit 2 and the CLI never run, a home almanac_sandbox refuses', () => {
      // The stand-in CLI prints a line whenever it runs, so an empty stdout means it did not.
      // Without the `|| exit 2` after almanac_sandbox, each case printed the refusal and then
      // ran the CLI against the caller's homes, exit 0.
      const missing = resolve(tmpRoot, 'no-such-home');
      for (const [label, homeArg, env] of [
        ['a missing directory', missing, baseEnv],
        ['a relative path', 'relative-home', baseEnv],
        ['the current HOME', home, { ...baseEnv, HOME: home }],
      ]) {
        const result = runShell('. tools/sandbox-env.sh || exit 3\nalmanac_cli "$SANDBOX_ARG_HOME" "$SANDBOX_ARG_REPO" install commit-changes',
          { carried: { SANDBOX_ARG_HOME: homeArg, SANDBOX_ARG_REPO: fixtureRepo }, env });
        assert.equal(result.status, 2, `${label}: want exit 2, got ${result.status}\n${result.stdout}\n${result.stderr}`);
        assert.match(result.stderr, /^almanac_sandbox: refused: /, label);
        assert.equal(result.stdout, '', `${label}: the CLI ran although the home was refused`);
      }
    });
  });
}

describe('tools/sandbox-env.sh run as a script', { skip: NATIVE_WINDOWS }, () => {
  // The sourced arms above are the control: a guard that also fired when sourced would end
  // their shell with exit 2. Where zsh is not on PATH the zsh case skips, and the guard's zsh
  // clause is then unchecked; the note at the sourced arms says which runs those are.
  for (const shell of ['bash', 'zsh']) {
    const skip = shell === 'zsh' && !shellPresent('zsh') ? 'zsh is not installed here; the bash case still runs' : false;
    it(`refuses under ${shell}, exit 2, because a script cannot change the shell that started it`, { skip }, () => {
      ranShellArms.add(`${shell} run as a script`);
      const argv = shell === 'zsh' ? ['-f', SH_FILE] : [SH_FILE];
      const result = spawnSync(shell, argv, { cwd: ROOT, encoding: 'utf8', timeout: 20000 });
      assert.equal(result.error, undefined, `spawn of ${shell} failed: ${result.error}`);
      assert.equal(result.status, 2, `want exit 2, got ${result.status}\n${result.stderr}`);
      assert.match(result.stderr, /^sandbox-env\.sh: refused: source this file/);
    });
  }
});

// Last in the file, so every arm above has started or been skipped by now: node:test runs a
// file's top-level tests in the order they are declared. SANDBOX_ENV_REQUIRE_ZSH=1, which the
// sandbox-env-zsh job sets, requires the zsh arms whatever shellPresent() answers, so a probe
// that misread an installed zsh as missing cannot turn that job green.
it('on a POSIX platform the bash arm ran, and the zsh arm ran wherever zsh is on PATH or SANDBOX_ENV_REQUIRE_ZSH=1 requires it', () => {
  const zshRequired = process.env.SANDBOX_ENV_REQUIRE_ZSH === '1';
  const zshFound = shellPresent('zsh');
  const shells = process.platform === 'win32' ? [] : ['bash', ...(zshRequired || zshFound ? ['zsh'] : [])];
  const expected = shells.flatMap((shell) => [`${shell} sourced`, `${shell} run as a script`]).sort();
  const ran = [...ranShellArms].sort();
  assert.deepEqual(ran, expected,
    `on ${process.platform}, with zsh ${zshFound ? 'on' : 'not on'} PATH and SANDBOX_ENV_REQUIRE_ZSH ${zshRequired ? 'set to 1' : 'not set to 1'}, want the arms ${JSON.stringify(expected)} to have run; ran ${JSON.stringify(ran)}`);
});
