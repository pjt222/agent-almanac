#!/usr/bin/env python3
"""Separation table for a decision oracle, plus the regression arms that keep it honest.

Run it:

    python3 separation.py                 # the three regression arms
    python3 separation.py fixture.json    # a separation table for your own rows

WHAT IT COMPUTES

A row belongs in the separation table only if acting on the oracle changes whether
the emitted answer is RIGHT. That rules out two classes that look relevant and are not:

  agreement      oracle answer == path answer
                 -> threshold-invariant: the same answer is emitted either way
  both-wrong     override where neither the oracle nor the path is right
                 -> outcome-invariant: a different wrong answer is still wrong

What remains is graded by the harm acting does, never by whether the oracle was right:

  harmful        override, oracle wrong, path right    (acting made it worse)
  beneficial     override, oracle right, path wrong    (acting made it better)

  Step 3 counts the oracle's errors. Step 4 counts the GATE's harm.

Grading overrides by `oracle_was_right` instead puts both-wrong rows in the harmful
group, where they can destroy a real gap — see arm 3.

GATE OPERATOR

The free interval's closed end depends on the comparison, so the operator is an input,
not a detail:

    gate >=  ->  (highest_harmful, lowest_beneficial]   upper endpoint is free
    gate >   ->  [highest_harmful, lowest_beneficial)   LOWER endpoint is free

Picking the wrong endpoint under `>` can disable the oracle entirely: on a corpus whose
beneficial rows all score 1.00, a threshold of 1.00 under `>` fires on nothing at all.
"""

from __future__ import annotations
import json
import sys

AGREEMENT = "agreement (threshold-invariant, excluded)"
BOTH_WRONG = "both-wrong (outcome-invariant, excluded)"
HARMFUL = "harmful (acting made it worse)"
BENEFICIAL = "beneficial (acting made it better)"


def classify(path_answer, oracle_answer, truth):
    """Which separation class a graded row belongs to."""
    if oracle_answer == path_answer:
        return AGREEMENT
    oracle_right = oracle_answer == truth
    path_right = path_answer == truth
    if oracle_right and not path_right:
        return BENEFICIAL
    if path_right and not oracle_right:
        return HARMFUL
    return BOTH_WRONG


def separation(rows, gate=">="):
    """Return the free interval over `rows`, or None when the classes overlap."""
    harmful = [r["scalar"] for r in rows if classify(r["path"], r["oracle"], r["truth"]) == HARMFUL]
    beneficial = [r["scalar"] for r in rows if classify(r["path"], r["oracle"], r["truth"]) == BENEFICIAL]
    if not harmful or not beneficial:
        return {"gap": None, "reason": "one side is empty; a separation needs both",
                "n_harmful": len(harmful), "n_beneficial": len(beneficial)}
    hi, lo = max(harmful), min(beneficial)
    if hi >= lo:
        return {"gap": None, "reason": "classes overlap", "hi_harmful": hi, "lo_beneficial": lo,
                "n_harmful": len(harmful), "n_beneficial": len(beneficial)}
    return {
        "gap": (hi, lo),
        "width": round(lo - hi, 10),
        "notation": f"({hi}, {lo}]" if gate == ">=" else f"[{hi}, {lo})",
        "free_endpoint": "upper" if gate == ">=" else "lower",
        "n_harmful": len(harmful),
        "n_beneficial": len(beneficial),
    }


def emitted_correct(rows, threshold, gate=">="):
    """How many rows emit the right answer at this threshold — the ground truth for any claim
    that an interval is 'free'."""
    fires = (lambda s: s >= threshold) if gate == ">=" else (lambda s: s > threshold)
    return sum(
        1 for r in rows
        if (r["oracle"] if fires(r["scalar"]) else r["path"]) == r["truth"]
    )


# --------------------------------------------------------------------------------------
# Regression arms. Arm 3 is the one that fails if the fix is implemented as row-selection
# without the harm predicate; arm 2 is the control that stops arm 1 passing vacuously.
# --------------------------------------------------------------------------------------

ARMS = [
    {
        "name": "arm 1: a low-scoring AGREEMENT row must not destroy the gap",
        "rows": [
            {"id": "o1", "scalar": 0.54, "path": "+", "oracle": "-", "truth": "+"},
            {"id": "o2", "scalar": 1.00, "path": "+", "oracle": "*", "truth": "*"},
            {"id": "o3", "scalar": 1.00, "path": "-", "oracle": "*", "truth": "*"},
            {"id": "a1", "scalar": 0.50, "path": "+", "oracle": "+", "truth": "+"},
            {"id": "a2", "scalar": 0.98, "path": "+", "oracle": "+", "truth": "+"},
        ],
        "expect_gap": True,
    },
    {
        "name": "arm 2: CONTROL - genuinely overlapping overrides must still refuse",
        "rows": [
            {"id": "p1", "scalar": 0.96, "path": "+", "oracle": "-", "truth": "+"},
            {"id": "p2", "scalar": 0.95, "path": "+", "oracle": "*", "truth": "*"},
            {"id": "p3", "scalar": 0.40, "path": "+", "oracle": "-", "truth": "+"},
        ],
        "expect_gap": False,
    },
    {
        "name": "arm 3: a high-scoring BOTH-WRONG override must not destroy the gap",
        "rows": [
            {"id": "o1", "scalar": 0.40, "path": "+", "oracle": "-", "truth": "+"},
            {"id": "o2", "scalar": 0.95, "path": "+", "oracle": "*", "truth": "*"},
            {"id": "o3", "scalar": 0.98, "path": "-", "oracle": "*", "truth": "*"},
            {"id": "o4", "scalar": 0.99, "path": "+", "oracle": "-", "truth": "*"},
        ],
        "expect_gap": True,
    },
]


def _interval(wrong, right):
    if not wrong or not right:
        return None
    return None if max(wrong) >= min(right) else (max(wrong), min(right))


def all_rows_separation(rows):
    """Wrong predicate #1: every graded row, split by whether the oracle was right.
    Admits agreement rows, which are threshold-invariant. Arm 1 catches this."""
    return _interval(
        [r["scalar"] for r in rows if r["oracle"] != r["truth"]],
        [r["scalar"] for r in rows if r["oracle"] == r["truth"]],
    )


def override_was_right_separation(rows):
    """Wrong predicate #2: override rows only, but split by whether the ORACLE was right
    rather than by whether acting caused harm. Admits both-wrong rows, which are
    outcome-invariant. Arm 3 catches this; arm 1 does not."""
    ovr = [r for r in rows if r["oracle"] != r["path"]]
    return _interval(
        [r["scalar"] for r in ovr if r["oracle"] != r["truth"]],
        [r["scalar"] for r in ovr if r["oracle"] == r["truth"]],
    )


def main():
    if len(sys.argv) > 1:
        rows = json.load(open(sys.argv[1]))["rows"]
        for gate in (">=", ">"):
            print(f"gate {gate}: {separation(rows, gate)}")
        return 0

    failures = 0
    for arm in ARMS:
        result = separation(arm["rows"])
        got = result["gap"] is not None
        ok = got == arm["expect_gap"]
        failures += not ok
        print(f"[{'PASS' if ok else 'FAIL'}] {arm['name']}")
        print(f"        harm predicate : {result.get('notation') or 'NO GAP - ' + result['reason']}"
              f"   (n harmful={result['n_harmful']}, n beneficial={result['n_beneficial']})")
        fmt = lambda iv: ("(%s, %s]" % iv) if iv else "NO GAP"
        print(f"        all rows        : {fmt(all_rows_separation(arm['rows']))}")
        print(f"        override+right  : {fmt(override_was_right_separation(arm['rows']))}")
        if result["gap"]:
            lo_t, hi_t = result["gap"]
            inside = (lo_t + hi_t) / 2
            print(f"        emitted-correct at a point inside the gap ({inside:.3f}): "
                  f"{emitted_correct(arm['rows'], inside)}/{len(arm['rows'])}"
                  f"   above it ({hi_t + 0.005:.3f}): "
                  f"{emitted_correct(arm['rows'], hi_t + 0.005)}/{len(arm['rows'])}")
    print()
    print("3 arms," , "all pass" if not failures else f"{failures} FAILED")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
