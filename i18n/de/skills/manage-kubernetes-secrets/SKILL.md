---
name: manage-kubernetes-secrets
description: >
  Sicheres Secrets-Management in Kubernetes implementieren — mit SealedSecrets fuer
  GitOps, External Secrets Operator fuer Cloud-Secret-Manager und Rotationsstrategien.
  TLS-Zertifikate, API-Schluessel und Credentials mit Verschluesselung im Ruhezustand
  und RBAC-Kontrollen verwalten. Einsatz beim Speichern sensibler Konfiguration fuer
  Kubernetes-Anwendungen, beim Implementieren von GitOps wo Secrets versioniert werden
  muessen, bei der Integration mit AWS Secrets Manager oder Azure Key Vault, beim
  Rotieren von Credentials ohne Ausfallzeit oder bei der Migration von
  Klartext-Secrets zu verschluesselten Loesungen.
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
  complexity: intermediate
  language: multi
  tags: kubernetes, secrets, sealedsecrets, external-secrets, security
---

# Kubernetes-Secrets verwalten

Produktionsreifes Secrets-Management fuer Kubernetes mit Verschluesselung, Rotation und Integration externer Secret-Stores implementieren.

## Wann verwenden

- Sensible Konfiguration (API-Schluessel, Passwoerter, Tokens) fuer Kubernetes-Anwendungen speichern
- GitOps-Workflows implementieren, bei denen Secrets in die Versionskontrolle committet werden muessen
- Kubernetes mit AWS Secrets Manager, Azure Key Vault, GCP Secret Manager integrieren
- Credentials und Zertifikate ohne Anwendungsausfallzeit rotieren
- Least-Privilege-Zugriff auf Secrets ueber Namespaces und Teams durchsetzen
- Von Klartext-Secrets zu verschluesselten oder extern verwalteten Loesungen migrieren

## Eingaben

- **Erforderlich**: Kubernetes-Cluster mit Admin-Zugriff
- **Erforderlich**: Zu verwaltende Secrets (Datenbank-Credentials, API-Schluessel, TLS-Zertifikate)
- **Optional**: Cloud-Secret-Manager (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager)
- **Optional**: Zertifizierungsauthoritaet fuer TLS-Zertifikatgenerierung
- **Optional**: GitOps-Repository fuer SealedSecrets
- **Optional**: Key-Management-Service (KMS) fuer Verschluesselung im Ruhezustand

## Vorgehensweise

> Siehe [Erweiterte Beispiele](references/EXAMPLES.md) fuer vollstaendige Konfigurationsdateien und Vorlagen.

### Schritt 1: Kubernetes-Secrets-Verschluesselung im Ruhezustand aktivieren

Verschluesselung im Ruhezustand fuer Secrets mit KMS oder lokaler Verschluesselung konfigurieren.

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

Fuer cloud-verwaltetes Kubernetes:

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

**Erwartet:** Secrets im Ruhezustand in etcd verschluesselt. Hexdump zeigt verschluesselte Daten, keinen Klartext. KMS-Integration fuer cloud-verwaltete Cluster konfiguriert.

**Bei Fehler:** Bei API-Server-Startfehlern Syntax und Schluessel-Format der encryption-config.yaml pruefen (muss base64-kodierter 32-Byte-Schluessel sein). Bei KMS-Fehlern IAM-Berechtigungen fuer kms:Decrypt und kms:Encrypt pruefen.

### Schritt 2: Sealed Secrets fuer GitOps installieren und konfigurieren

Bitnami Sealed Secrets Controller fuer Git-Speicherung verschluesseln.

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

Das versiegelte Secret sieht folgendermassen aus:

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

Anwenden und verifizieren:

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

**Erwartet:** Sealed Secrets Controller laeuft im kube-system Namespace. Oeffentliches Zertifikat abgerufen. Kubeseal verschluesselt Secrets mit dem oeffentlichen Schluessel. Nur der Controller kann entschluesseln (hat privaten Schluessel).

**Bei Fehler:** Bei Namespace-Missmatch-Fehlern: Sealed Secrets sind standardmaessig namespace-gebunden; `--scope cluster-wide` fuer cross-namespace Secrets verwenden. Wenn der private Schluessel verloren geht, koennen versiegelte Secrets nicht entschluesselt werden; Controller-Schluessel sichern mit `kubectl get secret -n kube-system sealed-secrets-key -o yaml > sealed-secrets-backup.yaml`.

### Schritt 3: External Secrets Operator fuer Cloud-Secret-Manager deployen

Kubernetes mit AWS Secrets Manager, Azure Key Vault oder GCP Secret Manager integrieren.

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
```

Fuer Azure Key Vault:

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

**Erwartet:** External Secrets Operator laeuft. SecretStore mit Cloud-Provider-Credentials konfiguriert. ExternalSecret-Ressourcen erstellen automatisch Kubernetes-Secrets durch Abrufen aus Cloud-Secret-Managern. Secrets werden stuendlich aktualisiert.

**Bei Fehler:** Bei Authentifizierungsfehlern IAM-Rolle/Service-Account-Annotationen und Vertrauensrichtlinien pruefen. Bei Synchronisierungsfehlern ExternalSecret-Status mit `kubectl describe externalsecret` pruefen.

### Schritt 4: Zertifikatsverwaltung mit cert-manager implementieren

TLS-Zertifikatsbereitstellung und -erneuerung mit cert-manager automatisieren.

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Verify installation
kubectl get pods -n cert-manager

# ... (see EXAMPLES.md for complete configuration)
```

Fuer Ingress-Annotation-basierte Zertifikatsausstellung:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** cert-manager erholt Zertifikat von Let's Encrypt. TLS-Secret mit gueltigem Zertifikat und privatem Schluessel erstellt. Zertifikat wird vor Ablauf automatisch erneuert.

**Bei Fehler:** Bei ACME-Challenge-Fehlern DNS auf Ingress-LoadBalancer-IP pruefen. Bei Rate-Limit-Fehlern `letsencrypt-staging`-Issuer fuer Tests verwenden.

### Schritt 5: Secret-Rotationsstrategie implementieren

Secret-Rotation mit Versionsverwaltung und Anwendungsneustarts automatisieren.

```bash
# Enable automatic Pod restarts on Secret changes with Reloader
kubectl apply -f https://raw.githubusercontent.com/stakater/Reloader/master/deployments/kubernetes/reloader.yaml

# Annotate Deployment to watch Secrets
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
# ... (see EXAMPLES.md for complete configuration)
```

Rotationsworkflow verifizieren:

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

**Erwartet:** Reloader ueberwacht Secrets/ConfigMaps und startet Pods bei Aenderungen neu. Secret-Rotation aktualisiert AWS Secrets Manager, External Secrets Operator synchronisiert mit Kubernetes, Reloader loest Rolling Restart aus.

**Bei Fehler:** Wenn Reloader nicht ausloest, Annotation-Syntax und Reloader-Status mit `kubectl get pods -n default -l app=reloader-reloader` pruefen.

### Schritt 6: RBAC fuer Secrets-Zugriffskontrolle implementieren

Secret-Zugriff mit Kubernetes RBAC nach Least-Privilege-Prinzip einschraenken.

```yaml
# Create namespace for sensitive workloads
apiVersion: v1
kind: Namespace
metadata:
  name: production
---
# ... (see EXAMPLES.md for complete configuration)
```

RBAC testen:

```bash
# Apply RBAC resources
kubectl apply -f rbac.yaml

# Test as application service account
kubectl auth can-i get secret myapp-db-secret --as=system:serviceaccount:production:myapp -n production
# Should return "yes"
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** Service-Accounts haben schreibgeschuetzten Zugriff auf spezifische Secrets ueber resourceNames. Entwickler koennen Secrets im Production-Namespace nicht einsehen. Nur secret-admins-Gruppe kann Secrets erstellen/aktualisieren/loeschen.

**Bei Fehler:** Bei Zugriffsverweigerungsfehlern pruefen, ob RoleBinding-Subjects dem ServiceAccount-Namen und Namespace entsprechen. Fuer zu permissive Rollen Wildcard-Verbs entfernen und resourceNames-Einschraenkung hinzufuegen.

## Validierung

- [ ] Secrets im Ruhezustand in etcd verschluesselt (mit etcdctl oder KMS pruefen)
- [ ] Sealed Secrets Controller laeuft und oeffentliches Zertifikat abgerufen
- [ ] External Secrets Operator synchronisiert aus Cloud-Secret-Managern
- [ ] TLS-Zertifikate von cert-manager ausgestellt und automatisch erneuert
- [ ] Secret-Rotation automatisiert mit Anwendungsneustarts via Reloader
- [ ] RBAC-Richtlinien erzwingen Least-Privilege-Zugriff auf Secrets
- [ ] Keine Klartext-Secrets in Git-Repositories oder Container-Images
- [ ] Backup/Restore-Verfahren fuer sealed-secrets privaten Schluessel getestet
- [ ] Monitoring-Alerts fuer Secret-Synchronisierungsfehler und Ablauf konfiguriert

## Haeufige Stolperfallen

- **Secrets in der Git-Historie**: Klartext-Secrets committen und spaeter entfernen loescht sie nicht aus der Git-Historie. git-filter-repo oder BFG verwenden, um Historie neu zu schreiben, kompromittierte Secrets rotieren.

- **Zu breites RBAC**: `get secrets` fuer alle Secrets im Namespace gewaehren. resourceNames verwenden, um Zugriff auf spezifische Secrets zu beschraenken.

- **Keine Rotationsstrategie**: Secrets werden niemals rotiert, was den Blast Radius eines Kompromisses erhoert. Automatisierte Rotation mit External Secrets Operator oder CronJobs implementieren.

- **Fehlende Verschluesselung im Ruhezustand**: Secrets im Klartext in etcd gespeichert. Verschluesselungs-Provider oder KMS-Integration aktivieren, bevor sensible Daten gespeichert werden.

- **Anwendungs-Caching von Secrets**: App liest Secret einmal beim Start und laedt nie neu. Signal-Behandlung (SIGHUP) oder Datei-Watcher fuer Secret-Dateiiaenderungen implementieren.

- **External Secrets zu langsame Aktualisierung**: Standard-1h-Aktualisierung bedeutet, dass Secret-Aenderungen bis zu einer Stunde brauchen. refreshInterval fuer kritische Secrets verringern, Webhooks fuer sofortige Aktualisierungen verwenden.

- **Kein Backup des sealed-secrets-Schluessels**: Controller-privater Schluessel verloren, alle versiegelten Secrets nicht wiederherstellbar. Sichern mit `kubectl get secret -n kube-system sealed-secrets-key -o yaml > backup.yaml` und sicher aufbewahren.

- **Zertifikatserneuerungsfehler**: cert-manager kann aufgrund von DNS/Firewall-Aenderungen nicht erneuern. Zertifikatsablauf mit Prometheus-Metriken und Alerts ueberwachen.

## Verwandte Skills

- `deploy-to-kubernetes` - Secrets in Deployments und StatefulSets verwenden
- `enforce-policy-as-code` - OPA-Richtlinien fuer Secret-Zugriffsvalidierung
- `security-audit-codebase` - Hartcodierte Secrets im Anwendungscode erkennen
- `configure-ingress-networking` - TLS-Zertifikatsverwendung in Ingress-Ressourcen
- `implement-gitops-workflow` - Sealed Secrets in ArgoCD/Flux-Pipelines
