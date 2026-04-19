---
name: audit-dependency-versions
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Audit project dependencies for version staleness, security vulnerabilities,
  and compatibility issues. Covers lock file analysis, upgrade path planning,
  and breaking change assessment. Use before a release to ensure dependencies
  are current and secure, during periodic maintenance reviews, after receiving
  a security advisory, when upgrading to a new language version, before
  submitting to CRAN or npm, or when inheriting a project to assess its
  dependency health.
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: versioning
  complexity: intermediate
  language: multi
  tags: versioning, dependencies, audit, security, upgrades
---

# Audit Dependency Versions

Audit project dependencies for version staleness, known security vulnerabilities, compatibility issues. Skill inventories all deps from lock files, checks each against latest available version, classifies staleness, flags security concerns, produces prioritized upgrade report with recommended actions.

## When Use

- Before release — ensure deps current and secure
- Periodic maintenance (monthly, quarterly reviews)
- After security advisory hits project dep
- Upgrading project to new language version (R 4.4 → 4.5)
- Before submission to CRAN, npm, crates.io
- Inheriting project — assess dep health

## Inputs

- **Required**: Project root directory with dependency/lock files
- **Optional**: Ecosystem type if not auto-detectable (R, Node.js, Python, Rust)
- **Optional**: Security-only mode flag (skip staleness, focus on CVEs)
- **Optional**: Allowlist of deps to skip (known acceptable older versions)
- **Optional**: Target date for compatibility (e.g., "must work with R 4.4.x")

## Steps

### Step 1: Inventory All Deps

Locate and parse dependency files. Build complete inventory.

**R packages:**
```bash
# Direct dependencies from DESCRIPTION
grep -A 100 "^Imports:" DESCRIPTION | grep -B 100 "^[A-Z]" | head -50
grep -A 100 "^Suggests:" DESCRIPTION | grep -B 100 "^[A-Z]" | head -50

# Pinned versions from renv.lock
cat renv.lock | grep -A 3 '"Package"'
```

**Node.js:**
```bash
# Direct dependencies
cat package.json | grep -A 100 '"dependencies"' | grep -B 100 "}"
cat package.json | grep -A 100 '"devDependencies"' | grep -B 100 "}"

# Pinned versions from lock file
cat package-lock.json | grep '"version"' | head -20
```

**Python:**
```bash
# From requirements or pyproject
cat requirements.txt
cat pyproject.toml | grep -A 50 "dependencies"

# Pinned versions
cat requirements.lock 2>/dev/null || pip freeze
```

**Rust:**
```bash
# From Cargo.toml
grep -A 50 "\[dependencies\]" Cargo.toml
# Pinned versions
cat Cargo.lock | grep -A 2 "name ="
```

Build inventory table:

```markdown
| Package | Pinned Version | Type | Ecosystem |
|---|---|---|---|
| dplyr | 1.1.4 | Import | R |
| testthat | 3.2.1 | Suggests | R |
| express | 4.18.2 | dependency | Node.js |
| pytest | 8.0.0 | dev | Python |
```

**Got:** Complete inventory of all direct and (optionally) transitive deps with pinned versions.

**If fail:** Lock files missing? Project has reproducibility issues. Note as finding, inventory from manifest (DESCRIPTION, package.json) using declared version constraints instead of pinned.

### Step 2: Check Latest Available Versions

For each dep, determine latest available.

**R:**
```r
# Check available versions
available.packages()[c("dplyr", "testthat"), "Version"]

# Or via CLI
Rscript -e 'cat(available.packages()["dplyr", "Version"])'
```

**Node.js:**
```bash
# Check outdated packages
npm outdated --json

# Or individual package
npm view express version
```

**Python:**
```bash
# Check outdated
pip list --outdated --format=json

# Or individual
pip index versions requests 2>/dev/null
```

**Rust:**
```bash
# Check outdated
cargo outdated

# Or individual
cargo search serde --limit 1
```

Update inventory with latest versions:

```markdown
| Package | Pinned | Latest | Gap |
|---|---|---|---|
| dplyr | 1.1.4 | 1.1.6 | patch |
| ggplot2 | 3.4.0 | 3.5.1 | minor |
| Rcpp | 1.0.10 | 1.0.14 | patch |
| shiny | 1.7.4 | 1.9.1 | minor |
```

**Got:** Latest version per dep with gap magnitude (patch/minor/major).

**If fail:** Package registry unreachable? Mark dep "unable to check", proceed with rest. Don't block whole audit on one registry.

### Step 3: Classify Staleness

Assign staleness level per dep:

| Level | Definition | Action |
|---|---|---|
| **Current** | At latest version or within latest patch | No action needed |
| **Patch behind** | Same major.minor, older patch | Low priority upgrade, usually safe |
| **Minor behind** | Same major, older minor | Medium priority, review changelog for new features |
| **Major behind** | Older major version | High priority, likely breaking changes in upgrade |
| **EOL / Archived** | Package no longer maintained | Critical: find replacement or fork |

Produce staleness summary:

```markdown
### Staleness Summary

- **Current**: 12 packages (48%)
- **Patch behind**: 8 packages (32%)
- **Minor behind**: 3 packages (12%)
- **Major behind**: 1 package (4%)
- **EOL/Archived**: 1 package (4%)

**Overall health**: AMBER (major-behind and EOL packages present)
```

Color coding:
- **GREEN**: All current or patch-behind
- **AMBER**: Any minor-behind or one major-behind
- **RED**: Multiple major-behind or any EOL

**Got:** Every dep classified by staleness. Overall health rating.

**If fail:** Version comparison ambiguous (non-SemVer, date-based)? Classify conservatively as "minor behind", note non-standard versioning.

### Step 4: Check Security Vulnerabilities

Run ecosystem-specific audit tools:

**R:**
```r
# No built-in audit tool; check manually
# Cross-reference with https://www.r-project.org/security.html
# Check GitHub advisories for each package
```

**Node.js:**
```bash
# Built-in audit
npm audit --json

# Severity levels: info, low, moderate, high, critical
npm audit --audit-level=moderate
```

**Python:**
```bash
# Using pip-audit
pip-audit --format=json

# Or safety
safety check --json
```

**Rust:**
```bash
# Using cargo-audit
cargo audit --json
```

Document findings:

```markdown
### Security Findings

| Package | Version | CVE | Severity | Fixed In | Description |
|---|---|---|---|---|---|
| express | 4.18.2 | CVE-2024-XXXX | High | 4.19.0 | Path traversal in static file serving |
| lodash | 4.17.20 | CVE-2021-23337 | Critical | 4.17.21 | Command injection via template |

**Security status**: RED (1 critical, 1 high)
```

**Got:** Vulnerabilities flagged with CVE, severity, affected version, fix version.

**If fail:** No audit tool for ecosystem? Search GitHub Security Advisories manually per dep. Note audit best-effort without tooling.

### Step 5: Plan Upgrade Path

Prioritize upgrades by risk and impact:

```markdown
### Upgrade Plan

#### Priority 1: Security Fixes (do immediately)
| Package | Current | Target | Risk | Notes |
|---|---|---|---|---|
| lodash | 4.17.20 | 4.17.21 | Low (patch) | Fixes CVE-2021-23337 |
| express | 4.18.2 | 4.19.0 | Low (minor) | Fixes CVE-2024-XXXX |

#### Priority 2: EOL Replacements (plan within 1 month)
| Package | Current | Replacement | Migration Effort |
|---|---|---|---|
| request | 2.88.2 | node-fetch 3.x | Medium (API change) |

#### Priority 3: Major Version Upgrades (plan for next release cycle)
| Package | Current | Target | Breaking Changes |
|---|---|---|---|
| webpack | 4.46.0 | 5.90.0 | Config format, plugin API |

#### Priority 4: Minor/Patch Updates (batch in maintenance window)
| Package | Current | Target | Notes |
|---|---|---|---|
| dplyr | 1.1.4 | 1.1.6 | Patch fixes only |
| ggplot2 | 3.4.0 | 3.5.1 | New geom functions added |
```

Per major upgrade, note known breaking changes from dep changelog.

**Got:** Prioritized upgrade plan — security first, then EOL replacements, major upgrades, minor/patch batches.

**If fail:** Dep has no clear upgrade path (abandoned, no fork)? Document risk, recommend: (1) vendor current version, (2) find alternative package, (3) accept risk with monitoring.

### Step 6: Document Compatibility Risks

Per planned upgrade, assess compatibility:

```markdown
### Compatibility Assessment

#### express 4.18.2 -> 4.19.0
- **API changes**: None (patch-level fix)
- **Node.js requirement**: Same (>=14)
- **Test impact**: Run full test suite; expect zero failures
- **Confidence**: HIGH

#### webpack 4.46.0 -> 5.90.0
- **API changes**: Config file format changed, several plugins removed
- **Node.js requirement**: >=10.13 (unchanged)
- **Test impact**: Build configuration must be rewritten; all tests need re-run
- **Confidence**: LOW (requires dedicated migration effort)
- **Migration guide**: https://webpack.js.org/migrate/5/
```

Write complete audit report to `DEPENDENCY-AUDIT.md` or `DEPENDENCY-AUDIT-2026-02-17.md`.

**Got:** Compatibility risks documented per significant upgrade. Complete audit report written.

**If fail:** Compatibility cannot be assessed without testing? Recommend branch-based approach: create branch, apply upgrade, run tests, evaluate before merge.

## Checks

- [ ] All direct deps inventoried from lock/manifest files
- [ ] Latest available version checked per dep
- [ ] Staleness level assigned (current / patch / minor / major / EOL)
- [ ] Overall health rating calculated (GREEN / AMBER / RED)
- [ ] Security audit run with ecosystem-appropriate tooling
- [ ] All CVEs documented with severity, affected version, fix version
- [ ] Upgrade plan prioritized: security > EOL > major > minor/patch
- [ ] Compatibility risks assessed per major upgrade
- [ ] Audit report written to DEPENDENCY-AUDIT.md
- [ ] No deps left as "unable to check" without documented reason

## Pitfalls

- **Ignoring transitive deps**: Project may have 10 direct deps but 200 transitive. Vulnerabilities hide in transitive deps. Use `npm ls` or `renv::dependencies()` for full tree.
- **Upgrading everything at once**: Batch-upgrading all deps in one commit makes regressions untraceable. Upgrade in logical groups (security first, majors individually, minors/patches batched).
- **Confusing "outdated" with "insecure"**: Package one major behind with no CVEs = lower risk than current package with critical CVE. Prioritize security over freshness.
- **Not reading changelogs**: Blindly upgrading major version without changelog. Breaking changes in dep become breaking changes in your project.
- **Audit fatigue**: Running audits but not acting on findings. Set policy: security findings within 1 sprint, EOL within 1 quarter.
- **Missing lock files**: Projects without lock files have non-reproducible builds. Missing lock files = critical finding before versioned upgrades.
- **Wrong R binary on hybrid systems**: WSL/Docker — `Rscript` may resolve to cross-platform wrapper instead of native R. Check with `which Rscript && Rscript --version`. Prefer native binary (e.g., `/usr/local/bin/Rscript` on Linux/WSL). See [Setting Up Your Environment](../../guides/setting-up-your-environment.md) for R path config.

## See Also

- `apply-semantic-versioning` -- Version bumps may be triggered by dep upgrades
- `manage-renv-dependencies` -- R-specific dep management with renv
- `security-audit-codebase` -- Broader security audit including dep vulnerabilities
- `manage-changelog` -- Document dep upgrades in changelog
- `plan-release-cycle` -- Schedule dep upgrades within release timeline
