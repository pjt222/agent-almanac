---
name: rotate-scraping-proxies
description: >
  Blockierte Scraping-Kampagnen durch anbieterneutrale Proxy-Rotation
  eskalieren — zwischen Rechenzentrums-, Residential- und Mobile-Pools
  entscheiden, Rotation in scrapling integrieren, Sitzungs-Stickiness für
  zustandsbehaftete Abläufe konfigurieren, Kosten und Zustand überwachen und
  innerhalb rechtlicher und ethischer Grenzen bleiben. Als nächster Schritt
  einzusetzen, nachdem die clientseitige Tarnung aus `headless-web-scraping`
  (StealthyFetcher, Ratenbegrenzung, robots.txt) nicht ausreicht und der
  Datenverkehr legitim ist.
license: MIT
allowed-tools: Bash Read Write Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-scraping
  complexity: intermediate
  language: Python
  tags: web-scraping, proxies, rotation, residential, scrapling, networking
  locale: de
  source_locale: en
  source_commit: 89cb55b1
  translator: "Claude + human review"
  translation_date: "2026-04-14"
---

# Scraping-Proxys rotieren

Eskalation auf Netzwerkebene für Scraping-Kampagnen, bei denen die
clientseitige Tarnung bereits ausgeschöpft ist. Proxy-Rotation ist ein letztes
Mittel, keine Standardlösung — sie ist teuer, ethisch aufgeladen und leicht
missbrauchbar. Dieser Skill lehrt ebenso, wann er *nicht* einzusetzen ist,
wie er richtig anzuwenden ist.

## Wann verwenden

- `headless-web-scraping` (Fetcher → StealthyFetcher → DynamicFetcher) wurde
  bereits versucht und das Ziel liefert weiterhin 403/429/Geo-Blocks
- Die Ratenbegrenzung liegt bereits bei Intervallen von mindestens 3 Sekunden
  und `robots.txt` erlaubt den Pfad
- Der User-Agent und der TLS-Fingerabdruck sind bereits realistisch (nicht das
  Standard-`python-requests`)
- Ihr Scraping ist legitim: öffentliche Daten, keine Umgehung von
  Authentifizierung, keine Paywall-Umgehung, keine personenbezogenen Daten
  ohne rechtliche Grundlage
- Sie können den Proxy-Datenverkehr budgetieren und die operative Komplexität
  akzeptieren

**Nicht verwenden**, wenn: eine öffentliche API existiert (dann diese nutzen),
die AGB der Website automatisierten Zugriff verbieten, Sie Geo-Lizenzierung
umgehen würden oder das Ziel Betrug / Credential Stuffing / Sneaker-Bots /
Content-Piraterie ist.

## Eingaben

- **Erforderlich**: Ziel-URLs und die rechtliche Grundlage für deren Scraping
- **Erforderlich**: Zugangsdaten für den Proxy-Pool (aus der Umgebung gelesen,
  niemals fest einkodiert)
- **Erforderlich**: Pool-Typ — Rechenzentrum (Datacenter), Residential oder
  Mobile
- **Optional**: Geografische Ausrichtung (Land / Region / Stadt)
- **Optional**: Rotations-Granularität — pro Anfrage (Standard) oder Sticky
  Session
- **Optional**: Tägliches Traffic-/Ausgabenlimit
- **Optional**: Ratenbegrenzungs-Verzögerung in Sekunden (Standard: 1, auch
  bei Rotation)

## Vorgehen

### Schritt 1: Vorab-Prüfung der Rechtmäßigkeit und Ethik

Machen Sie den gesamten Arbeitsablauf von einer dokumentierten rechtlichen
und ethischen Prüfung abhängig. Das Überspringen dieses Schritts ist die mit
Abstand größte Schadensquelle.

```python
# Vor dem Schreiben jeglichen Codes zu bestätigende Eingaben:
# 1. Sind die Daten öffentlich (kein Login erforderlich)?
# 2. Erlaubt robots.txt den Pfad?
# 3. Verbieten die AGB der Website automatisierten Zugriff? (lesen!)
# 4. Würden beim Scraping personenbezogene Daten verarbeitet? Wenn ja, welche rechtliche Grundlage?
# 5. Könnte dieser Zugriff Geo-Lizenzierung, Paywalls oder Authentifizierung umgehen?
# 6. Gibt es eine öffentliche API oder einen Daten-Dump, der Scraping überflüssig macht?
# 7. Haben Sie den Website-Betreiber kontaktiert, falls der Umfang groß ist?
```

**Expected:** Jede Frage hat eine verteidigungsfähige schriftliche Antwort.
Das erste „Nein" oder „Unbekannt" stoppt das Vorgehen, bis es geklärt ist.

**On failure:**
- AGB verbieten automatisierten Zugriff — nicht fortfahren; stattdessen den
  Website-Betreiber kontaktieren oder eine offizielle API bzw. einen
  lizenzierten Datensatz verwenden
- Personenbezogene Daten ohne Rechtsgrundlage — nicht fortfahren;
  Datenschutzbeauftragte einbeziehen
- Umgeht Authentifizierung oder Geo-Lizenzierung — unter keinen Umständen
  fortfahren

### Schritt 2: Einen Pool-Typ auswählen

Unterschiedliche Pool-Typen haben unterschiedliche Kosten-, Erkennbarkeits-
und Ethikprofile. Wählen Sie die günstigste Stufe, die Ihre Blockade
tatsächlich löst.

| Pool-Typ | Erkennbarkeit | Kosten | Geeignet für |
|----------|---------------|--------|--------------|
| Datacenter | Hoch (leicht durch Cloudflare/Akamai blockiert) | $ | Websites ohne echten Anti-Bot-Schutz, nur für Geo-Verlagerung |
| Residential | Niedrig (echte ISP-IPs) | $$$ | Websites, die Rechenzentrums-ASNs blockieren |
| Mobile | Sehr niedrig (Carrier-Grade NAT, mit Tausenden geteilt) | $$$$ | Websites, die sogar Residential blockieren (selten) |

**Ethischer Vorbehalt für Residential und Mobile:** Diese Pools leiten Ihren
Datenverkehr durch echte Privatanschlüsse. Das Einwilligungsmodell der
Pool-Betreiber variiert — einige bezahlen Nutzer, andere bündeln die
Exit-Node-Zustimmung in AGB von „kostenlosen VPNs", die Nutzer nicht lesen.
Bevorzugen Sie Anbieter mit auditierter, explizit erteilter Einwilligung
(Opt-in). Wenn Sie selbst nicht möchten, dass ein Fremder Scraping-Traffic
durch Ihren Heimrouter schickt, dann schicken Sie Ihren auch nicht durch
deren.

**Expected:** Eine dokumentierte Auswahl der günstigsten tragfähigen Stufe
mit einer kurzen Begründung, warum höhere Stufen abgelehnt wurden (oder
warum eine höhere Stufe nötig ist).

**On failure:**
- Datacenter ist blockiert, aber Residential sprengt das Budget — Scraping-
  Umfang reduzieren (weniger URLs, langsamere Kadenz), bevor die Stufe
  hochgestuft wird
- Kein Anbieter mit dokumentierter Opt-in-Einwilligung auffindbar —
  grundsätzlich überdenken, ob das Scraping überhaupt notwendig ist

### Schritt 3: Rotation in Scrapling integrieren

Verdrahten Sie den Proxy mit den scrapling-Fetchern. Lesen Sie Zugangsdaten
aus Umgebungsvariablen — niemals fest einkodieren, niemals eine `.env` in
Git einchecken.

```python
import os
import random
from scrapling import Fetcher, StealthyFetcher

# Muster A: anbietergesteuerter rotierender Endpoint (eine URL, Anbieter rotiert pro Anfrage)
PROXY_URL = os.environ["SCRAPING_PROXY_URL"]  # http://user:pass@gateway.example:7777

fetcher = StealthyFetcher()
fetcher.configure(
    headless=True,
    timeout=60,
    network_idle=True,
    proxy=PROXY_URL,
)

# Muster B: expliziter Pool, Rotation selbst durchführen
POOL = os.environ["SCRAPING_PROXY_POOL"].split(",")  # kommagetrennte URLs

def fetch_with_rotation(url):
    proxy = random.choice(POOL)
    fetcher = StealthyFetcher()
    fetcher.configure(headless=True, timeout=60, proxy=proxy)
    return fetcher.get(url)
```

**Expected:** Anfragen gelingen und die Ausgangs-IP variiert zwischen den
Aufrufen. Bestätigen Sie dies, indem Sie vor dem eigentlichen Scrape einen
IP-Echo-Endpoint (z. B. `https://api.ipify.org`) aufrufen.

**On failure:**
- `407` Proxy Authentication Required — Zugangsdaten sind falsch oder die
  URL-Kodierung des Passworts ist defekt (Sonderzeichen neu kodieren)
- Gleiche IP bei jedem Aufruf — der Anbieter-Endpoint ist möglicherweise
  standardmäßig sticky; Dokumentation auf ein `-rotating`- oder Pro-Anfrage-
  Flag prüfen
- Massiver Latenzanstieg — zu erwarten; Rotation fügt 200–2000 ms pro
  Anfrage hinzu

### Schritt 4: Sticky Sessions und Pool-Zustand

Entscheiden Sie die Rotations-Granularität je nach Arbeitslast und halten
Sie den Pool dann gesund.

```python
# Sticky Session für zustandsbehaftete Abläufe (Login, mehrseitige Checkout-ähnliche Crawls)
# Die meisten Anbieter stellen eine Session-ID über den Benutzernamen bereit:
#   user-session-abc123:pass@gateway.example:7777
# Alle Anfragen mit derselben Session-ID verlassen das Netz über dieselbe IP für ca. 10 Min.

# Rotation pro Anfrage für anonymes Massen-Scraping (Standard)

# Pool-Zustandsprüfung — vor dem Massendurchlauf aufrufen
def check_pool(pool, sample_size=5):
    sample = random.sample(pool, min(sample_size, len(pool)))
    alive = []
    for proxy in sample:
        try:
            r = StealthyFetcher().configure(proxy=proxy, timeout=10).get(
                "https://api.ipify.org"
            )
            if r.status == 200:
                alive.append(proxy)
        except Exception:
            pass
    return alive

# Backoff bei transienten Proxy-Fehlern
def fetch_with_backoff(url, max_attempts=3):
    for attempt in range(max_attempts):
        try:
            r = fetch_with_rotation(url)
            if r.status not in (407, 502, 503):
                return r
        except Exception:
            pass
        time.sleep(2 ** attempt)
    return None
```

**Expected:** Zustandsbehaftete Abläufe behalten Cookies über Anfragen
hinweg; anonymes Massen-Scraping zeigt IP-Varianz zwischen den Anfragen;
tote Proxys werden übersprungen statt in Schleifen zu laufen.

**On failure:**
- Login bricht mitten im Ablauf ab — die Rotation erfolgt innerhalb der
  Sitzung; auf Sticky-Session-Zugangsdaten umstellen
- Alle Proxys in der Stichprobe scheitern an der Zustandsprüfung — Pool
  ist erschöpft oder Zugangsdaten abgelaufen; Zugangsdaten rotieren oder
  Anbieter kontaktieren

### Schritt 5: Monitoring, Kostenkontrolle und Not-Aus

Proxy-Datenverkehr hat Kosten pro GB und Kosten pro Anfrage. Außer Kontrolle
geratene Scraper erzeugen außer Kontrolle geratene Rechnungen. Bauen Sie
stets Limits und einen Abbruch ein.

```python
import time

class ScrapeBudget:
    def __init__(self, max_requests, max_duration_seconds, max_failures):
        self.max_requests = max_requests
        self.max_duration = max_duration_seconds
        self.max_failures = max_failures
        self.requests = 0
        self.failures = 0
        self.start = time.monotonic()

    def allow(self):
        if self.requests >= self.max_requests:
            return False, "request cap reached"
        if time.monotonic() - self.start >= self.max_duration:
            return False, "time cap reached"
        if self.failures >= self.max_failures:
            return False, "failure cap reached (circuit breaker)"
        return True, None

    def record(self, success):
        self.requests += 1
        if not success:
            self.failures += 1

budget = ScrapeBudget(max_requests=1000, max_duration_seconds=3600, max_failures=20)

for url in target_urls:
    ok, reason = budget.allow()
    if not ok:
        print(f"Aborting: {reason}")
        break
    response = fetch_with_backoff(url)
    budget.record(success=response is not None)
    time.sleep(1)  # Ratenbegrenzung gilt weiterhin, auch bei Rotation
```

**Expected:** Budget-Obergrenzen greifen, bevor Kosten außer Kontrolle
geraten. Logs zeigen Erfolgsraten pro Proxy, sodass eine schlechte
Ausgangs-IP identifiziert und ausgeschlossen werden kann.

**On failure:**
- Fehlerrate steigt über 20 % — pausieren; die Website hat das Rotations-
  muster erkannt (z. B. teilen sich alle Ihre IPs ein Subnetz); Pool-Typ
  wechseln oder stoppen
- Kosten pro Datensatz übersteigen die Erwartung um das Fünffache —
  aggressiv cachen, URLs deduplizieren, wo möglich bündeln

## Validierung

- [ ] Die Rechtmäßigkeitsprüfung aus Schritt 1 ist schriftlich dokumentiert,
      bevor irgendein Code läuft
- [ ] Keine Proxy-Zugangsdaten, Pool-URLs oder Session-IDs erscheinen in
      versionierten Dateien (mit grep nach `gateway.`, `proxy=`, dem
      Anbieter-Hostnamen suchen)
- [ ] `.env` (oder Äquivalent) steht in `.gitignore`
- [ ] Die Pool-Wahl ist begründet: günstigste tragfähige Stufe, für
      Residential/Mobile mit geprüftem Einwilligungsmodell
- [ ] Die IP-Varianz ist vor dem eigentlichen Durchlauf gegen einen
      Echo-Endpoint bestätigt
- [ ] Zustandsbehaftete Abläufe nutzen Sticky Sessions; anonymes Massen-
      Scraping nutzt Rotation pro Anfrage
- [ ] Budget-Obergrenzen (Anfragen, Dauer, Fehler) sind verdrahtet und
      getestet
- [ ] Die Ratenbegrenzung (≥ 1 s) bleibt erhalten — Rotation ist kein
      Freibrief zum Fluten
- [ ] `robots.txt` wird weiterhin respektiert — Rotation setzt es nicht
      außer Kraft

## Häufige Fallstricke

- **Rotieren, bevor die Tarnung ausgeschöpft ist**: Die Website braucht oft
  keine neue IP — sie braucht einen realistischen User-Agent, einen
  TLS-Fingerabdruck und eine langsamere Kadenz. Probieren Sie zuerst
  `StealthyFetcher` und Ratenbegrenzung; Rotation ist teuer und unnötig
  einzusetzen ist unethisch.
- **Fest einkodierte Zugangsdaten**: Das Einfügen der Proxy-URL in die
  Quelldatei leakt sie in Git, Container-Images und Stack-Traces. Immer
  aus Umgebungsvariablen oder einem Secrets-Manager lesen.
- **Rotation mitten in der Sitzung**: Rotation pro Anfrage zerstört jeden
  Ablauf, der auf Cookies, CSRF-Tokens oder den Zustand eines Warenkorbs
  angewiesen ist. Verwenden Sie Sticky Sessions für zustandsbehaftete
  Arbeit.
- **Rotation als „ethische Anonymität" missverstehen**: Rotation verbirgt
  *Sie* vor dem Ziel, macht aber schädliches Scraping nicht ethisch. AGB,
  Urheberrecht, Datenschutzrecht und die Ethik der Ratenbegrenzung gelten
  unverändert weiter.
- **Residential-Proxys für hochriskante Aktivitäten einsetzen**: Credential
  Stuffing, Sneaker-Botting, Geo-Piraterie von Streaming-Inhalten, Betrug —
  explizit außerhalb des Geltungsbereichs dieses Skills. Wenn Ihr
  Anwendungsfall so aussieht, hören Sie auf.
- **`robots.txt` ignorieren, weil „wir haben ja jetzt Rotation"**: Rotation
  erteilt keine Erlaubnis. Die Direktive ist die Direktive.
- **Kein Not-Aus**: Eine unbeaufsichtigte Schleife auf einem abgerechneten
  Proxy-Pool wird über Nacht zu einer vierstelligen Rechnung. Begrenzen
  Sie stets Anfragen, Dauer und Fehler.
- **Einen Residential-Pool mit intransparenter Einwilligung wählen**:
  Manche Anbieter beziehen Exit-Nodes aus „kostenlosen VPN"-AGB, die echte
  Nutzer nie lesen. Zahlen Sie den Aufpreis für ein auditiertes, explizit
  erteiltes (Opt-in) Einwilligungsmodell.

## Verwandte Skills

- [headless-web-scraping](../headless-web-scraping/SKILL.md) — übergeordneter
  Skill; immer dort beginnen. Diesen Skill nur zur Eskalation verwenden.
- [use-graphql-api](../use-graphql-api/SKILL.md) — offizielle APIs gegenüber
  Scraping bevorzugen, sofern verfügbar.
- [deploy-searxng](../deploy-searxng/SKILL.md) — selbst gehostete Suche
  vermeidet das Scrapen von Suchmaschinen vollständig.
- [configure-reverse-proxy](../configure-reverse-proxy/SKILL.md) — entgegen-
  gesetzte Netzwerkrichtung (Bereitstellen statt Abrufen), nützlicher
  Nachbar-Verweis.
- [security-audit-codebase](../security-audit-codebase/SKILL.md) — nach der
  Integration von Zugangsdaten durchführen, um zu bestätigen, dass keine
  in das Repository geleakt sind.

<!-- Keep under 500 lines. Extract large examples to references/EXAMPLES.md if needed. -->
