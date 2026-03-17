---
name: learn
description: >
  Adquisición sistemática de conocimiento por IA desde territorio desconocido —
  construcción deliberada de modelos con bucles de retroalimentación. Mapea los
  principios de repetición espaciada al razonamiento de IA: explorar el
  territorio, hipotetizar estructura, explorar con sondeos, integrar hallazgos,
  verificar comprensión y consolidar para recuperación futura. Usar al encontrar
  una base de código o dominio desconocido, cuando un usuario pregunta sobre un
  tema que requiere investigación genuina en lugar de recuerdo, cuando múltiples
  fuentes conflictivas requieren construir un modelo coherente, o al prepararse
  para enseñar un tema y se requiere comprensión profunda primero.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, learning, knowledge-acquisition, meta-cognition, model-building
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Learn

Conducir una sesión estructurada de adquisición de conocimiento — explorando territorio desconocido, construyendo modelos iniciales, probándolos mediante exploración deliberada, integrando hallazgos en comprensión coherente y consolidando para recuperación duradera.

## Cuándo Usar

- Al encontrar una base de código, framework o dominio desconocido sin contexto previo
- Un usuario pregunta sobre un tema fuera del conocimiento de trabajo actual y la respuesta requiere investigación genuina, no recuerdo
- Existen múltiples fuentes o patrones conflictivos y se necesita construir un modelo mental coherente desde cero
- Después de que `remote-viewing` expone pistas intuitivas que necesitan validación sistemática
- Al prepararse para enseñar (`teach`) un tema — la IA primero debe entenderlo lo suficientemente profundo para explicarlo

## Entradas

- **Requerido**: Objetivo de aprendizaje — un tema, área de base de código, API, concepto de dominio o tecnología a comprender
- **Opcional**: Límite de alcance — qué tan profundo ir (exploración superficial vs. expertise profundo)
- **Opcional**: Propósito del usuario — por qué importa este conocimiento (guía qué aspectos priorizar)
- **Opcional**: Puntos de partida conocidos — archivos, documentación o conceptos ya familiares

## Procedimiento

### Paso 1: Explorar — Mapear el territorio

Antes de intentar comprender algo, mapear el paisaje para identificar lo que existe.

```
Learning Modality Selection:
┌──────────────────┬──────────────────────────┬──────────────────────────┐
│ Territory Type   │ Primary Modality         │ Tool Pattern             │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Codebase         │ Structural mapping —     │ Glob for file tree,      │
│                  │ find entry points, core  │ Grep for exports/imports,│
│                  │ modules, boundaries      │ Read for key files       │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ API / Library    │ Interface mapping —      │ WebFetch for docs,       │
│                  │ find public surface,     │ Read for examples,       │
│                  │ types, configuration     │ Grep for usage patterns  │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Domain concept   │ Ontology mapping —       │ WebSearch for overviews,  │
│                  │ find core terms,         │ WebFetch for definitions,│
│                  │ relationships, debates   │ Read for local notes     │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ User's context   │ Conversational mapping   │ Read conversation,       │
│                  │ — find stated goals,     │ Read MEMORY.md,          │
│                  │ preferences, constraints │ Read CLAUDE.md           │
└──────────────────┴──────────────────────────┴──────────────────────────┘
```

1. Identificar el tipo de territorio y seleccionar la modalidad primaria
2. Realizar un escaneo amplio — sin leer profundamente, sino identificando puntos de referencia (archivos clave, puntos de entrada, conceptos centrales)
3. Notar los límites: qué está dentro del alcance, qué es adyacente, qué está fuera del alcance
4. Identificar brechas: áreas que parecen importantes pero son opacas desde la superficie
5. Crear un mapa aproximado: listar los componentes principales y sus relaciones aparentes

**Esperado:** Un mapa esquelético del territorio con 5-15 puntos de referencia identificados. Una noción de qué áreas son claras desde la superficie y cuáles requieren investigación más profunda. Sin comprensión todavía — solo un mapa.

**En caso de fallo:** Si el territorio es demasiado grande para explorar, reducir el alcance inmediatamente. Preguntar: "¿Cuál es el mínimo que necesito entender para servir al propósito del usuario?" Si el territorio no tiene un punto de entrada claro, empezar desde la salida (¿qué produce este sistema?) y rastrear hacia atrás.

### Paso 2: Hipotetizar — Construir modelos iniciales

Desde la exploración, construir hipótesis iniciales sobre cómo funciona el sistema.

1. Formular 2-3 hipótesis sobre la estructura o comportamiento del territorio
2. Declarar cada hipótesis claramente: "Creo X porque observé Y"
3. Para cada hipótesis, identificar qué evidencia la confirmaría y qué la refutaría
4. Clasificar hipótesis por confianza: cuál se siente más respaldada, cuál es más inestable
5. Identificar la hipótesis de mayor valor para probar primero (la que, si se confirma, desbloquearía la mayor comprensión)

**Esperado:** Hipótesis concretas y falsificables — no impresiones vagas. Cada una tiene una prueba que la confirmaría o refutaría. Las hipótesis colectivamente cubren los aspectos más importantes del territorio.

**En caso de fallo:** Si no se forman hipótesis, la exploración fue demasiado superficial — regresar al Paso 1 y leer 2-3 puntos de referencia en profundidad. Si todas las hipótesis se sienten igualmente inciertas, empezar con la más simple (navaja de Occam) y construir desde ahí.

### Paso 3: Explorar — Sondear y probar

Probar sistemáticamente cada hipótesis mediante investigación dirigida.

1. Seleccionar la hipótesis de mayor prioridad
2. Diseñar un sondeo mínimo: ¿cuál es la investigación más pequeña que confirmaría o refutaría la hipótesis?
3. Ejecutar el sondeo (leer un archivo, buscar un patrón, probar una suposición)
4. Registrar el resultado: confirmado, refutado o modificado
5. Si fue refutada, actualizar la hipótesis basándose en la nueva evidencia
6. Si fue confirmada, sondear más profundo: ¿la hipótesis se mantiene en los bordes, o solo en el centro?
7. Pasar a la siguiente hipótesis y repetir

**Esperado:** Al menos una hipótesis probada hasta conclusión. El modelo mental está comenzando a tomar forma — algunas partes confirmadas, algunas revisadas. Las sorpresas se notan como datos particularmente valiosos.

**En caso de fallo:** Si los sondeos consistentemente producen resultados ambiguos, las hipótesis pueden estar probando las cosas equivocadas. Retroceder y preguntar: "¿Qué consideraría alguien que entiende este sistema como el hecho más importante?" Sondear eso en su lugar.

### Paso 4: Integrar — Construir modelo mental

Sintetizar hallazgos en un modelo coherente que conecte las piezas.

1. Revisar todas las hipótesis confirmadas y modelos revisados
2. Identificar el principio organizador central: ¿cuál es la "columna vertebral" a la que todo se conecta?
3. Mapear relaciones: ¿qué componentes dependen de cuáles? ¿Qué fluye hacia dónde?
4. Identificar los hallazgos sorprendentes — estos a menudo contienen la percepción más profunda
5. Buscar patrones que se repiten en diferentes partes del territorio
6. Construir un modelo mental que pueda predecir comportamiento: "Dada la entrada X, espero Y porque Z"

**Esperado:** Un modelo mental coherente que explica la estructura del territorio y predice su comportamiento. El modelo debería ser expresable en 3-5 oraciones y debería hacer afirmaciones específicas, no generalizaciones vagas.

**En caso de fallo:** Si las piezas no se integran en un modelo coherente, puede haber un malentendido fundamental en una de las hipótesis anteriores. Identificar la pieza que no encaja y re-probarla. Alternativamente, el territorio puede ser genuinamente incoherente (los sistemas mal diseñados existen) — notar esto como un hallazgo en lugar de forzar coherencia.

### Paso 5: Verificar — Desafiar la comprensión

Probar el modelo mental haciendo predicciones y verificándolas.

1. Usar el modelo para hacer 3 predicciones específicas sobre el territorio
2. Probar cada predicción mediante investigación (no asumiéndola como verdadera)
3. Por cada predicción confirmada, la confianza aumenta
4. Por cada predicción refutada, identificar dónde el modelo está equivocado y corregirlo
5. Identificar casos límite: ¿el modelo se mantiene en los límites, o se desmorona?
6. Preguntar: "¿Qué me sorprendería?" — luego verificar si esa sorpresa es posible

**Esperado:** El modelo mental sobrevive al menos 2 de 3 pruebas de predicción. Donde falla, la falla se entiende y el modelo se corrige. El modelo ahora tiene tanto fortalezas confirmadas como limitaciones conocidas.

**En caso de fallo:** Si la mayoría de las predicciones fallan, el modelo mental tiene una falla fundamental. Esto es realmente información valiosa — significa que el territorio funciona diferente de lo esperado. Regresar al Paso 2 con la nueva evidencia y reconstruir las hipótesis desde cero. El segundo intento será mucho más rápido porque los modelos incorrectos han sido eliminados.

### Paso 6: Consolidar — Almacenar para recuperación

Capturar el aprendizaje en una forma que soporte la recuperación y aplicación futuras.

1. Resumir el modelo mental en 3-5 oraciones
2. Notar los puntos de referencia clave — las 3-5 cosas más importantes para recordar
3. Registrar cualquier hallazgo contraintuitivo que podría ser olvidado
4. Identificar temas relacionados a los que este aprendizaje se conecta
5. Si el aprendizaje es duradero (será necesario entre sesiones), actualizar MEMORY.md
6. Si el aprendizaje es específico de la sesión, notarlo como contexto para la conversación actual
7. Declarar lo que permanece desconocido — las brechas honestas son más útiles que la falsa confianza

**Esperado:** Un resumen conciso y recuperable que captura la comprensión esencial. Las referencias futuras a este tema pueden empezar desde este resumen en lugar de re-aprender desde cero.

**En caso de fallo:** Si el aprendizaje resiste la resumición, puede no estar todavía completamente integrado — regresar al Paso 4. Si el aprendizaje parece demasiado obvio para valer la pena almacenar, considerar que lo que se siente obvio ahora puede no sentirse obvio en un contexto fresco. Almacenar las partes no obvias.

## Validación

- [ ] Se condujo una exploración antes de cualquier investigación profunda (mapear antes de sumergir)
- [ ] Las hipótesis fueron explícitamente declaradas y probadas, no asumidas
- [ ] Al menos una hipótesis fue revisada basándose en evidencia (indica aprendizaje genuino)
- [ ] El modelo mental hace predicciones específicas y verificables sobre el territorio
- [ ] Los desconocidos conocidos se identifican junto a los conocidos conocidos
- [ ] El resumen consolidado es lo suficientemente conciso para ser útil para recuperación futura

## Errores Comunes

- **Saltar la exploración**: Sumergirse en detalles antes de entender el paisaje desperdicia tiempo en áreas sin importancia y pierde el panorama general
- **Hipótesis infalsificables**: "Esto es probablemente complejo" no puede ser probado. "Este módulo maneja autenticación porque importa crypto" sí puede serlo
- **Sesgo de confirmación durante la exploración**: Buscar solo evidencia que respalde la hipótesis inicial mientras se ignoran contradicciones
- **Consolidación prematura**: Almacenar un modelo antes de que haya sido probado lleva a predicciones futuras confidentemente equivocadas
- **Perfeccionismo**: Intentar aprenderlo todo antes de aplicar cualquier conocimiento. El aprendizaje es iterativo — usar comprensión parcial, luego refinar
- **Aprendizaje sin propósito**: Adquirir conocimiento sin aplicación en mente produce comprensión desenfocada y superficial

## Habilidades Relacionadas

- `learn-guidance` — la variante de guía humana para entrenar a una persona en aprendizaje estructurado
- `teach` — transferencia de conocimiento calibrada a un aprendiz; se construye sobre el modelo construido aquí
- `remote-viewing` — exploración intuitiva que expone pistas para que el aprendizaje sistemático valide
- `meditate` — limpiar el ruido del contexto previo antes de entrar en nuevo territorio de aprendizaje
- `observe` — reconocimiento neutral sostenido de patrones que alimenta el aprendizaje con datos crudos
