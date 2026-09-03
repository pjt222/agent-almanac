#!/usr/bin/env node
/**
 * check-workflow-contract.js — every `agent()` spawn in `workflows/*.mjs` honours the capability
 * contract, and every phase title is declared (#773).
 *
 * Integrity check A7 reads a workflow's sidecar and proves the discovery triple-equality
 * (filename == sidecar name == meta.name). It reads nothing INSIDE the body, so two mutants the
 * adversarial review of #772 named passed every gate:
 *
 *   agentType: 'Explore'  ->  'general-purpose'   a read-only stage silently becomes an
 *                                                  implementing one — the contract in
 *                                                  workflows/README.md, violated with no red
 *   phase('Verify')       ->  phase('Verfiy')      a title no meta.phases[] entry carries, so the
 *                                                  progress display shows an unlabelled group
 *
 * Membership alone cannot catch the first: `general-purpose` is a perfectly valid type. What
 * decides whether a stage may target an implementing type is whether that stage MUTATES, and
 * nothing declared that until now. So the sidecar gains one field:
 *
 *   // implementing-phases: Generate
 *
 * naming the phases in which spawns may target implementing types. Absent means none — a new
 * workflow that forgets it and spawns `general-purpose` fails loudly rather than quietly. The
 * rule has a strict direction and a lenient one, on purpose. Strict: a spawn whose type is
 * implementing must sit in a listed phase (that is the mutant above). Lenient: a listed phase
 * must contain AT LEAST ONE implementing spawn — not all of them — because a phase that pairs a
 * read-only scout with a writer is an ordinary shape, and the declaration is per phase while the
 * behaviour is per spawn. A stage with `isolation: 'worktree'` must be implementing, since the
 * contract names that as mutation.
 *
 * Types are classified by sources the repository already keeps: the four built-in types this
 * repository's workflows use by a fixed map (Explore, Plan advisory; general-purpose, claude
 * implementing — Claude Code offers more, and one outside the map fails closed), and every
 * almanac agent by the `intent:` line integrity check A6 already requires in its frontmatter.
 * That makes this a chain: A7b proves declaration-consistency, and A6a is what keeps each
 * `intent:` line honest against the agent's tools. An unknown type, or an intent value outside
 * advisory|implementing, is a FAIL, not a skip — silently classifying nothing is how a check
 * goes dead.
 *
 * Phase titles are exact sets, three ways: sidecar `phases:` == `meta.phases[].title` == the
 * titles the body uses through `phase()` and the `phase:` option. A declared phase no stage uses
 * is drift in the other direction and is reported as such.
 *
 * ## How the body is read
 *
 * No JS parser (this job runs with no `npm ci`; see A8). The file is masked first — strings,
 * template literals and comments blanked to spaces, positions preserved, quote characters
 * kept — and the options object of each `agent()` call is found by walking from the
 * `agentType` key back to its enclosing `{` and forward to the matching `}` over the masked
 * text. Keys are LOCATED in the masked text too, and only their values are sliced from the
 * original at that offset: the first draft located keys in the original, so a commented-out
 * `// agentType: 'Explore'` above the live key was the one it read — a false negative on the
 * exact mutant class this check exists for (caught in review). The count of `agent(` calls is
 * compared with the count of options objects found, so a spawn whose options are spread from a
 * variable is reported rather than skipped. Measured against the corpus this survives:
 * multi-line options objects carrying trailing `//` comments (batch-generate-waves 283–284),
 * extra keys (`effort: 'high'`, verify-handoff 250), and template-literal labels containing
 * `${…}` braces. A regex literal containing a quote or brace would defeat the mask; none exists
 * in the corpus, and a span the walk cannot close is reported as exit 2 rather than guessed. A
 * mask failure that yields a wrong-but-closable span is the residual the parser cannot see.
 *
 * Three further residuals the call-count comparison does NOT close, stated rather than implied:
 * an `agent()` call written inside a template literal is blanked by the mask and so is invisible
 * to both counters at once; aliasing the primitive (`const spawn = agent`) matches no
 * `agent\s*\(`; and the comparison is of cardinalities rather than a pairing, so within one file
 * a missed spawn and a stray `agentType` object cancel. Relatedly, a shared options base reused
 * across spawns (`agent(p, { ...base, label: 'y' })` twice against one literal) IS reported —
 * deliberately, since a spread base defeats the per-spawn classification that is the whole point.
 *
 * `_template.mjs` is scaffolding and is not read (the shared `isTemplateSegment` predicate,
 * the same one A7 and the symlink sync use — never a private copy of that set).
 *
 * Exit 0 clean; 1 findings; 2 could not measure (no workflows, no agents with an intent, an
 * unreadable file, zero spawns found, a span the parser could not close). 2 is never a pass.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isExcludedId, isTemplateSegment } from './lib/content-paths.js';

export const BUILTIN_INTENT = Object.freeze({
  Explore: 'advisory',
  Plan: 'advisory',
  'general-purpose': 'implementing',
  claude: 'implementing',
});

export const INTENT_VALUES = Object.freeze(['advisory', 'implementing']);

export const SIDECAR_IMPLEMENTING_FIELD = 'implementing-phases';

// ── reading ─────────────────────────────────────────────────────────────────

/** Blank strings, template literals and comments to spaces, keeping every position and quote. */
export function maskCode(text) {
  const out = text.split('');
  let i = 0;
  const n = text.length;
  const blank = (from, to) => { for (let k = from; k < to; k++) if (out[k] !== '\n') out[k] = ' '; };
  while (i < n) {
    const c = text[i];
    const next = text[i + 1];
    if (c === '/' && next === '/') {
      const end = text.indexOf('\n', i);
      const stop = end === -1 ? n : end;
      blank(i, stop);
      i = stop;
    } else if (c === '/' && next === '*') {
      const end = text.indexOf('*/', i + 2);
      const stop = end === -1 ? n : end + 2;
      blank(i, stop);
      i = stop;
    } else if (c === '\'' || c === '"' || c === '`') {
      let j = i + 1;
      while (j < n && text[j] !== c) {
        if (text[j] === '\\') j++;
        else if (c !== '`' && text[j] === '\n') break;
        j++;
      }
      blank(i + 1, Math.min(j, n));
      i = Math.min(j + 1, n);
    } else {
      i++;
    }
  }
  return out.join('');
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

/**
 * Read `key: <literal>` inside [from, to) — the key located in MASKED text, the value sliced
 * from the original at that offset. `{ present, literal, value }`: absent key; a key whose
 * value is not a plain quoted literal (a variable, a ternary, a template with `${…}`); or the
 * value.
 */
export function readKey(text, masked, from, to, key) {
  const re = new RegExp(`\\b${key}\\s*:\\s*`, 'g');
  re.lastIndex = from;
  const m = re.exec(masked);
  if (!m || m.index >= to) return { present: false, literal: false, value: null };
  const at = m.index + m[0].length;
  const q = text[at];
  if (q !== '\'' && q !== '"' && q !== '`') return { present: true, literal: false, value: null };
  // The CLOSING quote is found in MASKED text, like the key: maskCode blanks a string's
  // interior and preserves both true delimiters, so an escaped quote inside the value is not
  // mistaken for the end. Searching `text` here truncated such a value — the same half-step
  // the finding-1 fix was about, one line over.
  const end = masked.indexOf(q, at + 1);
  if (end === -1 || end > to) return { present: true, literal: false, value: null };
  const value = text.slice(at + 1, end);
  if (q === '`' && value.includes('${')) return { present: true, literal: false, value: null };
  return { present: true, literal: true, value };
}

/** The sidecar `// key: value` fields at the top of the file. */
export function parseSidecar(text) {
  const fields = {};
  const lines = text.split('\n');
  if (lines[0]?.trim() !== '// ---') return fields;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].replace(/\r$/, '');
    if (line.trim() === '// ---') break;
    const m = line.match(/^\/\/ ([A-Za-z-]+):\s*(.*)$/);
    if (m) fields[m[1]] = m[2].trim();
  }
  return fields;
}

const splitList = (value) => (value ?? '').split(',').map((s) => s.trim()).filter(Boolean);

/**
 * Titles inside `phases: [ ... ]` of `export const meta`, in order.
 *
 * Returns `{ titles, nonLiteralLines }`, or null when the block is not found. The second field
 * is a plain field rather than a property hung on the array: a title the parser could not read
 * must be REPORTED (the other two readers report theirs), and smuggling it alongside an array
 * return made `deepEqual` in the tests fail for a reason unrelated to the assertion.
 */
export function parseMetaPhases(text, masked = maskCode(text)) {
  const metaAt = masked.indexOf('export const meta');
  if (metaAt === -1) return null;
  const phasesAt = masked.indexOf('phases:', metaAt);
  if (phasesAt === -1) return null;
  const open = masked.indexOf('[', phasesAt);
  if (open === -1) return null;
  let depth = 0;
  let close = -1;
  for (let i = open; i < masked.length; i++) {
    if (masked[i] === '[') depth++;
    else if (masked[i] === ']') { depth--; if (depth === 0) { close = i; break; } }
  }
  if (close === -1) return null;
  const titles = [];
  const nonLiteral = [];
  const re = /\btitle\s*:/g;
  re.lastIndex = open;
  let m;
  while ((m = re.exec(masked)) && m.index < close) {
    const k = readKey(text, masked, m.index, close, 'title');
    if (k.literal) titles.push(k.value);
    else nonLiteral.push(lineOf(text, m.index));
    re.lastIndex = m.index + m[0].length;
  }
  // Reported, not dropped: the other two readers report a non-literal value, and a silent
  // drop here surfaces later as "the sidecar names X, which meta.phases[] does not declare",
  // which fails closed but names the wrong thing.
  return { titles, nonLiteralLines: nonLiteral };
}

/** Every `phase(…)` call in the body: `{ title, line }`, title null when not a plain literal. */
export function parsePhaseCalls(text, masked = maskCode(text)) {
  const calls = [];
  for (const m of masked.matchAll(/\bphase\(\s*/g)) {
    const at = m.index + m[0].length;
    const q = text[at];
    if (q !== '\'' && q !== '"' && q !== '`') { calls.push({ title: null, line: lineOf(text, m.index) }); continue; }
    const end = masked.indexOf(q, at + 1);
    const value = end === -1 ? null : text.slice(at + 1, end);
    const literal = value !== null && !(q === '`' && value.includes('${'));
    calls.push({ title: literal ? value : null, line: lineOf(text, m.index) });
  }
  return calls;
}

/** Number of `agent(` call sites in the body (masked, so strings and comments do not count). */
export function countAgentCalls(masked) {
  return (masked.match(/\bagent\s*\(/g) ?? []).length;
}

/**
 * Every options object carrying `agentType:` — the shape of an `agent(prompt, { ... })` call.
 * Returns `{ calls, unclosed }`; an unclosed span is a parser limit, reported not guessed.
 */
export function parseAgentCalls(text, masked = maskCode(text)) {
  const calls = [];
  const unclosed = [];
  for (const m of masked.matchAll(/\bagentType\s*:/g)) {
    let depth = 0;
    let open = -1;
    for (let i = m.index; i >= 0; i--) {
      const ch = masked[i];
      if (ch === '}') depth++;
      else if (ch === '{') { if (depth === 0) { open = i; break; } depth--; }
    }
    if (open === -1) { unclosed.push(lineOf(text, m.index)); continue; }
    depth = 0;
    let close = -1;
    for (let i = open; i < masked.length; i++) {
      const ch = masked[i];
      if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) { close = i; break; } }
    }
    if (close === -1) { unclosed.push(lineOf(text, m.index)); continue; }
    const read = (key) => readKey(text, masked, open, close, key);
    calls.push({
      line: lineOf(text, m.index),
      agentType: read('agentType'),
      phase: read('phase'),
      isolation: read('isolation'),
      label: read('label'),
    });
  }
  return { calls, unclosed };
}

// ── judging ─────────────────────────────────────────────────────────────────

const setDiff = (a, b) => [...a].filter((x) => !b.has(x));

/**
 * Findings for one workflow. `agentIntents` maps almanac agent id -> the raw `intent:` value.
 * @returns {{findings: string[], unclosed: number[], measured: object}}
 */
export function checkWorkflow({ path, text, agentIntents }) {
  const findings = [];
  const name = basename(path);
  const masked = maskCode(text);
  const sidecar = parseSidecar(text);
  const sidecarPhases = new Set(splitList(sidecar.phases));
  const implementingPhases = new Set(splitList(sidecar[SIDECAR_IMPLEMENTING_FIELD]));
  const parsedMeta = parseMetaPhases(text, masked);
  const metaTitles = parsedMeta?.titles ?? null;
  const phaseCalls = parsePhaseCalls(text, masked);
  const { calls, unclosed } = parseAgentCalls(text, masked);
  const agentCallSites = countAgentCalls(masked);
  const measured = { calls: calls.length, agentCallSites, phaseCalls: phaseCalls.length, phases: metaTitles?.length ?? 0 };

  for (const line of unclosed) findings.push(`${name}:${line} agent() options object could not be closed by the parser`);

  if (agentCallSites !== calls.length) {
    findings.push(`${name} has ${agentCallSites} agent( call(s) but ${calls.length} options object(s) carrying a literal agentType — ${agentCallSites > calls.length ? 'a spawn is naming its type somewhere this check cannot read it (options spread from a variable, or built dynamically)' : 'an agentType key appears outside any agent() call (an aliased spawn helper, a nested schema property, or a spec object)'}; every spawn must name its type in a literal options object`);
  }

  if (metaTitles === null) {
    findings.push(`${name} has no parseable meta.phases[] (expected \`phases: [ { title: '…' } ]\` in export const meta)`);
    return { findings, unclosed, measured };
  }
  const meta = new Set(metaTitles);
  for (const line of parsedMeta.nonLiteralLines) {
    findings.push(`${name}:${line} meta.phases[] title is not a plain string literal`);
  }
  const dupes = metaTitles.filter((t, i) => metaTitles.indexOf(t) !== i);
  for (const d of dupes) findings.push(`${name} meta.phases[] lists '${d}' more than once`);

  // sidecar phases == meta titles, both directions
  for (const t of setDiff(meta, sidecarPhases)) findings.push(`${name} meta.phases[] title '${t}' is not in the sidecar '// phases:' list`);
  for (const t of setDiff(sidecarPhases, meta)) findings.push(`${name} sidecar '// phases:' names '${t}', which meta.phases[] does not declare`);

  // used titles == meta titles, both directions
  const used = new Set();
  for (const c of phaseCalls) {
    if (c.title === null) { findings.push(`${name}:${c.line} phase() title is not a plain string literal`); continue; }
    used.add(c.title);
    if (!meta.has(c.title)) findings.push(`${name}:${c.line} phase('${c.title}') is not a meta.phases[] title`);
  }
  for (const c of calls) {
    if (!c.phase.present) { findings.push(`${name}:${c.line} agent() options carry no phase: — every spawn must belong to a declared phase`); continue; }
    if (!c.phase.literal) { findings.push(`${name}:${c.line} phase: is not a plain string literal`); continue; }
    used.add(c.phase.value);
    if (!meta.has(c.phase.value)) findings.push(`${name}:${c.line} phase: '${c.phase.value}' is not a meta.phases[] title`);
  }
  for (const t of setDiff(meta, used)) findings.push(`${name} meta.phases[] declares '${t}' but no phase() call or phase: option uses it`);

  // implementing-phases must themselves be declared
  for (const t of setDiff(implementingPhases, meta)) findings.push(`${name} sidecar '// ${SIDECAR_IMPLEMENTING_FIELD}:' names '${t}', which meta.phases[] does not declare`);

  // the capability contract: strict forward, lenient reverse
  const implementingSeen = new Map([...implementingPhases].map((p) => [p, 0]));
  // Spawns the parser could not classify, per phase. The reverse rule must stay silent for a
  // phase that has one: its writer may be exactly the spawn that could not be read, and the
  // advice "drop it from implementing-phases" would delete the declaration the STRICT
  // direction depends on — the direction that catches the issue's mutant.
  const unclassified = new Map([...implementingPhases].map((p) => [p, 0]));
  const noteUnclassified = (c) => {
    const phase = c.phase.literal ? c.phase.value : null;
    if (phase !== null && unclassified.has(phase)) unclassified.set(phase, unclassified.get(phase) + 1);
  };
  for (const c of calls) {
    if (!c.agentType.literal) { findings.push(`${name}:${c.line} agentType is not a plain string literal`); noteUnclassified(c); continue; }
    const type = c.agentType.value;
    const intent = BUILTIN_INTENT[type] ?? agentIntents[type] ?? null;
    if (intent === null) { findings.push(`${name}:${c.line} agentType '${type}' is neither a built-in type nor a registered agent with an intent`); noteUnclassified(c); continue; }
    if (!INTENT_VALUES.includes(intent)) {
      findings.push(`${name}:${c.line} agentType '${type}' has intent '${intent}' in agents/${type}.md, which is not advisory|implementing — cannot classify`);
      noteUnclassified(c);
      continue;
    }
    const phase = c.phase.literal ? c.phase.value : null;
    const phaseImplements = phase !== null && implementingPhases.has(phase);
    if (intent === 'implementing' && !phaseImplements) {
      // `phase` is null when the phase: key is absent or non-literal, which has already been
      // reported on its own line; say that rather than interpolating the word "null".
      const where = phase === null ? 'its phase could not be read' : `phase '${phase}' is not in '// ${SIDECAR_IMPLEMENTING_FIELD}:'`;
      findings.push(`${name}:${c.line} agentType '${type}' is implementing but ${where} — a read-only stage may not mutate`);
    }
    if (intent === 'implementing' && phaseImplements) implementingSeen.set(phase, implementingSeen.get(phase) + 1);
    if (c.isolation.present && !c.isolation.literal) {
      findings.push(`${name}:${c.line} isolation: is not a plain string literal, so the mutation rule cannot be applied to it`);
    }
    if (c.isolation.literal && c.isolation.value === 'worktree' && intent !== 'implementing') {
      findings.push(`${name}:${c.line} isolation: 'worktree' is mutation by contract, but agentType '${type}' is advisory`);
    }
  }
  for (const [phase, count] of implementingSeen) {
    if (count === 0 && unclassified.get(phase) === 0) {
      const spawns = calls.filter((c) => c.phase.literal && c.phase.value === phase).length;
      findings.push(`${name} phase '${phase}' is declared implementing but none of its ${spawns} spawn(s) targets an implementing type — drop it from '// ${SIDECAR_IMPLEMENTING_FIELD}:' or give the phase its writer`);
    }
  }

  return { findings, unclosed, measured };
}

/** The raw `intent:` of every agent file, keyed by stem. Templates and README skipped. */
export function readAgentIntents(agentsDir) {
  const intents = {};
  for (const f of readdirSync(agentsDir)) {
    if (!f.endsWith('.md') || isExcludedId(f)) continue;
    const stem = f.slice(0, -3);
    const m = readFileSync(join(agentsDir, f), 'utf8').match(/^intent:\s*(\S+)/m);
    if (m) intents[stem] = m[1].replace(/\r$/, '');
  }
  return intents;
}

export function listWorkflows(workflowsDir) {
  return readdirSync(workflowsDir)
    .filter((f) => f.endsWith('.mjs') && !isTemplateSegment(f))
    .sort()
    .map((f) => join(workflowsDir, f));
}

// ── main ────────────────────────────────────────────────────────────────────

export function main(root) {
  const workflowsDir = join(root, 'workflows');
  const agentsDir = join(root, 'agents');
  if (!existsSync(workflowsDir) || !existsSync(agentsDir)) {
    console.error('check-workflow-contract: workflows/ or agents/ not found — cannot measure');
    return 2;
  }
  let agentIntents;
  let files;
  try {
    agentIntents = readAgentIntents(agentsDir);
    files = listWorkflows(workflowsDir);
  } catch (err) {
    console.error(`check-workflow-contract: could not read the corpus (${err.code ?? err.message}) — cannot measure`);
    return 2;
  }
  if (Object.keys(agentIntents).length === 0) {
    console.error('check-workflow-contract: no agent carries an intent: line — cannot classify types');
    return 2;
  }
  if (files.length === 0) {
    console.error('check-workflow-contract: no workflows found — a check over nothing is not a pass');
    return 2;
  }
  let findings = [];
  let calls = 0;
  let unclosed = 0;
  for (const path of files) {
    let text;
    try {
      text = readFileSync(path, 'utf8');
    } catch (err) {
      console.error(`check-workflow-contract: could not read ${path} (${err.code ?? err.message}) — cannot measure`);
      return 2;
    }
    const r = checkWorkflow({ path, text, agentIntents });
    calls += r.measured.calls;
    unclosed += r.unclosed.length;
    findings = findings.concat(r.findings);
  }
  for (const f of findings) console.log(`FAIL: ${f}`);
  if (unclosed > 0) {
    console.error(`check-workflow-contract: ${unclosed} agent() span(s) could not be closed — a parser limit, exit 2, not a verdict`);
    return 2;
  }
  if (calls === 0) {
    console.error('check-workflow-contract: zero agent() spawns found across the workflows — a check over nothing is not a pass');
    return 2;
  }
  if (findings.length > 0) return 1;
  console.log(`OK: ${files.length} workflow(s), ${calls} agent() spawn(s) honour the capability contract; phase titles agree across sidecar, meta and body`);
  return 0;
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  process.exit(main(root));
}
