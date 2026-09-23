/**
 * import-side-effects.mjs — what `import('../../../scripts/generate-readmes.js')` actually does.
 *
 *   node tests/results/2026-09-22-generate-readmes-importable/import-side-effects.mjs
 *   node …/import-side-effects.mjs --verify        # the reach claim, as arms
 *   node …/import-side-effects.mjs --shape <name>  # one arm, for debugging; leaves its SHAPE-DIR
 *
 * `security-surface.test.js` proves the import prints nothing and exits 0. That is the property
 * the main-module guard is for, and it is blind to a quieter one: a module can read — or write —
 * the whole repository in silence. The head of `generate-readmes.js` claims it does not, so the
 * claim is measured here rather than believed.
 *
 * ## Corrections, every one of them from a measurement
 *
 * No version of this file has yet been right on its first run, and the failures are worth
 * keeping because each is a way a probe silently stops working:
 *
 *   1. "reads no file" — the import opens 28 modules, as every import does. The claim worth
 *      making is about repository CONTENT: a registry, a `SKILL.md`, a `git` spawn.
 *   2. The classifier read `readSync`'s first argument as a path. It is a file DESCRIPTOR.
 *   3. **The patch never reached the subject.** Assigning over `fs.readFileSync` does not reach
 *      `import { readFileSync } from 'fs'`: an ESM named binding to a builtin is resolved at
 *      link time and follows a property assignment only after `module.syncBuiltinESMExports()`.
 *      Both controls used the DEFAULT export and fired happily. (#888 round 1)
 *   4. **No WRITE name was patched at all**, and the negative test behind the verdict used
 *      `existsSync` — the shape the instrument was best at. A planted `writeFileSync` was graded
 *      clean. (#888 round 2)
 *   5. **The verdict was a Node-25 artefact, and the name list kept leaking.** The ESM loader
 *      reads modules through different functions per version — `fs.promises.readFile` on 22,
 *      `readFileSync` with `file://` URLs on 24, `openSync` + `readSync` on 25 — so a classifier
 *      keyed on `openSync`-plus-extension graded the loader's own reads as CONTENT on 22 and 24,
 *      refused the unmodified generator, and printed a false accusation on CI's own Node.
 *      Separately, a hand-written list of names left callback `symlink`, `promises.mkdtemp` and
 *      others able to change the tree with the probe saying OK. (#888 round 3)
 *   6. **The verdict was a snapshot.** It was taken the moment `await import()` resolved, so
 *      anything the import SCHEDULED — a `setTimeout` write, a `setImmediate` write, a stream
 *      whose `open` is lazy — reached the tree after `OK` was printed. Three planted writes did
 *      exactly that under a green verdict. The drain after the import is the fix, and the
 *      knockout is the proof: remove that one line and `deferred-write` and `write-stream-ctor`
 *      both flip to `blind`. (#888 round 4)
 *   7. **The drain's completeness was asserted from a knockout that could not show it.** A write
 *      from the subject's `exit` handler, a timer armed from its `beforeExit`, and
 *      `process.exit(0)` during import — no output at all, exit 0 — all landed past the verdict.
 *      Guard 1 and guard 2 below are the fix. (#888 round 5) Guard 2 then had the same gap one
 *      level down: an `exit` handler itself, it ran only while the subject's own returned, so one
 *      that wrote and then exited or threw graded `blind` with the file on disk. It now reports
 *      its count whenever it runs to its end, and a count that never arrives is a verdict of its
 *      own. (#894)
 *
 * This list and `RESULT.md` §4 are one list, and §4 is the long form. Only §4 states how many:
 * a count kept in two places is how this heading said "six" while §4 said "seven" (#893).
 * Corrections 3 onward were all found by someone running something. None came from re-reading.
 *
 * ## What this version does differently, and why
 *
 * **Patching is by ENUMERATION, not by a list.** Every own function-valued, non-constructor
 * export of `node:fs`, `node:fs/promises` and `node:child_process` is wrapped. A list is a
 * denylist wearing another hat, and this one leaked four times.
 *
 * **Classification is by CALLER FRAME and extension together.** A call is loader activity when
 * its nearest caller frame is inside `node:internal/modules/` *and* its argument names a
 * `.js`/`.mjs`/`.cjs` (path or `file://`). Frame alone is not enough: a `with { type: 'json' }`
 * import of the registry has a loader frame and IS a content read — the #888 round-3 reviewer
 * measured a pure-frame rule going blind to exactly that, which is this PR's own defect class one
 * level down, in the remedy. Extension alone is not enough either: that was correction 5.
 *
 * **Four controls, because "zero content" has four ways of being a lie**: the patch fires at
 * all; it reaches a NAMED binding (correction 3); the classifier can still say *content*; and no
 * loader descriptor outlives the import, since a recycled one would excuse whatever content call
 * next drew that number. They are necessary and they have never been sufficient — control 2
 * passed through every correction from 4 on. The arms below are what is sufficient.
 *
 * ## The reach claim is a RUN, not a paragraph
 *
 * `--verify` plants one shape per arm into a throwaway module, imports THAT instead of the
 * generator, and asserts the verdict each shape is declared to produce. Arms declared `blind` are
 * as load-bearing as the `seen` ones: `empty` — a module that does nothing — is the control that
 * catches a probe refusing before the planted line matters, which is how eleven `ok seen` rows
 * passed for the wrong reason on Node 22 and 24 in the previous version. Two rows after the arms
 * check the instrument rather than a shape: `main-report-to-file` runs main mode with stdout a
 * regular file and checks that its four counts add up and that the late count and the `OK` line
 * are both present, and `leak-count` counts what the children left (#894).
 *
 * Still unmeasured beyond the declared-blind arms: a module loaded before this file, and any
 * side effect reaching the filesystem through none of the wrapped entry points.
 */
import fs, { readFileSync as namedReadFileSync } from 'node:fs';
import fsPromises from 'node:fs/promises';
import childProcess from 'node:child_process';
import workerThreads from 'node:worker_threads';
import { syncBuiltinESMExports } from 'node:module';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const SELF = fileURLToPath(import.meta.url);
const SELF_NAME = basename(SELF);
const HERE = dirname(SELF);
const ROOT = resolve(HERE, '..', '..', '..');
const GENERATOR = resolve(ROOT, 'scripts', 'generate-readmes.js');

const ARGS = process.argv.slice(2);
const VERIFY = ARGS.includes('--verify');
const SHAPE = ARGS.includes('--shape') ? ARGS[ARGS.indexOf('--shape') + 1] : null;

/** The line a `--shape` child prints so the parent grades a VERDICT, never a bare exit code. */
const VERDICT_MARKER = 'SHAPE-VERDICT:';
/** Guard 2's count in shape mode, printed whenever guard 2 runs to its end — zero included — so its absence means something. */
const LATE_MARKER = 'SHAPE-LATE:';
/** The shape directory, announced before the import so the `--verify` parent can remove it. */
const SHAPE_DIR_MARKER = 'SHAPE-DIR:';
/**
 * Guard 2's count in MAIN mode. Guard 2 prints the `OK:` line too, straight after it, so a report
 * whose exit phase was cut short ends with neither, where it used to end with `OK` (#894 design
 * critique, point 1).
 */
const MAIN_LATE_LABEL = 'after the verdict (exit handlers):';
/** Every RegExp metacharacter escaped, backslash included — escaping only `(` and `)` was CodeQL's
 * js/incomplete-sanitization on #904 (alerts #19, #20). */
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * One planted import-time side effect per arm, and the verdict it must produce.
 *
 * `seen` — the probe must report content. `blind` — it must not, and that is declared rather
 * than discovered. Both directions are load-bearing.
 */
const SHAPES = {
  // A module that does NOTHING. The control the previous version lacked: under a classifier that
  // mis-grades the loader's own reads, this arm reads `seen`, which is how every other arm passed
  // for the wrong reason on Node 22 and 24.
  empty: { expect: 'blind', code: 'export const nothing = true;' },
  'sync-read':        { expect: 'seen',  code: "import { existsSync } from 'node:fs'; existsSync(R('skills/_registry.yml'));" },
  'sync-write':       { expect: 'seen',  code: "import { writeFileSync } from 'node:fs'; writeFileSync(T('planted.txt'), 'x');" },
  'sync-mkdir':       { expect: 'seen',  code: "import { mkdirSync } from 'node:fs'; mkdirSync(T('planted-dir'), { recursive: true });" },
  access:             { expect: 'seen',  code: "import { accessSync } from 'node:fs'; accessSync(R('package.json'));" },
  'callback-read':    { expect: 'seen',  code: "import { readFile } from 'node:fs'; readFile(R('package.json'), () => {});" },
  'callback-symlink': { expect: 'seen',  code: "import { symlink } from 'node:fs'; symlink(R('package.json'), T('linked'), () => {});" },
  'promises-read':    { expect: 'seen',  code: "import { readFile } from 'node:fs/promises'; await readFile(R('package.json'), 'utf8');" },
  'promises-readdir': { expect: 'seen',  code: "import { readdir } from 'node:fs/promises'; await readdir(R('scripts'));" },
  'promises-mkdtemp': { expect: 'seen',  code: "import { mkdtemp } from 'node:fs/promises'; await mkdtemp(T('tmp-'));" },
  glob:               { expect: 'seen',  code: "import { globSync } from 'node:fs'; globSync('*.js', { cwd: R('scripts') });" },
  'write-stream':     { expect: 'seen',  code: "import { createWriteStream } from 'node:fs'; createWriteStream(T('streamed.txt')).end('x');" },
  'cp-sync':          { expect: 'seen',  code: "import { cpSync } from 'node:fs'; cpSync(R('package.json'), T('copied.json'));" },
  'spawn-sync':       { expect: 'seen',  code: "import { execFileSync } from 'node:child_process'; execFileSync('git', ['--version']);" },
  'spawn-async':      { expect: 'seen',  code: "import { spawn } from 'node:child_process'; spawn('git', ['--version']);" },
  'create-require':   { expect: 'seen',  code: "import { createRequire } from 'node:module'; createRequire(import.meta.url)('node:fs').readFileSync(R('package.json'), 'utf8');" },
  // A JSON import has a LOADER frame and IS a content read. It is the shape that rejects a
  // classifier keyed on the frame alone (#888 round 3), so it is an arm rather than a sentence.
  'json-import':      { expect: 'seen',  code: "const mod = await import(new URL('file://' + R('package.json')).href, { with: { type: 'json' } }); if (!mod.default) throw new Error('unreachable');" },
  // A content `.js` opened as DATA — `openSync` on a `.js` from a NON-loader frame. The previous
  // classifier could not tell it from the loader and it was declared blind on that ground; the
  // combined rule separates them, so it is declared `seen` and the ground is gone.
  'open-js-as-data':  { expect: 'seen',  code: "import { openSync, closeSync } from 'node:fs'; closeSync(openSync(R('cli/index.js'), 'r'));" },
  // DEFERRED past the import's resolution. Both were invisible until the drain below: the verdict
  // used to be a snapshot taken when `await import()` resolved, so anything scheduled reached the
  // tree after the OK was printed (#888 round 4).
  'deferred-write':   { expect: 'seen',  code: "import { writeFileSync } from 'node:fs'; setTimeout(() => writeFileSync(T('deferred.txt'), 'x'), 0);" },
  // The same class through a CONSTRUCTOR, which the enumeration skips by the capitalised-name
  // rule, and whose `open` is lazy. The sharp one: two independent reasons to be missed.
  'write-stream-ctor':{ expect: 'seen',  code: "import { WriteStream } from 'node:fs'; new WriteStream(T('ctor.txt')).end('x');" },
  // Wrapped since round 4, so no longer blind: a worker has its own module registry and its own
  // `fs`, and nothing patched inside this process reaches it — but the Worker CONSTRUCTOR is in
  // this process, and that is the thing worth seeing.
  'worker-write':     { expect: 'seen',  code: "import { Worker } from 'node:worker_threads'; const w = new Worker(\"import('node:fs').then((m) => m.writeFileSync(process.env.SHAPE_TMP + '/from-worker.txt', 'x'));\", { eval: true }); await new Promise((r) => w.on('exit', r));" },
  // Wrapped too. `process.binding` reaches the internal binding below every public name; the
  // escape hatch itself is patchable even though what it returns is not.
  'process-binding':  { expect: 'seen',  code: "try { process.binding('fs'); } catch { /* removed in a future node */ }" },
  // DECLARED BLIND, and the reason is structural rather than a gap in a list: this classifier's
  // "loader" is whatever the loader loads, so executing an arbitrary repository `.js` at import
  // is indistinguishable from loading a module of the graph. Closing it needs the static import
  // graph to compare against — `importGraph()` in `scripts/check-workflow-generator-inputs.js`,
  // module-private today. Filed as a follow-up; an arm until then (#888 round 4, F2).
  'dynamic-import-repo-js': { expect: 'blind', code: "await import(new URL('file://' + R('scripts/lib/parse-args.js')).href);" },
  // CONTROL, declared blind: a LOAD of a file under `node_modules`, which `empty` does not
  // exercise. It was described as exercising bare-specifier RESOLUTION and does not — it imports
  // an absolute `file://` URL, so nothing is resolved (#888 round 5, F2). The arm below is the
  // one that resolves, and both are blind on 22, 24 and 25, so ordinary resolution is not a
  // false-positive source either way.
  'dep-import':       { expect: 'blind', code: "await import(new URL('file://' + R('node_modules/js-yaml/dist/js-yaml.mjs')).href);" },
  'bare-resolve-import': { expect: 'blind', code: "import { createRequire } from 'node:module'; const req = createRequire(R('package.json')); await import(new URL('file://' + req.resolve('js-yaml')).href);" },
  // THE VERDICT IS TAKEN AT A MOMENT, and these three land after it. `exits-during-import` is the
  // sharp one: without the guard the probe prints nothing at all and exits 0 — a silent pass,
  // which is worse than the hang the drain's comment called "the right failure" (#888 round 5).
  // The clean-exit form is the escape: exit 0 with no verdict is the silent pass. `exit(3)` pins
  // that the code passes through rather than being folded to 0 or 1 — with only 0 and 1 planted,
  // `code ? 1 : 0` survived every arm (#893 round 1, N2). `exit(1)` and a bare `throw` grade
  // identically because the exit code is all guard 1 can see; only the throw is a crash, and the
  // pair is declared so the collision is a stated limit rather than a surprise (#893).
  'exits-during-import':  { expect: 'no-verdict(exit 0)', code: "process.exit(0);" },
  // The bare spelling most code uses for a clean exit. At guard-1 time its handler argument is 0
  // and `process.exitCode` is `undefined`, where `exit(0)` makes both 0 — so this is the arm
  // that pins "the ARGUMENT, not `exitCode`". Without it, a guard reading `process.exitCode ?? 1`
  // survived every other arm and graded this clean exit as a crash (#893 round 2).
  'bare-exit-during-import': { expect: 'no-verdict(exit 0)', code: "process.exit();" },
  'exit-nonzero-during-import': { expect: 'no-verdict(exit 3)', code: "process.exit(3);" },
  'exit-1-during-import': { expect: 'no-verdict(exit 1)', code: "process.exit(1);" },
  'throws-during-import': { expect: 'no-verdict(exit 1)', code: "throw new Error('planted');" },
  // Content both in time AND late. The in-time half alone already refuses, so this is `seen+late`
  // rather than `seen-late`: the late half is additional, not the only finding (#893).
  'sync-write-and-exit-handler': { expect: 'seen+late', code: "import { writeFileSync } from 'node:fs'; writeFileSync(T('planted.txt'), 'x'); process.on('exit', () => writeFileSync(T('from-exit.txt'), 'x'));" },
  'exit-handler-write':   { expect: 'seen-late', code: "import { writeFileSync } from 'node:fs'; process.on('exit', () => writeFileSync(T('from-exit.txt'), 'x'));" },
  'beforeexit-reschedule':{ expect: 'seen-late', code: "import { writeFileSync } from 'node:fs'; process.once('beforeExit', () => setTimeout(() => writeFileSync(T('rescheduled.txt'), 'x'), 0));" },
  // GUARD 2 IS AN `exit` HANDLER TOO, so it runs only while the subject's own return. One that
  // writes and then calls `process.exit()` or throws ends the exit phase first: both graded `blind`
  // with the file on disk, the throw form at exit 0, and both leaked the shape directory (#893
  // round 1, S1). Guard 2 now prints its count whenever it runs to its end, so one that never arrives is
  // `unreported-exit`, graded by the parent, the one reader that outlives the child (#894).
  // `plants` is the PARENT's count of files in the shape directory. Guard 2 never runs in these
  // arms, so the grade cannot depend on the write; without `plants` an arm whose write was deleted
  // would grade the same and pass for the wrong reason. On `late-registered-exit-handler` it is
  // also the only thing that tells a WITHHELD count from guard 2 crashing: a throw inside guard 2
  // ends the exit phase before the late write runs, so the verdict is the same and only `plants`
  // (0, not 1) differs (#894 design critique, point 4).
  'exit-handler-write-then-exit':  { expect: 'unreported-exit(exit 5)', plants: 1, code: "import { writeFileSync } from 'node:fs'; process.on('exit', () => { writeFileSync(T('from-exit.txt'), 'x'); process.exit(5); });" },
  'exit-handler-write-then-throw': { expect: 'unreported-exit(exit 0)', plants: 1, code: "import { writeFileSync } from 'node:fs'; process.on('exit', () => { writeFileSync(T('from-exit.txt'), 'x'); throw new Error('planted'); });" },
  // In time AND cut short: the in-time `seen` must survive the missing report, as it does in
  // `seen+late` — the asymmetry #893 fixed, which a new verdict could reintroduce.
  'sync-write-and-exit-handler-exit': { expect: 'seen+unreported-exit(exit 5)', plants: 2, code: "import { writeFileSync } from 'node:fs'; writeFileSync(T('planted.txt'), 'x'); process.on('exit', () => { writeFileSync(T('from-exit.txt'), 'x'); process.exit(5); });" },
  // The fix above, one level down: a handler registered AFTER guard 2 — from a timer the subject
  // arms in its own `beforeExit` — runs after guard 2 has printed its count. Guard 2 refuses to
  // report an exit phase it is not the last listener of (#894).
  'late-registered-exit-handler': { expect: 'unreported-exit(exit 1)', plants: 1, code: "import { writeFileSync } from 'node:fs'; process.once('beforeExit', () => setTimeout(() => process.on('exit', () => writeFileSync(T('late-registered.txt'), 'x')), 0));" },
  // Guard 1's side of the asymmetry: content recorded in time, then a clean exit. The refusal was
  // right and the finding was dropped (#893 round 1, N1).
  'write-then-exit-during-import': { expect: 'no-verdict(exit 0)+seen', code: "import { writeFileSync } from 'node:fs'; writeFileSync(T('planted.txt'), 'x'); process.exit(0);" },
};

// The shape module is written BEFORE the patch loops, so writing it is not itself recorded.
let TARGET = GENERATOR;
if (SHAPE) {
  // Own keys only: `SHAPES['__proto__']`, `['constructor']` and the like are inherited, so a bare
  // lookup let those names past the refusal below and grade an empty module `blind` at exit 0
  // (#904 round 1, N4). `--verify` iterates own keys and was never affected.
  const shape = Object.hasOwn(SHAPES, SHAPE) ? SHAPES[SHAPE] : null;
  if (!shape) {
    console.error(`REFUSED: unknown shape \`${SHAPE}\`. Known: ${Object.keys(SHAPES).join(', ')}`);
    process.exit(2);
  }
  const shapeDir = fs.mkdtempSync(resolve(tmpdir(), 'import-shape-'));
  // Announced before anything the subject controls, and REMOVED BY THE PARENT, never by this
  // process. Every in-process cleanup was an `exit` handler, and each placement leaked on some
  // exit path: registered early it deleted the directory under the subject's own exit-handler
  // write; registered at the foot it never ran after `process.exit()` during import (#888 round
  // 6), nor after a subject `exit` handler that exits or throws (#893 round 1, S1). Only a reader
  // that outlives this process runs after all of them, so `--verify` removes what this line
  // names and a standalone `--shape` leaves it for inspection (#894).
  console.log(`${SHAPE_DIR_MARKER} ${shapeDir}`);
  process.env.SHAPE_TMP = shapeDir;
  process.env.SHAPE_ROOT = ROOT;
  TARGET = resolve(shapeDir, 'shape.mjs');
  fs.writeFileSync(TARGET, [
    "import { resolve } from 'node:path';",
    // The two paths come from the environment, not from source text built around them: a path
    // interpolated into generated code is what CodeQL's js/bad-code-sanitization flagged on these
    // two lines (alerts #16 and #18 on main, #21 on #904). Nothing is interpolated now. Both
    // variables ride the child environment into anything a shape spawns, which no arm relies on,
    // and R and T now resolve at call time: a shape that rewrote them before writing would redirect
    // its own write. No arm does, and `plants` counts the real directory regardless.
    'const R = (p) => resolve(process.env.SHAPE_ROOT, p);',
    'const T = (p) => resolve(process.env.SHAPE_TMP, p);',
    shape.code,
    '',
  ].join('\n'), 'utf8');
}

// ── the instrument ──────────────────────────────────────────────────────────

const calls = [];
const loaderDescriptors = new Set();

/**
 * The nearest stack frame that is neither this file's wrapper nor the filesystem layer itself.
 *
 * Skipping `node:fs` is what makes the rule work rather than merely sound plausible. On Node 24
 * and 25 the loader calls `fs.readFileSync(url)`, and `readFileSync` calls the PUBLIC
 * `fs.openSync` — so the nearest frame for that `openSync` is `at readFileSync (node:fs:440:35)`
 * and a rule looking for `node:internal/modules/` there finds nothing. Measured: the first
 * version of this classifier passed on Node 22 and refused the unmodified generator on 24 and 25,
 * having replaced one version-dependent rule with another.
 */
const FS_INTERNAL_FRAME = /\(node:fs[:/]|node:internal\/fs\//;
function nearestCallerFrame() {
  const stack = new Error().stack;
  if (!stack) return '';
  for (const line of stack.split('\n').slice(1)) {
    if (line.includes(SELF_NAME)) continue;
    if (FS_INTERNAL_FRAME.test(line)) continue;
    return line.trim();
  }
  return '';
}

const LOADER_FRAME = /node:internal\/modules\//;
const MODULE_ARG = /\.(mjs|cjs|js)(\?|#|$)/;

/**
 * Wrap every own function-valued, non-constructor export of `target`.
 *
 * By enumeration rather than by a list, because the list leaked four times. Constructors are
 * skipped by the capitalised-name convention node uses (`Stats`, `Dirent`, `ReadStream`), and own
 * properties — string and symbol — are copied onto the wrapper, so `realpathSync.native` and the
 * `util.promisify.custom` hooks survive the replacement.
 */
function patchModule(target, label) {
  let count = 0;
  for (const name of Object.getOwnPropertyNames(target)) {
    const descriptor = Object.getOwnPropertyDescriptor(target, name);
    if (!descriptor || !descriptor.writable || descriptor.get) continue;
    const original = target[name];
    if (typeof original !== 'function') continue;
    if (/^[A-Z]/.test(name)) continue;
    const wrapped = function patched(...args) {
      if (typeof args[0] === 'number' && loaderDescriptors.has(args[0])) {
        calls.push({ name: `${label}.${name}`, arg: `fd:${args[0]} (loader)`, kind: 'loader' });
        if (name === 'closeSync' || name === 'close') loaderDescriptors.delete(args[0]);
        return original.apply(this, args);
      }
      const frame = nearestCallerFrame();
      const arg = String(args[0]);
      const loader = LOADER_FRAME.test(frame) && MODULE_ARG.test(arg);
      calls.push({ name: `${label}.${name}`, arg, kind: loader ? 'loader' : 'other', frame });
      const result = original.apply(this, args);
      if (loader && typeof result === 'number') loaderDescriptors.add(result);
      return result;
    };
    for (const key of Reflect.ownKeys(original)) {
      if (key === 'length' || key === 'name' || key === 'prototype') continue;
      try { wrapped[key] = original[key]; } catch { /* non-writable, not ours to force */ }
    }
    target[name] = wrapped;
    count++;
  }
  return count;
}

const patchedCounts = {
  fs: patchModule(fs, 'fs'),
  promises: patchModule(fsPromises, 'promises'),
  child_process: patchModule(childProcess, 'cp'),
};
// The two escape hatches out of everything above. Neither is reachable by enumerating the three
// modules: a worker gets its own module registry and its own `fs`, and `process.binding` returns
// an internal binding below every public name. What IS in this process, and patchable, is the
// way in — the constructor and the function — so both were blind arms until round 4 and are
// coverage now. Assigned on the CJS module objects: an `import *` namespace is immutable and the
// assignment throws.
const WorkerOriginal = workerThreads.Worker;
workerThreads.Worker = class PatchedWorker extends WorkerOriginal {
  constructor(...args) {
    calls.push({ name: 'worker.Worker', arg: '(a worker thread, whose own fs this process cannot see)', kind: 'other' });
    super(...args);
  }
};
const bindingOriginal = process.binding;
if (typeof bindingOriginal === 'function') {
  process.binding = function patchedBinding(...args) {
    calls.push({ name: 'process.binding', arg: String(args[0]), kind: 'other' });
    return bindingOriginal.apply(this, args);
  };
}

// THE line the first two versions were missing. Without it every `import { … } from 'fs'` in the
// subject keeps the ORIGINAL function and this whole file measures nothing.
syncBuiltinESMExports();

const refuse = (message, detail) => {
  console.error(`REFUSED: ${message}`);
  if (detail) console.error(`  ${detail}`);
  process.exit(2);
};

// ── --verify: the reach claim, as arms ──────────────────────────────────────

if (VERIFY) {
  const rows = [];
  let bad = 0;
  // Every child's `os.tmpdir()` is this directory, so what a child leaves behind — on any exit path
  // of the CHILD, including ones nobody has found yet — is here to be counted, and a concurrent run of this
  // probe in another checkout cannot move the count. Removed in the `finally` below, after the
  // count has been taken.
  const verifyRoot = fs.mkdtempSync(resolve(tmpdir(), 'import-shape-verify-'));
  const childEnv = { ...process.env, TMPDIR: verifyRoot };
  // The `finally` below covers the parent's normal exits, not its interruption. SIGINT or SIGTERM
  // to the parent ends the run at once and leaves this root under `/tmp/import-shape-verify-*`,
  // holding the in-flight child's directory when the signal lands during an arm; remove it by
  // hand (measured on v24: SIGTERM, exit 143, 1 entry; SIGINT, exit 130, 0 entries). A signal listener cannot
  // fix that here: `--verify` is one synchronous block, so the listener's callback never runs
  // before `process.exit()`, and installing one only makes the run ignore the signal. Measured in
  // #904 round 1: with a SIGTERM listener, SIGTERM to the parent 3 s in left the run completing
  // 40/40 at exit 0 (#894 design critique, point 3, left open).
  const SHAPE_DIR_NAME = /^import-shape-[A-Za-z0-9]{6}$/;
  let leftover = [];
  try {
    for (const [name, { expect, plants }] of Object.entries(SHAPES)) {
      // The timeout keeps a subject with a live handle from hanging the run; SHAPE-DIR is printed
      // before the import, so a timed-out child is still cleaned up and grades `error(no verdict, …)`.
      const run = childProcess.spawnSync(process.execPath, [SELF, '--shape', name], { encoding: 'utf8', env: childEnv, timeout: 60_000 });
      const lines = (run.stdout || '').split('\n');
      // CLEANUP FIRST, and here rather than in the child: the child's own `exit` handlers are the
      // thing under test, and every one of them can be pre-empted (#894). A path is removed only
      // if it is a direct child of the verify root with the `mkdtemp` shape — never whatever a
      // line on a child's stdout happens to say.
      const dirLine = lines.find((line) => line.startsWith(SHAPE_DIR_MARKER));
      const shapeDir = dirLine ? dirLine.slice(SHAPE_DIR_MARKER.length).trim() : null;
      const dirOk = shapeDir !== null && dirname(shapeDir) === verifyRoot && SHAPE_DIR_NAME.test(basename(shapeDir));
      let planted = null;
      if (dirOk) {
        try { planted = fs.readdirSync(shapeDir).filter((entry) => entry !== 'shape.mjs').length; } catch { /* stays null */ }
        fs.rmSync(shapeDir, { recursive: true, force: true });
      }
      // The VERDICT comes from a marker line, never from the exit code alone: node exits 1 on any
      // uncaught exception, so a shape that merely threw used to grade `seen`, and a blind shape
      // whose path did not exist used to grade `seen` too (#888 round 3).
      const marker = lines.find((line) => line.startsWith(VERDICT_MARKER));
      const verdict = marker ? marker.slice(VERDICT_MARKER.length).trim() : null;
      const lateLine = lines.find((line) => line.startsWith(LATE_MARKER));
      const lateText = lateLine === undefined ? null : lateLine.slice(LATE_MARKER.length).trim();
      // `seen-late` is its own verdict: the content was real and the probe found it AFTER printing
      // OK. Collapsing it into `seen` would hide the half of the class the drain cannot reach.
      // `seen+late` is a shape found BOTH before and after the verdict. It used to grade
      // `seen-late`, undocumented, because `late` won the ternary — which hid that the in-time
      // verdict had already refused it (#893).
      //
      // `unreported-exit(exit N)` is a child that printed an in-time verdict and then NO count from
      // guard 2: the exit phase ended before guard 2 ran, or guard 2 withheld its count because a
      // listener was registered after it. Either way nothing vouches for what the exit phase did,
      // and reading the missing line as zero is exactly how a write then `process.exit(5)` from a
      // subject's `exit` handler graded `blind` with the file on disk (#893 round 1, S1).
      // `seen+unreported-exit` keeps the in-time finding visible beside it, as `seen+late` does.
  // The verdict names that the count is missing, not why. Measured to produce it as well: SIGKILL
  // from a subject `exit` handler (exit null), `process.reallyExit(0)` or
  // `process.removeAllListeners('exit')` from a timer that fires after the verdict (exit 0). And
  // it can over-refuse: a subject `exit` handler that adds another `exit` listener DURING the exit
  // phase makes guard 2 withhold (exit 1), although Node copied the listener list before calling
  // it, so that listener never runs. That errs loud, not silent (#894 design critique, point 5).
      // `no-verdict(...)` never has a count — guard 2 is registered after the import — so it is
      // taken as printed, `+seen` included when guard 1 held content (#894).
      let got;
      if (!dirOk) got = `error(no SHAPE-DIR under the verify root, exit ${run.status})`;
      else if (verdict === null) got = `error(no verdict, exit ${run.status})`;
      else if (verdict.startsWith('no-verdict(')) got = verdict;
      else if (lateText === null) got = `${verdict === 'seen' ? 'seen+' : ''}unreported-exit(exit ${run.status})`;
      else if (!/^\d+$/.test(lateText)) got = `error(unparseable count \`${lateText}\`)`;
      else if (Number(lateText) > 0) got = verdict === 'seen' ? 'seen+late' : 'seen-late';
      else got = verdict;
      let ok = got === expect;
      if (plants !== undefined && planted !== plants) {
        ok = false;
        got += ` [planted ${planted}, declared ${plants}]`;
      }
      if (!ok) bad++;
      rows.push(`  ${ok ? 'ok  ' : 'FAIL'}  ${name.padEnd(18)} declared ${expect.padEnd(5)} observed ${got}`);
      if (!ok) {
        const why = (run.stderr || '').trim().split('\n').filter(Boolean).slice(-1)[0];
        if (why) rows.push(`        ${why}`);
      }
    }

    // THE SELF-ARM: main mode, stdout a REGULAR FILE. The loader count is taken before the first
    // `console.log` because a file stdout is a `SyncWriteStream` whose every line reaches the
    // patched `fs.writeSync` (#893 round 1, N4); no shape child exercises that, since their stdout
    // is a pipe, so a count moved back after the first line left every arm green on all three
    // Nodes (#895 round 2). Asserted as an identity rather than a figure, so it holds on every
    // Node: the four counts add up, and guard 2's count and the `OK` line are both present (the
    // regexes find a line anywhere; they do not check it is the last). Main mode run BY HAND has no
    // parent to notice a missing count: there the only sign of a cut-short exit phase is that the
    // report ends without `OK`, and the exit code is whatever the subject chose (#894).
    const reportPath = resolve(verifyRoot, 'main-report.txt');
    const reportFd = fs.openSync(reportPath, 'w');
    const mainRun = childProcess.spawnSync(process.execPath, [SELF], { stdio: ['ignore', reportFd, 'pipe'], encoding: 'utf8', env: childEnv, timeout: 60_000 });
    fs.closeSync(reportFd);
    const report = fs.readFileSync(reportPath, 'utf8');
    fs.rmSync(reportPath, { force: true });
    const figure = (pattern) => { const match = report.match(pattern); return match ? Number(match[1]) : null; };
    const total = figure(/^calls during import: (\d+)/m);
    const loader = figure(/^  module-graph reads \(loader\): +(\d+)$/m);
    const guardCount = figure(/^  main-module guard \(realpathSync\): (\d+)$/m);
    const contentCount = figure(/^  repository content or subprocess: (\d+)$/m);
    const lateCount = figure(new RegExp(`^${escapeRegExp(MAIN_LATE_LABEL)} (\\d+)$`, 'm'));
    // `OK` must come AFTER guard 2's count: that order is what makes a cut-short exit phase end the
    // report without `OK`, so an `OK` printed before the exit phase is refused here.
    const lateAt = report.search(new RegExp(`^${escapeRegExp(MAIN_LATE_LABEL)} \\d+$`, 'm'));
    const okAt = report.search(/^OK: every call during import/m);
    const okPresent = okAt >= 0 && lateAt >= 0 && okAt > lateAt;
    const parsed = [total, loader, guardCount, contentCount, lateCount].every((value) => value !== null);
    const selfOk = parsed && okPresent && total === loader + guardCount + contentCount;
    if (!selfOk) bad++;
    rows.push(`  ${selfOk ? 'ok  ' : 'FAIL'}  ${'main-report-to-file'.padEnd(18)} declared calls = loader + guard + content, OK after the late count`
      + ` observed ${total} = ${loader} + ${guardCount} + ${contentCount}, late ${lateCount}, OK ${okPresent ? 'after the count' : (okAt >= 0 ? 'BEFORE the count' : 'absent')}`);
    if (!selfOk) {
      const why = (mainRun.stderr || '').trim().split('\n').filter(Boolean).slice(-1)[0];
      if (why) rows.push(`        ${why}`);
    }

    // THE LEAK COUNT. Taken, not inferred from reading the cleanup above: #888 round 6 shipped a
    // leak the ordering comment said could not happen, and #893 round 1 found two more.
    leftover = fs.readdirSync(verifyRoot);
  } finally {
    fs.rmSync(verifyRoot, { recursive: true, force: true });
  }
  if (leftover.length > 0) bad++;
  rows.push(`  ${leftover.length === 0 ? 'ok  ' : 'FAIL'}  ${'leak-count'.padEnd(18)} declared 0 left under the verify root observed ${leftover.length}${leftover.length ? ` (${leftover.join(', ')})` : ''}`);
  console.log(`--verify: ${Object.keys(SHAPES).length} shape(s) on node ${process.version}, each planted into a throwaway module and imported`);
  console.log(`  wrapped by enumeration: ${patchedCounts.fs} fs, ${patchedCounts.promises} fs/promises, ${patchedCounts.child_process} child_process export(s)`);
  for (const row of rows) console.log(row);
  if (bad) {
    console.error(`\nREFUSED: ${bad} shape(s) did not behave as declared. The header's reach claim is wrong.`);
    process.exit(1);
  }
  console.log('\nOK: every shape behaves as the header declares, the BLIND ones included.');
  process.exit(0);
}

// ── controls ────────────────────────────────────────────────────────────────

// CONTROL 1 — the patch fires at all.
fs.readFileSync(resolve(ROOT, 'package.json'), 'utf8');
if (calls.length !== 1) {
  refuse(`the fs patch recorded ${calls.length} call(s) for one deliberate read; it is not intercepting.`);
}
calls.length = 0;

// CONTROL 2 — the patch reaches the shape the SUBJECT uses. This file's own binding was resolved
// at link time exactly as the subject's was; if the sync did not take, this is false.
if (namedReadFileSync !== fs.readFileSync) {
  refuse(
    'an ESM named import of readFileSync is NOT the patched function.',
    'syncBuiltinESMExports() did not take, so every named import in the subject is invisible here.',
  );
}
namedReadFileSync(resolve(ROOT, 'package.json'), 'utf8');
if (calls.length !== 1) {
  refuse(`a read through a NAMED binding recorded ${calls.length} call(s), expected 1.`);
}
calls.length = 0;

// Three buckets, defined ABOVE guard 1 because guard 1 reports what it holds: as `const`s after the
// import they were in their temporal dead zone during `exits-during-import`, and using one there
// threw a ReferenceError on v22, v24 and v25 (#893 round 1, N1). The guard's own `realpathSync` pair is neither loader activity nor repository
// content: it is the module doing the one thing it is supposed to do at import. Reported by name
// rather than filtered away, because a silent exemption is how a probe starts excusing the thing
// it was built to catch.
const GUARD_PATHS = new Set([TARGET, GENERATOR, resolve(process.argv[1] ?? '')]);
const isLoader = (call) => call.kind === 'loader';
const isGuard = (call) => call.name.endsWith('.realpathSync') && GUARD_PATHS.has(resolve(call.arg));
// A write to fd 0, 1 or 2 is this process talking, not repository content. It has to be said
// explicitly because `console.log` can reach stdout through `fs.writeSync`. What decides it, as
// measured in #893: when stdout is a regular file — or `/dev/null`, which libuv also treats as a
// file — it is a `SyncWriteStream` and every line goes
// through the patched `fs.writeSync`, on v22, v24 and v25 alike; a pipe does not. The round-5
// observation stands as an observation — on v22.16.0 the probe's own report once made every arm
// read `seen-late`, the instrument grading its own output (#888 round 5, found while fixing F1)
// — but its stated cause, a Node-version difference, is not what reproduces now: the probe's own
// report in a `--verify` child records no stdio call on any of the three. A SUBJECT's own write
// to fd 1 or 2 is recorded, and this filter is what drops it. Right under either mechanism.
const isStdio = (call) => /\.(writeSync|writevSync|write|writev)$/.test(call.name)
  && /^fd:[012] |^[012]$/.test(call.arg);
const isContent = (call) => !isLoader(call) && !isGuard(call) && !isStdio(call);

// GUARD 1, registered BEFORE the import so it survives a subject that ends the process. Without
// it, `process.exit(0)` during import leaves the probe with no output at all and exit 0 — a
// SILENT pass, and the drain's comment called a hang "the right failure" while this one existed
// (#888 round 5, F1). Nothing about the generator does this; the probe's claim did not say so.
let verdictReached = false;
process.on('exit', (code) => {
  if (verdictReached) return;
  // The code comes from the handler's ARGUMENT, read before the `exitCode = 1` below: formatted
  // from `process.exitCode` after that line, every arm would print `exit 1` and the clean-exit
  // escape could not be told from a crash (#893). A bare `throw` and `process.exit(1)` both
  // arrive as 1 — the code is all this handler can see, and the arms say so.
  //
  // What it holds is reported too. The refusal was always right, but a write recorded before the
  // subject exited was named nowhere: guard 1's half of the asymmetry #893 fixed for `seen+late`
  // (#893 round 1, N1). Taken before the first print: on a regular-file stdout a print is a
  // recorded `fs.writeSync`. `isStdio` drops it either way, and no arm pins the order, because
  // every `--verify` child prints to a pipe.
  const held = calls.filter(isContent);
  if (SHAPE) {
    console.log(`${VERDICT_MARKER} no-verdict(exit ${code})${held.length > 0 ? '+seen' : ''}`);
    for (const call of held) console.log(`  ${call.name} ${call.arg}`);
  }
  console.error('REFUSED: the import exited the process before any verdict was reached.');
  if (held.length > 0) {
    console.error(`  ${held.length} call(s) had already touched repository content:`);
    for (const call of held) console.error(`    ${call.name} ${call.arg}`);
  }
  process.exitCode = 1;
});

await import(pathToFileURL(TARGET).href);

// THE DRAIN. Without it the verdict is a snapshot taken the moment `await import()` resolves, and
// anything the import SCHEDULED lands afterwards — a `setTimeout` write, a `setImmediate` write,
// a stream whose `open` is lazy — with `OK` already printed. Measured in #888 round 4: three
// planted writes reached the tree under a green verdict, and the knockout for this line is that
// removing it flips `deferred-write` and `write-stream-ctor` to `blind`.
//
// WHAT THAT KNOCKOUT DOES NOT SHOW is that the drain is complete, and an earlier version of this
// comment said it waits for "exactly the work the import left behind" on exactly that evidence —
// the same shape as the mis-stated mechanism in RESULT.md §6 row 8, one round later and inside
// the remedy for it (#888 round 5). It is NOT complete: a write from the subject's own `exit`
// handler, and a timer the subject arms from its own `beforeExit`, both run after this returns.
// Guard 2 below reports those after the fact rather than pretending the drain caught them, and
// three arms pin all of it. A live handle still makes this hang, which is a loud failure; the
// silent one — a subject that ends the process during import — is Guard 1's.
await new Promise((done) => process.once('beforeExit', done));

const guard = calls.filter((call) => !isLoader(call) && isGuard(call));
const content = calls.filter(isContent);

// CONTROL 4 — no loader descriptor outlived the import.
//
// The fd branch excuses ANY patched call whose first argument is a descriptor the loader opened,
// which is right while that descriptor is the loader's and wrong the moment it is recycled. A
// descriptor is dropped from the set when it is closed through a patched name; one closed some
// other way — a `FileHandle.close()`, which is a method rather than an export — would linger and
// excuse whatever content call next drew that number. Measured empty on v22.16.0 (the set never
// fills: that loader reads through `promises.readFile`, whose first argument is a path),
// v24.20.0 and v25.9.0.
if (loaderDescriptors.size > 0) {
  refuse(
    `${loaderDescriptors.size} loader descriptor(s) outlived the import: ${[...loaderDescriptors].join(', ')}.`,
    'A recycled descriptor would be graded loader activity, which is how this instrument would start excusing content.',
  );
}

// CONTROL 3 — the classifier can still say "content". Zero content is also what a classifier that
// calls everything loader activity would report.
const before = calls.length;
namedReadFileSync(resolve(ROOT, 'skills', '_registry.yml'), 'utf8');
const check = calls.slice(before);
calls.length = before;
if (check.length !== 1 || isLoader(check[0]) || isGuard(check[0])) {
  refuse(
    'a deliberate registry read did not classify as repository content;',
    `the classifier cannot tell the two apart. Recorded: ${JSON.stringify(check)}`,
  );
}

verdictReached = true;

// GUARD 2, registered AFTER the import so it runs after the SUBJECT's own `exit` handlers. The
// drain waits for the loop to empty; it cannot wait for work the subject schedules from an
// `exit` handler, or for a timer it arms from its own `beforeExit`. Those go through the wrapped
// names and are recorded — after the verdict has been printed. Reporting them late is worth more
// than not reporting them (#888 round 5, F1).
//
// It is an `exit` handler itself, so NOTHING IN THIS PROCESS CAN VOUCH THAT IT RAN: a subject
// handler that calls `process.exit()` or throws ends the exit phase first. That used to grade
// `blind` with the file on disk (#893 round 1, S1). So it prints its count whenever it runs to
// its end, zero included, and the reader requires it: the `--verify` parent grades a missing count
// `unreported-exit`, and the self-arm holds main mode to the same line. And it vouches only for
// the listeners BEFORE it: one registered later — from a timer the subject arms in its own
// `beforeExit` — runs after this count was printed, so the count is withheld (#894).
const contentAtVerdict = calls.length;
// Set by main mode once the in-time report is clean; guard 2 prints `OK` only then, and only after
// its own count, so a cut-short exit phase leaves the report without `OK`.
let mainInTimeClean = false;
const guardTwo = () => {
  const late = calls.slice(contentAtVerdict).filter(isContent);
  const listeners = process.listeners('exit');
  const after = listeners.length - 1 - listeners.indexOf(guardTwo);
  if (after > 0) {
    console.error(`\nREFUSED: ${after} \`exit\` listener(s) registered after guard 2 run after it; what they do cannot be reported.`);
    process.exitCode = 1;
    return;
  }
  console.log(`${SHAPE ? LATE_MARKER : MAIN_LATE_LABEL} ${late.length}`);
  if (late.length === 0) {
    if (!SHAPE && mainInTimeClean) console.log('\nOK: every call during import is the loader reading the module graph, or the guard resolving its two paths.');
    return;
  }
  console.error(`\nREFUSED: ${late.length} call(s) touched repository content AFTER the verdict was taken:`);
  for (const call of late) console.error(`  ${call.name} ${call.arg}`);
  process.exitCode = 1;
};
process.on('exit', guardTwo);

if (SHAPE) {
  // One line the parent grades on, so a crash is never read as a verdict.
  console.log(`${VERDICT_MARKER} ${content.length > 0 ? 'seen' : 'blind'}`);
  for (const call of content) console.log(`  ${call.name} ${call.arg}`);
  // NOT `process.exit()`: that would skip the exit handlers, including the late-content one
  // registered just above. `exitCode` lets the loop end on its own — which is also why the main
  // report below is in an `else`: without it, swapping `exit()` for `exitCode` made shape mode
  // fall through and print the whole report, six lines of which the instrument then recorded as
  // late content on Node 22 (#888 round 5, found while fixing F1).
  process.exitCode = content.length > 0 ? 1 : 0;
} else {

// Counted BEFORE the first `console.log`. When stdout is a regular file, `process.stdout` is a
// `SyncWriteStream` and each line reaches the patched `fs.writeSync` on fd 1, so a count taken
// after the first line included the probe's own report: 163 on v24 to a file, 162 to a pipe
// (#893 round 1, N4). `content` was never affected — `isStdio` excludes it.
const loaderCount = calls.length - guard.length - content.length;
console.log(`calls during import: ${calls.length}  (node ${process.version})`);
console.log(`  module-graph reads (loader):      ${loaderCount}`);
console.log(`  main-module guard (realpathSync): ${guard.length}`);
for (const call of guard) console.log(`    ${call.name} ${call.arg}`);
console.log(`  repository content or subprocess: ${content.length}`);
for (const call of content) console.log(`    ${call.name} ${call.arg}`);

if (content.length > 0) {
  console.error('\nREFUSED: importing the generator touched repository content or spawned a process.');
  console.error('The comment at the head of scripts/generate-readmes.js says it does not.');
  // `exitCode`, not `exit()`: the late-content handler above must still get to run.
  process.exitCode = 1;
} else {
  // Not printed here: guard 2 prints it after its own count, so a report whose exit phase was cut
  // short does not end in `OK` (#894 design critique, point 1).
  mainInTimeClean = true;
}

}
