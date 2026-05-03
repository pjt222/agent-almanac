---
name: choose-loop-wakeup-interval
description: >
  Select a `delaySeconds` value when scheduling a loop wakeup via the
  `ScheduleWakeup` tool or the `/loop` slash command. Covers the three-tier
  cache-aware decision (cache-warm under 5 minutes, cache-miss 5 minutes to
  1 hour, idle default 20 to 30 minutes), the 300-second anti-pattern, the
  [60, 3600] runtime clamp, the minute-boundary rounding quirk, and writing
  a telemetry-worthy `reason` field. Use when designing an autonomous loop,
  when a heartbeat cadence is being planned, when polling cadence is being
  tuned, or when post-hoc review of loop costs reveals interval mis-sizing.
license: MIT
allowed-tools: ""
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: loop, wakeup, cache, scheduling, delay, decision
  locale: es
  source_locale: en
  source_commit: 9c546edf
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Choose Loop Wakeup Interval

Elegir un valor de `delaySeconds` para `ScheduleWakeup` que respete el TTL de 5 minutos de la caché de prompt, la granularidad de minuto entero del programador y el clamp en tiempo de ejecución `[60, 3600]`. La decisión es estructuralmente no trivial: el instinto común "esperar unos 5 minutos" cae en la zona del peor de ambos mundos — pagar el cache miss sin amortizar la espera.

El razonamiento viaja con la descripción de la herramienta `ScheduleWakeup` en el momento de la llamada, pero para entonces el loop ya está siendo programado. Esta habilidad eleva ese razonamiento al momento de planificación, donde pertenece.

## Cuándo Usar

- Diseñar una continuación autónoma `/loop` o impulsada por `ScheduleWakeup` y elegir el delay por tick
- Planificar una cadencia de heartbeat para un agente de larga duración que hará polling, vigilancia o iteración
- Ajustar la cadencia de polling contra costo o presión de calidez de caché
- Revisar costos de loop a posteriori y descubrir que el intervalo estaba mal dimensionado
- Escribir una guía, runbook o ejemplo trabajado que involucra elegir `delaySeconds`

## Entradas

- **Requerido**: Qué está esperando el loop (un evento específico, una transición de estado, un tick inactivo, una verificación periódica)
- **Requerido**: Si el lector de este tick necesitará contexto fresco (cache-warm) o puede tolerar una re-lectura fría (cache-miss aceptable)
- **Opcional**: Cualquier límite inferior conocido sobre cuándo el evento esperado podría ocurrir (p. ej. "el build toma al menos 4 minutos")
- **Opcional**: Un techo de costo sobre el loop total (número de ticks × costo por tick)

## Procedimiento

### Paso 1: Clasificar la Espera

Decidir a qué nivel pertenece la espera:

- **Vigilancia activa (cache-warm)**: se espera que algo cambie dentro de los próximos 5 minutos — un build cerca de completarse, una transición de estado siendo polleada, un proceso que acaba de iniciarse
- **Espera cache-miss**: nada que valga la pena verificar antes de 5 minutos a partir de ahora; la caché de contexto se enfriará y eso es aceptable
- **Inactiva**: ninguna señal específica que vigilar; el loop está revisando porque podría encontrar algo, no porque lo hará

**Esperado:** Una clasificación clara: vigilancia activa, cache-miss o inactiva.

**En caso de fallo:** Si la espera no se puede clasificar — si no hay respuesta honesta a "¿qué estoy esperando?" — el loop probablemente no debería existir. Saltar al Paso 5 y considerar no programar un wakeup en absoluto.

### Paso 2: Aplicar la Decisión de Tres Niveles

Elegir un `delaySeconds` basado en la clasificación:

| Nivel | Rango | Comportamiento de caché | Usar cuando |
|---|---|---|---|
| Cache-warm | **60 – 270 s** | La caché permanece caliente (bajo TTL de 5 minutos) | Vigilancia activa — el siguiente tick necesita re-entrada rápida y barata |
| Cache-miss | **1200 – 3600 s** | La caché se enfría; un miss compra una espera larga | Genuinamente inactivo, o el evento esperado no puede ocurrir antes |
| Inactivo por defecto | **1200 – 1800 s** (20–30 min) | La caché se enfría | Sin señal específica; verificación periódica con el usuario capaz de interrumpir |

**No elegir 300 s.** Es el intervalo del peor de ambos: la caché falla, pero la espera es demasiado corta para amortizar el miss. Si te encuentras alcanzando "unos 5 minutos", baja a 270 s (mantén caliente) o comprométete a 1200 s+ (amortiza el miss).

**Esperado:** Un valor específico de `delaySeconds` elegido de uno de los tres niveles, no un valor de minuto redondo elegido por hábito.

**En caso de fallo:** Si la elección sigue cayendo en 300 s, la pregunta subyacente es usualmente "¿debería este loop existir a esta cadencia en absoluto?" — re-examinar el Paso 1.

### Paso 3: Dimensionar para el Límite del Minuto

El programador se dispara en límites de minuto entero. Un `delaySeconds` de `N` produce un delay real de `N` a `N + 60` s, dependiendo de en qué segundo del minuto llamas a la herramienta.

Ejemplo trabajado:

> Llamar `ScheduleWakeup({delaySeconds: 90})` a las `HH:MM:40` produce un objetivo de `HH:(MM+2):00` — es decir, una espera real de 140 s, no 90 s.

Consecuencia: la intención sub-minuto carece de sentido. Tratar el valor que pasas como un **piso**, no un horario preciso. Si un minuto de skew importa, la cadencia de tu loop es demasiado ajustada para este mecanismo.

**Esperado:** Has aceptado que la espera real será hasta 60 s más larga que el `delaySeconds` solicitado. Para ticks cache-warm esto importa — 270 s pueden volverse ~330 s en la práctica, cayendo en territorio cache-miss.

**En caso de fallo:** Si los valores cerca del techo (p. ej. 265 s al apuntar a cache-warmth) son comunes, rellenar hacia abajo — usar 240 s en lugar de 270 s para preservar la garantía cache-warm incluso bajo el peor caso de skew de límite de minuto.

### Paso 4: Respetar el Clamp

El runtime hace clamp de `delaySeconds` a `[60, 3600]` — los valores fuera de ese rango se ajustan silenciosamente. La telemetría distingue lo que el modelo pidió (`chosen_delay_seconds`) de lo que realmente se programó (`clamped_delay_seconds`) y establece `was_clamped: true` en cualquier discrepancia.

Planificar contra el valor con clamp, no el solicitado:

- Solicitud por debajo de 60 → la espera real es 60 s más skew de límite de minuto (hasta 120 s en la práctica)
- Solicitud por encima de 3600 → la espera real es 3600 s (1 hora)
- Ningún runtime extiende el techo; las esperas multi-hora requieren múltiples ticks

**Esperado:** Tu valor elegido cae dentro de `[60, 3600]`, o has aceptado deliberadamente el comportamiento de clamp.

**En caso de fallo:** Si la necesidad es genuinamente multi-hora (p. ej. "despiértame en 4 horas"), encadenar wakeups — programar un tick de 3600 s que él mismo reprograma — o usar un loop basado en cron (`CronCreate` con `kind: "loop"`) en su lugar.

### Paso 5: Escribir un `reason` Específico

El campo `reason` es telemetría, estado visible para el usuario y razonamiento de calidez de caché de prompt en una línea. Está truncado a 200 caracteres. Hacerlo específico.

- Bueno: `checking long bun build`, `polling for EC2 instance running-state`, `idle heartbeat — watching the feed`
- Malo: `waiting`, `loop`, `next tick`, `continuing`

El lector de este campo es un usuario tratando de entender qué está haciendo el loop sin tener que predecir tu cadencia por adelantado. Escribir para ellos.

**Esperado:** Una razón concreta de una frase que tendría sentido para un usuario que mire el estado de pasada.

**En caso de fallo:** Si no se puede dar una razón específica, revisitar si el loop debería existir (Paso 1 y Paso 6).

### Paso 6: Reconocer el Caso No-Loopear

No todo impulso de "regresar más tarde" amerita un wakeup programado. NO programar un tick cuando:

- El usuario está observando activamente — su entrada es el disparador correcto, no un timer
- No hay criterio de convergencia — el loop no tiene definición de "hecho"
- La tarea es interactiva (hace preguntas al usuario entre ticks)
- La cadencia necesaria es más corta que el piso del clamp (60 s) — polling tan ajustado pertenece a un mecanismo dirigido por eventos, no un loop

**Esperado:** Una elección consciente entre programar un wakeup y no loopear en absoluto. "Porque podría" no es una razón para loopear.

**En caso de fallo:** Si sigues programando wakeups que el usuario interrumpe antes de dispararse, el patrón es incorrecto — no el intervalo.

## Validación

- [ ] La espera fue clasificada como vigilancia activa, cache-miss o inactiva (uno de tres)
- [ ] El `delaySeconds` elegido cae en uno de los tres rangos de nivel (60–270, 1200–3600, o 1200–1800 para inactivo)
- [ ] El valor no es 300 (peor de ambos)
- [ ] El valor está dentro de `[60, 3600]` o el comportamiento con clamp se acepta explícitamente
- [ ] El skew de límite de minuto se ha tenido en cuenta (tratar el valor como un piso)
- [ ] `reason` es concreto y bajo 200 caracteres
- [ ] Se realizó la verificación de no-loopear — el wakeup está realmente justificado

## Errores Comunes

- **Default de minuto redondo (300 s)**: El error más común. "Unos 5 minutos" se siente natural y es exactamente incorrecto. Bajar a 270 s o comprometerse a 1200 s+.
- **Ignorar el skew de límite de minuto**: Solicitar 60 s cerca del final de un minuto puede producir ~120 s de delay real. Para ticks cache-warm, esto puede empujar el tick más allá del TTL de 5 minutos inesperadamente.
- **Perseguir precisión sub-minuto**: El programador tiene granularidad de minuto. Pedir 85 s vs. 90 s vs. 95 s es ruido — elegir un valor y seguir adelante.
- **Campos `reason` opacos**: `"waiting"` no le dice nada al usuario y hace la telemetría menos útil. Escribir la razón como si el usuario la leyera en una línea de estado.
- **Usar esta habilidad para justificar un loop innecesario**: Si la respuesta honesta a "¿qué estoy vigilando?" es vaga, ninguna elección de intervalo ayudará — el loop no debería existir.
- **Clamp manual en el prompt**: No hacer clamp en el razonamiento del modelo ("limitaré a 3600 por seguridad"). El runtime hace clamp. Déjalo.
- **Olvidar el age-out de 7 días**: Un loop dinámico se recolecta después de 7 días por defecto (configurable por el usuario hasta 30 días). Los loops de larga duración deben diseñarse para terminar mucho antes de ese techo, no para correr contra él.

## Ejemplos

### Ejemplo 1 — Vigilancia activa cache-warm

Se inició un `bun build`; el agente quiere revisar rápidamente para que la caché siga caliente cuando lleguen los resultados.

- Clasificación: vigilancia activa (Paso 1)
- Nivel: cache-warm (Paso 2), elegir **240 s**
- Límite de minuto (Paso 3): peor caso de espera real ~300 s — aún bajo el TTL de 5 minutos con el buffer de 60 s
- Razón (Paso 5): `checking long bun build`

### Ejemplo 2 — Heartbeat inactivo

Un agente autónomo vigila un feed de bajo volumen una vez por hora para cualquier cosa digna de actuar.

- Clasificación: inactivo (Paso 1)
- Nivel: inactivo por defecto (Paso 2), elegir **1800 s** (30 min)
- Límite de minuto (Paso 3): irrelevante — 60 s de skew es despreciable a esta cadencia
- Razón (Paso 5): `idle heartbeat — watching the feed`

### Ejemplo 3 — El anti-patrón

Un agente quiere "esperar 5 minutos" mientras una API remota reintenta. La solicitud es 300 s.

- Problema: la caché se enfría a los 5 minutos, así que 300 s paga el miss — pero 300 s es demasiado corto para amortizar el miss
- Arreglo: o bajar a 270 s (mantener caliente) o comprometerse a 1500 s (amortizar el miss). No elegir 300.

## Habilidades Relacionadas

- `manage-token-budget` — techos de costo para loops de agente de larga vida; el dimensionamiento cache-aware es una palanca
- `du-dum` — patrón de separación observar/actuar; esta habilidad dimensiona el intervalo del reloj observe cuando el loop es sin cron
- `read-continue-here` — handoff cross-sesión; esta habilidad cubre wakeups dentro de la sesión
- `write-continue-here` — el complemento de `read-continue-here`

<!-- Keep under 500 lines. Current: ~200 lines. -->
