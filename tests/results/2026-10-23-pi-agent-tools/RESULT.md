# pi's subagent extension finds a generated agent, and pi activates exactly its mapped tools (#1007)

**Measured 2026-10-23** with pi 1.4.0 (`@earendil-works/pi-coding-agent`) on Node v26.11.1, Linux (WSL). The CLI is the `feat/1007-pi-agents` branch.

## Result

`agent-almanac install --agent code-reviewer -f pi -g` wrote `<agent-dir>/agents/code-reviewer.md` into a sandbox agent directory, set through `PI_CODING_AGENT_DIR`. `generated-code-reviewer-head.md` holds its frontmatter. code-reviewer declares `[Read, Edit, Grep, Glob, Bash, WebFetch]`. The install mapped them to `read, edit, grep, find, bash`, dropped `WebFetch` (pi has no built-in for it) and named it in the result.

Then `measure-agent.mjs` ran:

| Instrument | Input | Result |
|---|---|---|
| `discoverAgents(cwd, "user")` from pi's example `examples/extensions/subagent/agents.ts`, the call the extension makes by default | the sandbox agent directory, read through pi's own `getAgentDir()` | finds `code-reviewer` (source `user`), tools `read, edit, grep, find, bash`, model `null` |
| `createAgentSession({ tools })`, then `session.getActiveToolNames()` | the discovered agent's tools, as the extension passes them to `pi --tools` | active: `read, edit, grep, find, bash`, exactly the list |
| the same | the unmapped names `Read, Edit, Grep, Glob, Bash` (control) | active: none, and no error |
| the same | `Read` (control) | active: none, and no error |

- **The control arms are why the adapter generates the file instead of linking it.** Handed Claude Code's tool names, pi activates no built-in tool and says nothing, so a linked almanac agent would run with no tools and no message.
- **The positive arm shows the mapped names are pi's own.** `find` is the built-in that `Glob` becomes.
- **The agent carries no `model`.** The extension then passes no `--model`, and the subagent runs on its parent's model and thinking level (`index.ts:299-304` in the example).

The full output is in `measure-agent.json`, with the sandbox root replaced by `<sandbox>`.

## The positive arm #1007 names, 2026-11-06

#1007's criterion asks for the most common almanac line, `[Read, Write, Edit, Bash, Grep, Glob]`, which code-reviewer does not declare. web-developer declares exactly that line (as does shiny-developer). Re-run with the same recipe, pi 1.4.0, Node v26.11.1, from the `feat/1007-pi-agents` branch after its merge of `main` at `ce87dce34`:

| Instrument | Input | Result |
|---|---|---|
| `install --agent web-developer -f pi -g` | `[Read, Write, Edit, Bash, Grep, Glob]` | `tools: read, write, edit, bash, grep, find` (`generated-web-developer-head.md`), nothing dropped |
| `discoverAgents(cwd, "user")` | the sandbox agent directory | finds `web-developer` (source `user`), tools `read, write, edit, bash, grep, find`, model `null` |
| `createAgentSession({ tools })`, then `session.getActiveToolNames()` | the discovered tools | active: `read, write, edit, bash, grep, find`, exactly the list |
| the same | the unmapped `Read, Write, Edit, Bash, Grep, Glob` (control) | active: none, and no error |
| the same | `Read` (control) | active: none, and no error |

The full output is in `measure-agent-web-developer.json`, with the sandbox root replaced by `<sandbox>`. Its recipe is the one below with `web-developer` for `code-reviewer`, and `"Read,Write,Edit,Bash,Grep,Glob" "Read"` as the two control lists.

## Recipe

```bash
P=$(mktemp -d) && (cd "$P" && npm init -y >/dev/null && npm install --ignore-scripts @earendil-works/pi-coding-agent@1.4.0)
PI="$P/node_modules/@earendil-works/pi-coding-agent"
R=$(mktemp -d) && mkdir -p "$R/home" "$R/proj" && git -C "$R/proj" init -q
(cd "$R/proj" && HOME="$R/home" PI_CODING_AGENT_DIR="$R/agentdir" node <repo>/cli/index.js install --agent code-reviewer -f pi -g --source <repo>)
HOME="$R/home" PI_CODING_AGENT_DIR="$R/agentdir" PI_OFFLINE=1 \
  node measure-agent.mjs "$PI" "$R/sbx" "$R/proj" code-reviewer agent "Read,Edit,Grep,Glob,Bash" "Read"
```

`measure-agent.mjs` copies `agents.ts` out of the package into `$R/sbx`, beside a `node_modules` link to the package's own, because Node does not strip TypeScript types under `node_modules`.

## What this does not measure

- **A model call.** The session is created and its active tools read; no turn runs.
- **The extension's process spawn**: `pi --mode json -p --tools <list>`. `createAgentSession({ tools })` skips only the CLI's splitting of the comma list.
- **Windows**, where the map keeps `bash`: pi's docs say its bash tool runs through Git Bash there by default.
