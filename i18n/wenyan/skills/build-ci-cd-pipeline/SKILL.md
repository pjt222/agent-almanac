---
name: build-ci-cd-pipeline
locale: wenyan
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

# 建 CI/CD 之脈

設立生產級持集與交付之脈，以 GitHub Actions 為之。

## 用時

- 新項設自動測與交
- 自 Jenkins、Travis CI、或 CircleCI 遷於 GitHub Actions
- 跨諸平或語版行矩陣建
- 加建之緩以速 CI/CD
- 建多階之脈，各境有專交
- 施安掃與碼質之門

## 入

- **必要**：含碼之庫，欲測、建、交
- **必要**：GitHub Actions 工作流之目（`.github/workflows/`）
- **可選**：交標之密（AWS、Azure、Docker 冊）
- **可選**：為專建設自主 runner
- **可選**：分支護律與必之狀查

## 法

### 第一步：建基工作流之構

立 `.github/workflows/ci.yml`，含觸之設與基 job 之構。

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

**得：** 工作流檔建，YAML 語法正，觸已設，基 lint job 已定。

**敗則：** 驗 YAML 語法以 `yamllint .github/workflows/ci.yml`。察縮進（用空格，勿制表）。驗 action 之版至新，察於 GitHub Marketplace。

### 第二步：施矩陣建之略

加矩陣建以測跨諸平、諸語版、諸設。

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

**得：** 矩陣生八並行 job（三 OS × 三 Node 版 − 一排除）。諸平之測皆過。覆蓋報自一規範 job 上傳。

**敗則：** 若矩陣語法誤，驗縮進與陣列之記。測脆者，加重試邏以 `uses: nick-invision/retry@v2`。平特之敗，加 OS 條件或擴排除。

### 第三步：設依緩與物之管

以智緩速建，保建之物。

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

**得：** 首行下依（緩），續行自緩復（速）。建之物成功上傳，以 SHA 為名。

**敗則：** 若緩常失，驗緩鍵含諸相關檔之哈希。上傳敗者，察路存否與通配合實建出否。驗 `retention-days` 合組織之政。

### 第四步：施安掃與質之門

加安漏之掃與碼質之強。

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

**得：** 安掃畢，果傳 GitHub Security 籤。若分支護已設，重漏阻並。提交無漏密。

**敗則：** 誤報者，建 `.trivyignore` 檔，含 CVE ID 與理由。audit 敗者，察 `npm audit fix` 之議。密察誤報者，加模於 `.trufflehog.yml` 之排除。

### 第五步：設境特之交

立交階，含境護律與允之門。

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

**得：** 測境於 develop 分支自動交。生產須手允（於 GitHub Environment 設）。CloudFront 之無效清 CDN 緩。標記之提交生 Release。

**敗則：** AWS 憑敗者，驗 OIDC 信任令 `role-to-assume` 可。S3 sync 敗者，察桶政與 IAM 權。境允題者，驗護律於 Settings > Environments。

### 第六步：加通知與監視之整合

整 Slack 通知、交蹤、性監。

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

**得：** Slack 收格式化通知，含交態、庫詳、可點工作流鏈。Datadog 記生產交之事件，帶適標。

**敗則：** Slack 敗者，驗 webhook URL 有效且工作區容 webhook。以 `curl -X POST $SLACK_WEBHOOK_URL -d '{"text":"test"}'` 試之。Datadog 敗者，驗 API 鍵有事件提交之權。

## 驗

- [ ] 工作流語法以 `yamllint` 或 GitHub 之編輯器驗過
- [ ] 諸 job 有明依（`needs:`）以控執序
- [ ] 矩陣涵諸標平與版
- [ ] 緩減續建時半以上
- [ ] 密存於 GitHub Secrets，工作流檔中無硬碼
- [ ] 安掃果上傳於 GitHub Security 籤
- [ ] 境護律要求生產交之允
- [ ] 交敗不留系於不一致之態
- [ ] 通知達適道（Slack、信、監工）
- [ ] 典型改之工作流於十分內畢

## 陷

- **緩鍵太泛**：用 `${{ runner.os }}-build-` 為緩鍵致依變時誤中。宜含 `hashFiles('**/package-lock.json')` 於鍵

- **物名相衝**：用靜物名如 `dist` 致並建之覆。宜含 `${{ github.sha }}` 或 `${{ matrix.os }}-${{ matrix.node }}` 於名

- **密於日誌**：勿 `echo $SECRET` 等命。GitHub 遮已註之密，而衍值或漏。動密宜用 `::add-mask::`

- **權不足**：默 `GITHUB_TOKEN` 權有限。為安事件、包、問題等，加明 `permissions:` 塊

- **缺 if 條件**：諸 job 於諸觸皆行，除以 `if: github.ref == 'refs/heads/main'` 護之。防 PR 誤交生產

- **無回滾之略**：交敗留系於壞態。施藍綠或金絲雀之交，帶康查敗之自動回滾

- **硬編之值**：工作流含境特 URL、桶名、或 API 端點。宜用環變與 GitHub Secrets

- **無時限**：job 於網題或無限循環中永懸。諸 job 加 `timeout-minutes: 15`

## 參

- `setup-github-actions-ci` - R 包與基項之初 GitHub Actions 設
- `commit-changes` - 與 CI/CD 觸整合之 Git 工作流
- `configure-git-repository` - 庫設與分支護律
- `setup-container-registry` - CI/CD 脈中 Docker 像之建
- `implement-gitops-workflow` - ArgoCD/Flux 與 CI/CD 之整合
