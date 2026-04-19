---
name: build-cli-plugin
locale: wenyan
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

# 建 CLI 之插件

以抽象基類之式加新插件或適配於 CLI 工具之可插架。

## 用時

- 加新標框架於 CLI 裝器
- 為多標之命行工具建插件系
- 擴現有適配架以新策之變
- 移內容之交於用異檔佈之框架

## 入

- **必要**：插件所支之框架或標（名、設路、規）
- **必要**：基類或插件契之路
- **必要**：裝略：`symlink`、`copy`、`file-per-item`、或 `append-to-file`
- **可選**：插件所理之內容類（如只技、技加人、全支）
- **可選**：範支（項目級、全局、二者）

## 法

### 第一步：定契

基類立諸插件必施之介：

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

**靜態欄**定插件之身與能：
- `id`：用於 `--framework <id>` 選與果報
- `displayName`：人讀之輸出所見
- `strategy`：定內容達標之法
- `contentTypes`：篩此適配所收之項

若基類未建，先建之。此式可擴至任數之插件。

**得：** 基類備，含靜身欄與抽象法。

**敗則：** 若基類有法不適諸插件（如諸框架未皆支 `audit`），供默實為合理之無作。

### 第二步：擇裝略

| Strategy | When to use | Example |
|----------|------------|---------|
| **symlink** | Target reads source files directly. Cheapest, stays in sync. | Claude Code reads `.claude/skills/<name>/` symlinks |
| **copy** | Target needs files in its own directory. Modifications don't propagate. | Some IDEs index only their own dirs |
| **file-per-item** | Target expects one file per item with specific format. | Cursor `.mdc` rules files |
| **append-to-file** | Target reads a single instructions file. | Aider `CONVENTIONS.md`, Codex `AGENTS.md` |

略決施之形：
- **Symlink**：`symlinkSync(source, target)` — 理相對與絕對之路
- **Copy**：`cpSync(source, target, { recursive: true })` — 理覆寫
- **File-per-item**：`writeFileSync(target, transform(content))` — 或須格式轉
- **Append-to-file**：以標裹內容以冪等插/換/刪

**得：** 已擇略，附清由，據標框架如何察內容。

**敗則：** 若不定，察框架之文如何察設或指檔。若框架讀任目，默為 symlink。

### 第三步：施察

察告 CLI 項目中何框架存：

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

察之略：
- **目存**：`.claude/`、`.cursor/`、`.gemini/`
- **設檔**：`opencode.json`、`.aider.conf.yml`
- **指檔**：`AGENTS.md`、`CONVENTIONS.md`
- **全局標**：`~/.openclaw/`、`~/.hermes/`

恆於察果中返標，令用者知框架何以被察。

**得：** 察律穩識框架而無誤報。

**敗則：** 若框架無獨標（泛目名），合諸標用之，或須明之 `--framework` 指。

### 第四步：施裝，帶冪等

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

冪等之律：
- 標存且未 `--force`：**略**
- 設 `--force`：**覆**（先刪而後裝）
- 乾行：恆成功，返 `action: 'created'`
- 返值：恆為 `{ action, path, details? }`

**得：** 裝於標路建內容，若存則略，敬 `--force` 與 `--dry-run`。

**敗則：** Windows/NTFS 上 symlink 建敗者，降為目 junction 或 copy。記降級。

### 第五步：施卸，帶清

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

清之考：
- 只刪插件所裝者——勿刪用者所作之檔
- append-to-file：刪標區，非全檔
- 留父目（他插件或用之）

**得：** 卸只刪插件之內容，他無損。

**敗則：** 若刪敗（權、鎖），返錯果而非拋。

### 第六步：施列與察

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

**得：** 列返諸裝項，含斷鏈之察。察總其康。

**敗則：** 若標目不存，返空果（非錯——乃框架未裝）。

### 第七步：註插件

```javascript
// In adapters/index.js
import { MyFrameworkAdapter } from './my-framework.js';
register(MyFrameworkAdapter);
```

註令適配可用於：
- 自動察（`detectFrameworks()` → `getAdaptersForDetections()`）
- 明擇（`--framework my-framework`）
- 列（`listAdapters()`）

**得：** 適配見於 `tool detect` 之輸出，可以 `--framework` 指之。

**敗則：** 若適配不現，驗 `static id` 合察律之 `id` 且 `register()` 已呼。

### 第八步：書測

```javascript
describe('adapter: my-framework (dry-run)', () => {
  it('targets the correct path', () => {
    const out = run('install create-skill --framework my-framework --dry-run');
    assert.match(out, /\.myframework/i);
  });
});
```

至少測：乾行之路、察之存、內容類之支。

**得：** 適配特測證裝之路與行。

**敗則：** CI 中無標目而框架不察者，測中明用 `--framework`。

## 驗

- [ ] 插件正擴基類
- [ ] 靜欄（`id`、`displayName`、`strategy`、`contentTypes`）已設
- [ ] 察律識框架而無誤報
- [ ] `install()` 冪等（若存則略，敬 `--force`）
- [ ] `uninstall()` 只刪插件所建者
- [ ] `listInstalled()` 察斷 symlink
- [ ] `audit()` 準報康
- [ ] 插件已註，現於 `tool detect`
- [ ] 乾行測過

## 陷

- **忘相對與絕對 symlink**：項目範之 symlink 宜相對（可攜）。全範之 symlink 宜絕對（不依 cwd）
- **未理缺父目**：恆 `mkdirSync(dir, { recursive: true })` 於建內容前
- **append-to-file 無標**：無冪等標（`<!-- start:id -->` / `<!-- end:id -->`），反覆裝重內容。恆以標裹附之內容
- **察誤報**：泛目名（如 `.config/`）或合多框架。用目內之特檔標
- **忘 `supports()` 察**：裝器於派前呼 `supports(item.type)`。若 `contentTypes` 誤，適配默略項

## 參

- `scaffold-cli-command` — 建用此插件之 CLI 命
- `test-cli-application` — CLI 工具之測模式，含適配測
- `design-cli-output` — 裝卸果之終端輸出
