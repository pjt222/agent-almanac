---
name: manage-kubernetes-secrets
description: >
  Implementa gestión segura de secretos en Kubernetes usando SealedSecrets para GitOps,
  External Secrets Operator para gestores de secretos en la nube, y estrategias de rotación.
  Gestiona certificados TLS, claves API y credenciales con cifrado en reposo y controles RBAC.
  Útil al almacenar configuración sensible para aplicaciones Kubernetes, implementar GitOps
  donde los secretos deben estar versionados, integrar con AWS Secrets Manager o Azure
  Key Vault, rotar credenciales sin tiempo de inactividad, o migrar de Secrets en texto
  plano a soluciones cifradas.
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
  complexity: intermediate
  language: multi
  tags: kubernetes, secrets, sealedsecrets, external-secrets, security
---

# Gestionar Secretos de Kubernetes

Implementa gestión de secretos de nivel productivo para Kubernetes con cifrado, rotación e integración con almacenes de secretos externos.

## Cuándo Usar

- Al almacenar configuración sensible (claves API, contraseñas, tokens) para aplicaciones Kubernetes
- Al implementar flujos de trabajo GitOps donde los secretos deben confirmarse en control de versiones
- Al integrar Kubernetes con AWS Secrets Manager, Azure Key Vault, GCP Secret Manager
- Al rotar credenciales y certificados sin tiempo de inactividad de la aplicación
- Al aplicar acceso con mínimo privilegio a secretos entre namespaces y equipos
- Al migrar de Secrets en texto plano a soluciones cifradas o gestionadas externamente

## Entradas

- **Requerido**: Clúster Kubernetes con acceso de administrador
- **Requerido**: Secretos a gestionar (credenciales de base de datos, claves API, certificados TLS)
- **Opcional**: Gestor de secretos en la nube (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager)
- **Opcional**: Autoridad certificadora para generación de certificados TLS
- **Opcional**: Repositorio GitOps para SealedSecrets
- **Opcional**: Servicio de gestión de claves (KMS) para cifrado en reposo

## Procedimiento

> Consulta [Ejemplos Extendidos](references/EXAMPLES.md) para archivos de configuración completos y plantillas.


### Paso 1: Habilitar el Cifrado en Reposo de Secretos de Kubernetes

Configura el cifrado en reposo para Secrets usando KMS o cifrado local.

```bash
# For AWS EKS, enable secrets encryption with KMS
cat > encryption-config.yaml <<EOF
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
  - resources:
      - secrets
    providers:
      - aescbc:
          keys:
            - name: key1
              secret: $(head -c 32 /dev/urandom | base64)
      - identity: {}
EOF

# For self-hosted clusters, configure API server
# Add to kube-apiserver flags:
# --encryption-provider-config=/etc/kubernetes/encryption-config.yaml

# Verify encryption status
kubectl get secrets -A -o json | jq '.items[] | select(.metadata.name != "default-token") | .metadata.name'

# Encrypt existing secrets by reading and rewriting
kubectl get secrets --all-namespaces -o json | kubectl replace -f -

# Verify a secret is encrypted at rest
# Check etcd directly (requires etcd access)
ETCDCTL_API=3 etcdctl get /registry/secrets/default/my-secret --print-value-only | hexdump -C
```

Para Kubernetes gestionado en la nube:

```bash
# AWS EKS - Create KMS key
aws kms create-key --description "EKS secrets encryption"
KMS_KEY_ARN=$(aws kms describe-key --key-id alias/eks-secrets --query 'KeyMetadata.Arn' --output text)

# Enable encryption on EKS cluster
aws eks associate-encryption-config \
  --cluster-name my-cluster \
  --encryption-config "resources=secrets,provider={keyArn=$KMS_KEY_ARN}"

# GKE - Enable application-layer secrets encryption
gcloud container clusters update my-cluster \
  --database-encryption-key projects/PROJECT_ID/locations/LOCATION/keyRings/RING_NAME/cryptoKeys/KEY_NAME

# AKS - Encryption enabled by default with platform-managed keys
# Optionally use customer-managed keys
az aks update \
  --name my-cluster \
  --resource-group my-rg \
  --enable-azure-keyvault-secrets-provider
```

**Esperado:** Secretos cifrados en reposo en etcd. El volcado hexadecimal muestra datos cifrados, no texto plano. Integración KMS configurada para clústeres gestionados en la nube. El recifrado de secretos existentes se completa sin errores.

**En caso de fallo:** Para fallos de inicio del servidor API, verifica la sintaxis de encryption-config.yaml y el formato de la clave (debe ser una clave de 32 bytes codificada en base64). Para errores de KMS, comprueba que los permisos IAM permitan kms:Decrypt y kms:Encrypt. Para problemas de acceso a etcd, usa el procedimiento de copia de seguridad/restauración para recuperar si el cifrado está mal configurado.

### Paso 2: Instalar y Configurar Sealed Secrets para GitOps

Despliega el controlador Bitnami Sealed Secrets para cifrar secretos para almacenamiento en Git.

```bash
# Install Sealed Secrets controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Verify controller is running
kubectl get pods -n kube-system -l name=sealed-secrets-controller

# Install kubeseal CLI
wget https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/kubeseal-0.24.0-linux-amd64.tar.gz
tar xfz kubeseal-0.24.0-linux-amd64.tar.gz
sudo install -m 755 kubeseal /usr/local/bin/kubeseal

# Fetch public key for offline sealing
kubeseal --fetch-cert \
  --controller-namespace=kube-system \
  --controller-name=sealed-secrets-controller \
  > pub-cert.pem

# Create a regular Secret (NOT applied to cluster yet)
kubectl create secret generic mysecret \
  --from-literal=username=admin \
  --from-literal=password='sup3rs3cr3t!' \
  --dry-run=client \
  -o yaml > mysecret.yaml

# Seal the secret
kubeseal --format=yaml --cert=pub-cert.pem < mysecret.yaml > mysealedsecret.yaml

# Inspect sealed secret (safe to commit to Git)
cat mysealedsecret.yaml
```

El secreto sellado tendrá este aspecto:

```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: mysecret
  namespace: default
spec:
  encryptedData:
    username: AgA8V7f3q2... (encrypted data)
    password: AgBkXp9n1h... (encrypted data)
  template:
    metadata:
      name: mysecret
      namespace: default
```

Aplicar y verificar:

```bash
# Apply sealed secret to cluster
kubectl apply -f mysealedsecret.yaml

# Verify regular Secret was created automatically
kubectl get secret mysecret -o yaml

# Decode secret to verify values
kubectl get secret mysecret -o jsonpath='{.data.username}' | base64 -d

# Commit sealed secret to Git (safe, encrypted)
git add mysealedsecret.yaml
git commit -m "Add database credentials as sealed secret"
```

**Esperado:** El controlador de Sealed Secrets se ejecuta en el namespace kube-system. Certificado público obtenido. Kubeseal cifra los Secrets usando la clave pública. Los Sealed Secrets aplicados al clúster crean automáticamente Secrets descifrados. Solo el controlador puede descifrar (tiene la clave privada).

**En caso de fallo:** Para errores de cifrado, verifica que el controlador esté en ejecución y que pub-cert.pem sea válido. Para fallos de descifrado, comprueba los registros del controlador con `kubectl logs -n kube-system -l name=sealed-secrets-controller`. Para errores de incompatibilidad de namespace, los secretos sellados están limitados por namespace de forma predeterminada; usa `--scope cluster-wide` para secretos entre namespaces. Si se pierde la clave privada, los secretos sellados no pueden descifrarse; haz una copia de seguridad de la clave del controlador con `kubectl get secret -n kube-system sealed-secrets-key -o yaml > sealed-secrets-backup.yaml`.

### Paso 3: Desplegar el External Secrets Operator para Gestores de Secretos en la Nube

Integra Kubernetes con AWS Secrets Manager, Azure Key Vault o GCP Secret Manager.

```bash
# Install External Secrets Operator via Helm
helm repo add external-secrets https://charts.external-secrets.io
helm repo update

helm install external-secrets \
  external-secrets/external-secrets \
  --namespace external-secrets-system \
  --create-namespace

# Verify operator is running
kubectl get pods -n external-secrets-system

# Create IAM role for AWS Secrets Manager (EKS with IRSA)
cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/oidc.eks.REGION.amazonaws.com/id/OIDC_ID"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.REGION.amazonaws.com/id/OIDC_ID:sub": "system:serviceaccount:default:external-secrets-sa"
        }
      }
    }
  ]
}
EOF

aws iam create-role \
  --role-name external-secrets-role \
  --assume-role-policy-document file://trust-policy.json

aws iam attach-role-policy \
  --role-name external-secrets-role \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite

# Create SecretStore referencing AWS Secrets Manager
cat <<EOF | kubectl apply -f -
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secretsmanager
  namespace: default
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: external-secrets-sa
  namespace: default
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::ACCOUNT_ID:role/external-secrets-role
EOF

# Create secret in AWS Secrets Manager
aws secretsmanager create-secret \
  --name myapp/database \
  --secret-string '{
    "username":"dbadmin",
    "password":"dbpass123",
    "endpoint":"db.example.com:5432",
    "database":"myapp"
  }'

# Create ExternalSecret to sync from AWS
cat <<EOF | kubectl apply -f -
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: myapp-database
  namespace: default
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secretsmanager
    kind: SecretStore
  target:
    name: myapp-db-secret
    creationPolicy: Owner
  data:
  - secretKey: username
    remoteRef:
      key: myapp/database
      property: username
  - secretKey: password
    remoteRef:
      key: myapp/database
      property: password
  - secretKey: endpoint
    remoteRef:
      key: myapp/database
      property: endpoint
EOF

# Verify ExternalSecret synced
kubectl get externalsecret myapp-database
kubectl get secret myapp-db-secret -o yaml

# Check synchronization status
kubectl describe externalsecret myapp-database
```

Para Azure Key Vault:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: azure-keyvault
  namespace: default
spec:
  provider:
    azurekv:
      authType: ManagedIdentity
      vaultUrl: "https://my-keyvault.vault.azure.net"
      tenantId: "tenant-id"
```

**Esperado:** External Secrets Operator en ejecución. SecretStore configurado con credenciales del proveedor de la nube. Los recursos ExternalSecret crean automáticamente Kubernetes Secrets al extraer del gestor de secretos en la nube. Los secretos se actualizan cada hora. Los cambios en el gestor de secretos de la nube se propagan al clúster.

**En caso de fallo:** Para errores de autenticación, verifica las anotaciones del rol IAM/cuenta de servicio y que la política de confianza permita asumir el rol. Para fallos de sincronización, comprueba el estado del ExternalSecret con `kubectl describe externalsecret`. Para secretos faltantes en la nube, verifica que los nombres de los secretos y las rutas de propiedades JSON coincidan. Prueba las credenciales AWS con `aws secretsmanager get-secret-value --secret-id myapp/database`.

### Paso 4: Implementar Gestión de Certificados con cert-manager

Automatiza el aprovisionamiento y renovación de certificados TLS usando cert-manager.

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Verify installation
kubectl get pods -n cert-manager

# ... (see EXAMPLES.md for complete configuration)
```

Para la emisión de certificados basada en anotaciones de Ingress:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** cert-manager obtiene el certificado de Let's Encrypt. Se crea un Secret TLS con certificado válido y clave privada. El certificado se renueva automáticamente antes de su vencimiento. Ingress usa el certificado para la terminación HTTPS.

**En caso de fallo:** Para fallos de desafío ACME, verifica que el DNS apunte a la IP del LoadBalancer del Ingress para http01, o los permisos IAM de Route53 para dns01. Para errores de límite de velocidad, usa el emisor `letsencrypt-staging` para pruebas. Para fallos de renovación, comprueba los registros de cert-manager con `kubectl logs -n cert-manager deployment/cert-manager`. Prueba el certificado con `curl -v https://myapp.example.com`.

### Paso 5: Implementar Estrategia de Rotación de Secretos

Automatiza la rotación de secretos con gestión de versiones y reinicios de la aplicación.

```bash
# Enable automatic Pod restarts on Secret changes with Reloader
kubectl apply -f https://raw.githubusercontent.com/stakater/Reloader/master/deployments/kubernetes/reloader.yaml

# Annotate Deployment to watch Secrets
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
# ... (see EXAMPLES.md for complete configuration)
```

Verificar el flujo de trabajo de rotación:

```bash
# Manually trigger rotation
kubectl create job --from=cronjob/secret-rotation manual-rotation-$(date +%s)

# Watch for Secret update
kubectl get secret myapp-db-secret -w

# Verify Reloader triggered Pod restart
kubectl get events --sort-by='.lastTimestamp' | grep Reloader

# Check new Pods are using updated secret
kubectl get pods -l app=myapp
kubectl exec -it <pod-name> -- env | grep DB_PASSWORD
```

**Esperado:** Reloader observa Secrets/ConfigMaps y reinicia Pods ante cambios. La rotación de secretos actualiza AWS Secrets Manager, el External Secrets Operator sincroniza con Kubernetes, Reloader activa el reinicio gradual. La aplicación adopta las nuevas credenciales sin intervención manual.

**En caso de fallo:** Para que Reloader no se active, verifica la sintaxis de la anotación y que Reloader esté en ejecución con `kubectl get pods -n default -l app=reloader-reloader`. Para retrasos de sincronización del External Secrets, reduce el refreshInterval o activa manualmente con `kubectl annotate externalsecret myapp-database force-sync="$(date +%s)" --overwrite`. Para fallos de conexión de la aplicación durante la rotación, implementa recarga graciosa de secretos en el código de la aplicación o usa agrupación de conexiones con lógica de reintento.

### Paso 6: Implementar RBAC para el Control de Acceso a Secretos

Restringe el acceso a secretos usando RBAC de Kubernetes con el principio de mínimo privilegio.

```yaml
# Create namespace for sensitive workloads
apiVersion: v1
kind: Namespace
metadata:
  name: production
---
# ... (see EXAMPLES.md for complete configuration)
```

Probar RBAC:

```bash
# Apply RBAC resources
kubectl apply -f rbac.yaml

# Test as application service account
kubectl auth can-i get secret myapp-db-secret --as=system:serviceaccount:production:myapp -n production
# Should return "yes"
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** Las cuentas de servicio tienen acceso de solo lectura a secretos específicos mediante resourceNames. Los desarrolladores no pueden ver secretos en el namespace de producción. Solo el grupo secret-admins puede crear/actualizar/eliminar secretos. Las denegaciones de RBAC se registran en los registros de auditoría.

**En caso de fallo:** Para errores de acceso denegado, verifica que los sujetos del RoleBinding coincidan con el nombre y namespace de la ServiceAccount. Para roles demasiado permisivos, elimina los verbos comodín y agrega la restricción resourceNames. Para lagunas en el registro de auditoría, habilita el registro de auditoría de Kubernetes a nivel del servidor API. Prueba con `kubectl auth can-i` antes de desplegar los cambios.

## Validación

- [ ] Secretos cifrados en reposo en etcd (verificar con etcdctl o KMS)
- [ ] Controlador de Sealed Secrets en ejecución y certificado público obtenido
- [ ] External Secrets Operator sincronizando desde gestores de secretos en la nube
- [ ] Certificados TLS emitidos por cert-manager y renovándose automáticamente
- [ ] Rotación de secretos automatizada con reinicios de aplicación mediante Reloader
- [ ] Las políticas RBAC aplican acceso con mínimo privilegio a los secretos
- [ ] Sin secretos en texto plano en repositorios Git o imágenes de contenedor
- [ ] Procedimiento de copia de seguridad/restauración probado para la clave privada de sealed-secrets
- [ ] Alertas de monitoreo configuradas para fallos de sincronización de secretos y vencimiento

## Errores Comunes

- **Secretos en el historial de Git**: Confirmar secretos en texto plano y luego eliminarlos no los borra del historial de Git. Usa git-filter-repo o BFG para reescribir el historial, rota los secretos comprometidos.

- **RBAC demasiado amplio**: Conceder `get secrets` en todos los secretos del namespace. Usa resourceNames para restringir el acceso a secretos específicos únicamente.

- **Sin estrategia de rotación**: Los secretos nunca se rotan, aumentando el radio de explosión en caso de compromiso. Implementa rotación automatizada con External Secrets Operator o CronJobs.

- **Cifrado en reposo faltante**: Secretos almacenados en texto plano en etcd. Habilita el proveedor de cifrado o la integración KMS antes de almacenar datos sensibles.

- **La aplicación almacena secretos en caché**: La aplicación lee el secreto una vez al inicio y nunca lo recarga. Implementa manejo de señales (SIGHUP) o un observador de archivos para cambios en los archivos de secretos.

- **Actualización de External Secrets demasiado lenta**: El refreshInterval predeterminado de 1h significa que los cambios de secretos pueden tardar hasta una hora en propagarse. Reduce refreshInterval para secretos críticos, usa webhooks para actualizaciones inmediatas.

- **Sin copia de seguridad de la clave sealed-secrets**: La clave privada del controlador se pierde y todos los secretos sellados se vuelven irrecuperables. Haz una copia de seguridad con `kubectl get secret -n kube-system sealed-secrets-key -o yaml > backup.yaml` y almacénala de forma segura.

- **Fallos de renovación de certificados**: cert-manager no puede renovar debido a cambios en DNS o firewall. Monitorea el vencimiento de certificados con métricas y alertas de Prometheus.

## Habilidades Relacionadas

- `deploy-to-kubernetes` - Uso de secretos en Deployments y StatefulSets
- `enforce-policy-as-code` - Políticas OPA para validación de acceso a secretos
- `security-audit-codebase` - Detección de secretos codificados en el código de la aplicación
- `configure-ingress-networking` - Uso de certificados TLS en recursos Ingress
- `implement-gitops-workflow` - Sealed Secrets en pipelines de ArgoCD/Flux
