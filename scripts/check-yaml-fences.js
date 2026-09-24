#!/usr/bin/env node
/**
 * check-yaml-fences.js
 *
 * Every ```yaml fence in the corpus must parse as YAML (#507).
 *
 * ## Why this is a gate and not a style preference
 *
 * #472 freezes a fence by its TAG: everything between the delimiters is either
 * frozen to English or localisable, and `yaml` is frozen. That is the right
 * answer for a machine-consumed document and the wrong one for a reference table
 * a human reads, and the tag is the only thing distinguishing them — so a
 * mislabelled fence quietly freezes content that should have been translatable.
 *
 * `skills/escalate-issues/SKILL.md` carried a `yaml` fence holding a routing
 * header AND the markdown incident report beneath it. The German translation had
 * that report in German; #508 restored it to English, correctly per the rule,
 * and the surrounding German prose still told the reader to write one.
 *
 * What turns that from a judgement call into a decidable one is that the fence
 * **was not YAML**. `js-yaml` rejects it at the `---` separating the header from
 * the prose. Three fences in `troubleshoot-print-issues` and one in
 * `render-publication-graphic` were the same shape — printer settings and
 * publication requirements written with ranges (`1.0-2.0mm`), arrows
 * (`0.98 → 0.96`) and bullet lists, which is a reference table, not a config.
 *
 * So the rule is: if it is tagged `yaml`, it parses. If it does not parse, it is
 * either broken YAML or it is not YAML, and both need fixing at the source rather
 * than being frozen into ten locales.
 *
 * This is also what keeps retagging honest. CLAUDE.md names retagging a `yaml`
 * fence to `text` as the way the freeze's scope could be edited from inside the
 * gated file. Correcting a mislabel is not that — but the two are only
 * distinguishable if something checks which fences are genuinely YAML, and this
 * is that something.
 *
 * ## Exemptions are decided by the ERROR, never by the file or the body
 *
 * Three shapes legitimately do not parse, each named with its reason:
 *
 * - **Go templates.** `write-helm-chart` shows Helm chart sources, which are Go
 *   templates that happen to produce YAML. `{{- if .Values… }}` is not YAML and
 *   is not meant to be. Recognised by the error landing ON a `{{ … }}` line.
 * - **Duplicate-key illustrations.** A good-versus-bad pair in one fence is a
 *   documented idiom in this corpus's guides, and duplicate keys are exactly what
 *   makes the bad half bad.
 * - **Tags this parser's schema lacks.** js-yaml 5's DEFAULT_SCHEMA implements no
 *   custom tags, so CloudFormation shorthand (`!Ref`) and even core `!!binary`
 *   are rejected. That is the parser, not the document.
 *
 * Pinning exemptions to `file:line` would rot on the first edit above them, and a
 * rotted exemption either fails a clean file or silently covers a new defect.
 * Keying on the error costs some precision — an accidental duplicate key in a
 * real config example would pass — and buys a list that cannot drift out of date.
 * Every exempted fence is REPORTED rather than skipped silently, so the set stays
 * visible and a reviewer can see it grow.
 *
 * The Go-template test is on the error's own LINE, and that distinction is the
 * whole of it. Testing the body for `{{ }}` anywhere reads as "is this a
 * template?" and means "does this fence contain two braces?" — it matched 24 of
 * 331 English fences where only 4 are Helm sources, forgiving every parse error
 * in twenty valid GitHub Actions and Prometheus documents. Those are the MOST
 * machine-consumed fences in the corpus.
 *
 * ## Scope: English and its mirrors
 *
 * Scoping this to English was the first version, and the first run of this gate
 * disproved it: a genuine fix to `write-helm-chart` was applied to English and to
 * none of its ten mirrors, all of which still failed to parse. Nothing else could
 * report them — `check-i18n-fence-parity.js` accepts a translated body matching
 * ANY historical English revision, and a stale broken body is exactly that.
 *
 * Usage:
 *   node scripts/check-yaml-fences.js
 *   node scripts/check-yaml-fences.js --json
 *   node scripts/check-yaml-fences.js --root <dir>   # for tests
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';
import { extractFences, TREES, contentKey, isExcludedId } from './lib/fences.js';

const argv = process.argv.slice(2);
let JSON_OUT = false;
let rootArg = null;
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  const eq = arg.indexOf('=');
  const name = eq >= 0 ? arg.slice(0, eq) : arg;
  if (name === '--json') {
    JSON_OUT = true;
  } else if (name === '--root') {
    // Read-only, and the reason this file is testable at all: the checks need a
    // corpus to run against, while `js-yaml` has to resolve from the repository
    // that installed it. Pointing the real script at a fixture tree separates
    // those, where copying the script into a throwaway repo could not.
    rootArg = eq >= 0 ? arg.slice(eq + 1) : argv[++i];
    if (rootArg === undefined || rootArg === '' || rootArg.startsWith('--')) {
      console.error('ERROR: --root requires a value');
      process.exit(2);
    }
  } else {
    console.error(`ERROR: unknown argument '${arg}'`);
    process.exit(2);
  }
}

const ROOT = rootArg
  ? resolve(rootArg)
  : resolve(dirname(fileURLToPath(import.meta.url)), '..');

if (!existsSync(ROOT) || !statSync(ROOT).isDirectory()) {
  console.error(`ERROR: --root is not a directory: '${ROOT}'`);
  process.exit(2);
}

/**
 * Every content file under one root: the four trees, non-content ids skipped via
 * `isExcludedId`.
 *
 * That skip is REDUNDANT with the `contentKey` call below, and deliberately kept. It is why
 * this tool never had the #519 bug: it drops `_template` before `contentKey` is consulted, so
 * the flat/nested asymmetry could not reach it. It also short-circuits two `existsSync` calls.
 *
 * The previous wording — "`_`-prefixed ids skipped the way `buildEnglishFenceHistory` skips
 * them" — described a redundancy as if it were the mechanism, inviting a reader to believe the
 * skip works BECAUSE the history builder does the same thing. Post-#546 both go through the one
 * predicate, so they cannot drift; before it, that sentence was the drift's alibi.
 */
function contentFiles(base, prefix = '') {
  const out = [];
  for (const tree of TREES) {
    const dir = join(base, tree);
    if (!existsSync(dir) || !statSync(dir).isDirectory()) continue;
    for (const entry of readdirSync(dir)) {
      if (isExcludedId(entry)) continue;
      const rel = tree === 'skills' ? `${tree}/${entry}/SKILL.md` : `${tree}/${entry}`;
      if (contentKey(rel) === null) continue;
      const abs = join(base, rel);
      if (!existsSync(abs) || !statSync(abs).isFile()) continue;
      out.push(prefix + rel);
    }
  }
  return out;
}

/**
 * English AND its locale mirrors.
 *
 * Scoping this to English was wrong, and the first run of this very gate proved
 * it: the orphaned-`tls:` fix in `write-helm-chart` was applied to English and
 * to none of its ten mirrors, which all still failed to parse. Nothing else
 * could report them — `check-i18n-fence-parity.js` accepts a translated body
 * matching ANY historical English revision, and a stale broken body is exactly
 * that, so it is excused forever.
 *
 * A frozen fence is a copy of English, so this costs nothing while the copy is
 * faithful, and names the file when it is not.
 */
function allFiles() {
  const out = contentFiles(ROOT);
  const i18n = join(ROOT, 'i18n');
  if (existsSync(i18n) && statSync(i18n).isDirectory()) {
    for (const loc of readdirSync(i18n)) {
      if (!statSync(join(i18n, loc)).isDirectory()) continue;
      out.push(...contentFiles(join(i18n, loc), `i18n/${loc}/`));
    }
  }
  return out.sort();
}

/**
 * Why a fence that does not parse is allowed to. Returns null when it is not.
 *
 * Every test here is on the ERROR, never on the body. The first version tested
 * `/\{\{.*\}\}/s` against the whole body, which reads as "is this a template?"
 * and actually means "does this fence contain two braces anywhere?" — matching
 * 24 of 331 English fences, of which only 4 are Helm sources. The other 20 are
 * valid GitHub Actions (`${{ matrix.config.os }}`) and Prometheus YAML, i.e.
 * precisely the fences that ARE machine-consumed, and for all 24 any parse error
 * whatsoever was forgiven. Two fences differing only by a `${{ }}` expression,
 * both carrying the orphaned-`tls:` defect this gate was built to catch, were
 * reported `exempted` and `failing` respectively.
 *
 * Keying on the reported line fixes it without losing the real templates: all
 * four genuine Helm errors land ON a `{{ … }}` line, and a broken workflow's
 * error does not.
 */
function exemption(bodyLines, message, mark) {
  const errorLine = mark && Number.isInteger(mark.line) ? bodyLines[mark.line] : undefined;
  if (errorLine !== undefined && /\{\{|\}\}/.test(errorLine)) return 'go-template';
  if (/duplicated mapping key/i.test(message)) return 'duplicate-key-illustration';
  // js-yaml 5's DEFAULT_SCHEMA implements no custom tags, so CloudFormation
  // shorthand (`!Ref`) and even core `!!binary` are rejected. That is the
  // parser's schema, not the document being un-YAML, and the remedy this gate
  // prints — retag to `text` — would be exactly the freeze-scope edit CLAUDE.md
  // warns about if applied to one of those.
  if (/unknown .*tag/i.test(message)) return 'unsupported-tag-schema';
  return null;
}

const failures = [];
const exempted = [];
let checked = 0;

const files = allFiles();
// A root with no content trees checks nothing and would print a clean line.
// `existsSync` + `isDirectory` is a proxy for the question; membership in the
// scan's own output is the question.
if (files.length === 0) {
  console.error(`ERROR: no content trees (${TREES.join(', ')}) under '${ROOT}'`);
  console.error('Nothing would be checked, and the run would report a clean-looking zero.');
  process.exit(2);
}

for (const rel of files) {
  const text = readFileSync(join(ROOT, rel), 'utf8');
  for (const f of extractFences(text)) {
    if (f.lang !== 'yaml' && f.lang !== 'yml') continue;
    checked += 1;
    try {
      // `loadAll`, not `load`: a multi-document fence is legal YAML and must not
      // be reported as broken.
      yaml.loadAll(f.body);
    } catch (e) {
      const message = String(e.message).split('\n')[0];
      const why = exemption(f.body.split('\n'), message, e.mark);
      const hit = { file: rel, line: f.line, message: message.slice(0, 120) };
      if (why) exempted.push({ ...hit, exemption: why });
      else failures.push(hit);
    }
  }
}

if (JSON_OUT) {
  console.log(JSON.stringify({ checked, failures, exempted }, null, 2));
  process.exit(failures.length ? 1 : 0);
}

console.log(`yaml fences checked: ${checked}`);
// Reported, never skipped silently: an exemption list nobody can see is one
// nobody notices growing.
if (exempted.length) {
  const byClass = new Map();
  for (const e of exempted) byClass.set(e.exemption, (byClass.get(e.exemption) || 0) + 1);
  console.log(`exempted: ${exempted.length}  (${[...byClass.entries()].map(([k, v]) => `${k}=${v}`).join('  ')})`);
  for (const e of exempted) console.log(`  ${e.file}:${e.line}  [${e.exemption}]`);
}

if (failures.length === 0) {
  console.log('\nOK: every yaml-tagged fence parses, or is an exempted class.');
  process.exit(0);
}

console.log(`\n${failures.length} yaml-tagged fence(s) do not parse:`);
for (const f of failures) {
  console.log(`  ${f.file}:${f.line}`);
  console.log(`      ${f.message}`);
}
console.log('');
console.log('A fence tagged `yaml` is frozen to English by #472, so a mislabelled one');
console.log('freezes content that should have been translatable.');
console.log('');
console.log('If the fence IS machine-consumed, fix the YAML. That is the default, and');
console.log('retagging it `text` would be the freeze-scope edit CLAUDE.md warns against.');
console.log('Retag only when the body is a reference table a human reads rather than a');
console.log('machine: prose values, ranges, or bullet lists where a parser expects data.');
process.exit(1);
