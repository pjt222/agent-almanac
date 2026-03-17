---
name: scaffold-nextjs-app
description: >
  搭建新的 Next.js 应用程序，使用 App Router、TypeScript 及现代默认配置。
  涵盖项目创建、目录结构、路由设置及初始配置。适用于启动新的 Web 应用
  项目、创建支持服务端渲染的 React 前端、构建带 API 路由的全栈应用，
  或从零搭建 TypeScript Web 项目。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-dev
  complexity: basic
  language: TypeScript
  tags: nextjs, react, typescript, app-router, scaffold
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
---

# 搭建 Next.js 应用

使用 App Router、TypeScript 和生产就绪默认配置创建新的 Next.js 应用程序。

## 适用场景

- 启动新的 Web 应用项目
- 创建支持服务端渲染的 React 前端
- 构建带 API 路由的全栈应用
- 搭建 TypeScript Web 项目

## 输入

- **必需**：应用名称
- **必需**：包管理器偏好（npm、yarn、pnpm）
- **可选**：是否包含 Tailwind CSS（默认：是）
- **可选**：是否包含 ESLint（默认：是）
- **可选**：src/ 目录结构（默认：是）

## 步骤

### 第 1 步：创建项目

```bash
npx create-next-app@latest my-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

回答提示或使用标志以非交互方式设置所有选项。

**预期结果：** 项目目录已创建，所有依赖项已安装。

**失败处理：** 检查 Node.js 版本（`node --version`，必须 >= 18.17）。确保 `npx` 可用。如果命令在提示时挂起，添加 `--use-npm`（或 `--use-pnpm`/`--use-yarn`）标志以跳过包管理器提示。

### 第 2 步：验证项目结构

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

**预期结果：** 所有列出的目录和文件均存在。

**失败处理：** 如果 `src/` 目录缺失，说明未传入 `--src-dir` 标志。重新运行带该标志的 `create-next-app`，或手动将文件移入 `src/app/`。

### 第 3 步：配置 Next.js

根据项目需求编辑 `next.config.ts`：

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

**预期结果：** `next.config.ts` 保存时无 TypeScript 错误。

**失败处理：** 如果文件使用 `.js` 扩展名而非 `.ts`，请重命名。确保 `NextConfig` 类型从 `"next"` 导入。

### 第 4 步：设置目录约定

创建常用目录：

```bash
mkdir -p src/app/api
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/types
```

**预期结果：** `src/` 下四个目录均已创建。

**失败处理：** 如果 `src/` 不存在，先创建它，或调整路径以匹配项目结构（非 src 布局在根目录使用 `app/`）。

### 第 5 步：创建基础布局

编辑 `src/app/layout.tsx`：

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

**预期结果：** 布局使用 Inter 字体渲染并包裹所有页面。

**失败处理：** 如果字体加载失败，检查网络连接。临时方案可将 `Inter` 替换为系统字体回退。

### 第 6 步：添加示例 API 路由

创建 `src/app/api/health/route.ts`：

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
```

**预期结果：** 文件创建于 `src/app/api/health/route.ts`。

**失败处理：** 确保 `api/health/` 目录存在。文件必须导出具名 HTTP 方法处理函数（`GET`、`POST` 等），而非默认导出。

### 第 7 步：运行开发服务器

```bash
cd my-app
npm run dev
```

**预期结果：** 应用在 http://localhost:3000 运行。

**失败处理：** 检查 Node.js 版本（>= 18.17）。如果依赖项缺失，运行 `npm install`。

## 验证清单

- [ ] `npm run dev` 启动无错误
- [ ] 首页在 localhost:3000 正常加载
- [ ] TypeScript 编译成功
- [ ] Tailwind CSS 类已应用
- [ ] API 路由在 /api/health 响应
- [ ] ESLint 运行无错误（`npm run lint`）

## 常见问题

- **Node.js 版本**：Next.js 需要 Node.js >= 18.17。使用 `node --version` 检查。
- **端口冲突**：默认端口 3000 可能已被占用。使用 `npm run dev -- -p 3001`。
- **导入别名混淆**：`@/*` 映射到 `src/*`，不要与 node_modules 导入混淆。
- **Pages 与 App Router 混用**：确保使用 App Router（`src/app/`）而非 Pages Router（`src/pages/`）。

## 相关技能

- `setup-tailwind-typescript` — 详细的 Tailwind 和 TypeScript 配置
- `deploy-to-vercel` — 部署已搭建的应用
- `configure-git-repository` — 版本控制设置
