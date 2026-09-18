---
name: consult-a-decision-oracle
description: >
  Add an external probabilistic classifier to a decision path without letting it
  take the path over. Covers finding the externally-graded rows you are already
  logging, measuring the confidence separation between the oracle's agreements
  and its disagreements, choosing an operating point your own data licenses,
  failing open at the call site, and proving the whole arrangement offline with
  no API key. Applies to any service that returns a calibrated score — TypeSafe
  AI's System One models (Jev) are the worked example, and the method is the
  same for a hosted classifier, a small local model, or a second heuristic.
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
  tags: general, decision-oracle, calibrated-confidence, threshold, classifier, fail-open, typed-decision, measurement
---

# Consult a Decision Oracle

An oracle is any external service that answers a narrow question with a score
attached: a hosted classifier, a typed-decision API, a small local model, a
second heuristic that disagrees with your first one. Adding one to a working
decision path is easy. Adding one that you can still reason about after it has
been wrong is the actual job.

This skill is about the arrangement around the call, not the call. The failure
it exists to prevent is not "the oracle was wrong" — an oracle is wrong on some
fraction of inputs by construction, and you can measure that fraction. It is
the arrangement where nobody can say what that fraction is, the threshold came
from somewhere nobody remembers, and the oracle's absence looks exactly like a
quiet week.

**The vendor documentation is the source of truth for any API this skill
touches, and this file deliberately contains none of it** — no field names, no
status codes, no option caps, no token budgets, no recommended thresholds.
Those change, and a stale copy of them is worse than no copy: a downstream file
that pins a vendor's constants is a well-known cause of code written against
fields that no longer exist. Fetch them live. What is written down here is
method, which does not expire, and measurements that carry the date and the
model they were taken from.

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
- A source of **externally graded outcomes**: rows where something other than
  you decided whether the answer was right. Step 2 is about finding these; most
  systems already have them.
- The ability to run the decision path offline against recorded inputs.

**Optional**

- API credentials for the oracle. Needed to *measure*, not to follow the
  procedure or to run the Validation section — both work with recorded verdicts
  and no network.
- A cost-per-call figure, if the oracle is billed.

## Procedure

### Step 1: Name the one layer the oracle may touch

Decompose the decision into layers and pick exactly one for the oracle. Write
down, in a sentence, the **precondition** under which the oracle is consulted at
all — and make it a correctness property, not a cost saving.

A worked instance: a solver that reads an arithmetic word problem has a *number*
layer (which quantities are in the text) and an *operator* layer (what to do
with them). The oracle is asked only for the operator, and only when the
tokenizer recovered exactly two operands. That precondition is not there to save
money. An operator cannot rescue bad operands, so asking for one when the
numbers are already wrong converts an honest abstention into a confident wrong
answer.

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
draws on, the graded rows were **discovered, not built** — an append-only log
written to feed a circuit breaker had been accumulating externally-graded
outcomes for 39 days before anyone noticed it was a corpus. Nobody designed it;
two unrelated incidents five weeks apart produced it as a side effect.

Where external graders hide, with the provenance of each claim, is in
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

*(Illustrative shape, from a real run: 87 production rows, 70 externally graded,
model `jev-1.13.0`, measured 2026-09-17. Treat the numbers as an example of the
table, not as a property of any API.)*

**Expected:** A table carrying accuracy, baseline, and per-class counts, plus
the resolved model identifier and the date.

**On failure:** If accuracy does not beat the baseline by a margin you would
defend out loud, the oracle adds nothing here. That is a result. Publish it and
stop — an oracle that ties the baseline still costs latency, money and a
dependency.

### Step 4: Measure the separation, then choose an operating point inside it

This is the step the whole skill exists for, and the one most often skipped in
favour of a number someone already had.

Split the graded rows in two: rows where the oracle **agreed** with the external
verdict, and rows where it **disagreed**. Plot the gating scalar for each group.
You are looking for a **gap** — a range with no disagreements above it and no
agreements below it.

```text
  disagreements (oracle wrong):   all at or below  0.54
  agreements    (oracle right):   all at           1.00
  ------------------------------------------------------------
  free interval: (0.54, 1.00]  — any point costs nothing on this corpus
```

Every value inside the gap performs identically **on the rows you measured**.
That is what the measurement licenses, and it is all it licenses.

**Report the gap's width, not only its bounds — the width is the finding.** A
gap is evidence that the scalar separates right answers from wrong ones, and a
narrow one is weak evidence. Compare:

```text
  (0.54, 1.00]   width 0.46   a point in the middle has +/- 0.23 of headroom
  (0.44, 0.52]   width 0.08   a point in the middle has +/- 0.04 of headroom
```

Both "have a gap". Only the first survives a modest distribution shift, a model
version bump, or ten more graded rows. Treat a narrow gap as a reason to doubt
that a threshold exists at all rather than as a licence to pick the middle of
it — and if you ship one anyway, say in the same sentence how many rows produced
it, because a thin gap over few rows is two weaknesses compounding.

The choice of a specific point inside the gap is then a judgement about which
direction you would rather be wrong in — and it must be stated as a judgement,
in terms arithmetic can check.

Say, for example: *0.36 above the highest observed miss and 0.10 below the
lowest correct override, deliberately off-centre toward the override end so the
policy is biased against acting.* That sentence can be verified with a
calculator. "The midpoint" can also be verified with a calculator — which is the
point of the next paragraph.

**The trap that makes this step necessary.** In the integration behind this
skill, a threshold of 0.90 was documented for two months as "the interval's
midpoint" of (0.54, 1.00]. The midpoint of (0.54, 1.00] is **0.77**. The
justification was arithmetically false and nobody had run the one-line check.
Worse, once "midpoint" is removed, the measurement no longer selects 0.90 at
all — and the number that *was* sitting in the same file, cited approvingly, was
a vendor example's `> 0.9`. The most likely history is the reverse of what was
written down: the borrowed number arrived first and the measurement-flavoured
rationale was fitted to it afterwards.

> **A borrowed number can enter through the justification even when you believe
> you measured it.** The tell is that the stated reason does not survive
> arithmetic.

So: write the reason as a calculation, and then do the calculation.

Note also that the gating scalar is a *choice*. Some services return both a
confidence and a full probability distribution, and these are different
quantities — a concentration measure is not the probability of the winning
option, and the margin between the top two options is a third thing again.
Derive the separation over whichever scalar you intend to gate on; the procedure
is identical and the answer may not be.

**Expected:** A separation table, an explicitly named free interval **with its
width**, a chosen operating point, and a written reason for that point that is
checkable by arithmetic.

**On failure — and this is the important branch:**

> **No gap → the threshold does not exist → the oracle does not ship.**

Overlapping distributions mean the scalar does not distinguish the oracle's
right answers from its wrong ones, so no threshold can either. This is not a
failed step to retry; it is the procedure returning its answer. Record the
overlap and do not wire the oracle in. A procedure whose steps can only succeed
is a testimonial, not a method.

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

Log the oracle's answer, the scalar, the resolved model identifier and the
outcome on **every** call, including agreements. Logging only disagreements is
how an incident becomes unattributable.

**Expected:** A call site that produces byte-identical output to the pre-oracle
path whenever the oracle fails; a log line per consult; an alert on the
pin-retired error.

**On failure:** If removing the oracle changes output when it should not, the
fail-open path is not actually a fallback — it is a second code path with its own
behaviour. Fix that before measuring anything, because every number you have
taken describes a system you are not running.

### Step 6: Guard every value that arrives from the environment

The credential is not the only environment-sourced value that can arrive
malformed. Configuration systems that interpolate variables commonly leave an
**unset** variable as its own literal placeholder text rather than as an absent
value, and a model identifier, a threshold or a feature flag read straight from
the environment will then carry that literal into a request.

The guard tends to exist on the credential and nowhere else, because the
credential is where the author was thinking about failure.

```text
  read a secret      -> guarded:   reject a value that looks like a placeholder
  read a model id    -> unguarded: placeholder text is sent as the model id
  read a number      -> unguarded: Number(placeholder) is NaN, comparisons are
                        all false, and the feature turns itself off quietly
  read a boolean     -> depends entirely on how it is compared (see below)
```

The positive case is the instructive one. A kill switch compared against a
literal `"1"` is safe when its variable is unset, because placeholder text is not
`"1"`. The same switch written as a truthiness test would treat the placeholder
as *on*, disable the feature on every run, and look exactly like a deliberate
rollback. One line apart.

**Expected:** Every environment read either validated against its own accept
rule, or demonstrably safe under a placeholder value — with the demonstration
written down, not assumed.

**On failure:** If a malformed value produces the same observable state as a
legitimate one — the feature off, the oracle absent, the path unchanged — you
have a configuration error that reports itself as a benign condition. Give it a
distinct log line before moving on.

### Step 7: Ship an offline gate that a stranger can run

The measurement in Steps 3 and 4 is authoring-time work. It needs credentials,
it costs money, and no one will re-run it in CI. What ships instead is a gate
over **recorded** oracle verdicts that makes no network call at all.

Record the oracle's verdicts once, commit them as a fixture, and replay the
decision path against the fixture. Then hold these contracts:

- Under a stubbed failing oracle — throwing, timing out, rate-limited,
  unconfigured, and below-threshold — the output is **byte-identical** to the
  pre-oracle path.
- The consult fires only when Step 1's precondition holds.
- Previously-correct answers do not change.

Stub the oracle **explicitly** in every test. A client that reads its credential
from the environment will happily make real calls in any environment where the
credential happens to be set, which silently converts a build gate into a live,
billed run against a floating model.

Watch for the live-by-default hazard in the wiring itself:

```text
  oracle = options.oracle ?? liveClient     # every un-stubbed caller goes live
  oracle = options.oracle                   # a caller that forgets is a crash,
                                            # which is the failure you want
```

**Expected:** A test suite that passes with no credential present and no network
access, and that fails when any one of the contracts above is broken.

**On failure:** If the suite passes with the fail-open logic deliberately
removed, it is not testing fail-open. Break each contract on purpose and confirm
the gate goes red before trusting any of them.

## Validation

- [ ] One layer named, with a written precondition that is a correctness
      property rather than a cost saving
- [ ] Graded rows come from an external grader, and who graded them is written
      down
- [ ] Accuracy reported together with the majority-class baseline and per-class
      row counts
- [ ] Separation table produced; the free interval is stated explicitly
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
- [ ] An alert exists for the error a retired model pin produces

Run the whole list with no API key present. Any step that cannot be run that way
belongs in the Procedure, not here.

## Common Pitfalls

- **Replacing the heuristic instead of consulting it**: The integration this
  skill is drawn from changes 2 answers out of 87 (measured 2026-09-17 against
  resolved model `jev-1.13.0`); the heuristic path is 43/43 on the cases it
  attests. An oracle is a surgical second opinion on one layer. "Swap your rules
  for a model" is a different project with a different risk profile, and it
  needs its own ground truth.
- **Inheriting a threshold**: A number from a vendor example, a blog post or
  another team's service describes their data, not yours. It is also the most
  likely thing to sneak in through a justification you believe you derived —
  check the arithmetic of your own stated reason.
- **Reading a gap as binary**: "There is a gap" and "the gap is wide enough to
  survive a model bump" are different findings. Report the width beside the
  bounds.
- **Treating a confidence score as permission to act**: These scores generally
  measure how concentrated the answer distribution is, not whether the answer is
  right. A question with only one possible answer returns maximal confidence
  while carrying no information. And because the distribution is computed over
  the candidate set *you supplied*, the score can never tell you the candidate
  set itself was wrong — an input fitting none of your options still produces a
  confident-looking answer among them. Where the options may not cover every
  input, give them an explicit escape option; measured on one such pair, adding
  it changed nothing when unneeded and converted a wrong answer into the right
  one when needed.
- **Quoting a measurement without its provenance**: Every number here belongs to
  a resolved model version on a date. A figure quoted six months later without
  those reads as a property of the service, and the reader has no way to know it
  is stale.
- **Testing against the live service**: A gate that calls the oracle measures the
  oracle's availability and today's model version, not your code. It will also
  fail during an outage for reasons unrelated to the change under review.
- **Writing the conclusion before running the arm that could refute it**: Both
  sessions that produced this skill did exactly that within one afternoon. One
  described a corpus as "built" until its own commit history showed it was
  discovered; the other wrote that a failure "is not signalled by low
  confidence" until the missing control arm showed confidence had in fact
  degraded. Neither was careless. The instrument that catches this is not care —
  it is running the arm whose result would make you delete your sentence.

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
