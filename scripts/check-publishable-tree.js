#!/usr/bin/env node
/**
 * check-publishable-tree.js — refuse a pack whose contents would differ from the release (#876).
 *
 * ## The defect
 *
 * With a `files` array and no `.npmignore`, **npm packs the working tree**. It does not honour
 * `.gitignore`. Measured during the #874 review, in a clone carrying the #872 artefact plus an
 * untracked sibling:
 *
 *     packed files: 621
 *     pycache in pack: [".../__pycache__/evil.py", ".../__pycache__/repro.pyc"]
 *     fresh-untracked in pack: [".../fresh-untracked.py"]
 *
 * So a maintainer who has imported a Python asset — which writes a `__pycache__/` beside it — and
 * then runs `npm publish` from that tree ships the bytecode. The RELEASE is unaffected, because
 * `release.yml` packs from an `actions/checkout` of a commit, where the working tree IS the
 * tracked set. This is the local-publish path only, and it is silent: nothing in `npm publish`
 * prints what it decided not to exclude.
 *
 * ## Why not a `files` negation
 *
 * A `files` negation matching `__pycache__` at any depth is the obvious repair. It is spelled
 * here in words rather than as a glob, because a double-star followed by a slash closes this
 * comment block — the same trap that makes `skills/<id>/SKILL.md` unwritable in one.
 * `scripts/lib/skills-inventory.js`'s `assertInterpretable` REFUSES such a pattern, correctly: that module models npm's negations as "trailing
 * slash means prefix, otherwise exact path", npm expands the glob, and the two would disagree in
 * silence — publishing a file count that is wrong in the quiet direction. Teaching the module the
 * pattern is a separate change with its own measurement against `npm pack --dry-run`.
 *
 * ## What this refuses
 *
 * Two classes, named separately because they have different fixes:
 *
 *   IGNORED    a path git ignores, under a shipped directory. `rm` it, or publish from a clean
 *              clone. This is #876's case.
 *   UNTRACKED  a path git does not know about, under a shipped directory. Commit it or remove
 *              it. Same mechanism — npm packs the disk — and the same divergence from the
 *              release, so refusing one without the other would leave half the hole open.
 *
 * `-uall` is the load-bearing flag, and `--ignored=matching` is a precision choice. Measured on
 * git 2.43 over the three shapes this check meets (an ignored file in a tracked directory, a
 * wholly-ignored directory, an untracked file in an untracked one):
 *
 *     with -uall      matching and traditional agree on the VERDICT; they differ only in
 *                     whether a wholly-ignored directory prints as `__pycache__/` or as the
 *                     `.pyc` inside it. Both name something real, so either would refuse.
 *     without -uall   an untracked file collapses to its DIRECTORY (`skills/fresh/`). For the
 *                     `__pycache__` case, traditional prints the non-ignored PARENT
 *                     (`skills/real/references/`) only when that parent holds no tracked file;
 *                     with a tracked sibling beside it, every form prints the `__pycache__/`
 *                     entry itself. An earlier revision of this comment stated the parent case
 *                     unconditionally and it does not reproduce for a tracked parent
 *                     (#879 review, S3). Still refuses either way; can name the wrong thing to
 *                     delete.
 *
 * So the fixture pins the reported PATH, not just the refusal: an operator who is told a
 * directory when a single file is the problem goes looking in the wrong place. An earlier
 * version of this comment claimed `matching` was what listed a nested ignored file
 * individually; a surviving mutant showed no test could tell the two apart, and the measurement
 * showed the claim was false with `-uall` set.
 *
 * ## Where it runs
 *
 * `prepack`, so it fires on `npm publish` and `npm pack` and NOT in a consumer's tree —
 * `prepack` is not one of `skills-inventory.js`'s `INSTALL_HOOKS` (`preinstall`, `install`,
 * `postinstall`, `prepare`), and SECURITY.md's claim that nothing here executes on install stays
 * true. Run it directly — `node scripts/check-publishable-tree.js`, or `npm run
 * check:publishable-tree` — to ask the same question by hand. There is no `--check` flag: an
 * earlier version of this comment named one that was never implemented (#879 review, S5), and
 * the script takes no arguments at all.
 *
 * Three consequences of declaring the hook, all measured in that review and none of them
 * reasons not to:
 *
 *   - `npm pack --ignore-scripts` bypasses it entirely, exit 0 with the contaminants listed.
 *     Inherent to a script hook, and worth knowing because `--ignore-scripts` is the common
 *     reflex when a hook fails.
 *   - Hook ORDER on publish is `prepublishOnly` -> `prepack` -> `prepare` -> `postpack`. So an
 *     artefact built by a future `prepare` would land AFTER this check and be neither seen nor
 *     refused. There is no `prepare` here today.
 *   - Declaring `prepack` at all changes CONSUMER-side behaviour for a git install, though the
 *     script never runs there: pacote's `lib/git.js` treats `prepack` as one of the keys that
 *     make a clone worth preparing, so `npm install pjt222/agent-almanac` now runs a nested
 *     `npm install --force` inside the temp clone before packing. Measured across twelve install
 *     shapes: the hook itself fired on `npm pack`, `npm publish` and `npm pack <dir>`, and on
 *     none of the consumer installs.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { isExcludedFromPackage, shippedEntries } from './lib/skills-inventory.js';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The `files` entries, split into what npm packs FROM and what it carves back out.
 *
 * Both halves are needed. Scanning only the inclusions refuses content under a NEGATED path —
 * `skills/_template/` here — which npm never packs, so the guard would block a publish over a
 * file that could not reach the tarball (#879 review, S2). A pathspec cannot express this:
 * `:(exclude)` drops matching paths from the listing, and the ignored-DIRECTORY entry git
 * reports for a wholly-ignored tree is not itself matched by the exclusion, so it survives.
 * Filtering the results is what works, with the same prefix rule
 * `skills-inventory.js`'s `isExcludedFromPackage` uses — trailing slash means prefix,
 * otherwise exact path — because npm's negations are root-anchored.
 */
export function shippedPaths(root = ROOT) {
  // IMPORTED, not re-implemented. `shippedEntries` already returns exactly this shape and runs
  // `assertInterpretable` on the way — which is the half that matters: a `files` array in one of
  // the two shapes npm and this matcher disagree about now refuses HERE, at prepack, rather than
  // only where check-readmes happens to run. A second copy of the split was what let the guard
  // and the inventory hold different opinions about the same manifest (#879 round 2, S1).
  return shippedEntries(root);
}

/**
 * Names npm excludes from every pack regardless of `files`, measured rather than listed from
 * memory (#879 review, N2): with these present, `npm pack --dry-run --json` did not list them.
 * Reporting one as "would be packed" is a false statement, and it blocks a publish over a
 * macOS Finder dropping or a stray `.npmrc` that could never ship.
 */
// NOT `node_modules`: the same review measured `skills/real/node_modules/dep/index.js` present in
// the pack listing, so a nested one under a shipped directory DOES ship and the guard's refusal
// of it is real rather than redundant with npm's root exclusion (N1).
const NPM_ALWAYS_EXCLUDES = new Set([
  '.npmrc', '.DS_Store', '.git', '.gitignore', '.npmignore',
  'npm-debug.log', '.lock-wscript', 'CVS', '.svn', '.hg',
]);

/** Patterns npm drops that a name set cannot express; each measured absent from the pack. */
const NPM_ALWAYS_EXCLUDED_PATTERNS = [/^\._/, /^\..*\.swp$/, /^\.wafpickle-/, /\.orig$/];

function npmAlwaysExcludes(path) {
  return path.split('/').some((segment) => NPM_ALWAYS_EXCLUDES.has(segment)
    || NPM_ALWAYS_EXCLUDED_PATTERNS.some((pattern) => pattern.test(segment)));
}

/**
 * Does a `files` negation carve this path back out, so npm never packs it?
 *
 * The rule is IMPORTED, not re-typed: `skills-inventory.js` already encodes npm's negation
 * semantics (trailing slash means prefix, otherwise exact path, root-anchored) and carries the
 * measurements that justify them. Two copies of an accept rule is the drift this repository
 * writes about in `CLAUDE.md` § Excluding a Template — and a re-typed copy is what the #879
 * review asked to be replaced by the export.
 *
 * A `!!` directory line arrives as `skills/_template/__pycache__/`, so the prefix test catches
 * content under a negated directory without the ancestors needing to be enumerated here.
 */
function carvedOut(path, negations) {
  return isExcludedFromPackage(path, negations);
}

/**
 * Paths under the shipped inclusions whose working-tree state differs from the commit.
 *
 * Returns `{ ignored, untracked, modified }`, all sorted, with anything a `files` negation
 * carves back out removed — npm never packs those. A git failure THROWS rather than returning
 * empty: an empty answer here reads as "the tree is clean", which is the publish this check
 * exists to refuse.
 */
export function divergentPaths(root = ROOT, shipped = shippedPaths(root)) {
  const { included, negations } = shipped;
  // REFUSE rather than pass. An absent `files` array returned "OK … a pack here matches the
  // commit" while npm packed three untracked files, measured in the #879 review (N7) — a second
  // fail-open in the same file as B1, and in exactly the configuration where npm honours the
  // root .gitignore for you and only this check could catch the UNTRACKED class.
  if (included.length === 0) {
    throw new Error(
      `package.json in ${root} declares no \`files\` array, so this check cannot tell which paths `
      + 'npm would pack. Add one, or scan the whole tree deliberately — do not let an empty '
      + 'inclusion list read as a clean tree.',
    );
  }
  let out;
  try {
    out = execFileSync(
      'git',
      // -z, because porcelain QUOTES a path carrying a space or a non-ASCII byte, and that
      // quoting reached the report verbatim before (#879 review, N5). NUL-separated output is
      // unquoted, and the parse below splits on it.
      // --no-renames, and the reason is a carve-out that was reachable with THIS repository's
      // own files array. Without it a staged rename is one record whose path field is
      // `old -> new` (or, under -z, a pair), and a rename OUT of a negated directory — the
      // seed-a-skill-from-`skills/_template/` move — could be tested against the old side and
      // carved out whole, shipping the new file unrefused (#879 round 2). -z already splits the
      // pair so the NEW path is what is tested; --no-renames removes the question entirely by
      // emitting a plain D/A pair, and makes the answer independent of an operator's
      // status.renames or diff.renames config, which can otherwise emit `C ` copy lines.
      ['status', '--porcelain', '-z', '--no-renames', '--ignored=matching', '-uall', '--', ...included],
      { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] },
    );
  } catch (error) {
    const stderr = String(error?.stderr ?? '').trim();
    throw new Error(
      `git status failed in ${root}${stderr ? `: ${stderr}` : `: ${error.message}`}. Refusing to `
      + 'report a clean tree, which is exactly the publish this check exists to refuse.',
    );
  }


  const ignored = [];
  const untracked = [];
  const modified = [];
  // path -> porcelain code, so the report prints what git said and picks the remedy that fits,
  // rather than stamping ` M` on a deletion the pack does not carry at all (#879 round 2, S5).
  const codes = {};
  // NUL-separated because of -z. A rename entry emits its ORIGIN as a second record, which is
  // not a path npm would pack; the code check below keeps only records that begin with a status
  // pair, so an origin record falls through rather than being reported.
  for (const record of out.split('\0')) {
    if (record.length < 4 || record[2] !== ' ') continue;
    const code = record.slice(0, 2);
    const path = record.slice(3);
    if (carvedOut(path, negations)) continue;
    if (npmAlwaysExcludes(path)) continue;
    if (code === '!!') ignored.push(path);
    else if (code === '??') untracked.push(path);
    // Every other porcelain code is a TRACKED path whose working-tree content differs from the
    // commit — modified, staged, deleted, renamed. npm packs the working copy, so the pack
    // carries those bytes and the release does not. Measured in the #879 review: 14 bytes packed
    // against 7 committed, while this check said "a pack here matches the commit".
    else {
      modified.push(path);
      codes[path] = code;
    }
  }
  return { ignored: ignored.sort(), untracked: untracked.sort(), modified: modified.sort(), codes };
}

/** The report, as printable lines. Pure, so a test can assert the wording without a fixture. */
export function report({ ignored, untracked, modified = [], codes = {} }) {
  if (ignored.length === 0 && untracked.length === 0 && modified.length === 0) {
    return ['OK: every shipped path is tracked and unmodified; a pack here matches the commit.'];
  }
  const lines = [];
  const say = (label, marker, paths, remedy) => {
    if (paths.length === 0) return;
    lines.push(`REFUSED: ${paths.length} ${label} path(s) under a shipped directory would be packed ${remedy}:`);
    for (const path of paths.slice(0, 20)) lines.push(`  ${marker} ${path}`);
    if (paths.length > 20) lines.push(`  … and ${paths.length - 20} more`);
  };
  say('IGNORED', '!!', ignored, 'and are not in the commit — remove them, or pack from a clean clone');
  say('UNTRACKED', '??', untracked, 'and are not in the commit — commit or remove them');
  // Split by what git actually reported, because one remedy does not fit them all and the old
  // wording was FALSE for half of them: a deleted or typechanged path is not "packed with its
  // working-tree bytes" — the pack simply LACKS a file the commit has, and npm drops a symlink
  // silently (#879 round 2, S5). The marker is git's own code, not a stamped ` M`.
  //
  // The porcelain code is TWO COLUMNS — index, then worktree — and what npm packs is the
  // WORKTREE. Trimming the pair and comparing it whole read only the single-column codes, so
  // `AD` (staged add, then `rm`) and `MD` (staged edit, then `rm`) were filed under MODIFIED
  // "with their WORKING-TREE bytes" for paths npm packs no bytes of at all. Measured on git
  // 2.43 with ` T`, `AD` and `MD` present under a shipped directory: `npm pack --dry-run`
  // listed package.json alone (#879 round 3, SF1).
  const raw = (path) => codes[path] ?? '';
  // Every unmerged code, `DD` included — both sides deleted is a conflict, not an absence, and
  // it fell through to MODIFIED before. Tested FIRST, so the worktree column below cannot claim
  // `DD`, `DU` or `UD` from it.
  const UNMERGED_CODES = new Set(['DD', 'AU', 'UD', 'UA', 'DU', 'AA', 'UU']);
  const unmerged = modified.filter((path) => UNMERGED_CODES.has(raw(path)));
  // Absent in the WORKTREE: a `D`/`T` worktree column under any index column, plus `D `/`T `,
  // where the worktree agrees with an index that has already dropped or retyped the path.
  const gone = (column) => column === 'D' || column === 'T';
  const absent = modified.filter((path) => !unmerged.includes(path)
    && (gone(raw(path)[1]) || (raw(path)[1] === ' ' && gone(raw(path)[0]))));
  const edited = modified.filter((path) => !absent.includes(path) && !unmerged.includes(path));
  for (const [label, paths, remedy] of [
    ['ABSENT-OR-RETYPED', absent, 'so the pack LACKS a file the commit has — restore it, or commit the removal'],
    ['UNMERGED', unmerged, 'and a conflicted file would be packed with its markers — resolve it'],
    ['MODIFIED', edited, 'with their WORKING-TREE bytes, not the committed ones — commit or revert them'],
  ]) {
    if (paths.length === 0) continue;
    lines.push(`REFUSED: ${paths.length} ${label} path(s) under a shipped directory ${remedy}:`);
    for (const path of paths.slice(0, 20)) lines.push(`  ${codes[path] ?? '??'} ${path}`);
    if (paths.length > 20) lines.push(`  … and ${paths.length - 20} more`);
  }
  lines.push('');
  lines.push('npm packs the WORKING TREE under a `files` array — it does not honour .gitignore —');
  lines.push('so this pack would differ from what CI publishes, which packs a commit. Remove the');
  lines.push('paths above, commit them, or publish from a clean clone.');
  return lines;
}

// `pathToFileURL`, never a template literal: `import.meta.url` percent-encodes where
// `process.argv[1]` does not, so at a path containing a space the two never compare equal, the
// body below never runs, and the script exits 0 having checked nothing. Measured at a clone
// under `/tmp/…/with space`: exit 0 with a gitignored `.pyc` staged to ship, against exit 1 at
// a plain path — a fail-open in a guard, which is the one direction a guard must not fail
// (#879 review, B1).
// `process.argv[1] &&` first: it is undefined when this module is imported from a context with
// no script path — `node --input-type=module -e`, a REPL, some loaders — and `pathToFileURL`
// THROWS `ERR_INVALID_ARG_TYPE` on undefined rather than returning something that fails to
// match. The #879 review's suggested fix carried this guard and an earlier commit here typed a
// variant without it, turning an importable module into one that crashes on import.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const lines = report(divergentPaths());
  const refused = lines.some((line) => line.startsWith('REFUSED:'));
  for (const line of lines) (refused ? console.error : console.log)(line);
  process.exitCode = refused ? 1 : 0;
}
