/**
 * Envelope for #647 — the abort-capable command substitution, from both sides.
 *
 * `validate-integrity.sh` runs under `set -euo pipefail`, where a bare `x=$(grep … | …)`
 * carries the pipeline's exit status. `grep` exits 1 on no match, so an agent file missing
 * `intent:` killed the whole script one line ABOVE the `-z` guard written to report it. The
 * FAIL never printed, checks A6 through B13 never ran, and the log looked like a short run.
 *
 * That is a hard thing to prove by inspection and an easy thing to prove by mutation, which
 * is what these cases do:
 *
 *   node scripts/gate-envelope.js --spec scripts/envelopes/a6a-abort-capable-substitutions.mjs
 *
 * Note what a case here measures that a corpus mutation cannot. The two must-go-reds #644
 * asked for both PASSED against a broken A11, because both mutated the corpus while the
 * defect was in the check. Cases 1 and 2 below mutate the corpus (they remove a field), but
 * their `expect` names the DIAGNOSTIC rather than merely requiring a red run — so a version
 * of the script that aborts silently is a [WRONG-RED] rather than a kill. That distinction is
 * the whole reason `expect` is a substring and not an exit code.
 *
 * Case 3 mutates the CHECK, which is the direction that catches a dead detector.
 */

export const gate = { command: ['bash', 'scripts/validate-integrity.sh'] };

export const cases = [
  {
    // THE #647 REGRESSION. Before the fix this produced no output at all: the script died on
    // the extraction line and the FAIL below it was unreachable code. The expect names that
    // FAIL, so a silent abort cannot be mistaken for a catch.
    label: 'an agent file loses its intent: field',
    file: 'agents/code-reviewer.md',
    find: 'intent: implementing\n',
    replace: '',
    // AN INVARIANT THIS EXPECT DEPENDS ON, and it is asserted nowhere else: A1's template is
    // `FAIL: $f missing required field: $field` over `for field in name description tools
    // priority`, and A6a's is `FAIL: $f missing required field: intent`. They render
    // byte-identically the moment `intent` is added to A1's list — a natural hardening edit,
    // since A6a's own comment calls A1 the first reader. Do that AND restore the #647 defect
    // and this case reports [KILLED] over a run where A6a never executed: A1 prints the
    // expected line, the script then dies on the unguarded extraction, and A6-B13 never run.
    //
    // No substring can discriminate two identical lines, so the invariant is the control. It is
    // restated beside A1's field list. The residual window is narrow — the blocking
    // check-bare-substitutions.js runs BEFORE validate-integrity.sh in the workflow and would
    // refuse the unguarded form — but the window exists if someone silences that site with an
    // annotation rather than a guard.
    expect: 'missing required field: intent',
  },
  {
    // The sibling extraction on the next line. A1 also reports a missing `tools:`, so the
    // expect is deliberately A6a's own wording rather than the shared "missing required
    // field" prefix — otherwise this case would be killed by A1 and would say nothing about
    // whether A6a survived the mutation at all.
    label: 'an agent file loses its tools: field',
    file: 'agents/code-reviewer.md',
    find: 'tools: [Read, Edit, Grep, Glob, Bash, WebFetch]\n',
    replace: '',
    expect: 'A6a cannot judge intent without it',
  },
  {
    // Mutating the CHECK, not the corpus. Removing the guard restores the exact defect #647
    // reported, and the case passes only if the run stops producing A6a's diagnostic — which
    // is what "the abort is back" looks like from outside.
    //
    // The expect is the message of the check that runs AFTER the abort point. Naming A6a's
    // own FAIL would be wrong here: the mutant's whole symptom is that A6a says nothing.
    label: 'the guard is removed from the intent extraction (the #647 defect, restored)',
    file: 'scripts/validate-integrity.sh',
    find: "intent=$(grep -m1 '^intent:' \"$f\" | sed 's/^intent: *//' | tr -d '\\r' | xargs || true)",
    replace: "intent=$(grep -m1 '^intent:' \"$f\" | sed 's/^intent: *//' | tr -d '\\r' | xargs)",
    // Documented as expect:null and NOT as a kill, because it is honestly not one. Every
    // agent on disk carries `intent:`, so with the corpus intact the unguarded form never
    // fires and the gate stays green. The abort needs BOTH the missing field and the missing
    // guard, and this harness applies one mutation per case by design.
    //
    // Recording it rather than dropping it: the pair is exactly what
    // `scripts/check-bare-substitutions.js` exists to catch statically, since no single
    // mutation of this file can demonstrate it.
    expect: null,
    why: 'The unguarded form is only fatal when a corpus file also lacks the field; one mutation cannot produce both, which is why the static check exists.',
  },
];
