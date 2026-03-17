---
name: deploy-searxng
description: >
  Docker Composeを使用してセルフホスト型SearXNGメタ検索エンジンをデプロイする。settings.yml設定、
  エンジン選択、結果プロキシ、Nginxフロントエンド、永続化、および更新をカバーする。トラッキングなしの
  プライベート検索エンジンのセットアップ、複数プロバイダーからの結果集約、チームや組織向けの共有検索
  インスタンスの運用、または単一検索プロバイダーへの依存を排除する際に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: searxng, self-hosted, search-engine, privacy, docker-compose, meta-search
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
---

# SearXNGのデプロイ

Docker ComposeとNginxを使用してセルフホスト型SearXNGメタ検索エンジンをデプロイする。

## 使用タイミング

- プライベートなセルフホスト型検索エンジンのセットアップ
- トラッキングなしで複数検索プロバイダーからの結果を集約
- チームや組織向けの検索インスタンスの運用
- 単一検索プロバイダーへの依存の排除

## 入力

- **必須**: Dockerがインストールされたサーバーまたはマシン
- **任意**: パブリックアクセス用ドメイン名
- **任意**: SSL証明書またはLet's Encryptのセットアップ
- **任意**: カスタムエンジンの設定

## 手順

### ステップ1: プロジェクト構造の作成

```bash
mkdir -p searxng/{config,nginx}
cd searxng
```

### ステップ2: Docker Composeファイルの作成

`docker-compose.yml`:

```yaml
services:
  searxng:
    image: searxng/searxng:latest
    container_name: searxng
    volumes:
      - ./config:/etc/searxng:rw
    environment:
      - SEARXNG_BASE_URL=https://search.example.com/
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETGID
      - SETUID
    restart: unless-stopped
    networks:
      - searxng

  nginx:
    image: nginx:1.27-alpine
    container_name: searxng-nginx
    ports:
      - "8080:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - searxng
    restart: unless-stopped
    networks:
      - searxng

networks:
  searxng:
    driver: bridge
```

### ステップ3: SearXNG設定の構成

`config/settings.yml`:

```yaml
use_default_settings: true

general:
  instance_name: "My SearXNG"
  privacypolicy_url: false
  contact_url: false

search:
  safe_search: 0
  autocomplete: "google"
  default_lang: "en"

server:
  secret_key: "generate-a-random-secret-key-here"
  limiter: true
  image_proxy: true
  port: 8080
  bind_address: "0.0.0.0"

ui:
  static_use_hash: true
  default_theme: simple
  infinite_scroll: true

engines:
  - name: google
    engine: google
    shortcut: g
    disabled: false

  - name: duckduckgo
    engine: duckduckgo
    shortcut: ddg
    disabled: false

  - name: wikipedia
    engine: wikipedia
    shortcut: wp
    disabled: false

  - name: github
    engine: github
    shortcut: gh
    disabled: false

  - name: stackoverflow
    engine: stackoverflow
    shortcut: so
    disabled: false

  - name: arxiv
    engine: arxiv
    shortcut: arx
    disabled: false
```

シークレットキーの生成：

```bash
openssl rand -hex 32
```

### ステップ4: Nginxフロントエンドの設定

`nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;

        location / {
            proxy_pass http://searxng:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Connection "";
            proxy_buffering off;
        }

        location /static/ {
            proxy_pass http://searxng:8080/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### ステップ5: レート制限の設定

`config/limiter.toml`:

```toml
[botdetection.ip_limit]
link_token = true

[botdetection.ip_lists]
block_ip = []
pass_ip = ["127.0.0.1/8", "::1/128"]
pass_searxng_org = false
```

### ステップ6: デプロイと検証

```bash
# スタックの起動
docker compose up -d

# ログの確認
docker compose logs -f searxng

# 動作確認
curl -s http://localhost:8080 | head -5

# 検索テスト
curl -s "http://localhost:8080/search?q=test&format=json" | head -20
```

**期待結果：** SearXNGがNginx経由でポート8080で応答する。検索クエリが集約された結果を返す。

**失敗時：** `docker compose logs searxng`で設定エラーを確認する。`settings.yml`のYAML構文を検証する。

### ステップ7: SSLの追加（本番環境）

パブリックデプロイにはSSL終端を追加する。`docker-compose.yml`を更新する：

```yaml
services:
  nginx:
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx-ssl.conf:/etc/nginx/nginx.conf:ro
      - certbot-certs:/etc/letsencrypt:ro
      - certbot-webroot:/var/www/certbot:ro

  certbot:
    image: certbot/certbot
    volumes:
      - certbot-certs:/etc/letsencrypt
      - certbot-webroot:/var/www/certbot

volumes:
  certbot-certs:
  certbot-webroot:
```

完全なSSL Nginx設定については`configure-nginx`スキルを参照。

### ステップ8: 更新とメンテナンス

```bash
# 最新イメージの取得
docker compose pull searxng

# 新しいイメージで再起動
docker compose up -d

# 設定のバックアップ
cp -r config/ config-backup-$(date +%Y%m%d)/
```

## バリデーション

- [ ] SearXNGがログにエラーなく起動する
- [ ] 検索クエリが設定されたエンジンからの結果を返す
- [ ] イメージプロキシが動作する（画像がSearXNG経由で読み込まれる）
- [ ] レート制限が過剰なリクエストをブロックする
- [ ] 設定がコンテナ再起動間で永続化される
- [ ] Nginxがリクエストを正しくプロキシする

## よくある落とし穴

- **secret_keyの不足**: SearXNGはsettings.ymlに`secret_key`がないと起動を拒否する
- **設定の権限**: SearXNGは設定ディレクトリに書き込む。ボリュームは`:ro`ではなく`:rw`でなければならない
- **エンジンのブロック**: 一部のエンジンがサーバーIPからのリクエストをブロックする場合がある。エンジンをローテーションするかイメージプロキシを使用する
- **YAMLインデント**: `settings.yml`はインデントに敏感。デプロイ前にYAMLリンターで検証する
- **ベースURLの不一致**: `SEARXNG_BASE_URL`はユーザーがアクセスする実際のURLと一致する必要がある（プロトコルと末尾スラッシュを含む）
- **DockerでのDNS解決**: Google/Bingを使用するエンジンにはホストネットワークまたは適切なDNSが必要な場合がある。デフォルトのDocker DNSは通常動作する

## 関連スキル

- `setup-compose-stack` - ここで使用される一般的なDocker Composeパターン
- `configure-nginx` - SSLとセキュリティヘッダー用のNginx設定
- `configure-reverse-proxy` - Nginxフロントエンド用の高度なプロキシパターン
