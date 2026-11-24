## Run: 2026-11-24-workflow-scriptpath-probe

**Observer**: Claude (Opus 5.5 main loop ran the probe; a subagent wrote this record from the main loop's evidence file and added the `node --check` rows) | **Issue**: #1109 (AC 2) | **Relates**: #293, #1108

### Objective

`scripts/lib/mutation-parse.js` gives the Workflow dialect (a top-level `return` accepted) to a `.mjs` file directly in `.claude/workflows/`. #1109 asks whether that should stay.

The loader probe (`tests/results/2026-10-14-workflow-loader-probe/RESULT.md`, Claude Code 2.1.299) found that the Workflow tool does not discover a `.mjs` file in `.claude/workflows/` by name. A script can also be run by path, though: `skills/verify-continue-here/SKILL.md:37` runs `workflows/verify-handoff.mjs` as `Workflow({ scriptPath: … })`. So a `.mjs` file there could still run in the Workflow dialect. No committed record showed `scriptPath` accepting a `.mjs` file in `.claude/workflows/`. This record is that run, with a `.js` file beside it as the comparison.

### Environment

| Field | Value |
|-------|-------|
| Binary | Claude Code **2.1.331** |
| Caller | the main loop of a Claude Code session, calling the Workflow tool directly. Whether the session was interactive or headless was not recorded. |
| Project | a scratch git repository, written `<scratch git repo>` here |
| Date | 2026-11-24, 07:03Z |

### Method

Two files sit in `<scratch git repo>/.claude/workflows/`: `probe-mjs.mjs` and `probe-js.js`. The copies beside this record are byte-identical to them (`cmp`). Each has three lines: a pure-literal `export const meta`, a `log()` line, and a top-level `return` of an object that names the file's extension. Neither calls `agent()`.

Each file was run once with `Workflow({ scriptPath })` naming it. The observable is the run's return value, which can only come from the top-level `return`. Whether the path passed was absolute or relative was not recorded.

### Results

| File | `node --check`, at the run | `Workflow({ scriptPath })` return value | Agents spawned |
|---|---|---|---|
| `probe-mjs.mjs` | not run | `{"ran":true,"ext":"mjs"}` | 0 |
| `probe-js.js` | rc=1, `SyntaxError: Illegal return statement` | `{"ran":true,"ext":"js"}` | 0 |

The `node --check` row for `probe-mjs.mjs` was left empty at the run. It was filled in when this record was written, on byte-identical copies in a directory with no `package.json` above it (Node v26.11.1, 2026-11-24T07:31Z):

| File | plain `node --check <file>` | wrapped as `mutation-parse.js`'s `wrapWorkflow` wraps it, then `node --input-type=module --check -` |
|---|---|---|
| `probe-mjs.mjs` | rc=1, `SyntaxError: Illegal return statement` (line 3) | rc=0 |
| `probe-js.js` | rc=1, `SyntaxError: Illegal return statement` (line 3) | rc=0 |

A control for the wrapped check: a wrapped body with an unclosed `{` gives rc=1, so rc=0 above is an answer and not silence.

### Findings (scoped to Claude Code 2.1.331)

1. **`Workflow({ scriptPath })` runs a `.mjs` file in `.claude/workflows/` and accepts its top-level `return`.** The run returned the value of that `return`. Node refuses the same bytes as a plain ES module. So the Workflow tool did not run the file as a plain ES module.
2. **It does the same for a `.js` file there.** That file is the one the loader probe found discoverable by name.

Consequence for #1109 AC 2: `mutation-parse.js` keeps the dialect for a `.mjs` file directly in `.claude/workflows/`. Two facts decide it together:

- Before #1108 this repository's docs taught installing a workflow as exactly that file (`cp workflows/<name>.mjs .claude/workflows/<name>.mjs`, quoted in the loader probe's Objective). So a `.mjs` file there is a workflow body by provenance.
- Finding 1 shows that the runtime runs such a file in the dialect.

Runnability alone would not decide it. `skills/unleash-the-agents/SKILL.md` instructs running `skills/unleash-the-agents/references/prospector-swarm.mjs` by `scriptPath` too, and that file stays outside the anchor, gated by its own suite. `mutation-parse.js` also grants the dialect to a `.js` file in `.claude/workflows/`, the installed copy the docs teach since #1108.

### What this record does not establish

- **Other versions.** Only 2.1.331 was measured. The loader probe's discovery findings were measured on 2.1.299 and were not re-measured here.
- **Discovery or invocation by name.** Neither file was invoked by `name`.
- **How the runtime treats the body.** The record shows that a top-level `return` and an `export const meta` are accepted. It does not show that the body is wrapped in an async function (`workflows/README.md` asserts this; it was not measured). It also does not show that the runtime accepts everything `--input-type=module` accepts, or only that.
- **Other directories.** No file outside `.claude/workflows/` was run. User scope (`~/.claude/workflows`) was not exercised.
- **Repeatability.** Each file was run once.

### Files

- `probe-mjs.mjs` and `probe-js.js` are the two scripts, byte-identical to the files the main loop ran. To re-run, copy both into `<a scratch git repository>/.claude/workflows/` and call `Workflow({ scriptPath: '<that file>' })` for each.
  - They are evidence, not this repository's workflows. Nothing in this repository discovers them: `tests/results/` is not a workflow directory, and `mutation-parse.js` does not give them the dialect there. Plain `node --check` refuses them, as the table shows.

Redaction: the scratch repository's path is written `<scratch git repo>`, as in the main loop's evidence file. The run ids are omitted. No home path, scratch path or session id appears in these three files.
