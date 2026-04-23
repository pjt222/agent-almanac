---
name: deploy-to-vercel
locale: wenyan
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

# 部至 Vercel

將 Next.js 應用部至 Vercel，具產配。

## 用時

- 首次部 Next.js 應用
- 為 pull request 立預覽部署
- 配自定域名
- 理產中環境變量

## 入

- **必要**：本地可成建之 Next.js 應用
- **必要**：GitHub 庫（宜）或本地項目
- **可選**：自定域名
- **可選**：產用環境變量

## 法

### 第一步：驗本地建

```bash
npm run build
```

**得：** 建成無錯。

**敗則：** 部前修建錯。常見：TypeScript 錯、缺依賴、無效導入。

### 第二步：裝 Vercel CLI

```bash
npm install -g vercel
```

**得：** `vercel` 命全局可用，`vercel --version` 印已裝之版。

**敗則：** 若權錯，用 `sudo npm install -g vercel` 或設 npm 用 user-local 前綴。以 `node --version` 驗 Node.js 已裝。

### 第三步：鏈接並部

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

**得：** 預覽 URL 現（如 `https://my-app-xxx.vercel.app`）。

**敗則：** 若 `vercel login` 敗，察網連且試瀏覽器認證。部敗察建輸出之錯——Vercel 用潔環境，諸依賴皆宜於 `package.json`。

### 第四步：配環境變量

```bash
# Add environment variables
vercel env add DATABASE_URL production
vercel env add API_KEY production preview

# List environment variables
vercel env ls
```

或經 Vercel 控制臺配：Project Settings > Environment Variables。

**得：** `vercel env ls` 示所需環境變量為合之環境（production、preview、development）而配。

**敗則：** 若變量於運行時不現，驗目標環境相合（production 對 preview）。加變量後重部——既有部署不自動採新變量。

### 第五步：部至產

```bash
vercel --prod
```

**得：** 產 URL 可用（如 `https://my-app.vercel.app`）。

**敗則：** 以 `vercel logs` 或於控制臺察部署日誌。常見問題含產環境缺變量、建命與本地異。

### 第六步：連 GitHub 以自動部（宜）

1. 至 https://vercel.com/new
2. 導入爾之 GitHub 庫
3. Vercel 自動部：
   - 推至 main -> 產部
   - Pull request -> 預覽部

**得：** Vercel 控制臺示 GitHub 庫已連，後推至 main 自動觸產部。

**敗則：** 若庫於導入單不現，察 Vercel GitHub app 可訪該庫。至 GitHub Settings > Applications > Vercel 授權。

### 第七步：配自定域名

```bash
vercel domains add my-domain.com
```

或經控制臺：Project Settings > Domains。

依 Vercel 指示更 DNS 記（典 CNAME 或 A）。

**得：** `vercel domains ls` 示自定域名已配，DNS 傳播後（可達 48 時），域名解至 Vercel 部。

**敗則：** 若域名示「Invalid Configuration」，驗 DNS 記合 Vercel 之指示。以 `dig my-domain.com` 或在線 DNS 察者驗傳播。

### 第八步：優配

建 `vercel.json` 供進階設：

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

**得：** `vercel.json` 存於項目根，下次部採之（於 Vercel 建日誌可見）。

**敗則：** 若配被忽，以 `jq . vercel.json` 驗 JSON 有效。察爾框架版之 Vercel 文檔，某些設或已移至 `next.config.ts`。

## 驗

- [ ] `npm run build` 本地成
- [ ] 預覽部可行且可達
- [ ] 產部正服應用
- [ ] 環境變量於產可得
- [ ] 自定域名解（若配）
- [ ] GitHub 集成推時觸部署

## 陷

- **Vercel 建敗而本地成**：Vercel 用潔環境。確諸依賴於 `package.json`，非唯全局裝。
- **環境變量缺**：變量宜加至 Vercel，非唯 `.env.local`。異環境（production、preview、development）各有獨之變量集。
- **Node.js 版不合**：於 Project Settings 或 `package.json` engines 字段設 Node.js 版。
- **部大**：Vercel 有大小限。以 `.vercelignore` 排不必之文件。
- **API 路由超時**：Vercel 無服函數於 Hobby 有 10s 超時。優或升。

## Related Skills

- `scaffold-nextjs-app` - 建可部之應用
- `setup-tailwind-typescript` - 部前配樣式
- `configure-git-repository` - 自動部集成之 Git 設
