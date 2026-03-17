---
name: build-coherence
description: >
  Coherencia de razonamiento multi-camino de IA usando democracia de abejas —
  evaluación independiente de enfoques competidores, danza de meneo como
  razonamiento en voz alta, detección de quórum para umbrales de confianza, y
  resolución de bloqueos. Usar cuando forage-solutions ha identificado múltiples
  enfoques válidos y debe hacerse una selección, cuando se oscila entre opciones
  sin comprometerse, cuando se justifica una elección de arquitectura o
  herramienta con razonamiento estructurado, o antes de una acción irreversible
  donde el costo de la elección incorrecta es alto.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: intermediate
  language: natural
  tags: swarm, coherence, approach-selection, confidence-thresholds, meta-cognition, ai-self-application
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Build Coherence

Evaluar enfoques competidores mediante evaluación independiente, defensa explícita de razonamiento en voz alta, umbrales de compromiso calibrados por confianza y resolución estructurada de bloqueos — produciendo decisiones coherentes a partir de múltiples caminos de razonamiento.

## Cuándo Usar

- `forage-solutions` ha identificado múltiples enfoques válidos y debe hacerse una selección
- Oscilando entre dos enfoques sin comprometerse con ninguno
- Necesidad de justificar una decisión con razonamiento estructurado (elección de arquitectura, selección de herramienta, estrategia de implementación)
- Cuando una decisión previa se tomó por instinto y necesita validación basada en evidencia
- Cuando el razonamiento interno produce conclusiones contradictorias y debe restaurarse la coherencia
- Antes de una acción irreversible (fusionar, desplegar, eliminar) donde el costo de la elección incorrecta es alto

## Entradas

- **Requerido**: Dos o más enfoques competidores a evaluar
- **Opcional**: Evaluaciones de calidad de exploración previa (ver `forage-solutions`)
- **Opcional**: Riesgo de la decisión (reversible, moderado, irreversible) para calibración de umbral
- **Opcional**: Presupuesto de tiempo para la decisión
- **Opcional**: Modo de fallo conocido (oscilación, compromiso prematuro, pensamiento grupal)

## Procedimiento

### Paso 1: Evaluación Independiente

Evaluar cada enfoque por sus propios méritos antes de compararlos. La regla crítica: no permitir que la evaluación del enfoque A sesgue la evaluación del enfoque B.

Para cada enfoque, evaluar independientemente:

```
Approach Evaluation Template:
┌────────────────────────┬──────────────────────────────────────────┐
│ Dimension              │ Assessment                               │
├────────────────────────┼──────────────────────────────────────────┤
│ Approach name          │                                          │
├────────────────────────┼──────────────────────────────────────────┤
│ Core mechanism         │ How does this approach solve the problem? │
├────────────────────────┼──────────────────────────────────────────┤
│ Strengths (2-3)        │ What does this approach do well?          │
├────────────────────────┼──────────────────────────────────────────┤
│ Risks (2-3)            │ What could go wrong? What is assumed?     │
├────────────────────────┼──────────────────────────────────────────┤
│ Evidence quality        │ How well-supported is this approach?      │
│                        │ (verified / inferred / speculated)        │
├────────────────────────┼──────────────────────────────────────────┤
│ Quality score (0-100)  │ Overall assessment                        │
├────────────────────────┼──────────────────────────────────────────┤
│ Confidence (0-100)     │ How confident in this assessment?         │
└────────────────────────┴──────────────────────────────────────────┘
```

Completar esto para cada enfoque por separado. No escribir una comparación hasta que todas las evaluaciones individuales estén completas.

**Esperado:** Evaluaciones independientes donde cada enfoque se evalúa en sus propios términos. La evaluación del enfoque B no hace referencia al enfoque A. Las puntuaciones de calidad reflejan una evaluación genuina, no un ranking.

**En caso de fallo:** Si las evaluaciones están contaminadas (te encuentras escribiendo "mejor que A" mientras evalúas B), reiniciar. Evaluar A completamente, luego limpiar el marco y evaluar B desde cero. Si las puntuaciones son todas idénticas, las dimensiones de evaluación son demasiado gruesas — agregar criterios específicos del dominio.

### Paso 2: Danza de Meneo — Razonar en Voz Alta

Defender cada enfoque proporcionalmente a su calidad. Este es el equivalente de IA de la danza de meneo de las abejas: hacer explícito y público el razonamiento implícito.

1. Para cada enfoque, presentar el caso a su favor — como si se presentara a un usuario escéptico:
   - "El enfoque A es fuerte porque [evidencia]. El riesgo principal es [riesgo], que se mitiga con [mitigación]."
2. La intensidad de la defensa debe ser proporcional a la puntuación de calidad:
   - Enfoque de alta calidad: defensa detallada con evidencia específica
   - Enfoque de calidad media: defensa breve con limitaciones reconocidas
   - Enfoque de baja calidad: mencionado por completitud, no defendido activamente
3. **Inspección cruzada**: después de defender A, buscar activamente evidencia que apoye B en su lugar. Después de defender B, buscar evidencia que apoye A. Esto contrarresta el sesgo de confirmación

El propósito de razonar en voz alta es hacer la decisión auditable — para ti mismo y para el usuario. Si el razonamiento no puede articularse, la evaluación es más superficial de lo que sugiere la puntuación.

**Esperado:** Razonamiento explícito para cada enfoque que sería persuasivo para un observador neutral. La inspección cruzada revela al menos una consideración que inicialmente se pasó por alto.

**En caso de fallo:** Si la defensa se siente superficial (cumpliendo con el proceso), los enfoques pueden no ser genuinamente diferentes — pueden ser variaciones de la misma idea. Verificar: ¿los enfoques difieren en mecanismo, o solo en detalle de implementación? Si es lo segundo, la decisión puede no importar mucho — elegir cualquiera y avanzar.

### Paso 3: Establecer Umbral de Quórum y Comprometerse

Establecer el umbral de confianza requerido para comprometerse, calibrado al riesgo de la decisión.

```
Confidence Thresholds by Stakes:
┌─────────────────────┬───────────┬──────────────────────────────────┐
│ Decision Type       │ Threshold │ Rationale                        │
├─────────────────────┼───────────┼──────────────────────────────────┤
│ Easily reversible   │ 60%       │ Cost of trying and reverting is  │
│ (can undo)          │           │ low. Speed matters more than     │
│                     │           │ certainty                        │
├─────────────────────┼───────────┼──────────────────────────────────┤
│ Moderate stakes     │ 75%       │ Reverting has cost but is        │
│ (costly to reverse) │           │ possible. Worth investing in     │
│                     │           │ evaluation                       │
├─────────────────────┼───────────┼──────────────────────────────────┤
│ Irreversible or     │ 90%       │ Cannot undo. Must be confident.  │
│ high-stakes         │           │ If threshold not met, gather     │
│                     │           │ more information before deciding │
└─────────────────────┴───────────┴──────────────────────────────────┘
```

1. Clasificar el riesgo de la decisión
2. Verificar: ¿la puntuación de calidad del enfoque líder multiplicada por la confianza alcanza el umbral?
3. Si sí: comprometerse. Declarar la decisión, el razonamiento y el riesgo clave que se acepta
4. Si no: identificar qué información adicional elevaría la confianza al umbral
5. Una vez comprometido, no revisitar a menos que surja nueva evidencia descalificadora

**Esperado:** Un momento de compromiso claro con razonamiento declarado. La decisión se toma a un nivel de confianza apropiado para su riesgo.

**En caso de fallo:** Si el umbral nunca se alcanza (no se puede llegar al 90% en una decisión irreversible), preguntar: ¿la decisión es verdaderamente irreversible? ¿Puede descomponerse en una fase de prueba reversible + un compromiso irreversible? La mayoría de las decisiones aparentemente irreversibles pueden escalonarse. Si el escalonamiento es imposible, comunicar la incertidumbre al usuario y pedir orientación.

### Paso 4: Resolver Bloqueos

Cuando dos o más enfoques tienen puntuaciones similares y el umbral de quórum no se alcanza para ninguno.

```
Deadlock Resolution:
┌────────────────────────┬──────────────────────────────────────────┐
│ Deadlock Type          │ Resolution                               │
├────────────────────────┼──────────────────────────────────────────┤
│ Genuine tie            │ The approaches are equivalent. Pick one  │
│ (scores within 5%)     │ and commit. The cost of deliberating     │
│                        │ exceeds the cost of picking the "wrong"  │
│                        │ equivalent option. Flip a coin mentally  │
├────────────────────────┼──────────────────────────────────────────┤
│ Information deficit    │ The tie exists because evaluation is     │
│ (scores uncertain)     │ incomplete. Invest one more specific     │
│                        │ investigation — a targeted file read, a  │
│                        │ quick test — then re-score               │
├────────────────────────┼──────────────────────────────────────────┤
│ Oscillation            │ Scoring keeps flip-flopping depending on │
│ (scores keep changing) │ which dimension gets attention. Time-box:│
│                        │ set a timer, evaluate once more, commit  │
│                        │ to the result regardless                 │
├────────────────────────┼──────────────────────────────────────────┤
│ Approach merge         │ The best parts of A and B can be         │
│ (compatible strengths) │ combined. Check for compatibility. If    │
│                        │ merge is coherent, use it. If forced,    │
│                        │ don't — pick one                         │
└────────────────────────┴──────────────────────────────────────────┘
```

**Esperado:** Bloqueo resuelto a través del mecanismo apropiado. La resolución es decisiva — sin duda persistente que socave la ejecución.

**En caso de fallo:** Si el bloqueo persiste a través de todas las estrategias de resolución, la decisión puede ser prematura. Preguntar al usuario: "Veo dos enfoques igualmente fuertes: [A] y [B]. [Caso breve para cada uno.] ¿Cuál se alinea mejor con tus prioridades?" Delegar un empate genuino al usuario no es un fracaso — es reconocer que la decisión depende de valores que la IA no puede inferir.

### Paso 5: Evaluar la Calidad de Coherencia

Después de comprometerse con una decisión, evaluar si el proceso produjo coherencia genuina o solo una decisión.

1. ¿La decisión se basó en evidencia, o fue una validación superficial de una preferencia inicial?
   - Prueba: ¿la preferencia era la misma antes y después de la evaluación? Si es así, ¿la evaluación cambió algo?
2. ¿Los enfoques perdedores fueron genuinamente considerados, o fueron argumentos de paja?
   - Prueba: ¿puedes articular el caso más fuerte para el enfoque perdedor?
3. ¿Qué señal desencadenaría una reevaluación?
   - Definir una observación específica que invalidaría la decisión ("Si descubro que la API no soporta X, entonces el enfoque B se vuelve mejor")
4. ¿Hay información útil de los enfoques perdedores que debería informar la implementación?
   - Un riesgo identificado en el enfoque B podría aplicarse también al enfoque A

**Esperado:** Una verificación breve de calidad que confirma la decisión o la identifica como débil. Si es débil, volver al paso anterior apropiado en lugar de proceder sobre terreno inestable.

**En caso de fallo:** Si la verificación de calidad revela que la decisión fue basada en preferencia en lugar de evidencia, reconocerlo honestamente. A veces la preferencia es todo lo que está disponible — pero debe etiquetarse como tal, no disfrazarse de análisis.

## Validación

- [ ] Cada enfoque fue evaluado independientemente antes de la comparación
- [ ] La defensa fue proporcional a la calidad (no atención igual independientemente del mérito)
- [ ] Se realizó inspección cruzada (buscando contra-evidencia después de la defensa)
- [ ] El umbral de quórum se calibró al riesgo de la decisión
- [ ] Si hubo bloqueo, se aplicó una estrategia de resolución específica
- [ ] Se realizó verificación de calidad post-decisión
- [ ] Se definió un desencadenante de reevaluación

## Errores Comunes

- **Compromiso prematuro**: Decidir antes de evaluar todos los enfoques. El primer enfoque considerado tiene una ventaja de anclaje — recibe más atención mental simplemente por ser primero. Evaluar todos antes de comparar
- **Defensa igual para enfoques desiguales**: Si el enfoque A obtuvo 85 y el enfoque B obtuvo 45, dedicar tiempo igual a defender ambos desperdicia esfuerzo y crea falsa equivalencia
- **Validación superficial**: Pasar por el proceso de evaluación para justificar una decisión ya tomada. La prueba es si la evaluación podría haber cambiado el resultado. Si no, el proceso fue teatro
- **Evasión de umbral**: Bajar el umbral de confianza para facilitar la decisión en lugar de recopilar la información necesaria para alcanzar el umbral apropiado
- **Ignorar el lado perdedor**: El enfoque perdedor a menudo contiene advertencias que aplican al ganador. Los riesgos identificados en el enfoque B no desaparecen solo porque se eligió el enfoque A

## Habilidades Relacionadas

- `build-consensus` — el modelo de consenso multi-agente que esta habilidad adapta al razonamiento de un solo agente
- `forage-solutions` — explora el espacio de soluciones que la coherencia evalúa; típicamente precede a esta habilidad
- `coordinate-reasoning` — gestiona el flujo de información durante la evaluación multi-camino
- `center` — establece la línea base equilibrada necesaria para la evaluación imparcial
- `meditate` — limpia suposiciones entre la evaluación de diferentes enfoques
