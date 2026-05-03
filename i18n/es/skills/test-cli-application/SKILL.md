---
name: test-cli-application
description: >
  Write integration tests for a Node.js CLI application using the built-in
  node:test module. Covers the exec helper pattern, output assertions,
  filesystem state verification, cleanup hooks, JSON output parsing, error
  case testing, and state restoration after destructive tests. Use when
  adding tests to an existing CLI, testing a new command, verifying adapter
  behavior across frameworks, or setting up CI for a CLI tool.
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
    - testing
    - nodejs
    - node-test
    - integration
  locale: es
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Test a CLI Application

Escribir pruebas de integración para una CLI Node.js usando el módulo built-in `node:test` con `execSync`.

## Cuándo Usar

- Añadir pruebas a una aplicación CLI existente
- Probar un comando recién creado
- Verificar el comportamiento del adaptador/plugin a través de frameworks objetivo
- Configurar CI que valida la corrección de la CLI
- Captar regresiones después de refactorizar internos de CLI

## Entradas

- **Requerido**: Ruta al punto de entrada de la CLI (p. ej., `cli/index.js`)
- **Requerido**: Comandos a probar
- **Opcional**: Adaptadores de framework a probar (modo dry-run)
- **Opcional**: Requisitos de limpieza (archivos/symlinks creados por las pruebas)

## Procedimiento

### Paso 1: Configurar la Infraestructura de Pruebas

```javascript
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { resolve } from 'path';

const CLI = 'node cli/index.js';
const ROOT = process.cwd();

function run(args) {
  return execSync(`${CLI} ${args}`, {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 10000,
  });
}
```

Decisiones clave de diseño:
- `node:test` está built-in — no se necesita dependencia de test runner
- `execSync` ejecuta la CLI como subproceso — prueba el binario real, no funciones internas
- Timeout de 10 segundos previene cuelgues en prompts interactivos
- `encoding: 'utf8'` da salida string para coincidencia con regex
- Todas las rutas relativas a `ROOT` para reproducibilidad

**Esperado:** Un archivo de pruebas que importa de `node:test` y tiene un helper `run()` funcional.

**En caso de fallo:** Si `node:test` no está disponible, tu versión de Node.js está debajo de 18. Actualizar o usar un polyfill.

### Paso 2: Escribir Pruebas Smoke

Las pruebas smoke verifican que la CLI inicia, parsea argumentos y produce las formas de salida esperadas:

```javascript
describe('meta', () => {
  it('shows version', () => {
    const out = run('--version');
    assert.match(out, /\d+\.\d+\.\d+/);
  });

  it('shows help with all commands', () => {
    const out = run('--help');
    assert.match(out, /install/);
    assert.match(out, /list/);
    assert.match(out, /detect/);
  });
});

describe('registry', () => {
  it('list shows expected counts', () => {
    const out = run('list --domains');
    assert.match(out, /\d+ domains/);
  });

  it('search finds known items', () => {
    const out = run('search "docker"');
    assert.match(out, /result\(s\) for "docker"/);
  });

  it('search returns 0 for nonsense', () => {
    const out = run('search "xyzzy-nonexistent"');
    assert.match(out, /0 result/);
  });
});
```

Patrones de prueba smoke:
- `--version` y `--help` siempre funcionan
- La carga del registry valida la integridad de los datos
- Búsqueda con términos conocidos y desconocidos

**Esperado:** Las pruebas smoke confirman que la CLI es funcional y los datos están cargados.

**En caso de fallo:** Si los conteos del registry cambian frecuentemente, usar `\d+` en lugar de números hardcoded.

### Paso 3: Escribir Pruebas de Lifecycle

Las pruebas de lifecycle verifican secuencias create → verify → delete con limpieza:

```javascript
describe('install', () => {
  const testPath = resolve(ROOT, '.agents/skills/commit-changes');

  after(() => {
    // Always clean up, even if tests fail
    try { rmSync(testPath); } catch {}
    try { rmSync(resolve(ROOT, '.agents/skills'), { recursive: true }); } catch {}
    try { rmSync(resolve(ROOT, '.agents'), { recursive: true }); } catch {}
  });

  it('dry-run does not create files', () => {
    const out = run('install commit-changes --dry-run');
    assert.match(out, /DRY RUN/);
    assert.ok(!existsSync(testPath));
  });

  it('installs creates the target', () => {
    run('install commit-changes');
    assert.ok(existsSync(testPath));
  });

  it('skips already installed', () => {
    const out = run('install commit-changes');
    assert.match(out, /skipped/);
  });

  it('uninstall removes the target', () => {
    run('uninstall commit-changes');
    assert.ok(!existsSync(testPath));
  });
});
```

Reglas de limpieza:
- Usar hooks `after()`, no `afterEach()` — las pruebas de lifecycle se construyen unas sobre otras
- Envolver la limpieza en `try/catch` — la limpieza no debe fallar la suite de pruebas
- Limpiar de hoja a raíz (archivo → directorio padre → directorio abuelo)
- Si la prueba modifica estado compartido (symlinks, archivos de config), restaurarlo

**Esperado:** Las pruebas corren en secuencia dentro del bloque describe, la limpieza corre incluso en caso de fallo.

**En caso de fallo:** Si las pruebas corren en paralelo (no-predeterminado en node:test), forzar secuencial con `{ concurrency: 1 }`.

### Paso 4: Escribir Pruebas Dry-Run para Cada Adaptador

Probar la ruta objetivo de cada adaptador sin hacer cambios:

```javascript
describe('adapter: cursor (dry-run)', () => {
  it('targets .cursor/skills/ path', () => {
    const out = run('install commit-changes --framework cursor --dry-run');
    assert.match(out, /\.cursor\/skills/i);
  });
});

describe('adapter: copilot (dry-run)', () => {
  it('targets .github/ path', () => {
    const out = run('install commit-changes --framework copilot --dry-run');
    assert.match(out, /\.github/i);
  });
});
```

Este patrón escala a cualquier número de adaptadores. Cada prueba:
- Usa `--framework` para sortear la auto-detección
- Usa `--dry-run` para que no se creen archivos
- Asserta que la ruta objetivo aparece en la salida

**Esperado:** Un bloque describe por adaptador, cada uno con al menos una assertion de ruta.

**En caso de fallo:** Si el adaptador no existe en el proyecto, la prueba fallará con "Unknown framework." Esto es correcto — las pruebas de adaptador solo deben existir para adaptadores implementados.

### Paso 5: Escribir Pruebas de Casos de Error

```javascript
describe('errors', () => {
  it('rejects unknown items', () => {
    assert.throws(
      () => run('install nonexistent-skill-xyz'),
      /No matching items|Unknown/,
    );
  });

  it('rejects unknown framework', () => {
    assert.throws(
      () => run('install commit-changes --framework nonexistent'),
      /Unknown framework/,
    );
  });

  it('handles missing state gracefully', () => {
    assert.throws(
      () => run('scatter nonexistent-team'),
      /not burning|Unknown/,
    );
  });
});
```

Patrones de prueba de errores:
- `assert.throws` captura códigos de salida no-cero de `execSync`
- Coincidencia regex en el mensaje de error (capturado de stderr)
- Probar errores tanto de "item no encontrado" como de "opción inválida"
- Verificar que los mensajes de error sugieren acciones correctivas

**Esperado:** Todos los caminos de error producen códigos de salida no-cero y mensajes útiles.

**En caso de fallo:** `execSync` lanza en caso de salida no-cero. El `stderr` o `stdout` del error contiene el mensaje. Verificar `error.stdout` si la regex de `assert.throws` no coincide.

### Paso 6: Escribir Pruebas de Salida JSON

```javascript
describe('json output', () => {
  it('campfire --json outputs valid JSON', () => {
    const out = run('campfire --json');
    const data = JSON.parse(out);
    assert.ok(typeof data.totalTeams === 'number');
    assert.ok(Array.isArray(data.fires));
  });

  it('gather --dry-run --json outputs structured data', () => {
    const out = run('gather tending --dry-run --json');
    // JSON may follow a DRY RUN header — extract from first '{'
    const jsonStart = out.indexOf('{');
    assert.ok(jsonStart >= 0, 'Should contain JSON');
    const data = JSON.parse(out.slice(jsonStart));
    assert.equal(data.team, 'tending');
  });
});
```

Trampas de prueba JSON:
- Algunos comandos prefijan JSON con texto legible para humanos (p. ej., header DRY RUN)
- Extraer JSON encontrando el primer carácter `{`
- Validar la estructura (presencia de claves, tipos), no los valores exactos
- Valores como conteos pueden cambiar conforme se añade contenido

**Esperado:** La salida JSON es parseable y contiene las claves esperadas.

**En caso de fallo:** Si `JSON.parse` falla, el comando puede estar mezclando texto humano con JSON. O arreglar el comando para emitir JSON puro en modo `--json`, o extraer el substring JSON.

### Paso 7: Manejar Limpieza y Restauración de Estado

```javascript
describe('stateful commands', () => {
  const stateDir = resolve(ROOT, '.agent-almanac');

  after(() => {
    // Remove state file created by tests
    try { rmSync(stateDir, { recursive: true }); } catch {}
  });

  // Tests that create/modify state...
});

// Restore symlinks that destructive tests may remove
describe('destructive tests', () => {
  after(() => {
    // Restore symlinks that scatter/uninstall removed
    const skills = ['heal', 'meditate', 'remote-viewing'];
    for (const skill of skills) {
      const link = resolve(ROOT, `.claude/skills/${skill}`);
      if (!existsSync(link)) {
        try {
          execSync(`ln -s ../../skills/${skill} ${link}`, { cwd: ROOT });
        } catch {}
      }
    }
  });
});
```

Reglas de restauración de estado:
- Los archivos de estado (`.agent-almanac/state.json`) deben limpiarse después de las pruebas
- Symlinks eliminados por `scatter`/`uninstall` deben ser restaurados
- Los archivos de manifiesto (`agent-almanac.yml`) creados por `init` deben eliminarse
- Orden: los hooks `after()` corren en orden inverso de declaración — declarar hooks de restauración al final

**Esperado:** La suite de pruebas deja el proyecto en el mismo estado en que lo encontró.

**En caso de fallo:** Si CI reporta archivos sobrantes después de las ejecuciones de prueba, añadir la limpieza al `after()`. Usar `git status` después de las ejecuciones de prueba para detectar estado filtrado.

## Validación

- [ ] El archivo de prueba corre con `node --test cli/test/cli.test.js`
- [ ] Todas las pruebas pasan (0 fallos)
- [ ] Las pruebas smoke cubren `--version`, `--help` y carga del registry
- [ ] Las pruebas de lifecycle verifican create → verify → delete con limpieza
- [ ] Existe al menos una prueba dry-run de adaptador por adaptador implementado
- [ ] Los casos de error prueban códigos de salida no-cero con coincidencia de mensaje
- [ ] Las pruebas de salida JSON parsean salida real (no mockeada)
- [ ] Los hooks after restauran todo el estado modificado por las pruebas

## Errores Comunes

- **Conteos hardcoded que se rompen**: Los totales del registry cambian conforme se añade contenido. Usar regex `\d+` o leer el conteo dinámicamente en lugar de assertear `329 skills`.
- **Pruebas que dependen del orden de ejecución**: `node:test` corre suites en orden de declaración por defecto, pero las pruebas dentro de una suite pueden no. Usar suites de lifecycle (create → verify → delete) dentro de un solo `describe` para garantizar el orden.
- **Limpieza faltante en fallo de prueba**: Si una prueba falla a media-lifecycle, `after()` aún corre. Pero si lanzas en `before()`, las pruebas subsiguientes y `after()` pueden no correr. Mantener `before()` mínimo.
- **Prompts interactivos colgando pruebas**: Los comandos con prompts de confirmación colgarán `execSync`. O hacer pipe de `echo y |` o asegurar que `--yes` siempre se pase en pruebas.
- **Probar con instalaciones reales en CI**: Las pruebas que crean archivos en `.claude/skills/` o `.agents/skills/` modifican el árbol de trabajo. CI puede fallar en verificaciones de "directorio de trabajo sucio". Siempre limpiar.

## Habilidades Relacionadas

- `scaffold-cli-command` — construir los comandos que estas pruebas verifican
- `build-cli-plugin` — construir los adaptadores probados en el Paso 4
- `design-cli-output` — patrones de salida contra los que las pruebas assertan
