---
name: remote-viewing
description: >
  Exploración intuitiva de IA para abordar bases de código, problemas o
  sistemas desconocidos sin preconcepciones. Adapta el protocolo de Visión
  Remota por Coordenadas a la investigación de IA: enfriamiento (limpiar
  suposiciones), recopilación de datos por etapas (señales crudas →
  dimensionales → analíticas), gestión de AOL (separar observaciones de
  etiquetas prematuras), y revisión estructurada. Usar al investigar una
  base de código desconocida con arquitectura no conocida, al depurar un
  problema donde hipótesis prematuras podrían desviar, al explorar un dominio
  con contexto limitado, o cuando intentos previos han sido desviados por
  suposiciones y la "mente de principiante" sería más productiva.
license: MIT
allowed-tools: Read Glob Grep
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, remote-viewing, exploration, investigation, assumption-management
  locale: es
  source_locale: en
  source_commit: 902f69ec
  translator: claude
  translation_date: "2026-03-17"
---

# Remote View

Abordar una base de código, problema o sistema desconocido usando el protocolo de Visión Remota por Coordenadas adaptado para investigación de IA — recopilando observaciones crudas antes de formar conclusiones, gestionando el etiquetado prematuro (Superposición Analítica), y construyendo comprensión a través de recopilación de datos por etapas.

## Cuándo Usar

- Investigar una base de código desconocida donde la arquitectura es desconocida
- Depurar un problema donde la causa raíz no es obvia y hipótesis prematuras podrían desviar
- Explorar un dominio o tecnología sobre la que se tiene contexto limitado
- Cuando intentos de investigación previos han sido desviados por suposiciones
- Abordar cualquier problema donde la "mente de principiante" sería más productiva que la coincidencia de patrones

## Entradas

- **Requerido**: Un objetivo a investigar (ruta de base de código, descripción del problema, sistema a comprender)
- **Requerido**: Compromiso con enfoque ciego — resistir formar conclusiones hasta que la recopilación de datos esté completa
- **Opcional**: Preguntas específicas a responder sobre el objetivo (reservar para Etapa V)
- **Opcional**: Sesión de meditación previa para limpiar suposiciones (ver `meditate`)

## Procedimiento

### Paso 1: Enfriamiento — Limpiar Suposiciones

Transicionar del modo cargado de suposiciones a observación receptiva. Este paso no es negociable.

1. Identificar todas las preconcepciones sobre el objetivo:
   - "Esto probablemente es una app de React" — declararlo
   - "El error probablemente está en la capa de base de datos" — declararlo
   - "Esto sigue arquitectura MVC" — declararlo
2. Escribir cada preconcepción explícitamente (en tu razonamiento o salida)
3. Para cada una, anotar: "Esto puede o no ser verdad. Lo verificaré, no lo asumiré."
4. Liberar la necesidad de identificar el objetivo rápidamente — la meta es descripción precisa, no etiquetado rápido
5. Cuando notes que la mente analítica busca un framework o etiqueta, pausar y redirigir a observación cruda

**Esperado:** Una lista de preconcepciones declaradas y un cambio consciente de "Creo que sé qué es esto" a "Observaré qué es esto realmente." Alerta y receptivo, sin saltar a conclusiones.

**En caso de fallo:** Si las suposiciones siguen reafirmándose ("pero realmente ES una app de React..."), extender el enfriamiento. Escribir la suposición en una lista de "estacionamiento" y continuar. No comenzar la recopilación de datos mientras se esté activamente apegado a una hipótesis específica — coloreará todo lo que observes.

### Paso 2: Ideograma — Primer Contacto (Etapa I)

Hacer contacto inicial con el objetivo a través de la observación más mínima posible.

1. Usar `Glob` para ver solo la estructura de nivel superior (ej., `*` o `path/*`) — no leer ningún archivo todavía
2. Anotar las impresiones inmediatas y sin filtrar: cantidad de archivos, patrones de nomenclatura, presencia/ausencia de marcadores obvios
3. Registrar observaciones crudas usando descriptores simples:
   - "muchos archivos pequeños" no "arquitectura de microservicios"
   - "directorios profundamente anidados" no "Java empresarial"
   - "un solo archivo grande" no "monolito"
4. Decodificar la impresión inicial en dos componentes:
   - **A** (actividad): ¿Esto está activo o dormido? ¿Creciendo o estable? ¿Simple o complejo?
   - **B** (sensación): ¿Esto se siente organizado o caótico? ¿Denso o disperso? ¿Familiar o ajeno?
5. Escribir las evaluaciones A y B — estos son tus primeros puntos de datos

**Esperado:** Un puñado de observaciones crudas de bajo nivel sobre las características superficiales del objetivo. Sin nombres, sin etiquetas, sin patrones arquitectónicos — solo formas, tamaños y texturas.

**En caso de fallo:** Si inmediatamente categorizas el proyecto ("oh, esto es una app de Next.js"), declararlo como AOL (Paso 6), extraer los descriptores crudos debajo de la etiqueta ("archivos JavaScript, directorio pages anidado, package.json presente"), y continuar con esas observaciones crudas.

### Paso 3: Impresiones Sensoriales — Datos Crudos (Etapa II)

Recopilar sistemáticamente datos crudos sobre el objetivo sin interpretación.

```
Stage II Data Channels for Codebase Investigation:
┌──────────────────┬────────────────────────────────────────────────────┐
│ Channel          │ What to Observe                                    │
├──────────────────┼────────────────────────────────────────────────────┤
│ File patterns    │ Extensions, naming conventions, file sizes         │
│                  │ (NOT frameworks — just patterns)                   │
├──────────────────┼────────────────────────────────────────────────────┤
│ Directory shape  │ Depth, breadth, nesting patterns, symmetry         │
├──────────────────┼────────────────────────────────────────────────────┤
│ Configuration    │ What config files exist? How many? What formats?   │
├──────────────────┼────────────────────────────────────────────────────┤
│ Dependencies     │ Lock files present? How large? How many entries?   │
├──────────────────┼────────────────────────────────────────────────────┤
│ Documentation    │ README present? How long? Other docs? Comments?    │
├──────────────────┼────────────────────────────────────────────────────┤
│ Test presence    │ Test directories? Test files? Ratio to source?     │
├──────────────────┼────────────────────────────────────────────────────┤
│ History signals  │ Presence of .git/, CHANGELOG/RELEASE_NOTES,        │
│                  │ lockfile timestamps (via Glob/Read if accessible)  │
├──────────────────┼────────────────────────────────────────────────────┤
│ Energy/activity  │ Which areas changed recently? Which are dormant?   │
└──────────────────┴────────────────────────────────────────────────────┘
```

1. Sondear cada canal usando operaciones de `Glob`, `Grep`, y `Read` ligeras
2. Registrar una observación por canal — primera impresión, no profundizar
3. Usar términos descriptivos, no etiquetas: "73 archivos .ts" no "proyecto TypeScript"
4. Marcar cualquier observación que se sienta particularmente significativa
5. Si un canal no produce nada notable, registrar "nada observado" y seguir
6. Apuntar a 10-20 puntos de datos a través de todos los canales

**Esperado:** Una lista de observaciones crudas que se sienten descubiertas en lugar de asumidas. Algunas serán significativas, otras ruido. Los datos deben ser descripciones de bajo nivel, no categorizaciones de alto nivel.

**En caso de fallo:** Si cada observación se convierte en una categorización, has caído en el análisis. Parar, volver al paso del ideograma, y reconectar con el objetivo con ojos frescos. Si un canal domina (todas observaciones de archivos, nada sobre historia), cambiar deliberadamente a canales infrautilizados.

### Paso 4: Datos Dimensionales — Estructura (Etapa III)

Pasar de observaciones crudas a comprensión espacial y estructural.

1. Comenzar a mapear la arquitectura del objetivo sin etiquetarla:
   - ¿Qué se conecta con qué? (importaciones, referencias, punteros de configuración)
   - ¿Cuáles son las "áreas" principales y cómo se relacionan?
   - ¿Cuál es la jerarquía — plana, anidada, o mixta?
2. Leer ligeramente algunos archivos clave — puntos de entrada, archivos de configuración, README
3. Anotar relaciones: "directorio A importa del directorio B," "archivo de configuración referencia rutas en C"
4. Bosquejar la disposición espacial: ¿cómo fluye la información a través del sistema?
5. Registrar Impacto Estético (AI) — ¿cómo se siente esta base de código? ¿Bien mantenida? ¿Apresurada? ¿Experimental?

**Esperado:** Un mapa estructural aproximado con anotaciones de relaciones. El alcance general del objetivo (grande/pequeño, simple/complejo, monolítico/modular) se vuelve más claro. La "sensación" de la base de código está capturada.

**En caso de fallo:** Si el mapa se siente como pura suposición, simplificar: anotar solo las conexiones que puedas verificar (declaraciones de importación reales, referencias de configuración reales). Si no emergen patrones estructurales, volver a la Etapa II y recopilar más datos crudos — la comprensión dimensional requiere una base de observaciones.

### Paso 5: Interrogación — Preguntas Dirigidas (Etapa V)

En el CRV clásico, la Etapa IV se enfoca en estructura analítica más profunda; para investigación de base de código, ese trabajo se integra intencionalmente en las etapas dimensionales/estructurales anteriores, por lo que este protocolo adaptado procede a la Etapa V para preguntas dirigidas.

Ahora, y solo ahora, traer preguntas específicas a la investigación.

1. Plantear cada pregunta explícitamente: "¿Cuál es el punto de entrada?" "¿De dónde vienen los datos?" "¿Cómo se ve la cobertura de pruebas?"
2. Para cada pregunta, buscar la respuesta usando `Grep` y `Read` — dirigido, no exploratorio
3. Registrar el primer hallazgo para cada pregunta
4. Anotar nivel de confianza: alto (evidencia directa), medio (inferido), bajo (incierto)
5. Marcar claramente todos los datos de Etapa V — conllevan mayor riesgo de AOL porque las preguntas predisponen expectativas

**Esperado:** Respuestas específicas a preguntas dirigidas, fundamentadas en los datos crudos y estructurales ya recopilados. Los niveles de confianza son honestos.

**En caso de fallo:** Si las preguntas dirigidas producen solo AOL (estás respondiendo desde suposiciones en lugar de evidencia), volver a etapas anteriores. El protocolo CRV es secuencial por una razón — saltar las etapas de observación y ir directamente a preguntas produce respuestas poco confiables.

### Paso 6: Gestionar la Superposición Analítica (AOL)

El AOL es la fuente principal de error en la investigación. Ocurre cuando la mente analítica etiqueta prematuramente el objetivo. Gestionarlo durante toda la sesión.

```
AOL Types in Codebase Investigation:
┌──────────────────┬─────────────────────────────────────────────────┐
│ Type             │ Description and Response                        │
├──────────────────┼─────────────────────────────────────────────────┤
│ AOL (labeling)   │ "This is a Django app" — Declare: "AOL: Django"│
│                  │ Extract raw descriptors: "Python files, urls.py,│
│                  │ migrations directory, settings module."         │
├──────────────────┼─────────────────────────────────────────────────┤
│ AOL Drive        │ The label becomes insistent: "This HAS to be   │
│                  │ Django." Declare "AOL Drive" and pause. What    │
│                  │ evidence contradicts the label? Look for it.    │
├──────────────────┼─────────────────────────────────────────────────┤
│ AOL Signal       │ The label may contain valid information. After  │
│                  │ declaring, extract: "Django" → "URL routing,    │
│                  │ ORM pattern, middleware chain." These raw        │
│                  │ descriptors are valid data even if "Django" is  │
│                  │ wrong.                                          │
├──────────────────┼─────────────────────────────────────────────────┤
│ AOL Peacocking   │ An elaborate narrative: "This was built by a    │
│                  │ team that was migrating from Java and..." This  │
│                  │ is imagination, not signal. Declare "AOL/P" and │
│                  │ return to raw observation.                      │
└──────────────────┴─────────────────────────────────────────────────┘
```

La disciplina no es evitar el AOL — es reconocerlo y declararlo para que no contamine la investigación. Toda investigación produce AOL. La habilidad está en qué tan rápido lo detectas.

**Esperado:** El AOL se reconoce a los momentos de surgir, se declara explícitamente, y la investigación continúa con descriptores crudos en lugar de etiquetas.

**En caso de fallo:** Si el AOL ha tomado control (te das cuenta de que has estado razonando desde una etiqueta por varios pasos), declarar una "Pausa de AOL." Volver a la Etapa II y recopilar nuevas observaciones crudas que prueben la etiqueta. Una investigación fuertemente contaminada debe anotarse como tal en la revisión.

### Paso 7: Cerrar y Revisar

Terminar la investigación formalmente y sintetizar hallazgos.

1. Revisar todos los datos recopilados en orden: primeras impresiones, observaciones crudas, datos estructurales, respuestas dirigidas, declaraciones de AOL
2. Identificar las 5-10 observaciones con mayor confianza
3. Ahora — y solo ahora — formar una síntesis: ¿qué es este sistema? ¿cómo funciona? ¿cuáles son sus características clave?
4. Anotar qué partes de la síntesis están bien respaldadas por evidencia y cuáles son inferidas
5. Comparar la síntesis con las preconcepciones declaradas en el Paso 1 — ¿cuáles se confirmaron? ¿cuáles estaban equivocadas?
6. Documentar los hallazgos para el usuario o para tu propia referencia futura

**Esperado:** Una comprensión fundamentada del objetivo construida a partir de observaciones crudas en lugar de asumida por coincidencia de patrones. La síntesis es más precisa de lo que habría sido una categorización rápida, y los niveles de confianza son honestos.

**En caso de fallo:** Si la síntesis se siente delgada, las etapas anteriores pueden no haber recopilado suficientes datos. Pero no descartar hallazgos parciales — una descripción de "73 archivos TypeScript, estructura de componentes profundamente anidada, historial git activo, cobertura de pruebas delgada" es más útil que una etiqueta incorrecta. La descripción precisa es la meta, no la identificación.

## Validación

- [ ] Las preconcepciones se declararon antes de que comenzara la recopilación de datos
- [ ] Las observaciones de Etapa I fueron descriptores crudos, no etiquetas
- [ ] Los datos de Etapa II se recopilaron a través de múltiples canales, no solo uno
- [ ] Todo el AOL se declaró en el momento de reconocimiento
- [ ] Las etapas progresaron secuencialmente (I → II → III → V), sin saltar a conclusiones
- [ ] El objetivo se abordó a ciegas — no se leyeron archivos basándose en suposiciones sobre lo que deberían contener
- [ ] La síntesis distingue hallazgos respaldados por evidencia de inferencias
- [ ] El registro de investigación está preservado para referencia futura

## Errores Comunes

- **Saltar a la identificación**: Buscar "¿qué framework es este?" antes de recopilar observaciones crudas garantiza contaminación por AOL
- **Suprimir etiquetas**: Intentar no formar hipótesis crea tensión — en su lugar, declararlas y extraer la señal cruda debajo
- **Omitir el enfriamiento**: Comenzar la investigación estando apegado a una hipótesis sesga todas las observaciones subsiguientes
- **Búsqueda solo de confirmación**: Una vez que una hipótesis se forma, buscar solo evidencia que la confirme mientras se ignoran las contradicciones
- **Confundir velocidad con habilidad**: La identificación rápida se siente productiva pero frecuentemente es incorrecta. La observación por etapas exhaustiva toma más tiempo pero produce comprensión más precisa
- **Diversidad insuficiente de canales**: Investigar solo a través de un lente (solo leer código, solo verificar estructura) pierde señales visibles a través de otros canales

## Habilidades Relacionadas

- `remote-viewing-guidance` — la variante de guía humana donde la IA actúa como monitor/asignador de CRV
- `meditate` — la quietud mental y la limpieza de suposiciones desarrolladas en meditación mejoran directamente la calidad de investigación
- `heal` — cuando la investigación revela los propios sesgos de razonamiento de la IA, la auto-sanación aborda la causa raíz
