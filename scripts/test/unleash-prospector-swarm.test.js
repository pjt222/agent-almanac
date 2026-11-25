/**
 * `skills/unleash-the-agents/references/prospector-swarm.mjs` is a Workflow script that lives
 * outside `workflows/`, so neither `check-workflow-contract.js` nor `workflow-template.test.js`
 * reads it, and `scripts/mutation-check.js` cannot mutate it (its Workflow dialect is
 * root-anchored to workflows/ and .claude/workflows/). This suite is the file's only gate.
 *
 * It parses the file the way the runtime wraps it, then runs the body against a stubbed runtime
 * (`agent`, `parallel`, `phase`, `log`, `args`); `agent` answers by label from a script.
 *
 * Pinned, each from a measured run or the review of #1081:
 * - the argument refusals fire before the first agent is spawned;
 * - the stop rule needs a new family with `minNewAgents` VERIFIED agents;
 * - a cluster pass that dies twice stops the run as 'cluster-failed', never as convergence;
 * - the late challenge covers every family the wave-3 adversary did not answer;
 * - cited ids that are not items are dropped;
 * - model routing and agent types are as documented;
 * - the null model computes both of its forms.
 *
 * What it cannot check is the runtime itself: model routing, agentType resolution and
 * structured-output validation are the Workflow tool's, and a stub only records what was asked.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { wrapWorkflow } from '../lib/mutation-parse.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const FILE = resolve(ROOT, 'skills/unleash-the-agents/references/prospector-swarm.mjs');
const SOURCE = readFileSync(FILE, 'utf8');
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
const body = SOURCE.replace(/^[ \t]*export const meta/m, 'const meta');

const ITEMS = { T1: ['t1/a.sh', 't1/b.sh', 't1/c.sh'], T2: ['t2/d.mjs', 't2/e.mjs', 't2/f.mjs'] };
const roster = (n) => Array.from({ length: n }, (_, i) => `r${i + 1}`);
const baseArgs = (over = {}) => ({
  mode: 'full',
  question: 'Which recurring scripts should become shared tools?',
  brief: '/fixture/brief.md',
  index: '/fixture/index.tsv',
  itemRoot: '/fixture/corpus',
  territories: ITEMS,
  expectItems: 6,
  roster: roster(50),
  pilot: [{ agent: 'janitor', territory: 'T1' }, { agent: 'mystic', territory: 'T2' }],
  seeds: ['S1'],
  writeRoot: '/fixture/scratch',
  ...over,
});

// Each listed agent is assigned its hypothesis 0 unless an explicit { agent, hypothesis } is given.
const fam = (id, agents, instances = ['t1/a.sh']) => ({ id, name: id, mechanism: `m-${id}`, members: agents.map((a) => (typeof a === 'string' ? { agent: a, hypothesis: 0 } : a)), instances, proposals: '', disagreements: '' });

/** The default cluster script: N1 born strong (2 agents) in 1-2, N2 strong in 3, N3 weak in 4. */
const CLUSTERS = {
  'cluster:1-2': [fam('S1', ['janitor', 'r1', 'r2']), fam('N1', ['r3', 'r4'])],
  'cluster:3': [fam('S1', ['janitor', 'r1']), fam('N1', ['r3', 'r4']), fam('N2', ['r20', 'r21', 'r23'], ['t2/d.mjs'])],
  'cluster:4': [fam('S1', ['janitor']), fam('N1', ['r3']), fam('N2', ['r20', 'r21', 'r23'], ['t2/d.mjs']), fam('N3', ['r30'])],
};

const HYP = (extra = {}) => ({ seed: 'S1', family: 'f', mechanism: 'm', instances: ['t1/a.sh', '/fixture/corpus/t2/d.mjs', 'not/an/item.sh'], proposal: '', confidence: 'low', testable_prediction: 'PREDICTION-TEXT', domain_reasoning: 'REASONING-TEXT', ...extra });

/**
 * Run the template. `override(label, opts, prompt)` may return a value (null included) to answer
 * one call; `undefined` falls through to the defaults. `hyps(agentId)` sets how many hypotheses a
 * prospector files.
 */
async function run(args, { clusters = CLUSTERS, calls = [], override, hyps } = {}) {
  const logs = [];
  const adversary = args?.adversary ?? 'advocatus-diaboli';
  const agent = async (prompt, opts = {}) => {
    calls.push({ prompt, opts });
    const label = opts.label || '';
    if (override) { const v = override(label, opts, prompt); if (v !== undefined) return v; }
    if (label.startsWith('cluster:')) {
      const key = label.replace(/:retry$/, '');
      const families = clusters[key] ?? clusters[Object.keys(clusters).at(-1)];
      return { families: structuredClone(families), noise: '' };
    }
    if (label === `challenge:${adversary}`) {
      // The wave-3 adversary answers every family it was shown.
      const shown = [...prompt.matchAll(/"id":"([^"]+)"/g)].map((x) => x[1]);
      return { challenges: shown.map((id) => ({ family_id: id, verdict: 'weakened', strongest_counterargument: '', alternative_explanation: '', falsification_experiment: '', better_home: '' })), missed_family: '' };
    }
    if (label.startsWith(`late-challenge:${adversary}`)) return { challenges: [], missed_family: '' };
    if (label === 'synthesize') return { ranking: [{ rank: 1, family_id: 'S1', name: 'S1', recommendation: '', instances: ['t1/a.sh', 'not/an/item.sh'], convergence: '', adversarial_verdict: '', testable_prediction: '', why_this_rank: '' }], dropped_families: [], notes: '' };
    const id = label.split(':').pop();
    const n = hyps ? hyps(id) : 1;
    return { hypotheses: Array.from({ length: n }, () => HYP()), files_read: ['t1/a.sh'] };
  };
  const parallel = (thunks) => Promise.all(thunks.map((t) => t().catch(() => null)));
  const fn = new AsyncFunction('agent', 'parallel', 'pipeline', 'phase', 'log', 'args', 'budget', body);
  const out = await fn(agent, parallel, null, () => {}, (msg) => logs.push(msg), args, { total: null });
  return { out, calls, logs };
}
const labelled = (calls, re) => calls.filter((c) => re.test(c.opts.label || ''));
const PROSPECTOR = /^(pilot|prospect|challenge|edge):r?\w/;
const isProspector = (c, args) => PROSPECTOR.test(c.opts.label || '') && c.opts.agentType !== (args.adversary ?? 'advocatus-diaboli');

// --- Parse and shape -----------------------------------------------------------------------

test('the template passes the documented wrap-then-check recipe, in both goals', () => {
  const wrapped = wrapWorkflow(SOURCE);
  for (const flags of [['--check', '-'], ['--input-type=module', '--check', '-']]) {
    const r = spawnSync(process.execPath, flags, { input: wrapped, encoding: 'utf8' });
    assert.equal(r.status, 0, `${flags.join(' ')}: ${r.stderr}`);
  }
});

test('the template exports nothing but meta', () => {
  const exports = SOURCE.match(/^[ \t]*export\b.*$/gm) ?? [];
  assert.deepEqual(exports.map((l) => l.trim().slice(0, 18)), ['export const meta ']);
});

test('the template calls none of the Workflow runtime bans: Date.now, Math.random, argless new Date', () => {
  const code = SOURCE.replace(/^\s*\/\/.*$/gm, '');
  assert.doesNotMatch(code, /\bDate\.now\s*\(/);
  assert.doesNotMatch(code, /\bMath\.random\s*\(/);
  assert.doesNotMatch(code, /\bnew Date\s*\(\s*\)/);
});

test('the sidecar name, meta.name and every phase() title agree with meta', () => {
  assert.match(SOURCE, /^\/\/ name: prospector-swarm$/m);
  assert.match(SOURCE, /^\s*name: 'prospector-swarm',$/m);
  const metaTitles = [...SOURCE.matchAll(/\{ title: '([^']+)'/g)].map((x) => x[1]);
  const phaseCalls = [...new Set([...SOURCE.matchAll(/\bphase\('([^']+)'\)/g)].map((x) => x[1]))];
  assert.ok(phaseCalls.length >= 6, `found ${phaseCalls.length} phase() calls`);
  for (const t of phaseCalls) assert.ok(metaTitles.includes(t), `phase('${t}') has no meta.phases entry`);
});

// --- Refusals -----------------------------------------------------------------------------

const REFUSALS = [
  ['no mode', { mode: undefined }, /args\.mode/],
  ['an unfilled brief', { brief: '__FILL__' }, /args\.brief/],
  ['a relative writeRoot', { writeRoot: 'scratch' }, /args\.writeRoot/],
  ['territories as an array', { territories: [['t1/a.sh']] }, /args\.territories/],
  ['a placeholder territory', { territories: '__FILL__' }, /args\.territories/],
  ['an item count that disagrees', { expectItems: 7 }, /hold 6 distinct items; args\.expectItems says 7/],
  ['a short roster', { roster: roster(3) }, /at least 8 agent ids/],
  ['an angle-bracket placeholder in the roster', { roster: [...roster(9), '<agent-id>'] }, /at least 8 agent ids/],
  ['a duplicated agent', { roster: [...roster(9), 'r1'] }, /twice/],
  ['the adversary in the roster', { roster: [...roster(9), 'advocatus-diaboli'] }, /must not include advocatus-diaboli/],
  ['a pilot agent in the roster', { roster: [...roster(9), 'mystic'] }, /must not include mystic/],
  ['a pilot on an unknown territory', { pilot: [{ agent: 'janitor', territory: 'T9' }, { agent: 'mystic', territory: 'T2' }] }, /args\.pilot/],
  ['NEW used as a seed id', { seeds: ['NEW'] }, /args\.seeds/],
  ['a zero minNewAgents', { minNewAgents: 0 }, /args\.minNewAgents/],
];
for (const [name, over, re] of REFUSALS) {
  test(`refuses ${name} before spawning any agent`, async () => {
    const args = baseArgs(over);
    for (const [k, v] of Object.entries(over)) if (v === undefined) delete args[k];
    const calls = [];
    await assert.rejects(() => run(args, { calls }), re);
    assert.equal(calls.length, 0, `spawned ${calls.length} agent(s) before refusing`);
  });
}

test('refuses before spawning when args itself is missing', async () => {
  await assert.rejects(() => run(undefined), /args\.mode/);
});

// --- Pilot, citations, routing ----------------------------------------------------------------

test('pilot mode spawns exactly the two pilot agents, on the prospector model, as their own types', async () => {
  const { out, calls } = await run(baseArgs({ mode: 'pilot' }));
  assert.equal(calls.length, 2);
  assert.deepEqual(calls.map((c) => c.opts.agentType), ['janitor', 'mystic']);
  assert.deepEqual(calls.map((c) => c.opts.model), ['sonnet', 'sonnet']);
  assert.equal(out.mode, 'pilot');
  assert.equal(out.pilotOk, true);
});

test('a failed pilot stops a full-mode run after the two pilot agents', async () => {
  const calls = [];
  const { out } = await run(baseArgs(), { calls, override: (label) => (label === 'pilot:mystic' ? null : undefined) });
  assert.equal(out.pilotOk, false);
  assert.equal(out.mode, 'full');
  assert.equal(calls.length, 2);
});

test('a cited id that is not an item is dropped, and an itemRoot prefix is stripped, not dropped', async () => {
  const { out } = await run(baseArgs({ mode: 'pilot' }));
  assert.equal(out.cited, 6);
  assert.equal(out.dropped, 2);
  assert.deepEqual(out.pilot[0].hypotheses[0].instances, ['t1/a.sh', 't2/d.mjs']);
});

test('clustering and synthesis run on the session model, the adversary passes as the adversary type', async () => {
  const args = baseArgs({ adversary: 'senior-researcher' });
  const { calls } = await run(args);
  const clusterCalls = labelled(calls, /^cluster:/);
  assert.ok(clusterCalls.length >= 2);
  for (const c of clusterCalls) assert.equal(c.opts.model, undefined, c.opts.label);
  assert.equal(labelled(calls, /^synthesize$/)[0].opts.model, undefined);
  const adv = labelled(calls, /challenge:senior-researcher$/);
  assert.equal(adv.length, 2, 'the wave-3 pass and the late pass');
  for (const c of adv) { assert.equal(c.opts.agentType, 'senior-researcher'); assert.equal(c.opts.model, undefined); }
  for (const c of calls.filter((x) => isProspector(x, args))) assert.equal(c.opts.agentType, c.opts.label.split(':')[1]);
});

test('clusterModel routes the cluster passes and nothing else', async () => {
  // Not 'sonnet': a value equal to the prospector default cannot tell a cluster pass handed
  // the prospector model from one handed clusterModel.
  const args = baseArgs({ clusterModel: 'opus' });
  const { calls } = await run(args);
  for (const c of labelled(calls, /^cluster:/)) assert.equal(c.opts.model, 'opus', c.opts.label);
  assert.equal(labelled(calls, /^synthesize$/)[0].opts.model, undefined);
  // Nothing else: the prospectors keep the default, and every other call (the adversary passes,
  // the synthesis) stays on the session model.
  const prospectors = calls.filter((c) => isProspector(c, args));
  assert.equal(prospectors.length, 40);
  for (const c of prospectors) assert.equal(c.opts.model, 'sonnet', c.opts.label);
  for (const c of calls.filter((x) => !/^cluster:/.test(x.opts.label || '') && !isProspector(x, args))) assert.equal(c.opts.model, undefined, c.opts.label);
});

test('prospectorModel routes every prospector and nothing else', async () => {
  // 'haiku' is what the measured run used; passing it must still reach every prospector.
  const args = baseArgs({ prospectorModel: 'haiku' });
  const { calls } = await run(args);
  const prospectors = calls.filter((c) => isProspector(c, args));
  assert.equal(prospectors.length, 40);
  for (const c of prospectors) assert.equal(c.opts.model, 'haiku', c.opts.label);
  for (const c of calls.filter((x) => !isProspector(x, args))) assert.equal(c.opts.model, undefined, c.opts.label);
});

test('every prompt carries the containment block, and every prospector its own write locations', async () => {
  const args = baseArgs();
  const { calls } = await run(args);
  for (const c of calls) {
    assert.match(c.prompt, /^CONTAINMENT \(binding/m, c.opts.label);
    assert.match(c.prompt, /^- If you use a shell, use read commands \(cat, head, sed -n, rg, wc, ls, sha256sum\)/m, c.opts.label);
  }
  const prospectors = calls.filter((c) => isProspector(c, args));
  assert.equal(prospectors.length, 40);
  for (const c of prospectors) {
    const who = c.opts.label.split(':')[1];
    assert.ok(c.prompt.includes('mktemp -d "/fixture/scratch/prospect.XXXXXX")" || exit 1; echo "$DIR"'), c.opts.label);
    assert.ok(c.prompt.includes('"${DIR:?}/<file>"'), c.opts.label);
    assert.ok(c.prompt.includes(`write only under /fixture/scratch/${who}/.`), c.opts.label);
  }
});

test('wave 3 and the edge waves carry their injections; waves 1-2 carry none', async () => {
  const args = baseArgs();
  const { calls } = await run(args);
  const p = calls.filter((c) => isProspector(c, args));
  for (const c of p.filter((x) => /^(pilot|prospect):/.test(x.opts.label))) assert.doesNotMatch(c.prompt, /Update from/);
  for (const c of p.filter((x) => /^challenge:/.test(x.opts.label))) assert.match(c.prompt, /Update from waves 1-2 .*Families so far:\n- S1/s);
  for (const c of p.filter((x) => /^edge:/.test(x.opts.label))) assert.match(c.prompt, /These are established\. Work the edges/);
});

test('the cluster prompt carries the predictions and confidence but not the free-text reasoning', async () => {
  const { calls } = await run(baseArgs());
  const c3 = labelled(calls, /^cluster:3$/)[0];
  assert.ok(c3.prompt.includes('PREDICTION-TEXT'));
  assert.ok(c3.prompt.includes('"confidence":"low"'));
  assert.ok(!c3.prompt.includes('REASONING-TEXT'));
  assert.ok(labelled(calls, /^synthesize$/)[0].prompt.includes('PREDICTION-TEXT'), 'the prospectors\' predictions reach the synthesis');
});

test('territory counts add up to the prospectors attempted', async () => {
  const { out } = await run(baseArgs());
  assert.equal(Object.values(out.terrCount).reduce((s, x) => s + x, 0), out.attempted);
});

// --- The stop rule ------------------------------------------------------------------------------

test('the stop rule: a wave whose only new family has one agent ends the run', async () => {
  const { out, calls } = await run(baseArgs());
  assert.equal(out.stopReason, 'no-new-family-with-independent-convergence');
  assert.equal(out.edgeWaves, 1);
  assert.equal(out.consulted, 2 + 18 + 10 + 10);
  assert.deepEqual(out.notConsulted, roster(50).slice(38));
  assert.equal(labelled(calls, /^cluster:/).length, 3);
});

test('the stop rule counts agents, so minNewAgents 1 runs a wave further than 2', async () => {
  // N3, born in cluster 4, has one agent: strong under 1, weak under 2. Cluster 5 repeats 4.
  const two = await run(baseArgs({ roster: roster(60) }));
  const one = await run(baseArgs({ roster: roster(60), minNewAgents: 1 }));
  assert.equal(two.out.edgeWaves, 1);
  assert.equal(one.out.edgeWaves, 2);
  assert.equal(one.out.stopReason, 'no-new-family-with-independent-convergence');
});

test('the stop rule counts only verified agents, not the clusterer\'s list', async () => {
  // N3's list has padding, case variants and a ghost, but only r30 returned and cited its item.
  const padded = { ...CLUSTERS, 'cluster:4': [...CLUSTERS['cluster:3'], fam('N3', ['r30', 'r30 ', 'R30', 'ghost-agent'])] };
  const { out } = await run(baseArgs({ roster: roster(60) }), { clusters: padded });
  assert.equal(out.edgeWaves, 1);
  const n3 = out.familyStats.find((f) => f.id === 'N3');
  assert.equal(n3.agents, 1);
});

test('a seed id first seen late, or a family with no items, is never a new family', async () => {
  // S2 is a seed the brief named, first clustered in pass 3 with two verified agents; N7 has two
  // agents and no items. Neither may buy another wave.
  // N7 gets its own agents: sharing S2's hypotheses would make them contested, and that rule, not
  // the seed rule, would then be what keeps S2 from counting.
  const seeded = { 'cluster:1-2': CLUSTERS['cluster:1-2'], 'cluster:3': [...CLUSTERS['cluster:1-2'], fam('S2', ['r20', 'r21']), fam('N7', ['r22', 'r24'], [])] };
  const { out } = await run(baseArgs({ seeds: ['S1', 'S2'] }), { clusters: seeded });
  assert.equal(out.edgeWaves, 0);
  assert.equal(out.stopReason, 'no-new-family-with-independent-convergence');
});

test('no new family at cluster 3 means no edge wave at all', async () => {
  const flat = { 'cluster:1-2': CLUSTERS['cluster:1-2'], 'cluster:3': CLUSTERS['cluster:1-2'] };
  const { out } = await run(baseArgs(), { clusters: flat });
  assert.equal(out.edgeWaves, 0);
  assert.equal(out.consulted, 30);
});

test('maxEdgeWaves 0 stops before the first edge wave, and says so', async () => {
  const { out } = await run(baseArgs({ maxEdgeWaves: 0 }));
  assert.equal(out.stopReason, 'max-edge-waves');
  assert.equal(out.edgeWaves, 0);
});

// --- Wave shape -----------------------------------------------------------------------------

test('a remainder smaller than half a wave joins the last edge wave instead of running alone', async () => {
  const strongEvery = { ...CLUSTERS, 'cluster:4': [...CLUSTERS['cluster:3'], fam('N9', ['r30', 'r31'])] };
  const { out } = await run(baseArgs({ roster: roster(40) }), { clusters: strongEvery });
  assert.equal(out.edgeWaves, 1);
  assert.equal(out.consulted, 2 + 40);
  assert.equal(out.stopReason, 'roster-exhausted');
});

test('a remainder after wave 3 smaller than half a wave joins wave 3', async () => {
  const { out, calls } = await run(baseArgs({ roster: roster(29) }));
  assert.equal(out.edgeWaves, 0);
  assert.equal(calls.filter((c) => /^challenge:r\d+$/.test(c.opts.label)).length, 11);
  assert.equal(out.stopReason, 'roster-exhausted');
});

test('an empty wave 3 runs the adversary but no second cluster pass', async () => {
  const { out, calls } = await run(baseArgs({ roster: roster(8) }));
  assert.equal(calls.filter((c) => /^challenge:r\d+$/.test(c.opts.label)).length, 0);
  assert.equal(labelled(calls, /^challenge:advocatus-diaboli$/).length, 1);
  assert.deepEqual(labelled(calls, /^cluster:/).map((c) => c.opts.label), ['cluster:1-2']);
  assert.equal(out.consulted, 10);
});

test('territories no prospector was homed in are reported', async () => {
  const many = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`T${i + 1}`, [`t${i + 1}/x.sh`]]));
  const args = baseArgs({ territories: many, expectItems: 12, roster: roster(8), itemRoot: undefined });
  const cites = (label, opts) => (isProspector({ opts }, args) ? { hypotheses: [HYP({ instances: ['t1/x.sh'] })], files_read: [] } : undefined);
  const { out, logs } = await run(args, { override: cites });
  assert.deepEqual(out.unvisited, ['T9', 'T10', 'T11', 'T12']);
  assert.ok(logs.some((l) => l.includes('territories no prospector was homed in: T9, T10, T11, T12')));
});

// --- Failures that must not read as convergence -------------------------------------------------

test('a cluster pass that dies twice stops the run as cluster-failed, and its wave reaches the synthesis', async () => {
  const { out, calls } = await run(baseArgs(), { override: (label) => (label.startsWith('cluster:3') ? null : undefined) });
  assert.equal(out.stopReason, 'cluster-failed');
  assert.deepEqual(labelled(calls, /^cluster:3/).map((c) => c.opts.label), ['cluster:3', 'cluster:3:retry']);
  assert.equal(out.clusters.length, 1);
  assert.equal(out.unclustered, 10);
  const syn = labelled(calls, /^synthesize$/)[0].prompt;
  assert.match(syn, /NEVER CLUSTERED \(the run stopped with 'cluster-failed'/);
  assert.match(syn, /"agent":"r19"/);
});

test('a cluster pass with zero families is a failure too, and one retry can recover it', async () => {
  let first = true;
  const once = (label) => { if (label === 'cluster:3' && first) { first = false; return { families: [], noise: '' }; } return undefined; };
  const { out, calls } = await run(baseArgs(), { override: once });
  assert.notEqual(out.stopReason, 'cluster-failed');
  assert.ok(labelled(calls, /^cluster:3:retry$/).length === 1);
  assert.equal(out.unclustered, 0);
});

test('a dead first cluster pass ends the run before wave 3, with every hypothesis unclustered', async () => {
  const { out, calls } = await run(baseArgs(), { override: (label) => (label.startsWith('cluster:1-2') ? null : undefined) });
  assert.equal(out.stopReason, 'cluster-failed');
  assert.equal(calls.filter((c) => /^challenge:/.test(c.opts.label)).length, 0);
  assert.equal(out.unclustered, 20);
});

// --- The late challenge ---------------------------------------------------------------------

test('the late challenge covers the families the wave-3 adversary did not answer, and only those', async () => {
  const { calls, out } = await run(baseArgs());
  const late = labelled(calls, /^late-challenge:advocatus-diaboli$/)[0];
  assert.ok(late, 'no late challenge was spawned');
  assert.match(late.prompt, /"id":"N2"/);
  assert.match(late.prompt, /"id":"N3"/);
  assert.doesNotMatch(late.prompt, /"id":"N1"/);
  assert.doesNotMatch(late.prompt, /"id":"S1"/);
  assert.ok(out.adversarial.late);
});

test('a wave-3 adversary that returns nothing leaves every family to the late challenge', async () => {
  const { calls } = await run(baseArgs(), { override: (label) => (label === 'challenge:advocatus-diaboli' ? null : undefined) });
  const late = labelled(calls, /^late-challenge:/)[0];
  for (const id of ['S1', 'N1', 'N2', 'N3']) assert.match(late.prompt, new RegExp(`"id":"${id}"`));
});

// --- Measured in code -------------------------------------------------------------------------

test('the null model computes both forms from N, m and K, and signals at 3x the higher', async () => {
  // Odd-numbered roster agents file two hypotheses, so m is not 1 and N/K differs from both forms.
  const { out } = await run(baseArgs(), { hyps: (id) => (/^r\d*[13579]$/.test(id) ? 2 : 1) });
  const { N, m, K, expectedIndependent, expectedDistinct, signalAt3x } = out.nullModel;
  assert.equal(N, 40);
  assert.equal(K, 4);
  // 40 prospectors: the 2 pilots and r1..r38, of which the 19 odd-numbered file two.
  const mm = (40 + 19) / 40;
  assert.equal(m, Number(mm.toFixed(2)));
  assert.equal(expectedIndependent, Number((40 * (1 - (1 - 1 / 4) ** mm)).toFixed(2)));
  assert.equal(expectedDistinct, Number(((40 * mm) / 4).toFixed(2)));
  assert.equal(signalAt3x, Number((3 * Math.max(40 * (1 - (1 - 1 / 4) ** mm), (40 * mm) / 4)).toFixed(2)));
  assert.notEqual(expectedDistinct, Number((40 / 4).toFixed(2)));
});

test('outside-home finders are counted from the citations, not taken from the clusterer', async () => {
  const { out } = await run(baseArgs());
  const n2 = out.familyStats.find((f) => f.id === 'N2');
  // All three cite t2/d.mjs. Territories go round-robin from T1 after the pilot, so r20 is at
  // home in T2, while r21 and r23, homed in T1, found it from outside. Asymmetric on purpose:
  // an inverted home test counts 1 here, not 2.
  assert.equal(n2.agents, 3);
  assert.equal(n2.outsideHome, 2);
});

test('the synthesis ranking keeps only real item ids', async () => {
  const { out } = await run(baseArgs());
  assert.deepEqual(out.final.ranking[0].instances, ['t1/a.sh']);
});

// --- Round 2 of the #1081 review: one level down ------------------------------------------------

test('an agent counts only through the hypothesis assigned to it, not through any of its hypotheses', async () => {
  // r30's assigned hypothesis 0 cites t1/b.sh; its hypothesis 1 cites N3's item. r31's index is out
  // of range. Only r29 is verified, so N3 is weak and the run stops after wave 4.
  const n3 = fam('N3', ['r29', 'r30', { agent: 'r31', hypothesis: 5 }]);
  const clusters = { ...CLUSTERS, 'cluster:4': [...CLUSTERS['cluster:3'], n3] };
  const two = (label, opts) => (label === 'edge:r30' ? { hypotheses: [HYP({ instances: ['t1/b.sh'] }), HYP({ instances: ['t1/a.sh'] })], files_read: [] } : undefined);
  const { out } = await run(baseArgs({ roster: roster(60) }), { clusters, override: two });
  assert.equal(out.edgeWaves, 1);
  const stats = out.familyStats.find((f) => f.id === 'N3');
  assert.equal(stats.listedAgents, 3);
  assert.equal(stats.agents, 1);
});

test('the cluster prompt numbers each hypothesis, so a member can name it', async () => {
  const { calls } = await run(baseArgs());
  assert.match(labelled(calls, /^cluster:1-2$/)[0].prompt, /"hypotheses":\[\{"index":0,"seed":"S1"/);
});

test('an adversary answer about a family it was not shown leaves that family to the late challenge', async () => {
  // The wave-3 adversary is shown S1 and N1, and answers S1, N1 and S2 (a seed from the brief).
  // S2 is first clustered in pass 3, so only the late challenge can cover it.
  const clusters = { 'cluster:1-2': CLUSTERS['cluster:1-2'], 'cluster:3': [...CLUSTERS['cluster:3'], fam('S2', ['r22', 'r24'])], 'cluster:4': [...CLUSTERS['cluster:4'], fam('S2', ['r22', 'r24'])] };
  const extra = (label) => (label === 'challenge:advocatus-diaboli' ? { challenges: ['S1', 'N1', 'S2'].map((family_id) => ({ family_id, verdict: 'holds', strongest_counterargument: '', alternative_explanation: '', falsification_experiment: '', better_home: '' })), missed_family: '' } : undefined);
  const { calls } = await run(baseArgs({ seeds: ['S1', 'S2'] }), { clusters, override: extra });
  const late = labelled(calls, /^late-challenge:/)[0];
  assert.match(late.prompt, /"id":"S2"/);
  assert.doesNotMatch(late.prompt, /"id":"S1"/);
});

test('an adversary answer under an id that does not exist yet covers nothing', async () => {
  const early = (label) => (label === 'challenge:advocatus-diaboli' ? { challenges: ['S1', 'N1', 'N2'].map((family_id) => ({ family_id, verdict: 'holds', strongest_counterargument: '', alternative_explanation: '', falsification_experiment: '', better_home: '' })), missed_family: '' } : undefined);
  const { calls } = await run(baseArgs(), { override: early });
  const late = labelled(calls, /^late-challenge:/)[0];
  assert.ok(late, 'no late challenge ran');
  assert.match(late.prompt, /"id":"N2"/);
});

test('a late adversary that dies is retried once, and a second death is logged', async () => {
  const dead = (label) => (label.startsWith('late-challenge:') ? null : undefined);
  const { out, calls, logs } = await run(baseArgs(), { override: dead });
  assert.deepEqual(labelled(calls, /^late-challenge:/).map((c) => c.opts.label), ['late-challenge:advocatus-diaboli', 'late-challenge:advocatus-diaboli:retry']);
  assert.equal(out.adversarial.late, null);
  assert.ok(logs.some((l) => /late challenge FAILED twice: N2, N3 have no adversarial verdict/.test(l)));
});

test('an edge remainder of more than half a wave runs as its own wave', async () => {
  // Roster 45: wave 4 takes 10 (7 left, more than half of 10), wave 5 takes the 7.
  const clusters = { ...CLUSTERS, 'cluster:4': [...CLUSTERS['cluster:3'], fam('N9', ['r30', 'r31'])], 'cluster:5': [...CLUSTERS['cluster:3'], fam('N9', ['r30', 'r31'])] };
  const { out } = await run(baseArgs({ roster: roster(45) }), { clusters });
  assert.equal(out.edgeWaves, 2);
  const byWave = (w) => out.results.filter((r) => r && r.wave === w).length;
  assert.equal(byWave('4'), 10);
  assert.equal(byWave('5'), 7);
});

test('a remainder after wave 3 of exactly half a wave runs as its own edge wave', async () => {
  const { out } = await run(baseArgs({ roster: roster(33) }));
  const byWave = (w) => out.results.filter((r) => r && r.wave === w).length;
  assert.equal(byWave('3'), 10);
  assert.equal(byWave('4'), 5);
});

test('maxEdgeWaves 0 does not merge a short remainder into wave 3', async () => {
  const { out } = await run(baseArgs({ roster: roster(30), maxEdgeWaves: 0 }));
  assert.equal(out.consulted, 30);
  assert.deepEqual(out.notConsulted, ['r29', 'r30']);
});

// --- Round 3 of the #1081 review -----------------------------------------------------------------

test('a member index that is not an integer counts for nothing, and does not crash the run', async () => {
  // "0" would index the array; "length" would yield a number and throw on .instances.some.
  const n3 = fam('N3', ['r29', { agent: 'r30', hypothesis: '0' }, { agent: 'r31', hypothesis: 'length' }]);
  const clusters = { ...CLUSTERS, 'cluster:4': [...CLUSTERS['cluster:3'], n3] };
  const { out } = await run(baseArgs({ roster: roster(60) }), { clusters });
  assert.equal(out.edgeWaves, 1);
  assert.equal(out.familyStats.find((f) => f.id === 'N3').agents, 1);
});

test('outside-home finders are counted through the assigned hypothesis only', async () => {
  // r25 (home T1) is assigned hypothesis 0, which cites N8's home item; its hypothesis 1 cites
  // N8's T2 item but is not assigned to N8, so r25 is not an outside-home finder of N8.
  const n8 = fam('N8', ['r25'], ['t1/a.sh', 't2/d.mjs']);
  const clusters = { ...CLUSTERS, 'cluster:4': [...CLUSTERS['cluster:4'], n8] };
  const split = (label) => (label === 'challenge:r25' ? { hypotheses: [HYP({ instances: ['t1/a.sh'] }), HYP({ instances: ['t2/d.mjs'] })], files_read: [] } : undefined);
  const { out } = await run(baseArgs(), { clusters, override: split });
  const stats = out.familyStats.find((f) => f.id === 'N8');
  assert.equal(stats.agents, 1);
  assert.equal(stats.outsideHome, 0);
});

test('a hypothesis assigned to two families is credited to neither', async () => {
  const clusters = { ...CLUSTERS, 'cluster:4': [...CLUSTERS['cluster:3'], fam('N3', ['r29', 'r30']), fam('N4', ['r29', 'r30'])] };
  const { out, logs } = await run(baseArgs({ roster: roster(60) }), { clusters });
  assert.equal(out.edgeWaves, 1);
  assert.ok(logs.some((l) => /cluster:4: 2 hypothesis\(es\) verifiably assigned to more than one family, credited to none: r29#0, r30#0/.test(l)));
});

test('the injected family summary counts verified agents, not listed ones', async () => {
  const clusters = { ...CLUSTERS, 'cluster:3': [...CLUSTERS['cluster:1-2'], fam('N2', ['r20', 'r21', 'r23', 'ghost-agent'], ['t2/d.mjs'])] };
  const { calls } = await run(baseArgs(), { clusters });
  const edge = labelled(calls, /^edge:/)[0];
  assert.match(edge.prompt, /^- N2 N2: 3 agents,/m);
});

test('the adversary and the synthesis are shown families without the member bookkeeping', async () => {
  const { calls } = await run(baseArgs());
  for (const c of labelled(calls, /challenge:advocatus-diaboli$|^synthesize$/)) assert.doesNotMatch(c.prompt, /"members"/, c.opts.label);
});

// --- Round 4 of the #1081 review -----------------------------------------------------------------

test('a claim that could never verify contests nothing', async () => {
  // S1 also lists r29#0 (r29's hypothesis 0 cites none of S1's items) and r30 as "0" (a string).
  // Neither may withdraw N3's real claims, so N3 stays strong and a fifth wave runs.
  const s1 = { ...fam('S1', ['janitor', 'r1', { agent: 'r29', hypothesis: 0 }, { agent: 'r30', hypothesis: '0' }], ['t1/b.sh']) };
  const clusters = { ...CLUSTERS, 'cluster:4': [s1, ...CLUSTERS['cluster:3'].slice(1), fam('N3', ['r29', 'r30'])] };
  const split = (label) => (label === 'prospect:r1' || label === 'pilot:janitor' ? { hypotheses: [HYP({ instances: ['t1/b.sh'] })], files_read: [] } : undefined);
  const { out } = await run(baseArgs({ roster: roster(60) }), { clusters, override: split });
  assert.equal(out.edgeWaves, 2);
  assert.equal(out.familyStats.find((f) => f.id === 'N3').contested, 0);
});

test('a contested claim is counted per family, in the stats and on the stop line', async () => {
  const clusters = { ...CLUSTERS, 'cluster:4': [...CLUSTERS['cluster:3'], fam('N3', ['r29', 'r30']), fam('N4', ['r29', 'r30'])] };
  const { out, logs } = await run(baseArgs({ roster: roster(60) }), { clusters });
  assert.equal(out.familyStats.find((f) => f.id === 'N3').contested, 2);
  assert.ok(logs.some((l) => /cluster 4: .*new with fewer: N3 \(2 contested\), N4 \(2 contested\)/.test(l)), logs.join('\n'));
});

test('the contested count is of hypotheses, not of member entries', async () => {
  // N3 lists r29#0 twice; N4 also claims it. One hypothesis is contested, counted once.
  const clusters = { ...CLUSTERS, 'cluster:4': [...CLUSTERS['cluster:3'], fam('N3', ['r29', 'r29', 'r30']), fam('N4', ['r29'])] };
  const { out } = await run(baseArgs({ roster: roster(60) }), { clusters });
  assert.equal(out.familyStats.find((f) => f.id === 'N3').contested, 1);
});

test('the readers are given verified agent names, not the clusterer\'s list', async () => {
  // The ghost is listed in the final pass too, which is the one the synthesis reads.
  const ghostN2 = fam('N2', ['r20', 'r21', 'r23', 'ghost-agent'], ['t2/d.mjs']);
  const clusters = { ...CLUSTERS, 'cluster:3': [...CLUSTERS['cluster:1-2'], ghostN2], 'cluster:4': [...CLUSTERS['cluster:4'].filter((f) => f.id !== 'N2'), ghostN2] };
  const { calls } = await run(baseArgs(), { clusters });
  const syn = labelled(calls, /^synthesize$/)[0].prompt;
  assert.ok(syn.includes('"id":"N2"'));
  assert.ok(!syn.includes('ghost-agent'), 'a listed-only agent reached the synthesis');
});
