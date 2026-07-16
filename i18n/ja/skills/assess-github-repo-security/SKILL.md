---
name: assess-github-repo-security
description: >
  Read-only audit of a GitHub repository's security posture. Gathers ref
  protection (rulesets AND classic branch protection), Actions token
  permissions, code and supply-chain features (Dependabot, secret
  scanning, push protection, CodeQL), and repo hygiene toggles via
  `gh api`, then classifies findings against essential / recommended /
  advanced tiers into a PASS/GAP report. Makes NO changes. Use when
  reviewing a repo before open-sourcing or a release, auditing a public
  user-owned repo whose CI auto-commits to the default branch, verifying
  a hardening change actually took effect, or producing a baseline
  security posture report for a repository.
license: MIT
allowed-tools: Read Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: github, security, audit, rulesets, branch-protection, dependabot, actions
  locale: ja
  source_locale: en
  source_commit: 84a3c915
  translator: "Claude + human review"
  translation_date: "2026-07-16"
---

# Assess GitHub Repository Security

Audit a GitHub repository's security posture, read-only, and classify it
against tiered best practices. This skill only reads — it never enables,
disables, or changes any setting. Remediation is a separate concern (see
`harden-github-repo-security`).

## When to Use

- Reviewing a repo before open-sourcing it or cutting a release
- Auditing a public, user-owned repo whose CI auto-commits to the default
  branch (e.g. via `stefanzweifel/git-auto-commit-action` + the default
  `GITHUB_TOKEN`)
- Verifying that a hardening change actually took effect
- Producing a baseline posture report to track over time

## Inputs

- **Required**: Target repository as `OWNER/REPO`
- **Required**: `gh` CLI authenticated with an account that has the
  **admin repository role** on the target repo (some endpoints 403
  otherwise). This is a role requirement, not a need for a broad
  write-capable token: a fine-grained, single-repo PAT scoped to
  read-only Administration / Actions / Secret-scanning permissions
  satisfies the same admin check with far less blast radius if the
  audit credential is ever leaked or reused in automation
- **Optional**: Branch to check for classic protection (defaults to the
  repo's `default_branch`)
- **Optional**: `security_events` token scope — needed only to count open
  Dependabot alerts; the rest works without it

Set a shorthand for every command below:

```bash
R="OWNER/REPO"   # e.g. pjt222/agent-almanac
```

## Procedure

### Step 1: Preflight — auth and admin

Confirm the CLI is authenticated and the account has admin on the repo.
Non-admins get partial data (403 on rulesets, Actions, and security
endpoints), which silently understates the posture.

```bash
gh auth status
gh api "repos/$R" --jq '{full_name, admin: .permissions.admin, visibility}'
```

**Expected:** `gh auth status` shows a logged-in account; the second call
prints `admin: true`.

**On failure:** If not authenticated, run `gh auth login` (or set
`GH_TOKEN`). If `admin: false`, stop and note in the report that findings
are **incomplete** — a non-admin cannot read ruleset internals or Actions
permissions, so absence of a control cannot be distinguished from lack of
access.

### Step 2: Repo basics — visibility, merge toggles, collaborators

```bash
gh api "repos/$R" --jq '{visibility, private, allow_forking,
  default_branch, allow_merge_commit, allow_squash_merge,
  allow_rebase_merge, delete_branch_on_merge}'

# Direct collaborators and their effective role
gh api "repos/$R/collaborators?affiliation=direct" \
  --jq '.[] | {login, role_name}'
```

**Expected:** JSON for the repo toggles plus one line per direct
collaborator with `role_name` (`admin`/`maintain`/`write`/`triage`/`read`).

**On failure:** A 403 on `collaborators` means the token lacks admin; note
it and continue. Record `visibility` — it changes which features are
**free**: on **public** repos secret scanning, push protection, CodeQL,
and dependency review are free; the paid GHAS/Secret Protection products
are private/org-only, so their absence on a public repo is not a gap.

### Step 3: Ref protection — check rulesets AND classic (both)

A repo can be protected by a **ruleset**, by **classic branch
protection**, by both, or by neither. Rulesets are the actively-developed
path and are free on public user-owned repos. You MUST check both — a repo
with only a ruleset returns 404 on the classic endpoint and vice versa.

```bash
b=$(gh api "repos/$R" --jq '.default_branch')

# (a) Rulesets — list, then inspect each active one's rules + bypass list
gh api "repos/$R/rulesets" --jq '.[] | {id, name, enforcement, target}'
# For each id from above:
#   gh api "repos/$R/rulesets/<id>" \
#     --jq '{name, enforcement,
#            rules: [.rules[].type],
#            bypass: [.bypass_actors[] | {actor_type, bypass_mode}]}'

# (b) Classic branch protection on the default branch (404 = none)
gh api -i "repos/$R/branches/$b/protection" 2>/dev/null | head -1
gh api "repos/$R/branches/$b/protection" \
  --jq '{required_status_checks: .required_status_checks.checks,
         strict: .required_status_checks.strict,
         enforce_admins: .enforce_admins.enabled,
         required_reviews: .required_pull_request_reviews.required_approving_review_count,
         linear: .required_linear_history.enabled,
         signatures: .required_signatures.enabled,
         allow_force_pushes: .allow_force_pushes.enabled,
         allow_deletions: .allow_deletions.enabled}' 2>/dev/null \
  || echo "no classic branch protection"
```

**Expected:** Either a ruleset with rules such as `deletion`,
`non_fast_forward`, `pull_request`, `required_status_checks`, or a classic
protection object, or an explicit "none" from both.

**On failure:** A `404` on either endpoint means that mechanism is **not
configured** — it is a valid data point, not an error; record "none" for
that mechanism. Note the rule set from the ruleset `rules[].type` list and
the `bypass_actors`. Remember: the default `GITHUB_TOKEN` /
`github-actions[bot]` can never be a bypass actor by design — if the repo
auto-commits AND has `required_status_checks`/`pull_request` rules with no
`Integration` (GitHub App) or `DeployKey` bypass actor, flag that the bot
push must be 403ing (a real finding).

### Step 4: Actions security — token defaults and PR approval

```bash
# Actions enablement + allowed-actions policy (+ SHA-pinning policy)
gh api "repos/$R/actions/permissions" \
  --jq '{enabled, allowed_actions, sha_pinning_required}'

# Default GITHUB_TOKEN permissions + can-the-bot-approve-PRs
gh api "repos/$R/actions/permissions/workflow" \
  --jq '{default_workflow_permissions, can_approve_pull_request_reviews}'
```

**Expected:** `default_workflow_permissions` is `read` (hardened) or
`write` (permissive default), and `can_approve_pull_request_reviews` is
`false` (hardened) or `true` (a review-bypass vector).

**On failure:** 403 means non-admin — note it. If
`allowed_actions` is `all`, any action can run (looser); `selected` with a
pinned allow-list is tighter — but note that `selected` +
`github_owned_allowed` still blocks non-GitHub actions like
`stefanzweifel/git-auto-commit-action` unless explicitly allow-listed.
`sha_pinning_required` may be absent/`null` on repos that never set the
2025-08 policy — record as "not enforced". Per-workflow `permissions:`
blocks live in the YAML, not the API; note that the API shows only the
repo **default**, which is a default (not a cap) for same-repo push
events.

### Step 5: Code and supply-chain features

```bash
# Dependabot alerts + dependency graph (204 = ON, 404 = OFF)
gh api -i "repos/$R/vulnerability-alerts" 2>/dev/null | head -1

# Dependabot security updates (auto fix PRs) — separate toggle
gh api "repos/$R/automated-security-fixes" \
  --jq '{enabled, paused}' 2>/dev/null || echo "automated-security-fixes: off/unavailable"

# Secret scanning + push protection status (security_and_analysis has NO
# code-scanning field — CodeQL is probed separately below)
gh api "repos/$R" --jq '.security_and_analysis'

# CodeQL code scanning — default setup state (its own endpoint)
gh api "repos/$R/code-scanning/default-setup" --jq '.state' 2>/dev/null \
  || echo "code-scanning default setup: not configured / no access"

# Dependabot version updates config present?
gh api -i "repos/$R/contents/.github/dependabot.yml" 2>/dev/null | head -1

# SECURITY.md — GitHub auto-detects it at root, docs/, OR .github/.
# Present if ANY of the three returns 200; only a GAP if all three 404.
for p in SECURITY.md docs/SECURITY.md .github/SECURITY.md; do
  echo "$p: $(gh api -i "repos/$R/contents/$p" 2>/dev/null | head -1)"
done

# Private vulnerability reporting — status is a 200 body {"enabled": bool},
# NOT a 204/404 toggle, so read the field directly.
gh api "repos/$R/private-vulnerability-reporting" --jq '.enabled' 2>/dev/null \
  || echo "PVR: not accessible"

# Open Dependabot alert count — needs security_events scope; may 403
gh api "repos/$R/dependabot/alerts?state=open" --jq 'length' 2>/dev/null \
  || echo "dependabot/alerts: 403 (needs security_events scope) — skipped"
```

**Expected:** `vulnerability-alerts` → `HTTP/2.0 204` when enabled;
`security_and_analysis` shows `secret_scanning.status` and
`secret_scanning_push_protection.status` as `enabled` on a hardened public
repo; `code-scanning/default-setup` `.state` is `configured` when CodeQL
default setup is on; `automated-security-fixes` → `enabled: true`; the
`dependabot.yml` probe returns `200` when present; at least one of the
three SECURITY.md paths returns `200` when a policy file exists;
`private-vulnerability-reporting` `.enabled` prints `true` when PVR is on.

**On failure:** `vulnerability-alerts` returning `404` = Dependabot alerts
OFF (a gap). Remember **alerts != fixes**: alerts on with
`automated-security-fixes` off means nothing is auto-remediated — flag
both separately. On **public** repos `secret_scanning` is usually already
`enabled` by default; if `security_and_analysis` omits the field entirely,
treat it as advisory (public-repo default on) but note the API did not
confirm it. `code-scanning/default-setup` `404`/non-`configured` = CodeQL
default setup not enabled (a recommended-tier gap on a public repo, where
code scanning is free). For SECURITY.md, record a GAP **only if all three
paths 404** — a `200` on root, `docs/`, or `.github/` all count as
present. `private-vulnerability-reporting` empty/`false` = PVR off; a
non-JSON or error response = not accessible. `dependabot/alerts` 403 is
expected without `security_events` scope — record "not assessed", not "0".

### Step 6: Produce the tiered PASS/GAP report

Classify every gathered fact into three tiers and mark **PASS** (control
present), **GAP** (control absent), or **N/A** (not applicable, e.g. a paid
private-repo feature on a public repo). Distinguish a **required** check
from an **advisory** one: a status check that runs but is not listed in the
ruleset's `required_status_checks` does not gate anything — it is advisory
only.

**Interpret the solo-maintainer lockout.** Cross-reference the Step 2
direct-collaborator count with the Step 3 `required_approving_review_count`.
On a single-maintainer repo, `required_approving_review_count >= 1` (and
`require_code_owner_review` with a sole owner) is **unsatisfiable** — you
cannot approve your own PR — so on an auto-commit repo it is a self-lockout
/ functional breakage, **not** a PASS. Flag it as a GAP-with-caveat, and
note that a **ruleset** (unlike classic branch protection's `enforce_admins`)
does **not** auto-exempt the admin: the sole maintainer stays blocked unless
explicitly added to the ruleset `bypass_actors`.

**Do not publish the raw report into the audited repo.** The PASS/GAP list
enumerates exact, admin-only-visible gaps (no ruleset, `GITHUB_TOKEN` can
approve PRs, no push protection) — a pre-remediation vulnerability roadmap.
While any GAP is open, keep the findings **local/private** (a gitignored
file, a private gist, or a draft GitHub Security Advisory); never commit it
into the public repo being audited (contrast `security-audit-codebase`,
which writes `SECURITY_AUDIT_REPORT.md` into the project root — do NOT copy
that pattern here). Redact ruleset / App ID / bypass-actor identifiers
before any public write.

```text
# GitHub Repo Security Assessment — OWNER/REPO
Date: YYYY-MM-DD   Visibility: public   Auditor role: admin

## Essential
- [PASS] Ruleset with deletion + non_fast_forward on default branch
- [GAP]  default_workflow_permissions = write (should be read)
- [PASS] can_approve_pull_request_reviews = false
- [GAP]  actions/checkout pinned to @v4 tag, not a 40-char SHA
- [PASS] Dependabot alerts (204) + security updates (enabled)
- [GAP]  No .github/dependabot.yml (version updates off — keeps
         github-actions action pins fresh; essential supply-chain hygiene)
- [PASS] Secret scanning + push protection enabled

## Recommended
- [N/A]  required_status_checks — none (no CI gate configured)
- [PASS] CodeQL default setup: configured
- [PASS] SECURITY.md present (.github/) + PVR enabled

## Advanced
- [GAP]  sha_pinning_required: not enforced
- [N/A]  Required signed commits — would block the auto-commit bot
- [N/A]  Paid GHAS / Secret Protection — public repo, features free

## Notes
- Auto-commit bot: ruleset has NO App/DeployKey bypass actor; if
  required_status_checks were added the github-actions[bot] push would 403.
- Solo maintainer (1 direct collaborator): required_approving_review_count
  is 0 — correct; any value >= 1 would be an unsatisfiable self-lockout and
  a ruleset would NOT auto-exempt the admin.
- Dependabot open alerts: not assessed (token lacks security_events).
- This report is kept local/private — not committed into the audited repo
  while GAPs remain open.
```

**Expected:** A written report with every fact placed in a tier and
marked PASS / GAP / N/A, plus a Notes section for auth gaps, advisory-only
checks, and the auto-commit-bot bypass interaction.

**On failure:** If some endpoints 403'd, still emit the report but mark
those rows "not assessed" and state the missing scope/role at the top —
never record an unreadable control as a GAP (absence of access is not
absence of the control).

## Validation

- [ ] `gh auth status` confirmed and admin on the repo verified (or the
      report is explicitly flagged incomplete)
- [ ] `visibility` recorded (drives which features are free vs N/A)
- [ ] BOTH rulesets AND classic branch protection were queried (not just one)
- [ ] Actions `permissions` and `permissions/workflow` both read
- [ ] Dependabot alerts, security updates, secret scanning, and push
      protection each checked as **separate** toggles
- [ ] CodeQL default setup queried via `code-scanning/default-setup`
      (not inferred from `security_and_analysis`, which has no such field)
- [ ] SECURITY.md checked at all three auto-detected paths (root, `docs/`,
      `.github/`) — GAP only if all three 404
- [ ] Private vulnerability reporting read from the `.enabled` body field
      (not a 204/404 toggle)
- [ ] Solo-maintainer lockout interpreted: collaborator count cross-referenced
      with `required_approving_review_count`
- [ ] Every finding is tiered and marked PASS / GAP / N/A
- [ ] Report kept local/private while GAPs are open — NOT committed into
      the audited public repo
- [ ] No setting was changed — this audit is strictly read-only

## Common Pitfalls

- **Checking only rulesets or only classic protection**: They are
  independent mechanisms. A repo protected by a ruleset returns `404` on
  `branches/{b}/protection`; concluding "unprotected" from that alone is
  wrong. Always query both.
- **Some endpoints 403 without security scope/admin**: `dependabot/alerts`
  needs `security_events`; rulesets and Actions permissions need admin. A
  403 is "not assessed", not a GAP — recording it as a gap fabricates a
  finding.
- **A green check that is not REQUIRED is advisory only**: A CI job that
  runs and passes gates nothing unless its context is in the ruleset's
  `required_status_checks`. Do not report a running check as a protective
  control.
- **Alerts != fixes**: Dependabot **alerts** (`vulnerability-alerts`, 204)
  only detect; **security updates** (`automated-security-fixes`) open the
  fix PRs. Enabling one does not enable the other — assess both.
- **Treating paid-feature absence as a gap on a public repo**: Secret
  scanning, push protection, CodeQL, and dependency review are free on
  public repos; GHAS / Secret Protection / Code Security are private/org
  products. Their absence on a public repo is N/A, not a gap.
- **Misreading the auto-commit-bot bypass**: The default `GITHUB_TOKEN` /
  `github-actions[bot]` can never be a ruleset bypass actor. If a repo
  auto-commits to a branch that has `required_status_checks` or a
  `pull_request` rule with no `Integration`/`DeployKey` bypass actor, the
  bot push is being rejected — surface it as a real finding.
- **Reading the API default as a hard cap**: `default_workflow_permissions`
  is the repo default; per-job `permissions:` in the workflow YAML can
  raise or drop it for same-repo events. The API cannot show the effective
  per-workflow grant — note that limitation.
- **Probing SECURITY.md at only one path**: GitHub auto-detects the policy
  at the repo root, `docs/`, OR `.github/`. Checking only one path and
  recording a 404 as a GAP fabricates a finding — a repo with SECURITY.md
  at root is fully compliant. Only record a GAP if all three 404.
- **Inferring CodeQL from `security_and_analysis`**: that object carries
  `secret_scanning*`, `dependabot_security_updates`, and `advanced_security`
  — but **no** code-scanning field. CodeQL default-setup state comes only
  from the `code-scanning/default-setup` endpoint; never claim a CodeQL
  PASS/GAP the skill did not actually probe.
- **Marking a solo review requirement as PASS**: on a one-maintainer repo,
  `required_approving_review_count >= 1` is an unsatisfiable self-lockout,
  not a protective control — and a ruleset (unlike classic `enforce_admins`)
  will not auto-exempt the admin. Report it as a functional-breakage GAP.

## Related Skills

- `harden-github-repo-security` - apply the fixes this audit surfaces
- `security-audit-codebase` - complementary in-tree secret/dependency scan
- `configure-git-repository` - foundational repo + `.gitignore` setup
