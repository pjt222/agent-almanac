# Verify Web App Runtime — Extended Examples

Complete invocation recipes for [scripts/verify_runtime.py](../scripts/verify_runtime.py).

## 1. The origin recipe (WebGL2 + GPGPU particle visualizer)

The configuration that reproduces the original verification run this skill
was generalized from: a Vite app served under a base path, with a 3D-view
toggle and a GPGPU "Sand" particle mode driven by half-float position
textures.

`steps.json`:

```json
[
  {"action": "click", "role": "button", "name": "Switch to 3D view", "settle": 2.5},
  {"action": "click", "role": "button", "name": "Sand", "exact": true, "settle": 4},
  {"action": "assert_attr", "role": "button", "name": "Sand", "exact": true,
   "attr": "aria-pressed", "equals": "true"}
]
```

Invocation (dev server already running on `:5173`):

```bash
python3 skills/verify-web-app-runtime/scripts/verify_runtime.py \
    --url http://localhost:5173/gateway/ \
    --steps steps.json \
    --out /tmp/sandviz
```

Healthy output (abridged):

```text
norm: webgl={'webgl2': True, 'halfFloat': True} info={'canvas': True, 'width': 1280, 'height': 900, 'visibility': 'visible'} lit=9.2%
rm: webgl={'webgl2': True, 'halfFloat': True} info={'canvas': True, 'width': 1280, 'height': 900, 'visibility': 'visible'} lit=8.7%
FAILURES: none
```

Notes on the numbers: ~9% lit pixels is a normal reading for a sparse
particle scene — the 1% pass threshold is deliberately far below it, so the
assertion detects "black canvas", not "slightly different scene". The `4`
second settle after entering the particle mode lets the grains fall and pile
before pixels are judged.

## 2. Steps DSL reference

The `--steps` argument accepts a path to a JSON file or inline JSON starting
with `[`. Each step is an object with an `action`:

| Action | Keys | Meaning |
|---|---|---|
| `click` | `role`+`name` (+`exact`) or `selector`; optional `settle` | Click the target, then wait `settle` seconds (default 1.0). Real clicks satisfy the WebAudio user-gesture requirement. |
| `wait` | `seconds` | Sleep without interacting (default 1.0). |
| `assert_attr` | target keys as for `click`, plus `attr`, `equals` | Read an attribute off the target and fail the run if it differs. |

Target resolution: if `role` is present, the target is
`page.get_by_role(role, name=name, exact=exact)` (preferred — survives DOM
refactors); otherwise `selector` is used as `page.locator(selector).first`.

Inline JSON form, useful in CI one-liners:

```bash
python3 skills/verify-web-app-runtime/scripts/verify_runtime.py \
    --url http://localhost:4173/myapp/ \
    --steps '[{"action": "click", "role": "button", "name": "Start", "settle": 3}]'
```

## 3. Variant: canvas app without a GPGPU path

For a plain 2D-canvas or non-GPGPU WebGL app, the half-float requirement is
meaningless — skip it, keep everything else:

```bash
python3 skills/verify-web-app-runtime/scripts/verify_runtime.py \
    --url http://localhost:5173/sketchpad/ \
    --steps '[{"action": "click", "role": "button", "name": "Demo", "settle": 2}]' \
    --skip-half-float \
    --out /tmp/sketchpad-verify
```

The SwiftShader/ANGLE flags stay: plain WebGL1/2 still needs them headlessly,
and they are harmless for 2D contexts.

For an app with no canvas at all (verifying only visibility, interactions,
and console cleanliness):

```bash
python3 skills/verify-web-app-runtime/scripts/verify_runtime.py \
    --url http://localhost:5173/dashboard/ \
    --steps steps.json \
    --skip-half-float --no-canvas --skip-still-check
```

## 4. Variant: audio-reactive surface

`AudioContext` starts suspended until a user gesture. Make the gesture an
explicit step, give the graph a moment, then assert the app reflected the
running state in its UI:

```json
[
  {"action": "click", "role": "button", "name": "Play", "settle": 2},
  {"action": "assert_attr", "role": "button", "name": "Play",
   "attr": "aria-pressed", "equals": "true"},
  {"action": "wait", "seconds": 2}
]
```

If the app exposes no ARIA state for playback, add a `selector`-based
`assert_attr` on whatever DOM state it does maintain (e.g. a `data-playing`
attribute on the visualizer container).

## 5. CI integration (GitHub Actions)

A runtime gate that builds the app, serves the production preview, and fails
the job on any assertion:

```yaml
jobs:
  verify-runtime:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: npm ci && npm run build
      - run: pip install playwright pillow && python -m playwright install chromium
      - name: Serve preview
        run: npm run preview -- --port 4173 &
      - name: Verify runtime
        run: |
          python3 skills/verify-web-app-runtime/scripts/verify_runtime.py \
            --url http://localhost:4173/myapp/ \
            --steps .github/verify-steps.json \
            --out verify-out
      - name: Upload evidence
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: verify-runtime-evidence
          path: verify-out/
```

Uploading `verify-out/` on failure is the payoff: the screenshots and
`report.json` show *what* the headless browser saw, which turns a red CI run
into a one-glance diagnosis.

## 6. Porting to Node / @playwright/test

The durable parts are the flags, probes, and assertions — not the language.
A JS port keeps them verbatim:

```javascript
const CHROMIUM_ARGS = [
  "--use-gl=angle",
  "--use-angle=swiftshader",
  "--enable-unsafe-swiftshader",
  "--ignore-gpu-blocklist",
];

const webgl = await page.evaluate(() => {
  const gl = document.createElement("canvas").getContext("webgl2");
  return gl
    ? { webgl2: true, halfFloat: !!gl.getExtension("EXT_color_buffer_half_float") }
    : { webgl2: false };
});
```

For the luminance assertion in Node, decode the canvas screenshot with
`pngjs` and apply the same rule: fail unless more than 1% of pixels exceed
grayscale 25. Keep the two-context structure (normal + `reducedMotion:
'reduce'`) and the fresh-launch-per-context discipline — HMR and reused pages
remain invalid test surfaces in any language.
