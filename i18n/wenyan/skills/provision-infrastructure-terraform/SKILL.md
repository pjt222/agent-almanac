---
name: provision-infrastructure-terraform
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  以 Terraform 配並管雲基礎設施，含 HCL 模、遠程狀態後端、工作區、plan/apply 流。
  以變管、輸出值、狀態鎖實作隊協之基礎為碼模式。
  配新雲基設、自 ClickOps 或 CloudFormation 遷至宣告式 IaC、管多環基設、
  與應用碼並版基設變、或以可重用模強標時用之。
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

# 以 Terraform 配基礎設施

以 Terraform 實作基礎為碼，配、版、管 AWS、Azure、GCP、他供之雲資源。

## 用時

- 配新雲基設（VPC、計算、存、資料庫）
- 自 ClickOps 或 CloudFormation 遷至宣告式 IaC
- 管多環基設（dev、staging、prod）
- 跨隊實可復現之基設模式
- 與應用碼並版基設變
- 透可重用模強基設標

## 入

- **必要**：Terraform CLI 已裝（`terraform --version`)
- **必要**：雲供之憑（AWS、Azure、GCP 服戶）
- **必要**：遠程狀態後端配（S3、Azure Storage、Terraform Cloud）
- **可選**：欲入或遷之既基設
- **可選**：Terraform Cloud/Enterprise 為隊協
- **可選**：為驗與格之 pre-commit 鉤

## 法

> 完整配文與模板見 [Extended Examples](references/EXAMPLES.md)。

### 第一步：始 Terraform 項結構

立有序之目構，附後端配與供設。

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

得：Terraform 順始、下供插件、配遠後端。`.terraform/` 目立含供二進制。狀態後端連已驗。

敗則：若後端始敗，驗 S3 桶在且 IAM 權許 `s3:GetObject`、`s3:PutObject`、`dynamodb:GetItem`、`dynamodb:PutItem`。供下敗者，察網與企代理設。行 `terraform init -upgrade` 以更供。

### 第二步：立可重用之基設模

建可組之 VPC、計算、資料基設模，附入驗。

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

得：模立 VPC 含跨多 AZ 之公/私子網、互聯網閘道、NAT 閘道附 EIP。輸出值露資源 ID 供下游模。

敗則：CIDR 重誤者，調 `cidrsubnet()` 算或驗 VPC CIDR 不衝既網。依誤者，驗 `depends_on` 塊確正資源立序。用 `terraform graph | dot -Tpng > graph.png` 視覺化依。

### 第三步：實環特定配

立環工作區附變覆與資料源。

```hcl
# environments/prod/main.tf
terraform {
  required_version = ">= 1.6"
}

# Import shared backend and provider config
# ... (see EXAMPLES.md for complete configuration)
```

得：環特定配立 prod 大小之基設，含 3 AZ、較大實例型、prod 安全設。資料源解最新 AMI。模板文以環變渲。

敗則：工作區誤者，以 `terraform workspace new prod` 立。資料源敗者，驗 AWS 憑有 `ec2:DescribeImages` 權。模板渲誤者，驗變型合模板期。

### 第四步：執 plan 與 apply 流

行 Terraform plan、察變、附核工流 apply。

```bash
# Format code
terraform fmt -recursive

# Validate configuration
terraform validate

# ... (see EXAMPLES.md for complete configuration)
```

為自動 CI/CD 整合：

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  pull_request:
    paths:
# ... (see EXAMPLES.md for complete configuration)
```

得：plan 示資源加/變/刪。無漂。apply 立/更資源無誤。輸出含期值。CI 流於 PR 評 plan、合主分支時自 apply。

敗則：plan 敗者，行 `terraform validate` 捕語法誤。狀鎖誤者，以 `aws dynamodb get-item --table-name terraform-lock --key '{"LockID":{"S":"terraform-state-bucket/key"}}'` 識鎖持，陳則強解。apply 敗者，察 CloudWatch 記為供特誤。用 `terraform show` 察當狀。

### 第五步：管狀態並實漂測

配狀鎖、備、自漂測。

```bash
# Create DynamoDB table for state locking
cat > state-backend.tf <<'EOF'
resource "aws_dynamodb_table" "terraform_lock" {
  name           = "terraform-lock"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LockID"
# ... (see EXAMPLES.md for complete configuration)
```

為自漂測：

```bash
# Create drift detection script
cat > scripts/detect-drift.sh <<'EOF'
#!/bin/bash
set -euo pipefail

cd terraform
# ... (see EXAMPLES.md for complete configuration)
```

得：狀後端配有版與加。漂測識帶外變。狀操（list、show、mv、import）行無誤。自漂察排定行並發警。

敗則：狀鎖超時者，驗 DynamoDB 表在且鍵架構正。版誤者，以 `aws s3api get-bucket-versioning --bucket bucket-name` 察 S3 桶版狀。入誤者，驗資源在且 Terraform 配合實資源屬性。

### 第六步：實模試與文

加 Terratest 自試並生文。

```go
// test/vpc_test.go
package test

import (
    "testing"

# ... (see EXAMPLES.md for complete configuration)
```

生文：

```bash
# Install terraform-docs
go install github.com/terraform-docs/terraform-docs@latest

# Generate module documentation
terraform-docs markdown table modules/vpc > modules/vpc/README.md

# ... (see EXAMPLES.md for complete configuration)
```

得：Terratest 驗模立期資源附正配。文自變述與輸出定生。pre-commit 鉤於提交前強格與驗。

敗則：Terratest 敗者，察 AWS 憑與配額。長行試者，以 `t.Parallel()` 實並行。文生誤者，驗諸變有 `description` 屬性。pre-commit 敗者，手行 `terraform fmt` 並修驗誤。

## 驗

- [ ] 後端配有加、版、狀鎖
- [ ] 諸模有入驗與輸出值
- [ ] 工作區隔環特狀
- [ ] apply 後 `terraform plan` 示無意外變
- [ ] 漂測自行並對變發警
- [ ] 模以 Terratest 或類框試
- [ ] 文自生並維最新
- [ ] 祕由 AWS Secrets Manager 管，非硬編
- [ ] 費估已整合（Infracost 或類）
- [ ] 各環別狀致爆破範減

## 陷

- **硬編值**：避硬編 AMI ID、AZ、戶特值。用資料源與變。

- **缺生命週期塊**：資源意外重立。加 `lifecycle { create_before_destroy = true }` 防更時停機。

- **無狀鎖**：並行 apply 壞狀。常以 DynamoDB 表為 S3 後端鎖。

- **過寬 IAM**：Terraform 服戶有全管權。實限於管資源之最少權策。

- **無版限**：供更破基設。以 `version = "~> 5.0"` 限固供版。

- **狀中之祕**：敏值以明文存於狀文。輸出用 `sensitive = true`，祕存於 AWS Secrets Manager，由資料源引。

- **無備策**：狀文失或壞而無復謀。啟 S3 版、實常狀備、試復程序。

- **單塊配**：單狀文管全基設。分為邏輯界（網、計算、資料）以減爆破範。

## 參

- `configure-git-repository` — Terraform 碼之版控
- `build-ci-cd-pipeline` — 以 GitHub Actions 自動化 Terraform 流
- `implement-gitops-workflow` — ArgoCD/Flux 與 Terraform 整合
- `manage-kubernetes-secrets` — Terraform 配之集群中之祕管
- `deploy-to-kubernetes` — Terraform Kubernetes 供之用
