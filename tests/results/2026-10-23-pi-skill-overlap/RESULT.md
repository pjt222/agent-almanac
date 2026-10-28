# A skill in both `.pi/skills/` and `.agents/skills/`: what pi loads (#1006)

**Measured 2026-10-23** with pi 1.4.0 on Node v26.11.1, Linux (WSL), the `feat/1006-pi-adapter` branch.

A default install into a pi project writes a skill into both `.pi/skills/` (the pi adapter) and `.agents/skills/` (the universal adapter), and pi reads both. This records what pi 1.4.0's own loader does in each combination of link and copy. The project is trusted, the home directory is an empty sandbox, and the skill is `commit-changes` from this repository.

| Arm | `.pi/skills/` | `.agents/skills/` | Skills pi lists | Diagnostics |
|---|---|---|---|---|
| `link-link.json` | link | link to the same source | 1, from `.pi/skills/` | none |
| `copy-link.json` | copy | link | 1, from `.pi/skills/` | `name "commit-changes" collision`, for `.agents/skills/` |
| `link-copy.json` | link | copy | 1, from `.pi/skills/` | the same collision |
| `copy-copy.json` | copy | copy | 1, from `.pi/skills/` | the same collision |

- **Two links to one source load once, silently**, which is what a default install produces. Measured before #1006 was filed for the first two arms; this run adds the other two and records all four.
- **Any arm with a copy loads once, with a collision diagnostic.** `.pi/skills/` wins and the `.agents/skills/` entry is the one reported. `copy-copy` is what an install with `--from-package copy` produces, and the case `cli/README.md` and the CHANGELOG describe.

The sandbox root is replaced by `<sandbox>` in every file.

## Recipe

```bash
SRC=<repo>/skills/commit-changes
R=$(mktemp -d) && mkdir -p "$R/home" "$R/proj/.pi/skills" "$R/proj/.agents/skills" && git -C "$R/proj" init -q
ln -s "$SRC" "$R/proj/.pi/skills/commit-changes"      # or: cp -r "$SRC" ...
ln -s "$SRC" "$R/proj/.agents/skills/commit-changes"  # or: cp -r "$SRC" ...
cd "$R/proj" && HOME="$R/home" PI_OFFLINE=1 node measure-overlap.mjs "$PI" "$R/proj"
```

`$PI` is the installed `@earendil-works/pi-coding-agent@1.4.0` package directory. The probe's shape follows the one the #1020 review round used.
