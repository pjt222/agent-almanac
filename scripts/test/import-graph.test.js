/**
 * import-graph.test.js — the contract of `scripts/lib/import-graph.js` (#892, #918).
 *
 * The cases that shaped the old regex — a quoted literal in a function body, the word `from` in
 * a comment — are pinned through the first consumer in `workflow-generator-inputs.test.js`, where
 * they were found. This suite pins what the extraction added and what a second consumer relies
 * on: the root is a parameter, the output is root-relative and includes the entry, a cycle
 * terminates, a missing file throws, a bare specifier is not walked, and a seeded accumulator is
 * the one returned. Since #918 it also pins the parsing that consumer relies on — import-shaped
 * text in a comment or a string is not an edge — and the two ways the parser flag reaches the
 * walk.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { rmTree } from './_tmp.js';
import { importGraph } from '../lib/import-graph.js';

const LIB = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'import-graph.js');

function fixture(t, files) {
  const dir = mkdtempSync(join(tmpdir(), 'import-graph-'));
  t.after(() => rmTree(dir));
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), text);
  }
  return dir;
}

test('paths are relative to the root it is GIVEN, and include the entry', (t) => {
  const files = {
    'src/a.js': "import { b } from './b.js';\nimport { c } from '../lib/c.js';\n",
    'src/b.js': 'export const b = 1;\n',
    'lib/c.js': 'export const c = 1;\n',
  };
  // Two roots holding DIFFERENT trees. The same tree in both could not see a root captured on the
  // first call and reused: that walk reports the first tree for the second root, and identical
  // trees made the answer look right (#906 round 1, SF-1).
  const other = {
    ...files,
    'src/a.js': "import { d } from './d.js';\nimport { c } from '../lib/c.js';\n",
    'src/d.js': 'export const d = 1;\n',
  };
  assert.deepEqual([...importGraph(fixture(t, files), 'src/a.js')].sort(), ['lib/c.js', 'src/a.js', 'src/b.js']);
  assert.deepEqual([...importGraph(fixture(t, other), 'src/a.js')].sort(), ['lib/c.js', 'src/a.js', 'src/d.js']);
});

test('a cycle terminates, and each module is reported once', (t) => {
  const root = fixture(t, {
    'a.js': "import './b.js';\n",
    'b.js': "import { a } from './a.js';\n",
  });
  assert.deepEqual([...importGraph(root, 'a.js')].sort(), ['a.js', 'b.js']);
});

test('a relative import that does not exist throws, naming the missing path', (t) => {
  const root = fixture(t, { 'a.js': "import { gone } from './lib/gone.js';\n" });
  assert.throws(() => importGraph(root, 'a.js'), /entry or import does not exist: lib\/gone\.js/);
});

test('a missing ENTRY throws too, rather than reporting an empty graph', (t) => {
  const root = fixture(t, { 'a.js': 'export const a = 1;\n' });
  assert.throws(() => importGraph(root, 'nope.js'), /entry or import does not exist: nope\.js/);
});

test('a bare specifier is a package and is not walked', (t) => {
  const root = fixture(t, {
    'a.js': "import fs from 'node:fs';\nimport yaml from 'js-yaml';\nimport { b } from './b.js';\n",
    'b.js': 'export const b = 1;\n',
  });
  assert.deepEqual([...importGraph(root, 'a.js')].sort(), ['a.js', 'b.js']);
});

// ── #918: only a real import is an edge ────────────────────────────────────────────────────
//
// The walk read its edges with a line-start regex over source TEXT, so import-shaped text inside a
// comment or a string was an edge. Each arm below plants a REAL sibling file that nothing imports,
// so the walk can reach it without throwing: an arm whose target did not exist would go red on the
// old code by throwing, and would then pass on any fix that merely stopped throwing. Every arm also
// carries a real import of `real.js`, asserted present, so a walk that returned the entry alone
// cannot pass it either.
const PLANTED = { 'real.js': 'export const real = 1;\n', 'planted.js': 'export const planted = 1;\n' };
const REAL_ONLY = ['a.js', 'real.js'];

for (const [label, source] of [
  ['an import in a block comment', "import { real } from './real.js';\n/*\nimport { planted } from './planted.js';\n*/\n"],
  ['an import in a template literal', "import { real } from './real.js';\nconst text = `\nimport { planted } from './planted.js';\n`;\n"],
  // A string reaches a line start only through a backslash line continuation: one written on a
  // single line puts a quote before the `import`, which the old anchor already refused.
  ['an import in a single-quoted string with a line continuation', "import { real } from './real.js';\nconst text = 'a\\\nimport \"./planted.js\"';\n"],
  ['an import in a double-quoted string with a line continuation',"import { real } from './real.js';\nconst text = \"a\\\nimport './planted.js'\";\n"],
  ['`export * from` in a block comment', "import { real } from './real.js';\n/*\nexport * from './planted.js';\n*/\n"],
  ['`export { a } from` in a template literal', "import { real } from './real.js';\nconst text = `\nexport { planted } from './planted.js';\n`;\n"],
  ['a side-effect import in a block comment', "import { real } from './real.js';\n/*\nimport './planted.js';\n*/\n"],
]) {
  test(`${label} is not an edge (#918)`, (t) => {
    const root = fixture(t, { ...PLANTED, 'a.js': source });
    assert.deepEqual([...importGraph(root, 'a.js')].sort(), REAL_ONLY);
  });
}

test('an import in a comment of a graph MEMBER is not an edge either — the hole was transitive (#918)', (t) => {
  const root = fixture(t, {
    ...PLANTED,
    'a.js': "import { m } from './member.js';\n",
    'member.js': "import { real } from './real.js';\n/*\nimport { planted } from './planted.js';\n*/\nexport const m = real;\n",
  });
  assert.deepEqual([...importGraph(root, 'a.js')].sort(), ['a.js', 'member.js', 'real.js']);
});

test('CONTROL: a `//` comment was never an edge — its slashes defeated the old line-start anchor', (t) => {
  // Passes on the regex too. Kept so the parser is held to the same answer, and so nobody counts
  // it as a case the fix closed.
  const root = fixture(t, { ...PLANTED, 'a.js': "import { real } from './real.js';\n// import { planted } from './planted.js';\n" });
  assert.deepEqual([...importGraph(root, 'a.js')].sort(), REAL_ONLY);
});

test('CONTROL: a quoted dotted path inside a regex LITERAL is not an edge', (t) => {
  // Passes on the regex too, whose line-start anchor never reached it. It is here for the
  // alternative #918 ruled out: `stripCommentsAndStrings` (scripts/lib/code-tokens.js) cannot tell
  // a regex literal from a string, so a scanner built on it would mis-tokenize this line.
  const root = fixture(t, { ...PLANTED, 'a.js': "import { real } from './real.js';\nexport const re = /['\"](\\.\\/planted\\.js)['\"]/;\n" });
  assert.deepEqual([...importGraph(root, 'a.js')].sort(), REAL_ONLY);
});

test('CONTROL: a dynamic import() is not a static edge', (t) => {
  // Passes on the regex too. The graph is the STATIC one: its consumers treat a dynamic import as
  // code the module chose to run (the import-side-effects probe) or declare it invisible
  // (check-workflow-generator-inputs).
  const root = fixture(t, { ...PLANTED, 'a.js': "import { real } from './real.js';\nawait import('./planted.js');\n" });
  assert.deepEqual([...importGraph(root, 'a.js')].sort(), REAL_ONLY);
});

test('the forms a real module uses are all still edges', (t) => {
  // The other direction: a parser that dropped any of these would shrink the graph, and on the
  // healer check a smaller graph is a false PASS. Each form reaches its own file. The regex failed
  // this one too: `six.js`, the second import on its line, was invisible to a line-start anchor.
  const root = fixture(t, {
    'a.js': [
      '#!/usr/bin/env node',
      "import {\n  one,\n} from './one.js';",
      "import './two.js';",
      "export * from './three.js';",
      "export { four } from './four.js';",
      "import * as five from './five.js'; import six from './six.js';",
      "console.log(one, five, six);",
      '',
    ].join('\n'),
    'one.js': 'export const one = 1;\n',
    'two.js': 'export {};\n',
    'three.js': 'export const three = 3;\n',
    'four.js': 'export const four = 4;\n',
    'five.js': 'export const five = 5;\n',
    'six.js': 'export default 6;\n',
  });
  assert.deepEqual(
    [...importGraph(root, 'a.js')].sort(),
    ['a.js', 'five.js', 'four.js', 'one.js', 'six.js', 'three.js', 'two.js'],
  );
});

test('CONTROL: a JSON import is a member of the graph and is not parsed as a module', (t) => {
  // Passes on the regex too, which kept a JSON file as a leaf. A JSON document is not module
  // source — parsed as one it is a SyntaxError — so the parser must keep it a leaf as well.
  const root = fixture(t, {
    'a.js': "import data from './data.json' with { type: 'json' };\nconsole.log(data);\n",
    'data.json': '{ "key": "./not-an-import.js" }\n',
  });
  assert.deepEqual([...importGraph(root, 'a.js')].sort(), ['a.js', 'data.json']);
});

test('a module that does not parse is an error naming it, never an empty graph', (t) => {
  // The regex read whatever text it was given. A parser refuses, and the refusal must reach the
  // caller: `check-workflow-generator-inputs.js` turns a throw into a structural refusal.
  const root = fixture(t, {
    'a.js': "import { b } from './b.js';\n",
    'b.js': 'export const = ;\n',
  });
  assert.throws(() => importGraph(root, 'a.js'), /cannot parse b\.js as an ES module/);
});

// ── #918: how the parser flag reaches the walk ─────────────────────────────────────────────
//
// `node --test` runs this file WITHOUT `--experimental-vm-modules`, so every test above goes
// through the child `importGraph` starts with the flag. The two below pin the other two paths: a
// caller that has the flag walks in-process, and a child that cannot deliver is an error.

test('a caller already running with the flag walks in-process and gets the same graph', (t) => {
  const root = fixture(t, { ...PLANTED, 'a.js': "import { real } from './real.js';\n/*\nimport { planted } from './planted.js';\n*/\n" });
  // The paths ride the environment rather than being interpolated into the script's source, the
  // shape CodeQL's js/bad-code-sanitization flagged on the import-side-effects probe.
  //
  // IN-process is the property, so any child is poisoned: NODE_OPTIONS set after this process
  // started does not touch it, but every child it spawns inherits a preload that does not exist
  // and dies. A graph therefore proves no child ran; the same graph through a child (the flagged
  // branch deleted) fails here (#918 round 1, F1).
  const script = [
    "import vm from 'node:vm';",
    "if (typeof vm.SourceTextModule !== 'function') throw new Error('flag did not take');",
    'process.env.NODE_OPTIONS = process.env.IMPORT_GRAPH_POISON;',
    'const { importGraph } = await import(process.env.IMPORT_GRAPH_LIB);',
    "process.stdout.write(JSON.stringify([...importGraph(process.env.IMPORT_GRAPH_ROOT, 'a.js')].sort()));",
  ].join('\n');
  const run = spawnSync(
    process.execPath,
    ['--experimental-vm-modules', '--disable-warning=ExperimentalWarning', '--input-type=module', '-e', script],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        IMPORT_GRAPH_LIB: pathToFileURL(LIB).href,
        IMPORT_GRAPH_ROOT: root,
        IMPORT_GRAPH_POISON: `--require=${join(root, 'no-such-preload.cjs')}`,
      },
    },
  );
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(JSON.parse(run.stdout), REAL_ONLY);
});

/** Run `importGraph` with NODE_OPTIONS set for its child only, restoring it afterwards. */
function withChildOptions(t, options) {
  const saved = process.env.NODE_OPTIONS;
  t.after(() => {
    if (saved === undefined) delete process.env.NODE_OPTIONS;
    else process.env.NODE_OPTIONS = saved;
  });
  process.env.NODE_OPTIONS = options;
}

test('a parser child that dies is an error naming why, never an empty or entry-only graph', (t) => {
  // An entry-only set would make the healer check print `1 module(s) reachable … 0 unlisted` over
  // a graph it never read. NODE_OPTIONS reaches the child and kills it before the walk starts;
  // this process, already running, is unaffected. The reason must survive: a crashed node's LAST
  // stderr line is its `Node.js vX.Y.Z` footer, which reads as a version problem (round 1, F2).
  const root = fixture(t, { ...PLANTED, 'a.js': "import { real } from './real.js';\n" });
  withChildOptions(t, `--require=${join(root, 'no-such-preload.cjs')}`);
  assert.throws(
    () => importGraph(root, 'a.js'),
    /the parser child .* exited 1 without a graph: Error: Cannot find module '[^']*no-such-preload\.cjs'/,
  );
});

test('a parser child that dies on a thrown non-Error keeps the value, and not the version footer', (t) => {
  // No `…Error` line to pick: the thrown value sits above a `--trace-uncaught` hint and the footer.
  const root = fixture(t, {
    ...PLANTED,
    'a.js': "import { real } from './real.js';\n",
    'throw-string.cjs': "throw 'preload threw a string';\n",
  });
  withChildOptions(t, `--require=${join(root, 'throw-string.cjs')}`);
  assert.throws(() => importGraph(root, 'a.js'), (error) => {
    assert.match(error.message, /the parser child .* exited 1 without a graph: .*preload threw a string/);
    assert.doesNotMatch(error.message, /Node\.js v\d/, 'the version footer is not a reason');
    return true;
  });
});

test('a parser child killed by a signal says so, and is still an error', { skip: process.platform === 'win32' }, (t) => {
  // `child.status` is null here; the message used to read `exited null … no output`.
  const root = fixture(t, {
    ...PLANTED,
    'a.js': "import { real } from './real.js';\n",
    'kill-self.cjs': "process.kill(process.pid, 'SIGKILL');\n",
  });
  withChildOptions(t, `--require=${join(root, 'kill-self.cjs')}`);
  assert.throws(() => importGraph(root, 'a.js'), /the parser child .* was killed by SIGKILL without a graph/);
});

test('a seeded accumulator is the one returned, and a seeded module is not walked again', (t) => {
  const root = fixture(t, {
    'a.js': "import './b.js';\n",
    // b.js is seeded, so its missing import must never be followed.
    'b.js': "import './missing.js';\n",
  });
  const seen = new Set(['b.js']);
  const out = importGraph(root, 'a.js', seen);
  assert.equal(out, seen, 'the accumulator passed in is the one returned');
  assert.deepEqual([...out].sort(), ['a.js', 'b.js']);
});
