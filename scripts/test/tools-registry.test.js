/**
 * tools-registry.test.js — the reader, the schema, the parity check and the two renderings.
 *
 * The property this file pins: a session that has forgotten a tool's NAME can still find it by
 * NEED in CLAUDE.md, and the catalogue cannot drift from disk in either direction without a
 * named failure. Every fixture is a temp tree, so the live registry is exercised only by the
 * last test (which asserts the real catalogue passes its own gate — the negative arm over the
 * real corpus pins the corpus, the temp trees pin the gate).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { rmTree } from './_tmp.js';
import {
  REGISTRY_PATH, parseRegistry, schemaErrors, checkParity, loadRegistry, renderClaudeBlock, renderReadmeTable,
} from '../lib/tools-registry.js';
import { main as checkMain } from '../check-tools-registry.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

const ENTRY = (over = {}) => ({
  id: 'demo-tool', path: 'tools/demo-tool.sh', language: 'bash', status: 'active', superseded_by: null,
  description: 'Does the demo thing', need: 'Doing the demo thing when a demo is needed.', not_for: null, tag: null,
  invoke: 'bash tools/demo-tool.sh', verify: 'bash tools/demo-tool.sh --verify', verify_in_ci: 'true',
  verify_skip_reason: null, deps: null, promoted_from: null, issue: null, ...over,
});

function toYaml(entries, head = `total_tools: ${entries.length}\n\ntools:\n`) {
  const q = (v) => (v === null || v === undefined ? 'null' : `"${String(v).replace(/"/g, '\\"')}"`);
  return head + entries.map((e) => {
    const keys = Object.keys(e);
    return keys.map((k, i) => `${i === 0 ? '  - ' : '    '}${k}: ${q(e[k])}`).join('\n');
  }).join('\n') + '\n';
}

function tree(entries, files = entries.map((e) => e.path)) {
  const root = mkdtempSync(join(tmpdir(), 'tools-registry-'));
  mkdirSync(join(root, 'tools'), { recursive: true });
  for (const f of files) writeFileSync(join(root, f), '#!/usr/bin/env bash\necho ok\n');
  writeFileSync(join(root, REGISTRY_PATH), toYaml(entries));
  return root;
}

test('parseRegistry: one-line fields, quotes stripped, null literal, comments and blanks ignored', () => {
  const text = '# comment\ntotal_tools: 1\n\ntools:\n  - id: a-tool\n    path: "tools/a-tool.sh"\n    need: \'Doing a: thing.\'\n    deps: null\n';
  const { entries: [e], declaredTotal } = parseRegistry(text);
  assert.deepEqual(e, { id: 'a-tool', path: 'tools/a-tool.sh', need: 'Doing a: thing.', deps: null });
  assert.equal(declaredTotal, '1');
  assert.equal(parseRegistry('tools:\n  - id: a\n').declaredTotal, null, 'an absent total is null, for the schema to refuse');
});

test('total_tools is read, not skipped: absent or unequal to the row count is a schema error', () => {
  assert.deepEqual(schemaErrors([ENTRY()], '1'), []);
  assert.match(schemaErrors([ENTRY()], null).join('\n'), /`total_tools` is missing/);
  assert.match(schemaErrors([ENTRY()], '2').join('\n'), /`total_tools` is 2 but the list carries 1 row/);
  assert.throws(() => parseRegistry('total_skills: 1\ntools:\n  - id: a\n'), /unknown top-level key `total_skills`/);
});

test('parseRegistry refuses what it does not read: block scalars, nesting, unknown fields, a doubled field, no list', () => {
  assert.throws(() => parseRegistry('tools:\n  - id: a\n    need: >-\n      folded\n'), /block scalars are refused/);
  assert.throws(() => parseRegistry('tools:\n  - id: a\n    extra:\n      nested: 1\n'), /unknown field `extra`/);
  assert.throws(() => parseRegistry('tools:\n  - id: a\n      deep: 1\n'), /not a one-line field/);
  assert.throws(() => parseRegistry('tools:\n  - id: a\n    id: b\n'), /given twice/);
  assert.throws(() => parseRegistry('total_tools: 0\n'), /no `tools:` list/);
});

test('schemaErrors: every rule fires by name, and a clean entry has none', () => {
  assert.deepEqual(schemaErrors([ENTRY()]), []);
  const msgs = (over) => schemaErrors([ENTRY(over)]).join('\n');
  assert.match(msgs({ need: null }), /missing required field `need`/);
  assert.match(msgs({ id: 'Demo_Tool' }), /not kebab-case/);
  assert.match(msgs({ path: 'scripts/demo-tool.sh' }), /does not start with `tools\/`/);
  assert.match(msgs({ id: 'other', path: 'tools/demo-tool.sh' }), /id does not equal the filename stem/);
  assert.match(msgs({ language: 'perl' }), /language `perl`/);
  assert.match(msgs({ status: 'retired' }), /status `retired`/);
  assert.match(msgs({ status: 'deprecated' }), /deprecated without `superseded_by`/);
  assert.match(msgs({ status: 'deprecated', superseded_by: 'nobody' }), /superseded_by `nobody` names no entry/);
  assert.match(msgs({ tag: 'misc' }), /tag `misc`/);
  assert.match(msgs({ tag: 'review' }), /tag `review` covers one tool/);
  assert.match(msgs({ verify_in_ci: 'yes' }), /verify_in_ci must be true or false/);
  assert.match(msgs({ verify_in_ci: 'false' }), /without `verify_skip_reason`/);
  assert.match(msgs({ verify_skip_reason: 'x' }), /verify_skip_reason given while verify_in_ci is true/);
  assert.match(msgs({ verify: 'bash somewhere/else.sh --verify' }), /verify command names neither `tools\/demo-tool.sh` nor `demo-tool`/);
  assert.deepEqual(schemaErrors([ENTRY({ verify: 'node --test scripts/test/demo-tool.test.js' })]), [], 'a node:test suite named by the id is a self-test');
  assert.match(msgs({ need: 'no full stop' }), /need must be one sentence/);
  assert.match(schemaErrors([ENTRY(), ENTRY()]).join('\n'), /duplicate id/);
  assert.deepEqual(schemaErrors([ENTRY({ tag: 'review' }), ENTRY({ id: 'other-tool', path: 'tools/other-tool.sh', verify: 'bash tools/other-tool.sh --verify', tag: 'review' })]), [], 'a tag covering two tools is a class');
});

test('checkParity reports the two directions as two lists, and README.md, fixtures/ and the registry itself are not tools', (t) => {
  const root = tree([ENTRY(), ENTRY({ id: 'ghost', path: 'tools/ghost.sh', verify: 'bash tools/ghost.sh --verify' })], ['tools/demo-tool.sh', 'tools/stray.py']);
  t.after(() => rmTree(root));
  writeFileSync(join(root, 'tools/README.md'), '# not a tool\n');
  mkdirSync(join(root, 'tools/fixtures'));
  writeFileSync(join(root, 'tools/fixtures/f.json'), '{}');
  const { fileWithoutRow, rowWithoutFile } = checkParity(root, parseRegistry(toYaml([ENTRY(), ENTRY({ id: 'ghost', path: 'tools/ghost.sh' })])).entries);
  assert.deepEqual(fileWithoutRow, ['tools/stray.py']);
  assert.deepEqual(rowWithoutFile, ['tools/ghost.sh']);
});

test('renderClaudeBlock: need-first lines, not_for as a suffix, grouped review → translation → measurement → untagged, deprecated rows skipped and counted', () => {
  const entries = [
    ENTRY({ id: 'z-untagged', path: 'tools/z-untagged.sh', verify: 'bash tools/z-untagged.sh --verify', need: 'Doing the untagged thing.' }),
    ENTRY({ id: 'a-review', path: 'tools/a-review.sh', verify: 'bash tools/a-review.sh --verify', tag: 'review', need: 'Reviewing a thing.', not_for: 'the other thing' }),
    ENTRY({ id: 'b-review', path: 'tools/b-review.sh', verify: 'bash tools/b-review.sh --verify', tag: 'review', need: 'Reviewing another thing.' }),
    ENTRY({ id: 'old-tool', path: 'tools/old-tool.sh', verify: 'bash tools/old-tool.sh --verify', status: 'deprecated', superseded_by: 'a-review', need: 'Doing it the old way.' }),
  ];
  assert.deepEqual(schemaErrors(entries), []);
  const block = renderClaudeBlock(entries);
  const lines = block.split('\n').filter((l) => l.startsWith('- '));
  assert.deepEqual(lines, [
    '- Reviewing a thing (not for the other thing) → `tools/a-review.sh`',
    '- Reviewing another thing → `tools/b-review.sh`',
    '- Doing the untagged thing → `tools/z-untagged.sh`',
  ]);
  assert.match(block, /catalogues 3 operator utilities/);
  assert.match(block, /1 deprecated tool\(s\)/);
  assert.match(block, /Read this list before writing a helper/);
  assert.ok(!block.includes('old-tool'), 'a deprecated tool is not recommended');
});

test('renderReadmeTable: one row per entry including deprecated ones with their successor; no check counts anywhere', () => {
  const entries = [ENTRY(), ENTRY({ id: 'old-tool', path: 'tools/old-tool.sh', verify: 'bash tools/old-tool.sh --verify', status: 'deprecated', superseded_by: 'demo-tool' })];
  const table = renderReadmeTable(entries);
  assert.match(table, /\| `demo-tool.sh` \| bash \| Does the demo thing \| `bash tools\/demo-tool.sh --verify` \|/);
  assert.match(table, /`old-tool.sh` \| bash \| Does the demo thing — \*\*deprecated\*\*, use `demo-tool`/);
  assert.match(table, /Edit the registry, not this table/);
});

test('the CLI: exit 0 on a clean tree, 1 naming each defect, 2 when the registry cannot be read; --verify runs and skips by the registry', (t) => {
  const quiet = { log() {}, error() {} };
  const good = tree([ENTRY()]);
  t.after(() => rmTree(good));
  assert.equal(checkMain([], quiet, good), 0);
  const out = [];
  const capture = { log(s) { out.push(String(s)); }, error(s) { out.push(String(s)); } };
  const bad = tree([ENTRY(), ENTRY({ id: 'ghost', path: 'tools/ghost.sh', verify: 'bash tools/ghost.sh --verify' })], ['tools/demo-tool.sh', 'tools/stray.py']);
  t.after(() => rmTree(bad));
  assert.equal(checkMain([], capture, bad), 1);
  assert.match(out.join('\n'), /FAIL: file without row: tools\/stray.py/);
  assert.match(out.join('\n'), /FAIL: row without file: tools\/ghost.sh/);
  const broken = mkdtempSync(join(tmpdir(), 'tools-registry-broken-'));
  t.after(() => rmTree(broken));
  mkdirSync(join(broken, 'tools'));
  writeFileSync(join(broken, REGISTRY_PATH), 'tools:\n  - id: a\n    need: >-\n      folded\n');
  assert.equal(checkMain([], quiet, broken), 2, 'an unreadable registry is exit 2, never a pass');
  out.length = 0;
  writeFileSync(join(good, REGISTRY_PATH), toYaml([ENTRY()], 'total_tools: 7\n\ntools:\n'));
  assert.equal(checkMain([], capture, good), 1, 'a wrong total is a schema failure, exit 1');
  assert.match(out.join('\n'), /FAIL: schema: registry: `total_tools` is 7 but the list carries 1 row/);
  writeFileSync(join(good, REGISTRY_PATH), toYaml([ENTRY()]));
  assert.equal(checkMain(['--bogus'], quiet, good), 2);
  // --verify: the run function is injected; one row runs, one is skipped with its reason printed.
  const two = tree([ENTRY(), ENTRY({ id: 'net-tool', path: 'tools/net-tool.sh', verify: 'bash tools/net-tool.sh --verify', verify_in_ci: 'false', verify_skip_reason: 'needs the network' })]);
  t.after(() => rmTree(two));
  const ran = [];
  const fakeRun = (cmd, args) => { ran.push(args[1]); return { status: 0, stdout: '', stderr: '' }; };
  out.length = 0;
  assert.equal(checkMain(['--verify'], capture, two, fakeRun), 0);
  assert.deepEqual(ran, ['bash tools/demo-tool.sh --verify']);
  assert.match(out.join('\n'), /verify: 1 self-test\(s\) run, 1 skipped: net-tool: needs the network/);
  const failingRun = () => ({ status: 3, stdout: 'boom', stderr: '' });
  out.length = 0;
  assert.equal(checkMain(['--verify'], capture, two, failingRun), 1);
  assert.match(out.join('\n'), /FAIL: demo-tool: `bash tools\/demo-tool.sh --verify` exit 3/);
});

test('the real catalogue passes its own gate, and its rendered index names every active tool by need', () => {
  const reg = loadRegistry(REPO);
  assert.deepEqual(reg.errors, []);
  assert.deepEqual(reg.fileWithoutRow, []);
  assert.deepEqual(reg.rowWithoutFile, []);
  assert.ok(reg.entries.length >= 10, `expected at least the ten tools of 2026-09-08, got ${reg.entries.length}`);
  const block = renderClaudeBlock(reg.entries);
  for (const e of reg.entries.filter((x) => x.status === 'active')) {
    assert.ok(block.includes(`→ \`${e.path}\``), `${e.path} is in the index`);
    assert.ok(block.includes(e.need.replace(/[.]$/, '')), `${e.id}'s need line is rendered verbatim`);
  }
  assert.ok(!/\b\d+ checks\b/.test(block), 'no check count lives in the index');
});
