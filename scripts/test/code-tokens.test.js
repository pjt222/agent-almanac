/**
 * Tests for `scripts/lib/code-tokens.js` (#498).
 *
 * The fixtures are not invented. Every "should score high" body below is a real
 * pair the seven merged #477 batches actually restored and a human reviewed at
 * merge, and every one of them is a case the ORIGINAL prototype got wrong — it
 * scored five of them between 0.00 and 0.30, the maximum fork signal, on
 * comment-only and config-only changes. The "should score low" body is the one
 * true positive across 984 fences, `de/design-shiny-ui`.
 *
 * A detector that merely *can* fire is not evidence it admits the class you are
 * hunting, so the two constraint suites below do not stop at asserting the right
 * answer: each also measures the same bytes under the WRONG per-tag rule and
 * asserts that answer is wrong. If the per-tag table were quietly reduced to one
 * default again, those tests go red rather than continuing to pass on a
 * coincidence.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  measure, codeTokens, stripCommentsAndStrings, TAG_SYNTAX, DEFAULT_FORK_THRESHOLD,
} from '../lib/code-tokens.js';

const lines = (...xs) => xs.join('\n');

// ── constraint 3: per-tag comment syntax ────────────────────────────────────
//
// Four batch-7 files scored 0.00 — a perfect fork signal — on restores verified
// at zero non-comment changed lines. The prototype stripped `#` and nothing
// else, so in a CSS or JavaScript fence the "code tokens" it compared WERE the
// comment words, which a faithful translation changes wholesale.

const CSS_DE = lines(
  '/* Beispiel gut strukturierte Typoskala (Verhaeltnis 1,25) */',
  ':root {',
  '  --text-xs: 0.64rem;    /* 10.24px */',
  '  --text-base: 1rem;     /* 16px */',
  '}',
);
const CSS_EN = lines(
  '/* Example well-structured type scale (1.25 ratio) */',
  ':root {',
  '  --text-xs: 0.64rem;    /* 10.24px */',
  '  --text-base: 1rem;     /* 16px */',
  '}',
);

const JS_DE = lines(
  '// Vorher (defekt)',
  "import { helper } from './utils/helper';",
  '',
  '// Nachher (repariert — Datei nach lib/ verschoben)',
  "import { helper } from './lib/helper';",
);
const JS_EN = lines(
  '// Before (broken)',
  "import { helper } from './utils/helper';",
  '',
  '// After (fixed — file moved to lib/)',
  "import { helper } from './lib/helper';",
);

test('css: a block-comment-only translation scores a perfect match', () => {
  const m = measure(CSS_DE, CSS_EN, 'css');
  assert.equal(m.measurable, true);
  assert.equal(m.containment, 1, 'de/review-web-design regressed to a fork signal');
});

test('javascript: a line-comment-only translation scores a perfect match', () => {
  const m = measure(JS_DE, JS_EN, 'javascript');
  assert.equal(m.measurable, true);
  assert.equal(m.containment, 1, 'de/repair-broken-references regressed to a fork signal');
});

test('per-tag comment syntax is load-bearing, not decoration', () => {
  // The same bytes under the prototype's rule. `bash` strips `#` and knows
  // nothing of `//` or `/* */`, which is exactly how these two files produced
  // the maximum fork signal on the most innocuous possible change.
  const asHash = measure(JS_DE, JS_EN, 'bash');
  assert.equal(asHash.measurable, true);
  assert.ok(
    asHash.containment < DEFAULT_FORK_THRESHOLD,
    `expected the wrong comment syntax to misfire, got ${asHash.containment}`,
  );
});

// ── constraint 1: per-tag identifier shape ──────────────────────────────────
//
// `de/prepare-print-model` scored 0.30 on a faithful config block: an R-tuned
// identifier regex finds nothing R-shaped in YAML, so the measure fell through
// to natural-language words — which a config block legitimately translates,
// because its VALUES are prose and only its KEYS are skeleton.

const YAML_DE = lines(
  'layer_height: 0.2mm',
  'line_width: 0.4mm (= Duesendurchmesser)',
  'perimeters: 3-4 (strukturell), 2 (kosmetisch)',
  'infill_pattern: gyroid (FDM), grid (einfach)',
  'temperature: materialspezifisch (siehe select-print-material Skill)',
);
const YAML_EN = lines(
  'layer_height: 0.2mm',
  'line_width: 0.4mm (= nozzle diameter)',
  'perimeters: 3-4 (structural), 2 (cosmetic)',
  'infill_pattern: gyroid (FDM), grid (basic)',
  'temperature: material-specific (see select-print-material skill)',
);

test('yaml: translated prose in VALUES does not move the score', () => {
  const m = measure(YAML_DE, YAML_EN, 'yaml');
  assert.equal(m.measurable, true);
  assert.equal(m.containment, 1, 'de/prepare-print-model regressed to a fork signal');
});

test('yaml: a changed KEY does move the score', () => {
  // Without this the test above is vacuous — keys-mode would also score 1 if it
  // extracted nothing at all, which is precisely the empty-set trap below.
  const forked = YAML_EN.replace('layer_height:', 'exposure_time:').replace('perimeters:', 'lift_speed:');
  const m = measure(forked, YAML_EN, 'yaml');
  assert.equal(m.measurable, true);
  assert.ok(m.containment < 1, 'key changes are invisible, so keys-mode measures nothing');
});

test('keys-mode buys margin on a config block that generic tokens only survive', () => {
  // Measured, and narrower than the claim this test was first written to make.
  // The prototype scored the real `de/prepare-print-model` fences 0.30 because
  // its identifier regex was tuned for R and found almost nothing in YAML. The
  // generic tokenizer here is broader and already clears the threshold on the
  // same bytes — 0.68 and 0.72 on the two full fences. So generic-vs-keys is
  // NOT what rescues that file; a usable identifier shape is.
  //
  // Keys-mode still earns its place by removing the erosion rather than
  // outrunning it: value prose is the thing a config fence legitimately
  // translates, and every word of it drags a generic score toward the
  // threshold. A block with a higher prose-to-key ratio than this one crosses.
  const asKeys = measure(YAML_DE, YAML_EN, 'yaml');
  const asGeneric = measure(YAML_DE, YAML_EN, 'bash');
  assert.equal(asKeys.containment, 1);
  assert.ok(
    asGeneric.containment < asKeys.containment,
    `keys-mode should score strictly higher; got ${asGeneric.containment} vs ${asKeys.containment}`,
  );
});

test('keys-mode is coarser than generic but still catches a permutation', () => {
  // The cost of measuring 8 keys instead of 41 tokens is sensitivity, so the
  // reduction has to be shown non-blind: swapping this skill's two real config
  // fences is the fork shape a yaml block can actually take.
  const FDM = YAML_EN;
  const SLA = lines(
    'layer_height: 0.05mm',
    'bottom_layers: 6-8 (strong bed adhesion)',
    'exposure_time: material-specific (2-8s per layer)',
    'lift_speed: 60-80mm/min',
    'retract_speed: 150-180mm/min',
  );
  const m = measure(FDM, SLA, 'yaml');
  assert.equal(m.measurable, true);
  assert.ok(
    m.containment < DEFAULT_FORK_THRESHOLD,
    `a swapped config fence scored ${m.containment}, at or above the threshold`,
  );
});

// ── constraint 2: never score an empty token set as a pass ───────────────────

test('a fence with no code tokens is unmeasured, NOT a perfect match', () => {
  // Containment over an empty denominator is vacuously 1. Reporting that as a
  // pass hid 8 of #503's 86 fences behind an apparent "0 suspects".
  const de = lines('# Modell in den Slicer importieren', '# Wandstaerke pruefen');
  const en = lines('# Import the model into the slicer', '# Check wall thickness');
  const m = measure(de, en, 'bash');
  assert.equal(m.measurable, false);
  assert.equal(m.reason, 'no-code-tokens');
  assert.equal(m.containment, undefined, 'an unreadable fence was handed a score');
});

test('an empty basis is unmeasured even when the translated side has tokens', () => {
  const m = measure('install.packages("bslib")', '# nothing but a comment', 'r');
  assert.equal(m.measurable, false);
  assert.equal(m.reason, 'no-code-tokens-in-basis');
});

test('an unrecognised tag is unmeasured, never scored by a default', () => {
  // Guessing fails in the dangerous direction: a wrong comment syntax does not
  // add noise, it inverts the signal, so a genuinely misaligned fence of that
  // tag becomes indistinguishable from a faithful one.
  const m = measure('rate(x[5m])', 'rate(y[5m])', 'promql');
  assert.equal(m.measurable, false);
  assert.equal(m.reason, 'unknown-tag:promql');
});

test('an untagged fence is unmeasured rather than assumed', () => {
  const m = measure('a', 'b', '');
  assert.equal(m.measurable, false);
  assert.equal(m.reason, 'unknown-tag:untagged');
});

// ── the true positive ───────────────────────────────────────────────────────

test('the one known content fork scores below the threshold', () => {
  // de/design-shiny-ui Schritt 5 is English Step 6, so ordinal mapping pairs the
  // accessibility step's body against the custom-CSS step's. Both files carry 8
  // `r` fences in an identical tag sequence, so neither structural guard sees it.
  const de = lines(
    '# Semantisches HTML mit ARIA-Labels',
    'ui <- page_fillable(',
    '  tags$a(href = "#main", class = "skip-link", "Zum Inhalt springen"),',
    '  tags$main(id = "main", role = "main",',
    '    plotOutput("chart", alt = "Umsatz nach Quartal")',
    '  )',
    ')',
  );
  const en = lines(
    '# Inline CSS',
    'ui <- page_sidebar(',
    '  theme = my_theme,',
    '  tags$style(HTML("',
    '    .value-box { border-radius: 8px; }',
    '  ")),',
    '  sidebar = sidebar("Controls")',
    ')',
  );
  const m = measure(de, en, 'r');
  assert.equal(m.measurable, true);
  assert.ok(
    m.containment < DEFAULT_FORK_THRESHOLD,
    `a known fork scored ${m.containment}, at or above the threshold`,
  );
});

test('a faithful r translation of the SAME shape stays above the threshold', () => {
  // The paired positive: without it the test above passes on a detector that
  // scores everything low.
  const de = lines(
    '# Marken-Theme definieren',
    'my_theme <- bslib::bs_theme(',
    '  version = 5,',
    '  primary = "#0054AD"',
    ')',
  );
  const en = lines(
    '# Define the brand theme',
    'my_theme <- bslib::bs_theme(',
    '  version = 5,',
    '  primary = "#0054AD"',
    ')',
  );
  const m = measure(de, en, 'r');
  assert.equal(m.measurable, true);
  assert.equal(m.containment, 1);
});

// ── the scanner ─────────────────────────────────────────────────────────────

test('a comment marker inside a string does not open a comment', () => {
  const { tokens } = codeTokens('grep pattern "value # not a comment" file', 'bash');
  assert.ok(tokens.has('file'), 'a quoted # truncated the rest of the line');
});

test('a quote inside a comment does not open a string', () => {
  // Otherwise the apostrophe swallows every following line as string body, and
  // the skeleton on that side collapses while the other side keeps its own.
  const { tokens } = codeTokens(lines("# it's fine", 'library(shiny)', 'runApp()'), 'r');
  assert.ok(tokens.has('library') && tokens.has('runApp'), 'an apostrophe in a comment ate the code');
});

test('an unterminated quote stops at the newline instead of eating the fence', () => {
  const { tokens } = codeTokens(lines('echo "unterminated', 'kubectl apply -f pod.yaml'), 'bash');
  assert.ok(tokens.has('kubectl'), 'an unbalanced quote swallowed the rest of the fence');
});

test('hash only opens a comment at a word boundary', () => {
  const { tokens } = codeTokens('docker build -t image:tag#digest .', 'bash');
  assert.ok(tokens.has('digest'), 'a mid-word # was read as a comment');
});

test('css does not treat // as a comment, so a bare url survives', () => {
  const { tokens } = codeTokens('background: url(http://example.com/a.png);', 'css');
  assert.ok(tokens.has('png'), 'a // inside a url truncated the declaration');
});

test('block comments span lines', () => {
  const stripped = stripCommentsAndStrings(
    lines('/* line one', '   line two */', 'body { color: red; }'), TAG_SYNTAX.css,
  );
  assert.ok(!stripped.includes('line two'));
  assert.ok(stripped.includes('color'));
});

test('an unterminated block comment does not leave its text as code', () => {
  const stripped = stripCommentsAndStrings(lines('/* runs to EOF', 'still comment'), TAG_SYNTAX.css);
  assert.equal(stripped.trim(), '');
});

test('stripping preserves line count, which the key extractors depend on', () => {
  const body = lines('a: 1', '# note', 'b: 2');
  const stripped = stripCommentsAndStrings(body, TAG_SYNTAX.yaml);
  assert.equal(stripped.split('\n').length, body.split('\n').length);
});

test('python triple-quoted docstrings are string bodies, not code', () => {
  const de = lines('def f():', '    """Gibt den Wert zurueck."""', '    return value');
  const en = lines('def f():', '    """Return the value."""', '    return value');
  const m = measure(de, en, 'python');
  assert.equal(m.measurable, true);
  assert.equal(m.containment, 1);
});

test('sql uses -- for line comments', () => {
  const m = measure(
    lines('-- Alle Chargen', 'SELECT batch_id FROM batches;'),
    lines('-- All batches', 'SELECT batch_id FROM batches;'),
    'sql',
  );
  assert.equal(m.containment, 1);
});

test('html uses <!-- --> for comments', () => {
  const m = measure(
    lines('<!-- Kopfzeile -->', '<main id="content"></main>'),
    lines('<!-- Header -->', '<main id="content"></main>'),
    'html',
  );
  assert.equal(m.containment, 1);
});

test('json keys are the skeleton', () => {
  const m = measure(
    '{ "name": "Werkzeug", "beschreibung": "Ein Werkzeug" }',
    '{ "name": "tool", "beschreibung": "A tool" }',
    'json',
  );
  assert.equal(m.measurable, true);
  assert.equal(m.containment, 1);
});

// ── the measure itself ──────────────────────────────────────────────────────

test('containment is over the BASIS token set, not the union', () => {
  // The question is how much of what would be written is already there, so a
  // translated body carrying extra code must not dilute the denominator.
  const m = measure('alpha beta gamma delta', 'alpha beta', 'bash');
  assert.equal(m.measurable, true);
  assert.equal(m.containment, 1);
  assert.equal(m.tokens, 2);
});

test('the report carries the token count the verdict rests on', () => {
  // Both live false positives are small-token artifacts; a reviewer can only
  // dismiss them if n travels with the score.
  const m = measure('cd /pfad/zum/skript', 'cd /path/to/script', 'bash');
  assert.equal(m.measurable, true);
  assert.equal(typeof m.tokens, 'number');
  assert.equal(typeof m.shared, 'number');
  assert.ok(m.tokens > 0);
});

test('the default threshold sits between the measured populations', () => {
  // Clean population minimum across the 956 merged-batch fences: 0.40.
  // Fork population: six of eight below 0.26. Any value in (0.25, 0.40)
  // separates them; the default is deliberately above that band for margin.
  assert.ok(DEFAULT_FORK_THRESHOLD > 0.25);
  assert.ok(DEFAULT_FORK_THRESHOLD <= 0.5);
});

// ── the per-tag `strings` entries ───────────────────────────────────────────
//
// Every entry in a syntax's `strings` list is a mutation site of its own, and
// dropping one does not merely lose coverage — it turns the translated string
// body back into "code", which is the false-refusal direction. Assert each
// quote style the corpus actually uses.

test('single-quoted string bodies are not code (HASH family)', () => {
  const m = measure("echo 'Verarbeitung abgeschlossen'", "echo 'Processing complete'", 'bash');
  assert.equal(m.measurable, true);
  assert.equal(m.containment, 1, 'dropping SQ from HASH makes faithful translations look forked');
});

test('double-quoted string bodies are not code (HASH family)', () => {
  const m = measure('message <- "Fertig"', 'message <- "Done"', 'r');
  assert.equal(m.measurable, true);
  assert.equal(m.containment, 1);
});

test('backtick template bodies are not code (C family)', () => {
  const m = measure(
    'const label = `Bericht erzeugt`;',
    'const label = `Report generated`;',
    'typescript',
  );
  assert.equal(m.measurable, true);
  assert.equal(m.containment, 1, 'dropping BQ from SLASH makes faithful translations look forked');
});

test('an escaped quote does not close the string early', () => {
  const { tokens } = codeTokens('echo "a \\" b" && kubectl get pods', 'bash');
  assert.ok(tokens.has('kubectl'), 'an escaped quote ended the string and swallowed the command');
});

// ── tags whose skeleton is not what the family default assumes ──────────────

test('toml keys and table headers are extracted, not silently unmeasurable', () => {
  // TOML spells assignment `key = value`, so the YAML `key:` extractor matched
  // nothing and every TOML fence reported `no-code-tokens` — a benign-sounding
  // reason ("all comments") for a tooling gap.
  const de = ['[paket]', 'name = "werkzeug"', 'version = "1.0"  # Fassung'].join('\n');
  const en = ['[paket]', 'name = "tool"', 'version = "1.0"  # release'].join('\n');
  const m = measure(de, en, 'toml');
  assert.equal(m.measurable, true, `toml scored unmeasurable: ${m.reason}`);
  assert.equal(m.containment, 1);
  assert.ok(m.tokens >= 3, `expected the table header and both keys, got ${m.tokens}`);
});

test('a rust lifetime does not open a string and eat the signature', () => {
  // `'` is a lifetime sigil as well as a char quote, so admitting single-quoted
  // strings for rust deletes the rest of the line from the skeleton.
  const { tokens } = codeTokens("fn parse<'a>(input: &'a str) -> Result<Token, Error> {", 'rust');
  assert.ok(tokens.has('Result'), 'a lifetime swallowed the return type');
  assert.ok(tokens.has('Error'), 'a lifetime swallowed the error type');
});

test('ini treats ; as a comment, its canonical marker', () => {
  const m = measure(
    ['; Datenbankeinstellungen', 'host = localhost'].join('\n'),
    ['; Database settings', 'host = localhost'].join('\n'),
    'ini',
  );
  assert.equal(m.measurable, true);
  assert.equal(m.containment, 1);
});
