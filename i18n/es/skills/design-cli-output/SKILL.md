---
name: design-cli-output
description: >
  Design terminal output for a CLI tool with chalk colors, Unicode glyphs,
  multiple verbosity levels (human, verbose, quiet, JSON), and consistent
  voice rules. Covers color palette selection, status indicator design,
  reporter function architecture, ceremony/narrative output variants, and
  cross-terminal compatibility. Use when building a new CLI reporter module,
  adding warm narrative output to an existing tool, standardizing output
  across multiple commands, or designing machine-readable JSON alongside
  human-readable text.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: cli
  complexity: basic
  language: TypeScript
  tags:
    - cli
    - terminal
    - ux
    - chalk
    - unicode
  locale: es
  source_locale: en
  source_commit: 2630b6e9
  fence_basis_commit: 2630b6e9
  translator: "Claude + human review"
  translation_date: "2026-07-30"
---

# Design CLI Output

Diseñar salida de terminal consistente y de múltiples niveles para una herramienta de línea de comandos.

## Cuándo Usar

- Construir un nuevo módulo reporter para una herramienta CLI
- Añadir salida cálida o narrativa junto con la salida transaccional estándar
- Estandarizar el formato de salida en múltiples comandos
- Diseñar salida JSON para máquina paralela a la salida legible para humanos
- Elegir colores, glyphs y niveles de verbosidad para una nueva herramienta de terminal

## Entradas

- **Requerido**: Nombre de la herramienta CLI y audiencia primaria (desarrolladores, operadores, usuarios finales)
- **Requerido**: Comandos que necesitan formato de salida
- **Opcional**: Si se desea una variante de salida "ceremonial" o narrativa
- **Opcional**: Restricciones de marca (paleta de colores, tono)

## Procedimiento

### Paso 1: Definir la Paleta de Colores

Usar chalk para crear un objeto de paleta nombrado.

**Cargar chalk detrás de un respaldo sin color.** El respaldo tiene que suplir cada forma de llamada que usa la paleta, lo cual es más que dejar pasar los strings sin cambios:

```javascript
// A factory returns a *function*; a direct style returns a string. Enumerate
// this list against the installed chalk, not from memory — chalk 6 added the
// three underline* variants, and a list that omits them is wrong for those names.
const FACTORIES = new Set(['ansi256', 'bgAnsi256', 'bgHex', 'bgRgb', 'hex',
  'rgb', 'underlineAnsi256', 'underlineHex', 'underlineRgb']);

function makeChalkStub() {
  return new Proxy((text) => text, {
    get(target, prop) {
      if (prop === 'then') return undefined;   // must not be a thenable
      if (prop === 'level') return 0;          // no color support, truthfully
      if (typeof prop === 'symbol') return Reflect.get(target, prop);
      return FACTORIES.has(prop) ? () => makeChalkStub() : makeChalkStub();
    },
  });
}

let chalk;
try { chalk = (await import('chalk')).default; }
catch { chalk = makeChalkStub(); }
```

Cuatro invariantes, y un stub más corto se equivoca en cada una de ellas:

1. **El target del Proxy es invocable** — `(text) => text`, no `{}`. El encadenamiento (`chalk.bold.cyan('x')`) necesita que cada salto sea a la vez indexable e invocable.
2. **Las factories retornan una función.** `new Proxy({}, { get: () => (s) => s })` satisface los estilos directos y rompe las factories: `chalk.hex('#FF6B35')` es entonces el *string* `'#FF6B35'`, y llamarlo lanza `TypeError: ... is not a function`. Las paletas se construyen al cargar el módulo, así que ese respaldo tumba la herramienta en el momento del import — precisamente en la situación donde degradar a texto plano era el objetivo.
3. **`then` es `undefined`.** Un stub que responde a cada propiedad con una función hace que `await chalk` se cuelgue para siempre: el runtime llama a `.then` y espera un callback que nadie invoca. Node reporta `Detected unsettled top-level await` y sale con 13.
4. **`level` es un número.** Las comprobaciones de capacidad leen `chalk.level >= 1`; un stub truthy las abre sin soporte de color detrás.

Construir la paleta a partir del objeto que haya sobrevivido a ese import.

**Paleta estándar** (salida transaccional):

```javascript
// Status colors
const ok = chalk.green;       // success
const fail = chalk.red;       // errors
const warn = chalk.yellow;    // warnings
const info = chalk.cyan;      // identifiers, names
const dim = chalk.dim;        // secondary info, paths
const bold = chalk.bold;      // headers
```

**Paleta cálida** (salida ceremonial/narrativa):

```javascript
const C = {
  flame: chalk.hex('#FF6B35'),   // active elements, fire
  amber: chalk.hex('#FFB347'),   // arriving items, warm highlights
  spark: chalk.hex('#FFF4E0'),   // individual items (sparks/skills)
  ember: chalk.hex('#8B4513'),   // cold/dormant states
  warm:  chalk.hex('#D4A574'),   // neutral warm text
  dim:   chalk.dim,              // background, secondary
  fail:  chalk.red,              // errors stay red (honest)
};
```

Reglas de diseño de paleta:
- Siempre proveer un respaldo sin color, y comprobarlo contra las formas de llamada que la paleta realmente usa — la paleta cálida de arriba es casi por completo factories
- Usar colores hex para paletas personalizadas (`chalk.hex('#FF6B35')`)
- Mantener el color fail/error rojo independientemente del tema de la paleta
- Nombrar entradas de paleta por rol semántico, no por apariencia visual
- Compartir un solo stub entre módulos en lugar de reconstruirlo en cada sitio de import, o el mismo defecto tendrá que encontrarse y arreglarse en cada copia

**Esperado:** Un objeto de paleta con entradas nombradas, y un respaldo que ha sido ejecutado en lugar de solamente escrito.

**En caso de fallo:** Ejercitar la ruta del respaldo directamente; la paleta es el lugar equivocado para descubrir que está roto. Con el stub en alcance:

```javascript
console.assert(chalk.dim('x') === 'x');            // direct style
console.assert(chalk.hex('#fff')('x') === 'x');    // factory — the usual defect
console.assert(chalk.bold.cyan('x') === 'x');      // chain
console.assert(chalk.level === 0);                 // capability gate stays shut
await chalk;                                       // must not hang
```

`NO_COLOR=1` no cubre esto. Ejercita un chalk *funcional* que elige no emitir escapes; el respaldo ejercita un chalk que falló al importarse. Las dos rutas no comparten código. Ver [Ejemplos Extendidos](references/EXAMPLES.md#step-1-the-no-color-chalk-fallback) para el stub de producción anotado, una reproducción del defecto, y una versión ejecutable de las comprobaciones de arriba.

### Paso 2: Elegir Indicadores de Estado

Seleccionar glyphs Unicode o caracteres ASCII para comunicación de estado:

**ASCII (compatibilidad máxima):**

```text
+  created/installed (green)
-  removed/deleted (red)
=  skipped/unchanged (dim)
!  error/warning (red)
```

**Unicode (más rico, necesita terminal UTF-8):**

```text
✦  item/skill/practice (spark)
◉  active/burning state
◎  cooling/embers state
○  cold/dormant state
◌  available/not installed
✗  failed item
✓  success (use sparingly — not all terminals render it well)
```

Criterios de selección:
- ASCII para herramientas que se ejecutan en CI o contextos con pipe
- Unicode para herramientas con usuarios de terminal interactivos
- Ofrecer ambos vía un flag `--ascii` o detección de `NO_COLOR`
- Probar glyphs en: macOS Terminal, Windows Terminal, terminal de VS Code, sesiones SSH

**Esperado:** Un conjunto de glyphs que comunica el estado de un vistazo sin depender solo del color.

**En caso de fallo:** Si un glyph se renderiza como `?` o un cuadro en pruebas, reemplazar con el equivalente ASCII. El conjunto `+/-/=/!` funciona en todas partes.

### Paso 3: Diseñar Niveles de Verbosidad

Cada comando debe soportar cuatro niveles de salida:

| Nivel | Flag | Audiencia | Contenido |
|---|---|---|---|
| **Default** | (ninguno) | Humano en terminal | Formateado, coloreado, informativo |
| **Verbose** | `--verbose` o `--ceremonial` | Humano queriendo detalle | Desglose por item, secuencias de llegada |
| **Quiet** | `--quiet` | Scripts, CI | Líneas mínimas, iconos de estado, sin decoración |
| **JSON** | `--json` | Consumidores máquina | Estructurado, parseable, completo |

Patrón de implementación:

```javascript
function output(data, options) {
  if (options.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  if (options.quiet) {
    for (const item of data.items) {
      const icon = item.ok ? '+' : '!';
      console.log(`${icon} ${item.id}`);
    }
    return;
  }
  // Default (or verbose) human output
  printFormatted(data, { verbose: options.verbose });
}
```

Reglas de salida JSON:
- Siempre JSON válido (sin mezclar con texto humano)
- Incluir todos los datos que muestra la salida humana, más campos útiles para máquina
- Usar nombres de claves consistentes en todos los comandos
- Código de salida 0 para éxito, 1 para errores (independientemente del modo de salida)

**Esperado:** Cuatro niveles de salida claros con comportamiento consistente entre comandos.

**En caso de fallo:** Si el modo verbose es demasiado ruidoso, hacerlo opt-in (`--ceremonial`) en lugar de un nivel de verbosidad gradual.

### Paso 4: Establecer Reglas de Voz

Definir el tono y estilo que todas las funciones de salida siguen. Esto previene inconsistencia entre comandos.

Reglas de voz de ejemplo (del reporter campfire):

1. **Presente, voz activa**: "mystic arrives" no "mystic has been installed"
2. **Sin signos de exclamación**: Confianza tranquila. La herramienta no grita.
3. **La metáfora reemplaza la jerga**: "practices" no "dependencies" (solo para modo ceremonia)
4. **Los fallos son honestos, no catastróficos**: "A spark was lost" no "ERROR: installation failed with exit code 1"
5. **La línea de cierre refleja el estado**: Cada operación termina con un resumen de estado
6. **Sin emoji**: Los glyphs Unicode cargan peso visual sin ser decorativos
7. **Cada palabra carga información**: Si una palabra no añade comprensión, eliminarla

Reglas de voz para salida estándar (no ceremonia):
- Líneas concisas y factuales
- Icono de estado + ID del item + contexto
- Línea de resumen con conteos
- Los mensajes de error sugieren acciones correctivas

**Esperado:** Un conjunto escrito de 3-7 reglas de voz que las funciones de salida deben seguir.

**En caso de fallo:** Si las reglas se sienten arbitrarias, probarlas: escribir la misma salida con y sin cada regla. Si quitar una regla no cambia la calidad de la salida, la regla no es necesaria.

### Paso 5: Implementar Funciones Reporter

Organizar la salida en un módulo reporter con funciones enfocadas:

```javascript
// reporter.js — standard output
export function printResults(results) { ... }
export function printItemTable(items) { ... }
export function printDetections(detections) { ... }
export function printAudit(auditResults) { ... }
export function printDryRun() { ... }
export function warn(msg) { ... }
export function error(msg) { ... }
export { chalk };
```

Cada función sigue la misma estructura:
1. Manejar entrada vacía/null elegantemente
2. Calcular layout (anchos de columna, padding)
3. Salida con colores de paleta
4. Línea de resumen al fondo

Para salida ceremonial, crear un módulo separado:

```javascript
// campfire-reporter.js — warm narrative output
export function printArrival({ teamId, agents, results, ceremonial }) { ... }
export function printScatter({ teamId, agents, results }) { ... }
export function printTend(fires) { ... }
export function printCampfireList({ teams, state, reg }) { ... }
export function printFireSummary({ team, fireData, reg }) { ... }
export function printJson(data) { ... }
```

**Esperado:** Funciones reporter que son utilizables independientemente — cada una maneja su propio formato sin depender del estado del llamador.

**En caso de fallo:** Si las funciones crecen más allá de ~50 líneas, extraer helpers. Una función reporter debe ser fácil de revisar de forma aislada.

### Paso 6: Probar Salida en Diferentes Entornos

Verificar que la salida se renderiza correctamente en diferentes contextos:

```bash
# With colors (interactive terminal)
node cli/index.js list --domains

# Without colors (piped)
node cli/index.js list --domains | cat

# With NO_COLOR environment variable
NO_COLOR=1 node cli/index.js list --domains

# JSON mode (parseable)
node cli/index.js campfire --json | jq .

# In CI (typically no TTY)
CI=true node cli/index.js audit

# The no-color fallback. A failed import cannot be provoked with an env var, so
# assert on the stub itself in the suite rather than reaching it through the CLI.
# Pass a glob, not a directory: `node --test <dir>` stopped expanding at Node 22.
node --test 'cli/test/*.test.js'
```

Verificar:
- Los colores se muestran correctamente en modo interactivo
- Ningún código de escape ANSI se filtra a la salida con pipe/redirigida
- El JSON es válido (pipe a `jq .` para verificar)
- Los glyphs Unicode se renderizan en los terminales objetivo
- La alineación de columnas se mantiene con anchos de contenido variables
- El respaldo sin color responde a cada forma de llamada que usa la paleta, comprobado con aserciones en la suite en lugar de demostrado una vez a mano

**Esperado:** La salida es correcta en los seis contextos.

**En caso de fallo:** Si los códigos ANSI se filtran, asegurar que chalk respeta `NO_COLOR`. Si Unicode se rompe, proveer un modo de respaldo ASCII. Notar que una suite verde no dice nada sobre el color en ningún sentido: los test runners hacen pipe de stdout, lo que pone `chalk.level` en 0, así que la salida coloreada y la no coloreada son idénticas byte a byte y las aserciones se cumplen con el color completamente roto. Probar que el color funciona requiere `FORCE_COLOR=3` y una aserción sobre una secuencia de escape.

## Validación

- [ ] La paleta de colores tiene un respaldo sin color, y el respaldo se ha ejecutado: estilo directo, factory, cadena, `level === 0` y `await` todos comprobados
- [ ] Los indicadores de estado funcionan en modos color y sin color
- [ ] Los cuatro niveles de verbosidad producen salida útil
- [ ] La salida JSON es válida y parseable por `jq`
- [ ] Las reglas de voz están documentadas y se siguen consistentemente
- [ ] Las funciones reporter manejan entrada vacía/null elegantemente
- [ ] Salida probada en: terminal, piped, NO_COLOR, CI

## Errores Comunes

- **Un respaldo sin color que solo maneja estilos directos**: `new Proxy({}, { get: () => (s) => s })` se lee como completo y sí cubre `chalk.dim` y `chalk.red`, pero entonces cada factory retorna un string que el llamador intenta llamar de inmediato. Como las paletas se construyen al cargar el módulo, el `TypeError` cae en el momento del import — el respaldo falla con más fuerza en el único caso para el que existe. El Paso 1 lista las cuatro invariantes que un stub tiene que satisfacer.
- **Mezclar texto humano con JSON**: En modo `--json`, emitir solo JSON válido. Una sola línea perdida (como "DRY RUN") rompe los parseadores JSON. Si el comando debe mostrar ambos, separarlos claramente o suprimir el texto humano en modo JSON.
- **Anchos de columna hardcodeados**: La longitud del contenido varía. Usar `Math.max(...items.map(i => i.id.length))` para calcular el padding dinámicamente.
- **Color sin significado**: Si el color es la única forma de distinguir éxito de fallo, los usuarios daltónicos y la salida con pipe pierden información. Siempre emparejar el color con un indicador de texto (`+`, `OK`, `ERR`).
- **Ceremonia en el contexto incorrecto**: La salida narrativa cálida es apropiada para sesiones interactivas de terminal. En CI, scripts o modo `--quiet`, añade ruido. Limitar la salida ceremonial detrás de flags explícitos.
- **Olvidar la línea de resumen**: Los usuarios escanean la última línea primero. Cada operación debe terminar con un resumen de una línea (conteos de éxito/fallo/saltado).

## Habilidades Relacionadas

- `scaffold-cli-command` — los comandos que usan esta salida
- `test-cli-application` — probar que la salida coincide con las expectativas
- `build-cli-plugin` — los plugins reportan resultados a través de este sistema de salida
