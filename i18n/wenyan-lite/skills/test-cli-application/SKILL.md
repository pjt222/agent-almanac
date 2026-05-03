---
name: test-cli-application
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
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
---

# 測試 CLI 應用

以內建 `node:test` 模組與 `execSync` 為 Node.js CLI 寫整合測試。

## 適用時機

- 為既有 CLI 應用加測試
- 測試新建之命令
- 驗證適配器／插件於目標框架間之行為
- 設立驗證 CLI 正確性之 CI
- 重構 CLI 內部後捕回歸

## 輸入

- **必要**：CLI 入點之路徑（如 `cli/index.js`）
- **必要**：欲測之命令
- **選擇性**：欲測之框架適配器（dry-run 模式）
- **選擇性**：清理需求（測試所建之檔／符號連結）

## 步驟

### 步驟一：設立測試基礎建設

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

關鍵設計決定：
- `node:test` 內建——無需測試執行器依賴
- `execSync` 將 CLI 作子程序執行——測實際二進位，非內部函式
- 10 秒逾時防互動提示卡住
- `encoding: 'utf8'` 給字串輸出以供正則匹配
- 所有路徑相對於 `ROOT` 以求可重現

**預期：** 一測試文件，自 `node:test` 引入並有可運作之 `run()` 助手。

**失敗時：** 若 `node:test` 不可用，你之 Node.js 版本低於 18。升級或用墊片。

### 步驟二：寫煙霧測試

煙霧測試驗 CLI 啟動、解析參數並產預期輸出形：

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

煙霧測試模式：
- `--version` 與 `--help` 永遠運作
- 註冊表載入驗資料完整性
- 以已知與未知詞搜尋

**預期：** 煙霧測試確認 CLI 功能且資料已載。

**失敗時：** 若註冊表計數常變，用 `\d+` 而非硬編數。

### 步驟三：寫生命週期測試

生命週期測試驗建 → 驗 → 刪序列含清理：

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

清理規則：
- 用 `after()` 鉤，非 `afterEach()`——生命週期測試彼此建於上
- 將清理包入 `try/catch`——清理勿致測試套件失敗
- 自葉至根清（檔 → 父目錄 → 祖父目錄）
- 若測試修共享狀態（符號連結、配置檔），復之

**預期：** 測試於 describe 區塊內順序執行，清理即使失敗亦執。

**失敗時：** 若測試並行執行（node:test 中非預設），以 `{ concurrency: 1 }` 強制順序。

### 步驟四：為每適配器寫 Dry-Run 測試

無變更地測每適配器之目標路徑：

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

此模式可規模至任意數之適配器。每測試：
- 用 `--framework` 繞自動偵測
- 用 `--dry-run` 故無檔建立
- 斷言目標路徑現於輸出

**預期：** 每適配器一 describe 區塊，每塊至少含路徑斷言。

**失敗時：** 若適配器於專案中不存，測試將以「Unknown framework」失敗。此正確——適配器測試應僅為已實適配器存在。

### 步驟五：寫錯誤情況測試

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

錯誤測試模式：
- `assert.throws` 捕 `execSync` 之非零退出碼
- 對錯誤訊息（自 stderr 捕）正則匹配
- 測「物未找到」與「無效選項」兩錯
- 驗錯誤訊息建議修正動作

**預期：** 所有錯誤路徑產非零退出碼與有用訊息。

**失敗時：** `execSync` 於非零退出時拋。錯誤之 `stderr` 或 `stdout` 含訊息。若 `assert.throws` 正則不符，檢 `error.stdout`。

### 步驟六：寫 JSON 輸出測試

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

JSON 測試陷阱：
- 某些命令以人讀文本前綴 JSON（如 DRY RUN 標頭）
- 以尋首 `{` 字符提取 JSON
- 驗結構（鍵存在、類型），非確切值
- 如計數之值可能隨內容增而變

**預期：** JSON 輸出可解析且含預期鍵。

**失敗時：** 若 `JSON.parse` 失敗，命令或將人讀文本與 JSON 混。要麼修命令於 `--json` 模式下出純 JSON，要麼提取 JSON 子串。

### 步驟七：處理清理與狀態復原

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

狀態復原規則：
- 狀態檔（`.agent-almanac/state.json`）必須於測後清
- `scatter`／`uninstall` 移除之符號連結必須復
- `init` 建之資訊清單檔（`agent-almanac.yml`）必須移除
- 順序：`after()` 鉤以反宣告順序執——將復鉤宣告於最後

**預期：** 測試套件離專案於其所遇之同狀態。

**失敗時：** 若 CI 報告測試執行後有遺留檔，將清理加至 `after()`。測後用 `git status` 偵測洩之狀態。

## 驗證

- [ ] 測試文件可以 `node --test cli/test/cli.test.js` 執行
- [ ] 所有測試通過（0 失敗）
- [ ] 煙霧測試含 `--version`、`--help` 與註冊表載入
- [ ] 生命週期測試驗建 → 驗 → 刪含清理
- [ ] 每已實適配器至少一適配器 dry-run 測試存在
- [ ] 錯誤情況測試非零退出碼含訊息匹配
- [ ] JSON 輸出測試解析實際輸出（非模擬）
- [ ] After 鉤復所有測試所修之狀態

## 常見陷阱

- **硬編計數致破**：註冊表總數隨內容增而變。用 `\d+` 正則或動態讀計數，而非斷言 `329 skills`。
- **依執行順序之測試**：`node:test` 預設按宣告順序執套件，但套件內測試或不然。於單一 `describe` 內用生命週期套件（建 → 驗 → 刪）以保證順序。
- **測試失敗時之清理缺**：若測試於生命週期中失敗，`after()` 仍執。但若於 `before()` 中拋，後續測試與 `after()` 或不執。`before()` 保持最小。
- **互動提示卡測試**：含確認提示之命令將卡 `execSync`。或用 `echo y |` 管道，或確保測試中永遠傳 `--yes`。
- **CI 中以實安裝測**：於 `.claude/skills/` 或 `.agents/skills/` 建檔之測試修工作樹。CI 或於「dirty working directory」檢查上失敗。永遠清理。

## 相關技能

- `scaffold-cli-command` — 建此等測試所驗之命令
- `build-cli-plugin` — 建步驟四所測之適配器
- `design-cli-output` — 測試所斷言之輸出模式
