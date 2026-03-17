---
name: build-ci-cd-pipeline
description: >
  GitHub Actionsを使用して、マトリクスビルド、依存関係キャッシュ、アーティファクト管理、
  シークレット処理を含む多段階CI/CDパイプラインを設計・実装します。リント、テスト、
  ビルド、デプロイのステージを並列実行と条件付きロジックで連携させたワークフローを
  作成します。新規プロジェクトへの自動テスト・デプロイのセットアップ、JenkinsやCircleCIからの
  移行、プラットフォーム間マトリクスビルドの実装、ビルドキャッシュの追加、またはセキュリティ
  スキャンと品質ゲートを含む多段階パイプラインの構築に使用します。
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: "2026-03-16"
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

# CI/CDパイプラインの構築

GitHub Actionsを使用して、本番レベルの継続的インテグレーション・デプロイメントパイプラインを設計・実装します。

## 使用タイミング

- 新規プロジェクトへの自動テストとデプロイのセットアップ
- Jenkins、Travis CI、またはCircleCIからGitHub Actionsへの移行
- 複数プラットフォームや言語バージョンにわたるマトリクスビルドの実装
- ビルドキャッシュを追加してCI/CD実行時間を短縮
- 環境別デプロイメントを含む多段階パイプラインの作成
- セキュリティスキャンとコード品質ゲートの実装

## 入力

- **必須**: テスト・ビルド・デプロイ対象のコードを含むリポジトリ
- **必須**: GitHub Actionsワークフローディレクトリ（`.github/workflows/`）
- **任意**: デプロイターゲット用シークレット（AWS、Azure、Dockerレジストリ）
- **任意**: 特殊ビルド向けセルフホステッドランナー設定
- **任意**: ブランチ保護ルールと必須ステータスチェック

## 手順

### ステップ1: 基本ワークフロー構造の作成

トリガー設定と基本ジョブ構造を含む `.github/workflows/ci.yml` を作成します。

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

**期待結果：** ワークフローファイルが正しいYAML構文で作成され、トリガーが設定され、基本的なlintジョブが定義されること。

**失敗時：** `yamllint .github/workflows/ci.yml` でYAML構文を検証します。インデント（タブではなくスペースを使用）を確認します。GitHub Marketplaceでアクションバージョンが最新であることを確認します。

### ステップ2: マトリクスビルド戦略の実装

複数のプラットフォーム、言語バージョン、または設定でテストするためのマトリクスビルドを追加します。

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

**期待結果：** マトリクスが8つの並列ジョブを生成します（3 OS × 3 Nodeバージョン - 1除外）。すべてのテストがプラットフォームをまたいでパスします。カバレッジレポートが単一の標準ジョブからアップロードされます。

**失敗時：** マトリクス構文エラーが発生した場合、適切なインデントと配列表記を確認します。不安定なテストには `uses: nick-invision/retry@v2` でリトライロジックを追加します。プラットフォーム固有の失敗には、OS条件を追加するか除外を拡張します。

### ステップ3: 依存関係キャッシュとアーティファクト管理の設定

インテリジェントキャッシュでビルド速度を最適化し、ビルドアーティファクトを保存します。

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

**期待結果：** 初回実行は依存関係をダウンロードし（低速）、以降の実行はキャッシュから復元されます（高速）。ビルドアーティファクトがSHAベースの一意な名前で正常にアップロードされます。

**失敗時：** キャッシュが頻繁にミスする場合、キャッシュキーに関連するすべてのファイルハッシュが含まれているか確認します。アップロード失敗の場合、パスが存在しグロブパターンが実際のビルド出力に一致することを確認します。`retention-days` が組織のポリシーに適合していることを確認します。

### ステップ4: セキュリティスキャンと品質ゲートの実装

セキュリティ脆弱性スキャンとコード品質強制を追加します。

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

**期待結果：** セキュリティスキャンが完了し、結果がGitHubセキュリティタブにアップロードされます。ブランチ保護が設定されている場合、クリティカルな脆弱性はマージをブロックします。コミットでシークレットが検出されません。

**失敗時：** 誤検知に対しては、CVE IDと理由を含む `.trivyignore` ファイルを作成します。監査失敗の場合、`npm audit fix` の提案を確認します。シークレット検出の誤検知には、`.trufflehog.yml` の除外リストにパターンを追加します。

### ステップ5: 環境別デプロイメントの設定

環境保護ルールと承認ゲートを含むデプロイメントステージをセットアップします。

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

**期待結果：** ステージングはdevelopブランチに自動デプロイされます。本番は手動承認が必要です（GitHubのEnvironment設定で構成）。CloudFrontの無効化がCDNキャッシュをクリアします。タグ付きコミットにリリースが作成されます。

**失敗時：** AWSクレデンシャルエラーの場合、OIDCトラスト関係が `role-to-assume` を許可していることを確認します。S3同期失敗の場合、バケットポリシーとIAMパーミッションを確認します。環境承認の問題は、Settings > Environmentsで保護ルールを確認します。

### ステップ6: 通知とモニタリング統合の追加

Slack通知、デプロイ追跡、パフォーマンスモニタリングを統合します。

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

**期待結果：** Slackがデプロイメントステータス、リポジトリ詳細、クリック可能なワークフローリンクを含むフォーマット済み通知を受信します。本番デプロイメント成功時に適切なタグ付きでDatadogイベントが記録されます。

**失敗時：** Slack失敗の場合、Webhook URLが有効でワークスペースがIncoming Webhookを許可していることを確認します。`curl -X POST $SLACK_WEBHOOK_URL -d '{"text":"test"}'` でテストします。Datadog失敗の場合、APIキーがイベント送信権限を持つことを確認します。

## バリデーション

- [ ] ワークフロー構文が `yamllint` またはGitHubのワークフローエディタで検証される
- [ ] すべてのジョブに実行順制御のための明示的な依存関係（`needs:`）がある
- [ ] マトリクスビルドがすべてのターゲットプラットフォームとバージョンをカバーする
- [ ] キャッシュにより以降の実行でビルド時間が50%超短縮される
- [ ] シークレットがGitHub Secretsに保存され、ワークフローファイルにハードコードされていない
- [ ] セキュリティスキャンがGitHubセキュリティタブに結果をアップロードする
- [ ] 環境保護ルールが本番デプロイメントに承認を要求する
- [ ] デプロイメント失敗でシステムが不整合な状態に陥らない
- [ ] 通知が適切なチャンネル（Slack、メール、モニタリングツール）に届く
- [ ] 典型的な変更でワークフローが10分以内に完了する

## よくある落とし穴

- **キャッシュキーが広すぎる**: `${{ runner.os }}-build-` をキャッシュキーとして使用すると、依存関係変更時に誤ったヒットが発生します。キーに `hashFiles('**/package-lock.json')` を含めてください。

- **アーティファクト名の衝突**: `dist` のような静的アーティファクト名は並行ビルドで上書きを引き起こします。名前に `${{ github.sha }}` または `${{ matrix.os }}-${{ matrix.node }}` を含めてください。

- **ログへのシークレット漏洩**: `echo $SECRET` などのコマンドは避けてください。GitHubは登録済みシークレットをマスクしますが、派生値は漏洩する可能性があります。動的シークレットには `::add-mask::` を使用してください。

- **不十分なパーミッション**: デフォルトの `GITHUB_TOKEN` は限られたパーミッションを持ちます。セキュリティイベント、パッケージ、イシューなどに明示的な `permissions:` ブロックを追加してください。

- **if条件の不足**: `if: github.ref == 'refs/heads/main'` で保護しない限り、ジョブはすべてのトリガーで実行されます。PRからの誤った本番デプロイを防いでください。

- **ロールバック戦略がない**: デプロイメント失敗でシステムが壊れた状態になります。ヘルスチェック失敗時の自動ロールバックを含むブルーグリーンまたはカナリアデプロイメントを実装してください。

- **ハードコードされた値**: ワークフローに環境固有のURL、バケット名、またはAPIエンドポイントが含まれています。環境変数とGitHub Secretsを使用してください。

- **タイムアウト制限なし**: ネットワーク問題や無限ループでジョブが無期限にハングします。すべてのジョブに `timeout-minutes: 15` を追加してください。

## 関連スキル

- `setup-github-actions-ci` - Rパッケージと基本プロジェクト向けの初期GitHub Actions設定
- `commit-changes` - CI/CDトリガーと連携した適切なGitワークフロー
- `configure-git-repository` - リポジトリ設定とブランチ保護ルール
- `setup-container-registry` - CI/CDパイプラインにおけるDockerイメージビルド
- `implement-gitops-workflow` - ArgoCD/FluxとCI/CDの統合
