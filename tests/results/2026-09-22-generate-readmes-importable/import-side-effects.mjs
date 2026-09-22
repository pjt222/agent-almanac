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
 * ## The instrument was dead, and this is the third version
 *
 * Every earlier version of this file reported a number that came from a patch the subject could
 * not see. Both corrections came from an instrument, never from re-reading, and both are kept
 * here because each one is a way this probe can silently stop working:
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
 */
import fs, { readFileSync as namedReadFileSync } from 'node:fs';
import childProcess from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..', '..');
const TARGET = resolve(ROOT, 'scripts', 'generate-readmes.js');

const calls = [];
// `readSync` and `closeSync` take a FILE DESCRIPTOR, not a path, so they cannot be classified by
// their argument. Descriptors opened on a `.js`/`.mjs` are remembered here, and a read or close
// on one of them is the same loader activity as its `openSync`.
const moduleDescriptors = new Set();
const FS_NAMES = [
  'readFileSync', 'existsSync', 'readdirSync', 'opendirSync',
  'openSync', 'statSync', 'lstatSync', 'realpathSync', 'readSync', 'closeSync',
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
for (const name of ['spawnSync', 'execSync', 'execFileSync']) {
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
  console.error('\nREFUSED: importing the generator touched repository content or spawned a process.');
  console.error('The comment at the head of scripts/generate-readmes.js says it does not.');
  process.exit(1);
}
console.log('\nOK: every call during import is the loader reading the module graph, or the guard resolving its two paths.');
