---
name: deploy-to-vercel
locale: wenyan-lite
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

# Deploy to Vercel

部署 Next.js 應用於 Vercel，具生產配置。

## 適用時機

- 首次部署 Next.js 應用
- 為 pull request 設預覽部署
- 配自定網域
- 於生產管環境變數

## 輸入

- **必需**：可於本地成功建置之 Next.js 應用
- **必需**：GitHub 儲存庫（建議）或本地專案
- **可選**：自定網域
- **可選**：生產用之環境變數

## 步驟

### 步驟一：驗本地建置

```bash
npm run build
```

**預期：** 建置成功，無誤。

**失敗時：** 部署前修建置錯誤。常見：TypeScript 錯誤、缺失依賴、無效 import。

### 步驟二：裝 Vercel CLI

```bash
npm install -g vercel
```

**預期：** `vercel` 指令於全域可用，`vercel --version` 印已裝之版本。

**失敗時：** 若權限錯誤，用 `sudo npm install -g vercel` 或配 npm 用用戶本地前綴。以 `node --version` 驗 Node.js 已裝。

### 步驟三：連結並部署

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

**預期：** 生預覽 URL（如 `https://my-app-xxx.vercel.app`）。

**失敗時：** 若 `vercel login` 失敗，查網路連接並試基於瀏覽器之認證。若部署失敗，檢視建置輸出之錯誤——Vercel 用乾淨環境，故所有依賴須於 `package.json`。

### 步驟四：配環境變數

```bash
# Add environment variables
vercel env add DATABASE_URL production
vercel env add API_KEY production preview

# List environment variables
vercel env ls
```

或透過 Vercel 儀表板配：Project Settings > Environment Variables。

**預期：** `vercel env ls` 示所有必需之環境變數已為正確環境（production、preview、development）配置。

**失敗時：** 若變數於運行時未現，驗目標環境合（production 與 preview）。加變數後重部署——既有部署不自動採新變數。

### 步驟五：部署至生產

```bash
vercel --prod
```

**預期：** 生產 URL 可用（如 `https://my-app.vercel.app`）。

**失敗時：** 以 `vercel logs` 或於 Vercel 儀表板查部署日誌。常見問題含生產環境中缺環境變數與建置指令異於本地設定。

### 步驟六：連結 GitHub 以自動部署（建議）

1. 往 https://vercel.com/new
2. 匯入 GitHub 儲存庫
3. Vercel 自動於此時部署：
   - 推至 main -> 生產部署
   - Pull request -> 預覽部署

**預期：** Vercel 儀表板示 GitHub 儲存庫已連，後續推至 main 自動觸發生產部署。

**失敗時：** 若儲存庫不現於匯入列表，查 Vercel GitHub 應用有儲存庫之存取權。往 GitHub Settings > Applications > Vercel 授權。

### 步驟七：配自定網域

```bash
vercel domains add my-domain.com
```

或透過儀表板：Project Settings > Domains。

依 Vercel 指示更 DNS 紀錄（通常為 CNAME 或 A 紀錄）。

**預期：** `vercel domains ls` 示自定網域已配，DNS 傳播後（可達 48 小時），網域解析至 Vercel 部署。

**失敗時：** 若網域示「Invalid Configuration」，驗 DNS 紀錄精確合 Vercel 之指示。以 `dig my-domain.com` 或線上 DNS 檢查器確認傳播。

### 步驟八：優化配置

建 `vercel.json` 以供高級設定：

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

**預期：** `vercel.json` 存於專案根目錄，次部署採該配置（於 Vercel 儀表板建置日誌可見）。

**失敗時：** 若配置被忽略，以 `jq . vercel.json` 驗 `vercel.json` 為有效 JSON。查 Vercel 文檔合框架版本，某些設定可能已遷至 `next.config.ts`。

## 驗證

- [ ] `npm run build` 於本地成功
- [ ] 預覽部署運作且可達
- [ ] 生產部署正確服務應用
- [ ] 環境變數於生產可用
- [ ] 自定網域解析（若已配）
- [ ] GitHub 整合於推時觸發部署

## 常見陷阱

- **於 Vercel 建置失敗而本地成功**：Vercel 用乾淨環境。確所有依賴於 `package.json`，非僅於全域安裝。
- **缺環境變數**：變數須加於 Vercel，非僅於 `.env.local`。不同環境（production、preview、development）有分離之變數集。
- **Node.js 版本不符**：於 Project Settings 或 `package.json` engines 欄設 Node.js 版本。
- **大部署**：Vercel 有大小限。用 `.vercelignore` 排除不必要之檔案。
- **API 路由超時**：Vercel serverless 函數於 Hobby 方案有 10 秒超時。優化或升級。

## 相關技能

- `scaffold-nextjs-app` - 建待部署之應用
- `setup-tailwind-typescript` - 部署前配樣式
- `configure-git-repository` - 自動部署整合之 Git 設定
