## Run: 2026-03-10-stale-registry-001

**Observer**: Claude (automated) | **Duration**: 1m

### Scenario

| Field | Value |
|-------|-------|
| Scenario ID | test-negative-stale-registry |
| Test Level | negative |
| Target | validate-tests |
| Category | F |

### Phase Log

| Phase | Observation |
|-------|-------------|
| Disk count | `find tests/scenarios -name "test-*.md" -type f` returned **30** |
| Registry count | `tests/_registry.yml` field `total_tests: 30` |
| Comparison | **SYNC** — counts match |
| CI trace | `.github/workflows/validate-tests.yml` step "Verify registry count" |
| Enforcement | Uses `find tests/scenarios -name '*.md' | wc -l` vs `grep 'total_tests:'` — exits 1 on mismatch |

### CI Enforcement Mechanism

**Workflow**: `.github/workflows/validate-tests.yml`
**Step**: "Verify registry count"
**Command**:
```bash
disk_count=$(find tests/scenarios -name '*.md' | wc -l)
reg_count=$(grep 'total_tests:' tests/_registry.yml | tr -d '\r' | awk '{print $2}')
if [ "$disk_count" != "$reg_count" ]; then
  echo "FAIL: disk=$disk_count registry=$reg_count"
  exit 1
fi
```
**Exit behavior**: Non-zero exit code blocks PR merge.
**Error message**: `FAIL: disk=N registry=M`

### Hypothetical Failure Scenario

If someone adds `tests/scenarios/agents/test-new-agent.md` without updating `tests/_registry.yml`:
1. **At `git push`**: Push succeeds (no pre-push hook for this)
2. **In CI pipeline**: `validate-tests.yml` runs on the PR. The "Verify registry count" step finds disk=31 but registry=30. Step exits with code 1. PR check fails with message `FAIL: disk=31 registry=30`.
3. **README generation**: `npm run check-readmes` may also detect stale data if the README references the registry count.

### Local Verification

```bash
DISK_COUNT=$(find tests/scenarios -name "test-*.md" -type f | wc -l)
REG_COUNT=$(grep "total_tests" tests/_registry.yml | grep -o '[0-9]*')
[ "$DISK_COUNT" -eq "$REG_COUNT" ] && echo "SYNC" || echo "DESYNC"
```

### Acceptance Criteria Results

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Disk count obtained | PASS | `find` returned 30 scenario files |
| 2 | Registry count obtained | PASS | `total_tests: 30` extracted from `tests/_registry.yml` |
| 3 | Counts compared | PASS | SYNC — 30 == 30 |
| 4 | CI mechanism identified | PASS | `validate-tests.yml` step "Verify registry count" with `exit 1` on mismatch |
| 5 | Hypothetical failure described | PASS | Concrete 3-step failure path documented above |
| 6 | Local verification documented | PASS | Runnable bash snippet provided |
| 7 | README impact noted | PASS | Connection to `npm run check-readmes` explained |

**Passed**: 7/7 | **Threshold**: 5/7 | **Verdict**: **PASS**

### Key Observations

- Registry sync enforcement is present and functional via CI
- The check uses `find tests/scenarios -name '*.md'` (not `test-*.md`), which would also count non-test .md files if any existed in those directories — minor fragility
- No local pre-commit hook enforces sync; enforcement is CI-only
- The `validate-integrity.sh` script does NOT duplicate this test count check — enforcement lives solely in `validate-tests.yml`

### Lessons Learned

- Negative tests that validate CI mechanisms are inherently read-only and fast
- The absence of a local pre-commit check means developers must rely on CI feedback, adding a round-trip delay to the detection loop
