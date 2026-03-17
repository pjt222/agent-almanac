---
name: evaluate-boolean-expression
description: >
  Evaluar y simplificar expresiones booleanas usando tablas de verdad, leyes
  algebraicas (De Morgan, distributiva, absorción, idempotente, consenso) y
  mapas de Karnaugh para hasta seis variables. Usar cuando se necesita reducir
  una expresión booleana a su forma mínima de suma de productos o producto de
  sumas, verificar la equivalencia lógica entre dos expresiones, o preparar
  una función minimizada para implementación a nivel de compuertas.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: digital-logic
  complexity: basic
  language: multi
  tags: digital-logic, boolean-algebra, truth-tables, karnaugh-maps, simplification
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Evaluate Boolean Expression

Reducir una expresión booleana a su forma mínima analizándola en notación canónica, construyendo una tabla de verdad, aplicando leyes de simplificación algebraica, realizando minimización por mapa de Karnaugh (hasta seis variables) y verificando que la expresión simplificada es lógicamente equivalente a la original.

## Cuándo Usar

- Simplificar una expresión booleana antes de mapearla a compuertas lógicas
- Verificar que dos expresiones booleanas son lógicamente equivalentes
- Generar una forma mínima de suma de productos (SOP) o producto de sumas (POS)
- Enseñar o revisar identidades del álgebra booleana y técnicas de reducción
- Preparar la entrada para la habilidad design-logic-circuit

## Entradas

- **Requerido**: Expresión booleana en cualquier notación común (ej., `A AND (B OR NOT C)`, `A * (B + C')`, `A & (B | ~C)`)
- **Requerido**: Forma objetivo -- SOP mínima, POS mínima o ambas
- **Opcional**: Preferencia de ordenamiento de variables para el mapa de Karnaugh
- **Opcional**: Condiciones de no importa (don't-care) (minitérminos o maxitérminos no especificados)
- **Opcional**: Una segunda expresión para verificar equivalencia

## Procedimiento

### Paso 1: Analizar y normalizar a forma canónica

Convertir la expresión de entrada en una representación interna estándar:

1. **Tokenizar**: Identificar variables (letras individuales o nombres cortos), operadores (AND, OR, NOT, XOR, NAND, NOR) y agrupación (paréntesis).
2. **Establecer notación de operadores**: Adoptar una notación consistente — `*` para AND, `+` para OR, `'` para NOT (complemento), `^` para XOR.
3. **Determinar conteo de variables**: Listar todas las variables únicas. Asignar a cada una una posición de bit (A = MSB, ... Z = LSB por defecto, o usar el ordenamiento proporcionado).
4. **Expandir a SOP canónica**: Expandir la expresión en una suma de todos los minitérminos introduciendo variables faltantes mediante la identidad `X = X*(Y + Y')`.
5. **Expandir a POS canónica**: Alternativamente, expandir en un producto de todos los maxitérminos mediante `X = X + Y*Y'`.

```markdown
## Normalized Expression
- **Variables**: [A, B, C, ...]
- **Variable count**: [n]
- **Original expression**: [as given]
- **Canonical SOP (minterms)**: Sigma m(i, j, k, ...)
- **Canonical POS (maxterms)**: Pi M(i, j, k, ...)
- **Don't-care set**: d(i, j, ...) [if any]
```

**Esperado:** La expresión se convierte a SOP y/o POS canónica con todos los minitérminos/maxitérminos explícitamente listados y las condiciones de no importa separadas.

**En caso de fallo:** Si la expresión contiene errores de sintaxis o precedencia de operadores ambigua, solicitar aclaración. La precedencia estándar es: NOT (más alta) > AND > XOR > OR (más baja). Si el conteo de variables excede 6, notar que el paso del mapa K requerirá el algoritmo Quine-McCluskey en su lugar.

### Paso 2: Construir la tabla de verdad

Construir la tabla de verdad completa para establecer el comportamiento de la función sobre todas las combinaciones de entrada:

1. **Enumerar filas**: Generar todas las 2^n combinaciones de entrada en orden de conteo binario (000, 001, 010, ...).
2. **Evaluar salida**: Para cada fila, sustituir valores en la expresión original y calcular la salida (0 o 1).
3. **Marcar no importa**: Si se proporcionaron condiciones de no importa, marcar esas filas con `X` en lugar de 0 o 1.
4. **Verificación cruzada con minitérminos**: Verificar que las filas que producen salida 1 coinciden con la lista de minitérminos del Paso 1.

```markdown
## Truth Table
| A | B | C | F |
|---|---|---|---|
| 0 | 0 | 0 | _ |
| 0 | 0 | 1 | _ |
| ... | ... | ... | ... |
```

**Esperado:** Una tabla de verdad completa con 2^n filas, salidas que coinciden con la forma canónica y condiciones de no importa correctamente marcadas.

**En caso de fallo:** Si la tabla de verdad no coincide con la forma canónica, revisar la expansión del Paso 1. Un error común es aplicar incorrectamente la ley de De Morgan durante la expansión canónica — verificar cada paso de expansión individualmente.

### Paso 3: Aplicar simplificación algebraica

Reducir la expresión usando identidades del álgebra booleana:

1. **Leyes de identidad y nulo**: `A + 0 = A`, `A * 1 = A`, `A + 1 = 1`, `A * 0 = 0`.
2. **Ley idempotente**: `A + A = A`, `A * A = A`.
3. **Ley de complemento**: `A + A' = 1`, `A * A' = 0`.
4. **Ley de absorción**: `A + A*B = A`, `A * (A + B) = A`.
5. **Teoremas de De Morgan**: `(A * B)' = A' + B'`, `(A + B)' = A' * B'`.
6. **Ley distributiva**: `A * (B + C) = A*B + A*C`, `A + B*C = (A + B) * (A + C)`.
7. **Teorema de consenso**: `A*B + A'*C + B*C = A*B + A'*C` (el término B*C es redundante).
8. **Simplificación XOR**: Reconocer patrones como `A*B' + A'*B = A ^ B`.
9. **Documentar cada paso**: Escribir la expresión después de cada aplicación de ley, citando la ley usada.

```markdown
## Algebraic Simplification Trace
1. Original: [expression]
2. Apply [law name]: [result]
3. Apply [law name]: [result]
...
n. Final algebraic form: [simplified expression]
```

**Esperado:** Una reducción paso a paso con cada aplicación de ley citada, convergiendo en una expresión más simple. La traza proporciona una prueba verificable de equivalencia.

**En caso de fallo:** Si la expresión no se simplifica más pero parece no ser mínima, proceder al Paso 4 (mapa K). Los métodos algebraicos no garantizan encontrar el mínimo global — dependen del orden en que se aplican las leyes.

### Paso 4: Minimizar mediante mapa de Karnaugh

Usar un mapa K para encontrar la forma SOP o POS probablemente mínima (para hasta 6 variables):

1. **Dibujar el mapa K**: Organizar el mapa usando ordenamiento de código Gray en los ejes.
   - 2 variables: cuadrícula 2x2
   - 3 variables: cuadrícula 2x4
   - 4 variables: cuadrícula 4x4
   - 5 variables: dos cuadrículas 4x4 (apiladas)
   - 6 variables: cuatro cuadrículas 4x4 (apiladas)
2. **Llenar celdas**: Colocar 1s (minitérminos), 0s (maxitérminos) y Xs (no importa) en las celdas correspondientes.
3. **Agrupar 1s adyacentes**: Formar grupos rectangulares de 1, 2, 4, 8, 16 o 32 celdas adyacentes (solo potencias de 2). Los grupos pueden envolver los bordes. Incluir no importa en grupos si agrandan el grupo.
4. **Extraer implicantes primos**: Cada grupo produce un término producto. Las variables constantes en el grupo aparecen en el término; las variables que cambian se eliminan.
5. **Seleccionar implicantes primos esenciales**: Identificar minitérminos cubiertos por solo un implicante primo — esos implicantes son esenciales.
6. **Cubrir minitérminos restantes**: Usar los menos implicantes primos adicionales para cubrir cualquier minitérmino no cubierto (método de Petrick si es necesario).
7. **Escribir expresión mínima**: Combinar los implicantes primos seleccionados en la SOP mínima. Para POS mínima, agrupar los 0s en su lugar.

```markdown
## K-map Result
- **Prime implicants**: [list with covered minterms]
- **Essential prime implicants**: [list]
- **Minimal SOP**: [expression]
- **Minimal POS**: [expression, if requested]
- **Literal count**: [number of literals in minimal form]
```

**Esperado:** Una SOP (y/o POS) mínima con el menor número de literales posible, con todos los implicantes primos e implicantes primos esenciales documentados.

**En caso de fallo:** Si las agrupaciones son ambiguas (existen múltiples coberturas mínimas), listar todas las formas mínimas equivalentes. Si el conteo de variables excede 6, cambiar al método tabular de Quine-McCluskey o la heurística Espresso y notar el cambio de enfoque.

### Paso 5: Verificar que la expresión simplificada coincide con la original

Confirmar la equivalencia lógica entre las expresiones simplificada y original:

1. **Comparación de tabla de verdad**: Evaluar la expresión simplificada para todas las 2^n combinaciones de entrada y comparar con la tabla de verdad del Paso 2. Cada fila que no sea de no importa debe coincidir.
2. **Prueba algebraica** (opcional): Derivar la original desde la forma simplificada (o viceversa) usando las leyes del Paso 3.
3. **Verificación puntual de casos críticos**: Verificar la entrada de todos ceros, la entrada de todos unos y cualquier entrada involucrada en un paso de simplificación complicado.
4. **Documentar resultado**: Declarar si la equivalencia se mantiene y registrar la forma mínima final.

```markdown
## Equivalence Verification
- **Method**: [truth table comparison / algebraic proof / both]
- **Mismatched rows**: [none, or list row numbers]
- **Verdict**: [Equivalent / Not equivalent]
- **Final minimal expression**: [the verified result]
```

**Esperado:** La expresión simplificada coincide con la original en todas las entradas que no son de no importa. La forma mínima final se declara claramente.

**En caso de fallo:** Si alguna fila no coincide, rastrear el error hacia atrás a través de los Pasos 3-4. Causas comunes: agrupación incorrecta del mapa K (grupo no rectangular o de tamaño que no es potencia de 2), olvidar la adyacencia envolvente, o agrupar accidentalmente una celda de 0.

## Validación

- [ ] Todas las variables en la expresión original están contabilizadas
- [ ] La SOP/POS canónica lista los minitérminos/maxitérminos correctos
- [ ] La tabla de verdad tiene exactamente 2^n filas con salidas correctas
- [ ] Las condiciones de no importa se manejan correctamente (incluidas en grupos pero no en requisitos de cobertura)
- [ ] Los pasos algebraicos citan una ley específica y son individualmente verificables
- [ ] El mapa K usa ordenamiento de código Gray en ambos ejes
- [ ] Todos los grupos en el mapa K son rectangulares y tienen tamaño de potencia de 2
- [ ] Los implicantes primos esenciales están correctamente identificados
- [ ] La expresión simplificada coincide con la original en todas las entradas que no son de no importa
- [ ] La forma final tiene el número mínimo de literales

## Errores Comunes

- **Adyacencia incorrecta del mapa K**: Olvidar que las columnas más a la izquierda y más a la derecha (y las filas superior e inferior) son adyacentes en un mapa K. Esta envoltura es esencial para encontrar los grupos más grandes posibles.
- **Grupos de tamaño no potencia de 2**: Agrupar 3 o 5 celdas juntas. Cada grupo del mapa K debe contener exactamente 1, 2, 4, 8, 16 o 32 celdas. Un grupo irregular no corresponde a un término producto válido.
- **Ignorar los no importa**: Tratar las condiciones de no importa como 0s en lugar de usarlas para agrandar grupos. Los no importa deben incluirse en grupos cuando hacerlo reduce la expresión, pero no deben ser requeridos para la cobertura.
- **Errores de precedencia de operadores**: Asumir que AND y OR tienen igual precedencia. La precedencia booleana estándar es NOT > AND > OR. Leer incorrectamente `A + B * C` como `(A + B) * C` en lugar de `A + (B * C)` cambia la función completamente.
- **Detenerse en la simplificación algebraica**: Los métodos algebraicos pueden encontrar un mínimo local, no el mínimo global. Siempre verificar con un mapa K (o Quine-McCluskey para >6 variables) para confirmar la minimalidad.
- **Confundir minitérminos y maxitérminos**: Los minitérminos son términos AND (términos producto) que aparecen en SOP; los maxitérminos son términos OR (términos suma) que aparecen en POS. El minitérmino m3 para 3 variables es A'BC; el maxitérmino M3 es A+B'+C'.

## Habilidades Relacionadas

- `design-logic-circuit` -- mapear la expresión minimizada a un circuito a nivel de compuertas
- `argumentation` -- razonamiento lógico estructurado que comparte fundamentos de lógica formal
