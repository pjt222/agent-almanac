/**
 * Tests for `scripts/check-workflow-contract.js` (#773).
 *
 * The two mutants the adversarial review of #772 named are the first two tests: a read-only
 * stage retargeted to an implementing type, and a phase title that matches no declaration.
 * Both passed every gate before this check existed; both must fail here, on the real corpus
 * files with the mutation applied in memory, so the test cannot drift from what the corpus
 * actually looks like.
 *
 * The rest pins the parser against the shapes that exist in the corpus (multi-line options,
 * trailing comments, template-literal labels with `${…}`), each rule in both directions, and
 * the exit codes — including that a parser limit is exit 2, never a verdict.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  BUILTIN_INTENT,
  SIDECAR_IMPLEMENTING_FIELD,
  checkWorkflow,
  listWorkflows,
  maskCode,
  parseAgentCalls,
  parseMetaPhases,
  parsePhaseCalls,
  parseSidecar,
  readAgentIntents,
} from '../check-workflow-contract.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = join(ROOT, 'scripts', 'check-workflow-contract.js');
const read = (name) => readFileSync(join(ROOT, 'workflows', name), 'utf8');
const intents = readAgentIntents(join(ROOT, 'agents'));

const clean = (path, text) => checkWorkflow({ path, text, agentIntents: intents }).findings;

// ── the two mutants from the issue ──────────────────────────────────────────

test('mutant 1: a read-only stage retargeted to general-purpose is a finding', () => {
  const original = read('review-changes.mjs');
  assert.deepEqual(clean('review-changes.mjs', original), [], 'precondition: the corpus file is clean');
  const needle = "{ label: 'synthesize', phase: 'Synthesize', agentType: 'Explore', schema: REPORT_SCHEMA }";
  assert.ok(original.includes(needle), 'the synthesize line is where the issue said');
  const mutant = original.replace(needle, needle.replace("agentType: 'Explore'", "agentType: 'general-purpose'"));
  const findings = clean('review-changes.mjs', mutant);
  assert.equal(findings.length, 1, findings.join('\n'));
  assert.match(findings[0], /review-changes\.mjs:\d+ agentType 'general-purpose' is implementing but phase 'Synthesize' is not in '\/\/ implementing-phases:'/);
});

test('mutant 2: phase(\'Verfiy\') matches no meta title and is a finding', () => {
  const original = read('verify-handoff.mjs');
  assert.deepEqual(clean('verify-handoff.mjs', original), []);
  assert.ok(original.includes("phase('Verify')"));
  const mutant = original.replace("phase('Verify')", "phase('Verfiy')");
  const findings = clean('verify-handoff.mjs', mutant);
  assert.ok(findings.some((f) => /phase\('Verfiy'\) is not a meta\.phases\[\] title/.test(f)), findings.join('\n'));
});

// ── the corpus is clean, and the parser saw what is there ───────────────────

test('every workflow in the corpus passes, and each spawn was actually parsed', () => {
  const files = listWorkflows(join(ROOT, 'workflows'));
  assert.ok(files.length >= 3, 'the corpus has at least the three shipped workflows');
  const seen = {};
  for (const path of files) {
    const text = readFileSync(path, 'utf8');
    const r = checkWorkflow({ path, text, agentIntents: intents });
    assert.deepEqual(r.findings, [], `${path}\n${r.findings.join('\n')}`);
    seen[path.slice(path.lastIndexOf('/') + 1)] = r.measured.calls;
  }
  // The counts the corpus is known to carry; a parser that silently stopped seeing a call
  // would leave these smaller while the findings stayed empty.
  assert.equal(seen['review-changes.mjs'], 4);
  assert.equal(seen['verify-handoff.mjs'], 1);
  assert.equal(seen['batch-generate-waves.mjs'], 3);
});

test('the corpus shapes parse: multi-line options with trailing comments, extra keys, template labels', () => {
  const bgw = read('batch-generate-waves.mjs');
  const { calls, unclosed } = parseAgentCalls(bgw);
  assert.deepEqual(unclosed, []);
  const generate = calls.find((c) => c.phase === 'Generate');
  assert.equal(generate.agentType, 'general-purpose', 'read past a trailing // comment on the same line');
  assert.match(generate.label, /\$\{waveIndex\}/, 'a template-literal label with braces did not break the span');
  const vh = read('verify-handoff.mjs');
  const v = parseAgentCalls(vh).calls[0];
  assert.equal(v.agentType, 'Explore');
  assert.equal(v.phase, 'Verify');
  assert.match(vh.slice(0, 20000), /effort: 'high'/, 'precondition: the extra key is present in the corpus');
});

test('the sidecar and meta parsers read the corpus fields', () => {
  const s = parseSidecar(read('batch-generate-waves.mjs'));
  assert.equal(s.name, 'batch-generate-waves');
  assert.equal(s.phases, 'Scout, Generate, Audit');
  assert.equal(s[SIDECAR_IMPLEMENTING_FIELD], 'Generate');
  assert.deepEqual(parseMetaPhases(read('review-changes.mjs')), ['Classify', 'Verify', 'Synthesize']);
  assert.deepEqual(parsePhaseCalls(read('review-changes.mjs')).map((c) => c.title), ['Classify', 'Synthesize']);
});

// ── each rule, on a minimal fixture ─────────────────────────────────────────

function fixture({ sidecarPhases = 'Scan, Build', implementing = 'Build', metaTitles = ['Scan', 'Build'], body }) {
  const meta = metaTitles.map((t) => `    { title: '${t}', detail: 'x' },`).join('\n');
  return `// ---
// name: fx
// description: fixture
// phases: ${sidecarPhases}
${implementing === null ? '' : `// ${SIDECAR_IMPLEMENTING_FIELD}: ${implementing}\n`}// ---
export const meta = {
  name: 'fx',
  description: 'fixture',
  phases: [
${meta}
  ],
}
${body}
`;
}

const BODY_OK = `
phase('Scan')
const a = await agent('look', { label: \`scan:\${x}\`, phase: 'Scan', agentType: 'Explore' })
const b = await agent('make', {
  label: 'build',
  phase: 'Build',
  agentType: 'general-purpose', // implementing: writes files
  isolation: 'worktree',
})
`;

test('a fixture that honours every rule is clean', () => {
  assert.deepEqual(clean('fx.mjs', fixture({ body: BODY_OK })), []);
});

test('sidecar phases and meta titles must agree in both directions', () => {
  const missingInSidecar = clean('fx.mjs', fixture({ sidecarPhases: 'Scan', body: BODY_OK }));
  assert.ok(missingInSidecar.some((f) => /title 'Build' is not in the sidecar/.test(f)), missingInSidecar.join('\n'));
  const extraInSidecar = clean('fx.mjs', fixture({ sidecarPhases: 'Scan, Build, Ship', body: BODY_OK }));
  assert.ok(extraInSidecar.some((f) => /sidecar '\/\/ phases:' names 'Ship'/.test(f)), extraInSidecar.join('\n'));
});

test('a declared phase nothing uses is drift, and a used phase nothing declares is a finding', () => {
  const unused = clean('fx.mjs', fixture({ sidecarPhases: 'Scan, Build, Ship', metaTitles: ['Scan', 'Build', 'Ship'], body: BODY_OK }));
  assert.ok(unused.some((f) => /declares 'Ship' but no phase\(\) call or phase: option uses it/.test(f)), unused.join('\n'));
  const undeclared = clean('fx.mjs', fixture({ body: BODY_OK.replace("phase: 'Scan'", "phase: 'Scna'") }));
  assert.ok(undeclared.some((f) => /phase: 'Scna' is not a meta\.phases\[\] title/.test(f)), undeclared.join('\n'));
});

test('an implementing type in an undeclared phase, and an advisory type in a declared one, both fail', () => {
  const noDecl = clean('fx.mjs', fixture({ implementing: null, body: BODY_OK }));
  assert.ok(noDecl.some((f) => /agentType 'general-purpose' is implementing but phase 'Build' is not in/.test(f)), noDecl.join('\n'));
  const advisoryInBuild = clean('fx.mjs', fixture({ body: BODY_OK.replace("agentType: 'general-purpose'", "agentType: 'Explore'") }));
  assert.ok(advisoryInBuild.some((f) => /phase 'Build' is declared implementing but agentType 'Explore' is advisory/.test(f)), advisoryInBuild.join('\n'));
  assert.ok(advisoryInBuild.some((f) => /isolation: 'worktree' is mutation by contract/.test(f)), advisoryInBuild.join('\n'));
});

test('an unknown agent type is a finding, not a skip; a registered agent is classified by its intent', () => {
  const unknown = clean('fx.mjs', fixture({ body: BODY_OK.replace("agentType: 'Explore'", "agentType: 'Explorer'") }));
  assert.ok(unknown.some((f) => /agentType 'Explorer' is neither a built-in type nor a registered agent/.test(f)), unknown.join('\n'));
  const advisoryAgent = Object.entries(intents).find(([, v]) => v === 'advisory')?.[0];
  const implementingAgent = Object.entries(intents).find(([, v]) => v === 'implementing')?.[0];
  assert.ok(advisoryAgent && implementingAgent, 'the corpus carries both intents');
  const swapped = fixture({ body: BODY_OK
    .replace("agentType: 'Explore'", `agentType: '${advisoryAgent}'`)
    .replace("agentType: 'general-purpose'", `agentType: '${implementingAgent}'`) });
  assert.deepEqual(clean('fx.mjs', swapped), []);
  assert.deepEqual(BUILTIN_INTENT, { Explore: 'advisory', Plan: 'advisory', 'general-purpose': 'implementing', claude: 'implementing' });
});

test('implementing-phases must name declared phases; a spawn without phase: is a finding', () => {
  const bogus = clean('fx.mjs', fixture({ implementing: 'Build, Ship', body: BODY_OK }));
  assert.ok(bogus.some((f) => /implementing-phases:' names 'Ship', which meta\.phases\[\] does not declare/.test(f)), bogus.join('\n'));
  const noPhase = clean('fx.mjs', fixture({ body: BODY_OK.replace("phase: 'Scan', ", '') }));
  assert.ok(noPhase.some((f) => /options carry no phase:/.test(f)), noPhase.join('\n'));
});

test('the mask blanks strings, templates and comments but keeps positions and newlines', () => {
  const src = "a = 'x{' // {\nb = `t${y}` /* } */ c";
  const masked = maskCode(src);
  assert.equal(masked.length, src.length);
  assert.equal(masked.split('\n').length, src.split('\n').length);
  assert.doesNotMatch(masked, /[{}]/, 'every brace in the source lived inside a string or comment');
  assert.match(masked, /^a = '  '\s+\nb = `\s+`\s+c$/);
});

test('an agentType key inside a string or comment is not a spawn', () => {
  const text = fixture({ body: "// agentType: 'general-purpose'\nconst s = \"agentType: 'general-purpose'\"\n" + BODY_OK });
  assert.equal(parseAgentCalls(text).calls.length, 2);
  assert.deepEqual(clean('fx.mjs', text), []);
});

// ── the CLI ─────────────────────────────────────────────────────────────────

test('the CLI exits 0 on the corpus and prints the counts it measured', () => {
  const r = spawnSync(process.execPath, [SCRIPT], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^OK: \d+ workflow\(s\), \d+ agent\(\) spawn\(s\) honour the capability contract/m);
});
