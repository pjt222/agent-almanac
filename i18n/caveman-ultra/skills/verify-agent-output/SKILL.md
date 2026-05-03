---
name: verify-agent-output
locale: caveman-ultra
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

Establish verifiable delivery between agents. Agent output → another agent or human → handoff needs more than "looks good." Define checkable expectations before work, generate evidence as side effect, validate vs external anchors not self-assessment. Core: fidelity can't be measured internally. Agent can't reliably verify own compressed out → verification needs external ref.

## Use When

- Multi-agent workflow → hands deliverables A → B
- Agent produces external-facing out (reports, code, deployments) → human relies
- Agent summarizes|compresses|transforms data → summary must faithfully represent source
- Team coord pattern → structured handoff valid between members
- Need to establish trust boundaries → what verify vs trust
- Audit trail required for compliance|reproducibility

## In

- **Required**: Deliverable to verify (file, artifact, report, structured out)
- **Required**: Expected outcome spec (what "done" looks like)
- **Optional**: Source material (fidelity checks on summaries|transforms)
- **Optional**: Trust boundary class (`cross-agent`, `external-facing`, `internal`)
- **Optional**: Verification depth (`spot-check`, `full`, `sample-based`)

## Do

### Step 1: Define Expected Outcome Spec

Before exec, write what "done" looks like → concrete checkable conditions. Avoid subjective ("good quality") → verifiable assertions.

Categories:

- **Existence**: File at path, endpoint responds, record present in DB
- **Shape**: Out has N cols, JSON matches schema, fn has expected sig
- **Content**: Val in range, str matches pattern, list contains required
- **Behavior**: Test suite passes, cmd exits 0, API returns expected status
- **Consistency**: Out hash matches in hash, row count preserved after transform, totals reconcile

Example spec:

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

**Got:** Written spec w/ 1+ checkable condition per deliverable. Every condition machine-verifiable (script|cmd, not reading + judging).

**If err:** Can't state concretely → task underspecified. Push back on definition before proceed → vague expectations → unverifiable work.

### Step 2: Evidence Trail During Exec

Work proceeds → emit structured evidence as side effect. Evidence trail not separate verification step → produced by exec itself.

Evidence types:

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

Practical cmds:

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

**Got:** `evidence/` dir (or structured log) w/ checksums + timing per produced artifact. Evidence generated as part of work, not reconstructed.

**If err:** Evidence gen interferes w/ exec → capture what you can w/o blocking. Min: record file checksums after completion → enables later verify even if real-time not captured.

### Step 3: Validate Deliverables vs Expected

After exec, check vs spec from Step 1. External anchors — tests, schemas, checksums, row counts — not asking producer "is this correct?"

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

**Got:** All checks pass. Results recorded as structured out (PASS/FAIL per condition) alongside evidence trail Step 2.

**If err:** Don't silently accept partial passes. Any FAIL → triggers structured disagreement Step 6. Record passed + failed → partial results still valuable evidence.

### Step 4: Fidelity Checks on Compressed Outs

Agent summarizes|compresses|transforms → out smaller than input by design. Summary can't be verified by reading alone → must compare vs source. Sample-based spot checks → verify fidelity.

Procedure:

1. Random sample from source (3-5 items spot, 10% thorough)
2. Per sampled item → verify accurately represented in compressed out
3. Check fabricated content → items in out w/ no source

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

Text summaries → exact match impossible → verify key claims:

- Quoted stats match source data
- Named entities mentioned exist in source
- Causal claims|rankings supported by underlying data
- No items in summary absent from source

**Got:** All sampled items accurately represented. No fabricated content. Key stats in summary match computed vals from source.

**If err:** Fidelity fails → summary can't be trusted. Report specific discrepancies via structured disagreement Step 6. Producer must re-derive from source, not patch existing.

### Step 5: Classify Trust Boundaries

Not everything needs verification. Over-verification its own cost → slows exec, complexity, false confidence. Classify outs by trust → focus where matters.

| Boundary | Verification Required | Examples |
|----------|----------------------|----------|
| **Cross-agent handoff** | Yes — always | Agent A produces data that Agent B consumes; team member passes deliverable to lead |
| **External-facing output** | Yes — always | Reports delivered to humans, deployed code, published packages, API responses |
| **Compressed/summarized** | Yes — sample-based | Any output that is smaller than its input by design (summaries, aggregations, extracts) |
| **Internal intermediate** | No — trust with checksums | Temporary files, intermediate computation results, internal state between steps |
| **Idempotent operations** | No — verify once | Config file writes, deterministic transforms, pure functions with known inputs |

Apply proportionally:

- **Cross-agent**: Full validation vs expected outcome (Step 3)
- **External-facing**: Full validation + fidelity checks if summarized (Steps 3-4)
- **Internal intermediates**: Checksums only (Step 2) → verify on demand if downstream fails
- **Idempotent ops**: Verify on first exec, trust on repeat

**Got:** Each deliverable classified into trust boundary. Verification effort concentrated on cross-agent + external-facing.

**If err:** When in doubt, verify. Cost of false trust (accepting bad out) almost always > cost of unnecessary verification. Default verify, relax only w/ evidence boundary safe.

### Step 6: Report Structured Disagreements on Fail

Verification fails → structured disagreement, not silently accept|reject. Structured = actionable → tells producer (or human) exactly what expected, received, gap.

Format:

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

Principles:

- **Specific**: "3 negative scores in rows 42, 187, 301" not "some values wrong"
- **Both expected + actual**: Gap is what matters
- **Classify severity**: `error` (blocks accept), `warning` (accept w/ caveat), `info` (noted)
- **Recommend action**: Fix-and-rerun vs accept-w/-caveat vs reject
- **Never silently accept**: Social trust ("other agent said it's fine") = attack vector. Trust evidence, not assertion.

**Got:** Every verification fail → structured disagreement w/ min: failed check, expected, actual, severity.

**If err:** Verification process itself fails (validation script errors out) → meta-failure. Inability to verify = finding → deliverable unverifiable in current form, worse than known fail.

## Check

- [ ] Expected outcome spec exists before exec begins
- [ ] Spec contains only machine-verifiable conditions (no subjective)
- [ ] Evidence trail generated during exec (checksums, timing, test results)
- [ ] Evidence is side effect of work, not separate post-hoc step
- [ ] Deliverables validated vs external anchors (tests, schemas, checksums)
- [ ] No deliverable verified by asking producer "is this correct?"
- [ ] Compressed|summarized outs include sample-based fidelity checks
- [ ] Fidelity checks compare vs source material, not summary itself
- [ ] Trust boundaries classified (cross-agent, external, internal)
- [ ] Verification effort proportional to boundary severity
- [ ] Failures produce structured disagreements (expected vs actual)
- [ ] No verification fail silently accepted|rejected

## Traps

- **Verifying out by asking producer**: Agent can't reliably verify own work. "I checked, looks correct" ≠ verification. External anchors (tests, checksums, schemas) = verification. Fidelity can't be measured internally.
- **Over-verify internal intermediates**: Verifying every temp file + intermediate adds overhead w/o reliability. Classify boundaries (Step 5) → focus on cross-agent + external.
- **Subjective expected outcomes**: "Report should be high quality" not checkable. "Report contains Summary, Methodology, Results, all cited stats match computed vals from source" checkable. Can't write check → can't verify.
- **Post-hoc evidence reconstruction**: Generating evidence after fact ("let me checksum what I think I produced") unreliable. Evidence must be side effect of exec, captured real time. Reconstructed proves only what exists now, not what was produced.
- **Verification as infallible**: Verification itself can have bugs. Passing test suite ≠ code correct → satisfies tests. Keep proportional + acknowledge limits, not green checks as absolute truth.
- **Silently accept partial passes**: 9 of 10 pass → deliverable still fails. Report 1 fail as structured disagreement. Partial credit for grading; delivery binary.
- **Social trust as substitute**: "Agent A reliable, skip verification" = attack vector. Trust w/o verification exploitable. Verify based on boundary, not producer reputation.
- **Wrong R binary on hybrid systems**: WSL|Docker → `Rscript` may resolve to cross-platform wrapper, not native R. `which Rscript && Rscript --version`. Prefer native R binary (`/usr/local/bin/Rscript` Linux/WSL) for reliability. See [Setting Up Your Environment](../../guides/setting-up-your-environment.md) for R path config.

## →

- `fail-early-pattern` — complementary: fail-early catches bad input at start; verify-agent-output catches bad out at end
- `security-audit-codebase` — overlapping: security audits verify code meets security expectations, specific case of deliverable validation
- `honesty-humility` — complementary: honest agents acknowledge uncertainty → verification gaps visible
- `review-skill-format` — verify-agent-output can validate produced SKILL.md meets format reqs, concrete instance of deliverable validation
- `create-team` — teams coordinating multi agents benefit from structured handoff valid at each coord step
- `test-team-coordination` — tests whether team handoffs produce verifiable deliverables, exercising this skill end to end
