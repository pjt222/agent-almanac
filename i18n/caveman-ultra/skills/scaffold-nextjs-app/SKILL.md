---
name: scaffold-nextjs-app
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Scaffold new Next.js app → App Router, TS, modern defaults. Project create, dir structure, routing, init config. Use → start new web app, React frontend w/ SSR, full-stack w/ API routes, TS web from scratch.
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

Create new Next.js w/ App Router, TS, prod-ready defaults.

## Use When

- New web app project
- React frontend w/ SSR
- Full-stack w/ API routes
- TS web from scratch

## In

- **Required**: App name
- **Required**: Pkg mgr (npm|yarn|pnpm)
- **Optional**: Tailwind (default yes)
- **Optional**: ESLint (default yes)
- **Optional**: src/ structure (default yes)

## Do

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

Answer prompts or use flags non-interactive.

→ Project dir created w/ all deps installed.

If err: check Node ver (`node --version`, must ≥18.17). `npx` available. Hangs on prompts → add `--use-npm` (or `--use-pnpm`|`--use-yarn`).

### Step 2: Verify Structure

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

→ All listed dirs+files present.

If err: `src/` missing → `--src-dir` not passed. Re-run or move files manually → `src/app/`.

### Step 3: Configure Next.js

Edit `next.config.ts`:

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

→ Saved w/o TS errs.

If err: `.js` instead of `.ts` → rename. Ensure `NextConfig` imported from `"next"`.

### Step 4: Dir Conventions

```bash
mkdir -p src/app/api
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/types
```

→ All 4 dirs under `src/`.

If err: no `src/` → create first or adjust paths (non-src layout uses `app/` at root).

### Step 5: Base Layout

Edit `src/app/layout.tsx`:

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

→ Layout renders w/ Inter font, wraps all pages.

If err: font fails → check net. Replace `Inter` w/ system fallback temp.

### Step 6: Example API Route

Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
```

→ File created at path.

If err: ensure `api/health/` exists. Must export named HTTP method handlers (`GET`, `POST`, etc.), not default.

### Step 7: Run Dev Server

```bash
cd my-app
npm run dev
```

→ App at http://localhost:3000.

If err: check Node ≥18.17. Run `npm install` if deps missing.

## Check

- [ ] `npm run dev` starts w/o errs
- [ ] Home page loads localhost:3000
- [ ] TS compile succeeds
- [ ] Tailwind classes applied
- [ ] API route responds /api/health
- [ ] ESLint clean (`npm run lint`)

## Traps

- **Node ver**: Needs ≥18.17. Check `node --version`.
- **Port conflict**: 3000 in use → `npm run dev -- -p 3001`.
- **Import alias confusion**: `@/*` → `src/*`. Don't confuse w/ node_modules.
- **Pages vs App Router**: Use App Router (`src/app/`) not Pages (`src/pages/`).

## →

- `setup-tailwind-typescript` — detailed Tailwind + TS config
- `deploy-to-vercel` — deploy scaffold
- `configure-git-repository` — version control
