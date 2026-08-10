/**
 * code-tokens.js
 *
 * Per-tag code-skeleton extraction and a containment measure, for detecting the
 * content forks that `normalize-i18n-fences.js` would otherwise rewrite blind
 * (#498).
 *
 * ## The question this answers
 *
 * The normalizer maps translated fence *i* onto English fence *i*, guarded by
 * fence count and tag sequence. Both can agree coincidentally while the
 * translation's steps no longer correspond to English — `de/design-shiny-ui`
 * carries 8 `r` fences in the same tag sequence as its English source, but its
 * Schritt 5 is English's Step 6. Restoring by ordinal there gives every fence
 * the body of a different step, and neither existing gate can see it:
 * `check-i18n-fence-parity.js` asks whether a body matches SOME English fence in
 * SOME revision, and a scrambled file is a permutation of legitimate English
 * bodies, so every fence individually passes.
 *
 * ## The measure
 *
 * A faithful translation localises comments and string literals and leaves the
 * CODE alone — that is the keep-code-in-English rule the repair exists to
 * restore. So strip exactly what a translator legitimately rewrites (comments,
 * string bodies) and compare what is left: the code skeleton. An old and new
 * body of the same fence share nearly all of it; a fork shares almost none.
 *
 * `containment(pre, post) = |tokens(post) ∩ tokens(pre)| / |tokens(post)|`
 *
 * — the fraction of the restored body's skeleton already present in the body
 * being replaced.
 *
 * ## Why this file is per-tag, and why it is default-deny
 *
 * The prototype was one regex tuned for R identifiers stripping `#` comments,
 * and it produced five false positives across seven #477 batches, in two
 * distinct modes, both traced to that single assumption:
 *
 * 1. **`de/prepare-print-model` scored 0.30** (#495). A YAML-ish config fence has
 *    nothing R-shaped in it, so the measure fell through to natural-language
 *    words — which a faithful translation legitimately changes.
 *
 *    The fix is the identifier shape, and it is worth being exact about which
 *    part does the work: `GENERIC_TOKEN` below is broad enough to score those
 *    two real fences 0.68 and 0.72, already clear of the threshold. `tokens:
 *    'keys'` takes them to 1.00 by dropping the value prose entirely — in a
 *    config block the keys are the skeleton and the values are documentation
 *    (`temperature: material-specific (see select-print-material skill)`). So
 *    keys-mode is not what rescues this file; it removes the erosion that a
 *    block with a higher prose-to-key ratio would ride across the threshold.
 *
 * 2. **Four files scored 0.00** (batch 7) — the maximum fork signal on the most
 *    innocuous possible change. `de/repair-broken-references` (`javascript`) and
 *    `de|es|zh-CN/review-web-design` (`css`) were comment-only restores at zero
 *    non-comment changed lines. Stripping `#` and not `//` or `/* *\/` meant the
 *    "code tokens" being measured in those fences WERE the comment words.
 *
 * That second mode is why an unrecognised tag is `unmeasured` rather than
 * measured with a plausible default. Guessing wrong fails in the dangerous
 * direction: a JS fence that genuinely WAS misaligned would have been
 * indistinguishable from those four, so a wrong default does not merely add
 * noise — it destroys the signal for every tag it covers. An honest "cannot
 * measure this" is recoverable; a confident wrong score is not.
 *
 * The same reasoning governs the empty-token case. Containment over an empty
 * denominator is vacuously 1, so an unparseable fence scores a silent perfect —
 * on #503 that hid 8 of 86 fences behind an apparent "0 suspects". `measure()`
 * returns `measurable: false` there instead, and callers must report it.
 *
 * Adding a tag here requires knowing its comment syntax and deciding whether its
 * skeleton is identifiers or keys. Do not add one by analogy.
 */

/**
 * `line`    — line-comment markers.
 * `block`   — [open, close] pairs; not nested, per C-family semantics.
 * `strings` — quote delimiters whose contents are dropped, longest first.
 * `tokens`  — which skeleton a fence of this tag has: `generic` (identifiers and
 *             numerics) or `keys` (a config block, where values carry prose).
 *
 * `wordStart` markers only open a comment at the start of a line or after
 * whitespace. `#` and `%` and `--` occur mid-token often enough that ignoring
 * this eats real code (`foo#bar`, `50%`, `a--b`); `//` does not, and requiring
 * it there would miss the overwhelmingly common `x = 1;// note`.
 */
const WORD_START_MARKERS = new Set(['#', '%', '--']);

const DQ = { open: '"', close: '"', escape: '\\' };
const SQ = { open: "'", close: "'", escape: '\\' };
const BQ = { open: '`', close: '`', escape: '\\' };

const HASH = { line: ['#'], block: [], strings: [DQ, SQ], tokens: 'generic' };
const SLASH = { line: ['//'], block: [['/*', '*/']], strings: [DQ, SQ, BQ], tokens: 'generic' };

/**
 * Every tag the tool can measure. The live #477 backlog at the time of writing
 * is bash=126 r=105 yaml=33 dockerfile=21 typescript=19 python=9 json=7 nginx=5
 * protobuf=4 css=2 latex=2 gitignore=1 sql=1 — all covered here. Tags outside
 * this table (`logql`, `bibtex`, `traceql`, `powershell`, `language` …) report
 * `unmeasured` rather than being scored by a default that has not been checked
 * against them.
 */
export const TAG_SYNTAX = {
  // Shell family and friends: `#` line comments, identifier skeleton.
  bash: HASH,
  sh: HASH,
  shell: HASH,
  zsh: HASH,
  console: HASH,
  r: HASH,
  ruby: HASH,
  perl: HASH,
  dockerfile: HASH,
  nginx: HASH,
  gitignore: HASH,
  makefile: HASH,
  properties: HASH,
  // `;` is INI's canonical comment marker and `#` only its common extension, so
  // HASH alone counts semicolon comment prose as code tokens.
  ini: { line: ['#', ';'], block: [], strings: [DQ, SQ], tokens: 'generic' },

  // Python additionally drops triple-quoted docstrings, which translators do
  // rewrite; leaving them in measures prose.
  python: {
    line: ['#'],
    block: [],
    strings: [
      { open: '"""', close: '"""' },
      { open: "'''", close: "'''" },
      DQ, SQ,
    ],
    tokens: 'generic',
  },

  // C family.
  javascript: SLASH,
  js: SLASH,
  jsx: SLASH,
  typescript: SLASH,
  ts: SLASH,
  tsx: SLASH,
  java: SLASH,
  c: SLASH,
  cpp: SLASH,
  go: SLASH,
  // Rust deliberately does NOT get SLASH: `'` is a lifetime sigil, not only a
  // char quote, so `&'a str` opens a string that runs to the end of the line and
  // deletes the rest of the signature from the skeleton.
  rust: { line: ['//'], block: [['/*', '*/']], strings: [DQ, BQ], tokens: 'generic' },
  kotlin: SLASH,
  swift: SLASH,
  scala: SLASH,
  groovy: SLASH,
  protobuf: SLASH,
  proto: SLASH,
  scss: SLASH,
  less: SLASH,

  // CSS proper has no `//`. Admitting it would truncate at an unquoted
  // `url(http://…)`, which is legal CSS — and the two measured `css` false
  // positives were both block comments, so there is no evidence for the risk.
  css: { line: [], block: [['/*', '*/']], strings: [DQ, SQ], tokens: 'generic' },

  sql: { line: ['--'], block: [['/*', '*/']], strings: [DQ, SQ], tokens: 'generic' },
  html: { line: [], block: [['<!--', '-->']], strings: [DQ, SQ], tokens: 'generic' },
  xml: { line: [], block: [['<!--', '-->']], strings: [DQ, SQ], tokens: 'generic' },
  svg: { line: [], block: [['<!--', '-->']], strings: [DQ, SQ], tokens: 'generic' },
  latex: { line: ['%'], block: [], strings: [], tokens: 'generic' },
  tex: { line: ['%'], block: [], strings: [], tokens: 'generic' },

  // Config blocks: the keys are the skeleton, the values carry prose.
  yaml: { line: ['#'], block: [], strings: [], tokens: 'keys' },
  yml: { line: ['#'], block: [], strings: [], tokens: 'keys' },
  // TOML spells assignment `key = value`, so the YAML `key:` extractor matches
  // nothing in it — every TOML fence came out `no-code-tokens`, which reads as
  // "this fence is all comments" when the truth is "this tool cannot parse it".
  // A wrong reason is worse than an unknown tag, because it names a benign
  // cause for a tooling gap.
  toml: { line: ['#'], block: [], strings: [], tokens: 'toml-keys' },
  // JSON has no comment syntax at all; jsonc/json5 are not in the corpus.
  json: { line: [], block: [], strings: [], tokens: 'json-keys' },
  jsonl: { line: [], block: [], strings: [], tokens: 'json-keys' },
};

/**
 * Blank out comments and string bodies, preserving line structure so the
 * line-anchored key extractors still see the shape they expect.
 *
 * A single left-to-right scan rather than a per-language lexer: it has to be
 * right about the interaction between the three (a `#` inside a string is not a
 * comment; a `"` inside a comment does not open a string), and that interaction
 * is what a sequence of independent regex passes gets wrong.
 */
export function stripCommentsAndStrings(body, syntax) {
  const { line = [], block = [], strings = [] } = syntax;
  const blank = (s) => s.replace(/[^\n]/g, ' ');
  const n = body.length;
  let out = '';
  let i = 0;

  const atWordStart = (idx) => idx === 0 || /\s/.test(body[idx - 1]);

  outer: while (i < n) {
    for (const [open, close] of block) {
      if (body.startsWith(open, i)) {
        const end = body.indexOf(close, i + open.length);
        const stop = end < 0 ? n : end + close.length;
        out += blank(body.slice(i, stop));
        i = stop;
        continue outer;
      }
    }

    for (const marker of line) {
      if (!body.startsWith(marker, i)) continue;
      if (WORD_START_MARKERS.has(marker) && !atWordStart(i)) continue;
      let end = body.indexOf('\n', i);
      if (end < 0) end = n;
      out += blank(body.slice(i, end));
      i = end;
      continue outer;
    }

    for (const s of strings) {
      if (!body.startsWith(s.open, i)) continue;
      let j = i + s.open.length;
      while (j < n) {
        if (s.escape && body[j] === s.escape) { j += 2; continue; }
        if (body.startsWith(s.close, j)) { j += s.close.length; break; }
        // An unterminated quote must not swallow the rest of the fence — a
        // lone apostrophe in an English comment is common, and eating from
        // there to EOF would delete most of the skeleton on one side only.
        if (body[j] === '\n' && s.open.length === 1) break;
        j += 1;
      }
      out += blank(body.slice(i, Math.min(j, n)));
      i = Math.min(j, n);
      continue outer;
    }

    out += body[i];
    i += 1;
  }

  return out;
}

const GENERIC_TOKEN = /[A-Za-z_][A-Za-z0-9_]*|[0-9]+(?:\.[0-9]+)?/g;
const YAML_KEY = /^[ \t]*(?:-[ \t]+)?["']?([A-Za-z_][A-Za-z0-9_.-]*)["']?[ \t]*:/gm;
const JSON_KEY = /"([^"\\\n]+)"[ \t]*:/g;
// `[table]` headers as well as `key =`: a TOML fence can be mostly headers.
const TOML_KEY = /^[ \t]*(?:\[+[ \t]*)?["']?([A-Za-z_][A-Za-z0-9_.-]*)["']?[ \t]*(?:=|\])/gm;

/**
 * The code skeleton of one fence body, as a set of tokens.
 * @returns {{ok: true, tokens: Set<string>} | {ok: false, reason: string}}
 */
export function codeTokens(body, tag) {
  const syntax = TAG_SYNTAX[String(tag || '').toLowerCase()];
  if (!syntax) return { ok: false, reason: `unknown-tag:${tag || 'untagged'}` };

  const stripped = stripCommentsAndStrings(body, syntax);
  const pattern = syntax.tokens === 'keys' ? YAML_KEY
    : syntax.tokens === 'json-keys' ? JSON_KEY
      : syntax.tokens === 'toml-keys' ? TOML_KEY
        : GENERIC_TOKEN;

  const tokens = new Set();
  pattern.lastIndex = 0;
  let m;
  while ((m = pattern.exec(stripped)) !== null) {
    tokens.add(m[1] !== undefined ? m[1] : m[0]);
    if (m[0] === '') pattern.lastIndex += 1;
  }
  return { ok: true, tokens };
}

/**
 * How much of `post`'s code skeleton is already present in `pre`.
 *
 * Never returns a score for an empty denominator. Containment over an empty set
 * is vacuously 1, which is indistinguishable from a perfect match and is how a
 * fence the extractor could not read becomes a silent pass.
 *
 * @returns {{measurable: true, containment: number, tokens: number, shared: number}
 *          | {measurable: false, reason: string}}
 */
export function measure(pre, post, tag) {
  const a = codeTokens(pre, tag);
  const b = codeTokens(post, tag);
  if (!a.ok) return { measurable: false, reason: a.reason };
  if (!b.ok) return { measurable: false, reason: b.reason };
  if (b.tokens.size === 0) {
    return { measurable: false, reason: a.tokens.size === 0 ? 'no-code-tokens' : 'no-code-tokens-in-basis' };
  }
  let shared = 0;
  for (const t of b.tokens) if (a.tokens.has(t)) shared += 1;
  return {
    measurable: true,
    containment: shared / b.tokens.size,
    tokens: b.tokens.size,
    shared,
  };
}

/**
 * Below this, ordinal mapping is treated as untrustworthy and the file is
 * refused rather than rewritten.
 *
 * Measured over two populations, not guessed.
 *
 * **Clean population** — the 956 measurable fences the seven merged #477 batches
 * actually restored, each already human-reviewed at merge:
 *
 *   1.00  930    0.8-0.9  5    0.6-0.7  6    0.4-0.5  3
 *   0.9-1.0 3    0.7-0.8  4    0.5-0.6  5    below 0.4: none
 *
 * **Fork population** — the 8 fences of `de/design-shiny-ui`, the one known
 * content fork: 0.00, 0.00, 0.04, 0.12, 0.20, 0.25, 0.83, 0.86.
 *
 * Six of the eight sit below the clean population's minimum of 0.40, so any
 * threshold in (0.25, 0.40) separates the two on this data. 0.5 is deliberately
 * above that band, and it is worth being exact about which risk the margin buys
 * down, because the obvious phrasing has it backwards.
 *
 * Raising the threshold refuses MORE. So the margin does nothing about a future
 * clean fence scoring below 0.40 — that fence gets refused either way, and a
 * false refusal is the recoverable error: the file goes to manual triage. What
 * the margin covers is the unobserved upper tail of the FORK population, a fork
 * scoring in [0.40, 0.50) that a threshold fitted to the clean minimum would
 * wave through and rewrite. With one fork on record, that tail is unmeasured,
 * and 0.5 prices it at 3 fences in 2 files out of the 345 swept.
 *
 * Both false suspects are small-token artifacts and are reported with their
 * token count so a reviewer can see it: `de/generate-puzzle` (c=0.40, n=5) is a
 * translated path placeholder `/pfad/zum/skript.R`, where two words out of five
 * tokens cost 0.40; `ja/instrument-distributed-tracing` (c=0.43, n=7, twice) is
 * an elision comment written `# ...` inside a `go` fence, where `#` is not a
 * comment marker, so its prose counts as code. A minimum-token floor would
 * remove both — floor=8 clears all three suspects — but it reclassifies 332 of
 * 956 fences (35%) as unmeasurable, and buying a 0.3% false-positive rate with
 * a third of the tool's coverage is the wrong trade. Report `n`; let the human
 * dismiss it.
 *
 * Note the fork's own spread: two of its eight fences score 0.83 and 0.86, above
 * ANY threshold in the separating band. That is why the refusal is FILE-scoped
 * on the minimum rather than per-fence — a per-fence rule would have restored
 * two fences of a file known to be scrambled, the partly-rewritten-file-with-
 * nothing-going-red outcome the batch carve-outs exist to avoid.
 */
export const DEFAULT_FORK_THRESHOLD = 0.5;
