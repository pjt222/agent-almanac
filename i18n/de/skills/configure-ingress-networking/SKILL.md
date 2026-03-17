---
name: configure-ingress-networking
description: >
  Kubernetes-Ingress-Networking mit NGINX-Ingress-Controller, cert-manager
  fuer automatisiertes TLS-Zertifikat-Management, pfadbasiertes Routing,
  Rate-Limiting und Multi-Domain-Hosting mit SSL-Terminierung und
  Load-Balancing konfigurieren. Einsatz beim Exponieren mehrerer
  Kubernetes-Services ueber einen einzelnen Load-Balancer, beim Implementieren
  von pfad- oder hostbasiertem Routing, beim Automatisieren der TLS-
  Zertifikatausstellung mit Let's Encrypt oder beim Einrichten von Blue-Green-
  und Canary-Deployments mit Traffic-Splitting.
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
  tags: ingress, nginx, cert-manager, tls, networking
---

# Ingress-Networking konfigurieren

Produktionstaugliches Kubernetes-Ingress mit NGINX-Controller, automatisierten TLS-Zertifikaten und erweiterten Routing-Funktionen einrichten.

## Wann verwenden

- Mehrere Kubernetes-Services ueber einen einzelnen Load-Balancer exponieren
- Pfad- oder hostbasiertes Routing fuer Microservices implementieren
- TLS-Zertifikatausstellung und -Erneuerung mit Let's Encrypt automatisieren
- Rate-Limiting, Authentifizierung und WAF-Richtlinien implementieren
- Blue-Green- oder Canary-Deployments mit Traffic-Splitting einrichten
- Benutzerdefinierte Fehlerseiten und Anfrage-/Antwort-Modifikation konfigurieren

## Eingaben

- **Erforderlich**: Kubernetes-Cluster mit LoadBalancer-Unterstuetzung oder MetalLB
- **Erforderlich**: DNS-Eintraege, die auf die Cluster-LoadBalancer-IP zeigen
- **Optional**: Vorhandene TLS-Zertifikate oder Let's-Encrypt-Konto
- **Optional**: OAuth2-Provider fuer Authentifizierung
- **Optional**: WAF-Regeln (ModSecurity)
- **Optional**: Prometheus fuer Metriken-Erfassung

## Vorgehensweise

> Siehe [Erweiterte Beispiele](references/EXAMPLES.md) fuer vollstaendige Konfigurationsdateien und Vorlagen.


### Schritt 1: NGINX-Ingress-Controller installieren

NGINX-Ingress-Controller mit Helm deployen und Cloud-Provider-Integration konfigurieren.

```bash
# Add NGINX Ingress Helm repository
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Create namespace
kubectl create namespace ingress-nginx

# Install for cloud providers (AWS, GCP, Azure)
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.service.type=LoadBalancer \
  --set controller.metrics.enabled=true \
  --set controller.metrics.serviceMonitor.enabled=true \
  --set controller.podAnnotations."prometheus\.io/scrape"=true \
  --set controller.podAnnotations."prometheus\.io/port"=10254

# Or install for bare-metal with NodePort
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.service.type=NodePort \
  --set controller.service.nodePorts.http=30080 \
  --set controller.service.nodePorts.https=30443

# AWS-specific configuration with NLB
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-type"=nlb \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-backend-protocol"=tcp \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-cross-zone-load-balancing-enabled"=true

# Verify installation
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx

# Wait for LoadBalancer external IP
kubectl get svc ingress-nginx-controller -n ingress-nginx -w

# Get external IP/hostname
INGRESS_IP=$(kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
INGRESS_HOST=$(kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

echo "Ingress IP: $INGRESS_IP"
echo "Ingress Hostname: $INGRESS_HOST"

# Test controller
curl http://$INGRESS_IP
# Should return 404 (no backend configured yet)
```

**Erwartet:** NGINX-Ingress-Controller-Pods laufen im ingress-nginx-Namespace. LoadBalancer-Service hat externe IP zugewiesen. Metriken-Endpunkt auf Port 10254 erreichbar. Health-Check unter `/healthz` liefert 200 OK.

**Bei Fehler:** Bei ausstehendem LoadBalancer Cloud-Provider-Integration und Service-Kontingente pruefen. Bei CrashLoopBackOff Controller-Logs mit `kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller` pruefen. Bei Webhook-Fehlern pruefen, ob Admission-Webhook-Zertifikat gueltig ist. Bei fehlender externer IP auf Bare-Metal MetalLB installieren oder NodePort-Service-Typ verwenden.

### Schritt 2: cert-manager fuer automatisiertes TLS installieren

cert-manager deployen und Let's-Encrypt-ClusterIssuer konfigurieren.

```bash
# Install cert-manager CRDs
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.crds.yaml

# Add cert-manager Helm repository
helm repo add jetstack https://charts.jetstack.io
helm repo update

# Install cert-manager
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.13.0 \
  --set prometheus.enabled=true \
  --set webhook.timeoutSeconds=30

# Verify installation
kubectl get pods -n cert-manager
kubectl get apiservice v1beta1.webhook.cert-manager.io -o yaml

# Create Let's Encrypt staging issuer (for testing)
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-staging-account-key
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

# Create Let's Encrypt production issuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod-account-key
    solvers:
    - http01:
        ingress:
          class: nginx
    - dns01:
        route53:
          region: us-east-1
          hostedZoneID: Z1234567890ABC
          # IAM role for EKS with IRSA
          role: arn:aws:iam::123456789012:role/cert-manager
EOF

# Verify ClusterIssuer ready
kubectl get clusterissuer
kubectl describe clusterissuer letsencrypt-prod
```

**Erwartet:** cert-manager-Pods laufen im cert-manager-Namespace. ClusterIssuers mit Ready-Status erstellt. ACME-Konto bei Let's Encrypt registriert. Webhook beantwortet Zertifikat-Anfragen.

**Bei Fehler:** Bei Webhook-Timeout-Fehlern `webhook.timeoutSeconds` erhoehen oder Netzwerkrichtlinien pruefen, die cert-manager zum API-Server blockieren. Bei ACME-Registrierungsfehlern pruefen, ob E-Mail-Adresse gueltig und Server-URL korrekt ist. Bei DNS01-Fehlern pruefen, ob Route53-IAM-Berechtigungen `route53:ChangeResourceRecordSets` erlauben.

### Schritt 3: Einfaches Ingress mit TLS erstellen

Anwendung deployen und per Ingress mit automatischer Zertifikatausstellung exponieren.

```bash
# Deploy sample application
kubectl create deployment web --image=nginx:alpine
kubectl expose deployment web --port=80 --target-port=80

# Create Ingress resource with TLS
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-staging"  # Use staging for testing
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - web.example.com
    secretName: web-tls-secret  # cert-manager will create this
  rules:
  - host: web.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80
EOF

# Watch certificate creation
kubectl get certificate -w
kubectl describe certificate web-tls-secret

# Verify certificate issued
kubectl get secret web-tls-secret
kubectl get secret web-tls-secret -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -text -noout

# Check cert-manager logs if issues
kubectl logs -n cert-manager -l app=cert-manager -f

# Test HTTP to HTTPS redirect
curl -I http://web.example.com
# Should return 308 Permanent Redirect to https://

# Test HTTPS
curl -v https://web.example.com
# Should return 200 OK with valid certificate

# Once tested successfully, switch to production issuer
kubectl patch ingress web-ingress -p '{"metadata":{"annotations":{"cert-manager.io/cluster-issuer":"letsencrypt-prod"}}}'
kubectl delete certificate web-tls-secret
kubectl delete secret web-tls-secret
# cert-manager will recreate with production certificate
```

**Erwartet:** Ingress-Ressource erstellt. cert-manager erkennt Annotation und erstellt Certificate-Ressource. HTTP-01-Challenge erfolgreich abgeschlossen. TLS-Secret mit gueltigem Zertifikat erstellt. HTTPS-Anfragen erfolgreich mit vertrauenswuerdigem Zertifikat. HTTP leitet zu HTTPS weiter.

**Bei Fehler:** Bei Challenge-Fehlern pruefen, ob DNS auf Ingress-LoadBalancer-IP zeigt (`dig web.example.com`). Bei Rate-Limit-Fehlern Staging-Issuer verwenden, bis Konfiguration korrekt ist. Bei nicht ausgestelltem Zertifikat Ereignisse mit `kubectl describe certificate web-tls-secret` und `kubectl get challenges` pruefen.

### Schritt 4: Erweitertes Routing und Load-Balancing implementieren

Pfadbasiertes Routing, Header-basiertes Routing und Traffic-Splitting konfigurieren.

```bash
# Deploy multiple services
kubectl create deployment api --image=hashicorp/http-echo --replicas=3 -- -text="API Service"
kubectl create deployment admin --image=hashicorp/http-echo --replicas=2 -- -text="Admin Service"
kubectl expose deployment api --port=5678
kubectl expose deployment admin --port=5678

# Create Ingress with path-based routing
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rewrite-target: /\$2
    nginx.ingress.kubernetes.io/use-regex: "true"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - app.example.com
    secretName: app-tls
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80
      - path: /api(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 5678
      - path: /admin(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: admin
            port:
              number: 5678
EOF

# Canary deployment with traffic splitting
kubectl create deployment api-v2 --image=hashicorp/http-echo -- -text="API Service v2"
kubectl expose deployment api-v2 --port=5678

cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-canary
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "20"  # 20% traffic to v2
spec:
  ingressClassName: nginx
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-v2
            port:
              number: 5678
EOF

# Header-based canary routing (for testing)
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-canary-header
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-by-header: "X-Canary"
    nginx.ingress.kubernetes.io/canary-by-header-value: "always"
spec:
  ingressClassName: nginx
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-v2
            port:
              number: 5678
EOF

# Test routing
curl https://app.example.com/            # -> web service
curl https://app.example.com/api/        # -> 80% api, 20% api-v2
curl https://app.example.com/admin/      # -> admin service
curl -H "X-Canary: always" https://app.example.com/api/  # -> api-v2 (100%)
```

**Erwartet:** Einzelner Ingress leitet basierend auf Pfad an mehrere Services weiter. Rewrite-Target entfernt Pfad-Praefix. Canary-Ingress teilt Traffic nach Gewicht auf. Header-basiertes Routing sendet spezifische Anfragen an Canary. TLS terminiert am Ingress, Backends verwenden HTTP.

**Bei Fehler:** Bei 404-Fehlern Service-Namen und Ports pruefen. Bei Rewrite-Problemen Regex mit `nginx.ingress.kubernetes.io/rewrite-target`-Debugger testen. Bei nicht funktionierendem Canary pruefen, ob nur ein Ingress `canary: "false"` (Haupt) und andere `canary: "true"` haben.

### Schritt 5: Rate-Limiting und Authentifizierung konfigurieren

Rate-Limiting, Basic-Auth und OAuth2-Authentifizierung implementieren.

```bash
# Rate limiting by IP
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ratelimit
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** Rate-Limiting blockiert uebermassige Anfragen mit 503 Service Temporarily Unavailable. Basic-Auth fordert Credentials an und lehnt nicht autorisierte Anfragen ab. OAuth2 leitet zur Provider-Anmeldeseite weiter und setzt Authentifizierungs-Cookies.

**Bei Fehler:** Bei nicht funktionierendem Rate-Limit Annotation-Syntax pruefen und Ingress-Controller-Pods neu starten. Bei Basic-Auth-500-Fehlern Secret-Format mit `kubectl get secret basic-auth -o yaml | grep auth:` pruefen. Bei OAuth2-Fehlern pruefen, ob Client-ID/Secret und Callback-URL beim Provider registriert sind.

### Schritt 6: Benutzerdefinierte Fehlerseiten und Anfrage-Modifikation implementieren

Benutzerdefinierte Fehlerseiten, CORS und Anfrage-/Antwort-Header konfigurieren.

```bash
# Create ConfigMap with custom error pages
kubectl create configmap custom-errors --from-file=404.html --from-file=503.html -n ingress-nginx

# Configure NGINX to use custom error pages
cat <<EOF | kubectl apply -f -
apiVersion: v1
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** Benutzerdefinierte 404- und 503-Seiten werden statt Standard-NGINX-Seiten angezeigt. CORS-Header erlauben angegebene Origins und Methoden. Sicherheits-Header schuetzen vor XSS und Clickjacking. Anfrage-Groessenlimit erlaubt grosse Datei-Uploads. Timeout-Einstellungen verhindern vorzeitiges Verbindungsschliessen.

**Bei Fehler:** Bei nicht angezeigten benutzerdefinierten Fehlerseiten pruefen, ob ConfigMap in Controller-Pods gemountet und Standard-Backend deployed ist. Bei CORS-Preflight-Fehlern pruefen, ob OPTIONS-Anfragen im Backend-Service erlaubt sind. Bei 413 Request Entity Too Large `proxy-body-size`-Annotation erhoehen.

## Validierung

- [ ] NGINX-Ingress-Controller laeuft mit zugewiesener externer IP
- [ ] cert-manager stellt Zertifikate automatisch per Let's Encrypt aus
- [ ] HTTPS-Weiterleitungen erzwingen SSL fuer alle Ingresses
- [ ] Pfadbasiertes Routing leitet Anfragen an korrekte Backend-Services
- [ ] Canary-Ingresses teilen Traffic gemaess Gewichts-Annotationen auf
- [ ] Rate-Limiting blockiert uebermassige Anfragen von einzelner IP
- [ ] Authentifizierung (Basic-Auth oder OAuth2) schuetzt Admin-Routen
- [ ] Benutzerdefinierte Fehlerseiten erscheinen bei 404/503-Fehlern
- [ ] CORS-Header erlauben Cross-Origin-Anfragen von angegebenen Domains
- [ ] Metriken-Endpunkt exponiert Prometheus-Metriken fuer Monitoring

## Haeufige Stolperfallen

- **Kein ingressClassName**: Ingress wird nicht vom Controller aufgenommen. Immer `ingressClassName: nginx` in Kubernetes 1.19+ angeben.

- **Zertifikat-Challenges fehlschlagen**: DNS zeigt nicht auf Ingress-LoadBalancer. Mit `dig yourdomain.com` pruefen, bevor Zertifikat angefordert wird.

- **HTTP-01-Challenge-Timeout**: Firewall blockiert Port 80. Let's Encrypt muss `http://domain/.well-known/acme-challenge/` fuer Validierung erreichen koennen.

- **Rate-Limit gilt global**: `limit-rps`-Annotation gilt pro Ingress, nicht pro Pfad. Separate Ingresses fuer unterschiedliche Rate-Limits erstellen.

- **Rewrite-Target-Regex falsch**: Captures passen nicht zum Pfad-Muster. Mit `echo "/api/users" | sed 's|/api(/\|$)\(.*\)|/\2|'` testen.

- **Canary-Gewicht ignoriert**: Mehrere Canary-Ingresses fuer denselben Host/Pfad konfliktieren. Nur einen Canary-Ingress pro Route erstellen.

- **Auth-Bypass per IP**: Authentifizierung nur am Ingress, Backend-Services per ClusterIP erreichbar. Netzwerkrichtlinien oder Service-Mesh implementieren.

- **Configuration-Snippet-Injection-Risiko**: Benutzereingaben in configuration-snippet ermoeglichen NGINX-Config-Injection. Alle Annotationen validieren und bereinigen.

## Verwandte Skills

- `deploy-to-kubernetes` - Services erstellen, an die Ingress weiterleitet
- `manage-kubernetes-secrets` - TLS-Zertifikate als Secrets verwalten
- `implement-gitops-workflow` - Deklaratives Ingress-Management mit Argo CD
- `setup-service-mesh` - Erweitertes Traffic-Management mit Istio/Linkerd
- `build-ci-cd-pipeline` - Automatisierte Ingress-Updates in CI/CD
