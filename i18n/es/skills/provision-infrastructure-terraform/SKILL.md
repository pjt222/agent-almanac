---
name: provision-infrastructure-terraform
description: >
  Provisiona y gestiona infraestructura en la nube usando Terraform con módulos HCL, backends
  de estado remoto, espacios de trabajo y flujo de trabajo plan/apply. Implementa patrones de
  infraestructura como código con gestión de variables, valores de salida y bloqueo de estado
  para colaboración en equipo. Útil al aprovisionar nueva infraestructura en la nube, migrar
  de ClickOps o CloudFormation a IaC declarativa, gestionar infraestructura multientorno,
  versionar cambios de infraestructura junto al código de aplicación, o aplicar estándares
  mediante módulos reutilizables.
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
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

# Aprovisionar Infraestructura con Terraform

Implementa infraestructura como código usando Terraform para aprovisionar, versionar y gestionar recursos en la nube en AWS, Azure, GCP y otros proveedores.

## Cuándo Usar

- Al aprovisionar nueva infraestructura en la nube (VPCs, cómputo, almacenamiento, bases de datos)
- Al migrar de ClickOps o CloudFormation a IaC declarativa
- Al gestionar infraestructura multientorno (dev, staging, producción)
- Al implementar patrones de infraestructura reproducibles entre equipos
- Al versionar cambios de infraestructura junto al código de aplicación
- Al aplicar estándares de infraestructura mediante módulos reutilizables

## Entradas

- **Requerido**: CLI de Terraform instalado (`terraform --version`)
- **Requerido**: Credenciales del proveedor de nube (cuentas de servicio AWS, Azure, GCP)
- **Requerido**: Configuración del backend de estado remoto (S3, Azure Storage, Terraform Cloud)
- **Opcional**: Infraestructura existente para importar o migrar
- **Opcional**: Terraform Cloud/Enterprise para colaboración en equipo
- **Opcional**: Hooks de pre-commit para validación y formateo

## Procedimiento

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md) para archivos de configuración completos y plantillas.


### Paso 1: Inicializar la Estructura del Proyecto Terraform

Crea una estructura de directorios organizada con configuración del backend y configuración del proveedor.

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

**Esperado:** Terraform se inicializa exitosamente, descarga plugins del proveedor, configura el backend remoto. El directorio `.terraform/` se crea con los binarios del proveedor. Se verifica la conexión al backend de estado.

**En caso de fallo:** Si la inicialización del backend falla, verifica que el bucket S3 existe y que los permisos IAM permiten `s3:GetObject`, `s3:PutObject`, `dynamodb:GetItem`, `dynamodb:PutItem`. Para fallos de descarga del proveedor, comprueba la conectividad de red y la configuración de proxy corporativo. Ejecuta `terraform init -upgrade` para actualizar los proveedores.

### Paso 2: Crear Módulos de Infraestructura Reutilizables

Construye módulos componibles para VPC, cómputo e infraestructura de datos con validación de entradas.

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

**Esperado:** El módulo crea una VPC con subredes públicas/privadas en múltiples AZs, una puerta de enlace de internet y puertas de enlace NAT con EIPs. Los valores de salida exponen los IDs de recursos para módulos descendentes.

**En caso de fallo:** Para errores de superposición de CIDR, ajusta el cálculo de `cidrsubnet()` o valida que el CIDR de la VPC no entre en conflicto con redes existentes. Para errores de dependencia, verifica que los bloques `depends_on` garantizan el orden correcto de creación de recursos. Usa `terraform graph | dot -Tpng > graph.png` para visualizar las dependencias.

### Paso 3: Implementar Configuraciones Específicas por Entorno

Crea espacios de trabajo de entorno con anulaciones de variables y fuentes de datos.

```hcl
# environments/prod/main.tf
terraform {
  required_version = ">= 1.6"
}

# Import shared backend and provider config
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** La configuración específica del entorno crea infraestructura de tamaño productivo con 3 AZs, tipos de instancias más grandes y configuraciones de seguridad de producción. Las fuentes de datos resuelven la última AMI. Los archivos de plantilla se renderizan con variables de entorno.

**En caso de fallo:** Para errores de espacio de trabajo, crea el espacio de trabajo con `terraform workspace new prod`. Para fallos de fuente de datos, verifica que las credenciales AWS tengan permisos `ec2:DescribeImages`. Para errores de renderizado de plantillas, valida que los tipos de variables coincidan con las expectativas de la plantilla.

### Paso 4: Ejecutar el Flujo de Trabajo Plan y Apply

Ejecuta el plan de Terraform, revisa los cambios y aplica con flujo de aprobación.

```bash
# Format code
terraform fmt -recursive

# Validate configuration
terraform validate

# ... (see EXAMPLES.md for complete configuration)
```

Para integración automatizada de CI/CD:

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  pull_request:
    paths:
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** El plan muestra adiciones/cambios/eliminaciones de recursos. No se detecta desvío. Apply crea/actualiza recursos sin errores. Las salidas contienen los valores esperados. El flujo de trabajo CI comenta el plan en los PRs y aplica automáticamente en fusiones a la rama main.

**En caso de fallo:** Para fallos del plan, ejecuta `terraform validate` para detectar errores de sintaxis. Para errores de bloqueo de estado, identifica al titular del bloqueo con `aws dynamodb get-item --table-name terraform-lock --key '{"LockID":{"S":"terraform-state-bucket/key"}}'` y fuerza el desbloqueo si está obsoleto. Para fallos de apply, comprueba los registros de CloudWatch para errores específicos del proveedor. Usa `terraform show` para inspeccionar el estado actual.

### Paso 5: Gestionar el Estado e Implementar Detección de Desvío

Configura el bloqueo de estado, la copia de seguridad y la detección automatizada de desvío.

```bash
# Create DynamoDB table for state locking
cat > state-backend.tf <<'EOF'
resource "aws_dynamodb_table" "terraform_lock" {
  name           = "terraform-lock"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LockID"
# ... (see EXAMPLES.md for complete configuration)
```

Para detección automatizada de desvío:

```bash
# Create drift detection script
cat > scripts/detect-drift.sh <<'EOF'
#!/bin/bash
set -euo pipefail

cd terraform
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** El backend de estado configurado con versionado y cifrado. La detección de desvío identifica cambios fuera de banda. Las operaciones de estado (list, show, mv, import) se ejecutan sin errores. Las verificaciones automáticas de desvío se ejecutan según programación y envían alertas.

**En caso de fallo:** Para tiempos de espera de bloqueo de estado, verifica que la tabla DynamoDB existe y tiene el esquema de clave correcto. Para problemas de versionado, comprueba el estado del versionado del bucket S3 con `aws s3api get-bucket-versioning --bucket bucket-name`. Para fallos de importación, verifica que el recurso existe y que la configuración de Terraform coincide con los atributos reales del recurso.

### Paso 6: Implementar Pruebas y Documentación de Módulos

Agrega pruebas automatizadas con Terratest y genera documentación.

```go
// test/vpc_test.go
package test

import (
    "testing"

# ... (see EXAMPLES.md for complete configuration)
```

Generar documentación:

```bash
# Install terraform-docs
go install github.com/terraform-docs/terraform-docs@latest

# Generate module documentation
terraform-docs markdown table modules/vpc > modules/vpc/README.md

# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** Terratest valida que el módulo crea los recursos esperados con la configuración correcta. La documentación se genera automáticamente a partir de descripciones de variables y definiciones de salidas. Los hooks de pre-commit aplican el formateo y la validación antes de los commits.

**En caso de fallo:** Para fallos de Terratest, verifica las credenciales AWS y las cuotas. Para pruebas de larga duración, implementa ejecución paralela con `t.Parallel()`. Para errores de generación de documentación, verifica que todas las variables tienen atributos `description`. Para fallos de pre-commit, ejecuta `terraform fmt` manualmente y corrige los errores de validación.

## Validación

- [ ] Backend configurado con cifrado, versionado y bloqueo de estado
- [ ] Todos los módulos tienen validación de entradas y valores de salida
- [ ] Los espacios de trabajo aíslan el estado específico del entorno
- [ ] `terraform plan` no muestra cambios inesperados después del apply
- [ ] La detección de desvío se ejecuta automáticamente y alerta sobre cambios
- [ ] Los módulos se prueban con Terratest o un marco similar
- [ ] La documentación se genera automáticamente y se mantiene actualizada
- [ ] Los secretos se gestionan a través de AWS Secrets Manager, no codificados
- [ ] La estimación de costos está integrada (Infracost o similar)
- [ ] El radio de explosión se minimiza con estado separado por entorno

## Errores Comunes

- **Valores codificados**: Evita codificar IDs de AMI, AZs o valores específicos de cuenta. Usa fuentes de datos y variables.

- **Bloques lifecycle faltantes**: Los recursos se recrean inesperadamente. Agrega `lifecycle { create_before_destroy = true }` para prevenir tiempo de inactividad durante las actualizaciones.

- **Sin bloqueo de estado**: Los applies concurrentes corrompen el estado. Siempre usa una tabla DynamoDB para el bloqueo con el backend S3.

- **IAM demasiado permisivo**: La cuenta de servicio de Terraform tiene acceso de administrador completo. Implementa políticas de mínimo privilegio limitadas a los recursos gestionados.

- **Sin restricciones de versión**: Las actualizaciones del proveedor rompen la infraestructura. Fija las versiones del proveedor con restricciones `version = "~> 5.0"`.

- **Secretos en el estado**: Los valores sensibles se almacenan en texto plano en el archivo de estado. Usa `sensitive = true` en las salidas, almacena los secretos en AWS Secrets Manager y referencialos mediante fuentes de datos.

- **Sin estrategia de copia de seguridad**: El archivo de estado se pierde o corrompe sin un plan de recuperación. Habilita el versionado S3, implementa copias de seguridad regulares del estado y prueba los procedimientos de recuperación.

- **Configuración monolítica**: Un único archivo de estado gestiona toda la infraestructura. Divídelo en límites lógicos (redes, cómputo, datos) para reducir el radio de explosión.

## Habilidades Relacionadas

- `configure-git-repository` - Control de versiones para código Terraform
- `build-ci-cd-pipeline` - Flujos de trabajo automatizados de Terraform con GitHub Actions
- `implement-gitops-workflow` - Integración de ArgoCD/Flux con Terraform
- `manage-kubernetes-secrets` - Gestión de secretos en clústeres aprovisionados por Terraform
- `deploy-to-kubernetes` - Uso del proveedor Kubernetes de Terraform
