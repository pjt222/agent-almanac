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
 * ## Two rules, because there are two questions
 *
 * `listNonIgnored` answers **"what is in this working tree that git is not ignoring"** — the
 * question a GATE asks, where an untracked new file with no registry row is the defect being
 * looked for. `listTracked` answers **"what is in the committed artifact"** — the question
 * SECURITY.md asks, where the subject is what a release contains.
 *
 * They were one rule until the #874 review measured the premise under it. "A gitignored file
 * does not ship" is FALSE for a local pack: with a `files` array and no `.npmignore`, npm packs
 * the working tree, so `npm pack --dry-run --json` in a tree carrying the #872 artefact shipped
 * the ignored `.py`, the ignored `.pyc` AND an untracked sibling, 621 files in all. The release
 * pack contains none of the three, because CI checks out a commit and there the disk IS the
 * tracked set. So "tracked or not ignored" describes neither artifact: it drops a `.pyc` a local
 * pack ships and keeps an untracked `.py` the release does not. The inventory therefore counts
 * the commit, and the generated sentence says so.
 *
 * ## The ignore rule
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
 * Measured rather than assumed, on git 2.43 (`check-ignore-probe.sh`, 2026-09-21), and
 * independently re-derived by the #874 review over nine ignore mechanisms in one fixture:
 *
 *   - a TRACKED file matching an ignore pattern (`git add -f`) is NOT reported as ignored, so
 *     it stays in the listing without this module needing its own tracked-set union. `--no-index`
 *     reports it; the default consults the index, which is the behaviour wanted here.
 *   - a directory matching a `build/` pattern IS reported when asked about as `build`, with no
 *     trailing slash — which is how `topLevelEntries` asks. So are `cache-noslash`, a nested
 *     `.gitignore`, `.git/info/exclude` and a `tools/gen-*` glob; a root-anchored `/build` is
 *     correctly NOT matched at `tools/build`, and a `!negation` correctly keeps its directory.
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
 * ## It REFUSES rather than answering without the rule
 *
 * There is no disk fallback. An earlier revision fell back to the unfiltered listing whenever
 * git could not be asked, and the #874 review measured what that bought: a `git` that fails the
 * way `safe.directory` does (exit 128, "detected dubious ownership") produced
 * `notPlainFile: ["tools/__pycache__"]` and an inventory naming a gitignored `evil.py` — both
 * defects back, silently, behind a `source: 'disk'` marker no consumer read. The fallback's one
 * named beneficiary did not exist either: `scripts/` is in `REPO_ONLY` and nothing shipped
 * imports this, and a package installed under a consumer's `node_modules/` sits INSIDE their
 * work tree, where `node_modules` is ignored — so the fallback would have answered `[]` with
 * certainty rather than not answering.
 *
 * So every failure that is not git's documented "no path matched" throws, with git's own stderr
 * in the message. Outside a checkout that means a refusal: there is no ignore rule to apply, and
 * `scripts/check-generated-artifacts.js` makes the same choice for the same reason — returning
 * `[]` renders a transient error as a confident "this tree contains nothing", a wrong answer
 * stated with certainty.
 *
 * Errors from the WALK are treated the same way. Only `ENOENT`/`ENOTDIR` — the directory is not
 * there — yield an empty listing; `EACCES` and friends throw. `skills-inventory.js` argues three
 * functions away that an unreadable file rendering as "not there" is the wrong direction in a
 * security document, and git exits 0 with only a `warning: could not open directory` when it
 * hits one, so nothing downstream would refuse on its behalf.
 *
 * ## Four ways `check-ignore` answers something other than "is this ignored"
 *
 * All four are measured (#874 review, git 2.43.0), and the first is why `assertPlainCandidates`
 * exists:
 *
 *   W1  **A candidate is parsed as a PATHSPEC, not as a name.** A literal file `tools/x*y.log`,
 *       which `git status --ignored` lists as `!! tools/x*y.log`, is reported NOT ignored when a
 *       tracked sibling `xay.log` glob-matches it. `--literal-pathspecs` is not the escape: this
 *       command rejects it outright — `fatal: pathspec magic not supported by this command:
 *       'literal'`, exit 128, for ORDINARY candidates too. So a candidate carrying `*`, `?`, `[`
 *       or a leading `:` is refused rather than guessed at. No tracked name under the enumerated
 *       trees carries one today; this is a class, not a live case.
 *   W2  **`core.ignorecase` is `true` on this checkout and `false` on a Linux runner**, so a
 *       candidate differing from a pattern only in case is invisible locally and visible in CI.
 *       "Passes locally" is not a pure function of the tree.
 *   W3  **Per-machine rules reach the answer**: `core.excludesFile` and `.git/info/exclude` are
 *       honoured, because git is honouring them. Inherent to asking git, and stated here so a
 *       "works on my machine" is diagnosed rather than investigated.
 *   W4  **A batch refuses as a unit.** One bad candidate — a path THROUGH a symlink gives
 *       `fatal: pathspec '…' is beyond a symbolic link`, exit 128 — hides the verdict for every
 *       other path in the same call. Acceptable under refuse-never-guess, which is why the
 *       thrown message carries git's stderr: the reason is what an operator needs. The walk
 *       never descends through a symlink (`withFileTypes` reports one as a symlink, not a
 *       directory), so the only way to reach that fatal is a symlinked directory named directly.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

/** Big enough that a whole-corpus batch cannot truncate; the real corpus needs well under 1 MiB. */
const GIT_BUFFER = 1 << 28;

/** The walk reports "nothing here" for these, and only these. Anything else is a real failure. */
const ABSENT = new Set(['ENOENT', 'ENOTDIR']);

/**
 * Which of `paths` does git ignore? One batch, repo-relative paths, files and directories alike.
 *
 * Exit 1 is git's documented "no path matched" and is the ordinary case here, so it is read off
 * the error's `status`. Everything else throws with git's stderr included — the review found the
 * one exit-128 case reachable from a content tree (`fatal: pathspec 'tools/empty' is beyond a
 * symbolic link`) and found the reason discarded, leaving only "Command failed".
 */
/**
 * Refuse a candidate git would read as a pathspec rather than as a name (W1).
 *
 * `*`, `?` and `[` make it a glob; a leading `:` makes it pathspec magic. Measured: such a
 * candidate can come back "not ignored" while `git status --ignored` calls it ignored, and
 * `--literal-pathspecs` is rejected by this command, so there is nothing to fall back to. A
 * refusal names the file; a guess publishes a wrong number.
 */
function assertPlainCandidates(paths) {
  const magic = paths.filter((path) => /[*?[]/.test(path) || path.startsWith(':'));
  if (magic.length === 0) return;
  throw new Error(
    `git check-ignore reads each candidate as a pathspec, and ${magic.length} path(s) here carry `
    + `pathspec metacharacters (\`*\`, \`?\`, \`[\` or a leading \`:\`): ${magic.slice(0, 5).join(', ')}. `
    + 'Measured on git 2.43: such a path can be reported NOT ignored while `git status --ignored` '
    + 'calls it ignored, and `--literal-pathspecs` is rejected by this command. Rename the file, '
    + 'or teach this module how to ask about it — do not let it be guessed at.',
  );
}

function ignoredAmong(root, paths) {
  if (paths.length === 0) return new Set();
  assertPlainCandidates(paths);
  try {
    const out = execFileSync('git', ['check-ignore', '-z', '--stdin'], {
      cwd: root,
      input: `${paths.join('\0')}\0`,
      encoding: 'utf8',
      maxBuffer: GIT_BUFFER,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return new Set(out.split('\0').filter(Boolean));
  } catch (error) {
    if (error?.status === 1) return new Set();
    const stderr = String(error?.stderr ?? '').trim();
    throw new Error(
      `git check-ignore failed in ${root}${stderr ? `: ${stderr}` : `: ${error.message}`}. `
      + 'Refusing to report every candidate as non-ignored, which would silently restore the '
      + 'gitignored-artefact defect (#872). Outside a git checkout there is no ignore rule to '
      + 'apply and this enumeration cannot be performed at all.',
    );
  }
}

/** The immediate children of `dir`; absent means absent, unreadable is a failure. */
function children(root, dir) {
  try {
    return readdirSync(resolve(root, dir), { withFileTypes: true });
  } catch (error) {
    if (ABSENT.has(error?.code)) return [];
    throw error;
  }
}

/** Every file under `dir`, repo-relative, recursively. */
function walk(root, dir, out = []) {
  for (const entry of children(root, dir)) {
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
 * @param {string} root repository root; outside a checkout this throws rather than guessing
 * @param {string} dir repo-relative directory; a missing one yields no paths
 * @returns {string[]}
 */
export function listNonIgnored(root, dir) {
  const found = walk(root, dir);
  const ignored = ignoredAmong(root, found);
  return found.filter((rel) => !ignored.has(rel)).sort();
}

/**
 * Files under `dir` that git TRACKS, repo-relative and sorted.
 *
 * The other question (see the header): what the committed artifact contains, which is what a
 * release is packed from and therefore what SECURITY.md is describing. `--cached` reads the
 * index and stats nothing — 94 ms repo-wide on this mount, against the 700 ms per call that
 * `--others` costs, because `--others` is the part that walks the working tree.
 *
 * A path in the index but not in the working tree (deleted-not-staged, sparse checkout) is
 * listed here, because it is in the artifact. Consumers that READ each file must handle that;
 * the one consumer today counts and names them.
 *
 * @returns {string[]}
 */
export function listTracked(root, dir) {
  try {
    const out = execFileSync('git', ['ls-files', '-z', '--cached', '--', dir], {
      cwd: root, encoding: 'utf8', maxBuffer: GIT_BUFFER, stdio: ['ignore', 'pipe', 'pipe'],
    });
    return [...new Set(out.split('\0').filter(Boolean))].sort();
  } catch (error) {
    const stderr = String(error?.stderr ?? '').trim();
    throw new Error(
      `git ls-files failed in ${root}${stderr ? `: ${stderr}` : `: ${error.message}`}. Refusing to `
      + 'report an empty artifact, which would publish "this tree contains nothing" as a fact.',
    );
  }
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
 * One behaviour change worth knowing, found by the #874 review: if `dir` ITSELF is ignored — a
 * `tools/` excluded wholesale with its files force-added — an empty subdirectory under it is no
 * longer reported, where the `readdirSync` this replaced reported it. That is git's rule applied
 * consistently, and it does not arise here.
 *
 * @returns {{files: string[], dirs: string[]}}
 */
export function topLevelEntries(root, dir) {
  const entries = children(root, dir);
  const ignored = ignoredAmong(root, entries.map((entry) => `${dir}/${entry.name}`));

  const files = [];
  const dirs = [];
  for (const entry of entries) {
    if (ignored.has(`${dir}/${entry.name}`)) continue;
    (entry.isDirectory() ? dirs : files).push(entry.name);
  }
  return { files: files.sort(), dirs: dirs.sort() };
}
