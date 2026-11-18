// ---
// name: prospector-swarm
// description: unleash-the-agents as a Workflow script — cheap-model prospectors in waves over a territory-split corpus, session-model clustering, adversarial passes, and a stop rule that needs independent convergence
// phases: Pilot, Prospect, Cluster, Challenge, Edge, Late challenge, Synthesize
// ---
//
// prospector-swarm — Option C of the unleash-the-agents skill (Step 3): the whole roster as
// a Workflow script, with the prospectors on a cheap model and the judgement stages (cluster,
// adversary, synthesis) on the session model.
//
// RUN IT ONLY ON AN EXPLICIT WORKFLOW OPT-IN. A Workflow run is the user's to ask for: the
// keyword `ultracode`, or the user's own words asking for a workflow or a fan-out. The skill
// alone is not that opt-in. Tell the user the scale before launching. The one measured run
// (tests/results/2026-11-17-unleash-prospector-swarm/RESULT.md) took about 4 h with 84 agents,
// and it involved three models, not two:
// - Haiku produced 66 % of the output tokens;
// - the 9 session-model agents produced 22 %;
// - the advisor, which 60 of the 84 agents called (61 calls, 58 answered, 3 refused with
//   too_many_requests), produced 13 %, on a third model.
// `message.usage` does not count the advisor; `message.usage.iterations` does.
//
// Why a script and not Option A:
// - The stop rule, the citation filter, the wave sizes and the null model are fixed in code, so
//   a run can be re-read and resumed.
// - Raw hypotheses stay out of the lead's context. Only the cluster and synthesis passes read
//   them, and the lead reads the journal afterwards.
//
// Why it lives under the skill and not in workflows/:
// - The workflow contract checker (scripts/check-workflow-contract.js) accepts any registered
//   agent as a literal agentType: it reads each agent's `intent:` line. What it refuses is this
//   template's shape, for three reasons:
//   - the type is computed per spawn (`agentType: a`), and the checker requires a plain string
//     literal;
//   - roster agents such as janitor and advocatus-diaboli are `intent: implementing`, which a
//     phase must declare;
//   - every shell-capable spawn must start its prompt with REPO_SAFETY and name WRITE_LOCATION.
//     The prospectors get the narrower read-only CONTAINMENT block below instead.
// - npm ships skills/ but not workflows/, so a seed there would not reach an npm install.
// - The persona type per spawn is the point of an unleash, and it is also containment: a mystic
//   or a kabalist carries Read/Grep/Glob and no shell.
//
// INVOKE (two launches; the second replays the pilot from cache):
//   Workflow({ scriptPath: '<this skill directory>/references/prospector-swarm.mjs', args: {
//     mode: 'pilot',                       // then 'full', with resumeFromRunId of the pilot run
//     question: 'one sentence: what the swarm must decide',
//     brief: '/abs/path/brief.md',         // the Step 1 brief; every agent reads it first
//     index: '/abs/path/index.tsv',        // optional: the citable ids, one per row
//     itemRoot: '/abs/path/corpus',        // optional: prefix that opens an id
//     territories: { 'T1-name': ['id', ...], 'T2-name': [...] },  // every citable id, split
//     expectItems: 129,                    // the union of territories must have exactly this size
//     roster: ['agent-id', ...],           // shuffled by the caller (scripts cannot randomise);
//                                          // excludes the adversary and the two pilot agents
//     pilot: [{ agent: 'janitor', territory: 'T1-name' }, { agent: 'mystic', territory: 'T2-name' }],
//     seeds: ['S1', 'S2'],                 // families the brief already names; [] if none
//     writeRoot: '/abs/scratch/dir',       // the ONE place an agent may create a file; outside
//                                          // every repository
//   } })
// Optional args:
// - prospectorModel ('haiku'); clusterModel (the session model); adversary ('advocatus-diaboli');
// - edgeWaveSize (10); minNewAgents (2); maxEdgeWaves (6);
// - framing: a lens sentence, in which `{agent}` is replaced by the agent id;
// - extraSteps: an array of instruction lines added to every prospector prompt, for example
//   "read the registry at X before proposing a new tool".
//
// resumeFromRunId works only within the session that ran the pilot. The cache matches on
// (prompt, options), and a prompt names the brief by path, not by content. After a failed
// pilot, or after editing the brief in place, relaunch WITHOUT resume, or the cache hands back
// the old pilot.
//
// Waves:
// - Pilot: 2 agents.
// - Waves 1-2: the first 18 roster agents, 20 with the pilot.
// - Wave 3: the next 10, plus the adversary.
// - Edge waves: `edgeWaveSize` each.
// - A remainder smaller than half a wave joins the wave before it instead of running alone. An
//   empty wave 3 runs only the adversary.
//
// The stop rule: an edge wave runs only while the last cluster pass produced a NEW family that
// at least `minNewAgents` agents filed. The clusterer assigns hypotheses, not just agents
// (`members: [{ agent, hypothesis }]`), and an agent counts only if the hypothesis assigned to it
// exists and cites one of the family's items. A name alone, or a citation from one of the agent's
// other hypotheses, does not count.
// - Measured: the first version continued on any new family citing one valid item, and every
//   pass but the last named one, so it ran the whole roster.
// - The default of 2 is fitted to that one run.
// - The rule cannot see what later waves add to EXISTING families, which is part of their job.
// - RESULT.md's "The stop rule" has both sides.
//
// A cluster pass that dies, or returns no families, is retried once. If the retry fails too, the
// run stops with stopReason 'cluster-failed'. The hypotheses it never clustered go to the
// synthesis, marked as such, rather than vanishing behind a stale pass that reads as
// convergence.
//
// The late challenge covers every family the wave-3 adversary did not answer among those it was
// shown: those born after it was briefed, and all of them if it returned nothing. An answer about
// a family it was not shown covers nothing. A dead late pass is retried once and logged.
//
// Cost note: the synthesis prompt carries the whole hypothesis set (without domain_reasoning) as
// well as the final families, so the prospectors' own predictions reach it. On the measured
// run's data that roughly doubles the synthesis prompt.
//
// After the run, in the lead's own session, not here:
// - read the return value from tasks/<id>.output or journal.jsonl; the notification truncates;
// - read each transcript's message.model AND message.usage.iterations[].model. The second shows
//   an advisor running on a third model, which message.model and message.usage both miss;
// - check containment with before-and-after listings of everything an agent could reach, plus the
//   repository guard where one exists (agent-almanac: npm run guard:snapshot / guard:verify).
//   A prompt is not a sandbox: in the measured run 6 of the 45 Bash-using prospectors wrote
//   scratch copies despite a "write nothing" sentence;
// - re-derive every cited claim you will repeat. The swarm executes nothing, so each
//   testable_prediction it returns is unrun.

export const meta = {
  name: 'prospector-swarm',
  description: 'unleash-the-agents as a Workflow script: cheap-model prospectors in waves, session-model clustering, adversarial passes, and a convergence stop rule',
  phases: [
    { title: 'Pilot', detail: 'two prospectors; check the models, the citations and containment before the full run' },
    { title: 'Prospect', detail: 'waves 1-2, one home territory each' },
    { title: 'Cluster', detail: 'group hypotheses into families by mechanism (session model)' },
    { title: 'Challenge', detail: 'wave 3 plus the adversary' },
    { title: 'Edge', detail: 'later waves, only while a new family has independent convergence' },
    { title: 'Late challenge', detail: 'the adversary on every family the wave-3 pass did not answer' },
    { title: 'Synthesize', detail: 'the final ranking (session model)' },
  ],
}

// --- Arguments: refuse before the first agent is spawned --------------------------------------
// A launch with an unfilled placeholder once spawned nothing and failed at the first prompt it
// built; these checks make every such launch fail here, naming the argument, at zero agents.

const A = args && typeof args === 'object' && !Array.isArray(args) ? args : {}
const refuse = (msg) => { throw new Error(`prospector-swarm: ${msg}`) }
const UNFILLED = /__FILL__|^<.*>$|^\s*$/
const absPath = (name, required = true) => {
  const v = A[name]
  if (v === undefined && !required) return undefined
  if (typeof v !== 'string' || UNFILLED.test(v) || !v.startsWith('/')) refuse(`args.${name} must be an absolute path; got ${JSON.stringify(v)}`)
  return v.replace(/\/+$/, '')
}
const intArg = (name, dflt, min) => {
  const v = A[name] === undefined ? dflt : A[name]
  if (!Number.isInteger(v) || v < min) refuse(`args.${name} must be an integer >= ${min}; got ${JSON.stringify(v)}`)
  return v
}

const MODE = A.mode
if (MODE !== 'pilot' && MODE !== 'full') refuse(`args.mode must be 'pilot' or 'full'; got ${JSON.stringify(MODE)}`)
if (typeof A.question !== 'string' || UNFILLED.test(A.question)) refuse('args.question must be one sentence naming what the swarm decides')
const QUESTION = A.question.trim()
const BRIEF = absPath('brief')
const INDEX_FILE = absPath('index', false)
const ITEM_ROOT = absPath('itemRoot', false)
const WRITE_ROOT = absPath('writeRoot')

const TERR = A.territories
if (!TERR || typeof TERR !== 'object' || Array.isArray(TERR)) refuse(`args.territories must map a territory name to an array of item ids; got ${Array.isArray(TERR) ? 'an array' : typeof TERR}`)
const TERR_KEYS = Object.keys(TERR)
if (TERR_KEYS.length < 2) refuse(`args.territories needs at least 2 territories; got ${TERR_KEYS.length}`)
for (const k of TERR_KEYS) {
  if (!Array.isArray(TERR[k]) || TERR[k].length === 0 || !TERR[k].every((x) => typeof x === 'string' && !UNFILLED.test(x)))
    refuse(`args.territories['${k}'] must be a non-empty array of item ids`)
}
const ITEMS = new Set(Object.values(TERR).flat())
const EXPECT = intArg('expectItems', undefined, 1)
if (ITEMS.size !== EXPECT) refuse(`the territories hold ${ITEMS.size} distinct items; args.expectItems says ${EXPECT}`)

const ADVERSARY = A.adversary === undefined ? 'advocatus-diaboli' : A.adversary
if (typeof ADVERSARY !== 'string' || UNFILLED.test(ADVERSARY)) refuse('args.adversary must be an agent id')
const PILOT = A.pilot
if (!Array.isArray(PILOT) || PILOT.length !== 2 || !PILOT.every((p) => p && typeof p.agent === 'string' && TERR_KEYS.includes(p.territory)))
  refuse('args.pilot must be two { agent, territory } entries naming existing territories')
const ROSTER = A.roster
if (!Array.isArray(ROSTER) || ROSTER.length < 8 || !ROSTER.every((x) => typeof x === 'string' && !UNFILLED.test(x)))
  refuse(`args.roster must list at least 8 agent ids; got ${Array.isArray(ROSTER) ? ROSTER.length : typeof ROSTER}`)
if (new Set(ROSTER).size !== ROSTER.length) refuse('args.roster lists an agent twice')
for (const x of [ADVERSARY, ...PILOT.map((p) => p.agent)]) if (ROSTER.includes(x)) refuse(`args.roster must not include ${x}: the pilot agents and the adversary run in their own stages`)

const SEEDS = A.seeds === undefined ? [] : A.seeds
if (!Array.isArray(SEEDS) || !SEEDS.every((s) => typeof s === 'string' && /^[A-Za-z][\w-]*$/.test(s) && s !== 'NEW'))
  refuse('args.seeds must be an array of short family ids (not NEW)')
const PROSPECTOR_MODEL = A.prospectorModel === undefined ? 'haiku' : A.prospectorModel
const CLUSTER_MODEL = A.clusterModel // undefined: the session model
const EDGE_SIZE = intArg('edgeWaveSize', 10, 1)
const MIN_NEW = intArg('minNewAgents', 2, 1)
const MAX_EDGE = intArg('maxEdgeWaves', 6, 0)
const EXTRA = A.extraSteps === undefined ? [] : A.extraSteps
if (!Array.isArray(EXTRA) || !EXTRA.every((s) => typeof s === 'string')) refuse('args.extraSteps must be an array of strings')
const FRAMING = typeof A.framing === 'string' && A.framing.trim() ? A.framing
  : 'Lens: you are the {agent} agent. Your discipline has its own sense of when a recurring thing is one pattern and when it is several, and of what would show a pattern to be false. Use that lens to SEE, then answer in concrete terms: item ids, a mechanism, a testable prediction.'

// --- Prompts --------------------------------------------------------------------------------

// Not "write nothing": agents that needed a temporary file broke that sentence. A sanctioned
// place keeps their writes where the lead can find and delete them. An agent with Write but no
// shell gets its own directory, because it cannot run mktemp.
const containment = (who) => [
  'CONTAINMENT (binding; read before anything else).',
  '- Read only. Do not edit or delete any file, do not execute any script from the corpus, and do not run git, gh, npm, npx, node or python.',
  '- If you use a shell, use read commands (cat, head, sed -n, rg, wc, ls, sha256sum), plus mktemp and writes under your own scratch directory below.',
  `- If you need a scratch file and have a shell, create your own directory first, in the same shell call, and print it: DIR="$(mktemp -d "${WRITE_ROOT}/prospect.XXXXXX")" || exit 1; echo "$DIR". Name every path as "\${DIR:?}/<file>", and reuse the printed absolute path in later shell calls and in any Write.`,
  `- Without a shell, write only under ${WRITE_ROOT}/${who}/.`,
  '- Never write anywhere else, /tmp included.',
  '- Your answer goes only through the structured output.',
].join('\n')

const itemPath = (id) => (ITEM_ROOT ? `${ITEM_ROOT}/${id}` : id)
const example = [...ITEMS][0]
const seedLine = SEEDS.length ? `Label each hypothesis with the seed id it extends (${SEEDS.join(', ')}) or NEW.` : 'Label each hypothesis NEW.'

function prospectPrompt(a, t, injection) {
  return [
    `You are consulted as the ${a} agent in a prospecting swarm. The question: ${QUESTION}`,
    containment(a),
    `Step 1. Read the brief: ${BRIEF}`,
    INDEX_FILE ? `Step 2. Read the index of citable items: ${INDEX_FILE}` : '',
    `Step 3. Your home territory is ${t}. Open each of its items:\n` + TERR[t].map((id) => `- ${itemPath(id)}`).join('\n'),
    'You may open any other item. A find outside your home territory counts for more.',
    ...EXTRA,
    FRAMING.split('{agent}').join(a),
    injection || '',
    `Return 1 to 3 hypotheses. Cite instances ONLY as item ids exactly as listed (for example ${example}). ${seedLine} In files_read, list the item ids you opened.`,
  ].filter(Boolean).join('\n\n')
}

const HYP_SCHEMA = {
  type: 'object',
  properties: {
    hypotheses: { type: 'array', minItems: 1, maxItems: 3, items: { type: 'object', properties: {
      seed: { type: 'string', enum: [...SEEDS, 'NEW'] },
      family: { type: 'string', description: 'a short name for the pattern' },
      mechanism: { type: 'string', description: 'one sentence: what recurs, and why' },
      instances: { type: 'array', items: { type: 'string' }, description: 'item ids, verbatim' },
      proposal: { type: 'string', description: 'what should be done about it, in what shape; or empty' },
      confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
      testable_prediction: { type: 'string', description: 'if this is right, then X is true of the corpus' },
      domain_reasoning: { type: 'string', description: 'two sentences at most' },
    }, required: ['seed', 'family', 'mechanism', 'instances', 'proposal', 'confidence', 'testable_prediction', 'domain_reasoning'] } },
    files_read: { type: 'array', items: { type: 'string' } },
  },
  required: ['hypotheses', 'files_read'],
}

// --- Citation filter: a cited id that is not an item is dropped in code, never trusted --------

const norm = (p) => {
  let s = String(p).trim().replace(/^`+|`+$/g, '')
  if (ITEM_ROOT && s.startsWith(`${ITEM_ROOT}/`)) s = s.slice(ITEM_ROOT.length + 1)
  return s
}
let cited = 0, dropped = 0

function clean(a, t, wave, r) {
  if (!r) return null
  const home = new Set(TERR[t])
  const hypotheses = (r.hypotheses || []).map((h) => {
    const all = (h.instances || []).map(norm)
    cited += all.length
    const valid = [...new Set(all.filter((id) => ITEMS.has(id)))]
    dropped += all.filter((id) => !ITEMS.has(id)).length
    return { ...h, instances: valid, outside_home: valid.filter((id) => !home.has(id)).length }
  })
  return { agent: a, territory: t, wave, hypotheses, files_read_valid: (r.files_read || []).map(norm).filter((id) => ITEMS.has(id)).length }
}

const terrCount = Object.fromEntries(TERR_KEYS.map((k) => [k, 0]))
async function prospect(a, t, wave, injection, ph) {
  terrCount[t]++
  const r = await agent(prospectPrompt(a, t, injection), { label: `${ph.toLowerCase().replace(/ /g, '-')}:${a}`, phase: ph, schema: HYP_SCHEMA, model: PROSPECTOR_MODEL, agentType: a })
  return clean(a, t, wave, r)
}

// --- Pilot ----------------------------------------------------------------------------------

phase('Pilot')
const pilot = await parallel(PILOT.map((p) => () => prospect(p.agent, p.territory, '1-2', '', 'Pilot')))
const pilotOk = pilot.every((p) => p && p.hypotheses.some((h) => h.instances.length > 0))
log(`pilot: ${pilot.map((p, i) => (p ? `${p.agent} ${p.hypotheses.length} hyp, ${p.hypotheses.reduce((s, h) => s + h.instances.length, 0)} valid ids, ${p.files_read_valid} items read` : `${PILOT[i].agent} returned nothing`)).join('; ')}; dropped ${dropped} of ${cited} cited ids`)
if (!pilotOk) log('pilot FAILED: a pilot agent returned nothing or cited no valid item; fix the brief or the territories, then relaunch WITHOUT resume')
if (MODE === 'pilot' || !pilotOk) return { mode: MODE, pilotOk, pilot, cited, dropped }

const results = [...pilot]
let tIdx = 0
const nextTerr = () => TERR_KEYS[tIdx++ % TERR_KEYS.length]

phase('Prospect')
const w12 = ROSTER.slice(0, 18).map((a) => ({ a, t: nextTerr() }))
results.push(...(await parallel(w12.map((x) => () => prospect(x.a, x.t, '1-2', '', 'Prospect')))))
log(`waves 1-2: ${results.filter(Boolean).length}/${results.length} returned; dropped ${dropped} of ${cited} cited ids`)

// --- Clustering -----------------------------------------------------------------------------

const CLUSTER_SCHEMA = {
  type: 'object',
  properties: {
    families: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string', description: 'a seed id for a seeded family; N1, N2 ... for new ones; an id keeps its meaning across rounds' },
      name: { type: 'string' },
      mechanism: { type: 'string' },
      members: { type: 'array', items: { type: 'object', properties: {
        agent: { type: 'string' },
        hypothesis: { type: 'integer', description: "the hypothesis's `index` in that agent's list" },
      }, required: ['agent', 'hypothesis'] }, description: 'every hypothesis assigned to this family, as (agent, index)' },
      instances: { type: 'array', items: { type: 'string' } },
      proposals: { type: 'string', description: 'a tally of what the agents proposed to do' },
      disagreements: { type: 'string' },
    }, required: ['id', 'name', 'mechanism', 'members', 'instances', 'proposals', 'disagreements'] } },
    noise: { type: 'string', description: 'hypotheses that fit no family, or only restate the brief' },
  },
  required: ['families', 'noise'],
}

// What clustering and synthesis need, without the free-text domain_reasoning: the cluster prompt
// carries every hypothesis so far and grows with each wave. The journal keeps everything.
const compact = (from = 0, to = results.length) => results.slice(from, to).filter(Boolean).map((r) => ({ agent: r.agent, territory: r.territory, wave: r.wave, hypotheses: r.hypotheses.map((h, index) => ({ index, seed: h.seed, family: h.family, mechanism: h.mechanism, instances: h.instances, proposal: h.proposal, confidence: h.confidence, testable_prediction: h.testable_prediction })) }))

async function clusterOnce(prev, label) {
  const opts = { label, phase: 'Cluster', schema: CLUSTER_SCHEMA }
  if (CLUSTER_MODEL) opts.model = CLUSTER_MODEL
  const r = await agent([
    'You group the hypotheses of a prospecting swarm into families by MECHANISM, not by wording.',
    containment('cluster'),
    `The question: ${QUESTION}. The brief: ${BRIEF}.${INDEX_FILE ? ` The index: ${INDEX_FILE}.` : ''} Open any item you need to judge whether two hypotheses share a mechanism.`,
    'Rules:',
    `- ${SEEDS.length ? `Seeded families keep the ids ${SEEDS.join(', ')}.` : 'There are no seeded families.'} New families get N1, N2 and so on. An id from a previous round keeps its meaning; never reuse a retired id for a different mechanism.`,
    '- A family is NEW only when it is none of the seeds. Agents labelled their hypotheses themselves; correct a wrong label.',
    '- Put a hypothesis that only restates the brief in noise, credited to no family.',
    "- In members, list every hypothesis you assign to the family as { agent, hypothesis }, where hypothesis is that hypothesis's `index`. Assign each hypothesis to at most one family.",
    prev ? `Families from the previous round (keep their ids): ${JSON.stringify(prev.families.map((f) => ({ id: f.id, name: f.name, mechanism: f.mechanism })))}` : '',
    `All hypotheses so far (instances are already filtered to real item ids): ${JSON.stringify(compact())}`,
  ].filter(Boolean).join('\n\n'), opts)
  if (!r || !Array.isArray(r.families) || r.families.length === 0) return null
  for (const f of r.families) {
    f.instances = [...new Set((f.instances || []).map(norm).filter((id) => ITEMS.has(id)))]
    f.members = (f.members || []).map((x) => ({ agent: String(x?.agent ?? '').trim(), hypothesis: x?.hypothesis }))
    f.agents = [...new Set(f.members.map((x) => x.agent))]
  }
  // The prompt says each hypothesis goes to at most one family. If the clusterer VERIFIABLY assigns
  // one to two (an integer index whose hypothesis cites an item of each family), neither family may
  // count it: one hypothesis would otherwise make two families strong. A claim that could never
  // verify (a wrong index, a string, a hypothesis citing none of that family's items) contests
  // nothing: an off-by-one in an unrelated family must not silence a real one. Each family records
  // how many of its claims were withdrawn, so a split that kept the members in both halves is
  // visible in the stats and the stop line, not only in this log.
  const map = byAgent()
  const key = (m) => `${m.agent}#${m.hypothesis}`
  const claims = new Map()
  for (const f of r.families) for (const x of new Set(f.members.filter((m) => verifiable(f, m, map)).map(key))) claims.set(x, (claims.get(x) || 0) + 1)
  const contested = new Set([...claims].filter(([, n]) => n > 1).map(([k]) => k))
  for (const f of r.families) {
    const withdrawn = f.members.filter((m) => contested.has(key(m)) && verifiable(f, m, map))
    f.members = f.members.filter((m) => !withdrawn.includes(m))
    f.contested = new Set(withdrawn.map(key)).size // hypotheses, not member entries
  }
  if (contested.size) log(`${label}: ${contested.size} hypothesis(es) verifiably assigned to more than one family, credited to none: ${[...contested].join(', ')}`)
  return r
}

// One retry; then null, which the caller turns into stopReason 'cluster-failed'.
async function cluster(prev, waveLabel) {
  for (const label of [`cluster:${waveLabel}`, `cluster:${waveLabel}:retry`]) {
    const r = await clusterOnce(prev, label)
    if (r) return r
    log(`${label}: returned nothing or no families`)
  }
  return null
}

// An agent counts toward a family only if it returned, and the hypothesis the clusterer assigned
// to it exists and cites one of the family's items.
const byAgent = () => new Map(results.filter(Boolean).map((r) => [r.agent, r]))
// The hypotheses assigned to agent `a` in family `f` that exist and cite one of its items. The index
// must be a real integer: a string such as "0" or "length" would otherwise index the array.
function assigned(f, a, map) {
  const own = new Set(f.instances)
  return (f.members || []).filter((x) => x.agent === a && Number.isInteger(x.hypothesis))
    .map((x) => map.get(a)?.hypotheses[x.hypothesis])
    .filter((h) => h && h.instances.some((id) => own.has(id)))
}
// One member claim of family f that can verify: an integer index whose hypothesis cites f's items.
function verifiable(f, m, map) {
  if (!Number.isInteger(m.hypothesis)) return false
  const h = map.get(m.agent)?.hypotheses[m.hypothesis]
  return !!h && h.instances.some((id) => f.instances.includes(id))
}
function verifiedAgents(f, map = byAgent()) {
  return (f.agents || []).filter((a) => assigned(f, a, map).length > 0)
}

// New families are counted in code against the previous pass's ids, not taken from the
// clusterer's own list. A family "counts" toward another wave only with MIN_NEW verified agents.
function newFamilies(prev, c) {
  const seen = new Set((prev?.families || []).map((f) => f.id))
  const map = byAgent()
  const fresh = (c?.families || []).filter((f) => !seen.has(f.id) && !SEEDS.includes(f.id) && f.instances.length > 0)
  return { strong: fresh.filter((f) => verifiedAgents(f, map).length >= MIN_NEW).map((f) => f.id), weak: fresh.filter((f) => verifiedAgents(f, map).length < MIN_NEW).map((f) => f.id) }
}
const summary = (c) => (c?.families || []).map((f) => `- ${f.id} ${f.name}: ${verifiedAgents(f).length} agents, ${f.instances.length} items; proposals: ${f.proposals}; disagreements: ${f.disagreements}`).join('\n')

const clusters = []
let c = null              // the last pass that succeeded
let clusteredUpTo = 0     // results[0 .. clusteredUpTo) are covered by c
let stopReason = null
let fresh = { strong: [], weak: [] }

async function clusterWave(waveLabel) {
  const next = await cluster(c, waveLabel)
  if (!next) { stopReason = 'cluster-failed'; log(`cluster ${waveLabel} FAILED twice; stopping, and the synthesis is told which hypotheses were never clustered`); return }
  fresh = newFamilies(c, next)
  c = next
  clusteredUpTo = results.length
  clusters.push(next)
  const tag = (id) => { const n = next.families.find((f) => f.id === id)?.contested || 0; return n ? `${id} (${n} contested)` : id }
  log(`cluster ${waveLabel}: ${next.families.length} families; new with >= ${MIN_NEW} verified agents: ${fresh.strong.map(tag).join(', ') || 'none'}; new with fewer: ${fresh.weak.map(tag).join(', ') || 'none'}`)
}

await clusterWave('1-2')

// --- Wave 3 and the adversary -----------------------------------------------------------------

const ADV_SCHEMA = {
  type: 'object',
  properties: {
    challenges: { type: 'array', items: { type: 'object', properties: {
      family_id: { type: 'string' },
      verdict: { type: 'string', enum: ['holds', 'weakened', 'refuted'] },
      strongest_counterargument: { type: 'string' },
      alternative_explanation: { type: 'string' },
      falsification_experiment: { type: 'string', description: 'a read-only check the lead can run' },
      better_home: { type: 'string', description: 'what should absorb it instead, or none' },
    }, required: ['family_id', 'verdict', 'strongest_counterargument', 'alternative_explanation', 'falsification_experiment', 'better_home'] } },
    missed_family: { type: 'string', description: 'a pattern the swarm missed, with item ids, or empty' },
  },
  required: ['challenges', 'missed_family'],
}
// Readers (the adversary, the synthesis) get the families without the member bookkeeping.
const forReaders = (families) => families.map((f) => { const { members, ...rest } = f; return { ...rest, agents: verifiedAgents(f) } })
const adversaryPrompt = (families, which) => [
  `You are the adversarial pass over a prospecting swarm. The question: ${QUESTION}`,
  containment(ADVERSARY),
  `Read the brief (${BRIEF})${INDEX_FILE ? `, the index (${INDEX_FILE})` : ''} and every item you need.`,
  `${which}:\n${JSON.stringify(forReaders(families))}`,
  'For each family: steelman it, then find the strongest counterargument.',
  '- Is it real recurrence, or one purpose met differently each time?',
  '- Is it the brief speaking back: a family the brief named, found by agents whose territory was built around it?',
  '- Should something that already exists absorb it?',
  'Give each a read-only falsification experiment.',
].join('\n\n')

let start = 18
let adv3 = null
let shownIds = new Set()
if (!stopReason) {
  phase('Challenge')
  // A remainder after wave 3 smaller than half an edge wave joins wave 3 instead of running alone.
  const end3 = MAX_EDGE > 0 && ROSTER.length - 28 > 0 && ROSTER.length - 28 < Math.ceil(EDGE_SIZE / 2) ? ROSTER.length : 28
  const w3 = ROSTER.slice(18, end3).map((a) => ({ a, t: nextTerr() }))
  const inject3 = `Update from waves 1-2 (${results.filter(Boolean).length} agents). Families so far:\n${summary(c)}\n\nDo NOT restate these. Extend them: name items they missed, dispute a proposal with a reason, or find a NEW family. Every claim cites item ids.`
  shownIds = new Set(c.families.map((f) => f.id))
  const [w3res, a3] = await Promise.all([
    parallel(w3.map((x) => () => prospect(x.a, x.t, '3', inject3, 'Challenge'))),
    agent(adversaryPrompt(c.families, `The families the first ${results.filter(Boolean).length} agents converged on`), { label: `challenge:${ADVERSARY}`, phase: 'Challenge', schema: ADV_SCHEMA, agentType: ADVERSARY }),
  ])
  adv3 = a3
  results.push(...w3res)
  start = end3
  log(`wave 3: ${w3res.filter(Boolean).length}/${w3.length} returned; adversary ${adv3 ? 'returned' : 'returned nothing'}; dropped ${dropped} of ${cited} cited ids`)
  if (w3.length > 0) await clusterWave('3')
}
// What the wave-3 adversary actually ANSWERED among what it was SHOWN. An answer about a family it
// was not shown (a seed from the brief, an id it invented) covers nothing.
const answeredIds = new Set((adv3?.challenges || []).map((x) => x.family_id).filter((id) => shownIds.has(id)))

// --- Edge waves ---------------------------------------------------------------------------------

let edgeWaves = 0
while (!stopReason && start < ROSTER.length) {
  if (fresh.strong.length === 0) { stopReason = 'no-new-family-with-independent-convergence'; break }
  if (edgeWaves >= MAX_EDGE) { stopReason = 'max-edge-waves'; break }
  phase('Edge')
  const waveLabel = String(4 + edgeWaves)
  // A remainder smaller than half a wave joins this one rather than running alone.
  const size = ROSTER.length - (start + EDGE_SIZE) < Math.ceil(EDGE_SIZE / 2) ? ROSTER.length - start : EDGE_SIZE
  const inject = `Update from earlier waves (${results.filter(Boolean).length} agents). Established families:\n${summary(c)}\n\nThese are established. Work the edges: items that break a family, a family that is really two, a proposal that would fail in use, and NEW families. Every claim cites item ids.`
  const w = ROSTER.slice(start, start + size).map((a) => ({ a, t: nextTerr() }))
  start += size; edgeWaves++
  results.push(...(await parallel(w.map((x) => () => prospect(x.a, x.t, waveLabel, inject, 'Edge')))))
  await clusterWave(waveLabel)
}
if (!stopReason) stopReason = 'roster-exhausted'
const notConsulted = ROSTER.slice(start)
const unvisited = TERR_KEYS.filter((k) => terrCount[k] === 0)
log(`stopped: ${stopReason}; ${notConsulted.length} roster agents not consulted${notConsulted.length ? ` (${notConsulted.join(', ')})` : ''}`)
if (unvisited.length) log(`territories no prospector was homed in: ${unvisited.join(', ')}`)

// --- Late challenge: every family the wave-3 adversary did not answer ---------------------------

const late = (c?.families || []).filter((f) => !answeredIds.has(f.id) && f.instances.length > 0)
let advLate = null
if (late.length) {
  phase('Late challenge')
  for (const label of [`late-challenge:${ADVERSARY}`, `late-challenge:${ADVERSARY}:retry`]) {
    advLate = await agent(adversaryPrompt(late, 'Families no adversary has answered yet'), { label, phase: 'Late challenge', schema: ADV_SCHEMA, agentType: ADVERSARY })
    if (advLate) break
    log(`${label}: returned nothing`)
  }
  if (!advLate) log(`late challenge FAILED twice: ${late.map((f) => f.id).join(', ')} have no adversarial verdict`)
}

// --- Measured in code: convergence, outside-home finders, and the null model -------------------

const done = results.filter(Boolean)
const finalMap = byAgent()
const familyStats = (c?.families || []).map((f) => {
  const agents = verifiedAgents(f, finalMap)
  const own = new Set(f.instances)
  const outsideHome = agents.filter((a) => {
    const home = new Set(TERR[finalMap.get(a).territory])
    return assigned(f, a, finalMap).some((h) => h.instances.some((id) => own.has(id) && !home.has(id)))
  }).length
  return { id: f.id, listedAgents: f.agents.length, agents: agents.length, outsideHome, contested: f.contested || 0, items: f.instances.length }
})
// Expected agents per family under two assumptions. N agents file m hypotheses each among K
// families:
// - if an agent's hypotheses may land in the same family: N * (1 - (1 - 1/K)^m);
// - if they always land in distinct families: N * m / K. This fits the measured run as far as its
//   cluster output shows (it maps agents, not hypotheses, to families), and it is always the
//   higher bar.
// Signal is 3x the higher of the two. K is post hoc (the cluster passes chose it), and seeded
// families were named in the brief, so treat a ratio as a screen, not a test.
const N = done.length
const m = N ? done.reduce((s, r) => s + r.hypotheses.length, 0) / N : 0
const K = (c?.families || []).length
const expectedIndependent = K ? N * (1 - Math.pow(1 - 1 / K, m)) : 0
const expectedDistinct = K ? Math.min(N, (N * m) / K) : 0
const round2 = (x) => Number(x.toFixed(2))
const nullModel = { N, m: round2(m), K, expectedIndependent: round2(expectedIndependent), expectedDistinct: round2(expectedDistinct), signalAt3x: round2(3 * Math.max(expectedIndependent, expectedDistinct)) }
const unclustered = compact(clusteredUpTo)

// --- Synthesis ------------------------------------------------------------------------------

phase('Synthesize')
const SYN_SCHEMA = {
  type: 'object',
  properties: {
    ranking: { type: 'array', items: { type: 'object', properties: {
      rank: { type: 'number' },
      family_id: { type: 'string' },
      name: { type: 'string' },
      recommendation: { type: 'string' },
      instances: { type: 'array', items: { type: 'string' } },
      convergence: { type: 'string', description: 'verified agents, of whom outside home, against the null model' },
      adversarial_verdict: { type: 'string', description: 'the verdict, or "not challenged"' },
      testable_prediction: { type: 'string', description: "the prospectors' own prediction where one fits, else yours, marked as yours" },
      why_this_rank: { type: 'string' },
    }, required: ['rank', 'family_id', 'name', 'recommendation', 'instances', 'convergence', 'adversarial_verdict', 'testable_prediction', 'why_this_rank'] } },
    dropped_families: { type: 'array', items: { type: 'object', properties: { family_id: { type: 'string' }, reason: { type: 'string' } }, required: ['family_id', 'reason'] } },
    notes: { type: 'string', description: 'method, open conflicts for the user, and what you carried unverified' },
  },
  required: ['ranking', 'dropped_families', 'notes'],
}
const final = await agent([
  `Synthesize the final ranking from a prospecting swarm and its adversarial passes. The question: ${QUESTION}`,
  containment('synthesize'),
  `Brief: ${BRIEF}.${INDEX_FILE ? ` Index: ${INDEX_FILE}.` : ''}`,
  'Rank by evidence: distinct items, verified agents who found the family OUTSIDE their home territory, convergence against the null model below, and whether the adversarial verdict holds. Drop a refuted family unless the evidence answers the refutation. Say which claims you re-read and which you carried. Every instance must be an item id.',
  `Final families: ${JSON.stringify(forReaders(c?.families || []))}`,
  `Hypotheses so far, with the prospectors' own testable predictions: ${JSON.stringify(compact(0, clusteredUpTo))}`,
  unclustered.length ? `NEVER CLUSTERED (the run stopped with '${stopReason}' before a pass covered them); weigh them yourself and say so: ${JSON.stringify(unclustered)}` : '',
  `Measured in code: ${JSON.stringify({ familyStats, nullModel, terrCount, stopReason, unvisited })}`,
  `Wave-3 adversary: ${JSON.stringify(adv3)}`,
  `Late adversary: ${JSON.stringify(advLate)}`,
].filter(Boolean).join('\n\n'), { label: 'synthesize', phase: 'Synthesize', schema: SYN_SCHEMA })
if (final) for (const r of final.ranking) r.instances = [...new Set((r.instances || []).map(norm).filter((id) => ITEMS.has(id)))]

return { mode: MODE, stopReason, consulted: done.length, attempted: results.length, edgeWaves, notConsulted, unvisited, unclustered: unclustered.length, cited, dropped, terrCount, nullModel, familyStats, final, adversarial: { wave3: adv3, late: advLate }, clusters, results }
