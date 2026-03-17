---
name: setup-tailwind-typescript
description: >
  在 Next.js 或 React 项目中配置 Tailwind CSS 与 TypeScript。涵盖安装、
  配置、自定义主题扩展、组件模式及类型安全样式工具。适用于为现有
  TypeScript 项目添加 Tailwind CSS、为项目设计系统自定义 Tailwind 主题、
  设置类型安全组件样式模式，或配置 Tailwind 插件和扩展。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-dev
  complexity: basic
  language: TypeScript
  tags: tailwind, typescript, css, styling, configuration
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
---

# 配置 Tailwind CSS 与 TypeScript

在 TypeScript 项目中配置 Tailwind CSS，包含自定义主题、工具函数和类型安全模式。

## 适用场景

- 为现有 TypeScript 项目添加 Tailwind CSS
- 为项目设计系统自定义 Tailwind 主题
- 设置类型安全组件样式模式
- 配置 Tailwind 插件和扩展

## 输入

- **必需**：TypeScript 项目（Next.js、Vite 或独立 React）
- **可选**：设计系统令牌（颜色、间距、字体）
- **可选**：要包含的 Tailwind 插件

## 步骤

### 第 1 步：安装 Tailwind CSS

```bash
npm install -D tailwindcss @tailwindcss/postcss postcss
```

对于 Next.js（如果尚未包含）：

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**预期结果：** `tailwindcss`、`postcss` 和 `autoprefixer` 安装为开发依赖项。对于 Next.js，`npx tailwindcss init -p` 生成 `tailwind.config.ts` 和 `postcss.config.js`。

**失败处理：** 如果 `npx tailwindcss init` 失败，先用 `npm install -D tailwindcss` 安装 Tailwind，再重试。如果使用 monorepo，从应用根目录运行命令，而非工作区根目录。

### 第 2 步：配置 tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a5f",
        },
        secondary: {
          500: "#6366f1",
          600: "#4f46e5",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
    },
  },
  plugins: [],
};

export default config;
```

**预期结果：** `tailwind.config.ts` 的 `content` 数组与项目文件位置匹配，`theme.extend` 下有自定义颜色和字体，并通过 `Config` 导入正确的 TypeScript 类型。

**失败处理：** 如果自定义类未渲染，验证 `content` 路径是否与实际目录结构匹配。路径为相对于项目根目录的 glob 模式。路径缺失意味着 Tailwind 不会扫描这些文件中的类用法。

### 第 3 步：设置全局样式

编辑 `src/app/globals.css`：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply antialiased;
  }

  body {
    @apply bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white px-4 py-2 rounded-lg
           hover:bg-primary-700 focus:outline-none focus:ring-2
           focus:ring-primary-500 focus:ring-offset-2
           transition-colors duration-200;
  }
}
```

**预期结果：** `globals.css` 包含三个 Tailwind 指令（`@tailwind base`、`@tailwind components`、`@tailwind utilities`）以及自定义基础和组件层样式。文件在根布局中被导入。

**失败处理：** 如果样式未应用，验证 `globals.css` 是否在 `layout.tsx`（或 Pages Router 的 `_app.tsx`）中导入。检查 Tailwind 指令是否存在且未被注释。

### 第 4 步：创建类型安全工具函数

创建 `src/lib/cn.ts`：

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

安装依赖项：

```bash
npm install clsx tailwind-merge
```

组件中的用法：

```tsx
import { cn } from "@/lib/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-colors",
        variant === "primary" && "bg-primary-600 text-white hover:bg-primary-700",
        variant === "secondary" && "bg-secondary-500 text-white hover:bg-secondary-600",
        variant === "outline" && "border border-gray-300 hover:bg-gray-50",
        className
      )}
      {...props}
    />
  );
}
```

**预期结果：** `src/lib/cn.ts` 导出 `cn()` 函数。`clsx` 和 `tailwind-merge` 已安装为依赖项。组件使用 `cn()` 合并类名而不产生冲突。

**失败处理：** 如果找不到 `clsx` 或 `tailwind-merge`，运行 `npm install clsx tailwind-merge`。如果 TypeScript 在 `cn.ts` 中报类型错误，验证 `ClassValue` 类型是否从 `clsx` 导入。

### 第 5 步：添加深色模式支持

更新 `tailwind.config.ts`：

```typescript
const config: Config = {
  darkMode: "class", // or "media" for system preference
  // ... rest of config
};
```

切换实现：

```tsx
"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <button onClick={() => setDark(!dark)}>
      {dark ? "Light" : "Dark"} Mode
    </button>
  );
}
```

**预期结果：** 深色模式在亮色和深色主题之间正确切换。`dark` 类应用于 `<html>` 元素，带 `dark:` 前缀的工具类相应响应。

**失败处理：** 如果深色模式不切换，验证 `tailwind.config.ts` 中是否设置了 `darkMode: "class"`。确保 `dark` 类在 `<html>` 元素（而非 `<body>`）上切换。对于系统偏好模式，改用 `darkMode: "media"`。

### 第 6 步：添加插件（可选）

```bash
npm install -D @tailwindcss/typography @tailwindcss/forms
```

```typescript
// tailwind.config.ts
import typography from "@tailwindcss/typography";
import forms from "@tailwindcss/forms";

const config: Config = {
  // ...
  plugins: [typography, forms],
};
```

**预期结果：** 插件安装为开发依赖项并在 `tailwind.config.ts` 的 `plugins` 数组中注册。插件提供的类（如 typography 的 `prose`、forms 的样式化表单元素）在组件中可用。

**失败处理：** 如果插件类未渲染，验证插件已安装（`npm ls @tailwindcss/typography`）并已添加到 `plugins` 数组。更改配置后重启开发服务器。

## 验证清单

- [ ] Tailwind 类在浏览器中正确渲染
- [ ] 自定义主题值（颜色、字体、间距）正常工作
- [ ] `cn()` 工具函数无冲突地合并类名
- [ ] 深色模式正确切换
- [ ] TypeScript 在配置或组件中无错误
- [ ] 生产构建清除未使用的样式

## 常见问题

- **内容路径缺失**：如果类未渲染，检查配置中的 `content` 数组是否与文件位置匹配
- **类冲突**：使用 `tailwind-merge`（通过 `cn()`）防止工具类冲突
- **自定义值不生效**：确保自定义值在 `extend` 下（添加），而非主题根目录（替换默认值）
- **深色模式不切换**：检查 `darkMode` 设置，确认 `dark` 类在 `<html>` 而非 `<body>` 上

## 相关技能

- `scaffold-nextjs-app` — 配置 Tailwind 前的项目设置
- `deploy-to-vercel` — 部署已完成样式的应用
