---
name: build-cli-plugin
locale: wenyan-lite
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

以抽象基類模式為 CLI 工具之可插架構加新插件或適配器。

## 適用時機

- 為 CLI 安裝器加新目標框架之支援
- 為多目標命令列工具建插件系統
- 以新策略變體擴既有適配器架構
- 將內容交付移植至用異文件佈局之框架

## 輸入

- **必要**：插件所支之框架或目標（名、配置路徑、約定）
- **必要**：基類或插件合同之路徑
- **必要**：安裝策略：`symlink`、`copy`、`file-per-item` 或 `append-to-file`
- **選擇性**：插件處之內容類型（如僅 skills、skills + agents、全支援）
- **選擇性**：範圍支援（項目級、全域、二者）

## 步驟

### 步驟一：定合同

基類立諸插件須實作之介面：

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

**靜態欄位**定插件之身與能：
- `id`：用於 `--framework <id>` 選項與結果報告
- `displayName`：於人可讀輸出所示
- `strategy`：定內容如何至目標
- `contentTypes`：濾此適配器所接之項

若基類尚不存，先創之。此模式可伸至任多插件。

**預期：** 含靜身欄位與抽象方法之基類。

**失敗時：** 若基類有方法不適於諸插件（如非諸框架皆支 `audit`），提預設實作返合理無操作。

### 步驟二：擇安裝策略

| Strategy | When to use | Example |
|----------|------------|---------|
| **symlink** | 目標直讀源文件。最廉、恆同步。 | Claude Code 讀 `.claude/skills/<name>/` 之 symlinks |
| **copy** | 目標需文件於其自目錄。改不傳。 | 某些 IDE 只索其自目錄 |
| **file-per-item** | 目標期每項一文件，具特定格式。 | Cursor `.mdc` 規則文件 |
| **append-to-file** | 目標讀單指令文件。 | Aider `CONVENTIONS.md`、Codex `AGENTS.md` |

策略定實作之形：
- **Symlink**：`symlinkSync(source, target)`——處相對對絕對路徑
- **Copy**：`cpSync(source, target, { recursive: true })`——處覆寫
- **File-per-item**：`writeFileSync(target, transform(content))`——或需格式轉
- **Append-to-file**：包內容於標記以冪等插／改／刪

**預期：** 擇策略附明理，基於目標框架如何發現內容。

**失敗時：** 若不確，查框架之文檔察其如何發現配置或指令文件。若框架讀任意目錄，預設用 symlink。

### 步驟三：實作偵測

偵測告 CLI 項目中有何框架：

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

偵測策略：
- **目錄存**：`.claude/`、`.cursor/`、`.gemini/`
- **配置文件**：`opencode.json`、`.aider.conf.yml`
- **指令文件**：`AGENTS.md`、`CONVENTIONS.md`
- **全域標記**：`~/.openclaw/`、`~/.hermes/`

恆於偵測果返標記，以使用戶可解框架何以被偵測。

**預期：** 偵測規則可靠辨框架而無偽陽。

**失敗時：** 若框架無唯一標記（泛目錄名），用標記之合或求明之 `--framework` 指定。

### 步驟四：實作冪等之安裝

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

冪等之則：
- **略**若目標存且 `--force` 未設
- **覆**若 `--force` 已設（先刪再裝）
- **乾跑**恆以 `action: 'created'` 成
- **返值**恆須為 `{ action, path, details? }`

**預期：** 安裝於目標路徑建內容，既存則略，重 `--force` 與 `--dry-run`。

**失敗時：** 若 Windows/NTFS 上 symlink 建失，退為目錄 junction 或 copy。記此退。

### 步驟五：實作清理之卸載

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

清理之慮：
- 只刪插件所裝——永勿刪用戶所創之文件
- 對 append-to-file：刪所標之段，非全文件
- 留父目錄完整（他插件或用之）

**預期：** 卸載只刪插件之內容而無他。

**失敗時：** 若刪失（權限、鎖文件），返錯結果而非拋。

### 步驟六：實作列舉與審

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

**預期：** 列舉返諸裝項，附破鏈偵測。審總健康。

**失敗時：** 若目標目錄不存，返空（非錯——框架只是無裝）。

### 步驟七：註冊插件

```javascript
// In adapters/index.js
import { MyFrameworkAdapter } from './my-framework.js';
register(MyFrameworkAdapter);
```

註冊令適配器可用於：
- 自動偵測（`detectFrameworks()` → `getAdaptersForDetections()`）
- 明擇（`--framework my-framework`）
- 列舉（`listAdapters()`）

**預期：** 適配器於 `tool detect` 輸出顯，可以 `--framework` 為標。

**失敗時：** 若適配器不顯，驗 `static id` 合偵測規則之 `id` 且 `register()` 已呼。

### 步驟八：書測試

```javascript
describe('adapter: my-framework (dry-run)', () => {
  it('targets the correct path', () => {
    const out = run('install create-skill --framework my-framework --dry-run');
    assert.match(out, /\.myframework/i);
  });
});
```

至少測：乾跑路徑、偵測存、內容類型支援。

**預期：** 適配器專之測確安裝路徑與行為。

**失敗時：** 若框架於 CI 中未偵（無標記目錄），測中明用 `--framework`。

## 驗證

- [ ] 插件正擴基類
- [ ] 靜態欄位（`id`、`displayName`、`strategy`、`contentTypes`）已設
- [ ] 偵測規則辨框架而無偽陽
- [ ] `install()` 冪等（存則略、重 `--force`）
- [ ] `uninstall()` 只刪插件所創內容
- [ ] `listInstalled()` 偵破 symlinks
- [ ] `audit()` 準報健康
- [ ] 插件已註，於 `tool detect` 顯
- [ ] 乾跑測過

## 常見陷阱

- **忽相對對絕對 symlinks**：項目範圍之 symlinks 當為相對（可移）。全域範圍之 symlinks 當為絕對（不依 cwd）。
- **未處父目錄之缺**：恆 `mkdirSync(dir, { recursive: true })` 後創內容。
- **無標記之 append-to-file**：無冪等之標記（`<!-- start:id -->` / `<!-- end:id -->`），重裝複內容。恆包附加之內容。
- **偵測之偽陽**：泛目錄名（如 `.config/`）或配諸框架。用目錄中之專文件標記。
- **忽 `supports()` 之查**：安裝器呼 `supports(item.type)` 後派。若 `contentTypes` 誤，適配器默略項。

## 相關技能

- `scaffold-cli-command` — 建用此插件之 CLI 命令
- `test-cli-application` — CLI 工具之測模式，含適配器測
- `design-cli-output` — 安／卸載結果之終端輸出
