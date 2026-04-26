---
name: provision-infrastructure-terraform
locale: caveman
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

# Provision Infrastructure with Terraform

Implement infrastructure as code using Terraform. Provision, version, manage cloud resources across AWS, Azure, GCP, other providers.

## When Use

- Provisioning new cloud infrastructure (VPCs, compute, storage, databases)
- Migrating from ClickOps or CloudFormation to declarative IaC
- Managing multi-environment infrastructure (dev, staging, production)
- Implementing reproducible infrastructure patterns across teams
- Versioning infrastructure changes alongside application code
- Enforcing infrastructure standards through reusable modules

## Inputs

- **Required**: Terraform CLI installed (`terraform --version`)
- **Required**: Cloud provider credentials (AWS, Azure, GCP service accounts)
- **Required**: Remote state backend configuration (S3, Azure Storage, Terraform Cloud)
- **Optional**: Existing infrastructure to import or migrate
- **Optional**: Terraform Cloud/Enterprise for team collaboration
- **Optional**: Pre-commit hooks for validation and formatting

## Steps

> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.


### Step 1: Initialize Terraform Project Structure

Create organized directory structure with backend configuration and provider setup.

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

**Got:** Terraform initializes successfully. Downloads provider plugins. Configures remote backend. `.terraform/` directory created with provider binaries. State backend connection verified.

**If fail:** Backend initialization fails? Verify S3 bucket exists and IAM permissions allow `s3:GetObject`, `s3:PutObject`, `dynamodb:GetItem`, `dynamodb:PutItem`. For provider download failures, check network connectivity and corporate proxy settings. Run `terraform init -upgrade` to update providers.

### Step 2: Create Reusable Infrastructure Modules

Build composable modules for VPC, compute, data infrastructure with input validation.

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

**Got:** Module creates VPC with public/private subnets across multiple AZs, internet gateway, NAT gateways with EIPs. Output values expose resource IDs for downstream modules.

**If fail:** CIDR overlap errors? Adjust `cidrsubnet()` calculation or validate VPC CIDR doesn't conflict with existing networks. Dependency errors? Verify `depends_on` blocks ensure proper resource creation order. Use `terraform graph | dot -Tpng > graph.png` to visualize dependencies.

### Step 3: Implement Environment-Specific Configurations

Create environment workspaces with variable overrides and data sources.

```hcl
# environments/prod/main.tf
terraform {
  required_version = ">= 1.6"
}

# Import shared backend and provider config
# ... (see EXAMPLES.md for complete configuration)
```

**Got:** Environment-specific configuration creates production-sized infrastructure with 3 AZs, larger instance types, production security settings. Data sources resolve latest AMI. Template files render with environment variables.

**If fail:** Workspace errors? Create workspace with `terraform workspace new prod`. Data source failures? Verify AWS credentials have `ec2:DescribeImages` permissions. Template rendering errors? Validate variable types match template expectations.

### Step 4: Execute Plan and Apply Workflow

Run Terraform plan. Review changes. Apply with approval workflow.

```bash
# Format code
terraform fmt -recursive

# Validate configuration
terraform validate

# ... (see EXAMPLES.md for complete configuration)
```

For automated CI/CD integration:

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  pull_request:
    paths:
# ... (see EXAMPLES.md for complete configuration)
```

**Got:** Plan shows resource additions/changes/deletions. No drift detected. Apply creates/updates resources without errors. Outputs contain expected values. CI workflow comments plan on PRs, auto-applies on main branch merges.

**If fail:** Plan failures? Run `terraform validate` to catch syntax errors. State lock errors? Identify lock holder with `aws dynamodb get-item --table-name terraform-lock --key '{"LockID":{"S":"terraform-state-bucket/key"}}'` and force-unlock if stale. Apply failures? Check CloudWatch logs for provider-specific errors. Use `terraform show` to inspect current state.

### Step 5: Manage State and Implement Drift Detection

Configure state locking, backup, automated drift detection.

```bash
# Create DynamoDB table for state locking
cat > state-backend.tf <<'EOF'
resource "aws_dynamodb_table" "terraform_lock" {
  name           = "terraform-lock"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LockID"
# ... (see EXAMPLES.md for complete configuration)
```

For automated drift detection:

```bash
# Create drift detection script
cat > scripts/detect-drift.sh <<'EOF'
#!/bin/bash
set -euo pipefail

cd terraform
# ... (see EXAMPLES.md for complete configuration)
```

**Got:** State backend configured with versioning and encryption. Drift detection identifies out-of-band changes. State operations (list, show, mv, import) execute without errors. Automated drift checks run on schedule and send alerts.

**If fail:** State lock timeouts? Verify DynamoDB table exists and has correct key schema. Versioning issues? Check S3 bucket versioning status with `aws s3api get-bucket-versioning --bucket bucket-name`. Import failures? Verify resource exists and Terraform configuration matches actual resource attributes.

### Step 6: Implement Module Testing and Documentation

Add automated tests with Terratest. Generate documentation.

```go
// test/vpc_test.go
package test

import (
    "testing"

# ... (see EXAMPLES.md for complete configuration)
```

Generate documentation:

```bash
# Install terraform-docs
go install github.com/terraform-docs/terraform-docs@latest

# Generate module documentation
terraform-docs markdown table modules/vpc > modules/vpc/README.md

# ... (see EXAMPLES.md for complete configuration)
```

**Got:** Terratest validates module creates expected resources with correct configuration. Documentation auto-generates from variable descriptions and output definitions. Pre-commit hooks enforce formatting and validation before commits.

**If fail:** Terratest failures? Check AWS credentials and quotas. Long-running tests? Implement parallel execution with `t.Parallel()`. Documentation generation errors? Verify all variables have `description` attributes. Pre-commit failures? Manually run `terraform fmt` and fix validation errors.

## Checks

- [ ] Backend configured with encryption, versioning, state locking
- [ ] All modules have input validation and output values
- [ ] Workspaces isolate environment-specific state
- [ ] `terraform plan` shows no unexpected changes after apply
- [ ] Drift detection runs automatically and alerts on changes
- [ ] Modules tested with Terratest or similar framework
- [ ] Documentation auto-generated and kept up-to-date
- [ ] Secrets managed via AWS Secrets Manager, not hardcoded
- [ ] Cost estimation integrated (Infracost or similar)
- [ ] Blast radius minimized with separate state per environment

## Pitfalls

- **Hardcoded values**: Avoid hardcoding AMI IDs, AZs, account-specific values. Use data sources and variables.

- **Missing lifecycle blocks**: Resources recreate unexpectedly. Add `lifecycle { create_before_destroy = true }` to prevent downtime during updates.

- **No state locking**: Concurrent applies corrupt state. Always use DynamoDB table for locking with S3 backend.

- **Overly permissive IAM**: Terraform service account has full admin access. Implement least-privilege policies scoped to managed resources.

- **No version constraints**: Provider updates break infrastructure. Pin provider versions with `version = "~> 5.0"` constraints.

- **Secrets in state**: Sensitive values stored in plaintext state file. Use `sensitive = true` on outputs, store secrets in AWS Secrets Manager, reference via data sources.

- **No backup strategy**: State file lost or corrupted with no recovery plan. Enable S3 versioning, implement regular state backups, test recovery procedures.

- **Monolithic configuration**: Single state file manages entire infrastructure. Split into logical boundaries (networking, compute, data) to reduce blast radius.

## See Also

- `configure-git-repository` - Version control for Terraform code
- `build-ci-cd-pipeline` - Automated Terraform workflows with GitHub Actions
- `implement-gitops-workflow` - ArgoCD/Flux integration with Terraform
- `manage-kubernetes-secrets` - Secrets management in Terraform-provisioned clusters
- `deploy-to-kubernetes` - Terraform Kubernetes provider usage
