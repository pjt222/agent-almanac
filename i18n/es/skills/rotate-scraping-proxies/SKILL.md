---
name: rotate-scraping-proxies
description: >
  Escale campañas de scraping bloqueadas con rotación de proxies neutral
  respecto al proveedor: decida entre pools de centro de datos, residenciales
  y móviles, integre la rotación con scrapling, configure la persistencia de
  sesión para flujos con estado, supervise el coste y la salud del pool, y
  permanezca dentro de los límites legales y éticos. Utilícela como siguiente
  paso cuando la evasión anti-bot del lado del cliente de `headless-web-scraping`
  (StealthyFetcher, limitación de velocidad, `robots.txt`) resulte insuficiente
  y el tráfico sea legítimo.
license: MIT
allowed-tools: Bash Read Write Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-scraping
  complexity: intermediate
  language: Python
  tags: web-scraping, proxies, rotation, residential, scrapling, networking
  locale: es
  source_locale: en
  source_commit: 89cb55b1
  translator: "Claude + human review"
  translation_date: "2026-04-14"
---

# Rotar proxies de scraping

Escalado a nivel de red para campañas de scraping en las que la evasión
anti-bot del lado del cliente ya se ha agotado. La rotación de proxies es un
último recurso, no una opción por defecto: es costosa, éticamente delicada y
fácil de utilizar mal. Esta habilidad enseña tanto *cuándo no* usarla como la
manera de usarla bien.

## Cuándo usarla

- Ya se ha probado `headless-web-scraping` (Fetcher → StealthyFetcher →
  DynamicFetcher) y el objetivo sigue devolviendo 403/429 o bloqueos
  geográficos
- La limitación de velocidad ya está en intervalos de 3 segundos o más y
  `robots.txt` permite la ruta
- El User-Agent y la huella TLS ya son realistas (no el
  `python-requests` por defecto)
- Su scraping es legítimo: datos públicos, sin elusión de autenticación, sin
  saltarse muros de pago, sin recolección de datos personales sin base legal
- Puede presupuestar el tráfico de proxies y asumir la complejidad operativa

**No la utilice** cuando: exista una API pública (úsela), los términos del
servicio del sitio prohíban el acceso automatizado, se vaya a eludir licencias
geográficas, o el objetivo sea fraude / credential stuffing / bots para
zapatillas / piratería de contenidos.

## Entradas

- **Requerido**: URLs objetivo y la base legal para hacerles scraping
- **Requerido**: Credenciales del pool de proxies (leídas desde el entorno,
  nunca codificadas en el código)
- **Requerido**: Tipo de pool — centro de datos, residencial o móvil
- **Opcional**: Segmentación geográfica (país / región / ciudad)
- **Opcional**: Granularidad de la rotación — por petición (por defecto) o
  sesión persistente (sticky)
- **Opcional**: Límite diario de tráfico / gasto
- **Opcional**: Retardo de limitación de velocidad en segundos (por defecto: 1,
  incluso con rotación)

## Procedimiento

### Paso 1: Verificación previa de legalidad y ética

Condicione todo el flujo de trabajo a una revisión legal y ética documentada.
Saltarse este paso es, con diferencia, la mayor fuente de daños.

```python
# Datos a confirmar antes de escribir una sola linea de codigo:
# 1. ¿Son publicos los datos (sin requerir login)?
# 2. ¿Permite robots.txt la ruta?
# 3. ¿Prohiben los terminos del servicio el acceso automatizado? (leelos)
# 4. ¿Procesaria el scraping datos personales? Si es asi, ¿cual es la base legal?
# 5. ¿Podria este acceso eludir licencias geograficas, muros de pago o autenticacion?
# 6. ¿Existe una API publica o volcado de datos que haga innecesario el scraping?
# 7. ¿Has contactado con el propietario del sitio si el alcance es grande?
```

**Expected:** Cada pregunta tiene una respuesta escrita defendible. El primer
"no" o "desconocido" detiene el procedimiento hasta que se resuelva.

**On failure:**
- Los términos de servicio prohíben el acceso automatizado — no continúe;
  contacte con el propietario del sitio o utilice una API oficial o un
  conjunto de datos con licencia
- Datos personales sin base legal — no continúe; involucre a asesoría de
  privacidad
- Elude autenticación o licencias geográficas — no continúe bajo ninguna
  circunstancia

### Paso 2: Elija un tipo de pool

Los distintos tipos de pool tienen perfiles diferentes de coste, detectabilidad
y ética. Escoja el nivel más barato que realmente resuelva su bloqueo.

| Tipo de pool | Detectabilidad | Coste | Ideal para |
|--------------|----------------|-------|------------|
| Centro de datos | Alta (fácilmente bloqueado por Cloudflare/Akamai) | $ | Sitios sin anti-bot real, solo cambio geográfico |
| Residencial | Baja (IPs reales de ISP) | $$$ | Sitios que bloquean ASN de centros de datos |
| Móvil | Muy baja (NAT a nivel de operadora, compartida con miles) | $$$$ | Sitios que incluso bloquean residenciales (poco frecuente) |

**Advertencia ética para residencial y móvil:** estos pools enrutan su tráfico
a través de conexiones de consumidores reales. El modelo de consentimiento del
operador del pool varía — algunos pagan a los usuarios, otros incluyen el
consentimiento de nodo de salida en los EULA de "VPN gratuitas" que los
usuarios no leen. Prefiera proveedores con consentimiento auditado y opt-in.
Si no se sentiría cómodo con que un desconocido enviase su tráfico de scraping
a través del router de su casa, no envíe el suyo a través del de ellos.

**Expected:** Una elección documentada con el nivel viable más barato y una
nota breve sobre por qué se descartaron niveles superiores (o por qué uno
superior es necesario).

**On failure:**
- El centro de datos está bloqueado pero el residencial excede el presupuesto
  — reduzca el alcance del scraping (menos URLs, cadencia más lenta) antes de
  subir de nivel
- No encuentra un proveedor con consentimiento opt-in documentado —
  reconsidere si el scraping es realmente necesario

### Paso 3: Integrar la rotación con scrapling

Conecte el proxy a los fetchers de scrapling. Lea las credenciales desde
variables de entorno — nunca las codifique, nunca haga commit de un `.env` a
git.

```python
import os
import random
from scrapling import Fetcher, StealthyFetcher

# Patron A: endpoint rotativo gestionado por el proveedor (una URL, el proveedor rota por peticion)
PROXY_URL = os.environ["SCRAPING_PROXY_URL"]  # http://user:pass@gateway.example:7777

fetcher = StealthyFetcher()
fetcher.configure(
    headless=True,
    timeout=60,
    network_idle=True,
    proxy=PROXY_URL,
)

# Patron B: pool explicito, tu mismo gestionas la rotacion
POOL = os.environ["SCRAPING_PROXY_POOL"].split(",")  # URLs separadas por coma

def fetch_with_rotation(url):
    proxy = random.choice(POOL)
    fetcher = StealthyFetcher()
    fetcher.configure(headless=True, timeout=60, proxy=proxy)
    return fetcher.get(url)
```

**Expected:** Las peticiones tienen éxito y la IP de salida varía entre
llamadas. Confírmelo consultando un endpoint de eco de IP (por ejemplo,
`https://api.ipify.org`) antes de ejecutar el scraping real.

**On failure:**
- `407` Proxy Authentication Required — las credenciales son incorrectas o la
  codificación URL de la contraseña se rompió (vuelva a codificar los
  caracteres especiales)
- La misma IP en cada llamada — el endpoint del proveedor puede ser sticky
  por defecto; consulte la documentación en busca de un flag `-rotating` o
  por petición
- Aumento masivo de latencia — es lo esperado; la rotación añade entre 200 y
  2000 ms por petición

### Paso 4: Sesiones persistentes y salud del pool

Decida la granularidad de la rotación según la carga de trabajo y luego
mantenga el pool saludable.

```python
# Sesion persistente (sticky) para flujos con estado (login, rastreos tipo checkout multipagina)
# La mayoria de proveedores expone un session ID a traves del nombre de usuario:
#   user-session-abc123:pass@gateway.example:7777
# Todas las peticiones con el mismo session ID salen por la misma IP durante ~10 min.

# Rotacion por peticion para scraping anonimo masivo (por defecto)

# Comprobacion de salud del pool — ejecutar antes de una ejecucion masiva
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

# Retroceso exponencial ante fallos transitorios del proxy
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

**Expected:** Los flujos con estado conservan las cookies entre peticiones;
el scraping anónimo masivo muestra variación de IP entre peticiones; los
proxies muertos se omiten en lugar de entrar en un bucle.

**On failure:**
- El inicio de sesión se rompe a mitad del flujo — la rotación ocurre dentro
  de la sesión; cambie a credenciales de sesión persistente (sticky-session)
- Todos los proxies de la muestra fallan la comprobación de salud — el pool
  está agotado o las credenciales han caducado; rote las credenciales o
  contacte con el proveedor

### Paso 5: Supervisión, control de costes y interruptor de emergencia

El tráfico de proxies tiene un coste por GB y un coste por petición. Los
scrapers descontrolados generan facturas descontroladas. Incluya siempre
límites y un mecanismo de aborto.

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
    time.sleep(1)  # la limitacion de velocidad sigue aplicando incluso con rotacion
```

**Expected:** Los topes del presupuesto se activan antes de que el coste se
dispare. Los logs muestran la tasa de éxito por proxy para poder identificar
y excluir una IP de salida problemática.

**On failure:**
- La tasa de fallos sube por encima del 20 % — pause; el sitio ha detectado
  el patrón de rotación (por ejemplo, todas sus IPs comparten una subred);
  cambie de tipo de pool o deténgase
- El coste por registro supera las expectativas en 5x — utilice caché de forma
  agresiva, deduplique URLs, agrupe peticiones cuando sea posible

## Validación

- [ ] La verificación de legalidad del Paso 1 está documentada por escrito
      antes de que se ejecute cualquier código
- [ ] No aparecen credenciales de proxy, URLs del pool ni identificadores de
      sesión en archivos bajo control de versiones (busque con grep
      `gateway.`, `proxy=`, el hostname del proveedor)
- [ ] `.env` (o equivalente) está en `.gitignore`
- [ ] La elección del pool está justificada: el nivel viable más barato, con
      el modelo de consentimiento verificado para residencial/móvil
- [ ] La variación de IP se confirma contra un endpoint de eco antes de la
      ejecución real
- [ ] Los flujos con estado usan sesiones persistentes; el uso anónimo masivo
      va por petición
- [ ] Los topes del presupuesto (peticiones, duración, fallos) están
      conectados y probados
- [ ] Se preserva la limitación de velocidad (≥1 s) — la rotación no es
      excusa para inundar
- [ ] Se sigue respetando `robots.txt` — la rotación no lo invalida

## Errores comunes

- **Rotar antes de agotar la evasión anti-bot**: a menudo el sitio no
  necesita una IP nueva — necesita un User-Agent realista, una huella TLS y
  una cadencia más lenta. Pruebe primero `StealthyFetcher` y la limitación
  de velocidad; la rotación es cara y éticamente inapropiada si se despliega
  innecesariamente.
- **Credenciales codificadas en el código**: pegar la URL del proxy en el
  archivo fuente la filtra a git, a las imágenes de contenedor y a los
  stack traces. Lea siempre desde variables de entorno o un gestor de
  secretos.
- **Rotar en medio de una sesión**: la rotación por petición rompe cualquier
  flujo que dependa de cookies, tokens CSRF o el estado del carrito de
  compra. Use sesiones persistentes para trabajo con estado.
- **Tratar la rotación como "anonimato ético"**: la rotación le oculta *a
  usted* del objetivo, pero no convierte un scraping dañino en ético. Los
  términos de servicio, los derechos de autor, la legislación de privacidad
  y la ética de la limitación de velocidad siguen aplicándose igual.
- **Usar proxies residenciales para actividad de alto riesgo**: credential
  stuffing, bots para zapatillas, pirateo geográfico de streaming, fraude —
  explícitamente fuera del alcance de esta habilidad. Si su caso de uso
  tiene esta pinta, deténgase.
- **Ignorar `robots.txt` porque "ahora tenemos rotación"**: la rotación no
  otorga permiso. La directiva sigue siendo la directiva.
- **Sin interruptor de emergencia**: un bucle sin supervisión sobre un pool
  de proxies medido se convierte en una factura de cuatro cifras de un día
  para otro. Ponga siempre topes a peticiones, duración y fallos.
- **Elegir un pool residencial con consentimiento opaco**: algunos
  proveedores obtienen los nodos de salida de EULAs de "VPN gratuitas" que
  los usuarios reales nunca leen. Pague la prima por un modelo de
  consentimiento auditado y opt-in.

## Habilidades relacionadas

- [headless-web-scraping](../headless-web-scraping/SKILL.md) — habilidad
  principal; empiece siempre por ahí. Use esta habilidad solo como
  escalado.
- [use-graphql-api](../use-graphql-api/SKILL.md) — prefiera las APIs
  oficiales al scraping cuando exista alguna.
- [deploy-searxng](../deploy-searxng/SKILL.md) — una búsqueda auto-alojada
  evita por completo hacer scraping de motores de búsqueda.
- [configure-reverse-proxy](../configure-reverse-proxy/SKILL.md) — sentido
  opuesto en la red (servir en lugar de obtener), referencia útil como
  vecino.
- [security-audit-codebase](../security-audit-codebase/SKILL.md) — ejecútela
  después de integrar credenciales para confirmar que ninguna se ha filtrado
  al repositorio.

<!-- Keep under 500 lines. Extract large examples to references/EXAMPLES.md if needed. -->
