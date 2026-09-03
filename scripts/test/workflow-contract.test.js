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
 * trailing comments, template-literal labels with `${…}`) and the shapes the review of the
 * first draft constructed (a commented-out key above the live one, a spread options object),
 * each rule in both directions, and the exit codes: 0, 1, and eight of the eleven exit-2
 * refusals across the two scripts, driven through `main()` over a temp tree — because a parser
 * limit must be exit 2, never a verdict. The three not covered are named in the exit-2 test.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  BUILTIN_INTENT,
  SIDECAR_IMPLEMENTING_FIELD,
  checkWorkflow,
  countAgentCalls,
  listWorkflows,
  main,
  maskCode,
  parseAgentCalls,
  parseMetaPhases,
  parsePhaseCalls,
  parseSidecar,
  readAgentIntents,
  readKey,
} from '../check-workflow-contract.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = join(ROOT, 'scripts', 'check-workflow-contract.js');
const read = (name) => readFileSync(join(ROOT, 'workflows', name), 'utf8');
const intents = readAgentIntents(join(ROOT, 'agents'));

const clean = (path, text, agentIntents = intents) => checkWorkflow({ path, text, agentIntents }).findings;

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
  assert.ok(!files.some((f) => f.endsWith('_template.mjs')), 'the template is scaffolding, not a workflow');
  const seen = {};
  for (const path of files) {
    const text = readFileSync(path, 'utf8');
    const r = checkWorkflow({ path, text, agentIntents: intents });
    assert.deepEqual(r.findings, [], `${path}\n${r.findings.join('\n')}`);
    assert.equal(r.measured.calls, r.measured.agentCallSites, `${path}: every agent( call has a literal options object`);
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
  const generate = calls.find((c) => c.phase.value === 'Generate');
  assert.equal(generate.agentType.value, 'general-purpose', 'read past a trailing // comment on the same line');
  assert.equal(generate.label.literal, false, 'a template-literal label with ${…} is not a plain literal — and did not break the span');
  const vh = read('verify-handoff.mjs');
  const v = parseAgentCalls(vh).calls[0];
  assert.equal(v.agentType.value, 'Explore');
  assert.equal(v.phase.value, 'Verify');
  assert.match(vh.slice(0, 20000), /effort: 'high'/, 'precondition: the extra key is present in the corpus');
  assert.equal(countAgentCalls(maskCode(vh)), 1, 'the literal text "agent(s)" in a template literal does not count');
});

test('the sidecar and meta parsers read the corpus fields', () => {
  const s = parseSidecar(read('batch-generate-waves.mjs'));
  assert.equal(s.name, 'batch-generate-waves');
  assert.equal(s.phases, 'Scout, Generate, Audit');
  assert.equal(s[SIDECAR_IMPLEMENTING_FIELD], 'Generate');
  assert.deepEqual(parseMetaPhases(read('review-changes.mjs')).titles, ['Classify', 'Verify', 'Synthesize']);
  assert.deepEqual(parsePhaseCalls(read('review-changes.mjs')).map((c) => c.title), ['Classify', 'Synthesize']);
});

// ── each rule, on a minimal fixture ─────────────────────────────────────────

function fixture({ sidecarPhases = 'Scan, Build', implementing = 'Build', metaTitles = ['Scan', 'Build'], body, metaExtra = '' }) {
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
${metaExtra}${meta}
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

test('strict forward: an implementing type in an undeclared phase fails; worktree isolation on an advisory type fails', () => {
  const noDecl = clean('fx.mjs', fixture({ implementing: null, body: BODY_OK }));
  assert.ok(noDecl.some((f) => /agentType 'general-purpose' is implementing but phase 'Build' is not in/.test(f)), noDecl.join('\n'));
  const advisoryWorktree = clean('fx.mjs', fixture({ body: BODY_OK.replace("agentType: 'general-purpose'", "agentType: 'Explore'") }));
  assert.ok(advisoryWorktree.some((f) => /isolation: 'worktree' is mutation by contract/.test(f)), advisoryWorktree.join('\n'));
});

test('lenient reverse: a mixed phase is fine; a declared phase with no implementing spawn at all is a finding', () => {
  const mixed = fixture({ body: BODY_OK + "\nconst c = await agent('peek', { label: 'peek', phase: 'Build', agentType: 'Explore' })\n" });
  assert.deepEqual(clean('fx.mjs', mixed), [], 'a scout beside a writer in the same declared phase');
  const noWriter = clean('fx.mjs', fixture({ body: BODY_OK
    .replace("agentType: 'general-purpose'", "agentType: 'Explore'")
    .replace("  isolation: 'worktree',\n", '') }));
  assert.equal(noWriter.length, 1, noWriter.join('\n'));
  assert.match(noWriter[0], /phase 'Build' is declared implementing but none of its 1 spawn\(s\) targets an implementing type/);
});

test('an unknown agent type is a finding, not a skip; a registered agent is classified by its intent; a bad intent value fails', () => {
  const unknown = clean('fx.mjs', fixture({ body: BODY_OK.replace("agentType: 'Explore'", "agentType: 'Explorer'") }));
  assert.ok(unknown.some((f) => /agentType 'Explorer' is neither a built-in type nor a registered agent/.test(f)), unknown.join('\n'));
  const advisoryAgent = Object.entries(intents).find(([, v]) => v === 'advisory')?.[0];
  const implementingAgent = Object.entries(intents).find(([, v]) => v === 'implementing')?.[0];
  assert.ok(advisoryAgent && implementingAgent, 'the corpus carries both intents');
  const swapped = fixture({ body: BODY_OK
    .replace("agentType: 'Explore'", `agentType: '${advisoryAgent}'`)
    .replace("agentType: 'general-purpose'", `agentType: '${implementingAgent}'`) });
  assert.deepEqual(clean('fx.mjs', swapped), []);
  const bogus = clean('fx.mjs', fixture({ body: BODY_OK.replace("agentType: 'Explore'", "agentType: 'odd-agent'") }), { ...intents, 'odd-agent': 'curious' });
  assert.ok(bogus.some((f) => /agentType 'odd-agent' has intent 'curious' in agents\/odd-agent\.md, which is not advisory\|implementing/.test(f)), bogus.join('\n'));
  assert.deepEqual(BUILTIN_INTENT, { Explore: 'advisory', Plan: 'advisory', 'general-purpose': 'implementing', claude: 'implementing' });
});

test('implementing-phases must name declared phases; a spawn without phase: is a finding', () => {
  const bogus = clean('fx.mjs', fixture({ implementing: 'Build, Ship', body: BODY_OK }));
  assert.ok(bogus.some((f) => /implementing-phases:' names 'Ship', which meta\.phases\[\] does not declare/.test(f)), bogus.join('\n'));
  const noPhase = clean('fx.mjs', fixture({ body: BODY_OK.replace("phase: 'Scan', ", '') }));
  assert.ok(noPhase.some((f) => /options carry no phase:/.test(f)), noPhase.join('\n'));
});

// ── the shapes the review of the first draft constructed ────────────────────

test('a commented-out key above the live key is NOT the one read (review finding 1)', () => {
  const body = `
phase('Scan')
const a = await agent('look', { label: 'scan', phase: 'Scan', agentType: 'Explore' })
const b = await agent('make', {
  // agentType: 'Explore' (was, before this stage needed writes)
  label: 'build',
  phase: 'Build',
  agentType: 'general-purpose',
})
`;
  const parsed = parseAgentCalls(fixture({ body }));
  assert.equal(parsed.calls.length, 2);
  assert.equal(parsed.calls[1].agentType.value, 'general-purpose', 'the live key wins, not the comment');
  // With the declaration removed, the live implementing type must be reported — the first
  // draft read 'Explore' from the comment and stayed silent.
  const findings = clean('fx.mjs', fixture({ implementing: null, body }));
  assert.ok(findings.some((f) => /agentType 'general-purpose' is implementing but phase 'Build' is not in/.test(f)), findings.join('\n'));
});

test('a commented-out meta title is not a phantom phase (review finding 1, second site)', () => {
  const text = fixture({ metaExtra: "    // { title: 'OldPhase', detail: 'gone' },\n", body: BODY_OK });
  assert.deepEqual(parseMetaPhases(text).titles, ['Scan', 'Build']);
  assert.deepEqual(clean('fx.mjs', text), []);
});

test('a spawn whose options carry no literal agentType is reported, not skipped (review finding 2)', () => {
  // The options come from a call, so there is no `agentType:` key anywhere for the scan to
  // find: three agent( sites, two options objects. A first draft of this fixture built the
  // object as a literal, which the scan DOES see — the counts matched and the test passed
  // vacuously, which is the failure mode this whole check exists to refuse.
  const body = BODY_OK + "\nconst c = await agent('again', buildOpts())\n";
  const findings = clean('fx.mjs', fixture({ body }));
  assert.ok(findings.some((f) => /has 3 agent\( call\(s\) but 2 options object\(s\) carrying a literal agentType/.test(f)), findings.join('\n'));
});

test('a non-literal agentType, phase: or phase() title is a finding, never silence', () => {
  const variable = clean('fx.mjs', fixture({ body: BODY_OK.replace("agentType: 'Explore'", 'agentType: kind') }));
  assert.ok(variable.some((f) => /agentType is not a plain string literal/.test(f)), variable.join('\n'));
  const templatePhase = clean('fx.mjs', fixture({ body: BODY_OK.replace("phase: 'Scan'", 'phase: `Sc${x}`') }));
  assert.ok(templatePhase.some((f) => /phase: is not a plain string literal/.test(f)), templatePhase.join('\n'));
  const templateCall = clean('fx.mjs', fixture({ body: BODY_OK.replace("phase('Scan')", 'phase(`Wave ${i}`)') }));
  assert.ok(templateCall.some((f) => /phase\(\) title is not a plain string literal/.test(f)), templateCall.join('\n'));
});

test('readKey locates in masked text and slices from the original', () => {
  const text = "{ /* agentType: 'no' */ agentType: 'yes', phase: `p${x}`, label: kind }";
  const masked = maskCode(text);
  assert.deepEqual(readKey(text, masked, 0, text.length, 'agentType'), { present: true, literal: true, value: 'yes' });
  assert.deepEqual(readKey(text, masked, 0, text.length, 'phase'), { present: true, literal: false, value: null });
  assert.deepEqual(readKey(text, masked, 0, text.length, 'label'), { present: true, literal: false, value: null });
  assert.deepEqual(readKey(text, masked, 0, text.length, 'isolation'), { present: false, literal: false, value: null });
});

test('the mask blanks strings, templates and comments but keeps positions, quotes and newlines', () => {
  const src = "a = 'x{' // {\nb = `t${y}` /* } */ c";
  const masked = maskCode(src);
  assert.equal(masked.length, src.length);
  assert.equal(masked.split('\n').length, src.split('\n').length);
  assert.doesNotMatch(masked, /[{}]/, 'every brace in the source lived inside a string or comment');
  assert.match(masked, /^a = '  '\s+\nb = `\s+`\s+c$/);
  assert.equal(maskCode("u = 'http://x'").trim(), "u = '        '", '// inside a string is not a comment');
});

test('an agentType key inside a string or comment is not a spawn', () => {
  const text = fixture({ body: "// agentType: 'general-purpose'\nconst s = \"agentType: 'general-purpose'\"\n" + BODY_OK });
  assert.equal(parseAgentCalls(text).calls.length, 2);
  assert.deepEqual(clean('fx.mjs', text), []);
});

// ── exit codes, through main() over temp trees ──────────────────────────────

function tree(t, { workflows = {}, agents = { 'a.md': 'intent: advisory\n' } } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'workflow-contract-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, 'workflows'));
  mkdirSync(join(dir, 'agents'));
  for (const [name, text] of Object.entries(workflows)) writeFileSync(join(dir, 'workflows', name), text);
  for (const [name, text] of Object.entries(agents)) writeFileSync(join(dir, 'agents', name), text);
  return dir;
}

function runMain(root) {
  const out = [];
  const err = [];
  const origLog = console.log;
  const origErr = console.error;
  console.log = (l) => out.push(l);
  console.error = (l) => err.push(l);
  let rc;
  try { rc = main(root); } finally { console.log = origLog; console.error = origErr; }
  return { rc, out: out.join('\n'), err: err.join('\n') };
}

test('exit 2: an unclosed options object is a parser limit, not a verdict', (t) => {
  const truncated = fixture({ body: "phase('Scan')\nconst a = await agent('look', { phase: 'Scan', agentType: 'Explore'\n" });
  const r = runMain(tree(t, { workflows: { 'fx.mjs': truncated } }));
  assert.equal(r.rc, 2, r.out + r.err);
  assert.match(r.err, /could not be closed — a parser limit, exit 2, not a verdict/);
});

test('exit 2: no workflows, no intents, zero spawns, an unreadable workflow', (t) => {
  assert.equal(runMain(tree(t, { workflows: {} })).rc, 2, 'no workflows');
  assert.equal(runMain(tree(t, { workflows: { 'fx.mjs': fixture({ body: BODY_OK }) }, agents: { 'a.md': 'no intent here\n' } })).rc, 2, 'no intents');
  const noSpawns = fixture({ metaTitles: ['Scan'], sidecarPhases: 'Scan', implementing: null, body: "phase('Scan')\n" });
  const z = runMain(tree(t, { workflows: { 'fx.mjs': noSpawns } }));
  assert.equal(z.rc, 2, z.out + z.err);
  assert.match(z.err, /zero agent\(\) spawns found/);
  const dir = tree(t, {});
  mkdirSync(join(dir, 'workflows', 'dir.mjs')); // a directory where a file is expected: EISDIR on read
  const u = runMain(dir);
  assert.equal(u.rc, 2, u.out + u.err);
  assert.match(u.err, /could not read .*dir\.mjs/);

  // The corpus-read catch: a FILE where agents/ should be passes existsSync and throws ENOTDIR
  // from readdirSync — the guard the review found untested.
  const notdir = mkdtempSync(join(tmpdir(), 'workflow-contract-'));
  t.after(() => rmSync(notdir, { recursive: true, force: true }));
  mkdirSync(join(notdir, 'workflows'));
  writeFileSync(join(notdir, 'agents'), '');
  const nd = runMain(notdir);
  assert.equal(nd.rc, 2, nd.out + nd.err);
  assert.match(nd.err, /could not read the corpus \(ENOTDIR\)/);

  // The missing-directory guard.
  const missing = mkdtempSync(join(tmpdir(), 'workflow-contract-'));
  t.after(() => rmSync(missing, { recursive: true, force: true }));
  const ms = runMain(missing);
  assert.equal(ms.rc, 2);
  assert.match(ms.err, /workflows\/ or agents\/ not found/);
});

test('the reverse rule stays SILENT when a spawn in that phase could not be classified (review N2)', () => {
  // The writer may be exactly the spawn that could not be read, and telling the author to drop
  // the declaration would delete what the STRICT direction depends on.
  const unreadable = fixture({ body: BODY_OK.replace("agentType: 'general-purpose'", 'agentType: kind') });
  const f = clean('fx.mjs', unreadable);
  assert.ok(f.some((x) => /agentType is not a plain string literal/.test(x)), f.join('\n'));
  assert.ok(!f.some((x) => /declared implementing but none of its/.test(x)),
    `the reverse rule must not fire on an unclassifiable spawn:\n${f.join('\n')}`);
  // It still fires when every spawn in the phase is readable and none implements.
  const readable = clean('fx.mjs', fixture({ body: BODY_OK
    .replace("agentType: 'general-purpose'", "agentType: 'Explore'")
    .replace("  isolation: 'worktree',\n", '') }));
  assert.ok(readable.some((x) => /declared implementing but none of its 1 spawn\(s\)/.test(x)), readable.join('\n'));
});

test('an implementing spawn with no readable phase does not print the word null (review N8)', () => {
  const f = clean('fx.mjs', fixture({ body: BODY_OK.replace("  phase: 'Build',\n", '') }));
  assert.ok(f.some((x) => /its phase could not be read/.test(x)), f.join('\n'));
  assert.ok(!f.some((x) => /phase 'null'/.test(x)), `the literal word null reached the user:\n${f.join('\n')}`);
});

test('a non-literal isolation: is reported rather than silently exempting the spawn (review N11)', () => {
  const f = clean('fx.mjs', fixture({ body: BODY_OK.replace("isolation: 'worktree',", 'isolation: iso,') }));
  assert.ok(f.some((x) => /isolation: is not a plain string literal/.test(x)), f.join('\n'));
});

test('a non-literal meta title is reported, not dropped (review N10)', () => {
  const f = clean('fx.mjs', fixture({ metaTitles: ['Scan'], sidecarPhases: 'Scan', implementing: null,
    metaExtra: "    { title: BUILD_TITLE, detail: 'x' },\n",
    body: "phase('Scan')\nconst a = await agent('look', { label: 'scan', phase: 'Scan', agentType: 'Explore' })\n" }));
  assert.ok(f.some((x) => /meta\.phases\[\] title is not a plain string literal/.test(x)), f.join('\n'));
});

test('the count-mismatch message diagnoses the direction it actually saw (review N12)', () => {
  const spread = clean('fx.mjs', fixture({ body: BODY_OK + "\nconst c = await agent('again', buildOpts())\n" }));
  assert.ok(spread.some((x) => /cannot read it \(options spread from a variable/.test(x)), spread.join('\n'));
  const stray = clean('fx.mjs', fixture({ body: BODY_OK + "\nconst spec = { agentType: 'Explore', phase: 'Scan' }\n" }));
  assert.ok(stray.some((x) => /appears outside any agent\(\) call/.test(x)), stray.join('\n'));
});

test('readKey finds the CLOSING quote in masked text, so an escaped quote does not truncate (review N9)', () => {
  const text = "{ label: 'a\\'b', agentType: 'Explore' }";
  const masked = maskCode(text);
  assert.equal(readKey(text, masked, 0, text.length, 'agentType').value, 'Explore',
    'a value after an escaped quote must still be read');
  assert.equal(readKey(text, masked, 0, text.length, 'label').value, "a\\'b");
});

test('the shared content-paths predicates are the ones consulted (review N3)', (t) => {
  // Restoring a private `_`-prefix filter or template set would leave the other tests green,
  // so this asserts what only the shared predicates give: the template excluded from the
  // workflow listing, and README plus _template excluded from the agent scan by isExcludedId.
  const dir = tree(t, {
    workflows: { 'fx.mjs': fixture({ body: BODY_OK }), '_template.mjs': fixture({ body: BODY_OK }) },
    agents: { 'a.md': 'intent: advisory\n', 'README.md': 'intent: bogus\n', '_template.md': 'intent: bogus\n' },
  });
  const r = runMain(dir);
  assert.equal(r.rc, 0, r.out + r.err);
  assert.match(r.out, /OK: 1 workflow\(s\)/, '_template.mjs is scaffolding and is not read');
  assert.deepEqual(Object.keys(readAgentIntents(join(dir, 'agents'))).sort(), ['a'],
    'README.md and _template.md are excluded by the shared isExcludedId');
});

test('exit 1 with FAIL lines on a finding; exit 0 with the OK line on a clean tree', (t) => {
  const bad = runMain(tree(t, { workflows: { 'fx.mjs': fixture({ implementing: null, body: BODY_OK }) } }));
  assert.equal(bad.rc, 1);
  assert.match(bad.out, /^FAIL: fx\.mjs:\d+ agentType 'general-purpose' is implementing/m);
  const good = runMain(tree(t, { workflows: { 'fx.mjs': fixture({ body: BODY_OK }) } }));
  assert.equal(good.rc, 0, good.out + good.err);
  assert.match(good.out, /^OK: 1 workflow\(s\), 2 agent\(\) spawn\(s\)/m);
});

test('the CLI exits 0 on the corpus and prints the counts it measured', () => {
  const r = spawnSync(process.execPath, [SCRIPT], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^OK: 3 workflow\(s\), 8 agent\(\) spawn\(s\) honour the capability contract/m);
});
