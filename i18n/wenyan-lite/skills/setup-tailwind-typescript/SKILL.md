---
name: setup-tailwind-typescript
locale: wenyan-lite
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

# 設置 Tailwind CSS 與 TypeScript

於 TypeScript 項目中配置 Tailwind CSS，含自訂主題、工具與型別安全模式。

## 適用時機

- 為既有 TypeScript 項目加入 Tailwind CSS
- 為項目設計系統自訂 Tailwind 主題
- 設置型別安全之元件樣式模式
- 配置 Tailwind 外掛與擴展

## 輸入

- **必要**：TypeScript 項目（Next.js、Vite 或獨立 React）
- **選擇性**：設計系統 token（顏色、間距、字體）
- **選擇性**：欲納入之 Tailwind 外掛

## 步驟

### 步驟一：安裝 Tailwind CSS

```bash
npm install -D tailwindcss @tailwindcss/postcss postcss
```

對 Next.js（若未含）：

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**預期：** `tailwindcss`、`postcss` 與 `autoprefixer` 已作為開發依賴安裝。對 Next.js，`tailwind.config.ts` 與 `postcss.config.js` 由 `npx tailwindcss init -p` 產生。

**失敗時：** 若 `npx tailwindcss init` 失敗，先以 `npm install -D tailwindcss` 安裝 Tailwind 再重試。若用 monorepo，自應用根目錄而非工作區根執行命令。

### 步驟二：配置 tailwind.config.ts

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

**預期：** `tailwind.config.ts` 之 `content` 陣列符合項目文件位置，`theme.extend` 下有自訂顏色與字體，並以 `Config` 引入作適當之 TypeScript 類型化。

**失敗時：** 若自訂類別未渲染，驗證 `content` 路徑符合實際目錄結構。路徑為相對項目根之 glob 模式。缺路徑意指 Tailwind 不掃描該等文件之類別使用。

### 步驟三：設置全域樣式

編輯 `src/app/globals.css`：

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

**預期：** `globals.css` 含三 Tailwind 指令（`@tailwind base`、`@tailwind components`、`@tailwind utilities`）加任何自訂之 base 與 component 層樣式。文件已於根佈局中引入。

**失敗時：** 若樣式未套用，驗證 `globals.css` 已於 `layout.tsx`（或 Pages Router 之 `_app.tsx`）中引入。檢查 Tailwind 指令存在且未被註解。

### 步驟四：建立型別安全之工具輔助

建立 `src/lib/cn.ts`：

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

安裝依賴：

```bash
npm install clsx tailwind-merge
```

於元件中之用法：

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

**預期：** `src/lib/cn.ts` 匯出 `cn()` 函數。`clsx` 與 `tailwind-merge` 已作為依賴安裝。元件用 `cn()` 合併類別名而無衝突。

**失敗時：** 若找不到 `clsx` 或 `tailwind-merge`，執行 `npm install clsx tailwind-merge`。若 TypeScript 於 `cn.ts` 報類型錯誤，驗證 `ClassValue` 類型自 `clsx` 引入。

### 步驟五：加入暗模式支援

更新 `tailwind.config.ts`：

```typescript
const config: Config = {
  darkMode: "class", // or "media" for system preference
  // ... rest of config
};
```

切換實作：

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

**預期：** 暗模式於明暗主題間正確切換。`dark` 類別套用於 `<html>` 元素，`dark:` 前綴之工具類別對應響應。

**失敗時：** 若暗模式不切換，驗證 `tailwind.config.ts` 中 `darkMode: "class"` 已設。確保 `dark` 類別於 `<html>` 元素（非 `<body>`）切換。對系統偏好模式，改用 `darkMode: "media"`。

### 步驟六：加入外掛（選擇性）

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

**預期：** 外掛已作為開發依賴安裝並於 `tailwind.config.ts` 之 `plugins` 陣列註冊。外掛提供之類別（如 typography 之 `prose`、forms 之樣式表單元素）於元件中可用。

**失敗時：** 若外掛類別未渲染，驗證外掛已安裝（`npm ls @tailwindcss/typography`）且加入 `plugins` 陣列。配置變更後重啟開發伺服器。

## 驗證

- [ ] Tailwind 類別於瀏覽器中正確渲染
- [ ] 自訂主題值（顏色、字體、間距）運作
- [ ] `cn()` 工具合併類別而無衝突
- [ ] 暗模式正確切換
- [ ] TypeScript 於配置或元件中無錯
- [ ] 生產建構清除未用樣式

## 常見陷阱

- **content 路徑缺失**：若類別未渲染，檢查配置中之 `content` 陣列符合文件位置
- **類別衝突**：用 `tailwind-merge`（經 `cn()`）以防止衝突之工具類別
- **自訂值不運作**：確保自訂值於 `extend` 下（以加入）而非主題根（其取代預設）
- **暗模式不切換**：檢查 `darkMode` 設定及 `dark` 類別於 `<html>` 而非 `<body>`

## 相關技能

- `scaffold-nextjs-app` - Tailwind 配置前之項目設置
- `deploy-to-vercel` - 部署已樣式之應用
