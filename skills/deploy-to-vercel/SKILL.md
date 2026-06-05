---
name: deploy-to-vercel
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

Deploy a Next.js application to Vercel with production configuration.

## When to Use

- Deploying a Next.js app for the first time
- Setting up preview deployments for pull requests
- Configuring custom domains
- Managing environment variables in production

## Inputs

- **Required**: Next.js application that builds successfully locally
- **Required**: GitHub repository (recommended) or local project
- **Optional**: Custom domain
- **Optional**: Environment variables for production

## Procedure

### Step 1: Verify Local Build

```bash
npm run build
```

**Expected:** Build succeeds with no errors.

**On failure:** Fix build errors before deploying. Common: TypeScript errors, missing dependencies, invalid imports.

### Step 2: Install Vercel CLI

```bash
npm install -g vercel
```

**Expected:** The `vercel` command is available globally and `vercel --version` prints the installed version.

**On failure:** If permission errors occur, use `sudo npm install -g vercel` or configure npm to use a user-local prefix. Verify Node.js is installed with `node --version`.

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

**Expected:** Preview URL provided (e.g., `https://my-app-xxx.vercel.app`).

**On failure:** If `vercel login` fails, check internet connectivity and try browser-based authentication. If the deploy fails, review the build output for errors -- Vercel uses a clean environment, so all dependencies must be in `package.json`.

### Step 4: Configure Environment Variables

```bash
# Add environment variables
vercel env add DATABASE_URL production
vercel env add API_KEY production preview

# List environment variables
vercel env ls
```

Or configure through the Vercel dashboard: Project Settings > Environment Variables.

**Expected:** `vercel env ls` shows all required environment variables configured for the correct environments (production, preview, development).

**On failure:** If variables are not appearing at runtime, verify the target environment matches (production vs preview). Redeploy after adding variables -- existing deployments do not pick up new variables automatically.

### Step 5: Deploy to Production

```bash
vercel --prod
```

**Expected:** Production URL available (e.g., `https://my-app.vercel.app`).

**On failure:** Check deployment logs with `vercel logs` or in the Vercel dashboard. Common issues include missing environment variables in the production environment and build commands differing from local setup.

### Step 6: Connect GitHub for Auto-Deploy (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel automatically deploys on:
   - Push to main -> Production deployment
   - Pull request -> Preview deployment

**Expected:** The Vercel dashboard shows the GitHub repository connected, and subsequent pushes to main trigger production deployments automatically.

**On failure:** If the repository does not appear in the import list, check that the Vercel GitHub app has access to the repository. Go to GitHub Settings > Applications > Vercel and grant access.

### Step 7: Configure Custom Domain

```bash
vercel domains add my-domain.com
```

Or through dashboard: Project Settings > Domains.

Update DNS records as instructed by Vercel (typically CNAME or A record).

**Expected:** `vercel domains ls` shows the custom domain as configured, and after DNS propagation (up to 48 hours), the domain resolves to the Vercel deployment.

**On failure:** If the domain shows "Invalid Configuration," verify DNS records match Vercel's instructions exactly. Use `dig my-domain.com` or an online DNS checker to confirm propagation.

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

**Expected:** `vercel.json` is saved in the project root and the next deployment picks up the configuration (visible in the Vercel dashboard build logs).

**On failure:** If the configuration is ignored, verify `vercel.json` is valid JSON with `jq . vercel.json`. Check the Vercel docs for your framework version, as some settings may have moved to `next.config.ts`.

## Validation

- [ ] `npm run build` succeeds locally
- [ ] Preview deployment works and is accessible
- [ ] Production deployment serves the application correctly
- [ ] Environment variables are available in production
- [ ] Custom domain resolves (if configured)
- [ ] GitHub integration triggers deployments on push

## Common Pitfalls

- **Build failing on Vercel but not locally**: Vercel uses a clean environment. Ensure all dependencies are in `package.json`, not just installed globally.
- **Environment variables missing**: Variables must be added to Vercel, not just `.env.local`. Different environments (production, preview, development) have separate variable sets.
- **Node.js version mismatch**: Set the Node.js version in Project Settings or `package.json` engines field.
- **Large deployments**: Vercel has size limits. Use `.vercelignore` to exclude unnecessary files.
- **API route timeouts**: Vercel serverless functions have a 10s timeout on the Hobby plan. Optimize or upgrade.

## Related Skills

- `scaffold-nextjs-app` - create the app to deploy
- `setup-tailwind-typescript` - configure styling before deployment
- `configure-git-repository` - Git setup for auto-deploy integration
