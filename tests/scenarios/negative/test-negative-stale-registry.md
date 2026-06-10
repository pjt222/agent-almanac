---
name: test-negative-stale-registry
description: >
  Document and validate that the existing CI workflow catches registry count
  mismatches between tests/_registry.yml total_tests and the actual number of
  scenario files on disk. This is a documented validation rather than an
  executable negative test — it describes the expected CI behavior when the
  registry falls out of sync with the filesystem.
test-level: negative
target: validate-tests
category: F
duration-tier: quick
priority: P1
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [negative, stale-registry, ci-validation, registry-sync]
---

# Test: Stale Registry Detection by CI Workflow

Registries (`_registry.yml` files) must stay in sync with the files on disk.
When a test scenario is added or removed without updating `tests/_registry.yml`,
the `total_tests` count diverges from reality. This negative test documents
and validates that the CI pipeline catches this divergence. Unlike the other
negative tests, this one is primarily a documented validation: it describes
the failure mode, the expected detection mechanism, and how to verify it
locally without actually breaking the registry.

## Objective

Validate that registry-filesystem synchronization is enforced. If registries
fall out of sync, tooling produces incorrect results. This test ensures the
safety net exists by documenting expected CI behavior and providing a local
verification procedure.

## Pre-conditions

- [ ] `tests/_registry.yml` exists with a `total_tests` field
- [ ] `.github/workflows/validate-skills.yml` or equivalent CI workflow exists
- [ ] `npm run check-readmes` is configured and functional
- [ ] Current registry is in sync (baseline: total_tests matches disk count)

## Task

### Primary Task

> **Registry Sync Validation Procedure**
>
> Perform the following verification WITHOUT modifying any files:
>
> 1. **Count scenarios on disk**:
>    ```bash
>    find tests/scenarios -name "test-*.md" -type f | wc -l
>    ```
>
> 2. **Read registry count**:
>    ```bash
>    grep "total_tests" tests/_registry.yml
>    ```
>
> 3. **Compare**: Do the counts match?
>
> 4. **Document the CI mechanism**: Identify which CI workflow or script
>    would catch a mismatch. Trace the enforcement path:
>    - Which workflow file runs?
>    - What command does it execute?
>    - What exit code indicates failure?
>    - What does the error message look like?
>
> 5. **Describe the hypothetical failure**: If someone added a new test
>    scenario file but forgot to update the registry, describe exactly
>    what would happen:
>    - At `git push` time
>    - In the CI pipeline
>    - In README generation
>
> Do NOT actually modify `tests/_registry.yml` or add/remove scenario files.
> This is a read-only validation.

### Verification Shortcut

For a quick local check without CI:

```bash
# Count actual scenario files
DISK_COUNT=$(find tests/scenarios -name "test-*.md" -type f | wc -l)

# Extract registry count
REG_COUNT=$(grep "total_tests" tests/_registry.yml | grep -o '[0-9]*')

# Compare
if [ "$DISK_COUNT" -eq "$REG_COUNT" ]; then
  echo "SYNC: Registry ($REG_COUNT) matches disk ($DISK_COUNT)"
else
  echo "DESYNC: Registry ($REG_COUNT) != disk ($DISK_COUNT)"
fi
```

## Expected Behaviors

### CI-Validation Behaviors

1. **Count mismatch detected**: CI compares `total_tests` against disk count and detects divergence.
2. **Pipeline fails**: Mismatch causes non-zero exit, blocking the PR or push.
3. **Clear error message**: Output names the registry, expected count, and actual count.
4. **README generation affected**: `npm run check-readmes` also detects stale registry data.

### Documentation Behaviors

1. **Enforcement path documented**: Result includes specific CI workflow file, command, and exit behavior.
2. **Local verification provided**: Runnable command for pre-push sync check.
3. **Failure scenario described**: Hypothetical failure mode described concretely.

## Acceptance Criteria

Threshold: PASS if >= 5/7 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Disk count obtained | Actual scenario file count retrieved and stated | core |
| 2 | Registry count obtained | `total_tests` value extracted and stated | core |
| 3 | Counts compared | Explicit comparison with SYNC/DESYNC verdict | core |
| 4 | CI mechanism identified | Specific workflow file and command named | core |
| 5 | Hypothetical failure described | Concrete description of what happens on mismatch | core |
| 6 | Local verification documented | Runnable command provided for pre-push check | bonus |
| 7 | README impact noted | Connection between stale registry and incorrect READMEs explained | bonus |

## Ground Truth

Known facts about the registry and CI infrastructure.

| Fact | Expected Value | Source |
|------|---------------|--------|
| Registry file | `tests/_registry.yml` | File inspection |
| CI workflow for skills | `.github/workflows/validate-skills.yml` | File inspection |
| README check command | `npm run check-readmes` | `package.json` scripts |
| README generation script | `scripts/generate-readmes.js` | `package.json` scripts |
| Current total_tests | Must match scenario file count on disk | `tests/_registry.yml` |

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Verification procedure begins
- T1: Disk count obtained
- T2: Registry count obtained
- T3: Comparison completed
- T4: CI mechanism documented
- T5: Verification complete

### Recording Template

```markdown
## Run: YYYY-MM-DD-stale-registry-NNN
**Observer**: <name> | **Start**: HH:MM | **End**: HH:MM | **Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | Disk count | N scenario files found |
| HH:MM | Registry count | total_tests = N |
| HH:MM | Comparison | SYNC / DESYNC |
| HH:MM | CI trace | Workflow identified |

### Acceptance Criteria Results
| # | Result | Evidence |
|---|--------|----------|
| 1-7 | PASS/FAIL | ... |

### Key Observations / Lessons Learned
- ...
```

## Variants

- **Variant A: Skills registry** — Same check on `skills/_registry.yml`. Tests generalization.
- **Variant B: Intentional desync** — Add dummy file without registry update on feature branch. Executable version.
- **Variant C: Agent registry** — Check `agents/_registry.yml` total_agents. Different content type.
