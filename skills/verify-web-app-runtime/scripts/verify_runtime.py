#!/usr/bin/env python3
"""Headless runtime verification of a web app (WebGL / GPGPU / Canvas / WebAudio).

Generalized from the working verifier for a WebGL2+GPGPU particle visualizer
(pjt222/gateway#4). The script:

  * launches headless Chromium with the SwiftShader/ANGLE flags WebGL2 needs
    (--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader
     --ignore-gpu-blocklist);
  * probes the EXT_color_buffer_half_float extension before trusting a GPGPU
    path (without it, apps typically fall back silently);
  * drives configurable interaction steps -- real Playwright clicks double as
    the user gesture WebAudio's AudioContext requires;
  * asserts document.visibilityState === 'visible' (rAF render loops are often
    gated on document.hidden and produce a black canvas otherwise);
  * screenshots the canvas and asserts non-black luminance (>1% of pixels lit
    by default) -- a present canvas can still be empty;
  * scans console/pageerror output for GPU error signals;
  * repeats everything in a second reduced_motion: reduce context and checks
    the settled pose is still.

Every context is a fresh browser launch and a fresh page load: HMR does not
reset GPGPU textures, so a hot-reloaded tab is never a valid test surface.

Usage:
    python3 verify_runtime.py --url http://localhost:5173/myapp/ \
        --steps steps.json --out /tmp/verify-out

Dependencies:
    pip install playwright pillow
    python -m playwright install chromium

Exits 0 when all assertions pass, 1 otherwise (CI-friendly). Screenshots,
console.log, and report.json are written to the output directory.
"""

import argparse
import json
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops

# SwiftShader/ANGLE flags are what make WebGL2 work in headless Chromium:
CHROMIUM_ARGS = [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
]

# Half-float probe -- if halfFloat is false, a GPGPU app may silently fall back:
HALF_FLOAT_PROBE = """() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    return gl ? {webgl2: true, halfFloat: !!gl.getExtension('EXT_color_buffer_half_float')}
              : {webgl2: false};
}"""

# rAF loops are often gated on document.hidden -- so the page must be visible:
PAGE_INFO = """() => {
    const canvas = document.querySelector('canvas');
    return {canvas: !!canvas,
            width: canvas ? canvas.width : 0,
            height: canvas ? canvas.height : 0,
            visibility: document.visibilityState};
}"""

# Console lines matching any of these (case-insensitive) count as failures:
DEFAULT_CONSOLE_ERROR_KEYWORDS = ["gpgpu", "webgl error", "nan", "fallback"]


def parse_args():
    parser = argparse.ArgumentParser(
        description="Headless runtime verification of a web app "
                    "(WebGL/GPGPU/Canvas/WebAudio)."
    )
    parser.add_argument("--url", required=True,
                        help="URL of the running app, including any base path "
                             "(e.g. http://localhost:5173/myapp/)")
    parser.add_argument("--steps", default=None,
                        help="Interaction steps: path to a JSON file, or inline "
                             "JSON starting with '['. Actions: click, wait, "
                             "assert_attr. See the skill's EXAMPLES.md.")
    parser.add_argument("--out", default="verify-runtime-out",
                        help="Output directory for screenshots and reports "
                             "(default: ./verify-runtime-out)")
    parser.add_argument("--viewport", default="1280x900",
                        help="Viewport as WIDTHxHEIGHT (default: 1280x900)")
    parser.add_argument("--settle", type=float, default=2.5,
                        help="Seconds to wait after page load before probing "
                             "(default: 2.5)")
    parser.add_argument("--timeout", type=float, default=30.0,
                        help="Page load timeout in seconds (default: 30)")
    parser.add_argument("--luminance-threshold", type=int, default=25,
                        help="Grayscale value (0-255) above which a pixel "
                             "counts as lit (default: 25)")
    parser.add_argument("--lit-percent-min", type=float, default=1.0,
                        help="Minimum percentage of lit canvas pixels required "
                             "to pass (default: 1.0)")
    parser.add_argument("--skip-half-float", action="store_true",
                        help="Do not require EXT_color_buffer_half_float "
                             "(for apps without a GPGPU path)")
    parser.add_argument("--no-canvas", action="store_true",
                        help="Do not require a <canvas> element or the "
                             "luminance assertion")
    parser.add_argument("--skip-reduced-motion", action="store_true",
                        help="Skip the second reduced_motion: reduce context")
    parser.add_argument("--skip-still-check", action="store_true",
                        help="Skip the stillness diff in the reduced-motion "
                             "context")
    parser.add_argument("--still-check-delay", type=float, default=1.0,
                        help="Seconds between the two reduced-motion canvas "
                             "screenshots (default: 1.0)")
    parser.add_argument("--still-max-changed-percent", type=float, default=2.0,
                        help="Maximum percentage of pixels allowed to change "
                             "between reduced-motion screenshots (default: 2.0)")
    parser.add_argument("--console-error-keyword", action="append", default=None,
                        help="Console keyword treated as a failure; repeatable. "
                             "Defaults: " + ", ".join(DEFAULT_CONSOLE_ERROR_KEYWORDS))
    return parser.parse_args()


def load_steps(steps_argument):
    """Load interaction steps from a JSON file path or an inline JSON array."""
    if not steps_argument:
        return []
    text = steps_argument.strip()
    if not text.startswith("["):
        text = Path(steps_argument).read_text(encoding="utf-8")
    steps = json.loads(text)
    if not isinstance(steps, list):
        raise SystemExit("--steps must resolve to a JSON array of step objects")
    return steps


def locator_for_step(page, step):
    """Resolve a step's target: ARIA role+name preferred, CSS selector fallback."""
    if "role" in step:
        return page.get_by_role(step["role"], name=step.get("name"),
                                exact=bool(step.get("exact", False)))
    if "selector" in step:
        return page.locator(step["selector"]).first
    raise ValueError(f"step needs a 'role' or a 'selector': {step}")


def run_steps(page, steps, tag, failures):
    """Execute the interaction steps against a live page."""
    for index, step in enumerate(steps):
        action = step.get("action")
        if action == "wait":
            time.sleep(float(step.get("seconds", 1.0)))
        elif action == "click":
            # A real Playwright click counts as the user gesture that
            # AudioContext (WebAudio) requires to start:
            locator_for_step(page, step).click()
            time.sleep(float(step.get("settle", 1.0)))
        elif action == "assert_attr":
            actual_value = locator_for_step(page, step).get_attribute(step["attr"])
            expected_value = step.get("equals")
            if actual_value != expected_value:
                failures.append(
                    f"{tag}: step {index} expected {step['attr']}="
                    f"{expected_value!r}, got {actual_value!r}")
        else:
            raise ValueError(f"unknown step action {action!r} at index {index}")


def lit_percent(image_path, threshold):
    """Percentage of grayscale pixels brighter than the threshold."""
    grayscale = Image.open(image_path).convert("L")
    histogram = grayscale.histogram()
    total_pixels = grayscale.size[0] * grayscale.size[1]
    return sum(histogram[threshold + 1:]) / total_pixels * 100


def changed_pixel_percent(first_path, second_path, per_pixel_delta=10):
    """Percentage of pixels that differ between two same-size screenshots."""
    first = Image.open(first_path).convert("L")
    second = Image.open(second_path).convert("L")
    if first.size != second.size:
        return 100.0
    difference_histogram = ImageChops.difference(first, second).histogram()
    total_pixels = first.size[0] * first.size[1]
    return sum(difference_histogram[per_pixel_delta + 1:]) / total_pixels * 100


def run_context(cli, steps, out_dir, reduced, tag, logs, failures):
    """One fresh browser launch + fresh page load (HMR is not a valid surface)."""
    width, height = (int(value) for value in cli.viewport.lower().split("x"))
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, args=CHROMIUM_ARGS)
        context = browser.new_context(
            viewport={"width": width, "height": height},
            reduced_motion=("reduce" if reduced else "no-preference"),
        )
        page = context.new_page()
        page.on("console",
                lambda message: logs.append(f"[{tag}][{message.type}] {message.text[:200]}"))
        page.on("pageerror",
                lambda error: logs.append(f"[{tag}][pageerror] {error}"))
        page.goto(cli.url, wait_until="load", timeout=cli.timeout * 1000)
        time.sleep(cli.settle)

        # Probe WebGL2 + EXT_color_buffer_half_float before trusting GPGPU:
        webgl = page.evaluate(HALF_FLOAT_PROBE)

        try:
            run_steps(page, steps, tag, failures)
        except Exception as error:  # a failed step invalidates the rest of this context
            failures.append(f"{tag}: interaction step failed: {error}")

        info = page.evaluate(PAGE_INFO)
        page.screenshot(path=str(out_dir / f"{tag}_page.png"))
        canvas_path = None
        still_delta = None
        if info.get("canvas"):
            canvas_path = out_dir / f"{tag}_canvas.png"
            page.locator("canvas").first.screenshot(path=str(canvas_path))
            if reduced and not cli.skip_still_check:
                # reduced_motion: reduce must show a settled, still pose --
                # two screenshots a moment apart should be near-identical:
                time.sleep(cli.still_check_delay)
                second_path = out_dir / f"{tag}_canvas_still.png"
                page.locator("canvas").first.screenshot(path=str(second_path))
                still_delta = changed_pixel_percent(canvas_path, second_path)
        browser.close()
    return {
        "tag": tag,
        "reduced_motion": reduced,
        "webgl": webgl,
        "info": info,
        "canvas_screenshot": str(canvas_path) if canvas_path else None,
        "still_changed_percent": still_delta,
    }


def assert_results(cli, results, failures):
    """Apply the runtime assertions to each context's collected evidence."""
    for result in results:
        tag = result["tag"]
        webgl = result["webgl"]
        info = result["info"]
        if not cli.skip_half_float:
            if not webgl.get("webgl2"):
                failures.append(
                    f"{tag}: no WebGL2 context (check the SwiftShader/ANGLE "
                    f"launch flags)")
            elif not webgl.get("halfFloat"):
                failures.append(
                    f"{tag}: no EXT_color_buffer_half_float (a GPGPU path "
                    f"would silently fall back)")
        if info.get("visibility") != "visible":
            failures.append(
                f"{tag}: page not visible (visibilityState="
                f"{info.get('visibility')!r}) -- rAF loops gated on "
                f"document.hidden never draw")
        if not cli.no_canvas:
            if not info.get("canvas"):
                failures.append(f"{tag}: no <canvas> element found")
            elif result["canvas_screenshot"]:
                lit = lit_percent(result["canvas_screenshot"],
                                  cli.luminance_threshold)
                result["lit_percent"] = round(lit, 2)
                if lit < cli.lit_percent_min:
                    failures.append(
                        f"{tag}: canvas effectively black "
                        f"(lit={lit:.1f}% < {cli.lit_percent_min}%)")
        still_delta = result.get("still_changed_percent")
        if still_delta is not None and still_delta > cli.still_max_changed_percent:
            failures.append(
                f"{tag}: reduced-motion pose not still "
                f"({still_delta:.1f}% of pixels changed > "
                f"{cli.still_max_changed_percent}%)")


def main():
    cli = parse_args()
    out_dir = Path(cli.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    steps = load_steps(cli.steps)
    keywords = [keyword.lower() for keyword in
                (cli.console_error_keyword or DEFAULT_CONSOLE_ERROR_KEYWORDS)]

    logs, failures, results = [], [], []
    contexts = [(False, "norm")]
    if not cli.skip_reduced_motion:
        contexts.append((True, "rm"))
    for reduced, tag in contexts:
        results.append(run_context(cli, steps, out_dir, reduced, tag,
                                   logs, failures))

    assert_results(cli, results, failures)

    console_hits = [line for line in logs
                    if any(keyword in line.lower() for keyword in keywords)]
    failures.extend(console_hits)

    (out_dir / "console.log").write_text("\n".join(logs) + "\n",
                                         encoding="utf-8")
    report = {"url": cli.url, "results": results, "failures": failures}
    (out_dir / "report.json").write_text(json.dumps(report, indent=2),
                                         encoding="utf-8")

    for result in results:
        print(f"{result['tag']}: webgl={result['webgl']} "
              f"info={result['info']} lit={result.get('lit_percent', 'n/a')}%")
    print("FAILURES:", failures or "none")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
