---
name: design-cli-output
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Design terminal output for a CLI tool with chalk colors, Unicode glyphs,
  multiple verbosity levels (human, verbose, quiet, JSON), and consistent
  voice rules. Covers color palette selection, status indicator design,
  reporter function architecture, ceremony/narrative output variants, and
  cross-terminal compatibility. Use when building a new CLI reporter module,
  adding warm narrative output to an existing tool, standardizing output
  across multiple commands, or designing machine-readable JSON alongside
  human-readable text.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: cli
  complexity: basic
  language: TypeScript
  tags:
    - cli
    - terminal
    - ux
    - chalk
    - unicode
---

# Design CLI Output

Consistent, multi-level terminal output for a command-line tool.

## When Use

- Build new reporter module for CLI tool
- Add warm or narrative output alongside transactional output
- Standardize output format across many commands
- Design JSON machine output parallel to human output
- Pick colors, glyphs, verbosity levels for new terminal tool

## Inputs

- **Required**: CLI tool name + primary audience (devs, operators, end users)
- **Required**: Commands that need output formatting
- **Optional**: Ceremony/narrative output variant wanted?
- **Optional**: Brand constraints (color palette, tone)

## Steps

### Step 1: Set Color Palette

Use chalk. Make named palette object.

**Standard palette** (transactional output):

```javascript
let chalk;
try { chalk = (await import('chalk')).default; }
catch { chalk = new Proxy({}, { get: () => (s) => s }); }

// Status colors
const ok = chalk.green;       // success
const fail = chalk.red;       // errors
const warn = chalk.yellow;    // warnings
const info = chalk.cyan;      // identifiers, names
const dim = chalk.dim;        // secondary info, paths
const bold = chalk.bold;      // headers
```

**Warm palette** (ceremony/narrative output):

```javascript
const C = {
  flame: chalk.hex('#FF6B35'),   // active elements, fire
  amber: chalk.hex('#FFB347'),   // arriving items, warm highlights
  spark: chalk.hex('#FFF4E0'),   // individual items (sparks/skills)
  ember: chalk.hex('#8B4513'),   // cold/dormant states
  warm:  chalk.hex('#D4A574'),   // neutral warm text
  dim:   chalk.dim,              // background, secondary
  fail:  chalk.red,              // errors stay red (honest)
};
```

Palette rules:
- Always provide no-color fallback (Proxy pattern above)
- Use hex colors for custom palettes (`chalk.hex('#FF6B35')`)
- Keep fail/error red no matter the theme
- Name palette by semantic role, not visual

**Got:** Palette object. Named entries. No-color fallback.

**If fail:** Chalk unavailable (piped, CI)? Proxy fallback returns strings unchanged. Test: `NO_COLOR=1` env var.

### Step 2: Pick Status Indicators

Unicode glyphs or ASCII chars for status.

**ASCII (max compat):**

```
+  created/installed (green)
-  removed/deleted (red)
=  skipped/unchanged (dim)
!  error/warning (red)
```

**Unicode (richer, needs UTF-8 terminal):**

```
✦  item/skill/practice (spark)
◉  active/burning state
◎  cooling/embers state
○  cold/dormant state
◌  available/not installed
✗  failed item
✓  success (use sparingly — not all terminals render it well)
```

Rules:
- ASCII for CI or piped contexts
- Unicode for interactive terminal users
- Offer both via `--ascii` flag or `NO_COLOR` detection
- Test glyphs in: macOS Terminal, Windows Terminal, VS Code terminal, SSH

**Got:** Glyph set communicates status at a glance. No color needed.

**If fail:** Glyph renders as `?` or box? Swap for ASCII. `+/-/=/!` works everywhere.

### Step 3: Design Verbosity Levels

Every command supports 4 output levels:

| Level | Flag | Audience | Content |
|-------|------|----------|---------|
| **Default** | (none) | Human at terminal | Formatted, colored, informative |
| **Verbose** | `--verbose` or `--ceremonial` | Human wanting detail | Per-item breakdown, arrival sequences |
| **Quiet** | `--quiet` | Scripts, CI | Minimal lines, status icons, no decoration |
| **JSON** | `--json` | Machine consumers | Structured, parseable, complete |

Pattern:

```javascript
function output(data, options) {
  if (options.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  if (options.quiet) {
    for (const item of data.items) {
      const icon = item.ok ? '+' : '!';
      console.log(`${icon} ${item.id}`);
    }
    return;
  }
  // Default (or verbose) human output
  printFormatted(data, { verbose: options.verbose });
}
```

JSON rules:
- Always valid JSON (no mixing with human text)
- Include all data human output shows, plus machine fields
- Consistent key names across commands
- Exit 0 = success, 1 = err (any output mode)

**Got:** Four clear output levels. Consistent across commands.

**If fail:** Verbose too noisy? Make opt-in (`--ceremonial`) not graduated level.

### Step 4: Set Voice Rules

Tone + style all output follows. Stops inconsistency.

Example voice rules (campfire reporter):

1. **Present tense, active voice**: "mystic arrives" not "mystic has been installed"
2. **No exclamation marks**: Quiet confidence. Tool doesn't shout.
3. **Metaphor replaces jargon**: "practices" not "dependencies" (ceremony mode only)
4. **Failures honest, not catastrophic**: "A spark was lost" not "ERROR: installation failed with exit code 1"
5. **Closing line shows state**: Every op ends with status summary
6. **No emoji**: Unicode glyphs carry visual weight without decoration
7. **Every word carries info**: Word adds no understanding? Remove.

Voice rules for standard (non-ceremony) output:
- Concise, factual lines
- Status icon + item ID + context
- Summary line with counts
- Errors suggest fix

**Got:** Written set of 3-7 voice rules. Output funcs must follow.

**If fail:** Rules feel arbitrary? Test: write output with + without each rule. Removing rule doesn't change quality? Rule not needed.

### Step 5: Build Reporter Functions

Organize output into reporter module. Focused functions.

```javascript
// reporter.js — standard output
export function printResults(results) { ... }
export function printItemTable(items) { ... }
export function printDetections(detections) { ... }
export function printAudit(auditResults) { ... }
export function printDryRun() { ... }
export function warn(msg) { ... }
export function error(msg) { ... }
export { chalk };
```

Each function same structure:
1. Handle empty/null input
2. Compute layout (col widths, padding)
3. Output with palette colors
4. Summary line at bottom

Ceremony output? Separate module:

```javascript
// campfire-reporter.js — warm narrative output
export function printArrival({ teamId, agents, results, ceremonial }) { ... }
export function printScatter({ teamId, agents, results }) { ... }
export function printTend(fires) { ... }
export function printCampfireList({ teams, state, reg }) { ... }
export function printFireSummary({ team, fireData, reg }) { ... }
export function printJson(data) { ... }
```

**Got:** Reporter functions independently usable. Each handles own formatting, no caller state dep.

**If fail:** Function > ~50 lines? Extract helpers. Reporter must be reviewable alone.

### Step 6: Test Output Across Environments

Check output renders right in different contexts:

```bash
# With colors (interactive terminal)
node cli/index.js list --domains

# Without colors (piped)
node cli/index.js list --domains | cat

# With NO_COLOR environment variable
NO_COLOR=1 node cli/index.js list --domains

# JSON mode (parseable)
node cli/index.js campfire --json | jq .

# In CI (typically no TTY)
CI=true node cli/index.js audit
```

Check:
- Colors display right in interactive mode
- No ANSI escape codes leak into piped/redirected output
- JSON valid (pipe to `jq .`)
- Unicode glyphs render in target terminals
- Column alignment holds with varying content widths

**Got:** Output correct in all 5 contexts.

**If fail:** ANSI codes leak? Ensure chalk respects `NO_COLOR`. Unicode breaks? Provide ASCII fallback mode.

## Checks

- [ ] Color palette has no-color fallback
- [ ] Status indicators work in both color + no-color modes
- [ ] All 4 verbosity levels produce useful output
- [ ] JSON output valid, parseable by `jq`
- [ ] Voice rules documented + followed
- [ ] Reporter funcs handle empty/null input
- [ ] Output tested in: terminal, piped, NO_COLOR, CI

## Pitfalls

- **Mixing human text with JSON**: In `--json` mode, only valid JSON. One stray line ("DRY RUN") breaks JSON parsers. If must show both, separate clearly or suppress human text in JSON mode.
- **Hardcoded column widths**: Content length varies. Use `Math.max(...items.map(i => i.id.length))` for dynamic padding.
- **Color without meaning**: Color only way to tell success from failure? Colorblind users + piped output lose info. Always pair color with text indicator (`+`, `OK`, `ERR`).
- **Ceremony in wrong context**: Warm narrative output fits interactive terminal. In CI, scripts, `--quiet` mode = noise. Gate ceremony behind explicit flags.
- **Forgetting summary line**: Users scan last line first. Every op ends with one-line summary (counts of success/failure/skipped).

## See Also

- `scaffold-cli-command` — commands that use this output
- `test-cli-application` — testing output matches expectations
- `build-cli-plugin` — plugins report results through this output system
