---
name: build-tcg-deck
description: >
  Construir un mazo competitivo o casual de juego de cartas coleccionables.
  Cubre selección de arquetipo, análisis de curva de maná/energía, identificación
  de condición de victoria, posicionamiento en el meta-juego y construcción de
  sideboard para Pokemon TCG, Magic: The Gathering, Flesh and Blood y otros
  TCGs. Usar al construir un nuevo mazo para un formato de torneo o juego
  casual, adaptar un mazo existente a un meta-juego cambiado, evaluar si un
  nuevo set justifica un cambio de mazo, o convertir un concepto de mazo en
  una lista lista para torneo.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: tcg
  complexity: intermediate
  language: natural
  tags: tcg, deck-building, pokemon, mtg, fab, strategy, meta, archetype
  locale: es
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Build TCG Deck

Construir un mazo de juego de cartas coleccionables desde la selección de arquetipo hasta la optimización final, siguiendo un proceso estructurado que funciona para Pokemon TCG, Magic: The Gathering, Flesh and Blood y otros TCGs principales.

## Cuándo Usar

- Construir un nuevo mazo para un formato de torneo específico o juego casual
- Adaptar un mazo existente a un meta-juego cambiado
- Evaluar si una nueva carta o lanzamiento de set justifica un cambio de mazo
- Enseñar a alguien los principios de construcción de mazos
- Convertir un concepto de mazo en una lista lista para torneo

## Entradas

- **Requerido**: Juego de cartas (Pokemon TCG, MTG, FaB, etc.)
- **Requerido**: Formato (Standard, Expanded, Modern, Legacy, Blitz, etc.)
- **Requerido**: Objetivo (torneo competitivo, juego casual, construcción con presupuesto)
- **Opcional**: Arquetipo o estrategia preferida (aggro, control, combo, midrange)
- **Opcional**: Restricciones de presupuesto (gasto máximo, cartas ya poseídas)
- **Opcional**: Instantánea del meta-juego actual (mazos top, campo esperado)

## Procedimiento

### Paso 1: Definir el arquetipo

Elegir la identidad estratégica del mazo.

1. Identificar los arquetipos disponibles en el formato actual:
   - **Aggro**: Ganar rápidamente mediante presión temprana y atacantes eficientes
   - **Control**: Responder amenazas eficientemente, ganar en el juego tardío con ventaja de cartas
   - **Combo**: Ensamblar combinaciones específicas de cartas para sinergia poderosa o victorias instantáneas
   - **Midrange**: Estrategia flexible que cambia entre aggro y control según sea necesario
   - **Tempo**: Obtener ventaja de recursos mediante timing eficiente e interrupción
2. Seleccionar un arquetipo basándose en:
   - Preferencia y estilo de juego del jugador
   - Posicionamiento en el meta-juego (¿qué vence a los mazos top?)
   - Restricciones de presupuesto (los mazos combo a menudo necesitan cartas específicas costosas)
   - Legalidad del formato (verificar listas de prohibición y estado de rotación)
3. Identificar 1-2 condiciones de victoria primarias:
   - ¿Cómo gana realmente el juego este mazo?
   - ¿Cuál es el estado ideal del juego que este mazo intenta alcanzar?
4. Declarar la selección de arquetipo y condición de victoria claramente

**Esperado:** Un arquetipo claro con condiciones de victoria definidas. La estrategia es lo suficientemente específica para guiar la selección de cartas pero lo suficientemente flexible para adaptarse.

**En caso de fallo:** Si ningún arquetipo se siente correcto, empezar con las cartas individuales más fuertes disponibles y dejar que el arquetipo emerja del pool de cartas. A veces el mejor mazo se construye alrededor de una carta, no de un concepto.

### Paso 2: Construir el núcleo

Seleccionar las cartas que definen la estrategia del mazo.

1. Identificar el **motor central** (12-20 cartas dependiendo del juego):
   - Las cartas que directamente habilitan la condición de victoria
   - Copias máximas legales de cada carta central
   - Estas son no negociables — el mazo no funciona sin ellas
2. Añadir **cartas de soporte** (8-15 cartas):
   - Cartas que encuentran o protegen el motor central
   - Efectos de robo/búsqueda para mejorar la consistencia
   - Protección para piezas clave (contrahechizos, escudos, remoción)
3. Añadir **interacción** (8-12 cartas):
   - Remoción para las amenazas del oponente
   - Interrupción para la estrategia del oponente
   - Opciones defensivas apropiadas para el formato
4. Llenar la **base de recursos** (específica del juego):
   - MTG: Tierras (típicamente 24-26 para 60 cartas, 16-17 para 40 cartas)
   - Pokemon: Cartas de Energía (8-12 básicas + especiales)
   - FaB: Distribución de valor de pitch (balancear rojo/amarillo/azul)

**Esperado:** Una lista de mazo completa en o cerca del tamaño mínimo de mazo para el formato. Cada carta tiene un rol claro (núcleo, soporte, interacción o recurso).

**En caso de fallo:** Si la lista del mazo excede el tamaño del formato, cortar las cartas de soporte más débiles primero. Si el motor central requiere demasiadas cartas (>25), la estrategia puede ser demasiado frágil — simplificar la condición de victoria.

### Paso 3: Analizar la curva

Verificar que la distribución de recursos del mazo soporte su estrategia.

1. Graficar la **curva de maná/energía/costo**:
   - Contar cartas en cada punto de costo (0, 1, 2, 3, 4, 5+)
   - Verificar que la curva coincida con el arquetipo:
     - Aggro: pico en 1-2, cae abruptamente después de 3
     - Midrange: pico en 2-3, presencia moderada en 4-5
     - Control: curva más plana, más finalizadores de alto costo
     - Combo: concentrada en los costos de las piezas de combo
2. Verificar **distribución de color/tipo** (MTG: balance de color; Pokemon: cobertura de tipo de energía):
   - ¿Puede la base de recursos confiablemente lanzar cartas en curva?
   - ¿Hay cartas intensivas en color que necesiten soporte dedicado de recursos?
3. Verificar **balance de tipo de carta**:
   - Suficientes criaturas/atacantes para aplicar presión
   - Suficientes hechizos/entrenadores para interacción y consistencia
   - Ninguna categoría crítica completamente ausente
4. Ajustar si la curva no soporta la estrategia

**Esperado:** Una curva suave que permita al mazo ejecutar su estrategia a tiempo. Aggro juega rápido, control sobrevive temprano, combo ensambla a tiempo.

**En caso de fallo:** Si la curva es irregular (demasiadas cartas costosas, insuficientes jugadas tempranas), intercambiar cartas de soporte costosas por alternativas más baratas. La curva es más importante que cualquier carta individual.

### Paso 4: Posicionamiento en el meta-juego

Evaluar el mazo contra el campo esperado.

1. Identificar los 5 mazos top en el meta actual (usar resultados de torneos, listas de tiers)
2. Para cada mazo top, evaluar:
   - **Favorable**: Tu estrategia naturalmente contrarresta la suya (puntaje: +1)
   - **Parejo**: Ningún mazo tiene ventaja estructural (puntaje: 0)
   - **Desfavorable**: Su estrategia naturalmente contrarresta la tuya (puntaje: -1)
3. Calcular la tasa de victoria esperada contra el campo:
   - Ponderar los enfrentamientos por la cuota de meta del oponente
   - Un mazo con 60%+ de tasa de victoria esperada contra el top 5 está bien posicionado
4. Si el posicionamiento es pobre, considerar:
   - Cambiar cartas de interacción para apuntar a los peores enfrentamientos
   - Añadir sideboard (si el formato lo permite) para enfrentamientos desfavorables
   - Si un arquetipo diferente está mejor posicionado

**Esperado:** Una imagen clara de dónde se sitúa el mazo en el meta. Enfrentamientos favorables y desfavorables identificados con razones específicas.

**En caso de fallo:** Si los datos del meta no están disponibles, enfocarse en versatilidad — asegurar que el mazo pueda interactuar con múltiples estrategias en lugar de estar optimizado para un enfrentamiento.

### Paso 5: Construir el sideboard

Construir sideboard/mazo lateral para adaptación específica del formato (si aplica).

1. Para cada enfrentamiento desfavorable del Paso 4:
   - Identificar 2-4 cartas que mejoren el enfrentamiento significativamente
   - Estas deben ser cartas de alto impacto, no mejoras marginales
2. Para cada carta en el sideboard, saber:
   - Contra qué enfrentamiento(s) entra
   - Qué reemplaza del mazo principal
   - Si traerla cambia la curva del mazo significativamente
3. Verificar que el sideboard no exceda los límites del formato (MTG: 15 cartas, FaB: varía)
4. Asegurar que ninguna carta del sideboard sea solo relevante contra un mazo marginal
   - Cada espacio del sideboard debería cubrir al menos 2 enfrentamientos si es posible

**Esperado:** Un sideboard enfocado que mejore significativamente los peores enfrentamientos sin diluir la estrategia principal.

**En caso de fallo:** Si el sideboard no puede arreglar los peores enfrentamientos, el mazo puede estar mal posicionado en el meta actual. Considerar si la estrategia central necesita ajuste en lugar de parches de sideboard.

## Validación

- [ ] Arquetipo y condiciones de victoria claramente definidos
- [ ] El mazo cumple la legalidad del formato (lista de prohibición, rotación, conteo de cartas)
- [ ] Cada carta tiene un rol definido (núcleo, soporte, interacción, recurso)
- [ ] La curva de maná/energía soporta la velocidad de la estrategia
- [ ] La base de recursos puede confiablemente lanzar cartas en curva
- [ ] Enfrentamientos del meta evaluados con razonamiento específico
- [ ] El sideboard apunta a los peores enfrentamientos con planes de intercambio claros
- [ ] Restricciones de presupuesto satisfechas (si aplica)

## Errores Comunes

- **Demasiadas condiciones de victoria**: Un mazo con 3 formas diferentes de ganar usualmente no hace ninguna bien. Enfocarse en 1-2
- **Ceguera de curva**: Añadir cartas poderosas costosas sin verificar si el mazo puede lanzarlas a tiempo
- **Ignorar el meta**: Construir en un vacío. El mejor mazo en teoría pierde contra el mazo más común en la práctica
- **Inclusión emocional de cartas**: Mantener una carta favorita que no sirve a la estrategia. Cada espacio debe ganarse su lugar
- **Sideboard como ocurrencia tardía**: Construir el sideboard al final con cartas sobrantes. El sideboard es parte del mazo, no un apéndice
- **Sobre-tecnificar**: Llenar el mazo con respuestas estrechas a mazos específicos en lugar de estrategia proactiva

## Habilidades Relacionadas

- `grade-tcg-card` — Evaluación de condición de cartas para legalidad en torneos y valor de colección
- `manage-tcg-collection` — Gestión de inventario para rastrear qué cartas están disponibles para construcción de mazos
