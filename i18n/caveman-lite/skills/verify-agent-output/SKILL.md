---
name: verify-agent-output
locale: caveman-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Validate deliverables and build evidence trails when work passes between
  agents. Covers expected outcome specification before execution, structured
  evidence generation during execution, deliverable validation against
  external anchors after execution, fidelity checks for compressed or
  summarized outputs, trust boundary classification, and structured
  disagreement reporting on verification failure. Use when coordinating
  multi-agent workflows, reviewing cross-agent handoffs, producing
  external-facing outputs, or auditing whether an agent's summary
  faithfully represents its source material.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: verification, trust, evidence-trail, deliverable-validation, inter-agent, quality-assurance
---

# Verify Agent Output

Establish verifiable delivery between agents. When one agent produces output that another agent consumes — or that a human relies on — the handoff needs more than "looks good." This skill codifies the practice of defining checkable expectations before work begins, generating evidence as a side effect of doing the work, and validating deliverables against external anchors rather than self-assessment. The core principle: fidelity cannot be measured internally. An agent cannot reliably verify its own compressed output; verification requires an external reference point.

## When to Use

- A multi-agent workflow hands deliverables from one agent to another
- An agent produces external-facing output (reports, code, deployments) that a human will rely on
- An agent summarizes, compresses, or transforms data and the summary must faithfully represent the source
- A team coordination pattern requires structured handoff validation between members
- You need to establish trust boundaries — deciding what requires verification vs. what can be trusted
- An audit trail is required for compliance or reproducibility

## Inputs

- **Required**: The deliverable to verify (file, artifact, report, or structured output)
- **Required**: The expected outcome specification (what "done" looks like)
- **Optional**: The source material (for fidelity checks on summaries or transformations)
- **Optional**: Trust boundary classification (`cross-agent`, `external-facing`, `internal`)
- **Optional**: Verification depth (`spot-check`, `full`, `sample-based`)

## Procedure

### Step 1: Define Expected Outcome Specification

Before execution begins, write down what "done" looks like as a set of concrete, checkable conditions. Avoid subjective criteria ("good quality") in favor of verifiable assertions.

Categories of checkable conditions:

- **Existence**: File exists at path, endpoint responds, record present in database
- **Shape**: Output has N columns, JSON matches schema, function has expected signature
- **Content**: Value is within range, string matches pattern, list contains required items
- **Behavior**: Test suite passes, command exits 0, API returns expected status code
- **Consistency**: Output hash matches input hash, row count preserved after transform, totals reconcile

Example specification:

```yaml
expected_outcome:
  existence:
    - path: "output/report.html"
    - path: "output/data.csv"
  shape:
    - file: "output/data.csv"
      columns: ["id", "name", "score", "grade"]
      min_rows: 100
  content:
    - file: "output/data.csv"
      column: "score"
      range: [0, 100]
    - file: "output/report.html"
      contains: ["Summary", "Methodology", "Results"]
  behavior:
    - command: "Rscript -e 'testthat::test_dir(\"tests\")'"
      exit_code: 0
  consistency:
    - check: "row_count"
      source: "input/raw.csv"
      target: "output/data.csv"
      tolerance: 0
```

**Got:** A written specification with at least one checkable condition per deliverable. Every condition is machine-verifiable (can be checked by a script or command, not by reading and judging).

**If fail:** If the expected outcome cannot be stated concretely, the task itself is underspecified. Push back on the task definition before proceeding — vague expectations produce unverifiable work.

### Step 2: Generate Evidence Trail During Execution

As the work proceeds, emit structured evidence as a side effect of doing the work. The evidence trail is not a separate verification step — it is produced by the execution itself.

Evidence types to capture:

```yaml
evidence:
  timing:
    started_at: "2026-03-12T10:00:00Z"
    completed_at: "2026-03-12T10:04:32Z"
    duration_seconds: 272
  checksums:
    - file: "output/data.csv"
      sha256: "a1b2c3..."
    - file: "output/report.html"
      sha256: "d4e5f6..."
  test_results:
    total: 24
    passed: 24
    failed: 0
    skipped: 0
  diff_summary:
    files_changed: 3
    insertions: 47
    deletions: 12
  tool_versions:
    r: "4.5.2"
    testthat: "3.2.1"
```

Practical commands for generating evidence:

```bash
# Checksums
sha256sum output/data.csv output/report.html > evidence/checksums.txt

# Row counts
wc -l < input/raw.csv > evidence/input_rows.txt
wc -l < output/data.csv > evidence/output_rows.txt

# Test results (R)
Rscript -e "results <- testthat::test_dir('tests'); cat(format(results))" > evidence/test_results.txt

# Git diff summary
git diff --stat HEAD~1 > evidence/diff_summary.txt

# Timing (wrap the actual command)
start_time=$(date +%s)
# ... do the work ...
end_time=$(date +%s)
echo "duration_seconds: $((end_time - start_time))" > evidence/timing.txt
```

**Got:** An `evidence/` directory (or structured log) containing at least checksums and timing for every produced artifact. Evidence is generated as part of the work, not reconstructed after the fact.

**If fail:** If evidence generation interferes with execution, capture what you can without blocking the work. At minimum, record file checksums after completion — this enables later verification even if real-time evidence was not captured.

### Step 3: Validate Deliverables Against Expected Outcomes

After execution, check the deliverable against the specification from Step 1. Use external anchors — test suites, schema validators, checksums, row counts — rather than asking the producing agent "is this correct?"

Validation checks by category:

```bash
# Existence
for file in output/report.html output/data.csv; do
  test -f "$file" && echo "PASS: $file exists" || echo "FAIL: $file missing"
done

# Shape (CSV column check)
head -1 output/data.csv | tr ',' '\n' | sort > /tmp/actual_cols.txt
echo -e "grade\nid\nname\nscore" > /tmp/expected_cols.txt
diff /tmp/expected_cols.txt /tmp/actual_cols.txt && echo "PASS: columns match" || echo "FAIL: column mismatch"

# Row count
actual_rows=$(wc -l < output/data.csv)
[ "$actual_rows" -ge 101 ] && echo "PASS: $actual_rows rows (>= 100 + header)" || echo "FAIL: only $actual_rows rows"

# Content range check (R)
Rscript -e '
  d <- read.csv("output/data.csv")
  stopifnot(all(d$score >= 0 & d$score <= 100))
  cat("PASS: all scores in [0, 100]\n")
'

# Behavior
Rscript -e "testthat::test_dir('tests')" && echo "PASS: tests pass" || echo "FAIL: tests fail"

# Consistency (row count preserved)
input_rows=$(wc -l < input/raw.csv)
output_rows=$(wc -l < output/data.csv)
[ "$input_rows" -eq "$output_rows" ] && echo "PASS: row count preserved" || echo "FAIL: $input_rows -> $output_rows"
```

**Got:** All checks pass. Results are recorded as structured output (PASS/FAIL per condition) alongside the evidence trail from Step 2.

**If fail:** Do not silently accept partial passes. Any FAIL triggers the structured disagreement process in Step 6. Record which checks passed and which failed — partial results are still valuable evidence.

### Step 4: Run Fidelity Checks on Compressed Outputs

When an agent summarizes, compresses, or transforms data, the output is smaller than the input by design. A summary cannot be verified by reading the summary alone — you must compare it against the source. Use sample-based spot checks to verify fidelity.

Procedure:

1. Select a random sample from the source material (3-5 items for spot checks, 10% for thorough checks)
2. For each sampled item, verify it is accurately represented in the compressed output
3. Check for fabricated content — items in the output that have no source

```bash
# Example: verify a summary report against source data

# 1. Select random rows from source
shuf -n 5 input/raw.csv > /tmp/sample.csv

# 2. For each sampled row, verify it appears correctly in the output
while IFS=, read -r id name score grade; do
  grep -q "$id" output/report.html && echo "PASS: $id found in report" || echo "FAIL: $id missing from report"
done < /tmp/sample.csv

# 3. Check for fabricated IDs in the output
# Extract IDs from output, verify each exists in source
grep -oP 'id="[^"]*"' output/report.html | while read -r output_id; do
  grep -q "$output_id" input/raw.csv && echo "PASS: $output_id has source" || echo "FAIL: $output_id fabricated"
done
```

For text summaries where exact matching is not possible, verify key claims:

- Quoted statistics match the source data
- Named entities mentioned in the summary exist in the source
- Causal claims or rankings are supported by the underlying data
- No items appear in the summary that are absent from the source

**Got:** All sampled items are accurately represented. No fabricated content detected. Key statistics in the summary match computed values from the source.

**If fail:** If fidelity checks fail, the summary cannot be trusted. Report the specific discrepancies using the structured disagreement format in Step 6. The producing agent must re-derive the summary from source, not patch the existing output.

### Step 5: Classify Trust Boundaries

Not everything needs verification. Over-verification is its own cost — it slows execution, increases complexity, and can create false confidence in the verification process itself. Classify outputs by trust level to focus verification effort where it matters.

Trust boundary classification:

| Boundary | Verification Required | Examples |
|----------|----------------------|----------|
| **Cross-agent handoff** | Yes — always | Agent A produces data that Agent B consumes; team member passes deliverable to lead |
| **External-facing output** | Yes — always | Reports delivered to humans, deployed code, published packages, API responses |
| **Compressed/summarized** | Yes — sample-based | Any output that is smaller than its input by design (summaries, aggregations, extracts) |
| **Internal intermediate** | No — trust with checksums | Temporary files, intermediate computation results, internal state between steps |
| **Idempotent operations** | No — verify once | Config file writes, deterministic transforms, pure functions with known inputs |

Apply verification proportionally:

- **Cross-agent handoffs**: Full validation against expected outcome specification (Step 3)
- **External-facing outputs**: Full validation plus fidelity checks if summarized (Steps 3-4)
- **Internal intermediates**: Record checksums only (Step 2) — verify on demand if downstream fails
- **Idempotent operations**: Verify on first execution, trust on repeat

**Got:** Each deliverable in the workflow is classified into one of the trust boundary categories. Verification effort is concentrated on cross-agent and external-facing boundaries.

**If fail:** When in doubt, verify. The cost of false trust (accepting bad output) almost always exceeds the cost of unnecessary verification. Default to verification and relax only when you have evidence that a boundary is safe.

### Step 6: Report Structured Disagreements on Failure

When verification fails, produce a structured disagreement rather than silently accepting or silently rejecting the output. A structured disagreement makes the failure actionable — it tells the producing agent (or the human) exactly what was expected, what was received, and where the gap is.

Disagreement format:

```yaml
verification_result: FAIL
deliverable: "output/data.csv"
timestamp: "2026-03-12T10:04:32Z"
failures:
  - check: "row_count"
    expected: 500
    actual: 487
    severity: warning
    note: "13 rows dropped — investigate filter logic"
  - check: "score_range"
    expected: "[0, 100]"
    actual: "[-3, 100]"
    severity: error
    note: "3 negative scores found — data validation missing"
  - check: "column_presence"
    expected: "grade"
    actual: null
    severity: error
    note: "grade column missing from output"
passes:
  - check: "file_exists"
  - check: "checksum_stable"
  - check: "test_suite"
recommendation: >
  Re-run with input validation enabled. The score_range and column_presence
  failures suggest the transform step is not handling edge cases. Do not
  patch the output — fix the transform and re-execute from source.
```

Key principles for disagreement reporting:

- **Be specific**: "3 negative scores found in rows 42, 187, 301" not "some values are wrong"
- **Include both expected and actual**: The gap between them is what matters
- **Classify severity**: `error` (blocks acceptance), `warning` (accept with caveat), `info` (noted for the record)
- **Recommend action**: Fix-and-rerun vs. accept-with-caveat vs. reject outright
- **Never silently accept**: Social trust ("the other agent said it's fine") is an attack vector. Trust the evidence, not the assertion.

**Got:** Every verification failure produces a structured disagreement with at least: the check that failed, the expected value, the actual value, and a severity classification.

**If fail:** If the verification process itself fails (e.g., the validation script errors out), report that as a meta-failure. The inability to verify is itself a finding — it means the deliverable is unverifiable in its current form, which is worse than a known failure.

## Validation

- [ ] Expected outcome specification exists before execution begins
- [ ] Specification contains only machine-verifiable conditions (no subjective criteria)
- [ ] Evidence trail is generated during execution (checksums, timing, test results)
- [ ] Evidence is a side effect of doing the work, not a separate post-hoc step
- [ ] Deliverables are validated against external anchors (tests, schemas, checksums)
- [ ] No deliverable is verified by asking its producer "is this correct?"
- [ ] Compressed or summarized outputs include sample-based fidelity checks
- [ ] Fidelity checks compare against source material, not against the summary itself
- [ ] Trust boundaries are classified (cross-agent, external, internal)
- [ ] Verification effort is proportional to trust boundary severity
- [ ] Verification failures produce structured disagreements (expected vs. actual)
- [ ] No verification failure is silently accepted or silently rejected

## Pitfalls

- **Verifying output by asking the producer**: An agent cannot reliably verify its own work. "I checked and it looks correct" is not verification — external anchors (tests, checksums, schemas) are verification. As rtamind observes: fidelity cannot be measured internally.
- **Over-verifying internal intermediates**: Verifying every temporary file and intermediate result adds overhead without improving reliability. Classify trust boundaries (Step 5) and focus verification on cross-agent and external-facing outputs.
- **Subjective expected outcomes**: "The report should be high quality" is not checkable. "The report contains sections Summary, Methodology, and Results, and all cited statistics match computed values from source" is checkable. If you cannot write a check for it, you cannot verify it.
- **Post-hoc evidence reconstruction**: Generating evidence after the fact ("let me compute the checksum of what I think I produced") is unreliable. Evidence must be a side effect of execution, captured in real time. Reconstructed evidence proves only what exists now, not what was produced.
- **Treating verification as infallible**: Verification itself can have bugs. A passing test suite does not mean the code is correct — it means the code satisfies the tests. Keep verification proportional and acknowledge its limits rather than treating green checks as absolute truth.
- **Silently accepting partial passes**: If 9 out of 10 checks pass, the deliverable still fails. Report the one failure as a structured disagreement. Partial credit is for grading; delivery is binary.
- **Social trust as a substitute**: "Agent A is reliable, so I'll skip verification" is an attack vector. As Sentinel_Orol notes, trust without verification is exploitable. Verify based on the boundary classification, not on the reputation of the producer.
- **Wrong R binary on hybrid systems**: On WSL or Docker, `Rscript` may resolve to a cross-platform wrapper instead of native R. Check with `which Rscript && Rscript --version`. Prefer the native R binary (e.g., `/usr/local/bin/Rscript` on Linux/WSL) for reliability. See [Setting Up Your Environment](../../guides/setting-up-your-environment.md) for R path configuration.

## Related Skills

- `fail-early-pattern` — complementary: fail-early catches bad input at the start; verify-agent-output catches bad output at the end
- `security-audit-codebase` — overlapping concern: security audits verify that code meets security expectations, a specific case of deliverable validation
- `honesty-humility` — complementary: honest agents acknowledge uncertainty, making verification gaps visible rather than hiding them
- `review-skill-format` — verify-agent-output can validate that a produced SKILL.md meets format requirements, a concrete instance of deliverable validation
- `create-team` — teams that coordinate multiple agents benefit from structured handoff validation at each coordination step
- `test-team-coordination` — tests whether team handoffs produce verifiable deliverables, exercising this skill's procedures end to end
