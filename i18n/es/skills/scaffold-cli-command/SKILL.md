---
name: scaffold-cli-command
description: >
  Scaffold a new CLI command using Commander.js with options, action handler,
  three output modes (human-readable, quiet, JSON), and optional ceremony
  variant. Covers command naming, option design, shared context patterns,
  error handling, and integration testing. Use when adding a command to an
  existing Commander.js CLI, designing a new CLI tool from scratch, or
  standardizing command structure across a multi-command CLI.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: cli
  complexity: intermediate
  language: TypeScript
  tags:
    - cli
    - commander
    - nodejs
    - terminal
    - command-pattern
  locale: es
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Scaffold a CLI Command

Añadir un nuevo comando a una aplicación CLI Commander.js con manejo consistente de opciones, tres modos de salida y pruebas de integración.

## Cuándo Usar

- Añadir un nuevo comando a una CLI Commander.js existente
- Diseñar una herramienta CLI multi-comando desde cero
- Estandarizar la estructura de comandos para que todos los comandos sigan los mismos patrones
- Añadir una variante "ceremonial" que reemplaza la salida de máquina con salida cálida y narrativa

## Entradas

- **Requerido**: Nombre y verbo del comando (p. ej., `gather`, `audit`, `sync`)
- **Requerido**: Lo que hace el comando (una oración)
- **Requerido**: Ruta al punto de entrada de la CLI (p. ej., `cli/index.js`)
- **Opcional**: Si el comando necesita una variante ceremonial (salida narrativa cálida)
- **Opcional**: Opciones personalizadas más allá del conjunto estándar
- **Opcional**: Argumentos de subcomando (args posicionales como `<name>` o `[names...]`)

## Procedimiento

### Paso 1: Elegir el Nombre y Categoría del Comando

Seleccionar un verbo que comunique la acción del comando. Agrupar comandos en categorías:

| Categoría | Verbos | Patrón |
|----------|-------|---------|
| CRUD | `install`, `uninstall`, `list`, `search` | Opera sobre contenido |
| Lifecycle | `init`, `sync`, `audit` | Gestiona el estado del proyecto |
| Ceremony | `gather`, `scatter`, `tend`, `campfire` | Salida narrativa cálida |

Convenciones de nombrado:
- Usar un solo verbo (no `install-skill` — dejar que las opciones especifiquen qué)
- Usar minúsculas, sin guiones en el nombre del comando mismo
- Args posicionales: `<required>` o `[optional]` o `[variadic...]`

```javascript
program
  .command('gather <name>')
  .description('Gather a team around the campfire')
```

**Esperado:** Un nombre de comando, descripción y args posicionales definidos.

**En caso de fallo:** Si el verbo se solapa con un comando existente, o componerlos (añadir una opción al comando existente) o diferenciarlos claramente en la descripción.

### Paso 2: Definir Opciones

Cada comando debe soportar un conjunto estándar de opciones compartidas más las específicas del comando.

**Opciones estándar** (incluir según sea necesario):

```javascript
  .option('-n, --dry-run', 'Preview without making changes')
  .option('-q, --quiet', 'Suppress human-readable output')
  .option('--json', 'Output as JSON')
  .option('-f, --framework <id>', 'Target specific framework')
  .option('-g, --global', 'Use global scope')
  .option('--scope <scope>', 'Scope: project, workspace, global', 'project')
  .option('--source <path>', 'Path to tool root directory')
```

**Opciones específicas del comando** — añadir solo lo que el comando necesita:

```javascript
  .option('--ceremonial', 'Show each item arriving individually')
  .option('--only <items>', 'Comma-separated subset to include')
  .option('-y, --yes', 'Skip confirmation prompts')
```

Reglas de diseño:
- Flags cortos (`-n`) para opciones usadas frecuentemente
- Flags largos (`--dry-run`) para claridad
- Valores predeterminados como tercer argumento donde sea apropiado
- Flags booleanos (sin argumento) para toggles

**Esperado:** Una cadena completa de opciones con opciones estándar y personalizadas.

**En caso de fallo:** Si demasiadas opciones se acumulan (>8), considerar dividir en subcomandos o agrupar opciones relacionadas.

### Paso 3: Implementar el Action Handler

El action handler sigue un patrón consistente:

```javascript
.action(async (name, options) => {
  // 1. Get shared context (registries, adapters, paths)
  const ctx = getContext(options);

  // 2. Resolve what to operate on
  const items = resolveItems(ctx, name, options);
  if (!items || items.length === 0) {
    reporter.error('Nothing found.');
    process.exit(1);
  }

  // 3. Preview if dry-run
  if (options.dryRun) reporter.printDryRun();

  // 4. Execute the operation
  const results = await executeOperation(items, ctx, options);

  // 5. Output results (3 modes)
  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
  } else if (options.quiet) {
    reporter.printResults(results);
  } else {
    printHumanOutput(results, options);
  }
})
```

El helper compartido `getContext()` centraliza:
- Detección del directorio raíz
- Carga del registry
- Detección de framework o selección explícita
- Resolución de scope

**Esperado:** Un action handler que sigue el patrón de 5 pasos: contexto → resolver → previsualizar → ejecutar → salida.

**En caso de fallo:** Si el comando no encaja en el patrón resolver-luego-ejecutar (p. ej., es puramente informacional como `detect`), simplificar a: contexto → calcular → salida.

### Paso 4: Añadir los Tres Modos de Salida

Cada comando debe soportar tres modos de salida:

**Predeterminado (legible para humanos):**
```
Installing 3 item(s) to Claude Code...

  + create-skill [claude-code] .claude/skills/create-skill
  + write-tests  [claude-code] .claude/skills/write-tests
  = commit-changes [claude-code] (skipped)

  2 installed, 1 skipped
```

**Quiet (`--quiet`):**
Salida estándar del reporter — líneas concisas con iconos de estado (`+`, `-`, `=`, `!`), sin ceremonia, sin decoración.

**JSON (`--json`):**
```json
{
  "command": "install",
  "items": 3,
  "installed": 2,
  "skipped": 1,
  "failed": 0
}
```

Patrón de implementación:

```javascript
if (options.json) {
  console.log(JSON.stringify(data, null, 2));
  return;
}
if (options.quiet) {
  reporter.printResults(results);
  return;
}
// Default: human-readable output
printHumanReadable(results, options);
```

**Esperado:** Los tres modos producen salida útil. JSON es parseable. Quiet es conciso. Predeterminado es informativo.

**En caso de fallo:** Si el comando no tiene representación JSON significativa (p. ej., `detect`), saltar el modo JSON y documentar por qué.

### Paso 5: Añadir Variante Ceremonial (Opcional)

Para comandos que se benefician de salida cálida y narrativa en lugar de reporte transaccional:

```javascript
if (options.json) {
  ceremonyReporter.printJson(data);
} else if (options.quiet) {
  reporter.printResults(results);
} else {
  ceremonyReporter.printArrival({
    teamId: name,
    agents,
    results: { installed, skipped, failed },
    ceremonial: options.ceremonial || false,
  });
}
```

La salida ceremonial sigue las reglas de voz:
1. Presente, voz activa ("mystic arrives", no "mystic was installed")
2. Sin signos de exclamación
3. La metáfora reemplaza la jerga ("practices" no "dependencies")
4. Los fallos son honestos, no catastróficos ("a spark was lost")
5. La línea de cierre refleja el estado ("The fire burns.")
6. Sin emoji — usar glyphs Unicode (✦ ◉ ◎ ○ ✗)
7. Cada palabra debe cargar información

Ver la habilidad `design-cli-output` para patrones detallados de salida de terminal.

**Esperado:** Salida ceremonial que sigue todas las reglas de voz y produce narrativas cálidas e informativas.

**En caso de fallo:** Si la salida ceremonial se siente forzada o no añade información más allá de la salida estándar, saltarla. No todo comando necesita una variante ceremonial.

### Paso 6: Manejar Errores y Casos Límite

```javascript
// Unknown item
if (!item) {
  reporter.error(`Unknown: ${name}. Use 'tool list' to browse.`);
  process.exit(1);
}

// Confirmation for destructive actions
if (!options.yes && !options.quiet && !options.dryRun) {
  const answer = await askYesNo('Proceed?');
  if (!answer) {
    console.log('  Cancelled.');
    return;
  }
}

// State validation
if (!state.fires[name]) {
  reporter.error(`Not active. Nothing to remove.`);
  process.exit(1);
}
```

Principios de diseño de errores:
- Los mensajes de error sugieren la acción correctiva
- `process.exit(1)` para errores irrecuperables
- Prompts de confirmación para operaciones destructivas (saltar con `--yes`)
- Dry-run siempre tiene éxito (nunca bloquea en confirmación)

**Esperado:** Todos los caminos de error producen mensajes útiles. Las operaciones destructivas requieren confirmación.

**En caso de fallo:** Si los prompts de confirmación interfieren con scripting, asegurar que `--yes` y `--quiet` ambos los sorteen.

### Paso 7: Escribir Pruebas de Integración

```javascript
import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'child_process';

const CLI = 'node cli/index.js';
function run(args) {
  return execSync(`${CLI} ${args}`, { encoding: 'utf8', timeout: 10000 });
}

describe('new-command', () => {
  after(() => { /* cleanup created files/state */ });

  it('dry-run shows preview', () => {
    const out = run('new-command arg --dry-run');
    assert.match(out, /DRY RUN/);
  });

  it('--json outputs valid JSON', () => {
    const out = run('new-command arg --json');
    const start = out.indexOf('{');
    const data = JSON.parse(out.slice(start));
    assert.equal(data.command, 'new-command');
  });

  it('rejects unknown input', () => {
    assert.throws(() => run('new-command nonexistent'), /Unknown/);
  });
});
```

Ver la habilidad `test-cli-application` para patrones comprensivos de pruebas de CLI.

**Esperado:** Al menos 3 pruebas: dry-run, salida JSON, caso de error. Más para comandos complejos.

**En caso de fallo:** Si `execSync` hace timeout, aumentar el timeout o verificar prompts interactivos bloqueando el comando.

## Validación

- [ ] El comando está registrado en el punto de entrada de la CLI y aparece en `--help`
- [ ] Las opciones estándar (`--dry-run`, `--quiet`, `--json`) funcionan correctamente
- [ ] La salida predeterminada es legible para humanos e informativa
- [ ] La salida JSON es válida y parseable
- [ ] Los mensajes de error sugieren acciones correctivas
- [ ] Las operaciones destructivas requieren confirmación (sorteadas por `--yes`)
- [ ] Al menos 3 pruebas de integración pasan
- [ ] El comando sigue el patrón getContext → resolver → ejecutar → salida

## Errores Comunes

- **Olvidar el modo JSON**: Los consumidores de máquina (scripts, CI) dependen de salida estructurada. Siempre implementar `--json` incluso si el comando parece solo-interactivo.
- **Prompts de confirmación bloqueando scripts**: Cualquier comando que pida entrada se colgará en contextos no-interactivos. Siempre proveer `--yes` para comandos destructivos y asegurar que `--quiet` suprima prompts.
- **Códigos de salida de error inconsistentes**: Usar `process.exit(1)` para todos los errores. Las herramientas que parsean salida de CLI verifican códigos de salida primero.
- **Opciones sin predeterminados**: Opciones como `--scope` deben tener predeterminados sensatos para que los usuarios no necesiten especificarlos cada vez.
- **Filtrar ceremonia al modo quiet**: El flag `--quiet` significa "salida mínima para máquinas." Si el texto de ceremonia se filtra al modo quiet, los scripts se romperán por salida inesperada.

## Habilidades Relacionadas

- `build-cli-plugin` — construir el adaptador/plugin sobre el que operan los comandos
- `test-cli-application` — patrones comprensivos de pruebas de CLI más allá de los básicos en el Paso 7
- `design-cli-output` — diseño de salida de terminal para todos los niveles de verbosidad
- `install-almanac-content` — ejemplo de una habilidad de comando CLI bien estructurada
