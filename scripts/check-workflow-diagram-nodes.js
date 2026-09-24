#!/usr/bin/env node
/**
 * check-workflow-diagram-nodes.js
 *
 * Node-set parity between the PUT annotations in `viz/` and the committed
 * Mermaid diagram at `viz/public/data/workflow.mmd` (#590, dependency-free
 * slice).
 *
 * `viz/public/data/workflow.mmd` is generated, committed, and fetched at
 * runtime by `viz/js/workflow.js` — the same staleness shape #363 fixed for
 * `skills.json`, except the deploy job never regenerates this one. Nothing in
 * the repository has ever compared it against its source. This does, in one
 * direction each:
 *
 *   missing-node  an id is annotated in `viz/` and has no node in the diagram
 *   orphan-node   a node id is in the diagram and no longer annotated in `viz/`
 *
 * ## What it CANNOT see — read this before quoting a clean run
 *
 * Node identity only. All of the following are invisible to it:
 *
 *   - **Labels.** `bind_modes` READ "Bind mode switching (2D/3D/Hive/Chord/
 *     Flow)" while six modes were bound — Campfire missing (#639). The source
 *     annotation was corrected in #702; the committed diagram still carries the
 *     five-mode text, because repairing it means regenerating, which #601
 *     blocks. This check was green through the defect and is green through the
 *     divergence, which is the point: it compares ids, and `bind_modes` was
 *     never missing from either side. `scripts/test/viz-mode-label.test.js`
 *     covers the SOURCE label against the code. Nothing gates the diagram's COPY
 *     of it — that divergence is what #601 closes.
 *   - **`node_type`.** An `input` retyped to `process` moves the node's shape
 *     and its `class` line; the id is unchanged, so nothing here fires.
 *   - **Edges.** `input:`/`output:` chains build the `-->` block. A rewired
 *     graph with the same node set is clean here.
 *   - **Source-side annotation staleness.** An annotation describing code that
 *     no longer does that is a correct annotation to this tool.
 *
 * It also parses only LINE-ANCHORED node definitions — `^  id[…]`, one per
 * line, which is what putior emits. A node defined inline on an edge line
 * (`a --> b[…]`) is not seen. That restriction is deliberate: scanning
 * anywhere on the line makes every label containing `word[` or `word(` a
 * phantom node, and a checker that invents nodes is worse than one with a
 * stated boundary.
 *
 * ## The ruler, before the finding
 *
 * Three separate ways to build this instrument produce a wrong count, and two
 * of them were live while writing it. Measured on `6ab3728a7`:
 *
 *   - Anchoring the diagram scan on `[` alone reports FIVE missing nodes where
 *     one is real: `read_registries`, `fetch_data`, `glyph_mapping` and
 *     `resolve_glyph` render as `id(["…"])` because they are `node_type:
 *     "input"`. Four fifths of that finding would be the instrument.
 *   - Not mirroring the generator's own `exclude` adds two more:
 *     `build-workflow.R` and `build-workflow.js` annotate themselves and are
 *     excluded from their own scan. Hence PATTERN and EXCLUDE below are parsed
 *     OUT of `build-workflow.R` rather than restated here — the A10 move, so
 *     the two cannot drift.
 *   - Walking the filesystem instead of asking git scans 7,177 files instead
 *     of 72 and adds two more findings: `viz/renv/library/` is present in a
 *     working checkout, gitignored, and ships putior's own annotated examples.
 *     Enumeration is `git ls-files -co --exclude-standard`, so `node_modules/`
 *     and `renv/library/` are excluded by the repo's own ignore rules rather
 *     than by a second list that could disagree with them. (The walk also took
 *     over two minutes on this NTFS mount against an instant `git ls-files`,
 *     but the correctness argument is the one that decides it.)
 *
 * Two of these were live while writing the tool; the third is the one to be
 * careful about quoting. `rg 'put id:' viz/renv/…/putior/examples/` returns
 * THIRTY-TWO lines and only TWO of them are reachable, because the rest sit
 * inside R string literals as `put id:\"…\"` — demo code that writes example
 * files, not annotations in the scanned form. The measured delta is 2, and a
 * "32 vendored annotations" line would have been a number produced by a
 * pattern rather than by the instrument.
 *
 * There is a corollary this tool does NOT resolve, filed as #637:
 * `build-workflow.R` passes putior no exclusion for `renv/` or `node_modules/`
 * at all, so whether a regeneration would ingest anything from them depends on
 * putior's internal filtering. That is unverified — #601 says the lockfile
 * cannot produce a working generator, which is also why this gate ships
 * warn-only. Its claim is therefore about the repository's own `viz/` sources,
 * not about what a regeneration would emit.
 *
 * Annotations are read as single-line `put id:"…"`. putior's multi-line form
 * is not parsed; nothing in `viz/` uses it.
 *
 * Exit 0 = the node sets agree (or `--warn`). Exit 1 = a parity finding.
 * Exit 2 = the question could not be answered, and must never read as a pass.
 *
 * Usage:
 *   node scripts/check-workflow-diagram-nodes.js
 *   node scripts/check-workflow-diagram-nodes.js --warn
 *   node scripts/check-workflow-diagram-nodes.js --json
 *   node scripts/check-workflow-diagram-nodes.js --root <dir>
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Fail closed. This is "I cannot tell you", never a verdict. */
function refuse(message) {
  console.error(`ERROR: ${message}`);
  process.exit(2);
}

function flagValue(name, fallback) {
  const i = process.argv.indexOf(name);
  if (i < 0) return fallback;
  const v = process.argv[i + 1];
  if (v === undefined || v.startsWith('--')) refuse(`${name} requires a value`);
  return v;
}

const AS_JSON = process.argv.includes('--json');
const WARN_ONLY = process.argv.includes('--warn');
const ROOT = resolve(flagValue('--root', resolve(__dirname, '..')));

const GENERATOR = 'viz/build-workflow.R';
const DIAGRAM = 'viz/public/data/workflow.mmd';
const SOURCE_DIR = 'viz';

/**
 * Finding identity is the NODE, not the file.
 *
 * `check-debt-ratchet.js` keys a member on `file` + `kind`, so two findings of
 * one kind in one file would collapse into a single ratcheted member and
 * repairing either would leave the other silently covered. Encoding the node
 * into `file` keeps the ratchet exact-set per node without changing its key
 * model. `path` and `node` are published separately so nothing has to parse
 * this back apart. The durable fix — an optional `member` component in the
 * ratchet's key — is #638.
 */
const memberKey = (path, node) => `${path}::${node}`;

/**
 * The id alphabet, defined ONCE because the two sides must not disagree.
 *
 * Annotations are read with `[^"]+`, which accepts far more than the diagram
 * line parser can capture. `put id:"3d_view"` or `put id:"mode-x"` — both
 * legal mermaid — would produce a diagram node this parser cannot see, so the
 * annotation reads as `missing-node` forever while its node sits in the file
 * unparsed. Worse than a wrong number: the fix for a persistent finding is to
 * ratchet it, which would write an instrument artifact into `debt-ratchet.yml`
 * as though it were debt.
 *
 * So an id outside this alphabet is a REFUSAL rather than a finding. The
 * checker declines to answer instead of answering wrongly, and widening the
 * diagram parser is the change that lifts the restriction — in one place.
 */
const ID_SOURCE = '[A-Za-z_][A-Za-z0-9_]*';
const ID_ONLY = new RegExp(`^${ID_SOURCE}$`);

/**
 * R string literal -> the regex it denotes.
 *
 * `"\\.(js|R)$"` in the file is the six characters `\\.(js` … on disk; the R
 * parser collapses `\\` to `\` before the regex engine ever sees it. Reading
 * the raw bytes and compiling them would give `\\.` — an escaped backslash —
 * which matches nothing here and would report every file as out of scope.
 *
 * The supported subset is deliberately narrow and named here so nobody assumes
 * more: `\\`, `\"`, `\n`, `\t`, `\r`, and `\<char>` for anything else. Numeric
 * escapes (hex, unicode, octal) are NOT decoded and would yield a
 * different regex than R's parser produces. Nothing in `build-workflow.R` uses
 * one, and a pattern that did would need this function extended rather than
 * trusted. R's regex dialect is TRE, not ECMAScript, so a POSIX class like
 * `[[:alpha:]]` compiles here with different semantics and silently — another
 * reason to keep generator patterns to plain suffix anchors.
 */
function unescapeRString(raw) {
  return raw.replace(/\\(.)/g, (_, c) => {
    if (c === 'n') return '\n';
    if (c === 't') return '\t';
    if (c === 'r') return '\r';
    return c;
  });
}

/**
 * Read the string literals of one `c(…)` vector, starting just after its `(`.
 *
 * Written as a scanner because the obvious `exclude\s*=\s*c\(([^)]*)\)` stops
 * at the first `)` — including one inside a string literal — and the failure
 * is not reliably loud. `c("build\\.js$", "\\.(min)\\.js$")` truncates inside
 * the second literal, leaves ONE complete literal behind, and the checker then
 * scans a file the generator excludes. Usually that is noisy: a spurious
 * `missing-node`. But if the wrongly-scanned file annotates an id that IS in
 * the diagram and nothing in scope annotates, the lost exclusion SUPPRESSES an
 * orphan-node finding — a silent pass, caused by a parenthesis, in a file
 * whose live `pattern` already contains one.
 *
 * Anything it does not understand is a refusal, never a partial answer.
 */
function readCVector(text, from) {
  const literals = [];
  let i = from;
  while (i < text.length) {
    const c = text[i];
    if (c === ')') return { literals, end: i };
    if (c === ',' || /\s/.test(c)) { i++; continue; }
    if (c !== '"') {
      refuse(`${GENERATOR}: \`exclude = c(…)\` contains ${JSON.stringify(text.slice(i, i + 24))}, which is not a double-quoted string literal; this checker will not guess at the generator's exclusions`);
    }
    let j = i + 1;
    let body = '';
    while (j < text.length) {
      if (text[j] === '\\') { body += text[j] + (text[j + 1] ?? ''); j += 2; continue; }
      if (text[j] === '"') break;
      body += text[j];
      j++;
    }
    if (j >= text.length) refuse(`${GENERATOR}: unterminated string literal in \`exclude = c(…)\``);
    literals.push(body);
    i = j + 1;
  }
  refuse(`${GENERATOR}: \`exclude = c(…)\` is never closed`);
}

function compileOrRefuse(source, what) {
  try {
    return new RegExp(source);
  } catch (e) {
    refuse(`${GENERATOR}: ${what} '${source}' is not a usable regex — ${e.message}`);
  }
}

/**
 * Hoist the generator's own scan predicate instead of restating it.
 *
 * Both fields are required and both refuse on absence or ambiguity. A second
 * `pattern =` in the file means the wrong one could be picked silently, which
 * is the class of mistake that makes a checker's scope quietly differ from the
 * generator's while both look correct.
 */
function readGeneratorScope() {
  const path = join(ROOT, GENERATOR);
  if (!existsSync(path)) refuse(`no generator at ${GENERATOR} — its scan scope is what this check mirrors`);
  const text = readFileSync(path, 'utf8');

  const patternMatches = [...text.matchAll(/pattern\s*=\s*"((?:[^"\\]|\\.)*)"/g)];
  if (patternMatches.length === 0) refuse(`${GENERATOR}: no \`pattern = "…"\` found; cannot mirror the generator's file selection`);
  if (patternMatches.length > 1) refuse(`${GENERATOR}: ${patternMatches.length} \`pattern = "…"\` assignments; which one selects source files is ambiguous`);

  const excludeOpeners = [...text.matchAll(/exclude\s*=\s*c\(/g)];
  if (excludeOpeners.length === 0) refuse(`${GENERATOR}: no \`exclude = c(…)\` found; cannot mirror the generator's exclusions`);
  if (excludeOpeners.length > 1) refuse(`${GENERATOR}: ${excludeOpeners.length} \`exclude = c(…)\` vectors; which one applies is ambiguous`);

  const { literals } = readCVector(text, excludeOpeners[0].index + excludeOpeners[0][0].length);
  if (literals.length === 0) refuse(`${GENERATOR}: \`exclude = c(…)\` holds no string literals`);
  const excludeSources = literals.map(unescapeRString);

  return {
    pattern: compileOrRefuse(unescapeRString(patternMatches[0][1]), 'pattern'),
    excludes: excludeSources.map((source) => compileOrRefuse(source, 'exclude entry')),
    excludeSources,
  };
}

/**
 * Tracked plus untracked-not-ignored, so a source file added in the working
 * tree counts before it is committed while ignored trees never do.
 */
function listSourceFiles(scope) {
  // `-z`, not newline-delimited output. Without it git applies `core.quotepath`
  // and emits a non-ASCII path as `"viz/js/caf\303\251.js"` — quotes included —
  // which fails the `$`-anchored pattern test and drops the file from the scan
  // silently. That is the dangerous direction: an annotation in such a file
  // becomes invisible and the gate reads clean over a real missing node.
  //
  // Measured on a two-file fixture carrying one ASCII and one accented source,
  // reverting BOTH this flag and the NUL split together (a coherent revert, not
  // the incoherent one a single-line mutation produces):
  //
  //   shipped   2 source file(s), 2 annotation(s)  -> exit 1, flags node_accented
  //   reverted  1 source file(s), 1 annotation(s)  -> exit 0, "OK: every
  //                                                   annotated id has a node"
  //
  // An exit 0 over a real missing node, with a plausible-looking count beside
  // it. The `sees an annotation in a file whose name git would quote` test is
  // the control for this.
  const r = spawnSync('git', ['-C', ROOT, 'ls-files', '-z', '-co', '--exclude-standard', '--', SOURCE_DIR], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  if (r.error) refuse(`could not enumerate ${SOURCE_DIR}/ — ${r.error.message}`);
  if (r.status !== 0) refuse(`git ls-files failed in ${ROOT} (exit ${r.status}) — ${(r.stderr || '').trim().slice(0, 300)}`);

  return r.stdout
    .split('\0')
    .filter(Boolean)
    .filter((relPath) => scope.pattern.test(relPath))
    .filter((relPath) => !scope.excludes.some((re) => re.test(relPath)));
}

function collectAnnotations(files) {
  const byNode = new Map();
  for (const relPath of files) {
    const abs = join(ROOT, relPath);
    if (!existsSync(abs)) continue; // deleted-but-still-listed; the diagram side will report it
    for (const line of readFileSync(abs, 'utf8').split('\n')) {
      const m = /put\s+id:\s*"([^"]+)"/.exec(line);
      if (!m) continue;
      if (!ID_ONLY.test(m[1])) {
        refuse(`${relPath} annotates id ${JSON.stringify(m[1])}, which is outside the alphabet the diagram parser can read (${ID_ONLY}). It would be reported missing forever while its node sat in ${DIAGRAM} unparsed — see the id-alphabet note in this file's header.`);
      }
      if (!byNode.has(m[1])) byNode.set(m[1], relPath);
    }
  }
  return byNode;
}

/**
 * Node ids from the committed diagram.
 *
 * Shapes: `id["…"]`, `id[["…"]]`, `id(["…"])`, `id("…")`, `id{"…"}`. The
 * opening bracket class is deliberately wider than the three shapes putior
 * emits today for the node types `viz/` uses, because the remaining types
 * (`artifact`, `start`, `end`) cannot be observed while #601 blocks a
 * regeneration — a narrow class would silently report their nodes as orphans.
 *
 * SKIP_PREFIX is deliberately redundant with that anchor, and a mutation
 * deleting it SURVIVES `npm run test:scripts`. That is a measured fact, not a
 * coverage hole to tidy away by removing either half. Enumerated over
 * {anchored, scan-anywhere} x {skip, no skip} x four lines — three taken from
 * the committed diagram, plus one CONSTRUCTED unspaced subgraph, since all
 * eight subgraph lines in the real file are spaced — the skip changes the
 * answer in exactly ONE of sixteen cells:
 *
 *   scan-anywhere + `subgraph build_data["build-data.js"]` + no skip
 *     -> a phantom node `build_data`, named after the FILE
 *
 * Every keyword line putior emits today begins with a bare word and a space,
 * which `^id<bracket>` already rejects — so the list guards a parser change
 * rather than today's input. It is kept because the anchor is the half under
 * pressure: inline definitions on edge lines are documented above as unseen,
 * and the obvious way to add them is to scan anywhere on the line. At that
 * point the unspaced subgraph form — which mermaid accepts and putior does not
 * currently emit — starts contributing nodes.
 *
 * Credit where it belongs, though: the durable control is the TEST, not this
 * list. `does not mistake a subgraph declaration for a node, spaced or
 * unspaced` carries the unspaced fixture, so a scan-anywhere rewrite goes red
 * whether or not the list survives. The list is what makes the fix already
 * written when it does.
 */
const SKIP_PREFIX = /^(%%|subgraph\b|end\b|class\b|classDef\b|style\b|linkStyle\b|flowchart\b|graph\b|direction\b)/;

function collectDiagramNodes(text) {
  const ids = new Set();
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || SKIP_PREFIX.test(trimmed)) continue;
    const m = new RegExp(`^(${ID_SOURCE})(\\[\\[|\\(\\[|\\[|\\(|\\{)`).exec(trimmed);
    if (m) ids.add(m[1]);
  }
  return ids;
}

function main() {
  const scope = readGeneratorScope();
  const sourceFiles = listSourceFiles(scope);
  if (sourceFiles.length === 0) {
    refuse(`no ${SOURCE_DIR}/ file matched the generator's pattern ${scope.pattern} — an empty scan reports no findings for the wrong reason`);
  }

  const annotations = collectAnnotations(sourceFiles);
  if (annotations.size === 0) {
    refuse(`scanned ${sourceFiles.length} file(s) and found no \`put id:"…"\` annotation — the diagram cannot be checked against nothing`);
  }

  const diagramPath = join(ROOT, DIAGRAM);
  if (!existsSync(diagramPath)) refuse(`no diagram at ${DIAGRAM}`);
  const diagramNodes = collectDiagramNodes(readFileSync(diagramPath, 'utf8'));
  if (diagramNodes.size === 0) {
    refuse(`${DIAGRAM} parsed to zero nodes — either it is empty or the node syntax changed, and both must refuse rather than report every annotation missing`);
  }

  const findings = [];
  for (const [node, path] of [...annotations].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (!diagramNodes.has(node)) {
      findings.push({
        kind: 'missing-node',
        file: memberKey(path, node),
        path,
        node,
        detail: `annotated in ${path}, absent from ${DIAGRAM}`,
      });
    }
  }
  for (const node of [...diagramNodes].sort()) {
    if (!annotations.has(node)) {
      findings.push({
        kind: 'orphan-node',
        file: memberKey(DIAGRAM, node),
        path: DIAGRAM,
        node,
        detail: `a node in ${DIAGRAM} that no ${SOURCE_DIR}/ source annotates`,
      });
    }
  }

  const report = {
    root: ROOT,
    generator: GENERATOR,
    diagram: DIAGRAM,
    pattern: String(scope.pattern),
    excludes: scope.excludeSources,
    sourceFilesScanned: sourceFiles.length,
    annotationsFound: annotations.size,
    diagramNodes: diagramNodes.size,
    findings,
    // The ratchet validates its slice's `kinds` and `scanned_field` against
    // these rather than against "is it a number" — a kind nobody emits, or a
    // finding count named as a coverage floor, both select nothing and read as
    // a held ratchet.
    kinds: ['missing-node', 'orphan-node'],
    scannedFields: ['sourceFilesScanned', 'annotationsFound'],
  };

  if (AS_JSON) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    for (const f of findings) console.log(`${WARN_ONLY ? 'WARN' : 'FAIL'} [${f.kind}] ${f.node} — ${f.detail}`);
    console.log(`\nviz diagram node parity: ${sourceFilesScannedLine(report)}`);
    if (findings.length === 0) {
      console.log('OK: every annotated id has a node, and every node has an annotation.');
    } else {
      console.log(`${findings.length} parity finding(s). Regenerating the diagram needs a working putior (#601).`);
    }
  }

  process.exit(findings.length === 0 || WARN_ONLY ? 0 : 1);
}

function sourceFilesScannedLine(report) {
  return `${report.sourceFilesScanned} source file(s), ${report.annotationsFound} annotation(s), ${report.diagramNodes} diagram node(s)`;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}

export { collectDiagramNodes, unescapeRString, memberKey };
