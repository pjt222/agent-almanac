# Benchmark Harness Template

A complete, self-contained scoring harness generalized from a working
church-register (German Kurrent) benchmark. Scoring imports only the Python
standard library; engine adapters lazy-import their dependencies so the
self-test and any single engine family run without installing the others.

All names, dates, and transcription fragments in this file are **invented**
examples (`Georg Beispielmann`, `1834`, ...) — replace them with your own
synthetic tokens, never with real record content.

## Directory Layout

```text
benchmark/
  run_benchmark.py        # panel runner + comparison table
  scoring.py              # CER / WER / lenient CER / critical-token diff
  selftest.py             # validates scoring with no key, no network
  fetch_samples.py        # optional: pull labelled rows from an open dataset
  engines/
    __init__.py
    base.py               # the transcribe(image_path) -> str interface
    openai_compatible.py  # vision-LLM family (any OpenAI-compatible endpoint)
    rest_htr.py           # dedicated-HTR REST family (submit -> poll -> PAGE XML)
  reports/                # created on first run; predictions + last_run.txt
samples/                  # <stem>.<img> + <stem>.gt.txt; gitignore if private
```

## scoring.py

```python
"""Transcription scoring: CER / WER + a critical-token (name/date) diff.

No third-party dependency — edit distance is implemented directly, so this
module and selftest.py validate the scoring math without any install or key.

The headline signal for choosing an engine is NOT aggregate CER but the
critical-token diff: a confident-wrong "Beispelmann" for "Beispielmann" is
the failure that matters for records work, and it can hide behind a low CER.
"""
from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from difflib import SequenceMatcher


def _edit_distance(reference_symbols, hypothesis_symbols) -> int:
    """Levenshtein distance between two sequences (characters or words)."""
    previous_row = list(range(len(hypothesis_symbols) + 1))
    for reference_index, reference_symbol in enumerate(reference_symbols, start=1):
        current_row = [reference_index]
        for hypothesis_index, hypothesis_symbol in enumerate(
            hypothesis_symbols, start=1
        ):
            insertion_cost = current_row[hypothesis_index - 1] + 1
            deletion_cost = previous_row[hypothesis_index] + 1
            substitution_cost = previous_row[hypothesis_index - 1] + (
                reference_symbol != hypothesis_symbol
            )
            current_row.append(min(insertion_cost, deletion_cost, substitution_cost))
        previous_row = current_row
    return previous_row[-1]


def character_error_rate(reference_text: str, hypothesis_text: str) -> float:
    """Character edit distance divided by reference length."""
    reference = reference_text.strip()
    hypothesis = hypothesis_text.strip()
    if not reference:
        return 0.0 if not hypothesis else 1.0
    return _edit_distance(reference, hypothesis) / len(reference)


def word_error_rate(reference_text: str, hypothesis_text: str) -> float:
    """Word edit distance divided by reference word count."""
    reference_words = reference_text.split()
    hypothesis_words = hypothesis_text.split()
    if not reference_words:
        return 0.0 if not hypothesis_words else 1.0
    return _edit_distance(reference_words, hypothesis_words) / len(reference_words)


# --- Lenient normalization: fold CONVENTION so CER reflects RECOGNITION ---
# Line-break hyphen characters: soft hyphen (¬), equals sign (the historically
# correct Kurrent double-hyphen), normal and long dash. Adjust per script.
_LINEBREAK_HYPHEN = re.compile(r"[¬=\-–]\s*\n\s*")
_WHITESPACE = re.compile(r"\s+")


def normalize_for_lenient_cer(text: str) -> str:
    """Deliberately conservative — over-normalising would hide real errors,
    so lenient CER is reported only as a SECONDARY metric alongside raw CER.

    Folds: line-break hyphenation, all whitespace/layout, letter case, and
    script-specific equivalences (here: ß vs ss). It does NOT remove
    marginalia the ground truth omits — that inflates every engine equally,
    so the relative ranking stays fair.
    """
    normalized = unicodedata.normalize("NFC", text)
    normalized = _LINEBREAK_HYPHEN.sub("", normalized)  # join hyphenated breaks
    normalized = normalized.replace("¬", "")            # any stray soft hyphen
    normalized = _WHITESPACE.sub(" ", normalized)       # collapse whitespace
    normalized = normalized.lower().replace("ß", "ss")  # case + script folds
    return normalized.strip()


def lenient_character_error_rate(reference_text: str, hypothesis_text: str) -> float:
    """CER after normalize_for_lenient_cer — recognition minus convention."""
    return character_error_rate(
        normalize_for_lenient_cer(reference_text),
        normalize_for_lenient_cer(hypothesis_text),
    )


# --- Critical-token detection: names and dates -----------------------------
# Domain configuration — this set suits German church registers (archaic
# month forms: 7ber = September, 8ber = Oktober, 9ber = November, Xber =
# Dezember, Hornung = Februar). Replace with the month/keyword set of YOUR
# material's language and era.
MONTH_NAMES = {
    "januar", "jänner", "februar", "hornung", "märz", "maerz", "april", "mai",
    "juni", "juli", "august", "september", "oktober", "november", "dezember",
    "7ber", "8ber", "9ber", "xber", "10ber", "7bris", "8bris", "9bris", "xbris",
}


def is_critical_token(token: str) -> bool:
    """True for tokens whose mis-transcription corrupts record facts.

    Flags: any token containing a digit (dates, ages, years), month names,
    and Capitalised words (likely proper nouns — names and places).

    Caveat: languages that capitalise all nouns (German) over-flag common
    nouns too. That is deliberate — for engine selection it is safer to
    over-surface a possible name/date change for human review than miss one.
    """
    stripped = token.strip(".,;:()[]{}\"'«»„“”-–—")
    if not stripped:
        return False
    if any(character.isdigit() for character in stripped):
        return True
    if stripped.lower() in MONTH_NAMES:
        return True
    first_character = stripped[0]
    if first_character.isalpha() and first_character == first_character.upper():
        # Capitalised, but not ALL-CAPS (more likely a header token).
        if stripped[1:] == stripped[1:].lower():
            return True
    return False


@dataclass
class TokenEdit:
    """One word-level change between ground truth and prediction."""

    operation: str          # 'replace' | 'delete' | 'insert'
    reference_tokens: list  # words in the ground truth
    hypothesis_tokens: list  # words in the prediction
    touches_critical: bool  # does this edit change a name/date token?


def critical_token_diff(reference_text: str, hypothesis_text: str) -> list:
    """Word-level diff, flagging edits that touch critical (name/date) tokens."""
    reference_words = reference_text.split()
    hypothesis_words = hypothesis_text.split()
    matcher = SequenceMatcher(a=reference_words, b=hypothesis_words, autojunk=False)
    edits = []
    for operation, ref_start, ref_end, hyp_start, hyp_end in matcher.get_opcodes():
        if operation == "equal":
            continue
        reference_slice = reference_words[ref_start:ref_end]
        hypothesis_slice = hypothesis_words[hyp_start:hyp_end]
        touches_critical = any(
            is_critical_token(token)
            for token in reference_slice + hypothesis_slice
        )
        edits.append(
            TokenEdit(operation, reference_slice, hypothesis_slice, touches_critical)
        )
    return edits
```

## engines/base.py

```python
"""Engine adapter interface for the benchmark."""
from __future__ import annotations

from abc import ABC, abstractmethod


class TranscriptionEngine(ABC):
    """Common interface: given an image file, return the transcribed text."""

    name: str = "engine"

    @abstractmethod
    def transcribe(self, image_path: str) -> str:
        """Return the plain-text transcription of the image at image_path."""
        raise NotImplementedError
```

## engines/openai_compatible.py — vision-LLM family

One code path covers every model reachable through an OpenAI-compatible chat
endpoint (OpenRouter, vendor APIs) — swap the model id. The prompt is tuned to
SUPPRESS hallucination, the main risk of the LLM route.

```python
"""Vision-LLM transcription via any OpenAI-compatible endpoint."""
from __future__ import annotations

import base64
import mimetypes
import os

from .base import TranscriptionEngine

DEFAULT_TRANSCRIPTION_PROMPT = (
    "You are an expert transcriber of historical handwritten documents. "
    "Transcribe the handwriting EXACTLY as written, preserving the original "
    "(old) spelling and the original line breaks. Do NOT translate, "
    "modernise, normalise, or guess. If a word or character is illegible, "
    "write [...] instead of inventing a plausible name, date, or word. "
    "Output only the transcription text and nothing else."
)


class OpenAICompatibleEngine(TranscriptionEngine):
    def __init__(self, model, api_key=None, base_url=None, prompt=None):
        # Lazy import: other engine families run without the openai package.
        from openai import OpenAI

        resolved_api_key = api_key or os.environ.get("LLM_API_KEY")
        if not resolved_api_key:
            raise RuntimeError("LLM_API_KEY not set (see .env.example)")
        resolved_base_url = base_url or os.environ.get(
            "LLM_BASE_URL", "https://openrouter.ai/api/v1"
        )
        self.model = model
        self.name = f"llm:{model}"
        self.transcription_prompt = prompt or DEFAULT_TRANSCRIPTION_PROMPT
        # Headroom for reasoning tokens + a full-page transcription.
        self.max_output_tokens = int(os.environ.get("LLM_MAX_TOKENS", "8000"))
        self.max_retries = int(os.environ.get("LLM_MAX_RETRIES", "3"))
        self.client = OpenAI(api_key=resolved_api_key, base_url=resolved_base_url)

    def transcribe(self, image_path: str) -> str:
        image_data_uri = _encode_image_as_data_uri(image_path)
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": self.transcription_prompt},
                    {"type": "image_url", "image_url": {"url": image_data_uri}},
                ],
            }
        ]
        # Reasoning models intermittently return EMPTY content with
        # finish_reason="stop" — reasoning tokens consumed, no text.
        # Retry so a transient empty doesn't score as 100% CER.
        last_finish_reason = None
        for _attempt in range(self.max_retries):
            response = self.client.chat.completions.create(
                model=self.model,
                temperature=0,  # minimise fabrication
                max_tokens=self.max_output_tokens,
                messages=messages,
            )
            choice = response.choices[0]
            text = (choice.message.content or "").strip()
            if text:
                return text
            last_finish_reason = choice.finish_reason
        raise RuntimeError(
            f"empty content after {self.max_retries} attempts "
            f"(last finish_reason={last_finish_reason})"
        )


def _encode_image_as_data_uri(image_path: str) -> str:
    mime_type = mimetypes.guess_type(image_path)[0] or "image/jpeg"
    with open(image_path, "rb") as image_file:
        encoded_bytes = base64.b64encode(image_file.read()).decode("ascii")
    return f"data:{mime_type};base64,{encoded_bytes}"
```

## engines/rest_htr.py — dedicated-HTR REST family

Skeleton for asynchronous HTR services (Transkribus-style processing APIs):
authenticate → submit → poll → fetch PAGE XML → extract plain text. Fill in
the real endpoints, auth flow, and request schema of your service. Production
hardening worth adding: OAuth token caching with refresh, one re-auth retry on
a mid-poll 401, and capped exponential backoff on 429/5xx — never abandon an
already-submitted (paid) job on the first transient blip.

```python
"""Generic dedicated-HTR REST adapter: submit -> poll -> fetch PAGE XML."""
from __future__ import annotations

import base64
import os
import time
import xml.etree.ElementTree as ElementTree

from .base import TranscriptionEngine


class RestHTREngine(TranscriptionEngine):
    POLL_INTERVAL_SECONDS = 3.0
    POLL_TIMEOUT_SECONDS = 600.0
    HTTP_TIMEOUT_SECONDS = 60.0

    def __init__(self):
        self.base_url = os.environ.get("HTR_BASE_URL")
        self.access_token = os.environ.get("HTR_ACCESS_TOKEN")
        model_id_raw = os.environ.get("HTR_MODEL_ID")
        missing = [
            name
            for name, value in (
                ("HTR_BASE_URL", self.base_url),
                ("HTR_ACCESS_TOKEN", self.access_token),
                ("HTR_MODEL_ID", model_id_raw),
            )
            if not value
        ]
        if missing:
            raise RuntimeError(
                "HTR arm not configured — missing: " + ", ".join(missing)
            )
        self.model_id = int(model_id_raw)
        self.name = f"htr:{self.model_id}"

    def _headers(self) -> dict:
        return {"Authorization": f"Bearer {self.access_token}"}

    def transcribe(self, image_path: str) -> str:
        import requests  # lazy: other families run without it

        with open(image_path, "rb") as image_file:
            encoded = base64.b64encode(image_file.read()).decode("ascii")

        # 1. Submit the job (raw base64, no data: prefix — check your API).
        submit = requests.post(
            f"{self.base_url}/processes",
            json={
                "config": {"textRecognition": {"htrId": self.model_id}},
                "image": {"base64": encoded},
            },
            headers=self._headers(),
            timeout=self.HTTP_TIMEOUT_SECONDS,
        )
        submit.raise_for_status()
        process_id = submit.json()["processId"]

        # 2. Poll until FINISHED / FAILED / timeout.
        deadline = time.monotonic() + self.POLL_TIMEOUT_SECONDS
        while True:
            status = requests.get(
                f"{self.base_url}/processes/{process_id}",
                headers=self._headers(),
                timeout=self.HTTP_TIMEOUT_SECONDS,
            )
            status.raise_for_status()
            state = status.json().get("status")
            if state == "FINISHED":
                break
            if state == "FAILED":
                # Surface the payload — it carries the failure reason.
                raise RuntimeError(
                    f"process {process_id} FAILED: {status.json()!r}"
                )
            if time.monotonic() >= deadline:
                raise RuntimeError(
                    f"process {process_id} timed out (last status: {state})"
                )
            time.sleep(self.POLL_INTERVAL_SECONDS)

        # 3. Fetch the PAGE XML result and flatten to plain text.
        page = requests.get(
            f"{self.base_url}/processes/{process_id}/page",
            headers=self._headers(),
            timeout=self.HTTP_TIMEOUT_SECONDS,
        )
        page.raise_for_status()
        return plain_text_from_page_xml(page.text)


# --- PAGE XML -> plain text -------------------------------------------------
def _local_tag(element) -> str:
    """Element's local tag name, dropping any ``{namespace}`` prefix."""
    tag = element.tag
    return tag.rsplit("}", 1)[1] if isinstance(tag, str) and "}" in tag else tag


def _text_of_text_line(text_line):
    """Full transcription of one TextLine.

    PREFER the line-level TextEquiv/Unicode: word-segmented PAGE XML
    serializes <Word> children BEFORE the line-level <TextEquiv>, so a naive
    pre-order iter() walk returns only the FIRST WORD of every line. Fall
    back to joining per-<Word> text only when there is no line-level text.
    """
    for child in text_line:
        if _local_tag(child) == "TextEquiv":
            for unicode_node in child:
                if _local_tag(unicode_node) == "Unicode" and unicode_node.text:
                    return unicode_node.text
    word_texts = []
    for child in text_line:
        if _local_tag(child) == "Word":
            for text_equiv in child:
                if _local_tag(text_equiv) == "TextEquiv":
                    for unicode_node in text_equiv:
                        if (
                            _local_tag(unicode_node) == "Unicode"
                            and unicode_node.text
                        ):
                            word_texts.append(unicode_node.text)
    return " ".join(word_texts) if word_texts else None


def plain_text_from_page_xml(page_xml: str) -> str:
    """Extract plain text from PAGE XML, one line per TextLine.

    This compact version emits document order. If your corpus encodes an
    explicit reading order (custom='readingOrder {index:N;}' on TextRegion /
    TextLine), sort siblings by that index at each level — but only when
    EVERY sibling carries one, so partially annotated pages keep their
    original order.
    """
    if not page_xml:
        return ""
    try:
        root = ElementTree.fromstring(page_xml)
    except ElementTree.ParseError:
        return page_xml  # already plain text, or unparseable — return as-is
    lines = []
    for element in root.iter():
        if _local_tag(element) == "TextLine":
            line_text = _text_of_text_line(element)
            if line_text:
                lines.append(line_text)
    return "\n".join(lines)
```

## run_benchmark.py — panel runner

```python
#!/usr/bin/env python3
"""Benchmark transcription engines on labelled samples.

Usage:
    python3 run_benchmark.py --selftest                    # no API, no key
    python3 run_benchmark.py --llm vendor/model-pro
    python3 run_benchmark.py --llm vendor/model-pro --llm vendor/model-flash
    python3 run_benchmark.py --llm vendor/model-pro --htr 51170  # cross-family
"""
from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path

BENCHMARK_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BENCHMARK_DIR))
from scoring import (
    character_error_rate,
    critical_token_diff,
    lenient_character_error_rate,
    word_error_rate,
)

IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp"}
SAMPLES_DIR = BENCHMARK_DIR.parent / "samples"
REPORTS_DIR = BENCHMARK_DIR / "reports"


def discover_samples(samples_dir: Path):
    """Return (image_path, ground_truth_path) pairs sharing a stem."""
    pairs = []
    for image_path in sorted(samples_dir.iterdir()):
        if image_path.suffix.lower() not in IMAGE_SUFFIXES:
            continue
        ground_truth_path = image_path.parent / (image_path.stem + ".gt.txt")
        if ground_truth_path.exists():
            pairs.append((image_path, ground_truth_path))
        else:
            print(f"  (skipping {image_path.name}: no {ground_truth_path.name})")
    return pairs


def instantiate_engine(kind: str, spec: str):
    if kind == "llm":
        from engines.openai_compatible import OpenAICompatibleEngine

        return OpenAICompatibleEngine(model=spec)
    if kind == "htr":
        os.environ["HTR_MODEL_ID"] = str(spec)
        from engines.rest_htr import RestHTREngine

        return RestHTREngine()
    raise ValueError(f"unknown engine kind: {kind}")


def _safe(name: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]+", "_", name)


def format_critical_diff(edits) -> str:
    """Show only the name/date (critical) edits, plus a minor-edit count."""
    critical = [edit for edit in edits if edit.touches_critical]
    minor = len(edits) - len(critical)
    if not edits:
        return "      (no word-level differences)"
    lines = []
    for edit in critical:
        reference = " ".join(edit.reference_tokens) or "<none>"
        hypothesis = " ".join(edit.hypothesis_tokens) or "<none>"
        lines.append(
            f"      !! NAME/DATE [{edit.operation}] "
            f"gt: {reference!r} -> pred: {hypothesis!r}"
        )
    if minor:
        lines.append(f"      (+ {minor} minor non-critical edit(s))")
    return "\n".join(lines)


def run(engine_specs) -> None:
    pairs = discover_samples(SAMPLES_DIR)
    if not pairs:
        print(f"No labelled samples found in {SAMPLES_DIR}.")
        return

    REPORTS_DIR.mkdir(exist_ok=True)
    report_lines = []
    summary_rows = []  # (name, mean_raw, mean_lenient, critical, ok, errors)

    def emit(text: str) -> None:
        print(text)
        report_lines.append(text)

    for kind, spec in engine_specs:
        try:
            engine = instantiate_engine(kind, spec)
        except Exception as error:  # config errors — keep other engines running
            emit(f"\n[{kind}:{spec}] not runnable: {error}")
            continue

        emit(f"\n===== ENGINE: {engine.name} =====")
        raw_total = lenient_total = 0.0
        critical_total = ok_count = error_count = 0

        for image_path, ground_truth_path in pairs:
            ground_truth = ground_truth_path.read_text(encoding="utf-8")
            try:
                prediction = engine.transcribe(str(image_path))
            except Exception as error:
                error_count += 1
                emit(f"\n  {image_path.name}: TRANSCRIBE ERROR {error}")
                continue

            raw_cer = character_error_rate(ground_truth, prediction)
            lenient_cer = lenient_character_error_rate(ground_truth, prediction)
            wer = word_error_rate(ground_truth, prediction)
            edits = critical_token_diff(ground_truth, prediction)
            critical_errors = sum(1 for edit in edits if edit.touches_critical)

            raw_total += raw_cer
            lenient_total += lenient_cer
            critical_total += critical_errors
            ok_count += 1

            emit(
                f"\n  {image_path.name}   CER={raw_cer:.1%}  "
                f"lenient-CER={lenient_cer:.1%}  WER={wer:.1%}  "
                f"name/date-errors={critical_errors}"
            )
            emit(format_critical_diff(edits))
            # Save the raw prediction: re-scoring must never re-pay API calls.
            (
                REPORTS_DIR / f"{image_path.stem}.{_safe(engine.name)}.pred.txt"
            ).write_text(prediction, encoding="utf-8")

        if ok_count:
            mean_raw = raw_total / ok_count
            mean_lenient = lenient_total / ok_count
            emit(
                f"\n  --- {engine.name}: {ok_count}/{len(pairs)} ok "
                f"({error_count} error) | mean CER={mean_raw:.1%}  "
                f"mean lenient-CER={mean_lenient:.1%}  "
                f"total name/date-errors={critical_total} ---"
            )
            summary_rows.append(
                (engine.name, mean_raw, mean_lenient, critical_total,
                 ok_count, error_count)
            )
        else:
            emit(f"\n  --- {engine.name}: 0/{len(pairs)} ok ({error_count} error) ---")

    if summary_rows:
        emit("\n\n===== COMPARISON (sorted by lenient CER, lower is better) =====")
        emit(f"  {'engine':<34} {'CER':>7} {'lenient':>8} {'name/date':>10} {'ok':>6}")
        for name, mean_raw, mean_lenient, critical, ok_count, error_count in sorted(
            summary_rows, key=lambda row: row[2]
        ):
            emit(
                f"  {name:<34} {mean_raw:>6.1%} {mean_lenient:>7.1%} "
                f"{critical:>10} {f'{ok_count}/{ok_count + error_count}':>6}"
            )

    (REPORTS_DIR / "last_run.txt").write_text(
        "\n".join(report_lines), encoding="utf-8"
    )
    print(f"\nReport + raw predictions written to {REPORTS_DIR}/")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Benchmark transcription engines on labelled samples."
    )
    parser.add_argument(
        "--llm", action="append", default=[], metavar="MODEL",
        help="OpenAI-compatible model id to benchmark; repeatable",
    )
    parser.add_argument(
        "--htr", action="append", default=[], metavar="MODEL_ID",
        help="dedicated-HTR service model id to benchmark; repeatable",
    )
    parser.add_argument(
        "--selftest", action="store_true",
        help="validate the scoring math (no API, no key)",
    )
    args = parser.parse_args()

    if args.selftest:
        import selftest

        selftest.main()
        return

    engine_specs = [("llm", m) for m in args.llm] + [("htr", h) for h in args.htr]
    if not engine_specs:
        parser.error("give at least one --llm or --htr engine (or --selftest)")
    run(engine_specs)


if __name__ == "__main__":
    main()
```

## selftest.py — mocked, no-key validation

```python
"""Validate the scoring math with NO API, NO key, NO install.

    python3 selftest.py        (or: python3 run_benchmark.py --selftest)

All names and dates below are invented examples.
"""
from __future__ import annotations

from scoring import (
    character_error_rate,
    critical_token_diff,
    is_critical_token,
    lenient_character_error_rate,
    word_error_rate,
)


def _approximately_equal(actual: float, expected: float, tolerance: float = 1e-9):
    return abs(actual - expected) <= tolerance


def main() -> None:
    # CER: one substitution over four characters -> 0.25
    assert _approximately_equal(character_error_rate("Haus", "Hans"), 1 / 4)
    assert _approximately_equal(character_error_rate("abc", "abc"), 0.0)
    assert _approximately_equal(character_error_rate("", ""), 0.0)
    assert _approximately_equal(character_error_rate("abc", ""), 1.0)

    # WER: one word of five changed (the year) -> 0.2
    assert _approximately_equal(
        word_error_rate("geboren den 12 Merz 1834", "geboren den 12 Merz 1835"),
        1 / 5,
    )

    # Lenient CER folds convention (hyphenation / case / ß) to zero...
    assert _approximately_equal(
        lenient_character_error_rate("Ver¬\nzeichnis", "Ver-\nzeichnis"), 0.0
    )
    assert _approximately_equal(
        lenient_character_error_rate("Taufregister", "taufregister"), 0.0
    )
    assert _approximately_equal(
        lenient_character_error_rate("Grüßner", "Grüssner"), 0.0
    )
    # ...but a genuine name misread SURVIVES lenient normalization.
    assert lenient_character_error_rate("Beispielmann", "Beispelmann") > 0.0

    # Critical-token detection
    assert is_critical_token("Beispielmann")   # capitalised proper noun
    assert is_critical_token("1834")           # year
    assert is_critical_token("7ber")           # archaic month form (September)
    assert not is_critical_token("und")        # lowercase function word
    assert not is_critical_token("getauft")    # lowercase verb

    # A year AND a surname substitution must both be flagged critical.
    edits = critical_token_diff(
        "getauft den 12 Merz 1834 Georg Beispielmann",
        "getauft den 12 Merz 1835 Georg Beispelmann",
    )
    flagged = [
        edit for edit in edits
        if edit.touches_critical and edit.operation == "replace"
    ]
    assert len(flagged) == 2, edits

    print("scoring self-test: PASS")


if __name__ == "__main__":
    main()
```

If the REST adapter grows an OAuth flow and retry logic, self-test those too:
put every network call and clock read behind small overridable seam methods
(`_http_post_json`, `_now`, `_sleep`, ...) and subclass the engine in the
self-test with deterministic fakes. Assert at the end that `"requests" not in
sys.modules` — proof that every seam was overridden and the test truly ran
offline.

## fetch_samples.py — optional open-dataset fetcher

```python
#!/usr/bin/env python3
"""Fetch a few labelled samples from a public Hugging Face dataset.

Example source: dh-unibe/image-text_kurrent-xix — 19th-century German
Kurrent, MIT licence (DOI 10.57967/hf/8590). Each row is an image + PAGE XML.
Streaming pulls only the first few rows, never the full corpus. Keep the
dataset attribution if you publish results.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

BENCHMARK_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BENCHMARK_DIR))
from engines.rest_htr import plain_text_from_page_xml  # reuse the PAGE parser

SAMPLES_DIR = BENCHMARK_DIR.parent / "samples"

_MAGIC = [
    (b"\x89PNG\r\n\x1a\n", ".png"),
    (b"\xff\xd8\xff", ".jpg"),
    (b"II*\x00", ".tif"),
    (b"MM\x00*", ".tif"),
]


def _extension_for(image_bytes: bytes) -> str:
    for signature, extension in _MAGIC:
        if image_bytes.startswith(signature):
            return extension
    return ".png"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", default="dh-unibe/image-text_kurrent-xix")
    parser.add_argument("--n", type=int, default=12)
    parser.add_argument("--min-chars", type=int, default=10)
    parser.add_argument("--max-chars", type=int, default=600)
    parser.add_argument("--scan-limit", type=int, default=400)
    args = parser.parse_args()

    from datasets import load_dataset  # pip install datasets

    SAMPLES_DIR.mkdir(exist_ok=True)
    dataset = load_dataset(args.dataset, split="train", streaming=True)

    written = scanned = 0
    for row in dataset:
        if written >= args.n or scanned >= args.scan_limit:
            break
        scanned += 1
        ground_truth = plain_text_from_page_xml(
            row.get("xml_content", "") or ""
        ).strip()
        if not (args.min_chars <= len(ground_truth) <= args.max_chars):
            continue
        image_field = row.get("image")
        image_bytes = (
            image_field.get("bytes") if isinstance(image_field, dict) else None
        )
        if not image_bytes:
            continue
        stem = f"{written:02d}_sample"
        (SAMPLES_DIR / f"{stem}{_extension_for(image_bytes)}").write_bytes(
            image_bytes
        )
        (SAMPLES_DIR / f"{stem}.gt.txt").write_text(
            ground_truth, encoding="utf-8"
        )
        written += 1

    print(f"Wrote {written} sample pair(s) to {SAMPLES_DIR}/ ({scanned} scanned).")


if __name__ == "__main__":
    main()
```

## Customization Notes

- **Lenient folds are per-language.** The ß→ss fold is German-specific;
  long-s/round-s, u/v, i/j equivalences suit older Latin scripts; drop them
  all for modern print. Every fold you add must be a documented transcription
  convention of your corpus, not a convenience.
- **Critical-token rules are per-domain.** Registers care about names and
  dates; invoices care about amounts and account numbers (flag currency and
  IBAN-shaped tokens instead); prescriptions care about dosages. Change
  `is_critical_token`, keep the diff machinery.
- **Adding a cloud-OCR family** is one more `TranscriptionEngine` subclass:
  call the vendor SDK, concatenate the returned text blocks in reading order,
  return the string. The runner and scorer need no changes.
- **Adding an engine to the panel** is one `--llm`/`--htr` flag (or a new
  CLI flag for a new family in `instantiate_engine`) — never a code fork of
  the runner.
