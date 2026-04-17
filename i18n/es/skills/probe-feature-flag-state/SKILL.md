---
name: probe-feature-flag-state
description: >
  Sondee el estado en tiempo de ejecución de un feature flag nombrado en un
  binario CLI. Cubre el protocolo de evidencia de cuatro vías (cadenas del
  binario, invocación en vivo, estado en disco, caché de plataforma), la
  clasificación de cuatro estados (LIVE / DARK / INDETERMINATE / UNKNOWN),
  la desambiguación gate-vs-evento, el manejo de gates en conjunción, y los
  escenarios de sustitución de skill donde un flag aparece DARK pero la
  capacidad se entrega por otros medios. Úselo al verificar si una capacidad
  documentada o inferida ha sido desplegada, al auditar funciones
  dark-launched, o cuando las conclusiones de un sondeo previo necesitan
  actualizarse contra una nueva versión del binario.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, dark-launch, classification, evidence
  locale: es
  source_locale: en
  source_commit: f74b59bd
  translator: claude-sonnet-4-6
  translation_date: "2026-04-17"
---

# Sondear Estado de Feature-Flag

Determine si un feature flag nombrado en un binario CLI enviado está LIVE, DARK, INDETERMINATE o UNKNOWN, usando un protocolo de evidencia de cuatro vías que empareja cada afirmación de estado con una observación específica.

## Cuándo usar

- Una capacidad es rumoreada, documentada o inferida y usted necesita verificar si el gate realmente se dispara para la sesión en ejecución.
- Está auditando funciones dark-launched — código que se envía en el bundle pero está desactivado por gate — para planificar integraciones de forma responsable.
- Las conclusiones de un sondeo previo necesitan actualizarse contra una nueva versión del binario (el flag puede haberse invertido, eliminado, o fusionado en una conjunción).
- Está dando seguimiento a los marcadores de la Fase 1 (`monitor-binary-version-baselines`) y necesita clasificar el estado de despliegue de cada flag candidato antes de pasar a la captura de tráfico de la Fase 4.
- Un comportamiento visible al usuario cambió y necesita saber si lo impulsó un cambio de flag o un cambio de código.

## Entradas

- **Requerido**: el nombre del flag tal como aparece en el binario (forma de literal de cadena).
- **Requerido**: el binario o archivo bundle del CLI que puede leer e invocar.
- **Requerido**: una sesión autenticada contra el backend normal del arnés (su propia cuenta; nunca la de otro usuario).
- **Opcional**: el identificador de versión del binario — muy recomendado para que la tabla de evidencia sea diff-able contra futuros sondeos.
- **Opcional**: una lista de co-gates sospechosos (otros nombres de flag que puedan participar en una conjunción con este).
- **Opcional**: un artefacto de un sondeo previo para el mismo flag en una versión distinta, para análisis de delta.

## Procedimiento

### Paso 1: Confirme que el nombre del flag está presente en el binario (Vía A — Cadenas del binario)

Extraiga el nombre del flag candidato del bundle para confirmar que realmente existe como literal de cadena. Sin esto, todas las vías posteriores están sondeando el aire.

```bash
# Locate the bundle (common shapes: .js, .mjs, .bun, packaged binary)
BUNDLE=/path/to/cli/bundle.js
FLAG=acme_widget_v3   # synthetic placeholder — replace with the candidate

# Confirm the literal exists
grep -c "$FLAG" "$BUNDLE"

# Capture every line where it appears, with surrounding context for Step 2
grep -n -C 3 "$FLAG" "$BUNDLE" > /tmp/flag-context.txt
wc -l /tmp/flag-context.txt
```

Inspeccione `/tmp/flag-context.txt` y etiquete cada ocurrencia como una de:

- **gate-call** — aparece como primer argumento de una función con forma de gate (`gate("$FLAG", default)`, `isEnabled("$FLAG")`, `flag("$FLAG", ...)`).
- **telemetry-call** — aparece como primer argumento de una función emit/log/track.
- **env-var-check** — aparece en una consulta `process.env.X` (o equivalente).
- **string-table** — aparece en un mapa estático o registro cuyo rol es poco claro.

**Expected:** al menos una ocurrencia de la cadena del flag en el bundle, y cada ocurrencia etiquetada con el rol de su sitio de llamada.

**On failure:** si `grep -c` devuelve 0, el flag no está en esta build. O el nombre de entrada está mal (typo, namespace incorrecto) o el flag se eliminó en esta versión. Revise la salida de marcadores de la Fase 1, luego corrija la entrada o clasifique como `REMOVED` y deténgase.

### Paso 2: Distinga gate de evento de variable de entorno

La misma cadena puede aparecer como un gate, como nombre de evento de telemetría, como variable de entorno, o como las tres. La clasificación depende del sitio de llamada, no de la cadena. Confundir un nombre de telemetría con un gate produce un razonamiento absurdo ("este gate debe estar apagado") sobre algo que nunca fue un gate.

Para cada ocurrencia etiquetada del Paso 1:

- Una ocurrencia **gate-call** hace a esta cadena elegible para clasificación LIVE / DARK / INDETERMINATE. Capture el **valor por defecto** pasado al gate (`gate("$FLAG", false)` establece el flag por defecto en off; `gate("$FLAG", true)` lo establece por defecto en on). Registre tanto el default literal como el nombre de la función gate.
- Una ocurrencia **telemetry-call** **no** convierte la cadena en un gate. Es una etiqueta disparada cuando algún otro gate ya ha pasado. Si las *únicas* ocurrencias son telemetry-call, la cadena es solo-evento y la clasificación final es `UNKNOWN` (el nombre está presente pero no es un gate).
- Una ocurrencia **env-var-check** usualmente indica un kill switch (capacidad activa por defecto desactivada por una variable de entorno) o un opt-in explícito (capacidad inactiva por defecto activada por una variable de entorno). Note la polaridad — `if (process.env.X) { return null; }` es un kill switch; `if (process.env.X) { enable(); }` es un opt-in.
- Una ocurrencia **string-table** debe ser referenciada de forma cruzada — mire cómo se consume la tabla aguas abajo.

**Expected:** para cada ocurrencia, un rol definido de sitio de llamada y (para gate-calls) el valor por defecto registrado.

**On failure:** si el contexto que rodea a un gate-call está demasiado minificado para leer el default, amplíe el contexto de grep (`-C 10`) e inspeccione el callee completo. Si aún no puede determinar el default, regístrelo como `default=?` y degrade cualquier conclusión LIVE/DARK a INDETERMINATE.

### Paso 3: Observe el comportamiento en invocación en vivo (Vía B — Sondeo en tiempo de ejecución)

Ejecute el arnés en una sesión autenticada que usted controle y observe si la capacidad con gate emerge. Esta es la vía de mayor señal: el bundle dice lo que *puede* pasar, el tiempo de ejecución muestra lo que *pasa*.

Elija una acción de sondeo que revele el paso del gate — típicamente el comportamiento visible al usuario que el gate protege (una herramienta que aparece en una lista de herramientas, un flag de comando que se vuelve válido, un elemento de UI que se renderiza, un campo de salida que aparece en una respuesta).

```bash
# Example shape — adapt to the harness
$CLI --list-capabilities | grep -i widget         # does the gated capability appear?
$CLI --help 2>&1 | grep -i "$FLAG"                # is a flag-related option exposed?
$CLI run-some-command --debug 2>&1 | tee probe-runtime.log
```

Registre uno de tres resultados:

- **paso de gate observado** — la capacidad emergió en la sesión. Candidato de clasificación: `LIVE`.
- **paso de gate no observado** — la capacidad no emergió. El candidato de clasificación depende del default del Paso 2 (default-false → `DARK`; default-true → reverifique, esto es sospechoso).
- **paso de gate condicionado a una entrada o contexto específico no reproducible aquí** — registre la condición; candidato de clasificación: `INDETERMINATE`.

**Expected:** una acción de sondeo registrada, el resultado observado y el candidato de clasificación al que apunta.

**On failure:** si la propia acción de sondeo da error (fallo de auth, red inalcanzable, subcomando incorrecto), la vía de tiempo de ejecución es inutilizable en esta ronda. Arregle la sesión o escoja otra acción de sondeo; no infiera DARK a partir de un tiempo de ejecución que nunca corrió.

### Paso 4: Inspeccione el estado en disco (Vía C — Configuración, caché, sesión)

Muchos arneses persisten las evaluaciones de gate o los valores de override a disco para no tener que volver a consultarlos. Inspeccionar este estado muestra lo que el arnés creía sobre el flag en la última evaluación.

Ubicaciones comunes (adapte al arnés — estas son formas, no rutas específicas):

```bash
# User-level config
ls ~/.config/<harness>/ 2>/dev/null
ls ~/.<harness>/ 2>/dev/null

# Per-project state
ls .<harness>/ 2>/dev/null

# Cache directories
ls ~/.cache/<harness>/ 2>/dev/null

# Search any of these for the flag name
grep -r "$FLAG" ~/.config/<harness>/ ~/.cache/<harness>/ .<harness>/ 2>/dev/null
```

Registre la ruta de cada hit, el valor asociado al flag y la hora de última modificación del archivo. Una entrada de caché modificada recientemente que sobrescribe un default del binario es la evidencia más fuerte posible en cualquier dirección.

**Expected:** o bien un valor de override confirmado con timestamp, o bien una ausencia confirmada (ningún estado en disco menciona este flag).

**On failure:** si encuentra el flag mencionado pero no puede determinar si el valor registrado es una respuesta cacheada del servidor, un override del usuario, o un valor obsoleto, marque la entrada para reconciliación en el Paso 5 (caché de plataforma) en lugar de adivinar.

### Paso 5: Inspeccione la caché del servicio de flags de plataforma (Vía D)

Si el arnés usa un servicio externo de feature flags (LaunchDarkly, Statsig, GrowthBook, interno del proveedor, etc.), la respuesta del servicio cacheada localmente es el estado de despliegue actual autoritativo. Inspecciónelo donde esté disponible.

```bash
# Look for service-shaped cache files
find ~/.cache ~/.config -name "*flag*" -o -name "*feature*" -o -name "*config*" 2>/dev/null | head

# If a cache file is present, parse it for the flag name
jq ".[] | select(.key == \"$FLAG\")" ~/.cache/<harness>/flags.json 2>/dev/null
```

Registre el valor cacheado, el timestamp de la caché y (si está presente) el TTL de la caché. Una caché de plataforma que dice `false` sobrescribe un default de binario de `true`; una caché de plataforma que dice `true` sobrescribe un default de binario de `false`.

**Expected:** o bien un valor cacheado definido con timestamp, o bien la ausencia confirmada de caché del servicio de flags para este arnés.

**On failure:** si el arnés no tiene servicio de flags o no puede localizar la caché, esta vía no aporta nada — eso es aceptable. Anote "Vía D: no aplicable" en la tabla de evidencia; no adivine.

### Paso 6: Maneje los gates en conjunción

Algunas capacidades están protegidas por múltiples flags que deben todos ser verdaderos: `gate("A") && gate("B") && gate("C")`. Cualquiera de ellos siendo DARK basta para hacer la capacidad DARK, pero la clasificación por flag sigue perteneciendo a cada flag individualmente.

```bash
# After finding the gate-call site for the primary flag in Step 2, scan the
# enclosing predicate for other gate(...) calls
grep -n -C 5 "$FLAG" "$BUNDLE" | grep -oE 'gate\("[^"]+"' | sort -u
```

Para cada cadena de co-gate que aflore:

- Repita los Pasos 1-5 para ese flag (trate cada uno como su propio sondeo).
- Registre la clasificación por flag.
- Calcule la clasificación a **nivel de capacidad**: LIVE solo si todos los conjuntos son LIVE; DARK si cualquier conjunto es DARK; INDETERMINATE si ningún conjunto es DARK y al menos uno es INDETERMINATE.

**Expected:** cada conjunto identificado y clasificado individualmente, más una clasificación derivada a nivel de capacidad.

**On failure:** si el predicado está demasiado minificado para enumerarlo limpiamente (el sitio de llamada está en línea o envuelto), registre la conjunción como "≥1 gate adicional, estructura ilegible" y degrade la clasificación a nivel de capacidad a INDETERMINATE aunque el flag primario parezca LIVE.

### Paso 7: Verifique sustitución de skill

Un flag puede legítimamente estar DARK mientras la capacidad de cara al usuario que desbloquearía es alcanzable por una ruta distinta totalmente soportada — un comando distinto, una skill invocable por el usuario, una API alternativa. El hallazgo honesto "flag DARK, capacidad LIVE por sustitución" es común e importante; pasarlo por alto produce informes de dark-launch alarmantes sobre capacidades que los usuarios realmente tienen.

Para cualquier clasificación candidata de DARK o INDETERMINATE, pregunte:

- ¿Existe un comando documentado invocable por el usuario, comando slash o skill que entregue el mismo resultado final para el usuario?
- ¿Existe una superficie de API alternativa (endpoint distinto, nombre de herramienta distinto) que devuelva datos equivalentes?
- ¿Publica el arnés un punto de extensión de cara al usuario (plugins, herramientas personalizadas, hooks) que permita a los usuarios ensamblar el equivalente por sí mismos?

Si sí a alguna, añada una nota `substitution:` a la fila de evidencia registrando la ruta alternativa y su observabilidad (cómo llega el usuario a ella, si está documentada).

**Expected:** para cada clasificación DARK / INDETERMINATE, una verificación de sustitución explícita — o la ruta, o la nota explícita "no se identificó ruta de sustitución".

**On failure:** si sospecha que existe una sustitución pero no puede confirmar la ruta, marque "sustitución sospechada; no confirmada" en lugar de afirmar en cualquier dirección.

### Paso 8: Ensamble la tabla de evidencia y la clasificación final

Combine las cuatro vías en una única tabla. Cada afirmación de estado debe emparejarse con la observación que la sustenta; reejecutar el sondeo en una nueva versión produce un artefacto diff-able.

| Campo | Valor |
|---|---|
| Flag | `acme_widget_v3` (placeholder sintético) |
| Versión del binario | `<version-id>` |
| Fecha del sondeo | `YYYY-MM-DD` |
| Vía A — cadenas | presente (3 ocurrencias: 1 gate-call default=`false`, 2 telemetría) |
| Vía B — runtime | paso de gate no observado en la lista de capacidades |
| Vía C — en disco | no se encontró override en `~/.config/<harness>/` |
| Vía D — caché de plataforma | caché del servicio ausente / no aplicable |
| Conjunción | ninguna — predicado de un solo gate |
| Sustitución | el comando slash `widget` invocable por el usuario entrega UX equivalente |
| **Estado final** | **DARK (capacidad LIVE por sustitución)** |

Aplique las reglas de clasificación:

- **LIVE** — al menos una vía observó paso de gate en esta sesión Y ninguna vía lo contradice.
- **DARK** — cadena de flag presente, default del gate-call es `false`, ninguna vía observó paso de gate, ningún override lo invierte a encendido.
- **INDETERMINATE** — el paso de gate es condicional a una entrada o contexto no reproducible en este sondeo, O el default del gate no pudo determinarse, O un conjunto es INDETERMINATE.
- **UNKNOWN** — cadena presente pero no usada como gate (etiqueta solo-telemetría, solo-string-table, solo-env-var).

Guarde la tabla como artefacto de sondeo (p. ej., `probes/<flag>-<version>.md`) para que futuros sondeos hagan diff contra ella.

**Expected:** una tabla de evidencia completa que cubra las cuatro vías, el estado de conjunción, el estado de sustitución y una única clasificación final.

**On failure:** si ninguna vía produce señal utilizable (el binario no se puede leer, el runtime no se puede invocar, la caché en disco y la de plataforma ambas ausentes), no invente una clasificación. Registre `INDETERMINATE` con la razón "ninguna vía produjo señal" y deténgase.

## Validación

- [ ] Cada afirmación de estado en la tabla de evidencia está emparejada con una observación específica (sin aserciones desnudas).
- [ ] El valor por defecto del gate-call del flag está registrado (o se anota explícitamente como ilegible).
- [ ] Las ocurrencias de evento de telemetría no cuentan como evidencia de gate.
- [ ] Los gates en conjunción tienen clasificaciones por flag **y** una clasificación a nivel de capacidad.
- [ ] Cada fila DARK / INDETERMINATE tiene una verificación de sustitución explícita.
- [ ] El artefacto registra la versión del binario para que futuros sondeos sean diff-ables.
- [ ] Ningún nombre real de producto, identificador vinculado a versión o nombre de flag solo-dark aparece en ningún artefacto destinado a publicación (ver `redact-for-public-disclosure`).

## Errores comunes

- **Confundir eventos de telemetría con gates.** Una cadena que aparece en `emit("$FLAG", ...)` es una etiqueta, no un gate. Un flag que es "solo-telemetría" no tiene estado de despliegue y debe clasificarse UNKNOWN, no DARK.
- **Saltarse la Vía B (invocación en vivo).** La evidencia estática sola (el binario dice `default=false`) no es lo mismo que la evidencia en tiempo de ejecución (la capacidad no apareció). Un flag con default-false en el binario puede invertirse a true por un override del lado del servidor; solo el sondeo en vivo muestra lo que la sesión realmente recibió.
- **Pasar por alto la conjunción.** Clasificar el flag primario como LIVE porque su única ocurrencia muestra `default=true` mientras se ignora el `&& gate("B") && gate("C")` circundante produce un LIVE falsamente seguro para una capacidad que en realidad está protegida por B o C.
- **Declarar DARK sin verificación de sustitución.** Muchos flags DARK son genuinamente inalcanzables, pero muchos otros tienen una ruta invocable por el usuario totalmente soportada. La verificación de sustitución es lo que convierte un "dark-launch alarmante" en un "hallazgo honesto".
- **Sondear una versión obsoleta del binario.** Un artefacto de sondeo sin sello de versión es inútil — no se puede saber si refleja el estado actual o el del último trimestre. Registre siempre la versión, y haga diff de sondeos futuros contra el artefacto.
- **Activar el gate para confirmarlo.** Invertir un flag para probarlo no es parte de esta skill. Algunos gates dark están apagados por razones de seguridad (capacidad incompleta, retención regulatoria, migración inacabada). Documente; nunca salte por encima.
- **Capturar el estado de otros usuarios.** La Vía C y la Vía D inspeccionan *su propio* estado en disco y *su propia* caché. Leer la caché de otro usuario es exfiltración y queda fuera de alcance.
- **Tratar INDETERMINATE como un fallo.** No lo es — es la clasificación honesta cuando la evidencia es parcial. Forzar resultados INDETERMINATE a LIVE o DARK para hacer que el informe parezca decisivo es la vía más rápida a equivocarse.

## Skills relacionadas

- `monitor-binary-version-baselines` — Fase 1 de la guía padre; el seguimiento de marcadores sobre el que esta skill se construye suministra el inventario de flags candidatos.
- `conduct-empirical-wire-capture` — Fase 4; evidencia más profunda en tiempo de ejecución (captura de red, hooks de ciclo de vida) cuando el sondeo superficial de la Vía B resulta insuficiente.
- `security-audit-codebase` — el código dark-launched forma parte de la arqueología de superficie de ataque; esta skill es la mitad de descubrimiento de esa auditoría.
- `redact-for-public-disclosure` — Fase 5; la disciplina de redacción que decide qué artefactos de sondeo pueden dejar el espacio de trabajo privado.
