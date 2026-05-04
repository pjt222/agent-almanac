---
name: decode-minified-js-gates
description: >
  Clasificar variantes de llamadas a gates en un bundle minificado de
  JavaScript. Cubre extracción de ventana de contexto alrededor de la
  ocurrencia de un flag, identificación de 4–6 variantes de lectora (booleano
  síncrono, objeto de configuración síncrono, TTL consciente del bootstrap,
  truthy-only, bootstrap asíncrono, bridge asíncrono), extracción de valor
  por defecto (boolean / null / numérico / literal de objeto de configuración),
  detección de conjunciones a través de predicados `&&`, detección de
  inversión de kill-switch y producción de un registro de mecánica de gate
  que alimenta probe-feature-flag-state. Úsalo cuando el comportamiento de
  un flag no pueda inferirse solo de su nombre, cuando el binario use
  múltiples bibliotecas lectoras, o cuando los gates con objeto de
  configuración lleven esquemas estructurados distintos de los gates
  booleanos.
license: MIT
allowed-tools: Read Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, minified-js, gate-decoding, classification
  locale: es
  source_locale: en
  source_commit: 90b159ab
  translator: "Claude + human review"
  translation_date: "2026-05-04"
---

# Decode Minified JS Gates

Lee el contexto del sitio de llamada alrededor de una cadena de flag en un bundle minificado de JavaScript y produce un registro de mecánica de gate: qué variante de lectora, qué valor por defecto, qué conjunción, qué rol. Mientras que `probe-feature-flag-state` responde "¿está este gate activado o desactivado?", esta habilidad responde la pregunta previa — "¿qué hace realmente este gate?"

## Cuándo Usar

- Un flag surgido por `sweep-flag-namespace` no puede clasificarse solo a partir de su nombre.
- El binario usa más de una función lectora de gates y necesitas saber a cuál invoca un flag.
- El "valor por defecto" de un gate aparece como no booleano (`{}`, `null`, un literal numérico) y necesitas decodificar la variante real de lectora.
- Sospechas de un kill-switch (gate invertido) pero no puedes confirmarlo a partir del nombre del flag.
- Un predicado combina múltiples gates con `&&` y necesitas enumerar los co-gates antes de sondear cualquiera de ellos.

## Entradas

- **Requerido**: un archivo de bundle minificado de JavaScript (`.js`, `.mjs`, `.bun`).
- **Requerido**: una cadena de flag objetivo a decodificar, en forma literal.
- **Opcional**: una lista de nombres conocidos de funciones lectoras de un pase previo de decodificación — acelera el Paso 2.
- **Opcional**: una sobreescritura del tamaño de la ventana de contexto; el valor por defecto es 300 caracteres antes y 200 caracteres después de la ocurrencia del flag.

## Procedimiento

### Paso 1: Extraer la Ventana de Contexto

Localiza la cadena del flag y captura una ventana asimétrica alrededor de cada ocurrencia. El pre-contexto (antes del flag) es donde vive el nombre de la función lectora; el post-contexto (después) es donde viven el valor por defecto y la conjunción.

```bash
BUNDLE=/path/to/cli/bundle.js
FLAG=acme_widget_v3                   # synthetic placeholder
PRE=300
POST=200

# All byte offsets where the flag string occurs
grep -boE "\"${FLAG}\"" "$BUNDLE" | cut -d: -f1 > /tmp/decode-offsets.txt
wc -l /tmp/decode-offsets.txt

# Capture an asymmetric window per occurrence
while read -r offset; do
  start=$((offset - PRE))
  [ "$start" -lt 0 ] && start=0
  length=$((PRE + POST))
  echo "=== offset $offset ==="
  dd if="$BUNDLE" bs=1 skip="$start" count="$length" 2>/dev/null
  echo
done < /tmp/decode-offsets.txt > /tmp/decode-windows.txt

less /tmp/decode-windows.txt
```

Para un primer pase rápido, `grep -oE` con lookbehind negativo vía regex compatible con Perl atrapa las mismas ventanas en un solo pipe.

**Esperado:** una o más ventanas de contexto por ocurrencia del flag, cada una de ~500 caracteres. Múltiples ocurrencias típicamente comparten la misma función lectora pero pueden diferir en el valor por defecto o la conjunción — inspecciona cada una de forma independiente.

**En caso de fallo:** si el bundle es demasiado grande para `dd`-por-ocurrencia (binario > 100MB o muchas ocurrencias), usa `rg -B 5 -A 3 "$FLAG" "$BUNDLE"` para una aproximación de salida estructurada. Si las ventanas se ven corruptas, el bundle puede estar en UTF-16 o tener delimitadores no ASCII; usa `iconv` o trátalo como binario.

### Paso 2: Identificar la Variante de Lectora

Las bibliotecas minificadas de gates típicamente exponen 4–6 variantes de lectora con semánticas distintas. El nombre de la función lectora es la primera pista; la firma de la llamada es el verificador.

La taxonomía de variantes (nombres sintéticos — sustitúyelos por los identificadores minificados reales de tu bundle):

| Variante | Forma sintética | Devuelve | Uso común |
|---|---|---|---|
| **Booleano síncrono** | `gate("flag", false)` o `gate("flag", true)` | `boolean` | Conmutadores estándar de funcionalidad on/off |
| **Objeto de configuración síncrono** | `fvReader("flag", {key: value})` | objeto JSON | Configuración estructurada (delays, allowlists, nombres de modelo) |
| **TTL consciente del bootstrap** | `ttlReader("flag", default, ttlMs)` | `boolean` (cacheado) | Gates de la ruta de arranque antes de que llegue la configuración remota |
| **Truthy-only** | `truthyReader("flag")` | truthy/falsy | Comprobaciones rápidas; sin valor por defecto explícito |
| **Bootstrap asíncrono** | `asyncReader("flag")` | `Promise<boolean>` | Gates resueltos tras el bootstrap |
| **Bridge asíncrono** | `bridgeReader("flag")` | `Promise<boolean>` | Gates de canal puente/relay con ruta de evaluación separada |

Empareja cada ventana de contexto contra los patrones de variante:

```bash
# Test for variant patterns. Replace the synthetic reader names with the
# actual minified identifiers found in the bundle.
grep -oE '\b(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"' /tmp/decode-windows.txt | sort | uniq -c
```

Si aparecen múltiples variantes para el mismo flag (raro pero real — un flag leído tanto sincrónicamente al inicio como asincrónicamente tras el bootstrap), registra la variante de cada ocurrencia por separado. Los resultados del sondeo pueden diferir.

**Esperado:** cada ocurrencia de gate-call queda etiquetada con una variante. Los conteos de variantes en todo el sweep producen una distribución a nivel de binario (p. ej., "60% booleano síncrono, 30% objeto de configuración, 10% TTL").

**En caso de fallo:** si una ventana de contexto no contiene un patrón de lectora reconocible, el flag puede que no sea realmente llamado como gate — vuelve a comprobar la clasificación del sitio de llamada del Paso 2 de `sweep-flag-namespace`. Si una ventana contiene un nombre de lectora que no está en esta taxonomía, documéntalo como una nueva variante en tus artefactos de investigación y decide si justifica una ruta de manejo separada.

### Paso 3: Extraer el Valor por Defecto

El valor por defecto es el segundo argumento posicional de la lectora (o ausente para variantes truthy-only / asíncronas). Captura el literal exacto — `false`, `true`, `null`, `0`, una cadena o un objeto JSON de configuración.

```bash
# Boolean default extraction (sync boolean and TTL variants)
grep -oE '\b(gate|ttlReader)\("acme_widget_v3",\s*(true|false)' /tmp/decode-windows.txt

# Config-object default — match the opening brace and capture until the
# matching brace at the same nesting depth. For minified bundles this is
# usually safe with a non-greedy match because objects rarely span lines.
grep -oE 'fvReader\("acme_widget_v3",\s*\{[^}]*\}' /tmp/decode-windows.txt

# Numeric default (rare but real for TTL or threshold gates)
grep -oE '\b(gate|ttlReader)\("acme_widget_v3",\s*[0-9]+' /tmp/decode-windows.txt
```

Para valores por defecto de objeto de configuración, inspecciona la estructura JSON — las claves a menudo dan pistas sobre el propósito del gate (p. ej., `{maxRetries: 3, timeoutMs: 5000}` es una configuración de política de reintentos, no un toggle de funcionalidad).

**Esperado:** un literal exacto por defecto por ocurrencia. Los booleanos son inequívocos; los objetos de configuración requieren una lectura manual de la estructura.

**En caso de fallo:** si la llave de cierre del objeto de configuración cae fuera de la ventana de contexto, aumenta el tamaño del post-contexto en el Paso 1. Si un valor por defecto parece ser una referencia a variable (p. ej., `gate("flag", x)`), el valor por defecto se calcula en tiempo de ejecución — anótalo como DYNAMIC y sondea el valor realmente devuelto vía `probe-feature-flag-state`.

### Paso 4: Detectar Conjunciones y Kill Switches

Muchos gates participan en predicados compuestos. Las conjunciones (`&&`) e inversiones (`!`) cambian el rol efectivo del gate.

```bash
# Conjunction detection: gate-call followed by `&&` and another gate-call
# within the same predicate window
grep -oE '(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"[^)]*\)\s*&&\s*(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_[a-zA-Z0-9_]+"' /tmp/decode-windows.txt

# Kill-switch detection: leading `!` before the gate-call
grep -oE '!\s*(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"' /tmp/decode-windows.txt
```

Para cada conjunción detectada, lista los nombres de los co-gates. Ahora son parte del alcance del sondeo — si la evaluación del flag objetivo depende de co-gates, sondear solo el objetivo produce un estado incompleto.

Para cada inversión detectada, marca el flag como un kill switch en el registro de mecánica de gate. Los kill switches invierten el significado del valor por defecto: un kill switch con `default=false` significa "funcionalidad activada por defecto" (porque `!false === true`), mientras que un gate normal con `default=false` significa "funcionalidad desactivada por defecto."

**Esperado:** una lista de conjunciones (posiblemente vacía) y una flag de inversión (booleana) por ocurrencia.

**En caso de fallo:** si una conjunción incluye más de 2 co-gates, el predicado es lo bastante complejo para que la regex pierda la estructura. Lee la ventana de contexto manualmente y documenta la forma del predicado verbatim en el registro de mecánica de gate.

### Paso 5: Clasificar el Rol del Gate

Sintetiza los Pasos 2–4 en una clasificación de rol. Los roles dirigen distintas estrategias de sondeo y distintos riesgos de integración.

| Rol | Firma | Implicación |
|---|---|---|
| **Conmutador de funcionalidad** | booleano síncrono, sin inversión, sin conjunción | On/off estándar; sondea directamente |
| **Proveedor de configuración** | objeto de configuración síncrono (`fvReader`) | Lee el objeto devuelto; default-vacío `{}` ≠ funcionalidad desactivada |
| **Guardia de ciclo de vida** | TTL consciente del bootstrap o bootstrap asíncrono | El estado depende del timing del bootstrap; sondea en múltiples puntos |
| **Kill switch** | gate invertido, default-false | Funcionalidad activada para los usuarios por defecto; el flag la invierte a OFF |
| **Miembro de conjunción** | cualquier variante con co-gate `&&` | No se puede evaluar solo; los co-gates son parte del alcance del sondeo |
| **Bridge gate** | variante de bridge asíncrono | El sondeo debe ocurrir sobre el canal del bridge, no sobre la ruta principal |

**Esperado:** cada ocurrencia de gate-call tiene exactamente un rol primario. Algunos flags aparecen en múltiples roles a través de ocurrencias (p. ej., un conmutador de funcionalidad en un sitio de llamada, un miembro de conjunción en otro) — registra cada rol de forma independiente.

**En caso de fallo:** si un rol no encaja en la tabla, el binario está usando una biblioteca de gates aún no documentada en esta habilidad. Añade una fila con identificadores sintéticos y aporta la variante de vuelta a la habilidad (o a una extensión específica del proyecto) para futuros investigadores.

### Paso 6: Producir el Registro de Mecánica de Gate

Combina los hallazgos por flag en un registro estructurado. JSONL es conveniente porque cada flag se convierte en una línea, fácil de fusionar con el inventario de `sweep-flag-namespace`.

```jsonl
{"flag":"acme_widget_v3","variant":"sync_boolean","default":false,"role":"feature_switch","conjunctions":[],"inverted":false,"occurrences":3}
{"flag":"acme_retry_policy","variant":"sync_config_object","default":{"maxRetries":3,"timeoutMs":5000},"role":"config_provider","conjunctions":[],"inverted":false,"occurrences":1}
{"flag":"acme_legacy_path","variant":"sync_boolean","default":false,"role":"kill_switch","conjunctions":[],"inverted":true,"occurrences":2}
{"flag":"acme_beta_feature","variant":"sync_boolean","default":false,"role":"conjunction_member","conjunctions":["acme_beta_program_active"],"inverted":false,"occurrences":1}
```

El registro de mecánica de gate alimenta el Paso 2 de `probe-feature-flag-state` (desambiguación gate-vs-event): la variante + el rol + la lista de conjunciones determinan qué observaciones cuentan como evidencia de estado LIVE / DARK / INDETERMINATE.

**Esperado:** un registro JSONL por flag (o por ocurrencia de flag si un único flag tiene múltiples mecánicas distintas). El registro es reproducible — ejecutar el procedimiento de nuevo contra el mismo binario produce el mismo registro.

**En caso de fallo:** si los registros varían entre ejecuciones, un paso aguas arriba es no determinista. La causa más común es la regex del Paso 1 omitiendo o sobre-emparejando ocurrencias. Bloquea las regex durante toda la duración de una campaña.

## Validación

- [ ] El Paso 1 produce una ventana de contexto por ocurrencia del flag; las ventanas son de ~500 caracteres
- [ ] El Paso 2 etiqueta cada ocurrencia con exactamente una variante de lectora de la taxonomía
- [ ] El Paso 3 captura el literal exacto del valor por defecto (booleano, objeto de configuración o DYNAMIC)
- [ ] El Paso 4 expone todas las conjunciones e inversiones de kill-switch presentes en las ventanas
- [ ] El Paso 5 asigna un rol por ocurrencia, extraído de la tabla de roles
- [ ] El Paso 6 produce un registro JSONL de mecánica de gate que diffea limpiamente entre re-ejecuciones
- [ ] Todos los ejemplos trabajados usan placeholders sintéticos (`acme_*`, `gate`, `fvReader`, etc.) — sin nombres reales de flag, nombres reales de lectora ni esquemas reales de objeto de configuración
- [ ] El registro es consumible por `probe-feature-flag-state` (mismos identificadores de flag, nombres de campo compatibles)

## Errores Comunes

- **Leer "default" como "comportamiento"**: un gate con `default=true` está activado por defecto *en este binario*, pero las sobreescrituras del lado del servidor pueden invertirlo. El valor por defecto te dice la línea base; el sondeo en tiempo de ejecución (`probe-feature-flag-state`) te dice el estado.
- **Confundir el default vacío de objeto de configuración con funcionalidad desactivada**: `fvReader("flag", {})` devuelve un objeto vacío como valor por defecto — pero el flag está *activado* (el gate evalúa a truthy). Tratar `{}` como "off" clasifica erróneamente proveedores de configuración como conmutadores de funcionalidad.
- **Pasar por alto kill switches**: un `!` inicial antes de la llamada al gate invierte el significado. Saltarse el Paso 4 produce un registro que dice "default=false, funcionalidad desactivada por defecto" cuando la verdad es "default=false, funcionalidad ACTIVADA por defecto debido a la inversión."
- **Sondear una mitad de una conjunción**: si `acme_widget_v3 && acme_user_in_cohort` es el predicado, sondear solo `acme_widget_v3` y encontrarlo LIVE no significa que la funcionalidad esté en vivo — la conjunción puede aún cerrarla a través del flag de cohorte.
- **Confiar en los nombres de lectora entre versiones**: los identificadores minificados pueden cambiar entre versiones mayores. La taxonomía del Paso 2 es por *firma* (forma de llamada, tipo de retorno, posición del default), no por nombre. Cuando cambia la versión del binario, vuelve a derivar los nombres de las lectoras desde un nuevo pase de decodificación.
- **Ventana demasiado estrecha**: una división 200/100 pasa por alto valores por defecto de objetos de configuración que abarcan 300+ caracteres. Valores por defecto de 300/200 o 400/300 son más seguros; ajusta a la baja solo si el bundle es enorme y el coste de la ventana importa.
- **Filtrar nombres reales de lectoras**: los nombres minificados de lectoras a veces parecen sin sentido (`a`, `b`, `Yc1`) y se sienten seguros para pegarlos verbatim. Aun así son hallazgos — sustitúyelos por placeholders sintéticos antes de publicar la metodología.

## Habilidades Relacionadas

- `probe-feature-flag-state` — usa el registro de mecánica de gate para interpretar observaciones en tiempo de ejecución
- `sweep-flag-namespace` — produce el conjunto de flags candidatos que esta habilidad decodifica
- `monitor-binary-version-baselines` — rastrea cambios de nombre de lectora a lo largo de versiones del binario; vuelve a derivar los patrones del Paso 2 cuando los baselines cambien
- `redact-for-public-disclosure` — cómo publicar la metodología de decodificación de gates sin exponer nombres reales de lectoras o esquemas
- `conduct-empirical-wire-capture` — valida el registro de mecánica de gate contra el comportamiento en tiempo de ejecución
