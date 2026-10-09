/**
 * Executable coverage for the suppression-block read that `run-copilot-review-loop` Step 8 ships (#916).
 *
 * Copilot can list findings in a collapsed `<details>` block that attaches no review comment, so
 * neither its headline nor the unresolved-thread query sees them. Step 8's second command is the
 * only thing in the skill that reads that block, and it is a shell block in a markdown file: no
 * gate executed it, so a regression in it would have stayed green everywhere. This file extracts
 * the block and RUNS it, with `gh` and `git` replaced by shims that serve review JSON built here.
 *
 * Every body below is built by construction, shaped on the real ones (a `**path:line**` header per
 * entry, code quoted in unlabelled column-0 fences, CR line endings on some), so each case's answer
 * is known without a network. What is asserted:
 *
 *   - the right review is read: the bot's, on HEAD, and an absent one is refused (exit 1), never
 *     read as "no block";
 *   - the block's end: a column-0 `</details>` outside a ``` fence, and not one quoted inside a
 *     fence or mentioned mid-line, which is how entries quote reviewed code and prose;
 *   - the count check: when the entry headers printed fall short of the summary's (N), the read
 *     exits 1 and says so, rather than handing back a partial block at exit 0.
 *
 * Each case runs under every distinct awk on PATH among `awk`, `gawk` and `mawk`, because the
 * skill is pasted on machines whose `awk` is either. The suite refuses rather than skips when bash,
 * jq or awk is missing, so an image change goes red instead of quiet.
 *
 * Fixtures are built with `mkdtempSync` and torn down with `rmTree` (#493, #791).
 */

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, chmodSync, mkdirSync, symlinkSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { rmTree } from './_tmp.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SKILL = 'skills/run-copilot-review-loop/SKILL.md';
const BOT = 'copilot-pull-request-reviewer[bot]';
const HEAD_SHA = 'feedc0de';

/** The block is found by what it opens with, never by fence ordinal. */
const BLOCK_OPEN = 'if BODY=$(gh api repos/OWNER/REPO/pulls/PR/reviews \\';
const REFUSAL = 'no bot review on HEAD, or the read failed — no verdict';

/** The `if … fi` block of Step 8's second command, exactly as SKILL.md ships it. */
function extractBlock() {
  const lines = readFileSync(join(REPO, SKILL), 'utf8').split('\n');
  const starts = lines.flatMap((line, i) => (line === BLOCK_OPEN ? [i] : []));
  assert.equal(
    starts.length,
    1,
    `${SKILL} carries ${starts.length} copies of the block opening ${JSON.stringify(BLOCK_OPEN)}; ` +
      'expected exactly one. If Step 8 was rewritten on purpose, update BLOCK_OPEN in the same commit.',
  );
  const end = lines.indexOf('fi', starts[0]);
  assert.ok(end > starts[0], `${SKILL}: the Step 8 block read is never closed with a bare \`fi\``);
  const block = lines.slice(starts[0], end + 1).join('\n');
  assert.match(block, /awk '/, 'the extracted block no longer pipes the body through awk');
  return block + '\n';
}

const SANDBOX = mkdtempSync(join(tmpdir(), 'copilot-block-'));
after(() => rmTree(SANDBOX));

const SHIMS = join(SANDBOX, 'shims');
mkdirSync(SHIMS);
// `gh api …/reviews` serves the case's JSON; `git rev-parse HEAD` serves HEAD_SHA. Anything else
// is a call the block was not expected to make, and fails loudly.
writeFileSync(join(SHIMS, 'gh'), '#!/bin/sh\n[ "$1" = api ] || { echo "gh shim: unexpected $*" >&2; exit 99; }\ncat "$ROW_JSON"\n');
writeFileSync(
  join(SHIMS, 'git'),
  '#!/bin/sh\n[ "$1" = rev-parse ] && [ "$2" = HEAD ] && { printf \'%s\\n\' "$ROW_SHA"; exit 0; }\n' +
    'echo "git shim: unexpected $*" >&2; exit 99\n',
);
chmodSync(join(SHIMS, 'gh'), 0o755);
chmodSync(join(SHIMS, 'git'), 0o755);

function which(name) {
  const res = spawnSync('bash', ['-c', `command -v ${name}`], { encoding: 'utf8' });
  return res.status === 0 ? res.stdout.trim() : null;
}

/** One PATH directory per distinct awk binary, each holding only an `awk` symlink to it. */
function awkDirs() {
  const seen = new Map();
  for (const name of ['awk', 'gawk', 'mawk']) {
    const found = which(name);
    if (!found) continue;
    const real = realpathSync(found);
    if (seen.has(real)) continue;
    const dir = join(SANDBOX, `awk-${seen.size}`);
    mkdirSync(dir);
    symlinkSync(real, join(dir, 'awk'));
    seen.set(real, dir);
  }
  return [...seen.entries()].map(([real, dir]) => ({ real, dir }));
}

let rowCounter = 0;
/** Run the shipped block against `reviews` (the REST array) under one awk. */
function runBlock(reviews, awk) {
  const rowJson = join(SANDBOX, `row-${rowCounter++}.json`);
  writeFileSync(rowJson, JSON.stringify(reviews));
  const env = {};
  for (const [key, value] of Object.entries(process.env)) if (!key.startsWith('GIT_')) env[key] = value;
  env.PATH = `${awk.dir}:${SHIMS}:${process.env.PATH}`;
  env.ROW_JSON = rowJson;
  env.ROW_SHA = HEAD_SHA;
  const res = spawnSync('bash', ['-c', extractBlock()], { cwd: SANDBOX, encoding: 'utf8', env });
  const headers = res.stdout.split('\n').filter((line) => /^\*\*[^*\s]+:\d+/.test(line)).map((line) => line.replace(/\r$/, ''));
  return { status: res.status, stdout: res.stdout, stderr: res.stderr, headers };
}

const bot = (body, sha = HEAD_SHA) => ({ user: { login: BOT }, commit_id: sha, state: 'COMMENTED', body });
const own = (sha = HEAD_SHA) => ({ user: { login: 'someone' }, commit_id: sha, state: 'COMMENTED', body: '' });

const OVERVIEW =
  '## Pull request overview\n\nCopilot reviewed 2 out of 2 changed files in this pull request and generated no new comments.\n\n';
const block = (summary, entries) => `<details>\n<summary>${summary}</summary>\n\n${entries}</details>\n`;
const AFTER_BLOCK = '\nAFTER-BLOCK-SENTINEL: text after the block is not an entry.\n';

const ENTRY_APP = '**src/app.js:40**\n* `fetchUser()` swallows the rejection.\n```\n  return fetchUser(id).catch(() => ({}));\n```\n';
const ENTRY_AUTH = '**src/auth.js:12**\n* The token comparison uses `==`, which is not constant-time.\n';
const ENTRY_FENCED_DETAILS =
  '**docs/faq.md:12**\n* The collapsed answer is never closed before the next heading.\n' +
  '```\n<details>\n<summary>Why?</summary>\nBecause.\n</details>\n```\n';
const ENTRY_FENCED_DETAILS_LAST = ENTRY_FENCED_DETAILS + 'TAIL-SENTINEL: close it before the install steps.\n';
const ENTRY_INLINE_DETAILS =
  '**README.md:30**\n* The install section opens a collapsible never closed with a `</details>` tag.\n';
const ENTRY_UNFENCED_DETAILS =
  '**docs/faq.md:12**\n* The answer block is closed twice; the second one ends the section:\n</details>\nso the steps render outside it.\n';

const CASES = [
  {
    name: 'a suppression block is printed entry by entry, and stops at its own </details>',
    reviews: [bot(OVERVIEW + block('Suppressed comments (2)', ENTRY_APP + ENTRY_AUTH) + AFTER_BLOCK)],
    status: 0,
    headers: ['**src/app.js:40**', '**src/auth.js:12**'],
    absent: ['AFTER-BLOCK-SENTINEL'],
  },
  {
    name: 'CR line endings read the same as LF',
    reviews: [bot((OVERVIEW + block('Suppressed comments (2)', ENTRY_APP + ENTRY_AUTH) + AFTER_BLOCK).replace(/\n/g, '\r\n'))],
    status: 0,
    headers: ['**src/app.js:40**', '**src/auth.js:12**'],
    absent: ['AFTER-BLOCK-SENTINEL'],
  },
  {
    name: 'the low-confidence wording (#221) is a suppression block too',
    reviews: [bot(OVERVIEW + block('Comments suppressed due to low confidence (1)', ENTRY_AUTH))],
    status: 0,
    headers: ['**src/auth.js:12**'],
  },
  {
    name: 'a </details> quoted inside a code fence does not end the block',
    reviews: [bot(OVERVIEW + block('Suppressed comments (2)', ENTRY_FENCED_DETAILS + ENTRY_APP) + AFTER_BLOCK)],
    status: 0,
    headers: ['**docs/faq.md:12**', '**src/app.js:40**'],
    absent: ['AFTER-BLOCK-SENTINEL'],
  },
  {
    name: 'a fenced </details> in the LAST entry keeps that entry whole',
    reviews: [bot(OVERVIEW + block('Suppressed comments (2)', ENTRY_APP + ENTRY_FENCED_DETAILS_LAST) + AFTER_BLOCK)],
    status: 0,
    headers: ['**src/app.js:40**', '**docs/faq.md:12**'],
    present: ['TAIL-SENTINEL'],
    absent: ['AFTER-BLOCK-SENTINEL'],
  },
  {
    name: 'a </details> mentioned mid-line does not end the block',
    reviews: [bot(OVERVIEW + block('Suppressed comments (2)', ENTRY_INLINE_DETAILS + ENTRY_AUTH))],
    status: 0,
    headers: ['**README.md:30**', '**src/auth.js:12**'],
  },
  {
    name: 'an unfenced column-0 </details> that cuts entries short exits 1 with the count',
    reviews: [bot(OVERVIEW + block('Suppressed comments (2)', ENTRY_UNFENCED_DETAILS + ENTRY_APP))],
    status: 1,
    headers: ['**docs/faq.md:12**'],
    stderr: /block declares 2 entries, 1 printed/,
  },
  {
    name: 'every collapsed block prints its <summary>, and only the suppression block its entries',
    reviews: [
      bot(OVERVIEW + block('Show a summary per file', '| File | Description |\n| x.js | **not/an/entry.js:1** |\n') +
        block('Suppressed comments (1)', ENTRY_AUTH)),
    ],
    status: 0,
    headers: ['**src/auth.js:12**'],
    present: ['<summary>Show a summary per file</summary>', '<summary>Suppressed comments (1)</summary>'],
    absent: ['not/an/entry.js'],
  },
  {
    name: 'a review with no block prints nothing and exits 0',
    reviews: [bot(OVERVIEW)],
    status: 0,
    headers: [],
    exactStdout: '',
  },
  {
    name: 'an empty review under another login on HEAD does not hide the bot review before it',
    reviews: [bot(OVERVIEW + block('Suppressed comments (1)', ENTRY_AUTH)), own()],
    status: 0,
    headers: ['**src/auth.js:12**'],
  },
  {
    name: 'only another login on HEAD is refused, never read as "no block"',
    reviews: [bot(OVERVIEW + block('Suppressed comments (1)', ENTRY_AUTH), 'oldsha'), own()],
    status: 1,
    headers: [],
    stderr: new RegExp(REFUSAL),
  },
  {
    name: 'no bot review on HEAD is refused, never read as "no block"',
    reviews: [bot(OVERVIEW + block('Suppressed comments (1)', ENTRY_AUTH), 'oldsha')],
    status: 1,
    headers: [],
    stderr: new RegExp(REFUSAL),
  },
];

const AWKS = awkDirs();

test('bash, jq and an awk are available — this suite may not pass by skipping', () => {
  for (const name of ['bash', 'jq']) assert.ok(which(name), `${name} is missing: the Step 8 block read cannot be executed`);
  assert.ok(AWKS.length > 0, 'no awk on PATH: the Step 8 block read cannot be executed');
});

test('SKILL.md ships exactly one Step 8 block read', () => {
  extractBlock();
});

for (const testCase of CASES) {
  test(`block read: ${testCase.name}`, () => {
    assert.ok(AWKS.length > 0, 'no awk to run under');
    for (const awk of AWKS) {
      const res = runBlock(testCase.reviews, awk);
      const where = `[awk=${awk.real}]\nstdout:\n${res.stdout}\nstderr:\n${res.stderr}`;
      assert.equal(res.status, testCase.status, `exit status ${where}`);
      assert.deepEqual(res.headers, testCase.headers, `entry headers printed ${where}`);
      for (const text of testCase.present ?? []) assert.ok(res.stdout.includes(text), `${JSON.stringify(text)} missing ${where}`);
      for (const text of testCase.absent ?? []) assert.ok(!res.stdout.includes(text), `${JSON.stringify(text)} printed ${where}`);
      if (testCase.stderr) assert.match(res.stderr, testCase.stderr, `stderr ${where}`);
      else assert.equal(res.stderr, '', `stderr ${where}`);
      if ('exactStdout' in testCase) assert.equal(res.stdout, testCase.exactStdout, `stdout ${where}`);
    }
  });
}
