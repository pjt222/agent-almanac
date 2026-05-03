---
name: scaffold-nextjs-app
locale: caveman
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

# Scaffold Next.js App

Make new Next.js app with App Router, TypeScript, prod-ready defaults.

## When Use

- Start new web app project
- Make React frontend with server-side rendering
- Build full-stack app with API routes
- Set up TypeScript web project

## Inputs

- **Required**: App name
- **Required**: Package manager (npm, yarn, pnpm)
- **Optional**: Tailwind CSS (default: yes)
- **Optional**: ESLint (default: yes)
- **Optional**: src/ dir structure (default: yes)

## Steps

### Step 1: Create Project

```bash
npx create-next-app@latest my-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

Answer prompts or use flags to set all options non-interactive.

**Got:** Project dir made with all deps installed.

**If fail:** Check Node.js version (`node --version`, must be >= 18.17). Ensure `npx` available. Command hangs on prompts? Add `--use-npm` (or `--use-pnpm`/`--use-yarn`) to skip package manager prompt.

### Step 2: Verify Project Structure

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

**Got:** All listed dirs and files present.

**If fail:** `src/` dir missing? `--src-dir` flag not passed. Re-run `create-next-app` with flag, or move files manually into `src/app/`.

### Step 3: Configure Next.js

Edit `next.config.ts` for project needs.

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

**Got:** `next.config.ts` saved without TypeScript errors.

**If fail:** File uses `.js` not `.ts`? Rename. Ensure `NextConfig` type imported from `"next"`.

### Step 4: Set Up Directory Conventions

Make common dirs.

```bash
mkdir -p src/app/api
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/types
```

**Got:** All four dirs made under `src/`.

**If fail:** `src/` does not exist? Make it first or adjust paths to match (non-src layout uses `app/` at root).

### Step 5: Create Base Layout

Edit `src/app/layout.tsx`.

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

**Got:** Layout renders with Inter font, wraps all pages.

**If fail:** Font fails to load? Check network. Replace `Inter` with system font fallback as temp workaround.

### Step 6: Add Example API Route

Make `src/app/api/health/route.ts`.

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
```

**Got:** File made at `src/app/api/health/route.ts`.

**If fail:** Ensure `api/health/` dir exists. File must export named HTTP method handlers (`GET`, `POST`, etc.), not default export.

### Step 7: Run Dev Server

```bash
cd my-app
npm run dev
```

**Got:** App running at http://localhost:3000.

**If fail:** Check Node.js version (>= 18.17). Run `npm install` if deps missing.

## Checks

- [ ] `npm run dev` starts without errors
- [ ] Home page loads at localhost:3000
- [ ] TypeScript compiles
- [ ] Tailwind CSS classes applied
- [ ] API route responds at /api/health
- [ ] ESLint runs without errors (`npm run lint`)

## Pitfalls

- **Node.js version**: Next.js needs Node.js >= 18.17. Check with `node --version`.
- **Port conflicts**: Default port 3000 may be used. Use `npm run dev -- -p 3001`.
- **Import alias confusion**: `@/*` maps to `src/*`. Do not confuse with node_modules imports.
- **Pages vs App Router**: Ensure App Router (`src/app/`) not Pages (`src/pages/`).

## See Also

- `setup-tailwind-typescript` - detailed Tailwind + TypeScript config
- `deploy-to-vercel` - deploy scaffolded app
- `configure-git-repository` - version control setup
