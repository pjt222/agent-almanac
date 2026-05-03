---
name: test-cli-application
locale: wenyan-ultra
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

# 測 CLI 應

書 Node.js CLI 整測、用 `node:test` 內建。

## 用

- 加測於既存 CLI→用
- 測新建命→用
- 驗適/插為跨目框→用
- 立 CI 驗 CLI 正→用
- 重構後捕回歸→用

## 入

- **必**：CLI 入點路（如 `cli/index.js`）
- **必**：所測命
- **可**：所測框適（乾行模）
- **可**：清需（測建之檔/連）

## 行

### 一：立測基

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

要設決：
- `node:test` 內建——無測行依
- `execSync` 行 CLI 為子程——測真二、非內函
- 10 秒超時防於交問掛
- `encoding: 'utf8'` 予串出為配
- 諸路相對 `ROOT` 為重現

得：自 `node:test` 入而有行 `run()` 助之測檔。

敗：`node:test` 不在→Node.js 版 < 18。升或用 polyfill。

### 二：書煙測

煙測驗 CLI 起、析參、生期出形：

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

煙測模：
- `--version` 與 `--help` 恆行
- 登載驗資完
- 搜以知與未知詞

得：煙測確 CLI 行而資載。

敗：登數常變→用 `\d+` 而非硬碼數。

### 三：書生命測

生命測驗 建 → 驗 → 刪 含清：

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

清則：
- 用 `after()` 鉤、非 `afterEach()`——生命測互建
- 清裹 `try/catch`——清不可敗測組
- 自葉至根清（檔 → 父目 → 祖目）
- 測改共態（連、配檔）→復之

得：測於 describe 中序行、清於敗亦行。

敗：測並行（node:test 非默）→強序以 `{ concurrency: 1 }`。

### 四：為各適書乾行測

測各適之目路而不變：

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

此模可至諸適。各測：
- 用 `--framework` 越自察
- 用 `--dry-run` 故無檔建
- 斷目路現於出

得：每適一 describe、各至少一路斷。

敗：適不在案→測敗以「Unknown framework」。為正——適測唯為已行適存。

### 五：書誤例測

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

誤測模：
- `assert.throws` 捕 `execSync` 之非零出
- 配誤訊（自 stderr 捕）
- 測「不在」與「無效選」之誤
- 驗誤訊薦糾

得：諸誤路生非零出與助訊。

敗：`execSync` 於非零出拋。誤之 `stderr` 或 `stdout` 含訊。`assert.throws` 配不中→察 `error.stdout`。

### 六：書 JSON 出測

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

JSON 測陷：
- 某命前置人讀文於 JSON（如 DRY RUN 頭）
- 取 JSON 自首 `{` 字
- 驗構（鍵存、類）、非具值
- 數值或隨容增變

得：JSON 出可析含期鍵。

敗：`JSON.parse` 敗→命或混人文於 JSON。或修命於 `--json` 模出純 JSON、或取 JSON 子串。

### 七：理清與態復

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

態復則：
- 態檔（`.agent-almanac/state.json`）測後必清
- `scatter`/`uninstall` 除之連必復
- `init` 建之清檔（`agent-almanac.yml`）必除
- 序：`after()` 反陳序行——後陳復鉤

得：測組離案於同初態。

敗：CI 報測後留檔→加清於 `after()`。測後用 `git status` 偵漏態。

## 驗

- [ ] 測檔以 `node --test cli/test/cli.test.js` 行
- [ ] 諸測過（0 敗）
- [ ] 煙測覆 `--version`、`--help`、登載
- [ ] 生命測驗 建 → 驗 → 刪 含清
- [ ] 各行適至少一乾行測
- [ ] 誤例測非零出含訊配
- [ ] JSON 出測析真出（非擬）
- [ ] after 鉤復測改之態

## 忌

- **硬數破**：登總隨容增變。用 `\d+` 規或動讀數而非斷 `329 skills`
- **依執序之測**：`node:test` 默以陳序行套、然套內測或無序。生命套（建 → 驗 → 刪）置於單 `describe` 以保序
- **測敗失清**：測中敗、`after()` 仍行。然 `before()` 拋→後測與 `after()` 或不行。`before()` 保簡
- **交問掛測**：含確之命掛 `execSync`。或前置 `echo y |`、或於測恆傳 `--yes`
- **CI 真裝測**：建檔於 `.claude/skills/` 或 `.agents/skills/` 之測改工樹。CI 或敗於「污工目」察。常清

## 參

- `scaffold-cli-command` — 建此測所驗之命
- `build-cli-plugin` — 建步四所測之適
- `design-cli-output` — 測所斷之出模
