---
name: design-cli-output
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

Design consistent, multi-level terminal output for a command-line tool.

## When to Use

- Building a new reporter module for a CLI tool
- Adding warm or narrative output alongside standard transactional output
- Standardizing output format across multiple commands
- Designing JSON machine output parallel to human-readable output
- Choosing colors, glyphs, and verbosity levels for a new terminal tool

## Inputs

- **Required**: CLI tool name and primary audience (developers, operators, end users)
- **Required**: Commands that need output formatting
- **Optional**: Whether a "ceremony" or narrative output variant is desired
- **Optional**: Branding constraints (color palette, tone)

## Procedure

### Step 1: Define the Color Palette

Use chalk to create a named palette object:

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

Palette design rules:
- Always provide a no-color fallback (the Proxy pattern above)
- Use hex colors for custom palettes (`chalk.hex('#FF6B35')`)
- Keep the fail/error color red regardless of palette theme
- Name palette entries by semantic role, not visual appearance

**Expected:** A palette object with named entries and a no-color fallback.

**On failure:** If chalk is unavailable (piped output, CI), the Proxy fallback returns strings unchanged. Test with `NO_COLOR=1` environment variable.

### Step 2: Choose Status Indicators

Select Unicode glyphs or ASCII characters for status communication:

**ASCII (maximum compatibility):**

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

Selection criteria:
- ASCII for tools that run in CI or piped contexts
- Unicode for tools with interactive terminal users
- Offer both via a `--ascii` flag or `NO_COLOR` detection
- Test glyphs in: macOS Terminal, Windows Terminal, VS Code terminal, SSH sessions

**Expected:** A glyph set that communicates status at a glance without relying on color alone.

**On failure:** If a glyph renders as `?` or a box in testing, replace with the ASCII equivalent. The `+/-/=/!` set works everywhere.

### Step 3: Design Verbosity Levels

Every command should support four output levels:

| Level | Flag | Audience | Content |
|-------|------|----------|---------|
| **Default** | (none) | Human at terminal | Formatted, colored, informative |
| **Verbose** | `--verbose` or `--ceremonial` | Human wanting detail | Per-item breakdown, arrival sequences |
| **Quiet** | `--quiet` | Scripts, CI | Minimal lines, status icons, no decoration |
| **JSON** | `--json` | Machine consumers | Structured, parseable, complete |

Implementation pattern:

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

JSON output rules:
- Always valid JSON (no mixing with human text)
- Include all data the human output shows, plus machine-useful fields
- Use consistent key naming across commands
- Exit code 0 for success, 1 for errors (regardless of output mode)

**Expected:** Four clear output levels with consistent behavior across commands.

**On failure:** If verbose mode is too noisy, make it opt-in (`--ceremonial`) rather than a graduated verbosity level.

### Step 4: Establish Voice Rules

Define the tone and style that all output functions follow. This prevents inconsistency across commands.

Example voice rules (from the campfire reporter):

1. **Present tense, active voice**: "mystic arrives" not "mystic has been installed"
2. **No exclamation marks**: Quiet confidence. The tool doesn't shout.
3. **Metaphor replaces jargon**: "practices" not "dependencies" (only for ceremony mode)
4. **Failures are honest, not catastrophic**: "A spark was lost" not "ERROR: installation failed with exit code 1"
5. **Closing line reflects state**: Every operation ends with a status summary
6. **No emoji**: Unicode glyphs carry visual weight without being decorative
7. **Every word carries information**: If a word doesn't add understanding, remove it

Voice rules for standard (non-ceremony) output:
- Concise, factual lines
- Status icon + item ID + context
- Summary line with counts
- Error messages suggest corrective actions

**Expected:** A written set of 3-7 voice rules that output functions must follow.

**On failure:** If rules feel arbitrary, test them: write the same output with and without each rule. If removing a rule doesn't change the output quality, the rule isn't needed.

### Step 5: Implement Reporter Functions

Organize output into a reporter module with focused functions:

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

Each function follows the same structure:
1. Handle empty/null input gracefully
2. Compute layout (column widths, padding)
3. Output with palette colors
4. Summary line at the bottom

For ceremony output, create a separate module:

```javascript
// campfire-reporter.js — warm narrative output
export function printArrival({ teamId, agents, results, ceremonial }) { ... }
export function printScatter({ teamId, agents, results }) { ... }
export function printTend(fires) { ... }
export function printCampfireList({ teams, state, reg }) { ... }
export function printFireSummary({ team, fireData, reg }) { ... }
export function printJson(data) { ... }
```

**Expected:** Reporter functions that are independently usable — each handles its own formatting without depending on caller state.

**On failure:** If functions grow beyond ~50 lines, extract helpers. A reporter function should be easy to review in isolation.

### Step 6: Test Output Across Environments

Verify output renders correctly in different contexts:

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

Check for:
- Colors display correctly in interactive mode
- No ANSI escape codes leak into piped/redirected output
- JSON is valid (pipe to `jq .` to verify)
- Unicode glyphs render in the target terminals
- Column alignment holds with varying content widths

**Expected:** Output is correct in all five contexts.

**On failure:** If ANSI codes leak, ensure chalk respects `NO_COLOR`. If Unicode breaks, provide an ASCII fallback mode.

## Validation

- [ ] Color palette has a no-color fallback
- [ ] Status indicators work in both color and no-color modes
- [ ] All four verbosity levels produce useful output
- [ ] JSON output is valid and parseable by `jq`
- [ ] Voice rules are documented and followed consistently
- [ ] Reporter functions handle empty/null input gracefully
- [ ] Output tested in: terminal, piped, NO_COLOR, CI

## Common Pitfalls

- **Mixing human text with JSON**: In `--json` mode, output only valid JSON. A single stray line (like "DRY RUN") breaks JSON parsers. If the command must show both, separate them clearly or suppress the human text in JSON mode.
- **Hardcoded column widths**: Content length varies. Use `Math.max(...items.map(i => i.id.length))` to compute padding dynamically.
- **Color without meaning**: If color is the only way to distinguish success from failure, colorblind users and piped output lose information. Always pair color with a text indicator (`+`, `OK`, `ERR`).
- **Ceremony in the wrong context**: Warm narrative output is appropriate for interactive terminal sessions. In CI, scripts, or `--quiet` mode, it adds noise. Gate ceremony output behind explicit flags.
- **Forgetting the summary line**: Users scan the last line first. Every operation should end with a one-line summary (counts of success/failure/skipped).

## Related Skills

- `scaffold-cli-command` — the commands that use this output
- `test-cli-application` — testing that output matches expectations
- `build-cli-plugin` — plugins report results through this output system
