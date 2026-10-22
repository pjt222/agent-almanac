# pi loads exactly the curated skills from the agent-almanac package (#1008)

**Measured 2026-10-22** with pi 1.4.0 (`@earendil-works/pi-coding-agent`) on Node v26.11.1, Linux (WSL). The package is this branch at `b8df68680`, packed with `npm pack` (sha256 `ad05537ffa274037…`) and cloned with `git clone`. The branch was then rebased onto #1005's as `124231183`, with `package.json` unchanged.

## Result

pi loads packages from the paths its user settings declare. Each arm declares one source in a fresh, redirected agent directory, and lists what pi's `DefaultResourceLoader` loads (`measure-package.mjs`, no model).

Every source has one fixture added: a root-level `skills/zz-probe.md` with a `name:` and a `description:`. The "no manifest" sources also have the `pi` key removed from `package.json`.

| Source | `pi` key | Skills loaded | Root probe | Template (`skill-name-here`) | Skills prompt | Diagnostics |
|---|---|---|---|---|---|---|
| unpacked `npm pack` | yes | 27 | not loaded | not shipped | 19,421 chars (~4,856 tokens) | 0 |
| unpacked `npm pack` | removed | 374 | loaded | not shipped | 261,081 chars (~65,271 tokens) | 0 |
| `git clone` | yes | 27 | not loaded | not loaded | 19,367 chars (~4,842 tokens) | 0 |
| `git clone` | removed | 375 | loaded | loaded | 261,631 chars (~65,408 tokens) | 0 |
| `pi install <unpacked npm pack>` | yes | 27 | not loaded | not shipped | 19,421 chars | 0 |

- **The manifest arms load exactly `pi.skills`.** The 27 names loaded equal the 27 ids in `package.json`'s `pi.skills`, checked by sorting both.
- **The controls show what the manifest prevents.** Without the key, pi scans the root of `skills/`, so the probe loads: 373 skills plus the probe. From a clone it also loads the template, `skills/_template/SKILL.md`, as `skill-name-here`: 373 plus probe plus template. `skills/README.md` has no frontmatter and is dropped silently in every arm, with no diagnostic.
- **The prompt figures** are pi's own `formatSkillsForPrompt()` over the loaded skills, with tokens by pi's chars/4 estimate. They include each skill's absolute path, so they vary with the install location.
- **`pi install <dir>`** wrote `{"packages": ["../npm-manifest/package"]}` into the redirected agent directory's `settings.json` and loaded the same 27 skills. `pi install npm:agent-almanac` itself needs a published version and was not run.

The JSON files beside this one hold each arm's output, with the sandbox root replaced by `<sandbox>`.

## Recipe

```bash
# pi, in its own temporary directory, without install scripts
P=$(mktemp -d) && (cd "$P" && npm init -y >/dev/null && npm install --ignore-scripts @earendil-works/pi-coding-agent@1.4.0)
PI="$P/node_modules/@earendil-works/pi-coding-agent"

R=$(mktemp -d)
(cd <repo> && npm pack --pack-destination "$R/pack")
mkdir -p "$R/npm-manifest" && tar -xzf "$R/pack/agent-almanac-1.9.1.tgz" -C "$R/npm-manifest"    # -> package/
git clone -q <repo> "$R/git-manifest-clone"
# add skills/zz-probe.md (name + description) to both; copy each to a *-nomanifest twin and delete
# its package.json "pi" key

# per arm: a fresh HOME and agent dir declaring the source, and an empty git project as cwd
printf '{ "packages": ["%s"] }\n' "<source dir>" > "$H/.pi/agent/settings.json"
HOME="$H" PI_OFFLINE=1 node measure-package.mjs "$PI" "<project>" "$H/.pi/agent"

# the pi install arm
HOME="$H" PI_CODING_AGENT_DIR="$A" PI_OFFLINE=1 node "$PI/dist/bundle/cli.js" install "$R/npm-manifest/package"
HOME="$H" PI_OFFLINE=1 node measure-package.mjs "$PI" "<project>" "$A"
```

## What this does not measure

- **`pi install npm:agent-almanac` from the registry**, which needs a published version with the key.
- **The gallery listing** that the `pi-package` keyword makes the package eligible for.
- **Windows and macOS.**
