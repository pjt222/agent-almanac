---
name: build-cli-plugin
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Add plugin/adapter to CLI tool's pluggable arch via abstract base class.

## Use When

- Add support for new target framework to CLI installer
- Build plugin system for multi-target CLI tool
- Extend existing adapter arch w/ new strategy variant
- Port content delivery to framework w/ diff file layout

## In

- **Required**: Framework/target plugin supports (name, config paths, conventions)
- **Required**: Path to base class or plugin contract
- **Required**: Install strategy: `symlink`, `copy`, `file-per-item`, `append-to-file`
- **Optional**: Content types plugin handles (skills only, skills+agents, full)
- **Optional**: Scope support (project, global, both)

## Do

### Step 1: Define Contract

Base class establishes interface all plugins implement:

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

**Static fields** define identity + capabilities:
- `id`: Used in `--framework <id>` + result reporting
- `displayName`: Shown in human-readable out
- `strategy`: How content reaches target
- `contentTypes`: Filter which items adapter receives

Base class missing → create first. Pattern scales to any # of plugins.

**→** Base class w/ static identity fields + abstract methods.

**If err:** Methods don't apply to all plugins (not all support `audit`) → default impls that return sensible no-ops.

### Step 2: Pick Strategy

| Strategy | When to use | Example |
|----------|------------|---------|
| **symlink** | Target reads source files directly. Cheapest, stays in sync. | Claude Code reads `.claude/skills/<name>/` symlinks |
| **copy** | Target needs files in its own directory. Modifications don't propagate. | Some IDEs index only their own dirs |
| **file-per-item** | Target expects one file per item with specific format. | Cursor `.mdc` rules files |
| **append-to-file** | Target reads a single instructions file. | Aider `CONVENTIONS.md`, Codex `AGENTS.md` |

Strategy → impl shape:
- **Symlink**: `symlinkSync(source, target)` — handle rel vs abs paths
- **Copy**: `cpSync(source, target, { recursive: true })` — handle overwrites
- **File-per-item**: `writeFileSync(target, transform(content))` — maybe format convert
- **Append-to-file**: Wrap in markers for idempotent insert/replace/remove

**→** Strategy picked w/ clear rationale based on how target discovers content.

**If err:** Unsure → check framework docs for how it discovers config/instruction files. Default symlink if framework reads arbitrary dirs.

### Step 3: Impl Detection

Detection tells CLI which frameworks present in project:

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

Strategies:
- **Dir presence**: `.claude/`, `.cursor/`, `.gemini/`
- **Config file**: `opencode.json`, `.aider.conf.yml`
- **Instruction file**: `AGENTS.md`, `CONVENTIONS.md`
- **Global markers**: `~/.openclaw/`, `~/.hermes/`

Always return marker in result so users see why framework detected.

**→** Detection rule reliably IDs framework, no false positives.

**If err:** No unique marker (generic dir) → combine markers or require explicit `--framework`.

### Step 4: Impl Install w/ Idempotency

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
- **Skip** if target exists + no `--force`
- **Overwrite** if `--force` (remove then install)
- **Dry-run** always succeeds w/ `action: 'created'`
- **Return** always `{ action, path, details? }`

**→** Install creates at target, skips if present, respects `--force` + `--dry-run`.

**If err:** Symlink fails on Win/NTFS → fall back to dir junction or copy. Log fallback.

### Step 5: Impl Uninstall w/ Cleanup

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

Cleanup:
- Remove only what plugin installed — never user files
- Append-to-file: remove marked section, not full file
- Leave parent dirs (other plugins may use)

**→** Uninstall removes only plugin content, nothing else.

**If err:** Removal fails (perms, locked) → return err result, don't throw.

### Step 6: Impl List + Audit

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

**→** List returns installed items + broken-link detection. Audit summarizes health.

**If err:** Target dir doesn't exist → empty results (not err — framework has nothing installed).

### Step 7: Register Plugin

```javascript
// In adapters/index.js
import { MyFrameworkAdapter } from './my-framework.js';
register(MyFrameworkAdapter);
```

Registration → adapter available for:
- Auto-detection (`detectFrameworks()` → `getAdaptersForDetections()`)
- Explicit select (`--framework my-framework`)
- Listing (`listAdapters()`)

**→** Adapter appears in `tool detect` out + targetable w/ `--framework`.

**If err:** Not appearing → verify `static id` matches detection rule `id` + `register()` called.

### Step 8: Tests

```javascript
describe('adapter: my-framework (dry-run)', () => {
  it('targets the correct path', () => {
    const out = run('install create-skill --framework my-framework --dry-run');
    assert.match(out, /\.myframework/i);
  });
});
```

Min: dry-run path, detection presence, content type support.

**→** Adapter-specific tests confirm path + behavior.

**If err:** Framework not detected in CI (no marker dir) → use `--framework` explicitly.

## Check

- [ ] Extends base class correctly
- [ ] Static fields (`id`, `displayName`, `strategy`, `contentTypes`) set
- [ ] Detection rule IDs framework, no false positives
- [ ] `install()` idempotent (skip if exists, respect `--force`)
- [ ] `uninstall()` removes only plugin content
- [ ] `listInstalled()` detects broken symlinks
- [ ] `audit()` reports health accurately
- [ ] Plugin registered + appears in `tool detect`
- [ ] Dry-run tests pass

## Traps

- **Relative vs abs symlinks**: Project-scope relative (portable). Global-scope absolute (not cwd-dep)
- **Missing parent dirs**: Always `mkdirSync(dir, { recursive: true })` before create
- **Append w/o markers**: No idempotent markers → repeats duplicate. Always wrap
- **Detection false positives**: Generic dir name (`.config/`) may match multiple. Use specific file markers inside
- **Skip `supports()` check**: Installer calls `supports(item.type)` before dispatching. Wrong `contentTypes` → silently skips

## →

- `scaffold-cli-command` — build CLI cmds that use plugin
- `test-cli-application` — testing patterns for CLI + adapter tests
- `design-cli-output` — terminal out for install/uninstall results
