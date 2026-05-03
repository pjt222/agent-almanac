---
name: verify-agent-output
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Validate deliverables and build evidence trails when work passes between
  agents. Covers expected outcome specification before execution, structured
  evidence generation during execution, deliverable validation against
  external anchors after execution, fidelity checks for compressed or
  summarized outputs, trust boundary classification, structured
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

Establish verifiable delivery between agents. When one agent produces output another agent consumes — or human relies on — handoff needs more than "looks good." Skill codifies practice of defining checkable expectations before work begins, generating evidence as side effect of doing work, and validating deliverables against external anchors rather than self-assessment. Core principle: fidelity cannot be measured internal. Agent cannot reliably verify own compressed output. Verification needs external reference point.

## When Use

- Multi-agent workflow hands deliverables from one agent to another
- Agent produces external-facing output (reports, code, deployments) human will rely on
- Agent summarizes, compresses, or transforms data and summary must faithfully represent source
- Team coordination pattern needs structured handoff validation between members
- Need to establish trust boundaries — deciding what needs verification vs. what can be trusted
- Audit trail required for compliance or reproducibility

## Inputs

- **Required**: Deliverable to verify (file, artifact, report, structured output)
- **Required**: Expected outcome specification (what "done" looks like)
- **Optional**: Source material (for fidelity checks on summaries or transformations)
- **Optional**: Trust boundary classification (`cross-agent`, `external-facing`, `internal`)
- **Optional**: Verification depth (`spot-check`, `full`, `sample-based`)

## Steps

### Step 1: Define Expected Outcome Specification

Before execution begins, write down what "done" looks like as set of concrete, checkable conditions. Avoid subjective criteria ("good quality"). Favor verifiable assertions.

Categories of checkable conditions:

- **Existence**: File exists at path, endpoint responds, record present in database
- **Shape**: Output has N columns, JSON matches schema, function has expected signature
- **Content**: Value within range, string matches pattern, list contains required items
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

**Got:** Written specification with at least one checkable condition per deliverable. Every condition machine-verifiable (can be checked by script or command, not by reading and judging).

**If err:** Expected outcome cannot be stated concrete? Task itself underspecified. Push back on task definition before proceeding — vague expectations produce unverifiable work.

### Step 2: Generate Evidence Trail During Execution

As work proceeds, emit structured evidence as side effect of doing work. Evidence trail not separate verification step — produced by execution itself.

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

**Got:** `evidence/` directory (or structured log) containing at least checksums and timing for every produced artifact. Evidence generated as part of work, not reconstructed after fact.

**If err:** Evidence generation interferes with execution? Capture what you can without blocking work. At minimum, record file checksums after completion — enables later verification even if real-time evidence not captured.

### Step 3: Validate Deliverables Against Expected Outcomes

After execution, check deliverable against specification from Step 1. Use external anchors — test suites, schema validators, checksums, row counts — rather than asking producing agent "is this correct?"

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

**Got:** All checks pass. Results recorded as structured output (PASS/FAIL per condition) alongside evidence trail from Step 2.

**If err:** Don't silently accept partial passes. Any FAIL triggers structured disagreement process in Step 6. Record which checks passed, which failed — partial results still valuable evidence.

### Step 4: Run Fidelity Checks on Compressed Outputs

When agent summarizes, compresses, or transforms data, output smaller than input by design. Summary cannot be verified by reading summary alone — must compare against source. Use sample-based spot checks to verify fidelity.

Procedure:

1. Select random sample from source material (3-5 items for spot checks, 10% for thorough checks)
2. For each sampled item, verify accurately represented in compressed output
3. Check for fabricated content — items in output with no source

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

For text summaries where exact matching not possible, verify key claims:

- Quoted statistics match source data
- Named entities mentioned in summary exist in source
- Causal claims or rankings supported by underlying data
- No items appear in summary absent from source

**Got:** All sampled items accurately represented. No fabricated content detected. Key statistics in summary match computed values from source.

**If err:** Fidelity checks fail? Summary cannot be trusted. Report specific discrepancies using structured disagreement format in Step 6. Producing agent must re-derive summary from source, not patch existing output.

### Step 5: Classify Trust Boundaries

Not everything needs verification. Over-verification is its own cost — slows execution, increases complexity, can create false confidence in verification process itself. Classify outputs by trust level to focus verification effort where matters.

Trust boundary classification:

| Boundary | Verification Required | Examples |
|----------|----------------------|----------|
| **Cross-agent handoff** | Yes — always | Agent A produces data Agent B consumes; team member passes deliverable to lead |
| **External-facing output** | Yes — always | Reports delivered to humans, deployed code, published packages, API responses |
| **Compressed/summarized** | Yes — sample-based | Any output smaller than its input by design (summaries, aggregations, extracts) |
| **Internal intermediate** | No — trust with checksums | Temporary files, intermediate computation results, internal state between steps |
| **Idempotent operations** | No — verify once | Config file writes, deterministic transforms, pure functions with known inputs |

Apply verification proportionally:

- **Cross-agent handoffs**: Full validation against expected outcome specification (Step 3)
- **External-facing outputs**: Full validation plus fidelity checks if summarized (Steps 3-4)
- **Internal intermediates**: Record checksums only (Step 2) — verify on demand if downstream fails
- **Idempotent operations**: Verify on first execution. Trust on repeat

**Got:** Each deliverable in workflow classified into one of trust boundary categories. Verification effort concentrated on cross-agent and external-facing boundaries.

**If err:** When in doubt, verify. Cost of false trust (accepting bad output) almost always exceeds cost of unnecessary verification. Default to verification. Relax only when have evidence boundary safe.

### Step 6: Report Structured Disagreements on Failure

When verification fails, produce structured disagreement rather than silently accepting or silently rejecting output. Structured disagreement makes failure actionable — tells producing agent (or human) exactly what was expected, what was received, where gap is.

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
- **Include both expected and actual**: Gap between them is what matters
- **Classify severity**: `error` (blocks acceptance), `warning` (accept with caveat), `info` (noted for record)
- **Recommend action**: Fix-and-rerun vs. accept-with-caveat vs. reject outright
- **Never silently accept**: Social trust ("the other agent said it's fine") is attack vector. Trust evidence, not assertion.

**Got:** Every verification failure produces structured disagreement with at least: check that failed, expected value, actual value, severity classification.

**If err:** Verification process itself fails (e.g., validation script errors out)? Report as meta-failure. Inability to verify is itself finding — means deliverable unverifiable in current form, worse than known failure.

## Check

- [ ] Expected outcome specification exists before execution begins
- [ ] Specification contains only machine-verifiable conditions (no subjective criteria)
- [ ] Evidence trail generated during execution (checksums, timing, test results)
- [ ] Evidence is side effect of doing work, not separate post-hoc step
- [ ] Deliverables validated against external anchors (tests, schemas, checksums)
- [ ] No deliverable verified by asking its producer "is this correct?"
- [ ] Compressed or summarized outputs include sample-based fidelity checks
- [ ] Fidelity checks compare against source material, not against summary itself
- [ ] Trust boundaries classified (cross-agent, external, internal)
- [ ] Verification effort proportional to trust boundary severity
- [ ] Verification failures produce structured disagreements (expected vs. actual)
- [ ] No verification failure silently accepted or silently rejected

## Pitfalls

- **Verify output by asking producer**: Agent cannot reliably verify own work. "I checked and it looks correct" not verification — external anchors (tests, checksums, schemas) are verification. As rtamind observes: fidelity cannot be measured internal.
- **Over-verify internal intermediates**: Verifying every temporary file and intermediate result adds overhead without improving reliability. Classify trust boundaries (Step 5). Focus verification on cross-agent and external-facing outputs.
- **Subjective expected outcomes**: "Report should be high quality" not checkable. "Report contains sections Summary, Methodology, Results, and all cited statistics match computed values from source" is checkable. Cannot write check for it? Cannot verify it.
- **Post-hoc evidence reconstruction**: Generating evidence after fact ("let me compute checksum of what I think I produced") unreliable. Evidence must be side effect of execution, captured in real time. Reconstructed evidence proves only what exists now, not what was produced.
- **Treat verification as infallible**: Verification itself can have bugs. Passing test suite doesn't mean code correct — means code satisfies tests. Keep verification proportional. Acknowledge its limits rather than treating green checks as absolute truth.
- **Silently accept partial passes**: 9 out of 10 checks pass? Deliverable still fails. Report one failure as structured disagreement. Partial credit is for grading. Delivery is binary.
- **Social trust as substitute**: "Agent A is reliable, so I'll skip verification" is attack vector. As Sentinel_Orol notes, trust without verification is exploitable. Verify based on boundary classification, not on reputation of producer.
- **Wrong R binary on hybrid systems**: On WSL or Docker, `Rscript` may resolve to cross-platform wrapper instead of native R. Check with `which Rscript && Rscript --version`. Prefer native R binary (e.g., `/usr/local/bin/Rscript` on Linux/WSL) for reliability. See [Setting Up Your Environment](../../guides/setting-up-your-environment.md) for R path configuration.

## See Also

- `fail-early-pattern` — complementary: fail-early catches bad input at start; verify-agent-output catches bad output at end
- `security-audit-codebase` — overlapping concern: security audits verify code meets security expectations, specific case of deliverable validation
- `honesty-humility` — complementary: honest agents acknowledge uncertainty, making verification gaps visible rather than hiding them
- `review-skill-format` — verify-agent-output can validate produced SKILL.md meets format requirements, concrete instance of deliverable validation
- `create-team` — teams coordinating multiple agents benefit from structured handoff validation at each coordination step
- `test-team-coordination` — tests whether team handoffs produce verifiable deliverables, exercising this skill's procedures end to end
