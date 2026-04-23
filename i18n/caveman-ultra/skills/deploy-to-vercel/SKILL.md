---
name: deploy-to-vercel
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Deploy a Next.js application to Vercel. Covers project linking,
  environment variables, preview deployments, custom domains,
  and production deployment configuration. Use when deploying a Next.js
  app for the first time, setting up preview deployments for pull requests,
  configuring custom domains, or managing environment variables in
  a production Vercel deployment.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-dev
  complexity: basic
  language: TypeScript
  tags: vercel, deployment, nextjs, hosting, ci-cd
---

# Deploy to Vercel

Next.js → Vercel w/ prod config.

## Use When

- First-time Next.js deploy
- Preview deploys → PRs
- Custom domains
- Prod env vars

## In

- **Required**: Next.js app builds locally
- **Required**: GitHub repo (rec) or local
- **Optional**: Custom domain
- **Optional**: Prod env vars

## Do

### Step 1: Verify local build

```bash
npm run build
```

→ Build OK, no errs.

If err: Fix build before deploy. Common: TS errs, missing deps, bad imports.

### Step 2: Install Vercel CLI

```bash
npm install -g vercel
```

→ `vercel` cmd available, `vercel --version` works.

If err: Perm errs → `sudo` or user-local prefix. `node --version`.

### Step 3: Link + deploy

```bash
# Login to Vercel
vercel login

# Deploy (first time: creates project)
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N (for new projects)
# - Project name: my-app
# - Directory: ./
# - Override settings? N
```

→ Preview URL (e.g., `https://my-app-xxx.vercel.app`).

If err: `vercel login` fail → check net, try browser auth. Deploy fail → review build out. Clean env → all deps in `package.json`.

### Step 4: Env vars

```bash
# Add environment variables
vercel env add DATABASE_URL production
vercel env add API_KEY production preview

# List environment variables
vercel env ls
```

Or dashboard: Project Settings > Environment Variables.

→ `vercel env ls` shows all vars in correct envs.

If err: Not at runtime → target env matches. Redeploy → existing deploys don't pick up new vars.

### Step 5: Prod deploy

```bash
vercel --prod
```

→ Prod URL (e.g., `https://my-app.vercel.app`).

If err: `vercel logs` or dashboard. Common: missing prod env vars, build cmd diff from local.

### Step 6: GitHub auto-deploy (rec)

1. `https://vercel.com/new`
2. Import GH repo
3. Auto-deploy on:
   - Push main → prod
   - PR → preview

→ Dashboard shows repo connected, pushes trigger prod auto.

If err: Repo not in list → Vercel GH app access. GitHub Settings > Applications > Vercel.

### Step 7: Custom domain

```bash
vercel domains add my-domain.com
```

Or dashboard: Project Settings > Domains. Update DNS per Vercel.

→ `vercel domains ls` shows configured, after propagation (≤48h) resolves.

If err: "Invalid Configuration" → DNS matches exactly. `dig my-domain.com` or DNS checker.

### Step 8: Optimize config

`vercel.json`:

```json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

→ `vercel.json` in root, next deploy picks up.

If err: Ignored → `jq . vercel.json` valid. Framework ver → some moved to `next.config.ts`.

## Check

- [ ] `npm run build` OK locally
- [ ] Preview deploy works
- [ ] Prod deploy serves app
- [ ] Env vars in prod
- [ ] Custom domain resolves (if config'd)
- [ ] GH integration triggers deploys

## Traps

- **Build fail Vercel not local**: Clean env → all deps in `package.json`, not just global
- **Env vars missing**: Add to Vercel not `.env.local`. Envs separate.
- **Node ver mismatch**: Set in Project Settings or `package.json` engines
- **Large deploys**: Size limits. `.vercelignore` excludes.
- **API timeout**: Hobby plan 10s. Optimize or upgrade.

## →

- `scaffold-nextjs-app` — create app to deploy
- `setup-tailwind-typescript` — config styling pre-deploy
- `configure-git-repository` — Git setup for auto-deploy
