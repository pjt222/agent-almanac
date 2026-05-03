---
name: manage-engagement-buffer
description: >
  Manage an engagement buffer that ingests, prioritizes, rate-limits,
  deduplicates, and tracks state for incoming engagement items across
  platforms. Generates periodic digests and enforces cooldown periods.
  Composes with du-dum: du-dum sets the observation/action cadence,
  this skill manages the queue between beats.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: engagement, buffer, queue, rate-limiting, deduplication, digest, cooldown, autonomous-agents
  locale: es
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Manage Engagement Buffer

Ingerir, deduplicar, priorizar y limitar la tasa de items entrantes de engagement entre plataformas, luego entregar un digest compacto al reloj de acción. El buffer se sienta entre las señales crudas de plataforma y la acción deliberada: absorbe ráfagas, fusiona duplicados, hace cumplir cooldowns y asegura que el agente actúa en los items de mayor valor primero. Sin un buffer, un agente autónomo o procesa items en orden de llegada (perdiendo los urgentes enterrados en ruido) o intenta todo a la vez (alcanzando límites de tasa y pareciendo spammer).

Esta habilidad compone con `du-dum`: du-dum decide *cuándo* observar y actuar; esta habilidad decide *qué* merece acción. El buffer es la cola que acumula entre los beats de du-dum.

## Cuándo Usar

- Un agente autónomo recibe más engagement del que puede procesar por ciclo
- Items duplicados o casi-duplicados desperdician el presupuesto de acción
- El engagement necesita ordenamiento por prioridad antes de que el reloj de acción dispare
- Se necesitan períodos de cooldown para prevenir over-engagement o rate limiting
- Múltiples fuentes de plataforma (GitHub, Slack, email) alimentan en un solo loop de acción del agente

## Entradas

- **Requerido**: `buffer_path` — ruta al archivo buffer JSONL
- **Opcional**: `platform_config` — límites de tasa por plataforma y configuraciones de cooldown
- **Opcional**: `digest_size` — número de items top en el digest (predeterminado: 5)
- **Opcional**: `ttl_hours` — tiempo de vida para items no actuados (predeterminado: 48)
- **Opcional**: `cooldown_minutes` — cooldown por hilo después de la acción (predeterminado: 60)

## Procedimiento

### Paso 1: Definir el Schema del Buffer

Diseñar la estructura del item de engagement. Cada item en el buffer es una sola línea JSON con estos campos:

```json
{
  "id": "gh-notif-20260408-001",
  "source": "github:pjt222/agent-almanac",
  "timestamp": "2026-04-08T09:15:00Z",
  "content_summary": "PR #218 review requested by contributor",
  "priority": 4,
  "state": "new",
  "dedup_key": "github:pjt222/agent-almanac:pr-218:contributor-name",
  "thread_id": "pr-218",
  "ttl_hours": 48
}
```

Definiciones de campos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único (prefijo de fuente + fecha + secuencia) |
| `source` | string | Plataforma y canal (`github:repo`, `slack:channel`, `email:inbox`) |
| `timestamp` | ISO 8601 | Cuándo se ingirió el item |
| `content_summary` | string | Descripción de una línea del item de engagement |
| `priority` | int 1-5 | Prioridad compuesta (ver Paso 4) |
| `state` | enum | `new`, `acknowledged`, `acted`, `cooldown`, `merged`, `expired` |
| `dedup_key` | string | Clave compuesta: source + thread + author |
| `thread_id` | string | Identificador del hilo de conversación para rastreo de cooldown |
| `ttl_hours` | int | Horas hasta que el item expire si no es actuado (predeterminado: 48) |

Almacenar como un archivo JSON Lines (un objeto JSON por línea). Este formato soporta escrituras append-only, procesamiento línea-por-línea y poda fácil reescribiendo sin las líneas expiradas.

**Esperado:** Un archivo buffer JSONL inicializado en `buffer_path` con el schema documentado en un comentario o encabezado complementario. El schema es lo suficientemente estable para soportar todos los pasos descendentes.

**En caso de fallo:** Si el archivo buffer no se puede crear (permisos, problemas de ruta), recurrir a una lista en memoria para el ciclo actual y loggear el error de sistema de archivos. No descartar items silenciosamente — bufferarlos en algún lado, incluso temporalmente.

### Paso 2: Implementar la Ingestión

Aceptar items de adaptadores de plataforma y añadirlos al buffer con asignaciones iniciales de prioridad.

Asignación de prioridad por tipo de item:

| Tipo | Prioridad | Razón |
|------|----------|-----------|
| Mención directa (@agent) | 5 | Alguien pidió atención explícitamente |
| Solicitud de revisión | 4 | Bloqueando el trabajo de alguien más |
| Reply en hilo rastreado | 3 | Conversación activa en la que el agente participa |
| Notificación (asignado, suscrito) | 2 | Informativo, puede requerir acción |
| Broadcast (release, anuncio) | 1 | Solo conciencia, raramente accionable |

Para cada item entrante:

1. Construir el JSON del item con campos del schema
2. Asignar prioridad inicial basada en la tabla de tipos arriba
3. Establecer `state` a `new`
4. Establecer `timestamp` al tiempo UTC actual
5. Generar `dedup_key` desde source + thread + author
6. Añadir la línea JSON al archivo buffer

```
# Pseudocode: ingest from GitHub adapter
for notification in github_adapter.fetch():
    item = build_item(notification)
    item.priority = priority_by_type(notification.reason)
    item.state = "new"
    append_jsonl(buffer_path, item)
    log("ingested {item.id} priority={item.priority}")
```

**Esperado:** Items nuevos aparecen en el archivo buffer con prioridades correctas y `state=new`. Cada adaptador produce items bien formados independientemente — los fallos del adaptador no bloquean otros adaptadores.

**En caso de fallo:** Si un adaptador de plataforma falla (auth expiró, rate limited, red caída), loggear el fallo y saltar esa fuente para este ciclo. No limpiar items existentes del buffer — items obsoletos de un fetch exitoso anterior son mejores que un buffer vacío.

### Paso 3: Deduplicar

Escanear el buffer por items que comparten el mismo `dedup_key` dentro de una ventana configurable (predeterminado: 24 horas). Mantener la instancia de mayor prioridad y marcar las otras como merged.

1. Agrupar items por `dedup_key`
2. Dentro de cada grupo, ordenar por prioridad descendente, luego timestamp descendente
3. Mantener el primer item (mayor prioridad, más reciente); marcar el resto como `state=merged`
4. Detectar ráfagas de hilo: mismo `thread_id` con diferentes autores dentro de 1 hora indica una ráfaga de actividad — consolidar en un solo item con un conteo de participantes añadido a `content_summary`

```
# Dedup logic
groups = group_by(buffer, "dedup_key", window_hours=24)
for key, items in groups:
    if len(items) > 1:
        keeper = max(items, key=lambda i: (i.priority, i.timestamp))
        for item in items:
            if item.id != keeper.id:
                item.state = "merged"

# Thread burst detection
thread_groups = group_by(buffer, "thread_id", window_hours=1)
for thread_id, items in thread_groups:
    active_items = [i for i in items if i.state == "new"]
    if len(active_items) >= 3:
        keeper = max(active_items, key=lambda i: i.priority)
        keeper.content_summary += f" ({len(active_items)} participants)"
        for item in active_items:
            if item.id != keeper.id:
                item.state = "merged"
```

**Esperado:** El buffer no contiene entradas duplicadas de `dedup_key` dentro de la ventana. Las ráfagas de hilo se colapsan en items únicos con conteos de participantes. Los items merged permanecen en el archivo (para auditoría) pero son excluidos del procesamiento descendente.

**En caso de fallo:** Si la deduplicación produce merges inesperados (items distintos legítimos compartiendo una clave), estrechar la ventana de dedup o refinar la construcción de la clave. Añadir un hash de contenido al dedup key puede distinguir items que comparten source + thread + author pero tienen contenido genuinamente diferente.

### Paso 4: Priorizar

Re-ordenar el buffer por puntaje compuesto incorporando decaimiento por recencia y escalación.

Fórmula de puntaje compuesto:

```
score = base_priority * recency_weight * escalation_factor

recency_weight = 0.9 ^ hours_since_ingestion
escalation_factor = 1.0 + (resubmission_count * 0.2)

# Cap effective priority at 5
effective_priority = min(5, score)
```

Comportamiento:

- Un item de prioridad-3 ingerido hace 0 horas: `3 * 1.0 * 1.0 = 3.0`
- Un item de prioridad-3 ingerido hace 8 horas: `3 * 0.43 * 1.0 = 1.29` (decayó por debajo de items de prioridad-2)
- Un item de prioridad-2 reenviado dos veces: `2 * 1.0 * 1.4 = 2.8` (escalado cerca de prioridad-3)

Ordenar todos los items `state=new` por `effective_priority` descendente. Este orden ordenado es lo que el digest (Paso 6) presenta a du-dum.

**Esperado:** El buffer está ordenado por puntaje compuesto. Items frescos de alta prioridad están en el top. Items viejos han decaído. Items reenviados han escalado. Ningún item excede la prioridad 5.

**En caso de fallo:** Si la fórmula de puntaje produce rankings poco intuitivos (p. ej., un item de prioridad-2 de 1 hora rankea por encima de un item fresco de prioridad-3), ajustar la tasa de decaimiento. Un decaimiento de 0.95 por hora es más suave; 0.85 por hora es más agresivo. Sintonizar para que coincida con el tempo de engagement.

### Paso 5: Hacer Cumplir Límites de Tasa y Cooldowns

Prevenir que el agente sobre-engaje haciendo cumplir límites de escritura por plataforma y cooldowns por hilo.

**Límites de tasa por plataforma** (configurable vía `platform_config`):

| Plataforma | Límite predeterminado | Ventana |
|----------|--------------|--------|
| Comentarios GitHub | 1 por 20 segundos | rolling |
| Reviews GitHub | 3 por hora | rolling |
| Mensajes Slack | 1 por 10 segundos | rolling |
| Replies de email | 5 por hora | rolling |

**Cooldown por hilo:** Después de que el agente actúe en un hilo, ese hilo entra en cooldown por `cooldown_minutes` (predeterminado: 60). Durante el cooldown, los nuevos items para ese hilo son ingeridos pero no surgen en el digest.

**Backoff de error:** Al recibir una respuesta 429/rate-limit de cualquier plataforma, doblar el cooldown para esa plataforma. Resetear al predeterminado después de una acción exitosa.

```
# Rate limit check before action
def can_act(platform, thread_id):
    if rate_limit_exceeded(platform):
        return False, "rate limited"
    if thread_in_cooldown(thread_id):
        return False, "thread cooldown active"
    return True, "clear"

# After action
def record_action(platform, thread_id):
    increment_rate_counter(platform)
    set_cooldown(thread_id, cooldown_minutes)

# After rate-limit error
def handle_rate_error(platform):
    current_cooldown = get_platform_cooldown(platform)
    set_platform_cooldown(platform, current_cooldown * 2)
```

**Esperado:** El agente nunca excede los límites de tasa de plataforma. Los hilos tienen períodos de cooldown forzados. Los errores de rate-limit disparan backoff automático. El buffer acumula items durante el cooldown sin perderlos.

**En caso de fallo:** Si los límites de tasa se alcanzan a pesar del cumplimiento (skew de reloj, agentes concurrentes), aumentar el margen de seguridad — establecer límites al 80% del límite real de la plataforma. Si los cooldowns son demasiado agresivos (perdiendo hilos sensibles al tiempo), reducir `cooldown_minutes` para hilos de alta prioridad solamente.

### Paso 6: Generar Digest

Producir un resumen compacto para el beat de acción de du-dum. El digest es el punto de entrega: du-dum lee esto, no el buffer crudo.

Contenidos del digest:

1. **Total pendiente**: conteo de items `state=new`
2. **Top-N items**: los items de mayor prioridad (predeterminado N=5 desde `digest_size`)
3. **Expirando pronto**: items dentro del 20% de su TTL
4. **Hilos en cooldown**: cooldowns activos con tiempo restante
5. **Salud del buffer**: total de items, conteo merged, conteo expirado

```markdown
# Engagement Digest — 2026-04-08T12:00:00Z

## Pending: 12 items

### Top 5 by Priority
| # | Priority | Source | Summary | Age |
|---|----------|--------|---------|-----|
| 1 | 5.0 | github:pr-218 | Review requested by contributor | 2h |
| 2 | 4.2 | github:issue-99 | Maintainer question (escalated) | 6h |
| 3 | 3.0 | slack:dev | Build failure alert | 1h |
| 4 | 2.8 | github:pr-215 | CI check feedback (3 participants) | 3h |
| 5 | 2.1 | email:inbox | Collaboration inquiry | 8h |

### Expiring Soon
- github:issue-85 — 4h remaining (TTL 48h, ingested 44h ago)

### Cooldowns Active
- pr-210: 22 min remaining
- issue-92: 45 min remaining

### Buffer Health
- Total items: 47 | New: 12 | Merged: 18 | Acted: 11 | Expired: 6
```

Escribir el digest a una ruta conocida (p. ej., `buffer_path.digest.md`) que el reloj de acción de du-dum lee.

**Esperado:** Un digest bajo 50 líneas que du-dum puede parsear en una lectura. El digest contiene suficiente información para decidir sobre qué actuar, pero no el buffer completo. Si nada está pendiente, el digest lo dice claramente.

**En caso de fallo:** Si el digest crece más allá de 50 líneas, reducir `digest_size` o resumir las secciones de expirando/cooldown más agresivamente. El digest es un resumen — si se acerca al tamaño del buffer, ha perdido su propósito.

### Paso 7: Rastrear Transiciones de Estado

Después de que du-dum procese items del digest, actualizar sus estados y mantener el rastro de auditoría.

Máquina de estado:

```
new → acknowledged → acted → cooldown → expired
         ↑                       │
         └───── (re-ingested) ───┘

merged → (terminal, no further transitions)
expired → (terminal, archived)
```

Para cada transición de estado:

1. Actualizar el campo `state` del item en el archivo buffer
2. Añadir una entrada de log de transición: `{"item_id": "...", "from": "new", "to": "acknowledged", "timestamp": "...", "reason": "du-dum digest pickup"}`
3. Después de actuar, establecer el cooldown del hilo (alimenta de vuelta al Paso 5)

**Retención y poda:**

- Archivar items con `state=acted` o `state=expired` mayores a 7 días (configurable)
- Archivar moviendo a un archivo separado (`buffer_path.archive.jsonl`), no eliminando
- Podar items `state=merged` mayores a 24 horas (han servido su propósito de dedup)
- Ejecutar la poda al final de cada ciclo, después de las actualizaciones de estado

```
# End-of-cycle maintenance
for item in buffer:
    if item.state == "new" and age_hours(item) > item.ttl_hours:
        transition(item, "expired", reason="TTL exceeded")
    if item.state in ("acted", "expired") and age_days(item) > retention_days:
        archive(item)
    if item.state == "merged" and age_hours(item) > 24:
        archive(item)
rewrite_buffer(buffer_path, active_items_only)
```

**Esperado:** Cada transición de estado se loggea con un timestamp y razón. El archivo buffer contiene solo items activos (new, acknowledged, cooldown). Los items archivados se preservan separadamente para auditoría. El buffer no crece sin límite.

**En caso de fallo:** Si el archivo buffer se vuelve corrupto durante la reescritura (escritura parcial, crash), restaurar desde el respaldo pre-reescritura. Siempre escribir a un archivo temporal y renombrar atómicamente — nunca reescribir en el lugar. Si el archivo crece demasiado grande, comprimirlo o rotarlo mensualmente.

## Validación

- [ ] El schema del buffer incluye todos los campos requeridos (id, source, timestamp, content_summary, priority, state, dedup_key, thread_id, ttl_hours)
- [ ] La ingestión asigna prioridades iniciales correctas por tipo de item
- [ ] La deduplicación fusiona items que comparten un dedup_key dentro de la ventana configurada
- [ ] Las ráfagas de hilo son detectadas y consolidadas con conteos de participantes
- [ ] El puntaje compuesto aplica decaimiento por recencia y escalación, capeado en prioridad 5
- [ ] Los límites de tasa por plataforma son forzados antes de cualquier acción de escritura
- [ ] Los cooldowns por hilo previenen el re-engagement dentro de la ventana de cooldown
- [ ] El digest es compacto (<50 líneas), incluye items top-N y tiene un estado vacío claro
- [ ] Las transiciones de estado son loggeadas con timestamps para auditoría
- [ ] Los items expirados y actuados son archivados, no eliminados
- [ ] El archivo buffer no crece sin límite sobre múltiples ciclos

## Errores Comunes

- **Sin TTL en items**: El buffer crece sin límite; los items obsoletos desplazan a los frescos. Cada item necesita un TTL, y el paso de poda debe ejecutarse en cada ciclo.
- **Ignorar cooldowns de hilo**: Replies rápidos en el mismo hilo se sienten spammers para otros participantes. Los cooldowns son una norma social, no solo una tecnicidad de límite de tasa.
- **Prioridad sin decaimiento**: Items viejos de alta prioridad bloquean a los más nuevos indefinidamente. El decaimiento por recencia asegura que el buffer refleje la relevancia actual, no la importancia histórica.
- **Ventana de dedup demasiado estrecha**: Una ventana de 1 hora pierde duplicados que llegan con horas de diferencia (p. ej., una notificación seguida por un recordatorio). Comenzar con 24 horas y estrechar solo si items legítimos están siendo merged incorrectamente.
- **Acoplar la lógica del buffer a una sola plataforma**: Diseñar para el patrón de adaptador desde el inicio. Cada adaptador de plataforma produce items de buffer estándar; el buffer mismo es agnóstico de plataforma.
- **Saltarse el paso de digest**: Du-dum necesita un resumen, no el buffer crudo. Pasar el buffer completo al reloj de acción derrota el propósito de la arquitectura de dos relojes — el reloj de acción debe leer un digest compacto y decidir rápidamente.

## Habilidades Relacionadas

- `du-dum` — patrón de cadencia con el que este buffer compone; du-dum decide *cuándo* observar y actuar, esta habilidad decide *qué* merece acción
- `manage-token-budget` — contabilidad de costos; el buffer respeta restricciones de presupuesto de tokens al dimensionar digests y limitar throughput de acción
- `circuit-breaker-pattern` — manejo de fallos para adaptadores de plataforma alimentando el buffer; cuando el circuito de un adaptador se abre, la ingestión degrada elegantemente
- `coordinate-reasoning` — señales estigmérgicas entre buffer y sistemas de acción; el archivo buffer mismo es un artefacto estigmérgico
- `forage-resources` — descubrimiento de nuevas fuentes de engagement para alimentar a los adaptadores de ingestión del buffer
