---
name: deploy-to-vercel
description: >
  将 Next.js 应用程序部署到 Vercel。涵盖项目关联、环境变量、预览部署、
  自定义域名及生产部署配置。适用于首次部署 Next.js 应用、为 Pull Request
  设置预览部署、配置自定义域名，或管理 Vercel 生产环境变量。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-dev
  complexity: basic
  language: TypeScript
  tags: vercel, deployment, nextjs, hosting, ci-cd
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
---

# 部署到 Vercel

将 Next.js 应用程序以生产配置部署到 Vercel。

## 适用场景

- 首次部署 Next.js 应用
- 为 Pull Request 设置预览部署
- 配置自定义域名
- 管理生产环境变量

## 输入

- **必需**：本地构建成功的 Next.js 应用
- **必需**：GitHub 仓库（推荐）或本地项目
- **可选**：自定义域名
- **可选**：生产环境变量

## 步骤

### 第 1 步：验证本地构建

```bash
npm run build
```

**预期结果：** 构建成功，无任何错误。

**失败处理：** 部署前修复构建错误。常见问题：TypeScript 错误、缺少依赖项、无效导入。

### 第 2 步：安装 Vercel CLI

```bash
npm install -g vercel
```

**预期结果：** `vercel` 命令全局可用，`vercel --version` 打印已安装版本。

**失败处理：** 如果出现权限错误，使用 `sudo npm install -g vercel` 或配置 npm 使用用户本地前缀。使用 `node --version` 验证 Node.js 已安装。

### 第 3 步：关联并部署

```bash
# Login to Vercel
vercel login

# Deploy (first time: creates project)
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N (for new projects)
# - Project name: my-app
# - Directory: ./
# - Override settings? N
```

**预期结果：** 提供预览 URL（如 `https://my-app-xxx.vercel.app`）。

**失败处理：** 如果 `vercel login` 失败，检查网络连接并尝试基于浏览器的认证。如果部署失败，查看构建输出中的错误——Vercel 使用干净环境，所有依赖项必须在 `package.json` 中声明。

### 第 4 步：配置环境变量

```bash
# Add environment variables
vercel env add DATABASE_URL production
vercel env add API_KEY production preview

# List environment variables
vercel env ls
```

或通过 Vercel 控制台配置：项目设置 > 环境变量。

**预期结果：** `vercel env ls` 显示所有必需的环境变量，已针对正确的环境（生产、预览、开发）配置。

**失败处理：** 如果变量在运行时未出现，验证目标环境是否匹配（生产 vs 预览）。添加变量后重新部署——现有部署不会自动获取新变量。

### 第 5 步：部署到生产环境

```bash
vercel --prod
```

**预期结果：** 生产 URL 可用（如 `https://my-app.vercel.app`）。

**失败处理：** 使用 `vercel logs` 或在 Vercel 控制台中检查部署日志。常见问题包括生产环境缺少环境变量，以及构建命令与本地设置不同。

### 第 6 步：连接 GitHub 实现自动部署（推荐）

1. 访问 https://vercel.com/new
2. 导入您的 GitHub 仓库
3. Vercel 将自动在以下时机部署：
   - 推送到 main → 生产部署
   - Pull Request → 预览部署

**预期结果：** Vercel 控制台显示已连接 GitHub 仓库，后续推送到 main 自动触发生产部署。

**失败处理：** 如果仓库未出现在导入列表中，检查 Vercel GitHub 应用是否有权访问该仓库。访问 GitHub 设置 > 应用程序 > Vercel 并授予访问权限。

### 第 7 步：配置自定义域名

```bash
vercel domains add my-domain.com
```

或通过控制台：项目设置 > 域名。

按照 Vercel 的指示更新 DNS 记录（通常是 CNAME 或 A 记录）。

**预期结果：** `vercel domains ls` 显示自定义域名已配置，DNS 传播后（最长 48 小时），域名解析到 Vercel 部署。

**失败处理：** 如果域名显示"配置无效"，验证 DNS 记录与 Vercel 的指示完全匹配。使用 `dig my-domain.com` 或在线 DNS 检查工具确认传播。

### 第 8 步：优化配置

在项目根目录创建 `vercel.json` 进行高级设置：

```json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

**预期结果：** `vercel.json` 保存在项目根目录，下次部署时采用该配置（在 Vercel 控制台构建日志中可见）。

**失败处理：** 如果配置被忽略，使用 `jq . vercel.json` 验证 JSON 是否合法。检查 Vercel 文档中您的框架版本，某些设置可能已移至 `next.config.ts`。

## 验证清单

- [ ] `npm run build` 在本地成功
- [ ] 预览部署可正常访问
- [ ] 生产部署正确提供应用服务
- [ ] 环境变量在生产中可用
- [ ] 自定义域名解析正常（如已配置）
- [ ] GitHub 集成在推送时触发部署

## 常见问题

- **Vercel 构建失败但本地成功**：Vercel 使用干净环境。确保所有依赖项在 `package.json` 中，而非全局安装。
- **环境变量缺失**：变量必须添加到 Vercel，而非仅在 `.env.local` 中。不同环境（生产、预览、开发）有独立的变量集。
- **Node.js 版本不匹配**：在项目设置或 `package.json` 的 `engines` 字段中设置 Node.js 版本。
- **部署体积过大**：Vercel 有大小限制。使用 `.vercelignore` 排除不必要的文件。
- **API 路由超时**：Vercel 免费套餐的无服务器函数超时为 10 秒。优化代码或升级套餐。

## 相关技能

- `scaffold-nextjs-app` — 创建待部署的应用
- `setup-tailwind-typescript` — 部署前配置样式
- `configure-git-repository` — 自动部署集成的 Git 设置
