---
name: stale-proof-rendered-numbers
description: >
  Make every measured number displayed in a generated artifact resolve
  from source files at build time, so stale numbers fail the build
  instead of rendering silently. Displayed figures become {metric.key}
  placeholders; a single extractor reads the real measurement artifacts
  (results JSON, run logs, ledgers) and emits a stats.json of
  value/source/as-of entries; the renderer substitutes at build and
  hard-fails on any missing key. Covers the single-writer discipline,
  pinning closed measurements with provenance, the as-of-date-on-artifact
  convention, and stopifnot-guarded figure scripts. Use when a README,
  dashboard, benchmark table, coverage badge, report card, or any living
  document displays numbers that change as measurements move, when
  hand-edited stats have drifted from their sources, or when a review
  finds artifacts that claim file-derived numbers but hardcode them.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: intermediate
  language: multi
  tags: stale-proof, provenance, metrics, templates, reporting
  locale: de
  source_locale: en
  source_commit: 3b0afd0b
  translator: "Claude + human review"
  translation_date: "2026-07-10"
---

# Stale-Proof Rendered Numbers

Convert hardcoded numbers in generated artifacts into templates that resolve from measurement sources at render time, where a missing key is a build error. Hardcoded numbers rot the moment the underlying measurement moves — and they rot *silently*, which is worse than a visible error. This skill makes staleness loud: numbers are never typed into the artifact, one extractor is the only writer of the stats file, and the renderer refuses to build anything it cannot trace to a source.

## When to Use

- A generated artifact (README stats block, status dashboard, benchmark table, coverage badge, report card) displays measured numbers that keep moving as new runs land
- Two artifacts already disagree about the same metric because each was hand-edited at a different time
- A review found scripts or captions that *claim* their numbers are file-derived but actually hardcode literals
- You are wiring a new living document and want staleness to be impossible from the start
- Point-in-time results of closed measurements are scattered across prose and need one audited home with provenance

## Inputs

- **Required**: The generated artifact(s) displaying measured numbers, and the build step that renders them (script, Makefile target, CI job)
- **Required**: The source artifacts each number truly derives from (measurement JSON, run logs, ledgers, coverage reports, tool `--json` output)
- **Required**: A key naming scheme for metrics (lowercase dotted paths, e.g. `bench.api.p95_ms`)
- **Optional**: Closed measurements with no machine-readable artifact — these become FROZEN entries with provenance (default: pin them in the extractor)
- **Optional**: Figure/plot scripts that display numbers (these get the guarded-figure variant in Step 6)

## Procedure

### Step 1: Inventory Displayed Numbers and Classify Their Sources

List every number the artifact displays. For each, answer: *which file on disk backs this number right now?*

```bash
# Surface numeric literals in the artifact's source or template data
grep -nE '[0-9]+(\.[0-9]+)?\s*(%|ms|pts?|n=|/)' docs/README.template.md
```

Classify each hit into one of three buckets:

1. **Live-artifact-backed** — a measurement file, run log, or ledger exists and is machine-readable (or one `--json` flag away from it)
2. **Closed / frozen** — the measurement arc is finished; the raw artifacts predate the pipeline or are gone; only the recorded result remains
3. **Not a measurement** — version strings, dates of events, prose. Leave these alone; do not template them

**Expected:** A table of `displayed number → source file (or FROZEN + provenance)` covering every measured figure in the artifact. Nothing is left as "I remember it was 30%".

**On failure:** If a number has no locatable source, it is either frozen (pin it in Step 3 with a provenance string naming where the result was recorded) or unsubstantiated (remove it from the artifact — a number nobody can trace should not render).

### Step 2: Replace Literals with `{metric.key}` Placeholders

Turn the artifact's data or template into templates. Every measured literal becomes a placeholder:

```markdown
## Status (as of {meta.generated_at})

- Test suite: {tests.passed}/{tests.total} passing, {coverage.line_pct}% line coverage
- API p95 latency: {bench.api.p95_ms} ms (n={bench.api.n}, measured {bench.api.as_of})
- v1.0 baseline: {frozen.v1_baseline_p95_ms} ms (closed load test, 2026-05-02)
```

Key grammar: lowercase dotted paths, at least one dot (`[a-z0-9_]+(\.[a-z0-9_]+)+`). Requiring the dot keeps the substitution regex from matching legitimate braces elsewhere in the document (code spans, shell snippets).

**Expected:** `grep -nE '[0-9]'` on the template shows no measured literals left — only placeholders, prose, and non-measurement numbers from Step 1's bucket 3.

**On failure:** If a line mixes a measured number with prose punctuation that resists templating, split the placeholder finer (`{ladder.lucario.wr_pct}% (n={ladder.lucario.n})`) rather than templating a whole preformatted string — one placeholder per number keeps sources auditable.

### Step 3: Build the Single Extractor

Write ONE extractor (e.g. `tools/doc_stats.py`) that reads the real artifacts and emits `stats.json`. It is the **only writer** of that file; numbers are never typed into the artifact or the stats file by hand.

```python
FROZEN_METRICS = {
    # Point-in-time results of CLOSED measurements: pinned HERE, one audited
    # place, each with source + as_of. When an artifact-backed source appears,
    # migrate the key OUT of this block into a reader function below.
    "frozen.v1_baseline_p95_ms": {
        "value": "212",
        "source": "release-1.0 load test, docs/perf-report-v1.md (closed 2026-05-02)",
        "as_of": "2026-05-02",
    },
}

def bench_metrics(today: str) -> dict:
    run_path = newest(Path("bench/results").glob("api_*.json"))
    run = json.loads(run_path.read_text())
    source = f"{run_path} ({run['n']} requests)"
    return {
        "bench.api.p95_ms": {"value": str(run["p95_ms"]), "source": source, "as_of": today},
        "bench.api.n": {"value": str(run["n"]), "source": source, "as_of": today},
        "bench.api.as_of": {"value": today, "source": source, "as_of": today},
    }
```

Every metric entry has exactly the shape `{value, source, as_of}`:

```json
{
 "generated_at": "2026-07-10",
 "metrics": {
  "bench.api.p95_ms": {
   "value": "187",
   "source": "bench/results/api_2026-07-08.json (500 requests)",
   "as_of": "2026-07-10"
  }
 }
}
```

Rules that make this stale-proof rather than merely centralized:

- **Single writer**: only the extractor writes `stats.json`. A hand edit to `stats.json` is a defect, not a shortcut.
- **Frozen block discipline**: closed measurements live in `FROZEN_METRICS` with a provenance string naming where the result was recorded and an `as_of` date. This is the ONE audited place for point-in-time numbers. Migrate keys out as live sources appear.
- **Fail on missing sources**: if a ledger row or artifact the extractor depends on is absent, exit non-zero with a `FAIL:` message — do not emit a partial stats file silently.
- **Commit stats.json, not raw runs**: the aggregate stats file is small and reviewable; the raw run logs it derives from can stay gitignored.

See [references/EXAMPLES.md](references/EXAMPLES.md) for the complete extractor.

**Expected:** Running the extractor prints each key with its value and as-of date and writes `stats.json`; re-running it after a new measurement run changes the affected values with zero manual edits.

**On failure:** If a source is not machine-readable, first check for a `--json` flag or an existing structured sibling (ledger TSV, JSONL results). Only regex-parse human-oriented output as a last resort, and make the parse fail loudly when the pattern stops matching.

### Step 4: Substitute at Render and Hard-Fail on Missing Keys

The renderer resolves placeholders from `stats.json` at build time. A missing key is a **build error** — stale can never render silently:

```python
stats = json.loads(Path("docs/stats.json").read_text())
metrics = dict(stats["metrics"])
metrics["meta.generated_at"] = {"value": stats["generated_at"]}

def resolve(text: str) -> str:
    def substitute(match: re.Match) -> str:
        metric_key = match.group(1)
        if metric_key not in metrics:
            sys.exit(f"FAIL: stats.json is missing metric '{metric_key}' "
                     f"— rerun: python3 tools/doc_stats.py")
        return metrics[metric_key]["value"]
    return re.sub(r"\{([a-z0-9_]+(?:\.[a-z0-9_]+)+)\}", substitute, text)
```

The same guard in R (generalized from a card-rendering pipeline; full version in [references/EXAMPLES.md](references/EXAMPLES.md)):

```r
metric <- stats$metrics[[metric_key]]
if (is.null(metric)) {
  stop("stats.json is missing metric '", metric_key,
       "' — rerun: python3 tools/doc_stats.py", call. = FALSE)
}
text <- sub(placeholder, as.character(metric$value), text, fixed = TRUE)
```

Two properties are non-negotiable: the lookup **stops the build** on a missing key (no `.get(key, "N/A")`, no warning-and-continue), and substitution of the matched placeholder is literal (`fixed = TRUE` / replacement from a function), never a second regex pass over the value.

**Expected:** A full build renders the artifact with every placeholder resolved; the output contains no `{...}` placeholder-grammar matches.

**On failure:** If a legitimate brace expression in the document trips the substitution, tighten the key grammar (the required dot usually suffices) rather than loosening the failure — silent skips reintroduce the rot this pipeline exists to prevent.

### Step 5: Show the As-Of Date on the Artifact

Every rendered artifact displays when its numbers were extracted, sourced from `stats.json` — never typed:

- A document-level line: `Status as of {meta.generated_at}` from the stats file's `generated_at`
- Per-number dates where measurements move independently: `(measured {bench.api.as_of})`

This is the reader-facing half of the honesty contract: the build guarantees numbers match sources *at extraction time*, and the as-of date tells the reader what that time was.

**Expected:** The rendered artifact visibly carries an as-of date that changes when (and only when) the extractor reruns.

**On failure:** If the artifact has no natural place for a date, add a caption, footer, or badge suffix. An artifact showing measured numbers without an as-of date fails review under this skill.

### Step 6: Guard Generated Figures — the `stopifnot` Variant

Placeholders cover text substitution. Generated *figures* need the same honesty a different way: each figure script **re-reads its source files at render time** and guards every value it displays, so a plot literally cannot render a number it did not just read.

```r
bench <- jsonlite::fromJSON("bench/results/api_2026-07-08.json")
stopifnot(
  is.numeric(bench$p95_ms), bench$p95_ms > 0,
  bench$n >= 100  # the caption claims n >= 100 — enforce it
)
p95_label <- sprintf("p95 = %.0f ms (n = %d)", bench$p95_ms, bench$n)
# every annotation below derives from `bench`; no numeric literals in labels
```

Two guard styles compose:

- **Derivation guard**: displayed values are computed from the freshly read data, and `stopifnot()` asserts the invariants the figure's message depends on (row counts sum to the traced total, rates are in range, the cited n is met)
- **Provenance guard**: when a caption cites a figure the data file does not carry (a sample size, a seed), assert the source document still contains that string — `stopifnot(grepl("n=100", readme_text, fixed = TRUE))` — so the caption never states a number the source stopped backing

This makes "claimed file-derivation" *enforceable*: an adversarial review of scripts that claimed to read files but hardcoded literals is what motivated this variant. In Python, `assert`/`sys.exit` guards on freshly loaded data serve the same role.

**Expected:** Every figure script reads its sources at render time; deleting or changing a source file makes the figure build fail or visibly change — never silently render the old number.

**On failure:** If a script has literals in labels or annotations, replace each with a value computed from the loaded data plus a guard. If the value exists nowhere machine-readable, route it through the extractor's FROZEN block and read `stats.json` instead.

### Step 7: Wire the Flow and Prove It

Document and wire the pipeline as `measure → extract → render`:

```bash
python3 tools/doc_stats.py          # extract: artifacts -> docs/stats.json
python3 tools/render_docs.py        # render: template + stats.json -> README.md
```

Then run the two proofs (these are the skill's acceptance tests):

```bash
# Proof 1 — bogus key fails the build
printf '\n- bogus: {does.not_exist}\n' >> docs/README.template.md
python3 tools/render_docs.py; echo "exit=$?"     # expect FAIL message, exit != 0
git checkout -- docs/README.template.md

# Proof 2 — live source auto-refresh, zero manual edits
# (land a new measurement run, e.g. bench/results/api_<today>.json)
python3 tools/doc_stats.py && python3 tools/render_docs.py
git diff --stat docs/ README.md                   # only generated files changed
```

Proof 2 is the payoff: in the originating pipeline a rendered card auto-updated `n=70 → n=200` from a still-running measurement's artifact with no hand edits.

**Expected:** Proof 1 exits non-zero naming the missing key and the rerun command. Proof 2 shows the new values and as-of date in the rendered artifact with `git diff` touching only extractor output and rendered files.

**On failure:** If Proof 1 renders the bogus placeholder or exits 0, the renderer has a silent-default path — remove it (Step 4). If Proof 2 requires any hand edit, a number is still typed somewhere; trace it and move it behind the extractor.

## Validation

- [ ] Every measured number in the artifact is a `{metric.key}` placeholder; none are typed literals
- [ ] Exactly one extractor writes `stats.json`; every entry has `value`, `source`, and `as_of`
- [ ] Closed measurements are pinned in the extractor's FROZEN block with provenance strings and as-of dates, and nowhere else
- [ ] The renderer hard-fails on a missing key: the bogus-key proof (Step 7) exits non-zero with an actionable message
- [ ] A new measurement run propagates to the rendered artifact via extract + render with zero manual edits (Step 7, Proof 2)
- [ ] The rendered artifact displays an as-of date sourced from `stats.json`
- [ ] Figure scripts re-read their sources at render time and guard displayed values (`stopifnot` or equivalent)
- [ ] The `measure → extract → render` flow is documented next to the pipeline (README or script headers)

## Common Pitfalls

- **Silent defaults defeat the design**: `metrics.get(key, "N/A")`, warn-and-continue, or rendering the raw placeholder on a miss turns a build error back into silent rot. The missing-key path must stop the build.
- **Hand-editing stats.json**: it is generated output with an audit trail, not a config file. A hot-fix typed into it will be overwritten by the next extractor run — or worse, won't be, and diverges. Fix the source artifact or the extractor.
- **Frozen keys that never migrate**: FROZEN is a holding pen with provenance, not a destination. When a machine-readable source appears for a frozen key, move it to a reader function — review the frozen block whenever a new artifact type lands.
- **Regex substitution mangling values**: substituting with the value as a regex replacement string breaks on `\`, `$`, or `&` in values. Use literal replacement (`fixed = TRUE` in R, a replacement *function* in Python `re.sub`).
- **Placeholder grammar too loose**: `\{(\w+)\}` matches legitimate braces in code spans and shell text. Require the dotted-path grammar so only metric keys match — and unknown *matching* keys still fail loudly.
- **Figures that claim derivation but hardcode**: a script that loads a file and then annotates with a typed literal passes casual review. The guard (Step 6) is what makes the claim checkable — insist on it for every displayed value.
- **Templating non-measurements**: version numbers, event dates, and prose counts do not belong in stats.json. Templating them adds churn without honesty gains; Step 1's bucket 3 stays untouched.

## Related Skills

- `generative-recipe-dsl` - data-driven artifact generation; this skill keeps the numbers those generated artifacts display honest
- `build-parameterized-report` - parameter-driven report rendering; combine with this skill so report parameters select *which* metrics render while the extractor guarantees their freshness
