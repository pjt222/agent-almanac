/**
 * tools-registry.test.js — the reader, the schema, the parity check and the two renderings.
 *
 * The property this file pins: a session that has forgotten a tool's NAME can still find it by
 * NEED in CLAUDE.md, and the catalogue cannot drift from disk in any of three directions without
 * a named failure. Every fixture is a temp tree, so the live registry is exercised only by the
 * last test (which asserts the real catalogue passes its own gate — the negative arm over the
 * real corpus pins the corpus, the temp trees pin the gate).
 *
 * Every schema rule is asserted through a regex UNIQUE to its message, so deleting the rule
 * turns exactly its assertion red (round-1 review of #807 found the tag-membership assertion
 * matched the covers-one-tool message too, and would have stayed green with the rule deleted).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { rmTree } from './_tmp.js';
import {
  REGISTRY_PATH, TAGS, parseRegistry, schemaErrors, checkParity, loadRegistry, renderClaudeBlock, renderReadmeTable,
} from '../lib/tools-registry.js';
import { main as checkMain } from '../check-tools-registry.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

const ENTRY = (over = {}) => ({
  id: 'demo-tool', path: 'tools/demo-tool.sh', language: 'bash', status: 'active', superseded_by: null,
  description: 'Does the demo thing', need: 'Doing the demo thing when a demo is needed.', not_for: null, tag: null,
  invoke: 'bash tools/demo-tool.sh', verify: 'bash tools/demo-tool.sh --verify', verify_in_ci: 'true',
  verify_skip_reason: null, deps: null, promoted_from: null, issue: null, ...over,
});
/** A second, distinct valid entry. */
const OTHER = (over = {}) => ENTRY({ id: 'other-tool', path: 'tools/other-tool.sh', verify: 'bash tools/other-tool.sh --verify', ...over });

function toYaml(entries, head = `total_tools: ${entries.length}\n\ntools:\n`) {
  // The registry format has no escape syntax (the reader refuses one), so this writer refuses a
  // value it could not represent instead of escaping it -- an escape here would be a fixture the
  // real file cannot carry.
  const q = (v) => {
    if (v === null || v === undefined) return 'null';
    const s = String(v);
    if (/["\\\n]/.test(s)) throw new Error(`fixture value cannot carry a double quote, backslash or newline: ${s}`);
    return `"${s}"`;
  };
  return head + entries.map((e) => {
    const keys = Object.keys(e);
    return keys.map((k, i) => `${i === 0 ? '  - ' : '    '}${k}: ${q(e[k])}`).join('\n');
  }).join('\n') + '\n';
}

test('the fixture writer refuses a value the registry format cannot carry, instead of escaping it', () => {
  assert.throws(() => toYaml([ENTRY({ description: 'a "b"' })]), /cannot carry a double quote, backslash or newline/);
  assert.throws(() => toYaml([ENTRY({ description: 'a \\ b' })]), /cannot carry/);
  assert.throws(() => toYaml([ENTRY({ description: 'a\nb' })]), /cannot carry/);
});

function tree(entries, files = entries.map((e) => e.path)) {
  const root = mkdtempSync(join(tmpdir(), 'tools-registry-'));
  mkdirSync(join(root, 'tools'), { recursive: true });
  for (const f of files) writeFileSync(join(root, f), '#!/usr/bin/env bash\necho ok\n');
  writeFileSync(join(root, REGISTRY_PATH), toYaml(entries));
  return root;
}

test('parseRegistry: one-line fields, quotes stripped, null literal, comments and blanks ignored, the total read', () => {
  const text = '# comment\ntotal_tools: 1\n\ntools:\n  - id: a-tool\n    path: "tools/a-tool.sh"\n    need: \'Doing a: thing.\'\n    deps: null\n';
  const { entries: [e], declaredTotal } = parseRegistry(text);
  assert.deepEqual(e, { id: 'a-tool', path: 'tools/a-tool.sh', need: 'Doing a: thing.', deps: null });
  assert.equal(declaredTotal, '1');
  assert.equal(parseRegistry('tools:\n  - id: a\n').declaredTotal, null, 'an absent total is null, for the schema to refuse');
});

test('parseRegistry refuses what it does not read: block scalars, nesting, unknown fields, a doubled field, an unknown top-level key, no list', () => {
  assert.throws(() => parseRegistry('tools:\n  - id: a\n    need: >-\n      folded\n'), /block scalars are refused/);
  assert.throws(() => parseRegistry('tools:\n  - id: a\n    extra:\n      nested: 1\n'), /unknown field `extra`/);
  assert.throws(() => parseRegistry('tools:\n  - id: a\n      deep: 1\n'), /not a one-line field/);
  assert.throws(() => parseRegistry('tools:\n  - id: a\n    id: b\n'), /given twice/);
  assert.throws(() => parseRegistry('total_skills: 1\ntools:\n  - id: a\n'), /unknown top-level key `total_skills`/);
  assert.throws(() => parseRegistry('total_tools: 0\n'), /no `tools:` list/);
});

test('parseRegistry refuses what YAML would decode and this reader would keep verbatim: escapes inside quotes, an inline comment on an unquoted value', () => {
  assert.throws(() => parseRegistry('tools:\n  - id: a\n    need: "Doing \\"x\\" things."\n'), /_registry.yml:3: a backslash or a double quote inside a double-quoted value/);
  assert.throws(() => parseRegistry('tools:\n  - id: a\n    description: "a" and "b"\n'), /_registry.yml:3: a backslash or a double quote inside a double-quoted value/, 'first and last quote matching is not the same as being quoted');
  assert.throws(() => parseRegistry("tools:\n  - id: a\n    need: 'Doing ''x'' things.'\n"), /_registry.yml:3: a single quote inside a single-quoted value/);
  assert.throws(() => parseRegistry('tools:\n  - id: a\n    deps: gh # the CLI\n'), /_registry.yml:3: an inline ` #` on an unquoted value/);
  assert.throws(() => parseRegistry('total_tools: 10 # ten\ntools:\n  - id: a\n'), /_registry.yml:1: an inline ` #` on an unquoted value/, 'the total carries its line number like every field');
  assert.equal(parseRegistry(`tools:\n  - id: a\n    need: "It's fine."\n`).entries[0].need, "It's fine.", 'an apostrophe inside double quotes needs no escape');
  assert.equal(parseRegistry(`tools:\n  - id: a\n    need: 'Say "hi".'\n`).entries[0].need, 'Say "hi".', 'a double quote inside single quotes needs no escape');
  assert.equal(parseRegistry(`tools:\n  - id: a\n    issue: "#751"\n`).entries[0].issue, '#751', 'a # inside quotes is a value');
});

test('schemaErrors: every rule fires by a message unique to it, and a clean entry has none', () => {
  assert.deepEqual(schemaErrors([ENTRY()]), []);
  const msgs = (over) => schemaErrors([ENTRY(over)]).join('\n');
  assert.match(msgs({ need: null }), /missing required field `need`/);
  assert.match(msgs({ id: 'Demo_Tool' }), /id is not kebab-case/);
  assert.match(msgs({ path: 'scripts/demo-tool.sh' }), /path does not start with `tools\/`/);
  assert.match(msgs({ id: 'other', path: 'tools/demo-tool.sh' }), /id does not equal the filename stem/);
  assert.match(msgs({ language: 'perl' }), /language `perl` is not one of bash\|python\|node/);
  assert.match(msgs({ status: 'retired' }), /status `retired` is not one of active\|deprecated/);
  assert.match(msgs({ status: 'deprecated' }), /deprecated without `superseded_by`/);
  assert.match(msgs({ superseded_by: 'other-tool' }), /active with a `superseded_by`/);
  assert.match(msgs({ tag: 'misc' }), /tag `misc` is not one of review\|translation\|measurement/);
  assert.match(msgs({ tag: 'review' }), /tag `review` covers one tool/);
  assert.match(msgs({ verify_in_ci: 'yes' }), /verify_in_ci must be true or false/);
  assert.match(msgs({ verify_in_ci: 'false' }), /verify_in_ci is false without `verify_skip_reason`/);
  assert.match(msgs({ verify_skip_reason: 'x' }), /verify_skip_reason given while verify_in_ci is true/);
  assert.match(msgs({ verify: 'bash somewhere/else.sh --verify' }), /verify command names neither `tools\/demo-tool.sh` nor `demo-tool`/);
  assert.deepEqual(schemaErrors([ENTRY({ verify: 'node --test scripts/test/demo-tool.test.js' })]), [], 'a node:test suite named by the id is a self-test');
  assert.match(msgs({ need: 'no full stop' }), /need must be one sentence ending in a full stop/);
  assert.match(msgs({ need: 'A question?' }), /need must be one sentence ending in a full stop/, 'only a full stop: the renderer strips exactly that');
  assert.match(schemaErrors([ENTRY(), ENTRY()]).join('\n'), /duplicate id/);
  assert.deepEqual(schemaErrors([ENTRY({ tag: 'review' }), OTHER({ tag: 'review' })]), [], 'a tag covering two tools is a class');
});

test('schemaErrors: superseded_by must name another entry that is itself active', () => {
  assert.deepEqual(schemaErrors([ENTRY({ status: 'deprecated', superseded_by: 'other-tool' }), OTHER()]), []);
  assert.match(schemaErrors([ENTRY({ status: 'deprecated', superseded_by: 'demo-tool' })]).join('\n'), /superseded_by names itself/);
  assert.match(schemaErrors([ENTRY({ status: 'deprecated', superseded_by: 'nobody' })]).join('\n'), /superseded_by `nobody` names no entry/);
  assert.match(
    schemaErrors([ENTRY({ status: 'deprecated', superseded_by: 'other-tool' }), OTHER({ status: 'deprecated', superseded_by: 'third-tool' }), ENTRY({ id: 'third-tool', path: 'tools/third-tool.sh', verify: 'bash tools/third-tool.sh --verify' })]).join('\n'),
    /demo-tool: superseded_by `other-tool` is not active; name the live successor/,
    'a chain into a deprecated row defeats "a reader of an old handoff finds the successor"',
  );
});

test('total_tools is read, not skipped: absent or unequal to the row count is a schema error', () => {
  assert.deepEqual(schemaErrors([ENTRY()], '1'), []);
  assert.match(schemaErrors([ENTRY()], null).join('\n'), /`total_tools` is missing/);
  assert.match(schemaErrors([ENTRY()], '2').join('\n'), /`total_tools` is 2 but the list carries 1 row/);
});

test('checkParity reports three directions as three lists; README.md, fixtures/ and the registry itself are not tools; a subdirectory or a broken symlink is the third direction', (t) => {
  const root = tree([ENTRY(), ENTRY({ id: 'ghost', path: 'tools/ghost.sh', verify: 'bash tools/ghost.sh --verify' })], ['tools/demo-tool.sh', 'tools/stray.py']);
  t.after(() => rmTree(root));
  writeFileSync(join(root, 'tools/README.md'), '# not a tool\n');
  mkdirSync(join(root, 'tools/fixtures'));
  writeFileSync(join(root, 'tools/fixtures/f.json'), '{}');
  mkdirSync(join(root, 'tools/hermes'));
  writeFileSync(join(root, 'tools/hermes/validate.py'), 'print(1)\n');
  symlinkSync('/nonexistent/target', join(root, 'tools/dangling.sh'));
  const { fileWithoutRow, rowWithoutFile, notPlainFile } = checkParity(root, parseRegistry(toYaml([ENTRY(), ENTRY({ id: 'ghost', path: 'tools/ghost.sh' }), ENTRY({ id: 'dangling', path: 'tools/dangling.sh' })])).entries);
  assert.deepEqual(fileWithoutRow, ['tools/stray.py']);
  assert.deepEqual(rowWithoutFile, ['tools/ghost.sh'], 'a row naming the symlink is reported under notPlainFile alone, not also as "not on disk"');
  assert.deepEqual(notPlainFile, ['tools/dangling.sh', 'tools/hermes'], 'a tool in a subdirectory is representable by no row, so it must be reported, not dropped');
});

test('renderClaudeBlock: need-first lines, not_for as a suffix, every TAGS group in order then untagged, deprecated rows skipped and counted', () => {
  const entries = [
    ENTRY({ id: 'z-untagged', path: 'tools/z-untagged.sh', verify: 'bash tools/z-untagged.sh --verify', need: 'Doing the untagged thing.' }),
    ENTRY({ id: 'a-measure', path: 'tools/a-measure.sh', verify: 'bash tools/a-measure.sh --verify', tag: 'measurement', need: 'Measuring a thing.' }),
    ENTRY({ id: 'b-measure', path: 'tools/b-measure.sh', verify: 'bash tools/b-measure.sh --verify', tag: 'measurement', need: 'Measuring another thing.' }),
    ENTRY({ id: 'a-translate', path: 'tools/a-translate.sh', verify: 'bash tools/a-translate.sh --verify', tag: 'translation', need: 'Translating a thing.' }),
    ENTRY({ id: 'b-translate', path: 'tools/b-translate.sh', verify: 'bash tools/b-translate.sh --verify', tag: 'translation', need: 'Translating another thing.' }),
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
    '- Translating a thing → `tools/a-translate.sh`',
    '- Translating another thing → `tools/b-translate.sh`',
    '- Measuring a thing → `tools/a-measure.sh`',
    '- Measuring another thing → `tools/b-measure.sh`',
    '- Doing the untagged thing → `tools/z-untagged.sh`',
  ]);
  assert.deepEqual([...TAGS], ['review', 'translation', 'measurement'], 'the group order above IS the TAGS order; change both or neither');
  assert.match(block, /catalogues 7 operator utilities/);
  assert.match(block, /1 deprecated tool\(s\)/);
  assert.match(block, /Read this list before writing a helper/);
  assert.ok(!block.includes('old-tool'), 'a deprecated tool is not recommended');
  assert.throws(() => renderClaudeBlock([ENTRY({ tag: 'misc' })]), /rendered 0 of 1 active tools/, 'a tag outside TAGS cannot vanish from the index silently');
});

test('renderReadmeTable: one row per entry including deprecated ones with their successor; a | and a backslash in a cell are escaped, backslash first; no check counts anywhere', () => {
  const entries = [ENTRY({ description: 'Does a | b \\ c' }), ENTRY({ id: 'old-tool', path: 'tools/old-tool.sh', verify: 'bash tools/old-tool.sh --verify', status: 'deprecated', superseded_by: 'demo-tool' })];
  const table = renderReadmeTable(entries);
  // Backslash-first is verified by this assertion, not by a mutant: mutation-check deletes lines,
  // and the two replace() calls share one line. Swapping them yields `\\|` for the pipe, which
  // the next assertion rejects (round-2 N5).
  assert.match(table, /\| `demo-tool.sh` \| bash \| Does a \\\| b \\\\ c \| `bash tools\/demo-tool.sh --verify` \|/);
  assert.ok(!table.includes('\\\\|'), 'escaping the pipe after the backslash must not turn an escaped backslash into an escaped pipe');
  assert.match(table, /`old-tool.sh` \| bash \| Does the demo thing — \*\*deprecated\*\*, use `demo-tool`/);
  assert.match(table, /Edit the registry, not this table/);
  const cells = table.split('\n').filter((l) => l.startsWith('| `')).map((l) => l.split(/(?<!\\)\|/).length);
  assert.deepEqual(cells, [6, 6], 'every row has four cells (six segments) after escaping');
});

test('the CLI: exit 0 on a clean tree, 1 naming each defect, 2 when the registry cannot be read; exactly one OK: line, last, only when clean; --verify runs and skips by the registry', (t) => {
  const quiet = { log() {}, error() {} };
  const out = [];
  const capture = { log(s) { out.push(String(s)); }, error(s) { out.push(String(s)); } };
  const okLines = () => out.join('\n').split('\n').filter((l) => l.startsWith('OK:'));

  const good = tree([ENTRY()]);
  t.after(() => rmTree(good));
  assert.equal(checkMain([], capture, good), 0);
  assert.equal(okLines().length, 1);
  assert.match(out.at(-1), /^OK: 1 row\(s\) \(1 active\) against 1 plain file\(s\) under tools\/, three directions$/);

  out.length = 0;
  const bad = tree([ENTRY(), ENTRY({ id: 'ghost', path: 'tools/ghost.sh', verify: 'bash tools/ghost.sh --verify' })], ['tools/demo-tool.sh', 'tools/stray.py']);
  t.after(() => rmTree(bad));
  mkdirSync(join(bad, 'tools/sub'));
  assert.equal(checkMain([], capture, bad), 1);
  assert.match(out.join('\n'), /FAIL: file without row: tools\/stray.py/);
  assert.match(out.join('\n'), /FAIL: row without file: tools\/ghost.sh/);
  assert.match(out.join('\n'), /FAIL: not a plain file under tools\/: tools\/sub/);
  assert.equal(okLines().length, 0, 'no OK: line on a failing run');
  assert.match(out.at(-1), /^FAIL: 2 row\(s\)/);

  const broken = mkdtempSync(join(tmpdir(), 'tools-registry-broken-'));
  t.after(() => rmTree(broken));
  mkdirSync(join(broken, 'tools'));
  writeFileSync(join(broken, REGISTRY_PATH), 'tools:\n  - id: a\n    need: >-\n      folded\n');
  assert.equal(checkMain([], quiet, broken), 2, 'an unreadable registry is exit 2, never a pass');
  assert.equal(checkMain(['--bogus'], quiet, good), 2);

  out.length = 0;
  writeFileSync(join(good, REGISTRY_PATH), toYaml([ENTRY()], 'total_tools: 7\n\ntools:\n'));
  assert.equal(checkMain([], capture, good), 1, 'a wrong total is a schema failure, exit 1');
  assert.match(out.join('\n'), /FAIL: schema: registry: `total_tools` is 7 but the list carries 1 row/);
  writeFileSync(join(good, REGISTRY_PATH), toYaml([ENTRY()]));

  // --verify: the run function is injected; one row runs, one is skipped with its reason printed.
  const two = tree([ENTRY(), ENTRY({ id: 'net-tool', path: 'tools/net-tool.sh', verify: 'bash tools/net-tool.sh --verify', verify_in_ci: 'false', verify_skip_reason: 'needs the network' })]);
  t.after(() => rmTree(two));
  const ran = [];
  const fakeRun = (cmd, args) => { ran.push(args[1]); return { status: 0, stdout: '', stderr: '' }; };
  out.length = 0;
  assert.equal(checkMain(['--verify'], capture, two, fakeRun), 0);
  assert.deepEqual(ran, ['bash tools/demo-tool.sh --verify']);
  assert.match(out.join('\n'), /PASS: demo-tool: `bash tools\/demo-tool.sh --verify` exit 0/);
  assert.match(out.join('\n'), /verify: 1 self-test\(s\) run, 1 skipped: net-tool: needs the network/);
  assert.equal(okLines().length, 1, 'one OK: line on a clean --verify run');
  assert.match(out.at(-1), /^OK: 2 row\(s\) .*; 1 self-test\(s\) run$/);

  // The failing self-test's own output carries an `OK:` line, which is exactly where the
  // one-OK:-line contract would break if the echo were unprefixed (round-2 S1).
  const failingRun = () => ({ status: 3, stdout: 'OK: something the tool printed\nboom', stderr: 'warn' });
  out.length = 0;
  assert.equal(checkMain(['--verify'], capture, two, failingRun), 1);
  assert.match(out.join('\n'), /FAIL: demo-tool: `bash tools\/demo-tool.sh --verify` exit 3\n    \| OK: something the tool printed\n    \| boomwarn/);
  assert.equal(okLines().length, 0, 'a failing self-test leaves no OK: line anywhere, even when the self-test printed one (round-1 S2, round-2 S1)');
  assert.match(out.at(-1), /^FAIL: 2 row\(s\)/);
});

test('the real catalogue passes its own gate, and its rendered index names every active tool by need', () => {
  const reg = loadRegistry(REPO);
  assert.deepEqual(reg.errors, []);
  assert.deepEqual(reg.fileWithoutRow, []);
  assert.deepEqual(reg.rowWithoutFile, []);
  assert.deepEqual(reg.notPlainFile, []);
  assert.ok(reg.entries.length >= 10, `expected at least the ten tools of 2026-09-08, got ${reg.entries.length}`);
  const block = renderClaudeBlock(reg.entries);
  for (const e of reg.entries.filter((x) => x.status === 'active')) {
    assert.ok(block.includes(`→ \`${e.path}\``), `${e.path} is in the index`);
    assert.ok(block.includes(e.need.replace(/\.$/, '')), `${e.id}'s need line is rendered verbatim`);
  }
  assert.ok(!/\b\d+ checks\b/.test(block), 'no check count lives in the index');
});
