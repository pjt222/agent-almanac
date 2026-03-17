---
name: setup-tailwind-typescript
description: >
  Next.jsまたはReactプロジェクトでTailwind CSSとTypeScriptを設定します。
  インストール、設定、カスタムテーマの拡張、コンポーネントパターン、
  型安全なスタイリングユーティリティを扱います。既存のTypeScriptプロジェクトに
  Tailwind CSSを追加するとき、プロジェクトのデザインシステム向けにTailwind
  テーマをカスタマイズするとき、型安全なコンポーネントスタイリングパターンを
  セットアップするとき、またはTailwindプラグインや拡張機能を設定するときに使用します。
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
  tags: tailwind, typescript, css, styling, configuration
---

# TypeScriptでTailwind CSSをセットアップ

カスタムテーマ、ユーティリティ、型安全なパターンを持つTypeScriptプロジェクトにTailwind CSSを設定します。

## 使用タイミング

- 既存のTypeScriptプロジェクトにTailwind CSSを追加するとき
- プロジェクトのデザインシステム向けにTailwindテーマをカスタマイズするとき
- 型安全なコンポーネントスタイリングパターンをセットアップするとき
- Tailwindプラグインや拡張機能を設定するとき

## 入力

- **必須**: TypeScriptプロジェクト（Next.js、Vite、またはスタンドアロンReact）
- **オプション**: デザインシステムトークン（色、スペーシング、フォント）
- **オプション**: 含めるTailwindプラグイン

## 手順

### ステップ1: Tailwind CSSのインストール

```bash
npm install -D tailwindcss @tailwindcss/postcss postcss
```

Next.jsの場合（まだ含まれていない場合）：

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**期待結果：** `tailwindcss`、`postcss`、`autoprefixer`が開発依存関係としてインストールされます。Next.jsの場合、`npx tailwindcss init -p`により`tailwind.config.ts`と`postcss.config.js`が生成されます。

**失敗時：** `npx tailwindcss init`が失敗する場合は、まず`npm install -D tailwindcss`でTailwindをインストールして再試行してください。モノリポを使用している場合は、ワークスペースのルートではなくアプリのルートディレクトリからコマンドを実行してください。

### ステップ2: tailwind.config.tsの設定

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a5f",
        },
        secondary: {
          500: "#6366f1",
          600: "#4f46e5",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
    },
  },
  plugins: [],
};

export default config;
```

**期待結果：** `tailwind.config.ts`の`content`配列がプロジェクトのファイル位置と一致し、`theme.extend`にカスタム色とフォントが設定され、`Config`インポートで適切なTypeScript型付けがされています。

**失敗時：** カスタムクラスがレンダリングされない場合は、`content`パスが実際のディレクトリ構造と一致するか確認してください。パスはプロジェクトルートからの相対的なglobパターンです。パスが欠けている場合、Tailwindはそれらのファイルのクラス使用をスキャンしません。

### ステップ3: グローバルスタイルのセットアップ

`src/app/globals.css`を編集します：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply antialiased;
  }

  body {
    @apply bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white px-4 py-2 rounded-lg
           hover:bg-primary-700 focus:outline-none focus:ring-2
           focus:ring-primary-500 focus:ring-offset-2
           transition-colors duration-200;
  }
}
```

**期待結果：** `globals.css`に3つのTailwindディレクティブ（`@tailwind base`、`@tailwind components`、`@tailwind utilities`）とカスタムベースおよびコンポーネントレイヤースタイルが含まれています。ファイルはルートレイアウトでインポートされています。

**失敗時：** スタイルが適用されない場合は、`globals.css`が`layout.tsx`（またはPages Routerの`_app.tsx`）でインポートされているか確認してください。Tailwindディレクティブが存在し、コメントアウトされていないことを確認してください。

### ステップ4: 型安全なユーティリティヘルパーの作成

`src/lib/cn.ts`を作成します：

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

依存関係のインストール：

```bash
npm install clsx tailwind-merge
```

コンポーネントでの使用：

```tsx
import { cn } from "@/lib/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-colors",
        variant === "primary" && "bg-primary-600 text-white hover:bg-primary-700",
        variant === "secondary" && "bg-secondary-500 text-white hover:bg-secondary-600",
        variant === "outline" && "border border-gray-300 hover:bg-gray-50",
        className
      )}
      {...props}
    />
  );
}
```

**期待結果：** `src/lib/cn.ts`が`cn()`関数をエクスポートします。`clsx`と`tailwind-merge`が依存関係としてインストールされています。コンポーネントが`cn()`を使って競合なしにクラス名をマージします。

**失敗時：** `clsx`または`tailwind-merge`が見つからない場合は`npm install clsx tailwind-merge`を実行してください。TypeScriptが`cn.ts`で型エラーを報告する場合は、`ClassValue`型が`clsx`からインポートされているか確認してください。

### ステップ5: ダークモードサポートの追加

`tailwind.config.ts`を更新します：

```typescript
const config: Config = {
  darkMode: "class", // システム設定の場合は"media"
  // ... 残りの設定
};
```

トグルの実装：

```tsx
"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <button onClick={() => setDark(!dark)}>
      {dark ? "Light" : "Dark"} Mode
    </button>
  );
}
```

**期待結果：** ダークモードがライトとダークテーマ間で正しく切り替わります。`dark`クラスが`<html>`要素に適用され、`dark:`プレフィックス付きのユーティリティクラスが反応します。

**失敗時：** ダークモードが切り替わらない場合は、`tailwind.config.ts`に`darkMode: "class"`が設定されているか確認してください。`dark`クラスが`<body>`ではなく`<html>`要素に切り替えられていることを確認してください。システム設定モードの場合は`darkMode: "media"`を使用してください。

### ステップ6: プラグインの追加（オプション）

```bash
npm install -D @tailwindcss/typography @tailwindcss/forms
```

```typescript
// tailwind.config.ts
import typography from "@tailwindcss/typography";
import forms from "@tailwindcss/forms";

const config: Config = {
  // ...
  plugins: [typography, forms],
};
```

**期待結果：** プラグインが開発依存関係としてインストールされ、`tailwind.config.ts`の`plugins`配列に登録されています。プラグインが提供するクラス（typographyからの`prose`、formsからのスタイル付きフォーム要素など）がコンポーネントで使用可能です。

**失敗時：** プラグインクラスがレンダリングされない場合は、プラグインがインストールされ（`npm ls @tailwindcss/typography`）、`plugins`配列に追加されているか確認してください。設定変更後は開発サーバーを再起動してください。

## バリデーション

- [ ] Tailwindクラスがブラウザで正しくレンダリングされる
- [ ] カスタムテーマ値（色、フォント、スペーシング）が機能する
- [ ] `cn()`ユーティリティが競合なしにクラスをマージする
- [ ] ダークモードが正しく切り替わる
- [ ] TypeScriptが設定やコンポーネントでエラーを表示しない
- [ ] 本番ビルドで未使用のスタイルが削除される

## よくある落とし穴

- **コンテンツパスの欠落**: クラスがレンダリングされない場合は、設定の`content`配列がファイルの場所と一致するか確認してください
- **クラスの競合**: 競合するユーティリティクラスを防ぐために`tailwind-merge`（`cn()`経由）を使用してください
- **カスタム値が機能しない**: カスタム値が（デフォルトを置き換える）テーマルートではなく`extend`の下にあることを確認してください
- **ダークモードが切り替わらない**: `darkMode`設定と`dark`クラスが`<body>`ではなく`<html>`にあることを確認してください

## 関連スキル

- `scaffold-nextjs-app` - Tailwind設定前のプロジェクトセットアップ
- `deploy-to-vercel` - スタイル付きアプリケーションのデプロイ
