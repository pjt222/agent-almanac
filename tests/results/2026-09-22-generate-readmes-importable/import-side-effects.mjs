/**
 * import-side-effects.mjs — what `import('../../../scripts/generate-readmes.js')` actually does.
 *
 *   node tests/results/2026-09-22-generate-readmes-importable/import-side-effects.mjs
 *   node …/import-side-effects.mjs --verify        # the reach claim, as arms
 *   node …/import-side-effects.mjs --shape <name>  # one arm, for debugging
 *
 * `security-surface.test.js` proves the import prints nothing and exits 0. That is the property
 * the main-module guard is for, and it is blind to a quieter one: a module can read — or write —
 * the whole repository in silence. The head of `generate-readmes.js` claims it does not, so the
 * claim is measured here rather than believed.
 *
 * ## Five corrections, every one of them from a measurement
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
 *
 * Corrections 3, 4 and 5 were all found by someone running something. None came from re-reading.
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
 * ## The reach claim is a RUN, not a paragraph
 *
 * `--verify` plants one shape per arm into a throwaway module, imports THAT instead of the
 * generator, and asserts the verdict each shape is declared to produce. Arms declared `blind` are
 * as load-bearing as the `seen` ones: `empty` — a module that does nothing — is the control that
 * catches a probe refusing before the planted line matters, which is how eleven `ok seen` rows
 * passed for the wrong reason on Node 22 and 24 in the previous version.
 *
 * Still unmeasured beyond the declared-blind arms: a module loaded before this file, and any
 * side effect reaching the filesystem through neither those three modules nor a worker.
 */
import fs, { readFileSync as namedReadFileSync } from 'node:fs';
import fsPromises from 'node:fs/promises';
import childProcess from 'node:child_process';
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
  // DECLARED BLIND, and measured so rather than asserted in prose. A worker has its own module
  // registry and its own `fs`; nothing patched here reaches it.
  'worker-write':     { expect: 'blind', code: "import { Worker } from 'node:worker_threads'; const w = new Worker(\"import('node:fs').then((m) => m.writeFileSync(process.env.SHAPE_TMP + '/from-worker.txt', 'x'));\", { eval: true }); await new Promise((r) => w.on('exit', r));" },
  // DECLARED BLIND. `process.binding` reaches the internal binding directly, below every public
  // name this file can wrap. Deprecated, and the arm stays blind on a node that refuses it.
  'process-binding':  { expect: 'blind', code: "try { process.binding('fs'); } catch { /* removed in a future node; blind either way */ }" },
};

// The shape module is written BEFORE the patch loops, so writing it is not itself recorded.
let TARGET = GENERATOR;
let SHAPE_DIR = null;
if (SHAPE) {
  const shape = SHAPES[SHAPE];
  if (!shape) {
    console.error(`REFUSED: unknown shape \`${SHAPE}\`. Known: ${Object.keys(SHAPES).join(', ')}`);
    process.exit(2);
  }
  // Captured BEFORE the patch loops and used from an `exit` handler, so every path cleans up —
  // including a refusal. A probe about side effects that leaked a directory per arm would be the
  // joke it deserves (#885 is that class).
  const rmOriginal = fs.rmSync;
  SHAPE_DIR = fs.mkdtempSync(resolve(tmpdir(), 'import-shape-'));
  process.env.SHAPE_TMP = SHAPE_DIR;
  process.on('exit', () => {
    try { rmOriginal(SHAPE_DIR, { recursive: true, force: true }); } catch { /* best effort */ }
  });
  TARGET = resolve(SHAPE_DIR, 'shape.mjs');
  fs.writeFileSync(TARGET, [
    "import { resolve } from 'node:path';",
    `const R = (p) => resolve(${JSON.stringify(ROOT)}, p);`,
    `const T = (p) => resolve(${JSON.stringify(SHAPE_DIR)}, p);`,
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
  for (const [name, { expect }] of Object.entries(SHAPES)) {
    const run = childProcess.spawnSync(process.execPath, [SELF, '--shape', name], { encoding: 'utf8' });
    // The VERDICT comes from a marker line, never from the exit code alone: node exits 1 on any
    // uncaught exception, so a shape that merely threw used to grade `seen`, and a blind shape
    // whose path did not exist used to grade `seen` too (#888 round 3).
    const marker = (run.stdout || '').split('\n').find((line) => line.startsWith(VERDICT_MARKER));
    const got = marker ? marker.slice(VERDICT_MARKER.length).trim() : `error(no verdict, exit ${run.status})`;
    const ok = got === expect;
    if (!ok) bad++;
    rows.push(`  ${ok ? 'ok  ' : 'FAIL'}  ${name.padEnd(18)} declared ${expect.padEnd(5)} observed ${got}`);
    if (!ok) {
      const why = (run.stderr || '').trim().split('\n').filter(Boolean).slice(-1)[0];
      if (why) rows.push(`        ${why}`);
    }
  }
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

await import(pathToFileURL(TARGET).href);

// Three buckets. The guard's own `realpathSync` pair is neither loader activity nor repository
// content: it is the module doing the one thing it is supposed to do at import. Reported by name
// rather than filtered away, because a silent exemption is how a probe starts excusing the thing
// it was built to catch.
const GUARD_PATHS = new Set([TARGET, GENERATOR, resolve(process.argv[1] ?? '')]);
const isLoader = (call) => call.kind === 'loader';
const isGuard = (call) => call.name.endsWith('.realpathSync') && GUARD_PATHS.has(resolve(call.arg));

const guard = calls.filter((call) => !isLoader(call) && isGuard(call));
const content = calls.filter((call) => !isLoader(call) && !isGuard(call));

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

if (SHAPE) {
  // One line the parent grades on, so a crash is never read as a verdict.
  console.log(`${VERDICT_MARKER} ${content.length > 0 ? 'seen' : 'blind'}`);
  for (const call of content) console.log(`  ${call.name} ${call.arg}`);
  process.exit(content.length > 0 ? 1 : 0);
}

console.log(`calls during import: ${calls.length}  (node ${process.version})`);
console.log(`  module-graph reads (loader):      ${calls.length - guard.length - content.length}`);
console.log(`  main-module guard (realpathSync): ${guard.length}`);
for (const call of guard) console.log(`    ${call.name} ${call.arg}`);
console.log(`  repository content or subprocess: ${content.length}`);
for (const call of content) console.log(`    ${call.name} ${call.arg}`);

if (content.length > 0) {
  console.error('\nREFUSED: importing the generator touched repository content or spawned a process.');
  console.error('The comment at the head of scripts/generate-readmes.js says it does not.');
  process.exit(1);
}
console.log('\nOK: every call during import is the loader reading the module graph, or the guard resolving its two paths.');
