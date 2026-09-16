---
name: coordinate-peer-sessions
description: >
  Coordinate safely with a peer interactive session sharing the same git
  worktree — check first whether a separate worktree removes the problem, then
  declare path and branch scope before the first edit, survive a contended
  index lock, and review the whole branch before opening a PR. Activate when
  starting work in a repository that may already be occupied, when a git
  command fails with `index.lock: File exists`, when `guard:snapshot` refuses
  because a snapshot already exists, or when a commit turns out to contain a
  file this session never edited. Distinct from subagent concurrency: a peer
  session cannot be bracketed, because no baseline exists from before its edits.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: git
  complexity: intermediate
  language: multi
  tags: git, coordination, worktree, concurrency, safety
  locale: ja
  source_locale: en
  source_commit: "d34f9ced6"
  fence_basis_commit: "d34f9ced6"
  translator: "(untranslated stub)"
  translation_date: "2026-08-18"
---

# Coordinate Peer Sessions

Establish and hold a working agreement with a second interactive session sharing one git
worktree. Every other concurrency control in this library assumes you started the other
process and can bracket it. A peer session cannot be bracketed: it may have been editing
before you arrived, so no baseline predates its work and every detector fires after the
collision rather than before it. The control this skill applies is an agreement about paths
and the branch, established before the first edit — after checking whether the sharing is
necessary at all.

## When to Use

- Starting work in a repository that may already be occupied by another session.
- A git command fails with `fatal: Unable to create '.git/index.lock': File exists.`
- `npm run guard:snapshot` refuses because a snapshot already exists and you did not arm it.
- A commit or branch contains a file this session never edited.
- A generated artifact is stale and nothing this session did explains it.

## Inputs

- **Required**: a git worktree that may be shared, and permission to run `ps` and `git` in the
  same environment as the peer.
- **Optional**: `scope_paths` — the paths this session intends to touch (default: derive them
  from the task before editing anything).
- **Optional**: `base_ref` — the ref to diff the branch against when reviewing (default:
  `origin/main`).

## Procedure

### Step 1: Check whether sharing is necessary at all

A second worktree has its own index and its own HEAD, which removes lock contention and
branch collisions outright, while sharing one object store.

```bash
git worktree list
git worktree add ../repo-peer -b feat/their-task
```

**Expected:** either a second worktree, after which this skill is unnecessary, or a stated
reason the sessions must share one — same-branch collaboration, a toolchain bound to a fixed
path, or an expensive filesystem.

**On failure:** if a second worktree is not possible, record why in the scope declaration
(Step 3), so the next session does not re-litigate it. Continue to Step 2.

### Step 2: Establish whether the worktree is occupied

There is no enumeration of peer sessions. `ListAgents` lists agents you can message, not
arbitrary interactive sessions someone else started. Look for processes and traces instead.

```bash
ps -eo pid,etime,args | rg -i 'claude|git ' | rg -v ' rg '
tasklist.exe 2>/dev/null | rg -i git    # WSL: ps cannot see Windows-side git
git status --short
git branch --show-current
git log --oneline --all --since='2 hours ago' | head
```

**Expected:** either a positive signal — a long-running `git` process, an unrecognised branch
or recent commit, an unexpected modified file — or no signal at all.

**On failure:** if `ps` is unavailable, the checkout is reachable from another OS, or the
output is ambiguous, **treat the worktree as occupied**. Inconclusive is not the same as
empty, and the asymmetry is large: assuming a peer who is absent costs one unread message,
assuming solitude costs a commit.

### Step 3: Declare path and branch scope before the first edit

*Before the first edit*, because by commit time the tree has already been shared. *Paths*,
because two sessions on unrelated tasks still collide in one file. *And the branch*, because
one worktree has one HEAD and a peer's `git switch` relocates where your next commit lands.

```text
Branch: feat/x — neither session switches without saying so
This session: scripts/, scripts/test/, debt-ratchet.yml
Peer session: README.md, docs/
Shared, ask before editing: CLAUDE.md, package.json, the registries
Nobody runs: git stash, git checkout -- <path>, git reset --hard
```

Record it where the other session can read it — a message to the human running both, a
comment on the issue, or a message straight to the peer session. **Not in `CONTINUE_HERE.md`**
(#660): a handoff is written for the *next* session and is consumed and deleted by the first
one that reads it, so a scope declaration stored there is destroyed by the reader it was
meant to bind, and the peer that still needs it finds nothing. The declaration must outlive
the reading — an issue comment does, a chat message does, a handoff does not.

**Expected:** a written division naming the branch, the directories and files each session
owns, the contested files that belong to neither, and the whole-tree commands neither runs.

**On failure:** if the peer cannot be reached, narrow unilaterally instead: restrict this
session to files it creates, avoid every shared file, and say so in the PR description. A
one-sided declaration is weaker than an agreement and much stronger than nothing.

### Step 4: Work with explicit staging

```bash
git add scripts/check-thing.js scripts/test/thing.test.js
git diff --cached --name-only
```

Never `git add -A`, `git add --all` or `git add .` — none can distinguish this session's work
from a neighbour's untracked file. Note the residual gap: `git add <directory>` on a directory
holding a stray file is indistinguishable from legitimate staging, so name files when the
directory is contested.

**Expected:** `git diff --cached --name-only` lists only paths this session authored.

**On failure:** unstage the intruder with `git restore --staged <path>`. Do not check with
`git status --short` instead — with a peer present it also lists their dirty and untracked
files, so it can never read clean and says nothing about your staging.

### Step 5: Survive a contended index lock

One `.git/index` is shared, and a peer's plain `git status` takes a write lock on it, so an
ordinary read on their side fails an ordinary write on yours. Fix the reading side first.

```bash
GIT_OPTIONAL_LOCKS=0 git status --short   # takes no lock; make this the habit

msg="$(mktemp)"                           # never a fixed name in a shared tree
printf 'feat: …\n' > "$msg"
committed=0
for attempt in 1 2 3 4 5; do
  if git commit -F "$msg"; then committed=1; break; fi
  echo "attempt $attempt failed; retrying"
  sleep 5
done
[ "$committed" -eq 1 ] || { echo "FAILED: commit did not succeed" >&2; exit 1; }
```

**Expected:** the commit succeeds, and the explicit `committed` check means an exhausted loop
exits non-zero. A bare `for` loop returns the status of its last command, so without that line
five failed attempts report success.

**On failure:** do not terminate git processes and do not delete `.git/index.lock` — both
pieces of advice in git's message are written for a single-user repository where a stale lock
means a crash. Here it usually means a live command, and on a WSL checkout under `/mnt/` the
holder may be a Windows-side process `ps` cannot see. Remove the lock only when no git process
exists on either side and its mtime rules out anything in flight; prefer asking the human.

### Step 6: Read the guard's output as a bystander

The guard's mechanics are documented in `guides/creating-workflows.md`, section "Sharing the
worktree with a peer session". Two rules follow for a shared tree.

```bash
npm run guard:verify   # look
```

**Expected:** you read the report and act on your own judgement of the changed-file list.

**On failure:** never run `npm run guard:release` on a slot you did not arm — the snapshot
records no owner, so a release from the wrong session drops the incumbent's baseline as soon
as the tree compares clean. Never follow the `git reset --mixed <baseline>` line a failed
verify prints unless you armed that snapshot; it is recovery advice addressed to someone else
and following it drops their commit. A clean verify means the tree has not moved, never that
the other run has finished. When the arming session is genuinely dead, the sanctioned exit is
`npm run guard:snapshot -- --force` — but run `guard:verify` and read the changed-file list
first, or the force rebaselines the dead run's damage into a clean baseline.

### Step 7: Find out what actually protects you

A permission rule can deny the dangerous staging forms. Which file holds it decides who it
protects, so check tracked-ness rather than contents.

```bash
git ls-files .claude/
git check-ignore -v .claude/settings.json .claude/settings.local.json
```

**Expected:** a definite answer about what a clone receives. By Claude Code convention
`settings.local.json` is the personal, never-shared file, so reading its contents answers a
question about one machine. A rule protects collaborators only if the file holding it is
tracked.

**On failure:** if both settings files are gitignored — as they are in this repository — then
no staging deny rule travels with a clone, and the discipline in this skill is the only
control. State that wherever the guarantee is described. Documenting a control that does not
travel is worse than documenting none, because the next reader stops being careful.

### Step 8: Review the whole branch before opening a PR

```bash
git fetch origin
git diff "${BASE_REF:-origin/main}"...HEAD --name-only
git log "${BASE_REF:-origin/main}"..HEAD --stat
```

Three dots on the `diff`, two on the `log`, and the asymmetry is the trap: two-dot `git diff`
reports files changed on *either* side, so on a branch that is behind it lists everything the
base moved as well. A `git show` on the tip cannot reveal what an earlier commit swept in.

**Expected:** every file in the diff is one this session intended to touch.

**On failure:** if an unrecognised file appears, untrack it with `git rm --cached <path>`,
which leaves it on disk. Plain `git rm` deletes the peer's only copy if they never committed
it elsewhere. Note also that once their file is tracked on your branch, switching branches
removes it from the shared tree — untrack before switching, and tell them. If a generated
artifact is stale for no reason you can name, investigate before regenerating: regenerating
turns the check green and destroys the only signal that the corpus moved.

## Validation

- [ ] A separate worktree was considered, and the reason for sharing is recorded
- [ ] Occupancy was checked before the first edit, on both sides of any OS boundary
- [ ] The declaration names the branch, the per-session paths, the contested files, and the
      whole-tree commands neither session runs
- [ ] Every commit was staged with explicit paths, verified with `git diff --cached`
- [ ] No `.git/index.lock` was deleted and no git process was terminated
- [ ] No guard slot was released that this session did not arm
- [ ] Tracked-ness of the settings files was checked, not just their contents
- [ ] The branch was diffed against its merge base with three dots before the PR was opened

## Common Pitfalls

- **Sharing a worktree that did not need sharing**: `git worktree add` gives the peer its own
  index and HEAD, which removes most of this skill's subject matter.
- **Declaring scope by task instead of by path**: "you take CI, I take i18n" divides the work
  and not the tree; both sides then edit the same workflow file and the same root instructions.
- **Declaring paths but not the branch**: one worktree has one HEAD, so a peer's `git switch`
  decides where your next commit lands.
- **Treating an inconclusive occupancy check as "nobody here"**: the check has no negative
  result, only a positive one and an absence of evidence — and under WSL it is blind to
  Windows-side processes entirely.
- **Following git's index-lock advice**: it assumes a single user and a crashed process.
  Terminating processes kills the peer's work; deleting the lock mid-write corrupts the index.
- **A fixed scratch filename in a shared tree**: two sessions running this procedure would
  overwrite each other's commit message. Use `mktemp`.
- **Two-dot `git diff` against the base**: reports the base's changes as well, which on an
  active repository buries the one file you are looking for.
- **`git rm` instead of `git rm --cached`**: deletes a peer's uncommitted work from disk.
- **Releasing or acting on a guard slot you did not arm**: the snapshot has no owner field, so
  nothing stops you, and the failure output is recovery advice addressed to another session.
- **Assuming a deny rule protects everyone**: a rule in an untracked settings file does not
  travel with a clone, and `git add <dir>` is not covered by any deny rule that could
  reasonably be written.
- **Regenerating a stale artifact before explaining it**: staleness is often the only evidence
  that a peer moved the corpus, and regenerating destroys it.

## Limitations

**This is not a locking mechanism.** Everything above is a procedure one session follows, and a
procedure binds only the session that reads it. A peer who never loads this skill — a human at a
terminal, an agent under different instructions, a process on the other side of the WSL boundary —
is not constrained by anything here. That does not make an unanswered declaration worthless —
Step 3's one-sided fallback still narrows *you*, which is a real reduction in collision surface.
It means the constraint sits on the declaring side, so never report "scope declared" as though it
were "scope enforced".

The mechanical control is `npm run guard:snapshot` / `guard:verify`, and it is a *detector* rather
than a lock: it reports that the tree moved, which is a different service from preventing the move.
Its own two blind spots matter here and are stated in
`CLAUDE.md` § *Guarding a Multi-Agent Run*.

The first is that the snapshot records no owner, so a peer's `guard:release` can drop the baseline
you armed. Hold on to the condition rather than the headline: it drops only when the tree compares
clean, and a release that finds the tree moved KEEPS the snapshot and says why
(`scripts/repo-guard.js:344`). So it is the quiet *successful* case that costs you a baseline —
the file is unlinked and nothing is printed. A failing release is the loud one.

The second is that no baseline can predate a peer who was already working when you arrived. That is
why Step 3 declares scope before your first *edit* rather than after your first *check*: an occupied
worktree cannot be resolved by inspecting harder.

**Within one shared worktree there is nothing in git to fall back on.** No advisory lock exists on a
path, and `.git/index.lock` is write serialisation rather than a claim on the tree. A settings deny
rule does not fill the gap either, and for a subtler reason than "it is personal": settings are
per-checkout, so a peer session in *this* worktree loads the same file and is bound by the same rule
— it is a *clone* that receives nothing, and only when the file is untracked, which Step 7 exists to
check rather than assume.

The control git does provide sits one level up: a second worktree (Step 1). Each session gets its
own index and HEAD, and git refuses to check out one branch in two of them — an exclusion rather
than an agreement, which is the difference this whole section is about.

## Related Skills

- `commit-changes` -- explicit-path staging, which this skill depends on
- `create-pull-request` -- opens the PR whose branch Step 8 reviews
- `resolve-git-conflicts` -- for a collision that reached the index rather than the working tree
- `write-continue-here` -- the handoff to the NEXT session, which is not where a peer-scope declaration belongs (#660): its reader deletes it
- `unleash-the-agents` -- subagent fan-out, the case this skill is explicitly *not* about
