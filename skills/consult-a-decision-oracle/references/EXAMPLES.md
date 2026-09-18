# Examples — consult-a-decision-oracle

Extended material for [SKILL.md](../SKILL.md). Three parts: where external graders
hide, a runnable verdict fixture for the Validation section, and the worked
threshold derivation including the mistake that makes it worth reading.

**Provenance is marked per entry throughout.** One case here is a real shipped
integration; the rest of the taxonomy is inference about where the same shape
turns up elsewhere. Inference sitting next to a verified case tends to acquire
the verified case's authority, so each entry says which it is:

- **[shipped]** — observed in a system that ran in production
- **[inference]** — a plausible instance of the same shape, not verified by the
  author

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
| Retry records **[inference]** | an operation that failed, then succeeded unchanged on retry | the first attempt's verdict was wrong and the system proved it |
| Support/ticket routing **[inference]** | tickets reassigned after their first routing | the human who moved it disagreed |
| Moderation queues **[inference]** | an automated decision later overturned on appeal | the appeal reviewer is independent |
| Search and recommendation **[inference]** | the result the user actually clicked after being shown your ranking | the user is not your code — but see the caveat below |
| Spam/fraud outcomes **[inference]** | a chargeback, a confirmed-fraud flag, an account later banned | the outcome arrived after and independent of the decision |
| Compiler and type errors **[inference]** | a generated change that did or did not build | the compiler is indifferent to your reasoning |
| Deployment outcomes **[inference]** | a release that was rolled back | the rollback decision came from elsewhere |

### Three ways this goes wrong

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

The Validation checklist must run for a reader with no API key, which means it
cannot depend on anyone's recorded production verdicts. Ship a small synthetic
fixture instead.

**This is legitimate in a way a synthetic *corpus* is not, and the distinction
matters.** A synthetic corpus assigns the labels that grade the oracle, which is
circular — it produces a test that cannot fail for its own defect. A synthetic
verdict fixture grades nothing. It exercises *your* table-computation and
fail-open code with inputs whose expected outputs you can state independently.
You are testing your arithmetic, not the oracle's judgement.

Every row here is an **override** — one where the oracle's answer differs from
the path's, so the emitted answer depends on the threshold. Agreement rows are
excluded for the reason Step 4 gives: they emit the same answer at every
threshold, so they carry no information about choosing one. `oracle_was_right`
is the external grader's verdict on the oracle's answer, and it is the only
field the split reads, so the split cannot be ambiguous.

```json
{
  "note": "Synthetic. Grades no oracle. Exercises the separation table and the five fail-open modes.",
  "rows": [
    {"id": "r01", "scalar": 0.38, "oracle_was_right": false},
    {"id": "r02", "scalar": 0.44, "oracle_was_right": false},
    {"id": "r03", "scalar": 0.97, "oracle_was_right": false},
    {"id": "r04", "scalar": 0.52, "oracle_was_right": true},
    {"id": "r05", "scalar": 0.93, "oracle_was_right": true},
    {"id": "r06", "scalar": 0.99, "oracle_was_right": true}
  ],
  "failure_modes": [
    {"id": "f01", "mode": "throws",         "expect": "path answer unchanged"},
    {"id": "f02", "mode": "timeout",        "expect": "path answer unchanged"},
    {"id": "f03", "mode": "rate_limited",   "expect": "path answer unchanged"},
    {"id": "f04", "mode": "unconfigured",   "expect": "path answer unchanged"},
    {"id": "f05", "mode": "below_threshold","expect": "path answer unchanged"}
  ]
}
```

**Variant A — all six rows. No gap, and that is the assertion.**

```text
  wrong: 0.38, 0.44, 0.97      highest wrong = 0.97
  right: 0.52, 0.93, 0.99      lowest right  = 0.52
  0.97 > 0.52  ->  the sets overlap  ->  no threshold separates them
```

Running Step 4 over Variant A must reach the *no gap → the oracle does not ship*
branch. A fixture that always separates teaches a reader to expect separation, so
the default variant here does not. **A fixture the procedure always passes is not
a test of the procedure.**

**Variant B — drop `r03`. Now it separates, and the interval is checkable.**

```text
  wrong: 0.38, 0.44            highest wrong = 0.44
  right: 0.52, 0.93, 0.99      lowest right  = 0.52
  0.44 < 0.52  ->  free interval (0.44, 0.52]
```

Keep both. Variant A proves the refusal branch is reachable; Variant B proves the
table computation produces the right interval when one exists.

**Variant B's gap is deliberately thin, and a reader should notice.** Its width
is 0.08, against 0.46 for the real case above. Both "have a gap" and they are not
the same finding: a point in the middle of Variant B has ±0.04 of headroom, which
a model version bump or ten more rows could erase entirely. The fixture is shaped
this way so that working through it produces the right instinct — *a gap exists*
is the first question and *how wide* is immediately the second. A fixture whose
only positive variant separated cleanly would teach the first question alone.

Check both with one command rather than trusting the prose — which is the habit
this whole skill is about:

```bash
python3 -c '
import json,sys
rows=json.load(open(sys.argv[1]))["rows"]
for label,drop in (("A",set()),("B",{"r03"})):
    rs=[r for r in rows if r["id"] not in drop]
    w=[r["scalar"] for r in rs if not r["oracle_was_right"]]
    g=[r["scalar"] for r in rs if r["oracle_was_right"]]
    print(label, "highest wrong", max(w), "lowest right", min(g),
          "-> gap (%s, %s]" % (max(w), min(g)) if max(w) < min(g) else "-> NO GAP")
' fixture.json
```

A note on why the fields are shaped this way. An earlier draft of this fixture
carried `path_answer`, `oracle_answer` and a verdict on the acted-upon answer,
and its stated second interval was arithmetically impossible: dropping the
high-scalar wrong row emptied the wrong set entirely, so there was no upper bound
and no interval to state. The published numbers had been computed from a
different split than the one Step 4 defines. It was caught by running the
arithmetic, which is exactly what the skill tells you to do and exactly what its
author had not done. The lesson is left here rather than quietly repaired,
because a worked example of the failure is worth more than a clean file.

---

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
cited approvingly as independent support, was a vendor example gating a
high-stakes action at `> 0.9`. And that vendor's own documentation gates the
*same* action at `> 0.85` on a different page, disclaiming both.

So the most plausible history is the reverse of what was written down: **the
borrowed number arrived first, and a measurement-flavoured justification was
fitted to it afterwards.** Not by anyone careless — by people who had genuinely
done the measurement, and who let its authority spread to a number it did not
select.

### The repair

The value did not change; it is still inside the free interval and still costs
nothing on the corpus. Only the reason changed, into a form arithmetic can check:

> 0.90 sits **0.36 above the highest observed miss** and **0.10 below the lowest
> right override**, deliberately off-centre toward the upper end so the
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
