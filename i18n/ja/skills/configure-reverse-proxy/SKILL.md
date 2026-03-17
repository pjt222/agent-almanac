---
name: configure-reverse-proxy
description: >
  Nginx、Traefik、ShinyProxyを含む複数ツールにまたがるリバースプロキシパターンを設定する。
  WebSocketプロキシ、パスベースおよびホストベースルーティング、SSL終端、Dockerラベル
  自動検出をカバーする。単一エントリポイント背後の複数サービスのルーティング、WebSocket接続
  （Shiny、Socket.IO）のプロキシ、Traefikラベルによるコンテナサービスの自動検出、または
  TLSをネイティブに処理しないサービスへのSSL終端追加に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: multi
  tags: reverse-proxy, traefik, nginx, websocket, routing, shinyproxy, ssl
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
---

# リバースプロキシの設定

Nginx、Traefik、またはShinyProxyを使用してバックエンドサービスへのトラフィックルーティング用リバースプロキシパターンをセットアップする。

## 使用タイミング

- 単一エントリポイント背後の複数サービスのルーティング
- WebSocket接続（Shiny、Socket.IO、ライブリロード）のプロキシ
- Traefikラベルによるコンテナサービスの自動検出
- 異なるバックエンドへのパスベースまたはホストベースルーティング
- TLSを処理しないサービスへのSSL終端追加

## 入力

- **必須**: プロキシ先のバックエンドサービス（host:port）
- **必須**: ルーティング戦略（パスベース、ホストベース、または両方）
- **任意**: プロキシツールの優先（Nginx、Traefik）
- **任意**: ホストベースルーティング用ドメイン名
- **任意**: プロキシするWebSocketエンドポイント

## 手順

### ステップ1: プロキシツールの選択

| 機能 | Nginx | Traefik |
|---------|-------|---------|
| 設定 | 静的ファイル | Dockerラベル / 動的 |
| 自動検出 | なし（手動） | あり（Dockerプロバイダー） |
| Let's Encrypt | certbot経由 | 組み込みACME |
| ダッシュボード | なし（サードパーティ） | 組み込み |
| WebSocket | 手動設定 | 自動 |
| 最適な用途 | 静的設定、高トラフィック | 動的Docker環境 |

### ステップ2: Nginx — パスベースルーティング

```nginx
server {
    listen 80;

    location /api/ {
        proxy_pass http://api:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /app/ {
        proxy_pass http://webapp:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

**注意:** `proxy_pass`の末尾の`/`はlocationプレフィックスを削除する。`location /api/`で`proxy_pass http://api:8000/;`とすると、`/api/users`は`/users`として転送される。

### ステップ3: Nginx — ホストベースルーティング

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://api:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://webapp:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### ステップ4: Nginx — WebSocketプロキシ

WebSocketにはアップグレードヘッダーが必要。Shiny、Socket.IO、ライブリロードに不可欠：

```nginx
location /ws/ {
    proxy_pass http://app:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;
}
```

Shinyアプリ専用：

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    location / {
        proxy_pass http://shiny:3838;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
        proxy_buffering off;
    }
}
```

**期待結果：** WebSocket接続が確立され永続化される。

**失敗時：** `proxy_http_version 1.1`が設定されていることを確認する。`Upgrade`と`Connection`ヘッダーを確認する。

### ステップ5: Traefik — Dockerラベル自動検出

`docker-compose.yml`:

```yaml
services:
  traefik:
    image: traefik:v3.2
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@example.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt

  api:
    image: myapi:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.example.com`)"
      - "traefik.http.routers.api.entrypoints=websecure"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"
      - "traefik.http.services.api.loadbalancer.server.port=8000"

  webapp:
    image: myapp:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.webapp.rule=Host(`app.example.com`)"
      - "traefik.http.routers.webapp.entrypoints=websecure"
      - "traefik.http.routers.webapp.tls.certresolver=letsencrypt"
      - "traefik.http.services.webapp.loadbalancer.server.port=3000"

volumes:
  letsencrypt:
```

**期待結果：** Traefikがラベル経由でサービスを自動検出し、SSL証明書をプロビジョニングする。

### ステップ6: Traefik — ラベルによるパスベースルーティング

```yaml
services:
  api:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`example.com`) && PathPrefix(`/api`)"
      - "traefik.http.routers.api.middlewares=strip-api"
      - "traefik.http.middlewares.strip-api.stripprefix.prefixes=/api"
      - "traefik.http.services.api.loadbalancer.server.port=8000"
```

### ステップ7: Traefik — レート制限とヘッダー

```yaml
labels:
  - "traefik.http.middlewares.ratelimit.ratelimit.average=100"
  - "traefik.http.middlewares.ratelimit.ratelimit.burst=50"
  - "traefik.http.middlewares.security.headers.stsSeconds=63072000"
  - "traefik.http.middlewares.security.headers.contentTypeNosniff=true"
  - "traefik.http.middlewares.security.headers.frameDeny=true"
  - "traefik.http.routers.app.middlewares=ratelimit,security"
```

### ステップ8: プロキシ設定の検証

```bash
# Nginx: 設定テスト
docker compose exec nginx nginx -t

# ルーティングの確認
curl -H "Host: api.example.com" http://localhost/health

# WebSocketの確認（wscatが必要: npm install -g wscat）
wscat -c ws://localhost/ws/

# Traefikダッシュボード（有効な場合）
# http://localhost:8080/dashboard/
```

**期待結果：** リクエストが正しいバックエンドにルーティングされる。WebSocketアップグレードが成功する。

## バリデーション

- [ ] HTTPリクエストがパスまたはホストに基づいて正しいバックエンドにルーティングされる
- [ ] WebSocket接続が確立され維持される
- [ ] SSL終端が動作する（設定時）
- [ ] バックエンドサービスが正しい`Host`、`X-Real-IP`、`X-Forwarded-For`ヘッダーを受信する
- [ ] Traefikがラベル経由で新しいサービスを自動検出する（Traefik使用時）
- [ ] 設定が`docker compose restart`で維持される

## よくある落とし穴

- **末尾スラッシュの不一致**: Nginxで`proxy_pass http://app/`と`http://app`はパスストリッピングの動作が異なる
- **WebSocketタイムアウト**: デフォルトの`proxy_read_timeout`は60秒。長期間のWebSocket接続には`86400`（24時間）が必要
- **Dockerソケットのセキュリティ**: Traefikで`/var/run/docker.sock`をマウントするとフルDockerアクセスを与える。`ro`マウントを使用し、ソケットプロキシを検討する
- **DNS解決**: Nginxは起動時にアップストリームを解決する。動的サービスにはDockerの内部DNS用に`resolver 127.0.0.11`を使用する
- **`proxy_buffering off`の不足**: ShinyおよびSSEエンドポイントにはリアルタイムストリーミングのために`proxy_buffering off`が必要

## 関連スキル

- `configure-nginx` - SSLとセキュリティヘッダーを含む詳細なNginx設定
- `deploy-shinyproxy` - コンテナ化されたShinyアプリホスティング用ShinyProxy
- `setup-compose-stack` - リバースプロキシを使用するcomposeスタック
- `configure-api-gateway` - KongとTraefikによるAPIゲートウェイパターン
