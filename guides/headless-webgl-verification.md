---
title: "Headless WebGL Verification"
description: "Proving a WebGL/GPGPU/WebAudio app rendered in headless Chromium — SwiftShader/ANGLE flags, capability probes, pixel-luminance assertions, HMR traps"
category: workflow
agents: [frontend-runtime-verifier]
teams: [visual-pr-review]
skills: [verify-web-app-runtime]
---

# Headless WebGL Verification

This guide is a gotchas-first field manual for running a WebGL/GPGPU/WebAudio web app in headless Chromium and *proving it rendered*. The central lesson: for GPU-driven apps, every conventional test signal lies. The page loads, the canvas element exists, the console is quiet — and the canvas is black. A GPGPU particle system that silently fell back to a CPU path passes a DOM-presence test; a NaN-poisoned simulation texture passes a "no errors" check. The only assertion that proves rendering is one made on the pixels themselves, in a context whose GPU capabilities you probed first.

The companion skill [verify-web-app-runtime](../skills/verify-web-app-runtime/SKILL.md) is the step-by-step procedure an agent executes; this guide is the why-and-what-goes-wrong layer that makes the procedure's assertions make sense. The techniques were validated on the gateway Sand-viz PR — the full working implementation lives at [pjt222/gateway#4](https://github.com/pjt222/gateway/issues/4).

## When to Use This Guide

- A PR touches WebGL, GPGPU (render-to-texture simulation), canvas rendering, or WebAudio, and you need to verify it actually works before merge — not just that it type-checks.
- Your headless test shows a black canvas and you need to tell apart the four unrelated causes (missing GL flags, missing float-texture extension, visibility-gated render loop, genuinely broken code).
- You are building a runtime-verification script for CI and want the assertions that catch real regressions instead of the ones that always pass.
- You verified a fix against a hot-reloading dev server and it "didn't work" — or a broken change "worked" — and you suspect the test surface itself.
- You are setting up the [frontend-runtime-verifier](../agents/frontend-runtime-verifier.md) agent or the [visual-pr-review](../teams/visual-pr-review.md) team and want the background their verdicts rest on.

## Prerequisites

- The app running on a local dev server (or a static build served locally) that a headless browser can reach.
- Playwright with a Chromium build installed (`pip install playwright && playwright install chromium`, or the Node equivalent).
- Pillow (`pip install pillow`) if you use the Python pixel-analysis route below.
- Basic familiarity with what the app *should* draw, so you can pick a sane luminance threshold.

## Workflow Overview

Verification is a fixed sequence, and the order matters — each step is a precondition that lets a later failure be attributed correctly:

1. **Launch headless Chromium with software-GL flags** so WebGL2 exists at all.
2. **Probe capabilities** (`webgl2`, float-texture extensions) before driving the app — a missing extension means you would be testing a silent fallback path.
3. **Fresh-load and drive the app** into the GPU-rendered state (never reuse a hot-reloaded tab).
4. **Assert preconditions**: the page is `visible`, the expected mode is active.
5. **Assert pixels**: element-screenshot the canvas and require a minimum percentage of lit pixels.
6. **Repeat in a second context** with `prefers-reduced-motion: reduce`.
7. **Scan the console log** for GPGPU/NaN/fallback lines collected along the way.

The [frontend-runtime-verifier](../agents/frontend-runtime-verifier.md) agent runs this sequence via the [verify-web-app-runtime](../skills/verify-web-app-runtime/SKILL.md) skill; the [visual-pr-review](../teams/visual-pr-review.md) team pairs that runtime evidence with static review and design review on frontend PRs.

## Getting WebGL2 at All: SwiftShader/ANGLE Flags

Headless Chromium on a machine without a usable GPU (any typical CI runner, most WSL setups) does not give you WebGL2 by default — `canvas.getContext('webgl2')` returns `null` and everything downstream is moot. Four launch flags route GL through ANGLE onto SwiftShader, Chromium's CPU rasterizer:

```python
ARGS = ["--use-gl=angle", "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
```

| Flag | What it does |
|---|---|
| `--use-gl=angle` | Route GL through the ANGLE translation layer instead of native GL |
| `--use-angle=swiftshader` | Select SwiftShader (CPU software rasterizer) as the ANGLE backend |
| `--enable-unsafe-swiftshader` | Opt in to SwiftShader-backed WebGL — newer Chromium refuses the software fallback without it |
| `--ignore-gpu-blocklist` | Skip the GPU blocklist checks that would otherwise disable WebGL2 |

Keep all four. The failure mode when one is missing is not an error message — it is `webgl2: false` from the capability probe, or a context that exists but lacks the extensions the app needs. SwiftShader is slow (it is a CPU rendering a GPU workload), so give simulations extra settle time before asserting.

### Full Chromium vs chrome-headless-shell

Playwright can drive two different headless binaries, and only one is a valid GPU test surface:

- **Full Chromium** (the default `chromium` browser in current Playwright, running the "new headless" mode) is the complete browser — the same rendering, GPU, and audio stack users get. Use it for anything in this guide.
- **`chrome-headless-shell`** is a trimmed build of the legacy headless mode, kept around because it starts faster. It is fine for DOM-presence checks, text scraping, and PDF printing — workloads where the rendering stack does not matter.

The rule: if the assertion involves the GPU or audio stack — WebGL capability, canvas pixels, `AudioContext` state — run full Chromium. A capability probe against `chrome-headless-shell` tells you about the shell, not about what the app does in a real browser. Reserve the shell for fast DOM-only smoke checks where its startup-time advantage buys you something.

## Probe Capabilities Before Asserting Behavior

Before driving the app, probe what the context can actually do:

```js
// Run via page.evaluate() before interacting with the app:
const gl = document.createElement('canvas').getContext('webgl2');
const capabilities = gl ? {
  webgl2: true,
  halfFloat: !!gl.getExtension('EXT_color_buffer_half_float'), // render to RGBA16F
  fullFloat: !!gl.getExtension('EXT_color_buffer_float'),      // render to RGBA32F
} : { webgl2: false };
```

`webgl2: false` means the launch flags are wrong or the binary is the wrong one — stop and fix the harness; nothing the app does can be assessed.

The extension probes matter because GPGPU techniques (particle simulations, fluid solvers, anything ping-ponging state between textures) need to *render into* floating-point textures, and in WebGL2 that is gated behind `EXT_color_buffer_half_float` (16-bit) or `EXT_color_buffer_float` (32-bit). Here is the trap: **a missing extension does not produce an error — it produces a silent fallback**. A well-written app detects the missing capability and degrades gracefully: a simpler visual, a CPU path, a reduced particle count. Your pixel assertion then passes — against the fallback path, while the GPGPU code the PR actually changed never executed. So the probe result is itself an assertion: if the app's primary path needs half-float and the probe says it is absent, the run must fail (or explicitly report "verified fallback path only"), no matter how good the canvas looks. SwiftShader does support these extensions, so with correct flags the probe should pass on any CI box.

## Prove Pixels, Not Presence

`expect(page.locator('canvas')).toBeVisible()` is satisfied by a black rectangle. The assertion that proves rendering is a **pixel-luminance assertion**: capture the canvas region, measure the fraction of pixels brighter than a threshold, and require a minimum.

The robust capture route is an **element screenshot** — Playwright's `locator("canvas").screenshot()` captures the composited surface, exactly what a user would see:

```python
from PIL import Image

def lit_percentage(png_path, threshold=25):
    """Percentage of pixels brighter than threshold (0-255 grayscale)."""
    image = Image.open(png_path).convert("L")
    pixels = list(image.getdata())
    return sum(1 for value in pixels if value > threshold) / len(pixels) * 100

page.locator("canvas").first.screenshot(path="canvas.png")
assert lit_percentage("canvas.png") >= 1.0, "canvas is effectively black"
```

The in-page alternative — drawing the canvas into a 2D context and reading `getImageData`, or `toDataURL()` — works but carries its own gotcha: a WebGL canvas reads back *blank* unless the context was created with `preserveDrawingBuffer: true` or you read within the same frame the app drew. A blank readback then looks exactly like a broken app. The element-screenshot route sidesteps this entirely because it captures the composited output, not the drawing buffer; prefer it unless you control the app's context-creation options.

Calibrate the threshold against a known-good run, then keep it loose. The reference implementation observed roughly 9% lit pixels for a settled particle scene and asserted `>= 1%` — the assertion's job is to distinguish "rendered" from "black", not to be a golden-image test. Pixel-exact comparisons are brittle across SwiftShader versions; luminance percentage is stable.

## The Black-Canvas Trap: Visibility-Gated requestAnimationFrame

Well-behaved apps pause their render loop when the tab is hidden:

```js
// Common (and correct) app pattern — the trap for the verifier:
function frame() {
  if (!document.hidden) render();
  requestAnimationFrame(frame);
}
```

If the headless page reports `document.visibilityState !== 'visible'` — a backgrounded context, an occluded window, a harness quirk — the app never draws a frame, the canvas is black, and your luminance assertion fails *for a harness reason while pointing at the app*. This is the most misleading failure in the whole workflow because the app code is doing the right thing.

The fix is to assert the precondition explicitly, before and separately from the pixel assertion:

```python
visibility = page.evaluate("() => document.visibilityState")
if visibility != "visible":
    failures.append(f"visibilityState={visibility} - rAF loop is gated, "
                    "black canvas would be a harness artifact")
```

With this in place, a luminance failure is attributable to the app, and a visibility failure is attributable to the harness. Never let the two collapse into one ambiguous "canvas is black".

## HMR Is Not a Valid Test Surface for GPGPU

This is the least obvious gotcha and the one that wastes the most time. Dev servers with hot module replacement (Vite, webpack-dev-server) swap JavaScript modules and shaders in place — but **GPU texture state survives the hot update**. In a GPGPU app, the actual simulation state (particle positions, velocities) lives in ping-pong textures on the GPU, not in the JavaScript that was just replaced. Two failure directions follow:

- **A NaN'd texture looks like broken code.** You make a shader edit with a bug; one frame of NaN output poisons the position texture, and NaN propagates — every subsequent frame stays NaN. You fix the bug, HMR applies the fix, and the canvas is *still black*, because the fixed shader is reading a texture that is already all-NaN. You now debug a fix that is actually correct.
- **Stale good state masks a real break.** The inverse: a change that would fail from a cold start looks fine after a hot update, because the healthy pre-edit texture state carries the visuals.

In both directions the screen shows you the history of the dev session, not the behavior of the current code. The rule: **every verification run starts from a fresh, full page load** — a new browser context and a `page.goto()`, never a reused dev-server tab that has seen edits. HMR remains great for iterating; it is only *verification* that it invalidates.

## Second Context: prefers-reduced-motion

Animation-heavy apps should respect `prefers-reduced-motion` — and that accessibility path is itself a render path that can break. Playwright emulates the media query per context, so run the whole sequence twice:

```python
context = browser.new_context(reduced_motion="reduce")  # vs "no-preference"
```

What to assert in the reduced-motion context: the app should present a *settled, static* rendering — reduced motion means "don't animate", never "draw nothing". The same luminance assertion applies; a black canvas here means the reduced-motion branch bails out before drawing, a bug that no default-context test can see. If the PR claims motion is disabled, you can additionally screenshot twice a second apart and require the frames to be near-identical.

## WebAudio: AudioContext Needs a User Gesture

Browsers keep an `AudioContext` in the `suspended` state until a user gesture, and headless is no exception. The good news: **Playwright's synthesized clicks count as user gestures**, so drive the app's real unlock path — click the actual "enable sound" control — rather than bypassing the policy:

```python
page.get_by_role("button", name="Enable sound").click()
audio_state = page.evaluate("() => window.__audioContext?.state")
if audio_state != "running":
    failures.append(f"AudioContext state={audio_state} after gesture")
```

Two practical notes. First, the assertion needs a handle on the app's context — expose it in dev builds (`window.__audioContext = ctx`) or assert on observable app state instead. Second, Chromium's `--autoplay-policy=no-user-gesture-required` flag can bypass the gesture requirement, but then you have verified a code path no user ever takes; the click route tests the app's real unlock flow, gesture plumbing included.

## Playwright Skeleton

A copy-pasteable skeleton wiring all of the above together. It is deliberately generic — the marked block is where project-specific driving goes. The full, project-specific implementation this distills is at [pjt222/gateway#4](https://github.com/pjt222/gateway/issues/4) (verified against a merged GPGPU particle viz: half-float present, ~9% lit, zero GPGPU console errors).

```python
# verify_runtime.py — headless runtime verification skeleton (CI-friendly).
# Deps: pip install playwright pillow && playwright install chromium
# Full reference implementation: https://github.com/pjt222/gateway/issues/4
import os
import sys
import time

from PIL import Image
from playwright.sync_api import sync_playwright

URL = os.environ.get("APP_URL", "http://localhost:5173/")
OUT = os.environ.get("VERIFY_OUT", "/tmp/verify-runtime")
os.makedirs(OUT, exist_ok=True)

# SwiftShader/ANGLE flags — what makes WebGL2 exist in headless Chromium:
ARGS = ["--use-gl=angle", "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]

CAPABILITY_PROBE = """() => {
  const gl = document.createElement('canvas').getContext('webgl2');
  if (!gl) return { webgl2: false };
  return { webgl2: true,
           halfFloat: !!gl.getExtension('EXT_color_buffer_half_float'),
           fullFloat: !!gl.getExtension('EXT_color_buffer_float') };
}"""


def lit_percentage(png_path, threshold=25):
    image = Image.open(png_path).convert("L")
    pixels = list(image.getdata())
    return sum(1 for value in pixels if value > threshold) / len(pixels) * 100


def run(tag, reduced_motion, console_lines, failures):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, args=ARGS)
        context = browser.new_context(
            viewport={"width": 1280, "height": 900},
            reduced_motion="reduce" if reduced_motion else "no-preference")
        page = context.new_page()
        page.on("console",
                lambda message: console_lines.append(
                    f"[{tag}][{message.type}] {message.text[:200]}"))
        page.on("pageerror",
                lambda error: console_lines.append(f"[{tag}][pageerror] {error}"))

        # Fresh full load — never verify against a hot-reloaded tab (HMR trap):
        page.goto(URL, wait_until="load", timeout=30000)

        capabilities = page.evaluate(CAPABILITY_PROBE)
        if not capabilities.get("webgl2"):
            failures.append(f"{tag}: no WebGL2 context - check launch flags")
        if not capabilities.get("halfFloat"):
            failures.append(f"{tag}: EXT_color_buffer_half_float missing - "
                            "GPGPU path would silently fall back")

        # --- project-specific driving goes here: click into the GPU view, ---
        # --- activate the scene, assert the mode toggle (aria-pressed).   ---
        time.sleep(4)  # SwiftShader is CPU-slow; let the simulation settle

        visibility = page.evaluate("() => document.visibilityState")
        if visibility != "visible":
            failures.append(f"{tag}: visibilityState={visibility} - rAF gated")

        screenshot_path = f"{OUT}/{tag}_canvas.png"
        page.locator("canvas").first.screenshot(path=screenshot_path)
        lit = lit_percentage(screenshot_path)
        if lit < 1.0:
            failures.append(f"{tag}: canvas effectively black (lit={lit:.1f}%)")

        print(f"{tag}: caps={capabilities} visibility={visibility} lit={lit:.1f}%")
        browser.close()


console_lines, failures = [], []
run("norm", reduced_motion=False, console_lines=console_lines, failures=failures)
run("rm", reduced_motion=True, console_lines=console_lines, failures=failures)

suspicious = [line for line in console_lines
              if any(k in line.lower()
                     for k in ("gpgpu", "webgl error", "nan", "fallback"))]
failures.extend(suspicious)

print("FAILURES:", failures or "none")
sys.exit(1 if failures else 0)
```

Exit code is non-zero on any failed assertion, and screenshots land in `VERIFY_OUT` — both make it drop-in for CI. The console scan at the end is a cheap high-yield check: apps that detect fallbacks or NaN states usually say so in the console, and collecting lines throughout the run costs nothing.

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| `webgl2: false` from the probe | Missing SwiftShader/ANGLE launch flags, or driving `chrome-headless-shell` | Add all four flags; run full Chromium for GPU work |
| Canvas lit, but the changed GPGPU code never ran | Missing `EXT_color_buffer_half_float` triggered a silent fallback path | Treat the extension probe as an assertion, not just a log line |
| Luminance ~0 only in CI, fine locally | `visibilityState` not `visible` in the CI harness — the rAF loop is gated | Assert the visibility precondition separately from the pixel assertion |
| In-page `getImageData`/`toDataURL` readback is blank, screenshot is fine | WebGL drawing buffer not preserved after compositing | Use the element-screenshot route, or create the context with `preserveDrawingBuffer: true` |
| Fix verified against the dev server, still broken on fresh load (or vice versa) | HMR preserved GPU texture state across the edit | Verify only from a fresh `page.goto()` in a new context |
| Reduced-motion context shows a black canvas | Reduced-motion branch skips drawing entirely instead of rendering a static pose | Fix the app: reduced motion means no animation, not no render |
| `AudioContext` stays `suspended` | No user gesture before the assertion | Click the app's real audio control (Playwright clicks count as gestures) |
| Pixel assertions flaky | Threshold too tight, or simulation not settled under slow SwiftShader | Loosen to a lit-percentage floor; increase settle time before capture |

## Related Resources

- [verify-web-app-runtime](../skills/verify-web-app-runtime/SKILL.md) -- the companion skill: the step-by-step procedure this guide motivates
- [frontend-runtime-verifier](../agents/frontend-runtime-verifier.md) -- the agent that executes this verification workflow
- [visual-pr-review](../teams/visual-pr-review.md) -- the team pairing runtime verification with static and design review on frontend PRs
- [copilot-review-loop](copilot-review-loop.md) -- the sibling guide from the same PR-verification toolkit
- [running-a-code-review](running-a-code-review.md) -- the static-review counterpart this workflow complements
- [pjt222/gateway#4](https://github.com/pjt222/gateway/issues/4) -- the reference implementation and its validation run
