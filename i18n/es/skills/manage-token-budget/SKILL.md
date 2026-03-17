---
name: manage-token-budget
description: >
  Monitorea, limita y recupera de la acumulación de contexto en sistemas
  agénticos. Cubre el seguimiento de costos por ciclo, la auditoría de la
  ventana de contexto, los límites de presupuesto con políticas de aplicación,
  la poda de emergencia al acercarse a los límites y la integración de
  divulgación progresiva para minimizar el gasto de tokens en el enrutamiento.
  Usar al ejecutar bucles de agentes de larga duración (latidos, sondeo,
  flujos de trabajo autónomos), cuando las ventanas de contexto crecen de
  forma impredecible entre ciclos, cuando los costos de API superan las líneas
  de base esperadas, al diseñar nuevos flujos de trabajo agénticos que necesitan
  restricciones de costo desde el inicio, o cuando el análisis post-mortem
  revela un incidente de costo causado por la acumulación de contexto.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: token-management, cost-optimization, context-window, budget, progressive-disclosure
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Gestionar el Presupuesto de Tokens

Controla el costo y la huella de contexto de los sistemas agénticos mediante el seguimiento del uso de tokens por ciclo, la auditoría de qué consume el espacio de contexto, la aplicación de límites de presupuesto, la poda de contexto de bajo valor bajo presión y el enrutamiento a través de metadatos antes de cargar procedimientos completos. El principio central: cada token en la ventana de contexto debe ganarse su lugar. Los tokens que informan decisiones permanecen; los tokens que ocupan espacio sin influir en la salida se podan.

Evidencia de la comunidad: una sesión autónoma de 37 horas costó $13,74 a partir de un intervalo de latido de 30 minutos combinado con instrucciones del sistema detalladas y acumulación de contexto sin control. La solución fue reescribir el latido a intervalos de 4 horas, cambiar al modo solo notificaciones y eliminar la navegación de feeds del bucle. Esta habilidad codifica los patrones que previenen tales incidentes.

## Cuándo Usar

- Al ejecutar bucles de agentes de larga duración (latidos, ciclos de sondeo, flujos de trabajo autónomos) donde los costos se acumulan con el tiempo
- Las ventanas de contexto crecen de forma impredecible entre ciclos de ejecución
- Los costos de API han superado las líneas de base esperadas y se necesita un post-mortem
- Al diseñar un nuevo flujo de trabajo agéntico y se quieren restricciones de costo integradas desde el inicio
- Tras un incidente de costo para auditar qué salió mal y prevenir su recurrencia
- Cuando los prompts del sistema, los archivos de memoria o los esquemas de herramientas han crecido lo suficiente como para dominar la ventana de contexto

## Entradas

- **Requerido**: El sistema agéntico o flujo de trabajo a presupuestar (en ejecución o planificado)
- **Requerido**: Techo de presupuesto (importe en dólares por período, o límite de tokens por ciclo)
- **Opcional**: Datos de costo actuales (registros de API, exportaciones del panel de facturación)
- **Opcional**: Tamaño de la ventana de contexto del modelo objetivo (por defecto: consultar la documentación del modelo)
- **Opcional**: Política de degradación aceptable (qué puede descartarse cuando se alcanzan los límites)

## Procedimiento

### Paso 1: Establecer el Seguimiento de Costos por Ciclo

Instrumentar el bucle agéntico para registrar el uso de tokens en cada límite de ejecución.

Para cada ciclo (latido, sondeo, ejecución de tarea), capturar:

1. **Tokens de entrada**: prompt del sistema + memoria + esquemas de herramientas + historial de conversación + nuevo contenido del usuario/sistema
2. **Tokens de salida**: la respuesta del modelo incluyendo llamadas a herramientas
3. **Costo total**: tokens de entrada x precio de entrada + tokens de salida x precio de salida
4. **Marca de tiempo del ciclo**: cuándo se ejecutó el ciclo
5. **Disparador del ciclo**: qué lo inició (temporizador, evento, acción del usuario)

Almacenar estos en un registro estructurado (líneas JSON, CSV o base de datos) — no en la propia ventana de contexto:

```
{"cycle": 47, "ts": "2026-03-12T14:30:00Z", "trigger": "heartbeat",
 "input_tokens": 18420, "output_tokens": 2105, "cost_usd": 0.0891,
 "cumulative_cost_usd": 3.42}
```

Si el sistema no tiene instrumentación, estimar a partir de la facturación de la API:

- Costo total / número de ciclos = costo promedio por ciclo
- Comparar con la línea de base esperada (precio del modelo x tamaño de contexto esperado)

**Esperado:** Un registro que muestra el recuento de tokens y costos por ciclo, con suficiente granularidad para identificar qué ciclos son costosos y por qué. El registro en sí reside fuera de la ventana de contexto.

**En caso de fallo:** Si los recuentos exactos de tokens no están disponibles (algunas APIs no devuelven metadatos de uso), usar el panel de facturación para derivar promedios. Incluso el seguimiento grueso (costo diario / recuento de ciclos diarios) revela tendencias. Si no es posible ningún seguimiento, proceder al Paso 2 y trabajar desde la auditoría de contexto — puedes estimar los costos a partir del tamaño del contexto.

### Paso 2: Auditar la Ventana de Contexto

Medir qué ocupa la ventana de contexto y clasificar los consumidores por tamaño.

Descomponer el contexto en sus componentes y medir cada uno:

1. **Prompt del sistema**: instrucciones base, contenido de CLAUDE.md, directivas de personalidad
2. **Memoria**: MEMORY.md, archivos de tema cargados a través de memoria automática
3. **Esquemas de herramientas**: definiciones de herramientas del servidor MCP, esquemas de llamada de funciones
4. **Procedimientos de habilidades**: contenido completo de SKILL.md cargado para habilidades activas
5. **Historial de conversación**: turnos anteriores en la sesión actual
6. **Contenido dinámico**: salidas de herramientas, contenidos de archivos, resultados de búsqueda del ciclo actual

Producir una tabla de presupuesto de contexto:

```
Context Budget Audit:
+------------------------+--------+------+-----------------------------------+
| Component              | Tokens | %    | Notes                             |
+------------------------+--------+------+-----------------------------------+
| System prompt          | 4,200  | 21%  | Includes CLAUDE.md chain          |
| Memory (auto-loaded)   | 3,800  | 19%  | MEMORY.md + 4 topic files         |
| Tool schemas           | 2,600  | 13%  | 3 MCP servers, 47 tools           |
| Active skill procedure | 1,900  |  9%  | Full SKILL.md loaded              |
| Conversation history   | 5,100  | 25%  | 12 prior turns                    |
| Current cycle content  | 2,400  | 12%  | Tool outputs from this cycle      |
+------------------------+--------+------+-----------------------------------+
| TOTAL                  | 20,000 | 100% | Model limit: 200,000             |
| Remaining headroom     |180,000 |      |                                   |
+------------------------+--------+------+-----------------------------------+
```

Marcar los componentes que son desproporcionadamente grandes en relación con su valor para la toma de decisiones. Un archivo de memoria de 4.000 tokens que la tarea actual nunca referencia es pura sobrecarga.

**Esperado:** Una tabla clasificada que muestra cada consumidor de contexto, su tamaño y su porcentaje de la ventana. Al menos un componente destacará como candidato para reducción — más comúnmente el historial de conversación o las salidas verbosas de herramientas.

**En caso de fallo:** Si los recuentos exactos de tokens por componente son difíciles de obtener, usar recuento de caracteres / 4 como aproximación aproximada para texto en inglés. Para datos estructurados (JSON, YAML), usar recuento de caracteres / 3. El objetivo es la clasificación relativa, no la medición exacta.

### Paso 3: Establecer Límites de Presupuesto con Políticas de Aplicación

Definir límites estrictos y suaves, y especificar qué sucede cuando se alcanza cada uno.

1. **Límite suave** (umbral de advertencia): típicamente 60-75% del límite estricto. Cuando se alcanza:
   - Registrar una advertencia con el uso actual y el presupuesto restante
   - Comenzar la poda voluntaria (Paso 4) del contexto de menor valor
   - Reducir la frecuencia del ciclo si corresponde (p.ej., intervalo de latido de 30 min a 2 h)
   - Continuar la operación con contexto degradado

2. **Límite estricto** (umbral de parada): el gasto o tamaño de contexto máximo absoluto. Cuando se alcanza:
   - Detener la operación autónoma inmediatamente
   - Enviar alerta al operador humano (notificación, correo electrónico, entrada en el registro)
   - Preservar un resumen del estado actual para reanudación
   - No iniciar otro ciclo hasta que un humano revise y autorice

3. **Límite por ciclo**: tokens o costo máximos para cualquier ciclo individual. Evita que un único ciclo desbocado consuma todo el presupuesto:
   - Si un ciclo superaría el límite, truncar las salidas de herramientas u omitir acciones de baja prioridad
   - Registrar el truncamiento para el análisis post-mortem

Documentar los límites en la configuración del flujo de trabajo:

```yaml
token_budget:
  soft_limit_usd: 5.00        # advertir y comenzar la poda
  hard_limit_usd: 10.00       # detener y alertar
  per_cycle_cap_usd: 0.50     # máximo por ciclo individual
  soft_limit_pct: 70           # % de la ventana de contexto que desencadena la poda
  hard_limit_pct: 90           # % de la ventana de contexto que desencadena la detención
  enforcement: strict          # strict = detener en límite estricto; advisory = solo registrar
  alert_channel: notification  # cómo notificar al operador
```

**Esperado:** Límites de presupuesto documentados en tres niveles (suave, estricto, por ciclo) con acciones de aplicación explícitas para cada uno. La política responde "¿qué sucede cuando alcanzamos el límite?" antes de que se alcance.

**En caso de fallo:** Si establecer límites precisos en dólares es prematuro (nuevo flujo de trabajo con perfil de costo desconocido), comenzar solo con límites de porcentaje de contexto (suave al 70%, estricto al 90%) y añadir límites en dólares tras 24-48 horas de datos de seguimiento de costos. El modo advisory (registrar pero no detener) es aceptable durante el período de calibración.

### Paso 4: Implementar la Poda de Emergencia

Al acercarse a los límites, descartar sistemáticamente el contexto de bajo valor para mantenerse dentro del presupuesto.

Orden de prioridad de poda (descartar primero el de menor valor):

1. **Salidas de herramientas antiguas**: resultados de búsqueda verbosos, contenidos de archivos o respuestas de API de ciclos anteriores que ya informaron decisiones tomadas. La decisión persiste; la evidencia puede irse.
2. **Turnos de conversación redundantes**: turnos tempranos que han sido superados por correcciones o refinamientos posteriores. Si el turno 3 pedía X y el turno 7 lo revisó a Y, el turno 3 es redundante.
3. **Formato verboso**: tablas, arte ASCII, encabezados decorativos en las salidas de herramientas. Resumir con una descripción de una línea de lo que contenía la salida.
4. **Contexto de sub-tarea completada**: para tareas en múltiples pasos, el contexto de sub-tareas que están completamente terminadas y cuyas salidas están capturadas en un resumen o archivo.
5. **Procedimientos de habilidades inactivas**: si se cargó una habilidad para un paso anterior pero ya no se está siguiendo, su texto de procedimiento completo puede descartarse.
6. **Secciones de memoria irrelevantes para la tarea actual**: memoria cargada automáticamente sobre proyectos no relacionados o sesiones pasadas.

Para cada elemento podado, preservar una lápida de una línea:

```
[PRUNED: 2,400 tokens of npm audit output from cycle 12 — 3 vulnerabilities found, all patched]
```

La lápida cuesta ~20 tokens pero preserva la conclusión relevante para la decisión.

**Esperado:** El uso de la ventana de contexto cae por debajo del límite suave tras la poda. Cada elemento podado tiene una lápida que preserva su conclusión. No se pierde información crítica para la toma de decisiones — solo la evidencia detrás de las decisiones ya tomadas.

**En caso de fallo:** Si la poda hasta el nivel de prioridad 4 aún deja el uso por encima del límite suave, el flujo de trabajo es fundamentalmente demasiado intensivo en contexto para la frecuencia de ciclo actual. Escalar al operador humano: "Uso del contexto al N% tras la poda. Opciones: (a) aumentar el intervalo de ciclo, (b) reducir el alcance por ciclo, (c) dividir en sub-flujos de trabajo, (d) aceptar mayor costo."

### Paso 5: Integrar la Divulgación Progresiva para la Carga de Habilidades

Enrutar a través de los metadatos del registro antes de cargar los procedimientos de habilidades completos — gastar tokens en el enrutamiento, no en la lectura.

El patrón:

1. **Enrutar primero**: Cuando una tarea requiere una habilidad, leer la entrada del registro de la habilidad (id, description, domain, complexity, tags) de `_registry.yml` — aproximadamente 3-5 líneas, ~50 tokens
2. **Confirmar la relevancia**: ¿La descripción del registro coincide con la necesidad actual? Si no, verificar el siguiente candidato. Esto cuesta ~50 tokens por fallo en lugar de ~500-2000 tokens para cargar un SKILL.md incorrecto
3. **Cargar al confirmar**: Solo cuando la entrada del registro confirma la relevancia, cargar el procedimiento SKILL.md completo
4. **Descargar tras el uso**: Una vez completado el procedimiento de la habilidad, el texto completo puede podarse (Paso 4, prioridad 5) — conservar solo el resumen de lo que se hizo

Aplicar el mismo patrón a otras cargas de contexto grandes:

- **Archivos de memoria**: Leer primero las líneas del índice de MEMORY.md; cargar los archivos de tema solo cuando el tema sea relevante
- **Documentación de herramientas**: Usar los nombres de herramientas y las descripciones de una línea para el enrutamiento; cargar los esquemas completos solo para las herramientas que se van a llamar
- **Contenidos de archivos**: Leer primero los listados de archivos y las firmas de funciones; cargar el contenido completo del archivo solo para las funciones que se van a modificar

```
Without progressive disclosure:
  Load 5 candidate skills → 5 × 1,500 tokens = 7,500 tokens → use 1 skill

With progressive disclosure:
  Route through 5 registry entries → 5 × 50 tokens = 250 tokens
  Load 1 matched skill → 1 × 1,500 tokens = 1,500 tokens
  Total: 1,750 tokens (77% reduction)
```

**Esperado:** La carga de habilidades sigue un patrón de dos fases: enrutamiento ligero a través de metadatos, luego carga completa solo al confirmar la coincidencia. El mismo patrón se aplica a la memoria, los esquemas de herramientas y los contenidos de archivos donde corresponda.

**En caso de fallo:** Si los metadatos del registro son insuficientes para el enrutamiento (descripciones demasiado vagas, etiquetas faltantes), mejorar las entradas del registro en lugar de abandonar la divulgación progresiva. La solución son mejores metadatos, no más carga de contexto.

### Paso 6: Diseñar Intervalos de Ciclo Conscientes del Costo

Establecer intervalos de ejecución basados en datos de costo, no en horarios arbitrarios.

1. Calcular el costo por hora al intervalo de ciclo actual:
   - `cost_per_hour = avg_cost_per_cycle × cycles_per_hour`
   - Ejemplo: $0,09/ciclo a 2 ciclos/hora = $0,18/hora = $4,32/día

2. Comparar con el presupuesto:
   - `hours_until_hard_limit = (hard_limit - cumulative_cost) / cost_per_hour`
   - Si hours_until_hard_limit < tiempo de ejecución previsto, extender el intervalo de ciclo

3. Determinar el intervalo mínimo efectivo:
   - ¿Cuál es la tasa más rápida de cambio en el sistema monitoreado? Si la fuente de datos se actualiza cada 4 horas, sondear cada 30 minutos desperdicia 7 de cada 8 ciclos
   - Hacer coincidir el intervalo de ciclo con la tasa de actualización de los datos, no con la ansiedad por perder eventos
   - Para sistemas impulsados por eventos, reemplazar el sondeo con webhooks o notificaciones push donde sea posible

4. Aplicar el intervalo:

```
Before: 30-minute heartbeat, verbose processing
  → 48 cycles/day × $0.09/cycle = $4.32/day

After: 4-hour heartbeat, notification-only
  → 6 cycles/day × $0.04/cycle = $0.24/day
  → 94% cost reduction
```

**Esperado:** El intervalo de ciclo está justificado por datos de costo y coincide con la tasa de actualización del sistema monitoreado. El compromiso intervalo-costo está documentado para que los ajustes futuros tengan una línea de base.

**En caso de fallo:** Si el sistema requiere respuesta de baja latencia y no puede tolerar intervalos más largos, reducir el costo por ciclo en su lugar (prompts del sistema más pequeños, menos esquemas de herramientas cargados, historial resumido). La ecuación del presupuesto tiene dos palancas: frecuencia y costo por ciclo.

### Paso 7: Validar los Controles de Presupuesto

Confirmar que todos los controles están funcionando y el sistema opera dentro del presupuesto.

1. **Validación del seguimiento**: Ejecutar 3-5 ciclos y verificar que los registros por ciclo se están escribiendo con recuentos de tokens precisos
2. **Prueba del límite suave**: Bajar temporalmente el límite suave y verificar que la advertencia se dispara y comienza la poda
3. **Prueba del límite estricto**: Bajar temporalmente el límite estricto y verificar que el sistema se detiene y alerta
4. **Prueba del límite por ciclo**: Inyectar una salida de herramienta grande y verificar que se trunca en lugar de superar el límite
5. **Prueba de divulgación progresiva**: Rastrear una secuencia de carga de habilidades y confirmar que enruta a través del registro antes de cargar el SKILL.md completo
6. **Proyección de costos**: A partir de los datos de validación, proyectar:
   - Costo diario con la configuración actual
   - Días hasta el límite estricto a la tasa de gasto actual
   - Costo mensual esperado

```
Budget Validation Report:
+-----------------------+----------+--------+
| Check                 | Expected | Actual |
+-----------------------+----------+--------+
| Per-cycle logging     | Present  |        |
| Soft limit warning    | Fires    |        |
| Hard limit halt       | Halts    |        |
| Per-cycle cap         | Truncates|        |
| Progressive disclosure| Routes   |        |
| Daily cost projection | < $X.XX  |        |
+-----------------------+----------+--------+
```

**Esperado:** Los cinco controles (seguimiento, límite suave, límite estricto, límite por ciclo, divulgación progresiva) están verificados funcionando. La proyección de costos está dentro del presupuesto previsto.

**En caso de fallo:** Si los controles no se disparan, verificar que el mecanismo de aplicación está conectado al bucle de ejecución real, no solo documentado. La configuración sin aplicación es un plan, no un control. Si la proyección de costos supera el presupuesto, volver al Paso 6 y ajustar el intervalo de ciclo o el costo por ciclo.

## Validación

- [ ] El seguimiento de costos por ciclo registra tokens de entrada, tokens de salida, costo y marca de tiempo para cada ciclo
- [ ] La auditoría de la ventana de contexto identifica todos los consumidores con recuentos aproximados de tokens y porcentajes
- [ ] Los límites de presupuesto están definidos en tres niveles: límite suave, límite estricto y límite por ciclo
- [ ] Cada límite tiene una acción de aplicación explícita (advertir, podar, detener, alertar)
- [ ] La poda de emergencia sigue el orden de prioridad y preserva lápidas
- [ ] La divulgación progresiva enruta a través de metadatos antes de cargar el contenido completo
- [ ] El intervalo de ciclo está justificado por datos de costo y coincide con la tasa de actualización del sistema monitoreado
- [ ] Las pruebas de validación confirman que todos los controles se disparan correctamente
- [ ] La proyección de costos está dentro del presupuesto definido
- [ ] Post-incidente: se identifica la causa raíz y hay una medida de prevención específica en su lugar

## Errores Comunes

- **Seguimiento en la ventana de contexto**: Almacenar los registros por ciclo dentro del historial de conversación infla exactamente lo que estás tratando de controlar. Registrar externamente (archivo, base de datos, API) y mantener solo el resumen actual en el contexto.
- **Límites suaves sin aplicación**: Una advertencia que nadie ve no es un control. Los límites suaves deben desencadenar una acción visible — poda, extensión del intervalo o notificación al operador. Si el sistema puede superar silenciosamente el límite suave, lo hará.
- **Podar decisiones antes de los datos**: Descartar las salidas de herramientas antes de tomar las decisiones pierde información. Podar evidencia DESPUÉS de la decisión que informó, no antes. El patrón de lápida preserva las conclusiones mientras descarta la evidencia.
- **Hacer coincidir el intervalo de ciclo con la ansiedad, no con la actualización de datos**: Sondear una fuente cada 30 minutos cuando se actualiza cada 4 horas desperdicia el 87,5% de los ciclos. Medir la tasa de actualización real de la fuente de datos antes de establecer el intervalo.
- **Cargar habilidades completas para el enrutamiento**: Leer un SKILL.md de 400 líneas para decidir "¿es esta la habilidad correcta?" cuesta 10-20 veces más que leer la entrada del registro de 3 líneas. Enrutar primero a través de metadatos; cargar el procedimiento solo al confirmar la coincidencia.
- **Ignorar el prompt del sistema**: Los prompts del sistema, las cadenas de CLAUDE.md y la memoria cargada automáticamente son costos invisibles — se pagan en cada ciclo. Un prompt del sistema de 5.000 tokens en un bucle de 48 ciclos/día cuesta 240.000 tokens de entrada/día solo para instrucciones. Auditar y reducir estos primero.
- **Límites de presupuesto sin escalada humana**: Los sistemas autónomos que alcanzan los límites de presupuesto y se degradan silenciosamente (en lugar de alertar a un humano) pueden acumular daños. Los límites estrictos deben incluir un canal de notificación humana.

## Habilidades Relacionadas

- `assess-context` — evaluar la salud estructural del contexto de razonamiento; complementa la auditoría de la ventana de contexto en el Paso 2
- `metal` — extraer la esencia conceptual de las bases de código; el patrón de divulgación progresiva aplica a la fase de prospección de metal
- `chrysopoeia` — extracción de valor y eliminación de peso muerto; aplica el mismo pensamiento de valor por token a nivel de código
- `manage-memory` — organizar y podar archivos de memoria persistente; reduce directamente el componente de memoria de los presupuestos de contexto
