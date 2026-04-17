---
name: redirect
description: >
  AI pressure redirection — handling conflicting demands, tool failures, and
  competing constraints by blending with incoming force then reframing. Use
  when receiving contradictory instructions from different sources, during tool
  failure cascades where the planned approach becomes unviable, when scope
  pressure threatens to expand the task beyond what was asked, or when user
  frustration or correction needs to be absorbed rather than deflected.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: defensive
  complexity: intermediate
  language: natural
  tags: defensive, redirection, conflict-resolution, pressure-handling, meta-cognition, ai-self-application
  locale: es
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Redirigir

Manejar demandas conflictivas, fallos de herramientas y restricciones en competencia mezclándose con la presión entrante en lugar de resistirla — luego redirigiendo la fuerza hacia una resolución productiva.

## Cuándo Usar

- Al recibir instrucciones contradictorias (el usuario dice X, los documentos del proyecto dicen Y, los resultados de herramientas muestran Z)
- Cascadas de fallos de herramientas donde el enfoque planificado se vuelve inviable
- Presión de alcance que amenaza con expandir la tarea más allá de lo que se pidió
- Sobrecarga de contexto donde demasiadas señales en competencia crean parálisis
- Frustración o corrección del usuario que necesita ser absorbida en lugar de desviada
- Cuando `center` revela que la presión está desestabilizando el equilibrio

## Entradas

- **Requerido**: La presión o conflicto específico a abordar (disponible implícitamente desde el contexto)
- **Opcional**: Clasificación del tipo de presión (ver taxonomía del Paso 1)
- **Opcional**: Intentos previos de manejar esta presión y sus resultados

## Procedimiento

### Paso 1: Centrarse Antes del Contacto

Antes de abordar cualquier conflicto, establecer el centro (ver `center`). Luego identificar la presión entrante claramente.

```
AI Pressure Type Taxonomy:
┌─────────────────────────┬──────────────────────────────────────────┐
│ Pressure Type           │ Characteristics                          │
├─────────────────────────┼──────────────────────────────────────────┤
│ Contradictory           │ Two valid sources give incompatible      │
│ Requirements            │ instructions. Neither is simply wrong.   │
│                         │ Resolution requires synthesis, not       │
│                         │ choosing sides                           │
├─────────────────────────┼──────────────────────────────────────────┤
│ Tool Failure Cascade    │ A planned approach fails at the tool     │
│                         │ level. Retrying won't help. The failure  │
│                         │ data itself contains useful information  │
├─────────────────────────┼──────────────────────────────────────────┤
│ Scope Creep             │ The task silently expands. Each addition │
│                         │ seems reasonable in isolation, but the   │
│                         │ aggregate exceeds what was asked         │
├─────────────────────────┼──────────────────────────────────────────┤
│ Context Overload        │ Too many files, too many constraints,    │
│                         │ too many open threads. Paralysis from    │
│                         │ excess input, not insufficient input     │
├─────────────────────────┼──────────────────────────────────────────┤
│ Ambiguity               │ The request is genuinely unclear and     │
│                         │ multiple interpretations are valid.      │
│                         │ Action risks solving the wrong problem   │
├─────────────────────────┼──────────────────────────────────────────┤
│ User Correction         │ The user indicates the current approach  │
│                         │ is wrong. The correction carries both    │
│                         │ information and emotional weight         │
└─────────────────────────┴──────────────────────────────────────────┘
```

Clasificar la presión actual. Si hay múltiples presiones activas, identificar la primaria — abordar esa primero; las presiones secundarias a menudo se resuelven como efecto colateral.

**Esperado:** Una clasificación clara del tipo de presión y su manifestación específica en el contexto actual. La clasificación debería sentirse precisa, no forzada en la taxonomía.

**En caso de fallo:** Si la presión no encaja en ninguna categoría, puede ser un compuesto. Descomponer: ¿qué parte es contradictoria? ¿Qué parte es alcance? Manejar compuestos requiere abordar cada componente, no tratar el todo como un solo problema.

### Paso 2: Irimi — Entrar en la Fuerza

Moverse *hacia* el problema. Declararlo en su alcance completo sin minimizar, desviar ni proponer inmediatamente una solución.

1. Articular la presión completamente: ¿qué exactamente está en conflicto? ¿Qué exactamente falló? ¿Qué exactamente es ambiguo?
2. Nombrar las consecuencias: si esta presión no se aborda, ¿qué pasa?
3. Identificar lo que la presión revela: los fallos de herramientas revelan suposiciones; las contradicciones revelan contexto faltante; la desviación de alcance revela límites poco claros

**La prueba**: Si la descripción del problema suena tranquilizadora, se está desviando, no entrando. Irimi requiere contacto completo con la dificultad.

- Desviando: "Hay una inconsistencia menor entre estos dos archivos."
- Entrando: "El CLAUDE.md especifica 150 habilidades pero el registro contiene 148. O el conteo está mal, el registro está incompleto, o dos habilidades fueron eliminadas sin actualizar el conteo. Todas las referencias descendentes pueden estar afectadas."

**Esperado:** Una declaración completa e implacable del problema. La declaración debería hacer que el problema se sienta más real, no menos.

**En caso de fallo:** Si entrar al problema crea ansiedad o urgencia de resolverlo inmediatamente, pausar. Irimi es entrar, no reaccionar. El objetivo es ver el problema claramente antes de moverse. Si no se puede declarar el problema sin proponer una solución en la misma oración, separarlos explícitamente.

### Paso 3: Tenkan — Girar y Redirigir

Habiendo entrado en la fuerza, pivotar para redirigirla hacia la resolución. Cada tipo de presión tiene una redirección característica.

```
Redirect Patterns by Pressure Type:
┌─────────────────────────┬──────────────────────────────────────────┐
│ Pressure Type           │ Redirect Pattern                         │
├─────────────────────────┼──────────────────────────────────────────┤
│ Contradictory           │ Synthesize underlying intent: both       │
│ Requirements            │ sources serve a purpose. What goal do    │
│                         │ they share? Build from the shared goal,  │
│                         │ not from either source alone              │
├─────────────────────────┼──────────────────────────────────────────┤
│ Tool Failure Cascade    │ Use the failure data: what did the error │
│                         │ reveal about assumptions? The failure is │
│                         │ information. Switch tools or approach,   │
│                         │ incorporating what the failure taught    │
├─────────────────────────┼──────────────────────────────────────────┤
│ Scope Creep             │ Decompose to essentials: what was the    │
│                         │ original request? What is the minimum    │
│                         │ that satisfies it? Defer additions       │
│                         │ explicitly rather than silently absorbing│
├─────────────────────────┼──────────────────────────────────────────┤
│ Context Overload        │ Triage and sequence: which information   │
│                         │ is needed now vs. later vs. never? Rank  │
│                         │ by relevance to the immediate next step  │
├─────────────────────────┼──────────────────────────────────────────┤
│ Ambiguity               │ Surface the ambiguity to the user: "I   │
│                         │ see two interpretations — A and B. Which │
│                         │ do you mean?" Do not guess when asking   │
│                         │ is available                              │
├─────────────────────────┼──────────────────────────────────────────┤
│ User Correction         │ Absorb the correction fully: what was   │
│                         │ wrong, why was it wrong, what does the   │
│                         │ correct direction look like? Then adjust │
│                         │ without defensiveness or over-apology    │
└─────────────────────────┴──────────────────────────────────────────┘
```

Aplicar la redirección apropiada. La redirección debería sentirse como si usara la energía del problema en lugar de luchar contra ella.

**Esperado:** La presión se transforma de un obstáculo en una dirección. Las contradicciones se convierten en oportunidades de síntesis. Los fallos se convierten en datos de diagnóstico. La sobrecarga se convierte en un ejercicio de priorización.

**En caso de fallo:** Si la redirección se siente forzada o no resuelve la presión, la clasificación del Paso 1 puede estar incorrecta. Re-examinar: ¿es esto realmente una contradicción, o una fuente simplemente está desactualizada? ¿Es esto realmente desviación de alcance, o el alcance expandido es realmente lo que el usuario necesita? La clasificación errónea lleva a la redirección errónea.

### Paso 4: Ukemi — Recuperación Elegante

A veces la redirección falla. La presión es genuina y no puede ser transformada. Ukemi es el arte de caer de forma segura — reconocer límites sin catastrofizar.

1. Reconocer la limitación honestamente: "No puedo resolver esta contradicción con la información disponible" o "Este enfoque está bloqueado y no veo una alternativa"
2. Preservar el progreso existente: resumir qué se logró, qué se aprendió, qué queda
3. Comunicar la situación al usuario: cuál es el problema, qué se intentó, qué se necesita para avanzar
4. Identificar la ruta de recuperación: ¿qué desbloquearía esto? ¿Más información? ¿Un enfoque diferente? ¿Decisión del usuario?

```
Ukemi Recovery Checklist:
┌─────────────────────────┬──────────────────────────────────────────┐
│ Preserve                │ Summarize progress and learnings          │
│ Acknowledge             │ State the limitation without excuses      │
│ Communicate             │ Tell the user what is needed              │
│ Recover                 │ Identify the specific unblocking action   │
└─────────────────────────┴──────────────────────────────────────────┘
```

**Esperado:** Un reconocimiento elegante que mantiene la confianza. El usuario sabe qué pasó, qué se intentó y qué se necesita. No se pierde información.

**En caso de fallo:** Si reconocer la limitación se siente como fracaso en lugar de comunicación, notar la señal del ego. Ukemi es una habilidad, no una debilidad. Un honesto "estoy atascado" seguido de una solicitud clara de ayuda es más útil que una solución forzada que crea nuevos problemas.

### Paso 5: Randori — Múltiples Presiones Simultáneas

Cuando múltiples presiones llegan simultáneamente (corrección del usuario + fallo de herramienta + pregunta de alcance), aplicar principios de randori.

1. **Nunca congelarse**: elegir una presión y abordarla. Cualquier movimiento es mejor que la parálisis
2. **Usar presiones una contra otra**: un fallo de herramienta puede resolver una pregunta de alcance ("esa funcionalidad no se puede implementar así, entonces el alcance se reduce naturalmente")
3. **Técnicas simples bajo presión**: cuando se está abrumado, recurrir a la redirección más simple — reconocer cada presión, priorizar por urgencia, abordar secuencialmente
4. **Mantener consciencia**: mientras se aborda una presión, mantener las otras en visión periférica. Abordar la más urgente primero, pero no perder rastro del resto

**Esperado:** Movimiento hacia adelante a pesar de múltiples presiones. No resolución perfecta de todas las presiones simultáneamente, sino manejo secuencial que mantiene el progreso.

**En caso de fallo:** Si múltiples presiones crean parálisis, listarlas todas explícitamente, luego numerarlas por urgencia. Abordar la número 1. Solo comenzar rompe la parálisis. Si todas las presiones parecen igualmente urgentes, elegir la que tiene la resolución más simple primero — las victorias rápidas crean impulso.

### Paso 6: Zanshin — Consciencia Continua Después de la Resolución

Después de redirigir una presión, mantener consciencia de los efectos de segundo orden.

1. ¿La redirección creó nuevas presiones? (ej., resolver una contradicción eligiendo una interpretación puede invalidar trabajo anterior)
2. ¿La redirección satisfizo la necesidad subyacente, o solo el síntoma superficial?
3. ¿La resolución es estable, o la misma presión recurrirá?
4. Notar el patrón de redirección para referencia futura — si este tipo de presión recurre, la respuesta puede ser más rápida

**Esperado:** Un escaneo breve de efectos secundarios después de cada redirección. La mayoría de las redirecciones son limpias, pero las que crean problemas en cascada son exactamente las que importan en zanshin.

**En caso de fallo:** Si los efectos de segundo orden no se detectan y aparecen después, eso es una señal para profundizar la práctica de zanshin. Agregar una verificación breve de "¿qué rompió este cambio?" después de redirecciones significativas.

## Validación

- [ ] La presión fue clasificada en un tipo específico, no dejada vaga
- [ ] Irimi: el problema fue declarado en su alcance completo sin minimizar
- [ ] Tenkan: la redirección usó la energía del problema en lugar de luchar contra ella
- [ ] Si la redirección falló, se aplicó ukemi (reconocimiento honesto, progreso preservado)
- [ ] Múltiples presiones simultáneas fueron manejadas secuencialmente, no congeladas
- [ ] Zanshin: los efectos de segundo orden de la redirección fueron verificados

## Errores Comunes

- **Desviar en lugar de entrar**: Minimizar un problema ("es solo una pequeña inconsistencia") previene la redirección efectiva porque la fuerza completa nunca se compromete. Entrar primero, redirigir después
- **Forzar una redirección que no encaja**: No toda presión puede ser redirigida en el momento. Algunas requieren aporte del usuario, más información o simplemente esperar. Las redirecciones forzadas crean nuevos problemas
- **Ego en ukemi**: Tratar la necesidad de reconocer una limitación como fracaso personal en lugar de intercambio de información. El usuario se beneficia de saber temprano, no de una solución forzada
- **Abordar presiones secundarias primero**: Cuando existen múltiples presiones, es tentador manejar las fáciles primero. Esto se siente productivo pero deja la presión primaria creciendo. Abordar la presión más importante, no la más cómoda
- **Saltarse el centro**: Intentar redirigir sin primero establecer el centro convierte la redirección en reacción. El centro no es preparación opcional — es la base de la redirección efectiva

## Habilidades Relacionadas

- `aikido` — el arte marcial humano que esta habilidad mapea al razonamiento de IA; los principios de mezcla y redirección físicos informan el manejo de presión cognitiva
- `center` — prerrequisito para redirección efectiva; establece la base estable desde la cual opera la redirección
- `awareness` — detecta presiones temprano, antes de que requieran redirección de emergencia
- `heal` — recuperación más profunda cuando la presión ha causado deriva en subsistemas
- `meditate` — limpia el ruido residual después de manejar presiones difíciles
