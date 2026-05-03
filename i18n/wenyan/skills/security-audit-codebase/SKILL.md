---
name: security-audit-codebase
locale: wenyan
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

# 安全審碼庫

行系統之安審於碼庫，以識其患與洩之密。

## 用時

- 發布或展項目之前乃用
- 既有項目之周期安審乃用
- 加認證、API 集、或用入處理之後乃用
- 私庫開源之前乃用
- 備合規之安審乃用

## 入

- **必要**：所審之碼庫
- **可選**：特察之處（密、依、注入、認證）
- **可選**：合規之框（OWASP、ISO 27001、SOC 2）
- **可選**：前審之得以比

## 法

### 第一步：掃洩之密

搜硬編密之模：

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

得：未得實密——唯占位如 `YOUR_TOKEN_HERE` 或 `your.email@example.com`。

敗則：得實密，立刪之，輪換洩之憑據，以 `git filter-branch` 或 `git-filter-repo` 清史。視所洩之密為已破。

### 第二步：察 .gitignore 之覆

驗敏文件已排：

```bash
# Check that these are git-ignored
git check-ignore .env .Renviron credentials.json node_modules/

# Look for tracked sensitive files
git ls-files | grep -i "\.env\|\.renviron\|credentials\|secret"
```

得：諸敏文件（`.env`、`.Renviron`、`credentials.json`）皆列於 `.gitignore`，`git ls-files` 返無敏之追蹤文件。

敗則：敏文件已追，行 `git rm --cached <file>` 以解，加入 `.gitignore`，提交。文件留於盤而不再受版控。

### 第三步：審依

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

得：依無高或要患。中與低之患書以審。

敗則：得要患，立以 `npm audit fix` 或 `pip install --upgrade` 更受影之包。更若引破，書其患而立修之計。

### 第四步：察注入之患

**SQL 注入**：

```bash
# Look for string concatenation in queries
grep -rn "paste.*SELECT\|paste.*INSERT\|paste.*UPDATE\|paste.*DELETE" --include="*.R" .
grep -rn "query.*\+.*\|query.*\$\{" --include="*.{js,ts}" .
```

諸庫之查皆宜用參查，非串拼。

**命注入**：

```bash
# Look for shell execution with user input
grep -rn "system\(.*paste\|exec(\|spawn(" --include="*.{R,js,ts,py}" .
```

**XSS（跨站本）**：

```bash
# Look for unescaped user content in HTML
grep -rn "innerHTML\|dangerouslySetInnerHTML\|v-html" --include="*.{js,ts,jsx,tsx,vue}" .
```

得：無 SQL、命、XSS 注入之路。諸庫查用參、殼命避用控之入、HTML 出皆轉義。

敗則：得注入，以參查代查中之串拼，殼行前淨或轉用之入，以框安之渲法代 `innerHTML` 或 `dangerouslySetInnerHTML`。

### 第五步：審認證與授權

清單：

- [ ] 密以 bcrypt/argon2 散（非 MD5/SHA1）
- [ ] 會話令隨機而足長
- [ ] 認證令有期
- [ ] API 端察授權
- [ ] CORS 嚴配
- [ ] 變態之操啟 CSRF 之護

得：諸項皆過：密用強散、令隨機有期、端強授權、CORS 嚴、CSRF 護活。

敗則：依重排修：弱散與缺授權為要，CORS 與 CSRF 為高。書諸得附其重等。

### 第六步：察配之安

```bash
# Debug mode in production configs
grep -rn "debug\s*[=:]\s*[Tt]rue\|DEBUG\s*=\s*1" --include="*.{json,yml,yaml,toml,cfg}" .

# Permissive CORS
grep -rn "Access-Control-Allow-Origin.*\*\|cors.*origin.*\*" --include="*.{js,ts}" .

# HTTP instead of HTTPS
grep -rn "http://" --include="*.{js,ts,py,R}" . | grep -v "localhost\|127.0.0.1\|http://"
```

得：生產配中 debug 模已禁，CORS 不用通配，諸外網址用 HTTPS。

敗則：生產配 debug 模啟，立禁之。以明域代通配 CORS。將 `http://` 之網址更為 `https://`，若端支之。

### 第七步：書其得

立審報：

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

得：完備之 `SECURITY_AUDIT_REPORT.md` 存於項目根，諸得依重分，各附特位、述、議。

敗則：得繁難一一書，依類聚而先要/高之得。無論結，皆生報以立基線。

## 驗

- [ ] 源無硬編之密
- [ ] .gitignore 覆諸敏文件
- [ ] 依無高/要之患
- [ ] 無注入之患
- [ ] 認證已正施（若適）
- [ ] 審報完備，諸得已處

## 陷

- **唯察當前之文件**：git 史中之密仍洩。以 `git log -p --all -S 'secret_pattern'` 察
- **忽開發之依**：開發之依仍可引供應鏈之險
- **`.gitignore` 之假安**：`.gitignore` 唯阻後追。已提交之文件需 `git rm --cached`
- **忽配文件**：`docker-compose.yml`、CI 配、展本常含密
- **不輪換已破之憑據**：得而刪密不足。憑據必廢而再生

## 參

- `configure-git-repository` — 正之 .gitignore 設
- `write-claude-md` — 書安之求
- `setup-gxp-r-project` — 受規之境之安
