/**
 * git-files.js — enumerate a tree by asking git, never by walking the filesystem (#872/#868/#830).
 *
 * Three enumerators in this repository walked disk and were each filed as a separate defect
 * before anyone noticed they were one:
 *
 *   #830  `lib/tools-registry.js`     a gitignored `tools/__pycache__` reds a REQUIRED context
 *   #868  the same gate, restated after it bit a second reviewer one sprint later
 *   #872  `generate-readmes.js`       a gitignored `.pyc` is COUNTED, and a gitignored `.py` is
 *                                     NAMED in SECURITY.md as a shipped executable script
 *
 * Both #868 and #872 were produced by the same act one day apart — running a Python file with
 * `importlib` rather than as a script, which writes a `__pycache__/` beside it. The class is not
 * rare and it is not hypothetical. `CLAUDE.md` § Viz Deploy Model already carried the lesson in
 * prose ("walking the filesystem instead of asking git scans 7,177 files instead of 72"), and
 * three enumerators still walked disk. Prose did not transfer it; a module can.
 *
 * ## What "ask git" means here, exactly
 *
 * **Tracked, plus untracked-but-not-ignored.** Not tracked alone. `git ls-files` on its own is
 * NOT a drop-in replacement for the walk, and #830's acceptance criteria say so in as many
 * words: the tools gate legitimately catches a new tool file whose registry row is missing, and
 * such a file is untracked at the moment the author runs the gate. Dropping to `--cached` would
 * have turned a defect the gate exists to report into one it cannot see — a silent narrowing,
 * traded for the noisy one being fixed.
 *
 * So the accept rule is git's own IGNORE rule and nothing else:
 *
 *     git ls-files -z --cached --others --exclude-standard -- <dir>
 *
 * A path git is told to ignore is out of scope. Everything else is in scope, tracked or not.
 *
 * ## Paths git lists that are not in the working tree
 *
 * `--cached` reads the INDEX, so it lists a path that is deleted-not-staged, or hidden by a
 * sparse checkout or `--skip-worktree`. Those are returned in their own `missing` array and
 * never folded into `paths`, because the two consumers want opposite things from them:
 * `checkParity` must still report a registry row whose file was deleted locally (that is the
 * defect it is for), while a consumer that READS each file cannot read one that is not there.
 * Merging them silently would break one caller or the other, in the quiet direction each time.
 *
 * ## A git failure REFUSES; it never returns empty
 *
 * Lifted from `scripts/check-generated-artifacts.js`, whose own comment states the argument:
 * returning `[]` renders a transient git error — `index.lock` contention is real in a repository
 * where sessions share a checkout — as a confident "this tree contains nothing", which is a
 * wrong answer stated with certainty. Inside a work tree, a git failure throws. Outside one,
 * the disk walk is the answer rather than an error, because "no repository" is not a fault:
 * the npm-shipped package has no `.git`, and `skills-inventory.js` is reachable from it.
 *
 * ## Directories, which git does not have
 *
 * An empty directory contributes no path to any git listing, so `topLevelEntries` asks the disk
 * for the immediate children as well and adds back any directory that contributed nothing —
 * unless git ignores it. Without that, fixing the noisy defect would have introduced a quiet
 * one: `checkParity`'s third arm reports a subdirectory under `tools/` because a directory is
 * representable by no registry row, and an empty one would simply have stopped being reported.
 * See that function for the full argument.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, existsSync, lstatSync } from 'node:fs';
import { resolve } from 'node:path';

/** Big enough for the whole corpus: `git ls-files` over this repository is well under a MiB. */
const GIT_BUFFER = 1 << 28;

/**
 * Is `root` inside a git working tree?
 *
 * A separate call rather than an inference from a failed `ls-files`, so that "no repository"
 * (fall back to disk) and "git broke" (refuse) are answered by different questions instead of
 * by guessing at an error message. Also false when git is not installed at all, which is the
 * same situation for our purposes: something other than git has to answer.
 */
export function insideWorkTree(root) {
  try {
    return execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim() === 'true';
  } catch {
    return false;
  }
}

/** Run git, or throw with the command in the message. Never returns a partial answer. */
function git(root, args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: GIT_BUFFER });
  } catch (error) {
    throw new Error(
      `git ${args.join(' ')} failed in ${root}: ${error.message}. Refusing to report an empty ` +
      'tree, which would read as "nothing is there" rather than "this could not be measured".',
    );
  }
}

/**
 * Does this path exist as a directory ENTRY?
 *
 * `lstatSync`, not `existsSync`, and the difference decides a documented behaviour rather than
 * a corner case: `existsSync` follows the link, so a BROKEN symlink reads as absent and would
 * be sorted into `missing`. `checkParity`'s third arm exists to report exactly such an entry —
 * its own comment says "`lstatSync`, so a broken symlink is reported, not thrown on" — and it
 * can only report what this function admits.
 */
function presentOnDisk(abs) {
  try {
    lstatSync(abs);
    return true;
  } catch {
    return false;
  }
}

/** Every file under `dir`, repo-relative, recursively — the fallback outside a checkout. */
function diskWalk(root, dir, out = []) {
  for (const entry of readdirSync(resolve(root, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) diskWalk(root, rel, out);
    else out.push(rel);
  }
  return out;
}

/**
 * Files under `dir` that git does not ignore, repo-relative, sorted, deduplicated.
 *
 * @param {string} root repository root (or any directory, when there is no repository)
 * @param {string} dir repo-relative directory to enumerate; a missing directory yields no paths
 * @returns {{paths: string[], missing: string[], source: 'git'|'disk'}}
 *   `paths` are present in the working tree; `missing` are listed by the index and absent from
 *   it (see the header); `source` names which enumerator answered, so a caller — or a test —
 *   can assert it took the git path rather than passing through the fallback.
 */
export function listNonIgnored(root, dir) {
  if (!insideWorkTree(root)) {
    return {
      paths: existsSync(resolve(root, dir)) ? diskWalk(root, dir).sort() : [],
      missing: [],
      source: 'disk',
    };
  }

  const out = git(root, ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', dir]);
  const listed = [...new Set(out.split('\0').filter(Boolean))].sort();

  const paths = [];
  const missing = [];
  for (const rel of listed) (presentOnDisk(resolve(root, rel)) ? paths : missing).push(rel);
  return { paths, missing, source: 'git' };
}

/**
 * Which of `names` (immediate children of `dir`) does git ignore?
 *
 * One `check-ignore` call for the whole set rather than one per name. Exit 1 means "none of
 * them", which `execFileSync` raises as an error, so the status is read off the error rather
 * than trusted to be zero — and any OTHER failure rethrows, keeping the refuse-never-guess
 * policy this module holds everywhere else. An ignored path that is answered here can never
 * reach a caller, which is the whole point of the module.
 */
function ignoredNames(root, dir, names) {
  if (names.length === 0) return new Set();
  const input = `${names.map((name) => `${dir}/${name}`).join('\0')}\0`;
  try {
    const out = execFileSync('git', ['check-ignore', '-z', '--stdin'], {
      cwd: root, input, encoding: 'utf8', maxBuffer: GIT_BUFFER, stdio: ['pipe', 'pipe', 'ignore'],
    });
    return new Set(out.split('\0').filter(Boolean).map((rel) => rel.slice(dir.length + 1)));
  } catch (error) {
    if (error?.status === 1) return new Set();
    throw new Error(
      `git check-ignore failed in ${root}: ${error.message}. Refusing to report every candidate ` +
      'as non-ignored, which would resurrect the gitignored-artefact defect this module fixes.',
    );
  }
}

/**
 * The immediate children of `dir`, by name, split into files and directories.
 *
 * Derived from the recursive listing rather than from a second git call: a name is a DIRECTORY
 * exactly when something below it is listed, and a FILE when the listing carries the name
 * itself. That classification is about the path shape, so a symlink appears under `files` —
 * deliberately, because the one caller that cares (`checkParity`) has to `lstat` it anyway to
 * tell a symlink from a plain file, and a classification that pre-judged it would take that
 * distinction away from the only code equipped to make it.
 *
 * ## The directory that contributes no path
 *
 * git has no concept of an empty directory, so one contributes nothing to the listing above and
 * would silently disappear from this answer. That is not a corner case here: `checkParity`'s
 * third arm reports a subdirectory under `tools/` precisely because a directory is representable
 * by no registry row, and `tools-registry.test.js` pins an EMPTY one. Dropping it would have
 * been a silent narrowing traded for the noisy bug being fixed — the same shape as the
 * `--cached`-only mistake the header refuses.
 *
 * So the disk is asked for the immediate children too, and any directory that contributed no
 * listed path is added back UNLESS git ignores it. `tools/__pycache__` holding one `.pyc` takes
 * that route: it contributes no path (its content is ignored) and is itself ignored, so it stays
 * out. A non-ignored directory holding only ignored files is reported, exactly as the
 * `readdirSync` this replaced reported it — git is not ignoring that directory.
 *
 * @returns {{files: string[], dirs: string[], missing: string[], source: 'git'|'disk'}}
 */
export function topLevelEntries(root, dir) {
  const { paths, missing, source } = listNonIgnored(root, dir);
  const prefix = `${dir}/`;
  const files = new Set();
  const dirs = new Set();
  for (const rel of paths) {
    if (!rel.startsWith(prefix)) continue;
    const rest = rel.slice(prefix.length);
    const slash = rest.indexOf('/');
    if (slash === -1) files.add(rest);
    else dirs.add(rest.slice(0, slash));
  }

  let children = [];
  try {
    children = readdirSync(resolve(root, dir), { withFileTypes: true });
  } catch {
    children = [];
  }
  const silent = children
    .filter((entry) => entry.isDirectory() && !dirs.has(entry.name) && !files.has(entry.name))
    .map((entry) => entry.name);
  const ignored = source === 'git' ? ignoredNames(root, dir, silent) : new Set();
  for (const name of silent) if (!ignored.has(name)) dirs.add(name);

  return {
    files: [...files].sort(),
    dirs: [...dirs].sort(),
    missing,
    source,
  };
}
