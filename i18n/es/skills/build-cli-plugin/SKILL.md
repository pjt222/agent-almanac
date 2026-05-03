---
name: build-cli-plugin
description: >
  Build a plugin or adapter for a CLI tool using the abstract base class
  pattern. Covers defining the contract (static fields, required methods),
  choosing an installation strategy (symlink, copy, append-to-file),
  implementing detection, install/uninstall with idempotency, listing,
  auditing, and registering the plugin. Use when adding support for a
  new framework to a CLI installer, building a plugin system for any
  multi-target tool, or extending an existing adapter architecture.
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
    - plugin
    - adapter
    - architecture
    - nodejs
  locale: es
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Build a CLI Plugin

Añadir un nuevo plugin o adaptador a la arquitectura conectable de una herramienta CLI usando el patrón de clase base abstracta.

## Cuándo Usar

- Añadir soporte para un nuevo framework objetivo a un instalador CLI
- Construir un sistema de plugins para una herramienta de línea de comandos multi-objetivo
- Extender una arquitectura de adaptadores existente con una nueva variante de estrategia
- Portar entrega de contenido a un framework que usa una disposición de archivos diferente

## Entradas

- **Requerido**: Framework u objetivo que el plugin soporta (nombre, rutas de configuración, convenciones)
- **Requerido**: Ruta a la clase base o contrato del plugin
- **Requerido**: Estrategia de instalación: `symlink`, `copy`, `file-per-item`, o `append-to-file`
- **Opcional**: Tipos de contenido que el plugin maneja (p. ej., solo skills, skills + agentes, soporte completo)
- **Opcional**: Soporte de scope (a nivel de proyecto, global, ambos)

## Procedimiento

### Paso 1: Definir el Contrato

La clase base establece la interfaz que todos los plugins deben implementar:

```javascript
export class FrameworkAdapter {
  static id = 'base';            // Unique identifier
  static displayName = 'Base';   // Human-readable name
  static strategy = 'symlink';   // Installation strategy
  static contentTypes = ['skill']; // What this adapter handles

  async detect(projectDir) { return false; }
  getTargetPath(projectDir, scope) { throw new Error('Not implemented'); }
  async install(item, projectDir, scope, options) { throw new Error('Not implemented'); }
  async uninstall(item, projectDir, scope, options) { throw new Error('Not implemented'); }
  async listInstalled(projectDir, scope) { return []; }
  async audit(projectDir, scope) { return { framework: this.constructor.displayName, ok: [], warnings: [], errors: [] }; }
  supports(contentType) { return this.constructor.contentTypes.includes(contentType); }
}
```

**Campos estáticos** definen la identidad y capacidades del plugin:
- `id`: Usado en la opción `--framework <id>` y reporte de resultados
- `displayName`: Mostrado en la salida legible para humanos
- `strategy`: Determina cómo el contenido llega al objetivo
- `contentTypes`: Filtra qué items recibe este adaptador

Si la clase base no existe aún, crearla primero. El patrón escala a cualquier número de plugins.

**Esperado:** Una clase base con campos estáticos de identidad y métodos abstractos.

**En caso de fallo:** Si la clase base tiene métodos que no aplican a todos los plugins (p. ej., no todos los frameworks soportan `audit`), proporcionar implementaciones por defecto que retornen no-ops sensatos.

### Paso 2: Elegir la Estrategia de Instalación

| Estrategia | Cuándo usar | Ejemplo |
|----------|------------|---------|
| **symlink** | El objetivo lee archivos fuente directamente. Más barato, se mantiene en sincronía. | Claude Code lee symlinks `.claude/skills/<name>/` |
| **copy** | El objetivo necesita archivos en su propio directorio. Las modificaciones no se propagan. | Algunos IDEs solo indexan sus propios directorios |
| **file-per-item** | El objetivo espera un archivo por item con formato específico. | Archivos de reglas `.mdc` de Cursor |
| **append-to-file** | El objetivo lee un único archivo de instrucciones. | `CONVENTIONS.md` de Aider, `AGENTS.md` de Codex |

La estrategia determina la forma de la implementación:
- **Symlink**: `symlinkSync(source, target)` — manejar rutas relativas vs. absolutas
- **Copy**: `cpSync(source, target, { recursive: true })` — manejar sobrescrituras
- **File-per-item**: `writeFileSync(target, transform(content))` — puede necesitar conversión de formato
- **Append-to-file**: Envolver contenido en marcadores para inserción/reemplazo/eliminación idempotente

**Esperado:** Estrategia seleccionada con justificación clara basada en cómo el framework objetivo descubre contenido.

**En caso de fallo:** Si no se está seguro, verificar la documentación del framework para ver cómo descubre archivos de configuración o instrucción. Por defecto symlink si el framework lee directorios arbitrarios.

### Paso 3: Implementar la Detección

La detección le indica al CLI qué frameworks están presentes en un proyecto:

```javascript
// In detector.js — each rule checks for a filesystem marker
const RULES = [
  {
    id: 'my-framework',
    displayName: 'My Framework',
    check: (dir) => existsSync(resolve(dir, '.myframework/')),
    marker: '.myframework/',
    scope: 'project',
  },
];
```

Estrategias de detección:
- **Presencia de directorio**: `.claude/`, `.cursor/`, `.gemini/`
- **Archivo de configuración**: `opencode.json`, `.aider.conf.yml`
- **Archivo de instrucción**: `AGENTS.md`, `CONVENTIONS.md`
- **Marcadores globales**: `~/.openclaw/`, `~/.hermes/`

Siempre devolver el marcador en el resultado de detección para que los usuarios puedan entender por qué se detectó un framework.

**Esperado:** Una regla de detección que identifica el framework de manera confiable sin falsos positivos.

**En caso de fallo:** Si el framework no tiene un marcador único (nombre de directorio genérico), usar una combinación de marcadores o requerir especificación explícita de `--framework`.

### Paso 4: Implementar Install con Idempotencia

```javascript
async install(item, projectDir, scope, options) {
  const targetDir = this.getTargetPath(projectDir, scope);
  const targetPath = resolve(targetDir, item.id);

  // Idempotency: skip if already installed (unless force)
  if (existsSync(targetPath) && !options.force) {
    return { action: 'skipped', path: targetPath };
  }

  if (options.dryRun) {
    return { action: 'created', path: targetPath, details: 'dry-run' };
  }

  // Ensure parent directory exists
  mkdirSync(targetDir, { recursive: true });

  // Strategy-specific installation
  if (this.constructor.strategy === 'symlink') {
    const relPath = relative(targetDir, item.sourceDir);
    symlinkSync(relPath, targetPath);
  } else if (this.constructor.strategy === 'copy') {
    cpSync(item.sourceDir, targetPath, { recursive: true });
  }

  return { action: 'created', path: targetPath };
}
```

Reglas de idempotencia:
- **Saltar** si el objetivo existe y `--force` no está establecido
- **Sobrescribir** si `--force` está establecido (eliminar primero, luego instalar)
- **Dry-run** siempre tiene éxito con `action: 'created'`
- **Valor de retorno** debe ser siempre `{ action, path, details? }`

**Esperado:** Install crea contenido en la ruta objetivo, salta si ya está presente, respeta `--force` y `--dry-run`.

**En caso de fallo:** Si la creación de symlink falla en Windows/NTFS, recurrir a junction de directorio o copia. Registrar el respaldo.

### Paso 5: Implementar Uninstall con Limpieza

```javascript
async uninstall(item, projectDir, scope, options) {
  const targetDir = this.getTargetPath(projectDir, scope);
  const targetPath = resolve(targetDir, item.id);

  if (!existsSync(targetPath)) {
    return { action: 'skipped', path: targetPath };
  }

  if (options.dryRun) {
    return { action: 'removed', path: targetPath };
  }

  // Remove the installed content
  rmSync(targetPath, { recursive: true });

  return { action: 'removed', path: targetPath };
}
```

Consideraciones de limpieza:
- Eliminar solo lo que el plugin instaló — nunca borrar archivos creados por el usuario
- Para append-to-file: eliminar la sección marcada, no el archivo entero
- Dejar los directorios padres intactos (otros plugins pueden usarlos)

**Esperado:** Uninstall elimina solo el contenido del plugin y nada más.

**En caso de fallo:** Si la eliminación falla (permisos, archivo bloqueado), devolver un resultado de error en lugar de lanzar excepción.

### Paso 6: Implementar Listado y Auditoría

```javascript
async listInstalled(projectDir, scope) {
  const targetDir = this.getTargetPath(projectDir, scope);
  if (!existsSync(targetDir)) return [];

  const entries = readdirSync(targetDir);
  return entries.map(name => {
    const fullPath = resolve(targetDir, name);
    const broken = lstatSync(fullPath).isSymbolicLink()
      && !existsSync(fullPath);
    return { id: name, type: 'skill', broken };
  });
}

async audit(projectDir, scope) {
  const items = await this.listInstalled(projectDir, scope);
  const ok = items.filter(i => !i.broken);
  const broken = items.filter(i => i.broken);
  return {
    framework: this.constructor.displayName,
    ok: [`${ok.length} skills installed`],
    warnings: [],
    errors: broken.map(i => `Broken: ${i.id}`),
  };
}
```

**Esperado:** El listado retorna todos los items instalados con detección de enlaces rotos. La auditoría resume la salud.

**En caso de fallo:** Si el directorio objetivo no existe, retornar resultados vacíos (no es un error — el framework simplemente no tiene nada instalado).

### Paso 7: Registrar el Plugin

```javascript
// In adapters/index.js
import { MyFrameworkAdapter } from './my-framework.js';
register(MyFrameworkAdapter);
```

El registro hace que el adaptador esté disponible para:
- Auto-detección (`detectFrameworks()` → `getAdaptersForDetections()`)
- Selección explícita (`--framework my-framework`)
- Listado (`listAdapters()`)

**Esperado:** El adaptador aparece en la salida de `tool detect` y puede ser objetivo de `--framework`.

**En caso de fallo:** Si el adaptador no aparece, verificar que `static id` coincida con el `id` de la regla de detección y que `register()` haya sido llamado.

### Paso 8: Escribir Pruebas

```javascript
describe('adapter: my-framework (dry-run)', () => {
  it('targets the correct path', () => {
    const out = run('install create-skill --framework my-framework --dry-run');
    assert.match(out, /\.myframework/i);
  });
});
```

Probar al mínimo: ruta de dry-run, presencia de detección y soporte de tipo de contenido.

**Esperado:** Pruebas específicas del adaptador confirman la ruta de instalación y el comportamiento.

**En caso de fallo:** Si el framework no se detecta en CI (sin directorio marcador), usar `--framework` explícitamente en las pruebas.

## Validación

- [ ] El plugin extiende la clase base correctamente
- [ ] Los campos estáticos (`id`, `displayName`, `strategy`, `contentTypes`) están establecidos
- [ ] La regla de detección identifica el framework sin falsos positivos
- [ ] `install()` es idempotente (saltar si existe, respetar `--force`)
- [ ] `uninstall()` elimina solo contenido creado por el plugin
- [ ] `listInstalled()` detecta symlinks rotos
- [ ] `audit()` reporta la salud con precisión
- [ ] El plugin está registrado y aparece en `tool detect`
- [ ] Las pruebas de dry-run pasan

## Errores Comunes

- **Olvidar symlinks relativos vs. absolutos**: Los symlinks de scope de proyecto deben ser relativos (portables). Los symlinks de scope global deben ser absolutos (no dependientes del cwd).
- **No manejar directorios padres faltantes**: Siempre `mkdirSync(dir, { recursive: true })` antes de crear contenido.
- **Append-to-file sin marcadores**: Sin marcadores idempotentes (`<!-- start:id -->` / `<!-- end:id -->`), las instalaciones repetidas duplican contenido. Siempre envolver el contenido añadido.
- **Falsos positivos de detección**: Un nombre de directorio genérico (p. ej., `.config/`) puede coincidir con múltiples frameworks. Usar marcadores de archivo específicos dentro del directorio.
- **Olvidar la verificación `supports()`**: El instalador llama a `supports(item.type)` antes de despachar. Si `contentTypes` es incorrecto, el adaptador salta items silenciosamente.

## Habilidades Relacionadas

- `scaffold-cli-command` — construir los comandos CLI que usan este plugin
- `test-cli-application` — patrones de prueba para herramientas CLI incluyendo pruebas de adaptador
- `design-cli-output` — salida del terminal para resultados de install/uninstall
