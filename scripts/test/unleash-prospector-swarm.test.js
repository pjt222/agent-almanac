/**
 * `skills/unleash-the-agents/references/prospector-swarm.mjs` is a Workflow script that lives
 * outside `workflows/`, so neither `check-workflow-contract.js` nor `workflow-template.test.js`
 * reads it. This suite is what does.
 *
 * It parses the file the way the runtime wraps it, then runs the body against a stubbed runtime.
 * The stubs are `agent`, `parallel`, `phase`, `log` and `args`; `agent` answers by label from a
 * script. The behaviours the skill quotes are pinned, each of which a real run measured:
 * - the argument refusals fire before the first agent is spawned;
 * - the stop rule needs a new family that at least `minNewAgents` agents filed;
 * - a cited id that is not an item is dropped;
 * - a family born after the wave-3 adversary's input goes to the late challenge.
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

const fam = (id, agents, instances = ['t1/a.sh']) => ({ id, name: id, mechanism: `m-${id}`, agents, instances, proposals: '', disagreements: '' });

/** The default cluster script: N1 born strong (2 agents) in 1-2, N2 strong in 3, N3 weak in 4. */
const CLUSTERS = {
  'cluster:1-2': [fam('S1', ['janitor', 'r1', 'r2']), fam('N1', ['r3', 'r4'])],
  'cluster:3': [fam('S1', ['janitor', 'r1']), fam('N1', ['r3', 'r4']), fam('N2', ['r20', 'r21'], ['t2/d.mjs'])],
  'cluster:4': [fam('S1', ['janitor']), fam('N1', ['r3']), fam('N2', ['r20', 'r21'], ['t2/d.mjs']), fam('N3', ['r30'])],
};

async function run(args, clusters = CLUSTERS, calls = []) {
  const logs = [];
  const agent = async (prompt, opts = {}) => {
    calls.push({ prompt, opts });
    const label = opts.label || '';
    if (label.startsWith('cluster:')) {
      const families = clusters[label] ?? clusters[Object.keys(clusters).at(-1)];
      return { families: structuredClone(families), noise: '' };
    }
    if (opts.agentType === (args.adversary ?? 'advocatus-diaboli')) return { challenges: [], missed_family: '' };
    if (label === 'synthesize') return { ranking: [{ rank: 1, family_id: 'S1', name: 'S1', recommendation: '', instances: ['t1/a.sh', 'not/an/item.sh'], convergence: '', adversarial_verdict: '', testable_prediction: '', why_this_rank: '' }], dropped_families: [], notes: '' };
    return {
      hypotheses: [{ seed: 'S1', family: 'f', mechanism: 'm', instances: ['t1/a.sh', '/fixture/corpus/t2/d.mjs', 'not/an/item.sh'], proposal: '', confidence: 'low', testable_prediction: '', domain_reasoning: '' }],
      files_read: ['t1/a.sh'],
    };
  };
  const parallel = (thunks) => Promise.all(thunks.map((t) => t().catch(() => null)));
  const fn = new AsyncFunction('agent', 'parallel', 'pipeline', 'phase', 'log', 'args', 'budget', body);
  const out = await fn(agent, parallel, null, () => {}, (m) => logs.push(m), args, { total: null });
  return { out, calls, logs };
}

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

test('the sidecar name, meta.name and every phase() title agree with meta', () => {
  assert.match(SOURCE, /^\/\/ name: prospector-swarm$/m);
  assert.match(SOURCE, /^\s*name: 'prospector-swarm',$/m);
  const metaTitles = [...SOURCE.matchAll(/\{ title: '([^']+)'/g)].map((m) => m[1]);
  const phaseCalls = [...new Set([...SOURCE.matchAll(/\bphase\('([^']+)'\)/g)].map((m) => m[1]))];
  assert.ok(phaseCalls.length >= 6, `found ${phaseCalls.length} phase() calls`);
  for (const t of phaseCalls) assert.ok(metaTitles.includes(t), `phase('${t}') has no meta.phases entry`);
});

const REFUSALS = [
  ['no mode', { mode: undefined }, /args\.mode/],
  ['an unfilled brief', { brief: '__FILL__' }, /args\.brief/],
  ['a relative writeRoot', { writeRoot: 'scratch' }, /args\.writeRoot/],
  ['territories as an array', { territories: [['t1/a.sh']] }, /args\.territories/],
  ['a placeholder territory', { territories: '__FILL__' }, /args\.territories/],
  ['an item count that disagrees', { expectItems: 7 }, /hold 6 distinct items; args\.expectItems says 7/],
  ['a short roster', { roster: roster(3) }, /at least 8 agent ids/],
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
    await assert.rejects(() => run(args, CLUSTERS, calls), re);
    assert.equal(calls.length, 0, `spawned ${calls.length} agent(s) before refusing`);
  });
}

test('refuses before spawning when args itself is missing', async () => {
  await assert.rejects(() => run(undefined), /args\.mode/);
});

test('pilot mode spawns exactly the two pilot agents, on the prospector model, as their own types', async () => {
  const { out, calls } = await run(baseArgs({ mode: 'pilot' }));
  assert.equal(calls.length, 2);
  assert.deepEqual(calls.map((c) => c.opts.agentType), ['janitor', 'mystic']);
  assert.deepEqual(calls.map((c) => c.opts.model), ['haiku', 'haiku']);
  assert.equal(out.mode, 'pilot');
  assert.equal(out.pilotOk, true);
});

test('a cited id that is not an item is dropped, and an itemRoot prefix is stripped, not dropped', async () => {
  const { out } = await run(baseArgs({ mode: 'pilot' }));
  assert.equal(out.cited, 6);
  assert.equal(out.dropped, 2);
  assert.deepEqual(out.pilot[0].hypotheses[0].instances, ['t1/a.sh', 't2/d.mjs']);
});

test('every prospector prompt carries the containment block with its one write location', async () => {
  const { calls } = await run(baseArgs());
  const prospectors = calls.filter((c) => c.opts.model === 'haiku');
  assert.ok(prospectors.length >= 30);
  for (const c of prospectors) {
    assert.match(c.prompt, /^CONTAINMENT \(binding/m);
    assert.ok(c.prompt.includes('mktemp -d "/fixture/scratch/prospect.XXXXXX"'), c.opts.label);
    assert.ok(c.prompt.includes('"${DIR:?}/<file>"'), c.opts.label);
  }
});

test('the stop rule: a wave whose only new family has one agent ends the run', async () => {
  const { out, calls } = await run(baseArgs());
  assert.equal(out.stopReason, 'no-new-family-with-independent-convergence');
  assert.equal(out.edgeWaves, 1);
  assert.equal(out.consulted, 2 + 18 + 10 + 10);
  assert.deepEqual(out.notConsulted, roster(50).slice(38));
  assert.equal(calls.filter((c) => c.opts.label?.startsWith('cluster:')).length, 3);
});

test('the stop rule counts agents, so minNewAgents 1 runs a wave further than 2', async () => {
  // N3, born in cluster 4, has one agent: strong under 1, weak under 2. Cluster 5 repeats 4.
  const two = await run(baseArgs({ roster: roster(60) }));
  const one = await run(baseArgs({ roster: roster(60), minNewAgents: 1 }));
  assert.equal(two.out.edgeWaves, 1);
  assert.equal(one.out.edgeWaves, 2);
  assert.equal(one.out.stopReason, 'no-new-family-with-independent-convergence');
});

test('no new family at cluster 3 means no edge wave at all', async () => {
  const flat = { 'cluster:1-2': CLUSTERS['cluster:1-2'], 'cluster:3': CLUSTERS['cluster:1-2'] };
  const { out } = await run(baseArgs(), flat);
  assert.equal(out.edgeWaves, 0);
  assert.equal(out.consulted, 30);
});

test('a remainder smaller than half a wave joins the last wave instead of running alone', async () => {
  const strongEvery = {
    'cluster:1-2': CLUSTERS['cluster:1-2'],
    'cluster:3': CLUSTERS['cluster:3'],
    'cluster:4': [...CLUSTERS['cluster:3'], fam('N9', ['r30', 'r31'])],
  };
  const { out } = await run(baseArgs({ roster: roster(40) }), strongEvery);
  assert.equal(out.edgeWaves, 1);
  assert.equal(out.consulted, 2 + 40);
  assert.equal(out.stopReason, 'roster-exhausted');
});

test('families born after the wave-3 adversary saw the set go to the late challenge, and only those', async () => {
  const { calls, out } = await run(baseArgs());
  const late = calls.find((c) => c.opts.label === 'late-challenge:advocatus-diaboli');
  assert.ok(late, 'no late challenge was spawned');
  assert.match(late.prompt, /"id":"N2"/);
  assert.match(late.prompt, /"id":"N3"/);
  assert.doesNotMatch(late.prompt, /"id":"N1"/);
  assert.doesNotMatch(late.prompt, /"id":"S1"/);
  assert.ok(out.adversarial.late);
});

test('the null model is computed in code from N, m and K', async () => {
  const { out } = await run(baseArgs());
  const { N, m, K, expectedAgentsPerFamily } = out.nullModel;
  assert.equal(N, 40);
  assert.equal(m, 1);
  assert.equal(K, 4);
  assert.equal(expectedAgentsPerFamily, Number((40 * (1 - (1 - 1 / 4) ** 1)).toFixed(2)));
});

test('outside-home finders are counted from the citations, not taken from the clusterer', async () => {
  const { out } = await run(baseArgs());
  const n2 = out.familyStats.find((f) => f.id === 'N2');
  // Both cite t2/d.mjs. Territories go round-robin from T1 after the pilot, so r20 is at home
  // in T2 and r21, homed in T1, found it from outside.
  assert.equal(n2.agents, 2);
  assert.equal(n2.outsideHome, 1);
});

test('the synthesis ranking keeps only real item ids', async () => {
  const { out } = await run(baseArgs());
  assert.deepEqual(out.final.ranking[0].instances, ['t1/a.sh']);
});
