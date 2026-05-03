---
name: test-cli-application
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Integration tests for Node.js CLI app via built-in node:test. exec helper,
  output assertions, fs state verify, cleanup hooks, JSON parsing, err
  cases, state restoration after destructive. Use → add tests to existing
  CLI, test new cmd, verify adapter behavior across frameworks, setup CI.
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

# Test CLI App

Integration tests via built-in `node:test` + `execSync`.

## Use When

- Add tests to existing CLI
- Test new cmd
- Verify adapter/plugin behavior across frameworks
- Setup CI validating CLI correctness
- Catch regressions after CLI internal refactor

## In

- **Required**: Path to CLI entry (`cli/index.js`)
- **Required**: Cmds to test
- **Optional**: Framework adapters to test (dry-run)
- **Optional**: Cleanup reqs (files/symlinks created)

## Do

### Step 1: Setup Test Infra

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

Design decisions:
- `node:test` built-in — no test runner dep
- `execSync` runs CLI as subprocess → tests actual binary, not internals
- 10s timeout prevents hanging on prompts
- `encoding: 'utf8'` → strings for regex
- All paths relative to `ROOT` for reproducibility

**Got:** Test file imports from `node:test`, working `run()` helper.

**If err:** `node:test` not avail → Node < 18. Upgrade | polyfill.

### Step 2: Smoke Tests

Verify CLI starts, parses args, expected output shapes:

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

Smoke patterns:
- `--version` + `--help` always work
- Registry loading validates data integrity
- Search w/ known + unknown terms

**Got:** Smoke tests confirm CLI functional, data loaded.

**If err:** Registry counts change often → use `\d+` not hardcoded #s.

### Step 3: Lifecycle Tests

Create → verify → delete sequences w/ cleanup:

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

Cleanup rules:
- Use `after()` not `afterEach()` — lifecycle tests build on each other
- Wrap cleanup in `try/catch` — must not fail suite
- Clean leaf → root (file → parent → grandparent)
- Modifies shared state (symlinks, configs) → restore

**Got:** Tests run in sequence within describe, cleanup runs even on fail.

**If err:** Tests run parallel (non-default in node:test) → force sequential w/ `{ concurrency: 1 }`.

### Step 4: Dry-Run Tests Per Adapter

Test each adapter's target path w/o changes:

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

Pattern scales to any adapters. Each test:
- `--framework` bypasses auto-detection
- `--dry-run` → no files created
- Asserts target path appears in output

**Got:** 1 describe per adapter, each w/ ≥ path assertion.

**If err:** Adapter doesn't exist in proj → fails w/ "Unknown framework". Correct — adapter tests should only exist for implemented.

### Step 5: Err Case Tests

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

Err testing patterns:
- `assert.throws` catches non-zero exits from `execSync`
- Regex match on err msg (captured from stderr)
- Test "item not found" + "invalid option" errs
- Verify err msgs suggest corrective actions

**Got:** All err paths → non-zero exits + helpful msgs.

**If err:** `execSync` throws on non-zero. Err's `stderr` | `stdout` has msg. Check `error.stdout` if regex doesn't match.

### Step 6: JSON Output Tests

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

JSON testing gotchas:
- Some cmds prefix JSON w/ human text (DRY RUN header)
- Extract JSON by first `{`
- Validate structure (key presence, types), not exact values
- Counts may change as content added

**Got:** JSON output parseable + contains expected keys.

**If err:** `JSON.parse` fails → cmd may mix human text + JSON. Fix cmd → pure JSON in `--json` mode | extract substring.

### Step 7: Cleanup + State Restoration

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

State restoration rules:
- State files (`.agent-almanac/state.json`) → cleaned after tests
- Symlinks removed by `scatter`/`uninstall` → restored
- Manifest (`agent-almanac.yml`) created by `init` → removed
- Order: `after()` runs reverse declaration order → declare restore hooks last

**Got:** Suite leaves proj in same state found.

**If err:** CI reports leftover files → add cleanup to `after()`. Use `git status` after to detect leaked state.

## Check

- [ ] Test file runs `node --test cli/test/cli.test.js`
- [ ] All pass (0 fails)
- [ ] Smoke tests cover `--version`, `--help`, registry loading
- [ ] Lifecycle: create → verify → delete w/ cleanup
- [ ] ≥1 adapter dry-run test per implemented adapter
- [ ] Err cases test non-zero exits w/ msg matching
- [ ] JSON tests parse actual output (not mocked)
- [ ] After hooks restore all modified state

## Traps

- **Hardcoded counts**: Registry totals change. Use `\d+` regex | read dynamic vs `329 skills`.
- **Tests dep on order**: `node:test` runs suites in declaration order default, but within suite may not. Lifecycle suites (create → verify → delete) within single `describe` for guarantee.
- **Missing cleanup on fail**: Test fails mid-lifecycle → `after()` still runs. Throw in `before()` → subsequent + `after()` may not. Keep `before()` minimal.
- **Interactive prompts hang**: Confirmation prompts hang `execSync`. Pipe `echo y |` | ensure `--yes` always passed.
- **Real installs in CI**: Tests creating in `.claude/skills/` | `.agents/skills/` modify working tree. CI may fail on "dirty WD" checks. Always clean.

## →

- `scaffold-cli-command` — build cmds these tests verify
- `build-cli-plugin` — build adapters tested in Step 4
- `design-cli-output` — output patterns tests assert against
