---
name: configure-ingress-networking
description: >
  NGINXイングレスコントローラー、自動TLS証明書管理のためのcert-manager、
  パスベースルーティング、レート制限、SSLターミネーションとロードバランシングによる
  マルチドメインホスティングでKubernetes Ingressネットワークを設定します。
  単一のロードバランサーで複数のKubernetesサービスを公開する場合、パスベースまたは
  ホストベースのルーティングを実装する場合、Let's EncryptでTLS証明書を自動発行する場合、
  またはトラフィック分割によるブルーグリーンやカナリアデプロイをセットアップする場合に使用します。
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
  tags: ingress, nginx, cert-manager, tls, networking
---

# Ingressネットワークの設定

NGINXコントローラー、自動TLS証明書、および高度なルーティング機能を備えた本番グレードのKubernetes Ingressをセットアップします。

## 使用タイミング

- 単一のロードバランサーで複数のKubernetesサービスを公開
- マイクロサービスのパスベースまたはホストベースのルーティングを実装
- Let's EncryptでTLS証明書の発行と更新を自動化
- レート制限、認証、WAFポリシーを実装
- トラフィック分割によるブルーグリーンまたはカナリアデプロイをセットアップ
- カスタムエラーページとリクエスト/レスポンス変換を設定

## 入力

- **必須**: LoadBalancerサポートまたはMetalLBを持つKubernetesクラスター
- **必須**: クラスターのLoadBalancer IPを指すDNSレコード
- **任意**: 既存のTLS証明書またはLet's Encryptアカウント
- **任意**: 認証用のOAuth2プロバイダー
- **任意**: WAFルール（ModSecurity）
- **任意**: メトリクス収集用のPrometheus

## 手順

> 完全な設定ファイルとテンプレートについては[拡張例](references/EXAMPLES.md)を参照してください。


### ステップ1: NGINX Ingressコントローラーのインストール

HelmでNGINX Ingressコントローラーをデプロイし、クラウドプロバイダー統合を設定します。

```bash
# NGINX Ingress HelmリポジトリをAdd
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Namespaceの作成
kubectl create namespace ingress-nginx

# クラウドプロバイダー向けインストール（AWS、GCP、Azure）
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.service.type=LoadBalancer \
  --set controller.metrics.enabled=true \
  --set controller.metrics.serviceMonitor.enabled=true \
  --set controller.podAnnotations."prometheus\.io/scrape"=true \
  --set controller.podAnnotations."prometheus\.io/port"=10254

# またはベアメタル向けNodePortでインストール
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.service.type=NodePort \
  --set controller.service.nodePorts.http=30080 \
  --set controller.service.nodePorts.https=30443

# AWS NLBを使用した設定
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-type"=nlb \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-backend-protocol"=tcp \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-cross-zone-load-balancing-enabled"=true

# インストールの確認
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx

# LoadBalancerの外部IPを待機
kubectl get svc ingress-nginx-controller -n ingress-nginx -w

# 外部IP/ホスト名の取得
INGRESS_IP=$(kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
INGRESS_HOST=$(kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

echo "Ingress IP: $INGRESS_IP"
echo "Ingress Hostname: $INGRESS_HOST"

# コントローラーのテスト
curl http://$INGRESS_IP
# 404が返される（バックエンドがまだ設定されていない）
```

**期待結果：** NGINX IngressコントローラーのPodがingress-nginx Namespaceで稼働中。LoadBalancerサービスに外部IPが割り当て済み。メトリクスエンドポイントがポート10254でアクセス可能。`/healthz`のヘルスチェックが200 OKを返す。

**失敗時：** LoadBalancerがPendingの場合はクラウドプロバイダーの統合とサービスクォータを確認。CrashLoopBackOffは`kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller`でコントローラーのログを確認。Webhookエラーはアドミッションwebhook証明書が有効か確認。ベアメタルで外部IPがない場合はMetalLBをインストールするかNodePortサービスタイプを使用。

### ステップ2: 自動TLS用のcert-managerのインストール

cert-managerをデプロイしてLet's EncryptのClusterIssuerを設定します。

```bash
# cert-manager CRDのインストール
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.crds.yaml

# cert-manager HelmリポジトリをAdd
helm repo add jetstack https://charts.jetstack.io
helm repo update

# cert-managerのインストール
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.13.0 \
  --set prometheus.enabled=true \
  --set webhook.timeoutSeconds=30

# インストールの確認
kubectl get pods -n cert-manager
kubectl get apiservice v1beta1.webhook.cert-manager.io -o yaml

# Let's Encryptステージングイシュアーの作成（テスト用）
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-staging-account-key
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

# Let's Encrypt本番イシュアーの作成
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod-account-key
    solvers:
    - http01:
        ingress:
          class: nginx
    - dns01:
        route53:
          region: us-east-1
          hostedZoneID: Z1234567890ABC
          # EKSとIRSAを使用したIAMロール
          role: arn:aws:iam::123456789012:role/cert-manager
EOF

# ClusterIssuerのReady確認
kubectl get clusterissuer
kubectl describe clusterissuer letsencrypt-prod
```

**期待結果：** cert-managerのPodがcert-manager Namespaceで稼働中。ClusterIssuerがReadyステータスで作成済み。Let's EncryptにACMEアカウントが登録済み。Webhookが証明書リクエストに応答。

**失敗時：** Webhookタイムアウトエラーは`webhook.timeoutSeconds`を増加するかcert-managerからAPIサーバーをブロックするネットワークポリシーを確認。ACME登録の失敗はメールが有効でサーバーURLが正しいか確認。DNS01の失敗はRoute53のIAM権限がroute53:ChangeResourceRecordSetsを許可しているか確認。`dig +short _acme-challenge.example.com TXT`でDNS伝播をテスト。

### ステップ3: TLS付きの基本Ingressの作成

アプリケーションをデプロイし、自動証明書発行付きのIngressで公開します。

```bash
# サンプルアプリケーションのデプロイ
kubectl create deployment web --image=nginx:alpine
kubectl expose deployment web --port=80 --target-port=80

# TLS付きIngressリソースの作成
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-staging"  # テスト中はステージングを使用
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - web.example.com
    secretName: web-tls-secret  # cert-managerが作成する
  rules:
  - host: web.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80
EOF

# 証明書作成の監視
kubectl get certificate -w
kubectl describe certificate web-tls-secret

# 証明書の発行確認
kubectl get secret web-tls-secret
kubectl get secret web-tls-secret -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -text -noout

# 問題がある場合はcert-managerのログを確認
kubectl logs -n cert-manager -l app=cert-manager -f

# HTTPからHTTPSへのリダイレクトをテスト
curl -I http://web.example.com
# 308 Permanent Redirect to https:// が返される

# HTTPSをテスト
curl -v https://web.example.com
# 有効な証明書で200 OKが返される

# テスト成功後、本番イシュアーに切り替え
kubectl patch ingress web-ingress -p '{"metadata":{"annotations":{"cert-manager.io/cluster-issuer":"letsencrypt-prod"}}}'
kubectl delete certificate web-tls-secret
kubectl delete secret web-tls-secret
# cert-managerが本番証明書で再作成する
```

**期待結果：** Ingressリソースが作成済み。cert-managerがアノテーションを検出してCertificateリソースを作成。HTTP-01チャレンジが正常に完了。有効な証明書でTLSシークレットが作成済み。有効な証明書でHTTPSリクエストが成功。HTTPがHTTPSにリダイレクト。

**失敗時：** チャレンジ失敗はDNSがIngress LoadBalancer IPに解決されているか`dig web.example.com`で確認。レート制限エラーは設定が正しくなるまでステージングイシュアーを使用。証明書が発行されない場合は`kubectl describe certificate web-tls-secret`と`kubectl get challenges`でイベントを確認。「too many certificates」エラーはLet's Encryptのレート制限（週50証明書/ドメイン）に達している。待つかステージングを使用。

### ステップ4: 高度なルーティングとロードバランシングの実装

パスベースルーティング、ヘッダーベースルーティング、トラフィック分割を設定します。

```bash
# 複数のサービスをデプロイ
kubectl create deployment api --image=hashicorp/http-echo --replicas=3 -- -text="API Service"
kubectl create deployment admin --image=hashicorp/http-echo --replicas=2 -- -text="Admin Service"
kubectl expose deployment api --port=5678
kubectl expose deployment admin --port=5678

# パスベースルーティングのIngressを作成
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rewrite-target: /\$2
    nginx.ingress.kubernetes.io/use-regex: "true"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - app.example.com
    secretName: app-tls
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80
      - path: /api(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 5678
      - path: /admin(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: admin
            port:
              number: 5678
EOF

# トラフィック分割によるカナリアデプロイ
kubectl create deployment api-v2 --image=hashicorp/http-echo -- -text="API Service v2"
kubectl expose deployment api-v2 --port=5678

cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-canary
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "20"  # v2に20%のトラフィック
spec:
  ingressClassName: nginx
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-v2
            port:
              number: 5678
EOF

# ヘッダーベースのカナリアルーティング（テスト用）
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-canary-header
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-by-header: "X-Canary"
    nginx.ingress.kubernetes.io/canary-by-header-value: "always"
spec:
  ingressClassName: nginx
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-v2
            port:
              number: 5678
EOF

# ルーティングのテスト
curl https://app.example.com/            # -> webサービス
curl https://app.example.com/api/        # -> 80% api, 20% api-v2
curl https://app.example.com/admin/      # -> adminサービス
curl -H "X-Canary: always" https://app.example.com/api/  # -> api-v2 (100%)
```

**期待結果：** 単一のIngressがパスに基づいて複数のサービスにルーティング。rewrite-targetがパスプレフィックスを除去。カナリアIngressが重みでトラフィックを分割。ヘッダーベースルーティングが特定のリクエストをカナリアに送信。TLSがIngressで終端し、バックエンドはHTTPを使用。

**失敗時：** 404エラーはサービス名とポートが一致しているか確認。rewriteの問題は`nginx.ingress.kubernetes.io/rewrite-target`デバッガーで正規表現をテスト。カナリアが機能しない場合は1つのIngressだけが`canary: "false"`（メイン）で他が`canary: "true"`であることを確認。トラフィックの不均衡はバックエンドのPod数とreadinessプローブを確認。

### ステップ5: レート制限と認証の設定

レート制限、基本認証、OAuth2認証を実装します。

```bash
# IPによるレート制限
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ratelimit
# ... (完全な設定はEXAMPLES.mdを参照)
```

**期待結果：** レート制限が過剰なリクエストを503 Service Temporarily Unavailableでブロック。基本認証がクレデンシャルを求め、未認証リクエストを拒否。OAuth2がプロバイダーのログインページにリダイレクトし、認証Cookieを設定。

**失敗時：** レート制限が機能しない場合はアノテーション構文を確認してIngressコントローラーのPodを再起動。基本認証の500エラーは`kubectl get secret basic-auth -o yaml | grep auth:`でシークレット形式を確認。OAuth2の失敗はクライアントID/シークレットとコールバックURLがプロバイダーに登録されているか確認。詳細なエラーメッセージはoauth2-proxyのログを確認。

### ステップ6: カスタムエラーページとリクエスト変換の実装

カスタムエラーページ、CORS、リクエスト/レスポンスヘッダーを設定します。

```bash
# カスタムエラーページのConfigMapを作成
kubectl create configmap custom-errors --from-file=404.html --from-file=503.html -n ingress-nginx

# カスタムエラーページを使用するNGINXの設定
cat <<EOF | kubectl apply -f -
apiVersion: v1
# ... (完全な設定はEXAMPLES.mdを参照)
```

**期待結果：** デフォルトのNGINXページの代わりにカスタム404と503ページが表示。CORSヘッダーが指定されたオリジンとメソッドを許可。セキュリティヘッダーがXSSとクリックジャッキングを防止。リクエストボディサイズ制限が大容量ファイルのアップロードを許可。タイムアウト設定が早期の接続切断を防止。

**失敗時：** カスタムエラーページが表示されない場合はConfigMapがコントローラーのPodにマウントされデフォルトバックエンドがデプロイされているか確認。CORSプリフライトの失敗はバックエンドサービスでOPTIONSリクエストが許可されているか確認。413 Request Entity Too Largeは`proxy-body-size`アノテーションを増加。タイムアウトエラーは3つのタイムアウトアノテーションをすべて一緒に増加。

## バリデーション

- [ ] NGINX Ingressコントローラーが外部IPを割り当てて稼働中
- [ ] cert-managerがLet's Encrypt経由で証明書を自動発行
- [ ] HTTPSリダイレクトが全Ingressに対してSSLを強制
- [ ] パスベースルーティングが正しいバックエンドサービスにリクエストを転送
- [ ] カナリアIngressが重みアノテーションに従ってトラフィックを分割
- [ ] レート制限が単一IPからの過剰なリクエストをブロック
- [ ] 認証（基本認証またはOAuth2）が管理ルートを保護
- [ ] カスタムエラーページが404/503エラーで表示
- [ ] CORSヘッダーが指定されたドメインからのクロスオリジンリクエストを許可
- [ ] メトリクスエンドポイントがモニタリング用のPrometheusメトリクスを公開

## よくある落とし穴

- **ingressClassNameなし**: IngressがコントローラーにピックアップされてされていないKubernetes 1.19+では常に`ingressClassName: nginx`を指定する。

- **証明書チャレンジの失敗**: DNSがIngress LoadBalancerを指していない。証明書をリクエストする前に`dig yourdomain.com`で確認。

- **HTTP-01チャレンジのタイムアウト**: ファイアウォールがポート80をブロック。Let's Encryptは検証のために`http://domain/.well-known/acme-challenge/`に到達する必要がある。

- **レート制限がグローバルに適用**: `limit-rps`アノテーションはパスではなくIngress単位で適用される。異なるレート制限には別々のIngressを作成する。

- **rewrite-targetの正規表現が間違い**: キャプチャがパスパターンと一致しない。`echo "/api/users" | sed 's|/api(/\|$)\(.*\)|/\2|'`でテスト。

- **カナリーの重みが無視**: 同じホスト/パスに複数のカナリアIngressが競合。1つのルートにつき1つのカナリアIngressのみ作成する。

- **IPによる認証バイパス**: 認証がIngressのみで、バックエンドサービスがClusterIP経由でアクセス可能。ネットワークポリシーまたはサービスメッシュを実装する。

- **configuration-snippetインジェクションのリスク**: ユーザー入力をconfiguration-snippetに使用するとNGINX設定のインジェクションが可能。全アノテーションを検証してサニタイズする。

## 関連スキル

- `deploy-to-kubernetes` - IngressがルーティングするServiceの作成
- `manage-kubernetes-secrets` - シークレットとしてのTLS証明書の管理
- `implement-gitops-workflow` - Argo CDによる宣言的なIngress管理
- `setup-service-mesh` - Istio/Linkerdによる高度なトラフィック管理
- `build-ci-cd-pipeline` - CI/CDでのIngressの自動更新
