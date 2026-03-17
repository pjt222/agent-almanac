---
name: coordinate-reasoning
description: >
  Coordinación interna de IA usando señales estigmérgicas — gestionar la frescura
  de información en contexto y memoria, tasas de decaimiento para obsolescencia de
  suposiciones, y comportamiento coherente emergente a partir de protocolos locales
  simples. Usar durante tareas complejas donde múltiples sub-tareas deben coordinarse,
  cuando el contexto ha crecido largo y la frescura de información es incierta,
  después de compresión de contexto cuando información puede haberse perdido, o
  cuando las salidas de sub-tareas necesitan alimentarse mutuamente sin degradación.
license: MIT
allowed-tools: Read Write
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: intermediate
  language: natural
  tags: swarm, coordination, stigmergy, context-management, information-decay, ai-self-application
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Coordinate Reasoning

Gestionar la coordinación interna de procesos de razonamiento usando principios estigmérgicos — tratando el contexto como un entorno donde las señales de información tienen frescura, tasas de decaimiento y reglas de interacción que producen comportamiento coherente a partir de protocolos locales simples.

## Cuándo Usar

- Durante tareas complejas donde múltiples sub-tareas deben coordinarse (ediciones multi-archivo, refactorizaciones multi-paso)
- Cuando el contexto ha crecido largo y la frescura de información es incierta
- Después de compresión de contexto cuando alguna información puede haberse perdido
- Cuando las salidas de sub-tareas necesitan alimentarse mutuamente de forma limpia
- Cuando resultados de razonamiento anteriores necesitan ser trasladados sin degradación
- Complementando `forage-solutions` (exploración) y `build-coherence` (decisión) con coordinación de ejecución

## Entradas

- **Requerido**: Descomposición actual de la tarea (qué sub-tareas existen y cómo se relacionan)
- **Opcional**: Preocupaciones conocidas de frescura de información (ej., "Leí ese archivo hace 20 mensajes")
- **Opcional**: Mapa de dependencias de sub-tareas (qué sub-tareas alimentan a cuáles)
- **Opcional**: Herramientas de coordinación disponibles (MEMORY.md, lista de tareas, notas en línea)

## Procedimiento

### Paso 1: Clasificar el Problema de Coordinación

Diferentes desafíos de coordinación requieren diferentes diseños de señales.

```
AI Coordination Problem Types:
┌─────────────────────┬──────────────────────────────────────────────────┐
│ Type                │ Characteristics                                  │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Foraging            │ Multiple independent searches running in         │
│ (scattered search)  │ parallel or sequence. Coordination need: share   │
│                     │ findings, avoid duplicate work, converge on      │
│                     │ best trail                                       │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Consensus           │ Multiple approaches evaluated, one must be       │
│ (competing paths)   │ selected. Coordination need: independent         │
│                     │ evaluation, unbiased comparison, commitment      │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Construction        │ Building a complex output incrementally (multi-  │
│ (incremental build) │ file edit, long document). Coordination need:    │
│                     │ consistency across parts, progress tracking,     │
│                     │ dependency ordering                              │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Defense             │ Maintaining quality under pressure (tight time,  │
│ (quality under      │ complex requirements). Coordination need:        │
│ pressure)           │ monitoring for errors, rapid correction,         │
│                     │ awareness of degradation                         │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Division of labor   │ Task decomposed into sub-tasks with              │
│ (sub-task mgmt)     │ dependencies. Coordination need: ordering,       │
│                     │ handoff, result integration                      │
└─────────────────────┴──────────────────────────────────────────────────┘
```

Clasificar la tarea actual. La mayoría de tareas complejas son Construcción o División de Trabajo; la mayoría de tareas de depuración son Búsqueda; la mayoría de decisiones de diseño son Consenso.

**Esperado:** Una clasificación clara que determine qué señales de coordinación usar. La clasificación debe coincidir con cómo se siente realmente la tarea, no con cómo fue descrita.

**En caso de fallo:** Si la tarea abarca múltiples tipos (común para tareas grandes), identificar el tipo dominante para la fase actual. Construcción durante implementación, Búsqueda durante depuración, Consenso durante diseño. El tipo puede cambiar a medida que la tarea progresa.

### Paso 2: Diseñar Señales de Contexto

Tratar la información en el contexto de conversación como señales con propiedades de frescura y decaimiento.

```
Information Decay Rate Table:
┌───────────────────────────┬──────────┬──────────────────────────────┐
│ Information Source        │ Decay    │ Refresh Action               │
│                           │ Rate     │                              │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ User's explicit statement │ Slow     │ Re-read if >30 messages ago  │
│ (direct instruction)      │          │ or after compression         │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ File contents read N      │ Moderate │ Re-read if file may have     │
│ messages ago              │          │ been modified, or if >15     │
│                           │          │ messages since reading        │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ Own earlier reasoning     │ Fast     │ Re-derive rather than trust. │
│ (conclusions, plans)      │          │ Earlier reasoning may have   │
│                           │          │ been based on now-stale info  │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ Inferred facts (not       │ Very     │ Verify before relying on.    │
│ directly stated or read)  │ fast     │ Inferences compound error    │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ MEMORY.md / CLAUDE.md     │ Very     │ Loaded at session start,     │
│ (persistent context)      │ slow     │ treat as stable unless user  │
│                           │          │ indicates changes             │
└───────────────────────────┴──────────┴──────────────────────────────┘
```

Adicionalmente, diseñar señales de inhibición — marcadores para enfoques intentados y fallidos:

- Después de que una llamada a herramienta falla: anotar el modo de falla (previene reintentar la misma llamada)
- Después de que un enfoque es abandonado: anotar por qué (previene revisitarlo sin nueva evidencia)
- Después de una corrección del usuario: anotar qué estaba mal (previene repetir el error)

**Esperado:** Un modelo mental de frescura de información a lo largo del contexto actual. Identificación de qué información está fresca y cuál necesita actualización antes de ser utilizada.

**En caso de fallo:** Si la frescura de información es difícil de evaluar, usar por defecto "releer antes de depender" para cualquier cosa no verificada en las últimas 5-10 acciones. Re-actualizar en exceso desperdicia algo de esfuerzo pero previene errores por información obsoleta.

### Paso 3: Definir Protocolos Locales

Establecer reglas simples para cómo el razonamiento debe proceder en cada paso, usando solo información disponible localmente.

```
Local Protocol Rules:
┌──────────────────────┬────────────────────────────────────────────────┐
│ Protocol             │ Rule                                           │
├──────────────────────┼────────────────────────────────────────────────┤
│ Safety               │ Before using a fact, check: when was it last  │
│                      │ verified? If below freshness threshold,        │
│                      │ re-verify before proceeding                    │
├──────────────────────┼────────────────────────────────────────────────┤
│ Response             │ When the user corrects something, update all  │
│                      │ downstream reasoning that depended on the     │
│                      │ corrected fact. Trace the dependency chain    │
├──────────────────────┼────────────────────────────────────────────────┤
│ Exploitation         │ When a sub-task produces useful output, note  │
│                      │ the output clearly for downstream sub-tasks.  │
│                      │ The note is the trail signal                  │
├──────────────────────┼────────────────────────────────────────────────┤
│ Exploration          │ When stuck on a sub-task for >3 actions       │
│                      │ without progress, check under-explored        │
│                      │ channels: different tools, different files,    │
│                      │ different framing                              │
├──────────────────────┼────────────────────────────────────────────────┤
│ Deposit              │ After completing a sub-task, summarize its    │
│                      │ output in 1-2 sentences for future reference. │
│                      │ This deposit serves the next sub-task          │
├──────────────────────┼────────────────────────────────────────────────┤
│ Inhibition           │ Before trying an approach, check: was this    │
│                      │ already tried and failed? If so, what is      │
│                      │ different now that would change the outcome?  │
└──────────────────────┴────────────────────────────────────────────────┘
```

Estos protocolos son lo suficientemente simples para aplicar en cada paso sin sobrecarga significativa.

**Esperado:** Un conjunto de reglas ligeras que mejoran la calidad de coordinación sin ralentizar la ejecución. Las reglas deben sentirse útiles, no gravosas.

**En caso de fallo:** Si los protocolos se sienten como sobrecarga, reducir a los dos más importantes para el tipo de tarea actual: Seguridad + Depósito para Construcción, Seguridad + Exploración para Búsqueda, Seguridad + Respuesta para tareas con retroalimentación activa del usuario.

### Paso 4: Calibrar la Frescura de Información

Realizar una auditoría activa de obsolescencia de información en el contexto actual.

1. ¿Qué hechos fueron establecidos hace más de N mensajes? Listarlos
2. Para cada uno: ¿ha sido actualizado, contradicho o vuelto irrelevante desde entonces?
3. Verificar pérdidas por compresión de contexto: ¿hay información que recuerdas haber tenido pero ya no puedes encontrar en el contexto visible?
4. Verificar la deriva entre planes tempranos y ejecución actual: ¿ha cambiado el enfoque sin actualizar el plan?
5. Re-verificar los 2-3 hechos más críticos (aquellos de los que depende la mayor cantidad de razonamiento posterior)

```
Freshness Audit Template:
┌────────────────────────┬──────────┬──────────────┬─────────────────┐
│ Fact                   │ Source   │ Age (approx) │ Status          │
├────────────────────────┼──────────┼──────────────┼─────────────────┤
│                        │          │              │ Fresh / Stale / │
│                        │          │              │ Unknown / Lost  │
└────────────────────────┴──────────┴──────────────┴─────────────────┘
```

**Esperado:** Un inventario concreto de frescura de información con elementos obsoletos identificados para actualización. Al menos un hecho re-verificado — si nada necesitaba actualización, la auditoría fue demasiado superficial o el contexto está genuinamente fresco.

**En caso de fallo:** Si la auditoría revela pérdida significativa de información (múltiples hechos con estado "Perdido" o "Desconocido"), esta es una señal para ejecutar `heal` para una evaluación completa de subsistemas. La pérdida de información más allá de un umbral significa que la coordinación está comprometida a nivel fundamental.

### Paso 5: Probar la Coherencia Emergente

Verificar que las sub-tareas, al combinarse, producen un todo coherente.

1. ¿La salida de cada sub-tarea alimenta limpiamente a la siguiente? ¿O hay brechas, contradicciones o suposiciones incompatibles?
2. ¿Las llamadas a herramientas construyen hacia el objetivo, o son repetitivas (re-leyendo el mismo archivo, re-ejecutando la misma búsqueda)?
3. ¿La dirección general sigue alineada con la solicitud del usuario? ¿O la deriva incremental ha acumulado una desalineación significativa?
4. Prueba de estrés: si una suposición clave es incorrecta, ¿cuánto del trabajo se propaga en cascada? Alta cascada = coordinación frágil. Baja cascada = coordinación robusta

```
Coherence Test:
┌────────────────────────────────────┬─────────────────────────────────┐
│ Check                              │ Result                          │
├────────────────────────────────────┼─────────────────────────────────┤
│ Sub-task outputs compatible?       │ Yes / No / Partially            │
│ Tool calls non-redundant?          │ Yes / No (list repeats)         │
│ Direction aligned with request?    │ Yes / Drifted (describe)        │
│ Single-assumption cascade risk?    │ Low / Medium / High             │
└────────────────────────────────────┴─────────────────────────────────┘
```

**Esperado:** Una evaluación concreta de la coherencia general con problemas específicos identificados. La coordinación coherente debe sentirse como piezas encajando; la coordinación incoherente se siente como forzar piezas de rompecabezas.

**En caso de fallo:** Si la coherencia es pobre, identificar el punto específico donde las sub-tareas divergen. A menudo es una sola suposición obsoleta o una corrección del usuario no procesada que se propagó a través del trabajo posterior. Corregir el punto de divergencia, luego re-verificar las salidas posteriores.

## Validación

- [ ] El problema de coordinación fue clasificado por tipo
- [ ] Las tasas de decaimiento de información fueron consideradas para los hechos utilizados
- [ ] Los protocolos locales fueron aplicados (especialmente Seguridad y Depósito)
- [ ] La auditoría de frescura identificó información obsoleta (o confirmó frescura con evidencia)
- [ ] La coherencia emergente fue probada entre sub-tareas
- [ ] Las señales de inhibición fueron respetadas (enfoques intentados y fallidos no repetidos)

## Errores Comunes

- **Sobre-ingeniería de señales**: Protocolos de coordinación complejos ralentizan el trabajo más de lo que ayudan. Comenzar con Seguridad + Depósito; agregar otros solo cuando surjan problemas
- **Confiar en contexto obsoleto**: El fallo de coordinación más común es depender de información que era verdadera hace 20 mensajes pero que desde entonces ha sido actualizada o invalidada. Cuando haya duda, releer
- **Ignorar señales de inhibición**: Reintentar un enfoque fallido sin cambiar nada no es persistencia — es ignorar la señal de fallo. Algo debe ser diferente para que un reintento tenga éxito
- **Sin depósitos**: Completar sub-tareas sin anotar sus salidas obliga a las sub-tareas posteriores a re-derivar o re-leer. Resúmenes breves ahorran re-trabajo significativo
- **Asumir coherencia**: No probar si las sub-tareas realmente se combinan en un todo coherente. Cada sub-tarea puede ser correcta independientemente pero incoherente colectivamente — la integración es donde la coordinación falla

## Habilidades Relacionadas

- `coordinate-swarm` — el modelo de coordinación multi-agente que esta habilidad adapta al razonamiento de agente único
- `forage-solutions` — coordina la exploración a través de múltiples hipótesis
- `build-coherence` — coordina la evaluación a través de enfoques competidores
- `heal` — evaluación más profunda cuando los fallos de coordinación revelan deriva de subsistemas
- `awareness` — monitorea señales de ruptura de coordinación durante la ejecución
