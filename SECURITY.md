# Security

## Disclaimer

This repository is provided under the [MIT License](LICENSE) — use it at your own risk. The authors make no guarantees about the security or safety of any content, including skills, agents, teams, guides, scripts, and the visualization pipeline.

## What This Repository Contains

<!-- AUTO:START:security-surface -->
**Which artifact this describes.** Everything below is derived from **the repository at this revision**, whose `package.json` declares version `1.9.1`. That is not necessarily what `npm install agent-almanac` installs — the published version can lag this tree, and has. Check with `npm view agent-almanac version`. What ships, from `package.json`'s own `files`: `cli/adapters/`, `cli/lib/`, `cli/index.js`, `cli/README.md`, `skills/`, `agents/`, `teams/`, `guides/`, `LICENSE`, `README.md`. `package.json` ships too — npm always includes it — and it declares no `preinstall`/`install`/`postinstall` hooks, so nothing here executes on install. Everything else described below (`viz/`, `scripts/`, `workflows/`, `.claude/`) exists only in the repository. A vulnerability report against an npm-installed copy is in scope for the shipped list, and may be against older code than this document describes.

- **Skills, Agents, Teams, Guides**: mostly Markdown and YAML, plus **16 files that are not** (.bib, .py, .webp) — one of them an executable script, `skills/verify-web-app-runtime/scripts/verify_runtime.py`. All of it ships. 230 of 372 skills (~62%) declare `Bash` in their `allowed-tools`, meaning they instruct AI agents to execute shell commands when followed. Review any skill before letting an agent execute it.
- **Visualization pipeline** (`viz/`): A containerized R + Node.js + Vite build system with a Dockerfile, shell scripts, and an icon rendering pipeline. The Docker entrypoint serves content via a Python HTTP server.
- **Scripts** (`scripts/`): 37 top-level Node.js and shell tools — registry validation, README and translation generation, i18n gates, and a small number that deliberately mutate the working tree or run repository commands (`normalize-i18n-fences.js`, `mutation-check.js`, `gate-envelope.js`). Maintainer-invoked; `scripts/` is not in `package.json`'s `files` array, so none of it ships in the published package.
- **CLI** (`cli/`): The entry point `npx` executes (`bin` -> `cli/index.js`), and the only component that writes outside this repository. 13 adapters install content into other tools' configuration directories, at global (home) or PROJECT scope depending on the adapter and the `--scope` flag, using append-to-file, distill, file-per-item and symlink. Adapters: ai-edge, aider, claude-code, codex, copilot, cursor, gemini, hermes, openclaw, opencode, universal, vibe, windsurf.
- **Workflows** (`workflows/`): 3 executable orchestration scripts. They are not auto-installed and do not ship in the published package; the documented way to use one is to COPY its `.mjs` into `.claude/workflows/` by hand, after which Claude Code's Workflow tool runs it and it may spawn subagents with whatever tools those agents carry. Read one before copying it — that instruction is the whole security boundary.
- **Claude Code configuration** (`.claude/`): Agent discovery symlinks and permission settings.
<!-- AUTO:END:security-surface -->

## Reporting Issues

If you find a security issue, open a [GitHub issue](https://github.com/pjt222/agent-almanac/issues). There is no private disclosure process or guaranteed response timeline.

## Automated Scanning

- CodeQL uses GitHub's **server-managed default setup**, which commits no workflow YAML — so
  grepping `.github/workflows/` for it finds nothing. It runs on a **weekly** schedule and on
  pushes and pull requests against the default branch.
- **Fork pull requests reported nothing, and the setting that caused it has since changed.**
  Measured on 2026-08-19: our first external contribution (PR #589) reported *no checks at all* —
  0 workflow runs, 0 check-runs, 0 check-suites — while a same-day pull request from a local
  branch reported ten. The LIKELY cause is the fork-PR approval policy rather than CodeQL
  specifically — but that is a mechanism we inferred, not one we measured: the setting was not
  API-readable at the time, and the approval queue showed zero `action_required` runs, meaning
  GitHub never engaged Actions on that commit at all. If the attribution is wrong, loosening the
  policy will not have fixed the silence, which is the other reason the measurement below
  matters.
  On 2026-08-20 that policy was changed to its loosest value,
  `first_time_contributors_new_to_github` (#689), so a returning contributor's PR should now
  report checks without waiting for approval. **That has not yet been measured** — #589 is
  closed and remains the only fork PR in this repository's history, so the next external
  contribution is the measurement. Until then, treat "will my PR report checks?" as *unknown*
  rather than as either yes or no. The live setting is at
  `gh api repos/pjt222/agent-almanac/actions/permissions/fork-pr-contributor-approval`, though
  that endpoint needs admin rights — an external reader gets `401`/`403`, so ask us rather than
  assuming this paragraph has gone stale.
- **CodeQL default setup separately does not run on fork pull requests**, independently of the
  approval policy above — its PR scanning covers pull requests against the default or protected
  branches, [excluding those from forks](https://docs.github.com/code-security/code-scanning/enabling-code-scanning/configuring-default-setup-for-code-scanning).
  So even once validators report on your PR, expect no code-scanning result from it; ours runs
  on the weekly schedule and on the merge commit. (Scoped to *default setup* deliberately: a
  committed `codeql.yml` would be a different mechanism with different event coverage.)
- The exact event coverage is GitHub's to define and ours only to read. Prefer the live
  configuration over this file: `gh api repos/pjt222/agent-almanac/code-scanning/default-setup`
  (needs `security-events` access, so an external reader will likely get a 403 — the schedule and
  the two fork exclusions above are the parts that affect you)
- Dependabot is configured to monitor GitHub Actions and npm dependencies for known vulnerabilities
