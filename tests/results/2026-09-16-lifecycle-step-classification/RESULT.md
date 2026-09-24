# The lifecycle step could not run in its primary case, and misreported four states

Date: 2026-09-16. Branch `fix/775-660-handoff-lifecycle`, PR #856.
Both defects found by an adversarial round on that PR; both re-derived here before being fixed.

## What the step claims

`write-continue-here`'s new Step 4 (#775) states the tracked-vs-ignored trade-off and **detects**
the current state rather than assuming one. Detection is the whole claim: the step deliberately
enforces nothing, so its only output is a classification. A detector that answers confidently when
it cannot see is therefore the worst thing it can do.

## B1 — the guard aborted in the case the step was added for

Step 4's guard pointed at Step 2's resolver. That resolver assigns `CONTINUE_FILE` **only when a
handoff already exists** at a candidate path. Step 2's own third bullet covers the other case —
*"No handoff at all — this is the first one"* — and there the variable is empty by design.

```
before Step 3 installs: CONTINUE_FILE=[]                  -> EMPTY, so the Step 4 guard aborts
after  Step 3 installs: CONTINUE_FILE=[CONTINUE_HERE.md]  -> set, Step 4 works
```

The remedy the guard offered was unsatisfiable: re-running Step 2's block returns empty again,
because the file is still `CONTINUE_HERE.draft.md` until Step 3's `mv -n`. And a project writing
its **first** handoff is exactly the project that has not chosen a lifecycle — so the step failed
in its primary case.

The sibling skill already carried the missing sentence (`read-continue-here` Step 2: *"shell state
does not survive between steps"*); `write-continue-here` had no equivalent anywhere. Fixed by
pointing the guard at the installed path and borrowing that sentence.

## B2 — `else` meant "everything I could not measure"

Seven cases, executed against the fence bytes extracted from the skill, shipped block against the
repair. Full transcript in `probe-runs.txt`; `lifecycle-probe.sh` reproduces it.

| case | `ls-files` | `check-ignore` | shipped | repaired |
|---|---|---|---|---|
| tracked | 0 | 1 | TRACKED | TRACKED |
| ignored by the repo rule | 1 | 0 | IGNORED | IGNORED |
| untracked, not ignored | 1 | 1 | UNDECIDED | UNDECIDED |
| tracked **and** matching an ignore rule | 0 | 1 | TRACKED | TRACKED |
| **outside any repository** | **128** | **128** | **UNDECIDED** | NOT IN A REPOSITORY |
| **handoff in another repository** | **128** | **128** | **UNDECIDED** | IGNORED |
| **absent / unreadable `.git`** | **128** | **128** | **UNDECIDED** | NOT IN A REPOSITORY |

Exit 0 throughout, both stderr streams suppressed. The sharpest case is the first 128 row: the
step's **own On-failure text already knew the answer** — *"outside a git repository the question
does not arise — the handoff is an ordinary file and deleting it is final"* — while the fence
printed *"untracked and not ignored, the state most likely to be swept into an unrelated commit"*.
There is no repository, nothing is tracked or untracked, and nothing can sweep it.

Note the asymmetry with `read-continue-here` Step 5, which documents the same exit codes and
deliberately does **not** distinguish them. That reasoning is sound there and unsound here: Step 5's
`else` performs one harmless action (`rm` a file it resolved), while Step 4's `else` *asserts a
classification*. Conflating "not ignored" with "could not tell" is free when you are acting and
wrong when you are reporting.

Repaired by anchoring on the directory holding the handoff (`git -C "$HOME_DIR"`) and probing for a
work tree before either discriminator.

## Two smaller things the same round measured

**`IGNORED` was not necessarily the project's choice.** A user-level `core.excludesFile` produces
the identical verdict, while a collaborator cloning the same repository without it gets UNDECIDED —
one label over two different facts, with the consequence (*"deletions are final"*) stated
unconditionally. `check-ignore -v` names the deciding file in one extra line:

```
decided by: .gitignore:1:CONTINUE_HERE*.md                     <- the project decided
decided by: /tmp/…/globalignore:1:CONTINUE_HERE*.md            <- this machine decided
```

**A leading dash was parsed as options.** `git ls-files --error-unmatch -CONTINUE_HERE.md` fails
with `error: unknown switch 'C'` at exit **129**, not 128 — neither command used `--`. Both do now.

## The apostrophe, which is the real lesson here

The first version of the repaired guard read `…or re-run Step 2's resolver…`. **An apostrophe
inside `${VAR:?message}` is a bash syntax error and valid zsh** (`apostrophe-probe.sh`):

```
WITH an apostrophe:     bash exit=2  unexpected EOF while looking for matching `'
                        zsh  exit=1  X: re-run Step 2's resolver now that the file exists
WITHOUT it:             bash exit=1  X: re-run the Step 2 resolver now that the file exists
                        zsh  exit=1  X: re-run the Step 2 resolver now that the file exists
```

The `Bash` tool in this environment runs **zsh**, so the zsh column is identical across both pairs
and the broken form looked correct every way it could be run by hand. This is the **same class** the
2026-09-15 round found in `read-continue-here` — reintroduced the next day, by the person who had
written that finding up.

It was caught by `scripts/test/continue-here-blocks.test.js`, which runs the extracted fence under
`bash -c`. That is the argument for the test, not for reading more carefully: careful reading is
what produced the bug.

## Coverage

Step 4 was the only published block in this pair with no owner. The new arm
(`lifecycle: names each state, and refuses to classify one it cannot see`) fixtures all four
verdicts, including the two 128 cases. Suite 13/13. Three mutants, each **killed by exactly one
test**:

| mutation | result |
|---|---|
| `if ! git -C "$HOME_DIR" rev-parse --is-inside-work-tree …` → `if false;` | KILLED by 1 |
| drop `-C "$HOME_DIR"` from the `check-ignore` arm | KILLED by 1 |
| delete the `decided by:` line | KILLED by 1 |

Two earlier mutation attempts were **refused as no-ops** — the needles did not match the file's
exact bytes (`printf %s` against the file's `printf '%s'`). That refusal is the tool working: a
silently-unmatched mutation is what makes a negative test pass vacuously.

## What is NOT established

- **That UNDECIDED is common in the wild.** The reviewer argues it is the default for any first
  handoff, since TRACKED is unreachable by construction for a file that has never existed. That is
  a derivation, not a survey.
- **Whether a reader of `decided by:` acts on it.** The line distinguishes a project rule from a
  machine rule; nothing measures whether that distinction changes anyone's behaviour.
- **Any loader/consumer behaviour beyond git's exit codes**, which were measured on the git in this
  environment only.
