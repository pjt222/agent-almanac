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
// `critics` maps a critic label to null or stop:<source>.
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
  const agent = async (prompt, opts) => {
    const label = opts.label;
    calls.push(label);
    prompts[label] = prompt;
    if (label.startsWith('verify ')) {
      const b = verifiers[label];
      if (b === 'null') return null;
      return { unit: 'x', item: 'claim', verdict: 'CONFIRMED', reasoning: 'r', report_path: '/r/V.txt', stop: b?.startsWith('stop:') ? b.slice(5) : 'none' };
    }
    if (label.startsWith('critic ') || label.startsWith('completeness ')) {
      const b = critics[label];
      if (b === 'null') return null;
      const gaps = label.startsWith('completeness ')
        ? specs.filter((s) => !prompt.includes(`## ${s.id} `)).map((s) => ({ title: `${s.id} uncovered`, question: `cover ${s.id}'s pointers`, priority: 1, topic: 'coverage' }))
        : [{ title: 'Generic gap', question: 'a question about the brief', priority: 2, topic: 'accuracy' }];
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
  return { result, thrown, calls, logs, prompts, extraUnits: unitCalls.filter((c) => !specIds.has(c)) };
}

let failures = 0;
const check = (scenario, name, ok) => { if (!ok) failures += 1; console.log(`${ok ? 'PASS' : 'FAIL'}  ${scenario}: ${name}`); };
const noGapUnit = (o) => o.extraUnits.length === 0;

// S1 control: every unit clean. Gaps come back for the owner; no gap unit runs.
{ const o = await run({});
  check('S1 clean', 'no stop, no missing result', o.result && (o.result.stopped ?? []).length === 0 && Array.isArray(o.result.no_result) && o.result.no_result.length === 0);
  check('S1 clean', 'a verifier per unit', o.calls.filter((c) => c.startsWith('verify CL-')).length === 3);
  check('S1 clean', 'gaps are returned for the owner', (o.result?.gaps_for_owner ?? []).length > 0);
  check('S1 clean', 'every gap carries an id and a topic', (o.result?.gaps_for_owner ?? []).length > 0 && o.result.gaps_for_owner.every((g) => /^G-R1-\d+$/.test(g.id) && typeof g.topic === 'string' && g.topic.length > 0));
  check('S1 clean', 'no gap unit runs', noGapUnit(o)); }

// S2-S4: a stop from each named source. Recorded, never verified, its scope never run as a gap.
for (const source of ['safety-classifier', 'reviewer', 'policy-hook']) {
  const o = await run({ units: { 'CL-B': `stop:${source}` } });
  const s = `stop ${source}`;
  check(s, 'recorded as stopped', o.result?.stopped?.includes('CL-B'));
  check(s, 'no verifier for the stopped unit', !o.calls.includes('verify CL-B#1'));
  check(s, 'the stopped unit ran once', o.calls.filter((c) => c === 'CL-B').length === 1);
  check(s, 'no gap unit runs, though the critic proposes the stopped scope', noGapUnit(o) && (o.result?.gaps_for_owner ?? []).some((g) => g.title.startsWith('CL-B')));
  check(s, 'the completeness critic is told the stopped id is held', /HELD[^\n]*\n[^\n]*CL-B/.test(o.prompts['completeness R1'] ?? ''));
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
  check('S7 no result', 'no gap unit runs', noGapUnit(o)); }

// S8: an input spec of a kind the skeleton does not accept (raw, lead prose) is refused before any agent.
{ const o = await run({ specs: [...SPECS, { kind: 'raw', id: 'RAW-1', question: 'lead prose' }] });
  check('S8 raw input spec', 'refused before any agent', o.thrown !== null && o.calls.length === 0); }

// S9: a held id is never launched, is returned, and reaches the critic even when it is not in this run's specs.
{ const o = await run({ extraArgs: { held: ['CL-B', 'CL-Z'] } });
  check('S9 held id', 'never launched', o.result && !o.calls.includes('CL-B'));
  check('S9 held id', 'returned as held, including an id outside this run', ['CL-B', 'CL-Z'].every((id) => o.result?.held?.includes(id)));
  check('S9 held id', 'the critic is told an id outside this run', /HELD[^\n]*\n[^\n]*CL-Z/.test(o.prompts['completeness R1'] ?? ''));
  check('S9 held id', 'no gap unit runs over held scope', noGapUnit(o)); }

// S10: a verifier with no result is recorded, not counted.
{ const o = await run({ verifiers: { 'verify CL-B#1': 'null' } });
  check('S10 verifier no result', 'recorded in verifier_no_result', o.result?.verifier_no_result?.includes('CL-B#1'));
  check('S10 verifier no result', 'no verdict counted for it', (o.result?.units?.find((u) => u.unit === 'CL-B')?.verdicts ?? [1]).length === 0);
  check('S10 verifier no result', 'no gap unit runs', noGapUnit(o)); }

// S11: a verifier that reports a stop is recorded, and its verdict is not counted.
{ const o = await run({ verifiers: { 'verify CL-B#1': 'stop:reviewer' } });
  check('S11 verifier stop', 'recorded in verifier_stopped', o.result?.verifier_stopped?.includes('CL-B#1'));
  check('S11 verifier stop', 'its verdict is not counted', (o.result?.units?.find((u) => u.unit === 'CL-B')?.verdicts ?? [1]).length === 0); }

// S12: a cl spec without args.source is refused.
{ const o = await run({ extraArgs: { source: undefined } });
  check('S12 cl without source', 'refused before any agent', o.thrown !== null && o.calls.length === 0); }

// S13: an owner-authorised re-scope runs as an owner spec, its scope the owner's words verbatim.
{ const owner = { kind: 'owner', id: 'OW-1', unit: 'CL-B', scope: 'only line 6 of /m/changelog.md, read-only', answer: 'OWNER-QUESTIONS.md B1' };
  const o = await run({ specs: [...SPECS, owner] });
  const prompt = o.prompts['OW-1'] ?? '';
  check('S13 owner spec', 'the owner scope is in the prompt verbatim', prompt.includes(owner.scope));
  check('S13 owner spec', 'the prompt names the unit and points at the answer', prompt.includes('re-scope of CL-B') && prompt.includes(owner.answer));
  const bad = await run({ specs: [...SPECS, { kind: 'owner', id: 'OW-2', scope: 'x', answer: 'B1' }] });
  check('S13 owner spec', 'an owner spec without its unit is refused before any agent', bad.thrown !== null && bad.calls.length === 0); }

// S14: a critic with no result, and a critic that reports a stop, are recorded; the stopped critic's gaps are not used.
// CL-B is stopped so that the completeness critic has a gap to propose (S2 shows it does when not stopped).
{ const o = await run({ units: { 'CL-B': 'stop:reviewer' }, critics: { 'critic R1-1': 'null', 'completeness R1': 'stop:safety-classifier' } });
  check('S14 critic no result', 'recorded in critic_no_result', o.result?.critic_no_result?.includes('critic R1-1'));
  check('S14 critic stop', 'recorded in critic_stopped', o.result?.critic_stopped?.includes('completeness R1'));
  check('S14 critic stop', 'its gaps are not used', !(o.result?.gaps_for_owner ?? []).some((g) => g.title.endsWith('uncovered'))); }

console.log(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAIL`}`);
process.exit(failures === 0 ? 0 : 1);
