---
name: build-ci-cd-pipeline
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Design and implement multi-stage CI/CD pipelines using GitHub Actions with matrix builds,
  dependency caching, artifact management, and secret handling. Create workflows that span
  linting, testing, building, and deployment stages with parallel execution and conditional
  logic. Use when setting up automated testing and deployment for a new project, migrating
  from Jenkins or CircleCI to GitHub Actions, implementing matrix builds across platforms,
  adding build caching, or creating multi-stage pipelines with security scanning and quality
  gates.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: intermediate
  language: multi
  tags: ci-cd, github-actions, pipeline, automation, testing
---

# Build CI/CD Pipeline

Design + impl production-grade CI/CD pipelines w/ GitHub Actions.

## Use When

- Automated testing + deploy for new project
- Migrate from Jenkins, Travis CI, CircleCI → GitHub Actions
- Matrix builds across platforms or lang versions
- Build caching to speed CI/CD exec time
- Multi-stage pipelines w/ env-specific deploys
- Security scanning + code quality gates

## In

- **Required**: Repo w/ code to test/build/deploy
- **Required**: GitHub Actions workflow dir (`.github/workflows/`)
- **Optional**: Secrets for deploy targets (AWS, Azure, Docker registries)
- **Optional**: Self-hosted runner config for specialized builds
- **Optional**: Branch protection rules + required status checks

## Do

### Step 1: Base Workflow Structure

Create `.github/workflows/ci.yml` w/ triggers + basic jobs.

```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  workflow_dispatch:  # Manual trigger

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check formatting
        run: npm run format:check
```

**→** Workflow file w/ proper YAML syntax, triggers configured, basic lint job defined.

**If err:** Validate YAML w/ `yamllint .github/workflows/ci.yml`. Check indentation (spaces, not tabs). Verify action vers current via GitHub Marketplace.

### Step 2: Matrix Build Strategy

Matrix builds → test across platforms, lang vers, configs.

```yaml
  test:
    name: Test (${{ matrix.os }}, Node ${{ matrix.node }})
    runs-on: ${{ matrix.os }}
    needs: lint
    strategy:
      fail-fast: false  # Continue testing other matrix combinations on failure
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: ['16', '18', '20']
        exclude:
          - os: macos-latest
            node: '16'  # Skip old Node on macOS

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        if: matrix.os == 'ubuntu-latest' && matrix.node == '18'
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          fail_ci_if_error: true
```

**→** Matrix generates 8 parallel jobs (3 OS × 3 Node vers - 1 exclusion). All tests pass across platforms. Coverage report uploads from single canonical job.

**If err:** Matrix syntax errs → verify indentation + array notation. Flaky tests → add retry via `uses: nick-invision/retry@v2`. Platform-specific fails → OS conditionals or expand exclusions.

### Step 3: Dep Caching + Artifact Mgmt

Speed via intelligent caching + preserve build artifacts.

```yaml
  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Cache build output
        uses: actions/cache@v3
        with:
          path: |
            .next/cache
            dist/
            build/
          key: ${{ runner.os }}-build-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.ts', '**/*.tsx') }}
          restore-keys: |
            ${{ runner.os }}-build-${{ hashFiles('**/package-lock.json') }}-
            ${{ runner.os }}-build-

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist-${{ github.sha }}
          path: |
            dist/
            build/
          retention-days: 7
          if-no-files-found: error
```

**→** First run downloads deps (slow), subsequent runs restore from cache (fast). Artifacts upload w/ unique SHA-based naming.

**If err:** Cache misses often → verify key includes all relevant file hashes. Upload fails → check path exists + glob patterns match actual build out. Verify `retention-days` meets org policies.

### Step 4: Security Scan + Quality Gates

Vulnerability scanning + code quality enforcement.

```yaml
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: lint
    permissions:
      security-events: write  # Required for uploading SARIF results
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        if: always()  # Upload even if scan finds vulnerabilities
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Dependency audit
        run: npm audit --audit-level=high
        continue-on-error: true  # Don't fail build, but show warnings

      - name: Check for leaked secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD
```

**→** Security scans complete, results upload to GitHub Security tab. Critical vulnerabilities block merge if branch protection configured. No secrets detected.

**If err:** False positives → `.trivyignore` w/ CVE IDs + justifications. Audit fails → review `npm audit fix`. Secret detection false positives → patterns to `.trufflehog.yml` exclude list.

### Step 5: Env-Specific Deploys

Deploy stages w/ env protection rules + approval gates.

```yaml
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build, security]
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging.example.com
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist-${{ github.sha }}
          path: ./dist

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_STAGING }}
          aws-region: us-east-1

      - name: Deploy to S3
        run: |
          aws s3 sync ./dist s3://${{ secrets.S3_BUCKET_STAGING }} --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DIST_STAGING }} --paths "/*"

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, security]
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://example.com
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist-${{ github.sha }}
          path: ./dist

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_PRODUCTION }}
          aws-region: us-east-1

      - name: Deploy to S3 with blue-green
        run: |
          # Deploy to new version
          aws s3 sync ./dist s3://${{ secrets.S3_BUCKET_PRODUCTION }}/releases/${{ github.sha }} --delete

          # Update symlink to new version
          aws s3 cp s3://${{ secrets.S3_BUCKET_PRODUCTION }}/releases/${{ github.sha }} s3://${{ secrets.S3_BUCKET_PRODUCTION }}/current --recursive

          # Invalidate CloudFront
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DIST_PRODUCTION }} --paths "/*"

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        if: startsWith(github.ref, 'refs/tags/')
        with:
          files: ./dist/**/*
          generate_release_notes: true
```

**→** Staging deploys auto on develop. Prod requires manual approval (GitHub Env settings). CloudFront invalidation clears CDN cache. Release for tagged commits.

**If err:** AWS credential errs → verify OIDC trust relationship allows `role-to-assume`. S3 sync fails → check bucket policies + IAM perms. Env approval issues → verify protection rules in Settings > Environments.

### Step 6: Notification + Monitoring

Integrate Slack, deploy tracking, perf monitoring.

```yaml
  notify:
    name: Notify Results
    runs-on: ubuntu-latest
    needs: [deploy-staging, deploy-production]
    if: always()  # Run even if previous jobs fail
    steps:
      - name: Check job status
        id: status
        run: |
          if [ "${{ needs.deploy-production.result }}" == "success" ]; then
            echo "status=success" >> $GITHUB_OUTPUT
            echo "color=#00FF00" >> $GITHUB_OUTPUT
          else
            echo "status=failure" >> $GITHUB_OUTPUT
            echo "color=#FF0000" >> $GITHUB_OUTPUT
          fi

      - name: Send Slack notification
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "text": "Deployment ${{ steps.status.outputs.status }}",
              "blocks": [
                {
                  "type": "header",
                  "text": {
                    "type": "plain_text",
                    "text": "🚀 Deployment Status: ${{ steps.status.outputs.status }}"
                  }
                },
                {
                  "type": "section",
                  "fields": [
                    {"type": "mrkdwn", "text": "*Repository:*\n${{ github.repository }}"},
                    {"type": "mrkdwn", "text": "*Branch:*\n${{ github.ref_name }}"},
                    {"type": "mrkdwn", "text": "*Commit:*\n${{ github.sha }}"},
                    {"type": "mrkdwn", "text": "*Actor:*\n${{ github.actor }}"}
                  ]
                },
                {
                  "type": "actions",
                  "elements": [
                    {
                      "type": "button",
                      "text": {"type": "plain_text", "text": "View Workflow"},
                      "url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
                    }
                  ]
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK

      - name: Record deployment in Datadog
        if: steps.status.outputs.status == 'success'
        run: |
          curl -X POST "https://api.datadoghq.com/api/v1/events" \
            -H "Content-Type: application/json" \
            -H "DD-API-KEY: ${{ secrets.DD_API_KEY }}" \
            -d @- <<EOF
          {
            "title": "Deployment: ${{ github.repository }}",
            "text": "Deployed commit ${{ github.sha }} to production",
            "tags": ["env:production", "service:${{ github.event.repository.name }}"],
            "alert_type": "info"
          }
          EOF
```

**→** Slack receives formatted notification w/ status, repo details, clickable workflow link. Datadog event logged for successful prod deploys w/ appropriate tags.

**If err:** Slack fails → verify webhook URL valid + workspace allows incoming. Test: `curl -X POST $SLACK_WEBHOOK_URL -d '{"text":"test"}'`. Datadog fails → verify API key has event submission perms.

## Check

- [ ] Workflow syntax validates w/ `yamllint` or GitHub editor
- [ ] All jobs have explicit deps (`needs:`) controlling exec order
- [ ] Matrix builds cover all target platforms + vers
- [ ] Caching reduces build time by >50% on subsequent runs
- [ ] Secrets in GitHub Secrets, never hardcoded
- [ ] Security scans upload results to GitHub Security tab
- [ ] Env protection rules require approval for prod deploys
- [ ] Failed deploys don't leave sys inconsistent
- [ ] Notifications reach appropriate channels (Slack, email, monitoring)
- [ ] Workflow completes in <10 min for typical changes

## Traps

- **Cache key too broad**: `${{ runner.os }}-build-` → false hits when deps change. Include `hashFiles('**/package-lock.json')` in key
- **Artifact name collisions**: Static names like `dist` → overwrites in concurrent builds. Include `${{ github.sha }}` or `${{ matrix.os }}-${{ matrix.node }}`
- **Secrets in logs**: Avoid `echo $SECRET`. GitHub masks registered secrets, but derived values may leak. Use `::add-mask::` for dynamic secrets
- **Insufficient perms**: Default `GITHUB_TOKEN` limited. Add explicit `permissions:` block for security events, packages, issues
- **Missing if conditionals**: Jobs run on all triggers unless guarded w/ `if: github.ref == 'refs/heads/main'`. Prevent accidental prod deploys from PRs
- **No rollback**: Deploy fails → broken state. Impl blue-green or canary w/ auto rollback on health check fails
- **Hardcoded values**: Workflow has env-specific URLs, bucket names, API endpoints. Use env vars + GitHub Secrets
- **No timeout limits**: Jobs hang indefinitely on network or infinite loops. Add `timeout-minutes: 15` to all

## →

- `setup-github-actions-ci` — initial GitHub Actions config for R pkgs + basic projects
- `commit-changes` — proper Git workflow integration w/ CI/CD triggers
- `configure-git-repository` — repo settings + branch protection rules
- `setup-container-registry` — Docker image builds in CI/CD
- `implement-gitops-workflow` — ArgoCD/Flux integration w/ CI/CD
