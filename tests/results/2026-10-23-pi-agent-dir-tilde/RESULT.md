# A literal `~/<dir>` in PI_CODING_AGENT_DIR lands where pi itself reads (#1006)

**Measured 2026-10-23** with pi 1.4.0 on Node v26.11.1, Linux (WSL), the `feat/1006-pi-adapter` branch.

#1006 resolves pi's agent directory with its own copy of pi's rule (`cli/lib/pi-agent-dir.js`). The unit tests pin each case against expected paths. This run checks the two resolvers against each other, with the variable as a shell would pass it: `PI_CODING_AGENT_DIR='~/pi-tilde'`, quoted, so the `~` reaches both programs unexpanded. `HOME` is a sandbox.

| Step | Output |
|---|---|
| `install commit-changes -f pi -g` (`install.txt`) | `+ commit-changes [pi] <sandbox>/home/pi-tilde/skills/commit-changes` |
| `audit -f pi -g` (`audit.txt`) | `OK   1 skills installed in <sandbox>/home/pi-tilde/skills` |
| pi's `getAgentDir()`, then `DefaultResourceLoader` (`measure-tilde.mjs`, `measure-tilde.json`) | agent directory `<sandbox>/home/pi-tilde`, skills `commit-changes` from `<sandbox>/home/pi-tilde/skills/commit-changes/SKILL.md`, 0 diagnostics |

- **The two resolvers agree.** pi read its agent directory itself, through `getAgentDir()`, and found the skill the CLI installed. The directory was not passed to it, unlike #1005's recipe.
- **No literal `~` directory was created** in the working directory, which a resolver without tilde expansion would have done.
- **The project was untrusted**, so only user-level folders were read.

The sandbox root is replaced by `<sandbox>` in every file.

## Recipe

```bash
R=$(mktemp -d) && mkdir -p "$R/home" "$R/proj" && git -C "$R/proj" init -q && cd "$R/proj"
HOME="$R/home" PI_CODING_AGENT_DIR='~/pi-tilde' node <repo>/cli/index.js install commit-changes -f pi -g --source <repo>
HOME="$R/home" PI_CODING_AGENT_DIR='~/pi-tilde' node <repo>/cli/index.js audit -f pi -g --source <repo>
HOME="$R/home" PI_CODING_AGENT_DIR='~/pi-tilde' PI_OFFLINE=1 node measure-tilde.mjs "$PI" "$R/proj"
```
