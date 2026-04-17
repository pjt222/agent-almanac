---
name: vishnu-bhaga
description: >
  Preservación y sustento — mantener el estado funcional bajo perturbación,
  anclaje de memoria, aplicación de consistencia y estabilización protectora.
  Mapea la presencia sustentadora de Vishnu al razonamiento de IA: mantener
  estable lo que funciona, anclar el conocimiento verificado contra la deriva
  y asegurar la continuidad a través del cambio. Usar cuando un enfoque
  funcional está en riesgo por desviación de alcance, cuando la deriva de
  contexto amenaza el conocimiento verificado, después de la disolución de
  shiva-bhaga para proteger lo que sobrevivió, cuando una sesión larga
  arriesga perder decisiones anteriores por compresión de contexto, o antes
  de hacer cambios a un sistema que funciona correctamente.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, preservation, sustenance, stability, consistency, hindu-trinity, vishnu
  locale: es
  source_locale: en
  source_commit: a87e5e0380bbe51f65cb0662d60c10030a81f255
  translator: claude
  translation_date: "2026-03-17"
---

# Vishnu Bhaga

Preservar y sostener lo que funciona — anclar el conocimiento verificado, mantener la consistencia bajo perturbación y proteger patrones funcionales del cambio innecesario.

## Cuándo Usar

- Un enfoque funcional está en riesgo de ser interrumpido por desviación de alcance u optimización prematura
- La deriva de contexto amenaza con sobrescribir conocimiento verificado con suposiciones obsoletas
- Múltiples preocupaciones paralelas están creando presión para cambiar cosas que deberían permanecer estables
- Después de la disolución de `shiva-bhaga` — lo que sobrevive necesita protección activa durante la reconstrucción
- Cuando una sesión larga arriesga perder decisiones verificadas anteriores por compresión de contexto
- Antes de hacer cambios a un sistema que actualmente funciona correctamente

## Entradas

- **Requerido**: Estado funcional actual o conocimiento verificado a preservar (disponible implícitamente)
- **Opcional**: Amenaza específica a la estabilidad (ej., "desviación de alcance", "compresión de contexto acercándose")
- **Opcional**: MEMORY.md y archivos del proyecto para fundamentación (vía `Read`)

## Procedimiento

### Paso 1: Inventariar lo que funciona

Antes de proteger algo, identificar lo que actualmente es funcional y está verificado.

```
Preservation Inventory:
+---------------------+---------------------------+------------------------+
| Category            | Verification Method       | Anchoring Action       |
+---------------------+---------------------------+------------------------+
| Verified Facts      | Confirmed via tool use    | Record source and      |
|                     | (file reads, test runs,   | timestamp; do not      |
|                     | API responses)            | re-derive              |
+---------------------+---------------------------+------------------------+
| Working Code        | Tests pass, behavior      | Do not refactor unless |
|                     | confirmed, user approved  | explicitly requested   |
+---------------------+---------------------------+------------------------+
| User Requirements   | Explicitly stated by      | Quote directly; do not |
|                     | the user in this session  | paraphrase or infer    |
+---------------------+---------------------------+------------------------+
| Agreed Decisions    | Decisions made and        | Reference the decision |
|                     | confirmed during this     | point; do not revisit  |
|                     | session                   | without new evidence   |
+---------------------+---------------------------+------------------------+
| Environmental State | File paths, configs,      | Verify before assuming |
|                     | tool availability         | unchanged              |
+---------------------+---------------------------+------------------------+
```

1. Para cada categoría, listar los elementos específicos que actualmente están verificados y funcionando
2. Anotar el método de verificación — ¿cómo sabe que esto es verdadero?
3. Los elementos sin verificación no se preservan — son suposiciones (y pueden necesitar `shiva-bhaga`)

**Esperado:** Un inventario concreto de elementos verificados y funcionales con su base de evidencia.

**En caso de fallo:** Si el inventario es escaso — poco está verificado — eso en sí es información valiosa. Ejecutar `heal` para re-fundamentar antes de intentar preservar suposiciones no verificadas.

### Paso 2: Identificar fuentes de perturbación

Nombrar las fuerzas que amenazan el estado estable.

1. **Desviación de alcance**: ¿La tarea se está expandiendo más allá de lo acordado?
2. **Deriva de contexto**: ¿Los hechos anteriores están siendo sobrescritos por razonamiento más reciente (posiblemente incorrecto)?
3. **Presión de optimización**: ¿Hay un impulso de mejorar algo que funciona adecuadamente?
4. **Cambios externos**: ¿Ha cambiado el entorno (archivos modificados, herramientas no disponibles)?
5. **Riesgo de compresión**: ¿La conversación se acerca a los límites de contexto donde las decisiones tempranas pueden perderse?

Para cada fuente, evaluar: ¿es una amenaza real o una anticipada?

**Esperado:** Fuentes de perturbación nombradas con severidad evaluada (amenaza activa vs. riesgo anticipado).

**En caso de fallo:** Si no hay fuentes de perturbación aparentes, la preservación puede no ser necesaria — considerar si `brahma-bhaga` (creación) o la ejecución continuada es más apropiada.

### Paso 3: Anclar el estado estable

Aplicar técnicas específicas para proteger lo que funciona de las amenazas identificadas.

1. **Anclaje de memoria**: Para hechos críticos en riesgo de deriva de contexto, reafirmarlos explícitamente:
   - "Hecho establecido: [X], verificado por [método] en [punto de la conversación]"
   - Si hay memoria persistente disponible, escribir hechos duraderos en MEMORY.md
2. **Aplicación de límites de alcance**: Para desviación de alcance, reafirmar el alcance acordado:
   - "Alcance acordado: [solicitud original]. El trabajo actual está dentro/fuera de este límite."
3. **Resistencia al cambio**: Para código funcional bajo presión de optimización:
   - "Este componente funciona y está probado. Sin cambios a menos que el usuario lo solicite."
4. **Instantánea de estado**: Para riesgo de compresión, crear un punto de control mental:
   - Resumir: qué se ha hecho, qué queda, qué decisiones clave se tomaron
5. **Verificación ambiental**: Para cambios externos, re-verificar antes de proceder:
   - Re-leer archivos críticos en lugar de confiar en lecturas anteriores

**Esperado:** Cada amenaza identificada tiene una respuesta de anclaje específica. El estado estable está explícitamente protegido.

**En caso de fallo:** Si el anclaje se siente excesivo — protegiendo todo por igual — priorizar. ¿Cuál es la cosa que no debe cambiar? Proteger eso primero.

### Paso 4: Sostener mediante la acción

La preservación no es pasiva — requiere atención continua durante el trabajo subsiguiente.

1. Antes de cada acción, verificar: "¿Esto amenaza algo en el inventario de preservación?"
2. Si sí, encontrar un enfoque alternativo que logre el objetivo sin perturbar el estado estable
3. Si la perturbación es inevitable, reconocerla explícitamente y actualizar el inventario
4. Re-verificar periódicamente los elementos preservados — especialmente después de operaciones complejas
5. Cuando la tarea se complete, confirmar que los elementos preservados permanecen intactos

**Esperado:** El estado funcional sobrevive la tarea actual intacto. Los cambios se hicieron solo donde fue necesario y no interrumpieron componentes funcionales.

**En caso de fallo:** Si un elemento preservado fue cambiado inadvertidamente, evaluar el daño inmediatamente. Si el cambio rompió algo, revertir. Si el cambio fue neutral, actualizar el inventario. No dejar el inventario obsoleto.

## Validación

- [ ] El estado funcional fue inventariado con evidencia de verificación
- [ ] Las fuentes de perturbación fueron identificadas y evaluadas
- [ ] Las acciones de anclaje fueron aplicadas a cada amenaza real
- [ ] Los límites de alcance fueron mantenidos durante toda la tarea
- [ ] Los elementos preservados fueron re-verificados después de completar

## Errores Comunes

- **Preservar suposiciones como hechos**: Solo el conocimiento verificado merece protección. Las suposiciones no verificadas disfrazadas de hechos crean falsa estabilidad
- **Sobre-preservación**: Proteger todo por igual impide el cambio necesario. La preservación debe ser selectiva — proteger lo que funciona, liberar lo que no
- **Preservación pasiva**: Asumir que las cosas permanecerán estables sin verificación activa. La deriva de contexto es constante; la preservación requiere atención continua
- **Resistencia al cambio legítimo**: Usar la preservación como excusa para evitar modificaciones necesarias. Si el usuario solicita un cambio a un componente funcional, eso anula la preservación
- **Inventario obsoleto**: No actualizar el inventario de preservación cuando llega nueva información. El inventario debe reflejar la realidad actual, no el estado en el momento de su creación

## Habilidades Relacionadas

- `shiva-bhaga` — la destrucción precede a la preservación; lo que sobrevive a la disolución es lo que Vishnu sostiene
- `brahma-bhaga` — la creación se construye sobre la base preservada; nuevos patrones emergen de terreno estable
- `heal` — la evaluación de subsistemas revela lo que es genuinamente funcional vs. superficialmente estable
- `observe` — la observación neutral sostenida detecta la deriva antes de que amenace la estabilidad
- `awareness` — la consciencia situacional (códigos de color de Cooper) se mapea directamente a la detección de perturbaciones
