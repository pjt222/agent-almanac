---
name: security-audit-codebase
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Security audit codebase → exposed secrets, vulnerable deps, injection vulns, insecure configs, OWASP Top 10. Use → pre-publish|deploy, periodic security review, post-auth|API integ added, pre-OSS private repo, prep security compliance audit.
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

Systematic security review → ID vulns + exposed secrets.

## Use When

- Pre-publish|deploy
- Periodic review
- Post-auth|API integ|input handling
- Pre-OSS private repo
- Prep compliance audit

## In

- **Required**: Codebase
- **Optional**: Focus area (secrets|deps|injection|auth)
- **Optional**: Compliance frame (OWASP|ISO 27001|SOC 2)
- **Optional**: Prev findings for compare

## Do

### Step 1: Scan Exposed Secrets

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

→ No real secrets — only placeholders (`YOUR_TOKEN_HERE`, `your.email@example.com`).

If err: real secret found → remove + rotate cred + clean git history (`git filter-branch`|`git-filter-repo`). Treat exposed = compromised.

### Step 2: .gitignore Coverage

```bash
# Check that these are git-ignored
git check-ignore .env .Renviron credentials.json node_modules/

# Look for tracked sensitive files
git ls-files | grep -i "\.env\|\.renviron\|credentials\|secret"
```

→ Sensitive (`.env`, `.Renviron`, `credentials.json`) in `.gitignore`, `git ls-files` returns no tracked sensitive.

If err: tracked → `git rm --cached <file>`, add `.gitignore`, commit. File stays disk but no longer versioned.

### Step 3: Audit Deps

**Node.js**:

```bash
npm audit
npx audit-ci --moderate
```

**Python**:

```bash
pip-audit
safety check
```

**R**:

```r
# Check for known vulnerabilities in packages
# No built-in tool, but verify package sources
renv::status()
```

→ No high|critical vulns. Mod+low documented.

If err: critical → update via `npm audit fix`|`pip install --upgrade`. Breaking changes → document + remediation plan.

### Step 4: Injection Vulns

**SQL Injection**:

```bash
# Look for string concatenation in queries
grep -rn "paste.*SELECT\|paste.*INSERT\|paste.*UPDATE\|paste.*DELETE" --include="*.R" .
grep -rn "query.*\+.*\|query.*\$\{" --include="*.{js,ts}" .
```

All queries → parameterized, not string concat.

**Command Injection**:

```bash
# Look for shell execution with user input
grep -rn "system\(.*paste\|exec(\|spawn(" --include="*.{R,js,ts,py}" .
```

**XSS**:

```bash
# Look for unescaped user content in HTML
grep -rn "innerHTML\|dangerouslySetInnerHTML\|v-html" --include="*.{js,ts,jsx,tsx,vue}" .
```

→ No SQL|command|XSS vectors. Queries parameterized, shell avoids user input, HTML escaped.

If err: vulns found → replace string concat → parameterized, sanitize|escape user input pre-shell, framework-safe rendering not `innerHTML`|`dangerouslySetInnerHTML`.

### Step 5: Auth + AuthZ Review

Checklist:
- [ ] Pwds hashed bcrypt|argon2 (not MD5|SHA1)
- [ ] Session tokens random + long
- [ ] Auth tokens have expiration
- [ ] API endpoints check authz
- [ ] CORS restrictive
- [ ] CSRF protection for state-changing ops

→ All pass: pwds strong hash, tokens random+expire, endpoints enforce authz, CORS restrictive, CSRF active.

If err: prioritize by severity — weak hash + missing authz = critical; CORS+CSRF = high. Document w/ severity.

### Step 6: Config Security

```bash
# Debug mode in production configs
grep -rn "debug\s*[=:]\s*[Tt]rue\|DEBUG\s*=\s*1" --include="*.{json,yml,yaml,toml,cfg}" .

# Permissive CORS
grep -rn "Access-Control-Allow-Origin.*\*\|cors.*origin.*\*" --include="*.{js,ts}" .

# HTTP instead of HTTPS
grep -rn "http://" --include="*.{js,ts,py,R}" . | grep -v "localhost\|127.0.0.1\|http://"
```

→ Debug off prod, no wildcard CORS prod, all external HTTPS.

If err: debug prod → disable. Wildcard CORS → explicit allowed domains. `http://` → `https://` where supported.

### Step 7: Document Findings

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

→ `SECURITY_AUDIT_REPORT.md` in project root w/ findings categorized by severity, location, desc, recommendation.

If err: too many findings → group by category + prioritize critical|high. Generate regardless to baseline.

## Check

- [ ] No hardcoded secrets
- [ ] .gitignore covers sensitive
- [ ] No high|critical dep vulns
- [ ] No injection vulns
- [ ] Auth properly impl (if applicable)
- [ ] Audit report complete + findings addressed

## Traps

- **Only check current files**: Secrets in git history still exposed. `git log -p --all -S 'secret_pattern'`.
- **Ignore dev deps**: Dev deps still introduce supply chain risk.
- **False sense from `.gitignore`**: Only prevents future tracking. Already-committed → `git rm --cached`.
- **Overlook configs**: `docker-compose.yml`, CI configs, deploy scripts often have secrets.
- **No rotate compromised**: Finding+removing not enough. Cred must be revoked + regenerated.

## →

- `configure-git-repository` — proper .gitignore setup
- `write-claude-md` — document security reqs
- `setup-gxp-r-project` — security in regulated envs
