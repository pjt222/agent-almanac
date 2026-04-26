---
name: provision-infrastructure-terraform
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Provision + manage cloud infrastructure via Terraform: HCL modules, remote
  state backends, workspaces, plan/apply workflow. IaC patterns w/ var mgmt,
  outputs, state locking for team collab. Use → new cloud infra, ClickOps/
  CloudFormation → declarative IaC, multi-env infra, version infra w/ app
  code, enforce standards via reusable modules.
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

IaC via Terraform → provision, version, manage cloud resources across AWS, Azure, GCP, other providers.

## Use When

- New cloud infra (VPCs, compute, storage, DBs)
- Migrate ClickOps/CloudFormation → declarative IaC
- Multi-env infra (dev, staging, prod)
- Reproducible infra patterns across teams
- Version infra changes w/ app code
- Enforce infra standards via reusable modules

## In

- **Required**: Terraform CLI installed (`terraform --version`)
- **Required**: Cloud provider creds (AWS, Azure, GCP service accounts)
- **Required**: Remote state backend config (S3, Azure Storage, Terraform Cloud)
- **Optional**: Existing infra to import or migrate
- **Optional**: Terraform Cloud/Enterprise for team collab
- **Optional**: Pre-commit hooks for validation + formatting

## Do

> See [Extended Examples](references/EXAMPLES.md) for complete config files + templates.


### Step 1: Init Terraform Project Structure

Organized dir structure w/ backend config + provider setup.

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

→ Terraform inits successfully, downloads provider plugins, configs remote backend. `.terraform/` w/ provider binaries. State backend connection verified.

If err: backend init fails → verify S3 bucket exists + IAM perms allow `s3:GetObject`, `s3:PutObject`, `dynamodb:GetItem`, `dynamodb:PutItem`. Provider download fails → check network + corporate proxy. `terraform init -upgrade` to update.

### Step 2: Create Reusable Infra Modules

Composable modules for VPC, compute, data infra w/ input validation.

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

→ Module creates VPC w/ public/private subnets across AZs, IGW, NAT GWs w/ EIPs. Outputs expose resource IDs for downstream modules.

If err: CIDR overlap → adjust `cidrsubnet()` calc or validate VPC CIDR doesn't conflict. Dependency errors → verify `depends_on` ensures proper creation order. `terraform graph | dot -Tpng > graph.png` to viz.

### Step 3: Implement Env-Specific Configs

Env workspaces w/ var overrides + data sources.

```hcl
# environments/prod/main.tf
terraform {
  required_version = ">= 1.6"
}

# Import shared backend and provider config
# ... (see EXAMPLES.md for complete configuration)
```

→ Env-specific config creates prod-sized infra w/ 3 AZs, larger instance types, prod security. Data sources resolve latest AMI. Templates render w/ env vars.

If err: workspace errors → `terraform workspace new prod`. Data source fails → verify AWS creds have `ec2:DescribeImages` perms. Template rendering errors → validate var types match template expectations.

### Step 4: Execute Plan + Apply Workflow

Run plan, review changes, apply w/ approval.

```bash
# Format code
terraform fmt -recursive

# Validate configuration
terraform validate

# ... (see EXAMPLES.md for complete configuration)
```

CI/CD integration:

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  pull_request:
    paths:
# ... (see EXAMPLES.md for complete configuration)
```

→ Plan shows resource additions/changes/deletions. No drift detected. Apply creates/updates w/o errors. Outputs contain expected values. CI workflow comments plan on PRs, auto-applies on main merges.

If err: plan fails → `terraform validate` for syntax. State lock errors → identify holder via `aws dynamodb get-item --table-name terraform-lock --key '{"LockID":{"S":"terraform-state-bucket/key"}}'`, force-unlock if stale. Apply fails → check CloudWatch for provider errors. `terraform show` to inspect current state.

### Step 5: Manage State + Drift Detection

State locking, backup, automated drift detection.

```bash
# Create DynamoDB table for state locking
cat > state-backend.tf <<'EOF'
resource "aws_dynamodb_table" "terraform_lock" {
  name           = "terraform-lock"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LockID"
# ... (see EXAMPLES.md for complete configuration)
```

Auto drift detection:

```bash
# Create drift detection script
cat > scripts/detect-drift.sh <<'EOF'
#!/bin/bash
set -euo pipefail

cd terraform
# ... (see EXAMPLES.md for complete configuration)
```

→ State backend w/ versioning + encryption. Drift detection IDs out-of-band changes. State ops (list, show, mv, import) w/o errors. Auto drift checks on schedule + alerts.

If err: state lock timeouts → verify DynamoDB table exists w/ correct key schema. Versioning issues → check S3 versioning via `aws s3api get-bucket-versioning --bucket bucket-name`. Import fails → verify resource exists + Terraform config matches actual attributes.

### Step 6: Module Testing + Documentation

Auto tests w/ Terratest + generate docs.

```go
// test/vpc_test.go
package test

import (
    "testing"

# ... (see EXAMPLES.md for complete configuration)
```

Generate docs:

```bash
# Install terraform-docs
go install github.com/terraform-docs/terraform-docs@latest

# Generate module documentation
terraform-docs markdown table modules/vpc > modules/vpc/README.md

# ... (see EXAMPLES.md for complete configuration)
```

→ Terratest validates module creates expected resources w/ correct config. Docs auto-gen from var descriptions + outputs. Pre-commit hooks enforce formatting + validation.

If err: Terratest fails → check AWS creds + quotas. Long tests → parallel via `t.Parallel()`. Doc gen errors → verify all vars have `description`. Pre-commit fails → manually `terraform fmt` + fix validation.

## Check

- [ ] Backend w/ encryption, versioning, state locking
- [ ] All modules have input validation + outputs
- [ ] Workspaces isolate env-specific state
- [ ] `terraform plan` shows no unexpected changes after apply
- [ ] Drift detection auto runs + alerts
- [ ] Modules tested w/ Terratest or similar
- [ ] Docs auto-gen + up-to-date
- [ ] Secrets via AWS Secrets Manager, not hardcoded
- [ ] Cost estimation integrated (Infracost or similar)
- [ ] Blast radius min w/ separate state per env

## Traps

- **Hardcoded values**: Avoid AMI IDs, AZs, account-specific. Use data sources + vars.
- **Missing lifecycle blocks**: Resources recreate unexpectedly. Add `lifecycle { create_before_destroy = true }` → prevent downtime during updates.
- **No state locking**: Concurrent applies corrupt state. Always DynamoDB for locking w/ S3 backend.
- **Overly permissive IAM**: Terraform service account full admin. Implement least-privilege scoped to managed resources.
- **No version constraints**: Provider updates break infra. Pin via `version = "~> 5.0"` constraints.
- **Secrets in state**: Sensitive values plaintext in state. Use `sensitive = true` on outputs, store in AWS Secrets Manager, ref via data sources.
- **No backup strategy**: State file lost/corrupted, no recovery plan. Enable S3 versioning, regular backups, test recovery.
- **Monolithic config**: Single state file manages everything. Split into logical boundaries (networking, compute, data) → reduce blast radius.

## →

- `configure-git-repository` — version control for Terraform code
- `build-ci-cd-pipeline` — automated Terraform workflows w/ GitHub Actions
- `implement-gitops-workflow` — ArgoCD/Flux integration w/ Terraform
- `manage-kubernetes-secrets` — secrets mgmt in Terraform-provisioned clusters
- `deploy-to-kubernetes` — Terraform Kubernetes provider usage
