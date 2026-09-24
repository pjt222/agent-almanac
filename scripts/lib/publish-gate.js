/**
 * The publish gate, read as data (#697).
 *
 * `prepublishOnly` is the last thing that runs before an `npm publish` PUT, and
 * `CLAUDE.md` records that it is *deliberately* redundant with the workflow's
 * "Run tests" step: it runs the CLI suite independently, and must not be removed in
 * favour of that step. Redundancy is the property that makes the gate worth having.
 *
 * Duplicate *spelling* is not the same thing as redundancy, and #697 is what happens
 * when the two are confused. Both scripts used to name `cli/test/cli.test.js`
 * literally, with nothing tying them together:
 *
 *     "test:cli":       "node --test cli/test/cli.test.js",
 *     "prepublishOnly": "node --test cli/test/cli.test.js",
 *
 * Rename or move the suite, update `test:cli`, and `prepublishOnly` still points at a
 * path that no longer exists. `npm publish` would fail there — but loudly in the wrong
 * place, months later, on the one command whose failure mode nobody rehearses. The
 * repair is that the path is named exactly once and `prepublishOnly` delegates, so the
 * two *cannot* say different things.
 *
 * This module reads that arrangement and reports what is wrong with it. It is shared
 * by two consumers so the rule exists once:
 *
 *   - `scripts/assert-publish-gate.js`, wired as npm's `pretest:cli` hook, so the check
 *     runs at publish time on the operator's machine — inside `prepublishOnly` itself,
 *     by way of the delegation.
 *   - `scripts/test/publish-gate.test.js`, so a PR that re-inlines the path goes red in
 *     CI. `ci-scripts.yml` carries no `paths:` filter (#641), so that test sees a
 *     `package.json`-only change; a gate living under a `scripts/**` filter would not.
 *
 * ## What it checks, and why each one
 *
 * The interesting failure is not "the file is missing" — `node --test` says that loudly.
 * It is the two silences #486 names, one of which nobody chose:
 *
 *   1. **A rename updated in one spelling and not the other.** Removed structurally:
 *      exactly one script may name the suite directory. Two again is a failure, whatever
 *      the two say.
 *   2. **A newly added test file that no script names.** `test:cli` names its file
 *      explicitly rather than globbing, which is what makes it fail loudly on a rename
 *      (`test:scripts` globs and so goes vacuously green instead — see
 *      `scripts/test/_assert-suite-nonempty.js`). The cost of naming is that a file
 *      added beside it is simply never run, and every gate stays green. So the named set
 *      is compared against the discovered set, in both directions.
 *
 * Direction matters: named-but-absent is a broken gate, absent-but-present is an unrun
 * test. Both are reported, separately, because the repairs differ.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Scripts whose value names a path under this directory are "naming the CLI suite". */
export const CLI_TEST_DIR = 'cli/test';

/** The one script permitted to name the suite. Everything else must reach it by delegation. */
export const CANONICAL_SCRIPT = 'test:cli';

/** The script npm runs immediately before an `npm publish` PUT. */
export const PUBLISH_HOOK = 'prepublishOnly';

/**
 * npm's pre-hook for the canonical script. Because `prepublishOnly` delegates to
 * `npm run test:cli`, wiring the check here puts it inside the publish path — no
 * separate `prepublishOnly` clause needed, and therefore no second spelling.
 */
export const PRE_HOOK = `pre${CANONICAL_SCRIPT}`;

/** The checker the pre-hook must invoke. */
export const ASSERT_SCRIPT = 'scripts/assert-publish-gate.js';

/**
 * The exact, only legitimate values of the two single-purpose hooks.
 *
 * Equality, not matching — and the reason is that the property being protected is not
 * "does this reach the suite" but "does a failing suite ABORT THE PUBLISH". That lives in
 * the exit status, which no segment matcher can see. Every one of these reaches the suite
 * by any reasonable matcher and none of them gates:
 *
 *     npm run test:cli || true      suite runs, failure swallowed, publish proceeds
 *     npm run test:cli; echo done   `;` takes the LAST command's exit status
 *     npm run test:cli | tee log    the pipeline exits with tee's 0
 *     npm run test:cli &            backgrounded; the shell exits 0 immediately
 *     true || npm run test:cli      short-circuits — the suite never runs at all
 *     cd elsewhere && npm run …     runs a DIFFERENT package's script
 *
 * A hook with exactly one legitimate value should be checked against that value. This is
 * #697's own thesis — the path is named exactly once — carried to its endpoint. Anything
 * else is refused LOUDLY, which is the recoverable direction.
 *
 * `test` is deliberately NOT held to this: it legitimately chains, and a pure `&&` chain
 * propagates a failure in either position, so `invokesScript` is the right instrument there.
 */
export const CANONICAL_INVOCATION = `npm run ${CANONICAL_SCRIPT}`;
export const ASSERT_INVOCATION = `node ${ASSERT_SCRIPT}`;

/**
 * Test files a `node --test` invocation would pick up. Kept in one place so the
 * discovered set and the named set are compared under the same definition of "a test".
 */
const TEST_FILE_SUFFIXES = ['.test.js', '.test.mjs', '.test.cjs'];

/**
 * Pull the file arguments out of an npm script command line.
 *
 * Deliberately crude: it takes every whitespace-separated token that looks like a path
 * into the CLI test directory, rather than parsing the shell. A parser would be a proxy
 * for the real consumer (the shell, then node's own globber), and this repo's rule is to
 * guard by the consumer's accept-rule or by something strictly broader — never by
 * something narrower that can be stepped around. Broader is safe here: an extra token
 * that is not really a path shows up as named-but-absent, which is a loud failure, not a
 * silent pass.
 */
export function namedTestFiles(command) {
  if (!command) return [];
  return command
    .split(/\s+/)
    .filter((token) => token.includes(`${CLI_TEST_DIR}/`))
    .map((token) => token.replace(/^['"]|['"]$/g, ''));
}

/**
 * Shell segments of a command line: the pieces that could each start a command.
 *
 * Crude on purpose, and deliberately BROADER than the shell in the loud
 * direction only. Splitting on the operators that begin a new command is what
 * lets the matchers below ask "does a segment START with this invocation"
 * rather than "does this string contain it" — the difference between rejecting
 * `echo skipping npm run test:cli` and accepting it.
 */
function segments(command) {
  return String(command).split(/&&|\|\||[;|\n]/).map((s) => s.trim()).filter(Boolean);
}

/**
 * Does `command` actually run `npm run <scriptName>`?
 *
 * A substring test does not answer this, and the way it fails is silent, which
 * is the one direction this module must not fail in. Two real inputs it lets
 * through, both one-token edits rather than adversarial ones:
 *
 *   "npm run pretest:cli"              — `.includes('test:cli')` is TRUE, because
 *                                        `test:cli` is a substring of `pretest:cli`.
 *                                        A publish then runs the ASSERT and zero
 *                                        CLI tests, with every gate green.
 *   "echo skipping npm run test:cli"   — the disable-by-echo-prefix, which passes
 *                                        any containment check.
 *
 * So the token sequence must appear at the START of some segment. That rejects
 * both. It also rejects `env FOO=1 npm run test:cli`, which is a false positive
 * — but a LOUD one: the gate reports a problem rather than silently approving
 * something that does not run the suite. Loud-and-wrong is recoverable; the
 * whole point of #697 is that quiet-and-wrong is not.
 */
export function invokesScript(command, scriptName) {
  if (!command) return false;
  return segments(command).some((segment) => {
    const [bin, sub, target] = segment.split(/\s+/);
    return bin === 'npm' && (sub === 'run' || sub === 'run-script') && target === scriptName;
  });
}

/** Does `command` actually run `node <scriptPath>`? Same reasoning as above. */
export function invokesNodeScript(command, scriptPath) {
  if (!command) return false;
  return segments(command).some((segment) => {
    const tokens = segment.split(/\s+/);
    return tokens[0] === 'node'
      && tokens.slice(1).some((token) => token.replace(/^['"]|['"]$/g, '') === scriptPath);
  });
}

/**
 * Every test file actually sitting under the CLI test directory.
 *
 * Recursive, and matching every extension node treats as an ES/CJS module,
 * because the set this is compared against must be at least as wide as node's
 * own discovery. Listing one level of `*.test.js` looked equivalent while
 * `cli/test/` held one flat file, and would have silently missed exactly the
 * case the comparison exists for: `cli/test/adapters/foo.test.js`, or a
 * `util.test.mjs`, is neither run by the named invocation NOR reported here.
 * That is #486's silence reproduced inside the check written to close it.
 */
export function discoverTestFiles(repoRoot, subdir = CLI_TEST_DIR) {
  const dir = resolve(repoRoot, subdir);
  if (!existsSync(dir)) return null;
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = `${subdir}/${entry.name}`;
    if (entry.isDirectory()) found.push(...(discoverTestFiles(repoRoot, rel) ?? []));
    else if (TEST_FILE_SUFFIXES.some((suffix) => entry.name.endsWith(suffix))) found.push(rel);
  }
  return found.sort();
}

/**
 * Inspect a repository's publish gate.
 *
 * `scripts` may be passed directly (for fixtures); otherwise it is read from
 * `<repoRoot>/package.json`. Returns `{ problems, ... }` — an empty `problems` array
 * means the gate holds.
 */
export function inspectPublishGate(repoRoot, scripts = null) {
  const pkgScripts = scripts ?? JSON.parse(
    readFileSync(resolve(repoRoot, 'package.json'), 'utf8'),
  ).scripts ?? {};

  const problems = [];

  const naming = Object.entries(pkgScripts)
    .filter(([, command]) => namedTestFiles(command).length > 0)
    .map(([name]) => name)
    .sort();

  // 1. The suite path is named exactly once, by the canonical script.
  if (naming.length === 0) {
    problems.push(
      `No script names a suite under ${CLI_TEST_DIR}/. The CLI suite would never run — ` +
      `not by \`npm test\`, and not by \`${PUBLISH_HOOK}\` before a publish.`,
    );
  } else if (naming.length > 1) {
    problems.push(
      `${naming.length} scripts name a suite under ${CLI_TEST_DIR}/ (${naming.join(', ')}). ` +
      `Exactly one may — that is what stops a rename from being applied to one spelling ` +
      `and not the other (#697). Have the others delegate with \`npm run ${CANONICAL_SCRIPT}\`.`,
    );
  } else if (naming[0] !== CANONICAL_SCRIPT) {
    problems.push(
      `The suite is named by "${naming[0]}", not "${CANONICAL_SCRIPT}". Callers delegate to ` +
      `\`npm run ${CANONICAL_SCRIPT}\`, so moving the path elsewhere breaks them silently.`,
    );
  }

  // 2. The publish hook still exists, and reaches the suite by delegation rather than
  //    by spelling the path a second time.
  const hook = pkgScripts[PUBLISH_HOOK];
  if (!hook) {
    problems.push(
      `"${PUBLISH_HOOK}" is missing. It runs the CLI suite independently of the workflow's ` +
      `"Run tests" step, and CLAUDE.md records that this redundancy is deliberate (#680) — ` +
      `it must not be removed in favour of the step.`,
    );
  } else if (namedTestFiles(hook).length > 0) {
    problems.push(
      `"${PUBLISH_HOOK}" spells a suite path itself ("${hook}"). It must delegate — ` +
      `\`npm run ${CANONICAL_SCRIPT}\` — so the two cannot drift apart (#697).`,
    );
  } else if (hook !== CANONICAL_INVOCATION) {
    problems.push(
      `"${PUBLISH_HOOK}" must be exactly \`${CANONICAL_INVOCATION}\`, not "${hook}". ` +
      `Reaching the suite is not the property — ABORTING THE PUBLISH WHEN IT FAILS is, and ` +
      `that lives in the exit status, which no amount of matching can see. ` +
      `\`npm run test:cli || true\` runs the suite and swallows the failure; ` +
      `\`npm run test:cli &\` backgrounds it; \`true || npm run test:cli\` never runs it. ` +
      `All three "reach" it. This hook has exactly one legitimate value (#697).`,
    );
  }

  // 3. `npm test`, the release gate, still runs the CLI suite too. The redundancy is
  //    the point: this is the other half of the pair #680 established.
  const aggregate = pkgScripts.test;
  if (!invokesScript(aggregate, CANONICAL_SCRIPT)) {
    problems.push(
      `"test" ("${aggregate ?? '<missing>'}") does not run "${CANONICAL_SCRIPT}". ` +
      `\`npm test\` is the release gate; #680 is what happens when it skips a suite.`,
    );
  }

  // 4. The operator-side hook is still wired. Without this the check has the same
  //    disarm shape as the defect it guards: delete one line from package.json and the
  //    pre-publish check vanishes on the machine that publishes, while every test here
  //    keeps passing — they exercise the rule module, which is still perfectly intact.
  //    Found by mutating this file's own gate rather than by reading it.
  const preHook = pkgScripts[PRE_HOOK];
  if (!preHook) {
    problems.push(
      `"${PRE_HOOK}" is missing. It is what runs this check on the operator's machine ` +
      `before an npm publish PUT — \`${PUBLISH_HOOK}\` delegates to "${CANONICAL_SCRIPT}", ` +
      `and npm fires the pre-hook there. Without it the gate exists only in CI.`,
    );
  } else if (preHook !== ASSERT_INVOCATION) {
    problems.push(
      `"${PRE_HOOK}" must be exactly \`${ASSERT_INVOCATION}\`, not "${preHook}". ` +
      `Extra arguments are not cosmetic here: \`--root=<somewhere clean>\` points the ` +
      `publish-time check at a tree that is not this repository, and \`|| true\` swallows ` +
      `its verdict. Both leave every gate green.`,
    );
  }

  // 5. Named set versus discovered set, both directions.
  const named = namedTestFiles(pkgScripts[CANONICAL_SCRIPT] ?? '');
  const discovered = discoverTestFiles(repoRoot);

  if (discovered === null) {
    problems.push(
      `${CLI_TEST_DIR}/ does not exist. Whatever "${CANONICAL_SCRIPT}" names cannot be there.`,
    );
  } else {
    for (const file of named) {
      if (!existsSync(resolve(repoRoot, file))) {
        problems.push(
          `"${CANONICAL_SCRIPT}" names ${file}, which does not exist. The publish gate ` +
          `resolves to nothing.`,
        );
      }
    }
    for (const file of discovered) {
      if (!named.includes(file)) {
        problems.push(
          `${file} exists but no script names it, so it never runs. "${CANONICAL_SCRIPT}" ` +
          `names its files explicitly — which fails loudly on a rename, and skips a newly ` +
          `added file in silence (#486). Add it, or delete it.`,
        );
      }
    }
    if (discovered.length === 0) {
      problems.push(
        `${CLI_TEST_DIR}/ holds no ${TEST_FILE_SUFFIXES.join('/')} files. The publish gate would ` +
        `run nothing.`,
      );
    }
  }

  return { problems, naming, hook, named, discovered };
}

/**
 * Locate the repository root from this file, without shelling out to git.
 *
 * `fileURLToPath`, not `new URL(metaUrl).pathname`: the latter yields `/C:/…` on
 * native Windows and leaves `%20` in place for a clone path containing a space.
 * The sibling test file already used `fileURLToPath`, which is the tell — one
 * module in this pair was right and the other was not.
 *
 * `existsSync(join(cur, '.git'))` deliberately accepts `.git` as a FILE, which
 * is what a git worktree has. Subagents in this repo review from worktrees, so
 * a directory-only test would fail exactly where it is most used.
 *
 * There is no fallback. An earlier version returned `resolve(here, '..', '..')`,
 * which was wrong for its only real caller (one level deep, not two) and
 * unreachable whenever the walk works — a dead branch that stated a false
 * assumption about its own depth. Failing loudly is the honest behaviour: a
 * checker that cannot find the repository must not go on to check one.
 */
export function repoRootFromHere(metaUrl) {
  let cur = dirname(fileURLToPath(metaUrl));
  while (cur !== dirname(cur)) {
    if (existsSync(join(cur, 'package.json')) && existsSync(join(cur, '.git'))) return cur;
    cur = dirname(cur);
  }
  throw new Error(
    `could not locate a repository root above ${fileURLToPath(metaUrl)} ` +
    '(looked for a directory holding both package.json and .git).',
  );
}
