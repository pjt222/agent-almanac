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
---

# Build a CLI Plugin

Add a new plugin or adapter to a CLI tool's pluggable architecture using the abstract base class pattern.

## When to Use

- Adding support for a new target framework to a CLI installer
- Building a plugin system for a multi-target command-line tool
- Extending an existing adapter architecture with a new strategy variant
- Porting content delivery to a framework that uses a different file layout

## Inputs

- **Required**: Framework or target the plugin supports (name, config paths, conventions)
- **Required**: Path to the base class or plugin contract
- **Required**: Installation strategy: `symlink`, `copy`, `file-per-item`, or `append-to-file`
- **Optional**: Content types the plugin handles (e.g., skills only, skills + agents, full support)
- **Optional**: Scope support (project-level, global, both)

## Procedure

### Step 1: Define the Contract

The base class establishes the interface all plugins must implement:

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

**Static fields** define the plugin's identity and capabilities:
- `id`: Used in `--framework <id>` option and result reporting
- `displayName`: Shown in human-readable output
- `strategy`: Determines how content reaches the target
- `contentTypes`: Filters which items this adapter receives

If the base class does not exist yet, create it first. The pattern scales to any number of plugins.

**Expected:** A base class with static identity fields and abstract methods.

**On failure:** If the base class has methods that don't apply to all plugins (e.g., not all frameworks support `audit`), provide default implementations that return sensible no-ops.

### Step 2: Choose the Installation Strategy

| Strategy | When to use | Example |
|----------|------------|---------|
| **symlink** | Target reads source files directly. Cheapest, stays in sync. | Claude Code reads `.claude/skills/<name>/` symlinks |
| **copy** | Target needs files in its own directory. Modifications don't propagate. | Some IDEs index only their own dirs |
| **file-per-item** | Target expects one file per item with specific format. | Cursor `.mdc` rules files |
| **append-to-file** | Target reads a single instructions file. | Aider `CONVENTIONS.md`, Codex `AGENTS.md` |

Strategy determines the implementation shape:
- **Symlink**: `symlinkSync(source, target)` — handle relative vs. absolute paths
- **Copy**: `cpSync(source, target, { recursive: true })` — handle overwrites
- **File-per-item**: `writeFileSync(target, transform(content))` — may need format conversion
- **Append-to-file**: Wrap content in markers for idempotent insert/replace/remove

**Expected:** Strategy selected with clear rationale based on how the target framework discovers content.

**On failure:** If unsure, check the framework's documentation for how it discovers configuration or instruction files. Default to symlink if the framework reads arbitrary directories.

### Step 3: Implement Detection

Detection tells the CLI which frameworks are present in a project:

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

Detection strategies:
- **Directory presence**: `.claude/`, `.cursor/`, `.gemini/`
- **Config file**: `opencode.json`, `.aider.conf.yml`
- **Instruction file**: `AGENTS.md`, `CONVENTIONS.md`
- **Global markers**: `~/.openclaw/`, `~/.hermes/`

Always return the marker in the detection result so users can understand why a framework was detected.

**Expected:** A detection rule that reliably identifies the framework without false positives.

**On failure:** If the framework has no unique marker (generic directory name), use a combination of markers or require explicit `--framework` specification.

### Step 4: Implement Install with Idempotency

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

Idempotency rules:
- **Skip** if target exists and `--force` is not set
- **Overwrite** if `--force` is set (remove first, then install)
- **Dry-run** always succeeds with `action: 'created'`
- **Return value** must always be `{ action, path, details? }`

**Expected:** Install creates content at the target path, skips if already present, respects `--force` and `--dry-run`.

**On failure:** If symlink creation fails on Windows/NTFS, fall back to directory junction or copy. Log the fallback.

### Step 5: Implement Uninstall with Cleanup

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

Cleanup considerations:
- Remove only what the plugin installed — never delete user-created files
- For append-to-file: remove the marked section, not the entire file
- Leave parent directories intact (other plugins may use them)

**Expected:** Uninstall removes only the plugin's content and nothing else.

**On failure:** If removal fails (permissions, locked file), return an error result instead of throwing.

### Step 6: Implement Listing and Audit

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

**Expected:** Listing returns all installed items with broken-link detection. Audit summarizes health.

**On failure:** If the target directory doesn't exist, return empty results (not an error — the framework just has nothing installed).

### Step 7: Register the Plugin

```javascript
// In adapters/index.js
import { MyFrameworkAdapter } from './my-framework.js';
register(MyFrameworkAdapter);
```

Registration makes the adapter available to:
- Auto-detection (`detectFrameworks()` → `getAdaptersForDetections()`)
- Explicit selection (`--framework my-framework`)
- Listing (`listAdapters()`)

**Expected:** The adapter appears in `tool detect` output and can be targeted with `--framework`.

**On failure:** If the adapter doesn't appear, verify `static id` matches the detection rule's `id` and that `register()` was called.

### Step 8: Write Tests

```javascript
describe('adapter: my-framework (dry-run)', () => {
  it('targets the correct path', () => {
    const out = run('install create-skill --framework my-framework --dry-run');
    assert.match(out, /\.myframework/i);
  });
});
```

Test at minimum: dry-run path, detection presence, and content type support.

**Expected:** Adapter-specific tests confirm the installation path and behavior.

**On failure:** If the framework isn't detected in CI (no marker directory), use `--framework` explicitly in tests.

## Validation

- [ ] Plugin extends the base class correctly
- [ ] Static fields (`id`, `displayName`, `strategy`, `contentTypes`) are set
- [ ] Detection rule identifies the framework without false positives
- [ ] `install()` is idempotent (skip if exists, respect `--force`)
- [ ] `uninstall()` removes only plugin-created content
- [ ] `listInstalled()` detects broken symlinks
- [ ] `audit()` reports health accurately
- [ ] Plugin is registered and appears in `tool detect`
- [ ] Dry-run tests pass

## Common Pitfalls

- **Forgetting relative vs. absolute symlinks**: Project-scope symlinks should be relative (portable). Global-scope symlinks should be absolute (not dependent on cwd).
- **Not handling missing parent directories**: Always `mkdirSync(dir, { recursive: true })` before creating content.
- **Append-to-file without markers**: Without idempotent markers (`<!-- start:id -->` / `<!-- end:id -->`), repeated installs duplicate content. Always wrap appended content.
- **Detection false positives**: A generic directory name (e.g., `.config/`) may match multiple frameworks. Use specific file markers inside the directory.
- **Forgetting `supports()` check**: The installer calls `supports(item.type)` before dispatching. If `contentTypes` is wrong, the adapter silently skips items.

## Related Skills

- `scaffold-cli-command` — build the CLI commands that use this plugin
- `test-cli-application` — testing patterns for CLI tools including adapter tests
- `design-cli-output` — terminal output for install/uninstall results
