/**
 * import-side-effects.mjs — what `import('../../../scripts/generate-readmes.js')` actually does.
 *
 *   node tests/results/2026-09-22-generate-readmes-importable/import-side-effects.mjs
 *
 * `security-surface.test.js` proves the import prints nothing and exits 0. That is the property
 * the main-module guard is for, and it is blind to a quieter one: a module can read the whole
 * repository in silence. The comment at the head of `generate-readmes.js` claims it does not, so
 * the claim is measured here rather than believed.
 *
 * ## The instrument was dead, and this is the fourth version
 *
 * Every earlier version of this file reported a number that came from a patch the subject could
 * not see. Every correction came from a measurement, never from re-reading, and all four are
 * kept here because each one is a way this probe can silently stop working:
 *
 *   1. "reads no file" was the first claim. The import opens 28 — every import does. The claim
 *      worth making is about repository CONTENT: a registry, a `SKILL.md`, a `package.json`, a
 *      `git` spawn.
 *   2. The classifier read `readSync`'s first argument as a path. It is a file DESCRIPTOR, so 28
 *      loader reads were reported as content and the probe refused a module that was behaving.
 *   3. **Assigning over `fs.readFileSync` does not reach `import { readFileSync } from 'fs'`.**
 *      An ESM named binding to a builtin is resolved at link time and does NOT follow a later
 *      property assignment until `module.syncBuiltinESMExports()` runs. The subject and every
 *      lib under it import by name, so the patch was invisible to all of them — while both
 *      controls called `fs.readFileSync` on the DEFAULT export and fired happily. Measured on
 *      node v25.9.0: after the assignment `named === fs.readFileSync` is `false` and
 *      `named === original` is `true`; after `syncBuiltinESMExports()` the named binding is the
 *      patched function. Found by the #888 round-1 reviewer, re-derived here.
 *
 *      The number moved when the instrument was repaired: `84, all loader` became
 *      `86 = 84 loader + 2 guard`, the two being `invokedAsScript()`'s own `realpathSync` calls.
 *      The behavioural claim survived — no registry, no YAML, no `git` — but the measurement
 *      behind it had not been made.
 *
 * ## Three controls, because "zero content reads" has three ways of being a lie
 *
 *   patch fires          one deliberate read must be recorded at all
 *   patch reaches ESM    a NAMED binding must be the patched function after the sync
 *   classifier bites     one deliberate registry read must land on the CONTENT side
 *
 * Any control failing exits 2. Exit 0 when every recorded call is the loader reading the module
 * graph or the main-module guard resolving its two paths; exit 1 when anything touches
 * repository content or spawns a process.
 *
 *   4. **It patched no WRITE name at all.** The round-2 reviewer planted a `writeFileSync` into
 *      the tree at module scope and the probe said OK — while its header claimed to record every
 *      call, and its negative test used `existsSync`, the shape it was already best at. The same
 *      round found the callback API, `accessSync` and `globSync` unpatched, and `node:fs/promises`
 *      had been covered only one commit earlier for the same reason. The most damaging thing an
 *      import can do was the thing this instrument could not see, and its OK was quoted in a
 *      shipped comment.
 *
 * ## What it can and cannot see, as a RUN rather than a paragraph
 *
 *   node …/import-side-effects.mjs --verify
 *
 * A paragraph listing blind spots is a claim like any other, and the four corrections above were
 * all discovered in a paragraph that was wrong. `--verify` plants one shape per arm into a
 * throwaway module, imports THAT instead of the generator, and asserts the verdict each shape is
 * declared to produce — every SEEN arm must refuse, every BLIND arm must pass. An arm that stops
 * behaving as declared fails the run.
 *
 * The one declared BLIND shape is `openSync` of a content `.js` read as data: this instrument
 * classifies a `.js` open as loader activity by extension, and nothing in a call record
 * distinguishes the loader opening a module from a module opening a `.js` as data. Beyond the
 * arms, and unmeasured: a native addon, a worker thread, `process.binding`, and anything a module
 * loaded before this file does. The verdict is therefore "nothing reached repository content
 * through `node:fs`, `node:fs/promises` or `node:child_process`", which is the claim the head of
 * `generate-readmes.js` makes — not "nothing reached repository content".
 */
import fs, { readFileSync as namedReadFileSync } from 'node:fs';
import fsPromises from 'node:fs/promises';
import childProcess from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..', '..');
const GENERATOR = resolve(ROOT, 'scripts', 'generate-readmes.js');

const ARGS = process.argv.slice(2);
const VERIFY = ARGS.includes('--verify');
const SHAPE = ARGS.includes('--shape') ? ARGS[ARGS.indexOf('--shape') + 1] : null;

/**
 * One planted import-time side effect per arm, and the verdict it must produce.
 *
 * `seen` means the probe must REFUSE (exit 1): the shape reaches repository content through a
 * module this file patches. `blind` means it must pass: the shape is invisible BY CONSTRUCTION,
 * and saying so in a run is the difference between a measured limit and a paragraph.
 */
const SHAPES = {
  'sync-read':       { expect: 'seen',  code: "import { existsSync } from 'node:fs'; existsSync(R('skills/_registry.yml'));" },
  'sync-write':      { expect: 'seen',  code: "import { writeFileSync } from 'node:fs'; writeFileSync(T('planted.txt'), 'x');" },
  'sync-mkdir':      { expect: 'seen',  code: "import { mkdirSync } from 'node:fs'; mkdirSync(T('planted-dir'), { recursive: true });" },
  'access':          { expect: 'seen',  code: "import { accessSync } from 'node:fs'; accessSync(R('package.json'));" },
  'callback-read':   { expect: 'seen',  code: "import { readFile } from 'node:fs'; readFile(R('package.json'), () => {});" },
  'promises-read':   { expect: 'seen',  code: "import { readFile } from 'node:fs/promises'; await readFile(R('package.json'), 'utf8');" },
  'promises-readdir':{ expect: 'seen',  code: "import { readdir } from 'node:fs/promises'; await readdir(R('scripts'));" },
  'glob':            { expect: 'seen',  code: "import { globSync } from 'node:fs'; globSync('*.js', { cwd: R('scripts') });" },
  'spawn-sync':      { expect: 'seen',  code: "import { execFileSync } from 'node:child_process'; execFileSync('git', ['--version']);" },
  'spawn-async':     { expect: 'seen',  code: "import { spawn } from 'node:child_process'; spawn('git', ['--version']);" },
  'write-stream':    { expect: 'seen',  code: "import { createWriteStream } from 'node:fs'; createWriteStream(T('streamed.txt')).end('x');" },
  'cp-sync':         { expect: 'seen',  code: "import { cpSync } from 'node:fs'; cpSync(R('package.json'), T('copied.json'));" },
  'create-require':  { expect: 'seen',  code: "import { createRequire } from 'node:module'; createRequire(import.meta.url)('node:fs').readFileSync(R('package.json'), 'utf8');" },
  // BLIND, and declared so. A `.js` opened as DATA is indistinguishable from the loader opening
  // a module: both are `openSync` on a path ending `.js`, followed by reads and a close.
  'open-js-as-data': { expect: 'blind', code: "import { openSync, closeSync } from 'node:fs'; closeSync(openSync(R('cli/index.js'), 'r'));" },
};

// The shape module is written BEFORE the patch loops below, so writing it is not itself recorded.
let TARGET = GENERATOR;
let SHAPE_DIR = null;
if (SHAPE) {
  const shape = SHAPES[SHAPE];
  if (!shape) {
    console.error(`REFUSED: unknown shape \`${SHAPE}\`. Known: ${Object.keys(SHAPES).join(', ')}`);
    process.exit(2);
  }
  // Captured BEFORE the patch loops, and used from an `exit` handler so every path cleans up —
  // including `refuse`'s exit 2 and the content-found exit 1. A probe about side effects that
  // leaks a directory per arm would be the joke it deserves (#885 is that class).
  const rmOriginal = fs.rmSync;
  SHAPE_DIR = fs.mkdtempSync(resolve(tmpdir(), 'import-shape-'));
  process.on('exit', () => {
    try { rmOriginal(SHAPE_DIR, { recursive: true, force: true }); } catch { /* best effort */ }
  });
  TARGET = resolve(SHAPE_DIR, 'shape.mjs');
  fs.writeFileSync(TARGET, [
    `import { resolve } from 'node:path';`,
    `const R = (p) => resolve(${JSON.stringify(ROOT)}, p);`,
    `const T = (p) => resolve(${JSON.stringify(SHAPE_DIR)}, p);`,
    shape.code,
    '',
  ].join('\n'), 'utf8');
}

const calls = [];
// `readSync` and `closeSync` take a FILE DESCRIPTOR, not a path, so they cannot be classified by
// their argument. Descriptors opened on a `.js`/`.mjs` are remembered here, and a read or close
// on one of them is the same loader activity as its `openSync`.
const moduleDescriptors = new Set();
// Reads AND WRITES, and `access` with them. The round-2 review planted a `writeFileSync` into
// the tree at import and this probe said OK: it patched no write name at all, while its header
// claimed to record every call and its negative test used `existsSync` — the shape it was
// already best at. A probe that cannot see the most damaging thing an import can do is worse
// than none, because its OK is quoted.
const FS_NAMES = [
  // read
  'readFileSync', 'existsSync', 'accessSync', 'readdirSync', 'opendirSync', 'globSync',
  'openSync', 'statSync', 'lstatSync', 'realpathSync', 'readSync', 'closeSync', 'readlinkSync',
  // write
  'writeFileSync', 'appendFileSync', 'writeSync', 'writevSync', 'mkdirSync', 'rmSync', 'rmdirSync',
  'unlinkSync', 'renameSync', 'copyFileSync', 'cpSync', 'symlinkSync', 'linkSync',
  'truncateSync', 'ftruncateSync', 'chmodSync', 'chownSync', 'utimesSync', 'mkdtempSync',
  // streams, which are neither read nor write names and reach the filesystem all the same.
  // `createWriteStream(p).write(x)` at module scope touched none of the names above — found by
  // asking "find a write that reaches the tree through none of them" before the reviewer did.
  'createWriteStream', 'createReadStream',
  // callback API — a different set of functions from the sync ones, and unpatched until round 2
  'readFile', 'writeFile', 'appendFile', 'readdir', 'open', 'stat', 'lstat', 'access',
  'mkdir', 'rm', 'unlink', 'rename', 'copyFile', 'cp', 'realpath',
];
for (const name of FS_NAMES) {
  const original = fs[name];
  if (typeof original !== 'function') continue;
  fs[name] = function patched(...args) {
    const result = original.apply(this, args);
    if (name === 'openSync') {
      calls.push({ name, arg: String(args[0]) });
      if (/\.(m?js)$/.test(String(args[0]))) moduleDescriptors.add(result);
    } else if ((name === 'readSync' || name === 'closeSync') && moduleDescriptors.has(args[0])) {
      calls.push({ name, arg: `fd:${args[0]} (module)`, kind: 'loader' });
      if (name === 'closeSync') moduleDescriptors.delete(args[0]);
    } else {
      calls.push({ name, arg: String(args[0]) });
    }
    return result;
  };
}
// `node:fs/promises` is a SEPARATE module object — patching `node:fs` does not reach it, and a
// walk written `await readdir(dir)` was invisible to every version of this probe before this
// one. (It is the same object as `fs.promises`, measured: `fs.promises === fsPromises` is true,
// so one patch covers both spellings.) Nothing in the current graph imports it, which is the
// reason to cover it: the gap would open silently the first time something did.
for (const name of [
  'readFile', 'writeFile', 'appendFile', 'readdir', 'opendir', 'stat', 'lstat', 'realpath',
  'access', 'open', 'mkdir', 'rm', 'unlink', 'rename', 'copyFile', 'cp', 'glob',
]) {
  const original = fsPromises[name];
  if (typeof original !== 'function') continue;
  fsPromises[name] = function patched(...args) {
    calls.push({ name: `promises.${name}`, arg: String(args[0]) });
    return original.apply(this, args);
  };
}
for (const name of ['spawnSync', 'execSync', 'execFileSync', 'spawn', 'exec', 'execFile', 'fork']) {
  const original = childProcess[name];
  if (typeof original !== 'function') continue;
  childProcess[name] = function patched(...args) {
    calls.push({ name, arg: String(args[0]) });
    return original.apply(this, args);
  };
}
// THE line the first two versions of this probe were missing. Without it every `import { … }
// from 'fs'` in the subject keeps the ORIGINAL function and this whole file measures nothing.
syncBuiltinESMExports();

// `--verify` never patches anything itself: it spawns one child per arm, each of which patches
// and imports its own planted module. One process per arm, because the patch and the import are
// one-shot.
if (VERIFY) {
  const rows = [];
  let bad = 0;
  for (const [name, { expect }] of Object.entries(SHAPES)) {
    const run = childProcess.spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--shape', name],
      { encoding: 'utf8' });
    const got = run.status === 1 ? 'seen' : run.status === 0 ? 'blind' : `error(${run.status})`;
    const ok = got === expect;
    if (!ok) bad++;
    rows.push(`  ${ok ? 'ok  ' : 'FAIL'}  ${name.padEnd(18)} declared ${expect.padEnd(5)} observed ${got}`);
    if (!ok && run.stderr) rows.push(`        ${run.stderr.trim().split('\n')[0]}`);
  }
  console.log(`--verify: ${Object.keys(SHAPES).length} shape(s), each planted into a throwaway module and imported`);
  for (const row of rows) console.log(row);
  if (bad) {
    console.error(`\nREFUSED: ${bad} shape(s) did not behave as declared. The header's reach claim is wrong.`);
    process.exit(1);
  }
  console.log('\nOK: every shape behaves as the header declares, including the one declared BLIND.');
  process.exit(0);
}

const refuse = (message, detail) => {
  console.error(`REFUSED: ${message}`);
  if (detail) console.error(`  ${detail}`);
  process.exit(2);
};

// CONTROL 1 — the patch fires at all.
fs.readFileSync(resolve(ROOT, 'package.json'), 'utf8');
if (calls.length !== 1) {
  refuse(`the fs patch recorded ${calls.length} call(s) for one deliberate read; it is not intercepting.`);
}
calls.length = 0;

// CONTROL 2 — the patch reaches the shape the SUBJECT uses. This file's own `namedReadFileSync`
// was bound at link time, exactly as the subject's `readFileSync` was; if the sync above did not
// take, this comparison is false and the probe stops rather than reporting a clean tree.
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

// Three buckets, not two. The guard's own `realpathSync` pair is neither loader activity nor
// repository content: it is the module doing the one thing it is supposed to do at import.
// Reported by name rather than filtered away, because a silent exemption is how a probe starts
// excusing the thing it was built to catch.
const GUARD_PATHS = new Set([TARGET, resolve(process.argv[1] ?? '')]);
const isLoader = (call) => call.kind === 'loader'
  || (call.name === 'openSync' && /\.(m?js)$/.test(call.arg));
const isGuard = (call) => call.name === 'realpathSync' && GUARD_PATHS.has(resolve(call.arg));

const guard = calls.filter((call) => !isLoader(call) && isGuard(call));
const content = calls.filter((call) => !isLoader(call) && !isGuard(call));

// CONTROL 3 — the classifier can still say "content". Zero content reads is also what a
// classifier that calls everything loader activity would report. One deliberate registry read,
// made after the import and excluded from the verdict, must land on the content side.
const before = calls.length;
namedReadFileSync(resolve(ROOT, 'skills', '_registry.yml'), 'utf8');
const probe = calls.slice(before);
calls.length = before;
if (probe.length !== 1 || isLoader(probe[0]) || isGuard(probe[0])) {
  refuse(
    'a deliberate registry read did not classify as repository content;',
    `the classifier cannot tell the two apart. Recorded: ${JSON.stringify(probe)}`,
  );
}

console.log(`calls during import: ${calls.length}`);
console.log(`  module-graph reads (loader):      ${calls.length - guard.length - content.length}`);
console.log(`  main-module guard (realpathSync): ${guard.length}`);
for (const call of guard) console.log(`    ${call.name} ${call.arg}`);
console.log(`  repository content or subprocess: ${content.length}`);
for (const call of content) console.log(`    ${call.name} ${call.arg}`);

if (content.length > 0) {
  console.error(`\nREFUSED: importing ${SHAPE ? `the \`${SHAPE}\` shape` : 'the generator'} touched repository content or spawned a process.`);
  if (!SHAPE) console.error('The comment at the head of scripts/generate-readmes.js says it does not.');
  process.exit(1);
}
console.log('\nOK: every call during import is the loader reading the module graph, or the guard resolving its two paths.');
