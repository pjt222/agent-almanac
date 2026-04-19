---
name: audit-dependency-versions
locale: caveman-ultra
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

Audit deps → ver staleness, known security vulns, compat issues. Inventory all deps from lock files → check latest → classify staleness → flag security → prioritized upgrade report.

## Use When

- Pre-release → deps current + secure
- Periodic maint (monthly/quarterly)
- Security advisory hits project dep
- Lang ver upgrade (R 4.4 → 4.5)
- Pre-submit CRAN/npm/crates.io
- Inheriting project → dep health

## In

- **Required**: Project root w/ dep/lock files
- **Optional**: Ecosystem (R, Node.js, Python, Rust)
- **Optional**: Security-only mode (skip staleness → CVEs)
- **Optional**: Allowlist deps to skip
- **Optional**: Compat target date (e.g., "R 4.4.x")

## Do

### Step 1: Inventory All Dependencies

Parse dep files → complete inventory.

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

Inventory table:

```markdown
| Package | Pinned Version | Type | Ecosystem |
|---|---|---|---|
| dplyr | 1.1.4 | Import | R |
| testthat | 3.2.1 | Suggests | R |
| express | 4.18.2 | dependency | Node.js |
| pytest | 8.0.0 | dev | Python |
```

**→** Complete inventory direct + (optional) transitive deps w/ pinned vers.

**If err:** Lock files missing → repro issues. Note as finding → inventory from manifest w/ declared constraints.

### Step 2: Check Latest Available Versions

Latest ver per dep.

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

Update inventory:

```markdown
| Package | Pinned | Latest | Gap |
|---|---|---|---|
| dplyr | 1.1.4 | 1.1.6 | patch |
| ggplot2 | 3.4.0 | 3.5.1 | minor |
| Rcpp | 1.0.10 | 1.0.14 | patch |
| shiny | 1.7.4 | 1.9.1 | minor |
```

**→** Latest ver per dep w/ gap magnitude (patch/minor/major).

**If err:** Registry unreachable → mark "unable to check", continue. Don't block full audit on one registry.

### Step 3: Classify Staleness

Staleness level per dep:

| Level | Definition | Action |
|---|---|---|
| **Current** | At latest version or within latest patch | No action needed |
| **Patch behind** | Same major.minor, older patch | Low priority upgrade, usually safe |
| **Minor behind** | Same major, older minor | Medium priority, review changelog for new features |
| **Major behind** | Older major version | High priority, likely breaking changes in upgrade |
| **EOL / Archived** | Package no longer maintained | Critical: find replacement or fork |

Summary:

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
- **GREEN**: All current/patch-behind
- **AMBER**: Any minor-behind or one major-behind
- **RED**: Multiple major-behind or any EOL

**→** Every dep classified + overall health rating.

**If err:** Ver comparison ambiguous (non-SemVer, date-based) → classify conservatively "minor behind" + note non-standard scheme.

### Step 4: Check for Security Vulnerabilities

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

**→** Vulns w/ CVE, severity, affected ver, fix ver.

**If err:** No audit tool → GitHub Security Advisories manual search per dep. Best-effort without tooling.

### Step 5: Plan Upgrade Path

Prioritize by risk + impact:

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

Major upgrades → note breaking changes from dep changelog.

**→** Prioritized plan: security → EOL → major → minor/patch batches.

**If err:** Dep abandoned, no fork → document risk. Recommend: (1) vendor current, (2) alt pkg, (3) accept + monitor.

### Step 6: Document Compatibility Risks

Per planned upgrade:

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

Write report → `DEPENDENCY-AUDIT.md` or `DEPENDENCY-AUDIT-2026-02-17.md`.

**→** Compat risks documented per significant upgrade. Report complete.

**If err:** Can't assess without testing → branch-based upgrade: branch, apply, test, evaluate, merge.

## Check

- [ ] All direct deps inventoried from lock/manifest
- [ ] Latest ver checked per dep
- [ ] Staleness level assigned (current/patch/minor/major/EOL)
- [ ] Overall health rating (GREEN/AMBER/RED)
- [ ] Security audit w/ ecosystem tooling
- [ ] All CVEs documented (severity, affected, fix)
- [ ] Upgrade plan prioritized: security > EOL > major > minor/patch
- [ ] Compat risks per major upgrade
- [ ] Report → DEPENDENCY-AUDIT.md
- [ ] No "unable to check" w/o reason

## Traps

- **Ignore transitive deps**: 10 direct → 200 transitive. Vulns hide transitive. Use `npm ls` / `renv::dependencies()`.
- **Upgrade all at once**: Batch upgrade → can't identify regression source. Upgrade logical groups (security first, majors individually, minors/patches batched).
- **"Outdated" ≠ "insecure"**: Major behind + no CVE < current + critical vuln. Security > freshness.
- **Skip changelogs**: Blind major upgrade → breaking changes in dep → breaking changes in your project.
- **Audit fatigue**: Audits w/o action → worthless. Policy: security → 1 sprint, EOL → 1 quarter.
- **Missing lock files**: No lock → non-repro builds. Finding itself critical.
- **Wrong R binary on hybrid**: WSL/Docker → `Rscript` may be cross-platform wrapper. Check `which Rscript && Rscript --version`. Prefer native (e.g., `/usr/local/bin/Rscript`). See [Setting Up Your Environment](../../guides/setting-up-your-environment.md).

## →

- `apply-semantic-versioning` — ver bumps may trigger from dep upgrades
- `manage-renv-dependencies` — R-specific dep mgmt w/ renv
- `security-audit-codebase` — broader security audit inc. dep vulns
- `manage-changelog` — doc dep upgrades in changelog
- `plan-release-cycle` — schedule dep upgrades in release timeline
