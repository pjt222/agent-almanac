---
name: manage-kubernetes-secrets
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Secure secrets mgmt in K8s via SealedSecrets for GitOps, External Secrets
  Operator for cloud secret mgrs, rotation strats. Handle TLS certs, API keys,
  creds w/ encryption at rest + RBAC. Use storing sensitive config for K8s
  apps, GitOps needing version-controlled secrets, integrating AWS Secrets
  Mgr / Azure Key Vault, rotating creds w/o downtime, or migrating plaintext
  Secrets → encrypted.
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

# Manage Kubernetes Secrets

Prod-grade secrets mgmt for K8s w/ encryption, rotation, integration w/ external secret stores.

## Use When

- Storing sensitive config (API keys, passwords, tokens) for K8s apps
- GitOps workflows where secrets must be committed to VC
- Integrating K8s w/ AWS Secrets Mgr, Azure Key Vault, GCP Secret Mgr
- Rotating creds + certs w/o app downtime
- Enforcing least-privilege across namespaces + teams
- Migrating plaintext Secrets → encrypted / externally managed

## In

- **Req**: K8s cluster w/ admin access
- **Req**: Secrets to manage (DB creds, API keys, TLS certs)
- **Opt**: Cloud secret mgr (AWS Secrets Mgr, Azure Key Vault, GCP Secret Mgr)
- **Opt**: CA for TLS cert gen
- **Opt**: GitOps repo for SealedSecrets
- **Opt**: KMS for encryption at rest

## Do

> See [Extended Examples](references/EXAMPLES.md) for complete config files.

### Step 1: Enable K8s Secrets Encryption at Rest

Config encryption at rest for Secrets via KMS / local encryption.

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

Cloud-managed K8s:

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

→ Secrets encrypted at rest in etcd. Hexdump shows encrypted, not plaintext. KMS integration configured for cloud-managed. Re-encryption of existing completes w/o errs.

**If err:** API server startup fails → verify encryption-config.yaml syntax + key format (base64 32-byte). KMS errs → check IAM perms allow kms:Decrypt + kms:Encrypt. etcd access issues → backup/restore to recover if encryption misconfigured.

### Step 2: Install + Config Sealed Secrets for GitOps

Deploy Bitnami Sealed Secrets controller → encrypt secrets for Git storage.

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

Sealed secret looks like:

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

Apply + verify:

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

→ Sealed Secrets controller in kube-system. Public cert fetched. Kubeseal encrypts via public key. Sealed Secrets applied → auto create decrypted Secrets. Only controller can decrypt (has private key).

**If err:** Encryption errs → verify controller running + pub-cert.pem valid. Decryption fails → `kubectl logs -n kube-system -l name=sealed-secrets-controller`. Namespace mismatch → sealed secrets namespace-scoped by default; use `--scope cluster-wide` for cross-namespace. Private key lost → sealed secrets unrecoverable; backup controller key w/ `kubectl get secret -n kube-system sealed-secrets-key -o yaml > sealed-secrets-backup.yaml`.

### Step 3: Deploy External Secrets Operator for Cloud Secret Mgrs

Integrate K8s w/ AWS Secrets Mgr, Azure Key Vault, GCP Secret Mgr.

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

Azure Key Vault:

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

→ Operator running. SecretStore configured w/ cloud provider creds. ExternalSecret auto creates K8s Secrets by pulling from cloud. Secrets refresh hourly. Changes in cloud → propagate to cluster.

**If err:** Auth errs → verify IAM role/SA annotations + trust policy allows assume role. Sync fails → `kubectl describe externalsecret`. Missing secrets in cloud → verify names + JSON property paths match. Test AWS creds w/ `aws secretsmanager get-secret-value --secret-id myapp/database`.

### Step 4: Cert Mgmt w/ cert-manager

Automate TLS cert provisioning + renewal via cert-manager.

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Verify installation
kubectl get pods -n cert-manager

# ... (see EXAMPLES.md)
```

Ingress annotation-based cert issuance:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
# ... (see EXAMPLES.md)
```

→ cert-manager obtains cert from Let's Encrypt. TLS secret created w/ valid cert + private key. Cert auto-renews before expiration. Ingress uses for HTTPS termination.

**If err:** ACME challenge fails → verify DNS points to Ingress LB IP for http01 / Route53 IAM perms for dns01. Rate limit → use `letsencrypt-staging` for testing. Renewal fails → `kubectl logs -n cert-manager deployment/cert-manager`. Test cert w/ `curl -v https://myapp.example.com`.

### Step 5: Secret Rotation Strategy

Automate rotation w/ version mgmt + app restarts.

```bash
# Enable automatic Pod restarts on Secret changes with Reloader
kubectl apply -f https://raw.githubusercontent.com/stakater/Reloader/master/deployments/kubernetes/reloader.yaml

# Annotate Deployment to watch Secrets
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
# ... (see EXAMPLES.md)
```

Verify rotation workflow:

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

→ Reloader watches Secrets/ConfigMaps + restarts Pods on changes. Rotation updates AWS Secrets Mgr → Operator syncs → Reloader triggers rolling restart. App picks up new creds w/o manual intervention.

**If err:** Reloader not triggering → verify annotation syntax + running `kubectl get pods -n default -l app=reloader-reloader`. External Secrets sync delays → decrease refreshInterval / manually trigger w/ `kubectl annotate externalsecret myapp-database force-sync="$(date +%s)" --overwrite`. App connection fails during rotation → implement graceful secret reload / connection pooling w/ retry.

### Step 6: RBAC for Secrets Access Control

Restrict access via K8s RBAC w/ least-privilege.

```yaml
# Create namespace for sensitive workloads
apiVersion: v1
kind: Namespace
metadata:
  name: production
---
# ... (see EXAMPLES.md)
```

Test RBAC:

```bash
# Apply RBAC resources
kubectl apply -f rbac.yaml

# Test as application service account
kubectl auth can-i get secret myapp-db-secret --as=system:serviceaccount:production:myapp -n production
# Should return "yes"
# ... (see EXAMPLES.md)
```

→ SAs have read-only access to specific secrets via resourceNames. Devs can't view secrets in prod namespace. Only secret-admins can create/update/delete. RBAC denials logged in audit.

**If err:** Access denied → verify RoleBinding subjects match SA name+namespace. Overly permissive → remove wildcard verbs + add resourceNames restriction. Audit log gaps → enable K8s audit logging at API server. Test w/ `kubectl auth can-i` before deploying.

## Check

- [ ] Secrets encrypted at rest in etcd (etcdctl / KMS)
- [ ] Sealed Secrets controller running + public cert fetched
- [ ] External Secrets Operator syncing from cloud mgrs
- [ ] TLS certs issued by cert-manager + auto-renewing
- [ ] Rotation automated w/ app restarts via Reloader
- [ ] RBAC enforces least-privilege
- [ ] No plaintext secrets in Git / container images
- [ ] Backup/restore procedure tested for sealed-secrets private key
- [ ] Monitoring alerts for sync failures + expiration

## Traps

- **Secrets in Git history**: Committing plaintext then removing doesn't purge. Use git-filter-repo / BFG to rewrite, rotate compromised.
- **Overly broad RBAC**: Granting `get secrets` on all in namespace. Use resourceNames → specific secrets only.
- **No rotation**: Secrets never rotated → increases blast radius. Automate via Operator / CronJobs.
- **Missing encryption at rest**: Secrets plaintext in etcd. Enable encryption provider / KMS before storing.
- **App caching secrets**: Reads once at startup, never reloads. SIGHUP / file watcher for secret file changes.
- **External Secrets refresh slow**: Default 1h → changes take up to 1h to propagate. Lower refreshInterval for critical / webhooks for immediate.
- **No backup of sealed-secrets key**: Controller private key lost → all sealed secrets unrecoverable. Backup w/ `kubectl get secret -n kube-system sealed-secrets-key -o yaml > backup.yaml`.
- **Cert renewal fails**: cert-manager can't renew due to DNS/firewall changes. Monitor expiry w/ Prometheus metrics + alerts.

## →

- `deploy-to-kubernetes` — using secrets in Deployments + StatefulSets
- `enforce-policy-as-code` — OPA policies for secret access validation
- `security-audit-codebase` — detecting hardcoded secrets in app code
- `configure-ingress-networking` — TLS cert usage in Ingress
- `implement-gitops-workflow` — Sealed Secrets in ArgoCD/Flux pipelines
