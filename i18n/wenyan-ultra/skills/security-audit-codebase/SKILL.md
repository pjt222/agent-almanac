---
name: security-audit-codebase
locale: wenyan-ultra
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

# 安察庫

系察碼庫識弱與露密。

## 用

- 釋前→用
- 既項定期察→用
- 加認、API 接、用入後→用
- 私庫開源前→用
- 備安合察→用

## 入

- **必**：所察庫
- **可**：重域（密、依、注、認）
- **可**：合框（OWASP、ISO 27001、SOC 2）
- **可**：前察果以較

## 行

### 一：掃露密

搜硬碼密之式：

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

得：無實密—僅占如 `YOUR_TOKEN_HERE` 或 `your.email@example.com`。

敗：實密得→立除、轉露憑、用 `git filter-branch` 或 `git-filter-repo` 清史。視諸露密為破。

### 二：察 .gitignore 覆

驗敏檔排：

```bash
git check-ignore .env .Renviron credentials.json node_modules/

git ls-files | grep -i "\.env\|\.renviron\|credentials\|secret"
```

得：諸敏（`.env`、`.Renviron`、`credentials.json`）列於 `.gitignore`、`git ls-files` 無追敏檔返。

敗：敏檔追→`git rm --cached <file>` 解追、加 `.gitignore`、提。檔留於盤而不再控版。

### 三：察依

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
renv::status()
```

得：依無高或關弱。中低弱文錄以察。

敗：關弱得→立更影包以 `npm audit fix` 或 `pip install --upgrade`。更引破變→文錄弱、建補計。

### 四：察注弱

**SQL 注**：

```bash
grep -rn "paste.*SELECT\|paste.*INSERT\|paste.*UPDATE\|paste.*DELETE" --include="*.R" .
grep -rn "query.*\+.*\|query.*\$\{" --include="*.{js,ts}" .
```

諸庫詢宜參化、非串接。

**命注**：

```bash
grep -rn "system\(.*paste\|exec(\|spawn(" --include="*.{R,js,ts,py}" .
```

**XSS**：

```bash
grep -rn "innerHTML\|dangerouslySetInnerHTML\|v-html" --include="*.{js,ts,jsx,tsx,vue}" .
```

得：無 SQL、命、XSS 注向。庫詢用參、命避用控、HTML 出正義。

敗：注弱得→詢串接代以參、殼前淨或義入、用框安繪代 `innerHTML` 或 `dangerouslySetInnerHTML`。

### 五：察認與授

清單：
- [ ] 密碼用 bcrypt/argon2 散（非 MD5/SHA1）
- [ ] 會令隨且足長
- [ ] 認令有期
- [ ] API 端察授
- [ ] CORS 嚴配
- [ ] CSRF 護啟於變態操

得：諸項過：密碼用強散、令隨有期、端強授、CORS 嚴、CSRF 活。

敗：按重排修：弱散與缺授為關、CORS 與 CSRF 為高。文錄諸發現附級。

### 六：察配安

```bash
# Debug mode in production configs
grep -rn "debug\s*[=:]\s*[Tt]rue\|DEBUG\s*=\s*1" --include="*.{json,yml,yaml,toml,cfg}" .

# Permissive CORS
grep -rn "Access-Control-Allow-Origin.*\*\|cors.*origin.*\*" --include="*.{js,ts}" .

# HTTP instead of HTTPS
grep -rn "http://" --include="*.{js,ts,py,R}" . | grep -v "localhost\|127.0.0.1\|http://"
```

得：產配除錯模禁、CORS 不用通配於產、諸外 URL 用 HTTPS。

敗：產除錯啟→立禁。通 CORS 代以顯許域。`http://` 改 `https://` 若端支。

### 七：文錄發現

建察報：

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
| Dependencies | WARN | 2 moderate vulnerabilities |

## Detailed Findings

### Finding 1: [Title]
- **Severity**: Low / Medium / High / Critical
- **Location**: `path/to/file:line`
- **Description**: What was found
- **Recommendation**: How to fix
```

得：完 `SECURITY_AUDIT_REPORT.md` 存於項根、發現按重分各含具位、述、建。

敗：發現太多→按類組重關/高。無論果生報立基。

## 驗

- [ ] 源無硬碼密
- [ ] .gitignore 覆諸敏
- [ ] 無高/關依弱
- [ ] 無注弱
- [ ] 認正行（如適）
- [ ] 察報完發現處

## 忌

- **僅察當檔**：git 史內密仍露。`git log -p --all -S 'secret_pattern'` 察
- **忽開發依**：開發依仍生供應鏈險
- **`.gitignore` 假安**：`.gitignore` 僅阻未追。已提之檔需 `git rm --cached`
- **忽配檔**：`docker-compose.yml`、CI 配、釋本常含密
- **不轉破憑**：得除密不足。憑必撤再生

## 參

- `configure-git-repository`
- `write-claude-md`
- `setup-gxp-r-project`
