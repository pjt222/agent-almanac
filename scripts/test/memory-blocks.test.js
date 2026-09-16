/**
 * Executable coverage for the two canonical blocks the memory skills ship (#407).
 *
 * Prose in a SKILL.md cannot be tested; a fenced block can. #407 exists because the previous
 * budget "measurement" in `manage-memory` was `wc -l` — a check that measured the wrong quantity
 * and was read as authoritative for months. Replacing it with a better block only moves the
 * problem unless something runs the replacement.
 *
 * Two properties are asserted here and nowhere else in the repo:
 *
 *   1. DRIFT — every copy of a canonical block is byte-identical to the copy in
 *      `verify-memory-integrity`, the designated source of truth. Three hand-maintained copies of
 *      the same code is the shape that drifts silently (CLAUDE.md, "propagate to every call
 *      site"), and a paraphrased copy is invisible to every other gate in this repo.
 *   2. BEHAVIOUR — the blocks are extracted and RUN against fixtures whose correct answer is
 *      known by construction: over the line cap but under the size cap and the reverse, a file
 *      over both, one whose CR characters must survive the read, one carrying astral characters,
 *      and a store with a known orphan and a known dangling link.
 *
 * Fixtures are built with `mkdtempSync`, never a shared fixed path (#493).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SOURCE_OF_TRUTH = 'skills/verify-memory-integrity/SKILL.md';

// Files expected to carry each canonical block. A file listed here that does NOT carry it fails:
// this is the propagation gate, so an absent copy has to be as loud as a divergent one.
const CARRIERS = {
  budget: [SOURCE_OF_TRUTH, 'skills/manage-memory/SKILL.md'],
  reachability: [
    SOURCE_OF_TRUTH,
    'skills/manage-memory/SKILL.md',
    'skills/prune-agent-memory/SKILL.md',
    'skills/repair-broken-references/SKILL.md',
  ],
};

// A block is identified by a marker line inside it. Identifying by fence ORDINAL would break the
// moment a skill gains an unrelated bash block above it — the same brittleness the i18n fence
// gate had to abandon.
const MARKERS = {
  budget: 'units = lambda s: sum(2 if ord(c) > 0xFFFF else 1 for c in s)',
  reachability: 'orphans, dangling = sorted(on_disk - linked), sorted(linked - on_disk)',
};

const read = (rel) => readFileSync(join(REPO, rel), 'utf8');

/** Every ```bash fence body in a markdown file, in document order. */
function bashFences(markdown) {
  const out = [];
  const re = /^```bash\r?\n([\s\S]*?)^```/gm;
  let m;
  while ((m = re.exec(markdown)) !== null) out.push(m[1]);
  return out;
}

function extractBlock(rel, kind) {
  const hits = bashFences(read(rel)).filter((body) => body.includes(MARKERS[kind]));
  assert.ok(
    hits.length > 0,
    `${rel} does not carry the canonical ${kind} block (marker absent). If it was removed on ` +
      `purpose, remove ${rel} from CARRIERS in this test in the same commit.`,
  );
  assert.equal(
    hits.length,
    1,
    `${rel} carries ${hits.length} copies of the ${kind} block; a second copy cannot be kept in sync`,
  );
  return hits[0];
}

/** Run a bash block with its <memory-dir> placeholder substituted for a real path. */
function runBlock(body, dir) {
  const script = body.split('<memory-dir>').join(dir);
  const res = spawnSync('bash', ['-c', script], { encoding: 'utf8' });
  assert.equal(
    res.status,
    0,
    `block exited ${res.status}\n--- stdout ---\n${res.stdout}\n--- stderr ---\n${res.stderr}`,
  );
  return res.stdout;
}

function fixture(files) {
  const dir = mkdtempSync(join(tmpdir(), 'memblocks-'));
  for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content);
  return dir;
}

/** An index of `lines` lines, each padded to about `width` UTF-16 units with `filler`. */
function index(lines, width, filler = 'x') {
  const perChar = filler.codePointAt(0) > 0xffff ? 2 : 1;
  const rows = Array.from({ length: lines }, (_, i) => {
    const head = `entry ${String(i + 1).padStart(4, '0')} `;
    return head + filler.repeat(Math.max(0, Math.floor((width - head.length) / perChar)));
  });
  return `${rows.join('\n')}\n`;
}

test('python3 is available — this suite may not pass by skipping', () => {
  const res = spawnSync('python3', ['--version'], { encoding: 'utf8' });
  assert.equal(res.status, 0, 'python3 missing: the canonical blocks cannot be executed');
});

test('every carrier holds the canonical block byte-for-byte', () => {
  for (const kind of Object.keys(CARRIERS)) {
    // The loop skips SOURCE_OF_TRUTH, so a single-entry list makes the body run zero times and
    // this test passes having compared nothing. That is not hypothetical: extractBlock's own
    // failure message tells the reader to remove a file from CARRIERS when the block is gone on
    // purpose, and following it for the other carrier disarms the drift check while staying green.
    assert.ok(
      CARRIERS[kind].length > 1,
      `CARRIERS.${kind} has no carrier to compare against ${SOURCE_OF_TRUTH}; the byte-identity ` +
        `check would pass by comparing nothing. Removing the last peer means removing this kind.`,
    );
    const canonical = extractBlock(SOURCE_OF_TRUTH, kind);
    for (const rel of CARRIERS[kind]) {
      if (rel === SOURCE_OF_TRUTH) continue;
      assert.equal(
        extractBlock(rel, kind),
        canonical,
        `${rel}'s ${kind} block has drifted from ${SOURCE_OF_TRUTH}. Copy it back byte-for-byte ` +
          `rather than reconciling the two by hand.`,
      );
    }
  }
});

test('budget block: reports the LINE cap when lines bind first', () => {
  // 210 short lines: over 200 lines, ~8k units — nowhere near the size cap.
  const out = runBlock(extractBlock(SOURCE_OF_TRUTH, 'budget'), fixture({ 'MEMORY.md': index(210, 40) }));
  assert.match(out, /binds: lines/, out);
  assert.match(out, /first line dropped: 201/, out);
  assert.match(out, /OVER CAP/, out);
});

test('budget block: reports the SIZE cap when units bind first', () => {
  // 150 lines x 200 units = 30k units: under the line cap, over the size cap.
  const out = runBlock(extractBlock(SOURCE_OF_TRUTH, 'budget'), fixture({ 'MEMORY.md': index(150, 200) }));
  assert.match(out, /binds: size/, out);
  assert.match(out, /OVER CAP/, out);
  assert.doesNotMatch(out, /binds: lines/, out);
});

test('budget block: a file over BOTH caps names the one that bites first', () => {
  // 300 lines x 100 units: the line cap bites at 201, the size cap not until ~248. A checker that
  // tests the size cap in a loop and the line cap only in its else-branch reports this file as
  // size-bound — the control-flow bug found in the wild while #407 was open.
  const out = runBlock(extractBlock(SOURCE_OF_TRUTH, 'budget'), fixture({ 'MEMORY.md': index(300, 100) }));
  assert.match(out, /binds: lines/, out);
  assert.match(out, /first line dropped: 201/, out);
});

// The seven fixtures probed against the running harness in
// tests/results/2026-08-23-memory-cap-truncation-probe/, rebuilt here with the same generator
// semantics: `width` is CODE POINTS, lines are joined by `eol`, and there is NO trailing eol.
//
// `lastVisible` is what the model reported it could see on Claude Code 2.1.237, 2.1.238 and
// 2.1.241 (two runs per cell, no disagreement). Truncation is whole-line, so the block's "first
// line dropped" is lastVisible + 1.
const PROBED_ARMS = [
  { name: 'ascii', filler: 'x', width: 126, lines: 200, eol: '\n', lastVisible: 196, binds: 'size' },
  { name: 'cjk', filler: '中', width: 126, lines: 200, eol: '\n', lastVisible: 196, binds: 'size' },
  { name: 'astral', filler: '\u{1F600}', width: 126, lines: 200, eol: '\n', lastVisible: 103, binds: 'size' },
  { name: 'ascii200', filler: 'x', width: 200, lines: 200, eol: '\n', lastVisible: 124, binds: 'size' },
  { name: 'wide2000', filler: 'x', width: 2000, lines: 200, eol: '\n', lastVisible: 12, binds: 'size' },
  { name: 'lines300', filler: 'x', width: 20, lines: 300, eol: '\n', lastVisible: 200, binds: 'lines' },
  { name: 'crlf', filler: 'x', width: 126, lines: 200, eol: '\r\n', lastVisible: 195, binds: 'size' },
];

function buildArm({ filler, width, lines, eol }) {
  const CANARY_WIDTH = 11; // "CANARY-000 "
  return Array.from(
    { length: lines },
    (_, i) => `CANARY-${String(i + 1).padStart(3, '0')} ${filler.repeat(width - CANARY_WIDTH)}`,
  ).join(eol);
}

for (const arm of PROBED_ARMS) {
  test(`budget block: predicts the cut measured on the harness — ${arm.name}`, () => {
    const out = runBlock(
      extractBlock(SOURCE_OF_TRUTH, 'budget'),
      fixture({ 'MEMORY.md': buildArm(arm) }),
    );
    assert.match(out, new RegExp(`first line dropped: ${arm.lastVisible + 1}\\b`), out);
    assert.match(out, new RegExp(`binds: ${arm.binds}`), out);
  });
}

// ── #713: pin the JS arm builder to the bytes that were actually probed ──────────
//
// `PROBED_ARMS.lastVisible` is what a running harness reported, measured on fixtures emitted by
// `tests/results/2026-08-23-memory-cap-truncation-probe/memcap-fixture.py`. `buildArm()` above
// re-implements that generator in JavaScript, and only the Python one was ever sha256-checked
// against the probed bytes. If the two drift — a padding change, a canary-width change, a
// trailing-newline change — this suite pins the shipped block against bytes nobody probed while
// its comments claim the opposite. Nothing detected that.
//
// Settle any disagreement by regenerating, never by editing a digest to match:
//
//   python3 tests/results/2026-08-23-memory-cap-truncation-probe/memcap-fixture.py \
//     /tmp/x --emit-only /tmp/arms
//   sha256sum /tmp/arms/*/MEMORY.md
//
// `--emit-only` is what keeps that safe to run: without it the generator writes into
// ~/.claude/projects/<slug>/memory/, where the fixtures are indistinguishable from a real memory
// store to anything walking that directory.
//
// These digests are that command's output, taken from the GENERATOR rather than from
// buildArm(). That provenance is worth less than it sounds and the first version of this
// comment overstated it: buildArm-derived digests would still catch any FUTURE drift, so
// what generator-provenance actually buys is the one-time cross-check that the two agreed
// on the day the table was written. The second test is what keeps the pair honest from
// then on, and it would have caught even that initial disagreement on its first CI run.
const PROBED_ARM_SHA256 = {
  ascii: 'c3eacdf3f56db5a223fd2e3d4823ebaf12c414c9adab7c9d334bafc764913249',
  cjk: 'e86eab8563e6ffd628cb8a629470db48c7132d3ddfc3eb5c3c75212e7b2ece20',
  astral: '09e6953a1834246cb56835a9b3d1b60c8036e97a36dd7cd402e95600b19d30b8',
  ascii200: '863d29619aa6f8b6a7e5fd3b1586ffacb1d39cc6c478cc6658fa1c28421bb1da',
  wide2000: 'ad21234260db8fcff07542f4a1fc382b21608f48acc917c6b90aa19c050eda24',
  lines300: 'a448e0baa4877374e216de800801771629fd2b1d0d1cdc9a64fd3608945266d8',
  crlf: 'f989efad4c3f45148c7d50d248c75e1cc99f779fb0f71031ac3ce990cbd97841',
};

test('fixture builder: every JS arm reproduces the probed bytes exactly', () => {
  // The set check runs FIRST, deliberately. node:test stops at the first failed assertion, so
  // with the loop first a newly added arm hit `PROBED_ARM_SHA256[name] === undefined` and was
  // reported as DRIFT — a message ending "do not edit the digest", which is the exact opposite
  // of what someone adding an arm must do. Ordering it this way makes the legible message the
  // reachable one, and the "both directions" claim true rather than half-true.
  assert.deepEqual(
    PROBED_ARMS.map((arm) => arm.name).sort(),
    Object.keys(PROBED_ARM_SHA256).sort(),
    'the arm list and the digest table have diverged. Adding an arm means running the ' +
    'generator (see the command above) and pasting ITS digest here — and probing the new arm ' +
    'against a live harness before giving it a lastVisible, since that number is a measurement, ' +
    'not a prediction.',
  );

  // The generator writes BYTES (`open(target, "wb")`) precisely so the crlf arm keeps its CR, so
  // the comparison is over utf-8 bytes rather than over a decoded string.
  for (const arm of PROBED_ARMS) {
    const digest = createHash('sha256').update(Buffer.from(buildArm(arm), 'utf8')).digest('hex');
    assert.equal(
      digest, PROBED_ARM_SHA256[arm.name],
      `arm '${arm.name}': buildArm() no longer emits the bytes that were probed. The lastVisible ` +
      'value for this arm was measured against the generator\'s output, so it now predicts a cut ' +
      'in a file that was never probed. Regenerate and compare — do not edit the digest.',
    );
  }
});

// Whether python3 exists is decided once, at load, because node:test evaluates `skip` when the
// test is declared. A `false` skip value means "do not skip".
const PYTHON3 = (() => {
  const probe = spawnSync('python3', ['--version'], { encoding: 'utf8' });
  return probe.status === 0 ? 'python3' : null;
})();

test('fixture builder: the Python generator still emits those same bytes', {
  // Honest skip rather than a silent pass. The digests above keep the JS side covered on any
  // machine; this test is what covers the OTHER direction — a change to the generator itself.
  //
  // In a GREEN run this skip is unreachable: `python3 is available` above hard-fails without it,
  // so the suite cannot pass by skipping. The skip therefore exists for legibility if that
  // availability test is ever relaxed — and if it is, note that `pretest:scripts` guards an empty
  // DISCOVERY, not a permanent skip, so generator-direction coverage would vanish quietly.
  skip: PYTHON3 === null && 'python3 not on PATH; the JS-side digest test still runs',
}, () => {
  const out = mkdtempSync(join(tmpdir(), 'memcap-arms-'));
  const generator = join(REPO, 'tests/results/2026-08-23-memory-cap-truncation-probe/memcap-fixture.py');

  // argv[1] is a disposable project root the generator only uses when NOT emitting; passing
  // --emit-only keeps it out of ~/.claude/projects.
  //
  // HOME is redirected as well, and that is the control rather than the flag. Without it the
  // test's safety rests entirely on `sys.argv[2] == "--emit-only"` staying true forever: a future
  // generator CLI change that inserts a positional or moves to argparse would make that predicate
  // false while still exiting 0, and every `npm run test:scripts` would then write real fixture
  // stores into the developer's ~/.claude/projects/<slug>/memory/ — indistinguishable from a real
  // memory store to anything walking that directory, and the assertions below would only go red
  // AFTER the side effect. pathlib.Path.home() honours $HOME on POSIX, so the blast radius is the
  // temp directory either way.
  const run = spawnSync(PYTHON3, [generator, join(out, 'unused-root'), '--emit-only', out], {
    encoding: 'utf8',
    env: { ...process.env, HOME: out, USERPROFILE: out },
  });
  assert.equal(run.status, 0, `generator failed: ${run.stderr || run.stdout}`);

  // Both directions over the emitted SET, not just a lookup per known arm. Iterating PROBED_ARMS
  // alone makes a rename or a parameter change red, but leaves a pure addition to the Python
  // ARMS table emitting a file nothing ever reads — and arm-set drift between the two builders is
  // the whole subject of #713.
  assert.deepEqual(
    readdirSync(out).filter((entry) => entry !== 'unused-root').sort(),
    PROBED_ARMS.map((arm) => arm.name).sort(),
    `the generator emitted a different set of arms than PROBED_ARMS lists.\n${run.stdout}`,
  );

  for (const arm of PROBED_ARMS) {
    const emitted = readFileSync(join(out, arm.name, 'MEMORY.md'));
    assert.equal(
      createHash('sha256').update(emitted).digest('hex'), PROBED_ARM_SHA256[arm.name],
      `arm '${arm.name}': the Python generator no longer emits the bytes recorded in ` +
      `PROBED_ARM_SHA256, so the probed measurements no longer describe what it builds.\n` +
      `Generator's own count table:\n${run.stdout}`,
    );
  }
});

test('budget block: frontmatter and block comments are excluded from the measurement', () => {
  // Documented: "Only the content that loads counts toward the limits. YAML frontmatter and
  // block-level HTML comments are stripped before the index is loaded, so they're excluded from
  // the measurement." A block that measures the raw file over-reports — the same over-report
  // class that made the `max(len(raw), chars)` hedge wrong, arriving from a different direction.
  const body = ['# Project Memory', '', '- [a.md](a.md) — one', '- [b.md](b.md) — two', ''].join('\n');
  const decorated =
    ['---', 'type: index', 'modified: 2026-08-23T00:00:00Z', '---', ''].join('\n') +
    ['<!--', 'a maintainer note that the loader strips', '-->', ''].join('\n') +
    body;

  const plain = runBlock(extractBlock(SOURCE_OF_TRUTH, 'budget'), fixture({ 'MEMORY.md': body }));
  const withExtras = runBlock(extractBlock(SOURCE_OF_TRUTH, 'budget'), fixture({ 'MEMORY.md': decorated }));

  const size = (out) => Number(/size (\d+)\/25000/.exec(out)[1]);
  const lines = (out) => Number(/lines (\d+)\/200/.exec(out)[1]);
  assert.equal(size(withExtras), size(plain), `frontmatter/comments counted:\n${withExtras}`);
  assert.equal(lines(withExtras), lines(plain), `frontmatter/comment lines counted:\n${withExtras}`);
  assert.match(withExtras, /not loaded, so not counted: [1-9]\d* unit/, withExtras);
  // and the plain file must report nothing excluded, or the rule is subtracting phantom content
  assert.match(plain, /not loaded, so not counted: 0 unit/, plain);
});

test('budget block: a comment inside a fenced block is counted, one outside is not', () => {
  // Measured on Claude Code 2.1.241 (`claude -p`, tools disabled), three arms of 150 canary lines
  // at 201 units each, sized so the line cap can never bind: an unfenced block comment is stripped
  // and excluded (cut unchanged at canary 124), while the same bytes inside a ```text fence are
  // preserved and counted (cut moves to canary 109). The first version of this block stripped
  // both, which under-reports — it hides a truncation that is already happening.
  const canaries = Array.from(
    { length: 150 },
    (_, i) => `CANARY-${String(i + 1).padStart(3, '0')} ${'x'.repeat(189)}`,
  );
  const comment = ['<!--', ...Array.from({ length: 15 }, () => 'm'.repeat(200)), '-->'];
  const run = (lines) =>
    runBlock(extractBlock(SOURCE_OF_TRUTH, 'budget'), fixture({ 'MEMORY.md': lines.join('\n') }));
  const dropped = (out) => Number(/first line dropped: (\d+)/.exec(out)[1]);

  const ctrl = run(canaries);
  const bare = run([...comment, ...canaries]);
  const fenced = run(['```text', ...comment, '```', ...canaries]);

  assert.equal(dropped(ctrl), 125, ctrl);
  assert.equal(dropped(bare), 125, `an unfenced comment was counted:\n${bare}`);
  // 19 comment and fence lines precede the canaries, so raw line 129 is canary 109.
  assert.equal(dropped(fenced), 129, `a fenced comment was stripped:\n${fenced}`);
});

test('budget block: CR characters survive the read', () => {
  // Python text mode deletes CR before anything counts it, silently shrinking the string the
  // loader actually measures. 200 CRs is 200 units — enough to move a file across a threshold.
  const crlf = index(120, 200).split('\n').join('\r\n');
  const out = runBlock(extractBlock(SOURCE_OF_TRUTH, 'budget'), fixture({ 'MEMORY.md': crlf }));
  const units = Number(/size (\d+)\/25000/.exec(out)[1]);
  assert.equal(units, Buffer.byteLength(crlf, 'utf8'), `CR dropped before counting:\n${out}`);
});

test('budget block: astral characters cost two units each', () => {
  const astral = index(10, 100, '\u{1F600}');
  const out = runBlock(extractBlock(SOURCE_OF_TRUTH, 'budget'), fixture({ 'MEMORY.md': astral }));
  const units = Number(/size (\d+)\/25000/.exec(out)[1]);
  assert.ok(
    units > [...astral].length,
    `astral characters counted as one unit each (units ${units}):\n${out}`,
  );
  assert.match(out, /astral chars \d+/, out);
});

test('reachability block: finds a known orphan and a known dangling link', () => {
  const dir = fixture({
    'MEMORY.md': [
      '# Project Memory',
      '',
      '- [kept.md](kept.md) — linked and present',
      '- [gone.md](gone.md) — linked and absent',
      '- [file.md](file.md) — the format example, must not report as dangling',
      '<!-- - [hidden.md](hidden.md) — a comment is stripped before load -->',
      '',
    ].join('\n'),
    'kept.md': '# kept\n',
    'hidden.md': '# referenced only from inside an HTML comment\n',
    'orphan.md': '# nothing links here\n',
  });
  const out = runBlock(extractBlock(SOURCE_OF_TRUTH, 'reachability'), dir);
  assert.match(out, /orphan\s+orphan\.md/, out);
  // A link inside an HTML comment does not make its target reachable: comments are stripped
  // before the index reaches the model, so the note is written into a void.
  assert.match(out, /orphan\s+hidden\.md/, out);
  assert.match(out, /dangling gone\.md/, out);
  // The format-documentation target must be excluded, or the check cries wolf forever.
  assert.doesNotMatch(out, /dangling file\.md/, out);
  assert.match(out, /ORPHANS\s+2\b/, out);
});

test('reachability block: reports file share and byte share separately', () => {
  const dir = fixture({
    'MEMORY.md': '# Project Memory\n\n- [small.md](small.md) — linked\n',
    'small.md': 'x\n',
    'big.md': `${'x'.repeat(4096)}\n`,
  });
  const out = runBlock(extractBlock(SOURCE_OF_TRUTH, 'reachability'), dir);
  const m = /ORPHANS\s+1 = ([\d.]+)% of files, ([\d.]+)% of bytes/.exec(out);
  assert.ok(m, `both denominators must be printed and labelled:\n${out}`);
  assert.notEqual(m[1], m[2], `file share and byte share collapsed into one number:\n${out}`);
});

test('no carrier reverts to a bare wc -l budget check', () => {
  for (const rel of new Set([...CARRIERS.budget, ...CARRIERS.reachability])) {
    assert.doesNotMatch(
      read(rel),
      /wc -l\s+\S*MEMORY\.md/,
      `${rel} measures the index with wc -l, the line-only check #407 removed`,
    );
  }
});

// #734 finding 1: the fence rule and the comment rule collided. Testing `startswith('```')`
// FIRST let a fence delimiter inside an open block comment toggle `fence`, which carried `cmt`
// across the fenced region; when the fence closed, the still-set `cmt` resumed stripping real
// index lines until a later `-->` — which may never come. The estimator then UNDER-reports, the
// direction that hides a truncation already happening.
//
// The fixture puts the comment's `-->` inside the fenced region, which is what leaves `cmt` set.
// Ordinal counts, not prose: the repaired block keeps 12 lines, the colliding one keeps 5.
test('budget block: a comment containing a fence does not strip the index after it', () => {
  const omegas = Array.from({ length: 10 }, (_, i) => `- [omega${i}](omega${i}.md) — real entry`);
  const dir = fixture({
    'MEMORY.md': [
      '- [alpha](alpha.md) — real entry',
      '<!--',
      '```yaml',
      'x: 1',
      '-->',
      '```',
      ...omegas,
      '',
    ].join('\n'),
  });
  const out = runBlock(extractBlock(SOURCE_OF_TRUTH, 'budget'), dir);
  const m = /lines (\d+)\/200/.exec(out);
  assert.ok(m, `the budget block must report a line count:\n${out}`);
  assert.equal(
    Number(m[1]),
    12,
    'the ten index entries after the commented-out fence were dropped: the comment rule must ' +
      `win over the fence rule, or the estimator under-reports.\n${out}`,
  );
});
