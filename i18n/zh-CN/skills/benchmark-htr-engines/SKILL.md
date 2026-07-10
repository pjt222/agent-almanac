---
name: benchmark-htr-engines
description: >
  Select an OCR/HTR engine by benchmarking candidates on the same labelled
  samples — source ground truth from open datasets (e.g. Hugging Face PAGE-XML
  corpora) or hand-transcription, wrap every engine behind a
  transcribe(image_path) -> str adapter (vision-LLMs via any OpenAI-compatible
  endpoint, dedicated HTR REST APIs, cloud OCR), and score with zero-dependency
  raw CER, lenient CER, WER, and a critical name/date token diff. Use when
  choosing an engine for handwriting or historical-document transcription,
  when published accuracy claims need honest verification on your own
  material, or when a records workflow must surface confident-but-wrong names
  and dates that a low aggregate CER hides.
license: MIT
allowed-tools: Bash Read Write Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: ocr
  complexity: advanced
  language: Python
  tags: ocr, htr, benchmarking, cer, transcription, vision-llm
  locale: zh-CN
  source_locale: en
  source_commit: 3b0afd0b
  translator: "Claude + human review"
  translation_date: "2026-07-10"
---

# Benchmark HTR Engines

Choose a handwritten-text-recognition (HTR) or OCR engine with evidence instead
of vendor claims: run every candidate over the same labelled samples and compare
raw CER, lenient CER, WER, and — the decisive signal for records work — a
critical name/date token diff. The harness is deliberately self-contained:
scoring implements edit distance directly (no third-party dependency), and a
fully mocked self-test validates the math with no API key and no network.

## When to Use

- Selecting between vision-LLMs, dedicated HTR services (Transkribus-style REST
  APIs), and cloud OCR for a handwriting or historical-document task
- Verifying published or vendor accuracy claims on your own material — script,
  language, ink, and layout rarely match the benchmark corpus behind the claim
- Working with genealogy, archival, or register material where a fluent
  transcription containing one wrong name or year is the real failure mode
- Re-ranking engines after new models ship, against a frozen sample set
- Any comparison where transcription conventions (line-break hyphenation, case,
  ß/ss) would otherwise pollute the accuracy signal

## Inputs

- **Required**: 10–20 labelled samples — image + ground-truth text pairs
  spanning easy to hard material (or an open dataset to pull them from, Step 2)
- **Required**: Two or more candidate engines (model ids or service endpoints)
- **Optional**: API keys per engine family (e.g. `LLM_API_KEY`, HTR service
  credentials) — the scoring self-test needs none
- **Optional**: Critical-token rules (default: any token containing a digit,
  month names including archaic forms, Capitalised words)
- **Optional**: Lenient-CER folds (default: line-break hyphenation, whitespace,
  case, ß→ss; adjust per language and script)

## Procedure

### Step 1: Lay Out the Sample Corpus

Use a flat directory of image + ground-truth pairs sharing a stem. This layout
is the whole data contract — every engine and the scorer read only this.

```text
samples/
  register_p034.jpg      # the page or line image (.jpg .jpeg .png .tif .tiff .webp)
  register_p034.gt.txt   # its ground-truth transcription (UTF-8)
```

Guidelines:

- 10–20 line crops or a few full pages are enough to separate engines; spread
  them easy → hard (clean vs. faded ink, marginalia, mixed hands).
- Line-level crops score more cleanly on a first pass; full pages also work —
  vision-LLMs read them whole, HTR services run their own line detection.
- If the material is private (church, court, medical records), gitignore
  `samples/` immediately, before the first commit.

**Expected:** Every image in `samples/` has a same-stem `.gt.txt`; private
material is covered by a `.gitignore` rule from the start.

**On failure:** Orphan images (no `.gt.txt`) are skipped by the runner — either
transcribe them or remove them. If private samples were already committed,
rewriting history is required; prevention (gitignore first) is far cheaper.

### Step 2: Source Ground Truth

Two routes; both end in the Step 1 layout.

**Route A — open dataset.** Pull a handful of labelled rows from a public
corpus matching your script, e.g. Hugging Face `dh-unibe/image-text_kurrent-xix`
(19th-century German Kurrent, MIT licence, DOI 10.57967/hf/8590). Each row is
an image plus PAGE XML; parse the plain text out of the XML. Stream — never
download the full corpus:

```python
from pathlib import Path
from datasets import load_dataset  # pip install datasets

dataset = load_dataset("dh-unibe/image-text_kurrent-xix",
                       split="train", streaming=True)
written = 0
for row in dataset:
    if written >= 12:
        break
    ground_truth = plain_text_from_page_xml(row["xml_content"]).strip()
    if not (10 <= len(ground_truth) <= 600):
        continue  # skip near-empty rows and multi-column monsters
    Path(f"samples/{written:02d}_kurrent.png").write_bytes(row["image"]["bytes"])
    Path(f"samples/{written:02d}_kurrent.gt.txt").write_text(
        ground_truth, encoding="utf-8")
    written += 1
```

The PAGE-XML parser must prefer each `TextLine`'s line-level
`TextEquiv/Unicode` and only fall back to joining `<Word>` children — see
[references/EXAMPLES.md](references/EXAMPLES.md) for a correct implementation.

**Route B — hand-transcribe.** Transcribe a few target pages yourself.
Transcribe the original (old) spelling faithfully — do not modernise — so CER
measures the engine, not your edits. This is a labelling task; see
[label-training-data](../label-training-data/SKILL.md) for conventions.

**Expected:** Sample pairs on disk; ground truth preserves original spelling
and line breaks. Dataset attribution recorded if results will be published.

**On failure:** If streaming fails, check the `datasets` version and network;
reduce `--scan-limit`-style row scanning rather than downloading the corpus.
If parsed ground truth contains only the first word of each line, your PAGE
parser hit the word-segmentation trap (see Common Pitfalls). A near-genre
dataset (line crops, related script) is a valid accuracy signal but not a
genre-exact one — note the caveat in the report.

### Step 3: Define the Engine Adapter Interface

Every engine hides behind one method, so the runner and scorer never know
which family they are talking to:

```python
from abc import ABC, abstractmethod

class TranscriptionEngine(ABC):
    """Common interface: given an image file, return the transcribed text."""

    name: str = "engine"  # e.g. "llm:vendor/model-pro", "htr:51170"

    @abstractmethod
    def transcribe(self, image_path: str) -> str:
        """Return the plain-text transcription of the image at image_path."""
        raise NotImplementedError
```

Three adapter families cover the practical field:

| Family | Transport | Notes |
|---|---|---|
| Vision-LLM | Any OpenAI-compatible chat endpoint (OpenRouter, vendor APIs) | One code path covers many models; swap the model id |
| Dedicated HTR | REST: authenticate → submit → poll → fetch PAGE XML | Asynchronous jobs; result needs XML → text extraction |
| Cloud OCR | Vendor SDK or REST call | Usually synchronous; concatenate returned text blocks |

**Expected:** A `base.py` with the ABC; each candidate engine is a subclass
with a distinct `name` used in reports and prediction filenames.

**On failure:** If an engine cannot fit `transcribe(image_path) -> str`
(e.g. it returns only word boxes), do the flattening inside the adapter —
never let format differences leak into the scorer.

### Step 4: Implement Adapters with Retry-on-Empty

For the vision-LLM family, send the image as a base64 data URI with a
hallucination-suppressing prompt (transcribe only what is legible, mark
unreadable spans `[...]`, never invent names or dates), `temperature=0`, and a
generous `max_tokens`. Then guard the known transient failure:

```python
# Reasoning models intermittently return EMPTY content with
# finish_reason="stop" — reasoning tokens consumed, no text emitted.
# Without a retry, one transient empty scores as 100% CER and poisons
# that engine's mean.
last_finish_reason = None
for _attempt in range(self.max_retries):  # e.g. 3
    response = self.client.chat.completions.create(
        model=self.model,
        temperature=0,                       # minimise fabrication
        max_tokens=self.max_output_tokens,   # headroom: reasoning + full page
        messages=messages,
    )
    choice = response.choices[0]
    text = (choice.message.content or "").strip()
    if text:
        return text
    last_finish_reason = choice.finish_reason
raise RuntimeError(
    f"empty content after {self.max_retries} attempts "
    f"(last finish_reason={last_finish_reason})")
```

For dedicated HTR REST services, the adapter wraps an asynchronous job:
authenticate, POST the image (raw base64), poll the process id until
`FINISHED`/`FAILED`/timeout, fetch the PAGE XML result, and extract plain text.
Full templates for both families are in
[references/EXAMPLES.md](references/EXAMPLES.md).

**Expected:** Each adapter returns non-empty text for a legible test image, or
raises with a diagnostic (not an empty string). Config errors (missing keys)
raise at construction time with the variable names spelled out.

**On failure:** Empty after all retries — raise `max_tokens` (reasoning tokens
compete with output tokens) before blaming the model. HTTP 401 mid-poll —
re-authenticate once and retry rather than abandoning a submitted (paid) job.
429/5xx — retry with capped exponential backoff.

### Step 5: Implement Zero-Dependency Scoring

Implement Levenshtein distance directly (two-row dynamic programming, ~15
lines) so scoring runs anywhere with no install. Derive four metrics:

- **Raw CER** — character edit distance / reference length. Honest but inflated
  by convention differences.
- **Lenient CER** — CER after folding transcription conventions, so it reflects
  recognition, not orthography:

```python
def normalize_for_lenient_cer(text: str) -> str:
    normalized = unicodedata.normalize("NFC", text)
    normalized = LINEBREAK_HYPHEN.sub("", normalized)  # join hyphenated breaks
    normalized = WHITESPACE.sub(" ", normalized)       # layout != recognition
    normalized = normalized.lower()                    # case != recognition
    normalized = normalized.replace("ß", "ss")         # script-specific folds
    return normalized.strip()
```

  Keep it deliberately conservative — over-normalising hides real errors.
  Report lenient CER as a secondary metric next to raw CER, never instead.
- **WER** — the same edit distance over whitespace-split words.
- **Critical name/date token diff** — a word-level diff
  (`difflib.SequenceMatcher`) where each edit is flagged if it touches a
  critical token:

```python
def is_critical_token(token: str) -> bool:
    stripped = token.strip(".,;:()[]{}\"'-")
    if not stripped:
        return False
    if any(ch.isdigit() for ch in stripped):   # dates, years, ages
        return True
    if stripped.lower() in MONTH_NAMES:        # incl. archaic forms like "7ber"
        return True
    # Capitalised word -> likely proper noun (over-flags German common
    # nouns by design: safer to surface too much for human review)
    return stripped[0].isalpha() and stripped[0].isupper() \
        and stripped[1:] == stripped[1:].lower()
```

The critical-token count is the records-relevant signal: a confident-wrong
surname or year is invisible inside a good-looking aggregate CER.

**Expected:** A `scoring.py` importing only the standard library, exposing
`character_error_rate`, `lenient_character_error_rate`, `word_error_rate`, and
`critical_token_diff`.

**On failure:** If lenient CER ever exceeds raw CER on the same pair, the
normalizer is corrupting text (check regex ordering: fold hyphenated line
breaks *before* collapsing whitespace). Empty-reference edge cases must return
0.0 for empty-vs-empty and 1.0 for empty-vs-nonempty, not divide by zero.

### Step 6: Validate Scoring with a No-Key Self-Test

Before spending any API budget, assert the math on synthetic tokens
(all names/dates below are invented):

```python
assert character_error_rate("Haus", "Hans") == 0.25       # 1 edit / 4 chars
assert word_error_rate("geboren den 12 Merz 1834",
                       "geboren den 12 Merz 1835") == 0.2  # 1 word of 5
# Convention folds to zero...
assert lenient_character_error_rate("Ver¬\nzeichnis", "Ver-\nzeichnis") == 0.0
assert lenient_character_error_rate("Grüßner", "Grüssner") == 0.0
# ...but a genuine name misread survives lenient folding
assert lenient_character_error_rate("Beispielmann", "Beispelmann") > 0.0
edits = critical_token_diff(
    "getauft den 12 Merz 1834 Georg Beispielmann",
    "getauft den 12 Merz 1835 Georg Beispelmann")
assert sum(1 for e in edits if e.touches_critical) == 2   # year AND surname
print("scoring self-test: PASS")
```

Wire it into the runner as `--selftest` so it is always one flag away. If an
adapter has network seams (the REST family), mock them in the self-test too —
the full template in [references/EXAMPLES.md](references/EXAMPLES.md) runs
without `requests` even installed.

**Expected:** `python3 run_benchmark.py --selftest` prints `PASS` with no API
key, no network, and no third-party package.

**On failure:** A failing assertion is a scoring bug — fix it before running
engines, or every downstream comparison is untrustworthy. Never weaken an
assertion to make it pass; re-derive the expected value by hand first.

### Step 7: Run the Panel and Report

Run all candidate engines over all samples in one invocation. Per engine ×
sample: score, print the per-sample line plus only the critical edits, and save
the raw prediction (re-scoring later must not require re-paying for API calls).
Keep one engine's failure from killing the panel — catch per-sample errors,
count them, continue.

```text
  07_kurrent.png   CER=6.2%  lenient-CER=3.1%  WER=11.0%  name/date-errors=1
      !! NAME/DATE [replace] gt: '1834' -> pred: '1835'
      (+ 2 minor non-critical edit(s))

===== COMPARISON (sorted by lenient CER, lower is better) =====
  engine                          CER  lenient  name/date     ok
  llm:vendor/model-pro           7.9%     4.1%          3  12/12
  htr:rest-model-51170          11.2%     6.0%          5  12/12
  llm:vendor/model-flash        13.5%     9.8%         14  11/12
```

Persist everything: the full console report (e.g. `reports/last_run.txt`) and
one `reports/<sample>.<engine>.pred.txt` per prediction.

**Expected:** A comparison table sorted by lenient CER; per-sample critical
diffs; raw predictions on disk for every successful engine × sample pair.

**On failure:** An engine erroring on every sample is a config problem (key,
model id, endpoint) — its constructor should have said so; check the first
error message, not the aggregate. If two engines tie on lenient CER, rank by
critical-token count next.

### Step 8: Interpret and Decide

Read the table in this priority order:

1. **Critical name/date errors** — the failure that corrupts records; a fluent
   engine with more name errors loses to a rougher one with fewer.
2. **Lenient CER** — recognition quality with convention noise removed.
3. **Raw CER / WER** — tie-breakers and sanity checks (a large raw-vs-lenient
   gap means convention differences, not recognition differences).

Then weigh the non-accuracy dimensions — cost per page, privacy (does the image
leave your infrastructure?), throughput, and licensing — covered in the
companion guide
[choosing-an-htr-ocr-engine](../../guides/choosing-an-htr-ocr-engine.md).

**Expected:** A documented engine choice citing the table, the critical-token
counts, and the non-accuracy constraints that applied.

**On failure:** If no engine is acceptable (critical errors on most samples),
re-scope: better images (higher DPI, line crops), a fine-tuned model for the
script, or human transcription with engine assist rather than engine-first.

## Validation

- [ ] Every image in `samples/` has a same-stem `.gt.txt` (no orphans scored)
- [ ] `run_benchmark.py --selftest` passes with no API key, network, or
      third-party install
- [ ] Every LLM adapter retries on empty content before raising
- [ ] Report shows raw CER, lenient CER, WER, and critical name/date count per
      engine
- [ ] Comparison table is sorted by lenient CER and states samples-ok per engine
- [ ] Raw predictions saved to disk for every successful engine × sample
- [ ] Private sample text appears nowhere outside `samples/` (gitignored);
      docs and tests use invented tokens only
- [ ] Dataset licence and attribution recorded if results will be published

## Common Pitfalls

- **Trusting aggregate CER**: A 4% CER engine that swaps one surname per page
  is worse for records work than an 8% engine that gets names right. Always
  read the critical-token diff before the means.
- **Over-normalising lenient CER**: Folding too much (punctuation, diacritics,
  word order) hides real recognition errors. Fold only documented transcription
  conventions, and always report raw CER alongside.
- **Empty LLM responses scored as 100% CER**: Reasoning models intermittently
  return empty content with `finish_reason=stop`. Without retry-on-empty, one
  transient blip destroys that engine's mean and your ranking.
- **PAGE-XML first-word trap**: Word-segmented PAGE XML serializes `<Word>`
  children before the line-level `<TextEquiv>`; a naive pre-order `iter()` walk
  returns only the first word of every line — ground truth silently truncates
  and every engine looks terrible. Prefer the line-level `TextEquiv`.
- **Modernised ground truth**: "Correcting" old spelling in the ground truth
  charges every engine for errors it did not make. Transcribe faithfully;
  handle convention differences in the lenient normalizer instead.
- **Committing private samples**: Church, court, or family records must be
  gitignored before the first commit, and never pasted into prompts, tests,
  or documentation — use invented tokens (e.g. `Beispielmann, Georg *1834`).
- **One-sample verdicts**: A single easy sample cannot separate engines.
  Use 10–20 samples spanning difficulty, and report per-sample rows so one
  outlier is visible instead of buried in a mean.

## Related Skills

- [label-training-data](../label-training-data/SKILL.md) - hand-transcribing
  ground truth is a labelling task; reuse its conventions and QA loop
- [run-ab-test-models](../run-ab-test-models/SKILL.md) - statistical comparison
  when two shortlisted engines are close and the sample budget can grow
- [manage-token-budget](../manage-token-budget/SKILL.md) - controlling
  vision-LLM spend when the panel or sample set grows
- [choosing-an-htr-ocr-engine](../../guides/choosing-an-htr-ocr-engine.md) -
  companion guide: the engine landscape, cost, privacy, and decision criteria
  this benchmark feeds

See [references/EXAMPLES.md](references/EXAMPLES.md) for the complete
generalized harness template (scoring, adapters, runner, self-test, dataset
fetcher).

<!-- Keep under 500 lines. Extract large examples to references/EXAMPLES.md if needed. -->
