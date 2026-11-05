#!/usr/bin/env python3
"""
Compare a base and a new build of the viz page in a headless browser, view by view, for a
dependency bump in viz/ (Dependabot or by hand), and say which version of each moved library ran.

    python3 tools/viz-runtime-check.py --base <worktree> --new <worktree> --out <dir>
    python3 tools/viz-runtime-check.py --base <worktree> --new <worktree> --out <dir> --patch
    python3 tools/viz-runtime-check.py --base <worktree> --new <worktree> --out <dir> --views 2d,3d
    python3 tools/viz-runtime-check.py --verify

Run it WITHOUT -I. Playwright lives in the user's site-packages, and -I hides it. The static
servers it starts run WITH -I, `python3 -I -m http.server`.

Exit 0 PASS, 1 FAIL, 2 no verdict. No verdict covers four cases: a refusal, a control row the
instrument failed, a view one build could not draw, and nothing to check because no package the
page loads moved.

WHAT THE CALLER BUILDS
----------------------
Two worktrees, each with `viz/dist` built and `viz/node_modules` and `viz/package-lock.json` in
place. The NEW tree has the PR merged. The BASE tree is `origin/main` WITHOUT the PR. A base that
also merged the PR equals new, and the control rows then confirm nothing; the tool refuses two
byte-identical `dist/` trees for that reason. Building stays outside the tool: the Dependabot
procedure's step 2 builds new, and step 3's first bullet builds the base.

WHAT IT DOES, IDENTICALLY FOR BOTH BUILDS
-----------------------------------------
1. It diffs the two lockfiles and lists every package that moved. A moved package enters each
   view whose dependency closure contains it. The closures are computed from both lockfiles with
   Node's lookup, starting at each view's own imports (VIEW_ROOTS below). Anything in vite's
   closure enters every view, because vite builds every chunk. A runtime package in no closure
   enters every view too. With only dev-only packages moving outside vite's closure, there is
   nothing in the page to check, and it exits 2.
2. It serves each `dist/` the way GitHub Pages does, a plain static server under
   `/agent-almanac/`, where a missing file is a real 404. It never uses `vite preview`, whose SPA
   fallback answers a missing file with `200 text/html`. A probe of a missing asset must read
   404 before anything is measured.
3. Control rows, in the same page and through the same screenshot path: a one-colour canvas
   must read NOT drawn, and a noise canvas must read drawn. If either is wrong, the instrument
   is wrong, and the verdict is 2.
4. It loads the page and enters each selected view by its button. In each view it records:
   - console errors and page errors;
   - responses of 400 and above, failed requests and dialogs;
   - a screenshot of `#graph-container`, judged drawn or blank.
5. It reads what executed: `window.__THREE__` after 3D, and mermaid's own `info` diagram through
   `window.__mermaid` after the workflow view. Each read must equal the version that tree has
   installed.
6. For every other moved package it makes the fingerprint read. It takes a string literal that
   only new's ESM entry carries, and looks for it in the chunks new's page fetched, and for its
   absence in base's chunks. If no literal survives the build, it falls back to the version each
   tree's node_modules holds plus the fetched chunk names that differ. That read is weaker, and it
   says so. The fingerprint read is evidence of what was bundled, reported in the output and in
   summary.json. It is not a pass condition: a literal can be tree-shaken away legitimately, so
   its absence cannot be a FAIL.

THE VERDICT
-----------
FAIL when, in any entered view:
- new shows an error, a status of 400 or above or a dialog that base does not;
- new draws nothing where base drew;
- an executed read differs from the installed version, or new gave none where base did.

Precedence:
- A failed control row makes the whole run NO VERDICT (exit 2), whatever else was found, because
  the instrument behind drawn-or-blank is wrong.
- Otherwise any FAIL gives exit 1, even beside a no-verdict item.
- A view base could not draw is a no-verdict item, so new drawing nothing there is not a FAIL.
- An exception inside the tool is exit 2 with its traceback, never exit 1.

The comparison is base-relative, never against zero: the page already has icon 404s (#743).
URLs are compared without host, port or the bundle hash, because the two servers listen on
different ports and the hashes differ by construction. A failed request whose failure is
`net::ERR_ABORTED` is recorded but not compared: switching views cancels loads, and that timing
differs between runs.

--patch, THE LIGHTER CHECK (proposed for the maintainer's "take patches, lighter check")
-----------------------------------------------------------------------------------------
- It skips the literal hunt and goes straight to installed versions plus chunk names.
- It keeps everything else: the control rows, the same views (a vite bump, patch or not, enters
  all six, since vite rebuilds every chunk and a merge deploys straight to the live page), the
  three comparisons per view and the executed reads.
- So it saves little time; the browser run dominates either way. The full check is already
  lighter than rt1039.py was: no drag, wheel, fps, hover or click battery.

NOT IN SCOPE
------------
- The js-yaml check, which is a `skills.json` diff and not a page check.
- Building.
- The rule that a failure seen only under SwiftShader blocks only once it reproduces on a
  hardware GPU. This tool runs Chromium headless under SwiftShader, so a FAIL that names WebGL or
  the 3D view is a lead for that hardware-GPU route, not yet a block.

Origin: the base-vs-new scripts typed three times (rt2.py for #964, rt3.py, rt1039.py for #1039),
promoted on the maintainer's decision of 2026-11-05. The spec is the handoff's Dependabot
procedure, step 3.
"""
import argparse
import hashlib
import json
import os
import re
import signal
import socket
import struct
import subprocess
import sys
import time
import traceback
import urllib.error
import urllib.request
import zlib
from pathlib import Path

PROG = 'python3 tools/viz-runtime-check.py'
ALL_VIEWS = ['2d', '3d', 'campfire', 'chord', 'hive', 'workflow']
BUTTON = {'2d': 'btn-2d', '3d': 'btn-3d', 'campfire': 'btn-campfire', 'chord': 'btn-chord',
          'hive': 'btn-hive', 'workflow': 'btn-flow'}
# The bare imports of each view's module (viz/js/graph.js, graph3d.js, campfire.js, chord.js,
# hive.js, workflow.js). A moved package enters a view when it is in the dependency closure of
# that view's roots, computed from the lockfile with Node's lookup. graph.js is imported by app.js
# itself, so force-graph also loads with the page; the load phase is compared in every run.
VIEW_ROOTS = {'2d': ['force-graph'], '3d': ['3d-force-graph', 'three'], 'campfire': ['d3'],
              'chord': ['d3'], 'hive': ['d3'], 'workflow': ['mermaid']}
BUILD_ROOTS = ['vite']  # builds every chunk: anything in its closure enters every view
CHROMIUM_ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
                 '--ignore-gpu-blocklist']
NAV_TIMEOUT_MS = 180000
VIEW_TIMEOUT_MS = 120000  # for a view switch to finish: its button selected and the loading overlay hidden
SETTLE_MS = {'2d': 4000, '3d': 4500, 'campfire': 4000, 'chord': 4000, 'hive': 4000, 'workflow': 5000}
# Everything viz/css/style.css positions over #graph-container that is not the drawing: the header,
# the panels and their toggles and backdrops, the loading overlay, the first-visit hint, the tooltip,
# the locale notice, three-render-objects' 3D nav info, and the CRT scanline layer. Hidden while each
# view is photographed, so only the drawing can make the crop read drawn (#1046 round 1, B1).
OVERLAY_CSS = ('.header, .header-drawer, .header-drawer-backdrop, .panel-toggle, .filter-panel, .filter-backdrop, '
               '.detail-panel, #loading, .first-visit-hint, .tooltip, .locale-notice, .scene-nav-info '
               '{ visibility: hidden !important; } body::after { display: none !important; }')
# The empty control: the same crop with the view itself hidden too. It must read NOT drawn, or the
# crop holds something other than the view and blank-or-not means nothing for that view.
EMPTY_VIEW_CSS = OVERLAY_CSS + ' #graph-container * { visibility: hidden !important; }'


class Refused(Exception):
    """A precondition does not hold; no verdict is reached (exit 2)."""


# ---------- PNG decoding, standard library only ----------

def _paeth(a, b, c):
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    return b if pb <= pc else c


def decode_png(data):
    """Return (width, height, channels, rows) for an 8-bit, non-interlaced RGB or RGBA PNG."""
    if data[:8] != b'\x89PNG\r\n\x1a\n':
        raise ValueError('not a PNG (bad signature)')
    pos, header, idat = 8, None, []
    while pos + 8 <= len(data):
        (length,) = struct.unpack('>I', data[pos:pos + 4])
        kind, body = data[pos + 4:pos + 8], data[pos + 8:pos + 8 + length]
        pos += 12 + length
        if kind == b'IHDR':
            header = struct.unpack('>IIBBBBB', body)
        elif kind == b'IDAT':
            idat.append(body)
        elif kind == b'IEND':
            break
    if header is None:
        raise ValueError('not a PNG (no IHDR)')
    width, height, depth, colour, _, _, interlace = header
    if depth != 8 or colour not in (2, 6) or interlace != 0:
        raise ValueError(f'unsupported PNG: bit depth {depth}, colour type {colour}, interlace {interlace}')
    channels = 3 if colour == 2 else 4
    raw = zlib.decompress(b''.join(idat))
    stride = width * channels
    if len(raw) != height * (stride + 1):
        raise ValueError('PNG data size does not match its header')
    rows, prev = [], bytearray(stride)
    for y in range(height):
        start = y * (stride + 1)
        kind, line = raw[start], bytearray(raw[start + 1:start + 1 + stride])
        if kind == 1:
            for i in range(channels, stride):
                line[i] = (line[i] + line[i - channels]) & 255
        elif kind == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 255
        elif kind == 3:
            for i in range(stride):
                left = line[i - channels] if i >= channels else 0
                line[i] = (line[i] + ((left + prev[i]) >> 1)) & 255
        elif kind == 4:
            for i in range(stride):
                left = line[i - channels] if i >= channels else 0
                upleft = prev[i - channels] if i >= channels else 0
                line[i] = (line[i] + _paeth(left, prev[i], upleft)) & 255
        elif kind != 0:
            raise ValueError(f'unknown PNG filter type {kind} on row {y}')
        rows.append(line)
        prev = line
    return width, height, channels, rows


def image_stats(png, step=2):
    """Luminance standard deviation and distinct-colour count, sampling every `step`-th pixel."""
    width, height, channels, rows = decode_png(png)
    total = total_sq = count = 0
    colours = set()
    for y in range(0, height, step):
        line = rows[y]
        for x in range(0, width, step):
            i = x * channels
            r, g, b = line[i], line[i + 1], line[i + 2]
            lum = (299 * r + 587 * g + 114 * b) / 1000
            total += lum
            total_sq += lum * lum
            count += 1
            colours.add((r << 16) | (g << 8) | b)
    mean = total / count if count else 0.0
    variance = max(total_sq / count - mean * mean, 0.0) if count else 0.0
    return {'w': width, 'h': height, 'stddev': round(variance ** 0.5, 2), 'colours': len(colours)}


def drawn(stats):
    """The predicate rt1039.py used: real content has spread AND more than a handful of colours."""
    return bool(stats) and stats['stddev'] > 2 and stats['colours'] > 50


# ---------- lockfiles, view selection ----------

def lock_packages(lock):
    """Map each installed path (node_modules/a, node_modules/a/node_modules/b) to name, version, dev."""
    out = {}
    for key, meta in (lock.get('packages') or {}).items():
        if not key.startswith('node_modules/'):
            continue
        name = key.rsplit('node_modules/', 1)[1]
        out[key] = {'name': name, 'version': meta.get('version'), 'dev': bool(meta.get('dev'))}
    return out


def moved_packages(base_lock, new_lock):
    """Every installed path whose version differs, or which exists in only one of the two lockfiles."""
    base, new = lock_packages(base_lock), lock_packages(new_lock)
    moved = []
    for key in sorted(set(base) | set(new)):
        b, n = base.get(key), new.get(key)
        if b and n and b['version'] == n['version']:
            continue
        meta = n or b
        moved.append({'path': key, 'name': meta['name'], 'base': b and b['version'],
                      'new': n and n['version'], 'dev': bool((b or {}).get('dev', True) and (n or {}).get('dev', True))})
    return moved


def resolve(packages, from_path, name):
    """Node's lookup in a lockfile's packages map: <from>/node_modules/<name>, each ancestor's, the root's."""
    base = from_path
    while True:
        candidate = f'{base}/node_modules/{name}' if base else f'node_modules/{name}'
        if candidate in packages:
            return candidate
        if not base:
            return None
        cut = base.rfind('/node_modules/')
        base = base[:cut] if cut >= 0 else ''


def closure(packages, roots):
    """Every installed path reachable from the roots through dependencies, optional and peer dependencies."""
    seen, todo = set(), [p for p in (resolve(packages, '', r) for r in roots) if p]
    while todo:
        path = todo.pop()
        if path in seen:
            continue
        seen.add(path)
        meta = packages.get(path) or {}
        for field in ('dependencies', 'optionalDependencies', 'peerDependencies'):
            for dep in meta.get(field) or {}:
                found = resolve(packages, path, dep)
                if found and found not in seen:
                    todo.append(found)
    return seen


def view_closures(*locks):
    """{view: paths} and the build closure, each the union over the given lockfiles."""
    views, build = {v: set() for v in ALL_VIEWS}, set()
    for lock in locks:
        packages = lock.get('packages') or {}
        for view, roots in VIEW_ROOTS.items():
            views[view] |= closure(packages, roots)
        build |= closure(packages, BUILD_ROOTS)
    return views, build


def views_for(pkg, closures):
    """(views, reason) for one moved package, from the view closures of both lockfiles."""
    views, build = closures
    if pkg['path'] in build:
        return list(ALL_VIEWS), "in vite's dependency closure; vite builds every chunk, so every view, under --patch too"
    hit = [v for v in ALL_VIEWS if pkg['path'] in views[v]]
    if hit:
        roots = sorted({r for v in hit for r in VIEW_ROOTS[v]})
        return hit, 'in the dependency closure of ' + ', '.join(roots)
    if pkg['dev']:
        return [], "dev-only and outside vite's closure, not in the page"
    return list(ALL_VIEWS), "a runtime package in no view's closure: every view"


def select_views(moved, closures, override=None):
    """Return (ordered views, {view: [reasons]})."""
    reasons = {}
    for pkg in moved:
        views, why = views_for(pkg, closures)
        for view in views:
            reasons.setdefault(view, []).append(f"{pkg['path']} {pkg['base']} -> {pkg['new']}: {why}")
    # --views only ADDS (#1046 round 1, S4): replacing the selection let a run skip a view a moved
    # package loads and still report PASS.
    for view in override or []:
        reasons.setdefault(view, []).append('added by --views')
    return [v for v in ALL_VIEWS if v in reasons], reasons


# ---------- comparison ----------

_ORIGIN = re.compile(r'https?://(?:127\.0\.0\.1|localhost|\[::1\]):\d+')
_HASH = re.compile(r'-[A-Za-z0-9_-]{6,12}(\.(?:m?js|css))\b')


def normalise(text):
    """Strip host, port and the bundle hash, which differ between the two builds by construction."""
    return _HASH.sub(r'-<hash>\1', _ORIGIN.sub('', text))


def view_signature(events):
    """The comparable sets for one view: errors, and responses or failures that are not 2xx/3xx."""
    errors, non_ok, ignored, warnings = set(), set(), [], set()
    for e in events:
        if e['kind'] == 'console' and e['type'] == 'error':
            errors.add('console: ' + normalise(e['text']))
        elif e['kind'] == 'console' and e['type'] == 'warning':
            warnings.add('warning: ' + normalise(e['text']))
        elif e['kind'] == 'pageerror':
            errors.add('pageerror: ' + normalise(e['text']))
        elif e['kind'] == 'dialog':
            errors.add('dialog: ' + normalise(e['text']))
        elif e['kind'] == 'response' and e['status'] >= 400:
            non_ok.add(f"{e['status']} {normalise(e['url'])}")
        elif e['kind'] == 'requestfailed':
            if 'ERR_ABORTED' in (e.get('failure') or ''):
                ignored.append(normalise(e['url']))
            else:
                non_ok.add(f"failed {normalise(e['url'])} {e.get('failure')}")
    return {'errors': errors, 'non_ok': non_ok, 'aborted_ignored': ignored, 'warnings': warnings}


def three_revision(version):
    """three 0.187.0 sets window.__THREE__ to '187'."""
    match = re.fullmatch(r'0\.(\d+)\.\d+(?:[-+].*)?', version or '')
    return match.group(1) if match else None


def mermaid_version(svg):
    match = re.search(r'\bv(\d+\.\d+\.\d+[0-9A-Za-z.+-]*)', svg or '')
    return match.group(1) if match else None


def verdict(views, runs, reads):
    """runs[label][view] -> {'sig', 'stats', 'drawn'}; reads[label] -> list of executed reads."""
    fails, no_verdict = [], []
    instrument_broken = False
    for label in ('base', 'new'):
        if not runs[label].get('_control_ok'):
            instrument_broken = True
            no_verdict.append(f'{label}: the control rows failed, so the drawn/blank instrument is wrong')
    for view in ['load'] + views:
        b, n = runs['base'].get(view), runs['new'].get(view)
        if b is None or n is None:
            no_verdict.append(f'{view}: not measured in both builds')
            continue
        if view != 'load' and (b.get('empty_drawn') or n.get('empty_drawn')):
            no_verdict.append(f'{view}: with the view hidden the crop still reads drawn, so blank-or-not '
                              f"means nothing here (empty control: base {b.get('empty_stats')}, new {n.get('empty_stats')})")
        elif view != 'load':
            if not b['drawn']:
                no_verdict.append(f'{view}: base drew nothing, so blank-or-not cannot be compared'
                                  + (f" ({b['harness_error']})" if b.get('harness_error') else ''))
            elif not n['drawn']:
                fails.append(f'{view}: new drew nothing (stats {n["stats"]})'
                             + (f" ({n['harness_error']})" if n.get('harness_error') else ''))
        if b.get('three_instances') is not None and n.get('three_instances') is not None \
                and n['three_instances'] > b['three_instances']:
            fails.append(f"{view}: new runs {n['three_instances']} copies of three, base {b['three_instances']}")
        for key, what in (('errors', 'error'), ('non_ok', 'non-2xx response or failed request')):
            extra = sorted(n['sig'][key] - b['sig'][key])
            if extra:
                fails.append(f'{view}: new shows {len(extra)} {what}(s) base does not: {extra[:5]}')
    for package in sorted({r['package'] for label in reads for r in reads[label]}):
        b = next((r for r in reads['base'] if r['package'] == package), None)
        n = next((r for r in reads['new'] if r['package'] == package), None)
        for label, read in (('base', b), ('new', n)):
            if read and read['ran'] is not None and read['ran'] != read['installed']:
                where = fails if label == 'new' else no_verdict
                where.append(f"{label}: {package} ran {read['ran']} but {read['installed']} is installed")
        # A read that returned nothing is not a pass (#1046 round 1, B2): the library may never have run.
        if n and n['ran'] is None and b and b['ran'] is not None:
            fails.append(f"new: {package} gave no executed read, though base read {b['ran']}")
        elif (n and n['ran'] is None) or (b and b['ran'] is None):
            no_verdict.append(f"{package}: no executed read (base {b and b['ran']}, new {n and n['ran']})")
    code = 2 if instrument_broken else (1 if fails else (2 if no_verdict else 0))
    return code, fails, no_verdict


# ---------- fingerprint read ----------

_LITERAL = re.compile(r'"([^"\\\n]{12,160})"|\'([^\'\\\n]{12,160})\'')


def esm_entry(pkg_dir):
    """The file a bundler would take for `import 'pkg'`: exports['.'] (import/module/default), module, main."""
    try:
        meta = json.loads((pkg_dir / 'package.json').read_text())
    except (OSError, ValueError):
        return None
    candidates = []
    exports = meta.get('exports')
    dot = exports.get('.', exports) if isinstance(exports, dict) else exports
    if isinstance(dot, str):
        candidates.append(dot)
    elif isinstance(dot, dict):
        for key in ('import', 'module', 'browser', 'default'):
            value = dot.get(key)
            if isinstance(value, dict):
                value = value.get('default')
            if isinstance(value, str):
                candidates.append(value)
    for key in ('module', 'main'):
        if isinstance(meta.get(key), str):
            candidates.append(meta[key])
    for rel in candidates:
        path = (pkg_dir / rel).resolve()
        if path.is_file():
            return path
    return None


def literals(text):
    return {m.group(1) or m.group(2) for m in _LITERAL.finditer(text)}


def pick_fingerprint(base_entry_text, new_entry_text, base_chunks_text, new_chunks_text):
    """The longest literal only new's entry carries that is in new's chunks and absent from base's."""
    for lit in sorted(literals(new_entry_text) - literals(base_entry_text), key=lambda s: (-len(s), s)):
        if lit in new_chunks_text and lit not in base_chunks_text:
            return lit
    return None


# ---------- inputs ----------

def tree_inputs(root):
    root = Path(root).resolve()
    dist, lock, modules = root / 'viz' / 'dist', root / 'viz' / 'package-lock.json', root / 'viz' / 'node_modules'
    for path, what in ((dist / 'index.html', 'a built viz/dist'), (lock, 'viz/package-lock.json'),
                       (modules, 'viz/node_modules')):
        if not path.exists():
            raise Refused(f'{root}: no {what} ({path})')
    return {'root': root, 'dist': dist, 'lock': json.loads(lock.read_text()), 'modules': modules}


def tree_digest(dist):
    """index.html plus the built assets/: what a dependency bump can change (public/ is copied as is)."""
    digest = hashlib.sha256()
    files = [dist / 'index.html'] + sorted(p for p in (dist / 'assets').rglob('*') if p.is_file())
    for path in files:
        digest.update(str(path.relative_to(dist)).encode() + b'\0' + path.read_bytes() + b'\0')
    return digest.hexdigest()


def installed_version(modules, name):
    try:
        return json.loads((modules / name / 'package.json').read_text()).get('version')
    except (OSError, ValueError):
        return None


def installed_at(tree, path):
    """The version node_modules holds at a lockfile path (node_modules/a/node_modules/b), not the lockfile's."""
    try:
        return json.loads((tree['modules'].parent / path / 'package.json').read_text()).get('version')
    except (OSError, ValueError):
        return None


# ---------- the browser run ----------

def free_port():
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


def http_status(url):
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            return response.status
    except urllib.error.HTTPError as exc:
        return exc.code
    except (urllib.error.URLError, OSError):
        return None


CONTROL_JS = """(mode) => { const c = document.createElement('canvas'); c.id = 'rt-control';
  c.width = 400; c.height = 300; c.style.cssText = 'position:fixed;left:0;top:0;z-index:99999';
  const g = c.getContext('2d');
  if (mode === 'flat') { g.fillStyle = '#0a0a0f'; g.fillRect(0, 0, 400, 300); }
  else { const im = g.createImageData(400, 300); let s = 12345;
    for (let i = 0; i < im.data.length; i += 4) { s = (s * 1103515245 + 12345) & 0x7fffffff;
      im.data[i] = s & 255; im.data[i + 1] = (s >> 8) & 255; im.data[i + 2] = (s >> 16) & 255; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0); }
  document.body.appendChild(c); }"""


def run_build(label, tree, views, out, sync_playwright):
    """Serve one dist, run the identical procedure, and return (runs, reads, fetched chunk names)."""
    work = out / label
    (work / 'static').mkdir(parents=True, exist_ok=True)
    link = work / 'static' / 'agent-almanac'
    if link.is_symlink() or link.exists():
        link.unlink()
    link.symlink_to(tree['dist'], target_is_directory=True)
    port = free_port()
    base_url = f'http://127.0.0.1:{port}/agent-almanac/'
    log = open(work / 'server.log', 'w')
    server = subprocess.Popen([sys.executable, '-I', '-m', 'http.server', str(port), '--bind', '127.0.0.1',
                               '--directory', str(work / 'static')], stdout=log, stderr=subprocess.STDOUT)
    (work / 'server.pid').write_text(str(server.pid))
    events, phase, runs, reads = [], ['load'], {}, []
    try:
        for _ in range(60):
            try:
                with socket.create_connection(('127.0.0.1', port), timeout=0.5):
                    break
            except OSError:
                time.sleep(0.25)
        probe_missing = http_status(base_url + 'assets/viz-runtime-check-missing.js')
        probe_index = http_status(base_url)
        if probe_missing != 404 or probe_index != 200:
            raise Refused(f'{label}: the server is not Pages-shaped (index {probe_index}, missing asset {probe_missing})')
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True, args=CHROMIUM_ARGS)
            context = browser.new_context(viewport={'width': 1000, 'height': 650})
            # three dispatches 'register' on window.__THREE_DEVTOOLS__ once per copy that executes, so the
            # count is the number of three instances the page ran (rt1039.py's instrument, #1046 round 1, S5).
            context.add_init_script("""(() => { const et = new EventTarget(); window.__rt_three_registers = [];
              et.addEventListener('register', e => window.__rt_three_registers.push(String(e.detail && e.detail.revision)));
              window.__THREE_DEVTOOLS__ = et; })();""")
            page = context.new_page()
            page.set_default_timeout(NAV_TIMEOUT_MS)
            page.on('console', lambda m: events.append({'phase': phase[0], 'kind': 'console', 'type': m.type, 'text': m.text}))
            page.on('pageerror', lambda e: events.append({'phase': phase[0], 'kind': 'pageerror', 'text': str(e)}))
            page.on('response', lambda r: events.append({'phase': phase[0], 'kind': 'response', 'status': r.status, 'url': r.url}))
            page.on('requestfailed', lambda r: events.append({'phase': phase[0], 'kind': 'requestfailed', 'url': r.url, 'failure': r.failure}))

            def on_dialog(dialog):
                events.append({'phase': phase[0], 'kind': 'dialog', 'text': dialog.message})
                dialog.dismiss()
            page.on('dialog', on_dialog)

            control = {}
            for mode, must in (('flat', False), ('noise', True)):
                page.set_content('<html><body style="margin:0;background:#000"></body></html>')
                page.evaluate(CONTROL_JS, mode)
                png = page.screenshot(clip={'x': 0, 'y': 0, 'width': 400, 'height': 300})
                (work / f'control-{mode}.png').write_bytes(png)
                stats = image_stats(png)
                control[mode] = {'stats': stats, 'drawn': drawn(stats), 'must_be': must}
            runs['_control'] = control
            runs['_control_ok'] = all(c['drawn'] == c['must_be'] for c in control.values())
            events.clear()

            runs['load'] = {'sig': None, 'stats': None, 'drawn': None}
            try:
                page.goto(base_url, wait_until='networkidle')
                page.wait_for_selector('#graph-container canvas', state='attached')
                page.wait_for_function("() => document.getElementById('loading')?.classList.contains('hidden')")
                page.wait_for_timeout(SETTLE_MS['2d'])
                loaded = True
            except Exception as exc:  # noqa: BLE001 -- a page that does not load is a result, not a crash
                runs['load']['harness_error'] = f'{type(exc).__name__}: {exc}'
                events.append({'phase': 'load', 'kind': 'pageerror', 'text': f'harness: the page did not load ({type(exc).__name__})'})
                loaded = False
            current = '2d'
            for view in views:
                phase[0] = view
                runs[view] = {'sig': None, 'stats': None, 'drawn': False}
                if not loaded:
                    runs[view]['harness_error'] = 'the page did not load'
                    continue
                try:
                    if view != current:
                        page.click('#' + BUTTON[view])
                        current = view
                    # The app drops a click while a switch is running (viz/js/app.js, the switching guard),
                    # and marks the button selected only after the view loaded (setActiveMode, last in
                    # switchMode). So wait for both, or the screenshot shows the view this replaced.
                    page.wait_for_function("(id) => document.getElementById(id)?.getAttribute('aria-selected') === 'true'",
                                           arg=BUTTON[view], timeout=VIEW_TIMEOUT_MS)
                    page.wait_for_function("() => document.getElementById('loading')?.classList.contains('hidden')",
                                           timeout=VIEW_TIMEOUT_MS)
                    if view == '3d':
                        page.wait_for_function('() => window.__THREE__ !== undefined')
                    page.wait_for_timeout(SETTLE_MS[view])
                    box = page.locator('#graph-container').bounding_box()
                    png = page.screenshot(clip=box, style=OVERLAY_CSS) if box else None
                    if png:
                        (work / f'{view}.png').write_bytes(png)
                        runs[view]['stats'] = image_stats(png)
                        runs[view]['drawn'] = drawn(runs[view]['stats'])
                        empty = page.screenshot(clip=box, style=EMPTY_VIEW_CSS)
                        (work / f'{view}-empty.png').write_bytes(empty)
                        runs[view]['empty_stats'] = image_stats(empty)
                        runs[view]['empty_drawn'] = drawn(runs[view]['empty_stats'])
                except Exception as exc:  # noqa: BLE001 -- a view that never draws reads as not drawn
                    runs[view]['harness_error'] = f'{type(exc).__name__}: {exc}'[:300]
                    continue
                if view == '3d':
                    try:
                        three_ran = page.evaluate('() => window.__THREE__ === undefined ? null : String(window.__THREE__)')
                    except Exception:  # noqa: BLE001 -- an unreadable read is a missing read, not a crash
                        three_ran = None
                    try:
                        runs[view]['three_instances'] = page.evaluate('() => (window.__rt_three_registers || []).length')
                    except Exception:  # noqa: BLE001 -- an unreadable count is simply not compared
                        runs[view]['three_instances'] = None
                    reads.append({'package': 'three', 'how': 'window.__THREE__ (executed)',
                                  'ran': three_ran,
                                  'installed': three_revision(installed_version(tree['modules'], 'three')),
                                  'installed_version': installed_version(tree['modules'], 'three')})
                if view == 'workflow':
                    try:
                        svg = page.evaluate("""async () => { if (!window.__mermaid) return null;
                          const render = window.__mermaid.render('rt-info-' + Date.now(), 'info').then(r => r.svg);
                          const timeout = new Promise(resolve => setTimeout(() => resolve(null), 30000));
                          return Promise.race([render, timeout]); }""")
                    except Exception:  # noqa: BLE001 -- an unreadable read is a missing read, not a crash
                        svg = None
                    reads.append({'package': 'mermaid', 'how': "window.__mermaid.render('info') (executed)",
                                  'ran': mermaid_version(svg),
                                  'installed': installed_version(tree['modules'], 'mermaid'),
                                  'installed_version': installed_version(tree['modules'], 'mermaid')})
            browser.close()
    finally:
        server.terminate()
        try:
            server.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server.kill()
        log.close()
    for view in ['load'] + views:
        runs[view]['sig'] = view_signature([e for e in events if e['phase'] == view])
    chunks = sorted({e['url'].split('/agent-almanac/', 1)[1] for e in events
                     if e['kind'] == 'response' and e['status'] == 200 and '/agent-almanac/assets/' in e['url']
                     and e['url'].split('?')[0].endswith('.js')})
    (work / 'events.json').write_text(json.dumps(events, indent=1, default=str))
    return runs, reads, chunks


def fingerprint_reads(moved, base, new, base_chunks, new_chunks, patch, executed):
    """One line per moved package that no executed read covered."""
    def chunk_text(tree, names):
        return ''.join((tree['dist'] / n).read_text(errors='replace') for n in names if (tree['dist'] / n).is_file())
    base_text, new_text = chunk_text(base, base_chunks), chunk_text(new, new_chunks)
    out = []
    for pkg in moved:
        if pkg['dev'] or pkg['name'] in executed:
            continue
        line = {'package': pkg['name'], 'path': pkg['path'], 'base': pkg['base'], 'new': pkg['new'],
                'installed': {'base': installed_at(base, pkg['path']), 'new': installed_at(new, pkg['path'])}}
        literal = None
        if not patch:
            b_entry, n_entry = esm_entry(base['modules'].parent / pkg['path']), esm_entry(new['modules'].parent / pkg['path'])
            if b_entry and n_entry:
                literal = pick_fingerprint(b_entry.read_text(errors='replace'), n_entry.read_text(errors='replace'),
                                           base_text, new_text)
        if literal:
            line.update(how='fingerprint literal (in new chunks, absent from base chunks)', literal=literal[:80])
        else:
            line.update(how='installed version plus the fetched chunk names that differ (weaker: proves what was '
                            'bundled, not what ran)'
                        + (' -- --patch skips the literal hunt' if patch else ' -- no new-only literal survived the build'),
                        chunks_only_in_base=sorted(set(base_chunks) - set(new_chunks)),
                        chunks_only_in_new=sorted(set(new_chunks) - set(base_chunks)))
        out.append(line)
    return out


def vite_report(base, new):
    """What vite built with, for a bump in vite's closure: each tree's installed vite and the difference of the
    built file lists (index.html and assets/). Reported, not a pass condition: a vite release can legitimately
    re-chunk (spec step 3)."""
    def listing(dist):
        # index.html and assets/ only, the scope of tree_digest(): public/ is copied as is, and walking its
        # 8,000-odd icons per tree took 152 s on the /mnt/d mount (measured on the vite 8.3.4 -> 8.3.5 pair).
        files = [dist / 'index.html'] + [p for p in (dist / 'assets').rglob('*') if p.is_file()]
        return {str(p.relative_to(dist)) for p in files if p.is_file()}
    b, n = listing(base['dist']), listing(new['dist'])
    return {'installed': {'base': installed_version(base['modules'], 'vite'), 'new': installed_version(new['modules'], 'vite')},
            'dist_files': {'base': len(b), 'new': len(n)},
            'dist_only_in_base': sorted(b - n), 'dist_only_in_new': sorted(n - b),
            'differ_after_hash_strip': sorted({normalise(x) for x in b} ^ {normalise(x) for x in n})}


def summarise_reasons(lines, shown=3):
    """One clause per distinct reason, naming up to `shown` packages; summary.json keeps every line."""
    groups = {}
    for line in lines:
        head, _, why = line.partition(': ')
        groups.setdefault(why or head, []).append(head if why else '')
    parts = []
    for why, heads in groups.items():
        names = [h.split(' ')[0].replace('node_modules/', '') for h in heads if h]
        more = f' and {len(names) - shown} more' if len(names) > shown else ''
        parts.append((f"{', '.join(names[:shown])}{more}: " if names else '') + why)
    return '; '.join(parts)


def run(args):
    out = Path(args.out).resolve()
    # A reused --out would leave an earlier run's screenshots beside this run's (#1046 round 1, N4). Refuse
    # rather than delete: the earlier evidence may be what someone is still reading.
    if out.exists() and any(out.iterdir()):
        raise Refused(f'--out {out} is not empty; name a new directory, so no earlier screenshot is read as this run')
    out.mkdir(parents=True, exist_ok=True)
    base, new = tree_inputs(args.base), tree_inputs(args.new)
    if tree_digest(base['dist']) == tree_digest(new['dist']):
        raise Refused('base and new viz/dist are byte-identical: either the base merged the PR, '
                      'or the bump did not reach the bundle; the control comparison would confirm nothing')
    moved = moved_packages(base['lock'], new['lock'])
    override = [v.strip() for v in args.views.split(',')] if args.views else None
    if override and any(v not in ALL_VIEWS for v in override):
        raise Refused(f'--views takes {",".join(ALL_VIEWS)}; got {args.views}')
    closures = view_closures(base['lock'], new['lock'])
    views, reasons = select_views(moved, closures, override)  # --patch never narrows the views
    vite = vite_report(base, new) if any(pkg['path'] in closures[1] for pkg in moved) else None
    if vite:
        print(f"vite built base with {vite['installed']['base']} and new with {vite['installed']['new']}; dist files "
              f"{vite['dist_files']['base']} -> {vite['dist_files']['new']}, {len(vite['dist_only_in_base'])} only in base, "
              f"{len(vite['dist_only_in_new'])} only in new, {len(vite['differ_after_hash_strip'])} differ after the hash "
              f"is stripped (reported, not a pass condition)")
    print(f'moved packages: {len(moved)}')
    for pkg in moved:
        print(f"  {pkg['path']}: {pkg['base']} -> {pkg['new']}{' (dev)' if pkg['dev'] else ''}")
    if not views:
        raise Refused('no package the page loads moved (only dev-only packages other than vite); '
                      'nothing to check in the browser')
    for view in views:
        print(f'enter {view}: ' + summarise_reasons(reasons[view]))
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        raise Refused(f'playwright is not importable ({exc}); run this WITHOUT python3 -I') from exc
    runs, reads, chunks = {}, {}, {}
    for label, tree in (('base', base), ('new', new)):
        runs[label], reads[label], chunks[label] = run_build(label, tree, views, out, sync_playwright)
    executed = {r['package'] for r in reads['new'] if r['ran'] is not None}
    prints = fingerprint_reads(moved, base, new, chunks['base'], chunks['new'], args.patch, executed)
    code, fails, no_verdict = verdict(views, runs, reads)
    summary = {
        'mode': 'patch' if args.patch else 'full', 'views': views, 'reasons': reasons, 'moved': moved,
        'control': {label: runs[label]['_control'] for label in runs},
        'per_view': {label: {v: {'drawn': runs[label][v]['drawn'], 'stats': runs[label][v]['stats'],
                                 'empty_drawn': runs[label][v].get('empty_drawn'), 'empty_stats': runs[label][v].get('empty_stats'),
                                 'harness_error': runs[label][v].get('harness_error'),
                                 'three_instances': runs[label][v].get('three_instances'),
                                 'warnings': sorted(runs[label][v]['sig']['warnings']),
                                 'errors': sorted(runs[label][v]['sig']['errors']),
                                 'non_ok': sorted(runs[label][v]['sig']['non_ok']),
                                 'aborted_ignored': len(runs[label][v]['sig']['aborted_ignored'])}
                             for v in ['load'] + views} for label in runs},
        'executed_reads': reads, 'other_reads': prints, 'chunks': chunks, 'vite': vite,
        'verdict': {0: 'PASS', 1: 'FAIL', 2: 'NO VERDICT'}[code], 'fails': fails, 'no_verdict': no_verdict,
    }
    (out / 'summary.json').write_text(json.dumps(summary, indent=1, default=str))
    for label in ('base', 'new'):
        for read in reads[label]:
            how = read['how'] if read['ran'] is not None else 'no executed read: ' + read['how'].replace(' (executed)', ' returned nothing')
            print(f"{label}: {read['package']} ran {read['ran']} (installed {read['installed_version']}) via {how}")
    for line in prints:
        print(f"read {line['package']} {line['base']} -> {line['new']} (node_modules: base "
              f"{line['installed']['base']}, new {line['installed']['new']}): {line['how']}"
              + (f" '{line['literal']}'" if line.get('literal') else '')
              + (f"; chunks only in new: {line['chunks_only_in_new']}" if line.get('chunks_only_in_new') else ''))
    for view in views:
        b, n = summary['per_view']['base'][view], summary['per_view']['new'][view]
        print(f"{view}: drawn base={b['drawn']} new={n['drawn']}; errors base={len(b['errors'])} new={len(n['errors'])}; "
              f"non-2xx base={len(b['non_ok'])} new={len(n['non_ok'])}"
              + (f"; three copies base={b['three_instances']} new={n['three_instances']}" if view == '3d' else ''))
        new_warnings = sorted(set(n['warnings']) - set(b['warnings']))
        if new_warnings:
            print(f'WARN: {view}: {len(new_warnings)} console warning(s) only in new, reported, not a pass condition: '
                  f'{new_warnings[:5]}')
    for line in fails:
        print('FAIL: ' + line)
    for line in no_verdict:
        print('NO VERDICT: ' + line)
    print(f"verdict: {summary['verdict']} -- evidence in {out}")
    return code


# ---------- --verify: every arm runs without a browser, a network or a package ----------

def _encode_png(width, height, channels, rows, filters):
    """A test encoder whose filter per row is chosen, so the decoder is checked on all five."""
    def filt(kind, line, prev):
        out = bytearray(len(line))
        for i in range(len(line)):
            left = line[i - channels] if i >= channels else 0
            up = prev[i]
            upleft = prev[i - channels] if i >= channels else 0
            pred = (0, left, up, (left + up) >> 1, _paeth(left, up, upleft))[kind]
            out[i] = (line[i] - pred) & 255
        return out
    raw, prev = bytearray(), bytearray(width * channels)
    for y, line in enumerate(rows):
        kind = filters[y % len(filters)]
        raw.append(kind)
        raw += filt(kind, line, prev)
        prev = line

    def chunk(kind, body):
        return struct.pack('>I', len(body)) + kind + body + struct.pack('>I', zlib.crc32(kind + body) & 0xffffffff)
    colour = 2 if channels == 3 else 6
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, colour, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(bytes(raw))) + chunk(b'IEND', b''))


def _image(width, height, channels, pixel):
    return [bytearray(b for x in range(width) for b in pixel(x, y)[:channels]) for y in range(height)]


def verify():
    results = []

    def arm(name, ok, detail=''):
        results.append(ok)
        print(f"{'ok  ' if ok else 'FAIL'} {name}{(': ' + detail) if detail else ''}")

    seed = [7]

    def noise(x, y):
        seed[0] = (seed[0] * 1103515245 + 12345) & 0x7fffffff
        return (seed[0] & 255, (seed[0] >> 8) & 255, (seed[0] >> 16) & 255, 255)

    # 1. the decoder round-trips every filter type, RGB and RGBA
    for channels in (3, 4):
        rows = _image(37, 23, channels, noise)
        for filters in ([0], [1], [2], [3], [4], [0, 1, 2, 3, 4]):
            w, h, c, back = decode_png(_encode_png(37, 23, channels, rows, filters))
            arm(f'decode round-trip, {channels} channels, filters {filters}', (w, h, c) == (37, 23, channels) and back == rows)
    # 2. the decoder refuses what it cannot read rather than guessing
    for name, data in (('bad signature', b'not a png at all'),
                       ('16-bit', _encode_png(2, 2, 3, _image(2, 2, 3, noise), [0]).replace(
                           struct.pack('>IIBBBBB', 2, 2, 8, 2, 0, 0, 0), struct.pack('>IIBBBBB', 2, 2, 16, 2, 0, 0, 0)))):
        try:
            decode_png(data)
            arm(f'decode refuses {name}', False, 'no error raised')
        except ValueError as exc:
            arm(f'decode refuses {name}', True, str(exc))
    # 3. the drawn/blank predicate: both control rows, plus the two shapes that sit between them
    flat = _encode_png(80, 60, 3, _image(80, 60, 3, lambda x, y: (10, 10, 15)), [0])
    noisy = _encode_png(80, 60, 3, _image(80, 60, 3, noise), [0, 4])
    checker = _encode_png(80, 60, 3, _image(80, 60, 3, lambda x, y: (255, 255, 255) if (x // 4 + y // 4) % 2 else (0, 0, 0)), [0])
    ramp = _encode_png(256, 4, 3, _image(256, 4, 3, lambda x, y: (x, x, x)), [1])
    arm('a one-colour canvas reads NOT drawn', not drawn(image_stats(flat, step=1)))
    arm('a noise canvas reads drawn', drawn(image_stats(noisy, step=1)))
    arm('a two-colour checkerboard reads NOT drawn (spread, but 2 colours)', not drawn(image_stats(checker, step=1)))
    arm('a 256-level ramp reads drawn', drawn(image_stats(ramp, step=1)))
    # 4. lockfile diff: a version change, an addition, a removal, a nested copy, dev flags
    base_lock = {'packages': {'': {}, 'node_modules/three': {'version': '0.186.1'},
                              'node_modules/d3-array': {'version': '3.2.3'},
                              'node_modules/vitest': {'version': '3.0.0', 'dev': True},
                              'node_modules/mermaid/node_modules/dompurify': {'version': '3.1.0'},
                              'node_modules/gone': {'version': '1.0.0'}}}
    new_lock = {'packages': {'': {}, 'node_modules/three': {'version': '0.187.0'},
                             'node_modules/d3-array': {'version': '3.2.4'},
                             'node_modules/vitest': {'version': '3.0.1', 'dev': True},
                             'node_modules/mermaid/node_modules/dompurify': {'version': '3.1.1'},
                             'node_modules/added': {'version': '2.0.0'}}}
    moved = moved_packages(base_lock, new_lock)
    arm('lock diff lists exactly the six moved paths',
        [m['path'] for m in moved] == ['node_modules/added', 'node_modules/d3-array', 'node_modules/gone',
                                       'node_modules/mermaid/node_modules/dompurify', 'node_modules/three',
                                       'node_modules/vitest'], str([m['path'] for m in moved]))
    arm('lock diff marks vitest dev and three not', next(m for m in moved if m['name'] == 'vitest')['dev']
        and not next(m for m in moved if m['name'] == 'three')['dev'])
    arm('a nested copy is named by its leaf package', any(m['name'] == 'dompurify' for m in moved))
    # 5. view routing by dependency closure (the shape of viz/package-lock.json, cut down)
    fixture = {'packages': {
        '': {}, 'node_modules/force-graph': {'dependencies': {'d3-array': '^3', 'd3-force-3d': '^3'}},
        'node_modules/3d-force-graph': {'dependencies': {'three-forcegraph': '^1'}},
        'node_modules/three-forcegraph': {'dependencies': {'d3-force-3d': '^3', 'd3-scale': '^4'},
                                          'peerDependencies': {'three': '>=0.1', 'peer-only': '1'}},
        'node_modules/peer-only': {},
        'node_modules/three': {}, 'node_modules/d3': {'dependencies': {'d3-array': '^3', 'd3-interpolate': '^3'}},
        'node_modules/d3-interpolate': {'dependencies': {'d3-color': '^3'}}, 'node_modules/d3-color': {},
        'node_modules/d3-array': {}, 'node_modules/d3-scale': {}, 'node_modules/d3-force-3d': {},
        'node_modules/mermaid': {'dependencies': {'dompurify': '^3', 'd3': '^7'}},
        'node_modules/mermaid/node_modules/dompurify': {}, 'node_modules/dompurify': {},
        'node_modules/vite': {'dev': True, 'dependencies': {'rolldown': '1'}}, 'node_modules/rolldown': {'dev': True},
        'node_modules/vitest': {'dev': True}, 'node_modules/orphan': {}}}
    closures = view_closures(fixture)
    arm('the lookup prefers a nested copy over the root one',
        resolve(fixture['packages'], 'node_modules/mermaid', 'dompurify') == 'node_modules/mermaid/node_modules/dompurify'
        and resolve(fixture['packages'], 'node_modules/mermaid/node_modules/dompurify', 'd3') == 'node_modules/d3')
    cases = [('node_modules/force-graph', False, ['2d']),
             ('node_modules/d3-force-3d', False, ['2d', '3d']),  # #1046 round 1, B3: the layout engine of both graphs
             ('node_modules/d3-array', False, ['2d', 'campfire', 'chord', 'hive', 'workflow']),
             ('node_modules/d3-color', False, ['campfire', 'chord', 'hive', 'workflow']),
             ('node_modules/three', False, ['3d']), ('node_modules/d3-scale', False, ['3d']),
             ('node_modules/peer-only', False, ['3d']),  # reached only as a peer dependency
             ('node_modules/mermaid/node_modules/dompurify', False, ['workflow']),
             ('node_modules/dompurify', False, ALL_VIEWS),  # shadowed by mermaid's copy: in no closure
             ('node_modules/vite', True, ALL_VIEWS), ('node_modules/rolldown', True, ALL_VIEWS),
             ('node_modules/vitest', True, []), ('node_modules/orphan', False, ALL_VIEWS)]
    for path, dev, want in cases:
        got, _ = views_for({'path': path, 'dev': dev}, closures)
        arm(f"views for {path}{' (dev)' if dev else ''}", got == want, str(got))
    chosen, _ = select_views([{'path': 'node_modules/vitest', 'name': 'vitest', 'dev': True, 'base': '1', 'new': '2'}], closures)
    arm('only a dev-only package outside the build closure moved: no view, so the run refuses', chosen == [])
    chosen, _ = select_views([{'path': 'node_modules/mermaid', 'name': 'mermaid', 'dev': False, 'base': '1', 'new': '2'}],
                             closures, ['2d'])
    arm('--views adds a view and never drops one the moved packages load', chosen == ['2d', 'workflow'], str(chosen))
    # 6. comparison: normalisation, and a planted new-only error
    arm('normalise strips host, port and bundle hash',
        normalise('GET http://127.0.0.1:41234/agent-almanac/assets/graph3d-BXq3dPZS.js 404')
        == 'GET /agent-almanac/assets/graph3d-<hash>.js 404')
    ev_base = [{'kind': 'console', 'type': 'error', 'text': 'icon 404 at http://127.0.0.1:1111/agent-almanac/icons/a.webp'},
               {'kind': 'response', 'status': 404, 'url': 'http://127.0.0.1:1111/agent-almanac/icons/a.webp'},
               {'kind': 'requestfailed', 'url': 'http://127.0.0.1:1111/agent-almanac/icons/b.webp', 'failure': 'net::ERR_ABORTED'}]
    ev_new = [{'kind': 'console', 'type': 'error', 'text': 'icon 404 at http://127.0.0.1:2222/agent-almanac/icons/a.webp'},
              {'kind': 'response', 'status': 404, 'url': 'http://127.0.0.1:2222/agent-almanac/icons/a.webp'},
              {'kind': 'pageerror', 'text': 'Error: planted page error in the graph'}]
    sb, sn = view_signature(ev_base), view_signature(ev_new)
    arm('the same icon 404 on two ports compares equal', sb['non_ok'] == sn['non_ok'] and
        'console: icon 404 at /agent-almanac/icons/a.webp' in sn['errors'])
    arm('an ERR_ABORTED failure is set aside, not compared', sb['aborted_ignored'] == ['/agent-almanac/icons/b.webp']
        and not any('b.webp' in x for x in sb['non_ok']))
    extra = view_signature([{'kind': 'dialog', 'text': 'WebGL is not available'},
                            {'kind': 'console', 'type': 'warning', 'text': 'a deprecation notice'}])
    arm('a dialog counts as an error, a console warning does not',
        extra['errors'] == {'dialog: WebGL is not available'}, str(extra['errors']))
    arm('a console warning is recorded as a warning', extra['warnings'] == {'warning: a deprecation notice'}, str(extra['warnings']))
    good = {'drawn': True, 'stats': {}}
    def runs_with(new_sig, new_drawn=True, base_drawn=True, control_ok=True):
        return {'base': {'_control_ok': control_ok, 'load': {**good, 'sig': sb}, '2d': {**good, 'drawn': base_drawn, 'sig': sb}},
                'new': {'_control_ok': True, 'load': {**good, 'sig': sb}, '2d': {**good, 'drawn': new_drawn, 'sig': new_sig}}}
    no_reads = {'base': [], 'new': []}
    # 7. the verdict
    arm('identical signatures: PASS', verdict(['2d'], runs_with(sb), no_reads)[0] == 0)
    twins = runs_with(sb)
    twins['base']['2d']['three_instances'], twins['new']['2d']['three_instances'] = 1, 2
    code, fails, _ = verdict(['2d'], twins, no_reads)
    arm('new runs a second copy of three: FAIL', code == 1 and any('2 copies of three' in f for f in fails), str(fails))
    warned = runs_with(view_signature([{'kind': 'console', 'type': 'warning', 'text': 'new deprecation'}]))
    warned['base']['2d']['sig'] = view_signature([])
    warned['base']['load']['sig'] = warned['new']['load']['sig'] = view_signature([])
    arm('a new-only console warning is reported, not a FAIL', verdict(['2d'], warned, no_reads)[0] == 0)
    code, fails, _ = verdict(['2d'], runs_with(sn), no_reads)
    arm('a planted new-only page error: FAIL naming it', code == 1 and any('planted page error in the graph' in f for f in fails), str(fails))
    sn404 = view_signature(ev_base[:2] + [{'kind': 'response', 'status': 404,
                                           'url': 'http://127.0.0.1:2222/agent-almanac/assets/graph3d-AbCdEf12.js'}])
    code, fails, _ = verdict(['2d'], runs_with(sn404), no_reads)
    arm('a planted new-only 404: FAIL naming the path without its hash', code == 1
        and any('404 /agent-almanac/assets/graph3d-<hash>.js' in f for f in fails), str(fails))
    arm('an error that vanished in new is not a failure', verdict(['2d'], {'base': runs_with(sn)['new'] | {'_control_ok': True},
                                                                         'new': runs_with(sb)['base']}, no_reads)[0] == 0)
    arm('new drew nothing: FAIL', verdict(['2d'], runs_with(sb, new_drawn=False), no_reads)[0] == 1)
    arm('base drew nothing: NO VERDICT', verdict(['2d'], runs_with(sb, base_drawn=False), no_reads)[0] == 2)
    leaky = runs_with(sb)
    leaky['new']['2d']['empty_drawn'] = True
    code, _, nov = verdict(['2d'], leaky, no_reads)
    arm('an empty control that reads drawn: NO VERDICT for that view, never PASS', code == 2
        and any('with the view hidden' in x for x in nov), str(nov))
    arm('a failed control row: NO VERDICT', verdict(['2d'], runs_with(sb, control_ok=False), no_reads)[0] == 2)
    arm('a failed control row beside a new-only error: still NO VERDICT, not FAIL',
        verdict(['2d'], runs_with(sn, control_ok=False), no_reads)[0] == 2)
    arm('base and new both drew nothing: NO VERDICT, not FAIL',
        verdict(['2d'], runs_with(sb, new_drawn=False, base_drawn=False), no_reads)[0] == 2)
    arm('a view measured in one build only: NO VERDICT', verdict(['2d', '3d'], runs_with(sb), no_reads)[0] == 2)
    # 8. executed reads
    arm("three 0.187.0 expects window.__THREE__ '187'", three_revision('0.187.0') == '187' and three_revision('1.0.0') is None)
    arm("mermaid's info SVG yields its version", mermaid_version('<svg><text>v12.2.0</text></svg>') == '12.2.0'
        and mermaid_version('<svg/>') is None)
    silent = {'base': [{'package': 'mermaid', 'ran': '12.1.0', 'installed': '12.1.0'}],
              'new': [{'package': 'mermaid', 'ran': None, 'installed': '12.2.0'}]}
    code, fails, _ = verdict(['2d'], runs_with(sb), silent)
    arm('new gave no executed read where base did: FAIL', code == 1 and any('no executed read' in f for f in fails), str(fails))
    neither = {'base': [{'package': 'mermaid', 'ran': None, 'installed': '12.1.0'}],
               'new': [{'package': 'mermaid', 'ran': None, 'installed': '12.2.0'}]}
    arm('neither build gave an executed read: NO VERDICT, never PASS', verdict(['2d'], runs_with(sb), neither)[0] == 2)
    stale = {'base': [], 'new': [{'package': 'three', 'ran': '186', 'installed': '187', 'installed_version': '0.187.0'}]}
    code, fails, _ = verdict(['2d'], runs_with(sb), stale)
    arm('new ran a different three than it installed: FAIL', code == 1 and any('ran 186' in f for f in fails), str(fails))
    # 9. the fingerprint read
    base_entry = 'export const a = "shared literal value"; const msg = "the old error message text";'
    new_entry = 'export const a = "shared literal value"; const msg = "a brand-new error message text";'
    arm('the fingerprint is the new-only literal found in new chunks and absent from base chunks',
        pick_fingerprint(base_entry, new_entry, 'x"the old error message text"', 'y"a brand-new error message text"')
        == 'a brand-new error message text')
    arm('a literal the build dropped yields no fingerprint (the weaker fallback applies)',
        pick_fingerprint(base_entry, new_entry, 'x', 'y') is None)
    # 10. resolving a package's ESM entry from its package.json
    import tempfile
    with tempfile.TemporaryDirectory() as tmp:
        pkg = Path(tmp)
        (pkg / 'dist').mkdir()
        (pkg / 'dist' / 'lib.mjs').write_text('x')
        (pkg / 'main.js').write_text('y')
        for meta, want in (({'exports': {'.': {'import': './dist/lib.mjs', 'require': './main.js'}}, 'main': 'main.js'}, 'lib.mjs'),
                           ({'exports': './dist/lib.mjs'}, 'lib.mjs'),
                           ({'exports': {'.': {'import': {'default': './dist/lib.mjs'}}}}, 'lib.mjs'),
                           ({'module': 'dist/lib.mjs', 'main': 'main.js'}, 'lib.mjs'),
                           ({'main': 'main.js'}, 'main.js'),
                           ({'main': 'missing.js'}, None)):
            (pkg / 'package.json').write_text(json.dumps(meta))
            got = esm_entry(pkg)
            arm(f'esm entry for {json.dumps(meta)[:60]}', (got.name if got else None) == want, str(got))
    # 11. a crash inside the tool is exit 2 with a traceback, never exit 1 (the FAIL code)
    import contextlib
    import io
    with tempfile.TemporaryDirectory() as tmp:
        for name in ('base', 'new'):
            viz = Path(tmp) / name / 'viz'
            (viz / 'dist' / 'assets').mkdir(parents=True)
            (viz / 'node_modules').mkdir()
            (viz / 'dist' / 'index.html').write_text(name)
            (viz / 'package-lock.json').write_text('{not json' if name == 'base' else '{}')
        err = io.StringIO()
        with contextlib.redirect_stderr(err), contextlib.redirect_stdout(io.StringIO()):
            code = main(['--base', str(Path(tmp) / 'base'), '--new', str(Path(tmp) / 'new'), '--out', str(Path(tmp) / 'out')])
        arm('a malformed lockfile: exit 2 with the traceback, not exit 1', code == 2
            and 'the tool itself failed' in err.getvalue() and 'JSONDecodeError' in err.getvalue(), f'exit {code}')
    # 12. the fingerprint fallback reads node_modules, not the lockfile, and names the chunks that differ
    with tempfile.TemporaryDirectory() as tmp:
        trees = {}
        for name, version, chunk in (('base', '1.0.0', 'assets/index-AAAAAAAA.js'), ('new', '1.1.0', 'assets/index-BBBBBBBB.js')):
            viz = Path(tmp) / name / 'viz'
            (viz / 'node_modules' / 'lib').mkdir(parents=True)
            (viz / 'node_modules' / 'lib' / 'package.json').write_text(json.dumps({'version': version}))
            (viz / 'dist' / 'assets').mkdir(parents=True)
            (viz / 'dist' / chunk).write_text('x')
            trees[name] = {'modules': viz / 'node_modules', 'dist': viz / 'dist'}
        moved_lib = [{'name': 'lib', 'path': 'node_modules/lib', 'base': '9.9.9', 'new': '9.9.9', 'dev': False}]
        line = fingerprint_reads(moved_lib, trees['base'], trees['new'], ['assets/index-AAAAAAAA.js', 'assets/shared.js'],
                                 ['assets/index-BBBBBBBB.js', 'assets/shared.js'], True, set())[0]
        arm('the fallback reads the version node_modules holds, not the lockfile', line['installed'] == {'base': '1.0.0', 'new': '1.1.0'}, str(line['installed']))
        arm('the fallback names only the chunks that differ', line['chunks_only_in_base'] == ['assets/index-AAAAAAAA.js']
            and line['chunks_only_in_new'] == ['assets/index-BBBBBBBB.js'], str(line))
    # 13. the vite report: installed vite per tree, and the dist/ file-list difference
    with tempfile.TemporaryDirectory() as tmp:
        trees = {}
        for name, version, files in (('base', '8.0.0', ['index.html', 'assets/index-AAAAAAAA.js', 'assets/old.js']),
                                     ('new', '8.0.1', ['index.html', 'assets/index-BBBBBBBB.js'])):
            viz = Path(tmp) / name / 'viz'
            (viz / 'node_modules' / 'vite').mkdir(parents=True)
            (viz / 'node_modules' / 'vite' / 'package.json').write_text(json.dumps({'version': version}))
            for rel in files:
                (viz / 'dist' / rel).parent.mkdir(parents=True, exist_ok=True)
                (viz / 'dist' / rel).write_text(rel)
            trees[name] = {'modules': viz / 'node_modules', 'dist': viz / 'dist'}
        report = vite_report(trees['base'], trees['new'])
        arm('the vite report names each tree\'s installed vite', report['installed'] == {'base': '8.0.0', 'new': '8.0.1'})
        arm('the vite report lists the dist/ difference, raw and with the hash stripped',
            report['dist_only_in_base'] == ['assets/index-AAAAAAAA.js', 'assets/old.js']
            and report['dist_only_in_new'] == ['assets/index-BBBBBBBB.js'] and report['differ_after_hash_strip'] == ['assets/old.js'],
            str(report))
    # 14. a non-empty --out is refused, and nothing in it is touched
    with tempfile.TemporaryDirectory() as tmp:
        (Path(tmp) / 'out').mkdir()
        (Path(tmp) / 'out' / 'earlier.png').write_text('earlier run')
        err = io.StringIO()
        with contextlib.redirect_stderr(err), contextlib.redirect_stdout(io.StringIO()):
            code = main(['--base', tmp, '--new', tmp, '--out', str(Path(tmp) / 'out')])
        arm('a non-empty --out is refused and left as it was', code == 2 and 'is not empty' in err.getvalue()
            and (Path(tmp) / 'out' / 'earlier.png').read_text() == 'earlier run', f'exit {code}')
    many = [f'node_modules/p{i} 1 -> 2: in vite\'s dependency closure' for i in range(5)] + ['added by --views']
    arm('the printed reason groups packages and names three', summarise_reasons(many)
        == "p0, p1, p2 and 2 more: in vite's dependency closure; added by --views", summarise_reasons(many))
    failed = results.count(False)
    print(f'verify: {len(results)} arm(s), {failed} failed')
    return 1 if failed else 0


def main(argv=None):
    parser = argparse.ArgumentParser(prog=PROG, description=__doc__.split('\n\n')[0].strip(),
                                     formatter_class=argparse.RawDescriptionHelpFormatter,
                                     epilog='Exit 0 PASS, 1 FAIL, 2 no verdict. Run without -I.')
    parser.add_argument('--base', help='worktree root of the base build (origin/main WITHOUT the PR), viz/dist built')
    parser.add_argument('--new', help='worktree root of the new build (the PR merged), viz/dist built')
    parser.add_argument('--out', help='evidence directory: summary.json, per-build events and screenshots')
    parser.add_argument('--patch', action='store_true',
                        help='the lighter check for a patch bump: no literal hunt (installed version plus chunk '
                             'names instead); the views, control rows, comparisons and executed reads stay')
    parser.add_argument('--views', help=f'also enter these views, comma-separated from {",".join(ALL_VIEWS)}; it adds '
                                        'to the views the moved packages select and never removes one')
    parser.add_argument('--verify', action='store_true', help='run the browser-free self-test and exit')
    args = parser.parse_args(argv)
    if args.verify:
        return verify()
    if not (args.base and args.new and args.out):
        parser.error('--base, --new and --out are required (or --verify)')
    # SIGTERM would otherwise end the process without running run_build()'s finally, leaving the static
    # server listening (#1046 round 1, N3). SystemExit unwinds through it; the catch-all below lets it pass.
    signal.signal(signal.SIGTERM, lambda signum, frame: sys.exit(128 + signum))
    try:
        return run(args)
    except Refused as exc:
        print(f'REFUSED: {exc}', file=sys.stderr)
        return 2
    except Exception:  # noqa: BLE001 -- a crash is no verdict; exit 1 is reserved for FAIL (#1046 round 1, S1)
        traceback.print_exc()
        print('ERROR: the tool itself failed (traceback above); no verdict', file=sys.stderr)
        return 2


if __name__ == '__main__':
    sys.exit(main())
