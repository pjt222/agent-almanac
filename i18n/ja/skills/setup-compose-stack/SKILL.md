---
name: setup-compose-stack
description: >
  一般的なアプリケーションパターン用のDocker Composeスタックを設定する。Webアプリ + データベース +
  キャッシュ + ワーカーサービス、名前付きボリューム、ネットワーク、ヘルスチェック、depends_on、
  環境管理、およびプロファイルをカバーする。データベースやキャッシュを伴うWebアプリの実行、
  複数サービスの開発環境のセットアップ、APIと並行したバックグラウンドワーカーのオーケストレーション、
  またはチーム間で再現可能なマルチサービス環境の構築に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker-compose, orchestration, postgres, redis, multi-service, health-checks
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
---

# Composeスタックのセットアップ

データベース、キャッシュ、ワーカーを含むマルチサービスアプリケーションスタック用のDocker Composeを設定する。

## 使用タイミング

- データベースやキャッシュを伴うWebアプリの実行
- 複数サービスの開発環境のセットアップ
- APIと並行したバックグラウンドワーカーのオーケストレーション
- チーム間で再現可能なマルチサービス環境が必要な場合

## 入力

- **必須**: アプリケーションサービス（言語、ポート、エントリポイント）
- **必須**: 必要なサポートサービス（データベース、キャッシュ、キューなど）
- **任意**: 開発 vs 本番の設定
- **任意**: カスタムサービス用の既存Dockerfile

## 手順

### ステップ1: コアスタックの定義

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://appuser:apppass@postgres:5432/appdb
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: apppass
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d appdb"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

**期待結果：** `docker compose up`でアプリがデータベースの正常起動を待ってからすべてのサービスが起動する。

### ステップ2: ヘルスチェックの追加

ヘルスチェックにより`depends_on`で`condition: service_healthy`が使用可能になる：

```yaml
services:
  postgres:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d appdb"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s
```

### ステップ3: ネットワークの設定

```yaml
services:
  app:
    networks:
      - frontend
      - backend

  postgres:
    networks:
      - backend

  nginx:
    networks:
      - frontend
    ports:
      - "80:80"

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
```

これによりデータベースが直接外部アクセスから分離され、アプリが両方のネットワークをブリッジする。

### ステップ4: 環境変数の管理

`.env`ファイル（git-ignored）を作成する：

```
POSTGRES_PASSWORD=secure_password_here
APP_SECRET=your_secret_key
```

composeで参照する：

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  app:
    env_file:
      - .env
```

`.env.example`（gitにコミット）を作成する：

```
POSTGRES_PASSWORD=changeme
APP_SECRET=changeme
```

### ステップ5: ワーカーサービスの追加

```yaml
services:
  worker:
    build:
      context: .
      dockerfile: Dockerfile
    command: ["node", "src/worker.js"]
    environment:
      DATABASE_URL: postgres://appuser:apppass@postgres:5432/appdb
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    deploy:
      replicas: 2
```

### ステップ6: オプションサービスにプロファイルを使用

```yaml
services:
  app:
    # 常に起動する
    build: .

  mailhog:
    image: mailhog/mailhog
    ports:
      - "8025:8025"
    profiles:
      - dev

  adminer:
    image: adminer
    ports:
      - "8080:8080"
    profiles:
      - dev
```

```bash
# コアサービスのみ起動
docker compose up

# 開発ツール付きで起動
docker compose --profile dev up
```

### ステップ7: 開発用オーバーライドの作成

`docker-compose.override.yml`は自動的にマージされる：

```yaml
services:
  app:
    build:
      target: dev
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      NODE_ENV: development
      DEBUG: "app:*"
    command: ["npm", "run", "dev"]
```

### ステップ8: ビルドと実行

```bash
# すべてのイメージをビルド
docker compose build

# バックグラウンドで起動
docker compose up -d

# ログの表示
docker compose logs -f app

# サービスステータスの確認
docker compose ps

# 停止と削除
docker compose down

# 停止とボリューム削除（完全リセット）
docker compose down -v
```

**期待結果：** すべてのサービスが起動し、ヘルスチェックが通り、アプリがデータベースとキャッシュに接続する。

**失敗時：** `docker compose logs <service>`を確認する。よくある問題: ポートの競合、環境変数の不足、ヘルスチェックのタイムアウト。

## バリデーション

- [ ] `docker compose up`がエラーなくすべてのサービスを起動する
- [ ] データベースとキャッシュのヘルスチェックが通る
- [ ] アプリケーションがすべての依存サービスに接続する
- [ ] 名前付きボリュームが再起動間でデータを永続化する
- [ ] `.env`がgit-ignoredされ、`.env.example`がコミットされている
- [ ] `docker compose down`がすべてを正常に停止する
- [ ] プロファイルが開発ツールと本番サービスを分離する

## よくある落とし穴

- **ヘルスチェックなし**: `condition: service_healthy`なしの`depends_on`はコンテナの起動のみを待ち、準備完了は待たない
- **composeにハードコードされたパスワード**: `.env`ファイルまたはDockerシークレットを使用する。パスワードをコミットしない
- **ボリュームマウントの上書き**: `.:/app`のマウントがイメージ内でビルドされた`node_modules`を上書きする。匿名ボリュームを使用する: `/app/node_modules`
- **ポートの競合**: `docker compose ps`と`lsof -i :<port>`で競合を確認する
- **`version:`キー**: Compose V2は`version:`キーを無視する。最新のセットアップでは省略する
- **WSLパスの問題**: WSLからWindowsディレクトリをマウントする場合は`/mnt/c/...`パスを使用する

## 関連スキル

- `setup-docker-compose` - R固有のDocker Compose設定
- `create-dockerfile` - composeが参照するDockerfileの作成
- `create-multistage-dockerfile` - スタック用に最適化されたイメージのビルド
- `configure-nginx` - スタックにNginxリバースプロキシを追加
