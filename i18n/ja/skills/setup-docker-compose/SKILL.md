---
name: setup-docker-compose
description: >
  マルチコンテナR開発環境用のDocker Composeを設定する。サービス定義、ボリュームマウント、
  ネットワーキング、環境変数、開発環境と本番環境の設定をカバーする。R以外のサービス
  （データベース、API）と並行してRを実行する場合、再現可能なR開発環境のセットアップ、
  RベースMCPサーバーコンテナのオーケストレーション、またはRプロジェクトの環境変数と
  ボリュームマウント管理に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker-compose, orchestration, development, volumes
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
---

# Docker Composeのセットアップ

R開発およびデプロイ環境用のDocker Composeを設定する。

## 使用タイミング

- R以外のサービス（データベース、API）と並行してRを実行する場合
- 再現可能な開発環境のセットアップ
- RベースMCPサーバーコンテナのオーケストレーション
- 環境変数とボリュームマウントの管理

## 入力

- **必須**: Rサービス用Dockerfile
- **必須**: マウントするプロジェクトディレクトリ
- **任意**: 追加サービス（データベース、キャッシュ、Webサーバー）
- **任意**: 環境変数の設定

## 手順

### ステップ1: docker-compose.ymlの作成

```yaml
version: '3.8'

services:
  r-dev:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: r-dev
    image: r-dev:latest

    volumes:
      - .:/workspace
      - renv-cache:/workspace/renv/cache

    stdin_open: true
    tty: true

    environment:
      - TERM=xterm-256color
      - R_LIBS_USER=/workspace/renv/library
      - RENV_PATHS_CACHE=/workspace/renv/cache

    command: R

    restart: unless-stopped

volumes:
  renv-cache:
    driver: local
```

**期待結果：** Rサービスが定義された`docker-compose.yml`ファイルが存在し、プロジェクトディレクトリとrenvキャッシュのボリュームマウント、Rライブラリパスの環境変数が含まれている。

**失敗時：** YAML構文が無効な場合、`docker compose config`で検証する。インデントにスペース（タブではなく）を使用し、特殊文字を含むすべての文字列値をクォートする。

### ステップ2: 追加サービスの追加（必要な場合）

```yaml
services:
  r-dev:
    # ... 上記と同様
    depends_on:
      - postgres
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432

  postgres:
    image: postgres:16
    container_name: r-postgres
    environment:
      POSTGRES_DB: analysis
      POSTGRES_USER: ruser
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  renv-cache:
  pgdata:
```

**期待結果：** 追加サービス（例: PostgreSQL）が独自のボリューム、環境変数、ポートマッピングで定義されている。Rサービスが新しいサービスを参照する`depends_on`を持っている。

**失敗時：** データベースサービスの起動に失敗した場合、`docker compose logs postgres`で初期化エラーを確認する。`POSTGRES_PASSWORD_FILE`のような環境変数が有効なシークレットを指しているか確認するか、開発環境では`POSTGRES_PASSWORD`に切り替える。

### ステップ3: ネットワークの設定

localhostアクセスが必要なサービス（例: MCPサーバー）の場合：

```yaml
services:
  r-dev:
    network_mode: "host"
```

分離されたネットワーキングの場合：

```yaml
services:
  r-dev:
    networks:
      - app-network
    ports:
      - "3000:3000"

networks:
  app-network:
    driver: bridge
```

**期待結果：** ネットワーキングが適切に設定されている：localhostアクセスが必要なサービス（MCPサーバー）には`host`モード、分離されたサービスには明示的なポートマッピング付きのブリッジネットワーキング。

**失敗時：** サービス間で通信できない場合、同じネットワーク上にあることを確認する。ブリッジネットワーキングでは、ホスト名としてサービス名を使用する（`localhost`ではなく`postgres`など）。ホストモードでは`localhost`を使用し、ポートが競合しないことを確認する。

### ステップ4: 環境変数の管理

`.env`ファイル（git-ignored）を作成する：

```
R_VERSION=4.5.0
GITHUB_PAT=your_token_here
```

composeで参照する：

```yaml
services:
  r-dev:
    build:
      args:
        R_VERSION: ${R_VERSION}
    env_file:
      - .env
```

**期待結果：** プロジェクト固有の変数を含む`.env`ファイル（git-ignored）が存在し、`docker-compose.yml`が`env_file`または変数展開（`${VAR}`）で参照している。

**失敗時：** 変数が解決されない場合、`.env`ファイルが`docker-compose.yml`と同じディレクトリにあることを確認する。`docker compose config`を実行して、すべての変数が展開された解決済みの設定を確認する。

### ステップ5: ビルドと実行

```bash
# イメージのビルド
docker compose build

# サービスの起動
docker compose up -d

# Rセッションにアタッチ
docker compose exec r-dev R

# ログの表示
docker compose logs -f r-dev

# サービスの停止
docker compose down
```

**期待結果：** すべてのサービスが起動する。Rセッションにアクセス可能。

**失敗時：** 起動エラーは`docker compose logs`で確認する。よくある問題: ポートの競合、環境変数の不足。

### ステップ6: 開発用オーバーライドの作成

ローカル開発設定用の`docker-compose.override.yml`を作成する：

```yaml
services:
  r-dev:
    volumes:
      - /path/to/local/packages:/extra-packages
    environment:
      - DEBUG=true
```

これは`docker-compose.yml`と自動的にマージされる。

**期待結果：** 開発固有の設定（追加ボリューム、デバッグフラグ）を含む`docker-compose.override.yml`ファイルが存在し、`docker compose up`実行時に自動的に適用される。

**失敗時：** オーバーライドが反映されない場合、ファイル名が正確に`docker-compose.override.yml`であることを確認する。`docker compose config`を実行してマージを確認する。明示的なオーバーライドファイルの場合は`docker compose -f docker-compose.yml -f custom-override.yml up`を使用する。

## バリデーション

- [ ] `docker compose build`がエラーなく完了する
- [ ] `docker compose up`がすべてのサービスを起動する
- [ ] ボリュームマウントがホストとコンテナ間でファイルを正しく共有する
- [ ] 環境変数がコンテナ内で利用可能
- [ ] サービス間で通信可能
- [ ] `docker compose down`がすべてを正常に停止する

## よくある落とし穴

- **ボリュームマウントの権限**: Linuxコンテナがrootとしてファイルを作成する場合がある。`user:`ディレクティブを使用するか権限を修正する
- **ポートの競合**: ホスト上で同じポートを使用しているサービスがないか確認する
- **Docker Desktop vs CLI**: `docker compose`（v2）と`docker-compose`（v1）。v2を使用する
- **WSLパスマウント**: WSLからWindowsディレクトリをマウントする場合は`/mnt/c/...`パスを使用する
- **名前付きボリューム vs バインドマウント**: 名前付きボリュームはリビルド間で永続化される；バインドマウントはホストの変更を即座に反映する

## 関連スキル

- `create-r-dockerfile` - composeが参照するDockerfileの作成
- `containerize-mcp-server` - MCPサーバー用のcompose設定
- `optimize-docker-build-cache` - composeビルドの高速化
