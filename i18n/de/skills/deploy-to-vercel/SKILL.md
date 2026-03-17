---
name: deploy-to-vercel
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Eine Next.js-Anwendung auf Vercel deployen. Behandelt Projektverknuepfung,
  Umgebungsvariablen, Preview-Deployments, benutzerdefinierte Domains und
  Produktions-Deployment-Konfiguration. Anwenden beim erstmaligen Deployment
  einer Next.js-App, beim Einrichten von Preview-Deployments fuer Pull Requests,
  beim Konfigurieren benutzerdefinierter Domains oder beim Verwalten von
  Umgebungsvariablen in einem Produktions-Vercel-Deployment.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-dev
  complexity: basic
  language: TypeScript
  tags: vercel, deployment, nextjs, hosting, ci-cd
---

# Auf Vercel deployen

Eine Next.js-Anwendung mit Produktionskonfiguration auf Vercel deployen.

## Wann verwenden

- Erstmaliges Deployment einer Next.js-App
- Einrichten von Preview-Deployments fuer Pull Requests
- Konfigurieren benutzerdefinierter Domains
- Verwalten von Umgebungsvariablen in der Produktion

## Eingaben

- **Erforderlich**: Next.js-Anwendung die lokal erfolgreich baut
- **Erforderlich**: GitHub-Repository (empfohlen) oder lokales Projekt
- **Optional**: Benutzerdefinierte Domain
- **Optional**: Umgebungsvariablen fuer die Produktion

## Vorgehensweise

### Schritt 1: Lokalen Build verifizieren

```bash
npm run build
```

**Erwartet:** Build ist fehlerfrei erfolgreich.

**Bei Fehler:** Build-Fehler vor dem Deployment beheben. Haeufig: TypeScript-Fehler, fehlende Abhaengigkeiten, ungueltige Importe.

### Schritt 2: Vercel CLI installieren

```bash
npm install -g vercel
```

**Erwartet:** Der Befehl `vercel` ist global verfuegbar und `vercel --version` gibt die installierte Version aus.

**Bei Fehler:** Bei Berechtigungsfehlern `sudo npm install -g vercel` verwenden oder npm so konfigurieren, dass ein benutzerlokales Praefix verwendet wird. Mit `node --version` verifizieren dass Node.js installiert ist.

### Schritt 3: Verknuepfen und deployen

```bash
# Bei Vercel anmelden
vercel login

# Deployen (beim ersten Mal: erstellt Projekt)
vercel

# Eingabeaufforderungen folgen:
# - Set up and deploy? Y
# - Which scope? (Konto auswaehlen)
# - Link to existing project? N (fuer neue Projekte)
# - Project name: my-app
# - Directory: ./
# - Override settings? N
```

**Erwartet:** Preview-URL wird bereitgestellt (z.B. `https://my-app-xxx.vercel.app`).

**Bei Fehler:** Wenn `vercel login` fehlschlaegt, Internetverbindung pruefen und browserbasierte Authentifizierung versuchen. Wenn das Deployment fehlschlaegt, die Build-Ausgabe auf Fehler ueberpruefen -- Vercel verwendet eine saubere Umgebung, daher muessen alle Abhaengigkeiten in `package.json` stehen.

### Schritt 4: Umgebungsvariablen konfigurieren

```bash
# Umgebungsvariablen hinzufuegen
vercel env add DATABASE_URL production
vercel env add API_KEY production preview

# Umgebungsvariablen auflisten
vercel env ls
```

Oder ueber das Vercel-Dashboard konfigurieren: Project Settings > Environment Variables.

**Erwartet:** `vercel env ls` zeigt alle erforderlichen Umgebungsvariablen fuer die korrekten Umgebungen an (production, preview, development).

**Bei Fehler:** Wenn Variablen zur Laufzeit nicht erscheinen, pruefen ob die Zielumgebung uebereinstimmt (production vs. preview). Nach dem Hinzufuegen von Variablen erneut deployen -- bestehende Deployments uebernehmen neue Variablen nicht automatisch.

### Schritt 5: In die Produktion deployen

```bash
vercel --prod
```

**Erwartet:** Produktions-URL ist verfuegbar (z.B. `https://my-app.vercel.app`).

**Bei Fehler:** Deployment-Logs mit `vercel logs` oder im Vercel-Dashboard pruefen. Haeufige Probleme sind fehlende Umgebungsvariablen in der Produktionsumgebung und Build-Befehle die sich vom lokalen Setup unterscheiden.

### Schritt 6: GitHub fuer Auto-Deploy verbinden (empfohlen)

1. https://vercel.com/new aufrufen
2. Das GitHub-Repository importieren
3. Vercel deployt automatisch bei:
   - Push nach main -> Produktions-Deployment
   - Pull Request -> Preview-Deployment

**Erwartet:** Das Vercel-Dashboard zeigt das GitHub-Repository als verbunden, und nachfolgende Pushes nach main loesen automatisch Produktions-Deployments aus.

**Bei Fehler:** Wenn das Repository in der Importliste nicht erscheint, pruefen ob die Vercel-GitHub-App Zugriff auf das Repository hat. Unter GitHub Settings > Applications > Vercel den Zugriff gewaehren.

### Schritt 7: Benutzerdefinierte Domain konfigurieren

```bash
vercel domains add my-domain.com
```

Oder ueber das Dashboard: Project Settings > Domains.

DNS-Eintraege gemaess Vercel-Anweisungen aktualisieren (typischerweise CNAME- oder A-Record).

**Erwartet:** `vercel domains ls` zeigt die benutzerdefinierte Domain als konfiguriert, und nach DNS-Propagation (bis zu 48 Stunden) loest die Domain zum Vercel-Deployment auf.

**Bei Fehler:** Wenn die Domain "Invalid Configuration" anzeigt, pruefen ob die DNS-Eintraege exakt den Vercel-Anweisungen entsprechen. Mit `dig my-domain.com` oder einem Online-DNS-Checker die Propagation bestaetigen.

### Schritt 8: Konfiguration optimieren

`vercel.json` fuer erweiterte Einstellungen erstellen:

```json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

**Erwartet:** `vercel.json` ist im Projektstammverzeichnis gespeichert und das naechste Deployment uebernimmt die Konfiguration (sichtbar in den Vercel-Dashboard-Build-Logs).

**Bei Fehler:** Wenn die Konfiguration ignoriert wird, mit `jq . vercel.json` pruefen ob gueiltiges JSON vorliegt. Die Vercel-Dokumentation fuer die jeweilige Framework-Version pruefen, da einige Einstellungen nach `next.config.ts` verschoben sein koennten.

## Validierung

- [ ] `npm run build` ist lokal erfolgreich
- [ ] Preview-Deployment funktioniert und ist erreichbar
- [ ] Produktions-Deployment stellt die Anwendung korrekt bereit
- [ ] Umgebungsvariablen sind in der Produktion verfuegbar
- [ ] Benutzerdefinierte Domain loest auf (falls konfiguriert)
- [ ] GitHub-Integration loest Deployments bei Push aus

## Haeufige Stolperfallen

- **Build schlaegt auf Vercel fehl, aber nicht lokal**: Vercel verwendet eine saubere Umgebung. Sicherstellen dass alle Abhaengigkeiten in `package.json` stehen und nicht nur global installiert sind.
- **Fehlende Umgebungsvariablen**: Variablen muessen zu Vercel hinzugefuegt werden, nicht nur zu `.env.local`. Verschiedene Umgebungen (production, preview, development) haben getrennte Variablensaetze.
- **Node.js-Versionsinkompatibilitaet**: Die Node.js-Version in den Project Settings oder im `package.json`-engines-Feld festlegen.
- **Grosse Deployments**: Vercel hat Groessenbeschraenkungen. `.vercelignore` verwenden um unnoetige Dateien auszuschliessen.
- **API-Route-Timeouts**: Vercel-Serverless-Funktionen haben im Hobby-Plan ein 10-Sekunden-Timeout. Optimieren oder Plan upgraden.

## Verwandte Skills

- `scaffold-nextjs-app` -- Die zu deployende App erstellen
- `setup-tailwind-typescript` -- Styling vor dem Deployment konfigurieren
- `configure-git-repository` -- Git-Setup fuer Auto-Deploy-Integration
