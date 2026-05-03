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
  locale: es
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Headless Web Scraping

Extraer datos de páginas web que resisten solicitudes HTTP simples — contenido renderizado por JS, sitios protegidos por Cloudflare y SPAs dinámicos — usando la arquitectura de fetcher de tres niveles de scrapling y la extracción de datos basada en CSS.

## Cuándo Usar

- La página objetivo requiere renderizado de JavaScript (SPA, React, Vue)
- El sitio tiene protecciones anti-bot (Cloudflare Turnstile, fingerprinting TLS)
- Necesitas extracción estructurada de múltiples elementos vía selectores CSS
- `WebFetch` simple o `requests.get()` retorna respuestas vacías o bloqueadas
- Extraer datos tabulares, listas de enlaces o estructuras DOM repetidas a escala

## Entradas

- **Requerido**: URL objetivo o lista de URLs para hacer scraping
- **Requerido**: Datos a extraer (selectores CSS, nombres de campos o descripción de elementos objetivo)
- **Opcional**: Override de tier de fetcher (predeterminado: auto-seleccionar basado en comportamiento del sitio)
- **Opcional**: Formato de salida (predeterminado: JSON; alternativas: CSV, dict de Python)
- **Opcional**: Delay de rate limit en segundos (predeterminado: 1)

## Procedimiento

### Paso 1: Seleccionar el Tier de Fetcher

Determinar qué fetcher de scrapling coincide con las defensas del sitio objetivo.

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

| Señal | Tier Recomendado |
|--------|-----------------|
| HTML estático, sin protección | `Fetcher` |
| 403/503, página de challenge de Cloudflare | `StealthyFetcher` |
| La página carga pero el área de contenido está vacía | `DynamicFetcher` |
| Necesita hacer click en botones o scroll | `DynamicFetcher` |
| altcha CAPTCHA presente | Ninguno (no se puede automatizar) |

**Esperado:** Uno de los tres tiers es identificado. Para la mayoría de los sitios modernos, `StealthyFetcher` es el punto de partida correcto.

**En caso de fallo:** Si los tres tiers retornan respuestas bloqueadas, verificar si el sitio usa altcha CAPTCHA (challenge de proof-of-work que no se puede sortear). Si es así, documentar la limitación y proveer instrucciones de extracción manual en su lugar.

### Paso 2: Configurar el Fetcher

Configurar el fetcher seleccionado con las opciones apropiadas.

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

**Esperado:** La instancia del fetcher está configurada y lista. Sin errores en la instanciación. Para `StealthyFetcher` y `DynamicFetcher`, un binario de Chromium está disponible (scrapling lo gestiona automáticamente en la primera ejecución).

**En caso de fallo:**
- `playwright` o binario de navegador no encontrado -- ejecutar `python -m playwright install chromium`
- Timeout en `configure()` -- aumentar el valor de timeout o verificar conectividad de red
- Error de import -- instalar scrapling: `pip install scrapling`

### Paso 3: Hacer Fetch y Extraer Datos

Navegar a la URL objetivo y extraer datos estructurados usando selectores CSS.

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

**Referencia clave de la API:**

| Método | Propósito |
|--------|---------|
| `response.find("selector")` | Primer elemento que coincide |
| `response.find_all("selector")` | Todos los elementos que coinciden |
| `element.get("attr")` | Valor del atributo (href, src, data-*) |
| `element.get_all_text()` | Todo el contenido de texto, recursivamente |
| `element.html_content` | HTML interno crudo |

**Esperado:** Los datos extraídos coinciden con el contenido visible de la página. Los elementos son no-None y el contenido de texto es no-vacío para páginas pobladas.

**En caso de fallo:**
- `find()` retorna `None` -- inspeccionar el HTML real (`response.html_content`) para verificar el selector; la página puede usar nombres de clase diferentes a los esperados
- Texto vacío de `get_all_text()` -- el contenido puede estar dentro de shadow DOM o un iframe; probar `DynamicFetcher` con un `wait_selector`
- NO usar `.css_first()` -- esto no es parte de la API de scrapling (confusión común con otras librerías)

### Paso 4: Manejar Fallos y Casos Límite

Implementar lógica de fallback para detección de CAPTCHA, respuestas vacías y requisitos de sesión.

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

**Esperado:** La función retorna texto extraído en caso de éxito, o `None` con un mensaje diagnóstico cuando todos los tiers fallan. Las páginas CAPTCHA son detectadas y reportadas en lugar de reintentar indefinidamente.

**En caso de fallo:**
- Todos los tiers retornan 403 -- el sitio bloquea todo acceso automatizado (común con WIPO, TMview, algunas bases de datos gubernamentales); documentar la URL como requiriendo acceso manual
- Errores de timeout -- la página puede estar detrás de una CDN lenta; aumentar el timeout a 120s
- Errores de sesión/cookie -- el sitio puede requerir login; añadir manejo de cookies o autenticarse primero

### Paso 5: Rate Limiting y Scraping Ético

Implementar delays y respetar las políticas del sitio antes de ejecutar a escala.

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

**Lista de verificación de scraping ético:**

1. Verificar `robots.txt` antes de hacer scraping -- respetar las directivas `Disallow`
2. Usar un mínimo de 1 segundo de delay entre solicitudes
3. Identificar tu scraper con un User-Agent descriptivo cuando sea posible
4. No hacer scraping de datos personales sin base legal
5. Cachear respuestas localmente para evitar solicitudes redundantes
6. Detener inmediatamente si recibes un 429 (Too Many Requests)

**Esperado:** El scraping corre a una tasa controlada. `robots.txt` se verifica antes de operaciones masivas. No se disparan respuestas 429.

**En caso de fallo:**
- 429 Too Many Requests -- aumentar delay a 3-5 segundos, o detener y reintentar después
- `robots.txt` no permite la ruta -- respetar la directiva; no anularla
- Ban de IP -- detener el scraping inmediatamente; el rate limiting fue insuficiente. Si el acceso es legítimo (datos públicos, permitido por ToS, robots.txt respetado) y debes continuar, ver [rotate-scraping-proxies](../rotate-scraping-proxies/SKILL.md) para escalado a nivel de red

## Validación

- [ ] El tier de fetcher correcto está seleccionado (no sobre- ni infra-potenciado para el objetivo)
- [ ] Se usa el método `configure()` (no kwargs deprecados del constructor)
- [ ] Los selectores CSS coinciden con la estructura real de la página (verificada contra el código fuente de la página)
- [ ] Se usa la API `.find()` / `.find_all()` (no `.css_first()` u otros métodos de librería)
- [ ] La detección de CAPTCHA está en su lugar (las páginas altcha son reportadas, no reintentadas)
- [ ] El rate limiting está implementado para scraping de múltiples URLs
- [ ] `robots.txt` se verifica antes de operaciones masivas
- [ ] Los datos extraídos son no-vacíos y estructuralmente correctos

## Errores Comunes

- **Usar `.css_first()` en lugar de `.find()`**: scrapling usa `.find()` y `.find_all()` para selección de elementos -- `.css_first()` pertenece a una librería diferente y lanzará `AttributeError`
- **Comenzar con DynamicFetcher**: Siempre probar `Fetcher` primero, luego escalar -- `DynamicFetcher` es 10-50x más lento debido al arranque del navegador completo
- **Kwargs del constructor en lugar de `configure()`**: scrapling v0.4.x deprecó pasar opciones al constructor; siempre usar el método `configure()`
- **Ignorar altcha CAPTCHA**: Ningún tier de fetcher puede resolver challenges de proof-of-work altcha -- detectarlos temprano y caer en instrucciones manuales
- **Sin rate limiting**: Incluso si el sitio no retorna 429, el scraping agresivo puede hacer que tu IP sea bloqueada o causar degradación del servicio
- **Asumir selectores estables**: Las clases CSS de los sitios web cambian frecuentemente -- validar selectores contra el código fuente actual de la página antes de cada campaña de scraping

## Habilidades Relacionadas

- [rotate-scraping-proxies](../rotate-scraping-proxies/SKILL.md) -- escalado a nivel de red cuando el sigilo del lado del cliente está agotado y los bans de IP bloquean acceso legítimo y permitido por ToS
- [use-graphql-api](../use-graphql-api/SKILL.md) -- consultas API estructuradas cuando el sitio ofrece un endpoint GraphQL (preferido sobre scraping)
- [serialize-data-formats](../serialize-data-formats/SKILL.md) -- conversión de datos extraídos a JSON, CSV u otros formatos
- [deploy-searxng](../deploy-searxng/SKILL.md) -- motor de búsqueda self-hosted que agrega resultados de múltiples fuentes
- [forage-solutions](../forage-solutions/SKILL.md) -- patrón más amplio para reunir información de fuentes diversas

<!-- Keep under 500 lines. Extract large examples to references/EXAMPLES.md if needed. -->
