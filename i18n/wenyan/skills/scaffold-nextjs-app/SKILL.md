---
name: scaffold-nextjs-app
locale: wenyan
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

# 搭 Next.js 應用

立新 Next.js 應用，附 App Router、TypeScript、與生產之默。

## 用時

- 新立網應用之項目乃用
- 立 React 之前端附服務端渲染乃用
- 立全棧應用附 API 之路由乃用
- 自零立 TypeScript 之網項目乃用

## 入

- **必要**：應用之名
- **必要**：包管之選（npm、yarn、pnpm）
- **可選**：是否含 Tailwind CSS（默：是）
- **可選**：是否含 ESLint（默：是）
- **可選**：src/ 目之結構（默：是）

## 法

### 第一步：建項目

```bash
npx create-next-app@latest my-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

應其問或用旗以非交互設諸選。

得：項目目已建，諸依皆裝。

敗則：察 Node.js 之版（`node --version`，必 >= 18.17）。確 `npx` 可得。命懸於問者，加 `--use-npm` 旗（或 `--use-pnpm`/`--use-yarn`）以略包管之問。

### 第二步：驗項目之結構

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

得：所列之目與文件皆存。

敗則：`src/` 缺，`--src-dir` 旗未傳。重行 `create-next-app` 附旗，或人手移文件入 `src/app/`。

### 第三步：配 Next.js

依項目之需編 `next.config.ts`：

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

得：`next.config.ts` 存而無 TypeScript 之誤。

敗則：文件用 `.js` 而非 `.ts`，改之。確 `NextConfig` 自 `"next"` 引。

### 第四步：設目之常規

立常用之目：

```bash
mkdir -p src/app/api
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/types
```

得：四目皆建於 `src/` 下。

敗則：`src/` 不存，先立之，或調徑以合項目結構（非 src 之布用 `app/` 於根）。

### 第五步：建基之布

編 `src/app/layout.tsx`：

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

得：布以 Inter 字渲染，包諸頁。

敗則：字載敗，察網。暫以系統字代 `Inter`。

### 第六步：增例 API 路由

立 `src/app/api/health/route.ts`：

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
```

得：文件已立於 `src/app/api/health/route.ts`。

敗則：確 `api/health/` 之目存。文件必出名命之 HTTP 法手（`GET`、`POST` 等），非默之出。

### 第七步：行開發之服

```bash
cd my-app
npm run dev
```

得：應用行於 http://localhost:3000。

敗則：察 Node.js 之版（>= 18.17）。若依缺，行 `npm install`。

## 驗

- [ ] `npm run dev` 啟而無誤
- [ ] 首頁載於 localhost:3000
- [ ] TypeScript 編譯成
- [ ] Tailwind CSS 之類已施
- [ ] API 路於 /api/health 應
- [ ] ESLint 行而無誤（`npm run lint`）

## 陷

- **Node.js 之版**：Next.js 需 Node.js >= 18.17。以 `node --version` 察
- **端口之衝**：默 3000 或被用。用 `npm run dev -- -p 3001`
- **引別名之惑**：`@/*` 映 `src/*`。勿混於 node_modules 之引
- **Pages vs App Router**：確用 App Router（`src/app/`），非 Pages Router（`src/pages/`）

## 參

- `setup-tailwind-typescript` — 詳之 Tailwind 與 TypeScript 之配
- `deploy-to-vercel` — 展所搭之應用
- `configure-git-repository` — 版控之設
