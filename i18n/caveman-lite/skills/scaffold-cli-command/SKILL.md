---
name: scaffold-cli-command
locale: caveman-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Scaffold a new CLI command using Commander.js with options, action handler,
  three output modes (human-readable, quiet, JSON), and optional ceremony
  variant. Covers naming, option design, shared context patterns, error
  handling, and integration testing. Use to add a command to an existing
  Commander.js CLI, design a new CLI tool from scratch, or standardize command
  structure across a multi-command CLI.
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

Add a new command to a Commander.js CLI with consistent option handling, three output modes, and integration tests.

## When to Use

- Adding a new command to an existing Commander.js CLI
- Designing a multi-command CLI tool from scratch
- Standardizing command structure so all commands follow the same patterns
- Adding a "ceremony" variant that replaces machine output with warm narrative

## Inputs

- **Required**: Command name and verb (e.g., `gather`, `audit`, `sync`)
- **Required**: What the command does (one sentence)
- **Required**: Path to CLI entry point (e.g., `cli/index.js`)
- **Optional**: Whether the command needs a ceremony variant
- **Optional**: Custom options beyond the standard set
- **Optional**: Subcommand arguments (positional args like `<name>` or `[names...]`)

## Procedure

### Step 1: Choose the Command Name and Category

Select a verb that communicates the command's action. Group commands into categories:

| Category | Verbs | Pattern |
|----------|-------|---------|
| CRUD | `install`, `uninstall`, `list`, `search` | Operates on content |
| Lifecycle | `init`, `sync`, `audit` | Manages project state |
| Ceremony | `gather`, `scatter`, `tend`, `campfire` | Warm narrative output |

Naming conventions:
- Single verb (not `install-skill` — let options specify what)
- Lowercase, no hyphens in the command name itself
- Positional args: `<required>` or `[optional]` or `[variadic...]`

```javascript
program
  .command('gather <name>')
  .description('Gather a team around the campfire')
```

**Got:** A command name, description, and positional args defined.

**If fail:** If the verb overlaps an existing command, either compose them (add an option to the existing command) or differentiate clearly in the description.

### Step 2: Define Options

Every command should support a standard set of shared options plus command-specific ones.

**Standard options** (include as needed):

```javascript
  .option('-n, --dry-run', 'Preview without making changes')
  .option('-q, --quiet', 'Suppress human-readable output')
  .option('--json', 'Output as JSON')
  .option('-f, --framework <id>', 'Target specific framework')
  .option('-g, --global', 'Use global scope')
  .option('--scope <scope>', 'Scope: project, workspace, global', 'project')
  .option('--source <path>', 'Path to tool root directory')
```

**Command-specific options** — add only what the command needs:

```javascript
  .option('--ceremonial', 'Show each item arriving individually')
  .option('--only <items>', 'Comma-separated subset to include')
  .option('-y, --yes', 'Skip confirmation prompts')
```

Design rules:
- Short flags (`-n`) for frequently used options
- Long flags (`--dry-run`) for clarity
- Default values as third argument where appropriate
- Boolean flags (no argument) for toggles

**Got:** A complete option chain with both standard and custom options.

**If fail:** If too many options accumulate (>8), consider splitting into subcommands or grouping related options.

### Step 3: Implement the Action Handler

The action handler follows a consistent pattern:

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

The `getContext()` shared helper centralizes:
- Root directory detection
- Registry loading
- Framework detection or explicit selection
- Scope resolution

**Got:** An action handler that follows the 5-step pattern: context → resolve → preview → execute → output.

**If fail:** If the command doesn't fit the resolve-then-execute pattern (e.g., purely informational like `detect`), simplify to: context → compute → output.

### Step 4: Add the Three Output Modes

Every command should support three output modes:

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

Implementation pattern:

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

**Got:** All three modes produce useful output. JSON is parseable. Quiet is concise. Default is informative.

**If fail:** If the command has no meaningful JSON representation (e.g., `detect`), skip the JSON mode and document why.

### Step 5: Add Ceremony Variant (Optional)

For commands that benefit from warm, narrative output instead of transactional reporting:

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

Ceremony output follows voice rules:
1. Present tense, active voice ("mystic arrives", not "mystic was installed")
2. No exclamation marks
3. Metaphor replaces jargon ("practices" not "dependencies")
4. Failures are honest, not catastrophic ("a spark was lost")
5. Closing line reflects state ("The fire burns.")
6. No emoji — use Unicode glyphs (✦ ◉ ◎ ○ ✗)
7. Every word must carry information

See `design-cli-output` for detailed terminal output patterns.

**Got:** Ceremony output that follows all voice rules and produces warm, informative narratives.

**If fail:** If ceremony output feels forced or adds no information beyond the standard output, skip it. Not every command needs a ceremony variant.

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

Error design principles:
- Error messages suggest the corrective action
- `process.exit(1)` for unrecoverable errors
- Confirmation prompts for destructive operations (bypass with `--yes`)
- Dry-run always succeeds (never blocks on confirmation)

**Got:** All error paths produce helpful messages. Destructive operations require confirmation.

**If fail:** If confirmation prompts interfere with scripting, ensure `--yes` and `--quiet` both bypass them.

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

See `test-cli-application` for comprehensive CLI testing patterns.

**Got:** At least 3 tests: dry-run, JSON output, error case. More for complex commands.

**If fail:** If `execSync` times out, increase the timeout or check for interactive prompts blocking the command.

## Validation

- [ ] Command registered in CLI entry point and appears in `--help`
- [ ] Standard options (`--dry-run`, `--quiet`, `--json`) work correctly
- [ ] Default output is human-readable and informative
- [ ] JSON output is valid and parseable
- [ ] Error messages suggest corrective actions
- [ ] Destructive operations require confirmation (bypassed by `--yes`)
- [ ] At least 3 integration tests pass
- [ ] Command follows the getContext → resolve → execute → output pattern

## Pitfalls

- **Forgetting the JSON mode**: Machine consumers (scripts, CI) depend on structured output. Always implement `--json` even if the command seems interactive-only.
- **Confirmation prompts blocking scripts**: Any command that prompts for input will hang in non-interactive contexts. Always provide `--yes` for destructive commands and ensure `--quiet` suppresses prompts.
- **Inconsistent error exit codes**: Use `process.exit(1)` for all errors. Tools that parse CLI output check exit codes first.
- **Options without defaults**: Options like `--scope` should have sensible defaults so users don't need to specify them every time.
- **Leaking ceremony into quiet mode**: The `--quiet` flag means "minimal output for machines." If ceremony text leaks into quiet mode, scripts will break on unexpected output.

## Related Skills

- `build-cli-plugin` — build the adapter/plugin that commands operate on
- `test-cli-application` — comprehensive CLI testing patterns beyond the basics in Step 7
- `design-cli-output` — terminal output design for all verbosity levels
- `install-almanac-content` — example of a well-structured CLI command skill
