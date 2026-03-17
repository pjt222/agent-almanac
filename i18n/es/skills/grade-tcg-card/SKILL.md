---
name: grade-tcg-card
description: >
  Calificar una carta coleccionable usando estándares PSA, BGS o CGC. Cubre
  evaluación con observación primero (adaptada de la observación sin sesgo de
  meditate), medición de centrado, análisis de superficie, evaluación de bordes
  y esquinas, y asignación de calificación final con intervalo de confianza.
  Soporta cartas de Pokemon, MTG, Flesh and Blood y Kayou. Usar al evaluar
  una carta antes de enviarla a calificación profesional, al pre-filtrar una
  colección para candidatos de alta calificación, al resolver disputas de
  condición entre compradores y vendedores, o al estimar el rango de valor
  dependiente de la calificación para una carta.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: tcg
  complexity: intermediate
  language: natural
  tags: tcg, grading, psa, bgs, cgc, pokemon, mtg, fab, kayou, cards, collecting
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Grade TCG Card

Evaluar y calificar una carta coleccionable siguiendo estándares de calificación profesional (PSA, BGS, CGC). Usa un protocolo de observación primero adaptado de la habilidad `meditate` para prevenir el anclaje de calificación — el sesgo de calificación más común.

## Cuándo Usar

- Evaluar una carta antes de enviarla a un servicio de calificación profesional
- Pre-filtrar una colección para identificar candidatos de alta calificación que valga la pena enviar
- Resolver disputas sobre la condición de una carta entre compradores y vendedores
- Aprender a calificar consistentemente siguiendo un protocolo de evaluación estructurado
- Estimar el rango de valor dependiente de la calificación para una carta específica

## Entradas

- **Requerido**: Identificación de la carta (set, número, nombre, variante/edición)
- **Requerido**: Imágenes de la carta o descripción física (anverso y reverso)
- **Requerido**: Estándar de calificación a aplicar (PSA 1-10, BGS 1-10 con sub-calificaciones, CGC 1-10)
- **Opcional**: Valor de mercado conocido en diferentes calificaciones (para análisis calificación-valor)
- **Opcional**: Juego de cartas (Pokemon, Magic: The Gathering, Flesh and Blood, Kayou)

## Procedimiento

### Paso 1: Eliminar sesgo — Observación sin prejuicio

Adaptado de `meditate` Pasos 2-3: observar la carta sin anclarse a la calificación esperada o el valor de mercado.

1. Dejar de lado cualquier conocimiento del valor de mercado de la carta
2. NO buscar ventas recientes o informes de población antes de calificar
3. Si sabes que la carta es "valiosa," reconocer ese sesgo explícitamente:
   - "Sé que esta carta vale $X en PSA 10. Estoy dejando eso de lado."
4. Examinar la carta como un objeto físico primero, no como un coleccionable
5. Notar tu impresión inicial instintiva pero NO dejar que ancle la evaluación
6. Etiquetar cualquier pensamiento prematuro de calificación como "anclaje" y volver a la observación

**Esperado:** Un estado inicial neutral donde la carta se evalúa puramente por su condición física, no por expectativas de mercado. El anclaje de calificación (conocer el valor antes de calificar) es la fuente #1 de inconsistencia en la calificación.

**En caso de fallo:** Si el sesgo se siente pegajoso (una carta de alto valor te hace querer ver un 10), escribir el sesgo explícitamente. Externalizarlo reduce su influencia. Proceder solo cuando puedas examinar la carta como un objeto físico.

### Paso 2: Evaluación de centrado

Medir el centrado de impresión de la carta en ambas caras.

1. Medir el ancho del borde en los cuatro lados de la cara frontal:
   - Borde izquierdo vs. derecho (centrado horizontal)
   - Borde superior vs. inferior (centrado vertical)
   - Expresar como ratio: ej., 55/45 izquierda-derecha, 60/40 arriba-abajo
2. Repetir para la cara posterior
3. Aplicar los umbrales de centrado del estándar de calificación:

```
PSA Centering Thresholds:
+-------+-------------------+-------------------+
| Grade | Front (max)       | Back (max)        |
+-------+-------------------+-------------------+
| 10    | 55/45 or better   | 75/25 or better   |
| 9     | 60/40 or better   | 90/10 or better   |
| 8     | 65/35 or better   | 90/10 or better   |
| 7     | 70/30 or better   | 90/10 or better   |
+-------+-------------------+-------------------+

BGS Centering Subgrade:
+------+-------------------+-------------------+
| Sub  | Front (max)       | Back (max)        |
+------+-------------------+-------------------+
| 10   | 50/50 perfect     | 50/50 perfect     |
| 9.5  | 55/45 or better   | 60/40 or better   |
| 9    | 60/40 or better   | 65/35 or better   |
| 8.5  | 65/35 or better   | 70/30 or better   |
+------+-------------------+-------------------+
```

4. Registrar la puntuación de centrado para cada eje y la sub-calificación aplicable

**Esperado:** Ratios numéricos de centrado para ambas caras con la calificación/sub-calificación correspondiente identificada. Esta es la medición más objetiva en el proceso de calificación.

**En caso de fallo:** Si los bordes son demasiado estrechos para medir con precisión (cartas de arte completo, impresiones sin borde), anotar "centrado N/A — sin borde" y saltar al Paso 3. Algunos servicios de calificación aplican estándares diferentes para cartas sin borde.

### Paso 3: Análisis de superficie

Examinar la superficie de la carta en busca de defectos.

1. Examinar la superficie frontal bajo buena iluminación:
   - **Defectos de impresión**: manchas de tinta, falta de tinta, líneas de impresión, inconsistencia de color
   - **Rayaduras de superficie**: visibles bajo luz directa y angular
   - **Blanqueamiento en superficie**: neblina o nubosidad de la capa superficial
   - **Hendiduras o impresiones**: abolladuras visibles bajo luz rasante
   - **Manchas o decoloración**: amarillamiento, marcas de agua, daño químico
2. Examinar la superficie posterior con los mismos criterios
3. Verificar defectos de fábrica vs. daño por manipulación:
   - Fábrica: líneas de impresión, mal corte, ondulado — puede ser menos penalizado
   - Manipulación: rayaduras, abolladuras, manchas — siempre penalizado
4. Calificar la condición de superficie:
   - Prístina (10): impecable bajo magnificación
   - Casi prístina (9-9.5): imperfecciones menores visibles solo bajo magnificación
   - Excelente (8-8.5): desgaste menor visible a simple vista
   - Buena (6-7): desgaste moderado, múltiples defectos menores
   - Regular o inferior (1-5): daño significativo visible

**Esperado:** Un inventario detallado de la superficie con cada defecto localizado, descrito y clasificado por severidad. Defectos de fábrica vs. de manipulación distinguidos.

**En caso de fallo:** Si las imágenes son de muy baja resolución para el análisis de superficie, anotar la limitación y proporcionar un rango de calificación en lugar de una calificación puntual. Recomendar inspección física.

### Paso 4: Evaluación de bordes y esquinas

Evaluar los bordes y esquinas de la carta por desgaste.

1. Examinar los cuatro bordes:
   - **Blanqueamiento**: puntos o líneas blancas a lo largo de bordes coloreados (el defecto más común)
   - **Astillado**: pequeños fragmentos de la capa del borde faltantes
   - **Rugosidad**: el borde se siente irregular o tiene micro-desgarros
   - **Separación del foil**: en cartas holofoil, verificar delaminación en los bordes
2. Examinar las cuatro esquinas:
   - **Nitidez**: la punta de la esquina es nítida y puntiaguda
   - **Redondeado**: la punta de la esquina está desgastada en una curva (leve, moderado, severo)
   - **Separación de capas**: separación de capas visible en la esquina (golpes)
   - **Doblado**: esquina volteada o con pliegue
3. Calificar la condición de bordes y esquinas usando la misma escala que la superficie
4. Anotar qué esquinas/bordes específicos tienen la peor condición

**Esperado:** Evaluación de condición por borde y por esquina. La peor esquina/borde individual típicamente limita la calificación general.

**En caso de fallo:** Si la carta está en una funda o toploader que oscurece los bordes, anotar qué áreas no pudieron ser completamente evaluadas.

### Paso 5: Asignar calificación final

Combinar las sub-evaluaciones en la calificación final.

1. Para **calificación PSA** (número único 1-10):
   - La calificación final está limitada por la sub-evaluación más débil
   - Una carta con superficie perfecta pero centrado 65/35 tiene tope en PSA 8
   - Aplicar el principio de "lo más bajo limita", luego ajustar hacia arriba si otras áreas son excepcionales
2. Para **calificación BGS** (cuatro sub-calificaciones → general):
   - Asignar sub-calificaciones: Centrado, Bordes, Esquinas, Superficie (cada una 1-10 en pasos de 0.5)
   - General = promedio ponderado, pero la sub-calificación más baja limita el general
   - BGS 10 Pristine requiere las cuatro sub-calificaciones en 10
   - BGS 9.5 Gem Mint requiere promedio de 9.5+ sin sub-calificación por debajo de 9
3. Para **calificación CGC** (similar a PSA con sub-calificaciones en la etiqueta):
   - Asignar Centrado, Superficie, Bordes, Esquinas
   - El general sigue la ponderación propietaria de CGC
4. Declarar la calificación final con confianza:
   - "PSA 8 (confiado)" — calificación clara, improbable que sea mayor o menor
   - "PSA 8-9 (límite)" — podría ir en cualquier dirección en el servicio de calificación
   - "PSA 7-8 (incierto)" — datos de evaluación limitados

**Esperado:** Una calificación final con nivel de confianza. Para BGS, las cuatro sub-calificaciones reportadas. La calificación está respaldada por evidencia de los Pasos 2-4.

**En caso de fallo:** Si la evaluación no es concluyente (ej., no se puede determinar si una marca de superficie es una rayadura o suciedad), proporcionar un rango de calificación y recomendar calificación profesional. Nunca asignar una calificación con confianza con datos insuficientes.

## Validación

- [ ] Verificación de sesgo completada antes de calificar (sin anclaje de calificación)
- [ ] Centrado medido en ambas caras con ratios registrados
- [ ] Superficie examinada para rayaduras, defectos de impresión, manchas, hendiduras
- [ ] Los cuatro bordes y esquinas evaluados individualmente
- [ ] Defectos de fábrica vs. de manipulación distinguidos
- [ ] Calificación final respaldada por evidencia de cada sub-evaluación
- [ ] Nivel de confianza declarado (confiado, límite, incierto)
- [ ] Estándar de calificación correctamente aplicado (umbrales PSA/BGS/CGC)

## Errores Comunes

- **Anclaje de calificación**: Conocer el valor de una carta antes de calificar sesga la evaluación hacia la calificación "esperada". Siempre evaluar físicamente primero
- **Ignorar el reverso**: La superficie posterior y el centrado posterior cuentan. Muchos calificadores se enfocan excesivamente en el anverso
- **Confundir defectos de fábrica con daño por manipulación**: Una línea de impresión de fábrica es diferente de una rayadura, pero ambas afectan la calificación
- **Sobre-calificar holofoils**: Las cartas holográficas y de foil ocultan rayaduras de superficie hasta que se ven desde el ángulo correcto. Usar múltiples ángulos de luz
- **Ilusiones ópticas de centrado**: La ubicación del arte puede hacer que el centrado parezca mejor o peor de lo que es. Medir los bordes, no el arte

## Habilidades Relacionadas

- `build-tcg-deck` — construcción de mazos donde la condición de la carta afecta la legalidad en torneos
- `manage-tcg-collection` — gestión de colección con valoración basada en calificación
- `meditate` — fuente de la técnica de observación sin prejuicio adaptada para la prevención del sesgo de calificación
