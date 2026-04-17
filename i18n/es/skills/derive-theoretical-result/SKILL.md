---
name: derive-theoretical-result
description: >
  Derivar un resultado teórico paso a paso desde primeros principios o teoremas
  establecidos, con cada paso justificado explícitamente y casos especiales
  verificados. Usar al derivar una fórmula o teorema desde primeros principios,
  al demostrar un enunciado matemático por deducción lógica, al re-derivar un
  resultado de libro de texto para verificación o adaptación, al extender un
  resultado conocido a un contexto más general, o al producir una derivación
  autocontenida para un artículo o tesis.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: theoretical-science
  complexity: advanced
  language: natural
  tags: theoretical, derivation, proof, first-principles, mathematics, physics
  locale: es
  source_locale: en
  source_commit: a87e5e0380bbe51f65cb0662d60c10030a81f255
  translator: claude
  translation_date: "2026-03-17"
---

# Derive Theoretical Result

Producir una derivación rigurosa, paso a paso, de un resultado teórico partiendo de axiomas declarados, primeros principios o teoremas establecidos. Cada paso algebraico o lógico está justificado explícitamente, los casos límite se verifican, y el resultado final se presenta con un glosario de notación completo.

## Cuándo Usar

- Derivar una fórmula, relación o teorema desde primeros principios (ej., derivar la ecuación de Euler-Lagrange del principio de acción)
- Demostrar un enunciado matemático por deducción lógica desde axiomas
- Re-derivar un resultado de libro de texto para verificarlo o adaptarlo a un contexto modificado
- Extender un resultado conocido a un contexto más general (ej., del espacio-tiempo plano al espacio-tiempo curvo)
- Producir una derivación autocontenida para un artículo, tesis o informe técnico

## Entradas

- **Requerido**: Resultado objetivo a derivar (ecuación, desigualdad, enunciado de teorema o relación)
- **Requerido**: Punto de partida (axiomas, postulados, resultados previamente establecidos, o Lagrangiano/Hamiltoniano)
- **Opcional**: Técnica de demostración preferida (directa, por contradicción, por inducción, variacional, constructiva)
- **Opcional**: Convenciones de notación a seguir (si se ajustan a un libro de texto o convenciones de un colaborador)
- **Opcional**: Resultados intermedios conocidos que pueden citarse sin re-derivación

## Procedimiento

### Paso 1: Declarar las Suposiciones Iniciales y el Resultado Objetivo

Escribir el contrato de la derivación explícitamente antes de cualquier cálculo:

1. **Axiomas y postulados**: Listar toda suposición en la que se basa la derivación. Para física, esto incluye el grupo de simetría, el principio de acción o los postulados de la mecánica cuántica. Para matemáticas, esto incluye el sistema axiomático y cualquier lema previamente demostrado.
2. **Resultado objetivo**: Declarar el resultado a derivar en notación matemática precisa. Si el resultado es una ecuación, escribir ambos lados. Si es una desigualdad, declarar la dirección y las condiciones de igualdad.
3. **Alcance y restricciones**: Declarar el dominio de validez (ej., "válido para partículas no relativistas sin espín en tres dimensiones"). Identificar lo que la derivación no cubre.
4. **Declaración de notación**: Definir cada símbolo que aparecerá. Esto previene ambigüedad y hace la derivación autocontenida.

```markdown
## Derivation Contract
- **Starting from**: [axioms, postulates, or established results]
- **Target**: [precise mathematical statement]
- **Domain of validity**: [restrictions and assumptions]
- **Notation**:
  - [symbol]: [meaning and units]
  - ...
```

**Esperado:** Una declaración completa e inequívoca de qué se está derivando a partir de qué, con toda la notación definida de antemano.

**En caso de fallo:** Si el resultado objetivo es ambiguo o las suposiciones iniciales están incompletas, clarificar antes de proceder. Una derivación con suposiciones ocultas no es confiable.

### Paso 2: Identificar la Maquinaria Matemática Requerida

Examinar las herramientas necesarias y verificar su aplicabilidad:

1. **Técnicas algebraicas**: Identificar manipulaciones requeridas (álgebra tensorial, álgebra de conmutadores, operaciones matriciales, expansiones en series). Verificar que las estructuras involucradas satisfacen los prerrequisitos (ej., condiciones de convergencia para series, invertibilidad para operaciones matriciales).
2. **Cálculo y análisis**: Identificar si la derivación requiere diferenciación ordinaria o parcial, integración (y sobre qué dominio), derivadas funcionales, integración de contorno o teoría de distribuciones. Verificar condiciones de regularidad (diferenciabilidad, integrabilidad, analiticidad).
3. **Simetría y teoría de grupos**: Identificar herramientas de teoría de representaciones necesarias (representaciones irreducibles, coeficientes de Clebsch-Gordan, ortogonalidad de caracteres, teorema de Wigner-Eckart).
4. **Topología y geometría** (si aplica): Identificar estructuras geométricas (variedades, fibrados, conexiones) y restricciones topológicas (términos de frontera, números de enrollamiento, teoremas de índice).
5. **Identidades y lemas conocidos**: Recopilar las identidades específicas que se invocarán (ej., identidad de Jacobi, identidad de Bianchi, integración por partes, teorema de Stokes). Declarar cada una explícitamente para que la derivación pueda citarlas por nombre.

```markdown
## Mathematical Toolkit
- **Algebra**: [techniques and prerequisites]
- **Analysis**: [calculus tools and regularity conditions]
- **Symmetry**: [group theory tools]
- **Identities to invoke**: [list with precise statements]
```

**Esperado:** Una lista de verificación de herramientas matemáticas con sus condiciones de aplicabilidad verificadas para el problema específico en cuestión.

**En caso de fallo:** Si una herramienta requerida tiene prerrequisitos no verificados (ej., diferenciación término a término de una serie cuya convergencia uniforme es desconocida), señalarlo como una brecha. O demostrar el prerrequisito o declararlo como una suposición adicional.

### Paso 3: Ejecutar la Derivación con Justificación Paso a Paso

Llevar a cabo la derivación con cada paso etiquetado y justificado:

1. **Una operación por paso**: Cada paso numerado realiza exactamente una operación algebraica o lógica. No combinar múltiples manipulaciones en un solo paso.
2. **Etiquetas de justificación**: Etiquetar cada paso con su justificación. Etiquetas comunes:
   - `[by assumption]` -- invocando un axioma o suposición declarada
   - `[by definition]` -- usando una definición previamente declarada
   - `[by {identity name}]` -- aplicando una identidad con nombre (ej., "by Jacobi identity")
   - `[by Step N]` -- citando un paso anterior en esta derivación
   - `[by {theorem name}]` -- invocando un teorema externo (declarado en el Paso 2)
3. **Puntos de control intermedios**: Después de cada 5-10 pasos, pausar y verificar:
   - Las unidades/dimensiones son consistentes en ambos lados
   - Las simetrías conocidas se preservan
   - La expresión tiene las propiedades de transformación correctas
4. **Puntos de ramificación**: Si la derivación se ramifica (ej., análisis de casos para eigenvalores degenerados vs. no degenerados), tratar cada rama como una sub-derivación etiquetada y fusionar los resultados.

```markdown
## Derivation

**Step 1.** [Starting expression]
*Justification*: [by assumption / definition]

**Step 2.** [Result of operation on Step 1]
*Justification*: [specific reason]

...

**Checkpoint (after Step N).** Verify:
- Dimensions: [check]
- Symmetry: [check]

...

**Step M.** [Final expression = Target result]
*Justification*: [final operation]  QED
```

**Esperado:** Una secuencia lineal de pasos desde el punto de partida hasta el resultado objetivo, sin brechas en la lógica. Cada paso es independientemente verificable.

**En caso de fallo:** Si un paso no se sigue del anterior, la derivación tiene una brecha. O insertar los pasos intermedios faltantes o identificar la suposición adicional necesaria. Nunca saltar un paso con "se puede demostrar que" a menos que el resultado omitido sea una identidad conocida listada en el Paso 2.

### Paso 4: Verificar Casos Límite y Valores Especiales

Validar el resultado derivado contra física o matemáticas conocidas:

1. **Casos límite**: Identificar al menos tres casos límite donde el resultado debería reducirse a algo conocido:
   - Una fórmula más simple, previamente derivada (ej., límite no relativista de un resultado relativista)
   - Un caso trivial (ej., establecer una constante de acoplamiento en cero)
   - Un régimen de parámetro extremo (ej., límite de alta temperatura o baja temperatura)

2. **Valores especiales**: Sustituir valores específicos de parámetros donde la respuesta es conocida independientemente (ej., n=1 para el átomo de hidrógeno, d=3 para resultados tridimensionales).

3. **Verificaciones de simetría**: Verificar que el resultado se transforma correctamente bajo el grupo de simetría. Si el resultado debería ser un escalar, verificar que es invariante. Si debería ser un vector, verificar su ley de transformación.

4. **Consistencia con resultados relacionados**: Comprobar que el resultado derivado es consistente con otros resultados conocidos en la misma teoría (ej., identidades de Ward, reglas de suma, relaciones de reciprocidad).

```markdown
## Limiting Case Verification
| Case | Condition | Expected Result | Derived Result | Match |
|------|-----------|----------------|----------------|-------|
| [name] | [parameter limit] | [known result] | [substitution] | [Yes/No] |
| ... | ... | ... | ... | ... |
```

**Esperado:** Todos los casos límite y valores especiales producen los resultados esperados. La derivación es internamente consistente.

**En caso de fallo:** Un caso límite fallido indica un error en la derivación. Rastrear el fallo verificando qué paso produce primero una expresión que falla en el límite. Causas comunes: signo incorrecto, factor faltante de 2 o pi, coeficiente combinatorial incorrecto, o un paso donde el orden de los límites importa.

### Paso 5: Presentar la Derivación Completa con Glosario de Notación

Ensamblar la derivación final y pulida:

1. **Estructura narrativa**: Escribir un párrafo introductorio breve declarando la motivación física o matemática, el enfoque y el resultado principal.
2. **Cuerpo de la derivación**: Presentar los pasos del Paso 3, limpiados para legibilidad. Agrupar pasos relacionados en bloques lógicos con encabezados descriptivos (ej., "Expandiendo la acción a segundo orden", "Aplicando la condición de fase estacionaria").
3. **Cuadro del resultado**: Declarar el resultado final en un bloque destacado, claramente separado de la derivación.
4. **Glosario de notación**: Compilar cada símbolo usado en la derivación con su significado, unidades (si es físico) y primera aparición.
5. **Resumen de suposiciones**: Listar todas las suposiciones en un solo lugar, distinguiendo postulados fundamentales de suposiciones técnicas (ej., suavidad, convergencia).

```markdown
## Final Result

> **Theorem/Result**: [precise statement with equation number]

## Notation Glossary
| Symbol | Meaning | Units | First appears |
|--------|---------|-------|---------------|
| [sym] | [meaning] | [units or dimensionless] | [Step N] |
| ... | ... | ... | ... |

## Assumptions
1. [Fundamental postulate 1]
2. [Technical assumption 1]
3. ...
```

**Esperado:** Un documento autocontenido que un lector puede seguir de principio a fin sin consultar referencias externas, excepto por las identidades y teoremas explícitamente citados.

**En caso de fallo:** Si la derivación es demasiado larga para un solo documento (más de ~50 pasos), dividirla en lemas. Derivar cada lema por separado, luego ensamblar el resultado principal citando los lemas.

## Validación

- [ ] Todas las suposiciones iniciales están declaradas explícitamente antes del primer paso de cálculo
- [ ] Cada paso de la derivación tiene una justificación etiquetada (sin saltos injustificados)
- [ ] Las unidades y dimensiones son consistentes en cada punto de control intermedio
- [ ] Al menos tres casos límite se verifican y producen resultados esperados
- [ ] Los valores especiales coinciden con respuestas conocidas independientemente
- [ ] El resultado se transforma correctamente bajo el grupo de simetría declarado
- [ ] Un glosario de notación define cada símbolo usado
- [ ] La derivación está completa: ningún paso se difiere con "se puede demostrar"
- [ ] El dominio de validez se declara explícitamente con el resultado final

## Errores Comunes

- **Suposiciones ocultas**: Asumir que una función es analítica, que una serie converge o que una integral existe sin declararlo. Cada condición de regularidad es una suposición y debe declararse.
- **Errores de signo**: El error mecánico más común. Verificar signos en cada paso rastreándolos a través de sustituciones. Verificar cruzadamente contra análisis dimensional (un error de signo frecuentemente produce una expresión dimensionalmente inconsistente).
- **Términos de frontera descartados**: Al integrar por partes o aplicar el teorema de Stokes, los términos de frontera se anulan solo si se cumplen condiciones específicas. Declarar por qué se anulan (ej., "porque el campo decae más rápido que 1/r en el infinito").
- **Orden de límites**: Tomar límites en el orden incorrecto puede dar resultados diferentes (ej., límite termodinámico antes del límite de temperatura cero). Declarar el orden explícitamente y justificarlo.
- **Razonamiento circular**: Usar el resultado a derivar como un paso intermedio. Esto es especialmente sutil cuando el resultado es una fórmula conocida que "parece obvia." Cada paso debe seguirse del punto de partida declarado, no de la familiaridad con la respuesta.
- **Colisiones de notación**: Usar el mismo símbolo para diferentes cantidades (ej., 'E' para energía y para campo eléctrico). El glosario de notación previene esto, pero solo si se escribe antes de la derivación en lugar de después.

## Habilidades Relacionadas

- `formulate-quantum-problem` -- formular el marco de mecánica cuántica antes de derivar resultados de él
- `survey-theoretical-literature` -- encontrar derivaciones previas del mismo resultado o resultados relacionados para comparación
