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
 * It patches `node:fs` and `node:child_process` BEFORE the import and records every call. The
 * first wording of that comment said the import "reads no file", which this probe refuted on its
 * first run: 28 `openSync` calls, every one of them the ESM loader reading a module in the graph
 * — which happens for any import ever written. The claim worth making is the narrower one, and
 * this script is what tells the two apart.
 *
 * Exit 0 when every recorded call is the loader reading a `.js`/`.mjs` module. Exit 1 when any
 * call touches repository CONTENT — a registry, a SKILL.md, a `package.json` — or spawns git.
 * Exit 2 when it could not run.
 */
import fs from 'node:fs';
import childProcess from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..', '..');
const TARGET = resolve(ROOT, 'scripts', 'generate-readmes.js');

const calls = [];
// `readSync` takes a FILE DESCRIPTOR, not a path, so it cannot be classified by its argument.
// The first version of this probe tried, and reported 28 "repository content" reads that were
// the loader reading the 28 modules it had just opened. Descriptors opened on a `.js`/`.mjs`
// are remembered here, and a `readSync` on one of them is the same loader read as its `openSync`.
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
      calls.push({ name, arg: `fd:${args[0]} (module)`, loader: true });
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

// The patch must be able to FIRE, or "no data read" is a statement about a dead instrument
// rather than about the module. One read of a file the module never touches, before the import.
fs.readFileSync(resolve(ROOT, 'package.json'), 'utf8');
if (calls.length !== 1) {
  console.error(`REFUSED: the fs patch recorded ${calls.length} call(s) for one deliberate read; it is not intercepting.`);
  process.exit(2);
}
calls.length = 0;

await import(pathToFileURL(TARGET).href);

// A module in the graph: the ESM loader opening a `.js`/`.mjs` file. Anything else — a `.yml`,
// a `.md`, a `package.json`, a directory listing, a `git` spawn — is repository content.
const isModuleRead = (call) => call.loader === true
  || (call.name === 'openSync' && /\.(m?js)$/.test(call.arg));
const content = calls.filter((call) => !isModuleRead(call));

// SECOND CONTROL, on the classifier rather than the patch. "Zero content reads" is also what a
// classifier that calls everything a module read would say. One deliberate registry read, made
// after the import and excluded from the verdict, must land on the content side.
const before = calls.length;
fs.readFileSync(resolve(ROOT, 'skills', '_registry.yml'), 'utf8');
const probe = calls.slice(before);
calls.length = before;
if (probe.length !== 1 || isModuleRead(probe[0])) {
  console.error('REFUSED: a deliberate registry read did not classify as repository content;');
  console.error(`  the classifier cannot tell the two apart. Recorded: ${JSON.stringify(probe)}`);
  process.exit(2);
}

console.log(`calls during import: ${calls.length}`);
console.log(`  module-graph reads (loader): ${calls.length - content.length}`);
console.log(`  repository content or subprocess: ${content.length}`);
for (const call of content) console.log(`    ${call.name} ${call.arg}`);

if (content.length > 0) {
  console.error('\nREFUSED: importing the generator touched repository content or spawned a process.');
  console.error('The comment at the head of scripts/generate-readmes.js says it does not.');
  process.exit(1);
}
console.log('\nOK: every call during import is the ESM loader reading the module graph.');
