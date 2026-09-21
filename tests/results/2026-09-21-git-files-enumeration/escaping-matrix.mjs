// Re-derive the #874 round-4 BLOCKING claim independently: is ESCAPING the candidate worse than
// sending it RAW?
//
// The reviewer recommended escaping in round 3 and measured it worse in round 4. A reversal is
// exactly the case where the claim must be re-derived rather than accepted, so this builds its
// own fixtures, uses its own wording, and asks `git status --ignored` for ground truth rather
// than trusting either side.
//
// One fixture per row. No tracked sibling anywhere, so the W1 index-side effect cannot be what
// is being measured here — this isolates the PATTERN side.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ESCAPE = (p) => p.replace(/([\\*?[])/g, '\\$1');

const ROWS = [
  { name: 'x*y.log', pattern: '*.log' },
  { name: 'x*y.log', pattern: 'x?y.log' },
  { name: 'x*y.log', pattern: 'x\\*y.log' },
  { name: 'x*y.log', pattern: 'x[*]y.log' },
  { name: 'a\\b.log', pattern: 'a?b.log' },
  { name: 'a\\b.log', pattern: 'a\\\\b.log' },
  { name: 'q?.sh', pattern: 'q\\?.sh' },
  { name: 'plain.log', pattern: '*.log' },
];

function git(dir, args, input) {
  try {
    const out = execFileSync('git', ['-C', dir, ...args], {
      encoding: 'utf8', input, stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, GIT_CONFIG_NOSYSTEM: '1', HOME: dir, XDG_CONFIG_HOME: join(dir, '.config') },
    });
    return { status: 0, out };
  } catch (error) {
    return { status: error.status, out: String(error.stdout ?? ''), err: String(error.stderr ?? '') };
  }
}

function ask(dir, candidate) {
  const r = git(dir, ['check-ignore', '-z', '--stdin'], `${candidate}\0`);
  if (r.status === 0) return 'IGNORED';
  if (r.status === 1) return 'not-ignored';
  return `exit ${r.status}`;
}

const header = ['candidate', 'pattern', 'git-status', 'RAW', 'ESCAPED'];
const rows = [];

for (const { name, pattern, dir: isDir } of ROWS) {
  const dir = mkdtempSync(join(tmpdir(), 'esc-matrix-'));
  git(dir, ['init', '-q', '-b', 'main', '.']);
  git(dir, ['config', 'user.email', 't@example.invalid']);
  git(dir, ['config', 'user.name', 'fixture']);
  mkdirSync(join(dir, 'tools'), { recursive: true });
  writeFileSync(join(dir, '.gitignore'), `${pattern}\n`);
  if (isDir) {
    mkdirSync(join(dir, 'tools', name), { recursive: true });
    writeFileSync(join(dir, 'tools', name, 'f.txt'), 'x\n');
  } else {
    writeFileSync(join(dir, 'tools', name), 'x\n');
  }
  git(dir, ['add', '-f', '.gitignore']);
  git(dir, ['commit', '-qm', 'init']);

  // `--ignored` alone COLLAPSES a wholly-ignored directory to one `!! tools/` line, which made
  // the first version of this probe report every row as not-ignored — including `plain.log`
  // under `*.log`, which is obviously ignored. A ground-truth column that is wrong for the
  // control row is worth less than no column. `--ignored=matching -uall` lists each path.
  const status = git(dir, ['status', '--porcelain', '--ignored=matching', '-uall']).out;
  const truth = status.split('\n').some((l) => l.startsWith('!!') && l.includes(name.replace(/\\/g, '\\\\')))
    ? 'IGNORED' : 'not-ignored';

  rows.push([
    `tools/${name}`, pattern, truth,
    ask(dir, `tools/${name}`),
    ask(dir, ESCAPE(`tools/${name}`)),
  ]);
  rmSync(dir, { recursive: true, force: true });
}

const widths = header.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)));
const line = (cells) => cells.map((c, i) => c.padEnd(widths[i])).join('  ');
console.log(line(header));
console.log(widths.map((w) => '-'.repeat(w)).join('  '));
let rawWrong = 0;
let escWrong = 0;
for (const r of rows) {
  const flag = r[4] !== r[2] ? '  <-- ESCAPED disagrees with git' : (r[3] !== r[2] ? '  <-- RAW disagrees with git' : '');
  if (r[3] !== r[2]) rawWrong++;
  if (r[4] !== r[2]) escWrong++;
  console.log(line(r) + flag);
}
console.log(`\nagainst git status --ignored: RAW wrong in ${rawWrong}/${rows.length}, ESCAPED wrong in ${escWrong}/${rows.length}`);
console.log('(no tracked sibling in any fixture, so W1 is not what is being measured here)');
