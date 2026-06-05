---
name: security-audit-codebase
description: >
  对代码库执行安全审计，检查暴露的密钥、存在漏洞的依赖、注入漏洞、
  不安全配置以及 OWASP Top 10 问题。适用于发布或部署项目之前、定期安全
  审查、添加身份验证或 API 集成之后、将私有仓库开源之前，或准备安全合规
  审计时。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: security, audit, owasp, secrets, vulnerability
  locale: zh-CN
  source_locale: en
  source_commit: 6a868d56
  translator: Claude Opus 4.6
  translation_date: "2026-03-13"
---

# 代码库安全审计

对代码库进行系统性安全审查，识别漏洞和暴露的密钥。

## 适用场景

- 发布或部署项目之前
- 对现有项目进行定期安全审查
- 添加身份验证、API 集成或用户输入处理之后
- 将私有仓库开源之前
- 准备安全合规审计

## 输入

- **必需**：要审计的代码库
- **可选**：特定关注领域（密钥、依赖、注入、认证）
- **可选**：合规框架（OWASP、ISO 27001、SOC 2）
- **可选**：先前审计结果用于对比

## 步骤

### 第 1 步：扫描暴露的密钥

搜索指示硬编码密钥的模式：

```bash
# API 密钥和令牌
grep -rn "sk-\|ghp_\|gho_\|github_pat_\|hf_\|AKIA" --include="*.{md,js,ts,py,R,json,yml,yaml}" .

# 通用密钥模式
grep -rn "password\s*=\s*['\"]" --include="*.{js,ts,py,R,json}" .
grep -rn "api[_-]key\s*[=:]\s*['\"]" --include="*.{js,ts,py,R,json}" .
grep -rn "secret\s*[=:]\s*['\"]" --include="*.{js,ts,py,R,json}" .

# 连接字符串
grep -rn "postgresql://\|mysql://\|mongodb://" .

# 私钥
grep -rn "BEGIN.*PRIVATE KEY" .
```

**预期结果：** 未找到真实密钥 —— 仅有占位符如 `YOUR_TOKEN_HERE` 或 `your.email@example.com`。

**失败处理：** 如果发现真实密钥，立即删除、轮换已暴露的凭证，并使用 `git filter-branch` 或 `git-filter-repo` 清理 git 历史。任何已暴露的密钥都应视为已泄露。

### 第 2 步：检查 .gitignore 覆盖范围

验证敏感文件已被排除：

```bash
# 检查这些文件是否被 git 忽略
git check-ignore .env .Renviron credentials.json node_modules/

# 查找已被跟踪的敏感文件
git ls-files | grep -i "\.env\|\.renviron\|credentials\|secret"
```

**预期结果：** 所有敏感文件（`.env`、`.Renviron`、`credentials.json`）都在 `.gitignore` 中列出，`git ls-files` 未返回已跟踪的敏感文件。

**失败处理：** 如果敏感文件已被跟踪，运行 `git rm --cached <file>` 取消跟踪，添加到 `.gitignore`，并提交。文件仍保留在磁盘上但不再受版本控制。

### 第 3 步：审计依赖

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
# 检查包的已知漏洞
# 无内置工具，但可验证包来源
renv::status()
```

**预期结果：** 依赖中无高危或严重漏洞。中等和低风险漏洞已记录待审查。

**失败处理：** 如果发现严重漏洞，立即使用 `npm audit fix` 或 `pip install --upgrade` 更新受影响的包。如果更新引入破坏性变更，记录漏洞并制定修复计划。

### 第 4 步：检查注入漏洞

**SQL 注入**：

```bash
# 查找查询中的字符串拼接
grep -rn "paste.*SELECT\|paste.*INSERT\|paste.*UPDATE\|paste.*DELETE" --include="*.R" .
grep -rn "query.*\+.*\|query.*\$\{" --include="*.{js,ts}" .
```

所有数据库查询应使用参数化查询，而非字符串拼接。

**命令注入**：

```bash
# 查找使用用户输入的 shell 执行
grep -rn "system\(.*paste\|exec(\|spawn(" --include="*.{R,js,ts,py}" .
```

**XSS（跨站脚本）**：

```bash
# 查找 HTML 中未转义的用户内容
grep -rn "innerHTML\|dangerouslySetInnerHTML\|v-html" --include="*.{js,ts,jsx,tsx,vue}" .
```

**预期结果：** 未发现 SQL、命令或 XSS 注入向量。所有数据库查询使用参数化语句，shell 命令避免用户可控输入，HTML 输出已正确转义。

**失败处理：** 如果发现注入漏洞，将查询中的字符串拼接替换为参数化查询，在 shell 执行前对用户输入进行清理或转义，使用框架安全的渲染方法替代 `innerHTML` 或 `dangerouslySetInnerHTML`。

### 第 5 步：审查身份验证与授权

检查清单：
- [ ] 密码使用 bcrypt/argon2 哈希（非 MD5/SHA1）
- [ ] 会话令牌随机且长度充足
- [ ] 认证令牌有过期时间
- [ ] API 端点检查授权
- [ ] CORS 配置为限制性
- [ ] 状态变更操作启用 CSRF 保护

**预期结果：** 所有检查项通过：密码使用强哈希，令牌随机且有过期时间，端点强制授权，CORS 为限制性，CSRF 保护已激活。

**失败处理：** 按严重程度排列修复优先级：弱密码哈希和缺少授权为严重级别，CORS 和 CSRF 问题为高级别。记录所有发现及其严重程度。

### 第 6 步：检查配置安全

```bash
# 生产配置中的调试模式
grep -rn "debug\s*[=:]\s*[Tt]rue\|DEBUG\s*=\s*1" --include="*.{json,yml,yaml,toml,cfg}" .

# 过于宽松的 CORS
grep -rn "Access-Control-Allow-Origin.*\*\|cors.*origin.*\*" --include="*.{js,ts}" .

# HTTP 而非 HTTPS
grep -rn "http://" --include="*.{js,ts,py,R}" . | grep -v "localhost\|127.0.0.1\|http://"
```

**预期结果：** 生产配置中调试模式已禁用，CORS 在生产中未使用通配符源，所有外部 URL 使用 HTTPS。

**失败处理：** 如果生产配置中启用了调试模式，立即禁用。将通配符 CORS 源替换为明确的允许域名。在端点支持的情况下将 `http://` URL 更新为 `https://`。

### 第 7 步：记录审计结果

创建审计报告：

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

**预期结果：** 在项目根目录保存完整的 `SECURITY_AUDIT_REPORT.md`，按严重程度分类，每项发现都有具体位置、描述和建议。

**失败处理：** 如果发现过多无法逐一记录，按类别分组并优先处理严重/高危发现。无论结果如何都要生成报告以建立基线。

## 验证清单

- [ ] 源代码中无硬编码密钥
- [ ] .gitignore 覆盖所有敏感文件
- [ ] 无高危/严重依赖漏洞
- [ ] 无注入漏洞
- [ ] 身份验证已正确实现（如适用）
- [ ] 审计报告完整且已处理发现

## 常见问题

- **仅检查当前文件**：git 历史中的密钥仍然是暴露的。使用 `git log -p --all -S 'secret_pattern'` 检查。
- **忽略开发依赖**：开发依赖仍可能引入供应链风险。
- **对 `.gitignore` 产生虚假安全感**：`.gitignore` 仅防止未来的跟踪。已提交的文件需要使用 `git rm --cached` 处理。
- **忽视配置文件**：`docker-compose.yml`、CI 配置和部署脚本中常包含密钥。
- **未轮换已泄露的凭证**：找到并删除密钥还不够。凭证必须被撤销并重新生成。

## 相关技能

- `configure-git-repository` - 正确的 .gitignore 设置
- `write-claude-md` - 记录安全要求
- `setup-gxp-r-project` - 受监管环境中的安全性
