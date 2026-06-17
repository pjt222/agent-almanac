---
name: memex-wrap
description: >
  Close out a finished memex milestone slice by writing the handoff trail:
  update `docs/CONTINUE_HERE.md` §1 current-state and §3 next-slice, tick the
  `docs/ROADMAP.md` scoreboard (milestone header ✅ + version, `- [x]` items),
  confirm any new observation is logged (deferring to memex-observe), and
  propose the git tag plus a `MN Slice X:` commit subject. Use after you finish
  a milestone slice in the memex repo and before you commit/tag it, when handing
  the next slice to a fresh session, or whenever CONTINUE_HERE and ROADMAP have
  drifted behind what actually shipped.
license: MIT
allowed-tools: Read Edit Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: memex
  complexity: intermediate
  language: multi
  tags: memex, handoff, milestone, continue-here, roadmap
  locale: zh-CN
  source_locale: en
  source_commit: 7d31fa1f
  translator: "Claude + human review"
  translation_date: "2026-06-17"
---

# Wrap a Memex Milestone Slice

Close the loop on a finished slice. A slice ships code; the wrap ships the
*trail* that lets the next session resume without re-deriving where things
stand. Two docs carry that trail — `docs/CONTINUE_HERE.md` (where we are,
what's next) and `docs/ROADMAP.md` (the milestone scoreboard) — and the
wrap leaves both consistent with what actually landed. It does **not** log
observations or run the verification gates itself; it confirms the first was
done (deferring to `memex-observe`) and hands off to the second (`memex-verify`).

## When to Use

- You just finished a milestone slice in the memex repo (a `- [x]`-sized
  unit of work) and are about to commit and tag it.
- You are handing the next slice to a fresh session and need
  `CONTINUE_HERE.md` to point at the right starting line.
- `CONTINUE_HERE.md` §1 or `ROADMAP.md`'s scoreboard has drifted behind
  what actually shipped, and you want to reconcile them before moving on.

<!-- These triggers also appear in the description so discovery sees them
     before the body loads. -->

## Inputs

- **Required**: The memex repo checked out, with `cwd` = repo root (a
  checkout of github.com/pjt222/memex). All paths below are repo-relative.
- **Required**: A finished slice — code committed or staged, slice known
  by its milestone + slice letter/number (e.g. "M5 Slice A").
- **Required**: `docs/CONTINUE_HERE.md` and `docs/ROADMAP.md` present and
  writable.
- **Optional**: `$MEMEX_STORE_PATH` / `$MEMEX_PG_URL` — only needed if Step 3
  ends up logging a new observation, and even then the logging itself is
  delegated to `memex-observe`, which owns those prerequisites.

This skill edits docs and proposes git commands. It does not push, tag, or
run the test gate — those belong to `commit-changes` and `memex-verify`.

## Procedure

### Step 1: Update `docs/CONTINUE_HERE.md` §1 (current state) and §3 (next slice)

Read the file first; both sections are prose with a specific shape you must
match, not free-form.

```bash
# Orient: the "Last updated" line, §1 Current state, §3 Next milestone
sed -n '1,40p' docs/CONTINUE_HERE.md
awk '/^## 1\./,/^## 2\./' docs/CONTINUE_HERE.md
awk '/^## 3\./,/^## 3a\./' docs/CONTINUE_HERE.md
```

Then edit (use the Edit tool — keep surrounding prose intact):

- **`Last updated:` line** near the top — set today's date and a one-line
  summary of the slice (mirror the existing format: date — what landed +
  the commit short-SHAs + branch + state).
- **§1 Current state** — move the finished slice from "in progress / next"
  into **Shipped**, following the existing `M_ ... (`shortsha`, tag `vX.Y.Z`)`
  cadence. If the slice opened new tech-debt or deferrals, note them where
  the section already tracks those.
- **§3 Next milestone** — if this slice completed a milestone, advance §3 to
  the next milestone (copy the goal / required-pieces / tasks-in-order /
  definition-of-done shape from `ROADMAP.md`). If the milestone has more
  slices left, narrow §3's "tasks in order" to the *next* slice so the
  fresh session starts on the right line.

**Expected:** §1 names the just-shipped slice under Shipped with its SHA(s)
and (if a milestone closed) tag; §3 describes the next concrete slice. The
`Last updated:` line reflects today.

**On failure:** If the section headers don't match (`## 1.` / `## 3.`), the
doc has been restructured — re-read it top-to-bottom and adapt to its current
headings rather than forcing the old shape. Never fabricate a SHA; if the
commit doesn't exist yet, write `(<commit pending>)` and fill it after Step 4.

### Step 2: Tick the `docs/ROADMAP.md` scoreboard

The scoreboard encodes completion two ways: a milestone **header** gains a
`✅ (vX.Y.Z)` suffix when the milestone is done, and each finished line item
flips `- [ ]` to `- [x]`. Read the relevant block first.

```bash
# Find the milestone block you're closing items in
awk '/^## M5/,/^## M6/' docs/ROADMAP.md
```

Then, with the Edit tool:

- **Check the items** you shipped: turn each finished `- [ ]` into `- [x]`.
  Leave genuinely-incomplete or deferred items as `- [ ]` (a deferred item
  often carries a `— deferred to MX.Y` note; preserve it).
- **Mark the header** *only when the whole milestone is done* — append
  ` ✅ (vX.Y.Z)` to the `## MN — ...` header, matching shipped milestones
  above it (e.g. `## M4 — MCP ✅ (v0.4.0)`). A milestone with any unchecked,
  non-deferred item is not done — do not flag its header.

**Expected:** Every item the slice completed reads `- [x]`; the header shows
`✅ (vX.Y.Z)` if and only if all of its non-deferred items are checked. The
new version matches the tag you propose in Step 4.

**On failure:** If you're unsure whether an item is truly done versus
partially done, leave it `- [ ]` and note the partial state in
`CONTINUE_HERE.md` §1 instead — an over-optimistic scoreboard is the exact
drift this skill exists to prevent. Match the existing checkbox/version
formatting; don't invent a new style.

### Step 3: Confirm any new observation is logged (defer to `memex-observe`)

A slice that surfaced a bias, a near-miss, or a reusable lesson should have a
matching observation in the bias-log. The wrap's job is to **confirm** that —
not to author the entry or restate the logging CLI.

```bash
# Quick existence check: does the bias-log already hold this slice's lesson?
sed -n '1,40p' docs/OBSERVATIONS.md
```

Decide:

- **Nothing worth logging?** Note that explicitly in `CONTINUE_HERE.md` §1
  ("no new observations this slice") so the next session knows it was
  considered, not skipped, and move on.
- **A lesson is worth logging?** Stop and run the **`memex-observe`** skill to
  add it. That skill owns the `memex add --type observation ...` command shape
  (body piped via stdin, `--title` required) and the prerequisites. Do not
  restate or inline that command here — invoke the skill.

The observation **body shape** lives in `docs/OBSERVATIONS.md` (the
authoritative "Two paths to add an observation" block is lines 10–21). The
current form (example, current as of v0.4.0; parsed by
`crates/memex-extract/src/meditate_vipassana.rs`) is:

```text
N. **Title.** Body sentence(s). Mitigation: <what to do next time>. Origin: <date> + <context>.
```

Treat `docs/OBSERVATIONS.md` lines 10–21 as the source of truth for this
shape — if it has moved on from the v0.4.0 form, follow the file, not this
example.

**Expected:** Either a recorded decision that there's nothing to log (noted
in §1), or a new observation added via `memex-observe` with the next entry
number.

**On failure:** If you can't tell whether a lesson is observation-worthy,
err toward logging it — a redundant observation costs little; a lost one
costs a re-derivation next session.

### Step 4: Propose the git tag and the commit subject

Don't commit or tag here — *propose* both so the operator (or the
`commit-changes` skill) can execute them. Use the memex commit convention:
subject = `MN Slice X: <summary>`.

```bash
# Surface what's staged/unstaged so the proposed subject matches reality
git -C . status --short
git -C . diff --stat
```

Propose:

- **Commit subject** — `MN Slice X: <imperative summary>` (e.g.
  `M5 Slice A: per-file project helper + watcher skeleton`). Keep the
  subject tight; put the *why* and the doc-trail updates in the body.
- **Tag** — only when this slice **closes a milestone**. Propose the next
  semver tag matching the `✅ (vX.Y.Z)` you set in Step 2 (e.g. `v0.5.0`
  for M5). A mid-milestone slice gets a commit but **no** tag — say so
  explicitly rather than proposing a tag.

Present both as a ready-to-run block for the operator to confirm:

```text
Proposed commit subject: M5 Slice A: per-file project helper + watcher skeleton
Proposed tag:           (none — mid-milestone slice; tag at M5 close as v0.5.0)
```

**Expected:** A clearly-labeled proposal: one commit subject in
`MN Slice X:` form, and either a concrete `vX.Y.Z` tag (milestone close) or
an explicit "no tag this slice" note. Nothing is committed or tagged by this
skill.

**On failure:** If the milestone number / slice letter is ambiguous, read
`ROADMAP.md` and `CONTINUE_HERE.md` §3 to fix the `MN` and `X`; never guess
a version — derive it from the scoreboard you just ticked in Step 2.

## Validation

- [ ] `CONTINUE_HERE.md` §1 lists the just-shipped slice under Shipped with
      its commit SHA(s), and `Last updated:` reflects today
- [ ] `CONTINUE_HERE.md` §3 points at the next concrete slice (advanced to the
      next milestone if this slice closed one)
- [ ] Every `ROADMAP.md` item the slice completed is now `- [x]`; deferred
      items remain `- [ ]` with their deferral notes intact
- [ ] The `ROADMAP.md` milestone header carries `✅ (vX.Y.Z)` **iff** all its
      non-deferred items are checked
- [ ] A new observation was added via `memex-observe`, or §1 explicitly
      records that none was needed
- [ ] A commit subject in `MN Slice X:` form is proposed, plus a concrete
      tag (milestone close) or an explicit "no tag" note — nothing committed
      or tagged by this skill

## Common Pitfalls

- **Flagging a milestone header done while an item is still open.** The `✅`
  on the header is an all-items claim. Tick items in Step 2 first, then check
  the header only if nothing non-deferred remains.
- **Restating the observation CLI here.** Step 3 confirms logging happened;
  it delegates the actual `memex add` to `memex-observe`. Inlining the command
  duplicates a surface that drifts — reference the skill instead.
- **Running `memex init`.** That is the CLI store/db setup command, not part
  of any wrap or session ritual. Wrapping a slice never calls `memex init`.
- **Inventing a SHA or version.** Derive the tag from the scoreboard you just
  ticked; derive the SHA from `git log` after the commit exists. Use a
  `(pending)` placeholder rather than a fabricated value.
- **Committing or tagging from this skill.** The wrap *proposes*; execution is
  `commit-changes`' job, and the test/format gate is `memex-verify`'s. Keep
  the boundary — don't let the heaviest skill absorb its neighbors.
- **Hard-asserting a test count as a pass gate.** That belongs to
  `memex-verify`, and even there the gate is exit 0 / "test result: ok" —
  counts (e.g. "~60 at v0.4.0") are informational and grow per milestone.
- **Forcing the old doc shape after a restructure.** If `## 1.` / `## 3.` or
  the scoreboard headings have changed, adapt to the file as it is now; the
  doc-reading order itself is owned by `adapters/session-init.txt`.

## Related Skills

- `memex-init` — the session-start counterpart: loads the trail this skill
  writes. Wrap closes the loop that init opens.
- `memex-observe` — owns logging a bias-log observation; Step 3 defers to it
  rather than restating its CLI.
- `memex-verify` — runs the test/format/build gate; the wrap proposes the
  commit, verify confirms the slice is green before it lands.
- `write-continue-here` — the general-purpose continuation-file skill; this
  skill is its memex-specific specialization for §1/§3 and the scoreboard.
- `commit-changes` — executes the commit subject and tag that Step 4 proposes.
