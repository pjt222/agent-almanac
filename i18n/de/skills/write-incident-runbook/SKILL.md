---
name: write-incident-runbook
description: >
  Strukturierte Incident-Runbooks mit Diagnoseschritten, Loesungsverfahren, Eskalationspfaden
  und Kommunikationsvorlagen fuer eine effektive Incident-Reaktion erstellen. Verwenden,
  wenn Reaktionsverfahren fuer wiederkehrende Alerts dokumentiert werden, die Incident-
  Reaktion innerhalb einer On-Call-Rotation standardisiert wird, die MTTR mit klaren
  Diagnoseschritten reduziert wird, Schulungsmaterialien fuer neue Teammitglieder erstellt
  werden oder Alert-Annotationen direkt mit Loesungsverfahren verknuepft werden sollen.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: observability
  complexity: basic
  language: multi
  tags: runbook, incident-response, diagnostics, escalation, documentation
---

# Incident-Runbook erstellen

Handlungsorientierte Runbooks erstellen, die Responder durch Incident-Diagnose und -Loesung fuehren.

## Wann verwenden

- Reaktionsverfahren fuer wiederkehrende Alerts oder Incidents dokumentieren
- Incident-Reaktion innerhalb der On-Call-Rotation standardisieren
- Mean Time to Resolution (MTTR) mit klaren Diagnoseschritten reduzieren
- Schulungsmaterialien fuer neue Teammitglieder zur Incident-Behandlung erstellen
- Eskalationspfade und Kommunikationsprotokolle etablieren
- Stammeswissen in schriftliche Dokumentation uebertragen
- Alerts mit Loesungsverfahren verknuepfen (Alert-Annotationen)

## Eingaben

- **Pflichtfeld**: Incident- oder Alert-Name/-Beschreibung
- **Pflichtfeld**: Historische Incident-Daten und Loesungsmuster
- **Optional**: Diagnoseabfragen (Prometheus, Logs, Traces)
- **Optional**: Eskalationskontakte und Kommunikationskanaele
- **Optional**: Fruehereincident-Post-Mortems

## Vorgehensweise

### Schritt 1: Runbook-Template-Struktur auswaehlen

> Unter [Extended Examples](references/EXAMPLES.md#step-1-runbook-template-examples) sind vollstaendige Template-Dateien verfuegbar.

Ein passendes Template basierend auf Incident-Typ und Komplexitaet auswaehlen.

**Grundlegende Runbook-Template-Struktur**:
```markdown
# [Alert/Incident Name] Runbook
## Overview | Severity | Symptoms
## Diagnostic Steps | Resolution Steps
## Escalation | Communication | Prevention | Related
```

**Erweitertes SRE-Runbook-Template** (Auszug):
```markdown
# [Service Name] - [Incident Type] Runbook

## Metadata
- Service, Owner, Severity, On-Call, Last Updated

## Diagnostic Phase
### Quick Health Check (< 5 min): Dashboard, error rate, deployments
### Detailed Investigation (5-20 min): Metrics, logs, traces, failure patterns
# ... (see EXAMPLES.md for complete template)
```

Wichtige Template-Komponenten:
- **Metadaten**: Service-Eigentuemer, Schweregrad, On-Call-Rotation
- **Diagnosephase**: Schnellchecks → detaillierte Untersuchung → Fehlermuster
- **Loesungsphase**: Sofortige Schadensbegrenzung → Ursachenbehebung → Verifizierung
- **Eskalation**: Kriterien und Kontaktpfade
- **Kommunikation**: Interne/externe Vorlagen
- **Praevention**: Kurz-/Langzeitmassnahmen

**Erwartet:** Ausgewaehltes Template entspricht der Incident-Komplexitaet, Abschnitte sind fuer den Service-Typ angemessen.

**Bei Fehler:**
- Mit dem Basis-Template beginnen und basierend auf Incident-Mustern iterieren
- Branchenbeispiele pruefen (Google-SRE-Buecher, Anbieter-Runbooks)
- Template basierend auf Team-Feedback nach der ersten Verwendung anpassen

### Schritt 2: Diagnoseverfahren dokumentieren

> Unter [Extended Examples](references/EXAMPLES.md#step-2-complete-diagnostic-procedures) sind vollstaendige Diagnoseabfragen und Entscheidungsbaeume verfuegbar.

Schrittweise Untersuchungsverfahren mit spezifischen Abfragen erstellen.

**Sechsstufige Diagnose-Checkliste**:

1. **Service-Gesundheit pruefen**: Gesundheitsendpunkt-Pruefungen und Uptime-Metriken
   ```bash
   curl -I https://api.example.com/health  # Expected: HTTP 200 OK
   ```
   ```promql
   up{job="api-service"}  # Expected: 1 for all instances
   ```

2. **Fehlerrate pruefen**: Aktuelle Fehlerprozentzahl und Aufschluesselung nach Endpunkt
   ```promql
   sum(rate(http_requests_total{status=~"5.."}[5m]))
   / sum(rate(http_requests_total[5m])) * 100  # Expected: < 1%
   ```

3. **Logs analysieren**: Aktuelle Fehler und haeufigste Fehlermeldungen aus Loki
   ```logql
   {job="api-service"} |= "error" | json | level="error"
   ```

4. **Ressourcenauslastung pruefen**: CPU, Arbeitsspeicher und Verbindungspool-Status
   ```promql
   avg(rate(container_cpu_usage_seconds_total{pod=~"api-service.*"}[5m])) * 100
   # Expected: < 70%
   ```

5. **Aktuelle Aenderungen pruefen**: Deployments, Git-Commits, Infrastrukturanpassungen

6. **Abhaengigkeiten untersuchen**: Downstream-Service-Gesundheit, Datenbank-/API-Latenz

**Fehlermuster-Entscheidungsbaum** (Auszug):
- Service ausgefallen? → Alle Pods/Instanzen pruefen
- Fehlerrate erhoht? → Spezifische Fehlertypen pruefen (5xx, Gateway, Datenbank, Timeouts)
- Wann hat es begonnen? → Nach Deployment (Rollback), graduell (Ressourcenleck), ploetzlich (Traffic/Abhaengigkeit)

**Erwartet:** Diagnoseverfahren sind spezifisch, enthalten erwartete vs. tatsaechliche Werte, fuehren Responder durch die Untersuchung.

**Bei Fehler:**
- Abfragen im tatsaechlichen Monitoring-System testen, bevor sie dokumentiert werden
- Screenshots von Dashboards als visuelle Referenz einschliessen
- Abschnitt "Haeufige Fehler" fuer oft uebersehene Schritte hinzufuegen
- Basierend auf Feedback von Incident-Respondern iterieren

### Schritt 3: Loesungsverfahren definieren

> Unter [Extended Examples](references/EXAMPLES.md#step-3-complete-resolution-procedures) sind alle 5 Loesungsoptionen mit vollstaendigen Befehlen und Rollback-Verfahren verfuegbar.

Schrittweise Behebung mit Rollback-Optionen dokumentieren.

**Fuenf Loesungsoptionen** (kurze Zusammenfassung):

1. **Rollback eines Deployments** (am schnellsten): Bei Fehlern nach dem Deployment
   ```bash
   kubectl rollout undo deployment/api-service
   ```
   Verifizieren → Ueberwachen → Loesungsbestaetigung (Fehlerrate < 1%, Latenz normal, keine Alerts)

2. **Ressourcen hochskalieren**: Bei hoher CPU/Arbeitsspeicher, Verbindungspool-Erschoepfung
   ```bash
   kubectl scale deployment/api-service --replicas=$((current * 3/2))
   ```

3. **Service neustarten**: Bei Speicherlecks, haengenden Verbindungen, Cache-Beschaedigung
   ```bash
   kubectl rollout restart deployment/api-service
   ```

4. **Feature Flag / Circuit Breaker**: Bei spezifischen Feature-Fehlern oder externen Abhaengigkeitsausfaellen
   ```bash
   kubectl set env deployment/api-service FEATURE_NAME=false
   ```

5. **Datenbank-Behebung**: Bei Datenbankverbindungen, langsamen Abfragen, Pool-Erschoepfung
   ```sql
   -- Kill long-running queries, restart connection pool, increase pool size
   ```

**Universelle Verifikations-Checkliste**:
- [ ] Fehlerrate < 1%
- [ ] Latenz P99 < Schwellenwert
- [ ] Durchsatz auf Basislinie
- [ ] Ressourcennutzung gesund (CPU < 70%, Arbeitsspeicher < 80%)
- [ ] Abhaengigkeiten gesund
- [ ] Benutzerseitige Tests bestanden
- [ ] Keine aktiven Alerts

**Rollback-Verfahren**: Wenn Loesung die Situation verschlechtert → pausieren/abbrechen → rueckgaengig machen → neu bewerten

**Erwartet:** Loesungsschritte klar, enthalten Verifikationspruefungen, bieten Rollback-Optionen fuer jede Aktion.

**Bei Fehler:**
- Mehr granulare Schritte fuer komplexe Verfahren hinzufuegen
- Screenshots oder Diagramme fuer mehrstufige Prozesse einschliessen
- Befehlsausgaben dokumentieren (erwartet vs. tatsaechlich)
- Separates Runbook fuer komplexe Loesungsverfahren erstellen

### Schritt 4: Eskalationspfade etablieren

> Unter [Extended Examples](references/EXAMPLES.md#step-4-complete-escalation-guidelines) sind vollstaendige Eskalationsstufen und Kontaktverzeichnis-Vorlage verfuegbar.

Festlegen, wann und wie Incidents eskaliert werden.

**Wann sofort eskalieren**:
- Kundenseitiger Ausfall > 15 Minuten
- SLO-Fehlerbudget > 10% erschoepft
- Datenverlust/-beschaedigung oder Sicherheitsverletzung vermutet
- Ursache innerhalb von 20 Minuten nicht identifizierbar
- Schadensminderungsversuche schlagen fehl oder verschlechtern die Situation

**Fuenf Eskalationsstufen**:
1. **Primaerer On-Call** (5 Min. Reaktionszeit): Fixes deployen, Rollback, Skalierung (bis zu 30 Min. allein)
2. **Sekundaerer On-Call** (automatisch nach 15 Min.): Zusaetzliche Unterstuetzung bei der Untersuchung
3. **Teamleiter** (architektonische Entscheidungen): Datenbankaenderungen, Anbieter-Eskalation, Incidents > 1 Stunde
4. **Incident Commander** (teamuebergreifende Koordination): Mehrere Teams, Kundenkommunikation, Incidents > 2 Stunden
5. **Fuehrungsebene** (C-Level): Grosse Auswirkungen (>50% Nutzer), SLA-Verletzung, Medien/PR, Ausfaelle > 4 Stunden

**Eskalationsprozess**:
1. Ziel benachrichtigen mit: aktuellem Status, Auswirkungen, ergriffenen Massnahmen, benoetigter Hilfe, Dashboard-Link
2. Bei Bedarf uebergeben: Timeline teilen, Massnahmen, Zugriff, erreichbar bleiben
3. Nicht still sein: alle 15 Min. aktualisieren, Fragen stellen, Feedback geben

**Kontaktverzeichnis**: Tabelle mit Rolle, Slack, Telefon, PagerDuty fuer:
- Plattform-/Datenbank-/Sicherheits-/Netzwerk-Teams
- Incident Commander
- Externe Anbieter (AWS, Datenbankanbieter, CDN-Anbieter)

**Erwartet:** Klare Eskalationskriterien, Kontaktinformationen leicht zugaenglich, Eskalationspfade entsprechen der Organisationsstruktur.

**Bei Fehler:**
- Kontaktinformationen auf Aktualitaet pruefen (vierteljaehrlich testen)
- Entscheidungsbaum hinzufuegen, wann eskaliert werden soll
- Beispiele fuer Eskalationsmeldungen einschliessen
- Reaktionszeiterwartungen fuer jede Stufe dokumentieren

### Schritt 5: Kommunikationsvorlagen erstellen

> Unter [Extended Examples](references/EXAMPLES.md#step-5-complete-communication-templates) sind alle internen und externen Vorlagen mit vollstaendiger Formatierung verfuegbar.

Vorgefertigte Nachrichten fuer Incident-Updates bereitstellen.

**Interne Vorlagen** (Slack #incident-response):

1. **Ersterklaerung**:
   ```
   🚨 INCIDENT: [Title] | Severity: [Critical/High/Medium]
   Impact: [users/services] | Owner: @username | Dashboard: [link]
   Quick Summary: [1-2 sentences] | Next update: 15 min
   ```

2. **Fortschrittsupdate** (alle 15-30 Min.):
   ```
   📊 UPDATE #N | Status: [Investigating/Mitigating/Monitoring]
   Actions: [what we tried and outcomes]
   Theory: [what we think is happening]
   Next: [planned actions]
   ```

3. **Schadensbegrenzung abgeschlossen**:
   ```
   ✅ MITIGATION | Metrics: Error [before→after], Latency [before→after]
   Root Cause: [brief or "investigating"] | Monitoring 30min before resolved
   ```

4. **Loesungsbekanntmachung**:
   ```
   🎉 RESOLVED | Duration: [time] | Root Cause + Impact + Follow-up actions
   ```

5. **Fehlalarm**: Keine Auswirkungen, kein Follow-up erforderlich

**Externe Vorlagen** (Statusseite):
- **Initial**: Untersuchung, Startzeit, naechstes Update in 15 Min.
- **Fortschritt**: Ursache identifiziert (kundenverstaendlich), Behebung wird implementiert, geschaetzte Loesungszeit
- **Loesung**: Loesungszeit, Ursache (einfach), Dauer, Praeventionsmassnahmen

**Kunden-E-Mail-Vorlage**: Timeline, Auswirkungsbeschreibung, Loesung, Praevention, Entschaedigung (falls zutreffend)

**Erwartet:** Vorlagen sparen Zeit waehrend Incidents, gewaehrleisten konsistente Kommunikation, reduzieren kognitive Belastung der Responder.

**Bei Fehler:**
- Vorlagen an den Kommunikationsstil des Unternehmens anpassen
- Vorlagen mit gaengigen Incident-Typen vorab ausfuellen
- Slack-Workflow/Bot erstellen, um Vorlagen automatisch zu befuellen
- Vorlagen waehrend Incident-Retrospektiven ueberpruefen

### Schritt 6: Runbook mit Monitoring verknuepfen

> Unter [Extended Examples](references/EXAMPLES.md#step-6-alert-integration-examples) sind vollstaendige Prometheus-Alert-Konfigurationen und Grafana-Dashboard-JSON verfuegbar.

Runbook mit Alerts und Dashboards integrieren.

**Runbook-Links zu Prometheus-Alerts hinzufuegen**:
```yaml
- alert: HighErrorRate
  annotations:
    runbook_url: "https://wiki.example.com/runbooks/high-error-rate"
    dashboard_url: "https://grafana.example.com/d/service-overview"
    incident_channel: "#incident-platform"
```

**Schnelle Diagnose-Links im Runbook einbetten**:
- Service-Uebersichts-Dashboard
- Fehlerrate der letzten Stunde (Prometheus-Direktlink)
- Aktuelle Fehler-Logs (Loki/Grafana Explore)
- Aktuelle Deployments (GitHub/CI)
- PagerDuty-Incidents

**Grafana-Dashboard-Panel erstellen** mit Runbook-Links (Markdown-Panel, der alle Incident-Runbooks mit On-Call- und Eskalationsinformationen auflistet)

**Erwartet:** Responder koennen Runbooks direkt aus Alerts oder Dashboards aufrufen, Diagnoseabfragen sind vorab ausgefuellt, Ein-Klick-Zugriff auf relevante Tools.

**Bei Fehler:**
- Pruefen, ob Runbook-URLs ohne VPN/Login zugaenglich sind
- URL-Verkuerzer fuer komplexe Grafana/Prometheus-Links verwenden
- Links vierteljaehrlich testen, um sicherzustellen, dass sie nicht kaputt gehen
- Browser-Lesezeichen fuer haeufig verwendete Runbooks erstellen

## Validierung

- [ ] Runbook folgt konsistenter Template-Struktur
- [ ] Diagnoseverfahren enthalten spezifische Abfragen und erwartete Werte
- [ ] Loesungsschritte sind handlungsorientiert mit klaren Befehlen
- [ ] Eskalationskriterien und Kontakte sind aktuell
- [ ] Kommunikationsvorlagen fuer interne und externe Zielgruppen bereitgestellt
- [ ] Runbook ist aus Monitoring-Alerts und Dashboards verknuepft
- [ ] Runbook waehrend einer Incident-Simulation oder einem echten Incident getestet
- [ ] Feedback von Respondern in das Runbook eingeflossen
- [ ] Revisionsverlauf mit Datum und Autoren verfolgt
- [ ] Runbook ohne Authentifizierung zugaenglich (oder offline gecacht)

## Haeufige Stolperfallen

- **Zu generisch**: Runbooks mit vagen Schritten wie "Logs pruefen" ohne spezifische Abfragen sind nicht handlungsorientiert. Konkret sein.
- **Veraltete Informationen**: Runbooks, die auf alte Systeme oder Befehle verweisen, werden nutzlos. Vierteljaehrlich ueberpruefen.
- **Keine Verifikationsschritte**: Loesung ohne Verifizierung fuehrt zu falsch positiven Ergebnissen. Immer "Wie bestaetigt man, dass es behoben ist" einschliessen.
- **Fehlende Rollback-Verfahren**: Jede Aktion sollte einen Rollback-Plan haben. Responder nicht in einem schlechteren Zustand zuruecklassen.
- **Wissen voraussetzen**: Runbooks nur fuer Experten schliessen Junior-Engineers aus. Fuer die am wenigsten erfahrene Person in der Rotation schreiben.
- **Kein Eigentuemer**: Runbooks ohne Eigentuemer werden veraltet. Team/Person zuweisen, das/die fuer Updates zustaendig ist.
- **Hinter Authentifizierung verborgen**: Runbooks, die bei VPN/SSO-Problemen nicht zugaenglich sind, sind in einer Krise nutzlos. Kopien cachen oder oeffentliches Wiki verwenden.

## Verwandte Skills

- `configure-alerting-rules` - Runbooks mit Alert-Annotationen verknuepfen fuer sofortigen Zugriff waehrend Incidents
- `build-grafana-dashboards` - Runbook-Links in Dashboards und Diagnose-Panels einbetten
- `setup-prometheus-monitoring` - Diagnoseabfragen aus Prometheus in Runbook-Verfahren einschliessen
- `define-slo-sli-sla` - SLO-Auswirkungen in die Incident-Schweregrad-Klassifizierung einbeziehen
