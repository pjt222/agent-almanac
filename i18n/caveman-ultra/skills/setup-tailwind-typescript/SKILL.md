---
name: setup-tailwind-typescript
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Configure Tailwind CSS w/ TS in Next.js|React project. Install, config, custom theme ext, component patterns, type-safe styling utilities. Use → add Tailwind to existing TS project, customize theme for design system, type-safe component styling, configure plugins+ext.
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

# Set Up Tailwind CSS with TypeScript

Configure Tailwind CSS in TS project w/ custom theme, utilities, type-safe patterns.

## Use When

- Add Tailwind to existing TS project
- Customize theme for design system
- Type-safe component styling
- Configure plugins + ext

## In

- **Required**: TS project (Next.js, Vite, standalone React)
- **Optional**: Design tokens (colors, spacing, fonts)
- **Optional**: Plugins to include

## Do

### Step 1: Install Tailwind

```bash
npm install -D tailwindcss @tailwindcss/postcss postcss
```

Next.js (if not included):

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

→ `tailwindcss`, `postcss`, `autoprefixer` as dev deps. Next.js → `tailwind.config.ts` + `postcss.config.js` generated.

If err: `npx tailwindcss init` fails → install Tailwind first w/ `npm install -D tailwindcss` + retry. Monorepo → run from app root, not workspace root.

### Step 2: tailwind.config.ts

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

→ Has `content` array matching paths, custom colors+fonts under `theme.extend`, proper TS typing w/ `Config` import.

If err: custom classes don't render → verify `content` paths match dir. Glob patterns relative to root. Missing → Tailwind won't scan.

### Step 3: Global Styles

Edit `src/app/globals.css`:

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

→ `globals.css` has 3 directives + custom base+component layer. Imported in root layout.

If err: not applied → verify imported in `layout.tsx` (or `_app.tsx` for Pages). Directives present, not commented.

### Step 4: Type-Safe Utility Helpers

Create `src/lib/cn.ts`:

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Install:

```bash
npm install clsx tailwind-merge
```

Usage:

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

→ `src/lib/cn.ts` exports `cn()`. `clsx` + `tailwind-merge` installed. Components use `cn()` to merge class names w/o conflicts.

If err: `clsx`|`tailwind-merge` not found → `npm install clsx tailwind-merge`. TS errs in `cn.ts` → verify `ClassValue` imported from `clsx`.

### Step 5: Dark Mode

Update `tailwind.config.ts`:

```typescript
const config: Config = {
  darkMode: "class", // or "media" for system preference
  // ... rest of config
};
```

Toggle:

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

→ Dark toggles correct between light+dark. `dark` class on `<html>`, `dark:` prefixed classes respond.

If err: not toggling → verify `darkMode: "class"`. `dark` on `<html>` not `<body>`. System-pref → `darkMode: "media"`.

### Step 6: Plugins (Optional)

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

→ Plugins installed dev deps + registered in `plugins` array. Plugin classes (`prose`, styled forms) available.

If err: plugin classes don't render → verify installed (`npm ls @tailwindcss/typography`) + in `plugins` array. Restart dev server after config changes.

## Check

- [ ] Tailwind classes render in browser
- [ ] Custom theme (colors, fonts, spacing) works
- [ ] `cn()` merges w/o conflicts
- [ ] Dark mode toggles
- [ ] TS no errs in config|components
- [ ] Prod build purges unused

## Traps

- **Content paths missing**: Classes don't render → check `content` array matches files
- **Class conflicts**: Use `tailwind-merge` (via `cn()`) → prevent conflicting
- **Custom vals not working**: Under `extend` (to add) not theme root (replaces defaults)
- **Dark mode not toggling**: Check `darkMode` + `dark` on `<html>` not `<body>`

## →

- `scaffold-nextjs-app` — project setup pre-Tailwind
- `deploy-to-vercel` — deploy styled app
