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

### `pi install npm:agent-almanac` today: 1.9.1 from the registry

The control a pi user meets before a release carries the key. `pi install npm:agent-almanac` ran in a redirected HOME and agent directory, with npm's cache redirected and `npm_config_ignore_scripts=true`. It installed 1.9.1, which has no `pi` key and no `pi-package` keyword:

| Source | Skills | Skills prompt | Diagnostics |
|---|---|---|---|
| `pi install npm:agent-almanac` (registry, 1.9.1) | 371 | 273,624 chars at a 93-character sandbox prefix; 226,029 without the paths | 0 |

The output is in `registry-1.9.1.json`.

### How the figures depend on the install path

pi's block names each skill's absolute path exactly once. This was measured by counting each loaded skill's `filePath` in the rendered block: one occurrence each, in every arm. So a figure moves by (prefix length difference) × (skill count) at another install location.

| Arm | Block without the paths | Prefix ahead of `skills/` |
|---|---|---|
| npm pack, no manifest (374 skills) | 228,068 characters | 53 characters |
| npm pack, manifest (27 skills) | 17,081 characters | 59 characters |

At a typical `/home/<user>/.pi/agent/npm/node_modules/agent-almanac/` prefix of 53 characters, all of 1.9.1's skills come to about 258,800 characters, about 64,700 tokens by pi's chars/4 estimate.

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

- **`pi install npm:agent-almanac` of a version that carries the key**, which needs a publish. 1.9.1 from the registry is measured above.
- **The gallery listing** that the `pi-package` keyword makes the package eligible for.
- **Windows and macOS.**
