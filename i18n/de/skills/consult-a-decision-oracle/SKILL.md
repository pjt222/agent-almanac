---
name: consult-a-decision-oracle
description: >
  Add an external probabilistic classifier to a decision path without letting it
  take the path over. Covers finding the externally-graded rows you are already
  logging, measuring the confidence separation between the overrides it got
  right and the ones it got wrong, choosing an operating point your data
  licenses,
  failing open at the call site, and proving the whole arrangement offline with
  no API key. Applies to any service returning a score you can order — TypeSafe
  AI's System One models (Jev) are the worked example. Most of the method
  transfers to a local model or a second heuristic, with the parts that do not
  called out where they arise.
  Use when a rule-based path is wrong often enough to hurt, when someone
  proposes replacing a heuristic with a model, when a confidence threshold
  needs a defensible value, or when an oracle already in production has never
  been graded.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: advanced
  language: multi
  tags: decision-oracle, confidence-scalar, threshold, classifier, fail-open, typed-decision, measurement, separation
  locale: de
  source_locale: en
  source_commit: "941efa3f36583b72824567809ae696cd7cd81872"
  translator: "(untranslated stub)"
  translation_date: "2026-09-18"
---

# Consult a Decision Oracle

An oracle is any external service that answers a narrow question with a score
attached: a hosted classifier, a typed-decision API, a small local model, a
second heuristic that disagrees with your first one. Adding one to a working
decision path is easy. Adding one that you can still reason about after it has
been wrong is the actual job.

This skill is about the arrangement around the call, not the call. The failure
it prevents is not "the oracle was wrong" — an oracle is wrong on some fraction
of inputs by construction, and that fraction is measurable. It is the
arrangement where nobody can say what the fraction is, the threshold came from
somewhere nobody remembers, and the oracle's absence looks like a quiet week.

**The vendor documentation is the source of truth for any API this skill
touches, and this file pins none of it** — no field names, status codes, option
caps, token budgets or recommended thresholds. A stale copy is worse than none:
a downstream file pinning a vendor's constants is a known cause of code written
against fields that no longer exist, so fetch them live. What is here is method,
which does not expire, plus measurements carrying the date and model they came
from; a vendor's number appears only dated and as an anti-pattern.

## When to Use

- A rule-based or heuristic path is wrong often enough to cost something real,
  and you are considering a model as a second opinion
- Someone proposes replacing a heuristic with a classifier, and no one has
  measured either
- A confidence threshold needs a value and the candidates so far are a number
  from a vendor's example or a number that feels about right
- An oracle is already live and has never been graded against outcomes
- You want to know whether an oracle is safe to add *before* adding it, and
  the honest answer might be no

## Inputs

**Required**

- A decision path that already works without the oracle, and whose output you
  can capture. If there is no working path to fall back to, this skill does not
  apply — you are building a classifier, not consulting one.
- A source of **externally graded outcomes**: rows where something other than you
  decided whether the answer was right. More often already present than
  deliberately built — but whether YOURS has any is what Step 2 establishes
  rather than assumes.
- The ability to run the decision path offline against recorded inputs.

**Optional**

- API credentials for the oracle. Needed to *measure*, not to follow the procedure
  or to run the Validation section — both work with recorded verdicts, offline.
- A cost-per-call figure, if the oracle is billed.

## Procedure

### Step 1: Name the one layer the oracle may touch

Decompose the decision into layers and pick exactly one for the oracle. Write
down, in a sentence, the **precondition** under which the oracle is consulted at
all — and make it a correctness property, not a cost saving.

A worked instance: a solver reading an arithmetic word problem has a *number*
layer and an *operator* layer. The oracle is asked for the operator only, and
only when the tokenizer recovered exactly two operands — not to save money, but
because an operator cannot rescue bad operands: asking for one when the numbers
are already wrong converts an honest abstention into a confident wrong answer.

Resist "let the model handle the whole thing". A pipeline-wide oracle has no
layer with ground truth, so nothing in the rest of this procedure can be run.

**Expected:** One named layer, one written precondition, and a statement of what
the existing path does when the oracle is not consulted.

**On failure:** If no single layer can be named, the decision is not decomposed
enough to measure. Stop here and decompose it. If the precondition is really
about cost, you have a budget control, not a correctness gate — say so, and
expect it to be relaxed later by someone who does not know why it was there.

### Step 2: Find the external grader you are already logging

You need rows where **something other than you** judged the answer. Self-assigned
labels cannot grade an oracle: a corpus you labelled reproduces the form of a
measurement while removing the only property that made it one, and the resulting
test cannot fail for its own defect.

Do not build this corpus. Look for it. In the shipped integration this skill
draws on the graded rows were **discovered, not built**: a log written to feed a
circuit breaker had been accumulating externally-graded outcomes as a side effect
of two unrelated commits. Where such graders hide, with the provenance of each
claim and the measured span of that accident, is in
[references/EXAMPLES.md](references/EXAMPLES.md#where-external-graders-hide).

Then check the other direction, because it is the one nobody checks:

> **The signal you need may already exist by accident; the signal you built on
> purpose may already be dead.**

Audit what you deliberately record. A field captured *specifically* so that a
future problem would be detectable is worth nothing if no reader was ever
pointed at it. **Recording without a reader is not monitoring.**

**Expected:** A set of rows, each carrying the input, your path's answer, and an
outside verdict on that answer. Plus a one-line statement of who or what did the
grading and why they could not be influenced by you.

**On failure:** If no external grader exists anywhere in the system, you cannot
measure and therefore cannot set a threshold. Two honest exits: instrument now
and revisit when rows have accumulated, or ship no oracle. Fabricating labels is
not a third option.

### Step 3: Grade the oracle, with a baseline beside it

Replay the recorded inputs through the oracle and put its answer beside the
external verdict. Report three things together, never accuracy alone:

1. **Accuracy** on graded rows.
2. **The majority-class baseline** — what always guessing the most common answer
   would score. On a skewed corpus this is most of the apparent accuracy, and a
   bare accuracy figure flatters every classifier.
3. **Per-class row counts.** A class with two rows is not validated; it is
   unmeasured and looks measured. Print the counts so the gap is visible.

```text
                 rows   oracle correct   baseline (always most-common)
  overall          70          65 (92.9%)              54 (77.1%)
  class +          54          52
  class -           4           4          <- 4 rows: not validated
  class *          12           9
```

*(Illustrative shape, from a real run whose three denominators are in
[references/EXAMPLES.md](references/EXAMPLES.md#how-small-a-surgical-gate-is).
Treat the numbers as an example of the table, not a property of any API.)*

**Expected:** A table carrying accuracy, baseline, and per-class counts, plus
the resolved model identifier and the date. Read its verdict before moving on:
if accuracy does not beat the baseline by a margin you would defend out loud,
the oracle adds nothing here — publish that and stop, because one that ties the
baseline still costs latency, money and a dependency.

**On failure:** The table cannot be produced, which differs from a table carrying
a disappointing number. No resolvable model identifier, missing per-class counts
and a single-class corpus each block Step 4 rather than informing it — a version
nothing can be attributed to, a validated class indistinguishable from an
unmeasured one, and an accuracy that is meaningless rather than high. Fix the
instrumentation first.

### Step 4: Measure the separation, then choose an operating point inside it

This is the step the whole skill exists for, and the one most often skipped in
favour of a number someone already had.

Three words get used loosely here and the step breaks if they blur. Keep them
apart:

- an **override** is a row where the oracle's answer differs from the path's
- **right** / **wrong** is the grader's verdict on an answer
- **harm** is what acting *did*: whether firing the gate changed the emitted
  answer from right to wrong, or from wrong to right

> **Step 3 counts the oracle's errors. Step 4 counts the gate's harm.**

That distinction decides which rows belong in the table. A row belongs **only if
acting on the oracle changes whether the emitted answer is right.** Two classes
fail that test and must be excluded:

```text
  agreement    oracle answer == path answer
               -> threshold-invariant: the same answer is emitted either way
  both-wrong   override where neither the oracle nor the path is right
               -> outcome-invariant: a different wrong answer is still wrong
```

What remains splits by harm, never by whether the oracle was right:

```text
  harmful      override, oracle wrong, path right    acting made it worse
  beneficial   override, oracle right, path wrong    acting made it better

  free interval = (highest harmful, lowest beneficial]
```

**Both exclusions are load-bearing.** A low-scoring agreement row or a
high-scoring both-wrong row each lifts `max(harmful)` past `min(beneficial)` and
collapses a gap that is real, on corpora where every threshold in the true
interval emits strictly better answers. Three regression arms demonstrate it,
including the control that stops the other two passing vacuously:

```bash
python3 references/separation.py          # 3 arms; exits non-zero if any fails
```

**State the gate operator, because the interval's closed end depends on it.**
The notation above assumes `scalar >= threshold`. Under a strict `>` the free
endpoint is the *lower* one and the interval is `[highest harmful, lowest
beneficial)`. This is not pedantry: on a corpus whose beneficial rows all score
1.00, taking 1.00 as the threshold under `>` fires on nothing at all and
silently disables the oracle — the endpoint you were told was free. A missing
scalar disables it the same way: `undefined >= X` is false and raises nothing, so
assert the field is present before comparing it.

**Report the width and the row counts, not only the bounds.** A gap is evidence
that the scalar orders right above wrong, and a narrow gap over few rows is weak
evidence twice over:

```text
  (0.54, 1.00]   width 0.46   +/- 0.23 headroom      n harmful=5, n beneficial=2
  (0.44, 0.52]   width 0.08   +/- 0.04 headroom      n harmful=2, n beneficial=3
```

The first row is real — model `jev-1.13.0`, measured 2026-09-17 — and the
second is the synthetic fixture. Both are shapes to copy, not values to reuse.

Width alone does not rescue this — 0.46 from two rows and 0.46 from two hundred
are the same width and not the same finding, which is the argument for reporting
width applied one level up. Both numbers, always.

The choice of a point inside the gap is then a judgement about which direction
you would rather be wrong in, stated in terms arithmetic can check — *0.36 above
the highest harmful row and 0.10 below the lowest beneficial one, off-centre
toward the upper end so the policy is biased against acting.* A reader can
recompute every number in that sentence.

The alternative is what actually happened: a threshold documented as "the
midpoint" of an interval whose midpoint it was not, with a vendor's number
unacknowledged in the same file ([the full
case](references/EXAMPLES.md#worked-derivation-and-the-mistake-in-it)).

> **A borrowed number can enter through the justification even when you believe
> you measured it.** The tell is that the reason does not survive arithmetic.

The gating scalar is itself a *choice*, and the candidates are not
interchangeable —
[which scalar to gate on](references/EXAMPLES.md#choosing-the-gating-scalar).

**Expected:** A separation table naming the excluded classes and their counts; a
free interval with its **width**, its **row count on each side**, and the **gate
operator** its bracket assumes; a chosen operating point; and a reason for that
point that a reader can recompute.

**On failure:** Three distinct exits, and only the first is a retry.

*The log is censored.* On a discovered corpus from an already-live oracle, the
log usually records only the overrides that fired; every suppressed one,
including every harmful one the current gate blocked, is absent. `max(harmful)`
is then computed on a set truncated at the threshold you already have, so you
re-derive your own threshold and call it measured. Confirm the log records the
oracle's answer *even when it was not applied* — if not, Step 4 cannot run here:
instrument per Step 5 and wait.

*One side is empty.* No harmful rows, or no beneficial ones, is not a gap of
infinite width; it is a corpus that has not yet exercised what you are
measuring.

*No gap.* The classes overlap:

> **No gap → the threshold does not exist → the oracle does not ship.**

The scalar does not order harmful below beneficial, so no threshold can. This is
not a failed step to retry; it is the procedure returning its answer. A
procedure whose steps can only succeed is a testimonial, not a method.

### Step 5: Wire the consult so its absence is loud

Enforce fail-open **at the call site**. Do not rely on the client's promise never
to throw: wrap the consult, and on any failure use the answer the path would have
produced anyway. A caller that trusts the callee's contract is one dependency
upgrade away from a new exception type.

For the surrounding degradation ladder — capability maps, fallback selection,
scope reduction when no fallback exists — use
[`circuit-breaker-pattern`](../circuit-breaker-pattern/SKILL.md), which owns
that ground. What this skill adds is the part that ladder does not cover:

**A mitigation that swaps one silent failure for another is not a mitigation.**
Consider pinning an oracle to a specific model version. The floating alias fails
silently in one direction: the version moves and your measured threshold quietly
stops describing the model it was measured against. The pinned version fails
silently in the other: the version is retired, every call errors, fail-open
returns the pre-oracle answer, and a dead oracle is indistinguishable from an
uneventful week. Pinning is right — but **pin plus a tripwire** on the specific
error that a retired pin produces, or you have moved the failure rather than
removed it.

**Step 6 is a precondition of that pin, not a later refinement.** Where the model
identifier is environment-sourced, pinning is the change that first puts a value
in that variable, so an unguarded read is armed by the pin itself: placeholder
text goes out as the model id on every call. A tripwire tells you afterwards, and
only if that is the error it watches; the guard refuses the value beforehand.

Log the oracle's answer, the scalar, the resolved model identifier and the
outcome on **every** call, including agreements. Logging only disagreements is
how an incident becomes unattributable.

**And the logged identifier needs a reader.** That tripwire covers the PINNED
direction only. The floating direction — the alias moves and the threshold
quietly stops describing the model it was measured against — has no detector
unless one is built, and the symmetric one is cheap: read the recorded identifier
back out of the log and compare it against the one the operating point was
measured on. It should not move an exit code — a floating model is not the same
question as a service being down — but a mismatch must reach a person, or the
reader is one more unread record. Reported from production, the identifier was
logged on every call exactly as this step says and nothing read it — detectable
in principle, undetected in practice.

**Expected:** A call site that produces byte-identical output to the pre-oracle
path whenever the oracle fails; a log line per consult; an alert on the
pin-retired error; a reader that compares the logged identifier against the one
the operating point was measured on; and Step 6 already done for any
environment-sourced value the pin introduces.

**On failure:** If removing the oracle changes output when it should not, the
fail-open path is a second code path with its own behaviour, and every number you
have taken describes a system you are not running — fix that before measuring
anything. A missing log line on agreements censors the corpus in the way Step 4's
first exit describes, and Step 4 will not be runnable on it later. A pin with no
alert, or one that landed before its variable was guarded, leaves a dependency
whose death is indistinguishable from a quiet week; a
logged identifier with no reader leaves the other direction the same way. Neither
is a smaller version of the problem.

### Step 6: Guard every value that arrives from the environment

The credential is not the only environment-sourced value that can arrive
malformed. Some configuration systems that interpolate variables leave an
**unset** variable as its own literal placeholder text rather than as an absent
value, and a model identifier, a threshold or a feature flag read straight from
the environment will then carry that literal into a request.

The guard tends to exist on the credential and nowhere else, because that is
where the author was thinking about failure. What each other read does instead —
including the boolean case, where one line separates a safe comparison from one
that disables the feature on every run and looks like a deliberate rollback — is
in [references/EXAMPLES.md](references/EXAMPLES.md#what-an-unguarded-environment-read-does).

**Expected:** Every environment read either validated against its own accept
rule, or demonstrably safe under a placeholder value — with the demonstration
written down, not assumed.

**On failure:** If a malformed value produces the same observable state as a
legitimate one — the feature off, the oracle absent, the path unchanged — the
read is neither validated nor demonstrably safe, and you have a configuration
error reporting itself as a benign condition. Add the accept rule, or change the
comparison so the placeholder falls to the safe side, then write the
demonstration down. A distinct log line is worth adding and does not discharge
this step: it tells you afterwards, whereas Expected asks that the value could
not have been wrong.

### Step 7: Ship an offline gate that a stranger can run

The measurement in Steps 3 and 4 is authoring-time work: it needs credentials, it
costs money, and no one will re-run it in CI. What ships instead is a gate over
**recorded** verdicts that makes no network call — record them once, commit them
as a fixture, replay the decision path against it, and hold these contracts:

- Under a stubbed failing oracle — throwing, timing out, rate-limited,
  unconfigured, and below-threshold — the output is **byte-identical** to the
  pre-oracle path.
- The consult fires only when Step 1's precondition holds.
- Previously-correct answers do not change.

Stub the oracle **explicitly** in every test. A client that reads its credential
from the environment makes real calls wherever that credential happens to be set,
silently converting a build gate into a live, billed run against a floating
model.

Watch for the live-by-default hazard in the wiring itself — one `??` decides
whether a forgetful caller crashes or quietly bills you:
[the two lines](references/EXAMPLES.md#the-live-by-default-hazard).

**Expected:** A test suite that passes with no credential present and no network
access — and, for each contract above, a record of having broken it on purpose
once and watched the suite go red. The second half is what makes the first half
evidence rather than a green light.

**On failure:** A contract whose deliberate breakage leaves the suite green is not
covered, whatever the file appears to assert. Two shapes recur: the assertion
compares something the mutation does not reach, and the stub is not installed on
the path under test, so the real client answers instead. Repair the test and
break it again — a contract you could not make fail is one you have no evidence
for.

## Validation

- [ ] One layer named, with a written precondition that is a correctness
      property rather than a cost saving
- [ ] Graded rows come from an external grader, and who graded them is written
      down
- [ ] Accuracy reported together with the majority-class baseline and per-class
      row counts
- [ ] Separation table produced over harmful and beneficial rows only, with
      agreement and both-wrong rows excluded and counted
- [ ] The free interval states its width, its row count on each side, and the
      gate operator its bracket assumes
- [ ] The log was confirmed to record the oracle's answer even when it was not
      applied, so the override set is not censored at the current threshold
- [ ] The chosen operating point has a written reason, and that reason survives
      being checked with a calculator
- [ ] Every measurement carries the resolved model identifier and the date it
      was taken
- [ ] With the oracle stubbed to fail — throwing, timeout, rate-limited,
      unconfigured, below-threshold — output is byte-identical to the pre-oracle
      path in all five cases
- [ ] The consult does not fire when the precondition is unmet
- [ ] The offline gate passes with no credential in the environment
- [ ] Each contract has been broken on purpose once, and the gate went red
- [ ] An alert exists for the pin-retired error, and something READS the logged
      model identifier back — the alert covers only the pinned direction
- [ ] Every environment-sourced value in the request was guarded BEFORE the pin
      landed — for the model id specifically, the pin is what first puts a value
      in its variable

Run the whole list with no API key present; any step that cannot be run that way
belongs in the Procedure, not here. `references/separation.py` exercises the
three regression arms for the separation predicate, exiting non-zero if any fails.

## Common Pitfalls

- **Replacing the heuristic instead of consulting it**: An oracle is a surgical
  second opinion on one layer. "Swap your rules for a model" is a different
  project needing its own ground truth — and the numbers from the integration
  this skill draws on, whose three denominators do not nest, are in
  [references/EXAMPLES.md](references/EXAMPLES.md#how-small-a-surgical-gate-is).
- **Inheriting a threshold**: A number from a vendor example, a blog post or
  another team's service describes their data, not yours. It is also the most
  likely thing to sneak in through a justification you believe you derived —
  check the arithmetic of your own stated reason.
- **Reading a gap as binary**: "There is a gap" and "the gap is wide enough to
  survive a model bump" are different findings. Report the width beside the
  bounds.
- **Treating a confidence score as permission to act**: These scores generally
  measure how concentrated the answer distribution is, not whether the answer is
  right, and the distribution is computed over the candidate set *you supplied* —
  so the score can never tell you that set was wrong. Give the options an
  explicit escape option where they may not cover every input:
  [what that measured](references/EXAMPLES.md#what-a-confidence-score-cannot-tell-you).
- **Quoting a measurement without its provenance**: Every number here belongs to
  a resolved model version on a date. A figure quoted six months later without
  those reads as a property of the service, and the reader has no way to know it
  is stale.
- **Testing against the live service**: A gate that calls the oracle measures the
  oracle's availability and today's model version, not your code. It will also
  fail during an outage for reasons unrelated to the change under review.
- **Writing the conclusion before running the arm that could refute it**: the
  instrument that catches this is not care — it is running the arm whose result
  would make you delete your sentence. Both sessions that produced this skill
  failed it within one afternoon:
  [how](references/EXAMPLES.md#writing-the-conclusion-first).

## Related Skills

- [`circuit-breaker-pattern`](../circuit-breaker-pattern/SKILL.md) — owns the
  degradation ladder this skill defers to: capability maps, per-entry fallbacks,
  scope reduction when nothing is available
- [`fail-early-pattern`](../fail-early-pattern/SKILL.md) — validating inputs at a
  trust boundary, the complement to Step 6's environment guards
- [`verify-agent-output`](../verify-agent-output/SKILL.md) — the same trust
  problem where the second opinion is another agent rather than a scored service
- [`du-dum`](../du-dum/SKILL.md) — deciding how often to consult anything
  expensive at all
- [`evaluate-agent-framework`](../evaluate-agent-framework/SKILL.md) — assessing
  a dependency before adopting it, upstream of this skill
