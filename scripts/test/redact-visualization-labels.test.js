/**
 * The position labels `redact-visualization-for-disclosure` Step 3 quotes are labels the tool
 * emits (#901).
 *
 * Step 3 quoted `attr:data-id[0]`, a label the tool prints at no first-parent commit of main.
 * The quote was written in bc555903c, the only revision of `tools/redact-artifact.py` in main's
 * history that numbered attributes per tag from 0, and two later commits in the same PR (#867)
 * replaced that numbering before it merged: 026ce8873 numbered attributes across the document
 * from 1, still apart from text, and 58e09c8eb put text and attribute labels on one counter
 * across the whole document, incremented before each label, so the smallest index is 1.
 * Nothing caught the drift because the only `--verify` arm about attribute ordinals asserts that
 * two labels differ, not where numbering starts, and no check compared the labels the skill
 * quotes with what the tool prints: the gates that read every SKILL.md, such as the
 * path-reference check in `validate:integrity`, never run the tool.
 *
 * The pin lives here rather than in the tool's `--verify` because the decision on #901 kept
 * the tool unedited. What is pinned is the PAIRING the skill publishes: the fixture it quotes
 * and the labels it says that fixture produces. The tool is run as an operator runs it, through
 * the CLI, never by importing a helper, so a label the CLI does not print cannot pass.
 *
 * python3 is required, never skipped: `ci-scripts.yml` installs it for exactly this kind of
 * suite, and a skip would turn a missing interpreter into a green job.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { rmTree } from './_tmp.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SKILL = 'skills/redact-visualization-for-disclosure/SKILL.md';
const TOOL = join(REPO, 'tools', 'redact-artifact.py');

// The fixture the skill quotes beside its labels. The term is spelled with a character
// reference so the whole-text tier cannot see it and the structure tier — the one that reports
// positions — is what answers.
const FIXTURE = '<div data-id="acme&#95;secret">acme&#95;secret</div>';
const TERM = 'acme_secret';

// A literal label: a class name, an optional `:<attribute>`, and a DIGIT index. The shape
// `attr:<name>[N]` deliberately does not match, so describing the shape is never mistaken for
// quoting a number.
const LABEL = /`((?:attr:[A-Za-z_][\w.:-]*|[a-z][a-z-]*)\[\d+\])`/g;

function step3() {
  const text = readFileSync(join(REPO, SKILL), 'utf8');
  const start = text.indexOf('### Step 3');
  const end = text.indexOf('### Step 4');
  assert.ok(start >= 0 && end > start, `${SKILL}: could not find the Step 3 section`);
  return text.slice(start, end);
}

function quotedLabels() {
  return [...step3().matchAll(LABEL)].map((m) => m[1]);
}

function runTool() {
  const dir = mkdtempSync(join(tmpdir(), 'redact-viz-labels-'));
  try {
    writeFileSync(join(dir, 'map.tsv'), `${TERM}\t[secret]\n`);
    writeFileSync(join(dir, 'leak.html'), `${FIXTURE}\n`);
    const res = spawnSync(
      'python3',
      [TOOL, '--type', 'html', '--assert-only', '--mapping', join(dir, 'map.tsv'), join(dir, 'leak.html')],
      { encoding: 'utf8', env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } },
    );
    assert.ok(!res.error, `python3 could not be run (${res.error && res.error.code}); this suite refuses to skip`);
    return res;
  } finally {
    rmTree(dir);
  }
}

test('Step 3 quotes the fixture its labels are measured on', () => {
  assert.ok(
    step3().includes(`\`${FIXTURE}\``),
    `${SKILL} Step 3 does not quote ${FIXTURE}; a label quoted without the input that produces it cannot be checked`,
  );
});

test('every literal label Step 3 quotes is one the tool prints for that fixture', () => {
  const labels = quotedLabels();
  // A floor, so a regex that matches nothing cannot pass vacuously: the skill quotes one text
  // label and one attribute label.
  assert.ok(labels.length >= 2, `expected at least 2 literal labels in Step 3, found ${JSON.stringify(labels)}`);
  const res = runTool();
  assert.equal(res.status, 1, `expected exit 1 (a finding) on the fixture; stderr:\n${res.stderr}`);
  const out = res.stdout + res.stderr;
  for (const label of labels) {
    assert.ok(
      out.includes(`${label}:${TERM}`),
      `Step 3 quotes \`${label}\`, which the tool does not print for ${FIXTURE}. Tool said:\n${out}`,
    );
  }
});
