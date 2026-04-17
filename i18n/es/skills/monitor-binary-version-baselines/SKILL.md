---
name: monitor-binary-version-baselines
description: >
  Establezca y mantenga líneas base longitudinales del contenido de binarios
  CLI a lo largo de las versiones. Cubre la selección de marcadores por
  categoría (API / identidad / configuración / telemetría / flag / función),
  puntuación ponderada, detección de presencia del sistema por umbral y
  registros de línea base por versión. Úselo al seguir el ciclo de vida de
  una función a lo largo de los lanzamientos, al sondear capacidades
  dark-launched o eliminadas, o al verificar que una herramienta de escaneo
  sigue detectando marcadores conocidos-buenos en binarios antiguos.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, baseline, binary-analysis, version-tracking, markers
  locale: es
  source_locale: en
  source_commit: b9570f58
  translator: claude-sonnet-4-6
  translation_date: "2026-04-17"
---

# Monitorizar Líneas Base de Versiones de Binarios

Construya y mantenga registros comparables, indexados por versión, de qué marcadores de sistema de función aparecen en un binario de arnés CLI, de modo que adiciones, eliminaciones y capacidades dark-launched puedan detectarse mecánicamente a lo largo de los lanzamientos.

## Cuándo usar

- Seguir el ciclo de vida de una función a lo largo de múltiples lanzamientos de un arnés CLI de código cerrado
- Sondear capacidades dark-launched (enviadas pero desactivadas) o las retiradas silenciosamente
- Verificar que un escáner de marcadores sigue detectando marcadores conocidos-buenos en binarios antiguos (regresión-test del propio escáner)
- Construir el sustrato de la Fase 1 que las fases posteriores (descubrimiento de flags, detección de dark-launch, captura de tráfico) consumen
- Cualquier contexto donde un `grep` ad-hoc responde "¿está X presente hoy?" pero en realidad se necesita "cómo se ha movido el sistema compuesto por X, Y, Z a lo largo de las versiones"

## Entradas

- **Requerido**: Una o más versiones instaladas del mismo arnés CLI (o bundles extraídos)
- **Requerido**: Un archivo de catálogo de trabajo para las definiciones de marcadores (creado en la primera ejecución, ampliado a lo largo de las versiones)
- **Opcional**: Un archivo de línea base grabado previamente en ejecuciones anteriores (ampliado in situ, nunca reescrito)
- **Opcional**: Una lista de versiones conocidas como nunca-publicadas (lanzamientos saltados, builds retiradas)
- **Opcional**: Una lista de sistemas-de-función ya bajo seguimiento, para ampliar en lugar de redescubrir

## Procedimiento

### Paso 1: Seleccione marcadores por categoría

Elija cadenas que sobrevivan a las reconstrucciones. Escoja identificadores estables y semánticamente significativos — no nombres minificados que el empaquetador renombrará en el próximo lanzamiento.

Seis categorías recomendadas:

- **API** — rutas de endpoint, nombres de método expuestos en la superficie de red del arnés
- **Identidad** — nombres internos de producto, nombres en clave, centinelas de versión
- **Configuración** — claves reconocidas en los archivos de configuración del usuario
- **Telemetría** — nombres de evento emitidos al pipeline de analítica
- **Flag** — claves de feature-gate consumidas por predicados de gate
- **Función** — constantes de cadena conocidas usadas dentro de manejadores específicos (mensajes de error, etiquetas de log)

Evite: identificadores cortos que parezcan minificados (p. ej., `_a1`, `bX`, nombres de dos letras seguidos de dígitos), literales en línea que cambiarían con cualquier revisión de texto, cualquier cosa que coincida con la convención de nombrado interno del propio empaquetador.

**Expected:** Cada marcador candidato tiene una etiqueta de categoría y una breve justificación ("aparece en documentos de cara al usuario", "estable durante N lanzamientos previos", etc.). Una primera pasada típica arroja 20-50 marcadores por sistema.

**On failure:** Si los marcadores desaparecen entre versiones menores consecutivas, el catálogo ha capturado cadenas volátiles a la reconstrucción en lugar de identificadores estables. Descarte esas entradas; amplíe a subcadenas más largas y semánticamente más ancladas.

### Paso 2: Agrupe marcadores por sistema-de-función

Agrupe los marcadores en una **tabla de sistema** por cada capacidad que evoluciona de forma independiente. Un "sistema" es un conjunto coherente de marcadores cuya presencia/ausencia se mueve junta porque comparten el ciclo de vida de una función (p. ej., todos los marcadores pertenecientes a una hipotética capacidad `acme_widget_v3`).

Por qué importa la agrupación: la puntuación por sistema evita la contaminación cruzada. La ausencia de los marcadores de un sistema no debe suprimir la detección de otro, y los recuentos agregados entre sistemas no relacionados no son informativos.

Forma de un catálogo de trabajo (pseudocódigo):

```
catalog:
  acme_widget_v3:
    markers:
      - { id: "acme_widget_v3_init",         category: function, weight: 10 }
      - { id: "acme.widget.v3.dialog.open",  category: telemetry, weight: 5 }
      - { id: "ACME_WIDGET_V3_DISABLE",      category: flag,     weight: 10 }
  acme_other_system:
    markers:
      - ...
```

**Expected:** Cada sistema tiene su propia lista de marcadores; ningún marcador aparece en dos sistemas. Añadir un nuevo sistema significa añadir una nueva entrada de primer nivel — nunca mover marcadores entre sistemas retroactivamente.

**On failure:** Si los marcadores son difíciles de asignar a un sistema (solapamiento, ambigüedad), las definiciones de sistema son demasiado burdas. Divida el sistema, o acepte que algunos marcadores son "sustrato compartido" y excluyalos de la puntuación por sistema.

### Paso 3: Pondere los marcadores por fuerza de señal

Asigne a cada marcador un peso que refleje cuánto confirma por sí solo su presencia el sistema:

- **10 = diagnóstico por sí solo** — lo bastante único como para que encontrar este marcador, por sí solo, baste para confirmar que el sistema está presente (p. ej., una cadena larga y específica del sistema que ninguna otra ruta de código emitiría)
- **3-5 = solo corroborante** — demasiado genérico para confirmar por sí solo, pero contribuye a una puntuación agregada (p. ej., un sufijo corto de telemetría que el arnés reutiliza entre funciones)

Enseñe la convención, no los números específicos. La separación entre "diagnóstico" y "corroborante" importa más que los enteros exactos elegidos — lo que cuenta es que los umbrales del paso 5 puedan distinguir "una señal fuerte" de "muchas señales débiles".

**Expected:** Cada marcador tiene un peso. La distribución de pesos del catálogo se inclina hacia marcadores corroborantes (3-5), con un pequeño número de marcadores diagnósticos-por-sí-solos (10) por sistema.

**On failure:** Si cada marcador está ponderado a 10, la puntuación pierde resolución — los hallazgos de presencia parcial se vuelven imposibles. Degrade marcadores que reaparezcan en múltiples sistemas o aparezcan en manejadores no relacionados.

### Paso 4: Registre líneas base por versión

Para cada versión escaneada, registre tanto los marcadores **presentes** como los **ausentes**, indexados por versión. Ambos son evidencia: un marcador ausente en la versión N es tan informativo como uno presente cuando la versión N+1 lo reintroduce.

Forma de la línea base:

```
baselines:
  "1.4.0":
    acme_widget_v3:
      present: ["acme_widget_v3_init", "ACME_WIDGET_V3_DISABLE"]
      absent:  ["acme.widget.v3.dialog.open"]
      score:   20
  "1.5.0":
    acme_widget_v3:
      present: ["acme_widget_v3_init", "ACME_WIDGET_V3_DISABLE", "acme.widget.v3.dialog.open"]
      absent:  []
      score:   25
  "1.4.1":
    _annotation: "never-published; skipped from upstream release timeline"
```

Las versiones nunca-publicadas reciben una anotación explícita en lugar de una omisión silenciosa. Las versiones silenciosamente saltadas parecen pérdida de datos al siguiente lector.

**Expected:** Cada versión produce un registro por sistema seguido, con `present`, `absent` y `score` poblados, o una `_annotation` explícita si nunca-publicada.

**On failure:** Si un escaneo de línea base arroja cero marcadores para un sistema que antes estaba presente, no asuma eliminación hasta confirmar que la ruta del binario era correcta, que el comando strings produjo salida, y que los IDs de marcador coinciden con el catálogo exactamente. Los ceros falsos corrompen el registro longitudinal.

### Paso 5: Establezca umbrales para detección completa y parcial

Defina dos compuertas por sistema, aplicadas a la puntuación agregada:

- **`full`** — puntuación por encima de la cual el sistema se considera presente-y-activo en esta versión
- **`partial`** — puntuación por encima de la cual el sistema se considera enviado-pero-incompleto (algunos marcadores presentes, pero por debajo del umbral `full`)

Por debajo de `partial` = ausente (o aún-no-presente, según la dirección del viaje).

```
thresholds:
  acme_widget_v3:
    full:    25
    partial: 10
```

Elección de umbrales: fije `full` a la suma de pesos que esperaría emitir una instalación sana; fije `partial` a un marcador diagnóstico más una señal corroborante. Reajuste cuando tenga evidencia de varias versiones.

**Expected:** Cada escaneo produce un hallazgo etiquetado por sistema: `full | partial | absent`. Los hallazgos con `partial` merecen investigación — son los candidatos a dark-launch y a eliminación.

**On failure:** Si cada sistema reporta `partial` en cada versión, los umbrales son demasiado sensibles (probablemente fijados más altos de lo que los marcadores puedan sumar). Recalibre contra una versión conocida-buena donde el sistema esté verificablemente en vivo.

### Paso 6: Escanee con `strings -n 8`

Use `strings` con un filtro de longitud mínima como primitiva de extracción. El piso `-n 8` filtra la mayor parte del ruido (fragmentos cortos, padding, basura de tabla de direcciones) sin perder identificadores significativos, que casi siempre tienen más de 8 caracteres.

```bash
strings -n 8 path/to/binary > /tmp/binary-strings.txt
```

Luego ejecute la coincidencia del catálogo contra `/tmp/binary-strings.txt` (cualquier matcher orientado a líneas: `grep -F -f markers.txt`, `ripgrep`, o un script pequeño).

Matices:

- Mínimos más bajos (`-n 4`, `-n 6`) inundan la salida con basura binaria y ruido de símbolos minificados; la distinción diagnóstico-a-corroborante colapsa
- Mínimos más altos (`-n 12+`) pierden identificadores de flag cortos y claves de configuración
- Algunos empaquetadores comprimen o codifican cadenas; si `strings` devuelve una salida casi vacía, el binario puede requerir primero extracción del bundle (fuera del alcance de esta skill)

**Expected:** Una salida de línea por cadena de entre 1k-100k líneas, según el tamaño del binario. La inspección manual debería revelar identificadores reconocibles en las primeras 100 líneas.

**On failure:** Si la salida está vacía o es irreconocible, el binario probablemente está empaquetado, cifrado o enviado en un formato de bytecode que `strings` no puede leer. Detenga y resuelva en la capa de extracción; no registre una línea base a partir de un escaneo ilegible.

### Paso 7: Amplíe las líneas base hacia adelante sin reescribir registros pasados

Cuando se añade un nuevo sistema o marcador al catálogo, **solo las versiones futuras** se escanean para él. Los registros de versiones pasadas permanecen como se escribieron originalmente.

Por qué: las líneas base de versiones previas son evidencia empírica de lo que se escaneó en su momento, no un modelo actual de lo que la versión pasada contenía. Reescribirlas retroactivamente con marcadores recién descubiertos confunde "lo que sabemos ahora" con "lo que observamos entonces". Ambas son útiles; solo una debería vivir en el archivo de línea base.

Si un escaneo retroactivo es genuinamente necesario (p. ej., para probar si un nuevo marcador estaba presente en la versión N-3), regístrelo como un **addendum separado**:

```
addenda:
  "1.4.0":
    scan_date: "2026-04-15"
    catalog_revision: "v7"
    findings:
      acme_new_system:
        present: ["..."]
```

La entrada original `baselines["1.4.0"]` queda intacta. El lector puede ver tanto el registro original como el escaneo retroactivo posterior, con sus respectivas revisiones de catálogo.

**Expected:** El archivo de línea base crece monótonamente hacia adelante; los registros pasados son append-only con bloques opcionales de addendum. Las revisiones del catálogo están versionadas para que cada escaneo pueda vincularse al estado del catálogo que utilizó.

**On failure:** Si alguna vez siente el impulso de editar directamente la lista `present` de una versión pasada, deténgase. Añada un addendum en su lugar. Mutar registros pasados pierde la capacidad de detectar regresiones del escáner (el Paso 8 de cualquier pasada posterior de validación del escáner depende de que el registro histórico sea inmutable).

## Validación

- [ ] El catálogo tiene etiquetas de categoría explícitas en cada marcador (una de API / identidad / configuración / telemetría / flag / función)
- [ ] Cada marcador está asignado a exactamente un sistema; ningún marcador aparece en dos sistemas
- [ ] Los pesos cubren un rango real (algunos 10s, algunos 3-5); los pesos no son todos idénticos
- [ ] Cada versión escaneada tiene un registro con `present`, `absent` y `score` por sistema seguido
- [ ] Las versiones nunca-publicadas están explícitamente anotadas, no omitidas silenciosamente
- [ ] Cada sistema tiene umbrales `full` y `partial`; los hallazgos se etiquetan en consecuencia
- [ ] `strings -n 8` es la primitiva de extracción (o un equivalente documentado para binarios no-texto)
- [ ] Los registros de versiones pasadas no cambian con el último escaneo; los nuevos hallazgos viven en bloques de addendum si son retroactivos

## Errores comunes

- **Registrar hallazgos específicos como el catálogo.** El catálogo debe describir categorías y formas de marcadores, no enumerar literales vinculados a versiones. Catálogos llenos de entradas con forma de hallazgos se degradan rápido y son el mayor riesgo de fuga si se publican accidentalmente.
- **Capturar identificadores minificados.** Nombres como `_p3a` o `q9X` se renombran en cada reconstrucción. Aunque coincidan hoy, son ruido mañana. Quédese con identificadores semánticamente significativos.
- **Confundir eventos de telemetría con feature flags.** Comparten convenciones de nombrado en muchos arneses pero juegan roles distintos. Etiquételos por categoría (Paso 1) para que el análisis por categoría se mantenga limpio.
- **Saltar silenciosamente versiones nunca-publicadas.** Una brecha en la secuencia de versiones sin anotación parece un escaneo omitido. Anote explícitamente: `_annotation: "never-published"`.
- **Fijar umbrales antes de que exista cualquier dato de línea base.** El primer escaneo establece los totales empíricos de peso; ajuste los umbrales contra eso, no por adelantado.
- **Reescribir registros de versiones previas cuando crece el catálogo.** Los registros pasados son evidencia; los addendums son el patrón soportado para escaneos retroactivos.
- **Confiar en salidas de escaneo vacías.** Cero marcadores encontrados no siempre significa "ausente". Confirme que el binario es legible y que los IDs del catálogo coinciden exactamente antes de declarar eliminación.
- **Tratar `strings -n 4` como más exhaustivo que `-n 8`.** Los mínimos más bajos añaden ruido más rápido que señal. Los marcadores diagnósticos tienen prácticamente siempre 8 o más caracteres.

## Skills relacionadas

- `security-audit-codebase` — disciplina compartida; ambos pipelines tratan la presencia de marcadores como un hallazgo, con distintos consumidores aguas abajo
- `audit-dependency-versions` — extiende el mismo rigor de seguimiento de versiones a los manifiestos de dependencias externas; esta skill lo aplica a artefactos binarios
- `probe-feature-flag-state` — seguimiento de Fase 2-3; consume líneas base para clasificar el estado de despliegue del flag (vivo / opt-in / dark / eliminado)
- `conduct-empirical-wire-capture` — seguimiento de Fase 4; valida el comportamiento inferido contra el tráfico real del arnés
- `redact-for-public-disclosure` — seguimiento de Fase 5; rige qué hallazgos pueden salir del espacio de trabajo privado
