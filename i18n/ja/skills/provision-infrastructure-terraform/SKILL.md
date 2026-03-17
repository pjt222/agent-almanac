---
name: provision-infrastructure-terraform
description: >
  HCLモジュール、リモートステートバックエンド、ワークスペース、plan/applyワークフローを使用して
  Terraformでクラウドインフラのプロビジョニングと管理を行います。変数管理、出力値、
  チームコラボレーション向けのステートロックを用いたInfrastructure as Codeパターンを実装します。
  新規クラウドインフラのプロビジョニング、ClickOpsやCloudFormationから宣言型IaCへの移行、
  マルチ環境インフラの管理、アプリケーションコードと並べたインフラ変更のバージョン管理、
  または再利用可能なモジュールによる標準強制に使用します。
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
  tags: terraform, iac, infrastructure, hcl, state-management
---

# Terraformによるインフラストラクチャのプロビジョニング

Terraformを使用したInfrastructure as Codeにより、AWS、Azure、GCP、その他のプロバイダーでクラウドリソースをプロビジョニング、バージョン管理、管理します。

## 使用タイミング

- 新規クラウドインフラのプロビジョニング（VPC、コンピュート、ストレージ、データベース）
- ClickOpsやCloudFormationから宣言型IaCへの移行
- マルチ環境インフラの管理（dev、staging、production）
- チーム間で再現可能なインフラパターンの実装
- アプリケーションコードと並べたインフラ変更のバージョン管理
- 再利用可能なモジュールによるインフラ標準の強制

## 入力

- **必須**: Terraform CLIがインストール済み（`terraform --version`）
- **必須**: クラウドプロバイダー認証情報（AWS、Azure、GCPサービスアカウント）
- **必須**: リモートステートバックエンド設定（S3、Azure Storage、Terraform Cloud）
- **任意**: インポートまたは移行する既存インフラ
- **任意**: チームコラボレーション向けTerraform Cloud/Enterprise
- **任意**: 検証とフォーマット用のpre-commitフック

## 手順

> 完全な設定ファイルとテンプレートは[拡張サンプル](references/EXAMPLES.md)を参照してください。

### ステップ1: Terraformプロジェクト構造の初期化

バックエンド設定とプロバイダーセットアップを含む整理されたディレクトリ構造を作成します。

```bash
# Create project structure
mkdir -p terraform/{modules,environments/{dev,staging,prod}}
cd terraform

# Create backend configuration
cat > backend.tf <<'EOF'
terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-lock"

    # Workspace-specific state files
    workspace_key_prefix = "env"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      ManagedBy   = "Terraform"
      Environment = terraform.workspace
      Project     = var.project_name
    }
  }
}
EOF

# Create variables file
cat > variables.tf <<'EOF'
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for resource naming and tagging"
  type        = string
  validation {
    condition     = length(var.project_name) > 0 && length(var.project_name) <= 32
    error_message = "Project name must be 1-32 characters"
  }
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod"
  }
}
EOF

# Initialize Terraform
terraform init
```

**期待結果：** Terraformが正常に初期化され、プロバイダープラグインがダウンロードされ、リモートバックエンドが設定されます。プロバイダーバイナリを含む `.terraform/` ディレクトリが作成されます。ステートバックエンド接続が検証されます。

**失敗時：** バックエンド初期化が失敗する場合、S3バケットが存在し、IAMパーミッションが `s3:GetObject`、`s3:PutObject`、`dynamodb:GetItem`、`dynamodb:PutItem` を許可していることを確認します。プロバイダーダウンロード失敗の場合、ネットワーク接続と社内プロキシ設定を確認します。`terraform init -upgrade` を実行してプロバイダーを更新してください。

### ステップ2: 再利用可能なインフラモジュールの作成

入力検証を含むVPC、コンピュート、データインフラ向けの合成可能なモジュールを構築します。

```hcl
# modules/vpc/main.tf
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of AZs to use"
  type        = list(string)
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    Module      = "vpc"
  }
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-vpc"
  })
}

resource "aws_subnet" "public" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone = var.availability_zones[count.index]

  map_public_ip_on_launch = true

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-public-${var.availability_zones[count.index]}"
    Type = "public"
  })
}

resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 100)
  availability_zone = var.availability_zones[count.index]

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-private-${var.availability_zones[count.index]}"
    Type = "private"
  })
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-igw"
  })
}

resource "aws_eip" "nat" {
  count  = length(var.availability_zones)
  domain = "vpc"

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-nat-eip-${var.availability_zones[count.index]}"
  })

  depends_on = [aws_internet_gateway.main]
}

resource "aws_nat_gateway" "main" {
  count         = length(var.availability_zones)
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-nat-${var.availability_zones[count.index]}"
  })

  depends_on = [aws_internet_gateway.main]
}

# modules/vpc/outputs.tf
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "nat_gateway_ips" {
  description = "List of NAT Gateway public IPs"
  value       = aws_eip.nat[*].public_ip
}
```

**期待結果：** モジュールが複数のAZにわたるパブリック・プライベートサブネット、インターネットゲートウェイ、EIPを持つNATゲートウェイを含むVPCを作成します。出力値がダウンストリームモジュール向けにリソースIDを公開します。

**失敗時：** CIDRオーバーラップエラーの場合、`cidrsubnet()` 計算を調整するか、VPC CIDRが既存ネットワークと競合しないか検証します。依存関係エラーの場合、`depends_on` ブロックが適切なリソース作成順序を保証していることを確認します。`terraform graph | dot -Tpng > graph.png` で依存関係を可視化します。

### ステップ3: 環境固有設定の実装

変数オーバーライドとデータソースを含む環境ワークスペースを作成します。

```hcl
# environments/prod/main.tf
terraform {
  required_version = ">= 1.6"
}

# Import shared backend and provider config
# ... (see EXAMPLES.md for complete configuration)
```

**期待結果：** 環境固有の設定が3つのAZ、より大きなインスタンスタイプ、本番セキュリティ設定を持つ本番規模のインフラを作成します。データソースが最新のAMIを解決します。テンプレートファイルが環境変数でレンダリングされます。

**失敗時：** ワークスペースエラーの場合、`terraform workspace new prod` でワークスペースを作成します。データソース失敗の場合、AWSクレデンシャルに `ec2:DescribeImages` パーミッションがあることを確認します。テンプレートレンダリングエラーの場合、変数の型がテンプレートの期待に一致することを検証します。

### ステップ4: Plan・Applyワークフローの実行

Terraformプランの実行、変更の確認、承認ワークフローによる適用を行います。

```bash
# Format code
terraform fmt -recursive

# Validate configuration
terraform validate

# ... (see EXAMPLES.md for complete configuration)
```

CI/CD自動化の統合：

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  pull_request:
    paths:
# ... (see EXAMPLES.md for complete configuration)
```

**期待結果：** プランがリソースの追加・変更・削除を表示します。ドリフトが検出されません。適用がエラーなくリソースを作成・更新します。出力が期待値を含みます。CIワークフローがPRにプランをコメントし、mainブランチマージ時に自動適用します。

**失敗時：** プラン失敗の場合、`terraform validate` で構文エラーを確認します。ステートロックエラーの場合、`aws dynamodb get-item --table-name terraform-lock --key '{"LockID":{"S":"terraform-state-bucket/key"}}'` でロック保持者を特定し、古い場合は強制ロック解除します。適用失敗の場合、プロバイダー固有のエラーのCloudWatchログを確認します。`terraform show` で現在のステートを確認します。

### ステップ5: ステート管理とドリフト検出の実装

ステートロック、バックアップ、自動ドリフト検出を設定します。

```bash
# Create DynamoDB table for state locking
cat > state-backend.tf <<'EOF'
resource "aws_dynamodb_table" "terraform_lock" {
  name           = "terraform-lock"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LockID"
# ... (see EXAMPLES.md for complete configuration)
```

自動ドリフト検出：

```bash
# Create drift detection script
cat > scripts/detect-drift.sh <<'EOF'
#!/bin/bash
set -euo pipefail

cd terraform
# ... (see EXAMPLES.md for complete configuration)
```

**期待結果：** バージョン管理と暗号化を備えたステートバックエンドが設定されます。ドリフト検出が帯域外変更を特定します。ステート操作（list、show、mv、import）がエラーなく実行されます。自動ドリフトチェックがスケジュールで実行され、アラートを送信します。

**失敗時：** ステートロックタイムアウトの場合、DynamoDBテーブルが存在し正しいキースキーマを持つことを確認します。バージョン管理の問題は、`aws s3api get-bucket-versioning --bucket bucket-name` でS3バケットのバージョン管理状態を確認します。インポート失敗の場合、リソースが存在し、Terraform設定が実際のリソース属性と一致することを確認します。

### ステップ6: モジュールテストとドキュメントの実装

Terratestによる自動テストとドキュメント生成を追加します。

```go
// test/vpc_test.go
package test

import (
    "testing"

# ... (see EXAMPLES.md for complete configuration)
```

ドキュメントの生成：

```bash
# Install terraform-docs
go install github.com/terraform-docs/terraform-docs@latest

# Generate module documentation
terraform-docs markdown table modules/vpc > modules/vpc/README.md

# ... (see EXAMPLES.md for complete configuration)
```

**期待結果：** Terratestがモジュールが正しい設定で期待されるリソースを作成することを検証します。変数の説明と出力定義からドキュメントが自動生成されます。pre-commitフックがコミット前にフォーマットと検証を強制します。

**失敗時：** Terratest失敗の場合、AWSクレデンシャルとクォータを確認します。長時間実行のテストには `t.Parallel()` で並列実行を実装します。ドキュメント生成エラーの場合、すべての変数に `description` 属性があることを確認します。pre-commitが失敗した場合、手動で `terraform fmt` を実行し検証エラーを修正します。

## バリデーション

- [ ] バックエンドが暗号化、バージョン管理、ステートロックで設定されている
- [ ] すべてのモジュールに入力検証と出力値がある
- [ ] ワークスペースが環境固有のステートを分離している
- [ ] `terraform plan` が適用後に予期しない変更を表示しない
- [ ] ドリフト検出が自動的に実行され変更をアラートする
- [ ] モジュールがTerratestまたは類似フレームワークでテストされている
- [ ] ドキュメントが自動生成され最新の状態に保たれている
- [ ] シークレットがAWS Secrets Managerで管理され、ハードコードされていない
- [ ] コスト見積もりが統合されている（InfracostまたはSimilar）
- [ ] 爆発半径が環境ごとに分離されたステートで最小化されている

## よくある落とし穴

- **ハードコードされた値**: AMI ID、AZ、またはアカウント固有の値をハードコードしないでください。データソースと変数を使用してください。

- **lifecycleブロックの欠如**: リソースが予期せず再作成されます。更新中のダウンタイムを防ぐために `lifecycle { create_before_destroy = true }` を追加してください。

- **ステートロックなし**: 並行適用がステートを破損します。S3バックエンドには必ずDynamoDBテーブルをロックに使用してください。

- **過度に広いIAM**: TerraformサービスアカウントがフルAdmin権限を持っています。管理リソースにスコープを絞った最小権限ポリシーを実装してください。

- **バージョン制約なし**: プロバイダー更新がインフラを破壊します。`version = "~> 5.0"` 制約でプロバイダーバージョンを固定してください。

- **ステート内のシークレット**: 機密値がプレーンテキストのステートファイルに保存されます。出力に `sensitive = true` を使用し、シークレットをAWS Secrets Managerに保存し、データソース経由で参照してください。

- **バックアップ戦略なし**: ステートファイルが失われまたは破損し、復旧計画がありません。S3バージョン管理を有効にし、定期的なステートバックアップを実装し、復旧手順をテストしてください。

- **単一形の設定**: 単一ステートファイルがインフラ全体を管理しています。爆発半径を減らすために論理的な境界（ネットワーク、コンピュート、データ）に分割してください。

## 関連スキル

- `configure-git-repository` - Terraformコードのバージョン管理
- `build-ci-cd-pipeline` - GitHub Actionsによる自動化されたTerraformワークフロー
- `implement-gitops-workflow` - TerraformとArgoCD/Fluxの統合
- `manage-kubernetes-secrets` - Terraformでプロビジョニングされたクラスターでのシークレット管理
- `deploy-to-kubernetes` - Terraform Kubernetesプロバイダーの使用
