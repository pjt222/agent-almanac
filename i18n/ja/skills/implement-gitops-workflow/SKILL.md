---
name: implement-gitops-workflow
description: >
  Argo CDまたはFluxを使用したGitOps継続的デリバリーを実装します。app-of-appsパターン、
  自動同期ポリシー、ドリフト検出、マルチ環境プロモーションをカバーします。Gitからの
  宣言的な定期調整によりKubernetesデプロイを管理します。宣言的インフラ管理の実装、
  命令型kubectlコマンドからGit駆動デプロイへの移行、マルチ環境プロモーションワークフローの
  セットアップ、本番環境のコードレビューゲートの強制、または監査・コンプライアンス要件を
  満たす際に使用します。
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
  complexity: advanced
  language: multi
  tags: gitops, argocd, flux, sync, drift-detection
---

# GitOpsワークフローの実装

Argo CDまたはFluxを使用したGitOps原則でKubernetesアプリケーションをデプロイ・管理し、自動化・監査可能・再現可能なデプロイを実現します。

## 使用タイミング

- 宣言的インフラおよびアプリケーション管理の実装
- 命令型kubectl/helmコマンドからGit駆動デプロイへの移行
- マルチ環境プロモーションワークフローのセットアップ（dev → staging → prod）
- 本番デプロイにコードレビューと承認ゲートを強制
- Gitの履歴によるコンプライアンスと監査要件の達成
- Gitをシングルソースオブトゥルースとするディザスタリカバリの実装

## 入力

- **必須**: 管理者アクセス権付きのKubernetesクラスター（EKS、GKE、AKS、またはセルフホスト）
- **必須**: KubernetesマニフェストおよびHelmチャート用Gitリポジトリ
- **必須**: Argo CDまたはFlux CLIのインストール
- **任意**: シークレット管理のためのSealed SecretsまたはExternal Secrets Operator
- **任意**: 自動イメージプロモーションのためのImage Updater
- **任意**: 同期ステータス監視のためのPrometheus

## 手順

> 完全な設定ファイルとテンプレートについては[拡張例](references/EXAMPLES.md)を参照してください。


### ステップ1: Argo CDのインストールとリポジトリアクセスの設定

Argo CDをクラスターにデプロイし、Gitリポジトリに接続します。

```bash
# Namespaceの作成
kubectl create namespace argocd

# Argo CDのインストール
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Podの準備完了を待機
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s

# Argo CD CLIのインストール
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64

# UIへのアクセスのためにポートフォワード
kubectl port-forward svc/argocd-server -n argocd 8080:443 &

# 初期管理者パスワードの取得
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
echo "Argo CD Admin Password: $ARGOCD_PASSWORD"

# CLIでログイン
argocd login localhost:8080 --username admin --password "$ARGOCD_PASSWORD" --insecure

# 管理者パスワードの変更
argocd account update-password

# Gitリポジトリの追加（HTTPSとトークン）
argocd repo add https://github.com/USERNAME/gitops-repo \
  --username USERNAME \
  --password "$GITHUB_TOKEN" \
  --name gitops-repo

# またはSSHで追加
ssh-keygen -t ed25519 -C "argocd@cluster" -f argocd-deploy-key -N ""
# argocd-deploy-key.pubをGitHubリポジトリのデプロイキーに追加
argocd repo add git@github.com:USERNAME/gitops-repo.git \
  --ssh-private-key-path argocd-deploy-key \
  --name gitops-repo

# リポジトリ接続の確認
argocd repo list

# UIのIngressの設定（任意）
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-server-ingress
  namespace: argocd
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-passthrough: "true"
    nginx.ingress.kubernetes.io/backend-protocol: "HTTPS"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - argocd.example.com
    secretName: argocd-tls
  rules:
  - host: argocd.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: argocd-server
            port:
              number: 443
EOF
```

**期待結果：** Argo CDがargocd Namespaceにインストール済み。UIはポートフォワードまたはIngressでアクセス可能。デフォルトの管理者パスワードが変更済み。SSHまたはトークン認証でGitリポジトリが追加済み。リポジトリ接続が確認済み。

**失敗時：** PodのCrashLoopBackOffは`kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server`でログ確認。リポジトリ接続の失敗はトークンのリポジトリアクセスまたはSSHキーのデプロイキー追加を確認。IngressのSSL問題はcert-managerが証明書を正常に発行しているか確認。ログイン失敗は再度パスワードを取得するか、`kubectl delete secret argocd-initial-admin-secret -n argocd`でリセットしてサーバーを再起動。

### ステップ2: アプリケーションマニフェストの作成と最初のアプリケーションのデプロイ

同期ポリシーとヘルスチェック付きのArgo CDアプリケーションリソースを定義します。

```bash
# Gitリポジトリ構造の作成
mkdir -p gitops-repo/{apps,infra,projects}
cd gitops-repo

# サンプルアプリケーションの作成
mkdir -p apps/myapp/overlays/{dev,staging,prod}
mkdir -p apps/myapp/base

# ベースKustomization
cat > apps/myapp/base/kustomization.yaml <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
- deployment.yaml
- service.yaml
EOF

cat > apps/myapp/base/deployment.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: ghcr.io/username/myapp:v1.0.0
        ports:
        - containerPort: 8080
EOF

cat > apps/myapp/base/service.yaml <<EOF
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
EOF

# 本番オーバーレイ
cat > apps/myapp/overlays/prod/kustomization.yaml <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: production
resources:
- ../../base
replicas:
- name: myapp
  count: 5
images:
- name: ghcr.io/username/myapp
  newTag: v1.0.0
EOF

# Gitにコミット
git add .
git commit -m "Add myapp application manifests"
git push

# Argo CDアプリケーションの作成
cat > argocd-apps/myapp-prod.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp-prod
  namespace: argocd
  finalizers:
  - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/USERNAME/gitops-repo
    targetRevision: main
    path: apps/myapp/overlays/prod
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true      # Gitから削除されたリソースを削除
      selfHeal: true   # ドリフト検出時に自動同期
      allowEmpty: false
    syncOptions:
    - CreateNamespace=true
    - PruneLast=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
  revisionHistoryLimit: 10
EOF

# kubectlでアプリケーションを適用
kubectl apply -f argocd-apps/myapp-prod.yaml

# またはCLIで作成
argocd app create myapp-prod \
  --repo https://github.com/USERNAME/gitops-repo \
  --path apps/myapp/overlays/prod \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace production \
  --sync-policy automated \
  --auto-prune \
  --self-heal

# 同期ステータスの監視
argocd app get myapp-prod --watch

# アプリケーションの確認
kubectl get all -n production
argocd app sync myapp-prod  # 自動同期が無効の場合は手動同期
```

**期待結果：** アプリケーションがGitから自動的に同期済み。リソースがproduction Namespaceに作成済み。Argo CD UIがhealthyステータスを表示。自動同期ポリシーによりpruneとself-healが有効。リトライ制限内で同期が成功。

**失敗時：** 同期の失敗は`argocd app get myapp-prod`と`kubectl get events -n production`でイベントを確認。Kustomizeビルドエラーは`kustomize build apps/myapp/overlays/prod`でローカルテスト。Namespaceエラーはnamespaceの存在確認またはCreateNamespace同期オプションの有効化。Pruningの問題は`kubectl get <resource> -o yaml`でfinalizersとオーナーリファレンスを確認。

### ステップ3: マルチ環境管理のためのApp-of-Appsパターンの実装

複数環境にわたる子アプリケーションを管理するルートアプリケーションを作成します。

```bash
# app-of-apps構造の作成
mkdir -p argocd-apps/{projects,infra,apps}

# RBACのためのプロジェクト定義
cat > argocd-apps/projects/production.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
# ... (完全な設定はEXAMPLES.mdを参照)
```

**期待結果：** ルートアプリが全ての子アプリケーションを管理。新しいアプリケーションはGitに追加されると自動的にデプロイ。インフラアプリがアプリアプリケーションより先にデプロイ（必要に応じて同期ウェーブを使用）。プロジェクトがRBAC境界を強制。アプリツリーが親子関係を表示。

**失敗時：** 循環依存は同期ウェーブで順序を制御。プロジェクト権限エラーはsourceReposとdestinationsがアプリケーション要件と一致しているか確認。再帰的ディレクトリの問題はYAMLファイルが有効で競合がないか確認。子アプリが見つからない場合は`argocd app get root-app`でルートアプリのステータスを確認。

### ステップ4: 自動デプロイのためのImage Updaterの設定

新しいイメージバージョンを自動的にプロモーションするArgo CD Image Updaterをセットアップします。

```bash
# Argo CD Image Updaterのインストール
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml

# アノテーションによるイメージ更新戦略の設定
cat > argocd-apps/myapp-prod-autoupdate.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
# ... (完全な設定はEXAMPLES.mdを参照)
```

**期待結果：** Image Updaterがタグパターンに一致する新しいイメージをレジストリで監視。セマンティックバージョニング戦略が最新の安定リリースに更新。新しいイメージタグで自動的にGitコミットが作成。アプリケーションが更新されたイメージで同期。Stagingはイミュータブルデプロイのためにdigestストラテジーを使用。

**失敗時：** レジストリアクセスエラーはimage-updaterがSecretまたはServiceAccountでプルクレデンシャルを持っているか確認。ライトバック失敗はgit-credsシークレットがプッシュ権限を持っているか確認。更新が検出されない場合は`argocd-image-updater test ghcr.io/username/myapp`で実際のタグとタグ正規表現の一致を確認。認証問題はimage-updaterのログで詳細なエラーメッセージを確認。

### ステップ5: Argo Rolloutsによるプログレッシブデリバリーの実装

自動ロールバック付きのカナリアとブルーグリーンデプロイを有効にします。

```bash
# Argo Rolloutsコントローラーのインストール
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# Rollouts kubectlプラグインのインストール
curl -LO https://github.com/argoproj/argo-rollouts/releases/latest/download/kubectl-argo-rollouts-linux-amd64
# ... (完全な設定はEXAMPLES.mdを参照)
```

**期待結果：** Rolloutがカナリアにトラフィックをプログレッシブにシフト。各ステップで分析が実行され成功率を検証。成功時は自動プロモーション、失敗時はロールバック。Argo CDがRolloutリソースを同期。ダッシュボードがリアルタイムのロールアウト進捗を表示。

**失敗時：** 分析の失敗はPrometheusがアクセス可能でクエリが有効な結果を返すか確認。トラフィックルーティングの問題はIngressアノテーションとカナリーサービスエンドポイントを確認。スタックしたロールアウトは手動でプロモーションまたは中止。リビジョンの不一致はArgo CDの同期ポリシーがRolloutsコントローラーの更新と競合していないか確認。

### ステップ6: ドリフト検出とWebhook通知の設定

手動変更を監視し、Slack/メールにアラートを送信します。

```bash
# アプリケーションでのドリフト検出の設定
cat > argocd-apps/myapp-strict.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp-prod
# ... (完全な設定はEXAMPLES.mdを参照)
```

**期待結果：** Self-healが手動kubectl変更を自動的にリバート。同期の失敗と成功したデプロイでSlackに通知。Webhookが外部システムをトリガー（PagerDuty、モニタリング、ITSM）。ドリフトアラートが変更内容と変更者（Gitの履歴から）を表示。

**失敗時：** Self-healがトリガーされない場合は自動同期ポリシーが有効でリフレッシュ間隔が長すぎない（デフォルト3分）か確認。通知の失敗はcurlでSlackトークンをテストしてボットがチャンネルに追加されているか確認。ignoredDifferencesが機能しない場合はJSONポインター構文がリソース構造と一致するか確認。Webhookエラーはエンドポイントのアクセシビリティと認証ヘッダーを確認。

## バリデーション

- [ ] Argo CDまたはFluxがインストールされUI/CLIでアクセス可能
- [ ] 適切な認証でGitリポジトリが接続済み
- [ ] アプリケーションがコミット後にGitから自動的に同期
- [ ] 手動kubectl変更がself-healによってリバート済み
- [ ] App-of-appsパターンが複数アプリケーションをデプロイ
- [ ] Image Updaterがタグパターンに基づいて新しいイメージをプロモーション
- [ ] Argo Rolloutsがプログレッシブカナリアデプロイを実行
- [ ] 同期イベントでSlack/メールに通知が送信済み
- [ ] ドリフト検出が帯域外変更をアラート
- [ ] RBACがプロジェクトレベルのアクセス制御を強制

## よくある落とし穴

- **自動pruneが無効**: Gitから削除されたリソースがクラスターに残る。同期ポリシーで`prune: true`を有効にする。

- **同期ウェーブなし**: アプリが依存するインフラアプリがアプリの後にデプロイされる。`argocd.argoproj.io/sync-wave`アノテーションで順序を制御する。

- **HPAが管理するレプリカを無視**: HPAがレプリカ数を変更して同期が失敗。`/spec/replicas`をignoredDifferencesに追加する。

- **ライトバックの競合**: Image UpdaterのコミットがGitの手動コミットと競合。別ブランチまたはimage updaterのきめ細かいRBACを使用する。

- **finalizersの欠如**: アプリケーション削除で孤立したリソースが残る。アプリケーションメタデータに`resources-finalizer.argocd.argoproj.io`を追加する。

- **分析テンプレートなし**: ロールアウトが検証なしで自動的にプロモーション。メトリクスクエリを持つAnalysisTemplatesを実装する。

- **Gitにシークレット**: 平文シークレットがリポジトリにコミットされる。Sealed SecretsまたはExternal Secrets Operatorを使用する。

- **過度なself-heal**: Self-healが正当な緊急変更をリバートする。アノテーションで一時的に無効化するか承認ゲートを実装する。

## 関連スキル

- `configure-git-repository` - GitOps用のGitリポジトリ構造のセットアップ
- `manage-git-branches` - 環境プロモーションのためのブランチ戦略
- `deploy-to-kubernetes` - GitOpsが管理するKubernetesリソースの理解
- `manage-kubernetes-secrets` - Argo CDとのSealed Secrets統合
- `build-ci-cd-pipeline` - CIがイメージをビルド、GitOpsがデプロイ
- `setup-container-registry` - レジストリ間のイメージプロモーション
