/**
 * import-graph.js — the static relative-import graph of a JavaScript module, walked from disk.
 *
 * Extracted from `scripts/check-workflow-generator-inputs.js` (#892), where it was module-private
 * and closed over that script's `--root`. It moved so a second consumer can compare what a
 * loader actually reads against what the source statically imports.
 *
 * ## The edges come from V8's own parser (#918)
 *
 * They used to come from a line-start regex over source TEXT, which could not tell code from a
 * comment or a string: `import … from './x.js'` at the start of a line inside a block comment, a
 * template literal or a backslash-continued string was an edge, and so was `export … from` there.
 * On the healer check that only widened a path filter. On the import-side-effects probe, graph
 * membership EXCUSES a module read as the loader's, so a commented-out import followed by a dynamic
 * `import()` of the same module graded `OK` (#915). The regex also missed edges: a second import
 * on the same line was invisible to its anchor. It had been narrowed twice already, each time
 * after a quoted literal in ordinary code was read as an import (#672), which is the history that
 * says a third regex patch would be a third guess.
 *
 * So each module is parsed by `vm.SourceTextModule`, and its edges are the module requests V8
 * records: import declarations and `export … from`, and nothing else — no comment, no string, no
 * regex literal, no dynamic `import()`. A scanner over tokens was ruled out by measurement:
 * `stripCommentsAndStrings` (`scripts/lib/code-tokens.js`) cannot tell a regex literal from a
 * string. A dependency such as acorn was ruled out because `validate-integrity.yml` runs this with
 * no `npm ci` (maintainer decision on #918, 2026-09-24).
 *
 * ## The flag, and why this module supplies it itself
 *
 * `vm.SourceTextModule` exists only under `--experimental-vm-modules`. Measured on Node 18.20.8,
 * 20.20.2, 22.16.0, 24.20.0 and 25.9.0: `undefined` without the flag on every one, a constructor
 * with it on every one.
 *
 * The flag cannot be switched on from inside a running process, so something has to put it on a
 * command line. It is put on THIS module's own child rather than on its callers': when the
 * running process lacks the constructor, `importGraph` re-runs the walk in a child node started
 * with the flag and reads the result back. The callers are a CI step invoking
 * `node scripts/check-workflow-generator-inputs.js` bare, an npm script, a test that spawns that
 * check, the probe, and the probe's own `--verify` children, which it spawns with an explicit
 * argv; a flag on each of those is five places to remember and a sixth to forget, and
 * `NODE_OPTIONS` would switch experimental module support on for everything else that process
 * runs. A caller that already has the flag walks in-process, through the same `walk` the child
 * runs.
 *
 * A child that cannot deliver a graph is an ERROR, never an empty graph: an entry-only set would
 * make the healer check report `1 module(s) reachable … 0 unlisted` over a graph it never read.
 *
 * ## Which field holds the requests
 *
 * `moduleRequests` (objects with a `specifier`) on 24.20.0 and 25.9.0; absent on 22.16.0, which has
 * only `dependencySpecifiers` (strings). `dependencySpecifiers` is present on all five versions
 * above, with no warning. So the walk reads `moduleRequests` where it exists and falls back.
 * Not measured: 22.12.0 (the `engines` floor), any 23.x, and any 22.x or 24.x other than those
 * listed.
 */
import { readFileSync, existsSync, realpathSync } from 'node:fs';
import { dirname, extname, relative, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';

const SELF = fileURLToPath(import.meta.url);
/** The argument that makes this file, run as a script, act as the walk's child. */
const CHILD_ARG = '--import-graph-child';
/** What the child is started with. `--disable-warning` is in every Node inside `engines`. */
const CHILD_FLAGS = ['--experimental-vm-modules', '--disable-warning=ExperimentalWarning'];

/**
 * Every repo-local module reachable from `entry` by static relative imports, as paths relative
 * to `root` with `/` separators, `entry` itself included.
 *
 * Only relative specifiers are followed: a bare specifier is a package, and packages are
 * covered by the `package.json` / `package-lock.json` entries the filter already carries for
 * exactly this reason. A `.json` module is a member and a leaf: it is data, not module source.
 *
 * `root` is a parameter rather than a module-level constant so the walk can serve more than one
 * caller: `check-workflow-generator-inputs.js` passes its `--root`, and a caller outside the
 * repository root passes its own (#892).
 *
 * @param {string} root the directory paths are resolved against and reported relative to
 * @param {string} entry a path relative to `root`
 * @param {Set<string>} [seen] accumulator; returned, so a caller can seed it
 * @returns {Set<string>} the reachable modules
 * @throws {Error} when `entry` or any relative import it reaches does not exist, when a module
 *   does not parse, or when the walk could not run at all
 */
export function importGraph(root, entry, seen = new Set()) {
  if (typeof vm.SourceTextModule === 'function') return walk(root, entry, seen);
  const child = spawnSync(process.execPath, [...CHILD_FLAGS, SELF, CHILD_ARG], {
    input: JSON.stringify({ root, entry, seen: [...seen] }),
    encoding: 'utf8',
  });
  let answer = null;
  try { answer = JSON.parse(child.stdout); } catch { /* stays null, refused below */ }
  if (child.status !== 0 || answer === null || typeof answer !== 'object') {
    const how = child.signal ? `was killed by ${child.signal}` : `exited ${child.status}`;
    throw new Error(`import graph: the parser child (node ${CHILD_FLAGS.join(' ')}) ${how} without a graph: ${failureReason(child)}`);
  }
  if (!answer.ok) throw new Error(answer.message);
  // Into the caller's own set, so the accumulator passed in is the one returned.
  for (const module of answer.seen) seen.add(module);
  return seen;
}

/**
 * The line of a failed child's stderr that says WHY. Not simply the last line: a crashed node
 * ends its stderr with a `Node.js vX.Y.Z` footer, which would make every crash read as a version
 * problem in a module whose design turns on a Node flag. So the first `…Error` line wins (an
 * uncaught Error, a preload that is missing or throws one). Otherwise every line but the footer,
 * joined: that is the child's own one-line refusal or `bad option` as they are, and a thrown
 * non-Error, whose value sits ABOVE a `--trace-uncaught` hint and so is not the last line either.
 */
function failureReason(child) {
  const lines = (child.stderr || '').split('\n').map((line) => line.trim()).filter(Boolean);
  const errorLine = lines.find((line) => /^\w*Error\b/.test(line));
  const allButFooter = lines.filter((line) => !/^Node\.js v\d/.test(line)).join(' | ');
  return errorLine || allButFooter || child.error?.message || 'no output';
}

/** The static module requests of one module's source, as specifiers. */
function requestedSpecifiers(text, rel, absolute) {
  let module;
  try {
    module = new vm.SourceTextModule(text, { identifier: absolute });
  } catch (error) {
    throw new Error(`cannot parse ${rel} as an ES module: ${error.message}`);
  }
  if (Array.isArray(module.moduleRequests)) return module.moduleRequests.map((request) => request.specifier);
  if (Array.isArray(module.dependencySpecifiers)) return module.dependencySpecifiers;
  // Neither field: a Node this was never measured on. An empty list here would be the vacuous pass.
  throw new Error(`import graph: vm.SourceTextModule on node ${process.version} exposes neither moduleRequests nor dependencySpecifiers`);
}

/** The walk itself. Needs `vm.SourceTextModule`, so it runs in-process only under the flag. */
function walk(root, entry, seen) {
  const absolute = resolvePath(root, entry);
  const rel = relative(root, absolute).split('\\').join('/');
  if (seen.has(rel)) return seen;
  if (!existsSync(absolute)) {
    throw new Error(`entry or import does not exist: ${rel}`);
  }
  seen.add(rel);
  if (extname(absolute) === '.json') return seen;
  const text = readFileSync(absolute, 'utf8');
  for (const specifier of requestedSpecifiers(text, rel, absolute)) {
    if (!specifier.startsWith('.')) continue;
    walk(root, relative(root, resolvePath(dirname(absolute), specifier)), seen);
  }
  return seen;
}

/**
 * The child: read `{ root, entry, seen }` on stdin, walk, and print `{ ok, seen }` or
 * `{ ok: false, message }` on stdout. A walk error is an ANSWER, exit 0, so its message reaches the
 * caller verbatim; a non-zero exit is the child failing, and the caller refuses it as such.
 */
function runChild() {
  if (typeof vm.SourceTextModule !== 'function') {
    // Never re-spawn from here: that would recurse for as long as the flag failed to take.
    process.stderr.write(`vm.SourceTextModule is unavailable on node ${process.version} even under --experimental-vm-modules\n`);
    process.exit(3);
  }
  const { root, entry, seen } = JSON.parse(readFileSync(0, 'utf8'));
  let answer;
  try {
    answer = { ok: true, seen: [...walk(root, entry, new Set(seen))] };
  } catch (error) {
    answer = { ok: false, message: error.message };
  }
  process.stdout.write(JSON.stringify(answer));
}

// Only when THIS file is the script and the argument is present: a caller importing the module is
// never the child, and neither is this file run by hand without the argument.
if (process.argv[2] === CHILD_ARG && process.argv[1] && realpathSync(process.argv[1]) === realpathSync(SELF)) {
  runChild();
}
