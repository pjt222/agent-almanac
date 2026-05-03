---
name: scaffold-nextjs-app
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Scaffold a new Next.js application with App Router, TypeScript,
  and modern defaults. Covers project creation, directory structure,
  routing setup, and initial configuration. Use when starting a new web
  application project, creating a React-based frontend with server-side
  rendering, building a full-stack application with API routes, or setting
  up a TypeScript web project from scratch.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-dev
  complexity: basic
  language: TypeScript
  tags: nextjs, react, typescript, app-router, scaffold
---

# 構建 Next.js 應用腳手架

以 App Router、TypeScript 與生產就緒之預設建立 Next.js 應用。

## 適用時機

- 新建網頁應用項目
- 建立含伺服器端渲染之 React 前端
- 建構含 API 路由之全端應用
- 從頭設置 TypeScript 網頁項目

## 輸入

- **必要**：應用名
- **必要**：套件管理器偏好（npm、yarn、pnpm）
- **選擇性**：是否含 Tailwind CSS（預設：是）
- **選擇性**：是否含 ESLint（預設：是）
- **選擇性**：src/ 目錄結構（預設：是）

## 步驟

### 步驟一：建立項目

```bash
npx create-next-app@latest my-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

回應提示或用旗標非互動式設定所有選項。

**預期：** 項目目錄已建立，所有依賴已安裝。

**失敗時：** 檢查 Node.js 版本（`node --version`，須 >= 18.17）。確保 `npx` 可用。若命令於提示處懸停，加入 `--use-npm` 旗標（或 `--use-pnpm`／`--use-yarn`）以跳過套件管理器提示。

### 步驟二：驗證項目結構

```
my-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   ├── globals.css       # Global styles
│   │   └── favicon.ico
│   └── lib/                  # Shared utilities (create manually)
├── public/                   # Static assets
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── package.json
└── .eslintrc.json
```

**預期：** 所有列出之目錄與文件皆存在。

**失敗時：** 若 `src/` 目錄缺失，未傳 `--src-dir` 旗標。重新執行 `create-next-app` 附該旗標，或手動將文件移入 `src/app/`。

### 步驟三：配置 Next.js

依項目需求編輯 `next.config.ts`：

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Image optimization domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
      },
    ],
  },
};

export default nextConfig;
```

**預期：** `next.config.ts` 儲存無 TypeScript 錯誤。

**失敗時：** 若文件用 `.js` 副檔名而非 `.ts`，重新命名之。確保 `NextConfig` 類型自 `"next"` 引入。

### 步驟四：設置目錄慣例

建立常用目錄：

```bash
mkdir -p src/app/api
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/types
```

**預期：** 四目錄皆於 `src/` 下建立。

**失敗時：** 若 `src/` 不存在，先建立之或調整路徑以符合項目結構（非 src 佈局於根用 `app/`）。

### 步驟五：建立基底佈局

編輯 `src/app/layout.tsx`：

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Application",
  description: "Application description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

**預期：** 佈局以 Inter 字體渲染並包覆所有頁面。

**失敗時：** 若字體載入失敗，檢查網路存取。將 `Inter` 暫時換為系統字體後備。

### 步驟六：加入範例 API 路由

建立 `src/app/api/health/route.ts`：

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
```

**預期：** 文件已建於 `src/app/api/health/route.ts`。

**失敗時：** 確保 `api/health/` 目錄存在。文件須匯出具名 HTTP 方法處理器（`GET`、`POST` 等），非預設匯出。

### 步驟七：執行開發伺服器

```bash
cd my-app
npm run dev
```

**預期：** 應用於 http://localhost:3000 運行。

**失敗時：** 檢查 Node.js 版本（>= 18.17）。若依賴缺失，執行 `npm install`。

## 驗證

- [ ] `npm run dev` 無錯誤啟動
- [ ] 首頁於 localhost:3000 載入
- [ ] TypeScript 編譯成功
- [ ] Tailwind CSS 類別已套用
- [ ] API 路由於 /api/health 回應
- [ ] ESLint 無錯誤執行（`npm run lint`）

## 常見陷阱

- **Node.js 版本**：Next.js 需 Node.js >= 18.17。以 `node --version` 檢查。
- **連接埠衝突**：預設 3000 連接埠可能被佔。改用 `npm run dev -- -p 3001`。
- **引入別名混淆**：`@/*` 對應 `src/*`。勿與 node_modules 引入混淆。
- **Pages 對 App Router**：確保用 App Router（`src/app/`）非 Pages Router（`src/pages/`）。

## 相關技能

- `setup-tailwind-typescript` - 詳細 Tailwind 與 TypeScript 配置
- `deploy-to-vercel` - 部署腳手架應用
- `configure-git-repository` - 版本控制設置
