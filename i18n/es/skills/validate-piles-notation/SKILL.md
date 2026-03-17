---
name: validate-piles-notation
description: >
  Analizar y validar la notacion PILES (Puzzle Input Line Entry System)
  para especificar grupos de fusion de piezas en jigsawR. Cubre validacion
  de sintaxis, analisis en listas de grupos, explicacion en lenguaje
  natural, verificacion de adyacencia contra resultados de rompecabezas
  y serializacion de ida y vuelta. Usar al validar cadenas PILES
  proporcionadas por el usuario antes de pasarlas a generate_puzzle(),
  depurar problemas de grupos de fusion, explicar la notacion a usuarios,
  o probar la fidelidad de analisis/serializacion de ida y vuelta.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: intermediate
  language: R
  tags: jigsawr, piles, notation, fusion, parsing, dsl
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Validar Notacion PILES

Analizar y validar cadenas de notacion PILES para grupos de fusion de piezas de rompecabezas.

## Cuando Usar

- Validar cadenas PILES proporcionadas por el usuario antes de pasarlas a `generate_puzzle()`
- Depurar problemas de grupos de fusion (piezas incorrectas fusionadas, resultados inesperados)
- Explicar la notacion PILES a usuarios en lenguaje natural
- Probar fidelidad de ida y vuelta: analizar -> grupos -> serializar -> analizar

## Entradas

- **Requerido**: Cadena de notacion PILES (ej., `"1-2-3,4-5"`)
- **Opcional**: Objeto resultado del rompecabezas (para validacion de adyacencia y resolucion de palabras clave)
- **Opcional**: Tipo de rompecabezas (para soporte de palabras clave como `"center"`, `"ring1"`, `"R1"`)

## Procedimiento

### Paso 1: Validacion de Sintaxis

```r
library(jigsawR)
result <- validate_piles_syntax("1-2-3,4-5")
# Returns TRUE if valid, error message if invalid
```

Verificar errores comunes de sintaxis:
- Parentesis no coincidentes: `"1-2(-3)-4"` con `()` no coincidentes
- Caracteres invalidos: solo se permiten digitos, `-`, `,`, `:`, `(`, `)` y palabras clave
- Grupos vacios: `"1-2,,3-4"` (doble coma)

**Esperado:** `TRUE` para sintaxis valida, error descriptivo para invalida.

**En caso de fallo:** Imprimir la cadena PILES exacta y el mensaje de error de validacion.

### Paso 2: Analizar en Grupos

```r
groups <- parse_piles("1-2-3,4-5")
# Returns: list(c(1, 2, 3), c(4, 5))
```

Para cadenas con rangos:
```r
groups <- parse_piles("1:6,7-8")
# Returns: list(c(1, 2, 3, 4, 5, 6), c(7, 8))
```

**Esperado:** Lista de vectores enteros, uno por grupo de fusion, con IDs de piezas correctos y limites de grupo.

**En caso de fallo:** Verificar que la cadena PILES paso la validacion de sintaxis en el Paso 1 primero. Si el analisis retorna grupos inesperados, verificar que `-` separa piezas dentro de un grupo y `,` separa grupos, y que la notacion de rango (`:`) se expande a puntos finales inclusivos.

### Paso 3: Explicar en Lenguaje Natural

Describir cada grupo para el usuario:

- `"1-2-3,4-5"` -> "Grupo 1: fusionar piezas 1, 2 y 3. Grupo 2: fusionar piezas 4 y 5."
- `"1:6"` -> "Grupo 1: fusionar piezas 1 a 6 (6 piezas)."
- `"center,ring1"` -> "Grupo 1: pieza central. Grupo 2: todas las piezas del anillo 1."

**Esperado:** Cada grupo de fusion descrito en lenguaje natural con conteos e identificadores de piezas, haciendo la notacion comprensible para usuarios no tecnicos.

**En caso de fallo:** Si las palabras clave no se pueden explicar (ej., `"ring1"` no tiene significado claro), la notacion puede requerir un objeto resultado de rompecabezas para contexto. Aconsejar al usuario proporcionar el tipo de rompecabezas o usar IDs numericos de piezas.

### Paso 4: Validar Contra Resultado del Rompecabezas (Opcional)

Si un objeto resultado de rompecabezas esta disponible, verificar:

```r
# Generate the puzzle first
puzzle <- generate_puzzle(type = "hexagonal", grid = c(3), size = c(200))

# Parse with puzzle context (resolves keywords)
groups <- parse_fusion("center,ring1", puzzle)
```

Verificar:
- Todos los IDs de piezas existen en el rompecabezas
- Las palabras clave se resuelven a conjuntos de piezas validos
- Las piezas fusionadas son realmente adyacentes (advertencia si no)

**Esperado:** Todos los IDs de piezas validos. Las piezas adyacentes se fusionan limpiamente.

**En caso de fallo:** Listar IDs de piezas invalidos o pares no adyacentes.

### Paso 5: Serializacion de Ida y Vuelta

Verificar fidelidad de analisis/serializacion:

```r
original <- "1-2-3,4-5"
groups <- parse_piles(original)
roundtrip <- to_piles(groups)
# roundtrip should equal original (or canonical equivalent)

groups2 <- parse_piles(roundtrip)
identical(groups, groups2)  # Must be TRUE
```

**Esperado:** La ida y vuelta produce listas de grupos identicas, confirmando que `parse_piles()` y `to_piles()` son inversas.

**En caso de fallo:** Si la ida y vuelta difiere, verificar si el serializador normaliza la notacion (ej., ordenando IDs de piezas o convirtiendo rangos a listas explicitas). Las diferencias canonicas son aceptables mientras `identical(groups, groups2)` retorne `TRUE`.

## Referencia Rapida PILES

```
# Basic syntax
"1-2"           # Fusionar piezas 1 y 2
"1-2-3,4-5"     # Dos grupos: (1,2,3) y (4,5)
"1:6"           # Rango: piezas 1 a 6

# Keywords (require puzzle_result)
"center"        # Pieza central (hex/concentric)
"ring1"         # Todas las piezas del anillo 1
"R1"            # Fila 1 (rectangular)
"boundary"      # Todas las piezas del borde

# Functions
parse_piles("1-2-3,4-5")                    # Analizar cadena PILES
parse_fusion("1-2-3", puzzle)               # Auto-detectar formato
to_piles(list(c(1,2), c(3,4)))              # Convertir a PILES
validate_piles_syntax("1-2(-3)-4")          # Validar sintaxis
```

## Validacion

- [ ] `validate_piles_syntax()` retorna TRUE para cadenas validas
- [ ] `parse_piles()` retorna listas de grupos correctas
- [ ] La serializacion de ida y vuelta preserva los grupos
- [ ] Las palabras clave se resuelven correctamente con contexto del rompecabezas
- [ ] La sintaxis invalida produce mensajes de error claros

## Errores Comunes

- **Palabra clave sin contexto de rompecabezas**: Palabras clave como `"center"` requieren un objeto resultado del rompecabezas. Pasarlo a `parse_fusion()`, no a `parse_piles()`.
- **Piezas con indice 1**: Los IDs de pieza empiezan en 1, no en 0.
- **Fusion adyacente vs no adyacente**: Fusionar piezas no adyacentes funciona pero puede producir resultados visuales inesperados. Validar adyacencia cuando sea posible.
- **Notacion de rango**: `"1:6"` incluye ambos extremos (1, 2, 3, 4, 5, 6).

## Habilidades Relacionadas

- `generate-puzzle` -- generar rompecabezas con grupos de fusion
- `add-puzzle-type` -- los nuevos tipos necesitan soporte PILES/fusion
- `run-puzzle-tests` -- probar el analisis PILES con la suite completa
