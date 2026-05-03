---
name: headless-web-scraping
description: >
  Extract data from web pages using the scrapling Python library — select the
  appropriate fetcher tier (HTTP, stealth Chromium, or full browser automation)
  based on target site defenses, configure headless browsing, and extract
  structured data with CSS selectors. Use when WebFetch is insufficient for
  JS-rendered pages, anti-bot-protected sites, or structured multi-element
  extraction requiring DOM traversal.
license: MIT
allowed-tools: Bash Read Write Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-scraping
  complexity: intermediate
  language: Python
  tags: web-scraping, headless, scrapling, automation, data-extraction
  locale: de
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Headless Web Scraping

Daten aus Webseiten extrahieren die einfachen HTTP-Anfragen widerstehen — JS-gerenderter Inhalt, Cloudflare-geschuetzte Seiten und dynamische SPAs — mit der Drei-Stufen-Fetcher-Architektur von scrapling und CSS-basierter Datenextraktion.

## Wann verwenden

- Ziel-Seite erfordert JavaScript-Rendering (SPA, React, Vue)
- Seite hat Anti-Bot-Schutz (Cloudflare Turnstile, TLS-Fingerprinting)
- Strukturierte Extraktion mehrerer Elemente via CSS-Selektoren noetig
- Einfaches `WebFetch` oder `requests.get()` gibt leere oder blockierte Antworten zurueck
- Tabellarische Daten, Linklisten oder wiederholte DOM-Strukturen im Massstab extrahieren

## Eingaben

- **Erforderlich**: Ziel-URL oder Liste von URLs zum Scrapen
- **Erforderlich**: Zu extrahierende Daten (CSS-Selektoren, Feldnamen oder Beschreibung der Ziel-Elemente)
- **Optional**: Fetcher-Stufen-Override (Standard: Auto-Auswahl basierend auf Site-Verhalten)
- **Optional**: Ausgabeformat (Standard: JSON; Alternativen: CSV, Python-Dict)
- **Optional**: Rate-Limit-Verzoegerung in Sekunden (Standard: 1)

## Vorgehensweise

### Schritt 1: Fetcher-Stufe waehlen

Bestimmen welcher scrapling-Fetcher zur Verteidigung der Ziel-Site passt.

```python
# Decision matrix:
# 1. Fetcher        — static HTML, no JS, no anti-bot (fastest)
# 2. StealthyFetcher — Cloudflare/Turnstile, TLS fingerprint checks
# 3. DynamicFetcher  — JS-rendered SPAs, click/scroll interactions

# Quick probe: try Fetcher first, escalate on failure
from scrapling import Fetcher

fetcher = Fetcher()
response = fetcher.get("https://example.com/target-page")

if response.status == 200 and response.get_all_text():
    print("Fetcher tier sufficient")
else:
    print("Escalate to StealthyFetcher or DynamicFetcher")
```

| Signal | Empfohlene Stufe |
|--------|------------------|
| Statisches HTML, kein Schutz | `Fetcher` |
| 403/503, Cloudflare-Challenge-Seite | `StealthyFetcher` |
| Seite laedt aber Content-Bereich ist leer | `DynamicFetcher` |
| Buttons klicken oder scrollen noetig | `DynamicFetcher` |
| altcha-CAPTCHA praesent | Keine (kann nicht automatisiert werden) |

**Erwartet:** Eine der drei Stufen ist identifiziert. Fuer die meisten modernen Sites ist `StealthyFetcher` der korrekte Startpunkt.

**Bei Fehler:** Wenn alle drei Stufen blockierte Antworten zurueckgeben, pruefen ob die Site altcha-CAPTCHA nutzt (Proof-of-Work-Challenge die nicht umgangen werden kann). Falls ja, die Beschraenkung dokumentieren und stattdessen manuelle Extraktions-Anweisungen bereitstellen.

### Schritt 2: Den Fetcher konfigurieren

Den ausgewaehlten Fetcher mit angemessenen Optionen einrichten.

```python
from scrapling import Fetcher, StealthyFetcher, DynamicFetcher

# Tier 1: Fast HTTP with TLS fingerprint impersonation
fetcher = Fetcher()
fetcher.configure(
    timeout=30,
    retries=3,
    follow_redirects=True
)

# Tier 2: Headless Chromium with anti-detection
fetcher = StealthyFetcher()
fetcher.configure(
    headless=True,
    timeout=60,
    network_idle=True  # wait for all network requests to settle
)

# Tier 3: Full browser automation
fetcher = DynamicFetcher()
fetcher.configure(
    headless=True,
    timeout=90,
    network_idle=True,
    wait_selector="div.results"  # wait for specific element before extracting
)
```

**Erwartet:** Fetcher-Instanz ist konfiguriert und bereit. Keine Fehler bei Instanziierung. Fuer `StealthyFetcher` und `DynamicFetcher` ist ein Chromium-Binary verfuegbar (scrapling verwaltet dies automatisch beim ersten Lauf).

**Bei Fehler:**
- `playwright` oder Browser-Binary nicht gefunden -- `python -m playwright install chromium` ausfuehren
- Timeout bei `configure()` -- Timeout-Wert erhoehen oder Netzwerk-Konnektivitaet pruefen
- Import-Fehler -- scrapling installieren: `pip install scrapling`

### Schritt 3: Daten holen und extrahieren

Zur Ziel-URL navigieren und strukturierte Daten mit CSS-Selektoren extrahieren.

```python
# Fetch the page
response = fetcher.get("https://example.com/target-page")

# Single element extraction
title = response.find("h1.page-title")
if title:
    print(title.get_all_text())

# Multiple elements
items = response.find_all("div.result-item")
for item in items:
    name = item.find("span.name")
    price = item.find("span.price")
    print(f"{name.get_all_text()}: {price.get_all_text()}")

# Get attribute values
links = response.find_all("a.product-link")
urls = [link.get("href") for link in links]

# Get raw HTML content of an element
detail_html = response.find("div.description").html_content
```

**Schluessel-API-Referenz:**

| Methode | Zweck |
|---------|-------|
| `response.find("selector")` | Erstes passendes Element |
| `response.find_all("selector")` | Alle passenden Elemente |
| `element.get("attr")` | Attributwert (href, src, data-*) |
| `element.get_all_text()` | Alle Text-Inhalte, rekursiv |
| `element.html_content` | Rohes Inner-HTML |

**Erwartet:** Extrahierte Daten entsprechen dem sichtbaren Seiteninhalt. Elemente sind nicht None und Text-Inhalt ist nicht leer fuer befuellte Seiten.

**Bei Fehler:**
- `find()` gibt `None` zurueck -- das tatsaechliche HTML inspizieren (`response.html_content`) um den Selektor zu verifizieren; die Seite kann andere Klassennamen als erwartet nutzen
- Leerer Text aus `get_all_text()` -- Inhalt kann in Shadow-DOM oder Iframe sein; `DynamicFetcher` mit `wait_selector` versuchen
- `.css_first()` NICHT nutzen -- dies ist nicht Teil der scrapling-API (haeufige Verwechslung mit anderen Bibliotheken)

### Schritt 4: Versagen und Grenzfaelle behandeln

Fallback-Logik fuer CAPTCHA-Detection, leere Antworten und Session-Anforderungen implementieren.

```python
import time

def scrape_with_fallback(url, selector):
    """Try each fetcher tier in order, with CAPTCHA detection."""
    tiers = [
        ("Fetcher", Fetcher),
        ("StealthyFetcher", StealthyFetcher),
        ("DynamicFetcher", DynamicFetcher),
    ]

    for tier_name, tier_class in tiers:
        fetcher = tier_class()
        fetcher.configure(headless=True, timeout=60)

        try:
            response = fetcher.get(url)
        except Exception as error:
            print(f"{tier_name} failed: {error}")
            continue

        # Detect CAPTCHA / challenge pages
        page_text = response.get_all_text().lower()
        if "altcha" in page_text or "proof of work" in page_text:
            print(f"altcha CAPTCHA detected -- cannot automate")
            return None

        if response.status == 403 or response.status == 503:
            print(f"{tier_name} blocked (HTTP {response.status}), escalating")
            continue

        result = response.find(selector)
        if result and result.get_all_text().strip():
            return result.get_all_text()

        print(f"{tier_name} returned empty content, escalating")

    print("All tiers exhausted. Manual extraction required.")
    return None
```

**Erwartet:** Funktion gibt extrahierten Text bei Erfolg zurueck oder `None` mit einer Diagnose-Nachricht wenn alle Stufen scheitern. CAPTCHA-Seiten werden erkannt und gemeldet statt unendlich neu versucht.

**Bei Fehler:**
- Alle Stufen geben 403 zurueck -- die Site blockiert allen automatisierten Zugriff (haeufig bei WIPO, TMview, manchen Regierungsdatenbanken); die URL als manuellen-Zugriff-erfordernd dokumentieren
- Timeout-Fehler -- die Seite kann hinter einem langsamen CDN sein; Timeout auf 120s erhoehen
- Session-/Cookie-Fehler -- die Site kann Login erfordern; Cookie-Handhabung hinzufuegen oder zuerst authentifizieren

### Schritt 5: Rate-Limiting und ethisches Scraping

Verzoegerungen implementieren und Site-Policies respektieren bevor im Massstab gelaufen wird.

```python
import time
import urllib.robotparser

def check_robots_txt(base_url, target_path):
    """Check if scraping is allowed by robots.txt."""
    rp = urllib.robotparser.RobotFileParser()
    rp.set_url(f"{base_url}/robots.txt")
    rp.read()
    return rp.can_fetch("*", f"{base_url}{target_path}")

def scrape_urls(urls, selector, delay=1.0):
    """Scrape multiple URLs with rate limiting."""
    results = []
    fetcher = StealthyFetcher()
    fetcher.configure(headless=True, timeout=60)

    for url in urls:
        response = fetcher.get(url)
        data = response.find(selector)
        if data:
            results.append(data.get_all_text())

        time.sleep(delay)  # respect the server

    return results
```

**Ethische Scraping-Checkliste:**

1. `robots.txt` vor dem Scrapen pruefen -- `Disallow`-Direktiven respektieren
2. Mindestens 1 Sekunde Verzoegerung zwischen Anfragen nutzen
3. Den Scraper mit einem beschreibenden User-Agent identifizieren wenn moeglich
4. Persoenliche Daten nicht ohne Rechtsbasis scrapen
5. Antworten lokal cachen um redundante Anfragen zu vermeiden
6. Sofort stoppen bei einem 429 (Too Many Requests)

**Erwartet:** Scraping laeuft mit kontrollierter Rate. `robots.txt` wird vor Bulk-Operationen geprueft. Keine 429-Antworten ausgeloest.

**Bei Fehler:**
- 429 Too Many Requests -- Verzoegerung auf 3-5 Sekunden erhoehen oder stoppen und spaeter wiederholen
- `robots.txt` verbietet den Pfad -- die Direktive respektieren; nicht ueberschreiben
- IP-Bann -- sofort mit Scrapen aufhoeren; das Rate-Limiting war unzureichend. Wenn Zugriff legitim ist (oeffentliche Daten, ToS-erlaubt, robots.txt-respektiert) und fortgefahren werden muss, siehe [rotate-scraping-proxies](../rotate-scraping-proxies/SKILL.md) fuer Netzwerk-Schicht-Eskalation

## Validierung

- [ ] Korrekte Fetcher-Stufe ist ausgewaehlt (nicht ueber- oder unterdimensioniert fuer das Ziel)
- [ ] `configure()`-Methode wird genutzt (nicht deprecated Constructor-Kwargs)
- [ ] CSS-Selektoren passen zur tatsaechlichen Seitenstruktur (gegen Seitenquelle verifiziert)
- [ ] `.find()` / `.find_all()`-API wird genutzt (nicht `.css_first()` oder andere Bibliotheks-Methoden)
- [ ] CAPTCHA-Detection ist vorhanden (altcha-Seiten werden gemeldet, nicht erneut versucht)
- [ ] Rate-Limiting ist fuer Multi-URL-Scraping implementiert
- [ ] `robots.txt` wird vor Bulk-Operationen geprueft
- [ ] Extrahierte Daten sind nicht leer und strukturell korrekt

## Haeufige Stolperfallen

- **`.css_first()` statt `.find()` nutzen**: scrapling nutzt `.find()` und `.find_all()` zur Element-Auswahl -- `.css_first()` gehoert zu einer anderen Bibliothek und wird `AttributeError` werfen
- **Mit DynamicFetcher beginnen**: Immer zuerst `Fetcher` versuchen, dann eskalieren -- `DynamicFetcher` ist 10-50x langsamer aufgrund vollstaendigen Browser-Starts
- **Constructor-Kwargs statt `configure()`**: scrapling v0.4.x deprecatete das Uebergeben von Optionen an den Constructor; immer die `configure()`-Methode nutzen
- **altcha-CAPTCHA ignorieren**: Keine Fetcher-Stufe kann altcha-Proof-of-Work-Challenges loesen -- frueh erkennen und auf manuelle Anweisungen zurueckfallen
- **Kein Rate-Limiting**: Selbst wenn die Site keine 429 zurueckgibt, kann aggressives Scraping deine IP gebannt werden lassen oder Service-Degradation verursachen
- **Stabile Selektoren annehmen**: Website-CSS-Klassen aendern sich haeufig -- Selektoren gegen aktuelle Seitenquelle vor jeder Scraping-Kampagne validieren

## Verwandte Skills

- [rotate-scraping-proxies](../rotate-scraping-proxies/SKILL.md) -- Netzwerk-Schicht-Eskalation wenn Client-Side-Stealth erschoepft ist und IP-Banns legitimen, ToS-erlaubten Zugriff blockieren
- [use-graphql-api](../use-graphql-api/SKILL.md) -- strukturierte API-Queries wenn die Site einen GraphQL-Endpoint anbietet (Scraping vorzuziehen)
- [serialize-data-formats](../serialize-data-formats/SKILL.md) -- extrahierte Daten in JSON, CSV oder andere Formate konvertieren
- [deploy-searxng](../deploy-searxng/SKILL.md) -- selbst-gehostete Suchmaschine die Ergebnisse aus mehreren Quellen aggregiert
- [forage-solutions](../forage-solutions/SKILL.md) -- breiteres Muster zum Sammeln von Information aus diversen Quellen

<!-- Keep under 500 lines. Extract large examples to references/EXAMPLES.md if needed. -->
