---
name: provision-infrastructure-terraform
description: >
  使用 Terraform 通过 HCL 模块、远程状态后端、工作区及 plan/apply 工作流
  来预置和管理云基础设施。实现基础设施即代码模式，支持变量管理、输出值
  和团队协作的状态锁定。适用于预置新云基础设施、从 ClickOps 或
  CloudFormation 迁移至声明式 IaC、管理多环境基础设施、随应用代码对
  基础设施变更进行版本控制，或通过可复用模块强制执行标准。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: advanced
  language: multi
  tags: terraform, iac, infrastructure, hcl, state-management
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# 使用 Terraform 预置基础设施

使用 Terraform 实现基础设施即代码，跨 AWS、Azure、GCP 等提供商预置、版本化和管理云资源。

## 适用场景

- 预置新云基础设施（VPC、计算、存储、数据库）
- 从 ClickOps 或 CloudFormation 迁移至声明式 IaC
- 管理多环境基础设施（开发、暂存、生产）
- 跨团队实现可复现的基础设施模式
- 随应用代码对基础设施变更进行版本控制
- 通过可复用模块强制执行基础设施标准

## 输入

- **必填**：已安装 Terraform CLI（`terraform --version`）
- **必填**：云提供商凭证（AWS、Azure、GCP 服务账户）
- **必填**：远程状态后端配置（S3、Azure Storage、Terraform Cloud）
- **可选**：需要导入或迁移的现有基础设施
- **可选**：用于团队协作的 Terraform Cloud/Enterprise
- **可选**：用于验证和格式化的 pre-commit 钩子

## 步骤

> 完整配置文件和模板请参阅[扩展示例](references/EXAMPLES.md)。


### 第 1 步：初始化 Terraform 项目结构

创建组织化的目录结构，配置后端和提供商设置。

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

**预期结果：** Terraform 成功初始化，下载提供商插件，配置远程后端。创建包含提供商二进制文件的 `.terraform/` 目录。状态后端连接已验证。

**失败处理：** 如果后端初始化失败，验证 S3 存储桶是否存在，IAM 权限是否允许 `s3:GetObject`、`s3:PutObject`、`dynamodb:GetItem`、`dynamodb:PutItem`。对于提供商下载失败，检查网络连接和企业代理设置。运行 `terraform init -upgrade` 更新提供商。

### 第 2 步：创建可复用基础设施模块

构建带输入验证的 VPC、计算和数据基础设施的可组合模块。

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

**预期结果：** 模块跨多个可用区创建带公私子网的 VPC、互联网网关和带 EIP 的 NAT 网关。输出值为下游模块暴露资源 ID。

**失败处理：** 对于 CIDR 重叠错误，调整 `cidrsubnet()` 计算或验证 VPC CIDR 不与现有网络冲突。对于依赖错误，验证 `depends_on` 块是否确保正确的资源创建顺序。使用 `terraform graph | dot -Tpng > graph.png` 可视化依赖关系。

### 第 3 步：实现特定环境配置

使用变量覆盖和数据源创建环境工作区。

```hcl
# environments/prod/main.tf
terraform {
  required_version = ">= 1.6"
}

# Import shared backend and provider config
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** 特定环境配置创建包含 3 个可用区、更大实例类型和生产安全设置的生产规模基础设施。数据源解析最新 AMI。模板文件使用环境变量渲染。

**失败处理：** 对于工作区错误，使用 `terraform workspace new prod` 创建工作区。对于数据源失败，验证 AWS 凭证是否具有 `ec2:DescribeImages` 权限。对于模板渲染错误，验证变量类型与模板期望匹配。

### 第 4 步：执行 plan 和 apply 工作流

运行 Terraform plan，审查变更，并通过审批工作流执行 apply。

```bash
# Format code
terraform fmt -recursive

# Validate configuration
terraform validate

# ... (see EXAMPLES.md for complete configuration)
```

对于自动化 CI/CD 集成：

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  pull_request:
    paths:
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** Plan 显示资源的增加/变更/删除。未检测到漂移。Apply 无错误地创建/更新资源。输出包含预期值。CI 工作流在 PR 上注释 plan，在主分支合并时自动应用。

**失败处理：** 对于 plan 失败，运行 `terraform validate` 捕获语法错误。对于状态锁定错误，使用 `aws dynamodb get-item` 识别锁定持有者，如果过时则强制解锁。对于 apply 失败，检查 CloudWatch 日志获取提供商特定错误。使用 `terraform show` 检查当前状态。

### 第 5 步：管理状态并实现漂移检测

配置状态锁定、备份和自动化漂移检测。

```bash
# Create DynamoDB table for state locking
cat > state-backend.tf <<'EOF'
resource "aws_dynamodb_table" "terraform_lock" {
  name           = "terraform-lock"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LockID"
# ... (see EXAMPLES.md for complete configuration)
```

对于自动化漂移检测：

```bash
# Create drift detection script
cat > scripts/detect-drift.sh <<'EOF'
#!/bin/bash
set -euo pipefail

cd terraform
# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** 状态后端配置了版本控制和加密。漂移检测识别带外变更。状态操作（list、show、mv、import）无错误执行。自动化漂移检查按计划运行并发送警报。

**失败处理：** 对于状态锁定超时，验证 DynamoDB 表是否存在且具有正确的键模式。对于版本控制问题，使用 `aws s3api get-bucket-versioning --bucket bucket-name` 检查 S3 存储桶版本控制状态。对于导入失败，验证资源存在且 Terraform 配置与实际资源属性匹配。

### 第 6 步：实现模块测试和文档

使用 Terratest 添加自动化测试并生成文档。

```go
// test/vpc_test.go
package test

import (
    "testing"

# ... (see EXAMPLES.md for complete configuration)
```

生成文档：

```bash
# Install terraform-docs
go install github.com/terraform-docs/terraform-docs@latest

# Generate module documentation
terraform-docs markdown table modules/vpc > modules/vpc/README.md

# ... (see EXAMPLES.md for complete configuration)
```

**预期结果：** Terratest 验证模块使用正确配置创建预期资源。文档从变量描述和输出定义自动生成。Pre-commit 钩子在提交前强制执行格式化和验证。

**失败处理：** 对于 Terratest 失败，检查 AWS 凭证和配额。对于长时间运行的测试，使用 `t.Parallel()` 实现并行执行。对于文档生成错误，验证所有变量都有 `description` 属性。对于 pre-commit 失败，手动运行 `terraform fmt` 并修复验证错误。

## 验证清单

- [ ] 后端配置了加密、版本控制和状态锁定
- [ ] 所有模块都有输入验证和输出值
- [ ] 工作区隔离特定环境的状态
- [ ] apply 后 `terraform plan` 显示无意外变更
- [ ] 漂移检测自动运行并在发生变更时发出警报
- [ ] 模块使用 Terratest 或类似框架进行测试
- [ ] 文档自动生成并保持最新
- [ ] 密钥通过 AWS Secrets Manager 管理，而非硬编码
- [ ] 集成了成本估算（Infracost 或类似工具）
- [ ] 通过每个环境单独的状态来最小化爆炸半径

## 常见问题

- **硬编码值**：避免硬编码 AMI ID、可用区或账户特定值。使用数据源和变量。

- **缺少生命周期块**：资源意外重建。添加 `lifecycle { create_before_destroy = true }` 以防止更新期间停机。

- **无状态锁定**：并发 apply 会破坏状态。始终对 S3 后端使用 DynamoDB 表进行锁定。

- **IAM 权限过宽**：Terraform 服务账户具有完整管理员访问权限。实现仅限于受管资源的最小权限策略。

- **无版本约束**：提供商更新会破坏基础设施。使用 `version = "~> 5.0"` 约束固定提供商版本。

- **密钥在状态文件中**：敏感值以明文存储在状态文件中。在输出上使用 `sensitive = true`，将密钥存储在 AWS Secrets Manager 中，通过数据源引用。

- **无备份策略**：状态文件丢失或损坏没有恢复计划。启用 S3 版本控制，实施定期状态备份，测试恢复程序。

- **单体配置**：单个状态文件管理整个基础设施。按逻辑边界（网络、计算、数据）拆分以减少爆炸半径。

## 相关技能

- `configure-git-repository` - Terraform 代码的版本控制
- `build-ci-cd-pipeline` - 使用 GitHub Actions 的自动化 Terraform 工作流
- `implement-gitops-workflow` - ArgoCD/Flux 与 Terraform 集成
- `manage-kubernetes-secrets` - Terraform 预置集群中的密钥管理
- `deploy-to-kubernetes` - Terraform Kubernetes 提供商用法
