---
name: provision-infrastructure-terraform
description: >
  Cloud-Infrastruktur mit Terraform bereitstellen und verwalten — mit HCL-Modulen,
  Remote-State-Backends, Workspaces und Plan/Apply-Workflow. Infrastructure-as-Code-Muster
  mit Variablenverwaltung, Ausgabewerten und State-Locking fuer die Zusammenarbeit im
  Team implementieren. Einsatz beim Bereitstellen neuer Cloud-Infrastruktur, bei der
  Migration von ClickOps oder CloudFormation zu deklarativem IaC, beim Verwalten
  mehrerer Umgebungen, beim Versionieren von Infrastruktureaenderungen neben dem
  Anwendungscode oder beim Durchsetzen von Standards ueber wiederverwendbare Module.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
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

# Infrastruktur mit Terraform bereitstellen

Infrastructure as Code mit Terraform implementieren, um Cloud-Ressourcen ueber AWS, Azure, GCP und andere Anbieter bereitzustellen, zu versionieren und zu verwalten.

## Wann verwenden

- Neue Cloud-Infrastruktur bereitstellen (VPCs, Compute, Storage, Datenbanken)
- Von ClickOps oder CloudFormation zu deklarativem IaC migrieren
- Infrastruktur fuer mehrere Umgebungen verwalten (Dev, Staging, Production)
- Reproduzierbare Infrastrukturmuster teamuebergreifend implementieren
- Infrastruktureaenderungen neben dem Anwendungscode versionieren
- Infrastrukturstandards durch wiederverwendbare Module durchsetzen

## Eingaben

- **Erforderlich**: Terraform CLI installiert (`terraform --version`)
- **Erforderlich**: Cloud-Provider-Credentials (AWS, Azure, GCP-Dienstkonten)
- **Erforderlich**: Remote-State-Backend-Konfiguration (S3, Azure Storage, Terraform Cloud)
- **Optional**: Bestehende Infrastruktur zum Importieren oder Migrieren
- **Optional**: Terraform Cloud/Enterprise fuer die Teamzusammenarbeit
- **Optional**: Pre-commit-Hooks fuer Validierung und Formatierung

## Vorgehensweise

> Siehe [Erweiterte Beispiele](references/EXAMPLES.md) fuer vollstaendige Konfigurationsdateien und Vorlagen.

### Schritt 1: Terraform-Projektstruktur initialisieren

Organisierte Verzeichnisstruktur mit Backend-Konfiguration und Provider-Einrichtung erstellen.

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

**Erwartet:** Terraform initialisiert erfolgreich, laedt Provider-Plugins herunter, konfiguriert Remote-Backend. Das Verzeichnis `.terraform/` wird mit Provider-Binaerdateien erstellt. State-Backend-Verbindung verifiziert.

**Bei Fehler:** Wenn die Backend-Initialisierung fehlschlaegt, pruefen, ob der S3-Bucket existiert und IAM-Berechtigungen `s3:GetObject`, `s3:PutObject`, `dynamodb:GetItem`, `dynamodb:PutItem` erlauben. Bei Provider-Download-Fehlern Netzwerkkonnektivitaet und Unternehmens-Proxy pruefen. `terraform init -upgrade` ausfuehren, um Provider zu aktualisieren.

### Schritt 2: Wiederverwendbare Infrastrukturmodule erstellen

Zusammensetzbare Module fuer VPC-, Compute- und Daten-Infrastruktur mit Eingabevalidierung erstellen.

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

**Erwartet:** Modul erstellt VPC mit oeffentlichen/privaten Subnetzen ueber mehrere AZs, Internet-Gateway, NAT-Gateways mit EIPs. Ausgabewerte stellen Ressource-IDs fuer nachgelagerte Module bereit.

**Bei Fehler:** Bei CIDR-Ueberlappungsfehlern die `cidrsubnet()`-Berechnung anpassen oder pruefen, ob das VPC-CIDR nicht mit bestehenden Netzwerken kollidiert.

### Schritt 3: Umgebungsspezifische Konfigurationen implementieren

Umgebungs-Workspaces mit Variablenueberschreibungen und Datenquellen erstellen.

```hcl
# environments/prod/main.tf
terraform {
  required_version = ">= 1.6"
}

# Import shared backend and provider config
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** Umgebungsspezifische Konfiguration erstellt produktionsgrosse Infrastruktur mit 3 AZs, groesseren Instanztypen und Produktions-Sicherheitseinstellungen.

**Bei Fehler:** Bei Workspace-Fehlern den Workspace mit `terraform workspace new prod` erstellen. Bei Datenquellen-Fehlern pruefen, ob AWS-Credentials `ec2:DescribeImages`-Berechtigungen haben.

### Schritt 4: Plan- und Apply-Workflow ausfuehren

Terraform-Plan ausfuehren, Aenderungen pruefen und mit Genehmigungsworkflow anwenden.

```bash
# Format code
terraform fmt -recursive

# Validate configuration
terraform validate

# ... (see EXAMPLES.md for complete configuration)
```

Fuer automatisierte CI/CD-Integration:

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  pull_request:
    paths:
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** Plan zeigt Ressourcenhinzufuegungen/-aenderungen/-loeschungen. Kein Drift erkannt. Apply erstellt/aktualisiert Ressourcen ohne Fehler. CI-Workflow kommentiert Plan in PRs, wendet automatisch bei Main-Branch-Merges an.

**Bei Fehler:** Bei Plan-Fehlern `terraform validate` ausfuehren, um Syntaxfehler zu finden. Bei State-Lock-Fehlern den Lock-Inhaber ermitteln und bei Bedarf entsperren.

### Schritt 5: State verwalten und Drift-Erkennung implementieren

State-Locking, Backup und automatisierte Drift-Erkennung konfigurieren.

```bash
# Create DynamoDB table for state locking
cat > state-backend.tf <<'EOF'
resource "aws_dynamodb_table" "terraform_lock" {
  name           = "terraform-lock"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LockID"
# ... (see EXAMPLES.md for complete configuration)
```

Fuer automatisierte Drift-Erkennung:

```bash
# Create drift detection script
cat > scripts/detect-drift.sh <<'EOF'
#!/bin/bash
set -euo pipefail

cd terraform
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** State-Backend mit Versionierung und Verschluesselung konfiguriert. Drift-Erkennung identifiziert ausserplanmaessige Aenderungen. State-Operationen (list, show, mv, import) werden fehlerfrei ausgefuehrt.

**Bei Fehler:** Bei State-Lock-Timeouts pruefen, ob die DynamoDB-Tabelle existiert und das korrekte Key-Schema hat.

### Schritt 6: Modultests und Dokumentation implementieren

Automatisierte Tests mit Terratest hinzufuegen und Dokumentation generieren.

```go
// test/vpc_test.go
package test

import (
    "testing"

# ... (see EXAMPLES.md for complete configuration)
```

Dokumentation generieren:

```bash
# Install terraform-docs
go install github.com/terraform-docs/terraform-docs@latest

# Generate module documentation
terraform-docs markdown table modules/vpc > modules/vpc/README.md

# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** Terratest validiert, dass das Modul die erwarteten Ressourcen mit korrekter Konfiguration erstellt. Dokumentation wird automatisch aus Variablenbeschreibungen und Ausgabedefinitionen generiert.

**Bei Fehler:** Bei Terratest-Fehlern AWS-Credentials und Kontingente pruefen. Bei Dokumentationsgenerierungsfehlern sicherstellen, dass alle Variablen `description`-Attribute haben.

## Validierung

- [ ] Backend mit Verschluesselung, Versionierung und State-Locking konfiguriert
- [ ] Alle Module haben Eingabevalidierung und Ausgabewerte
- [ ] Workspaces isolieren umgebungsspezifischen State
- [ ] `terraform plan` zeigt nach dem Apply keine unerwarteten Aenderungen
- [ ] Drift-Erkennung laeuft automatisch und gibt bei Aenderungen Alarm
- [ ] Module mit Terratest oder aehnlichem Framework getestet
- [ ] Dokumentation automatisch generiert und aktuell gehalten
- [ ] Secrets werden ueber AWS Secrets Manager verwaltet, nicht hartcodiert
- [ ] Kostenschaetzung integriert (Infracost oder aehnlich)
- [ ] Blast Radius durch separaten State pro Umgebung minimiert

## Haeufige Stolperfallen

- **Hartcodierte Werte**: AMI-IDs, AZs oder kontospezifische Werte nicht hartcodieren. Datenquellen und Variablen verwenden.

- **Fehlende lifecycle-Bloecke**: Ressourcen werden unerwartet neu erstellt. `lifecycle { create_before_destroy = true }` hinzufuegen, um Ausfallzeiten bei Updates zu verhindern.

- **Kein State-Locking**: Gleichzeitige Applies korrumpieren den State. Immer DynamoDB-Tabelle fuer Locking mit S3-Backend verwenden.

- **Zu grosszuegige IAM-Berechtigungen**: Terraform-Dienstkonto hat vollen Admin-Zugriff. Least-Privilege-Richtlinien auf verwaltete Ressourcen beschraenken.

- **Keine Versionseinschraenkungen**: Provider-Updates beschaedigen Infrastruktur. Provider-Versionen mit `version = "~> 5.0"`-Einschraenkungen fixieren.

- **Secrets im State**: Sensible Werte im Klartext in der State-Datei. `sensitive = true` bei Ausgaben verwenden, Secrets in AWS Secrets Manager speichern, ueber Datenquellen referenzieren.

- **Keine Backup-Strategie**: State-Datei verloren oder beschaedigt ohne Wiederherstellungsplan. S3-Versionierung aktivieren, regelmaessige State-Backups implementieren, Wiederherstellungsverfahren testen.

- **Monolithische Konfiguration**: Eine einzige State-Datei verwaltet die gesamte Infrastruktur. In logische Bereiche aufteilen (Netzwerk, Compute, Daten), um den Blast Radius zu reduzieren.

## Verwandte Skills

- `configure-git-repository` - Versionskontrolle fuer Terraform-Code
- `build-ci-cd-pipeline` - Automatisierte Terraform-Workflows mit GitHub Actions
- `implement-gitops-workflow` - ArgoCD/Flux-Integration mit Terraform
- `manage-kubernetes-secrets` - Secrets-Verwaltung in Terraform-bereitgestellten Clustern
- `deploy-to-kubernetes` - Terraform Kubernetes-Provider-Verwendung
