---
name: scaffold-nextjs-app
locale: wenyan-ultra
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

# 架 Next.js 應

建新 Next.js 應含 App Router、TypeScript、產備默。

## 用

- 始新網應→用
- 建 React 前含 SSR→用
- 建全棧應含 API 路→用
- 自無設 TypeScript 網項→用

## 入

- **必**：應名
- **必**：包管喜（npm、yarn、pnpm）
- **可**：含 Tailwind CSS（默：是）
- **可**：含 ESLint（默：是）
- **可**：src/ 目（默：是）

## 行

### 一：建項

```bash
npx create-next-app@latest my-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

答提或用旗以非互動設諸選。

得：項目建、諸依裝。

敗：查 Node.js 本（`node --version` ≥ 18.17）。確 `npx` 可。命掛於提→加 `--use-npm`（或 `--use-pnpm`/`--use-yarn`）跳包管提。

### 二：驗項結構

```
my-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── favicon.ico
│   └── lib/
├── public/
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .eslintrc.json
```

得：諸目檔皆在。

敗：`src/` 缺→`--src-dir` 旗未傳。重行 `create-next-app` 含旗，或手移檔入 `src/app/`。

### 三：配 Next.js

改 `next.config.ts`：

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

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

得：`next.config.ts` 存無 TypeScript 誤。

敗：檔用 `.js` 而非 `.ts`→重命。確 `NextConfig` 型自 `"next"` 入。

### 四：設目規

建常目：

```bash
mkdir -p src/app/api
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/types
```

得：四目皆建於 `src/` 下。

敗：`src/` 不存→先建或調徑合項結構（非 src 排用 `app/` 於根）。

### 五：建基排

改 `src/app/layout.tsx`：

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

得：排繪 Inter 字、包諸頁。

敗：字載敗→查網。代 `Inter` 為系字暫變通。

### 六：加例 API 路

建 `src/app/api/health/route.ts`：

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
```

得：檔建於 `src/app/api/health/route.ts`。

敗：確 `api/health/` 目存。檔須出名 HTTP 法處（`GET`、`POST` 等），非默出。

### 七：行開發服

```bash
cd my-app
npm run dev
```

得：應行於 http://localhost:3000。

敗：查 Node.js 本（≥ 18.17）。依缺→`npm install`。

## 驗

- [ ] `npm run dev` 啟無誤
- [ ] 主頁載於 localhost:3000
- [ ] TypeScript 編成
- [ ] Tailwind CSS 類施
- [ ] API 路應於 /api/health
- [ ] ESLint 行無誤（`npm run lint`）

## 忌

- **Node.js 本**：Next.js 需 ≥ 18.17。`node --version` 查
- **口衝**：默口 3000 用→`npm run dev -- -p 3001`
- **入別混**：`@/*` 映 `src/*`。勿混 node_modules 入
- **Pages vs App**：用 App（`src/app/`）非 Pages（`src/pages/`）

## 參

- `setup-tailwind-typescript`
- `deploy-to-vercel`
- `configure-git-repository`
