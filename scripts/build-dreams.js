#!/usr/bin/env node
/**
 * Build the Dream Atlas from `dreams/<date>-<slug>.md`.
 *
 * The directory is a corpus of `/dream` outputs. This script renders it as one page,
 * `dreams/atlas.html`.
 *
 * The design constraint is a **gnomon**: in Greek geometry, the increment which, added to a
 * figure, produces a new figure *similar* to the original. Adding a dream must therefore
 * require zero change here — no layout table, no per-entry coordinates, no hand-placed
 * colour. Every position, every mark and every chord is derived from the frontmatter, so
 * the atlas is the same figure at five entries and at fifty.
 *
 * Placement is the golden angle (137.5deg * n) at radius proportional to sqrt(n) — the
 * phyllotaxis rule, which never collides and never needs relayout.
 *
 * Each dream's mark is a Chladni sand field: points sampled over a square plate and kept
 * where the nodal function is near zero, which is where sand collects. The mode numbers
 * come from the dream's own motifs, so two dreams that ring in the same modes look alike.
 *
 * Damaged entries (`recovered:` other than `full`) are drawn with an **unconformity** — a
 * wedge missing from the plate and a madder-red break line across it. Losses are marks on
 * the figure, not omissions from it.
 *
 * Output is a body-fragment HTML document: it carries `<title>`, `<style>` and `<script>`
 * but no `<html>`/`<head>`/`<body>` wrapper, so the same file both opens in a browser and
 * publishes as an Artifact without edits.
 *
 * Usage:
 *   node scripts/build-dreams.js            # write dreams/atlas.html
 *   node scripts/build-dreams.js --check    # exit 1 if the committed file is stale
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DREAMS_DIR = join(ROOT, 'dreams');
const OUT = join(DREAMS_DIR, 'atlas.html');

/**
 * Entries link to their source on GitHub rather than to a sibling path. A relative
 * `href="2026-08-11-geometry.md"` resolves beside the file locally and resolves to nothing
 * once the page is published, which would leave every entry title a dead link in the one
 * place the page is most likely to be read.
 */
const SOURCE_URL = 'https://github.com/pjt222/agent-almanac/blob/main/dreams/';

/**
 * The closed vocabulary for `recovered:`. It is closed on purpose: `intact` and the damage
 * map below both key off these exact strings, so an unrecognised value — `Full`, a typo,
 * anything — would silently draw a dream as damaged, omit the explanation, and make the
 * "N intact" count wrong, with no warning. Enumerate the exemptions rather than trusting
 * the input.
 */
const RECOVERY_STATES = new Map([
  ['full', null],
  ['partial', 'Recovered incompletely — part of the text is missing.'],
  ['summary', 'The full text is lost with its container. What remains is a condensation written at the time.'],
  ['none', 'The dream text was never emitted. Only its seed and its output survive.'],
]);

/** Frontmatter + body of one dream file. */
function parseDream(file) {
  const raw = readFileSync(join(DREAMS_DIR, file), 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`dreams/${file}: no YAML frontmatter`);
  let meta;
  try {
    meta = yaml.load(m[1]) || {};
  } catch (err) {
    // js-yaml names the line but not the file, and a bare YAMLException stack is a worse
    // error than the hand-rolled checks below produce.
    throw new Error(`dreams/${file}: frontmatter is not valid YAML — ${err.message}`);
  }
  const bad = (msg) => { throw new Error(`dreams/${file}: ${msg}`); };

  for (const field of ['title', 'date', 'motifs']) {
    if (!meta[field]) bad(`frontmatter is missing '${field}'`);
  }
  if (!Array.isArray(meta.motifs)) bad("'motifs' must be a list, not a scalar");
  if (!meta.motifs.length) bad("'motifs' must name at least one mode");
  // An empty array is truthy, so the presence check above cannot catch it.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(meta.date))) {
    bad(`'date' must be YYYY-MM-DD (got '${meta.date}') — entries sort lexically`);
  }
  const recovered = String(meta.recovered || 'full');
  if (!RECOVERY_STATES.has(recovered)) {
    bad(`'recovered' must be one of ${[...RECOVERY_STATES.keys()].join(', ')} (got '${recovered}')`);
  }
  if (meta.movements !== undefined && !Number.isInteger(meta.movements)) {
    bad(`'movements' must be a whole number (got '${meta.movements}')`);
  }
  for (const listField of ['glows', 'downstream']) {
    if (meta[listField] !== undefined && !Array.isArray(meta[listField])) {
      bad(`'${listField}' must be a list`);
    }
  }
  return {
    id: file.replace(/\.md$/, ''),
    file,
    title: String(meta.title),
    date: String(meta.date),
    session: meta.session ? String(meta.session) : 'unrecorded',
    seed: meta.seed ? String(meta.seed).trim() : '',
    trigger: meta.trigger ? String(meta.trigger) : '',
    motifs: meta.motifs.map(String),
    recovered,
    movements: Number(meta.movements || 1),
    glows: (meta.glows || []).map(String),
    downstream: (meta.downstream || []).map(String),
    words: m[2].split(/\s+/).filter(Boolean).length,
  };
}

function loadDreams() {
  if (!existsSync(DREAMS_DIR)) return [];
  return readdirSync(DREAMS_DIR)
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .sort()
    .map(parseDream)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1));
}

/** Stable small hash — the mark for a given dream must be identical on every visit. */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Serialise for embedding inside a `<script>` element. `JSON.stringify` alone is unsafe
 * there: the HTML parser ends the element at the first literal `</script>`, so a title
 * containing that sequence would break out of the data block and into markup. Escaping `<`
 * closes it, and U+2028/U+2029 are escaped because they are JS line terminators.
 */
function scriptJson(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    // Every attribute emitted below is double-quoted, but nothing enforces that. Escaping
    // the apostrophe removes the dependency on an unenforced convention.
    .replace(/'/g, '&#39;');
}

/**
 * Motif -> plate modes. A motif is not a tag but an eigenmode: a shape this plate can hold.
 * The pair (m, n) indexes the mode, so dreams sharing motifs ring alike.
 */
function modesFor(dream) {
  const key = dream.motifs.slice().sort().join('|') || dream.id;
  const h = hash(key);
  return {
    m: 2 + (h % 5),
    n: 3 + ((h >>> 8) % 6),
    seed: hash(dream.id),
  };
}

function buildData(dreams) {
  const motifCount = new Map();
  for (const d of dreams) for (const t of d.motifs) motifCount.set(t, (motifCount.get(t) || 0) + 1);

  const nodes = dreams.map((d, i) => {
    const { m, n, seed } = modesFor(d);
    return {
      i,
      id: d.id,
      title: d.title,
      date: d.date,
      motifs: d.motifs,
      recovered: d.recovered,
      intact: d.recovered === 'full',
      glowCount: d.glows.length,
      words: d.words,
      m,
      n,
      seed,
    };
  });

  const chords = [];
  for (let a = 0; a < dreams.length; a += 1) {
    for (let b = a + 1; b < dreams.length; b += 1) {
      const shared = dreams[a].motifs.filter((t) => dreams[b].motifs.includes(t));
      if (shared.length) chords.push({ a, b, shared, weight: shared.length });
    }
  }

  const spectrum = [...motifCount.entries()]
    .sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1))
    .map(([name, count]) => ({ name, count }));

  return { nodes, chords, spectrum };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const CSS = `
:root {
  color-scheme: light dark;
  --cloth: #efe9dc;
  --cloth-deep: #e4dccb;
  --ink: #1d2028;
  --ink-soft: #55575e;
  --ink-faint: #8a897f;
  --rule: #cec5b1;
  --sand: #33353c;
  --brass: #9a6a1f;
  --verdigris: #3f6f66;
  --madder: #97372d;
  --shadow: rgba(29, 32, 40, 0.10);
  --display: "Iowan Old Style", "Palatino Linotype", Palatino, "URW Palladio L", "Book Antiqua", Georgia, serif;
  --body: Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif;
  --mono: ui-monospace, "SF Mono", "Cascadia Mono", "Roboto Mono", Menlo, Consolas, monospace;
  --measure: 34rem;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --cloth: #14161d;
    --cloth-deep: #0e1015;
    --ink: #e8e1d1;
    --ink-soft: #a6a294;
    --ink-faint: #6d6c66;
    --rule: #2b2e38;
    --sand: #e8e1d1;
    --brass: #c9944a;
    --verdigris: #6fa298;
    --madder: #bd5a4c;
    --shadow: rgba(0, 0, 0, 0.5);
  }
}
:root[data-theme="dark"] {
  --cloth: #14161d;
  --cloth-deep: #0e1015;
  --ink: #e8e1d1;
  --ink-soft: #a6a294;
  --ink-faint: #6d6c66;
  --rule: #2b2e38;
  --sand: #e8e1d1;
  --brass: #c9944a;
  --verdigris: #6fa298;
  --madder: #bd5a4c;
  --shadow: rgba(0, 0, 0, 0.5);
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--cloth);
  color: var(--ink);
  font-family: var(--body);
  font-size: 17px;
  line-height: 1.62;
  -webkit-font-smoothing: antialiased;
}

.wrap { max-width: 72rem; margin: 0 auto; padding: 0 1.5rem 6rem; }

.eyebrow {
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-faint);
}

/* --- masthead ---------------------------------------------------------- */

.masthead { padding: 4.5rem 0 1.25rem; display: flex; flex-direction: column; gap: 0.9rem; }
.masthead h1 {
  font-family: var(--display);
  font-weight: 400;
  font-size: clamp(2.6rem, 7vw, 4.6rem);
  line-height: 1.02;
  letter-spacing: -0.015em;
  margin: 0;
  text-wrap: balance;
}
.masthead h1 em { font-style: italic; color: var(--brass); }
.standfirst {
  max-width: var(--measure);
  color: var(--ink-soft);
  font-size: 1.06rem;
  margin: 0;
}

/* --- the plate --------------------------------------------------------- */

.plate {
  position: relative;
  margin: 2rem 0 0;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
  background: var(--cloth-deep);
}
.plate canvas { display: block; width: 100%; height: auto; touch-action: manipulation; }
.readout {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  padding: 0.85rem 1.1rem;
  display: flex; flex-wrap: wrap; gap: 0.35rem 1.1rem; align-items: baseline;
  background: linear-gradient(to top, var(--cloth-deep), transparent);
  pointer-events: none;
  min-height: 3.1rem;
}
.readout .t { font-family: var(--display); font-size: 1.02rem; }
.readout .m { font-family: var(--mono); font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-faint); }
.readout[data-empty="true"] .t { color: var(--ink-faint); font-style: italic; }

.key {
  display: flex; flex-wrap: wrap; gap: 0.4rem 1.6rem;
  padding: 0.9rem 0 0;
  font-family: var(--mono); font-size: 0.68rem; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--ink-faint);
}
.key span { display: inline-flex; align-items: center; gap: 0.5rem; }
.key i { width: 0.7rem; height: 0.7rem; border-radius: 50%; display: inline-block; }

/* --- strata ------------------------------------------------------------ */

.section-head {
  display: flex; align-items: baseline; gap: 1rem;
  margin: 4.5rem 0 0; padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--rule);
}
.section-head h2 {
  font-family: var(--display); font-weight: 400; font-size: 1.5rem; margin: 0;
}

.strata { display: flex; flex-direction: column; }

.stratum {
  display: grid;
  grid-template-columns: 9.5rem minmax(0, 1fr);
  gap: 0 2.5rem;
  padding: 2.1rem 0;
  border-bottom: 1px solid var(--rule);
  scroll-margin-top: 1.5rem;
}
.stratum:target { background: color-mix(in srgb, var(--brass) 9%, transparent); }
.stratum .stamp { display: flex; flex-direction: column; gap: 0.4rem; }
.stratum .stamp .date { font-family: var(--mono); font-size: 0.82rem; color: var(--ink); font-variant-numeric: tabular-nums; }
.stratum .stamp .sess { font-family: var(--mono); font-size: 0.68rem; color: var(--ink-faint); }
.stratum h3 {
  font-family: var(--display); font-weight: 400; font-size: 1.42rem; line-height: 1.25;
  margin: 0 0 0.55rem; text-wrap: balance;
}
.stratum h3 a { color: inherit; text-decoration: none; border-bottom: 1px solid var(--rule); }
.stratum h3 a:hover, .stratum h3 a:focus-visible { border-bottom-color: var(--brass); color: var(--brass); }
.seed { max-width: var(--measure); color: var(--ink-soft); font-style: italic; margin: 0 0 0.9rem; }

.glows { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0.42rem; max-width: var(--measure); }
.glows li { position: relative; padding-left: 1.15rem; }
.glows li::before {
  content: ""; position: absolute; left: 0; top: 0.62em;
  width: 0.42rem; height: 0.42rem; background: var(--brass); border-radius: 50%;
}

.motifs { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 1rem; }
.motifs b {
  font-family: var(--mono); font-weight: 400; font-size: 0.66rem;
  letter-spacing: 0.11em; text-transform: uppercase;
  color: var(--verdigris); border: 1px solid var(--rule);
  padding: 0.2rem 0.5rem; border-radius: 2px;
}

.break {
  display: flex; align-items: center; gap: 0.85rem;
  margin: 1rem 0 0; color: var(--madder);
  font-family: var(--mono); font-size: 0.68rem; letter-spacing: 0.11em; text-transform: uppercase;
}
.break svg { flex: 0 0 auto; }
.break p { margin: 0; font-family: var(--body); font-size: 0.92rem; letter-spacing: 0; text-transform: none; color: var(--ink-soft); }

/* --- spectrum ---------------------------------------------------------- */

.spectrum { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1.75rem; max-width: 46rem; }
.mode { display: grid; grid-template-columns: 11rem 1fr 2.5rem; gap: 1rem; align-items: center; }
.mode .name { font-family: var(--mono); font-size: 0.72rem; letter-spacing: 0.11em; text-transform: uppercase; color: var(--ink-soft); }
.mode .bar { height: 0.45rem; background: var(--rule); position: relative; }
.mode .bar b { position: absolute; inset: 0 auto 0 0; background: var(--verdigris); display: block; }
.mode .n { font-family: var(--mono); font-size: 0.78rem; color: var(--ink-faint); text-align: right; font-variant-numeric: tabular-nums; }

/* --- colophon ---------------------------------------------------------- */

.colophon { margin-top: 4rem; padding-top: 1.5rem; border-top: 1px solid var(--rule); max-width: var(--measure); color: var(--ink-soft); font-size: 0.95rem; }
.colophon code { font-family: var(--mono); font-size: 0.86em; color: var(--ink); }
.colophon p { margin: 0 0 0.9rem; }

a:focus-visible, [tabindex]:focus-visible, canvas:focus-visible { outline: 2px solid var(--brass); outline-offset: 3px; }

@media (max-width: 44rem) {
  .stratum { grid-template-columns: 1fr; gap: 0.9rem; }
  .mode { grid-template-columns: 7.5rem 1fr 2.2rem; }
  .masthead { padding-top: 2.75rem; }
}
`;

/* The runtime deliberately avoids template literals so it can be embedded verbatim. */
const JS = `
(function () {
  var DATA = window.__ATLAS__;
  var canvas = document.getElementById('plate');
  var ctx = canvas.getContext('2d');
  var readout = document.getElementById('readout');
  var GOLDEN = Math.PI * (3 - Math.sqrt(5));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var placed = [];
  var hot = -1;
  var progress = reduce ? 1 : 0;
  var W = 0, H = 0, DPR = 1;

  function rng(seed) {
    var t = seed >>> 0;
    return function () {
      t += 0x6D2B79F5;
      var r = t;
      r = Math.imul(r ^ (r >>> 15), r | 1);
      r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function tok(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  // Nodal function of a square plate: sand gathers where this is ~ 0.
  function chladni(x, y, m, n) {
    return Math.cos(n * Math.PI * x) * Math.cos(m * Math.PI * y)
         - Math.cos(m * Math.PI * x) * Math.cos(n * Math.PI * y);
  }

  function layout() {
    var w = canvas.parentElement.clientWidth;
    var h = Math.max(360, Math.min(560, Math.round(w * 0.50)));
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = w; H = h;
    canvas.width = Math.round(w * DPR);
    canvas.height = Math.round(h * DPR);
    canvas.style.height = h + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    var cx = w / 2;
    var cy = h / 2;
    var n = DATA.nodes.length;
    var short = Math.min(w, h);
    // Mark size grows a little with how much the dream carried, capped so the plate stays
    // legible as the corpus grows.
    var sizes = DATA.nodes.map(function (d) {
      return short * (0.052 + Math.min(d.glowCount, 8) * 0.0048) / Math.max(1, Math.pow(n / 6, 0.28));
    });
    var biggest = Math.max.apply(null, sizes);
    // Reserve the outermost mark's own radius, so the last placement never touches the edge.
    var maxR = short * 0.5 - biggest - short * 0.035;
    var step = n > 1 ? maxR / Math.sqrt(n - 1 + 0.75) : 0;
    placed = DATA.nodes.map(function (d, i) {
      var a = GOLDEN * i - Math.PI / 2;
      var r = n > 1 ? step * Math.sqrt(i + 0.75) : 0;
      return { d: d, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, r: sizes[i], a: a };
    });
  }

  function drawChord(p, q, alpha) {
    var mx = (p.x + q.x) / 2;
    var my = (p.y + q.y) / 2;
    var cx = W / 2, cy = H / 2;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.quadraticCurveTo(mx + (cx - mx) * 0.55, my + (cy - my) * 0.55, q.x, q.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawSand(p, colour, alpha, gapFrom, gapTo) {
    var d = p.d;
    var rand = rng(d.seed);
    // Sample proportional to plate area, and narrow the nodal band as the plate grows,
    // so the figure keeps a roughly constant line weight at any mark size.
    var pts = Math.round(p.r * p.r * 6);
    var eps = 1.6 / p.r;
    ctx.fillStyle = colour;
    ctx.globalAlpha = alpha;
    for (var k = 0; k < pts; k += 1) {
      var u = rand(), v = rand();
      var x = u * 2 - 1, y = v * 2 - 1;
      if (x * x + y * y > 1) continue;
      if (Math.abs(chladni((x + 1) / 2, (y + 1) / 2, d.m, d.n)) > eps) continue;
      if (gapFrom !== null) {
        var ang = Math.atan2(y, x);
        if (ang < 0) ang += Math.PI * 2;
        if (ang >= gapFrom && ang <= gapTo) continue;
      }
      ctx.fillRect(p.x + x * p.r, p.y + y * p.r, 1.2, 1.2);
    }
    ctx.globalAlpha = 1;
  }

  // The unconformity: a break line across the missing wedge.
  function drawBreak(p, from, to) {
    ctx.strokeStyle = tok('--madder');
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    var steps = 26;
    for (var s = 0; s <= steps; s += 1) {
      var t = s / steps;
      var ang = from + (to - from) * t;
      var wob = Math.sin(t * Math.PI * 5) * p.r * 0.09;
      var rr = p.r * (0.96 + 0) + wob;
      var x = p.x + Math.cos(ang) * rr;
      var y = p.y + Math.sin(ang) * rr;
      if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function render() {
    var sand = tok('--sand');
    var brass = tok('--brass');
    var verd = tok('--verdigris');
    ctx.clearRect(0, 0, W, H);

    var shown = Math.max(1, Math.round(placed.length * progress));

    // chords first: they are the reading, so they sit behind the marks
    ctx.strokeStyle = verd;
    ctx.lineWidth = 1;
    DATA.chords.forEach(function (c) {
      if (c.a >= shown || c.b >= shown) return;
      var lit = hot === c.a || hot === c.b;
      drawChord(placed[c.a], placed[c.b], lit ? 0.55 : 0.13 + c.weight * 0.035);
    });

    // the gnomon: a shadow-line from the centre to the newest entry
    if (placed.length > 1 && shown === placed.length) {
      var last = placed[placed.length - 1];
      ctx.strokeStyle = brass;
      ctx.globalAlpha = 0.32;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 5]);
      ctx.beginPath();
      ctx.moveTo(W / 2, H / 2);
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    placed.forEach(function (p, i) {
      if (i >= shown) return;
      var newest = i === placed.length - 1;
      var colour = newest ? brass : sand;
      var alpha = hot === -1 ? (newest ? 0.95 : 0.72) : (hot === i ? 1 : 0.22);
      var gapFrom = null, gapTo = null;
      if (!p.d.intact) {
        gapFrom = (p.d.seed % 360) * Math.PI / 180;
        gapTo = gapFrom + (p.d.recovered === 'none' ? 1.5 : 0.85);
      }
      drawSand(p, colour, alpha, gapFrom, gapTo);
      if (!p.d.intact && (hot === -1 || hot === i)) {
        ctx.globalAlpha = hot === i ? 1 : 0.7;
        drawBreak(p, gapFrom, gapTo);
        ctx.globalAlpha = 1;
      }
    });
  }

  // Built with textContent rather than innerHTML: these strings come from author-written
  // frontmatter, and a title containing markup would otherwise be parsed as markup.
  function span(cls, text, colour) {
    var el = document.createElement('span');
    el.className = cls;
    el.textContent = text;
    if (colour) el.style.color = colour;
    return el;
  }

  function setReadout(i) {
    readout.textContent = '';
    if (i < 0) {
      readout.setAttribute('data-empty', 'true');
      readout.appendChild(span('t', DATA.nodes.length + ' dreams, placed by golden angle at root-n'));
      return;
    }
    var d = DATA.nodes[i];
    readout.setAttribute('data-empty', 'false');
    readout.appendChild(span('t', d.title));
    readout.appendChild(span('m', d.date));
    readout.appendChild(span('m', d.motifs.join(' \\u00b7 ')));
    if (!d.intact) readout.appendChild(span('m', d.recovered, 'var(--madder)'));
  }

  function pick(ev) {
    var rect = canvas.getBoundingClientRect();
    var x = ev.clientX - rect.left;
    var y = ev.clientY - rect.top;
    var best = -1, bestD = Infinity;
    placed.forEach(function (p, i) {
      var dx = p.x - x, dy = p.y - y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < p.r * 1.25 && dist < bestD) { bestD = dist; best = i; }
    });
    return best;
  }

  canvas.addEventListener('mousemove', function (ev) {
    var i = pick(ev);
    if (i !== hot) { hot = i; setReadout(i); render(); }
    canvas.style.cursor = i >= 0 ? 'pointer' : 'default';
  });
  canvas.addEventListener('mouseleave', function () { hot = -1; setReadout(-1); render(); });
  canvas.addEventListener('click', function (ev) {
    var i = pick(ev);
    if (i >= 0) location.hash = DATA.nodes[i].id;
  });

  // Keyboard parity for the pointer interaction above. The canvas carries tabindex="0", so
  // arrow keys step through the marks in placement order and Enter opens the focused entry.
  canvas.addEventListener('keydown', function (ev) {
    var n = placed.length;
    if (!n) return;
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') { hot = (hot + 1 + n) % n; }
    else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') { hot = (hot <= 0 ? n : hot) - 1; }
    else if (ev.key === 'Escape') { hot = -1; }
    else if ((ev.key === 'Enter' || ev.key === ' ') && hot >= 0) { location.hash = DATA.nodes[hot].id; return; }
    else return;
    ev.preventDefault();
    setReadout(hot);
    render();
  });
  canvas.addEventListener('blur', function () { hot = -1; setReadout(-1); render(); });

  function resize() { layout(); render(); }
  window.addEventListener('resize', resize);
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  if (mq.addEventListener) mq.addEventListener('change', function () { render(); });

  // The canvas reads its palette imperatively at paint time, so a CSS-only theme change
  // repaints the page around a figure still drawn in the old colours. The media query above
  // covers the system-preference case; a host that stamps data-theme after load does not
  // fire it, and the stamped case is exactly what the [data-theme] CSS blocks exist for.
  if (window.MutationObserver) {
    new MutationObserver(function () { render(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  layout();
  setReadout(-1);

  if (reduce) {
    render();
  } else {
    var t0 = null;
    var dur = 320 + DATA.nodes.length * 190;
    var tick = function (ts) {
      if (progress >= 1) return;
      if (t0 === null) t0 = ts;
      var e = Math.min(1, (ts - t0) / dur);
      progress = e * e * (3 - 2 * e);
      render();
      if (e < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    // The complete figure must not depend on the animation finishing. A throttled or
    // background tab can starve requestAnimationFrame indefinitely, which would leave the
    // atlas permanently showing its first mark only. Settle unconditionally.
    setTimeout(function () {
      if (progress < 1) { progress = 1; render(); }
    }, dur + 500);
  }
})();
`;

function stratum(d) {
  const glows = d.glows.length
    ? `<ul class="glows">${d.glows.map((g) => `<li>${escapeHtml(g)}</li>`).join('')}</ul>`
    : '';
  const motifs = `<div class="motifs">${d.motifs.map((t) => `<b>${escapeHtml(t)}</b>`).join('')}</div>`;
  const damage = RECOVERY_STATES.get(d.recovered);
  const brk = damage
    ? `<div class="break">
        <svg width="52" height="10" viewBox="0 0 52 10" aria-hidden="true">
          <path d="M0 5 q 3.25 -4 6.5 0 t 6.5 0 t 6.5 0 t 6.5 0 t 6.5 0 t 6.5 0 t 6.5 0 t 6.5 0"
                fill="none" stroke="currentColor" stroke-width="1.4" />
        </svg>
        <p>${escapeHtml(damage)}</p>
      </div>`
    : '';
  const movements = d.movements > 1 ? ` &middot; ${d.movements} movements` : '';
  return `<article class="stratum" id="${escapeHtml(d.id)}">
    <div class="stamp">
      <span class="date">${escapeHtml(d.date)}</span>
      <span class="sess">session ${escapeHtml(d.session)}${movements}</span>
      <span class="sess">${d.words.toLocaleString('en-US')} words</span>
    </div>
    <div>
      <h3><a href="${escapeHtml(SOURCE_URL + encodeURIComponent(d.file))}">${escapeHtml(d.title)}</a></h3>
      ${d.seed ? `<p class="seed">Seed: ${escapeHtml(d.seed)}</p>` : ''}
      ${glows}
      ${motifs}
      ${brk}
    </div>
  </article>`;
}

function page(dreams, data) {
  const newest = dreams[dreams.length - 1];
  const intact = dreams.filter((d) => d.recovered === 'full').length;
  const maxCount = Math.max(1, ...data.spectrum.map((s) => s.count));
  return `<title>Dream Atlas — agent-almanac</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>${CSS}</style>
<div class="wrap">
  <header class="masthead">
    <span class="eyebrow">agent-almanac &middot; dreams</span>
    <h1>The Dream <em>Atlas</em></h1>
    <p class="standfirst">Every <code>/dream</code> this repository has kept, drawn as one figure. Each
      mark is a Chladni sand field whose modes come from the dream's own motifs; each is placed at the
      golden angle, so the figure grows without ever being redrawn. Red breaks are losses.</p>
  </header>

  <div class="plate">
    <canvas id="plate" tabindex="0" role="img"
      aria-label="Spiral of ${dreams.length} dream marks, each a nodal sand figure. Focus it and use the arrow keys to step through entries; every entry is also listed in full below."></canvas>
    <div class="readout" id="readout" data-empty="true"></div>
  </div>
  <div class="key">
    <span><i style="background:var(--brass)"></i>newest &mdash; the lit chamber</span>
    <span><i style="background:var(--sand)"></i>sealed &mdash; earlier dreams</span>
    <span><i style="background:var(--verdigris)"></i>shared motif</span>
    <span><i style="background:var(--madder)"></i>unconformity &mdash; text lost</span>
  </div>

  <div class="section-head">
    <h2>Strata</h2>
    <span class="eyebrow">newest first &middot; ${dreams.length} entries &middot; ${intact} intact</span>
  </div>
  <div class="strata">
    ${dreams.slice().reverse().map(stratum).join('\n')}
  </div>

  <div class="section-head">
    <h2>Modes</h2>
    <span class="eyebrow">motifs by how often this plate rings in them</span>
  </div>
  <div class="spectrum">
    ${data.spectrum.map((s) => `<div class="mode">
      <span class="name">${escapeHtml(s.name)}</span>
      <span class="bar"><b style="width:${Math.round((s.count / maxCount) * 100)}%"></b></span>
      <span class="n">${s.count}</span>
    </div>`).join('\n')}
  </div>

  <div class="colophon">
    <p>Generated from <code>dreams/*.md</code> by <code>npm run build-dreams</code>. Adding a dream is
      adding one markdown file; nothing about this page is written by hand. That constraint is the
      subject of the newest entry &mdash; a <em>gnomon</em> is the increment which, added to a figure,
      makes a larger figure of the same shape.</p>
    <p>Latest: <em>${escapeHtml(newest.title)}</em>, ${escapeHtml(newest.date)}.</p>
  </div>
</div>
<script>window.__ATLAS__ = ${scriptJson(data)};</script>
<script>${JS}</script>
`;
}

function main() {
  const check = process.argv.includes('--check');
  const dreams = loadDreams();
  if (!dreams.length) {
    console.error('build-dreams: no dreams found in dreams/');
    process.exit(1);
  }
  const html = page(dreams, buildData(dreams));
  if (check) {
    const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
    if (current !== html) {
      console.error('build-dreams: dreams/atlas.html is stale. Run `npm run build-dreams`.');
      process.exitCode = 1;
      return;
    }
    console.log(`build-dreams: atlas.html is up to date (${dreams.length} dreams).`);
    return;
  }
  writeFileSync(OUT, html, 'utf8');
  const motifs = new Set(dreams.flatMap((d) => d.motifs));
  console.log(`build-dreams: wrote dreams/atlas.html — ${dreams.length} dreams, ${motifs.size} motifs.`);
}

main();
