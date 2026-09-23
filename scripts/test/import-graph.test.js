/**
 * import-graph.test.js — the contract of `scripts/lib/import-graph.js` (#892).
 *
 * The walk's PARSING — which `import`/`export` lines are edges, and which quoted strings are not —
 * is pinned through its first consumer in `workflow-generator-inputs.test.js`, where every one of
 * those cases was found. This suite pins what the extraction added and what a second consumer
 * relies on: the root is a parameter, the output is root-relative with `/` separators and includes
 * the entry, a cycle terminates, a missing file throws, a bare specifier is not walked, and a
 * seeded accumulator is the one returned.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { rmTree } from './_tmp.js';
import { importGraph } from '../lib/import-graph.js';

function fixture(t, files) {
  const dir = mkdtempSync(join(tmpdir(), 'import-graph-'));
  t.after(() => rmTree(dir));
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), text);
  }
  return dir;
}

test('paths are relative to the root it is GIVEN, with `/` separators, and include the entry', (t) => {
  const files = {
    'src/a.js': "import { b } from './b.js';\nimport { c } from '../lib/c.js';\n",
    'src/b.js': 'export const b = 1;\n',
    'lib/c.js': 'export const c = 1;\n',
  };
  // Two roots holding the same tree: a walk that still closed over one fixed root would report
  // one of them relative to the wrong directory, or refuse the other as missing.
  for (const root of [fixture(t, files), fixture(t, files)]) {
    assert.deepEqual([...importGraph(root, 'src/a.js')].sort(), ['lib/c.js', 'src/a.js', 'src/b.js']);
  }
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
