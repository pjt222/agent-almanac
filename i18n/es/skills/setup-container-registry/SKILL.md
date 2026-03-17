---
name: setup-container-registry
description: >
  Configura registros de imágenes de contenedor incluyendo GitHub Container Registry (ghcr.io),
  Docker Hub y Harbor con escaneo automatizado de imágenes, estrategias de etiquetado, políticas
  de retención e integración CI/CD para distribución segura de imágenes. Útil al configurar un
  registro de contenedores privado, migrar de Docker Hub a registros autoalojados, implementar
  escaneo de vulnerabilidades en pipelines CI/CD, gestionar imágenes multi-arquitectura, aplicar
  la firma de imágenes o configurar políticas automáticas de limpieza y retención.
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
  complexity: basic
  language: multi
  tags: container-registry, docker-hub, ghcr, harbor, vulnerability-scanning
---

# Configurar Registro de Contenedores

Configura registros de contenedores listos para producción con escaneo de seguridad, control de acceso e integración automatizada con CI/CD.

## Cuándo Usar

- Al configurar un registro de contenedores privado para una organización
- Al migrar de Docker Hub a registros autoalojados o alternativos
- Al implementar escaneo de vulnerabilidades de imágenes en pipelines CI/CD
- Al gestionar imágenes multi-arquitectura (amd64, arm64) con manifiestos
- Al aplicar la firma de imágenes y la verificación de procedencia
- Al configurar limpieza automática de imágenes y políticas de retención

## Entradas

- **Requerido**: Docker o Podman instalado localmente
- **Requerido**: Credenciales del registro (tokens de acceso personal, cuentas de servicio)
- **Opcional**: Infraestructura autoalojada para el despliegue de Harbor
- **Opcional**: Clúster Kubernetes para integración con el registro
- **Opcional**: Cosign/Notary para la firma de imágenes
- **Opcional**: Trivy o Clair para escaneo de vulnerabilidades

## Procedimiento

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md) para archivos de configuración completos y plantillas.


### Paso 1: Configurar GitHub Container Registry (ghcr.io)

Configura GitHub Container Registry con tokens de acceso personal e integración CI/CD.

```bash
# Create GitHub Personal Access Token
# Go to: Settings → Developer settings → Personal access tokens → Tokens (classic)
# Required scopes: write:packages, read:packages, delete:packages

# Login to ghcr.io
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Verify login
docker info | grep -A 5 "Registry:"

# Tag image for ghcr.io
docker tag myapp:latest ghcr.io/USERNAME/myapp:latest
docker tag myapp:latest ghcr.io/USERNAME/myapp:v1.0.0

# Push image
docker push ghcr.io/USERNAME/myapp:latest
docker push ghcr.io/USERNAME/myapp:v1.0.0

# Configure in GitHub Actions
cat > .github/workflows/docker-build.yml <<'EOF'
name: Build and Push Docker Image

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
EOF

# Make package public (default is private)
# Go to: github.com/USERNAME?tab=packages → Select package → Package settings → Change visibility

# Pull image (public packages don't require authentication)
docker pull ghcr.io/USERNAME/myapp:latest
```

**Esperado:** El token de GitHub tiene permisos de paquete. El inicio de sesión en Docker se realiza correctamente. Las imágenes se envían a ghcr.io con el etiquetado adecuado. El flujo de trabajo de GitHub Actions construye imágenes multi-arquitectura con etiquetado automatizado. La visibilidad del paquete está configurada correctamente.

**En caso de fallo:** Para errores de autenticación, verifica que el token tenga el ámbito `write:packages` y no haya caducado. Para fallos de envío, comprueba que el nombre del repositorio coincida con el nombre de la imagen (distingue mayúsculas de minúsculas). Para fallos del flujo de trabajo, verifica que `permissions: packages: write` esté configurado. Para paquetes públicos no accesibles, espera hasta 10 minutos para que el cambio de visibilidad se propague.

### Paso 2: Configurar Docker Hub con Compilaciones Automatizadas

Configura el repositorio de Docker Hub con tokens de acceso y escaneo de vulnerabilidades.

```bash
# Create Docker Hub access token
# Go to: hub.docker.com → Account Settings → Security → New Access Token

# Login to Docker Hub
echo $DOCKERHUB_TOKEN | docker login -u USERNAME --password-stdin

# Create repository
# Go to: hub.docker.com → Repositories → Create Repository
# Select: public or private, enable vulnerability scanning (Pro/Team plan)

# Tag for Docker Hub
docker tag myapp:latest USERNAME/myapp:latest
docker tag myapp:latest USERNAME/myapp:v1.0.0

# Push to Docker Hub
docker push USERNAME/myapp:latest
docker push USERNAME/myapp:v1.0.0

# Configure automated builds (legacy feature, deprecated)
# Modern approach: Use GitHub Actions with Docker Hub

cat > .github/workflows/dockerhub.yml <<'EOF'
name: Docker Hub Push

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64,linux/arm/v7
          push: true
          tags: |
            ${{ secrets.DOCKERHUB_USERNAME }}/myapp:latest
            ${{ secrets.DOCKERHUB_USERNAME }}/myapp:${{ github.ref_name }}
          build-args: |
            BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
            VCS_REF=${{ github.sha }}

      - name: Update Docker Hub description
        uses: peter-evans/dockerhub-description@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
          repository: ${{ secrets.DOCKERHUB_USERNAME }}/myapp
          readme-filepath: ./README.md
EOF

# View vulnerability scan results
# Go to: hub.docker.com → Repository → Tags → View scan results

# Configure webhook for automated triggers
# Go to: Repository → Webhooks → Add webhook
WEBHOOK_URL="https://example.com/webhook"
curl -X POST https://hub.docker.com/api/content/v1/repositories/USERNAME/myapp/webhooks \
  -H "Authorization: Bearer $DOCKERHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"CI Trigger\",\"webhook_url\":\"$WEBHOOK_URL\"}"
```

**Esperado:** Token de acceso de Docker Hub creado con permisos de lectura/escritura. Las imágenes se envían correctamente con soporte multi-arquitectura. Los escaneos de vulnerabilidades se ejecutan automáticamente (si están habilitados). El README se sincroniza desde GitHub. Los webhooks se activan al enviar imágenes.

**En caso de fallo:** Para errores de límite de velocidad, actualiza al plan Pro o implementa una caché de extracción. Para fallos de escaneo, verifica que el plan incluya escaneo (no disponible en el nivel gratuito). Para fallos de compilación multi-arquitectura, asegúrate de que QEMU esté instalado con `docker run --privileged --rm tonistiigi/binfmt --install all`. Para fallos de webhook, verifica que el punto de conexión sea accesible públicamente y devuelva 200 OK.

### Paso 3: Desplegar Harbor Registro Autoalojado

Instala Harbor con Helm para un registro empresarial con RBAC y replicación.

```bash
# Add Harbor Helm repository
helm repo add harbor https://helm.gopharbor.io
helm repo update

# Create namespace
kubectl create namespace harbor

# Create values file
cat > harbor-values.yaml <<EOF
expose:
  type: ingress
  tls:
    enabled: true
    certSource: secret
    secret:
      secretName: harbor-tls
  ingress:
    hosts:
      core: harbor.example.com
    className: nginx
    annotations:
      cert-manager.io/cluster-issuer: letsencrypt-prod

externalURL: https://harbor.example.com

persistence:
  enabled: true
  persistentVolumeClaim:
    registry:
      size: 200Gi
      storageClass: gp3
    database:
      size: 10Gi
      storageClass: gp3

harborAdminPassword: "ChangeMe123!"

database:
  type: internal  # Use external: postgres for production

redis:
  type: internal  # Use external: redis for production

trivy:
  enabled: true
  skipUpdate: false

notary:
  enabled: true  # Image signing

chartmuseum:
  enabled: true  # Helm chart storage
EOF

# Install Harbor
helm install harbor harbor/harbor \
  --namespace harbor \
  --values harbor-values.yaml \
  --timeout 10m

# Wait for pods to be ready
kubectl get pods -n harbor -w

# Get admin password
kubectl get secret -n harbor harbor-core -o jsonpath='{.data.HARBOR_ADMIN_PASSWORD}' | base64 -d

# Access Harbor UI
echo "Harbor UI: https://harbor.example.com"
echo "Username: admin"

# Login via Docker CLI
docker login harbor.example.com
# Username: admin
# Password: (from above)

# Create project via API
curl -u "admin:$HARBOR_PASSWORD" -X POST \
  https://harbor.example.com/api/v2.0/projects \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "myapp",
    "public": false,
    "metadata": {
      "auto_scan": "true",
      "severity": "high",
      "enable_content_trust": "true"
    }
  }'

# Tag and push to Harbor
docker tag myapp:latest harbor.example.com/myapp/app:latest
docker push harbor.example.com/myapp/app:latest

# Configure robot account for CI/CD
# UI: Administration → Robot Accounts → New Robot Account
# Permissions: Pull, Push to specific projects

# Use robot account in CI/CD
docker login harbor.example.com -u 'robot$myapp-ci' -p "$ROBOT_TOKEN"
```

**Esperado:** Harbor se despliega en Kubernetes con PostgreSQL y Redis. Ingress configurado con TLS. Interfaz de administración accesible. Proyectos creados con escaneo de vulnerabilidades habilitado. Las cuentas robot proporcionan autenticación para CI/CD. Trivy escanea imágenes al enviarlas.

**En caso de fallo:** Para errores de conexión a la base de datos, comprueba los registros del pod de PostgreSQL con `kubectl logs -n harbor harbor-database-0`. Para problemas de Ingress, verifica que el DNS apunte al LoadBalancer y que cert-manager haya emitido el certificado. Para fallos de Trivy, comprueba si la base de datos de vulnerabilidades se descargó correctamente. Para problemas de almacenamiento, verifica que los PVCs estén vinculados con `kubectl get pvc -n harbor`.

### Paso 4: Implementar Estrategia de Etiquetado de Imágenes y Políticas de Retención

Configura el versionado semántico, etiquetas inmutables y limpieza automática.

```bash
# Tagging best practices
# 1. Semantic versioning
docker tag myapp:latest harbor.example.com/myapp/app:v1.2.3
docker tag myapp:latest harbor.example.com/myapp/app:v1.2
docker tag myapp:latest harbor.example.com/myapp/app:v1
docker tag myapp:latest harbor.example.com/myapp/app:latest
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** Imágenes etiquetadas con versiones semánticas, SHAs de confirmación y etiquetas de entorno. Las políticas de retención limpian automáticamente imágenes antiguas basándose en antigüedad, actividad de extracción o límites de cantidad. Las etiquetas de producción (patrón v*) se retienen más tiempo que las ramas de desarrollo. Las imágenes sin etiquetar se eliminan para ahorrar almacenamiento.

**En caso de fallo:** Para que la retención no se active, verifica la sintaxis del programa cron y la configuración de zona horaria de Harbor. Para la eliminación accidental de imágenes de producción, implementa etiquetas inmutables con las reglas de inmutabilidad de etiquetas de Harbor. Si el almacenamiento sigue creciendo, verifica que la retención de artefactos incluye gráficos Helm y otros artefactos OCI. Para conflictos de política, asegúrate de que las reglas de retención usen el algoritmo `or` y no se contradigan entre sí.

### Paso 5: Configurar Secretos de Extracción de Imágenes en Kubernetes

Configura la autenticación del registro para clústeres Kubernetes.

```bash
# Create Docker registry secret
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=USERNAME \
  --docker-password=$GITHUB_TOKEN \
  --docker-email=user@example.com \
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** Secretos de extracción de imágenes creados en los namespaces de destino. Los Pods extraen correctamente imágenes de registros privados. Las cuentas de servicio incluyen imagePullSecrets. Sin errores ImagePullBackOff.

**En caso de fallo:** Para errores de autenticación, verifica las credenciales manualmente con `docker login`. Para secreto no encontrado, comprueba que el namespace coincida con el namespace del Pod. Si sigue fallando, decodifica el secreto y verifica la estructura JSON con `kubectl get secret ghcr-secret -o jsonpath='{.data.\.dockerconfigjson}' | base64 -d | jq`. Para vencimiento del token, rota las credenciales y actualiza los secretos.

### Paso 6: Habilitar el Escaneo de Vulnerabilidades y la Firma de Imágenes

Integra el escaneo con Trivy y Cosign para la procedencia de imágenes.

```bash
# Install Trivy CLI
wget https://github.com/aquasecurity/trivy/releases/latest/download/trivy_0.47.0_Linux-64bit.tar.gz
tar zxvf trivy_0.47.0_Linux-64bit.tar.gz
sudo mv trivy /usr/local/bin/

# Scan local image
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** Los escaneos de Trivy detectan vulnerabilidades con clasificaciones de gravedad. Los resultados SARIF se cargan en la pestaña de Seguridad de GitHub. Las vulnerabilidades críticas fallan las compilaciones CI/CD. Cosign firma imágenes con par de claves o sin clave (Fulcio). La verificación se realiza correctamente para imágenes firmadas. Kyverno bloquea imágenes sin firmar en Kubernetes.

**En caso de fallo:** Para fallos de descarga de la base de datos de Trivy, ejecuta `trivy image --download-db-only`. Para falsos positivos, crea un archivo `.trivyignore` con IDs de CVE y justificaciones. Para fallos de firma de Cosign, verifica que el resumen de la imagen no haya cambiado (las firmas se aplican a resúmenes específicos, no a etiquetas). Para fallos de política de Kyverno, comprueba que el patrón de referencia de imagen coincida con los nombres de imagen reales. Para la firma sin clave, verifica que el token OIDC tenga permisos suficientes.

## Validación

- [ ] Registro accesible mediante inicio de sesión de Docker CLI
- [ ] Las imágenes se envían y extraen correctamente con la autenticación adecuada
- [ ] Las imágenes multi-arquitectura se construyen y el manifiesto se crea
- [ ] El escaneo de vulnerabilidades se ejecuta automáticamente al enviar imágenes
- [ ] Las políticas de retención limpian imágenes antiguas según programación
- [ ] Los clústeres Kubernetes pueden extraer imágenes mediante imagePullSecrets
- [ ] Las firmas de imágenes se verifican antes del despliegue
- [ ] Las notificaciones webhook se activan en actualizaciones de imágenes
- [ ] La interfaz del registro muestra resultados de escaneo y metadatos de artefactos

## Errores Comunes

- **Imágenes públicas por defecto**: Los paquetes de GitHub son privados por defecto, Docker Hub público. Verifica la configuración de visibilidad según los requisitos de seguridad.

- **Vencimiento de tokens**: Los tokens de acceso personal vencen, rompiendo el CI/CD. Usa tokens sin vencimiento para la automatización o implementa rotación.

- **Acumulación de imágenes sin etiquetar**: El proceso de compilación crea imágenes sin etiquetar que consumen almacenamiento. Habilita la limpieza automática de artefactos sin etiquetar.

- **Soporte multi-arquitectura faltante**: Las compilaciones son solo para amd64, fallando en instancias ARM. Usa `docker buildx` con la opción `--platform` para compilaciones multiplataforma.

- **Sin protección contra límite de velocidad**: Las cuentas gratuitas de Docker Hub tienen un límite de 100 extracciones/6h. Implementa una caché de extracción o actualiza el plan.

- **Etiquetas mutables**: La etiqueta `latest` sobreescrita rompe la reproducibilidad. Usa etiquetas inmutables (SHA de confirmación, versión semántica) para producción.

- **Comunicación de registro insegura**: Registro autoalojado sin TLS. Usa siempre HTTPS con certificados válidos.

- **Sin control de acceso**: Una única credencial compartida entre equipos. Implementa RBAC con cuentas robot específicas por proyecto.

## Habilidades Relacionadas

- `create-r-dockerfile` - Construcción de imágenes de contenedor para el registro
- `optimize-docker-build-cache` - Compilaciones de imágenes eficientes para envío al registro
- `build-ci-cd-pipeline` - Envío automatizado al registro en CI/CD
- `deploy-to-kubernetes` - Extracción de imágenes del registro
- `implement-gitops-workflow` - Promoción de imágenes entre registros
