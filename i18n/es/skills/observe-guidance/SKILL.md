---
name: observe-guidance
description: >
  Guiar a una persona en la observación sistemática de sistemas, patrones o
  fenómenos. La IA coaching sobre atención neutral, metodología de notas de
  campo, reconocimiento de patrones, formación de hipótesis y reportes
  estructurados para depuración, investigación y comprensión de sistemas.
  Usar cuando una persona quiere comprender el comportamiento de un sistema
  antes de intervenir, cuando alguien sigue saltando a conclusiones y necesita
  la disciplina de observar primero, al preparar un informe basado en
  evidencia, o al estudiar dinámicas de equipo o efectividad de procesos
  mediante observación directa.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, observation, field-study, pattern-recognition, debugging, guidance
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Observe (Guidance)

Guiar a una persona en la observación sistemática de un sistema, fenómeno o patrón. La IA actúa como coach de estudio de campo — ayudando a enmarcar el objetivo de observación, preparar un protocolo, sostener la atención neutral, registrar hallazgos con notas de campo, analizar patrones y reportar observaciones con separación clara entre datos e interpretación.

## Cuándo Usar

- Una persona quiere comprender el comportamiento de un sistema antes de intervenir (depuración por observación en lugar de prueba y error)
- Alguien está realizando investigación o recopilando evidencia y necesita metodología de observación estructurada
- Una persona sigue saltando a conclusiones y necesita desarrollar la disciplina de observar antes de interpretar
- Alguien está preparando un informe que requiere hallazgos basados en evidencia, no opiniones
- Una persona quiere comprender dinámicas de equipo, comportamiento de usuarios o efectividad de procesos mediante observación directa
- Después de que `meditate-guidance` ha cultivado atención sostenida, la persona quiere dirigir esa atención hacia un sistema específico

## Entradas

- **Requerido**: Lo que la persona quiere observar (un sistema, proceso, comportamiento, base de código, dinámica de equipo, fenómeno natural)
- **Requerido**: Por qué están observando (depuración, investigación, auditoría, curiosidad, mejora)
- **Opcional**: Tiempo disponible para la observación (sesión única vs. estudio de varios días)
- **Opcional**: Intentos previos de comprender el sistema (qué se ha intentado ya)
- **Opcional**: Preguntas o hipótesis específicas que quieren probar
- **Opcional**: Herramientas disponibles para registro (cuaderno, captura de pantalla, logging, métricas)

## Procedimiento

### Paso 1: Enmarcar — Definir el objetivo de observación

Ayudar a la persona a establecer un marco de observación claro y delimitado.

1. Preguntar qué quieren observar: "¿Qué sistema o comportamiento intentas comprender?"
2. Ayudarles a reducir el alcance: "¿Qué aspecto específico de ese sistema te interesa más?"
3. Identificar el propósito de la observación: comprensión, depuración, mejora, recopilación de evidencia o pura curiosidad
4. Establecer límites: qué está dentro del alcance y qué no (previene que la observación se expanda sin fin)
5. Si tienen una hipótesis: declararla explícitamente, luego apartarla — "Buscaremos evidencia tanto a favor como en contra"
6. Elegir la postura de observación:
   - **Naturalista**: observar sin interferir (mejor para comprender comportamiento)
   - **Controlada**: cambiar una variable y observar el efecto (mejor para depuración)
   - **Longitudinal**: observar a lo largo del tiempo (mejor para detectar tendencias)

**Esperado:** Un marco de observación claro con objetivo, alcance, propósito y postura definidos. La persona sabe qué está mirando y qué no está mirando.

**En caso de fallo:** Si la persona no puede reducir su enfoque ("Quiero entender todo"), ayudarles a elegir un punto de entrada: "¿Cuál es el comportamiento que más te confunde?" Si ya están comprometidos con una conclusión ("Solo necesito probar X"), desafiar gentilmente: "¿Qué necesitaríamos ver para refutar eso? Busquemos ambas cosas."

### Paso 2: Preparar — Establecer el protocolo de observación

Ayudar a la persona a establecer un enfoque sistemático para registrar lo que observan.

1. Elegir el método de registro basándose en el tipo de observación:
   - **Base de código/sistema**: rutas de archivos, números de línea, marcas de tiempo, entradas de log
   - **Comportamiento/proceso**: notas con marca de tiempo con actor, acción y contexto
   - **Equipo/comunicación**: citas, identificadores de hablantes, señales no verbales
   - **Natural/físico**: bocetos, mediciones, condiciones ambientales
2. Crear una plantilla de registro simple:

```
Field Notes Template:
┌─────────────┬────────────────────────────────────────────────────────┐
│ Timestamp   │ When the observation occurred                          │
├─────────────┼────────────────────────────────────────────────────────┤
│ Observation │ What was seen/heard/measured (fact only)               │
├─────────────┼────────────────────────────────────────────────────────┤
│ Context     │ What was happening around the observation              │
├─────────────┼────────────────────────────────────────────────────────┤
│ Reaction    │ Observer's response (thoughts, emotions, surprises)    │
├─────────────┼────────────────────────────────────────────────────────┤
│ Hypothesis  │ Tentative interpretation (kept separate from fact)     │
└─────────────┴────────────────────────────────────────────────────────┘
```

3. Enfatizar la separación: "La fila de observación es un hecho. La fila de hipótesis es interpretación. Nunca mezclarlas."
4. Establecer un conteo mínimo de observaciones: "Apunta a al menos 10 observaciones antes de sacar cualquier conclusión"
5. Si aplica, configurar herramientas de monitoreo: logging, métricas, grabación de pantalla

**Esperado:** La persona tiene un método de registro listo y comprende la distinción crítica entre observación e interpretación. Se sienten preparados para comenzar.

**En caso de fallo:** Si la plantilla se siente demasiado formal, simplificar a: "Solo escribe lo que ves, y por separado escribe lo que crees que significa." Si se resisten a registrar ("Lo recordaré"), explicar que las observaciones no registradas están sujetas a sesgo de memoria — el acto de escribir hace la observación más precisa.

### Paso 3: Observar — Practicar la atención neutral sostenida

Guiar a la persona a través de la sesión de observación real.

1. Recordarles la postura: "Eres un naturalista estudiando una nueva especie. No interfieras — solo observa"
2. Durante los primeros 5 minutos: fomentar la observación pura sin registro — solo atender
3. Después de la inmersión inicial: comenzar a registrar usando la plantilla
4. Guiar hacia un lenguaje neutral: "En lugar de 'el sistema se cayó,' intenta 'el sistema dejó de responder a las 14:32 después de procesar la solicitud número 47'"
5. Vigilar que la interpretación se infiltre en la observación: "Eso es una interpretación — regístralo en la fila de hipótesis"
6. Fomentar notar las sorpresas: "¿Qué te sorprendió? Las sorpresas a menudo contienen los datos más valiosos"
7. Verificar periódicamente el marco: "¿Sigues observando lo que te propusiste observar, o tu atención se ha desviado?"
8. Si quieren intervenir: "Nota lo que quieres cambiar y por qué, pero no lo cambies todavía — sigue observando"

**Esperado:** La persona genera al menos 5-10 observaciones concretas con evidencia específica. Experimentan la diferencia entre observar e interpretar, y descubren que es más difícil de lo esperado mantener la atención neutral.

**En caso de fallo:** Si siguen interpretando en lugar de observar, probar este ejercicio: "Describe lo que ves como si se lo explicaras a alguien que nunca ha visto este sistema. Usa solo hechos verificables." Si se les acaban las cosas para observar rápidamente, están mirando a un nivel demasiado alto — guiarlos para acercarse a los detalles: temporización, orden, casos límite, excepciones.

### Paso 4: Registrar — Capturar hallazgos con notas de campo

Ayudar a la persona a organizar sus observaciones crudas en notas estructuradas.

1. Revisar juntos las observaciones registradas
2. Verificar la completitud: ¿cada observación tiene suficiente contexto para ser comprendida después?
3. Verificar la precisión factual: ¿las declaraciones son verificables, o contienen suposiciones ocultas?
4. Agrupar observaciones similares: "¿Ves algún patrón formándose?"
5. Notar frecuencias: ¿con qué frecuencia apareció cada patrón?
6. Notar ausencias: "¿Qué esperabas ver que no estuvo ahí?"
7. Ayudarles a separar observaciones fuertes (evidencia clara) de observaciones débiles (datos ambiguos)

**Esperado:** Un conjunto de notas de campo organizadas que separan limpiamente la observación de la interpretación. Las notas son lo suficientemente detalladas para que otra persona pudiera verificar las observaciones independientemente.

**En caso de fallo:** Si las notas son demasiado vagas ("las cosas parecían lentas"), ayudarles a agregar específicos: "¿Qué tan lento? ¿Comparado con qué? ¿En qué condiciones?" Si las notas son demasiado detalladas (registrando todo), ayudarles a identificar qué observaciones se relacionan con el marco original y cuáles son ruido.

### Paso 5: Analizar — Identificar patrones y generar hipótesis

Guiar a la persona desde las observaciones hacia el análisis estructurado.

1. Disponer todas las observaciones y buscar patrones:
   - **Repetición**: "Esto sucedió múltiples veces — ¿es sistemático?"
   - **Correlación**: "X siempre sucede junto con Y — ¿están relacionados?"
   - **Secuencia**: "A siempre precede a B — ¿podría A causar B?"
   - **Ausencia**: "X nunca sucede en la condición Z — ¿por qué?"
   - **Anomalía**: "Todo sigue el patrón P excepto este caso — ¿qué es diferente?"
2. Para cada patrón, preguntar: "¿Hay una explicación alternativa?"
3. Generar 2-3 hipótesis que expliquen los patrones principales
4. Distinguir entre correlación y causalidad: "Observar que A y B co-ocurren no prueba que A cause B"
5. Identificar qué hipótesis son verificables y qué prueba las confirmaría/refutaría
6. Notar niveles de confianza: ¿qué hipótesis están bien respaldadas, cuáles son especulativas?

**Esperado:** La persona pasa de observaciones crudas a hipótesis estructuradas manteniendo la disciplina de separar datos de teoría. Tienen al menos una hipótesis verificable para su pregunta original.

**En caso de fallo:** Si saltan a una sola explicación inmediatamente, desafiarla: "Esa es una posibilidad. ¿Cuál es otra?" Si no ven patrones, las observaciones pueden ser muy pocas — sugerir continuar la observación antes del análisis. Si cada observación parece apuntar a la misma conclusión, pueden estar filtrando — preguntar: "¿Qué evidencia contradiría tu teoría actual?"

### Paso 6: Reportar — Compartir hallazgos con estructura clara

Ayudar a la persona a comunicar sus observaciones efectivamente.

1. Estructurar el informe:
   - **Contexto**: Qué se observó, cuándo, por qué, bajo qué condiciones
   - **Método**: Cómo se condujo la observación (protocolo, herramientas, duración)
   - **Hallazgos**: Observaciones clave con evidencia (datos, no interpretación)
   - **Análisis**: Patrones identificados, hipótesis generadas, niveles de confianza
   - **Recomendaciones**: Próximos pasos sugeridos (más observación, pruebas, intervención)
   - **Limitaciones**: Lo que la observación no cubrió, sesgos potenciales
2. Ayudarles a escribir hallazgos en lenguaje neutral que separe hechos de interpretación
3. Revisar en busca de suposiciones ocultas o afirmaciones no respaldadas
4. Si las observaciones son para depuración: traducir hipótesis en pruebas concretas
5. Si las observaciones son para un informe: asegurar que la evidencia se cite específicamente
6. Si las observaciones son para comprensión personal: resumir las percepciones clave y las preguntas restantes

**Esperado:** Un informe claro que comunica observaciones, patrones e hipótesis manteniendo la distinción entre lo que se observó y lo que se infirió. El lector puede evaluar la evidencia independientemente.

**En caso de fallo:** Si el informe entierra las observaciones en interpretación, reestructurar: "Pon todos los hechos en una sección, todas las teorías en otra." Si el informe carece de niveles de confianza ("esto es definitivamente porque..."), ayudarles a calibrar: "¿Qué tan seguro estás? ¿Qué cambiaría tu opinión?"

## Validación

- [ ] El objetivo de observación fue enmarcado antes de que comenzara la observación (no exploración sin forma)
- [ ] Un protocolo de registro fue establecido y usado consistentemente
- [ ] Las observaciones fueron registradas como hechos, separadas de las interpretaciones
- [ ] Al menos 5 observaciones concretas respaldadas por evidencia fueron capturadas
- [ ] Los patrones fueron identificados mediante análisis, no asumidos desde el inicio
- [ ] Las hipótesis son verificables y tienen niveles de confianza declarados
- [ ] La persona experimentó la disciplina de observar antes de interpretar

## Errores Comunes

- **Observación como sesgo de confirmación**: Observar solo cosas que apoyan una creencia preexistente. El marco debe incluir "buscar evidencia contra tu hipótesis" como instrucción explícita
- **Impulso de intervención**: Ver un problema y querer arreglarlo inmediatamente. La intervención prematura a menudo enmascara la causa raíz — observar primero, luego intervenir con comprensión completa
- **Fatiga de registro**: La observación detallada es mentalmente exigente. Sugerir descansos y duraciones realistas de sesión (30-60 minutos de observación enfocada es sustancial)
- **Sobrecomplicar el protocolo**: Para observaciones simples, un cuaderno y marcas de tiempo son suficientes. El protocolo debe servir a la observación, no reemplazarla
- **Confundir observación con vigilancia**: En la observación interpersonal, los límites éticos importan. Observar comportamiento visible, no espiar. Si se observan personas, la transparencia suele ser mejor que el secreto
- **Omitir el marco**: Sin un objetivo de observación claro, la atención se dispersa y los hallazgos quedan desenfocados. Incluso un marco aproximado es mejor que ninguno

## Habilidades Relacionadas

- `observe` — la variante autodirigida de la IA para reconocimiento neutral sostenido de patrones en sistemas
- `learn-guidance` — la observación alimenta el aprendizaje proporcionando datos crudos para la comprensión
- `listen-guidance` — escuchar es observación enfocada de un hablante; la observación es atención de alcance más amplio hacia cualquier sistema
- `remote-viewing-guidance` — comparte metodología de observación estructurada adaptada para percepción no local
- `read-garden` — habilidad de observación de jardín que usa protocolos sensoriales similares adaptados de CRV
