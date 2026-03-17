---
name: circuit-breaker-pattern
description: >
  Implementa lógica de disyuntor para llamadas a herramientas de agentes —
  rastreando el estado de salud de las herramientas, transitando entre estados
  cerrado/abierto/semiabierto, reduciendo el alcance de la tarea cuando las
  herramientas fallan, enrutando a alternativas mediante mapas de capacidad, y
  aplicando presupuestos de fallos para prevenir la acumulación de errores.
  Separa la orquestación (decidir qué intentar) de la ejecución (llamar
  herramientas), siguiendo el patrón del expeditor. Usar al construir agentes
  que dependen de múltiples herramientas con fiabilidad variable, al diseñar
  flujos de trabajo de agentes tolerantes a fallos, al recuperarse
  elegantemente de interrupciones de herramientas a mitad de tarea, o al
  reforzar agentes existentes contra fallos de herramientas en cascada.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: general
  complexity: intermediate
  language: multi
  tags: resilience, circuit-breaker, error-handling, graceful-degradation, tool-reliability, fault-tolerance
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Patrón de Disyuntor

Degradación elegante cuando las herramientas fallan. Un agente que llama a cinco herramientas y una está rota no debería fallar por completo — debería reconocer la herramienta rota, dejar de llamarla, reducir el alcance a lo que todavía es alcanzable, e informar honestamente sobre lo que se omitió. Esta habilidad codifica esa lógica utilizando el patrón de disyuntor de los sistemas distribuidos, adaptado a la orquestación de herramientas de agentes.

La perspectiva central, del "Problema del Fuego en la Cocina" de kirapixelads: el expeditor (capa de orquestación) no debe cocinar. La separación de responsabilidades entre decidir *qué* intentar y *cómo* intentarlo evita que el orquestador quede atrapado en el bucle de reintentos de una herramienta que falla.

## Cuándo Usar

- Al construir agentes que dependen de múltiples herramientas con fiabilidad variable
- Al diseñar flujos de trabajo de agentes tolerantes a fallos donde los resultados parciales son mejores que el fallo total
- Un agente está atascado en un bucle de reintentos en una herramienta rota en lugar de continuar con las herramientas que funcionan
- Al recuperarse elegantemente de interrupciones de herramientas a mitad de tarea
- Al reforzar agentes existentes contra fallos de herramientas en cascada
- Se están tratando como datos frescos resultados de herramientas obsoletos o en caché

## Entradas

- **Requerido**: Lista de herramientas de las que depende el agente (nombres y propósitos)
- **Requerido**: La tarea que el agente está intentando completar
- **Opcional**: Problemas de fiabilidad conocidos de herramientas o patrones de fallos pasados
- **Opcional**: Umbral de fallos (por defecto: 3 fallos consecutivos antes de abrir el circuito)
- **Opcional**: Presupuesto de fallos por ciclo (por defecto: 5 fallos totales antes de pausar e informar)
- **Opcional**: Intervalo de sondeo semiabierto (por defecto: cada 3er intento después de abrir)

## Procedimiento

### Paso 1: Construir el Mapa de Capacidades

Declarar qué proporciona cada herramienta y qué alternativas existen. Este mapa es la base para la reducción del alcance — sin él, un fallo de herramienta deja al agente adivinando qué hacer a continuación.

```yaml
capability_map:
  - tool: Grep
    provides: content search across files
    alternatives:
      - tool: Bash
        method: "rg or grep command"
        degradation: "loses Grep's built-in output formatting"
      - tool: Read
        method: "read suspected files directly"
        degradation: "requires knowing which files to check; no broad search"
    fallback: "ask the user which files to examine"

  - tool: Bash
    provides: command execution, build tools, git operations
    alternatives: []
    fallback: "report commands that need to be run manually"

  - tool: Read
    provides: file content inspection
    alternatives:
      - tool: Bash
        method: "cat or head command"
        degradation: "loses line numbering and truncation safety"
    fallback: "ask the user to paste file contents"

  - tool: Write
    provides: file creation
    alternatives:
      - tool: Edit
        method: "create via full-file edit"
        degradation: "requires file to already exist for Edit"
      - tool: Bash
        method: "echo/cat heredoc"
        degradation: "loses Write's atomic file creation"
    fallback: "output file contents for the user to save manually"

  - tool: WebSearch
    provides: external information retrieval
    alternatives: []
    fallback: "state what information is needed; ask user to provide it"
```

Para cada herramienta, documentar:
1. Qué capacidad proporciona (una línea)
2. Qué herramientas alternativas pueden cubrirla parcialmente (con notas de degradación)
3. Cuál es la alternativa manual cuando no existe alternativa de herramienta

**Esperado:** Un mapa de capacidades completo que cubra cada herramienta que usa el agente. Cada entrada tiene al menos una alternativa manual, incluso si no existe alternativa de herramienta. El mapa hace explícito lo que normalmente es implícito: qué herramientas son críticas (sin alternativas) y cuáles son sustituibles.

**En caso de fallo:** Si la lista de herramientas no está clara, comenzar con `allowed-tools` del frontmatter de la habilidad. Si las alternativas son inciertas, marcarlas como `degradation: "unknown — test before relying on this route"` en lugar de omitirlas.

### Paso 2: Inicializar el Estado del Disyuntor

Configurar el rastreador de estado para cada herramienta. Cada herramienta comienza en estado CERRADO (saludable, operación normal).

```
Circuit Breaker State Table:
+------------+--------+-------------------+------------------+-----------------+
| Tool       | State  | Consecutive Fails | Last Failure     | Last Success    |
+------------+--------+-------------------+------------------+-----------------+
| Grep       | CLOSED | 0                 | —                | —               |
| Bash       | CLOSED | 0                 | —                | —               |
| Read       | CLOSED | 0                 | —                | —               |
| Write      | CLOSED | 0                 | —                | —               |
| Edit       | CLOSED | 0                 | —                | —               |
| WebSearch  | CLOSED | 0                 | —                | —               |
+------------+--------+-------------------+------------------+-----------------+

Failure budget: 0 / 5 consumed
```

**Definiciones de estado:**

- **CLOSED** — La herramienta está saludable. Usar normalmente. Rastrear fallos consecutivos.
- **OPEN** — La herramienta está conocidamente rota. No llamarla. Enrutar a alternativas o degradar el alcance.
- **HALF-OPEN** — La herramienta estaba rota pero puede haberse recuperado. Enviar una única llamada de sondeo. Si tiene éxito, transicionar a CLOSED. Si falla, volver a OPEN.

**Transiciones de estado:**

- CLOSED -> OPEN: Cuando los fallos consecutivos alcanzan el umbral (por defecto: 3)
- OPEN -> HALF-OPEN: Después de un intervalo configurable (p.ej., cada 3er paso de tarea)
- HALF-OPEN -> CLOSED: En llamada de sondeo exitosa
- HALF-OPEN -> OPEN: En llamada de sondeo fallida

**Esperado:** Una tabla de estado inicializada para todas las herramientas con estado CLOSED y conteos de fallos en cero. El umbral de fallos y el presupuesto se declaran explícitamente.

**En caso de fallo:** Si la lista de herramientas no puede enumerarse de antemano (descubrimiento dinámico de herramientas), inicializar el estado en el primer uso de cada herramienta. El patrón sigue aplicándose — simplemente se construye la tabla de forma incremental.

### Paso 3: Implementar el Bucle de Llamada y Rastreo

Cuando el agente necesita llamar a una herramienta, seguir esta secuencia de decisión. Esta es la lógica del expeditor — decide *si* intentar la llamada, no *cómo* ejecutarla.

```
ANTES de cada llamada a herramienta:
  1. Verificar el estado de la herramienta en la tabla del disyuntor
  2. Si está OPEN:
     a. Verificar si es momento de un sondeo semiabierto
        - Sí → transicionar a HALF-OPEN, proceder con llamada de sondeo
        - No  → omitir esta herramienta, enrutar a alternativa (Paso 4)
  3. Si está HALF-OPEN:
     a. Hacer una llamada de sondeo
     b. Éxito → transicionar a CLOSED, reiniciar fallos consecutivos a 0
     c. Fallo → transicionar a OPEN, incrementar presupuesto de fallos
  4. Si está CLOSED:
     a. Hacer la llamada normalmente

DESPUÉS de cada llamada a herramienta:
  1. Éxito:
     - Reiniciar fallos consecutivos a 0
     - Registrar marca de tiempo del último éxito
  2. Fallo:
     - Incrementar fallos consecutivos
     - Registrar marca de tiempo del último fallo y mensaje de error
     - Incrementar presupuesto de fallos consumido
     - Si fallos consecutivos >= umbral:
         transicionar a OPEN
         log: "Circuit OPENED for [tool]: [failure count] consecutive failures"
     - Si presupuesto de fallos agotado:
         PAUSAR — no continuar la tarea
         Informar al usuario (Paso 6)
```

El expeditor nunca reintenta una llamada fallida inmediatamente. Registra el fallo, verifica los umbrales y continúa. Los reintentos ocurren solo a través del mecanismo de sondeo HALF-OPEN en un paso posterior.

**Esperado:** Un bucle de decisión claro que el agente sigue antes y después de cada llamada a herramienta. El estado de salud de las herramientas se rastrea continuamente. La capa del expeditor nunca se bloquea en una herramienta que falla.

**En caso de fallo:** Si rastrear el estado entre llamadas es impráctico (p.ej., ejecución sin estado), degradar a un modelo más simple: contar los fallos totales y pausar al alcanzar el presupuesto. El disyuntor de tres estados es ideal; un contador de fallos es el patrón mínimo viable.

### Paso 4: Enrutar a Alternativas en Circuito Abierto

Cuando el circuito de una herramienta está OPEN, consultar el mapa de capacidades (Paso 1) y enrutar a la mejor alternativa disponible.

**Prioridad de enrutamiento:**

1. **Alternativa de herramienta con baja degradación** — Usar otra herramienta que proporcione capacidad similar. Anotar la degradación en la salida de la tarea.
2. **Alternativa de herramienta con alta degradación** — Usar otra herramienta con pérdida significativa de capacidad. Etiquetar explícitamente qué falta del resultado.
3. **Alternativa manual** — Informar qué no puede hacer el agente y qué información o acción necesitaría proporcionar el usuario.
4. **Reducción del alcance** — Si no existe alternativa y ninguna alternativa manual es viable, eliminar la sub-tarea dependiente del alcance por completo (Paso 5).

```
Ejemplo de decisión de enrutamiento:

Herramienta necesaria: Grep (circuito OPEN)
Tarea: encontrar todos los archivos que contienen "API_KEY"

Ruta 1: Bash con comando rg
  → Degradación: pierde el formato de salida integrado de Grep
  → Decisión: ACEPTABLE — usar esta ruta

Si Bash también está OPEN:
Ruta 2: Leer archivos de configuración sospechosos directamente
  → Degradación: requiere adivinar qué archivos; sin búsqueda amplia
  → Decisión: PARCIAL — intentar solo rutas de configuración conocidas

Si Read también está OPEN:
Ruta 3: Preguntar al usuario
  → "Necesito encontrar archivos que contengan 'API_KEY' pero mis herramientas
     de búsqueda no están disponibles. ¿Puede ejecutar: grep -r 'API_KEY' ."
  → Decisión: ALTERNATIVA — el usuario proporciona la información

Si el usuario no está disponible:
Ruta 4: Reducción del alcance
  → Eliminar "encontrar referencias a API key" del alcance de la tarea
  → Documentar: "OMITIDO: búsqueda de API key — no hay herramientas disponibles"
```

**Esperado:** Cuando el circuito de una herramienta se abre, el agente enruta transparentemente a una alternativa o degrada el alcance. La decisión de enrutamiento y cualquier degradación se documentan en la salida de la tarea para que el usuario sepa qué fue afectado.

**En caso de fallo:** Si el mapa de capacidades está incompleto (sin alternativas listadas), adoptar por defecto la reducción del alcance e informar. Nunca omitir trabajo silenciosamente — siempre documentar qué fue omitido y por qué.

### Paso 5: Reducir el Alcance al Trabajo Alcanzable

Cuando las herramientas tienen el circuito abierto y las alternativas se han agotado, reducir la tarea a lo que todavía puede completarse con herramientas que funcionan. Esto no es un fracaso — es una gestión honesta del alcance.

**Protocolo de reducción del alcance:**

1. Listar las sub-tareas restantes
2. Para cada sub-tarea, verificar qué herramientas requiere
3. Si todas las herramientas requeridas están CLOSED o tienen alternativas viables: conservar la sub-tarea
4. Si alguna herramienta requerida está OPEN sin alternativa: marcar la sub-tarea como DIFERIDA
5. Continuar con el alcance reducido
6. Informar sobre las sub-tareas diferidas al final

```
Informe de Reducción del Alcance:

Alcance original: 5 sub-tareas
  [x] 1. Leer archivos de configuración          (Read: CLOSED)
  [x] 2. Buscar patrones obsoletos               (Grep: CLOSED)
  [ ] 3. Ejecutar suite de pruebas               (Bash: OPEN — sin alternativa)
  [x] 4. Actualizar documentación                (Edit: CLOSED)
  [ ] 5. Desplegar en staging                    (Bash: OPEN — sin alternativa)

Alcance reducido: 3 sub-tareas alcanzables
Diferidas: 2 sub-tareas requieren Bash (circuito OPEN)

Recomendación: Completar sub-tareas 1, 2, 4 ahora.
Las sub-tareas 3 y 5 requieren Bash — se sondeará en el próximo ciclo
o el usuario puede ejecutar los comandos manualmente.
```

No intentar las sub-tareas diferidas. No reintentar herramientas con circuito abierto esperando que funcionen. El disyuntor existe precisamente para prevenir esto — confiar en su estado.

**Esperado:** Una partición clara de la tarea en trabajo alcanzable y diferido. El agente completa todo el trabajo alcanzable e informa sobre los elementos diferidos con el motivo y qué los desbloquearía.

**En caso de fallo:** Si la reducción del alcance elimina todas las sub-tareas (cada herramienta está rota), saltar directamente al Paso 6 — pausar e informar. Un agente sin herramientas que funcionen no debería pretender hacer progreso.

### Paso 6: Manejar la Obsolescencia y Etiquetar la Calidad de los Datos

Cuando una herramienta devuelve datos que pueden estar obsoletos (resultados en caché, instantáneas desactualizadas, contenido obtenido previamente), etiquetarlos explícitamente en lugar de tratarlos como frescos.

**Indicadores de obsolescencia:**

- La salida de la herramienta coincide exactamente con una llamada anterior (posible acierto de caché)
- Los datos referencian marcas de tiempo anteriores a la tarea actual
- La documentación de la herramienta menciona comportamiento de caché
- Los resultados contradicen otras observaciones recientes

**Protocolo de etiquetado:**

```
Al presentar datos potencialmente obsoletos:

"[STALE DATA — retrieved at {timestamp}, may not reflect current state]
 File contents as of last successful Read:
 ..."

"[CACHED RESULT — Grep returned identical results to previous call;
 filesystem may have changed since]"

"[UNVERIFIED — WebSearch result from {date}; current status unknown]"
```

Nunca presentar silenciosamente datos obsoletos como actuales. El usuario o el agente posterior debe conocer la calidad de los datos para tomar decisiones sólidas.

**Esperado:** Todas las salidas de herramientas que pueden estar obsoletas llevan etiquetas explícitas. Los datos frescos no se etiquetan (el etiquetado se reserva para la incertidumbre, no para la confirmación).

**En caso de fallo:** Si la obsolescencia no puede determinarse (sin marcas de tiempo, sin línea base de comparación), anotar la incertidumbre: "[FRESHNESS UNKNOWN — no baseline for comparison]". La incertidumbre sobre la actualidad es en sí misma información.

### Paso 7: Hacer Cumplir el Presupuesto de Fallos

Rastrear los fallos totales en todas las herramientas. Cuando el presupuesto se agota, el agente pausa e informa en lugar de continuar acumulando errores.

```
Aplicación del Presupuesto de Fallos:

Presupuesto: 5 fallos por ciclo
Actual: 4 / 5 consumidos

  Fallo 1: Bash — "permission denied" (paso 3)
  Fallo 2: Bash — "command not found" (paso 3)
  Fallo 3: Bash — "timeout after 120s" (paso 4)
  Fallo 4: WebSearch — "connection refused" (paso 5)

Estado: 1 fallo restante antes de la pausa obligatoria

→ La siguiente llamada a herramienta procede con mayor precaución
→ Si falla: PAUSAR y generar informe de estado
```

**Al agotar el presupuesto:**

```
FAILURE BUDGET EXHAUSTED — PAUSING

Completed work:
  - Sub-task 1: Read configuration files (SUCCESS)
  - Sub-task 2: Search for deprecated patterns (SUCCESS)

Incomplete work:
  - Sub-task 3: Run test suite (FAILED — Bash circuit OPEN)
  - Sub-task 4: Update documentation (NOT ATTEMPTED — paused)
  - Sub-task 5: Deploy to staging (NOT ATTEMPTED — paused)

Tool health:
  Grep: CLOSED (healthy)
  Read: CLOSED (healthy)
  Edit: CLOSED (healthy)
  Bash: OPEN (3 consecutive failures — permission/command/timeout)
  WebSearch: OPEN (1 failure — connection refused)

Failures: 5 / 5 budget consumed

Recommendation:
  1. Investigate Bash failures — likely environment issue
  2. Check network connectivity for WebSearch
  3. Resume from sub-task 4 after resolution
```

La pausa e informe cumple la misma función que un disyuntor en sistemas eléctricos: previene que el daño se acumule. Un agente que sigue llamando herramientas rotas desperdicia la ventana de contexto, confunde al usuario con errores repetidos, y puede producir resultados parciales inconsistentes.

**Esperado:** El agente se detiene limpiamente cuando el presupuesto de fallos se agota. El informe incluye trabajo completado, trabajo incompleto, estado de salud de las herramientas y próximos pasos accionables.

**En caso de fallo:** Si el agente no puede generar un informe limpio (p.ej., el rastreo de estado se perdió), emitir la información disponible. Un informe parcial es mejor que la continuación silenciosa.

### Paso 8: Separación de Responsabilidades — Expeditor vs. Ejecutor

Verificar que la lógica de orquestación (Pasos 2-7) esté claramente separada de la ejecución de herramientas.

**El expeditor (orquestación) hace:**
- Rastrear el estado de salud de las herramientas
- Decidir si llamar a una herramienta, omitirla o sondearla
- Enrutar a alternativas cuando el circuito de una herramienta está abierto
- Hacer cumplir el presupuesto de fallos
- Generar informes de estado

**El expeditor NO hace:**
- Reintentar llamadas de herramienta fallidas inmediatamente
- Modificar los parámetros de llamada de herramienta para eludir errores
- Capturar y suprimir errores de herramientas
- Hacer suposiciones sobre por qué falló una herramienta
- Ejecutar lógica de alternativa que a su vez requiere herramientas

Si el expeditor está "cocinando" (haciendo llamadas a herramientas para solucionar otros fallos de herramientas), la separación está rota. El expeditor debería enrutar a una herramienta alternativa o reducir el alcance — no intentar reparar la herramienta rota.

**Esperado:** Un límite claro entre las decisiones de orquestación y la ejecución de herramientas. La capa del expeditor puede describirse sin referenciar APIs específicas de herramientas o tipos de error.

**En caso de fallo:** Si la orquestación y la ejecución están entrelazadas, refactorizar extrayendo la lógica de decisión en un paso separado que se ejecuta antes de cada llamada a herramienta. El paso de decisión produce uno de cuatro resultados: CALL, SKIP, PROBE o PAUSE. El paso de ejecución actúa sobre ese resultado.

### Paso 9: Detectar Fallos en Cascada

Cuando múltiples herramientas comparten infraestructura (red, sistema de archivos, permisos), una única causa raíz puede disparar varios disyuntores simultáneamente. Detectar y manejar este patrón correlacionado en lugar de tratar cada disyuntor de forma independiente.

**Indicadores de fallo en cascada:**

- 3+ herramientas transicionan a OPEN dentro del mismo paso de tarea o en una ventana estrecha
- Los fallos comparten una firma de error común (p.ej., "connection refused," "permission denied")
- Herramientas que previamente tenían historiales de fallos independientes fallan repentinamente juntas

**Protocolo de respuesta:**

1. Cuando un segundo disyuntor se abre, verificar si la categoría de fallo coincide con el primero
2. Si hay correlación: marcar como **fallo sistémico** — pausar todas las llamadas a herramientas, no solo las rotas
3. Informar sobre la causa raíz sospechada: "Múltiples herramientas fallando con [patrón compartido] — probablemente problema de [red/sistema de archivos/permisos]"
4. No sondear herramientas semiabiertas durante un fallo sistémico — las sondas también fallarán y desperdiciarán el presupuesto
5. Reanudar el sondeo solo después de que el usuario confirme que el problema de infraestructura está resuelto

**Retroceso compuesto:** Cuando los fallos en cascada se disparan, usar retroceso exponencial para las sondas semiabiertas: sondear en el paso 3, luego en el paso 6, luego en el paso 12. Limitar el intervalo máximo a 20 pasos para prevenir el bloqueo permanente del circuito. Esto evita sondas rápidas que abrumen un sistema en recuperación.

**Esperado:** Los fallos correlacionados se detectan y tratan como un único evento sistémico en lugar de N disparos de disyuntor independientes. El presupuesto de fallos cuenta el evento sistémico una vez, no N veces.

**En caso de fallo:** Si la detección de correlación es impráctica (los fallos tienen diferentes firmas de error a pesar de una causa compartida), recurrir a disyuntores independientes por herramienta. El sistema aún degrada elegantemente — simplemente consume el presupuesto más rápido.

### Paso 10: Capa de Selección de Herramientas Previa a la Llamada

Antes de activar el bucle del disyuntor (Paso 3), opcionalmente verificar que una herramienta está disponible y es probable que tenga éxito. Esto reduce los disparos innecesarios del disyuntor por fallos predecibles.

**Verificaciones previas a la llamada:**

| Verificación | Método | Acción al fallar |
|--------------|--------|-----------------|
| La herramienta existe | Verificar que está en la lista de allowed-tools | Omitir — ni siquiera intentar |
| Estado del servidor MCP | Verificar el estado del proceso/conexión del servidor | Enrutar a alternativa inmediatamente |
| Disponibilidad de recursos | Verificar que existe el archivo/URL/endpoint objetivo | Enrutar o degradar el alcance |

**Tabla de decisión:**

```
Puntuación previa a la llamada:
  AVAILABLE  → proceder al bucle del disyuntor (Paso 3)
  DEGRADED   → proceder con precaución, reducir el umbral de fallos en 1
  UNAVAILABLE → omitir herramienta, enrutar a alternativa (Paso 4) sin consumir presupuesto
```

Las verificaciones previas a la llamada son orientativas, no autoritativas. Una herramienta que pasa las verificaciones previas puede aún fallar durante la ejecución. El disyuntor sigue siendo el mecanismo principal de fiabilidad.

**Esperado:** Los fallos predecibles (herramientas faltantes, servidores inalcanzables) se detectan antes de que consuman el presupuesto de fallos. El disyuntor maneja solo los fallos genuinos en tiempo de ejecución.

**En caso de fallo:** Si las verificaciones previas a la llamada no están disponibles o añaden demasiada sobrecarga, omitir este paso completamente. El bucle del disyuntor del Paso 3 maneja todos los fallos — la selección previa a la llamada es una optimización, no un requisito.

## Validación

- [ ] El mapa de capacidades cubre todas las herramientas con alternativas y alternativas manuales documentadas
- [ ] La tabla de estado del disyuntor está inicializada para todas las herramientas
- [ ] Las transiciones de estado siguen el ciclo CLOSED -> OPEN -> HALF-OPEN -> CLOSED
- [ ] El umbral de fallos está declarado explícitamente (no implícito)
- [ ] Se intenta el enrutamiento alternativo antes de la reducción del alcance
- [ ] La reducción del alcance está documentada con sub-tareas diferidas y motivos
- [ ] Los datos obsoletos están etiquetados explícitamente — nunca presentados como frescos
- [ ] El presupuesto de fallos se hace cumplir con pausa e informe al agotarse
- [ ] La lógica del expeditor no ejecuta llamadas a herramientas ni reintenta llamadas fallidas
- [ ] El informe de estado incluye trabajo completado, incompleto y estado de salud de herramientas
- [ ] Sin fallos silenciosos — cada omisión, diferimiento y degradación está documentada
- [ ] Los fallos en cascada se detectan cuando 3+ herramientas se abren simultáneamente
- [ ] El modo de fallo sistémico pausa todas las sondas hasta que se confirme la recuperación de la infraestructura
- [ ] Las verificaciones previas a la llamada (si se usan) no consumen el presupuesto de fallos por fallos predecibles

## Errores Comunes

- **Reintentar en lugar de cortar el circuito**: Llamar repetidamente a una herramienta rota desperdicia el presupuesto de fallos y la ventana de contexto. Tres fallos consecutivos es un patrón, no mala suerte. Abrir el circuito.
- **Cocinar en el expeditor**: La capa de orquestación debería decidir *qué* intentar, no *cómo* reparar herramientas rotas. Si el expeditor está elaborando comandos de solución para fallos de Bash, ha cruzado el límite de separación.
- **Reducción silenciosa del alcance**: Omitir sub-tareas sin documentarlas produce resultados que parecen completos pero no lo están. Siempre informar qué fue omitido.
- **Tratar datos obsoletos como frescos**: Los resultados en caché o obtenidos previamente pueden no reflejar el estado actual. Etiquetar la incertidumbre en lugar de ignorarla.
- **Abrir circuitos demasiado eagerly**: Un único fallo transitorio no debería abrir el circuito. Usar un umbral (por defecto: 3) para filtrar el ruido de la señal.
- **Nunca sondear después de abrir**: Un circuito permanentemente abierto significa que el agente nunca descubre que una herramienta se ha recuperado. Las sondas semiabiertas son esenciales para la recuperación.
- **Ignorar el presupuesto de fallos**: Sin un presupuesto, un agente puede acumular docenas de fallos en diferentes herramientas mientras aún "hace progreso" en papel. El presupuesto fuerza un punto de control honesto.
- **Multiplicación de retroceso en cascada**: Cuando múltiples herramientas en una cadena de dependencias aplican cada una su propio retroceso exponencial, el retraso compuesto crece multiplicativamente. Limitar el retroceso agregado total en la cadena, no solo por herramienta.
- **Puntuaciones de descubrimiento obsoletas**: La selección previa a la llamada (Paso 10) almacena en caché evaluaciones de disponibilidad de herramientas. Si la caché no se invalida cuando las condiciones cambian, el agente puede omitir una herramienta recuperada o intentar una no disponible. Re-verificar puntuaciones después de cualquier evento de fallo sistémico.

## Habilidades Relacionadas

- `fail-early-pattern` — patrón complementario: fail-early valida entradas antes de que comience el trabajo; circuit-breaker gestiona fallos durante el trabajo
- `escalate-issues` — cuando el presupuesto de fallos se agota o la reducción del alcance es significativa, escalar a un especialista o humano
- `write-incident-runbook` — documentar patrones recurrentes de fallos de herramientas como libros de ejecución para un diagnóstico más rápido
- `assess-context` — evaluar si el enfoque actual puede adaptarse cuando múltiples herramientas están degradadas; se complementa con las decisiones de reducción del alcance
