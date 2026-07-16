---
name: harden-github-repo-security
description: >
  Apply GitHub repository security protections tier by tier — rulesets,
  read-only Actions token, secret scanning + push protection, Dependabot,
  and (gated) required status checks / required PR with a GitHub App bypass
  for a CI auto-commit bot. Mutating and confirmation-gated: always assess
  first, apply the zero-downside baseline, then decide required checks
  separately. Use when hardening a public user-owned repo after an audit,
  when a repo has no branch protection, when adding required checks without
  breaking a bot that pushes to the default branch, or when provisioning a
  GitHub App bypass actor for trusted automation.
license: MIT
allowed-tools: Read Write Edit Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: advanced
  language: multi
  tags: github, security, rulesets, branch-protection, github-actions, hardening
---

# Harden GitHub Repository Security

Apply GitHub protections in order of blast radius: assess, then a zero-downside
baseline that never breaks CI, then a gated decision on required checks / PR.
Every mutating step is confirmation-gated. Running example: a **public,
user-owned** repo whose CI auto-commits to the default branch via
`stefanzweifel/git-auto-commit-action` with the default `GITHUB_TOKEN`.

Throughout, `R` = `OWNER/REPO` (e.g. `pjt222/agent-almanac`). Set it once:
`R=OWNER/REPO`. All `gh api` writes require repo admin.

## When to Use

- Hardening a public user-owned repo after `assess-github-repo-security`
- A repo has no ruleset / branch protection and you want a safe baseline
- Adding required status checks or required PR **without** breaking a bot that
  pushes to the default branch
- Provisioning a GitHub App (or deploy key) bypass actor for trusted automation

## Inputs

- **Required**: `OWNER/REPO` and admin access (`gh auth status` shows admin)
- **Required**: whether a CI bot pushes to the default branch (and which action/identity)
- **Optional**: assessment report from `assess-github-repo-security`
- **Optional**: exact CI check `context` name(s) to require (must run on `push`)
- **Optional**: GitHub App id + private key if going to required checks/PR

## Procedure

### Step 1: Assess First and Confirm Scope

Never mutate blind. Run the read-only assessment and confirm the plan with the user.

```bash
# 1. Run the companion read-only skill first (or its core probes):
gh api /repos/$R --jq '{visibility,default_branch,is_org:.organization!=null}'
gh api /repos/$R/rulesets --jq '.[] | {id,name,enforcement}'
gh api /repos/$R/actions/permissions/workflow

# 2. Confirm the two decisive facts before any write:
#    - Is the repo PUBLIC and USER-OWNED?  (rulesets are free here)
#    - Does a bot push to the default branch?  (gates Step 3 entirely)
```

Confirm with the user: baseline (Step 2) is always safe; Step 3 (required
checks / PR) is a separate opt-in that **will** block a default-branch bot
unless a bypass is provisioned first.

**Expected:** You know visibility, owner type, current rulesets, current token
default, and whether a bot pushes to the default branch. The user has approved
applying at least the baseline.

**On failure:** If the repo is **private and user-owned**, rulesets need GitHub
Pro — stop and surface that. If not admin, stop (writes will 403). If a bot
pushes to the default branch, flag that Step 3 is blocked until Step 3a runs.

### Step 2: Apply the Zero-Downside Baseline (never breaks a CI auto-commit)

This tier hardens the repo without breaking a direct-push bot. Apply after
confirmation. Force-push/deletion protection, a read-only token default, the
free security features, and policy files.

```bash
# 2a. Default-branch ruleset: force-push + deletion protection ONLY.
#     These do NOT block the bot's direct push.
gh api --method POST /repos/$R/rulesets --input - <<'JSON'
{
  "name": "protect-default",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "rules": [ { "type": "deletion" }, { "type": "non_fast_forward" } ]
}
JSON

# 2b. Actions token: read-only default + no token PR approval.
#     A DEFAULT (not a cap) for same-repo push events, so the bot still works
#     once its job declares contents: write.
gh api --method PUT /repos/$R/actions/permissions/workflow \
  -f default_workflow_permissions=read \
  -F can_approve_pull_request_reviews=false

# 2c. Free security features (all free on public repos):
gh api -X PUT repos/$R/vulnerability-alerts          # alerts + dependency graph
gh api -X PUT repos/$R/automated-security-fixes      # Dependabot fix PRs (separate toggle!)
gh api -X PATCH repos/$R --input - <<'JSON'
{"security_and_analysis":{"secret_scanning":{"status":"enabled"},"secret_scanning_push_protection":{"status":"enabled"}}}
JSON
gh api -X PUT repos/$R/private-vulnerability-reporting
```

Leave **Settings > Actions > General** fork-PR approval at the public-repo
default ("Require approval for first-time contributors"). Fork `pull_request`
runs already receive a read-only `GITHUB_TOKEN` with no access to secrets, so a
fork cannot auto-commit to the default branch (no REST toggle — this is a UI
setting; tighten to "all external contributors" only if the repo has secrets or
self-hosted runners).

Then add two tracked files (commit them):

`.github/dependabot.yml` — include a `github-actions` block so action SHAs stay fresh:

```yaml
version: 2
updates:
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

`.github/SECURITY.md` — a short disclosure policy pointing reporters at the
"Report a vulnerability" button (private vulnerability reporting, enabled above).

Flipping the token default to `read` silently strips write from **every**
workflow that assumed a write default, not just the auto-commit job. Audit
**all** files in `.github/workflows/` and declare the minimal `permissions:` each
job actually needs — common scopes are `contents`, `packages`, `pull-requests`,
`pages`, and `id-token`. For the running example: top-level `permissions: {}`,
`contents: write` only on the auto-commit job, and every `uses:` pinned to a
full 40-char commit SHA with the version in a trailing comment.

**Expected:** `gh api /repos/$R/rulesets` shows `protect-default` active;
`.../actions/permissions/workflow` shows `default_workflow_permissions: read`
and `can_approve_pull_request_reviews: false`; secret scanning + push protection
+ Dependabot + private reporting are on; `.github/dependabot.yml` and
`.github/SECURITY.md` are committed. The bot's next run still pushes.

**On failure:** If 2b makes an existing bot push 403 — or any other workflow
fails after losing a write scope it silently relied on — the job is missing the
explicit `permissions:` it needs (e.g. `contents: write`, `packages: write`,
`pull-requests: write`); add the minimal scope back (the read-only default is not
a hard cap for same-repo pushes). If `automated-security-fixes` seems to do nothing, verify
`vulnerability-alerts` (2c line 1) ran first — alerts are a separate prerequisite
toggle from fixes. If push protection later fails a bot run, treat the flagged
secret as a **real finding** — the bot cannot click the interactive web bypass.

### Step 3: Decision Gate — Required Status Checks / Required PR

STOP. Required checks and required PR **block direct pushes to the ref**, not
just PR merges. If a bot pushes to the default branch, turning either on **will
break it** unless you first provision a bypass. The default `GITHUB_TOKEN` /
`github-actions[bot]` **cannot** be a bypass actor (GitHub design). Do not enable
this tier on a bot-pushing branch without a bypass in place.

Also, on a **solo** repo, `required_approving_review_count >= 1` is a self-lockout
(you cannot approve your own PR) — keep it `0`. And a required check that only
runs on `pull_request` never reports on a direct push, so it **permanently**
blocks the bot. Ensure the check runs on `push`.

**Step 3a — provision the bot bypass FIRST (if a bot pushes to this branch).**
Recommended: a GitHub App installation token. (Deploy key is a narrower
single-repo alternative: add an SSH deploy key with write access and use
`actor_type: DeployKey` in 3b.)

```bash
# Create a GitHub App (personal account, Settings > Developer settings >
# GitHub Apps), permission Repository > Contents: Read and write; install it
# on THIS repo. Store the App id as a repo variable and the private key as an
# Actions secret. In the workflow, mint a token and pass it to checkout + the
# commit action:
#   - uses: actions/create-github-app-token@<sha>   # v2
#     id: app-token
#     with: { app-id: ${{ vars.APP_ID }}, private-key: ${{ secrets.APP_KEY }} }
#   - uses: actions/checkout@<sha>
#     with: { token: ${{ steps.app-token.outputs.token }} }
#   - uses: stefanzweifel/git-auto-commit-action@<sha>
#     with: { ... }   # inherits the app token via the checkout credentials
#
# The numeric App id used in Step 3b is shown on the App's own page:
# Settings > Developer settings > GitHub Apps > <your app> > About ("App ID").
# It is unrelated to the repository id and cannot be derived from /repos/$R.
```

**Deploy-key alternative (no App to maintain).** Register a write deploy key and
push over SSH; the checkout's `ssh-key` makes `git-auto-commit-action` push as
that identity:

```bash
# ssh-keygen -t ed25519 -N '' -f deploy_key   # then register the public half:
gh api repos/$R/keys -f title="ci-bot" -f key="$(cat deploy_key.pub)" -F read_only=false
gh secret set DEPLOY_KEY < deploy_key   # store the private half, then delete the local copy
#   - uses: actions/checkout@<sha>
#     with: { ssh-key: ${{ secrets.DEPLOY_KEY }} }        # remote becomes SSH via the key
#   - uses: stefanzweifel/git-auto-commit-action@<sha>    # inherits the SSH remote
# In 3b use actor_type "DeployKey"; GitHub stores its actor_id as null (it matches
# ANY write deploy key on the repo), so keep the deploy-key list minimal.
```

**Higher-assurance alternative (no standing bypass actor).** If a manual merge
click is acceptable, convert the job to open a PR with the App token (e.g.
`peter-evans/create-pull-request`) and let a human merge. No bypass actor is
needed and every rule stays enforced even against the automation's identity. The
App token is still required: a PR opened with the plain `GITHUB_TOKEN` does not
trigger `pull_request`/`push` workflows, so required checks never run and it sits
`expected` forever (see Common Pitfalls).

**Step 3b — apply the hardened ruleset with the App as an `Integration` bypass
actor.** Replace `RULESET_ID` with the id from Step 2a, `<APP_ID>` with your App
id, and `build` with your real check context. `bypass_mode: always` because the
action pushes directly (use `pull_request` only if the bot opens PRs).

```bash
gh api --method PUT /repos/$R/rulesets/RULESET_ID --input - <<'JSON'
{
  "name": "protect-default",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "bypass_actors": [ { "actor_id": <APP_ID>, "actor_type": "Integration", "bypass_mode": "always" } ],
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "pull_request", "parameters": { "required_approving_review_count": 0, "dismiss_stale_reviews_on_push": true, "require_code_owner_review": false, "require_last_push_approval": false, "required_review_thread_resolution": false, "allowed_merge_methods": ["merge"] } },
    { "type": "required_status_checks", "parameters": { "strict_required_status_checks_policy": true, "do_not_enforce_on_create": true, "required_status_checks": [ { "context": "build" } ] } }
  ]
}
JSON

# Verify the bypass actor is present:
gh api /repos/$R/rulesets/RULESET_ID --jq '.bypass_actors'
```

`do_not_enforce_on_create: true` avoids the new-branch catch-22 (CI can't have
run on a branch that does not exist yet). If there is **no** bot on this branch,
you may skip 3a and omit `bypass_actors`.

**Bypass is whole-ruleset, not per-rule.** The single ruleset above lets the
bypass actor skip `deletion`/`non_fast_forward` too — a bypass actor could
force-push or delete the branch. To keep ref protection **universal** while
exempting only the check, split into two stacked rulesets (they aggregate,
most-restrictive-wins): ruleset A = `deletion` + `non_fast_forward` with
`bypass_actors: []` (applies to everyone, including you), ruleset B =
`required_status_checks` with the bot — and, if you want to keep your own
direct-push, your own `{ "actor_type": "User", "actor_id": <your-user-id>,
"bypass_mode": "always" }` — in `bypass_actors`. A successful bypassed push
prints `remote: Bypassed rule violations … Required status check "<name>" is expected`.

Trade-off: `strict_required_status_checks_policy: true` ("branch must be
up to date") forces every open human PR to be re-updated each time the bot
auto-commits to the default branch, and `dismiss_stale_reviews_on_push: true`
compounds the churn — a chatty bot can make PRs perpetually unmergeable. On a
frequently-auto-committed branch prefer `strict_required_status_checks_policy:
false` (loose) unless up-to-date-before-merge is genuinely required.

**Expected:** The ruleset now enforces the required check and required-PR rule
for humans and forks, `.bypass_actors` lists the App (`Integration`), and the
bot's next run still lands on the default branch (via the App token). Humans
must open a PR; the check must be green.

**On failure:** If the bot 403s after 3b, the App identity is not actually the
bypass actor — confirm the workflow passes the App token to **checkout** (not
just to the commit action) and that `<APP_ID>` in `bypass_actors` matches. If
the bot's push sits `expected`/`pending` forever, the required check does not run
on `push` — make it trigger on `push` or drop it from the required list. If the
bypass-actor **web picker** won't add the actor on a personal repo, the REST API
still works — add it via `gh api --method PUT .../rulesets/ID` with a
`bypass_actors` entry (`Integration`/`DeployKey`/`User`/`RepositoryRole`),
confirmed on free personal public repos; the org move is a last resort, not the fix.
If merges are blocked on a solo repo, `required_approving_review_count` is `>= 1`
— set it to `0`.

### Step 4: Optional Advanced Hardening

Apply individually, each still confirmation-gated. None of these are needed for
the baseline; several have sharp edges.

```bash
# 4a. Tag ruleset — protect release tags (classic tag protection is deprecated):
gh api --method POST /repos/$R/rulesets --input - <<'JSON'
{ "name": "protect-tags", "target": "tag", "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/tags/v*"], "exclude": [] } },
  "rules": [ { "type": "deletion" }, { "type": "non_fast_forward" } ] }
JSON

# 4b. Merge-method toggles (e.g. merge-commits-only to preserve per-commit history):
gh api -X PATCH repos/$R -F allow_merge_commit=true -F allow_squash_merge=false \
  -F allow_rebase_merge=false -F delete_branch_on_merge=true

# 4c. CodeQL "default setup" (server-managed — commits NO workflow YAML):
gh api -X PATCH repos/$R/code-scanning/default-setup -f state=configured -f query_suite=default

# 4d. sha_pinning_required — ONLY after every `uses:` is a full 40-char SHA,
#     or every workflow run fails (including actions/checkout):
gh api --method PUT /repos/$R/actions/permissions -F enabled=true \
  -f allowed_actions=selected -F sha_pinning_required=true
# selected mode also gates WHICH actions may run: github_owned covers actions/*,
# but git-auto-commit-action is NOT GitHub-owned — allow-list it in the SAME
# step or the bot fails with "actions are not allowed":
gh api --method PUT /repos/$R/actions/permissions/selected-actions \
  -F github_owned_allowed=true -F verified_allowed=false \
  -f 'patterns_allowed[]=stefanzweifel/git-auto-commit-action@*'
gh api /repos/$R/actions/permissions --jq '.sha_pinning_required'   # verify
```

Note: `allowed_actions=selected` with `github_owned_allowed=true` still blocks
`stefanzweifel/git-auto-commit-action` until it is in `patterns_allowed` (the 4d
allow-list command handles this). Require-signed-commits and require-linear-history
are intentionally omitted here:
signing blocks the unsigned git-CLI bot push, and linear history is mutually
exclusive with a merge-commits-only policy.

**Expected:** Each selected advanced control is applied and verified without
breaking the bot: tag ruleset lists on `.../rulesets`, merge toggles reflect on
the repo object, CodeQL default setup shows `state: configured`,
`sha_pinning_required` reads `true` only after all actions are SHA-pinned, and
`git-auto-commit-action` is in `patterns_allowed` so the bot still runs.

**On failure:** If every workflow fails right after 4d, an action is still
tag-pinned — convert all `uses:` to SHAs or revert `sha_pinning_required` to
`false`. If the bot fails with "actions are not allowed" after restricting
allowed actions, add `git-auto-commit-action` to `patterns_allowed`. If 4c
errors, the repo may have no CodeQL-supported language — skip it.

## Validation

- [ ] Assessment ran and scope (public/user-owned, bot-on-default-branch) confirmed before any write
- [ ] `protect-default` ruleset active with `deletion` + `non_fast_forward`
- [ ] `default_workflow_permissions=read` and `can_approve_pull_request_reviews=false`
- [ ] Secret scanning + push protection + Dependabot alerts + fixes + private reporting enabled
- [ ] `.github/dependabot.yml` (github-actions ecosystem) and `.github/SECURITY.md` committed
- [ ] Auto-commit bot's next run still pushes successfully (baseline did not break it)
- [ ] Required checks/PR enabled ONLY with a GitHub App (or deploy key) bypass in place first
- [ ] Solo repo keeps `required_approving_review_count: 0`; required checks run on `push`
- [ ] Loop guard added if a bot now pushes with an App token or PAT

## Common Pitfalls

- **GITHUB_TOKEN is not a bypass actor**: `github-actions[bot]` / the default
  token cannot be added to any ruleset bypass list and cannot push to a
  protected branch, by design. "Just add the Actions bot to the bypass list"
  has no such option — the push 403s. Use a GitHub App or deploy key.
- **PAT bypass is an anti-pattern**: an admin/personal PAT in the bypass list
  (or classic BP with `enforce_admins=false`) exempts ALL admin actions
  including your own interactive pushes — role-wide, not automation-scoped, and
  long-lived. Prefer an App (`Integration`) or deploy key (`DeployKey`).
- **Required checks only on `pull_request`**: a check that never runs on `push`
  never reports on the bot's direct push, so it **permanently** blocks the bot
  and new-branch creation. Make the check run on `push` and set
  `do_not_enforce_on_create: true`.
- **Loop guard once an App token replaces GITHUB_TOKEN**: the default token
  suppresses downstream `push`/`pull_request` triggers; an App token or PAT does
  not, so the auto-commit workflow can re-trigger itself indefinitely. Guard with
  `if: github.actor != '<app>[bot]'`, `paths-ignore`, or `[skip ci]`.
- **PR via the default GITHUB_TOKEN is a false fix**: a PR opened by
  `GITHUB_TOKEN` does not trigger `pull_request`/`push` workflows, so required
  checks never run and it sits `expected` forever. Create the PR with the App token.
- **Alerts != fixes**: `vulnerability-alerts` and `automated-security-fixes` are
  separate toggles; enabling alerts opens no PRs. Enable both.
- **Don't buy GHAS on a public repo**: secret scanning, push protection, CodeQL,
  and dependency review are already free on public repos; the paid Secret
  Protection / Code Security products target private/org repos.

## Related Skills

- `assess-github-repo-security` - the read-only companion; always run this first
- `configure-git-repository` - baseline .gitignore, branches, remotes, hooks
- `setup-github-actions-ci` - the CI workflow whose token/permissions this hardens
