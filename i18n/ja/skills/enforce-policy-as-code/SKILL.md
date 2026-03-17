---
name: enforce-policy-as-code
description: >
  OPA GatekeeperまたはKyvernoを使用したポリシーアズコード強制を実装し、組織のポリシーに従って
  Kubernetesリソースを検証・変異させます。制約テンプレート、アドミッションコントロール、
  監査モード、違反のレポート、CI/CDパイプラインとの統合によるシフトレフトポリシー検証を
  カバーします。リソース設定標準の強制、特権コンテナなどのセキュリティ誤設定の防止、
  デプロイ前のコンプライアンス確保、命名規則の標準化、または既存クラスターリソースのポリシー
  監査を行う場合に使用します。
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
  tags: opa, gatekeeper, kyverno, policy, admission-control, compliance, kubernetes
---

# ポリシーアズコードの強制

OPA GatekeeperまたはKyvernoを使用した宣言的ポリシー強制でKubernetesリソースの検証と変異を実装します。

## 使用タイミング

- リソース設定の組織標準を強制（ラベル、アノテーション、制限）
- セキュリティの誤設定を防止（特権コンテナ、ホストNamespace、セキュアでないイメージ）
- リソースのデプロイ前にコンプライアンス要件を満たすことを確保
- リソース命名規則とメタデータの標準化
- 変異ポリシーによる自動修復の実装
- デプロイをブロックせずに既存クラスターリソースを監査
- シフトレフトアプローチのためにCI/CDパイプラインにポリシー検証を統合

## 入力

- **必須**: 管理者アクセス権付きのKubernetesクラスター
- **必須**: ポリシーエンジンの選択（OPA GatekeeperまたはKyverno）
- **必須**: 強制するポリシーのリスト（セキュリティ、コンプライアンス、運用）
- **任意**: 監査する既存リソース
- **任意**: 特定のNamespaceまたはリソースの免除/除外パターン
- **任意**: デプロイ前検証のためのCI/CDパイプライン設定

## 手順

> 完全な設定ファイルとテンプレートについては[拡張例](references/EXAMPLES.md)を参照してください。


### ステップ1: ポリシーエンジンのインストール

アドミッションコントローラーとしてOPA GatekeeperまたはKyvernoをデプロイします。

**OPA Gatekeeperの場合：**
```bash
# HelmでGatekeeperをインストール
helm repo add gatekeeper https://open-policy-agent.github.io/gatekeeper/charts
helm repo update

# 監査を有効にしてインストール
helm install gatekeeper gatekeeper/gatekeeper \
  --namespace gatekeeper-system \
  --create-namespace \
  --set audit.replicas=2 \
  --set replicas=3 \
  --set validatingWebhookFailurePolicy=Fail \
  --set auditInterval=60

# インストールの確認
kubectl get pods -n gatekeeper-system
kubectl get crd | grep gatekeeper

# Webhook設定を確認
kubectl get validatingwebhookconfigurations gatekeeper-validating-webhook-configuration -o yaml
```

**Kyvernoの場合：**
```bash
# HelmでKyvernoをインストール
helm repo add kyverno https://kyverno.github.io/kyverno/
helm repo update

# HA構成でインストール
helm install kyverno kyverno/kyverno \
  --namespace kyverno \
  --create-namespace \
  --set replicaCount=3 \
  --set admissionController.replicas=3 \
  --set backgroundController.replicas=2 \
  --set cleanupController.replicas=2

# インストールの確認
kubectl get pods -n kyverno
kubectl get crd | grep kyverno

# Webhook設定を確認
kubectl get validatingwebhookconfigurations kyverno-resource-validating-webhook-cfg
kubectl get mutatingwebhookconfigurations kyverno-resource-mutating-webhook-cfg
```

Namespaceの除外を作成します：
```yaml
# gatekeeper-config.yaml
apiVersion: config.gatekeeper.sh/v1alpha1
kind: Config
metadata:
  name: config
  namespace: gatekeeper-system
spec:
  match:
    - excludedNamespaces:
      - kube-system
      - kube-public
      - kube-node-lease
      - gatekeeper-system
      processes:
      - audit
      - webhook
  validation:
    traces:
      - user: system:serviceaccount:gatekeeper-system:gatekeeper-admin
        kind:
          group: ""
          version: v1
          kind: Namespace
```

**期待結果：** ポリシーエンジンのPodが複数レプリカで稼働中。CRDがインストール済み（GatekeeperはConstraintTemplate、Constraint；KyvernoはClusterPolicy、Policy）。検証/変異Webhookが有効。監査コントローラーが稼働中。

**失敗時：**
- Podのログを確認：`kubectl logs -n gatekeeper-system -l app=gatekeeper --tail=50`
- Webhookエンドポイントが到達可能か確認：`kubectl get endpoints -n gatekeeper-system`
- Webhookのログでポートの競合や証明書の問題を確認
- クラスターに十分なリソースがあることを確認（ポリシーエンジンはレプリカ毎に約500MB必要）
- RBACパーミッションを確認：`kubectl auth can-i create constrainttemplates --as=system:serviceaccount:gatekeeper-system:gatekeeper-admin`

### ステップ2: 制約テンプレートとポリシーの定義

再利用可能なポリシーテンプレートと特定の制約を作成します。

**OPA Gatekeeper制約テンプレート：**
```yaml
# required-labels-template.yaml
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
  annotations:
# ... (完全な設定はEXAMPLES.mdを参照)
```

**Kyverno ClusterPolicy：**
```yaml
# kyverno-policies.yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-labels
  annotations:
# ... (完全な設定はEXAMPLES.mdを参照)
```

ポリシーを適用：
```bash
# Gatekeeperのテンプレートと制約を適用
kubectl apply -f required-labels-template.yaml

# Kyvernoのポリシーを適用
kubectl apply -f kyverno-policies.yaml

# 制約/ポリシーのステータスを確認
kubectl get constraints
kubectl get clusterpolicies

# ポリシーのエラーを確認
kubectl describe k8srequiredlabels require-app-labels
kubectl describe clusterpolicy require-labels
```

**期待結果：** ConstraintTemplate/ClusterPolicyが正常に作成済み。制約がenforcement状態で「True」を表示。ポリシー定義にエラーなし。Webhookが新しいリソースのポリシー評価を開始。

**失敗時：**
- Rego構文を検証（Gatekeeper）：ローカルで`opa test`を使用するか制約ステータスを確認
- ポリシーYAML構文を確認：`kubectl apply --dry-run=client -f policy.yaml`
- 制約のステータスを確認：`kubectl get constraint -o yaml | grep -A 10 status`
- まずシンプルなポリシーでテストしてから複雑にする
- マッチ基準（kinds、namespaces）が正しいか確認

### ステップ3: ポリシー強制のテスト

ポリシーが非準拠リソースをブロックし、準拠リソースを許可することを確認します。

テストマニフェストを作成：
```yaml
# test-non-compliant.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-no-labels
  namespace: production
# ... (完全な設定はEXAMPLES.mdを参照)
```

ポリシーをテスト：
```bash
# 非準拠リソースの作成を試みる（失敗するはず）
kubectl apply -f test-non-compliant.yaml
# 期待される：ポリシー違反メッセージ付きのエラー

# 準拠リソースを作成（成功するはず）
kubectl apply -f test-compliant.yaml
# 期待される：deployment.apps/test-compliant created

# ドライランで検証
kubectl apply -f test-non-compliant.yaml --dry-run=server
# リソースを実際に作成せずにポリシー違反を表示

# クリーンアップ
kubectl delete -f test-compliant.yaml
```

ポリシーレポートでテスト（Kyverno）：
```bash
# ポリシーレポートを確認
kubectl get policyreports -A
kubectl get clusterpolicyreports

# 詳細レポートを表示
kubectl get policyreport -n production -o yaml

# ポリシールールの結果を確認
kubectl get policyreport -n production -o jsonpath='{.items[0].results}' | jq .
```

**期待結果：** 非準拠リソースが明確な違反メッセージで拒否。準拠リソースが正常に作成。ポリシーレポートが合格/不合格の結果を表示。ドライラン検証がリソースを作成せずに機能。

**失敗時：**
- ポリシーがenforceモードではなくauditモードになっていないか確認：`validationFailureAction: audit`
- WebhookがリクエストをProcessingしているか確認：`kubectl logs -n gatekeeper-system -l app=gatekeeper`
- テストNamespaceを除外しているNamespace除外がないか確認
- Webhook接続をテスト：`kubectl run test --rm -it --image=busybox --restart=Never`
- Webhookの失敗ポリシー（IgnoreとFail）を確認

### ステップ4: 変異ポリシーの実装

変異による自動修復を設定します。

**Gatekeeperの変異：**
```yaml
# gatekeeper-mutations.yaml
apiVersion: mutations.gatekeeper.sh/v1beta1
kind: Assign
metadata:
  name: add-default-labels
spec:
# ... (完全な設定はEXAMPLES.mdを参照)
```

**Kyvernoの変異ポリシー：**
```yaml
# kyverno-mutations.yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: add-default-labels
spec:
# ... (完全な設定はEXAMPLES.mdを参照)
```

変異を適用してテスト：
```bash
# 変異ポリシーを適用
kubectl apply -f gatekeeper-mutations.yaml
# または
kubectl apply -f kyverno-mutations.yaml

# デプロイで変異をテスト
# ... (完全な設定はEXAMPLES.mdを参照)
```

**期待結果：** 変異がラベル、リソース、またはイメージを自動的に追加/変更。デプロイされたリソースが変異された値を表示。変異がポリシーエンジンのログに記録。変異適用中にエラーなし。

**失敗時：**
- 変異Webhookが有効か確認：`kubectl get mutatingwebhookconfiguration`
- 変異ポリシーの構文を確認：特にJSONパスと条件
- ログを確認：`kubectl logs -n kyverno deploy/kyverno-admission-controller`
- 変異が競合しないか確認（同じフィールドへの複数の変異）
- 変異が検証より先に適用されることを確認（順序が重要）

### ステップ5: 監査モードとレポートの有効化

デプロイをブロックせずに既存リソースの違反を特定するための監査を設定します。

**Gatekeeperの監査：**
```bash
# 監査はauditInterval設定に基づいて自動実行される
# 監査結果を確認
kubectl get constraints -o json | \
  jq '.items[] | {name: .metadata.name, violations: .status.totalViolations}'

# 詳細な違反情報を取得
# ... (完全な設定はEXAMPLES.mdを参照)
```

**Kyvernoの監査とレポート：**
```bash
# 既存リソースのポリシーレポートを生成
kubectl create job --from=cronjob/kyverno-cleanup-controller -n kyverno manual-report-gen

# ポリシーレポートを表示
kubectl get policyreport -A
kubectl get clusterpolicyreport
# ... (完全な設定はEXAMPLES.mdを参照)
```

ポリシーコンプライアンスのダッシュボードを作成：
```yaml
# prometheus-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: policy-alerts
  namespace: monitoring
# ... (完全な設定はEXAMPLES.mdを参照)
```

**期待結果：** 監査がデプロイをブロックせずに既存リソースの違反を特定。合格/不合格の数でポリシーレポートが生成済み。違反がレビューのためにエクスポート可能。メトリクスがモニタリング用に公開。増加する違反でアラートが発火。

**失敗時：**
- 監査コントローラーが稼働中か確認：`kubectl get pods -n gatekeeper-system -l gatekeeper.sh/operation=audit`
- インストール時の監査間隔設定を確認
- 監査ログでエラーを確認：`kubectl logs -n gatekeeper-system -l gatekeeper.sh/operation=audit`
- RBACパーミッションが監査のために全リソースタイプの読み取りを許可していることを確認
- CRDのstatusフィールドが設定されているか確認：`kubectl get constraint -o yaml | grep -A 20 status`

### ステップ6: CI/CDパイプラインとの統合

デプロイ前検証をシフトレフトポリシー強制に追加します。

**CI/CD統合スクリプト：**
```bash
#!/bin/bash
# validate-policies.sh

set -e

echo "=== Policy Validation for CI/CD ==="
# ... (完全な設定はEXAMPLES.mdを参照)
```

**GitHub Actionsワークフロー：**
```yaml
# .github/workflows/policy-validation.yaml
name: Policy Validation

on:
  pull_request:
    paths:
# ... (完全な設定はEXAMPLES.mdを参照)
```

**プリコミットフック：**
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Kubernetesマニフェストをポリシーに対して検証
if git diff --cached --name-only | grep -E 'manifests/.*\.yaml$'; then
  echo "Validating Kubernetes manifests against policies..."
# ... (完全な設定はEXAMPLES.mdを参照)
```

**期待結果：** CI/CDパイプラインがデプロイ前にマニフェストを検証。ポリシー違反がパイプラインを明確なメッセージで失敗。ポリシーレポートがPRに添付。プリコミットフックが早期に違反を検出。開発者がクラスターに達する前にポリシーの問題を通知。

**失敗時：**
- CLIツールがインストールされPATHに含まれているか確認
- Kubeconfig証明書がポリシーのフェッチに有効か確認
- まずローカルでポリシー検証をテスト：`kyverno apply policy.yaml --resource manifest.yaml`
- クラスターから同期されたポリシーが完全か確認
- 特定の検証エラーのポリシーCLIログを確認

## バリデーション

- [ ] ポリシーエンジンのPodがHA構成で稼働中
- [ ] 検証と変異のWebhookが有効かつ到達可能
- [ ] 制約テンプレートとポリシーがエラーなしで作成済み
- [ ] 非準拠リソースが明確な違反メッセージで拒否
- [ ] 準拠リソースが正常にデプロイ
- [ ] 変異ポリシーがリソースを自動修復
- [ ] 監査モードが既存リソースの違反を特定
- [ ] ポリシーレポートが生成されアクセス可能
- [ ] ポリシーコンプライアンス監視のためのメトリクスが公開
- [ ] CI/CDパイプラインがデプロイ前にマニフェストを検証
- [ ] プリコミットフックがポリシー違反を防止
- [ ] Namespace除外が適切に設定済み

## よくある落とし穴

- **Webhookの失敗ポリシー**: `failurePolicy: Fail`はWebhookが利用できない場合に全リソースをブロックする。重要でないポリシーには`Ignore`を使用するが、セキュリティへの影響を理解する。強制前にWebhookの可用性をテストする。

- **過度に制限的な初期ポリシー**: 厳格なポリシーをenforceモードで始めると既存のワークロードが壊れる。監査モードから始め、違反を確認し、チームに伝えてから徐々に強制する。

- **リソース指定の欠如**: ポリシーはAPIグループ、バージョン、kindsを正確に指定する必要がある。`kubectl api-resources`で正確な値を見つける。ワイルドカード（`*`）は便利だがパフォーマンスの問題を引き起こす可能性がある。

- **変異の順序**: 変異は検証より先に適用される。変異が競合しないこと、検証が変異された値を考慮することを確認する。変異+検証を一緒にテストする。

- **Namespace除外**: システムNamespaceの除外は必要だが、過度に除外しないよう注意する。ポリシーが成熟するにつれて定期的に除外を確認する。

- **Regoの複雑さ（Gatekeeper）**: 複雑なRegoポリシーはデバッグが難しい。シンプルから始め、ローカルで`opa test`でテストし、`trace()`でログを追加し、オフラインテストにgatorを使用する。

- **パフォーマンスへの影響**: ポリシー評価がアドミッションにレイテンシを追加する。ポリシーを効率的に保ち、適切なマッチング基準を使用し、Webhookのレイテンシメトリクスを監視する。

- **ポリシーの競合**: 同じフィールドを変更する複数のポリシーが問題を引き起こす。チーム間でポリシーを調整し、共通パターンにはポリシーライブラリを使用し、組み合わせをテストする。

- **バックグラウンドスキャン**: バックグラウンド監査がクラスター全体をスキャンする。大きなクラスターではリソースを大量消費する可能性がある。クラスターのサイズとポリシーの数に基づいて監査間隔を調整する。

- **バージョンの互換性**: ポリシーCRDのバージョンが変わる。Gatekeeper v3は`v1beta1`制約を使用、Kyverno v1.11は`kyverno.io/v1`を使用。お使いのバージョンのドキュメントを確認する。

## 関連スキル

- `manage-kubernetes-secrets` - シークレット検証ポリシー
- `security-audit-codebase` - 補完的なセキュリティスキャン
- `deploy-to-kubernetes` - ポリシー検証付きのアプリケーションデプロイ
- `setup-service-mesh` - サービスメッシュ認可ポリシーがアドミッションポリシーを補完
- `configure-api-gateway` - ゲートウェイポリシーがアドミッションポリシーと連携
- `implement-gitops-workflow` - パイプラインでのポリシー検証付きGitOps
