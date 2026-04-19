---
name: audit-dependency-versions
locale: wenyan-ultra
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

# 審依版

審依項之陳、險、相容。自鎖檔起錄依，較最新版，分陳級，識險，出序升報。

## 用

- 發版前→察依現且安
- 定期維護（月季）→察
- 得險報→察涉之依
- 升語版（R 4.4→4.5）→察
- 交 CRAN、npm、crates.io 前→察
- 承舊專案→評其依健

## 入

- **必**：專案根含依/鎖檔
- **可**：生態類（R、Node.js、Python、Rust）未自識時
- **可**：唯險模（略陳，專 CVE）
- **可**：免察依清單（已知可容舊版）
- **可**：相容標日（如「須容 R 4.4.x」）

## 行

### 一：錄諸依

尋、解依檔以建全錄。

**R 包：**
```bash
# Direct dependencies from DESCRIPTION
grep -A 100 "^Imports:" DESCRIPTION | grep -B 100 "^[A-Z]" | head -50
grep -A 100 "^Suggests:" DESCRIPTION | grep -B 100 "^[A-Z]" | head -50

# Pinned versions from renv.lock
cat renv.lock | grep -A 3 '"Package"'
```

**Node.js：**
```bash
# Direct dependencies
cat package.json | grep -A 100 '"dependencies"' | grep -B 100 "}"
cat package.json | grep -A 100 '"devDependencies"' | grep -B 100 "}"

# Pinned versions from lock file
cat package-lock.json | grep '"version"' | head -20
```

**Python：**
```bash
# From requirements or pyproject
cat requirements.txt
cat pyproject.toml | grep -A 50 "dependencies"

# Pinned versions
cat requirements.lock 2>/dev/null || pip freeze
```

**Rust：**
```bash
# From Cargo.toml
grep -A 50 "\[dependencies\]" Cargo.toml
# Pinned versions
cat Cargo.lock | grep -A 2 "name ="
```

立錄表：

```markdown
| Package | Pinned Version | Type | Ecosystem |
|---|---|---|---|
| dplyr | 1.1.4 | Import | R |
| testthat | 3.2.1 | Suggests | R |
| express | 4.18.2 | dependency | Node.js |
| pytest | 8.0.0 | dev | Python |
```

**得：** 直依與（可選）傳依之全錄，附釘版。

**敗：** 鎖檔缺→專案不可復。記為發現，自清單檔（DESCRIPTION、package.json）以宣版束代釘版錄之。

### 二：察最新版

每依定最新可得版。

**R：**
```r
# Check available versions
available.packages()[c("dplyr", "testthat"), "Version"]

# Or via CLI
Rscript -e 'cat(available.packages()["dplyr", "Version"])'
```

**Node.js：**
```bash
# Check outdated packages
npm outdated --json

# Or individual package
npm view express version
```

**Python：**
```bash
# Check outdated
pip list --outdated --format=json

# Or individual
pip index versions requests 2>/dev/null
```

**Rust：**
```bash
# Check outdated
cargo outdated

# Or individual
cargo search serde --limit 1
```

錄附最新版：

```markdown
| Package | Pinned | Latest | Gap |
|---|---|---|---|
| dplyr | 1.1.4 | 1.1.6 | patch |
| ggplot2 | 3.4.0 | 3.5.1 | minor |
| Rcpp | 1.0.10 | 1.0.14 | patch |
| shiny | 1.7.4 | 1.9.1 | minor |
```

**得：** 每依定最新版與差（patch/minor/major）。

**敗：** 包庫不可達→記此依「不可察」而續。勿因一庫不達阻全審。

### 三：分陳級

每依賦陳級：

| 級 | 定義 | 行 |
|---|---|---|
| **現** | 最新或最新 patch 內 | 無需 |
| **patch 落** | 同 major.minor，patch 舊 | 低優先升，多安 |
| **minor 落** | 同 major，minor 舊 | 中優先，閱更新志 |
| **major 落** | major 舊 | 高優先，升多破 |
| **EOL/封存** | 不再維護 | 危：尋代或叉 |

出陳概：

```markdown
### Staleness Summary

- **Current**: 12 packages (48%)
- **Patch behind**: 8 packages (32%)
- **Minor behind**: 3 packages (12%)
- **Major behind**: 1 package (4%)
- **EOL/Archived**: 1 package (4%)

**Overall health**: AMBER (major-behind and EOL packages present)
```

色分：
- **GREEN**：諸皆現或 patch 落
- **AMBER**：任 minor 落或一 major 落
- **RED**：多 major 落或任 EOL

**得：** 每依分陳級，附總健評。

**敗：** 版較邏輯模糊（非 SemVer、日期版）→保守分為「minor 落」並記非標版制。

### 四：察安險

依生態行險審工具：

**R：**
```r
# No built-in audit tool; check manually
# Cross-reference with https://www.r-project.org/security.html
# Check GitHub advisories for each package
```

**Node.js：**
```bash
# Built-in audit
npm audit --json

# Severity levels: info, low, moderate, high, critical
npm audit --audit-level=moderate
```

**Python：**
```bash
# Using pip-audit
pip-audit --format=json

# Or safety
safety check --json
```

**Rust：**
```bash
# Using cargo-audit
cargo audit --json
```

錄發現：

```markdown
### Security Findings

| Package | Version | CVE | Severity | Fixed In | Description |
|---|---|---|---|---|---|
| express | 4.18.2 | CVE-2024-XXXX | High | 4.19.0 | Path traversal in static file serving |
| lodash | 4.17.20 | CVE-2021-23337 | Critical | 4.17.21 | Command injection via template |

**Security status**: RED (1 critical, 1 high)
```

**得：** 險識附 CVE、嚴、涉版、修版。

**敗：** 此生態無審工具→手查 GitHub Security Advisories。記無工具則審盡力而為。

### 五：謀升路

依險與影分升序：

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

每 major 升→察其更新志以知破改。

**得：** 序升謀：險先、EOL 次、major、minor/patch 末批。

**敗：** 依無清升路（棄且無叉）→記險並薦：（一）藏存當版、（二）尋代、（三）承險而監。

### 六：錄相容險

每計升→評相容：

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

書全審報於 `DEPENDENCY-AUDIT.md` 或 `DEPENDENCY-AUDIT-2026-02-17.md`。

**得：** 每顯升錄相容險。全審報已書。

**敗：** 相容非試不可評→薦枝法：造枝、施升、行試、評果而後合。

## 驗

- [ ] 諸直依自鎖/清單檔錄
- [ ] 每依察最新版
- [ ] 陳級已賦（現/patch/minor/major/EOL）
- [ ] 總健評算（GREEN/AMBER/RED）
- [ ] 安審以生態工具行
- [ ] 諸 CVE 錄嚴、涉版、修版
- [ ] 升謀已序：險>EOL>major>minor/patch
- [ ] 每 major 升評相容險
- [ ] 審報書於 DEPENDENCY-AUDIT.md
- [ ] 無依遺為「不可察」而無故

## 忌

- **略傳依**：專案 10 直依→傳依或 200。險多藏於傳依。用 `npm ls` 或 `renv::dependencies()` 察全樹。
- **一次全升**：諸依一提交全升→無從識何升致退。依類升（險先、major 逐一、minor/patch 末批）。
- **混「陳」與「險」**：major 落一無 CVE→險低於現版具危 CVE。先安後新。
- **不閱更新志**：盲升 major 而不閱更新志→依之破改成專案之破改。
- **審疲**：行審而不行動→立策：險 1 sprint 內解、EOL 1 季內解。
- **鎖檔缺**：無鎖檔→建不可復。審現鎖檔缺自為危發現，當先解而後版升。
- **混系 R 執誤**：WSL/Docker 上 `Rscript` 或解為跨平臺包裝非原 R。察 `which Rscript && Rscript --version`。宜用原 R（如 Linux/WSL `/usr/local/bin/Rscript`）以穩。詳 [Setting Up Your Environment](../../guides/setting-up-your-environment.md)。

## 參

- `apply-semantic-versioning` — 依升或觸發版升
- `manage-renv-dependencies` — R 專依管以 renv
- `security-audit-codebase` — 廣安審含依險
- `manage-changelog` — 更新志錄依升
- `plan-release-cycle` — 依升排於發版時程內
