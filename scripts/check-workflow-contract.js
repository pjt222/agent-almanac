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
 * naming the phases whose stages may (and must) target implementing types. Absent means none —
 * a new workflow that forgets it and spawns `general-purpose` fails loudly rather than quietly.
 * The rule is then exact in both directions: a stage's type is implementing IFF its phase is
 * listed. A stage with `isolation: 'worktree'` must be implementing too, since the contract names
 * that as mutation.
 *
 * Types are classified by the source the repository already keeps: the four built-ins by a fixed
 * map (Explore, Plan advisory; general-purpose, claude implementing), and every almanac agent by
 * the `intent:` line integrity check A6 already requires in its frontmatter. An unknown type is a
 * FAIL, not a skip — silently classifying nothing is how a check goes dead.
 *
 * Phase titles are exact sets, three ways: sidecar `phases:` == `meta.phases[].title` == the
 * titles the body uses through `phase()` and the `phase:` option. A declared phase no stage uses
 * is drift in the other direction and is reported as such.
 *
 * ## How the body is read
 *
 * No JS parser (this job runs with no `npm ci`; see A8). The file is masked first — strings,
 * template literals and comments blanked to spaces, positions preserved — and the options
 * object of each `agent()` call is found by walking from the `agentType` key back to its
 * enclosing `{` and forward to the matching `}` over the masked text. Keys are then read from
 * the original text inside that span. Measured against the corpus this survives: multi-line
 * options objects carrying trailing `//` comments (batch-generate-waves 283–284), extra keys
 * (`effort: 'high'`, verify-handoff 250), and template-literal labels containing `${…}` braces.
 * A regex literal containing a quote or brace would defeat the mask; none exists in the corpus,
 * and the parser reports a span it cannot close rather than guessing.
 *
 * Exit 0 clean; 1 findings; 2 could not measure (no workflows, no agents, unreadable file, a
 * span the parser could not close). 2 is never a pass.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const BUILTIN_INTENT = Object.freeze({
  Explore: 'advisory',
  Plan: 'advisory',
  'general-purpose': 'implementing',
  claude: 'implementing',
});

export const SIDECAR_IMPLEMENTING_FIELD = 'implementing-phases';

const TEMPLATE_STEMS = new Set(['_template']);

// ── reading ─────────────────────────────────────────────────────────────────

/** Blank strings, template literals and comments to spaces, keeping every position. */
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

/** Titles inside `phases: [ ... ]` of `export const meta`, in order. Null if not found. */
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
  const span = text.slice(open, close + 1);
  return [...span.matchAll(/\btitle:\s*(['"])(.*?)\1/g)].map((m) => m[2]);
}

/** Every `phase('Title')` call in the body. */
export function parsePhaseCalls(text, masked = maskCode(text)) {
  const calls = [];
  for (const m of masked.matchAll(/\bphase\(\s*(?=['"])/g)) {
    const at = m.index + m[0].length;
    const q = text[at];
    const end = text.indexOf(q, at + 1);
    if (end === -1) continue;
    calls.push({ title: text.slice(at + 1, end), line: lineOf(text, m.index) });
  }
  return calls;
}

/**
 * Every options object carrying `agentType:` — the shape of an `agent(prompt, { ... })` call.
 * Returns `{ calls, unclosed }`; an unclosed span is a parser limit, reported not guessed.
 */
export function parseAgentCalls(text, masked = maskCode(text)) {
  const calls = [];
  const unclosed = [];
  for (const m of masked.matchAll(/\bagentType\s*:/g)) {
    // back to the enclosing `{`
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
    const span = text.slice(open, close + 1);
    const read = (key) => {
      const k = span.match(new RegExp(`\\b${key}\\s*:\\s*(['"\`])([^'"\`]*)\\1`));
      return k ? k[2] : null;
    };
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
 * Findings for one workflow. `agentIntents` maps almanac agent id -> 'advisory'|'implementing'.
 * @returns {{findings: string[], measured: object}}
 */
export function checkWorkflow({ path, text, agentIntents }) {
  const findings = [];
  const name = basename(path);
  const masked = maskCode(text);
  const sidecar = parseSidecar(text);
  const sidecarPhases = new Set(splitList(sidecar.phases));
  const implementingPhases = new Set(splitList(sidecar[SIDECAR_IMPLEMENTING_FIELD]));
  const metaTitles = parseMetaPhases(text, masked);
  const phaseCalls = parsePhaseCalls(text, masked);
  const { calls, unclosed } = parseAgentCalls(text, masked);

  for (const line of unclosed) findings.push(`${name}:${line} agent() options object could not be closed by the parser`);

  if (metaTitles === null) {
    findings.push(`${name} has no parseable meta.phases[] (expected \`phases: [ { title: '…' } ]\` in export const meta)`);
    return { findings, measured: { calls: calls.length, phaseCalls: phaseCalls.length } };
  }
  const meta = new Set(metaTitles);
  const dupes = metaTitles.filter((t, i) => metaTitles.indexOf(t) !== i);
  for (const d of dupes) findings.push(`${name} meta.phases[] lists '${d}' more than once`);

  // sidecar phases == meta titles, both directions
  for (const t of setDiff(meta, sidecarPhases)) findings.push(`${name} meta.phases[] title '${t}' is not in the sidecar '// phases:' list`);
  for (const t of setDiff(sidecarPhases, meta)) findings.push(`${name} sidecar '// phases:' names '${t}', which meta.phases[] does not declare`);

  // used titles == meta titles, both directions
  const used = new Set();
  for (const c of phaseCalls) {
    used.add(c.title);
    if (!meta.has(c.title)) findings.push(`${name}:${c.line} phase('${c.title}') is not a meta.phases[] title`);
  }
  for (const c of calls) {
    if (c.phase === null) { findings.push(`${name}:${c.line} agent() options carry no phase: — every spawn must belong to a declared phase`); continue; }
    used.add(c.phase);
    if (!meta.has(c.phase)) findings.push(`${name}:${c.line} phase: '${c.phase}' is not a meta.phases[] title`);
  }
  for (const t of setDiff(meta, used)) findings.push(`${name} meta.phases[] declares '${t}' but no phase() call or phase: option uses it`);

  // implementing-phases must themselves be declared
  for (const t of setDiff(implementingPhases, meta)) findings.push(`${name} sidecar '// ${SIDECAR_IMPLEMENTING_FIELD}:' names '${t}', which meta.phases[] does not declare`);

  // the capability contract, exact in both directions
  for (const c of calls) {
    if (c.agentType === null) { findings.push(`${name}:${c.line} agentType is not a plain string literal`); continue; }
    const intent = BUILTIN_INTENT[c.agentType] ?? agentIntents[c.agentType] ?? null;
    if (intent === null) { findings.push(`${name}:${c.line} agentType '${c.agentType}' is neither a built-in type nor a registered agent with an intent`); continue; }
    const phaseImplements = c.phase !== null && implementingPhases.has(c.phase);
    if (intent === 'implementing' && !phaseImplements) {
      findings.push(`${name}:${c.line} agentType '${c.agentType}' is implementing but phase '${c.phase}' is not in '// ${SIDECAR_IMPLEMENTING_FIELD}:' — a read-only stage may not mutate`);
    }
    if (intent === 'advisory' && phaseImplements) {
      findings.push(`${name}:${c.line} phase '${c.phase}' is declared implementing but agentType '${c.agentType}' is advisory — the stage cannot do what its phase promises`);
    }
    if (c.isolation === 'worktree' && intent !== 'implementing') {
      findings.push(`${name}:${c.line} isolation: 'worktree' is mutation by contract, but agentType '${c.agentType}' is advisory`);
    }
  }

  return { findings, measured: { calls: calls.length, phaseCalls: phaseCalls.length, phases: metaTitles.length } };
}

/** `intent:` of every agent file, keyed by stem. Templates and README skipped. */
export function readAgentIntents(agentsDir) {
  const intents = {};
  for (const f of readdirSync(agentsDir)) {
    if (!f.endsWith('.md')) continue;
    const stem = f.slice(0, -3);
    if (stem === 'README' || TEMPLATE_STEMS.has(stem)) continue;
    const m = readFileSync(join(agentsDir, f), 'utf8').match(/^intent:\s*(\S+)/m);
    if (m) intents[stem] = m[1].replace(/\r$/, '');
  }
  return intents;
}

export function listWorkflows(workflowsDir) {
  return readdirSync(workflowsDir)
    .filter((f) => f.endsWith('.mjs') && !TEMPLATE_STEMS.has(f.slice(0, -4)))
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
  const agentIntents = readAgentIntents(agentsDir);
  if (Object.keys(agentIntents).length === 0) {
    console.error('check-workflow-contract: no agent carries an intent: line — cannot classify types');
    return 2;
  }
  const files = listWorkflows(workflowsDir);
  if (files.length === 0) {
    console.error('check-workflow-contract: no workflows found — a check over nothing is not a pass');
    return 2;
  }
  let findings = [];
  let calls = 0;
  let inconclusive = false;
  for (const path of files) {
    const text = readFileSync(path, 'utf8');
    const r = checkWorkflow({ path, text, agentIntents });
    calls += r.measured.calls;
    if (r.findings.some((f) => f.includes('could not be closed'))) inconclusive = true;
    findings = findings.concat(r.findings);
  }
  for (const f of findings) console.log(`FAIL: ${f}`);
  if (inconclusive) {
    console.error('check-workflow-contract: a parser limit was hit — exit 2, not a verdict');
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
