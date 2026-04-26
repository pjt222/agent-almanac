---
name: provision-infrastructure-terraform
locale: wenyan-ultra
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

# 以 Terraform 供基

實基為碼以 Terraform 供、版、管雲資於 AWS、Azure、GCP 等。

## 用

- 供新雲基（VPC、算、儲、庫）→用
- 自 ClickOps 或 CloudFormation 遷至宣 IaC→用
- 管多環基（dev、staging、prod）→用
- 跨團實可重基式→用
- 與應碼共版基變→用
- 過可重模強基準→用

## 入

- **必**：Terraform CLI 裝（`terraform --version`）
- **必**：雲憑（AWS、Azure、GCP 服戶）
- **必**：遠態後配（S3、Azure Storage、Terraform Cloud）
- **可**：欲入或遷之現基
- **可**：團共之 Terraform Cloud/Enterprise
- **可**：驗式之預提鉤

## 行

> 見 [Extended Examples](references/EXAMPLES.md) 為完配檔與模。


### 一：始 Terraform 案構

立組目構含後配與供設。

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

得：Terraform 始成、下供件、配遠後。`.terraform/` 目立含供二進。態後連驗。

敗：後始敗→驗 S3 桶在、IAM 許 `s3:GetObject`、`s3:PutObject`、`dynamodb:GetItem`、`dynamodb:PutItem`。供下敗→察網與企代設。`terraform init -upgrade` 更供。

### 二：立可重基模

建組模為 VPC、算、資基含入驗。

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

得：模立 VPC 含跨多 AZ 之公/私子網、網關、含 EIP 之 NAT 關。出值露資 ID 為下游模。

敗：CIDR 疊誤→調 `cidrsubnet()` 算或驗 VPC CIDR 不衝現網。依誤→驗 `depends_on` 塊確正資立序。`terraform graph | dot -Tpng > graph.png` 視依。

### 三：實環特配

立環工區含變覆與資源。

```hcl
# environments/prod/main.tf
terraform {
  required_version = ">= 1.6"
}

# Import shared backend and provider config
# ... (see EXAMPLES.md for complete configuration)
```

得：環特配立產級含 3 AZ、大實型、產安設。資源解末 AMI。模檔渲含環變。

敗：工區誤→`terraform workspace new prod` 立。資源敗→驗 AWS 憑有 `ec2:DescribeImages` 許。模渲誤→驗變型合模期。

### 四：行計與施程

行 Terraform 計、察變、施含批程。

```bash
# Format code
terraform fmt -recursive

# Validate configuration
terraform validate

# ... (see EXAMPLES.md for complete configuration)
```

為自 CI/CD 整：

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  pull_request:
    paths:
# ... (see EXAMPLES.md for complete configuration)
```

得：計示資加/變/除。無漂察。施立/更資無誤。出含預值。CI 程於 PR 注計、合主時自施。

敗：計敗→`terraform validate` 捉法誤。態鎖誤→`aws dynamodb get-item --table-name terraform-lock --key '{"LockID":{"S":"terraform-state-bucket/key"}}'` 識持者、陳則強解。施敗→察 CloudWatch 為供特誤。`terraform show` 察今態。

### 五：管態與實漂察

配態鎖、備、自漂察。

```bash
# Create DynamoDB table for state locking
cat > state-backend.tf <<'EOF'
resource "aws_dynamodb_table" "terraform_lock" {
  name           = "terraform-lock"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LockID"
# ... (see EXAMPLES.md for complete configuration)
```

為自漂察：

```bash
# Create drift detection script
cat > scripts/detect-drift.sh <<'EOF'
#!/bin/bash
set -euo pipefail

cd terraform
# ... (see EXAMPLES.md for complete configuration)
```

得：態後配含版與密。漂察識帶外變。態操（list、show、mv、import）行無誤。自漂察按時行而發警。

敗：態鎖逾時→驗 DynamoDB 表在含正鍵綱。版誤→`aws s3api get-bucket-versioning --bucket bucket-name` 察 S3 桶版態。入敗→驗資存且 Terraform 配合實資屬。

### 六：實模試與文

加 Terratest 自試而生文。

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

得：Terratest 驗模立期資含正配。文自變述與出定生。預提鉤強提前式與驗。

敗：Terratest 敗→察 AWS 憑與配。長試→`t.Parallel()` 並。文生誤→驗諸變有 `description` 屬。預提敗→手 `terraform fmt` 並修驗誤。

## 驗

- [ ] 後配含密、版、態鎖
- [ ] 諸模有入驗與出值
- [ ] 工區隔環特態
- [ ] 施後 `terraform plan` 無未期變
- [ ] 漂察自行而於變時警
- [ ] 模以 Terratest 或類框試
- [ ] 文自生而新
- [ ] 密由 AWS Secrets Manager 管、非硬碼
- [ ] 本估整（Infracost 或類）
- [ ] 各環獨態以減爆半徑

## 忌

- **硬碼值**：避硬碼 AMI ID、AZ、戶特值。用資源與變

- **缺生命塊**：資意外重立。加 `lifecycle { create_before_destroy = true }` 防更時停

- **無態鎖**：並施壞態。S3 後必用 DynamoDB 表為鎖

- **過寬 IAM**：Terraform 服戶有全管。實最少權於管資

- **無版限**：供更破基。`version = "~> 5.0"` 限釘供版

- **態中密**：感值存於明態檔。出用 `sensitive = true`、密存於 AWS Secrets Manager、由資源引

- **無備策**：態檔失或壞無復計。S3 版啟、定期態備、試復程

- **單塊配**：單態檔管全基。分為邏界（網、算、資）以減爆半徑

## 參

- `configure-git-repository` - Terraform 碼之版控
- `build-ci-cd-pipeline` - 含 GitHub Actions 之自 Terraform 程
- `implement-gitops-workflow` - ArgoCD/Flux 與 Terraform 整
- `manage-kubernetes-secrets` - Terraform 供之集中之密管
- `deploy-to-kubernetes` - Terraform Kubernetes 供用
