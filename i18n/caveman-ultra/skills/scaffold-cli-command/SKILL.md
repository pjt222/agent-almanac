---
name: scaffold-cli-command
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Scaffold new Commander.js CLI cmd → opts, action handler, 3 output modes (human|quiet|JSON), opt ceremony variant. Cmd naming, opt design, shared ctx, err handling, integ tests. Use → add cmd to existing CLI, design new CLI, standardize cmd structure.
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

Add cmd → Commander.js CLI w/ consistent opts, 3 output modes, integ tests.

## Use When

- Add cmd to existing Commander.js CLI
- Design multi-cmd CLI from scratch
- Standardize cmd structure → all same patterns
- Add ceremony variant → warm narrative output

## In

- **Required**: Cmd name + verb (`gather`, `audit`, `sync`)
- **Required**: What cmd does (1 sentence)
- **Required**: CLI entry path (`cli/index.js`)
- **Optional**: Ceremony variant needed?
- **Optional**: Custom opts beyond standard
- **Optional**: Subcmd args (`<name>`|`[names...]`)

## Do

### Step 1: Cmd Name + Category

Verb communicates action. Group:

| Category | Verbs | Pattern |
|----------|-------|---------|
| CRUD | `install`, `uninstall`, `list`, `search` | Operates on content |
| Lifecycle | `init`, `sync`, `audit` | Manages project state |
| Ceremony | `gather`, `scatter`, `tend`, `campfire` | Warm narrative output |

Conventions:
- Single verb (not `install-skill` — opts specify what)
- Lowercase, no hyphens in cmd name
- Positional: `<required>`|`[optional]`|`[variadic...]`

```javascript
program
  .command('gather <name>')
  .description('Gather a team around the campfire')
```

→ Cmd name, desc, positional args defined.

If err: verb overlaps existing → compose (add opt to existing) or differentiate in desc.

### Step 2: Opts

Standard set + cmd-specific.

**Standard** (as needed):

```javascript
  .option('-n, --dry-run', 'Preview without making changes')
  .option('-q, --quiet', 'Suppress human-readable output')
  .option('--json', 'Output as JSON')
  .option('-f, --framework <id>', 'Target specific framework')
  .option('-g, --global', 'Use global scope')
  .option('--scope <scope>', 'Scope: project, workspace, global', 'project')
  .option('--source <path>', 'Path to tool root directory')
```

**Cmd-specific** — only what needed:

```javascript
  .option('--ceremonial', 'Show each item arriving individually')
  .option('--only <items>', 'Comma-separated subset to include')
  .option('-y, --yes', 'Skip confirmation prompts')
```

Rules:
- Short flags (`-n`) for frequent
- Long (`--dry-run`) for clarity
- Default vals as 3rd arg
- Booleans for toggles

→ Complete opt chain w/ standard + custom.

If err: too many opts (>8) → split into subcmds or group related.

### Step 3: Action Handler

Consistent pattern:

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

`getContext()` shared helper centralizes:
- Root dir detection
- Registry loading
- Framework detection|explicit
- Scope resolution

→ Handler follows 5-step: ctx → resolve → preview → exec → output.

If err: cmd doesn't fit resolve-then-exec (purely informational like `detect`) → simplify: ctx → compute → output.

### Step 4: 3 Output Modes

**Default (human):**
```
Installing 3 item(s) to Claude Code...

  + create-skill [claude-code] .claude/skills/create-skill
  + write-tests  [claude-code] .claude/skills/write-tests
  = commit-changes [claude-code] (skipped)

  2 installed, 1 skipped
```

**Quiet (`--quiet`):**
Standard reporter — concise lines w/ status icons (`+`, `-`, `=`, `!`), no ceremony, no decoration.

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

Pattern:

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

→ All 3 modes useful. JSON parseable. Quiet concise. Default informative.

If err: no meaningful JSON (`detect`) → skip + document why.

### Step 5: Ceremony Variant (Optional)

For cmds benefiting from warm narrative:

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

Voice rules:
1. Present tense, active ("mystic arrives", not "was installed")
2. No exclamation
3. Metaphor → jargon ("practices" not "deps")
4. Failures honest, not catastrophic ("a spark was lost")
5. Closing reflects state ("The fire burns.")
6. No emoji — Unicode glyphs (✦ ◉ ◎ ○ ✗)
7. Every word carries info

See `design-cli-output` skill for terminal patterns.

→ Ceremony follows voice rules → warm informative narratives.

If err: ceremony forced or doesn't add info → skip. Not every cmd needs.

### Step 6: Errs + Edge Cases

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

Err design:
- Msgs suggest corrective action
- `process.exit(1)` for unrecoverable
- Confirm for destructive (bypass `--yes`)
- Dry-run always succeeds (no confirm block)

→ All err paths helpful. Destructive needs confirm.

If err: confirm prompts break scripting → ensure `--yes` + `--quiet` bypass both.

### Step 7: Integ Tests

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

See `test-cli-application` for comprehensive patterns.

→ ≥3 tests: dry-run, JSON, err. More for complex.

If err: `execSync` timeout → ↑timeout or check for interactive prompts blocking.

## Check

- [ ] Cmd registered in entry + `--help`
- [ ] Standard opts (`--dry-run`, `--quiet`, `--json`) work
- [ ] Default human + informative
- [ ] JSON valid + parseable
- [ ] Err msgs suggest fix
- [ ] Destructive needs confirm (bypass `--yes`)
- [ ] ≥3 integ tests pass
- [ ] Cmd follows getContext → resolve → exec → output

## Traps

- **Forget JSON**: Machine consumers (scripts, CI) need structured. Always impl `--json`.
- **Confirm blocks scripts**: Any prompt hangs non-interactive. Always provide `--yes` for destructive + `--quiet` suppresses.
- **Inconsistent exit codes**: Use `process.exit(1)` all errs. Tools check exit first.
- **Opts no defaults**: `--scope` etc → sensible defaults so users don't specify each time.
- **Ceremony in quiet mode**: `--quiet` = "min output for machines". Ceremony leak → scripts break.

## →

- `build-cli-plugin` — build adapter/plugin cmds operate on
- `test-cli-application` — comprehensive testing beyond Step 7
- `design-cli-output` — terminal design all verbosity
- `install-almanac-content` — well-structured CLI cmd example
