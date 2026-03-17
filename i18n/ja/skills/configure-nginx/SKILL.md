---
name: configure-nginx
description: >
  NginxをWebサーバーおよびリバースプロキシとして設定する。静的ファイル配信、アップストリームサービスへの
  リバースプロキシ、Let's EncryptによるSSL/TLS終端、locationブロック、ロードバランシング、
  レート制限、およびセキュリティヘッダーをカバーする。本番環境での静的ファイル配信、バックエンド
  サービス（Node.js、Python、R/Shiny）へのリバースプロキシ、SSL/TLSの終端、インスタンス間の
  ロードバランシング、またはエンドポイント強化のためのレート制限とセキュリティヘッダーの追加に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: multi
  tags: nginx, reverse-proxy, ssl, tls, lets-encrypt, web-server, security-headers
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
---

# Nginxの設定

SSL終端とセキュリティ強化を備えたWebサーバーおよびリバースプロキシとしてNginxをセットアップする。

## 使用タイミング

- 本番環境での静的ファイル（HTML、CSS、JS）の配信
- バックエンドサービス（Node.js、Python、Go、R/Shiny）へのリバースプロキシ
- Let's Encrypt証明書によるSSL/TLSの終端
- 複数のバックエンドインスタンスへのロードバランシング
- レート制限とセキュリティヘッダーの追加

## 入力

- **必須**: デプロイ先（Dockerコンテナまたはベアメタル）
- **必須**: プロキシ先のバックエンドサービス（host:port）
- **任意**: SSL用ドメイン名
- **任意**: 静的ファイルディレクトリ

## 手順

### ステップ1: 基本リバースプロキシ

`nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

Docker Composeサービス：

```yaml
services:
  nginx:
    image: nginx:1.27-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - app
```

**期待結果：** ポート80へのリクエストがappサービスに転送される。

### ステップ2: 静的ファイル配信

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 6M;
        add_header Cache-Control "public";
    }
}
```

### ステップ3: Let's EncryptによるSSL/TLS

certbotのwebrootメソッドを使用する：

```nginx
server {
    listen 80;
    server_name example.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

certbot付きDocker Compose：

```yaml
services:
  nginx:
    image: nginx:1.27-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - certbot-webroot:/var/www/certbot:ro
      - certbot-certs:/etc/letsencrypt:ro

  certbot:
    image: certbot/certbot
    volumes:
      - certbot-webroot:/var/www/certbot
      - certbot-certs:/etc/letsencrypt

volumes:
  certbot-webroot:
  certbot-certs:
```

初回証明書の取得：

```bash
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d example.com --email admin@example.com --agree-tos
```

**期待結果：** 有効なLet's Encrypt証明書でHTTPSが動作する。

**失敗時：** DNSがサーバーを指していることを確認する。ACMEチャレンジのためにポート80が開いていることを確認する。

### ステップ4: セキュリティヘッダー

```nginx
server {
    # ... 上記のSSL設定 ...

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" always;

    # Nginxバージョンを隠す
    server_tokens off;
}
```

### ステップ5: レート制限

```nginx
http {
    # レート制限ゾーンの定義
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    server {
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
        }

        location /login {
            limit_req zone=login burst=5;
            proxy_pass http://app;
        }
    }
}
```

### ステップ6: ロードバランシング

```nginx
upstream app {
    least_conn;
    server app1:3000;
    server app2:3000;
    server app3:3000 backup;
}
```

| メソッド | ディレクティブ | 動作 |
|--------|-----------|----------|
| ラウンドロビン | （デフォルト） | 均等分配 |
| 最少接続 | `least_conn` | 最も負荷の少ないサーバーにルーティング |
| IPハッシュ | `ip_hash` | スティッキーセッション |
| 重み付き | `server app:3000 weight=3` | 比例配分 |

### ステップ7: 設定のテスト

```bash
# 設定構文のテスト
docker compose exec nginx nginx -t

# ダウンタイムなしでリロード
docker compose exec nginx nginx -s reload

# レスポンスヘッダーの確認
curl -I https://example.com
```

**期待結果：** `nginx -t`が構文OKを報告する。ヘッダーにセキュリティヘッダーが含まれる。

## バリデーション

- [ ] `nginx -t`が設定が有効であると報告する
- [ ] HTTPがHTTPSにリダイレクトされる（SSL有効時）
- [ ] バックエンドサービスがプロキシ経由で到達可能
- [ ] レスポンスにセキュリティヘッダーが存在する
- [ ] 過剰なリクエストでレート制限が発動する
- [ ] SSL Labsテストでa+評価を取得する（公開の場合）

## よくある落とし穴

- **`proxy_set_header Host`の不足**: バックエンドが誤ったHostヘッダーを受信し、バーチャルホストとリダイレクトが壊れる
- **`location`の順序が重要**: Nginxは最も具体的なマッチを使用する。完全一致（`=`）> プレフィックス（`^~`）> 正規表現（`~`）> 一般プレフィックス
- **SSL証明書の更新**: `certbot renew`を実行してNginxをリロードするcronまたはタイマーをセットアップする
- **大きなリクエストボディ**: デフォルトの`client_max_body_size`は1MB。ファイルアップロード用に増やす: `client_max_body_size 50m;`
- **WebSocketプロキシ**: 追加ヘッダーが必要。パターンは`configure-reverse-proxy`を参照

## 関連スキル

- `configure-reverse-proxy` - WebSocketやTraefikを含むマルチツールプロキシパターン
- `setup-compose-stack` - Nginxを含むcomposeスタック
- `deploy-searxng` - SearXNGのフロントエンドとしてNginxを使用
- `configure-ingress-networking` - Kubernetes Ingress（NGINX Ingress Controller）
