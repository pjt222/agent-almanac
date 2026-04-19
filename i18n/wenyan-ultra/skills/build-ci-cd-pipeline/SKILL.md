---
name: build-ci-cd-pipeline
locale: wenyan-ultra
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

# 建 CI/CD 管

設造產級 GitHub Actions 持整持發管。

## 用

- 新案設自動試與發
- 自 Jenkins、Travis CI、CircleCI 遷至 GitHub Actions
- 跨平或語版行矩構
- 加構快以減 CI/CD 時
- 立含環專發之多階管
- 施安掃與質關

## 入

- **必**：含碼之庫
- **必**：GitHub Actions 流目（`.github/workflows/`）
- **可**：發標之秘（AWS、Azure、Docker 庫）
- **可**：自宿行者配於專構
- **可**：枝護律與必態察

## 行

### 一：立基流構

造 `.github/workflows/ci.yml` 附觸配與基務構。

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

**得：** 流檔已造附正 YAML 法、觸已配、基 lint 務已定。

**敗：** `yamllint .github/workflows/ci.yml` 驗 YAML 法。察縮（用空，非 tab）。察 action 版新否於 GitHub Marketplace。

### 二：施矩構策

加矩構以跨諸平、語版、配試。

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

**得：** 矩生 8 並務（3 OS × 3 Node 版 − 1 除）。諸試通於諸平。覆報自單正典務上傳。

**敗：** 矩法誤→驗縮與陣記。試不穩→加重試以 `uses: nick-invision/retry@v2`。平專敗→加 OS 條件或擴除。

### 三：配依快與物管

以智快與存構物優構速。

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

**得：** 首行下依（緩），後行自快復（速）。構物以唯 SHA 名上傳成。

**敗：** 快常失→驗鍵含諸相關檔雜湊。上傳敗→察徑存且通配合實構出。驗 `retention-days` 合組策。

### 四：施安掃與質關

加安險掃與碼質強。

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

**得：** 安掃完，結上傳至 GitHub Security。危險阻合若配枝護。提交無秘檢。

**敗：** 偽陽→造 `.trivyignore` 含 CVE ID 與由。審敗→察 `npm audit fix` 議。秘察偽陽→加模至 `.trufflehog.yml` 除列。

### 五：配環專發

設發階附環護律與批關。

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

**得：** develop 枝自發暫。產需手批（GitHub 環設配）。CloudFront 失效清 CDN 快。標提交造發。

**敗：** AWS 證誤→驗 OIDC 信關許 `role-to-assume`。S3 同步敗→察桶策與 IAM 權。環批題→驗護律於 Settings > Environments。

### 六：加通知與監整

整 Slack 通、發跟、效能監。

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

**得：** Slack 得格化通附發態、庫詳、可點流連。Datadog 錄成產發事件附標。

**敗：** Slack 敗→驗鉤 URL 有效且工作區許入鉤。試以 `curl -X POST $SLACK_WEBHOOK_URL -d '{"text":"test"}'`。Datadog 敗→驗 API 鍵有事提交權。

## 驗

- [ ] 流法以 `yamllint` 或 GitHub 流編器驗
- [ ] 諸務有顯依（`needs:`）控行序
- [ ] 矩構涵諸標平與版
- [ ] 快減構時五成以上於後續行
- [ ] 秘存於 GitHub Secrets，絕不硬於流檔
- [ ] 安掃結上傳至 GitHub Security
- [ ] 環護律需批於產發
- [ ] 失發不留系不一態
- [ ] 通達宜道（Slack、郵、監工）
- [ ] 流於典改十分內完

## 忌

- **快鍵過廣**：用 `${{ runner.os }}-build-` 為快鍵→依改時偽中。鍵含 `hashFiles('**/package-lock.json')`。

- **物名撞**：用靜物名如 `dist`→並構覆。名含 `${{ github.sha }}` 或 `${{ matrix.os }}-${{ matrix.node }}`。

- **秘入志**：避 `echo $SECRET` 等命。GitHub 遮註秘而導值或洩。動秘用 `::add-mask::`。

- **權不足**：默 `GITHUB_TOKEN` 權限。加顯 `permissions:` 於安事、包、議等。

- **缺 if 條**：務於諸觸行除非以 `if: github.ref == 'refs/heads/main'` 護。防 PR 誤發產。

- **無回滾策**：發敗留系破。施藍綠或金絲發附健察自回。

- **硬值**：流含環專 URL、桶名、API 端。用環變與 GitHub Secrets。

- **無超時**：務於網題或無限迴圈懸。加 `timeout-minutes: 15` 於諸務。

## 參

- `setup-github-actions-ci` — R 包與基案之初 GitHub Actions 配
- `commit-changes` — 正 Git 流整與 CI/CD 觸
- `configure-git-repository` — 庫設與枝護律
- `setup-container-registry` — CI/CD 管中 Docker 像構
- `implement-gitops-workflow` — ArgoCD/Flux 與 CI/CD 整
