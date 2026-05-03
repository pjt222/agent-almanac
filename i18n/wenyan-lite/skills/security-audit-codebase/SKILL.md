---
name: security-audit-codebase
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Perform a security audit of a codebase checking for exposed secrets,
  vulnerable dependencies, injection vulnerabilities, insecure
  configurations, and OWASP Top 10 issues. Use before publishing or
  deploying a project, for periodic security reviews, after adding
  authentication or API integration, before open-sourcing a private
  repository, or when preparing for a security compliance audit.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: security, audit, owasp, secrets, vulnerability
---

# 程式碼倉庫安全審計

對程式碼倉庫執行系統化安全審查以識別漏洞與已洩之秘密。

## 適用時機

- 發佈或部署項目前
- 既有項目之定期安全審查
- 新增認證、API 整合或用戶輸入處理後
- 將私有倉庫開源前
- 為安全合規審計作準備

## 輸入

- **必要**：待審計之程式碼倉庫
- **選擇性**：特定關注領域（秘密、依賴、注入、認證）
- **選擇性**：合規框架（OWASP、ISO 27001、SOC 2）
- **選擇性**：先前審計發現以供比較

## 步驟

### 步驟一：掃描已洩之秘密

搜尋指示硬編碼秘密之模式：

```bash
# API keys and tokens
grep -rn "sk-\|ghp_\|gho_\|github_pat_\|hf_\|AKIA" --include="*.{md,js,ts,py,R,json,yml,yaml}" .

# Generic secret patterns
grep -rn "password\s*=\s*['\"]" --include="*.{js,ts,py,R,json}" .
grep -rn "api[_-]key\s*[=:]\s*['\"]" --include="*.{js,ts,py,R,json}" .
grep -rn "secret\s*[=:]\s*['\"]" --include="*.{js,ts,py,R,json}" .

# Connection strings
grep -rn "postgresql://\|mysql://\|mongodb://" .

# Private keys
grep -rn "BEGIN.*PRIVATE KEY" .
```

**預期：** 無真秘密——僅佔位如 `YOUR_TOKEN_HERE` 或 `your.email@example.com`。

**失敗時：** 若找到真秘密，立即移除之、輪換已洩之憑證、並以 `git filter-branch` 或 `git-filter-repo` 清理 git 歷史。任何已洩秘密皆視為已洩漏。

### 步驟二：檢查 .gitignore 覆蓋

驗證敏感文件已被排除：

```bash
# Check that these are git-ignored
git check-ignore .env .Renviron credentials.json node_modules/

# Look for tracked sensitive files
git ls-files | grep -i "\.env\|\.renviron\|credentials\|secret"
```

**預期：** 所有敏感文件（`.env`、`.Renviron`、`credentials.json`）列於 `.gitignore` 中，且 `git ls-files` 不返已追蹤之敏感文件。

**失敗時：** 若敏感文件已追蹤，執行 `git rm --cached <file>` 取消追蹤、加入 `.gitignore` 並提交。文件保留於磁碟但不再受版本控制。

### 步驟三：審計依賴

**Node.js**：

```bash
npm audit
npx audit-ci --moderate
```

**Python**：

```bash
pip-audit
safety check
```

**R**：

```r
# Check for known vulnerabilities in packages
# No built-in tool, but verify package sources
renv::status()
```

**預期：** 依賴中無高或關鍵漏洞。中與低漏洞已記錄供審視。

**失敗時：** 若找到關鍵漏洞，以 `npm audit fix` 或 `pip install --upgrade` 立即更新受影響之套件。若更新引入破壞性變更，記錄漏洞並建立補救計劃。

### 步驟四：檢查注入漏洞

**SQL 注入**：

```bash
# Look for string concatenation in queries
grep -rn "paste.*SELECT\|paste.*INSERT\|paste.*UPDATE\|paste.*DELETE" --include="*.R" .
grep -rn "query.*\+.*\|query.*\$\{" --include="*.{js,ts}" .
```

所有資料庫查詢應用參數化查詢，非字串串接。

**命令注入**：

```bash
# Look for shell execution with user input
grep -rn "system\(.*paste\|exec(\|spawn(" --include="*.{R,js,ts,py}" .
```

**XSS（跨站腳本）**：

```bash
# Look for unescaped user content in HTML
grep -rn "innerHTML\|dangerouslySetInnerHTML\|v-html" --include="*.{js,ts,jsx,tsx,vue}" .
```

**預期：** 無 SQL、命令或 XSS 注入向量。所有資料庫查詢用參數化語句、shell 命令避免用戶控制之輸入、HTML 輸出已正確跳脫。

**失敗時：** 若找到注入漏洞，將查詢中之字串串接代以參數化查詢、shell 執行前對用戶輸入消毒或跳脫、用框架安全之渲染方法而非 `innerHTML` 或 `dangerouslySetInnerHTML`。

### 步驟五：審視認證與授權

清單：
- [ ] 密碼以 bcrypt/argon2（非 MD5/SHA1）雜湊
- [ ] 會話 token 為隨機且足夠長
- [ ] 認證 token 有過期
- [ ] API 端點檢查授權
- [ ] CORS 配置嚴格
- [ ] 變更狀態之操作啟用 CSRF 保護

**預期：** 所有清單項皆通過：密碼用強雜湊、token 為隨機附過期、端點強制授權、CORS 嚴格、CSRF 保護啟用。

**失敗時：** 依嚴重度排修正之優先：弱密碼雜湊與缺授權為關鍵；CORS 與 CSRF 問題為高。記錄所有發現附其嚴重度等級。

### 步驟六：檢查配置安全

```bash
# Debug mode in production configs
grep -rn "debug\s*[=:]\s*[Tt]rue\|DEBUG\s*=\s*1" --include="*.{json,yml,yaml,toml,cfg}" .

# Permissive CORS
grep -rn "Access-Control-Allow-Origin.*\*\|cors.*origin.*\*" --include="*.{js,ts}" .

# HTTP instead of HTTPS
grep -rn "http://" --include="*.{js,ts,py,R}" . | grep -v "localhost\|127.0.0.1\|http://"
```

**預期：** 生產配置中除錯模式停用、生產中 CORS 不用萬用源、所有外部 URL 用 HTTPS。

**失敗時：** 若生產配置中除錯模式啟用，立即停用之。將萬用 CORS 源代以明確之允許域名。將 `http://` URL 更新為 `https://`，於端點支援之處。

### 步驟七：記錄發現

建立審計報告：

```markdown
# Security Audit Report

**Date**: YYYY-MM-DD
**Auditor**: [Name]
**Scope**: [Repository/Project]
**Status**: [PASS/FAIL/CONDITIONAL]

## Findings Summary

| Category | Status | Details |
|----------|--------|---------|
| Exposed secrets | PASS | No secrets found |
| .gitignore | PASS | Sensitive files excluded |
| Dependencies | WARN | 2 moderate vulnerabilities |
| Injection | PASS | Parameterized queries used |
| Auth/AuthZ | N/A | No authentication in scope |
| Configuration | PASS | Debug mode disabled |

## Detailed Findings

### Finding 1: [Title]
- **Severity**: Low / Medium / High / Critical
- **Location**: `path/to/file:line`
- **Description**: What was found
- **Recommendation**: How to fix
- **Status**: Open / Resolved

## Recommendations
1. Update dependencies to fix moderate vulnerabilities
2. [Additional recommendations]
```

**預期：** 完整 `SECURITY_AUDIT_REPORT.md` 已儲於項目根，發現按嚴重度分類，每附具體位置、描述與建議。

**失敗時：** 若發現過多難以個別記錄，按類別分組並優先處理關鍵/高發現。無論結果為何皆產生報告以建立基線。

## 驗證

- [ ] 源碼中無硬編碼之秘密
- [ ] .gitignore 涵蓋所有敏感文件
- [ ] 無高/關鍵之依賴漏洞
- [ ] 無注入漏洞
- [ ] 認證已正確實作（如適用）
- [ ] 審計報告完整且發現已處理

## 常見陷阱

- **僅檢查當前文件**：git 歷史中之秘密仍洩漏。以 `git log -p --all -S 'secret_pattern'` 檢查。
- **忽視開發依賴**：開發依賴仍可能引入供應鏈風險。
- **`.gitignore` 之假安全感**：`.gitignore` 僅阻止未來追蹤。已提交之文件需 `git rm --cached`。
- **忽略配置文件**：`docker-compose.yml`、CI 配置與部署腳本常含秘密。
- **未輪換已洩之憑證**：找到並移除秘密不夠。憑證須撤銷並重新生成。

## 相關技能

- `configure-git-repository` - 適當之 .gitignore 設置
- `write-claude-md` - 記錄安全要求
- `setup-gxp-r-project` - 受監管環境之安全
