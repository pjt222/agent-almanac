---
name: enforce-redaction-gate
description: >
  Statically enforce a privacy/redaction boundary on an artifact tree before
  publication, the way an AST checker enforces a code contract. Builds a
  two-tier gate — a shape-based deny-list (regex over identifier shapes) plus a
  structure-aware tier that parses JSON/HTML/SVG/Markdown/code and asserts
  sensitive content cannot appear in meaningful positions — with a strict
  exit-code contract, label-only output that never echoes the patterns
  themselves, and false-positive narrowing instead of suppressions. Use when
  gating a public mirror, a disclosure draft, a wire-capture export, or any
  artifact that must pass a leak check before it ships, and when a plain
  line-grep is too coarse to trust.
license: MIT
allowed-tools: Read Write Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.4"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: redaction, ci-gate, deny-list, static-analysis, privacy-boundary, leak-detection
---

# Enforce Redaction Gate

A redaction gate is the privacy-boundary analogue of an AST checker: it parses what is about to ship and refuses to let a deny-listed shape through, returning a machine-checkable verdict rather than a human opinion. This skill builds that gate as a single executable that any transform skill or CI job can call to *verify* its output. Two tiers cooperate — a fast shape-based deny-list and a slower structure-aware pass — so the gate catches both literal token leaks and the structural leaks a line-grep misses.

## When to Use

- Gating a public mirror or disclosure draft before publish (the blocking check, not a warning)
- Verifying the output of a redaction transform (`redact-visualization-for-disclosure`, `redact-wire-capture`) actually cleared every pattern
- Adding a CI step that fails the build when a sensitive identifier shape appears
- Replacing an ad-hoc `grep -r secret` with a maintained, exit-code-contracted, structure-aware checker
- Auditing an already-published tree after a near-miss to confirm nothing slipped through

## Inputs

- **Required**: A target tree or file set to scan (the artifact about to ship)
- **Required**: A deny-list of sensitive identifier *shapes* (regexes), kept in the private source repo — never published
- **Optional**: A structure map — which file types carry structured content (JSON keys, HTML attributes, SVG text nodes, code identifiers) and which positions are sensitive
- **Optional**: A CI context (the gate runs the same locally and in CI)

## Procedure

### Step 1: Inventory the Sensitive Shapes, Not the Strings

List what must never appear, as *shapes* that survive version churn — not as the exact literals of today. A shape outlives the specific value; a literal list rots at the next rename.

| Shape class | What it matches (synthetic example) | Why a shape |
|---|---|---|
| vendor flag namespace | `acme_[a-z0-9_]+` | flag names rotate; the prefix persists |
| minified identifier | `\bA[a-z]?[0-9]?\b`, `q3\(\)` | bundle identifiers churn per release |
| credential token | `sk-[a-z]+-[a-z0-9]+-[A-Za-z0-9_-]{20,}` | the prefix marks the class, the suffix is the secret |
| internal endpoint | `/v1/internal/[a-z/]+` | path segments are stable, the leaf is the leak |
| PRNG/salt constant | `0x[0-9A-F]{8}`, a known seed integer | constants are exact and identifying |

Each row becomes one deny-list entry: a human-readable **label** plus a **regex**. One entry per shape, never one per literal.

**Expected:** A table of shape classes, each with a label and a regex, covering every category from a prior fact inventory (see `redact-for-public-disclosure` Step 1).

**On failure:** If a shape resists a clean regex (entangled with legitimate content), defer it to the structure-aware tier (Step 3) rather than writing a broad regex that floods false positives.

### Step 2: Build the Shape-Tier Scanner

Maintain the patterns in one executable that lives in the private repo and runs against the target. The output names only the **label** — never the regex — so the gate's own logs do not become a finding catalog.

```bash
#!/usr/bin/env bash
set -uo pipefail
TARGET="${1:?target path required}"
[ -r "$TARGET" ] || { echo "cannot read: $TARGET" >&2; exit 2; }   # FAIL CLOSED, never read as a pass
SEARCH=$(command -v rg >/dev/null && echo rg || echo grep)
command -v "$SEARCH" >/dev/null || { echo "cannot find $SEARCH" >&2; exit 2; }   # FAIL CLOSED
LEAKS=0

# "label|regex" — one entry per SHAPE. Patterns stay private; only labels print.
PATTERNS=(
  "vendor flag namespace|acme_[a-z0-9_]+"
  "minified call shape|\\b[A-Za-z][A-Za-z0-9]?\\(\\)"
  "credential token|sk-[a-z]+-[a-z0-9]+-[A-Za-z0-9_-]{20,}"
  "internal endpoint|/v1/internal/[a-z/]+"
)

for entry in "${PATTERNS[@]}"; do
  # Split on the FIRST pipe only: label is everything before it, pattern is everything after —
  # so a regex MAY contain its own alternation ('a|b'), which Step 1's own table and the pitfall
  # below both use as the worked example. Splitting on the LAST pipe instead silently drops every
  # alternative but the final one and still prints a correct-looking label (measured, #860 review).
  label="${entry%%|*}"; pat="${entry#*|}"
  if [ "$SEARCH" = rg ]; then
    # -uuu (--no-ignore --hidden --binary): the plain `rg -l` this replaced does not scan
    # dotfiles, .gitignore'd paths, or files it detects as binary, so it silently missed 3 of 4
    # seeded leaks (a .env, a NUL-containing bundle, a gitignored dist/) that the grep fallback
    # below caught — the verdict depended on which tool happened to be on PATH (measured, #860
    # review). --glob still excludes .git/ and node_modules/ explicitly under -uuu.
    hit=$(rg -uuu -l "$pat" --glob '!.git' --glob '!node_modules' "$TARGET" 2>/dev/null); rc=$?
  else
    hit=$(grep -rlE "$pat" --exclude-dir=.git --exclude-dir=node_modules "$TARGET" 2>/dev/null); rc=$?
  fi
  [ "$rc" -le 1 ] || { echo "cannot scan: $TARGET (tool error)" >&2; exit 2; }   # FAIL CLOSED — $SEARCH's own exit status, captured immediately as $?
  if [ -n "$hit" ]; then echo "  LEAK: $label"; LEAKS=$((LEAKS+1)); fi
done
[ "$LEAKS" -gt 0 ] && exit 1
exit 0
```

The exit code is 0 clean / 1 any findings (the count is in the printed `LEAK:` lines, never the exit status) / 2 could not run — two fail-closed checks make this composable, not a raw leak count: the `TARGET` readability check at the top, and the per-pattern check that the search tool's own exit status — captured immediately as `rc=$?`, with no pipeline in the way to obscure it — never exceeds 1, so a scanner that errors mid-scan reports could-not-run rather than a false clean. Binding the exit code directly to a count collides with the reserved could-not-run state the moment exactly two shapes leak, and gives a genuinely crashed scanner nowhere to signal from but "zero", which a `scanner && ok || echo CLEAN`-shaped wrapper reads as clean — the trap these two checks close. `hit` collects every matching file, never just the first: the check only asks *whether* a pattern matched, and an earlier `| head -1` here took a SIGPIPE (141, misread by the guard above as a scan failure) the moment `head` exited before the search tool's next stdout flush — which needs only a few kilobytes of output, intermittently from about 27 matching files here on this machine and reliably above roughly 30, far below the 64 KiB pipe capacity a reader might otherwise assume is the threshold — fixed by dropping the pipe rather than bounding the read, since nothing downstream uses more than `[ -n "$hit" ]` (#858). `grep -q`/`rg -q` would also drop the pipe and terminate faster, but both change the exit-code contract this gate depends on: GNU grep's `-q` returns 0 whenever a line was selected, even if an error occurred elsewhere in the same scan (ordering is irrelevant — measured both ways, #860 review), so a permission-denied file sitting beside a real leak would report LEAK (1) instead of the honest could-not-run (2). The full-scan `-l` form costs little in practice (under 0.1s over 5,000 files on this machine) and keeps the contract exact. A transform skill ends with `gate "$OUT" || exit 1`, and CI fails on non-zero. `tools/check-redaction.sh` in this repository ships exactly this contract as a working reference implementation of Steps 1-3 — more patterns, a `--verify` self-test that seeds every one of them, `--labels` — read its own header before building a second one from scratch.

**Expected:** Running the scanner on a known-clean tree exits 0; seeding a deliberate test token makes it exit 1 and print the matching label only; pointing it at an unreadable or missing target, or at a tree the search tool errors on mid-scan (a permission-denied file, say — even one sitting beside genuinely leaking content), exits 2 either way, never a false clean.

**On failure:** If `rg` is unavailable, the `grep -rE` fallback above runs (slower). If a pattern floods every run, it is too broad — narrow it in Step 5, do not suppress.

### Step 3: Add the Structure-Aware Tier (the AST-checker move)

A line-grep cannot tell a sensitive value in a *meaningful* position from a coincidental substring in prose. The structure tier parses the artifact and asserts on positions, the way an AST checker asserts on nodes rather than on text.

Per structured file type, parse and check the sensitive *positions*:

- **JSON / JSONL** — parse, then walk keys/values: assert no value under a sensitive key (`token`, `deviceId`, `email`) matches a credential/PII shape, and no key name is itself internal. A raw grep would miss a token that is base64-wrapped in a nested field; a parse will not.
- **HTML** — parse the DOM; check attribute values and text nodes, skipping comments and `<script>` string literals that are legitimately illustrative.
- **SVG** — check `<text>`/`<title>` nodes and `id`/`data-*` attributes; ignore path geometry.
- **Mermaid / dot** — node *labels* carry the leak; node *ids* usually do not — check labels, preserve ids.
- **Code** — tokenize and check identifier names against the minified-shape deny-list in identifier position only, so a word in a comment does not trip the gate.

```bash
# Example: JSON structural check — fail if any value under a sensitive key
# matches a credential shape. (jq is the "parser"; the position is the key.)
jq -e '
  [paths(scalars) as $p | {k: ($p[-1]|tostring), v: getpath($p)}]
  | map(select(.k|test("token|secret|email|deviceId";"i")))
  | map(select(.v|tostring|test("sk-[a-z]+-|@|[0-9a-f]{32,}")))
  | length == 0
' "$FILE" >/dev/null || { echo "  LEAK: sensitive value under sensitive key"; exit 1; }
```

The structure tier also validates *redaction's own output* — the redacted artifact the gate is scanning — not just leak positions inside it: redaction runs before the parser, so a token replaced in **identifier position** produces syntactically broken output that no visual diff surfaces — a replacement that is safe in prose is dangerous in identifier position. Re-parse the **redacted** artifact with its own parser (`node --check`, `mmdc`, `jq`, a YAML load), not the original. Where the artifact references its own identifiers (data-attribute lookups, graph edges), assert that every reference still resolves after redaction and that structural counts (nodes, edges, keys) match the source — a diagram renderer that stops treating a hyphenated replacement as an identifier drops nodes *silently*.

**Expected:** The structure tier flags a leak the shape tier misses (e.g., a token in a nested JSON field, an email in an SVG `<text>` node) and does *not* flag the same shape when it appears only in illustrative prose. The redacted artifact re-parses cleanly with its own parser, with self-references resolving and structural counts matching the source.

**On failure:** If a parser is unavailable for a file type, fall back to the shape tier for that type and record the gap explicitly — a silent fallback reads as "checked" when it was not. If the redacted artifact fails its own parser or loses references or counts, the fault is the replacement scheme, not the gate — adjust the substitution to preserve identifier validity and re-run.

### Step 4: Make the Gate Idempotent and Composable

The gate must be safe to run repeatedly and trivial to call from anything. Re-running on a clean tree is a no-op that exits 0. Transform skills call it as their final verification step; CI calls the identical script.

```bash
# Your gate, built from Steps 1-3, called as a transform skill's final step.
bash tools/your-redaction-gate.sh "$OUT_DIR" || {
  echo "redaction gate FAILED — output still leaks; extend patterns"; exit 1; }
```

**This repository ships the post-condition half rather than a tree gate, and #853 records why.**
A scanner asking "is this whole tree clean?" needs a corpus of real internal identifiers to be
right about, and such a corpus is private by definition — a 1507-line candidate built here fired
49 findings on the repository's own tooling in one round and missed an 86-character token in the
next. What ships instead is `tools/redact-artifact.py`, which asserts over output **it produced**,
using terms **its caller supplied**:

```bash
python3 tools/redact-artifact.py --type md --mapping map.tsv IN.md -o OUT.md
```

Read it as the reference implementation of Steps 1-3 at the scope where they are decidable. Build
a tree gate only if you hold the corpus that makes one meaningful.

**Expected:** The same gate invocation succeeds locally and in CI with no environment-specific branches. Two consecutive runs on a clean tree both exit 0.

**On failure:** If the gate behaves differently in CI, the divergence is almost always a missing tool (`rg`, `jq`) — pin them in the CI image rather than weakening the gate.

### Step 5: Wire CI to Block, Not Warn

A gate that warns is ignored. Run it on every push to the publish branch with the scanner pulled from the private repo so the patterns never live in public.

```yaml
# .github/workflows/redaction-gate.yml (public mirror)
name: redaction-gate
on: { push: { branches: [main, publish-*] }, pull_request: { branches: [main] } }
jobs:
  gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: sudo apt-get update && sudo apt-get install -y ripgrep jq
      - name: Fetch private scanner
        env: { GH_TOKEN: "${{ secrets.PRIVATE_REPO_TOKEN }}" }
        # The path names YOUR gate in YOUR private repository. This repository ships no tree
        # gate (#853) — fetching one from a private repo is precisely how a gate gets the corpus
        # that makes it meaningful, which is the argument for keeping it private rather than
        # publishing it.
        # `shell: bash` is not decoration: GitHub's UNSPECIFIED default on Linux is `bash -e
        # {0}` with NO pipefail, so a failing `gh api` here (an expired token, a renamed path,
        # a rate limit) would let `base64 -d` succeed on empty stdin, write a 0-byte gate.sh,
        # and exit 0 — the step reports success having fetched nothing (measured, #860 review).
        # `[ -s gate.sh ]` catches that even under the safer shell: an empty file is still a
        # successful write.
        shell: bash
        run: |
          gh api repos/<org>/<private>/contents/tools/your-redaction-gate.sh --jq .content | base64 -d > gate.sh
          [ -s gate.sh ] || { echo "scanner fetch failed: gate.sh is empty" >&2; exit 2; }
      - run: bash gate.sh .
```

**Expected:** A push that introduces a deny-listed shape fails CI; the publish does not land; the log shows only the label (e.g., `LEAK: credential token`), never the regex.

**On failure:** If the private-repo token cannot reach public CI, embed only the broad shape patterns (which do not themselves name the vendor) in public, and run the full structure-aware gate pre-push from the private repo.

### Step 6: Narrow False Positives, Never Suppress

When the gate trips on legitimate content, tighten the pattern or move the check to the structure tier — do not add an ignore line. A gate with suppressions is a gate with holes.

1. **Is the match actually safe?** Re-categorize. If it is a real internal in disguise, redact it.
2. **Too broad?** Tighten the regex, or promote the check to the structure tier so position disambiguates it. Comment the tightening with a date and the motivating case.
3. **Only if 1 and 2 fail** — a single dated `# REASON:` suppression that states why it is safe.

A token allowlist may be *derived from vendor documentation* — scan for anything shaped like an internal identifier, subtract what the vendor has published — which fails closed where a deny-list fails silently. Allowlisting is **per-token and licenses the name only** — never the value, behaviour, co-occurrence, or provenance attached to it. Pin a dated vendor URL per token and re-verify at disclosure time, not once at allowlist time. Re-derive on a cadence: a *growing* allowlist — equivalently, a shrinking effective deny surface — is a signal worth investigating, not noise; the vendor documented something, which relaxes what may be published. This is not the suppression creep the pitfall below condemns: a suppression is an undated judgment call that a match is "probably fine", while an allowlist entry is a dated, per-token, externally verifiable citation that expires with its vendor page. (This token allowlist is also a different axis from the file allowlist in `redact-for-public-disclosure` — do not conflate them.)

**Expected:** Each pattern carries zero or one dated tightening comment. Suppressions, if any, are dated and justified.

**On failure:** More than one suppression per quarter means the deny-list is mis-shaped — rebuild it from the fact inventory.

## Validation

- [ ] The gate exits 0 on a clean tree, exits **1 specifically** (not merely non-zero — 2 is could-not-run, not a finding) on a tree seeded with a deliberate test token, and exits 2 on an unreadable/missing target or a search-tool error mid-scan
- [ ] Output prints only labels, never the regexes or the sensitive values
- [ ] The structure tier catches at least one leak class the shape tier misses (documented)
- [ ] The redacted artifact re-parses cleanly with its own parser, and self-references (lookups, edges) still resolve with structural counts matching the source
- [ ] Every allowlisted token carries a dated vendor URL, licenses the name only (no value, behaviour, co-occurrence, or provenance claims), and was re-verified at disclosure time
- [ ] The same script runs identically locally and in CI; two clean runs are both no-ops
- [ ] CI blocks (non-zero exit, no merge), it does not warn
- [ ] The deny-list lives only in the private repo
- [ ] Every pattern has zero or one dated tightening comment; suppressions are dated and justified

## Common Pitfalls

- **Publishing the deny-list.** The patterns are a finding catalog — a reader who sees the regex knows exactly what to grep for. Keep the scanner private; surface labels only.
- **Grep where a parser is needed.** A token base64-wrapped in a nested JSON field, or an email inside an SVG `<text>` node, slides past a line-grep. That is what the structure tier is for.
- **Warning instead of failing.** Anything short of a non-zero exit that blocks the merge will be ignored within a week.
- **One entry per literal.** Literal lists rot at the next rename. Encode the *shape*; shapes survive version churn.
- **Suppression creep.** Twenty ignore-lines is zero meaningful coverage. Narrow at the source.
- **Mistaking encoding for redaction.** A hashed or base64'd secret is still the secret; the gate must treat the encoded form as a leak too.
- **Silent parser fallback.** If a file type cannot be parsed, say so — a quiet downgrade to grep reads as full coverage when it is not.
- **A gate command that *errors* must fail closed.** A check wired as `scanner && fail || echo CLEAN` treats a *tool error* — a bad flag, a missing file, an unreadable pattern — as a pass: the error takes the `||` branch and prints a false "CLEAN". Real example: `rg -E 'a|b'` aborts with `unknown encoding: a|b` because ripgrep's `-E` is `--encoding`, not extended-regex (that is `grep -E`; ripgrep is regex-by-default, or use `rg -e`), and the gate then reports clean over a leak it never scanned. Prove the scanner ran before trusting a pass: seed a known canary token and confirm the gate flags it, or check the exit path distinguishes "matched" from "errored". After any publish, re-run the check once more with verified-correct syntax against the pushed artifact — a false pass on public content is unrecoverable.

## Related Skills

- `redact-for-public-disclosure` — the methodology umbrella; this skill is the executable gate its Steps 3 and 7 describe, specialized and made structure-aware
- `redact-visualization-for-disclosure` — a transform that calls this gate to verify its rendered output before publish
- `redact-wire-capture` — a transform that calls this gate to verify a scrubbed capture
- `security-audit-codebase` — secret-scanning for live credentials; this skill specializes for research-disclosure shape-leaks and structural positions
- `setup-github-actions-ci` — wiring the gate as a blocking workflow step
