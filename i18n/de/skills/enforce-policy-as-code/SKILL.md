---
name: enforce-policy-as-code
description: >
  Policy-as-Code-Durchsetzung mit OPA Gatekeeper oder Kyverno implementieren,
  um Kubernetes-Ressourcen gemaess organisatorischen Richtlinien zu validieren
  und zu mutieren. Behandelt Constraint-Templates, Admission-Control, Audit-
  Modus, Verletzungs-Reporting und Integration mit CI/CD-Pipelines fuer
  Shift-Left-Richtlinienvalidierung. Einsatz beim Durchsetzen von
  Ressourcenkonfigurationsstandards, Verhindern von Sicherheits-
  Fehlkonfigurationen wie privilegierten Containern, Sicherstellen von
  Compliance vor dem Deployment, Standardisieren von Benennungskonventionen
  oder Auditieren bestehender Cluster-Ressourcen gegen Richtlinien.
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
  tags: opa, gatekeeper, kyverno, policy, admission-control, compliance, kubernetes
---

# Policy-as-Code durchsetzen

Deklarative Richtliniendurchsetzung mit OPA Gatekeeper oder Kyverno fuer Kubernetes-Ressourcenvalidierung und -Mutation implementieren.

## Wann verwenden

- Organisationsstandards fuer Ressourcenkonfiguration durchsetzen (Labels, Annotationen, Limits)
- Sicherheits-Fehlkonfigurationen verhindern (privilegierte Container, Host-Namespaces, unsichere Images)
- Compliance-Anforderungen vor dem Ressourcen-Deployment sicherstellen
- Ressourcen-Benennungskonventionen und Metadaten standardisieren
- Automatisierte Korrektur durch Mutations-Richtlinien implementieren
- Bestehende Cluster-Ressourcen gegen Richtlinien auditieren ohne zu blockieren
- Richtlinienvalidierung in CI/CD-Pipelines fuer Shift-Left-Ansatz integrieren

## Eingaben

- **Erforderlich**: Kubernetes-Cluster mit Admin-Zugriff
- **Erforderlich**: Auswahl der Policy-Engine (OPA Gatekeeper oder Kyverno)
- **Erforderlich**: Liste der durchzusetzenden Richtlinien (Sicherheit, Compliance, Betrieb)
- **Optional**: Vorhandene Ressourcen zum Auditieren
- **Optional**: Ausnahme-/Ausschluss-Muster fuer spezifische Namespaces oder Ressourcen
- **Optional**: CI/CD-Pipeline-Konfiguration fuer Pre-Deployment-Validierung

## Vorgehensweise

> Siehe [Erweiterte Beispiele](references/EXAMPLES.md) fuer vollstaendige Konfigurationsdateien und Vorlagen.


### Schritt 1: Policy-Engine installieren

OPA Gatekeeper oder Kyverno als Admission-Controller deployen.

**Fuer OPA Gatekeeper:**
```bash
# Install Gatekeeper using Helm
helm repo add gatekeeper https://open-policy-agent.github.io/gatekeeper/charts
helm repo update

# Install with audit enabled
helm install gatekeeper gatekeeper/gatekeeper \
  --namespace gatekeeper-system \
  --create-namespace \
  --set audit.replicas=2 \
  --set replicas=3 \
  --set validatingWebhookFailurePolicy=Fail \
  --set auditInterval=60

# Verify installation
kubectl get pods -n gatekeeper-system
kubectl get crd | grep gatekeeper

# Check webhook configuration
kubectl get validatingwebhookconfigurations gatekeeper-validating-webhook-configuration -o yaml
```

**Fuer Kyverno:**
```bash
# Install Kyverno using Helm
helm repo add kyverno https://kyverno.github.io/kyverno/
helm repo update

# Install with HA setup
helm install kyverno kyverno/kyverno \
  --namespace kyverno \
  --create-namespace \
  --set replicaCount=3 \
  --set admissionController.replicas=3 \
  --set backgroundController.replicas=2 \
  --set cleanupController.replicas=2

# Verify installation
kubectl get pods -n kyverno
kubectl get crd | grep kyverno

# Check webhook configurations
kubectl get validatingwebhookconfigurations kyverno-resource-validating-webhook-cfg
kubectl get mutatingwebhookconfigurations kyverno-resource-mutating-webhook-cfg
```

Namespace-Ausschluesse erstellen:
```yaml
# gatekeeper-config.yaml
apiVersion: config.gatekeeper.sh/v1alpha1
kind: Config
metadata:
  name: config
  namespace: gatekeeper-system
spec:
  match:
    - excludedNamespaces:
      - kube-system
      - kube-public
      - kube-node-lease
      - gatekeeper-system
      processes:
      - audit
      - webhook
  validation:
    traces:
      - user: system:serviceaccount:gatekeeper-system:gatekeeper-admin
        kind:
          group: ""
          version: v1
          kind: Namespace
```

**Erwartet:** Policy-Engine-Pods laufen mit mehreren Replikas. CRDs installiert (ConstraintTemplate, Constraint fuer Gatekeeper; ClusterPolicy, Policy fuer Kyverno). Validierungs-/Mutations-Webhooks aktiv. Audit-Controller laeuft.

**Bei Fehler:**
- Pod-Logs pruefen: `kubectl logs -n gatekeeper-system -l app=gatekeeper --tail=50`
- Webhook-Endpunkte erreichbar pruefen: `kubectl get endpoints -n gatekeeper-system`
- Auf Port-Konflikte oder Zertifikatsprobleme in Webhook-Logs pruefen
- Sicherstellen, dass Cluster ausreichende Ressourcen hat (Policy-Engines benoetigen ~500 MB pro Replik)
- RBAC-Berechtigungen pruefen: `kubectl auth can-i create constrainttemplates --as=system:serviceaccount:gatekeeper-system:gatekeeper-admin`

### Schritt 2: Constraint-Templates und Richtlinien definieren

Wiederverwendbare Richtlinien-Templates und spezifische Constraints erstellen.

**OPA-Gatekeeper-Constraint-Template:**
```yaml
# required-labels-template.yaml
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
  annotations:
# ... (see EXAMPLES.md for complete configuration)
```

**Kyverno-ClusterPolicy:**
```yaml
# kyverno-policies.yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-labels
  annotations:
# ... (see EXAMPLES.md for complete configuration)
```

Richtlinien anwenden:
```bash
# Apply Gatekeeper templates and constraints
kubectl apply -f required-labels-template.yaml

# Apply Kyverno policies
kubectl apply -f kyverno-policies.yaml

# Verify constraint/policy status
kubectl get constraints
kubectl get clusterpolicies

# Check for any policy errors
kubectl describe k8srequiredlabels require-app-labels
kubectl describe clusterpolicy require-labels
```

**Erwartet:** ConstraintTemplates/ClusterPolicies erfolgreich erstellt. Constraints zeigen Status "True" fuer Durchsetzung. Keine Fehler in Richtliniendefinitionen. Webhook beginnt neue Ressourcen gegen Richtlinien auszuwerten.

**Bei Fehler:**
- Rego-Syntax validieren (Gatekeeper): `opa test` lokal verwenden oder Constraint-Status pruefen
- YAML-Syntax pruefen: `kubectl apply --dry-run=client -f policy.yaml`
- Constraint-Status pruefen: `kubectl get constraint -o yaml | grep -A 10 status`
- Mit einfacher Richtlinie beginnen, dann Komplexitaet erhoehen
- Pruefen, ob Match-Kriterien (Arten, Namespaces) korrekt sind

### Schritt 3: Richtliniendurchsetzung testen

Validieren, dass Richtlinien nicht-konforme Ressourcen blockieren und konforme erlauben.

Test-Manifeste erstellen:
```yaml
# test-non-compliant.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-no-labels
  namespace: production
# ... (see EXAMPLES.md for complete configuration)
```

Richtlinien testen:
```bash
# Attempt to create non-compliant resource (should fail)
kubectl apply -f test-non-compliant.yaml
# Expected: Error with policy violation message

# Create compliant resource (should succeed)
kubectl apply -f test-compliant.yaml
# Expected: deployment.apps/test-compliant created

# Test with dry-run for validation
kubectl apply -f test-non-compliant.yaml --dry-run=server
# Shows policy violations without actually creating resource

# Clean up
kubectl delete -f test-compliant.yaml
```

Mit Policy-Reporting testen (Kyverno):
```bash
# Check policy reports
kubectl get policyreports -A
kubectl get clusterpolicyreports

# View detailed report
kubectl get policyreport -n production -o yaml

# Check policy rule results
kubectl get policyreport -n production -o jsonpath='{.items[0].results}' | jq .
```

**Erwartet:** Nicht-konforme Ressourcen werden mit klaren Verletzungsmeldungen abgelehnt. Konforme Ressourcen werden erfolgreich erstellt. Richtlinienberichte zeigen Bestehen/Fehlschlagen-Ergebnisse. Dry-Run-Validierung funktioniert ohne Ressourcenerstellung.

**Bei Fehler:**
- Pruefen ob Richtlinie im Audit-Modus statt Durchsetzungs-Modus: `validationFailureAction: audit`
- Pruefen ob Webhook Anfragen verarbeitet: `kubectl logs -n gatekeeper-system -l app=gatekeeper`
- Auf Namespace-Ausschluesse pruefen, die Test-Namespace ausnehmen koennten
- Webhook-Konnektivitaet testen: `kubectl run test --rm -it --image=busybox --restart=Never`
- Webhook-Failure-Policy pruefen (Ignore vs Fail)

### Schritt 4: Mutations-Richtlinien implementieren

Automatische Korrektur durch Mutation konfigurieren.

**Gatekeeper-Mutation:**
```yaml
# gatekeeper-mutations.yaml
apiVersion: mutations.gatekeeper.sh/v1beta1
kind: Assign
metadata:
  name: add-default-labels
spec:
# ... (see EXAMPLES.md for complete configuration)
```

**Kyverno-Mutations-Richtlinien:**
```yaml
# kyverno-mutations.yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: add-default-labels
spec:
# ... (see EXAMPLES.md for complete configuration)
```

Mutationen anwenden und testen:
```bash
# Apply mutation policies
kubectl apply -f gatekeeper-mutations.yaml
# OR
kubectl apply -f kyverno-mutations.yaml

# Test mutation with a deployment
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** Mutationen fuegen automatisch Labels, Ressourcen hinzu oder aendern Images. Deployete Ressourcen zeigen mutierte Werte. Mutationen werden in Policy-Engine-Logs protokolliert. Keine Fehler bei Mutations-Anwendung.

**Bei Fehler:**
- Pruefen, ob Mutations-Webhook aktiviert: `kubectl get mutatingwebhookconfiguration`
- Mutations-Richtlinien-Syntax pruefen: insbesondere JSON-Pfade und Bedingungen
- Logs pruefen: `kubectl logs -n kyverno deploy/kyverno-admission-controller`
- Sicherstellen, dass Mutationen nicht konfliktieren (mehrere Mutationen auf demselben Feld)
- Sicherstellen, dass Mutation vor Validierung angewendet wird (Reihenfolge wichtig)

### Schritt 5: Audit-Modus und Reporting aktivieren

Audit konfigurieren, um Verletzungen in bestehenden Ressourcen ohne Blockierung zu identifizieren.

**Gatekeeper-Audit:**
```bash
# Audit runs automatically based on auditInterval setting
# Check audit results
kubectl get constraints -o json | \
  jq '.items[] | {name: .metadata.name, violations: .status.totalViolations}'

# Get detailed violation information
# ... (see EXAMPLES.md for complete configuration)
```

**Kyverno-Audit und Reporting:**
```bash
# Generate policy reports for existing resources
kubectl create job --from=cronjob/kyverno-cleanup-controller -n kyverno manual-report-gen

# View policy reports
kubectl get policyreport -A
kubectl get clusterpolicyreport
# ... (see EXAMPLES.md for complete configuration)
```

Dashboard fuer Richtlinien-Compliance erstellen:
```yaml
# prometheus-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: policy-alerts
  namespace: monitoring
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** Audit identifiziert Verletzungen in bestehenden Ressourcen ohne Deployments zu blockieren. Richtlinienberichte mit Bestehen/Fehlschlagen-Zaehlen generiert. Verletzungen exportierbar zur Pruefung. Metriken fuer Monitoring exponiert. Alerts loesen bei zunehmenden Verletzungen aus.

**Bei Fehler:**
- Audit-Controller laufend pruefen: `kubectl get pods -n gatekeeper-system -l gatekeeper.sh/operation=audit`
- Audit-Intervall-Einstellung in Installation pruefen
- Audit-Logs auf Fehler pruefen: `kubectl logs -n gatekeeper-system -l gatekeeper.sh/operation=audit`
- RBAC-Berechtigungen pruefen, die Lesen aller Ressourcentypen fuer Audit ermoeglichen
- Pruefen ob CRD-Status-Feld befuellt wird: `kubectl get constraint -o yaml | grep -A 20 status`

### Schritt 6: Mit CI/CD-Pipeline integrieren

Pre-Deployment-Richtlinienvalidierung fuer Shift-Left-Richtliniendurchsetzung hinzufuegen.

**CI/CD-Integrations-Skript:**
```bash
#!/bin/bash
# validate-policies.sh

set -e

echo "=== Policy Validation for CI/CD ==="
# ... (see EXAMPLES.md for complete configuration)
```

**GitHub-Actions-Workflow:**
```yaml
# .github/workflows/policy-validation.yaml
name: Policy Validation

on:
  pull_request:
    paths:
# ... (see EXAMPLES.md for complete configuration)
```

**Pre-Commit-Hook:**
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Validate Kubernetes manifests against policies
if git diff --cached --name-only | grep -E 'manifests/.*\.yaml$'; then
  echo "Validating Kubernetes manifests against policies..."
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** CI/CD-Pipeline validiert Manifeste vor dem Deployment. Richtlinienverletzungen schlagen Pipeline mit klaren Meldungen fehl. Richtlinienberichte werden an PR angehaengt. Pre-Commit-Hooks erkennen Verletzungen frueh. Entwickler werden ueber Richtlinienprobleme informiert, bevor sie den Cluster erreichen.

**Bei Fehler:**
- CLI-Tools installiert und im PATH pruefen
- Kubeconfig-Credentials fuer Richtlinien-Abruf pruefen
- Richtlinienvalidierung lokal zuerst testen: `kyverno apply policy.yaml --resource manifest.yaml`
- Sicherstellen, dass aus Cluster synchronisierte Richtlinien vollstaendig sind
- Policy-CLI-Logs auf spezifische Validierungsfehler pruefen

## Validierung

- [ ] Policy-Engine-Pods mit HA-Konfiguration laufend
- [ ] Validierungs- und Mutations-Webhooks aktiv und erreichbar
- [ ] Constraint-Templates und Richtlinien ohne Fehler erstellt
- [ ] Nicht-konforme Ressourcen mit klaren Verletzungsmeldungen abgelehnt
- [ ] Konforme Ressourcen erfolgreich deploybar
- [ ] Mutations-Richtlinien korrigieren Ressourcen automatisch
- [ ] Audit-Modus identifiziert Verletzungen in bestehenden Ressourcen
- [ ] Richtlinienberichte generiert und zugaenglich
- [ ] Metriken fuer Richtlinien-Compliance-Monitoring exponiert
- [ ] CI/CD-Pipeline validiert Manifeste vor dem Deployment
- [ ] Pre-Commit-Hooks verhindern Richtlinienverletzungen
- [ ] Namespace-Ausschluesse angemessen konfiguriert

## Haeufige Stolperfallen

- **Webhook-Failure-Policy**: `failurePolicy: Fail` blockiert alle Ressourcen wenn Webhook nicht verfuegbar. `Ignore` fuer nicht-kritische Richtlinien verwenden, aber Sicherheitsimplikationen verstehen. Webhook-Verfuegbarkeit vor Durchsetzung testen.

- **Zu restriktive Anfangsrichtlinien**: Mit Durchsetzungsmodus bei strengen Richtlinien bestehende Workloads brechen. Mit Audit-Modus beginnen, Verletzungen pruefen, Teams informieren, dann schrittweise durchsetzen.

- **Fehlende Ressourcenspezifikationen**: Richtlinien muessen API-Gruppen, Versionen und Arten korrekt angeben. `kubectl api-resources` verwenden, um genaue Werte zu finden. Wildcards (`*`) praktisch, koennen aber Leistungsprobleme verursachen.

- **Mutations-Reihenfolge**: Mutationen werden vor Validierungen angewendet. Sicherstellen, dass Mutationen nicht konfliktieren und Validierungen mutierte Werte beruecksichtigen. Mutation+Validierung zusammen testen.

- **Namespace-Ausschluesse**: System-Namespaces auszuschliessen ist notwendig, aber vorsichtig sein, nicht zu viel auszuschliessen. Ausschluesse regelmaessig ueberpruefen, wenn Richtlinien reifen.

- **Rego-Komplexitaet (Gatekeeper)**: Komplexe Rego-Richtlinien schwer zu debuggen. Einfach beginnen, lokal mit `opa test` testen, Logging mit `trace()` hinzufuegen, Gator fuer Offline-Tests verwenden.

- **Leistungseinfluss**: Richtlinienbewertung fuegt Latenz zum Admission-Prozess hinzu. Richtlinien effizient halten, geeignete Match-Kriterien verwenden, Webhook-Latenz-Metriken ueberwachen.

- **Richtlinienkonflikte**: Mehrere Richtlinien, die dasselbe Feld aendern, verursachen Probleme. Richtlinien teamuebergreifend koordinieren, Richtlinien-Bibliotheken fuer gaengige Muster verwenden, Kombinationen testen.

- **Hintergrund-Scanning**: Hintergrund-Audit scannt gesamten Cluster. Kann ressourcenintensiv in grossen Clustern sein. Audit-Intervall basierend auf Cluster-Groesse und Richtlinienanzahl anpassen.

- **Versionskompatibilitaet**: Policy-CRD-Versionen aendern sich. Gatekeeper v3 verwendet `v1beta1`-Constraints, Kyverno v1.11 verwendet `kyverno.io/v1`. Docs fuer die jeweilige Version pruefen.

## Verwandte Skills

- `manage-kubernetes-secrets` - Secret-Validierungs-Richtlinien
- `security-audit-codebase` - Komplementaeres Sicherheits-Scanning
- `deploy-to-kubernetes` - Anwendungs-Deployment mit Richtlinienvalidierung
- `setup-service-mesh` - Service-Mesh-Autorisierungs-Richtlinien ergaenzen Admission-Richtlinien
- `configure-api-gateway` - Gateway-Richtlinien arbeiten neben Admission-Richtlinien
- `implement-gitops-workflow` - GitOps mit Richtlinienvalidierung in der Pipeline
