---
name: assess-context
description: >
  Evaluación de contexto de IA — evaluar la maleabilidad del problema, mapear
  rigidez versus flexibilidad estructural, analizar presión de transformación, y
  estimar capacidad de adaptación. Usar cuando una tarea compleja se siente
  atascada y no está claro si avanzar o pivotar, antes de un cambio significativo
  de enfoque para evaluar si la estructura de razonamiento actual puede soportarlo,
  cuando las soluciones temporales acumuladas sugieren que el enfoque subyacente
  puede estar equivocado, o como verificación periódica de salud estructural
  durante tareas extendidas de múltiples pasos.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: intermediate
  language: natural
  tags: morphic, assessment, context-evaluation, malleability, meta-cognition, ai-self-application
  locale: es
  source_locale: en
  source_commit: a87e5e0380bbe51f65cb0662d60c10030a81f255
  translator: claude
  translation_date: "2026-03-17"
---

# Assess Context

Evaluar el contexto de razonamiento actual en cuanto a maleabilidad — identificando qué elementos son rígidos (no pueden cambiar), cuáles son flexibles (pueden cambiar a bajo costo), dónde se está acumulando presión de transformación, y si el enfoque actual tiene la capacidad de adaptarse si es necesario.

## Cuándo Usar

- Cuando una tarea compleja se siente atascada y no está claro si avanzar o pivotar
- Antes de un cambio significativo de enfoque para evaluar si la estructura de razonamiento actual puede soportarlo
- Cuando las soluciones temporales acumuladas sugieren que el enfoque subyacente puede estar equivocado
- Después de que `heal` o `awareness` ha identificado deriva pero la respuesta apropiada (continuar, ajustar o reconstruir) no es clara
- Cuando el contexto ha crecido mucho y no está claro cuánto puede preservarse versus cuánto necesita ser reconstruido
- Verificación periódica de salud estructural durante tareas extendidas de múltiples pasos

## Entradas

- **Requerido**: Contexto de tarea actual y estado de razonamiento (disponible implícitamente)
- **Opcional**: Preocupación específica que desencadena la evaluación (ej., "sigo agregando soluciones temporales")
- **Opcional**: Dirección de pivote propuesta (¿en qué podría necesitar convertirse el enfoque?)
- **Opcional**: Resultados de evaluaciones anteriores para análisis de tendencias

## Procedimiento

### Paso 1: Inventariar la Forma de Razonamiento

Catalogar los componentes estructurales del enfoque de razonamiento actual sin juicio.

```
Structural Inventory Table:
┌────────────────────┬──────────────┬──────────────────────────────────┐
│ Component          │ Type         │ Description                      │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Main task          │ Skeleton     │ The user's core request — cannot │
│                    │              │ change without user direction     │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Sub-task breakdown │ Flesh        │ How the task is decomposed —     │
│                    │              │ can be restructured               │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Tool strategy      │ Flesh        │ Which tools are being used and   │
│                    │              │ in what order — can be changed    │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Output plan        │ Flesh/Skel   │ The expected deliverable format  │
│                    │              │ — may be constrained by user     │
│                    │              │ expectations                      │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Key assumptions    │ Skeleton     │ Facts treated as given — may be  │
│                    │              │ wrong but are load-bearing        │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Constraints        │ Skeleton     │ Hard limits (user-imposed, tool  │
│                    │              │ limitations, time)                │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Workarounds        │ Scar tissue  │ Patches for things that didn't   │
│                    │              │ work as expected — signals of     │
│                    │              │ structural stress                 │
└────────────────────┴──────────────┴──────────────────────────────────┘
```

Clasificar cada componente:
- **Esqueleto**: difícil de cambiar; cambiarlo genera cascadas en todo lo que depende de él
- **Carne**: fácil de cambiar; puede intercambiarse sin afectar otros componentes
- **Tejido cicatricial**: soluciones temporales que indican problemas estructurales; frecuentemente carne pretendiendo ser esqueleto

Mapear dependencias: ¿qué componentes dependen de cuáles? Un componente esqueleto con muchos dependientes es portante. Un componente carne sin dependientes es desechable.

**Esperado:** Un inventario completo mostrando de qué está construido el enfoque actual, qué es rígido, qué es flexible, y dónde es visible el estrés (soluciones temporales). El inventario debe revelar estructura que no era obvia antes de catalogar.

**En caso de fallo:** Si el inventario es difícil de construir (el enfoque está demasiado enredado para descomponer), eso es en sí mismo un hallazgo — alta opacidad estructural indica alta rigidez. Comenzar con lo visible y notar las zonas de opacidad.

### Paso 2: Mapear la Presión de Transformación

Identificar las fuerzas que empujan el enfoque actual hacia el cambio y las fuerzas que lo resisten.

```
Pressure Map:
┌─────────────────────────┬──────────────────────────────────────────┐
│ External Pressure       │ Forces from outside the reasoning        │
│ (pushing toward change) │                                          │
├─────────────────────────┼──────────────────────────────────────────┤
│ New information         │ Tool results or user input that          │
│                         │ contradicts current approach              │
├─────────────────────────┼──────────────────────────────────────────┤
│ Tool contradictions     │ Tools returning unexpected results that  │
│                         │ the current approach cannot explain       │
├─────────────────────────┼──────────────────────────────────────────┤
│ Time pressure           │ The current approach is too slow for the │
│                         │ complexity of the task                    │
├─────────────────────────┼──────────────────────────────────────────┤
│ Internal Pressure       │ Forces from within the reasoning         │
│ (pushing toward change) │                                          │
├─────────────────────────┼──────────────────────────────────────────┤
│ Diminishing returns     │ Each step yields less progress than the  │
│                         │ previous one                              │
├─────────────────────────┼──────────────────────────────────────────┤
│ Workaround accumulation │ The number of patches is growing —       │
│                         │ complexity is outpacing the structure     │
├─────────────────────────┼──────────────────────────────────────────┤
│ Coherence loss          │ Sub-tasks are not fitting together       │
│                         │ cleanly anymore                           │
├─────────────────────────┼──────────────────────────────────────────┤
│ Resistance              │ Forces opposing change                    │
│ (pushing against change)│                                          │
├─────────────────────────┼──────────────────────────────────────────┤
│ Sunk cost               │ Significant work already done on current │
│                         │ approach — pivoting "wastes" that effort  │
├─────────────────────────┼──────────────────────────────────────────┤
│ "Good enough"           │ The current approach is producing        │
│                         │ acceptable (if not optimal) results       │
├─────────────────────────┼──────────────────────────────────────────┤
│ Pivot cost              │ Switching approaches means rebuilding    │
│                         │ context, losing momentum, potential      │
│                         │ confusion                                 │
└─────────────────────────┴──────────────────────────────────────────┘
```

Estimar el balance: ¿la presión de transformación está creciendo, estable o declinando?

**Esperado:** Una imagen clara de las fuerzas que actúan sobre el enfoque actual. Si la presión excede significativamente la resistencia, un pivote está atrasado. Si la resistencia excede significativamente la presión, el enfoque actual debe continuar.

**En caso de fallo:** Si el mapa de presión es ambiguo (ni presión fuerte ni resistencia fuerte), proyectar hacia adelante: ¿se intensificarán las presiones? ¿Se acumularán las soluciones temporales? Un enfoque que es "suficientemente bueno ahora pero degradándose" está bajo más presión de lo que parece.

### Paso 3: Evaluar la Rigidez del Razonamiento

Determinar cuán flexible es el enfoque actual — ¿puede adaptarse, o se romperá?

```
Rigidity Score:
┌──────────────────────────┬─────┬──────────┬──────┬──────────────┐
│ Dimension                │ Low │ Moderate │ High │ Assessment   │
│                          │ (1) │ (2)      │ (3)  │              │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ Component swappability   │ Can swap parts   │ Changing one │              │
│                          │ freely          │ breaks others│              │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ "God module" dependency  │ No single point  │ Everything   │              │
│                          │ of failure       │ depends on   │              │
│                          │                  │ one conclusion│             │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ Tool entanglement        │ Tools serve      │ Approach is  │              │
│                          │ reasoning        │ shaped by    │              │
│                          │                  │ tool limits   │              │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ Assumption transparency  │ Assumptions are  │ Assumptions  │              │
│                          │ stated, testable │ are implicit, │             │
│                          │                  │ untested      │              │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ Workaround count         │ None or few      │ Multiple     │              │
│                          │                  │ accumulating  │              │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ Total (max 15)           │ 5-7: flexible    │              │              │
│                          │ 8-10: moderate   │              │              │
│                          │ 11-15: rigid     │              │              │
└──────────────────────────┴─────┴──────────┴──────┴──────────────┘
```

**Esperado:** Una puntuación de rigidez con evidencia específica para cada dimensión. La puntuación revela si el enfoque puede absorber cambios o necesitará ser reconstruido.

**En caso de fallo:** Si todas las dimensiones puntúan bajo (reclamando alta flexibilidad), examinar la dimensión "módulo dios" más cuidadosamente: ¿hay una conclusión o suposición clave de la que depende todo lo demás? Si es así, la flexibilidad es ilusoria — una suposición equivocada colapsa toda la estructura.

### Paso 4: Estimar la Capacidad de Cambio

Evaluar la capacidad práctica de pivotar o adaptar el enfoque actual.

1. **Ventana de contexto restante**: ¿cuánto espacio queda para nuevo razonamiento? Contexto restante extenso = alta capacidad. Aproximándose a los límites = baja capacidad
2. **Preservación de información en pivote**: si el enfoque cambia, ¿qué puede llevarse adelante? Las salidas de sub-tareas de alta calidad sobreviven a los pivotes; las cadenas de razonamiento ligadas al enfoque anterior no
3. **Herramientas de recuperación disponibles**: ¿puede MEMORY.md capturar hallazgos clave antes de pivotar? ¿Puede el usuario proporcionar contexto adicional? ¿Los archivos relevantes siguen accesibles?
4. **Factor de paciencia del usuario**: ¿ha indicado urgencia el usuario? Múltiples correcciones sugieren paciencia declinante. Un explícito "tómate tu tiempo" sugiere alta paciencia

La capacidad de cambio no es solo teórica — incluye las restricciones prácticas de la sesión actual.

**Esperado:** Una evaluación honesta de la capacidad de cambiar de rumbo, considerando tanto factores técnicos como relacionales.

**En caso de fallo:** Si la capacidad de cambio es baja (contexto limitado, información crítica en riesgo de perderse), la primera prioridad antes de cualquier pivote es la preservación: resumir hallazgos clave, notar hechos críticos, actualizar MEMORY.md si es apropiado. Pivotar sin preservación es peor que no pivotar.

### Paso 5: Clasificar la Preparación para la Transformación

Combinar las evaluaciones en una clasificación de preparación.

```
Transformation Readiness Matrix:
┌─────────────────┬────────────────────────┬────────────────────────┐
│                  │ Low Rigidity           │ High Rigidity          │
├─────────────────┼────────────────────────┼────────────────────────┤
│ High Pressure   │ READY — pivot now.     │ PREPARE — simplify     │
│ + High Capacity │ The approach can adapt  │ first. Remove          │
│                 │ and should. Preserve    │ workarounds, clarify   │
│                 │ valuable sub-outputs,   │ assumptions, then      │
│                 │ rebuild the structure   │ pivot                  │
├─────────────────┼────────────────────────┼────────────────────────┤
│ High Pressure   │ INVEST — preserve      │ CRITICAL — ask the     │
│ + Low Capacity  │ findings first. Update  │ user. Explain the      │
│                 │ MEMORY.md, summarize    │ situation: approach is  │
│                 │ progress, then pivot    │ struggling, pivoting   │
│                 │ with preserved context  │ is costly, what do     │
│                 │                        │ they want to prioritize?│
├─────────────────┼────────────────────────┼────────────────────────┤
│ Low Pressure    │ DEFER — the approach   │ DEFER — no urgency,    │
│ + Any Capacity  │ is working. Continue.   │ continue. Monitor for  │
│                 │ Reassess if pressure    │ pressure changes        │
│                 │ increases               │                        │
└─────────────────┴────────────────────────┴────────────────────────┘
```

Documentar la clasificación con:
- Etiqueta de clasificación (READY / PREPARE / INVEST / CRITICAL / DEFER)
- Hallazgos clave de cada dimensión
- Acción siguiente recomendada
- Qué señal cambiaría la clasificación

**Esperado:** Una clasificación clara y justificada con una acción recomendada específica. La clasificación debe sentirse como una conclusión, no como una conjetura.

**En caso de fallo:** Si la clasificación es ambigua, optar por PREPARE — reducir la rigidez (clarificar suposiciones, eliminar soluciones temporales) es valioso independientemente de si ocurre un pivote completo. La preparación mejora el enfoque ya sea que continúe o cambie.

## Validación

- [ ] El inventario estructural fue completado con clasificación esqueleto/carne/tejido-cicatricial
- [ ] Las presiones de transformación fueron mapeadas (externa, interna, resistencia)
- [ ] La rigidez fue puntuada en múltiples dimensiones con evidencia específica
- [ ] La capacidad de cambio fue evaluada incluyendo restricciones prácticas de la sesión
- [ ] La clasificación de preparación fue determinada con razonamiento justificado
- [ ] Una acción concreta siguiente fue identificada basada en la clasificación
- [ ] Un disparador de reevaluación fue definido

## Errores Comunes

- **Evaluar solo el enfoque técnico**: La preparación del contexto incluye factores de relación con el usuario. Un enfoque que es técnicamente flexible pero ha generado frustración del usuario es más rígido de lo que parece
- **Costo hundido como rigidez**: El esfuerzo previo no es rigidez estructural. El trabajo ya realizado puede ser valioso independientemente de si el enfoque cambia. Distinguir entre "no puedo cambiar" (rigidez) y "no quiero cambiar" (costo hundido)
- **Evaluación como evasión**: Si assess-context es invocado para evitar tomar una decisión difícil, la evaluación será inconclusiva por diseño. Si la presión es clara, actuar sobre ella
- **Ignorar soluciones temporales como señales**: Las soluciones temporales son tejido cicatricial — evidencia de que la estructura fue estresada y parcheada en lugar de adaptada correctamente. Un alto conteo de soluciones temporales significa que el próximo estrés es más probable que rompa
- **Confundir rigidez con compromiso**: Un enfoque comprometido (deliberadamente elegido, basado en evidencia) es diferente de uno rígido (atrapado por dependencias y suposiciones). El compromiso puede cambiarse por decisión; la rigidez solo puede cambiarse por reestructuración

## Habilidades Relacionadas

- `assess-form` — el modelo de evaluación multi-sistema que esta habilidad adapta al contexto de razonamiento de IA
- `adapt-architecture` — si se clasifica como READY, usar principios de adaptación arquitectónica para el pivote
- `heal` — escaneo más profundo de subsistemas cuando la evaluación revela deriva más allá de problemas estructurales
- `center` — establece la línea base equilibrada necesaria para una evaluación honesta
- `coordinate-reasoning` — gestiona la frescura de información de la que depende la evaluación
