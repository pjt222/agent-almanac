---
name: setup-tailwind-typescript
locale: wenyan-ultra
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

# 設 Tailwind 含 TypeScript

於 TypeScript 項配 Tailwind CSS 含自題、用、型安式。

## 用

- 加 Tailwind 至既 TypeScript 項→用
- 自項設系之 Tailwind 題→用
- 設型安件樣式→用
- 配 Tailwind 件加→用

## 入

- **必**：TypeScript 項（Next.js、Vite、獨 React）
- **可**：設系符（色、間、字）
- **可**：所含 Tailwind 件

## 行

### 一：裝 Tailwind CSS

```bash
npm install -D tailwindcss @tailwindcss/postcss postcss
```

Next.js（如未含）：

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

得：`tailwindcss`、`postcss`、`autoprefixer` 裝為開發依。Next.js 含 `tailwind.config.ts` 與 `postcss.config.js` 經 `npx tailwindcss init -p` 生。

敗：`npx tailwindcss init` 敗→先 `npm install -D tailwindcss` 再試。單庫多項→於應根行非工區根。

### 二：配 tailwind.config.ts

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

得：`tailwind.config.ts` 含 `content` 陣合項檔位、自色與字於 `theme.extend`、TypeScript 型含 `Config` 入。

敗：自類不繪→驗 `content` 徑合實目結構。徑為相項根之 glob 式。缺徑→Tailwind 不掃彼檔。

### 三：設全樣

改 `src/app/globals.css`：

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

得：`globals.css` 含三 Tailwind 指（`@tailwind base`、`@tailwind components`、`@tailwind utilities`）加自基與件層。檔入於根排。

敗：樣不施→驗 `globals.css` 入於 `layout.tsx`（或 `_app.tsx`）。察 Tailwind 指存非註。

### 四：建型安用助

建 `src/lib/cn.ts`：

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

於件用：

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

得：`src/lib/cn.ts` 出 `cn()` 函。`clsx` 與 `tailwind-merge` 裝為依。件用 `cn()` 合類無衝。

敗：`clsx` 或 `tailwind-merge` 缺→`npm install clsx tailwind-merge`。`cn.ts` TypeScript 型誤→驗 `ClassValue` 自 `clsx` 入。

### 五：加暗模支

更 `tailwind.config.ts`：

```typescript
const config: Config = {
  darkMode: "class",
  // ... rest of config
};
```

切行：

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

得：暗模於明暗間正切。`dark` 類施於 `<html>`、`dark:` 前用類應。

敗：暗模不切→驗 `darkMode: "class"` 設於 `tailwind.config.ts`。確 `dark` 類切於 `<html>`（非 `<body>`）。系喜用 `darkMode: "media"`。

### 六：加件（可）

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

得：件裝為開發依、註於 `tailwind.config.ts` 之 `plugins` 陣。件供類（如 typography 之 `prose`、forms 之樣表）於件可。

敗：件類不繪→驗件裝（`npm ls @tailwindcss/typography`）並加於 `plugins`。配變後重啟開發服。

## 驗

- [ ] Tailwind 類於瀏正繪
- [ ] 自題值（色、字、間）行
- [ ] `cn()` 合類無衝
- [ ] 暗模正切
- [ ] TypeScript 配與件無誤
- [ ] 產建除無用樣

## 忌

- **content 徑缺**：類不繪→察配 `content` 陣合檔位
- **類衝**：用 `tailwind-merge`（經 `cn()`）防衝用類
- **自值不行**：確自值於 `extend`（加）非題根（代默）
- **暗模不切**：察 `darkMode` 設與 `dark` 類於 `<html>` 非 `<body>`

## 參

- `scaffold-nextjs-app`
- `deploy-to-vercel`
