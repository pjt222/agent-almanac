/**
 * git-files.js — enumerate a tree with git's ignore rule, not with a hand-rolled one
 * (#872/#868/#830).
 *
 * Three enumerators in this repository walked the filesystem and counted whatever was there.
 * Each was filed as its own defect before anyone noticed they were one class:
 *
 *   #830  `lib/tools-registry.js`     a gitignored `tools/__pycache__` reds a REQUIRED context
 *   #868  the same gate, restated after it bit a second reviewer one sprint later
 *   #872  `generate-readmes.js`       a gitignored `.pyc` is COUNTED, and a gitignored `.py` is
 *                                     NAMED in SECURITY.md as a shipped executable script
 *
 * Both #868 and #872 were produced by the same act one day apart — running a Python file with
 * `importlib` rather than as a script, which writes a `__pycache__/` beside it. The class is not
 * rare. `CLAUDE.md` § Viz Deploy Model already carried the lesson in prose ("walking the
 * filesystem instead of asking git scans 7,177 files instead of 72"), and three enumerators
 * still walked disk. Prose did not transfer it; a module can.
 *
 * ## The rule
 *
 * **The directory listing, minus what git ignores.** The disk is the candidate source and
 * `git check-ignore` is the only filter. Nothing here decides what is ignorable: a hand-rolled
 * matcher would be a fourth glob implementation in a repository that already documents how easy
 * `*`-crosses-`/` is to get wrong (`scripts/check-generated-artifacts.js`: "git is the ruler").
 *
 * Keeping the disk as the candidate source is what preserves the behaviour #830's acceptance
 * criteria protect: the tools gate legitimately catches a NEW tool file whose registry row is
 * missing, and such a file is untracked at the moment its author runs the gate. An index-based
 * listing (`git ls-files` alone) would have turned a defect the gate exists to report into one
 * it cannot see — a silent narrowing, traded for the noisy one being fixed.
 *
 * Measured rather than assumed, on git 2.43 (`check-ignore-probe.sh`, 2026-09-21):
 *
 *   - a TRACKED file matching an ignore pattern (`git add -f`) is NOT reported as ignored, so
 *     it stays in the listing without this module needing its own tracked-set union. `--no-index`
 *     reports it; the default consults the index, which is the behaviour wanted here.
 *   - a directory matching a `build/` pattern IS reported when asked about as `build`, with no
 *     trailing slash — which is how `topLevelEntries` asks.
 *   - nested `.gitignore` files, `!negations` and `.git/info/exclude` are all honoured, because
 *     git is answering.
 *   - exit 1 means "no path matched" and exit 128 means a fatal error, so the two are told apart
 *     by status rather than by parsing a message.
 *
 * ## Why not `git ls-files --cached --others --exclude-standard`
 *
 * That was the first implementation and it is 190x slower here, which matters because it sits on
 * the path of a required context. Measured on this checkout (WSL2, `/mnt/d` is 9p/drvfs), over
 * the 46 call sites `generate-readmes.js` makes:
 *
 *   ls-files --cached --others --exclude-standard   32612 ms
 *   readdirSync + one check-ignore batch per call     3291 ms
 *   readdirSync alone, no ignore rule at all           173 ms
 *
 * The cost is not process spawn — `git rev-parse` measures 36 ms — it is `--others`, which walks
 * and stats the working tree and loads a 13,492-entry index on every call. `check-ignore`
 * consults the ignore rules and the index, and stats nothing. The two implementations were run
 * against each other before this one replaced it: identical answers on 46/46 call sites and 4/4
 * content trees.
 *
 * ## A batch per call, never a spawn per directory
 *
 * `listNonIgnored` walks the whole subtree first and asks about every path in ONE batch. Asking
 * per directory would be ~430 spawns for the four content trees, around 30 s at the ~70 ms a
 * spawn costs on this mount. Batching is correct as well as faster: git reports a path inside an
 * ignored directory as ignored, so pruning the walk is an optimisation, not a requirement.
 *
 * ## A git failure REFUSES; it never reports an empty or unfiltered tree
 *
 * Borrowed from `scripts/check-generated-artifacts.js`, whose comment states the argument:
 * returning `[]` renders a transient git error — `index.lock` contention is real in a repository
 * where sessions share a checkout — as a confident "this tree contains nothing", a wrong answer
 * stated with certainty. Returning the unfiltered listing would be worse still, since it
 * silently restores the defect this module exists to fix. Inside a work tree, a `check-ignore`
 * failure that is not "nothing matched" throws.
 *
 * Outside a work tree the plain listing IS the answer rather than an error: the npm-shipped
 * package has no `.git`, and `skills-inventory.js` is reachable from it. `source` names which
 * of the two answered, so a caller — or a test — can refuse to grade a fixture that quietly
 * took the fallback.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

/** Big enough for a whole-corpus batch: 13,492 paths is well under a MiB. */
const GIT_BUFFER = 1 << 28;

/** root -> boolean. A directory does not stop being a repository during one process. */
const workTreeCache = new Map();

/** Forget what `insideWorkTree` memoised. For tests that `git init` a directory they already asked about. */
export function clearWorkTreeCache() {
  workTreeCache.clear();
}

/**
 * Is `root` inside a git working tree?
 *
 * Asked once per root and memoised, and asked as its own question rather than inferred from a
 * failed `check-ignore`: "there is no repository here" (fall back to the plain listing) and
 * "git broke" (refuse) must not be told apart by matching an error message. False when git is
 * not installed at all, which is the same situation for our purposes — something other than git
 * has to answer.
 */
export function insideWorkTree(root) {
  if (!workTreeCache.has(root)) {
    let inside = false;
    try {
      inside = execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
        cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
      }).trim() === 'true';
    } catch {
      inside = false;
    }
    workTreeCache.set(root, inside);
  }
  return workTreeCache.get(root);
}

/**
 * Which of `paths` does git ignore? One batch, repo-relative paths, files and directories alike.
 *
 * Exit 1 is git's documented "no path matched" and is the ordinary case here, so it is read off
 * the error's `status` rather than treated as a failure. Any other failure throws: reporting an
 * empty set would mean "nothing is ignored", which is exactly the unfiltered listing this module
 * exists to prevent.
 */
function ignoredAmong(root, paths) {
  if (paths.length === 0) return new Set();
  try {
    const out = execFileSync('git', ['check-ignore', '-z', '--stdin'], {
      cwd: root,
      input: `${paths.join('\0')}\0`,
      encoding: 'utf8',
      maxBuffer: GIT_BUFFER,
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    return new Set(out.split('\0').filter(Boolean));
  } catch (error) {
    if (error?.status === 1) return new Set();
    throw new Error(
      `git check-ignore failed in ${root}: ${error.message}. Refusing to report every candidate ` +
      'as non-ignored, which would silently restore the gitignored-artefact defect (#872).',
    );
  }
}

/** Every file under `dir`, repo-relative, recursively; a missing or unreadable directory yields none. */
function walk(root, dir, out = []) {
  let entries;
  try {
    entries = readdirSync(resolve(root, dir), { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(root, rel, out);
    else out.push(rel);
  }
  return out;
}

/**
 * Files under `dir` that git does not ignore, repo-relative and sorted.
 *
 * Recursive, and the whole subtree goes through one `check-ignore` batch.
 *
 * @param {string} root repository root, or any directory when there is no repository
 * @param {string} dir repo-relative directory; a missing one yields no paths
 * @returns {{paths: string[], source: 'git'|'disk'}}
 */
export function listNonIgnored(root, dir) {
  const found = walk(root, dir);
  if (!insideWorkTree(root)) return { paths: found.sort(), source: 'disk' };
  const ignored = ignoredAmong(root, found);
  return { paths: found.filter((rel) => !ignored.has(rel)).sort(), source: 'git' };
}

/**
 * The immediate children of `dir`, by name, split into files and directories.
 *
 * A separate walk rather than a projection of `listNonIgnored`, for two reasons. An EMPTY
 * directory has no file under it to report, and `checkParity`'s third arm exists to report a
 * subdirectory under `tools/` precisely because a directory is representable by no registry row
 * — deriving directories from file paths would have stopped reporting an empty one, a quiet
 * narrowing traded for the noisy fix. And a directory is asked about directly, so `build/` in a
 * `.gitignore` excludes `build` here without every path beneath it having to be enumerated.
 *
 * A symlink lands in `files`, deliberately: the one caller that cares (`checkParity`) has to
 * `lstat` it anyway to tell a symlink from a plain file, and pre-judging it here would take that
 * distinction away from the only code equipped to make it.
 *
 * @returns {{files: string[], dirs: string[], source: 'git'|'disk'}}
 */
export function topLevelEntries(root, dir) {
  let entries;
  try {
    entries = readdirSync(resolve(root, dir), { withFileTypes: true });
  } catch {
    entries = [];
  }
  const source = insideWorkTree(root) ? 'git' : 'disk';
  const ignored = source === 'git'
    ? ignoredAmong(root, entries.map((entry) => `${dir}/${entry.name}`))
    : new Set();

  const files = [];
  const dirs = [];
  for (const entry of entries) {
    if (ignored.has(`${dir}/${entry.name}`)) continue;
    (entry.isDirectory() ? dirs : files).push(entry.name);
  }
  return { files: files.sort(), dirs: dirs.sort(), source };
}
