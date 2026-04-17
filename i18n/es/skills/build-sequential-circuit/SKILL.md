---
name: build-sequential-circuit
description: >
  Construir circuitos lógicos secuenciales (con estado) incluyendo latches,
  flip-flops, registros, contadores y máquinas de estados finitos. Cubre
  latch SR, flip-flops D y JK, contadores binarios/BCD/anillo y diseño de
  FSM Mealy/Moore con análisis de señal de reloj y temporización. Usar
  cuando un circuito debe recordar entradas pasadas, contar eventos o
  implementar una secuencia de control dependiente del estado.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: digital-logic
  complexity: advanced
  language: multi
  tags: digital-logic, sequential-circuits, flip-flops, state-machines, registers
  locale: es
  source_locale: en
  source_commit: f3953462
  translator: claude
  translation_date: "2026-03-17"
---

# Build Sequential Circuit

Diseñar un circuito lógico secuencial identificando la memoria y el tipo de estado requeridos, construyendo un diagrama de estados y tabla de transiciones, derivando ecuaciones de excitación para el tipo de flip-flop elegido, implementando el circuito a nivel de compuertas usando flip-flops y lógica combinacional, y verificando la corrección mediante análisis de diagrama de temporización y simulación de secuencia de estados.

## Cuándo Usar

- Un circuito debe recordar entradas pasadas o mantener estado interno entre ciclos de reloj
- Diseñar contadores (binario, BCD, anillo, Johnson), registros de desplazamiento o detectores de secuencia
- Implementar una máquina de estados finitos (Mealy o Moore) a partir de un diagrama de estados o expresión regular
- Agregar elementos de almacenamiento con reloj a un camino de datos combinacional (registros, etapas de pipeline)
- Preparar componentes con estado para la habilidad simulate-cpu-architecture (archivo de registros, contador de programa, FSM de control)

## Entradas

- **Requerido**: Especificación de comportamiento -- una de: diagrama de estados, tabla de estados, diagrama de temporización, expresión regular a detectar, o descripción verbal del comportamiento secuencial deseado
- **Requerido**: Características del reloj -- disparado por flanco (subida/bajada) o sensible a nivel; reloj único o multifase
- **Opcional**: Preferencia de tipo de flip-flop (D, JK, T o SR)
- **Opcional**: Tipo de reset -- síncrono, asíncrono o ninguno
- **Opcional**: Conteo máximo de estados o restricción de ancho de bits
- **Opcional**: Restricciones de temporización (tiempo de setup, tiempo de hold, frecuencia máxima de reloj)

## Procedimiento

### Paso 1: Identificar Requisitos de Memoria y Estado

Determinar qué necesita recordar el circuito y cuántos estados distintos requiere:

1. **Enumeración de estados**: Listar todos los estados distintos en los que debe estar el circuito. Para un detector de secuencia, cada estado representa el progreso a través de la secuencia objetivo. Para un contador, cada estado es un valor de cuenta.
2. **Codificación de estados**: Elegir una codificación binaria para los estados.
   - **Codificación binaria**: Usa ceil(log2(N)) flip-flops para N estados. Minimiza el conteo de flip-flops.
   - **Codificación one-hot**: Usa N flip-flops, uno por estado. Simplifica la lógica de próximo estado a costa de más flip-flops.
   - **Codificación Gray**: Los estados adyacentes difieren en exactamente un bit. Minimiza glitches transitorios durante las transiciones.
3. **Clasificación de entradas y salidas**: Identificar entradas primarias (señales externas), salidas primarias y variables de estado internas (salidas de flip-flops). Para máquinas Mealy, las salidas dependen tanto del estado como de la entrada. Para máquinas Moore, las salidas dependen solo del estado.
4. **Selección de tipo de flip-flop**: Elegir basado en las necesidades del diseño.
   - **Flip-flop D**: El más simple -- el próximo estado iguala la entrada D. Mejor opción por defecto.
   - **Flip-flop JK**: El más flexible -- J=K=1 conmuta. Bueno para contadores.
   - **Flip-flop T**: Tipo conmutación -- cambia de estado cuando T=1. Natural para contadores binarios.
   - **Latch/flip-flop SR**: Set-Reset -- evitar la condición S=R=1. Raramente preferido para diseños nuevos.

```markdown
## State Requirements
- **Number of states**: [N]
- **State encoding**: [binary / one-hot / Gray]
- **Flip-flops needed**: [count and type]
- **Machine type**: [Mealy / Moore]
- **Inputs**: [list with descriptions]
- **Outputs**: [list with descriptions]
- **Reset behavior**: [synchronous / asynchronous / none]
```

**Esperado:** Un inventario de estados completo con codificación elegida, tipo de flip-flop seleccionado y la máquina clasificada como Mealy o Moore.

**En caso de fallo:** Si el conteo de estados no es claro desde la especificación, enumerar estados trazando todas las secuencias de entrada posibles hasta la profundidad de memoria del circuito. Si el conteo excede los límites prácticos (más de 16 estados para diseño manual), considerar descomponer en FSMs más pequeñas que interactúen.

### Paso 2: Construir Diagrama de Estados y Tabla de Transiciones

Formalizar el comportamiento del circuito como un diagrama de estados y forma tabular equivalente:

1. **Diagrama de estados**: Dibujar un grafo dirigido donde:
   - Cada nodo es un estado, etiquetado con el nombre del estado y (para máquinas Moore) el valor de salida.
   - Cada arista es una transición, etiquetada con la condición de entrada y (para máquinas Mealy) el valor de salida.
   - Cada estado debe tener una arista saliente para cada combinación de entrada posible -- sin transiciones implícitas de "permanecer".
2. **Tabla de transiciones**: Convertir el diagrama a una tabla con columnas para estado presente, entrada(s), próximo estado y salida(s).
3. **Verificación de alcanzabilidad**: Comenzando desde el estado inicial/reset, verificar que todos los estados son alcanzables a través de alguna secuencia de entrada. Los estados inalcanzables indican un error de diseño o deben tratarse como condiciones indiferentes.
4. **Minimización de estados** (opcional): Verificar estados equivalentes -- dos estados son equivalentes si producen la misma salida para cada entrada y transicionan a próximos estados equivalentes. Fusionar estados equivalentes para reducir el conteo de flip-flops.

```markdown
## State Transition Table
| Present State | Input | Next State | Output |
|--------------|-------|------------|--------|
| S0           | 0     | S0         | 0      |
| S0           | 1     | S1         | 0      |
| S1           | 0     | S0         | 0      |
| S1           | 1     | S2         | 0      |
| ...          | ...   | ...        | ...    |

- **Unreachable states**: [list, or "none"]
- **Equivalent state pairs**: [list, or "none"]
```

**Esperado:** Una tabla de transición de estados completa cubriendo cada combinación de estado presente/entrada, con todos los estados alcanzables desde el estado inicial.

**En caso de fallo:** Si la tabla de transiciones tiene entradas faltantes, la especificación está incompleta. Volver a los requisitos y resolver la ambigüedad. Si existen estados inalcanzables, agregar transiciones para alcanzarlos o eliminarlos y reducir la codificación de estados.

### Paso 3: Derivar Ecuaciones de Excitación

Calcular las ecuaciones de entrada de los flip-flops (ecuaciones de excitación) a partir de la tabla de transiciones:

1. **Codificar estados**: Reemplazar los nombres de estados con su codificación binaria en la tabla de transiciones. Cada posición de bit corresponde a un flip-flop.
2. **Construir tabla de verdad por flip-flop**: Para cada flip-flop, crear una tabla de verdad con los bits del estado presente y las entradas como columnas de entrada y la entrada requerida del flip-flop como columna de salida.
   - **Flip-flop D**: D = bit del próximo estado (el caso más simple).
   - **Flip-flop JK**: Usar la tabla de excitación: 0->0 requiere J=0,K=X; 0->1 requiere J=1,K=X; 1->0 requiere J=X,K=1; 1->1 requiere J=X,K=0.
   - **Flip-flop T**: T = estado presente XOR próximo estado (T=1 cuando el bit debe cambiar).
3. **Minimizar cada ecuación**: Aplicar evaluate-boolean-expression (mapa de Karnaugh o simplificación algebraica) a cada función de entrada de flip-flop. Las condiciones indiferentes de estados inalcanzables y las entradas X de la tabla de excitación JK pueden reducir significativamente las expresiones.
4. **Derivar ecuaciones de salida**: Para máquinas Moore, expresar cada salida como función solo de los bits del estado presente. Para máquinas Mealy, expresar cada salida como función de los bits del estado presente y las entradas.

```markdown
## Excitation Equations
- **Flip-flop type**: [D / JK / T]
- **State encoding**: [binary assignment table]

| Flip-Flop | Excitation Equation          |
|-----------|------------------------------|
| Q1        | D1 = [minimized expression]  |
| Q0        | D0 = [minimized expression]  |

## Output Equations
| Output | Equation                     |
|--------|------------------------------|
| Y      | [minimized expression]       |
```

**Esperado:** Ecuaciones de excitación minimizadas para cada flip-flop y ecuaciones de salida para cada salida primaria, con todas las condiciones indiferentes explotadas.

**En caso de fallo:** Si las ecuaciones de excitación parecen demasiado complejas, reconsiderar la codificación de estados. Una codificación diferente (ej., cambiar de binaria a one-hot, o reasignar códigos de estado) puede simplificar dramáticamente la lógica combinacional. Probar al menos dos codificaciones y comparar los conteos de literales.

### Paso 4: Implementar a Nivel de Compuertas

Construir el circuito completo a partir de flip-flops y compuertas lógicas combinacionales:

1. **Colocar flip-flops**: Instanciar un flip-flop por bit de estado. Conectar todas las entradas de reloj al reloj del sistema. Conectar entradas de reset si se especifica (reset asíncrono va directamente al pin CLR/PRE del flip-flop; reset síncrono es parte de la lógica de excitación).
2. **Construir lógica de excitación**: Implementar cada ecuación de excitación como un circuito combinacional usando la habilidad design-logic-circuit. Las entradas a esta lógica son las salidas de los flip-flops del estado presente (Q, Q') y las entradas primarias.
3. **Construir lógica de salida**: Implementar cada ecuación de salida como lógica combinacional. Para máquinas Moore, esta lógica toma solo bits de estado. Para máquinas Mealy, toma bits de estado y entradas primarias.
4. **Conectar el circuito**: Cablear las salidas de la lógica de excitación a las entradas D/JK/T de los flip-flops. Cablear la lógica de salida a las salidas primarias.
5. **Agregar inicialización**: Asegurar que el circuito alcance un estado inicial conocido al encenderse. Esto típicamente significa un reset asíncrono que fuerza todos los flip-flops a 0 (o al estado inicial codificado).

```markdown
## Circuit Implementation
- **Flip-flops**: [count] x [type], [edge type]-triggered
- **Combinational gates for excitation**: [count and types]
- **Combinational gates for output**: [count and types]
- **Total gate count**: [flip-flops + combinational gates]
- **Reset mechanism**: [asynchronous CLR / synchronous mux / none]
```

**Esperado:** Un netlist completo a nivel de compuertas con flip-flops, lógica de excitación, lógica de salida, distribución de reloj y mecanismo de reset, donde cada señal tiene exactamente un controlador.

**En caso de fallo:** Si la implementación tiene realimentación fuera de los flip-flops, se ha introducido un lazo combinacional. Toda realimentación en un circuito secuencial síncrono debe pasar a través de un flip-flop. Rastrear la ruta ofensora y redirigirla a través de un registro.

### Paso 5: Verificar mediante Diagrama de Temporización y Simulación de Secuencia de Estados

Confirmar que el circuito se comporta correctamente a través de múltiples ciclos de reloj:

1. **Elegir secuencia de prueba**: Seleccionar una secuencia de entrada que ejercite cada transición de estado al menos una vez. Para detectores de secuencia, incluir la secuencia objetivo, coincidencias parciales, coincidencias superpuestas y ejecuciones sin coincidencia.
2. **Dibujar diagrama de temporización**: Para cada ciclo de reloj, registrar:
   - Flanco de reloj (subida/bajada)
   - Valores de entrada primaria (muestreados en el flanco activo del reloj)
   - Estado presente (salidas de flip-flops antes del flanco de reloj)
   - Próximo estado (salidas de flip-flops después del flanco de reloj)
   - Valores de salida (válidos después de que la lógica de salida se estabiliza)
3. **Trazar secuencia de estados**: Verificar que la secuencia de estados coincide con el diagrama de estados del Paso 2. Cada transición debe seguir una arista en el diagrama.
4. **Verificar restricciones de temporización**: Verificar que:
   - **Tiempo de setup**: Las entradas son estables durante al menos t_setup antes del flanco activo del reloj.
   - **Tiempo de hold**: Las entradas permanecen estables durante al menos t_hold después del flanco activo del reloj.
   - **Retardo reloj-a-salida**: Las salidas se estabilizan dentro del período de reloj menos el tiempo de setup de la lógica descendente.
5. **Verificación de reset**: Confirmar que aplicar reset lleva el circuito al estado inicial independientemente del estado actual.

```markdown
## Timing Verification
| Cycle | Clock | Input | Present State | Next State | Output |
|-------|-------|-------|---------------|------------|--------|
| 0     | rst   | -     | -             | S0         | 0      |
| 1     | rise  | 1     | S0            | S1         | 0      |
| 2     | rise  | 1     | S1            | S2         | 0      |
| ...   | ...   | ...   | ...           | ...        | ...    |

- **All transitions match state diagram**: [Yes / No]
- **Setup/hold violations**: [None / list]
- **Reset verified**: [Yes / No]
```

**Esperado:** Cada ciclo en el diagrama de temporización coincide con la tabla de transición de estados, las salidas son correctas para cada ciclo y no hay violaciones de temporización presentes.

**En caso de fallo:** Si una transición de estado es incorrecta, rastrear la lógica de excitación para esa combinación específica de estado presente y entrada. Si las salidas son incorrectas pero las transiciones son correctas, el error está en la lógica de salida. Si el circuito entra en un estado no intencional, verificar reset incompleto o transiciones faltantes desde códigos de estado no utilizados.

## Validación

- [ ] Todos los estados están enumerados y son alcanzables desde el estado inicial
- [ ] La codificación de estados está documentada con la tabla de asignación
- [ ] La tabla de transiciones cubre cada combinación de estado presente/entrada
- [ ] Las ecuaciones de excitación están minimizadas con condiciones indiferentes explotadas
- [ ] Las ecuaciones de salida implementan correctamente la semántica Mealy o Moore
- [ ] Cada flip-flop tiene entradas de reloj, reset y excitación conectadas
- [ ] No existen lazos de realimentación combinacional fuera de los flip-flops
- [ ] El diagrama de temporización cubre todas las transiciones de estado al menos una vez
- [ ] El reset lleva el circuito al estado inicial documentado
- [ ] Las restricciones de tiempo de setup y hold se satisfacen

## Errores Comunes

- **Transiciones de estado incompletas**: Olvidar especificar qué sucede para cada entrada en cada estado. Las transiciones faltantes a menudo causan que el circuito entre en un estado indefinido o no intencional. Siempre definir el comportamiento para todas las combinaciones de entrada.
- **Códigos de estado no utilizados**: Con N flip-flops, hay 2^N códigos posibles pero quizás menos estados válidos. Si el circuito accidentalmente entra en un código no utilizado (por ruido o encendido), puede bloquearse. Siempre agregar transiciones desde códigos no utilizados al estado de reset o demostrar que son inalcanzables.
- **Confundir salidas Mealy y Moore**: En una máquina Mealy, las salidas cambian inmediatamente cuando las entradas cambian (ruta combinacional de entrada a salida). En una máquina Moore, las salidas cambian solo en los flancos de reloj. Mezclar los dos modelos en un diseño conduce a riesgos de temporización.
- **Entradas asíncronas a circuitos síncronos**: Las señales externas no sincronizadas al reloj pueden violar tiempos de setup/hold, causando metaestabilidad. Siempre pasar las entradas asíncronas a través de un sincronizador de dos flip-flops antes de usarlas en la lógica de estado.
- **Riesgo S=R=1 del latch SR**: Activar simultáneamente Set y Reset pone al latch SR en un estado indefinido. Si se usan elementos SR, agregar lógica para garantizar que esta combinación nunca ocurra, o cambiar a flip-flops D o JK.
- **Desviación de reloj en diseños multi-flip-flop**: Si el reloj llega a diferentes flip-flops en diferentes momentos, un flip-flop puede muestrear datos obsoletos de otro. Para diseños introductorios, asumir desviación cero; para hardware real, usar síntesis de árbol de reloj.

## Habilidades Relacionadas

- `design-logic-circuit` -- diseñar los bloques de lógica combinacional de excitación y salida
- `simulate-cpu-architecture` -- usar bloques secuenciales (registros, contadores, FSMs de control) en un camino de datos de CPU
- `model-markov-chain` -- las máquinas de estados finitos comparten el marco formal de las cadenas de Markov de tiempo discreto
