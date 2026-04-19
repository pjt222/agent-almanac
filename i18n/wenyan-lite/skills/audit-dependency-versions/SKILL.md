---
name: audit-dependency-versions
locale: wenyan-lite
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

# 審計依賴版本

審計項目依賴之版本陳舊度、已知安全漏洞與兼容性問題。此技能由 lock 文件盤點所有依賴，逐一對照最新版本，分類陳舊層級，標識安全疑慮，並產出帶有建議行動之優先級升級報告。

## 適用時機

- 發布前，確保依賴為最新且安全
- 定期維護（月度或季度依賴審查）
- 收到影響項目依賴之安全公告之後
- 項目升級至新語言版本之時（如 R 4.4 升至 4.5）
- 向 CRAN、npm 或 crates.io 提交包之前
- 承接他人項目，評估其依賴健康之時

## 輸入

- **必要**：含依賴／lock 文件之項目根目錄
- **選擇性**：若無法自動辨識，需指定生態類型（R、Node.js、Python、Rust）
- **選擇性**：僅查安全模式之旗標（略過陳舊度，專注 CVE）
- **選擇性**：豁免清單（已知可接受之舊版本依賴）
- **選擇性**：兼容性目標日期（如「須支援 R 4.4.x」）

## 步驟

### 步驟一：盤點所有依賴

尋找並解析依賴文件，建立完整清單。

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

建立盤點表：

```markdown
| Package | Pinned Version | Type | Ecosystem |
|---|---|---|---|
| dplyr | 1.1.4 | Import | R |
| testthat | 3.2.1 | Suggests | R |
| express | 4.18.2 | dependency | Node.js |
| pytest | 8.0.0 | dev | Python |
```

**預期：** 所有直接（及選配之傳遞）依賴之完整清單，帶固定版本。

**失敗時：** 若缺 lock 文件，項目存重現性問題。記此為一項發現，改由 manifest（DESCRIPTION、package.json）以宣告之版本約束取代固定版本進行盤點。

### 步驟二：查可用之最新版本

逐一依賴，判知其最新可用版本。

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

以最新版本更新清單：

```markdown
| Package | Pinned | Latest | Gap |
|---|---|---|---|
| dplyr | 1.1.4 | 1.1.6 | patch |
| ggplot2 | 3.4.0 | 3.5.1 | minor |
| Rcpp | 1.0.10 | 1.0.14 | patch |
| shiny | 1.7.4 | 1.9.1 | minor |
```

**預期：** 每項依賴之最新版本已標明，落差幅度亦明（patch／minor／major）。

**失敗時：** 某包註冊源無法連線時，標該依賴為「無法查核」，餘者照舊。勿因單一無法觸達之源而阻塞整場審計。

### 步驟三：分類陳舊度

為每項依賴賦予陳舊層級：

| Level | Definition | Action |
|---|---|---|
| **Current** | At latest version or within latest patch | No action needed |
| **Patch behind** | Same major.minor, older patch | Low priority upgrade, usually safe |
| **Minor behind** | Same major, older minor | Medium priority, review changelog for new features |
| **Major behind** | Older major version | High priority, likely breaking changes in upgrade |
| **EOL / Archived** | Package no longer maintained | Critical: find replacement or fork |

產出陳舊度摘要：

```markdown
### Staleness Summary

- **Current**: 12 packages (48%)
- **Patch behind**: 8 packages (32%)
- **Minor behind**: 3 packages (12%)
- **Major behind**: 1 package (4%)
- **EOL/Archived**: 1 package (4%)

**Overall health**: AMBER (major-behind and EOL packages present)
```

顏色分級：
- **GREEN**：所有包為最新或僅 patch 落後
- **AMBER**：存在 minor 落後或一項 major 落後
- **RED**：多項 major 落後或存在 EOL 包

**預期：** 每項依賴均具陳舊分類，並產出整體健康評級。

**失敗時：** 版本比較邏輯含混時（非 SemVer、日期型版本），保守歸為「minor 落後」，並註其非標準版本化。

### 步驟四：查安全漏洞

執行生態對應之安全審計工具：

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

記錄發現：

```markdown
### Security Findings

| Package | Version | CVE | Severity | Fixed In | Description |
|---|---|---|---|---|---|
| express | 4.18.2 | CVE-2024-XXXX | High | 4.19.0 | Path traversal in static file serving |
| lodash | 4.17.20 | CVE-2021-23337 | Critical | 4.17.21 | Command injection via template |

**Security status**: RED (1 critical, 1 high)
```

**預期：** 安全漏洞已標明 CVE、嚴重度、受影響版本、修復版本。

**失敗時：** 該生態無審計工具時，逐一於 GitHub Security Advisories 手動檢索。記此審計為無工具下之盡力而為。

### 步驟五：規劃升級路徑

依風險與影響排升級優先：

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

對每項 major 升級，查其 changelog 以標明已知破壞性變更。

**預期：** 升級計劃已分優先：安全優先，EOL 替換次之，major 升級再次，minor／patch 批次末位。

**失敗時：** 某依賴無清晰升級路徑（已棄養且無 fork）時，記錄風險並建議：（一）內建於本項目，（二）尋替代包，（三）接受風險並加監控。

### 步驟六：記錄兼容性風險

對每項規劃升級評估兼容性：

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

將完整審計報告寫入 `DEPENDENCY-AUDIT.md` 或 `DEPENDENCY-AUDIT-2026-02-17.md`。

**預期：** 每項重大升級之兼容性風險已記錄。完整審計報告已寫入。

**失敗時：** 若不經測試無法評估兼容性，建議採分支式升級：建分支、套用升級、跑測試，合併前評估結果。

## 驗證

- [ ] 所有直接依賴已由 lock／manifest 盤點
- [ ] 每項依賴均查最新可用版本
- [ ] 陳舊層級已賦予（current／patch／minor／major／EOL）
- [ ] 整體健康評級已計算（GREEN／AMBER／RED）
- [ ] 已以生態對應工具執行安全審計
- [ ] 所有 CVE 已記嚴重度、受影響版本、修復版本
- [ ] 升級計劃已分優先：安全 > EOL > major > minor／patch
- [ ] 每項 major 升級之兼容性風險已評估
- [ ] 審計報告已寫入 DEPENDENCY-AUDIT.md
- [ ] 未留「無法查核」而無原因註記之依賴

## 常見陷阱

- **忽視傳遞依賴**：項目或有 10 個直接依賴而 200 個傳遞依賴。安全漏洞常藏於傳遞依賴。用 `npm ls` 或 `renv::dependencies()` 觀其全樹
- **一次升級全部**：單次提交批量升級，無從定位何者引發回歸。宜分邏輯組升級（先安全、major 逐一、minor／patch 批次）
- **混淆「過時」與「不安全」**：落後一主版本而無 CVE 之包，其風險低於存有關鍵漏洞之當前包。永遠優先安全於新鮮
- **不讀 changelog**：不讀 changelog 而盲升主版本。依賴之破壞性變更即是你項目之破壞性變更
- **審計疲勞**：跑審計而不處置發現。立政策：安全發現須於 1 個衝刺內處理，EOL 須於 1 個季度內處理
- **缺 lock 文件**：無 lock 文件者，構建不可重現。若審計揭示 lock 缺失，此本身即是關鍵發現，須於版本升級前處置
- **混合系統上 R 二進位錯誤**：於 WSL 或 Docker，`Rscript` 可能解析至跨平台包裝器而非原生 R。以 `which Rscript && Rscript --version` 查驗。宜用原生 R 二進位（如 Linux／WSL 之 `/usr/local/bin/Rscript`）以保可靠。參 [Setting Up Your Environment](../../guides/setting-up-your-environment.md) 關於 R 路徑配置

## 相關技能

- `apply-semantic-versioning` — 依賴升級可能觸發版本提升
- `manage-renv-dependencies` — 以 renv 管理 R 專屬依賴
- `security-audit-codebase` — 更廣之安全審計，含依賴漏洞
- `manage-changelog` — 於 changelog 記錄依賴升級
- `plan-release-cycle` — 於發布時程內排程依賴升級
