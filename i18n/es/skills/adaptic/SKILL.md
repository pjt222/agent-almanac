---
name: adaptic
description: >
  Master skill composing the 5-step synoptic cycle for panoramic synthesis
  across multiple domains. Orchestrates meditate, expand-awareness, observe,
  awareness, integrate-gestalt, and express-insight into a coherent process
  that produces unified understanding rather than sequential compromise. Use
  when a problem genuinely spans 3+ domains and the interactions between
  domains matter more than depth in any one, when sequential analysis feels
  like compromise rather than integration, or before major architectural
  decisions affecting multiple stakeholders.
license: MIT
allowed-tools: Read Write Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: synoptic
  complexity: advanced
  language: natural
  tags: synoptic, adaptic, panoramic, synthesis, gestalt, meta-skill
  locale: es
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Adaptic

Compone el ciclo sinóptico de 5 pasos para lograr una síntesis panorámica entre múltiples dominios. Donde el análisis secuencial produce compromiso ("un poco de cada cosa"), el ciclo sinóptico produce integración — una comprensión unificada que sostiene todos los dominios simultáneamente y encuentra el todo emergente.

## Cuándo Usar

- Un problema abarca genuinamente 3+ dominios y las *interacciones entre dominios* importan más que la profundidad en cualquiera de ellos
- El análisis secuencial (estilo polymath) se ha intentado pero la síntesis se siente como compromiso en lugar de integración
- Los enfoques existentes se sienten como "un poco de cada cosa" en lugar de una visión unificada
- Antes de decisiones arquitectónicas importantes que afectan a múltiples partes interesadas
- Cuando los expertos de dominio discrepan y la resolución se encuentra *entre* sus perspectivas, no dentro de una sola

## Cuándo NO Usar

- Problemas de un único dominio — usa el agente de dominio directamente
- Compromisos bien comprendidos donde el análisis secuencial estilo polymath es suficiente
- Contextos de auto-cuidado o bienestar — usa el equipo tending en su lugar
- Cuando la velocidad importa más que la profundidad — el ciclo completo requiere atención sostenida

## Entradas

- **Requerido**: El problema o pregunta que requiere síntesis multi-dominio
- **Opcional**: Lista explícita de dominios a sostener (predeterminado: detección automática a partir del contexto del problema)
- **Opcional**: Configuración de profundidad — `light`, `standard`, o `deep` (predeterminado: `standard`)
- **Opcional**: Forma de expresión — `narrative`, `diagram`, `table`, o `recommendation` (predeterminado: `auto`)

## Configuración

```yaml
settings:
  depth: standard          # light (skip meditate), standard, deep (extended perceive)
  domains: auto            # auto-detect or explicit list
  expression_form: auto    # narrative, diagram, table, recommendation
```

## Procedimiento

### Paso 1: Limpiar — Vaciar el Espacio de Trabajo

Ejecutar la habilidad `meditate` para limpiar contexto previo, suposiciones y sesgo de un solo dominio.

1. Ejecutar el procedimiento completo de meditate: preparar, anclar, observar distracciones, cerrar
2. Prestar especial atención al sesgo de dominio — la tendencia a enmarcar el problema a través del dominio que estuvo activo más recientemente
3. Limpiar cualquier solución prematura que llegó antes de que la imagen completa fuera visible
4. Si está configurado `depth: light`, abreviar a una breve pausa de limpieza de contexto en lugar de la meditación completa

**Esperado:** El espacio de trabajo está vacío. Ningún dominio tiene prioridad. No se ha pre-seleccionado ninguna solución. El agente está en un estado neutral y receptivo, listo para sostener múltiples perspectivas simultáneamente.

**En caso de fallo:** Si un dominio particular insiste en presentarse como "el problema real", nombrar ese sesgo explícitamente: "Noto que estoy enmarcando esto principalmente como un problema de [dominio]." Nombrar el sesgo afloja su agarre. Si la limpieza falla por completo, el problema puede ser genuinamente de un solo dominio — reconsiderar si el ciclo sinóptico es necesario.

### Paso 2: Abrir — Entrar en Modo Panorámico

Ejecutar la habilidad `expand-awareness` para pasar de un enfoque estrecho a una percepción de campo amplio.

1. Inventariar todos los dominios relevantes para el problema — no pre-filtrar ni clasificarlos
2. Para cada dominio, anotar sus preocupaciones centrales, restricciones y valores sin evaluar
3. Suavizar el enfoque: sostener todos los dominios en la conciencia simultáneamente en lugar de recorrerlos uno a la vez
4. Resistir el impulso de "empezar a resolver" — este paso es puramente sobre abrir el campo de visión
5. Si los dominios se proporcionaron explícitamente en las entradas, usarlos como conjunto inicial pero permanecer abierto a descubrir dominios relevantes adicionales

**Esperado:** Un campo panorámico está abierto. Todos los dominios relevantes se sostienen en la conciencia simultáneamente. El agente puede percibir el paisaje completo sin acercarse a ningún dominio individual. La sensación es espaciosa en lugar de abrumadora.

**En caso de fallo:** Si la lista de dominios se siente incompleta, preguntar: "¿Qué perspectiva falta que cambiaría la imagen?" Si la conciencia simultánea colapsa en escaneo secuencial (dominio A, luego B, luego C), ralentizar — el objetivo es sostener todo el campo, no recorrer sus partes. Si más de 7 dominios están activos, agrupar dominios relacionados en clusters para reducir la carga cognitiva manteniendo la amplitud.

### Paso 3: Percibir — Notar Patrones Cross-Dominio

Mientras se mantiene la conciencia panorámica, ejecutar `observe` y `awareness` para notar patrones, tensiones y resonancias *entre* todos los dominios visibles.

1. Mantener el campo panorámico abierto del Paso 2 — no estrechar el enfoque
2. Ejecutar `observe` para notar lo que está realmente presente: ¿qué patrones se repiten entre dominios? ¿qué tensiones existen entre dominios? ¿qué resonancias conectan preocupaciones aparentemente no relacionadas?
3. Ejecutar `awareness` para notar lo que *no* se está viendo: ¿qué dominios se están ignorando sutilmente? ¿dónde están los puntos ciegos? ¿qué suposiciones operan bajo la superficie?
4. Registrar observaciones cross-dominio sin interpretarlas todavía:
   - **Tensiones**: donde los dominios tiran en direcciones opuestas
   - **Resonancias**: donde los dominios se refuerzan o se hacen eco
   - **Vacíos**: donde ningún dominio aborda una preocupación que la imagen completa revela
   - **Sorpresas**: donde un dominio aporta algo inesperado a la imagen
5. Si está configurado `depth: deep`, extender este paso — ciclar a través de observe y awareness múltiples veces, permitiendo que patrones más sutiles emerjan

La disciplina crítica: percibir entre todos los dominios simultáneamente, no cada dominio por turno. La percepción secuencial pierde los patrones cross-dominio que son el sentido completo del ciclo sinóptico.

**Esperado:** Un conjunto rico de observaciones cross-dominio — tensiones, resonancias, vacíos y sorpresas. Estas observaciones cruzan los límites entre dominios en lugar de vivir dentro de uno solo. El agente ha notado algo que no sería visible desde la perspectiva de ningún dominio individual.

**En caso de fallo:** Si todas las observaciones están dentro de dominios individuales ("en el dominio A, noto X"), el campo panorámico ha colapsado. Volver al Paso 2 y reabrir. Si no emergen patrones cross-dominio, el problema puede no requerir tratamiento sinóptico — puede ser genuinamente descomponible en problemas de dominio independientes. Si el paso de percepción produce un número abrumador de observaciones, priorizar las tensiones (son donde ocurre la integración).

### Paso 4: Integrar — Formar el Todo Emergente

Ejecutar la habilidad `integrate-gestalt` para sintetizar las observaciones cross-dominio en una comprensión unificada.

1. Mapear las tensiones identificadas en el Paso 3 — no resolverlas prematuramente; sostenerlas como restricciones creativas
2. Encontrar la figura: ¿qué comprensión unificada emerge cuando todas las observaciones se sostienen juntas? Esto no es un compromiso o promedio — es un nuevo patrón que incluye pero trasciende las perspectivas individuales de los dominios
3. Probar el todo: ¿la comprensión integrada honra las preocupaciones centrales de cada dominio? ¿Resuelve las tensiones o simplemente las cubre?
4. Nombrar la perspectiva en una declaración clara — si no se puede declarar simplemente, la integración aún no está completa
5. Verificar que la perspectiva sea genuinamente emergente: ¿podría haberse alcanzado analizando los dominios secuencialmente? Si sí, el ciclo sinóptico no añadió valor y el análisis secuencial habría bastado

**Esperado:** Una única comprensión integrada que sostiene todos los dominios simultáneamente. La perspectiva se siente como descubrimiento en lugar de construcción — emergió del todo en lugar de ser ensamblada a partir de partes. Las preocupaciones centrales de cada dominio son honradas, y las tensiones entre dominios se resuelven en lugar de comprometerse.

**En caso de fallo:** Si la integración produce "un poco de cada dominio" en lugar de un todo unificado, la gestalt no se ha formado. Volver al Paso 3 y buscar las tensiones que se están evitando — la integración ocurre *a través* de la tensión, no alrededor de ella. Si no se forma ninguna gestalt después de un esfuerzo prolongado, descomponer: encontrar los 2-3 dominios con las tensiones más fuertes e integrar esos primero, luego expandir.

### Paso 5: Expresar — Comunicar la Comprensión Integrada

Ejecutar la habilidad `express-insight` para comunicar la síntesis a la audiencia prevista.

1. Evaluar la audiencia: ¿con qué dominios están familiarizados? ¿qué encuadre hará accesible la perspectiva integrada?
2. Elegir la forma de expresión (o usar la especificada en las entradas):
   - **Narrative**: para audiencias que necesitan entender el viaje de las partes al todo
   - **Diagram**: para audiencias que necesitan ver relaciones estructurales
   - **Table**: para audiencias que necesitan comparar perspectivas de dominio sistemáticamente
   - **Recommendation**: para audiencias que necesitan una decisión accionable
3. Expresar la comprensión integrada con transparencia: mostrar qué dominios contribuyeron, dónde se resolvieron tensiones, y qué añade la perspectiva emergente más allá de cualquier perspectiva individual
4. Invitar al desafío: notar explícitamente qué aspectos de la integración son los más fuertes y cuáles son los más especulativos

**Esperado:** Una expresión clara y bien formada de la comprensión integrada que es accesible a la audiencia prevista. La expresión muestra su trabajo — la audiencia puede ver cómo las perspectivas de dominio contribuyeron al todo. La forma coincide con las necesidades de la audiencia.

**En caso de fallo:** Si la expresión se siente como una lista de perspectivas de dominio en lugar de un todo integrado, la perspectiva del Paso 4 se ha perdido en la traducción. Volver al resumen de una declaración del Paso 4 y construir la expresión hacia afuera desde ese centro. Si el encuadre de la audiencia es incorrecto, preguntar: "¿Quién necesita esto y qué decisión informa?"

## Validación

- [ ] El Paso 1 (Limpiar) se ejecutó — el contexto previo y el sesgo de dominio fueron explícitamente liberados
- [ ] El Paso 2 (Abrir) produjo un campo panorámico que sostiene 3+ dominios simultáneamente
- [ ] El Paso 3 (Percibir) identificó patrones cross-dominio (no solo observaciones intra-dominio)
- [ ] El Paso 4 (Integrar) produjo una única perspectiva emergente que trasciende cualquier dominio individual
- [ ] El Paso 5 (Expresar) comunicó la perspectiva en una forma apropiada para la audiencia
- [ ] La salida final no podría haber sido producida por análisis secuencial de un solo dominio
- [ ] Las preocupaciones centrales de cada dominio son honradas en la comprensión integrada
- [ ] Las tensiones entre dominios fueron resueltas a través de la integración, no del compromiso

## Errores Comunes

- **Secuencial disfrazado de simultáneo**: Recorrer los dominios uno a la vez y luego grapar los resultados juntos no es percepción sinóptica. La prueba: ¿produjeron las *interacciones* cross-dominio algo nuevo, o la salida es simplemente una concatenación de análisis de dominio?
- **Integración prematura**: Saltar a una síntesis antes de que el campo panorámico se haya abierto completamente. Los Pasos 2 y 3 construyen la base perceptual que hace posible la integración genuina — apresurarlos produce síntesis superficial.
- **Compromiso en lugar de emergencia**: Promediar perspectivas de dominio ("50% seguridad, 50% usabilidad") es compromiso, no integración. La verdadera integración encuentra un marco donde ambas preocupaciones se cumplen *completamente*, o nombra honestamente el compromiso irreducible.
- **Uso excesivo en problemas de un solo dominio**: No todos los problemas necesitan síntesis panorámica. Si el problema vive limpiamente en un dominio, el tratamiento sinóptico añade sobrecarga sin valor. Los criterios "Cuándo NO Usar" existen por una razón.
- **Perder la perspectiva en la expresión**: El Paso 4 produce una gestalt clara, pero el Paso 5 la fragmenta de vuelta en una lista dominio por dominio. Mantener la perspectiva integrada como el centro de la expresión; los detalles del dominio son evidencia de apoyo, no la estructura principal.
- **Inflación de dominios**: Expandir artificialmente el conteo de dominios para justificar el tratamiento sinóptico. Tres dominios genuinamente relevantes producen mejor síntesis que siete dominios donde cuatro son periféricos.

## Habilidades Relacionadas

- `meditate` — Paso 1 del ciclo; limpia contexto y establece estado neutral inicial
- `expand-awareness` — Paso 2 del ciclo; cambia de enfoque estrecho a percepción panorámica
- `observe` — usado en el Paso 3; nota lo que está presente en todo el campo
- `awareness` — usado en el Paso 3; nota lo que no se está viendo, revela puntos ciegos
- `integrate-gestalt` — Paso 4 del ciclo; forma el todo emergente a partir de patrones cross-dominio
- `express-insight` — Paso 5 del ciclo; comunica la comprensión integrada
