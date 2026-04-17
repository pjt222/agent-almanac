---
name: design-logic-circuit
description: >
  Diseñar circuitos lógicos combinacionales desde una especificación funcional
  hasta la implementación a nivel de compuertas. Cubre compuertas AND, OR, NOT,
  XOR, NAND, NOR; conversiones de universalidad NAND/NOR; y bloques de
  construcción estándar incluyendo multiplexores, decodificadores, semi/sumadores
  completos y sumadores de acarreo en cascada. Usar al traducir una función
  booleana o tabla de verdad en una red de compuertas realizable en hardware y
  verificarla mediante simulación exhaustiva.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: digital-logic
  complexity: intermediate
  language: multi
  tags: digital-logic, combinational-circuits, logic-gates, nand-universality, adders
  locale: es
  source_locale: en
  source_commit: f3953462
  translator: claude
  translation_date: "2026-03-17"
---

# Design Logic Circuit

Traducir una especificación funcional en un circuito lógico combinacional definiendo entradas y salidas, derivando una expresión booleana mínima, mapeándola a un esquemático a nivel de compuertas, opcionalmente convirtiendo a una base de compuertas universales (solo NAND o solo NOR), y verificando la corrección mediante simulación exhaustiva contra la tabla de verdad original.

## Cuándo Usar

- Implementar una función booleana como una red de compuertas física o simulada
- Diseñar bloques de construcción combinacionales estándar (sumadores, multiplexores, decodificadores, comparadores)
- Convertir una red de compuertas arbitraria a forma solo-NAND o solo-NOR por restricciones de fabricación
- Enseñar o revisar diseño de lógica digital desde especificación hasta esquemático
- Preparar los componentes combinacionales del camino de datos necesarios para build-sequential-circuit o simulate-cpu-architecture

## Entradas

- **Requerido**: Especificación funcional -- una de: tabla de verdad, expresión booleana, descripción verbal del comportamiento entrada/salida, o un nombre de bloque estándar (ej., "sumador de acarreo en cascada de 4 bits")
- **Requerido**: Biblioteca de compuertas objetivo -- sin restricción (AND/OR/NOT), solo-NAND, solo-NOR, o una biblioteca de celdas estándar específica
- **Opcional**: Objetivo de optimización -- minimizar conteo de compuertas, minimizar retardo de propagación (camino crítico), o minimizar fan-out
- **Opcional**: Restricción máxima de fan-in (ej., solo compuertas de 2 entradas)
- **Opcional**: Condiciones de no importa para entradas que nunca ocurrirán

## Procedimiento

### Paso 1: Especificar la función del circuito

Definir la interfaz y el comportamiento del circuito completamente antes de cualquier síntesis:

1. **Señales de entrada**: Listar todas las señales de entrada con sus nombres, anchos de bit y rangos válidos. Para entradas multi-bit, especificar el ordenamiento de bits (MSB primero o LSB primero).
2. **Señales de salida**: Listar todas las señales de salida con sus nombres y anchos de bit.
3. **Tabla de verdad**: Escribir la tabla de verdad completa mapeando cada combinación de entrada a las salidas correspondientes. Para circuitos con muchas entradas, expresar la función algebraicamente o como conjunto de minitérminos/maxitérminos en su lugar.
4. **Condiciones de no importa**: Identificar combinaciones de entrada que no pueden ocurrir en la práctica (ej., entradas BCD 1010-1111) y marcarlas como no importa.
5. **Requisitos de temporización**: Notar cualquier restricción de retardo de propagación, aunque los circuitos combinacionales no tienen reloj -- la temporización aquí se refiere al peor caso de retardo de compuertas a través del camino crítico.

```markdown
## Circuit Specification
- **Name**: [descriptive name]
- **Inputs**: [list with bit widths]
- **Outputs**: [list with bit widths]
- **Function**: [verbal description]
- **Truth table or minterm list**: [table or Sigma notation]
- **Don't-care set**: [d(...) or "none"]
```

**Esperado:** Una especificación completa y no ambigua donde cada combinación de entrada legal mapea exactamente a un valor de salida.

**En caso de fallo:** Si la especificación es ambigua (ej., casos faltantes, salidas conflictivas para la misma entrada), solicitar aclaración. No asumir no importa para entradas no especificadas a menos que se indique explícitamente.

### Paso 2: Derivar la expresión booleana mínima

Obtener la expresión más simple para cada salida usando la habilidad evaluate-boolean-expression:

1. **Funciones de una salida**: Para cada bit de salida, aplicar evaluate-boolean-expression para obtener la SOP mínima (o POS, dependiendo de cuál produzca menos compuertas).
2. **Optimización multi-salida**: Si múltiples salidas comparten sub-expresiones comunes, identificar términos producto compartidos que puedan factorizarse. Esto reduce el conteo total de compuertas a costa de un ruteo ligeramente más complejo.
3. **Detección de XOR**: Buscar patrones XOR/XNOR en la tabla de verdad (patrones de tablero de ajedrez en el mapa K). Las compuertas XOR son costosas en implementaciones solo-NAND/NOR pero eficientes en bibliotecas estándar.
4. **Registrar las expresiones**: Documentar la expresión mínima para cada salida, notando el conteo de literales y el número de términos producto/suma.

```markdown
## Minimal Expressions
| Output | Minimal SOP | Literals | Terms |
|--------|-------------|----------|-------|
| F1     | [expression] | [count] | [count] |
| F2     | [expression] | [count] | [count] |
- **Shared sub-expressions**: [list, if any]
```

**Esperado:** Una expresión booleana mínima para cada salida, con sub-expresiones compartidas identificadas para circuitos multi-salida.

**En caso de fallo:** Si las expresiones parecen no mínimas (más literales de lo esperado para la complejidad de la función), volver a ejecutar el paso del mapa K o Quine-McCluskey de evaluate-boolean-expression. Para funciones con más de 6 variables, usar Espresso o un minimizador heurístico similar.

### Paso 3: Mapear al esquemático a nivel de compuertas

Convertir las expresiones booleanas en una red de compuertas lógicas:

1. **Mapeo directo (SOP)**: Cada término producto se convierte en una compuerta AND multi-entrada. La suma de productos se convierte en una compuerta OR alimentada por las compuertas AND. Cada variable complementada requiere una compuerta NOT (o usar NAND/NOR para absorber inversiones).
2. **Asignación de compuertas**: Para cada compuerta, registrar:
   - Tipo de compuerta (AND, OR, NOT, XOR, NAND, NOR)
   - Señales de entrada (por nombre o desde la salida de otra compuerta)
   - Nombre de señal de salida
   - Fan-in (número de entradas)
3. **Descomposición de fan-in**: Si una compuerta excede la restricción máxima de fan-in, descomponerla en un árbol de compuertas más pequeñas. Por ejemplo, una AND de 4 entradas con restricción de 2 entradas se convierte en dos ANDs de 2 entradas alimentando una tercera AND de 2 entradas.
4. **Notación de esquemático**: Dibujar el circuito usando notación basada en texto o describir el netlist en un formato estructurado.

```markdown
## Gate-Level Netlist
| Gate ID | Type | Inputs       | Output | Fan-in |
|---------|------|-------------|--------|--------|
| G1      | NOT  | A           | A'     | 1      |
| G2      | AND  | A', B       | w1     | 2      |
| G3      | AND  | A, C        | w2     | 2      |
| G4      | OR   | w1, w2      | F      | 2      |

- **Total gates**: [count]
- **Critical path depth**: [number of gate levels from input to output]
```

**Esperado:** Un netlist a nivel de compuertas completo donde cada salida puede rastrearse hasta las entradas primarias a través de una cadena de compuertas, sin entradas o salidas flotantes (no conectadas).

**En caso de fallo:** Si el netlist tiene cables sueltos o bucles de retroalimentación (que son inválidos en circuitos combinacionales), revisar el mapeo. Cada señal debe tener exactamente un controlador y cada entrada de compuerta debe conectarse a una entrada primaria o a la salida de otra compuerta.

### Paso 4: Convertir a base de compuertas universales (Opcional)

Transformar el circuito para usar solo compuertas NAND o solo compuertas NOR:

1. **Conversión solo-NAND**:
   - Reemplazar cada compuerta AND con una NAND seguida de un NOT (NAND con entradas unidas).
   - Reemplazar cada compuerta OR usando De Morgan: `A + B = ((A')*(B'))' = NAND(A', B')`, así que usar NOTs en las entradas y luego NAND.
   - Reemplazar cada compuerta NOT con una compuerta NAND con ambas entradas unidas: `A' = NAND(A, A)`.
   - **Empuje de burbujas**: Simplificar cancelando inversiones adyacentes. Dos NOTs en serie se cancelan. Una NAND alimentando un NOT es equivalente a una AND.
2. **Conversión solo-NOR**:
   - Reemplazar cada compuerta OR con una NOR seguida de un NOT.
   - Reemplazar cada compuerta AND usando De Morgan: `A * B = ((A')+(B'))' = NOR(A', B')`.
   - Reemplazar cada compuerta NOT con `NOR(A, A)`.
   - Aplicar empuje de burbujas para cancelar inversiones.
3. **Comparación de conteo de compuertas**: Registrar el conteo de compuertas antes y después de la conversión. Las implementaciones solo-NAND y solo-NOR típicamente usan más compuertas pero simplifican la fabricación (un solo tipo de compuerta en un chip).

```markdown
## Universal Gate Conversion
- **Target basis**: [NAND-only / NOR-only]
- **Gates before conversion**: [count]
- **Gates after conversion**: [count]
- **Gates after bubble-push optimization**: [count]
- **Conversion netlist**: [updated table]
```

**Esperado:** Un circuito funcionalmente equivalente usando solo el tipo de compuerta objetivo, con inversiones redundantes eliminadas mediante empuje de burbujas.

**En caso de fallo:** Si el circuito convertido tiene más inversiones de lo esperado, re-examinar el paso de empuje de burbujas. Un error común es olvidar que NAND y NOR son auto-duales bajo complementación -- aplicar De Morgan consistentemente desde las salidas hacia las entradas evita esto.

### Paso 5: Verificar mediante simulación exhaustiva

Confirmar que el circuito produce salidas correctas para cada entrada posible:

1. **Enfoque de simulación**: Para circuitos con hasta 16 entradas (65,536 combinaciones), simular cada entrada exhaustivamente. Para circuitos más grandes, usar vectores de prueba dirigidos cubriendo casos esquina, condiciones de frontera y muestras aleatorias.
2. **Propagar valores**: Para cada combinación de entrada, propagar valores de señal compuerta por compuerta desde entradas hasta salidas, respetando el orden topológico (ninguna compuerta se evalúa antes de que sus entradas estén listas).
3. **Comparar contra la especificación**: Verificar cada salida contra la tabla de verdad o función esperada del Paso 1. Las salidas de no importa pueden ser 0 o 1.
4. **Registrar resultados**: Registrar cualquier discrepancia con la combinación de entrada fallida y la salida esperada vs. la actual.
5. **Análisis de temporización** (opcional): Contar los niveles de compuerta en el camino más largo desde cualquier entrada hasta cualquier salida. Multiplicar por el retardo por compuerta para estimar el peor caso de retardo de propagación.

```markdown
## Simulation Results
- **Total test vectors**: [count]
- **Vectors passed**: [count]
- **Vectors failed**: [count, with details if any]
- **Critical path**: [gate sequence, e.g., G1 -> G3 -> G7 -> G9]
- **Critical path depth**: [N gate levels]
- **Estimated worst-case delay**: [N * gate_delay]
```

**Esperado:** Todos los vectores de prueba pasan. El circuito es funcionalmente correcto y la profundidad del camino crítico está documentada.

**En caso de fallo:** Si algún vector falla, rastrear la ruta de señal para esa combinación de entrada compuerta por compuerta para encontrar la primera compuerta que produce una salida incorrecta. Causas comunes: un cable conectado a la entrada de compuerta incorrecta, una inversión faltante, o un error en la conversión NAND/NOR.

## Validación

- [ ] Todas las entradas y salidas están nombradas y sus anchos de bit especificados
- [ ] La tabla de verdad o lista de minitérminos cubre todas las combinaciones de entrada legales
- [ ] Las expresiones booleanas son mínimas (verificadas mediante mapa K o Quine-McCluskey)
- [ ] Cada compuerta en el netlist tiene todas las entradas conectadas y exactamente una salida
- [ ] No existen bucles de retroalimentación combinacional en el circuito
- [ ] Las restricciones de fan-in se respetan (todas las compuertas dentro del fan-in máximo)
- [ ] La conversión NAND/NOR (si se realizó) preserva la equivalencia funcional
- [ ] El empuje de burbujas ha sido aplicado para eliminar inversiones redundantes
- [ ] La simulación exhaustiva pasa para todas las combinaciones de entrada que no son de no importa
- [ ] La profundidad del camino crítico está documentada

## Errores Comunes

- **Bucles de retroalimentación combinacional**: Conectar accidentalmente la salida de una compuerta de vuelta a su propia cadena de entrada crea un elemento secuencial (latch), no un circuito combinacional. Si se necesita estado, usar la habilidad build-sequential-circuit en su lugar.
- **Olvidar inversiones en la conversión NAND/NOR**: El error de conversión más común es perder una compuerta NOT durante la transformación de De Morgan. Siempre aplicar empuje de burbujas sistemáticamente desde las salidas hacia las entradas, no de forma ad hoc.
- **Exceder fan-in sin descomposición**: Una compuerta AND de 5 entradas no está disponible en una biblioteca de 2 entradas. Descomponer en un árbol balanceado para minimizar el retardo de propagación, no en una cadena lineal.
- **Ignorar los no importa**: No explotar las condiciones de no importa durante la minimización deja el circuito más grande de lo necesario. Siempre incluir los no importa cuando estén disponibles.
- **Confundir retardo de compuerta con retardo de cable**: En diseño introductorio, el retardo de compuerta domina. En VLSI real, el retardo de cable (capacitancia de interconexión) puede exceder el retardo de compuerta. Notar esta limitación al estimar temporización.
- **Riesgos multi-salida**: Cuando múltiples salidas comparten compuertas, cambiar la lógica de una salida puede afectar inadvertidamente una sub-expresión compartida. Verificar todas las salidas después de cualquier modificación, no solo la que se está cambiando.

## Habilidades Relacionadas

- `evaluate-boolean-expression` -- derivar la expresión booleana mínima usada como entrada para esta habilidad
- `build-sequential-circuit` -- agregar elementos de estado (flip-flops) para crear circuitos secuenciales
- `simulate-cpu-architecture` -- usar bloques combinacionales (ALU, mux, decodificador) como componentes del camino de datos
