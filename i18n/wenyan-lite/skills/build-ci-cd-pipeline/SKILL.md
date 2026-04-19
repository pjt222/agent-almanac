---
name: build-ci-cd-pipeline
locale: wenyan-lite
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

以 GitHub Actions 設計並實作生產級之持續整合與部署管線。

## 適用時機

- 為新項目立自動測試與部署
- 自 Jenkins、Travis CI、或 CircleCI 遷至 GitHub Actions
- 於多平台或語版實作矩陣構建
- 加構建快取以加 CI/CD 之行時
- 建環境專之多階部署管線
- 實作安全掃描與代碼質量關

## 輸入

- **必要**：含待測／構／部署之代碼之倉庫
- **必要**：GitHub Actions 工作流目錄（`.github/workflows/`）
- **選擇性**：部署目標之密（AWS、Azure、Docker 註冊）
- **選擇性**：專構之自託運行器配
- **選擇性**：分支保護規與必狀檢

## 步驟

### 步驟一：建基工作流結構

創 `.github/workflows/ci.yml` 附觸發配置與基本作業結構。

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

**預期：** 工作流文件已創，附正 YAML 語法、已配觸發、已定基本 lint 作業。

**失敗時：** 以 `yamllint .github/workflows/ci.yml` 驗 YAML 語法。查縮進（用空格，非 tab）。以查 GitHub Marketplace 驗行動版為當前。

### 步驟二：實作矩陣構建策略

加矩陣構建以測多平台、語版、配置。

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

**預期：** 矩陣生八並行作業（三 OS × 三 Node 版減一排除）。諸平台測過。覆蓋報告自單一之正規作業上傳。

**失敗時：** 若矩陣語法錯生，驗正縮進與陣列記法。不穩之測可加重試邏輯 `uses: nick-invision/retry@v2`。平台專之敗可加 OS 條件或擴排除。

### 步驟三：配依賴快取與物件管理

以智快取優構速、保構件。

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

**預期：** 首次運行下載依賴（慢），後運行自快取還原（快）。構件成上傳，附 SHA 之獨名。

**失敗時：** 若快取常失，驗快取鍵含諸相關文件哈希。上傳失，查路存且 glob 模式合實構件。驗 `retention-days` 合組織策。

### 步驟四：實作安全掃描與質量關

加安全漏洞掃描與代碼質量強制。

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

**預期：** 安全掃描完，結果上傳至 GitHub 安全頁。若分支保護已配，要漏洞阻合併。提交中無密洩。

**失敗時：** 偽陽建 `.trivyignore`，附 CVE ID 與理由。審計敗審 `npm audit fix` 之建議。密偵測偽陽於 `.trufflehog.yml` 排除列加模式。

### 步驟五：配環境專之部署

立部署階，附環境保護規與核可關。

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

**預期：** Staging 於 develop 分支自動部署。Production 須手動核可（於 GitHub Environment 設置中配）。CloudFront 失效清 CDN 快取。標記之提交創發布。

**失敗時：** AWS 憑證錯，驗 OIDC 信任允 `role-to-assume`。S3 sync 敗，查桶策與 IAM 權。環境核可議，驗 Settings > Environments 中保護規。

### 步驟六：加通知與監控整合

整合 Slack 通知、部署追、效能監控。

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

**預期：** Slack 受格式化通知，附部署狀、倉庫詳、可點工作流連。成功生產部署之 Datadog 事件已記，附合適標。

**失敗時：** Slack 敗，驗 webhook URL 有效且工作區允入站 webhook。以 `curl -X POST $SLACK_WEBHOOK_URL -d '{"text":"test"}'` 測。Datadog 敗，驗 API 鍵具事件提交權。

## 驗證

- [ ] 工作流語法以 `yamllint` 或 GitHub 之工作流編輯器驗
- [ ] 諸作業具明依賴（`needs:`）以控執行序
- [ ] 矩陣構建覆諸目標平台與版
- [ ] 快取減構時逾五成於後運行
- [ ] 密存於 GitHub Secrets，絕不硬編於工作流
- [ ] 安全掃描上傳結果至 GitHub 安全頁
- [ ] 環境保護規要求生產部署之核可
- [ ] 部署敗不留系統於不一致態
- [ ] 通知達合宜渠道（Slack、電郵、監控工具）
- [ ] 典型變更於十分內完工作流

## 常見陷阱

- **快取鍵過廣**：用 `${{ runner.os }}-build-` 為鍵致依賴變時偽中。鍵中含 `hashFiles('**/package-lock.json')`。

- **構件名碰**：用靜名如 `dist` 致並行構中覆寫。名中含 `${{ github.sha }}` 或 `${{ matrix.os }}-${{ matrix.node }}`。

- **日誌中之密**：避 `echo $SECRET` 或類命令。GitHub 遮已註之密，而衍生值或漏。動密用 `::add-mask::`。

- **權不足**：預設 `GITHUB_TOKEN` 具有限權。為安全事件、套件、議題加明 `permissions:` 塊。

- **缺 if 條件**：無 `if: github.ref == 'refs/heads/main'` 守，作業於諸觸發皆運。止 PR 偶之生產部署。

- **無回滾策**：部署敗留系統破。以健查敗之自動回滾實藍綠或金絲雀部署。

- **硬編值**：工作流含環境專 URL、桶名、API 端。用環境變與 GitHub Secrets。

- **無超時限**：作業於網問題或無限環時永掛。諸作業加 `timeout-minutes: 15`。

## 相關技能

- `setup-github-actions-ci` - R 套件與基本項目之初始 GitHub Actions 配置
- `commit-changes` - Git 工作流與 CI/CD 觸發之正整合
- `configure-git-repository` - 倉庫設置與分支保護規
- `setup-container-registry` - CI/CD 管線中之 Docker 映像構建
- `implement-gitops-workflow` - ArgoCD/Flux 與 CI/CD 之整合
