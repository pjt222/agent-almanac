---
name: deploy-shinyproxy
description: >
  複数のコンテナ化されたShinyアプリケーションをホスティングするためにShinyProxyを
  デプロイする。ShinyProxyのDockerデプロイメント、application.yml設定、Shinyアプリの
  Dockerイメージ、認証、コンテナバックエンド、利用追跡、スケーリングをカバーする。
  単一エントリーポイントで複数のShinyアプリをホスティングする時、アプリごとの認証と
  アクセス制御が必要な時、隔離されたDockerコンテナとしてShinyアプリをデプロイする時、
  利用分析と監査ログを備えた単一アプリデプロイメントを超えるスケーリング時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: shiny
  complexity: advanced
  language: R
  tags: shinyproxy, shiny, docker, deployment, multi-app, authentication, self-hosted
  locale: ja
  source_locale: en
  source_commit: a87e5e0380bbe51f65cb0662d60c10030a81f255
  translator: claude
  translation_date: "2026-03-17"
---

# ShinyProxyのデプロイ

認証と利用追跡を備えた複数のコンテナ化Shinyアプリケーションをホスティングするため、ShinyProxyをデプロイする。

## 使用タイミング

- 単一エントリーポイントで複数のShinyアプリをホスティングする時
- アプリごとの認証とアクセス制御が必要な時
- 隔離されたDockerコンテナとしてShinyアプリをデプロイする時
- 単一アプリデプロイメント（shinyapps.ioやスタンドアロンDocker）を超えてスケーリングする時
- 利用分析と監査ログが必要な時

## 入力

- **必須**: デプロイする1つ以上のShinyアプリ
- **必須**: Dockerがインストールされたサーバー
- **任意**: 認証プロバイダ（LDAP、OpenID、ソーシャル）
- **任意**: ドメイン名とSSL証明書
- **任意**: コンテナオーケストレーター（DockerまたはKubernetes）

## 手順

### ステップ1: ShinyアプリのDockerイメージ作成

各Shinyアプリには独自のDockerイメージが必要。Shinyアプリ用の`Dockerfile`例:

```dockerfile
FROM rocker/shiny:4.5.0

RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

RUN R -e "install.packages(c('shiny', 'bslib', 'DT', 'dplyr'), \
    repos='https://cloud.r-project.org/')"

COPY app/ /srv/shiny-server/app/

RUN chown -R shiny:shiny /srv/shiny-server/app

USER shiny
EXPOSE 3838
CMD ["R", "-e", "shiny::runApp('/srv/shiny-server/app', host='0.0.0.0', port=3838)"]
```

各アプリのビルドとテスト:

```bash
docker build -t myorg/dashboard:latest ./apps/dashboard/
docker run --rm -p 3838:3838 myorg/dashboard:latest
```

**期待結果:** 各Shinyアプリが独自のコンテナで独立して実行される。

### ステップ2: ShinyProxyの設定

`application.yml`:

```yaml
proxy:
  title: "Shiny Applications"
  port: 8080
  container-backend: docker
  docker:
    internal-networking: true
  authentication: simple
  admin-groups: admins

  users:
    - name: admin
      password: admin_password
      groups: admins
    - name: analyst
      password: analyst_password
      groups: users

  specs:
    - id: dashboard
      display-name: "Analytics Dashboard"
      description: "Interactive data analysis dashboard"
      container-image: myorg/dashboard:latest
      container-cmd: ["R", "-e", "shiny::runApp('/srv/shiny-server/app', host='0.0.0.0', port=3838)"]
      container-network: shinyproxy-net
      port: 3838
      access-groups: [admins, users]

    - id: report-builder
      display-name: "Report Builder"
      description: "Generate custom reports"
      container-image: myorg/report-builder:latest
      container-cmd: ["R", "-e", "shiny::runApp('/srv/shiny-server/app', host='0.0.0.0', port=3838)"]
      container-network: shinyproxy-net
      port: 3838
      access-groups: [admins]

logging:
  file:
    name: /opt/shinyproxy/log/shinyproxy.log

server:
  forward-headers-strategy: native
```

### ステップ3: Docker ComposeによるShinyProxyのデプロイ

`docker-compose.yml`:

```yaml
services:
  shinyproxy:
    image: openanalytics/shinyproxy:3.1.1
    container_name: shinyproxy
    ports:
      - "8080:8080"
    volumes:
      - ./application.yml:/opt/shinyproxy/application.yml:ro
      - /var/run/docker.sock:/var/run/docker.sock
      - shinyproxy-logs:/opt/shinyproxy/log
    networks:
      - shinyproxy-net
    restart: unless-stopped

networks:
  shinyproxy-net:
    name: shinyproxy-net
    driver: bridge

volumes:
  shinyproxy-logs:
```

```bash
# Create the network first (ShinyProxy spawns containers on this network)
docker network create shinyproxy-net

# Start ShinyProxy
docker compose up -d

# Check logs
docker compose logs -f shinyproxy
```

**期待結果:** ShinyProxyがポート8080で起動し、ログインページを表示し、設定済みアプリを一覧表示する。

**失敗時:** `docker compose logs shinyproxy`を確認する。アプリイメージがローカルで利用可能か確認する（`docker images`）。

### ステップ4: 認証の設定

#### Simple（組み込み）

ステップ2で示した`authentication: simple`とインラインユーザー。

#### LDAP

```yaml
proxy:
  authentication: ldap
  ldap:
    url: ldap://ldap.example.com:389/dc=example,dc=com
    manager-dn: cn=admin,dc=example,dc=com
    manager-password: ldap_admin_password
    user-search-base: ou=users
    user-search-filter: (uid={0})
    group-search-base: ou=groups
    group-search-filter: (member={0})
```

#### OpenID Connect（Keycloak、Auth0など）

```yaml
proxy:
  authentication: openid
  openid:
    auth-url: https://auth.example.com/realms/myrealm/protocol/openid-connect/auth
    token-url: https://auth.example.com/realms/myrealm/protocol/openid-connect/token
    jwks-url: https://auth.example.com/realms/myrealm/protocol/openid-connect/certs
    client-id: shinyproxy
    client-secret: your_client_secret
    roles-claim: realm_access.roles
```

### ステップ5: Nginxによるリバースプロキシの追加

本番環境では、ShinyProxyの前にNginxを配置する:

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl;
    server_name shiny.example.com;

    ssl_certificate /etc/letsencrypt/live/shiny.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/shiny.example.com/privkey.pem;

    location / {
        proxy_pass http://shinyproxy:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 600s;
        proxy_buffering off;
    }
}
```

WebSocketサポートが重要 — ShinyProxyとShinyはWebSocketを多用する。

### ステップ6: 利用追跡

ShinyProxyはログファイルに利用イベントを記録する。構造化された追跡にはInfluxDBを設定する:

```yaml
proxy:
  usage-stats-url: http://influxdb:8086/write?db=shinyproxy
  usage-stats-username: shinyproxy
  usage-stats-password: stats_password
```

ComposeスタックにInfluxDBを追加する:

```yaml
services:
  influxdb:
    image: influxdb:1.8
    environment:
      INFLUXDB_DB: shinyproxy
      INFLUXDB_ADMIN_USER: admin
      INFLUXDB_ADMIN_PASSWORD: admin_password
    volumes:
      - influxdata:/var/lib/influxdb
    networks:
      - shinyproxy-net

volumes:
  influxdata:
```

### ステップ7: アプリリソース制限

```yaml
specs:
  - id: dashboard
    container-image: myorg/dashboard:latest
    container-memory-limit: 1g
    container-cpu-limit: 1.0
    max-instances: 5
    container-env:
      R_MAX_MEM_SIZE: 768m
```

### ステップ8: デプロイメントの検証

```bash
# Check ShinyProxy health
curl -s http://localhost:8080/actuator/health

# Test login
curl -s -c cookies.txt -d "username=admin&password=admin_password" \
  http://localhost:8080/login

# List apps via API
curl -s -b cookies.txt http://localhost:8080/api/proxyspec
```

**期待結果:** ヘルスエンドポイントが`UP`を返す。ログインが成功する。アプリが隔離されたコンテナで起動する。

## バリデーション

- [ ] ShinyProxyが起動しログインページを表示する
- [ ] すべての設定済みユーザーで認証が機能する
- [ ] 各Shinyアプリが独自のコンテナで起動する
- [ ] WebSocket接続が機能する（Shinyのリアクティビティ機能）
- [ ] アクセスグループがアプリの表示を正しく制限する
- [ ] ユーザー切断時のコンテナクリーンアップが機能する
- [ ] ログが利用イベントをキャプチャする

## よくある落とし穴

- **Dockerソケットの権限**: ShinyProxyはコンテナを起動するためにDockerソケットへのアクセスが必要。`docker`グループのユーザーとして実行するか、ソケットをマウントする
- **ネットワークの不一致**: アプリコンテナはShinyProxyと同じDockerネットワーク上にある必要がある（specsの`container-network`が一致する必要がある）
- **WebSocketプロキシ**: ShinyProxyの前のNginxやその他のプロキシはWebSocketアップグレードヘッダーを転送する必要がある
- **イメージが見つからない**: ShinyProxyが使用を試みる前にアプリイメージがDockerホスト上でプルまたはビルドされている必要がある
- **コンテナクリーンアップ**: ShinyProxyがクラッシュした場合、孤立したアプリコンテナが残る可能性がある。`docker ps`で確認しクリーンアップする
- **メモリ制限**: Shinyアプリは大量のメモリを消費する可能性がある。単一アプリが他を飢えさせないよう`container-memory-limit`を設定する

## 関連スキル

- `deploy-shiny-app` -- shinyapps.io、Posit Connect、またはDockerへの単一アプリデプロイメント
- `configure-reverse-proxy` -- WebSocketプロキシを含むリバースプロキシパターン
- `create-dockerfile` -- アプリイメージ用の一般的なDockerfile作成
- `create-r-dockerfile` -- rockerイメージを使用するR固有のDockerfile
