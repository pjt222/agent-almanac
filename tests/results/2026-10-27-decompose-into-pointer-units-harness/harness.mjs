// harness.mjs: run the Workflow skeleton in skills/decompose-into-pointer-units/references/EXAMPLES.md
// against mocked agent / pipeline / parallel / phase / log, one scenario per stop-handling path.
// Usage (from the repository root): node tests/results/2026-10-27-decompose-into-pointer-units-harness/harness.mjs <EXAMPLES.md>
// Prints one line per assertion (PASS / FAIL) and exits 1 if any assertion fails.
//
// The mock completeness critic is DISOBEDIENT: it proposes every spec it sees no digest entry for,
// held or stopped or not, whatever the prompt says. A guard that rests on the critic obeying its
// prompt therefore fails here. (Review round 2 of #1024 found the earlier, obedient mock passing
// a skeleton whose gap round ran over held scope.)
import { readFileSync } from 'node:fs';

const examplesPath = process.argv[2];
if (!examplesPath) { console.error('usage: node harness.mjs <EXAMPLES.md>'); process.exit(2); }
const markdown = readFileSync(examplesPath, 'utf8');
const section = markdown.slice(markdown.indexOf('## Workflow skeleton'));
const start = section.indexOf('```javascript\n') + '```javascript\n'.length;
const skeleton = section.slice(start, section.indexOf('\n```\n', start) + 1);
if (!skeleton.includes('export const meta')) { console.error('no skeleton found'); process.exit(2); }
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const body = new AsyncFunction('args', 'agent', 'pipeline', 'parallel', 'phase', 'log',
  skeleton.replace(/^\s*export const meta/m, 'const meta'));

const SPECS = [
  { kind: 'cl', id: 'CL-A', release: '1.0', lines: [4, 5] },
  { kind: 'cl', id: 'CL-B', release: '1.0', lines: [6, 7] },
  { kind: 'cl', id: 'CL-C', release: '1.0', lines: [8] },
];
const SOURCE_TEXT = { 'safety-classifier': 'a safety classifier', 'policy-hook': 'a policy hook', reviewer: 'a reviewer' };

// One mock run. `units` maps a spec id to its behaviour: clean, stop:<source>, missing-stop,
// negated-clean or null. `verifiers` maps a verifier label to null or stop:<source>.
// `critics` maps a critic label to null, stop:<source> or gaps:<JSON list>. The key '*' applies to every label not named.
async function run({ units = {}, verifiers = {}, critics = {}, specs = SPECS, extraArgs = {} }) {
  const calls = [], logs = [], prompts = {};
  const unitResult = (id, behaviour) => {
    if (behaviour === 'null') return null;
    const base = { unit: id, report_path: `/r/${id}.txt`, items: 1, non_benign: [`${id}-1 | claim | class | high | ptr`] };
    if (behaviour?.startsWith('stop:')) {
      const source = behaviour.slice(5);
      return { ...base, stop: source, open: [`STOPPED: ${source}`, `stopped by ${SOURCE_TEXT[source]}`] };
    }
    if (behaviour === 'missing-stop') return { ...base, open: ['nothing open'] };
    if (behaviour === 'negated-clean') return { ...base, stop: 'none', open: ['This unit was never stopped by a safety classifier.'] };
    return { ...base, stop: 'none', open: ['Not stopped by a safety classifier'] };
  };
  const schemas = {};
  const agent = async (prompt, opts) => {
    const label = opts.label;
    calls.push(label);
    prompts[label] = prompt;
    schemas[label] = opts.schema;
    if (label.startsWith('verify ')) {
      const b = verifiers[label] ?? verifiers['*'];
      if (b === 'null') return null;
      return { unit: 'x', item: 'claim', verdict: 'CONFIRMED', reasoning: 'r', report_path: '/r/V.txt', stop: b?.startsWith('stop:') ? b.slice(5) : 'none' };
    }
    if (label.startsWith('critic ') || label.startsWith('completeness ')) {
      const b = critics[label] ?? critics['*'];
      if (b === 'null') return null;
      if (b?.startsWith('gaps:')) return { report_path: `/r/${label}.txt`, corrections: [], gaps: JSON.parse(b.slice(5)), stop: 'none' };
      const gaps = label.startsWith('completeness ')
        ? specs.filter((s) => !prompt.includes(`## ${s.id} `)).map((s) => ({ title: `${s.id} uncovered`, question: `cover ${s.id}'s pointers`, priority: 1, topic: 'coverage', covers_held: false }))
        : [{ title: 'Generic gap', question: 'a question about the brief', priority: 2, topic: 'accuracy', covers_held: false }];
      return { report_path: `/r/${label}.txt`, corrections: [], gaps, stop: b?.startsWith('stop:') ? b.slice(5) : 'none' };
    }
    return unitResult(label, units[label] ?? 'clean');
  };
  const pipeline = async (items, ...stages) => Promise.all(items.map(async (item, index) => {
    try { let result = await stages[0](item, item, index); for (const stage of stages.slice(1)) result = await stage(result, item, index); return result; }
    catch (error) { if (error instanceof ReferenceError || error instanceof TypeError) throw error; return null; }
  }));
  const parallel = async (thunks) => Promise.all(thunks.map((thunk) => thunk()));
  let result, thrown = null;
  try {
    result = await body({ tag: 'R1', specs, reportDir: '/r', brief: '/b.txt', mech: '/m', source: '/m/changelog.md', ...extraArgs },
      agent, pipeline, parallel, () => {}, (line) => logs.push(line));
  } catch (error) { thrown = error; }
  const specIds = new Set(specs.map((s) => s.id));
  const unitCalls = calls.filter((c) => !c.startsWith('verify ') && !c.startsWith('critic ') && !c.startsWith('completeness '));
  return { result, thrown, calls, logs, prompts, schemas, extraUnits: unitCalls.filter((c) => !specIds.has(c)) };
}

let failures = 0;
const check = (scenario, name, ok) => { if (!ok) failures += 1; console.log(`${ok ? 'PASS' : 'FAIL'}  ${scenario}: ${name}`); };
const noGapUnit = (o) => o.extraUnits.length === 0;
const ranOnce = (o, label) => o.calls.filter((c) => c === label).length === 1; // === 1: a renamed label (0 calls) fails too
const logMatches = (o, re) => o.logs.some((l) => re.test(l));
// rerun_prompts must exist (an object) and not name the id: a missing field fails rather than passing as "no prompt".
const noPrompt = (o, id) => typeof o.result?.rerun_prompts === 'object' && o.result.rerun_prompts !== null && !(id in o.result.rerun_prompts);
const promptIsLaunched = (o, id, label) => typeof o.result?.rerun_prompts?.[id] === 'string' && o.result.rerun_prompts[id] === o.prompts[label];

// S1 control: every unit clean. Gaps come back for the owner; no gap unit runs.
{ const o = await run({});
  check('S1 clean', 'no stop, no missing result', o.result && (o.result.stopped ?? []).length === 0 && Array.isArray(o.result.no_result) && o.result.no_result.length === 0);
  check('S1 clean', 'no rerun prompt when nothing came back empty', typeof o.result?.rerun_prompts === 'object' && Object.keys(o.result.rerun_prompts ?? { x: 1 }).length === 0);
  check('S1 clean', 'a verifier per unit', o.calls.filter((c) => c.startsWith('verify CL-')).length === 3);
  check('S1 clean', 'gaps are returned for the owner', (o.result?.gaps_for_owner ?? []).length > 0);
  check('S1 clean', 'every gap carries an id, a topic and a covers_held flag', (o.result?.gaps_for_owner ?? []).length > 0 && o.result.gaps_for_owner.every((g) => /^G-R1-\d+$/.test(g.id) && typeof g.topic === 'string' && g.topic.length > 0 && typeof g.covers_held === 'boolean'));
  check('S1 clean', 'every critic schema requires covers_held', ['critic R1-1', 'completeness R1'].every((l) => (o.schemas[l]?.properties?.gaps?.items?.required ?? []).includes('covers_held')));
  check('S1 clean', 'no gap unit runs', noGapUnit(o)); }

// S2-S4: a stop from each named source. Recorded, never verified, its scope never run as a gap.
for (const source of ['safety-classifier', 'reviewer', 'policy-hook']) {
  const o = await run({ units: { 'CL-B': `stop:${source}` } });
  const s = `stop ${source}`;
  check(s, 'recorded as stopped', o.result?.stopped?.includes('CL-B'));
  check(s, 'no verifier for the stopped unit', !o.calls.includes('verify CL-B#1'));
  check(s, 'the stopped unit ran once', ranOnce(o, 'CL-B'));
  check(s, 'the stopped unit is not listed under no_result', Array.isArray(o.result?.no_result) && !o.result.no_result.includes('CL-B'));
  check(s, 'the log says not to re-run the stopped unit', logMatches(o, /STOPPED, record by id[^\n]*do not re-run[^\n]*CL-B/));
  check(s, 'the stopped unit has no rerun prompt', noPrompt(o, 'CL-B'));
  check(s, 'no gap unit runs, though the critic proposes the stopped scope', noGapUnit(o) && (o.result?.gaps_for_owner ?? []).some((g) => g.title.startsWith('CL-B')));
  check(s, 'the completeness critic is told the stopped id is held', /HELD[^\n]*\n[^\n]*CL-B/.test(o.prompts['completeness R1'] ?? ''));
  check(s, 'the accuracy critic is told the stopped id is held', /HELD[^\n]*\n[^\n]*CL-B/.test(o.prompts['critic R1-1'] ?? ''));
}

// S5: a unit that omits the stop field is treated as stopped (fail safe).
{ const o = await run({ units: { 'CL-B': 'missing-stop' } });
  check('S5 missing stop field', 'treated as stopped', o.result?.stopped?.includes('CL-B')); }

// S6: a clean unit whose text says "never stopped" is not a stop.
{ const o = await run({ units: { 'CL-B': 'negated-clean' } });
  check('S6 negated clean line', 'not recorded as stopped', o.result && Array.isArray(o.result.stopped) && !o.result.stopped.includes('CL-B')); }

// S7: a unit with no result. Cause undetermined: not marked for re-run, no gap unit runs over it.
{ const o = await run({ units: { 'CL-B': 'null' } });
  check('S7 no result', 'listed under no_result', o.result?.no_result?.includes('CL-B'));
  check('S7 no result', 'the log does not say to re-run as-is', !o.logs.some((l) => /re-run as-is/i.test(l)));
  check('S7 no result', 'the log says the cause is undetermined', o.logs.some((l) => /cause undetermined/i.test(l)));
  check('S7 no result', 'the unit ran once', ranOnce(o, 'CL-B'));
  check('S7 no result', 'a unit gets no rerun prompt; it re-runs as a run of its one spec', noPrompt(o, 'CL-B'));
  check('S7 no result', 'the completeness critic is told the no-result id is held', /HELD[^\n]*\n[^\n]*CL-B/.test(o.prompts['completeness R1'] ?? ''));
  check('S7 no result', 'no gap unit runs', noGapUnit(o)); }

// S8: an input spec of a kind the skeleton does not accept (raw, lead prose) is refused before any agent.
{ const o = await run({ specs: [...SPECS, { kind: 'raw', id: 'RAW-1', question: 'lead prose' }] });
  check('S8 raw input spec', 'refused before any agent', o.thrown !== null && o.calls.length === 0); }

// S9: a held id is never launched, is returned, and reaches the critic even when it is not in this run's specs.
{ const o = await run({ extraArgs: { held: ['CL-B', 'CL-Z'] } });
  check('S9 held id', 'never launched', o.result && !o.calls.includes('CL-B'));
  check('S9 held id', 'returned as held, including an id outside this run', ['CL-B', 'CL-Z'].every((id) => o.result?.held?.includes(id)));
  check('S9 held id', 'the critic is told an id outside this run', /HELD[^\n]*\n[^\n]*CL-Z/.test(o.prompts['completeness R1'] ?? ''));
  check('S9 held id', 'the accuracy critic is told the held ids', /HELD[^\n]*\n[^\n]*CL-B[^\n]*CL-Z/.test(o.prompts['critic R1-1'] ?? ''));
  check('S9 held id', 'no gap unit runs over held scope', noGapUnit(o)); }

// S10: a verifier with no result is recorded, not counted.
{ const o = await run({ verifiers: { 'verify CL-B#1': 'null' } });
  check('S10 verifier no result', 'recorded in verifier_no_result', o.result?.verifier_no_result?.includes('V-CL-B-1'));
  check('S10 verifier no result', 'its id is the basename of the file it writes', (o.prompts['verify CL-B#1'] ?? '').includes('/r/V-CL-B-1.txt'));
  check('S10 verifier no result', 'no verdict counted for it', (o.result?.units?.find((u) => u.unit === 'CL-B')?.verdicts ?? [1]).length === 0);
  check('S10 verifier no result', "'verify CL-B#1' ran once", ranOnce(o, 'verify CL-B#1'));
  check('S10 verifier no result', 'the log says the cause is undetermined', logMatches(o, /NO RESULT from verifier, cause undetermined[^\n]*V-CL-B-1/));
  check('S10 verifier no result', 'the log allows one re-run with args.rerun, for a transient failure only', logMatches(o, /NO RESULT from verifier, cause undetermined[^\n]*transient[^\n]*args\.rerun[^\n]*V-CL-B-1/) && !logMatches(o, /re-run as-is/i));
  check('S10 verifier no result', 'its rerun prompt is the prompt it was launched with', promptIsLaunched(o, 'V-CL-B-1', 'verify CL-B#1'));
  check('S10 verifier no result', 'no gap unit runs', noGapUnit(o)); }

// S11: a verifier that reports a stop is recorded, and its verdict is not counted.
{ const o = await run({ verifiers: { 'verify CL-B#1': 'stop:reviewer' } });
  check('S11 verifier stop', 'recorded in verifier_stopped', o.result?.verifier_stopped?.includes('V-CL-B-1'));
  check('S11 verifier stop', 'its verdict is not counted', (o.result?.units?.find((u) => u.unit === 'CL-B')?.verdicts ?? [1]).length === 0);
  check('S11 verifier stop', "'verify CL-B#1' ran once", ranOnce(o, 'verify CL-B#1'));
  check('S11 verifier stop', 'the log says not to re-run it', logMatches(o, /STOPPED verifier[^\n]*do not re-run[^\n]*V-CL-B-1/));
  check('S11 verifier stop', 'a stopped verifier has no rerun prompt', noPrompt(o, 'V-CL-B-1')); }

// S12: a cl spec without args.source is refused.
{ const o = await run({ extraArgs: { source: undefined } });
  check('S12 cl without source', 'refused before any agent', o.thrown !== null && o.calls.length === 0); }

// S13: an owner-authorised re-scope runs as an owner spec, its scope the owner's words verbatim.
{ const owner = { kind: 'owner', id: 'OW-1', unit: 'CL-B', scope: 'only line 6 of /m/changelog.md, read-only', answer: 'STOP-1' };
  const o = await run({ specs: [...SPECS, owner] });
  const prompt = o.prompts['OW-1'] ?? '';
  check('S13 owner spec', 'the owner scope is in the prompt verbatim', prompt.includes(owner.scope));
  check('S13 owner spec', 'the prompt names the unit and points at the answer', prompt.includes('re-scope of CL-B') && prompt.includes(owner.answer));
  const bad = await run({ specs: [...SPECS, { kind: 'owner', id: 'OW-2', scope: 'x', answer: 'STOP-1' }] });
  check('S13 owner spec', 'an owner spec without its unit is refused before any agent', bad.thrown !== null && bad.calls.length === 0);
  const prose = await run({ specs: [...SPECS, { ...owner, id: 'OW-3', answer: 'also examine line 7' }] });
  check('S13 owner spec', 'an owner spec whose answer is not a STOP-<n> is refused before any agent', prose.thrown !== null && prose.calls.length === 0); }

// S14: a critic with no result, and a critic that reports a stop, are recorded; the stopped critic's gaps are not used.
// CL-B is stopped so that the completeness critic has a gap to propose (S2 shows it does when not stopped).
{ const o = await run({ units: { 'CL-B': 'stop:reviewer' }, critics: { 'critic R1-1': 'null', 'completeness R1': 'stop:safety-classifier' } });
  check('S14 critic no result', 'recorded in critic_no_result', o.result?.critic_no_result?.includes('X-accuracy-R1-1'));
  check('S14 critic no result', 'its id is the basename of the file it writes', (o.prompts['critic R1-1'] ?? '').includes('/r/X-accuracy-R1-1.txt'));
  check('S14 critic no result', "'critic R1-1' ran once", ranOnce(o, 'critic R1-1'));
  check('S14 critic no result', 'the log allows one re-run with args.rerun, for a transient failure only', logMatches(o, /NO RESULT from critic, cause undetermined[^\n]*transient[^\n]*args\.rerun[^\n]*X-accuracy-R1-1/) && !logMatches(o, /re-run as-is/i));
  check('S14 critic no result', 'its rerun prompt is the prompt it was launched with', promptIsLaunched(o, 'X-accuracy-R1-1', 'critic R1-1'));
  check('S14 critic stop', 'recorded in critic_stopped', o.result?.critic_stopped?.includes('X-completeness-R1'));
  check('S14 critic stop', "'completeness R1' ran once", ranOnce(o, 'completeness R1'));
  check('S14 critic stop', 'the log says not to re-run it', logMatches(o, /STOPPED critic[^\n]*do not re-run[^\n]*X-completeness-R1/));
  check('S14 critic stop', 'a stopped critic has no rerun prompt', noPrompt(o, 'X-completeness-R1'));
  check('S14 critic stop', 'its gaps are not used', !(o.result?.gaps_for_owner ?? []).some((g) => g.title.endsWith('uncovered'))); }

// S15: a held list that is not an array would hold nothing; it is refused before any agent.
for (const [kind, held] of [['a string', 'CL-B'], ['an object', { 0: 'CL-B' }]]) {
  const o = await run({ extraArgs: { held } });
  check('S15 held not an array', `${kind} is refused before any agent`, o.thrown !== null && o.calls.length === 0); }

// S16: after a transient failure, one verifier re-runs alone, from the prompt the earlier run returned for it.
{ const first = await run({ verifiers: { 'verify CL-B#1': 'null' } });
  const P = first.result?.rerun_prompts?.['V-CL-B-1'];
  const rerun = { id: 'V-CL-B-1', prompt: P ?? 'no prompt returned' };
  const o = await run({ specs: [], extraArgs: { tag: 'R1-r1', rerun } });
  const only = o.calls.length === 1 ? o.calls[0] : '';
  check('S16 rerun verifier', 'exactly one agent runs', o.thrown === null && o.calls.length === 1);
  check('S16 rerun verifier', 'it runs the returned prompt, byte for byte', typeof P === 'string' && o.prompts[only] === P);
  check('S16 rerun verifier', 'it runs with the verifier schema', (o.schemas[only]?.required ?? []).includes('verdict'));
  check('S16 rerun verifier', 'its verdict is returned', o.result?.verdicts?.length === 1);
  const empty = await run({ specs: [], verifiers: { '*': 'null' }, extraArgs: { tag: 'R1-r1', rerun } });
  check('S16 rerun verifier', 'a second no-result is recorded, with no rerun prompt', (empty.result?.verifier_no_result ?? []).includes('V-CL-B-1') && noPrompt(empty, 'V-CL-B-1') && empty.calls.length === 1);
  const stopped = await run({ specs: [], verifiers: { '*': 'stop:reviewer' }, extraArgs: { tag: 'R1-r1', rerun } });
  check('S16 rerun verifier', 'a stop is recorded and its verdict not counted', (stopped.result?.verifier_stopped ?? []).includes('V-CL-B-1') && (stopped.result?.verdicts ?? [1]).length === 0); }

// S17: one critic re-runs alone; its gaps go to the owner under the new tag, and no gap unit runs.
{ const first = await run({ critics: { 'critic R1-1': 'null' } });
  const P = first.result?.rerun_prompts?.['X-accuracy-R1-1'];
  const rerun = { id: 'X-accuracy-R1-1', prompt: P ?? 'no prompt returned' };
  const o = await run({ specs: [], extraArgs: { tag: 'R1-r1', rerun } });
  const only = o.calls.length === 1 ? o.calls[0] : '';
  check('S17 rerun critic', 'exactly one agent runs, and no gap unit', o.thrown === null && o.calls.length === 1 && noGapUnit(o));
  check('S17 rerun critic', 'it runs the returned prompt, byte for byte', typeof P === 'string' && o.prompts[only] === P);
  check('S17 rerun critic', 'it runs with the critic schema', (o.schemas[only]?.properties?.gaps?.items?.required ?? []).includes('covers_held'));
  check('S17 rerun critic', 'its gaps carry ids under the new tag, a topic and a covers_held flag', (o.result?.gaps_for_owner ?? []).length > 0 && o.result.gaps_for_owner.every((g) => /^G-R1-r1-\d+$/.test(g.id) && typeof g.topic === 'string' && typeof g.covers_held === 'boolean'));
  const stopped = await run({ specs: [], critics: { '*': 'stop:reviewer' }, extraArgs: { tag: 'R1-r1', rerun } });
  check('S17 rerun critic', 'a stop is recorded and its gaps not used', (stopped.result?.critic_stopped ?? []).includes('X-accuracy-R1-1') && Array.isArray(stopped.result?.gaps_for_owner) && stopped.result.gaps_for_owner.length === 0);
  const empty = await run({ specs: [], critics: { '*': 'null' }, extraArgs: { tag: 'R1-r1', rerun } });
  check('S17 rerun critic', 'a second no-result is recorded, with no rerun prompt', (empty.result?.critic_no_result ?? []).includes('X-accuracy-R1-1') && noPrompt(empty, 'X-accuracy-R1-1')); }

// S18: a rerun is one verifier or critic with its prompt, under a tag, and nothing else; anything else is refused.
for (const [name, specs, extraArgs] of [
  ['a unit id', [], { rerun: { id: 'CL-B', prompt: 'p' } }],
  ['a rerun with specs', SPECS, { rerun: { id: 'V-CL-B-1', prompt: 'p' } }],
  ['a rerun without its prompt', [], { rerun: { id: 'V-CL-B-1' } }],
  ['a rerun without a tag', [], { tag: undefined, rerun: { id: 'V-CL-B-1', prompt: 'p' } }],
]) {
  const o = await run({ specs, extraArgs });
  check('S18 rerun refused', `${name} is refused before any agent`, o.thrown !== null && /rerun/.test(o.thrown.message) && o.calls.length === 0); }

// S20: two critics report one gap (titles equal after lowercasing). The kept, higher-priority copy says covers_held false;
// the dropped copy says true. The flag must survive the dedupe, or the gap deriver would derive it through its topic.
{ const gap = (title, priority, flag) => ({ title, question: `q${priority}`, priority, topic: 'coverage', covers_held: flag });
  const o = await run({ critics: { 'critic R1-1': `gaps:${JSON.stringify([gap('Same gap', 1, false)])}`, 'completeness R1': `gaps:${JSON.stringify([gap('same gap', 2, true)])}` } });
  const same = (o.result?.gaps_for_owner ?? []).filter((g) => g.title.toLowerCase() === 'same gap');
  check('S20 duplicate gaps', 'one copy is kept, the higher-priority one', same.length === 1 && same[0].priority === 1);
  check('S20 duplicate gaps', 'a dropped copy\'s covers_held is carried into the kept copy', same.length === 1 && same[0].covers_held === true); }

// S19: an approved gap spec reaches its unit as a pointer to the recorded question, never as the question's text.
{ const o = await run({ specs: [{ kind: 'gap', id: 'G-R0-1', g: 'G-R0-1', from: 'gaps/R0.json' }] });
  check('S19 gap spec', 'the prompt points at the recorded gaps file', (o.prompts['G-R0-1'] ?? '').includes('the question with id G-R0-1 in /r/gaps/R0.json')); }

console.log(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAIL`}`);
process.exit(failures === 0 ? 0 : 1);
