# GEMINI.md

Concise workspace rules for Antigravity CLI, Gemini CLI, and other tools that load `GEMINI.md`. Kept well under Antigravity CLI's 24,000-byte per-file rule cap. For full historical context, rationales, and deep procedures, read `CLAUDE.md`, `CONTRIBUTING.md`, and `tools/README.md` on demand.

## Repository Overview

`agent-almanac` is a documentation-first library of five content types following the [Agent Skills open standard](https://agentskills.io), plus a cross-framework installer CLI (`cli/`), an interactive visualization (`viz/`), translations (`i18n/`), and operator utilities (`tools/`):

- **Skills** (`skills/<id>/SKILL.md`) — executable procedures (*how*)
- **Agents** (`agents/<id>.md`) — specialist personas (*who*)
- **Teams** (`teams/<id>.md`) — declarative multi-agent compositions (*who works together*)
- **Workflows** (`workflows/<id>.mjs`) — code-driven orchestration scripts (*how work is orchestrated*; Claude Code `.mjs` dialect)
- **Guides** (`guides/<id>.md`) — human-readable documentation (*context*)

**The `_registry.yml` files are the only authoritative count source** (`skills/_registry.yml`, `agents/_registry.yml`, `teams/_registry.yml`, `guides/_registry.yml`, `tools/_registry.yml`). Never guess or copy prose counts; verify against the registries or generated outputs.

## Non-Negotiable Rules & Gates

### 1. Required CI checks & local verification

`npm test` is the release gate and runs four checks: `validate:integrity`, `check-readmes`, `test:scripts`, and `test:cli` (Node.js `>=26.0.0` required per `package.json`).

Five GitHub Actions contexts are required on `main`: `line-endings`, `integrity`, `skills`, `scripts-test`, and `cli-test`. Never merge past a red required check.

- **Line endings:** Committed text blobs must use LF (`npm run validate:line-endings`). Repair with `git add --renormalize .`.
- **Generated READMEs & manifests:** Never hand-edit `<!-- AUTO:START:... -->` sections or the fully generated files (`guides/README.md`, `viz/README.md`, `teams/README.md`, `tests/README.md`, `.claude-plugin/plugin.json`). Run `npm run update-readmes` and verify with `npm run check-readmes`.
- **Generated artifact inventory:** Every generated-and-committed artifact is listed in `generated-artifacts.yml` and checked by `npm run check:generated-artifacts`.
- **Debt ratchet:** `npm run ratchet` checks `debt-ratchet.yml` by exact set in both directions.
- **Security scan:** `npm run validate:security` scans skill content; before posting any public GitHub text (PR body, issue, comment), run `bash tools/check-redaction.sh <file>`.

### 2. Skills, Agents, Teams & i18n

- **Skill length caps:** CI enforces `<= 494` lines (`scripts/check-skill-line-ceiling.js`, leaving 6 lines of headroom for i18n provenance frontmatter) and `<= 24,000` UTF-8 body bytes (`scripts/check-skill-byte-ceiling.js`, matching Antigravity CLI's per-skill truncation limit) on **all** English `SKILL.md` files, plus `<= 500` lines on `i18n/` mirrors. Extract long examples and reference tables into `references/`.
- **Skill sections:** YAML frontmatter (`name`, `description`, `allowed-tools`, `metadata`) plus `When to Use`, `Inputs`, `Procedure` (with `**Expected:**` / `**On failure:**` per step), `Validation`, `Common Pitfalls`, and `Related Skills`.
- **Templates:** Author scaffolding uses three exact names (`_template`, `_template.md`, `_template.mjs`), kept in sync across `scripts/lib/content-paths.js` and `scripts/lib/template-names.sh`. Never symlink `_template` into discovery directories.
- **Frozen code fences in `i18n/`:** Every fenced code block in a translated file is frozen (must match English bytes) unless tagged `text`, `markdown`, or `md`. If you edit a frozen fence in an English skill/agent/team/guide, propagate it to mirrors and verify with `npm run check:fence-propagation -- --id <id> [--tree <tree>]`.
- **No `.claude/teams` symlink:** Teams are blueprints in `teams/`; never symlink `~/.claude/teams` or `.claude/teams`.

### 3. Tests, Worktrees & Peer-Session Safety

- **Test teardown:** Use `rmTree(dir)` from `scripts/test/_tmp.js` in test suites, never bare `rmSync(dir, { recursive: true, force: true })`.
- **CLI test isolation:** Always use `sandboxEnv()` from `cli/test/sandbox-env.js` (or source `tools/sandbox-env.sh` for manual probes) so CLI runs never touch a user's real `~/.hermes`, `~/.openclaw`, or pi directory.
- **Worktrees:** Prefer a separate git worktree (`.claude/worktrees/<name>`) over sharing the main checkout. In a fresh worktree, symlink the three dependency dirs before running scripts/viz — note that trailing-slash `.gitignore` rules (`node_modules/`, `library/`) ignore directories, **not** symlinks, so on a fresh clone these appear untracked unless added to local `.git/info/exclude`; never stage them:
  - `node_modules` -> `<main>/node_modules`
  - `viz/node_modules` -> `<main>/viz/node_modules`
  - `viz/renv/library` -> `<main>/viz/renv/library`
- **Peer sessions & repo guard:** Read `skills/coordinate-peer-sessions/SKILL.md` before editing a shared tree. Never release or rebaseline a `guard:snapshot` you did not arm. Stage files by explicit path (`git add <file>`), never `git add -A` or `git add .`. Never store a peer-session scope declaration in `CONTINUE_HERE.md` (its reader consumes and deletes it).
- **Merging:** Use merge commits only (never squash), via `bash tools/merge-pr.sh <n> --head <sha>` once checks are green and reviewed.
- **Tools first:** Before writing a one-off helper script, check `tools/_registry.yml` / `tools/README.md` (e.g., `tools/review-bundle.sh`, `tools/check-redaction.sh`, `tools/fact-sheet.sh`, `tools/patch-literal.py`, `tools/watch-checks.sh`, `tools/merge-pr.sh`).

### 4. Empirical Discipline

- Distinguish clearly between **measured** (command run, tool version, commit SHA, exact output) and **read / inferred**.
- Prove gates can fail before trusting them (`npm run mutation-check`).
- Quote counts and metrics from the command or source that produced them, never from memory.

## Where to Read More

- `CLAUDE.md` — full repository architecture, CI job taxonomy, i18n mechanics, viz deploy model, and guard rules
- `CONTRIBUTING.md` — contributor checklist for adding skills, agents, teams, and guides
- `cli/README.md` — CLI adapters, copy/link modes, campfire commands, and audit exit codes
- `tools/README.md` — operator utilities and their `--verify` self-tests
- `workflows/README.md` — Phase 1 `.mjs` workflows and capability/containment contracts
