---
name: redact-for-public-disclosure
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Redact reverse-eng findings → public disclosure. Preserve methodology,
  generalizable patterns, teaching value. Private/public repo split, deny-list
  patterns, orphan-commit publish (no `git log` leaks), category-based
  calibration (methodology/pattern/version/internal), `check-redaction.sh` CI
  gate. Use → publish CLI harness findings, upstream proposals, archive
  private research.
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

Split reverse-eng research repo → private source-of-truth + public-disclosure subset via redaction checker, deny-lists, orphan-commit publish. Methodology travels; specific findings stay private.

## Use When

- Publish methodology findings re: closed-source CLI harness you integrate w/
- Prep upstream proposal/bug report → project not yours
- Archive private research repo → public ref
- Promote investigation notes (Phase 1-4) → public guide
- Establish publish pipeline before findings stack → leak risk no backup
- Clean up after near-miss draft almost shipped sensitive id

## In

- **Required**: Private research repo w/ mixed-sensitivity (source of truth)
- **Required**: Target public mirror (separate repo, or `public/` worktree)
- **Optional**: Existing draft slated for publication
- **Optional**: Version-lag policy (default "current + 1 prior stay private")
- **Optional**: List of vendor ids, flag prefixes, namespaces known sensitive

## Do

### Step 1: Categorize Each Fact

Before write/promote, sort each fact → 1 of 4 categories. Determines if/when ships.

| Category | Definition | Shareable? |
|---|---|---|
| **methodology** | The *how* of investigation, independent of any specific finding | Always |
| **generic pattern** | Class-level observations (e.g., "harnesses commonly use a single-prefix flag namespace") | Yes |
| **version-specific finding** | Concrete observation tied to a specific release (e.g., "in vN.M, the gate defaults off") | Only after the version-lag cool-off |
| **live internal** | Minified names, byte offsets, dark flag names, current-version gate logic, PRNG/salt constants, internal codenames | Never |

Annotate each draft section, capture log, note → category before review for publication. Section mixing categories splits → methodology lifts clean, rest private.

→ Each fact has category. Public drafts contain only methodology + generic-pattern (+ version-specific older than cool-off).

If err: fact resists categorization → treat as live internal default. Re-categorize only after explicit review vs version-lag policy.

### Step 2: Set Version-Lag Cool-Off

Decide upfront how many versions sit between "current" + "shareable". Two typical: current + 1 prior private, older patterns may discuss. Write to private repo (`REDACTION_POLICY.md`) → no re-derive later.

```markdown
# Redaction Policy

Version-lag cool-off: **2 releases**.
- Current release (vN): all version-specific findings PRIVATE.
- Previous release (vN-1): all version-specific findings PRIVATE.
- Releases vN-2 and earlier: version-specific findings may move to public draft after Step 5 review.

Source of truth for "current": output of `monitor-binary-version-baselines`.
Owner: <name>. Reviewed quarterly.
```

"Current" must be empirical (read from installed binary), not admin. Tie policy to baseline scanner, not calendar.

→ Committed `REDACTION_POLICY.md` in private repo w/ explicit cool-off + owner.

If err: stakeholders disagree → default most conservative. Cool-offs shorten later; recall leak cannot.

### Step 3: Build Deny-List Scanner

Maintain patterns in single executable script = source of truth for redaction policy. Lives in private repo (`tools/check-redaction.sh`), runs vs public mirror.

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

Each entry: human label + regex. One per sensitive id *shape* (not literal — shapes survive version churn). Exit code = leak count; clean exits 0.

→ `tools/check-redaction.sh ./public-mirror` runs <1s on small repo, exits 0 when no match.

If err: no `rg` → fall back `grep -rqE`. Patterns too broad (every run leaks) → narrow source not suppress.

### Step 4: Maintain Deny-List Before Drafting

When Phase 1-4 finding could leak via draft → extend scanner *before* draft. Drafts cheap; teaching scanner durable.

Workflow:

1. New finding lands in private repo (e.g., new flag prefix)
2. Ask: "If leaked, what scanner catch?"
3. Add pattern entry to `tools/check-redaction.sh` (label + regex)
4. Run scanner vs entire public mirror → confirm new pattern not tripped by legit content
5. Only then draft public content touching area

Inverts usual order: scanner first, draft second. Scanner = executable spec of "too sensitive to publish", draft can't outpace.

→ Pattern entries in `tools/check-redaction.sh` predate any public-mirror content matching. `git log tools/check-redaction.sh` shows scanner updates landing before related drafts.

If err: scanner lags drafts → audit public mirror vs new pattern immediately. Redact, then commit scanner update w/ note.

### Step 5: Private/Public File-Set Split

Define explicit allow-list of files syncing to public mirror. New files default private; promotion needs redaction-check clearance.

```bash
# tools/public-allowlist.txt
README.md
LICENSE
guides/methodology-overview.md
guides/category-classification.md
docs/contributing.md
```

`tools/sync-to-public.sh` reads allow-list, copies only those files, exits non-zero if missing file (catches typos).

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

Promotion needs 3 in order: file added to allow-list, passes redaction check, reviewer confirms category labels (Step 1).

→ Public mirror = exactly files in `tools/public-allowlist.txt`. No file in mirror missing from allow-list.

If err: file in mirror missing allow-list → leak event. Investigate arrival, remove or formally promote after review.

### Step 6: Publish via Orphan Commit

Public mirror = single `git commit --orphan`-rooted commit recreated each publish. Prevents `git log` exposing pre-redaction drafts.

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

Public repo `git log` shows exactly 1 commit. Prior drafts + redaction iter stay in private. No `git log -p`, `git reflog`, branch listing on public can recover pre-redaction → never committed there.

→ `git log --oneline` on public mirror shows single commit per publish. No refs to private repo history (no parent SHAs, merge commits, tags from private) appear.

If err: `git push --force` rejected (branch protection) → open single-commit PR from clean orphan branch instead. Never solve rejection by pushing private history.

### Step 7: Wire CI Gate

Run `tools/check-redaction.sh` on every commit to public-sync branch. Failed check blocks publish, not warns.

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

2 design choices:

- Scanner pulled from private at CI time → deny-list never lives in public (patterns themselves sensitive — publishing tells reader exactly what to look for)
- Job exits w/ scanner exit code; non-zero blocks workflow

→ Pushes introducing deny-listed pattern fail CI; publish doesn't land. Maintainers see failing label (e.g., `LEAK: vendor-prefixed flag`) w/o regex itself.

If err: private-repo token can't grant to public CI → embed only *minimum-leak* portion in public (broad shape patterns not identifying vendor) + run full scanner pre-push from private.

### Step 8: False Positives Honestly

When scanner trips on legit content → narrow pattern not add ignore-line. Broad deny-lists w/ local suppressions rot fast — 6 mo later no one remembers why line suppressed, next leak slides past.

Decision tree:

1. **Match actually safe?** Re-categorize via Step 1. If turns out live internal in disguise → redact, no suppress.
2. **Pattern too broad?** Tighten regex so safe content no match. Doc tightening w/ comment in `check-redaction.sh` linking case.
3. **Only if 1 + 2 fail** — pattern structurally too entangled w/ legit to narrow → single-line suppress w/ `# REASON:` comment stating *why* safe. Date comment.

```bash
# Bad — mystery suppression
echo "API endpoint pattern" >> ignore.txt

# Good — narrowed pattern with rationale
# Pattern v2: tightened from `\bgate\(` to `\bgate\(['\"][a-z]+_phase` after
# legitimate `gate(true)` calls in our own SDK examples started matching. 2026-04-15.
PATTERNS+=("vendor flag predicate|\\bgate\\(['\"][a-z]+_phase")
```

→ Each scanner pattern has 0 or 1 inline comment explaining tightening. Suppressions, if any, carry date + rationale.

If err: suppressions accumulate (>1/quarter) → deny-list mis-shaped. Schedule policy review + rebuild patterns from categorized inventory.

### Step 9: Periodic Sweeps

Not all redaction incident-driven. Run periodic sweep (monthly typical) → re-categorize recent additions + re-run scanner. Drift catches itself before incident-grade.

Sweep checklist:

- [ ] Re-read version-lag policy; confirm empirical "current" unchanged or update
- [ ] Audit last month private-repo commits for new uncategorized findings (Step 1)
- [ ] Run `tools/check-redaction.sh` vs public mirror (should still exit 0)
- [ ] Review scanner patterns added since last sweep — too broad? Tighten if so
- [ ] Any version aged past cool-off → ID findings now eligible for promotion
- [ ] Confirm `tools/public-allowlist.txt` matches actual public-mirror file set

→ Short sweep log per month in private repo (`sweeps/2026-04.md`) w/ checklist outcomes + actions.

If err: sweep repeatedly skipped → automate calendar reminder. Sweep keeps finding same drift → workflow upstream is problem. Investigate why categorization skipped at draft time.

## Check

- [ ] Every public mirror file on `tools/public-allowlist.txt`
- [ ] `tools/check-redaction.sh ./public-mirror` exits 0
- [ ] `git log --oneline` on public mirror = single orphan commit per publish
- [ ] `REDACTION_POLICY.md` exists in private repo w/ explicit version-lag cool-off
- [ ] Every Phase 1-4 finding has category label (methodology/pattern/version/internal)
- [ ] Public CI runs scanner on every push; deliberate test pattern fails build
- [ ] Deny-list scanner itself does NOT live in public repo
- [ ] Most recent monthly sweep log dated <35 days

## Traps

- **"Just one example to make concrete."** Including one specific finding "to ground methodology" = most common leak path. Use synthetic placeholders (`acme_widget_v3`, `widget_handler_42`) — clearly invented, never traceable.
- **`git rebase`/`filter-branch` to scrub leak in place on public.** Force-push rewritten history still leaves traces in clones + forks. Orphan-commit = structural fix; ad-hoc rewriting not.
- **Suppressions vs tightening.** Scanner w/ 20 suppressions = 0 meaningful coverage. Each suppression = future leak.
- **Public CI warns vs fails.** Warnings ignored. Gate must block publish (non-zero exit, no merge button).
- **Allow-list drift.** New private files don't auto belong on allow-list. Default-deny only safe.
- **Encryption ≠ redaction.** Encoding, hashing, rot13-ing sensitive id + publishing = still publishes (original recoverable). Redact = "does not appear at all."
- **Publishing deny-list.** Patterns themselves = finding catalog. Reader seeing regex knows exactly what to grep in binary. Keep scanner private; only labels (`LEAK: vendor-prefixed flag`) appear in public CI logs.
- **Private repo as draft pile.** Source of truth not scratch space. Same versioning, review, backup as production.

## →

- `monitor-binary-version-baselines` — Phase 1, baselines feed version-lag policy
- `probe-feature-flag-state` — Phases 2-3, classification enters pipeline at Step 1
- `conduct-empirical-wire-capture` — Phase 4, capture artifacts need redaction before public ref
- `security-audit-codebase` — both pipelines benefit from deny-list scanning
- `manage-git-branches` — orphan-commit pattern needs branch hygiene
