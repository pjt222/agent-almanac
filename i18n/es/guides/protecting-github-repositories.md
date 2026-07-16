---
title: "Protecting GitHub Repositories"
description: "Honest threat model, tiered checklist, rulesets vs branch protection, and the CI-bot bypass problem for hardening a public GitHub repo"
category: infrastructure
agents: [security-analyst]
teams: []
skills: [assess-github-repo-security, harden-github-repo-security]
locale: es
source_locale: en
source_commit: 84a3c915
translator: "Claude + human review"
translation_date: "2026-07-16"
---

# Protecting GitHub Repositories

Hardening a GitHub repository is mostly a sequence of small, well-understood toggles — but a handful of them silently change *who* is gated, break a CI auto-commit bot, or provide a false sense of security while protecting almost nothing. This guide is the human-facing walkthrough: it explains the honest threat model behind ref protection, gives a tiered checklist you can apply in order, contrasts rulesets with classic branch protection, and walks through the single hardest problem — letting trusted automation write to a protected branch. Assess first, then harden.

The running example throughout is the concrete case that trips most people up: a **public, user-owned** repository (like this one, `pjt222/agent-almanac`) whose CI **auto-commits to the default branch** via `stefanzweifel/git-auto-commit-action` using the default `GITHUB_TOKEN`. Everything here is grounded in current GitHub behavior; where a control interacts badly with that bot, it is called out explicitly.

## When to Use This Guide

- You own a public repository and want to harden it without breaking a working CI pipeline that pushes to `main`.
- You are about to turn on branch protection or a ruleset and want to know what it actually stops — and what it does not.
- Your CI bot suddenly started getting `403` on its push, or your PRs are stuck on a check that never runs.
- You are choosing between classic branch protection and repository rulesets and want the honest tradeoffs.
- A single-maintainer repo locked you out of merging your own pull requests.

## Prerequisites

- Admin access to the repository (most controls require it).
- The [`gh` CLI](https://cli.github.com) authenticated (`gh auth status`) — every command here uses it, and the API is the source of truth over the UI.
- A completed **assessment** of the repo's current posture — run the [`assess-github-repo-security`](../skills/assess-github-repo-security/SKILL.md) skill *before* changing anything, so you know your baseline and do not toggle controls you already have.
- If your CI writes to a protected branch, know which action does the push and which token it uses.

## Workflow Overview

The order matters. Hardening blind is how you break the bot or lock yourself out.

1. **Assess** — inventory the current state with [`assess-github-repo-security`](../skills/assess-github-repo-security/SKILL.md): existing rules, token defaults, enabled security features, and how CI pushes.
2. **Apply the zero-downside baseline** — the essential tier below hardens the repo *without* touching anything the bot depends on.
3. **Decide on required checks / required PR** — this is the fork in the road. It is the single control most in tension with a direct-push bot; if you want it, you must first provision a bypass identity for the bot (see the bypass matrix).
4. **Harden the automation path** — swap the bot to a GitHub App token and add the App as a ruleset bypass actor, or route it through a pull request.
5. **Verify** — re-run the assessment; confirm the bot still pushes and humans/forks are still gated.

The [`harden-github-repo-security`](../skills/harden-github-repo-security/SKILL.md) skill drives steps 2–4 as an executable procedure; the [security-analyst](../agents/security-analyst.md) agent is the persona that owns this end-to-end.

## The Honest Threat Model

Ref protection — whether you call it a *ruleset* or a *branch protection rule* — protects **one ref**, not the repository. Internalizing that sentence prevents most false-security mistakes.

**What ref protection does stop:** rewriting, force-pushing, or deleting the protected branch; landing changes to it without a pull request (if you require one); merging before required status checks pass. It gates the *history of one branch*.

**What it does NOT stop:**

- A write collaborator pushing to any **unprotected** branch, then adding a malicious workflow that runs with your repo's token.
- Moving or creating **tags** (unless you also protect tags with a tag ruleset).
- Introducing a **compromised or typo-squatted action** into a workflow that holds `contents: write`.
- A workflow triggered on **`pull_request_target`** that checks out the PR head. This trigger runs in the *base-repo* context with secrets and a write token regardless of branch protection, so checking out untrusted code under it is a documented privilege-escalation / RCE pattern. Avoid `pull_request_target` for anything that checks out untrusted code, and never interpolate `${{ github.event.pull_request.* }}` fields directly into a `run:` shell step (route them through an intermediate `env:` var). Ref protection does nothing about this.
- Secrets already committed (protection is about refs, not content) — that is what secret scanning and push protection are for.

So a branch rule is one layer. Ruleset scope, an allowed-actions policy, fork-PR approval, and secret scanning matter as much as the branch rule itself. Treat "the branch is protected" as *necessary, not sufficient*.

### The mental-model shift that catches everyone

Here is the subtle part. Under **classic branch protection**, repository admins bypass the rules **by default** — the rule simply does not apply to them unless you also check *"Do not allow bypassing the above settings"* (`enforce_admins=true`). That toggle is all-or-nothing: it applies the rules to *every* admin or *no* admin, with no per-actor granularity.

**Rulesets invert this default.** A ruleset applies to admins too — nobody is exempt *unless they are explicitly added to the ruleset's `bypass_actors` list*. There is no `enforce_admins` toggle on a ruleset.

Porting the classic "admins can always bypass" mental model to a ruleset **silently changes who is gated**:

- If you *assume* you (as admin) can always push past a ruleset, you will be surprised by a `403` — the ruleset gates you unless you added your admin role to the bypass list.
- Conversely, if you migrate from classic BP where admins were quietly exempt, a ruleset will now enforce against those same admins — usually what you wanted, but a behavior change to be aware of.

This is why the assessment step matters: the same words ("branch protection") describe two systems with opposite default answers to "does this apply to me?"

## Rulesets vs Classic Branch Protection

**Prefer repository rulesets. Treat classic branch protection as legacy.** GitHub's own docs position classic BP as the thing rulesets are an "alternative" to, and rulesets are the actively developed path.

| Capability | Repository Ruleset | Classic Branch Protection |
|---|---|---|
| Availability on free public user-owned repo | Yes, fully free | Yes |
| Multiple rules stack (most-restrictive wins) | Yes | No — one rule matches |
| Per-actor bypass list (roles, teams, Apps, deploy keys) | Yes | No |
| Exempt a *specific actor* from required status checks | Yes | **No — impossible** |
| Admin exemption model | Per-actor via bypass list | All-or-nothing (`enforce_admins`) |
| Target multiple branches / tags by pattern | Yes (`~DEFAULT_BRANCH`, `~ALL`, fnmatch) | Limited |
| Tag protection | Tag ruleset (`target: tag`) | Deprecated 2024-08-30, auto-migrated |

Two facts do the heavy lifting for the running example:

- **Rulesets are free on public user-owned repos.** The docs are explicit — do not tell a free personal-public-repo owner to upgrade. (Only *private* personal repos need GitHub Pro for rulesets; org-wide rulesets and the "Evaluate" dry-run mode are the Team/Enterprise-gated pieces.)
- **Classic BP cannot exempt any actor from required status checks.** Its push allowlist ("Restrict who can push") is organization-only and, even where available, governs *who may push*, not *who may skip checks*. GitHub staff redirected the multi-year feature request for this to rulesets. For any "let one specific bot through required checks" need — exactly the auto-commit case — rulesets are mandatory.

A minimal, safe default-branch ruleset (force-push + deletion protection only — this does **not** break a direct-push bot):

```bash
gh api --method POST /repos/OWNER/REPO/rulesets --input - <<'JSON'
{
  "name": "protect-default",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "rules": [ { "type": "deletion" }, { "type": "non_fast_forward" } ]
}
JSON
```

Inspect what exists before and after: `gh api /repos/OWNER/REPO/rulesets` and `gh api /repos/OWNER/REPO/rulesets/RULESET_ID --jq '.bypass_actors'`.

## The Tiered Hardening Checklist

Apply top to bottom. The **essential** tier is zero-downside and does not break the auto-commit bot; **recommended** introduces the bot-bypass decision; **advanced** is high-friction or niche.

### Essential (zero-downside baseline)

- **Force-push + deletion protection** via a default-branch ruleset (`non_fast_forward` + `deletion`). The cheapest, no-downside hardening; safe for a direct-push bot.
- **Set the default `GITHUB_TOKEN` to read-only** and disable token PR approval. This is a *default*, not a hard cap, for same-repo push events — so it does not break the bot **provided the committing job grants `contents: write` back** (the next bullet). If your workflow has no explicit `permissions:` block and relied on the ambient write default, add that grant *first* or the `git-auto-commit-action` push `403`s.
  ```bash
  gh api --method PUT /repos/OWNER/REPO/actions/permissions/workflow \
    -f default_workflow_permissions=read -F can_approve_pull_request_reviews=false
  ```
- **Least-privilege per-workflow permissions.** Top-level `permissions: {}` in the workflow YAML, then grant `contents: write` back only on the job that commits — `git-auto-commit-action` needs nothing more.
- **Pin every action to a full 40-char commit SHA** (including `actions/checkout` and `stefanzweifel/git-auto-commit-action`), with the human-readable version in a trailing comment. A mutable tag is a supply-chain hole on a workflow that holds `contents: write`.
  ```yaml
  - uses: stefanzweifel/git-auto-commit-action@<40-char-sha>  # v6.x.x
  ```
- **Leave fork-PR approval at the public-repo default** ("Require approval for first-time contributors"). Fork `pull_request` runs already get a read-only token and no secrets.
- **Enable Dependabot alerts + security updates + a `.github/dependabot.yml`.** Alerts and fixes are *separate* toggles — enable both, or you detect vulnerabilities and fix nothing. Include a `github-actions` ecosystem block to keep action SHAs fresh.
  ```bash
  gh api -X PUT repos/OWNER/REPO/vulnerability-alerts      # alerts + dependency graph
  gh api -X PUT repos/OWNER/REPO/automated-security-fixes  # Dependabot fix PRs
  ```
- **Enable secret scanning + push protection** (free and usually already on for public repos); add `.github/SECURITY.md` and private vulnerability reporting (both per-repo, no org needed).
  ```bash
  gh api -X PATCH repos/OWNER/REPO --input - <<<'{"security_and_analysis":{"secret_scanning":{"status":"enabled"},"secret_scanning_push_protection":{"status":"enabled"}}}'
  gh api -X PUT repos/OWNER/REPO/private-vulnerability-reporting
  ```
- **Do NOT purchase GHAS / Secret Protection / Code Security for a public repo.** Secret scanning, push protection, CodeQL, and dependency review are already free on public repos; those paid products are private/org-only.

### Recommended

- **Add `required_status_checks`** to the ruleset with `do_not_enforce_on_create=true` and `strict_required_status_checks_policy=true`. **Critical:** this blocks the bot's direct push unless you provision a bypass (next item), *and* the checks must run on `push`, not only `pull_request`, or they never report and the push is permanently blocked.
- **Add a `pull_request` rule** if you want a review surface. On a solo repo keep `required_approving_review_count: 0` — you cannot approve your own PR, and `>= 1` is an unsatisfiable self-lockout.
- **Provision a GitHub App bypass for the bot** (Contents: read/write) via `actions/create-github-app-token`, pass the token to checkout + `git-auto-commit-action`, and add the App as an `Integration` bypass actor with `bypass_mode: always`. This is the correct realization of "let the bot through" once required checks/PR are on.
- **Enable CodeQL "default setup"** (server-managed) rather than advanced setup, so no extra workflow YAML is committed into a repo that auto-commits.
- **Set merge-method toggles to match policy** (e.g. merge-commits-only: `allow_squash_merge=false`, `allow_rebase_merge=false`) and auto-delete head branches on merge.
- **Restrict the allowed-actions policy** to GitHub-owned + an explicit allow-list that *includes* `stefanzweifel/git-auto-commit-action` (it is not GitHub-owned; omitting it silently fails the workflow).

### Advanced

- **Protect release tags** with a tag ruleset (`target: tag`, e.g. `v*`).
- **Enable the `sha_pinning_required` repo policy** (2025-08-15) — but only *after* converting every `uses:` to a full SHA, or every run fails. First confirm the field is actually exposed on a free user-owned public repo (it may be org/enterprise-gated): `gh api /repos/OWNER/REPO/actions/permissions --jq '.sha_pinning_required'`.
- **`dismiss_stale_reviews_on_push` + require conversation resolution + `require_last_push_approval`** — only meaningful once you run human PR reviews; a chatty auto-commit bot pushing into open PRs can make them perpetually unmergeable.
- **CODEOWNERS + `require_code_owner_review`** — low value on a solo repo (you can only list `@users`, and the sole owner cannot satisfy it as PR author).
- **Require signed commits** — high friction: `git-auto-commit-action` pushes unsigned via git CLI, so this blocks the bot. `GITHUB_TOKEN` commits are auto-verified only via the Contents API, not `git push`.
- **Require linear history** — mutually exclusive with a merge-commits-only policy; pick one.

## Automation Through Protection: The Bot Bypass Problem

This is the crux of the running example. Once you turn on required checks or require-a-PR, a push to the default branch must either satisfy the rules or come from a **bypass actor**. And here is the hard constraint that no toggle removes:

> The default `GITHUB_TOKEN` / `github-actions[bot]` **cannot** be added to any bypass list and **cannot** push to a protected branch. This is by GitHub design — otherwise any collaborator could ship a workflow that writes to any branch. Any plan phrased as "just add the Actions bot to bypass" silently has no such option, and the bot's push `403`s.

So to let trusted automation through, you must give it a *real* bypass-eligible identity. Ranked from best to worst:

| Approach | Keeps checks enforced for humans? | Least-privilege rank | Verdict |
|---|---|---|---|
| PR-based (create-pull-request) with a **GitHub App token**, human clicks merge — no standing bypass | Yes | 1 | Strongest separation of duties. App token makes checks actually fire on the bot's change; no standing branch bypass. Not fully hands-off — a human merges. |
| **GitHub App** installation token (Contents: read/write) + App as `Integration` bypass actor, `bypass_mode: always` | Yes | 2 | **Recommended default for full automation.** Repo-scoped, ~1h ephemeral, identity-scoped bypass; humans/forks/admins stay gated. Crown-jewel risk shifts to the App private key. |
| SSH **deploy key** (write) + `DeployKey` bypass actor, push over SSH | Yes | 3 | Good narrow single-repo alternative — no App to maintain, no API scope. One private key per repo to rotate. Slightly coarser identity than an App. |
| Bot-account **PAT** as a `User` bypass actor | Yes | 4 | Anti-pattern. Long-lived, tied to a maintained account; rotation/offboarding risk; re-triggers workflows (needs a loop guard). Stopgap only. |
| Admin/fine-grained **PAT** + `Repository admin` role in bypass | **No** | 5 | Worst. Role-wide hole — exempts *all* admin actions including your own interactive pushes, not just automation. A leaked PAT = admin bypass-write. |
| Add the default **`GITHUB_TOKEN`** to the bypass list | — | 6 | **Impossible.** Not a selectable actor by design; the push `403`s. |

> **Verify the bypass-actor picker before you commit to this.** Historically the ruleset bypass-actor UI did **not** appear on user-owned (personal) repositories — the exact repo class this guide centers on. Before you build the App and flip on required checks / require-a-PR for real, open **Settings > Rules > Rulesets > (your ruleset) > Bypass list > Add bypass** and confirm the App is actually selectable. If it is not, the required-checks / required-PR combination is **unsatisfiable** on a personal repo — the bot's direct push cannot be let through by any means — and GitHub's documented workaround is to move the repo under a (free) **organization**, where App and role bypass actors are reliably available. This is version-dependent, so check your own repo rather than assuming the App route works.

The **GitHub App** route (rank 2) is the recommended default *once you have confirmed the App is addable as a bypass actor*. Mint the token at runtime and wire it through the bot:

```yaml
- uses: actions/create-github-app-token@<sha>  # official
  id: app-token
  with:
    app-id: ${{ vars.APP_ID }}
    private-key: ${{ secrets.APP_PRIVATE_KEY }}
- uses: actions/checkout@<sha>
  with:
    token: ${{ steps.app-token.outputs.token }}
- uses: stefanzweifel/git-auto-commit-action@<sha>  # inherits the App token
```

Then add the App to the ruleset bypass list:

```bash
gh api --method PUT /repos/OWNER/REPO/rulesets/RULESET_ID --input - <<'JSON'
{
  "name": "protect-default",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "bypass_actors": [ { "actor_id": <APP_ID>, "actor_type": "Integration", "bypass_mode": "always" } ],
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "required_status_checks", "parameters": { "strict_required_status_checks_policy": true, "do_not_enforce_on_create": true, "required_status_checks": [ { "context": "build" } ] } }
  ]
}
JSON
```

Two follow-ups once an App token or PAT is in play: (1) the crown-jewel secret is now the **App private key** — store it as an Actions secret, scope the App install to the single repo, and rotate; (2) unlike the default `GITHUB_TOKEN` (which suppresses downstream triggers), an App/PAT push **re-triggers** `on: push` workflows, so add a loop guard (`if: github.actor != '<app>[bot]'`, `paths-ignore`, or `[skip ci]`).

## Common False-Security Traps

These are the beliefs that feel like security but are not.

- **"Just add the github-actions bot to the ruleset bypass list."** It is not a selectable actor; the push `403`s. Use a GitHub App or deploy key identity.
- **"Convert the bot from push to a PR to satisfy the rules."** A PR opened by the default `GITHUB_TOKEN` does **not** trigger `pull_request`/`push` workflows, so required checks never run and the PR sits on "expected/pending" forever. The PR must be created with an App token or PAT.
- **"Required status checks mean nothing unreviewed lands."** Without a *required-PR* rule, anyone with write can still push directly if a check reports on push; and in classic BP admins bypass by default unless `enforce_admins=true`. Rulesets differ — they do not auto-exempt admins — so porting the classic mental model silently changes who is gated.
- **"Branch protection protects the repo from a malicious collaborator."** It protects one ref. A write collaborator can push to unprotected branches, add a malicious workflow, or move tags. Scope, allowed-actions policy, and fork approval matter as much.
- **"Public-repo secret scanning stops leaks."** Alerts fire *after* the commit; push protection blocks at push time but the auto-commit bot cannot click the interactive web bypass, so a CI-committed secret just fails the job — treat it as a real finding, not a flake. The free tier also covers provider patterns only, not every generic secret.
- **"Require signed commits is free hardening."** It blocks the bot, which pushes unsigned via git CLI. Keeping both requires an API-based commit action.
- **"Swap `GITHUB_TOKEN` for a broad PAT to get past protection."** A PAT is long-lived and account-wide — a strict privilege escalation over the ephemeral repo-scoped token. Prefer an App or deploy key.
- **"Buy GHAS to secure a public repo."** Those features are already free on public repos; the paid split targets private/org repos only.

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| Bot push `403`s after enabling required checks / require-PR | The default `GITHUB_TOKEN` cannot be a bypass actor and cannot push to a protected branch | Provision a GitHub App token (or deploy key) and add that identity to the ruleset `bypass_actors`; pass the token to checkout + `git-auto-commit-action` |
| Cannot add the App (or any actor) to the ruleset bypass list on a personal repo | The bypass-actor picker historically did not appear on user-owned repos; without it, required-checks/required-PR + a direct-push bot is unsatisfiable | Verify the picker under Settings > Rules > Rulesets > Bypass list; if it is absent, move the repo under a free organization (GitHub's documented workaround) or keep the default branch at the essential-tier baseline only |
| PR opened by the bot is stuck on a check that shows "expected"/pending forever | A PR created with the default `GITHUB_TOKEN` does not trigger `pull_request`/`push` workflows, so checks never run | Create the PR with a GitHub App token (or PAT), which fires both event types; then the checks actually run and can gate the merge |
| Solo maintainer cannot merge own PR | `required_approving_review_count >= 1` (or `require_code_owner_review`) — you cannot approve your own PR, and a ruleset does not auto-exempt you as admin | Set `required_approving_review_count: 0`, or add a second reviewer / a second trusted App as a bypass path |
| New branch cannot be created; "required status check is expected" | Required checks block branch *creation* — CI cannot have run on a branch that does not exist (catch-22); or checks only trigger on `pull_request` and never report on a push | Set `do_not_enforce_on_create: true` on the `required_status_checks` rule, and make the check run on `push`, not only `pull_request` |
| `sha_pinning_required` breaks every workflow run | The policy fails any `uses:` not pinned to a full 40-char SHA, including `actions/checkout@v4` | Convert *all* `uses:` to full commit SHAs *before* enabling the policy |
| `allowed_actions=selected` fails the auto-commit job | `github_owned_allowed=true` still blocks `git-auto-commit-action` — it is not GitHub-owned | Add `stefanzweifel/git-auto-commit-action@*` to `patterns_allowed` |
| Bot loops / re-triggers itself after switching to an App token | App/PAT pushes re-trigger `on: push` (default `GITHUB_TOKEN` suppressed them) | Add a loop guard: `if: github.actor != '<app>[bot]'`, `paths-ignore`, or `[skip ci]` in the commit message |

## Related Resources

- [`assess-github-repo-security`](../skills/assess-github-repo-security/SKILL.md) — inventory the current posture **first**; run before any hardening
- [`harden-github-repo-security`](../skills/harden-github-repo-security/SKILL.md) — the executable procedure that applies this checklist and the bot bypass
- [security-analyst](../agents/security-analyst.md) — the agent persona that owns repository hardening end-to-end
- [WSL Maintenance & Claude Code Reference](wsl-maintenance.md) — periodic security-scan greps for leaked secrets and hardcoded paths
- [Setting Up Your Environment](setting-up-your-environment.md) — first-time environment, shell, and Claude Code setup
