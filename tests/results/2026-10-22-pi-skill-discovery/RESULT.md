# pi loads the skills the universal adapter installs (#1005)

**Measured 2026-10-22** with pi 1.4.0 (`@earendil-works/pi-coding-agent`) on Node v26.11.1, Linux (WSL). The agent-almanac CLI is `main` at `925b178bb`.

## Result

| Arm | Install | `isProjectTrusted()` | Skills pi lists | Diagnostics |
|---|---|---|---|---|
| link, trusted | `install commit-changes --framework universal` (project, relative link) and `install review-pull-request --framework universal -g` (absolute link), plus the control | `true` | `commit-changes` from `<project>/.agents/skills/`, `review-pull-request` from `~/.agents/skills/` | `warning: description is required` for the control |
| link, untrusted | the same tree | `false` | `review-pull-request` only | none: the project folder is not scanned |
| copy, trusted | `install commit-changes --framework universal --from-package copy`, run by the CLI of an npm-installed tarball, plus a staging probe | `true` | `commit-changes` from the copy in `<project>/.agents/skills/` | none |
| copy, untrusted | the same tree | `false` | none | none |

The files beside this one hold each arm's output: `link-trusted-true.json`, `link-trusted-false.json`, `copy-trusted-true.json` and `copy-trusted-false.json`. The sandbox root is replaced by `<sandbox>`.

What the arms show:

- **pi reads universal's folders.** A project install loads only when the project is trusted. A global install (`~/.agents/skills/`) loads in both arms. That matches pi's source: `dist/core/package-manager.js:291-307` walks `.agents/skills` from the working directory up to the git root, behind the trust check at `:2024-2027`, and `:2064` reads `~/.agents/skills` unconditionally.
- **pi follows the links.** The project link is relative and the global one absolute; both load.
- **pi loads a copy-mode install too**, a real directory carrying `.agent-almanac-copy.json`. The marker is not read as anything.
- **The trust value reached the loader.** The two project arms differ, and each prints the settings manager's own `isProjectTrusted()`, not just the value requested.

## Controls

- **A skill pi must refuse.** `<project>/.agents/skills/no-description/SKILL.md` has a `name:` and no `description:`. pi refuses it with `description is required` (trusted link arm). So the instrument reports a refusal when there is one.
- **A skill pi must skip.** `<project>/.agents/skills/.agent-almanac-staging-probe/SKILL.md` is a valid skill with a name and a description, inside a directory named like copy mode's staging directories. pi does not list it and reports nothing (trusted copy arm). It skips dot-prefixed entries, so a staging directory left by an interrupted copy is never read as a skill.

## Recipe

```bash
# pi, in its own temporary directory, without install scripts
P=$(mktemp -d) && (cd "$P" && npm init -y >/dev/null && npm install --ignore-scripts @earendil-works/pi-coding-agent@1.4.0)
PI="$P/node_modules/@earendil-works/pi-coding-agent"

# link arms: the checkout's CLI, HOME redirected, a git-init project so pi's ancestor walk stops there
R=$(mktemp -d) && mkdir -p "$R/home" "$R/proj" && git -C "$R/proj" init -q
(cd "$R/proj" && HOME="$R/home" node <repo>/cli/index.js install commit-changes --framework universal --source <repo>)
(cd "$R/proj" && HOME="$R/home" node <repo>/cli/index.js install review-pull-request --framework universal -g --source <repo>)
# control: a SKILL.md with `name:` and no `description:` at $R/proj/.agents/skills/no-description/
for t in true false; do HOME="$R/home" PI_OFFLINE=1 node measure.mjs "$PI" "$R/proj" "$R/home/.pi/agent" "$t"; done

# copy arm: the CLI of the packed tarball, installed the way an npm user installs it
(cd <repo> && npm pack --pack-destination "$R/pack")
mkdir -p "$R/np" && (cd "$R/np" && npm init -y >/dev/null && npm install --ignore-scripts "$R/pack/agent-almanac-1.9.1.tgz")
mkdir -p "$R/home-copy" "$R/proj-copy" && git -C "$R/proj-copy" init -q
(cd "$R/proj-copy" && HOME="$R/home-copy" node "$R/np/node_modules/agent-almanac/cli/index.js" install commit-changes --framework universal --from-package copy)
# control: a valid SKILL.md at $R/proj-copy/.agents/skills/.agent-almanac-staging-probe/
for t in true false; do HOME="$R/home-copy" PI_OFFLINE=1 node measure.mjs "$PI" "$R/proj-copy" "$R/home-copy/.pi/agent" "$t"; done
```

The packed tarball (`agent-almanac-1.9.1.tgz`, from `925b178bb`, sha256 `302a7677ee11e8c5…`) carries `main`'s copy mode. The published 1.9.1 predates it.

## What this does not measure

- **pi's interactive trust prompt.** The CLI decides trust through `--approve`, `--no-approve`, a saved decision or `defaultProjectTrust`, none of which reaches a `DefaultResourceLoader` built here. The trust arms show that the gate exists and what it gates.
- **pi's own `PI_CODING_AGENT_DIR` resolution.** `measure.mjs` passes the agent directory by hand. #1006 measures pi's `getAgentDir()`.
- **pi's package loader** (`pi install`). #1008 measures it.
- **Windows and macOS.**
