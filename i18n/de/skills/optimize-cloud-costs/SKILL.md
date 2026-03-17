---
name: optimize-cloud-costs
description: >
  Cloud-Kostenoptimierungsstrategien fuer Kubernetes-Workloads implementieren
  mit Tools wie Kubecost fuer Sichtbarkeit, Right-Sizing-Empfehlungen,
  horizontalem und vertikalem Pod-Autoscaling, Spot-/Preemptible-Instanzen
  und Ressourcenkontingenten. Behandelt Kostenzuordnung, Showback-Reporting
  und kontinuierliche Optimierungspraktiken. Einsatz wenn Cloud-Kosten ohne
  proportionalen Geschaeftswert steigen, Ressourcenanforderungen nicht mit
  der tatsaechlichen Nutzung uebereinstimmen, manuelle Skalierung zu
  Ueberbereitstellung fuehrt oder Showback und Chargeback fuer interne
  Kostenverantwortlichkeit implementiert werden sollen.
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
  tags: cost-optimization, kubecost, hpa, vpa, spot-instances, resource-management, kubernetes
---

# Cloud-Kosten optimieren

Umfassende Kostenoptimierungsstrategien fuer Kubernetes-Cluster implementieren, um Cloud-Ausgaben zu reduzieren.

## Wann verwenden

- Cloud-Infrastrukturkosten steigen ohne entsprechende Geschaeftswertszunahme
- Sichtbarkeit in Kostenzuordnung nach Team, Anwendung oder Umgebung benoetigt
- Ressourcenanforderungen/-limits nicht mit tatsaechlichen Nutzungsmustern abgestimmt
- Manuelle Skalierung fuehrt zu Ueberbereitstellung und Verschwendung
- Spot-/Preemptible-Instanzen fuer nicht-kritische Workloads nutzen
- Showback oder Chargeback fuer interne Kostenzuordnung implementieren
- FinOps-Kultur mit Kostenbewusstsein und Verantwortlichkeit aufbauen

## Eingaben

- **Erforderlich**: Kubernetes-Cluster mit laufenden Workloads
- **Erforderlich**: Cloud-Provider-Billing-API-Zugriff
- **Erforderlich**: Metrics-Server oder Prometheus fuer Ressourcenmetriken
- **Optional**: Historische Nutzungsdaten fuer Trendanalyse
- **Optional**: Kostenzuordnungsanforderungen (nach Namespace, Label, Team)
- **Optional**: Service-Level-Objectives (SLOs) fuer Leistungseinschraenkungen
- **Optional**: Budgetlimits oder Kostensenkungsziele

## Vorgehensweise

> Siehe [Erweiterte Beispiele](references/EXAMPLES.md) fuer vollstaendige Konfigurationsdateien und Vorlagen.


### Schritt 1: Kostenanalyse-Tools deployen

Kubecost oder OpenCost fuer Kostenmonitoring und -zuordnung installieren.

**Kubecost installieren:**
```bash
# Add Kubecost Helm repository
helm repo add kubecost https://kubecost.github.io/cost-analyzer/
helm repo update

# Install Kubecost with Prometheus integration
helm install kubecost kubecost/cost-analyzer \
  --namespace kubecost \
  --create-namespace \
  --set kubecostToken="your-token-here" \
  --set prometheus.server.global.external_labels.cluster_id="production-cluster" \
  --set prometheus.nodeExporter.enabled=true \
  --set prometheus.serviceAccounts.nodeExporter.create=true

# For existing Prometheus, configure Kubecost to use it
helm install kubecost kubecost/cost-analyzer \
  --namespace kubecost \
  --create-namespace \
  --set prometheus.enabled=false \
  --set global.prometheus.fqdn="http://prometheus-server.monitoring.svc.cluster.local" \
  --set global.prometheus.enabled=true

# Verify installation
kubectl get pods -n kubecost
kubectl get svc -n kubecost

# Access Kubecost UI
kubectl port-forward -n kubecost svc/kubecost-cost-analyzer 9090:9090
# Open http://localhost:9090
```

**Cloud-Provider-Integration konfigurieren:**
```yaml
# kubecost-cloud-integration.yaml
apiVersion: v1
kind: Secret
metadata:
  name: cloud-integration
  namespace: kubecost
type: Opaque
stringData:
  # For AWS
  cloud-integration.json: |
    {
      "aws": [
        {
          "serviceKeyName": "AWS_ACCESS_KEY_ID",
          "serviceKeySecret": "AWS_SECRET_ACCESS_KEY",
          "athenaProjectID": "cur-query-results",
          "athenaBucketName": "s3://your-cur-bucket",
          "athenaRegion": "us-east-1",
          "athenaDatabase": "athenacurcfn_my_cur",
          "athenaTable": "my_cur"
        }
      ]
    }
---
# For GCP
apiVersion: v1
kind: Secret
metadata:
  name: gcp-key
  namespace: kubecost
type: Opaque
data:
  key.json: <base64-encoded-service-account-key>
---
# For Azure
apiVersion: v1
kind: ConfigMap
metadata:
  name: azure-config
  namespace: kubecost
data:
  azure.json: |
    {
      "azureSubscriptionID": "your-subscription-id",
      "azureClientID": "your-client-id",
      "azureClientSecret": "your-client-secret",
      "azureTenantID": "your-tenant-id",
      "azureOfferDurableID": "MS-AZR-0003P"
    }
```

Cloud-Integration anwenden:
```bash
kubectl apply -f kubecost-cloud-integration.yaml

# Verify cloud costs are being imported
kubectl logs -n kubecost -l app=cost-analyzer -c cost-model --tail=100 | grep -i "cloud"

# Check Kubecost API for cost data
kubectl port-forward -n kubecost svc/kubecost-cost-analyzer 9090:9090 &
curl http://localhost:9090/model/allocation\?window\=7d | jq .
```

**Erwartet:** Kubecost-Pods laufen erfolgreich. UI zeigt Kostenaufteilung nach Namespace, Deployment, Pod. Cloud-Provider-Kosten werden importiert (kann 24-48 Stunden fuer initiale Synchronisation dauern). API liefert Zuordnungsdaten zurueck.

**Bei Fehler:**
- Pruefen, ob Prometheus laeuft und erreichbar ist: `kubectl get svc -n monitoring prometheus-server`
- Pruefen, ob Cloud-Credentials Billing-API-Zugriff haben
- Cost-Model-Logs pruefen: `kubectl logs -n kubecost -l app=cost-analyzer -c cost-model`
- Sicherstellen, dass Metrics-Server oder Prometheus Node-Exporter Ressourcenmetriken sammelt

### Schritt 2: Aktuelle Ressourcenauslastung analysieren

Ueberbereitgestellte Ressourcen und Optimierungsmoeglichkeiten identifizieren.

**Ressourcenauslastung abfragen:**
```bash
# Get resource requests vs usage for all pods
kubectl top pods --all-namespaces --containers | \
  awk 'NR>1 {print $1,$2,$3,$4,$5}' > current-usage.txt

# Compare requests to actual usage
cat <<'EOF' > analyze-utilization.sh
#!/bin/bash
echo "Pod,Namespace,CPU-Request,CPU-Usage,Memory-Request,Memory-Usage"
for ns in $(kubectl get ns -o jsonpath='{.items[*].metadata.name}'); do
  kubectl get pods -n $ns -o json | jq -r '
    .items[] |
    select(.status.phase == "Running") |
    {
      name: .metadata.name,
      namespace: .metadata.namespace,
      containers: [
        .spec.containers[] |
        {
          name: .name,
          cpuReq: .resources.requests.cpu,
          memReq: .resources.requests.memory
        }
      ]
    } |
    "\(.name),\(.namespace),\(.containers[].cpuReq // "none"),\(.containers[].memReq // "none")"
  ' 2>/dev/null
done
EOF

chmod +x analyze-utilization.sh
./analyze-utilization.sh > resource-requests.csv

# Get actual usage from metrics server
kubectl top pods --all-namespaces --containers > actual-usage.txt
```

**Kubecost-Empfehlungen nutzen:**
```bash
# Get right-sizing recommendations via API
curl "http://localhost:9090/model/savings/requestSizing?window=7d" | jq . > recommendations.json

# Extract top wasteful resources
jq '.data[] | select(.totalRecommendedSavings > 10) | {
  cluster: .clusterID,
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** Klare Uebersicht ueber aktuelle Ressourcenanforderungen vs tatsaechliche Nutzung. Identifikation von Pods mit <30% Auslastung (ueberbereitgestellt). Liste von Optimierungsmoeglichkeiten mit geschaetzten Einsparungen.

**Bei Fehler:**
- Sicherstellen, dass Metrics-Server laeuft: `kubectl get deployment metrics-server -n kube-system`
- Pruefen, ob Prometheus Node-Exporter-Metriken hat: `curl http://prometheus:9090/api/v1/query?query=node_cpu_seconds_total`
- Pruefen, ob Pods lange genug gelaufen sind fuer aussagekraeftige Daten (mindestens 24 Stunden)

### Schritt 3: Horizontales Pod-Autoscaling (HPA) implementieren

Automatische Skalierung basierend auf CPU, Speicher oder benutzerdefinierten Metriken konfigurieren.

**HPA fuer CPU-basierte Skalierung erstellen:**
```yaml
# hpa-cpu.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-server-hpa
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**HPA deployen und pruefen:**
```bash
kubectl apply -f hpa-cpu.yaml

# Check HPA status
kubectl get hpa -n production
kubectl describe hpa api-server-hpa -n production

# Monitor scaling events
kubectl get events -n production --field-selector involvedObject.kind=HorizontalPodAutoscaler --watch

# Generate load to test autoscaling
kubectl run load-generator --rm -it --image=busybox -- /bin/sh -c \
  "while true; do wget -q -O- http://api-server.production.svc.cluster.local; done"

# Watch replicas scale
watch kubectl get hpa,deployment -n production
```

**Erwartet:** HPA erstellt und zeigt aktuelle/Ziel-Metriken. Pods skalieren unter Last hoch. Pods skalieren herunter, wenn Last nachlasst (nach Stabilisierungsfenster). Skalierungsereignisse protokolliert. Kein Thrashing (schnelle Auf-/Ab-Skalierungszyklen).

**Bei Fehler:**
- Pruefen, ob Metrics-Server laeuft: `kubectl get apiservice v1beta1.metrics.k8s.io`
- Pruefen, ob Deployment Ressourcenanforderungen gesetzt hat (HPA erfordert dies)
- HPA-Ereignisse pruefen: `kubectl describe hpa api-server-hpa -n production`
- Sicherstellen, dass Ziel-Deployment nicht bei maximalen Replikas ist

### Schritt 4: Vertikales Pod-Autoscaling (VPA) konfigurieren

Ressourcenanforderungen basierend auf tatsaechlichen Nutzungsmustern automatisch anpassen.

**VPA installieren:**
```bash
# Clone VPA repository
git clone https://github.com/kubernetes/autoscaler.git
cd autoscaler/vertical-pod-autoscaler

# Install VPA
./hack/vpa-up.sh

# Verify installation
kubectl get pods -n kube-system | grep vpa

# Check VPA CRDs
kubectl get crd | grep verticalpodautoscaler
```

**VPA-Richtlinien erstellen:**
```yaml
# vpa-policies.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: api-server-vpa
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**VPA deployen und ueberwachen:**
```bash
kubectl apply -f vpa-policies.yaml

# Check VPA recommendations
kubectl get vpa -n production
kubectl describe vpa api-server-vpa -n production

# View detailed recommendations
kubectl get vpa api-server-vpa -n production -o jsonpath='{.status.recommendation}' | jq .

# Monitor VPA-initiated pod updates
kubectl get events -n production --field-selector involvedObject.kind=VerticalPodAutoscaler --watch
```

**Erwartet:** VPA liefert Empfehlungen oder aktualisiert Ressourcenanforderungen automatisch. Empfehlungen basieren auf Perzentil-Nutzungsmustern (typischerweise P95). Pods werden mit neuen Anforderungen neu gestartet bei Verwendung von Auto/Recreate-Modus. Keine Konflikte zwischen HPA und VPA (HPA fuer Replikas, VPA fuer Ressourcen pro Pod verwenden).

**Bei Fehler:**
- Sicherstellen, dass Metrics-Server ausreichend Daten hat (VPA benoetigt mehrere Tage fuer genaue Empfehlungen)
- VPA-Komponenten laufend pruefen: `kubectl get pods -n kube-system | grep vpa`
- VPA nicht und HPA auf demselben Metrik (CPU/Speicher) verwenden - verursacht Konflikte

### Schritt 5: Spot-/Preemptible-Instanzen nutzen

Workload-Planung auf kostenguenstigen Spot-Instanzen konfigurieren.

**Node-Pools mit Spot-Instanzen erstellen:**
```yaml
# For AWS (via Karpenter)
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: spot-provisioner
spec:
# ... (see EXAMPLES.md for complete configuration)
```

**Workloads fuer Spot-Instanzen konfigurieren:**
```yaml
# spot-workload.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: batch-processor
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**Deployen und Spot-Nutzung ueberwachen:**
```bash
kubectl apply -f spot-workload.yaml

# Monitor spot node allocation
kubectl get nodes -l node-type=spot

# Check workload distribution
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** Workloads werden erfolgreich auf Spot-Nodes geplant. Erhebliche Kosteneinsparung (typischerweise 60-90% vs On-Demand). Elegante Behandlung von Spot-Unterbrechungen mit Pod-Neuplanung. Monitoring zeigt Spot-Unterbrechungsrate und erfolgreiche Wiederherstellung.

**Bei Fehler:**
- Spot-Instanz-Verfuegbarkeit in Region/Zonen pruefen
- Node-Labels und -Taints mit Workload-Tolerations abgleichen
- Karpenter-Logs pruefen: `kubectl logs -n karpenter -l app.kubernetes.io/name=karpenter`
- Sicherstellen, dass Workloads zustandslos sind oder ordentliches Zustandsmanagement fuer Unterbrechungen haben

### Schritt 6: Ressourcenkontingente und Budget-Alerts implementieren

Harte Limits und Alarmierung fuer Kostenkontrolle einrichten.

**Ressourcenkontingente erstellen:**
```yaml
# resource-quotas.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: production-quota
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

**Budget-Alerts konfigurieren:**
```yaml
# kubecost-budget-alerts.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: budget-alerts
  namespace: kubecost
# ... (see EXAMPLES.md for complete configuration)
```

Anwenden und ueberwachen:
```bash
kubectl apply -f resource-quotas.yaml
kubectl apply -f kubecost-budget-alerts.yaml

# Check quota usage
kubectl get resourcequota -n production
kubectl describe resourcequota production-quota -n production
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** Ressourcenkontingente setzen Limits pro Namespace durch. Pod-Erstellung wird blockiert, wenn Kontingent ueberschritten. Budget-Alerts loesen aus, wenn Schwellenwerte ueberschritten werden. Kostenspitzen-Erkennung funktioniert. Regelmaessige Berichte an Stakeholder gesendet.

**Bei Fehler:**
- Pruefen, ob ResourceQuota und LimitRange korrekt angewendet: `kubectl get resourcequota,limitrange -A`
- Auf Pods pruefen, die wegen Kontingent fehlschlagen: `kubectl get events -n production | grep quota`
- Kubecost-Alert-Konfiguration pruefen: `kubectl logs -n kubecost -l app=cost-analyzer | grep alert`

## Validierung

- [ ] Kubecost oder OpenCost deployed und zeigt genaue Kostendaten
- [ ] Cloud-Provider-Billing-Integration funktioniert (Kosten stimmen mit tatsaechlichen Rechnungen ueberein)
- [ ] Ressourcenauslastungsanalyse identifiziert ueberbereitgestellte Workloads
- [ ] HPA skaliert Pods basierend auf Last (mit Lasttest verifiziert)
- [ ] VPA liefert Empfehlungen oder passt Ressourcenanforderungen automatisch an
- [ ] Spot-Instanzen behandeln Unterbrechungen elegant
- [ ] Ressourcenkontingente setzen Limits pro Namespace durch
- [ ] Budget-Alerts loesen aus, wenn Schwellenwerte ueberschritten werden
- [ ] Monatliche Kosten sinken oder bleiben im Budget
- [ ] Showback-Berichte fuer Teams/Projekte generiert
- [ ] Keine Leistungsverschlechterung durch Kostenoptimierungen
- [ ] Dokumentation mit Optimierungspraktiken aktualisiert

## Haeufige Stolperfallen

- **Aggressives Right-Sizing**: VPA-Empfehlungen nicht sofort anwenden. Mit "Off"-Modus beginnen, Vorschlaege eine Woche pruefen, dann schrittweise anwenden. Ploetzliche Aenderungen koennen OOMKills oder CPU-Drosselung verursachen.

- **HPA + VPA Konflikt**: HPA und VPA nie auf demselben Metrik (CPU/Speicher) verwenden. HPA fuer horizontale Skalierung, VPA fuer Pod-Ressourcen-Feinabstimmung, oder HPA auf benutzerdefinierten Metriken + VPA auf Ressourcen verwenden.

- **Spot ohne Fehlertoleranz**: Nur fehlertolerante, zustandslose Workloads auf Spot laufen lassen. Nie Datenbanken, zustandsbehaftete Services oder Single-Replica-kritische Services. Immer PodDisruptionBudgets verwenden.

- **Ungenuegender Monitoring-Zeitraum**: Kostenoptimierungsentscheidungen benoetigen historische Daten. Mindestens 7 Tage vor Aenderungen warten, 30 Tage fuer VPA-Empfehlungen, 90 Tage fuer Trendanalyse.

- **Burst-Anforderungen ignorieren**: Limits zu niedrig basierend auf Durchschnittsnutzung setzen verursacht Drosselung bei Traffic-Spitzen. P95 oder P99 Perzentile fuer Kapazitaetsplanung verwenden, nicht Durchschnitt.

- **Netzwerk-Egress-Kosten**: Compute-Kosten in Kubecost sichtbar, aber Egress (Datentransfer) kann erheblich sein. Cross-AZ-Traffic ueberwachen, topologiebewusstes Routing verwenden.

- **Speicher uebersehen**: PersistentVolume-Kosten oft vergessen. Ungenutzte PVCs auditieren, Volumes richtig groessen, Volume-Erweiterung statt Ueberbereitstellung verwenden.

- **Kontingent zu restriktiv**: Kontingente zu niedrig setzen blockiert legitimes Wachstum. Kontingentnutzung monatlich pruefen, basierend auf tatsaechlichem Bedarf anpassen.

- **Falsche Einsparungen durch falsche Metriken**: CPU/Speicher als einzigen Optimierungsmetrik verwenden, verfehlt E/A-, Netzwerk-, Speicherkosten. Gesamtbetriebskosten beruecksichtigen, nicht nur Compute.

- **Chargeback vor Vertrauen**: Chargeback implementieren, bevor Teams Kostendaten verstehen und ihnen vertrauen, verursacht Reibung. Mit Showback (informativ) beginnen, Kostenbewusstseinskultur aufbauen, dann zu Chargeback wechseln.

## Verwandte Skills

- `deploy-to-kubernetes` - Anwendungs-Deployment mit geeigneten Ressourcenanforderungen
- `setup-prometheus-monitoring` - Monitoring-Infrastruktur fuer Kostenmetriken
- `plan-capacity` - Kapazitaetsplanung basierend auf Kosten und Leistung
- `setup-local-kubernetes` - Lokale Entwicklung zur Vermeidung von Cloud-Kosten
- `write-helm-chart` - Templating von Ressourcenanforderungen und -limits
- `implement-gitops-workflow` - GitOps fuer kostenoptimierte Konfigurationen
