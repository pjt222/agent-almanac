---
name: du-dum
description: >
  Separate expensive observation from cheap decision-making in autonomous agent
  loops using a two-clock architecture. A fast clock accumulates data into a
  digest file; a slow clock reads the digest and acts only when something is
  pending. Idle cycles cost nothing because the action clock returns immediately
  after reading an empty digest. Use when building autonomous agents that must
  observe continuously but can only afford to act occasionally, when API or LLM
  costs dominate and most cycles have nothing to do, when designing cron-based
  agent architectures with observation and action phases, or when an existing
  heartbeat loop is too expensive because it calls the LLM on every tick.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: autonomous-agents, cost-optimization, two-clock, digest, heartbeat, batch-then-act, cron
  locale: es
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Du-Dum: Patrón Batch-Then-Act

Separar observación de acción usando dos relojes corriendo a frecuencias diferentes. El reloj rápido (análisis) recolecta datos de manera barata y escribe un digest compacto. El reloj lento (acción) lee el digest y decide si actuar. Si el digest dice que nada está pendiente, el reloj de acción sale inmediatamente -- costo cero para ciclos inactivos.

El nombre viene del ritmo del latido: du-dum, du-dum. El primer beat (du) observa; el segundo beat (dum) actúa. La mayor parte del tiempo, solo dispara el primer beat.

## Cuándo Usar

- Construir agentes autónomos que corren con un presupuesto y deben observar más a menudo de lo que actúan
- Un loop de heartbeat existente llama al LLM en cada tick, incluso cuando nada ha cambiado
- La observación es barata (lecturas de API, parseo de archivos, escaneo de logs) pero la acción es cara (llamadas LLM, operaciones de escritura, notificaciones)
- Necesitas fallo desacoplado: si la observación falla, el último digest bueno aún debe ser válido para el reloj de acción
- Diseñar arquitecturas de agentes basadas en cron donde análisis y acción corren como jobs separados

## Entradas

- **Requerido**: Lista de fuentes de datos que el reloj rápido debe observar (APIs, archivos, logs, feeds)
- **Requerido**: Acción que el reloj lento debe tomar cuando el digest indica trabajo pendiente
- **Opcional**: Intervalo del reloj rápido (predeterminado: cada 4 horas)
- **Opcional**: Intervalo del reloj lento (predeterminado: una vez por día)
- **Opcional**: Techo de costo por día (para validar la configuración del reloj)
- **Opcional**: Preferencia de formato del digest (markdown, JSON, YAML)

## Procedimiento

### Paso 1: Identificar los Dos Relojes

Separar todo el trabajo en observación (barata, frecuente) y acción (cara, rara).

1. Listar cada operación en el loop actual o flujo de trabajo planeado
2. Clasificar cada una como observación (lee datos, produce resumen) o acción (llama LLM, escribe salida, envía mensajes)
3. Verificar la división: las observaciones deben tener costo marginal cero o casi cero; las acciones deben ser las operaciones caras
4. Asignar frecuencias: el reloj rápido corre lo suficientemente a menudo para captar eventos; el reloj lento corre lo suficientemente a menudo para cumplir requisitos de tiempo de respuesta

| Reloj | Perfil de costo | Frecuencia | Ejemplo |
|-------|-------------|-----------|---------|
| Rápido (análisis) | Barato: lecturas API, parseo de archivos, sin LLM | 4-6x/día | Escanear notificaciones GitHub, parsear RSS, leer logs |
| Lento (acción) | Caro: inferencia LLM, operaciones de escritura | 1x/día | Componer respuesta, actualizar dashboard, enviar alertas |

**Esperado:** Una división clara de dos columnas donde cada operación se asigna a exactamente un reloj. El reloj rápido no tiene llamadas LLM; el reloj lento no tiene recolección de datos.

**En caso de fallo:** Si una operación necesita tanto lectura como inferencia LLM (p. ej., "resumir nuevas issues"), dividirla: el reloj rápido recolecta las issues crudas en el digest; el reloj lento las resume. El digest es la frontera.

### Paso 2: Diseñar el Formato del Digest

El digest es el mensaje de bajo ancho de banda que une los dos relojes. Debe ser compacto, legible para humanos y parseable por máquina.

1. Definir la ruta del archivo digest y el formato (markdown recomendado para depuración humana)
2. Incluir un encabezado con timestamp y metadatos de fuente
3. Definir una sección "pending" listando items que requieren acción
4. Definir una sección "status" con el estado actual (para dashboards o logging)
5. Incluir un indicador claro de estado vacío (p. ej., `pending: none` o sección vacía)

Estructura de digest de ejemplo:

```markdown
# Digest — 2026-03-22T06:30:00Z

## Pending

- PR #42 needs review response (opened 2h ago, author requested feedback)
- Issue #99 has new comment from maintainer (action: reply)

## Status

- Last analyzed: 2026-03-22T06:30:00Z
- Sources checked: github-notifications, rss-feed, error-log
- Items scanned: 14
- Items pending: 2
```

Cuando nada está pendiente:

```markdown
# Digest — 2026-03-22T06:30:00Z

## Pending

(none)

## Status

- Last analyzed: 2026-03-22T06:30:00Z
- Sources checked: github-notifications, rss-feed, error-log
- Items scanned: 8
- Items pending: 0
```

**Esperado:** Una plantilla de digest con estados pending/empty claros. El reloj de acción puede determinar si proceder verificando un solo campo o sección.

**En caso de fallo:** Si el digest crece demasiado (>50 líneas), el reloj rápido está incluyendo demasiados datos crudos. Mover detalles a un archivo de datos separado y mantener el digest como un resumen con punteros.

### Paso 3: Implementar el Reloj Rápido (Análisis)

Construir los scripts de observación que corren en el calendario rápido.

1. Crear un script por fuente de datos (mantiene los fallos independientes)
2. Cada script lee su fuente, extrae eventos relevantes y añade o reescribe el digest
3. Usar file locking o escrituras atómicas para prevenir digests parciales
4. Loggear la ejecución de análisis (timestamp, items encontrados, errores) a un archivo de log separado
5. Nunca llamar al LLM o realizar operaciones de escritura más allá de actualizar el digest

```
# Pseudocode: analyze-notifications.sh
fetch_notifications()
filter_actionable(notifications)
format_as_digest_entries(filtered)
atomic_write(digest_path, entries)
log("analyzed {count} notifications, {pending} actionable")
```

Ejemplo de calendario (cron):
```
# Fast clock: analyze every 4 hours
30 */4 * * *  /path/to/analyze-notifications.sh >> /var/log/analysis.log 2>&1
0  6   * * *  /path/to/analyze-pr-status.sh     >> /var/log/analysis.log 2>&1
```

**Esperado:** Uno o más scripts de análisis, cada uno produciendo o actualizando el archivo digest. Los scripts corren independientemente -- si uno falla, los otros aún actualizan sus secciones.

**En caso de fallo:** Si una fuente de datos está temporalmente no disponible, el script debe loggear el error y dejar las entradas previas del digest intactas. No limpiar el digest en fallo de fuente -- datos obsoletos son mejores que datos faltantes para el reloj de acción.

### Paso 4: Implementar el Reloj Lento (Acción)

Construir el script de acción que lee el digest y decide si actuar.

1. Leer el archivo digest (Paso 0 de cada ciclo de acción)
2. Verificar la sección pending: si está vacía o "none", salir inmediatamente con una entrada de log
3. Si hay items pendientes, invocar la operación cara (llamada LLM, composición de mensaje, etc.)
4. Después de actuar, limpiar o archivar las entradas de digest procesadas
5. Loggear la ejecución de acción (items procesados, costo, duración)

```
# Pseudocode: heartbeat.sh (the slow clock)
digest = read_file(digest_path)

if digest.pending is empty:
    log("heartbeat: nothing pending, exiting")
    exit(0)

# Only reaches here if work exists
response = call_llm(digest.pending, system_prompt)
execute_actions(response)
archive_digest(digest_path)
log("heartbeat: processed {count} items, cost: {tokens} tokens")
```

Ejemplo de calendario (cron):
```
# Slow clock: act once per day at 7am
0 7 * * *  /path/to/heartbeat.sh >> /var/log/heartbeat.log 2>&1
```

**Esperado:** El script de acción sale en menos de 1 segundo en ciclos inactivos (solo una lectura de archivo y verificación vacía). En ciclos activos, procesa items pendientes y limpia el digest.

**En caso de fallo:** Si la llamada LLM falla, no limpiar el digest. Los items pendientes permanecen para el siguiente ciclo de acción. Considerar implementar un contador de reintentos en el digest para evitar reintentos infinitos en items que fallan permanentemente.

### Paso 5: Configurar Detección de Inactividad

Los ahorros de costo vienen de la detección de inactividad -- el reloj de acción debe distinguir confiablemente "nada que hacer" de "algo que hacer" con sobrecarga mínima.

1. Definir la verificación de inactividad como una operación única y rápida (lectura de archivo + verificación de string)
2. Verificar que el camino inactivo tenga cero llamadas externas (sin API, sin LLM, sin red)
3. Medir la duración del camino inactivo -- debe estar bajo 1 segundo
4. Loggear ciclos inactivos diferentemente de ciclos activos para monitoreo

```bash
# Minimal idle check
if grep -q "^(none)$" "$DIGEST_PATH" || grep -q "pending: 0" "$DIGEST_PATH"; then
    echo "$(date -u +%FT%TZ) heartbeat: idle" >> "$LOG_PATH"
    exit 0
fi
```

**Esperado:** El camino inactivo es una sola lectura de archivo seguida de una coincidencia de string. Sin llamadas de red, sin spawning de procesos más allá del script mismo.

**En caso de fallo:** Si la verificación de inactividad no es confiable (falsos positivos causando trabajo perdido, o falsos negativos causando llamadas LLM innecesarias), simplificar el formato del digest. Un solo campo booleano (`has_pending: true/false`) en la parte superior del archivo es el enfoque más confiable.

### Paso 6: Validar el Modelo de Costo

Calcular el costo esperado para confirmar que la arquitectura de dos relojes entrega ahorros.

1. Contar ejecuciones del reloj rápido por día: `fast_runs = 24 / fast_interval_hours`
2. Contar ejecuciones del reloj lento por día: típicamente 1
3. Calcular costo de observación: `fast_runs * cost_per_analysis_run` (debe ser ~$0 si no hay LLM)
4. Calcular costo de acción: `active_days_fraction * cost_per_action_run`
5. Calcular costo de inactividad: `(1 - active_days_fraction) * cost_per_idle_check` (debe ser ~$0)
6. Comparar con el costo del loop único original

Comparación de costos de ejemplo:

| Arquitectura | Costo diario (activo) | Costo diario (inactivo) | Costo mensual (80% inactivo) |
|-------------|--------------------|--------------------|------------------------|
| Loop único (LLM cada 30min) | $13.74/37h | $13.74/37h | ~$400 |
| Du-dum (6 análisis + 1 acción) | $0.30 | $0.00 | ~$6 |

**Esperado:** Un modelo de costo que muestra que la arquitectura du-dum es más barata que la original por al menos 10x en días inactivos.

**En caso de fallo:** Si el modelo de costo no muestra ahorros significativos, una de estas es probablemente cierta: (a) el reloj rápido es demasiado frecuente, (b) el reloj rápido incluye llamadas LLM ocultas, o (c) el sistema raramente está inactivo. Du-dum beneficia a sistemas con altos ratios de inactividad. Si el sistema siempre está activo, un enfoque de polling más simple puede ser más apropiado.

## Validación

- [ ] Los relojes rápido y lento están limpiamente separados sin llamadas LLM en el camino rápido
- [ ] El formato del digest tiene un indicador claro de estado vacío
- [ ] La detección de inactividad sale en menos de 1 segundo con cero llamadas externas
- [ ] El fallo del reloj rápido no corrompe el digest (datos obsoletos preservados)
- [ ] El fallo del reloj lento no limpia items pendientes (reintento en próximo ciclo)
- [ ] El modelo de costo muestra al menos 10x ahorros en días inactivos vs. arquitectura de loop único
- [ ] Ambos relojes loggean sus ejecuciones para monitoreo y depuración
- [ ] El digest no crece sin límite (entradas viejas archivadas o limpiadas después del procesamiento)

## Errores Comunes

- **Digest creciendo sin límite**: Si el reloj rápido añade pero el reloj lento nunca limpia, el digest se vuelve un log creciente. Siempre limpiar o archivar entradas procesadas después de que el ciclo de acción se complete.
- **Reloj rápido demasiado rápido**: Correr análisis cada 5 minutos cuando los eventos llegan diariamente desperdicia cuota de API y E/S de disco. Hacer coincidir la frecuencia del reloj rápido con la tasa real de eventos de tus fuentes de datos.
- **Reloj lento demasiado lento**: Si la ventana de acción es una vez por día pero los eventos necesitan respuesta en la misma hora, el reloj lento es demasiado lento. Aumentar su frecuencia o añadir un atajo de evento urgente que dispara acción inmediata.
- **Llamadas LLM en el reloj rápido**: Todo el modelo de costo se rompe si el reloj rápido incluye inferencia LLM. Auditar cada script del reloj rápido para confirmar cero llamadas LLM. Si se necesita resumen, diferirlo al reloj lento.
- **Acoplamiento de scripts del reloj rápido**: Si un script de análisis depende de la salida de otro, un fallo en el primero cascada. Mantener los scripts del reloj rápido independientes -- cada uno lee su propia fuente y escribe su propia sección del digest.
- **Logging silencioso de inactividad**: Si los ciclos inactivos no producen salida de log, no puedes distinguir "corriendo e inactivo" de "crasheado y no corriendo." Siempre loggear ciclos inactivos, incluso si solo es un timestamp.
- **Limpiar digest en fallo de análisis**: Si una fuente de datos está caída, no escribir un digest vacío. El reloj lento vería "nada pendiente" y saltaría trabajo que en realidad está pendiente. Preservar el último digest bueno en fallo.

## Habilidades Relacionadas

- `manage-token-budget` -- marco de control de costos que du-dum hace práctico; du-dum es el patrón arquitectónico, token budget es la capa de contabilidad
- `circuit-breaker-pattern` -- maneja el caso de fallo (herramientas rompiéndose); du-dum maneja el caso normal (nada que hacer). Usar juntos: du-dum para detección de inactividad, circuit-breaker para recuperación de fallo
- `observe` -- metodología de observación para el reloj rápido; du-dum estructura cuándo y cómo las observaciones se vuelven accionables vía el digest
- `forage-resources` -- capa de exploración estratégica; du-dum es el ritmo de ejecución dentro del cual forage-resources opera
- `coordinate-reasoning` -- patrones de señalización estigmérgica; el archivo digest es una forma de estigmergia (coordinación indirecta a través de artefactos ambientales)
