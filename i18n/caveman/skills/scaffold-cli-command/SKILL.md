---
name: scaffold-cli-command
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Scaffold a new CLI command using Commander.js with options, action handler,
  three output modes (human-readable, quiet, JSON), and optional ceremony
  variant. Covers command naming, option design, shared context patterns,
  error handling, and integration testing. Use when adding a command to an
  existing Commander.js CLI, designing a new CLI tool from scratch, or
  standardizing command structure across a multi-command CLI.
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
    - commander
    - nodejs
    - terminal
    - command-pattern
---

# Scaffold a CLI Command

Add new command to Commander.js CLI app. Consistent option handling, three output modes, integration tests.

## When Use

- Add new command to existing Commander.js CLI
- Design multi-command CLI tool from scratch
- Standardize command structure so all follow same patterns
- Add "ceremony" variant — replace machine output with warm narrative

## Inputs

- **Required**: Command name + verb (e.g., `gather`, `audit`, `sync`)
- **Required**: What command does (one sentence)
- **Required**: Path to CLI entry (e.g., `cli/index.js`)
- **Optional**: Ceremony variant (warm narrative output)
- **Optional**: Custom options beyond standard
- **Optional**: Subcommand args (positional `<name>` or `[names...]`)

## Steps

### Step 1: Choose Command Name and Category

Pick verb that says what command does. Group commands by category.

| Category | Verbs | Pattern |
|----------|-------|---------|
| CRUD | `install`, `uninstall`, `list`, `search` | Operates on content |
| Lifecycle | `init`, `sync`, `audit` | Manages project state |
| Ceremony | `gather`, `scatter`, `tend`, `campfire` | Warm narrative output |

Naming.
- Single verb (not `install-skill` — let options specify what)
- Lowercase, no hyphens in command name itself
- Positional args: `<required>` or `[optional]` or `[variadic...]`

```javascript
program
  .command('gather <name>')
  .description('Gather a team around the campfire')
```

**Got:** Command name, description, positional args defined.

**If fail:** Verb overlaps existing? Compose (add option to existing) or differentiate clearly in description.

### Step 2: Define Options

Every command should support standard shared options + command-specific.

**Standard options** (include as needed).

```javascript
  .option('-n, --dry-run', 'Preview without making changes')
  .option('-q, --quiet', 'Suppress human-readable output')
  .option('--json', 'Output as JSON')
  .option('-f, --framework <id>', 'Target specific framework')
  .option('-g, --global', 'Use global scope')
  .option('--scope <scope>', 'Scope: project, workspace, global', 'project')
  .option('--source <path>', 'Path to tool root directory')
```

**Command-specific options** — add only what command needs.

```javascript
  .option('--ceremonial', 'Show each item arriving individually')
  .option('--only <items>', 'Comma-separated subset to include')
  .option('-y, --yes', 'Skip confirmation prompts')
```

Design rules.
- Short flags (`-n`) for frequent options
- Long flags (`--dry-run`) for clarity
- Defaults as third arg where appropriate
- Boolean flags (no arg) for toggles

**Got:** Complete option chain — standard + custom.

**If fail:** Too many options (>8)? Split into subcommands or group related.

### Step 3: Implement Action Handler

Action handler follows consistent pattern.

```javascript
.action(async (name, options) => {
  // 1. Get shared context (registries, adapters, paths)
  const ctx = getContext(options);

  // 2. Resolve what to operate on
  const items = resolveItems(ctx, name, options);
  if (!items || items.length === 0) {
    reporter.error('Nothing found.');
    process.exit(1);
  }

  // 3. Preview if dry-run
  if (options.dryRun) reporter.printDryRun();

  // 4. Execute the operation
  const results = await executeOperation(items, ctx, options);

  // 5. Output results (3 modes)
  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
  } else if (options.quiet) {
    reporter.printResults(results);
  } else {
    printHumanOutput(results, options);
  }
})
```

`getContext()` shared helper centralizes.
- Root directory detection
- Registry loading
- Framework detection or explicit selection
- Scope resolution

**Got:** Action handler follows 5-step pattern: context → resolve → preview → execute → output.

**If fail:** Command does not fit resolve-then-execute (purely informational like `detect`)? Simplify: context → compute → output.

### Step 4: Add Three Output Modes

Every command should support three output modes.

**Default (human-readable):**
```
Installing 3 item(s) to Claude Code...

  + create-skill [claude-code] .claude/skills/create-skill
  + write-tests  [claude-code] .claude/skills/write-tests
  = commit-changes [claude-code] (skipped)

  2 installed, 1 skipped
```

**Quiet (`--quiet`):**
Standard reporter output — concise lines with status icons (`+`, `-`, `=`, `!`), no ceremony, no decoration.

**JSON (`--json`):**
```json
{
  "command": "install",
  "items": 3,
  "installed": 2,
  "skipped": 1,
  "failed": 0
}
```

Implementation.

```javascript
if (options.json) {
  console.log(JSON.stringify(data, null, 2));
  return;
}
if (options.quiet) {
  reporter.printResults(results);
  return;
}
// Default: human-readable output
printHumanReadable(results, options);
```

**Got:** All three modes useful. JSON parseable. Quiet concise. Default informative.

**If fail:** Command no meaningful JSON (e.g., `detect`)? Skip JSON mode, document why.

### Step 5: Add Ceremony Variant (Optional)

For commands that benefit from warm, narrative output instead of transactional.

```javascript
if (options.json) {
  ceremonyReporter.printJson(data);
} else if (options.quiet) {
  reporter.printResults(results);
} else {
  ceremonyReporter.printArrival({
    teamId: name,
    agents,
    results: { installed, skipped, failed },
    ceremonial: options.ceremonial || false,
  });
}
```

Ceremony output voice rules.
1. Present tense, active voice ("mystic arrives", not "mystic was installed")
2. No exclamation marks
3. Metaphor replaces jargon ("practices" not "dependencies")
4. Failures honest, not catastrophic ("a spark was lost")
5. Closing line reflects state ("The fire burns.")
6. No emoji — use Unicode glyphs (✦ ◉ ◎ ○ ✗)
7. Every word must carry information

See `design-cli-output` skill for detailed terminal output patterns.

**Got:** Ceremony output follows all voice rules, produces warm, informative narratives.

**If fail:** Ceremony feels forced or no info beyond standard? Skip. Not every command needs ceremony.

### Step 6: Handle Errors and Edge Cases

```javascript
// Unknown item
if (!item) {
  reporter.error(`Unknown: ${name}. Use 'tool list' to browse.`);
  process.exit(1);
}

// Confirmation for destructive actions
if (!options.yes && !options.quiet && !options.dryRun) {
  const answer = await askYesNo('Proceed?');
  if (!answer) {
    console.log('  Cancelled.');
    return;
  }
}

// State validation
if (!state.fires[name]) {
  reporter.error(`Not active. Nothing to remove.`);
  process.exit(1);
}
```

Error design.
- Error msgs suggest corrective action
- `process.exit(1)` for unrecoverable
- Confirmation for destructive (bypass with `--yes`)
- Dry-run always succeeds (never blocks on confirmation)

**Got:** All error paths give helpful msgs. Destructive ops require confirmation.

**If fail:** Confirmation interferes with scripting? Ensure `--yes` and `--quiet` both bypass.

### Step 7: Write Integration Tests

```javascript
import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'child_process';

const CLI = 'node cli/index.js';
function run(args) {
  return execSync(`${CLI} ${args}`, { encoding: 'utf8', timeout: 10000 });
}

describe('new-command', () => {
  after(() => { /* cleanup created files/state */ });

  it('dry-run shows preview', () => {
    const out = run('new-command arg --dry-run');
    assert.match(out, /DRY RUN/);
  });

  it('--json outputs valid JSON', () => {
    const out = run('new-command arg --json');
    const start = out.indexOf('{');
    const data = JSON.parse(out.slice(start));
    assert.equal(data.command, 'new-command');
  });

  it('rejects unknown input', () => {
    assert.throws(() => run('new-command nonexistent'), /Unknown/);
  });
});
```

See `test-cli-application` skill for full CLI testing patterns.

**Got:** At least 3 tests: dry-run, JSON output, error case. More for complex commands.

**If fail:** `execSync` times out? Up timeout or check for interactive prompts blocking command.

## Checks

- [ ] Command registered in CLI entry, appears in `--help`
- [ ] Standard options (`--dry-run`, `--quiet`, `--json`) work
- [ ] Default output human-readable, informative
- [ ] JSON output valid, parseable
- [ ] Error msgs suggest corrective actions
- [ ] Destructive ops require confirmation (bypass `--yes`)
- [ ] At least 3 integration tests pass
- [ ] Command follows getContext → resolve → execute → output pattern

## Pitfalls

- **Forget JSON mode**: Machine consumers (scripts, CI) need structured output. Always implement `--json` even if seems interactive-only.
- **Confirmation prompts block scripts**: Any command that prompts hangs in non-interactive contexts. Always provide `--yes` for destructive, ensure `--quiet` suppresses prompts.
- **Inconsistent error exit codes**: Use `process.exit(1)` for all errors. Tools parsing CLI output check exit codes first.
- **Options without defaults**: `--scope` should have sensible default so users do not specify every time.
- **Leak ceremony into quiet mode**: `--quiet` = "minimal output for machines." Ceremony text leak = scripts break on unexpected output.

## See Also

- `build-cli-plugin` — build adapter/plugin commands operate on
- `test-cli-application` — full CLI testing patterns beyond Step 7 basics
- `design-cli-output` — terminal output design for all verbosity levels
- `install-almanac-content` — example well-structured CLI command skill
