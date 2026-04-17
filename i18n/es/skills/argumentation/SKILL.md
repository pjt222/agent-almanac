---
name: argumentation
description: >
  Construye argumentos bien estructurados usando la tríada hipótesis-argumento-
  ejemplo. Cubre la formulación de hipótesis falsificables, la construcción de
  argumentos lógicos (deductivos, inductivos, analógicos, evidenciales), la
  provisión de ejemplos concretos y la refutación de contraargumentos mediante
  el método de steelmanning. Usar al escribir o revisar descripciones de PRs
  que proponen cambios técnicos, al justificar decisiones de diseño en ADRs,
  al construir retroalimentación sustantiva de revisión de código, o al
  construir un argumento de investigación o propuesta técnica.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: argumentation, reasoning, hypothesis, logic, rhetoric, critical-thinking
  locale: es
  source_locale: en
  source_commit: 5f246ff7
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Construir Argumentos

Construye argumentos rigurosos desde la hipótesis a través del razonamiento hasta la evidencia concreta. Cada afirmación técnica persuasiva sigue la misma tríada: una hipótesis clara establece *qué* crees, un argumento explica *por qué* se sostiene, y los ejemplos prueban *que* se sostiene. Esta habilidad te enseña a aplicar esa estructura a las revisiones de código, decisiones de diseño, redacción de investigación y cualquier contexto donde las afirmaciones necesiten justificación.

## Cuándo Usar

- Al escribir o revisar una descripción de PR que propone un cambio técnico
- Al justificar una decisión de diseño en un ADR (Architecture Decision Record)
- Al construir retroalimentación en una revisión de código que va más allá de "no me gusta esto"
- Al escribir un argumento de investigación o propuesta técnica
- Al cuestionar o defender un enfoque en una discusión técnica

## Entradas

- **Requerido**: Una afirmación o posición que necesita justificación
- **Requerido**: Contexto (revisión de código, decisión de diseño, investigación, documentación)
- **Opcional**: Audiencia (desarrolladores pares, revisores, partes interesadas, investigadores)
- **Opcional**: Contraargumentos o posiciones alternativas a abordar
- **Opcional**: Evidencia o datos disponibles para apoyar la afirmación

## Procedimiento

### Paso 1: Formular la Hipótesis

Enunciar tu afirmación como una hipótesis clara y falsificable. Una hipótesis no es una opinión ni una preferencia -- es una afirmación específica que puede comprobarse con evidencia.

1. Escribir la afirmación en una oración
2. Aplicar la prueba de falsificabilidad: ¿puede alguien demostrar que está equivocada con evidencia?
3. Delimitar su alcance: restringirla a un contexto, base de código o dominio específico
4. Distinguirla de las opiniones comprobando si tiene criterios comprobables

**Falsificable vs. no falsificable:**

| No falsificable (opinión)              | Falsificable (hipótesis)                                       |
|---------------------------------------|----------------------------------------------------------------|
| "Este código es malo"                   | "Esta función tiene complejidad O(n^2) donde es alcanzable O(n)" |
| "Deberíamos usar TypeScript"           | "El sistema de tipos de TypeScript capturará la clase de errores de referencia nula que causó 4 de nuestros últimos 6 incidentes en producción" |
| "El diseño de la API es más limpio"          | "Reemplazar las 5 variantes de endpoint con un único endpoint parametrizado reduce la superficie de API pública en un 60%" |
| "Este enfoque de investigación es mejor"   | "El método A logra mayor precisión que el método B en el conjunto de datos X al nivel de confianza del 95%" |

**Esperado:** Una hipótesis en una oración que sea específica, delimitada y falsificable. Alguien que la lea puede imaginar inmediatamente qué evidencia la confirmaría o refutaría.

**En caso de fallo:** Si la hipótesis se siente vaga, aplicar la prueba "¿cómo la refutaría?" Si no puedes imaginar evidencia contraria, la afirmación es una opinión, no una hipótesis. Reducir el alcance o añadir criterios medibles hasta que sea comprobable.

### Paso 2: Identificar el Tipo de Argumento

Seleccionar la estructura lógica que mejor apoye tu hipótesis. Diferentes afirmaciones requieren diferentes estrategias de razonamiento.

1. Revisar los cuatro tipos de argumentos:

| Tipo        | Estructura                                  | Mejor para                          |
|-------------|---------------------------------------------|-------------------------------------|
| Deductivo   | Si A entonces B; A es verdad; por tanto B        | Pruebas formales, afirmaciones de seguridad de tipos |
| Inductivo   | Patrón observado en N casos; por tanto probable en general | Datos de rendimiento, resultados de pruebas    |
| Analógico  | X es similar a Y en aspectos relevantes; Y tiene propiedad P; por tanto X probablemente tiene P | Decisiones de diseño, elecciones tecnológicas |
| Evidencial  | La evidencia E es más probable bajo la hipótesis H1 que H2; por tanto H1 está apoyada | Hallazgos de investigación, resultados de pruebas A/B |

2. Relacionar tu hipótesis con el tipo de argumento más fuerte:
   - ¿Afirmas que algo *debe* ser verdad? Usar **deductivo**
   - ¿Afirmas que algo *tiende* a ser verdad basándose en observaciones? Usar **inductivo**
   - ¿Afirmas que algo *probablemente funcionará* basándose en casos previos similares? Usar **analógico**
   - ¿Afirmas que una explicación *se ajusta mejor a los datos* que las alternativas? Usar **evidencial**

3. Considerar combinar tipos para argumentos más sólidos (p.ej., razonamiento analógico respaldado por evidencia inductiva)

**Esperado:** Un tipo de argumento elegido (o combinación) con una justificación clara de por qué se adapta a la hipótesis.

**En caso de fallo:** Si ningún tipo encaja claramente, la hipótesis puede necesitar dividirse en sub-afirmaciones. Dividirla en partes que cada una tenga una estructura de argumento natural.

### Paso 3: Construir el Argumento

Construir la cadena lógica que conecta tu hipótesis con su justificación.

1. Enunciar las premisas (los hechos o supuestos desde los que se parte)
2. Mostrar la conexión lógica (cómo las premisas llevan a la conclusión)
3. Presentar el contraargumento más fuerte mediante steelmanning: enunciar el mejor caso opuesto *antes* de refutarlo
4. Abordar el contraargumento directamente con evidencia o razonamiento

**Ejemplo trabajado -- Revisión de código (deductivo + inductivo):**

> **Hipótesis**: "Extraer la lógica de validación en un módulo compartido reducirá la duplicación de errores en los tres manejadores de API."
>
> **Premisas**:
> - Los tres manejadores (`createUser`, `updateUser`, `deleteUser`) implementan cada uno la misma validación de entrada con ligeras variaciones (observado en `src/handlers/`)
> - En los últimos 6 meses, 3 de 5 errores de validación fueron corregidos en un manejador pero no propagados a los demás (ver issues #42, #57, #61)
> - Los módulos compartidos aplican una única fuente de verdad para la lógica (deductivo: si una implementación, entonces un solo lugar para corregir)
>
> **Cadena lógica**: Debido a que los tres manejadores duplican la misma validación (premisa 1), los errores corregidos en uno se pierden en otros (premisa 2, inductivo de 3/5 casos). Un módulo compartido significa que las correcciones se aplican una vez a todos los llamadores (deductivo de semántica de módulo compartido). Por tanto, la extracción reducirá la duplicación de errores.
>
> **Contraargumento (steelmanned)**: "Los módulos compartidos introducen acoplamiento -- un cambio en la validación para un manejador podría romper a los demás."
>
> **Refutación**: Los manejadores ya comparten *intención* de validación idéntica; el acoplamiento es implícito y más difícil de mantener. Hacerlo explícito mediante un módulo compartido con opciones parametrizadas (p.ej., `validate(input, { requireEmail: true })`) hace el acoplamiento visible y comprobable. La duplicación implícita actual es más arriesgada porque oculta la dependencia.

**Ejemplo trabajado -- Investigación (evidencial):**

> **Hipótesis**: "El pre-entrenamiento en corpus específicos del dominio mejora el rendimiento en tareas posteriores más que aumentar el tamaño del corpus general para NER biomédico."
>
> **Premisas**:
> - BioBERT pre-entrenado en PubMed (4,5B palabras) supera a BERT-Large pre-entrenado en inglés general (16B palabras) en 6/6 benchmarks de NER biomédico (Lee et al., 2020)
> - SciBERT pre-entrenado en Semantic Scholar (3,1B palabras) supera a BERT-Base en SciERC y JNLPBA a pesar de un corpus de pre-entrenamiento menor
> - El escalado de dominio general (BERT-Base a BERT-Large, 3x parámetros) produce ganancias menores en NER biomédico que la adaptación de dominio (BERT-Base a BioBERT, mismos parámetros)
>
> **Cadena lógica**: La evidencia muestra consistentemente que la selección del corpus de dominio supera la escala del corpus para NER biomédico (evidencial: estos resultados son más probables si la especificidad del dominio importa más que la escala). Tres comparaciones independientes apuntan en la misma dirección, fortaleciendo el caso inductivo.
>
> **Contraargumento (steelmanned)**: "Estos resultados pueden no generalizarse más allá de NER biomédico -- la biomedicina tiene vocabulario inusualmente especializado que infla la ventaja de adaptación de dominio."
>
> **Refutación**: Limitación válida. La hipótesis está delimitada específicamente a NER biomédico. Sin embargo, ganancias similares de adaptación de dominio aparecen en NLP legal (Legal-BERT) y NLP financiero (FinBERT), lo que sugiere que el patrón puede generalizarse a otros dominios especializados, aunque esa es una afirmación separada que requiere su propia evidencia.

**Esperado:** Una cadena de argumentos completa con premisas, conexión lógica, un contraargumento presentado mediante steelmanning y una refutación. El lector puede seguir el razonamiento paso a paso.

**En caso de fallo:** Si el argumento se siente débil, verificar las premisas. Los argumentos débiles generalmente provienen de premisas no respaldadas, no de lógica defectuosa. Encontrar evidencia para cada premisa o reconocerla como un supuesto. Si el contraargumento es más fuerte que la refutación, la hipótesis puede necesitar revisión.

### Paso 4: Proporcionar Ejemplos Concretos

Respaldar el argumento con evidencia verificable de forma independiente. Los ejemplos no son ilustraciones -- son la base empírica que hace comprobable el argumento.

1. Proporcionar al menos un **ejemplo positivo** que confirme la hipótesis
2. Proporcionar al menos un **ejemplo de caso extremo o límite** que ponga a prueba los límites
3. Asegurar que cada ejemplo sea **verificable de forma independiente**: otra persona puede reproducirlo o comprobarlo sin depender de tu interpretación
4. Para afirmaciones de código, hacer referencia a archivos, números de línea o commits específicos
5. Para afirmaciones de investigación, citar artículos, conjuntos de datos o resultados experimentales específicos

**Criterios de selección de ejemplos:**

| Criterio              | Buen ejemplo                                        | Mal ejemplo                              |
|----------------------|-----------------------------------------------------|------------------------------------------|
| Verificable independientemente | "El issue #42 muestra que el error se corrigió en el manejador A pero no en B" | "Hemos visto este tipo de error antes"     |
| Específico               | "`createUser` en la línea 47 reimplementa la misma expresión regular que `updateUser` en la línea 23" | "Hay duplicación en la base de código"    |
| Representativo         | "3 de 5 errores de validación en los últimos 6 meses siguieron este patrón" | "Una vez vi un error como este"             |
| Incluye casos extremos    | "Este patrón se mantiene para entradas de cadena pero no para la validación de carga de archivos, que tiene restricciones específicas del manejador" | (no se mencionan limitaciones)               |

**Esperado:** Ejemplos concretos que un lector puede verificar de forma independiente. Al menos uno positivo y un caso extremo. Cada uno hace referencia a un artefacto específico (archivo, línea, issue, artículo, conjunto de datos).

**En caso de fallo:** Si los ejemplos son difíciles de encontrar, la hipótesis puede ser demasiado amplia o no estar fundamentada en la realidad observable. Reducir el alcance a lo que realmente puedes señalar. La ausencia de ejemplos es una señal, no una brecha que rellenar con referencias vagas.

### Paso 5: Ensamblar el Argumento Completo

Combinar hipótesis, argumento y ejemplos en el formato apropiado para el contexto.

1. **Para revisiones de código** -- estructurar el comentario como:
   ```
   [S] <resumen en una línea de la sugerencia>

   **Hypothesis**: <qué crees que debe cambiar y por qué>

   **Argument**: <el caso lógico, con premisas>

   **Evidence**: <archivos, líneas, issues o métricas específicas>

   **Suggestion**: <cambio de código concreto o enfoque>
   ```

2. **Para descripciones de PR** -- estructurar el cuerpo como:
   ```markdown
   ## Why

   <Hypothesis: qué problema resuelve esto y la afirmación de mejora específica>

   ## Approach

   <Argument: por qué se eligió este enfoque sobre las alternativas>

   ## Evidence

   <Examples: benchmarks, referencias de errores, comparaciones antes/después>
   ```

3. **Para ADRs (Architecture Decision Records)** -- usar el formato ADR estándar con la tríada mapeada a Context (hipótesis), Decision (argumento) y Consequences (ejemplos/evidencia de resultados esperados)

4. **Para redacción de investigación** -- mapear a la estructura estándar: Introduction establece la hipótesis, Methods/Results proporcionan argumento y ejemplos, Discussion aborda contraargumentos

5. Revisar el argumento ensamblado para:
   - Brechas lógicas (¿la conclusión realmente se sigue de las premisas?)
   - Evidencia faltante (¿hay premisas no respaldadas?)
   - Contraargumentos no abordados (¿está respondida la objeción más fuerte?)
   - Aumento de alcance (¿el argumento se mantiene dentro de los límites de la hipótesis?)

**Esperado:** Un argumento completo y formateado apropiado para su contexto. El lector puede evaluar la hipótesis, seguir el razonamiento, verificar la evidencia y considerar los contraargumentos -- todo en una estructura coherente.

**En caso de fallo:** Si el argumento ensamblado se siente desconectado, la hipótesis puede ser demasiado amplia. Dividirlo en sub-argumentos enfocados, cada uno con su propia tríada hipótesis-argumento-ejemplo. Dos argumentos bien estructurados son más sólidos que uno disperso.

### Composition: Argumentation + Advocatus Diaboli

For high-stakes decisions, compose this skill with the `advocatus-diaboli` agent to form a pre-decision review loop. The pattern:

1. **Structure** via argumentation -- build the hypothesis-argument-example triad
2. **Stress-test** via advocatus-diaboli -- steelman the proposal, then challenge each assumption with specific questions. Flag severity: Critical (redesign or abandon), Medium (adjust), Low (note and proceed)
3. **Revise** based on findings -- critical findings trigger redesign; medium findings trigger adjustment; low findings are noted

**When to compose vs. use alone:**
- Use argumentation alone when constructing a proposal, PR description, or design justification
- Use advocatus-diaboli alone when reviewing someone else's existing argument
- Compose both when you are both the proposer and need adversarial self-review before committing

## Validación

- [ ] La hipótesis es falsificable (alguien podría refutarla con evidencia)
- [ ] La hipótesis está delimitada a un contexto específico, no es una afirmación universal
- [ ] El tipo de argumento está identificado y es apropiado para la afirmación
- [ ] Las premisas se enuncian explícitamente, no se asumen como conocimiento compartido
- [ ] La cadena lógica conecta premisas con la conclusión sin brechas
- [ ] El contraargumento más fuerte se presenta mediante steelmanning y se aborda
- [ ] Al menos un ejemplo positivo apoya la hipótesis
- [ ] Al menos un caso extremo o limitación se reconoce
- [ ] Todos los ejemplos son verificables de forma independiente (se proporcionan referencias)
- [ ] El formato de salida coincide con el contexto (revisión de código, PR, ADR, investigación)
- [ ] Sin falacias lógicas (apelación a la autoridad, falsa dicotomía, hombre de paja)

## Errores Comunes

- **Enunciar opiniones como hipótesis**: "Este código es desordenado" es una preferencia, no una hipótesis. Reescribir como una afirmación comprobable: "Este módulo tiene 4 responsabilidades que deben separarse según el principio de responsabilidad única, como lo evidencian sus 6 métodos públicos que abarcan 3 dominios no relacionados."
- **Saltarse el contraargumento**: Las objeciones no abordadas debilitan el argumento aunque el lector nunca las exprese. Siempre presentar mediante steelmanning -- enunciar el mejor caso opuesto en su mejor forma antes de refutarlo.
- **Ejemplos vagos**: "Hemos visto este patrón antes" no es evidencia. Señalar a issues, commits, líneas, artículos o conjuntos de datos específicos. Si no puedes encontrar un ejemplo concreto, tu hipótesis puede no estar bien fundamentada.
- **Argumento de autoridad**: "El ingeniero senior lo dijo" o "Google lo hace así" no es un argumento lógico. La autoridad puede *motivar* la investigación, pero el argumento debe sostenerse por su propia evidencia y razonamiento.
- **Aumento de alcance en las conclusiones**: Sacar conclusiones más amplias que lo que la evidencia apoya. Si tus ejemplos cubren 3 manejadores de API, no concluir sobre toda la base de código. Hacer coincidir el alcance de la conclusión con el alcance de la evidencia.
- **Confundir tipos de argumentos**: Usar lenguaje inductivo ("tiende a") para afirmaciones deductivas ("debe ser") o viceversa. Ser preciso sobre la fuerza de tu conclusión -- los argumentos deductivos dan certeza, los inductivos dan probabilidad.

## Habilidades Relacionadas

- `review-pull-request` -- aplicar la argumentación a la retroalimentación estructurada de revisión de código
- `review-research` -- construir argumentos basados en evidencia en contextos de investigación
- `review-software-architecture` -- justificar decisiones arquitectónicas con la tríada hipótesis-argumento-ejemplo
- `create-skill` -- las habilidades mismas son argumentos estructurados sobre cómo realizar una tarea
- `write-claude-md` -- documentar convenciones y decisiones que se benefician de una justificación clara
