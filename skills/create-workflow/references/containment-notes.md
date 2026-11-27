# Workflow Containment Reference

Detailed rationale for `create-workflow` Step 11 (Contain a Fan-Out That Runs Against a Live Repository).

## Why `WRITE_LOCATION` Matters on Read-Only Stages

The advisory/implementing contract governs the agent type a stage *declares*, not what a `Bash`-capable agent does to the working tree. Read-only-by-intent stages are the exact stages that pollute the repository by inherited working directory alone, with no collision, no `git add`, and no intent to touch it.

Copy the template's `WRITE_LOCATION`: it names the stage's own `$DIR` (the directory the preamble's `mktemp -d` created), covers every file the agent produces by any tool, and rules out the repository root. It also tells the agent to print that path and reuse it literally, because nothing but files carries over between an agent's tool calls — each Bash call may start again in the launch directory with `DIR` unset.

A stage that must also write elsewhere narrows the line as a `<PREFIX>_WRITE_LOCATION` constant ("write only under `<that directory>` and your own `$DIR`; nowhere else in the repository") rather than dropping it. Integrity check A7b looks for the identifier, so a sentence typed in its place fails.

## How `repo-guard` Works

`verify` keeps the snapshot and `snapshot` refuses to overwrite one, so skipping `guard:release` leaves the next run failing with "a snapshot already exists". That is deliberate — re-arming mid-run would rebaseline the damage — so release is part of the loop, not an optional tidy-up. Note also that npm swallows `--release` as its own config, which is why `guard:release` is a script rather than a flag.

`repo-guard` compares `HEAD`, branch, worktree status, the content of every changed or untracked file, and index flags. Exit 1 prints the difference; exit 2 means it could not answer and must never be read as a pass. Two comparisons carry most of the weight:

- **`HEAD`** — the only one that catches a subagent that *committed* (the tree reads clean afterwards).
- **File content** — without which a stray write to an already-modified file is invisible because its status line does not move.

`repo-guard` does **not** cover ignored paths; walking them would mean hashing `node_modules`.

## Rationale for the `REPO_SAFETY` Rules

In `workflows/_template.mjs`'s own order (deliberately uncounted in the skill, because a count in a different file drifts):

1. **`mktemp -d`, never a shared fixed path.** Parallel agents told to build fixtures independently converge on the same obvious filename, and the second clobbers the first.
2. **`cd "${DIR:?}" || exit 1`.** A bare `cd` that fails does not reliably abort the surrounding script, and every following relative path then resolves against the repository. Braced because `cd ""` returns 0 without moving, so an unset `DIR` leaves the agent where it started and `|| exit 1` never fires.
3. **An absolute path under `$DIR` in every destructive command, braced** — write `rm -rf "${DIR:?}/fixtures"`, never `rm -rf fixtures` and never a bare `"$DIR/fixtures"`. The `cd` above is one control; a relative `rm` makes it the only one, so the single failure it guards against becomes repository damage instead of a wasted command. The brace is not decoration: an unset `DIR` leaves the agent standing in the repository *and* expands `"$DIR/fixtures"` to `/fixtures`. `:?` refuses both, unset and empty alike, on bash 5.2 and zsh 5.9.
4. **A cwd assertion before `git add`, `git commit`, or a tool run with a write flag** — narrower than "anything destructive", which is why rule 3 exists (`rm` falls outside it). Braced for rule 3's reason too: outside any repository `git rev-parse` prints nothing and an unset `DIR` makes the unbraced form compare `""` to `""` and pass:

   ```bash
   [ "$(git rev-parse --show-toplevel)" = "${DIR:?}" ] || exit 1
   ```

5. **Never `git commit`, `git update-index`, or `git checkout --` against the repository itself**, and never a repo tool with a write flag there.

## How the Three Controls Complement Each Other

Prefer `isolation: 'worktree'` for any stage that might mutate — it is the structural control and stronger than either of the others. The gap it leaves is the one the prompt sentence covers: a stage that is read-only *by intent* is never classified as mutating, and that is exactly the stage that pollutes by inherited working directory.

- The prompt *prevents* a compliant agent from writing where it stands.
- Worktree isolation *contains* a stage you expected to write.
- `repo-guard` *detects* what neither caught (running before and after the whole `Workflow(...)` call, since a workflow body cannot run shell).

What a prompt cannot do is bind: in #493 it named the directory, the tool, and the file to copy, the agent complied with all three, and the write still landed in the repository because the failure was mechanical. Instruction is worth its one sentence; enforcement is the guard's job and the worktree's.
