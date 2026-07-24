---
title: "Choosing an HTR/OCR Engine"
description: "Decision framework for selecting a handwritten-text-recognition engine — deployment model, API entitlement, vision-LLM vs dedicated HTR, CER pitfalls"
category: reference
agents: [nlp-specialist]
teams: []
skills: [benchmark-htr-engines, label-training-data]
---

# Choosing an HTR/OCR Engine

This guide is a decision framework for selecting a handwritten-text-recognition (HTR) or OCR engine for a transcription project — historical church registers, family letters, field notebooks, or any corpus where the handwriting itself is the obstacle. It captures lessons that are not obvious up front: why "the API accepts my token" does not mean "I can use the API", why a vision-LLM's beautiful transcription can be worse than a dedicated engine's ugly one, and why the standard accuracy metric will mislead you if you read it naively.

The companion skill [benchmark-htr-engines](../skills/benchmark-htr-engines/SKILL.md) is the *how-to* for the measurement steps this guide motivates: it runs candidate engines over a shared sample set and scores them. This guide is the *which-and-why* layer — read it before you benchmark, so you benchmark the right candidates against the right criteria.

## When to Use This Guide

- You have scanned handwritten pages (letters, registers, diaries) and need machine transcription, but do not know which engine or service to commit to.
- You are about to sign up for a paid HTR service or cloud API and want to know what to verify before paying.
- You are weighing a general vision-LLM (Claude, GPT-4V-class models) against a dedicated HTR system (Transkribus, kraken, PyLaia) and want the real tradeoff, not the marketing one.
- You ran a benchmark, the character error rates look strange, and you need to know whether the engine or the metric is at fault.
- You are tempted to build a custom transcription app and want a sanity check first.

## Prerequisites

- A representative sample of your source material as images (5-20 pages covering the range of hands, ink quality, and layouts).
- Knowledge of the script involved — modern Latin cursive, Kurrent/Sütterlin, Kanzleischrift, non-Latin scripts — because model availability is script-specific.
- For the benchmarking step: the [benchmark-htr-engines](../skills/benchmark-htr-engines/SKILL.md) skill and a small amount of ground truth (see [Data Reality](#data-reality-ground-truth-may-not-exist)).
- **Confidentiality check**: if the material contains personal data (names, birth dates, family records), decide up front which deployment models are acceptable before uploading anything to a cloud service.

## Workflow Overview

Engine selection is a funnel. Each stage can end the project early — usually in a good way, by saving you from building something that exists or committing to a service you cannot actually use.

1. **Search existing apps.** The casual use case may already be solved — no engine selection needed at all.
2. **Face the data reality.** Check whether ground truth exists for your script and genre; if not, plan to hand-transcribe a few pages before you can evaluate anything.
3. **Choose a deployment model.** Cloud API, on-device, or self-host — constrained hard by whether a model *exists* for your script.
4. **Verify entitlement, not just auth.** For any cloud candidate, run one real API call against the endpoint you need before committing.
5. **Decide vision-LLM vs dedicated HTR.** The deciding factor is the confidence signal, not aggregate accuracy.
6. **Benchmark with eyes open.** Run [benchmark-htr-engines](../skills/benchmark-htr-engines/SKILL.md) and read the scores with the [CER pitfalls](#cer-scoring-pitfalls) in mind.

The remaining sections cover these stages in order.

## Search Existing Apps Before Building

Before selecting an engine — let alone building anything — check whether the problem is already solved as a product. For many scripts the casual "transcribe my family documents" use case is served by existing applications:

| Application | Serves |
|---|---|
| Transkribus web app | Historical documents, many public models, project workspaces |
| OmasTagebuch | German Kurrent/Sütterlin family documents specifically |
| Handwriting OCR | General handwritten-document transcription as a service |
| MyHeritage Scribe AI | Genealogy-oriented handwritten record transcription |

Two honest questions decide this stage:

- **Is the requirement volume, automation, or integration** — hundreds of pages, a repeatable pipeline, output feeding another system? Then you need an engine and API, and the rest of this guide applies.
- **Or is it "read these thirty pages"?** Then an existing app's web interface likely does the job today, and the correct engineering effort is zero.

Be especially skeptical of the middle path: a custom app that calls a cloud HTR API often reduces to a thin wrapper around that API — a login screen and an upload button in front of someone else's model. If the wrapper adds no domain logic (custom post-processing, record extraction, database integration), the existing app already *is* that wrapper, with a support team.

## Data Reality: Ground Truth May Not Exist

Every later stage — model training, fine-tuning, and above all benchmarking — assumes reference transcriptions ("ground truth") exist. For mainstream material they do: printed English, modern Latin cursive, and major-language newspapers have large open datasets. For niche script-genre combinations they often do not. German Kurrent/Sütterlin church registers are a concrete example: at evaluation time there was no usable open ground-truth set for that script in that genre — the open Kurrent data that exists comes from different document types with different layouts and vocabulary.

Plan for this from the start:

- **Budget hand-transcription of a few pages** (5-10 is enough to start) from your own corpus. This is unglamorous but it is the only evaluation basis that reflects *your* hands, *your* ink, *your* layouts. The [label-training-data](../skills/label-training-data/SKILL.md) skill covers setting up a systematic labeling workflow if the effort grows beyond a handful of pages.
- **Transcribe what the engine will see**, including abbreviations, marginalia, and line breaks, and record the conventions you chose (expand abbreviations or not? preserve line-end hyphenation or not?). Undocumented conventions become metric noise later — see [CER Scoring Pitfalls](#cer-scoring-pitfalls).
- **Use synthetic values in anything you publish.** Benchmark reports, bug reports to vendors, and documentation should carry invented names and dates (`Johann Musterhuber`, `geboren den 14. Mai 1852`), never rows from the actual records.

If no open ground truth exists for your script, that same fact constrains deployment: it means there is likely no pretrained open model either, which shapes the next stage.

## Deployment Tradeoffs: Cloud API vs On-Device vs Self-Host

Three deployment models, with very different failure modes:

| Model | Examples | Strengths | Hard constraint |
|---|---|---|---|
| Cloud API | Transkribus API, Google Cloud Vision, Azure AI Vision, vision-LLM APIs | Best available models, zero infrastructure | Data leaves your machine; plan-tier gating (see next section); per-page cost |
| On-device | Apple Live Text, ML Kit, bundled mobile models | Privacy, offline, free per page | A model must *exist* for your script — often none does |
| Self-host | kraken, PyLaia, TrOCR, Loghi | Full control, privacy, scriptable pipelines | You operate it; pretrained weights must exist or you must train them |

The decisive question for on-device and self-host is not quality — it is **existence**. On-device text recognition ships with models for major modern scripts; for a niche script like Sütterlin there is typically *no on-device model at all*, and no amount of configuration changes that. The same existence check applies to self-hosting: kraken and PyLaia are excellent engines, but an engine without pretrained weights for your script is an empty shell. Check the model repositories (Zenodo for kraken models, the Transkribus public-models list, Hugging Face for TrOCR variants) for your script *and* something close to your genre before assuming the self-host path is open.

Practical decision order:

1. **Personal or sensitive data and a mainstream script** → try on-device or self-host first; the models exist and the data stays local.
2. **Niche script with a public model on a cloud platform** → cloud API is likely the only serious option; weigh the privacy tradeoff explicitly and minimize what you upload.
3. **Niche script with no model anywhere** → you are in training territory: hand-transcribed ground truth (previous section) becomes training data, and self-host engines with fine-tuning support (kraken, PyLaia) become the candidates.

Cost asymmetry is worth noting: cloud APIs bill per page forever; self-hosting costs are front-loaded (setup, possibly training) and then near-zero per page. For a one-time archive of a few hundred pages, cloud usually wins; for an ongoing pipeline, the curves cross.

## Verify API Entitlement, Not Just Authentication

The subtlest cloud-API trap: **a provider can issue you a perfectly valid access token and still deny the API you need, because the API is gated behind a plan tier.** Authentication ("who are you") succeeding tells you nothing about entitlement ("what may you call").

Concrete example from a real evaluation — Transkribus. The OIDC token endpoint happily authenticates a free-tier account:

```bash
# Step 1: authentication — succeeds on any account tier
curl -s -X POST \
  "https://account.readcoop.eu/auth/realms/readcoop/protocol/openid-connect/token" \
  -d "grant_type=password" \
  -d "client_id=processing-api-client" \
  -d "username=jane.doe@example.com" \
  -d "password=${HTR_PASSWORD}"
# → 200 OK, returns a valid access_token
```

But the processing endpoint — the one call the whole integration depends on — is gated:

```bash
# Step 2: entitlement — the call that actually matters
curl -s -X POST "https://transkribus.eu/processing/v1/processes" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"config": {"textRecognition": {"htrId": 12345}}}'
# → 401 Unauthorized — the REST Processing API is Organisation-plan-only
```

The token is valid; the 401 is not an auth bug. The Transkribus REST API is restricted to the Organisation plan, so every lower tier authenticates successfully and is then refused at the door of `POST /processing/v1/processes`. Nothing in the token response, and little in the signup flow, warns you.

The rule that follows:

- **Before committing to any cloud engine — before writing integration code, before paying — run one real end-to-end call against the exact endpoint your pipeline needs**, with a real image, on the account tier you intend to use. A successful login, a valid token, or a working web interface are not evidence of API entitlement.
- **Read the plan matrix for API access specifically.** "API access" is a common paid-tier differentiator, and the web app working on a free tier is precisely what makes the gap invisible.
- **Treat a 401-with-valid-token as an entitlement signal, not an auth bug.** Debugging your OIDC flow will not fix a plan gate.

## Vision-LLM vs Dedicated HTR

General vision-LLMs are genuinely strong at reading difficult handwriting, and on aggregate character error rate they can beat dedicated HTR engines. But for record-oriented material the aggregate is not what matters, and the two engine families fail in opposite ways:

- **A vision-LLM returns fluent, confident, sometimes-fabricated text with no confidence signal.** Where the ink is smudged, the model does not degrade — it *completes*. A plausible name, a plausible date, grammatically perfect, and indistinguishable in the output from the parts it actually read. There is no per-token score telling you which is which.
- **A dedicated HTR engine returns flaggable output.** It emits per-line or per-character confidence; where it struggles it produces visibly broken text *and* a low score. The output is uglier, but the uncertainty is machine-readable — you can route low-confidence lines to human review.

A synthetic example of the same damaged register line through both:

```text
Ground truth (hand-transcribed):  Johann Musterhuber, geboren den 14. Mai 1852
Vision-LLM output:                Johann Musterhuber, geboren den 11. März 1853
Dedicated HTR output:             Johann Mu?terhuber, geb?ren den 1?. Mai 185?   [line conf 0.41 → flagged]
```

The LLM's line has a *lower* character error rate — and silently corrupts the record with a fabricated date. The HTR line is noisier but announces exactly where a human must look. For registers, genealogy, and any use where **names and dates are the payload**, a wrong-but-flagged token is a recoverable inconvenience; a wrong-but-fluent token is silent data corruption. This property outweighs an aggregate-CER advantage.

Where each wins:

- **Vision-LLM**: reading prose for gist, triaging what a document is about, one-off decipherment where a human verifies everything anyway, and layouts too irregular for HTR segmentation.
- **Dedicated HTR**: pipelines extracting structured records at volume, anything requiring an audit trail of what was read vs inferred, and corpora where a fine-tuned model can be built.
- **Hybrid** is often practical: dedicated HTR as the system of record with confidence-based flagging, and a vision-LLM as a *suggester* on the flagged lines — with its suggestions marked as inferences until confirmed.

If you benchmark an LLM alongside HTR engines (and you should — see [benchmark-htr-engines](../skills/benchmark-htr-engines/SKILL.md)), score them on critical-token fidelity, not CER alone. Which leads to the metric itself.

## CER Scoring Pitfalls

Character error rate — edit distance divided by reference length — is the standard HTR metric, and it will mislead you in at least four specific ways on real archival material.

**Pitfall 1: region and marginalia mismatch.** Real register pages carry marginal notes, column headers, and stamps. If the engine transcribes marginalia your ground truth omits (or reads regions in a different order than your reference), the alignment produces a wall of insertions and the CER explodes — while the actual body transcription may be excellent. A CER of 0.45 can mean "unusable engine" or "excellent engine that also read the margin"; the number alone cannot tell you which.

**Pitfall 2: convention noise.** Line-end hyphenation (`Muster-` / `huber` vs `Musterhuber`), long-s and umlaut normalization, and capitalization conventions differ between your ground truth and each engine's output style. These are systematic, harmless disagreements that inflate CER without reflecting reading errors.

Mitigate both with a **lenient CER**: normalize case, collapse line-end hyphenation, normalize historical character variants, and exclude or separately align marginal regions before computing edit distance. Report strict and lenient CER side by side; a large gap between them is itself diagnostic (it means convention noise, not misreading, dominates the strict number).

**Pitfall 3: the mean hides everything.** Read CER **per sample, never as a single mean**. One page with a region mismatch (Pitfall 1) can double the corpus mean of an otherwise-strong engine; conversely a mean of 0.12 may hide one catastrophic 0.60 page exactly where the hand changes. The per-sample table — engine × page — is the real result; the mean is a summary of last resort. This is the repository-wide "read the data row-by-row" rule applied to HTR.

**Pitfall 4: the critical-token count is confounded.** Because names and dates are the payload, a natural companion metric is a *critical-token diff*: extract name-like and date-like tokens from reference and hypothesis and count mismatches. Useful — but do not trust the count as a ranking metric, because it is confounded in both directions:

- **It over-flags capitalized nouns.** In German every noun is capitalized, so a capitalization-based "name detector" counts `Kirche` and `Mai` alongside actual surnames — engines that differ on ordinary nouns look worse on "names" than they are.
- **It under-counts on divergent outputs.** When an engine's output diverges badly, alignment breaks down and critical tokens disappear rather than mismatch — the worst output can post the *fewest* counted substitutions, because there was nothing aligned left to count.

So use the critical-token diff as a **reading aid, not a score**: lean on the qualitative list of substitutions (`Musterhuber → Mosterhaber`, `1852 → 1853`) and judge severity by hand. A ranking claim like "engine A is better on names" needs that qualitative reading behind it, not the raw count.

Practical scoring recipe, in the order the [benchmark-htr-engines](../skills/benchmark-htr-engines/SKILL.md) skill implements it:

1. Compute strict CER and lenient CER per sample.
2. Produce the per-sample table; investigate any outlier before averaging anything.
3. Generate the critical name/date token diff per sample.
4. Read the substitution lists qualitatively; write the verdict from those, using the numbers as support.

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| Valid token but `401` on the processing endpoint | API gated behind a plan tier (e.g. Transkribus REST API is Organisation-plan-only) — entitlement, not auth | Verify the plan matrix; test the exact endpoint on your tier before committing; upgrade or drop the candidate |
| CER is terrible but the transcription reads fine | Region/marginalia mismatch or hyphenation/case convention noise inflating edit distance | Use lenient CER with normalization; align or exclude marginal regions; compare strict vs lenient gap |
| Vision-LLM wins on CER but names and dates are wrong | Fluent fabrication — the LLM completes what it cannot read, with no confidence signal | Score critical-token fidelity, not CER alone; prefer flaggable HTR output for record extraction |
| No on-device or open model for the script | Niche script (e.g. Sütterlin) has no published model for that platform | Use a cloud platform that hosts one, or plan a fine-tuning path from hand-transcribed pages |
| Critical-token diff flags dozens of "name" errors | Capitalization-based token detection over-flags ordinary capitalized nouns (all German nouns) | Treat the count as a reading aid; judge the qualitative substitution list instead |
| Engine ranking flips between mean CER and per-sample reading | One outlier page (region mismatch, hand change) dominating the mean | Always read per-sample; investigate outliers before comparing means |
| No ground truth exists to benchmark against | Script/genre combination has no open dataset | Hand-transcribe 5-10 representative pages; document transcription conventions as you go |

## Related Resources

- [Benchmark HTR Engines](../skills/benchmark-htr-engines/SKILL.md) -- the how-to companion: runs candidate engines over a shared sample set and scores them with the lenient-CER and critical-token methods this guide motivates
- [Label Training Data](../skills/label-training-data/SKILL.md) -- systematic labeling workflows, useful when hand-transcribed ground truth grows beyond a handful of pages
- [Quick Reference](quick-reference.md) -- command cheat sheet for invoking skills from Claude Code
