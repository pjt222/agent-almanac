---
name: conduct-empirical-wire-capture
description: >
  Captura HTTP saliente y telemetría de un arnés de CLI en tiempo de ejecución.
  Cubre la selección del canal de captura (archivo de transcripción vs stderr
  de verbose-fetch vs proxy saliente vs estado en disco), captura por evento
  mediante hooks vs captura de sesión de larga duración, formato de salida
  JSONL para artefactos comparables mediante diff, y la tabla de observabilidad
  que asigna cada objetivo al canal más barato que lo captura. Úselo cuando un
  hallazgo estático necesite confirmación en tiempo de ejecución, cuando se
  requiera la forma de un payload para reimplementar un cliente, o cuando la
  desambiguación dark-vs-live requiera observar lo que el binario realmente
  envía.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, wire-capture, http, telemetry, jsonl, observability
  locale: es
  source_locale: en
  source_commit: f74b59bd
  translator: claude-sonnet-4-6
  translation_date: "2026-04-17"
---

# Realizar Captura Empírica de Tráfico de Red

Configure un arnés de captura de tráfico de red reproducible para el HTTP saliente y la telemetría de una herramienta CLI, asignando cada objetivo de observabilidad al canal más barato que lo capture.

## Alcance y ética

Lea esto antes de configurar cualquier captura.

- La captura de tráfico es para **sus propias** solicitudes contra **su propia** cuenta, en **su propia** máquina. Capturar tráfico de otros usuarios es exfiltración, no investigación, y queda fuera de alcance.
- Las credenciales aparecen casi siempre en la salida bruta de red. Redacte en el momento de la captura (Paso 6) — nunca "capture ahora, redacte después".
- La captura es *observación*, no modificación. No utilice los payloads capturados para eludir los límites de tasa del servidor, reproducir la sesión de otro usuario o activar una capacidad lanzada en modo dark sin autorización.
- La salida de esta skill es un artefacto interno. La publicación pública de hallazgos de tráfico pasa por `redact-for-public-disclosure` (Fase 5 de la guía padre), no por esta skill.

## Cuándo usar

- Un hallazgo estático (un flag, una referencia a un endpoint, el nombre de un evento de telemetría) necesita confirmación en tiempo de ejecución de que realmente se dispara.
- Se necesita la forma de un payload para reimplementar un cliente, instrumentar trazas o hacer un diff entre versiones.
- La desambiguación dark-vs-live requiere observar lo que el binario realmente envía, no lo que el bundle sugiere que podría enviar.
- Un comportamiento cambió silenciosamente entre versiones y se desea un artefacto reproducible para comparar contra futuras versiones.

**No** use esta skill para: establecer línea base de versiones (use `monitor-binary-version-baselines`), sondeo del estado de flags (use `probe-feature-flag-state`), o preparar artefactos redactados para publicación pública (use `redact-for-public-disclosure`).

## Entradas

- **Requerido**: Un binario de arnés CLI que pueda ejecutar localmente contra su propia cuenta.
- **Requerido**: Una pregunta específica a responder (p. ej., "¿el endpoint X se dispara en el evento Y?", "¿cuál es la forma del payload para el evento de telemetría Z?"). Una captura sin pregunta produce un registro que nadie lee.
- **Opcional**: Hallazgos estáticos de fases previas (catálogo de marcadores, lista de flags candidatos, endpoints sospechosos) que acotan los objetivos de captura.
- **Opcional**: Una ruta de espacio de trabajo privado para los artefactos de captura. Por defecto `./captures/` — debe estar en `.gitignore`.

## Procedimiento

### Paso 1: Construya primero la tabla de observabilidad

Antes de configurar cualquier captura, enumere las preguntas que necesita responder y asigne cada una a un canal de captura. Una fila por objetivo.

| objetivo | observable mediante | bloqueador |
|---|---|---|
| HTTP saliente al endpoint X | stderr de verbose-fetch | el ruido de la TUI contamina la terminal |
| Evento de telemetría Y al actuar el usuario | subproceso impulsado por hook | requiere superficie de hooks del arnés |
| Handshake de refresh de token | proxy HTTP saliente | requiere confianza del certificado |
| Evento de ciclo de vida de tarea programada | captura de sesión de larga duración | alineación de reloj |
| Mutación de configuración local | diff de estado en disco | ninguno — canal más barato |

Canales comunes, del más barato al más caro:

- **Mutación del archivo de estado en disco** — cuando el arnés escribe su estado en una ruta conocida, `diff` entre snapshots es gratis.
- **Archivo de transcripción** — cuando el arnés ya escribe una transcripción de sesión, parséela directamente. Sin instrumentación.
- **stderr de verbose-fetch** — variable de entorno provista por el empaquetador (p. ej., `BUN_CONFIG_VERBOSE_FETCH=curl` de bun) enruta cada fetch a stderr. Ruidoso pero captura cada fetch.
- **Subproceso impulsado por hook** — cuando el arnés expone hooks de ciclo de vida (`UserPromptSubmit`, `Stop`, etc.), lance un subproceso corto de captura por evento.
- **Captura de sesión de larga duración** — un proceso a lo largo de una sesión, con marca de reloj. Úselo para secuencias.
- **Proxy HTTP saliente** — separación limpia, pero requiere confianza del CA y se rompe cuando el arnés fija los certificados.

Elija el canal más barato que capture el objetivo. Una captura de 3 objetivos que responde a una pregunta específica vale más que una captura de 20 objetivos que no responde a ninguna.

**Expected:** una tabla de observabilidad con una fila por pregunta, cada una anotada con el canal y los bloqueadores conocidos. Los objetivos sin canal viable se marcan como "fuera de alcance en esta sesión".

**On failure:** si cada objetivo cae en la columna del proxy, la tabla es demasiado ambiciosa. Recorte a la una o dos preguntas de mayor valor y reconsidere los canales de menor costo para ellas.

### Paso 2: Prepare un espacio de trabajo desechable

La captura de tráfico contamina terminales, deja archivos en lugares inesperados y puede filtrar credenciales a los registros.

```bash
mkdir -p captures/$(date -u +%Y-%m-%dT%H-%M-%S)
cd captures/$(date -u +%Y-%m-%dT%H-%M-%S)
echo 'captures/' >> ../../.gitignore
git check-ignore captures/ || echo "WARNING: captures/ not git-ignored"
```

Confirme que la sesión de captura no es su sesión principal de trabajo — verbose-fetch y el renderizado de TUI se interfieren mutuamente.

**Expected:** un directorio de captura con marca de tiempo, ignorado por git, separado de su sesión de trabajo.

**On failure:** si `git check-ignore` informa que el directorio no está ignorado, corrija `.gitignore` antes de ejecutar cualquier comando de captura. No proceda con credenciales en riesgo.

### Paso 3: Captura por evento impulsada por hook

Cuando el objetivo es un evento discreto (una invocación de herramienta, el envío de un prompt, la parada de una sesión), use la superficie de hooks del arnés. Lance un subproceso de captura de corta vida por evento; no permanezca en el proceso.

El patrón (ejemplo sintético):

```bash
# Hook script, registered with the harness's hook config.
# Invoked once per event; writes one JSONL line; exits.
#!/usr/bin/env bash
set -euo pipefail
TS=$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)
EVENT="${1:-unknown}"
PAYLOAD=$(jq -c --arg ts "$TS" --arg ev "$EVENT" \
  '{ts:$ts, source:"hook", target:$ev, payload:.}' < /dev/stdin)
echo "$PAYLOAD" >> "$CAPTURE_DIR/events.jsonl"
```

Por qué subproceso-por-evento:

- Sin estado de token, sin acoplamiento de sesión — cada invocación es independiente.
- El fallo de una captura no contamina la siguiente.
- El sobrecoste del subproceso es aceptable porque los eventos son escasos (por acción de usuario, no por byte).

**Expected:** una línea JSONL por cada evento disparado en `events.jsonl`, cada una como JSON bien formado parseable con `jq`.

**On failure:** si `jq` reporta errores de parseo, el payload contiene caracteres de control sin escapar o datos binarios — canalice a través de `jq -R` (entrada cruda) y codifique el campo payload en base64 en su lugar.

### Paso 4: Captura de sesión de larga duración para estado secuencial

Cuando el objetivo es una secuencia (handshake multi-turno, ciclo de vida de tarea programada, máquina de estado de reintentos/backoff), un proceso de captura a lo largo de la sesión, con marca de reloj.

```bash
# Run the harness with verbose-fetch routed to a tee-d log.
BUN_CONFIG_VERBOSE_FETCH=curl harness-cli run-task 2> >(
  while IFS= read -r line; do
    printf '%s\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" "$line"
  done >> "$CAPTURE_DIR/session.tsv"
)
```

El prefijo de reloj hace inequívoco el orden cuando varias capturas corren concurrentemente. TSV (separado por tabulaciones) es intencional — sobrevive a shells que manglean el entrecomillado de JSON en stderr.

Convierta TSV a JSONL después de que termine la sesión (Paso 5), no durante.

**Expected:** un registro TSV con marcas de tiempo monótonamente crecientes, una línea de stderr por fila.

**On failure:** si las marcas de tiempo retroceden, el arnés está bufferizando stderr — reejecute con `stdbuf -oL -eL` o el flag equivalente de buffer por línea del empaquetador.

### Paso 5: Normalice a JSONL

JSONL es el formato del artefacto: un objeto JSON por línea, campos `timestamp`, `source`, `target`, `payload`. Amigable para diff, filtrable con `jq` y estable ante recargas del editor.

```bash
# Parse the TSV from Step 4 into JSONL.
awk -F'\t' '{
  printf "{\"timestamp\":\"%s\",\"source\":\"verbose-fetch\",\"target\":\"%s\",\"payload\":%s}\n",
    $1, "session", $2
}' < session.tsv | jq -c . > session.jsonl
```

Valide que cada línea parsea:

```bash
while IFS= read -r line; do
  echo "$line" | jq -e . > /dev/null || echo "BAD LINE: $line"
done < session.jsonl
```

Uso típico de filtros:

```bash
# Show only requests to a specific endpoint pattern.
jq -c 'select(.payload | tostring | test("/api/v1/example"))' session.jsonl

# Show timing between consecutive captures.
jq -r '.timestamp' session.jsonl | sort | uniq -c
```

**Expected:** cada línea de `*.jsonl` parsea con `jq -e .`; sin advertencias `BAD LINE`.

**On failure:** si algunas líneas fallan la validación, el TSV fuente tenía tabulaciones incrustadas en el payload — reejecute el Paso 4 con un delimitador distinto o codifique el segundo campo en base64.

### Paso 6: Redacte en el momento de la captura

Elimine cabeceras de auth, IDs de sesión, tokens bearer y PII **antes** de escribir a disco. Los archivos `events.jsonl` y `session.jsonl` no deben, en su primera escritura, contener ni un solo secreto.

```bash
# Stream the raw capture through a redactor before persisting.
redact() {
  sed -E \
    -e 's/(authorization:[[:space:]]*Bearer[[:space:]]+)[A-Za-z0-9._-]+/\1<REDACTED>/gi' \
    -e 's/(x-api-key:[[:space:]]*)[A-Za-z0-9._-]+/\1<REDACTED>/gi' \
    -e 's/(cookie:[[:space:]]*)[^;]+/\1<REDACTED>/gi' \
    -e 's/("password"[[:space:]]*:[[:space:]]*)"[^"]*"/\1"<REDACTED>"/g' \
    -e 's/("token"[[:space:]]*:[[:space:]]*)"[^"]*"/\1"<REDACTED>"/g'
}

cat raw-capture.txt | redact > session.tsv
```

Después de la captura, verifique que nada se coló:

```bash
# Patterns that must not appear in any *.jsonl file.
grep -Ei 'bearer [A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}' captures/ \
  && { echo "LEAK DETECTED"; exit 1; } \
  || echo "redaction clean"
```

El artefacto `capturado-luego-redactado` siempre filtra algo. El único patrón seguro es `redactado-al-capturar`. Si descubre un token sin redactar en un artefacto finalizado, trate toda la captura como comprometida — elimínela, rote la credencial y reejecute.

**Expected:** la verificación `LEAK DETECTED` sale con 0 (sin coincidencias). `grep` para prefijos de credenciales conocidas no devuelve nada.

**On failure:** si la verificación de fugas encuentra un hit, no edite el archivo en su sitio. Borre todo el directorio de captura, extienda la regex del redactor para cubrir la categoría del patrón filtrado y reejecute desde el Paso 3 o 4.

### Paso 7: Clasifique categorías de respuesta antes de registrar

Los códigos de estado HTTP tienen distinto peso semántico en distintos contextos. Clasifique antes de registrar para que los filtros `jq` aguas abajo operen sobre la intención, no sobre el código bruto.

| Estado observado | Contexto del canal | Clasificación |
|---|---|---|
| 200 / 201 | Cualquiera | éxito |
| 401 en endpoint de refresh de token | Handshake | paso de handshake esperado |
| 401 en endpoint de datos | Tras autenticación | fallo de auth (real) |
| 404 en recurso cargado perezosamente | Primera captura | miss esperado |
| 404 en endpoint documentado | Tras gate de función | ausencia inducida por el gate |
| 429 | Cualquiera | límite de tasa (retroceda; no reintente ajustado) |
| 5xx | Cualquiera | fallo de servidor (registre, no asuma) |

Añada un campo `class` en el momento de la captura:

```bash
jq -c '. + {class: (
  if (.payload.status == 401 and (.target | test("token|refresh"))) then "handshake"
  elif (.payload.status >= 200 and .payload.status < 300) then "success"
  elif (.payload.status == 401) then "auth-fail"
  elif (.payload.status == 429) then "rate-limit"
  elif (.payload.status >= 500) then "server-fail"
  else "other" end)}' session.jsonl > session.classified.jsonl
```

Un 401 en un canal de refresh de token no es un fallo — es la primera mitad de un handshake. Clasificar mal los pasos de handshake como fallos produce hallazgos falsos positivos que desperdician la atención del revisor.

**Expected:** cada línea en `*.classified.jsonl` tiene un campo `class` con un valor conocido.

**On failure:** si la clasificación produce muchas entradas `other`, la tabla anterior está incompleta para este arnés — extiéndala con una fila por cada patrón `other` recurrente antes de continuar el análisis.

### Paso 8: Persista el manifiesto de captura

Una ejecución de captura solo es reproducible si las entradas se registran junto a las salidas. Escriba un manifiesto:

```bash
cat > capture-manifest.json <<EOF
{
  "captured_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "harness_version": "$(harness-cli --version 2>/dev/null || echo unknown)",
  "channel": "verbose-fetch",
  "question": "Does endpoint X fire on event Y?",
  "targets": ["endpoint-X", "event-Y"],
  "files": ["session.jsonl", "session.classified.jsonl"],
  "redaction_check": "passed"
}
EOF
```

El manifiesto es lo que hace la captura diff-able contra futuras versiones.

**Expected:** `capture-manifest.json` existe, parsea con `jq` y lista todos los archivos de artefacto del directorio de captura.

**On failure:** si el arnés no tiene un flag de versión, registre el `sha256sum` del binario en su lugar. Un binario no identificado produce capturas incomparables.

## Validación

- [ ] La tabla de observabilidad se construyó antes de ejecutar cualquier comando de captura
- [ ] El directorio de captura está ignorado por git y con marca de tiempo
- [ ] Cada archivo `*.jsonl` parsea con `jq -e .` línea por línea
- [ ] La verificación de fugas tras la redacción no devuelve coincidencias para prefijos de credenciales conocidas
- [ ] Cada evento capturado tiene un campo `class` con valor conocido
- [ ] `capture-manifest.json` registra la versión del arnés (o sha256), el canal y la pregunta
- [ ] El directorio de captura contiene solo los objetivos enumerados en el Paso 1 (sin tráfico incidental de otras apps)

## Errores comunes

- **Capturar primero, preguntar después**: un registro que nadie lee es disco y atención desperdiciados. Construya la tabla de observabilidad primero; capture solo lo que responda a una pregunta específica.
- **Recurrir primero a `mitmproxy`**: el proxy saliente es el canal más invasivo. Requiere confianza del certificado, se rompe con certificate pinning y contamina el entorno del arnés. Úselo solo cuando los canales en disco, transcripción, verbose-fetch y hooks estén todos bloqueados.
- **Capturar en su sesión principal de trabajo**: el stderr de verbose-fetch se filtra al renderizado de la TUI y puede filtrar fragmentos de su otro trabajo a la captura. Use siempre una shell desechable.
- **"Ya redactaremos después"**: cada artefacto capturado-luego-redactado ha filtrado al menos una credencial alguna vez. Redacte en el momento de la captura o no capture.
- **Tratar 4xx como fallo de forma uniforme**: un 401 en un canal de refresh de token es un paso de handshake, no un fallo. Clasifique categorías de respuesta por contexto del canal (Paso 7) antes de sacar conclusiones.
- **Captura de larga duración para objetivos por evento**: un proceso de toda la sesión para capturar tres eventos discretos acopla el estado del token entre capturas y hace que un evento malo envenene al siguiente. Use subprocesos impulsados por hook para eventos; reserve la captura de sesión para secuencias.
- **Sin manifiesto**: un archivo JSONL sin `capture-manifest.json` no es reproducible — no puede hacer diff contra el binario del mes que viene si no sabe qué versión lo produjo.
- **Capturar tráfico de otros usuarios**: fuera de alcance. La captura de tráfico es para su propia cuenta en su propia máquina. Si una captura registra incidentalmente la solicitud de otro usuario, elimine la captura y ajuste el canal.

## Skills relacionadas

- `monitor-binary-version-baselines` — Fase 1 de la metodología padre; produce la línea base de versión a la que hace referencia el manifiesto de esta skill.
- `probe-feature-flag-state` — Fases 2-3; la captura de tráfico es una de sus vías de evidencia, y esta skill enseña la mitad relativa a la captura.
- `instrument-distributed-tracing` — comparte la filosofía de JSONL-sobre-reloj; aplicada aquí a un único binario en vez de a una malla de servicios.
- `redact-for-public-disclosure` — Fase 5; esta skill solo cubre la redacción en el momento de la captura para uso interno, no la redacción de nivel de publicación necesaria antes de que cualquier captura deje un espacio de trabajo privado.
