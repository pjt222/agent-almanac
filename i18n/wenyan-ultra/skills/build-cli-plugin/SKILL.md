---
name: build-cli-plugin
locale: wenyan-ultra
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

# 建命工插件

以抽象基類模→加新插件/配器於命工之可插構。

## 用

- 加新標框支於命裝器
- 為多標命工建插系
- 擴現配器構以新策變
- 移內容發至用異檔布之框

## 入

- **必**：插所支之框或標（名、配徑、規）
- **必**：基類或插契之徑
- **必**：裝策：`symlink`、`copy`、`file-per-item`、`append-to-file`
- **可**：插處之內容類（如唯技、技+將、全支）
- **可**：範支（案級、全域、兩）

## 行

### 一：定契

基類立諸插當施之介。

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

**靜欄** 定插之身與能：
- `id`：用於 `--framework <id>` 選項與結報
- `displayName`：顯於人讀出
- `strategy`：定內容達標之方
- `contentTypes`：濾此配器受之項

基類未存→先造之。模可縮至任數插件。

**得：** 基類附靜身欄與抽方。

**敗：** 基類有不適諸插之方（如非諸框支 `audit`）→供默施返妥空操。

### 二：擇裝策

| 策 | 用時 | 例 |
|----|------|-----|
| **symlink** | 標直讀源檔。最廉、同步 | Claude Code 讀 `.claude/skills/<name>/` 符連 |
| **copy** | 標需檔於己目。改不傳 | 某 IDE 唯索其目 |
| **file-per-item** | 標每項一檔，有專格 | Cursor `.mdc` 律檔 |
| **append-to-file** | 標讀單指檔 | Aider `CONVENTIONS.md`、Codex `AGENTS.md` |

策定施形：
- **Symlink**：`symlinkSync(source, target)`—處相對對絕對徑
- **Copy**：`cpSync(source, target, { recursive: true })`—處覆
- **File-per-item**：`writeFileSync(target, transform(content))`—或需格轉
- **Append-to-file**：包內容以標冪等插/替/除

**得：** 策已擇附基於標框如何發現內容之清由。

**敗：** 不確→察框文如何發現配或指檔。框讀任意目→默為 symlink。

### 三：施偵

偵告命工案中何框存。

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

偵策：
- **目存**：`.claude/`、`.cursor/`、`.gemini/`
- **配檔**：`opencode.json`、`.aider.conf.yml`
- **指檔**：`AGENTS.md`、`CONVENTIONS.md`
- **全域標**：`~/.openclaw/`、`~/.hermes/`

偵結必返標以令用者解框何以被偵。

**得：** 偵律穩識框而無偽陽。

**敗：** 框無唯標（泛目名）→用多標組或需顯 `--framework`。

### 四：冪等施裝

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

冪等律：
- 標存且未 `--force`→**略**
- `--force` 設→**覆**（先除，後裝）
- **乾行** 必成於 `action: 'created'`
- **返值** 必為 `{ action, path, details? }`

**得：** 裝於標徑造內容，若已存則略，循 `--force` 與 `--dry-run`。

**敗：** symlink 於 Windows/NTFS 敗→退為目連或拷。記退。

### 五：施卸與清

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

清慮：
- 唯除插所裝—絕不刪用者造檔
- append-to-file：除標段，非全檔
- 留父目（他插或用之）

**得：** 卸唯除插內容。

**敗：** 除敗（權、鎖檔）→返誤結非拋。

### 六：施列與審

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

**得：** 列返諸裝項附破連偵。審概健。

**敗：** 標目不存→返空結（非誤—框但無所裝）。

### 七：註插件

```javascript
// In adapters/index.js
import { MyFrameworkAdapter } from './my-framework.js';
register(MyFrameworkAdapter);
```

註令配器得於：
- 自偵（`detectFrameworks()` → `getAdaptersForDetections()`）
- 顯擇（`--framework my-framework`）
- 列（`listAdapters()`）

**得：** 配器現於 `tool detect` 出且可以 `--framework` 標。

**敗：** 配器不現→驗 `static id` 合偵律之 `id` 且 `register()` 已呼。

### 八：書試

```javascript
describe('adapter: my-framework (dry-run)', () => {
  it('targets the correct path', () => {
    const out = run('install create-skill --framework my-framework --dry-run');
    assert.match(out, /\.myframework/i);
  });
});
```

最少試：乾行徑、偵存、內容類支。

**得：** 配器專試證裝徑與行。

**敗：** CI 不偵（無標目）→試中顯用 `--framework`。

## 驗

- [ ] 插件正擴基類
- [ ] 靜欄（`id`、`displayName`、`strategy`、`contentTypes`）已設
- [ ] 偵律識框而無偽陽
- [ ] `install()` 冪等（存則略，循 `--force`）
- [ ] `uninstall()` 唯除插所造
- [ ] `listInstalled()` 偵破符連
- [ ] `audit()` 準報健
- [ ] 插件已註且現於 `tool detect`
- [ ] 乾行試通

## 忌

- **忘相對對絕對 symlink**：案範 symlink 當相對（可攜）。全域範 symlink 當絕對（非依 cwd）。
- **不處缺父目**：造內容前必 `mkdirSync(dir, { recursive: true })`。
- **append-to-file 無標**：無冪等標（`<!-- start:id -->` / `<!-- end:id -->`）→重裝複內容。必包所附內容。
- **偵偽陽**：泛目名（如 `.config/`）或合多框。用目中專檔標。
- **忘 `supports()` 察**：裝器呼 `supports(item.type)` 前派。`contentTypes` 誤→配器默略項。

## 參

- `scaffold-cli-command` — 建用此插之命
- `test-cli-application` — 命工試模含配器試
- `design-cli-output` — 裝/卸結之端出
