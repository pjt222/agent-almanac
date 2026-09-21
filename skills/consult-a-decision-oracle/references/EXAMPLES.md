# Examples — consult-a-decision-oracle

Extended material for [SKILL.md](../SKILL.md). No inventory of it here: the previous two
attempts at one said "three parts" through the revisions that made it four, then six,
and this revision's own list omitted three sections while claiming to avoid exactly that.
The headings below are the list, and they cannot go stale.

**Provenance is marked per entry throughout.** One case here is a real shipped
integration; the rest of the taxonomy is inference about where the same shape
turns up elsewhere. Inference sitting next to a verified case tends to acquire
the verified case's authority, so each entry says which it is:

- **[shipped]** — observed in a system that ran in production
- **[inference]** — a plausible instance of the same shape, not verified by the
  author
- **[reported]** — observed in a production system by someone else and relayed here.
  Stronger than inference, weaker than shipped: the author could not inspect the
  system, so the mechanism is carried and the measurements are not
- **[authoring]** — observed while writing this skill. Not production, and labelled
  rather than dropped because the failure modes of writing a method down are the ones
  a reader is about to repeat

---

## Where external graders hide

You are looking for rows where **something other than your code** decided whether
an answer was right. The grader must be unable to inherit your mistake. That
rules out your own labels, your own heuristic's output, and any model you also
consult.

### The shape, from the one case that is not inference

**[shipped]** A verification path posted an answer to a remote platform, and the
platform replied `accepted`, `rejected` or `expired`. Those replies were appended
to a log so that a circuit breaker could count consecutive failures and stop the
account being suspended. That is the whole reason the log existed.

Thirty-nine days later, during an unrelated incident, someone opened the log and
realised it had been accumulating externally-graded rows the entire time: input,
the path's answer, and a verdict from an authority that could not be influenced
by the code under test. Nobody designed a corpus. Two unrelated commits, five
weeks apart, produced one as a side effect.

The transferable part is the *search*, not the platform: **the grading signal was
already being written down for another purpose.**

### Candidate hiding places

| Where | The graded signal | Why the grader is external |
|---|---|---|
| CI history **[inference]** | a job that passed or failed after your tool's suggestion was applied | the test suite did not consult your classifier |
| Payment/settlement logs **[inference]** | authorised vs declined | the processor decided |
| Retry records **[inference, weak]** | an operation that failed, then succeeded unchanged on retry | evidence of a *transient* failure only — it does not establish that a decision was wrong, so it grades a classifier poorly or not at all |
| Support/ticket routing **[inference]** | tickets reassigned after their first routing | the human who moved it disagreed |
| Moderation queues **[inference]** | an automated decision later overturned on appeal | the appeal reviewer is independent |
| Search and recommendation **[inference]** | the result the user actually clicked after being shown your ranking | the user is not your code — but see the caveat below |
| Spam/fraud outcomes **[inference]** | a chargeback, a confirmed-fraud flag, an account later banned | the outcome arrived after and independent of the decision |
| Compiler and type errors **[inference]** | a generated change that did or did not build | the compiler is indifferent to your reasoning |
| Deployment outcomes **[inference]** | a release that was rolled back | the rollback decision came from elsewhere |

### Three ways this goes wrong

All three are **[inference]** — failure modes I expect from the shape of the data,
not ones observed in the shipped case.

**A grader that saw your answer first.** If a human reviewer is shown your
system's suggestion before deciding, their verdict is contaminated by it.
Anchoring is strong and the resulting corpus overstates agreement. Prefer
outcomes recorded before your decision existed, or recorded by someone who never
saw it.

**Survivorship in the log.** If only failures are logged, the corpus contains no
agreements and no separation can be computed — the distribution you most need is
the one that was never written down. Log every consult, including the ones where
everything agreed.

**Click-through as truth.** A click grades *what was shown*, not what was best.
It is external, and it is biased by position and presentation. Usable with that
stated; misleading when quoted as accuracy.

---

## A verdict fixture the Validation section can actually run

The Validation checklist must run for a reader with no API key, so it cannot depend
on anyone's recorded production verdicts. `references/fixture.json` ships beside this
file, and `references/separation.py` reads it:

```bash
python3 separation.py fixture.json    # the table for these rows, under both gate operators
python3 separation.py                 # the three regression arms; non-zero if any fails
```

**A synthetic *verdict* fixture is legitimate where a synthetic *corpus* is not.** A
synthetic corpus assigns the labels that grade the oracle, which is circular. This
grades nothing: it exercises *your* table computation and fail-open code against rows
whose expected output you can state independently. You are testing your arithmetic.

Each row carries the scalar, the path's answer, the oracle's answer and the grader's
answer, because the harm predicate needs all four — `oracle_was_right` alone cannot
tell a harmful override from a both-wrong one.

**Variant A — all eight rows. No gap, and that is the assertion.**

```text
  harmful    0.38, 0.44, 0.97      highest harmful    = 0.97
  beneficial 0.52, 0.93, 0.99      lowest beneficial  = 0.52
  0.97 > 0.52  ->  classes overlap  ->  no threshold separates them
```

Running Step 4 over Variant A must reach the *no gap → the oracle does not ship*
branch. A fixture that always separates teaches a reader to expect separation, so the
default variant here does not. **A fixture the procedure always passes is not a test
of the procedure.**

**Variant B — drop `f3`. It separates, and only under the right predicate.**

```text
  harm predicate      highest harmful 0.44 < lowest beneficial 0.52  -> (0.44, 0.52]
                      width 0.08, n harmful 2, n beneficial 3, gate >=
  all rows            -> NO GAP        (f7, an agreement at 0.50, poisons it)
  override+was_right  -> NO GAP        (f8, a both-wrong override at 0.96, poisons it)

  emitted-correct:  t=0.45 -> 6/7   t=0.52 -> 6/7   t=0.60 -> 5/7
```

The emitted-correct row is what makes `(0.44, 0.52]` the honest answer rather than an
artefact: every threshold inside it scores 6 of 7, and the first one outside scores 5.
`f7` and `f8` exist precisely so the wrong predicates fail here — a fixture that
passes under all three would not discriminate between them.

**Variant B's gap is deliberately thin.** Width 0.08 against 0.46 for the real case
below. Both "have a gap" and they are not the same finding: a point in the middle of
Variant B has ±0.04 of headroom, which a model bump or ten more rows could erase.
Working the fixture should produce *is there a gap?* followed immediately by *how
wide, over how many rows?*

A note on why the fields are shaped this way. An earlier draft carried only a scalar
and a verdict on the acted-upon answer, and its stated second interval was
arithmetically impossible: dropping the high-scalar wrong row emptied one side
entirely, leaving no upper bound. The published numbers had come from a different
split than the procedure defined. A later draft fixed the arithmetic and still graded
by `oracle_was_right`, which an adversarial round showed produces a false refusal on
any corpus containing a both-wrong override. Both mistakes are left described here
rather than quietly repaired: the second one is the first one's class, surviving its
own fix, which is the more useful lesson.

## Worked derivation, and the mistake in it

**[shipped]** — figures from a real integration, measured **2026-09-17** against
resolved model `jev-1.13.0`, over 87 production rows of which 70 carried an
external grade. They are quoted to show the shape of the reasoning. **They are
not a property of any API, and a reader six months from now should assume they
have moved.** Re-derive rather than reuse.

### The grading table

```text
                   rows   oracle correct   baseline (always most-common)
  overall            70         65 (92.9%)            54 (77.1%)
  class +            54         52
  class -             4          4      <- 4 rows; not validated, only unrefuted
  class *            12          9
```

The baseline is doing real work here. On a corpus that is 54/12/4, always
guessing the most common class scores 77.1%, so the headline 92.9% is a gain of
15.8 points, not 92.9 points of skill. Report both or report neither.

### The separation

```text
  override + WRONG (grader says the oracle's answer was not right)  ->  <= 0.54
  override + RIGHT (grader says the oracle's answer was right)      ->     1.00
  -------------------------------------------------------------------------
  free interval: (0.54, 1.00]
```

Every point in that interval scores identically on these 70 rows.

### The mistake

The value chosen was **0.90**, and for two months it was documented — in a
project guide and in a comment above the constant — as *"the interval's
midpoint"*.

```text
  midpoint of (0.54, 1.00]  =  (0.54 + 1.00) / 2  =  0.77
  documented value          =  0.90
```

The justification was arithmetically false, and a one-line check would have
caught it at any point in those two months. Nobody ran it, because the sentence
read like a measurement.

The second-order problem is worse than the arithmetic. Once "midpoint" is
removed, *nothing in the data selects 0.90* — the separation licenses the whole
interval and is silent about which point to take. What was in the same file,
cited approvingly as independent support, was a number lifted from the vendor's
own documentation. Read **2026-09-17 and re-checked 2026-09-18**, that
documentation gated the same high-stakes action at two different values on two
different pages and disclaimed both, telling the reader to test against their own
data. Those pages may since have been reconciled; the structural point does not
depend on the values and is the part worth carrying — **a vendor's corpus can
disagree with itself, so agreement with one page of it is not confirmation.**

So the most plausible history is the reverse of what was written down: **the
borrowed number arrived first, and a measurement-flavoured justification was
fitted to it afterwards.** Not by anyone careless — by people who had genuinely
done the measurement, and who let its authority spread to a number it did not
select.

### The repair

The value did not change; it is still inside the free interval and still costs
nothing on the corpus. Only the reason changed, into a form arithmetic can check:

> 0.90 sits **0.36 above the highest harmful override** and **0.10 below the
> lowest beneficial one**, deliberately off-centre toward the upper end so the
> policy is biased against acting.

Every number in that sentence can be recomputed from the separation table in
about ten seconds. That is the property a justification needs — not that it
sounds derived, but that it can be re-derived, and that its being wrong would be
*visible*.

---

## Checklist for adapting this to your own service

1. Name the layer and write the precondition before looking at any API.
2. Find the grader before writing any integration code — if there is none, stop.
3. Compute the baseline first. It is cheap and it sometimes ends the project.
4. Derive the separation over the scalar you will actually gate on. If the
   service returns several (a concentration measure, a per-option probability, a
   margin between the top two), they are different quantities and may separate
   differently. Measure the one you will use.
5. Write the reason for your operating point as a calculation, then do it.
6. Stub the oracle explicitly in every test, and confirm the gate reddens when
   each contract is deliberately broken.

---

## What an unguarded environment read does

Referenced from Step 6. Behaviour when a configuration system passes an **unset**
variable through as its own literal placeholder text rather than as an absent value:

```text
  read a secret      -> guarded:   reject a value that looks like a placeholder
  read a model id    -> unguarded: placeholder text is sent as the model id
  read a number      -> unguarded: Number(placeholder) is NaN, comparisons are
                        all false, and the feature turns itself off quietly
  read a boolean     -> depends entirely on how it is compared
```

The boolean row is the instructive one. A kill switch compared against the literal
`"1"` is safe when its variable is unset, because placeholder text is not `"1"`. The
same switch written as a truthiness test treats the placeholder as *on*, disables the
feature on every run, and looks exactly like a deliberate rollback. One line apart.

The number row is the quietest: a `NaN` makes every comparison false, so a retry
budget, a timeout or a threshold silently becomes "never" — and the feature reports
itself as merely switched off.

## Choosing the gating scalar

Referenced from Step 4. A service may return several scalars and they are not
interchangeable:

- a **concentration measure** (often called confidence) says how peaked the answer
  distribution is, not how likely the answer is to be right
- the **winning option's probability** is a different quantity, and on at least one
  measured call the two disagreed materially on the same answer
- the **margin** between the top two options is a third, and it is the one that
  distinguishes "0.95 against a 0.04 runner-up" from "0.95 against a 0.30 runner-up"

Derive the separation over whichever you intend to gate on. The procedure is
identical; the interval may not be. If a vendor tells you a concentration measure is
not meant to carry a statistical decision, that is an argument for measuring which
scalar separates on your rows, not for trusting the one that is easiest to read.

### Two preconditions before reaching for the margin

**[reported]** From a production integration that tried it; the mechanism is carried, its
measurements are not.

**The margin needs the full distribution, and your client may have thrown it away.**
A client that parses only the winning option has already discarded the runner-up, so
"try the margin instead" is a client change first and a measurement second. Budget it
that way, or the experiment stalls at the point where the rows turn out not to carry
the quantity.

**The margin has no analogue on a yes/no question type**, where the probability IS the
only axis. Advice framed as "prefer the margin over the scalar" silently does not
apply there, and the question type is usually chosen per call site rather than per
service — so both shapes can exist in one integration.

A related trap in the same place, and it fails **safe and silent**: a yes/no answer may
carry no confidence field at all. A `confidence >= X` gate copied from a choice
question then never fires: a missing field that decodes to `undefined` or `NaN` compares
false and raises nothing. The gate is not off — it is absent, and it reports as a gate
that simply never had cause to act. Assert the field is present before comparing it. A
language that RAISES on the comparison is failing the better way; measured, node gives
`undefined >= 0.5 === false` where python3 gives `TypeError` on `None >= 0.5`.

## What a confidence score cannot tell you

**[shipped]** for the two properties; the escape-option pair was measured FOR this skill
rather than observed in production, and is marked where it appears. Referenced from
Common Pitfalls.

A question with only one possible answer returns maximal confidence while carrying no
information at all: the distribution is maximally concentrated because there is nowhere
else for the mass to go. And because the distribution is computed over the candidate set
**you supplied**, the score can never signal that the set itself was wrong — an input
fitting none of your options still produces a confident-looking answer among them.

Hence the escape option. On the single pair measured for this skill (n=1,
`jev-1.13.0`, 2026-09-18) adding one changed nothing when it was unneeded, and converted
a wrong answer into the right one when it was needed. That is one observation and not a
rate; it is recorded because the direction is what the argument predicts, not because
two calls establish anything.

## How small a surgical gate is

**[shipped]** Referenced from Common Pitfalls. From the integration this skill draws on, model
`jev-1.13.0`, 2026-09-17:

- the gate changes **2 answers across 87 production rows**, of which 70 carry an
  external grade
- a separate **43-case regression suite** — not a subset of those 87 — passes 43/43 on
  the phrasings it attests
- a **20-case unattested set** scores 17/20 — both of these are suite results, not graded
  production rows

Three denominators, and they do not nest. Quoting any one of them as "the accuracy"
describes a population the other two are not drawn from, which is the shape a single
headline number always hides. The first figure is the one that answers "how much does
this gate actually do": two answers.

## Writing the conclusion first

**[authoring]** — a fourth class, and the legend above now carries it: observed while
WRITING this skill rather than in a system that ran. Referenced from Common Pitfalls. Both sessions that produced this skill
wrote a conclusion before running the arm that could refute it, within one afternoon of
each other.

One described its corpus as "built" until its own commit history showed the rows had
been *discovered* — they were already being logged, which is the good news the skill's
Step 2 now leads with, but the write-up had claimed authorship of a construction that
never happened.

The other wrote that a particular failure "is not signalled by low confidence", which
is the kind of sentence that sounds like a measurement. The control arm had not been
run. When it was, confidence had in fact degraded on those rows, and the sentence had
to go.

Neither was carelessness, and that is the point: both authors were being careful about
the claim they were making and not about the arm they had not run. Care does not catch
this. Running the arm whose result would make you delete your sentence does.

## The live-by-default hazard

Referenced from Step 7. The whole difference is one defaulting operator:

```javascript
oracle = options.oracle ?? liveClient   // every un-stubbed caller goes live
oracle = options.oracle                 // a caller that forgets crashes, which
                                        // is the failure you want
```

The first line is the one people write, because it makes the constructor convenient
and every existing caller keeps working. It also means a test that forgets to stub
reaches the real service — billed, rate-limited, and measuring today's model rather
than your code. The second is inconvenient exactly once per call site, at the moment
somebody is in a position to notice.

This is the same shape as fail-open at the call site (Step 5) pointing the other way:
there you want the absent dependency to be invisible in the OUTPUT, here you want the
absent stub to be loud. What distinguishes them is who is meant to be surprised — a user, never; an
author writing a test, always.
