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
 * Shell paths are literal and every value is a positional argument: the CodeQL finding
 * recorded in template-predicate.test.js was a path from `import.meta.url` reaching `bash -c`.
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

/** A stand-in for cli/index.js that prints the arguments and environment it was given. */
const FIXTURE_CLI = "process.stdout.write(JSON.stringify({ argv: process.argv.slice(2), env: process.env }) + '\\n');\n";

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

/** Is this shell on PATH? spawnSync reports a missing binary as an ENOENT error, not a status. */
function shellPresent(shell) {
  return spawnSync(shell, ['-c', 'exit 0'], { encoding: 'utf8' }).error === undefined;
}

/** argv that runs `script` in `shell` without reading any startup file. */
const shellArgv = (shell, script, args) => (shell === 'zsh' ? ['-f', '-c', script, '_', ...args] : ['--norc', '--noprofile', '-c', script, '_', ...args]);

// Prints the environment a child process receives before the fragment is sourced and after
// almanac_sandbox, one JSON object per line. $1 is node, $2 the sandbox home, and $3 `allexport`
// turns allexport on first. Exit 3-6 say which step failed.
const DUMP_ENV = '"$1" -e \'process.stdout.write(JSON.stringify(process.env) + "\\n")\'';
const ENV_SCRIPT = [
  'if [ "$3" = allexport ]; then set -a; fi',
  `${DUMP_ENV} || exit 4`,
  '. tools/sandbox-env.sh || exit 3',
  'almanac_sandbox "$2" || exit 5',
  `${DUMP_ENV} || exit 6`,
].join('\n');

/** Under allexport bash exports every function it then defines, as BASH_FUNC_<name>%%. */
const BASH_FUNCTION_EXPORT = /^BASH_FUNC_.+%%$/;

for (const shell of ['bash', 'zsh']) {
  const present = shellPresent(shell);
  // bash is required: the repository's own gates are bash, and CI has it. zsh is the shell
  // the operator's probes source this from, and CI may not install it.
  const skip = shell === 'zsh' && !present ? 'zsh is not installed here; the bash arm still runs' : false;

  describe(`tools/sandbox-env.sh sourced in ${shell} gives a child what sandboxEnv() gives`, { skip }, () => {
    let tmpRoot;
    let home;
    let fixtureRepo;
    let baseEnv;

    before(() => {
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

    /** Runs `script` in this arm's shell from the repository root. */
    function runShell(script, args, env = baseEnv) {
      const result = spawnSync(shell, shellArgv(shell, script, args), { cwd: ROOT, env, encoding: 'utf8', timeout: 20000 });
      assert.equal(result.error, undefined, `spawn of ${shell} failed: ${result.error}`);
      return result;
    }

    for (const [mode, title] of [
      ['plain', 'almanac_sandbox changes exactly what sandboxEnv() changes, in both directions'],
      ['allexport', 'with allexport on, almanac_sandbox still changes only what sandboxEnv() changes, so a plain assignment to an unexported variable is seen'],
    ]) {
      it(title, () => {
        const result = runShell(ENV_SCRIPT, [process.execPath, home, mode]);
        assert.equal(result.status, 0, `${shell} exited ${result.status}:\n${result.stderr}`);
        const lines = result.stdout.trim().split('\n');
        assert.equal(lines.length, 2, `want two environment dumps, got:\n${result.stdout}`);
        const [beforeEnv, afterEnv] = lines.map((line) => JSON.parse(line));
        // Control: the planted values reached the child, so a removal below is not vacuous.
        for (const name of SANDBOX_KEYS) assert.equal(beforeEnv[name], baseEnv[name], `${name} did not reach the child before almanac_sandbox`);
        const expected = sandboxEnv(home, beforeEnv);
        const names = [...new Set([...Object.keys(afterEnv), ...Object.keys(expected)])]
          .filter((name) => !(mode === 'allexport' && BASH_FUNCTION_EXPORT.test(name)))
          .sort();
        const differences = names
          .filter((name) => afterEnv[name] !== expected[name])
          .map((name) => `${name}: after ${SH_FILE} (${mode}) a child sees ${JSON.stringify(afterEnv[name])}; sandboxEnv() in ${JS_FILE} gives ${JSON.stringify(expected[name])}`);
        assert.deepEqual(differences, [], differences.join('\n'));
      });
    }

    it('almanac_sandbox refuses, exit 2 and nothing changed, a missing argument, a relative path, a missing directory and the current HOME', () => {
      const missing = resolve(tmpRoot, 'no-such-home');
      for (const [label, args] of [
        ['no argument', []],
        ['a relative path', ['relative-home']],
        ['a missing directory', [missing]],
        ['the current HOME', ['$HOME']],
      ]) {
        const call = args[0] === '$HOME' ? 'almanac_sandbox "$HOME"' : `almanac_sandbox ${args.map((_, i) => `"$${i + 2}"`).join(' ')}`;
        const script = `. tools/sandbox-env.sh || exit 3\n${call}\nrc=$?\n"$1" -e 'process.stdout.write(JSON.stringify(process.env))'\nexit $rc`;
        const env = label === 'the current HOME' ? { ...baseEnv, HOME: home } : baseEnv;
        const result = runShell(script, [process.execPath, ...args], env);
        assert.equal(result.status, 2, `${label}: want exit 2, got ${result.status}\n${result.stderr}`);
        assert.match(result.stderr, /^almanac_sandbox: refused: /, label);
        const seen = JSON.parse(result.stdout);
        for (const name of SANDBOX_KEYS) assert.equal(seen[name], env[name], `${label}: ${name} moved although the call was refused`);
      }
    });

    it('almanac_cli runs the CLI with the sandbox applied and leaves the calling shell as it was', () => {
      // A pi dry run names the directory pi would write to and writes nothing. With the
      // caller's PI_CODING_AGENT_DIR still set it would name that directory instead.
      const script = [
        '. tools/sandbox-env.sh || exit 3',
        'almanac_cli "$2" "$3" install commit-changes -f pi -g --dry-run || exit 4',
        'printf "CALLER_HOME=%s\\n" "$HOME"',
      ].join('\n');
      const result = runShell(script, [process.execPath, home, ROOT], { ...baseEnv, NO_COLOR: '1' });
      assert.equal(result.status, 0, `${shell} exited ${result.status}:\n${result.stdout}\n${result.stderr}`);
      const lines = result.stdout.split('\n');
      const piLine = `  + commit-changes [pi] ${resolve(home, '.pi/agent/skills/commit-changes')}`;
      assert.ok(lines.includes(piLine), `want the line ${JSON.stringify(piLine)} in:\n${result.stdout}`);
      assert.ok(lines.includes(`CALLER_HOME=${baseEnv.HOME}`), `the calling shell's HOME moved:\n${result.stdout}`);
    });

    it('almanac_cli adds --source <repo> for exactly the commands cli/index.js declares it on', () => {
      const declared = commandsDeclaringSource(readFileSync(resolve(ROOT, CLI_FILE), 'utf8'));
      // Known answers, one each way, so a scan that broke reads as a broken scan.
      assert.equal(declared.get('install'), true, `the scan of ${CLI_FILE} did not see install's --source`);
      assert.equal(declared.get('detect'), false, `the scan of ${CLI_FILE} saw a --source on detect`);
      // '' is the bare program, which declares no --source either.
      const cases = [['', false], ...declared];
      const script = [
        '. tools/sandbox-env.sh || exit 3',
        'sandbox_home="$1" fixture_repo="$2"',
        'shift 2',
        'for command_name in "$@"; do',
        '  if [ -z "$command_name" ]; then almanac_cli "$sandbox_home" "$fixture_repo" || exit 4',
        '  else almanac_cli "$sandbox_home" "$fixture_repo" "$command_name" || exit 4; fi',
        'done',
      ].join('\n');
      const result = runShell(script, [home, fixtureRepo, ...cases.map(([name]) => name)]);
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

    it('almanac_cli runs the real detect, demo and bare program, which take no --source, each to exit 0', () => {
      // With no TTY the bare program prints its help rather than starting the TUI.
      for (const [label, args] of [['detect', ['detect']], ['demo', ['demo']], ['the bare program', []]]) {
        const call = `almanac_cli "$1" "$2"${args.map((_, index) => ` "$${index + 3}"`).join('')}`;
        const result = runShell(`. tools/sandbox-env.sh || exit 3\n${call}`, [home, ROOT, ...args], { ...baseEnv, NO_COLOR: '1' });
        assert.equal(result.status, 0, `${label}: ${shell} exited ${result.status}:\n${result.stdout}\n${result.stderr}`);
        assert.doesNotMatch(result.stderr, /unknown option/, label);
      }
    });

    it('almanac_cli refuses, exit 2, a relative repo and a repo without cli/index.js', () => {
      for (const [label, repo] of [['a relative repo', 'relative-repo'], ['a repo without cli/index.js', tmpRoot]]) {
        const result = runShell('. tools/sandbox-env.sh || exit 3\nalmanac_cli "$1" "$2" --version', [home, repo]);
        assert.equal(result.status, 2, `${label}: want exit 2, got ${result.status}\n${result.stdout}\n${result.stderr}`);
        assert.match(result.stderr, /^almanac_cli: refused: /, label);
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
        const result = runShell('. tools/sandbox-env.sh || exit 3\nalmanac_cli "$1" "$2" install commit-changes', [homeArg, fixtureRepo], env);
        assert.equal(result.status, 2, `${label}: want exit 2, got ${result.status}\n${result.stdout}\n${result.stderr}`);
        assert.match(result.stderr, /^almanac_sandbox: refused: /, label);
        assert.equal(result.stdout, '', `${label}: the CLI ran although the home was refused`);
      }
    });
  });
}

describe('tools/sandbox-env.sh run as a script', () => {
  // The sourced arms above are the control: a guard that also fired when sourced would end
  // their shell with exit 2.
  for (const shell of ['bash', 'zsh']) {
    const skip = shell === 'zsh' && !shellPresent('zsh') ? 'zsh is not installed here; the bash case still runs' : false;
    it(`refuses under ${shell}, exit 2, because a script cannot change the shell that started it`, { skip }, () => {
      const argv = shell === 'zsh' ? ['-f', SH_FILE] : [SH_FILE];
      const result = spawnSync(shell, argv, { cwd: ROOT, encoding: 'utf8', timeout: 20000 });
      assert.equal(result.error, undefined, `spawn of ${shell} failed: ${result.error}`);
      assert.equal(result.status, 2, `want exit 2, got ${result.status}\n${result.stderr}`);
      assert.match(result.stderr, /^sandbox-env\.sh: refused: source this file/);
    });
  }
});
