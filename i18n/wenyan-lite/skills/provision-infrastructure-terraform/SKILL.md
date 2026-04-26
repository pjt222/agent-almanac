---
name: provision-infrastructure-terraform
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Provision and manage cloud infrastructure using Terraform with HCL modules, remote state
  backends, workspaces, and plan/apply workflow. Implement infrastructure as code patterns
  with variable management, output values, and state locking for team collaboration. Use
  when provisioning new cloud infrastructure, migrating from ClickOps or CloudFormation to
  declarative IaC, managing multi-environment infrastructure, versioning infrastructure
  changes alongside application code, or enforcing standards through reusable modules.
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

# 以 Terraform 配置基礎設施

以 Terraform 實踐基礎設施即程式碼，於 AWS、Azure、GCP 與其他供應商之間配置、版本化並管理雲端資源。

## 適用時機

- 配置新雲端基礎設施（VPC、運算、儲存、資料庫）
- 自 ClickOps 或 CloudFormation 遷往宣告式 IaC
- 管理多環境基礎設施（dev、staging、production）
- 跨團隊實踐可重現之基礎設施模式
- 將基礎設施變更與應用程式碼一併版本化
- 透過可重用模組執行基礎設施標準

## 輸入

- **必要**：已安裝 Terraform CLI（`terraform --version`）
- **必要**：雲端供應商之憑證（AWS、Azure、GCP 服務帳號）
- **必要**：遠端狀態後端設定（S3、Azure Storage、Terraform Cloud）
- **選擇性**：擬匯入或遷移之既有基礎設施
- **選擇性**：Terraform Cloud/Enterprise 供團隊協作
- **選擇性**：用於驗證與格式之 pre-commit hook

## 步驟

> 完整設定檔與模板見 [Extended Examples](references/EXAMPLES.md)。


### 步驟一：初始化 Terraform 專案結構

建立有組織之目錄結構，含後端設定與供應商設定。

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

**預期：** Terraform 成功初始化，下載供應商外掛、配置遠端後端。`.terraform/` 目錄已建並含供應商二進位。狀態後端連線已驗證。

**失敗時：** 若後端初始化失敗，驗證 S3 桶存在且 IAM 權限允許 `s3:GetObject`、`s3:PutObject`、`dynamodb:GetItem`、`dynamodb:PutItem`。供應商下載失敗時，檢網路連線與企業代理。執行 `terraform init -upgrade` 以更新供應商。

### 步驟二：建立可重用之基礎設施模組

為 VPC、運算與資料基礎設施建可組合之模組，附輸入驗證。

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

**預期：** 模組於多個 AZ 建 VPC，含公私子網、internet gateway、附 EIP 之 NAT gateway。輸出值對下游模組公開資源 ID。

**失敗時：** CIDR 重疊錯誤時，調整 `cidrsubnet()` 或驗 VPC CIDR 與既有網路無衝突。相依錯誤時，驗 `depends_on` 確保資源建立順序。以 `terraform graph | dot -Tpng > graph.png` 可視化相依。

### 步驟三：實作環境特定設定

為各環境建工作區，並施變數覆寫與資料來源。

```hcl
# environments/prod/main.tf
terraform {
  required_version = ">= 1.6"
}

# Import shared backend and provider config
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** 環境特定設定建立量級為正式之基礎設施，含 3 AZ、較大實例類型與正式環境之安全設定。資料來源解析最新 AMI。模板檔以環境變數渲染。

**失敗時：** 工作區錯時以 `terraform workspace new prod` 建之。資料來源失敗時，驗 AWS 憑證有 `ec2:DescribeImages` 權限。模板渲染錯時，驗變數型別與模板期望相符。

### 步驟四：執行 plan 與 apply 流程

執行 plan，審視變更，並依核可流程 apply。

```bash
# Format code
terraform fmt -recursive

# Validate configuration
terraform validate

# ... (see EXAMPLES.md for complete configuration)
```

供自動化 CI/CD 整合：

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  pull_request:
    paths:
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** plan 顯示資源之新增／變更／刪除。無漂移。apply 建立／更新資源無錯。輸出含預期值。CI 工作流於 PR 留 plan 註，主分支合併時自動 apply。

**失敗時：** plan 失敗時，執行 `terraform validate` 以捕語法錯。狀態鎖錯時，以 `aws dynamodb get-item --table-name terraform-lock --key '{"LockID":{"S":"terraform-state-bucket/key"}}'` 找鎖持有者，必要時 force-unlock。apply 失敗時，檢 CloudWatch logs 看供應商錯。以 `terraform show` 視當前狀態。

### 步驟五：管理狀態並實作漂移偵測

設定狀態鎖、備份與自動漂移偵測。

```bash
# Create DynamoDB table for state locking
cat > state-backend.tf <<'EOF'
resource "aws_dynamodb_table" "terraform_lock" {
  name           = "terraform-lock"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LockID"
# ... (see EXAMPLES.md for complete configuration)
```

供自動漂移偵測：

```bash
# Create drift detection script
cat > scripts/detect-drift.sh <<'EOF'
#!/bin/bash
set -euo pipefail

cd terraform
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** 狀態後端配版本控與加密。漂移偵測辨明帶外變更。狀態操作（list、show、mv、import）執行無錯。自動漂移檢於排程執行並發告警。

**失敗時：** 狀態鎖逾時時，驗 DynamoDB 表存在且鍵綱正確。版本控問題時，以 `aws s3api get-bucket-versioning --bucket bucket-name` 檢 S3 桶版本控狀態。匯入失敗時，驗資源存在且 Terraform 設定與資源實際屬性相符。

### 步驟六：實作模組測試與文件

以 Terratest 加自動測試並產生文件。

```go
// test/vpc_test.go
package test

import (
    "testing"

# ... (see EXAMPLES.md for complete configuration)
```

產生文件：

```bash
# Install terraform-docs
go install github.com/terraform-docs/terraform-docs@latest

# Generate module documentation
terraform-docs markdown table modules/vpc > modules/vpc/README.md

# ... (see EXAMPLES.md for complete configuration)
```

**預期：** Terratest 驗證模組以正確設定建出預期資源。文件自變數描述與輸出定義自動生。pre-commit hook 於提交前強制格式與驗證。

**失敗時：** Terratest 失敗時，檢 AWS 憑證與配額。長測試時以 `t.Parallel()` 平行執行。文件生成錯時，驗所有變數皆有 `description` 屬性。pre-commit 失敗時，手動執行 `terraform fmt` 並修驗證錯。

## 驗證

- [ ] 後端已配加密、版本控與狀態鎖
- [ ] 所有模組皆有輸入驗證與輸出值
- [ ] 工作區隔離各環境之狀態
- [ ] apply 後 `terraform plan` 無非預期變更
- [ ] 漂移偵測自動執行並對變更發告警
- [ ] 模組已以 Terratest 或同類框架測試
- [ ] 文件自動生成且維持更新
- [ ] 機密經 AWS Secrets Manager 管理，未硬編碼
- [ ] 已整合成本估算（Infracost 或同類）
- [ ] 各環境分離狀態以最小化爆炸半徑

## 常見陷阱

- **硬編碼值**：避硬編 AMI ID、AZ 或帳號特定值。改用資料來源與變數。

- **遺漏 lifecycle 區塊**：資源出乎預期重建。加 `lifecycle { create_before_destroy = true }` 以避更新中之停機。

- **無狀態鎖**：併行 apply 損壞狀態。S3 後端永用 DynamoDB 表作鎖。

- **過寬之 IAM**：Terraform 服務帳號握全管理權。施最小權限政策，僅及所管資源。

- **無版本約束**：供應商更新破壞基礎設施。以 `version = "~> 5.0"` 鎖供應商版本。

- **狀態中之機密**：機密以明文存於狀態檔。輸出設 `sensitive = true`、機密存於 AWS Secrets Manager、經資料來源引用。

- **無備份策略**：狀態檔丟失或損毀而無復原計畫。啟用 S3 版本控、定期備份狀態、測試復原程序。

- **單體式設定**：單一狀態檔管理整體基礎設施。依邏輯邊界（網路、運算、資料）拆分以縮小爆炸半徑。

## 相關技能

- `configure-git-repository` —— 為 Terraform 程式碼之版本控
- `build-ci-cd-pipeline` —— 以 GitHub Actions 之 Terraform 自動工作流
- `implement-gitops-workflow` —— ArgoCD/Flux 與 Terraform 之整合
- `manage-kubernetes-secrets` —— Terraform 配置叢集中之機密管理
- `deploy-to-kubernetes` —— Terraform Kubernetes provider 之使用
