---
name: verify-web-app-runtime
description: >
  Verify that a frontend or visual change actually works by running the app in
  headless Chromium and observing pixels plus console output — runtime
  verification for WebGL, GPGPU, Canvas, and WebAudio surfaces that static
  review and unit tests cannot cover. Launches with the SwiftShader/ANGLE
  flags WebGL2 needs, probes EXT_color_buffer_half_float before trusting a
  GPGPU path, asserts visibilityState === 'visible' and non-black canvas
  luminance (>1% of pixels lit), runs a second reduced-motion context, and
  treats only fresh page loads (never HMR) as a valid test surface. Use when a
  PR touches shaders, particle systems, canvas rendering, or audio, when "it
  renders on my machine" needs a CI-checkable exit code, or when a headless
  spot-check must prove an app draws real pixels before merge.
license: MIT
allowed-tools: Bash Read Write Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-dev
  complexity: advanced
  language: Python
  tags: web-dev, webgl, gpgpu, playwright, headless, runtime-verification
  locale: ja
  source_locale: en
  source_commit: 3b0afd0b
  translator: "Claude + human review"
  translation_date: "2026-07-10"
---

# Verify Web App Runtime

Prove that a web app's visual runtime actually works — not that its elements
exist, not that its unit tests pass, but that real pixels land on a real
canvas with the expected GPU capabilities, in a headless browser with a
CI-friendly exit code. This skill encodes the gotchas that bite every cold
start of headless WebGL verification, each as an explicit procedure step.

## When to Use

- A PR changes WebGL/WebGL2 shaders, a GPGPU simulation, canvas drawing, or a
  WebAudio graph, and "does it still render?" must be answered before merge
- A static code review or unit test suite cannot observe the failure mode
  (black canvas, silent GPGPU fallback, visibility-gated render loop)
- CI needs a one-command runtime gate: exits 0 when the app draws, 1 when not
- A headless machine (no GPU) must verify a WebGL2 app end-to-end
- NOT for extracting data from third-party pages — that is
  [headless-web-scraping](../headless-web-scraping/SKILL.md)

## Inputs

- **Required**: URL of the running app, including any base path
  (e.g. `http://localhost:5173/myapp/` — a missing base path 404s silently)
- **Required**: Interaction steps to reach the surface under test — a JSON
  array of `click` / `wait` / `assert_attr` step objects (clicks double as
  the WebAudio user gesture)
- **Optional**: Output directory for screenshots and reports
  (default: `./verify-runtime-out`)
- **Optional**: Luminance thresholds (default: a grayscale pixel > 25 counts
  as lit; >= 1% lit pixels passes)
- **Optional**: Console error keywords
  (default: `gpgpu`, `webgl error`, `nan`, `fallback`)
- **Optional**: Whether `EXT_color_buffer_half_float` is required
  (default: yes; pass `--skip-half-float` for apps without a GPGPU path)

The packaged verifier at [scripts/verify_runtime.py](scripts/verify_runtime.py)
implements every step below; the procedure explains what it asserts and why,
so each check can also be reproduced or adapted standalone.

## Procedure

### Step 1: Start the app and insist on a fresh-load test surface (never HMR)

HMR does not reset GPGPU textures: a hot-reloaded tab keeps the previous
simulation state (e.g. particle position textures survive the module swap),
so anything observed through HMR proves nothing about a cold start. Only a
fresh page load in a fresh browser is a valid test surface.

```bash
npm run dev &                       # or: npm run build && npm run preview
curl -sf http://localhost:5173/myapp/ >/dev/null && echo "server up"
```

**Expected:** The app answers on a stable URL. All verification below happens
via fresh `browser.launch()` + `page.goto()` — never by observing a tab that
hot-reloaded.

**On failure:** If the URL 404s, check the base path — Vite apps often serve
under `/<repo-name>/`, and the bare origin silently serves nothing. If only an
HMR-updated tab shows the change, restart the dev server or build a preview
before verifying.

### Step 2: Launch headless Chromium with the SwiftShader/ANGLE flags

Headless Chromium has no GPU; without software rendering flags,
`getContext('webgl2')` returns `null` and every downstream check fails for
the wrong reason.

```python
CHROMIUM_ARGS = [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
]
browser = playwright.chromium.launch(headless=True, args=CHROMIUM_ARGS)
```

**Expected:** A WebGL2 context is obtainable in the headless page (verified by
the probe in Step 3).

**On failure:** Copy the four flags exactly — a misspelled flag is silently
ignored by Chromium and the symptom is identical (`webgl2: false`). If the
flags are correct and WebGL2 is still unavailable, update the browser:
`python -m playwright install chromium`.

### Step 3: Probe EXT_color_buffer_half_float before trusting a GPGPU path

GPGPU pipelines render to half-float framebuffers. If the extension is
missing, well-built apps fall back silently to a non-GPGPU mode — the page
looks alive, but the screenshots verify the wrong code path.

```python
webgl = page.evaluate("""() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    return gl ? {webgl2: true, halfFloat: !!gl.getExtension('EXT_color_buffer_half_float')}
              : {webgl2: false};
}""")
```

**Expected:** `{"webgl2": true, "halfFloat": true}`. SwiftShader supports the
extension, so a headless pass here is representative.

**On failure:** `webgl2: false` means Step 2's flags did not take effect.
`halfFloat: false` means any GPGPU verification is invalid — the app is
exercising its fallback. Fail the run (the packaged script does) rather than
screenshot the fallback; relax with `--skip-half-float` only for apps that
have no GPGPU path at all.

### Step 4: Assert the page is visible — rAF loops are visibility-gated

Well-behaved apps pause their `requestAnimationFrame` loop when
`document.hidden` is true. A hidden page produces a black canvas that looks
exactly like a rendering bug.

```python
info = page.evaluate("() => ({visibility: document.visibilityState})")
assert info["visibility"] == "visible"
```

**Expected:** `visibilityState === 'visible'` in every context, checked before
trusting any pixel assertion.

**On failure:** A black canvas with a hidden page is a test-harness artifact,
not an app bug. Call `page.bring_to_front()` and re-check; do not run other
foreground automation against the same headless browser while verifying.

### Step 5: Drive interactions with real clicks (the WebAudio user gesture)

Reach the surface under test through the UI, exactly as a user would.
Browsers refuse to start an `AudioContext` without a user gesture — real
Playwright clicks count, programmatic `dispatchEvent` calls do not.

```json
[
  {"action": "click", "role": "button", "name": "Switch to 3D view", "settle": 2.5},
  {"action": "click", "role": "button", "name": "Sand", "exact": true, "settle": 4},
  {"action": "assert_attr", "role": "button", "name": "Sand", "exact": true,
   "attr": "aria-pressed", "equals": "true"}
]
```

The `"Switch to 3D view"` / `"Sand"` names above are examples from the origin
project — replace them with your app's controls. `settle` (seconds) lets a
simulation reach a representative state before pixels are judged.

```bash
python3 scripts/verify_runtime.py --url http://localhost:5173/myapp/ \
    --steps steps.json --out /tmp/verify-out
```

**Expected:** Every click resolves its target (ARIA role + accessible name
preferred, CSS selector as fallback), and every `assert_attr` step passes —
e.g. the mode button reports `aria-pressed="true"`, proving the app accepted
the mode switch rather than ignoring the click.

**On failure:** A click timeout usually means a wrong accessible name — dump
candidates with `page.get_by_role("button").all_inner_texts()`. An
`assert_attr` mismatch means the UI ignored the interaction: check the
console log for errors thrown by the click handler.

### Step 6: Screenshot the canvas and assert non-black luminance

A present canvas can still be empty. Element presence, canvas dimensions, and
even a running rAF loop all pass while the app draws nothing. Only sampled
pixels prove rendering.

```python
from PIL import Image
grayscale = Image.open("norm_canvas.png").convert("L")
histogram = grayscale.histogram()
total_pixels = grayscale.size[0] * grayscale.size[1]
lit = sum(histogram[26:]) / total_pixels * 100   # pixels brighter than 25
assert lit >= 1.0, f"canvas effectively black (lit={lit:.1f}%)"
```

**Expected:** More than 1% of canvas pixels brighter than grayscale 25. The
origin run measured ~9% lit for a healthy particle scene — comfortably above
threshold without being tuned to the content.

**On failure:** Screenshot the full page too and compare: if the page shows
content but the canvas crop is black, the draw loop is not producing pixels
(check Steps 3 and 4 first). If a legitimately sparse scene sits under 1%,
raise `settle` so more of the scene accumulates, or lower `--lit-percent-min`
deliberately and note why.

### Step 7: Run a second reduced_motion: reduce context and confirm the settled pose

Apps that honor `prefers-reduced-motion` must show a calm, settled state.
Verify it in a separate fresh context — never by toggling emulation on the
already-running page.

```python
context = browser.new_context(viewport={"width": 1280, "height": 900},
                              reduced_motion="reduce")
```

The packaged script re-runs all previous assertions in this context, then
takes two canvas screenshots one second apart and requires them near-identical
(<= 2% of pixels changed) — a still pose, not a paused-by-accident one.

**Expected:** Reduced-motion context passes the same luminance/visibility
checks and the two screenshots differ by <= 2% of pixels.

**On failure:** A large diff means animation continues despite
`prefers-reduced-motion` — check that the app queries the media feature and
that the settled pose is reachable without animation. If the app deliberately
keeps subtle motion, raise `--still-max-changed-percent` and document the
decision.

### Step 8: Scan console output for GPU error signals

Pixels can look right while the console reports a degraded path. Collect
`console` and `pageerror` events for the whole run and match them against
error keywords.

```python
gpu_errors = [line for line in logs
              if any(keyword in line.lower()
                     for keyword in ["gpgpu", "webgl error", "nan", "fallback"])]
```

**Expected:** Zero matching lines. The packaged script appends any hits to the
failure list and writes the full log to `<out>/console.log`.

**On failure:** Read the matched lines in `console.log`. `nan` in a shader or
simulation log means numeric blow-up even if this frame looked fine;
`fallback` means Step 3's guarantee was violated at app level. Substring
matches on innocent words (e.g. "nan" inside a longer token) are tuned away
with explicit `--console-error-keyword` flags.

### Step 9: Run the packaged verifier end-to-end and read the verdict

```bash
pip install playwright pillow
python -m playwright install chromium
python3 skills/verify-web-app-runtime/scripts/verify_runtime.py \
    --url http://localhost:5173/myapp/ \
    --steps steps.json \
    --out /tmp/verify-out
```

**Expected:** Per-context summary lines, `FAILURES: none`, exit code 0.
`/tmp/verify-out/` contains `norm_page.png`, `norm_canvas.png`, `rm_page.png`,
`rm_canvas.png`, `rm_canvas_still.png`, `console.log`, and `report.json`. The
origin run against a healthy build reported: half-float present, mode active,
visibility visible, ~9% pixels lit, zero GPGPU errors.

**On failure:** The exit code is 1 and every failed assertion is listed —
work through them in procedure order (flags before probe, probe before
pixels), since early failures cause misleading later ones. `report.json`
holds the raw evidence for each context.

## Validation

- [ ] Verifier exits 0 against a known-good build of the app
- [ ] Verifier exits 1 when pointed at a deliberately broken surface
      (e.g. a blank page), proving the assertions can fail
- [ ] `report.json` shows `"webgl2": true` and `"halfFloat": true`
      (or the run explicitly used `--skip-half-float`)
- [ ] `visibilityState` is `visible` in both contexts
- [ ] Lit-pixel percentage >= 1% on the canvas crop in both contexts
- [ ] Reduced-motion stillness diff <= 2% changed pixels
- [ ] `console.log` contains no lines matching the error keywords
- [ ] Screenshots for both contexts exist in the output directory

## Common Pitfalls

- **Verifying through HMR**: Hot module replacement preserves GPGPU state
  (position textures survive the swap), so an HMR-updated tab can render
  correctly while a cold start is broken — or vice versa. Always verify a
  fresh page load in a fresh browser.
- **Trusting element presence**: `expect(canvas).toBeVisible()` passes on a
  pitch-black canvas. Only the luminance assertion (Step 6) proves rendering.
  Know its converse limit too: an *undrawn* canvas composites as transparent,
  so over a bright page background it screenshots as fully lit — which is why
  Validation requires demonstrating the verifier can also fail.
- **Missing SwiftShader flags**: Without the four Step 2 flags, headless
  WebGL2 is simply `null` — and the resulting black canvas is
  indistinguishable from an app bug. Rule the harness out first.
- **Ignoring the half-float probe**: Skipping Step 3 lets a silent GPGPU
  fallback masquerade as a pass — the pixels came from the wrong code path.
- **Asserting mid-animation**: A simulation needs settle time before its
  pixels are representative; screenshots taken during a transition flake.
  Use per-step `settle` values, not fixed global sleeps.
- **Expecting audio without a gesture**: `AudioContext` stays suspended until
  a user gesture; drive the UI with real Playwright clicks (Step 5) before
  asserting anything audio-dependent.
- **Overbroad console keywords**: The default `nan` keyword substring-matches
  innocent tokens. Tune with `--console-error-keyword` instead of ignoring
  console failures wholesale.

## Related Skills

- [run-copilot-review-loop](../run-copilot-review-loop/SKILL.md) — companion
  skill from the same review workflow: after runtime verification passes,
  drive the bot review of the PR to a clean pass
- [headless-web-scraping](../headless-web-scraping/SKILL.md) — the
  distinction: scraping is *data extraction* from (usually third-party) pages;
  this skill is *runtime verification* of your own app's pixels, GPU
  capabilities, and console — same headless browser, opposite purpose
- [Headless WebGL Verification guide](../../guides/headless-webgl-verification.md)
  — background on why headless WebGL needs SwiftShader/ANGLE and how the
  verification pattern generalizes

This skill is a core skill of the `frontend-runtime-verifier` agent and is
exercised by the `visual-pr-review` team. See
[references/EXAMPLES.md](references/EXAMPLES.md) for the full origin recipe,
the steps-DSL reference, a no-GPGPU variant, and a CI integration example.

<!-- Keep under 500 lines. Extract large examples to references/EXAMPLES.md if needed. -->
