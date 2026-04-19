---
name: redact-for-public-disclosure
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Redact reverse-engineering findings for public disclosure while preserving
  methodology, generalizable patterns, and teaching value. Covers the
  private-vs-public repo split, deny-list pattern maintenance, orphan-commit
  publish pattern that prevents `git log` leaks, category-based redaction
  calibration (methodology/pattern/version-finding/internal), and the
  `check-redaction.sh`-style CI gate that blocks merges when a deny-listed
  pattern appears. Use when publishing findings about a CLI harness you don't
  own, when preparing upstream proposals to an unrelated project, or when
  archiving a private research repo for public reference.
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

Split a reverse-engineering research repo into a private source-of-truth and a public-disclosure subset using a redaction checker, pattern deny-lists, and an orphan-commit publish pattern. Methodology travels; specific findings stay private.

## When to Use

- Publishing methodology findings about a closed-source CLI harness you integrate with
- Preparing an upstream proposal or bug report to a project you do not own
- Archiving a private research repo as a public reference
- Promoting investigation notes (Phase 1-4 artifacts) into a public guide
- Establishing a publish pipeline before findings accumulate so leak risk does not back up
- Cleaning up after a near-miss where a draft almost shipped a sensitive identifier

## Inputs

- **Required**: A private research repo with mixed-sensitivity content (the source of truth)
- **Required**: A target public mirror (separate repo, or a `public/` worktree) where redacted content will be published
- **Optional**: An existing draft slated for publication
- **Optional**: A version-lag policy (defaults to "current + 1 prior stays private")
- **Optional**: A list of vendor identifiers, flag prefixes, or namespaces already known to be sensitive

## Procedure

### Step 1: Categorize Every Candidate Fact

Before writing or promoting any content, sort each fact into one of four categories. The category determines whether and when it can ship.

| Category | Definition | Shareable? |
|---|---|---|
| **methodology** | The *how* of investigation, independent of any specific finding | Always |
| **generic pattern** | Class-level observations (e.g., "harnesses commonly use a single-prefix flag namespace") | Yes |
| **version-specific finding** | Concrete observation tied to a specific release (e.g., "in vN.M, the gate defaults off") | Only after the version-lag cool-off |
| **live internal** | Minified names, byte offsets, dark flag names, current-version gate logic, PRNG/salt constants, internal codenames | Never |

Annotate each draft section, capture log, or note with its category before reviewing for publication. A section that mixes categories splits — methodology lifts out clean, the rest stays private.

**Expected:** Every candidate fact has a category label. Drafts intended for the public mirror contain only methodology and generic-pattern entries (plus version-specific findings older than the cool-off).

**On failure:** If a fact resists categorization, treat it as a live internal by default. Re-categorize only after explicit review against the version-lag policy.

### Step 2: Set the Version-Lag Cool-Off Policy

Decide up front how many versions sit between "current" and "shareable." Two is typical: current + 1 prior remain private, older patterns may be discussed. Write the policy into the private repo (e.g., `REDACTION_POLICY.md`) so future-you does not have to re-derive it.

```markdown
# Redaction Policy

Version-lag cool-off: **2 releases**.
- Current release (vN): all version-specific findings PRIVATE.
- Previous release (vN-1): all version-specific findings PRIVATE.
- Releases vN-2 and earlier: version-specific findings may move to public draft after Step 5 review.

Source of truth for "current": output of `monitor-binary-version-baselines`.
Owner: <name>. Reviewed quarterly.
```

The "current" version must be empirical (read from the installed binary), not administrative. Tie the policy to the baseline scanner output rather than to a calendar.

**Expected:** A committed `REDACTION_POLICY.md` in the private repo with an explicit cool-off and an owner.

**On failure:** If stakeholders cannot agree on the cool-off, default to the most conservative proposal. Cool-offs can be shortened later; recalling a leak cannot.

### Step 3: Build the Deny-List Scanner

Maintain patterns in a single executable script that is the source of truth for the redaction policy. The script lives in the private repo (`tools/check-redaction.sh`) and runs against the public mirror.

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

Each entry has a human-readable label and a regex. One entry per sensitive identifier *shape* (not per literal string — shapes survive version churn). The exit code equals the number of leaks; a clean run exits 0.

**Expected:** `tools/check-redaction.sh ./public-mirror` runs in under a second on a small repo and exits 0 when nothing matches.

**On failure:** If `rg` is unavailable, fall back to `grep -rqE`. If patterns are too broad (every run reports leaks), narrow them at the source rather than adding suppressions.

### Step 4: Maintain the Deny-List Before Drafting

When a Phase 1-4 finding could leak through a draft, extend the scanner *before* the draft is written. Drafts are cheap; teaching the scanner new patterns is durable.

Workflow:

1. New finding lands in the private repo (e.g., a newly-discovered flag prefix).
2. Ask: "If this leaked, what would I want the scanner to catch?"
3. Add a pattern entry to `tools/check-redaction.sh` (label + regex).
4. Run the scanner against the entire public mirror to confirm the new pattern is not already tripped by legitimate content.
5. Only then draft any public content that touches the area.

This inverts the usual order: the scanner is updated first, the draft second. The scanner becomes the executable specification of "what is too sensitive to publish," and the draft cannot accidentally outpace it.

**Expected:** Pattern entries in `tools/check-redaction.sh` predate any public-mirror content that could match them. `git log tools/check-redaction.sh` shows scanner updates landing before related draft commits.

**On failure:** If scanner updates lag drafts, audit the public mirror against the new pattern immediately. Redact, then commit the scanner update with a note explaining the discovered pattern.

### Step 5: Establish the Private/Public File-Set Split

Define an explicit allow-list of files that sync to the public mirror. New files default to private; promotion requires redaction-check clearance.

```bash
# tools/public-allowlist.txt
README.md
LICENSE
guides/methodology-overview.md
guides/category-classification.md
docs/contributing.md
```

A `tools/sync-to-public.sh` reads the allow-list, copies only those files to the public mirror, and exits non-zero if the allow-list references a file that does not exist (catches typos).

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

Promotion requires three things in order: the file is added to the allow-list, the file passes the redaction check, and a reviewer confirms the category labels from Step 1.

**Expected:** The public mirror contains exactly the files listed in `tools/public-allowlist.txt`. No file appears in the public mirror that is not on the allow-list.

**On failure:** If a file appears in the public mirror but is missing from the allow-list, treat it as a leak event — investigate how it arrived, then either remove it or formally promote it after redaction review.

### Step 6: Publish via Orphan Commit

The public mirror is a single `git commit --orphan`-rooted commit recreated at each publish. This prevents `git log` on the public repo from exposing pre-redaction drafts.

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

The public repo's `git log` shows exactly one commit. Prior drafts and any redaction iterations stay in the private repo's history. No `git log -p`, `git reflog`, or branch listing on the public repo can recover pre-redaction content because it was never committed there.

**Expected:** `git log --oneline` on the public mirror shows a single commit per publish. No references to the private repo's history (no parent SHAs, no merge commits, no tags from the private repo) appear.

**On failure:** If `git push --force` is rejected (branch protection), open a single-commit pull request from a clean orphan branch instead. Never solve a rejection by pushing the private history.

### Step 7: Wire the CI Gate

Run `tools/check-redaction.sh` on every commit to the public-sync branch. A failed check blocks the publish, not just warns.

```yaml
# .github/workflows/redaction-check.yml (in the public mirror repo)
name: redaction-check
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Two design choices here:

- The scanner is pulled from the private repo at CI time so the deny-list itself never lives in the public repo (the patterns are themselves sensitive — publishing them would tell a reader exactly what to look for).
- The job exits with the scanner's exit code; non-zero blocks the workflow.

**Expected:** Pushes that introduce a deny-listed pattern fail CI; the publish does not land. Maintainers see the failing label (e.g., `LEAK: vendor-prefixed flag`) without seeing the regex itself.

**On failure:** If the private-repo token cannot be granted to the public CI, embed only a *minimum-leak* portion of the scanner in the public repo (broad shape patterns that do not themselves identify the vendor) and run the full scanner pre-push from the private repo.

### Step 8: Handle False Positives Honestly

When the scanner trips on legitimate content, prefer narrowing the pattern over adding an ignore-line. Broad deny-lists with local suppressions rot fast — six months later no one remembers why a particular line was suppressed, and the next leak slides past unnoticed.

Decision tree:

1. **Is the match actually safe?** Re-categorize using Step 1. If the content turns out to be a live internal in disguise, redact it; do not suppress the scanner.
2. **Is the pattern too broad?** Tighten the regex so the safe content no longer matches. Document the tightening with a comment in `check-redaction.sh` linking to the case that motivated it.
3. **Only if 1 and 2 both fail** — and the pattern is structurally too entangled with legitimate content to narrow further — use a single-line suppression with a `# REASON:` comment that states *why* the suppression is safe. Date the comment.

```bash
# Bad — mystery suppression
echo "API endpoint pattern" >> ignore.txt

# Good — narrowed pattern with rationale
# Pattern v2: tightened from `\bgate\(` to `\bgate\(['\"][a-z]+_phase` after
# legitimate `gate(true)` calls in our own SDK examples started matching. 2026-04-15.
PATTERNS+=("vendor flag predicate|\\bgate\\(['\"][a-z]+_phase")
```

**Expected:** Each scanner pattern has zero or one inline comment explaining a tightening. Suppressions, if any, carry a date and a rationale.

**On failure:** If suppressions accumulate (more than one per quarter), the deny-list is mis-shaped. Schedule a redaction-policy review and rebuild the patterns from the categorized fact inventory.

### Step 9: Periodic Redaction Sweeps

Not all redaction work is incident-driven. Run a periodic sweep (monthly is typical) that re-categorizes the most recent additions to the private repo and re-runs the scanner against the public mirror. Drift catches itself before it becomes incident-grade.

Sweep checklist:

- [ ] Re-read the version-lag policy; confirm the empirical "current" version is unchanged or update the policy
- [ ] Audit the last month of private-repo commits for newly-added findings that were not categorized (Step 1)
- [ ] Run `tools/check-redaction.sh` against the public mirror (should still exit 0)
- [ ] Review any scanner patterns added since last sweep — are any too broad? Tighten if so
- [ ] If any version has aged past the cool-off, identify findings now eligible for promotion
- [ ] Confirm `tools/public-allowlist.txt` matches the actual public-mirror file set

**Expected:** A short sweep log per month in the private repo (e.g., `sweeps/2026-04.md`) with checklist outcomes and any actions taken.

**On failure:** If the sweep is repeatedly skipped, automate a calendar reminder. If the sweep keeps finding the same drift, the workflow upstream of it is the problem — investigate why categorization is being skipped at draft time.

## Validation

- [ ] Every file in the public mirror is on `tools/public-allowlist.txt`
- [ ] `tools/check-redaction.sh ./public-mirror` exits 0
- [ ] `git log --oneline` on the public mirror shows a single orphan commit per publish
- [ ] `REDACTION_POLICY.md` exists in the private repo with an explicit version-lag cool-off
- [ ] Every Phase 1-4 finding has a category label (methodology / generic pattern / version-specific / live internal)
- [ ] Public CI runs the scanner on every push; a deliberate test pattern fails the build
- [ ] The deny-list scanner itself does not live in the public repo
- [ ] The most recent monthly sweep log is dated within the last 35 days

## Common Pitfalls

- **"Just one example to make it concrete."** The temptation to include one specific finding "to ground the methodology" is the most common leak path. Use synthetic placeholders (e.g., `acme_widget_v3`, `widget_handler_42`) — clearly invented, never traceable to a real product.
- **Using `git rebase` or `git filter-branch` to scrub a leak in place on the public repo.** Force-pushing rewritten history still leaves traces in clones and forks. The orphan-commit publish pattern is a structural fix; ad-hoc history rewriting is not.
- **Suppressions instead of pattern tightening.** A scanner with twenty suppressions is a scanner with zero meaningful coverage. Every suppression is a future leak waiting for context to fade.
- **Public CI that warns instead of failing.** Warnings get ignored. The CI gate must block the publish (non-zero exit, no merge button).
- **Allow-list drift.** New files added to the private repo do not automatically belong on the allow-list. Default-deny is the only safe posture.
- **Mistaking encryption for redaction.** Encoding, hashing, or rot13-ing a sensitive identifier and publishing the result still publishes it — the original is recoverable. Redact means "does not appear at all."
- **Publishing the deny-list.** The patterns themselves are a finding catalog: a reader who sees the regex knows exactly what to grep for in the binary. Keep the scanner private; only its labels (e.g., `LEAK: vendor-prefixed flag`) should appear in public CI logs.
- **Treating the private repo as a draft pile.** It is the source of truth for the research, not a scratch space. Apply the same versioning, review, and backup discipline you would to any production artifact.

## Related Skills

- `monitor-binary-version-baselines` — Phase 1, baselines feed the version-lag policy: what counts as "current" is an empirical fact, not a calendar fact
- `probe-feature-flag-state` — Phases 2-3, classification findings here enter the redaction pipeline at category step (Step 1)
- `conduct-empirical-wire-capture` — Phase 4, capture artifacts (wire logs, payload schemas) need redaction before any can be referenced publicly
- `security-audit-codebase` — both pipelines benefit from deny-list-style scanning; this skill specializes for research disclosure rather than secret leakage
- `manage-git-branches` — the orphan-commit publish pattern is a branch operation; safe execution requires the branch hygiene practices documented there
