---
name: audit-dependency-versions
locale: wenyan
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

# 查依賴之版

審項目之依，察其陳腐、安之隱患、相容之失。此技列諸依於鎖檔，各較其最新可得之版，分其陳腐之等，識其安之憂，生按先後排列之升級報告與建行。

## 用時

- 發版之前，驗諸依之新且安
- 定期維護（月或季一察）
- 得安之告，涉項目之依
- 升項目之語言版（如 R 4.4 至 4.5）
- 送包於 CRAN、npm、crates.io 之前
- 承舊項目而欲察其依之康

## 入

- **必要**：項目根目錄，含依檔與鎖檔
- **可選**：生態之類（若不可自辨：R、Node.js、Python、Rust）
- **可選**：唯察安之旗（略陳腐之察，專注 CVE）
- **可選**：略之白名單（已知可接之舊版）
- **可選**：相容之日標（如「必與 R 4.4.x 相合」）

## 法

### 第一步：列諸依

尋而解依檔，建全目。

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

建目之表：

```markdown
| Package | Pinned Version | Type | Ecosystem |
|---|---|---|---|
| dplyr | 1.1.4 | Import | R |
| testthat | 3.2.1 | Suggests | R |
| express | 4.18.2 | dependency | Node.js |
| pytest | 8.0.0 | dev | Python |
```

**得：** 全目已成，直接之依（與可選之傳遞之依）皆附定版。

**敗則：** 若鎖檔闕，項目之可重現已失。記此為一發現，由清單檔（DESCRIPTION、package.json）以所宣之範圍列之，代定版。

### 第二步：查最新可得之版

各依斷其最新可得之版。

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

更目以新版：

```markdown
| Package | Pinned | Latest | Gap |
|---|---|---|---|
| dplyr | 1.1.4 | 1.1.6 | patch |
| ggplot2 | 3.4.0 | 3.5.1 | minor |
| Rcpp | 1.0.10 | 1.0.14 | patch |
| shiny | 1.7.4 | 1.9.1 | minor |
```

**得：** 各依之最新版已識，附差距之等（patch/minor/major）。

**敗則：** 若某倉不可達，記其依為「不可察」而繼察其餘。一倉之不通，不阻全審。

### 第三步：分陳腐之等

各依賦陳腐之等：

| 等 | 義 | 行 |
|---|---|---|
| **Current** | 於最新，或於最新之 patch 內 | 不必動 |
| **Patch behind** | 同 major.minor，patch 較舊 | 低優先，升之常安 |
| **Minor behind** | 同 major，minor 較舊 | 中優先，閱變更記識新功 |
| **Major behind** | major 較舊 | 高優先，升之多有破壞之變 |
| **EOL / Archived** | 包已停維 | 危：尋代或分叉 |

生陳腐之概：

```markdown
### Staleness Summary

- **Current**: 12 packages (48%)
- **Patch behind**: 8 packages (32%)
- **Minor behind**: 3 packages (12%)
- **Major behind**: 1 package (4%)
- **EOL/Archived**: 1 package (4%)

**Overall health**: AMBER (major-behind and EOL packages present)
```

顏色之編：
- **GREEN**：諸包皆新或唯 patch 陳
- **AMBER**：有 minor 陳，或一 major 陳
- **RED**：多 major 陳，或有 EOL 之包

**得：** 諸依皆已分等，附總體康之評。

**敗則：** 若版之較曖昧（非 SemVer、以日為版），保守歸於「minor 陳」而記其非標準之版。

### 第四步：察安之隱患

行生態專用之安審之器：

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

記所發：

```markdown
### Security Findings

| Package | Version | CVE | Severity | Fixed In | Description |
|---|---|---|---|---|---|
| express | 4.18.2 | CVE-2024-XXXX | High | 4.19.0 | Path traversal in static file serving |
| lodash | 4.17.20 | CVE-2021-23337 | Critical | 4.17.21 | Command injection via template |

**Security status**: RED (1 critical, 1 high)
```

**得：** 安之隱患已識，附 CVE、嚴重、受累之版、修之版。

**敗則：** 若生態無審之器，人手查 GitHub Security Advisories。記此審無器，乃盡力而為。

### 第五步：謀升級之徑

依風險與影響分先後：

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

各 major 升級，察依之變更記以記所知之破壞之變。

**得：** 升級之計已分先後：安之修為先、EOL 之代次之、major 又次之、minor/patch 成組於末。

**敗則：** 若某依無明徑（棄而無叉），記其險而建：(1) 內含現版、(2) 尋替包、或 (3) 監控而納險。

### 第六步：錄相容之險

各擬升級察其相容：

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

書全審報告於 `DEPENDENCY-AUDIT.md` 或 `DEPENDENCY-AUDIT-2026-02-17.md`。

**得：** 諸重升級之相容險已錄，全報告已書。

**敗則：** 若不試則相容不可察，建以分枝升級之法：建枝、施升、行試、評之再合。

## 驗

- [ ] 諸直接之依皆由鎖/清單檔列之
- [ ] 各依皆察其最新版
- [ ] 陳腐之等已賦（current / patch / minor / major / EOL）
- [ ] 總體康之評已計（GREEN / AMBER / RED）
- [ ] 安審以生態之器已行
- [ ] 諸 CVE 已記，附嚴重、受累之版、修之版
- [ ] 升級之計已分先後：安 > EOL > major > minor/patch
- [ ] 諸 major 升級之相容險已察
- [ ] 審報告已書於 DEPENDENCY-AUDIT.md
- [ ] 無依懸為「不可察」而無故

## 陷

- **略傳遞之依**：項目或有十直依而二百傳依。安之患常匿於傳依。以 `npm ls` 或 `renv::dependencies()` 察全樹
- **一舉盡升**：一提而盡升諸依，致不能辨何升致敗。宜分組而升（安為先、major 逐一、minor/patch 成組）
- **混「陳」與「危」**：一包 major 陳而無 CVE 之險，低於一包新而有危之隱患。安永於新之前
- **不閱變更記**：盲升 major 而不閱變更記。依之破壞之變即汝項目之破壞之變
- **審之倦**：行審而不行其所發。立策：安之發現一衝刺內必解，EOL 一季內必解
- **鎖檔之闕**：無鎖檔之項目，建非可重現。若審發現鎖檔之闕，此本身為危之發現，先於版之升級
- **混合系統之誤 R 二進位**：於 WSL 或 Docker，`Rscript` 或解於跨平台之包裝，非原生之 R。以 `which Rscript && Rscript --version` 察之。宜用原生之 R 二進位（如 Linux/WSL 之 `/usr/local/bin/Rscript`）以靠之。見 [Setting Up Your Environment](../../guides/setting-up-your-environment.md) 以設 R 之徑

## 參

- `apply-semantic-versioning` — 依之升或致版之升
- `manage-renv-dependencies` — R 專用之依之管，以 renv
- `security-audit-codebase` — 廣之安審，含依之患
- `manage-changelog` — 於變更記中錄依之升
- `plan-release-cycle` — 於發版之期排依之升
