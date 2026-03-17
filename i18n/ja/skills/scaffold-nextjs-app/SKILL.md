---
name: scaffold-nextjs-app
description: >
  App Router、TypeScript、モダンなデフォルト設定で新しいNext.jsアプリケーションを
  スキャフォールドします。プロジェクト作成、ディレクトリ構造、ルーティング設定、
  初期設定を扱います。新しいWebアプリケーションプロジェクトを開始するとき、
  サーバーサイドレンダリングを持つReactベースのフロントエンドを作成するとき、
  APIルートを持つフルスタックアプリケーションを構築するとき、またはTypeScript
  Webプロジェクトをゼロからセットアップするときに使用します。
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
  tags: nextjs, react, typescript, app-router, scaffold
---

# Next.jsアプリのスキャフォールド

App Router、TypeScript、本番環境対応のデフォルト設定で新しいNext.jsアプリケーションを作成します。

## 使用タイミング

- 新しいWebアプリケーションプロジェクトを開始するとき
- サーバーサイドレンダリングを持つReactベースのフロントエンドを作成するとき
- APIルートを持つフルスタックアプリケーションを構築するとき
- TypeScript Webプロジェクトをセットアップするとき

## 入力

- **必須**: アプリケーション名
- **必須**: パッケージマネージャーの選択（npm、yarn、pnpm）
- **オプション**: Tailwind CSSを含めるか（デフォルト：あり）
- **オプション**: ESLintを含めるか（デフォルト：あり）
- **オプション**: src/ディレクトリ構造（デフォルト：あり）

## 手順

### ステップ1: プロジェクトの作成

```bash
npx create-next-app@latest my-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

プロンプトに答えるか、フラグを使ってすべてのオプションを非対話式に設定します。

**期待結果：** プロジェクトディレクトリが作成され、すべての依存関係がインストールされます。

**失敗時：** Node.jsのバージョンを確認してください（`node --version`、18.17以上が必要）。`npx`が使用可能であることを確認してください。プロンプトでコマンドが止まる場合は、`--use-npm`フラグ（または`--use-pnpm`/`--use-yarn`）を追加してパッケージマネージャープロンプトをスキップしてください。

### ステップ2: プロジェクト構造の確認

```
my-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # ルートレイアウト
│   │   ├── page.tsx          # ホームページ
│   │   ├── globals.css       # グローバルスタイル
│   │   └── favicon.ico
│   └── lib/                  # 共有ユーティリティ（手動で作成）
├── public/                   # 静的アセット
├── next.config.ts            # Next.js設定
├── tailwind.config.ts        # Tailwind設定
├── tsconfig.json             # TypeScript設定
├── package.json
└── .eslintrc.json
```

**期待結果：** 一覧に記載されたすべてのディレクトリとファイルが存在します。

**失敗時：** `src/`ディレクトリが存在しない場合、`--src-dir`フラグが渡されていません。`create-next-app`をフラグ付きで再実行するか、ファイルを手動で`src/app/`に移動してください。

### ステップ3: Next.jsの設定

プロジェクトのニーズに合わせて`next.config.ts`を編集します：

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Reactストリクトモードを有効にする
  reactStrictMode: true,

  // 画像最適化ドメイン
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
      },
    ],
  },
};

export default nextConfig;
```

**期待結果：** `next.config.ts`がTypeScriptエラーなしで保存されます。

**失敗時：** ファイルが`.ts`ではなく`.js`拡張子を使っている場合、名前を変更してください。`NextConfig`型が`"next"`からインポートされていることを確認してください。

### ステップ4: ディレクトリ規則のセットアップ

共通ディレクトリを作成します：

```bash
mkdir -p src/app/api
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/types
```

**期待結果：** `src/`の下に4つのディレクトリがすべて作成されます。

**失敗時：** `src/`が存在しない場合は先に作成するか、プロジェクト構造（srcを使わないレイアウトはルートに`app/`を使用）に合わせてパスを調整してください。

### ステップ5: ベースレイアウトの作成

`src/app/layout.tsx`を編集します：

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Application",
  description: "Application description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

**期待結果：** レイアウトがInterフォントでレンダリングされ、すべてのページを包みます。

**失敗時：** フォントの読み込みが失敗する場合は、ネットワークアクセスを確認してください。一時的な回避策としてシステムフォントフォールバックに`Inter`を置き換えてください。

### ステップ6: サンプルAPIルートの追加

`src/app/api/health/route.ts`を作成します：

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
```

**期待結果：** `src/app/api/health/route.ts`にファイルが作成されます。

**失敗時：** `api/health/`ディレクトリが存在することを確認してください。ファイルはデフォルトエクスポートではなく、名前付きHTTPメソッドハンドラー（`GET`、`POST`など）をエクスポートする必要があります。

### ステップ7: 開発サーバーの起動

```bash
cd my-app
npm run dev
```

**期待結果：** アプリケーションがhttp://localhost:3000で起動します。

**失敗時：** Node.jsのバージョンを確認してください（18.17以上）。依存関係が見つからない場合は`npm install`を実行してください。

## バリデーション

- [ ] `npm run dev`がエラーなしで起動する
- [ ] localhost:3000でホームページが読み込まれる
- [ ] TypeScriptコンパイルが成功する
- [ ] Tailwind CSSクラスが適用されている
- [ ] APIルートが/api/healthで応答する
- [ ] ESLintがエラーなしで実行される（`npm run lint`）

## よくある落とし穴

- **Node.jsバージョン**: Next.jsはNode.js 18.17以上が必要です。`node --version`で確認してください。
- **ポートの競合**: デフォルトポート3000が使用中の場合があります。`npm run dev -- -p 3001`を使用してください。
- **インポートエイリアスの混乱**: `@/*`は`src/*`にマップされます。node_modulesのインポートと混同しないでください。
- **Pages対App Router**: App Router（`src/app/`）を使用していることを確認し、Pages Router（`src/pages/`）ではないことを確認してください。

## 関連スキル

- `setup-tailwind-typescript` - TailwindとTypeScriptの詳細な設定
- `deploy-to-vercel` - スキャフォールドしたアプリのデプロイ
- `configure-git-repository` - バージョン管理のセットアップ
