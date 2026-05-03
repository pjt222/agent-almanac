---
name: setup-tailwind-typescript
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Configure Tailwind CSS with TypeScript in a Next.js or React project.
  Covers installation, configuration, custom theme extensions, component
  patterns, and type-safe styling utilities. Use when adding Tailwind CSS
  to an existing TypeScript project, customizing the Tailwind theme for a
  project's design system, setting up type-safe component styling patterns,
  or configuring Tailwind plugins and extensions.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-dev
  complexity: basic
  language: TypeScript
  tags: tailwind, typescript, css, styling, configuration
---

# 設 Tailwind CSS 與 TypeScript

於 TypeScript 項目配 Tailwind CSS，附自定主題、用、與類安之模。

## 用時

- 既 TypeScript 項目加 Tailwind CSS 乃用
- 為項目之設計系統自定 Tailwind 主題乃用
- 設類安件之風模乃用
- 配 Tailwind 之插件與擴乃用

## 入

- **必要**：TypeScript 項目（Next.js、Vite、或獨之 React）
- **可選**：設計系統之令（色、距、字）
- **可選**：欲含之 Tailwind 插件

## 法

### 第一步：裝 Tailwind CSS

```bash
npm install -D tailwindcss @tailwindcss/postcss postcss
```

為 Next.js（若未含）：

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

得：`tailwindcss`、`postcss`、`autoprefixer` 已裝為開發依。Next.js 者，`tailwind.config.ts` 與 `postcss.config.js` 由 `npx tailwindcss init -p` 生。

敗則：`npx tailwindcss init` 敗，先以 `npm install -D tailwindcss` 裝後再試。monorepo 者，於應之根目行命，非工作空之根。

### 第二步：配 tailwind.config.ts

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

得：`tailwind.config.ts` 有 `content` 列合項目文件之位、`theme.extend` 下自定色與字、附正之 TypeScript 類（含 `Config` 之引）。

敗則：自定類不渲，驗 `content` 之徑合實之目構。徑為相對項目根之 glob 模。徑缺則 Tailwind 不掃其文件之類用。

### 第三步：設全風

編 `src/app/globals.css`：

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

得：`globals.css` 含三 Tailwind 之指（`@tailwind base`、`@tailwind components`、`@tailwind utilities`）並自定基與件層之風。文件引於根布。

敗則：風未施，驗 `globals.css` 引於 `layout.tsx`（或 Pages Router 之 `_app.tsx`）。察 Tailwind 諸指存而未注掉。

### 第四步：立類安之用助

立 `src/lib/cn.ts`：

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

裝依：

```bash
npm install clsx tailwind-merge
```

於件中之用：

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

得：`src/lib/cn.ts` 出 `cn()` 函。`clsx` 與 `tailwind-merge` 已裝為依。件用 `cn()` 合類名而無衝。

敗則：`clsx` 或 `tailwind-merge` 不可得，行 `npm install clsx tailwind-merge`。`cn.ts` TypeScript 報類誤，驗 `ClassValue` 自 `clsx` 引。

### 第五步：增暗模之支

更 `tailwind.config.ts`：

```typescript
const config: Config = {
  darkMode: "class", // or "media" for system preference
  // ... rest of config
};
```

切換之施：

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

得：暗模於明暗主題間正切。`dark` 類施於 `<html>` 元，`dark:` 前之類隨應。

敗則：暗模不切，驗 `darkMode: "class"` 設於 `tailwind.config.ts`。確 `dark` 類切於 `<html>`（非 `<body>`）。系統偏之模用 `darkMode: "media"`。

### 第六步：增插件（可選）

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

得：插件已裝為開發依，註於 `tailwind.config.ts` 之 `plugins` 列。插件之類（如 typography 之 `prose`、forms 之風表元）於件可得。

敗則：插件之類不渲，驗插件已裝（`npm ls @tailwindcss/typography`）且加於 `plugins` 列。配變後重啟開發服。

## 驗

- [ ] Tailwind 類於瀏覽器正渲
- [ ] 自定主題之值（色、字、距）行
- [ ] `cn()` 用合類而無衝
- [ ] 暗模正切
- [ ] TypeScript 於配與件無誤
- [ ] 生產建剪未用之風

## 陷

- **content 徑缺**：類不渲，察配中 `content` 列合文件之位
- **類衝**：用 `tailwind-merge`（經 `cn()`）以防衝之用類
- **自定值不行**：確自定值於 `extend` 下（為加），非主題之根（為代默）
- **暗模不切**：察 `darkMode` 之設與 `dark` 類於 `<html>` 非 `<body>`

## 參

- `scaffold-nextjs-app` — Tailwind 配前之項目設
- `deploy-to-vercel` — 展風之應用
