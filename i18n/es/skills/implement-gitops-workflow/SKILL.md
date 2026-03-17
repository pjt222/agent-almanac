---
name: implement-gitops-workflow
description: >
  Implementa entrega continua GitOps usando Argo CD o Flux con patrón app-of-apps, políticas
  de sincronización automatizadas, detección de desvío y promoción multientorno. Gestiona
  despliegues de Kubernetes declarativamente desde Git con reconciliación automatizada. Útil al
  implementar gestión declarativa de infraestructura, migrar de comandos kubectl imperativos a
  despliegues basados en Git, configurar flujos de trabajo de promoción multientorno, aplicar
  puertas de revisión de código para producción, o cumplir requisitos de auditoría y cumplimiento.
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
  tags: gitops, argocd, flux, sync, drift-detection
---

# Implementar Flujo de Trabajo GitOps

Despliega y gestiona aplicaciones Kubernetes usando principios GitOps con Argo CD o Flux para despliegues automatizados, auditables y repetibles.

## Cuándo Usar

- Al implementar gestión declarativa de infraestructura y aplicaciones
- Al migrar de comandos kubectl/helm imperativos a despliegues basados en Git
- Al configurar flujos de trabajo de promoción multientorno (dev → staging → prod)
- Al aplicar revisión de código y puertas de aprobación para despliegues en producción
- Al cumplir requisitos de conformidad y auditoría con historial de Git
- Al implementar recuperación ante desastres con Git como fuente única de verdad

## Entradas

- **Requerido**: Clúster Kubernetes con acceso de administrador (EKS, GKE, AKS o autoalojado)
- **Requerido**: Repositorio Git para manifiestos de Kubernetes y gráficos Helm
- **Requerido**: CLI de Argo CD o Flux instalada
- **Opcional**: Sealed Secrets o External Secrets Operator para gestión de secretos
- **Opcional**: Image Updater para promoción automatizada de imágenes
- **Opcional**: Prometheus para monitorear el estado de sincronización

## Procedimiento

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md) para archivos de configuración completos y plantillas.


### Paso 1: Instalar Argo CD y Configurar el Acceso al Repositorio

Despliega Argo CD en el clúster y conéctalo al repositorio Git.

```bash
# Create namespace
kubectl create namespace argocd

# Install Argo CD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s

# Install Argo CD CLI
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64

# Port-forward to access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443 &

# Get initial admin password
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
echo "Argo CD Admin Password: $ARGOCD_PASSWORD"

# Login via CLI
argocd login localhost:8080 --username admin --password "$ARGOCD_PASSWORD" --insecure

# Change admin password
argocd account update-password

# Add Git repository (HTTPS with token)
argocd repo add https://github.com/USERNAME/gitops-repo \
  --username USERNAME \
  --password "$GITHUB_TOKEN" \
  --name gitops-repo

# Or add via SSH
ssh-keygen -t ed25519 -C "argocd@cluster" -f argocd-deploy-key -N ""
# Add argocd-deploy-key.pub to GitHub repository deploy keys
argocd repo add git@github.com:USERNAME/gitops-repo.git \
  --ssh-private-key-path argocd-deploy-key \
  --name gitops-repo

# Verify repository connection
argocd repo list

# Configure Ingress for UI (optional)
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-server-ingress
  namespace: argocd
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-passthrough: "true"
    nginx.ingress.kubernetes.io/backend-protocol: "HTTPS"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - argocd.example.com
    secretName: argocd-tls
  rules:
  - host: argocd.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: argocd-server
            port:
              number: 443
EOF
```

**Esperado:** Argo CD instalado en el namespace argocd. Interfaz accesible mediante port-forward o Ingress. Contraseña de administrador cambiada desde el valor predeterminado. Repositorio Git añadido con autenticación SSH o por token. Conexión al repositorio verificada.

**En caso de fallo:** Para CrashLoopBackOff de pods, comprueba los registros con `kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server`. Para fallos de conexión al repositorio, verifica que el token tenga acceso al repositorio o que la clave SSH esté añadida a las claves de despliegue. Para problemas de SSL en Ingress, asegúrate de que cert-manager haya emitido el certificado correctamente. Para fallos de inicio de sesión, recupera la contraseña de nuevo o restablécela con `kubectl delete secret argocd-initial-admin-secret -n argocd` y reinicia el servidor.

### Paso 2: Crear Manifiestos de Aplicación y Desplegar la Primera Aplicación

Define el recurso Application de Argo CD con políticas de sincronización y verificaciones de salud.

```bash
# Create Git repository structure
mkdir -p gitops-repo/{apps,infra,projects}
cd gitops-repo

# Create sample application
mkdir -p apps/myapp/overlays/{dev,staging,prod}
mkdir -p apps/myapp/base

# Base Kustomization
cat > apps/myapp/base/kustomization.yaml <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
- deployment.yaml
- service.yaml
EOF

cat > apps/myapp/base/deployment.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: ghcr.io/username/myapp:v1.0.0
        ports:
        - containerPort: 8080
EOF

cat > apps/myapp/base/service.yaml <<EOF
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
EOF

# Production overlay
cat > apps/myapp/overlays/prod/kustomization.yaml <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: production
resources:
- ../../base
replicas:
- name: myapp
  count: 5
images:
- name: ghcr.io/username/myapp
  newTag: v1.0.0
EOF

# Commit to Git
git add .
git commit -m "Add myapp application manifests"
git push

# Create Argo CD Application
cat > argocd-apps/myapp-prod.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp-prod
  namespace: argocd
  finalizers:
  - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/USERNAME/gitops-repo
    targetRevision: main
    path: apps/myapp/overlays/prod
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true      # Delete resources removed from Git
      selfHeal: true   # Auto-sync on drift detection
      allowEmpty: false
    syncOptions:
    - CreateNamespace=true
    - PruneLast=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
  revisionHistoryLimit: 10
EOF

# Apply Application via kubectl
kubectl apply -f argocd-apps/myapp-prod.yaml

# Or create via CLI
argocd app create myapp-prod \
  --repo https://github.com/USERNAME/gitops-repo \
  --path apps/myapp/overlays/prod \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace production \
  --sync-policy automated \
  --auto-prune \
  --self-heal

# Watch sync status
argocd app get myapp-prod --watch

# Verify application
kubectl get all -n production
argocd app sync myapp-prod  # Manual sync if automated disabled
```

**Esperado:** Aplicación sincronizada automáticamente desde Git. Recursos creados en el namespace de producción. La interfaz de Argo CD muestra estado saludable. Las políticas de sincronización automatizadas habilitan la limpieza y la auto-corrección. La sincronización se realiza correctamente dentro de los límites de reintento.

**En caso de fallo:** Para fallos de sincronización, comprueba los eventos de la aplicación con `argocd app get myapp-prod` y `kubectl get events -n production`. Para errores de compilación de Kustomize, prueba localmente con `kustomize build apps/myapp/overlays/prod`. Para errores de namespace, verifica que el namespace existe o habilita la opción de sincronización CreateNamespace. Para problemas de limpieza, comprueba los finalizadores y las referencias de propietario con `kubectl get <resource> -o yaml`.

### Paso 3: Implementar el Patrón App-of-Apps para la Gestión Multientorno

Crea una aplicación raíz que gestiona aplicaciones hijas en todos los entornos.

```bash
# Create app-of-apps structure
mkdir -p argocd-apps/{projects,infra,apps}

# Define projects for RBAC
cat > argocd-apps/projects/production.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** La aplicación raíz gestiona todas las aplicaciones hijas. Las nuevas aplicaciones se despliegan automáticamente cuando se añaden a Git. Las aplicaciones de infraestructura se despliegan antes que las aplicaciones que dependen de ellas (mediante ondas de sincronización si es necesario). Los proyectos aplican límites RBAC. El árbol de aplicaciones muestra las relaciones padre-hijo.

**En caso de fallo:** Para dependencias circulares, usa ondas de sincronización para controlar el orden. Para errores de permisos de proyecto, verifica que sourceRepos y destinations coincidan con los requisitos de la aplicación. Para problemas con directorios recursivos, asegúrate de que los archivos YAML son válidos y no se contradicen. Para aplicaciones hijas faltantes, comprueba el estado de la aplicación raíz con `argocd app get root-app`.

### Paso 4: Configurar Image Updater para Despliegues Automatizados

Configura Argo CD Image Updater para promover automáticamente nuevas versiones de imágenes.

```bash
# Install Argo CD Image Updater
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml

# Configure image update strategy via annotations
cat > argocd-apps/myapp-prod-autoupdate.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** Image Updater monitorea el registro en busca de nuevas imágenes que coincidan con los patrones de etiquetas. La estrategia de versionado semántico actualiza a la última versión estable. Los commits de Git se crean automáticamente con las nuevas etiquetas de imagen. Las aplicaciones se sincronizan con las imágenes actualizadas. El entorno de staging usa la estrategia de resumen para despliegues inmutables.

**En caso de fallo:** Para errores de acceso al registro, verifica que image-updater tiene credenciales de extracción mediante secreto o ServiceAccount. Para fallos de escritura, comprueba que el secreto git-creds tiene permisos de envío. Para que no se detecten actualizaciones, verifica que la expresión regular de etiquetas coincida con las etiquetas reales con `argocd-image-updater test ghcr.io/username/myapp`. Para problemas de autenticación, comprueba los registros de image-updater para mensajes de error detallados.

### Paso 5: Implementar Entrega Progresiva con Argo Rollouts

Habilita despliegues canary y azul-verde con retroceso automatizado.

```bash
# Install Argo Rollouts controller
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# Install Rollouts kubectl plugin
curl -LO https://github.com/argoproj/argo-rollouts/releases/latest/download/kubectl-argo-rollouts-linux-amd64
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** El Rollout desplaza progresivamente el tráfico al canary. El análisis se ejecuta en cada paso, validando la tasa de éxito. Promoción automatizada en caso de éxito, retroceso en caso de fallo. Argo CD sincroniza los recursos Rollout. El panel muestra el progreso del rollout en tiempo real.

**En caso de fallo:** Para fallos de análisis, verifica que Prometheus sea accesible y que la consulta devuelva resultados válidos. Para problemas de enrutamiento del tráfico, comprueba las anotaciones del Ingress y los endpoints del servicio canary. Para rollouts bloqueados, promueve o cancela manualmente. Para incompatibilidades de revisión, asegúrate de que la política de sincronización de Argo CD no entra en conflicto con las actualizaciones del controlador de Rollouts.

### Paso 6: Configurar la Detección de Desvío y las Notificaciones por Webhook

Monitorea los cambios manuales y envía alertas a Slack/correo electrónico.

```bash
# Configure drift detection in Application
cat > argocd-apps/myapp-strict.yaml <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp-prod
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** La auto-corrección revierte automáticamente los cambios manuales de kubectl. Se envían notificaciones a Slack en caso de fallos de sincronización y despliegues exitosos. Los webhooks activan sistemas externos (PagerDuty, monitoreo, ITSM). Las alertas de desvío muestran qué cambió y quién realizó los cambios (a través del historial de Git).

**En caso de fallo:** Para que la auto-corrección no se active, verifica que la política de sincronización automatizada esté habilitada y que el intervalo de actualización no sea demasiado largo (predeterminado 3m). Para fallos de notificación, prueba el token de Slack con curl y verifica que el bot esté añadido a los canales. Para que las diferencias ignoradas no funcionen, comprueba que la sintaxis del puntero JSON coincide con la estructura del recurso. Para errores de webhook, comprueba la accesibilidad del punto de conexión y los encabezados de autenticación.

## Validación

- [ ] Argo CD o Flux instalado y accesible mediante interfaz/CLI
- [ ] Repositorio Git conectado con autenticación adecuada
- [ ] Las aplicaciones se sincronizan automáticamente desde Git al confirmar cambios
- [ ] Los cambios manuales de kubectl son revertidos por la auto-corrección
- [ ] El patrón app-of-apps despliega múltiples aplicaciones
- [ ] Image Updater promueve nuevas imágenes basándose en patrones de etiquetas
- [ ] Argo Rollouts realiza despliegues canary progresivos
- [ ] Se envían notificaciones a Slack/correo electrónico en eventos de sincronización
- [ ] La detección de desvío alerta sobre cambios fuera de banda
- [ ] El RBAC aplica controles de acceso a nivel de proyecto

## Errores Comunes

- **Limpieza automática deshabilitada**: Los recursos eliminados de Git permanecen en el clúster. Habilita `prune: true` en la política de sincronización.

- **Sin ondas de sincronización**: Las aplicaciones de infraestructura se despliegan después de las aplicaciones que dependen de ellas. Usa anotaciones `argocd.argoproj.io/sync-wave` para controlar el orden.

- **Ignorar réplicas gestionadas por HPA**: La sincronización falla porque HPA cambió el recuento de réplicas. Añade `/spec/replicas` a ignoreDifferences.

- **Conflictos de escritura**: Los commits de Image Updater entran en conflicto con commits manuales. Usa una rama separada o RBAC detallado para image updater.

- **Finalizadores faltantes**: La eliminación de aplicaciones deja recursos huérfanos. Añade `resources-finalizer.argocd.argoproj.io` a los metadatos de la Application.

- **Sin plantillas de análisis**: Los Rollouts promueven automáticamente sin validación. Implementa AnalysisTemplates con consultas de métricas.

- **Secretos en Git**: Secretos en texto plano confirmados en el repositorio. Usa Sealed Secrets o External Secrets Operator.

- **Auto-corrección demasiado agresiva**: La auto-corrección revierte cambios de emergencia legítimos. Usa anotaciones para deshabilitar temporalmente o implementa puertas de aprobación.

## Habilidades Relacionadas

- `configure-git-repository` - Configuración de la estructura del repositorio Git para GitOps
- `manage-git-branches` - Estrategias de ramas para la promoción entre entornos
- `deploy-to-kubernetes` - Comprensión de los recursos Kubernetes gestionados por GitOps
- `manage-kubernetes-secrets` - Integración de Sealed Secrets con Argo CD
- `build-ci-cd-pipeline` - CI construye imágenes, GitOps las despliega
- `setup-container-registry` - Promoción de imágenes entre registros
