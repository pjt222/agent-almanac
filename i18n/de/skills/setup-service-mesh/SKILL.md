---
name: setup-service-mesh
description: >
  Service-Mesh (Istio oder Linkerd) deployen und konfigurieren, um sichere
  Service-zu-Service-Kommunikation, Traffic-Management, Observability und
  Richtliniendurchsetzung in Kubernetes-Clustern zu aktivieren. Behandelt
  Installation, mTLS-Konfiguration, Traffic-Routing, Circuit-Breaking und
  Integration mit Monitoring-Tools. Einsatz wenn Microservices verschluesselte
  Service-zu-Service-Kommunikation, feingranulare Traffic-Kontrolle fuer
  Canary- oder A/B-Deployments, Observability ueber alle Service-Interaktionen
  ohne Anwendungsaenderungen oder konsistentes Circuit-Breaking und
  Retry-Richtlinien benoetigen.
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
  tags: service-mesh, istio, linkerd, mtls, traffic-management, observability, kubernetes
---

# Service-Mesh einrichten

Service-Mesh fuer sichere Service-zu-Service-Kommunikation und erweitertes Traffic-Management deployen und konfigurieren.

## Wann verwenden

- Microservices-Architektur benoetigt verschluesselte Service-zu-Service-Kommunikation
- Feingranulare Traffic-Kontrolle benoetigt (Canary-Deployments, A/B-Tests, Traffic-Splitting)
- Observability ueber alle Service-Interaktionen ohne Anwendungsaenderungen erforderlich
- Sicherheitsrichtlinien (mTLS, Autorisierung) auf Infrastrukturebene durchsetzen
- Circuit-Breaking, Retries und Timeouts konsistent ueber Services implementieren
- Verteiltes Tracing und Service-Abhaengigkeits-Mapping benoetigt

## Eingaben

- **Erforderlich**: Kubernetes-Cluster mit Admin-Zugriff
- **Erforderlich**: Auswahl des Service-Meshs (Istio oder Linkerd)
- **Erforderlich**: Namespace(s) fuer Service-Mesh aktivieren
- **Optional**: Monitoring-Stack (Prometheus, Grafana, Jaeger)
- **Optional**: Benutzerdefinierte Traffic-Management-Anforderungen
- **Optional**: Zertifizierungsstellen-Konfiguration fuer mTLS

## Vorgehensweise

> Siehe [Erweiterte Beispiele](references/EXAMPLES.md) fuer vollstaendige Konfigurationsdateien und Vorlagen.

### Schritt 1: Service-Mesh-Control-Plane installieren

Control-Plane des Service-Meshs auswaehlen und installieren.

**Fuer Istio:**
```bash
curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.20.2 sh -
istioctl install --set profile=production -y
kubectl get pods -n istio-system
```

**Fuer Linkerd:**
```bash
curl -sL https://run.linkerd.io/install | sh
linkerd check --pre
linkerd install --ha | kubectl apply -f -
linkerd check
```

Service-Mesh-Konfiguration mit Ressourcenlimits und Tracing erstellen:
```yaml
# service-mesh-config.yaml (abbreviated)
spec:
  profile: production
  meshConfig:
    enableTracing: true
  components:
    pilot:
      k8s:
        resources: { requests: { cpu: 500m, memory: 2Gi } }
# See EXAMPLES.md Step 1 for complete configuration
```

**Erwartet:** Control-Plane-Pods laufen im istio-system- (Istio) oder linkerd- (Linkerd) Namespace. `istioctl version` oder `linkerd version` zeigt uebereinstimmende Client- und Server-Versionen.

**Bei Fehler:**
- Pruefen, ob Cluster ausreichende Ressourcen hat (mindestens 4 CPU-Kerne, 8 GB RAM fuer Produktion)
- Kubernetes-Versionskompatibilitaet pruefen (Mesh-Dokumentation konsultieren)
- Logs pruefen: `kubectl logs -n istio-system -l app=istiod` oder `kubectl logs -n linkerd -l linkerd.io/control-plane-component=controller`
- Auf konflikterende CRDs pruefen: `kubectl get crd | grep istio` oder `kubectl get crd | grep linkerd`

### Schritt 2: Automatische Sidecar-Injection aktivieren

Namespaces fuer automatische Sidecar-Proxy-Injection konfigurieren.

**Fuer Istio:**
```bash
# Label namespace for automatic injection
kubectl label namespace default istio-injection=enabled
kubectl get namespace -L istio-injection
```

**Fuer Linkerd:**
```bash
# Annotate namespace for injection
kubectl annotate namespace default linkerd.io/inject=enabled
```

Sidecar-Injection mit Beispiel-Deployment testen:
```yaml
# test-deployment.yaml (abbreviated)
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: app
        image: nginx:alpine
# See EXAMPLES.md Step 2 for complete test deployment
```

Anwenden und pruefen:
```bash
kubectl apply -f test-deployment.yaml
kubectl get pods -n default
# Expect 2/2 containers (app + proxy)
```

**Erwartet:** Neue Pods zeigen 2/2 Container (Anwendung + Sidecar-Proxy). Describe-Ausgabe zeigt istio-proxy- oder linkerd-proxy-Container. Logs zeigen erfolgreichen Proxy-Start.

**Bei Fehler:**
- Namespace-Labels/-Annotationen pruefen: `kubectl get ns default -o yaml`
- Pruefen, ob Mutating-Webhook aktiv: `kubectl get mutatingwebhookconfiguration`
- Injection-Logs pruefen: `kubectl logs -n istio-system -l app=sidecar-injector` (Istio)
- Manuell injizieren zum Testen: `kubectl get deploy test-app -o yaml | istioctl kube-inject -f - | kubectl apply -f -`

### Schritt 3: mTLS-Richtlinie konfigurieren

Mutual TLS fuer sichere Service-zu-Service-Kommunikation aktivieren.

**Fuer Istio:**
```yaml
# mtls-policy.yaml (abbreviated)
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT
# See EXAMPLES.md Step 3 for per-namespace and permissive mode examples
```

**Fuer Linkerd:**
```bash
# Linkerd enforces mTLS by default for meshed pods
linkerd viz tap deploy/test-app -n default
# Check for 🔒 (lock) symbol
```

Anwenden und pruefen:
```bash
kubectl apply -f mtls-policy.yaml
# Istio: verify mTLS status
istioctl authn tls-check $(kubectl get pod -n default -l app=test-app -o jsonpath='{.items[0].metadata.name}') -n default
```

**Erwartet:** Alle Verbindungen zwischen gemeshten Services zeigen mTLS aktiviert. Istio `tls-check` zeigt STATUS "OK". Linkerd `tap`-Ausgabe zeigt Schloss-Symbol fuer alle Verbindungen. Service-Logs zeigen keine TLS-Fehler.

**Bei Fehler:**
- Zertifikatausstellung pruefen: `kubectl get certificates -A` (cert-manager)
- CA-Gesundheit pruefen: `kubectl logs -n istio-system -l app=istiod | grep -i cert`
- Zuerst PERMISSIVE-Modus testen, dann zu STRICT wechseln
- Services ohne Sidecars pruefen: `kubectl get pods --all-namespaces -o json | jq '.items[] | select(.spec.containers | length == 1) | .metadata.name'`

### Schritt 4: Traffic-Management-Regeln implementieren

Intelligentes Traffic-Routing, Retries und Circuit-Breaking konfigurieren.

Traffic-Management-Richtlinien erstellen:
```yaml
# traffic-management.yaml (abbreviated)
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
spec:
  http:
  - match:
    - uri: { prefix: /api/v2 }
    route:
    - destination: { host: api-service, subset: v2 }
      weight: 10
    - destination: { host: api-service, subset: v1 }
      weight: 90
    retries: { attempts: 3, perTryTimeout: 2s }
# See EXAMPLES.md Step 4 for complete routing, circuit breaker, and gateway configs
```

**Fuer Linkerd Traffic-Splitting:**
```yaml
apiVersion: split.smi-spec.io/v1alpha2
kind: TrafficSplit
spec:
  service: api-service
  backends:
  - service: api-service-v1
    weight: 900
  - service: api-service-v2
    weight: 100
```

Anwenden und testen:
```bash
kubectl apply -f traffic-management.yaml
# Test traffic distribution
for i in {1..100}; do curl -s http://api.example.com/api/v2 | grep version; done | sort | uniq -c
# Monitor: istioctl dashboard kiali or linkerd viz dashboard
```

**Erwartet:** Traffic teilt sich gemaess definierten Gewichten auf. Circuit-Breaker loest nach aufeinanderfolgenden Fehlern aus. Retries erfolgen bei voruebertgehenden Fehlern. Kiali/Linkerd-Dashboard zeigt Traffic-Fluss-Visualisierung.

**Bei Fehler:**
- Pruefen, ob Destination-Hosts aufgeloest werden: `kubectl get svc -n production`
- Pruefen, ob Subset-Labels Pod-Labels entsprechen: `kubectl get pods -n production --show-labels`
- Pilot-Logs pruefen: `kubectl logs -n istio-system -l app=istiod`
- Zuerst ohne Circuit-Breaker testen, dann schrittweise hinzufuegen
- `istioctl analyze` zur Konfigurationspruefung verwenden: `istioctl analyze -n production`

### Schritt 5: Observability-Stack integrieren

Service-Mesh-Telemetrie mit Monitoring- und Tracing-Systemen verbinden.

**Observability-Addons installieren:**
```bash
# Istio: Prometheus, Grafana, Kiali, Jaeger
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/prometheus.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/grafana.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/kiali.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/jaeger.yaml

# Linkerd
linkerd viz install | kubectl apply -f -
linkerd jaeger install | kubectl apply -f -
```

Benutzerdefinierte Metriken und Dashboards konfigurieren:
```yaml
# service-monitor.yaml (abbreviated)
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: istio-mesh-metrics
spec:
  selector: { matchLabels: { app: istiod } }
  endpoints:
  - port: http-monitoring
    interval: 30s
# See EXAMPLES.md Step 5 for Grafana dashboards and telemetry config
```

Dashboards aufrufen:
```bash
istioctl dashboard grafana  # or: linkerd viz dashboard
istioctl dashboard kiali
istioctl dashboard jaeger
```

**Erwartet:** Dashboards zeigen Service-Topologie, Anfrage-Raten, Latenz-Perzentile, Fehlerraten. Verteilte Traces in Jaeger verfuegbar. Prometheus scraped Mesh-Metriken erfolgreich. Benutzerdefinierte Metriken erscheinen in Abfragen.

**Bei Fehler:**
- Prometheus-Scraping pruefen: `kubectl get servicemonitor -A`
- Addon-Pods pruefen: `kubectl get pods -n istio-system`
- Telemetrie-Konfiguration pruefen: `istioctl proxy-config log <pod-name> -n <namespace>`
- Pruefen, ob Mesh-Config Telemetrie aktiviert hat: `kubectl get configmap istio -n istio-system -o yaml | grep -A 5 enableTracing`

### Schritt 6: Mesh-Gesundheit validieren und ueberwachen

Umfassende Gesundheitspruefungen durchfuehren und laufendes Monitoring einrichten.

```bash
# Istio validation
istioctl analyze --all-namespaces
istioctl verify-install
istioctl proxy-status

# Linkerd validation
linkerd check
linkerd viz check
linkerd diagnostics policy

# Check proxy sync status
kubectl get pods -n production -o json | \
  jq '.items[] | {name: .metadata.name, proxy: .status.containerStatuses[] | select(.name=="istio-proxy").ready}'

# Monitor control plane health
kubectl get pods -n istio-system -w
kubectl top pods -n istio-system
```

Gesundheitspruef-Skript und Alerts erstellen:
```bash
#!/bin/bash
# mesh-health-check.sh (abbreviated)
echo "=== Service Mesh Health Check ==="
kubectl get pods -n istio-system
istioctl analyze --all-namespaces
# See EXAMPLES.md Step 6 for complete health check script and alert configs
```

**Erwartet:** Alle Analysen bestehen ohne Warnungen. Proxy-Status zeigt alle Proxies synchronisiert. mTLS-Pruefung bestaetigt Verschluesselung. Metriken zeigen fliessenden Traffic. Control-Plane-Pods stabil mit geringem Ressourcenverbrauch.

**Bei Fehler:**
- Spezifische Probleme aus `istioctl analyze`-Ausgabe beheben
- Proxy-Logs einzelner Pods pruefen: `kubectl logs <pod> -c istio-proxy -n <namespace>`
- Pruefen, ob Netzwerkrichtlinien Mesh-Traffic blockieren
- Control-Plane-Logs auf Fehler pruefen: `kubectl logs -n istio-system deploy/istiod --tail=100`
- Problematische Proxies neu starten: `kubectl rollout restart deploy/<deployment> -n <namespace>`

## Validierung

- [ ] Control-Plane-Pods laufen und sind gesund (istiod/linkerd-controller)
- [ ] Sidecar-Proxies in alle Anwendungs-Pods injiziert (2/2 Container)
- [ ] mTLS aktiviert und funktionsfaehig (mit tls-check/tap verifiziert)
- [ ] Traffic-Management-Regeln leiten Anfragen korrekt weiter (mit curl-Tests verifiziert)
- [ ] Circuit-Breaker loest bei wiederholten Fehlern aus (mit Fehlerinjektion getestet)
- [ ] Observability-Dashboards zeigen Metriken (Grafana/Kiali/Linkerd Viz)
- [ ] Verteilte Traces fuer Beispielanfragen in Jaeger erfasst
- [ ] Keine Konfigurationswarnungen von istioctl analyze/linkerd check
- [ ] Proxy-Sync-Status zeigt alle Proxies synchronisiert
- [ ] Service-zu-Service-Kommunikation verschluesselt (in Logs/Dashboards verifiziert)

## Haeufige Stolperfallen

- **Ressourcenerschoepfung**: Service-Mesh fuegt 100-200 MB Speicher pro Pod fuer Sidecars hinzu. Sicherstellen, dass Cluster ausreichende Kapazitaet hat. Geeignete Ressourcenlimits in Injection-Konfiguration setzen.

- **Konfigurationskonflikte**: Mehrere VirtualServices fuer denselben Host verursachen undefiniertes Verhalten. Einzelnen VirtualService pro Host mit mehreren Match-Bedingungen verwenden.

- **Zertifikats-Ablauf**: mTLS-Zertifikate rotieren automatisch, aber CA-Root muss verwaltet werden. Zertifikats-Ablauf mit `kubectl get certificate -A` ueberwachen und Alerts einrichten.

- **Sidecar nicht injiziert**: Pods vor Namespace-Beschriftung haben keine Sidecars. Muss neu erstellt werden: `kubectl rollout restart deploy/<name> -n <namespace>`.

- **DNS-Aufloesung**: Service-Mesh fauengt DNS ab. Vollqualifizierte Namen verwenden (service.namespace.svc.cluster.local) fuer Cross-Namespace-Aufrufe.

- **Port-Benennungspflicht**: Istio erfordert benannte Ports nach Protokoll-Namensmuster (z.B. http-web, tcp-db). Unbenannte Ports verwenden standardmaessig TCP-Passthrough.

- **Schrittweises Rollout erforderlich**: STRICT mTLS nicht sofort in Produktion aktivieren. PERMISSIVE-Modus bei Migration verwenden, alle Services pruefen, dann zu STRICT wechseln.

- **Observability-Overhead**: 100% Tracing-Sampling verursacht Leistungsprobleme. 1-10% fuer Produktion verwenden: `sampling: 1.0` in Mesh-Konfiguration.

- **Gateway vs VirtualService Verwechslung**: Gateway konfiguriert Ingress (Load-Balancer), VirtualService konfiguriert Routing. Beide fuer externen Traffic erforderlich.

- **Versionskompatibilitaet**: Mesh-Version muss mit Kubernetes-Version kompatibel sein. Istio unterstuetzt n-1-Minor-Versionen, Linkerd typischerweise die letzten 3 Kubernetes-Versionen.

## Verwandte Skills

- `configure-ingress-networking` - Gateway-Konfiguration ergaenzt Mesh-Ingress
- `deploy-to-kubernetes` - Anwendungs-Deployment-Muster fuer Service-Mesh
- `setup-prometheus-monitoring` - Prometheus-Integration fuer Mesh-Metriken
- `manage-kubernetes-secrets` - Zertifikatsverwaltung fuer mTLS
- `enforce-policy-as-code` - OPA-Richtlinien neben Mesh-Autorisierung
