---
name: test-cli-application
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

# Test a CLI Application

Write integration tests for a Node.js CLI using the built-in `node:test` module with `execSync`.

## When to Use

- Adding tests to an existing CLI application
- Testing a newly created command
- Verifying adapter/plugin behavior across target frameworks
- Setting up CI that validates CLI correctness
- Catching regressions after refactoring CLI internals

## Inputs

- **Required**: Path to the CLI entry point (e.g., `cli/index.js`)
- **Required**: Commands to test
- **Optional**: Framework adapters to test (dry-run mode)
- **Optional**: Cleanup requirements (files/symlinks created by tests)

## Procedure

### Step 1: Set Up Test Infrastructure

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

Key design decisions:
- `node:test` is built-in — no test runner dependency needed
- `execSync` runs the CLI as a subprocess — tests the actual binary, not internal functions
- 10-second timeout prevents hanging on interactive prompts
- `encoding: 'utf8'` gives string output for regex matching
- All paths relative to `ROOT` for reproducibility

**Expected:** A test file that imports from `node:test` and has a working `run()` helper.

**On failure:** If `node:test` is not available, your Node.js version is below 18. Upgrade or use a polyfill.

### Step 2: Write Smoke Tests

Smoke tests verify the CLI starts, parses arguments, and produces expected output shapes:

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

Smoke test patterns:
- `--version` and `--help` always work
- Registry loading validates data integrity
- Search with known and unknown terms

**Expected:** Smoke tests confirm the CLI is functional and data is loaded.

**On failure:** If registry counts change frequently, use `\d+` instead of hardcoded numbers.

### Step 3: Write Lifecycle Tests

Lifecycle tests verify create → verify → delete sequences with cleanup:

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
- Use `after()` hooks, not `afterEach()` — lifecycle tests build on each other
- Wrap cleanup in `try/catch` — cleanup must not fail the test suite
- Clean from leaf to root (file → parent dir → grandparent dir)
- If the test modifies shared state (symlinks, config files), restore it

**Expected:** Tests run in sequence within the describe block, cleanup runs even on failure.

**On failure:** If tests run in parallel (non-default in node:test), force sequential with `{ concurrency: 1 }`.

### Step 4: Write Dry-Run Tests for Each Adapter

Test each adapter's target path without making changes:

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

This pattern scales to any number of adapters. Each test:
- Uses `--framework` to bypass auto-detection
- Uses `--dry-run` so no files are created
- Asserts the target path appears in output

**Expected:** One describe block per adapter, each with at least a path assertion.

**On failure:** If the adapter doesn't exist in the project, the test will fail with "Unknown framework." This is correct — adapter tests should only exist for implemented adapters.

### Step 5: Write Error Case Tests

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

Error testing patterns:
- `assert.throws` catches non-zero exit codes from `execSync`
- Regex match on the error message (captured from stderr)
- Test both "item not found" and "invalid option" errors
- Verify error messages suggest corrective actions

**Expected:** All error paths produce non-zero exit codes and helpful messages.

**On failure:** `execSync` throws on non-zero exit. The error's `stderr` or `stdout` contains the message. Check `error.stdout` if `assert.throws` regex doesn't match.

### Step 6: Write JSON Output Tests

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
- Some commands prefix JSON with human-readable text (e.g., DRY RUN header)
- Extract JSON by finding the first `{` character
- Validate structure (key presence, types), not exact values
- Values like counts may change as content is added

**Expected:** JSON output is parseable and contains expected keys.

**On failure:** If `JSON.parse` fails, the command may be mixing human text with JSON. Either fix the command to output pure JSON in `--json` mode, or extract the JSON substring.

### Step 7: Handle Cleanup and State Restoration

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
- State files (`.agent-almanac/state.json`) must be cleaned after tests
- Symlinks removed by `scatter`/`uninstall` must be restored
- Manifest files (`agent-almanac.yml`) created by `init` must be removed
- Order: `after()` hooks run in reverse declaration order — declare restore hooks last

**Expected:** The test suite leaves the project in the same state it found it.

**On failure:** If CI reports leftover files after test runs, add the cleanup to `after()`. Use `git status` after test runs to detect leaked state.

## Validation

- [ ] Test file runs with `node --test cli/test/cli.test.js`
- [ ] All tests pass (0 failures)
- [ ] Smoke tests cover `--version`, `--help`, and registry loading
- [ ] Lifecycle tests verify create → verify → delete with cleanup
- [ ] At least one adapter dry-run test exists per implemented adapter
- [ ] Error cases test non-zero exit codes with message matching
- [ ] JSON output tests parse actual output (not mocked)
- [ ] After hooks restore all state modified by tests

## Common Pitfalls

- **Hardcoded counts that break**: Registry totals change as content is added. Use `\d+` regex or read the count dynamically instead of asserting `329 skills`.
- **Tests that depend on execution order**: `node:test` runs suites in declaration order by default, but tests within a suite may not. Use lifecycle suites (create → verify → delete) within a single `describe` to guarantee order.
- **Missing cleanup on test failure**: If a test fails mid-lifecycle, `after()` still runs. But if you throw in `before()`, subsequent tests and `after()` may not run. Keep `before()` minimal.
- **Interactive prompts hanging tests**: Commands with confirmation prompts will hang `execSync`. Either pipe `echo y |` or ensure `--yes` is always passed in tests.
- **Testing with real installs in CI**: Tests that create files in `.claude/skills/` or `.agents/skills/` modify the working tree. CI may fail on "dirty working directory" checks. Always clean up.

## Related Skills

- `scaffold-cli-command` — build the commands that these tests verify
- `build-cli-plugin` — build the adapters tested in Step 4
- `design-cli-output` — output patterns that tests assert against
