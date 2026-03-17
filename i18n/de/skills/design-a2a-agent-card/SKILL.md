---
name: design-a2a-agent-card
description: >
  Eine A2A-Agentenkarte (.well-known/agent.json) als Manifest entwerfen, das
  Agentenfaehigkeiten, Skills, Authentifizierungsanforderungen und unterstuetzte
  Inhaltstypen beschreibt. Verwenden beim Erstellen eines Agenten, der von
  anderen A2A-konformen Agenten auffindbar sein muss, beim Bereitstellen von
  Faehigkeiten fuer Multi-Agenten-Orchestrierung, beim Migrieren eines
  bestehenden Agenten zum A2A-Protokoll, beim Definieren des oeffentlichen
  Vertrags fuer einen Agenten vor der Implementierung oder beim Integrieren
  mit Agentenregistern, die Agentenkarten konsumieren.
license: MIT
allowed-tools: Read Write Edit Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: a2a-protocol
  complexity: intermediate
  language: multi
  tags: a2a, agent-card, manifest, capabilities, interoperability
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# A2A-Agentenkarte entwerfen

Eine standardkonforme A2A-Agentenkarte erstellen, die Identitaet, Skills, Authentifizierungsanforderungen und Faehigkeiten eines Agenten fuer die Erkennung durch andere Agenten bewirbt.

## Wann verwenden

- Einen Agenten erstellen, der von anderen A2A-konformen Agenten auffindbar sein muss
- Agentenfaehigkeiten fuer Multi-Agenten-Orchestrierung bereitstellen
- Einen bestehenden Agenten zum A2A (Agent-to-Agent)-Protokoll migrieren
- Den oeffentlichen Vertrag fuer einen Agenten vor der Implementierung definieren
- Mit Agentenregistern oder -verzeichnissen integrieren, die Agentenkarten konsumieren

## Eingaben

- **Erforderlich**: Agentenname und -beschreibung
- **Erforderlich**: Liste der Skills, die der Agent ausfuehren kann (Name, Beschreibung, Ein-/Ausgabeschemata)
- **Erforderlich**: Basis-URL, unter der der Agent gehostet wird
- **Optional**: Authentifizierungsmethode (`none`, `oauth2`, `oidc`, `api-key`)
- **Optional**: Unterstuetzte Inhaltstypen ueber `text/plain` hinaus (z.B. `image/png`, `application/json`)
- **Optional**: Faehigkeits-Flags (Streaming, Push-Benachrichtigungen, Zustandsuebergangsverlauf)
- **Optional**: Anbieterorganisationsname und URL

## Vorgehensweise

### Schritt 1: Agentenidentitaet und -beschreibung definieren

1.1. Die Agentenidentitaetsfelder festlegen:

```json
{
  "name": "data-analysis-agent",
  "description": "Performs statistical analysis, data visualization, and report generation on tabular datasets.",
  "url": "https://agent.example.com",
  "provider": {
    "organization": "Example Corp",
    "url": "https://example.com"
  },
  "version": "1.0.0"
}
```

1.2. Eine klare, handlungsorientierte Beschreibung verfassen, die beantwortet:
   - Welche Domaenen deckt dieser Agent ab?
   - Welche Arten von Aufgaben kann er bearbeiten?
   - Was sind seine Einschraenkungen?

1.3. Die kanonische URL festlegen, unter der die Agentenkarte unter `/.well-known/agent.json` bereitgestellt wird.

**Erwartet:** Ein vollstaendiger Identitaetsblock mit Name, Beschreibung, URL, Anbieter und Version.

**Bei Fehler:** Wenn der Agent mehrere Domaenen bedient, abwaegen, ob es ein Agent mit vielen Skills oder mehrere Agenten mit fokussiertem Umfang sein sollte. A2A bevorzugt fokussierte Agenten mit klaren Grenzen.

### Schritt 2: Skills mit Ein-/Ausgabeschemata auflisten

2.1. Jeden Skill definieren, den der Agent ausfuehren kann:

```json
{
  "skills": [
    {
      "id": "analyze-dataset",
      "name": "Analyze Dataset",
      "description": "Run descriptive statistics, correlation analysis, or hypothesis tests on a CSV dataset.",
      "tags": ["statistics", "data-analysis", "csv"],
      "examples": [
        "Analyze the correlation between columns A and B in my dataset",
        "Run a t-test comparing group 1 and group 2"
      ],
      "inputModes": ["text/plain", "application/json"],
      "outputModes": ["text/plain", "application/json", "image/png"]
    },
    {
      "id": "generate-chart",
      "name": "Generate Chart",
      "description": "Create bar, line, scatter, or histogram charts from tabular data.",
      "tags": ["visualization", "charts"],
      "examples": [
        "Create a scatter plot of height vs weight",
        "Generate a histogram of the age column"
      ],
      "inputModes": ["text/plain", "application/json"],
      "outputModes": ["image/png", "image/svg+xml"]
    }
  ]
}
```

2.2. Fuer jeden Skill bereitstellen:
   - **id**: Eindeutiger Bezeichner (Kebab-Case)
   - **name**: Menschenlesbarer Anzeigename
   - **description**: Was der Skill tut, in ein bis zwei Saetzen
   - **tags**: Durchsuchbare Schluesselwoerter fuer die Erkennung
   - **examples**: Natuerlichsprachliche Aufgabenbeispiele, die diesen Skill ausloesen
   - **inputModes**: MIME-Typen, die der Skill akzeptiert
   - **outputModes**: MIME-Typen, die der Skill produzieren kann

2.3. Sicherstellen, dass Skill-Grenzen klar und nicht ueberlappend sind. Jede Aufgabe sollte genau einem Skill zugeordnet werden.

**Erwartet:** Ein Skills-Array, in dem jeder Eintrag id, name, description, tags, examples und I/O-Modi hat.

**Bei Fehler:** Wenn Skills sich erheblich ueberschneiden, zu einem einzigen breiteren Skill mit mehr Beispielen zusammenfuehren. Wenn ein Skill zu breit ist, in fokussierte Unter-Skills aufteilen.

### Schritt 3: Authentifizierung konfigurieren

3.1. Das Authentifizierungsschema basierend auf dem Bereitstellungskontext definieren:

**Keine Authentifizierung (lokal/vertrauenswuerdiges Netzwerk):**

```json
{
  "authentication": {
    "schemes": []
  }
}
```

**OAuth 2.0 (empfohlen fuer Produktion):**

```json
{
  "authentication": {
    "schemes": ["oauth2"],
    "credentials": {
      "oauth2": {
        "authorizationUrl": "https://auth.example.com/authorize",
        "tokenUrl": "https://auth.example.com/token",
        "scopes": {
          "agent:invoke": "Invoke agent skills",
          "agent:read": "Read task status"
        }
      }
    }
  }
}
```

**API Key (einfaches Shared-Secret):**

```json
{
  "authentication": {
    "schemes": ["apiKey"],
    "credentials": {
      "apiKey": {
        "headerName": "X-API-Key"
      }
    }
  }
}
```

3.2. Die minimal notwendige Authentifizierung fuer die Bereitstellungsumgebung waehlen:
   - Lokale Entwicklung: `none`
   - Interne Dienste: `apiKey`
   - Oeffentlich zugaengliche Agenten: `oauth2` oder `oidc`

3.3. Den Token-/Schluessel-Bereitstellungsprozess im Provider-Abschnitt der Agentenkarte oder in externer Dokumentation dokumentieren.

**Erwartet:** Ein Authentifizierungsblock, der den Sicherheitsanforderungen der Bereitstellung entspricht.

**Bei Fehler:** Wenn keine OAuth-2.0-Infrastruktur verfuegbar ist, mit API-Key-Authentifizierung beginnen und Migration planen. Niemals einen oeffentlichen Agenten mit `none`-Authentifizierung bereitstellen.

### Schritt 4: Faehigkeiten angeben

4.1. Deklarieren, welche Protokollfunktionen der Agent unterstuetzt:

```json
{
  "capabilities": {
    "streaming": true,
    "pushNotifications": false,
    "stateTransitionHistory": true
  }
}
```

4.2. Jedes Faehigkeits-Flag basierend auf der Implementierungsbereitschaft setzen:

   - **streaming**: `true` wenn der Agent SSE-Streaming ueber `tasks/sendSubscribe` unterstuetzt. Ermoeglicht Echtzeit-Fortschrittsaktualisierungen fuer langlebige Aufgaben.
   - **pushNotifications**: `true` wenn der Agent Webhook-Rueckrufe senden kann, wenn sich der Aufgabenstatus aendert. Erfordert, dass der Agent Webhook-URLs speichert und zurueckruft.
   - **stateTransitionHistory**: `true` wenn der Agent einen vollstaendigen Verlauf der Aufgabenzustandsuebergaenge fuehrt (submitted, working, completed, etc.). Nuetzlich fuer Audit-Trails.

4.3. Faehigkeiten nur auf `true` setzen, wenn die Implementierung sie vollstaendig unterstuetzt. Nicht unterstuetzte Faehigkeiten zu bewerben bricht die Interoperabilitaet.

**Erwartet:** Ein Capabilities-Objekt mit booleschen Flags, die der tatsaechlichen Implementierung entsprechen.

**Bei Fehler:** Wenn unsicher, ob eine Faehigkeit implementiert wird, auf `false` setzen. Faehigkeiten koennen in zukuenftigen Versionen hinzugefuegt werden. Eine Faehigkeit zu entfernen ist eine brechende Aenderung.

### Schritt 5: Agentenkarte validieren und veroeffentlichen

5.1. Die vollstaendige Agentenkarte zusammenstellen:

```json
{
  "name": "data-analysis-agent",
  "description": "Performs statistical analysis and visualization on tabular datasets.",
  "url": "https://agent.example.com",
  "version": "1.0.0",
  "provider": {
    "organization": "Example Corp",
    "url": "https://example.com"
  },
  "authentication": {
    "schemes": ["oauth2"],
    "credentials": { ... }
  },
  "capabilities": {
    "streaming": true,
    "pushNotifications": false,
    "stateTransitionHistory": true
  },
  "skills": [ ... ],
  "defaultInputModes": ["text/plain"],
  "defaultOutputModes": ["text/plain"]
}
```

5.2. Die Agentenkarte validieren:
   - Als JSON parsen und auf Syntaxfehler pruefen
   - Verifizieren, dass alle erforderlichen Felder vorhanden sind (name, description, url, skills)
   - Verifizieren, dass jeder Skill id, name, description und mindestens einen Ein-/Ausgabemodus hat
   - Verifizieren, dass die URL erreichbar ist und die Karte unter `/.well-known/agent.json` bereitstellt

5.3. Die Agentenkarte veroeffentlichen:
   - Unter `https://<agent-url>/.well-known/agent.json` bereitstellen
   - `Content-Type: application/json` setzen
   - CORS-Header aktivieren, wenn Cross-Origin-Erkennung benoetigt wird
   - Bei relevanten Agentenverzeichnissen oder -registern registrieren

5.4. Erkennung durch Abrufen der Karte testen:

```bash
curl -s https://agent.example.com/.well-known/agent.json | python3 -m json.tool
```

**Erwartet:** Eine gueltige JSON-Agentenkarte, bereitgestellt unter der Well-Known-URL, parsebar von jedem A2A-Client.

**Bei Fehler:** Wenn die JSON-Validierung fehlschlaegt, einen JSON-Linter zur Identifizierung von Syntaxfehlern verwenden. Wenn die URL nicht erreichbar ist, DNS, SSL-Zertifikate und Webserver-Konfiguration pruefen. Wenn CORS benoetigt wird, `Access-Control-Allow-Origin`-Header hinzufuegen.

## Validierung

- [ ] Agentenkarte ist gueltiges JSON ohne Syntaxfehler
- [ ] Alle erforderlichen Felder sind vorhanden: name, description, url, skills
- [ ] Jeder Skill hat id, name, description, inputModes und outputModes
- [ ] Authentifizierungsschema entspricht den Sicherheitsanforderungen der Bereitstellung
- [ ] Faehigkeits-Flags spiegeln den Implementierungsstatus genau wider
- [ ] Agentenkarte wird unter `/.well-known/agent.json` mit korrektem Content-Type bereitgestellt
- [ ] A2A-Clients koennen die Karte erfolgreich abrufen und parsen
- [ ] Beispiele in Skills sind realistisch und loesen den korrekten Skill aus

## Haeufige Stolperfallen

- **Faehigkeiten ueberversprechen**: `streaming: true` oder `pushNotifications: true` ohne Implementierung zu setzen verursacht Client-Fehler bei Nutzung dieser Funktionen. Konservativ sein.
- **Vage Skill-Beschreibungen**: Beschreibungen wie "macht Datensachen" verhindern genaues Skill-Matching. Spezifisch ueber Eingaben, Ausgaben und Domaenen sein.
- **Fehlende CORS-Header**: Browserbasierte A2A-Clients koennen die Agentenkarte ohne korrekte CORS-Konfiguration nicht abrufen.
- **Skill-Ueberschneidung**: Wenn zwei Skills dieselbe Aufgabe bearbeiten koennten, koennen Client-Agenten nicht bestimmen, welchen sie aufrufen sollen. Klare Grenzen sicherstellen.
- **Standard-Modi vergessen**: Wenn `defaultInputModes` und `defaultOutputModes` fehlen, wissen Clients moeglicherweise nicht, welche Inhaltstypen sie senden sollen.
- **Versionsstagnation**: Die Agentenkarten-Version aktualisieren, wenn sich Skills oder Faehigkeiten aendern. Clients koennten alte Versionen zwischenspeichern.
- **Vor der Implementierung veroeffentlichen**: Die Agentenkarte ist ein Vertrag. Skills zu veroeffentlichen, die noch nicht implementiert sind, fuehrt zu Laufzeitfehlern.

## Verwandte Skills

- `implement-a2a-server` — Den Server hinter der Agentenkarte implementieren
- `test-a2a-interop` — Agentenkarten-Konformitaet und Interoperabilitaet validieren
- `build-custom-mcp-server` — MCP-Server als Alternative/Ergaenzung zu A2A
- `configure-mcp-server` — MCP-Konfigurationsmuster, anwendbar auf A2A-Setup
