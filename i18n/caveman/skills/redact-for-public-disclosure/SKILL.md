---
name: redact-for-public-disclosure
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Redact reverse-engineering findings for public disclosure while keeping
  methodology, generalizable patterns, teaching value. Cover private-vs-
  public repo split, deny-list pattern care, orphan-commit publish pattern
  that prevents `git log` leaks, category-based redaction calibration
  (methodology/pattern/version-finding/internal), `check-redaction.sh`-
  style CI gate that blocks merges when deny-listed pattern appears. Use
  when publishing findings about CLI harness you don't own, when prepare
  upstream proposals to unrelated project, when archive private research
  repo for public reference.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: redaction, disclosure, deny-list, orphan-commit, ci-gate, research-publishing
---

# Redact for Public Disclosure

Split reverse-engineering research repo into private source-of-truth and public-disclosure subset using redaction checker, pattern deny-lists, orphan-commit publish pattern. Methodology travels; specific findings stay private.

## When Use

- Publishing methodology findings about closed-source CLI harness you integrate with
- Preparing upstream proposal or bug report to project you don't own
- Archive private research repo as public reference
- Promote investigation notes (Phase 1-4 artifacts) into public guide
- Establish publish pipeline before findings pile up so leak risk no back up
- Clean up after near-miss where draft almost shipped sensitive identifier

## Inputs

- **Required**: Private research repo with mixed-sensitivity content (source of truth)
- **Required**: Target public mirror (separate repo, or `public/` worktree) where redacted content publishes
- **Optional**: Existing draft slated for publication
- **Optional**: Version-lag policy (default: "current + 1 prior stays private")
- **Optional**: List of vendor identifiers, flag prefixes, namespaces already known sensitive

## Steps

### Step 1: Categorize Every Candidate Fact

Before write or promote any content, sort each fact into one of four categories. Category determines whether and when it ships.

| Category | Definition | Shareable? |
|---|---|---|
| **methodology** | The *how* of investigation, independent of any specific finding | Always |
| **generic pattern** | Class-level observations (e.g., "harnesses commonly use a single-prefix flag namespace") | Yes |
| **version-specific finding** | Concrete observation tied to a specific release (e.g., "in vN.M, the gate defaults off") | Only after the version-lag cool-off |
| **live internal** | Minified names, byte offsets, dark flag names, current-version gate logic, PRNG/salt constants, internal codenames | Never |

Tag each draft section, capture log, or note with category before review for publication. Section that mixes categories splits — methodology lifts out clean. Rest stays private.

**Got:** Every candidate fact has category label. Drafts intended for public mirror contain only methodology and generic-pattern entries (plus version-specific findings older than cool-off).

**If fail:** Fact resists categorization? Treat as live internal by default. Re-categorize only after explicit review against version-lag policy.

### Step 2: Set Version-Lag Cool-Off Policy

Decide up front how many versions sit between "current" and "shareable." Two is typical: current + 1 prior stay private; older patterns may be discussed. Write policy into private repo (e.g., `REDACTION_POLICY.md`) so future-you no need re-derive it.

```markdown
# Redaction Policy

Version-lag cool-off: **2 releases**.
- Current release (vN): all version-specific findings PRIVATE.
- Previous release (vN-1): all version-specific findings PRIVATE.
- Releases vN-2 and earlier: version-specific findings may move to public draft after Step 5 review.

Source of truth for "current": output of `monitor-binary-version-baselines`.
Owner: <name>. Reviewed quarterly.
```

"Current" version must be empirical (read from installed binary), not administrative. Tie policy to baseline scanner output, not calendar.

**Got:** Committed `REDACTION_POLICY.md` in private repo with explicit cool-off and owner.

**If fail:** Stakeholders cannot agree on cool-off? Default to most conservative proposal. Cool-offs can shorten later; recall a leak cannot.

### Step 3: Build Deny-List Scanner

Maintain patterns in single executable script that is source of truth for redaction policy. Script lives in private repo (`tools/check-redaction.sh`). Runs against public mirror.

```bash
#!/usr/bin/env bash
set -u
PUBLIC_REPO="${1:-./public}"
LEAKS=0

PATTERNS=(
  "minified identifier shape|<regex matching short bundle-style identifiers>"
  "vendor-prefixed flag|<regex matching the vendor's flag prefix>"
  "PRNG/salt constant|<regex matching the specific constants>"
)

for entry in "${PATTERNS[@]}"; do
  desc="${entry%%|*}"
  pattern="${entry##*|}"
  if rg -q "$pattern" "$PUBLIC_REPO"; then
    echo "LEAK: $desc"; LEAKS=$((LEAKS+1))
  fi
done
exit $LEAKS
```

Each entry has human-readable label and regex. One entry per sensitive identifier *shape* (not per literal string — shapes survive version churn). Exit code = number of leaks; clean run exits 0.

**Got:** `tools/check-redaction.sh ./public-mirror` runs in under a second on small repo. Exits 0 when nothing matches.

**If fail:** `rg` unavailable? Fall back to `grep -rqE`. Patterns too broad (every run reports leaks)? Narrow at source, no add suppressions.

### Step 4: Maintain Deny-List Before Drafting

When Phase 1-4 finding could leak through draft, extend scanner *before* draft is written. Drafts cheap; teaching scanner new patterns durable.

Workflow:

1. New finding lands in private repo (e.g., newly-discovered flag prefix).
2. Ask: "If this leaked, what would I want the scanner to catch?"
3. Add pattern entry to `tools/check-redaction.sh` (label + regex).
4. Run scanner against entire public mirror to confirm new pattern not already tripped by legitimate content.
5. Only then draft any public content that touches area.

This inverts usual order: scanner updates first, draft second. Scanner becomes executable specification of "what is too sensitive to publish." Draft cannot accidentally outpace it.

**Got:** Pattern entries in `tools/check-redaction.sh` predate any public-mirror content that could match them. `git log tools/check-redaction.sh` shows scanner updates landing before related draft commits.

**If fail:** Scanner updates lag drafts? Audit public mirror against new pattern immediately. Redact, then commit scanner update with note explaining discovered pattern.

### Step 5: Establish Private/Public File-Set Split

Define explicit allow-list of files that sync to public mirror. New files default private; promotion requires redaction-check clearance.

```bash
# tools/public-allowlist.txt
README.md
LICENSE
guides/methodology-overview.md
guides/category-classification.md
docs/contributing.md
```

`tools/sync-to-public.sh` reads allow-list, copies only those files to public mirror, exits non-zero if allow-list references file that does not exist (catches typos).

```bash
#!/usr/bin/env bash
set -eu
PRIVATE_ROOT="${1:?private repo path required}"
PUBLIC_ROOT="${2:?public mirror path required}"
ALLOWLIST="$PRIVATE_ROOT/tools/public-allowlist.txt"

while IFS= read -r path; do
  [ -z "$path" ] && continue
  case "$path" in \#*) continue ;; esac
  src="$PRIVATE_ROOT/$path"
  dst="$PUBLIC_ROOT/$path"
  if [ ! -e "$src" ]; then
    echo "MISSING: $path"; exit 2
  fi
  mkdir -p "$(dirname "$dst")"
  cp -a "$src" "$dst"
done < "$ALLOWLIST"
```

Promotion needs three things in order: file added to allow-list, file passes redaction check, reviewer confirms category labels from Step 1.

**Got:** Public mirror contains exactly files listed in `tools/public-allowlist.txt`. No file appears in public mirror that is not on allow-list.

**If fail:** File appears in public mirror but missing from allow-list? Treat as leak event — investigate how it arrived, then either remove or formally promote it after redaction review.

### Step 6: Publish via Orphan Commit

Public mirror is single `git commit --orphan`-rooted commit recreated at each publish. This prevents `git log` on public repo from exposing pre-redaction drafts.

```bash
# In the public mirror (separate repo or worktree)
cd /path/to/public-mirror
git checkout --orphan publish-tmp
git rm -rf .                                    # Clear the index
# Sync from private using the allow-list
bash /path/to/private/tools/sync-to-public.sh /path/to/private .
git add -A
git commit -m "Publish: <date>"
git branch -D main 2>/dev/null || true
git branch -m main
git push --force origin main
```

Public repo `git log` shows exactly one commit. Prior drafts and any redaction iterations stay in private repo history. No `git log -p`, `git reflog`, or branch listing on public repo can recover pre-redaction content because never committed there.

**Got:** `git log --oneline` on public mirror shows single commit per publish. No references to private repo history (no parent SHAs, no merge commits, no tags from private repo) appear.

**If fail:** `git push --force` rejected (branch protection)? Open single-commit pull request from clean orphan branch instead. Never solve rejection by pushing private history.

### Step 7: Wire CI Gate

Run `tools/check-redaction.sh` on every commit to public-sync branch. Failed check blocks publish, not just warns.

```yaml
# .github/workflows/redaction-check.yml (in the public mirror repo)
name: redaction-check
on:
  push:
    branches: [main, publish-*]
  pull_request:
    branches: [main]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install ripgrep
        run: sudo apt-get update && sudo apt-get install -y ripgrep
      - name: Fetch redaction scanner
        env:
          GH_TOKEN: ${{ secrets.PRIVATE_REPO_TOKEN }}
        run: |
          gh api repos/<org>/<private-repo>/contents/tools/check-redaction.sh \
            --jq .content | base64 -d > check-redaction.sh
          chmod +x check-redaction.sh
      - name: Run scanner
        run: ./check-redaction.sh .
```

Two design choices:

- Scanner pulled from private repo at CI time so deny-list itself never lives in public repo (patterns themselves sensitive — publishing them tells reader exactly what to look for).
- Job exits with scanner exit code; non-zero blocks workflow.

**Got:** Pushes that introduce deny-listed pattern fail CI; publish does not land. Maintainers see failing label (e.g., `LEAK: vendor-prefixed flag`) without seeing regex itself.

**If fail:** Private-repo token cannot be granted to public CI? Embed only *minimum-leak* portion of scanner in public repo (broad shape patterns that no themselves identify vendor) and run full scanner pre-push from private repo.

### Step 8: Handle False Positives Honestly

When scanner trips on legitimate content, prefer narrow pattern over add ignore-line. Broad deny-lists with local suppressions rot fast — six months later no one remembers why a particular line was suppressed, and next leak slides past unnoticed.

Decision tree:

1. **Is match actually safe?** Re-categorize using Step 1. Content turns out to be live internal in disguise? Redact it; no suppress scanner.
2. **Is pattern too broad?** Tighten regex so safe content no longer matches. Document tightening with comment in `check-redaction.sh` linking to case that motivated it.
3. **Only if 1 and 2 both fail** — and pattern structurally too entangled with legitimate content to narrow further — use single-line suppression with `# REASON:` comment that states *why* suppression safe. Date the comment.

```bash
# Bad — mystery suppression
echo "API endpoint pattern" >> ignore.txt

# Good — narrowed pattern with rationale
# Pattern v2: tightened from `\bgate\(` to `\bgate\(['\"][a-z]+_phase` after
# legitimate `gate(true)` calls in our own SDK examples started matching. 2026-04-15.
PATTERNS+=("vendor flag predicate|\\bgate\\(['\"][a-z]+_phase")
```

**Got:** Each scanner pattern has zero or one inline comment explaining tightening. Suppressions, if any, carry date and rationale.

**If fail:** Suppressions accumulate (more than one per quarter)? Deny-list is mis-shaped. Schedule redaction-policy review. Rebuild patterns from categorized fact inventory.

### Step 9: Periodic Redaction Sweeps

Not all redaction work is incident-driven. Run periodic sweep (monthly typical) that re-categorizes most recent additions to private repo and re-runs scanner against public mirror. Drift catches itself before it becomes incident-grade.

Sweep checklist:

- [ ] Re-read version-lag policy; confirm empirical "current" version unchanged or update policy
- [ ] Audit last month of private-repo commits for newly-added findings not categorized (Step 1)
- [ ] Run `tools/check-redaction.sh` against public mirror (should still exit 0)
- [ ] Review any scanner patterns added since last sweep — any too broad? Tighten if so
- [ ] If any version aged past cool-off, ID findings now eligible for promotion
- [ ] Confirm `tools/public-allowlist.txt` matches actual public-mirror file set

**Got:** Short sweep log per month in private repo (e.g., `sweeps/2026-04.md`) with checklist outcomes and any actions taken.

**If fail:** Sweep repeatedly skipped? Automate calendar reminder. Sweep keeps finding same drift? Workflow upstream is the problem — investigate why categorization gets skipped at draft time.

## Checks

- [ ] Every file in public mirror is on `tools/public-allowlist.txt`
- [ ] `tools/check-redaction.sh ./public-mirror` exits 0
- [ ] `git log --oneline` on public mirror shows single orphan commit per publish
- [ ] `REDACTION_POLICY.md` exists in private repo with explicit version-lag cool-off
- [ ] Every Phase 1-4 finding has category label (methodology / generic pattern / version-specific / live internal)
- [ ] Public CI runs scanner on every push; deliberate test pattern fails build
- [ ] Deny-list scanner itself does not live in public repo
- [ ] Most recent monthly sweep log dated within last 35 days

## Pitfalls

- **"Just one example to make it concrete."** Temptation to include one specific finding "to ground methodology" = most common leak path. Use synthetic placeholders (e.g., `acme_widget_v3`, `widget_handler_42`) — clearly invented, never traceable to real product.
- **Use `git rebase` or `git filter-branch` to scrub leak in place on public repo.** Force-pushing rewritten history still leaves traces in clones and forks. Orphan-commit publish pattern = structural fix; ad-hoc history rewriting = not.
- **Suppressions instead of pattern tightening.** Scanner with twenty suppressions = scanner with zero meaningful coverage. Every suppression = future leak waiting for context to fade.
- **Public CI that warns instead of failing.** Warnings get ignored. CI gate must block publish (non-zero exit, no merge button).
- **Allow-list drift.** New files added to private repo do not automatically belong on allow-list. Default-deny = only safe posture.
- **Mistake encryption for redaction.** Encoding, hashing, or rot13-ing sensitive identifier and publishing result still publishes it — original recoverable. Redact = "does not appear at all."
- **Publish the deny-list.** Patterns themselves are finding catalog: reader who sees regex knows exactly what to grep for in binary. Keep scanner private; only its labels (e.g., `LEAK: vendor-prefixed flag`) should appear in public CI logs.
- **Treat private repo as draft pile.** It is source of truth for research, not scratch space. Apply same versioning, review, backup discipline you would to any production artifact.

## See Also

- `monitor-binary-version-baselines` — Phase 1, baselines feed version-lag policy: what counts as "current" is empirical fact, not calendar fact
- `probe-feature-flag-state` — Phases 2-3, classification findings here enter redaction pipeline at category step (Step 1)
- `conduct-empirical-wire-capture` — Phase 4, capture artifacts (wire logs, payload schemas) need redaction before any can be referenced public
- `security-audit-codebase` — both pipelines benefit from deny-list-style scanning; this skill specializes for research disclosure rather than secret leakage
- `manage-git-branches` — orphan-commit publish pattern is branch operation; safe execution requires branch hygiene practices documented there
