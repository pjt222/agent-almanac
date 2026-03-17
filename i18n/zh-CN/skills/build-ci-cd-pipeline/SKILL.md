---
name: build-ci-cd-pipeline
description: >
  使用 GitHub Actions 设计和实现多阶段 CI/CD 流水线，支持矩阵构建、依赖缓存、
  制品管理和密钥处理。创建涵盖代码检查、测试、构建和部署阶段的工作流，支持并行执行
  和条件逻辑。适用于为新项目设置自动化测试和部署、从 Jenkins 或 CircleCI 迁移到
  GitHub Actions、实现跨平台矩阵构建、添加构建缓存，或创建包含安全扫描和质量门禁
  的多阶段流水线。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: intermediate
  language: multi
  tags: ci-cd, github-actions, pipeline, automation, testing
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 构建 CI/CD 流水线

使用 GitHub Actions 设计和实现生产级持续集成和部署流水线。

## 适用场景

- 为新项目设置自动化测试和部署
- 从 Jenkins、Travis CI 或 CircleCI 迁移到 GitHub Actions
- 实现跨多个平台或语言版本的矩阵构建
- 添加构建缓存以加速 CI/CD 执行时间
- 创建具有环境特定部署的多阶段流水线
- 实现安全扫描和代码质量门禁

## 输入

- **必需**：包含需要测试/构建/部署代码的仓库
- **必需**：GitHub Actions 工作流目录（`.github/workflows/`）
- **可选**：部署目标的密钥（AWS、Azure、Docker 仓库）
- **可选**：用于特殊构建的自托管运行器配置
- **可选**：分支保护规则和必需的状态检查

## 步骤

### 第 1 步：创建基本工作流结构

创建 `.github/workflows/ci.yml`，包含触发器配置和基本任务结构。

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

**预期结果：** 工作流文件以正确的 YAML 语法创建，触发器已配置，基本的代码检查任务已定义。

**失败处理：** 使用 `yamllint .github/workflows/ci.yml` 验证 YAML 语法。检查缩进（使用空格而非制表符）。通过 GitHub Marketplace 检查 action 版本是否为最新。

### 第 2 步：实现矩阵构建策略

添加矩阵构建以在多个平台、语言版本或配置间进行测试。

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

**预期结果：** 矩阵生成 8 个并行任务（3 个操作系统 x 3 个 Node 版本 - 1 个排除项）。所有测试跨平台通过。覆盖率报告从单个规范任务上传。

**失败处理：** 如果矩阵语法出错，验证缩进和数组表示法是否正确。对于不稳定的测试，使用 `uses: nick-invision/retry@v2` 添加重试逻辑。对于平台特定的失败，添加操作系统条件或扩展排除项。

### 第 3 步：配置依赖缓存和制品管理

通过智能缓存优化构建速度，并保留构建制品。

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

**预期结果：** 首次运行下载依赖（较慢），后续运行从缓存恢复（较快）。构建制品以基于 SHA 的唯一命名成功上传。

**失败处理：** 如果缓存频繁未命中，验证缓存键是否包含所有相关文件的哈希值。对于上传失败，检查路径是否存在以及通配符模式是否匹配实际构建输出。验证 `retention-days` 是否符合组织策略。

### 第 4 步：实现安全扫描和质量门禁

添加安全漏洞扫描和代码质量强制检查。

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

**预期结果：** 安全扫描完成，结果上传到 GitHub 安全选项卡。如果配置了分支保护，关键漏洞将阻止合并。提交中未检测到泄露的密钥。

**失败处理：** 对于误报，创建 `.trivyignore` 文件并附上 CVE ID 和说明。对于审计失败，查看 `npm audit fix` 的建议。对于密钥检测的误报，将模式添加到 `.trufflehog.yml` 的排除列表中。

### 第 5 步：配置环境特定部署

设置具有环境保护规则和审批门禁的部署阶段。

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

**预期结果：** 预发布环境在 develop 分支上自动部署。生产环境需要手动审批（在 GitHub 环境设置中配置）。CloudFront 失效清除 CDN 缓存。带标签的提交创建发布版本。

**失败处理：** 对于 AWS 凭证错误，验证 OIDC 信任关系允许 `role-to-assume`。对于 S3 同步失败，检查存储桶策略和 IAM 权限。对于环境审批问题，验证设置 > 环境中的保护规则。

### 第 6 步：添加通知和监控集成

集成 Slack 通知、部署追踪和性能监控。

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
                    "text": "Deployment Status: ${{ steps.status.outputs.status }}"
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

**预期结果：** Slack 收到格式化的通知，包含部署状态、仓库详情和可点击的工作流链接。Datadog 为成功的生产部署记录事件并附带适当的标签。

**失败处理：** 对于 Slack 失败，验证 webhook URL 是否有效以及工作区是否允许传入 webhook。使用 `curl -X POST $SLACK_WEBHOOK_URL -d '{"text":"test"}'` 进行测试。对于 Datadog 失败，验证 API 密钥是否具有事件提交权限。

## 验证清单

- [ ] 工作流语法通过 `yamllint` 或 GitHub 工作流编辑器验证
- [ ] 所有任务都有显式依赖关系（`needs:`）以控制执行顺序
- [ ] 矩阵构建覆盖所有目标平台和版本
- [ ] 缓存使后续运行的构建时间减少 >50%
- [ ] 密钥存储在 GitHub Secrets 中，从不硬编码在工作流文件中
- [ ] 安全扫描结果上传到 GitHub 安全选项卡
- [ ] 环境保护规则要求生产部署审批
- [ ] 失败的部署不会使系统处于不一致状态
- [ ] 通知到达适当的渠道（Slack、邮件、监控工具）
- [ ] 工作流对典型变更在 10 分钟内完成

## 常见问题

- **缓存键过于宽泛**：使用 `${{ runner.os }}-build-` 作为缓存键会导致依赖变更时的误命中。在键中包含 `hashFiles('**/package-lock.json')`

- **制品名称冲突**：使用静态制品名称如 `dist` 会导致并发构建时的覆盖。在名称中包含 `${{ github.sha }}` 或 `${{ matrix.os }}-${{ matrix.node }}`

- **日志中暴露密钥**：避免 `echo $SECRET` 或类似命令。GitHub 会遮蔽已注册的密钥，但派生值可能泄露。对动态密钥使用 `::add-mask::`

- **权限不足**：默认 `GITHUB_TOKEN` 权限有限。为安全事件、包、问题等添加显式 `permissions:` 块

- **缺少 if 条件**：任务在所有触发器上运行，除非使用 `if: github.ref == 'refs/heads/main'` 进行保护。防止 PR 意外触发生产部署

- **缺少回滚策略**：部署失败使系统处于损坏状态。实现蓝绿部署或金丝雀部署，在健康检查失败时自动回滚

- **硬编码值**：工作流包含环境特定的 URL、存储桶名称或 API 端点。使用环境变量和 GitHub Secrets

- **缺少超时限制**：任务在网络问题或无限循环时无限期挂起。为所有任务添加 `timeout-minutes: 15`

## 相关技能

- `setup-github-actions-ci` — R 包和基础项目的初始 GitHub Actions 配置
- `commit-changes` — 与 CI/CD 触发器的正确 Git 工作流集成
- `configure-git-repository` — 仓库设置和分支保护规则
- `setup-container-registry` — CI/CD 流水线中的 Docker 镜像构建
- `implement-gitops-workflow` — ArgoCD/Flux 与 CI/CD 的集成
