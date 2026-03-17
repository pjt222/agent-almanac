---
name: deploy-to-vercel
description: >
  Next.jsアプリケーションをVercelにデプロイします。プロジェクトのリンク、
  環境変数、プレビューデプロイメント、カスタムドメイン、本番デプロイメントの
  設定を扱います。Next.jsアプリを初めてデプロイするとき、プルリクエスト用の
  プレビューデプロイメントをセットアップするとき、カスタムドメインを設定するとき、
  またはVercel本番デプロイメントの環境変数を管理するときに使用します。
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
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

# Vercelへのデプロイ

Next.jsアプリケーションを本番設定でVercelにデプロイします。

## 使用タイミング

- Next.jsアプリを初めてデプロイするとき
- プルリクエスト用のプレビューデプロイメントをセットアップするとき
- カスタムドメインを設定するとき
- 本番環境の環境変数を管理するとき

## 入力

- **必須**: ローカルで正常にビルドされるNext.jsアプリケーション
- **必須**: GitHubリポジトリ（推奨）またはローカルプロジェクト
- **オプション**: カスタムドメイン
- **オプション**: 本番用の環境変数

## 手順

### ステップ1: ローカルビルドの確認

```bash
npm run build
```

**期待結果：** ビルドがエラーなしで成功します。

**失敗時：** デプロイ前にビルドエラーを修正してください。よくある原因：TypeScriptエラー、依存関係の不足、無効なインポート。

### ステップ2: Vercel CLIのインストール

```bash
npm install -g vercel
```

**期待結果：** `vercel`コマンドがグローバルに使用可能で、`vercel --version`でインストールされたバージョンが表示されます。

**失敗時：** 権限エラーが発生する場合は`sudo npm install -g vercel`を使用するか、npmをユーザーローカルプレフィックスを使用するように設定してください。`node --version`でNode.jsがインストールされているか確認してください。

### ステップ3: リンクとデプロイ

```bash
# Vercelにログイン
vercel login

# デプロイ（初回：プロジェクトを作成）
vercel

# プロンプトに従う：
# - Set up and deploy? Y
# - Which scope? (アカウントを選択)
# - Link to existing project? N (新規プロジェクトの場合)
# - Project name: my-app
# - Directory: ./
# - Override settings? N
```

**期待結果：** プレビューURLが提供されます（例：`https://my-app-xxx.vercel.app`）。

**失敗時：** `vercel login`が失敗する場合は、インターネット接続を確認してブラウザベースの認証を試してください。デプロイが失敗する場合は、ビルド出力のエラーを確認してください。Vercelはクリーンな環境を使用するため、すべての依存関係が`package.json`に含まれている必要があります。

### ステップ4: 環境変数の設定

```bash
# 環境変数の追加
vercel env add DATABASE_URL production
vercel env add API_KEY production preview

# 環境変数の一覧表示
vercel env ls
```

またはVercelダッシュボード経由で設定：Project Settings > Environment Variables。

**期待結果：** `vercel env ls`が正しい環境（production、preview、development）に設定された必要なすべての環境変数を表示します。

**失敗時：** 変数がランタイムに表示されない場合は、対象環境が一致しているか確認してください（productionとpreview）。変数を追加した後は再デプロイしてください。既存のデプロイメントは新しい変数を自動的に取得しません。

### ステップ5: 本番デプロイ

```bash
vercel --prod
```

**期待結果：** 本番URLが使用可能になります（例：`https://my-app.vercel.app`）。

**失敗時：** `vercel logs`またはVercelダッシュボードでデプロイログを確認してください。よくある問題として、本番環境での環境変数の欠落やローカルセットアップとは異なるビルドコマンドがあります。

### ステップ6: 自動デプロイ用のGitHub接続（推奨）

1. https://vercel.com/new にアクセス
2. GitHubリポジトリをインポート
3. Vercelが自動的にデプロイします：
   - mainへのプッシュ → 本番デプロイメント
   - プルリクエスト → プレビューデプロイメント

**期待結果：** VercelダッシュボードにGitHubリポジトリが接続されて表示され、mainへの以降のプッシュが自動的に本番デプロイメントをトリガーします。

**失敗時：** リポジトリがインポートリストに表示されない場合は、Vercel GitHubアプリがリポジトリへのアクセス権を持っているか確認してください。GitHub Settings > Applications > Vercelでアクセスを許可してください。

### ステップ7: カスタムドメインの設定

```bash
vercel domains add my-domain.com
```

またはダッシュボード経由で：Project Settings > Domains。

Vercelの指示通りにDNSレコードを更新します（通常はCNAMEまたはAレコード）。

**期待結果：** `vercel domains ls`にカスタムドメインが設定済みとして表示され、DNS伝播後（最大48時間）にドメインがVercelデプロイメントに解決されます。

**失敗時：** ドメインに「Invalid Configuration」と表示される場合は、DNSレコードがVercelの指示と完全に一致しているか確認してください。`dig my-domain.com`またはオンラインDNSチェッカーを使用して伝播を確認してください。

### ステップ8: 設定の最適化

高度な設定のために`vercel.json`を作成します：

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

**期待結果：** `vercel.json`がプロジェクトルートに保存され、次のデプロイメントで設定が反映されます（Vercelダッシュボードのビルドログで確認可能）。

**失敗時：** 設定が無視される場合は、`jq . vercel.json`で`vercel.json`が有効なJSONであるか確認してください。一部の設定が`next.config.ts`に移動している可能性があるため、お使いのフレームワークバージョンのVercelドキュメントを確認してください。

## バリデーション

- [ ] `npm run build`がローカルで成功する
- [ ] プレビューデプロイメントが機能してアクセス可能
- [ ] 本番デプロイメントがアプリケーションを正しく提供する
- [ ] 本番環境で環境変数が使用可能
- [ ] カスタムドメインが解決される（設定した場合）
- [ ] GitHubインテグレーションがプッシュ時にデプロイをトリガーする

## よくある落とし穴

- **Vercelでビルド失敗するがローカルでは成功する**: Vercelはクリーンな環境を使用します。すべての依存関係が`package.json`に含まれており、グローバルにインストールされているだけでないことを確認してください。
- **環境変数の欠落**: 変数は`.env.local`だけでなくVercelにも追加する必要があります。環境（production、preview、development）ごとに変数セットが分かれています。
- **Node.jsバージョンの不一致**: Project SettingsまたはNode.jsのバージョンを`package.json`の`engines`フィールドに設定してください。
- **大きなデプロイメント**: Vercelにはサイズ制限があります。`.vercelignore`を使用して不要なファイルを除外してください。
- **APIルートのタイムアウト**: VercelサーバーレスファンクションはHobbyプランで10秒のタイムアウトがあります。最適化するかアップグレードしてください。

## 関連スキル

- `scaffold-nextjs-app` - デプロイするアプリの作成
- `setup-tailwind-typescript` - デプロイ前のスタイリング設定
- `configure-git-repository` - 自動デプロイインテグレーション用のGitセットアップ
