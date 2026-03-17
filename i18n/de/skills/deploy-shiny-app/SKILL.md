---
name: deploy-shiny-app
description: >
  Shiny-Anwendungen auf shinyapps.io, Posit Connect oder als Docker-Container
  deployen. Behandelt Authentifizierung, Dependency-Management, Deployment-
  Konfiguration und Post-Deployment-Verifikation. Verwenden, wenn eine Shiny-
  App einem breiteren Publikum zugänglich gemacht oder eine reproduzierbare
  Deployment-Pipeline eingerichtet werden soll.
license: MIT
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: shiny
  complexity: basic
  language: R
  tags: shiny, deployment, shinyapps, posit-connect, docker
---

# Shiny-App deployen

Eine Shiny-App auf shinyapps.io, Posit Connect oder als Docker-Container für den Produktionseinsatz deployen.

## Wann verwenden

- Shiny-App einem breiteren Publikum zugänglich machen (nicht nur lokal)
- Produktions-Deployment-Pipeline einrichten
- App von einer Plattform auf eine andere migrieren
- Deployment-Prozess für Updates automatisieren

## Eingaben

- **Erforderlich**: Laufende Shiny-App (lokal getestet)
- **Erforderlich**: Deployment-Plattform: `shinyapps.io`, `posit-connect` oder `docker`
- **Optional**: Benutzerdefinierte App-URL/Name
- **Optional**: Ressource-Limits (RAM, CPU für Posit Connect)

## Vorgehensweise

### Schritt 1: Dependencies verifizieren

Sicherstellen, dass alle App-Dependencies deklariert sind.

```r
# Alle Packages die App verwendet auflisten
renv::dependencies("app.R")
# Oder für golem-Pakete:
renv::dependencies(".")

# renv-Lockfile erstellen/aktualisieren
renv::snapshot()
```

`DESCRIPTION`-Datei (für golem-Pakete) prüfen:

```
Imports:
    shiny,
    dplyr,
    ggplot2
```

**Erwartet:** Alle Dependencies dokumentiert. `renv.lock` oder DESCRIPTION up-to-date.

**Bei Fehler:** Wenn fehlende Packages nach dem Deployment auftreten, `renv::dependencies()` erneut ausführen und fehlende Packages zur DESCRIPTION hinzufügen.

### Schritt 2a: Auf shinyapps.io deployen

rsconnect einrichten und auf shinyapps.io deployen.

```r
install.packages("rsconnect")

# Authentifizierung (von shinyapps.io Dashboard kopieren)
# Account → Tokens → Add Token → Show → Copy to Clipboard
rsconnect::setAccountInfo(
  name = "dein-account-name",
  token = "DEIN_TOKEN",
  secret = "DEIN_SECRET"
)

# Deployen
rsconnect::deployApp(
  appDir = ".",           # App-Verzeichnis
  appName = "meine-app",  # URL-Name (muss eindeutig sein)
  forceUpdate = TRUE      # Bestehende Deployment überschreiben
)
```

App-URL nach Deployment: `https://dein-account-name.shinyapps.io/meine-app/`

**Erwartet:** Deployment-Logs zeigen erfolgreiche Paket-Installation und App-Start. URL zugänglich im Browser.

**Bei Fehler:** Wenn Deployment fehlschlägt mit "package not found", das fehlende Package zur App-Verzeichnis-renv.lock hinzufügen. Deployment-Logs für spezifische Package-Fehler prüfen.

### Schritt 3: Post-Deployment-Verifikation

Das erfolgreiche Deployment und App-Verhalten prüfen.

```r
# Deployment-Status prüfen
rsconnect::showLogs(appName = "meine-app")

# App-Informationen abfragen
rsconnect::appInfo(appName = "meine-app")
```

Manuell verifizieren:
1. App-URL im Browser öffnen
2. Alle interaktiven Elemente testen (Inputs, Buttons, Downloads)
3. Browser-Konsole auf JavaScript-Fehler prüfen
4. App-Logs im Plattform-Dashboard prüfen

**Erwartet:** App läuft korrekt auf deployed URL. Keine Fehler in Logs.

**Bei Fehler:** Bei Laufzeitfehlern in Deployment-Logs, fehlende Systembibliotheken oder R-Package-Versions-Konflikte prüfen. Lokale R-Version muss Deployment-Umgebung entsprechen.

### Schritt 4: Deployment-Workflow dokumentieren

Deployment-Prozess für zukünftige Updates dokumentieren.

```r
# deploy.R (Deployment-Skript)

# Deployment-Konfiguration
APP_NAME <- "meine-app"
APP_DIR <- "."

# Dependencies prüfen
cat("Checking dependencies...\n")
renv::status()

# Auf shinyapps.io deployen
cat("Deploying to shinyapps.io...\n")
rsconnect::deployApp(
  appDir = APP_DIR,
  appName = APP_NAME,
  forceUpdate = TRUE,
  launch.browser = FALSE
)

cat("Deployment complete!\n")
cat(sprintf("URL: https://account.shinyapps.io/%s/\n", APP_NAME))
```

**Erwartet:** `Rscript deploy.R` führt vollständiges Deployment aus.

**Bei Fehler:** Wenn Skript auf Authentifizierungsfehler stößt, rsconnect-Credentials über `rsconnect::setAccountInfo()` neu setzen.

## Validierung

- [ ] Alle App-Dependencies in renv.lock oder DESCRIPTION dokumentiert
- [ ] rsconnect-Authentifizierung erfolgreich konfiguriert
- [ ] App-URL zugänglich und lädt korrekt
- [ ] Alle interaktiven Features funktionieren auf deployed App
- [ ] Logs zeigen keine Fehler
- [ ] Deployment-Skript dokumentiert für zukünftige Updates

## Haeufige Stolperfallen

- **Nicht deklarierte Dependencies**: Packages müssen explizit in renv.lock oder DESCRIPTION aufgelistet sein — lokale Paket-Bibliothek wird nicht migriert.
- **R-Versions-Mismatch**: shinyapps.io läuft auf bestimmten R-Versionen. Lokale R-Version abgleichen oder Kompatibilität prüfen.
- **Secrets in Code**: API-Keys oder Passwörter niemals hardcoden. Umgebungsvariablen in Plattform-Dashboard setzen.
- **App-Größenbeschränkungen**: shinyapps.io hat 1-GB-Limit pro App. Große Datendateien extern hosten (z. B. S3, Google Drive).
- **Inaktivitäts-Timeout**: Auf kostenlosem shinyapps.io-Tier gehen Apps nach Inaktivität schlafen. Für produktive Apps upgraden.
- **Gleichzeitige Verbindungen**: Kostenloser Tier erlaubt 5 gleichzeitige Verbindungen. Für mehr Traffic Paid-Plan erforderlich.

## Verwandte Skills

- `scaffold-shiny-app` — App scaffolden vor Deployment
- `test-shiny-app` — App testen vor Deployment
- `deploy-shinyproxy` — Multi-App-Hosting mit Docker und ShinyProxy
- `optimize-shiny-performance` — Performance vor Deployment optimieren
