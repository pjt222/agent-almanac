---
name: deploy-to-vercel
locale: caveman
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

Deploy Next.js application to Vercel with production configuration.

## When Use

- Deploy Next.js app for first time
- Set up preview deployments for pull requests
- Configure custom domains
- Manage environment variables in production

## Inputs

- **Required**: Next.js application that builds successfully locally
- **Required**: GitHub repository (recommended) or local project
- **Optional**: Custom domain
- **Optional**: Environment variables for production

## Steps

### Step 1: Verify Local Build

```bash
npm run build
```

**Got:** Build succeeds with no errors.

**If fail:** Fix build errors before deploying. Common: TypeScript errors, missing dependencies, invalid imports.

### Step 2: Install Vercel CLI

```bash
npm install -g vercel
```

**Got:** `vercel` command available globally. `vercel --version` prints installed version.

**If fail:** If permission errors occur, use `sudo npm install -g vercel` or configure npm to use user-local prefix. Verify Node.js installed with `node --version`.

### Step 3: Link and Deploy

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

**Got:** Preview URL provided (e.g., `https://my-app-xxx.vercel.app`).

**If fail:** If `vercel login` fails, check internet connectivity and try browser-based authentication. If deploy fails, review build output for errors -- Vercel uses clean environment, so all dependencies must be in `package.json`.

### Step 4: Configure Environment Variables

```bash
# Add environment variables
vercel env add DATABASE_URL production
vercel env add API_KEY production preview

# List environment variables
vercel env ls
```

Or configure through Vercel dashboard: Project Settings > Environment Variables.

**Got:** `vercel env ls` shows all required environment variables configured for correct environments (production, preview, development).

**If fail:** If variables not appearing at runtime, verify target environment matches (production vs preview). Redeploy after adding variables -- existing deployments do not pick up new variables automatically.

### Step 5: Deploy to Production

```bash
vercel --prod
```

**Got:** Production URL available (e.g., `https://my-app.vercel.app`).

**If fail:** Check deployment logs with `vercel logs` or in Vercel dashboard. Common issues: missing environment variables in production environment, build commands differing from local setup.

### Step 6: Connect GitHub for Auto-Deploy (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel automatically deploys on:
   - Push to main -> Production deployment
   - Pull request -> Preview deployment

**Got:** Vercel dashboard shows GitHub repository connected. Subsequent pushes to main trigger production deployments automatically.

**If fail:** If repository does not appear in import list, check Vercel GitHub app has access to repository. Go to GitHub Settings > Applications > Vercel and grant access.

### Step 7: Configure Custom Domain

```bash
vercel domains add my-domain.com
```

Or through dashboard: Project Settings > Domains.

Update DNS records as instructed by Vercel (typically CNAME or A record).

**Got:** `vercel domains ls` shows custom domain as configured. After DNS propagation (up to 48 hours), domain resolves to Vercel deployment.

**If fail:** If domain shows "Invalid Configuration," verify DNS records match Vercel's instructions exactly. Use `dig my-domain.com` or online DNS checker to confirm propagation.

### Step 8: Optimize Configuration

Create `vercel.json` for advanced settings:

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

**Got:** `vercel.json` saved in project root. Next deployment picks up configuration (visible in Vercel dashboard build logs).

**If fail:** If configuration ignored, verify `vercel.json` is valid JSON with `jq . vercel.json`. Check Vercel docs for framework version, as some settings may have moved to `next.config.ts`.

## Checks

- [ ] `npm run build` succeeds locally
- [ ] Preview deployment works and accessible
- [ ] Production deployment serves application correctly
- [ ] Environment variables available in production
- [ ] Custom domain resolves (if configured)
- [ ] GitHub integration triggers deployments on push

## Pitfalls

- **Build failing on Vercel but not locally**: Vercel uses clean environment. Ensure all dependencies in `package.json`, not just installed globally.
- **Environment variables missing**: Variables must be added to Vercel, not just `.env.local`. Different environments (production, preview, development) have separate variable sets.
- **Node.js version mismatch**: Set Node.js version in Project Settings or `package.json` engines field.
- **Large deployments**: Vercel has size limits. Use `.vercelignore` to exclude unnecessary files.
- **API route timeouts**: Vercel serverless functions have 10s timeout on Hobby plan. Optimize or upgrade.

## See Also

- `scaffold-nextjs-app` - create app to deploy
- `setup-tailwind-typescript` - configure styling before deployment
- `configure-git-repository` - Git setup for auto-deploy integration
