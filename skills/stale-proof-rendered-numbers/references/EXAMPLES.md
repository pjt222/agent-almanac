# Stale-Proof Rendered Numbers — Complete Worked Example

A full `measure → extract → render` pipeline for a project README status
block backed by a test-coverage report, benchmark run logs, and a CI
ledger. This generalizes the originating card-rendering pipeline
(`tools/card_stats.py` + `build_cards.R` in a game-analysis repo) to an
everyday engineering artifact: no domain-specific pieces remain.

Layout:

```text
project/
  bench/results/api_2026-07-08.json    # newest benchmark run (raw, gitignored)
  coverage.xml                         # coverage report from the test run
  ci_ledger.tsv                        # append-only ledger of CI runs
  docs/README.template.md              # placeholders, ONLY non-literal numbers
  docs/stats.json                      # extractor output (committed)
  tools/doc_stats.py                   # the single writer of stats.json
  tools/render_docs.py                 # substitutes + hard-fails on missing keys
  R/figures/latency_trend.R            # stopifnot-guarded figure variant
  README.md                            # rendered output
```

## 1. The Template (`docs/README.template.md`)

Every measured number is a `{metric.key}` placeholder. Version strings and
event dates are not measurements and stay literal:

```markdown
# widget-service

Status as of {meta.generated_at}.

## Health

- Test suite: {tests.passed}/{tests.total} passing, {coverage.line_pct}% line coverage
- API p95 latency: {bench.api.p95_ms} ms (n={bench.api.n}, measured {bench.api.as_of})
- Last green CI run: #{ci.last_green_run}
- v1.0 baseline p95: {frozen.v1_baseline_p95_ms} ms (closed load test, as of {frozen.v1_baseline_as_of})

Released under MIT. Current version: 2.3.1 (not a measurement — stays literal).
```

## 2. The Extractor (`tools/doc_stats.py`)

The ONLY writer of `docs/stats.json`. Reads real artifacts; frozen
point-in-time results of closed measurements are pinned here — one audited
place — with provenance and as-of dates, and migrate out when live sources
appear.

```python
#!/usr/bin/env python3
"""Extract the measured numbers docs cite -> docs/stats.json.

docs/README.template.md carries {metric.key} placeholders; tools/render_docs.py
substitutes at build and FAILS on a missing key. This extractor is the only
writer of stats.json — numbers come from measurement artifacts, never typed:

  tests.*, coverage.*   coverage.xml (test run output)
  bench.api.*           bench/results/api_*.json (newest run log)
  ci.last_green_run     ci_ledger.tsv (last PASS row)
  frozen.*              FROZEN results of closed measurements (provenance below)

stats.json is committed (aggregate numbers); the raw run logs stay gitignored.
"""
from __future__ import annotations

import json
import sys
import xml.etree.ElementTree as ET
from datetime import date
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
STATS_PATH = REPO / "docs" / "stats.json"

# Point-in-time results of CLOSED measurement arcs. value/source/as_of only.
# When an artifact-backed source exists, migrate the key out of FROZEN.
FROZEN_METRICS = {
    "frozen.v1_baseline_p95_ms": {
        "value": "212",
        "source": "release-1.0 load test, docs/perf-report-v1.md §Results (arc closed 2026-05-02)",
        "as_of": "2026-05-02",
    },
    "frozen.v1_baseline_as_of": {
        "value": "2026-05-02",
        "source": "release-1.0 load test, docs/perf-report-v1.md §Results",
        "as_of": "2026-05-02",
    },
}


def coverage_metrics(today: str) -> dict:
    """Line coverage and test counts from the coverage/test report."""
    coverage_path = REPO / "coverage.xml"
    root = ET.parse(coverage_path).getroot()
    line_rate = float(root.get("line-rate"))
    tests_total = int(root.get("tests-total"))
    tests_passed = int(root.get("tests-passed"))
    source = f"coverage.xml (test run {root.get('timestamp')})"
    return {
        "coverage.line_pct": {"value": f"{100 * line_rate:.1f}", "source": source, "as_of": today},
        "tests.total": {"value": str(tests_total), "source": source, "as_of": today},
        "tests.passed": {"value": str(tests_passed), "source": source, "as_of": today},
    }


def bench_metrics(today: str) -> dict:
    """p95 latency and sample size from the newest benchmark run log."""
    runs = sorted((REPO / "bench" / "results").glob("api_*.json"))
    if not runs:
        raise SystemExit("FAIL: no bench/results/api_*.json run logs found")
    run_path = runs[-1]
    run = json.loads(run_path.read_text())
    source = f"{run_path.relative_to(REPO)} ({run['n']} requests)"
    return {
        "bench.api.p95_ms": {"value": str(run["p95_ms"]), "source": source, "as_of": today},
        "bench.api.n": {"value": str(run["n"]), "source": source, "as_of": today},
        "bench.api.as_of": {"value": run["date"], "source": source, "as_of": today},
    }


def ci_metrics(today: str) -> dict:
    """Most recent PASS row from the append-only CI ledger."""
    last_green = None
    for line in (REPO / "ci_ledger.tsv").read_text().splitlines():
        fields = line.split("\t")
        if len(fields) >= 2 and fields[1] == "PASS":
            last_green = fields[0]
    if last_green is None:
        raise SystemExit("FAIL: no PASS row in ci_ledger.tsv")
    return {"ci.last_green_run": {
        "value": last_green, "source": "ci_ledger.tsv (last PASS row)", "as_of": today}}


def main() -> None:
    today = date.today().isoformat()
    metrics = dict(FROZEN_METRICS)
    metrics.update(coverage_metrics(today))
    metrics.update(bench_metrics(today))
    metrics.update(ci_metrics(today))

    stats = {"generated_at": today, "metrics": metrics}
    STATS_PATH.write_text(json.dumps(stats, indent=1, ensure_ascii=False) + "\n")
    frozen_n = sum(1 for key in metrics if key in FROZEN_METRICS)
    print(f"wrote {STATS_PATH.relative_to(REPO)}: {len(metrics)} metrics "
          f"({len(metrics) - frozen_n} artifact-derived, {frozen_n} frozen)")
    for key in sorted(metrics):
        print(f"  {key} = {metrics[key]['value']}  [{metrics[key]['as_of']}]")


if __name__ == "__main__":
    main()
```

## 3. The Stats File (`docs/stats.json`)

Committed, reviewable, and regenerated wholesale on every extractor run:

```json
{
 "generated_at": "2026-07-10",
 "metrics": {
  "frozen.v1_baseline_p95_ms": {
   "value": "212",
   "source": "release-1.0 load test, docs/perf-report-v1.md §Results (arc closed 2026-05-02)",
   "as_of": "2026-05-02"
  },
  "coverage.line_pct": {
   "value": "94.2",
   "source": "coverage.xml (test run 2026-07-10T06:12:04Z)",
   "as_of": "2026-07-10"
  },
  "bench.api.p95_ms": {
   "value": "187",
   "source": "bench/results/api_2026-07-08.json (500 requests)",
   "as_of": "2026-07-10"
  },
  "ci.last_green_run": {
   "value": "1841",
   "source": "ci_ledger.tsv (last PASS row)",
   "as_of": "2026-07-10"
  }
 }
}
```

## 4. The Renderer (`tools/render_docs.py`)

Substitutes at build time and hard-fails on any missing key. No default
value, no warn-and-continue:

```python
#!/usr/bin/env python3
"""Render docs/README.template.md -> README.md from docs/stats.json.

{metric.key} placeholders resolve from stats.json (tools/doc_stats.py).
A missing key is a BUILD ERROR — stale numbers must fail loudly, not render.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PLACEHOLDER = re.compile(r"\{([a-z0-9_]+(?:\.[a-z0-9_]+)+)\}")


def main() -> None:
    stats = json.loads((REPO / "docs" / "stats.json").read_text())
    metrics = dict(stats["metrics"])
    metrics["meta.generated_at"] = {"value": stats["generated_at"]}

    def substitute(match: re.Match) -> str:
        metric_key = match.group(1)
        if metric_key not in metrics:
            sys.exit(f"FAIL: stats.json is missing metric '{metric_key}' "
                     f"— rerun: python3 tools/doc_stats.py")
        return metrics[metric_key]["value"]

    template_text = (REPO / "docs" / "README.template.md").read_text()
    rendered = PLACEHOLDER.sub(substitute, template_text)

    leftover = PLACEHOLDER.search(rendered)
    if leftover:  # a substituted value re-introduced placeholder syntax
        sys.exit(f"FAIL: unresolved placeholder after render: {leftover.group(0)}")

    (REPO / "README.md").write_text(rendered)
    print(f"rendered README.md from {len(metrics)} metrics "
          f"(as of {stats['generated_at']})")


if __name__ == "__main__":
    main()
```

The replacement goes through a *function*, so values containing `\` or
other regex-special characters are inserted literally.

## 5. The R Renderer Variant

The same guard where the renderer is R (generalized from the originating
`build_cards.R`; the loop resolves template lines held in a JSON registry):

```r
suppressPackageStartupMessages(library(jsonlite))

stats <- fromJSON("docs/stats.json", simplifyVector = FALSE)

resolve_measured_line <- function(template_text) {
  placeholders <- regmatches(template_text,
                             gregexpr("\\{[a-z0-9_]+(\\.[a-z0-9_]+)+\\}", template_text))[[1]]
  for (placeholder in placeholders) {
    metric_key <- gsub("[{}]", "", placeholder)
    metric <- stats$metrics[[metric_key]]
    if (is.null(metric)) {
      stop("stats.json is missing metric '", metric_key,
           "' — rerun: python3 tools/doc_stats.py", call. = FALSE)
    }
    template_text <- sub(placeholder, as.character(metric$value),
                         template_text, fixed = TRUE)
  }
  template_text
}

# In the render loop: resolve every templated line, stamp the as-of date
# from the stats file — never from prose, never typed.
spec$measured <- lapply(spec$measured, resolve_measured_line)
spec$notes_asof <- substr(stats$generated_at, 1, 10)
```

`fixed = TRUE` keeps the substitution literal in both directions — the
placeholder is matched as-is and the value cannot inject regex syntax.

## 6. The `stopifnot`-Guarded Figure (`R/figures/latency_trend.R`)

Figures re-read their sources at render time and guard every displayed
value. Both guard styles — derivation and provenance — shown:

```r
#!/usr/bin/env Rscript
# latency_trend.R — p95 latency across benchmark runs.
# Every number is read from a file at render time:
#   (a) bench/results/api_*.json  -- run logs (p95, n, date per run)
#   (b) docs/perf-report-v1.md    -- v1.0 baseline citation (provenance-guarded)

suppressPackageStartupMessages({
  library(ggplot2)
  library(jsonlite)
})

run_paths <- sort(Sys.glob("bench/results/api_*.json"))
stopifnot(length(run_paths) >= 2)  # a trend needs at least two runs

runs <- do.call(rbind, lapply(run_paths, function(run_path) {
  run <- fromJSON(run_path)
  data.frame(date = as.Date(run$date), p95_ms = run$p95_ms, n = run$n)
}))

# Derivation guard: the invariants the figure's message depends on.
stopifnot(
  is.numeric(runs$p95_ms), all(runs$p95_ms > 0),
  all(runs$n >= 100)                # the caption claims n >= 100 per run
)

# Provenance guard: the caption cites the v1.0 baseline, which lives in a
# closed report, not in the run logs. Assert the source still backs it, so
# the caption never states a number the source stopped carrying.
report_text <- paste(readLines("docs/perf-report-v1.md", warn = FALSE),
                     collapse = "\n")
stopifnot(grepl("p95 212 ms", report_text, fixed = TRUE))

latest <- runs[which.max(runs$date), ]
caption_text <- sprintf(
  "sources: %d run logs under bench/results/ (n >= 100 each) · v1.0 baseline: docs/perf-report-v1.md · rendered %s",
  nrow(runs), format(Sys.Date(), "%Y-%m-%d"))

trend_plot <- ggplot(runs, aes(date, p95_ms)) +
  geom_line() +
  geom_point() +
  geom_hline(yintercept = 212, linetype = "22") +  # backed by the guard above
  annotate("text", x = latest$date, y = latest$p95_ms,
           label = sprintf("p95 = %.0f ms (n = %d)", latest$p95_ms, latest$n),
           hjust = 1, vjust = -0.8) +
  labs(title = "API p95 latency by benchmark run",
       caption = caption_text, x = NULL, y = "p95 (ms)")

ggsave("docs/figures/latency_trend.png", trend_plot,
       width = 8, height = 4.5, dpi = 150)
cat("wrote docs/figures/latency_trend.png\n")
```

Note the one apparent literal — `yintercept = 212` — is backed by the
provenance guard directly above it: if the closed report stops saying
`p95 212 ms`, the build fails and the literal must be revisited. Prefer
routing such values through the extractor's FROZEN block and reading
`stats.json`; use the in-script provenance guard when a figure script
should stay dependency-free.

## 7. Build Wiring (`Makefile`)

```makefile
.PHONY: docs
docs:
	python3 tools/doc_stats.py
	python3 tools/render_docs.py
	Rscript R/figures/latency_trend.R
```

CI renders docs on every push; because the renderer hard-fails, a template
referencing a retired metric breaks the pipeline instead of shipping a
stale README.

## 8. The Two Proofs

Proof 1 — a bogus key fails the build:

```bash
printf '\n- bogus: {does.not_exist}\n' >> docs/README.template.md
python3 tools/render_docs.py; echo "exit=$?"
# FAIL: stats.json is missing metric 'does.not_exist' — rerun: python3 tools/doc_stats.py
# exit=1
git checkout -- docs/README.template.md
```

Proof 2 — a live source refresh propagates with zero manual edits. A new
benchmark run lands as `bench/results/api_2026-07-10.json` with `"n": 2000`
(the previous run had `"n": 500`):

```bash
python3 tools/doc_stats.py && python3 tools/render_docs.py
git diff --stat
#  docs/stats.json | 14 +++++++-------
#  README.md       |  4 ++--
```

The README now reads `n=2000` and the new p95, with a fresh as-of date —
no file other than generated output changed. In the originating pipeline
the same proof auto-updated a rendered card from `n=70` to `n=200` while
the measurement was still running.
