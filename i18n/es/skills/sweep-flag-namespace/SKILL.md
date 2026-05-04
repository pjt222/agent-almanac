---
name: sweep-flag-namespace
description: >
  Extraer en bloque cada flag candidato de un espacio de nombres de un binario,
  construir un inventario de extracción con conteos de ocurrencias y etiquetas
  de tipo de llamada, cruzar con un conjunto documentado y rastrear la
  completitud a lo largo de campañas de sondeo hasta que el remanente no
  documentado llegue a cero. Cubre la cosecha por prefijo de espacio de nombres,
  la desambiguación gate-vs-telemetría a nivel de sitio de llamada, métricas
  de completitud, reporte de la población DEFAULT-TRUE y un escaneo final de
  confirmación de completitud. Usar antes de probe-feature-flag-state cuando
  necesites un catálogo completo en vez de una muestra, o cuando una campaña
  previa basada en olas necesite una condición de fin verificable.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, completeness, sweep, inventory
  locale: es
  source_locale: en
  source_commit: 90b159ab
  translator: "Claude + human review"
  translation_date: "2026-05-04"
---

# Sweep Flag Namespace

Extraer exhaustivamente cada candidato a flag del espacio de nombres de un binario, separar las llamadas a gates de la telemetría y rastrear la completitud frente a un conjunto documentado en curso hasta que el remanente no documentado sea cero. Mientras que `probe-feature-flag-state` clasifica un flag a la vez, esta habilidad produce el catálogo sobre el que operan esos sondeos — y confirma cuándo el catálogo está completo.

## Cuándo Usar

- Una campaña de descubrimiento de flags está en curso y necesitas una condición de parada verificable en vez de adivinar si tienes "suficientes" flags.
- El espacio de nombres de flags de un binario es grande (cientos de cadenas candidatas) y un enfoque basado en muestreo arriesga perder gates significativos.
- Necesitas reportar los flags DEFAULT-TRUE por separado de los DEFAULT-FALSE — típicamente el subconjunto de mayor señal de cualquier espacio de nombres.
- Estás ejecutando documentación multi-ola contra un binario y quieres dejar por escrito la métrica de completitud de cada ola.
- Sospechas que una campaña previa terminó prematuramente y necesitas confirmar o refutar eso con un nuevo sweep.

## Entradas

- **Requerido**: el binario o archivo de bundle que puedes leer.
- **Requerido**: un prefijo de espacio de nombres (ejemplo sintético: `acme_*`) que identifique los flags pertenecientes al sistema bajo estudio.
- **Requerido**: un conjunto de documentación en curso — la lista actual de redacciones de flags que tu campaña ha producido hasta ahora.
- **Opcional**: nombres de funciones lectoras de gates (sintéticos: `gate(...)`, `flag(...)`, `isEnabled(...)`) — precomputarlos acelera el Paso 2.
- **Opcional**: nombres de funciones de telemetría/emisión — misma razón, signo opuesto.
- **Opcional**: salida de un sweep previo de este binario en una versión anterior, para análisis de delta.

## Procedimiento

### Paso 1: Cosechar Todas las Cadenas que Coincidan con el Prefijo del Espacio de Nombres

Extrae cada literal en el binario que coincida con el prefijo del espacio de nombres, sin importar el rol del sitio de llamada. El objetivo en este paso es la *cobertura*, no la clasificación.

```bash
BUNDLE=/path/to/cli/bundle.js
PREFIX=acme_                       # synthetic placeholder

# Pull every quoted string starting with the prefix
grep -oE "\"${PREFIX}[a-zA-Z0-9_]+\"" "$BUNDLE" | sort -u > /tmp/sweep-candidates.txt
wc -l /tmp/sweep-candidates.txt    # unique candidate count

# Per-string occurrence count (gives a first hint at gate-call density)
grep -oE "\"${PREFIX}[a-zA-Z0-9_]+\"" "$BUNDLE" | sort | uniq -c | sort -rn > /tmp/sweep-occurrences.txt
head /tmp/sweep-occurrences.txt
```

**Esperado:** una lista de candidatos deduplicada y un archivo de ocurrencias ordenado por frecuencia. Conteos muy altos (≥10) sugieren cadenas con uso intensivo de gates; las cadenas de una sola ocurrencia tienden a ser nombres de eventos de telemetría o etiquetas estáticas.

**En caso de fallo:** si el conteo único es 0, el prefijo es incorrecto (errata, desajuste de límite del espacio de nombres, el harness usa una convención distinta a la esperada). Si el conteo supera ~5000, el prefijo es demasiado amplio — acótalo antes de continuar o el inventario se volverá inmanejable.

### Paso 2: Desambiguar Llamadas a Gates de Telemetría y de Etiquetas Estáticas

Misma cadena, distintos roles. Distinguir roles en el sitio de llamada es lo que hace que el inventario sea accionable. Reutiliza la disciplina de desambiguación del Paso 2 de `probe-feature-flag-state`.

Para cada candidato, clasifica cada ocurrencia:

- **gate-call** — la cadena es el primer argumento de una función lectora de gates (`gate("$FLAG", default)`, `flag("$FLAG", ...)`, `isEnabled("$FLAG")`, etc.).
- **telemetry-call** — la cadena es el primer argumento de una función emit/log/track.
- **env-var-check** — la cadena aparece en una búsqueda `process.env.X` o equivalente.
- **static-label** — la cadena aparece en un registro, mapa o comentario sin enganche conductual.

```bash
# Count gate-call occurrences for the candidate set, using a synthetic
# reader-name pattern. Adapt the regex to the actual reader names found.
GATE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_'
grep -coE "$GATE_PATTERN" "$BUNDLE"

# Per-flag gate-call count
while read -r flag; do
  flag_no_quotes="${flag//\"/}"
  count=$(grep -coE "(gate|flag|isEnabled)\(\s*\"${flag_no_quotes}\"" "$BUNDLE")
  echo -e "${flag_no_quotes}\t${count}"
done < /tmp/sweep-candidates.txt > /tmp/sweep-gate-counts.tsv
```

**Esperado:** un registro de inventario por cadena única con la forma `{flag, total_occurrences, gate_call_count, telemetry_count, static_label_count, env_var_count}`. El conteo de gate-call es la columna accionable; el resto son filtros de ruido.

**En caso de fallo:** si todos los candidatos tienen cero aciertos de gate-call, el patrón de la lectora de gates es incorrecto. O bien el binario usa una función lectora que esta regex pasa por alto, o el espacio de nombres es puramente de telemetría (no es un espacio de nombres de flags en absoluto). Ejecuta `decode-minified-js-gates` contra unos pocos candidatos para aprender los nombres reales de las lectoras antes de volver a ejecutar este paso.

### Paso 3: Construir el Inventario de Extracción

Consolida los registros por cadena en un único artefacto de inventario. CSV o JSONL — elige uno y mantenlo para poder hacer diff entre olas.

```bash
# JSONL inventory
{
  while IFS=$'\t' read -r flag gate_count; do
    [ "$gate_count" -gt 0 ] || continue   # skip strings with no gate-call evidence
    total=$(grep -c "\"${flag}\"" "$BUNDLE")
    telem=$((total - gate_count))         # rough; refine if other call types matter
    printf '{"flag":"%s","total":%d,"gate_calls":%d,"telemetry":%d,"documented":false}\n' \
      "$flag" "$total" "$gate_count" "$telem"
  done < /tmp/sweep-gate-counts.tsv
} > /tmp/sweep-inventory.jsonl

wc -l /tmp/sweep-inventory.jsonl    # gate-bearing flag count
```

Importan dos conteos derivados:

- **`total_unique`**: cada cadena que el prefijo emparejó (antes del filtrado de gates)
- **`gate_calls`**: subconjunto que tiene al menos una ocurrencia de gate-call — este es el conjunto de trabajo de la campaña

**Esperado:** un archivo de inventario con un registro por flag único portador de gate. El conteo de gates es típicamente una fracción de `total_unique` (comúnmente 5–20%), por lo que ambos números deben diferir notablemente.

**En caso de fallo:** si el inventario está vacío o `gate_calls` ≈ `total_unique`, la desambiguación gate-vs-telemetría del Paso 2 está produciendo divisiones sin sentido. Revisa la regex de nombre de lectora.

### Paso 4: Cruzar con el Conjunto Documentado

La métrica de completitud depende de un conjunto documentado — los flags que tu campaña ya ha redactado en artefactos de investigación. Cruza, y luego reporta lo que queda.

```bash
DOCUMENTED=/path/to/research/documented-flags.txt   # one flag name per line

# Extract gate-bearing flag names from the inventory
jq -r '.flag' /tmp/sweep-inventory.jsonl | sort -u > /tmp/sweep-extracted.txt

# Compute the documented and remaining sets
sort -u "$DOCUMENTED" > /tmp/sweep-documented.txt
comm -23 /tmp/sweep-extracted.txt /tmp/sweep-documented.txt > /tmp/sweep-remaining.txt

echo "Extracted (gate-bearing):  $(wc -l < /tmp/sweep-extracted.txt)"
echo "Documented:                $(wc -l < /tmp/sweep-documented.txt)"
echo "Remaining (undocumented):  $(wc -l < /tmp/sweep-remaining.txt)"
```

La métrica de completitud es `remaining` — cuando llega a 0, el conjunto documentado cubre cada flag portador de gate del espacio de nombres.

**Esperado:** tres conteos. Al inicio de una campaña, `remaining` debería ser una fracción sustancial de `extracted`. Cada ola reduce `remaining` hasta converger a 0. Rastrea la trayectoria a lo largo de las olas para detectar mesetas (una ola estancada que sigue reinvestigando flags ya documentados).

**En caso de fallo:** si `documented` excede a `extracted`, el conjunto documentado contiene entradas obsoletas (flags eliminados en esta versión del binario). Calcula `comm -13` en su lugar para sacar a la luz los nombres documentados obsoletos; archívalos como REMOVED en el siguiente artefacto de campaña.

### Paso 5: Reportar la Población DEFAULT-TRUE

Dentro del conjunto de flags portadores de gate, separa los flags cuyo valor por defecto en el binario es `true` de aquellos cuyo valor por defecto es `false` (o no booleano). Los flags DEFAULT-TRUE están activados para todos los usuarios sin sobreescritura del lado del servidor, lo que los convierte en el subconjunto de mayor señal.

```bash
# Heuristic: gate-call shape `gate("flag_name", true)` indicates DEFAULT-TRUE
DEFAULT_TRUE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_[a-zA-Z0-9_]+",\s*!?true\b'
grep -oE "$DEFAULT_TRUE_PATTERN" "$BUNDLE" | grep -oE '"acme_[a-zA-Z0-9_]+"' | sort -u > /tmp/sweep-default-true.txt

DEFAULT_FALSE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_[a-zA-Z0-9_]+",\s*false\b'
grep -oE "$DEFAULT_FALSE_PATTERN" "$BUNDLE" | grep -oE '"acme_[a-zA-Z0-9_]+"' | sort -u > /tmp/sweep-default-false.txt

echo "DEFAULT-TRUE:  $(wc -l < /tmp/sweep-default-true.txt)"
echo "DEFAULT-FALSE: $(wc -l < /tmp/sweep-default-false.txt)"
```

Para flags con valores por defecto no booleanos (objetos de configuración, lectoras TTL, lectoras asíncronas), usa `decode-minified-js-gates` para clasificar la variante de lectora — producen una forma de default distinta y deben reportarse en su propio bucket.

**Esperado:** una división típica es 10–20% DEFAULT-TRUE, 80–90% DEFAULT-FALSE. Un binario en los extremos (90%+ TRUE o 90%+ FALSE) es inusual y vale la pena investigarlo — puede indicar una convención de la fase de release (todo activado por defecto para pruebas, todo desactivado por defecto para un rollout escalonado).

**En caso de fallo:** si los conteos de DEFAULT-TRUE y DEFAULT-FALSE juntos no cubren el inventario portador de gate, el remanente usa lectoras no booleanas. Ejecuta `decode-minified-js-gates` contra el hueco para clasificar las variantes de lectora en uso.

### Paso 6: Confirmar la Completitud

Cuando `remaining = 0` desde el Paso 4, ejecuta un escaneo final: busca ocurrencias de gate-call de cadenas que coincidan con el espacio de nombres y que NO estén en el conjunto documentado. Esto atrapa cualquier flag que haya sido omitido por la cosecha del Paso 1 (p. ej., concatenación de cadenas que oculta el literal de un grep simple).

```bash
# Search for gate-call shapes containing the namespace prefix, not constrained
# to literal-string occurrences. Loosens Step 1's grep to catch dynamic forms.
DYNAMIC_PATTERN='(gate|flag|isEnabled)\(\s*[^"]*"acme_'
grep -nE "$DYNAMIC_PATTERN" "$BUNDLE" | head -50

# Alternative: ripgrep with multiline for split-string concatenation
rg -U "(gate|flag|isEnabled)\(\s*\"acme_(\\\\\"|[a-zA-Z0-9_])+\"" "$BUNDLE"
```

Compara los aciertos de gate-call contra `/tmp/sweep-documented.txt`. Si algún acierto referencia un flag que no esté en el conjunto documentado, regresa al Paso 1 con una extracción refinada (p. ej., manejando el caso de construcción dinámica). Si está vacío: la campaña está completa.

**Esperado:** el escaneo final devuelve o bien un resultado vacío (campaña completa) o un pequeño remanente (típicamente <5 flags, normalmente exponiendo construcciones dinámicas o lectoras alternas).

**En caso de fallo:** si el escaneo final devuelve un remanente grande cuando el Paso 4 dijo `remaining = 0`, el Paso 1 ha extraído sistemáticamente por debajo. Investiga los patrones omitidos (cadenas dinámicas, caracteres de comilla alternativos, funciones lectoras alternas) y vuelve a ejecutar desde el Paso 1 con una regex más estricta.

## Validación

- [ ] El conteo único del Paso 1 es distinto de cero y dentro de un orden de magnitud de la expectativa
- [ ] El Paso 2 produce una división gate-vs-telemetría significativa (el conteo de gate-call es una fracción, no todo o nada, del total de ocurrencias)
- [ ] El inventario del Paso 3 es un registro por flag portador de gate, en CSV o JSONL
- [ ] El Paso 4 reporta `total_unique`, `gate_calls`, `documented`, `remaining` — y la métrica llega a 0 al final de la campaña
- [ ] El Paso 5 reporta DEFAULT-TRUE y DEFAULT-FALSE por separado
- [ ] El escaneo final del Paso 6 devuelve vacío antes de declarar la campaña completa
- [ ] Todos los ejemplos trabajados usan placeholders sintéticos (`acme_*`, `gate(...)`, etc.); ningún nombre real de flag o de lectora se ha filtrado al artefacto
- [ ] La salida del sweep es comparable por diff con un sweep de versión previa (misma forma, mismos campos)

## Errores Comunes

- **Detenerse en muestra, no en sweep**: una campaña que termina con "ya hemos documentado suficientes flags" sin calcular `remaining` es muestreo, no barrido. El propósito completo de esta habilidad es la condición de fin verificable.
- **Confundir portadores de gate con todo lo extraído**: la mayoría de las cadenas en un espacio de nombres no son gates. Reportar `total_unique` como denominador de campaña infla el trabajo y deprime la tasa de completitud aparente. Usa `gate_calls` como denominador.
- **Confiar en un único patrón regex entre versiones**: los nombres de funciones lectoras de gates a veces cambian entre versiones mayores. Vuelve a validar el patrón del Paso 2 al iniciar un nuevo sweep contra un nuevo binario.
- **Saltarse el Paso 6**: declarar la completitud en `remaining = 0` sin el escaneo dinámico final puede pasar por alto flags construidos vía concatenación de cadenas. El escaneo final es barato y atrapa la vergüenza.
- **Filtrar nombres reales**: es fácil pegar accidentalmente un nombre real de flag de tu inventario en los ejemplos trabajados de la habilidad. La disciplina de placeholders (`acme_*`) existe por una razón — mantén la metodología distinta de los hallazgos.
- **Cruzar con un conjunto documentado obsoleto**: si el conjunto documentado fue construido contra un binario más antiguo, los flags que fueron eliminados aparecerán como "documentados" pero ya no extraídos, mientras que los flags genuinamente no documentados aparecerán como remanentes. Refresca el conjunto documentado contra el binario actual antes del cruce.

## Habilidades Relacionadas

- `probe-feature-flag-state` — clasificación por flag (aguas abajo del inventario de esta habilidad)
- `decode-minified-js-gates` — cuando se necesita clasificación de variante de lectora a mitad del sweep
- `monitor-binary-version-baselines` — rastreo longitudinal a lo largo de versiones del binario; los sweeps pueden re-ejecutarse contra cada baseline
- `redact-for-public-disclosure` — cómo publicar la metodología de un sweep sin filtrar el inventario en sí
- `conduct-empirical-wire-capture` — validación empírica de los flags surgidos por el sweep
