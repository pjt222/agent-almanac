#!/usr/bin/env node
/**
 * repo-guard.js — prove a multi-agent run left the repository untouched.
 *
 *   npm run guard:snapshot   # before the fan-out
 *   npm run guard:verify    # after it returns
 *   npm run guard:release   # ... and drop the snapshot
 *
 * and, when the arming session itself moved HEAD for a reason it can name:
 *
 *   npm run guard:rebaseline -- --accept=<sha>
 *
 * The npm scripts are the supported entrypoint, and every message this tool
 * prints names them rather than the raw `node scripts/repo-guard.js …` form:
 * advice that is not copy-pasteable at the moment something broke is advice that
 * does not get followed. (`--release` in particular cannot cross `npm run` —
 * npm swallows it as its own config — which is why it has a script of its own.)
 *
 * Exit 0 = the repository is exactly as it was, in everything compared below (and
 * "What it does NOT cover" says what is not). Exit 1 = it moved, with the
 * difference printed. Exit 2 = the question could not be answered honestly.
 *
 * ## Why this exists (#493)
 *
 * During an adversarial review of #486, a subagent wrote a test fixture into the
 * working repository and committed it. It sat on the branch HEAD for ten minutes
 * and would have gone out on the next push.
 *
 * The prompt had told it, specifically, to build fixtures under `/tmp`. It tried
 * to. Two parallel agents had each written `$SCRATCH/fixture.sh` — the same path
 * in the shared scratchpad — and the second clobbered the first, so the victim's
 * `bash fixture.sh /tmp/nf-skipwt` ran a script that ignored its argument. The
 * directory was never created, its `cd "$1"` failed, execution continued anyway,
 * and every following relative path resolved against the repository.
 *
 * The lesson is that the containment cannot be a sentence in a prompt, because
 * the agent complied with the sentence. It has to be a check that runs.
 *
 * ## Why `git status` is not that check
 *
 * `git status` cannot see an agent that COMMITTED — the tree reads clean
 * afterwards, and every dirty-tree check passes. In the real incident it was a
 * stale generated README that gave the write away, which is luck, not a control.
 *
 * So this compares five things, each corresponding to a way a change can hide:
 *
 *   HEAD            a stray commit (the tree looks clean afterwards)
 *   branch          a checkout that moved the working branch
 *   status lines    files appearing, vanishing, or changing state
 *   file contents   a stray write to a file that was ALREADY modified. Comparing
 *                   status lines alone misses this entirely: ` M CLAUDE.md` reads
 *                   identical before and after the overwrite. This repo is
 *                   normally mid-edit, so that is the common case, not the
 *                   exotic one.
 *   index flags     `git update-index --skip-worktree`, which the incident really
 *                   ran, and which makes git report a modified file as clean from
 *                   then on — poisoning every later check
 *
 * ## What it does NOT cover
 *
 * Ignored paths. `git status --porcelain` omits them by design and walking them
 * would mean hashing `node_modules`. A stray write to a gitignored file (in this
 * repo, `CONTINUE_HERE.md`) is invisible here. Everything else under the working
 * tree is compared by content.
 *
 * Refs other than two. History is read through HEAD, and through the branch the
 * snapshot was on once HEAD has left it (#920 review). A commit on any other branch,
 * made while HEAD is back where it was by the time `verify` runs, reads as unchanged;
 * so does a commit made on a detached HEAD and then left, which only the reflog keeps.
 *
 * ## Failing closed
 *
 * A guard that answers "unchanged" when it could not look is worse than none.
 * Every uncertainty about the snapshot or HEAD's own history exits 2, never 0: a
 * missing, unreadable, or foreign snapshot, a git invocation that fails, or an
 * unrecognised argument. The branch HEAD left is read where it can be; where it
 * cannot (a detached snapshot, a branch deleted since), the output says it was not
 * checked, and `rebaseline` refuses only an orphan move over it (#920 review). The
 * refs no one reads are under "What it does NOT cover".
 *
 * Two rules keep a second run from laundering the first run's damage into a
 * green, which a single global snapshot slot otherwise invites:
 *
 *   - `snapshot` REFUSES to overwrite an existing snapshot (`--force` to
 *     override). Re-arming mid-run would rebaseline the damage as the new normal.
 *   - `verify` KEEPS the snapshot unless `--release`. Consuming it by default
 *     silently disarms every later check — and a stale snapshot can only ever
 *     over-report, never under-report, so keeping is the safe direction.
 *
 * ## The legitimate mover (#688)
 *
 * Both rules above assume a moved HEAD is UNEXPLAINED. That is right for the
 * case the tool exists for and wrong for the commonest event in any long run:
 * the arming session merges its own branch, or switches branches, and then has
 * nowhere to go but `snapshot --force` — which the text above warns against in
 * the same breath, and which leaves a transcript indistinguishable from a
 * careless rebaseline over an agent's commit.
 *
 * `rebaseline` is that exit. It costs exactly the three steps of judgement the
 * honest sequence already required — enumerate the delta, confirm the commits
 * are yours, record that you did — with the difference that the tool performs
 * them instead of assuming them. It refuses without an `--accept=<sha>` equal to
 * the current HEAD, and it refuses ANY worktree, content, or index-flag change,
 * because "I moved HEAD deliberately" is a claim about history and says nothing
 * about file contents.
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const SNAPSHOT_NAME = 'repo-guard.json';
/**
 * Bump whenever `captureState()` changes shape. A snapshot written by an older
 * build cannot be compared against a newer capture — the first time that
 * happened the guard said `snapshot is missing 'contents'`, which is accurate
 * and useless. Refusing is right; naming the reason is what makes it actionable.
 */
const FORMAT_VERSION = 3;
/** Sentinel for a repository with no commits yet. */
const UNBORN = '(unborn)';
// How the baseline reads the branch and the index flags, and so the commands the advice names for
// each: a command the guard does not read with can print nothing where the guard found a change.
// `git branch --show-current` prints nothing on a detached HEAD (#907 round 1), and this prints
// `HEAD`. The legend sits on its own line so the command pastes bare: under zsh's default,
// where interactive comments are off, a trailing `#` is not a comment, so its words became
// arguments to the command and a `;` in it started a second one (measured on #907).
const BRANCH_ARGS = ['rev-parse', '--abbrev-ref', 'HEAD'];
// The fallback read, for the one state the primary cannot answer: on an unborn branch there is no
// commit for `--abbrev-ref` to resolve, so it exits 128, both captures read `(unborn)`, and a
// branch switch passed as "unchanged" (#908). `symbolic-ref` reads the name HEAD points at, commit
// or not. It is not the primary because it fails on a detached HEAD, where the primary prints
// `HEAD`. So which command prints what the guard read depends on the state, and the advice names
// the one for the state the repository is in now: the fallback when HEAD is unborn, the state in
// which the primary fails (measured on git 2.43; `repo-guard.test.js` asserts both premises).
// On a broken ref (garbage in `refs/heads/<b>`) both fail, and so does the command named; no
// command prints a branch there, and the finding line then reads `-> (unborn)` (#920 review, F2).
const UNBORN_BRANCH_ARGS = ['symbolic-ref', '--short', 'HEAD'];
const branchCommandFor = (state) => `git ${(state.head === UNBORN ? UNBORN_BRANCH_ARGS : BRANCH_ARGS).join(' ')}`;
const INDEX_FLAGS_ARGS = ['ls-files', '-v'];
const INDEX_FLAGS_COMMAND = `git ${INDEX_FLAGS_ARGS.join(' ')}`;
const INDEX_FLAGS_LEGEND = 'run at the repository root; a tag other than H: S is skip-worktree, ' +
  'M is unmerged, lowercase is assume-unchanged';
// Named in the npm form because `die()` appends this to every argument error,
// and a usage block contradicting the rest of the tool's advice is how a caller
// ends up running the one form that swallows its flags. Flags need `--` to cross
// `npm run` at all.
const USAGE = `Usage:
  npm run guard:snapshot              record HEAD, branch, status, contents, index flags
  npm run guard:verify                compare the repository against that record
  npm run guard:release               verify, then drop the snapshot if unchanged
  npm run guard:rebaseline            re-arm after YOUR OWN run moved HEAD (a merge,
                                      a branch switch), naming the commits it accepts

  npm run guard:snapshot -- --force   replace an existing snapshot (refused by default)
  npm run guard:snapshot -- --quiet   suppress the success line (also valid on verify and rebaseline)
  npm run guard:rebaseline -- --accept=<sha> [--reason="..."]
                                      accept the printed move; <sha> must equal the
                                      current HEAD, so the transcript records WHICH
                                      move was accepted

  (flags must follow \`--\`; npm swallows them otherwise. Valued flags use \`=\`, not a
   space, so the value cannot be mistaken for the command.)`;

function die(message, code = 2) {
  console.error(`repo-guard: ${message}`);
  process.exit(code);
}

// ── arguments: default-deny, and per-command, so a flag that means nothing to
// this subcommand is an error rather than a silently narrower check.
const argv = process.argv.slice(2);
const FLAGS_FOR = {
  snapshot: ['--force', '--quiet'],
  verify: ['--release', '--quiet'],
  rebaseline: ['--quiet'],
};
/**
 * Flags that take a value, spelled `--flag=value`.
 *
 * The `=` form is required rather than a space-separated one because the
 * command is found with `argv.find(a => !a.startsWith('-'))`: a bare value would
 * be a candidate for the command name, and `rebaseline --accept 255114999` would
 * parse fine only by the accident of argument order.
 */
const VALUED_FLAGS_FOR = { rebaseline: ['--accept', '--reason'] };

const command = argv.find((a) => !a.startsWith('-'));
if (!command) die(`no command given.\n${USAGE}`);
if (!FLAGS_FOR[command]) die(`unknown command '${command}'.\n${USAGE}`);
const valued = VALUED_FLAGS_FOR[command] ?? [];
const values = {};
for (const arg of argv) {
  if (arg === command) continue;
  if (FLAGS_FOR[command].includes(arg)) continue;
  const named = valued.find((flag) => arg.startsWith(`${flag}=`));
  if (named) {
    values[named] = arg.slice(named.length + 1);
    continue;
  }
  // A valued flag given without its `=value` is its own message: the caller
  // reached for the right flag and would otherwise be told only "unknown
  // argument", which reads as "this flag does not exist".
  if (valued.includes(arg)) {
    die(`'${arg}' needs a value, spelled '${arg}=<value>'.\n${USAGE}`);
  }
  die(`unknown argument '${arg}' for '${command}'.\n${USAGE}`);
}
const QUIET = argv.includes('--quiet');

/**
 * Run git from the repository ROOT, never the caller's cwd.
 *
 * `git ls-files` is cwd-scoped: run from a subdirectory it lists only that
 * subtree, so a `skip-worktree` bit set elsewhere would be invisible and the
 * guard would silently cover less than it claims.
 */
function git(args, { cwd = undefined, allowFailure = false } = {}) {
  const result = spawnSync('git', args, { encoding: 'utf8', cwd, maxBuffer: 512 * 1024 * 1024 });
  if (result.error) die(`could not run git: ${result.error.message}`);
  if (result.status !== 0) {
    if (allowFailure) return null;
    die(`git ${args.join(' ')} failed (exit ${result.status}): ${(result.stderr || '').trim()}`);
  }
  return result.stdout;
}

/**
 * Is `maybeAncestor` an ancestor of `descendant`? `true` / `false` / `'unknown'`.
 *
 * `git()` discards the exit status under `allowFailure`, so it cannot tell exit 1
 * ("no") from exit >= 128 ("could not look"). Every other caller only needs the
 * output; this one is the difference between a claim and a guess.
 */
function ancestry(maybeAncestor, descendant) {
  const result = spawnSync('git', ['merge-base', '--is-ancestor', maybeAncestor, descendant],
    { encoding: 'utf8', cwd: TOPLEVEL });
  if (result.error) return 'unknown';
  if (result.status === 0) return true;
  if (result.status === 1) return false;
  return 'unknown';
}

const TOPLEVEL = git(['rev-parse', '--show-toplevel']).trim();
const GIT_DIR = git(['rev-parse', '--absolute-git-dir']).trim();
const SNAPSHOT_PATH = join(GIT_DIR, SNAPSHOT_NAME);
const atRoot = (args) => git(args, { cwd: TOPLEVEL });

// Full digest. Truncating to 64 bits saved nothing that matters — only changed
// and untracked paths are hashed, so the snapshot stays small either way — while
// narrowing the margin on the one comparison the whole tool rests upon.
const sha = (buffer) => createHash('sha256').update(buffer).digest('hex');

/**
 * Hash of every path git reports as changed or untracked.
 *
 * This is what makes a stray write to an already-dirty file visible. `-uall`
 * lists untracked files individually rather than collapsing a directory to one
 * entry, so a new file inside an already-untracked directory is caught too.
 */
function captureState() {
  // `-z` rather than line-splitting. Without it git applies `core.quotePath`,
  // which C-quotes any path containing a byte >= 0x80 using OCTAL escapes —
  // ` M "i18n/ja/\350\252\255\343\201\277.md"`. JSON has no octal escape, so
  // parsing that back with JSON.parse threw, the path stayed quoted, the file
  // was not found on disk, and it was skipped from the content map in silence.
  // In a repository whose entire i18n tree is non-ASCII that is not an edge
  // case: a clobbered `i18n/ja/読み.md` verified as "unchanged", exit 0.
  // `-z` emits raw bytes with NUL separators and no quoting at all.
  const parts = atRoot(['status', '--porcelain', '-uall', '-z']).split('\0');
  const entries = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    const code = part.slice(0, 2);
    entries.push({ code, path: part.slice(3) });
    // Under -z a rename or copy is TWO fields: the new path, then the original.
    if (code[0] === 'R' || code[0] === 'C') i++;
  }

  const status = entries.map((e) => `${e.code} ${e.path}`).sort();

  const contents = {};
  for (const { path } of entries) {
    const abs = join(TOPLEVEL, path);
    try {
      // Every status-listed path gets an entry, including ones with no readable
      // content. Skipping them instead would make a path that STOPS being a
      // regular file — a file swapped for a symlink, say — vanish from the map
      // while its status line stayed identical, and so go unreported.
      if (!existsSync(abs)) contents[path] = '(absent)';
      else if (!statSync(abs).isFile()) contents[path] = '(not-a-regular-file)';
      else contents[path] = sha(readFileSync(abs));
    } catch (error) {
      contents[path] = `unreadable:${error.code || 'error'}`;
    }
  }

  // `git ls-files -v` marks anything not plainly cached with a tag other than
  // 'H'. 'S' is skip-worktree; a lowercase tag is assume-unchanged. Both make
  // git report a modified file as clean, so they must be part of the baseline —
  // otherwise setting one is itself an undetectable change. 'M' is an unmerged
  // path, so a conflicted merge lands here too (#887).
  const indexFlags = atRoot(INDEX_FLAGS_ARGS)
    .split('\n')
    .filter((line) => line && line[0] !== 'H')
    .sort();

  // A repository with no commits yet has neither a resolvable HEAD nor an
  // abbrev-ref for it. That is a legitimate state to snapshot, not an error —
  // dying here would make the guard unusable on a fresh fixture.
  //
  // The branch falls back to `symbolic-ref`, which names an unborn branch (#908). A snapshot an
  // older build armed on an unborn repository recorded `(unborn)` there, so its first verify under
  // this build reports a branch change that did not happen. That over-reports, the direction this
  // tool accepts, and it needs no format bump: the shape of the capture did not change.
  const head = git(['rev-parse', 'HEAD'], { cwd: TOPLEVEL, allowFailure: true });
  const branch = git(BRANCH_ARGS, { cwd: TOPLEVEL, allowFailure: true })
    ?? git(UNBORN_BRANCH_ARGS, { cwd: TOPLEVEL, allowFailure: true });
  // The full ref HEAD names, for reading that branch later. `branch` above is for display, and
  // `--abbrev-ref` spells it `heads/<b>` or `refs/heads/<b>` when a tag shares the name, so
  // parsing it back found no branch and reported a live one as deleted (#920 rounds 2 and 3).
  // null on a detached or broken HEAD. An extra field, not a new shape: nothing compares it, an
  // older build ignores it, and a snapshot without it falls back to `refs/heads/<branch>`.
  const headRef = git(['symbolic-ref', '-q', 'HEAD'], { cwd: TOPLEVEL, allowFailure: true });

  return {
    toplevel: TOPLEVEL,
    head: head === null ? UNBORN : head.trim(),
    branch: branch === null ? UNBORN : branch.trim(),
    headRef: headRef === null ? null : headRef.trim(),
    status,
    contents,
    indexFlags,
  };
}

function reportList(label, before, after) {
  const gone = before.filter((x) => !after.includes(x));
  const added = after.filter((x) => !before.includes(x));
  if (!gone.length && !added.length) return false;
  console.error(`\n  ${label}:`);
  for (const entry of added) console.error(`    + ${entry}`);
  for (const entry of gone) console.error(`    - ${entry}`);
  return true;
}

/**
 * Write a baseline, failing closed if it cannot be recorded.
 *
 * `provenance` is merged into the file. `snapshot` records none; `rebaseline`
 * records what it accepted, so a later reader can tell an arming from a
 * re-arming — the distinction `--force` erases (#688).
 */
function writeSnapshot(state, provenance = {}) {
  try {
    writeFileSync(
      SNAPSHOT_PATH,
      JSON.stringify(
        { formatVersion: FORMAT_VERSION, ...state, takenAt: new Date().toISOString(), ...provenance },
        null,
        2,
      ) + '\n',
      'utf8',
    );
  } catch (error) {
    // An uncaught throw here exits 1, which in this tool's vocabulary means
    // "the repository changed" — the fail-closed contract requires that an
    // inability to record the baseline reads as uncertainty, not as a verdict.
    die(`could not write the snapshot to ${SNAPSHOT_PATH}: ${error.message}\n` +
      'The run is NOT guarded. Fix this before fanning out.');
  }
}

if (command === 'snapshot') {
  // Refusing to clobber is what stops a nested or concurrent run from
  // rebaselining the outer run's damage as the new normal.
  if (existsSync(SNAPSHOT_PATH) && !argv.includes('--force')) {
    die(`a snapshot already exists at ${SNAPSHOT_NAME}.\n` +
      'Another guarded run may be in progress — overwriting it would rebaseline its damage.\n' +
      'It records no owner, so releasing it from here would drop that run\'s baseline as soon\n' +
      'as the tree happened to compare clean. To inspect the slot without disarming it, run\n' +
      '`npm run guard:verify` — but read the result as the other run\'s: clean means the tree\n' +
      'has not moved, never that the run has finished, and a failure prints recovery advice\n' +
      'addressed to whoever armed this snapshot.\n' +
      'Let that run release its own, or `npm run guard:snapshot -- --force` if you know it is dead.');
  }
  const state = captureState();
  writeSnapshot(state);
  if (!QUIET) {
    console.log(`repo-guard: snapshot at ${state.head.slice(0, 8)} on ${state.branch}` +
      ` (${state.status.length} pending change(s), ${state.indexFlags.length} index flag(s))`);
  }
  process.exit(0);
}

// ── verify ───────────────────────────────────────────────────────────────────

if (!existsSync(SNAPSHOT_PATH)) {
  die(`no snapshot at ${SNAPSHOT_NAME}. Run \`npm run guard:snapshot\` before the run.\n` +
    (command === 'rebaseline'
      // Rebaselining without a baseline is just arming, and letting it silently
      // become that would make `guard:rebaseline` a synonym for `guard:snapshot`
      // — a second spelling of arming that no longer means "I accepted a move".
      ? 'There is nothing to re-baseline FROM: `rebaseline` re-arms an existing baseline after\n' +
        'you moved HEAD, and records what it accepted. To arm a fresh one, use `guard:snapshot`.'
      : 'Refusing to report "unchanged" for a comparison that never happened.'));
}

let before;
try {
  before = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8'));
} catch (error) {
  die(`snapshot at ${SNAPSHOT_NAME} is unreadable: ${error.message}`);
}
if (before.formatVersion !== FORMAT_VERSION) {
  die(`snapshot was written in format v${before.formatVersion ?? 1}, but this is v${FORMAT_VERSION}.\n` +
    'It predates a change to what is recorded, so the comparison would be incomplete.\n' +
    `Re-arm and re-run:  rm -f "${SNAPSHOT_PATH}" && npm run guard:snapshot`);
}
for (const field of ['toplevel', 'head', 'branch', 'status', 'contents', 'indexFlags']) {
  if (before[field] === undefined) die(`snapshot is missing '${field}' — refusing to compare.`);
}
if (before.toplevel !== TOPLEVEL) {
  die(`snapshot was taken in ${before.toplevel}, but this is ${TOPLEVEL}.`);
}
// The rebaseline chain is spread at the write site, OUTSIDE writeSnapshot's try/catch.
// A corrupt `{}` there throws an uncaught TypeError, which exits 1 — and 1 in this
// tool's vocabulary is the verdict "the repository changed". A malformed snapshot is
// uncertainty, which is 2. A string is worse: it spreads to its characters and writes
// garbage history at exit 0.
if (before.rebaselineHistory !== undefined && !Array.isArray(before.rebaselineHistory)) {
  die(`snapshot has a malformed 'rebaselineHistory' (${typeof before.rebaselineHistory}) — ` +
    'refusing to compare against a record this tool did not write.');
}

const after = captureState();
let changed = false;
let headMoved = false;
let branchMoved = false;
// null until a HEAD move sets it. It defaulted to 'created', the unborn-baseline value, so a
// branch-only acceptance recorded "this history was created" for a commit that never moved
// (#907 round 1).
let fastForward = null;
let addedCommits = [];
let commitsEnumerated = true;

if (before.head !== after.head) {
  changed = true;
  headMoved = true;
  console.error(`\n  HEAD moved: ${before.head.slice(0, 8)} -> ${after.head.slice(0, 8)}`);
  // The commits themselves are the actionable part: this is the case `git
  // status` cannot see, because a committed stray write leaves a clean tree.
  const range = git(['log', '--format=  %h %an <%ae>  %s', `${before.head}..${after.head}`],
    { cwd: TOPLEVEL, allowFailure: true });
  if (range && range.trim()) {
    console.error('  commits added:');
    console.error(range.trimEnd());
  }
  addedCommits = (range ?? '').trim().split('\n').filter(Boolean).map((l) => l.trim());

  // Ancestry, printed because it is the one discriminator the tool can compute
  // between the two readings of a moved HEAD. It is EVIDENCE, not a verdict —
  // an agent's stray commit on the current branch is a descendant too. What it
  // rules out is the other shape: a checkout that moved to unrelated history,
  // where `git reset --mixed <snapshot>` would be destructive rather than
  // merely wrong.
  //
  // Three-valued, because `--is-ancestor` exits 1 for "no" and >= 128 for "could
  // not tell" — a pruned or corrupt snapshot commit, which is realistic in a tool
  // whose whole subject is rebases. Collapsing those with `!== null` printed
  // "history diverged or was replaced" over a question git declined to answer:
  // a confident wrong claim, and the exact opposite of "evidence, not a verdict".
  fastForward = before.head === UNBORN
    ? 'created'
    // `git checkout --orphan`: HEAD names a branch with no commits. Asking `--is-ancestor`
    // about `(unborn)` returned "could not look", which was then blamed on a pruned or corrupt
    // object, over a move that simply added no commit (#908). `head` is `(unborn)` whenever
    // `rev-parse HEAD` fails, though, and a branch ref holding garbage fails it too. The branch
    // read separates the two: `symbolic-ref` names an orphan's branch and fails on a broken ref.
    // So a broken ref falls through to `'unknown'`, and rebaseline refuses it with exit 2 rather
    // than accepting an orphan move that never happened (#920 review, F2).
    : after.head === UNBORN && after.branch !== UNBORN
      ? 'to-unborn'
      : ancestry(before.head, after.head);
  // `false` covered two shapes (#908): unrelated history, and a move BACKWARD onto an ancestor of
  // the snapshot commit, such as a checkout of `main` from a branch ahead of it. Only the first
  // diverged. The second added no commit, so "read the commits above" described nothing.
  if (fastForward === false && ancestry(after.head, before.head) === true) fastForward = 'backward';
  console.error(`  ${{
    true: 'the snapshot commit IS an ancestor of the new HEAD — history was added on top',
    false: 'the snapshot commit is NOT an ancestor of the new HEAD — history diverged or was replaced',
    // Both say what was checked, HEAD's range, and no more: a commit can still sit on the branch
    // HEAD left, which is read below (#920 review, F1).
    backward: 'the new HEAD is an ANCESTOR of the snapshot commit — HEAD moved backward and gained no commit',
    'to-unborn': 'the new HEAD is on a branch with no commits (an orphan checkout?), so HEAD gained no commit',
    created: 'the baseline had no commits, so this history was created, not moved',
    unknown: 'git could NOT determine ancestry (a pruned or corrupt object?) — treat the reading below as unavailable, not as a "no"',
  }[fastForward]}.`);
  if (fastForward === 'backward') {
    // What a backward move leaves behind is the reverse range, and it is never empty here.
    const behind = git(['log', '--format=  %h %an <%ae>  %s', `${after.head}..${before.head}`],
      { cwd: TOPLEVEL, allowFailure: true });
    if (behind && behind.trim()) {
      console.error('  commits the snapshot had that HEAD no longer does:');
      console.error(behind.trimEnd());
    }
  }

  // The ENUMERATE leg of the acknowledgement rests on this list. If git could not
  // produce it, `rebaseline` must not go on to accept an empty one — "read the
  // commits above" printed over nothing, and `acceptedCommits: []` written into
  // permanent provenance, is a record that says a review happened when none could.
  // An unborn HEAD is the exception: HEAD's range cannot resolve, and HEAD's list is
  // complete, because a branch with no commits holds none. A commit made before the
  // orphan checkout sits on the branch HEAD left, which is read below (#920 review, F1).
  commitsEnumerated = range !== null || fastForward === 'to-unborn';
}

if (before.branch !== after.branch) {
  changed = true;
  branchMoved = true;
  console.error(`\n  branch changed: ${before.branch} -> ${after.branch}`);
}

// The branch the snapshot was on, once HEAD has left it (#920 review, F1). "No commit was
// added" was printed after reading HEAD's range alone, while a commit could sit on the branch
// HEAD left: an agent commits on `feature`, then checks out `main`, and HEAD gained nothing.
// That branch is read too, and its new commits join the list rebaseline makes the caller
// acknowledge. Commits HEAD reaches are excluded, so a branch merged into HEAD is not listed
// twice. No other ref is read: see "What it does NOT cover" in the header.
//
// It is read only when the branch changed; while HEAD is still on it, HEAD's own range covers
// it. It is read by the full ref recorded at capture (`headRef`), never by parsing back the
// display name, whose spelling depends on which other refs share it (#920 rounds 2 and 3). A
// snapshot from before `headRef` falls back to `refs/heads/<branch>`. Printed ranges name the
// full ref, because `git log` resolves a short name a tag shares to the tag; a checkout takes
// the short name, which git resolves to the branch (both measured on git 2.43).
/** The name of the branch the snapshot was on, for printing. */
const snapshotName = before.headRef?.startsWith('refs/heads/')
  ? before.headRef.slice('refs/heads/'.length) : before.branch;
const snapshotRef = before.headRef
  ?? (before.branch !== 'HEAD' && before.branch !== UNBORN ? `refs/heads/${before.branch}` : null);
let leftBranch = null;   // { name, ref, state }; null when the branch did not change or had no ref
let leftCommits = [];
if (branchMoved && snapshotRef !== null && before.branch !== 'HEAD') {
  const ref = snapshotRef;
  const tip = git(['rev-parse', '--quiet', '--verify', `${ref}^{commit}`],
    { cwd: TOPLEVEL, allowFailure: true })?.trim() || null;
  const name = snapshotName;
  if (tip !== after.head) {
    // No ref resolves for an unborn branch any more than for a deleted one, so a branch that had no
    // commit at the snapshot and resolves to none now may have gained commits and been deleted.
    // Neither "gone" nor "unmoved" is established there, and it is said so (#920 round 3, R3-1).
    const state = tip === null ? (before.head === UNBORN ? 'unresolved' : 'gone')
      : tip === before.head ? 'unmoved' : 'moved';
    leftBranch = { name, ref, state };
    if (leftBranch.state === 'moved') {
      const exclude = [before.head, after.head].filter((sha) => sha !== UNBORN).map((sha) => `^${sha}`);
      const log = git(['log', '--format=  %h %an <%ae>  %s', tip, ...exclude],
        { cwd: TOPLEVEL, allowFailure: true });
      // The ENUMERATE leg again: a list git could not produce is not an empty one.
      if (log === null) commitsEnumerated = false;
      leftCommits = (log ?? '').trim().split('\n').filter(Boolean).map((l) => l.trim());
      // Silent when its new position is in HEAD's history, as after a merge of it: every commit
      // it gained is already in HEAD's list, and saying that it moved would only repeat that list.
      const inHeadHistory = log !== null && leftCommits.length === 0 && ancestry(tip, after.head) === true;
      if (!inHeadHistory) {
        console.error(`\n  ${name}, the branch HEAD left, moved: ${before.head.slice(0, 8)} -> ${tip.slice(0, 8)}`);
        if (leftCommits.length) {
          console.error(`  commits added to ${name}, the branch HEAD left:`);
          console.error(log.trimEnd());
        }
      }
    }
  }
}

// An orphan move adds no commit to HEAD, so what it may have left behind is on the branch the
// snapshot was on. When that branch could not be read, "found nothing there" is not known, and
// rebaseline must not accept `acceptedCommits: []` over it (#920 round 2, R2-2). The shapes:
// a detached snapshot, a branch deleted since, and HEAD's own branch losing its ref
// (`update-ref -d`), which leaves HEAD unborn on the same name. The old build refused them
// all, because the range `<sha>..(unborn)` failed; this refuses them on purpose.
// (`before.branch` is never `(unborn)` here: 'to-unborn' needs a snapshot commit, and with one,
// `rev-parse --abbrev-ref` prints a branch name or `HEAD`.)
const leftUnreadReason = before.branch === 'HEAD' ? 'the snapshot was on a detached HEAD'
  : leftBranch?.state === 'gone' ? `${leftBranch.name}, the branch the snapshot was on, no longer exists`
    : !branchMoved && fastForward === 'to-unborn' ? `${snapshotName} no longer points at a commit`
      : null;
if (fastForward === 'to-unborn' && leftUnreadReason) commitsEnumerated = false;
/** The range that shows the left branch's commits; with no snapshot commit, the whole branch. */
const leftLogCommand = () => (before.head === UNBORN
  ? `git log --oneline ${shellWord(leftBranch.ref)}`
  : `git log --oneline ${before.head.slice(0, 8)}..${shellWord(leftBranch.ref)}`);
// `git reflog` exits 128 on an unborn HEAD; the reflog file is still there (#920 round 2, R2-6).
const reflogCommand = after.head === UNBORN ? 'cat "$(git rev-parse --git-dir)/logs/HEAD"' : 'git reflog';

// The two HEAD moves that add no commit to HEAD (#908), when the branch HEAD left gained none
// either (#920 review, F1). Advice keyed on "HEAD moved" alone told the caller to read commits
// that are not there; these get what the move left behind instead, with a range that prints
// it. For an unborn HEAD that is the snapshot commit's own history, since `HEAD..<sha>` cannot
// resolve there.
const movedWithoutCommit = (fastForward === 'backward' || fastForward === 'to-unborn') &&
  leftCommits.length === 0;
const noCommitReason = fastForward === 'backward'
  ? 'it moved backward, onto an ancestor of the snapshot commit'
  : 'it moved onto a branch with no commits';
const leftBehindCommand = fastForward === 'backward'
  ? `git log --oneline HEAD..${before.head.slice(0, 8)}`
  : `git log --oneline ${before.head.slice(0, 8)}`;
/** A ref name as a shell word: bare when it holds only safe characters, single-quoted otherwise. */
const shellWord = (word) => (/^[\w./-]+$/.test(word) ? word : `'${word.replace(/'/g, `'\\''`)}'`);

/**
 * What "HEAD gained no commit" does not cover, said right after it (#920 review, F1). Only HEAD
 * and the branch the snapshot was on are read, so a claim about any other commit is not made.
 */
function printNoCommitScope() {
  if (before.branch === 'HEAD') {
    console.error('The snapshot was on a detached HEAD, so a commit made there and then left is not ' +
      'checked here. The reflog lists every commit HEAD visited:');
    console.error(`  ${reflogCommand}`);
  } else if (!branchMoved && fastForward === 'to-unborn') {
    console.error(`${snapshotName} no longer points at a commit, so a commit made on it is not checked here.`);
  } else if (leftBranch?.state === 'unresolved') {
    console.error(`${leftBranch.name} had no commit at the snapshot and resolves to none now, so a commit ` +
      'made on it and then deleted is not checked here. The reflog lists every commit HEAD visited:');
    console.error(`  ${reflogCommand}`);
  } else if (leftBranch?.state === 'unmoved') {
    console.error(`${leftBranch.name}, the branch HEAD left, gained none either.`);
  } else if (leftBranch?.state === 'gone') {
    console.error(`${leftBranch.name}, the branch the snapshot was on, no longer exists, so a commit ` +
      'made on it is not checked here.');
  } else if (leftBranch?.state === 'moved') {
    console.error(`${leftBranch.name}, the branch HEAD left, moved without gaining a commit HEAD ` +
      'cannot reach.');
  }
}

// Tracked separately from `changed` because `rebaseline` may accept a HEAD move
// and must NEVER accept a worktree move: a stray write is exactly what the guard
// exists for, and "I merged my own branch" is not a claim about file contents.
let worktreeMoved = false;

worktreeMoved = reportList('working tree', before.status, after.status) || worktreeMoved;

// Iterating `after` is sufficient ONLY because every status-listed path now gets
// an entry — including the `(absent)` and `(not-a-regular-file)` sentinels. The
// sentinels are what make this safe: previously a path that stopped being a
// regular file was skipped from the map entirely, so the comparison never
// visited it while its status line stayed identical.
//
// A path in `before` but not in `after` cannot hide here: the key set of each
// map is exactly its status list, so the path must also have left the status
// list, which the working-tree diff above already reports.
//
// The opposite direction is why only some of these paths are printed (#899). A path
// NEW to the status list (an untracked file, a clean file modified or deleted, a
// conflict) has no `before` entry, so its bytes always "differ"; and a path whose
// line changed (` M` staged into `MM`) differs too. Every such path's status line
// moved, so the working-tree diff above already lists it. The heading below is true
// only of a path whose status lines are byte-identical in both captures, the case this
// comparison exists for, so it lists those and no others. Detection is unchanged:
// any differing path still marks the worktree as moved.
//
// LINES, plural: git can list one path twice, as a staged delete plus an untracked file
// of the same name (`D  a` and `?? a`). A map keyed by path kept one of the two, so the
// other could move while the path still read as unmoved (#920 review, F3). All of a
// path's lines are compared together.
const contentChanged = Object.keys(after.contents)
  .filter((path) => before.contents[path] !== after.contents[path])
  .sort();
if (contentChanged.length) {
  worktreeMoved = true;
  // Grouped once per capture: filtering the whole list once per changed path made verify
  // quadratic in the number of pending paths (#920 round 2, R2-4).
  const linesByPath = (state) => {
    const byPath = new Map();
    for (const line of state.status) byPath.set(line.slice(3), `${byPath.get(line.slice(3)) ?? ''}${line}\n`);
    return byPath;
  };
  const beforeLines = linesByPath(before);
  const afterLines = linesByPath(after);
  const hidden = contentChanged
    .filter((path) => beforeLines.has(path) && beforeLines.get(path) === afterLines.get(path));
  if (hidden.length) {
    console.error('\n  contents changed (same status line as at the snapshot, so only the bytes show the write):');
    for (const path of hidden) console.error(`    ~ ${path}`);
  }
}

// Kept apart from the file changes only so the advice can name a command that shows each: for a
// flag-only change `git diff` and `git status` print nothing, which `repo-guard.test.js` asserts
// (#887). `worktreeMoved` still covers both, because `rebaseline` refuses both.
const filesMoved = worktreeMoved;
const flagsMoved = reportList('index flags (skip-worktree / assume-unchanged / unmerged)',
  before.indexFlags, after.indexFlags);
worktreeMoved = filesMoved || flagsMoved;

changed = changed || worktreeMoved;

// ── rebaseline ───────────────────────────────────────────────────────────────
//
// The exit #688 was missing. `verify` and `release` both assume a moved HEAD is
// UNEXPLAINED, which is right for the case they exist for and wrong for the
// commonest case in any run of length: the arming session merges its own branch,
// or switches branches, and then has nowhere to go but
// `guard:snapshot -- --force` — a flag whose own text warns against itself.
//
// A caller who reaches for `--force` twice stops reading what it discards. That
// converts a control into a ritual, which is the failure mode this whole tool is
// an argument against. So the legitimate move gets a first-class command, and it
// costs exactly the three steps of judgement the honest sequence already
// required: enumerate the delta, confirm the commits are yours, record that you
// did. The difference is that the tool now performs all three instead of
// assuming them.
if (command === 'rebaseline') {
  if (!changed) {
    if (!QUIET) {
      console.log(`repo-guard: nothing moved — the baseline already matches ${after.head.slice(0, 8)}` +
        ` on ${after.branch}. Snapshot left as it is.`);
    }
    process.exit(0);
  }

  // A worktree move is never re-baselineable. "I moved HEAD deliberately" is a
  // claim about history; it says nothing about file contents, and accepting one
  // as cover for the other would launder exactly the stray write (#493) the
  // guard was built to catch. Refuse, and keep the baseline so the caller can
  // still `guard:verify` after cleaning up.
  if (worktreeMoved) {
    console.error(`\nrepo-guard: the WORKING TREE moved${headMoved ? ', not just HEAD' : ''}.`);
    console.error('`rebaseline` accepts a deliberate HEAD move and nothing else — a content, status');
    console.error('or index-flag change is the case this guard exists for, and accepting it here');
    console.error('would rebaseline a stray write as the new normal.');
    console.error('\nInspect it first:');
    if (filesMoved) console.error('  git status --porcelain -uall  /  git diff');
    if (flagsMoved) console.error(`  for the index flags (${INDEX_FLAGS_LEGEND}):\n    ${INDEX_FLAGS_COMMAND}`);
    console.error('The snapshot was KEPT, so `npm run guard:verify` still works after you clean up.');
    process.exit(1);
  }

  if (!commitsEnumerated && before.head === UNBORN) {
    // `git log '(unborn)..HEAD'` can never succeed, so the enumeration guard would brick
    // rebaseline for an operator who armed an empty repository and then made their own
    // first commits — sending them back to `--force`, the whole point of this command.
    // Everything present arrived during the run, so enumerate without a range.
    const all = git(['log', '--format=  %h %an <%ae>  %s'], { cwd: TOPLEVEL, allowFailure: true });
    if (all && all.trim()) {
      console.error('\n  the baseline had no commits, so every commit now present arrived during the run:');
      console.error(all.trimEnd());
      addedCommits = all.trim().split('\n').filter(Boolean).map((l) => l.trim());
      commitsEnumerated = true;
    }
  }

  if (!commitsEnumerated && fastForward === 'to-unborn' && leftUnreadReason) {
    // Not git failing: the branch that could hold what an orphan move left behind cannot be
    // read, so an empty list would be a guess (#920 round 2, R2-2).
    console.error(`\nrepo-guard: HEAD moved onto a branch with no commits, and ${leftUnreadReason}, so a ` +
      'commit made before the move cannot be listed.');
    console.error('There is nothing to read, so there is nothing to acknowledge. Accepting here would');
    console.error('write `acceptedCommits: []` into the record — provenance asserting a review that');
    console.error('could not happen. The reflog still lists every commit HEAD visited:');
    console.error(`  ${reflogCommand}`);
    process.exit(2);
  }
  if (!commitsEnumerated) {
    console.error('\nrepo-guard: git could not list the commits between the baseline and HEAD.');
    console.error('There is nothing to read, so there is nothing to acknowledge. Accepting here would');
    console.error('write `acceptedCommits: []` into the record — provenance asserting a review that');
    console.error('could not happen.');
    // The command bare, its purpose on the line above, for the reason in the comment above
    // BRANCH_ARGS (#908).
    console.error('\n  To see why it failed:');
    console.error(`    git log --oneline ${before.head.slice(0, 8)}..HEAD`);
    process.exit(2);
  }

  const accepted = values['--accept'];
  // An unborn HEAD has no sha, so the sentinel is what `--accept` must match; quoted, because
  // `(unborn)` is a glob group under zsh and a syntax error under bash (#908).
  const acceptArg = after.head === UNBORN ? `'${UNBORN}'` : after.head;
  if (!accepted && !headMoved && leftCommits.length === 0) {
    // Only the branch changed, at the same commit. #887 observed it with the baseline armed on a
    // detached HEAD and `git checkout main` afterwards. The message below this one says HEAD
    // moved and asks the caller to read the commits above, and there are none. "No commit was
    // added" claimed more than HEAD's range, the one thing read (#920 review, F1).
    console.error('\nrepo-guard: only the branch changed. HEAD did not move, so HEAD gained no commit.');
    printNoCommitScope();
    console.error('Nothing has been accepted yet. Check that this is the checkout you made:');
    console.error(`  ${branchCommandFor(after)}`);
    console.error('\nIf it is, re-run naming the HEAD it sits on:');
    console.error(`  npm run guard:rebaseline -- --accept=${acceptArg}`);
    process.exit(2);
  }
  if (!accepted && movedWithoutCommit) {
    // HEAD moved and added nothing, so "Read the commits above" would point at an empty list,
    // and the acceptance below records `acceptedCommits: []` beside the move's real shape (#908).
    console.error(`\nrepo-guard: HEAD moved, but gained no commit: ${noCommitReason}.`);
    printNoCommitScope();
    console.error('Nothing has been accepted yet. Check that this is a move you made. What the snapshot');
    console.error('commit had that HEAD does not:');
    console.error(`  ${leftBehindCommand}`);
    console.error(`\nIf you made it (${fastForward === 'backward' ? 'a checkout of an older branch' : 'an orphan checkout'}, ` +
      'say), re-run naming the HEAD it sits on:');
    console.error(`  npm run guard:rebaseline -- --accept=${acceptArg}`);
    process.exit(2);
  }
  if (!accepted) {
    console.error(`\nrepo-guard: ${headMoved
      ? 'HEAD moved'
      // A branch-only move whose left branch gained commits (#920 review, F1).
      : `only the branch changed, and ${before.branch}, the branch HEAD left, gained commits`}. ` +
      'Nothing has been accepted yet.');
    console.error('Read the commits above. Every one of them must be yours — a commit you did not');
    console.error('make is the thing this guard is for, and accepting it here hides it permanently.');
    console.error('\nIf they are all yours, re-run naming the HEAD you just read:');
    console.error(`  npm run guard:rebaseline -- --accept=${acceptArg}`);
    console.error('  npm run guard:rebaseline -- ' +
      `--accept=${acceptArg} --reason="merged my own PR"`);
    console.error('\nThe sha is required so an acknowledgement cannot be given by reflex, and so the');
    console.error('transcript records WHICH move was accepted — which `--force` does not. It is a');
    console.error('control against ACCIDENT, not against intent: anyone who wants to can substitute');
    console.error('`$(git rev-parse HEAD)`. What it buys is that no red `guard:verify` ever prints a');
    console.error('paste-ready override in its own output. Read the authors above — they may be');
    console.error('IDENTICAL to yours, because a subagent commits through this repository\'s own');
    console.error('git config. That is what happened in #493. The content is the test; the author');
    console.error('is a hint.');
    process.exit(2);
  }

  // Prefix match, minimum 7, so a caller may paste the abbreviated sha git
  // itself printed. Shorter than 7 is not an acknowledgement of anything.
  if (accepted.length < 7 || !after.head.startsWith(accepted)) {
    die(`you accepted '${accepted}', but HEAD is ${after.head}.\n` +
      (accepted.length < 7
        ? 'A sha shorter than 7 characters is not specific enough to be an acknowledgement.\n'
        : headMoved
          ? 'HEAD moved again between reading it and accepting it, or the sha was mistyped.\n'
          // Not moved since the snapshot, so HEAD is the sha the refusal printed (#907 round 1).
          : 'HEAD has not moved since the snapshot, so the sha was mistyped.\n') +
      'Re-run `npm run guard:rebaseline` with no --accept to see the current delta.');
  }

  writeSnapshot(after, {
    rebaselinedFrom: {
      head: before.head,
      branch: before.branch,
      takenAt: before.takenAt ?? null,
      // HEAD's range and the branch HEAD left, as THIS run read and printed them (#920 review, F1).
      // `--accept` pins HEAD only, so a commit that reached the left branch after the refusal the
      // caller read is shown only in this run's output before it is recorded (#920 round 2, R2-7).
      acceptedCommits: [...addedCommits, ...leftCommits],
      fastForward,
      reason: values['--reason'] ?? null,
    },
    // Preserved so a chain of re-armings stays visible rather than each one
    // erasing the last. `--force` leaves no trace at all, which is finding 1.
    rebaselineHistory: [...(before.rebaselineHistory ?? []),
      { from: before.head, to: after.head, reason: values['--reason'] ?? null }],
  });

  if (!QUIET) {
    console.log(`\nrepo-guard: re-baselined ${before.head.slice(0, 8)} -> ${after.head.slice(0, 8)}` +
      ` on ${after.branch}, accepting ${addedCommits.length + leftCommits.length} commit(s)` +
      `${movedWithoutCommit ? ` (HEAD ${fastForward === 'backward' ? 'moved backward' : 'moved onto a branch with no commits'})` : ''}` +
      `${values['--reason'] ? ` — ${values['--reason']}` : ''}.`);
    console.log('The run is guarded again from here. `npm run guard:verify` compares against the new baseline.');
  }
  process.exit(0);
}

// Release only a CLEAN run. Dropping the baseline after a failure destroys the
// evidence at the exact moment it is needed: you cannot re-verify after a
// partial recovery, and the only way back is a fresh snapshot — which
// rebaselines the damage as the new normal, the laundering hole the
// refuse-to-overwrite rule exists to close.
if (argv.includes('--release') && !changed) {
  try {
    unlinkSync(SNAPSHOT_PATH);
  } catch (error) {
    // Do not let a cleanup failure masquerade as "the repository changed".
    console.error(`repo-guard: warning — could not remove the snapshot: ${error.message}`);
  }
}

/**
 * One line per working-tree finding, each naming the command that shows it, and only for the
 * findings made (#887). Shared by verify's two paths: the HEAD-moved one said only "Settle that
 * first", so a flag change there got no command, and `git diff` / `git status` print nothing for
 * a flag (#908).
 */
function printWorktreeCommands(indent) {
  if (filesMoved) console.error(`${indent}the working tree:  git diff  /  git status --porcelain -uall`);
  if (flagsMoved) console.error(`${indent}the index flags (${INDEX_FLAGS_LEGEND}):\n${indent}  ${INDEX_FLAGS_COMMAND}`);
}

/** The way out of a moved HEAD: rebaseline when it would accept, and what to settle when not. */
function printHeadMovedExit(lead) {
  if (!worktreeMoved && fastForward === 'to-unborn' && leftUnreadReason) {
    // rebaseline refuses this move whatever is accepted, so naming it as the way out would be
    // the incoherent advice described below (#920 round 3, R3-2).
    console.error(`\n  rebaseline would refuse this move: ${leftUnreadReason}. A commit made before it cannot ` +
      'be listed, so there is nothing to acknowledge.');
    if (before.branch !== 'HEAD') {   // the detached sentence above already named the reflog
      console.error('  The reflog lists every commit HEAD visited:');
      console.error(`    ${reflogCommand}`);
    }
    return;
  }
  if (worktreeMoved) {
    // Advising rebaseline here would advise a command that then refuses: it declines
    // any worktree change. Incoherent advice at the moment of decision is the failure
    // this file already fixed once, for the occupied-slot refusal.
    console.error('\n  The working tree moved too, so `guard:rebaseline` would refuse. Settle that first:');
    printWorktreeCommands('    ');
  } else {
    // The command bare, for the reason in the comment above BRANCH_ARGS (#908).
    console.error(`\n  ${lead} run this. It prints the delta and refuses. Read it, then accept:`);
    console.error('    npm run guard:rebaseline');
    console.error('    (it re-arms from here and RECORDS what it accepted, which --force does not)');
  }
}

if (changed) {
  console.error('\nrepo-guard: the repository CHANGED during the run.');
  if (headMoved && before.head === UNBORN) {
    // The baseline had no commits at all, so there is no revision to reset to —
    // printing `git reset --mixed (unborn)` would be an invalid command offered
    // at precisely the moment the caller is deciding what to trust.
    console.error('The baseline had no commits, so every commit now present arrived during the run:');
    console.error('  git log --oneline');
    if (leftCommits.length) {
      // That command shows HEAD's history only (#920 round 3, R3-6).
      console.error(`Some are on ${leftBranch.name}, the branch HEAD left, and not in HEAD's history:`);
      console.error(`  ${leftLogCommand()}`);
    }
    console.error('Inspect them before pushing; there is no earlier revision to reset to.');
    // rebaseline accepts this case, so it is named here as on the other HEAD-moved paths, and a
    // flag change gets its command (#920 review, F4).
    printHeadMovedExit('If you made these commits,');
  } else if (headMoved && movedWithoutCommit) {
    // No commit was added, so there is none to read and none to reset away: `git reset --mixed
    // <snapshot>` after a backward checkout would drag HEAD forward and leave the checked-out
    // files looking like a revert. What the caller can check is what the move left behind (#908).
    console.error(`HEAD moved, but gained no commit: ${noCommitReason}.`);
    printNoCommitScope();
    console.error('What the snapshot commit had that HEAD does not:');
    console.error(`    ${leftBehindCommand}`);
    console.error('Decide whether you made this move — a checkout or a reset. This tool cannot decide');
    console.error('that for you.');
    // A way back for the case the guard exists for, named only where one is known to be safe
    // (#920 review, F5): `--ff-only` refuses rather than overwrites, and the checkout is offered
    // only when the branch it returns to still points at the snapshot commit.
    if (!branchMoved && fastForward === 'backward' && after.branch !== 'HEAD') {
      console.error(`\n  If you did NOT make it, this moves ${after.branch} back to the snapshot commit, ` +
        'refusing rather than overwriting:');
      console.error(`    git merge --ff-only ${before.head.slice(0, 8)}`);
    } else if (branchMoved && leftBranch?.state === 'unmoved' && !leftBranch.name.startsWith('-')) {
      // A name starting with `-` reaches git as an option whatever the quoting, and `git checkout
      // -f` discards local edits; only plumbing makes such a branch, and it gets no way back
      // (#920 round 2, R2-5).
      console.error("\n  If you did NOT make it, this returns to the snapshot's branch:");
      console.error(`    git checkout ${shellWord(leftBranch.name)}`);
    }
    printHeadMovedExit('If you made this move,');
  } else if (headMoved) {
    // Two readings, and the tool cannot tell them apart — only the caller knows
    // whether they made these commits. Printing one recovery command as though
    // it could is what #688 finding 2 is about: `git reset --mixed` would undo a
    // merge the operator intended, offered at the moment they are deciding what
    // to trust. So both exits are named, and the discriminator (the author lines
    // above) is stated rather than guessed at.
    console.error(addedCommits.length || leftCommits.length
      ? 'HEAD moved. Read every commit listed above and decide whether you made it —'
      // "listed above" over an empty list is the #908 defect; this is the ancestry-unknown case,
      // where git could not produce the list at all.
      : 'HEAD moved, and git could not list its commits (see the ancestry line above). Decide whether you made it —');
    console.error('this tool cannot decide that for you. The author line is a HINT, not the test:');
    console.error('a subagent commits through this repository\'s own git config, so in #493 the');
    console.error('author was identical to the operator\'s. What the commit CONTAINS is the test.');
    console.error(`\n  If a commit is NOT yours — the case this guard exists for` +
      `${worktreeMoved ? '' : ' (the tree is otherwise clean, which is exactly how a committed stray write hides)'}:`);
    // HEAD's own commits get the reset; commits on the branch HEAD left do not, since resetting
    // HEAD's branch would drop none of them (#920 review, F1).
    const headRange = addedCommits.length > 0 || !commitsEnumerated;
    if (headRange) {
      console.error(`    git log --oneline ${before.head.slice(0, 8)}..HEAD`);
      // The command bare, its effect on the line above, for the reason given above BRANCH_ARGS.
      console.error('    To drop those commits and keep their changes in the working tree:');
      console.error(`    git reset --mixed ${before.head.slice(0, 8)}`);
    }
    if (leftCommits.length) {
      console.error(`    The ones on ${leftBranch.name}, the branch HEAD left:`);
      console.error(`    ${leftLogCommand()}`);
    }
    console.error('    Investigate BEFORE PUSHING — a stray commit is recoverable while unpushed.');
    if (!headRange) {
      // No reset was named, so no warning about one.
    } else if (fastForward === false) {
      console.error('    NOTE: the snapshot commit is not an ancestor of HEAD, so that reset would');
      console.error('    move you onto different history. Inspect before running it.');
    } else if (fastForward === 'unknown') {
      // `'unknown'` is TRUTHY, so `if (!fastForward)` suppressed this warning in exactly
      // the case the three-valued ancestry was introduced to surface — and printed a
      // `git reset --mixed <sha>` whose target's existence is what 'unknown' doubts.
      console.error('    NOTE: git could not tell whether that commit is an ancestor, so this reset');
      console.error(`    may move you onto different history. Confirm it exists first:`);
      console.error(`      git cat-file -t ${before.head.slice(0, 8)}`);
    }
    printHeadMovedExit('If every commit IS yours — you merged, switched branches, or rebased —');
  } else {
    // `git reset --mixed` would unstage the caller's own work here, so it must
    // not be suggested when HEAD never moved.
    //
    // A HEAD that did not move does not make this a worktree change. A checkout from a
    // detached HEAD onto its branch moves only the branch, and `git diff` shows nothing for it
    // (#887). So each finding gets the command that can show it, and only the findings made.
    console.error('HEAD did not move. What moved, and the command that shows it:');
    if (branchMoved) {
      console.error(`  the branch (${before.branch} -> ${after.branch}):  ${branchCommandFor(after)}`);
    }
    if (leftCommits.length) {
      // HEAD did not move, and the branch it left gained commits (#920 review, F1).
      console.error(`  commits on ${leftBranch.name}, the branch HEAD left:  ${leftLogCommand()}`);
    }
    printWorktreeCommands('  ');
    if (worktreeMoved) {
      console.error('Inspect it before assuming it was yours.');
    } else if (branchMoved) {
      // The command bare, for the reason in the comment above BRANCH_ARGS. The prose ends in `.`
      // rather than `; read it`: pasted with the line below it, `read` ran as a command (#908).
      console.error('\n  If you made this checkout, run this. It prints the delta and refuses. Read it, then accept:');
      console.error('    npm run guard:rebaseline');
    }
  }
  if (argv.includes('--release')) {
    console.error('\nThe snapshot was KEPT despite --release, so you can re-verify after');
    console.error('recovering. Re-snapshotting instead would rebaseline whatever changed.');
  }
  process.exit(1);
}

if (!QUIET) {
  const age = before.takenAt ? ` (snapshot taken ${before.takenAt})` : '';
  console.log(`repo-guard: unchanged at ${after.head.slice(0, 8)} on ${after.branch}${age}.`);
}
process.exit(0);
