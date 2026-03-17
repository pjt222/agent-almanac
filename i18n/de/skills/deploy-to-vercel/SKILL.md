---
name: deploy-to-vercel
description: >
  Next.js- oder andere Framework-Anwendungen auf Vercel deployen. Behandelt
  CLI-basiertes und GitHub-integriertes Deployment, Umgebungsvariablen-
  Verwaltung, benutzerdefinierte Domains und Preview-Deployments. Verwenden,
  beim erstmaligen Deployen auf Vercel, beim Einrichten von CI/CD-Deployments
  oder beim Konfigurieren von produktionsreifen Deployment-Einstellungen.
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
  domain: web-dev
  complexity: basic
  language: TypeScript
  tags: vercel, deployment, nextjs, ci-cd, hosting
---

# Auf Vercel deployen

Eine Web-App auf Vercel deployen, mit optionaler GitHub-Integration für automatische CI/CD-Deployments.

## Wann verwenden

- Erstmaliges Deployen einer Next.js- oder anderen Framework-App auf Vercel
- Einrichten von automatischen Deployments aus einem GitHub-Repository
- Konfigurieren von Produktions- und Preview-Deployment-Einstellungen
- Hinzufügen benutzerdefinierter Domains zu einer Vercel-Deployment

## Eingaben

- **Erforderlich**: Next.js- oder andere Framework-App (funktionierend in Entwicklung)
- **Erforderlich**: Vercel-Konto (kostenlos auf vercel.com)
- **Optional**: GitHub-Repository (für automatische Deployments)
- **Optional**: Benutzerdefinierte Domain
- **Optional**: Umgebungsvariablen für Produktion

## Vorgehensweise

### Schritt 1: Vercel CLI installieren und authentifizieren

Vercel CLI installieren und sich mit dem Konto verbinden.

```bash
npm install -g vercel
vercel login
```

Den Anweisungen für die bevorzugte Authentifizierungsmethode folgen (E-Mail, GitHub, GitLab, Bitbucket).

```bash
# Authentifizierungsstatus verifizieren
vercel whoami
```

**Erwartet:** `vercel whoami` gibt den Vercel-Benutzernamen aus.

**Bei Fehler:** Wenn `vercel` nicht gefunden wird, sicherstellen, dass npm globale Binaries im PATH sind. Prüfen mit: `npm config get prefix` und `echo $PATH`.

### Schritt 2: App lokal bauen und verifizieren

Sicherstellen, dass die App vor dem Deployment erfolgreich gebaut wird.

```bash
npm run build
```

Erwartete Ausgabe für Next.js:
```
▲ Next.js 14.x.x
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

**Erwartet:** Build ohne Fehler abgeschlossen. `out/` oder `.next/`-Verzeichnis erstellt.

**Bei Fehler:** Build-Fehler vor dem Deployment beheben. Häufige Ursachen: fehlende Umgebungsvariablen (während Build erforderliche mit `NEXT_PUBLIC_`-Präfix setzen), TypeScript-Fehler, fehlende Dependencies.

### Schritt 3: Erstes Deployment

Das Projekt auf Vercel deployen.

```bash
# Im Projektverzeichnis
vercel
```

Auf Prompts antworten:
- `Set up and deploy "~/my-app"?` → Y
- `Which scope do you want to deploy to?` → Das Konto/Team auswählen
- `Link to existing project?` → N (für erstes Deployment)
- `What's your project's name?` → Projektnamen eingeben oder Standard akzeptieren
- `In which directory is your code located?` → `./` (Standard)

CLI erkennt automatisch Next.js und konfiguriert entsprechend.

**Erwartet:** Deployment läuft. Preview-URL wird ausgegeben (z. B. `https://my-app-xxx.vercel.app`).

**Bei Fehler:** Wenn die automatische Erkennung fehlschlägt, Framework manuell mit `vercel --framework nextjs` angeben.

### Schritt 4: Umgebungsvariablen konfigurieren

Produktions-Umgebungsvariablen über das Vercel-Dashboard oder CLI setzen.

```bash
# Umgebungsvariable für Produktion hinzufügen
vercel env add NEXT_PUBLIC_API_URL production
# Wenn aufgefordert, den Wert eingeben: https://api.myapp.com

# Umgebungsvariable für alle Umgebungen hinzufügen
vercel env add DATABASE_URL
# Dann "production", "preview", "development" auswählen

# Vorhandene Variablen auflisten
vercel env ls

# Variablen in lokale .env.local laden
vercel env pull .env.local
```

**Erwartet:** Variablen erscheinen in `vercel env ls`. `.env.local` enthält Variablen für lokale Entwicklung.

**Bei Fehler:** Wenn das Deployment Variablen nicht sehen kann, sicherstellen, dass sie für "production"-Umgebung gesetzt wurden, nicht nur für "development". Nach dem Hinzufügen neu deployen.

### Schritt 5: GitHub-Integration einrichten

GitHub-Repository für automatische Deployments verbinden.

```bash
# GitHub Remote sicherstellen
git remote -v

# Push zum GitHub-Repository
git push origin main
```

Im Vercel-Dashboard (vercel.com/dashboard):
1. Projekt auswählen → Settings → Git
2. "Connect Git Repository" klicken
3. GitHub autorisieren und Repository auswählen
4. Branch-Konfiguration:
   - Production Branch: `main`
   - Preview Branches: alle anderen Branches

Nach Einrichtung:
- Push zu `main` → Produktions-Deployment
- Push zu jedem anderen Branch → Preview-Deployment mit eindeutiger URL

**Erwartet:** GitHub-Repository in Vercel-Einstellungen verlinkt. Test-Push löst automatisches Deployment aus.

**Bei Fehler:** Wenn GitHub-Autorisierung fehlschlägt, zu GitHub → Settings → Applications → Authorized OAuth Apps gehen und sicherstellen, dass Vercel aufgelistet ist.

### Schritt 6: Benutzerdefinierte Domain hinzufügen

Eine benutzerdefinierte Domain zum Deployment hinzufügen.

```bash
# Domain über CLI hinzufügen
vercel domains add myapp.com

# Oder auf Dashboard: Project → Settings → Domains
```

DNS-Konfiguration:
```
# A-Record für Apex-Domain
Typ: A
Name: @
Wert: 76.76.21.21

# CNAME für www
Typ: CNAME
Name: www
Wert: cname.vercel-dns.com
```

```bash
# Domain-Status prüfen
vercel domains inspect myapp.com
```

**Erwartet:** Domain als "Valid Configuration" angezeigt. HTTPS-Zertifikat automatisch bereitgestellt.

**Bei Fehler:** DNS-Propagation dauert bis zu 48 Stunden. `dig myapp.com A` verwenden, um den aktuellen DNS-Status zu prüfen.

### Schritt 7: Deployment-Einstellungen optimieren

`vercel.json` für benutzerdefinierte Deployment-Konfiguration konfigurieren.

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "devCommand": "npm run dev",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, OPTIONS" }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

**Erwartet:** `vercel.json` validiert (kein Fehler beim nächsten Deployment).

**Bei Fehler:** `vercel.json`-Syntax mit dem Vercel-Schema validieren. Falsch konfigurierte Header oder Redirects verhindern das Deployment.

### Schritt 8: Produktions-Deployment verifizieren

Das endgültige Produktions-Deployment bestätigen.

```bash
# Zu Produktion deployen (wenn nicht bereits)
vercel --prod

# Deployment-Status prüfen
vercel ls

# Logs überprüfen
vercel logs https://my-app.vercel.app
```

Kernmetriken verifizieren:
- [ ] Startseite lädt in < 3 Sekunden
- [ ] HTTPS-Zertifikat gültig
- [ ] Umgebungsvariablen sind zugänglich (keine undefiniert-Fehler)
- [ ] API-Routen antworten korrekt
- [ ] Benutzerdefinierte Domain leitet korrekt weiter (wenn konfiguriert)

**Erwartet:** Produktions-URL zugänglich. Alle Features funktionieren wie in lokaler Entwicklung.

**Bei Fehler:** Funktionsprotokoll in `vercel logs` prüfen. Häufige Produktionsprobleme: fehlende Umgebungsvariablen, zu große Bundle-Größe (Vercel-Limit: 50 MB), Timeout bei Edge-Funktionen (Standard: 10 s).

## Validierung

- [ ] `vercel whoami` gibt Benutzernamen zurück
- [ ] Build-Befehl lokal erfolgreich
- [ ] Deployment-URL zugänglich und gibt HTTP 200 zurück
- [ ] Umgebungsvariablen für Produktions-Umgebung gesetzt
- [ ] GitHub-Integration löst automatische Deployments aus (wenn eingerichtet)
- [ ] Benutzerdefinierte Domain mit gültigem HTTPS aufgelöst (wenn konfiguriert)
- [ ] `vercel logs` zeigt keine Runtime-Fehler

## Haeufige Stolperfallen

- **Umgebungsvariablen-Scoping**: Vercel unterscheidet zwischen `production`, `preview` und `development`. Sicherstellen, dass Produktionsvariablen korrekt gescoped sind.
- **Build-time vs Runtime-Variablen**: `NEXT_PUBLIC_*` werden zur Build-Zeit eingebettet — nach Änderung neu deployen. Server-side-Variablen werden zur Runtime gelesen.
- **Funktion-Größenbeschränkungen**: Serverless Functions haben ein 50-MB-Limit. `import` statements prüfen, um unnötige Dependencies zu reduzieren.
- **Region-Latenz**: Standard-Region ist `iad1` (US East). Für europäische Nutzer `fra1` in Betracht ziehen.
- **Nicht ignorierte Build-Outputs**: `.next/`- und `node_modules/`-Verzeichnisse im `.gitignore` belassen — Vercel baut von Quell-Code.
- **Preview-Deployment-URLs**: Preview-Deployments haben einzigartige URLs. Wenn die App hardcodierte URLs hat, sicherstellen, dass sie `NEXT_PUBLIC_VERCEL_URL` oder `process.env.VERCEL_URL` für dynamische URLs verwenden.

## Verwandte Skills

- `scaffold-nextjs-app` — Next.js-App vor dem Deployment erstellen
- `setup-tailwind-typescript` — Tailwind + TypeScript konfigurieren
