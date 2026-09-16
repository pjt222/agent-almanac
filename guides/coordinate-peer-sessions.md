---
title: "Coordinating Peer Sessions"
description: "Working safely when a second interactive session shares your worktree — separate worktrees first, then path scope, index etiquette, and the guard's limits"
category: workflow
agents: []
teams: []
skills: [coordinate-peer-sessions, commit-changes, create-pull-request]
---

# Coordinating Peer Sessions

Everything else in this library about concurrency is about **subagents** — processes you
spawned, whose lifetime you control, which you can bracket with a guard because you were
there before they started. This guide is about the other case: a **peer session**, a second
interactive Claude Code session, driven by the same human, running in the same working tree,
which you did not start and cannot stop.

The distinction matters because the tools invert. For a subagent, you arm a detector first
and read it after. For a peer, there is no "first" — they may have been editing for an hour
before you opened the repository, and no snapshot exists from before their work. Detection is
retrospective by construction: by the time anything fires, the file is already staged. So the
procedure here leads with an agreement, not an instrument.

## When to Use This Guide

- You are starting work in a repository and something suggests another session is active — an
  unexpected modified file, a branch you did not create, a recent issue or PR you did not open.
- A `git` command fails with `fatal: Unable to create '.git/index.lock': File exists.`
- You are about to run a fan-out and want to know what the repo guard does and does not cover
  when you are not the only session in the tree.
- A collision already happened: your commit contains a file you never touched, or a
  generated artifact went stale for no reason you can explain.

## Prerequisites

- A git worktree, and [Bracket the run](creating-workflows.md#bracket-the-run) read at least
  once — this guide assumes the guard exists and does not re-explain it.
- Ability to run `ps` and `git` in the same environment as the peer. Coordination across
  machines is out of scope; a peer here means a session sharing one filesystem.

## First, ask whether you need to share at all

Everything below is etiquette for a shared tree. Before adopting it, check whether the
sharing is necessary, because git can usually remove the problem outright:

```bash
git worktree add ../almanac-peer -b feat/their-task
```

A second worktree gets its **own index** — so no `index.lock` contention — and its **own
HEAD**, so neither session can move the other's branch, while both share one object store and
one set of refs. This repository already mandates it for reviewer subagents, which run in
`.claude/worktrees/` rather than promising not to touch the tree.

Share one tree only when you have a reason: two sessions genuinely collaborating on the same
branch, a toolchain that resolves paths against a fixed checkout, or a filesystem where a
second checkout is expensive. If you cannot name the reason, take the second worktree and
skip the rest of this guide.

## Notice the peer before you edit

There is no reliable enumeration of peer sessions, and it is worth stating that plainly
rather than implying a tool exists. `ListAgents` lists agents *you* can message — subagents
you spawned, and your own sessions the harness knows about — not arbitrary interactive
sessions another person started. No repository state records that a peer exists.

What does work is looking for their processes and their traces:

```bash
# Their shell commands are visible even when their session is not.
ps -eo pid,etime,args | rg -i 'claude|git ' | rg -v ' rg '

# Traces in the repository itself.
git status --short
git branch --show-current
git branch --sort=-committerdate | head -5
git log --oneline --all --since='2 hours ago' | head
```

Two of these are stronger signals than they look. A long `etime` on a shell running
`git -C <repo> status` is a peer mid-sweep. And a branch or a commit you do not recognise,
on a repository you believed you had to yourself, is the cheapest possible warning.

**On Windows-adjacent checkouts, `ps` sees only half the machine.** A worktree under `/mnt/`
in WSL is reachable from Windows too, so a `git.exe`, an editor's git integration, or a GUI
client can be holding the index while `ps` reports nothing. Check both sides —
`tasklist.exe | rg -i git` — or treat a negative `ps` result as inconclusive rather than as
proof of solitude.

Outside the tree, recent issues and pull requests opened by the same account are the other
tell:

```bash
gh pr list --state open --json number,title,headRefName,updatedAt
gh issue list --author "@me" --state open --limit 5
```

**Expect this to be inconclusive, and treat inconclusive as occupied.** The cost of assuming
a peer who is not there is that you stage explicit paths and write a scope line nobody reads.
The cost of assuming solitude is the incident this guide exists for.

## Declare scope before your first edit

This is the whole procedure, and each part is load-bearing.

**Before the first edit, not before the first commit.** By commit time the working tree has
already been shared for however long you were editing, and any detector fires after the fact.
The declaration is what makes the collision impossible, rather than visible.

**Divide by paths, not by tasks.** Two sessions working on unrelated tasks still collide in
one file. "I am doing the i18n work, you are doing the CI work" sounds like a division and is
not one: both touch `.github/workflows/`, both touch `CLAUDE.md`, and neither notices until
one of them overwrites the other. State directories and files.

**Name the branch too.** One worktree has one HEAD, so both sessions are always on the same
branch, and a peer's `git switch` or `git checkout -b` silently relocates where your next
commit lands. That is the founding incident: a file swept into a commit **on the wrong
branch**. Path scope with an unguarded HEAD still loses work.

```text
Branch: feat/590-diagram-parity — neither session switches without saying so
Session A: scripts/, scripts/test/, debt-ratchet.yml
Session B: README.md, docs/
Shared, ask before editing: CLAUDE.md, package.json, the registries
Nobody runs: git stash, git checkout -- <path>, git reset --hard
```

Two lines there are the ones people leave out. The **shared** line names the handful of files
every task eventually touches — the root instructions, the manifest, the registries — because
pretending they belong to one session is how the agreement quietly stops describing reality.
The **nobody runs** line names the whole-tree operations: `git stash` sweeps the peer's dirty
state along with yours, and a hard reset or a checkout of a path discards their uncommitted
work with no record it existed.

One more rule, inherited from the incident and worth repeating verbatim: **leave the
neighbour's edges alone** — additive files, and no rewriting of what is already placed.

Where the declaration lives matters less than that it exists before the editing does — with one
exception worth stating, because it looks like the obvious place and is the one that fails. A
message to the human running both sessions, a comment on the issue, or a message straight to the
peer all work. **`CONTINUE_HERE.md` does not** (#660). A handoff is addressed to the *next*
session, and the first session to read it consumes and deletes it; a scope declaration stored
there is therefore destroyed by the very reader it was supposed to bind, while the peer that
still needs it finds nothing. The declaration has to outlive being read, and a handoff is
defined by not doing that. What must not happen, in any case, is that it lives only in one
session's reasoning.

## Sharing one index

Two sessions share one `.git/index`, and git serialises access to it with a lock file. A peer
running `git status` refreshes and rewrites the index, which takes the lock, so an ordinary
read on their side can fail an ordinary write on yours:

```text
fatal: Unable to create '/path/to/repo/.git/index.lock': File exists.

Another git process seems to be running in this repository, e.g.
an editor opened by 'git commit'. Please make sure all processes
are terminated then try again. If it still fails, a git process
may have crashed in this repository earlier:
remove the file manually to continue.
```

**Both pieces of advice in that message are written for a single-user repository.** Terminating
processes kills your peer's work; removing the lock while they are mid-write corrupts the
index. With a peer in the tree the lock is far more likely to be a live command than a
crashed one.

The better fix is on the *reading* side, and neither session should be taking a write lock to
look at status:

```bash
# Does not take index.lock, so it cannot block a peer's commit.
GIT_OPTIONAL_LOCKS=0 git status --short
git --no-optional-locks status --short
```

Make that the habit for any polling or scripted status check. On the writing side, retry
rather than remove — and make the loop report honestly, because a bare `for` loop returns the
status of its last command and a permanently failing commit would otherwise read as success:

```bash
msg="$(mktemp)"                       # never a fixed name in a shared tree
printf 'feat: …\n' > "$msg"

committed=0
for attempt in 1 2 3 4 5; do
  if git commit -F "$msg"; then committed=1; break; fi
  git status --porcelain=v1 >/dev/null 2>&1 || true
  echo "attempt $attempt failed; retrying"
  sleep 5
done
[ "$committed" -eq 1 ] || { echo "FAILED: commit did not succeed" >&2; exit 1; }
```

Note the scratch file. A fixed `msg.txt` at the repository root is exactly the shared mutable
path this guide warns about: two sessions following this procedure would overwrite each
other's commit message, and the stray file is itself sweepable by the `git add -A` forbidden
below.

Only consider removing the lock when no git process exists **on either side of the WSL
boundary** and the file's mtime rules out any command still in flight. Even then, prefer
asking the human.

## What the guard covers, and what it cannot

The mechanics of `npm run guard:snapshot|verify|release` — what it compares, why file content
and index flags are included, and why ignored paths are out of scope — are documented once, in
[Sharing the worktree with a peer session](creating-workflows.md#sharing-the-worktree-with-a-peer-session).
Read them there.

What belongs here is only the consequence for coordination:

| Because the guard | You must |
|---|---|
| Cannot see a peer already working when you arrived | Treat an occupied worktree as a case for agreement, not for inspection |
| Records no owner | Never release a slot you did not arm |
| Reports tree movement, not run liveness | Not read a clean verify as "their run finished" |
| Prints recovery advice addressed to whoever armed it | Look at a borrowed verify; never act on what it tells you to do |

**The one sanctioned exception, when the arming session is genuinely gone.** `guard:release`
is still the wrong verb — it would drop a baseline you cannot interpret. The tool names the
right one in its own refusal message: `npm run guard:snapshot -- --force`. Order matters, and
neither the tool nor its message spells it out: run `guard:verify` first and *read the
changed-file list*, because forcing over unexamined movement rebaselines the dead run's damage
into a clean baseline. Verify, investigate, then force — and only when you know it is dead.

## Stage explicit paths — and find out what actually protects you

`git add -A`, `git add --all` and `git add .` cannot distinguish your work from a neighbour's
untracked file. This is not a stylistic preference: the incident that produced all of this was
a peer's `git add -A` sweeping another session's file into a commit on the wrong branch.

A permission rule can deny those forms, and **which file holds it decides who it protects**.
Check tracked-ness first, not contents — a rule in an untracked file protects one machine:

```bash
git ls-files .claude/            # what a clone actually receives
git check-ignore -v .claude/settings.json .claude/settings.local.json
```

By Claude Code convention `settings.local.json` is the personal, never-shared file, so reading
it answers a question about your machine and not about the repository. In this repository the
answer is starker than that: `.gitignore` ignores **both** `.claude/settings.json` and
`.claude/settings.local.json`, so a clone receives neither, and the deny rule that stops the
dangerous staging forms lives in `~/.claude/settings.json` — per machine.

Say that rather than implying more safety than exists: on a machine configured with the rule
the control is real and has been observed firing; for anyone else cloning this repository, the
discipline in this guide is the only control. Run the two commands rather than trusting this
paragraph, which is a point-in-time reading.

And staging explicitly is narrower than it sounds. `git add <directory>` on a directory
holding a stray file is indistinguishable from legitimate staging, so no deny rule that could
reasonably be written covers it. Name files when the directory is contested, and check what
you staged rather than what the tree contains:

```bash
git diff --cached --name-only
```

That is the check to use with a peer present. `git status --short` shows their dirty and
untracked files too, so it can never come back clean and tells you nothing about your own
staging.

## When a collision has already happened

Review the whole branch rather than its tip, and diff against the **merge base** rather than
the remote tip:

```bash
git fetch origin
git diff origin/main...HEAD --name-only     # three dots: merge base, your side only
git log origin/main..HEAD --stat            # two dots: correct here
```

The asymmetry is the trap. `git diff origin/main --name-only` — two dots — reports files
changed on *either* side, so on a branch that is behind, it lists everything `main` moved as
well. In this repository `main` moves on its own, because README regeneration auto-commits, so
the two-dot form reliably produces a page of false positives. `git log` two-dot is correct as
written; only the `diff` needs three.

If a file appears that you never touched, it is someone's live work sitting in the shared
tree. **Untrack it; do not delete it:**

```bash
git rm --cached path/to/their-file    # unstage and untrack, leave it on disk
```

Plain `git rm` removes it from disk, and if the peer never committed it anywhere, that is
their only copy. There is a second way the same work disappears: once their untracked file is
committed on your branch, it is tracked *there*, so switching branches removes it from the
shared tree. Untrack before switching, and tell them.

**Treat an unexplained stale generated file as evidence, not as a chore.** The incident behind
this guide was caught by `check-dreams` going red because an extra file made a committed
artifact stale, after `git status` had read clean. Regenerating first would have turned the
job green and buried the finding. When a generated artifact is stale for no reason you can
name, find the reason before you regenerate.

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| `Unable to create '.git/index.lock'` | A peer's `git status` or commit holds the index lock | Retry in a loop that reports failure honestly. Do not terminate processes or delete the lock while any git process exists — including Windows-side ones `ps` cannot see |
| A peer's status polling keeps blocking your commits | Plain `git status` takes a write lock | Both sessions switch to `GIT_OPTIONAL_LOCKS=0 git status` |
| `guard:snapshot` refuses — a snapshot already exists | A peer armed the guard, or your own earlier run did not release | Do not release it. If it is yours and the tree moved intentionally, `guard:snapshot -- --force`, then release when done. If the owner is gone, verify and read the changes first, then force |
| `guard:verify` reports movement you cannot explain | A peer edited files in your scope, or a background job of yours is mid-write | Read the changed-file list before acting. Never run the `git reset --mixed` line it prints unless you armed that snapshot |
| Your commit contains a file you never edited | `git add -A` or `git add <dir>` swept a peer's untracked file | `git diff origin/main...HEAD --name-only` to find it, `git rm --cached` to return it — never plain `git rm` |
| Your commit landed on an unexpected branch | One worktree, one HEAD; a peer switched it | Name the branch in the scope declaration. Recover with `git branch` and `git cherry-pick`, not by resetting a branch the peer is using |
| A generated file is stale and nothing you did explains it | The corpus moved underneath you | Investigate before regenerating — the staleness is the only signal you have |
| You cannot tell whether a peer is active | There is no enumeration of peer sessions | Treat inconclusive as occupied. Declaring scope costs one message; assuming solitude costs a commit |

## Related Resources

- [Creating Workflows](creating-workflows.md) -- guard mechanics, and the containment preamble for agents that run shell commands
- [Coordinate Peer Sessions](../skills/coordinate-peer-sessions/SKILL.md) -- the machine-executable form of this procedure
- [Commit Changes](../skills/commit-changes/SKILL.md) -- explicit-path staging
- [Understanding the System](understanding-the-system.md) -- how agents, skills and teams relate, and why subagent concurrency is a different problem
