// harness.mjs: run the Workflow skeleton in skills/decompose-into-pointer-units/references/EXAMPLES.md
// against mocked agent / pipeline / parallel / phase / log, one scenario per stop-handling path.
// Usage (from the repository root): node tests/results/2026-10-27-decompose-into-pointer-units-harness/harness.mjs <EXAMPLES.md>
// Prints one line per assertion (PASS / FAIL) and exits 1 if any assertion fails.
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
// negated-clean or null. `gapUnits` does the same for gap units (G-*).
async function run({ units = {}, gapUnits = {}, specs = SPECS, extraArgs = {} }) {
  const calls = [], logs = [], prompts = {};
  const unitResult = (id, behaviour) => {
    if (behaviour === 'null') return null;
    const base = { unit: id, report_path: `/r/${id}.txt`, items: 1, non_benign: [`${id}-1 | claim | class | high | ptr`] };
    if (behaviour?.startsWith('stop:')) {
      const source = behaviour.slice(5);
      // The unit follows the brief: a STOPPED: line, the brief's older literal, and the stop field.
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
    if (label.startsWith('verify ')) return { unit: 'x', item: 'claim', verdict: 'CONFIRMED', reasoning: 'r', report_path: '/r/V.txt' };
    if (label.startsWith('critic ')) return { report_path: `/r/${label}.txt`, corrections: [], gaps: [{ title: 'Generic gap', question: 'a question about the brief', priority: 2 }] };
    if (label.startsWith('completeness ')) {
      // A literal critic: every spec id with no digest entry is a gap, unless the prompt says it is held.
      const held = (prompt.match(/HELD[^\n]*\n([^\n]*)/) || [])[1] || '';
      const missing = specs.filter((s) => !prompt.includes(`## ${s.id} `) && !held.includes(s.id));
      return { report_path: `/r/${label}.txt`, corrections: [], gaps: missing.map((s) => ({ title: `${s.id} uncovered`, question: `cover ${s.id}'s pointers`, priority: 1 })) };
    }
    if (label.startsWith('G-')) return unitResult(label, gapUnits[label] ?? 'clean');
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
  return { result, thrown, calls, logs, prompts };
}

let failures = 0;
const check = (scenario, name, ok) => { if (!ok) failures += 1; console.log(`${ok ? 'PASS' : 'FAIL'}  ${scenario}: ${name}`); };
const noResultOf = (r) => r?.no_result ?? r?.died ?? [];
const gapUnitsRan = (calls) => calls.filter((c) => c.startsWith('G-'));

// S1 control: every unit clean. Gap round runs; nothing stopped or missing.
{ const o = await run({});
  check('S1 clean', 'no stop, no missing result', o.result && o.result.stopped.length === 0 && noResultOf(o.result).length === 0);
  check('S1 clean', 'a verifier per unit', o.calls.filter((c) => c.startsWith('verify CL-')).length === 3);
  check('S1 clean', 'the gap round runs', gapUnitsRan(o.calls).length > 0); }

// S2-S4: a stop from each named source. Recorded, never verified, gap round held.
for (const source of ['safety-classifier', 'reviewer', 'policy-hook']) {
  const o = await run({ units: { 'CL-B': `stop:${source}` } });
  const s = `stop ${source}`;
  check(s, 'recorded as stopped', o.result?.stopped?.includes('CL-B'));
  check(s, 'no verifier for the stopped unit', !o.calls.includes('verify CL-B#1'));
  check(s, 'the stopped unit ran once', o.calls.filter((c) => c === 'CL-B').length === 1);
  check(s, 'no gap unit runs while a unit is stopped', gapUnitsRan(o.calls).length === 0);
  check(s, 'the completeness critic is told the stopped id is held', /HELD[^\n]*\n[^\n]*CL-B/.test(o.prompts['completeness R1'] ?? ''));
}

// S5: a unit that omits the stop field is treated as stopped (fail safe).
{ const o = await run({ units: { 'CL-B': 'missing-stop' } });
  check('S5 missing stop field', 'treated as stopped', o.result?.stopped?.includes('CL-B')); }

// S6: a clean unit whose text says "never stopped" is not a stop.
{ const o = await run({ units: { 'CL-B': 'negated-clean' } });
  check('S6 negated clean line', 'not recorded as stopped', o.result && !o.result.stopped.includes('CL-B')); }

// S7: a unit with no result. Cause undetermined: not "re-run as-is", gap round held.
{ const o = await run({ units: { 'CL-B': 'null' } });
  check('S7 no result', 'listed under no_result', noResultOf(o.result).includes('CL-B'));
  check('S7 no result', 'the log does not say to re-run as-is', !o.logs.some((l) => /re-run as-is/i.test(l)));
  check('S7 no result', 'the log says the cause is undetermined', o.logs.some((l) => /cause undetermined/i.test(l)));
  check('S7 no result', 'no gap unit runs', gapUnitsRan(o.calls).length === 0); }

// S8: an input spec of kind raw is lead prose and is refused before any agent starts.
{ const o = await run({ specs: [...SPECS, { kind: 'raw', id: 'RAW-1', question: 'lead prose' }] });
  check('S8 raw input spec', 'refused before any agent', o.thrown !== null && o.calls.length === 0); }

// S9: a held id is never launched.
{ const o = await run({ extraArgs: { held: ['CL-B'] } });
  check('S9 held id', 'never launched', o.result && !o.calls.includes('CL-B'));
  check('S9 held id', 'returned as held', o.result?.held?.includes('CL-B')); }

// S10: with no stops, a gap unit that returns nothing is reported, not dropped.
{ const o = await run({ gapUnits: { 'G-R1-1': 'null' } });
  check('S10 gap unit no result', 'reported in gap_no_result', o.result?.gap_no_result?.includes('G-R1-1'));
  check('S10 gap unit no result', 'gap specs are returned', Array.isArray(o.result?.gap_specs) && o.result.gap_specs.length > 0); }

// S11: a cl spec without args.source is refused.
{ const o = await run({ extraArgs: { source: undefined } });
  check('S11 cl without source', 'refused before any agent', o.thrown !== null && o.calls.length === 0); }

// S12: an owner-authorised re-scope runs as an owner spec, its scope the owner's words verbatim.
{ const owner = { kind: 'owner', id: 'OW-1', scope: 'only lines 8 and 9, read-only, no decoding', answer: 'OWNER-QUESTIONS.md B1' };
  const o = await run({ specs: [...SPECS, owner] });
  const prompt = o.prompts['OW-1'] ?? '';
  check('S12 owner spec', 'the owner scope is in the prompt verbatim', prompt.includes(owner.scope));
  check('S12 owner spec', 'the prompt points at the owner answer', prompt.includes(`authorised by the owner in ${owner.answer}`)); }

console.log(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAIL`}`);
process.exit(failures === 0 ? 0 : 1);
