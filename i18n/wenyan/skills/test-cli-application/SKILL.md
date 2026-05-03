---
name: test-cli-application
locale: wenyan
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

# 試 CLI 之應用

以內置 `node:test` 之模與 `execSync` 撰 Node.js CLI 之合試。

## 用時

- 加試於既存之 CLI 應用乃用
- 試新立之命乃用
- 驗適器／插件於諸目框之行乃用
- 立 CI 以驗 CLI 之正乃用
- 重構 CLI 之內後捕回乃用

## 入

- **必要**：CLI 入點之路（如 `cli/index.js`）
- **必要**：所試之命
- **可選**：所試之框適器（dry-run 模）
- **可選**：清之求（試所立之文／符鏈）

## 法

### 第一步：立試之基

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

要設之決：
- `node:test` 為內置——無須試行依
- `execSync` 行 CLI 為子程——試實之二進，非內函
- 十秒超時防於互動之掛
- `encoding: 'utf8'` 給字符出為正則匹
- 諸路相對於 `ROOT` 為可復

得：自 `node:test` 引之試文，有可行之 `run()` 助。

敗則：若 `node:test` 不可得，Node.js 之版於 18 以下。升或用墊。

### 第二步：撰煙試

煙試驗 CLI 啟、析參、生期之出形：

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

煙試之模：
- `--version` 與 `--help` 恆行
- 註冊載驗資之全
- 以已知與未知詞搜

得：煙試確 CLI 可行而資已載。

敗則：若註冊計頻變，用 `\d+` 而非硬編號。

### 第三步：撰生命試

生命試驗 create → verify → delete 之序與清：

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

清之則：
- 用 `after()` 而非 `afterEach()`——生命試相建
- 包清於 `try/catch`——清不可敗試套
- 自葉至根清（文 → 父目 → 祖目）
- 若試動共態（符鏈、配文），復之

得：試於 describe 內順行，敗時清亦行。

敗則：若試並行（node:test 默非），以 `{ concurrency: 1 }` 強為序。

### 第四步：為各適器撰 dry-run 試

試各適器之目路而不變：

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

此模可廣於任數適器。各試：
- 用 `--framework` 越自察
- 用 `--dry-run` 不立文
- 斷目路現於出

得：每適器一 describe 塊，各至少有路斷。

敗則：若適器於項目不存，試敗於「Unknown framework」。此正——適器試唯為已實之適器存。

### 第五步：撰誤之試

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

誤試之模：
- `assert.throws` 捕 `execSync` 之非零出碼
- 正則匹於誤辭（自 stderr 取）
- 試「物未現」與「無效選項」二誤
- 驗誤辭薦修之動

得：諸誤路生非零出碼與助辭。

敗則：`execSync` 於非零出投。誤之 `stderr` 或 `stdout` 含辭。若 `assert.throws` 之正則不匹，察 `error.stdout`。

### 第六步：撰 JSON 出之試

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

JSON 試之患：
- 某命前綴 JSON 以人讀文（如 DRY RUN 之頭）
- 取 JSON 由尋首 `{` 字符
- 驗構（鍵存、型），非具值
- 計等值或隨容加而變

得：JSON 之出可析而含期之鍵。

敗則：若 `JSON.parse` 敗，命或混人文於 JSON。或修命使 `--json` 模出純 JSON，或取 JSON 之子串。

### 第七步：治清與態復

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

態復之則：
- 態文（`.agent-almanac/state.json`）試後須清
- `scatter`／`uninstall` 除之符鏈須復
- `init` 立之清單文（`agent-almanac.yml`）須除
- 序：`after()` 鉤反聲明序行——復鉤宜末聲

得：試套留項目於初狀。

敗則：若 CI 報試後留文，加清於 `after()`。試後用 `git status` 察漏態。

## 驗

- [ ] 試文以 `node --test cli/test/cli.test.js` 行
- [ ] 諸試皆過（0 敗）
- [ ] 煙試覆 `--version`、`--help`、註冊載
- [ ] 生命試驗 create → verify → delete 與清
- [ ] 每實之適器至少一 dry-run 試
- [ ] 誤例試非零出碼與辭匹
- [ ] JSON 出試析實出（非模）
- [ ] After 鉤復試所改之諸態

## 陷

- **硬編計而碎**：註冊總隨容加而變。用 `\d+` 正則或動讀計，非斷 `329 skills`。
- **依執序之試**：`node:test` 默以聲序行套，然套內試或不。用生命套（create → verify → delete）於單 `describe` 以保序。
- **試敗時無清**：若試於生命中敗，`after()` 仍行。然若於 `before()` 投，後試與 `after()` 或不行。`before()` 宜小。
- **互動掛試**：有確認提之命掛 `execSync`。或管 `echo y |` 或恆於試傳 `--yes`。
- **CI 中以實裝試**：立文於 `.claude/skills/` 或 `.agents/skills/` 之試動工樹。CI 或敗於「dirty working directory」之察。恆清。

## 參

- `scaffold-cli-command` — 建此試所驗之命
- `build-cli-plugin` — 建第四步所試之適器
- `design-cli-output` — 試所斷之出模
