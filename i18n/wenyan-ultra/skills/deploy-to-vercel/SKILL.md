---
name: deploy-to-vercel
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Deploy a Next.js application to Vercel. Covers project linking,
  environment variables, preview deployments, custom domains,
  and production deployment configuration. Use when deploying a Next.js
  app for the first time, setting up preview deployments for pull requests,
  configuring custom domains, or managing environment variables in
  a production Vercel deployment.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-dev
  complexity: basic
  language: TypeScript
  tags: vercel, deployment, nextjs, hosting, ci-cd
---

# 部署至 Vercel

部 Next.js 應於 Vercel 含生產配。

## 用

- 首次部 Next.js 應
- 立拉請求預覽部署
- 配自定域
- 理生產環境變量

## 入

- **必**：本地構建成功之 Next.js 應
- **必**：GitHub 倉庫（宜）或本地項目
- **可**：自定域
- **可**：生產環境變量

## 法

### 一：驗本地構建

```bash
npm run build
```

**得：** 構建無錯成。

**敗：** 修構建錯後部。常見：TypeScript 錯、缺依賴、無效引入。

### 二：裝 Vercel CLI

```bash
npm install -g vercel
```

**得：** `vercel` 命令全局可用，`vercel --version` 印版本。

**敗：** 權限錯→`sudo npm install -g vercel` 或配 npm 用戶本地前綴。`node --version` 驗 Node.js 已裝。

### 三：鏈接並部署

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

**得：** 預覽 URL 給（如 `https://my-app-xxx.vercel.app`）。

**敗：** `vercel login` 失→查網，試瀏覽器認證。部失→察構建輸出錯——Vercel 用潔環境，諸依賴須於 `package.json`。

### 四：配環境變量

```bash
# Add environment variables
vercel env add DATABASE_URL production
vercel env add API_KEY production preview

# List environment variables
vercel env ls
```

或經 Vercel 儀板：Project Settings > Environment Variables。

**得：** `vercel env ls` 示諸需變量配於正環境（production、preview、development）。

**敗：** 運行時無變量→驗目標環境匹（production vs preview）。加變量後重部——現部不自動取新變量。

### 五：部至生產

```bash
vercel --prod
```

**得：** 生產 URL 可用（如 `https://my-app.vercel.app`）。

**敗：** `vercel logs` 或 Vercel 儀板察部署日誌。常見：生產環境缺變量、構建命與本地異。

### 六：連 GitHub 自動部署（宜）

1. 至 https://vercel.com/new
2. 引入 GitHub 倉
3. Vercel 自動部於：
   - 推 main → 生產部署
   - 拉請求 → 預覽部署

**得：** Vercel 儀板示 GitHub 倉已連，後推 main 自動觸發生產部署。

**敗：** 倉未現於引入列→查 Vercel GitHub 應有倉訪問權。至 GitHub Settings > Applications > Vercel 授權。

### 七：配自定域

```bash
vercel domains add my-domain.com
```

或經儀板：Project Settings > Domains。

按 Vercel 指示更 DNS 記錄（通常 CNAME 或 A）。

**得：** `vercel domains ls` 示自定域已配，DNS 傳播畢（至 48 時），域解至 Vercel 部署。

**敗：** 示「Invalid Configuration」→驗 DNS 記錄精匹 Vercel 指示。`dig my-domain.com` 或在線 DNS 檢確傳播。

### 八：優化配置

建 `vercel.json` 進階設：

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

**得：** `vercel.json` 存項根，下部取配（於 Vercel 儀板構建日誌可見）。

**敗：** 配忽→`jq . vercel.json` 驗有效 JSON。查 Vercel 文檔匹框架版本，某設可遷 `next.config.ts`。

## 驗

- [ ] `npm run build` 本地成
- [ ] 預覽部署可達
- [ ] 生產部署正確服務應
- [ ] 生產環境變量可用
- [ ] 自定域解（若配）
- [ ] GitHub 集成推時觸部署

## 忌

- **本地成 Vercel 失**：Vercel 用潔環境。諸依賴須於 `package.json` 非僅全局裝。
- **缺環境變量**：變量須加於 Vercel，非僅 `.env.local`。不同環境（production、preview、development）分別變量集。
- **Node.js 版本異**：於 Project Settings 或 `package.json` engines 字段設 Node.js 版本。
- **部署過大**：Vercel 有大小限。以 `.vercelignore` 排除不需檔。
- **API 路超時**：Vercel 無服函於 Hobby 計畫 10s 超時。優化或升級。

## 參

- `scaffold-nextjs-app`
- `setup-tailwind-typescript`
- `configure-git-repository`
