---
name: security-audit-codebase
locale: caveman
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

# Security Audit Codebase

Run systematic security review of codebase. Find vulnerabilities + exposed secrets.

## When Use

- Before publishing or deploying project
- Periodic security review of existing projects
- After adding auth, API integration, user input handling
- Before open-sourcing private repo
- Prepping for security compliance audit

## Inputs

- **Required**: Codebase to audit
- **Optional**: Specific focus area (secrets, deps, injection, auth)
- **Optional**: Compliance framework (OWASP, ISO 27001, SOC 2)
- **Optional**: Previous audit findings for comparison

## Steps

### Step 1: Scan for Exposed Secrets

Search for patterns that indicate hardcoded secrets.

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

**Got:** No real secrets found — only placeholders like `YOUR_TOKEN_HERE` or `your.email@example.com`.

**If fail:** Real secrets found? Remove immediately, rotate exposed credential, clean git history with `git filter-branch` or `git-filter-repo`. Treat any exposed secret as compromised.

### Step 2: Check .gitignore Coverage

Verify sensitive files excluded.

```bash
# Check that these are git-ignored
git check-ignore .env .Renviron credentials.json node_modules/

# Look for tracked sensitive files
git ls-files | grep -i "\.env\|\.renviron\|credentials\|secret"
```

**Got:** All sensitive files (`.env`, `.Renviron`, `credentials.json`) listed in `.gitignore`, `git ls-files` returns no tracked sensitive files.

**If fail:** Sensitive files tracked? Run `git rm --cached <file>` to untrack, add to `.gitignore`, commit. File stays on disk but no longer version-controlled.

### Step 3: Audit Dependencies

**Node.js**.

```bash
npm audit
npx audit-ci --moderate
```

**Python**.

```bash
pip-audit
safety check
```

**R**.

```r
# Check for known vulnerabilities in packages
# No built-in tool, but verify package sources
renv::status()
```

**Got:** No high or critical vulnerabilities in deps. Moderate + low documented for review.

**If fail:** Critical vulnerabilities found? Update affected packages immediately with `npm audit fix` or `pip install --upgrade`. Updates introduce breaking changes? Document vulnerability, create remediation plan.

### Step 4: Check for Injection Vulnerabilities

**SQL Injection**.

```bash
# Look for string concatenation in queries
grep -rn "paste.*SELECT\|paste.*INSERT\|paste.*UPDATE\|paste.*DELETE" --include="*.R" .
grep -rn "query.*\+.*\|query.*\$\{" --include="*.{js,ts}" .
```

All database queries should use parameterized queries, not string concatenation.

**Command Injection**.

```bash
# Look for shell execution with user input
grep -rn "system\(.*paste\|exec(\|spawn(" --include="*.{R,js,ts,py}" .
```

**XSS (Cross-Site Scripting)**.

```bash
# Look for unescaped user content in HTML
grep -rn "innerHTML\|dangerouslySetInnerHTML\|v-html" --include="*.{js,ts,jsx,tsx,vue}" .
```

**Got:** No SQL, command, or XSS injection vectors found. All queries use parameterized statements, shell commands avoid user-controlled input, HTML output properly escaped.

**If fail:** Injection vulnerabilities found? Replace string concat in queries with parameterized queries, sanitize or escape user input before shell exec, use framework-safe rendering instead of `innerHTML` or `dangerouslySetInnerHTML`.

### Step 5: Review Authentication and Authorization

Checklist.
- [ ] Passwords hashed with bcrypt/argon2 (not MD5/SHA1)
- [ ] Session tokens random + sufficiently long
- [ ] Auth tokens have expiration
- [ ] API endpoints check authorization
- [ ] CORS configured restrictively
- [ ] CSRF protection enabled for state-changing operations

**Got:** All checklist items pass: passwords use strong hashing, tokens random with expiration, endpoints enforce authorization, CORS restrictive, CSRF protection active.

**If fail:** Prioritize fixes by severity: weak password hashing + missing authorization = critical, CORS + CSRF = high. Document all findings with severity.

### Step 6: Check Configuration Security

```bash
# Debug mode in production configs
grep -rn "debug\s*[=:]\s*[Tt]rue\|DEBUG\s*=\s*1" --include="*.{json,yml,yaml,toml,cfg}" .

# Permissive CORS
grep -rn "Access-Control-Allow-Origin.*\*\|cors.*origin.*\*" --include="*.{js,ts}" .

# HTTP instead of HTTPS
grep -rn "http://" --include="*.{js,ts,py,R}" . | grep -v "localhost\|127.0.0.1\|http://"
```

**Got:** Debug mode disabled in prod configs, CORS does not use wildcard origins in prod, all external URLs use HTTPS.

**If fail:** Debug mode enabled in prod configs? Disable immediately. Replace wildcard CORS origins with explicit allowed domains. Update `http://` URLs to `https://` where endpoint supports.

### Step 7: Document Findings

Create audit report.

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

**Got:** Complete `SECURITY_AUDIT_REPORT.md` saved in project root with findings categorized by severity, each with specific location, description, recommendation.

**If fail:** Too many findings to document individually? Group by category, prioritize critical/high findings. Generate report regardless of outcome to establish baseline.

## Checks

- [ ] No hardcoded secrets in source
- [ ] .gitignore covers all sensitive files
- [ ] No high/critical dep vulnerabilities
- [ ] No injection vulnerabilities
- [ ] Auth properly implemented (if applicable)
- [ ] Audit report complete, findings addressed

## Pitfalls

- **Only check current files**: Secrets in git history still exposed. Check with `git log -p --all -S 'secret_pattern'`.
- **Ignore dev deps**: Dev deps can introduce supply chain risks.
- **False sense of security from `.gitignore`**: `.gitignore` only prevents future tracking. Already-committed files need `git rm --cached`.
- **Overlook config files**: `docker-compose.yml`, CI configs, deploy scripts often contain secrets.
- **Not rotating compromised credentials**: Finding + removing secret not enough. Credential must be revoked + regenerated.

## See Also

- `configure-git-repository` - proper .gitignore setup
- `write-claude-md` - documenting security requirements
- `setup-gxp-r-project` - security in regulated environments
