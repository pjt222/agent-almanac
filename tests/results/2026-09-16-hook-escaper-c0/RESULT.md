# The SessionStart hook's `awk` fallback emits invalid JSON for every C0 byte but tab

Date: 2026-09-16. Branch `fix/468-continue-here-resolver`, PR #846.
Found by an adversarial review round of #846 (finding B1); re-derived independently before the fix.

## Question

`read-continue-here` 2.0's hook heredoc escapes its payload with `jq -Rsa .` when `jq` is present
and an inline `awk` program otherwise. Does the `awk` branch produce the same JSON as `jq`?

This matters because of the mechanism #844 established: stdout that begins with `{` and then fails
schema validation is a **non-blocking** error. The session continues, the payload is discarded, and
nothing reports it. The symptom that reaches the user is "the agent didn't seem to know what I was
working on" — so an escaper that emits unparseable JSON reopens #844 on the branch a machine
without `jq` takes, and `jq` is in neither a stock Ubuntu nor a macOS install.

## Method

`escaper-agreement.sh` runs fifteen inputs through the escaper and through `jq -Rsa .`, and scores
three things per input: does the `awk` output parse, does the `jq` output parse, and do the two
**decode to the same string**. It runs against every `awk` on PATH — here GNU Awk 5.2.1 and mawk
1.3.4, which is the pairing that matters since Debian/Ubuntu default to mawk.

`escaper-agreement-NEGATIVE.sh` is the same probe with the **shipped** escaper substituted in. It
is the control: without it, a probe that scores 15/15 is not evidence the probe can fail.

### One correction to the instrument, recorded because it inverted the first reading

The first run scored **0/15 — including the `plain` input**, which is not a plausible defect and
was the tell. The cause was the ruler, not the subject: `jq -Rsa .` on a file ending in a newline
keeps that newline in the value, while the `awk` program joins lines and drops it. The published
hook calls `emit "$(sed 's/\r$//' "$CONTINUE_FILE")"`, and command substitution strips trailing
newlines, so the real call path never carries one. The probe now normalises a single trailing
newline out of `jq`'s value before comparing, and says so at the comparison.

## Result

| escaper | gawk 5.2.1 | mawk 1.3.4 |
|---|---|---|
| shipped (`\\`, `"`, `\t` only) | **9/15** | **9/15** |
| repaired (full C0 range) | **15/15** | **15/15** |

The six inputs the shipped escaper fails, all producing `INVALID` where `jq` produces `VALID`:

| input | why it is ordinary here |
|---|---|
| mid-line `\r` | a progress line; `sed 's/\r$//'` only strips a *trailing* CR |
| ESC `0x1b` | a handoff quoting terminal output — `FORCE_COLOR=3` is set on this machine |
| `0x01` SOH | any pasted binary-ish fragment |
| `0x08 0x0b 0x0c` | backspace, vertical tab, form feed |
| all-controls line | the general case |
| CRLF file | covered by the strip, listed for completeness |

Full transcript of both runs: `probe-runs.txt`.

## The fix, and the four mutants that show the suite now sees it

The `awk` program builds an `esc[]` table over ``–``, keeps `\t`'s short escape, and
routes a line through a per-character loop **only** when it matches `/[\001-\037]/`, so the common
path is unchanged. Verified equivalent to `jq` on both awk implementations, 15/15.

`scripts/test/continue-here-blocks.test.js` could not see the defect: its escaping fixture's only
CR was trailing, and the row that exercised the `awk` branch had no CR at all — so `RESULT.md` for
the previous round reported "the `awk` fallback escapes correctly" about quote, backslash and tab
while printing it under a row implying CR was covered. The fixture now carries a mid-line CR, an
ESC, and BEL/BS/VT/FF.

Every new assertion was proven able to fail, via `npm run mutation-check`, each killed by exactly
one test:

| # | mutation | result |
|---|---|---|
| M1 | `if (line ~ /[\001-\037]/) {` → `if (0) {` — disables the C0 loop | KILLED by 1 |
| M2 | drop `-- "$CONTINUE_FILE"` from Step 5's commit | KILLED by 1 |
| M3 | delete Step 5's `${CONTINUE_FILE:?…}` guard (needle carries the next line, since the guard appears three times) | KILLED by 1 |
| M4 | `RESOLVER_CARRIERS = [READ, WRITE]` → `[READ]` | KILLED by 1 |

M3 and M4 are the two arms the same review round found **vacuous**: the unset-path arm was
satisfied by `rm ""` failing rather than by the guard, and the byte-identity comparison passed by
comparing one file to nothing. `mutants-3-4.sh` reproduces both; M1 and M2 are single
`mutation-check` invocations quoted in the commit message.

## What is NOT established

- **That Claude Code discards invalid-JSON stdout rather than falling back to raw text.** This is
  read from the hook reference and from #844's observed behaviour, not from a run that feeds it
  malformed JSON specifically. The settling experiment is a fourth arm in the earlier
  `hook-shape-probe.sh` printing the `awk` output for a sentinel containing an ESC byte, scored
  like arms A–C. The fix does not depend on the answer — valid JSON is correct either way — but
  the *severity* argument does.
- **macOS.** No Mac here. `sed 's/\r$//'` is separately suspect there (BSD `sed` reads `\r` as a
  literal `r` in a BRE, so the expression would strip a trailing `r` from ordinary words); that is
  reported as a non-blocking finding on the PR, not fixed in this commit, and it predates 2.0.
- **A NUL byte.** `awk` cannot carry one through `$0`, and a file containing one is binary as far
  as every tool here is concerned. Out of scope rather than handled.
