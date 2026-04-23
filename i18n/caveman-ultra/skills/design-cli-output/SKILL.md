---
name: design-cli-output
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Consistent multi-level terminal output for CLI.

## Use When

- New reporter module → CLI
- Warm/narrative alongside transactional
- Std across commands
- JSON machine parallel to human
- Colors, glyphs, verbosity for new tool

## In

- **Required**: CLI name + audience (devs, ops, end users)
- **Required**: Commands needing formatting
- **Optional**: Ceremony/narrative variant?
- **Optional**: Branding (palette, tone)

## Do

### Step 1: Color palette

chalk → named palette:

**Standard** (transactional):

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

**Warm** (ceremony/narrative):

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

Rules:
- No-color fallback (Proxy pattern)
- Hex for custom (`chalk.hex('#FF6B35')`)
- Fail/err → red regardless
- Name by semantic role not visual

→ Palette obj w/ named entries + no-color fallback.

If err: chalk unavailable (piped, CI) → Proxy returns strings unchanged. Test `NO_COLOR=1`.

### Step 2: Status indicators

Unicode glyphs or ASCII:

**ASCII (max compat):**

```
+  created/installed (green)
-  removed/deleted (red)
=  skipped/unchanged (dim)
!  error/warning (red)
```

**Unicode (richer, UTF-8 term):**

```
✦  item/skill/practice (spark)
◉  active/burning state
◎  cooling/embers state
○  cold/dormant state
◌  available/not installed
✗  failed item
✓  success (use sparingly — not all terminals render it well)
```

Criteria:
- ASCII → CI/piped
- Unicode → interactive
- Both via `--ascii` flag or `NO_COLOR`
- Test: macOS Terminal, Windows Terminal, VS Code, SSH

→ Glyph set communicates status at glance w/o color alone.

If err: Glyph renders `?` or box → ASCII equiv. `+/-/=/!` works everywhere.

### Step 3: Verbosity levels

Every cmd supports 4:

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
- Always valid (no mix w/ human text)
- Include all human data + machine fields
- Consistent keys across cmds
- Exit 0 success, 1 err (regardless of mode)

→ 4 clear levels, consistent behavior across cmds.

If err: Verbose too noisy → opt-in (`--ceremonial`) not graduated.

### Step 4: Voice rules

Tone + style. Prevents inconsistency.

Ex (campfire reporter):

1. **Present tense, active**: "mystic arrives" not "mystic has been installed"
2. **No exclamation**: Quiet confidence.
3. **Metaphor replaces jargon**: "practices" not "dependencies" (ceremony only)
4. **Failures honest, not catastrophic**: "A spark was lost" not "ERROR: installation failed with exit code 1"
5. **Closing line reflects state**: Every op ends summary
6. **No emoji**: Unicode glyphs carry visual weight w/o decorative
7. **Every word info**: If no understanding → remove

Standard (non-ceremony):
- Concise, factual lines
- Status icon + item ID + ctx
- Summary line w/ counts
- Err msgs suggest actions

→ 3-7 voice rules output fns follow.

If err: Rules arbitrary → test. Write same output w/ + w/o rule. If no change → rule not needed.

### Step 5: Reporter fns

Module w/ focused fns:

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

Each fn:
1. Handle empty/null gracefully
2. Compute layout (col widths, padding)
3. Output w/ palette
4. Summary line at bottom

Ceremony → separate module:

```javascript
// campfire-reporter.js — warm narrative output
export function printArrival({ teamId, agents, results, ceremonial }) { ... }
export function printScatter({ teamId, agents, results }) { ... }
export function printTend(fires) { ... }
export function printCampfireList({ teams, state, reg }) { ... }
export function printFireSummary({ team, fireData, reg }) { ... }
export function printJson(data) { ... }
```

→ Independent fns, handle own formatting w/o caller state.

If err: Fn >~50 lines → extract helpers. Reviewable in isolation.

### Step 6: Test across envs

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
- Colors in interactive
- No ANSI leaks in piped
- JSON valid (`jq .`)
- Unicode in target terminals
- Col align w/ varying widths

→ Output correct in all 5 contexts.

If err: ANSI leaks → chalk respects `NO_COLOR`. Unicode breaks → ASCII fallback.

## Check

- [ ] Palette has no-color fallback
- [ ] Status indicators work color + no-color
- [ ] All 4 verbosity levels useful
- [ ] JSON valid + `jq`-parseable
- [ ] Voice rules docs + followed
- [ ] Reporter fns handle empty/null
- [ ] Tested: terminal, piped, NO_COLOR, CI

## Traps

- **Mix human + JSON**: `--json` only valid JSON. Stray line ("DRY RUN") breaks parsers. Suppress human in JSON mode.
- **Hardcoded col widths**: Varies. `Math.max(...items.map(i => i.id.length))` dyn.
- **Color w/o meaning**: Color-only → colorblind + piped lose info. Pair w/ text (`+`, `OK`, `ERR`).
- **Ceremony wrong ctx**: Interactive only. CI/scripts/`--quiet` = noise. Gate behind flags.
- **Forget summary**: Users scan last line first. 1-line summary (counts).

## →

- `scaffold-cli-command` — cmds using this output
- `test-cli-application` — test output matches
- `build-cli-plugin` — plugins report results
