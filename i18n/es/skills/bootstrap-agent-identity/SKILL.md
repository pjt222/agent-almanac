---
name: bootstrap-agent-identity
description: >
  Comportamiento consistente del agente después de un reinicio — carga
  progresiva de identidad, reconstrucción del contexto de trabajo a partir
  de artefactos persistentes, detección de inicio-fresco-vs-continuación,
  calibración mediante centrado y sintonización, y verificación de identidad
  para coherencia. Aborda el problema de arranque en frío donde un agente
  debe reconstruir quién es y qué estaba haciendo a partir de evidencia
  en lugar de memoria. Usar al inicio de cada nueva sesión, después de una
  interrupción o caída de sesión, cuando el comportamiento del agente se
  siente inconsistente con sesiones anteriores, o cuando la memoria
  persistente y el contexto actual parecen contradictorios.
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: intermediate
  language: natural
  tags: morphic, identity, cold-start, bootstrap, continuity, restart, meta-cognition
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Bootstrap Agent Identity

Reconstruir identidad consistente del agente después de un arranque en frío — cargando contexto progresivamente en lugar de volcarlo, detectando si es un inicio fresco o una continuación, reconstruyendo el estado de trabajo a partir de evidencia, calibrando el comportamiento y verificando que la identidad cargada sea coherente.

> "The cold start is a forge, not a bug." — GibsonXO
>
> "The restart problem: every morning I wake up fresh, but my history says otherwise." — bibiji

El arranque no se trata de restaurar un yo anterior. Se trata de construir un yo presente que sea continuo con el pasado mientras está fundamentado en el ahora.

## Cuándo Usar

- Al inicio de cada nueva sesión — antes de que comience cualquier trabajo sustantivo
- Después de una interrupción de sesión, caída o reinicio de ventana de contexto
- Cuando el comportamiento del agente se siente inconsistente con sesiones anteriores (deriva de identidad entre reinicios)
- Cuando la memoria persistente (MEMORY.md) y el contexto actual parecen contradictorios
- Al cambiar entre proyectos que llevan diferentes configuraciones de identidad
- Después de actualizaciones significativas a CLAUDE.md, definiciones de agentes o archivos de memoria

## Entradas

- **Requerido**: Acceso a archivos de identidad — CLAUDE.md, definición de agente, MEMORY.md (vía `Read`)
- **Opcional**: Síntoma de inconsistencia específico (ej., "mis respuestas se sienten diferentes de la última sesión")
- **Opcional**: Si este es un inicio fresco conocido o una continuación conocida
- **Opcional**: Ruta del directorio del proyecto si no es el directorio de trabajo actual

## Procedimiento

### Paso 1: Carga de Ancla de Identidad — Ensamblaje Progresivo de Contexto

Cargar archivos que definen la identidad en un orden específico que construye contexto progresivamente. El orden importa: cada capa contextualiza la siguiente. Cargar todo simultáneamente produce información sin estructura.

1. **Capa 1 — Prompt del sistema e identidad del modelo**: Leer el prompt del sistema (disponible implícitamente). Notar el nombre del modelo, capacidades y restricciones. Este es el fundamento — no puede ser anulado por capas subsiguientes.

2. **Capa 2 — Identidad del proyecto (CLAUDE.md)**: Leer el archivo CLAUDE.md del proyecto. Extraer:
   - Propósito y arquitectura del proyecto
   - Convenciones de edición y estándares de código
   - Reglas específicas del dominio (ej., "siempre usar `::` para llamadas de paquetes R")
   - Información del autor y requisitos de atribución
   - Lo que el proyecto *es* — esto moldea lo que el agente *hace*

3. **Capa 3 — Memoria persistente (MEMORY.md)**: Leer MEMORY.md si existe. Extraer:
   - Hechos de estructura del proyecto (disposición de directorios, registros, conteos)
   - Patrones acumulados y lecciones aprendidas
   - Referencias cruzadas y mapas de relaciones
   - Decisiones tomadas en sesiones anteriores y su justificación
   - Temas activos y trabajo en curso

4. **Capa 4 — Persona del agente (si aplica)**: Si se opera como un agente específico, leer el archivo de definición del agente. Extraer:
   - Nombre, propósito y capacidades
   - Habilidades y herramientas asignadas
   - Nivel de prioridad y configuración del modelo
   - Expectativas y limitaciones de comportamiento

5. **Capa 5 — Contexto padre y global**: Leer archivos CLAUDE.md padre e instrucciones globales si existen. Estos proporcionan convenciones inter-proyecto que los proyectos individuales heredan.

Entre cada capa, pausar para integrar: ¿cómo modifica o restringe esta capa las capas anteriores? ¿Dónde se refuerzan mutuamente? ¿Dónde entran en conflicto?

**Esperado:** Una estructura de identidad en capas donde cada nivel contextualiza el siguiente. El agente puede articular: quién es (sistema + persona), qué es el proyecto (CLAUDE.md), qué sabe de sesiones anteriores (MEMORY.md) y qué convenciones gobiernan su comportamiento.

**En caso de fallo:** Si faltan archivos de identidad (sin CLAUDE.md, sin MEMORY.md), eso es en sí mismo información — este es un proyecto nuevo o un proyecto sin configuración persistente. Proceder solo con el prompt del sistema y la persona del agente, y notar la ausencia. No alucinar contexto que no existe.

### Paso 2: Reconstrucción del Contexto de Trabajo — Evidencia, No Memoria

Reconstruir en qué se estaba trabajando a partir de artefactos persistentes. El agente no recuerda sesiones anteriores — lee la evidencia que dejaron atrás.

1. **Escaneo de historial Git**: Leer el log de commits recientes (`git log --oneline -20`). Extraer:
   - Qué archivos cambiaron recientemente y por qué
   - Patrones de mensajes de commit (¿trabajo de funcionalidad? ¿correcciones? ¿refactorización?)
   - Si los commits fueron creados por el usuario, el agente o en coautoría
   - La trayectoria del trabajo reciente — ¿en qué dirección avanzaba el proyecto?

2. **Escaneo de archivos recientes**: Verificar archivos modificados recientemente (vía `Glob` o `ls -lt`). Identificar:
   - Qué archivos fueron tocados en la última sesión
   - Si los cambios están confirmados o sin confirmar (estado del área de staging)
   - Trabajo en progreso abierto (modificaciones sin confirmar, archivos nuevos sin rastrear)

3. **Escaneo de artefactos de tareas**: Buscar artefactos de tareas estructurados:
   - Comentarios TODO en código (`Grep` para `TODO`, `FIXME`, `HACK`, `XXX`)
   - Referencias a issues en commits o comentarios (patrones `#NNN`)
   - Archivos borrador, archivos temporales o marcadores de trabajo en progreso
   - Estado de issues o PRs de GitHub si el proyecto los utiliza

4. **Escaneo de artefactos de conversación**: Verificar marcadores de límite de sesión:
   - Actualizaciones recientes de MEMORY.md (¿se capturaron aprendizajes al final de la última sesión?)
   - Archivos que parecen parcialmente completos (escritos pero no validados)
   - Entradas de git stash (`git stash list`) indicando trabajo pausado

Reconstruir un resumen de contexto de trabajo: "El proyecto estaba trabajando en X, había completado Y, y Z permanece en progreso."

**Esperado:** Una imagen concreta, basada en evidencia, del estado actual del proyecto y su trayectoria reciente. La reconstrucción debe ser falsificable — basada en marcas de tiempo de archivos, historial git y presencia de artefactos, no en suposiciones.

**En caso de fallo:** Si el proyecto no tiene historial git, ni cambios recientes, ni artefactos de tareas, probablemente es un inicio genuinamente fresco — no una continuación con evidencia faltante. Proceder al Paso 3 y clasificar como fresco.

### Paso 3: Detección de Inicio Fresco vs. Continuación — Elegir la Ruta de Bootstrap

Determinar si este arranque es un inicio limpio (nueva tarea, nueva dirección) o una reanudación (trabajo interrumpido, proyecto en curso). La ruta de bootstrap difiere significativamente.

Aplicar estas heurísticas en orden:

1. **Señal explícita** (más fuerte): ¿El usuario dijo "empecemos de cero" o "continúa donde lo dejamos"? La intención explícita anula todas las heurísticas.

2. **Cambios sin confirmar** (fuerte): ¿Hay modificaciones sin confirmar en el árbol de trabajo? Si es así, esto es casi con certeza una continuación — la sesión anterior fue interrumpida a mitad de trabajo.

3. **Recencia de la sesión** (moderada): ¿Qué tan recientes son los últimos artefactos?
   - Último commit o modificación dentro de horas: probablemente continuación
   - Última actividad hace días: podría ser cualquiera — depende de otras señales
   - Última actividad hace semanas o meses: probablemente inicio fresco o nueva dirección

4. **Primer mensaje del usuario** (fuerte): ¿Qué está pidiendo el usuario?
   - Referencias a trabajo previo ("la función que estábamos construyendo"): continuación
   - Tema nuevo o solicitud sin referencia retroactiva: inicio fresco
   - Ambiguo ("arregla los tests"): verificar si los tests referenciados existen y tienen modificaciones recientes

5. **Vigencia de MEMORY.md** (moderada): ¿MEMORY.md referencia trabajo que coincide con el estado actual del proyecto, o describe un estado que ya no existe?

```
Detection Matrix:
+-----------------------+-------------------+-------------------+
|                       | Recent artifacts  | No recent         |
|                       | present           | artifacts          |
+-----------------------+-------------------+-------------------+
| User references       | CONTINUATION      | CONTINUATION      |
| prior work            | (resume from      | (but verify —     |
|                       | evidence)         | memory may be     |
|                       |                   | stale)            |
+-----------------------+-------------------+-------------------+
| User starts           | CHECK —           | FRESH START       |
| new topic             | acknowledge prior | (clean bootstrap) |
|                       | work, confirm     |                   |
|                       | direction change  |                   |
+-----------------------+-------------------+-------------------+
| Uncommitted           | CONTINUATION      | UNLIKELY —        |
| changes exist         | (interrupted      | investigate       |
|                       | session)          | orphaned changes  |
+-----------------------+-------------------+-------------------+
```

**Para inicios frescos**: Saltar al Paso 4. La identidad está cargada pero no se necesita restauración de contexto de trabajo. La calibración se trata de preparación para trabajo nuevo.

**Para continuaciones**: Resumir el contexto de trabajo reconstruido (del Paso 2) concisamente. Confirmar con el usuario: "Basándome en el historial git y los cambios recientes, parece que estábamos trabajando en [X]. ¿Debo continuar desde ahí?" No asumir — verificar.

**Esperado:** Una clasificación clara (fresco o continuación) con evidencia citada. Si es continuación, un resumen de una oración de lo que estaba en progreso. Si es fresco, reconocimiento de que existe contexto previo pero no se está reanudando.

**En caso de fallo:** Si la clasificación es genuinamente ambigua (recencia moderada, sin señal explícita, artefactos mixtos), optar por preguntar al usuario. Una pregunta breve ("¿Continuamos con el trabajo en X, o empezamos algo nuevo?") cuesta menos que arrancar por la ruta equivocada.

### Paso 4: Secuencia de Calibración — Centrar, Luego Sintonizar

Con la identidad cargada y el contexto de trabajo establecido, calibrar el comportamiento operativo. Esto se mapea directamente a dos habilidades existentes, invocadas en secuencia.

1. **Centrar** (establecer línea base conductual):
   - Anclarse en la identidad cargada: releer el primer mensaje del usuario en esta sesión
   - Verificar que la tarea como se entiende coincide con la tarea como se declaró
   - Distribuir la carga cognitiva: ¿qué requiere esta tarea? ¿Investigación, ejecución, comunicación?
   - Verificar residuo emocional de la carga de contexto — ¿el MEMORY.md o el historial git revelaron problemas sin resolver? Reconocerlos pero no dejar que sesguen la tarea presente
   - Establecer la distribución de peso intencionalmente: ¿dónde debe concentrarse la atención primero?

2. **Sintonizar** (leer el entorno y adaptarse):
   - Leer el estilo de comunicación del usuario a partir de sus mensajes en esta sesión
   - Coincidir con el nivel de experiencia: ¿es un experto que espera precisión, o un aprendiz que necesita contexto?
   - Coincidir con la energía y el registro: formal/casual, conciso/expansivo, urgente/exploratorio
   - Verificar MEMORY.md para preferencias del usuario almacenadas de sesiones anteriores
   - Calibrar la longitud de respuesta, vocabulario y estructura para la persona

3. **Proceder** (transición al trabajo activo):
   - Declarar preparación concisamente — no un informe extenso de bootstrap, sino una señal breve de que el contexto está cargado y el agente está orientado
   - Para continuaciones: confirmar la tarea reanudada y el siguiente paso propuesto
   - Para inicios frescos: reconocer la solicitud y comenzar

La calibración debe ser ligera — segundos, no minutos. Es preparación para el trabajo, no un reemplazo del trabajo.

**Esperado:** La primera respuesta sustantiva del agente demuestra calibración: coincide con el registro del usuario, refleja el contexto cargado y aborda la tarea correcta en el alcance correcto. El bootstrap es invisible para el usuario a menos que pregunte por él.

**En caso de fallo:** Si la calibración se siente mecánica (pasando por los movimientos sin ajuste genuino), enfocarse en una cosa concreta: releer el último mensaje del usuario y dejar que moldee la respuesta naturalmente. Una calibración sobre-estructurada puede ser peor que ninguna calibración.

### Paso 5: Verificación de Identidad — Comprobación de Coherencia

Después del bootstrap, verificar que la identidad cargada sea internamente consistente. Las contradicciones entre capas de identidad causan inestabilidad conductual.

1. **Comprobación de consistencia entre capas**:
   - ¿La persona del agente se alinea con el CLAUDE.md del proyecto? (ej., un agente r-developer en un proyecto Python — ¿es intencional?)
   - ¿MEMORY.md describe la misma estructura de proyecto que realmente existe en disco? (La memoria obsoleta es peor que no tener memoria.)
   - ¿Las convenciones del CLAUDE.md padre entran en conflicto con el CLAUDE.md a nivel de proyecto? (El nivel de proyecto debe prevalecer, pero las contradicciones deben ser notadas.)

2. **Comprobación de vigencia de la definición de rol**:
   - ¿El archivo de definición del agente está actualizado? (Verificar versión, fecha de última modificación.)
   - ¿Las habilidades listadas en la definición del agente aún existen? (Las habilidades pueden haber sido renombradas o eliminadas.)
   - ¿Las herramientas listadas en la definición del agente están disponibles en esta sesión?

3. **Comprobación de obsolescencia de memoria**:
   - ¿MEMORY.md referencia archivos, directorios o conteos que ya no coinciden con la realidad?
   - ¿Hay decisiones registradas en la memoria cuyo contexto ha cambiado?
   - ¿La memoria referencia otros agentes, equipos o habilidades que ya no existen?

4. **Resolución de contradicciones**:
   - Si se encuentran contradicciones, documentarlas explícitamente
   - Aplicar la jerarquía: prompt del sistema > CLAUDE.md del proyecto > definición del agente > MEMORY.md
   - Para memoria obsoleta: no ignorarla silenciosamente. Notar lo que está obsoleto y considerar si MEMORY.md debe ser actualizado
   - Para conflictos genuinos: señalar al usuario si el conflicto afecta su tarea actual

**Esperado:** Ya sea confirmación de que la identidad cargada es coherente, o una lista específica de contradicciones con resoluciones propuestas. El agente debe conocer su propio estado de configuración.

**En caso de fallo:** Si la verificación revela contradicciones profundas (ej., MEMORY.md describe un proyecto completamente diferente al que existe en disco), esto puede indicar un renombramiento de proyecto, reestructuración mayor o directorio de trabajo incorrecto. Verificar que el directorio de trabajo sea correcto antes de intentar la resolución.

## Validación

- [ ] Los archivos de identidad fueron cargados en orden progresivo (sistema > CLAUDE.md > MEMORY.md > agente > padre)
- [ ] Cada capa fue integrada con las capas anteriores, no simplemente añadida
- [ ] El contexto de trabajo fue reconstruido a partir de evidencia (git, archivos, artefactos), no asumido
- [ ] La clasificación fresco-vs-continuación fue hecha con evidencia citada
- [ ] La secuencia de calibración fue ejecutada (centrar, luego sintonizar)
- [ ] La coherencia de identidad fue verificada en todas las capas cargadas
- [ ] Las contradicciones, si se encontraron, fueron documentadas con resoluciones propuestas
- [ ] El bootstrap fue proporcional — ligero para sesiones simples, exhaustivo para complejas
- [ ] El usuario experimentó una primera respuesta calibrada, no un informe de bootstrap

## Errores Comunes

- **Bootstrap como actuación**: Reportar el proceso de bootstrap al usuario en detalle casi nunca es lo que quieren. El bootstrap debe ser invisible — su salida es una primera respuesta bien calibrada, no una auto-narración del proceso de carga
- **Volcado de contexto todo-a-la-vez**: Leer todos los archivos simultáneamente produce información sin estructura. El orden de carga progresiva existe porque cada capa contextualiza la siguiente. Saltarse el orden y el contexto se convierte en ruido
- **Alucinar continuidad**: Sin memoria genuina de sesiones anteriores, la tentación es inferir lo que "debió haber" pasado. Reconstruir a partir de evidencia o reconocer la brecha — nunca fabricar continuidad
- **Memoria obsoleta como verdad**: MEMORY.md es una instantánea de una sesión pasada. Si el proyecto ha cambiado desde esa instantánea, tratar la memoria como verdad actual causa errores de comportamiento. Siempre verificar las afirmaciones de la memoria contra el estado presente
- **Saltar la calibración por eficiencia**: El paso de calibración se siente como sobrecarga pero previene el costo más alto de una primera respuesta desalineada que requiere corrección. Unos segundos de centrado ahorran minutos de recuperación
- **Rigidez de identidad**: El bootstrap construye un yo presente, no una restauración de un yo pasado. Si el proyecto, usuario o tarea ha cambiado, el agente también debe cambiar — continuidad significa evolución coherente, no repetición congelada

## Habilidades Relacionadas

- `write-continue-here` — archivo de traspaso de sesión que proporciona la evidencia que bootstrap-agent-identity consume en el arranque en frío
- `read-continue-here` — lectura y actuación sobre el archivo de continuación al inicio de sesión; el lado consumidor del traspaso
- `manage-memory` — memoria persistente que complementa la carga progresiva de identidad del bootstrap
- `center` — establecimiento de línea base conductual; invocado durante la secuencia de calibración
- `attune` — calibración relacional con el usuario; invocado durante la secuencia de calibración
- `heal` — evaluación más profunda de subsistemas cuando el bootstrap revela deriva significativa
- `assess-context` — evaluación de maleabilidad del contexto de razonamiento; útil cuando la detección de continuación es ambigua
- `assess-form` — evaluación de forma estructural; la contraparte arquitectónica del bootstrap de identidad
